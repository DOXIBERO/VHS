import * as THREE from 'three';
import { eventBus } from '../core/EventBus.js';

/**
 * Character Skins Definition
 * Skin 1: Police Officer (ضابط الشرطة) - Fully featured high-detail 3D skin
 * with peaked cap, aviator sunglasses, chest badge, tie, epaulets, walkie-talkie,
 * duty belt, white parade gloves, and polished black boots.
 */
export const BEAN_SKINS = {
  OFFICER: {
    id: 'OFFICER',
    name: 'ضابط الشرطة (Police Officer)',
    bodyColor: 0x1E3A8A, // Rich Royal Police Navy Blue
    handColor: 0xF8FAFC, // Crisp White parade/traffic gloves
    shoeColor: 0x0A0A0A, // High-gloss polished black boots
    roughness: 0.45,
    metalness: 0.08,
    isOfficer: true
  },
  MOL_FOQIYA: {
    id: 'MOL_FOQIYA',
    name: 'مول الفوقية المتدين (Mol Foqiya)',
    bodyColor: 0xFAF7F2, // Authentic Moroccan Ivory Foqiya fabric
    handColor: 0xD4A373, // Moroccan light tan skin tone
    shoeColor: 0xF59E0B, // Vibrant Moroccan Yellow Babouche (البلغة الفاسية الصفراء)
    roughness: 0.72,     // Natural woven fabric texture
    metalness: 0.04,
    isMolFoqiya: true,
    isOfficer: false
  },
  CLASSIC: {
    id: 'CLASSIC',
    name: 'Classic Fall Bean',
    bodyColor: 0xFFD700, // Vibrant Golden Yellow
    handColor: 0xFFD700,
    shoeColor: 0xFF3333, // Bright Red
    roughness: 0.40,
    metalness: 0.05,
    hasGoldChain: false,
    hasCap: true,
    capColor: 0x333333,
    isOfficer: false
  },
  KREUZBERG: {
    id: 'KREUZBERG',
    name: 'Kreuzberg Street Style',
    bodyColor: 0x18181B,
    handColor: 0x18181B,
    shoeColor: 0x22C55E,
    roughness: 0.50,
    metalness: 0.10,
    hasGoldChain: true,
    hasCap: true,
    capColor: 0x111111,
    isOfficer: false
  },
  'SPÄTI': {
    id: 'SPÄTI',
    name: 'Späti Shift',
    bodyColor: 0xF8FAFC,
    handColor: 0xF8FAFC,
    shoeColor: 0x06B6D4,
    roughness: 0.35,
    metalness: 0.05,
    hasGoldChain: false,
    hasCap: false,
    capColor: 0x0284C7,
    isOfficer: false
  },
  'U-BAHN': {
    id: 'U-BAHN',
    name: 'U-Bahn Commuter',
    bodyColor: 0x64748B,
    handColor: 0x64748B,
    shoeColor: 0xEAB308,
    roughness: 0.45,
    metalness: 0.15,
    hasGoldChain: false,
    hasCap: true,
    capColor: 0xEAB308,
    isOfficer: false
  },
  BERGHAIN: {
    id: 'BERGHAIN',
    name: 'Berghain Leather',
    bodyColor: 0x09090B,
    handColor: 0x09090B,
    shoeColor: 0x27272A,
    roughness: 0.22,
    metalness: 0.35,
    hasGoldChain: false,
    hasCap: false,
    capColor: 0x000000,
    isOfficer: false
  }
};

/**
 * BeanCustomization
 * Manages character skins, high-detail accessories, and skeletal breathing synchronization.
 */
export class BeanCustomization {
  // Shared Materials for Officer Skin
  static goldMaterial = null;
  static blackGlossMaterial = null;
  static navyMaterial = null;
  static sunglassesMaterial = null;
  static silverMaterial = null;

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

  static getBlackGlossMaterial() {
    if (!BeanCustomization.blackGlossMaterial) {
      BeanCustomization.blackGlossMaterial = new THREE.MeshStandardMaterial({
        color: 0x0A0A0A,
        roughness: 0.10,
        metalness: 0.85
      });
    }
    return BeanCustomization.blackGlossMaterial;
  }

