import * as THREE from 'three';
import { WordDisplay3D } from '../ui/WordDisplay3D.js';

export class Ground {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'ObstacleTrack';
    this.scene.add(this.group);

    this.initRunway();
    this.initBumperRails();
    this.initStartArch();
    this.initDecorations();
  }

  initRunway() {
    // 1. Long Obstacle Runway
    const runwayGeo = new THREE.PlaneGeometry(22, 135);
    const runwayMat = new THREE.MeshStandardMaterial({
      color: 0x388E3C, // Fresh vibrant green
      roughness: 0.7,
      metalness: 0.1
    });

    this.runway = new THREE.Mesh(runwayGeo, runwayMat);
    this.runway.rotation.x = -Math.PI / 2;
    this.runway.position.set(0, 0, -45); // Centered from +22 to -112
    this.runway.receiveShadow = true;
    this.group.add(this.runway);

    // 2. Center Track Stripe (Dashed runway line)
    const stripeGeo = new THREE.PlaneGeometry(0.5, 135);
    const stripeMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.4
    });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(0, 0.01, -45);
    this.group.add(stripe);

    // 3. Surrounding Stadium Grass Floor
    const grassGeo = new THREE.PlaneGeometry(160, 220);
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x245827,
      roughness: 0.9,
      metalness: 0.05
    });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.position.set(0, -0.05, -45);
    grass.receiveShadow = true;
    this.group.add(grass);
  }

  initBumperRails() {
    // Inflatable colorful side bumpers
    const railMat1 = new THREE.MeshStandardMaterial({ color: 0xFF3366, roughness: 0.3 }); // Magenta
    const railMat2 = new THREE.MeshStandardMaterial({ color: 0xFFCC00, roughness: 0.3 }); // Yellow
    const railMat3 = new THREE.MeshStandardMaterial({ color: 0x00E5FF, roughness: 0.3 }); // Cyan

    const materials = [railMat1, railMat2, railMat3];

    // Left and Right bumper sections along track
    const segmentLength = 12;
    const numSegments = 11;
    const startZ = 15;

    for (let i = 0; i < numSegments; i++) {
      const zPos = startZ - (i * segmentLength);
      const mat = materials[i % materials.length];

      // Left Bumper
      const leftBumper = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, segmentLength - 0.5, 12), mat);
      leftBumper.rotation.x = Math.PI / 2;
      leftBumper.position.set(-11.1, 0.5, zPos - segmentLength / 2);
      leftBumper.castShadow = true;
      this.group.add(leftBumper);

      // Right Bumper
      const rightBumper = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, segmentLength - 0.5, 12), mat);
      rightBumper.rotation.x = Math.PI / 2;
      rightBumper.position.set(11.1, 0.5, zPos - segmentLength / 2);
      rightBumper.castShadow = true;
      this.group.add(rightBumper);
    }
  }

  initStartArch() {
    // Start Arch at Z = +4
    const startGroup = new THREE.Group();
    startGroup.position.set(0, 0, 4);

    const archMat = new THREE.MeshStandardMaterial({ color: 0x2979FF, roughness: 0.3 });

    // Left & Right Towers
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 7.5, 16), archMat);
    p1.position.set(-9.2, 3.75, 0);
    startGroup.add(p1);

    const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 7.5, 16), archMat);
    p2.position.set(9.2, 3.75, 0);
    startGroup.add(p2);

    // Crossbar
    const bar = new THREE.Mesh(new THREE.BoxGeometry(19.5, 1.5, 1.5), archMat);
    bar.position.set(0, 7.5, 0);
    startGroup.add(bar);

    // Start Sign
    const startSign = WordDisplay3D.createTextSprite('🚀 START 🚀', 'LAUF SCHNELL!', '#00C853');
    startSign.scale.set(6, 3, 1);
    startSign.position.set(0, 9.8, 0);
    startGroup.add(startSign);

    this.group.add(startGroup);
  }

  initDecorations() {
    // Floating fluffy clouds in the sky
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.2,
      transparent: true,
      opacity: 0.85
    });

    const cloudPositions = [
      [-25, 22, -10],
      [28, 26, -35],
      [-30, 24, -70],
      [26, 20, -95]
    ];

    cloudPositions.forEach(pos => {
      const cloudGroup = new THREE.Group();
      cloudGroup.position.set(pos[0], pos[1], pos[2]);

      const s1 = new THREE.Mesh(new THREE.SphereGeometry(3.2, 8, 8), cloudMat);
      const s2 = new THREE.Mesh(new THREE.SphereGeometry(2.4, 8, 8), cloudMat);
      s2.position.set(2.2, -0.4, 0);
      const s3 = new THREE.Mesh(new THREE.SphereGeometry(2.2, 8, 8), cloudMat);
      s3.position.set(-2.2, -0.5, 0);

      cloudGroup.add(s1);
      cloudGroup.add(s2);
      cloudGroup.add(s3);
      this.group.add(cloudGroup);
    });
  }
}
