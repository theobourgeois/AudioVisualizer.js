import { FontLoader, TextGeometry } from "three/examples/jsm/Addons.js";
import { applyDefaults, defaultValues, RenderFunc, Text } from "..";
import * as THREE from "three";

const fontPath = "https://threejs.org/examples/fonts/";
const fontMap: Record<Required<Text>["font"], string> = {
  helvetiker: fontPath + "helvetiker_regular.typeface.json",
  optimer: fontPath + "optimer_regular.typeface.json",
  gentilis: fontPath + "gentilis_regular.typeface.json",
  droid: fontPath + "droid/droid_serif_regular.typeface.json",
  droid_bold: fontPath + "droid/droid_serif_bold.typeface.json",
};

export const renderText: RenderFunc<"text"> = (settings, three, audioData, id) => {
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
    maxRotationX,
    maxRotationY,
    maxRotationZ,
  } = applyDefaults(defaultValues.text, settings);
  let mesh = three.scene.children.find((child) => child.name === id) as
    | THREE.Mesh
    | undefined;

  const isDataChanged = Object.keys(settings).some(
    (key) =>
      mesh?.userData?.data?.[key] !== settings[key as keyof Text] &&
      mesh?.userData?.data?.[key] !== undefined
  );
  const isLoading = mesh?.userData.loading;

  if (!mesh || (isDataChanged && !isLoading)) {
    console.log("Creating new text mesh");
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
    if (mesh.rotation.x > maxRotationX) {
      mesh.userData.rotationXAmplitude = -1;
    } else if (mesh.rotation.x < -maxRotationX) {
      mesh.userData.rotationXAmplitude = 1;
    }
    if (mesh.rotation.y > maxRotationY) {
      mesh.userData.rotationYAmplitude = -1;
    } else if (mesh.rotation.y < -maxRotationY) {
      mesh.userData.rotationYAmplitude = 1;
    }
    if (mesh.rotation.z > maxRotationZ) {
      mesh.userData.rotationZAmplitude = -1;
    } else if (mesh.rotation.z < -maxRotationZ) {
      mesh.userData.rotationZAmplitude = 1;
    }

    const rotationXFactor = mesh.userData?.rotationXAmplitude || 1;
    const rotationYFactor = mesh.userData?.rotationYAmplitude || 1;
    const rotationZFactor = mesh.userData?.rotationZAmplitude || 1;

    // Update position and rotation
    mesh.position.set(x, y, z);
    if (rotationXAmplitude > 0) {
      mesh.rotation.x +=
        (rotationXAmplitude / 1000) *
        (Math.PI / 180) *
        average *
        rotationXFactor;
    } else {
      mesh.rotation.x = rotationX;
    }

    if (rotationYAmplitude > 0) {
      mesh.rotation.y +=
        (rotationYAmplitude / 1000) *
        (Math.PI / 180) *
        average *
        rotationYFactor;
    } else {
      mesh.rotation.y = rotationY;
    }

    if (rotationZAmplitude > 0) {
      mesh.rotation.z +=
        (rotationZAmplitude / 1000) *
        (Math.PI / 180) *
        average *
        rotationZFactor;
    } else {
      mesh.rotation.z = rotationZ;
    }
    mesh.scale.set(
      1 + average * (amplitude / 100),
      1 + average * (amplitude / 100),
      1 + average * (amplitude / 100)
    );
  }
};