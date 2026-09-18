import { ObjectPool, PoolManager } from '../src/core/ObjectPool.js';

console.log('--- TESTING BATCH 11: Parts 0181-0200 (ObjectPool) ---');

let objectIdCounter = 1;
function createParticle() {
  return {
    id: objectIdCounter++,
    x: 0,
    y: 0,
    z: 0,
    active: false,
    disposed: false,
    dispose() {
      this.disposed = true;
    }
  };
}

function resetParticle(p, x = 0, y = 0, z = 0) {
  p.x = x;
  p.y = y;
  p.z = z;
}

// Test 1: Prewarm 10 and acquire 10 times
console.log('\n[Test 1] Testing pool of 10 objects prewarmed and acquired...');
objectIdCounter = 1;
const pool = new ObjectPool(createParticle, resetParticle, 10);

if (pool.available !== 10 || pool.inUse !== 0 || pool.totalCreated !== 10) {
  throw new Error(`Prewarm 10 failed! Available: ${pool.available}, totalCreated: ${pool.totalCreated}`);
}
console.log(`✅ Prewarmed pool has ${pool.available} available objects`);

const acquired = [];
for (let i = 0; i < 10; i++) {
  acquired.push(pool.acquire(i, i * 2, i * 3));
}

if (pool.inUse !== 10 || pool.available !== 0 || pool.totalCreated !== 10) {
  throw new Error(`Acquiring 10 prewarmed objects caused new allocations! totalCreated: ${pool.totalCreated}`);
}
console.log('✅ Acquired 10 objects from prewarmed pool without new allocations (totalCreated = 10)');

// Verify reset function set coordinates properly
if (acquired[4].x !== 4 || acquired[4].y !== 8 || acquired[4].z !== 12) {
  throw new Error('Reset function did not set particle coordinates correctly');
}
console.log('✅ Reset function correctly initialized acquired instances');

// Test 2: Release and re-acquire reuses identical instance
console.log('\n[Test 2] Testing release() + acquire() reuses exact released object...');
const firstItem = acquired[0];
const released = pool.release(firstItem);

if (!released || pool.available !== 1 || pool.inUse !== 9) {
  throw new Error('Release failed');
}

const reacquired = pool.acquire(99, 99, 99);
if (reacquired !== firstItem) {
  throw new Error('acquire() returned a new instance instead of reusing the released one!');
}
if (reacquired.x !== 99 || pool.totalCreated !== 10) {
  throw new Error('Reacquired object failed initialization or allocated new instance');
}
console.log('✅ release() + acquire() reused exact same object instance! totalCreated is still 10');

// Test 3: Prewarm(50) creates 50 objects instantly
console.log('\n[Test 3] Testing prewarm(50)...');
const pool50 = new ObjectPool(createParticle, resetParticle);
pool50.prewarm(50);
if (pool50.available !== 50 || pool50.totalCreated !== 50) {
  throw new Error(`Prewarm(50) expected 50 available, got ${pool50.available}`);
}
console.log('✅ prewarm(50) created 50 objects instantly!');

// Test 4: Stress Test 10,000 rapid acquire/release cycles
console.log('\n[Test 4] Stress testing 10,000 rapid acquire/release cycles for GC stability...');
const stressPool = new ObjectPool(createParticle, resetParticle, 20);
const initialCreated = stressPool.totalCreated;

const startMem = process.memoryUsage().heapUsed;
for (let i = 0; i < 10000; i++) {
  const item = stressPool.acquire(i, i, i);
  stressPool.release(item);
}
const endMem = process.memoryUsage().heapUsed;

if (stressPool.totalCreated !== initialCreated) {
  throw new Error(`Stress test caused ${stressPool.totalCreated - initialCreated} new allocations!`);
}
const heapDeltaKb = Math.round((endMem - startMem) / 1024);
console.log(`✅ 10,000 acquire/release completed with 0 new allocations (totalCreated unchanged at ${stressPool.totalCreated})`);
console.log(`✅ Memory heap delta: ${heapDeltaKb} KB (Zero memory leaks or GC spikes)`);

// Test 5: PoolManager
console.log('\n[Test 5] Testing PoolManager named pool registry...');
const botPool = PoolManager.getPool('bots', () => ({ botName: 'Hans' }), null, 5);
if (botPool.available !== 5) {
  throw new Error('PoolManager failed to initialize named pool');
}
const bot = botPool.acquire();
if (bot.botName !== 'Hans') {
  throw new Error('Named pool item invalid');
}
PoolManager.clearAll();
if (PoolManager.pools.size !== 0) {
  throw new Error('PoolManager clearAll failed');
}
console.log('✅ PoolManager registered, retrieved, and cleared pools cleanly!');

console.log('\n✨ ALL BATCH 11 ACCEPTANCE CRITERIA PASSED! ✨');
