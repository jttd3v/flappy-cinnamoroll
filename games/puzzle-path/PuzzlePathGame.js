/**
 * Puzzle Cloud Path - Main Game Logic
 * A sliding tile puzzle game with multiple themes
 * 
 * @version 1.0.0
 */

// ==================== Configuration (inlined for file:// compatibility) ====================
const PUZZLE_CONFIG = Object.freeze({
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
  
  HINTS_PER_PUZZLE: 3,
  
  LEADERBOARD_KEY: 'puzzlePathLeaderboard'
});

function getDifficultyFromAge(age) {
  if (age <= 8) return 1;
  if (age <= 10) return 2;
  if (age <= 12) return 3;
  if (age <= 15) return 4;
  if (age <= 20) return 5;
  if (age <= 25) return 6;
  return 7;
}

// ==================== Tile Themes ======================================
const TILE_THEMES = {
    numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'],
    cinnamoroll: ['🐰', '☁️', '💭', '⭐', '🌸', '🎀', '🍬', '💖', '✨', '🌈', '💫', '🎂', '🍰', '🎁', '💝', '🦋', '🌺', '🍭', '🎈', '💕', '🌟', '🎪', '🎠', '🎡'],
    animals: ['🐶', '🐱', '🐰', '🐼', '🦊', '🐸', '🐨', '🐯', '🦁', '🐮', '🐷', '🐵', '🐻', '🐔', '🐧', '🐦', '🦋', '🐢', '🐠', '🐙', '🦀', '🐝', '🦄', '🐲'],
    food: ['🍎', '🍊', '🍋', '🍇', '🍓', '🥕', '🍕', '🍰', '🍩', '🍪', '🍫', '🍭', '🎂', '🍦', '🧁', '🥐', '🍔', '🌮', '🍣', '🥗', '🍜', '🍱', '🥤', '☕'],
    space: ['🌟', '🌙', '☀️', '🪐', '🚀', '👽', '🌈', '⭐', '💫', '☄️', '🌍', '🌕', '🛸', '🔭', '🌌', '✨', '💥', '🌠', '🛰️', '🌑', '🌓', '🌔', '🌒', '🌖']
};

const ENCOURAGEMENTS = [
    "Amazing work! 🎉",
    "You're a puzzle master! 🧩",
    "Brilliant solving! ✨",
    "Fantastic job! 🌟",
    "You did it! 💖"
];

// ==================== Tile Puzzle Engine ====================
class TilePuzzleEngine {
    constructor(size = 3) {
        this.size = size;
        this.totalTiles = size * size;
        this.initialState = null;
        this.reset();
    }
    
    /**
     * Resets puzzle to solved state
     */
    reset() {
        this.tiles = [];
        for (let i = 1; i < this.totalTiles; i++) {
            this.tiles.push(i);
        }
        this.tiles.push(0); // 0 = empty
        this.emptyIndex = this.totalTiles - 1;
        this.moves = 0;
    }
    
    /**
     * Resets to initial shuffled state
     */
    resetToInitial() {
        if (this.initialState) {
            this.tiles = [...this.initialState.tiles];
            this.emptyIndex = this.initialState.emptyIndex;
            this.moves = 0;
        }
    }
    
    /**
     * Shuffles the puzzle by making valid moves
     * @param {number} moveCount - Number of random moves
     */
    shuffle(moveCount = 100) {
        // Scale shuffle count with grid size
        const shuffleMoves = moveCount * this.size;
        
        for (let i = 0; i < shuffleMoves; i++) {
            const movable = this.getMovableTiles();
            const randomIndex = movable[Math.floor(Math.random() * movable.length)];
            this.moveTile(randomIndex, false);
        }
        
        // Ensure puzzle isn't already solved
        if (this.isSolved()) {
            this.shuffle(moveCount);
            return;
        }
        
        // Save initial state for reset
        this.initialState = {
            tiles: [...this.tiles],
            emptyIndex: this.emptyIndex
        };
        this.moves = 0;
    }
    
