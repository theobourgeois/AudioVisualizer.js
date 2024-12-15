import { applyDefaults, defaultValues, RenderFunc } from "..";
import * as THREE from "three";

export const renderLineWaveform: RenderFunc<"line-waveform"> = (
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
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    mesh = new THREE.LineSegments(geometry, material);
    mesh.name = id;
    three.scene.add(mesh);
  }

  const invertFactor = invert ? -1 : 1;
  const positions = mesh.geometry.attributes.position.array as Float32Array;

  (mesh.material as THREE.LineBasicMaterial).color.set(color);
  (mesh.material as THREE.LineBasicMaterial).opacity = opacity;
  (mesh.material as THREE.LineBasicMaterial).linewidth = lineWidth;

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

