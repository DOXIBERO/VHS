import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { playSwitchSound } from '../utils/teaSounds';
import { DrinkType, DRINKS, DrinkDef, CupStyle } from '../types/drinks';
import {
  CharacterAnimationState,
  CharacterColorPalette,
  PAINT_LOTTERY_COLORS,
  CharacterInstance,
  CharacterModelType,
  CustomSnapchatFaceData,
} from '../types/character';
import { createCharacterInstance } from '../utils/characterModel';
import { createRobotCharacterInstance } from '../utils/robotCharacterModel';
import { createFallGuyCharacterInstance } from '../utils/fallGuyCharacterModel';
import { attachCharacterAnimator } from '../utils/characterAnimator';

export interface GarageSceneProps {
  lightOn: boolean;
  onToggleLight: () => void;
  playerCount?: number;
  activePlayerIndex?: number;
  glassesSips?: number[];
  activeDrink?: DrinkType;
  cupStyle?: CupStyle;
  lastAction?: { type: 'sip' | 'refill' | 'reset'; playerIndex: number; id: number } | null;
  onGlassClick?: (playerIndex: number) => void;
  // Character Studio Props
  studioAnimation?: { state: CharacterAnimationState; id: number; playerIndex?: number } | null;
  showSkeleton?: boolean;
  activeSkinId?: string;
  focusCharacter?: boolean;
  onCharacterClick?: (playerIndex: number) => void;
  characterModelType?: CharacterModelType;
  snapchatFace?: boolean;
  customSnapchatFace?: CustomSnapchatFaceData | null;
}

interface GlassAnimatedInstance {
  group: THREE.Group;
  teaCupGroup: THREE.Group;
  coffeeCupGroup: THREE.Group;
  plasticCupGroup: THREE.Group;
  liquidMesh: THREE.Mesh;
  meniscusMesh: THREE.Mesh;
  mintGroup: THREE.Group;
  haloMesh: THREE.Mesh;
  bubbleParticles: THREE.Points;
  currentFill: number;
  targetFill: number;
  playerIndex: number;
  sloshAmp: number;
  sloshAngle: number;
  currentCupType: 'kas_7yati' | 'kas_qahwa' | 'kas_plastic';
  updateCupType: (cupType: 'kas_7yati' | 'kas_qahwa' | 'kas_plastic') => void;
  baseAngle?: number;
  restX?: number;
  restZ?: number;
}

interface ChairAnimatedInstance {
  group: THREE.Group;
  baseAngle: number;
  currentRadius: number;
  targetRadius: number;
}

interface CupDimension {
  baseH: number;
  maxH: number;
  rBot: number;
  rTop: number;
}

const CUP_DIMENSIONS: Record<'kas_7yati' | 'kas_qahwa' | 'kas_plastic', CupDimension> = {
  kas_7yati: {
    baseH: 0.008,
    maxH: 0.070,
    rBot: 0.0202,
    rTop: 0.0248,
  },
  kas_qahwa: {
    baseH: 0.012,
    maxH: 0.050,
    rBot: 0.0208,
    rTop: 0.0236,
  },
  kas_plastic: {
    baseH: 0.003,
    maxH: 0.080,
    rBot: 0.0192,
    rTop: 0.0272,
  },
};

