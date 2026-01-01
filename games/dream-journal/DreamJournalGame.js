/**
 * Cinnamoroll's Dream Journal - Main Game Logic
 * A creative writing game with prompts and streak tracking
 * 
 * @version 1.0.0
 */

// ==================== Configuration (inlined for file:// compatibility) ====================
const JOURNAL_CONFIG = Object.freeze({
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

const PROMPT_CATEGORIES = [
  { id: 'imagination', name: 'Imagination', icon: '✨' },
  { id: 'feelings', name: 'Feelings', icon: '💖' },
  { id: 'adventures', name: 'Adventures', icon: '🗺️' },
  { id: 'dreams', name: 'Dreams', icon: '🌙' },
  { id: 'kindness', name: 'Kindness', icon: '🤗' }
];

function getDifficultyFromAge(age) {
  if (age <= 7) return 1;
  if (age <= 9) return 2;
  if (age <= 12) return 3;
  if (age <= 15) return 4;
  if (age <= 20) return 5;
  if (age <= 25) return 6;
  return 7;
}

// ==================== Writing Prompts ======================================
const WRITING_PROMPTS = {
    imagination: [
        { text: "If Cinnamoroll could fly anywhere in the world, where would he go and why?", difficulty: 1 },
        { text: "Describe a magical cloud kingdom where everyone is always happy.", difficulty: 2 },
        { text: "What would happen if Cinnamoroll discovered a door to another dimension?", difficulty: 3 },
        { text: "Write about a day when everything in the world turned into candy.", difficulty: 1 },
        { text: "Imagine you could talk to animals. What would they tell you?", difficulty: 2 },
        { text: "Create a story about a rainbow that grants wishes.", difficulty: 3 },
        { text: "What if you woke up one morning with the ability to fly?", difficulty: 4 }
    ],
    feelings: [
        { text: "Describe a time when you felt really proud of yourself.", difficulty: 1 },
        { text: "What makes you feel safe and happy?", difficulty: 1 },
        { text: "Write about a moment when someone showed you kindness.", difficulty: 2 },
        { text: "How do you cheer yourself up when you're feeling sad?", difficulty: 2 },
        { text: "Describe your happiest memory and why it's special to you.", difficulty: 3 },
        { text: "What does friendship mean to you?", difficulty: 4 }
    ],
    adventures: [
        { text: "Write about an exciting adventure you'd like to go on with Cinnamoroll.", difficulty: 1 },
        { text: "Describe exploring a mysterious forest full of friendly creatures.", difficulty: 2 },
        { text: "What would you discover at the bottom of the ocean?", difficulty: 2 },
        { text: "Write about a treasure hunt with surprising discoveries.", difficulty: 3 },
        { text: "Describe a journey to the top of a magical mountain.", difficulty: 3 },
        { text: "What adventures await on a faraway planet?", difficulty: 4 }
    ],
    dreams: [
        { text: "Describe your perfect day from start to finish.", difficulty: 1 },
        { text: "What do you dream about becoming when you grow up?", difficulty: 2 },
        { text: "Write about a dream you remember having.", difficulty: 2 },
        { text: "If you could have any superpower, what would it be and how would you use it?", difficulty: 3 },
        { text: "Describe the house of your dreams - where is it and what's inside?", difficulty: 3 },
        { text: "What goals would you like to achieve in your life?", difficulty: 5 }
    ],
    kindness: [
        { text: "Write about a way to make someone smile today.", difficulty: 1 },
        { text: "How can we be kind to animals and nature?", difficulty: 1 },
        { text: "Describe a random act of kindness you witnessed or did.", difficulty: 2 },
        { text: "What does it mean to be a good friend?", difficulty: 2 },
        { text: "How can we make the world a better place?", difficulty: 3 },
        { text: "Write a letter to someone you appreciate.", difficulty: 4 }
    ]
};

const STORY_STARTERS = [
    "Once upon a time...",
    "One sunny morning...",
    "In a magical place...",
    "I remember when...",
    "Cinnamoroll discovered...",
    "The adventure began when..."
];

const ENCOURAGEMENTS = [
    "Wonderful imagination! 🌟",
    "What a beautiful story! ✨",
    "Your words paint pictures! 🎨",
    "Keep writing, you're amazing! 💖",
    "Such creative thinking! 🌈",
    "Your story touched my heart! 💕"
];

// ==================== Utility Classes ====================
class DateUtils {
    /**
     * Gets today's date string
     * @returns {string} Date string (e.g., "Monday, December 30")
     */
    static getTodayString() {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    }
    
    /**
     * Gets today's date key for storage
     * @returns {string} Date key (e.g., "2025-12-30")
     */
    static getTodayKey() {
        return new Date().toISOString().split('T')[0];
    }
    
    /**
     * Checks if a date is yesterday
     * @param {string} dateKey - Date key to check
     * @returns {boolean} Whether date is yesterday
     */
    static isYesterday(dateKey) {
        if (!dateKey) return false;
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        return dateKey === yesterday;
    }
    
    /**
     * Generates a deterministic seed from a date
     * @param {string} dateString - Date string
     * @returns {number} Seed number
     */
    static dateToSeed(dateString) {
        let hash = 0;
        for (let i = 0; i < dateString.length; i++) {
            hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
        }
        return Math.abs(hash);
    }
}

class TextUtils {
    /**
     * Counts words in text
     * @param {string} text - Text to count
     * @returns {number} Word count
     */
    static countWords(text) {
        if (!text || typeof text !== 'string') return 0;
        const trimmed = text.trim();
        if (trimmed === '') return 0;
        return trimmed.split(/\s+/).filter(w => w.length > 0).length;
    }
    
    /**
     * Truncates text to specified length
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated text
     */
    static truncate(text, maxLength = 100) {
        if (!text || text.length <= maxLength) return text || '';
        return text.substring(0, maxLength) + '...';
    }
    
    /**
     * Returns a random element from an array
     * @param {Array} array - Source array
     * @returns {*} Random element
     */
    static randomPick(array) {
        if (!Array.isArray(array) || array.length === 0) return null;
        return array[Math.floor(Math.random() * array.length)];
    }
}

// ==================== Streak Tracker ====================
class StreakTracker {
    constructor(storageKey = 'dreamJournalStreak') {
        this.storageKey = storageKey;
        this.data = this.load();
    }
    
    /**
     * Loads streak data from storage
     * @returns {Object} Streak data
     */
    load() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {
                currentStreak: 0,
                longestStreak: 0,
                lastEntryDate: null,
                totalEntries: 0,
                totalWords: 0,
                badges: []
            };
        } catch (e) {
            console.warn('Could not load streak data:', e);
            return {
                currentStreak: 0,
                longestStreak: 0,
                lastEntryDate: null,
                totalEntries: 0,
                totalWords: 0,
                badges: []
            };
        }
    }
    
    /**
     * Saves streak data to storage
     */
    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (e) {
            console.warn('Could not save streak data:', e);
        }
    }
    
    /**
     * Records a new entry and updates streak
     * @param {number} wordCount - Number of words written
     * @returns {Object} Result with streak info and any new badges
     */
    recordEntry(wordCount = 0) {
        const today = DateUtils.getTodayKey();
        const newBadges = [];
        
        // Update streak
        if (this.data.lastEntryDate === today) {
            // Already wrote today, just add words
            this.data.totalWords += wordCount;
        } else if (DateUtils.isYesterday(this.data.lastEntryDate)) {
            // Continuing streak
            this.data.currentStreak++;
            this.data.totalEntries++;
            this.data.totalWords += wordCount;
        } else if (this.data.lastEntryDate === null) {
            // First entry ever
            this.data.currentStreak = 1;
            this.data.totalEntries = 1;
            this.data.totalWords = wordCount;
        } else {
            // Streak broken
            this.data.currentStreak = 1;
            this.data.totalEntries++;
            this.data.totalWords += wordCount;
        }
        
        // Update longest streak
        if (this.data.currentStreak > this.data.longestStreak) {
            this.data.longestStreak = this.data.currentStreak;
        }
        
        // Update last entry date
        this.data.lastEntryDate = today;
        
        // Check for new streak badges
        for (const [days, badge] of Object.entries(JOURNAL_CONFIG.STREAK_BADGES)) {
            if (this.data.currentStreak >= parseInt(days) && !this.data.badges.includes(badge.id)) {
                this.data.badges.push(badge.id);
                newBadges.push(badge);
            }
        }
        
        // Check for word badges
        for (const [words, badge] of Object.entries(JOURNAL_CONFIG.WORD_BADGES)) {
            if (this.data.totalWords >= parseInt(words) && !this.data.badges.includes(badge.id)) {
                this.data.badges.push(badge.id);
                newBadges.push(badge);
            }
        }
        
        this.save();
        
        return {
            streak: this.data.currentStreak,
            totalEntries: this.data.totalEntries,
            totalWords: this.data.totalWords,
            newBadges
        };
    }
    
    /**
     * Gets current statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        return {
            currentStreak: this.data.currentStreak,
            longestStreak: this.data.longestStreak,
            totalEntries: this.data.totalEntries,
            totalWords: this.data.totalWords,
            badges: this.data.badges
        };
    }
}

// ==================== Writing Prompt Engine ====================
class WritingPromptEngine {
    constructor() {
        this.prompts = WRITING_PROMPTS;
        this.usedToday = null;
    }
    
    /**
     * Gets the daily prompt based on difficulty
     * @param {number} difficulty - Difficulty level (1-7)
     * @returns {Object} Prompt object
     */
    getDailyPrompt(difficulty) {
        const today = DateUtils.getTodayKey();
        
        // Return same prompt all day
        if (this.usedToday?.date === today && this.usedToday?.difficulty === difficulty) {
            return this.usedToday.prompt;
        }
        
        // Collect all prompts for this difficulty level
        const availablePrompts = [];
        for (const [category, prompts] of Object.entries(this.prompts)) {
            const filtered = prompts.filter(p => p.difficulty <= difficulty);
            filtered.forEach(p => availablePrompts.push({ ...p, category }));
        }
        
        if (availablePrompts.length === 0) {
            return {
                text: "Write about anything you want!",
                category: "free",
                difficulty: 1
            };
        }
        
        // Generate deterministic prompt based on date
        const seed = DateUtils.dateToSeed(today + difficulty);
        const index = seed % availablePrompts.length;
        
        this.usedToday = {
            date: today,
            difficulty,
            prompt: availablePrompts[index]
        };
        
        return this.usedToday.prompt;
    }
    
    /**
     * Gets story starters for the current difficulty
     * @param {number} difficulty - Difficulty level
     * @returns {Array} Array of starter strings
     */
    getStarters(difficulty) {
        // Younger ages get more starters
        const count = difficulty <= 2 ? 4 : difficulty <= 4 ? 3 : 2;
        return STORY_STARTERS.slice(0, count);
    }
}

