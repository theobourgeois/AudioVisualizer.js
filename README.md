# audio-visualizer.js

`audio-visualizer.js` is a lightweight and customizable JavaScript library for creating stunning audio visualizations using [Three.js](https://threejs.org/). Whether you need 2D shapes, 3D objects, waveform displays, or dynamic lighting, `audio-visualizer.js` provides flexible options to bring your audio to life.

## Features

- **Multiple Visualization Presets**: Choose from 2D shapes, 3D shapes, waveforms, line waveforms, and dynamic lighting.
- **Three.js Integration**: Harness the power of Three.js for high-performance 3D rendering.
- **Customizable Layers**: Stack multiple visualization layers with independent settings.
- **React Support**: Built with React compatibility for seamless UI integration.
- **Easy to Use**: Simple configuration and extensive customization options.

## Installation

Install via npm:

```bash
npm install audio-visualizer.js
```

## Usage

### Basic Example

```tsx
import React, { useRef } from "react";
import { AudioVisualizer } from "audio-visualizer.js";

const App = () => {
  const audioRef = useRef(null);

  const config = {
    layers: [
      {
        preset: "Shape3D",
        settings: {
          shape: "sphere",
          color: "#ff0000",
          amplitude: 5,
          size: 2,
        },
      },
      {
        preset: "Waveform",
        settings: {
          color: "#00ff00",
          amplitude: 3,
          period: 1,
          lineWidth: 2,
        },
      },
    ],
  };

  return (
    <div>
      <audio ref={audioRef} src="path/to/audio.mp3" controls />
      <AudioVisualizer audioRef={audioRef} config={config} backgroundColor="#000" />
    </div>
  );
};

export default App;
```

### Available Props

#### `AudioVisualizerProps`
| Prop              | Type                          | Description                                        |
|-------------------|-------------------------------|----------------------------------------------------|
| `audioRef`        | `React.RefObject<HTMLAudioElement>` | Reference to the audio element.                   |
| `src`             | `string`                     | URL of the audio source.                          |
| `style`           | `React.CSSProperties`        | Inline styles for the container.                  |
| `className`       | `string`                     | Custom CSS class name.                            |
| `config`          | `Config`                     | Configuration object for visualizer layers.        |
| `backgroundColor` | `string`                     | Background color of the visualization canvas.      |

## Configuration

The `config` prop defines the visualizer layers. Each layer includes a `preset` and its specific `settings`.

### Presets and Settings

#### **Shape2D**
| Setting            | Type     | Description                        |
|--------------------|----------|------------------------------------|
| `shape`            | `"circle" \| "square" \| "triangle"` | Shape of the 2D object.             |
| `color`            | `string` | Color of the shape.                |
| `speed`            | `number` | Animation speed.                   |
| `size`             | `number` | Size of the shape.                 |

#### **Shape3D**
| Setting             | Type                | Description                       |
|---------------------|---------------------|-----------------------------------|
| `shape`             | `"cube" \| "sphere" \| "torus" \| "dodecahedron" \| "icosahedron"` | 3D shape type.       |
| `color`             | `string`           | Color of the shape.               |
| `rotationXAmplitude`| `number`           | Amplitude of rotation on X-axis.  |
| `rotationYAmplitude`| `number`           | Amplitude of rotation on Y-axis.  |
| `rotationZAmplitude`| `number`           | Amplitude of rotation on Z-axis.  |

#### **Waveform**
| Setting      | Type     | Description                        |
|--------------|----------|------------------------------------|
| `color`      | `string` | Color of the waveform.             |
| `amplitude`  | `number` | Waveform amplitude.                |
| `period`     | `number` | Waveform period.                   |
| `lineWidth`  | `number` | Thickness of the waveform line.    |

#### **Light**
| Setting     | Type                                     | Description                          |
|-------------|------------------------------------------|--------------------------------------|
| `color`     | `string`                                | Light color.                         |
| `type`      | `"ambient" \| "directional" \| "point" \| "spot"` | Type of light.                      |
| `intensity` | `number`                                | Light intensity.                     |
| `position`  | `[number, number, number]`              | Position of the light in 3D space.   |

For the full list of options, refer to the `audio-visualizer.js` type definitions.

## API Reference

### `AudioVisualizerRef`

| Method           | Description                                    |
|------------------|------------------------------------------------|
| `play`           | Plays the audio.                              |
| `pause`          | Pauses the audio.                             |
| `getAudioElement`| Returns the audio element instance.            |

## Default Values

Each preset has default settings. You can customize these settings as needed in the `config` prop.

## License

MIT

## Contributions

Contributions are welcome! Feel free to submit issues or pull requests on the [GitHub repository](https://github.com/your-repo/audio-visualizer.js).

## Acknowledgments

Built with [Three.js](https://threejs.org/) and inspired by FLStudio's audio visualizer.

