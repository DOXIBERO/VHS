import { VocabularyDB } from './VocabularyDB.js';

export const ROUND_PRESETS = [
  {
    roundId: 1,
    name: 'Colors Sprint',
    mode: 'race',
    duration: 60,
    difficulty: 1,
    playerCount: 1,
    botCount: 3,
    wordPool: ['rot', 'blau', 'gruen', 'gelb', 'weiss', 'schwarz'],
    obstacleSequence: ['DOOR_GATE', 'DOOR_GATE', 'DOOR_GATE']
  },
  {
    roundId: 2,
    name: 'Number Dash',
    mode: 'race',
    duration: 90,
    difficulty: 1,
    playerCount: 1,
    botCount: 4,
    wordPool: ['eins', 'zwei', 'drei', 'vier', 'fuenf', 'sechs', 'sieben', 'acht', 'neun', 'zehn'],
    obstacleSequence: ['DOOR_GATE', 'BUMPER', 'DOOR_GATE', 'DOOR_GATE']
  },
  {
    roundId: 3,
    name: 'Direction Run',
    mode: 'race',
    duration: 90,
    difficulty: 2,
    playerCount: 1,
    botCount: 5,
    wordPool: ['links', 'rechts', 'oben', 'unten', 'springen', 'laufen', 'stoppen'],
    obstacleSequence: ['DOOR_GATE', 'MOVING_PLATFORM', 'DOOR_GATE', 'SWINGING_HAMMER', 'DOOR_GATE']
  },
  {
    roundId: 4,
    name: 'Food & Objects Rush',
    mode: 'race',
    duration: 120,
    difficulty: 2,
    playerCount: 1,
    botCount: 6,
    wordPool: ['apfel', 'brot', 'wasser', 'kaffee', 'doener', 'tisch', 'stuhl', 'tuer', 'fenster'],
    obstacleSequence: ['DOOR_GATE', 'SLIME_ZONE', 'DOOR_GATE', 'CONVEYOR_BELT', 'DOOR_GATE']
  },
  {
    roundId: 5,
    name: 'Berlin Master Championship',
    mode: 'race',
    duration: 120,
    difficulty: 3,
    playerCount: 1,
    botCount: 8,
    wordPool: VocabularyDB.getAllWords().map(w => w.id),
    obstacleSequence: [
      'DOOR_GATE', 'SWINGING_HAMMER', 'DOOR_GATE', 'SPINNING_LOG', 
      'DOOR_GATE', 'MOVING_PLATFORM', 'DOOR_GATE'
    ]
  }
];

export class RoundConfig {
  static getRound(roundId) {
    return ROUND_PRESETS.find(r => r.roundId === roundId) || null;
  }

  static getAllRounds() {
    return ROUND_PRESETS;
  }
}
