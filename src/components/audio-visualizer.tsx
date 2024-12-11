import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { renderFuncs } from "./render";
import { AudioVisualizerProps, AudioVisualizerRef } from "./types";

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

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const track = audioContext.createMediaElementSource(
            props.audioRef?.current as HTMLAudioElement
        );
        track.connect(analyser);
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

        const handleResize = () => {
            const newWidth = containerRef.current!.clientWidth;
            const newHeight = containerRef.current!.clientHeight;
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        };

        window.addEventListener("resize", handleResize);

        const animate = () => {
            requestAnimationFrame(animate);
            analyser.getByteFrequencyData(dataArray);
            for (let i = 0; i < props.config.layers.length; i++) {
                const layer = props.config.layers[i];
                renderFuncs[layer.preset](
                    // @ts-expect-error this is fine...
                    layer.settings,
                    { scene, camera, renderer },
                    dataArray,
                    `layer-${i}`
                );
            }
            renderer.render(scene, camera);
        };

        animate();

        return () => {
            window.removeEventListener("resize", handleResize);
            scene.children.forEach((child) => scene.remove(child));
            track.disconnect();
            renderer.dispose();
        };
    }, [props.config.layers, props.audioRef, props.backgroundColor]);

    return (
        <div
            ref={containerRef}
            style={props.style}
            className={props.className}
        ></div>
    );
});

export { AudioVisualizerWrapper as AudioVisualizer };