    /**
     * Gets indices of tiles that can move
     * @returns {Array} Array of movable tile indices
     */
    getMovableTiles() {
        const movable = [];
        const row = Math.floor(this.emptyIndex / this.size);
        const col = this.emptyIndex % this.size;
        
        if (row > 0) movable.push(this.emptyIndex - this.size); // Above
        if (row < this.size - 1) movable.push(this.emptyIndex + this.size); // Below
        if (col > 0) movable.push(this.emptyIndex - 1); // Left
        if (col < this.size - 1) movable.push(this.emptyIndex + 1); // Right
        
        return movable;
    }
    
    /**
     * Checks if a tile can move
     * @param {number} tileIndex - Index of tile to check
     * @returns {boolean} Whether tile can move
     */
    canMove(tileIndex) {
        return this.getMovableTiles().includes(tileIndex);
    }
    
    /**
     * Moves a tile into the empty space
     * @param {number} tileIndex - Index of tile to move
     * @param {boolean} countMove - Whether to count this move
     * @returns {boolean} Whether move was successful
     */
    moveTile(tileIndex, countMove = true) {
        if (!this.canMove(tileIndex)) return false;
        
        // Swap tile with empty space
        this.tiles[this.emptyIndex] = this.tiles[tileIndex];
        this.tiles[tileIndex] = 0;
        this.emptyIndex = tileIndex;
        
        if (countMove) this.moves++;
        return true;
    }
    
    /**
     * Checks if puzzle is solved
     * @returns {boolean} Whether puzzle is solved
     */
    isSolved() {
        for (let i = 0; i < this.totalTiles - 1; i++) {
            if (this.tiles[i] !== i + 1) return false;
        }
        return this.tiles[this.totalTiles - 1] === 0;
    }
    
    /**
     * Gets the current puzzle state
     * @returns {Object} Current state
     */
    getState() {
        return {
            tiles: [...this.tiles],
            emptyIndex: this.emptyIndex,
            moves: this.moves,
            solved: this.isSolved()
        };
    }
    
    /**
     * Gets a hint - returns index of a tile that should move
     * @returns {number|null} Index of tile to move
     */
    getHint() {
        // Find a tile that's not in correct position
        const movable = this.getMovableTiles();
        
        // Prioritize tiles that would move to correct position
        for (const index of movable) {
            const tileValue = this.tiles[index];
            const correctIndex = tileValue - 1;
            
            // Check if moving this tile gets it closer to correct position
            if (index !== correctIndex && this.emptyIndex === correctIndex) {
                return index;
            }
        }
        
        // Otherwise return a random movable tile
        return movable[Math.floor(Math.random() * movable.length)];
    }
}

// ==================== Puzzle Renderer ====================
class PuzzleRenderer {
    constructor(container, engine, tileContent) {
        this.container = container;
        this.engine = engine;
        this.tileContent = tileContent;
        this.tileElements = [];
        this.onMove = null;
        this.onSolved = null;
    }
    
    /**
     * Creates the puzzle grid
     */
    createGrid() {
        if (!this.container) return;
        
        this.container.innerHTML = '';
        this.container.style.gridTemplateColumns = `repeat(${this.engine.size}, 1fr)`;
        this.tileElements = [];
        
        const state = this.engine.getState();
        
        for (let i = 0; i < state.tiles.length; i++) {
            const tile = document.createElement('div');
            tile.className = 'puzzle-tile';
            tile.dataset.index = i;
            
            if (state.tiles[i] === 0) {
                tile.classList.add('empty');
            } else {
                tile.textContent = this.tileContent[state.tiles[i] - 1] || state.tiles[i];
                tile.addEventListener('click', () => this.handleTileClick(i));
            }
            
            this.container.appendChild(tile);
            this.tileElements.push(tile);
        }
        
        this.updateMovableHighlight();
    }
    
    /**
     * Handles tile click
     * @param {number} index - Clicked tile index
     */
    handleTileClick(index) {
        if (this.engine.moveTile(index)) {
            this.updateGrid();
            
            if (this.onMove) {
                this.onMove(this.engine.moves);
            }
            
            if (this.engine.isSolved() && this.onSolved) {
                setTimeout(() => this.onSolved(), 300);
            }
        }
    }
    
