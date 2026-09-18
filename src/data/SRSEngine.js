export class SRSEngine {
  constructor() {
    this.cards = new Map(); // wordId -> { easeFactor, interval, repetitions, nextReview, lastSeen }
  }

  getCard(wordId) {
    if (!this.cards.has(wordId)) {
      this.cards.set(wordId, {
        wordId,
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: new Date(0), // due immediately
        lastSeen: new Date()
      });
    }
    return this.cards.get(wordId);
  }

  recordAnswer(wordId, quality) {
    // quality: 0-5 (0=complete fail, 5=perfect recall)
    const card = this.getCard(wordId);
    card.lastSeen = new Date();

    if (quality >= 3) {
      if (card.repetitions === 0) {
        card.interval = 1;
      } else if (card.repetitions === 1) {
        card.interval = 6;
      } else {
        card.interval = Math.round(card.interval * card.easeFactor);
      }
      card.repetitions++;
    } else {
      card.repetitions = 0;
      card.interval = 0;
    }

    // Update ease factor (SM-2 formula)
    card.easeFactor = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (card.easeFactor < 1.3) card.easeFactor = 1.3;

    // Set next review date
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + card.interval);
    card.nextReview = nextDate;

    return card;
  }

  getDueWords(count = 5) {
    const now = new Date();
    const sorted = Array.from(this.cards.values())
      .filter(c => c.nextReview <= now)
      .sort((a, b) => a.nextReview - b.nextReview);

    return sorted.slice(0, count).map(c => c.wordId);
  }

  exportData() {
    return Array.from(this.cards.entries());
  }

  importData(entries) {
    if (Array.isArray(entries)) {
      this.cards = new Map(entries);
    }
  }
}
