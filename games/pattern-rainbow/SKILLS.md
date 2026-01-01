# Pattern Rainbow - AI Coding Assistant Skills Guide

> Skills and knowledge required to build this pattern recognition game

---

## 🎯 Required Skills Overview

| Category | Skill | Level | Priority |
|----------|-------|-------|----------|
| **JavaScript** | Array Operations | Intermediate | HIGH |
| **JavaScript** | Object-Oriented | Intermediate | HIGH |
| **JavaScript** | DOM Manipulation | Intermediate | HIGH |
| **CSS** | Flexbox/Grid | Intermediate | HIGH |
| **CSS** | Transitions | Basic | MEDIUM |
| **Math** | Sequences | Basic | HIGH |
| **Architecture** | Generator Pattern | Intermediate | HIGH |

---

## 📚 Detailed Skill Requirements

### 1. Pattern Generation System

**What the AI needs to know:**
```javascript
class PatternGenerator {
  constructor(difficulty) {
    this.difficulty = difficulty;
    this.elements = {
      colors: ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣'],
      shapes: ['⭐', '🌙', '☁️', '💖', '🌸', '✨'],
      arrows: ['↑', '→', '↓', '←'],
      numbers: Array.from({ length: 20 }, (_, i) => i + 1)
    };
  }
  
  generate() {
    switch (this.difficulty) {
      case 1: return this.simpleAB();
      case 2: return this.simpleABC();
      case 3: return this.doublePattern();
      case 4: return this.growingSequence();
      case 5: return this.rotationPattern();
      case 6: return this.mathSequence();
      case 7: return this.complexPattern();
    }
  }
  
  // AB Pattern: 🔴🔵🔴🔵?
  simpleAB() {
    const [a, b] = this.pickRandom(this.elements.colors, 2);
    const length = 5;
    const pattern = [];
    
    for (let i = 0; i < length; i++) {
      pattern.push(i % 2 === 0 ? a : b);
    }
    
    const missingIndex = length - 1;
    const answer = pattern[missingIndex];
    
    return {
      type: 'repeat',
      rule: 'AB',
      elements: pattern.slice(0, -1),
      missingIndex,
      answer,
      choices: this.generateChoices(answer, [a, b])
    };
  }
  
  // ABC Pattern: ⭐🌙☁️⭐🌙?
  simpleABC() {
    const [a, b, c] = this.pickRandom(this.elements.shapes, 3);
    const length = 6;
    const sequence = [a, b, c];
    const pattern = [];
    
    for (let i = 0; i < length; i++) {
      pattern.push(sequence[i % 3]);
    }
    
    const missingIndex = length - 1;
    const answer = pattern[missingIndex];
    
    return {
      type: 'repeat',
      rule: 'ABC',
      elements: pattern.slice(0, -1),
      missingIndex,
      answer,
      choices: this.shuffleArray([a, b, c])
    };
  }
  
  // Growing: 1, 2, 3, 4, ?
  growingSequence() {
    const start = MathUtils.randomInt(1, 5);
    const step = MathUtils.randomInt(1, 3);
    const length = 5;
    const pattern = [];
    
    for (let i = 0; i < length; i++) {
      pattern.push(start + (step * i));
    }
    
    const answer = pattern[length - 1];
    
    return {
      type: 'growing',
      rule: `+${step}`,
      elements: pattern.slice(0, -1).map(String),
      missingIndex: length - 1,
      answer: String(answer),
      choices: this.generateNumberChoices(answer, step)
    };
  }
  
  // Math sequence: 2, 4, 8, 16, ?
  mathSequence() {
    const rules = [
      { name: '×2', fn: (n, i) => n * Math.pow(2, i) },
      { name: '+3', fn: (n, i) => n + (3 * i) },
      { name: '×2+1', fn: (n, i) => i === 0 ? n : (n * 2 + 1) }
    ];
    
    const rule = MathUtils.randomPick(rules);
    const start = MathUtils.randomInt(2, 5);
    const length = 5;
    const pattern = [start];
    
    for (let i = 1; i < length; i++) {
      if (rule.name === '×2') {
        pattern.push(pattern[i-1] * 2);
      } else if (rule.name === '+3') {
        pattern.push(pattern[i-1] + 3);
      }
    }
    
    const answer = pattern[length - 1];
    
    return {
      type: 'math',
      rule: rule.name,
      elements: pattern.slice(0, -1).map(String),
      missingIndex: length - 1,
      answer: String(answer),
      choices: this.generateMathChoices(answer)
    };
  }
  
  // Rotation: ↑ → ↓ ← ?
  rotationPattern() {
    const arrows = ['↑', '→', '↓', '←'];
    const startIndex = MathUtils.randomInt(0, 3);
    const length = 5;
    const pattern = [];
    
    for (let i = 0; i < length; i++) {
      pattern.push(arrows[(startIndex + i) % 4]);
    }
    
    return {
      type: 'rotation',
      rule: 'clockwise',
      elements: pattern.slice(0, -1),
      missingIndex: length - 1,
      answer: pattern[length - 1],
      choices: this.shuffleArray([...arrows])
    };
  }
  
  // Helper: Pick N random elements
  pickRandom(array, count) {
    const shuffled = this.shuffleArray([...array]);
    return shuffled.slice(0, count);
  }
  
  // Helper: Shuffle array
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  // Generate wrong choices that look plausible
  generateChoices(answer, pool) {
    const choices = new Set([answer]);
    const available = pool.filter(x => x !== answer);
    
    while (choices.size < 3 && available.length > 0) {
      const wrong = available.pop();
      choices.add(wrong);
    }
    
    // Add from full element pool if needed
    while (choices.size < 3) {
      const random = MathUtils.randomPick(this.elements.colors);
      if (!choices.has(random)) choices.add(random);
    }
    
    return this.shuffleArray(Array.from(choices));
  }
  
  generateNumberChoices(answer, step) {
    const choices = [
      answer,
      answer + step,      // One step ahead
      answer - step,      // One step behind
      answer + 1          // Common mistake
    ].filter((v, i, a) => v > 0 && a.indexOf(v) === i);
    
    return this.shuffleArray(choices.slice(0, 3)).map(String);
  }
  
  generateMathChoices(answer) {
    const choices = [
      answer,
      answer * 2,
      answer + answer/2,
      answer - answer/4
    ].map(Math.round).filter((v, i, a) => v > 0 && a.indexOf(v) === i);
    
    return this.shuffleArray(choices.slice(0, 4)).map(String);
  }
}
```

