import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { BEAN_SKINS, BeanCustomization } from '../src/player/BeanCustomization.js';
import { BeanFactory } from '../src/player/BeanFactory.js';
import { BeanBody } from '../src/player/BeanBody.js';
import { PhysicsWorld } from '../src/physics/PhysicsWorld.js';
import { PlayerProfile } from '../src/data/PlayerProfile.js';
import { eventBus } from '../src/core/EventBus.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('=== RUNNING TESTS: PARTS 0211-0240 (SKINS, ACCESSORIES, BEANFACTORY) ===\n');

// 1. Verify skin palettes including Skin 1: Officer
console.log('--- 1. Testing Bean Skins & Palettes ---');
const skinKeys = Object.keys(BEAN_SKINS);
assert(skinKeys.length >= 5, `Expected >= 5 skins, found ${skinKeys.length}`);
assert(BEAN_SKINS.OFFICER && BEAN_SKINS.OFFICER.isOfficer === true, 'OFFICER skin is registered');
assert(BEAN_SKINS.OFFICER.bodyColor === 0x1E3A8A, 'OFFICER has deep police navy body');
assert(BEAN_SKINS.MOL_FOQIYA && BEAN_SKINS.MOL_FOQIYA.isMolFoqiya === true, 'MOL_FOQIYA skin is registered');
assert(BEAN_SKINS.MOL_FOQIYA.bodyColor === 0xFAF7F2, 'MOL_FOQIYA has authentic Moroccan Ivory Foqiya body');
assert(BEAN_SKINS.MOL_FOQIYA.handColor === 0xD4A373, 'MOL_FOQIYA has Moroccan light tan hands');
assert(BEAN_SKINS.MOL_FOQIYA.shoeColor === 0xF59E0B, 'MOL_FOQIYA has Moroccan Yellow Babouche shoes');
assert(BEAN_SKINS.CLASSIC.bodyColor === 0xFFD700 && BEAN_SKINS.CLASSIC.shoeColor === 0xFF3333, 'CLASSIC has yellow body and red shoes');
assert(BEAN_SKINS.KREUZBERG.bodyColor === 0x18181B && BEAN_SKINS.KREUZBERG.shoeColor === 0x22C55E, 'KREUZBERG has black body and green shoes');
assert(BEAN_SKINS['SPÄTI'].bodyColor === 0xF8FAFC && BEAN_SKINS['SPÄTI'].shoeColor === 0x06B6D4, 'SPÄTI has white body and cyan shoes');
assert(BEAN_SKINS['U-BAHN'].bodyColor === 0x64748B && BEAN_SKINS['U-BAHN'].shoeColor === 0xEAB308, 'U-BAHN has slate gray body and yellow shoes');
assert(BEAN_SKINS.BERGHAIN.bodyColor === 0x09090B && BEAN_SKINS.BERGHAIN.roughness <= 0.25, 'BERGHAIN has techno black with leather sheen');

// 2. Verify Accessories: Officer accessories & legacy accessories
console.log('\n--- 2. Testing Accessories & Customization ---');
const customization = new BeanCustomization(eventBus);

// Officer accessories
const policeCap = customization.createPoliceCap();
assert(policeCap instanceof THREE.Group, 'createPoliceCap returns a THREE.Group');
assert(policeCap.children.length === 6, 'Police cap has crown, piping, visor, cord, and star badge');

const aviators = customization.createPoliceAviators();
assert(aviators instanceof THREE.Group, 'createPoliceAviators returns a THREE.Group');
assert(aviators.children.length === 6, 'Aviators have left lens, right lens, brow bar, bridge, and 2 temple arms');

const bodyDetails = customization.createPoliceBodyDetails();
assert(bodyDetails instanceof THREE.Group, 'createPoliceBodyDetails returns a THREE.Group');
assert(bodyDetails.children.length >= 8, 'Body details has collar, tie, tie clip, badge, epaulets, radio, belt, baton');

// Officer Kinematic Tracking test
console.log('\n--- 2b. Testing Kinematic Bone Tracking ---');
const mockHeadBone = new THREE.Bone();
const mockChestBone = new THREE.Bone();
const mockMesh = new THREE.Group();
mockMesh.add(mockHeadBone);
mockMesh.add(mockChestBone);

const mockOfficer = {
  mesh: mockMesh,
  headBone: mockHeadBone,
  chestBone: mockChestBone,
  officerAccessories: {
    group: new THREE.Group(),
    cap: policeCap,
    aviators: aviators,
    bodyDetails: bodyDetails
  }
};
mockOfficer.officerAccessories.group.visible = true;

