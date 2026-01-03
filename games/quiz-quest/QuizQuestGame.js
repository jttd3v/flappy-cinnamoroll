/**
 * Quiz Quest - Complete Game Implementation
 * 
 * A trivia/quiz adventure game with map exploration,
 * multiple categories, and adaptive performance-based difficulty.
 * 
 * @version 2.0.0
 */

// ==================== Configuration (Inlined) ====================

const QUIZ_CONFIG = Object.freeze({
    CANVAS_WIDTH: 380,
    CANVAS_HEIGHT: 320,
    
    // Lives
    STARTING_LIVES: 3,
    MAX_LIVES: 5,
    
    // Scoring
    CORRECT_POINTS: 100,
    STREAK_BONUS: 25,
    TIME_BONUS_PER_SECOND: 5,
    PERFECT_LOCATION_BONUS: 200,
    
    // Power-ups
    STARTING_POWERUPS: {
        hint: 3,
        fiftyFifty: 2,
        skip: 1
    },
    
    // Storage
    LEADERBOARD_KEY: 'quizQuestLeaderboard',
    PROGRESS_KEY: 'quizQuestProgress',
    ADAPTIVE_KEY: 'quizQuestAdaptive'
});

// ==================== Calibration Configuration ====================

const CALIBRATION_CONFIG = Object.freeze({
    QUESTIONS_COUNT: 3,           // Warm-up questions
    BASE_LEVEL: 3,                // Start calibration at Champion level
    MIN_LEVEL: 1,                 // Floor
    MAX_LEVEL: 7,                 // Ceiling
    WINDOW_SIZE: 5,               // Rolling answer window
    DEFAULT_SPEED_SCORE: 0.5,     // Fallback when no timer
    DEFAULT_MAX_TIME: 30000       // 30 seconds in ms
});

const DIFFICULTY_PRESETS = Object.freeze({
    1: { name: 'Explorer', choices: 3, timeLimit: null, hints: 5 },
    2: { name: 'Adventurer', choices: 3, timeLimit: 60, hints: 4 },
    3: { name: 'Champion', choices: 4, timeLimit: 45, hints: 3 },
    4: { name: 'Hero', choices: 4, timeLimit: 30, hints: 2 },
    5: { name: 'Legend', choices: 4, timeLimit: 25, hints: 1 },
    6: { name: 'Master', choices: 4, timeLimit: 20, hints: 0 },
    7: { name: 'Sage', choices: 5, timeLimit: 15, hints: 0 }
});

// Soft colors for visual redesign
const SOFT_COLORS = Object.freeze({
    science: '#A8E6CF',    // Soft Green
    math: '#A8D8EA',       // Soft Blue
    language: '#DDA0DD',   // Soft Purple
    geography: '#FFDAB3',  // Soft Orange
    history: '#D4C4B0',    // Soft Brown
    logic: '#B8C5D0'       // Soft Gray-Blue
});

const CATEGORIES = Object.freeze({
    science: { name: 'Science', icon: '🔬', color: SOFT_COLORS.science },
    math: { name: 'Math', icon: '🔢', color: SOFT_COLORS.math },
    language: { name: 'Language', icon: '📚', color: SOFT_COLORS.language },
    geography: { name: 'Geography', icon: '🌍', color: SOFT_COLORS.geography },
    history: { name: 'History', icon: '📜', color: SOFT_COLORS.history },
    logic: { name: 'Logic', icon: '🧩', color: SOFT_COLORS.logic }
});

// ==================== Adaptive Difficulty System ====================

/**
 * AdaptiveDifficulty - Performance-based difficulty adjustment
 * Replaces age-based difficulty with speed + accuracy tracking
 */
class AdaptiveDifficulty {
    constructor() {
        this.currentLevel = CALIBRATION_CONFIG.BASE_LEVEL;
        this.recentAnswers = [];
        this.isCalibrated = false;
        this.calibrationAnswers = [];
        this.questionStartTime = 0;
    }

    // ========== DEFENSIVE: Input Validation ==========
    
    validateInputs(responseTimeMs, maxTimeMs) {
        // Guard against null/undefined
        if (typeof responseTimeMs !== 'number' || isNaN(responseTimeMs)) {
            console.warn('[AdaptiveDifficulty] Invalid responseTimeMs, defaulting to maxTime');
            responseTimeMs = maxTimeMs || CALIBRATION_CONFIG.DEFAULT_MAX_TIME;
        }
        // Guard against negative values
        if (responseTimeMs < 0) responseTimeMs = 0;
        if (maxTimeMs < 0 || !maxTimeMs) maxTimeMs = CALIBRATION_CONFIG.DEFAULT_MAX_TIME;
        
        return { responseTimeMs, maxTimeMs };
    }

    // ========== TIMING ==========
    
    startQuestionTimer() {
        this.questionStartTime = Date.now();
    }
    
    getResponseTime() {
        return Date.now() - this.questionStartTime;
    }

    // ========== CALIBRATION PHASE ==========
    
    needsCalibration() {
        return !this.isCalibrated;
    }
    
    recordCalibrationAnswer(isCorrect, responseTimeMs, maxTimeMs) {
        const validated = this.validateInputs(responseTimeMs, maxTimeMs);
        const speedScore = this.calculateSpeedScore(validated.responseTimeMs, validated.maxTimeMs);
        
        this.calibrationAnswers.push({ isCorrect, speedScore });
        
        if (this.calibrationAnswers.length >= CALIBRATION_CONFIG.QUESTIONS_COUNT) {
            this.finalizeCalibration();
            return true; // Calibration complete
        }
        return false; // More calibration questions needed
    }
    
    finalizeCalibration() {
        const correct = this.calibrationAnswers.filter(a => a.isCorrect).length;
        
        // DEFENSIVE: Guard against empty array
        const avgSpeed = this.calibrationAnswers.length > 0
            ? this.calibrationAnswers.reduce((sum, a) => sum + (a.speedScore || 0), 0) / this.calibrationAnswers.length
            : CALIBRATION_CONFIG.DEFAULT_SPEED_SCORE;
        
        // Determine starting level based on calibration
        if (correct === 0) {
            this.currentLevel = 1;
        } else if (correct === 1) {
            this.currentLevel = 2;
        } else if (correct === 2) {
            this.currentLevel = 3;
        } else if (correct === 3 && avgSpeed < 0.6) {
            this.currentLevel = 4;  // All correct but slow
        } else {
            this.currentLevel = 5;  // All correct and fast
        }
        
        this.isCalibrated = true;
        this.saveToStorage();
        
        console.log(`[AdaptiveDifficulty] Calibration complete: Level ${this.currentLevel} (${correct}/3 correct, speed: ${avgSpeed.toFixed(2)})`);
    }
    
    getCalibrationProgress() {
        return {
            current: this.calibrationAnswers.length,
            total: CALIBRATION_CONFIG.QUESTIONS_COUNT
        };
    }

    // ========== MAIN TRACKING ==========
    
    recordAnswer(isCorrect, responseTimeMs, maxTimeMs) {
        // DEFENSIVE: Validate all inputs
        const validated = this.validateInputs(responseTimeMs, maxTimeMs);
        const speedScore = this.calculateSpeedScore(validated.responseTimeMs, validated.maxTimeMs);
        
        this.recentAnswers.push({ isCorrect, speedScore, timestamp: Date.now() });
        
        // DEFENSIVE: Enforce window size limit
        while (this.recentAnswers.length > CALIBRATION_CONFIG.WINDOW_SIZE) {
            this.recentAnswers.shift();
        }
        
        const levelChanged = this.updateDifficulty();
        this.saveToStorage();
        
        return levelChanged;
    }

    calculateSpeedScore(responseTimeMs, maxTimeMs) {
        // DEFENSIVE: Handle no-timer mode (Explorer difficulty)
        if (!maxTimeMs || maxTimeMs === null || maxTimeMs <= 0) {
            return CALIBRATION_CONFIG.DEFAULT_SPEED_SCORE;  // Neutral score
        }
        
        // DEFENSIVE: Clamp ratio between 0 and 1
        const ratio = Math.max(0, Math.min(1, responseTimeMs / maxTimeMs));
        
        if (ratio < 0.25) return 1.0;   // Very fast
        if (ratio < 0.50) return 0.75;  // Fast
        if (ratio < 0.75) return 0.5;   // Moderate
        return 0.25;                     // Slow
    }

    updateDifficulty() {
        // DEFENSIVE: Require minimum data before adjusting
        if (this.recentAnswers.length < 3) return null;
        
        const previousLevel = this.currentLevel;
        const correct = this.recentAnswers.filter(a => a.isCorrect).length;
        const accuracy = correct / this.recentAnswers.length;
        
        // DEFENSIVE: Guard against division by zero
        const avgSpeed = this.recentAnswers.length > 0 
            ? this.recentAnswers.reduce((sum, a) => sum + (a.speedScore || 0), 0) / this.recentAnswers.length
            : CALIBRATION_CONFIG.DEFAULT_SPEED_SCORE;
        
        // Combined performance score (0-1)
        const performance = (accuracy * 0.6) + (avgSpeed * 0.4);
        
        // DEFENSIVE: Clamp level within valid bounds
        if (performance > 0.8 && this.currentLevel < CALIBRATION_CONFIG.MAX_LEVEL) {
            this.currentLevel++;
        } else if (performance < 0.4 && this.currentLevel > CALIBRATION_CONFIG.MIN_LEVEL) {
            this.currentLevel--;
        }
        
        // DEFENSIVE: Final bounds check
        this.currentLevel = Math.max(
            CALIBRATION_CONFIG.MIN_LEVEL, 
            Math.min(CALIBRATION_CONFIG.MAX_LEVEL, this.currentLevel)
        );
        
        // Return level change info for UI feedback
        if (this.currentLevel !== previousLevel) {
            return {
                previous: previousLevel,
                current: this.currentLevel,
                direction: this.currentLevel > previousLevel ? 'up' : 'down'
            };
        }
        return null;
    }
    
