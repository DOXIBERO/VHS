import { WordGate } from './WordGate.js';
import { FinishLine } from './FinishLine.js';
import { germanAudio } from '../audio/GermanAudio.js';
import { eventBus } from '../core/EventBus.js';

export class CourseManager {
  constructor(scene) {
    this.scene = scene;
    this.gates = [];
    this.finishLine = null;
    this.currentGateIndex = 0;
    this.score = 0;
    this.isVictory = false;
    this.learnedWords = [];

    this.initCourse();
    this.setupListeners();
  }

  initCourse() {
    // Round 1 Setup: 3 Gates with A0 German Words
    const gateConfigs = [
      {
        z: -25,
        gateIndex: 1,
        targetWord: { id: 'rot', german: 'Rot', english: 'Red', emoji: '🔴' },
        options: [
          { id: 'rot', german: 'Rot', english: 'Red', emoji: '🔴' },
          { id: 'blau', german: 'Blau', english: 'Blue', emoji: '🔵' },
          { id: 'gruen', german: 'Grün', english: 'Green', emoji: '🟢' }
        ]
      },
      {
        z: -50,
        gateIndex: 2,
        targetWord: { id: 'zwei', german: 'Zwei', english: 'Two', emoji: '2️⃣' },
        options: [
          { id: 'eins', german: 'Eins', english: 'One', emoji: '1️⃣' },
          { id: 'zwei', german: 'Zwei', english: 'Two', emoji: '2️⃣' },
          { id: 'drei', german: 'Drei', english: 'Three', emoji: '3️⃣' }
        ]
      },
      {
        z: -75,
        gateIndex: 3,
        targetWord: { id: 'ausgang', german: 'Ausgang', english: 'Exit', emoji: '🚪' },
        options: [
          { id: 'eingang', german: 'Eingang', english: 'Entrance', emoji: '🏢' },
          { id: 'ausgang', german: 'Ausgang', english: 'Exit', emoji: '🚪' },
          { id: 'ubahn', german: 'U-Bahn', english: 'Subway', emoji: '🚇' }
        ]
      }
    ];

    this.gates = gateConfigs.map(cfg => new WordGate(this.scene, cfg));
    this.finishLine = new FinishLine(this.scene, -95);
  }

  setupListeners() {
    eventBus.on('gate:cleared', (data) => {
      this.score += 100;
      if (data.targetWord) {
        this.learnedWords.push(data.targetWord);
      }
      this.currentGateIndex = Math.min(this.gates.length, this.currentGateIndex + 1);

      // Announce next target word if available
      setTimeout(() => {
        this.speakCurrentWord();
        this.emitHUDUpdate();
      }, 700);
    });

    eventBus.on('player:answer', (data) => {
      if (!data.isCorrect) {
        this.score = Math.max(0, this.score - 20);
        this.emitHUDUpdate();
      }
    });

    eventBus.on('game:victory', () => {
      this.isVictory = true;
      this.score += 200; // Finish line bonus!
      this.emitHUDUpdate();
      eventBus.emit('ui:show_victory', {
        score: this.score,
        learnedWords: this.learnedWords
      });
    });
  }

  getCurrentTargetWord() {
    if (this.currentGateIndex < this.gates.length) {
      return this.gates[this.currentGateIndex].targetWord;
    }
    return { id: 'ziel', german: 'ZIEL!', english: 'Finish Line!', emoji: '🏁' };
  }

  speakCurrentWord() {
    const target = this.getCurrentTargetWord();
    if (target) {
      if (this.currentGateIndex < this.gates.length) {
        germanAudio.speak(target.german);
      } else {
        germanAudio.speak('Lauf zum Ziel!');
      }
    }
  }

  emitHUDUpdate() {
    const target = this.getCurrentTargetWord();
    eventBus.emit('hud:update', {
      targetWord: target,
      gateIndex: Math.min(3, this.currentGateIndex + 1),
      totalGates: this.gates.length,
      score: this.score,
      isVictory: this.isVictory
    });
  }

  update(dt, player, bots = []) {
    // Update gate door animations
    this.gates.forEach(gate => {
      gate.update(dt);
      if (player) {
        gate.checkCollision(player, true);
      }
    });

    // Check finish line
    if (this.finishLine) {
      this.finishLine.update(dt);
      if (player) {
        this.finishLine.checkFinish(player);
      }
    }
  }
}