**Key concepts:**
- Random selection without duplicates
- Pattern rule application
- Plausible distractor generation

---

### 2. Visual Pattern Display

**What the AI needs to know:**
```javascript
class PatternRenderer {
  constructor(container) {
    this.container = container;
  }
  
  render(pattern) {
    this.container.innerHTML = '';
    
    const sequence = document.createElement('div');
    sequence.className = 'pattern-sequence';
    
    // Render each element
    pattern.elements.forEach((element, index) => {
      const el = this.createElementBox(element, index);
      sequence.appendChild(el);
    });
    
    // Render missing slot
    const missing = this.createMissingSlot(pattern.missingIndex);
    sequence.appendChild(missing);
    
    this.container.appendChild(sequence);
    
    // Animate in
    this.animateSequence();
  }
  
  createElementBox(element, index) {
    const box = document.createElement('div');
    box.className = 'pattern-element';
    box.textContent = element;
    box.style.animationDelay = `${index * 0.1}s`;
    return box;
  }
  
  createMissingSlot(index) {
    const slot = document.createElement('div');
    slot.className = 'pattern-element missing';
    slot.innerHTML = '<span class="question-mark">?</span>';
    slot.style.animationDelay = `${index * 0.1}s`;
    return slot;
  }
  
  animateSequence() {
    const elements = this.container.querySelectorAll('.pattern-element');
    elements.forEach((el, i) => {
      el.classList.add('slide-in');
    });
  }
  
  showCorrect(answer) {
    const missing = this.container.querySelector('.missing');
    missing.classList.remove('missing');
    missing.classList.add('correct');
    missing.textContent = answer;
  }
  
  showWrong() {
    const missing = this.container.querySelector('.missing');
    missing.classList.add('shake');
    setTimeout(() => missing.classList.remove('shake'), 500);
  }
}
```

