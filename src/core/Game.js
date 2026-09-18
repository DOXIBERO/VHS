import { Engine } from './Engine.js';
import { GameLoop } from './GameLoop.js';
import { GameState, STATES } from './GameState.js';
import { eventBus } from './EventBus.js';
import { DebugPanel } from './DebugPanel.js';
import { DataManager } from './DataManager.js';
import { InputManager } from './InputManager.js';
import { TouchControls } from './TouchControls.js';

export class Game {
  constructor() {
    this.eventBus = eventBus;
    this.dataManager = new DataManager();
    this.gameState = new GameState();
    this.engine = new Engine();

    // 1. Inputs (Keyboard + Mobile Touch Joystick)
    this.inputManager = new InputManager();
    this.touchControls = new TouchControls(() => {
      this.engine.jump();
    });

    // 2. Loop & Debug
    this.gameLoop = new GameLoop(
      this.update.bind(this),
      this.render.bind(this)
    );

    this.debugPanel = new DebugPanel(this.gameState, this.gameLoop);

    this.setupStates();
    this.gameLoop.start();

    console.log(`[Game] Wackel-Beans active | State: ${this.gameState.current} | Controls: Ready`);
  }

  setupStates() {
    this.gameState.registerState(STATES.BOOT, {
      onEnter: () => {
        setTimeout(() => {
          this.gameState.transition(STATES.MENU);
        }, 300);
      }
    });

    this.gameState.registerState(STATES.MENU, {
      onEnter: () => {
        console.log('[Game] Player Bean standing on green grass, ready to move!');
      }
    });
  }

  update(dt) {
    this.gameState.update(dt);

    // Merge Keyboard + Touch input
    const keyVec = this.inputManager.getVector();
    const touchVec = this.touchControls.getVector();

    let finalX = keyVec.x || touchVec.x;
    let finalY = keyVec.y || touchVec.y;

    if (keyVec.isJump) {
      this.engine.jump();
    }

    this.engine.update(dt, { x: finalX, y: finalY });
  }

  render() {
    this.engine.render();
  }
}
