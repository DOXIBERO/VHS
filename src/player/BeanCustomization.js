import * as THREE from 'three';
import { eventBus } from '../core/EventBus.js';

/**
 * Skin Palettes Definition (Parts 0211-0220 | PHASE 2: PLAYER MODEL)
 * 5 iconic, distinct character skins tailored for Berlin & Fall Guys aesthetics.
 */
export const BEAN_SKINS = {
  CLASSIC: {
    id: 'CLASSIC',
    name: 'Classic Fall Bean',
    bodyColor: 0xFFD700, // Vibrant Golden Yellow
    shoeColor: 0xFF3333, // Bright Red
    roughness: 0.4,
    metalness: 0.05,
    hasGoldChain: false,
    hasCap: true,
    capColor: 0x333333
  },
  KREUZBERG: {
    id: 'KREUZBERG',
    name: 'Kreuzberg Street Style',
    bodyColor: 0x18181B, // Jet Obsidian Black
    shoeColor: 0x22C55E, // Neon Acid Green
    roughness: 0.5,
    metalness: 0.1,
    hasGoldChain: true,   // Parts 0221-0230: Shiny gold chain with pendant
    hasCap: true,
    capColor: 0x111111
  },
  'SPÄTI': {
    id: 'SPÄTI',
    name: 'Späti Shift',
    bodyColor: 0xF8FAFC, // Clean Pure White
    shoeColor: 0x06B6D4, // Electric Cyan Blue
    roughness: 0.35,
    metalness: 0.05,
    hasGoldChain: false,
    hasCap: false,
    capColor: 0x0284C7
  },
  'U-BAHN': {
    id: 'U-BAHN',
    name: 'U-Bahn Commuter',
    bodyColor: 0x64748B, // Subway Slate Gray
    shoeColor: 0xEAB308, // BVG Subway Yellow
    roughness: 0.45,
    metalness: 0.15,
    hasGoldChain: false,
    hasCap: true,
    capColor: 0xEAB308
  },
  BERGHAIN: {
    id: 'BERGHAIN',
    name: 'Berghain Leather',
    bodyColor: 0x09090B, // Deep Techno Black
    shoeColor: 0x27272A, // Industrial Dark Slate
    roughness: 0.22,     // Sleek leather sheen
    metalness: 0.35,
    hasGoldChain: false,
    hasCap: false,
    capColor: 0x000000
  }
};

/**
 * BeanCustomization (Parts 0211-0230)
 * Manages material swapping, color palettes, and 3D accessories (Gold chain, Berlin flat cap).
 */
export class BeanCustomization {
  // Static shared geometries to minimize allocations during pooling/prewarming
  static sharedTorusGeo = null;
  static sharedPendantGeo = null;
  static sharedDomeGeo = null;
  static sharedBrimGeo = null;
  static sharedGoldMat = null;

  static getTorusGeo() {
    if (!BeanCustomization.sharedTorusGeo) {
      BeanCustomization.sharedTorusGeo = new THREE.TorusGeometry(0.42, 0.035, 12, 32);
    }
    return BeanCustomization.sharedTorusGeo;
  }

  static getPendantGeo() {
    if (!BeanCustomization.sharedPendantGeo) {
      BeanCustomization.sharedPendantGeo = new THREE.OctahedronGeometry(0.09, 0);
    }
    return BeanCustomization.sharedPendantGeo;
  }

  static getDomeGeo() {
    if (!BeanCustomization.sharedDomeGeo) {
      BeanCustomization.sharedDomeGeo = new THREE.CylinderGeometry(0.32, 0.40, 0.12, 16);
    }
    return BeanCustomization.sharedDomeGeo;
  }

  static getBrimGeo() {
    if (!BeanCustomization.sharedBrimGeo) {
      BeanCustomization.sharedBrimGeo = new THREE.BoxGeometry(0.36, 0.03, 0.20);
    }
    return BeanCustomization.sharedBrimGeo;
  }

