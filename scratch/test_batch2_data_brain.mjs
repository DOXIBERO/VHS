import { VocabularyDB, VOCABULARY_LIST, VOCABULARY_CATEGORIES } from '../src/data/VocabularyDB.js';
import { SRSEngine } from '../src/data/SRSEngine.js';
import { PlayerProfile } from '../src/data/PlayerProfile.js';
import { RoundConfig } from '../src/data/RoundConfig.js';
import { ObstacleRegistry } from '../src/data/ObstacleRegistry.js';
import { LevelTemplates } from '../src/data/LevelTemplates.js';
import { GameRules } from '../src/data/GameRules.js';

function assert(condition, message) {
  if (!condition) {
    console.error('❌ FAIL:', message);
    process.exit(1);
  } else {
    console.log('✅ PASS:', message);
  }
}

console.log('--- Testing Parts 0008-0010: VocabularyDB ---');
const colors = VocabularyDB.getWordsByCategory('COLORS');
assert(colors.length === 6, "VocabularyDB.getWordsByCategory('COLORS') returns 6 words");

const rot = VocabularyDB.getWordById('rot');
assert(rot && rot.german === 'rot' && rot.english === 'red', "VocabularyDB.getWordById('rot') returns correct word");

const rand5 = VocabularyDB.getRandomWords(5);
assert(rand5.length === 5, 'VocabularyDB.getRandomWords(5) returns 5 words');
const uniqueRand = new Set(rand5.map(w => w.id));
assert(uniqueRand.size === 5, 'Random words are unique');

assert(VOCABULARY_LIST.length === 100, `Total word count = 100 (got ${VOCABULARY_LIST.length})`);
const categories = Object.keys(VOCABULARY_CATEGORIES);
assert(categories.length === 14, `14 categories exist (got ${categories.length})`);

const ids = new Set();
VOCABULARY_LIST.forEach(w => {
  assert(!ids.has(w.id), `No duplicate IDs: "${w.id}" is unique`);
  ids.add(w.id);
});

console.log('--- Testing Part 0011: SRSEngine ---');
const srs = new SRSEngine();
const cardInitial = srs.getCard('rot');
assert(cardInitial.interval === 0, 'First-time word has interval 0');

srs.recordAnswer('rot', 5);
assert(srs.getCard('rot').interval === 1, "recordAnswer('rot', 5) sets interval to 1");

srs.recordAnswer('rot', 0);
assert(srs.getCard('rot').interval === 0, "recordAnswer('rot', 0) resets interval to 0");
assert(srs.getCard('rot').easeFactor < 2.5, 'Lower quality lowers ease factor');

const dueWords = srs.getDueWords(5);
assert(dueWords.length > 0, 'getDueWords returns due words');

console.log('--- Testing Part 0012: PlayerProfile ---');
const profile = new PlayerProfile();
profile.completeWord('rot', 8);
assert(profile.wordsMastered.includes('rot'), "completeWord('rot') adds to wordsMastered when interval > 7");

profile.incrementStreak();
profile.incrementStreak();
assert(profile.currentStreak === 3, 'Streak increments correctly');
profile.breakStreak();
assert(profile.currentStreak === 0, 'breakStreak() resets currentStreak to 0');

profile.recordSessionAnswer(true);
profile.recordSessionAnswer(false);
const stats = profile.getSessionStats();
assert(stats.accuracy === 50, `getSessionStats() returns accuracy percentage (got ${stats.accuracy}%)`);

console.log('--- Testing Part 0013: RoundConfig ---');
const r1 = RoundConfig.getRound(1);
assert(r1 !== null, 'RoundConfig.getRound(1) returns valid config');
const allColors = r1.wordPool.every(id => VocabularyDB.getWordById(id).category === 'COLORS');
assert(allColors, 'Round 1 wordPool contains only color words');

const r5 = RoundConfig.getRound(5);
const r5Categories = new Set(r5.wordPool.map(id => VocabularyDB.getWordById(id).category));
assert(r5Categories.size === 14, 'Round 5 wordPool contains all 14 categories');

console.log('--- Testing Part 0014: ObstacleRegistry ---');
const allObs = ObstacleRegistry.getAll();
assert(allObs.length === 15, `ObstacleRegistry.getAll() returns 15 types (got ${allObs.length})`);
const diff1Obs = ObstacleRegistry.getByDifficulty(1);
assert(diff1Obs.every(o => o.difficulty === 1), 'ObstacleRegistry.getByDifficulty(1) returns only easy obstacles');
assert(ObstacleRegistry.getByType('DOOR_GATE').wordInteraction === true, 'DOOR_GATE has wordInteraction: true');
assert(ObstacleRegistry.getByType('BUMPER').wordInteraction === false, 'BUMPER has wordInteraction: false');

console.log('--- Testing Part 0015: LevelTemplates ---');
const kTemplate = LevelTemplates.getTemplate('kreuzberg-colors');
assert(kTemplate !== null, 'LevelTemplates.getTemplate("kreuzberg-colors") returns valid template');
const validObsTypes = kTemplate.segments.every(s => ObstacleRegistry.getByType(s.obstacleType) !== null);
assert(validObsTypes, 'Each template segment has an obstacleType in ObstacleRegistry');

console.log('--- Testing Parts 0016-0020: GameRules ---');
assert(GameRules.calculateScore('correct_gate', { streak: 3 }) === 200, 'GameRules calculates 2x streak score');
assert(GameRules.calculateScore('wrong_gate') === -50, 'GameRules calculates wrong_gate penalty -50');
assert(GameRules.getEliminationType() === 'soft', 'GameRules.getEliminationType() returns "soft"');
const winConds = GameRules.getWinConditions();
assert(winConds.race && winConds.survival && winConds.team, 'All win conditions defined');

console.log('🎉 ALL ACCEPTANCE CRITERIA FOR PARTS 0008-0020 PASSED PERFECTLY!');
