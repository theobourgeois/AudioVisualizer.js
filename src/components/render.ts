import * as THREE from "three";
import {
  DefaultValues,
  Preset,
  PresetBase,
  RenderFunc,
  Shape,
  Text,
  WaveformBase,
} from "./types";
import { TextGeometry, FontLoader } from "three/examples/jsm/Addons.js";

const transformDefaults = {
  x: 0,
  y: 0,
  z: 0,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
};

const presetDefaults: Required<PresetBase> = {
  domainType: "time",
};

const shapeDefault: Required<Shape> = {
  shape: "cube",
  color: "#000000",
  opacity: 1,
  amplitude: 1,
  castShadow: false,
  receiveShadow: true,
  size: 1,
  rotationXAmplitude: 0,
  rotationYAmplitude: 0,
  rotationZAmplitude: 0,
  ...transformDefaults,
  ...presetDefaults,
};

const waveformDefault: Required<WaveformBase> = {
  color: "#ffffff",
  circleRadiusRatio: 1,
  opacity: 1,
  resolution: 1,
  amplitude: 1,
  circle: false,
  radius: 3,
  lineWidth: 1,
  invert: false,
  ...transformDefaults,
  ...presetDefaults,
};

const textDefault: Required<Text> = {
  text: "Hello, World!",
  font: "roboto",
  color: "#ffffff",
  size: 1,
  amplitude: 0,
  rotationXAmplitude: 0,
  rotationYAmplitude: 0,
  rotationZAmplitude: 0,
  depth: 0.1,
  bevelEnabled: false,
  bevelThickness: 0,
  bevelSize: 0,
  bevelSegments: 12,
  curveSegments: 12,
  steps: 12,
  ...transformDefaults,
  ...presetDefaults,
};

export const defaultValues: DefaultValues = {
  shape: shapeDefault,
  light: {
    color: "#ffffff",
    type: "directional",
    intensity: 1,
    position: [0, 0, 0],
  },
  waveform: {
    ...waveformDefault,
  },
  "line-waveform": {
    ...waveformDefault,
  },
  text: textDefault,
};

const fontPath = "https://threejs.org/examples/fonts/";
const fontMap: Record<Required<Text>["font"], string> = {
  helvetiker: fontPath + "helvetiker_regular.typeface.json",
  optimer: fontPath + "optimer_regular.typeface.json",
  gentilis: fontPath + "gentilis_regular.typeface.json",
  droid: fontPath + "droid/droid_serif_regular.typeface.json",
  droid_bold: fontPath + "droid/droid_serif_bold.typeface.json",
  roboto: "roboto.json",
};
const lightMap = {
  point: THREE.PointLight,
  spot: THREE.SpotLight,
  directional: THREE.DirectionalLight,
  ambient: THREE.AmbientLight,
};

const shapeMap = {
  cube: (size: number) => new THREE.BoxGeometry(size, size, size),
  sphere: (size: number) => new THREE.SphereGeometry(size),
  torus: (size: number) => new THREE.TorusGeometry(size, size / 2),
  dodecahedron: (size: number) => new THREE.DodecahedronGeometry(size),
  icosahedron: (size: number) => new THREE.IcosahedronGeometry(size),
  octahedron: (size: number) => new THREE.OctahedronGeometry(size),
  tetrahedron: (size: number) => new THREE.TetrahedronGeometry(size),
};

function applyDefaults<T>(defaults: T, overrides: Partial<T>): T {
  return { ...defaults, ...overrides };
}

const renderLight: RenderFunc<"light"> = (settings, three, _, id) => {
  const { color, intensity, position, type } = applyDefaults(
    defaultValues.light,
    settings,
  );
  let light = three.scene.children.find((child) => child.name === id) as THREE.Light;

  if (!light) {
    light = new lightMap[type](color, intensity);
    light.name = id;
    three.renderer.shadowMap.enabled = true;
    three.scene.add(light);
  }
  light.position.set(...position);
  light.intensity = intensity;
  light.color.set(color);
};

