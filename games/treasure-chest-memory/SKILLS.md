# Treasure Chest Memory - AI Coding Assistant Skills Guide

> Skills and knowledge required to build this game

---

## 🎯 Required Skills Overview

| Category | Skill | Level | Priority |
|----------|-------|-------|----------|
| **JavaScript** | ES6+ Modules | Intermediate | HIGH |
| **JavaScript** | Array Methods | Intermediate | HIGH |
| **JavaScript** | Event Handling | Intermediate | HIGH |
| **JavaScript** | Async/Await | Basic | MEDIUM |
| **CSS** | Flexbox/Grid | Intermediate | HIGH |
| **CSS** | 3D Transforms | Intermediate | HIGH |
| **CSS** | Animations | Intermediate | HIGH |
| **HTML** | Semantic HTML5 | Basic | MEDIUM |
| **Architecture** | State Management | Intermediate | HIGH |
| **Architecture** | Event-Driven Design | Intermediate | HIGH |

---

## 📚 Detailed Skill Requirements

### 1. JavaScript ES6+ Modules

**What the AI needs to know:**
```javascript
// Importing from core modules
import { EventSystem, GameEvents } from '../../core/engine/EventSystem.js';
import { SoundManager, SoundType } from '../../core/audio/SoundManager.js';
import { Leaderboard } from '../../core/storage/Leaderboard.js';

// Exporting game class
export class TreasureChestMemory extends GameEngine {
  // ...
}
export default TreasureChestMemory;
```

**Key concepts:**
- Named vs default exports
- Relative path imports
- Module dependency management

---

### 2. Array Methods for Card Management

**What the AI needs to know:**
```javascript
// Fisher-Yates shuffle
function shuffleCards(cards) {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Create pairs
function createCardPairs(images, pairCount) {
  const selectedImages = images.slice(0, pairCount);
  const pairs = [...selectedImages, ...selectedImages]; // Duplicate for pairs
  return shuffleCards(pairs).map((img, index) => ({
    id: index,
    pairId: img,
    image: img,
    state: 'hidden'
  }));
}

// Find matches
const flippedCards = cards.filter(c => c.state === 'flipped');
const isMatch = flippedCards[0].pairId === flippedCards[1].pairId;

// Check win condition
const allMatched = cards.every(c => c.state === 'matched');
```

**Key methods:**
- `map()`, `filter()`, `every()`, `some()`
- `slice()`, `splice()`, spread operator
- Array destructuring

---

### 3. Event Handling

**What the AI needs to know:**
```javascript
// Card click handling
setupCardListeners() {
  this.cardElements.forEach((cardEl, index) => {
    cardEl.addEventListener('click', () => this.handleCardClick(index));
    cardEl.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handleCardClick(index);
    }, { passive: false });
  });
}

// Keyboard accessibility
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    this.flipFocusedCard();
  }
  if (e.key === 'ArrowRight') this.moveFocus(1);
  if (e.key === 'ArrowLeft') this.moveFocus(-1);
});

// Custom game events
EventSystem.emit(GameEvents.SCORE_UPDATE, { score: this.score });
EventSystem.on('cardMatched', (data) => this.celebrateMatch(data));
```

**Key concepts:**
- Event delegation
- Touch vs mouse events
- Custom event systems
- Event prevention

---

### 4. CSS Grid Layout

**What the AI needs to know:**
```css
/* Dynamic grid based on difficulty */
.card-grid {
  display: grid;
  gap: 10px;
  padding: 20px;
  justify-content: center;
}

/* 2x3 grid for easy */
.card-grid[data-cols="2"] {
  grid-template-columns: repeat(2, 80px);
}

/* 3x4 grid for medium */
.card-grid[data-cols="3"] {
  grid-template-columns: repeat(3, 80px);
}

/* 4x4 grid for hard */
.card-grid[data-cols="4"] {
  grid-template-columns: repeat(4, 70px);
}

/* Responsive sizing */
@media (max-width: 400px) {
  .card-grid[data-cols="4"] {
    grid-template-columns: repeat(4, 60px);
  }
}
```

**Key concepts:**
- `grid-template-columns`, `grid-template-rows`
- `repeat()` function
- `gap` property
- Responsive grid adjustments

---

### 5. CSS 3D Transforms (Card Flip)

