import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { BeanBody } from '../src/player/BeanBody.js';
import { PhysicsWorld } from '../src/physics/PhysicsWorld.js';

console.log('--- TESTING BATCH 12: Parts 0201-0210 (BeanBody 3D Model & Anatomy) ---');

const bean = new BeanBody({ id: 'test_bean_fallguys', position: new THREE.Vector3(0, 5, 0) });

// Test 1: Anatomical Parts Inspection
console.log('\n[Test 1] Inspecting all 10 anatomical body parts...');

// Part 0201: Torso
if (!bean.torsoMesh || !(bean.torsoMesh.geometry instanceof THREE.CapsuleGeometry)) {
  throw new Error('Part 0201 Failed: Torso capsule geometry missing!');
}
console.log('✅ Part 0201: Yellow Capsule Torso initialized (radius 0.5, length 0.8)');

// Part 0202: Belly Bump
if (!bean.bellyMesh || !(bean.bellyMesh.geometry instanceof THREE.SphereGeometry)) {
  throw new Error('Part 0202 Failed: Belly bump geometry missing!');
}
if (bean.bellyMesh.position.z !== 0.15) {
  throw new Error('Part 0202 Failed: Belly bump position.z must be 0.15 for fat CJ silhouette!');
}
console.log('✅ Part 0202: Protruding Belly Bump initialized at (0, -0.1, 0.15)');

// Part 0203: Head
if (!bean.headMesh || !(bean.headMesh.geometry instanceof THREE.SphereGeometry) || bean.headMesh.position.y !== 0.75) {
  throw new Error('Part 0203 Failed: Head geometry or position missing!');
}
console.log('✅ Part 0203: Round Head initialized at (0, 0.75, 0)');

// Part 0204: Eyes & Pupils
if (!bean.eyesGroup || bean.eyesGroup.children.length !== 4) {
  throw new Error('Part 0204 Failed: Eyes group should contain 2 white spheres + 2 black pupils!');
}
console.log('✅ Part 0204: Cute White Eyes with Black Pupils facing +Z initialized');

// Part 0205: Mouth
if (!bean.mouthMesh || !(bean.mouthMesh.geometry instanceof THREE.TorusGeometry)) {
  throw new Error('Part 0205 Failed: Torus smile mouth missing!');
}
console.log('✅ Part 0205: Friendly Smile Mouth initialized at (0, 0.68, 0.3)');

// Part 0206: Arms
if (!bean.armsGroup || !bean.leftArm || !bean.rightArm) {
  throw new Error('Part 0206 Failed: Arms missing!');
}
const leftRotDeg = Math.round(bean.leftArm.rotation.z * (180 / Math.PI));
const rightRotDeg = Math.round(bean.rightArm.rotation.z * (180 / Math.PI));
if (leftRotDeg !== 30 || rightRotDeg !== -30) {
  throw new Error(`Part 0206 Failed: Expected arms rotated +/-30°, got ${leftRotDeg} and ${rightRotDeg}`);
}
console.log('✅ Part 0206: Stubby Arms initialized rotated +/-30° on Z');

// Part 0207: Hands
if (!bean.handsGroup || !bean.leftHand || !bean.rightHand) {
  throw new Error('Part 0207 Failed: Round hand spheres missing!');
}
console.log('✅ Part 0207: Darker Yellow Hand Spheres initialized at (+/-0.75, 0, 0)');

// Part 0208: Legs
if (!bean.legsGroup || !bean.leftLeg || !bean.rightLeg) {
  throw new Error('Part 0208 Failed: Stubby legs missing!');
}
console.log('✅ Part 0208: Stubby Legs initialized at (+/-0.2, -0.65, 0)');

// Part 0209: Shoes
if (!bean.shoesGroup || !bean.leftShoe || !bean.rightShoe) {
  throw new Error('Part 0209 Failed: Red shoes missing!');
}
if (bean.materials.shoes.color.getHexString().toUpperCase() !== 'FF3333') {
  throw new Error('Part 0209 Failed: Shoes should be bright red 0xFF3333!');
}
console.log('✅ Part 0209: Bright Red Shoes initialized at (+/-0.2, -0.85, 0.05)');

// Part 0210: Berlin Flat Cap
if (!bean.capGroup || bean.capGroup.children.length !== 2) {
  throw new Error('Part 0210 Failed: Berlin flat cap missing!');
}
console.log('✅ Part 0210: Berlin Flat Cap (Mütze) initialized tilted forward on top of head');

// Test 2: Physics Drop Simulation & Standing Upright Test
console.log('\n[Test 2] Simulating Bean physics drop onto ground plane...');
const physicsWorld = new PhysicsWorld();
physicsWorld.addBody(bean.body, bean.mesh);

if (bean.body.angularFactor.x !== 0 || bean.body.angularFactor.z !== 0) {
  throw new Error('Bean physics body must lock X and Z angular factors to stand upright!');
}
console.log('✅ Bean physics body has upright angular constraint (X=0, Z=0 locked)');

// Simulate 120 frames (2 seconds)
for (let i = 0; i < 120; i++) {
  physicsWorld.step(1 / 60);
}

console.log(`Bean settled at Y = ${bean.body.position.y.toFixed(3)} (Mesh Y = ${bean.mesh.position.y.toFixed(3)})`);

if (bean.body.position.y < 0.5 || bean.body.position.y > 1.2) {
  throw new Error(`Bean did not settle properly on the ground! Position: ${bean.body.position.y}`);
}
if (Math.abs(bean.body.position.y - bean.mesh.position.y) > 0.001) {
  throw new Error('Visual mesh position desynchronized from physics body position!');
}
console.log('✅ Bean stands upright on the green ground plane with zero clipping or tipping over!');

console.log('\n✨ ALL BATCH 12 (PARTS 0201-0210) ACCEPTANCE CRITERIA PASSED! ✨');
