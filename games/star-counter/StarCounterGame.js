/**
 * Star Counter - Main Game Module
 * A math arcade game where you catch falling stars with correct answers
 */

// ==================== Configuration (inlined for file:// compatibility) ====================
const DIFFICULTY_PRESETS = Object.freeze({
  // Age 6-8: Number Recognition
  1: {
    name: 'Tiny Stars',
    mathType: 'recognition',
    starCount: 3,
    starSpeed: 1.5,
    spawnInterval: 3000,
    lives: 5,
    showHint: true
  },
  // Age 9-10: Simple Addition
  2: {
    name: 'Little Stars',
    mathType: 'addition',
    numberRange: [1, 10],
    starCount: 3,
    starSpeed: 2,
    spawnInterval: 2500,
    lives: 5,
    showHint: true
  },
  // Age 11-12: Add/Subtract
  3: {
    name: 'Bright Stars',
    mathType: 'addSubtract',
    numberRange: [1, 20],
    starCount: 4,
    starSpeed: 2.5,
    spawnInterval: 2200,
    lives: 4,
    showHint: false
  },
  // Age 13-15: Multiply/Divide
  4: {
    name: 'Shining Stars',
    mathType: 'multiplyDivide',
    numberRange: [2, 12],
    starCount: 4,
    starSpeed: 3,
    spawnInterval: 2000,
    lives: 3,
    showHint: false
  },
  // Age 16-18: Mixed Operations
  5: {
    name: 'Blazing Stars',
    mathType: 'mixed',
    numberRange: [1, 20],
    starCount: 5,
    starSpeed: 3.5,
    spawnInterval: 1800,
    lives: 3,
    showHint: false
  },
  // Age 19-25: Fractions & Percentages
  6: {
    name: 'Super Stars',
    mathType: 'fractionsPercent',
    starCount: 5,
    starSpeed: 4,
    spawnInterval: 1600,
    lives: 3,
    showHint: false
  },
  // Age 26-35: Basic Algebra
  7: {
    name: 'Mega Stars',
    mathType: 'algebra',
    starCount: 6,
    starSpeed: 4.5,
    spawnInterval: 1400,
    lives: 2,
    showHint: false
  }
});

const STAR_CONFIG = Object.freeze({
  // Canvas
  CANVAS_WIDTH: 400,
  CANVAS_HEIGHT: 600,
  
  // Player
  PLAYER_WIDTH: 50,
  PLAYER_HEIGHT: 50,
  PLAYER_SPEED: 8,
  PLAYER_Y_OFFSET: 80, // From bottom
  
  // Stars
  STAR_WIDTH: 60,
  STAR_HEIGHT: 60,
  STAR_ROTATION_SPEED: 0.02,
  
  // Scoring
  BASE_POINTS: 100,
  WRONG_PENALTY: 50,
  COMBO_THRESHOLDS: {
    2: 1.5,
    3: 2,
    5: 3,
    10: 5
  },
  
  // Colors
  BACKGROUND_TOP: '#1a1a2e',
  BACKGROUND_BOTTOM: '#16213e',
  STAR_COLOR_CORRECT: '#FFD700',
  STAR_COLOR_WRONG: '#FFA500',
  CORRECT_FLASH: '#4CAF50',
  WRONG_FLASH: '#F44336',
  
  // UI
  PROBLEM_BOX_WIDTH: 220,
  PROBLEM_BOX_HEIGHT: 50,
  
  // Storage
  LEADERBOARD_KEY: 'starCounterLeaderboard',
  PROGRESS_KEY: 'starCounterProgress'
});

const MATH_SYMBOLS = Object.freeze({
  ADD: '+',
  SUBTRACT: '−',
  MULTIPLY: '×',
  DIVIDE: '÷',
  EQUALS: '='
});

const SOUND_EVENTS = Object.freeze({
  STAR_CATCH_CORRECT: 'score',
  STAR_CATCH_WRONG: 'collision',
  COMBO_UP: 'powerUp',
  COMBO_BREAK: 'wrong',
  NEW_PROBLEM: 'click',
  GAME_OVER: 'gameOver'
});

