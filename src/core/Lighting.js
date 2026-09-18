import * as THREE from 'three';

export class Lighting {
  constructor(scene) {
    this.scene = scene;

    // 1. Ambient Light (Part 0082)
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(this.ambientLight);

    // 2. Directional Light casting shadows at (10, 20, 10) (Part 0082)
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    this.directionalLight.position.set(10, 20, 10);
    this.directionalLight.castShadow = true;

    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 100;
    this.directionalLight.shadow.camera.left = -30;
    this.directionalLight.shadow.camera.right = 30;
    this.directionalLight.shadow.camera.top = 30;
    this.directionalLight.shadow.camera.bottom = -30;
    this.directionalLight.shadow.bias = -0.0005;

    this.scene.add(this.directionalLight);

    // 3. Hemisphere Light (sky: 0x87CEEB, ground: 0x4a7c59, intensity 0.3) (Part 0082)
    this.hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x4a7c59, 0.3);
    this.scene.add(this.hemiLight);
  }
}
