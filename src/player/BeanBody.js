import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { CollisionManager } from '../physics/CollisionManager.js';

/**
 * BeanBody (PHASE 2: AUTHENTIC 3D FALL GUY BEAN MODEL)
 * Loads the authentic Fall Guy 3D GLB model with complete skeletal rig,
 * official eye mesh, textures, and native animations:
 * - idle, walk, run, wave, jump_up, jump_air, dive, fall
 * Synchronized with Cannon-es physics collider.
 */
export class BeanBody {
  /**
   * @param {Object} options
   * @param {string} options.id
   * @param {THREE.Vector3} options.position
   * @param {import('../physics/PhysicsMaterials.js').PhysicsMaterials} options.physicsMaterial
   */
  constructor(options = {}) {
    this.id = options.id || 'player_bean';
    const initPos = options.position || new THREE.Vector3(0, 1.5, 0);

    // Root Group
    this.mesh = new THREE.Group();
    this.mesh.name = `Bean_${this.id}`;

    // Animations & Mixer
    this.mixer = null;
    this.actions = {};
    this.currentAction = null;
    this.isModelLoaded = false;
    this.characterRoot = null;
    this.eyeMesh = null;

    // Build Cannon-es Physics Body
    this.initPhysicsBody(initPos, options.physicsMaterial);

    // Load Authentic Fall Guy GLB Model
    this.loadFallGuyModel();
  }

  loadFallGuyModel() {
    const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL)
      ? (import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`)
      : '/VHS/';

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    // Use official Google CDN for Draco decoder to guarantee worker compatibility
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);

    const modelPath = `${baseUrl}models/characters/fall_guy.glb`;
    console.log('[BeanBody] Loading authentic Fall Guy model from:', modelPath);

    loader.load(
      modelPath,
      (gltf) => {
        this.characterRoot = gltf.scene;
        // Perfect Fall Guys scale for 3rd person camera
        const scale = 0.65;
        this.characterRoot.scale.set(scale, scale, scale);
        this.characterRoot.position.set(0, -0.6, 0);

        this.characterRoot.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.name === 'eye') {
              this.eyeMesh = child;
              this.eyeMesh.visible = true; // Authentic Fall Guy eyes
            }
          }
        });

        // Setup Animation Mixer
        this.mixer = new THREE.AnimationMixer(this.characterRoot);
        gltf.animations.forEach((clip) => {
          this.actions[clip.name] = this.mixer.clipAction(clip);
        });

        // Play default authentic 'idle' animation
        if (this.actions['idle']) {
          this.playAnimation('idle');
        }

        this.mesh.add(this.characterRoot);
        this.isModelLoaded = true;
        console.log(`[BeanBody] Authentic Fall Guy 3D model loaded successfully with ${gltf.animations.length} animations!`);
      },
      (progress) => {
        if (progress.total > 0) {
          const pct = Math.round((progress.loaded / progress.total) * 100);
          console.log(`[BeanBody] Download progress: ${pct}%`);
        }
      },
      (err) => {
        console.error('[BeanBody] Error loading fall_guy.glb:', err);
      }
    );
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
      shape: new CANNON.Sphere(0.6), // Sphere collider (radius 0.6)
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
  }
}
