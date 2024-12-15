import * as THREE from "three";
import { applyDefaults, defaultValues, RenderFunc } from "..";

const shapeMap = {
  cube: (size: number) => new THREE.BoxGeometry(size, size, size),
  sphere: (size: number) => new THREE.SphereGeometry(size),
  torus: (size: number) => new THREE.TorusGeometry(size, size / 2),
  dodecahedron: (size: number) => new THREE.DodecahedronGeometry(size),
  icosahedron: (size: number) => new THREE.IcosahedronGeometry(size),
  octahedron: (size: number) => new THREE.OctahedronGeometry(size),
  tetrahedron: (size: number) => new THREE.TetrahedronGeometry(size),
};

export const renderShape: RenderFunc<"shape"> = (settings, three, audioData, id) => {
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
    maxRotationX,
    maxRotationY,
    maxRotationZ,
  } = applyDefaults(defaultValues.shape, settings);
  let mesh = three.scene.children.find(
    (child) => child.name === id
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

  if (mesh.rotation.x > maxRotationX) {
    mesh.userData.rotationXFactor = -1;
  } else if (mesh.rotation.x < -maxRotationX) {
    mesh.userData.rotationXFactor = 1;
  }

  if (mesh.rotation.y > maxRotationY) {
    mesh.userData.rotationYFactor = -1;
  } else if (mesh.rotation.y < -maxRotationY) {
    mesh.userData.rotationYFactor = 1;
  }

  if (mesh.rotation.z > maxRotationZ) {
    mesh.userData.rotationZFactor = -1;
  } else if (mesh.rotation.z < -maxRotationZ) {
    mesh.userData.rotationZFactor = 1;
  }

  const rotationXFactor = mesh.userData.rotationXFactor || 1;
  const rotationYFactor = mesh.userData.rotationYFactor || 1;
  const rotationZFactor = mesh.userData.rotationZFactor || 1;

  if (rotationXAmplitude > 0) {
    mesh.rotation.x +=
      (rotationXAmplitude / 1000) * (Math.PI / 180) * average * rotationXFactor;
  } else {
    mesh.rotation.x = rotationX;
  }

  if (rotationYAmplitude > 0) {
    mesh.rotation.y +=
      (rotationYAmplitude / 1000) * (Math.PI / 180) * average * rotationYFactor;
  } else {
    mesh.rotation.y = rotationY;
  }

  if (rotationZAmplitude > 0) {
    mesh.rotation.z +=
      (rotationZAmplitude / 1000) * (Math.PI / 180) * average * rotationZFactor;
  } else {
    mesh.rotation.z = rotationZ;
  }
};
