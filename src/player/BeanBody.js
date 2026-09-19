import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { CollisionManager } from '../physics/CollisionManager.js';

/**
 * BeanBody (Parts 0201-0210 | PHASE 2: PLAYER MODEL)
 * The complete 3D Bean Character sculpted piece-by-piece:
 * - Part 0201: Yellow Capsule Torso (radius 0.5, length 0.8, 0xFFD700)
 * - Part 0202: Protruding Belly Bump (Sphere 0.55 at (0, -0.1, 0.15) - Fat CJ silhouette)
 * - Part 0203: Round Head (Sphere 0.35 at (0, 0.75, 0))
 * - Part 0204: Cute White Eyes with Black Pupils facing +Z
 * - Part 0205: Torus Smile Mouth at (0, 0.68, 0.3)
 * - Part 0206: Stubby Arms rotated +/-30°
 * - Part 0207: Round Hand spheres in darker yellow
 * - Part 0208: Stubby Legs at (-0.2, -0.65, 0) & (0.2, -0.65, 0)
 * - Part 0209: Bright Red Shoes touching the ground
 * - Part 0210: Berlin Flat Cap (Mütze) tilted casually forward
 */
export class BeanBody {
  /**
   * @param {Object} options
   * @param {string} options.id
   * @param {THREE.Vector3} options.position
   * @param {import('../physics/PhysicsMaterials.js').PhysicsMaterials} options.materials
   */
  constructor(options = {}) {
    this.id = options.id || 'player_bean';
    const initPos = options.position || new THREE.Vector3(0, 1.5, 0);

    // Root Group
    this.mesh = new THREE.Group();
    this.mesh.name = `Bean_${this.id}`;

    // Material References for Customization Swapping (Part 0211-0220)
    this.materials = {
      body: new THREE.MeshStandardMaterial({
        color: 0xFFD700, // Bright golden yellow
        roughness: 0.35,
        metalness: 0.05
      }),
      hands: new THREE.MeshStandardMaterial({
        color: 0xE6C200, // Darker yellow for hands
        roughness: 0.4,
        metalness: 0.05
      }),
      eyes: new THREE.MeshStandardMaterial({
        color: 0xFFFFFF, // White sclera
        roughness: 0.2
      }),
      pupils: new THREE.MeshBasicMaterial({
        color: 0x000000 // Jet black pupils
      }),
      mouth: new THREE.MeshBasicMaterial({
        color: 0x111111 // Dark smile
      }),
      shoes: new THREE.MeshStandardMaterial({
        color: 0xFF3333, // Vibrant red sneakers
        roughness: 0.5,
        metalness: 0.1
      }),
      cap: new THREE.MeshStandardMaterial({
        color: 0x333333, // Dark charcoal gray Berlin cap
        roughness: 0.7,
        metalness: 0.1
      })
    };

    // Build all 10 Body Parts
    this.buildTorso();       // Part 0201
    this.buildBellyBump();   // Part 0202
    this.buildHead();        // Part 0203
    this.buildEyes();        // Part 0204
    this.buildMouth();       // Part 0205
    this.buildArms();        // Part 0206
    this.buildHands();       // Part 0207
    this.buildLegs();        // Part 0208
    this.buildShoes();       // Part 0209
    this.buildFlatCap();     // Part 0210

    // Enable shadows on all child meshes
    this.mesh.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Build Cannon-es Physics Body (Part 0201)
    this.initPhysicsBody(initPos, options.physicsMaterial);
  }

  // --- Part 0201: Main Bean Torso ---
  buildTorso() {
    const torsoGeo = new THREE.CapsuleGeometry(0.5, 0.8, 8, 16);
    this.torsoMesh = new THREE.Mesh(torsoGeo, this.materials.body);
    this.torsoMesh.position.set(0, 0, 0);
    this.mesh.add(this.torsoMesh);
  }

  // --- Part 0202: Cute Protruding Belly Bump ---
  buildBellyBump() {
    const bellyGeo = new THREE.SphereGeometry(0.55, 16, 16);
    this.bellyMesh = new THREE.Mesh(bellyGeo, this.materials.body);
    this.bellyMesh.position.set(0, -0.1, 0.15);
    this.mesh.add(this.bellyMesh);
  }

  // --- Part 0203: Round Head on Top ---
  buildHead() {
    const headGeo = new THREE.SphereGeometry(0.35, 16, 16);
    this.headMesh = new THREE.Mesh(headGeo, this.materials.body);
    this.headMesh.position.set(0, 0.75, 0);
    this.mesh.add(this.headMesh);
  }

  // --- Part 0204: Cute White Eyes with Black Pupils (+Z Direction) ---
  buildEyes() {
    this.eyesGroup = new THREE.Group();

    const eyeGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const pupilGeo = new THREE.SphereGeometry(0.04, 10, 10);

    // Left Eye
    const leftEye = new THREE.Mesh(eyeGeo, this.materials.eyes);
    leftEye.position.set(-0.12, 0.8, 0.28);

    const leftPupil = new THREE.Mesh(pupilGeo, this.materials.pupils);
    leftPupil.position.set(-0.12, 0.8, 0.35);

    // Right Eye
    const rightEye = new THREE.Mesh(eyeGeo, this.materials.eyes);
    rightEye.position.set(0.12, 0.8, 0.28);

    const rightPupil = new THREE.Mesh(pupilGeo, this.materials.pupils);
    rightPupil.position.set(0.12, 0.8, 0.35);

    this.eyesGroup.add(leftEye, leftPupil, rightEye, rightPupil);
    this.mesh.add(this.eyesGroup);
  }

