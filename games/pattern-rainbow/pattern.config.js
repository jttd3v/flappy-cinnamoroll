/**
 * Pattern Rainbow - Game Configuration
 * 
 * @module games/pattern-rainbow/pattern.config
 * @version 1.0.0
 */

/**
 * Difficulty presets
 */
export const DIFFICULTY_PRESETS = Object.freeze({
  // Age 6-8: Simple AB patterns
  1: {
    name: 'Rainbow Beginner',
    patternTypes: ['simpleAB'],
    sequenceLength: 5,
    choiceCount: 2,
    hints: Infinity,
    showRule: true
  },
  // Age 9-10: ABC patterns
  2: {
    name: 'Rainbow Explorer',
    patternTypes: ['simpleAB', 'simpleABC'],
    sequenceLength: 5,
    choiceCount: 3,
    hints: 5,
    showRule: true
  },
  // Age 11-12: Double patterns + numbers
  3: {
    name: 'Rainbow Adventurer',
    patternTypes: ['simpleABC', 'doublePattern', 'growing'],
    sequenceLength: 6,
    choiceCount: 3,
    hints: 3,
    showRule: false
  },
  // Age 13-15: Growing + rotation
  4: {
    name: 'Rainbow Champion',
    patternTypes: ['growing', 'skipCount', 'rotation'],
    sequenceLength: 6,
    choiceCount: 4,
    hints: 2,
    showRule: false
  },
  // Age 16-18: Math sequences
  5: {
    name: 'Rainbow Master',
    patternTypes: ['rotation', 'mathDouble', 'mathTriple'],
    sequenceLength: 7,
    choiceCount: 4,
    hints: 1,
    showRule: false
  },
  // Age 19-25: Complex math
  6: {
    name: 'Rainbow Expert',
    patternTypes: ['mathDouble', 'mathTriple', 'mathSquare'],
    sequenceLength: 7,
    choiceCount: 4,
    hints: 0,
    showRule: false
  },
  // Age 26-35: Multi-rule patterns
  7: {
    name: 'Rainbow Legend',
    patternTypes: ['mathSquare', 'fibonacci', 'multiAttribute'],
    sequenceLength: 8,
    choiceCount: 5,
    hints: 0,
    showRule: false
  }
});

/**
 * Main game configuration
 */
export const PATTERN_CONFIG = Object.freeze({
  // Display
  GAME_WIDTH: 400,
  GAME_HEIGHT: 600,
  
  // Game settings
  ROUNDS_PER_LEVEL: 5,
  LEVELS_TO_WIN: 10,
  
  // Scoring
  BASE_POINTS: 100,
  NO_HINT_BONUS: 20,
  STREAK_BONUS: 10,
  PERFECT_LEVEL_BONUS: 200,
  
  // Timing (ms)
  ELEMENT_ANIMATION_DELAY: 100,
  FEEDBACK_DELAY: 1500,
  LEVEL_UP_DELAY: 2000,
  
  // Colors
  BACKGROUND_TOP: '#E8F5E9',
  BACKGROUND_BOTTOM: '#FFF9C4',
  CORRECT_COLOR: '#4CAF50',
  WRONG_COLOR: '#F44336',
  HINT_COLOR: '#FFC107',
  
  // Storage
  LEADERBOARD_KEY: 'patternRainbowLeaderboard',
  PROGRESS_KEY: 'patternRainbowProgress'
});

/**
 * Pattern elements library
 */
export const PATTERN_ELEMENTS = Object.freeze({
  colors: ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚪', '⚫'],
  shapes: ['⭐', '🌙', '☁️', '💖', '🌸', '✨', '🌈', '☀️'],
  animals: ['🐰', '🐱', '🐶', '🐼', '🦊', '🐸', '🦋', '🐞'],
  arrows: ['↑', '→', '↓', '←', '↗', '↘', '↙', '↖'],
  numbers: Array.from({ length: 100 }, (_, i) => i + 1),
  sizes: ['S', 'M', 'L', 'XL']
});

/**
 * Pattern type definitions
 */
export const PATTERN_TYPES = Object.freeze({
  simpleAB: {
    name: 'AB Pattern',
    rule: 'Two elements alternate',
    example: '🔴🔵🔴🔵'
  },
  simpleABC: {
    name: 'ABC Pattern',
    rule: 'Three elements cycle',
    example: '⭐🌙☁️⭐🌙☁️'
  },
  doublePattern: {
    name: 'Double Pattern',
    rule: 'Elements repeat twice',
    example: '🔴🔴🔵🔵🔴🔴'
  },
  growing: {
    name: 'Growing Numbers',
    rule: 'Numbers increase by fixed amount',
    example: '1, 2, 3, 4, 5'
  },
  skipCount: {
    name: 'Skip Counting',
    rule: 'Count by 2s, 3s, 5s, etc.',
    example: '2, 4, 6, 8, 10'
  },
  rotation: {
    name: 'Rotation',
    rule: 'Direction rotates clockwise',
    example: '↑ → ↓ ← ↑'
  },
  mathDouble: {
    name: 'Doubling',
    rule: 'Each number doubles',
    example: '2, 4, 8, 16, 32'
  },
  mathTriple: {
    name: 'Tripling',
    rule: 'Each number triples',
    example: '1, 3, 9, 27, 81'
  },
  mathSquare: {
    name: 'Squares',
    rule: 'Perfect squares',
    example: '1, 4, 9, 16, 25'
  },
  fibonacci: {
    name: 'Fibonacci',
    rule: 'Sum of previous two',
    example: '1, 1, 2, 3, 5, 8'
  },
  multiAttribute: {
    name: 'Multi-Attribute',
    rule: 'Color and shape both change',
    example: '🔴⬛🔵⭐🟢🌙'
  }
});

/**
 * Sound mappings
 */
export const SOUND_EVENTS = Object.freeze({
  ELEMENT_APPEAR: 'click',
  SELECT_CHOICE: 'click',
  CORRECT_ANSWER: 'score',
  WRONG_ANSWER: 'collision',
  USE_HINT: 'powerUp',
  LEVEL_COMPLETE: 'milestone',
  GAME_WIN: 'victory'
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
 * Get config for difficulty level
 */
export function getConfigForDifficulty(level) {
  const preset = DIFFICULTY_PRESETS[level] || DIFFICULTY_PRESETS[1];
  return {
    ...PATTERN_CONFIG,
    ...preset
  };
}

export default PATTERN_CONFIG;
