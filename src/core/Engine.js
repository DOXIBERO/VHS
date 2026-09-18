import * as THREE from 'three';
import { Ground } from '../levels/Ground.js';
import { Lighting } from './Lighting.js';

export class Engine {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    if (!this.canvas) {
      throw new Error('[Engine] Canvas element #game-canvas not found');
    }

    // 1. Scene with Sky Blue background (Part 0003)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB);

    // 2. Camera FOV 60 positioned at (0, 10, 20) looking at (0, 0, 0) (Part 0003)
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 10, 20);
    this.camera.lookAt(0, 0, 0);

    // 3. Renderer with shadow maps enabled (Part 0082)
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Ground Plane & 3D Lighting (Parts 0081-0082)
    this.ground = new Ground(this.scene);
    this.lighting = new Lighting(this.scene);

    // 5. Window resize listener
    window.addEventListener('resize', this.onWindowResize.bind(this));

    console.log('Engine initialized');
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
