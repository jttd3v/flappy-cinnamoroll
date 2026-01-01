/**
 * Pattern Rainbow - Main Game Logic
 * A colorful pattern recognition game for ages 6-35
 * 
 * @version 1.0.0
 */

// ==================== Configuration ====================
const DIFFICULTY_PRESETS = {
    1: { // Age 6-8
        name: 'Rainbow Beginner',
        patternTypes: ['simpleAB'],
        sequenceLength: 5,
        choiceCount: 2,
        hints: Infinity,
        showRule: true
    },
    2: { // Age 9-10
        name: 'Rainbow Explorer',
        patternTypes: ['simpleAB', 'simpleABC'],
        sequenceLength: 5,
        choiceCount: 3,
        hints: 5,
        showRule: true
    },
    3: { // Age 11-12
        name: 'Rainbow Adventurer',
        patternTypes: ['simpleABC', 'doublePattern', 'growing'],
        sequenceLength: 6,
        choiceCount: 3,
        hints: 3,
        showRule: false
    },
    4: { // Age 13-15
        name: 'Rainbow Champion',
        patternTypes: ['growing', 'skipCount', 'rotation'],
        sequenceLength: 6,
        choiceCount: 4,
        hints: 2,
        showRule: false
    },
    5: { // Age 16-18
        name: 'Rainbow Master',
        patternTypes: ['rotation', 'mathDouble', 'mathTriple'],
        sequenceLength: 7,
        choiceCount: 4,
        hints: 1,
        showRule: false
    },
    6: { // Age 19-25
        name: 'Rainbow Expert',
        patternTypes: ['mathDouble', 'mathTriple', 'mathSquare'],
        sequenceLength: 7,
        choiceCount: 4,
        hints: 0,
        showRule: false
    },
    7: { // Age 26-35
        name: 'Rainbow Legend',
        patternTypes: ['mathSquare', 'fibonacci', 'multiAttribute'],
        sequenceLength: 8,
        choiceCount: 5,
        hints: 0,
        showRule: false
    }
};

const PATTERN_ELEMENTS = {
    colors: ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚪', '⚫'],
    shapes: ['⭐', '🌙', '☁️', '💖', '🌸', '✨', '🌈', '☀️'],
    animals: ['🐰', '🐱', '🐶', '🐼', '🦊', '🐸', '🦋', '🐞'],
    arrows: ['↑', '→', '↓', '←'],
    sizes: ['S', 'M', 'L', 'XL']
};

const GAME_CONFIG = {
    ROUNDS_PER_LEVEL: 5,
    LEVELS_TO_WIN: 10,
    BASE_POINTS: 100,
    NO_HINT_BONUS: 20,
    STREAK_BONUS: 10,
    PERFECT_LEVEL_BONUS: 200,
    ELEMENT_DELAY: 150,
    FEEDBACK_DELAY: 1500,
    STORAGE_KEY: 'patternRainbowHighScore'
};

// ==================== Pattern Generator ====================
class PatternGenerator {
    constructor(difficulty) {
        this.difficulty = difficulty;
        this.preset = DIFFICULTY_PRESETS[difficulty];
    }

    generate() {
        const typeIndex = Math.floor(Math.random() * this.preset.patternTypes.length);
        const patternType = this.preset.patternTypes[typeIndex];
        
        switch (patternType) {
            case 'simpleAB': return this.simpleAB();
            case 'simpleABC': return this.simpleABC();
            case 'doublePattern': return this.doublePattern();
            case 'growing': return this.growingSequence();
            case 'skipCount': return this.skipCountSequence();
            case 'rotation': return this.rotationPattern();
            case 'mathDouble': return this.mathDouble();
            case 'mathTriple': return this.mathTriple();
            case 'mathSquare': return this.mathSquare();
            case 'fibonacci': return this.fibonacci();
            case 'multiAttribute': return this.multiAttribute();
            default: return this.simpleAB();
        }
    }

    // AB Pattern: 🔴🔵🔴🔵?
    simpleAB() {
        const [a, b] = this.pickRandom(PATTERN_ELEMENTS.colors, 2);
        const length = this.preset.sequenceLength;
        const pattern = [];
        
        for (let i = 0; i < length; i++) {
            pattern.push(i % 2 === 0 ? a : b);
        }
        
        const answer = pattern[length - 1];
        
        return {
            type: 'repeat',
            rule: 'AB Pattern - Two elements alternate',
            elements: pattern.slice(0, -1),
            answer,
            choices: this.generateChoices(answer, [a, b])
        };
    }

