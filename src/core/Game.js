import { Engine } from './Engine.js';
import { GameLoop } from './GameLoop.js';
import { GameState, STATES } from './GameState.js';
import { eventBus } from './EventBus.js';
import { DebugPanel } from './DebugPanel.js';
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

    this.debugPanel = new DebugPanel(this.gameState, this.gameLoop);

    this.setupStates();
    this.gameLoop.start();

    console.log(`[Game] Wackel-Beans initialized | State: ${this.gameState.current} | Target: 60 FPS`);
  }

  setupStates() {
    this.gameState.registerState(STATES.BOOT, {
      onEnter: () => {
        console.log('[Game] Booting up Wackel-Beans systems...');
        setTimeout(() => {
          this.gameState.transition(STATES.MENU);
        }, 500);
      }
    });

    this.gameState.registerState(STATES.MENU, {
      onEnter: () => {
        console.log('[Game] Ready in MENU state (Sky & Ground active)');
      }
    });
  }

  update(dt) {
    this.gameState.update(dt);
  }

  render() {
    this.engine.render();
  }
}
