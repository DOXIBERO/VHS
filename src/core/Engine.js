import * as THREE from 'three';
import { Ground } from '../levels/Ground.js';
import { Lighting } from './Lighting.js';
import { CameraController } from './CameraController.js';
import { BeanBody } from '../player/BeanBody.js';
import { BeanAnimator } from '../player/BeanAnimator.js';
import { BotBean } from '../player/BotBean.js';
import { CourseManager } from '../levels/CourseManager.js';
import { germanAudio } from '../audio/GermanAudio.js';
import { eventBus } from './EventBus.js';

export class Engine {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    if (!this.canvas) {
      throw new Error('[Engine] Canvas element #game-canvas not found in DOM');
    }

    // 1. Scene & Atmosphere
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x70C5FF); // Vibrant Sky Blue
    this.scene.fog = new THREE.Fog(0x70C5FF, 40, 160);

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

    // 4. Ground Stadium Runway & Lighting
    this.ground = new Ground(this.scene);
    this.lighting = new Lighting(this.scene);

    // 5. Player Bean & Animator (Fall Guy Classic Yellow)
    this.player = new BeanBody(this.scene, [0, 0, 1], {
      skinColor: 0xFFD700,
      capColor: 0x333333,
      shoeColor: 0xFF2222,
      hasChain: true,
      name: 'PlayerBean'
    });
    this.animator = new BeanAnimator(this.player);

    // 6. AI Bot Beans (Fall Guys crowd competitors)
    this.bots = [
      new BotBean(this.scene, [-3.2, 0, 1.2], {
        name: 'Max',
        skinColor: 0x00E5FF, // Cyan
        capColor: 0x1A237E,
        shoeColor: 0xFFFFFF,
        speed: 5.3
      }),
      new BotBean(this.scene, [3.2, 0, 1.0], {
        name: 'Fritz',
        skinColor: 0xFF2D55, // Magenta
        capColor: 0xFFD600,
        shoeColor: 0x8E24AA,
        speed: 4.9
      }),
      new BotBean(this.scene, [1.4, 0, 3.2], {
        name: 'Lina',
        skinColor: 0x76FF03, // Lime
        capColor: 0xFF6D00,
        shoeColor: 0x0091EA,
        speed: 5.1
      })
    ];

    // 7. Course Manager (Gates + Finish Line)
    this.courseManager = new CourseManager(this.scene);

    // 8. 360 Camera Controller
    this.cameraController = new CameraController(this.camera, this.canvas);
    this.cameraController.setTarget(this.player.position);

    // 9. Listeners
    eventBus.on('game:victory', () => {
      this.animator.setVictory(true);
    });

    window.addEventListener('resize', this.onWindowResize.bind(this));
    console.log('[Engine] Wackel-Beans 3D Race Course & AI Bots ready!');
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  update(dt, inputVector) {
    const isMoving = inputVector && (inputVector.x !== 0 || inputVector.y !== 0);

    // 1. Update Player Movement relative to Camera Horizontal Angle (theta)
    const cameraAngle = this.cameraController.theta;
    this.player.update(dt, inputVector, cameraAngle);

    // 2. Update Procedural Animations
    this.animator.update(dt, isMoving, this.player.isGrounded);

    // 3. Update AI Bots
    this.bots.forEach(bot => {
      bot.update(dt, this.courseManager.gates);
    });

    // 4. Update Course Manager (Gates, Collisions, Finish)
    this.courseManager.update(dt, this.player, this.bots);

    // 5. Update Camera Follow
    this.cameraController.update(this.player.position);
  }

  jump() {
    if (this.player && this.player.isGrounded) {
      this.player.jump();
      germanAudio.playJump();
    }
  }

  restart() {
    this.player.reset(0, 0, 1);
    this.animator.setVictory(false);
    this.bots[0].reset([-3.2, 0, 1.2]);
    this.bots[1].reset([3.2, 0, 1.0]);
    this.bots[2].reset([1.4, 0, 3.2]);

    // Reset course
    this.courseManager.currentGateIndex = 0;
    this.courseManager.score = 0;
    this.courseManager.isVictory = false;
    this.courseManager.learnedWords = [];

    this.courseManager.gates.forEach(gate => {
      gate.isCleared = false;
      gate.doors.forEach(door => {
        door.isOpen = false;
        door.isAnimating = false;
        door.fallProgress = 0;
        door.doorGroup.rotation.x = 0;
        door.mesh.material.color.setHex(
          door.isCorrect ? 0x00C7BE : (door.wordObj.id === 'rot' ? 0xFF2D55 : 0xFF9500)
        );
      });
    });

    if (this.courseManager.finishLine) {
      this.courseManager.finishLine.isTriggered = false;
      if (this.courseManager.finishLine.confettiPoints) {
        this.courseManager.finishLine.confettiPoints.visible = false;
      }
    }

    this.courseManager.emitHUDUpdate();
    this.courseManager.speakCurrentWord();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