function getDifficultyFromAge(age) {
  if (age <= 8) return 1;
  if (age <= 10) return 2;
  if (age <= 12) return 3;
  if (age <= 15) return 4;
  if (age <= 18) return 5;
  if (age <= 25) return 6;
  return 7;
}

function getConfigForDifficulty(level) {
  const preset = DIFFICULTY_PRESETS[level] || DIFFICULTY_PRESETS[1];
  return {
    ...STAR_CONFIG,
    ...preset
  };
}

class StarCounterGame {
  constructor() {
    // Audio manager reference
    this.audio = typeof gameAudio !== 'undefined' ? gameAudio : null;
    this.musicEnabled = true;
    this.sfxEnabled = true;
    
    // Game state
    this.score = 0;
    this.lives = 3;
    this.combo = 0;
    this.maxCombo = 0;
    this.correctAnswers = 0;
    this.wrongAnswers = 0;
    this.difficulty = 1;
    this.isPlaying = false;
    
    // Current problem
    this.currentProblem = null;
    this.stars = [];
    
    // Player
    this.player = {
      x: 0,
      y: 0,
      width: 50,
      height: 50,
      speed: 8,
      moving: 0 // -1 left, 0 none, 1 right
    };
    
    // Canvas
    this.canvas = null;
    this.ctx = null;
    this.canvasWidth = 400;
    this.canvasHeight = 600;
    
    // Timing
    this.lastTime = 0;
    this.spawnTimer = 0;
    this.animationId = null;
    
    // Input state
    this.keys = {};
    this.touchLeft = false;
    this.touchRight = false;
    
    // DOM elements
    this.screens = {
      start: document.getElementById('start-screen'),
      game: document.getElementById('game-screen'),
      result: document.getElementById('result-screen')
    };
    
    this.elements = {
      ageSelect: document.getElementById('age-select'),
      startBtn: document.getElementById('start-btn'),
      canvas: document.getElementById('game-canvas'),
      leftBtn: document.getElementById('left-btn'),
      rightBtn: document.getElementById('right-btn'),
      playAgainBtn: document.getElementById('play-again-btn'),
      homeBtn: document.getElementById('home-btn'),
      highScoreDisplay: document.getElementById('high-score-display'),
      finalScore: document.getElementById('final-score'),
      finalCorrect: document.getElementById('final-correct'),
      finalCombo: document.getElementById('final-combo'),
      finalAccuracy: document.getElementById('final-accuracy'),
      starRating: document.getElementById('star-rating'),
      newRecord: document.getElementById('new-record')
    };
    
    this.init();
  }
  
  init() {
    this.setupCanvas();
    this.loadHighScore();
    this.setupEventListeners();
  }
  
  setupCanvas() {
    this.canvas = this.elements.canvas;
    this.ctx = this.canvas.getContext('2d');
    
    // Set canvas size
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }
  
  resizeCanvas() {
    const container = document.getElementById('game-container');
    const maxWidth = Math.min(450, window.innerWidth);
    const maxHeight = window.innerHeight;
    
    this.canvasWidth = maxWidth;
    this.canvasHeight = maxHeight;
    
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    
    // Update player Y position
    this.player.y = this.canvasHeight - 100;
    this.player.x = this.canvasWidth / 2 - this.player.width / 2;
  }
  
