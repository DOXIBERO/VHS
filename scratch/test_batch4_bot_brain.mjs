import { BotPresets, BOT_PRESETS } from '../src/data/BotPresets.js';
import { BotBrain } from '../src/player/BotBrain.js';

function assert(condition, message) {
  if (!condition) {
    console.error('❌ FAIL:', message);
    process.exit(1);
  } else {
    console.log('✅ PASS:', message);
  }
}

console.log('--- Testing Part 0041-0060: BotPresets ---');
assert(BOT_PRESETS.length === 10, `10 bot presets exist (got ${BOT_PRESETS.length})`);

const presetNames = new Set();
BOT_PRESETS.forEach(p => {
  assert(!presetNames.has(p.name), `Unique bot name: "${p.name}"`);
  presetNames.add(p.name);
  assert(typeof p.skillLevel === 'number' && p.skillLevel >= 0 && p.skillLevel <= 1, `${p.name} has valid skillLevel (${p.skillLevel})`);
});

const hansPreset = BotPresets.getByName('Hans');
assert(hansPreset && hansPreset.skillLevel === 0.90, 'Hans preset found with skillLevel 0.90');

const fritzPreset = BotPresets.getByName('Fritz');
assert(fritzPreset && fritzPreset.skillLevel === 0.30, 'Fritz preset found with skillLevel 0.30');

console.log('--- Testing Part 0041-0060: BotBrain Decisions ---');
const dummyGate = { target: 'rot', options: ['rot', 'blau', 'gruen'] };

// Test BotBrain.decide returns 'correct' or 'wrong'
const testBot = new BotBrain({ skillLevel: 0.5 });
const decision = testBot.decide(dummyGate);
assert(decision === 'correct' || decision === 'wrong', `BotBrain.decide returns 'correct' or 'wrong' (got ${decision})`);

// Statistical Simulation of skill 0.9 bot (Hans) over 10,000 iterations
console.log('--- Simulating 10,000 runs for Skill 0.9 Bot ---');
const hansBot = new BotBrain({ skillLevel: 0.90 });
let hansCorrect = 0;
const SIM_RUNS = 10000;
for (let i = 0; i < SIM_RUNS; i++) {
  if (hansBot.decide(dummyGate) === 'correct') {
    hansCorrect++;
  }
}
const hansAccuracy = (hansCorrect / SIM_RUNS) * 100;
console.log(`Hans (Skill 0.9) accuracy: ${hansAccuracy.toFixed(2)}%`);
assert(hansAccuracy >= 88 && hansAccuracy <= 92, `A skill 0.9 bot answers correctly ~90% of the time (got ${hansAccuracy.toFixed(2)}%)`);

// Statistical Simulation of skill 0.2 bot (Lina) over 10,000 iterations
console.log('--- Simulating 10,000 runs for Skill 0.2 Bot ---');
const linaBot = new BotBrain({ skillLevel: 0.20 });
let linaCorrect = 0;
for (let i = 0; i < SIM_RUNS; i++) {
  if (linaBot.decide(dummyGate) === 'correct') {
    linaCorrect++;
  }
}
const linaAccuracy = (linaCorrect / SIM_RUNS) * 100;
console.log(`Lina (Skill 0.2) accuracy: ${linaAccuracy.toFixed(2)}%`);
assert(linaAccuracy >= 18 && linaAccuracy <= 22, `A skill 0.2 bot answers correctly ~20% of the time (got ${linaAccuracy.toFixed(2)}%)`);

console.log('🎉 ALL ACCEPTANCE CRITERIA FOR PARTS 0041-0060 PASSED PERFECTLY!');
