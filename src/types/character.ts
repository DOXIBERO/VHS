import * as THREE from 'three';

export type CharacterAnimationState =
  | 'idle'
  | 'drink_sip'
  | 'refill_shock'
  | 'victory'
  | 'laugh'
  | 'talk_german'
  | 'jump_down'
  | 'jump_up'
  | 'walk'
  | 'run';

export type CharacterModelType = 'fallguy' | 'bean' | 'robot';

export interface CharacterColorPalette {
  id: string;
  nameAr: string;
  nameEn: string;
  bodyColor: number;
  bellyColor: number;
  shoeColor: number;
  soleColor: number;
}

export const PAINT_LOTTERY_COLORS: CharacterColorPalette[] = [
  {
    id: 'pistachio',
    nameAr: 'بيسطاش خانز',
    nameEn: 'Rotten Pistachio',
    bodyColor: 0x65a30d,
    bellyColor: 0x84cc16,
    shoeColor: 0x1e293b,
    soleColor: 0xf8fafc,
  },
  {
    id: 'flamingo',
    nameAr: 'فلامينغو محروق بالشمس',
    nameEn: 'Sunburned Flamingo',
    bodyColor: 0xf43f5e,
    bellyColor: 0xfb7185,
    shoeColor: 0x334155,
    soleColor: 0xf8fafc,
  },
  {
    id: 'couch_ochre',
    nameAr: 'بونج الصالون التقليدي',
    nameEn: "Grandma's Couch Ochre",
    bodyColor: 0xd97706,
    bellyColor: 0xfbbf24,
    shoeColor: 0x0f172a,
    soleColor: 0xf8fafc,
  },
  {
    id: 'tax_slate',
    nameAr: 'رمادي قباضة الضرائب',
    nameEn: 'Tax Return Slate',
    bodyColor: 0x64748b,
    bellyColor: 0x94a3b8,
    shoeColor: 0x1e293b,
    soleColor: 0xf8fafc,
  },
  {
    id: 'purple',
    nameAr: 'بنفسجي وجودي حيران',
    nameEn: 'Existential Purple',
    bodyColor: 0x8b5cf6,
    bellyColor: 0xa78bfa,
    shoeColor: 0x1e1b4b,
    soleColor: 0xf8fafc,
  },
  {
    id: 'morocco_blue',
    nameAr: 'أزرق طنجاوي ملكي',
    nameEn: 'Royal Blue Morocco',
    bodyColor: 0x0284c7,
    bellyColor: 0x38bdf8,
    shoeColor: 0x0c4a6e,
    soleColor: 0xf8fafc,
  },
];

export interface JointHierarchy {
  root: THREE.Group;
  pelvis: THREE.Group | THREE.Bone;
  spine: THREE.Group | THREE.Bone;
  chest: THREE.Group | THREE.Bone;
  neck: THREE.Group | THREE.Bone;
  head: THREE.Group | THREE.Bone;

  // Left Arm (Cat/Leopard flexible tail chain)
  leftClavicle: THREE.Group;
  leftShoulder: THREE.Group;
  leftElbow: THREE.Group;
  leftWrist: THREE.Group;
  leftArmSeg3?: THREE.Group;
  leftHand: THREE.Group;
  leftArmChain?: THREE.Object3D[];

  // Right Arm (Cat/Leopard flexible tail chain)
  rightClavicle: THREE.Group;
  rightShoulder: THREE.Group;
  rightElbow: THREE.Group;
  rightWrist: THREE.Group;
  rightArmSeg3?: THREE.Group;
  rightHand: THREE.Group;
  rightArmChain?: THREE.Object3D[];

  // Left Leg
  leftHip: THREE.Group;
  leftKnee: THREE.Group;
  leftAnkle: THREE.Group;
  leftFoot: THREE.Group;

  // Right Leg
  rightHip: THREE.Group;
  rightKnee: THREE.Group;
  rightAnkle: THREE.Group;
  rightFoot: THREE.Group;
}

export interface FaceRig {
  eyeLeft: THREE.Mesh;
  eyeRight: THREE.Mesh;
  pupilLeft: THREE.Mesh;
  pupilRight: THREE.Mesh;
  browLeft: THREE.Mesh;
  browRight: THREE.Mesh;
  mouthMesh: THREE.Mesh;
  mouthCanvas: HTMLCanvasElement;
  mouthCtx: CanvasRenderingContext2D;
  mouthTexture: THREE.CanvasTexture;
  cheeks: THREE.Group;
  throatBulgeMesh: THREE.Mesh;
  headDomeMesh?: THREE.Mesh;
}

export interface CustomSnapchatFaceData {
  mode?: 'smart_live' | 'smart_photo' | 'astronaut_live' | 'astronaut_photo' | 'snapchat_elements';
  videoElement?: HTMLVideoElement | null;
  fullFaceImage?: HTMLCanvasElement | HTMLImageElement | null;
  lensDistortion?: number; // 0.0 to 1.0 (default 0.42)
  zoomScale?: number; // 0.5 to 2.5 (default 1.0)
  offsetX?: number;
  offsetY?: number;
  glassGlare?: boolean;
  bezelStyle?: 'titanium' | 'gold' | 'neon';
  leftEye?: HTMLCanvasElement | HTMLImageElement;
  rightEye?: HTMLCanvasElement | HTMLImageElement;
  mouth?: HTMLCanvasElement | HTMLImageElement;
}

export interface CharacterInstance {
  group: THREE.Group;
  joints: JointHierarchy;
  face: FaceRig;
  bodyMesh: THREE.Mesh;
  bodyMaterial: THREE.MeshStandardMaterial;
  bellyMaterial: THREE.MeshStandardMaterial;
  palette: CharacterColorPalette;
  animState: CharacterAnimationState;
  animTime: number;
  stateDuration: number;
  playerIndex: number;
  isSeated: boolean;
  skeletonHelper?: THREE.Group | THREE.Object3D;
  showSkeleton: boolean;
  skinnedBodyMesh?: THREE.SkinnedMesh;
  applySquashStretch?: (factor: number) => void;
  setAnimation: (state: CharacterAnimationState) => void;
  setPalette: (palette: CharacterColorPalette) => void;
  toggleSkeleton: (visible: boolean) => void;
  snapchatFaceEnabled?: boolean;
  toggleSnapchatFace?: (enabled: boolean) => void;
  isStrapVisible?: boolean;
  toggleStrap?: (enabled: boolean) => void;
  customSnapchatFace?: CustomSnapchatFaceData | null;
  setCustomSnapchatFace?: (faceData: CustomSnapchatFaceData | null) => void;
  update: (dt: number, time: number) => void;
}
