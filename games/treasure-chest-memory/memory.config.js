/**
 * Treasure Chest Memory - Game Configuration
 * 
 * @module games/treasure-chest-memory/memory.config
 * @version 1.0.0
 */

/**
 * Difficulty presets based on age
 */
export const DIFFICULTY_PRESETS = Object.freeze({
  // Age 6-8: Very Easy
  1: {
    name: 'Beginner',
    gridCols: 2,
    gridRows: 3,
    pairs: 3,
    timeLimit: null,
    previewTime: 3000,
    flipDelay: 1500
  },
  // Age 9-12: Easy
  2: {
    name: 'Easy',
    gridCols: 3,
    gridRows: 4,
    pairs: 6,
    timeLimit: null,
    previewTime: 2000,
    flipDelay: 1200
  },
  // Age 13-15: Medium
  3: {
    name: 'Medium',
    gridCols: 4,
    gridRows: 4,
    pairs: 8,
    timeLimit: 120,
    previewTime: 1000,
    flipDelay: 1000
  },
  // Age 16-18: Hard
  4: {
    name: 'Hard',
    gridCols: 4,
    gridRows: 5,
    pairs: 10,
    timeLimit: 90,
    previewTime: 0,
    flipDelay: 800
  },
  // Age 19-25: Expert
  5: {
    name: 'Expert',
    gridCols: 5,
    gridRows: 4,
    pairs: 10,
    timeLimit: 60,
    previewTime: 0,
    flipDelay: 600
  },
  // Age 26-35: Master
  6: {
    name: 'Master',
    gridCols: 6,
    gridRows: 4,
    pairs: 12,
    timeLimit: 45,
    previewTime: 0,
    flipDelay: 500
  }
});

/**
 * Main game configuration
 */
export const MEMORY_CONFIG = Object.freeze({
  // Canvas/Display
  GAME_WIDTH: 400,
  GAME_HEIGHT: 600,
  
  // Scoring
  BASE_SCORE: 1000,
  FLIP_PENALTY: 10,
  TIME_BONUS_PER_SECOND: 5,
  PERFECT_MULTIPLIER: 2,
  
  // Card appearance
  CARD_WIDTH: 70,
  CARD_HEIGHT: 90,
  CARD_GAP: 10,
  CARD_BORDER_RADIUS: 10,
  
  // Animation timing (ms)
  FLIP_DURATION: 400,
  MATCH_DELAY: 500,
  WRONG_SHAKE_DURATION: 300,
  
  // Colors
  CARD_BACK_COLOR: '#8B4513',
  CARD_BACK_GRADIENT: 'linear-gradient(145deg, #8B4513, #654321)',
  CARD_FRONT_COLOR: '#FFFFFF',
  CARD_BORDER_COLOR: '#FFB6C1',
  MATCH_GLOW_COLOR: '#FFD700',
  
  // Storage
  LEADERBOARD_KEY: 'memoryLeaderboard',
  LEADERBOARD_MAX: 10,
  PROGRESS_KEY: 'memoryProgress',
  
  // Default theme
  DEFAULT_THEME: 'cinnamoroll'
});

/**
 * Card themes with images
 */
export const CARD_THEMES = Object.freeze({
  cinnamoroll: {
    name: 'Cinnamoroll Friends',
    images: ['🐰', '☁️', '🌟', '💖', '🎀', '🍰', '🧁', '🍬', '🌈', '🎈', '🍭', '🌸']
  },
  sweets: {
    name: 'Sweet Treats',
    images: ['🍰', '🧁', '🍩', '🍪', '🍫', '🍬', '🍭', '🎂', '🍦', '🍡', '🥧', '🍮']
  },
  nature: {
    name: 'Nature',
    images: ['🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '🍀', '🌿', '🌴', '🌵', '🍄', '🌾']
  },
  animals: {
    name: 'Cute Animals',
    images: ['🐰', '🐱', '🐶', '🐼', '🐨', '🦊', '🐸', '🐝', '🦋', '🐞', '🐢', '🦄']
  },
  numbers: {
    name: 'Numbers',
    images: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '💯', '🔢']
  },
  letters: {
    name: 'Letters',
    images: ['🅰️', '🅱️', '©️', '®️', 'Ⓜ️', '🔤', '🔡', '🔠', 'ℹ️', '🆎', '🆑', '🆒']
  }
});

/**
 * Star rating thresholds
 */
export const STAR_THRESHOLDS = Object.freeze({
  THREE_STAR: 0.9,  // 90%+ of optimal flips
  TWO_STAR: 0.6,    // 60%+ of optimal flips
  ONE_STAR: 0       // Completed game
});

/**
 * Sound mappings
 */
export const SOUND_EVENTS = Object.freeze({
  CARD_FLIP: 'click',
  MATCH_FOUND: 'score',
  NO_MATCH: 'wrong',
  GAME_WIN: 'victory',
  STAR_EARNED: 'powerUp',
  TIMER_WARNING: 'tick'
});

/**
 * Get difficulty level from age
 * @param {number} age - User age (6-35)
 * @returns {number} Difficulty level (1-6)
 */
export function getDifficultyFromAge(age) {
  if (age <= 8) return 1;
  if (age <= 12) return 2;
  if (age <= 15) return 3;
  if (age <= 18) return 4;
  if (age <= 25) return 5;
  return 6;
}

/**
 * Get config for specific difficulty
 * @param {number} level - Difficulty level (1-6)
 * @returns {Object} Merged config
 */
export function getConfigForDifficulty(level) {
  const difficultyConfig = DIFFICULTY_PRESETS[level] || DIFFICULTY_PRESETS[1];
  return {
    ...MEMORY_CONFIG,
    ...difficultyConfig
  };
}

export default MEMORY_CONFIG;
