import * as THREE from "three";

export type Preset =
  | "Shape2D"
  | "Shape3D"
  | "Light"
  | "Waveform"
  | "LineWaveform";

type PresetBase = object;

export type ShapeBase = PresetBase & {
  color?: string;
  speed?: number;
  opacity?: number;
  amplitude?: number;
  x?: number;
  y?: number;
  z?: number;
  size?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
};

export type Light = {
  color?: string;
  type?: "ambient" | "directional" | "point" | "spot";
  intensity?: number;
  position?: [number, number, number];
};

export type WaveformBase = PresetBase & {
  color?: string;
  opacity?: number;
  amplitude?: number;
  period?: number;
  x?: number;
  y?: number;
  z?: number;
  width?: number;
  height?: number;
  lineWidth?: number;
  invert?: boolean;
};

type Waveform = WaveformBase;
type LineWaveform = WaveformBase;

type Shape2D = ShapeBase & {
  shape?: "circle" | "square" | "triangle";
  rotationAmplitude?: number;
};

type Shape3D = ShapeBase & {
  shape?: "cube" | "sphere" | "torus" | "dodecahedron" | "icosahedron";
  rotationXAmplitude?: number;
  rotationYAmplitude?: number;
  rotationZAmplitude?: number;
};

// Define LayerSettings based on Preset
type LayerSettings<T extends Preset> = T extends "Shape2D"
  ? Shape2D
  : T extends "Shape3D"
  ? Shape3D
  : T extends "Light"
  ? Light
  : T extends "Waveform"
  ? Waveform
  : T extends "LineWaveform"
  ? LineWaveform
  : never;

// Define the Layer type with proper discrimination
type Layer<T extends Preset> = {
  preset: T;
  settings: LayerSettings<T>;
};

export type Layers = Array<
  | Layer<"Shape2D">
  | Layer<"Shape3D">
  | Layer<"Light">
  | Layer<"Waveform">
  | Layer<"LineWaveform">
>;

// This allows multiple layers of each preset type
type Config = {
  layers: Layers;
};

export type ThreeJS = {
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
};

export type RenderFunc<T extends Preset> = (
  settings: LayerSettings<T>,
  three: ThreeJS,
  audioData: Uint8Array,
  id: string
) => void;

export type DefaultValues = {
  [P in Preset]: Required<LayerSettings<P>>;
};

// Props for the AudioVisualizer
export type AudioVisualizerProps = {
  audioRef?: React.RefObject<HTMLAudioElement>;
  src?: string;
  style?: React.CSSProperties;
  className?: string;
  config: Config;
  backgroundColor?: string;
};

export type AudioVisualizerRef = {
  play: () => void;
  pause: () => void;
  getAudioElement: () => HTMLAudioElement | null | undefined;
};