// ==================== Journal Storage ====================
class JournalStorage {
    constructor(storageKey = 'dreamJournalEntries') {
        this.storageKey = storageKey;
    }
    
    /**
     * Loads all entries from storage
     * @returns {Array} Array of entry objects
     */
    loadEntries() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.warn('Could not load entries:', e);
            return [];
        }
    }
    
    /**
     * Saves an entry to storage
     * @param {Object} entry - Entry object
     */
    saveEntry(entry) {
        try {
            const entries = this.loadEntries();
            entries.unshift(entry); // Add to beginning
            
            // Keep only last 50 entries to save space
            const trimmed = entries.slice(0, 50);
            localStorage.setItem(this.storageKey, JSON.stringify(trimmed));
        } catch (e) {
            console.warn('Could not save entry:', e);
        }
    }
    
    /**
     * Saves a draft
     * @param {string} text - Draft text
     * @param {string} promptText - Prompt text
     */
    saveDraft(text, promptText) {
        try {
            localStorage.setItem('dreamJournalDraft', JSON.stringify({
                text,
                prompt: promptText,
                date: DateUtils.getTodayKey()
            }));
        } catch (e) {
            console.warn('Could not save draft:', e);
        }
    }
    
    /**
     * Loads a draft if it exists and is from today
     * @returns {Object|null} Draft object or null
     */
    loadDraft() {
        try {
            const stored = localStorage.getItem('dreamJournalDraft');
            if (!stored) return null;
            
            const draft = JSON.parse(stored);
            if (draft.date === DateUtils.getTodayKey()) {
                return draft;
            }
            return null;
        } catch (e) {
            return null;
        }
    }
    
    /**
     * Clears the draft
     */
    clearDraft() {
        try {
            localStorage.removeItem('dreamJournalDraft');
        } catch (e) {
            console.warn('Could not clear draft:', e);
        }
    }
}

