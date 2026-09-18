import { eventBus } from './EventBus.js';

export const STATES = {
  BOOT: 'BOOT',
  MENU: 'MENU',
  LOADING: 'LOADING',
  COUNTDOWN: 'COUNTDOWN',
  PLAYING: 'PLAYING',
  ROUND_END: 'ROUND_END',
  GAME_OVER: 'GAME_OVER',
  RESULTS: 'RESULTS'
};

export class GameState {
  constructor() {
    this.currentState = STATES.BOOT;
    this.stateHandlers = new Map();
    console.log(`[GameState] Initialized in State: ${this.currentState}`);
  }

  registerState(stateName, handlers = {}) {
    this.stateHandlers.set(stateName, {
      onEnter: handlers.onEnter || (() => {}),
      onUpdate: handlers.onUpdate || (() => {}),
      onExit: handlers.onExit || (() => {})
    });
  }

  transition(newState) {
    if (!STATES[newState]) {
      throw new Error(`[GameState] Invalid state transition target: "${newState}"`);
    }

    if (this.currentState === newState) return;

    const oldState = this.currentState;
    console.log(`[GameState] Exiting ${oldState} -> Entering ${newState}`);

    const oldHandler = this.stateHandlers.get(oldState);
    if (oldHandler?.onExit) {
      oldHandler.onExit();
    }

    this.currentState = newState;

    const newHandler = this.stateHandlers.get(newState);
    if (newHandler?.onEnter) {
      newHandler.onEnter();
    }

    eventBus.emit('state:changed', { from: oldState, to: newState });
  }

  update(dt) {
    const handler = this.stateHandlers.get(this.currentState);
    if (handler?.onUpdate) {
      handler.onUpdate(dt);
    }
  }

  get current() {
    return this.currentState;
  }
}
