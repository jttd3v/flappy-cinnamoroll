# Cinnamoroll's Star Counter - AI Coding Assistant Skills Guide

> Skills and knowledge required to build this math arcade game

---

## 🎯 Required Skills Overview

| Category | Skill | Level | Priority |
|----------|-------|-------|----------|
| **JavaScript** | ES6 Classes | Intermediate | HIGH |
| **JavaScript** | requestAnimationFrame | Intermediate | HIGH |
| **JavaScript** | Object Pooling | Intermediate | MEDIUM |
| **Math** | Problem Generation | Intermediate | HIGH |
| **Physics** | Gravity Simulation | Basic | HIGH |
| **Canvas** | 2D Rendering | Intermediate | HIGH |
| **Input** | Keyboard Handling | Intermediate | HIGH |
| **Input** | Touch/Tilt Controls | Intermediate | MEDIUM |
| **Architecture** | Game Loop | Intermediate | HIGH |

---

## 📚 Detailed Skill Requirements

### 1. Game Loop Architecture

**What the AI needs to know:**
```javascript
class StarCounterGame extends GameEngine {
  constructor() {
    super(STAR_CONFIG, 'gameCanvas');
    this.lastSpawnTime = 0;
    this.spawnInterval = 2000; // ms between star spawns
  }
  
  onUpdate(deltaTime) {
    // 1. Update problem/spawn logic
    this.updateSpawning(deltaTime);
    
    // 2. Update all falling stars
    this.stars.forEach(star => {
      this.physics.applyGravity(star);
      this.physics.applyVelocity(star);
    });
    
    // 3. Update player position
    this.updatePlayer(deltaTime);
    
    // 4. Check collisions
    this.checkCollisions();
    
    // 5. Remove off-screen stars
    this.cleanupStars();
    
    // 6. Check game over
    if (this.lives <= 0) {
      this.gameOver();
    }
  }
  
  onRender(ctx) {
    this.clearCanvas();
    this.renderBackground(ctx);
    this.renderProblem(ctx);
    this.renderStars(ctx);
    this.renderPlayer(ctx);
    this.renderUI(ctx);
  }
}
```

**Key concepts:**
- Delta time for frame-independent movement
- Update/render separation
- Entity lifecycle management

---

### 2. Math Problem Generator

**What the AI needs to know:**
```javascript
class MathProblemGenerator {
  constructor(difficulty) {
    this.difficulty = difficulty;
  }
  
  generate() {
    switch(this.difficulty) {
      case 1: return this.numberRecognition();
      case 2: return this.simpleAddition();
      case 3: return this.additionSubtraction();
      case 4: return this.multiplication();
      case 5: return this.mixedOperations();
      case 6: return this.fractionsPercents();
      case 7: return this.basicAlgebra();
    }
  }
  
  // Level 1: "Find the number 5"
  numberRecognition() {
    const target = MathUtils.randomInt(1, 10);
    return {
      question: `Find the number ${target}!`,
      answer: target,
      distractors: this.generateDistractors(target, 1, 10, 2)
    };
  }
  
  // Level 2: "3 + 4 = ?"
  simpleAddition() {
    const a = MathUtils.randomInt(1, 10);
    const b = MathUtils.randomInt(1, 10);
    const answer = a + b;
    return {
      question: `${a} + ${b} = ?`,
      answer,
      distractors: this.generateDistractors(answer, 2, 20, 2)
    };
  }
  
  // Level 4: "6 × 7 = ?"
  multiplication() {
    const a = MathUtils.randomInt(2, 12);
    const b = MathUtils.randomInt(2, 12);
    const answer = a * b;
    return {
      question: `${a} × ${b} = ?`,
      answer,
      distractors: this.generateMultiplicationDistractors(a, b, answer)
    };
  }
  
  // Generate believable wrong answers
  generateDistractors(answer, min, max, count) {
    const distractors = new Set();
    while (distractors.size < count) {
      // Close to answer (±1-3)
      let distractor = answer + MathUtils.randomInt(-3, 3);
      if (distractor !== answer && distractor >= min && distractor <= max) {
        distractors.add(distractor);
      }
    }
    return Array.from(distractors);
  }
  
  // Multiplication distractors use common mistakes
  generateMultiplicationDistractors(a, b, answer) {
    return [
      a * (b - 1),    // Off by one factor
      a * (b + 1),    // Off by one factor
      (a - 1) * b,    // Off by one factor
      a + b           // Addition mistake
    ].filter(d => d !== answer && d > 0).slice(0, 3);
  }
  
  // Level 6: "50% of 80 = ?"
  percentages() {
    const percentages = [10, 20, 25, 50, 75, 100];
    const percent = MathUtils.randomPick(percentages);
    const whole = MathUtils.randomInt(2, 20) * 10; // Multiples of 10
    const answer = (percent / 100) * whole;
    return {
      question: `${percent}% of ${whole} = ?`,
      answer,
      distractors: this.generateDistractors(answer, 0, whole, 3)
    };
  }
  
  // Level 7: "x + 5 = 12, x = ?"
  basicAlgebra() {
    const x = MathUtils.randomInt(1, 20);
    const b = MathUtils.randomInt(1, 10);
    const result = x + b;
    return {
      question: `x + ${b} = ${result}, x = ?`,
      answer: x,
      distractors: [result, b, result - b + 1, result + b]
        .filter(d => d !== x && d > 0)
        .slice(0, 3)
    };
  }
}
```

