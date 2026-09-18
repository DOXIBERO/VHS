import { EventBus } from '../src/core/EventBus.js';
import { AssetLoader } from '../src/core/AssetLoader.js';

console.log('--- TESTING BATCH 10: Parts 0151-0180 (AssetLoader & Loading Screen) ---');

const testBus = new EventBus();
const loader = new AssetLoader(testBus);

let progressEvents = [];
let completeEvents = [];
let errorEvents = [];

testBus.on('loading:progress', (e) => progressEvents.push(e));
testBus.on('loading:complete', (e) => completeEvents.push(e));
testBus.on('loading:error', (e) => errorEvents.push(e));

// Test 1: LoadingManager progress tracking
console.log('\n[Test 1] Testing LoadingManager progress & complete events...');
loader.manager.onStart('textures/grass.png', 1, 2);
loader.manager.onProgress('textures/grass.png', 1, 2);

if (progressEvents.length < 2 || progressEvents[progressEvents.length - 1].percent !== 50) {
  throw new Error(`Expected progress event at 50%, got ${JSON.stringify(progressEvents)}`);
}
console.log('✅ LoadingManager progress event received: 50%');

loader.manager.onLoad();
if (completeEvents.length !== 1 || !completeEvents[0].success) {
  throw new Error('Expected loading:complete event not triggered!');
}
console.log('✅ LoadingManager complete event received!');

// Test 2: Error handling without crashing
console.log('\n[Test 2] Testing failed asset load graceful handling (no crashes)...');
loader.manager.onError('models/missing_bean.gltf');
if (errorEvents.length !== 1 || !errorEvents[0].url.includes('missing_bean.gltf')) {
  throw new Error('Error event not dispatched correctly');
}
console.log('✅ Failed asset load logged error and emitted event cleanly without crashing!');

// Test 3: Cache management
console.log('\n[Test 3] Testing asset cache store and retrieval...');
loader.cache.set('textures/test.png', { isTexture: true, id: 'test_tex' });
if (!loader.has('textures/test.png') || loader.get('textures/test.png').id !== 'test_tex') {
  throw new Error('Cache retrieval failed');
}
console.log('✅ Cache get/has works properly!');

loader.clearCache();
if (loader.has('textures/test.png')) {
  throw new Error('Cache clear failed');
}
console.log('✅ Cache clear works properly!');

// Test 4: Asynchronous non-fatal load methods
console.log('\n[Test 4] Testing loadGLTF / loadAudio fallback for missing files (graceful resolution)...');
const fakeGltf = await loader.loadGLTF('https://localhost:9999/non_existent.glb');
if (fakeGltf !== null) {
  throw new Error('Expected null return on failed load');
}
console.log('✅ loadGLTF handled non-existent file gracefully and returned null without crashing!');

console.log('\n✨ ALL BATCH 10 ACCEPTANCE CRITERIA PASSED! ✨');