  static getNavyMaterial() {
    if (!BeanCustomization.navyMaterial) {
      BeanCustomization.navyMaterial = new THREE.MeshStandardMaterial({
        color: 0x1A2B4C,
        roughness: 0.55,
        metalness: 0.08
      });
    }
    return BeanCustomization.navyMaterial;
  }

  static getSunglassesMaterial() {
    if (!BeanCustomization.sunglassesMaterial) {
      BeanCustomization.sunglassesMaterial = new THREE.MeshStandardMaterial({
        color: 0x050505,
        roughness: 0.04,
        metalness: 0.98
      });
    }
    return BeanCustomization.sunglassesMaterial;
  }

  static getSilverMaterial() {
    if (!BeanCustomization.silverMaterial) {
      BeanCustomization.silverMaterial = new THREE.MeshStandardMaterial({
        color: 0xE2E8F0,
        roughness: 0.12,
        metalness: 0.95
      });
    }
    return BeanCustomization.silverMaterial;
  }

  static getWhiteShirtMaterial() {
    if (!BeanCustomization.whiteShirtMaterial) {
      BeanCustomization.whiteShirtMaterial = new THREE.MeshStandardMaterial({
        color: 0xF8FAFC,
        roughness: 0.60,
        metalness: 0.05
      });
    }
    return BeanCustomization.whiteShirtMaterial;
  }

  constructor(bus = eventBus) {
    this.eventBus = bus;
    this.currentSkin = 'OFFICER';
    this.goldMaterial = BeanCustomization.getGoldMaterial();
    this._vPos = new THREE.Vector3();
    this._qRot = new THREE.Quaternion();
    this._eRot = new THREE.Euler();
  }

