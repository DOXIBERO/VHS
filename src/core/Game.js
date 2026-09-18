import { Engine } from './Engine.js';
import { GameLoop } from './GameLoop.js';
import { GameState } from './GameState.js';
import { eventBus } from './EventBus.js';
import { DataManager } from './DataManager.js';

export class Game {
  constructor() {
    this.eventBus = eventBus;
    this.dataManager = new DataManager();
    this.gameState = new GameState();
    this.engine = new Engine();

    this.gameLoop = new GameLoop(
      this.update.bind(this),
      this.render.bind(this)
    );

    this.setupStateTransitions();
    this.gameLoop.start();

    console.log(`Game initialized | State: ${this.gameState.current} | FPS: 60`);
  }

  setupStateTransitions() {
    // Auto-save on state transitions as per Part 0021-0030
    const originalTransition = this.gameState.transition.bind(this.gameState);
    this.gameState.transition = (newState) => {
      originalTransition(newState);
      if (this.dataManager) {
        this.dataManager.save();
      }
    };
  }

  update(dt) {
    this.gameState.update(dt);
  }

  render() {
    this.engine.render();
  }
}
