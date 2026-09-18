export class SaveSystem {
  static STORAGE_KEY = 'wackel_beans_save_v1';
  static VERSION = '1.0.0';

  static save(playerProfile, srsEngine) {
    try {
      const data = {
        version: this.VERSION,
        timestamp: Date.now(),
        profile: playerProfile,
        srs: srsEngine ? srsEngine.exportData() : []
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (err) {
      console.warn('[SaveSystem] Save failed:', err);
      return false;
    }
  }

  static load(playerProfile, srsEngine) {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return false;

      const data = JSON.parse(raw);
      if (data.profile && playerProfile) {
        Object.assign(playerProfile, data.profile);
      }
      if (data.srs && srsEngine) {
        srsEngine.importData(data.srs);
      }
      console.log('[SaveSystem] Game state loaded from storage');
      return true;
    } catch (err) {
      console.warn('[SaveSystem] Corrupted save, resetting to defaults:', err);
      return false;
    }
  }

  static reset() {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('[SaveSystem] Save data wiped');
  }

  static exportJSON() {
    return localStorage.getItem(this.STORAGE_KEY) || '{}';
  }

  static importJSON(jsonString, playerProfile, srsEngine) {
    try {
      localStorage.setItem(this.STORAGE_KEY, jsonString);
      return this.load(playerProfile, srsEngine);
    } catch (err) {
      console.error('[SaveSystem] Import failed:', err);
      return false;
    }
  }
}
