export class SRSEngine {
  constructor() {
    this.cards = new Map(); // wordId -> card state
  }

  getCard(wordId) {
    if (!this.cards.has(wordId)) {
      this.cards.set(wordId, {
        wordId,
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: new Date(0), // default to past so it is immediately due
        lastSeen: null
      });
    }
    return this.cards.get(wordId);
  }

  recordAnswer(wordId, quality) {
    const card = this.getCard(wordId);
    const now = new Date();
    card.lastSeen = now;

    // Quality: 0 = fail, 5 = perfect
    if (quality >= 3) {
      if (card.repetitions === 0) {
        card.interval = 1; // 1 day
      } else if (card.repetitions === 1) {
        card.interval = 6; // 6 days
      } else {
        card.interval = Math.round(card.interval * card.easeFactor);
      }
      card.repetitions++;
    } else {
      card.repetitions = 0;
      card.interval = 0;
    }

    // SM-2 Ease Factor calculation
    card.easeFactor = Math.max(
      1.3,
      card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    // Calculate nextReview date (interval in days)
    const nextDate = new Date(now.getTime() + card.interval * 24 * 60 * 60 * 1000);
    card.nextReview = nextDate;

    return card;
  }

  getDueWords(count = 5) {
    const now = new Date();
    const sorted = Array.from(this.cards.values())
      .sort((a, b) => new Date(a.nextReview) - new Date(b.nextReview));

    return sorted.slice(0, count).map(c => c.wordId);
  }

  getState() {
    const obj = {};
    this.cards.forEach((val, key) => {
      obj[key] = val;
    });
    return obj;
  }

  loadState(stateObj) {
    if (!stateObj) return;
    this.cards.clear();
    Object.keys(stateObj).forEach(key => {
      this.cards.set(key, stateObj[key]);
    });
  }
}
