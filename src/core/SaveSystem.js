export class SaveSystem {
  constructor() {
    this.storageKey = 'wackel_beans_save';
    this.version = '1.0.0';
    this.autoSaveInterval = null;
  }

  startAutoSave(getProfileFn, getSrsFn, intervalMs = 30000) {
    if (this.autoSaveInterval) clearInterval(this.autoSaveInterval);
    this.autoSaveInterval = setInterval(() => {
      try {
        const profile = getProfileFn ? getProfileFn() : null;
        const srs = getSrsFn ? getSrsFn() : null;
        if (profile && srs) {
          this.save(profile, srs);
        }
      } catch (err) {
        console.warn('[SaveSystem] Auto-save error:', err);
      }
    }, intervalMs);
  }

  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  save(profile, srs) {
    try {
      const data = {
        version: this.version,
        timestamp: Date.now(),
        profile: {
          totalWordsLearned: profile.totalWordsLearned,
          currentStreak: profile.currentStreak,
          longestStreak: profile.longestStreak,
          wordsMastered: profile.wordsMastered,
          sessionHistory: profile.sessionHistory,
          settings: profile.settings
        },
        srs: srs.getState ? srs.getState() : {}
      };

      const json = JSON.stringify(data);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, json);
      }
      return json;
    } catch (err) {
      console.error('[SaveSystem] Failed to save to localStorage:', err);
      return null;
    }
  }

  load() {
    try {
      if (typeof localStorage === 'undefined') return this.getDefaultData();
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return this.getDefaultData();

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') {
        return this.getDefaultData();
      }

      return {
        version: parsed.version || this.version,
        profile: parsed.profile || {},
        srs: parsed.srs || {}
      };
    } catch (err) {
      console.warn('[SaveSystem] Corrupted save data in localStorage, using defaults:', err);
      return this.getDefaultData();
    }
  }

  reset() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.storageKey);
      }
    } catch (err) {
      console.warn('[SaveSystem] Failed to reset localStorage:', err);
    }
  }

  exportJSON(profile, srs) {
    return JSON.stringify({
      version: this.version,
      timestamp: Date.now(),
      profile: profile ? {
        totalWordsLearned: profile.totalWordsLearned,
        currentStreak: profile.currentStreak,
        longestStreak: profile.longestStreak,
        wordsMastered: profile.wordsMastered,
        sessionHistory: profile.sessionHistory,
        settings: profile.settings
      } : {},
      srs: srs && srs.getState ? srs.getState() : {}
    }, null, 2);
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid JSON structure');
      }
      return {
        version: parsed.version || this.version,
        profile: parsed.profile || {},
        srs: parsed.srs || {}
      };
    } catch (err) {
      console.warn('[SaveSystem] Failed to import JSON, fallback to defaults:', err);
      return this.getDefaultData();
    }
  }

  getDefaultData() {
    return {
      version: this.version,
      profile: {
        totalWordsLearned: 0,
        currentStreak: 0,
        longestStreak: 0,
        wordsMastered: [],
        sessionHistory: [],
        settings: { language: 'de', audioVolume: 1.0, sensitivity: 1.0 }
      },
      srs: {}
    };
  }
}
