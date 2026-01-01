/**
 * Treasure Chest Memory - Main Game Module
 * A memory matching game with Cinnamoroll theme
 */

// ==================== Configuration (inlined for file:// compatibility) ====================
const DIFFICULTY_PRESETS = Object.freeze({
  // Age 6-8: Very Easy
  1: {
    name: 'Beginner',
    gridCols: 2,
    gridRows: 3,
    pairs: 3,
    timeLimit: null,
    previewTime: 3000,
    flipDelay: 1500
  },
  // Age 9-12: Easy
  2: {
    name: 'Easy',
    gridCols: 3,
    gridRows: 4,
    pairs: 6,
    timeLimit: null,
    previewTime: 2000,
    flipDelay: 1200
  },
  // Age 13-15: Medium
  3: {
    name: 'Medium',
    gridCols: 4,
    gridRows: 4,
    pairs: 8,
    timeLimit: 120,
    previewTime: 1000,
    flipDelay: 1000
  },
  // Age 16-18: Hard
  4: {
    name: 'Hard',
    gridCols: 4,
    gridRows: 5,
    pairs: 10,
    timeLimit: 90,
    previewTime: 0,
    flipDelay: 800
  },
  // Age 19-25: Expert
  5: {
    name: 'Expert',
    gridCols: 5,
    gridRows: 4,
    pairs: 10,
    timeLimit: 60,
    previewTime: 0,
    flipDelay: 600
  },
  // Age 26-35: Master
  6: {
    name: 'Master',
    gridCols: 6,
    gridRows: 4,
    pairs: 12,
    timeLimit: 45,
    previewTime: 0,
    flipDelay: 500
  }
});

const MEMORY_CONFIG = Object.freeze({
  // Canvas/Display
  GAME_WIDTH: 400,
  GAME_HEIGHT: 600,
  
  // Scoring
  BASE_SCORE: 1000,
  FLIP_PENALTY: 10,
  TIME_BONUS_PER_SECOND: 5,
  PERFECT_MULTIPLIER: 2,
  
  // Card appearance
  CARD_WIDTH: 70,
  CARD_HEIGHT: 90,
  CARD_GAP: 10,
  CARD_BORDER_RADIUS: 10,
  
  // Animation timing (ms)
  FLIP_DURATION: 400,
  MATCH_DELAY: 500,
  WRONG_SHAKE_DURATION: 300,
  
  // Colors
  CARD_BACK_COLOR: '#8B4513',
  CARD_BACK_GRADIENT: 'linear-gradient(145deg, #8B4513, #654321)',
  CARD_FRONT_COLOR: '#FFFFFF',
  CARD_BORDER_COLOR: '#FFB6C1',
  MATCH_GLOW_COLOR: '#FFD700',
  
  // Storage
  LEADERBOARD_KEY: 'memoryLeaderboard',
  LEADERBOARD_MAX: 10,
  PROGRESS_KEY: 'memoryProgress',
  
  // Default theme
  DEFAULT_THEME: 'cinnamoroll'
});

const CARD_THEMES = Object.freeze({
  cinnamoroll: {
    name: 'Cinnamoroll Friends',
    images: ['🐰', '☁️', '🌟', '💖', '🎀', '🍰', '🧁', '🍬', '🌈', '🎈', '🍭', '🌸']
  },
  sweets: {
    name: 'Sweet Treats',
    images: ['🍰', '🧁', '🍩', '🍪', '🍫', '🍬', '🍭', '🎂', '🍦', '🍡', '🥧', '🍮']
  },
  nature: {
    name: 'Nature',
    images: ['🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '🍀', '🌿', '🌴', '🌵', '🍄', '🌾']
  },
  animals: {
    name: 'Cute Animals',
    images: ['🐰', '🐱', '🐶', '🐼', '🐨', '🦊', '🐸', '🐝', '🦋', '🐞', '🐢', '🦄']
  },
  numbers: {
    name: 'Numbers',
    images: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '💯', '🔢']
  },
  letters: {
    name: 'Letters',
    images: ['🅰️', '🅱️', '©️', '®️', 'Ⓜ️', '🔤', '🔡', '🔠', 'ℹ️', '🆎', '🆑', '🆒']
  }
});