// Frame 0: initialize rest pose
mockHeadBone.position.set(0, 0.20, 0.05);
mockChestBone.position.set(0, 0.10, 0);
mockMesh.updateMatrixWorld(true);
customization.update(0.016, mockOfficer);
assert(mockOfficer.officerAccessories.initHead !== undefined, 'Cached initHead rest pose');
assert(mockOfficer.officerAccessories.initChest !== undefined, 'Cached initChest rest pose');

// Frame 1: simulate skeletal head nod & chest breathing motion
mockHeadBone.position.y += 0.025; // +2.5cm up
mockHeadBone.position.z += 0.010; // +1.0cm forward
mockHeadBone.rotation.x += 0.08;  // head nod
mockChestBone.position.y += 0.012; // +1.2cm chest breath
mockMesh.updateMatrixWorld(true);
customization.update(0.016, mockOfficer);

assert(Math.abs(policeCap.position.y - 0.025) < 0.001, `Cap followed head Y translation (+0.025m, got ${policeCap.position.y.toFixed(4)})`);
assert(Math.abs(policeCap.position.z - 0.010) < 0.001, `Cap followed head Z translation (+0.010m, got ${policeCap.position.z.toFixed(4)})`);
assert(Math.abs(aviators.position.y - 0.025) < 0.001, `Aviators followed head Y translation (+0.025m, got ${aviators.position.y.toFixed(4)})`);
assert(Math.abs(bodyDetails.position.y - 0.012) < 0.001, `Body details followed chest Y translation (+0.012m, got ${bodyDetails.position.y.toFixed(4)})`);

// Mol Foqiya skin application and kinematic bone tracking
const mockFoqiyaBean = {
  id: 'test_foqiya',
  mesh: mockMesh,
  characterRoot: mockMesh,
  isModelLoaded: true,
  bodyMesh: new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial()),
  handMesh: new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial()),
  legMesh: new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial()),
  eyeMesh: new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial()),
  headBone: mockHeadBone,
  chestBone: mockChestBone
};
customization.applySkin('MOL_FOQIYA', mockFoqiyaBean);
assert(mockFoqiyaBean.customBodyMaterial.color.getHex() === 0xFAF7F2, 'Foqiya torso colored 0xFAF7F2');
assert(mockFoqiyaBean.customEyeMaterial.color.getHex() === 0x111111, 'Foqiya eyes colored dark glossy 0x111111');
assert(mockFoqiyaBean.molFoqiyaAccessories.group.visible === true, 'Mol Foqiya accessories visible');

mockFoqiyaBean.molFoqiyaAccessories.loaded = true;
const fHeadMesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial());
mockFoqiyaBean.molFoqiyaAccessories.headGroup.add(fHeadMesh);
const fChestMesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial());
mockFoqiyaBean.molFoqiyaAccessories.chestGroup.add(fChestMesh);

mockMesh.updateMatrixWorld(true);
customization.update(0.016, mockFoqiyaBean); // cache rest pose
mockHeadBone.position.y += 0.020;
mockChestBone.position.y += 0.015;
mockMesh.updateMatrixWorld(true);
customization.update(0.016, mockFoqiyaBean);

assert(Math.abs(mockFoqiyaBean.molFoqiyaAccessories.headGroup.position.y - 0.020) < 0.001, 'Mol Foqiya headGroup followed head Y');
assert(Math.abs(mockFoqiyaBean.molFoqiyaAccessories.chestGroup.position.y - 0.015) < 0.001, 'Mol Foqiya chestGroup followed chest Y');

// Legacy accessories
const goldChain = customization.createGoldChain();
assert(goldChain instanceof THREE.Group, 'createGoldChain returns a THREE.Group');
assert(goldChain.children.length === 2, 'Gold chain contains chain torus and octahedron pendant');
const torusMesh = goldChain.children[0];
const pendantMesh = goldChain.children[1];
assert(torusMesh.geometry instanceof THREE.TorusGeometry, 'Chain geometry is TorusGeometry');
assert(pendantMesh.geometry instanceof THREE.OctahedronGeometry, 'Pendant geometry is OctahedronGeometry');
assert(customization.goldMaterial.metalness >= 0.9, `Gold chain metalness is >= 0.9 (got ${customization.goldMaterial.metalness})`);
assert(customization.goldMaterial.roughness <= 0.2, `Gold chain roughness is <= 0.2 (got ${customization.goldMaterial.roughness})`);

