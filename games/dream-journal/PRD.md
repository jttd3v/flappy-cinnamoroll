# Cinnamoroll's Dream Journal - Product Requirements Document

> **Build Order: #7** | **Priority: MEDIUM** | **Complexity: MEDIUM**

## 📋 Overview

| Field | Value |
|-------|-------|
| **Game Name** | Cinnamoroll's Dream Journal |
| **Type** | Creative Writing |
| **Target Age** | 6-35 (difficulty scaled) |
| **Primary Theme** | Writing + Creativity |
| **Secondary Themes** | Critical Thinking, Abstract |
| **Estimated Dev Time** | 6-8 hours |
| **Dependencies** | Core systems |

---

## 🎯 Objectives

### Learning Goals
- **Letter Formation** (Ages 6-7)
- **Sentence Building** (Ages 8-10)
- **Paragraph Writing** (Ages 11-14)
- **Essay Structure** (Ages 15-20)
- **Creative Expression** (Ages 21-35)

### Game Goals
- Complete writing prompts
- Build vocabulary through usage
- Express creativity
- Create a dream collection
- Earn badges for consistency

---

## 🎮 Gameplay Description

### Core Mechanic
1. Receive a creative prompt
2. Write response (scaled to age)
3. Get feedback and encouragement
4. Save to dream journal
5. Unlock new themes and stickers

### Writing Flow
```
╔════════════════════════════════╗
║  📝 Dream Journal              ║
╠════════════════════════════════╣
║  Today's Prompt:               ║
║                                ║
║  "If Cinnamoroll could fly     ║
║   anywhere, where would        ║
║   he go and why?"              ║
║                                ║
║  ┌────────────────────────┐    ║
║  │                        │    ║
║  │ Your writing here...   │    ║
║  │                        │    ║
║  │                        │    ║
║  └────────────────────────┘    ║
║                                ║
║  Words: 0/50    [Submit]       ║
╚════════════════════════════════╝
```

---

## 📊 Difficulty Scaling

| Age | Task | Requirements |
|-----|------|--------------|
| 6-7 | Word completion | Fill in 3-5 words |
| 8-9 | Sentence starter | Complete 1-2 sentences |
| 10-12 | Short response | Write 2-3 sentences |
| 13-15 | Paragraph | 1 full paragraph |
| 16-20 | Multi-paragraph | 2-3 paragraphs |
| 21-25 | Short essay | 4-5 paragraphs |
| 26-35 | Reflective essay | 500+ words |

---

## 🎨 Visual Design

### Writing Screen
```
┌────────────────────────────────┐
│  📝 Dream Journal   Day 5      │
│  🔥 Streak: 5 days!            │
├────────────────────────────────┤
│  ☁️ Today's Dream Prompt ☁️    │
│                                │
│  "Describe your perfect day    │
│   on a cloud..."               │
│                                │
│  ┌────────────────────────┐    │
│  │ I would float on a     │    │
│  │ soft pink cloud with   │    │
│  │ Cinnamoroll. We would  │    │
│  │ eat cotton candy and   │    │
│  │ watch the sunset...    │    │
│  └────────────────────────┘    │
│                                │
│  Words: 28    Min: 20  ✓       │
│                                │
│  [💾 Save Draft] [✨ Submit]   │
└────────────────────────────────┘
```

### Journal Gallery
```
┌────────────────────────────────┐
│  📚 My Dream Collection        │
├────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐      │
│  │Day 1│ │Day 2│ │Day 3│      │
│  │ ⭐  │ │ ⭐⭐ │ │ ⭐  │      │
│  └─────┘ └─────┘ └─────┘      │
│  ┌─────┐ ┌─────┐ ┌─────┐      │
│  │Day 4│ │Day 5│ │Day 6│      │
│  │ ⭐⭐⭐│ │ NEW │ │ 🔒  │      │
│  └─────┘ └─────┘ └─────┘      │
│                                │
│  Badges: 🏆✍️📖🌟              │
└────────────────────────────────┘
```

---

## 🗂️ Data Structures

### Writing Prompt
```javascript
{
  id: 'prompt_001',
  category: 'imagination',
  text: 'If Cinnamoroll could fly anywhere...',
  difficulty: 3,
  minWords: 30,
  maxWords: 100,
  starters: [
    'Cinnamoroll would fly to...',
    'If I were Cinnamoroll, I would...'
  ],
  keywords: ['fly', 'cloud', 'adventure', 'friend']
}
```

### Journal Entry
```javascript
{
  id: 'entry_001',
  promptId: 'prompt_001',
  content: 'I would float on a soft pink cloud...',
  wordCount: 45,
  createdAt: '2024-01-15T10:30:00Z',
  rating: 3,  // Stars earned
  stickers: ['cloud', 'star']
}
```

### Progress State
```javascript
{
  currentStreak: 5,
  longestStreak: 12,
  totalEntries: 23,
  totalWords: 1250,
  badges: ['first_entry', 'week_streak', 'word_master'],
  unlockedThemes: ['clouds', 'stars', 'rainbow']
}
```

---

## 📦 New Modules Needed

### WritingPromptEngine.js
```javascript
class WritingPromptEngine {
  getPromptForDifficulty(level)
  getRandomPrompt(category)
  getDailyPrompt()
  validateWordCount(text, min, max)
}
```

### JournalStorage.js
```javascript
class JournalStorage {
  saveEntry(entry)
  getEntry(id)
  getAllEntries()
  getStreak()
  updateStreak()
}
```

### TextEditor.js
```javascript
class TextEditor {
  countWords(text)
  highlightKeywords(text, keywords)
  autoSave(callback, interval)
  enableSpellCheck(enable)
}
```

---

## 🧪 Test Cases

- [ ] Word count is accurate
- [ ] Prompts match difficulty level
- [ ] Entries save correctly
- [ ] Streak calculates properly
- [ ] Badges unlock at milestones
- [ ] Draft auto-saves work

---

## 📈 Assessment Metrics

| Skill | Weight | Measurement |
|-------|--------|-------------|
| Writing Volume | 30% | Word count |
| Consistency | 30% | Streak days |
| Vocabulary | 20% | Unique words used |
| Creativity | 20% | Prompt diversity |

---

## ✅ Acceptance Criteria

- [ ] Age-appropriate prompts
- [ ] Word count validation works
- [ ] Entries persist across sessions
- [ ] Streak tracking is accurate
- [ ] Mobile keyboard friendly
- [ ] Encouraging feedback only