**Key concepts:**
- Difficulty-appropriate problem types
- Believable distractors (common mistakes)
- Avoiding duplicate answers
- Clean mathematical operations

---

### 3. Falling Star Entity

**What the AI needs to know:**
```javascript
import { CharacterBase } from '../../characters/shared/CharacterBase.js';

class FallingStar extends CharacterBase {
  constructor(options) {
    super({
      x: options.x,
      y: options.y || -60,
      width: 60,
      height: 60
    });
    
    this.value = options.value;
    this.isCorrect = options.isCorrect;
    this.speed = options.speed || 2;
    this.rotation = 0;
    this.rotationSpeed = MathUtils.randomFloat(-0.02, 0.02);
    
    // Visual properties
    this.color = this.isCorrect ? '#FFD700' : '#FFA500';
    this.glowIntensity = this.isCorrect ? 0.3 : 0;
  }
  
  update(deltaTime) {
    // Fall down
    this.y += this.speed * deltaTime;
    
    // Rotate
    this.rotation += this.rotationSpeed * deltaTime;
    
    // Gentle horizontal sway
    this.x += Math.sin(this.y * 0.02) * 0.5;
  }
  
  render(ctx) {
    ctx.save();
    ctx.translate(this.x + this.width/2, this.y + this.height/2);
    ctx.rotate(this.rotation);
    
    // Glow effect (for correct answer hint on easy mode)
    if (this.glowIntensity > 0) {
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 20 * this.glowIntensity;
    }
    
    // Draw star shape
    this.drawStar(ctx, 0, 0, 5, this.width/2, this.width/4);
    
    // Draw number
    ctx.fillStyle = '#000';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.value.toString(), 0, 0);
    
    ctx.restore();
  }
  
  drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;
    
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;
      
      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  isOffScreen(canvasHeight) {
    return this.y > canvasHeight + this.height;
  }
}
```

**Key concepts:**
- Extending CharacterBase
- Star polygon drawing
- Rotation animation
- Glow effects

---

### 4. Player Movement & Collision

