export class BeanAnimator {
  constructor(bean) {
    this.bean = bean;
    this.time = 0;
    this.isVictory = false;
  }

  setVictory(isVictory = true) {
    this.isVictory = isVictory;
  }

  update(dt, isMoving, isGrounded) {
    this.time += dt;

    // Celebration / Victory Animation
    if (this.isVictory) {
      const victorySpeed = 10;
      // High jump celebration arms
      this.bean.leftArm.rotation.z = 2.4;
      this.bean.rightArm.rotation.z = -2.4;
      this.bean.leftArm.rotation.x = Math.sin(this.time * victorySpeed) * 0.4;
      this.bean.rightArm.rotation.x = -Math.sin(this.time * victorySpeed) * 0.4;

      // Excited spin & hop
      this.bean.torso.position.y = 0.85 + Math.abs(Math.sin(this.time * 8)) * 0.45;
      this.bean.torso.rotation.y = this.time * 4;
      this.bean.head.rotation.z = Math.sin(this.time * 12) * 0.15;
      return;
    }

    if (!isGrounded) {
      // Jump / Airborne pose
      this.bean.torso.rotation.x = -0.15;
      this.bean.leftLeg.rotation.x = 0.6;
      this.bean.rightLeg.rotation.x = 0.6;
      this.bean.leftArm.rotation.z = 1.2;
      this.bean.rightArm.rotation.z = -1.2;
      this.bean.torso.scale.set(0.9, 1.15, 0.9); // Squash & Stretch
      return;
    }

    // Reset scale
    this.bean.torso.scale.set(1, 1, 1);
    this.bean.torso.rotation.y = 0;

    if (isMoving) {
      // RUN Animation (Part 0251)
      const runSpeed = 14;
      const legSwing = Math.sin(this.time * runSpeed) * 0.7;
      const armSwing = Math.cos(this.time * runSpeed) * 0.6;

      this.bean.leftLeg.rotation.x = legSwing;
      this.bean.rightLeg.rotation.x = -legSwing;

      this.bean.leftArm.rotation.x = -armSwing;
      this.bean.rightArm.rotation.x = armSwing;
      this.bean.leftArm.rotation.z = 0.3;
      this.bean.rightArm.rotation.z = -0.3;

      // Forward lean and bouncy head bob
      this.bean.torso.rotation.x = -0.22;
      this.bean.torso.position.y = 0.85 + Math.abs(Math.sin(this.time * runSpeed)) * 0.08;
      this.bean.head.rotation.z = Math.sin(this.time * runSpeed * 0.5) * 0.06;
    } else {
      // IDLE Animation (Part 0241)
      const breathe = Math.sin(this.time * 2.5);

      this.bean.torso.position.y = 0.85 + breathe * 0.03;
      this.bean.torso.rotation.x = 0;
      this.bean.head.rotation.z = Math.sin(this.time * 1.8) * 0.04;
      this.bean.head.rotation.x = breathe * 0.02;

      this.bean.leftArm.rotation.x = 0;
      this.bean.rightArm.rotation.x = 0;
      this.bean.leftArm.rotation.z = 0.15 + breathe * 0.05;
      this.bean.rightArm.rotation.z = -0.15 - breathe * 0.05;

      this.bean.leftLeg.rotation.x = 0;
      this.bean.rightLeg.rotation.x = 0;
    }
  }
}
