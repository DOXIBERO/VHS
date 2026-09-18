import * as THREE from 'three';
import { BeanBody } from './BeanBody.js';
import { BeanAnimator } from './BeanAnimator.js';

export class BotBean {
  constructor(scene, initialPosition, options = {}) {
    this.bean = new BeanBody(scene, initialPosition, {
      skinColor: options.skinColor || 0x00E5FF,
      capColor: options.capColor || 0x1A237E,
      shoeColor: options.shoeColor || 0xFFFFFF,
      hasChain: false,
      name: options.name || 'BotBean'
    });

    this.animator = new BeanAnimator(this.bean);
    this.speed = options.speed || (5.0 + Math.random() * 1.5);
    this.targetZ = options.targetZ || -95;
    this.wobblePhase = Math.random() * Math.PI * 2;
    this.name = options.name || 'Bot';

    this.chosenDoorOffset = (Math.random() < 0.5 ? -1 : (Math.random() < 0.5 ? 0 : 1)) * 5.7;
    this.isFinished = false;
  }

  update(dt, activeGates = []) {
    if (this.isFinished) {
      this.animator.setVictory(true);
      this.animator.update(dt, false, true);
      return;
    }

    this.wobblePhase += dt * 3;

    // Check next uncleared gate ahead of bot
    const nextGate = activeGates.find(g => g.z < this.bean.position.z);

    let targetX = 0;
    if (nextGate) {
      // If a door is open, head for the open door!
      const openDoor = nextGate.doors.find(d => d.isOpen);
      if (openDoor) {
        targetX = (openDoor.xMin + openDoor.xMax) / 2;
      } else {
        // Head for chosen door with slight humorous jitter
        targetX = this.chosenDoorOffset + Math.sin(this.wobblePhase) * 0.5;
      }
    } else {
      // Head straight for finish
      targetX = Math.sin(this.wobblePhase) * 1.2;
    }

    // Steer towards targetX and run forward (-Z)
    const steerDir = targetX - this.bean.position.x;
    const steerSpeed = 3.2;

    this.bean.position.x += Math.sign(steerDir) * Math.min(Math.abs(steerDir), steerSpeed * dt);
    this.bean.position.z -= this.speed * dt;

    // Keep within track
    this.bean.position.x = Math.max(-9.5, Math.min(9.5, this.bean.position.x));

    // Bot faces forward / steer angle
    const targetRot = Math.PI - (steerDir * 0.15);
    this.bean.group.rotation.y = targetRot;

    // Check collisions with gates
    if (nextGate) {
      nextGate.checkCollision(this.bean, false);
    }

    // Check if reached finish
    if (this.bean.position.z <= this.targetZ + 2) {
      this.isFinished = true;
    }

    // Update animations
    this.animator.update(dt, true, this.bean.isGrounded);
  }

  reset(initialPosition) {
    this.bean.reset(initialPosition[0], initialPosition[1], initialPosition[2]);
    this.isFinished = false;
    this.animator.setVictory(false);
  }
}
