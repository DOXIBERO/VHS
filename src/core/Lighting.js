import * as THREE from 'three';

export class Lighting {
  constructor(scene) {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    this.dirLight.position.set(15, 25, 15);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 100;
    this.dirLight.shadow.camera.left = -25;
    this.dirLight.shadow.camera.right = 25;
    this.dirLight.shadow.camera.top = 25;
    this.dirLight.shadow.camera.bottom = -25;
    this.dirLight.shadow.bias = -0.0005;
    scene.add(this.dirLight);

    this.hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x4a7c59, 0.35);
    scene.add(this.hemiLight);
  }
}
