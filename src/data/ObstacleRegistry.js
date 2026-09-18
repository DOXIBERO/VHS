export const OBSTACLES = [
  { type: 'DOOR_GATE', name: 'Door Gate', difficulty: 1, spaceRequired: [12, 4, 6], wordInteraction: true, physicsType: 'static', description: '3-4 doors, only correct German word door breaks open' },
  { type: 'MOVING_PLATFORM', name: 'Moving Platform', difficulty: 2, spaceRequired: [6, 15, 2], wordInteraction: false, physicsType: 'moving', description: 'Platform sliding between points' },
  { type: 'SWINGING_HAMMER', name: 'Swinging Hammer', difficulty: 2, spaceRequired: [8, 8, 10], wordInteraction: false, physicsType: 'dynamic', description: 'Giant pendulum hammer swinging across path' },
  { type: 'SLIME_ZONE', name: 'Slime Zone', difficulty: 1, spaceRequired: [15, 20, 1], wordInteraction: false, physicsType: 'static', description: 'Sticky floor zone that slows bean movement' },
  { type: 'CONVEYOR_BELT', name: 'Conveyor Belt', difficulty: 2, spaceRequired: [6, 25, 1], wordInteraction: false, physicsType: 'static', description: 'Fast moving belt pushing beans forward or back' },
  { type: 'BUMPER', name: 'Bumper', difficulty: 1, spaceRequired: [3, 3, 3], wordInteraction: false, physicsType: 'static', description: 'High-bounce pinball bumper' },
  { type: 'TRAMPOLINE', name: 'Trampoline', difficulty: 1, spaceRequired: [5, 5, 1], wordInteraction: false, physicsType: 'static', description: 'Launches beans high into the air' },
  { type: 'ICE_FLOOR', name: 'Ice Floor', difficulty: 2, spaceRequired: [15, 30, 1], wordInteraction: false, physicsType: 'static', description: 'Ultra-low friction sliding surface' },
  { type: 'LAVA_FLOOR', name: 'Lava Floor', difficulty: 3, spaceRequired: [20, 20, 1], wordInteraction: true, physicsType: 'static', description: 'Floor drops unless standing on named German tile' },
  { type: 'SPINNING_LOG', name: 'Spinning Log', difficulty: 2, spaceRequired: [4, 18, 4], wordInteraction: false, physicsType: 'moving', description: 'Rotating cylinder beam beans must jump over' },
  { type: 'FALLING_BLOCKS', name: 'Falling Blocks', difficulty: 3, spaceRequired: [12, 20, 8], wordInteraction: false, physicsType: 'dynamic', description: 'Hexagonal blocks that drop after being stepped on' },
  { type: 'WIND_TUNNEL', name: 'Wind Tunnel', difficulty: 2, spaceRequired: [8, 25, 6], wordInteraction: false, physicsType: 'static', description: 'Turbine blowing beans off the track' },
  { type: 'WORD_BRIDGE', name: 'Word Bridge', difficulty: 2, spaceRequired: [5, 20, 2], wordInteraction: true, physicsType: 'static', description: 'Narrow bridge with correct German syllable planks' },
  { type: 'COLOR_SORT', name: 'Color Sort Arena', difficulty: 1, spaceRequired: [16, 16, 2], wordInteraction: true, physicsType: 'static', description: 'Tiles lighting up per German color word' },
  { type: 'COUNTING_ZONE', name: 'Counting Zone', difficulty: 1, spaceRequired: [14, 14, 2], wordInteraction: true, physicsType: 'static', description: 'Stepping on numbered tiles per spoken German number' }
];

export class ObstacleRegistry {
  static getAll() {
    return OBSTACLES;
  }

  static getByType(type) {
    return OBSTACLES.find(o => o.type === type) || null;
  }

  static getByDifficulty(level) {
    return OBSTACLES.filter(o => o.difficulty === level);
  }
}