    /**
     * Updates the grid display
     */
    updateGrid() {
        const state = this.engine.getState();
        
        for (let i = 0; i < state.tiles.length; i++) {
            const tile = this.tileElements[i];
            if (!tile) continue;
            
            tile.className = 'puzzle-tile';
            
            if (state.tiles[i] === 0) {
                tile.classList.add('empty');
                tile.textContent = '';
            } else {
                tile.textContent = this.tileContent[state.tiles[i] - 1] || state.tiles[i];
            }
        }
        
        this.updateMovableHighlight();
    }
    
    /**
     * Highlights movable tiles
     */
    updateMovableHighlight() {
        const movable = this.engine.getMovableTiles();
        
        this.tileElements.forEach((tile, index) => {
            tile.classList.toggle('movable', movable.includes(index));
        });
    }
    
    /**
     * Shows hint animation on a tile
     * @param {number} index - Tile index to highlight
     */
    showHint(index) {
        const tile = this.tileElements[index];
        if (tile && !tile.classList.contains('empty')) {
            tile.classList.add('hint');
            setTimeout(() => tile.classList.remove('hint'), 1500);
        }
    }
}

// ==================== Main Game Class ====================
class PuzzlePathGame {
    constructor() {
        // Audio system - safely initialize
        this.audio = typeof gameAudio !== 'undefined' ? gameAudio : null;
        this.musicEnabled = true;
        this.sfxEnabled = true;
        
        // Game state
        this.difficulty = 1;
        this.gridSize = 3;
        this.theme = 'cinnamoroll';
        this.isPlaying = false;
        this.startTime = 0;
        this.timerInterval = null;
        this.hintsRemaining = PUZZLE_CONFIG.HINTS_PER_PUZZLE;
        this.moveLimit = null;
        this.timeLimit = null;
        
        // Components
        this.engine = null;
        this.renderer = null;
        
        // DOM elements
        this.screens = {
            start: document.getElementById('start-screen'),
            game: document.getElementById('game-screen'),
            result: document.getElementById('result-screen')
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
            themeSelect: getElement('theme-select'),
            startBtn: getElement('start-btn'),
            bestMoves: getElement('best-moves'),
            totalStars: getElement('total-stars'),
            puzzlesSolved: getElement('puzzles-solved'),
            homeBtn: getElement('home-btn'),
            puzzleName: getElement('puzzle-name'),
            puzzleSize: getElement('puzzle-size'),
            moveCount: getElement('move-count'),
            targetPreview: getElement('target-preview'),
            targetGrid: getElement('target-grid'),
            puzzleGrid: getElement('puzzle-grid'),
            timerDisplay: getElement('timer-display'),
            moveLimitDisplay: getElement('move-limit-display'),
            movesRemaining: getElement('moves-remaining'),
            hintsRemaining: getElement('hints-remaining'),
            hintBtn: getElement('hint-btn'),
            shuffleBtn: getElement('shuffle-btn'),
            resetBtn: getElement('reset-btn'),
            resultTitle: getElement('result-title'),
            completedPuzzle: getElement('completed-puzzle'),
            finalMoves: getElement('final-moves'),
            finalTime: getElement('final-time'),
            bestRecord: getElement('best-record'),
            starRating: getElement('star-rating'),
            resultMessage: getElement('result-message'),
            nextPuzzleBtn: getElement('next-puzzle-btn'),
            retryBtn: getElement('retry-btn'),
            menuBtn: getElement('menu-btn')
        };
    }
    
    /**
     * Initializes the game
     */
    init() {
        this.loadStats();
        this.updateStartScreen();
        this.setupEventListeners();
    }
    