    // ABC Pattern: ⭐🌙☁️⭐🌙?
    simpleABC() {
        const [a, b, c] = this.pickRandom(PATTERN_ELEMENTS.shapes, 3);
        const length = this.preset.sequenceLength;
        const sequence = [a, b, c];
        const pattern = [];
        
        for (let i = 0; i < length; i++) {
            pattern.push(sequence[i % 3]);
        }
        
        const answer = pattern[length - 1];
        
        return {
            type: 'repeat',
            rule: 'ABC Pattern - Three elements cycle',
            elements: pattern.slice(0, -1),
            answer,
            choices: this.shuffleArray([a, b, c])
        };
    }

    // Double Pattern: 🔴🔴🔵🔵🔴?
    doublePattern() {
        const [a, b] = this.pickRandom(PATTERN_ELEMENTS.colors, 2);
        const pattern = [a, a, b, b, a, a, b];
        const length = Math.min(this.preset.sequenceLength, pattern.length);
        
        const answer = pattern[length - 1];
        
        return {
            type: 'repeat',
            rule: 'AABB Pattern - Elements repeat twice',
            elements: pattern.slice(0, length - 1),
            answer,
            choices: this.generateChoices(answer, [a, b])
        };
    }

    // Growing: 1, 2, 3, 4, ?
    growingSequence() {
        const start = this.randomInt(1, 5);
        const step = this.randomInt(1, 2);
        const length = this.preset.sequenceLength;
        const pattern = [];
        
        for (let i = 0; i < length; i++) {
            pattern.push(start + (step * i));
        }
        
        const answer = String(pattern[length - 1]);
        
        return {
            type: 'growing',
            rule: `Growing Numbers - Add ${step} each time`,
            elements: pattern.slice(0, -1).map(String),
            answer,
            choices: this.generateNumberChoices(parseInt(answer), step)
        };
    }

    // Skip counting: 2, 4, 6, 8, ?
    skipCountSequence() {
        const step = this.randomPick([2, 3, 5]);
        const start = step;
        const length = this.preset.sequenceLength;
        const pattern = [];
        
        for (let i = 0; i < length; i++) {
            pattern.push(start + (step * i));
        }
        
        const answer = String(pattern[length - 1]);
        
        return {
            type: 'skipCount',
            rule: `Skip Counting - Count by ${step}s`,
            elements: pattern.slice(0, -1).map(String),
            answer,
            choices: this.generateNumberChoices(parseInt(answer), step)
        };
    }

    // Rotation: ↑ → ↓ ← ?
    rotationPattern() {
        const arrows = PATTERN_ELEMENTS.arrows;
        const startIndex = this.randomInt(0, 3);
        const length = this.preset.sequenceLength;
        const pattern = [];
        
        for (let i = 0; i < length; i++) {
            pattern.push(arrows[(startIndex + i) % 4]);
        }
        
        return {
            type: 'rotation',
            rule: 'Rotation - Direction rotates clockwise',
            elements: pattern.slice(0, -1),
            answer: pattern[length - 1],
            choices: this.shuffleArray([...arrows])
        };
    }

    // Math Double: 2, 4, 8, 16, ?
    mathDouble() {
        const start = this.randomInt(2, 4);
        const length = this.preset.sequenceLength;
        const pattern = [start];
        
        for (let i = 1; i < length; i++) {
            pattern.push(pattern[i - 1] * 2);
        }
        
        const answer = String(pattern[length - 1]);
        
        return {
            type: 'math',
            rule: 'Doubling - Each number doubles',
            elements: pattern.slice(0, -1).map(String),
            answer,
            choices: this.generateMathChoices(parseInt(answer))
        };
    }

    // Math Triple: 1, 3, 9, 27, ?
    mathTriple() {
        const start = this.randomInt(1, 2);
        const length = Math.min(this.preset.sequenceLength, 5);
        const pattern = [start];
        
        for (let i = 1; i < length; i++) {
            pattern.push(pattern[i - 1] * 3);
        }
        
        const answer = String(pattern[length - 1]);
        
        return {
            type: 'math',
            rule: 'Tripling - Each number triples',
            elements: pattern.slice(0, -1).map(String),
            answer,
            choices: this.generateMathChoices(parseInt(answer))
        };
    }

