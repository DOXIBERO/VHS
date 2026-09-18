import * as THREE from 'three';

export class BeanBody {
  constructor(scene, initialPosition = [0, 0, 0], options = {}) {
    this.scene = scene;
    this.options = {
      skinColor: options.skinColor || 0xFFD700, // Default Fall Guy Yellow
      capColor: options.capColor || 0x333333,   // Default Berlin Flat Cap Gray
      shoeColor: options.shoeColor || 0xFF3333, // Default Red Shoes
      hasChain: options.hasChain !== undefined ? options.hasChain : true,
      name: options.name || 'PlayerBean'
    };

    this.group = new THREE.Group();
    this.group.name = this.options.name;
    this.position = this.group.position;
    this.rotation = this.group.rotation;

    // Movement & state variables
    this.velocity = new THREE.Vector3();
    this.isGrounded = true;
    this.jumpForce = 8;
    this.gravity = 22;
    this.moveSpeed = 7;

    this.initModel();

    this.group.position.set(initialPosition[0], initialPosition[1], initialPosition[2]);
    scene.add(this.group);
  }

  initModel() {
    // Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: this.options.skinColor,
      roughness: 0.35,
      metalness: 0.05
    });

    const handMat = new THREE.MeshStandardMaterial({
      color: this.options.skinColor,
      roughness: 0.45
    });

    const shoeMat = new THREE.MeshStandardMaterial({
      color: this.options.shoeColor,
      roughness: 0.4
    });

    const eyeWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.1
    });

    const pupilBlackMat = new THREE.MeshBasicMaterial({
      color: 0x111111
    });

    const capMat = new THREE.MeshStandardMaterial({
      color: this.options.capColor,
      roughness: 0.8
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xFFD700,
      metalness: 0.9,
      roughness: 0.15
    });

    // 1. Torso Capsule (Part 0201)
    const torsoGeo = new THREE.CapsuleGeometry(0.5, 0.7, 8, 16);
    this.torso = new THREE.Mesh(torsoGeo, skinMat);
    this.torso.position.y = 0.85;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    // 2. Belly Bump (Part 0202)
    const bellyGeo = new THREE.SphereGeometry(0.52, 16, 16);
    this.belly = new THREE.Mesh(bellyGeo, skinMat);
    this.belly.position.set(0, -0.05, 0.12);
    this.torso.add(this.belly);

    // 3. Head (Part 0203)
    const headGeo = new THREE.SphereGeometry(0.38, 16, 16);
    this.head = new THREE.Mesh(headGeo, skinMat);
    this.head.position.set(0, 0.55, 0);
    this.torso.add(this.head);

    // 4. Eyes & Pupils (Part 0204)
    const eyeGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const pupilGeo = new THREE.SphereGeometry(0.045, 8, 8);

    // Left Eye
    this.leftEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    this.leftEye.position.set(-0.13, 0.1, 0.32);
    const leftPupil = new THREE.Mesh(pupilGeo, pupilBlackMat);
    leftPupil.position.set(0, 0, 0.05);
    this.leftEye.add(leftPupil);
    this.head.add(this.leftEye);

    // Right Eye
    this.rightEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    this.rightEye.position.set(0.13, 0.1, 0.32);
    const rightPupil = new THREE.Mesh(pupilGeo, pupilBlackMat);
    rightPupil.position.set(0, 0, 0.05);
    this.rightEye.add(rightPupil);
    this.head.add(this.rightEye);

    // 5. Smiling Mouth (Part 0205)
    const mouthGeo = new THREE.TorusGeometry(0.07, 0.018, 8, 16, Math.PI);
    this.mouth = new THREE.Mesh(mouthGeo, pupilBlackMat);
    this.mouth.position.set(0, -0.06, 0.36);
    this.mouth.rotation.x = Math.PI; // Smile shape
    this.head.add(this.mouth);

    // 6. Arms & Ball Hands (Parts 0206-0207)
    const armGeo = new THREE.CapsuleGeometry(0.11, 0.35, 6, 12);
    const handGeo = new THREE.SphereGeometry(0.12, 12, 12);

    // Left Arm
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.55, 0.15, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, skinMat);
    leftArmMesh.rotation.z = 0.4;
    leftArmMesh.position.y = -0.15;
    this.leftArm.add(leftArmMesh);
    const leftHand = new THREE.Mesh(handGeo, handMat);
    leftHand.position.set(-0.1, -0.32, 0);
    this.leftArm.add(leftHand);
    this.torso.add(this.leftArm);

    // Right Arm
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.55, 0.15, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, skinMat);
    rightArmMesh.rotation.z = -0.4;
    rightArmMesh.position.y = -0.15;
    this.rightArm.add(rightArmMesh);
    const rightHand = new THREE.Mesh(handGeo, handMat);
    rightHand.position.set(0.1, -0.32, 0);
    this.rightArm.add(rightHand);
    this.torso.add(this.rightArm);

    // 7. Stubby Legs & Red Shoes (Parts 0208-0209)
    const legGeo = new THREE.CapsuleGeometry(0.14, 0.25, 6, 12);
    const shoeGeo = new THREE.BoxGeometry(0.2, 0.14, 0.32);

    // Left Leg
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.22, -0.45, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, skinMat);
    leftLegMesh.position.y = -0.1;
    this.leftLeg.add(leftLegMesh);
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(0, -0.25, 0.05);
    leftShoe.castShadow = true;
    this.leftLeg.add(leftShoe);
    this.torso.add(this.leftLeg);

    // Right Leg
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.22, -0.45, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, skinMat);
    rightLegMesh.position.y = -0.1;
    this.rightLeg.add(rightLegMesh);
    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0, -0.25, 0.05);
    rightShoe.castShadow = true;
    this.rightLeg.add(rightShoe);
    this.torso.add(this.rightLeg);

    // 8. Berlin Flat Cap (Part 0210)
    const capBaseGeo = new THREE.CylinderGeometry(0.28, 0.36, 0.12, 16);
    this.cap = new THREE.Mesh(capBaseGeo, capMat);
    this.cap.position.set(0, 0.36, 0.02);
    this.cap.rotation.x = -0.2; // Tilted forward
    const capBrimGeo = new THREE.BoxGeometry(0.28, 0.03, 0.18);
    const capBrim = new THREE.Mesh(capBrimGeo, capMat);
    capBrim.position.set(0, -0.04, 0.2);
    this.cap.add(capBrim);
    this.head.add(this.cap);

    // 9. Gold Chain Accessory (Part 0221)
    if (this.options.hasChain) {
      const chainGeo = new THREE.TorusGeometry(0.32, 0.025, 8, 24);
      this.chain = new THREE.Mesh(chainGeo, goldMat);
      this.chain.position.set(0, 0.3, 0.1);
      this.chain.rotation.x = Math.PI / 2.8;
      this.torso.add(this.chain);
    }
  }

  jump() {
    if (this.isGrounded) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
    }
  }

  reset(x = 0, y = 0, z = 0) {
    this.group.position.set(x, y, z);
    this.velocity.set(0, 0, 0);
    this.group.rotation.set(0, Math.PI, 0);
    this.isGrounded = true;
  }

  update(dt, inputVector, cameraAngle = 0) {
    // 1. Movement Physics relative to Camera Angle
    if (inputVector && (inputVector.x !== 0 || inputVector.y !== 0)) {
      // theta = 0 means camera is at +Z looking towards -Z.
      // input.y = 1 (forward) -> worldDirZ = -1 (moving into track)
      const worldDirX = inputVector.x * Math.cos(cameraAngle) - inputVector.y * Math.sin(cameraAngle);
      const worldDirZ = -inputVector.x * Math.sin(cameraAngle) - inputVector.y * Math.cos(cameraAngle);

      this.group.position.x += worldDirX * this.moveSpeed * dt;
      this.group.position.z += worldDirZ * this.moveSpeed * dt;

      // Restrict bean to track width (-10 to +10)
      this.group.position.x = Math.max(-10.2, Math.min(10.2, this.group.position.x));

      // Smooth rotation toward movement direction
      const targetRotation = Math.atan2(worldDirX, worldDirZ);
      let diff = targetRotation - this.group.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.group.rotation.y += diff * 0.22;
    }

    // 2. Vertical Physics (Gravity & Jump)
    this.velocity.y -= this.gravity * dt;
    this.group.position.y += this.velocity.y * dt;

    if (this.group.position.y <= 0) {
      this.group.position.y = 0;
      this.velocity.y = 0;
      this.isGrounded = true;
    }
  }
}