    /**
     * Sets up event listeners
     */
    setupEventListeners() {
        // Start screen
        this.elements.startBtn?.addEventListener('click', () => this.startGame());
        
        // Game screen
        this.elements.homeBtn?.addEventListener('click', () => this.goHome());
        this.elements.hintBtn?.addEventListener('click', () => this.useHint());
        this.elements.shuffleBtn?.addEventListener('click', () => this.newPuzzle());
        this.elements.resetBtn?.addEventListener('click', () => this.resetPuzzle());
        
        // Result screen
        this.elements.nextPuzzleBtn?.addEventListener('click', () => this.newPuzzle());
        this.elements.retryBtn?.addEventListener('click', () => this.resetPuzzle());
        this.elements.menuBtn?.addEventListener('click', () => this.goHome());
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
     * Loads stats from localStorage
     * @returns {Object} Stats object
     */
    loadStats() {
        try {
            const stored = localStorage.getItem(PUZZLE_CONFIG.LEADERBOARD_KEY);
            return stored ? JSON.parse(stored) : {
                totalStars: 0,
                puzzlesSolved: 0,
                bestMoves: {}
            };
        } catch (e) {
            return { totalStars: 0, puzzlesSolved: 0, bestMoves: {} };
        }
    }
    
    /**
     * Saves stats to localStorage
     * @param {Object} stats - Stats to save
     */
    saveStats(stats) {
        try {
            localStorage.setItem(PUZZLE_CONFIG.LEADERBOARD_KEY, JSON.stringify(stats));
        } catch (e) {
            console.warn('Could not save stats:', e);
        }
    }
    
    /**
     * Updates the start screen with current stats
     */
    updateStartScreen() {
        const stats = this.loadStats();
        
        if (this.elements.totalStars) {
            this.elements.totalStars.textContent = stats.totalStars || 0;
        }
        if (this.elements.puzzlesSolved) {
            this.elements.puzzlesSolved.textContent = stats.puzzlesSolved || 0;
        }
        if (this.elements.bestMoves) {
            const bestList = Object.values(stats.bestMoves || {});
            this.elements.bestMoves.textContent = bestList.length > 0 ? 
                Math.min(...bestList) : '--';
        }
    }
    
    /**
     * Starts a new game
     */
    startGame() {
        // Start background music with defensive programming
        if (this.audio && this.musicEnabled) {
            try {
                this.audio.ensureReady();
                this.audio.playMusic('puzzle');
            } catch (e) {
                console.warn('Audio not available:', e);
            }
        }
        
        // Get settings from PlayerManager age
        let age = 16;
        if (typeof PlayerManager !== 'undefined' && PlayerManager.hasActivePlayer()) {
            age = PlayerManager.getPlayerAge() || 16;
        }
        this.difficulty = getDifficultyFromAge(age);
        this.theme = this.elements.themeSelect?.value || 'cinnamoroll';
        
        // Get difficulty settings
        const settings = PUZZLE_CONFIG.DIFFICULTY_SETTINGS[this.difficulty];
        this.gridSize = settings.gridSize;
        this.moveLimit = settings.moveLimit;
        this.timeLimit = settings.timeLimit;
        this.hintsRemaining = PUZZLE_CONFIG.HINTS_PER_PUZZLE;
        
        // Create engine and renderer
        this.engine = new TilePuzzleEngine(this.gridSize);
        this.engine.shuffle();
        
        const tileContent = TILE_THEMES[this.theme] || TILE_THEMES.numbers;
        this.renderer = new PuzzleRenderer(
            this.elements.puzzleGrid,
            this.engine,
            tileContent
        );
        
        // Set up callbacks
        this.renderer.onMove = (moves) => this.onMove(moves);
        this.renderer.onSolved = () => this.onSolved();
        
        // Update UI
        this.updateGameUI();
        this.renderTargetPreview(tileContent, settings.showTarget);
        this.renderer.createGrid();
        
        // Start timer
        this.startTime = Date.now();
        this.startTimer();
        
        this.isPlaying = true;
        this.showScreen('game');
    }
    
    /**
     * Updates game UI elements
     */
    updateGameUI() {
        if (this.elements.puzzleName) {
            const themeNames = {
                numbers: 'Number Puzzle',
                cinnamoroll: 'Cinnamoroll',
                animals: 'Animal Friends',
                food: 'Foodie Fun',
                space: 'Space Adventure'
            };
            this.elements.puzzleName.textContent = themeNames[this.theme] || 'Puzzle';
        }
        
        if (this.elements.puzzleSize) {
            this.elements.puzzleSize.textContent = `${this.gridSize}×${this.gridSize}`;
        }
        
        if (this.elements.moveCount) {
            this.elements.moveCount.textContent = `Moves: ${this.engine?.moves || 0}`;
        }
        
        if (this.elements.hintsRemaining) {
            this.elements.hintsRemaining.textContent = this.hintsRemaining;
        }
        
        if (this.elements.hintBtn) {
            this.elements.hintBtn.disabled = this.hintsRemaining <= 0;
        }
        
        // Move limit
        if (this.moveLimit) {
            this.elements.moveLimitDisplay?.classList.remove('hidden');
            if (this.elements.movesRemaining) {
                const remaining = Math.max(0, this.moveLimit - (this.engine?.moves || 0));
                this.elements.movesRemaining.textContent = remaining;
            }
        } else {
            this.elements.moveLimitDisplay?.classList.add('hidden');
        }
    }
    
    /**
     * Renders target preview
     * @param {Array} tileContent - Tile content array
     * @param {boolean} show - Whether to show preview
     */
    renderTargetPreview(tileContent, show) {
        if (!show) {
            this.elements.targetPreview?.classList.add('hidden');
            return;
        }
        
        this.elements.targetPreview?.classList.remove('hidden');
        
        if (!this.elements.targetGrid) return;
        
        this.elements.targetGrid.innerHTML = '';
        this.elements.targetGrid.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        
        const totalTiles = this.gridSize * this.gridSize;
        
        for (let i = 0; i < totalTiles; i++) {
            const tile = document.createElement('div');
            tile.className = 'target-tile';
            
            if (i === totalTiles - 1) {
                tile.classList.add('empty');
            } else {
                tile.textContent = tileContent[i] || (i + 1);
            }
            
            this.elements.targetGrid.appendChild(tile);
        }
    }
    
    /**
     * Starts the game timer
     */
    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            
            if (this.elements.timerDisplay) {
                this.elements.timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
            
            // Check time limit
            if (this.timeLimit && elapsed >= this.timeLimit) {
                this.onTimeOut();
            }
        }, 1000);
    }
    
    /**
     * Stops the timer
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    /**
     * Called when a move is made
     * @param {number} moves - Current move count
     */
    onMove(moves) {
        if (this.elements.moveCount) {
            this.elements.moveCount.textContent = `Moves: ${moves}`;
        }
        
        if (this.moveLimit && this.elements.movesRemaining) {
            const remaining = Math.max(0, this.moveLimit - moves);
            this.elements.movesRemaining.textContent = remaining;
            
            if (remaining <= 0 && !this.engine.isSolved()) {
                this.onMoveLimit();
            }
        }
    }
    
    /**
     * Called when puzzle is solved
     */
    onSolved() {
        this.isPlaying = false;
        this.stopTimer();
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const moves = this.engine.moves;
        
        // Calculate stars based on moves (optimal is about (gridSize^2 * 3))
        const optimalMoves = this.gridSize * this.gridSize * 3;
        const ratio = moves / optimalMoves;
        
        let stars = 1;
        if (ratio <= PUZZLE_CONFIG.STAR_THRESHOLDS[3]) stars = 3;
        else if (ratio <= PUZZLE_CONFIG.STAR_THRESHOLDS[2]) stars = 2;
        
        // Update stats
        const stats = this.loadStats();
        const puzzleKey = `${this.theme}_${this.gridSize}`;
        
        stats.puzzlesSolved = (stats.puzzlesSolved || 0) + 1;
        stats.totalStars = (stats.totalStars || 0) + stars;
        
        if (!stats.bestMoves[puzzleKey] || moves < stats.bestMoves[puzzleKey]) {
            stats.bestMoves[puzzleKey] = moves;
        }
        
        this.saveStats(stats);
        
        // Show results
        this.showResults(moves, elapsed, stars, stats.bestMoves[puzzleKey]);
    }
    
    /**
     * Called when time runs out
     */
    onTimeOut() {
        this.isPlaying = false;
        this.stopTimer();
        alert('Time\'s up! Try again?');
        this.resetPuzzle();
    }
    
    /**
     * Called when move limit is reached
     */
    onMoveLimit() {
        this.isPlaying = false;
        this.stopTimer();
        alert('Out of moves! Try again?');
        this.resetPuzzle();
    }
    
    /**
     * Shows the results screen
     * @param {number} moves - Total moves
     * @param {number} time - Time in seconds
     * @param {number} stars - Stars earned
     * @param {number} best - Best moves record
     */
    showResults(moves, time, stars, best) {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        
        if (this.elements.resultTitle) {
            this.elements.resultTitle.textContent = stars === 3 ? 
                '🎉 Perfect! 🎉' : '🧩 Puzzle Complete!';
        }
        
        if (this.elements.finalMoves) {
            this.elements.finalMoves.textContent = moves;
        }
        
        if (this.elements.finalTime) {
            this.elements.finalTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (this.elements.bestRecord) {
            this.elements.bestRecord.textContent = best || moves;
        }
        
        // Render completed puzzle
        this.renderCompletedPuzzle();
        
        // Show stars
        if (this.elements.starRating) {
            const starEls = this.elements.starRating.querySelectorAll('.star');
            starEls.forEach((star, index) => {
                setTimeout(() => {
                    star.classList.toggle('earned', index < stars);
                }, index * 300);
            });
        }
        
        if (this.elements.resultMessage) {
            this.elements.resultMessage.textContent = 
                ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
        }
        
        this.showScreen('result');
    }
    
    /**
     * Renders the completed puzzle display
     */
    renderCompletedPuzzle() {
        if (!this.elements.completedPuzzle) return;
        
        this.elements.completedPuzzle.innerHTML = '';
        this.elements.completedPuzzle.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        
        const tileContent = TILE_THEMES[this.theme] || TILE_THEMES.numbers;
        const totalTiles = this.gridSize * this.gridSize;
        
        for (let i = 0; i < totalTiles; i++) {
            const tile = document.createElement('div');
            tile.className = 'puzzle-tile';
            
            if (i === totalTiles - 1) {
                tile.classList.add('empty');
            } else {
                tile.textContent = tileContent[i] || (i + 1);
            }
            
            this.elements.completedPuzzle.appendChild(tile);
        }
    }
    
    /**
     * Uses a hint
     */
    useHint() {
        if (this.hintsRemaining <= 0 || !this.engine || !this.renderer) return;
        
        const hintIndex = this.engine.getHint();
        if (hintIndex !== null) {
            this.renderer.showHint(hintIndex);
            this.hintsRemaining--;
            
            if (this.elements.hintsRemaining) {
                this.elements.hintsRemaining.textContent = this.hintsRemaining;
            }
            
            if (this.elements.hintBtn) {
                this.elements.hintBtn.disabled = this.hintsRemaining <= 0;
            }
        }
    }
    
    /**
     * Creates a new puzzle
     */
    newPuzzle() {
        this.stopTimer();
        this.startGame();
    }
    
    /**
     * Resets the current puzzle
     */
    resetPuzzle() {
        if (!this.engine) {
            this.startGame();
            return;
        }
        
        this.engine.resetToInitial();
        this.hintsRemaining = PUZZLE_CONFIG.HINTS_PER_PUZZLE;
        this.startTime = Date.now();
        
        this.updateGameUI();
        this.renderer?.updateGrid();
        
        if (!this.timerInterval) {
            this.startTimer();
        }
        
        this.isPlaying = true;
        this.showScreen('game');
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
        this.stopTimer();
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
        window.game = new PuzzlePathGame();
    } catch (error) {
        console.error('Failed to initialize Puzzle Path game:', error);
    }
});
