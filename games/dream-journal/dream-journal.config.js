/**
 * Dream Journal - Configuration
 */

export const JOURNAL_CONFIG = Object.freeze({
  AUTO_SAVE_INTERVAL: 30000,  // 30 seconds
  
  DIFFICULTY_SETTINGS: {
    1: { minWords: 5, maxWords: 20, promptType: 'fill_blank' },
    2: { minWords: 10, maxWords: 30, promptType: 'sentence' },
    3: { minWords: 20, maxWords: 50, promptType: 'short' },
    4: { minWords: 40, maxWords: 100, promptType: 'paragraph' },
    5: { minWords: 80, maxWords: 200, promptType: 'multi_para' },
    6: { minWords: 150, maxWords: 400, promptType: 'essay' },
    7: { minWords: 300, maxWords: 800, promptType: 'reflection' }
  },
  
  STREAK_BADGES: {
    3: { id: 'streak_3', name: '3 Day Streak', icon: '🔥' },
    7: { id: 'streak_7', name: 'Week Writer', icon: '📅' },
    14: { id: 'streak_14', name: 'Two Week Champion', icon: '🏆' },
    30: { id: 'streak_30', name: 'Month Master', icon: '👑' }
  },
  
  WORD_BADGES: {
    100: { id: 'words_100', name: 'First 100 Words', icon: '✍️' },
    500: { id: 'words_500', name: 'Story Teller', icon: '📖' },
    1000: { id: 'words_1000', name: 'Word Wizard', icon: '🧙' },
    5000: { id: 'words_5000', name: 'Author', icon: '📚' }
  },
  
  LEADERBOARD_KEY: 'dreamJournalLeaderboard'
});

export const PROMPT_CATEGORIES = [
  { id: 'imagination', name: 'Imagination', icon: '✨' },
  { id: 'feelings', name: 'Feelings', icon: '💖' },
  { id: 'adventures', name: 'Adventures', icon: '🗺️' },
  { id: 'dreams', name: 'Dreams', icon: '🌙' },
  { id: 'kindness', name: 'Kindness', icon: '🤗' }
];

export function getDifficultyFromAge(age) {
  if (age <= 7) return 1;
  if (age <= 9) return 2;
  if (age <= 12) return 3;
  if (age <= 15) return 4;
  if (age <= 20) return 5;
  if (age <= 25) return 6;
  return 7;
}

export default JOURNAL_CONFIG;
