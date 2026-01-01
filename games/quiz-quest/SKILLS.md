# Cinnamoroll Quiz Quest - AI Coding Assistant Skills Guide

> Skills and knowledge required to build this adventure quiz game

---

## 🎯 Required Skills Overview

| Category | Skill | Level | Priority |
|----------|-------|-------|----------|
| **JavaScript** | Async Data Loading | Intermediate | HIGH |
| **JavaScript** | State Machine | Intermediate | HIGH |
| **JavaScript** | JSON Data Management | Intermediate | HIGH |
| **Canvas** | Map Rendering | Intermediate | HIGH |
| **CSS** | Modal/Overlay UI | Intermediate | HIGH |
| **Architecture** | Question Engine | Advanced | HIGH |
| **Data** | Question Bank Design | Intermediate | HIGH |

---

## 📚 Detailed Skill Requirements

### 1. Question Bank Structure

**What the AI needs to know:**
```javascript
// questions/questionBank.js
export const QUESTION_BANK = {
  science: {
    easy: [
      {
        id: 'sci_e_001',
        question: 'What do plants need to grow?',
        answers: [
          { text: 'Sunlight and water', correct: true },
          { text: 'Only darkness', correct: false },
          { text: 'Ice cream', correct: false }
        ],
        image: '🌱',
        explanation: 'Plants need sunlight for photosynthesis and water for nutrients.'
      },
      // ... more questions
    ],
    medium: [...],
    hard: [...]
  },
  math: {...},
  language: {...},
  geography: {...},
  history: {...},
  logic: {...}
};

// Question loader
class QuestionLoader {
  constructor(questionBank) {
    this.bank = questionBank;
    this.usedQuestions = new Set();
  }
  
  getQuestions(category, difficulty, count) {
    const pool = this.bank[category]?.[difficulty] || [];
    const available = pool.filter(q => !this.usedQuestions.has(q.id));
    
    // Shuffle and take
    const shuffled = MathUtils.shuffle([...available]);
    const selected = shuffled.slice(0, count);
    
    // Mark as used
    selected.forEach(q => this.usedQuestions.add(q.id));
    
    return selected;
  }
  
  reset() {
    this.usedQuestions.clear();
  }
}
```

**Key concepts:**
- Organized by category and difficulty
- Unique IDs prevent duplicates
- Session tracking prevents repeats

---

### 2. Quiz Engine

**What the AI needs to know:**
```javascript
class QuizEngine {
  constructor(questions) {
    this.questions = questions;
    this.currentIndex = 0;
    this.answers = [];
    this.startTime = null;
  }
  
  start() {
    this.currentIndex = 0;
    this.answers = [];
    this.startTime = Date.now();
    return this.getCurrentQuestion();
  }
  
  getCurrentQuestion() {
    const q = this.questions[this.currentIndex];
    if (!q) return null;
    
    return {
      ...q,
      number: this.currentIndex + 1,
      total: this.questions.length,
      // Shuffle answer order
      shuffledAnswers: MathUtils.shuffle([...q.answers])
    };
  }
  
  submitAnswer(answerIndex, timeSpent) {
    const question = this.questions[this.currentIndex];
    const shuffled = this.getCurrentQuestion().shuffledAnswers;
    const selectedAnswer = shuffled[answerIndex];
    const correct = selectedAnswer.correct;
    
    this.answers.push({
      questionId: question.id,
      correct,
      timeSpent,
      answerGiven: selectedAnswer.text
    });
    
    return {
      correct,
      correctAnswer: question.answers.find(a => a.correct).text,
      explanation: question.explanation
    };
  }
  
  nextQuestion() {
    this.currentIndex++;
    return this.getCurrentQuestion();
  }
  
  isComplete() {
    return this.currentIndex >= this.questions.length;
  }
  
  getResults() {
    const correct = this.answers.filter(a => a.correct).length;
    const total = this.answers.length;
    const avgTime = this.answers.reduce((sum, a) => sum + a.timeSpent, 0) / total;
    
    return {
      correct,
      total,
      percentage: Math.round((correct / total) * 100),
      averageTime: Math.round(avgTime),
      totalTime: Date.now() - this.startTime,
      details: this.answers
    };
  }
  
  // Power-ups
  useHint(questionIndex) {
    const q = this.questions[questionIndex];
    const wrong = q.answers.filter(a => !a.correct);
    if (wrong.length > 0) {
      // Mark one wrong answer as eliminated
      const eliminate = MathUtils.randomPick(wrong);
      eliminate.eliminated = true;
    }
  }
  
  useFiftyFifty(questionIndex) {
    const q = this.questions[questionIndex];
    const wrong = q.answers.filter(a => !a.correct);
    // Eliminate half of wrong answers
    const toEliminate = wrong.slice(0, Math.floor(wrong.length / 2) + 1);
    toEliminate.forEach(a => a.eliminated = true);
  }
}
```

---

### 3. World Map System

