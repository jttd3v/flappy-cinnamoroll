/**
 * Puzzle Cloud Path - Configuration
 */

export const PUZZLE_CONFIG = Object.freeze({
  ANIMATION_DURATION: 150,  // ms
  
  DIFFICULTY_SETTINGS: {
    1: { gridSize: 2, moveLimit: null, timeLimit: null, showTarget: true },
    2: { gridSize: 3, moveLimit: null, timeLimit: null, showTarget: true },
    3: { gridSize: 3, moveLimit: null, timeLimit: null, showTarget: false },
    4: { gridSize: 4, moveLimit: null, timeLimit: null, showTarget: false },
    5: { gridSize: 4, moveLimit: 50, timeLimit: null, showTarget: false },
    6: { gridSize: 5, moveLimit: 80, timeLimit: 180, showTarget: false },
    7: { gridSize: 5, moveLimit: 60, timeLimit: 120, showTarget: false }
  },
  
  STAR_THRESHOLDS: {
    // Percentage of optimal moves
    3: 1.2,   // Within 20% of optimal
    2: 1.5,   // Within 50% of optimal
    1: 2.0    // Within 100% of optimal
  },
  
  TILE_THEMES: {
    numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'],
    cinnamoroll: ['🐰', '☁️', '💭', '⭐', '🌸', '🎀', '🍬', '💖'],
    animals: ['🐶', '🐱', '🐰', '🐼', '🦊', '🐸', '🐨', '🐯'],
    food: ['🍎', '🍊', '🍋', '🍇', '🍓', '🥕', '🍕', '🍰'],
    space: ['🌟', '🌙', '☀️', '🪐', '🚀', '👽', '🌈', '⭐']
  },
  
  HINTS_PER_PUZZLE: 3,
  
  LEADERBOARD_KEY: 'puzzlePathLeaderboard'
});

export const PUZZLES = [
  { id: 'easy_1', name: 'First Steps', difficulty: 1, theme: 'numbers', gridSize: 2 },
  { id: 'easy_2', name: 'Getting Started', difficulty: 2, theme: 'cinnamoroll', gridSize: 3 },
  { id: 'med_1', name: 'Cloud Nine', difficulty: 3, theme: 'cinnamoroll', gridSize: 3 },
  { id: 'med_2', name: 'Animal Friends', difficulty: 4, theme: 'animals', gridSize: 4 },
  { id: 'hard_1', name: 'Space Journey', difficulty: 5, theme: 'space', gridSize: 4 },
  { id: 'hard_2', name: 'Master Chef', difficulty: 6, theme: 'food', gridSize: 5 },
  { id: 'expert', name: 'Ultimate Challenge', difficulty: 7, theme: 'numbers', gridSize: 5 }
];

export function getDifficultyFromAge(age) {
  if (age <= 8) return 1;
  if (age <= 10) return 2;
  if (age <= 12) return 3;
  if (age <= 15) return 4;
  if (age <= 20) return 5;
  if (age <= 25) return 6;
  return 7;
}

export default PUZZLE_CONFIG;
