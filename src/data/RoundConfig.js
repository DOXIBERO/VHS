export const PRESET_ROUNDS = [
  {
    roundId: 1,
    name: 'Kreuzberg Colors',
    mode: 'race',
    duration: 60,
    category: 'COLORS',
    wordPool: ['rot', 'blau', 'gruen', 'gelb', 'weiss', 'schwarz'],
    obstacleSequence: ['DOOR_GATE', 'SLIME_ZONE', 'DOOR_GATE'],
    difficulty: 1,
    playerCount: 1,
    botCount: 5
  },
  {
    roundId: 2,
    name: 'Späti Numbers',
    mode: 'race',
    duration: 90,
    category: 'NUMBERS',
    wordPool: ['eins', 'zwei', 'drei', 'vier', 'fuenf', 'sechs', 'sieben', 'acht', 'neun', 'zehn'],
    obstacleSequence: ['DOOR_GATE', 'CONVEYOR_BELT', 'DOOR_GATE', 'TRAMPOLINE'],
    difficulty: 1,
    playerCount: 1,
    botCount: 7
  },
  {
    roundId: 3,
    name: 'U-Bahn Directions',
    mode: 'survival',
    duration: 90,
    category: 'DIRECTIONS',
    wordPool: ['links', 'rechts', 'oben', 'unten'],
    obstacleSequence: ['MOVING_PLATFORM', 'DOOR_GATE', 'SPINNING_LOG'],
    difficulty: 2,
    playerCount: 1,
    botCount: 8
  },
  {
    roundId: 4,
    name: 'Döner Rush & Actions',
    mode: 'race',
    duration: 120,
    category: 'ACTIONS',
    wordPool: ['springen', 'laufen', 'stoppen', 'ducken', 'brot', 'wasser', 'doener'],
    obstacleSequence: ['SWINGING_HAMMER', 'DOOR_GATE', 'BUMPER', 'WORD_BRIDGE'],
    difficulty: 2,
    playerCount: 1,
    botCount: 10
  },
  {
    roundId: 5,
    name: 'Der Berlin Endspurt',
    mode: 'survival',
    duration: 120,
    category: 'ALL',
    wordPool: ['rot', 'blau', 'eins', 'zwei', 'links', 'rechts', 'springen', 'hallo', 'danke', 'ausgang'],
    obstacleSequence: ['DOOR_GATE', 'SWINGING_HAMMER', 'MOVING_PLATFORM', 'FALLING_BLOCKS', 'DOOR_GATE'],
    difficulty: 3,
    playerCount: 1,
    botCount: 12
  }
];

export class RoundConfig {
  static getRound(roundId) {
    return PRESET_ROUNDS.find(r => r.roundId === roundId) || PRESET_ROUNDS[0];
  }

  static getAllRounds() {
    return PRESET_ROUNDS;
  }
}