    getCurrentLevel() {
        return this.currentLevel;
    }
    
    getLevelName() {
        return DIFFICULTY_PRESETS[this.currentLevel]?.name || 'Champion';
    }
    
    getPerformanceStats() {
        if (this.recentAnswers.length === 0) {
            return { accuracy: 0, avgSpeed: 0, performance: 0 };
        }
        
        const correct = this.recentAnswers.filter(a => a.isCorrect).length;
        const accuracy = correct / this.recentAnswers.length;
        const avgSpeed = this.recentAnswers.reduce((sum, a) => sum + (a.speedScore || 0), 0) / this.recentAnswers.length;
        const performance = (accuracy * 0.6) + (avgSpeed * 0.4);
        
        return { accuracy, avgSpeed, performance };
    }

    // ========== PERSISTENCE ==========
    
    saveToStorage() {
        try {
            const data = {
                currentLevel: this.currentLevel,
                isCalibrated: this.isCalibrated,
                recentAnswers: this.recentAnswers,
                lastUpdated: Date.now()
            };
            localStorage.setItem(QUIZ_CONFIG.ADAPTIVE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('[AdaptiveDifficulty] Failed to save:', e);
            // DEFENSIVE: Continue without storage - don't break the game
        }
    }
    
    loadFromStorage() {
        try {
            const data = JSON.parse(localStorage.getItem(QUIZ_CONFIG.ADAPTIVE_KEY));
            if (data && typeof data.currentLevel === 'number') {
                this.currentLevel = Math.max(
                    CALIBRATION_CONFIG.MIN_LEVEL,
                    Math.min(CALIBRATION_CONFIG.MAX_LEVEL, data.currentLevel)
                );
                this.isCalibrated = data.isCalibrated || false;
                this.recentAnswers = Array.isArray(data.recentAnswers) ? data.recentAnswers : [];
                console.log(`[AdaptiveDifficulty] Loaded from storage: Level ${this.currentLevel}, Calibrated: ${this.isCalibrated}`);
            }
        } catch (e) {
            console.warn('[AdaptiveDifficulty] Failed to load, using defaults:', e);
            // DEFENSIVE: Use defaults on error
            this.reset();
        }
    }
    
    reset() {
        this.currentLevel = CALIBRATION_CONFIG.BASE_LEVEL;
        this.recentAnswers = [];
        this.isCalibrated = false;
        this.calibrationAnswers = [];
    }
    
    // Full reset including storage
    fullReset() {
        this.reset();
        try {
            localStorage.removeItem(QUIZ_CONFIG.ADAPTIVE_KEY);
        } catch (e) {
            console.warn('[AdaptiveDifficulty] Failed to clear storage:', e);
        }
    }
}

// ==================== Difficulty-to-Tier Mapping ====================

/**
 * Map difficulty level (1-7) to question tier (1-5)
 * Levels 6-7 use tier 5 (hardest available)
 */
function getQuestionTier(difficultyLevel) {
    // DEFENSIVE: Clamp difficulty to valid range
    const level = Math.max(1, Math.min(7, difficultyLevel || CALIBRATION_CONFIG.BASE_LEVEL));
    
    // Map difficulty to question tier (max tier is 5)
    const tierMap = {
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 5,  // Master uses Tier 5 (hardest available)
        7: 5   // Sage uses Tier 5 (hardest available)
    };
    
    return tierMap[level] || 3;  // DEFENSIVE: Default to Tier 3
}

/**
 * Get questions with fallback chain for robustness
 */
function getQuestionWithFallback(category, tier) {
    // DEFENSIVE: Try requested tier, fallback to lower tiers
    for (let t = tier; t >= 1; t--) {
        const questions = QUESTION_BANK[category]?.[t];
        if (questions && questions.length > 0) {
            return { questions, actualTier: t };
        }
    }
    
    // DEFENSIVE: Ultimate fallback - any questions from category
    console.warn(`[QuestionEngine] No questions found for ${category} tier ${tier}, using fallback`);
    
    // Try to find any tier in this category
    for (let t = 1; t <= 5; t++) {
        const questions = QUESTION_BANK[category]?.[t];
        if (questions && questions.length > 0) {
            return { questions, actualTier: t };
        }
    }
    
    // Ultimate fallback - science tier 1
    return { 
        questions: QUESTION_BANK['science']?.[1] || [{ q: 'What is 1+1?', a: '2', wrong: ['1', '3'] }],
        actualTier: 1 
    };
}

// DEPRECATED: Age-based difficulty (kept for backward compatibility)
function getDifficultyFromAge(age) {
    console.warn('[DEPRECATED] getDifficultyFromAge is deprecated. Use AdaptiveDifficulty class instead.');
    if (age <= 8) return 1;
    if (age <= 10) return 2;
    if (age <= 12) return 3;
    if (age <= 15) return 4;
    if (age <= 18) return 5;
    if (age <= 25) return 6;
    return 7;
}

// ==================== Question Bank ====================

const QUESTION_BANK = {
    science: {
        1: [ // Easy
            { q: "What do plants need to grow?", a: "Sunlight and water", wrong: ["Only rocks", "Darkness"] },
            { q: "How many legs does a spider have?", a: "8", wrong: ["6", "4"] },
            { q: "What is the closest star to Earth?", a: "The Sun", wrong: ["The Moon", "Mars"] },
            { q: "What do bees make?", a: "Honey", wrong: ["Milk", "Bread"] },
            { q: "Where do fish live?", a: "Water", wrong: ["Trees", "Clouds"] },
            // NEW: Enhanced schema examples with id, hint, explanation
            { 
                id: "sci-1-006",
                q: "What color is the sky on a clear day?", 
                a: "Blue", 
                wrong: ["Green", "Red"],
                hint: "Think about what you see when you look up outside",
                explanation: "The sky appears blue because molecules in the air scatter blue light from the sun more than other colors."
            },
            { 
                id: "sci-1-007",
                q: "What do we call frozen water?", 
                a: "Ice", 
                wrong: ["Steam", "Fog"],
                hint: "You find this in your freezer",
                explanation: "When water gets very cold (below 0°C or 32°F), it freezes and becomes ice."
            }
        ],
        2: [
            { q: "What planet is known as the Red Planet?", a: "Mars", wrong: ["Venus", "Jupiter"] },
            { q: "What gas do humans breathe out?", a: "Carbon dioxide", wrong: ["Oxygen", "Nitrogen"] },
            { q: "How many planets are in our solar system?", a: "8", wrong: ["9", "7"] },
            { q: "What is H2O commonly called?", a: "Water", wrong: ["Air", "Salt"] },
            { q: "What animal is known for its long neck?", a: "Giraffe", wrong: ["Elephant", "Lion"] },
            // NEW: Enhanced schema examples
            {
                id: "sci-2-006",
                q: "What is the largest planet in our solar system?",
                a: "Jupiter",
                wrong: ["Saturn", "Neptune"],
                hint: "This planet is named after the king of Roman gods",
                explanation: "Jupiter is so large that over 1,300 Earths could fit inside it!"
            }
        ],
        3: [
            { q: "What is the largest organ in the human body?", a: "Skin", wrong: ["Heart", "Brain", "Liver"] },
            { q: "What force keeps us on the ground?", a: "Gravity", wrong: ["Magnetism", "Friction", "Wind"] },
            { q: "What is the boiling point of water in Celsius?", a: "100°C", wrong: ["50°C", "0°C", "200°C"] },
            { q: "What type of animal is a dolphin?", a: "Mammal", wrong: ["Fish", "Reptile", "Bird"] },
            { q: "What do caterpillars turn into?", a: "Butterflies", wrong: ["Bees", "Spiders", "Ants"] },
            // NEW: Enhanced schema examples
            {
                id: "sci-3-006",
                q: "What is the process called when a liquid becomes a gas?",
                a: "Evaporation",
                wrong: ["Condensation", "Freezing", "Melting"],
                hint: "Think about what happens to water in a hot pan",
                explanation: "Evaporation occurs when liquid molecules gain enough energy to escape into the air as gas."
            }
        ],
        4: [
            { q: "What is the chemical symbol for gold?", a: "Au", wrong: ["Ag", "Go", "Gd"] },
            { q: "What is the powerhouse of the cell?", a: "Mitochondria", wrong: ["Nucleus", "Ribosome", "Membrane"] },
            { q: "What type of rock is formed from cooled lava?", a: "Igneous", wrong: ["Sedimentary", "Metamorphic", "Crystal"] },
            { q: "What is the speed of light?", a: "300,000 km/s", wrong: ["150,000 km/s", "1,000 km/s", "3,000 km/s"] },
            { q: "Which planet has the most moons?", a: "Saturn", wrong: ["Jupiter", "Uranus", "Neptune"] }
        ],
        5: [
            { q: "What is the atomic number of carbon?", a: "6", wrong: ["12", "8", "4"] },
            { q: "What is the process by which plants make food?", a: "Photosynthesis", wrong: ["Respiration", "Digestion", "Fermentation"] },
            { q: "What particle has a negative charge?", a: "Electron", wrong: ["Proton", "Neutron", "Positron"] },
            { q: "What is the hardest natural substance?", a: "Diamond", wrong: ["Steel", "Titanium", "Quartz"] }
        ]
    },
    math: {
        1: [
            { q: "What is 2 + 2?", a: "4", wrong: ["3", "5"] },
            { q: "What is 5 - 3?", a: "2", wrong: ["1", "3"] },
            { q: "How many sides does a triangle have?", a: "3", wrong: ["4", "5"] },
            { q: "What is 1 + 1?", a: "2", wrong: ["1", "3"] },
            { q: "What shape is a ball?", a: "Circle/Sphere", wrong: ["Square", "Triangle"] },
            // NEW: Enhanced schema examples
            {
                id: "math-1-006",
                q: "How many fingers do you have on both hands?",
                a: "10",
                wrong: ["8", "12"],
                hint: "Count the fingers on one hand, then double it",
                explanation: "Each hand has 5 fingers, and 5 + 5 = 10 fingers in total!"
            }
        ],
        2: [
            { q: "What is 7 × 8?", a: "56", wrong: ["54", "48"] },
            { q: "What is 100 ÷ 4?", a: "25", wrong: ["20", "30"] },
            { q: "How many degrees in a right angle?", a: "90", wrong: ["45", "180"] },
            { q: "What is 15 + 27?", a: "42", wrong: ["41", "43"] },
            { q: "What is half of 50?", a: "25", wrong: ["20", "30"] },
            // NEW: Enhanced schema examples
            {
                id: "math-2-006",
                q: "What is 9 × 9?",
                a: "81",
                wrong: ["72", "90"],
                hint: "Think of 9 groups of 9 items",
                explanation: "9 × 9 = 81. A trick: 9 times tables follow a pattern where digits sum to 9 (8+1=9)!"
            }
        ],
        3: [
            { q: "What is 12 × 12?", a: "144", wrong: ["122", "132", "154"] },
            { q: "What is the square root of 81?", a: "9", wrong: ["8", "7", "10"] },
            { q: "How many degrees in a circle?", a: "360", wrong: ["180", "270", "400"] },
            { q: "What is 25% of 200?", a: "50", wrong: ["25", "75", "100"] },
            { q: "What is 3³?", a: "27", wrong: ["9", "18", "36"] },
            // NEW: Enhanced schema examples
            {
                id: "math-3-006",
                q: "What is the area of a square with side length 5?",
                a: "25",
                wrong: ["10", "20", "30"],
                hint: "Area of a square = side × side",
                explanation: "For a square, multiply one side by itself: 5 × 5 = 25 square units."
            }
        ],
        4: [
            { q: "What is the value of π (pi) to 2 decimal places?", a: "3.14", wrong: ["3.41", "3.12", "3.16"] },
            { q: "Solve: 2x + 6 = 14", a: "x = 4", wrong: ["x = 3", "x = 5", "x = 6"] },
            { q: "What is 15% of 80?", a: "12", wrong: ["10", "15", "8"] },
            { q: "What is the cube root of 125?", a: "5", wrong: ["4", "6", "25"] },
            // NEW: Enhanced schema examples
            {
                id: "math-4-006",
                q: "If a triangle has angles of 60° and 70°, what is the third angle?",
                a: "50°",
                wrong: ["60°", "80°", "40°"],
                hint: "All angles in a triangle add up to 180°",
                explanation: "Triangle angles sum to 180°. So 180 - 60 - 70 = 50°."
            }
        ],
        5: [
            { q: "What is the derivative of x²?", a: "2x", wrong: ["x", "x²", "2x²"] },
            { q: "What is log₁₀(1000)?", a: "3", wrong: ["2", "4", "10"] },
            { q: "What is sin(90°)?", a: "1", wrong: ["0", "0.5", "-1"] },
            { q: "Solve: x² - 9 = 0", a: "x = ±3", wrong: ["x = 3", "x = 9", "x = ±9"] }
        ]
    },
    geography: {
        1: [
            { q: "What is the largest ocean?", a: "Pacific", wrong: ["Atlantic", "Indian"] },
            { q: "How many continents are there?", a: "7", wrong: ["5", "6"] },
            { q: "What is the tallest mountain?", a: "Mount Everest", wrong: ["K2", "Mont Blanc"] },
            { q: "Which country has the Great Wall?", a: "China", wrong: ["Japan", "India"] },
            { q: "What is the longest river?", a: "Nile", wrong: ["Amazon", "Mississippi"] }
        ],
        2: [
            { q: "What is the capital of France?", a: "Paris", wrong: ["London", "Berlin"] },
            { q: "Which desert is the largest?", a: "Sahara", wrong: ["Gobi", "Kalahari"] },
            { q: "What country is shaped like a boot?", a: "Italy", wrong: ["Spain", "Greece"] },
            { q: "What ocean is between USA and Europe?", a: "Atlantic", wrong: ["Pacific", "Indian"] }
        ],
        3: [
            { q: "What is the smallest country in the world?", a: "Vatican City", wrong: ["Monaco", "San Marino", "Liechtenstein"] },
            { q: "What is the capital of Australia?", a: "Canberra", wrong: ["Sydney", "Melbourne", "Brisbane"] },
            { q: "Which river flows through London?", a: "Thames", wrong: ["Seine", "Danube", "Rhine"] },
            { q: "What country has the most population?", a: "India", wrong: ["China", "USA", "Indonesia"] }
        ],
        4: [
            { q: "What is the capital of Mongolia?", a: "Ulaanbaatar", wrong: ["Astana", "Bishkek", "Dushanbe"] },
            { q: "Which strait separates Europe from Africa?", a: "Gibraltar", wrong: ["Bosphorus", "Hormuz", "Malacca"] },
            { q: "What is the deepest ocean trench?", a: "Mariana Trench", wrong: ["Puerto Rico Trench", "Java Trench", "Philippine Trench"] }
        ]
    },
    history: {
        1: [
            { q: "Who was the first US president?", a: "George Washington", wrong: ["Abraham Lincoln", "Thomas Jefferson"] },
            { q: "What ancient people built pyramids?", a: "Egyptians", wrong: ["Romans", "Greeks"] },
            { q: "Who discovered America?", a: "Christopher Columbus", wrong: ["Marco Polo", "Magellan"] }
        ],
        2: [
            { q: "In what year did World War II end?", a: "1945", wrong: ["1944", "1946"] },
            { q: "Who painted the Mona Lisa?", a: "Leonardo da Vinci", wrong: ["Michelangelo", "Raphael"] },
            { q: "What empire built the Colosseum?", a: "Roman Empire", wrong: ["Greek Empire", "Ottoman Empire"] }
        ],
        3: [
            { q: "Who wrote the Declaration of Independence?", a: "Thomas Jefferson", wrong: ["Benjamin Franklin", "John Adams", "George Washington"] },
            { q: "What year did the Titanic sink?", a: "1912", wrong: ["1905", "1920", "1898"] },
            { q: "Who was known as the 'Maid of Orleans'?", a: "Joan of Arc", wrong: ["Marie Antoinette", "Queen Victoria", "Cleopatra"] }
        ],
        4: [
            { q: "What treaty ended World War I?", a: "Treaty of Versailles", wrong: ["Treaty of Paris", "Treaty of Ghent", "Treaty of Vienna"] },
            { q: "Who was the first Emperor of Rome?", a: "Augustus", wrong: ["Julius Caesar", "Nero", "Caligula"] },
            { q: "In what year did the Berlin Wall fall?", a: "1989", wrong: ["1991", "1987", "1985"] }
        ]
    },
    logic: {
        1: [
            { q: "What comes next: 2, 4, 6, ?", a: "8", wrong: ["7", "10"] },
            { q: "If all cats are animals, is Whiskers (a cat) an animal?", a: "Yes", wrong: ["No", "Maybe"] },
            { q: "Which is the odd one out: Apple, Banana, Carrot?", a: "Carrot", wrong: ["Apple", "Banana"] }
        ],
        2: [
            { q: "What comes next: 1, 1, 2, 3, 5, ?", a: "8", wrong: ["6", "7"] },
            { q: "If A=1, B=2, C=3, what is CAB?", a: "6", wrong: ["312", "5"] },
            { q: "Which doesn't belong: Circle, Square, Triangle, Red?", a: "Red", wrong: ["Circle", "Square"] }
        ],
        3: [
            { q: "What comes next: 2, 6, 12, 20, ?", a: "30", wrong: ["28", "32", "24"] },
            { q: "If 2+3=10, 4+5=36, then 6+7=?", a: "78", wrong: ["84", "72", "66"] },
            { q: "Complete: ○ △ ○ △ ○ ?", a: "△", wrong: ["○", "□", "◇"] }
        ],
        4: [
            { q: "Find the pattern: 3, 6, 11, 18, ?", a: "27", wrong: ["25", "29", "24"] },
            { q: "If only some A are B, and all B are C, can all A be C?", a: "Not necessarily", wrong: ["Yes", "No", "Always"] }
        ]
    },
    language: {
        1: [ // Easy - Basic vocabulary and simple words
            { q: "What is the opposite of 'happy'?", a: "Sad", wrong: ["Big", "Fast"] },
            { q: "Which word rhymes with 'cat'?", a: "Hat", wrong: ["Dog", "Cup"] },
            { q: "What is another word for 'big'?", a: "Large", wrong: ["Small", "Tiny"] },
            { q: "Which word means the same as 'quick'?", a: "Fast", wrong: ["Slow", "Heavy"] },
            { q: "What is the opposite of 'hot'?", a: "Cold", wrong: ["Warm", "Dry"] }
        ],
        2: [ // Intermediate vocabulary
            { q: "What is a word that means 'very tired'?", a: "Exhausted", wrong: ["Energetic", "Excited"] },
            { q: "Which word is spelled correctly?", a: "Beautiful", wrong: ["Beautifull", "Beutiful"] },
            { q: "What is the opposite of 'ancient'?", a: "Modern", wrong: ["Old", "Historic"] },
            { q: "What is another word for 'brave'?", a: "Courageous", wrong: ["Scared", "Shy"] },
            { q: "Which word rhymes with 'night'?", a: "Light", wrong: ["Day", "Dark"] }
        ],
        3: [ // Grammar and parts of speech
            { q: "In 'The dog runs fast', what is the verb?", a: "Runs", wrong: ["Dog", "Fast", "The"] },
            { q: "Which is a noun?", a: "Mountain", wrong: ["Quickly", "Beautiful", "Jump"] },
            { q: "What type of word is 'quickly'?", a: "Adverb", wrong: ["Noun", "Verb", "Adjective"] },
            { q: "Which sentence is correct?", a: "She is taller than him", wrong: ["She is more taller", "She is tallest than him", "Her is taller"] },
            { q: "What is the plural of 'child'?", a: "Children", wrong: ["Childs", "Childes", "Childrens"] }
        ],
        4: [ // Advanced vocabulary and idioms
            { q: "What does 'break the ice' mean?", a: "Start a conversation", wrong: ["Destroy something", "Get cold", "Win a game"] },
            { q: "Which word means 'to make better'?", a: "Improve", wrong: ["Worsen", "Maintain", "Destroy"] },
            { q: "What is the past tense of 'swim'?", a: "Swam", wrong: ["Swimmed", "Swum", "Swimming"] },
            { q: "What does 'benevolent' mean?", a: "Kind and generous", wrong: ["Evil", "Confused", "Tired"] },
            { q: "Which is the correct spelling?", a: "Necessary", wrong: ["Neccessary", "Necesary", "Neccesary"] }
        ],
        5: [ // Expert level vocabulary
            { q: "What does 'ubiquitous' mean?", a: "Found everywhere", wrong: ["Rare", "Invisible", "Unique"] },
            { q: "What is a synonym for 'ephemeral'?", a: "Short-lived", wrong: ["Eternal", "Solid", "Heavy"] },
            { q: "Which word means 'to criticize severely'?", a: "Lambaste", wrong: ["Praise", "Ignore", "Assist"] },
            { q: "What does 'serendipity' mean?", a: "Happy accident", wrong: ["Sadness", "Planning", "Confusion"] }
        ]
    }
};

// ==================== Map Locations ====================

const MAP_LOCATIONS = [
    { id: 'forest', name: 'Wisdom Forest', x: 75, y: 260, category: 'science', icon: '🌲', unlocked: true },
    { id: 'mountain', name: 'Math Mountain', x: 190, y: 200, category: 'math', icon: '⛰️', unlocked: true },
    { id: 'village', name: 'Word Village', x: 305, y: 245, category: 'language', icon: '🏘️', unlocked: false },
    { id: 'ocean', name: 'Geography Ocean', x: 95, y: 130, category: 'geography', icon: '🌊', unlocked: false },
    { id: 'castle', name: 'History Castle', x: 280, y: 90, category: 'history', icon: '🏰', unlocked: false },
    { id: 'temple', name: 'Logic Temple', x: 190, y: 40, category: 'logic', icon: '🏛️', unlocked: false }
];

// ==================== Map Renderer ====================

class MapRenderer {
    constructor(canvas, locations) {
        this.canvas = canvas;
        this.ctx = canvas?.getContext('2d');
        this.locations = locations;
        this.selectedLocation = null;
    }
    
