import * as THREE from 'three';

export class Lighting {
  constructor(scene) {
    this.scene = scene;

    // 1. Ambient Light (Part 0082 & Character Polish)
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    this.scene.add(this.ambientLight);

    // 2. Main Key Directional Light casting shadows at (10, 20, 10) (Part 0082)
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.95);
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

    // 3. Front Fill Light for rich character detail visibility (Fall Guys aesthetics)
    this.fillLight = new THREE.DirectionalLight(0xffeedd, 0.45);
    this.fillLight.position.set(-6, 10, 12);
    this.scene.add(this.fillLight);

    // 4. Hemisphere Light (sky: 0x87CEEB, ground: 0x4a7c59, intensity 0.35)
    this.hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x4a7c59, 0.35);
    this.scene.add(this.hemiLight);
  }
}