// ==================== Main Game Class ====================
class DreamJournalGame {
    constructor() {
        // Audio system - safely initialize
        this.audio = typeof gameAudio !== 'undefined' ? gameAudio : null;
        this.musicEnabled = true;
        this.sfxEnabled = true;
        
        // Game state
        this.difficulty = 1;
        this.isPlaying = false;
        this.currentPrompt = null;
        this.wordRequirements = { min: 20, max: 100 };
        this.autoSaveTimer = null;
        
        // Components
        this.promptEngine = new WritingPromptEngine();
        this.streakTracker = new StreakTracker();
        this.journalStorage = new JournalStorage();
        
        // DOM elements
        this.screens = {
            start: document.getElementById('start-screen'),
            game: document.getElementById('game-screen'),
            result: document.getElementById('result-screen'),
            gallery: document.getElementById('gallery-screen')
        };
        
        this.elements = this.initElements();
        this.init();
    }
    
    /**
     * Initializes DOM element references
     * @returns {Object} Element references
     */
    initElements() {
        const getElement = (id) => {
            const el = document.getElementById(id);
            if (!el) console.warn(`Element not found: ${id}`);
            return el;
        };
        
        return {
            ageSelect: getElement('age-select'),
            startBtn: getElement('start-btn'),
            galleryBtn: getElement('gallery-btn'),
            streakDisplay: getElement('streak-display'),
            entriesDisplay: getElement('entries-display'),
            dateDisplay: getElement('date-display'),
            streakIndicator: getElement('streak-indicator'),
            homeBtn: getElement('home-btn'),
            promptCategory: getElement('prompt-category'),
            promptText: getElement('prompt-text'),
            starterHints: getElement('starter-hints'),
            starterButtons: getElement('starter-buttons'),
            writingInput: getElement('writing-input'),
            currentWords: getElement('current-words'),
            targetWords: getElement('target-words'),
            wordProgressBar: getElement('word-progress-bar'),
            saveDraftBtn: getElement('save-draft-btn'),
            submitBtn: getElement('submit-btn'),
            autosaveIndicator: getElement('autosave-indicator'),
            resultTitle: getElement('result-title'),
            feedbackMessage: getElement('feedback-message'),
            finalWords: getElement('final-words'),
            totalWords: getElement('total-words'),
            currentStreak: getElement('current-streak'),
            badgesEarned: getElement('badges-earned'),
            starRating: getElement('star-rating'),
            newBadge: getElement('new-badge'),
            badgeDisplay: getElement('badge-display'),
            badgeName: getElement('badge-name'),
            writeMoreBtn: getElement('write-more-btn'),
            homeResultBtn: getElement('home-result-btn'),
            closeGalleryBtn: getElement('close-gallery-btn'),
            badgesContainer: getElement('badges-container'),
            entriesContainer: getElement('entries-container')
        };
    }
    
