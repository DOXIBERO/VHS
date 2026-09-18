import { SaveSystem } from '../src/core/SaveSystem.js';
import { DataManager } from '../src/core/DataManager.js';
import { eventBus } from '../src/core/EventBus.js';

// Mock localStorage for Node.js test environment
const mockStorage = new Map();
global.localStorage = {
  getItem: (k) => mockStorage.get(k) || null,
  setItem: (k, v) => mockStorage.set(k, String(v)),
  removeItem: (k) => mockStorage.delete(k),
  clear: () => mockStorage.clear()
};

function assert(condition, message) {
  if (!condition) {
    console.error('❌ FAIL:', message);
    process.exit(1);
  } else {
    console.log('✅ PASS:', message);
  }
}

console.log('--- Testing Parts 0021-0030: SaveSystem ---');
const saveSystem = new SaveSystem();
assert(saveSystem.version === '1.0.0', 'Save version is "1.0.0"');

// 1. Test save & load roundtrip
const mockProfile = {
  totalWordsLearned: 15,
  currentStreak: 4,
  longestStreak: 7,
  wordsMastered: ['rot', 'blau'],
  sessionHistory: [{ date: new Date().toISOString(), wordsReviewed: 10, accuracy: 90 }],
  settings: { language: 'de', audioVolume: 0.8, sensitivity: 1.2 }
};
const mockSrs = {
  getState: () => ({ rot: { interval: 6, easeFactor: 2.6 } })
};

saveSystem.save(mockProfile, mockSrs);
const loaded = saveSystem.load();
assert(loaded.version === '1.0.0', 'Loaded version matches 1.0.0');
assert(loaded.profile.totalWordsLearned === 15, 'Loaded profile matches saved profile data');
assert(loaded.profile.wordsMastered.includes('rot'), 'wordsMastered preserved identically');
assert(loaded.srs.rot.interval === 6, 'SRS card state preserved identically');

// 2. Test corrupted data fallback
localStorage.setItem('wackel_beans_save', '{{corrupted-json@@!!');
const corruptedLoad = saveSystem.load();
assert(corruptedLoad !== null && corruptedLoad.version === '1.0.0', 'Corrupted localStorage does not crash game (falls back to defaults)');
assert(Array.isArray(corruptedLoad.profile.wordsMastered), 'Default fallback has valid structure');

// 3. Test exportJSON
const exported = saveSystem.exportJSON(mockProfile, mockSrs);
assert(typeof exported === 'string' && exported.includes('"version": "1.0.0"'), 'exportJSON() returns valid downloadable JSON string');

// 4. Test importJSON
const imported = saveSystem.importJSON(exported);
assert(imported.profile.totalWordsLearned === 15, 'importJSON() restores data correctly');

console.log('--- Testing Parts 0031-0040: DataManager Wiring ---');
localStorage.clear();

let dataReadyFired = false;
eventBus.on('data:ready', (data) => {
  dataReadyFired = true;
  assert(data.profile && data.srs && data.vocab && data.rules, 'data:ready payload contains profile, srs, vocab, and rules');
});

const dataManager = new DataManager();
assert(dataReadyFired, "EventBus 'data:ready' fires after initialization");
assert(dataManager.vocabularyDB !== undefined, 'VocabularyDB initialized');
assert(dataManager.srsEngine !== undefined, 'SRSEngine initialized');
assert(dataManager.playerProfile !== undefined, 'PlayerProfile initialized');
assert(dataManager.roundConfig !== undefined, 'RoundConfig initialized');
assert(dataManager.obstacleRegistry !== undefined, 'ObstacleRegistry initialized');
assert(dataManager.levelTemplates !== undefined, 'LevelTemplates initialized');
assert(dataManager.gameRules !== undefined, 'GameRules initialized');
assert(dataManager.saveSystem !== undefined, 'SaveSystem initialized');

// Test simulated player:answer event updates SRS and Profile
eventBus.emit('player:answer', { wordId: 'rot', isCorrect: true, quality: 5 });
assert(dataManager.srsEngine.getCard('rot').interval === 1, "Simulated 'player:answer' updates SRSEngine interval to 1");
assert(dataManager.playerProfile.currentStreak === 1, "Simulated 'player:answer' increments streak in PlayerProfile");

// Test incorrect answer resets streak
eventBus.emit('player:answer', { wordId: 'blau', isCorrect: false, quality: 0 });
assert(dataManager.playerProfile.currentStreak === 0, "Simulated wrong 'player:answer' breaks streak in PlayerProfile");

dataManager.saveSystem.stopAutoSave();

console.log('🎉 ALL ACCEPTANCE CRITERIA FOR PARTS 0021-0040 PASSED PERFECTLY!');
