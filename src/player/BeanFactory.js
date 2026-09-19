import * as THREE from 'three';
import { BeanBody } from './BeanBody.js';
import { ObjectPool, PoolManager } from '../core/ObjectPool.js';

/**
 * BeanFactory (Parts 0231-0240 | PHASE 2: PLAYER MODEL)
 * High-performance factory that uses ObjectPool to create, prewarm, and recycle bean instances.
 * Eliminates garbage collection spikes during high-intensity multiplayer rounds.
 */
export class BeanFactory {
  /**
   * @param {Object} options
   * @param {THREE.Scene} [options.scene]
   * @param {import('../physics/PhysicsWorld.js').PhysicsWorld} [options.physicsWorld]
   * @param {any} [options.physicsMaterial]
   */
  constructor(options = {}) {
    this.scene = options.scene || null;
    this.physicsWorld = options.physicsWorld || null;
    this.physicsMaterial = options.physicsMaterial || null;

    this.idCounter = 0;
    this.activeBeans = new Map();

    // Initialize named ObjectPool for Beans
    this.pool = PoolManager.getPool(
      'beans',
      () => this._instantiateBean(),
      (bean, config) => this._resetBean(bean, config),
      0
    );
  }

  _instantiateBean() {
    const id = `bean_pooled_${++this.idCounter}`;
    const bean = new BeanBody({
      id,
      position: new THREE.Vector3(0, -999, 0), // Offscreen parking
      physicsMaterial: this.physicsMaterial
    });
    return bean;
  }

  _resetBean(bean, config = {}) {
    if (bean && typeof bean.reset === 'function') {
      bean.reset(config);
    }
  }

  /**
   * Prewarm N bean instances upfront for instantaneous runtime spawning
   * @param {number} count - default 20
   * @returns {number} duration in ms
   */
  prewarm(count = 20) {
    const start = performance.now();
    this.pool.prewarm(count);
    const duration = performance.now() - start;
    console.log(`[BeanFactory] Prewarmed ${count} beans in ${duration.toFixed(2)}ms (Pool size: ${this.pool.size})`);
    return duration;
  }

  /**
   * Spawns or acquires a fully assembled bean instance
   * Method createBean(config) returns a bean instance with physics body and mesh Group
   * @param {Object} config
   * @param {string} [config.id]
   * @param {THREE.Vector3|{x:number, y:number, z:number}} [config.position]
   * @param {string} [config.skin] - 'CLASSIC', 'KREUZBERG', 'SPÄTI', 'U-BAHN', 'BERGHAIN'
   * @param {THREE.Scene} [config.scene]
   * @param {import('../physics/PhysicsWorld.js').PhysicsWorld} [config.physicsWorld]
   * @returns {BeanBody} The bean instance
   */
  createBean(config = {}) {
    const bean = this.pool.acquire(config);
    const targetScene = config.scene || this.scene;
    const targetPhysics = config.physicsWorld || this.physicsWorld;

    if (config.id) {
      bean.id = config.id;
      bean.mesh.name = `Bean_${bean.id}`;
    }

    if (config.position) {
      bean.setPosition(config.position);
    }

    if (config.skin) {
      bean.applySkin(config.skin);
    }

    // Attach to Scene
    if (targetScene && bean.mesh) {
      if (bean.mesh.parent !== targetScene) {
        targetScene.add(bean.mesh);
      }
      bean.mesh.visible = true;
    }

    // Attach to Physics World
    if (targetPhysics && bean.body) {
      targetPhysics.addBody(bean.body, bean.mesh);
    }

    this.activeBeans.set(bean.id, bean);

    // Provide mutual navigation links for caller convenience
    bean.mesh.userData = bean.mesh.userData || {};
    bean.mesh.userData.bean = bean;
    bean.mesh.body = bean.body;

    return bean;
  }

  /**
   * Recycles a bean instance back to the ObjectPool cleanly
   * Method destroyBean(bean) removes from scene and physics, returns to pool
   * @param {BeanBody|THREE.Object3D} target
   * @returns {boolean}
   */
  destroyBean(target) {
    if (!target) return false;

    // Resolve target to BeanBody instance
    let bean = null;
    if (target instanceof BeanBody) {
      bean = target;
    } else if (target.userData?.bean) {
      bean = target.userData.bean;
    } else if (target.bean) {
      bean = target.bean;
    } else {
      for (const b of this.activeBeans.values()) {
        if (b.mesh === target || b.body === target) {
          bean = b;
          break;
        }
      }
    }

    if (!bean) return false;

    // Remove from Scene
    if (bean.mesh && bean.mesh.parent) {
      bean.mesh.parent.remove(bean.mesh);
    }

    // Remove from Physics
    if (this.physicsWorld && bean.body) {
      this.physicsWorld.removeBody(bean.body);
    }

    // Park far away
    bean.setPosition({ x: 0, y: -999, z: 0 });

    this.activeBeans.delete(bean.id);

    // Return to ObjectPool
    this.pool.release(bean);
    return true;
  }

  /**
   * Frame update for all active beans
   * @param {number} dt 
   */
  update(dt = 1 / 60) {
    for (const bean of this.activeBeans.values()) {
      bean.update(dt);
    }
  }

  /**
   * Recycle all active beans
   */
  destroyAll() {
    for (const bean of Array.from(this.activeBeans.values())) {
      this.destroyBean(bean);
    }
    this.activeBeans.clear();
  }

  /**
   * Get all active beans
   * @returns {Array<BeanBody>}
   */
  getActiveBeans() {
    return Array.from(this.activeBeans.values());
  }

  /**
   * Number of available pooled instances
   */
  get availableCount() {
    return this.pool.available;
  }

  /**
   * Number of active beans in scene
   */
  get activeCount() {
    return this.activeBeans.size;
  }
}
