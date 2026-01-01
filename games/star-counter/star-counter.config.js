/**
 * Star Counter - Game Configuration
 * 
 * @module games/star-counter/star-counter.config
 * @version 1.0.0
 */

/**
 * Difficulty presets by level
 */
export const DIFFICULTY_PRESETS = Object.freeze({
  // Age 6-8: Number Recognition
  1: {
    name: 'Tiny Stars',
    mathType: 'recognition',
    starCount: 3,
    starSpeed: 1.5,
    spawnInterval: 3000,
    lives: 5,
    showHint: true
  },
  // Age 9-10: Simple Addition
  2: {
    name: 'Little Stars',
    mathType: 'addition',
    numberRange: [1, 10],
    starCount: 3,
    starSpeed: 2,
    spawnInterval: 2500,
    lives: 5,
    showHint: true
  },
  // Age 11-12: Add/Subtract
  3: {
    name: 'Bright Stars',
    mathType: 'addSubtract',
    numberRange: [1, 20],
    starCount: 4,
    starSpeed: 2.5,
    spawnInterval: 2200,
    lives: 4,
    showHint: false
  },
  // Age 13-15: Multiply/Divide
  4: {
    name: 'Shining Stars',
    mathType: 'multiplyDivide',
    numberRange: [2, 12],
    starCount: 4,
    starSpeed: 3,
    spawnInterval: 2000,
    lives: 3,
    showHint: false
  },
  // Age 16-18: Mixed Operations
  5: {
    name: 'Blazing Stars',
    mathType: 'mixed',
    numberRange: [1, 20],
    starCount: 5,
    starSpeed: 3.5,
    spawnInterval: 1800,
    lives: 3,
    showHint: false
  },
  // Age 19-25: Fractions & Percentages
  6: {
    name: 'Super Stars',
    mathType: 'fractionsPercent',
    starCount: 5,
    starSpeed: 4,
    spawnInterval: 1600,
    lives: 3,
    showHint: false
  },
  // Age 26-35: Basic Algebra
  7: {
    name: 'Mega Stars',
    mathType: 'algebra',
    starCount: 6,
    starSpeed: 4.5,
    spawnInterval: 1400,
    lives: 2,
    showHint: false
  }
});

/**
 * Main game configuration
 */
export const STAR_CONFIG = Object.freeze({
  // Canvas
  CANVAS_WIDTH: 400,
  CANVAS_HEIGHT: 600,
  
  // Player
  PLAYER_WIDTH: 50,
  PLAYER_HEIGHT: 50,
  PLAYER_SPEED: 8,
  PLAYER_Y_OFFSET: 80, // From bottom
  
  // Stars
  STAR_WIDTH: 60,
  STAR_HEIGHT: 60,
  STAR_ROTATION_SPEED: 0.02,
  
  // Scoring
  BASE_POINTS: 100,
  WRONG_PENALTY: 50,
  COMBO_THRESHOLDS: {
    2: 1.5,
    3: 2,
    5: 3,
    10: 5
  },
  
  // Colors
  BACKGROUND_TOP: '#1a1a2e',
  BACKGROUND_BOTTOM: '#16213e',
  STAR_COLOR_CORRECT: '#FFD700',
  STAR_COLOR_WRONG: '#FFA500',
  CORRECT_FLASH: '#4CAF50',
  WRONG_FLASH: '#F44336',
  
  // UI
  PROBLEM_BOX_WIDTH: 220,
  PROBLEM_BOX_HEIGHT: 50,
  
  // Storage
  LEADERBOARD_KEY: 'starCounterLeaderboard',
  PROGRESS_KEY: 'starCounterProgress'
});

/**
 * Math operation symbols
 */
export const MATH_SYMBOLS = Object.freeze({
  ADD: '+',
  SUBTRACT: '−',
  MULTIPLY: '×',
  DIVIDE: '÷',
  EQUALS: '='
});

/**
 * Sound event mappings
 */
export const SOUND_EVENTS = Object.freeze({
  STAR_CATCH_CORRECT: 'score',
  STAR_CATCH_WRONG: 'collision',
  COMBO_UP: 'powerUp',
  COMBO_BREAK: 'wrong',
  NEW_PROBLEM: 'click',
  GAME_OVER: 'gameOver'
});

/**
 * Get difficulty from age
 */
export function getDifficultyFromAge(age) {
  if (age <= 8) return 1;
  if (age <= 10) return 2;
  if (age <= 12) return 3;
  if (age <= 15) return 4;
  if (age <= 18) return 5;
  if (age <= 25) return 6;
  return 7;
}

/**
 * Get merged config for difficulty level
 */
export function getConfigForDifficulty(level) {
  const preset = DIFFICULTY_PRESETS[level] || DIFFICULTY_PRESETS[1];
  return {
    ...STAR_CONFIG,
    ...preset
  };
}

export default STAR_CONFIG;
