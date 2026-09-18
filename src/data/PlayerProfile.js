export class PlayerProfile {
  constructor() {
    this.totalWordsLearned = 0;
    this.currentStreak = 0;
    this.longestStreak = 0;
    this.wordsMastered = []; // wordIds with interval > 7 days
    this.sessionHistory = []; // { date, wordsReviewed, accuracy }
    this.settings = {
      language: 'de-DE',
      audioVolume: 1.0,
      sensitivity: 1.0
    };
  }

  incrementStreak() {
    this.currentStreak++;
    if (this.currentStreak > this.longestStreak) {
      this.longestStreak = this.currentStreak;
    }
  }

  breakStreak() {
    this.currentStreak = 0;
  }

  completeWord(wordId, isMastered = false) {
    this.totalWordsLearned++;
    if (isMastered && !this.wordsMastered.includes(wordId)) {
      this.wordsMastered.push(wordId);
    }
  }

  recordSession(wordsReviewed, correctCount) {
    const accuracy = wordsReviewed > 0 ? Math.round((correctCount / wordsReviewed) * 100) : 100;
    this.sessionHistory.push({
      date: new Date().toISOString(),
      wordsReviewed,
      accuracy
    });
  }

  getSessionStats() {
    if (this.sessionHistory.length === 0) return { accuracy: 100, sessions: 0 };
    const totalAccuracy = this.sessionHistory.reduce((sum, s) => sum + s.accuracy, 0);
    return {
      accuracy: Math.round(totalAccuracy / this.sessionHistory.length),
      sessions: this.sessionHistory.length,
      masteredCount: this.wordsMastered.length
    };
  }
}
