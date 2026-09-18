import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { PhysicsWorld } from '../src/physics/PhysicsWorld.js';
import { PhysicsMaterials } from '../src/physics/PhysicsMaterials.js';

function assert(condition, message) {
  if (!condition) {
    console.error('❌ FAIL:', message);
    process.exit(1);
  } else {
    console.log('✅ PASS:', message);
  }
}

console.log('--- Testing Part 0091-0100: PhysicsMaterials ---');
const mats = new PhysicsMaterials();
assert(mats.BEAN instanceof CANNON.Material, 'BEAN material defined');
assert(mats.GROUND instanceof CANNON.Material, 'GROUND material defined');
assert(mats.ICE instanceof CANNON.Material, 'ICE material defined');
assert(mats.SLIME instanceof CANNON.Material, 'SLIME material defined');
assert(mats.RUBBER instanceof CANNON.Material, 'RUBBER material defined');

const beanIce = mats.contactMaterials.find(cm => 
  (cm.materials[0] === mats.BEAN && cm.materials[1] === mats.ICE) ||
  (cm.materials[0] === mats.ICE && cm.materials[1] === mats.BEAN)
);
assert(beanIce && beanIce.friction < 0.05, `Contact material between BEAN and ICE has friction < 0.05 (got ${beanIce?.friction})`);

const beanRubber = mats.contactMaterials.find(cm => 
  (cm.materials[0] === mats.BEAN && cm.materials[1] === mats.RUBBER) ||
  (cm.materials[0] === mats.RUBBER && cm.materials[1] === mats.BEAN)
);
assert(beanRubber && beanRubber.restitution > 0.8, `Contact material between BEAN and RUBBER has restitution > 0.8 (got ${beanRubber?.restitution})`);

console.log('--- Testing Part 0083-0090: PhysicsWorld & Falling Sphere Simulation ---');
const physicsWorld = new PhysicsWorld();
assert(physicsWorld.world.gravity.y === -9.82, 'Physics world gravity set to (0, -9.82, 0)');

// Test falling sphere
const sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(0.8), new THREE.MeshBasicMaterial());
const sphereBody = new CANNON.Body({
  mass: 1.0,
  shape: new CANNON.Sphere(0.8),
  position: new CANNON.Vec3(0, 10, 0),
  material: physicsWorld.materials.BEAN
});
physicsWorld.addBody(sphereBody, sphereMesh);

assert(sphereBody.position.y === 10, 'Sphere starts at Y=10');

// Step physics 360 frames (6 seconds at 60fps to allow bounces to settle)
for (let i = 0; i < 360; i++) {
  physicsWorld.step(1 / 60);
}

console.log(`Sphere settled position: Y = ${sphereBody.position.y.toFixed(3)}`);
assert(sphereBody.position.y >= 0.79 && sphereBody.position.y <= 0.82, 'Sphere falls under gravity and rests exactly on ground at radius ~0.8');
assert(Math.abs(sphereMesh.position.y - sphereBody.position.y) < 0.001, 'Visual Three.js mesh position matches physics body position');
assert(Math.abs(sphereBody.velocity.y) < 0.05, 'Sphere stops moving once settled');

console.log('🎉 ALL ACCEPTANCE CRITERIA FOR PARTS 0083-0100 PASSED PERFECTLY!');