    /**
     * Initializes the game
     */
    init() {
        this.updateStartScreen();
        this.setupEventListeners();
    }
    
    /**
     * Sets up event listeners
     */
    setupEventListeners() {
        // Start screen
        this.elements.startBtn?.addEventListener('click', () => this.startWriting());
        this.elements.galleryBtn?.addEventListener('click', () => this.showGallery());
        
        // Game screen
        this.elements.homeBtn?.addEventListener('click', () => this.confirmGoHome());
        this.elements.saveDraftBtn?.addEventListener('click', () => this.saveDraft());
        this.elements.submitBtn?.addEventListener('click', () => this.submitEntry());
        
        // Writing input
        this.elements.writingInput?.addEventListener('input', () => this.handleInput());
        
        // Result screen
        this.elements.writeMoreBtn?.addEventListener('click', () => this.startWriting());
        this.elements.homeResultBtn?.addEventListener('click', () => this.goHome());
        
        // Gallery
        this.elements.closeGalleryBtn?.addEventListener('click', () => this.goHome());
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
     * Updates the start screen with current stats
     */
    updateStartScreen() {
        const stats = this.streakTracker.getStats();
        
        if (this.elements.streakDisplay) {
            this.elements.streakDisplay.textContent = stats.currentStreak;
        }
        if (this.elements.entriesDisplay) {
            this.elements.entriesDisplay.textContent = stats.totalEntries;
        }
    }
    
    /**
     * Starts a new writing session
     */
    startWriting() {
        // Start background music with defensive programming
        if (this.audio && this.musicEnabled) {
            try {
                this.audio.ensureReady();
                this.audio.playMusic('journal');
            } catch (e) {
                console.warn('Audio not available:', e);
            }
        }
        
        // Get difficulty from PlayerManager age
        let age = 16;
        if (typeof PlayerManager !== 'undefined' && PlayerManager.hasActivePlayer()) {
            age = PlayerManager.getPlayerAge() || 16;
        }
        this.difficulty = getDifficultyFromAge(age);
        
        const settings = JOURNAL_CONFIG.DIFFICULTY_SETTINGS[this.difficulty];
        this.wordRequirements = {
            min: settings.minWords,
            max: settings.maxWords
        };
        
        // Get daily prompt
        this.currentPrompt = this.promptEngine.getDailyPrompt(this.difficulty);
        
        // Update UI
        if (this.elements.dateDisplay) {
            this.elements.dateDisplay.textContent = DateUtils.getTodayString();
        }
        if (this.elements.streakIndicator) {
            const stats = this.streakTracker.getStats();
            this.elements.streakIndicator.textContent = `🔥 ${stats.currentStreak} day streak`;
        }
        if (this.elements.promptCategory) {
            const category = PROMPT_CATEGORIES.find(c => c.id === this.currentPrompt.category);
            this.elements.promptCategory.textContent = category ? `${category.icon} ${category.name}` : 'Today\'s Prompt';
        }
        if (this.elements.promptText) {
            this.elements.promptText.textContent = this.currentPrompt.text;
        }
        if (this.elements.targetWords) {
            this.elements.targetWords.textContent = this.wordRequirements.min;
        }
        
        // Show starters for younger ages
        this.renderStarters();
        
        // Check for draft
        const draft = this.journalStorage.loadDraft();
        if (draft && draft.prompt === this.currentPrompt.text) {
            this.elements.writingInput.value = draft.text;
        } else {
            this.elements.writingInput.value = '';
        }
        
        // Update word count
        this.handleInput();
        
        // Set up auto-save
        this.setupAutoSave();
        
        this.isPlaying = true;
        this.showScreen('game');
        
        // Focus on input
        setTimeout(() => this.elements.writingInput?.focus(), 300);
    }
    
    /**
     * Renders story starter buttons
     */
    renderStarters() {
        if (!this.elements.starterButtons || !this.elements.starterHints) return;
        
        const starters = this.promptEngine.getStarters(this.difficulty);
        
        if (this.difficulty > 4) {
            this.elements.starterHints.classList.add('hidden');
            return;
        }
        
        this.elements.starterHints.classList.remove('hidden');
        this.elements.starterButtons.innerHTML = '';
        
        starters.forEach(starter => {
            const btn = document.createElement('button');
            btn.className = 'starter-btn';
            btn.textContent = starter;
            btn.addEventListener('click', () => {
                if (this.elements.writingInput) {
                    const current = this.elements.writingInput.value;
                    if (!current.trim()) {
                        this.elements.writingInput.value = starter + ' ';
                    } else {
                        this.elements.writingInput.value = current + ' ' + starter + ' ';
                    }
                    this.elements.writingInput.focus();
                    this.handleInput();
                }
            });
            this.elements.starterButtons.appendChild(btn);
        });
    }
    
    /**
     * Handles input changes
     */
    handleInput() {
        const text = this.elements.writingInput?.value || '';
        const wordCount = TextUtils.countWords(text);
        
        // Update word count display
        if (this.elements.currentWords) {
            this.elements.currentWords.textContent = wordCount;
        }
        
        // Update progress bar
        if (this.elements.wordProgressBar) {
            const progress = Math.min(100, (wordCount / this.wordRequirements.min) * 100);
            this.elements.wordProgressBar.style.width = `${progress}%`;
            
            if (wordCount >= this.wordRequirements.min) {
                this.elements.wordProgressBar.classList.add('complete');
            } else {
                this.elements.wordProgressBar.classList.remove('complete');
            }
        }
        
        // Enable/disable submit button
        if (this.elements.submitBtn) {
            this.elements.submitBtn.disabled = wordCount < this.wordRequirements.min;
        }
    }
    
    /**
     * Sets up auto-save functionality
     */
    setupAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setInterval(() => {
            if (this.isPlaying && this.elements.writingInput?.value.trim()) {
                this.journalStorage.saveDraft(
                    this.elements.writingInput.value,
                    this.currentPrompt.text
                );
                this.showAutoSaveIndicator();
            }
        }, JOURNAL_CONFIG.AUTO_SAVE_INTERVAL);
    }
    
