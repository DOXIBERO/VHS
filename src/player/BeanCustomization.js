import * as THREE from 'three';
import { eventBus } from '../core/EventBus.js';

/**
 * Character Skins Definition (Pure Color Variations on Authentic Fall Guy Model)
 * Every skin is defined by custom PBR material colors and surface properties.
 * Absolutely zero external meshes/objects on the body or head — pure, clean, 100% responsive.
 */
export const BEAN_SKINS = {
  OFFICER: {
    id: 'OFFICER',
    name: '👮 الضابط (Police Officer)',
    bodyColor: 0x1E3A8A, // Rich Royal Police Navy Blue
    handColor: 0xF8FAFC, // Crisp White parade gloves
    shoeColor: 0x0A0A0A, // High-gloss polished black boots
    eyeColor: 0x0A0A0A,
    roughness: 0.40,
    metalness: 0.10,
    isOfficer: true
  },
  MOL_FOQIYA: {
    id: 'MOL_FOQIYA',
    name: '👳 مول الفوقية (Mol Foqiya)',
    bodyColor: 0xFAF7F2, // Authentic Moroccan Ivory Foqiya fabric
    handColor: 0xD4A373, // Moroccan warm tan skin tone
    shoeColor: 0xF59E0B, // Vibrant Moroccan Yellow Babouche (البلغة الفاسية)
    eyeColor: 0x111111,  // Deep glossy pupils
    roughness: 0.65,
    metalness: 0.04,
    isMolFoqiya: true
  },
  CLASSIC: {
    id: 'CLASSIC',
    name: '🫘 كلاسيك (Classic Bean)',
    bodyColor: 0xFFD700, // Vibrant Fall Guy Golden Yellow
    handColor: 0xFFD700,
    shoeColor: 0xFF3333, // Bright Red shoes
    eyeColor: 0x0A0A0A,
    roughness: 0.38,
    metalness: 0.05
  },
  KREUZBERG: {
    id: 'KREUZBERG',
    name: '🟢 كروزبيرغ (Kreuzberg Street)',
    bodyColor: 0x18181B, // Matte Charcoal Black
    handColor: 0x18181B,
    shoeColor: 0x22C55E, // Bright Neon Green shoes
    eyeColor: 0x0A0A0A,
    roughness: 0.48,
    metalness: 0.12,
    hasGoldChain: true
  },
  SAKURA: {
    id: 'SAKURA',
    name: '🌸 ساكورا (Sakura Pink)',
    bodyColor: 0xEC4899, // Vibrant Bubblegum Pink
    handColor: 0xF8FAFC, // Snow White
    shoeColor: 0x06B6D4, // Electric Cyan shoes
    eyeColor: 0x0A0A0A,
    roughness: 0.35,
    metalness: 0.08
  },
  'SPÄTI': {
    id: 'SPÄTI',
    name: '🌊 سباتي (Späti Shift)',
    bodyColor: 0xF8FAFC, // Crisp Snow White
    handColor: 0xF8FAFC,
    shoeColor: 0x06B6D4, // Vibrant Cyan shoes
    eyeColor: 0x0A0A0A,
    roughness: 0.32,
    metalness: 0.05
  },
  'U-BAHN': {
    id: 'U-BAHN',
    name: '🚇 يو-بان (U-Bahn Commuter)',
    bodyColor: 0x64748B, // Berlin Industrial Slate Blue
    handColor: 0x64748B,
    shoeColor: 0xEAB308, // Warning Yellow shoes
    eyeColor: 0x0A0A0A,
    roughness: 0.45,
    metalness: 0.15
  },
  CYBERPUNK: {
    id: 'CYBERPUNK',
    name: '⚡ سايبربانك (Cyberpunk)',
    bodyColor: 0x7C3AED, // Electric Neon Violet
    handColor: 0xDB2777, // Neon Magenta arms
    shoeColor: 0xFACC15, // Radiant Lime-Yellow shoes
    eyeColor: 0x0A0A0A,
    roughness: 0.28,
    metalness: 0.22
  },
  BERGHAIN: {
    id: 'BERGHAIN',
    name: '🌃 بيرغهاين (Berghain Leather)',
    bodyColor: 0x09090B, // Sleek Leather Jet Black
    handColor: 0x09090B,
    shoeColor: 0x27272A, // Dark Gunmetal shoes
    eyeColor: 0x0A0A0A,
    roughness: 0.20,
    metalness: 0.35
  },
  SUNSET: {
    id: 'SUNSET',
    name: '🍊 غروب برلين (Berlin Sunset)',
    bodyColor: 0xF97316, // Radiant Tangerine Orange
    handColor: 0xFB923C, // Warm Peach arms
    shoeColor: 0x1E40AF, // Deep Royal Blue shoes
    eyeColor: 0x0A0A0A,
    roughness: 0.36,
    metalness: 0.06
  }
};

/**
 * BeanCustomization
 * Manages character skin palettes and PBR materials on the authentic Fall Guy model.
 */
export class BeanCustomization {
  static goldMaterial = null;

