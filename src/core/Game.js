import { Engine } from './Engine.js';
import { GameLoop } from './GameLoop.js';
import { GameState } from './GameState.js';
import { eventBus } from './EventBus.js';
import { DataManager } from './DataManager.js';
import { DebugPanel } from './DebugPanel.js';
import { logger } from './ConsoleLogger.js';

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

    this.debugPanel = new DebugPanel(this.gameState, this.gameLoop, this.dataManager);

    this.setupStateTransitions();
    this.gameLoop.start();

    logger.game(`Game initialized | State: ${this.gameState.current} | FPS: 60`);
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
    if (this.engine) {
      this.engine.update(dt);
    }
    if (this.debugPanel) {
      this.debugPanel.update(dt);
    }
  }

  render() {
    this.engine.render();
  }
}
