export class GameLoop {
  constructor(updateFn, renderFn) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
    this.isRunning = false;
    this.lastTime = 0;
    this.fixedTimeStep = 1 / 60;
    this.accumulatedTime = 0;
    this.maxDelta = 0.05;

    this.frameCount = 0;
    this.lastFpsLog = 0;
    this.currentFps = 60;

    this.loop = this.loop.bind(this);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.lastFpsLog = this.lastTime;
    requestAnimationFrame(this.loop);
    console.log('[GameLoop] Started at target 60 FPS');
  }

  stop() {
    this.isRunning = false;
    console.log('[GameLoop] Stopped');
  }

  loop(currentTime) {
    if (!this.isRunning) return;

    let delta = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Cap delta to prevent spiral of death / teleportation on tab switch
    if (delta > this.maxDelta) {
      delta = this.maxDelta;
    }

    this.accumulatedTime += delta;

    while (this.accumulatedTime >= this.fixedTimeStep) {
      this.updateFn(this.fixedTimeStep);
      this.accumulatedTime -= this.fixedTimeStep;
    }

    this.renderFn();

    // FPS calculation
    this.frameCount++;
    if (currentTime - this.lastFpsLog >= 2000) {
      this.currentFps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFpsLog));
      console.log(`[GameLoop] Current FPS: ${this.currentFps}`);
      this.frameCount = 0;
      this.lastFpsLog = currentTime;
    }

    requestAnimationFrame(this.loop);
  }

  get fps() {
    return this.currentFps;
  }
}
