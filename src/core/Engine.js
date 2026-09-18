import * as THREE from 'three';
import { Ground } from '../levels/Ground.js';
import { Lighting } from './Lighting.js';
import { CameraController } from './CameraController.js';
import { BeanBody } from '../player/BeanBody.js';
import { BeanAnimator } from '../player/BeanAnimator.js';

export class Engine {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    if (!this.canvas) {
      throw new Error('[Engine] Canvas element #game-canvas not found in DOM');
    }

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB);
    this.scene.fog = new THREE.Fog(0x87CEEB, 35, 140);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Ground & Lighting
    this.ground = new Ground(this.scene);
    this.lighting = new Lighting(this.scene);

    // 5. Player Bean & Animator
    this.player = new BeanBody(this.scene, [0, 0, 0]);
    this.animator = new BeanAnimator(this.player);

    // 6. Camera Controller (Orbit + Follow)
    this.cameraController = new CameraController(this.camera, this.canvas);
    this.cameraController.setTarget(this.player.position);

    window.addEventListener('resize', this.onWindowResize.bind(this));
    console.log('[Engine] Engine with 3D Player Bean & Orbit Camera initialized');
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  update(dt, inputVector) {
    const isMoving = inputVector && (inputVector.x !== 0 || inputVector.y !== 0);

    // Update Player Movement relative to Camera Horizontal Angle (theta)
    const cameraAngle = this.cameraController.theta;
    this.player.update(dt, inputVector, cameraAngle);

    // Update Procedural Animations
    this.animator.update(dt, isMoving, this.player.isGrounded);

    // Update Camera Follow
    this.cameraController.update(this.player.position);
  }

  jump() {
    if (this.player) {
      this.player.jump();
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