    render(unlockedLocations = ['forest', 'mountain']) {
        if (!this.ctx) return;
        
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw background (sky gradient approximation with solid color)
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, width, height);
        
        // Draw clouds
        this.drawClouds(ctx);
        
        // Draw paths between locations
        this.drawPaths(ctx, unlockedLocations);
        
        // Draw locations
        this.locations.forEach(loc => {
            const isUnlocked = unlockedLocations.includes(loc.id);
            this.drawLocation(ctx, loc, isUnlocked);
        });
    }
    
    drawClouds(ctx) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        // Draw some cloud shapes
        [[50, 50], [150, 100], [300, 70], [350, 150]].forEach(([x, y]) => {
            ctx.beginPath();
            ctx.arc(x, y, 25, 0, Math.PI * 2);
            ctx.arc(x + 30, y - 10, 20, 0, Math.PI * 2);
            ctx.arc(x + 50, y, 25, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    drawPaths(ctx, unlockedLocations) {
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        
        // Connect adjacent locations
        for (let i = 0; i < this.locations.length - 1; i++) {
            const from = this.locations[i];
            const to = this.locations[i + 1];
            
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
        }
        
        ctx.setLineDash([]);
    }
    
    drawLocation(ctx, location, isUnlocked) {
        const { x, y, icon, name } = location;
        const isSelected = this.selectedLocation?.id === location.id;
        
        // Draw marker background
        ctx.beginPath();
        ctx.arc(x, y, isSelected ? 35 : 30, 0, Math.PI * 2);
        ctx.fillStyle = isUnlocked ? (isSelected ? '#FFB6C1' : '#FFF') : '#AAA';
        ctx.fill();
        ctx.strokeStyle = isUnlocked ? '#FFB6C1' : '#888';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw icon
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isUnlocked ? '#333' : '#666';
        ctx.fillText(icon, x, y);
        
        // Draw name below
        ctx.font = '10px Arial';
        ctx.fillStyle = isUnlocked ? '#333' : '#888';
        ctx.fillText(name, x, y + 45);
        
        // Draw lock if not unlocked
        if (!isUnlocked) {
            ctx.font = '14px Arial';
            ctx.fillText('🔒', x + 20, y - 20);
        }
    }
    
    getLocationAt(x, y) {
        return this.locations.find(loc => {
            const dx = loc.x - x;
            const dy = loc.y - y;
            return Math.sqrt(dx * dx + dy * dy) < 35;
        });
    }
    
    selectLocation(location) {
        this.selectedLocation = location;
    }
}

// ==================== Question Engine ====================

/**
 * Normalize a question to the enhanced schema format
 * Supports both old format { q, a, wrong } and new format { id, q, a, wrong, hint, explanation }
 * @param {Object} raw - Raw question object
 * @param {string} category - Question category
 * @param {number} tier - Difficulty tier
 * @param {number} index - Index in array
 * @returns {Object} Normalized question
 */
function normalizeQuestion(raw, category, tier, index) {
    return {
        id: raw.id ?? `${category}-${tier}-${index}`,
        q: raw.q,
        a: raw.a,
        wrong: raw.wrong,
        hint: raw.hint ?? null,           // Optional - use fallback generator if null
        explanation: raw.explanation ?? null  // Optional - use fallback generator if null
    };
}

/**
 * Validate a question object has required fields
 * @param {Object} q - Question to validate
 * @returns {{valid: boolean, errors: string[]}}
 */
function validateQuestion(q) {
    const errors = [];
    
    if (typeof q.q !== 'string' || q.q.length === 0) {
        errors.push('Missing or invalid question text (q)');
    }
    if (typeof q.a !== 'string' || q.a.length === 0) {
        errors.push('Missing or invalid answer (a)');
    }
    if (!Array.isArray(q.wrong) || q.wrong.length < 2) {
        errors.push('Wrong answers must be array with at least 2 items');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validate a batch of questions before merging
 * @param {Array} batch - Array of questions
 * @returns {{valid: boolean, errors: Array, validCount: number}}
 */
function validateQuestionBatch(batch) {
    if (!Array.isArray(batch)) {
        return { valid: false, errors: ['Batch must be an array'], validCount: 0 };
    }
    
    const allErrors = [];
    let validCount = 0;
    
    batch.forEach((q, i) => {
        const result = validateQuestion(q);
        if (result.valid) {
            validCount++;
        } else {
            allErrors.push({ index: i, errors: result.errors });
        }
    });
    
    return {
        valid: allErrors.length === 0,
        errors: allErrors,
        validCount
    };
}

class QuestionEngine {
    constructor() {
        this.usedQuestions = new Set();
    }
    
    getQuestion(category, difficulty) {
        // Get appropriate difficulty tier
        const tier = Math.min(difficulty, 5);
        const questions = QUESTION_BANK[category]?.[tier] || QUESTION_BANK[category]?.[1] || [];
        
        // Filter out used questions
        const available = questions.filter((_, i) => 
            !this.usedQuestions.has(`${category}-${tier}-${i}`)
        );
        
        // If all used, reset for this category
        if (available.length === 0) {
            questions.forEach((_, i) => {
                this.usedQuestions.delete(`${category}-${tier}-${i}`);
            });
            return this.getQuestion(category, difficulty);
        }
        
        // Pick random question
        const idx = Math.floor(Math.random() * available.length);
        const originalIdx = questions.indexOf(available[idx]);
        this.usedQuestions.add(`${category}-${tier}-${originalIdx}`);
        
        const question = available[idx];
        
        // Normalize question to enhanced schema (NEW - Day 5)
        const normalized = normalizeQuestion(question, category, tier, originalIdx);
        
        // Create shuffled choices
        const numChoices = DIFFICULTY_PRESETS[difficulty]?.choices || 4;
        const choices = this.shuffleArray([normalized.a, ...normalized.wrong]).slice(0, numChoices);
        
        // Ensure correct answer is included
        if (!choices.includes(normalized.a)) {
            choices[Math.floor(Math.random() * choices.length)] = normalized.a;
        }
        
        return {
            id: normalized.id,                    // NEW: Question ID for tracking
            question: normalized.q,
            correctAnswer: normalized.a,
            choices: this.shuffleArray(choices),
            category: category,
            hint: normalized.hint,                // NEW: Optional hint text
            explanation: normalized.explanation,  // NEW: Optional explanation text
            tier: tier,                           // NEW: Tier for returnToPool
            index: originalIdx                    // NEW: Index for returnToPool
        };
    }
    
    shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    
    /**
     * Return a question to the available pool (for Skip power-up)
     * @param {string} questionKey - The question key in format "category-tier-index"
     * @returns {boolean} True if successfully returned, false if not found
     */
    returnToPool(questionKey) {
        if (!questionKey) return false;
        if (!this.usedQuestions.has(questionKey)) return false;
        
        this.usedQuestions.delete(questionKey);
        console.log(`[QuestionEngine] Returned question to pool: ${questionKey}`);
        return true;
    }
    
    /**
     * Get the key for the current question (for Skip power-up tracking)
     * @param {string} category 
     * @param {number} tier 
     * @param {number} index 
     * @returns {string}
     */
    getQuestionKey(category, tier, index) {
        return `${category}-${tier}-${index}`;
    }
    
    reset() {
        this.usedQuestions.clear();
    }
}

// ==================== Main Game Class ====================

class QuizQuestGame {
    constructor() {
        // Audio system - safely initialize
        this.audio = typeof gameAudio !== 'undefined' ? gameAudio : null;
        this.musicEnabled = true;
        this.sfxEnabled = true;
        
        // Game state
        this.difficulty = 1;
        this.lives = QUIZ_CONFIG.STARTING_LIVES;
        this.score = 0;
        this.streak = 0;
        this.totalStars = 0;
        this.currentLocation = null;
        this.currentQuestion = null;
        this.questionIndex = 0;
        this.questionsPerLocation = 5;
        this.correctInLocation = 0;
        this.isPlaying = false;
        this.timerInterval = null;
        this.timeRemaining = 0;
        
        // Unlocked locations
        this.unlockedLocations = ['forest', 'mountain'];
        
        // Power-ups system (NEW - now enabled!)
        this._powerupsEnabled = true;   // Feature flag - ENABLED
        this._answerSelected = false;   // Track if answer already selected
        this.powerups = {
            fiftyFifty: { remaining: 2, used: false },
            hint: { remaining: 3, used: false },
            skip: { remaining: 1, used: false }
        };
        
        // Question timing for adaptive difficulty
        this._questionStartTime = null;
        
        // Explanation modal feature (NEW)
        this._explanationEnabled = true;  // Feature flag for explanation modal
        
        // Adaptive difficulty system (NEW - Day 4)
        this._useAdaptiveDifficulty = true;  // Feature flag
        this.adaptiveDifficulty = null;      // Initialized in init()
        
        // Components
        this.questionEngine = new QuestionEngine();
        
        // DOM elements
        this.screens = {
            start: document.getElementById('start-screen'),
            map: document.getElementById('map-screen'),
            quiz: document.getElementById('quiz-screen'),
            result: document.getElementById('result-screen'),
            gameover: document.getElementById('gameover-screen')
        };
        
        this.elements = this.initElements();
        
        // Map renderer
        this.mapCanvas = document.getElementById('map-canvas');
        this.mapRenderer = new MapRenderer(this.mapCanvas, MAP_LOCATIONS);
        
        this.init();
    }
    
    initElements() {
        const getElement = (id) => document.getElementById(id);
        
        return {
            ageSelect: getElement('age-select'),
            startBtn: getElement('start-btn'),
            highScoreValue: getElement('high-score-value'),
            totalStars: getElement('total-stars'),
            livesDisplay: getElement('lives-display'),
            mapScore: getElement('map-score'),
            locationInfo: getElement('location-info'),
            locationName: getElement('location-name'),
            locationDesc: getElement('location-desc'),
            locationQuestions: getElement('location-questions'),
            locationCategory: getElement('location-category'),
            enterLocationBtn: getElement('enter-location-btn'),
            questionNumber: getElement('question-number'),
            progressFill: getElement('progress-fill'),
            timerContainer: getElement('timer-container'),
            timerFill: getElement('timer-fill'),
            timerText: getElement('timer-text'),
            categoryIcon: getElement('category-icon'),
            categoryName: getElement('category-name'),
            questionText: getElement('question-text'),
            answersGrid: getElement('answers-grid'),
            feedbackOverlay: getElement('feedback-overlay'),
            feedbackIcon: getElement('feedback-icon'),
            feedbackText: getElement('feedback-text'),
            feedbackExplanation: getElement('feedback-explanation'),
            continueBtn: getElement('continue-btn'),
            finalScore: getElement('final-score'),
            finalStars: getElement('final-stars'),
            locationsComplete: getElement('locations-complete'),
            newRecord: getElement('new-record'),
            playAgainBtn: getElement('play-again-btn'),
            homeBtn: getElement('home-btn'),
            retryBtn: getElement('retry-btn'),
            quitBtn: getElement('quit-btn'),
            gameoverScore: getElement('gameover-score'),
            gameoverStars: getElement('gameover-stars')
        };
    }
    
    init() {
        // Initialize adaptive difficulty system (NEW - Day 4)
        this._initAdaptiveDifficulty();
        
        this.loadProgress();
        this.setupEventListeners();
        this.updateStartScreen();
        this.showScreen('start');
    }
    
    /**
     * Initialize adaptive difficulty with fallback
     * @private
     */
    _initAdaptiveDifficulty() {
        if (!this._useAdaptiveDifficulty) {
            console.log('[Adaptive] Feature disabled, using age-based difficulty');
            return;
        }
        
        try {
            // AdaptiveDifficulty class is defined in separate file but also on window
            if (typeof AdaptiveDifficulty !== 'undefined') {
                this.adaptiveDifficulty = new AdaptiveDifficulty({
                    enabled: true,
                    shadowMode: false,  // Actually affect gameplay
                    initialTier: 3      // Start at Champion
                });
                console.log('[Adaptive] Initialized successfully');
            } else {
                console.warn('[Adaptive] AdaptiveDifficulty class not found, using age-based fallback');
                this.adaptiveDifficulty = null;
            }
        } catch (err) {
            console.error('[Adaptive] Init failed, using age-based fallback:', err);
            this.adaptiveDifficulty = null;
        }
    }
    
    /**
     * Get initial difficulty - tries adaptive, falls back to age-based
     * @private
     * @returns {number} Difficulty level 1-7
     */
    _getInitialDifficulty() {
        // Try adaptive difficulty first
        if (this.adaptiveDifficulty?.enabled) {
            const tier = this.adaptiveDifficulty.getTier();
            if (tier !== null && tier >= 1 && tier <= 7) {
                console.log(`[Adaptive] Using adaptive tier: ${tier}`);
                return tier;
            }
        }
        
        // Fallback: original age-based logic
        let age = 16;
        if (typeof PlayerManager !== 'undefined' && PlayerManager.hasActivePlayer()) {
            age = PlayerManager.getPlayerAge() || 16;
        }
        const difficulty = getDifficultyFromAge(age);
        console.log(`[Adaptive] Fallback to age-based: age=${age}, difficulty=${difficulty}`);
        return difficulty;
    }
    
    /**
     * Record an answer for adaptive difficulty tracking
     * @private
     * @param {boolean} isCorrect 
     */
    _recordAnswerForAdaptive(isCorrect) {
        if (!this.adaptiveDifficulty?.enabled) return;
        
        try {
            // Calculate response time
            const responseTime = this._questionStartTime 
                ? Date.now() - this._questionStartTime 
                : 15000; // Default 15s if not tracked
            
            // Get max time from current difficulty preset
            const settings = DIFFICULTY_PRESETS[this.difficulty];
            const maxTime = settings?.timeLimit ? settings.timeLimit * 1000 : 30000;
            
            // Record the answer
            const newTier = this.adaptiveDifficulty.recordAnswer(isCorrect, responseTime, maxTime);
            
            // Update difficulty if tier changed
            if (newTier !== null && newTier !== this.difficulty) {
                console.log(`[Adaptive] Difficulty adjusted: ${this.difficulty} → ${newTier}`);
                this.difficulty = newTier;
            }
        } catch (err) {
            console.error('[Adaptive] Error recording answer:', err);
            // Fail silently - game continues with current difficulty
        }
    }
    
    setupEventListeners() {
        // Debug logging
        console.log('[Quiz Quest] Setting up event listeners');
        console.log('[Quiz Quest] Start button:', this.elements.startBtn);
        
        // Start button
        this.elements.startBtn?.addEventListener('click', () => {
            console.log('[Quiz Quest] Start button clicked!');
            this.startGame();
        });
        
        // Enter location
        this.elements.enterLocationBtn?.addEventListener('click', () => this.enterLocation());
        
        // Continue after feedback
        this.elements.continueBtn?.addEventListener('click', () => this.continueQuiz());
        
        // Result screen buttons
        this.elements.playAgainBtn?.addEventListener('click', () => this.startGame());
        this.elements.homeBtn?.addEventListener('click', () => this.goHome());
        
        // Game over buttons
        this.elements.retryBtn?.addEventListener('click', () => this.startGame());
        this.elements.quitBtn?.addEventListener('click', () => this.goHome());
        
        // Map canvas click
        this.mapCanvas?.addEventListener('click', (e) => this.handleMapClick(e));
        
        // Power-up buttons (NEW - wired but handlers have guards)
        this._wireOptionalPowerups();
        
        // Explanation modal continue button (NEW)
        const explanationContinueBtn = document.getElementById('explanation-continue-btn');
        explanationContinueBtn?.addEventListener('click', () => this._closeExplanationModal());
    }
    
    // ==================== POWER-UPS SYSTEM (NEW) ====================
    
    /**
     * Wire power-up button event listeners
     * @private
     */
    _wireOptionalPowerups() {
        const wireButton = (id, handler) => {
            const btn = document.getElementById(id);
            if (!btn) return;  // Button doesn't exist - skip silently
            
            btn.addEventListener('click', () => {
                try {
                    handler.call(this);
                } catch (err) {
                    console.error(`[PowerUp:${id}] Handler error:`, err);
                    // Fail silently - game continues
                }
            });
        };
        
        wireButton('fifty-btn', this.useFiftyFifty);
        wireButton('hint-btn', this.useHint);
        wireButton('skip-btn', this.useSkip);
    }
    
    /**
     * Initialize power-ups for a new location
     * @private
     */
    _initPowerupsForLocation() {
        this.powerups = {
            fiftyFifty: { remaining: 2, used: false },
            hint: { remaining: 3, used: false },
            skip: { remaining: 1, used: false }
        };
        this._updatePowerupUI();
    }
    
    /**
     * Update power-up button UI (counts and disabled states)
     * @private
     */
    _updatePowerupUI() {
        // Update counts
        const fiftyCount = document.getElementById('fifty-count');
        const hintCount = document.getElementById('hint-count');
        const skipCount = document.getElementById('skip-count');
        
        if (fiftyCount) fiftyCount.textContent = this.powerups.fiftyFifty.remaining;
        if (hintCount) hintCount.textContent = this.powerups.hint.remaining;
        if (skipCount) skipCount.textContent = this.powerups.skip.remaining;
        
        // Update disabled states
        const fiftyBtn = document.getElementById('fifty-btn');
        const hintBtn = document.getElementById('hint-btn');
        const skipBtn = document.getElementById('skip-btn');
        
        if (fiftyBtn) {
            fiftyBtn.disabled = !this._powerupsEnabled || this.powerups.fiftyFifty.remaining <= 0;
            fiftyBtn.classList.toggle('disabled', fiftyBtn.disabled);
        }
        if (hintBtn) {
            hintBtn.disabled = !this._powerupsEnabled || this.powerups.hint.remaining <= 0;
            hintBtn.classList.toggle('disabled', hintBtn.disabled);
        }
        if (skipBtn) {
            skipBtn.disabled = !this._powerupsEnabled || this.powerups.skip.remaining <= 0;
            skipBtn.classList.toggle('disabled', skipBtn.disabled);
        }
    }
    
    /**
     * 50/50 Power-up: Remove 2 wrong answers
     */
    useFiftyFifty() {
        // Guard clauses - return early if anything unexpected
        if (!this._powerupsEnabled) {
            console.log('[PowerUp:5050] Feature disabled');
            return;
        }
        if (!this.powerups?.fiftyFifty || this.powerups.fiftyFifty.remaining <= 0) {
            this._showPowerupToast('No 50/50 remaining!');
            return;
        }
        if (!this.currentQuestion) {
            console.log('[PowerUp:5050] No current question');
            return;
        }
        if (this._answerSelected) {
            console.log('[PowerUp:5050] Answer already selected');
            return;
        }
        if (this.powerups.fiftyFifty.used) {
            console.log('[PowerUp:5050] Already used this question');
            return;
        }
        
        // Mark as used for this question
        this.powerups.fiftyFifty.remaining--;
        this.powerups.fiftyFifty.used = true;
        this._updatePowerupUI();
        
        // Find correct answer index
        const correctAnswer = this.currentQuestion.correctAnswer;
        const choices = this.currentQuestion.choices;
        const correctIndex = choices.indexOf(correctAnswer);
        
        // Get indices of wrong answers
        const wrongIndices = choices
            .map((_, i) => i)
            .filter(i => i !== correctIndex);
        
        // Shuffle and take 2 to eliminate
        const shuffled = wrongIndices.sort(() => Math.random() - 0.5);
        const toRemove = shuffled.slice(0, 2);
        
        // Disable those buttons visually
        const answerBtns = this.elements.answersGrid?.querySelectorAll('.answer-btn');
        if (answerBtns) {
            toRemove.forEach(idx => {
                const btn = answerBtns[idx];
                if (btn) {
                    btn.classList.add('eliminated');
                    btn.disabled = true;
                }
            });
        }
        
        this.playSound('powerup');
        console.log('[PowerUp:5050] Eliminated 2 wrong answers');
    }
    
    /**
     * Hint Power-up: Show a hint for the current question
     */
    useHint() {
        // Guard clauses
        if (!this._powerupsEnabled) {
            console.log('[PowerUp:Hint] Feature disabled');
            return;
        }
        if (!this.powerups?.hint || this.powerups.hint.remaining <= 0) {
            this._showPowerupToast('No hints remaining!');
            return;
        }
        if (!this.currentQuestion) {
            console.log('[PowerUp:Hint] No current question');
            return;
        }
        if (this._answerSelected) {
            console.log('[PowerUp:Hint] Answer already selected');
            return;
        }
        if (this.powerups.hint.used) {
            console.log('[PowerUp:Hint] Already used this question');
            return;
        }
        
        // Mark as used
        this.powerups.hint.remaining--;
        this.powerups.hint.used = true;
        this._updatePowerupUI();
        
        // Cost: reduce time bonus by 50%
        if (this.timeRemaining > 0) {
            this.timeRemaining = Math.floor(this.timeRemaining * 0.5);
            this._updateTimerDisplay();
        }
        
        // Use question's hint if available, otherwise generate fallback (NEW - Day 5)
        const correctAnswer = this.currentQuestion.correctAnswer;
        let hintText;
        if (this.currentQuestion.hint) {
            hintText = `💡 ${this.currentQuestion.hint}`;
        } else {
            // Fallback: first letter hint
            hintText = `💡 The answer starts with "${correctAnswer[0].toUpperCase()}"...`;
        }
        
        // Show hint panel
        const hintPanel = document.getElementById('hint-panel');
        if (hintPanel) {
            hintPanel.textContent = hintText;
            hintPanel.classList.add('visible');
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                hintPanel.classList.remove('visible');
            }, 5000);
        }
        
        this.playSound('powerup');
        console.log('[PowerUp:Hint] Showed hint');
    }
    
    /**
     * Skip Power-up: Skip to next question without penalty
     */
    useSkip() {
        // Guard clauses
        if (!this._powerupsEnabled) {
            console.log('[PowerUp:Skip] Feature disabled');
            return;
        }
        if (!this.powerups?.skip || this.powerups.skip.remaining <= 0) {
            this._showPowerupToast('No skips remaining!');
            return;
        }
        if (!this.currentQuestion) {
            console.log('[PowerUp:Skip] No current question');
            return;
        }
        if (this._answerSelected) {
            console.log('[PowerUp:Skip] Answer already selected');
            return;
        }
        
        // Mark as used
        this.powerups.skip.remaining--;
        this._updatePowerupUI();
        
        // Stop timer
        this.stopTimer();
        
        // Hide hint panel if visible
        const hintPanel = document.getElementById('hint-panel');
        if (hintPanel) hintPanel.classList.remove('visible');
        
        // Move to next question (no penalty, no points)
        this.questionIndex++;
        this.showNextQuestion();
        
        this.playSound('skip');
        console.log('[PowerUp:Skip] Skipped question');
    }
    
    /**
     * Show a toast message for power-up feedback
     * @private
     */
    _showPowerupToast(message) {
        // Use hint panel as toast
        const hintPanel = document.getElementById('hint-panel');
        if (hintPanel) {
            hintPanel.textContent = message;
            hintPanel.classList.add('visible');
            setTimeout(() => hintPanel.classList.remove('visible'), 2000);
        }
    }
    
    /**
     * Reset power-up "used" flags for new question
     * @private
     */
    _resetPowerupsForQuestion() {
        if (this.powerups) {
            this.powerups.fiftyFifty.used = false;
            this.powerups.hint.used = false;
            // Note: skip.used doesn't reset - one per location
        }
    }
    
    /**
     * Update timer display (extracted for hint time penalty)
     * @private
     */
    _updateTimerDisplay() {
        const timerText = document.getElementById('timer-text');
        if (timerText) {
            timerText.textContent = this.timeRemaining;
        }
    }
    
    // ==================== EXPLANATION MODAL (NEW) ====================
    
    /**
     * Safely show explanation modal after answer
     * Falls back gracefully if modal doesn't exist
     * @param {boolean} isCorrect - Whether answer was correct
     * @param {string} selectedAnswer - The answer user selected
     * @private
     */
    _safeShowExplanation(isCorrect, selectedAnswer) {
        // Check feature flag
        if (!this._explanationEnabled) {
            return;
        }
        
        try {
            const modal = document.getElementById('explanation-modal');
            if (!modal) {
                // Modal doesn't exist - continue without it (old behavior)
                console.log('[Explanation] Modal not found, skipping');
                return;
            }
            
            const header = modal.querySelector('.explanation-header');
            const answerDiv = modal.querySelector('.explanation-answer');
            const textDiv = modal.querySelector('.explanation-text');
            
            // Update header
            if (header) {
                header.textContent = isCorrect ? '✅ Correct!' : '❌ Incorrect';
                header.classList.remove('correct', 'incorrect');
                header.classList.add(isCorrect ? 'correct' : 'incorrect');
            }
            
            // Update answer display
            if (answerDiv) {
                answerDiv.innerHTML = `The answer is: <strong>${this.currentQuestion.correctAnswer}</strong>`;
            }
            
            // Update explanation text
            if (textDiv) {
                const explanation = this._generateExplanation(isCorrect, selectedAnswer);
                textDiv.textContent = explanation;
            }
            
            // Show modal
            modal.classList.remove('hidden');
            modal.classList.add('visible');
            modal.setAttribute('aria-hidden', 'false');
            
        } catch (err) {
            console.error('[Explanation] Error showing modal:', err);
            // Fail silently - game continues normally
        }
    }
    
    /**
     * Generate explanation text for the answer
     * Uses question's explanation if available, otherwise generates fallback (NEW - Day 5)
     * @private
     */
    _generateExplanation(isCorrect, selectedAnswer) {
        const question = this.currentQuestion;
        const category = this.currentLocation?.category || 'general';
        
        // Use question's built-in explanation if available
        if (question.explanation) {
            if (isCorrect) {
                return question.explanation;
            } else {
                return `${question.explanation} The correct answer was "${question.correctAnswer}".`;
            }
        }
        
        // Fallback: Category-specific generated explanation
        const categoryFlavor = {
            science: 'Science fact',
            math: 'Math insight',
            language: 'Language tip',
            geography: 'Geography note',
            history: 'Historical fact',
            logic: 'Logic principle'
        };
        
        const prefix = categoryFlavor[category] || 'Fun fact';
        
        if (isCorrect) {
            if (this.streak > 1) {
                return `${prefix}: Great work! You're on a ${this.streak}-answer streak! 🔥`;
            }
            return `${prefix}: "${question.correctAnswer}" is correct. Keep up the great work!`;
        } else {
            return `${prefix}: The correct answer was "${question.correctAnswer}", not "${selectedAnswer || 'nothing'}". You'll get it next time!`;
        }
    }
    
    /**
     * Close explanation modal and continue quiz
     * @private
     */
    _closeExplanationModal() {
        try {
            const modal = document.getElementById('explanation-modal');
            if (modal) {
                modal.classList.remove('visible');
                modal.classList.add('hidden');
                modal.setAttribute('aria-hidden', 'true');
            }
        } catch (err) {
            console.error('[Explanation] Error closing modal:', err);
        }
    }
    
    showScreen(screenName) {
        Object.entries(this.screens).forEach(([name, element]) => {
            if (element) {
                element.classList.toggle('active', name === screenName);
            }
        });
    }
    
    // ==========================================
    // GAME FLOW
    // ==========================================
    
    startGame() {
        // Start background music
        if (this.audio && this.musicEnabled) {
            try {
                this.audio.ensureReady();
                this.audio.playMusic('quiz');
            } catch (e) {
                console.warn('Audio not available:', e);
            }
        }
        
        // Get difficulty - try adaptive first, fallback to age-based (NEW - Day 4)
        this.difficulty = this._getInitialDifficulty();
        
        // Reset game state
        this.lives = QUIZ_CONFIG.STARTING_LIVES;
        this.score = 0;
        this.streak = 0;
        this.totalStars = 0;
        this.questionEngine.reset();
        this.isPlaying = true;
        
        // Show map
        this.updateMapUI();
        this.mapRenderer.render(this.unlockedLocations);
        this.showScreen('map');
    }
    
    handleMapClick(e) {
        if (!this.isPlaying) return;
        
        const rect = this.mapCanvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.mapCanvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.mapCanvas.height / rect.height);
        
        const location = this.mapRenderer.getLocationAt(x, y);
        
        if (location && this.unlockedLocations.includes(location.id)) {
            this.selectLocation(location);
        }
    }
    
    selectLocation(location) {
        this.mapRenderer.selectLocation(location);
        this.mapRenderer.render(this.unlockedLocations);
        
        // Show location info
        const category = CATEGORIES[location.category];
        this.elements.locationName.textContent = location.name;
        this.elements.locationDesc.textContent = `Test your ${category.name} knowledge!`;
        this.elements.locationQuestions.textContent = `${this.questionsPerLocation} questions`;
        this.elements.locationCategory.textContent = `${category.icon} ${category.name}`;
        this.elements.locationInfo?.classList.remove('hidden');
        
        this.currentLocation = location;
    }
    
    enterLocation() {
        if (!this.currentLocation) return;
        
        this.playSound('start');
        this.questionIndex = 0;
        this.correctInLocation = 0;
        
        // Initialize power-ups for this location (NEW)
        this._initPowerupsForLocation();
        
        this.showNextQuestion();
        this.showScreen('quiz');
    }
    
    showNextQuestion() {
        if (this.questionIndex >= this.questionsPerLocation) {
            this.completeLocation();
            return;
        }
        
        // Reset answer state and power-up flags for new question (NEW)
        this._answerSelected = false;
        this._resetPowerupsForQuestion();
        this._questionStartTime = Date.now();
        
        // Hide hint panel if visible (NEW)
        const hintPanel = document.getElementById('hint-panel');
        if (hintPanel) hintPanel.classList.remove('visible');
        
        // Get question
        this.currentQuestion = this.questionEngine.getQuestion(
            this.currentLocation.category,
            this.difficulty
        );
        
        // Update UI
        const category = CATEGORIES[this.currentLocation.category];
        this.elements.categoryIcon.textContent = category.icon;
        this.elements.categoryName.textContent = category.name;
        this.elements.questionText.textContent = this.currentQuestion.question;
        this.elements.questionNumber.textContent = `${this.questionIndex + 1}/${this.questionsPerLocation}`;
        
        // Update progress dots
        this.renderProgressDots();
        
        // Update live score
        this.updateLiveScore();
        
        // Update streak indicator
        this.updateStreakIndicator();
        
        // Render answers (Quizizz style)
        this.renderAnswers();
        
        // Start timer if applicable
        const settings = DIFFICULTY_PRESETS[this.difficulty];
        const timerSection = document.getElementById('quiz-timer-section');
        if (settings.timeLimit) {
            this.startTimer(settings.timeLimit);
            // Ensure timer is visible
            if (timerSection) {
                timerSection.style.opacity = '1';
                timerSection.style.pointerEvents = 'auto';
            }
        } else {
            // Fully hide timer ring if no time limit (Explorer difficulty)
            if (timerSection) {
                timerSection.style.opacity = '0';
                timerSection.style.pointerEvents = 'none';
            }
        }
        
        // Hide feedback
        this.elements.feedbackOverlay?.classList.add('hidden');
    }
    
    renderProgressDots() {
        const dotsContainer = document.getElementById('progress-dots');
        if (!dotsContainer) return;
        
        dotsContainer.innerHTML = '';
        for (let i = 0; i < this.questionsPerLocation; i++) {
            const dot = document.createElement('div');
            dot.className = 'progress-dot';
            if (i === this.questionIndex) {
                dot.classList.add('current');
            } else if (i < this.questionIndex) {
                // Mark previous questions (simplified - could track correct/wrong)
                dot.classList.add('correct');
            }
            dotsContainer.appendChild(dot);
        }
    }
    
    updateLiveScore() {
        const scoreEl = document.getElementById('quiz-live-score');
        if (scoreEl) {
            scoreEl.textContent = this.score;
        }
    }
    
    updateStreakIndicator() {
        const streakEl = document.getElementById('streak-indicator');
        const countEl = document.getElementById('streak-count');
        
        if (streakEl && countEl) {
            if (this.streak >= 2) {
                streakEl.classList.remove('hidden');
                countEl.textContent = this.streak;
            } else {
                streakEl.classList.add('hidden');
            }
        }
    }
    
    renderAnswers() {
        const grid = this.elements.answersGrid;
        if (!grid) return;
        
        grid.innerHTML = '';
        
        // Quizizz-style answers with shapes
        this.currentQuestion.choices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.className = 'answer-btn';
            
            // Add shape element
            const shape = document.createElement('div');
            shape.className = 'answer-shape';
            
            // Add text
            const text = document.createElement('span');
            text.className = 'answer-text';
            text.textContent = choice;
            
            btn.appendChild(shape);
            btn.appendChild(text);
            btn.addEventListener('click', () => this.selectAnswer(choice));
            grid.appendChild(btn);
        });
    }
    