    // Math Square: 1, 4, 9, 16, ?
    mathSquare() {
        const length = this.preset.sequenceLength;
        const pattern = [];
        
        for (let i = 1; i <= length; i++) {
            pattern.push(i * i);
        }
        
        const answer = String(pattern[length - 1]);
        
        return {
            type: 'math',
            rule: 'Perfect Squares - 1², 2², 3², ...',
            elements: pattern.slice(0, -1).map(String),
            answer,
            choices: this.generateMathChoices(parseInt(answer))
        };
    }

    // Fibonacci: 1, 1, 2, 3, 5, ?
    fibonacci() {
        const length = this.preset.sequenceLength;
        const pattern = [1, 1];
        
        for (let i = 2; i < length; i++) {
            pattern.push(pattern[i - 1] + pattern[i - 2]);
        }
        
        const answer = String(pattern[length - 1]);
        
        return {
            type: 'fibonacci',
            rule: 'Fibonacci - Sum of previous two',
            elements: pattern.slice(0, -1).map(String),
            answer,
            choices: this.generateFibonacciChoices(parseInt(answer), pattern)
        };
    }

    // Multi-attribute: combines colors and shapes
    multiAttribute() {
        const colors = this.pickRandom(PATTERN_ELEMENTS.colors, 3);
        const shapes = this.pickRandom(PATTERN_ELEMENTS.shapes, 3);
        const length = Math.min(this.preset.sequenceLength, 6);
        const pattern = [];
        
        for (let i = 0; i < length; i++) {
            pattern.push(colors[i % 3] + shapes[i % 3]);
        }
        
        const answer = pattern[length - 1];
        
        // Generate wrong choices with mixed attributes
        const wrongChoices = [
            colors[(length) % 3] + shapes[(length - 1) % 3],
            colors[(length - 1) % 3] + shapes[(length) % 3],
        ];
        
        return {
            type: 'multiAttribute',
            rule: 'Multi-Attribute - Color and shape both change',
            elements: pattern.slice(0, -1),
            answer,
            choices: this.shuffleArray([answer, ...wrongChoices])
        };
    }

