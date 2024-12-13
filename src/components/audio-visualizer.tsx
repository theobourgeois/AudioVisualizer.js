import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { renderFuncs } from "./render";
import { AudioVisualizerProps, AudioVisualizerRef, ThreeJS } from "./types";

const AudioVisualizerWrapper = forwardRef(function AudioVisualizerWrapper(
    props: AudioVisualizerProps,
    ref: React.Ref<AudioVisualizerRef>
) {
    if (props.audioRef === undefined && props.src === undefined) {
        throw new Error("audioRef or src must be provided");
    }

    if (props.audioRef !== undefined && props.src !== undefined) {
        throw new Error("audioRef and src cannot be provided at the same time");
    }

    if (props.config.layers.length === 0) {
        throw new Error("config must contain at least one layer");
    }

    if (props.src !== undefined) {
        return <AudioVisualizerWithSrc ref={ref} {...props} />;
    }

    return <AudioVisualizer ref={ref} {...props} />;
});

const AudioVisualizerWithSrc = forwardRef(function AudioVisualizerWithSrc(
    props: Omit<AudioVisualizerProps, "audioRef">,
    ref: React.Ref<AudioVisualizerRef>
) {
    const audioRef = useRef<HTMLAudioElement>(null);

    return (
        <>
            <AudioVisualizer {...props} ref={ref} audioRef={audioRef} />
            <audio ref={audioRef} src={props.src} />
        </>
    );
});

function setupAudioContext() {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.connect(audioContext.destination);

    return {
        analyser,
        dataArray,
        audioContext,
    };
}

const { analyser, dataArray, audioContext } = setupAudioContext();

const AudioVisualizer = forwardRef(function AudioVisualizer(
    props: Omit<AudioVisualizerProps, "src">,
    ref: React.Ref<AudioVisualizerRef>
) {
    useImperativeHandle(
        ref,
        () => ({
            play: () => {
                if (props.audioRef?.current) {
                    props.audioRef.current.play();
                }
            },
            pause: () => {
                if (props.audioRef?.current) {
                    props.audioRef.current.pause();
                }
            },
            getAudioElement: () => props.audioRef?.current,
        }),
        [props.audioRef]
    );
    const trackRef = useRef<MediaElementAudioSourceNode | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const threeRef = useRef<ThreeJS | null>(null);

    useEffect(() => {
        if (threeRef.current) return;
        const width = containerRef.current!.clientWidth;
        const height = containerRef.current!.clientHeight;

        const camera = new THREE.PerspectiveCamera(
            75,
            width / height,
            0.1,
            1000
        );
        camera.position.z = 5;

        const scene = new THREE.Scene();
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        containerRef.current?.appendChild(renderer.domElement);
        renderer.setClearColor(
            new THREE.Color(props.backgroundColor || "#000000")
        );

        threeRef.current = { camera, scene, renderer };
    }, [props.backgroundColor]);

    useEffect(() => {
        if (!props.audioRef?.current) return;

        const audioElement = props.audioRef.current as HTMLAudioElement;

        const setupAudioTrack = async () => {
            // Ensure audio context is in a valid state
            if (audioContext.state === "suspended") {
                await audioContext.resume();
            }

            // Check if the audio element is already connected
            try {
                if (!trackRef.current) {
                    trackRef.current =
                        audioContext.createMediaElementSource(audioElement);
                    trackRef.current?.connect(analyser);
                }
            } catch (error) {
                console.error("Error creating media element source:", error);
            }
        };

        audioElement.addEventListener("play", setupAudioTrack);

        return () => {
            audioElement.removeEventListener("play", setupAudioTrack);
            if (trackRef.current) {
                trackRef.current.disconnect();
            }
        };
    }, [props.audioRef]);

    useEffect(() => {
        const { camera, renderer } = threeRef.current!;
        const handleResize = () => {
            const newWidth = containerRef.current!.clientWidth;
            const newHeight = containerRef.current!.clientHeight;
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [threeRef]);

    useEffect(() => {
        const { scene, camera, renderer } = threeRef.current!;
        const animate = () => {
            requestAnimationFrame(animate);
            analyser.getByteFrequencyData(dataArray);

            props.config.layers.forEach((layer, i) => {
                renderFuncs[layer.preset](
                    // @ts-expect-error - TS doesn't know that the preset is valid
                    layer.settings,
                    { scene, camera, renderer },
                    dataArray,
                    `layer-${i}`
                );
            });

            renderer.render(scene, camera);
        };

        animate();
    }, [props.config.layers, threeRef]);

    return (
        <div
            ref={containerRef}
            style={props.style}
            className={props.className}
        ></div>
    );
});

export { AudioVisualizerWrapper as AudioVisualizer };