const renderShape: RenderFunc<"shape"> = (settings, three, audioData, id) => {
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
    rotationX,
    rotationY,
    rotationZ,
  } = applyDefaults(defaultValues.shape, settings);
  let mesh = three.scene.children.find(
    (child) => child.name === id,
  ) as THREE.Mesh;

  if (!mesh) {
    const geometry = shapeMap[shape](size);
    const material = new THREE.MeshStandardMaterial({ color, opacity });
    mesh = new THREE.Mesh(geometry, material);
    mesh.name = id;
    three.scene.add(mesh);
    // add shadow
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  }

  const average = audioData.reduce((a, b) => a + b, 0) / audioData.length;
  const scale = 1 + average * (amplitude / 100);
  (mesh.material as THREE.MeshStandardMaterial).color.set(color);
  mesh.scale.set(scale, scale, scale);
  mesh.position.z = z;
  mesh.position.x = x;
  mesh.position.y = y;

  if (rotationXAmplitude > 0) {
    mesh.rotation.x += (rotationXAmplitude / 1000) * (Math.PI / 180) * average;
  } else {
    mesh.rotation.x = rotationX;
  }

  if (rotationYAmplitude > 0) {
    mesh.rotation.y += (rotationYAmplitude / 1000) * (Math.PI / 180) * average;
  } else {
    mesh.rotation.y = rotationY;
  }

  if (rotationZAmplitude > 0) {
    mesh.rotation.z += (rotationZAmplitude / 1000) * (Math.PI / 180) * average;
  } else {
    mesh.rotation.z = rotationZ;
  }
};

const renderWaveform: RenderFunc<"waveform"> = (
  settings,
  three,
  audioData,
  id,
) => {
  const {
    color,
    opacity,
    amplitude,
    x,
    y,
    z,
    invert,
    lineWidth,
    circle,
    radius,
    resolution,
    circleRadiusRatio,
    rotationX,
    rotationY,
    rotationZ,
  } = applyDefaults(defaultValues.waveform, settings);
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
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    mesh = new THREE.Line(geometry, material);
    mesh.name = id;
    three.scene.add(mesh);
  }

  const invertFactor = invert ? -1 : 1;
  const positions = mesh.geometry.attributes.position.array as Float32Array;
  if (circle) {
    for (let i = 0; i < audioData.length; i++) {
      const ratio = (i / audioData.length) * circleRadiusRatio;
      const angle = Math.PI * ratio * 2;

      const magnitude =
        (audioData[i % audioData.length] / 255) * (amplitude / 100);
      const modifiedRadius = radius + magnitude;

      positions[i * 3] = x + Math.cos(angle) * modifiedRadius;
      positions[i * 3 + 1] =
        y + Math.sin(angle) * modifiedRadius * invertFactor;
      positions[i * 3 + 2] = z;
    }
  } else {
    const width = 50;
    const step = width / audioData.length / resolution;
    const startX = x - width / 2;
    for (let i = 0; i < audioData.length; i++) {
      positions[i * 3] = startX + i * step;
      positions[i * 3 + 1] =
        y + audioData[i] * (amplitude / 1000) * invertFactor;
      positions[i * 3 + 2] = z;
    }
  }
  mesh.rotation.set(rotationX, rotationY, rotationZ);
  // Update geometry
  mesh.geometry.attributes.position.needsUpdate = true;
};

const renderLineWaveform: RenderFunc<"line-waveform"> = (
  settings,
  three,
  audioData,
  id,
) => {
  const {
    color,
    opacity,
    amplitude,
    x,
    y,
    z,
    invert,
    lineWidth,
    circle,
    radius,
    resolution,
    circleRadiusRatio,
  } = applyDefaults(defaultValues["line-waveform"], settings);
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
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    mesh = new THREE.LineSegments(geometry, material);
    mesh.name = id;
    three.scene.add(mesh);
  }

  const invertFactor = invert ? -1 : 1;
  const positions = mesh.geometry.attributes.position.array as Float32Array;

  if (circle) {
    const step = Math.max(1, Math.floor(1 / resolution));
    for (let i = 0; i < audioData.length; i += step) {
      const ratio = (i / audioData.length) * circleRadiusRatio;
      const angle = Math.PI * 2 * ratio;

      const magnitude = (audioData[i] / 255) * (amplitude / 100);
      const modifiedRadius = radius + magnitude;

      positions[i * 6] = x + Math.cos(angle) * radius;
      positions[i * 6 + 1] = y + Math.sin(angle) * radius * invertFactor;
      positions[i * 6 + 2] = z;

      positions[i * 6 + 3] = x + Math.cos(angle) * modifiedRadius;
      positions[i * 6 + 4] =
        y + Math.sin(angle) * modifiedRadius * invertFactor;
      positions[i * 6 + 5] = z;
    }
  } else {
    const width = 50;
    const step = width / audioData.length / resolution;
    const startX = x - width / 2;
    for (let i = 0; i < audioData.length; i++) {
      positions[i * 6] = startX + i * step;
      positions[i * 6 + 1] = y;
      positions[i * 6 + 2] = z;

      positions[i * 6 + 3] = startX + i * step;
      positions[i * 6 + 4] =
        y + audioData[i] * (amplitude / 1000) * invertFactor;
      positions[i * 6 + 5] = z;
    }
  }

  mesh.geometry.attributes.position.needsUpdate = true;
};