export const GarageScene: React.FC<GarageSceneProps> = ({
  lightOn,
  onToggleLight,
  playerCount = 1,
  activePlayerIndex = 0,
  glassesSips = [5],
  activeDrink = 'atay',
  cupStyle = 'authentic',
  lastAction = null,
  onGlassClick,
  studioAnimation = null,
  showSkeleton = false,
  activeSkinId,
  focusCharacter = false,
  onCharacterClick,
  characterModelType = 'fallguy',
  snapchatFace = true,
  customSnapchatFace = null,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bulbPointLightRef = useRef<THREE.PointLight | null>(null);
  const filamentMeshRef = useRef<THREE.Mesh | null>(null);
  const bulbPivotRef = useRef<THREE.Group | null>(null);
  const chairsGroupRef = useRef<THREE.Group | null>(null);
  const glassesGroupRef = useRef<THREE.Group | null>(null);
  const charactersGroupRef = useRef<THREE.Group | null>(null);
  const characterInstancesRef = useRef<CharacterInstance[]>([]);
  const chairInstancesRef = useRef<ChairAnimatedInstance[]>([]);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const glassInstancesRef = useRef<GlassAnimatedInstance[]>([]);
  const activeDrinkRef = useRef<DrinkType>(activeDrink);
  const cupStyleRef = useRef<CupStyle>(cupStyle);
  const showSkeletonRef = useRef<boolean>(showSkeleton);
  const focusCharacterRef = useRef<boolean>(focusCharacter);
  const characterModelTypeRef = useRef<CharacterModelType>(characterModelType);
  characterModelTypeRef.current = characterModelType;
  const fallGuyGltfRef = useRef<{ scene: THREE.Group; animations: THREE.AnimationClip[] } | null>(null);
  const robotGltfRef = useRef<{ scene: THREE.Group; animations: THREE.AnimationClip[] } | null>(null);
  const arrangeChairsAndGlassesRef = useRef<((count: number, sipsList: number[], activeIdx: number) => void) | null>(null);
  const streamMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const splashMaterialRef = useRef<THREE.PointsMaterial | null>(null);
  const pourGroupRef = useRef<THREE.Group | null>(null);
  const pourAnimRef = useRef<{
    active: boolean;
    playerIndex: number;
    startTime: number;
    duration: number;
  }>({
    active: false,
    playerIndex: 0,
    startTime: 0,
    duration: 750,
  });

  const materialsRef = useRef<{
    goldTube: THREE.MeshStandardMaterial;
    redCushion: THREE.MeshStandardMaterial;
    castIron: THREE.MeshStandardMaterial;
    glass: THREE.MeshPhysicalMaterial;
    plastic: THREE.MeshPhysicalMaterial;
    pattern: THREE.MeshBasicMaterial;
    tea: THREE.MeshStandardMaterial;
    meniscus: THREE.MeshStandardMaterial;
    mint: THREE.MeshStandardMaterial;
    watermark: THREE.MeshBasicMaterial;
    halo: THREE.MeshBasicMaterial;
  } | null>(null);

  // Helper to create square cushion geometry with soft rounded edges
  const createSoftRoundedBoxGeometry = (
    w: number,
    d: number,
    thickness: number,
    radius: number,
    bevel: number
  ) => {
    const shape = new THREE.Shape();
    const halfW = w / 2 - bevel;
    const halfD = d / 2 - bevel;
    const rad = Math.min(radius, halfW, halfD);

    shape.moveTo(-halfW + rad, -halfD);
    shape.lineTo(halfW - rad, -halfD);
    shape.quadraticCurveTo(halfW, -halfD, halfW, -halfD + rad);
    shape.lineTo(halfW, halfD - rad);
    shape.quadraticCurveTo(halfW, halfD, halfW - rad, halfD);
    shape.lineTo(-halfW + rad, halfD);
    shape.quadraticCurveTo(-halfW, halfD, -halfW, halfD - rad);
    shape.lineTo(-halfW, -halfD + rad);
    shape.quadraticCurveTo(-halfW, -halfD, -halfW + rad, -halfD);

    const extrudeSettings = {
      depth: Math.max(0.005, thickness - bevel * 2),
      bevelEnabled: true,
      bevelSegments: 5,
      bevelSize: bevel,
      bevelThickness: bevel,
      curveSegments: 16,
    };

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center();
    return geo;
  };

  // Authentic Moroccan Wedding Chair (Square cushions, soft rounded edges, unpierced frame, NO spindles, NO crossbars)
  const createWeddingChair = (
    goldTubeMat: THREE.Material,
    redCushionMat: THREE.Material,
    castIronMat: THREE.Material
  ) => {
    const chair = new THREE.Group();
    const seatH = 0.44;               // seat frame height from floor
    const tubeR = 0.010;              // 20mm gold tube diameter
    const backH = 0.48;               // backrest height above seat
    const totalBackY = seatH + backH; // 0.92m total chair height

    const rearX = 0.17;               // half-width at back posts (34cm width)
    const rearZ = -0.17;              // back posts Z position
    const frontX = 0.17;              // half-width at front legs (34cm width)
    const frontZ = 0.16;              // front legs Z position

    // 1. HORIZONTAL GOLD TUBULAR SEAT FRAME (Underneath the cushion)
    const rearRailGeo = new THREE.CylinderGeometry(tubeR, tubeR, rearX * 2, 12);
    rearRailGeo.rotateZ(Math.PI / 2);
    const rearRail = new THREE.Mesh(rearRailGeo, goldTubeMat);
    rearRail.position.set(0, seatH, rearZ);
    rearRail.castShadow = true;
    chair.add(rearRail);

    const frontRailGeo = new THREE.CylinderGeometry(tubeR, tubeR, frontX * 2, 12);
    frontRailGeo.rotateZ(Math.PI / 2);
    const frontRail = new THREE.Mesh(frontRailGeo, goldTubeMat);
    frontRail.position.set(0, seatH, frontZ);
    frontRail.castShadow = true;
    chair.add(frontRail);

    const sideDepth = frontZ - rearZ;
    const sideRailGeo = new THREE.CylinderGeometry(tubeR, tubeR, sideDepth, 12);
    sideRailGeo.rotateX(Math.PI / 2);

    const leftSideRail = new THREE.Mesh(sideRailGeo, goldTubeMat);
    leftSideRail.position.set(-rearX, seatH, (frontZ + rearZ) / 2);
    leftSideRail.castShadow = true;
    chair.add(leftSideRail);

    const rightSideRail = new THREE.Mesh(sideRailGeo, goldTubeMat);
    rightSideRail.position.set(rearX, seatH, (frontZ + rearZ) / 2);
    rightSideRail.castShadow = true;
    chair.add(rightSideRail);

    // 2. SQUARE SEAT CUSHION WITH SOFT ROUNDED EDGES ("ponga mreeeb3a!! o soft round edgeeees!!")
    const seatW = 0.38;
    const seatD = 0.36;
    const seatThickness = 0.055;
    const seatCushionGeo = createSoftRoundedBoxGeometry(seatW, seatD, seatThickness, 0.045, 0.015);
    seatCushionGeo.rotateX(-Math.PI / 2);
    const seatCushion = new THREE.Mesh(seatCushionGeo, redCushionMat);
    seatCushion.position.set(0, seatH + tubeR + seatThickness / 2, 0.012);
    seatCushion.castShadow = true;
    chair.add(seatCushion);

    // 3. LEFT & RIGHT REAR POSTS (Continuous gold tube from floor y=0 up to top arch y=0.92m)
    const rearPostGeo = new THREE.CylinderGeometry(tubeR, tubeR, totalBackY, 12);

    const leftRearPost = new THREE.Mesh(rearPostGeo, goldTubeMat);
    leftRearPost.position.set(-rearX, totalBackY / 2, rearZ);
    leftRearPost.castShadow = true;
    chair.add(leftRearPost);

    const rightRearPost = new THREE.Mesh(rearPostGeo, goldTubeMat);
    rightRearPost.position.set(rearX, totalBackY / 2, rearZ);
    rightRearPost.castShadow = true;
    chair.add(rightRearPost);

    // 4. TOP BACKREST ARCH (Smoothly bridges rear posts)
    const archGeo = new THREE.TorusGeometry(rearX, tubeR, 10, 24, Math.PI);
    const topArch = new THREE.Mesh(archGeo, goldTubeMat);
    topArch.position.set(0, totalBackY, rearZ);
    topArch.castShadow = true;
    chair.add(topArch);

    // 5. SQUARE BACKREST CUSHION WITH SOFT ROUNDED EDGES ("ponga mreeeb3a!! o soft round edgeeees!!")
    const backW = rearX * 2 - 0.03;
    const backH_cushion = 0.28;
    const backThickness = 0.032;
    const backCushionGeo = createSoftRoundedBoxGeometry(backW, backH_cushion, backThickness, 0.035, 0.010);
    const backPad = new THREE.Mesh(backCushionGeo, redCushionMat);
    backPad.position.set(0, seatH + backH * 0.65, rearZ);
    backPad.castShadow = true;
    chair.add(backPad);

    // 6. TWO CLEAN FRONT LEGS
    const frontLegGeo = new THREE.CylinderGeometry(tubeR, tubeR, seatH, 12);

    const leftFrontLeg = new THREE.Mesh(frontLegGeo, goldTubeMat);
    leftFrontLeg.position.set(-frontX, seatH / 2, frontZ);
    leftFrontLeg.castShadow = true;
    chair.add(leftFrontLeg);

    const rightFrontLeg = new THREE.Mesh(frontLegGeo, goldTubeMat);
    rightFrontLeg.position.set(frontX, seatH / 2, frontZ);
    rightFrontLeg.castShadow = true;
    chair.add(rightFrontLeg);

    // 7. RUBBER FLOOR GLIDERS ON FEET
    const feet = [
      [-frontX, frontZ],
      [frontX, frontZ],
      [-rearX, rearZ],
      [rearX, rearZ],
    ];
    feet.forEach(([fx, fz]) => {
      const footGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.012, 8);
      const foot = new THREE.Mesh(footGeo, castIronMat);
      foot.position.set(fx, 0.006, fz);
      chair.add(foot);
    });

    return chair;
  };

  // Concentric radial meniscus geometry with vertices displaceable along Y for fluid waves
  const createRadialMeniscusGeometry = (radius: number, rings: number = 10, segments: number = 28) => {
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    // Center vertex (index 0)
    positions.push(0, 0, 0);
    uvs.push(0.5, 0.5);

    // Concentric rings
    for (let r = 1; r <= rings; r++) {
      const rad = (r / rings) * radius;
      for (let s = 0; s < segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        const x = Math.cos(theta) * rad;
        const z = Math.sin(theta) * rad;
        positions.push(x, 0, z);
        uvs.push(x / (radius * 2) + 0.5, z / (radius * 2) + 0.5);
      }
    }

    // Indices for center ring
    for (let s = 0; s < segments; s++) {
      const nextS = (s + 1) % segments;
      indices.push(0, 1 + s, 1 + nextS);
    }

    // Indices for outer concentric rings
    for (let r = 1; r < rings; r++) {
      const innerStart = 1 + (r - 1) * segments;
      const outerStart = 1 + r * segments;
      for (let s = 0; s < segments; s++) {
        const nextS = (s + 1) % segments;
        const i0 = innerStart + s;
        const i1 = innerStart + nextS;
        const o0 = outerStart + s;
        const o1 = outerStart + nextS;

        indices.push(i0, o0, i1);
        indices.push(i1, o0, o1);
      }
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    geo.userData = {
      basePositions: new Float32Array(positions),
      radius,
      rings,
      segments,
    };

    return geo;
  };

  // Dynamic rising effervescent bubbles for fizzy drinks (monada safra, monada tofe7)
  const createBubbleSystem = (
    liquidMaxH: number,
    rTop: number,
    rBottom: number,
    bubbleColor: number = 0xfef08a
  ) => {
    const count = 35;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const radiuses = new Float32Array(count);
    const angles = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const progress = Math.random();
      const r = (rBottom + (rTop - rBottom) * progress - 0.003) * Math.sqrt(Math.random());
      const angle = Math.random() * Math.PI * 2;
      radiuses[i] = r;
      angles[i] = angle;
      speeds[i] = 0.025 + Math.random() * 0.045; // upward speed m/s

      positions[i * 3 + 0] = Math.cos(angle) * r;
      positions[i * 3 + 1] = 0.008 + progress * liquidMaxH;
      positions[i * 3 + 2] = Math.sin(angle) * r;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Procedural soft round glowing particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(16, 16, 1, 16, 16, 15);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
    grad.addColorStop(0.35, 'rgba(255, 245, 180, 0.8)');
    grad.addColorStop(0.75, 'rgba(255, 220, 100, 0.25)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(16, 16, 15, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);

    const mat = new THREE.PointsMaterial({
      color: bubbleColor,
      size: 0.0032,
      map: texture,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geo, mat);
    points.userData = { speeds, radiuses, angles, liquidMaxH };
    points.renderOrder = 2;
    return points;
  };

  // Helper to create authentic Moroccan drink cups:
  // 1. Kas d 7yati (Tea glass with Fassi arabesque band & mint sprig)
  // 2. Kas d L'9ahwa (Sturdy bistro espresso glass with thick base, no pattern)
  // 3. Kas d Plastic Chfaf (Iconic transparent disposable ribbed party cup for sodas/juices)
  const createCupInstance = (
    playerIdx: number,
    mats: NonNullable<typeof materialsRef.current>,
    drinkDef: DrinkDef,
    cupStyle: CupStyle = 'authentic'
  ): GlassAnimatedInstance => {
    const rootGroup = new THREE.Group();
    rootGroup.userData = { playerIndex: playerIdx };

    // --- 1. KAS D 7YATI (كاس د حياتي - Authentic Moroccan Tea Glass) ---
    const teaCupGroup = new THREE.Group();
    rootGroup.add(teaCupGroup);

    const teaH = 0.088;
    const teaRTop = 0.027;
    const teaRBottom = 0.021;
    const teaBaseH = 0.008;

    const teaBaseMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(teaRBottom, teaRBottom, teaBaseH, 32),
      mats.glass
    );
    teaBaseMesh.position.y = teaBaseH / 2;
    teaBaseMesh.renderOrder = 2;
    teaCupGroup.add(teaBaseMesh);

    const teaWallMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(teaRTop, teaRBottom, teaH, 32, 1, true),
      mats.glass
    );
    teaWallMesh.position.y = teaH / 2;
    teaWallMesh.renderOrder = 3;
    teaWallMesh.castShadow = false;
    teaCupGroup.add(teaWallMesh);

    const teaLipGeo = new THREE.TorusGeometry(teaRTop, 0.0012, 8, 32);
    teaLipGeo.rotateX(Math.PI / 2);
    const teaLipMesh = new THREE.Mesh(teaLipGeo, mats.glass);
    teaLipMesh.position.y = teaH;
    teaLipMesh.renderOrder = 3;
    teaCupGroup.add(teaLipMesh);

    const patternGeo = new THREE.CylinderGeometry(teaRTop + 0.0003, teaRBottom + 0.0003, teaH, 32, 1, true);
    const patternMesh = new THREE.Mesh(patternGeo, mats.pattern);
    patternMesh.position.y = teaH / 2;
    patternMesh.renderOrder = 4;
    teaCupGroup.add(patternMesh);

    // --- 2. KAS D L'9AHWA (كاس د القهوة - Moroccan Espresso Bistro Glass) ---
    const coffeeCupGroup = new THREE.Group();
    rootGroup.add(coffeeCupGroup);

    const coffeeH = 0.068;
    const coffeeRTop = 0.026;
    const coffeeRBottom = 0.022;
    const coffeeBaseH = 0.012; // Heavy thick espresso base

    const coffeeBaseMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(coffeeRBottom, coffeeRBottom - 0.001, coffeeBaseH, 32),
      mats.glass
    );
    coffeeBaseMesh.position.y = coffeeBaseH / 2;
    coffeeBaseMesh.renderOrder = 2;
    coffeeCupGroup.add(coffeeBaseMesh);

    const coffeeWallMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(coffeeRTop, coffeeRBottom, coffeeH, 32, 1, true),
      mats.glass
    );
    coffeeWallMesh.position.y = coffeeH / 2;
    coffeeWallMesh.renderOrder = 3;
    coffeeWallMesh.castShadow = false;
    coffeeCupGroup.add(coffeeWallMesh);

    const coffeeLipGeo = new THREE.TorusGeometry(coffeeRTop, 0.0012, 8, 32);
    coffeeLipGeo.rotateX(Math.PI / 2);
    const coffeeLipMesh = new THREE.Mesh(coffeeLipGeo, mats.glass);
    coffeeLipMesh.position.y = coffeeH;
    coffeeLipMesh.renderOrder = 3;
    coffeeCupGroup.add(coffeeLipMesh);

    // --- 3. KAS D PLASTIC CHFAF (كاس د ميكا شفاف - Transparent Disposable Plastic Cup) ---
    const plasticCupGroup = new THREE.Group();
    rootGroup.add(plasticCupGroup);

    const plasticH = 0.096;
    const plasticRTop = 0.030;
    const plasticRBottom = 0.020;
    const plasticBaseH = 0.003;

    const plasticBaseMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(plasticRBottom, plasticRBottom - 0.001, plasticBaseH, 32),
      mats.plastic
    );
    plasticBaseMesh.position.y = plasticBaseH / 2;
    plasticBaseMesh.renderOrder = 2;
    plasticCupGroup.add(plasticBaseMesh);

    const plasticWallMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(plasticRTop, plasticRBottom, plasticH, 32, 1, true),
      mats.plastic
    );
    plasticWallMesh.position.y = plasticH / 2;
    plasticWallMesh.renderOrder = 3;
    plasticWallMesh.castShadow = false;
    plasticCupGroup.add(plasticWallMesh);

    const plasticLipGeo = new THREE.TorusGeometry(plasticRTop, 0.0014, 8, 32);
    plasticLipGeo.rotateX(Math.PI / 2);
    const plasticLipMesh = new THREE.Mesh(plasticLipGeo, mats.plastic);
    plasticLipMesh.position.y = plasticH;
    plasticLipMesh.renderOrder = 3;
    plasticCupGroup.add(plasticLipMesh);

    // Molded horizontal grip ribs
    const ribYPositions = [0.038, 0.046, 0.054, 0.062];
    ribYPositions.forEach(ry => {
      const frac = ry / plasticH;
      const rRib = plasticRBottom + (plasticRTop - plasticRBottom) * frac;
      const ribGeo = new THREE.TorusGeometry(rRib, 0.0008, 6, 32);
      ribGeo.rotateX(Math.PI / 2);
      const ribMesh = new THREE.Mesh(ribGeo, mats.plastic);
      ribMesh.position.y = ry;
      ribMesh.renderOrder = 3;
      plasticCupGroup.add(ribMesh);
    });

    // --- SHARED LIQUID, MENISCUS, MINT & BUBBLES ---
    // Unit cylinder: base at y=0, top at y=1, normalized radius 1
    // Dynamically morphed along cup taper so it strictly fits inside the glass walls!
    const liquidGeo = new THREE.CylinderGeometry(1, 1, 1, 32, 1);
    liquidGeo.translate(0, 0.5, 0);
    const baseLiquidPositions = new Float32Array(liquidGeo.attributes.position.array);
    liquidGeo.userData = { basePositions: baseLiquidPositions };

    const liquidMesh = new THREE.Mesh(liquidGeo, mats.tea);
    liquidMesh.position.y = teaBaseH;
    liquidMesh.renderOrder = 1;
    liquidMesh.castShadow = false;
    liquidMesh.receiveShadow = false;
    rootGroup.add(liquidMesh);

    const meniscusBaseRadius = 0.025;
    const meniscusGeo = createRadialMeniscusGeometry(meniscusBaseRadius, 10, 28);
    const meniscusMesh = new THREE.Mesh(meniscusGeo, mats.meniscus);
    meniscusMesh.position.y = teaBaseH + 0.070;
    meniscusMesh.renderOrder = 2;
    rootGroup.add(meniscusMesh);

    // Soft subtle contact shadow on table directly under glass base
    const contactShadowGeo = new THREE.CircleGeometry(0.022, 32);
    contactShadowGeo.rotateX(-Math.PI / 2);
    const contactShadowMesh = new THREE.Mesh(
      contactShadowGeo,
      new THREE.MeshBasicMaterial({
        color: 0x140b05,
        transparent: true,
        opacity: 0.38,
        depthWrite: false,
      })
    );
    contactShadowMesh.position.y = 0.0003;
    rootGroup.add(contactShadowMesh);

    // Mint leaf sprig
    const mintGroup = new THREE.Group();
    mintGroup.renderOrder = 2;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.0009, 0.0009, 0.012, 6), mats.mint);
    stem.position.y = 0.004;
    stem.rotation.z = 0.2;
    mintGroup.add(stem);

    const leafGeo1 = new THREE.SphereGeometry(0.007, 8, 8);
    leafGeo1.scale(1.2, 0.25, 2.0);
    const leaf1 = new THREE.Mesh(leafGeo1, mats.mint);
    leaf1.position.set(0.006, 0.004, 0.003);
    leaf1.rotation.set(0.3, 0.4, 0.2);
    mintGroup.add(leaf1);

    const leafGeo2 = new THREE.SphereGeometry(0.006, 8, 8);
    leafGeo2.scale(1.1, 0.25, 1.8);
    const leaf2 = new THREE.Mesh(leafGeo2, mats.mint);
    leaf2.position.set(-0.005, 0.004, -0.002);
    leaf2.rotation.set(-0.2, -0.5, -0.2);
    mintGroup.add(leaf2);

    // Cup Type Setup
    const initialCupType = cupStyle === 'plastic_all' ? 'kas_plastic' : drinkDef.cupType;
    let currentCupType: 'kas_7yati' | 'kas_qahwa' | 'kas_plastic' = initialCupType;
    const initialDims = CUP_DIMENSIONS[initialCupType] ?? CUP_DIMENSIONS.kas_7yati;

    mintGroup.position.y = initialDims.baseH + initialDims.maxH + 0.001;
    mintGroup.visible = drinkDef.hasMint;
    rootGroup.add(mintGroup);

    // Bubbles
    const bubbleParticles = createBubbleSystem(
      initialDims.maxH,
      initialDims.rTop,
      initialDims.rBot,
      drinkDef.bubbleColor ?? 0xfef08a
    );
    bubbleParticles.visible = drinkDef.isFizzy;
    rootGroup.add(bubbleParticles);

    // Watermark ring
    const watermarkGeo = new THREE.RingGeometry(0.019, 0.023, 32);
    watermarkGeo.rotateX(-Math.PI / 2);
    const watermarkMesh = new THREE.Mesh(watermarkGeo, mats.watermark);
    watermarkMesh.position.y = 0.0005;
    rootGroup.add(watermarkMesh);

    // Active player halo
    const haloGeo = new THREE.RingGeometry(0.028, 0.038, 32);
    haloGeo.rotateX(-Math.PI / 2);
    const haloMesh = new THREE.Mesh(haloGeo, mats.halo);
    haloMesh.position.y = 0.001;
    haloMesh.visible = false;
    rootGroup.add(haloMesh);

    const updateCupType = (type: 'kas_7yati' | 'kas_qahwa' | 'kas_plastic') => {
      currentCupType = type;
      teaCupGroup.visible = (type === 'kas_7yati');
      coffeeCupGroup.visible = (type === 'kas_qahwa');
      plasticCupGroup.visible = (type === 'kas_plastic');
    };

    updateCupType(initialCupType);

    return {
      group: rootGroup,
      teaCupGroup,
      coffeeCupGroup,
      plasticCupGroup,
      liquidMesh,
      meniscusMesh,
      mintGroup,
      haloMesh,
      bubbleParticles,
      currentFill: 1.0,
      targetFill: 1.0,
      playerIndex: playerIdx,
      sloshAmp: 0.0,
      sloshAngle: 0.0,
      currentCupType,
      updateCupType,
    };
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x181b1f);
    scene.fog = new THREE.FogExp2(0x1a1d22, 0.025);

    // 2. Camera with Mobile Portrait auto-adaptation
    const aspect = width / height;
    const initialFov = aspect < 1.0 ? Math.min(75, 50 / Math.max(0.62, aspect)) : 50;
    const camera = new THREE.PerspectiveCamera(initialFov, aspect, 0.1, 50);
    camera.position.set(0, aspect < 1.0 ? 1.55 : 1.45, aspect < 1.0 ? 2.85 : 2.5);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.02;
    controls.minDistance = 0.6;
    controls.maxDistance = 4.2;
    controls.target.set(0, 0.85, 0);
    controlsRef.current = controls;
    cameraRef.current = camera;

    // 5. Procedural Textures
    // Realistic Moroccan Garage Cinder Block & Plaster Wall Texture (باربان ومرطوب الكاراج)
    const createRealWallTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d')!;

      // Base weathered garage concrete tint
      ctx.fillStyle = '#42474e';
      ctx.fillRect(0, 0, 1024, 1024);

      // Cinder block courses (standard 20cm x 40cm masonry)
      const blockH = 64; // 16 rows
      const blockW = 128; // 8 blocks across

      for (let row = 0; row < 16; row++) {
        const y = row * blockH;
        const isStaggered = row % 2 === 1;
        const xOffset = isStaggered ? -blockW / 2 : 0;

        for (let col = -1; col <= 9; col++) {
          const x = col * blockW + xOffset;

          // Natural block tone variance
          const varTone = (Math.sin(row * 13.7 + col * 8.3) + Math.cos(row * 4.1 - col * 6.7)) * 7;
          const r = Math.floor(68 + varTone);
          const g = Math.floor(74 + varTone);
          const b = Math.floor(82 + varTone);

          // Individual block body
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.fillRect(x + 2, y + 2, blockW - 4, blockH - 4);

          // Top bevel highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.fillRect(x + 2, y + 2, blockW - 4, 2);

          // Bottom bevel shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
          ctx.fillRect(x + 2, y + blockH - 4, blockW - 4, 2);
        }

        // Horizontal mortar joint
        ctx.fillStyle = '#22252a';
        ctx.fillRect(0, y, 1024, 2);
        ctx.fillStyle = '#181b1f';
        ctx.fillRect(0, y + 1, 1024, 1);
      }

      // Vertical mortar joints
      for (let row = 0; row < 16; row++) {
        const y = row * blockH;
        const isStaggered = row % 2 === 1;
        const xOffset = isStaggered ? -blockW / 2 : 0;

        for (let col = 0; col <= 8; col++) {
          const x = col * blockW + xOffset;
          ctx.fillStyle = '#22252a';
          ctx.fillRect(x, y, 2, blockH);
          ctx.fillStyle = '#181b1f';
          ctx.fillRect(x + 1, y, 1, blockH);
        }
      }

      // Concrete micro-porosity & sand grain
      const imgData = ctx.getImageData(0, 0, 1024, 1024);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 22;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
      }
      ctx.putImageData(imgData, 0, 0);

      // Dampness / grime gradient near the bottom floor line
      const dampGrad = ctx.createLinearGradient(0, 720, 0, 1024);
      dampGrad.addColorStop(0, 'rgba(16, 18, 22, 0)');
      dampGrad.addColorStop(1, 'rgba(16, 18, 22, 0.40)');
      ctx.fillStyle = dampGrad;
      ctx.fillRect(0, 720, 1024, 304);

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(2, 1);
      return texture;
    };

    // Bump map for 3D tactile masonry joints and rough plaster relief
    const createRealWallBumpMap = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, 512, 512);

      const blockH = 32;
      const blockW = 64;

      for (let row = 0; row < 16; row++) {
        const y = row * blockH;
        const isStaggered = row % 2 === 1;
        const xOffset = isStaggered ? -blockW / 2 : 0;

        // Recessed mortar line
        ctx.fillStyle = '#323232';
        ctx.fillRect(0, y, 512, 2);

        for (let col = 0; col <= 8; col++) {
          const x = col * blockW + xOffset;
          ctx.fillStyle = '#323232';
          ctx.fillRect(x, y, 2, blockH);
        }
      }

      const imgData = ctx.getImageData(0, 0, 512, 512);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 32;
        const v = Math.min(255, Math.max(0, data[i] + noise));
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
      }
      ctx.putImageData(imgData, 0, 0);

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(2, 1);
      return texture;
    };

    const createConcreteTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#242629';
      ctx.fillRect(0, 0, 1024, 1024);

      for (let i = 0; i < 6000; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const radius = Math.random() * 2.5 + 0.5;
        const shade = Math.floor(Math.random() * 70 + 25);
        ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      const stains = [
        { x: 512, y: 512, r: 160, color: 'rgba(10, 12, 14, 0.65)' },
        { x: 380, y: 620, r: 90, color: 'rgba(15, 12, 8, 0.55)' },
        { x: 680, y: 440, r: 110, color: 'rgba(8, 10, 12, 0.6)' },
      ];
      stains.forEach(stain => {
        const grad = ctx.createRadialGradient(stain.x, stain.y, stain.r * 0.1, stain.x, stain.y, stain.r);
        grad.addColorStop(0, stain.color);
        grad.addColorStop(1, 'rgba(36, 38, 41, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(stain.x, stain.y, stain.r, 0, Math.PI * 2);
        ctx.fill();
      });

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(4, 4);
      return texture;
    };

    const createWoodTableTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#4a2d18';
      ctx.fillRect(0, 0, 1024, 1024);

      const cx = 512;
      const cy = 512;
      for (let r = 8; r < 500; r += 5 + Math.random() * 6) {
        ctx.strokeStyle = Math.random() > 0.5 ? '#3c2211' : '#5c3922';
        ctx.lineWidth = 1.2 + Math.random() * 2.2;
        ctx.beginPath();
        ctx.arc(cx + (Math.random() - 0.5) * 6, cy + (Math.random() - 0.5) * 6, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Tea glass ring watermarks
      for (let i = 0; i < 7; i++) {
        const angle = (i * Math.PI * 2) / 7 + Math.random() * 0.4;
        const dist = 280 + Math.random() * 60;
        const rx = cx + Math.cos(angle) * dist;
        const ry = cy + Math.sin(angle) * dist;
        ctx.strokeStyle = 'rgba(25, 15, 8, 0.42)';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(rx, ry, 36, 0, Math.PI * 2);
        ctx.stroke();
      }

      return new THREE.CanvasTexture(canvas);
    };

    // Authentic Kas d 7yati white frosted arabesque pattern texture
    const createKas7yatiTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, 512, 256);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.94)';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
      ctx.lineWidth = 2.4;

      // Top and bottom border stripes around upper third
      ctx.beginPath();
      ctx.moveTo(0, 48); ctx.lineTo(512, 48);
      ctx.moveTo(0, 54); ctx.lineTo(512, 54);
      ctx.moveTo(0, 134); ctx.lineTo(512, 134);
      ctx.moveTo(0, 140); ctx.lineTo(512, 140);
      ctx.stroke();

      // Repeating Moroccan arches (horseshoe arabesque motifs in upper band only)
      const arches = 16;
      const step = 512 / arches;
      for (let i = 0; i < arches; i++) {
        const x = i * step;
        const mx = x + step / 2;

        // Outer arch
        ctx.beginPath();
        ctx.moveTo(x + 3, 134);
        ctx.lineTo(x + 3, 85);
        ctx.quadraticCurveTo(mx, 56, x + step - 3, 85);
        ctx.lineTo(x + step - 3, 134);
        ctx.stroke();

        // Inner arch
        ctx.beginPath();
        ctx.moveTo(x + 7, 134);
        ctx.lineTo(x + 7, 92);
        ctx.quadraticCurveTo(mx, 70, x + step - 7, 92);
        ctx.lineTo(x + step - 7, 134);
        ctx.stroke();

        // Central diamond / teardrop
        ctx.beginPath();
        ctx.arc(mx, 98, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      return texture;
    };

    // Authentic Moroccan tea foam (الكشكوشة) with creamy golden bubbles & pour swirl
    // 6. Materials
    const wallTexture = createRealWallTexture();
    const wallBumpMap = createRealWallBumpMap();
    const concreteTexture = createConcreteTexture();
    const woodTableTexture = createWoodTableTexture();
    const kasPatternTexture = createKas7yatiTexture();

    const realWallMaterial = new THREE.MeshStandardMaterial({
      map: wallTexture,
      bumpMap: wallBumpMap,
      bumpScale: 0.04,
      color: 0x5a6068,
      roughness: 0.88,
      metalness: 0.05,
    });

    const floorMaterial = new THREE.MeshStandardMaterial({
      map: concreteTexture,
      color: 0x484c52,
      roughness: 0.82,
      metalness: 0.12,
    });

    const ceilingMaterial = new THREE.MeshStandardMaterial({
      color: 0x1c1e22,
      roughness: 0.92,
    });

    const woodTableMaterial = new THREE.MeshStandardMaterial({
      map: woodTableTexture,
      roughness: 0.45,
      metalness: 0.08,
    });

    const castIronMaterial = new THREE.MeshStandardMaterial({
      color: 0x16181b,
      roughness: 0.72,
      metalness: 0.65,
    });

    const goldTubeMaterial = new THREE.MeshStandardMaterial({
      color: 0xc8963e,
      roughness: 0.28,
      metalness: 0.82,
    });

    const redCushionMaterial = new THREE.MeshStandardMaterial({
      color: 0xa81c24,
      roughness: 0.78,
      metalness: 0.05,
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.22, // Crystal clear transparent glass
      roughness: 0.04,
      metalness: 0.08,
      reflectivity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      depthWrite: false, // NEVER occlude the tea liquid inside!
    });

    const plasticMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.24, // Authentic transparent disposable plastic cup
      roughness: 0.16,
      metalness: 0.02,
      reflectivity: 0.70,
      clearcoat: 0.85,
      clearcoatRoughness: 0.10,
      depthWrite: false,
    });

    const patternMaterial = new THREE.MeshBasicMaterial({
      map: kasPatternTexture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const teaMaterial = new THREE.MeshStandardMaterial({
      color: 0x8a3c0e, // Luminous Moroccan amber-ruby mint tea (NOT black monada)
      roughness: 0.08,
      metalness: 0.05,
      transparent: true,
      opacity: 0.72, // "chwiyaa transparent" - clear glowing tea!
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const meniscusMaterial = new THREE.MeshStandardMaterial({
      color: 0x944212, // Smooth clean transparent tea surface (NO kchkoucha)
      roughness: 0.10,
      metalness: 0.05,
      transparent: true,
      opacity: 0.82,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const mintMaterial = new THREE.MeshStandardMaterial({
      color: 0x2e7d32,
      roughness: 0.4,
    });

    const watermarkMaterial = new THREE.MeshBasicMaterial({
      color: 0x1a0f05,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });

    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    });

    materialsRef.current = {
      goldTube: goldTubeMaterial,
      redCushion: redCushionMaterial,
      castIron: castIronMaterial,
      glass: glassMaterial,
      plastic: plasticMaterial,
      pattern: patternMaterial,
      tea: teaMaterial,
      meniscus: meniscusMaterial,
      mint: mintMaterial,
      watermark: watermarkMaterial,
      halo: haloMaterial,
    };

    // 7. Garage Architecture
    const roomWidth = 5.6;
    const roomHeight = 3.2;
    const roomDepth = 5.6;

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomDepth), floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomDepth), ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = roomHeight;
    scene.add(ceiling);

    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomHeight), realWallMaterial);
    backWall.position.set(0, roomHeight / 2, -roomDepth / 2);
    backWall.receiveShadow = true;
    scene.add(backWall);

    const sideWallGeo = new THREE.PlaneGeometry(roomDepth, roomHeight);
    const leftWall = new THREE.Mesh(sideWallGeo, realWallMaterial);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-roomWidth / 2, roomHeight / 2, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeo, realWallMaterial);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(roomWidth / 2, roomHeight / 2, 0);
    rightWall.receiveShadow = true;
    scene.add(rightWall);

    // Garage Skirting Baseboards / Curbs (حواشي الكاراج التحتانية)
    const curbMaterial = new THREE.MeshStandardMaterial({
      color: 0x32363d,
      roughness: 0.90,
      metalness: 0.05,
    });
    const backCurb = new THREE.Mesh(new THREE.BoxGeometry(roomWidth, 0.08, 0.06), curbMaterial);
    backCurb.position.set(0, 0.04, -roomDepth / 2 + 0.03);
    backCurb.receiveShadow = true;
    scene.add(backCurb);

    const leftCurb = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, roomDepth), curbMaterial);
    leftCurb.position.set(-roomWidth / 2 + 0.03, 0.04, 0);
    leftCurb.receiveShadow = true;
    scene.add(leftCurb);

    const rightCurb = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, roomDepth), curbMaterial);
    rightCurb.position.set(roomWidth / 2 - 0.03, 0.04, 0);
    rightCurb.receiveShadow = true;
    scene.add(rightCurb);

    // Concrete Corner Columns (البوطوات ديال الكاراج)
    const columnGeo = new THREE.BoxGeometry(0.24, roomHeight, 0.24);
    const columnMaterial = new THREE.MeshStandardMaterial({
      map: wallTexture,
      color: 0x4e545c,
      roughness: 0.90,
      metalness: 0.05,
    });
    const backLeftCol = new THREE.Mesh(columnGeo, columnMaterial);
    backLeftCol.position.set(-roomWidth / 2 + 0.12, roomHeight / 2, -roomDepth / 2 + 0.12);
    backLeftCol.receiveShadow = true;
    scene.add(backLeftCol);

    const backRightCol = new THREE.Mesh(columnGeo, columnMaterial);
    backRightCol.position.set(roomWidth / 2 - 0.12, roomHeight / 2, -roomDepth / 2 + 0.12);
    backRightCol.receiveShadow = true;
    scene.add(backRightCol);

    // Garage Electrical Conduit Tube & Junction Box (تيّو د الضو د الكاراج)
    const conduit = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, roomWidth - 0.6, 12),
      new THREE.MeshStandardMaterial({ color: 0x22262c, metalness: 0.6, roughness: 0.5 })
    );
    conduit.rotation.z = Math.PI / 2;
    conduit.position.set(0, 2.2, -roomDepth / 2 + 0.03);
    scene.add(conduit);

    const junctionBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.09, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x32373f, metalness: 0.5, roughness: 0.4 })
    );
    junctionBox.position.set(0.7, 2.2, -roomDepth / 2 + 0.035);
    scene.add(junctionBox);

    // Ceiling Steel I-Beams (الروافد د السقف)
    const beamGeo = new THREE.BoxGeometry(0.12, 0.14, roomDepth);
    const beamMaterial = new THREE.MeshStandardMaterial({
      color: 0x202328,
      roughness: 0.70,
      metalness: 0.45,
    });
    const beamLeft = new THREE.Mesh(beamGeo, beamMaterial);
    beamLeft.position.set(-1.25, roomHeight - 0.07, 0);
    scene.add(beamLeft);

    const beamRight = new THREE.Mesh(beamGeo, beamMaterial);
    beamRight.position.set(1.25, roomHeight - 0.07, 0);
    scene.add(beamRight);

    // Authentic Moroccan Rolling Garage Door Shutter (الريدو ديال الكاراج)
    const shutterCanvas = document.createElement('canvas');
    shutterCanvas.width = 512;
    shutterCanvas.height = 512;
    const sCtx = shutterCanvas.getContext('2d')!;
    sCtx.fillStyle = '#30343a';
    sCtx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 32; i++) {
      const y = i * 16;
      sCtx.fillStyle = i % 2 === 0 ? '#282c32' : '#3c424a';
      sCtx.fillRect(0, y, 512, 16);
      sCtx.fillStyle = '#181a1e';
      sCtx.fillRect(0, y + 14, 512, 2);
      // Slat rivets
      sCtx.fillStyle = '#4c525c';
      sCtx.fillRect(18, y + 6, 4, 4);
      sCtx.fillRect(490, y + 6, 4, 4);
    }
    const shutterTex = new THREE.CanvasTexture(shutterCanvas);
    const shutterMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(roomWidth, roomHeight),
      new THREE.MeshStandardMaterial({
        map: shutterTex,
        metalness: 0.25,
        roughness: 0.78,
        color: 0x484e56,
      })
    );
    shutterMesh.rotation.y = Math.PI;
    shutterMesh.position.set(0, roomHeight / 2, roomDepth / 2);
    shutterMesh.receiveShadow = true;
    scene.add(shutterMesh);

    // 8. The Round Wooden Café Table
    const tableGroup = new THREE.Group();
    scene.add(tableGroup);

    const tableRadius = 0.68;
    const tableThickness = 0.04;
    const tableHeight = 0.74;

    const topMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(tableRadius, tableRadius, tableThickness, 40),
      woodTableMaterial
    );
    topMesh.position.y = tableHeight;
    topMesh.castShadow = true;
    topMesh.receiveShadow = true;
    tableGroup.add(topMesh);

    const rimMesh = new THREE.Mesh(
      new THREE.TorusGeometry(tableRadius, 0.014, 8, 40),
      new THREE.MeshStandardMaterial({ color: 0x1f1008, roughness: 0.5 })
    );
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = tableHeight;
    tableGroup.add(rimMesh);

    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.048, tableHeight - tableThickness, 16),
      castIronMaterial
    );
    pedestal.position.y = (tableHeight - tableThickness) / 2;
    pedestal.castShadow = true;
    tableGroup.add(pedestal);

    const baseCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.16, 0.06, 16),
      castIronMaterial
    );
    baseCollar.position.y = 0.03;
    tableGroup.add(baseCollar);

    for (let f = 0; f < 4; f++) {
      const footAngle = (f * Math.PI) / 2;
      const footMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.045, 0.03, 0.38),
        castIronMaterial
      );
      footMesh.position.set(
        Math.sin(footAngle) * 0.19,
        0.015,
        Math.cos(footAngle) * 0.19
      );
      footMesh.rotation.y = footAngle;
      footMesh.castShadow = true;
      tableGroup.add(footMesh);

      const pad = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.015, 8),
        castIronMaterial
      );
      pad.position.set(
        Math.sin(footAngle) * 0.35,
        0.008,
        Math.cos(footAngle) * 0.35
      );
      tableGroup.add(pad);
    }

    const tableShadowGeo = new THREE.PlaneGeometry(1.4, 1.4);
    const tsCanvas = document.createElement('canvas');
    tsCanvas.width = 256;
    tsCanvas.height = 256;
    const tsCtx = tsCanvas.getContext('2d')!;
    const tsGrad = tsCtx.createRadialGradient(128, 128, 20, 128, 128, 128);
    tsGrad.addColorStop(0, 'rgba(5, 6, 8, 0.65)');
    tsGrad.addColorStop(1, 'rgba(5, 6, 8, 0)');
    tsCtx.fillStyle = tsGrad;
    tsCtx.fillRect(0, 0, 256, 256);
    const tsTex = new THREE.CanvasTexture(tsCanvas);
    const tableShadow = new THREE.Mesh(
      tableShadowGeo,
      new THREE.MeshBasicMaterial({ map: tsTex, transparent: true, depthWrite: false })
    );
    tableShadow.rotation.x = -Math.PI / 2;
    tableShadow.position.y = 0.003;
    scene.add(tableShadow);

    // 9. Dynamic Chairs Group
    const chairsGroup = new THREE.Group();
    scene.add(chairsGroup);
    chairsGroupRef.current = chairsGroup;

    // 9b. Dynamic Characters Group (The Moroccan Beans sitting on wedding chairs)
    const charactersGroup = new THREE.Group();
    scene.add(charactersGroup);
    charactersGroupRef.current = charactersGroup;

    // 10. Dynamic Glasses Group (Placed on table)
    const glassesGroup = new THREE.Group();
    glassesGroup.position.y = tableHeight + tableThickness / 2; // 0.76m on table top
    scene.add(glassesGroup);
    glassesGroupRef.current = glassesGroup;

    // Arrange props function
    const arrangeChairsAndGlasses = (count: number, sipsList: number[], activeIdx: number) => {
      // Clear chairs
      while (chairsGroup.children.length > 0) {
        chairsGroup.remove(chairsGroup.children[0]);
      }
      chairInstancesRef.current = [];
      // Clear characters
      while (charactersGroup.children.length > 0) {
        charactersGroup.remove(charactersGroup.children[0]);
      }
      characterInstancesRef.current = [];
      // Clear glasses
      while (glassesGroup.children.length > 0) {
        glassesGroup.remove(glassesGroup.children[0]);
      }
      glassInstancesRef.current = [];

      const chairRadius = 1.05;
      const glassRadius = 0.52; // On the table directly in front of each chair

      for (let i = 0; i < count; i++) {
        const angle = count === 1 ? Math.PI : (i * 2 * Math.PI) / count;
        const chairX = Math.sin(angle) * chairRadius;
        const chairZ = Math.cos(angle) * chairRadius;

        // 1. Authentic Moroccan Wedding Chair
        const chair = createWeddingChair(goldTubeMaterial, redCushionMaterial, castIronMaterial);
        chair.position.set(chairX, 0, chairZ);
        chair.rotation.y = angle + Math.PI;
        chairsGroup.add(chair);
        chairInstancesRef.current.push({
          group: chair,
          baseAngle: angle,
          currentRadius: chairRadius,
          targetRadius: chairRadius,
        });

        // 2. Character Model (Authentic Fall Guy / Robot Expressive / Moroccan Bean)
        const skinPalette = PAINT_LOTTERY_COLORS[i % PAINT_LOTTERY_COLORS.length];
        let charInstance: CharacterInstance;
        if (characterModelTypeRef.current === 'fallguy' && fallGuyGltfRef.current) {
          charInstance = createFallGuyCharacterInstance(fallGuyGltfRef.current, i, skinPalette);
          charInstance.group.position.set(chairX, 0.44, chairZ);
          charInstance.group.rotation.y = angle + Math.PI;
          charInstance.toggleSkeleton(showSkeletonRef.current);
        } else if (characterModelTypeRef.current === 'robot' && robotGltfRef.current) {
          charInstance = createRobotCharacterInstance(robotGltfRef.current, i, skinPalette);
          charInstance.group.position.set(chairX, 0.48, chairZ);
          charInstance.group.rotation.y = angle + Math.PI;
        } else {
          charInstance = createCharacterInstance(i, skinPalette);
          attachCharacterAnimator(charInstance);
          charInstance.group.position.set(chairX, 0, chairZ);
          charInstance.group.rotation.y = angle + Math.PI;
          charInstance.toggleSkeleton(showSkeletonRef.current);
        }
        charactersGroup.add(charInstance.group);
        characterInstancesRef.current.push(charInstance);

        // 3. Cup instance (authentic per drink or plastic for all)
        const glassInstance = createCupInstance(i, materialsRef.current!, DRINKS[activeDrinkRef.current], cupStyleRef.current);
        const glassRestX = Math.sin(angle) * glassRadius;
        const glassRestZ = Math.cos(angle) * glassRadius;
        glassInstance.baseAngle = angle;
        glassInstance.restX = glassRestX;
        glassInstance.restZ = glassRestZ;
        glassInstance.group.position.set(glassRestX, 0, glassRestZ);
        glassInstance.group.rotation.y = angle + Math.PI;

        const sips = sipsList[i] !== undefined ? sipsList[i] : 5;
        glassInstance.targetFill = Math.max(0, Math.min(1, sips / 5));
        glassInstance.currentFill = glassInstance.targetFill;
        glassInstance.haloMesh.visible = (i === activeIdx);

        glassesGroup.add(glassInstance.group);
        glassInstancesRef.current.push(glassInstance);
      }
    };

    arrangeChairsAndGlassesRef.current = arrangeChairsAndGlasses;
    arrangeChairsAndGlasses(playerCount, glassesSips, activePlayerIndex);

    // Load models via GLTFLoader with local DRACOLoader
    const baseUrl = import.meta.env.BASE_URL.endsWith('/')
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;

    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(`${baseUrl}draco/gltf/`);
    gltfLoader.setDRACOLoader(dracoLoader);

    // Load authentic Fall Guy model
    gltfLoader.load(
      `${baseUrl}models/characters/fall_guy.glb`,
      (gltf) => {
        fallGuyGltfRef.current = {
          scene: gltf.scene,
          animations: gltf.animations,
        };
        if (characterModelTypeRef.current === 'fallguy' && arrangeChairsAndGlassesRef.current) {
          arrangeChairsAndGlassesRef.current(playerCount, glassesSips, activePlayerIndex);
        }
      },
      undefined,
      (err) => {
        console.warn('Could not load fall_guy.glb, falling back to bean model', err);
      }
    );

    // Load Three.js official RobotExpressive.glb
    gltfLoader.load(
      `${baseUrl}models/characters/RobotExpressive.glb`,
      (gltf) => {
        robotGltfRef.current = {
          scene: gltf.scene,
          animations: gltf.animations,
        };
        if (characterModelTypeRef.current === 'robot' && arrangeChairsAndGlassesRef.current) {
          arrangeChairsAndGlassesRef.current(playerCount, glassesSips, activePlayerIndex);
        }
      },
      undefined,
      (err) => {
        console.warn('Could not load RobotExpressive.glb, falling back to bean model', err);
      }
    );

    // 10. Pour Stream & Splash Particle System
    const pourGroup = new THREE.Group();
    pourGroup.visible = false;
    scene.add(pourGroup);
    pourGroupRef.current = pourGroup;

    const streamCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.040, 0.32, -0.025),
      new THREE.Vector3(0.022, 0.20, -0.015),
      new THREE.Vector3(0.008, 0.10, -0.005),
      new THREE.Vector3(0, 0.02, 0),
    ]);
    const streamGeo = new THREE.TubeGeometry(streamCurve, 24, 0.0022, 8, false);
    const initialDrinkDef = DRINKS[activeDrinkRef.current];
    const streamMat = new THREE.MeshStandardMaterial({
      color: initialDrinkDef.streamColor,
      roughness: 0.05,
      metalness: 0.08,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    const streamMesh = new THREE.Mesh(streamGeo, streamMat);
    pourGroup.add(streamMesh);
    streamMaterialRef.current = streamMat;

    const splashCount = 14;
    const splashGeo = new THREE.BufferGeometry();
    const splashPositions = new Float32Array(splashCount * 3);
    const splashVelocities = new Float32Array(splashCount * 3);
    for (let s = 0; s < splashCount; s++) {
      splashPositions[s * 3 + 0] = 0;
      splashPositions[s * 3 + 1] = 0.02;
      splashPositions[s * 3 + 2] = 0;
      const sAngle = Math.random() * Math.PI * 2;
      const sSpeed = 0.025 + Math.random() * 0.04;
      splashVelocities[s * 3 + 0] = Math.cos(sAngle) * sSpeed;
      splashVelocities[s * 3 + 1] = 0.035 + Math.random() * 0.05;
      splashVelocities[s * 3 + 2] = Math.sin(sAngle) * sSpeed;
    }
    splashGeo.setAttribute('position', new THREE.BufferAttribute(splashPositions, 3));
    const splashMat = new THREE.PointsMaterial({
      color: initialDrinkDef.streamColor,
      size: 0.0035,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    const splashPoints = new THREE.Points(splashGeo, splashMat);
    splashPoints.userData = { splashVelocities };
    pourGroup.add(splashPoints);
    splashMaterialRef.current = splashMat;

    // 11. Dangling Tungsten Bulb
    const bulbPivot = new THREE.Group();
    bulbPivot.position.set(0, roomHeight, 0);
    scene.add(bulbPivot);
    bulbPivotRef.current = bulbPivot;

    const cableLength = 0.82; // Raised higher up (b3d lbola lfo9)
    const cable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, cableLength, 8),
      new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 })
    );
    cable.position.y = -cableLength / 2;
    bulbPivot.add(cable);

    const bulbAssembly = new THREE.Group();
    bulbAssembly.position.y = -cableLength;
    bulbPivot.add(bulbAssembly);

    const socket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.04, 0.09, 16),
      new THREE.MeshStandardMaterial({ color: 0x8a7035, metalness: 0.85, roughness: 0.3 })
    );
    socket.position.y = -0.045;
    bulbAssembly.add(socket);

    const glassGeo = new THREE.SphereGeometry(0.085, 24, 24);
    glassGeo.scale(1, 1.35, 1);
    const glassBulb = new THREE.Mesh(
      glassGeo,
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.42,
        roughness: 0.15,
        metalness: 0.05,
        transmission: 0.6,
        ior: 1.45,
      })
    );
    glassBulb.position.y = -0.16;
    bulbAssembly.add(glassBulb);

    const filamentGeo = new THREE.TorusGeometry(0.025, 0.004, 8, 20);
    filamentGeo.rotateX(Math.PI / 2);
    const filament = new THREE.Mesh(
      filamentGeo,
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    filament.position.y = -0.16;
    bulbAssembly.add(filament);
    filamentMeshRef.current = filament;

    const bulbLight = new THREE.PointLight(0xffffff, 5.8, 10.5, 1.5); // Clean neutral white light (do biyed)
    bulbLight.position.set(0, -0.16, 0);
    bulbLight.castShadow = true;
    bulbLight.shadow.mapSize.width = 1024;
    bulbLight.shadow.mapSize.height = 1024;
    bulbLight.shadow.bias = -0.001;
    bulbAssembly.add(bulbLight);
    bulbPointLightRef.current = bulbLight;

    const ambientLight = new THREE.AmbientLight(0x3a404a, 0.65);
    scene.add(ambientLight);

    // 12. Interactive Raycaster for 3D Tea Glasses
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (event: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(glassesGroup.children, true);

      if (intersects.length > 0) {
        let cur: THREE.Object3D | null = intersects[0].object;
        while (cur && cur.parent !== glassesGroup) {
          cur = cur.parent;
        }
        if (cur && cur.userData && typeof cur.userData.playerIndex === 'number') {
          const clickedIdx = cur.userData.playerIndex;
          if (glassInstancesRef.current[clickedIdx]) {
            glassInstancesRef.current[clickedIdx].sloshAmp = 1.35;
            glassInstancesRef.current[clickedIdx].sloshAngle = Math.random() * Math.PI * 2;
          }
          if (onGlassClick) {
            onGlassClick(clickedIdx);
          }
        }
      } else {
        // Also check if user clicked on any Character
        const charIntersects = raycaster.intersectObjects(charactersGroup.children, true);
        if (charIntersects.length > 0) {
          let cur: THREE.Object3D | null = charIntersects[0].object;
          while (cur && cur.parent !== charactersGroup) {
            cur = cur.parent;
          }
          const charIdx = characterInstancesRef.current.findIndex(c => c.group === cur);
          if (charIdx >= 0) {
            if (onCharacterClick) {
              onCharacterClick(charIdx);
            }
          }
        }
      }
    };

    const onPointerMove = (event: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(glassesGroup.children, true);
      container.style.cursor = intersects.length > 0 ? 'pointer' : 'grab';
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);

    // 13. Animation Loop with Real-Time Fluid Physics Simulation
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, clock.getDelta());
      const t = clock.getElapsedTime();

      // Swaying tungsten bulb
      if (bulbPivotRef.current) {
        bulbPivotRef.current.rotation.z = Math.sin(t * 1.25) * 0.038 + Math.sin(t * 2.8) * 0.008;
        bulbPivotRef.current.rotation.x = Math.cos(t * 1.05) * 0.024;
      }

      // Dynamic Pour Stream & Splash Particles Animation
      if (pourAnimRef.current.active && pourGroupRef.current) {
        const now = performance.now();
        const elapsed = now - pourAnimRef.current.startTime;
        const p = elapsed / pourAnimRef.current.duration;

        if (p >= 1.0) {
          pourAnimRef.current.active = false;
          pourGroupRef.current.visible = false;
        } else {
          const targetIdx = pourAnimRef.current.playerIndex;
          const targetGlass = glassInstancesRef.current[targetIdx];
          const tDims = targetGlass ? (CUP_DIMENSIONS[targetGlass.currentCupType] ?? CUP_DIMENSIONS.kas_7yati) : CUP_DIMENSIONS.kas_7yati;
          const curMeniscusH = targetGlass ? (tDims.baseH + tDims.maxH * targetGlass.currentFill) : 0.04;
          streamMesh.position.y = curMeniscusH;

          if (p < 0.18) {
            const grow = p / 0.18;
            streamMesh.scale.set(1, grow, 1);
            streamMat.opacity = grow * 0.85;
          } else if (p > 0.72) {
            const fade = (1.0 - p) / 0.28;
            streamMesh.scale.set(fade, 1, fade);
            streamMat.opacity = fade * 0.85;
          } else {
            streamMesh.scale.set(1, 1, 1);
            streamMat.opacity = 0.85;
            streamMesh.rotation.y = Math.sin(t * 22.0) * 0.04;
          }

          // Splash particles at impact point
          const pos = splashGeo.attributes.position.array as Float32Array;
          const vel = splashPoints.userData.splashVelocities as Float32Array;
          for (let s = 0; s < splashCount; s++) {
            pos[s * 3 + 0] += vel[s * 3 + 0] * 0.016;
            pos[s * 3 + 1] += vel[s * 3 + 1] * 0.016;
            pos[s * 3 + 2] += vel[s * 3 + 2] * 0.016;
            vel[s * 3 + 1] -= 0.10 * 0.016; // gravity

            if (pos[s * 3 + 1] < curMeniscusH || p < 0.1) {
              pos[s * 3 + 0] = (Math.random() - 0.5) * 0.004;
              pos[s * 3 + 1] = curMeniscusH + 0.002;
              pos[s * 3 + 2] = (Math.random() - 0.5) * 0.004;
              const sAngle = Math.random() * Math.PI * 2;
              const sSpeed = 0.025 + Math.random() * 0.04;
              vel[s * 3 + 0] = Math.cos(sAngle) * sSpeed;
              vel[s * 3 + 1] = 0.035 + Math.random() * 0.05;
              vel[s * 3 + 2] = Math.sin(sAngle) * sSpeed;
            }
          }
          splashGeo.attributes.position.needsUpdate = true;
        }
      }

      // Smooth liquid physics, wave deformation & bubble dynamics
      const instances = glassInstancesRef.current;
      const curDrink = DRINKS[activeDrinkRef.current];
      const visc = curDrink?.viscosity ?? 1.0;
      const waveSpeed = 3.4 / visc;
      const radialFreq = 105.0 / visc;

      for (let i = 0; i < instances.length; i++) {
        const item = instances[i];
        item.currentFill += (item.targetFill - item.currentFill) * 0.12;

        const fill = Math.max(0.0001, item.currentFill);
        const dims = CUP_DIMENSIONS[item.currentCupType] ?? CUP_DIMENSIONS.kas_7yati;
        const h = Math.max(0.0001, fill * dims.maxH);
        const currRTop = dims.rBot + (dims.rTop - dims.rBot) * fill;
        const currRBot = dims.rBot;

        item.liquidMesh.position.y = dims.baseH;
        item.liquidMesh.scale.set(1, 1, 1);

        // Update liquid cylinder vertices strictly matching the glass inner contour
        const lGeo = item.liquidMesh.geometry;
        const lPos = lGeo.attributes.position.array as Float32Array;
        const lBase = lGeo.userData.basePositions as Float32Array;
        if (lBase) {
          const vCount = lBase.length / 3;
          for (let v = 0; v < vCount; v++) {
            const bx = lBase[v * 3 + 0];
            const by = lBase[v * 3 + 1]; // 0 at bottom, 1 at top
            const bz = lBase[v * 3 + 2];

            const localR = currRBot + (currRTop - currRBot) * by;
            lPos[v * 3 + 0] = bx * localR;
            lPos[v * 3 + 1] = by * h;
            lPos[v * 3 + 2] = bz * localR;
          }
          lGeo.attributes.position.needsUpdate = true;
          lGeo.computeVertexNormals();
        }

        // Update meniscus position and scale
        const mGeo = item.meniscusMesh.geometry;
        const baseR = (mGeo.userData.radius as number) || 0.025;
        const scaleXZ = currRTop / baseR;
        item.meniscusMesh.position.y = dims.baseH + h;
        item.meniscusMesh.scale.set(scaleXZ, 1, scaleXZ);

        // Slosh damping
        item.sloshAmp *= 0.945;

        if (item.currentFill < 0.02) {
          item.liquidMesh.visible = false;
          item.meniscusMesh.visible = false;
          item.mintGroup.visible = false;
          if (item.bubbleParticles) item.bubbleParticles.visible = false;
        } else {
          item.liquidMesh.visible = true;
          item.meniscusMesh.visible = true;
          item.mintGroup.visible = curDrink.hasMint;
          if (item.bubbleParticles) item.bubbleParticles.visible = curDrink.isFizzy;

          // 1. Meniscus Wave Physics Deformation
          const geo = item.meniscusMesh.geometry;
          const posAttr = geo.attributes.position;
          const pos = posAttr.array as Float32Array;
          const base = geo.userData.basePositions as Float32Array;
          const maxR = geo.userData.radius as number;
          const vertCount = base.length / 3;

          let centerWaveY = 0;
          let waveSlopeX = 0;
          let waveSlopeZ = 0;

          for (let v = 0; v < vertCount; v++) {
            const bx = base[v * 3 + 0];
            const by0 = base[v * 3 + 1];
            const bz = base[v * 3 + 2];

            const dist = Math.sqrt(bx * bx + bz * bz);
            const normR = Math.min(1.0, dist / maxR);
            const angle = Math.atan2(bz, bx);

            // Harmonic concentric ripples
            const idleRipple = Math.sin(dist * radialFreq - t * waveSpeed + i * 0.8) * 0.00045 * (1.0 - normR * 0.3);
            // Angular swirl
            const swirl = Math.sin(angle * 3.0 + t * (waveSpeed * 0.5) + i) * 0.00025 * normR;
            // Dipole slosh tilt
            const dipole = Math.sin(t * (12.0 / Math.sqrt(visc))) *
              (bx * Math.cos(item.sloshAngle) + bz * Math.sin(item.sloshAngle)) / maxR *
              (item.sloshAmp * 0.0028);
            // Radial impact ripple
            const impact = Math.cos(dist * 85.0 - t * 16.0) * Math.exp(-normR * 2.4) * (item.sloshAmp * 0.0024);

            const dy = idleRipple + swirl + dipole + impact;
            pos[v * 3 + 1] = by0 + dy;

            if (v === 0) centerWaveY = dy;
            if (v === 1) waveSlopeX = dy;
            if (v === 2) waveSlopeZ = dy;
          }

          posAttr.needsUpdate = true;
          geo.computeVertexNormals();

          // 2. Mint Leaf Dynamics (bobbing & tilting on liquid waves)
          if (curDrink.hasMint) {
            item.mintGroup.position.y = Math.max(dims.baseH + 0.004, dims.baseH + h + centerWaveY + 0.0008);
            item.mintGroup.rotation.x = Math.sin(t * 1.8 + i) * 0.04 + (waveSlopeZ - centerWaveY) * 32.0;
            item.mintGroup.rotation.z = Math.cos(t * 1.5 + i) * 0.04 - (waveSlopeX - centerWaveY) * 32.0;
            item.mintGroup.rotation.y = Math.sin(t * 0.8 + i * 1.1) * 0.16 + (item.sloshAmp * 0.22);
            const mintScale = Math.min(1.0, 0.72 + 0.28 * fill);
            item.mintGroup.scale.set(mintScale, mintScale, mintScale);
          }

          // 3. Effervescent Bubbles Dynamics
          if (curDrink.isFizzy && item.bubbleParticles) {
            const bGeo = item.bubbleParticles.geometry;
            const bPos = bGeo.attributes.position.array as Float32Array;
            const { speeds, radiuses, angles } = item.bubbleParticles.userData;
            const curBubbleMaxH = dims.baseH + h;
            const bubbleScaleXZ = currRTop / dims.rTop;

            for (let b = 0; b < 35; b++) {
              bPos[b * 3 + 1] += speeds[b] * 0.016;
              const curY = bPos[b * 3 + 1];
              bPos[b * 3 + 0] = Math.cos(angles[b] + curY * 35.0) * radiuses[b] * bubbleScaleXZ;
              bPos[b * 3 + 2] = Math.sin(angles[b] + curY * 35.0) * radiuses[b] * bubbleScaleXZ;

              if (bPos[b * 3 + 1] >= curBubbleMaxH) {
                bPos[b * 3 + 1] = dims.baseH + Math.random() * 0.004;
                angles[b] = Math.random() * Math.PI * 2;
                radiuses[b] = (currRBot * 0.8) * Math.sqrt(Math.random());
              }
            }
            bGeo.attributes.position.needsUpdate = true;
          }
        }

        // Active player halo subtle pulse
        if (item.haloMesh.visible) {
          const haloPulse = 0.65 + Math.sin(t * 4.0) * 0.25;
          (item.haloMesh.material as THREE.MeshBasicMaterial).opacity = haloPulse;
        }
      }

      // Update chairs automatic sliding & open garage character navigation
      const chairs = chairInstancesRef.current;
      const chars = characterInstancesRef.current;
      const glasses = glassInstancesRef.current;

      for (let i = 0; i < chairs.length; i++) {
        const ch = chairs[i];
        const chChar = chars[i];
        const isStandingOrJumping =
          chChar &&
          (!chChar.isSeated ||
            chChar.animState === 'jump_down' ||
            chChar.animState === 'walk' ||
            chChar.animState === 'run');

        if (isStandingOrJumping) {
          ch.targetRadius = 1.38; // Slides back 33cm away from table
        } else {
          ch.targetRadius = 1.05; // Slides in to table
        }
        ch.currentRadius = THREE.MathUtils.lerp(ch.currentRadius, ch.targetRadius, 0.08);
        ch.group.position.x = Math.sin(ch.baseAngle) * ch.currentRadius;
        ch.group.position.z = Math.cos(ch.baseAngle) * ch.currentRadius;

        if (chChar) {
          if (chChar.animState === 'walk' || chChar.animState === 'run') {
            // SAFE OPEN GARAGE NAVIGATION ON CONCRETE FLOOR (ZERO AIR FLOATING!)
            // Character navigates along outer perimeter at radius 1.95m, firmly planted on the floor (Y = 0.0)
            chChar.isSeated = false;
            const walkSpeed = chChar.animState === 'run' ? 1.4 : 0.65;
            const walkAngle = ch.baseAngle + chChar.animTime * walkSpeed;
            const targetX = Math.sin(walkAngle) * 1.95;
            const targetZ = Math.cos(walkAngle) * 1.95;

            const prevX = chChar.group.position.x;
            const prevZ = chChar.group.position.z;

            chChar.group.position.x = THREE.MathUtils.lerp(prevX, targetX, 0.12);
            chChar.group.position.z = THREE.MathUtils.lerp(prevZ, targetZ, 0.12);
            chChar.group.position.y = THREE.MathUtils.lerp(chChar.group.position.y, 0.0, 0.25);
            if (Math.abs(chChar.group.position.y) < 0.002) {
              chChar.group.position.y = 0.0;
            }

            // Compute exact movement displacement to align facing tangent (ZERO static 45-degree sliding!)
            const dx = targetX - prevX;
            const dz = targetZ - prevZ;
            const stepLen = Math.sqrt(dx * dx + dz * dz);
            if (stepLen > 0.002) {
              const targetTangent = Math.atan2(dx, dz);
              let angleDiff = targetTangent - chChar.group.rotation.y;
              while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
              while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
              chChar.group.rotation.y += angleDiff * 0.15;
            }
          } else if (chChar.animState === 'jump_down') {
            // PHYSICAL CHAIR DISMOUNT TRAJECTORY ("kifach kihbt mn korsi"):
            // 4-Phase Parabolic Ballistic Leap: Cushion Crouch -> Air Arc -> Floor Impact -> Stand Up
            const jt = chChar.animTime;
            const isRobot = !!(chChar.group.userData as any)?.isRobot;
            const isFallGuy = !!(chChar.group.userData as any)?.isFallGuy;
            const seatY = isRobot ? 0.48 : isFallGuy ? 0.44 : 0.485;
            const startR = 1.05;
            const endR = 1.02; // Stands in front of slid-back chair (chair slides back to 1.38m)

            if (jt < 0.25) {
              // Phase 1: Anticipation crouch on chair cushion
              const p1 = jt / 0.25;
              const crouchY = Math.sin(p1 * Math.PI) * 0.035;
              chChar.group.position.x = Math.sin(ch.baseAngle) * startR;
              chChar.group.position.z = Math.cos(ch.baseAngle) * startR;
              chChar.group.position.y = seatY - crouchY;
              chChar.group.rotation.y = ch.baseAngle + Math.PI;
            } else if (jt < 0.85) {
              // Phase 2: Parabolic leap forward/down off cushion onto concrete floor
              const p2 = (jt - 0.25) / 0.60;
              const u = p2 * p2 * (3 - 2 * p2); // smoothstep
              const curR = THREE.MathUtils.lerp(startR, endR, u);
              const descentY = THREE.MathUtils.lerp(seatY, 0.0, u);
              const arcY = Math.sin(p2 * Math.PI) * 0.20; // 20cm ballistic arc clearing chair edge

              chChar.group.position.x = Math.sin(ch.baseAngle) * curR;
              chChar.group.position.z = Math.cos(ch.baseAngle) * curR;
              chChar.group.position.y = descentY + arcY;
              chChar.group.rotation.y = ch.baseAngle + Math.PI;
            } else if (jt < 1.25) {
              // Phase 3: Touchdown on concrete floor with shock-absorbing knee squash
              const p3 = (jt - 0.85) / 0.40;
              const landingSquash = Math.sin(p3 * Math.PI) * 0.025;
              chChar.group.position.x = Math.sin(ch.baseAngle) * endR;
              chChar.group.position.z = Math.cos(ch.baseAngle) * endR;
              chChar.group.position.y = Math.max(0, -landingSquash);
              chChar.group.rotation.y = ch.baseAngle + Math.PI;
            } else {
              // Phase 4: Stable standing in front of slid-back chair
              chChar.isSeated = false;
              chChar.group.position.x = Math.sin(ch.baseAngle) * endR;
              chChar.group.position.z = Math.cos(ch.baseAngle) * endR;
              chChar.group.position.y = 0.0;
              chChar.group.rotation.y = ch.baseAngle + Math.PI;
            }
          } else if (chChar.animState === 'jump_up') {
            // JUMP_UP: Vertical bounce with anticipation and landing
            const jt = chChar.animTime;
            const isRobot = !!(chChar.group.userData as any)?.isRobot;
            const isFallGuy = !!(chChar.group.userData as any)?.isFallGuy;
            const baseY = chChar.isSeated ? (isRobot ? 0.48 : isFallGuy ? 0.44 : 0.485) : 0.0;
            const baseR = chChar.isSeated ? ch.currentRadius : 1.02;
            const p = Math.min(1.0, jt / 1.1);
            const hopY = Math.sin(p * Math.PI) * 0.22;

            chChar.group.position.x = Math.sin(ch.baseAngle) * baseR;
            chChar.group.position.z = Math.cos(ch.baseAngle) * baseR;
            chChar.group.position.y = baseY + hopY;
            chChar.group.rotation.y = ch.baseAngle + Math.PI;
          } else if (chChar.isSeated) {
            // Anchor to sliding chair
            chChar.group.position.x = ch.group.position.x;
            chChar.group.position.z = ch.group.position.z;
            chChar.group.rotation.y = ch.baseAngle + Math.PI;
            if ((chChar.group.userData as any).isRobot) {
              chChar.group.position.y = 0.48;
            } else if ((chChar.group.userData as any).isFallGuy) {
              chChar.group.position.y = 0.44;
            }
          } else {
            // Standing floor position in front of slid-back chair
            const standX = Math.sin(ch.baseAngle) * 1.02;
            const standZ = Math.cos(ch.baseAngle) * 1.02;
            chChar.group.position.x = THREE.MathUtils.lerp(chChar.group.position.x, standX, 0.12);
            chChar.group.position.z = THREE.MathUtils.lerp(chChar.group.position.z, standZ, 0.12);
            chChar.group.rotation.y = THREE.MathUtils.lerp(chChar.group.rotation.y, ch.baseAngle + Math.PI, 0.12);
            chChar.group.position.y = 0.0;
          }

          // Update character animation & matrices
          chChar.update(dt, t);
          chChar.group.updateMatrixWorld(true);
        }
      }

      // PHYSICAL GLASS PICKUP & DRINKING MECHANISM ("khas iheez lkass wi dir animation dyal chrba")
      // Direct hand-attached tracking: Hand reaches forward, smoothly lifts cup from table to lips,
      // tilts it relative to each player's perspective (NEVER clipping inside the body),
      // and smoothly lowers it back onto the table without any teleportation or jerking!
      for (let g = 0; g < glasses.length; g++) {
        const item = glasses[g];
        const chChar = chars[g];
        const angle = item.baseAngle ?? 0;
        const restX = item.restX ?? (Math.sin(angle) * 0.52);
        const restZ = item.restZ ?? (Math.cos(angle) * 0.52);

        if (chChar && chChar.animState === 'drink_sip') {
          const drinkTime = chChar.animTime;
          const isFallGuy = !!(chChar.group.userData as any)?.isFallGuy;
          const isRobot = !!(chChar.group.userData as any)?.isRobot;

          // PHYSICAL GLASS RESTING ON LIPS (ZERO BODY PENETRATION!):
          // Pivot is at bottom of cup. Cup height is ~0.078m.
          // When cup is tilted towards mouth by angle alpha ~ 0.52 rad (~30 deg):
          // Delta R of top rim = H_cup * sin(0.52) = +0.039m towards mouth.
          // Delta Y of top rim = H_cup * cos(0.52) = +0.068m upwards.
          // Fall Guy mouth is at R ~ 0.890m, Y ~ 0.180m.
          // Calibrated Pivot R: 0.890 - 0.039 = 0.848m (4.8cm in front of face).
          // Calibrated Pivot Y: 0.180 - 0.068 = 0.115m.
          // Result: The entire cup body and base remain completely outside the mesh (100% visible),
          // while the top rim touches the lower lip without entering inside the body!
          const sipRadius = isFallGuy ? 0.820 : isRobot ? 0.835 : 0.815;
          const sipY = isFallGuy ? 0.138 : isRobot ? 0.115 : 0.115;
          const sipX = Math.sin(angle) * sipRadius;
          const sipZ = Math.cos(angle) * sipRadius;
          const tiltAngle = 0.52; // ~30 degrees natural drinking tilt

          if (drinkTime < 0.85) {
            // Phase 1: On table, arm reaching down to cup
            item.group.position.set(restX, 0, restZ);
            item.group.rotation.set(0, angle + Math.PI, 0);
          } else if (drinkTime < 1.45) {
            // Phase 2: Hand lifts cup from table smoothly to mouth!
            const s = (drinkTime - 0.85) / 0.60;
            const u = s * s * (3 - 2 * s);
            item.group.position.set(
              THREE.MathUtils.lerp(restX, sipX, u),
              THREE.MathUtils.lerp(0, sipY, u),
              THREE.MathUtils.lerp(restZ, sipZ, u)
            );
            item.group.rotation.set(0, angle + Math.PI, 0);
            item.group.rotateX(-u * tiltAngle);
            item.sloshAmp = Math.max(item.sloshAmp, 0.6 * u);
          } else if (drinkTime < 2.35) {
            // Phase 3: Drinking at mouth - rim resting on lips, tilted into mouth, 100% visible!
            item.group.position.set(sipX, sipY, sipZ);
            item.group.rotation.set(0, angle + Math.PI, 0);
            item.group.rotateX(-tiltAngle);
            item.sloshAmp = Math.max(item.sloshAmp, 0.65);
          } else if (drinkTime < 2.95) {
            // Phase 4: Hand lowers cup smoothly back down to exact table spot!
            const s = (drinkTime - 2.35) / 0.60;
            const u = 1 - (s * s * (3 - 2 * s));
            item.group.position.set(
              THREE.MathUtils.lerp(restX, sipX, u),
              THREE.MathUtils.lerp(0, sipY, u),
              THREE.MathUtils.lerp(restZ, sipZ, u)
            );
            item.group.rotation.set(0, angle + Math.PI, 0);
            item.group.rotateX(-u * tiltAngle);
            if (s > 0.9) {
              item.sloshAmp = Math.max(item.sloshAmp, 0.45); // Touchdown ripple
            }
          } else {
            // Phase 5: Hand released, cup sits safely on table!
            item.group.position.set(restX, 0, restZ);
            item.group.rotation.set(0, angle + Math.PI, 0);
          }
        } else {
          // Normal resting position on table
          item.group.position.set(restX, 0, restZ);
          item.group.rotation.set(0, angle + Math.PI, 0);
        }
      }

      // Smooth camera focus on active character when requested
      if (focusCharacterRef.current && chars[activePlayerIndex]) {
        const charPos = chars[activePlayerIndex].group.position;
        controls.target.x = THREE.MathUtils.lerp(controls.target.x, charPos.x, 0.05);
        controls.target.y = THREE.MathUtils.lerp(controls.target.y, 0.78, 0.05);
        controls.target.z = THREE.MathUtils.lerp(controls.target.z, charPos.z, 0.05);
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 14. Resize with Mobile Portrait responsive FOV
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const aspect = w / h;
      camera.aspect = aspect;
      if (aspect < 1.0) {
        camera.fov = Math.min(75, 50 / Math.max(0.62, aspect));
      } else {
        camera.fov = 50;
      }
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update light switch
  useEffect(() => {
    playSwitchSound(lightOn);
    if (bulbPointLightRef.current && filamentMeshRef.current) {
      if (lightOn) {
        bulbPointLightRef.current.color.setHex(0xffffff);
        bulbPointLightRef.current.intensity = 5.8;
        bulbPointLightRef.current.distance = 10.5;
        bulbPointLightRef.current.decay = 1.5;
        (filamentMeshRef.current.material as THREE.MeshBasicMaterial).color.setHex(0xffffff);
      } else {
        bulbPointLightRef.current.intensity = 0.0;
        (filamentMeshRef.current.material as THREE.MeshBasicMaterial).color.setHex(0x333333);
      }
    }
  }, [lightOn]);

  // Dynamic chairs & glasses re-arrangement when playerCount changes
  useEffect(() => {
    if (arrangeChairsAndGlassesRef.current) {
      arrangeChairsAndGlassesRef.current(playerCount, glassesSips, activePlayerIndex);
    }
  }, [playerCount, activePlayerIndex]);

  const startPourAnimation = (playerIdx: number) => {
    const instances = glassInstancesRef.current;
    if (!instances[playerIdx] || !pourGroupRef.current) return;
    const targetGlass = instances[playerIdx];
    pourGroupRef.current.position.set(
      targetGlass.group.position.x,
      targetGlass.group.position.y,
      targetGlass.group.position.z
    );
    pourGroupRef.current.visible = true;

    pourAnimRef.current = {
      active: true,
      playerIndex: playerIdx,
      startTime: performance.now(),
      duration: 750,
    };
  };

  // Update drink materials, particles, and cup types when activeDrink or cupStyle changes
  useEffect(() => {
    activeDrinkRef.current = activeDrink;
    cupStyleRef.current = cupStyle;
    const drinkDef = DRINKS[activeDrink];
    if (!drinkDef || !materialsRef.current) return;
    const mats = materialsRef.current;

    mats.tea.color.setHex(drinkDef.liquidColor);
    mats.tea.opacity = drinkDef.opacity;
    mats.tea.roughness = drinkDef.roughness;
    mats.tea.metalness = drinkDef.metalness;

    mats.meniscus.color.setHex(drinkDef.meniscusColor);
    mats.meniscus.opacity = Math.min(1.0, drinkDef.opacity + 0.1);
    mats.meniscus.roughness = drinkDef.roughness;
    mats.meniscus.metalness = drinkDef.metalness;

    if (streamMaterialRef.current) {
      streamMaterialRef.current.color.setHex(drinkDef.streamColor);
      streamMaterialRef.current.opacity = Math.min(0.9, drinkDef.opacity + 0.1);
    }
    if (splashMaterialRef.current) {
      splashMaterialRef.current.color.setHex(drinkDef.streamColor);
    }

    const targetCup = cupStyle === 'plastic_all' ? 'kas_plastic' : drinkDef.cupType;
    const instances = glassInstancesRef.current;
    for (let i = 0; i < instances.length; i++) {
      const item = instances[i];
      item.updateCupType(targetCup);
      item.mintGroup.visible = drinkDef.hasMint && item.currentFill > 0.02;
      if (item.bubbleParticles) {
        item.bubbleParticles.visible = drinkDef.isFizzy && item.currentFill > 0.02;
        (item.bubbleParticles.material as THREE.PointsMaterial).color.setHex(
          drinkDef.bubbleColor ?? drinkDef.streamColor
        );
      }
      // Inject slight ripple to show drink transition
      item.sloshAmp = 0.8;
      item.sloshAngle = Math.random() * Math.PI * 2;
    }
  }, [activeDrink, cupStyle]);

  // React to drinking / refilling events with dynamic fluid impulses and character animations
  useEffect(() => {
    if (!lastAction) return;
    const instances = glassInstancesRef.current;
    const chars = characterInstancesRef.current;
    const { type, playerIndex } = lastAction;

    if (type === 'sip') {
      if (instances[playerIndex]) {
        instances[playerIndex].sloshAmp = Math.max(instances[playerIndex].sloshAmp, 1.25);
        instances[playerIndex].sloshAngle = Math.random() * Math.PI * 2;
      }
      if (chars[playerIndex]) {
        chars[playerIndex].setAnimation('drink_sip');
      }
    } else if (type === 'refill') {
      if (instances[playerIndex]) {
        instances[playerIndex].sloshAmp = Math.max(instances[playerIndex].sloshAmp, 1.85);
        instances[playerIndex].sloshAngle = Math.random() * Math.PI * 2;
        startPourAnimation(playerIndex);
      }
      if (chars[playerIndex]) {
        chars[playerIndex].setAnimation('refill_shock');
      }
      // Other players laugh at the refill misfortune!
      chars.forEach((c, idx) => {
        if (idx !== playerIndex && c.animState === 'idle') {
          c.setAnimation('laugh');
        }
      });
    } else if (type === 'reset') {
      for (let i = 0; i < instances.length; i++) {
        instances[i].sloshAmp = 1.4;
        instances[i].sloshAngle = Math.random() * Math.PI * 2;
      }
      startPourAnimation(playerIndex >= 0 ? playerIndex : 0);
      chars.forEach(c => c.setAnimation('idle'));
    }
  }, [lastAction]);

  // Update target liquid fill levels when glassesSips change & trigger victory
  useEffect(() => {
    const instances = glassInstancesRef.current;
    const chars = characterInstancesRef.current;
    for (let i = 0; i < instances.length; i++) {
      const sips = glassesSips[i] !== undefined ? glassesSips[i] : 5;
      instances[i].targetFill = Math.max(0, Math.min(1, sips / 5));
      if (sips === 0 && chars[i] && chars[i].animState !== 'victory') {
        chars[i].setAnimation('victory');
      }
    }
  }, [glassesSips]);

  // Update active player halo highlight
  useEffect(() => {
    const instances = glassInstancesRef.current;
    for (let i = 0; i < instances.length; i++) {
      instances[i].haloMesh.visible = (i === activePlayerIndex);
    }
  }, [activePlayerIndex]);

  // Switch character model type (Fall Guy vs RobotExpressive vs Moroccan Bean)
  useEffect(() => {
    characterModelTypeRef.current = characterModelType;
    if (arrangeChairsAndGlassesRef.current) {
      arrangeChairsAndGlassesRef.current(playerCount, glassesSips, activePlayerIndex);
    }
  }, [characterModelType]);

  // Toggle Character Skeleton / Joints (Mafasil) visualizer
  useEffect(() => {
    showSkeletonRef.current = showSkeleton;
    const chars = characterInstancesRef.current;
    chars.forEach(c => c.toggleSkeleton(showSkeleton));
  }, [showSkeleton]);

  // Toggle Snapchat Meme Face on active characters
  useEffect(() => {
    const chars = characterInstancesRef.current;
    chars.forEach(c => {
      if (c.toggleSnapchatFace) {
        c.toggleSnapchatFace(snapchatFace !== false);
      }
    });
  }, [snapchatFace]);

  // Update custom camera / meme cropped face on active characters
  useEffect(() => {
    const chars = characterInstancesRef.current;
    chars.forEach(c => {
      if (c.setCustomSnapchatFace) {
        c.setCustomSnapchatFace(customSnapchatFace ?? null);
      }
    });
  }, [customSnapchatFace]);

  // Camera focus mode on active character
  useEffect(() => {
    focusCharacterRef.current = focusCharacter;
    if (!focusCharacter && controlsRef.current) {
      controlsRef.current.target.set(0, 0.85, 0);
    }
  }, [focusCharacter]);

  // Handle Character Studio animation triggers
  useEffect(() => {
    if (!studioAnimation) return;
    const chars = characterInstancesRef.current;
    const targetIdx = studioAnimation.playerIndex ?? activePlayerIndex;
    if (chars[targetIdx]) {
      chars[targetIdx].setAnimation(studioAnimation.state);
    }
  }, [studioAnimation]);

  // Handle Moroccan Paint Lottery skin changes
  useEffect(() => {
    if (!activeSkinId) return;
    const found = PAINT_LOTTERY_COLORS.find(p => p.id === activeSkinId);
    if (!found) return;
    const chars = characterInstancesRef.current;
    if (chars[activePlayerIndex]) {
      chars[activePlayerIndex].setPalette(found);
    }
  }, [activeSkinId, activePlayerIndex]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Light Switch in Top Right */}
      <div className="absolute top-6 right-6 z-20 flex flex-col items-center">
        <button
          onClick={onToggleLight}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full border shadow-xl backdrop-blur-md transition-all duration-300 ${
            lightOn
              ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-amber-500/10'
              : 'bg-slate-900/80 border-slate-700/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className={`w-3 h-3 rounded-full transition-all duration-300 ${
            lightOn ? 'bg-amber-400 shadow-[0_0_12px_#ffaa33]' : 'bg-slate-600'
          }`} />
          <span className="text-xs font-bold tracking-wider font-mono uppercase">
            {lightOn ? 'البولة: شاعلة' : 'البولة: طافية'}
          </span>
        </button>
        <span className="text-[10px] text-slate-400/60 mt-1 font-mono">كليك باش تشعل/طفي</span>
      </div>
    </div>
  );
};
