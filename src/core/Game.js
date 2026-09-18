import { Engine } from './Engine.js';
import { GameLoop } from './GameLoop.js';
import { GameState } from './GameState.js';
import { eventBus } from './EventBus.js';

export class Game {
  constructor() {
    this.eventBus = eventBus;
    this.gameState = new GameState();
    this.engine = new Engine();

    this.gameLoop = new GameLoop(
      this.update.bind(this),
      this.render.bind(this)
    );

    this.gameLoop.start();

    console.log(`Game initialized | State: ${this.gameState.current} | FPS: 60`);
  }

  update(dt) {
    this.gameState.update(dt);
  }

  render() {
    this.engine.render();
  }
}
