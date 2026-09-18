import * as THREE from 'three';
import { CharacterInstance } from '../types/character';
import { drawCartoonMouth } from './characterModel';

// Helper for smooth linear interpolation
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Helper for damping rotation towards target
function dampRot(
  euler: THREE.Euler,
  targetX: number,
  targetY: number,
  targetZ: number,
  speed: number,
  dt: number
) {
  const factor = 1 - Math.exp(-speed * dt);
  euler.x = lerp(euler.x, targetX, factor);
  euler.y = lerp(euler.y, targetY, factor);
  euler.z = lerp(euler.z, targetZ, factor);
}

// Helper for flexible feline/cat-tail wave motion across an arm chain
export function animateCatTailChain(
  chain: THREE.Object3D[] | undefined,
  basePitch: number,
  baseYaw: number,
  baseRoll: number,
  waveAmp: number,
  waveFreq: number,
  phaseOffset: number,
  curlTip: number,
  speed: number,
  dt: number
) {
  if (!chain || chain.length === 0) return;
  const count = chain.length;
  for (let s = 0; s < count; s++) {
    const joint = chain[s];
    const segFrac = s / Math.max(1, count - 1);
    // Dynamic feline sine wave traveling down the tail vertebrae
    const wave = Math.sin(waveFreq - s * 0.85 + phaseOffset) * waveAmp * (0.5 + 0.5 * segFrac);
    // Supple curl at the tip
    const curl = curlTip * (segFrac * segFrac);

    const targetX = (basePitch / count) + wave * 0.6 + curl;
    const targetY = (baseYaw / count) + Math.cos(waveFreq - s * 0.75 + phaseOffset) * waveAmp * 0.4;
    const targetZ = (baseRoll / count) + wave * 0.3;

    dampRot(joint.rotation, targetX, targetY, targetZ, speed, dt);
  }
}

// Analytical Inverse Kinematics for Articulated Cartoon Limbs
// Solves shoulder pitch/yaw, elbow flexion, and wrist orientation to reach target in chest space
export function solveArticulatedArmIK(
  shoulder: THREE.Group,
  elbow: THREE.Group,
  wrist: THREE.Group,
  armSeg3: THREE.Group,
  targetPos: THREE.Vector3, // in chest space
  isRightArm: boolean = true,
  weight: number = 1.0,
  dt: number = 0.016
) {
  if (weight <= 0.001) return;

  // Shoulder origin in chest space
  const shoulderX = isRightArm ? 0.165 : -0.165;
  const shoulderY = 0.12;
  const shoulderZ = 0;

  const dx = targetPos.x - shoulderX;
  const dy = targetPos.y - shoulderY;
  const dz = targetPos.z - shoulderZ;
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Total arm length: 4 segments * 0.08m = 0.32m
  const maxReach = 0.30;
  const clampedDist = Math.max(0.06, Math.min(maxReach, dist));

  // Forward reach angles
  const reachPitch = Math.atan2(dz, Math.max(0.02, -dy));
  const reachYaw = Math.atan2(dx, Math.max(0.04, clampedDist));

  // Flexion ratio: when target is close, arm bends naturally at the elbow
  const reachFraction = clampedDist / maxReach;
  const bendAngle = (1.0 - reachFraction) * 2.2; // up to ~125 degrees bend

  // Shoulder pitch and yaw (NEGATIVE pitch swings -Y arm vector forward along +Z!)
  const targetShoulderX = -reachPitch - (1.0 - reachFraction) * 0.45;
  const targetShoulderY = isRightArm ? reachYaw - 0.20 : reachYaw + 0.20;
  const targetShoulderZ = isRightArm ? 0.25 : -0.25;

  // Elbow flexes inward and slightly downward
  const targetElbowX = -bendAngle * 0.70;
  const targetElbowY = isRightArm ? -bendAngle * 0.30 : bendAngle * 0.30;

  // Wrist flexes to keep hand oriented towards cup
  const targetWristX = bendAngle * 0.30;
  const targetWristY = isRightArm ? 0.15 : -0.15;

  // Hand aligns to grasp
  const targetHandX = 0.20;

  // Smoothly damp towards target angles
  const speed = 14 * weight;
  dampRot(shoulder.rotation, targetShoulderX, targetShoulderY, targetShoulderZ, speed, dt);
  dampRot(elbow.rotation, targetElbowX, targetElbowY, 0, speed, dt);
  dampRot(wrist.rotation, targetWristX, targetWristY, 0, speed, dt);
  dampRot(armSeg3.rotation, targetHandX, 0, 0, speed, dt);
}

