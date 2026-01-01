/**
 * Quiz Quest - Game Configuration
 */

export const QUIZ_CONFIG = Object.freeze({
  CANVAS_WIDTH: 400,
  CANVAS_HEIGHT: 600,
  
  // Lives
  STARTING_LIVES: 3,
  MAX_LIVES: 5,
  
  // Scoring
  CORRECT_POINTS: 100,
  STREAK_BONUS: 25,
  TIME_BONUS_PER_SECOND: 5,
  PERFECT_LOCATION_BONUS: 200,
  
  // Power-ups (starting count)
  STARTING_POWERUPS: {
    hint: 3,
    fiftyFifty: 2,
    skip: 1,
    extraTime: 2
  },
  
  // Storage
  LEADERBOARD_KEY: 'quizQuestLeaderboard',
  PROGRESS_KEY: 'quizQuestProgress'
});

export const DIFFICULTY_PRESETS = Object.freeze({
  1: { name: 'Explorer', choices: 3, timeLimit: null, hints: Infinity },
  2: { name: 'Adventurer', choices: 3, timeLimit: 60, hints: 5 },
  3: { name: 'Champion', choices: 4, timeLimit: 45, hints: 3 },
  4: { name: 'Hero', choices: 4, timeLimit: 30, hints: 2 },
  5: { name: 'Legend', choices: 4, timeLimit: 25, hints: 1 },
  6: { name: 'Master', choices: 4, timeLimit: 20, hints: 0 },
  7: { name: 'Sage', choices: 5, timeLimit: 15, hints: 0 }
});

export const CATEGORIES = Object.freeze({
  science: { name: 'Science', icon: '🔬', color: '#4CAF50' },
  math: { name: 'Math', icon: '🔢', color: '#2196F3' },
  language: { name: 'Language', icon: '📚', color: '#9C27B0' },
  geography: { name: 'Geography', icon: '🌍', color: '#FF9800' },
  history: { name: 'History', icon: '📜', color: '#795548' },
  logic: { name: 'Logic', icon: '🧩', color: '#607D8B' }
});

export function getDifficultyFromAge(age) {
  if (age <= 8) return 1;
  if (age <= 10) return 2;
  if (age <= 12) return 3;
  if (age <= 15) return 4;
  if (age <= 18) return 5;
  if (age <= 25) return 6;
  return 7;
}

export default QUIZ_CONFIG;
