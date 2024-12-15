import { useRef } from "react";
import {
    AudioVisualizerRef,
    AudioVisualizer,
    defaultValues,
    Preset,
    Config,
} from "./components";
import React from "react";

const defaultConfig: Config = [
    {
        preset: "waveform",
        settings: {
            color: "white",
            domainType: "time",
            amplitude: 90,
            resolution: 0.3,
            circle: true,
            radius: 3,
        },
    },
    {
        preset: "text",
        settings: {
            text: "Hello World",
            domainType: "frequency",
            font: "helvetiker",
            color: "pink",
            amplitude: 1,
            rotationXAmplitude: 1,
        },
    },
    {
        preset: "light",
        settings: {
            type: "point",
            color: "white",
            intensity: 10,
            position: [0, 0, 2],
        },
    },
];

function App() {
    const visRef = useRef<AudioVisualizerRef>(null);
    const [config, setConfig] = React.useState<Config>(defaultConfig);

    const handleChangeProgress = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const audioElement = visRef.current?.getAudioElement();
        if (audioElement) {
            audioElement.currentTime =
                (audioElement.duration / 100) * parseInt(value);
        }
    };

    const handleChange =
        (preset: string, setting: string) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            let value: string | number | symbol = e.target.value;
            value = isNaN(parseFloat(value)) ? value : parseFloat(value);
            setConfig((prev) => {
                return prev.map((layer) => {
                    if (layer.preset === preset) {
                        return {
                            ...layer,
                            settings: {
                                ...layer.settings,
                                [setting]: value,
                            },
                        };
                    }
                    return layer;
                });
            });
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
            <div style={{ display: "flex" }}>
                {config.map((conf, index) => {
                    const presetKey = conf.preset;
                    const settings = defaultValues[presetKey as Preset];
                    return (
                        <div key={conf + String(index)}>
                            <div>
                                <h3>{presetKey}</h3>
                                {Object.entries(settings).map(
                                    ([settingKey, settingsValue], i) => {
                                        return (
                                            <div key={settingKey + String(i)}>
                                                <span>{settingKey}:</span>
                                                <input
                                                    type="text"
                                                    onChange={handleChange(
                                                        presetKey,
                                                        settingKey
                                                    )}
                                                    value={
                                                        config.find(
                                                            (layer) =>
                                                                layer.preset ===
                                                                presetKey
                                                        )?.settings[
                                                            settingKey
                                                        ] ?? settingsValue
                                                    }
                                                />
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <AudioVisualizer
                style={{
                    marginLeft: "25vw",
                    width: "50vw",
                    height: "600px",
                }}
                ref={visRef}
                src="/audio.mp3"
                backgroundColor="cornflowerblue"
                config={config}
            />
        </>
    );
}

export default App;
