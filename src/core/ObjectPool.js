/**
 * ObjectPool (Parts 0181-0200 | PHASE 1: ENGINE)
 * High-performance generic object pooling system designed to eliminate GC (garbage collection)
 * spikes and memory thrashing on mobile and web devices.
 * 
 * Supports prewarming, instant reuse, state resetting, and active tracking.
 */
export class ObjectPool {
  /**
   * @param {Function} factory - Factory function that instantiates a new object
   * @param {Function|null} resetFn - Optional reset/reinitialization function (obj, ...args)
   * @param {number} initialSize - Optional initial count to prewarm immediately
   */
  constructor(factory, resetFn = null, initialSize = 0) {
    if (typeof factory !== 'function') {
      throw new Error('[ObjectPool] A factory function must be provided');
    }

    this.factory = factory;
    this.resetFn = resetFn;

    /** @type {Array<any>} Inactive objects ready to be acquired */
    this.pool = [];

    /** @type {Set<any>} Currently acquired active objects */
    this.active = new Set();

    /** @type {number} Total instances created across pool lifetime */
    this.totalCreated = 0;

    if (initialSize > 0) {
      this.prewarm(initialSize);
    }
  }

  /**
   * Pre-allocates N objects upfront to prevent runtime allocations
   * @param {number} count 
   */
  prewarm(count) {
    for (let i = 0; i < count; i++) {
      const obj = this.factory();
      if (obj && typeof obj === 'object' && 'active' in obj) {
        obj.active = false;
      }
      this.pool.push(obj);
      this.totalCreated++;
    }
    return this;
  }

  /**
   * Acquire an object from the pool. Reuses an inactive instance if available,
   * otherwise creates a new one using the factory.
   * @param  {...any} args - Arguments forwarded to resetFn
   * @returns {any}
   */
  acquire(...args) {
    let obj;

    if (this.pool.length > 0) {
      obj = this.pool.pop();
    } else {
      obj = this.factory(...args);
      this.totalCreated++;
    }

    this.active.add(obj);

    if (obj && typeof obj === 'object' && 'active' in obj) {
      obj.active = true;
    }

    if (this.resetFn) {
      this.resetFn(obj, ...args);
    }

    return obj;
  }

  /**
   * Release an object back to the pool for reuse
   * @param {any} obj 
   * @returns {boolean} True if successfully returned to pool
   */
  release(obj) {
    if (!obj || !this.active.has(obj)) {
      return false;
    }

    this.active.delete(obj);

    if (obj && typeof obj === 'object' && 'active' in obj) {
      obj.active = false;
    }

    if (this.resetFn) {
      this.resetFn(obj);
    }

    this.pool.push(obj);
    return true;
  }

  /**
   * Release all currently active objects back to the pool
   */
  releaseAll() {
    for (const obj of this.active) {
      if (obj && typeof obj === 'object' && 'active' in obj) {
        obj.active = false;
      }
      if (this.resetFn) {
        this.resetFn(obj);
      }
      this.pool.push(obj);
    }
    this.active.clear();
  }

  /**
   * Number of available inactive objects in the pool
   */
  get available() {
    return this.pool.length;
  }

  /**
   * Number of objects currently in use
   */
  get inUse() {
    return this.active.size;
  }

  /**
   * Total objects currently tracked (inUse + available)
   */
  get size() {
    return this.pool.length + this.active.size;
  }

  /**
   * Clean up and dispose all objects if they have a dispose method
   */
  clear() {
    const allObjects = [...this.pool, ...this.active];
    for (const obj of allObjects) {
      if (obj && typeof obj.dispose === 'function') {
        obj.dispose();
      }
    }
    this.pool.length = 0;
    this.active.clear();
    this.totalCreated = 0;
  }
}

/**
 * Global pool manager to manage multiple named pools
 */
export class PoolManager {
  static pools = new Map();

  /**
   * Get or create a named pool
   * @param {string} name 
   * @param {Function} factory 
   * @param {Function|null} resetFn 
   * @param {number} initialSize 
   * @returns {ObjectPool}
   */
  static getPool(name, factory, resetFn = null, initialSize = 0) {
    if (!this.pools.has(name)) {
      if (!factory) {
        throw new Error(`[PoolManager] Pool "${name}" does not exist and no factory was provided`);
      }
      this.pools.set(name, new ObjectPool(factory, resetFn, initialSize));
    }
    return this.pools.get(name);
  }

  /**
   * Clear all registered pools
   */
  static clearAll() {
    for (const pool of this.pools.values()) {
      pool.clear();
    }
    this.pools.clear();
  }
}
