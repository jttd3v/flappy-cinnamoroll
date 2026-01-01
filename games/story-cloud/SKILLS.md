# Story Cloud Adventure - AI Coding Skills Guide

## 🎯 Required Skills

| Skill | Level | Priority |
|-------|-------|----------|
| State Machine | Intermediate | HIGH |
| Text Rendering | Basic | HIGH |
| Local Storage | Basic | MEDIUM |
| Animation | Intermediate | MEDIUM |

---

## 📚 Key Implementations

### Story Engine
```javascript
class StoryEngine {
  constructor(storyData) {
    this.story = storyData;
    this.currentNodeId = 'start';
    this.inventory = [];
    this.history = [];
  }
  
  getCurrentNode() {
    return this.story.nodes[this.currentNodeId];
  }
  
  makeChoice(choiceIndex) {
    const node = this.getCurrentNode();
    const choice = node.choices[choiceIndex];
    
    // Add item if choice grants one
    if (choice.item) {
      this.inventory.push(choice.item);
    }
    
    // Record history
    this.history.push({
      nodeId: this.currentNodeId,
      choice: choiceIndex,
      timestamp: Date.now()
    });
    
    // Move to next node
    this.currentNodeId = choice.nextId;
    
    return this.getCurrentNode();
  }
  
  checkAnswer(answerIndex) {
    const node = this.getCurrentNode();
    if (!node.question) return null;
    
    const correct = answerIndex === node.question.answer;
    return {
      correct,
      correctAnswer: node.question.options[node.question.answer],
      hint: correct ? null : node.question.hint
    };
  }
  
  isEnding() {
    const node = this.getCurrentNode();
    return node.isEnding === true;
  }
  
  getProgress() {
    const totalNodes = Object.keys(this.story.nodes).length;
    const visitedNodes = new Set(this.history.map(h => h.nodeId)).size;
    return visitedNodes / totalNodes;
  }
}
```

### Dialogue System (Typewriter Effect)
```javascript
class DialogueSystem {
  constructor(container) {
    this.container = container;
    this.currentAnimation = null;
  }
  
  async displayText(text, speed = 50) {
    // Cancel any existing animation
    if (this.currentAnimation) {
      clearInterval(this.currentAnimation);
    }
    
    this.container.textContent = '';
    let index = 0;
    
    return new Promise(resolve => {
      this.currentAnimation = setInterval(() => {
        if (index < text.length) {
          this.container.textContent += text[index];
          index++;
        } else {
          clearInterval(this.currentAnimation);
          this.currentAnimation = null;
          resolve();
        }
      }, speed);
    });
  }
  
  skipToEnd(text) {
    if (this.currentAnimation) {
      clearInterval(this.currentAnimation);
      this.currentAnimation = null;
    }
    this.container.textContent = text;
  }
  
  displayChoices(choices, onSelect) {
    const choiceContainer = document.createElement('div');
    choiceContainer.className = 'choice-container';
    
    choices.forEach((choice, index) => {
      const button = document.createElement('button');
      button.className = 'choice-button';
      button.textContent = choice.text;
      button.onclick = () => onSelect(index);
      choiceContainer.appendChild(button);
    });
    
    this.container.appendChild(choiceContainer);
  }
}
```

### Comprehension Tracker
```javascript
class ComprehensionTracker {
  constructor() {
    this.questions = [];
  }
  
  recordAnswer(questionId, correct, category = 'general') {
    this.questions.push({
      questionId,
      correct,
      category,
      timestamp: Date.now()
    });
  }
  
  getAccuracyRate(category = null) {
    const filtered = category
      ? this.questions.filter(q => q.category === category)
      : this.questions;
    
    if (filtered.length === 0) return 0;
    
    const correct = filtered.filter(q => q.correct).length;
    return correct / filtered.length;
  }
  
  getWeakAreas() {
    const categories = {};
    
    this.questions.forEach(q => {
      if (!categories[q.category]) {
        categories[q.category] = { correct: 0, total: 0 };
      }
      categories[q.category].total++;
      if (q.correct) categories[q.category].correct++;
    });
    
    return Object.entries(categories)
      .map(([cat, stats]) => ({
        category: cat,
        accuracy: stats.correct / stats.total
      }))
      .filter(c => c.accuracy < 0.7)
      .sort((a, b) => a.accuracy - b.accuracy);
  }
}
```

---

## 📦 File Structure

```
games/story-cloud/
├── index.html
├── StoryCloudGame.js
├── story-cloud.config.js
├── components/
│   ├── StoryEngine.js
│   ├── DialogueSystem.js
│   ├── ComprehensionTracker.js
│   └── InventoryDisplay.js
├── data/
│   ├── stories/
│   │   ├── cloud-adventure.json
│   │   └── rainbow-quest.json
│   └── questions.js
├── PRD.md
├── SKILLS.md
└── README.md
```

---

## 📖 Story Data Format

```javascript
// stories/cloud-adventure.json
{
  "id": "cloud-adventure",
  "title": "Cinnamoroll's Cloud Adventure",
  "difficulty": 2,
  "nodes": {
    "start": {
      "id": "start",
      "content": "Cinnamoroll woke up on a fluffy cloud...",
      "choices": [
        { "text": "Explore the cloud", "nextId": "explore" },
        { "text": "Go back to sleep", "nextId": "sleep" }
      ],
      "question": {
        "text": "Where did Cinnamoroll wake up?",
        "options": ["In bed", "On a cloud", "In the forest", "At school"],
        "answer": 1
      }
    }
  }
}
```

---

## ⚠️ Common Pitfalls

1. **Dead ends** - Ensure all paths lead somewhere
2. **State inconsistency** - Save/load must preserve all state
3. **Text overflow** - Handle long text gracefully
4. **Missing translations** - Structure for i18n early
