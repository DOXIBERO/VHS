import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { CollisionManager } from '../physics/CollisionManager.js';
import { BeanCustomization } from './BeanCustomization.js';

/**
 * BeanBody (PHASE 2: AUTHENTIC 3D FALL GUY BEAN MODEL)
 * Loads the authentic Fall Guy 3D GLB model with complete skeletal rig,
 * official eye mesh, textures, native animations, and dynamic skin customization.
 * Supports rapid instance cloning via SkeletonUtils for ObjectPool integration.
 */
export class BeanBody {
  // Static GLTF model cache to avoid redundant network loads and Draco decodes
  static cachedGltf = null;
  static loadingPromise = null;
  static sharedSphereShape = new CANNON.Sphere(0.6);
  static sharedCustomization = null;

  /**
   * Preload and cache the Fall Guy GLTF model once
   * @returns {Promise<Object>}
   */
  static preloadModel() {
    if (BeanBody.cachedGltf) {
      return Promise.resolve(BeanBody.cachedGltf);
    }
    if (BeanBody.loadingPromise) {
      return BeanBody.loadingPromise;
    }

    const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL)
      ? (import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`)
      : '/VHS/';

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(`${baseUrl}draco/gltf/`);
    loader.setDRACOLoader(dracoLoader);

    const modelPath = `${baseUrl}models/characters/fall_guy.glb`;
    console.log('[BeanBody] Preloading authentic Fall Guy GLB from:', modelPath);

    BeanBody.loadingPromise = new Promise((resolve, reject) => {
      loader.load(
        modelPath,
        (gltf) => {
          BeanBody.cachedGltf = gltf;
          console.log(`[BeanBody] Fall Guy model cached successfully with ${gltf.animations.length} animations`);
          resolve(gltf);
        },
        undefined,
        (err) => {
          console.error('[BeanBody] Failed to load Fall Guy GLB:', err);
          reject(err);
        }
      );
    });

    return BeanBody.loadingPromise;
  }

  /**
   * @param {Object} options
   * @param {string} options.id
   * @param {string} options.skin - 'CLASSIC', 'KREUZBERG', 'SPÄTI', 'U-BAHN', 'BERGHAIN'
   * @param {THREE.Vector3} options.position
   * @param {import('../physics/PhysicsMaterials.js').PhysicsMaterials} options.physicsMaterial
   */
  constructor(options = {}) {
    this.id = options.id || 'player_bean';
    const initPos = options.position || new THREE.Vector3(0, 1.5, 0);

    // Root Three.js Group
    this.mesh = new THREE.Group();
    this.mesh.name = `Bean_${this.id}`;
    this.mesh.userData = { bean: this };

    // Animations & Mixer
    this.mixer = null;
    this.actions = {};
    this.currentAction = null;
    this.isModelLoaded = false;
    this.characterRoot = null;

    // Body parts references
    this.bodyMesh = null; // Torso
    this.handMesh = null; // Hands
    this.legMesh = null;  // Legs & Shoes
    this.eyeMesh = null;  // Faceplate & Eyes

    // Material clones for isolated customization
    this.customBodyMaterial = null;
    this.customHandMaterial = null;
    this.customLegMaterial = null;

    // Skin Customization & Accessories (Skin 1: Officer)
    this.customization = BeanBody.sharedCustomization || (BeanBody.sharedCustomization = new BeanCustomization());
    this.pendingSkin = options.skin || 'OFFICER';
    this.accessoriesGroup = null;
    this.officerAccessories = null;
    this.headBone = null;
    this.initialHeadBoneY = 0;

    // ObjectPool active state
    this.active = true;

    // Build Cannon-es Physics Body
    this.initPhysicsBody(initPos, options.physicsMaterial);

    // Link mesh & body for callers
    this.mesh.body = this.body;

    // Load or clone model
    this.initModel();
  }

  initModel() {
    if (BeanBody.cachedGltf) {
      this.setupModel(BeanBody.cachedGltf);
    } else {
      BeanBody.preloadModel()
        .then((gltf) => {
          this.setupModel(gltf);
        })
        .catch((err) => {
          console.error('[BeanBody] Failed to initialize model:', err);
        });
    }
  }

  setupModel(gltf) {
    if (!gltf || !gltf.scene) return;

    // Clone skeleton and skinned hierarchy safely via SkeletonUtils
    this.characterRoot = SkeletonUtils.clone(gltf.scene);
    const scale = 0.65;
    this.characterRoot.scale.set(scale, scale, scale);
    this.characterRoot.position.set(0, -0.6, 0);

    // Identify and segregate all authentic meshes
    this.characterRoot.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.name === 'eye') {
          this.eyeMesh = child;
          this.eyeMesh.visible = true; // Authentic Fall Guy faceplate & eyes
        } else if (child.name === 'leg') {
          this.legMesh = child;
        } else if (child.name === 'hand-') {
          this.handMesh = child;
        } else {
          this.bodyMesh = child; // 'body' torso
        }
      }
    });

    // Cache skeletal bones for accessory tracking
    this.headBone = this.characterRoot.getObjectByName('Head_C_jnt01_04') || this.characterRoot.getObjectByName('Head_C_nub_07');
    this.chestBone = this.characterRoot.getObjectByName('Chest_C_jnt_02');
    this.initialHeadBoneY = this.headBone ? this.headBone.position.y : 0;

    // Dedicated Animation Mixer for this instance
    this.mixer = new THREE.AnimationMixer(this.characterRoot);
    this.actions = {};
    if (gltf.animations) {
      gltf.animations.forEach((clip) => {
        this.actions[clip.name] = this.mixer.clipAction(clip);
      });
    }

    // Play default authentic 'idle' animation
    if (this.actions['idle']) {
      this.playAnimation('idle');
    }

    this.mesh.add(this.characterRoot);
    this.isModelLoaded = true;

    // Apply pending or default skin
    if (this.pendingSkin) {
      this.applySkin(this.pendingSkin);
    }
  }

  /**
   * Apply a skin palette and accessories (Parts 0211-0230)
   * @param {string} skinName - 'CLASSIC', 'KREUZBERG', 'SPÄTI', 'U-BAHN', 'BERGHAIN'
   */
  applySkin(skinName) {
    this.pendingSkin = skinName;
    return this.customization.applySkin(skinName, this);
  }

  /**
   * Play an animation clip smoothly with cross-fade
   * @param {string} name - 'idle', 'walk', 'run', 'jump_up', 'dive', 'fall', 'wave'
   * @param {number} fadeDuration - duration in seconds
   */
  playAnimation(name, fadeDuration = 0.25) {
    const nextAction = this.actions[name];
    if (!nextAction) return;

    if (this.currentAction && this.currentAction !== nextAction) {
      this.currentAction.fadeOut(fadeDuration);
    }

    nextAction.reset().fadeIn(fadeDuration).play();
    this.currentAction = nextAction;
  }

  // --- Physics Setup ---
  initPhysicsBody(pos, material) {
    this.body = new CANNON.Body({
      mass: 1.0,
      shape: BeanBody.sharedSphereShape, // Reusable Sphere collider (radius 0.6)
      position: new CANNON.Vec3(pos.x, pos.y, pos.z),
      material: material || undefined,
      linearDamping: 0.3,
      angularDamping: 0.95
    });

    // Keep bean standing upright (lock rotation around X and Z axes)
    this.body.angularFactor.set(0, 1, 0);

    // Tag physics body for CollisionManager
    CollisionManager.tagBody(this.body, {
      type: 'bean',
      id: this.id
    });

    this.syncWithPhysics();
  }

  /**
   * Set world position for physics and mesh simultaneously
   * @param {THREE.Vector3|{x:number, y:number, z:number}} pos 
   */
  setPosition(pos) {
    const x = pos.x ?? 0;
    const y = pos.y ?? 0;
    const z = pos.z ?? 0;

    if (this.body) {
      this.body.position.set(x, y, z);
      this.body.velocity.set(0, 0, 0);
      this.body.angularVelocity.set(0, 0, 0);
    }
    if (this.mesh) {
      this.mesh.position.set(x, y, z);
    }
  }

  /**
   * Reset instance state when retrieved from ObjectPool (Parts 0231-0240)
   * @param {Object} config 
   */
  reset(config = {}) {
    if (config.id) {
      this.id = config.id;
      this.mesh.name = `Bean_${this.id}`;
      CollisionManager.tagBody(this.body, { type: 'bean', id: this.id });
    }

    if (config.position) {
      this.setPosition(config.position);
    }

    if (this.body) {
      this.body.velocity.set(0, 0, 0);
      this.body.angularVelocity.set(0, 0, 0);
      this.body.quaternion.set(0, 0, 0, 1);
    }

    const skin = config.skin || 'OFFICER';
    this.applySkin(skin);

    if (this.actions['idle']) {
      this.playAnimation('idle');
    }
  }

  /**
   * Synchronize Three.js visual mesh with Cannon.js physics body
   */
  syncWithPhysics() {
    if (!this.body || !this.mesh) return;
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  }

  /**
   * Frame update for animations and physics
   * @param {number} dt 
   */
  update(dt = 1 / 60) {
    if (this.mixer) {
      this.mixer.update(dt);
    }
    this.syncWithPhysics();
    if (this.customization && this.customization.update) {
      this.customization.update(dt, this);
    }
  }

  /**
   * Clean up resources
   */
  dispose() {
    if (this.mixer) {
      this.mixer.stopAllAction();
    }
    if (this.mesh && this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }
    if (this.customBodyMaterial) {
      this.customBodyMaterial.dispose();
      this.customBodyMaterial = null;
    }
    if (this.customHandMaterial) {
      this.customHandMaterial.dispose();
      this.customHandMaterial = null;
    }
    if (this.customLegMaterial) {
      this.customLegMaterial.dispose();
      this.customLegMaterial = null;
    }
    if (this.customization) {
      this.customization.dispose();
    }
  }
}

