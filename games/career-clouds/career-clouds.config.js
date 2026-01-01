/**
 * Career Clouds - Configuration
 */

export const CAREER_CONFIG = Object.freeze({
  MIN_SAMPLES_FOR_ASSESSMENT: 5,
  
  SKILL_CATEGORIES: {
    analytical: ['math', 'logic', 'attention'],
    creative: ['creativity', 'writing', 'spatial'],
    social: ['social', 'caring', 'communication'],
    knowledge: ['reading', 'memory', 'curiosity']
  },
  
  GAME_SKILL_MAPPINGS: {
    'treasure-chest': { memory: 1.0 },
    'star-counter': { math: 1.0 },
    'pattern-rainbow': { logic: 0.7, creativity: 0.3 },
    'quiz-quest': { knowledge: 0.5, memory: 0.5 },
    'candy-shop': { math: 0.8, attention: 0.2 },
    'story-cloud': { reading: 1.0 },
    'dream-journal': { writing: 0.7, creativity: 0.3 },
    'cloud-kingdom': { spatial: 0.6, logic: 0.4 },
    'puzzle-path': { spatial: 0.5, logic: 0.5 }
  },
  
  AGE_GROUPS: {
    child: { min: 6, max: 10 },
    teen: { min: 11, max: 17 },
    adult: { min: 18, max: 35 }
  },
  
  PROFILE_KEY: 'careerCloudsProfile',
  ASSESSMENT_KEY: 'careerCloudsAssessment'
});

export const CAREER_CATEGORIES = [
  { id: 'creative', name: 'Creative Arts', icon: '🎨', color: '#ff6b9d' },
  { id: 'science', name: 'Science & Tech', icon: '🔬', color: '#4ecdc4' },
  { id: 'helping', name: 'Helping Others', icon: '🏥', color: '#ff8e72' },
  { id: 'business', name: 'Business', icon: '💼', color: '#45b7d1' },
  { id: 'nature', name: 'Nature & Environment', icon: '🌍', color: '#96ceb4' },
  { id: 'education', name: 'Education', icon: '📚', color: '#ffeaa7' }
];

export function getAgeGroup(age) {
  if (age <= 10) return 'child';
  if (age <= 17) return 'teen';
  return 'adult';
}

export function getDifficultyFromAge(age) {
  if (age <= 8) return 1;
  if (age <= 10) return 2;
  if (age <= 12) return 3;
  if (age <= 15) return 4;
  if (age <= 18) return 5;
  if (age <= 25) return 6;
  return 7;
}

export default CAREER_CONFIG;