**What the AI needs to know:**
```javascript
class WorldMap {
  constructor(canvas, mapData) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.locations = mapData.locations;
    this.paths = mapData.paths;
    this.playerPosition = 'cloud_plains';
  }
  
  render(progress) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw background
    this.drawBackground();
    
    // Draw paths between locations
    this.paths.forEach(path => {
      this.drawPath(path, progress);
    });
    
    // Draw location nodes
    this.locations.forEach(loc => {
      this.drawLocation(loc, progress);
    });
    
    // Draw player
    this.drawPlayer();
  }
  
  drawPath(path, progress) {
    const from = this.locations.find(l => l.id === path.from);
    const to = this.locations.find(l => l.id === path.to);
    
    const unlocked = progress.completedLocations.includes(path.from);
    
    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.lineTo(to.x, to.y);
    this.ctx.strokeStyle = unlocked ? '#FFD700' : '#ccc';
    this.ctx.lineWidth = unlocked ? 4 : 2;
    this.ctx.setLineDash(unlocked ? [] : [5, 5]);
    this.ctx.stroke();
  }
  
  drawLocation(location, progress) {
    const completed = progress.completedLocations.includes(location.id);
    const unlocked = this.isUnlocked(location.id, progress);
    const current = this.playerPosition === location.id;
    
    // Draw node circle
    this.ctx.beginPath();
    this.ctx.arc(location.x, location.y, 30, 0, Math.PI * 2);
    
    if (completed) {
      this.ctx.fillStyle = '#4CAF50';
    } else if (unlocked) {
      this.ctx.fillStyle = '#FFB6C1';
    } else {
      this.ctx.fillStyle = '#ccc';
    }
    this.ctx.fill();
    
    // Draw icon
    this.ctx.font = '24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(location.icon, location.x, location.y);
    
    // Draw label
    this.ctx.font = '12px Arial';
    this.ctx.fillStyle = '#333';
    this.ctx.fillText(location.name, location.x, location.y + 45);
    
    // Draw stars if completed
    if (completed && location.starsEarned) {
      this.drawStars(location.x, location.y - 40, location.starsEarned);
    }
    
    // Pulse animation for current
    if (current) {
      this.drawPulse(location.x, location.y);
    }
  }
  
  drawPlayer() {
    const loc = this.locations.find(l => l.id === this.playerPosition);
    // Draw Cinnamoroll sprite at location
    this.ctx.font = '32px Arial';
    this.ctx.fillText('🐰', loc.x, loc.y - 50);
  }
  
  isUnlocked(locationId, progress) {
    const location = this.locations.find(l => l.id === locationId);
    if (location.requiredStars === 0) return true;
    return progress.stars >= location.requiredStars;
  }
  
  handleClick(x, y, progress) {
    for (const loc of this.locations) {
      const dist = Math.hypot(x - loc.x, y - loc.y);
      if (dist < 30 && this.isUnlocked(loc.id, progress)) {
        return loc;
      }
    }
    return null;
  }
}
```

---

### 4. Timer System

**What the AI needs to know:**
```javascript
class QuestionTimer {
  constructor(duration, onTick, onComplete) {
    this.duration = duration;
    this.remaining = duration;
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.intervalId = null;
    this.paused = false;
  }
  
  start() {
    this.remaining = this.duration;
    this.intervalId = setInterval(() => this.tick(), 100);
  }
  
  tick() {
    if (this.paused) return;
    
    this.remaining -= 100;
    const percent = this.remaining / this.duration;
    
    this.onTick({
      remaining: this.remaining,
      percent,
      seconds: Math.ceil(this.remaining / 1000),
      warning: this.remaining < 5000
    });
    
    if (this.remaining <= 0) {
      this.stop();
      this.onComplete();
    }
  }
  
  pause() {
    this.paused = true;
  }
  
  resume() {
    this.paused = false;
  }
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  addTime(ms) {
    this.remaining = Math.min(this.duration, this.remaining + ms);
  }
}

// Timer bar UI
function renderTimerBar(container, timerData) {
  const bar = container.querySelector('.timer-bar-fill');
  const text = container.querySelector('.timer-text');
  
  bar.style.width = `${timerData.percent * 100}%`;
  bar.style.backgroundColor = timerData.warning ? '#F44336' : '#4CAF50';
  text.textContent = `${timerData.seconds}s`;
  
  if (timerData.warning) {
    container.classList.add('pulse');
  }
}
```

```css
.timer-bar {
  width: 100%;
  height: 10px;
  background: #E0E0E0;
  border-radius: 5px;
  overflow: hidden;
}

.timer-bar-fill {
  height: 100%;
  transition: width 0.1s linear;
}

.timer-bar.pulse {
  animation: timerPulse 0.5s infinite;
}

@keyframes timerPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

---

### 5. Power-Up System

**What the AI needs to know:**
```javascript
class PowerUpSystem {
  constructor(initialPowerUps) {
    this.powerUps = { ...initialPowerUps };
    this.usedThisQuestion = new Set();
  }
  
  canUse(type) {
    return this.powerUps[type] > 0 && !this.usedThisQuestion.has(type);
  }
  
