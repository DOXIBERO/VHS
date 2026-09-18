export const LEVEL_TEMPLATES = [
  {
    templateId: 'kreuzberg-colors',
    name: 'Kreuzberg Colors',
    theme: 'Berlin Kreuzberg Vibrant Street',
    segments: [
      { obstacleType: 'DOOR_GATE', position: { x: 0, y: 0, z: -20 }, rotation: 0, config: { target: 'rot', options: ['rot', 'blau', 'gruen'] } },
      { obstacleType: 'BUMPER', position: { x: -4, y: 0, z: -35 }, rotation: 0, config: {} },
      { obstacleType: 'BUMPER', position: { x: 4, y: 0, z: -35 }, rotation: 0, config: {} },
      { obstacleType: 'DOOR_GATE', position: { x: 0, y: 0, z: -50 }, rotation: 0, config: { target: 'gelb', options: ['gelb', 'schwarz', 'weiss'] } },
      { obstacleType: 'DOOR_GATE', position: { x: 0, y: 0, z: -75 }, rotation: 0, config: { target: 'blau', options: ['rot', 'blau', 'gruen'] } },
      { obstacleType: 'DOOR_GATE', position: { x: 0, y: 0, z: -100 }, rotation: 0, config: { target: 'gruen', options: ['weiss', 'gelb', 'gruen'] } }
    ]
  },
  {
    templateId: 'spaeti-numbers',
    name: 'Späti Numbers',
    theme: 'Late Night Späti Market Dash',
    segments: [
      { obstacleType: 'COUNTING_ZONE', position: { x: 0, y: 0, z: -20 }, rotation: 0, config: { target: 'eins' } },
      { obstacleType: 'CONVEYOR_BELT', position: { x: 0, y: 0, z: -40 }, rotation: 0, config: { speed: 4 } },
      { obstacleType: 'COUNTING_ZONE', position: { x: 0, y: 0, z: -65 }, rotation: 0, config: { target: 'zwei' } },
      { obstacleType: 'DOOR_GATE', position: { x: 0, y: 0, z: -85 }, rotation: 0, config: { target: 'drei', options: ['eins', 'zwei', 'drei'] } }
    ]
  },
  {
    templateId: 'ubahn-directions',
    name: 'U-Bahn Directions',
    theme: 'Underground Metro Rush',
    segments: [
      { obstacleType: 'DOOR_GATE', position: { x: 0, y: 0, z: -25 }, rotation: 0, config: { target: 'links', options: ['links', 'rechts'] } },
      { obstacleType: 'MOVING_PLATFORM', position: { x: 0, y: 0, z: -45 }, rotation: 0, config: { distance: 6, speed: 2 } },
      { obstacleType: 'DOOR_GATE', position: { x: 0, y: 0, z: -70 }, rotation: 0, config: { target: 'rechts', options: ['links', 'rechts'] } },
      { obstacleType: 'MOVING_PLATFORM', position: { x: 0, y: 0, z: -90 }, rotation: 0, config: { distance: 8, speed: 3 } }
    ]
  }
];

export class LevelTemplates {
  static getTemplate(templateId) {
    return LEVEL_TEMPLATES.find(t => t.templateId === templateId) || null;
  }

  static getAll() {
    return LEVEL_TEMPLATES;
  }
}
