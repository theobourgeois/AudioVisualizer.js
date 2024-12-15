import * as THREE from "three";
import { DataType } from "csstype"

export const SHAPES = [
  "cube",
  "sphere",
  "torus",
  "dodecahedron",
  "icosahedron",
  "octahedron",
  "tetrahedron",
] as const;

export const LIGHT_TYPES = ["point", "spot", "directional", "ambient"] as const;
export const PRESETS =
  ["shape", "light", "waveform", "line-waveform", "text"] as const;
export const FONTS = ["helvetiker", "optimer", "gentilis", "droid", "droid_bold"] as const;

export type Preset = typeof PRESETS[number];
export type Transform = {
  x?: number;
  y?: number;
  z?: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  maxRotationX?: number;
  maxRotationY?: number;
  maxRotationZ?: number;
}

export type PresetBase = {
  domainType?: "time" | "frequency";
}

export type Shape = PresetBase & Transform & {
  shape?: typeof SHAPES[number];
  rotationXAmplitude?: number;
  rotationYAmplitude?: number;
  rotationZAmplitude?: number;
  color?: string;
  opacity?: number;
  amplitude?: number;
  size?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
};

export type Text = PresetBase & Transform & {
  color: string;
  text: string;
  font?: typeof FONTS[number];
  size?: number;
  rotationXAmplitude?: number;
  rotationYAmplitude?: number;
  rotationZAmplitude?: number;
  bevelEnabled?: boolean;
  bevelThickness?: number;
  bevelSize?: number;
  bevelSegments?: number;
  curveSegments?: number;
  steps?: number;
  depth?: number;
  amplitude?: number;
};

export type Light = Transform & {
  color?: string;
  type?: typeof LIGHT_TYPES[number];
  intensity?: number;
};

export type WaveformBase = PresetBase & Transform & {
  color?: string;
  resolution?: number;
  opacity?: number;
  amplitude?: number;
  circle?: boolean;
  circleRadiusRatio?: number; // 0-1
  radius?: number;
  lineWidth?: number;
  invert?: boolean;
};

type Waveform = WaveformBase;
type LineWaveform = WaveformBase;

// Define LayerSettings based on Preset
export type LayerSettings<T extends Preset> = T extends "shape"
  ? Shape
  : T extends "light"
  ? Light
  : T extends "waveform"
  ? Waveform
  : T extends "line-waveform"
  ? LineWaveform
  : T extends "text"
  ? Text
  : never;

// Define the Layer type with proper discrimination
type Layer<T extends Preset> = {
  id?: number;
  preset: T;
  settings: LayerSettings<T>;
};

export type Config = Array<
  | Layer<"shape">
  | Layer<"light">
  | Layer<"waveform">
  | Layer<"line-waveform">
  | Layer<"text">
>;

export type ThreeJS = {
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
};

export type RenderFunc<T extends Preset> = (
  settings: LayerSettings<T>,
  three: ThreeJS,
  audioData: Uint8Array,
  id: string,
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
  backgroundColor?: DataType.Color;
  delayPerFrame?: number;
};

export type AudioVisualizerRef = {
  play: () => void;
  pause: () => void;
  getAudioElement: () => HTMLAudioElement | null | undefined;
};