  use(type, quizEngine, questionIndex) {
    if (!this.canUse(type)) return false;
    
    this.powerUps[type]--;
    this.usedThisQuestion.add(type);
    
    switch (type) {
      case 'hint':
        quizEngine.useHint(questionIndex);
        return { type: 'hint', message: 'One wrong answer eliminated!' };
        
      case 'fiftyFifty':
        quizEngine.useFiftyFifty(questionIndex);
        return { type: 'fiftyFifty', message: 'Two wrong answers eliminated!' };
        
      case 'skip':
        return { type: 'skip', message: 'Question skipped!' };
        
      case 'extraTime':
        return { type: 'extraTime', addTime: 15000 };
    }
  }
  
  resetForNewQuestion() {
    this.usedThisQuestion.clear();
  }
  
  getInventory() {
    return { ...this.powerUps };
  }
  
  addPowerUp(type, count = 1) {
    this.powerUps[type] = (this.powerUps[type] || 0) + count;
  }
}

// Power-up UI
function renderPowerUps(container, powerUpSystem) {
  const types = [
    { id: 'hint', icon: '💡', label: 'Hint' },
    { id: 'fiftyFifty', icon: '✂️', label: '50/50' },
    { id: 'skip', icon: '⏭️', label: 'Skip' },
    { id: 'extraTime', icon: '⏰', label: '+15s' }
  ];
  
  container.innerHTML = types.map(type => `
    <button class="powerup-btn" 
            data-type="${type.id}"
            ${!powerUpSystem.canUse(type.id) ? 'disabled' : ''}>
      <span class="powerup-icon">${type.icon}</span>
      <span class="powerup-count">${powerUpSystem.getInventory()[type.id] || 0}</span>
    </button>
  `).join('');
}
```

---

### 6. Question UI Component

**What the AI needs to know:**
```javascript
class QuestionUI {
  constructor(container) {
    this.container = container;
  }
  
  render(question, onAnswer) {
    this.container.innerHTML = `
      <div class="question-card">
        <div class="question-header">
          <span class="question-number">Question ${question.number} of ${question.total}</span>
          <span class="question-category">${question.category}</span>
        </div>
        
        ${question.image ? `
          <div class="question-image">${question.image}</div>
        ` : ''}
        
        <div class="question-text">${question.question}</div>
        
        <div class="answers-container">
          ${question.shuffledAnswers.map((answer, index) => `
            <button class="answer-btn ${answer.eliminated ? 'eliminated' : ''}"
                    data-index="${index}"
                    ${answer.eliminated ? 'disabled' : ''}>
              <span class="answer-letter">${String.fromCharCode(65 + index)}</span>
              <span class="answer-text">${answer.text}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
    
    // Add click handlers
    this.container.querySelectorAll('.answer-btn:not(.eliminated)').forEach(btn => {
      btn.addEventListener('click', () => {
        onAnswer(parseInt(btn.dataset.index));
      });
    });
  }
  
  showResult(result, onContinue) {
    const overlay = document.createElement('div');
    overlay.className = `result-overlay ${result.correct ? 'correct' : 'wrong'}`;
    overlay.innerHTML = `
      <div class="result-card">
        <div class="result-icon">${result.correct ? '✅' : '❌'}</div>
        <div class="result-text">${result.correct ? 'Correct!' : 'Wrong!'}</div>
        ${!result.correct ? `
          <div class="correct-answer">
            The correct answer was: <strong>${result.correctAnswer}</strong>
          </div>
        ` : ''}
        <div class="explanation">${result.explanation}</div>
        <button class="continue-btn">Continue</button>
      </div>
    `;
    
    this.container.appendChild(overlay);
    overlay.querySelector('.continue-btn').addEventListener('click', () => {
      overlay.remove();
      onContinue();
    });
  }
}
```

---

## 📦 File Structure to Create

```
games/quiz-quest/
├── index.html
├── QuizQuestGame.js         # Main game class
├── quiz.config.js           # Configuration
├── quiz.styles.css          # Styles
├── components/
│   ├── QuizEngine.js        # Question management
│   ├── WorldMap.js          # Map rendering
│   ├── QuestionUI.js        # Question display
│   ├── QuestionTimer.js     # Timer system
│   └── PowerUpSystem.js     # Power-ups
├── data/
│   ├── questionBank.js      # All questions
│   ├── mapData.js           # World map data
│   └── categories.js        # Subject definitions
├── PRD.md
├── SKILLS.md
└── README.md
```

---

## ⚠️ Common Pitfalls

1. **Duplicate questions** - Track used questions per session
2. **Answer order** - Always shuffle to prevent memorization
3. **Timer edge cases** - Handle pause/resume correctly
4. **Mobile text size** - Questions must be readable
5. **Power-up exploits** - Limit per question

---

## 🔗 External Dependencies (Optional)

- **Open Trivia Database API** - Free question source
- **Wikipedia API** - Fact verification
- **Google Fonts** - Readable quiz fonts

---

## 🎓 Learning Resources

- [Trivia Question Design](https://en.wikipedia.org/wiki/Trivia)
- [Canvas Path Drawing](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes)
- [State Machine Pattern](https://gameprogrammingpatterns.com/state.html)
