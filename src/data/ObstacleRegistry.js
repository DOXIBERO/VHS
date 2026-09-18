export const OBSTACLES = [
  {
    type: 'DOOR_GATE',
    name: 'Word Door Gate',
    difficulty: 1,
    spaceRequired: { width: 18, length: 3, height: 7 },
    wordInteraction: true,
    physicsType: 'static',
    description: '3 doors labeled with German words; crash through the correct one'
  },
  {
    type: 'MOVING_PLATFORM',
    name: 'Sliding Platform',
    difficulty: 1,
    spaceRequired: { width: 8, length: 8, height: 1 },
    wordInteraction: false,
    physicsType: 'moving',
    description: 'Hazard-striped platform oscillating horizontally'
  },
  {
    type: 'SWINGING_HAMMER',
    name: 'Giant Pendulum Hammer',
    difficulty: 2,
    spaceRequired: { width: 14, length: 6, height: 10 },
    wordInteraction: false,
    physicsType: 'dynamic',
    description: 'Large pendulum swinging across the track'
  },
  {
    type: 'SLIME_ZONE',
    name: 'Sticky Slime Floor',
    difficulty: 1,
    spaceRequired: { width: 16, length: 12, height: 0.2 },
    wordInteraction: false,
    physicsType: 'static',
    description: 'Slows player down and increases damping'
  },
  {
    type: 'CONVEYOR_BELT',
    name: 'Conveyor Runway',
    difficulty: 2,
    spaceRequired: { width: 6, length: 20, height: 0.5 },
    wordInteraction: false,
    physicsType: 'moving',
    description: 'Pushes player forward or backward with constant force'
  },
  {
    type: 'BUMPER',
    name: 'Inflatable Pinball Bumper',
    difficulty: 1,
    spaceRequired: { width: 3, length: 3, height: 3 },
    wordInteraction: false,
    physicsType: 'static',
    description: 'Bounces beans radially with high restitution'
  },
  {
    type: 'TRAMPOLINE',
    name: 'Bouncy Trampoline Pad',
    difficulty: 1,
    spaceRequired: { width: 6, length: 6, height: 0.5 },
    wordInteraction: false,
    physicsType: 'static',
    description: 'Launches beans high into the air'
  },
  {
    type: 'ICE_FLOOR',
    name: 'Slippery Ice Patch',
    difficulty: 2,
    spaceRequired: { width: 18, length: 15, height: 0.1 },
    wordInteraction: false,
    physicsType: 'static',
    description: 'Near-zero friction causing comedic slides'
  },
  {
    type: 'LAVA_FLOOR',
    name: 'Hot Lava Trap',
    difficulty: 3,
    spaceRequired: { width: 18, length: 10, height: 0.2 },
    wordInteraction: false,
    physicsType: 'static',
    description: 'Causes bean respawn when touched'
  },
  {
    type: 'SPINNING_LOG',
    name: 'Rotating Rollers',
    difficulty: 2,
    spaceRequired: { width: 18, length: 4, height: 4 },
    wordInteraction: false,
    physicsType: 'moving',
    description: 'Cylindrical log rotating continuously'
  },
  {
    type: 'FALLING_BLOCKS',
    name: 'Crumbling Steps',
    difficulty: 2,
    spaceRequired: { width: 12, length: 12, height: 2 },
    wordInteraction: false,
    physicsType: 'dynamic',
    description: 'Blocks that drop when stepped on'
  },
  {
    type: 'WIND_TUNNEL',
    name: 'Giant Fan Blowers',
    difficulty: 2,
    spaceRequired: { width: 18, length: 12, height: 6 },
    wordInteraction: false,
    physicsType: 'dynamic',
    description: 'Lateral wind pushing beans off balance'
  },
  {
    type: 'WORD_BRIDGE',
    name: 'Vocabulary Stepping Bridge',
    difficulty: 2,
    spaceRequired: { width: 8, length: 24, height: 2 },
    wordInteraction: true,
    physicsType: 'static',
    description: 'Step only on planks corresponding to heard German words'
  },
  {
    type: 'COLOR_SORT',
    name: 'Color Gate Filter',
    difficulty: 1,
    spaceRequired: { width: 18, length: 6, height: 6 },
    wordInteraction: true,
    physicsType: 'static',
    description: 'Pass through the gate matching the announced color'
  },
  {
    type: 'COUNTING_ZONE',
    name: 'Number Hop Challenge',
    difficulty: 1,
    spaceRequired: { width: 18, length: 15, height: 2 },
    wordInteraction: true,
    physicsType: 'static',
    description: 'Jump on numbered pads in spoken German order'
  }
];

export class ObstacleRegistry {
  static getAll() {
    return OBSTACLES;
  }

  static getByType(type) {
    return OBSTACLES.find(o => o.type === type) || null;
  }

  static getByDifficulty(difficulty) {
    return OBSTACLES.filter(o => o.difficulty === difficulty);
  }
}