    selectAnswer(answer) {
        // Mark answer as selected to prevent power-up usage (NEW)
        this._answerSelected = true;
        
        // Stop timer
        this.stopTimer();
        
        // Hide hint panel if visible (NEW)
        const hintPanel = document.getElementById('hint-panel');
        if (hintPanel) hintPanel.classList.remove('visible');
        
        const isCorrect = answer === this.currentQuestion.correctAnswer;
        
        // Record answer for adaptive difficulty (NEW - Day 4)
        this._recordAnswerForAdaptive(isCorrect);
        
        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
        
        // Update live score display
        this.updateLiveScore();
        
        // Show feedback
        this.showFeedback(isCorrect, answer);
    }
    
    handleCorrectAnswer() {
        this.playSound('correct');
        
        // Calculate points
        let points = QUIZ_CONFIG.CORRECT_POINTS;
        points += this.streak * QUIZ_CONFIG.STREAK_BONUS;
        
        // Time bonus
        if (this.timeRemaining > 0) {
            points += this.timeRemaining * QUIZ_CONFIG.TIME_BONUS_PER_SECOND;
        }
        
        this.lastPointsEarned = points;
        this.score += points;
        this.streak++;
        this.correctInLocation++;
        this.totalStars++;
    }
    
    handleWrongAnswer() {
        this.playSound('wrong');
        this.streak = 0;
        this.lastPointsEarned = 0;
        this.lives--;
        
        if (this.lives <= 0) {
            setTimeout(() => this.gameOver(), 1500);
        }
    }
    