  setupEventListeners() {
    // Start button
    this.elements.startBtn.addEventListener('click', () => this.startGame());
    
    // Result buttons
    this.elements.playAgainBtn.addEventListener('click', () => this.startGame());
    this.elements.homeBtn.addEventListener('click', () => this.goHome());
    
    // Keyboard input
    document.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      if (['ArrowLeft', 'ArrowRight', 'a', 'd', 'A', 'D'].includes(e.key)) {
        e.preventDefault();
      }
    });
    
    document.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
    
    // Mobile touch controls
    this.elements.leftBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.touchLeft = true;
    });
    this.elements.leftBtn.addEventListener('touchend', () => {
      this.touchLeft = false;
    });
    
    this.elements.rightBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.touchRight = true;
    });
    this.elements.rightBtn.addEventListener('touchend', () => {
      this.touchRight = false;
    });
    
    // Mouse controls for buttons too
    this.elements.leftBtn.addEventListener('mousedown', () => this.touchLeft = true);
    this.elements.leftBtn.addEventListener('mouseup', () => this.touchLeft = false);
    this.elements.leftBtn.addEventListener('mouseleave', () => this.touchLeft = false);
    
    this.elements.rightBtn.addEventListener('mousedown', () => this.touchRight = true);
    this.elements.rightBtn.addEventListener('mouseup', () => this.touchRight = false);
    this.elements.rightBtn.addEventListener('mouseleave', () => this.touchRight = false);
  }
  
  showScreen(screenName) {
    Object.values(this.screens).forEach(screen => screen.classList.remove('active'));
    this.screens[screenName].classList.add('active');
  }
  
  startGame() {
    // Initialize and start background music
    if (this.audio && this.musicEnabled) {
      try {
        this.audio.ensureReady();
        this.audio.playMusic('math');
      } catch (e) {
        // Silently ignore audio errors
      }
    }
    
    // Get difficulty from PlayerManager age
    let age = 16; // Default
    if (typeof PlayerManager !== 'undefined' && PlayerManager.hasActivePlayer()) {
      age = PlayerManager.getPlayerAge() || 16;
    }
    this.difficulty = getDifficultyFromAge(age);
    
    const settings = DIFFICULTY_PRESETS[this.difficulty];
    
    // Reset game state
    this.score = 0;
    this.lives = settings.lives;
    this.combo = 0;
    this.maxCombo = 0;
    this.correctAnswers = 0;
    this.wrongAnswers = 0;
    this.stars = [];
    this.spawnTimer = 0;
    this.isPlaying = true;
    
    // Reset player position
    this.player.x = this.canvasWidth / 2 - this.player.width / 2;
    this.player.speed = STAR_CONFIG.PLAYER_SPEED;
    
    // Generate first problem
    this.generateProblem();
    
    // Show game screen
    this.showScreen('game');
    
    // Start game loop
    this.lastTime = performance.now();
    this.gameLoop();
  }
  
  generateProblem() {
    const settings = DIFFICULTY_PRESETS[this.difficulty];
    const generator = new MathProblemGenerator(this.difficulty, settings);
    this.currentProblem = generator.generate();
    
    // Clear existing stars
    this.stars = [];
    
    // Spawn stars with answer and distractors
    this.spawnStars();
  }
  
  spawnStars() {
    const settings = DIFFICULTY_PRESETS[this.difficulty];
    const allAnswers = [this.currentProblem.answer, ...this.currentProblem.distractors];
    
    // Shuffle answers
    const shuffled = this.shuffleArray(allAnswers);
    
    // Create stars at random x positions
    const starWidth = 60;
    const margin = 30;
    const availableWidth = this.canvasWidth - margin * 2 - starWidth;
    
    shuffled.forEach((value, index) => {
      const x = margin + Math.random() * availableWidth;
      const y = -80 - index * 100 - Math.random() * 50;
      
      this.stars.push({
        x,
        y,
        value,
        isCorrect: value === this.currentProblem.answer,
        speed: settings.starSpeed + Math.random() * 0.5,
        width: starWidth,
        height: 60,
        rotation: Math.random() * 0.5 - 0.25
      });
    });
  }
  
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  gameLoop(currentTime = performance.now()) {
    if (!this.isPlaying) return;
    
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    
    this.update(deltaTime);
    this.render();
    
    this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
  }
  
  update(deltaTime) {
    // Update player movement
    this.updatePlayer(deltaTime);
    
    // Update stars
    this.updateStars(deltaTime);
    
    // Check collisions
    this.checkCollisions();
    
    // Check if all stars missed
    this.checkMissedStars();
  }
  
  updatePlayer(deltaTime) {
    // Determine movement direction
    let moveDir = 0;
    
    if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A'] || this.touchLeft) {
      moveDir = -1;
    } else if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D'] || this.touchRight) {
      moveDir = 1;
    }
    
    // Move player
    this.player.x += moveDir * this.player.speed;
    
    // Clamp to screen bounds
    this.player.x = Math.max(0, Math.min(this.canvasWidth - this.player.width, this.player.x));
  }
  
  updateStars(deltaTime) {
    this.stars.forEach(star => {
      star.y += star.speed;
      star.rotation += deltaTime * 0.5;
    });
  }
  
  checkCollisions() {
    const playerRect = {
      x: this.player.x,
      y: this.player.y,
      width: this.player.width,
      height: this.player.height
    };
    
    for (let i = this.stars.length - 1; i >= 0; i--) {
      const star = this.stars[i];
      
      // Check collision with player
      if (this.rectsOverlap(playerRect, star)) {
        if (star.isCorrect) {
          this.handleCorrectAnswer();
        } else {
          this.handleWrongAnswer();
        }
        
        // Remove this star and generate new problem
        this.stars.splice(i, 1);
        
        // Small delay before new problem
        setTimeout(() => {
          if (this.isPlaying) {
            this.generateProblem();
          }
        }, 500);
        
        return;
      }
    }
  }
  
  checkMissedStars() {
    // Check if correct answer fell off screen
    const correctStar = this.stars.find(s => s.isCorrect);
    
    if (correctStar && correctStar.y > this.canvasHeight + 50) {
      // Missed the correct answer
      this.combo = 0;
      
      // Generate new problem
      this.generateProblem();
    }
    
    // Remove stars that fell off screen
    this.stars = this.stars.filter(star => star.y < this.canvasHeight + 100);
  }
  
  rectsOverlap(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }
  
  handleCorrectAnswer() {
    this.combo++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.correctAnswers++;
    
    // Calculate score with combo multiplier
    const multiplier = this.getComboMultiplier();
    const points = Math.round(100 * multiplier);
    this.score += points;
    
    this.playSound('correct');
  }
  
  handleWrongAnswer() {
    this.combo = 0;
    this.wrongAnswers++;
    this.lives--;
    this.score = Math.max(0, this.score - 50);
    
    this.playSound('wrong');
    
    if (this.lives <= 0) {
      this.endGame();
    }
  }
  
  getComboMultiplier() {
    if (this.combo >= 10) return 5;
    if (this.combo >= 5) return 3;
    if (this.combo >= 3) return 2;
    if (this.combo >= 2) return 1.5;
    return 1;
  }
  
  render() {
    // Clear canvas
    this.ctx.fillStyle = '#0a0a1e';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Draw starry background
    this.renderBackground();
    
    // Draw question
    this.renderQuestion();
    
    // Draw stars
    this.renderStars();
    
    // Draw player
    this.renderPlayer();
    
    // Draw UI
    this.renderUI();
  }
  
  renderBackground() {
    // Draw gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    gradient.addColorStop(0, '#0a0a1e');
    gradient.addColorStop(0.5, '#1a1a3e');
    gradient.addColorStop(1, '#0f0f2e');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Draw some background stars
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let i = 0; i < 50; i++) {
      const x = (i * 73) % this.canvasWidth;
      const y = (i * 47) % this.canvasHeight;
      const size = (i % 3) + 1;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
  
  renderQuestion() {
    if (!this.currentProblem) return;
    
    // Question background
    const qWidth = 280;
    const qHeight = 60;
    const qX = (this.canvasWidth - qWidth) / 2;
    const qY = 80;
    
    this.ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
    this.ctx.strokeStyle = '#FFD700';
    this.ctx.lineWidth = 2;
    this.roundRect(qX, qY, qWidth, qHeight, 15, true, true);
    
    // Question text
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(this.currentProblem.question, this.canvasWidth / 2, qY + qHeight / 2);
  }
  
  renderStars() {
    this.stars.forEach(star => {
      this.ctx.save();
      this.ctx.translate(star.x + star.width / 2, star.y + star.height / 2);
      this.ctx.rotate(star.rotation);
      
      // Star glow
      const glowColor = star.isCorrect ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 255, 255, 0.2)';
      this.ctx.shadowColor = glowColor;
      this.ctx.shadowBlur = 20;
      
      // Star shape
      this.drawStar(0, 0, 5, 25, 12);
      
      // Fill star
      this.ctx.fillStyle = star.isCorrect ? '#FFD700' : '#87CEEB';
      this.ctx.fill();
      
      this.ctx.shadowBlur = 0;
      
      // Number on star
      this.ctx.fillStyle = '#1a1a2e';
      this.ctx.font = 'bold 18px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      
      // Format the value (handle decimals for fractions)
      let displayValue = star.value;
      if (typeof displayValue === 'number' && !Number.isInteger(displayValue)) {
        displayValue = displayValue.toFixed(1);
      }
      this.ctx.fillText(displayValue.toString(), 0, 2);
      
      this.ctx.restore();
    });
  }
  
  drawStar(cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;
    
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - outerRadius);
    
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      this.ctx.lineTo(x, y);
      rot += step;
      
      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      this.ctx.lineTo(x, y);
      rot += step;
    }
    
    this.ctx.lineTo(cx, cy - outerRadius);
    this.ctx.closePath();
  }
  
  renderPlayer() {
    const px = this.player.x;
    const py = this.player.y;
    
    // Draw Cinnamoroll (simplified)
    this.ctx.font = '45px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('🐰', px + this.player.width / 2, py + this.player.height / 2);
    
    // Platform
    this.ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
    this.ctx.fillRect(px - 5, py + this.player.height - 5, this.player.width + 10, 8);
  }
  
  renderUI() {
    // Top bar background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvasWidth, 60);
    
    // Lives
    this.ctx.font = '24px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillStyle = '#FF6B6B';
    let heartsText = '';
    for (let i = 0; i < this.lives; i++) heartsText += '❤️';
    for (let i = this.lives; i < DIFFICULTY_PRESETS[this.difficulty].lives; i++) heartsText += '🖤';
    this.ctx.fillText(heartsText, 15, 35);
    
    // Score
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Score: ${this.score}`, this.canvasWidth / 2, 35);
    
    // Combo
    if (this.combo > 1) {
      this.ctx.fillStyle = '#00FF00';
      this.ctx.font = 'bold 18px Arial';
      this.ctx.textAlign = 'right';
      this.ctx.fillText(`×${this.getComboMultiplier()}`, this.canvasWidth - 15, 35);
    }
  }
  
  roundRect(x, y, width, height, radius, fill, stroke) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    if (fill) this.ctx.fill();
    if (stroke) this.ctx.stroke();
  }
  
  endGame() {
    this.isPlaying = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    // Calculate stats
    const totalAttempts = this.correctAnswers + this.wrongAnswers;
    const accuracy = totalAttempts > 0 ? Math.round((this.correctAnswers / totalAttempts) * 100) : 0;
    
    // Calculate stars
    let stars = 1;
    if (accuracy >= 90 && this.maxCombo >= 5) stars = 3;
    else if (accuracy >= 70 && this.maxCombo >= 3) stars = 2;
    
    // Update result screen
    this.elements.finalScore.textContent = this.score;
    this.elements.finalCorrect.textContent = this.correctAnswers;
    this.elements.finalCombo.textContent = `${this.maxCombo}x`;
    this.elements.finalAccuracy.textContent = `${accuracy}%`;
    
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
    if (this.score > highScore) {
      this.saveHighScore(this.score);
      this.elements.newRecord.classList.remove('hidden');
    } else {
      this.elements.newRecord.classList.add('hidden');
    }
    
    // Save progress for career assessment
    this.saveProgress(stars);
    
    this.playSound('end');
    
    setTimeout(() => {
      this.showScreen('result');
    }, 500);
  }
  
  goHome() {
    this.isPlaying = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    // Stop background music
    if (this.audio) {
      try {
        this.audio.stopMusic();
      } catch (e) {
        // Silently ignore
      }
    }
    
    this.loadHighScore();
    this.showScreen('start');
  }
  
  playSound(type) {
    if (!this.sfxEnabled) return;
    
    // Use GameAudioManager if available
    if (this.audio) {
      try {
        this.audio.ensureReady();
        const soundMap = {
          correct: 'correct',
          wrong: 'wrong',
          end: 'gameover'
        };
        this.audio.playSFX(soundMap[type] || type);
      } catch (e) {
        // Silently ignore audio errors
      }
      return;
    }
    
    // Fallback to basic audio
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      const sounds = {
        correct: { freq: 880, duration: 0.15 },
        wrong: { freq: 220, duration: 0.3 },
        end: { freq: 440, duration: 0.5 }
      };
      
      const sound = sounds[type] || sounds.correct;
      
      oscillator.frequency.value = sound.freq;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + sound.duration);
    } catch (e) {
      // Audio not supported
    }
  }
  
  getHighScore() {
    const key = `starCounterHighScore_${this.difficulty}`;
    return parseInt(localStorage.getItem(key) || '0');
  }
  
  saveHighScore(score) {
    const key = `starCounterHighScore_${this.difficulty}`;
    localStorage.setItem(key, score.toString());
  }
  
  loadHighScore() {
    let age = 16;
    if (typeof PlayerManager !== 'undefined' && PlayerManager.hasActivePlayer()) {
      age = PlayerManager.getPlayerAge() || 16;
    }
    const diff = getDifficultyFromAge(age);
    const key = `starCounterHighScore_${diff}`;
    const highScore = localStorage.getItem(key) || '0';
    this.elements.highScoreDisplay.textContent = highScore;
  }
  
  saveProgress(stars) {
    const key = 'starCounterProgress';
    const existing = JSON.parse(localStorage.getItem(key) || '{}');
    
    existing.gamesPlayed = (existing.gamesPlayed || 0) + 1;
    existing.totalScore = (existing.totalScore || 0) + this.score;
    existing.totalStars = (existing.totalStars || 0) + stars;
    existing.totalCorrect = (existing.totalCorrect || 0) + this.correctAnswers;
    existing.lastPlayed = new Date().toISOString();
    
    localStorage.setItem(key, JSON.stringify(existing));
  }
}

// Math Problem Generator
class MathProblemGenerator {
  constructor(difficulty, settings) {
    this.difficulty = difficulty;
    this.settings = settings;
  }
  
  generate() {
    switch (this.settings.mathType) {
      case 'recognition':
        return this.numberRecognition();
      case 'addition':
        return this.simpleAddition();
      case 'addSubtract':
        return this.additionSubtraction();
      case 'multiplyDivide':
        return this.multiplicationDivision();
      case 'mixed':
        return this.mixedOperations();
      case 'fractionsPercent':
        return this.fractionsPercents();
      case 'algebra':
        return this.basicAlgebra();
      default:
        return this.simpleAddition();
    }
  }
  
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  numberRecognition() {
    const target = this.randomInt(1, 10);
    return {
      question: `Find the number ${target}!`,
      answer: target,
      distractors: this.generateDistractors(target, 1, 10, 2)
    };
  }
  
  simpleAddition() {
    const [min, max] = this.settings.numberRange || [1, 10];
    const a = this.randomInt(min, max);
    const b = this.randomInt(min, max);
    const answer = a + b;
    return {
      question: `${a} + ${b} = ?`,
      answer,
      distractors: this.generateDistractors(answer, 2, max * 2, 2)
    };
  }
  
  additionSubtraction() {
    const [min, max] = this.settings.numberRange || [1, 20];
    const isAddition = Math.random() > 0.5;
    
    if (isAddition) {
      const a = this.randomInt(min, max);
      const b = this.randomInt(min, max);
      return {
        question: `${a} + ${b} = ?`,
        answer: a + b,
        distractors: this.generateDistractors(a + b, 2, max * 2, 3)
      };
    } else {
      const a = this.randomInt(min + 5, max);
      const b = this.randomInt(min, a);
      return {
        question: `${a} - ${b} = ?`,
        answer: a - b,
        distractors: this.generateDistractors(a - b, 0, max, 3)
      };
    }
  }
  
  multiplicationDivision() {
    const isMultiply = Math.random() > 0.4;
    
    if (isMultiply) {
      const a = this.randomInt(2, 12);
      const b = this.randomInt(2, 12);
      const answer = a * b;
      return {
        question: `${a} × ${b} = ?`,
        answer,
        distractors: [
          a * (b - 1),
          a * (b + 1),
          (a - 1) * b
        ].filter(d => d !== answer && d > 0)
      };
    } else {
      const b = this.randomInt(2, 12);
      const answer = this.randomInt(2, 12);
      const a = b * answer;
      return {
        question: `${a} ÷ ${b} = ?`,
        answer,
        distractors: [answer - 1, answer + 1, answer + 2].filter(d => d > 0)
      };
    }
  }
  
  mixedOperations() {
    const type = this.randomInt(1, 4);
    
    switch (type) {
      case 1: return this.simpleAddition();
      case 2: return this.additionSubtraction();
      case 3: return this.multiplicationDivision();
      case 4: {
        // Order of operations: (a + b) × c
        const a = this.randomInt(1, 5);
        const b = this.randomInt(1, 5);
        const c = this.randomInt(2, 4);
        const answer = (a + b) * c;
        return {
          question: `(${a} + ${b}) × ${c} = ?`,
          answer,
          distractors: [
            a + b * c,  // Common mistake
            answer + c,
            answer - c
          ].filter(d => d !== answer && d > 0)
        };
      }
    }
  }
  
  fractionsPercents() {
    const type = this.randomInt(1, 2);
    
    if (type === 1) {
      // Percentages
      const percents = [10, 20, 25, 50, 75];
      const percent = percents[this.randomInt(0, percents.length - 1)];
      const whole = this.randomInt(2, 10) * 10;
      const answer = (percent / 100) * whole;
      return {
        question: `${percent}% of ${whole} = ?`,
        answer,
        distractors: this.generateDistractors(answer, 0, whole, 3)
      };
    } else {
      // Simple fractions
      const denominator = [2, 4, 5][this.randomInt(0, 2)];
      const numerator = this.randomInt(1, denominator - 1);
      const whole = denominator * this.randomInt(2, 5);
      const answer = (numerator / denominator) * whole;
      return {
        question: `${numerator}/${denominator} of ${whole} = ?`,
        answer,
        distractors: this.generateDistractors(answer, 0, whole, 3)
      };
    }
  }
  
  basicAlgebra() {
    const x = this.randomInt(1, 15);
    const b = this.randomInt(1, 10);
    const type = this.randomInt(1, 2);
    
    if (type === 1) {
      // x + b = result
      const result = x + b;
      return {
        question: `x + ${b} = ${result}, x = ?`,
        answer: x,
        distractors: [result, b, x + 1, x - 1].filter(d => d !== x && d > 0).slice(0, 3)
      };
    } else {
      // x - b = result
      const result = x - b;
      if (result <= 0) return this.basicAlgebra(); // Retry
      return {
        question: `x - ${b} = ${result}, x = ?`,
        answer: x,
        distractors: [result, b, x + b, result + 1].filter(d => d !== x && d > 0).slice(0, 3)
      };
    }
  }
  
  generateDistractors(answer, min, max, count) {
    const distractors = new Set();
    let attempts = 0;
    
    while (distractors.size < count && attempts < 20) {
      let distractor;
      if (Math.random() > 0.5) {
        // Close to answer
        distractor = answer + this.randomInt(-3, 3);
      } else {
        // Random in range
        distractor = this.randomInt(min, max);
      }
      
      if (distractor !== answer && distractor >= min && distractor <= max) {
        distractors.add(distractor);
      }
      attempts++;
    }
    
    // Fill remaining with sequential numbers if needed
    let fill = 1;
    while (distractors.size < count) {
      if (answer + fill !== answer && answer + fill >= min) {
        distractors.add(answer + fill);
      }
      fill++;
    }
    
    return Array.from(distractors).slice(0, count);
  }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.game = new StarCounterGame();
});
