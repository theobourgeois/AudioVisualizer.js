import { applyDefaults, defaultValues, RenderFunc } from "..";
import * as THREE from "three";

export const renderWaveform: RenderFunc<"waveform"> = (
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
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    mesh = new THREE.Line(geometry, material);
    mesh.name = id;
    three.scene.add(mesh);
  }

  const invertFactor = invert ? -1 : 1;
  const positions = mesh.geometry.attributes.position.array as Float32Array;

  (mesh.material as THREE.LineBasicMaterial).color.set(color);
  (mesh.material as THREE.LineBasicMaterial).opacity = opacity;
  (mesh.material as THREE.LineBasicMaterial).linewidth = lineWidth;

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
