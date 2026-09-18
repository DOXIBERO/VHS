import * as THREE from 'three';
import {
  CharacterInstance,
  CharacterColorPalette,
  CharacterAnimationState,
  JointHierarchy,
  FaceRig,
  PAINT_LOTTERY_COLORS,
} from '../types/character';

// Helper to generate a unified, fused body texture where the lighter belly oval
// is painted directly into the body texture (ZERO extra layers, ZERO clipping!)
export function createFusedBeanBodyTexture(bodyHex: number, bellyHex: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Fill base body color
  const bodyHexStr = '#' + bodyHex.toString(16).padStart(6, '0');
  ctx.fillStyle = bodyHexStr;
  ctx.fillRect(0, 0, 1024, 1024);

  // In CapsuleGeometry UV space: U=0.5 is front center, V=0.3-0.6 is belly area
  const cx = 512;
  const cy = 520;
  const rx = 210;
  const ry = 240;

  // Soft organic gradient from belly color to body color
  const bellyHexStr = '#' + bellyHex.toString(16).padStart(6, '0');
  const grad = ctx.createRadialGradient(cx, cy, rx * 0.35, cx, cy, rx);
  grad.addColorStop(0, bellyHexStr);
  grad.addColorStop(0.85, bellyHexStr);
  grad.addColorStop(1, bodyHexStr);

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Helper to create continuous, articulated cartoon noodle limb segments with spherical joint knuckles
// (ZERO gloves, ZERO sneakers, ZERO fingers! Smooth, bendy cartoon noodle tails with rounded tips)
export function createArticulatedLimbSegment(
  radiusTop: number,
  radiusBot: number,
  length: number,
  material: THREE.Material,
  includeKnuckleSphere: boolean = true,
  includeRoundedTip: boolean = false
): THREE.Group {
  const group = new THREE.Group();

  // 1. Spherical joint knuckle cap at pivot (0, 0, 0)
  if (includeKnuckleSphere) {
    const knuckleGeo = new THREE.SphereGeometry(radiusTop * 1.02, 16, 16);
    const knuckleMesh = new THREE.Mesh(knuckleGeo, material);
    knuckleMesh.castShadow = true;
    knuckleMesh.receiveShadow = true;
    group.add(knuckleMesh);
  }

  // 2. Smooth tapering cylinder along -Y axis
  const cylGeo = new THREE.CylinderGeometry(radiusBot, radiusTop, length, 16);
  cylGeo.translate(0, -length / 2, 0);
  const cylMesh = new THREE.Mesh(cylGeo, material);
  cylMesh.castShadow = true;
  cylMesh.receiveShadow = true;
  group.add(cylMesh);

  // 3. Soft rounded tip nub at the end of the limb (e.g. hand or foot tip)
  if (includeRoundedTip) {
    const tipBallGeo = new THREE.SphereGeometry(radiusBot * 1.15, 16, 16);
    const tipMesh = new THREE.Mesh(tipBallGeo, material);
    tipMesh.position.set(0, -length, 0);
    tipMesh.castShadow = true;
    tipMesh.receiveShadow = true;
    group.add(tipMesh);
  }

  return group;
}

// Draw procedural cartoon mouth onto dynamic canvas with continuous blendshapes
export function drawCartoonMouth(
  ctx: CanvasRenderingContext2D,
  type: 'smile' | 'open_o' | 'sip' | 'choke' | 'grin' | 'shock' | 'laugh' | 'talk',
  param: number = 0,
  jawOpen: number = 0
) {
  ctx.clearRect(0, 0, 256, 256);
  ctx.save();
  ctx.translate(128, 128);

  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#1e293b';

  switch (type) {
    case 'smile': {
      const open = Math.max(0, Math.min(1, jawOpen));
      if (open > 0.15) {
        // Open smiling mouth cavity
        ctx.beginPath();
        ctx.moveTo(-45, -12);
        ctx.quadraticCurveTo(0, 15 + open * 45, 45, -12);
        ctx.closePath();
        ctx.fillStyle = '#881337';
        ctx.fill();
        ctx.stroke();

        // White upper teeth
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.rect(-32, -12, 64, 10);
        ctx.fill();

        // Cute pink tongue
        ctx.beginPath();
        ctx.ellipse(0, 12 + open * 25, 24, 14 * open, 0, 0, Math.PI);
        ctx.fillStyle = '#fb7185';
        ctx.fill();
      } else {
        // Classic cartoon curved line smile
        ctx.beginPath();
        ctx.arc(0, -15, 45, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();
        // End dimples
        ctx.beginPath();
        ctx.arc(-35, 12, 6, 0, Math.PI * 2);
        ctx.arc(35, 12, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
      }
      break;
    }
    case 'sip': {
      // Moroccan tea sipping mouth (pursed lips touching the glass rim)
      const sipPulse = 18 + Math.sin(param * 12) * 2;
      ctx.beginPath();
      ctx.ellipse(0, 8, sipPulse, sipPulse * 1.15, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#450a0a';
      ctx.fill();
      ctx.stroke();

      // Outer pursed lip creases
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(-sipPulse - 10, 4);
      ctx.quadraticCurveTo(-sipPulse - 2, 8, -sipPulse - 10, 12);
      ctx.moveTo(sipPulse + 10, 4);
      ctx.quadraticCurveTo(sipPulse + 2, 8, sipPulse + 10, 12);
      ctx.stroke();

      // Tiny shiny highlight on lower lip
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(sipPulse * 0.35, 8 + sipPulse * 0.45, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'open_o': {
      const open = Math.max(0.2, Math.min(1.5, jawOpen > 0 ? jawOpen : 0.8));
      const rx = 24 + Math.sin(param * 10) * 3;
      const ry = (26 + Math.cos(param * 10) * 4) * open;
      ctx.beginPath();
      ctx.ellipse(0, 6, rx, ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#3b0764';
      ctx.fill();
      ctx.stroke();

      // White teeth peek
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-rx * 0.6, 6 - ry + 4, rx * 1.2, 8);

      // Pink tongue at bottom
      ctx.beginPath();
      ctx.ellipse(0, 6 + ry - 10, rx * 0.65, 12, 0, 0, Math.PI);
      ctx.fillStyle = '#f43f5e';
      ctx.fill();
      break;
    }
    case 'choke': {
      // Organic cartoon choking/gagging mouth with distress wobble and protruding tongue
      const wobble = Math.sin(param * 20) * 6;
      const open = Math.max(0.6, Math.min(1.4, jawOpen > 0 ? jawOpen : 1.0));

      ctx.beginPath();
      ctx.moveTo(-50, -5 + wobble);
      ctx.quadraticCurveTo(-15, 20 + open * 25, 0, 15 + open * 20);
      ctx.quadraticCurveTo(25, 20 + open * 25, 50, -5 - wobble);
      ctx.quadraticCurveTo(15, -25, 0, -20);
      ctx.quadraticCurveTo(-25, -25, -50, -5 + wobble);
      ctx.closePath();
      ctx.fillStyle = '#450a0a';
      ctx.fill();
      ctx.stroke();

      // Distressed clenched teeth marks
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-42, -14, 12, 10);
      ctx.fillRect(30, -14, 12, 10);

      // Protruding gagging tongue drooping forward
      const tongueBounce = Math.sin(param * 25) * 8;
      ctx.beginPath();
      ctx.ellipse(wobble * 0.5, 30 + open * 22 + tongueBounce, 22, 28, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#f43f5e';
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.stroke();

      // Tongue midline
      ctx.beginPath();
      ctx.moveTo(wobble * 0.5, 15 + open * 22);
      ctx.lineTo(wobble * 0.5, 45 + open * 22 + tongueBounce);
      ctx.stroke();
      break;
    }
    case 'grin': {
      ctx.beginPath();
      ctx.moveTo(-55, -10);
      ctx.quadraticCurveTo(0, 65, 55, -10);
      ctx.closePath();
      ctx.fillStyle = '#881337';
      ctx.fill();
      ctx.stroke();
      // White top teeth
      ctx.beginPath();
      ctx.moveTo(-45, -8);
      ctx.lineTo(45, -8);
      ctx.lineTo(38, 8);
      ctx.lineTo(-38, 8);
      ctx.closePath();
      ctx.fillStyle = '#f8fafc';
      ctx.fill();
      // Pink tongue
      ctx.beginPath();
      ctx.ellipse(0, 38, 30, 16, 0, 0, Math.PI);
      ctx.fillStyle = '#fb7185';
      ctx.fill();
      break;
    }
    case 'shock': {
      const shake = Math.sin(param * 35) * 6;
      ctx.beginPath();
      ctx.ellipse(shake, 10, 38, 48, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#1e1b4b';
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-26 + shake, -20, 12, 10);
      ctx.fillRect(-10 + shake, -22, 12, 12);
      ctx.fillRect(6 + shake, -22, 12, 12);
      ctx.fillRect(20 + shake, -20, 12, 10);
      break;
    }
    case 'laugh': {
      const bounce = Math.sin(param * 20) * 8;
      ctx.beginPath();
      ctx.moveTo(-50, -15);
      ctx.quadraticCurveTo(0, 70 + bounce, 50, -15);
      ctx.closePath();
      ctx.fillStyle = '#881337';
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-35, -14, 70, 14);
      ctx.beginPath();
      ctx.ellipse(0, 35 + bounce * 0.5, 28, 18, 0, 0, Math.PI);
      ctx.fillStyle = '#f43f5e';
      ctx.fill();
      break;
    }
    case 'talk': {
      const openness = 15 + Math.abs(Math.sin(param * 12)) * (jawOpen > 0 ? jawOpen * 30 : 25);
      ctx.beginPath();
      ctx.ellipse(0, 0, 32, openness, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#3b0764';
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-22, -openness + 4, 44, 8);
      ctx.beginPath();
      ctx.ellipse(0, openness - 6, 18, 8, 0, 0, Math.PI);
      ctx.fillStyle = '#fb7185';
      ctx.fill();
      break;
    }
  }

  ctx.restore();
}

export function createCharacterInstance(
  playerIndex: number = 0,
  paletteOverride?: CharacterColorPalette
): CharacterInstance {
  const palette =
    paletteOverride ??
    PAINT_LOTTERY_COLORS[playerIndex % PAINT_LOTTERY_COLORS.length];

  const rootGroup = new THREE.Group();
  rootGroup.userData = { playerIndex };

  // --- 1. SHARED MATERIALS ---
  // Unified body texture: belly oval is painted directly on the texture canvas!
  const fusedBodyTexture = createFusedBeanBodyTexture(palette.bodyColor, palette.bellyColor);

  const bodyMaterial = new THREE.MeshStandardMaterial({
    map: fusedBodyTexture,
    roughness: 0.52,
    metalness: 0.04,
  });

  // Limbs material (Exact same color and material as the body)
  const limbMaterial = new THREE.MeshStandardMaterial({
    color: palette.bodyColor,
    roughness: 0.52,
    metalness: 0.04,
  });

  // Eye materials
  const eyeWhiteMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.15,
    metalness: 0.02,
  });

  const pupilMaterial = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    roughness: 0.05,
    metalness: 0.10,
  });

  const eyebrowMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.6,
  });

  const blushMaterial = new THREE.MeshBasicMaterial({
    color: 0xf43f5e,
    transparent: true,
    opacity: 0.38,
  });

  // Dynamic canvas mouth texture
  const mouthCanvas = document.createElement('canvas');
  mouthCanvas.width = 256;
  mouthCanvas.height = 256;
  const mouthCtx = mouthCanvas.getContext('2d')!;
  drawCartoonMouth(mouthCtx, 'smile');
  const mouthTexture = new THREE.CanvasTexture(mouthCanvas);
  const mouthMaterial = new THREE.MeshBasicMaterial({
    map: mouthTexture,
    transparent: true,
    side: THREE.DoubleSide,
  });

  // --- 2. SKELETAL JOINT HIERARCHY (المفاصل) ---
  const pelvisJoint = new THREE.Group();
  pelvisJoint.name = 'joint_pelvis';
  rootGroup.add(pelvisJoint);

  const spineJoint = new THREE.Group();
  spineJoint.name = 'joint_spine';
  pelvisJoint.add(spineJoint);

  const chestJoint = new THREE.Group();
  chestJoint.name = 'joint_chest';
  spineJoint.add(chestJoint);

  const neckJoint = new THREE.Group();
  neckJoint.name = 'joint_neck';
  chestJoint.add(neckJoint);

  const headGroup = new THREE.Group();
  headGroup.name = 'group_head';
  neckJoint.add(headGroup);

  // Left Arm Chain (Rubbery Cat/Leopard Tail Chain)
  const leftClavicle = new THREE.Group();
  leftClavicle.name = 'joint_leftClavicle';
  chestJoint.add(leftClavicle);

  const leftShoulder = new THREE.Group();
  leftShoulder.name = 'joint_leftShoulder';
  leftClavicle.add(leftShoulder);

  const leftElbow = new THREE.Group();
  leftElbow.name = 'joint_leftElbow';
  leftShoulder.add(leftElbow);

  const leftWrist = new THREE.Group();
  leftWrist.name = 'joint_leftWrist';
  leftElbow.add(leftWrist);

  const leftArmSeg3 = new THREE.Group();
  leftArmSeg3.name = 'joint_leftArmSeg3';
  leftWrist.add(leftArmSeg3);

  const leftHand = new THREE.Group();
  leftHand.name = 'group_leftHand';
  leftArmSeg3.add(leftHand);

  // Right Arm Chain (Rubbery Cat/Leopard Tail Chain)
  const rightClavicle = new THREE.Group();
  rightClavicle.name = 'joint_rightClavicle';
  chestJoint.add(rightClavicle);

  const rightShoulder = new THREE.Group();
  rightShoulder.name = 'joint_rightShoulder';
  rightClavicle.add(rightShoulder);

  const rightElbow = new THREE.Group();
  rightElbow.name = 'joint_rightElbow';
  rightShoulder.add(rightElbow);

  const rightWrist = new THREE.Group();
  rightWrist.name = 'joint_rightWrist';
  rightElbow.add(rightWrist);

  const rightArmSeg3 = new THREE.Group();
  rightArmSeg3.name = 'joint_rightArmSeg3';
  rightWrist.add(rightArmSeg3);

  const rightHand = new THREE.Group();
  rightHand.name = 'group_rightHand';
  rightArmSeg3.add(rightHand);

  // Left Leg Chain (Short Cute Dangling Noodle Tail)
  const leftHip = new THREE.Group();
  leftHip.name = 'joint_leftHip';
  pelvisJoint.add(leftHip);

  const leftKnee = new THREE.Group();
  leftKnee.name = 'joint_leftKnee';
  leftHip.add(leftKnee);

  const leftAnkle = new THREE.Group();
  leftAnkle.name = 'joint_leftAnkle';
  leftKnee.add(leftAnkle);

  const leftFoot = new THREE.Group();
  leftFoot.name = 'group_leftFoot';
  leftAnkle.add(leftFoot);

  // Right Leg Chain (Short Cute Dangling Noodle Tail)
  const rightHip = new THREE.Group();
  rightHip.name = 'joint_rightHip';
  pelvisJoint.add(rightHip);

  const rightKnee = new THREE.Group();
  rightKnee.name = 'joint_rightKnee';
  rightHip.add(rightKnee);

  const rightAnkle = new THREE.Group();
  rightAnkle.name = 'joint_rightAnkle';
  rightKnee.add(rightAnkle);

  const rightFoot = new THREE.Group();
  rightFoot.name = 'group_rightFoot';
  rightAnkle.add(rightFoot);

  // --- 3. PROPORTIONS & REST JOINT POSITIONS ---
  // Cushion top is at y = 0.48m. Pelvis sits resting ON the cushion at y = 0.485m (NEVER sinking into sponge!)
  pelvisJoint.position.set(0, 0.485, 0.02);

  // Spine and Chest
  spineJoint.position.set(0, 0.12, 0);
  chestJoint.position.set(0, 0.14, 0);
  neckJoint.position.set(0, 0.12, 0);
  headGroup.position.set(0, 0.105, 0);

  // Cat/Leopard flexible tail arm segments
  const armSegLen = 0.08; // 4 segments * 0.08m = 0.32m total length
  const r0 = 0.028; // shoulder base
  const r1 = 0.024;
  const r2 = 0.020;
  const r3 = 0.016;
  const rTip = 0.013; // rounded tip nub

  leftClavicle.position.set(-0.045, 0.12, 0);
  leftShoulder.position.set(-0.120, 0, 0); // Net X = -0.165m (exact cylinder surface)
  leftElbow.position.set(0, -armSegLen, 0);
  leftWrist.position.set(0, -armSegLen, 0);
  leftArmSeg3.position.set(0, -armSegLen, 0);
  leftHand.position.set(0, -armSegLen, 0);

  rightClavicle.position.set(0.045, 0.12, 0);
  rightShoulder.position.set(0.120, 0, 0); // Net X = +0.165m (exact cylinder surface)
  rightElbow.position.set(0, -armSegLen, 0);
  rightWrist.position.set(0, -armSegLen, 0);
  rightArmSeg3.position.set(0, -armSegLen, 0);
  rightHand.position.set(0, -armSegLen, 0);

  // Legs emerging directly from the lower front surface of the bean body (matching screenshot)
  const legRadiusTop = 0.026;
  const legRadiusTip = 0.020;
  const thighLen = 0.105; // Extends horizontally right on top of red cushion to front edge
  const calfLen = 0.085;  // Dangles vertically down off front cushion edge
  const hipSpan = 0.065;

  leftHip.position.set(-hipSpan, 0.04, 0.125);
  leftKnee.position.set(0, -thighLen, 0);
  leftAnkle.position.set(0, -calfLen, 0);

  rightHip.position.set(hipSpan, 0.04, 0.125);
  rightKnee.position.set(0, -thighLen, 0);
  rightAnkle.position.set(0, -calfLen, 0);

  // --- 4. CONTINUOUS CARTOON BEAN BODY & ARTICULATED HEAD DOME ---
  // Torso sits on pelvisJoint (from y=0 to y=0.420m) with integrated belly texture.
  // Head dome sits directly on headGroup (radius = 0.165m, centered at (0,0,0) of headGroup).
  // Because eyes, eyebrows, cheeks, and mouth are all children of headGroup flush on headDomeMesh,
  // when the head tilts back or turns in ANY animation, the head dome moves in 100% lockstep with them.
  // It is geometrically impossible for the face to sink inside the body!
  const beanBodyRadius = 0.165;
  const torsoCapsuleLength = 0.09; // Middle cylinder length
  const torsoCapsuleTotalH = torsoCapsuleLength + 2 * beanBodyRadius; // 0.420m
  const torsoCenterOffsetY = torsoCapsuleTotalH / 2; // 0.210m

  const torsoGeo = new THREE.CapsuleGeometry(beanBodyRadius, torsoCapsuleLength, 24, 24);
  torsoGeo.translate(0, torsoCenterOffsetY, 0);

  const bodyMesh = new THREE.Mesh(torsoGeo, bodyMaterial);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  pelvisJoint.add(bodyMesh);

  // Articulated Head Dome (Sphere bound to headGroup, perfectly continuing the bean silhouette)
  const headGeo = new THREE.SphereGeometry(beanBodyRadius, 24, 24);
  const headMaterial = new THREE.MeshStandardMaterial({
    color: palette.bodyColor,
    roughness: 0.52,
    metalness: 0.04,
  });
  const headDomeMesh = new THREE.Mesh(headGeo, headMaterial);
  headDomeMesh.castShadow = true;
  headDomeMesh.receiveShadow = true;
  headGroup.add(headDomeMesh);

  // --- 5. EXPRESSIVE CARTOON FACE (Bound to headGroup, flush on head dome surface) ---
  const eyeRadius = 0.036;
  const eyeGeo = new THREE.SphereGeometry(eyeRadius, 18, 18);
  eyeGeo.scale(1.0, 1.15, 0.45); // Clean cartoon oval, comfortable depth

  const eyeLeft = new THREE.Mesh(eyeGeo, eyeWhiteMaterial);
  eyeLeft.position.set(-0.046, 0.035, 0.156);
  headGroup.add(eyeLeft);

  const eyeRight = new THREE.Mesh(eyeGeo, eyeWhiteMaterial);
  eyeRight.position.set(0.046, 0.035, 0.156);
  headGroup.add(eyeRight);

  // Glossy dark pupils
  const pupilRadius = 0.018;
  const pupilGeo = new THREE.SphereGeometry(pupilRadius, 14, 14);
  pupilGeo.scale(1.0, 1.1, 0.4);

  const pupilLeft = new THREE.Mesh(pupilGeo, pupilMaterial);
  pupilLeft.position.set(0, 0, 0.010);
  eyeLeft.add(pupilLeft);

  const pupilRight = new THREE.Mesh(pupilGeo, pupilMaterial);
  pupilRight.position.set(0, 0, 0.010);
  eyeRight.add(pupilRight);

  // White pupil catchlight gleams
  const gleamGeo = new THREE.SphereGeometry(0.006, 8, 8);
  const gleamMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const gleamL = new THREE.Mesh(gleamGeo, gleamMat);
  gleamL.position.set(0.005, 0.006, 0.010);
  pupilLeft.add(gleamL);

  const gleamR = new THREE.Mesh(gleamGeo, gleamMat);
  gleamR.position.set(0.005, 0.006, 0.010);
  pupilRight.add(gleamR);

  // Expressive eyebrows
  const browGeo = new THREE.BoxGeometry(0.036, 0.008, 0.010);
  const browLeft = new THREE.Mesh(browGeo, eyebrowMaterial);
  browLeft.position.set(-0.046, 0.080, 0.142);
  browLeft.rotation.z = -0.08;
  headGroup.add(browLeft);

  const browRight = new THREE.Mesh(browGeo, eyebrowMaterial);
  browRight.position.set(0.046, 0.080, 0.142);
  browRight.rotation.z = 0.08;
  headGroup.add(browRight);

  // Blushing cheeks (حنيكات حمرين)
  const cheeks = new THREE.Group();
  const blushGeo = new THREE.CircleGeometry(0.022, 16);

  const blushLeft = new THREE.Mesh(blushGeo, blushMaterial);
  blushLeft.position.set(-0.095, -0.010, 0.138);
  blushLeft.rotation.y = -0.55;
  cheeks.add(blushLeft);

  const blushRight = new THREE.Mesh(blushGeo, blushMaterial);
  blushRight.position.set(0.095, -0.010, 0.138);
  blushRight.rotation.y = 0.55;
  cheeks.add(blushRight);
  headGroup.add(cheeks);

  // Dynamic canvas mouth mesh (Flush with front surface)
  const mouthPlaneGeo = new THREE.PlaneGeometry(0.12, 0.12);
  const mouthMesh = new THREE.Mesh(mouthPlaneGeo, mouthMaterial);
  mouthMesh.position.set(0, -0.035, 0.164);
  headGroup.add(mouthMesh);

  // Animated throat swallow bulge (تفاحة آدم)
  const throatGeo = new THREE.SphereGeometry(0.018, 12, 12);
  throatGeo.scale(1.1, 0.8, 1.2);
  const throatBulgeMesh = new THREE.Mesh(throatGeo, limbMaterial);
  throatBulgeMesh.position.set(0, -0.015, 0.12);
  throatBulgeMesh.visible = false;
  neckJoint.add(throatBulgeMesh);

  // --- 6. CONTINUOUS ARTICULATED CARTOON ARMS & LEGS ("أطراف ناعمة متصلة بمفاصل كروية") ---
  // Left arm articulated segments
  const leftUpperArmMesh = createArticulatedLimbSegment(r0, r1, armSegLen, limbMaterial, true, false);
  leftShoulder.add(leftUpperArmMesh);
  const leftMidArmMesh = createArticulatedLimbSegment(r1, r2, armSegLen, limbMaterial, true, false);
  leftElbow.add(leftMidArmMesh);
  const leftForearmMesh = createArticulatedLimbSegment(r2, r3, armSegLen, limbMaterial, true, false);
  leftWrist.add(leftForearmMesh);
  const leftHandMesh = createArticulatedLimbSegment(r3, rTip, armSegLen, limbMaterial, true, true);
  leftArmSeg3.add(leftHandMesh);

  // Right arm articulated segments
  const rightUpperArmMesh = createArticulatedLimbSegment(r0, r1, armSegLen, limbMaterial, true, false);
  rightShoulder.add(rightUpperArmMesh);
  const rightMidArmMesh = createArticulatedLimbSegment(r1, r2, armSegLen, limbMaterial, true, false);
  rightElbow.add(rightMidArmMesh);
  const rightForearmMesh = createArticulatedLimbSegment(r2, r3, armSegLen, limbMaterial, true, false);
  rightWrist.add(rightForearmMesh);
  const rightHandMesh = createArticulatedLimbSegment(r3, rTip, armSegLen, limbMaterial, true, true);
  rightArmSeg3.add(rightHandMesh);

  const leftArmChain: THREE.Group[] = [leftShoulder, leftElbow, leftWrist, leftArmSeg3, leftHand];
  const rightArmChain: THREE.Group[] = [rightShoulder, rightElbow, rightWrist, rightArmSeg3, rightHand];

  // Soft Continuous Legs (NO creased joint balls)
  const leftThighMesh = createArticulatedLimbSegment(legRadiusTop, legRadiusTip, thighLen, limbMaterial, true, false);
  leftHip.add(leftThighMesh);
  const leftCalfMesh = createArticulatedLimbSegment(legRadiusTip, legRadiusTip * 0.9, calfLen, limbMaterial, true, true);
  leftKnee.add(leftCalfMesh);

  const rightThighMesh = createArticulatedLimbSegment(legRadiusTop, legRadiusTip, thighLen, limbMaterial, true, false);
  rightHip.add(rightThighMesh);
  const rightCalfMesh = createArticulatedLimbSegment(legRadiusTip, legRadiusTip * 0.9, calfLen, limbMaterial, true, true);
  rightKnee.add(rightCalfMesh);

  // --- 7. SKELETON DEBUG VISUALIZER ---
  const skeletonHelper = new THREE.Group();
  skeletonHelper.visible = false;
  rootGroup.add(skeletonHelper);

  const jointSphereGeo = new THREE.SphereGeometry(0.018, 8, 8);
  const jointMats = [
    new THREE.MeshBasicMaterial({ color: 0x22c55e }),
    new THREE.MeshBasicMaterial({ color: 0x3b82f6 }),
    new THREE.MeshBasicMaterial({ color: 0xf59e0b }),
    new THREE.MeshBasicMaterial({ color: 0xef4444 }),
  ];

  const jointsList: THREE.Object3D[] = [
    pelvisJoint,
    spineJoint,
    chestJoint,
    neckJoint,
    headGroup,
    leftClavicle,
    leftShoulder,
    leftElbow,
    leftWrist,
    leftArmSeg3,
    leftHand,
    rightClavicle,
    rightShoulder,
    rightElbow,
    rightWrist,
    rightArmSeg3,
    rightHand,
    leftHip,
    leftKnee,
    leftAnkle,
    rightHip,
    rightKnee,
    rightAnkle,
  ];

  jointsList.forEach((joint, idx) => {
    const marker = new THREE.Mesh(jointSphereGeo, jointMats[idx % jointMats.length]);
    marker.visible = false;
    joint.add(marker);
  });

  const joints: JointHierarchy = {
    root: rootGroup,
    pelvis: pelvisJoint,
    spine: spineJoint,
    chest: chestJoint,
    neck: neckJoint,
    head: headGroup,
    leftClavicle,
    leftShoulder,
    leftElbow,
    leftWrist,
    leftArmSeg3,
    leftHand,
    leftArmChain,
    rightClavicle,
    rightShoulder,
    rightElbow,
    rightWrist,
    rightArmSeg3,
    rightHand,
    rightArmChain,
    leftHip,
    leftKnee,
    leftAnkle,
    leftFoot,
    rightHip,
    rightKnee,
    rightAnkle,
    rightFoot,
  };

  const face: FaceRig = {
    eyeLeft,
    eyeRight,
    pupilLeft,
    pupilRight,
    browLeft,
    browRight,
    mouthMesh,
    mouthCanvas,
    mouthCtx,
    mouthTexture,
    cheeks,
    throatBulgeMesh,
    headDomeMesh,
  };

  const instance: CharacterInstance = {
    group: rootGroup,
    joints,
    face,
    bodyMesh,
    skinnedBodyMesh: undefined,
    bodyMaterial,
    bellyMaterial: bodyMaterial,
    palette,
    animState: 'idle',
    animTime: Math.random() * 5.0,
    stateDuration: 0,
    playerIndex,
    isSeated: true,
    showSkeleton: false,

    applySquashStretch: (factor: number) => {
      // Volume conservation law: Sx * Sy * Sz = 1
      const sy = Math.max(0.4, Math.min(2.0, factor));
      const sRad = 1.0 / Math.sqrt(sy);
      pelvisJoint.scale.set(sRad, sy, sRad);
    },

    setAnimation: (state: CharacterAnimationState) => {
      instance.animState = state;
      instance.animTime = 0;
    },

    setPalette: (newPalette: CharacterColorPalette) => {
      instance.palette = newPalette;
      // Re-generate fused canvas texture
      const newTex = createFusedBeanBodyTexture(newPalette.bodyColor, newPalette.bellyColor);
      bodyMaterial.map = newTex;
      bodyMaterial.needsUpdate = true;
      headMaterial.color.setHex(newPalette.bodyColor);
      limbMaterial.color.setHex(newPalette.bodyColor);
    },

    toggleSkeleton: (visible: boolean) => {
      instance.showSkeleton = visible;
      jointsList.forEach(j => {
        const marker = j.children.find(c => c instanceof THREE.Mesh && c.geometry === jointSphereGeo);
        if (marker) marker.visible = visible;
      });
    },

    update: (_dt: number, _time: number) => {
      // Overridden by characterAnimator
    },
  };

  instance.toggleSkeleton(false);

  return instance;
}
