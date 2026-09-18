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
  // 1. COLORS (6) - Diff 1
  { id: 'rot', german: 'rot', english: 'red', category: 'COLORS', difficulty: 1, imageEmoji: '🔴' },
  { id: 'blau', german: 'blau', english: 'blue', category: 'COLORS', difficulty: 1, imageEmoji: '🔵' },
  { id: 'gruen', german: 'grün', english: 'green', category: 'COLORS', difficulty: 1, imageEmoji: '🟢' },
  { id: 'gelb', german: 'gelb', english: 'yellow', category: 'COLORS', difficulty: 1, imageEmoji: '🟡' },
  { id: 'weiss', german: 'weiß', english: 'white', category: 'COLORS', difficulty: 1, imageEmoji: '⚪' },
  { id: 'schwarz', german: 'schwarz', english: 'black', category: 'COLORS', difficulty: 1, imageEmoji: '⚫' },

  // 2. NUMBERS (10) - Diff 1 & 2
  { id: 'eins', german: 'eins', english: 'one', category: 'NUMBERS', difficulty: 1, imageEmoji: '1️⃣' },
  { id: 'zwei', german: 'zwei', english: 'two', category: 'NUMBERS', difficulty: 1, imageEmoji: '2️⃣' },
  { id: 'drei', german: 'drei', english: 'three', category: 'NUMBERS', difficulty: 1, imageEmoji: '3️⃣' },
  { id: 'vier', german: 'vier', english: 'four', category: 'NUMBERS', difficulty: 1, imageEmoji: '4️⃣' },
  { id: 'fuenf', german: 'fünf', english: 'five', category: 'NUMBERS', difficulty: 1, imageEmoji: '5️⃣' },
  { id: 'sechs', german: 'sechs', english: 'six', category: 'NUMBERS', difficulty: 2, imageEmoji: '6️⃣' },
  { id: 'sieben', german: 'sieben', english: 'seven', category: 'NUMBERS', difficulty: 2, imageEmoji: '7️⃣' },
  { id: 'acht', german: 'acht', english: 'eight', category: 'NUMBERS', difficulty: 2, imageEmoji: '8️⃣' },
  { id: 'neun', german: 'neun', english: 'nine', category: 'NUMBERS', difficulty: 2, imageEmoji: '9️⃣' },
  { id: 'zehn', german: 'zehn', english: 'ten', category: 'NUMBERS', difficulty: 2, imageEmoji: '🔟' },

  // 3. DIRECTIONS (4) - Diff 1
  { id: 'links', german: 'links', english: 'left', category: 'DIRECTIONS', difficulty: 1, imageEmoji: '⬅️' },
  { id: 'rechts', german: 'rechts', english: 'right', category: 'DIRECTIONS', difficulty: 1, imageEmoji: '➡️' },
  { id: 'oben', german: 'oben', english: 'up/top', category: 'DIRECTIONS', difficulty: 1, imageEmoji: '⬆️' },
  { id: 'unten', german: 'unten', english: 'down/bottom', category: 'DIRECTIONS', difficulty: 1, imageEmoji: '⬇️' },

  // 4. ACTIONS (6) - Diff 1 & 2
  { id: 'springen', german: 'springen', english: 'to jump', category: 'ACTIONS', difficulty: 2, imageEmoji: '🦘' },
  { id: 'laufen', german: 'laufen', english: 'to run', category: 'ACTIONS', difficulty: 1, imageEmoji: '🏃' },
  { id: 'stoppen', german: 'stoppen', english: 'to stop', category: 'ACTIONS', difficulty: 1, imageEmoji: '🛑' },
  { id: 'ducken', german: 'ducken', english: 'to duck', category: 'ACTIONS', difficulty: 2, imageEmoji: '🦆' },
  { id: 'werfen', german: 'werfen', english: 'to throw', category: 'ACTIONS', difficulty: 2, imageEmoji: '⚾' },
  { id: 'druecken', german: 'drücken', english: 'to push', category: 'ACTIONS', difficulty: 2, imageEmoji: '🔘' },

  // 5. FOOD (10) - Diff 1 & 2
  { id: 'apfel', german: 'Apfel', english: 'apple', category: 'FOOD', difficulty: 1, imageEmoji: '🍎' },
  { id: 'brot', german: 'Brot', english: 'bread', category: 'FOOD', difficulty: 1, imageEmoji: '🍞' },
  { id: 'wasser', german: 'Wasser', english: 'water', category: 'FOOD', difficulty: 1, imageEmoji: '💧' },
  { id: 'kaffee', german: 'Kaffee', english: 'coffee', category: 'FOOD', difficulty: 1, imageEmoji: '☕' },
  { id: 'doener', german: 'Döner', english: 'doner kebab', category: 'FOOD', difficulty: 1, imageEmoji: '🥙' },
  { id: 'kaese', german: 'Käse', english: 'cheese', category: 'FOOD', difficulty: 2, imageEmoji: '🧀' },
  { id: 'ei', german: 'Ei', english: 'egg', category: 'FOOD', difficulty: 1, imageEmoji: '🥚' },
  { id: 'milch', german: 'Milch', english: 'milk', category: 'FOOD', difficulty: 1, imageEmoji: '🥛' },
  { id: 'fleisch', german: 'Fleisch', english: 'meat', category: 'FOOD', difficulty: 2, imageEmoji: '🥩' },
  { id: 'zucker', german: 'Zucker', english: 'sugar', category: 'FOOD', difficulty: 2, imageEmoji: '🍬' },

  // 6. BODY (7) - Diff 1 & 2
  { id: 'kopf', german: 'Kopf', english: 'head', category: 'BODY', difficulty: 1, imageEmoji: '🗣️' },
  { id: 'hand', german: 'Hand', english: 'hand', category: 'BODY', difficulty: 1, imageEmoji: '✋' },
  { id: 'fuss', german: 'Fuß', english: 'foot', category: 'BODY', difficulty: 1, imageEmoji: '🦶' },
  { id: 'auge', german: 'Auge', english: 'eye', category: 'BODY', difficulty: 2, imageEmoji: '👁️' },
  { id: 'ohr', german: 'Ohr', english: 'ear', category: 'BODY', difficulty: 2, imageEmoji: '👂' },
  { id: 'bauch', german: 'Bauch', english: 'belly', category: 'BODY', difficulty: 1, imageEmoji: '🫄' },
  { id: 'nase', german: 'Nase', english: 'nose', category: 'BODY', difficulty: 2, imageEmoji: '👃' },

  // 7. ANIMALS (6) - Diff 1 & 2
  { id: 'hund', german: 'Hund', english: 'dog', category: 'ANIMALS', difficulty: 1, imageEmoji: '🐶' },
  { id: 'katze', german: 'Katze', english: 'cat', category: 'ANIMALS', difficulty: 1, imageEmoji: '🐱' },
  { id: 'vogel', german: 'Vogel', english: 'bird', category: 'ANIMALS', difficulty: 2, imageEmoji: '🐦' },
  { id: 'fisch', german: 'Fisch', english: 'fish', category: 'ANIMALS', difficulty: 1, imageEmoji: '🐟' },
  { id: 'maus', german: 'Maus', english: 'mouse', category: 'ANIMALS', difficulty: 1, imageEmoji: '🐭' },
  { id: 'pferd', german: 'Pferd', english: 'horse', category: 'ANIMALS', difficulty: 2, imageEmoji: '🐴' },

  // 8. OBJECTS (9) - Diff 1 & 2
  { id: 'tisch', german: 'Tisch', english: 'table', category: 'OBJECTS', difficulty: 1, imageEmoji: '🪵' },
  { id: 'stuhl', german: 'Stuhl', english: 'chair', category: 'OBJECTS', difficulty: 2, imageEmoji: '🪑' },
  { id: 'tuer', german: 'Tür', english: 'door', category: 'OBJECTS', difficulty: 1, imageEmoji: '🚪' },
  { id: 'fenster', german: 'Fenster', english: 'window', category: 'OBJECTS', difficulty: 2, imageEmoji: '🪟' },
  { id: 'buch', german: 'Buch', english: 'book', category: 'OBJECTS', difficulty: 1, imageEmoji: '📖' },
  { id: 'auto', german: 'Auto', english: 'car', category: 'OBJECTS', difficulty: 1, imageEmoji: '🚗' },
  { id: 'ball', german: 'Ball', english: 'ball', category: 'OBJECTS', difficulty: 1, imageEmoji: '⚽' },
  { id: 'lampe', german: 'Lampe', english: 'lamp', category: 'OBJECTS', difficulty: 1, imageEmoji: '💡' },
  { id: 'stift', german: 'Stift', english: 'pen', category: 'OBJECTS', difficulty: 2, imageEmoji: '✏️' },

  // 9. CLOTHING (6) - Diff 1 & 2
  { id: 'hut', german: 'Hut', english: 'hat', category: 'CLOTHING', difficulty: 1, imageEmoji: '🎩' },
  { id: 'schuh', german: 'Schuh', english: 'shoe', category: 'CLOTHING', difficulty: 2, imageEmoji: '👞' },
  { id: 'hose', german: 'Hose', english: 'pants', category: 'CLOTHING', difficulty: 1, imageEmoji: '👖' },
  { id: 'jacke', german: 'Jacke', english: 'jacket', category: 'CLOTHING', difficulty: 2, imageEmoji: '🧥' },
  { id: 'kleid', german: 'Kleid', english: 'dress', category: 'CLOTHING', difficulty: 2, imageEmoji: '👗' },
  { id: 'hemd', german: 'Hemd', english: 'shirt', category: 'CLOTHING', difficulty: 2, imageEmoji: '👔' },

  // 10. WEATHER (5) - Diff 1 & 2
  { id: 'sonne', german: 'Sonne', english: 'sun', category: 'WEATHER', difficulty: 1, imageEmoji: '☀️' },
  { id: 'regen', german: 'Regen', english: 'rain', category: 'WEATHER', difficulty: 2, imageEmoji: '🌧️' },
  { id: 'schnee', german: 'Schnee', english: 'snow', category: 'WEATHER', difficulty: 2, imageEmoji: '❄️' },
  { id: 'wind', german: 'Wind', english: 'wind', category: 'WEATHER', difficulty: 1, imageEmoji: '💨' },
  { id: 'wolke', german: 'Wolke', english: 'cloud', category: 'WEATHER', difficulty: 2, imageEmoji: '☁️' },

  // 11. PLACES (7) - Diff 2 & 3
  { id: 'haus', german: 'Haus', english: 'house', category: 'PLACES', difficulty: 1, imageEmoji: '🏠' },
  { id: 'schule', german: 'Schule', english: 'school', category: 'PLACES', difficulty: 2, imageEmoji: '🏫' },
  { id: 'park', german: 'Park', english: 'park', category: 'PLACES', difficulty: 1, imageEmoji: '🌳' },
  { id: 'strasse', german: 'Straße', english: 'street', category: 'PLACES', difficulty: 2, imageEmoji: '🛣️' },
  { id: 'laden', german: 'Laden', english: 'shop', category: 'PLACES', difficulty: 2, imageEmoji: '🏬' },
  { id: 'spaeti', german: 'Späti', english: 'kiosk', category: 'PLACES', difficulty: 2, imageEmoji: '🏪' },
  { id: 'ubahn', german: 'U-Bahn', english: 'subway', category: 'PLACES', difficulty: 3, imageEmoji: '🚇' },

  // 12. TIME (6) - Diff 2 & 3
  { id: 'tag', german: 'Tag', english: 'day', category: 'TIME', difficulty: 1, imageEmoji: '📅' },
  { id: 'nacht', german: 'Nacht', english: 'night', category: 'TIME', difficulty: 2, imageEmoji: '🌙' },
  { id: 'morgen', german: 'Morgen', english: 'morning', category: 'TIME', difficulty: 2, imageEmoji: '🌅' },
  { id: 'abend', german: 'Abend', english: 'evening', category: 'TIME', difficulty: 2, imageEmoji: '🌆' },
  { id: 'uhr', german: 'Uhr', english: 'clock/o\'clock', category: 'TIME', difficulty: 1, imageEmoji: '⏰' },
  { id: 'stunde', german: 'Stunde', english: 'hour', category: 'TIME', difficulty: 3, imageEmoji: '⏳' },

  // 13. ADJECTIVES (10) - Diff 2 & 3
  { id: 'gross', german: 'groß', english: 'big', category: 'ADJECTIVES', difficulty: 1, imageEmoji: '🐘' },
  { id: 'klein', german: 'klein', english: 'small', category: 'ADJECTIVES', difficulty: 1, imageEmoji: '🐜' },
  { id: 'schnell', german: 'schnell', english: 'fast', category: 'ADJECTIVES', difficulty: 2, imageEmoji: '⚡' },
  { id: 'langsam', german: 'langsam', english: 'slow', category: 'ADJECTIVES', difficulty: 3, imageEmoji: '🐢' },
  { id: 'heiss', german: 'heiß', english: 'hot', category: 'ADJECTIVES', difficulty: 2, imageEmoji: '🔥' },
  { id: 'kalt', german: 'kalt', english: 'cold', category: 'ADJECTIVES', difficulty: 1, imageEmoji: '🧊' },
  { id: 'neu', german: 'neu', english: 'new', category: 'ADJECTIVES', difficulty: 1, imageEmoji: '✨' },
  { id: 'alt', german: 'alt', english: 'old', category: 'ADJECTIVES', difficulty: 1, imageEmoji: '📜' },
  { id: 'gut', german: 'gut', english: 'good', category: 'ADJECTIVES', difficulty: 1, imageEmoji: '👍' },
  { id: 'schlecht', german: 'schlecht', english: 'bad', category: 'ADJECTIVES', difficulty: 3, imageEmoji: '👎' },

  // 14. GREETINGS (8) - Diff 1, 2 & 3
  { id: 'hallo', german: 'Hallo', english: 'hello', category: 'GREETINGS', difficulty: 1, imageEmoji: '👋' },
  { id: 'tschuess', german: 'Tschüss', english: 'bye', category: 'GREETINGS', difficulty: 2, imageEmoji: '🙋' },
  { id: 'danke', german: 'Danke', english: 'thank you', category: 'GREETINGS', difficulty: 1, imageEmoji: '🙏' },
  { id: 'bitte', german: 'Bitte', english: 'please/you\'re welcome', category: 'GREETINGS', difficulty: 2, imageEmoji: '🤲' },
  { id: 'ja', german: 'Ja', english: 'yes', category: 'GREETINGS', difficulty: 1, imageEmoji: '✅' },
  { id: 'nein', german: 'Nein', english: 'no', category: 'GREETINGS', difficulty: 1, imageEmoji: '❌' },
  { id: 'willkommen', german: 'Willkommen', english: 'welcome', category: 'GREETINGS', difficulty: 2, imageEmoji: '🎉' },
  { id: 'entschuldigung', german: 'Entschuldigung', english: 'excuse me/sorry', category: 'GREETINGS', difficulty: 3, imageEmoji: '🙇' }
];

export class VocabularyDB {
  static getWordsByCategory(category) {
    return VOCABULARY_LIST.filter(w => w.category === category);
  }

  static getWordById(id) {
    return VOCABULARY_LIST.find(w => w.id === id) || null;
  }

  static getRandomWords(count = 5) {
    const shuffled = [...VOCABULARY_LIST].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  static getWordsByDifficulty(level) {
    return VOCABULARY_LIST.filter(w => w.difficulty === level);
  }

  static getAllWords() {
    return VOCABULARY_LIST;
  }
}
