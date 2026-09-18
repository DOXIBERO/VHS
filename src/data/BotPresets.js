export const BOT_PRESETS = [
  {
    name: 'Hans',
    skillLevel: 0.90,
    reactionTime: 250,
    wobbleIntensity: 0.3,
    aggression: 0.2,
    color: 0x2288EE
  },
  {
    name: 'Greta',
    skillLevel: 0.85,
    reactionTime: 300,
    wobbleIntensity: 0.4,
    aggression: 0.1,
    color: 0xEE4488
  },
  {
    name: 'Lukas',
    skillLevel: 0.75,
    reactionTime: 350,
    wobbleIntensity: 0.5,
    aggression: 0.4,
    color: 0x44BB44
  },
  {
    name: 'Klara',
    skillLevel: 0.65,
    reactionTime: 400,
    wobbleIntensity: 0.6,
    aggression: 0.3,
    color: 0xFFAA00
  },
  {
    name: 'Felix',
    skillLevel: 0.55,
    reactionTime: 450,
    wobbleIntensity: 0.7,
    aggression: 0.5,
    color: 0x9944DD
  },
  {
    name: 'Mia',
    skillLevel: 0.45,
    reactionTime: 500,
    wobbleIntensity: 0.8,
    aggression: 0.4,
    color: 0x00CCBB
  },
  {
    name: 'Otto',
    skillLevel: 0.35,
    reactionTime: 550,
    wobbleIntensity: 0.9,
    aggression: 0.7,
    color: 0xEE5522
  },
  {
    name: 'Fritz',
    skillLevel: 0.30,
    reactionTime: 600,
    wobbleIntensity: 1.0,
    aggression: 0.8,
    color: 0xFF2255
  },
  {
    name: 'Lina',
    skillLevel: 0.20,
    reactionTime: 650,
    wobbleIntensity: 1.2,
    aggression: 0.6,
    color: 0x77DD22
  },
  {
    name: 'Berti',
    skillLevel: 0.15,
    reactionTime: 700,
    wobbleIntensity: 1.4,
    aggression: 0.9,
    color: 0x888888
  }
];

export class BotPresets {
  static getAll() {
    return BOT_PRESETS;
  }

  static getByName(name) {
    return BOT_PRESETS.find(b => b.name === name) || null;
  }

  static getRandomPresets(count = 3) {
    const shuffled = [...BOT_PRESETS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}
