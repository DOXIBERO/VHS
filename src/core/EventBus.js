export class EventBus {
  constructor() {
    this.events = new Map();
  }

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.events.has(event)) return;
    const callbacks = this.events.get(event).filter(cb => cb !== callback);
    if (callbacks.length === 0) {
      this.events.delete(event);
    } else {
      this.events.set(event, callbacks);
    }
  }

  emit(event, data) {
    if (!this.events.has(event)) return;
    const callbacks = this.events.get(event);
    callbacks.forEach(cb => {
      try {
        cb(data);
      } catch (err) {
        console.error(`[EventBus] Error in listener for event "${event}":`, err);
      }
    });
  }
}

export const eventBus = new EventBus();