```css
.pattern-sequence {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.pattern-element {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transform: translateY(-20px);
}

.pattern-element.slide-in {
  animation: slideIn 0.3s ease forwards;
}

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pattern-element.missing {
  border: 3px dashed #FFB6C1;
  background: rgba(255, 182, 193, 0.2);
}

.question-mark {
  color: #FFB6C1;
  font-weight: bold;
}

.pattern-element.correct {
  background: #E8F5E9;
  border: 3px solid #4CAF50;
  animation: pop 0.3s ease;
}

.pattern-element.shake {
  animation: shake 0.3s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
```

---

### 3. Choice Selection System

**What the AI needs to know:**
```javascript
class ChoiceSelector {
  constructor(container, onSelect) {
    this.container = container;
    this.onSelect = onSelect;
    this.selectedIndex = -1;
    this.disabled = false;
  }
  
  render(choices) {
    this.container.innerHTML = '';
    this.disabled = false;
    
    choices.forEach((choice, index) => {
      const button = document.createElement('button');
      button.className = 'choice-button';
      button.textContent = choice;
      button.dataset.index = index;
      
      button.addEventListener('click', () => this.select(choice, index));
      
      // Keyboard navigation
      button.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') this.focusNext(index);
        if (e.key === 'ArrowLeft') this.focusPrev(index);
      });
      
      this.container.appendChild(button);
    });
  }
  
  select(choice, index) {
    if (this.disabled) return;
    
    this.selectedIndex = index;
    this.highlightSelected(index);
    this.onSelect(choice);
  }
  
  highlightSelected(index) {
    const buttons = this.container.querySelectorAll('.choice-button');
    buttons.forEach((btn, i) => {
      btn.classList.toggle('selected', i === index);
    });
  }
  
  showResult(selectedIndex, correctChoice, wasCorrect) {
    this.disabled = true;
    const buttons = this.container.querySelectorAll('.choice-button');
    
    buttons.forEach((btn, i) => {
      if (btn.textContent === correctChoice) {
        btn.classList.add('correct');
      } else if (i === selectedIndex && !wasCorrect) {
        btn.classList.add('wrong');
      }
      btn.disabled = true;
    });
  }
  
  focusNext(currentIndex) {
    const buttons = this.container.querySelectorAll('.choice-button');
    const nextIndex = (currentIndex + 1) % buttons.length;
    buttons[nextIndex].focus();
  }
  
  focusPrev(currentIndex) {
    const buttons = this.container.querySelectorAll('.choice-button');
    const prevIndex = (currentIndex - 1 + buttons.length) % buttons.length;
    buttons[prevIndex].focus();
  }
}
```

```css
.choices-container {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
  padding: 20px;
}

.choice-button {
  min-width: 70px;
  height: 70px;
  font-size: 28px;
  background: white;
  border: 3px solid #E0E0E0;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.choice-button:hover {
  transform: scale(1.05);
  border-color: #FFB6C1;
  box-shadow: 0 4px 12px rgba(255, 182, 193, 0.3);
}

.choice-button:focus {
  outline: none;
  border-color: #FF9999;
  box-shadow: 0 0 0 3px rgba(255, 153, 153, 0.3);
}

.choice-button.selected {
  border-color: #2196F3;
  background: #E3F2FD;
}

.choice-button.correct {
  border-color: #4CAF50;
  background: #E8F5E9;
  animation: pulse 0.5s ease;
}

.choice-button.wrong {
  border-color: #F44336;
  background: #FFEBEE;
}

.choice-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
```

