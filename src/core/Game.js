import { Engine } from './Engine.js';
import { GameLoop } from './GameLoop.js';
import { GameState, STATES } from './GameState.js';
import { eventBus } from './EventBus.js';
import { DebugPanel } from './DebugPanel.js';
import { DataManager } from './DataManager.js';
import { InputManager } from './InputManager.js';
import { TouchControls } from './TouchControls.js';
import { germanAudio } from '../audio/GermanAudio.js';

export class Game {
  constructor() {
    this.eventBus = eventBus;
    this.dataManager = new DataManager();
    this.gameState = new GameState();
    this.engine = new Engine();

    // 1. Inputs (Keyboard + Mobile Touch Joystick)
    this.inputManager = new InputManager();
    this.touchControls = new TouchControls(() => {
      this.engine.jump();
    });

    // 2. Loop & Debug
    this.gameLoop = new GameLoop(
      this.update.bind(this),
      this.render.bind(this)
    );

    this.debugPanel = new DebugPanel(this.gameState, this.gameLoop);

    this.setupUI();
    this.setupStates();
    this.gameLoop.start();

    console.log(`[Game] Wackel-Beans active | State: ${this.gameState.current} | Controls: Ready`);
  }

  setupUI() {
    // HUD Target Element & Buttons
    this.hudBanner = document.getElementById('target-banner');
    this.wordText = document.getElementById('target-word-text');
    this.gateBadge = document.getElementById('gate-badge');
    this.scoreBadge = document.getElementById('score-badge');
    this.audioBtn = document.getElementById('audio-replay-btn');

    this.victoryModal = document.getElementById('victory-modal');
    this.finalScore = document.getElementById('final-score');
    this.wordsLearnedList = document.getElementById('words-learned-list');
    this.restartBtn = document.getElementById('restart-btn');
    this.startOverlay = document.getElementById('start-overlay');
    this.startBtn = document.getElementById('start-btn');

    // Audio replay button click
    if (this.audioBtn) {
      this.audioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.engine.courseManager.speakCurrentWord();
      });
      this.audioBtn.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        this.engine.courseManager.speakCurrentWord();
      }, { passive: false });
    }

    // Start race button
    if (this.startBtn && this.startOverlay) {
      const handleStart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        germanAudio.ensureAudioContext();
        this.startOverlay.style.display = 'none';
        this.engine.courseManager.emitHUDUpdate();
        setTimeout(() => {
          this.engine.courseManager.speakCurrentWord();
        }, 400);
      };
      this.startBtn.addEventListener('click', handleStart);
      this.startBtn.addEventListener('touchstart', handleStart);
    }

    // Restart button click
    if (this.restartBtn) {
      const handleRestart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.victoryModal.style.display = 'none';
        this.engine.restart();
      };
      this.restartBtn.addEventListener('click', handleRestart);
      this.restartBtn.addEventListener('touchstart', handleRestart);
    }

    // Event Bus HUD updates
    this.eventBus.on('hud:update', (data) => {
      if (this.wordText) {
        this.wordText.innerHTML = `👉 FINDE: <span class="highlight-word">${data.targetWord.german}</span> ${data.targetWord.emoji}`;
      }
      if (this.gateBadge) {
        this.gateBadge.textContent = `TOR ${data.gateIndex} / ${data.totalGates}`;
      }
      if (this.scoreBadge) {
        this.scoreBadge.textContent = `⭐ ${data.score}`;
      }
    });

    // Victory Event
    this.eventBus.on('ui:show_victory', (data) => {
      if (this.victoryModal) {
        this.victoryModal.style.display = 'flex';
        if (this.finalScore) {
          this.finalScore.textContent = `${data.score} PTS`;
        }
        if (this.wordsLearnedList) {
          this.wordsLearnedList.innerHTML = data.learnedWords.map(w => 
            `<span class="learned-tag">${w.emoji} ${w.german} <small>(${w.english})</small></span>`
          ).join('');
        }
      }
    });
  }

  setupStates() {
    this.gameState.registerState(STATES.BOOT, {
      onEnter: () => {
        setTimeout(() => {
          this.gameState.transition(STATES.MENU);
        }, 200);
      }
    });

    this.gameState.registerState(STATES.MENU, {
      onEnter: () => {
        this.engine.courseManager.emitHUDUpdate();
      }
    });
  }

  update(dt) {
    this.gameState.update(dt);

    // Merge Keyboard + Touch input
    const keyVec = this.inputManager.getVector();
    const touchVec = this.touchControls.getVector();

    let finalX = keyVec.x || touchVec.x;
    let finalY = keyVec.y || touchVec.y;

    if (keyVec.isJump) {
      this.engine.jump();
    }

    this.engine.update(dt, { x: finalX, y: finalY });
  }

  render() {
    this.engine.render();
  }
}