    // Helper methods
    pickRandom(array, count) {
        const shuffled = this.shuffleArray([...array]);
        return shuffled.slice(0, count);
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    randomPick(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    generateChoices(answer, pool) {
        const choices = new Set([answer]);
        const available = [...pool];
        
        while (choices.size < this.preset.choiceCount && available.length > 0) {
            const idx = Math.floor(Math.random() * available.length);
            choices.add(available.splice(idx, 1)[0]);
        }
        
        // Add from full color pool if needed
        while (choices.size < this.preset.choiceCount) {
            const random = this.randomPick(PATTERN_ELEMENTS.colors);
            if (!choices.has(random)) choices.add(random);
        }
        
        return this.shuffleArray(Array.from(choices));
    }

    generateNumberChoices(answer, step) {
        const choices = new Set([String(answer)]);
        
        // Add plausible wrong answers
        const wrongOptions = [
            answer + step,
            answer - step,
            answer + 1,
            answer - 1,
            answer + step * 2
        ].filter(v => v > 0 && v !== answer);
        
        for (const wrong of wrongOptions) {
            if (choices.size < this.preset.choiceCount) {
                choices.add(String(wrong));
            }
        }
        
        return this.shuffleArray(Array.from(choices));
    }

    generateMathChoices(answer) {
        const choices = new Set([String(answer)]);
        
        const wrongOptions = [
            Math.round(answer * 1.5),
            Math.round(answer * 0.75),
            answer * 2,
            Math.round(answer / 2),
            answer + Math.round(answer / 4)
        ].filter(v => v > 0 && v !== answer);
        
        for (const wrong of wrongOptions) {
            if (choices.size < this.preset.choiceCount) {
                choices.add(String(wrong));
            }
        }
        
        return this.shuffleArray(Array.from(choices));
    }

    generateFibonacciChoices(answer, sequence) {
        const choices = new Set([String(answer)]);
        const len = sequence.length;
        
        // Plausible wrong answers for fibonacci
        const wrongOptions = [
            sequence[len - 2] + sequence[len - 3] - 1,
            sequence[len - 2] * 2,
            answer + 1,
            answer - 1
        ].filter(v => v > 0 && v !== answer);
        
        for (const wrong of wrongOptions) {
            if (choices.size < this.preset.choiceCount) {
                choices.add(String(wrong));
            }
        }
        
        return this.shuffleArray(Array.from(choices));
    }
}

// ==================== Main Game Class ====================
class PatternRainbowGame {
    constructor() {
        // Audio manager reference
        this.audio = typeof gameAudio !== 'undefined' ? gameAudio : null;
        this.musicEnabled = true;
        this.sfxEnabled = true;
        
        // DOM Elements
        this.screens = {
            start: document.getElementById('start-screen'),
            game: document.getElementById('game-screen'),
            result: document.getElementById('result-screen')
        };
        
        this.elements = {
            ageSelect: document.getElementById('age-select'),
            startBtn: document.getElementById('start-btn'),
            highScoreValue: document.getElementById('high-score-value'),
            levelDisplay: document.getElementById('level-display'),
            roundProgress: document.getElementById('round-progress'),
            scoreDisplay: document.getElementById('score-display'),
            streakDisplay: document.getElementById('streak-display'),
            patternHint: document.getElementById('pattern-hint'),
            patternArea: document.getElementById('pattern-area'),
            choicesContainer: document.getElementById('choices-container'),
            hintBtn: document.getElementById('hint-btn'),
            hintsRemaining: document.getElementById('hints-remaining'),
            skipBtn: document.getElementById('skip-btn'),
            feedbackOverlay: document.getElementById('feedback-overlay'),
            feedbackIcon: document.getElementById('feedback-icon'),
            feedbackText: document.getElementById('feedback-text'),
            resultTitle: document.getElementById('result-title'),
            starRating: document.getElementById('star-rating'),
            finalScore: document.getElementById('final-score'),
            correctCount: document.getElementById('correct-count'),
            accuracyDisplay: document.getElementById('accuracy-display'),
            bestStreak: document.getElementById('best-streak'),
            newHighScore: document.getElementById('new-high-score'),
            playAgainBtn: document.getElementById('play-again-btn'),
            homeBtn: document.getElementById('home-btn')
        };
        
        // Game state
        this.state = {
            difficulty: 5,
            level: 1,
            round: 1,
            score: 0,
            streak: 0,
            bestStreak: 0,
            correctAnswers: 0,
            totalAnswers: 0,
            hints: 1,
            usedHintThisRound: false,
            currentPattern: null,
            highScore: 0,
            isProcessing: false
        };
        
        this.patternGenerator = null;
        
        this.init();
    }

    init() {
        this.loadHighScore();
        this.bindEvents();
        this.showScreen('start');
    }

    bindEvents() {
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.hintBtn.addEventListener('click', () => this.useHint());
        this.elements.skipBtn.addEventListener('click', () => this.skipRound());
        this.elements.playAgainBtn.addEventListener('click', () => this.startGame());
        this.elements.homeBtn.addEventListener('click', () => this.goHome());
        
        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    handleKeyboard(e) {
        if (this.screens.game.classList.contains('active') && !this.state.isProcessing) {
            const key = e.key;
            if (key >= '1' && key <= '5') {
                const index = parseInt(key) - 1;
                const buttons = this.elements.choicesContainer.querySelectorAll('.choice-btn');
                if (buttons[index]) {
                    buttons[index].click();
                }
            } else if (key.toLowerCase() === 'h') {
                this.useHint();
            } else if (key.toLowerCase() === 's') {
                this.skipRound();
            }
        }
    }

    // ==================== Screen Management ====================
    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        this.screens[screenName].classList.add('active');
    }

    // ==================== Game Flow ====================
    startGame() {
        // Initialize and start background music
        if (this.audio && this.musicEnabled) {
            try {
                this.audio.ensureReady();
                this.audio.playMusic('pattern');
            } catch (e) {
                // Silently ignore audio errors
            }
        }
        
        // Determine difficulty from PlayerManager age
        let age = 16; // Default
        if (typeof PlayerManager !== 'undefined' && PlayerManager.hasActivePlayer()) {
            age = PlayerManager.getPlayerAge() || 16;
        }
        this.state.difficulty = this.getDifficultyFromAge(age);
        
        // Reset state
        this.state.level = 1;
        this.state.round = 1;
        this.state.score = 0;
        this.state.streak = 0;
        this.state.bestStreak = 0;
        this.state.correctAnswers = 0;
        this.state.totalAnswers = 0;
        this.state.hints = DIFFICULTY_PRESETS[this.state.difficulty].hints;
        this.state.usedHintThisRound = false;
        this.state.isProcessing = false;
        
        this.patternGenerator = new PatternGenerator(this.state.difficulty);
        
        this.updateUI();
        this.showScreen('game');
        this.startRound();
    }

    getDifficultyFromAge(age) {
        if (age <= 8) return 1;
        if (age <= 10) return 2;
        if (age <= 12) return 3;
        if (age <= 15) return 4;
        if (age <= 18) return 5;
        if (age <= 25) return 6;
        return 7;
    }

    startRound() {
        this.state.usedHintThisRound = false;
        this.state.currentPattern = this.patternGenerator.generate();
        
        this.updateProgressDots();
        this.renderPattern();
        this.renderChoices();
        this.updateHintButton();
        
        // Show rule hint for easier difficulties
        if (DIFFICULTY_PRESETS[this.state.difficulty].showRule) {
            this.elements.patternHint.textContent = this.state.currentPattern.rule;
        } else {
            this.elements.patternHint.textContent = '';
        }
    }

    // ==================== Pattern Rendering ====================
    renderPattern() {
        const pattern = this.state.currentPattern;
        this.elements.patternArea.innerHTML = '';
        
        pattern.elements.forEach((element, index) => {
            const el = document.createElement('div');
            el.className = 'pattern-element';
            el.textContent = element;
            el.style.transitionDelay = `${index * GAME_CONFIG.ELEMENT_DELAY}ms`;
            this.elements.patternArea.appendChild(el);
            
            // Trigger animation
            setTimeout(() => el.classList.add('visible'), 50);
        });
        
        // Add missing slot
        const missing = document.createElement('div');
        missing.className = 'pattern-element missing';
        missing.innerHTML = '<span class="question-mark">?</span>';
        missing.id = 'missing-slot';
        missing.style.transitionDelay = `${pattern.elements.length * GAME_CONFIG.ELEMENT_DELAY}ms`;
        this.elements.patternArea.appendChild(missing);
        
        setTimeout(() => missing.classList.add('visible'), 50);
    }

    renderChoices() {
        const pattern = this.state.currentPattern;
        this.elements.choicesContainer.innerHTML = '';
        
        pattern.choices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = choice;
            btn.dataset.index = index;
            btn.dataset.value = choice;
            
            btn.addEventListener('click', () => this.selectChoice(choice, btn));
            
            this.elements.choicesContainer.appendChild(btn);
        });
    }

