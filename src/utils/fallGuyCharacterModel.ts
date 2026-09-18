import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import {
  CharacterInstance,
  CharacterColorPalette,
  CharacterAnimationState,
  JointHierarchy,
  FaceRig,
  PAINT_LOTTERY_COLORS,
  CustomSnapchatFaceData,
} from '../types/character';

/**
 * Smart Face Contour Crop Renderer (قص الوجه الذكي مع دمج الحواف الناعمة)
 * Real-time organic face contour extraction & blending:
 * - Natural facial outline: Hairline, Temples, Cheekbones, Jawline, Chin
 * - Soft feathered alpha blending (Zero boxy frames, melts seamlessly into Fall Guy skin)
 * - Real-time animated expressions: talking mouth, sipping pucker, shock, laughing
 */
function drawSmartCropFace(
  ctx: CanvasRenderingContext2D,
  customFace: CustomSnapchatFaceData,
  state: CharacterAnimationState,
  time: number,
  globalTime: number
): boolean {
  const video = customFace.videoElement;
  const img = customFace.fullFaceImage;
  const isVideoReady = !!(video && video.readyState >= 2 && !video.paused);

  if (!isVideoReady && !img) {
    return false;
  }

  const cx = 256;
  const cy = 256;
  const rx = 180;
  const ry = 220;

  const zoom = customFace.zoomScale ?? 1.25;
  const offX = (customFace.offsetX ?? 0) * rx;
  const offY = (customFace.offsetY ?? 0) * ry;

  const source = (isVideoReady ? video : img)!;
  const srcW = (source as HTMLVideoElement).videoWidth || (source as HTMLImageElement).naturalWidth || (source as HTMLCanvasElement).width || 480;
  const srcH = (source as HTMLVideoElement).videoHeight || (source as HTMLImageElement).naturalHeight || (source as HTMLCanvasElement).height || 480;

  const baseScale = Math.max((rx * 2.2) / srcW, (ry * 2.2) / srcH) * zoom;
  const fitW = srcW * baseScale;
  const fitH = srcH * baseScale;

  let animScaleX = 1.0;
  let animScaleY = 1.0;
  let animOffY = 0.0;

  if (state === 'drink_sip') {
    if (time >= 0.85 && time < 2.35) {
      const sipPucker = Math.sin(time * 16) * 0.04;
      animScaleX = 0.94 + sipPucker;
      animScaleY = 0.92 + sipPucker;
      animOffY = 6;
    }
  } else if (state === 'talk_german') {
    const talk = Math.abs(Math.sin(time * 12)) * 0.05;
    animScaleY = 1.0 + talk;
  } else if (state === 'laugh') {
    const chuckle = Math.sin(time * 16) * 0.04;
    animScaleX = 1.04 + chuckle;
    animScaleY = 0.96 - chuckle;
  }

  // Clear canvas completely to transparent
  ctx.clearRect(0, 0, 512, 512);

  // 1. Organic Face Contour Clipping Path (Natural facial outline)
  ctx.save();
  ctx.beginPath();
  // Forehead & Hairline arch
  ctx.moveTo(cx - rx * 0.72, cy - ry * 0.65);
  ctx.bezierCurveTo(cx - rx * 0.35, cy - ry * 0.96, cx + rx * 0.35, cy - ry * 0.96, cx + rx * 0.72, cy - ry * 0.65);
  // Right temple & cheek contour
  ctx.bezierCurveTo(cx + rx * 0.92, cy - ry * 0.35, cx + rx * 0.88, cy + ry * 0.22, cx + rx * 0.62, cy + ry * 0.66);
  // Right jawline to chin
  ctx.bezierCurveTo(cx + rx * 0.38, cy + ry * 0.92, cx + rx * 0.16, cy + ry * 0.98, cx, cy + ry * 0.98);
  // Left chin to jawline
  ctx.bezierCurveTo(cx - rx * 0.16, cy + ry * 0.98, cx - rx * 0.38, cy + ry * 0.92, cx - rx * 0.62, cy + ry * 0.66);
  // Left cheek & temple
  ctx.bezierCurveTo(cx - rx * 0.88, cy + ry * 0.22, cx - rx * 0.92, cy - ry * 0.35, cx - rx * 0.72, cy - ry * 0.65);
  ctx.closePath();
  ctx.clip();

  // 2. Render user camera / photo
  ctx.save();
  ctx.translate(cx + offX, cy + offY + animOffY);
  ctx.scale(animScaleX, animScaleY);
  if (isVideoReady) {
    ctx.scale(-1, 1); // Mirror selfie video
  }
  ctx.drawImage(source, -fitW / 2, -fitH / 2, fitW, fitH);
  ctx.restore();

  // 3. Feathered Soft Edge Alpha Blending (Melts seamlessly into Fall Guy skin)
  ctx.globalCompositeOperation = 'destination-in';
  const featherGrad = ctx.createRadialGradient(cx, cy, rx * 0.52, cx, cy, rx * 0.94);
  featherGrad.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
  featherGrad.addColorStop(0.72, 'rgba(0, 0, 0, 0.95)');
  featherGrad.addColorStop(0.92, 'rgba(0, 0, 0, 0.45)');
  featherGrad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
  ctx.fillStyle = featherGrad;
  ctx.fillRect(0, 0, 512, 512);

  ctx.restore(); // end clip & composite
  return true;
}