const STAR_THRESHOLDS = Object.freeze({
  THREE_STAR: 0.9,  // 90%+ of optimal flips
  TWO_STAR: 0.6,    // 60%+ of optimal flips
  ONE_STAR: 0       // Completed game
});

const SOUND_EVENTS = Object.freeze({
  CARD_FLIP: 'click',
  MATCH_FOUND: 'score',
  NO_MATCH: 'wrong',
  GAME_WIN: 'victory',
  STAR_EARNED: 'powerUp',
  TIMER_WARNING: 'tick'
});

function getDifficultyFromAge(age) {
  if (age <= 8) return 1;
  if (age <= 12) return 2;
  if (age <= 15) return 3;
  if (age <= 18) return 4;
  if (age <= 25) return 5;
  return 6;
}

function getConfigForDifficulty(level) {
  const difficultyConfig = DIFFICULTY_PRESETS[level] || DIFFICULTY_PRESETS[1];
  return {
    ...MEMORY_CONFIG,
    ...difficultyConfig
  };
}

class TreasureChestMemory {
  constructor() {
    // Game state
    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.totalPairs = 0;
    this.flips = 0;
    this.score = 0;
    this.timeElapsed = 0;
    this.timeLimit = null;
    this.difficulty = 1;
    this.theme = 'cinnamoroll';
    this.isPlaying = false;
    this.isPaused = false;
    this.soundEnabled = true;
    this.musicEnabled = true;
    this.timerInterval = null;
    this.isProcessing = false;
    
    // Audio manager reference
    this.audio = typeof gameAudio !== 'undefined' ? gameAudio : null;
    
    // DOM elements
    this.screens = {
      start: document.getElementById('start-screen'),
      game: document.getElementById('game-screen'),
      result: document.getElementById('result-screen')
    };
    
    this.elements = {
      ageSelect: document.getElementById('age-select'),
      themeSelect: document.getElementById('theme-select'),
      startBtn: document.getElementById('start-btn'),
      cardGrid: document.getElementById('card-grid'),
      scoreDisplay: document.getElementById('score-display'),
      flipsDisplay: document.getElementById('flips-display'),
      pairsDisplay: document.getElementById('pairs-display'),
      timerDisplay: document.getElementById('timer-display'),
      timerStat: document.getElementById('timer-stat'),
      pauseBtn: document.getElementById('pause-btn'),
      soundBtn: document.getElementById('sound-btn'),
      homeBtn: document.getElementById('home-btn'),
      pauseOverlay: document.getElementById('pause-overlay'),
      resumeBtn: document.getElementById('resume-btn'),
      quitBtn: document.getElementById('quit-btn'),
      playAgainBtn: document.getElementById('play-again-btn'),
      homeResultBtn: document.getElementById('home-result-btn'),
      highScoreDisplay: document.getElementById('high-score-display'),
      finalScore: document.getElementById('final-score'),
      finalFlips: document.getElementById('final-flips'),
      finalTime: document.getElementById('final-time'),
      starRating: document.getElementById('star-rating'),
      newRecord: document.getElementById('new-record')
    };
    
    this.init();
  }
  
