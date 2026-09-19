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

  constructor(bus = eventBus) {
    this.eventBus = bus;
    this.currentSkin = 'OFFICER';
    this.goldMaterial = BeanCustomization.getGoldMaterial();
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
   * Calibrated for authentic Fall Guy head: top of head is at y = 0.93.
   * @returns {THREE.Group}
   */
  createPoliceCap() {
    const cap = new THREE.Group();
    cap.name = 'Accessory_PoliceCap';

    const goldMat = BeanCustomization.getGoldMaterial();
    const blackGlossMat = BeanCustomization.getBlackGlossMaterial();
    const navyMat = BeanCustomization.getNavyMaterial();

    // 1. Navy Flared Crown (Cylinder wider at top, base cleanly wrapping head)
    const crownGeo = new THREE.CylinderGeometry(0.42, 0.36, 0.18, 24);
    const crown = new THREE.Mesh(crownGeo, navyMat);
    crown.position.set(0, 0.96, 0.04);
    crown.rotation.x = -0.12; // Cool backward/forward tilt
    crown.castShadow = true;
    cap.add(crown);

    // 2. Gold Piping around top crown seam
    const pipingGeo = new THREE.TorusGeometry(0.42, 0.016, 10, 24);
    const piping = new THREE.Mesh(pipingGeo, goldMat);
    piping.position.set(0, 1.04, 0.05);
    piping.rotation.x = Math.PI / 2 - 0.12;
    cap.add(piping);

    // 3. Black Gloss Curved Visor (Visière - protruding stylishly forward)
    const visorGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.028, 24, 1, false, 0, Math.PI);
    const visor = new THREE.Mesh(visorGeo, blackGlossMat);
    visor.position.set(0, 0.85, 0.24);
    visor.rotation.x = 0.36;
    visor.rotation.y = Math.PI / 2;
    visor.scale.set(1.05, 1, 0.75);
    visor.castShadow = true;
    cap.add(visor);

    // 4. Gold Chin Strap Cord & Side Buttons
    const cordGeo = new THREE.TorusGeometry(0.36, 0.018, 8, 24, Math.PI);
    const cord = new THREE.Mesh(cordGeo, goldMat);
    cord.position.set(0, 0.87, 0.16);
    cord.rotation.x = Math.PI / 2 - 0.08;
    cord.rotation.z = Math.PI;
    cap.add(cord);

    // 5. Golden Police Star Crest Plate & 5-point Star on Front
    const badgePlateGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.016, 16);
    const badgePlate = new THREE.Mesh(badgePlateGeo, goldMat);
    badgePlate.position.set(0, 0.97, 0.38);
    badgePlate.rotation.x = Math.PI / 2 - 0.12;
    cap.add(badgePlate);

    const starGeo = new THREE.OctahedronGeometry(0.048, 0);
    const star = new THREE.Mesh(starGeo, goldMat);
    star.position.set(0, 0.97, 0.40);
    star.rotation.z = Math.PI / 5;
    cap.add(star);

    return cap;
  }

  /**
   * Create Police Aviator Sunglasses (نظارات البوليسي كحلة)
   * Perfectly covering the Fall Guy eyes with authentic tinted lenses and gold metal frames.
   * @returns {THREE.Group}
   */
  createPoliceAviators() {
    const aviators = new THREE.Group();
    aviators.name = 'Accessory_Aviators';

    const goldMat = BeanCustomization.getGoldMaterial();
    const sunglassesMat = BeanCustomization.getSunglassesMaterial();

    // Left Lens - 0.22 width x 0.26 height to span from y=0.45 to y=0.71 (100% eye coverage)
    const lensGeo = new THREE.BoxGeometry(0.22, 0.26, 0.03);
    const lensL = new THREE.Mesh(lensGeo, sunglassesMat);
    lensL.position.set(-0.13, 0.58, 0.42);
    lensL.rotation.y = -0.16;
    lensL.rotation.z = 0.03;
    aviators.add(lensL);

    // Right Lens
    const lensR = new THREE.Mesh(lensGeo, sunglassesMat);
    lensR.position.set(0.13, 0.58, 0.42);
    lensR.rotation.y = 0.16;
    lensR.rotation.z = -0.03;
    aviators.add(lensR);

    // Gold Top Brow Bar
    const browBarGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.48, 8);
    const browBar = new THREE.Mesh(browBarGeo, goldMat);
    browBar.rotation.z = Math.PI / 2;
    browBar.position.set(0, 0.71, 0.42);
    aviators.add(browBar);

    // Gold Nose Bridge
    const bridgeGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.09, 8);
    const bridge = new THREE.Mesh(bridgeGeo, goldMat);
    bridge.rotation.z = Math.PI / 2;
    bridge.position.set(0, 0.60, 0.43);
    aviators.add(bridge);

    return aviators;
  }

  /**
   * Create Police Uniform Accessories & Equipment (شارة الصدر، الكرافاطا، الكتافيات، الراديو، السنتور، الماتراك)
   * @returns {THREE.Group}
   */
  createPoliceBodyDetails() {
    const bodyDetails = new THREE.Group();
    bodyDetails.name = 'Accessory_PoliceBodyDetails';

    const goldMat = BeanCustomization.getGoldMaterial();
    const blackGlossMat = BeanCustomization.getBlackGlossMaterial();
    const navyMat = BeanCustomization.getNavyMaterial();
    const silverMat = BeanCustomization.getSilverMaterial();

    // 1. Police Star Shield Badge on Left Chest (y = 0.28, z = 0.46)
    const chestBadgeGeo = new THREE.OctahedronGeometry(0.075, 0);
    const chestBadge = new THREE.Mesh(chestBadgeGeo, goldMat);
    chestBadge.position.set(-0.18, 0.28, 0.46);
    chestBadge.scale.set(1, 1.2, 0.35);
    chestBadge.castShadow = true;
    bodyDetails.add(chestBadge);

    // 2. Black Police Tie with Top Knot
    const knotGeo = new THREE.BoxGeometry(0.09, 0.06, 0.03);
    const knot = new THREE.Mesh(knotGeo, blackGlossMat);
    knot.position.set(0, 0.35, 0.455);
    bodyDetails.add(knot);

    const tieGeo = new THREE.BoxGeometry(0.075, 0.34, 0.025);
    const tie = new THREE.Mesh(tieGeo, blackGlossMat);
    tie.position.set(0, 0.18, 0.465);
    tie.rotation.x = -0.10;
    bodyDetails.add(tie);

    // 3. Shoulder Epaulets with Golden Stars
    const epGeo = new THREE.BoxGeometry(0.15, 0.03, 0.22);
    const epStarGeo = new THREE.OctahedronGeometry(0.03, 0);

    const epL = new THREE.Mesh(epGeo, navyMat);
    epL.position.set(-0.38, 0.36, 0.05);
    epL.rotation.z = -0.32;
    bodyDetails.add(epL);

    const epStarL = new THREE.Mesh(epStarGeo, goldMat);
    epStarL.position.set(-0.40, 0.38, 0.05);
    bodyDetails.add(epStarL);

    const epR = new THREE.Mesh(epGeo, navyMat);
    epR.position.set(0.38, 0.36, 0.05);
    epR.rotation.z = 0.32;
    bodyDetails.add(epR);

    const epStarR = new THREE.Mesh(epStarGeo, goldMat);
    epStarR.position.set(0.40, 0.38, 0.05);
    bodyDetails.add(epStarR);

    // 4. Walkie-Talkie on Left Shoulder
    const radioGeo = new THREE.BoxGeometry(0.07, 0.13, 0.06);
    const radio = new THREE.Mesh(radioGeo, blackGlossMat);
    radio.position.set(-0.34, 0.44, 0.07);
    radio.rotation.z = -0.15;
    bodyDetails.add(radio);

    const antennaGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.12, 8);
    const antenna = new THREE.Mesh(antennaGeo, blackGlossMat);
    antenna.position.set(-0.35, 0.54, 0.07);
    bodyDetails.add(antenna);

    // 5. Police Duty Belt with Silver Buckle
    const beltGeo = new THREE.TorusGeometry(0.47, 0.035, 12, 32);
    const belt = new THREE.Mesh(beltGeo, blackGlossMat);
    belt.position.set(0, -0.06, 0.02);
    belt.rotation.x = Math.PI / 2;
    bodyDetails.add(belt);

    const buckleGeo = new THREE.BoxGeometry(0.10, 0.07, 0.025);
    const buckle = new THREE.Mesh(buckleGeo, silverMat);
    buckle.position.set(0, -0.06, 0.49);
    bodyDetails.add(buckle);

    // 6. Mini Police Baton (Matraque) on Right Hip
    const batonGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.26, 8);
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

    // 1. Manage Officer Accessories
    if (palette.isOfficer) {
      if (!beanBody.officerAccessories) {
        const cap = this.createPoliceCap();
        const aviators = this.createPoliceAviators();
        const bodyDetails = this.createPoliceBodyDetails();

        const officerGroup = new THREE.Group();
        officerGroup.name = 'OfficerAccessories';
        officerGroup.add(cap);
        officerGroup.add(aviators);
        officerGroup.add(bodyDetails);

        beanBody.accessoriesGroup.add(officerGroup);

        beanBody.officerAccessories = {
          group: officerGroup,
          cap,
          aviators,
          bodyDetails,
          capBaseY: 0,
          aviatorsBaseY: 0,
          bodyDetailsBaseY: 0
        };
      }
      beanBody.officerAccessories.group.visible = true;
    } else {
      if (beanBody.officerAccessories) {
        beanBody.officerAccessories.group.visible = false;
      }
    }

    // 2. Manage Gold Chain (Kreuzberg backwards compat)
    if (palette.hasGoldChain) {
      if (!beanBody.goldChain) {
        beanBody.goldChain = this.createGoldChain();
        beanBody.accessoriesGroup.add(beanBody.goldChain);
      }
      beanBody.goldChain.visible = true;
    } else if (beanBody.goldChain) {
      beanBody.goldChain.visible = false;
    }

    // 3. Manage Berlin Flat Cap (backwards compat)
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
   * Per-frame breathing and skeletal synchronization (Part 0221-0230)
   * Dynamically tracks head bone oscillation so accessories naturally breathe
   * and move with the 3D Fall Guy skeleton with 0 clipping!
   * @param {number} dt
   * @param {import('./BeanBody.js').BeanBody} beanBody
   */
  update(dt, beanBody) {
    if (!beanBody || !beanBody.officerAccessories || !beanBody.officerAccessories.group.visible) {
      return;
    }

    const { cap, aviators, bodyDetails, capBaseY, aviatorsBaseY, bodyDetailsBaseY } = beanBody.officerAccessories;

    if (beanBody.headBone) {
      // Track real skeleton head bone relative to initial rest pose
      const dy = (beanBody.headBone.position.y - beanBody.initialHeadBoneY) * 0.65;
      cap.position.y = capBaseY + dy;
      aviators.position.y = aviatorsBaseY + dy;
      bodyDetails.position.y = bodyDetailsBaseY + dy * 0.40;
    }
  }

  dispose() {
    // Clean up if needed
  }
}


