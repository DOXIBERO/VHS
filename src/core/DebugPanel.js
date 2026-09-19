export class DebugPanel {
  constructor(gameState, gameLoop, dataManager) {
    this.gameState = gameState;
    this.gameLoop = gameLoop;
    this.dataManager = dataManager;
    this.isVisible = false;
    this.fps = 60;
    this.fpsTimer = 0;
    this.frameCount = 0;

    this.domElement = null;
    this.initDOM();
    this.setupListeners();
  }

  initDOM() {
    let existing = document.getElementById('debug-panel');
    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'debug-panel';
      document.body.appendChild(existing);
    }
    this.domElement = existing;

    // Semi-transparent overlay styling in top-left
    Object.assign(this.domElement.style, {
      position: 'absolute',
      top: '12px',
      left: '12px',
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      color: '#00FF88',
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      fontSize: '12px',
      lineHeight: '1.5',
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(6px)',
      zIndex: '99999',
      pointerEvents: 'none',
      display: 'none',
      minWidth: '220px'
    });

    this.updateContent();
  }

  setupListeners() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyD' || e.key === 'd' || e.key === 'D') {
        this.toggle();
      }

      // Skin switching hotkeys 1-5
      const skinMap = {
        'Digit1': 'OFFICER',
        'Digit2': 'CLASSIC',
        'Digit3': 'KREUZBERG',
        'Digit4': 'SPÄTI',
        'Digit5': 'U-BAHN'
      };
      if (skinMap[e.code]) {
        const playerBean = window.game?.engine?.playerBean;
        if (playerBean && typeof playerBean.applySkin === 'function') {
          playerBean.applySkin(skinMap[e.code]);
          if (this.isVisible) this.updateContent();
        }
      }
    });
  }

  toggle() {
    this.isVisible = !this.isVisible;
    this.domElement.style.display = this.isVisible ? 'block' : 'none';
  }

  show() {
    this.isVisible = true;
    this.domElement.style.display = 'block';
  }

  hide() {
    this.isVisible = false;
    this.domElement.style.display = 'none';
  }

  update(dt) {
    // Update FPS counter every 500ms
    this.frameCount++;
    this.fpsTimer += dt;
    if (this.fpsTimer >= 0.5) {
      this.fps = Math.round(this.frameCount / this.fpsTimer);
      this.frameCount = 0;
      this.fpsTimer = 0;

      if (this.isVisible) {
        this.updateContent();
      }
    }
  }

  updateContent() {
    const state = this.gameState ? this.gameState.current : 'UNKNOWN';
    const srsDue = this.dataManager && this.dataManager.srsEngine ? this.dataManager.srsEngine.getDueWords(100).length : 0;
    const currentSkin = this.dataManager?.playerProfile?.currentSkin || window.game?.engine?.playerBean?.customization?.currentSkin || 'OFFICER';
    const activeBeans = window.game?.engine?.beanFactory?.activeCount ?? 1;
    const pooledBeans = window.game?.engine?.beanFactory?.availableCount ?? 0;
    const roundInfo = this.dataManager && this.dataManager.roundConfig ? 'Round 1 (Colors)' : 'None';

    // Memory usage if supported
    let memoryStr = 'N/A';
    if (typeof performance !== 'undefined' && performance.memory) {
      const usedMB = (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(1);
      memoryStr = `${usedMB} MB`;
    }

    this.domElement.innerHTML = `
      <div style="font-weight:bold; color:#FFD700; border-bottom:1px solid rgba(255,255,255,0.2); margin-bottom:6px; padding-bottom:3px;">
        🛠️ WACKEL-BEANS DEBUG [D]
      </div>
      <div>FPS: <span style="color:#FFFFFF; font-weight:bold;">${this.fps}</span></div>
      <div>State: <span style="color:#00E5FF; font-weight:bold;">${state}</span></div>
      <div>Skin: <span style="color:#F59E0B; font-weight:bold;">${currentSkin}</span> <span style="color:#94A3B8; font-size:10px;">[1-5]</span></div>
      <div>Beans: <span style="color:#38BDF8;">${activeBeans} active / ${pooledBeans} pool</span></div>
      <div>Round: <span style="color:#CBD5E1;">${roundInfo}</span></div>
      <div>SRS Due Words: <span style="color:#FFAA00;">${srsDue}</span></div>
      <div>Memory: <span style="color:#CBD5E1;">${memoryStr}</span></div>
    `;
  }
}
