export class DebugPanel {
  constructor(gameState, gameLoop) {
    this.gameState = gameState;
    this.gameLoop = gameLoop;
    this.overlay = document.getElementById('debug-overlay');
    this.visible = false;

    window.addEventListener('keydown', (e) => {
      if (e.key === 'd' || e.key === 'D') {
        this.toggle();
      }
    });

    setInterval(this.update.bind(this), 500);
  }

  toggle() {
    this.visible = !this.visible;
    if (this.overlay) {
      this.overlay.style.display = this.visible ? 'block' : 'none';
    }
  }

  update() {
    if (!this.visible || !this.overlay) return;

    const fps = this.gameLoop ? this.gameLoop.fps : 60;
    const state = this.gameState ? this.gameState.current : 'N/A';

    this.overlay.innerHTML = `
      <div><strong>[WACKEL-BEANS DEBUG]</strong> (Press 'D' to hide)</div>
      <div>FPS: <span style="color: ${fps >= 55 ? '#00ff88' : '#ff4444'}">${fps}</span></div>
      <div>State: <span style="color: #ffd700">${state}</span></div>
      <div>Engine: Three.js WebGL2</div>
    `;
  }
}