  // --- Part 0205: Friendly Smile Mouth ---
  buildMouth() {
    const mouthGeo = new THREE.TorusGeometry(0.08, 0.02, 8, 16, Math.PI);
    this.mouthMesh = new THREE.Mesh(mouthGeo, this.materials.mouth);
    this.mouthMesh.position.set(0, 0.68, 0.3);
    this.mouthMesh.rotation.set(0, 0, Math.PI); // Invert arc to smile
    this.mesh.add(this.mouthMesh);
  }

  // --- Part 0206: Stubby Arms (Rotated +/-30° on Z) ---
  buildArms() {
    this.armsGroup = new THREE.Group();

    const armGeo = new THREE.CapsuleGeometry(0.12, 0.4, 8, 12);

    // Left Arm (Rotated 30° outward on Z)
    this.leftArm = new THREE.Mesh(armGeo, this.materials.body);
    this.leftArm.position.set(-0.55, 0.2, 0);
    this.leftArm.rotation.z = Math.PI / 6; // 30 deg

    // Right Arm (Rotated -30° outward on Z)
    this.rightArm = new THREE.Mesh(armGeo, this.materials.body);
    this.rightArm.position.set(0.55, 0.2, 0);
    this.rightArm.rotation.z = -Math.PI / 6; // -30 deg

    this.armsGroup.add(this.leftArm, this.rightArm);
    this.mesh.add(this.armsGroup);
  }

  // --- Part 0207: Round Hand Spheres ---
  buildHands() {
    this.handsGroup = new THREE.Group();

    const handGeo = new THREE.SphereGeometry(0.13, 12, 12);

    this.leftHand = new THREE.Mesh(handGeo, this.materials.hands);
    this.leftHand.position.set(-0.75, 0.0, 0);

    this.rightHand = new THREE.Mesh(handGeo, this.materials.hands);
    this.rightHand.position.set(0.75, 0.0, 0);

    this.handsGroup.add(this.leftHand, this.rightHand);
    this.mesh.add(this.handsGroup);
  }

  // --- Part 0208: Stubby Legs ---
  buildLegs() {
    this.legsGroup = new THREE.Group();

    const legGeo = new THREE.CapsuleGeometry(0.15, 0.3, 8, 12);

    this.leftLeg = new THREE.Mesh(legGeo, this.materials.body);
    this.leftLeg.position.set(-0.2, -0.65, 0);

    this.rightLeg = new THREE.Mesh(legGeo, this.materials.body);
    this.rightLeg.position.set(0.2, -0.65, 0);

    this.legsGroup.add(this.leftLeg, this.rightLeg);
    this.mesh.add(this.legsGroup);
  }

  // --- Part 0209: Bright Red Shoes ---
  buildShoes() {
    this.shoesGroup = new THREE.Group();

    const shoeGeo = new THREE.BoxGeometry(0.2, 0.12, 0.3);

    this.leftShoe = new THREE.Mesh(shoeGeo, this.materials.shoes);
    this.leftShoe.position.set(-0.2, -0.85, 0.05);

    this.rightShoe = new THREE.Mesh(shoeGeo, this.materials.shoes);
    this.rightShoe.position.set(0.2, -0.85, 0.05);

    this.shoesGroup.add(this.leftShoe, this.rightShoe);
    this.mesh.add(this.shoesGroup);
  }

  // --- Part 0210: Berlin Flat Cap (Mütze) ---
  buildFlatCap() {
    this.capGroup = new THREE.Group();

    // Cap dome
    const capDomeGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.1, 16);
    const capDome = new THREE.Mesh(capDomeGeo, this.materials.cap);
    capDome.position.set(0, 1.05, 0);
    capDome.rotation.x = -0.2; // Tilted forward

    // Cap brim
    const brimGeo = new THREE.BoxGeometry(0.25, 0.02, 0.15);
    const brim = new THREE.Mesh(brimGeo, this.materials.cap);
    brim.position.set(0, 1.0, 0.18);
    brim.rotation.x = -0.15;

    this.capGroup.add(capDome, brim);
    this.mesh.add(this.capGroup);
  }

  // --- Physics Setup (Part 0201) ---
  initPhysicsBody(pos, material) {
    this.body = new CANNON.Body({
      mass: 1.0,
      shape: new CANNON.Sphere(0.6), // Sphere collider (radius 0.6)
      position: new CANNON.Vec3(pos.x, pos.y, pos.z),
      material: material || undefined,
      linearDamping: 0.3,
      angularDamping: 0.95
    });

    // Keep bean standing upright (lock rotation around X and Z axes for stable movement)
    this.body.angularFactor.set(0, 1, 0);

    // Tag physics body for CollisionManager (Part 0101-0120)
    CollisionManager.tagBody(this.body, {
      type: 'bean',
      id: this.id
    });

    this.syncWithPhysics();
  }

  /**
   * Synchronize Three.js visual mesh with Cannon.js physics body
   */
  syncWithPhysics() {
    if (!this.body || !this.mesh) return;
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  }
}
