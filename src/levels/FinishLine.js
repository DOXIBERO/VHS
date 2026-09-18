import * as THREE from 'three';
import { WordDisplay3D } from '../ui/WordDisplay3D.js';
import { germanAudio } from '../audio/GermanAudio.js';
import { eventBus } from '../core/EventBus.js';

export class FinishLine {
  constructor(scene, z = -95) {
    this.scene = scene;
    this.z = z;
    this.isTriggered = false;
    this.time = 0;

    this.group = new THREE.Group();
    this.group.position.set(0, 0, this.z);
    this.scene.add(this.group);

    this.initFinishArch();
    this.initPodium();
    this.initCrown();
    this.initConfetti();
  }

  initFinishArch() {
    // Arch Pillars
    const archMat = new THREE.MeshStandardMaterial({
      color: 0xFF0055, // Hot Pink Inflatable
      roughness: 0.3,
      metalness: 0.1
    });

    const pillarGeo = new THREE.CylinderGeometry(0.9, 1.1, 9, 16);
    const leftPillar = new THREE.Mesh(pillarGeo, archMat);
    leftPillar.position.set(-9.5, 4.5, 0);
    leftPillar.castShadow = true;
    this.group.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeo, archMat);
    rightPillar.position.set(9.5, 4.5, 0);
    rightPillar.castShadow = true;
    this.group.add(rightPillar);

    // Crossbar Arch
    const crossbarGeo = new THREE.BoxGeometry(20.5, 1.8, 1.8);
    const crossbar = new THREE.Mesh(crossbarGeo, archMat);
    crossbar.position.set(0, 8.8, 0);
    crossbar.castShadow = true;
    this.group.add(crossbar);

    // Big 3D "ZIEL" (FINISH) Billboard
    const finishSprite = WordDisplay3D.createTextSprite('🏁 ZIEL 🏁', 'GLÜCKWUNSCH!', '#FFCC00', '#111111');
    finishSprite.scale.set(7.5, 3.75, 1);
    finishSprite.position.set(0, 11.2, 0);
    this.group.add(finishSprite);

    // Checkered finish line on floor
    const checkGeo = new THREE.PlaneGeometry(21, 3);
    const checkMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.4
    });
    const checkMesh = new THREE.Mesh(checkGeo, checkMat);
    checkMesh.rotation.x = -Math.PI / 2;
    checkMesh.position.set(0, 0.02, 0);
    this.group.add(checkMesh);
  }

  initPodium() {
    this.podiumGroup = new THREE.Group();
    this.podiumGroup.position.set(0, 0, -4);

    const goldMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, roughness: 0.2, metalness: 0.8 });
    const silverMat = new THREE.MeshStandardMaterial({ color: 0xC0C0C0, roughness: 0.3, metalness: 0.7 });
    const bronzeMat = new THREE.MeshStandardMaterial({ color: 0xCD7F32, roughness: 0.3, metalness: 0.6 });

    // 1st Place (Center)
    const step1 = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 1.2, 24), goldMat);
    step1.position.set(0, 0.6, 0);
    step1.castShadow = true;
    this.podiumGroup.add(step1);

    // 2nd Place (Left)
    const step2 = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.5, 0.8, 24), silverMat);
    step2.position.set(-2.8, 0.4, 0);
    step2.castShadow = true;
    this.podiumGroup.add(step2);

    // 3rd Place (Right)
    const step3 = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.5, 0.5, 24), bronzeMat);
    step3.position.set(2.8, 0.25, 0);
    step3.castShadow = true;
    this.podiumGroup.add(step3);

    this.group.add(this.podiumGroup);
  }

  initCrown() {
    this.crownGroup = new THREE.Group();
    this.crownGroup.position.set(0, 2.5, -4);

    const crownMat = new THREE.MeshStandardMaterial({
      color: 0xFFDF00,
      metalness: 0.9,
      roughness: 0.15,
      emissive: 0x664400,
      emissiveIntensity: 0.4
    });

    // Crown Base Ring
    const ringGeo = new THREE.CylinderGeometry(0.65, 0.75, 0.3, 16, 1, true);
    const ringMesh = new THREE.Mesh(ringGeo, crownMat);
    this.crownGroup.add(ringMesh);

    // Crown Spikes
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const spikeGeo = new THREE.ConeGeometry(0.16, 0.5, 6);
      const spikeMesh = new THREE.Mesh(spikeGeo, crownMat);
      spikeMesh.position.set(
        Math.cos(angle) * 0.65,
        0.35,
        Math.sin(angle) * 0.65
      );
      this.crownGroup.add(spikeMesh);
    }

    this.group.add(this.crownGroup);
  }

  initConfetti() {
    this.confettiCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.confettiCount * 3);
    const colors = new Float32Array(this.confettiCount * 3);
    this.confettiVelocities = [];

    const palette = [
      new THREE.Color(0xFF0055),
      new THREE.Color(0x00E5FF),
      new THREE.Color(0xFFD700),
      new THREE.Color(0x76FF03),
      new THREE.Color(0x9C27B0)
    ];

    for (let i = 0; i < this.confettiCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = Math.random() * 8 + 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      this.confettiVelocities.push({
        x: (Math.random() - 0.5) * 2,
        y: -1.5 - Math.random() * 2.5,
        z: (Math.random() - 0.5) * 2
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.95
    });

    this.confettiPoints = new THREE.Points(geometry, material);
    this.confettiPoints.visible = false;
    this.group.add(this.confettiPoints);
  }

  checkFinish(player) {
    if (this.isTriggered) return;

    // Player reached finish line
    if (player.position.z <= this.z + 1.2) {
      this.isTriggered = true;
      this.confettiPoints.visible = true;

      // Audio & Celebrations
      germanAudio.playVictory();
      germanAudio.speak('Herzlichen Glückwunsch! Du hast gewonnen!');

      eventBus.emit('game:victory', {
        time: this.time
      });
    }
  }

  update(dt) {
    this.time += dt;

    // Crown floating & rotating
    if (this.crownGroup) {
      this.crownGroup.rotation.y += dt * 1.5;
      this.crownGroup.position.y = 2.5 + Math.sin(this.time * 3) * 0.2;
    }

    // Confetti physics when active
    if (this.isTriggered && this.confettiPoints && this.confettiPoints.visible) {
      const positions = this.confettiPoints.geometry.attributes.position.array;
      for (let i = 0; i < this.confettiCount; i++) {
        positions[i * 3 + 1] += this.confettiVelocities[i].y * dt;
        positions[i * 3] += this.confettiVelocities[i].x * dt;

        // Reset particle if hit floor
        if (positions[i * 3 + 1] < 0) {
          positions[i * 3 + 1] = 9 + Math.random() * 3;
          positions[i * 3] = (Math.random() - 0.5) * 16;
        }
      }
      this.confettiPoints.geometry.attributes.position.needsUpdate = true;
    }
  }
}
