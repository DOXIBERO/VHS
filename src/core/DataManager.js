import { eventBus } from './EventBus.js';
import { VocabularyDB } from '../data/VocabularyDB.js';
import { SRSEngine } from '../data/SRSEngine.js';
import { PlayerProfile } from '../data/PlayerProfile.js';
import { RoundConfig } from '../data/RoundConfig.js';
import { ObstacleRegistry } from '../data/ObstacleRegistry.js';
import { LevelTemplates } from '../data/LevelTemplates.js';
import { GameRules } from '../data/GameRules.js';
import { SaveSystem } from './SaveSystem.js';

export class DataManager {
  constructor() {
    this.vocabDB = VocabularyDB;
    this.srs = new SRSEngine();
    this.profile = new PlayerProfile();
    this.roundConfig = RoundConfig;
    this.obstacles = ObstacleRegistry;
    this.levels = LevelTemplates;
    this.rules = GameRules;

    // Load persisted state
    SaveSystem.load(this.profile, this.srs);

    // Auto-save every 30s
    setInterval(() => {
      SaveSystem.save(this.profile, this.srs);
    }, 30000);

    this.setupListeners();
    console.log('[DataManager] All 8 data systems initialized successfully');

    // Notify the rest of the game
    eventBus.emit('data:ready', {
      wordsCount: this.vocabDB.getAllWords().length,
      roundsCount: this.roundConfig.getAllRounds().length
    });
  }

  setupListeners() {
    eventBus.on('player:answer', (data) => {
      const { wordId, isCorrect, quality = (isCorrect ? 5 : 1) } = data;
      this.srs.recordAnswer(wordId, quality);

      if (isCorrect) {
        this.profile.incrementStreak();
        this.profile.completeWord(wordId);
      } else {
        this.profile.breakStreak();
      }

      SaveSystem.save(this.profile, this.srs);
    });

    eventBus.on('game:roundEnd', (data) => {
      SaveSystem.save(this.profile, this.srs);
    });
  }
}
