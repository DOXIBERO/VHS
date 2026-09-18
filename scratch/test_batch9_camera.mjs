import * as THREE from 'three';
import { CameraController } from '../src/core/CameraController.js';

console.log('--- TESTING BATCH 9: Parts 0121-0150 (CameraController) ---');

const camera = new THREE.PerspectiveCamera(60, 16 / 9, 0.1, 1000);
camera.position.set(0, 5, 10);

const testTarget = new THREE.Object3D();
testTarget.position.set(0, 0, 0);

const controller = new CameraController(camera, testTarget, {
  offset: new THREE.Vector3(0, 8, 12),
  lerpSpeed: 0.05,
  lookAhead: 2.0,
  minY: 2.0
});

// Test 1: Camera initial follow & smooth lerp (no snapping)
console.log('\n[Test 1] Testing smooth lerp interpolation (no snapping)...');
const initialCamPos = camera.position.clone();

// Step one frame (dt = 1/60s)
controller.update(1 / 60);

console.log(`Initial Pos: (${initialCamPos.x}, ${initialCamPos.y}, ${initialCamPos.z})`);
console.log(`After 1 frame lerp: (${camera.position.x.toFixed(3)}, ${camera.position.y.toFixed(3)}, ${camera.position.z.toFixed(3)})`);

// Camera should NOT immediately jump to target + offset (0, 8, 12), it should move gradually
if (camera.position.y === 8 && camera.position.z === 12) {
  throw new Error('Camera snapped immediately to target position instead of lerping smoothly!');
}
if (camera.position.distanceTo(initialCamPos) === 0) {
  throw new Error('Camera did not move towards target!');
}
console.log('✅ Camera lerps smoothly without snapping!');

// Test 2: Following moving target
console.log('\n[Test 2] Testing camera following a moving target over 60 frames...');
testTarget.position.set(10, 0, 20); // target moves
for (let i = 0; i < 120; i++) {
  controller.update(1 / 60);
}
const desiredPos = new THREE.Vector3().copy(testTarget.position).add(new THREE.Vector3(0, 8, 12));
const distanceToDesired = camera.position.distanceTo(desiredPos);
console.log(`Desired Cam Pos: (${desiredPos.x}, ${desiredPos.y}, ${desiredPos.z})`);
console.log(`Current Cam Pos: (${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)})`);
console.log(`Distance to desired: ${distanceToDesired.toFixed(3)}`);

if (distanceToDesired > 0.5) {
  throw new Error(`Camera failed to converge to target + offset. Distance: ${distanceToDesired}`);
}
console.log('✅ Camera smoothly converges and follows the moving target!');

// Test 3: Camera Shake and decay to zero
console.log('\n[Test 3] Testing camera shake triggering and decay over 0.3s...');
controller.shake(1.0, 0.3); // 1.0 intensity, 0.3s duration
if (controller.shakeTimer !== 0.3 || controller.shakeIntensity !== 1.0) {
  throw new Error('Shake parameters not initialized properly');
}

// Update for 0.1s (6 frames) -> shake should be active
for (let i = 0; i < 6; i++) {
  controller.update(1 / 60);
}
console.log(`Shake at 0.1s: timer = ${controller.shakeTimer.toFixed(2)}s, offset length = ${controller.shakeOffset.length().toFixed(3)}`);
if (controller.shakeOffset.length() === 0) {
  throw new Error('Shake offset is 0 while shake is active!');
}

// Update until past 0.3s (20 more frames) -> shake should decay to exactly 0
for (let i = 0; i < 20; i++) {
  controller.update(1 / 60);
}
console.log(`Shake after 0.4s: timer = ${controller.shakeTimer}s, offset length = ${controller.shakeOffset.length()}`);
if (controller.shakeTimer !== 0 || controller.shakeOffset.length() !== 0) {
  throw new Error('Camera shake did not decay to zero!');
}
console.log('✅ Camera shake works dynamically and cleanly decays to zero!');

// Test 4: Enforce minimum Y = 2 (prevent ground clipping)
console.log('\n[Test 4] Testing minimum camera height clamp (Y >= 2.0)...');
testTarget.position.set(0, -50, 0); // target falls into deep pit
controller.offset.set(0, 0, 0); // offset set to 0
for (let i = 0; i < 100; i++) {
  controller.update(1 / 60);
}
console.log(`Camera Y clamped at: ${camera.position.y}`);
if (camera.position.y < 2.0) {
  throw new Error(`Camera dipped below ground level! Y = ${camera.position.y}`);
}
console.log('✅ Camera never dips below minimum Y = 2.0!');

console.log('\n✨ ALL BATCH 9 ACCEPTANCE CRITERIA PASSED! ✨');