// Main procedural animation updater for each character
export function updateCharacterAnimation(
  char: CharacterInstance,
  dt: number,
  globalTime: number
) {
  char.animTime += dt;
  const t = char.animTime;
  const j = char.joints;
  const f = char.face;

  // 1. Natural Cartoon Blinking with Eyelid Squash & Stretch Volume Conservation
  const blinkTimer = (globalTime + char.playerIndex * 1.7) % 3.6;
  let targetEyeScaleY = 1.0;
  let targetEyeScaleX = 1.0;

  if (blinkTimer > 3.42) {
    const bp = (blinkTimer - 3.42) / 0.18;
    if (bp < 0.25) {
      // Anticipation: slight widening
      targetEyeScaleY = 1.06;
      targetEyeScaleX = 1.02;
    } else if (bp < 0.65) {
      // Snap shut with horizontal volume stretch
      targetEyeScaleY = 0.06;
      targetEyeScaleX = 1.15;
    } else {
      // Soft bounce back open
      targetEyeScaleY = 1.04;
      targetEyeScaleX = 1.0;
    }
  }
  f.eyeLeft.scale.y = lerp(f.eyeLeft.scale.y, targetEyeScaleY, 0.45);
  f.eyeRight.scale.y = lerp(f.eyeRight.scale.y, targetEyeScaleY, 0.45);
  f.eyeLeft.scale.x = lerp(f.eyeLeft.scale.x, targetEyeScaleX, 0.35);
  f.eyeRight.scale.x = lerp(f.eyeRight.scale.x, targetEyeScaleX, 0.35);

  // DYNAMIC SURFACE LOCK: Ensure facial features ALWAYS stay anchored in front of head dome surface
  const headR = 0.165;
  const eyeSurfaceZ = Math.sqrt(Math.max(0.01, headR * headR - 0.046 * 0.046 - 0.035 * 0.035)); // ~0.1545m
  f.eyeLeft.position.z = Math.max(eyeSurfaceZ, f.eyeLeft.position.z);
  f.eyeRight.position.z = Math.max(eyeSurfaceZ, f.eyeRight.position.z);
  f.mouthMesh.position.z = Math.max(headR * 0.985, f.mouthMesh.position.z);

  // Height references:
  // Wedding chair cushion top is at y = 0.48m.
  // Pelvis resting ON cushion is at y = 0.485m (NEVER clipping inside the sponge!)
  const chairPelvisY = 0.485;
  const chairPelvisZ = 0.02;

  // Floor standing height
  const floorPelvisY = 0.16;
  const floorPelvisZ = 0.42;

  switch (char.animState) {
    // ----------------------------------------------------
    // 1. IDLE: Natural breathing, multi-tier look-around, dangling noodle legs
    // ----------------------------------------------------
    case 'idle': {
      const breath = Math.sin(globalTime * 2.2 + char.playerIndex);
      const sway = Math.sin(globalTime * 1.1 + char.playerIndex * 0.7);
      const nod = Math.sin(globalTime * 1.6 + char.playerIndex);
      char.applySquashStretch?.(1.0 + breath * 0.02);

      // Natural multi-tier look-around kinematics (ZERO turntable yaw!)
      // Every 5.5 seconds: pupils dart -> head turns -> chest twists -> spine follows
      const lookCycle = (globalTime * 0.38 + char.playerIndex * 1.9) % 5.5;
      let lookHeadYaw = 0;
      let lookHeadPitch = 0;
      let lookHeadRoll = 0;
      let lookPupilX = 0;
      let lookPupilY = 0;

      if (lookCycle > 2.0 && lookCycle < 4.5) {
        const pLook = (lookCycle - 2.0) / 2.5;
        const lookEnvelope = Math.sin(pLook * Math.PI);
        const sideDir = ((char.playerIndex % 2 === 0) ? 1 : -1) * (Math.sin(char.playerIndex + 1.5) > 0 ? 1 : -1);

        // Eyes dart first
        lookPupilX = sideDir * 0.007 * Math.min(1.0, lookEnvelope * 1.5);
        lookPupilY = -0.002 * lookEnvelope;

        // Head turns with natural tilt
        lookHeadYaw = sideDir * 0.42 * lookEnvelope;
        lookHeadPitch = 0.05 * lookEnvelope;
        lookHeadRoll = -sideDir * 0.05 * lookEnvelope;
      }

      f.pupilLeft.position.x = lerp(f.pupilLeft.position.x, lookPupilX, 0.25);
      f.pupilRight.position.x = lerp(f.pupilRight.position.x, lookPupilX, 0.25);
      f.pupilLeft.position.y = lerp(f.pupilLeft.position.y, lookPupilY, 0.25);
      f.pupilRight.position.y = lerp(f.pupilRight.position.y, lookPupilY, 0.25);

      if (char.isSeated) {
        // Pelvis stays planted on cushion: Y-yaw = 0! Only subtle weight shift on Z
        dampRot(j.pelvis.rotation, 0, 0, (sway * 0.015) + (lookHeadYaw * 0.02), 6, dt);
        j.pelvis.position.y = lerp(j.pelvis.position.y, chairPelvisY + breath * 0.003, 0.1);
        j.pelvis.position.z = lerp(j.pelvis.position.z, chairPelvisZ, 0.1);

        // Cute noodle legs resting horizontally on red cushion & dangling over edge
        const legDangle = Math.sin(globalTime * 2.0 + char.playerIndex) * 0.04;
        dampRot(j.leftHip.rotation, 1.48 + legDangle, 0.05, 0, 8, dt);
        dampRot(j.leftKnee.rotation, -1.45, 0, 0, 8, dt);
        dampRot(j.leftFoot.rotation, 0.10, 0, 0, 8, dt);

        dampRot(j.rightHip.rotation, 1.48 - legDangle, -0.05, 0, 8, dt);
        dampRot(j.rightKnee.rotation, -1.45, 0, 0, 8, dt);
        dampRot(j.rightFoot.rotation, 0.10, 0, 0, 8, dt);
      } else {
        // Standing upright on concrete floor
        dampRot(j.pelvis.rotation, 0, 0, sway * 0.02, 6, dt);
        j.pelvis.position.y = lerp(j.pelvis.position.y, floorPelvisY + breath * 0.003, 0.1);
        j.pelvis.position.z = lerp(j.pelvis.position.z, floorPelvisZ, 0.1);

        dampRot(j.leftHip.rotation, 0, 0, 0, 8, dt);
        dampRot(j.leftKnee.rotation, 0, 0, 0, 8, dt);
        dampRot(j.leftFoot.rotation, 0, 0, 0, 8, dt);

        dampRot(j.rightHip.rotation, 0, 0, 0, 8, dt);
        dampRot(j.rightKnee.rotation, 0, 0, 0, 8, dt);
        dampRot(j.rightFoot.rotation, 0, 0, 0, 8, dt);
      }

      // Spine & chest follow head with physiological lag and reduced ratio
      dampRot(j.spine.rotation, breath * 0.015, lookHeadYaw * 0.18, sway * 0.02, 4, dt);
      dampRot(j.chest.rotation, breath * 0.02, lookHeadYaw * 0.35, -sway * 0.015, 5, dt);
      dampRot(j.head.rotation, nod * 0.04 + lookHeadPitch, sway * 0.08 + lookHeadYaw, lookHeadRoll, 7, dt);

      // Relaxed supple waving arms with curled tips
      const armSway = Math.sin(globalTime * 1.5 + char.playerIndex);
      dampRot(j.leftClavicle.rotation, 0, 0, 0, 6, dt);
      animateCatTailChain(
        j.leftArmChain,
        0.45 + breath * 0.04,
        0.08,
        -0.20 + armSway * 0.05,
        0.08,
        globalTime * 2.2,
        char.playerIndex,
        0.28,
        7,
        dt
      );

      dampRot(j.rightClavicle.rotation, 0, 0, 0, 6, dt);
      animateCatTailChain(
        j.rightArmChain,
        0.45 + breath * 0.04,
        -0.08,
        0.20 - armSway * 0.05,
        0.08,
        globalTime * 2.2,
        char.playerIndex + 1,
        0.28,
        7,
        dt
      );

      f.browLeft.position.y = 0.08;
      f.browRight.position.y = 0.08;
      f.browLeft.rotation.z = -0.08;
      f.browRight.rotation.z = 0.08;
      f.throatBulgeMesh.visible = false;

      if (Math.floor(globalTime * 10) % 30 === 0) {
        drawCartoonMouth(f.mouthCtx, 'smile');
        f.mouthTexture.needsUpdate = true;
      }
      break;
    }

    // ----------------------------------------------------
    // 2. DRINK_SIP: Reach cup on table with articulated arm IK, lift to lips, sip, lower
    // ----------------------------------------------------
    case 'drink_sip': {
      const duration = 3.6;
      const progress = Math.min(1.0, t / duration);

      char.isSeated = true;
      j.pelvis.position.y = lerp(j.pelvis.position.y, chairPelvisY, 0.1);

      // Legs resting forward on cushion and dangling over edge
      dampRot(j.leftHip.rotation, 1.48, 0.05, 0, 8, dt);
      dampRot(j.leftKnee.rotation, -1.45, 0, 0, 8, dt);
      dampRot(j.rightHip.rotation, 1.48, -0.05, 0, 8, dt);
      dampRot(j.rightKnee.rotation, -1.45, 0, 0, 8, dt);

      // Left arm sways naturally like a relaxed tail
      dampRot(j.leftClavicle.rotation, 0, 0, 0, 6, dt);
      animateCatTailChain(
        j.leftArmChain,
        0.45,
        0.08,
        -0.20,
        0.06,
        globalTime * 2.0,
        char.playerIndex,
        0.25,
        6,
        dt
      );

      // Phase 1: Torso leans forward at waist, right arm reaches to cup on table (0 to 0.85s)
      if (t < 0.85) {
        const p1 = t / 0.85;
        const u = p1 * p1 * (3 - 2 * p1);

        // Lean forward at waist (lumbar spine) with pelvis shift
        dampRot(j.pelvis.rotation, 0, 0, 0, 8, dt);
        dampRot(j.spine.rotation, 0.24 * u, 0, 0, 8, dt);
        dampRot(j.chest.rotation, 0.10 * u, 0, 0, 8, dt);
        dampRot(j.head.rotation, 0.06 * u, 0, 0, 8, dt);
        j.pelvis.position.z = lerp(chairPelvisZ, chairPelvisZ + 0.04 * u, 0.1);

        // Right arm stretches forward along +Z straight to cup on table
        dampRot(j.rightShoulder.rotation, lerp(0.45, -1.18, u), lerp(-0.08, -0.24, u), lerp(0.20, 0.06, u), 8, dt);
        dampRot(j.rightElbow.rotation, lerp(0.08, -0.35, u), 0, 0, 8, dt);
        dampRot(j.rightWrist.rotation, lerp(0, 0.38, u), 0.15 * u, 0, 8, dt);
        if (j.rightArmSeg3) dampRot(j.rightArmSeg3.rotation, lerp(0, 0.25, u), 0, 0, 8, dt);

        // Eyes track the cup on the table
        f.pupilLeft.position.set(-0.003 * u, -0.006 * u, 0.010);
        f.pupilRight.position.set(0.003 * u, -0.006 * u, 0.010);

        if (t > 0.55) {
          drawCartoonMouth(f.mouthCtx, 'open_o', t, 0.35 * (t - 0.55) / 0.30);
          f.mouthTexture.needsUpdate = true;
        }
      }
      // Phase 2: Arm lifts cup from table to lips! (0.85s to 1.45s)
      else if (t < 1.45) {
        const p2 = (t - 0.85) / 0.60;
        const u = p2 * p2 * (3 - 2 * p2);

        // Spine straightens back up as cup is lifted
        dampRot(j.pelvis.rotation, 0, 0, 0, 8, dt);
        dampRot(j.spine.rotation, lerp(0.24, 0.04, u), 0, 0, 8, dt);
        dampRot(j.chest.rotation, lerp(0.10, 0.02, u), 0, 0, 8, dt);
        dampRot(j.head.rotation, lerp(0.06, -0.16, u), 0, 0, 8, dt);
        j.pelvis.position.z = lerp(chairPelvisZ + 0.04 * (1 - u), chairPelvisZ, 0.1);

        // Arm lifts cup directly to mouth
        dampRot(j.rightShoulder.rotation, lerp(-1.18, -0.62, u), lerp(-0.24, -0.40, u), lerp(0.06, 0.15, u), 8, dt);
        dampRot(j.rightElbow.rotation, lerp(-0.35, -1.86, u), 0, 0, 8, dt);
        dampRot(j.rightWrist.rotation, lerp(0.38, -0.44, u), lerp(0.15, 0.22, u), 0, 8, dt);
        if (j.rightArmSeg3) dampRot(j.rightArmSeg3.rotation, lerp(0.25, -0.18, u), 0, 0, 8, dt);

        // Eyes squint slightly as cup reaches lips
        const eyeClose = lerp(1.0, 0.40, u);
        f.eyeLeft.scale.set(1.0, eyeClose, 1.0);
        f.eyeRight.scale.set(1.0, eyeClose, 1.0);

        drawCartoonMouth(f.mouthCtx, 'sip', t, u);
        f.mouthTexture.needsUpdate = true;
      }
      // Phase 3: Sipping & Swallowing (1.45s to 2.35s)
      else if (t < 2.35) {
        // Head tilted slightly back in satisfaction
        dampRot(j.head.rotation, -0.18 + Math.sin((t - 1.45) * 8.0) * 0.02, 0, 0, 8, dt);
        dampRot(j.spine.rotation, 0.04, 0, 0, 8, dt);
        j.pelvis.position.z = lerp(j.pelvis.position.z, chairPelvisZ, 0.1);

        // Arm holds cup at lips
        dampRot(j.rightShoulder.rotation, -0.62, -0.40, 0.15, 8, dt);
        dampRot(j.rightElbow.rotation, -1.86, 0, 0, 8, dt);
        dampRot(j.rightWrist.rotation, -0.44, 0.22, 0, 8, dt);
        if (j.rightArmSeg3) dampRot(j.rightArmSeg3.rotation, -0.18, 0, 0, 8, dt);

        f.eyeLeft.scale.set(1.05, 0.35, 1.0);
        f.eyeRight.scale.set(1.05, 0.35, 1.0);

        // Throat Adam's apple swallow wave
        f.throatBulgeMesh.visible = true;
        const swallowWave = Math.sin((t - 1.45) * 12.0);
        f.throatBulgeMesh.position.y = -0.015 + swallowWave * 0.016;
        f.throatBulgeMesh.scale.set(1.2, 1.2, 1.2);

        drawCartoonMouth(f.mouthCtx, 'sip', t, 0.90);
        f.mouthTexture.needsUpdate = true;
      }
      // Phase 4: Lower cup back to table (2.35s to 2.95s)
      else if (t < 2.95) {
        const p4 = (t - 2.35) / 0.60;
        const u = p4 * p4 * (3 - 2 * p4);
        f.throatBulgeMesh.visible = false;

        // Spine leans forward again to place cup on table
        dampRot(j.spine.rotation, lerp(0.04, 0.24, u), 0, 0, 8, dt);
        dampRot(j.chest.rotation, lerp(0.02, 0.10, u), 0, 0, 8, dt);
        dampRot(j.head.rotation, lerp(-0.18, 0.06, u), 0, 0, 8, dt);
        j.pelvis.position.z = lerp(chairPelvisZ, chairPelvisZ + 0.04 * u, 0.1);

        // Arm extends cup back down onto table
        dampRot(j.rightShoulder.rotation, lerp(-0.62, -1.18, u), lerp(-0.40, -0.24, u), lerp(0.15, 0.06, u), 8, dt);
        dampRot(j.rightElbow.rotation, lerp(-1.86, -0.35, u), 0, 0, 8, dt);
        dampRot(j.rightWrist.rotation, lerp(-0.44, 0.38, u), lerp(0.22, 0.15, u), 0, 8, dt);
        if (j.rightArmSeg3) dampRot(j.rightArmSeg3.rotation, lerp(-0.18, 0.25, u), 0, 0, 8, dt);

        const eyeOpen = lerp(0.35, 1.0, u);
        f.eyeLeft.scale.set(1.0, eyeOpen, 1.0);
        f.eyeRight.scale.set(1.0, eyeOpen, 1.0);
        f.pupilLeft.position.set(0, 0, 0.010);
        f.pupilRight.position.set(0, 0, 0.010);

        drawCartoonMouth(f.mouthCtx, 'smile', 0, 0.35 * (1 - u));
        f.mouthTexture.needsUpdate = true;
      }
      // Phase 5: Release cup and return to rest (2.95s to 3.6s)
      else {
        f.throatBulgeMesh.visible = false;
        const p5 = Math.min(1.0, (t - 2.95) / 0.65);
        const u = p5 * p5 * (3 - 2 * p5);

        dampRot(j.spine.rotation, lerp(0.24, 0, u), 0, 0, 8, dt);
        dampRot(j.chest.rotation, lerp(0.10, 0, u), 0, 0, 8, dt);
        dampRot(j.head.rotation, lerp(0.06, 0, u), 0, 0, 8, dt);
        j.pelvis.position.z = lerp(chairPelvisZ + 0.04 * (1 - u), chairPelvisZ, 0.1);

        // Right arm returns to relaxed rest
        dampRot(j.rightShoulder.rotation, lerp(-1.18, 0.45, u), lerp(-0.24, -0.08, u), lerp(0.06, 0.20, u), 8, dt);
        dampRot(j.rightElbow.rotation, lerp(-0.35, 0.08, u), 0, 0, 8, dt);
        dampRot(j.rightWrist.rotation, lerp(0.38, 0, u), 0, 0, 8, dt);
        if (j.rightArmSeg3) dampRot(j.rightArmSeg3.rotation, lerp(0.25, 0, u), 0, 0, 8, dt);

        drawCartoonMouth(f.mouthCtx, 'smile');
        f.mouthTexture.needsUpdate = true;

        if (progress >= 1.0) {
          char.animState = 'idle';
          char.animTime = 0;
        }
      }
      break;
    }

    // ----------------------------------------------------
    // 3. REFILL_SHOCK: Organic cartoon choke reaction (gasp anticipation -> 3 cough spasms with hands clutching neck -> recovery)
    // ----------------------------------------------------
    case 'refill_shock': {
      const duration = 3.2;
      const progress = Math.min(1.0, t / duration);
      char.isSeated = true;

      if (t < 0.35) {
        // Stage 1: Surprise Freeze & Bug-Eyed Gasp
        const p1 = t / 0.35;
        char.applySquashStretch?.(1.0 + p1 * 0.14);
        j.pelvis.position.z = lerp(j.pelvis.position.z, chairPelvisZ - 0.02, 0.15);
        dampRot(j.pelvis.rotation, 0, 0, 0, 12, dt);
        dampRot(j.spine.rotation, -0.15 * p1, 0, 0, 14, dt);
        dampRot(j.head.rotation, -0.18 * p1, 0, 0, 14, dt);

        // Eyes bug out wide
        const bugScale = lerp(1.0, 1.35, p1);
        f.eyeLeft.scale.set(bugScale, bugScale, 1.0);
        f.eyeRight.scale.set(bugScale, bugScale, 1.0);
        f.pupilLeft.scale.set(lerp(1.0, 0.45, p1), lerp(1.0, 0.45, p1), 1.0);
        f.pupilRight.scale.set(lerp(1.0, 0.45, p1), lerp(1.0, 0.45, p1), 1.0);

        // Eyebrows shoot high up into steep shock angles
        f.browLeft.position.y = lerp(0.08, 0.12, p1);
        f.browRight.position.y = lerp(0.08, 0.12, p1);
        f.browLeft.rotation.z = lerp(-0.08, -0.32, p1);
        f.browRight.rotation.z = lerp(0.08, 0.32, p1);

        // Arms pull up in alarm
        dampRot(j.leftShoulder.rotation, -0.9 * p1, 0.2, -0.3, 14, dt);
        dampRot(j.leftElbow.rotation, -0.7 * p1, 0, 0, 14, dt);
        dampRot(j.rightShoulder.rotation, -0.9 * p1, -0.2, 0.3, 14, dt);
        dampRot(j.rightElbow.rotation, -0.7 * p1, 0, 0, 14, dt);

        drawCartoonMouth(f.mouthCtx, 'open_o', t, p1 * 0.9);
        f.mouthTexture.needsUpdate = true;
      } else if (t < 2.25) {
        // Stage 2: 3 Rhythmic Gagging Cough Spasms
        const spasmTime = t - 0.35;
        const spasmCycle = (spasmTime % 0.63) / 0.63; // 3 spasms
        const spasmImpulse = Math.sin(spasmCycle * Math.PI); // 0 -> 1 -> 0

        char.applySquashStretch?.(1.0 - spasmImpulse * 0.15);
        // Counterbalance: pelvis slides back slightly so character doesn't plunge
        j.pelvis.position.z = chairPelvisZ - 0.05 * spasmImpulse;
        dampRot(j.pelvis.rotation, 0, 0, Math.sin(t * 12.0) * 0.03, 16, dt);

        // Sharp abdominal curl forward at waist crease
        dampRot(j.spine.rotation, 0.12 + spasmImpulse * 0.35, 0, 0, 18, dt);
        dampRot(j.chest.rotation, 0.08 + spasmImpulse * 0.20, 0, 0, 18, dt);
        dampRot(j.head.rotation, 0.05 + spasmImpulse * 0.25, Math.sin(t * 16.0) * 0.06, 0, 18, dt);

        // HANDS CLUTCHING THROAT AND CHEEKS
        // Both arms wrap inward around neck and lower jaw
        dampRot(j.leftShoulder.rotation, -1.35, 0.35, -0.30, 16, dt);
        dampRot(j.leftElbow.rotation, -2.15, -0.25, 0, 16, dt);
        dampRot(j.leftWrist.rotation, -0.50, 0.20, 0.30, 16, dt);

        dampRot(j.rightShoulder.rotation, -1.35, -0.35, 0.30, 16, dt);
        dampRot(j.rightElbow.rotation, -2.15, 0.25, 0, 16, dt);
        dampRot(j.rightWrist.rotation, -0.50, -0.20, -0.30, 16, dt);

        // Throat Adam's apple convulsing
        f.throatBulgeMesh.visible = true;
        f.throatBulgeMesh.position.y = -0.015 + Math.sin(t * 22.0) * 0.020;
        f.throatBulgeMesh.scale.set(1.25, 1.25, 1.25);

        // Eyes squeeze shut at peak of cough, bug out between
        const eyeSquashY = lerp(1.30, 0.20, spasmImpulse);
        f.eyeLeft.scale.set(1.25, eyeSquashY, 1.0);
        f.eyeRight.scale.set(1.25, eyeSquashY, 1.0);

        // Dangling feet kick in distress
        const kick = Math.sin(t * 20.0) * 0.12;
        dampRot(j.leftHip.rotation, 1.48 + kick, 0.05, 0, 14, dt);
        dampRot(j.leftKnee.rotation, -1.45, 0, 0, 14, dt);
        dampRot(j.rightHip.rotation, 1.48 - kick, -0.05, 0, 14, dt);
        dampRot(j.rightKnee.rotation, -1.45, 0, 0, 14, dt);

        drawCartoonMouth(f.mouthCtx, 'choke', t, 0.9 + spasmImpulse * 0.4);
        f.mouthTexture.needsUpdate = true;
      } else {
        // Stage 3: Exhausted Recovery & Heavy Panting
        const p3 = (t - 2.25) / 0.95;
        f.throatBulgeMesh.visible = false;
        const heave = Math.sin((t - 2.25) * 6.0) * 0.06;
        char.applySquashStretch?.(1.0 + heave);

        j.pelvis.position.z = lerp(j.pelvis.position.z, chairPelvisZ, 0.1);
        dampRot(j.pelvis.rotation, 0, 0, 0, 10, dt);
        dampRot(j.spine.rotation, lerp(0.20, 0.04, p3), 0, 0, 8, dt);
        dampRot(j.chest.rotation, lerp(0.12, 0.02, p3), 0, 0, 8, dt);
        dampRot(j.head.rotation, lerp(0.15, 0.02, p3), 0, 0, 8, dt);

        // Hands slide down from neck towards lap
        dampRot(j.leftShoulder.rotation, lerp(-1.35, 0.45, p3), lerp(0.35, 0.10, p3), -0.20, 8, dt);
        dampRot(j.leftElbow.rotation, lerp(-2.15, 0.08, p3), 0, 0, 8, dt);
        dampRot(j.leftWrist.rotation, lerp(-0.50, 0, p3), 0, 0, 8, dt);

        dampRot(j.rightShoulder.rotation, lerp(-1.35, 0.45, p3), lerp(-0.35, -0.10, p3), 0.20, 8, dt);
        dampRot(j.rightElbow.rotation, lerp(-2.15, 0.08, p3), 0, 0, 8, dt);
        dampRot(j.rightWrist.rotation, lerp(-0.50, 0, p3), 0, 0, 8, dt);

        // Eyes and pupils normalize
        f.eyeLeft.scale.set(1.0, 1.0, 1.0);
        f.eyeRight.scale.set(1.0, 1.0, 1.0);
        const normPupil = lerp(0.45, 1.0, p3);
        f.pupilLeft.scale.set(normPupil, normPupil, 1.0);
        f.pupilRight.scale.set(normPupil, normPupil, 1.0);

        f.browLeft.position.y = lerp(0.12, 0.08, p3);
        f.browRight.position.y = lerp(0.12, 0.08, p3);
        f.browLeft.rotation.z = lerp(-0.32, -0.08, p3);
        f.browRight.rotation.z = lerp(0.32, 0.08, p3);

        if (p3 > 0.6) {
          drawCartoonMouth(f.mouthCtx, 'smile');
        } else {
          drawCartoonMouth(f.mouthCtx, 'open_o', t, 0.3 * (1 - p3));
        }
        f.mouthTexture.needsUpdate = true;

        if (progress >= 1.0) {
          char.animState = 'idle';
          char.animTime = 0;
        }
      }
      break;
    }

    // ----------------------------------------------------
    // 4. VICTORY: Joyous bouncing on red cushion, double fist pump
    // ----------------------------------------------------
    case 'victory': {
      const duration = 3.5;
      const progress = Math.min(1.0, t / duration);

      char.isSeated = true;
      const bounce = Math.abs(Math.sin(t * 9.0));
      char.applySquashStretch?.(1.0 + bounce * 0.12);
      j.pelvis.position.y = chairPelvisY + bounce * 0.05;
      dampRot(j.pelvis.rotation, 0, 0, Math.sin(t * 9.0) * 0.06, 12, dt);
      dampRot(j.spine.rotation, 0.05, Math.sin(t * 4.5) * 0.1, 0, 10, dt);

      dampRot(j.head.rotation, -0.15 + Math.sin(t * 9.0) * 0.15, Math.cos(t * 4.5) * 0.1, 0, 10, dt);

      const leftPump = Math.sin(t * 9.0);
      const rightPump = Math.cos(t * 9.0);

      dampRot(j.leftShoulder.rotation, 2.45 + leftPump * 0.40, 0.2, -0.35, 12, dt);
      dampRot(j.leftElbow.rotation, -0.45, 0, 0, 12, dt);

      dampRot(j.rightShoulder.rotation, 2.45 + rightPump * 0.40, -0.2, 0.35, 12, dt);
      dampRot(j.rightElbow.rotation, -0.45, 0, 0, 12, dt);

      dampRot(j.leftHip.rotation, 1.48 + leftPump * 0.10, 0.05, 0, 12, dt);
      dampRot(j.leftKnee.rotation, -1.45, 0, 0, 12, dt);
      dampRot(j.rightHip.rotation, 1.48 + rightPump * 0.10, -0.05, 0, 12, dt);
      dampRot(j.rightKnee.rotation, -1.45, 0, 0, 12, dt);

      f.eyeLeft.scale.set(1.15, 0.38, 1.0);
      f.eyeRight.scale.set(1.15, 0.38, 1.0);

      f.browLeft.position.y = 0.24;
      f.browRight.position.y = 0.24;

      drawCartoonMouth(f.mouthCtx, 'grin');
      f.mouthTexture.needsUpdate = true;

      if (progress >= 1.0) {
        char.animState = 'idle';
        char.animTime = 0;
      }
      break;
    }

    // ----------------------------------------------------
    // 5. LAUGH: Clutches belly, slaps table, head thrown back
    // ----------------------------------------------------
    case 'laugh': {
      const duration = 3.2;
      const progress = Math.min(1.0, t / duration);

      char.isSeated = true;
      const laughShake = Math.sin(t * 15.0);
      const laughSlap = Math.sin(t * 7.5);
      char.applySquashStretch?.(1.0 + laughShake * 0.08);

      j.pelvis.position.y = chairPelvisY;
      dampRot(j.leftHip.rotation, 1.48, 0.05, 0, 8, dt);
      dampRot(j.leftKnee.rotation, -1.45, 0, 0, 8, dt);
      dampRot(j.rightHip.rotation, 1.48, -0.05, 0, 8, dt);
      dampRot(j.rightKnee.rotation, -1.45, 0, 0, 8, dt);

      dampRot(j.spine.rotation, 0.30 + laughShake * 0.12, 0, 0, 12, dt);
      dampRot(j.chest.rotation, 0.18 + laughShake * 0.15, 0, 0, 12, dt);

      dampRot(j.head.rotation, -0.20 + laughShake * 0.20, Math.sin(t * 5.0) * 0.1, 0, 12, dt);

      // Left arm clutches belly
      dampRot(j.leftShoulder.rotation, -0.85, 0.30, 0.10, 10, dt);
      dampRot(j.leftElbow.rotation, -1.85, -0.35, 0, 10, dt);

      // Right arm slaps table
      const slapDown = Math.max(0, laughSlap);
      dampRot(j.rightShoulder.rotation, -0.85 - slapDown * 0.35, -0.1, 0.1, 16, dt);
      dampRot(j.rightElbow.rotation, -0.50 - slapDown * 0.2, 0.1, 0, 16, dt);

      f.eyeLeft.scale.set(1.1, 0.18, 1.0);
      f.eyeRight.scale.set(1.1, 0.18, 1.0);

      drawCartoonMouth(f.mouthCtx, 'laugh', t);
      f.mouthTexture.needsUpdate = true;

      if (progress >= 1.0) {
        char.animState = 'idle';
        char.animTime = 0;
      }
      break;
    }

    // ----------------------------------------------------
    // 6. TALK_GERMAN: Moroccan emphatic hand gesticulation, head nods
    // ----------------------------------------------------
    case 'talk_german': {
      const duration = 4.2;
      const progress = Math.min(1.0, t / duration);

      char.isSeated = true;
      dampRot(j.leftHip.rotation, 1.48, 0.05, 0, 8, dt);
      dampRot(j.leftKnee.rotation, -1.45, 0, 0, 8, dt);
      dampRot(j.rightHip.rotation, 1.48, -0.05, 0, 8, dt);
      dampRot(j.rightKnee.rotation, -1.45, 0, 0, 8, dt);

      const gestFreq = t * 6.5;
      const gestWave = Math.sin(gestFreq);
      const gestCos = Math.cos(gestFreq * 0.8);

      dampRot(j.spine.rotation, 0.12 + gestWave * 0.04, gestCos * 0.06, 0, 8, dt);
      const syllableNod = Math.sin(t * 11.0);
      dampRot(j.head.rotation, 0.1 + syllableNod * 0.12, gestCos * 0.15, gestWave * 0.05, 10, dt);

      // Moroccan expressive hand gesticulation with noodle arm
      dampRot(j.rightShoulder.rotation, -0.70 + gestWave * 0.22, -0.2 + gestCos * 0.15, 0.25, 10, dt);
      dampRot(j.rightElbow.rotation, -1.40 + gestCos * 0.35, 0.4, 0, 10, dt);
      dampRot(j.rightWrist.rotation, 0.4 + gestWave * 0.3, 0.2, gestWave * 0.4, 12, dt);

      dampRot(j.leftShoulder.rotation, -0.50 + gestCos * 0.15, 0.15, -0.2, 8, dt);
      dampRot(j.leftElbow.rotation, -1.10 + gestWave * 0.2, -0.2, 0, 8, dt);

      f.browLeft.position.y = 0.22 + Math.abs(syllableNod) * 0.025;
      f.browRight.position.y = 0.22 + Math.abs(syllableNod) * 0.025;

      drawCartoonMouth(f.mouthCtx, 'talk', t);
      f.mouthTexture.needsUpdate = true;

      if (progress >= 1.0) {
        char.animState = 'idle';
        char.animTime = 0;
      }
      break;
    }

    // ----------------------------------------------------
    // 7. JUMP_DOWN: Leaps forward from chair down to concrete floor!
    // ----------------------------------------------------
    case 'jump_down': {
      const duration = 1.25;
      const progress = Math.min(1.0, t / duration);

      if (t < 0.35) {
        // Phase 1: Crouch on chair cushion, arms pull back
        const p1 = t / 0.35;
        char.applySquashStretch?.(lerp(1.0, 0.82, p1));
        j.pelvis.position.y = lerp(chairPelvisY, 0.40, p1);
        j.pelvis.position.z = lerp(chairPelvisZ, -0.04, p1);
        dampRot(j.spine.rotation, 0.35 * p1, 0, 0, 12, dt);
        dampRot(j.leftShoulder.rotation, -0.65 * p1, 0, -0.2, 12, dt);
        dampRot(j.rightShoulder.rotation, -0.65 * p1, 0, 0.2, 12, dt);
        dampRot(j.leftHip.rotation, 0.85 * p1, 0, 0, 12, dt);
        dampRot(j.leftKnee.rotation, -1.2 * p1, 0, 0, 12, dt);
        dampRot(j.rightHip.rotation, 0.85 * p1, 0, 0, 12, dt);
        dampRot(j.rightKnee.rotation, -1.2 * p1, 0, 0, 12, dt);
      } else if (t < 0.85) {
        // Phase 2: High arc leap forward off chair towards floor
        const p2 = (t - 0.35) / 0.50;
        const arcY = Math.sin(p2 * Math.PI) * 0.28;
        char.applySquashStretch?.(1.18);
        j.pelvis.position.y = lerp(0.40, floorPelvisY, p2) + arcY;
        j.pelvis.position.z = lerp(-0.04, floorPelvisZ, p2);

        dampRot(j.spine.rotation, -0.15, 0, 0, 10, dt);
        dampRot(j.leftShoulder.rotation, 2.1, 0, -0.35, 12, dt);
        dampRot(j.rightShoulder.rotation, 2.1, 0, 0.35, 12, dt);
        dampRot(j.leftHip.rotation, 0.25, 0, 0, 10, dt);
        dampRot(j.leftKnee.rotation, -0.35, 0, 0, 10, dt);
        dampRot(j.rightHip.rotation, 0.25, 0, 0, 10, dt);
        dampRot(j.rightKnee.rotation, -0.35, 0, 0, 10, dt);

        drawCartoonMouth(f.mouthCtx, 'open_o', t);
        f.mouthTexture.needsUpdate = true;
      } else {
        // Phase 3: Land on floor with shock-absorbing crouch
        const p3 = (t - 0.85) / 0.40;
        const landingSquash = Math.sin(p3 * Math.PI) * 0.04;
        char.applySquashStretch?.(lerp(0.78, 1.0, p3));
        j.pelvis.position.y = floorPelvisY - landingSquash;
        j.pelvis.position.z = floorPelvisZ;
        char.isSeated = false;

        dampRot(j.spine.rotation, 0.18 * (1 - p3), 0, 0, 12, dt);
        dampRot(j.leftShoulder.rotation, 0.35, 0, -0.1, 10, dt);
        dampRot(j.rightShoulder.rotation, 0.35, 0, 0.1, 10, dt);
        dampRot(j.leftHip.rotation, 0, 0, 0, 10, dt);
        dampRot(j.leftKnee.rotation, 0, 0, 0, 10, dt);
        dampRot(j.rightHip.rotation, 0, 0, 0, 10, dt);
        dampRot(j.rightKnee.rotation, 0, 0, 0, 10, dt);

        drawCartoonMouth(f.mouthCtx, 'grin');
        f.mouthTexture.needsUpdate = true;

        if (progress >= 1.0) {
          char.animState = 'idle';
          char.animTime = 0;
        }
      }
      break;
    }

    // ----------------------------------------------------
    // 8. JUMP_UP: Springs from floor up onto wedding chair cushion!
    // ----------------------------------------------------
    case 'jump_up': {
      const duration = 1.30;
      const progress = Math.min(1.0, t / duration);

      if (t < 0.35) {
        // Phase 1: Deep crouch on floor
        const p1 = t / 0.35;
        char.applySquashStretch?.(lerp(1.0, 0.78, p1));
        j.pelvis.position.y = lerp(floorPelvisY, 0.09, p1);
        j.pelvis.position.z = floorPelvisZ;
        dampRot(j.spine.rotation, 0.38 * p1, 0, 0, 12, dt);
        dampRot(j.leftShoulder.rotation, -0.70 * p1, 0, 0, 12, dt);
        dampRot(j.rightShoulder.rotation, -0.70 * p1, 0, 0, 12, dt);
        dampRot(j.leftKnee.rotation, -1.3 * p1, 0, 0, 12, dt);
        dampRot(j.rightKnee.rotation, -1.3 * p1, 0, 0, 12, dt);
      } else if (t < 0.85) {
        // Phase 2: Explosive leap onto chair
        const p2 = (t - 0.35) / 0.50;
        const leapArc = Math.sin(p2 * Math.PI) * 0.30;
        char.applySquashStretch?.(1.22);
        j.pelvis.position.y = lerp(0.09, chairPelvisY, p2) + leapArc;
        j.pelvis.position.z = lerp(floorPelvisZ, chairPelvisZ, p2);

        dampRot(j.spine.rotation, -0.20, 0, 0, 10, dt);
        dampRot(j.leftShoulder.rotation, 2.25, 0, -0.3, 12, dt);
        dampRot(j.rightShoulder.rotation, 2.25, 0, 0.3, 12, dt);
        dampRot(j.leftHip.rotation, 0.65, 0, 0, 10, dt);
        dampRot(j.leftKnee.rotation, -0.90, 0, 0, 10, dt);
        dampRot(j.rightHip.rotation, 0.65, 0, 0, 10, dt);
        dampRot(j.rightKnee.rotation, -0.90, 0, 0, 10, dt);

        drawCartoonMouth(f.mouthCtx, 'open_o', t);
        f.mouthTexture.needsUpdate = true;
      } else {
        // Phase 3: Settle onto sponge cushion with dangling legs
        const p3 = (t - 0.85) / 0.45;
        const bounceSponge = Math.sin(p3 * Math.PI) * 0.035;
        char.applySquashStretch?.(lerp(0.88, 1.0, p3));
        j.pelvis.position.y = chairPelvisY - bounceSponge;
        j.pelvis.position.z = chairPelvisZ;
        char.isSeated = true;

        dampRot(j.spine.rotation, 0, 0, 0, 10, dt);
        dampRot(j.leftShoulder.rotation, 0.35, 0.08, -0.15, 8, dt);
        dampRot(j.rightShoulder.rotation, 0.35, -0.08, 0.15, 8, dt);
        dampRot(j.leftElbow.rotation, -0.70, 0, 0, 8, dt);
        dampRot(j.rightElbow.rotation, -0.70, 0, 0, 8, dt);

        // Short cute legs resting horizontally on cushion front
        dampRot(j.leftHip.rotation, 1.48, 0.05, 0, 8, dt);
        dampRot(j.leftKnee.rotation, -1.45, 0, 0, 8, dt);
        dampRot(j.rightHip.rotation, 1.48, -0.05, 0, 8, dt);
        dampRot(j.rightKnee.rotation, -1.45, 0, 0, 8, dt);

        drawCartoonMouth(f.mouthCtx, 'smile');
        f.mouthTexture.needsUpdate = true;

        if (progress >= 1.0) {
          char.animState = 'idle';
          char.animTime = 0;
        }
      }
      break;
    }

    // ----------------------------------------------------
    // 9. WALK: Rhythmic goofy meme walk with bouncing hips and swinging noodle arms
    // ----------------------------------------------------
    case 'walk': {
      char.isSeated = false;
      const walkFreq = t * 7.5;

      j.pelvis.position.z = 0;

      // Natural cartoon step bounce: double bounce per gait cycle
      const bounce = Math.abs(Math.sin(walkFreq)) * 0.040;
      const waddle = Math.sin(walkFreq) * 0.15;
      j.pelvis.position.y = floorPelvisY + bounce;

      dampRot(j.pelvis.rotation, 0.04, Math.cos(walkFreq) * 0.10, waddle, 14, dt);
      dampRot(j.spine.rotation, 0.08, 0, -waddle * 0.80, 14, dt);
      dampRot(j.head.rotation, Math.sin(walkFreq * 2) * 0.08, 0, -waddle * 0.4, 12, dt);

      // Active articulated arm swings (Shoulder + Elbow flexion!)
      const armSwing = Math.sin(walkFreq);
      dampRot(j.leftShoulder.rotation, -armSwing * 0.85 + 0.15, 0.10, -0.20, 16, dt);
      dampRot(j.leftElbow.rotation, -0.40 - Math.max(0, -armSwing) * 0.55, 0, 0, 16, dt);

      dampRot(j.rightShoulder.rotation, armSwing * 0.85 + 0.15, -0.10, 0.20, 16, dt);
      dampRot(j.rightElbow.rotation, -0.40 - Math.max(0, armSwing) * 0.55, 0, 0, 16, dt);

      // Articulated legs stepping with knee flexion
      const legSwing = Math.sin(walkFreq) * 0.85;
      dampRot(j.leftHip.rotation, legSwing, 0, 0, 16, dt);
      dampRot(j.leftKnee.rotation, Math.min(0, -Math.cos(walkFreq) * 0.95), 0, 0, 16, dt);

      dampRot(j.rightHip.rotation, -legSwing, 0, 0, 16, dt);
      dampRot(j.rightKnee.rotation, Math.min(0, Math.cos(walkFreq) * 0.95), 0, 0, 16, dt);

      // Rolling pupils and happy grinning mouth
      f.pupilLeft.position.x = Math.sin(t * 8.0) * 0.005;
      f.pupilLeft.position.y = Math.cos(t * 8.0) * 0.004;
      f.pupilRight.position.x = -Math.sin(t * 8.0) * 0.005;
      f.pupilRight.position.y = -Math.cos(t * 8.0) * 0.004;

      drawCartoonMouth(f.mouthCtx, 'grin');
      f.mouthTexture.needsUpdate = true;
      break;
    }

    // ----------------------------------------------------
    // 10. RUN: High-speed forward sprint with aerodynamic lean and rapid pumping limbs
    // ----------------------------------------------------
    case 'run': {
      char.isSeated = false;
      const runFreq = t * 14.0;

      j.pelvis.position.z = 0;

      const runBounce = Math.abs(Math.sin(runFreq)) * 0.055;
      const runRoll = Math.sin(runFreq) * 0.12;
      j.pelvis.position.y = floorPelvisY + runBounce;

      // 20 degree aerodynamic forward sprint lean
      dampRot(j.pelvis.rotation, 0.22, 0, runRoll, 16, dt);
      dampRot(j.spine.rotation, 0.28, 0, -runRoll, 16, dt);
      dampRot(j.head.rotation, -0.15, 0, 0, 12, dt);

      // Rapid pumping articulated arms
      const runArmSwing = Math.sin(runFreq);
      dampRot(j.leftShoulder.rotation, -runArmSwing * 1.25 + 0.25, 0.15, -0.25, 20, dt);
      dampRot(j.leftElbow.rotation, -0.65 - Math.abs(runArmSwing) * 0.50, 0, 0, 20, dt);

      dampRot(j.rightShoulder.rotation, runArmSwing * 1.25 + 0.25, -0.15, 0.25, 20, dt);
      dampRot(j.rightElbow.rotation, -0.65 - Math.abs(runArmSwing) * 0.50, 0, 0, 20, dt);

      // Rapid pumping articulated legs
      const runLegSwing = Math.sin(runFreq) * 1.15;
      dampRot(j.leftHip.rotation, runLegSwing, 0, 0, 20, dt);
      dampRot(j.leftKnee.rotation, Math.min(0, -Math.cos(runFreq) * 1.35), 0, 0, 20, dt);

      dampRot(j.rightHip.rotation, -runLegSwing, 0, 0, 20, dt);
      dampRot(j.rightKnee.rotation, Math.min(0, Math.cos(runFreq) * 1.35), 0, 0, 20, dt);

      drawCartoonMouth(f.mouthCtx, 'open_o', t, 0.8);
      f.mouthTexture.needsUpdate = true;
      break;
    }
  }
}

export function attachCharacterAnimator(char: CharacterInstance) {
  char.update = (dt: number, time: number) => {
    updateCharacterAnimation(char, dt, time);
  };
}
