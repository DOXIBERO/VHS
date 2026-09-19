export class PlayerProfile {
  constructor() {
    this.totalWordsLearned = 0;
    this.currentStreak = 0;
    this.longestStreak = 0;
    this.wordsMastered = []; // Array of wordIds
    this.sessionHistory = []; // { date, wordsReviewed, accuracy }
    this.settings = {
      language: 'de',
      audioVolume: 1.0,
      sensitivity: 1.0
    };

    // Current session tracker
    this.currentSession = {
      correctAnswers: 0,
      totalAnswers: 0
    };

    // Customization & Skins (Part 0211-0220)
    this.currentSkin = 'CLASSIC';
  }

  setSkin(skinName) {
    this.currentSkin = skinName;
  }

  completeWord(wordId, intervalDays = 8) {
    this.totalWordsLearned++;
    this.incrementStreak();

    if (intervalDays > 7 && !this.wordsMastered.includes(wordId)) {
      this.wordsMastered.push(wordId);
    }
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

  recordSessionAnswer(isCorrect) {
    this.currentSession.totalAnswers++;
    if (isCorrect) {
      this.currentSession.correctAnswers++;
    }
  }

  getSessionStats() {
    if (this.currentSession.totalAnswers === 0) {
      return { accuracy: 100, correct: 0, total: 0 };
    }
    const accuracy = Math.round((this.currentSession.correctAnswers / this.currentSession.totalAnswers) * 100);
    return {
      accuracy,
      correct: this.currentSession.correctAnswers,
      total: this.currentSession.totalAnswers
    };
  }

  endSession() {
    const stats = this.getSessionStats();
    this.sessionHistory.push({
      date: new Date(),
      wordsReviewed: stats.total,
      accuracy: stats.accuracy
    });
    this.currentSession = { correctAnswers: 0, totalAnswers: 0 };
  }
}