    showFeedback(isCorrect, selectedAnswer) {
        const feedbackBox = document.getElementById('feedback-box');
        const pointsEl = document.getElementById('feedback-points');
        
        // Update feedback box style
        if (feedbackBox) {
            feedbackBox.classList.remove('correct', 'wrong');
            feedbackBox.classList.add(isCorrect ? 'correct' : 'wrong');
        }
        
        this.elements.feedbackIcon.textContent = isCorrect ? '🎉' : '😢';
        this.elements.feedbackText.textContent = isCorrect ? 'Awesome!' : 'Oops!';
        
        if (!isCorrect) {
            this.elements.feedbackExplanation.textContent = `The correct answer was: ${this.currentQuestion.correctAnswer}`;
            if (pointsEl) pointsEl.classList.add('hidden');
        } else {
            this.elements.feedbackExplanation.textContent = this.streak > 1 ? 
                `🔥 ${this.streak} in a row!` : 'Great job!';
            if (pointsEl) {
                pointsEl.textContent = `+${this.lastPointsEarned || QUIZ_CONFIG.CORRECT_POINTS}`;
                pointsEl.classList.remove('hidden');
            }
        }
        
        // Highlight answers in grid
        const buttons = this.elements.answersGrid?.querySelectorAll('.answer-btn');
        buttons?.forEach(btn => {
            const btnText = btn.querySelector('.answer-text')?.textContent || btn.textContent;
            if (btnText === this.currentQuestion.correctAnswer) {
                btn.classList.add('correct');
            } else if (btnText === selectedAnswer && !isCorrect) {
                btn.classList.add('wrong');
            }
            btn.disabled = true;
        });
        
        this.elements.feedbackOverlay?.classList.remove('hidden');
        
        // Show explanation modal (NEW - optional enhancement)
        this._safeShowExplanation(isCorrect, selectedAnswer);
        
        // Update lives display
        if (this.elements.livesDisplay) {
            this.elements.livesDisplay.textContent = this.lives;
        }
    }
    