**What the AI needs to know:**
```css
/* Card container needs perspective */
.card {
  width: 80px;
  height: 100px;
  perspective: 1000px;
  cursor: pointer;
}

/* Inner card does the flip */
.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease;
  transform-style: preserve-3d;
}

/* Flipped state */
.card.flipped .card-inner {
  transform: rotateY(180deg);
}

/* Front and back faces */
.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 10px;
}

/* Back is the default view (treasure chest) */
.card-back {
  background: linear-gradient(145deg, #8B4513, #654321);
}

/* Front shows the image (rotated 180deg to show when flipped) */
.card-front {
  background: white;
  transform: rotateY(180deg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
}

/* Matched state */
.card.matched .card-inner {
  transform: rotateY(180deg);
  box-shadow: 0 0 20px gold;
}
```

**Key concepts:**
- `perspective` property
- `transform-style: preserve-3d`
- `backface-visibility: hidden`
- `rotateY()` transform
- Transition timing

---

### 6. CSS Animations

**What the AI needs to know:**
```css
/* Shake animation for wrong match */
@keyframes shake {
  0%, 100% { transform: rotateY(180deg) translateX(0); }
  25% { transform: rotateY(180deg) translateX(-5px); }
  75% { transform: rotateY(180deg) translateX(5px); }
}

.card.wrong .card-inner {
  animation: shake 0.3s ease;
}

/* Celebration pulse for match */
@keyframes pulse {
  0% { transform: rotateY(180deg) scale(1); }
  50% { transform: rotateY(180deg) scale(1.1); }
  100% { transform: rotateY(180deg) scale(1); }
}

.card.matched .card-inner {
  animation: pulse 0.5s ease;
}

/* Sparkle effect */
@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
}

.sparkle {
  animation: sparkle 0.6s ease forwards;
}
```

**Key concepts:**
- `@keyframes` definition
- Animation properties (duration, timing, iteration)
- Transform combinations
- Animation triggers via class toggle

---

### 7. State Management

**What the AI needs to know:**
```javascript
class MemoryGame {
  constructor() {
    // Immutable config
    this.config = Object.freeze({
      flipDelay: 1000,
      previewTime: 3000,
      baseScore: 1000,
      flipPenalty: 10
    });
    
    // Mutable state
    this.state = {
      cards: [],
      flippedCards: [],
      matchedPairs: 0,
      flips: 0,
      score: 1000,
      isLocked: false,  // Prevent clicks during animation
      gamePhase: 'idle' // 'idle' | 'preview' | 'playing' | 'ended'
    };
  }
  
  // State update pattern
  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.render();
  }
  
  // Lock during async operations
  async flipCard(cardIndex) {
    if (this.state.isLocked) return;
    if (this.state.cards[cardIndex].state !== 'hidden') return;
    
    this.setState({ isLocked: true });
    
    // Flip animation
    await this.animateFlip(cardIndex);
    
    // Check for match...
    
    this.setState({ isLocked: false });
  }
}
```

**Key concepts:**
- Centralized state object
- Immutable updates
- UI locking during animations
- Game phase management

---

### 8. Timer Implementation

**What the AI needs to know:**
```javascript
class GameTimer {
  constructor(onTick, onComplete) {
    this.startTime = null;
    this.elapsed = 0;
    this.limit = null;
    this.rafId = null;
    this.onTick = onTick;
    this.onComplete = onComplete;
  }
  
  start(limitSeconds = null) {
    this.startTime = performance.now();
    this.limit = limitSeconds ? limitSeconds * 1000 : null;
    this.tick();
  }
  
  tick() {
    this.elapsed = performance.now() - this.startTime;
    
    if (this.limit && this.elapsed >= this.limit) {
      this.onComplete();
      return;
    }
    
    this.onTick(this.elapsed);
    this.rafId = requestAnimationFrame(() => this.tick());
  }
  
  stop() {
    cancelAnimationFrame(this.rafId);
    return this.elapsed;
  }
  
  formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}
```

**Key concepts:**
- `requestAnimationFrame` for smooth updates
- `performance.now()` for accurate timing
- Time formatting
- Start/stop/pause logic

---

### 9. Score Calculation

**What the AI needs to know:**
```javascript
calculateScore() {
  const { cards, flips, timeElapsed, difficulty } = this.state;
  const totalPairs = cards.length / 2;
  const optimalFlips = totalPairs * 2; // Best case: flip each card once
  
  // Base score
  let score = this.config.baseScore;
  
  // Penalty for extra flips
  const extraFlips = Math.max(0, flips - optimalFlips);
  score -= extraFlips * this.config.flipPenalty;
  
  // Time bonus (if time limit exists)
  if (this.config.timeLimit) {
    const timeRemaining = this.config.timeLimit - timeElapsed;
    score += Math.max(0, timeRemaining * 5);
  }
  
  // Perfect game multiplier
  if (flips === optimalFlips) {
    score *= 2;
  }
  
  // Difficulty multiplier
  score *= (1 + difficulty * 0.1);
  
  return Math.round(score);
}

calculateStars() {
  const { flips, cards } = this.state;
  const optimalFlips = cards.length; // Each pair = 2 cards = 2 flips minimum
  const ratio = optimalFlips / flips;
  
  if (ratio >= 0.9) return 3;  // 90%+ optimal
  if (ratio >= 0.6) return 2;  // 60%+ optimal
  return 1;
}
```

