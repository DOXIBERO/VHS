export const LEVEL_TEMPLATES = [
  {
    templateId: 'kreuzberg-colors',
    name: 'Kreuzberg Colors',
    theme: 'berlin-street',
    segments: [
      { obstacleType: 'DOOR_GATE', position: [0, 0, -15], rotation: [0, 0, 0], config: { wordPool: ['rot', 'blau', 'gruen'] } },
      { obstacleType: 'SLIME_ZONE', position: [0, 0, -35], rotation: [0, 0, 0], config: {} },
      { obstacleType: 'DOOR_GATE', position: [0, 0, -55], rotation: [0, 0, 0], config: { wordPool: ['gelb', 'weiss', 'schwarz'] } }
    ]
  },
  {
    templateId: 'spaeti-numbers',
    name: 'Späti Numbers',
    theme: 'kiosk-market',
    segments: [
      { obstacleType: 'COUNTING_ZONE', position: [0, 0, -20], rotation: [0, 0, 0], config: { numbers: [1, 2, 3, 4] } },
      { obstacleType: 'CONVEYOR_BELT', position: [0, 0, -40], rotation: [0, 0, 0], config: { speed: 4 } },
      { obstacleType: 'TRAMPOLINE', position: [0, 0, -60], rotation: [0, 0, 0], config: { force: 15 } }
    ]
  },
  {
    templateId: 'ubahn-directions',
    name: 'U-Bahn Directions',
    theme: 'metro-station',
    segments: [
      { obstacleType: 'MOVING_PLATFORM', position: [0, 0, -20], rotation: [0, 0, 0], config: {} },
      { obstacleType: 'DOOR_GATE', position: [0, 0, -45], rotation: [0, 0, 0], config: { wordPool: ['links', 'rechts'] } },
      { obstacleType: 'SPINNING_LOG', position: [0, 0, -65], rotation: [0, 0, 0], config: { speed: 2 } }
    ]
  }
];

export class LevelTemplates {
  static getTemplate(templateId) {
    return LEVEL_TEMPLATES.find(t => t.templateId === templateId) || LEVEL_TEMPLATES[0];
  }

  static getAllTemplates() {
    return LEVEL_TEMPLATES;
  }
}
