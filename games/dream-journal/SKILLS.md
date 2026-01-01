# Dream Journal - AI Coding Skills Guide

## 🎯 Required Skills

| Skill | Level | Priority |
|-------|-------|----------|
| Text Area Handling | Basic | HIGH |
| Local Storage | Intermediate | HIGH |
| Date/Time | Basic | MEDIUM |
| Form Validation | Basic | HIGH |

---

## 📚 Key Implementations

### Writing Prompt Engine
```javascript
class WritingPromptEngine {
  constructor(prompts) {
    this.prompts = prompts;
    this.usedToday = null;
  }
  
  getPromptForDifficulty(level) {
    const filtered = this.prompts.filter(p => p.difficulty === level);
    return MathUtils.randomPick(filtered);
  }
  
  getDailyPrompt(difficulty) {
    const today = new Date().toDateString();
    
    // Return same prompt all day
    if (this.usedToday?.date === today) {
      return this.usedToday.prompt;
    }
    
    // Generate deterministic prompt based on date
    const seed = this.dateToSeed(today);
    const filtered = this.prompts.filter(p => p.difficulty === difficulty);
    const index = seed % filtered.length;
    
    this.usedToday = {
      date: today,
      prompt: filtered[index]
    };
    
    return this.usedToday.prompt;
  }
  
  dateToSeed(dateString) {
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
    }
    return Math.abs(hash);
  }
  
  validateWordCount(text, min, max) {
    const count = this.countWords(text);
    return {
      count,
      meetMin: count >= min,
      meetMax: count <= max,
      valid: count >= min
    };
  }
  
  countWords(text) {
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  }
}
```

### Text Editor Component
```javascript
class TextEditor {
  constructor(textArea, options = {}) {
    this.textArea = textArea;
    this.autoSaveInterval = options.autoSaveInterval || 30000;
    this.onSave = options.onSave || (() => {});
    
    this.setupAutoSave();
    this.setupWordCount();
  }
  
  setupAutoSave() {
    setInterval(() => {
      if (this.textArea.value.trim()) {
        this.onSave(this.textArea.value);
      }
    }, this.autoSaveInterval);
  }
  
  setupWordCount() {
    const counter = document.createElement('div');
    counter.className = 'word-counter';
    this.textArea.parentNode.appendChild(counter);
    
    this.textArea.addEventListener('input', () => {
      const count = this.countWords(this.textArea.value);
      counter.textContent = `Words: ${count}`;
    });
  }
  
  countWords(text) {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  }
  
  getValue() {
    return this.textArea.value;
  }
  
  setValue(text) {
    this.textArea.value = text;
    this.textArea.dispatchEvent(new Event('input'));
  }
  
  clear() {
    this.setValue('');
  }
}
```

### Streak Tracker
```javascript
class StreakTracker {
  constructor(storageKey = 'dreamJournalStreak') {
    this.storageKey = storageKey;
    this.data = this.load();
  }
  
  load() {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : {
      currentStreak: 0,
      longestStreak: 0,
      lastEntryDate: null
    };
  }
  
  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
  }
  
  recordEntry() {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (this.data.lastEntryDate === today) {
      // Already wrote today
      return this.data.currentStreak;
    }
    
    if (this.data.lastEntryDate === yesterday) {
      // Consecutive day!
      this.data.currentStreak++;
    } else if (this.data.lastEntryDate !== today) {
      // Streak broken
      this.data.currentStreak = 1;
    }
    
    this.data.lastEntryDate = today;
    this.data.longestStreak = Math.max(
      this.data.longestStreak,
      this.data.currentStreak
    );
    
    this.save();
    return this.data.currentStreak;
  }
  
  getStreak() {
    // Check if streak is still valid
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (this.data.lastEntryDate !== today && 
        this.data.lastEntryDate !== yesterday) {
      this.data.currentStreak = 0;
      this.save();
    }
    
    return this.data.currentStreak;
  }
}
```

---

## 📦 File Structure

```
games/dream-journal/
├── index.html
├── DreamJournalGame.js
├── dream-journal.config.js
├── components/
│   ├── WritingPromptEngine.js
│   ├── TextEditor.js
│   ├── StreakTracker.js
│   └── JournalGallery.js
├── data/
│   └── prompts.js
├── PRD.md
├── SKILLS.md
└── README.md
```

---

## 📝 Prompt Categories

```javascript
const PROMPT_CATEGORIES = {
  imagination: 'Creative "what if" scenarios',
  feelings: 'Emotional expression prompts',
  memories: 'Recall and describe experiences',
  adventures: 'Story-based writing prompts',
  dreams: 'Describe dreams or wishes',
  kindness: 'Acts of kindness themes'
};
```

---

## ⚠️ Common Pitfalls

1. **Lost drafts** - Auto-save frequently
2. **Streak timezone issues** - Use consistent timezone
3. **Word count edge cases** - Handle punctuation properly
4. **Mobile keyboard** - Adjust viewport on focus