**What the AI needs to know:**
```javascript
class Player {
  constructor(config, canvasWidth, canvasHeight) {
    this.x = canvasWidth / 2;
    this.y = canvasHeight - 80;
    this.width = 50;
    this.height = 50;
    this.speed = 8;
    this.canvasWidth = canvasWidth;
    
    // Visual state
    this.facing = 'right';
    this.catching = false;
    this.catchTimer = 0;
  }
  
  handleInput(input) {
    let dx = 0;
    
    // Keyboard
    if (input.isKeyDown('ArrowLeft') || input.isKeyDown('KeyA')) {
      dx = -this.speed;
      this.facing = 'left';
    }
    if (input.isKeyDown('ArrowRight') || input.isKeyDown('KeyD')) {
      dx = this.speed;
      this.facing = 'right';
    }
    
    // Apply movement with bounds
    this.x = MathUtils.clamp(
      this.x + dx,
      this.width / 2,
      this.canvasWidth - this.width / 2
    );
  }
  
  update(deltaTime) {
    // Update catch animation timer
    if (this.catching) {
      this.catchTimer -= deltaTime;
      if (this.catchTimer <= 0) {
        this.catching = false;
      }
    }
  }
  
  triggerCatch(correct) {
    this.catching = true;
    this.catchTimer = 300;
    this.catchResult = correct ? 'happy' : 'sad';
  }
  
  getHitbox() {
    // Slightly larger hitbox for forgiving gameplay
    return {
      x: this.x - this.width / 2 - 10,
      y: this.y - this.height / 2,
      width: this.width + 20,
      height: this.height + 10
    };
  }
}

// In game class
checkCollisions() {
  const playerHitbox = this.player.getHitbox();
  
  for (let i = this.stars.length - 1; i >= 0; i--) {
    const star = this.stars[i];
    
    if (Collision.checkAABB(playerHitbox, star.getHitbox())) {
      // Remove star
      this.stars.splice(i, 1);
      
      if (star.isCorrect) {
        this.onCorrectCatch();
      } else {
        this.onWrongCatch();
      }
      
      this.player.triggerCatch(star.isCorrect);
      break; // Only catch one star per frame
    }
  }
}
```

**Key concepts:**
- Continuous keyboard input
- Boundary clamping
- Forgiving hitboxes
- Collision response

---

### 5. Spawn Management & Object Pooling

**What the AI needs to know:**
```javascript
class StarSpawner {
  constructor(config) {
    this.config = config;
    this.pool = [];
    this.maxPoolSize = 20;
  }
  
  // Reuse stars from pool instead of creating new
  getStar(options) {
    let star = this.pool.find(s => !s.active);
    
    if (star) {
      star.reset(options);
    } else if (this.pool.length < this.maxPoolSize) {
      star = new FallingStar(options);
      this.pool.push(star);
    } else {
      // Pool full, create temporary
      star = new FallingStar(options);
    }
    
    star.active = true;
    return star;
  }
  
  release(star) {
    star.active = false;
  }
  
  spawnForProblem(problem, canvasWidth) {
    const stars = [];
    const allValues = [problem.answer, ...problem.distractors];
    const shuffled = MathUtils.shuffle(allValues);
    
    // Distribute stars across width
    const spacing = canvasWidth / (shuffled.length + 1);
    
    shuffled.forEach((value, index) => {
      const star = this.getStar({
        x: spacing * (index + 1) - 30,
        y: -60 - MathUtils.randomInt(0, 100), // Stagger heights
        value: value,
        isCorrect: value === problem.answer,
        speed: this.config.starSpeed
      });
      stars.push(star);
    });
    
    return stars;
  }
}
```

**Key concepts:**
- Object pooling for performance
- Star positioning across screen
- Staggered spawn heights

---

### 6. Score & Combo System

**What the AI needs to know:**
```javascript
class ScoreManager {
  constructor() {
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
  }
  
  getMultiplier() {
    if (this.combo >= 10) return 5;
    if (this.combo >= 5) return 3;
    if (this.combo >= 3) return 2;
    if (this.combo >= 2) return 1.5;
    return 1;
  }
  
  correct() {
    this.combo++;
    this.correctCount++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    
    const points = Math.round(100 * this.getMultiplier());
    this.score += points;
    
    return {
      points,
      multiplier: this.getMultiplier(),
      combo: this.combo
    };
  }
  
  wrong() {
    const oldCombo = this.combo;
    this.combo = 0;
    this.wrongCount++;
    this.score = Math.max(0, this.score - 50);
    
    return {
      points: -50,
      comboLost: oldCombo
    };
  }
  
  getStats() {
    return {
      score: this.score,
      combo: this.combo,
      maxCombo: this.maxCombo,
      accuracy: this.correctCount / (this.correctCount + this.wrongCount) || 0
    };
  }
}
```

---

### 7. Touch/Tilt Controls (Mobile)