---

### 4. Hint System

**What the AI needs to know:**
```javascript
class HintSystem {
  constructor(maxHints) {
    this.hintsRemaining = maxHints;
    this.maxHints = maxHints;
  }
  
  canUseHint() {
    return this.hintsRemaining > 0;
  }
  
  useHint(pattern, choiceButtons) {
    if (!this.canUseHint()) return false;
    
    this.hintsRemaining--;
    
    // Strategy 1: Eliminate one wrong answer
    const wrongButton = Array.from(choiceButtons).find(
      btn => btn.textContent !== pattern.answer && 
             !btn.classList.contains('eliminated')
    );
    
    if (wrongButton) {
      wrongButton.classList.add('eliminated');
      wrongButton.disabled = true;
    }
    
    return true;
  }
  
  reset() {
    this.hintsRemaining = this.maxHints;
  }
  
  getRemaining() {
    return this.hintsRemaining;
  }
}
```

```css
.choice-button.eliminated {
  opacity: 0.3;
  text-decoration: line-through;
  pointer-events: none;
}

.hint-button {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px 20px;
  background: #FFF9C4;
  border: 2px solid #FFC107;
  border-radius: 20px;
  cursor: pointer;
}

.hint-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hint-count {
  background: #FFC107;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
```

---

### 5. Progress & Scoring

**What the AI needs to know:**
```javascript
class ProgressTracker {
  constructor(roundsPerLevel) {
    this.roundsPerLevel = roundsPerLevel;
    this.currentRound = 0;
    this.currentLevel = 1;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
  }
  
  recordAnswer(correct, usedHint) {
    if (correct) {
      this.streak++;
      this.maxStreak = Math.max(this.maxStreak, this.streak);
      
      // Score calculation
      let points = 100;
      if (!usedHint) points += 20;           // Bonus for no hint
      points += this.streak * 10;             // Streak bonus
      
      this.score += points;
      this.currentRound++;
      
      return { points, streak: this.streak };
    } else {
      this.streak = 0;
      return { points: 0, streak: 0 };
    }
  }
  
  shouldLevelUp() {
    return this.currentRound >= this.roundsPerLevel;
  }
  
  levelUp() {
    this.currentLevel++;
    this.currentRound = 0;
  }
  
  getRoundProgress() {
    return {
      current: this.currentRound,
      total: this.roundsPerLevel,
      percent: (this.currentRound / this.roundsPerLevel) * 100
    };
  }
}

// Progress bar UI
function renderProgressBar(container, progress) {
  container.innerHTML = '';
  
  for (let i = 0; i < progress.total; i++) {
    const dot = document.createElement('span');
    dot.className = `progress-dot ${i < progress.current ? 'filled' : ''}`;
    container.appendChild(dot);
  }
}
```

```css
.progress-bar {
  display: flex;
  gap: 8px;
  justify-content: center;
  padding: 10px;
}

.progress-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #E0E0E0;
  transition: all 0.3s ease;
}

.progress-dot.filled {
  background: #FFB6C1;
  transform: scale(1.1);
}
```

---

### 6. Game State Management

