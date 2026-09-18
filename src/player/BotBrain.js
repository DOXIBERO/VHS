export class BotBrain {
  constructor(config = {}) {
    this.name = config.name || 'Bot';
    this.skillLevel = config.skillLevel !== undefined ? config.skillLevel : 0.5;
    this.vocabularyKnowledge = Array.isArray(config.vocabularyKnowledge) ? config.vocabularyKnowledge : [];
    this.reactionTime = config.reactionTime || 500;
    this.wobbleIntensity = config.wobbleIntensity !== undefined ? config.wobbleIntensity : 1.0;
    this.aggression = config.aggression !== undefined ? config.aggression : 0.5;

    // Decision state
    this.lastDecisionTime = 0;
    this.decisionInterval = 500; // ms
    this.currentDecision = 'idle'; // 'correct' | 'wrong' | 'follow' | 'idle'
  }

  decide(wordGate, knownWords = this.vocabularyKnowledge) {
    if (!wordGate) return 'idle';

    const targetId = wordGate.targetWord ? wordGate.targetWord.id : (wordGate.target || null);

    // 1. If target word is already explicitly in knownWords:
    if (targetId && knownWords && knownWords.includes(targetId)) {
      // Small chance (5%) of high-speed clumsy misstep
      return Math.random() < 0.95 ? 'correct' : 'wrong';
    }

    // 2. Otherwise probability of choosing correct door matches skillLevel
    const isCorrect = Math.random() < this.skillLevel;
    this.currentDecision = isCorrect ? 'correct' : 'wrong';
    return this.currentDecision;
  }

  update(now, nearestGate, knownWords = this.vocabularyKnowledge) {
    if (now - this.lastDecisionTime >= this.decisionInterval) {
      this.lastDecisionTime = now;
      this.currentDecision = this.decide(nearestGate, knownWords);
    }
    return this.currentDecision;
  }
}