  init() {
    this.loadHighScore();
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Start screen
    this.elements.startBtn.addEventListener('click', () => this.startGame());
    
    // Game controls
    this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
    this.elements.soundBtn.addEventListener('click', () => this.toggleSound());
    this.elements.homeBtn.addEventListener('click', () => this.goHome());
    
    // Pause overlay
    this.elements.resumeBtn.addEventListener('click', () => this.togglePause());
    this.elements.quitBtn.addEventListener('click', () => this.goHome());
    
    // Result screen
    this.elements.playAgainBtn.addEventListener('click', () => this.startGame());
    this.elements.homeResultBtn.addEventListener('click', () => this.goHome());
    
    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isPlaying) {
        this.togglePause();
      }
    });
  }
  
  showScreen(screenName) {
    Object.values(this.screens).forEach(screen => screen.classList.remove('active'));
    this.screens[screenName].classList.add('active');
  }
  
  startGame() {
    // Get age from PlayerManager (set during registration)
    let age = 16; // Default
    if (typeof PlayerManager !== 'undefined' && PlayerManager.hasActivePlayer()) {
      age = PlayerManager.getPlayerAge() || 16;
    }
    
    this.difficulty = getDifficultyFromAge(age);
    this.theme = this.elements.themeSelect.value;
    
    const settings = DIFFICULTY_PRESETS[this.difficulty];
    
    // Initialize game state
    this.totalPairs = settings.pairs;
    this.matchedPairs = 0;
    this.flips = 0;
    this.score = MEMORY_CONFIG.BASE_SCORE;
    this.timeElapsed = 0;
    this.timeLimit = settings.timeLimit;
    this.flippedCards = [];
    this.isPlaying = true;
    this.isPaused = false;
    this.isProcessing = false;
    
    // Start background music
    if (this.audio && this.musicEnabled) {
      try {
        this.audio.ensureReady();
        this.audio.playMusic('memory');
      } catch (e) {
        // Silently ignore audio errors
      }
    }
    
    // Create cards
    this.createCards(settings);
    
    // Update UI
    this.updateDisplay();
    this.showScreen('game');
    
    // Show preview if enabled
    if (settings.previewTime > 0) {
      this.showPreview(settings.previewTime);
    }
    
    // Start timer
    this.startTimer();
    
    this.playSound('start');
  }
  
  createCards(settings) {
    const themeData = CARD_THEMES[this.theme];
    const themeEmojis = themeData.images || themeData;
    const selectedEmojis = this.shuffleArray([...themeEmojis]).slice(0, settings.pairs);
    
    // Create pairs
    let cardData = [];
    selectedEmojis.forEach((emoji, index) => {
      cardData.push({ id: index * 2, pairId: index, image: emoji, state: 'hidden' });
      cardData.push({ id: index * 2 + 1, pairId: index, image: emoji, state: 'hidden' });
    });
    
    // Shuffle cards
    this.cards = this.shuffleArray(cardData);
    
    // Render grid
    this.renderGrid(settings.gridCols, settings.gridRows);
  }
  
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  renderGrid(cols, rows) {
    this.elements.cardGrid.innerHTML = '';
    this.elements.cardGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    
    this.cards.forEach((card, index) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'card';
      cardEl.dataset.index = index;
      
      cardEl.innerHTML = `
        <div class="card-inner">
          <div class="card-back"></div>
          <div class="card-front">${card.image}</div>
        </div>
      `;
      
      cardEl.addEventListener('click', () => this.handleCardClick(index));
      
      this.elements.cardGrid.appendChild(cardEl);
    });
  }
  
  showPreview(duration) {
    const cardElements = this.elements.cardGrid.querySelectorAll('.card');
    cardElements.forEach(card => card.classList.add('flipped'));
    
    setTimeout(() => {
      cardElements.forEach(card => {
        if (!this.cards[card.dataset.index].state === 'matched') {
          card.classList.remove('flipped');
        }
      });
    }, duration);
  }
  
  handleCardClick(index) {
    if (!this.isPlaying || this.isPaused || this.isProcessing) return;
    
    const card = this.cards[index];
    const cardEl = this.elements.cardGrid.children[index];
    
    // Ignore if already flipped or matched
    if (card.state === 'flipped' || card.state === 'matched') return;
    
    // Ignore if two cards already flipped
    if (this.flippedCards.length >= 2) return;
    
    // Flip the card
    card.state = 'flipped';
    cardEl.classList.add('flipped');
    this.flippedCards.push({ card, element: cardEl, index });
    this.flips++;
    
    this.playSound('flip');
    this.updateDisplay();
    
    // Check for match if two cards flipped
    if (this.flippedCards.length === 2) {
      this.isProcessing = true;
      this.checkMatch();
    }
  }
  
  checkMatch() {
    const [first, second] = this.flippedCards;
    const settings = DIFFICULTY_PRESETS[this.difficulty];
    
    if (first.card.pairId === second.card.pairId) {
      // Match!
      setTimeout(() => {
        first.card.state = 'matched';
        second.card.state = 'matched';
        first.element.classList.add('matched');
        second.element.classList.add('matched');
        
        this.matchedPairs++;
        this.playSound('match');
        this.updateDisplay();
        
        this.flippedCards = [];
        this.isProcessing = false;
        
        // Check win
        if (this.matchedPairs === this.totalPairs) {
          this.endGame(true);
        }
      }, 300);
    } else {
      // No match - show cards for 3 seconds before flipping back
      const viewTime = 3000; // 3 seconds to memorize
      
      setTimeout(() => {
        first.element.classList.add('wrong');
        second.element.classList.add('wrong');
        
        this.playSound('wrong');
        
        // Apply flip penalty
        this.score = Math.max(0, this.score - MEMORY_CONFIG.FLIP_PENALTY);
        
        // Wait 3 seconds then flip back
        setTimeout(() => {
          first.card.state = 'hidden';
          second.card.state = 'hidden';
          first.element.classList.remove('flipped', 'wrong');
          second.element.classList.remove('flipped', 'wrong');
          
          this.flippedCards = [];
          this.isProcessing = false;
          this.updateDisplay();
        }, viewTime);
      }, 500);
    }
  }
  
  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    
    this.timerInterval = setInterval(() => {
      if (!this.isPaused && this.isPlaying) {
        this.timeElapsed++;
        this.updateTimerDisplay();
        
        // Check time limit
        if (this.timeLimit && this.timeElapsed >= this.timeLimit) {
          this.endGame(false);
        }
        
        // Warning when low time
        if (this.timeLimit && (this.timeLimit - this.timeElapsed) <= 10) {
          this.elements.timerStat.classList.add('warning');
        }
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
    if (this.timeLimit) {
      const remaining = Math.max(0, this.timeLimit - this.timeElapsed);
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      this.elements.timerDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    } else {
      const mins = Math.floor(this.timeElapsed / 60);
      const secs = this.timeElapsed % 60;
      this.elements.timerDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  }
  
  updateDisplay() {
    this.elements.scoreDisplay.textContent = this.score;
    this.elements.flipsDisplay.textContent = this.flips;
    this.elements.pairsDisplay.textContent = `${this.matchedPairs}/${this.totalPairs}`;
  }
  
  endGame(won) {
    this.isPlaying = false;
    this.stopTimer();
    
    // Calculate final score
    const minFlips = this.totalPairs * 2;
    const isPerfect = this.flips === minFlips;
    
    if (isPerfect) {
      this.score *= MEMORY_CONFIG.PERFECT_MULTIPLIER;
    }
    
    // Time bonus (if won under time limit)
    if (won && this.timeLimit) {
      const timeRemaining = this.timeLimit - this.timeElapsed;
      this.score += timeRemaining * MEMORY_CONFIG.TIME_BONUS_PER_SECOND;
    }
    
    // Calculate stars
    const efficiency = minFlips / this.flips;
    let stars = 1;
    if (efficiency >= 0.9) stars = 3;
    else if (efficiency >= 0.7) stars = 2;
    
    if (!won) stars = 0;
    
    // Update result screen
    this.elements.finalScore.textContent = this.score;
    this.elements.finalFlips.textContent = `${this.flips}${isPerfect ? ' (Perfect!)' : ''}`;
    
    const mins = Math.floor(this.timeElapsed / 60);
    const secs = this.timeElapsed % 60;
    this.elements.finalTime.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    
    // Show stars
    const starElements = this.elements.starRating.querySelectorAll('.star');
    starElements.forEach((star, i) => {
      star.classList.remove('earned');
      if (i < stars) {
        setTimeout(() => star.classList.add('earned'), i * 200);
      }
    });
    
    // Check high score
    const highScore = this.getHighScore();
    if (won && this.score > highScore) {
      this.saveHighScore(this.score);
      this.elements.newRecord.classList.remove('hidden');
    } else {
      this.elements.newRecord.classList.add('hidden');
    }
    
    // Update title
    document.getElementById('result-title').textContent = won ? '🎉 Great Job! 🎉' : '⏰ Time\'s Up!';
    
    this.playSound(won ? 'win' : 'lose');
    
    // Show confetti if won with 3 stars
    if (won && stars === 3) {
      this.showConfetti();
    }
    
    // Save progress for career assessment
    this.saveProgress(won, stars);
    
    setTimeout(() => {
      this.showScreen('result');
    }, 500);
  }
  
  showConfetti() {
    const colors = ['#FFD700', '#FF6B9D', '#87CEEB', '#98FB98', '#DDA0DD'];
    
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
        document.getElementById('game-container').appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 3000);
      }, i * 50);
    }
  }
  
  togglePause() {
    this.isPaused = !this.isPaused;
    this.elements.pauseOverlay.classList.toggle('hidden', !this.isPaused);
    this.elements.pauseBtn.textContent = this.isPaused ? '▶️' : '⏸️';
  }
  
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    this.elements.soundBtn.textContent = this.soundEnabled ? '🔊' : '🔇';
  }
  
  goHome() {
    this.isPlaying = false;
    this.isPaused = false;
    this.stopTimer();
    
    // Stop background music
    if (this.audio) {
      try {
        this.audio.stopMusic();
      } catch (e) {
        // Silently ignore
      }
    }
    
    this.elements.pauseOverlay.classList.add('hidden');
    this.elements.timerStat.classList.remove('warning');
    this.loadHighScore();
    this.showScreen('start');
  }
  
  playSound(type) {
    if (!this.soundEnabled) return;
    
    // Use GameAudioManager if available
    if (this.audio) {
      try {
        this.audio.ensureReady();
        const soundMap = {
          flip: 'flip',
          match: 'correct',
          wrong: 'wrong',
          win: 'victory',
          lose: 'gameover',
          start: 'start'
        };
        this.audio.playSFX(soundMap[type] || type);
      } catch (e) {
        // Silently ignore audio errors
      }
      return;
    }
    
    // Fallback: Create simple beep sounds using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      const sounds = {
        flip: { freq: 600, duration: 0.1 },
        match: { freq: 800, duration: 0.2 },
        wrong: { freq: 300, duration: 0.3 },
        win: { freq: 1000, duration: 0.5 },
        lose: { freq: 200, duration: 0.5 },
        start: { freq: 700, duration: 0.15 }
      };
      
      const sound = sounds[type] || sounds.flip;
      
      oscillator.frequency.value = sound.freq;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + sound.duration);
    } catch (e) {
      // Silently ignore audio errors
    }
  }
  
  getHighScore() {
    const key = `memoryHighScore_${this.difficulty}`;
    return parseInt(localStorage.getItem(key) || '0');
  }
  
  saveHighScore(score) {
    const key = `memoryHighScore_${this.difficulty}`;
    localStorage.setItem(key, score.toString());
  }
  
  loadHighScore() {
    let age = 16;
    if (typeof PlayerManager !== 'undefined' && PlayerManager.hasActivePlayer()) {
      age = PlayerManager.getPlayerAge() || 16;
    }
    const diff = getDifficultyFromAge(age);
    const key = `memoryHighScore_${diff}`;
    const highScore = localStorage.getItem(key) || '0';
    this.elements.highScoreDisplay.textContent = highScore;
  }
  
  saveProgress(won, stars) {
    // Save for Career Assessment integration
    const key = 'treasureChestMemoryProgress';
    const existing = JSON.parse(localStorage.getItem(key) || '{}');
    
    existing.gamesPlayed = (existing.gamesPlayed || 0) + 1;
    existing.totalScore = (existing.totalScore || 0) + (won ? this.score : 0);
    existing.totalStars = (existing.totalStars || 0) + stars;
    existing.lastPlayed = new Date().toISOString();
    
    if (!existing.bestScores) existing.bestScores = {};
    if (!existing.bestScores[this.difficulty] || this.score > existing.bestScores[this.difficulty]) {
      existing.bestScores[this.difficulty] = this.score;
    }
    
    localStorage.setItem(key, JSON.stringify(existing));
  }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.game = new TreasureChestMemory();
});
