import * as THREE from 'three';

/**
 * CameraController (Parts 0121-0150 | PHASE 1: ENGINE)
 * Third-person follow camera with smooth lerp, look-ahead, lateral offset,
 * minimum ground height clamp (Y >= 2), and decaying impact screen shake.
 */
export class CameraController {
  /**
   * @param {THREE.Camera} camera 
   * @param {THREE.Object3D|null} target 
   * @param {Object} options 
   */
  constructor(camera, target = null, options = {}) {
    if (!camera) {
      throw new Error('[CameraController] Camera is required');
    }
    this.camera = camera;
    this.target = target;

    // Configurable properties as specified in Part 0121-0150
    this.offset = options.offset || new THREE.Vector3(0, 8, 12);
    this.lerpSpeed = options.lerpSpeed !== undefined ? options.lerpSpeed : 0.05;
    this.lookAhead = options.lookAhead !== undefined ? options.lookAhead : 2.0;
    this.minY = options.minY !== undefined ? options.minY : 2.0;

    // Internal state tracking
    this.currentLookAt = new THREE.Vector3();
    this.previousTargetPos = new THREE.Vector3();
    this.targetVelocity = new THREE.Vector3();

    if (this.target) {
      this.previousTargetPos.copy(this.target.position);
      this.currentLookAt.copy(this.target.position);
    }

    // Shake properties
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeTimer = 0;
    this.shakeOffset = new THREE.Vector3();
  }

  /**
   * Set target object to follow
   * @param {THREE.Object3D} target 
   */
  setTarget(target) {
    this.target = target;
    if (this.target) {
      this.previousTargetPos.copy(this.target.position);
      this.currentLookAt.copy(this.target.position);
    }
  }

  /**
   * Trigger camera screen shake for impacts (decays over duration)
   * @param {number} intensity - Max amplitude of shake
   * @param {number} duration - Duration in seconds (default 0.3s)
   */
  shake(intensity = 0.5, duration = 0.3) {
    this.shakeIntensity = intensity;
    this.shakeDuration = Math.max(duration, 0.01);
    this.shakeTimer = this.shakeDuration;
  }

  /**
   * Update camera position and orientation each frame
   * @param {number} dt - Frame delta time in seconds
   */
  update(dt = 1 / 60) {
    if (!this.target) return;

    const targetPos = this.target.position;

    // 1. Calculate target velocity & look-ahead direction
    if (dt > 0) {
      this.targetVelocity.subVectors(targetPos, this.previousTargetPos).divideScalar(dt);
      this.previousTargetPos.copy(targetPos);
    }

    // Look-ahead vector based on velocity direction
    const lookAheadVector = new THREE.Vector3();
    if (this.targetVelocity.lengthSq() > 0.01) {
      lookAheadVector.copy(this.targetVelocity).normalize().multiplyScalar(this.lookAhead);
    }

    // Lateral counter-shift: when moving left/right (X), shift camera slightly opposite for enhanced view
    const lateralShift = new THREE.Vector3(-this.targetVelocity.x * 0.1, 0, 0);

    // 2. Desired camera position
    const desiredPos = new THREE.Vector3()
      .copy(targetPos)
      .add(this.offset)
      .add(lateralShift);

    // 3. Update Screen Shake decay
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      const progress = Math.max(0, this.shakeTimer / this.shakeDuration); // 1.0 -> 0.0
      const currentIntensity = this.shakeIntensity * progress;

      this.shakeOffset.set(
        (Math.random() - 0.5) * 2 * currentIntensity,
        (Math.random() - 0.5) * 2 * currentIntensity,
        (Math.random() - 0.5) * 2 * currentIntensity
      );

      if (this.shakeTimer <= 0) {
        this.shakeTimer = 0;
        this.shakeIntensity = 0;
        this.shakeOffset.set(0, 0, 0);
      }
    } else {
      this.shakeOffset.set(0, 0, 0);
    }

    // 4. Smooth Lerp interpolation (prevent snapping)
    // Frame-rate independent lerp factor
    const factor = 1 - Math.pow(1 - this.lerpSpeed, dt * 60);
    this.camera.position.lerp(desiredPos, factor);

    // Add shake offset after lerping
    this.camera.position.add(this.shakeOffset);

    // 5. Enforce minimum ground height constraint (minimum Y = 2)
    if (this.camera.position.y < this.minY) {
      this.camera.position.y = this.minY;
    }

    // 6. Smooth LookAt towards target + lookAhead
    const desiredLookAt = new THREE.Vector3()
      .copy(targetPos)
      .add(lookAheadVector)
      .add(new THREE.Vector3(0, 0.5, 0)); // look slightly above feet

    this.currentLookAt.lerp(desiredLookAt, factor);
    this.camera.lookAt(this.currentLookAt);
  }
}
