/**
 * Proverb Ascension - Configuration
 * 
 * Exported configuration for module imports.
 * Note: This is duplicated in ProverbAscensionGame.js for file:// compatibility.
 * 
 * @version 1.0.0
 */

export const PROVERB_CONFIG = Object.freeze({
    CANVAS_WIDTH: 400,
    CANVAS_HEIGHT: 300,
    
    // Storage Keys
    STORAGE_KEY: 'proverbAscensionProgress',
    LEADERBOARD_KEY: 'proverbAscensionLeaderboard',
    
    // Timing (milliseconds)
    READ_PHASE_MIN_TIME: 5000,
    RECALL_TIME_LIMIT: 60000,
    
    // Spaced Repetition Intervals (minutes)
    INTERVALS: [2, 5, 10, 20, 40],
    
    // Cognitive Load Control
    MAX_ACTIVE_PROVERBS: 2,
    
    // Scoring
    POINTS: {
        CLEAR_PARAPHRASE: 10,
        STRONG_ANCHOR: 10,
        ACCURATE_RECALL: 15,
        PERFECT_STREAK: 20,
        LEVEL_MASTERY: 50
    },
    
    // Validation - Minimum words by difficulty
    MIN_PARAPHRASE_WORDS: {
        1: 3, 2: 5, 3: 8, 4: 12, 5: 15, 6: 20, 7: 25
    },
    MIN_ANCHOR_WORDS: {
        1: 3, 2: 5, 3: 8, 4: 10, 5: 12, 6: 15, 7: 20
    }
});

export const DIFFICULTY_PRESETS = Object.freeze({
    1: { name: 'Seedling', hintLevel: 'full', intervalMultiplier: 0.5, minWords: 3 },
    2: { name: 'Sprout', hintLevel: 'firstLetter', intervalMultiplier: 0.7, minWords: 5 },
    3: { name: 'Sapling', hintLevel: 'keywords', intervalMultiplier: 1.0, minWords: 8 },
    4: { name: 'Tree', hintLevel: 'limited', intervalMultiplier: 1.0, minWords: 12 },
    5: { name: 'Oak', hintLevel: 'none', intervalMultiplier: 1.2, minWords: 15 },
    6: { name: 'Ancient', hintLevel: 'none', intervalMultiplier: 1.5, minWords: 20 },
    7: { name: 'Sage', hintLevel: 'none', intervalMultiplier: 2.0, minWords: 25 }
});

export const PROVERBS_DATA = Object.freeze([
    {
        id: 1,
        reference: 'Proverbs 1:1',
        text: 'The proverbs of Solomon son of David, king of Israel:',
        theme: 'Purpose',
        keywords: ['proverbs', 'solomon', 'david', 'king', 'israel'],
        meaning: 'These are wise sayings from King Solomon, son of King David, meant to guide the people of Israel.',
        applicationHint: 'Think about why learning from wise leaders matters.'
    },
    {
        id: 2,
        reference: 'Proverbs 1:2',
        text: 'for gaining wisdom and instruction, for understanding words of insight,',
        theme: 'Understanding',
        keywords: ['gaining', 'wisdom', 'instruction', 'understanding', 'insight'],
        meaning: 'These proverbs help us gain wisdom, learn important lessons, and understand deep truths.',
        applicationHint: 'Consider a time when understanding something deeply changed your actions.'
    },
    {
        id: 3,
        reference: 'Proverbs 1:3',
        text: 'for receiving instruction in prudent behavior, doing what is right and just and fair;',
        theme: 'Moral Judgment',
        keywords: ['instruction', 'prudent', 'right', 'just', 'fair'],
        meaning: 'These teachings help us learn wise behavior and how to act rightly, justly, and fairly toward others.',
        applicationHint: 'Think of a situation where you had to choose between right and wrong.'
    },
    {
        id: 4,
        reference: 'Proverbs 1:4',
        text: 'for giving prudence to those who are simple, knowledge and discretion to the young—',
        theme: 'Discretion & Youth',
        keywords: ['prudence', 'simple', 'knowledge', 'discretion', 'young'],
        meaning: 'Wisdom helps inexperienced people become careful and thoughtful, giving young people knowledge and good judgment.',
        applicationHint: 'Remember when good advice protected you from a mistake.'
    },
    {
        id: 5,
        reference: 'Proverbs 1:5',
        text: 'A wise man will hear, and will increase learning; and a man of understanding shall attain unto wise counsels:',
        theme: 'Growth Through Listening',
        difficulty: 'easy',
        keywords: ['wise', 'man', 'hear', 'increase', 'learning', 'understanding', 'attain', 'counsels'],
        meaning: 'Even wise people should keep listening and learning; those with understanding should seek more guidance.',
        applicationHint: 'Think about how you continue to learn even when you already know a lot about something.'
    },
    {
        id: 6,
        reference: 'Proverbs 1:6',
        text: 'To understand a proverb, and the interpretation; the words of the wise, and their dark sayings.',
        theme: 'Deep Understanding',
        difficulty: 'medium',
        keywords: ['understand', 'proverb', 'interpretation', 'words', 'wise', 'dark', 'sayings'],
        meaning: 'These proverbs help us understand wise sayings and their deeper meanings, including the harder-to-grasp teachings of the wise.',
        applicationHint: 'Consider how some wisdom requires deeper thought to fully understand and apply.'
    }
]);

/**
 * Get difficulty level from age
 * @param {number} age - Player age
 * @returns {number} Difficulty level 1-7
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