    // ==================== Choice Handling ====================
    selectChoice(choice, button) {
        if (this.state.isProcessing) return;
        this.state.isProcessing = true;
        
        const isCorrect = choice === this.state.currentPattern.answer;
        this.state.totalAnswers++;
        
        // Visual feedback on button
        const allButtons = this.elements.choicesContainer.querySelectorAll('.choice-btn');
        allButtons.forEach(btn => btn.disabled = true);
        
        if (isCorrect) {
            button.classList.add('correct');
            this.handleCorrectAnswer();
        } else {
            button.classList.add('wrong');
            this.handleWrongAnswer();
        }
    }

    handleCorrectAnswer() {
        // Play correct sound
        this.playSound('correct');
        
        this.state.correctAnswers++;
        this.state.streak++;
        if (this.state.streak > this.state.bestStreak) {
            this.state.bestStreak = this.state.streak;
        }
        
        // Calculate points
        let points = GAME_CONFIG.BASE_POINTS;
        if (!this.state.usedHintThisRound) {
            points += GAME_CONFIG.NO_HINT_BONUS;
        }
        points += this.state.streak * GAME_CONFIG.STREAK_BONUS;
        
        this.state.score += points;
        
        // Update missing slot
        const missingSlot = document.getElementById('missing-slot');
        missingSlot.classList.remove('missing');
        missingSlot.classList.add('correct');
        missingSlot.textContent = this.state.currentPattern.answer;
        
        this.updateUI();
        this.showFeedback(true, `+${points} points!`);
        
        setTimeout(() => {
            this.hideFeedback();
            this.nextRound();
        }, GAME_CONFIG.FEEDBACK_DELAY);
    }