    /**
     * Shows auto-save indicator
     */
    showAutoSaveIndicator() {
        if (!this.elements.autosaveIndicator) return;
        
        this.elements.autosaveIndicator.classList.remove('hidden');
        setTimeout(() => {
            this.elements.autosaveIndicator?.classList.add('hidden');
        }, 2000);
    }
    
    /**
     * Saves current writing as draft
     */
    saveDraft() {
        const text = this.elements.writingInput?.value || '';
        if (text.trim()) {
            this.journalStorage.saveDraft(text, this.currentPrompt.text);
            this.showAutoSaveIndicator();
        }
    }
    
    /**
     * Submits the journal entry
     */
    submitEntry() {
        const text = this.elements.writingInput?.value || '';
        const wordCount = TextUtils.countWords(text);
        
        if (wordCount < this.wordRequirements.min) {
            alert(`Please write at least ${this.wordRequirements.min} words.`);
            return;
        }
        
        // Save entry
        const entry = {
            id: Date.now(),
            date: DateUtils.getTodayKey(),
            displayDate: DateUtils.getTodayString(),
            prompt: this.currentPrompt.text,
            category: this.currentPrompt.category,
            text: text,
            wordCount: wordCount
        };
        
        this.journalStorage.saveEntry(entry);
        this.journalStorage.clearDraft();
        
        // Update streak
        const result = this.streakTracker.recordEntry(wordCount);
        
        // Show results
        this.showResults(wordCount, result);
    }
    
