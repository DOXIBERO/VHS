import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import {
  CharacterInstance,
  CharacterColorPalette,
  CharacterAnimationState,
  JointHierarchy,
  FaceRig,
  PAINT_LOTTERY_COLORS,
} from '../types/character';

export function createRobotCharacterInstance(
  gltf: { scene: THREE.Group; animations: THREE.AnimationClip[] },
  playerIndex: number = 0,
  paletteOverride?: CharacterColorPalette
): CharacterInstance {
  const palette =
    paletteOverride ??
    PAINT_LOTTERY_COLORS[playerIndex % PAINT_LOTTERY_COLORS.length];

  // Deep clone rigged skeleton using Three.js SkeletonUtils
  const robotRoot = SkeletonUtils.clone(gltf.scene) as THREE.Group;
  robotRoot.userData = { playerIndex, isRobot: true };

  // Scale to match the garage wedding chair dimensions (~0.68m tall)
  const robotScale = 0.28;
  robotRoot.scale.set(robotScale, robotScale, robotScale);

  // Enable shadows and find Head mesh for facial blendshapes
  let headMesh: THREE.Mesh | undefined;
  let bodyMeshInstance: THREE.Mesh | undefined;
  robotRoot.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      if (!bodyMeshInstance) bodyMeshInstance = child as THREE.Mesh;
      if (child.name === 'Head') {
        headMesh = child as THREE.Mesh;
      }
    }
  });

  // Animation Mixer
  const mixer = new THREE.AnimationMixer(robotRoot);
  const actions: Record<string, THREE.AnimationAction> = {};
  for (const clip of gltf.animations) {
    actions[clip.name] = mixer.clipAction(clip);
  }

  // Active animation tracking
  let currentAction: THREE.AnimationAction | undefined;

  const playAction = (name: string, duration: number = 0.35, loop: boolean = true) => {
    const nextAction = actions[name];
    if (!nextAction) return;

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

  // Start with Sitting if seated, or Idle
  if (actions['Sitting']) {
    playAction('Sitting', 0.2, true);
  } else if (actions['Idle']) {
    playAction('Idle', 0.2, true);
  }

  // Facial morph targets helper: 'Angry', 'Surprised', 'Sad'
  const setMorphTarget = (targetName: string, weight: number) => {
    if (!headMesh || !headMesh.morphTargetDictionary || !headMesh.morphTargetInfluences) return;
    const idx = headMesh.morphTargetDictionary[targetName];
    if (idx !== undefined) {
      headMesh.morphTargetInfluences[idx] = THREE.MathUtils.clamp(weight, 0, 1);
    }
  };

  // Dummy joints for CharacterInstance interface compatibility
  const dummyGroup = new THREE.Group();
  const joints: JointHierarchy = {
    root: robotRoot,
    pelvis: dummyGroup,
    spine: dummyGroup,
    chest: dummyGroup,
    neck: dummyGroup,
    head: dummyGroup,
    leftClavicle: dummyGroup,
    leftShoulder: dummyGroup,
    leftElbow: dummyGroup,
    leftWrist: dummyGroup,
    leftHand: dummyGroup,
    rightClavicle: dummyGroup,
    rightShoulder: dummyGroup,
    rightElbow: dummyGroup,
    rightWrist: dummyGroup,
    rightHand: dummyGroup,
    leftHip: dummyGroup,
    leftKnee: dummyGroup,
    leftAnkle: dummyGroup,
    leftFoot: dummyGroup,
    rightHip: dummyGroup,
    rightKnee: dummyGroup,
    rightAnkle: dummyGroup,
    rightFoot: dummyGroup,
  };

  const dummyMat = new THREE.MeshStandardMaterial({ color: palette.bodyColor });
  const dummyMesh = new THREE.Mesh(new THREE.BufferGeometry(), dummyMat);
  const dummyCanvas = document.createElement('canvas');
  dummyCanvas.width = 64;
  dummyCanvas.height = 64;
  const dummyCtx = dummyCanvas.getContext('2d')!;

  const face: FaceRig = {
    eyeLeft: dummyMesh,
    eyeRight: dummyMesh,
    pupilLeft: dummyMesh,
    pupilRight: dummyMesh,
    browLeft: dummyMesh,
    browRight: dummyMesh,
    mouthMesh: dummyMesh,
    mouthCanvas: dummyCanvas,
    mouthCtx: dummyCtx,
    mouthTexture: new THREE.CanvasTexture(dummyCanvas),
    cheeks: dummyGroup,
    throatBulgeMesh: dummyMesh,
  };

  let prevAnimState: CharacterAnimationState = 'idle';

  const instance: CharacterInstance = {
    group: robotRoot,
    joints,
    face,
    bodyMesh: bodyMeshInstance ?? dummyMesh,
    bodyMaterial: dummyMat,
    bellyMaterial: dummyMat,
    palette,
    animState: 'idle',
    animTime: 0,
    stateDuration: 0,
    playerIndex,
    isSeated: true,
    showSkeleton: false,

    setAnimation: (state: CharacterAnimationState) => {
      instance.animState = state;
      instance.animTime = 0;
    },

    setPalette: (newPalette: CharacterColorPalette) => {
      instance.palette = newPalette;
    },

    toggleSkeleton: (_visible: boolean) => {},

    update: (dt: number, _time: number) => {
      instance.animTime += dt;
      const t = instance.animTime;
      const state = instance.animState;

      // When animation state changes or continues
      if (state !== prevAnimState) {
        prevAnimState = state;
      }

      // Route animation states to RobotExpressive animations and facial morphs
      switch (state) {
        case 'idle': {
          if (instance.isSeated) {
            playAction('Sitting', 0.4, true);
          } else {
            playAction('Idle', 0.4, true);
          }
          setMorphTarget('Surprised', 0);
          setMorphTarget('Angry', 0);
          setMorphTarget('Sad', 0);
          break;
        }

        case 'drink_sip': {
          instance.isSeated = true;
          if (t < 0.85) {
            // Reaching for cup
            playAction('Sitting', 0.3, true);
            setMorphTarget('Surprised', 0.35);
          } else if (t < 1.45) {
            // Lifting cup to mouth
            playAction('Sitting', 0.2, true);
            setMorphTarget('Surprised', 0.7);
          } else if (t < 2.35) {
            // Sipping tea happily
            playAction('Sitting', 0.2, true);
            setMorphTarget('Surprised', 0);
            setMorphTarget('Sad', 0);
          } else if (t < 2.95) {
            // Returning cup to table
            playAction('Sitting', 0.3, true);
          } else {
            // Thumbs up of satisfaction!
            playAction('ThumbsUp', 0.25, false);
            setMorphTarget('Surprised', 0.5);
            if (t >= 3.6) {
              instance.animState = 'idle';
              instance.animTime = 0;
            }
          }
          break;
        }

        case 'refill_shock': {
          instance.isSeated = true;
          if (t < 0.4) {
            // Surprise shock!
            setMorphTarget('Surprised', 1.0);
            playAction('Punch', 0.15, false);
          } else if (t < 2.2) {
            // Gagging / coughing spasms
            setMorphTarget('Surprised', 0.9);
            setMorphTarget('Angry', 0.8);
            playAction('Death', 0.25, false);
          } else {
            // Recovery
            setMorphTarget('Surprised', 0.2);
            setMorphTarget('Angry', 0);
            setMorphTarget('Sad', 0.4);
            playAction('Sitting', 0.4, true);
            if (t >= 3.2) {
              instance.animState = 'idle';
              instance.animTime = 0;
            }
          }
          break;
        }

        case 'victory': {
          instance.isSeated = true;
          setMorphTarget('Surprised', 0.6);
          playAction('Dance', 0.3, true);
          if (t >= 3.5) {
            instance.animState = 'idle';
            instance.animTime = 0;
          }
          break;
        }

        case 'laugh': {
          instance.isSeated = true;
          setMorphTarget('Surprised', 0.5);
          playAction('Wave', 0.25, true);
          if (t >= 3.2) {
            instance.animState = 'idle';
            instance.animTime = 0;
          }
          break;
        }

        case 'talk_german': {
          instance.isSeated = true;
          setMorphTarget('Surprised', 0.2);
          playAction('Yes', 0.25, true);
          if (t >= 4.2) {
            instance.animState = 'idle';
            instance.animTime = 0;
          }
          break;
        }

        case 'walk': {
          instance.isSeated = false;
          setMorphTarget('Surprised', 0);
          setMorphTarget('Angry', 0);
          playAction('Walking', 0.3, true);
          break;
        }

        case 'run': {
          instance.isSeated = false;
          setMorphTarget('Surprised', 0.4);
          playAction('Running', 0.25, true);
          break;
        }

        case 'jump_down': {
          if (t < 0.25) {
            instance.isSeated = true;
            setMorphTarget('Surprised', 0.3);
            playAction('Sitting', 0.15, true);
          } else if (t < 0.85) {
            instance.isSeated = false;
            setMorphTarget('Surprised', 0.8);
            playAction('Jump', 0.15, false);
          } else {
            instance.isSeated = false;
            setMorphTarget('Surprised', 0.0);
            playAction('Idle', 0.25, true);
            if (t >= 1.65) {
              instance.animState = 'idle';
              instance.animTime = 0;
            }
          }
          break;
        }

        case 'jump_up': {
          setMorphTarget('Surprised', 0.6);
          playAction('Jump', 0.15, false);
          if (t >= 1.2) {
            instance.isSeated = true;
            instance.animState = 'idle';
            instance.animTime = 0;
          }
          break;
        }
      }

      // Step the Three.js AnimationMixer
      mixer.update(dt);
    },
  };

  return instance;
}
