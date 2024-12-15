import {
    DefaultValues,
    PresetBase,
    Shape,
    Text,
    WaveformBase,
} from "../types";

const transformDefaults = {
    x: 0,
    y: 0,
    z: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    maxRotationX: Infinity,
    maxRotationY: Infinity,
    maxRotationZ: Infinity,
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
    font: "helvetiker",
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
        ...transformDefaults,
    },
    waveform: {
        ...waveformDefault,
    },
    "line-waveform": {
        ...waveformDefault,
    },
    text: textDefault,
};

export function applyDefaults<T>(defaults: T, overrides: Partial<T>): T {
    return { ...defaults, ...overrides };
}
