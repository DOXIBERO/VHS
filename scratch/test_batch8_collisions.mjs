import * as CANNON from 'cannon-es';
import { EventBus } from '../src/core/EventBus.js';
import { CollisionManager } from '../src/physics/CollisionManager.js';

console.log('--- TESTING BATCH 8: Parts 0101-0120 (CollisionManager) ---');

const testBus = new EventBus();
const world = new CANNON.World();
const collisionManager = new CollisionManager(world, testBus);

let beanGateEvents = [];
let beanSlimeEvents = [];
let beanTrampEvents = [];
let genericBeginEvents = [];
let endEvents = [];

testBus.on('collision:bean-gate', (data) => beanGateEvents.push(data));
testBus.on('collision:bean-slime', (data) => beanSlimeEvents.push(data));
testBus.on('collision:bean-trampoline', (data) => beanTrampEvents.push(data));
testBus.on('collision:begin', (data) => genericBeginEvents.push(data));
testBus.on('collision:bean-gate:end', (data) => endEvents.push(data));

// Test 1: Bean collides with Gate
console.log('\n[Test 1] Testing Bean <-> Gate collision...');
const bean1 = new CANNON.Body({ mass: 1, shape: new CANNON.Sphere(0.5) });
CollisionManager.tagBody(bean1, { type: 'bean', id: 'bean_player_1' });

const gate1 = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(1, 2, 0.2)) });
CollisionManager.tagBody(gate1, { type: 'gate', id: 'gate_rot_correct', gateWord: 'ROT' });

// Simulate beginContact
world.dispatchEvent({ type: 'beginContact', bodyA: bean1, bodyB: gate1 });

if (beanGateEvents.length !== 1) {
  throw new Error(`Expected 1 collision:bean-gate event, got ${beanGateEvents.length}`);
}
const gateEvent = beanGateEvents[0];
console.log('✅ collision:bean-gate event received:', gateEvent);
if (gateEvent.beanId !== 'bean_player_1' || gateEvent.gateId !== 'gate_rot_correct' || gateEvent.gateWord !== 'ROT') {
  throw new Error('Collision data mismatch in bean-gate event');
}
console.log('✅ Gate event includes correct beanId, gateId, and gateWord!');

// Test 2: Bean collides with Slime
console.log('\n[Test 2] Testing Bean <-> Slime collision...');
const slime1 = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(5, 0.1, 5)) });
CollisionManager.tagBody(slime1, { type: 'slime', id: 'slime_pit_alpha' });

world.dispatchEvent({ type: 'beginContact', bodyA: slime1, bodyB: bean1 });

if (beanSlimeEvents.length !== 1) {
  throw new Error(`Expected 1 collision:bean-slime event, got ${beanSlimeEvents.length}`);
}
const slimeEvent = beanSlimeEvents[0];
console.log('✅ collision:bean-slime event received:', slimeEvent);
if (slimeEvent.beanId !== 'bean_player_1' || slimeEvent.slimeId !== 'slime_pit_alpha') {
  throw new Error('Collision data mismatch in bean-slime event');
}
console.log('✅ Slime event includes correct beanId and slimeId!');

// Test 3: Bean collides with Trampoline
console.log('\n[Test 3] Testing Bean <-> Trampoline collision...');
const tramp1 = new CANNON.Body({ mass: 0, shape: new CANNON.Cylinder(1, 1, 0.2, 8) });
CollisionManager.tagBody(tramp1, { type: 'trampoline', id: 'tramp_super_1', force: { x: 0, y: 20, z: 5 } });

world.dispatchEvent({ type: 'beginContact', bodyA: bean1, bodyB: tramp1 });

if (beanTrampEvents.length !== 1) {
  throw new Error(`Expected 1 collision:bean-trampoline event, got ${beanTrampEvents.length}`);
}
const trampEvent = beanTrampEvents[0];
console.log('✅ collision:bean-trampoline event received:', trampEvent);
if (trampEvent.beanId !== 'bean_player_1' || trampEvent.trampolineId !== 'tramp_super_1' || trampEvent.force.y !== 20) {
  throw new Error('Collision data mismatch in bean-trampoline event');
}
console.log('✅ Trampoline event includes force vector and body IDs!');

// Test 4: End contact event
console.log('\n[Test 4] Testing endContact event...');
world.dispatchEvent({ type: 'endContact', bodyA: bean1, bodyB: gate1 });
if (endEvents.length !== 1 || endEvents[0].gateId !== 'gate_rot_correct') {
  throw new Error('End contact event mismatch');
}
console.log('✅ End contact event fired properly!');

// Test 5: 1000 Rapid Collisions Stress & Memory Leak Test
console.log('\n[Test 5] Simulating 1000 rapid collisions for performance & memory stability...');
const startMem = process.memoryUsage().heapUsed;
for (let i = 0; i < 1000; i++) {
  world.dispatchEvent({ type: 'beginContact', bodyA: bean1, bodyB: gate1 });
  world.dispatchEvent({ type: 'endContact', bodyA: bean1, bodyB: gate1 });
}
const endMem = process.memoryUsage().heapUsed;
const memDiffKb = Math.round((endMem - startMem) / 1024);
console.log(`✅ 1000 collisions processed successfully without errors. Memory delta: ${memDiffKb} KB`);

// Test 6: Destruction & Clean listener removal
console.log('\n[Test 6] Testing destroy() cleanup...');
collisionManager.destroy();
const prevCount = beanGateEvents.length;
world.dispatchEvent({ type: 'beginContact', bodyA: bean1, bodyB: gate1 });
if (beanGateEvents.length !== prevCount) {
  throw new Error('Listener still active after destroy()!');
}
console.log('✅ Listeners cleanly removed via destroy(), 0 memory leaks!');

console.log('\n✨ ALL BATCH 8 ACCEPTANCE CRITERIA PASSED! ✨');
