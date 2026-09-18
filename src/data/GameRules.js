export class GameRules {
  static getEliminationType() {
    return 'soft'; // soft elimination: 3s respawn with -200pts penalty
  }

  static getEliminationPenalty() {
    return -200;
  }

  static getRespawnDelay() {
    return 3; // seconds
  }

  static getRoundFlow() {
    return {
      countdownSeconds: 10,
      gameplaySecondsMin: 60,
      gameplaySecondsMax: 120,
      resultsSeconds: 10
    };
  }

  static getWinConditions() {
    return {
      race: 'First bean to cross the finish line',
      survival: 'Last bean standing on the platforms',
      team: 'Team with the highest combined score'
    };
  }

  static calculateScore(action, options = {}) {
    const streak = options.streak || 0;
    let multiplier = 1;

    if (streak >= 5) {
      multiplier = 3;
    } else if (streak >= 3) {
      multiplier = 2;
    }

    switch (action) {
      case 'correct_gate':
        return 100 * multiplier;
      case 'wrong_gate':
        return -50;
      case 'finish_first':
        return 500;
      case 'survival_bonus': {
        const secondsAlive = options.secondsAlive || 0;
        return secondsAlive * 10;
      }
      case 'respawn_penalty':
        return -200;
      default:
        return 0;
    }
  }
}