    continueQuiz() {
        if (this.lives <= 0) return;
        
        // Close explanation modal if open (NEW)
        this._closeExplanationModal();
        
        // Hide existing feedback overlay
        this.elements.feedbackOverlay?.classList.add('hidden');
        
        this.questionIndex++;
        this.showNextQuestion();
    }
    
    completeLocation() {
        // Check if perfect
        if (this.correctInLocation === this.questionsPerLocation) {
            this.score += QUIZ_CONFIG.PERFECT_LOCATION_BONUS;
            this.playSound('victory');
        } else {
            this.playSound('levelup');
        }
        
        // Unlock next location
        this.unlockNextLocation();
        
        // Update map and return
        this.updateMapUI();
        this.mapRenderer.render(this.unlockedLocations);
        this.mapRenderer.selectLocation(null);
        this.elements.locationInfo?.classList.add('hidden');
        this.currentLocation = null;
        
        this.showScreen('map');
    }
    
    unlockNextLocation() {
        const allIds = MAP_LOCATIONS.map(l => l.id);
        const nextLocked = allIds.find(id => !this.unlockedLocations.includes(id));
        
        if (nextLocked) {
            this.unlockedLocations.push(nextLocked);
        } else {
            // All locations complete - show victory!
            this.showVictory();
        }
    }
    
