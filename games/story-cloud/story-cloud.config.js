/**
 * Story Cloud Adventure - Configuration
 */

export const STORY_CONFIG = Object.freeze({
  TEXT_SPEED: {
    slow: 80,
    normal: 50,
    fast: 25,
    instant: 0
  },
  
  DIFFICULTY_SETTINGS: {
    1: { wordsPerPage: 20, questionType: 'who_what', readingLevel: 'K-1' },
    2: { wordsPerPage: 40, questionType: 'where_when', readingLevel: '2-3' },
    3: { wordsPerPage: 80, questionType: 'why_how', readingLevel: '4-5' },
    4: { wordsPerPage: 120, questionType: 'inference', readingLevel: '6-8' },
    5: { wordsPerPage: 180, questionType: 'analysis', readingLevel: '9-10' },
    6: { wordsPerPage: 250, questionType: 'theme', readingLevel: '11-12' },
    7: { wordsPerPage: 400, questionType: 'critical', readingLevel: 'college' }
  },
  
  QUESTION_TYPES: {
    who_what: 'Literal - Who/What questions',
    where_when: 'Literal - Where/When questions',
    why_how: 'Inferential - Why/How questions',
    inference: 'Draw conclusions from text',
    analysis: 'Analyze character/plot',
    theme: 'Identify themes and symbols',
    critical: 'Critical evaluation'
  },
  
  LEADERBOARD_KEY: 'storyCloudLeaderboard'
});

export const STORIES = [
  { id: 'cloud-adventure', title: 'Cloud Adventure', difficulty: 1, pages: 12 },
  { id: 'rainbow-quest', title: 'Rainbow Quest', difficulty: 2, pages: 18 },
  { id: 'star-journey', title: 'Star Journey', difficulty: 3, pages: 24 },
  { id: 'dream-mystery', title: 'Dream Mystery', difficulty: 5, pages: 36 }
];

export function getDifficultyFromAge(age) {
  if (age <= 8) return 1;
  if (age <= 10) return 2;
  if (age <= 12) return 3;
  if (age <= 15) return 4;
  if (age <= 18) return 5;
  if (age <= 25) return 6;
  return 7;
}

export default STORY_CONFIG;