    /**
     * Shows the results screen
     * @param {number} wordCount - Words written in this entry
     * @param {Object} result - Result from streak tracker
     */
    showResults(wordCount, result) {
        this.isPlaying = false;
        
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        // Calculate stars (1-3 based on word count relative to minimum)
        const ratio = wordCount / this.wordRequirements.min;
        let stars = 1;
        if (ratio >= 1.5) stars = 2;
        if (ratio >= 2) stars = 3;
        
        // Update result screen
        if (this.elements.resultTitle) {
            const titles = ['Nice effort!', 'Great writing!', '🌟 Amazing story! 🌟'];
            this.elements.resultTitle.textContent = titles[stars - 1];
        }
        
        if (this.elements.feedbackMessage) {
            this.elements.feedbackMessage.textContent = TextUtils.randomPick(ENCOURAGEMENTS);
        }
        
        if (this.elements.finalWords) {
            this.elements.finalWords.textContent = wordCount;
        }
        if (this.elements.totalWords) {
            this.elements.totalWords.textContent = result.totalWords;
        }
        if (this.elements.currentStreak) {
            this.elements.currentStreak.textContent = result.streak;
        }
        if (this.elements.badgesEarned) {
            const stats = this.streakTracker.getStats();
            this.elements.badgesEarned.textContent = stats.badges.length;
        }
        
        // Update stars
        if (this.elements.starRating) {
            const starEls = this.elements.starRating.querySelectorAll('.star');
            starEls.forEach((star, index) => {
                setTimeout(() => {
                    star.classList.toggle('earned', index < stars);
                }, index * 300);
            });
        }
        
        // Show new badge if earned
        if (result.newBadges.length > 0 && this.elements.newBadge) {
            const badge = result.newBadges[0];
            this.elements.newBadge.classList.remove('hidden');
            if (this.elements.badgeDisplay) {
                this.elements.badgeDisplay.textContent = badge.icon;
            }
            if (this.elements.badgeName) {
                this.elements.badgeName.textContent = badge.name;
            }
        } else {
            this.elements.newBadge?.classList.add('hidden');
        }
        
        this.showScreen('result');
    }
    