    showVictory() {
        // Stop music
        if (this.audio) {
            try { this.audio.stopMusic(); } catch (e) {}
        }
        
        this.playSound('victory');
        this.isPlaying = false;
        
        // Update result screen
        this.elements.finalScore.textContent = this.score;
        this.elements.finalStars.textContent = this.totalStars;
        this.elements.locationsComplete.textContent = this.unlockedLocations.length;
        
        // Check high score
        const highScore = this.getHighScore();
        if (this.score > highScore) {
            this.saveHighScore(this.score);
            this.elements.newRecord?.classList.remove('hidden');
        } else {
            this.elements.newRecord?.classList.add('hidden');
        }
        
        this.saveProgress();
        this.showScreen('result');
    }
    
    gameOver() {
        // Stop music
        if (this.audio) {
            try { this.audio.stopMusic(); } catch (e) {}
        }
        
        this.playSound('gameover');
        this.isPlaying = false;
        
        // Update gameover screen
        this.elements.gameoverScore.textContent = this.score;
        this.elements.gameoverStars.textContent = this.totalStars;
        
        this.showScreen('gameover');
    }
    
    // ==========================================
    // TIMER (Quizizz Ring Style)
    // ==========================================
    
    startTimer(seconds) {
        this.timeRemaining = seconds;
        this.maxTime = seconds;
        
        // Show timer section
        const timerSection = document.getElementById('quiz-timer-section');
        if (timerSection) timerSection.style.opacity = '1';
        
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.timeRemaining <= 0) {
                this.stopTimer();
                this.selectAnswer(null); // Time out = wrong
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateTimerDisplay() {
        const maxTime = this.maxTime || 30;
        const percent = (this.timeRemaining / maxTime) * 100;
        
        // Update text
        const timerText = document.getElementById('timer-text');
        if (timerText) {
            timerText.textContent = this.timeRemaining;
        }
        
        // Update ring (stroke-dashoffset: 100 = empty, 0 = full)
        const timerRingFill = document.getElementById('timer-ring-fill');
        if (timerRingFill) {
            const dashOffset = 100 - percent;
            timerRingFill.style.strokeDashoffset = dashOffset;
            
            // Color based on time remaining
            if (this.timeRemaining <= 5) {
                timerRingFill.style.stroke = '#ff4757';
                timerRingFill.classList.add('warning');
            } else if (this.timeRemaining <= 10) {
                timerRingFill.style.stroke = '#ffa502';
                timerRingFill.classList.remove('warning');
            } else {
                timerRingFill.style.stroke = '#00ff88';
                timerRingFill.classList.remove('warning');
            }
        }
    }
    
    // ==========================================
    // UI UPDATES
    // ==========================================
    
    updateStartScreen() {
        const highScore = this.getHighScore();
        if (this.elements.highScoreValue) {
            this.elements.highScoreValue.textContent = highScore;
        }
    }
    
    updateMapUI() {
        if (this.elements.totalStars) {
            this.elements.totalStars.textContent = this.totalStars;
        }
        if (this.elements.livesDisplay) {
            this.elements.livesDisplay.textContent = this.lives;
        }
        if (this.elements.mapScore) {
            this.elements.mapScore.textContent = this.score;
        }
    }
    
    // ==========================================
    // STORAGE
    // ==========================================
    
    getHighScore() {
        try {
            return parseInt(localStorage.getItem(QUIZ_CONFIG.LEADERBOARD_KEY) || '0');
        } catch (e) {
            return 0;
        }
    }
    
    saveHighScore(score) {
        try {
            localStorage.setItem(QUIZ_CONFIG.LEADERBOARD_KEY, score.toString());
        } catch (e) {
            console.error('Failed to save high score:', e);
        }
    }
    
    loadProgress() {
        try {
            const data = localStorage.getItem(QUIZ_CONFIG.PROGRESS_KEY);
            if (data) {
                const progress = JSON.parse(data);
                this.unlockedLocations = progress.unlockedLocations || ['forest', 'mountain'];
            }
        } catch (e) {
            console.error('Failed to load progress:', e);
        }
    }
    
    saveProgress() {
        try {
            localStorage.setItem(QUIZ_CONFIG.PROGRESS_KEY, JSON.stringify({
                unlockedLocations: this.unlockedLocations
            }));
        } catch (e) {
            console.error('Failed to save progress:', e);
        }
    }
    
    // ==========================================
    // AUDIO
    // ==========================================
    
    playSound(type) {
        if (this.audio && this.sfxEnabled) {
            try {
                this.audio.playSFX(type);
            } catch (e) {
                console.warn('Sound effect failed:', e);
            }
        }
    }
    
    // ==========================================
    // NAVIGATION
    // ==========================================
    
    goHome() {
        // Stop music
        if (this.audio) {
            try { this.audio.stopMusic(); } catch (e) {}
        }
        
        this.isPlaying = false;
        this.updateStartScreen();
        this.showScreen('start');
    }
}

// ==================== Initialize Game ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Quiz Quest] DOM loaded, initializing game...');
    try {
        window.game = new QuizQuestGame();
        console.log('[Quiz Quest] Game initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Quiz Quest game:', error);
    }
});
