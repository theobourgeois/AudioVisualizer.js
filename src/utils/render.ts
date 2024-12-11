import * as THREE from "three";

export type Preset =
  | "Shape2D"
  | "Shape3D"
  | "Light"
  | "Waveform"
  | "LineWaveform";
export const SHAPES_2D = [
  "circle",
  "square",
  "triangle",
  "pentagon",
  "hexagon",
  "octagon",
] as const;
export const SHAPES_3D = [
  "cube",
  "sphere",
  "torus",
  "dodecahedron",
  "icosahedron",
  "octahedron",
  "tetrahedron",
] as const;
export const LIGHT_TYPE = ["point", "spot", "directional", "ambient"] as const;

export type PresetBase = object;

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
  color?: THREE.ColorRepresentation;
  type?: (typeof LIGHT_TYPE)[number];
  intensity?: number;
  position?: [number, number, number];
};

type WaveformBase = PresetBase & {
  color?: THREE.ColorRepresentation;
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

export type Waveform = WaveformBase;
export type LineWaveform = WaveformBase;

export type Shape2D = ShapeBase & {
  shape?: (typeof SHAPES_2D)[number];
  rotationAmplitude?: number;
};

export type Shape3D = ShapeBase & {
  shape?: (typeof SHAPES_3D)[number];
  rotationXAmplitude?: number;
  rotationYAmplitude?: number;
  rotationZAmplitude?: number;
};

// Define LayerSettings based on Preset
export type LayerSettings<T extends Preset> = T extends "Shape2D"
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
export type Layer<T extends Preset> = {
  preset: T;
  settings: LayerSettings<T>;
};

// This allows multiple layers of each preset type
export type Config = {
  layers: Array<
    | Layer<"Shape2D">
    | Layer<"Shape3D">
    | Layer<"Light">
    | Layer<"Waveform">
    | Layer<"LineWaveform">
  >;
};

type ThreeJS = {
  camera: THREE.Camera;
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
};

export type RenderFunc<T extends Preset> = (
  settings: LayerSettings<T>,
  three: ThreeJS,
  audioData: Uint8Array,
  id: string
) => void;

type DefaultValues = {
  [P in Preset]: Required<LayerSettings<P>>;
};

const presetDefaults = {
  highCut: 0,
  lowCut: 0,
};

const shapeDefault: Required<ShapeBase> = {
  color: "#000000",
  speed: 0,
  opacity: 1,
  amplitude: 1,
  z: 0,
  x: 0,
  y: 0,
  castShadow: false,
  receiveShadow: true,
  size: 1,
  ...presetDefaults,
};

const waveformDefault: Required<WaveformBase> = {
  color: "#ffffff",
  opacity: 1,
  amplitude: 1,
  x: 0,
  y: 0,
  z: 0,
  width: 100,
  height: 100,
  lineWidth: 1,
  period: 1,
  invert: false,
  ...presetDefaults,
};

const defaultValues: DefaultValues = {
  Shape2D: {
    shape: "circle",
    rotationAmplitude: 0,
    ...shapeDefault,
  },
  Shape3D: {
    shape: "cube",
    rotationXAmplitude: 0,
    rotationYAmplitude: 0,
    rotationZAmplitude: 0,
    ...shapeDefault,
  },
  Light: {
    color: "#ffffff",
    type: "directional",
    intensity: 1,
    position: [0, 0, 0],
  },
  Waveform: {
    ...waveformDefault,
  },
  LineWaveform: {
    ...waveformDefault,
  },
};

const shape2DMap = {
  circle: (size: number) => new THREE.CircleGeometry(size),
  square: (size: number) => new THREE.PlaneGeometry(size, size),
  triangle: (size: number) => new THREE.CircleGeometry(size, 3),
  pentagon: (size: number) => new THREE.CircleGeometry(size, 5),
  hexagon: (size: number) => new THREE.CircleGeometry(size, 6),
  octagon: (size: number) => new THREE.CircleGeometry(size, 8),
};

function applyDefaults<T>(defaults: T, overrides: Partial<T>): T {
  return { ...defaults, ...overrides };
}

const lightMap = {
  point: THREE.PointLight,
  spot: THREE.SpotLight,
  directional: THREE.DirectionalLight,
  ambient: THREE.AmbientLight,
};

const renderLight: RenderFunc<"Light"> = (settings, three, _, id) => {
  const { color, intensity, position, type } = applyDefaults(
    defaultValues.Light,
    settings
  );
  let light = three.scene.children.find((child) => child.name === id);

  if (!light) {
    light = new lightMap[type](color, intensity);
    light.position.set(...position);
    light.name = id;
    three.renderer.shadowMap.enabled = true;
    three.scene.add(light);
  }
};

const renderShape2D: RenderFunc<"Shape2D"> = (
  settings,
  three,
  audioData,
  id
) => {
  const { shape, color, opacity, size, amplitude, rotationAmplitude, x, y } =
    applyDefaults(defaultValues.Shape2D, settings);
  let mesh = three.scene.children.find((child) => child.name === id);

  if (!mesh) {
    const geometry = shape2DMap[shape](size);
    const material = new THREE.MeshBasicMaterial({ color, opacity });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = x;
    mesh.position.y = y;
    mesh.name = id;
    three.scene.add(mesh);
  }

  const average = audioData.reduce((a, b) => a + b, 0) / audioData.length;
  const scale = 1 + average * (amplitude / 100);

  mesh.rotation.z += (rotationAmplitude / 1000) * (Math.PI / 180) * average;
  mesh.scale.set(scale, scale, 1);
};

const shape3DMap = {
  cube: (size: number) => new THREE.BoxGeometry(size, size, size),
  sphere: (size: number) => new THREE.SphereGeometry(size),
  torus: (size: number) => new THREE.TorusGeometry(size, size / 2),
  dodecahedron: (size: number) => new THREE.DodecahedronGeometry(size),
  icosahedron: (size: number) => new THREE.IcosahedronGeometry(size),
  octahedron: (size: number) => new THREE.OctahedronGeometry(size),
  tetrahedron: (size: number) => new THREE.TetrahedronGeometry(size),
};

const renderShape3D: RenderFunc<"Shape3D"> = (
  settings,
  three,
  audioData,
  id
) => {
  const {
    shape,
    color,
    opacity,
    size,
    amplitude,
    rotationXAmplitude,
    rotationYAmplitude,
    rotationZAmplitude,
    x,
    y,
    z,
  } = applyDefaults(defaultValues.Shape3D, settings);
  let mesh = three.scene.children.find((child) => child.name === id);

  if (!mesh) {
    const geometry = shape3DMap[shape](size);
    const material = new THREE.MeshStandardMaterial({ color, opacity });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = z;
    mesh.position.x = x;
    mesh.position.y = y;
    mesh.name = id;
    three.scene.add(mesh);
    // add shadow
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  }

  const average = audioData.reduce((a, b) => a + b, 0) / audioData.length;
  const scale = 1 + average * (amplitude / 100);
  mesh.scale.set(scale, scale, scale);
  mesh.rotation.x += (rotationXAmplitude / 1000) * (Math.PI / 180) * average;
  mesh.rotation.y += (rotationYAmplitude / 1000) * (Math.PI / 180) * average;
  mesh.rotation.z += (rotationZAmplitude / 1000) * (Math.PI / 180) * average;
};

const renderWaveform: RenderFunc<"Waveform"> = (
  settings,
  three,
  audioData,
  id
) => {
  const { color, opacity, amplitude, x, y, z, width, invert, lineWidth } =
    applyDefaults(defaultValues.Waveform, settings);
  let mesh = three.scene.children.find((child) => child.name === id) as
    | THREE.Line
    | undefined;

  if (!mesh) {
    const material = new THREE.LineBasicMaterial({
      color,
      opacity,
      linewidth: lineWidth,
    });
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(audioData.length * 3);
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    mesh = new THREE.Line(geometry, material);
    mesh.name = id;
    three.scene.add(mesh);
  }

  const positions = mesh.geometry.attributes.position.array as Float32Array;
  const step = width / audioData.length;
  const startX = x - width / 2;
  const invertFactor = invert ? -1 : 1;
  for (let i = 0; i < audioData.length; i++) {
    positions[i * 3] = startX + i * step;
    positions[i * 3 + 1] =
      y + audioData[i] * (amplitude / 1000) * invertFactor;
    positions[i * 3 + 2] = z;
  }
  mesh.geometry.attributes.position.needsUpdate = true;
};

const renderLineWaveform: RenderFunc<"LineWaveform"> = (
  settings,
  three,
  audioData,
  id
) => {
  const {
    color,
    opacity,
    amplitude,
    x,
    y,
    z,
    width,
    period,
    invert,
    lineWidth,
  } = applyDefaults(defaultValues.LineWaveform, settings);
  let mesh = three.scene.children.find((child) => child.name === id) as
    | THREE.LineSegments
    | undefined;

  if (!mesh) {
    const material = new THREE.LineBasicMaterial({
      color,
      opacity,
      linewidth: lineWidth,
    });
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(audioData.length * 6);
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    mesh = new THREE.LineSegments(geometry, material);
    mesh.name = id;
    three.scene.add(mesh);
  }

  const positions = mesh.geometry.attributes.position.array as Float32Array;
  const step = (width / audioData.length) * period;
  const startX = x - width / 2;
  const invertFactor = invert ? -1 : 1;
  for (let i = 0; i < audioData.length; i++) {
    positions[i * 6] = startX + i * step;
    positions[i * 6 + 1] = y;
    positions[i * 6 + 2] = z;

    positions[i * 6 + 3] = startX + i * step;
    positions[i * 6 + 4] =
      y + audioData[i] * (amplitude / 1000) * invertFactor;
    positions[i * 6 + 5] = z;
  }
  mesh.geometry.attributes.position.needsUpdate = true;
};

export const renderFuncs: {
  [P in Preset]: RenderFunc<P>;
} = {
  Shape2D: renderShape2D,
  Shape3D: renderShape3D,
  Light: renderLight,
  Waveform: renderWaveform,
  LineWaveform: renderLineWaveform,
};
