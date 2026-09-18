import { Engine } from './Engine.js';
import { GameLoop } from './GameLoop.js';
import { GameState } from './GameState.js';
import { eventBus } from './EventBus.js';
import { DataManager } from './DataManager.js';
import { DebugPanel } from './DebugPanel.js';
import { AssetLoader } from './AssetLoader.js';
import { logger } from './ConsoleLogger.js';

export class Game {
  constructor() {
    this.eventBus = eventBus;
    this.assetLoader = new AssetLoader(this.eventBus);
    this.dataManager = new DataManager();
    this.gameState = new GameState();

    this.initBootSequence();
  }

  async initBootSequence() {
    // Report initial boot progress (Part 0151-0180 Acceptance Criteria)
    this.eventBus.emit('loading:progress', { url: 'core:brain', loaded: 1, total: 4, percent: 25 });

    this.engine = new Engine();
    this.eventBus.emit('loading:progress', { url: 'core:engine', loaded: 2, total: 4, percent: 50 });

    this.gameLoop = new GameLoop(
      this.update.bind(this),
      this.render.bind(this)
    );
    this.eventBus.emit('loading:progress', { url: 'core:physics', loaded: 3, total: 4, percent: 75 });

    this.debugPanel = new DebugPanel(this.gameState, this.gameLoop, this.dataManager);

    this.setupStateTransitions();
    this.gameLoop.start();

    // Finalize loading
    this.eventBus.emit('loading:progress', { url: 'core:complete', loaded: 4, total: 4, percent: 100 });
    this.eventBus.emit('loading:complete', { success: true });

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
