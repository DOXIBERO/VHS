import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { eventBus } from '../core/EventBus.js';

/**
 * PlayerController
 * Handles WASD + Arrow keys movement, Spacebar jump, and 1-5 / C skin switching.
 * Coordinates camera-relative motion and smooth rotation for Fall-Guys style gameplay.
 */
export class PlayerController {
  constructor(playerBean, camera) {
    this.playerBean = playerBean;
    this.camera = camera;
    this.speed = 8.0;
    this.jumpForce = 7.2;

    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false
    };

    this.availableSkins = ['OFFICER', 'MOL_FOQIYA', 'CLASSIC', 'KREUZBERG', 'BERGHAIN'];
    this.currentSkinIndex = 0;

    this.moveVector = new THREE.Vector3();
    this.camForward = new THREE.Vector3();
    this.camRight = new THREE.Vector3();

    this.targetRotation = 0;
    this.currentRotation = 0;

    this.initListeners();
  }

  initListeners() {
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  onKeyDown(e) {
    // Movement controls
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = true;
        break;
      case 'Space':
        this.keys.jump = true;
        this.performJump();
        break;
      // Quick skin switching shortcuts (Parts 0201-0240)
      case 'Digit1':
      case 'Numpad1':
        this.setSkin('OFFICER');
        break;
      case 'Digit2':
      case 'Numpad2':
        this.setSkin('MOL_FOQIYA');
        break;
      case 'Digit3':
      case 'Numpad3':
        this.setSkin('CLASSIC');
        break;
      case 'Digit4':
      case 'Numpad4':
        this.setSkin('KREUZBERG');
        break;
      case 'Digit5':
      case 'Numpad5':
        this.setSkin('BERGHAIN');
        break;
      case 'KeyC':
        this.cycleNextSkin();
        break;
    }
  }

  onKeyUp(e) {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = false;
        break;
      case 'Space':
        this.keys.jump = false;
        break;
    }
  }

  performJump() {
    if (!this.playerBean || !this.playerBean.body) return;
    const body = this.playerBean.body;

    // Only allow jump if close to ground and vertical velocity is near zero
    if (Math.abs(body.velocity.y) < 0.35 && body.position.y <= 1.4) {
      body.velocity.y = this.jumpForce;
      if (this.playerBean.actions && this.playerBean.actions['jump_up']) {
        this.playerBean.playAnimation('jump_up', 0.15);
      }
      eventBus.emit('player:jump', { position: body.position });
    }
  }

  setSkin(skinName) {
    if (!this.playerBean) return;
    const idx = this.availableSkins.indexOf(skinName);
    if (idx !== -1) {
      this.currentSkinIndex = idx;
    }
    this.playerBean.applySkin(skinName);
    eventBus.emit('skin:changed', { skin: skinName });

    // Update HUD active button if present
    if (typeof document !== 'undefined') {
      const buttons = document.querySelectorAll('.skin-btn');
      buttons.forEach(btn => {
        if (btn.getAttribute('data-skin') === skinName) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }
  }

  cycleNextSkin() {
    this.currentSkinIndex = (this.currentSkinIndex + 1) % this.availableSkins.length;
    this.setSkin(this.availableSkins[this.currentSkinIndex]);
  }

  update(dt) {
    if (!this.playerBean || !this.playerBean.body) return;
    const body = this.playerBean.body;

    // Calculate move direction relative to camera
    let inputX = 0;
    let inputZ = 0;

    if (this.keys.forward) inputZ -= 1;
    if (this.keys.backward) inputZ += 1;
    if (this.keys.left) inputX -= 1;
    if (this.keys.right) inputX += 1;

    const isMoving = inputX !== 0 || inputZ !== 0;

    if (isMoving) {
      // Get camera orientation projected onto XZ ground
      if (this.camera) {
        this.camera.getWorldDirection(this.camForward);
        this.camForward.y = 0;
        this.camForward.normalize();

        this.camRight.crossVectors(this.camForward, new THREE.Vector3(0, 1, 0)).normalize();

        this.moveVector.set(0, 0, 0);
        this.moveVector.addScaledVector(this.camForward, -inputZ);
        this.moveVector.addScaledVector(this.camRight, inputX);
        this.moveVector.normalize();
      } else {
        this.moveVector.set(inputX, 0, inputZ).normalize();
      }

      // Apply horizontal velocity
      body.velocity.x = this.moveVector.x * this.speed;
      body.velocity.z = this.moveVector.z * this.speed;

      // Smooth facing rotation (atan2 on X and Z)
      this.targetRotation = Math.atan2(this.moveVector.x, this.moveVector.z);
      this.currentRotation = THREE.MathUtils.lerp(this.currentRotation, this.targetRotation, 0.25);

      const q = new CANNON.Quaternion();
      q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), this.currentRotation);
      body.quaternion.copy(q);

      // Animation: Run/Walk
      if (this.playerBean.actions) {
        if (this.playerBean.actions['run'] && this.playerBean.currentAction !== this.playerBean.actions['run']) {
          this.playerBean.playAnimation('run', 0.2);
        } else if (this.playerBean.actions['walk'] && !this.playerBean.actions['run'] && this.playerBean.currentAction !== this.playerBean.actions['walk']) {
          this.playerBean.playAnimation('walk', 0.2);
        }
      }
    } else {
      // Friction / slowdown when no keys pressed
      body.velocity.x *= 0.8;
      body.velocity.z *= 0.8;

      // Return to idle animation
      if (this.playerBean.actions && this.playerBean.actions['idle'] && this.playerBean.currentAction !== this.playerBean.actions['idle']) {
        if (Math.abs(body.velocity.y) < 0.2) {
          this.playerBean.playAnimation('idle', 0.2);
        }
      }
    }

    // Expose horizontal speed for external animators (Phase 3 BeanAnimator)
    this.playerBean.horizontalSpeed = Math.hypot(body.velocity.x, body.velocity.z);
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}
