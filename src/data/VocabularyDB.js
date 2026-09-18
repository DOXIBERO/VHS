export const VOCABULARY_CATEGORIES = {
  COLORS: 'COLORS',
  NUMBERS: 'NUMBERS',
  DIRECTIONS: 'DIRECTIONS',
  ACTIONS: 'ACTIONS',
  FOOD: 'FOOD',
  BODY: 'BODY',
  ANIMALS: 'ANIMALS',
  OBJECTS: 'OBJECTS',
  CLOTHING: 'CLOTHING',
  WEATHER: 'WEATHER',
  PLACES: 'PLACES',
  TIME: 'TIME',
  ADJECTIVES: 'ADJECTIVES',
  GREETINGS: 'GREETINGS'
};

export const VOCABULARY_LIST = [
  // 1. COLORS (6)
  { id: 'rot', german: 'rot', english: 'red', category: 'COLORS', difficulty: 1, emoji: '🔴' },
  { id: 'blau', german: 'blau', english: 'blue', category: 'COLORS', difficulty: 1, emoji: '🔵' },
  { id: 'gruen', german: 'grün', english: 'green', category: 'COLORS', difficulty: 1, emoji: '🟢' },
  { id: 'gelb', german: 'gelb', english: 'yellow', category: 'COLORS', difficulty: 1, emoji: '🟡' },
  { id: 'weiss', german: 'weiß', english: 'white', category: 'COLORS', difficulty: 1, emoji: '⚪' },
  { id: 'schwarz', german: 'schwarz', english: 'black', category: 'COLORS', difficulty: 1, emoji: '⚫' },

  // 2. NUMBERS (10)
  { id: 'eins', german: 'eins', english: 'one', category: 'NUMBERS', difficulty: 1, emoji: '1️⃣' },
  { id: 'zwei', german: 'zwei', english: 'two', category: 'NUMBERS', difficulty: 1, emoji: '2️⃣' },
  { id: 'drei', german: 'drei', english: 'three', category: 'NUMBERS', difficulty: 1, emoji: '3️⃣' },
  { id: 'vier', german: 'vier', english: 'four', category: 'NUMBERS', difficulty: 1, emoji: '4️⃣' },
  { id: 'fuenf', german: 'fünf', english: 'five', category: 'NUMBERS', difficulty: 1, emoji: '5️⃣' },
  { id: 'sechs', german: 'sechs', english: 'six', category: 'NUMBERS', difficulty: 1, emoji: '6️⃣' },
  { id: 'sieben', german: 'sieben', english: 'seven', category: 'NUMBERS', difficulty: 1, emoji: '7️⃣' },
  { id: 'acht', german: 'acht', english: 'eight', category: 'NUMBERS', difficulty: 1, emoji: '8️⃣' },
  { id: 'neun', german: 'neun', english: 'nine', category: 'NUMBERS', difficulty: 1, emoji: '9️⃣' },
  { id: 'zehn', german: 'zehn', english: 'ten', category: 'NUMBERS', difficulty: 1, emoji: '🔟' },

  // 3. DIRECTIONS (4)
  { id: 'links', german: 'links', english: 'left', category: 'DIRECTIONS', difficulty: 1, emoji: '⬅️' },
  { id: 'rechts', german: 'rechts', english: 'right', category: 'DIRECTIONS', difficulty: 1, emoji: '➡️' },
  { id: 'oben', german: 'oben', english: 'up/top', category: 'DIRECTIONS', difficulty: 1, emoji: '⬆️' },
  { id: 'unten', german: 'unten', english: 'down/bottom', category: 'DIRECTIONS', difficulty: 1, emoji: '⬇️' },

  // 4. ACTIONS (6)
  { id: 'springen', german: 'springen', english: 'to jump', category: 'ACTIONS', difficulty: 2, emoji: '🦘' },
  { id: 'laufen', german: 'laufen', english: 'to run', category: 'ACTIONS', difficulty: 1, emoji: '🏃' },
  { id: 'stoppen', german: 'stoppen', english: 'to stop', category: 'ACTIONS', difficulty: 1, emoji: '🛑' },
  { id: 'ducken', german: 'ducken', english: 'to duck', category: 'ACTIONS', difficulty: 2, emoji: '🦆' },
  { id: 'werfen', german: 'werfen', english: 'to throw', category: 'ACTIONS', difficulty: 2, emoji: '⚾' },
  { id: 'druecken', german: 'drücken', english: 'to push', category: 'ACTIONS', difficulty: 2, emoji: '🔘' },

  // 5. FOOD (10)
  { id: 'apfel', german: 'Apfel', english: 'apple', category: 'FOOD', difficulty: 1, emoji: '🍎' },
  { id: 'brot', german: 'Brot', english: 'bread', category: 'FOOD', difficulty: 1, emoji: '🍞' },
  { id: 'wasser', german: 'Wasser', english: 'water', category: 'FOOD', difficulty: 1, emoji: '💧' },
  { id: 'kaffee', german: 'Kaffee', english: 'coffee', category: 'FOOD', difficulty: 1, emoji: '☕' },
  { id: 'doener', german: 'Döner', english: 'doner kebab', category: 'FOOD', difficulty: 1, emoji: '🥙' },
  { id: 'kaese', german: 'Käse', english: 'cheese', category: 'FOOD', difficulty: 1, emoji: '🧀' },
  { id: 'ei', german: 'Ei', english: 'egg', category: 'FOOD', difficulty: 1, emoji: '🥚' },
  { id: 'milch', german: 'Milch', english: 'milk', category: 'FOOD', difficulty: 1, emoji: '🥛' },
  { id: 'tee', german: 'Tee', english: 'tea', category: 'FOOD', difficulty: 1, emoji: '🍵' },
  { id: 'fleisch', german: 'Fleisch', english: 'meat', category: 'FOOD', difficulty: 2, emoji: '🥩' },

  // 6. BODY (7)
  { id: 'kopf', german: 'Kopf', english: 'head', category: 'BODY', difficulty: 1, emoji: '🗣️' },
  { id: 'hand', german: 'Hand', english: 'hand', category: 'BODY', difficulty: 1, emoji: '✋' },
  { id: 'fuss', german: 'Fuß', english: 'foot', category: 'BODY', difficulty: 1, emoji: '🦶' },
  { id: 'auge', german: 'Auge', english: 'eye', category: 'BODY', difficulty: 1, emoji: '👁️' },
  { id: 'ohr', german: 'Ohr', english: 'ear', category: 'BODY', difficulty: 1, emoji: '👂' },
  { id: 'nase', german: 'Nase', english: 'nose', category: 'BODY', difficulty: 1, emoji: '👃' },
  { id: 'mund', german: 'Mund', english: 'mouth', category: 'BODY', difficulty: 1, emoji: '👄' },

  // 7. ANIMALS (6)
  { id: 'hund', german: 'Hund', english: 'dog', category: 'ANIMALS', difficulty: 1, emoji: '🐕' },
  { id: 'katze', german: 'Katze', english: 'cat', category: 'ANIMALS', difficulty: 1, emoji: '🐈' },
  { id: 'vogel', german: 'Vogel', english: 'bird', category: 'ANIMALS', difficulty: 2, emoji: '🐦' },
  { id: 'fisch', german: 'Fisch', english: 'fish', category: 'ANIMALS', difficulty: 1, emoji: '🐟' },
  { id: 'maus', german: 'Maus', english: 'mouse', category: 'ANIMALS', difficulty: 1, emoji: '🐁' },
  { id: 'baer', german: 'Bär', english: 'bear', category: 'ANIMALS', difficulty: 1, emoji: '🐻' },

  // 8. OBJECTS (8)
  { id: 'tisch', german: 'Tisch', english: 'table', category: 'OBJECTS', difficulty: 1, emoji: '🪑' },
  { id: 'stuhl', german: 'Stuhl', english: 'chair', category: 'OBJECTS', difficulty: 2, emoji: '🪑' },
  { id: 'tuer', german: 'Tür', english: 'door', category: 'OBJECTS', difficulty: 1, emoji: '🚪' },
  { id: 'fenster', german: 'Fenster', english: 'window', category: 'OBJECTS', difficulty: 2, emoji: '🪟' },
  { id: 'buch', german: 'Buch', english: 'book', category: 'OBJECTS', difficulty: 1, emoji: '📖' },
  { id: 'auto', german: 'Auto', english: 'car', category: 'OBJECTS', difficulty: 1, emoji: '🚗' },
  { id: 'ball', german: 'Ball', english: 'ball', category: 'OBJECTS', difficulty: 1, emoji: '⚽' },
  { id: 'schluessel', german: 'Schlüssel', english: 'key', category: 'OBJECTS', difficulty: 3, emoji: '🔑' },

  // 9. CLOTHING (5)
  { id: 'hut', german: 'Hut', english: 'hat', category: 'CLOTHING', difficulty: 1, emoji: '🎩' },
  { id: 'schuh', german: 'Schuh', english: 'shoe', category: 'CLOTHING', difficulty: 2, emoji: '👞' },
  { id: 'hose', german: 'Hose', english: 'pants', category: 'CLOTHING', difficulty: 1, emoji: '👖' },
  { id: 'jacke', german: 'Jacke', english: 'jacket', category: 'CLOTHING', difficulty: 2, emoji: '🧥' },
  { id: 'kleid', german: 'Kleid', english: 'dress', category: 'CLOTHING', difficulty: 2, emoji: '👗' },

  // 10. WEATHER (5)
  { id: 'sonne', german: 'Sonne', english: 'sun', category: 'WEATHER', difficulty: 1, emoji: '☀️' },
  { id: 'regen', german: 'Regen', english: 'rain', category: 'WEATHER', difficulty: 1, emoji: '🌧️' },
  { id: 'schnee', german: 'Schnee', english: 'snow', category: 'WEATHER', difficulty: 2, emoji: '❄️' },
  { id: 'wind', german: 'Wind', english: 'wind', category: 'WEATHER', difficulty: 1, emoji: '💨' },
  { id: 'wolke', german: 'Wolke', english: 'cloud', category: 'WEATHER', difficulty: 2, emoji: '☁️' },

  // 11. PLACES (8)
  { id: 'haus', german: 'Haus', english: 'house', category: 'PLACES', difficulty: 1, emoji: '🏠' },
  { id: 'schule', german: 'Schule', english: 'school', category: 'PLACES', difficulty: 2, emoji: '🏫' },
  { id: 'park', german: 'Park', english: 'park', category: 'PLACES', difficulty: 1, emoji: '🌳' },
  { id: 'strasse', german: 'Straße', english: 'street', category: 'PLACES', difficulty: 2, emoji: '🛣️' },
  { id: 'laden', german: 'Laden', english: 'shop', category: 'PLACES', difficulty: 2, emoji: '🏪' },
  { id: 'spaeti', german: 'Späti', english: 'kiosk', category: 'PLACES', difficulty: 1, emoji: '🏬' },
  { id: 'ubahn', german: 'U-Bahn', english: 'subway', category: 'PLACES', difficulty: 2, emoji: '🚇' },
  { id: 'bahnhof', german: 'Bahnhof', english: 'train station', category: 'PLACES', difficulty: 3, emoji: '🚉' },

  // 12. TIME (6)
  { id: 'tag', german: 'Tag', english: 'day', category: 'TIME', difficulty: 1, emoji: '🌅' },
  { id: 'nacht', german: 'Nacht', english: 'night', category: 'TIME', difficulty: 1, emoji: '🌃' },
  { id: 'morgen', german: 'Morgen', english: 'morning', category: 'TIME', difficulty: 1, emoji: '🌄' },
  { id: 'abend', german: 'Abend', english: 'evening', category: 'TIME', difficulty: 2, emoji: '🌇' },
  { id: 'uhr', german: 'Uhr', english: 'clock/o clock', category: 'TIME', difficulty: 1, emoji: '⏰' },
  { id: 'stunde', german: 'Stunde', english: 'hour', category: 'TIME', difficulty: 2, emoji: '⏳' },

  // 13. ADJECTIVES (10)
  { id: 'gross', german: 'groß', english: 'big', category: 'ADJECTIVES', difficulty: 1, emoji: '🐘' },
  { id: 'klein', german: 'klein', english: 'small', category: 'ADJECTIVES', difficulty: 1, emoji: '🐜' },
  { id: 'schnell', german: 'schnell', english: 'fast', category: 'ADJECTIVES', difficulty: 2, emoji: '⚡' },
  { id: 'langsam', german: 'langsam', english: 'slow', category: 'ADJECTIVES', difficulty: 2, emoji: '🐢' },
  { id: 'heiss', german: 'heiß', english: 'hot', category: 'ADJECTIVES', difficulty: 2, emoji: '🔥' },
  { id: 'kalt', german: 'kalt', english: 'cold', category: 'ADJECTIVES', difficulty: 1, emoji: '🧊' },
  { id: 'neu', german: 'neu', english: 'new', category: 'ADJECTIVES', difficulty: 1, emoji: '✨' },
  { id: 'alt', german: 'alt', english: 'old', category: 'ADJECTIVES', difficulty: 1, emoji: '📜' },
  { id: 'gut', german: 'gut', english: 'good', category: 'ADJECTIVES', difficulty: 1, emoji: '👍' },
  { id: 'schlecht', german: 'schlecht', english: 'bad', category: 'ADJECTIVES', difficulty: 3, emoji: '👎' },

  // 14. GREETINGS & BASICS (9)
  { id: 'hallo', german: 'Hallo', english: 'Hello', category: 'GREETINGS', difficulty: 1, emoji: '👋' },
  { id: 'tschuess', german: 'Tschüss', english: 'Bye', category: 'GREETINGS', difficulty: 2, emoji: '🙋' },
  { id: 'danke', german: 'Danke', english: 'Thank you', category: 'GREETINGS', difficulty: 1, emoji: '🙏' },
  { id: 'bitte', german: 'Bitte', english: 'Please/Welcome', category: 'GREETINGS', difficulty: 1, emoji: '🤝' },
  { id: 'ja', german: 'Ja', english: 'Yes', category: 'GREETINGS', difficulty: 1, emoji: '✅' },
  { id: 'nein', german: 'Nein', english: 'No', category: 'GREETINGS', difficulty: 1, emoji: '❌' },
  { id: 'entschuldigung', german: 'Entschuldigung', english: 'Excuse me / Sorry', category: 'GREETINGS', difficulty: 3, emoji: '🙇' },
  { id: 'ausgang', german: 'Ausgang', english: 'Exit', category: 'GREETINGS', difficulty: 2, emoji: '🚪' },
  { id: 'eingang', german: 'Eingang', english: 'Entrance', category: 'GREETINGS', difficulty: 2, emoji: '🚪' }
];

export class VocabularyDB {
  static getAllWords() {
    return VOCABULARY_LIST;
  }

  static getWordById(id) {
    return VOCABULARY_LIST.find(w => w.id === id) || null;
  }

  static getWordsByCategory(category) {
    return VOCABULARY_LIST.filter(w => w.category === category);
  }

  static getWordsByDifficulty(level) {
    return VOCABULARY_LIST.filter(w => w.difficulty === level);
  }

  static getRandomWords(count = 5, category = null) {
    let pool = category ? this.getWordsByCategory(category) : VOCABULARY_LIST;
    if (pool.length === 0) pool = VOCABULARY_LIST;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }
}