    handleWrongAnswer() {
        // Play wrong sound
        this.playSound('wrong');
        
        this.state.streak = 0;
        
        // Show correct answer
        const missingSlot = document.getElementById('missing-slot');
        missingSlot.classList.add('wrong');
        
        // Highlight correct choice
        const allButtons = this.elements.choicesContainer.querySelectorAll('.choice-btn');
        allButtons.forEach(btn => {
            if (btn.dataset.value === this.state.currentPattern.answer) {
                btn.classList.add('correct');
            }
        });
        
        setTimeout(() => {
            missingSlot.classList.remove('missing', 'wrong');
            missingSlot.classList.add('correct');
            missingSlot.textContent = this.state.currentPattern.answer;
        }, 500);
        
        this.updateUI();
        this.showFeedback(false, 'Try again next time!');
        
        setTimeout(() => {
            this.hideFeedback();
            this.nextRound();
        }, GAME_CONFIG.FEEDBACK_DELAY + 500);
    }

    nextRound() {
        this.state.round++;
        this.state.isProcessing = false;
        
        if (this.state.round > GAME_CONFIG.ROUNDS_PER_LEVEL) {
            this.nextLevel();
        } else {
            this.startRound();
        }
    }

    nextLevel() {
        this.state.level++;
        this.state.round = 1;
        
        // Check for perfect level bonus
        if (this.state.correctAnswers === this.state.totalAnswers) {
            this.state.score += GAME_CONFIG.PERFECT_LEVEL_BONUS;
        }
        
        if (this.state.level > GAME_CONFIG.LEVELS_TO_WIN) {
            this.endGame();
        } else {
            // Possibly increase difficulty
            const newDifficulty = Math.min(7, this.state.difficulty + 1);
            if (this.state.level % 3 === 0 && newDifficulty > this.state.difficulty) {
                this.state.difficulty = newDifficulty;
                this.patternGenerator = new PatternGenerator(this.state.difficulty);
            }
            
            this.showFeedback(true, `Level ${this.state.level}!`, '🎉');
            
            setTimeout(() => {
                this.hideFeedback();
                this.updateUI();
                this.startRound();
            }, 1500);
        }
    }

    // ==================== Hint System ====================
    useHint() {
        if (this.state.hints <= 0 || this.state.isProcessing) return;
        
        this.state.hints--;
        this.state.usedHintThisRound = true;
        this.updateHintButton();
        
        const pattern = this.state.currentPattern;
        const answer = pattern.answer;
        
        // Eliminate one wrong choice
        const buttons = this.elements.choicesContainer.querySelectorAll('.choice-btn:not(.eliminated)');
        for (const btn of buttons) {
            if (btn.dataset.value !== answer && !btn.classList.contains('eliminated')) {
                btn.classList.add('eliminated');
                btn.disabled = true;
                break;
            }
        }
        
        // Highlight pattern for context
        const patternElements = this.elements.patternArea.querySelectorAll('.pattern-element:not(.missing)');
        patternElements.forEach(el => {
            el.classList.add('hint-highlight');
            setTimeout(() => el.classList.remove('hint-highlight'), 1500);
        });
    }

    updateHintButton() {
        const remaining = this.state.hints === Infinity ? '∞' : this.state.hints;
        this.elements.hintsRemaining.textContent = `(${remaining})`;
        this.elements.hintBtn.disabled = this.state.hints <= 0;
    }

    skipRound() {
        if (this.state.isProcessing) return;
        
        this.state.streak = 0;
        this.state.totalAnswers++;
        this.updateUI();
        this.nextRound();
    }

    // ==================== UI Updates ====================
    updateUI() {
        this.elements.levelDisplay.textContent = `Level ${this.state.level}`;
        this.elements.scoreDisplay.textContent = `Score: ${this.state.score}`;
        this.elements.streakDisplay.textContent = `🔥 ${this.state.streak}`;
    }

    updateProgressDots() {
        const dots = this.elements.roundProgress.querySelectorAll('.progress-dot');
        dots.forEach((dot, index) => {
            dot.classList.remove('filled', 'current');
            if (index < this.state.round - 1) {
                dot.classList.add('filled');
            } else if (index === this.state.round - 1) {
                dot.classList.add('current');
            }
        });
    }