**What the AI needs to know:**
```javascript
class PatternRainbowGame {
  constructor(containerId, difficulty) {
    this.container = document.getElementById(containerId);
    this.difficulty = difficulty;
    
    this.generator = new PatternGenerator(difficulty);
    this.renderer = new PatternRenderer(this.container.querySelector('.pattern-display'));
    this.choices = new ChoiceSelector(
      this.container.querySelector('.choices-container'),
      (choice) => this.handleChoice(choice)
    );
    this.hints = new HintSystem(this.getHintCount(difficulty));
    this.progress = new ProgressTracker(5);
    
    this.currentPattern = null;
    this.state = 'ready'; // 'ready' | 'answering' | 'feedback' | 'transitioning'
  }
  
  getHintCount(difficulty) {
    if (difficulty <= 2) return Infinity;
    if (difficulty <= 4) return 3;
    if (difficulty <= 5) return 1;
    return 0;
  }
  
  start() {
    this.showNextPattern();
  }
  
  showNextPattern() {
    this.state = 'transitioning';
    
    // Fade out old content
    this.container.classList.add('fade-out');
    
    setTimeout(() => {
      this.currentPattern = this.generator.generate();
      this.renderer.render(this.currentPattern);
      this.choices.render(this.currentPattern.choices);
      this.updateUI();
      
      this.container.classList.remove('fade-out');
      this.state = 'answering';
    }, 300);
  }
  
  handleChoice(choice) {
    if (this.state !== 'answering') return;
    
    this.state = 'feedback';
    const correct = choice === this.currentPattern.answer;
    
    // Show result
    if (correct) {
      this.renderer.showCorrect(this.currentPattern.answer);
      SoundManager.getInstance().play(SoundType.SCORE);
    } else {
      this.renderer.showWrong();
      SoundManager.getInstance().play(SoundType.COLLISION);
    }
    
    this.choices.showResult(
      this.currentPattern.choices.indexOf(choice),
      this.currentPattern.answer,
      correct
    );
    
    // Record progress
    const result = this.progress.recordAnswer(correct, this.hints.hintsUsed > 0);
    this.showPointsPopup(result.points);
    
    // Continue after delay
    setTimeout(() => {
      if (this.progress.shouldLevelUp()) {
        this.levelUp();
      } else if (correct) {
        this.showNextPattern();
      } else {
        // Allow retry or show next
        this.showNextPattern();
      }
    }, 1500);
  }
  
  useHint() {
    if (this.state !== 'answering') return;
    
    const buttons = this.container.querySelectorAll('.choice-button');
    if (this.hints.useHint(this.currentPattern, buttons)) {
      this.updateUI();
    }
  }
  
  levelUp() {
    this.progress.levelUp();
    this.difficulty = Math.min(7, this.difficulty + 1);
    this.generator = new PatternGenerator(this.difficulty);
    this.hints.reset();
    
    // Show level up celebration
    this.showLevelUpScreen();
  }
  
  updateUI() {
    // Update score display
    document.getElementById('score').textContent = this.progress.score;
    
    // Update level display
    document.getElementById('level').textContent = this.progress.currentLevel;
    
    // Update hints
    document.getElementById('hints').textContent = this.hints.getRemaining();
    
    // Update progress bar
    renderProgressBar(
      document.getElementById('progress-bar'),
      this.progress.getRoundProgress()
    );
  }
}
```

---

## 📦 File Structure to Create

```
games/pattern-rainbow/
├── index.html
├── PatternRainbowGame.js    # Main game class
├── pattern.config.js        # Configuration
├── pattern.styles.css       # Styles
├── components/
│   ├── PatternGenerator.js  # Pattern creation
│   ├── PatternRenderer.js   # Visual display
│   ├── ChoiceSelector.js    # Answer selection
│   ├── HintSystem.js        # Hint management
│   └── ProgressTracker.js   # Score/progress
├── PRD.md
├── SKILLS.md
└── README.md
```

---

## ⚠️ Common Pitfalls

1. **Duplicate answers** - Always verify answer isn't in distractors
2. **Pattern too obvious** - Vary missing position
3. **Math errors** - Test all sequence types
4. **Accessibility** - Ensure color-blind friendly
5. **Mobile sizing** - Test on small screens

---

## 🎓 Learning Resources

- [Cognitive Development & Patterns](https://en.wikipedia.org/wiki/Pattern_recognition_(psychology))
- [CSS Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [Fisher-Yates Shuffle](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