  /** Legacy helper for backward compatibility */
  createGoldChain() {
    const chainGroup = new THREE.Group();
    chainGroup.name = 'Accessory_GoldChain';
    const chainMesh = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.035, 12, 32), this.goldMaterial);
    chainMesh.rotation.x = Math.PI / 2.3;
    chainGroup.add(chainMesh);
    const pendantMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), this.goldMaterial);
    pendantMesh.position.set(0, -0.22, 0.42);
    chainGroup.add(pendantMesh);
    return chainGroup;
  }

  /** Legacy helper for backward compatibility */
  createBerlinCap(capColor = 0x333333) {
    const capGroup = new THREE.Group();
    capGroup.name = 'Accessory_BerlinCap';
    const capMat = new THREE.MeshStandardMaterial({ color: capColor, roughness: 0.75, metalness: 0.1 });
    const domeMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.40, 0.12, 16), capMat);
    domeMesh.position.set(0, 0.82, 0.06);
    capGroup.add(domeMesh);
    const brimMesh = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.03, 0.20), capMat);
    brimMesh.position.set(0, 0.77, 0.26);
    capGroup.add(brimMesh);
    return capGroup;
  }

  /**
   * Create Police Officer Peaked Cap (كاسكيطة الضابط)
   * Calibrated for authentic Fall Guy head: sits snugly on cranium,
   * black patent visor projects forward over forehead shading eyes.
   * @returns {THREE.Group}
   */
  createPoliceCap() {
    const cap = new THREE.Group();
    cap.name = 'Accessory_PoliceCap';

    const goldMat = BeanCustomization.getGoldMaterial();
    const blackGlossMat = BeanCustomization.getBlackGlossMaterial();
    const navyMat = BeanCustomization.getNavyMaterial();

    // 1. Navy Flared Crown (Seated cleanly wrapping cranium)
    const crownGeo = new THREE.CylinderGeometry(0.42, 0.36, 0.16, 24);
    const crown = new THREE.Mesh(crownGeo, navyMat);
    crown.position.set(0, 0.88, 0.02);
    crown.rotation.x = 0.04;
    crown.castShadow = true;
    cap.add(crown);

    // 2. Gold Piping around top crown rim
    const pipingGeo = new THREE.TorusGeometry(0.42, 0.014, 10, 24);
    const piping = new THREE.Mesh(pipingGeo, goldMat);
    piping.position.set(0, 0.96, 0.02);
    piping.rotation.x = Math.PI / 2 + 0.04;
    cap.add(piping);

    // 3. Black Patent Curved Visor (Visière - projecting cleanly forward)
    const visorGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.024, 24, 1, false, -Math.PI / 2, Math.PI);
    const visor = new THREE.Mesh(visorGeo, blackGlossMat);
    visor.position.set(0, 0.81, 0.14);
    visor.rotation.x = 0.24;
    visor.scale.set(1.02, 1, 0.95);
    visor.castShadow = true;
    cap.add(visor);

    // 4. Gold Chin Strap Cord
    const cordGeo = new THREE.TorusGeometry(0.37, 0.015, 8, 24, Math.PI);
    const cord = new THREE.Mesh(cordGeo, goldMat);
    cord.position.set(0, 0.82, 0.22);
    cord.rotation.x = Math.PI / 2 + 0.12;
    cord.rotation.z = Math.PI;
    cap.add(cord);

    // 5. Golden Police Star Crest Plate & Star
    const badgePlateGeo = new THREE.CylinderGeometry(0.068, 0.068, 0.014, 16);
    const badgePlate = new THREE.Mesh(badgePlateGeo, goldMat);
    badgePlate.position.set(0, 0.89, 0.37);
    badgePlate.rotation.x = Math.PI / 2 + 0.04;
    cap.add(badgePlate);

    const starGeo = new THREE.OctahedronGeometry(0.044, 0);
    const star = new THREE.Mesh(starGeo, goldMat);
    star.position.set(0, 0.89, 0.39);
    star.rotation.z = Math.PI / 5;
    cap.add(star);

    return cap;
  }

  /**
   * Create Police Aviator Sunglasses (نظارات البوليسي كحلة)
   * Contoured to cylindrical bean face with wraparound gold temple arms.
   * @returns {THREE.Group}
   */
  createPoliceAviators() {
    const aviators = new THREE.Group();
    aviators.name = 'Accessory_Aviators';

    const goldMat = BeanCustomization.getGoldMaterial();
    const sunglassesMat = BeanCustomization.getSunglassesMaterial();

    // 1. Left Lens - Angled to hug face and cover left eye
    const lensGeo = new THREE.BoxGeometry(0.185, 0.17, 0.022);
    const lensL = new THREE.Mesh(lensGeo, sunglassesMat);
    lensL.position.set(-0.11, 0.605, 0.395);
    lensL.rotation.y = -0.20;
    lensL.rotation.x = 0.02;
    aviators.add(lensL);

    // 2. Right Lens - Angled to hug face and cover right eye
    const lensR = new THREE.Mesh(lensGeo, sunglassesMat);
    lensR.position.set(0.11, 0.605, 0.395);
    lensR.rotation.y = 0.20;
    lensR.rotation.x = 0.02;
    aviators.add(lensR);

    // 3. Gold Top Brow Bar
    const browBarGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.42, 8);
    const browBar = new THREE.Mesh(browBarGeo, goldMat);
    browBar.rotation.z = Math.PI / 2;
    browBar.position.set(0, 0.69, 0.395);
    aviators.add(browBar);

    // 4. Gold Nose Bridge
    const bridgeGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.06, 8);
    const bridge = new THREE.Mesh(bridgeGeo, goldMat);
    bridge.rotation.z = Math.PI / 2;
    bridge.position.set(0, 0.605, 0.405);
    aviators.add(bridge);

    // 5. Left Temple Arm (wraps seamlessly along head to ear)
    const templeGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.37, 8);
    const templeL = new THREE.Mesh(templeGeo, goldMat);
    templeL.position.set(-0.28, 0.65, 0.215);
    templeL.rotation.x = Math.PI / 2;
    templeL.rotation.y = -0.45;
    aviators.add(templeL);

    // 6. Right Temple Arm
    const templeR = new THREE.Mesh(templeGeo, goldMat);
    templeR.position.set(0.28, 0.65, 0.215);
    templeR.rotation.x = Math.PI / 2;
    templeR.rotation.y = 0.45;
    aviators.add(templeR);

    return aviators;
  }

  /**
   * Create Police Uniform Accessories & Equipment
   * Features: Crisp white shirt collar, black tie with gold clip, golden chest badge,
   * shoulder epaulets with gold stars, walkie-talkie with antenna, duty belt, buckle, baton.
   * @returns {THREE.Group}
   */
  createPoliceBodyDetails() {
    const bodyDetails = new THREE.Group();
    bodyDetails.name = 'Accessory_PoliceBodyDetails';

    const goldMat = BeanCustomization.getGoldMaterial();
    const blackGlossMat = BeanCustomization.getBlackGlossMaterial();
    const navyMat = BeanCustomization.getNavyMaterial();
    const silverMat = BeanCustomization.getSilverMaterial();
    const whiteShirtMat = BeanCustomization.getWhiteShirtMaterial();

    // 1. Crisp White Shirt Collar Flaps (Snug at neckline)
    const collarGeo = new THREE.BoxGeometry(0.12, 0.065, 0.02);
    const collarL = new THREE.Mesh(collarGeo, whiteShirtMat);
    collarL.position.set(-0.08, 0.43, 0.435);
    collarL.rotation.z = -0.40;
    collarL.rotation.y = -0.20;
    bodyDetails.add(collarL);

    const collarR = new THREE.Mesh(collarGeo, whiteShirtMat);
    collarR.position.set(0.08, 0.43, 0.435);
    collarR.rotation.z = 0.40;
    collarR.rotation.y = 0.20;
    bodyDetails.add(collarR);

    // 2. Black Police Tie with Top Knot
    const knotGeo = new THREE.BoxGeometry(0.085, 0.065, 0.03);
    const knot = new THREE.Mesh(knotGeo, blackGlossMat);
    knot.position.set(0, 0.41, 0.45);
    bodyDetails.add(knot);

    const tieGeo = new THREE.BoxGeometry(0.075, 0.32, 0.022);
    const tie = new THREE.Mesh(tieGeo, blackGlossMat);
    tie.position.set(0, 0.23, 0.465);
    tie.rotation.x = -0.09;
    bodyDetails.add(tie);

    // 3. Gold Tie Clip
    const clipGeo = new THREE.BoxGeometry(0.085, 0.015, 0.012);
    const clip = new THREE.Mesh(clipGeo, goldMat);
    clip.position.set(0, 0.26, 0.48);
    bodyDetails.add(clip);

    // 4. Police Star Shield Badge on Left Chest
    const chestBadgeGeo = new THREE.OctahedronGeometry(0.07, 0);
    const chestBadge = new THREE.Mesh(chestBadgeGeo, goldMat);
    chestBadge.position.set(-0.18, 0.30, 0.46);
    chestBadge.scale.set(1, 1.2, 0.35);
    chestBadge.castShadow = true;
    bodyDetails.add(chestBadge);

    // 5. Shoulder Epaulets with Golden Stars
    const epGeo = new THREE.BoxGeometry(0.14, 0.025, 0.20);
    const epStarGeo = new THREE.OctahedronGeometry(0.028, 0);

    const epL = new THREE.Mesh(epGeo, navyMat);
    epL.position.set(-0.37, 0.38, 0.04);
    epL.rotation.z = -0.32;
    bodyDetails.add(epL);

    const epStarL = new THREE.Mesh(epStarGeo, goldMat);
    epStarL.position.set(-0.39, 0.40, 0.04);
    bodyDetails.add(epStarL);

    const epR = new THREE.Mesh(epGeo, navyMat);
    epR.position.set(0.37, 0.38, 0.04);
    epR.rotation.z = 0.32;
    bodyDetails.add(epR);

    const epStarR = new THREE.Mesh(epStarGeo, goldMat);
    epStarR.position.set(0.39, 0.40, 0.04);
    bodyDetails.add(epStarR);

    // 6. Walkie-Talkie on Left Shoulder
    const radioGeo = new THREE.BoxGeometry(0.065, 0.12, 0.055);
    const radio = new THREE.Mesh(radioGeo, blackGlossMat);
    radio.position.set(-0.33, 0.44, 0.07);
    radio.rotation.z = -0.15;
    bodyDetails.add(radio);

    const antennaGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.11, 8);
    const antenna = new THREE.Mesh(antennaGeo, blackGlossMat);
    antenna.position.set(-0.34, 0.53, 0.07);
    bodyDetails.add(antenna);

    // 7. Police Duty Belt with Silver Buckle
    const beltGeo = new THREE.TorusGeometry(0.47, 0.035, 12, 32);
    const belt = new THREE.Mesh(beltGeo, blackGlossMat);
    belt.position.set(0, -0.06, 0.02);
    belt.rotation.x = Math.PI / 2;
    bodyDetails.add(belt);

    const buckleGeo = new THREE.BoxGeometry(0.10, 0.07, 0.025);
    const buckle = new THREE.Mesh(buckleGeo, silverMat);
    buckle.position.set(0, -0.06, 0.49);
    bodyDetails.add(buckle);

    // 8. Mini Police Baton on Right Hip
    const batonGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 8);
    const baton = new THREE.Mesh(batonGeo, blackGlossMat);
    baton.position.set(0.46, -0.10, 0.05);
    baton.rotation.z = 0.25;
    bodyDetails.add(baton);

    return bodyDetails;
  }

  /**
   * Apply a skin palette to a BeanBody instance
   * @param {string} skinName - 'OFFICER', 'CLASSIC', etc.
   * @param {import('./BeanBody.js').BeanBody} beanBody 
   */
  applySkin(skinName, beanBody) {
    const palette = BEAN_SKINS[skinName] || BEAN_SKINS.OFFICER;
    this.currentSkin = skinName;

    if (!beanBody) return palette;

    // Ensure accessories group on beanBody
    if (!beanBody.accessoriesGroup) {
      beanBody.accessoriesGroup = new THREE.Group();
      beanBody.accessoriesGroup.name = 'BeanAccessories';
      beanBody.mesh.add(beanBody.accessoriesGroup);
    }

    // 1. Manage Officer Accessories (Studio 3D Blender GLB)
    if (palette.isOfficer) {
      if (!beanBody.officerAccessories) {
        const officerGroup = new THREE.Group();
        officerGroup.name = 'OfficerAccessories';
        const headGroup = new THREE.Group();
        headGroup.name = 'Officer_HeadGroup';
        const chestGroup = new THREE.Group();
        chestGroup.name = 'Officer_ChestGroup';
        officerGroup.add(headGroup);
        officerGroup.add(chestGroup);

        if (beanBody.characterRoot) {
          beanBody.characterRoot.add(officerGroup);
        } else if (beanBody.accessoriesGroup) {
          beanBody.accessoriesGroup.add(officerGroup);
        }

        beanBody.officerAccessories = {
          group: officerGroup,
          headGroup,
          chestGroup,
          loaded: false
        };

        const loader = beanBody.gltfLoader;
        if (loader && typeof window !== 'undefined') {
          const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL)
            ? (import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`)
            : '/VHS/';
          const modelUrl = `${baseUrl}models/accessories/officer_accessories.glb`;
          loader.load(
            modelUrl,
            (gltf) => {
              const headKeywords = ['CapCrown', 'CapBand', 'CapVisor', 'CapCord', 'CapBadge', 'Aviator', 'Lens', 'Brow', 'Nose', 'Temple'];
              const children = [...gltf.scene.children];
              children.forEach((child) => {
                if (child.name.includes('ChestBadge')) {
                  chestGroup.add(child);
                } else if (headKeywords.some(kw => child.name.includes(kw))) {
                  headGroup.add(child);
                } else {
                  chestGroup.add(child);
                }
              });
              beanBody.officerAccessories.loaded = true;
            },
            undefined,
            (err) => console.warn('[BeanCustomization] Officer GLB load error:', err)
          );
        }
      }
      beanBody.officerAccessories.group.visible = true;
    } else {
      if (beanBody.officerAccessories) {
        beanBody.officerAccessories.group.visible = false;
      }
    }

    // 2. Manage Mol Foqiya Accessories (Blender 3D Sculpted GLB)
    if (palette.isMolFoqiya) {
      if (!beanBody.molFoqiyaAccessories) {
        const molGroup = new THREE.Group();
        molGroup.name = 'MolFoqiyaAccessories';
        const headGroup = new THREE.Group();
        headGroup.name = 'MolFoqiya_HeadGroup';
        const chestGroup = new THREE.Group();
        chestGroup.name = 'MolFoqiya_ChestGroup';
        molGroup.add(headGroup);
        molGroup.add(chestGroup);

        if (beanBody.characterRoot) {
          beanBody.characterRoot.add(molGroup);
        }

        beanBody.molFoqiyaAccessories = {
          group: molGroup,
          headGroup,
          chestGroup,
          loaded: false
        };

        const loader = beanBody.gltfLoader;
        if (loader && typeof window !== 'undefined') {
          const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL)
            ? (import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`)
            : '/VHS/';
          const modelUrl = `${baseUrl}models/accessories/mol_foqiya_accessories.glb`;
          loader.load(
            modelUrl,
            (gltf) => {
              const headKeywords = ['Taqiya', 'Apex', 'Beard', 'SoulPatch', 'Moustache'];
              const children = [...gltf.scene.children];
              children.forEach((child) => {
                if (headKeywords.some(kw => child.name.includes(kw))) {
                  headGroup.add(child);
                } else {
                  chestGroup.add(child);
                }
              });
              beanBody.molFoqiyaAccessories.loaded = true;
            },
            undefined,
            (err) => console.warn('[BeanCustomization] Mol Foqiya GLB load error:', err)
          );
        }
      }
      beanBody.molFoqiyaAccessories.group.visible = true;
    } else if (beanBody.molFoqiyaAccessories) {
      beanBody.molFoqiyaAccessories.group.visible = false;
    }

    // 3. Manage Gold Chain (Kreuzberg backwards compat)
    if (palette.hasGoldChain) {
      if (!beanBody.goldChain) {
        beanBody.goldChain = this.createGoldChain();
        beanBody.accessoriesGroup.add(beanBody.goldChain);
      }
      beanBody.goldChain.visible = true;
    } else if (beanBody.goldChain) {
      beanBody.goldChain.visible = false;
    }

    // 4. Manage Berlin Flat Cap (backwards compat)
    if (palette.hasCap) {
      if (!beanBody.berlinCap) {
        beanBody.berlinCap = this.createBerlinCap(palette.capColor || 0x333333);
        beanBody.accessoriesGroup.add(beanBody.berlinCap);
      }
      beanBody.berlinCap.visible = true;
    } else if (beanBody.berlinCap) {
      beanBody.berlinCap.visible = false;
    }

    // 4. Apply PBR material colors to 3D Fall Guy model body parts
    if (beanBody.isModelLoaded) {
      // Body Torso
      if (beanBody.bodyMesh) {
        if (!beanBody.customBodyMaterial) {
          beanBody.customBodyMaterial = beanBody.bodyMesh.material.clone();
          beanBody.bodyMesh.material = beanBody.customBodyMaterial;
        }
        beanBody.customBodyMaterial.map = null; // Solid rich PBR color
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
        beanBody.customHandMaterial.color.setHex(palette.handColor || palette.bodyColor);
        beanBody.customHandMaterial.roughness = palette.isOfficer ? 0.35 : palette.roughness;
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
        beanBody.customLegMaterial.roughness = palette.isOfficer ? 0.15 : palette.roughness;
        beanBody.customLegMaterial.metalness = palette.isOfficer ? 0.85 : palette.metalness;
        beanBody.customLegMaterial.needsUpdate = true;
      }

      // Eyes / Faceplate
      if (beanBody.eyeMesh) {
        if (!beanBody.customEyeMaterial) {
          beanBody.customEyeMaterial = beanBody.eyeMesh.material.clone();
          beanBody.eyeMesh.material = beanBody.customEyeMaterial;
        }
        if (palette.isMolFoqiya) {
          beanBody.customEyeMaterial.color.setHex(0x111111);
          beanBody.customEyeMaterial.roughness = 0.15;
          beanBody.customEyeMaterial.metalness = 0.90;
        } else {
          beanBody.customEyeMaterial.color.setHex(0xFFFFFF);
          beanBody.customEyeMaterial.roughness = 0.40;
          beanBody.customEyeMaterial.metalness = 0.05;
        }
        beanBody.customEyeMaterial.needsUpdate = true;
      }
    } else {
      beanBody.pendingSkin = skinName;
    }

    // Emit event across systems
    this.eventBus.emit('player:skinChanged', {
      skinName,
      palette,
      beanId: beanBody.id
    });

    return palette;
  }

  /**
   * Per-frame breathing and skeletal synchronization
   * Kinematically tracks head & chest bones transformed into bean mesh space.
   * All accessories (cap, aviators, tie, badge, epaulets) breathe, nod,
   * tilt, and sprint in 100% mechanical lockstep with the skeleton!
   * @param {number} dt
   * @param {import('./BeanBody.js').BeanBody} beanBody
   */
  update(dt, beanBody) {
    if (!beanBody) return;

    // 1. Officer Accessories Kinematic Tracking (Cap, Visor, Aviators, Tie, Epaulets, Belt)
    if (beanBody.officerAccessories && beanBody.officerAccessories.group.visible && beanBody.officerAccessories.loaded) {
      const acc = beanBody.officerAccessories;

      // Kinematic Head Tracking (Peaked Cap, Visor, Aviators)
      if (beanBody.headBone && acc.headGroup && beanBody.characterRoot) {
        beanBody.headBone.getWorldPosition(this._vPos);
        beanBody.characterRoot.worldToLocal(this._vPos);
        beanBody.headBone.getWorldQuaternion(this._qRot);
        this._eRot.setFromQuaternion(this._qRot, 'YXZ');

        if (!acc.initHead) {
          acc.initHead = { y: this._vPos.y, z: this._vPos.z, pitch: this._eRot.x };
        }

        acc.headGroup.position.y = this._vPos.y - acc.initHead.y;
        acc.headGroup.position.z = this._vPos.z - acc.initHead.z;
        acc.headGroup.rotation.x = this._eRot.x - acc.initHead.pitch;
      }

      // Kinematic Chest Tracking (Collar, Tie, Tie Clip, Chest Badge, Epaulets, Belt, Walkie-Talkie)
      if (beanBody.chestBone && acc.chestGroup && beanBody.characterRoot) {
        beanBody.chestBone.getWorldPosition(this._vPos);
        beanBody.characterRoot.worldToLocal(this._vPos);
        beanBody.chestBone.getWorldQuaternion(this._qRot);
        this._eRot.setFromQuaternion(this._qRot, 'YXZ');

        if (!acc.initChest) {
          acc.initChest = { y: this._vPos.y, z: this._vPos.z, pitch: this._eRot.x };
        }

        acc.chestGroup.position.y = this._vPos.y - acc.initChest.y;
        acc.chestGroup.position.z = this._vPos.z - acc.initChest.z;
        acc.chestGroup.rotation.x = this._eRot.x - acc.initChest.pitch;
      }
    }

    // 2. Mol Foqiya Accessories Kinematic Tracking (Taqiya, Beard, Moustache, Sfifa, Aqqad, Misbaha)
    if (beanBody.molFoqiyaAccessories && beanBody.molFoqiyaAccessories.group.visible && beanBody.molFoqiyaAccessories.loaded) {
      const acc = beanBody.molFoqiyaAccessories;

      // Kinematic Head Tracking (Taqiya cap, 3D Beard, Moustache, Soul Patch)
      if (beanBody.headBone && acc.headGroup && beanBody.characterRoot) {
        beanBody.headBone.getWorldPosition(this._vPos);
        beanBody.characterRoot.worldToLocal(this._vPos);
        beanBody.headBone.getWorldQuaternion(this._qRot);
        this._eRot.setFromQuaternion(this._qRot, 'YXZ');

        if (!acc.initHead) {
          acc.initHead = { y: this._vPos.y, z: this._vPos.z, pitch: this._eRot.x };
        }

        acc.headGroup.position.y = this._vPos.y - acc.initHead.y;
        acc.headGroup.position.z = this._vPos.z - acc.initHead.z;
        acc.headGroup.rotation.x = this._eRot.x - acc.initHead.pitch;
      }

      // Kinematic Chest Tracking (Sfifa ribbon, 8 Aqqad buttons, Amber Misbaha & Silk Tassel)
      if (beanBody.chestBone && acc.chestGroup && beanBody.characterRoot) {
        beanBody.chestBone.getWorldPosition(this._vPos);
        beanBody.characterRoot.worldToLocal(this._vPos);
        beanBody.chestBone.getWorldQuaternion(this._qRot);
        this._eRot.setFromQuaternion(this._qRot, 'YXZ');

        if (!acc.initChest) {
          acc.initChest = { y: this._vPos.y, z: this._vPos.z, pitch: this._eRot.x };
        }

        acc.chestGroup.position.y = this._vPos.y - acc.initChest.y;
        acc.chestGroup.position.z = this._vPos.z - acc.initChest.z;
        acc.chestGroup.rotation.x = this._eRot.x - acc.initChest.pitch;
      }
    }
  }

  dispose() {
    // Clean up if needed
  }
}


