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
    this.states = new Map();
    this.current = STATES.BOOT;

    // Register all default valid states
    Object.values(STATES).forEach(state => {
      this.states.set(state, {
        onEnter: () => {},
        onUpdate: () => {},
        onExit: () => {}
      });
    });

    console.log(`State: ${this.current}`);
  }

  registerState(stateName, handlers = {}) {
    if (!STATES[stateName]) {
      throw new Error(`[GameState] Invalid state name: ${stateName}`);
    }
    this.states.set(stateName, {
      onEnter: handlers.onEnter || (() => {}),
      onUpdate: handlers.onUpdate || (() => {}),
      onExit: handlers.onExit || (() => {})
    });
  }

  transition(newState) {
    if (!STATES[newState]) {
      throw new Error(`[GameState] Cannot transition to invalid state: ${newState}`);
    }

    if (this.current === newState) return;

    const oldState = this.current;
    console.log(`Exiting ${oldState}`);
    const oldHandlers = this.states.get(oldState);
    if (oldHandlers && oldHandlers.onExit) {
      oldHandlers.onExit();
    }

    this.current = newState;
    console.log(`Entering ${newState}`);
    const newHandlers = this.states.get(newState);
    if (newHandlers && newHandlers.onEnter) {
      newHandlers.onEnter();
    }
  }

  update(dt) {
    const handlers = this.states.get(this.current);
    if (handlers && handlers.onUpdate) {
      handlers.onUpdate(dt);
    }
  }
}
