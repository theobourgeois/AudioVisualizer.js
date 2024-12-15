import * as THREE from "three";
import { applyDefaults, defaultValues, RenderFunc } from "..";
const lightMap = {
    point: THREE.PointLight,
    spot: THREE.SpotLight,
    directional: THREE.DirectionalLight,
    ambient: THREE.AmbientLight,
};

export const renderLight: RenderFunc<"light"> = (settings, three, _, id) => {
    const { color, intensity, x, y, z, rotationX, rotationY, rotationZ, type } =
        applyDefaults(defaultValues.light, settings);
    let light = three.scene.children.find(
        (child) => child.name === id
    ) as THREE.Light;

    if (!light) {
        light = new lightMap[type](color, intensity);
        light.name = id;
        three.renderer.shadowMap.enabled = true;
        three.scene.add(light);
    }
    light.position.set(x, y, z);
    light.rotation.set(rotationX, rotationY, rotationZ);
    light.intensity = intensity;
    light.color.set(color);
};
