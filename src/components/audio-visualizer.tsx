"use client";
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import * as THREE from "three";
import { renderFuncs } from "./render";
import { AudioVisualizerProps, AudioVisualizerRef, ThreeJS } from "./types";

// Generator for unique IDs
function* idGenerator() {
    let id = 0;
    while (true) {
        yield ++id;
    }
}
const idGen = idGenerator();
const getNewId = () => idGen.next().value as number;

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
    // Only create AudioContext if we're in the browser
    if (typeof window === "undefined") return null;

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

const AudioVisualizer = forwardRef(function AudioVisualizer(
    props: Omit<AudioVisualizerProps, "src">,
    ref: React.Ref<AudioVisualizerRef>
) {
    const [audioContext, setAudioContext] =
        useState<ReturnType<typeof setupAudioContext>>(null);
    const trackRef = useRef<MediaElementAudioSourceNode | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const threeRef = useRef<ThreeJS | null>(null);
    const configRef = useRef(props.config);

    useEffect(() => {
        // Initialize AudioContext only on the client side
        setAudioContext(setupAudioContext());
    }, []);

    useEffect(() => {
        configRef.current = props.config;
    }, [props.config]);

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

    useEffect(() => {
        if (!audioContext || !props.audioRef?.current) return;

        const audioElement = props.audioRef.current as HTMLAudioElement;

        const setupAudioTrack = async () => {
            // Ensure audio context is in a valid state
            if (audioContext.audioContext.state === "suspended") {
                await audioContext.audioContext.resume();
            }

            // Check if the audio element is already connected
            try {
                if (!trackRef.current) {
                    trackRef.current =
                        audioContext.audioContext.createMediaElementSource(
                            audioElement
                        );
                    trackRef.current?.connect(audioContext.analyser);
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
    }, [props.audioRef, audioContext]);

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
        const { camera, renderer, scene } = threeRef.current!;
        const container = containerRef.current!;

        // Debounced resize handler
        const debounce = (fn: (...args: unknown[]) => void, delay: number) => {
            let timeout: NodeJS.Timeout;
            return (...args: unknown[]) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => fn(...args), delay);
            };
        };

        const handleResize = debounce(() => {
            if (!container) return;

            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;

            // Update camera properties
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();

            // Update renderer properties
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(newWidth, newHeight);

            // Optionally re-render the scene
            renderer.render(scene, camera);
        }, 100); // Debounce interval

        // Create a ResizeObserver to observe changes in container size
        const resizeObserver = new ResizeObserver(() => {
            handleResize();
        });

        // Start observing the container
        resizeObserver.observe(container);

        // Cleanup the observer on unmount
        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!audioContext) return;

        const { scene, camera, renderer } = threeRef.current!;
        const animate = () => {
            const config = configRef.current;
            if (props.delayPerFrame) {
                setTimeout(() => {
                    requestAnimationFrame(animate);
                }, props.delayPerFrame);
            } else {
                requestAnimationFrame(animate);
            }

            config.forEach((layer) => {
                if ("domainType" in layer.settings) {
                    if (layer.settings.domainType === "time") {
                        audioContext.analyser.getByteTimeDomainData(
                            audioContext.dataArray
                        );
                    } else {
                        audioContext.analyser.getByteFrequencyData(
                            audioContext.dataArray
                        );
                    }
                }
                if (!layer.id) {
                    layer.id = getNewId();
                }
                renderFuncs[layer.preset](
                    // @ts-expect-error - TS doesn't know that the preset is valid
                    layer.settings,
                    { scene, camera, renderer },
                    audioContext.dataArray,
                    `layer-${layer.id}`
                );
            });

            renderer.render(scene, camera);
        };

        animate();
    }, [props.delayPerFrame, audioContext]);

    return (
        <div
            ref={containerRef}
            style={props.style}
            className={props.className}
        ></div>
    );
});

export { AudioVisualizerWrapper as AudioVisualizer };
