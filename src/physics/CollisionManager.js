import { eventBus } from '../core/EventBus.js';

/**
 * CollisionManager (Parts 0101-0120 | PHASE 1: ENGINE)
 * Listens to CANNON.World 'beginContact' and 'endContact' events.
 * Identifies colliding bodies via body.userData = { type, id, ... }
 * Dispatches domain-specific events through EventBus:
 * - 'collision:bean-gate' with { beanId, gateId, gateWord }
 * - 'collision:bean-slime' with { beanId, slimeId }
 * - 'collision:bean-trampoline' with { beanId, trampolineId, force }
 */
export class CollisionManager {
  /**
   * @param {import('cannon-es').World} world 
   * @param {import('../core/EventBus.js').EventBus} bus 
   */
  constructor(world, bus = eventBus) {
    if (!world) {
      throw new Error('[CollisionManager] CANNON.World instance is required');
    }
    this.world = world;
    this.eventBus = bus;

    // Bound handlers for clean removal
    this.onBeginContactBound = this.handleBeginContact.bind(this);
    this.onEndContactBound = this.handleEndContact.bind(this);

    this.world.addEventListener('beginContact', this.onBeginContactBound);
    this.world.addEventListener('endContact', this.onEndContactBound);
  }

  /**
   * Utility to attach metadata to physics bodies
   * @param {import('cannon-es').Body} body 
   * @param {Object} data - e.g. { type: 'bean'|'gate'|'slime'|'trampoline', id: '...', ... }
   */
  static tagBody(body, data) {
    body.userData = { ...(body.userData || {}), ...data };
    return body;
  }

  handleBeginContact(event) {
    const { bodyA, bodyB } = event;
    const dataA = bodyA.userData || {};
    const dataB = bodyB.userData || {};

    const typeA = dataA.type;
    const typeB = dataB.type;

    // Generic collision event
    this.eventBus.emit('collision:begin', {
      bodyA,
      bodyB,
      dataA,
      dataB
    });

    // 1. Bean <-> Gate Collision
    if ((typeA === 'bean' && typeB === 'gate') || (typeA === 'gate' && typeB === 'bean')) {
      const beanBody = typeA === 'bean' ? bodyA : bodyB;
      const gateBody = typeA === 'gate' ? bodyA : bodyB;
      const beanData = beanBody.userData || {};
      const gateData = gateBody.userData || {};

      this.eventBus.emit('collision:bean-gate', {
        beanId: beanData.id || 'unknown_bean',
        gateId: gateData.id || 'unknown_gate',
        gateWord: gateData.gateWord || gateData.word || '',
        beanBody,
        gateBody
      });
    }

    // 2. Bean <-> Slime Collision
    if ((typeA === 'bean' && typeB === 'slime') || (typeA === 'slime' && typeB === 'bean')) {
      const beanBody = typeA === 'bean' ? bodyA : bodyB;
      const slimeBody = typeA === 'slime' ? bodyA : bodyB;
      const beanData = beanBody.userData || {};
      const slimeData = slimeBody.userData || {};

      this.eventBus.emit('collision:bean-slime', {
        beanId: beanData.id || 'unknown_bean',
        slimeId: slimeData.id || 'unknown_slime',
        beanBody,
        slimeBody
      });
    }

    // 3. Bean <-> Trampoline Collision
    if ((typeA === 'bean' && typeB === 'trampoline') || (typeA === 'trampoline' && typeB === 'bean')) {
      const beanBody = typeA === 'bean' ? bodyA : bodyB;
      const trampBody = typeA === 'trampoline' ? bodyA : bodyB;
      const beanData = beanBody.userData || {};
      const trampData = trampBody.userData || {};

      const forceVector = trampData.force || { x: 0, y: 14, z: 0 };

      this.eventBus.emit('collision:bean-trampoline', {
        beanId: beanData.id || 'unknown_bean',
        trampolineId: trampData.id || 'unknown_trampoline',
        force: forceVector,
        beanBody,
        trampBody
      });
    }
  }

  handleEndContact(event) {
    const { bodyA, bodyB } = event;
    const dataA = bodyA.userData || {};
    const dataB = bodyB.userData || {};

    const typeA = dataA.type;
    const typeB = dataB.type;

    this.eventBus.emit('collision:end', {
      bodyA,
      bodyB,
      dataA,
      dataB
    });

    if ((typeA === 'bean' && typeB === 'gate') || (typeA === 'gate' && typeB === 'bean')) {
      const beanBody = typeA === 'bean' ? bodyA : bodyB;
      const gateBody = typeA === 'gate' ? bodyA : bodyB;
      this.eventBus.emit('collision:bean-gate:end', {
        beanId: beanBody.userData?.id,
        gateId: gateBody.userData?.id
      });
    }
  }

  /**
   * Cleanup method to remove listeners and prevent memory leaks
   */
  destroy() {
    this.world.removeEventListener('beginContact', this.onBeginContactBound);
    this.world.removeEventListener('endContact', this.onEndContactBound);
  }
}