---

### 10. Accessibility (A11Y)

**What the AI needs to know:**
```html
<!-- Accessible card markup -->
<div class="card" 
     role="button"
     tabindex="0"
     aria-label="Card 1 of 12, face down"
     aria-pressed="false"
     data-index="0">
  <div class="card-inner">
    <div class="card-back" aria-hidden="true"></div>
    <div class="card-front" aria-hidden="false">🐰</div>
  </div>
</div>
```

```javascript
// Update aria attributes on flip
flipCard(card) {
  const isFlipped = card.state === 'flipped';
  card.element.setAttribute('aria-pressed', isFlipped);
  card.element.setAttribute('aria-label', 
    isFlipped ? `Card ${card.id}, showing ${card.image}` 
              : `Card ${card.id}, face down`
  );
}

// Announce matches to screen readers
announceMatch(pairName) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.textContent = `Match found: ${pairName}`;
  document.body.appendChild(announcement);
  setTimeout(() => announcement.remove(), 1000);
}
```

**Key concepts:**
- ARIA roles and attributes
- Keyboard navigation
- Screen reader announcements
- Focus management

---

## 🛠️ Implementation Checklist

### Phase 1: Setup
- [ ] Create folder structure
- [ ] Import core modules
- [ ] Create MemoryGame class extending GameEngine

### Phase 2: Core Logic
- [ ] Card creation and shuffling
- [ ] Flip detection and state management
- [ ] Match checking logic
- [ ] Win condition detection
- [ ] Score calculation

### Phase 3: UI
- [ ] HTML structure with grid
- [ ] CSS card flip animation
- [ ] Responsive grid sizing
- [ ] UI state updates

### Phase 4: Polish
- [ ] Sound integration
- [ ] Celebration animations
- [ ] Timer (for hard modes)
- [ ] Leaderboard integration

### Phase 5: Testing
- [ ] All difficulty levels
- [ ] Touch devices
- [ ] Keyboard navigation
- [ ] Edge cases

---

## 📦 File Structure to Create

```
games/treasure-chest-memory/
├── index.html              # Main HTML file
├── MemoryGame.js           # Main game class
├── memory.config.js        # Configuration
├── memory.styles.css       # Styles
├── components/
│   ├── Card.js             # Card component
│   ├── Grid.js             # Grid layout manager
│   └── Timer.js            # Timer component
├── data/
│   └── cardThemes.js       # Card image themes
├── PRD.md                  # This file
├── SKILLS.md               # Skills guide
└── README.md               # Game documentation
```

---

## 🔌 Integration Points

### With Core Modules
```javascript
// EventSystem - emit game events
EventSystem.emit(GameEvents.GAME_START, { game: 'memory', difficulty });
EventSystem.emit(GameEvents.SCORE_UPDATE, { score, game: 'memory' });

// SoundManager - play sounds
soundManager.play(SoundType.BUTTON_CLICK); // Card flip
soundManager.play(SoundType.SCORE);        // Match found
soundManager.play(SoundType.COLLISION);    // No match

// Leaderboard - save scores
const leaderboard = new Leaderboard('memoryLeaderboard', 10);
leaderboard.addScore(playerName, finalScore);

// MathUtils - shuffling
const shuffled = MathUtils.shuffle([...cards]);
```

### With Assessment System (Future)
```javascript
// Report memory game stats
AssessmentEngine.recordActivity({
  game: 'treasure-chest-memory',
  category: 'memory',
  metrics: {
    accuracy: matchedOnFirstTry / totalPairs,
    speed: averageTimePerMatch,
    consistency: scoreVariance
  }
});
```

---

## ⚠️ Common Pitfalls

1. **Double-click bugs** - Lock input during flip animation
2. **Same card twice** - Check if card already flipped
3. **Mobile touch delay** - Use `touchstart` not `click`
4. **Animation timing** - Use CSS `transitionend` event
5. **Memory leaks** - Clean up event listeners on destroy

---

## 🎓 Learning Resources

- [CSS 3D Transforms](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/rotateY)
- [Fisher-Yates Shuffle](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
- [ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)
- [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