/**
 * Dynamic Procedural Snapchat-Style Meme Face
 * Renders lively expressive cartoon eyes, responsive mouth (talking, sipping, screaming, laughing),
 * and animated eyebrows directly onto a 2D canvas texture.
 * 100% autonomous procedural code: Zero camera / getUserMedia dependencies, 0% copyright risk.
 */
function drawSnapchatFace(
  ctx: CanvasRenderingContext2D,
  state: CharacterAnimationState,
  time: number,
  globalTime: number,
  customFace?: CustomSnapchatFaceData | null
) {
  ctx.clearRect(0, 0, 512, 512);
  if (!customFace) {
    return;
  }

  // ----------------------------------------------------
  // SMART FACE CONTOUR CROP (Live Video or Full Face Image)
  // ----------------------------------------------------
  if (customFace && (customFace.videoElement || customFace.fullFaceImage || customFace.mode?.startsWith('smart') || customFace.mode?.startsWith('astronaut'))) {
    const isHandled = drawSmartCropFace(ctx, customFace, state, time, globalTime);
    if (isHandled) return;
  }

  // Periodic natural blinking every ~3.5s + intentional reaction blinks
  const blinkCycle = (globalTime * 0.30 + time * 0.1) % 1.0;
  const isBlink = blinkCycle > 0.94;
  const blinkAmount = isBlink ? 1.0 : (state === 'victory' && Math.sin(time * 6) > 0.3) ? 0.85 : 0.0;

  // Eye Positions on 512x512 canvas
  const leftEyeX = 175;
  const rightEyeX = 337;
  const eyeY = 178;
  const mouthX = 256;
  const mouthY = 368;

  // IF custom camera/meme face is provided: draw the real cropped eyes and mouth!
  if (customFace?.leftEye && customFace?.rightEye && customFace?.mouth) {
    // 1. Left Cropped Eye
    ctx.save();
    ctx.translate(leftEyeX, eyeY);
    if (blinkAmount > 0.05) {
      ctx.scale(1.0, Math.max(0.1, 1.0 - blinkAmount * 0.9));
    }
    ctx.drawImage(customFace.leftEye, -62, -50, 124, 100);
    ctx.restore();

    // 2. Right Cropped Eye
    ctx.save();
    ctx.translate(rightEyeX, eyeY);
    if (blinkAmount > 0.05) {
      ctx.scale(1.0, Math.max(0.1, 1.0 - blinkAmount * 0.9));
    }
    ctx.drawImage(customFace.rightEye, -62, -50, 124, 100);
    ctx.restore();

    // 3. Dynamic Reactive Cropped Mouth
    ctx.save();
    ctx.translate(mouthX, mouthY);

    if (state === 'drink_sip') {
      if (time >= 0.85 && time < 2.35) {
        // Suction deformation while sipping tea!
        const sipPucker = Math.sin(time * 16) * 0.08;
        ctx.scale(0.82 + sipPucker, 0.72 + sipPucker);
      }
    } else if (state === 'talk_german') {
      // Dynamic talking mouth opening/closing with voice syllables!
      const talkCycle = Math.abs(Math.sin(time * 12));
      ctx.scale(1.0 - talkCycle * 0.10, 0.85 + talkCycle * 0.55);
    } else if (state === 'refill_shock') {
      // Gaping shock mouth!
      const shockWiggle = Math.sin(time * 26) * 0.08;
      ctx.scale(1.05 + shockWiggle, 1.40);
    } else if (state === 'laugh') {
      // Wide open laugh!
      const chuckle = Math.sin(time * 14) * 0.12;
      ctx.scale(1.22 + chuckle, 1.10 - chuckle);
    } else if (state === 'victory') {
      ctx.scale(1.18, 1.05);
    }

    ctx.drawImage(customFace.mouth, -85, -55, 170, 110);
    ctx.restore();
    return;
  }

  const eyeRadiusX = 52;
  const eyeRadiusY = 64;

  // Pupils offset (saccades / attention targeting)
  let pupilOffsetX = 0;
  let pupilOffsetY = 0;

  if (state === 'drink_sip') {
    // Look down directly at the cup
    pupilOffsetY = 15;
  } else if (state === 'refill_shock') {
    // Rapid panic vibration
    pupilOffsetX = Math.sin(time * 28) * 6;
    pupilOffsetY = -10;
  } else if (state === 'laugh') {
    pupilOffsetX = Math.sin(time * 14) * 8;
    pupilOffsetY = -4;
  } else {
    // Subtle wandering saccade
    const wander = Math.sin(globalTime * 0.8);
    pupilOffsetX = wander * 10;
    pupilOffsetY = Math.cos(globalTime * 0.5) * 4;
  }

  // Draw an eye
  const drawSingleEye = (cx: number, cy: number, isLeft: boolean) => {
    ctx.save();

    // 1. Sclera (White eye) with subtle 3D depth
    ctx.beginPath();
    ctx.ellipse(cx, cy, eyeRadiusX, eyeRadiusY, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Outline
    ctx.lineWidth = 4.5;
    ctx.strokeStyle = '#18181b';
    ctx.stroke();

    // Clip contents inside eyeball
    ctx.clip();

    // 2. Iris (Vibrant hazel/amber gradient)
    const irisX = cx + pupilOffsetX;
    const irisY = cy + pupilOffsetY;
    const irisR = 29;

    const irisGrad = ctx.createRadialGradient(irisX, irisY, 3, irisX, irisY, irisR);
    irisGrad.addColorStop(0, '#d97706'); // warm amber
    irisGrad.addColorStop(0.65, '#92400e'); // hazel brown
    irisGrad.addColorStop(1, '#1e1b18'); // dark limbal border

    ctx.beginPath();
    ctx.arc(irisX, irisY, irisR, 0, Math.PI * 2);
    ctx.fillStyle = irisGrad;
    ctx.fill();

    // 3. Pupil
    const pupilR = state === 'refill_shock' ? 8 : 14;
    ctx.beginPath();
    ctx.arc(irisX, irisY, pupilR, 0, Math.PI * 2);
    ctx.fillStyle = '#09090b';
    ctx.fill();

    // 4. Glossy Highlight Glints (Lively Snapchat meme shine)
    ctx.beginPath();
    ctx.arc(irisX - 8, irisY - 9, 7.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(irisX + 9, irisY + 7, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fill();

    // 5. Eyelid closing during blink
    if (blinkAmount > 0.05) {
      const lidH = (eyeRadiusY * 2 + 10) * blinkAmount;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.rect(cx - eyeRadiusX - 10, cy - eyeRadiusY - 10, (eyeRadiusX + 10) * 2, lidH);
      ctx.fill();

      // Eyelid line
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#1e1b18';
      ctx.beginPath();
      ctx.moveTo(cx - eyeRadiusX, cy - eyeRadiusY - 10 + lidH);
      ctx.quadraticCurveTo(cx, cy - eyeRadiusY + lidH + 4, cx + eyeRadiusX, cy - eyeRadiusY - 10 + lidH);
      ctx.stroke();
    }

    ctx.restore();

    // 6. Expressive Eyebrows
    ctx.save();
    ctx.lineWidth = 7.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#18181b';
    ctx.beginPath();
    const browY = cy - eyeRadiusY - 15;

    if (state === 'refill_shock') {
      const tilt = isLeft ? -12 : 12;
      ctx.moveTo(cx - 36, browY - 14 - tilt);
      ctx.quadraticCurveTo(cx, browY - 28, cx + 36, browY - 14 + tilt);
    } else if (state === 'laugh') {
      const tilt = isLeft ? 10 : -10;
      ctx.moveTo(cx - 35, browY + tilt);
      ctx.quadraticCurveTo(cx, browY - 12, cx + 35, browY - tilt);
    } else {
      ctx.moveTo(cx - 35, browY + 4);
      ctx.quadraticCurveTo(cx, browY - 10, cx + 35, browY + 4);
    }
    ctx.stroke();
    ctx.restore();
  };

  drawSingleEye(leftEyeX, eyeY, true);
  drawSingleEye(rightEyeX, eyeY, false);

  // ----------------------------------------------------
  // The Snapchat Mouth (الفم التفاعلي)
  // ----------------------------------------------------
  ctx.save();

  if (state === 'drink_sip') {
    if (time < 0.85) {
      // Approaching cup: Mouth anticipates, opens into small round O
      const p = time / 0.85;
      const mw = 14 + p * 12;
      const mh = 10 + p * 12;
      ctx.beginPath();
      ctx.ellipse(mouthX, mouthY, mw, mh, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#1c0505';
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#e11d48';
      ctx.stroke();
    } else if (time < 2.35) {
      // Drinking / Sipping: Realistic suction O-ring sipping from cup!
      const suckPulse = Math.sin(time * 16) * 2.5;
      const mw = 27 + suckPulse;
      const mh = 24 + suckPulse * 0.8;

      // Dark oral cavity
      ctx.beginPath();
      ctx.ellipse(mouthX, mouthY, mw, mh, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#180404';
      ctx.fill();

      // Lower tongue inside suction
      ctx.beginPath();
      ctx.ellipse(mouthX, mouthY + 8, mw * 0.65, mh * 0.45, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#f43f5e';
      ctx.fill();

      // Glossy suction lips rim
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#e11d48';
      ctx.stroke();

      // Slurp droplet highlight
      ctx.beginPath();
      ctx.arc(mouthX + mw + 4, mouthY - 4, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#d97706';
      ctx.fill();
    } else {
      // Satisfied smack smile ("Mhh bnin!")
      ctx.beginPath();
      ctx.arc(mouthX, mouthY - 8, 38, 0.2 * Math.PI, 0.8 * Math.PI, false);
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#18181b';
      ctx.stroke();

      // Cute rosy cheek glow
      ctx.beginPath();
      ctx.arc(mouthX - 44, mouthY + 8, 6, 0, Math.PI * 2);
      ctx.arc(mouthX + 44, mouthY + 8, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
      ctx.fill();
    }
  } else if (state === 'talk_german') {
    // Dynamic phonetic talking mouth
    const talkCycle = Math.abs(Math.sin(time * 12));
    const mw = 36 + talkCycle * 14;
    const mh = 12 + talkCycle * 26;

    ctx.beginPath();
    ctx.ellipse(mouthX, mouthY, mw, mh, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#1c0505';
    ctx.fill();
    ctx.lineWidth = 5.5;
    ctx.strokeStyle = '#18181b';
    ctx.stroke();

    ctx.save();
    ctx.clip();

    // Top teeth row
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(mouthX - mw * 0.75, mouthY - mh, mw * 1.5, mh * 0.52);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#cbd5e1';
    for (let t = -2; t <= 2; t++) {
      ctx.beginPath();
      ctx.moveTo(mouthX + t * 9, mouthY - mh);
      ctx.lineTo(mouthX + t * 9, mouthY - mh * 0.48);
      ctx.stroke();
    }

    // Bouncing tongue
    ctx.beginPath();
    ctx.ellipse(mouthX, mouthY + mh * 0.45, mw * 0.65, mh * 0.50, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#f43f5e';
    ctx.fill();

    ctx.restore();
  } else if (state === 'refill_shock') {
    // Shock / Horror: Giant screaming elongated mouth with shaking tongue
    const shockW = 34 + Math.sin(time * 24) * 3;
    const shockH = 58;

    ctx.beginPath();
    ctx.ellipse(mouthX, mouthY + 12, shockW, shockH, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#1c0505';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#18181b';
    ctx.stroke();

    ctx.save();
    ctx.clip();

    const wiggle = Math.sin(time * 30) * 8;
    ctx.beginPath();
    ctx.ellipse(mouthX + wiggle, mouthY + shockH * 0.5, shockW * 0.7, shockH * 0.35, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#f43f5e';
    ctx.fill();

    ctx.restore();
  } else if (state === 'laugh') {
    // Giant laughing grin
    const mw = 58 + Math.sin(time * 14) * 4;
    const mh = 38 + Math.cos(time * 14) * 4;

    ctx.beginPath();
    ctx.ellipse(mouthX, mouthY, mw, mh, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#1c0505';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#18181b';
    ctx.stroke();

    ctx.save();
    ctx.clip();

    // Upper teeth
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(mouthX - mw * 0.8, mouthY - mh, mw * 1.6, mh * 0.48);

    // Tongue
    ctx.beginPath();
    ctx.ellipse(mouthX, mouthY + mh * 0.35, mw * 0.65, mh * 0.55, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#f43f5e';
    ctx.fill();

    ctx.restore();
  } else if (state === 'victory') {
    // Beaming smile with teeth
    ctx.beginPath();
    ctx.arc(mouthX, mouthY - 14, 48, 0.15 * Math.PI, 0.85 * Math.PI, false);
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#18181b';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(mouthX, mouthY - 14, 48, 0.25 * Math.PI, 0.75 * Math.PI, false);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  } else {
    // Idle: Contented gentle smile
    const breath = Math.sin(globalTime * 2.0) * 2;
    ctx.beginPath();
    ctx.arc(mouthX, mouthY - 18 + breath, 42, 0.22 * Math.PI, 0.78 * Math.PI, false);
    ctx.lineWidth = 5.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#18181b';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(mouthX - 35, mouthY + breath - 4, 3, 0, Math.PI * 2);
    ctx.arc(mouthX + 35, mouthY + breath - 4, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#71717a';
    ctx.fill();
  }

  ctx.restore();
}

export interface AstronautVisorAssemblyResult {
  group: THREE.Group;
  faceMesh: THREE.Mesh;
  glassDomeMesh: THREE.Mesh;
  cavityMesh: THREE.Mesh;
  bezelMesh?: THREE.Mesh;
  skinLipMesh?: THREE.Mesh;
  headStrapGroup?: THREE.Group;
  setStrapVisible?: (visible: boolean) => void;
}

/**
 * 3D Organic Body Glass Visor & Hollow Interior Chamber + VR Head-Strap Option
 * - Rounded Organic Skin Lip & Thickness ("misaa7a mno howa dayrra w kharja b wa7ed epeceur")
 * - 100% matched to character's skin material & color (NO metal, NO screws, NO pipes!)
 * - Deep Hollow Space Cavity ("o kiban ldakhel dyalha khawi")
 * - Photorealistic 3D Physical Optical Glass Dome with Refraction & Gloss ("jaja wa9i3iya")
 * - Ergonomic VR Head-Strap wrapping around skull ("VR b seemta") with live toggle
 */
export function createAstronautVisorAssembly(faceTexture?: THREE.Texture): AstronautVisorAssemblyResult {
  const visorGroup = new THREE.Group();
  visorGroup.name = 'smartFaceAssembly';
  visorGroup.visible = true;

  // Organic curved plane geometry wrapping naturally around the front of the Fall Guy's head
  const width = 0.65;
  const height = 0.72;
  const geo = new THREE.PlaneGeometry(width, height, 16, 16);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    // Wrap curved backwards along the head sides so it hugs the skull seamlessly
    const zCurve = -0.35 * (x * x);
    pos.setZ(i, pos.getZ(i) + zCurve);
  }
  geo.computeVertexNormals();

  const faceMaterial = new THREE.MeshBasicMaterial({
    map: faceTexture ?? null,
    transparent: true,
    opacity: 1.0,
    depthWrite: false, // ZERO z-fighting or sinking into the skin!
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
    side: THREE.DoubleSide,
  });

  const faceMesh = new THREE.Mesh(geo, faceMaterial);
  faceMesh.name = 'smartCropFaceMesh';
  // Positioned exactly at the faceplate center in head bone local space (calibrated empirically)
  faceMesh.position.set(0, -0.60, -0.618);
  faceMesh.rotation.set(Math.PI, 0, 0); // Upright orientation in head bone space
  faceMesh.renderOrder = 999;
  faceMesh.visible = false; // Hidden until custom face is provided
  visorGroup.add(faceMesh);

  const dummyMesh = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ visible: false }));
  dummyMesh.visible = false;

  const headStrapGroup = new THREE.Group();
  headStrapGroup.visible = false;

  return {
    group: visorGroup,
    faceMesh,
    glassDomeMesh: dummyMesh,
    cavityMesh: dummyMesh,
    skinLipMesh: dummyMesh,
    bezelMesh: dummyMesh,
    headStrapGroup,
    setStrapVisible: (_visible: boolean) => {},
  };
}

export function createFallGuyCharacterInstance(
  gltf: { scene: THREE.Group; animations: THREE.AnimationClip[] },
  playerIndex: number = 0,
  paletteOverride?: CharacterColorPalette
): CharacterInstance {
  const palette =
    paletteOverride ??
    PAINT_LOTTERY_COLORS[playerIndex % PAINT_LOTTERY_COLORS.length];

  // Deep clone rigged skeleton using Three.js SkeletonUtils
  const fallGuyRoot = SkeletonUtils.clone(gltf.scene) as THREE.Group;
  fallGuyRoot.userData = { playerIndex, isFallGuy: true };

  // Scale to match the garage wedding chair dimensions (~0.65m tall)
  const fallGuyScale = 0.28;
  fallGuyRoot.scale.set(fallGuyScale, fallGuyScale, fallGuyScale);

  // Find meshes and bones
  let bodyMeshInstance: THREE.SkinnedMesh | undefined;
  let hipL: THREE.Bone | undefined;
  let hipR: THREE.Bone | undefined;
  let kneeL: THREE.Bone | undefined;
  let kneeR: THREE.Bone | undefined;
  let chestBone: THREE.Bone | undefined;
  let headBone: THREE.Bone | undefined;
  let shoulderL: THREE.Bone | undefined;
  let shoulderR: THREE.Bone | undefined;
  let elbowL: THREE.Bone | undefined;
  let elbowR: THREE.Bone | undefined;
  let wristL: THREE.Bone | undefined;
  let wristR: THREE.Bone | undefined;

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: palette.bodyColor,
    roughness: 0.35,
    metalness: 0.05,
  });

  const bellyMaterial = new THREE.MeshStandardMaterial({
    color: palette.bellyColor,
    roughness: 0.4,
    metalness: 0.05,
  });

  let originalEyeMesh: THREE.Object3D | undefined;

  fallGuyRoot.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      const mesh = child as THREE.SkinnedMesh;
      if (!bodyMeshInstance) bodyMeshInstance = mesh;

      if (child.name === 'eye') {
        originalEyeMesh = child;
        child.visible = true; // Authentic Fall Guy cute eyes
      }

      // Color customization for body & limbs while preserving faceplate and eyes
      if (child.name === 'body' || child.name === 'hand-' || child.name === 'leg') {
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((m) => {
            const cloned = m.clone();
            if ('color' in cloned) (cloned as THREE.MeshStandardMaterial).color.set(palette.bodyColor);
            return cloned;
          });
        } else if (mesh.material) {
          const cloned = mesh.material.clone();
          if ('color' in cloned) (cloned as THREE.MeshStandardMaterial).color.set(palette.bodyColor);
          mesh.material = cloned;
        }
      }
    }

    if ((child as THREE.Bone).isBone) {
      const bone = child as THREE.Bone;
      if (bone.name.includes('Hip_L')) hipL = bone;
      else if (bone.name.includes('Hip_R')) hipR = bone;
      else if (bone.name.includes('Knee_L')) kneeL = bone;
      else if (bone.name.includes('Knee_R')) kneeR = bone;
      else if (bone.name.includes('Chest')) chestBone = bone;
      else if (bone.name.includes('Head') && !bone.name.includes('nub')) headBone = bone;
      else if (bone.name.includes('Shoulder_L')) shoulderL = bone;
      else if (bone.name.includes('Shoulder_R')) shoulderR = bone;
      else if (bone.name.includes('Elbow_L')) elbowL = bone;
      else if (bone.name.includes('Elbow_R')) elbowR = bone;
      else if (bone.name.includes('Wrist_L')) wristL = bone;
      else if (bone.name.includes('Wrist_R')) wristR = bone;
    }
  });

  // Capture initial rest quaternions for stable relative transformations (ZERO rotation accumulation!)
  const restChestQ = chestBone?.quaternion.clone() ?? new THREE.Quaternion();
  const restHeadQ = headBone?.quaternion.clone() ?? new THREE.Quaternion();
  const restShoulderLQ = shoulderL?.quaternion.clone() ?? new THREE.Quaternion();
  const restShoulderRQ = shoulderR?.quaternion.clone() ?? new THREE.Quaternion();
  const restElbowLQ = elbowL?.quaternion.clone() ?? new THREE.Quaternion();
  const restElbowRQ = elbowR?.quaternion.clone() ?? new THREE.Quaternion();
  const restWristLQ = wristL?.quaternion.clone() ?? new THREE.Quaternion();
  const restWristRQ = wristR?.quaternion.clone() ?? new THREE.Quaternion();
  const restHipLQ = hipL?.quaternion.clone() ?? new THREE.Quaternion();
  const restHipRQ = hipR?.quaternion.clone() ?? new THREE.Quaternion();
  const restKneeLQ = kneeL?.quaternion.clone() ?? new THREE.Quaternion();
  const restKneeRQ = kneeR?.quaternion.clone() ?? new THREE.Quaternion();

  // Skeleton Helper for visualizer
  const skeletonHelper = new THREE.SkeletonHelper(fallGuyRoot);
  skeletonHelper.visible = false;
  fallGuyRoot.add(skeletonHelper);

  // Animation Mixer
  const mixer = new THREE.AnimationMixer(fallGuyRoot);
  const actions: Record<string, THREE.AnimationAction> = {};
  for (const clip of gltf.animations) {
    actions[clip.name] = mixer.clipAction(clip);
  }

  // Active action tracking
  let currentAction: THREE.AnimationAction | undefined;

  const playAction = (name: string, duration: number = 0.3, loop: boolean = true, timeScale: number = 1.0) => {
    const nextAction = actions[name];
    if (!nextAction) return;

    nextAction.timeScale = timeScale;

    if (currentAction === nextAction) {
      if (!currentAction.isRunning()) {
        currentAction.play();
      }
      return;
    }

    nextAction.reset();
    nextAction.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
    nextAction.clampWhenFinished = !loop;

    if (currentAction) {
      currentAction.crossFadeTo(nextAction, duration, true);
    }
    nextAction.play();
    currentAction = nextAction;
  };

  // Start with Idle
  if (actions['idle']) {
    playAction('idle', 0.2, true);
  }

  // Dummy joints & face for CharacterInstance compatibility
  const dummyGroup = new THREE.Group();
  const dummyMesh = new THREE.Mesh(new THREE.BufferGeometry(), bodyMaterial);
  const dummyCanvas = document.createElement('canvas');
  dummyCanvas.width = 64;
  dummyCanvas.height = 64;
  const dummyCtx = dummyCanvas.getContext('2d')!;

  const joints: JointHierarchy = {
    root: fallGuyRoot,
    pelvis: (chestBone ?? dummyGroup),
    spine: (chestBone ?? dummyGroup),
    chest: (chestBone ?? dummyGroup),
    neck: (headBone ?? dummyGroup),
    head: (headBone ?? dummyGroup),
    leftClavicle: (shoulderL ?? dummyGroup) as any,
    leftShoulder: (shoulderL ?? dummyGroup) as any,
    leftElbow: (elbowL ?? dummyGroup) as any,
    leftWrist: (wristL ?? dummyGroup) as any,
    leftHand: (wristL ?? dummyGroup) as any,
    rightClavicle: (shoulderR ?? dummyGroup) as any,
    rightShoulder: (shoulderR ?? dummyGroup) as any,
    rightElbow: (elbowR ?? dummyGroup) as any,
    rightWrist: (wristR ?? dummyGroup) as any,
    rightHand: (wristR ?? dummyGroup) as any,
    leftHip: (hipL ?? dummyGroup) as any,
    leftKnee: (kneeL ?? dummyGroup) as any,
    leftAnkle: dummyGroup,
    leftFoot: dummyGroup,
    rightHip: (hipR ?? dummyGroup) as any,
    rightKnee: (kneeR ?? dummyGroup) as any,
    rightAnkle: dummyGroup,
    rightFoot: dummyGroup,
  };

  // Dynamic Snapchat Meme Face Rig (Lively animated mouth & expressive eyes!)
  const faceCanvas = document.createElement('canvas');
  faceCanvas.width = 512;
  faceCanvas.height = 512;
  const faceCtx = faceCanvas.getContext('2d')!;
  const faceTexture = new THREE.CanvasTexture(faceCanvas);
  faceTexture.colorSpace = THREE.SRGBColorSpace;

  // Initial render
  drawSnapchatFace(faceCtx, 'idle', 0, 0);
  faceTexture.needsUpdate = true;

  // 3D Organic Smart Face Assembly (Zero-Penetration Curved Decal on Head Bone)
  const visorAssembly = createAstronautVisorAssembly(faceTexture);

  if (headBone) {
    headBone.add(visorAssembly.group);
    if (visorAssembly.headStrapGroup) headBone.add(visorAssembly.headStrapGroup);
  } else {
    fallGuyRoot.add(visorAssembly.group);
    if (visorAssembly.headStrapGroup) fallGuyRoot.add(visorAssembly.headStrapGroup);
  }

  const face: FaceRig = {
    eyeLeft: dummyMesh,
    eyeRight: dummyMesh,
    pupilLeft: dummyMesh,
    pupilRight: dummyMesh,
    browLeft: dummyMesh,
    browRight: dummyMesh,
    mouthMesh: visorAssembly.faceMesh,
    mouthCanvas: faceCanvas,
    mouthCtx: faceCtx,
    mouthTexture: faceTexture,
    cheeks: dummyGroup,
    throatBulgeMesh: dummyMesh,
  };

  let prevAnimState: CharacterAnimationState = 'idle';

  const instance: CharacterInstance = {
    group: fallGuyRoot,
    joints,
    face,
    bodyMesh: bodyMeshInstance ?? dummyMesh,
    bodyMaterial,
    bellyMaterial,
    palette,
    animState: 'idle',
    animTime: 0,
    stateDuration: 0,
    playerIndex,
    isSeated: true,
    skeletonHelper,
    showSkeleton: false,
    snapchatFaceEnabled: true,
    customSnapchatFace: null,
    isStrapVisible: true,

    toggleStrap: (enabled: boolean) => {
      instance.isStrapVisible = enabled;
      visorAssembly.setStrapVisible?.(enabled);
    },

    setCustomSnapchatFace: (faceData: CustomSnapchatFaceData | null) => {
      instance.customSnapchatFace = faceData;
      if (faceData) {
        visorAssembly.faceMesh.visible = true;
        if (originalEyeMesh) originalEyeMesh.visible = false;
        drawSmartCropFace(faceCtx, faceData, instance.animState, instance.animTime, 0);
        faceTexture.needsUpdate = true;
      } else {
        visorAssembly.faceMesh.visible = false;
        if (originalEyeMesh) originalEyeMesh.visible = true;
      }
    },

    toggleSnapchatFace: (enabled: boolean) => {
      instance.snapchatFaceEnabled = enabled;
      visorAssembly.faceMesh.visible = enabled && !!instance.customSnapchatFace;
      if (originalEyeMesh) {
        originalEyeMesh.visible = !enabled || !instance.customSnapchatFace;
      }
    },

    setAnimation: (state: CharacterAnimationState) => {
      instance.animState = state;
      instance.animTime = 0;
    },

    setPalette: (newPalette: CharacterColorPalette) => {
      instance.palette = newPalette;
      if (visorAssembly.skinLipMesh && (visorAssembly.skinLipMesh.material as THREE.MeshStandardMaterial).color) {
        (visorAssembly.skinLipMesh.material as THREE.MeshStandardMaterial).color.set(newPalette.bodyColor);
      }
      fallGuyRoot.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && (child.name === 'body' || child.name === 'hand-' || child.name === 'leg')) {
          const mesh = child as THREE.Mesh;
          if (mesh.material && 'color' in mesh.material) {
            (mesh.material as THREE.MeshStandardMaterial).color.set(newPalette.bodyColor);
          }
        }
      });
    },

    toggleSkeleton: (visible: boolean) => {
      instance.showSkeleton = visible;
      if (skeletonHelper) {
        skeletonHelper.visible = visible;
      }
    },

    update: (dt: number, _time: number) => {
      instance.animTime += dt;
      const t = instance.animTime;
      const state = instance.animState;

      if (state !== prevAnimState) {
        prevAnimState = state;
      }

      // Map semantic animation state to Fall Guy animations:
      // 'dive', 'fall', 'idle', 'jump_air', 'jump_up', 'run', 'walk', 'wave'
      switch (state) {
        case 'idle': {
          playAction('idle', 0.35, true, 1.0);
          break;
        }

        case 'drink_sip': {
          instance.isSeated = true;
          playAction('idle', 0.25, true, 1.0);
          if (t >= 3.2) {
            instance.animState = 'idle';
            instance.animTime = 0;
          }
          break;
        }

        case 'refill_shock': {
          instance.isSeated = true;
          playAction('idle', 0.2, true, 1.0);
          if (t >= 2.4) {
            instance.animState = 'idle';
            instance.animTime = 0;
          }
          break;
        }

        case 'victory': {
          instance.isSeated = true;
          playAction('wave', 0.25, true, 1.1);
          if (t >= 3.2) {
            instance.animState = 'idle';
            instance.animTime = 0;
          }
          break;
        }

        case 'laugh': {
          instance.isSeated = true;
          playAction('idle', 0.2, true, 1.0);
          if (t >= 3.0) {
            instance.animState = 'idle';
            instance.animTime = 0;
          }
          break;
        }

        case 'talk_german': {
          instance.isSeated = true;
          playAction('idle', 0.25, true, 1.0);
          if (t >= 3.5) {
            instance.animState = 'idle';
            instance.animTime = 0;
          }
          break;
        }

        case 'walk': {
          instance.isSeated = false;
          playAction('walk', 0.25, true, 1.1);
          break;
        }

        case 'run': {
          instance.isSeated = false;
          playAction('run', 0.2, true, 1.2);
          break;
        }

        case 'jump_down': {
          if (t < 0.25) {
            instance.isSeated = true;
            playAction('jump_up', 0.15, false, 1.4);
          } else if (t < 0.85) {
            instance.isSeated = false;
            playAction('jump_air', 0.2, true, 1.2);
          } else if (t < 1.25) {
            instance.isSeated = false;
            playAction('dive', 0.15, false, 1.3);
          } else {
            instance.isSeated = false;
            playAction('idle', 0.25, true, 1.0);
            if (t >= 1.65) {
              instance.animState = 'idle';
              instance.animTime = 0;
            }
          }
          break;
        }

        case 'jump_up': {
          if (t < 0.20) {
            playAction('jump_up', 0.15, false, 1.4);
          } else if (t < 0.75) {
            playAction('jump_air', 0.15, true, 1.2);
          } else {
            instance.isSeated = true;
            playAction('idle', 0.25, true, 1.0);
            if (t >= 1.25) {
              instance.animState = 'idle';
              instance.animTime = 0;
            }
          }
          break;
        }
      }

      // Step mixer
      mixer.update(dt);

      // When seated on wedding chair, bend knees/hips forward naturally over the cushion edge
      if (instance.isSeated && state !== 'jump_down' && state !== 'jump_up') {
        if (hipL) {
          const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.55, 0, 0.08, 'XYZ'));
          hipL.quaternion.copy(restHipLQ).multiply(q);
        }
        if (hipR) {
          const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.55, 0, -0.08, 'XYZ'));
          hipR.quaternion.copy(restHipRQ).multiply(q);
        }
        if (kneeL) {
          const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.65, 0, 0, 'XYZ'));
          kneeL.quaternion.copy(restKneeLQ).multiply(q);
        }
        if (kneeR) {
          const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.65, 0, 0, 'XYZ'));
          kneeR.quaternion.copy(restKneeRQ).multiply(q);
        }
      }

      // Natural, physically accurate drinking kinematics for Fall Guy
      if (state === 'drink_sip' && t < 2.95) {
        let chestRx = 0;
        let headRx = 0;
        let sRx = 0;
        let sRy = 0;
        let sRz = 0;

        if (t < 0.85) {
          // Phase 1: Reaching toward cup on table
          const p = t / 0.85;
          const u = p * p * (3 - 2 * p);
          chestRx = 0.08 * u;
          headRx = 0.06 * u;
          sRx = -0.38 * u;
          sRy = 0.14 * u;
          sRz = 0.22 * u;
        } else if (t < 1.45) {
          // Phase 2: Smoothly raising cup to mouth
          const p = (t - 0.85) / 0.60;
          const u = p * p * (3 - 2 * p);
          chestRx = THREE.MathUtils.lerp(0.08, -0.05, u);
          headRx = THREE.MathUtils.lerp(0.06, -0.12, u);
          sRx = THREE.MathUtils.lerp(-0.38, -0.15, u);
          sRy = THREE.MathUtils.lerp(0.14, 0.28, u);
          sRz = THREE.MathUtils.lerp(0.22, 0.58, u);
        } else if (t < 2.35) {
          // Phase 3: Sipping & subtle swallow tilt
          const swallow = Math.sin((t - 1.45) * 8.0) * 0.02;
          chestRx = -0.05;
          headRx = -0.12 - swallow;
          sRx = -0.15;
          sRy = 0.28;
          sRz = 0.58;
        } else {
          // Phase 4: Setting cup smoothly back down to table
          const p = (t - 2.35) / 0.60;
          const u = p * p * (3 - 2 * p);
          chestRx = THREE.MathUtils.lerp(-0.05, 0, u);
          headRx = THREE.MathUtils.lerp(-0.12, 0, u);
          sRx = THREE.MathUtils.lerp(-0.15, 0, u);
          sRy = THREE.MathUtils.lerp(0.28, 0, u);
          sRz = THREE.MathUtils.lerp(0.58, 0, u);
        }

        if (chestBone) {
          const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(chestRx, 0, 0, 'XYZ'));
          chestBone.quaternion.copy(restChestQ).multiply(q);
        }
        if (headBone) {
          const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(headRx, 0, 0, 'XYZ'));
          headBone.quaternion.copy(restHeadQ).multiply(q);
        }
        if (shoulderR) {
          const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(sRx, sRy, sRz, 'XYZ'));
          shoulderR.quaternion.copy(restShoulderRQ).multiply(q);
        }
      }

      // Natural secondary motion enhancers
      if (state === 'jump_down') {
        if (t < 0.25) {
          const p = t / 0.25;
          const chestTilt = 0.25 * Math.sin(p * Math.PI);
          if (chestBone) {
            const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(chestTilt, 0, 0, 'XYZ'));
            chestBone.quaternion.copy(restChestQ).multiply(q);
          }
        }
      } else if (state === 'laugh') {
        // Natural chuckle bounce
        const chuckle = Math.sin(t * 8.0) * 0.04;
        if (chestBone) {
          const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(chuckle, 0, 0, 'XYZ'));
          chestBone.quaternion.copy(restChestQ).multiply(q);
        }
        if (headBone) {
          const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-chuckle * 1.2, 0, 0, 'XYZ'));
          headBone.quaternion.copy(restHeadQ).multiply(q);
        }
      } else if (state === 'refill_shock' && t < 2.0) {
        // Natural shock recoil and recovery
        const p = Math.min(1.0, t / 0.4);
        const shock = Math.sin(p * Math.PI) * 0.18 * Math.exp(-t * 1.2);
        if (chestBone) {
          const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-shock * 0.8, 0, 0, 'XYZ'));
          chestBone.quaternion.copy(restChestQ).multiply(q);
        }
        if (headBone) {
          const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-shock, 0, 0, 'XYZ'));
          headBone.quaternion.copy(restHeadQ).multiply(q);
        }
      } else if (state === 'talk_german') {
        // Natural conversational nodding
        const nod = Math.sin(t * 5.0) * 0.05;
        const tilt = Math.cos(t * 2.5) * 0.03;
        if (headBone) {
          const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(nod, tilt, 0, 'XYZ'));
          headBone.quaternion.copy(restHeadQ).multiply(q);
        }
      }


      // Only render face texture if custom camera/face is actively provided
      if (instance.customSnapchatFace && instance.snapchatFaceEnabled !== false) {
        if (!visorAssembly.faceMesh.visible) visorAssembly.faceMesh.visible = true;
        if (originalEyeMesh && originalEyeMesh.visible) originalEyeMesh.visible = false;
        drawSmartCropFace(faceCtx, instance.customSnapchatFace, instance.animState, instance.animTime, _time);
        faceTexture.needsUpdate = true;
      }
    },
  };

  return instance;
}
