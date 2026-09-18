export class GameRules {
  static calculateScore(actionType, context = {}) {
    let base = 0;
    const streak = context.streak || 0;

    let multiplier = 1;
    if (streak >= 5) multiplier = 3;
    else if (streak >= 3) multiplier = 2;

    switch (actionType) {
      case 'correct_gate':
        base = 100 * multiplier;
        break;
      case 'wrong_gate':
        base = -50;
        break;
      case 'finish_first':
        base = 500;
        break;
      case 'finish_top3':
        base = 250;
        break;
      case 'soft_respawn_penalty':
        base = -200;
        break;
      case 'survival_second':
        base = 10;
        break;
      default:
        base = 0;
    }

    return base;
  }

  static getEliminationType() {
    return 'soft'; // Soft elimination: respawn after 3 seconds, keeps learning momentum
  }

  static getRespawnDelay() {
    return 3000; // 3 seconds
  }

  static getStunDuration() {
    return 1500; // 1.5s stun on hitting wrong gate
  }

  static isRoundWon(mode, context = {}) {
    if (mode === 'race') {
      return context.finished === true;
    }
    if (mode === 'survival') {
      return context.aliveTime >= (context.duration || 60);
    }
    return false;
  }
}
