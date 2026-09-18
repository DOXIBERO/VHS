export class TouchControls {
  constructor(onJumpCallback) {
    this.onJumpCallback = onJumpCallback;
    this.vector = { x: 0, y: 0 };
    this.isActive = false;

    this.touchId = null;
    this.center = { x: 0, y: 0 };
    this.radius = 45;

    this.initDOM();
  }

  initDOM() {
    // Create touch controls container
    this.container = document.createElement('div');
    this.container.id = 'touch-controls';
    this.container.innerHTML = `
      <div id="joystick-zone">
        <div id="joystick-base">
          <div id="joystick-knob"></div>
        </div>
      </div>
      <div id="action-zone">
        <button id="jump-btn" aria-label="Jump">
          <span>JUMP</span>
          <small>🦘</small>
        </button>
      </div>
    `;

    document.body.appendChild(this.container);

    this.base = document.getElementById('joystick-base');
    this.knob = document.getElementById('joystick-knob');
    this.jumpBtn = document.getElementById('jump-btn');

    this.setupEvents();
  }

  setupEvents() {
    const zone = document.getElementById('joystick-zone');

    zone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      this.touchId = touch.identifier;
      this.isActive = true;

      const rect = this.base.getBoundingClientRect();
      this.center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };

      this.handleTouch(touch.clientX, touch.clientY);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (!this.isActive) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this.touchId) {
          this.handleTouch(touch.clientX, touch.clientY);
          break;
        }
      }
    }, { passive: true });

    const endHandler = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === this.touchId) {
          this.isActive = false;
          this.touchId = null;
          this.vector = { x: 0, y: 0 };
          this.knob.style.transform = 'translate(0px, 0px)';
          break;
        }
      }
    };

    window.addEventListener('touchend', endHandler);
    window.addEventListener('touchcancel', endHandler);

    // Jump button events (both touch and click)
    const triggerJump = (e) => {
      e.preventDefault();
      if (this.onJumpCallback) this.onJumpCallback();
    };

    this.jumpBtn.addEventListener('touchstart', triggerJump, { passive: false });
    this.jumpBtn.addEventListener('mousedown', triggerJump);
  }

  handleTouch(clientX, clientY) {
    let dx = clientX - this.center.x;
    let dy = clientY - this.center.y;

    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > this.radius) {
      dx = (dx / dist) * this.radius;
      dy = (dy / dist) * this.radius;
    }

    this.knob.style.transform = `translate(${dx}px, ${dy}px)`;

    // Normalized vector (y is inverted: up is positive)
    this.vector = {
      x: dx / this.radius,
      y: -(dy / this.radius)
    };
  }

  getVector() {
    return this.vector;
  }
}
