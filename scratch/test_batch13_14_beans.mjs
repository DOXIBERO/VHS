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

// 1. Verify 5 distinct skin palettes (Parts 0211-0220)
console.log('--- 1. Testing Bean Skins & Palettes ---');
const skinKeys = Object.keys(BEAN_SKINS);
assert(skinKeys.length === 5, `Expected 5 skins, found ${skinKeys.length}`);
assert(BEAN_SKINS.CLASSIC.bodyColor === 0xFFD700 && BEAN_SKINS.CLASSIC.shoeColor === 0xFF3333, 'CLASSIC has yellow body and red shoes');
assert(BEAN_SKINS.KREUZBERG.bodyColor === 0x18181B && BEAN_SKINS.KREUZBERG.shoeColor === 0x22C55E, 'KREUZBERG has black body and green shoes');
assert(BEAN_SKINS['SPÄTI'].bodyColor === 0xF8FAFC && BEAN_SKINS['SPÄTI'].shoeColor === 0x06B6D4, 'SPÄTI has white body and cyan shoes');
assert(BEAN_SKINS['U-BAHN'].bodyColor === 0x64748B && BEAN_SKINS['U-BAHN'].shoeColor === 0xEAB308, 'U-BAHN has slate gray body and yellow shoes');
assert(BEAN_SKINS.BERGHAIN.bodyColor === 0x09090B && BEAN_SKINS.BERGHAIN.roughness <= 0.25, 'BERGHAIN has techno black with leather sheen');

// 2. Verify Accessories: Gold chain with pendant & Berlin flat cap (Parts 0221-0230)
console.log('\n--- 2. Testing Accessories & Customization ---');
const customization = new BeanCustomization(eventBus);
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

// Acceptance: Prewarmed beans are created in < 50ms total
console.log('Testing prewarm(20) performance...');
const duration = factory.prewarm(20);
console.log(`Prewarm 20 beans took: ${duration.toFixed(2)}ms`);
assert(duration < 50, `Prewarmed beans created in < 50ms (took ${duration.toFixed(2)}ms)`);
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
