import { VocabularyDB } from '../data/VocabularyDB.js';
import { SRSEngine } from '../data/SRSEngine.js';
import { PlayerProfile } from '../data/PlayerProfile.js';
import { RoundConfig } from '../data/RoundConfig.js';
import { ObstacleRegistry } from '../data/ObstacleRegistry.js';
import { LevelTemplates } from '../data/LevelTemplates.js';
import { GameRules } from '../data/GameRules.js';
import { SaveSystem } from './SaveSystem.js';
import { eventBus } from './EventBus.js';

export class DataManager {
  constructor() {
    this.eventBus = eventBus;

    // 1. Initialize all 8 systems in proper order
    this.vocabularyDB = VocabularyDB;
    this.srsEngine = new SRSEngine();
    this.playerProfile = new PlayerProfile();
    this.roundConfig = RoundConfig;
    this.obstacleRegistry = ObstacleRegistry;
    this.levelTemplates = LevelTemplates;
    this.gameRules = GameRules;
    this.saveSystem = new SaveSystem();

    // 2. Load persistent state
    this.loadSavedData();

    // 3. Setup event listeners
    this.setupListeners();

    // 4. Start auto-save every 30 seconds
    this.saveSystem.startAutoSave(
      () => this.playerProfile,
      () => this.srsEngine,
      30000
    );

    console.log('DataManager: All 8 systems initialized');

    // 5. Emit 'data:ready' event
    this.eventBus.emit('data:ready', {
      profile: this.playerProfile,
      srs: this.srsEngine,
      vocab: this.vocabularyDB,
      rules: this.gameRules
    });
  }

  loadSavedData() {
    const saved = this.saveSystem.load();
    if (saved && saved.profile) {
      Object.assign(this.playerProfile, saved.profile);
    }
    if (saved && saved.srs) {
      this.srsEngine.loadState(saved.srs);
    }
  }

  setupListeners() {
    // Listen for player:answer to update SRS and Profile
    this.eventBus.on('player:answer', (data) => {
      const { wordId, isCorrect, quality } = data;
      const calculatedQuality = quality !== undefined ? quality : (isCorrect ? 5 : 0);

      const card = this.srsEngine.recordAnswer(wordId, calculatedQuality);
      this.playerProfile.recordSessionAnswer(isCorrect);

      if (isCorrect) {
        this.playerProfile.completeWord(wordId, card.interval);
      } else {
        this.playerProfile.breakStreak();
      }
    });

    // Listen for game:roundEnd to trigger SRS updates & auto-save
    this.eventBus.on('game:roundEnd', () => {
      this.playerProfile.endSession();
      this.saveSystem.save(this.playerProfile, this.srsEngine);
    });
  }

  save() {
    return this.saveSystem.save(this.playerProfile, this.srsEngine);
  }
}
