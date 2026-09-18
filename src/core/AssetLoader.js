import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { eventBus } from './EventBus.js';
import { logger } from './ConsoleLogger.js';

/**
 * AssetLoader (Parts 0151-0180 | PHASE 1: ENGINE)
 * Centralized loading manager based on THREE.LoadingManager.
 * Handles textures, GLTF models, and audio buffers with caching,
 * progress tracking (0-100%), error handling without crashes,
 * and EventBus integration.
 */
export class AssetLoader {
  /**
   * @param {import('./EventBus.js').EventBus} bus 
   */
  constructor(bus = eventBus) {
    this.eventBus = bus;
    this.cache = new Map();

    // 1. THREE.LoadingManager setup
    this.manager = new THREE.LoadingManager();

    this.manager.onStart = (url, itemsLoaded, itemsTotal) => {
      const percent = itemsTotal > 0 ? Math.round((itemsLoaded / itemsTotal) * 100) : 0;
      this.eventBus.emit('loading:progress', {
        url,
        loaded: itemsLoaded,
        total: itemsTotal,
        percent
      });
    };

    this.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const percent = itemsTotal > 0 ? Math.round((itemsLoaded / itemsTotal) * 100) : 0;
      this.eventBus.emit('loading:progress', {
        url,
        loaded: itemsLoaded,
        total: itemsTotal,
        percent
      });
    };

    this.manager.onLoad = () => {
      this.eventBus.emit('loading:progress', {
        url: 'all',
        loaded: 1,
        total: 1,
        percent: 100
      });
      this.eventBus.emit('loading:complete', { success: true });
    };

    this.manager.onError = (url) => {
      // Failed asset loads log error but never crash the engine (Part 0151-0180 Acceptance Criteria)
      logger.error(`[AssetLoader] Failed to load asset: ${url}`);
      this.eventBus.emit('loading:error', {
        url,
        message: `Failed to load ${url}`
      });
    };

    // 2. Specific Loaders
    this.textureLoader = new THREE.TextureLoader(this.manager);
    this.audioLoader = new THREE.AudioLoader(this.manager);
    this.gltfLoader = new GLTFLoader(this.manager);

    // 3. Bind UI overlay if DOM elements exist
    this.setupUIBindings();
  }

  /**
   * Automatically bind to the loading screen HTML overlay if available
   */
  setupUIBindings() {
    if (typeof document === 'undefined') return;

    const overlay = document.getElementById('loading-screen');
    const barFill = document.getElementById('loading-bar-fill');
    const textLabel = document.getElementById('loading-text');

    if (!overlay) return;

    this.eventBus.on('loading:progress', ({ percent }) => {
      if (barFill) barFill.style.width = `${percent}%`;
      if (textLabel) textLabel.textContent = `Loading... ${percent}%`;
    });

    this.eventBus.on('loading:complete', () => {
      if (barFill) barFill.style.width = '100%';
      if (textLabel) textLabel.textContent = 'Bereit! (100%)';
      setTimeout(() => {
        overlay.classList.add('loading-hidden');
      }, 350);
    });

    this.eventBus.on('loading:error', ({ url }) => {
      if (textLabel) {
        textLabel.textContent = `Warning: ${url.split('/').pop()} skipped`;
      }
    });
  }

  /**
   * Load a Texture with caching
   * @param {string} url 
   * @returns {Promise<THREE.Texture>}
   */
  loadTexture(url) {
    if (this.cache.has(url)) {
      return Promise.resolve(this.cache.get(url));
    }
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          this.cache.set(url, texture);
          resolve(texture);
        },
        undefined,
        (err) => {
          // Resolve null or reject gracefully without throwing fatal error
          resolve(null);
        }
      );
    });
  }

  /**
   * Load an Audio buffer with caching
   * @param {string} url 
   * @returns {Promise<AudioBuffer>}
   */
  loadAudio(url) {
    if (this.cache.has(url)) {
      return Promise.resolve(this.cache.get(url));
    }
    return new Promise((resolve, reject) => {
      this.audioLoader.load(
        url,
        (buffer) => {
          this.cache.set(url, buffer);
          resolve(buffer);
        },
        undefined,
        (err) => {
          resolve(null);
        }
      );
    });
  }

  /**
   * Load a GLTF / GLB model with caching
   * @param {string} url 
   * @returns {Promise<Object>}
   */
  loadGLTF(url) {
    if (this.cache.has(url)) {
      return Promise.resolve(this.cache.get(url));
    }
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          this.cache.set(url, gltf);
          resolve(gltf);
        },
        undefined,
        (err) => {
          resolve(null);
        }
      );
    });
  }

  /**
   * Get cached asset by URL
   * @param {string} url 
   */
  get(url) {
    return this.cache.get(url) || null;
  }

  /**
   * Check if asset is cached
   * @param {string} url 
   */
  has(url) {
    return this.cache.has(url);
  }

  /**
   * Clear all cached assets and dispose textures
   */
  clearCache() {
    for (const [_, asset] of this.cache.entries()) {
      if (asset && typeof asset.dispose === 'function') {
        asset.dispose();
      }
    }
    this.cache.clear();
  }
}
