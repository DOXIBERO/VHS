import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Ground } from '../levels/Ground.js';
import { Lighting } from './Lighting.js';
import { PhysicsWorld } from '../physics/PhysicsWorld.js';
import { CameraController } from './CameraController.js';
import { BeanBody } from '../player/BeanBody.js';
import { BeanFactory } from '../player/BeanFactory.js';
import { eventBus } from './EventBus.js';

export class Engine {
  constructor() {
    // Expose global libraries for dev/debug
    window.THREE = THREE;
    window.CANNON = CANNON;

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
    this.camera.position.set(0, 8, 18);
    this.camera.lookAt(0, 1, 0);

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

    // 5. Physics World with Cannon-es & Materials (Parts 0083-0100)
    this.physicsWorld = new PhysicsWorld();

    // 6. BeanFactory with ObjectPool (Parts 0231-0240) & Player Bean
    this.beanFactory = new BeanFactory({
      scene: this.scene,
      physicsWorld: this.physicsWorld,
      physicsMaterial: this.physicsWorld.materials.BEAN
    });
    this.initPlayerBean();

    // Preload model & prewarm 20 beans for multiplayer rounds (Part 0231-0240 Acceptance Criteria)
    BeanBody.preloadModel().then(() => {
      this.beanFactory.prewarm(20);
    }).catch((err) => {
      console.warn('[Engine] Bean prewarm deferred:', err);
    });

    // 7. Camera Controller following Player Bean (Parts 0121-0150)
    this.cameraController = new CameraController(this.camera, this.playerBean.mesh, {
      offset: new THREE.Vector3(0, 2.8, 5.2),
      lerpSpeed: 0.05,
      lookAhead: 2.0,
      minY: 1.8
    });

    // Wire camera shake triggers
    eventBus.on('camera:shake', (data) => {
      this.cameraController.shake(data?.intensity || 0.5, data?.duration || 0.3);
    });
    eventBus.on('collision:bean-slime', () => {
      this.cameraController.shake(0.3, 0.25);
    });
    eventBus.on('collision:bean-trampoline', () => {
      this.cameraController.shake(0.6, 0.4);
    });

    // 8. Window resize listener
    window.addEventListener('resize', this.onWindowResize.bind(this));

    console.log('Engine initialized');
  }

  initPlayerBean() {
    this.playerBean = this.beanFactory.createBean({
      id: 'player_main',
      position: new THREE.Vector3(0, 3.5, 0),
      skin: 'OFFICER'
    });
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  update(dt) {
    // Step Cannon-es Physics World each frame (Part 0083-0090)
    if (this.physicsWorld) {
      this.physicsWorld.step(dt);
    }
    // Update all active Beans via BeanFactory (Parts 0231-0240)
    if (this.beanFactory) {
      this.beanFactory.update(dt);
    } else if (this.playerBean) {
      this.playerBean.update(dt);
    }
    // Update CameraController follow & shake (Parts 0121-0150)
    if (this.cameraController) {
      this.cameraController.update(dt);
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