    // ==================== Feedback ====================
    showFeedback(isPositive, text, icon = null) {
        this.elements.feedbackOverlay.classList.remove('hidden');
        this.elements.feedbackOverlay.classList.add('visible');
        
        this.elements.feedbackIcon.textContent = icon || (isPositive ? '✨' : '💫');
        this.elements.feedbackText.textContent = text;
        this.elements.feedbackText.style.color = isPositive ? '#4CAF50' : '#F44336';
    }

    hideFeedback() {
        this.elements.feedbackOverlay.classList.remove('visible');
        this.elements.feedbackOverlay.classList.add('hidden');
    }

    // ==================== End Game ====================
    endGame() {
        const accuracy = this.state.totalAnswers > 0 
            ? Math.round((this.state.correctAnswers / this.state.totalAnswers) * 100)
            : 0;
        
        // Determine stars
        let stars = 1;
        if (accuracy >= 70) stars = 2;
        if (accuracy >= 90) stars = 3;
        
        // Update result screen
        this.elements.finalScore.textContent = this.state.score;
        this.elements.correctCount.textContent = this.state.correctAnswers;
        this.elements.accuracyDisplay.textContent = `${accuracy}%`;
        this.elements.bestStreak.textContent = this.state.bestStreak;
        
        // Animate stars
        const starElements = this.elements.starRating.querySelectorAll('.star');
        starElements.forEach((star, index) => {
            star.classList.remove('earned');
            if (index < stars) {
                setTimeout(() => star.classList.add('earned'), (index + 1) * 300);
            }
        });
        
        // Check high score
        const isNewHighScore = this.state.score > this.state.highScore;
        if (isNewHighScore) {
            this.state.highScore = this.state.score;
            this.saveHighScore();
            this.elements.newHighScore.classList.remove('hidden');
            this.createConfetti();
        } else {
            this.elements.newHighScore.classList.add('hidden');
        }
        
        // Set title based on performance
        if (accuracy >= 90) {
            this.elements.resultTitle.textContent = '🌟 Amazing! 🌟';
        } else if (accuracy >= 70) {
            this.elements.resultTitle.textContent = '🎉 Great Job! 🎉';
        } else if (accuracy >= 50) {
            this.elements.resultTitle.textContent = '👍 Good Try! 👍';
        } else {
            this.elements.resultTitle.textContent = '💪 Keep Practicing! 💪';
        }
        
        this.showScreen('result');
    }

    goHome() {
        // Stop background music
        if (this.audio) {
            try {
                this.audio.stopMusic();
            } catch (e) {
                // Silently ignore
            }
        }
        
        this.elements.highScoreValue.textContent = this.state.highScore;
        this.showScreen('start');
    }
    
    // ==================== Audio ====================
    playSound(type) {
        if (!this.sfxEnabled || !this.audio) return;
        
        try {
            this.audio.ensureReady();
            this.audio.playSFX(type);
        } catch (e) {
            // Silently ignore audio errors
        }
    }

    // ==================== Storage ====================
    loadHighScore() {
        try {
            const saved = localStorage.getItem(GAME_CONFIG.STORAGE_KEY);
            this.state.highScore = saved ? parseInt(saved) : 0;
            this.elements.highScoreValue.textContent = this.state.highScore;
        } catch (e) {
            console.warn('LocalStorage not available');
        }
    }

    saveHighScore() {
        try {
            localStorage.setItem(GAME_CONFIG.STORAGE_KEY, this.state.highScore);
            this.elements.highScoreValue.textContent = this.state.highScore;
        } catch (e) {
            console.warn('LocalStorage not available');
        }
    }

    // ==================== Effects ====================
    createConfetti() {
        const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#9B59B6', '#FF69B4'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = `${Math.random() * 100}%`;
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
                confetti.style.width = `${8 + Math.random() * 8}px`;
                confetti.style.height = confetti.style.width;
                
                document.getElementById('game-container').appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 3000);
            }, i * 50);
        }
    }
}

// ==================== Initialize Game ====================
document.addEventListener('DOMContentLoaded', () => {
    window.game = new PatternRainbowGame();
});
