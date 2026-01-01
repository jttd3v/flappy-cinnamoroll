/**
 * Career Clouds - Main Game Logic
 * A meta-game that analyzes player data from other games to provide career insights
 * 
 * @version 1.0.0
 */

// ==================== Configuration (inlined for file:// compatibility) ====================
const CAREER_CONFIG = Object.freeze({
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

const CAREER_CATEGORIES = [
  { id: 'creative', name: 'Creative Arts', icon: '🎨', color: '#ff6b9d' },
  { id: 'science', name: 'Science & Tech', icon: '🔬', color: '#4ecdc4' },
  { id: 'helping', name: 'Helping Others', icon: '🏥', color: '#ff8e72' },
  { id: 'business', name: 'Business', icon: '💼', color: '#45b7d1' },
  { id: 'nature', name: 'Nature & Environment', icon: '🌍', color: '#96ceb4' },
  { id: 'education', name: 'Education', icon: '📚', color: '#ffeaa7' }
];

function getAgeGroup(age) {
  if (age <= 10) return 'child';
  if (age <= 17) return 'teen';
  return 'adult';
}

function getDifficultyFromAge(age) {
  if (age <= 8) return 1;
  if (age <= 10) return 2;
  if (age <= 12) return 3;
  if (age <= 15) return 4;
  if (age <= 18) return 5;
  if (age <= 25) return 6;
  return 7;
}

// ==================== Career Database ====================
const CAREERS = [
    {
        id: 'artist',
        title: 'Artist / Designer',
        icon: '🎨',
        category: 'creative',
        requiredSkills: { creativity: 0.9, spatial: 0.7 },
        description: 'Create beautiful things that inspire others!',
        ageDescriptions: {
            child: 'You could draw pictures and make cool art!',
            teen: 'Artists design games, movies, and products.',
            adult: 'Creative direction, UX design, illustration.'
        },
        funFacts: [
            'Artists can work in games, movies, or museums!',
            'Some artists use computers, others use paint.',
            'You can become a famous artist at any age!'
        ],
        relatedGames: ['pattern-rainbow', 'puzzle-path']
    },
    {
        id: 'scientist',
        title: 'Scientist / Researcher',
        icon: '🔬',
        category: 'science',
        requiredSkills: { logic: 0.9, math: 0.8, memory: 0.6 },
        description: 'Discover how the world works!',
        ageDescriptions: {
            child: 'You could do experiments and discover new things!',
            teen: 'Scientists explore space, medicine, and nature.',
            adult: 'Research, analysis, and innovation in various fields.'
        },
        funFacts: [
            'Scientists make new discoveries every day!',
            'You could work on curing diseases or exploring space.',
            'Many scientists work in teams around the world.'
        ],
        relatedGames: ['quiz-quest', 'pattern-rainbow']
    },
    {
        id: 'teacher',
        title: 'Teacher / Educator',
        icon: '📚',
        category: 'education',
        requiredSkills: { reading: 0.8, social: 0.8, memory: 0.6 },
        description: 'Help others learn and grow!',
        ageDescriptions: {
            child: 'You could teach your friends cool things!',
            teen: 'Teachers shape the future by helping students.',
            adult: 'Education, training, curriculum development.'
        },
        funFacts: [
            'Teachers help shape the next generation!',
            'You could teach any subject you love.',
            'Teachers work in schools, museums, and online.'
        ],
        relatedGames: ['quiz-quest', 'story-cloud']
    },
    {
        id: 'engineer',
        title: 'Engineer / Builder',
        icon: '🔧',
        category: 'science',
        requiredSkills: { math: 0.9, logic: 0.9, spatial: 0.7 },
        description: 'Build amazing things that help people!',
        ageDescriptions: {
            child: 'You could build robots and cool machines!',
            teen: 'Engineers create technology, buildings, and solutions.',
            adult: 'Software, mechanical, civil, or electrical engineering.'
        },
        funFacts: [
            'Engineers built the phone you might be using!',
            'They design everything from bridges to video games.',
            'Engineering combines creativity with math and science.'
        ],
        relatedGames: ['puzzle-path', 'cloud-kingdom']
    },
    {
        id: 'doctor',
        title: 'Doctor / Healthcare Worker',
        icon: '🏥',
        category: 'helping',
        requiredSkills: { memory: 0.8, attention: 0.9, social: 0.7 },
        description: 'Take care of people and make them feel better!',
        ageDescriptions: {
            child: 'You could help people feel better when they\'re sick!',
            teen: 'Doctors, nurses, and therapists save lives.',
            adult: 'Healthcare, counseling, medical research.'
        },
        funFacts: [
            'Doctors and nurses are everyday heroes!',
            'You could specialize in helping kids, animals, or athletes.',
            'Healthcare workers make a difference every day.'
        ],
        relatedGames: ['treasure-chest', 'quiz-quest']
    },
    {
        id: 'writer',
        title: 'Writer / Storyteller',
        icon: '✍️',
        category: 'creative',
        requiredSkills: { writing: 0.9, creativity: 0.8, reading: 0.7 },
        description: 'Tell amazing stories that people love!',
        ageDescriptions: {
            child: 'You could write your own books and stories!',
            teen: 'Writers create books, games, and movies.',
            adult: 'Journalism, content creation, fiction/non-fiction.'
        },
        funFacts: [
            'Writers create the stories in your favorite games!',
            'You can write books, articles, or movie scripts.',
            'Some writers work from anywhere in the world.'
        ],
        relatedGames: ['dream-journal', 'story-cloud']
    },
    {
        id: 'business',
        title: 'Business Leader',
        icon: '💼',
        category: 'business',
        requiredSkills: { math: 0.7, social: 0.8, attention: 0.7 },
        description: 'Lead teams and run successful companies!',
        ageDescriptions: {
            child: 'You could start your own lemonade stand!',
            teen: 'Business people create jobs and solve problems.',
            adult: 'Entrepreneurship, management, marketing.'
        },
        funFacts: [
            'Many successful businesses started as small ideas!',
            'You could run a company or start your own.',
            'Business leaders help create products we all use.'
        ],
        relatedGames: ['candy-shop', 'star-counter']
    },
    {
        id: 'nature',
        title: 'Environmentalist',
        icon: '🌍',
        category: 'nature',
        requiredSkills: { curiosity: 0.8, spatial: 0.6, memory: 0.6 },
        description: 'Protect nature and help animals!',
        ageDescriptions: {
            child: 'You could help take care of animals and plants!',
            teen: 'Environmentalists protect our planet and wildlife.',
            adult: 'Conservation, wildlife biology, environmental science.'
        },
        funFacts: [
            'You could work with endangered animals!',
            'Environmentalists help fight climate change.',
            'You could work in forests, oceans, or national parks.'
        ],
        relatedGames: ['cloud-kingdom', 'quiz-quest']
    },
    {
        id: 'gamedev',
        title: 'Game Developer',
        icon: '🎮',
        category: 'creative',
        requiredSkills: { logic: 0.8, creativity: 0.8, spatial: 0.7 },
        description: 'Create fun games for everyone to play!',
        ageDescriptions: {
            child: 'You could make your own video games!',
            teen: 'Game developers combine art, story, and code.',
            adult: 'Game design, programming, art direction.'
        },
        funFacts: [
            'Game devs created the games you love!',
            'You need creativity AND problem-solving skills.',
            'The gaming industry is bigger than movies!'
        ],
        relatedGames: ['puzzle-path', 'pattern-rainbow', 'cloud-kingdom']
    },
    {
        id: 'chef',
        title: 'Chef / Food Creator',
        icon: '👨‍🍳',
        category: 'creative',
        requiredSkills: { creativity: 0.7, attention: 0.8, memory: 0.6 },
        description: 'Create delicious food that makes people happy!',
        ageDescriptions: {
            child: 'You could make yummy food for your family!',
            teen: 'Chefs create recipes and run restaurants.',
            adult: 'Culinary arts, restaurant management, food science.'
        },
        funFacts: [
            'Chefs create new recipes every day!',
            'You could have your own cooking show.',
            'Food brings people together from all cultures.'
        ],
        relatedGames: ['candy-shop', 'pattern-rainbow']
    }
];

// ==================== Skill Definitions ====================
const SKILL_INFO = {
    math: { name: 'Mathematics', icon: '🔢' },
    reading: { name: 'Reading', icon: '📖' },
    writing: { name: 'Writing', icon: '✍️' },
    creativity: { name: 'Creativity', icon: '🎨' },
    logic: { name: 'Logic', icon: '🧩' },
    memory: { name: 'Memory', icon: '🧠' },
    spatial: { name: 'Spatial', icon: '🗺️' },
    social: { name: 'Social', icon: '👥' },
    attention: { name: 'Attention', icon: '👁️' },
    curiosity: { name: 'Curiosity', icon: '🔍' },
    knowledge: { name: 'Knowledge', icon: '📚' }
};

const GAME_INFO = {
    'treasure-chest': { name: 'Memory Match', icon: '🧠', path: '../treasure-chest-memory/index.html' },
    'star-counter': { name: 'Star Counter', icon: '⭐', path: '../star-counter/index.html' },
    'pattern-rainbow': { name: 'Pattern Rainbow', icon: '🌈', path: '../pattern-rainbow/index.html' },
    'quiz-quest': { name: 'Quiz Quest', icon: '❓', path: '../quiz-quest/index.html' },
    'candy-shop': { name: 'Candy Shop', icon: '🍬', path: '../candy-shop/index.html' },
    'story-cloud': { name: 'Story Cloud', icon: '📖', path: '../story-cloud/index.html' },
    'dream-journal': { name: 'Dream Journal', icon: '📝', path: '../dream-journal/index.html' },
    'cloud-kingdom': { name: 'Cloud Kingdom', icon: '☁️', path: '../cloud-kingdom/index.html' },
    'puzzle-path': { name: 'Puzzle Path', icon: '🧩', path: '../puzzle-path/index.html' }
};

const ENCOURAGEMENTS = {
    creativity: [
        "You have an amazing creative mind! 🎨",
        "Your imagination knows no bounds! ✨",
        "You see the world in unique ways! 🌈"
    ],
    logic: [
        "You're a natural problem solver! 🧩",
        "Your logical mind is impressive! 🔍",
        "You think things through carefully! 💡"
    ],
    math: [
        "Numbers are your friends! 🔢",
        "You have a gift for mathematics! ✨",
        "Mathematical thinking comes naturally to you! 📐"
    ],
    memory: [
        "You have an excellent memory! 🧠",
        "Remembering details is your superpower! 💫",
        "Your memory skills are amazing! ⭐"
    ],
    writing: [
        "You express yourself beautifully! ✍️",
        "Words flow from your imagination! 📝",
        "You're a natural storyteller! 📖"
    ],
    reading: [
        "You love learning through reading! 📚",
        "Books open worlds for you! 🌟",
        "Your reading skills are wonderful! 📖"
    ],
    spatial: [
        "You understand space and shapes well! 🗺️",
        "Your spatial awareness is impressive! 🎯",
        "You see how things fit together! 🧩"
    ],
    default: [
        "You have unique talents waiting to bloom! 🌸",
        "Keep exploring and discovering yourself! 🌟",
        "Every skill you build makes you stronger! 💪"
    ]
};

// ==================== Assessment Engine ====================
class AssessmentEngine {
    constructor() {
        this.skillWeights = CAREER_CONFIG.GAME_SKILL_MAPPINGS;
    }
    
    /**
     * Aggregates data from all games
     * @returns {Object} Aggregated game data
     */
    aggregateGameData() {
        const allData = {};
        let gamesFound = 0;
        
        // Check each game's leaderboard
        const gameKeys = {
            'treasure-chest': 'treasureChestMemoryLeaderboard',
            'star-counter': 'starCounterLeaderboard',
            'pattern-rainbow': 'patternRainbowLeaderboard',
            'quiz-quest': 'quizQuestLeaderboard',
            'candy-shop': 'candyShopLeaderboard',
            'story-cloud': 'storyCloudLeaderboard',
            'dream-journal': 'dreamJournalStreak',
            'cloud-kingdom': 'cloudKingdomLeaderboard',
            'puzzle-path': 'puzzlePathLeaderboard'
        };
        
        for (const [gameId, storageKey] of Object.entries(gameKeys)) {
            try {
                const data = localStorage.getItem(storageKey);
                if (data) {
                    allData[gameId] = JSON.parse(data);
                    gamesFound++;
                }
            } catch (e) {
                console.warn(`Could not load data for ${gameId}:`, e);
            }
        }
        
        return { data: allData, gamesPlayed: gamesFound };
    }
    
    /**
     * Calculates skill scores from game data
     * @param {Object} gameData - Aggregated game data
     * @returns {Object} Skill scores
     */
    calculateSkillScores(gameData) {
        const skills = {};
        const sampleCounts = {};
        
        for (const [gameId, data] of Object.entries(gameData)) {
            const weights = this.skillWeights[gameId];
            if (!weights) continue;
            
            // Calculate score from the game data
            const normalizedScore = this.extractGameScore(data, gameId);
            if (normalizedScore === null) continue;
            
            // Distribute to skills based on weights
            for (const [skill, weight] of Object.entries(weights)) {
                if (!skills[skill]) {
                    skills[skill] = 0;
                    sampleCounts[skill] = 0;
                }
                skills[skill] += normalizedScore * weight;
                sampleCounts[skill] += weight;
            }
        }
        
        // Average the skills
        for (const skill of Object.keys(skills)) {
            if (sampleCounts[skill] > 0) {
                skills[skill] = Math.round(skills[skill] / sampleCounts[skill]);
            }
        }
        
        // Fill in missing skills with default values
        for (const skill of Object.keys(SKILL_INFO)) {
            if (!skills[skill]) {
                skills[skill] = 50; // Default middle value
            }
        }
        
        return skills;
    }
    
    /**
     * Extracts a normalized score from game data
     * @param {Object} data - Game data
     * @param {string} gameId - Game ID
     * @returns {number|null} Normalized score (0-100)
     */
    extractGameScore(data, gameId) {
        if (!data) return null;
        
        // Handle different data structures
        if (data.scores && Array.isArray(data.scores) && data.scores.length > 0) {
            const recentScores = data.scores.slice(-10);
            const avgScore = recentScores.reduce((a, s) => a + (s.score || s), 0) / recentScores.length;
            return Math.min(100, avgScore);
        }
        
        if (data.bestScore !== undefined) {
            return Math.min(100, data.bestScore);
        }
        
        if (data.totalStars !== undefined) {
            return Math.min(100, data.totalStars * 10);
        }
        
        if (data.currentStreak !== undefined) {
            return Math.min(100, data.currentStreak * 15);
        }
        
        if (data.puzzlesSolved !== undefined) {
            return Math.min(100, data.puzzlesSolved * 10);
        }
        
        if (data.totalGems !== undefined) {
            return Math.min(100, data.totalGems * 5);
        }
        
        if (data.totalEntries !== undefined) {
            return Math.min(100, data.totalEntries * 10);
        }
        
        // Try to find any score-like property
        for (const key of ['score', 'points', 'level', 'progress']) {
            if (data[key] !== undefined) {
                return Math.min(100, Number(data[key]));
            }
        }
        
        return null;
    }
    
    /**
     * Identifies top strengths and growth areas
     * @param {Object} skills - Skill scores
     * @returns {Object} Strengths and growth areas
     */
    identifyStrengths(skills) {
        const sorted = Object.entries(skills)
            .filter(([skill]) => SKILL_INFO[skill]) // Only include known skills
            .sort(([, a], [, b]) => b - a);
        
        return {
            topStrengths: sorted.slice(0, 3).map(([skill, score]) => ({ skill, score })),
            growthAreas: sorted.slice(-2).map(([skill, score]) => ({ skill, score })),
            allSkills: sorted
        };
    }
    
    /**
     * Matches careers based on skills
     * @param {Object} skills - Skill scores
     * @param {string} ageGroup - Age group
     * @returns {Array} Matched careers
     */
    matchCareers(skills, ageGroup) {
        const matches = [];
        
        for (const career of CAREERS) {
            let matchScore = 0;
            let totalWeight = 0;
            
            for (const [skill, requirement] of Object.entries(career.requiredSkills)) {
                const playerSkill = skills[skill] || 50;
                matchScore += (playerSkill / 100) * requirement;
                totalWeight += requirement;
            }
            
            const score = totalWeight > 0 ? matchScore / totalWeight : 0;
            const description = career.ageDescriptions[ageGroup] || career.description;
            
            matches.push({
                ...career,
                matchScore: Math.round(score * 100),
                ageDescription: description
            });
        }
        
        return matches.sort((a, b) => b.matchScore - a.matchScore);
    }
    
    /**
     * Gets game suggestions for improving skills
     * @param {Array} growthAreas - Skills to improve
     * @returns {Array} Game suggestions
     */
    getGameSuggestions(growthAreas) {
        const suggestions = new Set();
        
        for (const { skill } of growthAreas) {
            // Find games that help with this skill
            for (const [gameId, weights] of Object.entries(this.skillWeights)) {
                if (weights[skill] && weights[skill] >= 0.5) {
                    suggestions.add(gameId);
                }
            }
        }
        
        // If we don't have enough, add some general recommendations
        const allGames = Object.keys(GAME_INFO);
        while (suggestions.size < 4 && allGames.length > suggestions.size) {
            suggestions.add(allGames[Math.floor(Math.random() * allGames.length)]);
        }
        
        return Array.from(suggestions).slice(0, 4).map(id => ({
            id,
            ...GAME_INFO[id]
        }));
    }
}

// ==================== Main Game Class ====================
class CareerCloudsGame {
    constructor() {
        // Audio system - safely initialize
        this.audio = typeof gameAudio !== 'undefined' ? gameAudio : null;
        this.musicEnabled = true;
        this.sfxEnabled = true;
        
        this.age = 16;
        this.ageGroup = 'teen';
        this.assessmentEngine = new AssessmentEngine();
        this.currentAssessment = null;
        
        // DOM elements
        this.screens = {
            start: document.getElementById('start-screen'),
            assessment: document.getElementById('assessment-screen'),
            nodata: document.getElementById('nodata-screen')
        };
        
        this.elements = this.initElements();
        this.init();
    }
    
    /**
     * Initializes DOM element references
     * @returns {Object} Element references
     */
    initElements() {
        const getElement = (id) => document.getElementById(id);
        
        return {
            ageSelect: getElement('age-select'),
            startBtn: getElement('start-btn'),
            gamesPlayed: getElement('games-played'),
            backBtn: getElement('back-btn'),
            backHomeBtn: getElement('back-home-btn'),
            tabBtns: document.querySelectorAll('.tab-btn'),
            tabContents: document.querySelectorAll('.tab-content'),
            profileTitle: getElement('profile-title'),
            profileSubtitle: getElement('profile-subtitle'),
            strengthsList: getElement('strengths-list'),
            growthList: getElement('growth-list'),
            encouragementText: getElement('encouragement-text'),
            careersList: getElement('careers-list'),
            skillsChart: getElement('skills-chart'),
            gamesList: getElement('games-list'),
            careerModal: getElement('career-modal'),
            closeModal: getElement('close-modal'),
            careerIcon: getElement('career-icon'),
            careerTitle: getElement('career-title'),
            careerDescription: getElement('career-description'),
            careerMatchScore: getElement('career-match-score'),
            careerSkillsList: getElement('career-skills-list'),
            careerFactsList: getElement('career-facts-list')
        };
    }
    
    /**
     * Initializes the game
     */
    init() {
        this.checkGameData();
        this.setupEventListeners();
    }
    
    /**
     * Checks for available game data
     */
    checkGameData() {
        const { gamesPlayed } = this.assessmentEngine.aggregateGameData();
        
        if (this.elements.gamesPlayed) {
            this.elements.gamesPlayed.textContent = gamesPlayed;
        }
    }
    
    /**
     * Sets up event listeners
     */
    setupEventListeners() {
        // Start screen
        this.elements.startBtn?.addEventListener('click', () => this.startAssessment());
        
        // Navigation
        this.elements.backBtn?.addEventListener('click', () => this.goHome());
        this.elements.backHomeBtn?.addEventListener('click', () => this.goHome());
        
        // Tabs
        this.elements.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
        
        // Modal
        this.elements.closeModal?.addEventListener('click', () => this.closeCareerModal());
        this.elements.careerModal?.addEventListener('click', (e) => {
            if (e.target === this.elements.careerModal) {
                this.closeCareerModal();
            }
        });
    }
    
    /**
     * Shows a specific screen
     * @param {string} screenName - Screen to show
     */
    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            if (screen) screen.classList.remove('active');
        });
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
        }
    }
    
    /**
     * Switches between tabs
     * @param {string} tabId - Tab to show
     */
    switchTab(tabId) {
        // Update button states
        this.elements.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        
        // Update content visibility
        this.elements.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabId}-tab`);
        });
    }
    
    /**
     * Starts the assessment
     */
    startAssessment() {
        // Start background music with defensive programming
        if (this.audio && this.musicEnabled) {
            try {
                this.audio.ensureReady();
                this.audio.playMusic('career');
            } catch (e) {
                console.warn('Audio not available:', e);
            }
        }
        
        // Get age from PlayerManager
        let age = 16;
        if (typeof PlayerManager !== 'undefined' && PlayerManager.hasActivePlayer()) {
            age = PlayerManager.getPlayerAge() || 16;
        }
        this.age = age;
        this.ageGroup = getAgeGroup(this.age);
        
        // Gather and analyze data
        const { data, gamesPlayed } = this.assessmentEngine.aggregateGameData();
        
        if (gamesPlayed < 1) {
            this.showScreen('nodata');
            return;
        }
        
        // Calculate assessment
        const skills = this.assessmentEngine.calculateSkillScores(data);
        const { topStrengths, growthAreas, allSkills } = this.assessmentEngine.identifyStrengths(skills);
        const careers = this.assessmentEngine.matchCareers(skills, this.ageGroup);
        const gameSuggestions = this.assessmentEngine.getGameSuggestions(growthAreas);
        
        this.currentAssessment = {
            skills,
            topStrengths,
            growthAreas,
            allSkills,
            careers,
            gameSuggestions
        };
        
        // Render the assessment
        this.renderProfile();
        this.renderCareers();
        this.renderSkills();
        
        this.showScreen('assessment');
    }
    
    /**
     * Renders the profile tab
     */
    renderProfile() {
        const { topStrengths, growthAreas } = this.currentAssessment;
        
        // Profile header
        if (this.elements.profileTitle) {
            const topSkill = topStrengths[0]?.skill || 'explorer';
            const titles = {
                creativity: 'Creative Dreamer',
                logic: 'Problem Solver',
                math: 'Number Wizard',
                memory: 'Memory Master',
                writing: 'Word Artist',
                reading: 'Knowledge Seeker',
                spatial: 'Space Explorer'
            };
            this.elements.profileTitle.textContent = titles[topSkill] || 'Explorer';
        }
        
        if (this.elements.profileSubtitle) {
            this.elements.profileSubtitle.textContent = `Based on your ${this.ageGroup === 'child' ? 'play' : 'performance'} in our games`;
        }
        
        // Top strengths
        if (this.elements.strengthsList) {
            this.elements.strengthsList.innerHTML = '';
            
            topStrengths.forEach(({ skill, score }) => {
                const info = SKILL_INFO[skill] || { name: skill, icon: '⭐' };
                const item = document.createElement('div');
                item.className = 'strength-item';
                item.innerHTML = `
                    <span class="skill-icon">${info.icon}</span>
                    <span class="skill-name">${info.name}</span>
                    <span class="skill-score">${score}%</span>
                `;
                this.elements.strengthsList.appendChild(item);
            });
        }
        
        // Growth areas
        if (this.elements.growthList) {
            this.elements.growthList.innerHTML = '';
            
            growthAreas.forEach(({ skill }) => {
                const info = SKILL_INFO[skill] || { name: skill, icon: '🌱' };
                const item = document.createElement('div');
                item.className = 'growth-item';
                item.innerHTML = `
                    <span class="skill-icon">${info.icon}</span>
                    <span class="skill-name">${info.name}</span>
                `;
                this.elements.growthList.appendChild(item);
            });
        }
        
        // Encouragement
        if (this.elements.encouragementText) {
            const topSkill = topStrengths[0]?.skill || 'default';
            const messages = ENCOURAGEMENTS[topSkill] || ENCOURAGEMENTS.default;
            this.elements.encouragementText.textContent = 
                messages[Math.floor(Math.random() * messages.length)];
        }
    }
    
    /**
     * Renders the careers tab
     */
    renderCareers() {
        const { careers } = this.currentAssessment;
        
        if (!this.elements.careersList) return;
        
        this.elements.careersList.innerHTML = '';
        
        careers.slice(0, 6).forEach(career => {
            const card = document.createElement('div');
            card.className = 'career-card';
            card.innerHTML = `
                <span class="career-icon">${career.icon}</span>
                <div class="career-info">
                    <div class="career-title">${career.title}</div>
                    <div class="career-match">${career.matchScore}% match</div>
                </div>
                <span class="career-arrow">→</span>
            `;
            card.addEventListener('click', () => this.showCareerDetail(career));
            this.elements.careersList.appendChild(card);
        });
    }
    
    /**
     * Renders the skills tab
     */
    renderSkills() {
        const { allSkills, gameSuggestions } = this.currentAssessment;
        
        // Skills chart
        if (this.elements.skillsChart) {
            this.elements.skillsChart.innerHTML = '';
            
            allSkills.forEach(([skill, score]) => {
                const info = SKILL_INFO[skill] || { name: skill, icon: '⭐' };
                const bar = document.createElement('div');
                bar.className = 'skill-bar';
                bar.innerHTML = `
                    <span class="skill-icon">${info.icon}</span>
                    <span class="skill-name">${info.name}</span>
                    <div class="bar-container">
                        <div class="bar-fill" style="width: ${score}%"></div>
                    </div>
                    <span class="skill-score">${score}%</span>
                `;
                this.elements.skillsChart.appendChild(bar);
            });
        }
        
        // Game suggestions
        if (this.elements.gamesList) {
            this.elements.gamesList.innerHTML = '';
            
            gameSuggestions.forEach(game => {
                const link = document.createElement('a');
                link.className = 'game-suggestion';
                link.href = game.path;
                link.innerHTML = `
                    <span class="game-icon">${game.icon}</span>
                    <span class="game-name">${game.name}</span>
                `;
                this.elements.gamesList.appendChild(link);
            });
        }
    }
    
    /**
     * Shows career detail modal
     * @param {Object} career - Career to show
     */
    showCareerDetail(career) {
        if (this.elements.careerIcon) {
            this.elements.careerIcon.textContent = career.icon;
        }
        if (this.elements.careerTitle) {
            this.elements.careerTitle.textContent = career.title;
        }
        if (this.elements.careerDescription) {
            this.elements.careerDescription.textContent = career.ageDescription;
        }
        if (this.elements.careerMatchScore) {
            this.elements.careerMatchScore.textContent = `${career.matchScore}%`;
        }
        
        // Skills needed
        if (this.elements.careerSkillsList) {
            this.elements.careerSkillsList.innerHTML = '';
            for (const skill of Object.keys(career.requiredSkills)) {
                const info = SKILL_INFO[skill] || { name: skill };
                const tag = document.createElement('span');
                tag.className = 'skill-tag';
                tag.textContent = `${info.icon || ''} ${info.name}`;
                this.elements.careerSkillsList.appendChild(tag);
            }
        }
        
        // Fun facts
        if (this.elements.careerFactsList && career.funFacts) {
            this.elements.careerFactsList.innerHTML = '';
            career.funFacts.forEach(fact => {
                const li = document.createElement('li');
                li.textContent = fact;
                this.elements.careerFactsList.appendChild(li);
            });
        }
        
        this.elements.careerModal?.classList.remove('hidden');
    }
    
    /**
     * Closes the career modal
     */
    closeCareerModal() {
        this.elements.careerModal?.classList.add('hidden');
    }
    
    /**
     * Returns to home screen
     */
    goHome() {
        // Stop music when going home
        if (this.audio) {
            try {
                this.audio.stopMusic();
            } catch (e) {
                console.warn('Audio stop failed:', e);
            }
        }
        
        this.checkGameData();
        this.showScreen('start');
    }
    
    /**
     * Helper method to play sound effects with defensive programming
     * @param {string} type - Type of sound effect
     */
    playSound(type) {
        if (this.audio && this.sfxEnabled) {
            try {
                this.audio.playSFX(type);
            } catch (e) {
                console.warn('Sound effect failed:', e);
            }
        }
    }
}

// ==================== Initialize Game ====================
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.game = new CareerCloudsGame();
    } catch (error) {
        console.error('Failed to initialize Career Clouds game:', error);
    }
});
