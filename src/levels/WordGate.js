import * as THREE from 'three';
import { WordDisplay3D } from '../ui/WordDisplay3D.js';
import { germanAudio } from '../audio/GermanAudio.js';
import { eventBus } from '../core/EventBus.js';

export class WordGate {
  constructor(scene, config) {
    this.scene = scene;
    this.z = config.z || -25;
    this.gateIndex = config.gateIndex || 1;
    this.targetWord = config.targetWord; // { id, german, english, emoji }
    this.options = config.options; // Array of 3 word objects
    this.isCleared = false;
    this.doors = [];

    this.group = new THREE.Group();
    this.group.position.set(0, 0, this.z);
    this.scene.add(this.group);

    this.initGateStructure();
    this.initDoors();
  }

  initGateStructure() {
    // Inflatable style gate frame
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x2A2E5B, // Deep rich stadium navy
      roughness: 0.35,
      metalness: 0.15
    });

    const trimMat = new THREE.MeshStandardMaterial({
      color: 0xFFCC00, // Vibrant golden trim
      roughness: 0.3
    });

    // Left Pillar
    const pillarGeo = new THREE.BoxGeometry(1.4, 7.5, 1.8);
    const leftPillar = new THREE.Mesh(pillarGeo, frameMat);
    leftPillar.position.set(-8.8, 3.75, 0);
    leftPillar.castShadow = true;
    this.group.add(leftPillar);

    // Right Pillar
    const rightPillar = new THREE.Mesh(pillarGeo, frameMat);
    rightPillar.position.set(8.8, 3.75, 0);
    rightPillar.castShadow = true;
    this.group.add(rightPillar);

    // Top Header Beam
    const headerGeo = new THREE.BoxGeometry(19.2, 1.6, 2.0);
    const header = new THREE.Mesh(headerGeo, frameMat);
    header.position.set(0, 7.8, 0);
    header.castShadow = true;
    this.group.add(header);

    // Top Arch Trim Badge
    const badgeGeo = new THREE.BoxGeometry(6.5, 1.0, 2.2);
    const badge = new THREE.Mesh(badgeGeo, trimMat);
    badge.position.set(0, 8.8, 0);
    this.group.add(badge);

    // Gate number label sprite
    const gateLabel = WordDisplay3D.createTextSprite(`TOR ${this.gateIndex}`, 'WÄHLE RICHTIG!', '#FF8800');
    gateLabel.scale.set(3.8, 1.9, 1);
    gateLabel.position.set(0, 10.2, 0);
    this.group.add(gateLabel);

    // Dividing Posts between the 3 doors
    const postGeo = new THREE.BoxGeometry(0.7, 6.2, 1.4);
    const post1 = new THREE.Mesh(postGeo, frameMat);
    post1.position.set(-2.9, 3.1, 0);
    this.group.add(post1);

    const post2 = new THREE.Mesh(postGeo, frameMat);
    post2.position.set(2.9, 3.1, 0);
    this.group.add(post2);
  }

  initDoors() {
    const doorWidth = 4.8;
    const doorHeight = 5.8;
    const doorDepth = 0.5;
    const xPositions = [-5.7, 0, 5.7];

    // Fall Guys vibrant door colors (Pink, Orange, Cyan)
    const doorColors = [0xFF2D55, 0xFF9500, 0x00C7BE];

    this.options.forEach((wordObj, i) => {
      const isCorrect = wordObj.id === this.targetWord.id;
      const xPos = xPositions[i];

      // Door Group for hinge rotation
      const doorGroup = new THREE.Group();
      doorGroup.position.set(xPos, 0, 0);

      // Door Mesh
      const doorGeo = new THREE.BoxGeometry(doorWidth, doorHeight, doorDepth);
      const doorMat = new THREE.MeshStandardMaterial({
        color: doorColors[i % doorColors.length],
        roughness: 0.3,
        metalness: 0.1
      });

      const doorMesh = new THREE.Mesh(doorGeo, doorMat);
      doorMesh.position.set(0, doorHeight / 2, 0);
      doorMesh.castShadow = true;
      doorGroup.add(doorMesh);

      // 3D Floating Word Sign above door (Neutral background so answer isn't spoiled!)
      const textSprite = WordDisplay3D.createTextSprite(
        wordObj.german.toUpperCase(),
        wordObj.emoji,
        '#1E293B' // Deep slate neutral sign
      );
      textSprite.position.set(xPos, 8.2, 0);
      this.group.add(textSprite);

      this.group.add(doorGroup);

      this.doors.push({
        wordObj,
        isCorrect,
        mesh: doorMesh,
        doorGroup: doorGroup,
        sprite: textSprite,
        xMin: xPos - doorWidth / 2,
        xMax: xPos + doorWidth / 2,
        isOpen: false,
        isAnimating: false,
        fallProgress: 0
      });
    });
  }

  checkCollision(entity, isPlayer = true) {
    const eZ = entity.position.z;
    const eX = entity.position.x;
    const eY = entity.position.y;

    // Within collision threshold of gate plane
    if (Math.abs(eZ - this.z) < 1.3 && eY < 4.8) {
      const touchedDoor = this.doors.find(d => eX >= d.xMin && eX <= d.xMax);

      if (touchedDoor) {
        if (touchedDoor.isOpen) {
          // Door already open! Entity runs straight through!
          return;
        }

        if (touchedDoor.isCorrect) {
          // SUCCESS! Break open door
          this.breakOpenDoor(touchedDoor, entity, isPlayer);
        } else {
          // WRONG! Recoil back
          this.bounceBack(touchedDoor, entity, isPlayer);
        }
      }
    }
  }

  breakOpenDoor(door, entity, isPlayer = true) {
    if (door.isOpen) return;
    door.isOpen = true;
    door.isAnimating = true;
    this.isCleared = true;

    // Flash door neon green
    door.mesh.material.color.setHex(0x00FF88);

    if (isPlayer) {
      germanAudio.playSuccess();
      germanAudio.speak('Richtig!');
      eventBus.emit('player:answer', {
        wordId: door.wordObj.id,
        isCorrect: true
      });
      eventBus.emit('gate:cleared', {
        gateIndex: this.gateIndex,
        gateZ: this.z,
        targetWord: this.targetWord
      });
    }
  }

  bounceBack(door, entity, isPlayer = true) {
    // Recoil entity backwards (+Z direction)
    entity.velocity.y = 4;
    entity.position.z += 2.2;

    // Flash red
    const originalColor = door.mesh.material.color.getHex();
    door.mesh.material.color.setHex(0xFF0033);
    setTimeout(() => {
      if (!door.isOpen) {
        door.mesh.material.color.setHex(originalColor);
      }
    }, 450);

    if (isPlayer) {
      germanAudio.playWrongThud();
      eventBus.emit('player:answer', {
        wordId: door.wordObj.id,
        isCorrect: false
      });
    }
  }

  update(dt) {
    // Animate breaking door tipping forward flat like in Fall Guys
    this.doors.forEach(door => {
      if (door.isAnimating && door.fallProgress < 1) {
        door.fallProgress += dt * 3.5;
        const p = Math.min(1, door.fallProgress);
        // Tip forward around bottom hinge
        door.doorGroup.rotation.x = -p * (Math.PI / 2.05);
        if (p >= 1) {
          door.isAnimating = false;
        }
      }
    });
  }
}