**What the AI needs to know:**
```javascript
class MobileControls {
  constructor(canvas, player) {
    this.canvas = canvas;
    this.player = player;
    this.touchX = null;
    this.usesTilt = false;
    this.tiltCalibration = 0;
    
    this.setupTouchControls();
    this.setupTiltControls();
  }
  
  setupTouchControls() {
    // Touch regions (left/right halves)
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      
      if (x < rect.width / 2) {
        this.touchDirection = 'left';
      } else {
        this.touchDirection = 'right';
      }
    });
    
    this.canvas.addEventListener('touchend', () => {
      this.touchDirection = null;
    });
  }
  
  setupTiltControls() {
    if (window.DeviceOrientationEvent) {
      // Request permission (iOS 13+)
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // Show button to request permission
        this.showTiltPermissionButton();
      } else {
        this.enableTilt();
      }
    }
  }
  
  enableTilt() {
    window.addEventListener('deviceorientation', (e) => {
      if (this.usesTilt) {
        // gamma is left/right tilt (-90 to 90)
        const tilt = e.gamma - this.tiltCalibration;
        this.tiltValue = MathUtils.clamp(tilt / 30, -1, 1); // Normalize
      }
    });
  }
  
  calibrateTilt() {
    // Set current position as "center"
    this.tiltCalibration = this.currentGamma || 0;
  }
  
  getMovement() {
    // Priority: tilt > touch > none
    if (this.usesTilt && this.tiltValue !== undefined) {
      return this.tiltValue * this.player.speed;
    }
    
    if (this.touchDirection === 'left') return -this.player.speed;
    if (this.touchDirection === 'right') return this.player.speed;
    
    return 0;
  }
}
```

**Key concepts:**
- Touch regions
- DeviceOrientation API
- iOS permission handling
- Tilt calibration

---

### 8. UI Rendering

**What the AI needs to know:**
```javascript
renderUI(ctx) {
  // Problem display
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillRect(100, 20, 200, 50);
  ctx.strokeStyle = '#FFB6C1';
  ctx.lineWidth = 3;
  ctx.strokeRect(100, 20, 200, 50);
  
  ctx.fillStyle = '#333';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(this.currentProblem.question, 200, 52);
  
  // Score
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Score: ${this.score}`, 10, 30);
  
  // Combo
  if (this.combo > 1) {
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`×${this.scoreManager.getMultiplier()}`, 390, 30);
    ctx.fillText(`Combo: ${this.combo}`, 390, 55);
  }
  
  // Lives (hearts)
  for (let i = 0; i < this.maxLives; i++) {
    const x = 10 + i * 30;
    const y = 50;
    ctx.font = '24px Arial';
    ctx.fillText(i < this.lives ? '❤️' : '🖤', x, y);
  }
}

// Floating score popup
showScorePopup(x, y, points, isPositive) {
  this.popups.push({
    x, y,
    text: isPositive ? `+${points}` : `${points}`,
    color: isPositive ? '#4CAF50' : '#F44336',
    alpha: 1,
    vy: -2
  });
}

updatePopups(deltaTime) {
  this.popups.forEach(popup => {
    popup.y += popup.vy;
    popup.alpha -= 0.02;
  });
  this.popups = this.popups.filter(p => p.alpha > 0);
}
```

---

## 📦 File Structure to Create

```
games/star-counter/
├── index.html
├── StarCounterGame.js       # Main game class
├── star-counter.config.js   # Configuration
├── star-counter.styles.css  # Styles
├── components/
│   ├── FallingStar.js       # Star entity
│   ├── Player.js            # Player entity
│   ├── StarSpawner.js       # Spawn management
│   └── MobileControls.js    # Touch/tilt
├── systems/
│   ├── MathProblemGenerator.js
│   └── ScoreManager.js
├── PRD.md
├── SKILLS.md
└── README.md
```

---

## ⚠️ Common Pitfalls

1. **Division by zero** - Validate generated problems
2. **Duplicate answers** - Ensure distractors ≠ answer
3. **Stars overlapping** - Stagger spawn positions
4. **Too hard/easy** - Test difficulty progression
5. **Mobile performance** - Limit particle effects
6. **Tilt sensitivity** - Allow calibration

---

## 🎓 Learning Resources

- [Canvas Game Loop](https://developer.mozilla.org/en-US/docs/Games/Anatomy)
- [DeviceOrientation API](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent)
- [Object Pooling Pattern](https://gameprogrammingpatterns.com/object-pool.html)
- [Math Problem Generation](https://en.wikipedia.org/wiki/Math_game)