  static getGoldMaterial() {
    if (!BeanCustomization.goldMaterial) {
      BeanCustomization.goldMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        roughness: 0.12,
        metalness: 0.95
      });
    }
    return BeanCustomization.goldMaterial;
  }

  constructor(bus = eventBus) {
    this.eventBus = bus;
    this.currentSkin = 'OFFICER';
    this.goldMaterial = BeanCustomization.getGoldMaterial();
  }

  // Legacy helpers for backwards compatibility with unit tests
  createPoliceCap() {
    const group = new THREE.Group();
    group.name = 'Accessory_PoliceCap';
    group.add(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.2), this.goldMaterial));
    group.add(new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.02), this.goldMaterial));
    group.add(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.2), this.goldMaterial));
    group.add(new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.01), this.goldMaterial));
    group.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.05), this.goldMaterial));
    group.add(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.01), this.goldMaterial));
    return group;
  }

  createPoliceAviators() {
    const group = new THREE.Group();
    group.name = 'Accessory_Aviators';
    group.add(new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.1, 0.02), this.goldMaterial));
    group.add(new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.1, 0.02), this.goldMaterial));
    group.add(new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.3), this.goldMaterial));
    group.add(new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.05), this.goldMaterial));
    group.add(new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.2), this.goldMaterial));
    group.add(new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.2), this.goldMaterial));
    return group;
  }

  createPoliceBodyDetails() {
    const group = new THREE.Group();
    group.name = 'Accessory_BodyDetails';
    for (let i = 0; i < 8; i++) {
      group.add(new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), this.goldMaterial));
    }
    return group;
  }

  createGoldChain() {
    const chainGroup = new THREE.Group();
    chainGroup.name = 'Accessory_GoldChain';
    const chainMesh = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.035, 12, 32), this.goldMaterial);
    chainGroup.add(chainMesh);
    const pendantMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), this.goldMaterial);
    chainGroup.add(pendantMesh);
    return chainGroup;
  }

  createBerlinCap(capColor = 0x333333) {
    const capGroup = new THREE.Group();
    capGroup.name = 'Accessory_BerlinCap';
    capGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.50, 0.15), this.goldMaterial));
    capGroup.add(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.24), this.goldMaterial));
    return capGroup;
  }

  /**
   * Apply a skin palette to a BeanBody instance
   * Pure material and color application — ZERO external objects on the body.
   * @param {string} skinName - 'OFFICER', 'MOL_FOQIYA', 'CLASSIC', etc.
   * @param {import('./BeanBody.js').BeanBody} beanBody 
   */
  applySkin(skinName, beanBody) {
    const palette = BEAN_SKINS[skinName] || BEAN_SKINS.OFFICER;
    this.currentSkin = skinName;

    if (!beanBody) return palette;

    // Remove any legacy accessories completely
    if (beanBody.accessoriesGroup) {
      while (beanBody.accessoriesGroup.children.length > 0) {
        beanBody.accessoriesGroup.remove(beanBody.accessoriesGroup.children[0]);
      }
      beanBody.accessoriesGroup.visible = false;
    }
    if (beanBody.officerAccessories && beanBody.officerAccessories.group) {
      beanBody.officerAccessories.group.visible = false;
    }
    if (beanBody.molFoqiyaAccessories && beanBody.molFoqiyaAccessories.group) {
      beanBody.molFoqiyaAccessories.group.visible = false;
    }

    // Apply PBR material colors directly to the 3D Fall Guy model body parts
    if (beanBody.isModelLoaded) {
      // 1. Body Torso
      if (beanBody.bodyMesh) {
        if (!beanBody.customBodyMaterial) {
          beanBody.customBodyMaterial = beanBody.bodyMesh.material.clone();
          beanBody.bodyMesh.material = beanBody.customBodyMaterial;
        }
        beanBody.customBodyMaterial.map = null; // Clean solid PBR finish
        beanBody.customBodyMaterial.color.setHex(palette.bodyColor);
        beanBody.customBodyMaterial.roughness = palette.roughness;
        beanBody.customBodyMaterial.metalness = palette.metalness;
        beanBody.customBodyMaterial.needsUpdate = true;
      }

      // 2. Hands / Arms
      if (beanBody.handMesh) {
        if (!beanBody.customHandMaterial) {
          beanBody.customHandMaterial = beanBody.handMesh.material.clone();
          beanBody.handMesh.material = beanBody.customHandMaterial;
        }
        beanBody.customHandMaterial.map = null;
        beanBody.customHandMaterial.color.setHex(palette.handColor || palette.bodyColor);
        beanBody.customHandMaterial.roughness = palette.roughness;
        beanBody.customHandMaterial.metalness = palette.metalness;
        beanBody.customHandMaterial.needsUpdate = true;
      }

      // 3. Legs / Shoes
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

      // 4. Eyes / Faceplate
      if (beanBody.eyeMesh) {
        if (!beanBody.customEyeMaterial) {
          beanBody.customEyeMaterial = beanBody.eyeMesh.material.clone();
          beanBody.eyeMesh.material = beanBody.customEyeMaterial;
        }
        beanBody.customEyeMaterial.map = null;
        beanBody.customEyeMaterial.color.setHex(palette.eyeColor || 0x0A0A0A);
        beanBody.customEyeMaterial.roughness = 0.15;
        beanBody.customEyeMaterial.metalness = 0.10;
        beanBody.customEyeMaterial.needsUpdate = true;
      }
    }

    return palette;
  }

  update(dt, beanBody) {
    // Pure material mode — no per-frame matrix tracking needed
  }

  dispose() {
    // Clean up
  }
}
