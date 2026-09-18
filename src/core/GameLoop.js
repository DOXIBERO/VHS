export class GameLoop {
  constructor(updateFn, renderFn) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
    this.isRunning = false;
    this.lastTime = 0;
    this.accumulatedTime = 0;
    this.timestep = 1 / 60; // 60fps target fixed timestep
    this.maxDelta = 0.05;   // Prevent tab-switch explosions

    // FPS logging
    this.frameCount = 0;
    this.fpsTimer = 0;
    this.currentFps = 60;

    this.loop = this.loop.bind(this);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop);
  }

  stop() {
    this.isRunning = false;
  }

  loop(currentTime) {
    if (!this.isRunning) return;

    let delta = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Cap delta time to 0.05s
    if (delta > this.maxDelta) {
      delta = this.maxDelta;
    }

    this.accumulatedTime += delta;

    // Fixed timestep updates
    while (this.accumulatedTime >= this.timestep) {
      this.updateFn(this.timestep);
      this.accumulatedTime -= this.timestep;
    }

    // Render call
    this.renderFn();

    // Track and log FPS every 2 seconds
    this.frameCount++;
    this.fpsTimer += delta;
    if (this.fpsTimer >= 2.0) {
      this.currentFps = Math.round(this.frameCount / this.fpsTimer);
      console.log(`[GameLoop] FPS: ${this.currentFps}`);
      this.frameCount = 0;
      this.fpsTimer = 0;
    }

    requestAnimationFrame(this.loop);
  }
}