const renderText: RenderFunc<"text"> = (settings, three, audioData, id) => {
  const {
    text,
    font,
    size,
    x,
    y,
    z,
    rotationXAmplitude,
    rotationYAmplitude,
    rotationZAmplitude,
    depth,
    bevelEnabled,
    bevelThickness,
    bevelSize,
    bevelSegments,
    curveSegments,
    steps,
    color,
    amplitude,
    rotationX,
    rotationY,
    rotationZ,
  } = applyDefaults(defaultValues.text, settings);
  let mesh = three.scene.children.find((child) => child.name === id) as
    | THREE.Mesh
    | undefined;

  const isDataChanged = Object.keys(settings).some(
    (key) =>
      mesh?.userData?.data?.[key] !== settings[key as keyof Text] &&
      mesh?.userData?.data?.[key] !== undefined,
  );
  const isLoading = mesh?.userData.loading;

  if (!mesh || (isDataChanged && !isLoading)) {
    if (!mesh) {
      mesh = new THREE.Mesh();
      mesh.name = id;
      three.scene.add(mesh);
    }

    mesh!.userData = { loading: true };
    const loader = new FontLoader();
    loader.load(fontMap[font], (fontFile) => {
      const geometry = new TextGeometry(text, {
        font: fontFile,
        size,
        depth,
        curveSegments,
        bevelEnabled,
        bevelThickness,
        bevelSize,
        bevelSegments,
        steps,
      });
      const material = new THREE.MeshBasicMaterial({ color });

      if (mesh) {
        three.scene.remove(mesh);
        mesh.geometry.dispose(); // Dispose of the old geometry
      }

      mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = {
        loading: false,
        data: {
          text,
          font,
          size,
          depth,
          curveSegments,
          bevelEnabled,
          bevelThickness,
          bevelSize,
          bevelSegments,
          steps,
          color,
        },
      };

      mesh.name = id;
      three.scene.add(mesh);

      // Center the geometry
      mesh.geometry.center();

      // Set initial position
      mesh.position.set(x, y, z);
      mesh.rotation.set(rotationX, rotationY, rotationZ);
    });
  } else {
    const average = audioData.reduce((a, b) => a + b, 0) / audioData.length;

    // Update position and rotation
    mesh.position.set(x, y, z);
    if (rotationXAmplitude > 0) {
      mesh.rotation.x +=
        (rotationXAmplitude / 1000) * (Math.PI / 180) * average;
    } else {
      mesh.rotation.x = rotationX;
    }

    if (rotationYAmplitude > 0) {
      mesh.rotation.y +=
        (rotationYAmplitude / 1000) * (Math.PI / 180) * average;
    } else {
      mesh.rotation.y = rotationY;
    }

    if (rotationZAmplitude > 0) {
      mesh.rotation.z +=
        (rotationZAmplitude / 1000) * (Math.PI / 180) * average;
    } else {
      mesh.rotation.z = rotationZ;
    }
    mesh.scale.set(
      1 + average * (amplitude / 100),
      1 + average * (amplitude / 100),
      1 + average * (amplitude / 100),
    );
  }
};
export const renderFuncs: {
  [P in Preset]: RenderFunc<P>;
} = {
  text: renderText,
  shape: renderShape,
  light: renderLight,
  waveform: renderWaveform,
  "line-waveform": renderLineWaveform,
} as const;