    /**
     * Shows the journal gallery
     */
    showGallery() {
        const entries = this.journalStorage.loadEntries();
        const stats = this.streakTracker.getStats();
        
        // Render badges
        if (this.elements.badgesContainer) {
            this.elements.badgesContainer.innerHTML = '';
            
            const allBadges = [
                ...Object.values(JOURNAL_CONFIG.STREAK_BADGES),
                ...Object.values(JOURNAL_CONFIG.WORD_BADGES)
            ];
            
            allBadges.forEach(badge => {
                const badgeEl = document.createElement('div');
                badgeEl.className = 'badge-item';
                if (stats.badges.includes(badge.id)) {
                    badgeEl.classList.add('earned');
                }
                badgeEl.textContent = badge.icon;
                badgeEl.title = badge.name;
                this.elements.badgesContainer.appendChild(badgeEl);
            });
        }
        
        // Render entries
        if (this.elements.entriesContainer) {
            this.elements.entriesContainer.innerHTML = '';
            
            if (entries.length === 0) {
                this.elements.entriesContainer.innerHTML = '<p class="empty-message">No entries yet. Start writing!</p>';
            } else {
                entries.forEach(entry => {
                    const entryEl = document.createElement('div');
                    entryEl.className = 'entry-card';
                    entryEl.innerHTML = `
                        <div class="entry-date">${entry.displayDate || entry.date}</div>
                        <div class="entry-preview">${TextUtils.truncate(entry.text, 150)}</div>
                        <div class="entry-stats">
                            <span>📝 ${entry.wordCount} words</span>
                            <span>💭 ${entry.category || 'Story'}</span>
                        </div>
                    `;
                    this.elements.entriesContainer.appendChild(entryEl);
                });
            }
        }
        
        this.showScreen('gallery');
    }
    
    /**
     * Confirms going home
     */
    confirmGoHome() {
        const text = this.elements.writingInput?.value || '';
        if (text.trim() && TextUtils.countWords(text) > 5) {
            if (confirm('Save your draft before leaving?')) {
                this.saveDraft();
            }
        }
        this.goHome();
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
        
        this.isPlaying = false;
        
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        this.updateStartScreen();
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
        window.game = new DreamJournalGame();
    } catch (error) {
        console.error('Failed to initialize Dream Journal game:', error);
    }
});
