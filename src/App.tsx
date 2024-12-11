import { useRef } from "react";
import { AudioVisualizerRef, AudioVisualizer } from "./components";
import React from "react";

function App() {
    const visRef = useRef<AudioVisualizerRef>(null);

    const handleChangeProgress = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const audioElement = visRef.current?.getAudioElement();
        if (audioElement) {
            audioElement.currentTime =
                (audioElement.duration / 100) * parseInt(value);
        }
    };

    return (
        <>
            <button onClick={() => visRef.current?.play()}>Play</button>
            <button onClick={() => visRef.current?.pause()}>Pause</button>
            <input
                type="range"
                min="0"
                max="100"
                defaultValue={0}
                style={{
                    marginBottom: "20px",
                }}
                onChange={handleChangeProgress}
            />
            <AudioVisualizer
                style={{
                    marginLeft: "25vw",
                    width: "50vw",
                    height: "600px",
                }}
                ref={visRef}
                src="/audio.mp3"
                backgroundColor={"darkred"}
                config={{
                    layers: [
                        {
                            preset: "Waveform",
                            settings: {
                                color: "#ff0000",
                                lineWidth: 2,
                                amplitude: 10,
                                period: 0.5,
                                invert: true,
                            },
                        },
                        {
                            preset: "LineWaveform",
                            settings: {
                                color: "white",
                                lineWidth: 1,
                                amplitude: 10,
                                y: -0.4,
                            },
                        },
                        {
                            preset: "Light",
                            settings: {
                                type: "directional",
                                color: "white",
                                intensity: 5,
                                position: [0, 0, 1],
                            },
                        },
                    ],
                }}
            />
        </>
    );
}

export default App;