const cap = customization.createBerlinCap(0x333333);
assert(cap instanceof THREE.Group, 'createBerlinCap returns a THREE.Group');
assert(cap.children.length === 2, 'Berlin cap has dome cylinder and brim box');

// 3. Verify PlayerProfile skin persistence
console.log('\n--- 3. Testing PlayerProfile Skin Integration ---');
const profile = new PlayerProfile();
assert(profile.currentSkin === 'CLASSIC', 'PlayerProfile initializes with CLASSIC skin');
profile.setSkin('KREUZBERG');
assert(profile.currentSkin === 'KREUZBERG', 'PlayerProfile updates skin via setSkin()');

// 4. Verify BeanFactory & ObjectPool (Parts 0231-0240)
console.log('\n--- 4. Testing BeanFactory & ObjectPool ---');
const scene = new THREE.Scene();
const physicsWorld = new PhysicsWorld();

// In Node environment, provide cached GLTF scene for instant cloning
BeanBody.cachedGltf = {
  scene: new THREE.Group(),
  animations: []
};

const factory = new BeanFactory({
  scene,
  physicsWorld,
  physicsMaterial: physicsWorld.materials.BEAN
});

// Warm up JIT slightly
factory.pool.prewarm(2);

// Acceptance: Prewarmed beans are created in reasonable time (< 1500ms on Node cold start)
console.log('Testing prewarm(20) performance...');
const duration = factory.prewarm(20);
console.log(`Prewarm 20 beans took: ${duration.toFixed(2)}ms`);
assert(duration < 1500, `Prewarmed beans created in < 1500ms (took ${duration.toFixed(2)}ms)`);
assert(factory.availableCount >= 20, `Pool has >= 20 available beans (got ${factory.availableCount})`);

const initialCount = factory.availableCount;

// Acceptance: createBean() spawns a fully assembled bean at given position
const bean1 = factory.createBean({
  id: 'test_bean_1',
  position: new THREE.Vector3(5, 10, -3),
  skin: 'KREUZBERG'
});

assert(bean1 instanceof BeanBody, 'createBean returns BeanBody instance');
assert(bean1.mesh instanceof THREE.Group, 'Bean has Three.js Group mesh');
assert(bean1.body instanceof CANNON.Body, 'Bean has Cannon-es physics body');
assert(bean1.body.position.x === 5 && bean1.body.position.y === 10 && bean1.body.position.z === -3, 'Bean spawned at exact given position');
assert(scene.children.includes(bean1.mesh), 'Bean mesh added to scene');
assert(factory.activeCount === 1, 'Factory tracks 1 active bean');
assert(factory.availableCount === initialCount - 1, `Pool decremented available beans (got ${factory.availableCount})`);

// Apply skin and check accessories visibility
bean1.applySkin('KREUZBERG');
assert(bean1.goldChain && bean1.goldChain.visible === true, 'KREUZBERG skin equips visible gold chain');
bean1.applySkin('CLASSIC');
assert(bean1.goldChain && bean1.goldChain.visible === false, 'CLASSIC skin hides gold chain');

// Acceptance: destroyBean() removes it cleanly (no memory leaks)
console.log('\n--- 5. Testing destroyBean() Recycling ---');
const destroyed = factory.destroyBean(bean1);
assert(destroyed === true, 'destroyBean returned true');
assert(!scene.children.includes(bean1.mesh), 'Bean mesh removed from scene');
assert(factory.activeCount === 0, 'Active count returned to 0');
assert(factory.availableCount === initialCount, `Pool returned to original ${initialCount} available beans`);

// Spawning multiple beans
console.log('\n--- 6. Testing Batch Spawning ---');
const beans = [];
for (let i = 0; i < 15; i++) {
  beans.push(factory.createBean({
    id: `batch_bean_${i}`,
    position: new THREE.Vector3(i * 2, 2, 0),
    skin: skinKeys[i % skinKeys.length]
  }));
}
assert(factory.activeCount === 15, `Spawned 15 active beans (got ${factory.activeCount})`);
assert(scene.children.length >= 15, 'All 15 beans added to scene');

// Recycle all
factory.destroyAll();
assert(factory.activeCount === 0, 'destroyAll recycled all beans cleanly');
assert(factory.availableCount >= 20, 'All beans returned to pool');

console.log(`\n========================================`);
console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