  static getGoldMaterial() {
    if (!BeanCustomization.sharedGoldMat) {
      BeanCustomization.sharedGoldMat = new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        metalness: 0.95,
        roughness: 0.12,
      });
    }
    return BeanCustomization.sharedGoldMat;
  }

  constructor(bus = eventBus) {
    this.eventBus = bus;
    this.currentSkin = 'CLASSIC';
    this.goldMaterial = BeanCustomization.getGoldMaterial();
  }

  /**
   * Create the 3D Gold Chain with Octahedron pendant (Parts 0221-0230)
   * @returns {THREE.Group}
   */
  createGoldChain() {
    const chainGroup = new THREE.Group();
    chainGroup.name = 'Accessory_GoldChain';

    // 1. Torus Chain around neck/upper chest (radius 0.42, tube 0.035)
    const chainMesh = new THREE.Mesh(BeanCustomization.getTorusGeo(), this.goldMaterial);
    chainMesh.rotation.x = Math.PI / 2.3; // Angled down over chest
    chainMesh.castShadow = true;
    chainGroup.add(chainMesh);

    // 2. Octahedron Pendant hanging in front (radius 0.09)
    const pendantMesh = new THREE.Mesh(BeanCustomization.getPendantGeo(), this.goldMaterial);
    pendantMesh.position.set(0, -0.22, 0.42);
    pendantMesh.castShadow = true;
    chainGroup.add(pendantMesh);

    return chainGroup;
  }

  /**
   * Create Berlin Flat Cap (Mütze) accessory
   * @param {number} capColor 
   * @returns {THREE.Group}
   */
  createBerlinCap(capColor = 0x333333) {
    const capGroup = new THREE.Group();
    capGroup.name = 'Accessory_BerlinCap';

    const capMat = new THREE.MeshStandardMaterial({
      color: capColor,
      roughness: 0.75,
      metalness: 0.1
    });

    // Cap Dome
    const domeMesh = new THREE.Mesh(BeanCustomization.getDomeGeo(), capMat);
    domeMesh.position.set(0, 0.82, 0.06);
    domeMesh.rotation.x = -0.15; // Tilted forward
    domeMesh.castShadow = true;
    capGroup.add(domeMesh);

    // Cap Brim
    const brimMesh = new THREE.Mesh(BeanCustomization.getBrimGeo(), capMat);
    brimMesh.position.set(0, 0.77, 0.26);
    brimMesh.rotation.x = -0.20;
    brimMesh.castShadow = true;
    capGroup.add(brimMesh);

    capGroup.userData = { material: capMat };
    return capGroup;
  }

  /**
   * Apply a skin palette to a BeanBody instance
   * @param {string} skinName - 'CLASSIC', 'KREUZBERG', 'SPÄTI', 'U-BAHN', 'BERGHAIN'
   * @param {import('./BeanBody.js').BeanBody} beanBody 
   */
  applySkin(skinName, beanBody) {
    const palette = BEAN_SKINS[skinName];
    if (!palette) {
      console.warn(`[BeanCustomization] Unknown skin: ${skinName}, defaulting to CLASSIC`);
      return this.applySkin('CLASSIC', beanBody);
    }

    this.currentSkin = skinName;

    if (!beanBody) return;

    // Attach or update accessory groups on beanBody
    if (!beanBody.accessoriesGroup) {
      beanBody.accessoriesGroup = new THREE.Group();
      beanBody.accessoriesGroup.name = 'BeanAccessories';
      beanBody.mesh.add(beanBody.accessoriesGroup);
    }

    // 1. Manage Gold Chain (Kreuzberg exclusive, Parts 0221-0230)
    if (!beanBody.goldChain) {
      beanBody.goldChain = this.createGoldChain();
      beanBody.goldChain.position.set(0, 0.22, 0.05);
      beanBody.accessoriesGroup.add(beanBody.goldChain);
    }
    beanBody.goldChain.visible = !!palette.hasGoldChain;

    // 2. Manage Berlin Flat Cap
    if (!beanBody.berlinCap) {
      beanBody.berlinCap = this.createBerlinCap(palette.capColor);
      beanBody.accessoriesGroup.add(beanBody.berlinCap);
    }
    beanBody.berlinCap.visible = !!palette.hasCap;
    if (beanBody.berlinCap.userData?.material) {
      beanBody.berlinCap.userData.material.color.setHex(palette.capColor);
    }

    // 3. Apply color palette to 3D Fall Guy model body parts
    if (beanBody.isModelLoaded) {
      // Body Torso
      if (beanBody.bodyMesh) {
        if (!beanBody.customBodyMaterial) {
          beanBody.customBodyMaterial = beanBody.bodyMesh.material.clone();
          beanBody.bodyMesh.material = beanBody.customBodyMaterial;
        }
        beanBody.customBodyMaterial.map = null; // Clean solid PBR color
        beanBody.customBodyMaterial.color.setHex(palette.bodyColor);
        beanBody.customBodyMaterial.roughness = palette.roughness;
        beanBody.customBodyMaterial.metalness = palette.metalness;
        beanBody.customBodyMaterial.needsUpdate = true;
      }

      // Hands / Arms
      if (beanBody.handMesh) {
        if (!beanBody.customHandMaterial) {
          beanBody.customHandMaterial = beanBody.handMesh.material.clone();
          beanBody.handMesh.material = beanBody.customHandMaterial;
        }
        beanBody.customHandMaterial.map = null;
        beanBody.customHandMaterial.color.setHex(palette.bodyColor);
        beanBody.customHandMaterial.roughness = palette.roughness;
        beanBody.customHandMaterial.metalness = palette.metalness;
        beanBody.customHandMaterial.needsUpdate = true;
      }

      // Legs / Shoes
      if (beanBody.legMesh) {
        if (!beanBody.customLegMaterial) {
          beanBody.customLegMaterial = beanBody.legMesh.material.clone();
          beanBody.legMesh.material = beanBody.customLegMaterial;
        }
        beanBody.customLegMaterial.map = null;
        beanBody.customLegMaterial.color.setHex(palette.shoeColor || palette.bodyColor);
        beanBody.customLegMaterial.roughness = palette.roughness;
        beanBody.customLegMaterial.metalness = palette.metalness;
        beanBody.customLegMaterial.needsUpdate = true;
      }
    } else {
      // Store pending skin if GLB is still downloading
      beanBody.pendingSkin = skinName;
    }

    // Emit event across game systems
    this.eventBus.emit('player:skinChanged', {
      skinName,
      palette,
      beanId: beanBody.id
    });

    return palette;
  }

  dispose() {
    if (this.goldMaterial) {
      this.goldMaterial.dispose();
    }
  }
}

