import React, { useRef } from "react";
import { AudioVisualizer } from "audio-visualizer.js";

const config = [
  {
    preset: "waveform",
    settings: {
      color: "rgb(79,70,229)",
      amplitude: 10,
      y: -3.8,
      domainType: "frequency",
    },
  },
  {
    preset: "waveform",
    settings: {
      color: "rgb(79,70,229)",
      amplitude: 10,
      y: 3.8,
      domainType: "frequency",
      invert: true,
    },
  },
  {
    preset: "waveform",
    settings: {
      color: "rgb(79,70,229)",
      amplitude: 100,
      domainType: "time",
      circle: true,
    },
  },
  {
    preset: "text",
    settings: {
      text: "audio-visualizer.js",
      color: "rgb(79,70,229)",
      font: "helvetiker",
      rotationYAmplitude: 10,
      rotationXAmplitude: 1,
      amplitude: 0.1,
      size: 1,
      domainType: "frequency",
    },
  },
  {
    preset: "light",
    settings: {
      color: "#4C51BF",
      intensity: 0.5,
    },
  },
];

export default function App() {
  const audioRef = useRef(null);

  return (
    <div>
      <audio ref={audioRef} src="path/to/audio.mp3" />
      {/* using audio ref */}
      <AudioVisualizer audioRef={audioRef} config={config} backgroundColor="#000" />

      {/* using audio src */}
      <AudioVisualizer src="path/to/audio.mp3" config={config} backgroundColor="#000" />
    </div>
  );
};