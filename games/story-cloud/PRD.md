# Story Cloud Adventure - Product Requirements Document

> **Build Order: #6** | **Priority: MEDIUM** | **Complexity: HIGH**

## 📋 Overview

| Field | Value |
|-------|-------|
| **Game Name** | Story Cloud Adventure |
| **Type** | Interactive Fiction |
| **Target Age** | 6-35 (difficulty scaled) |
| **Primary Theme** | Exploration + Reading |
| **Secondary Themes** | Critical Thinking, Memorization |
| **Estimated Dev Time** | 8-10 hours |
| **Dependencies** | Core systems |

---

## 🎯 Objectives

### Learning Goals
- **Reading Comprehension** (All ages)
- **Vocabulary** (Ages 6-12)
- **Cause and Effect** (Ages 9-15)
- **Critical Analysis** (Ages 16-25)
- **Inference Skills** (Ages 20-35)

### Game Goals
- Navigate through story branches
- Answer comprehension questions
- Collect story items
- Unlock all endings
- Build a story journal

---

## 🎮 Gameplay Description

### Core Mechanic
1. Read story segment
2. Make choices at branch points
3. Answer comprehension questions
4. Choices affect story outcome
5. Track items and achievements

### Story Flow
```
╔════════════════════════════════╗
║  📖 Story Cloud Adventure      ║
╠════════════════════════════════╣
║                                ║
║  Cinnamoroll floated on a      ║
║  fluffy cloud through the      ║
║  morning sky. He spotted       ║
║  two paths ahead...            ║
║                                ║
║  🌈 A rainbow bridge           ║
║  🏔️ Mountain peaks             ║
║                                ║
╠════════════════════════════════╣
║  ❓ Question: Where was        ║
║     Cinnamoroll floating?      ║
║  □ On the ground               ║
║  □ On a cloud ←                ║
║  □ In the water                ║
╚════════════════════════════════╝
```

---

## 📊 Difficulty Scaling

| Age | Reading Level | Question Type |
|-----|---------------|---------------|
| 6-8 | Simple sentences | Who/What |
| 9-10 | Short paragraphs | Where/When |
| 11-12 | Full paragraphs | Why/How |
| 13-15 | Multiple paragraphs | Inference |
| 16-18 | Complex narrative | Analysis |
| 19-25 | Literary elements | Theme/Symbol |
| 26-35 | Full story chapters | Critical review |

---

## 🎨 Visual Design

### Story Screen
```
┌────────────────────────────────┐
│  📖 Ch.1    🎒 Items: 3        │
│  ████████░░░░ Page 5/12        │
├────────────────────────────────┤
│                                │
│  ☁️ ☁️ 🐰 ☁️ ☁️              │
│                                │
│  ┌────────────────────────┐    │
│  │ The clouds parted to   │    │
│  │ reveal a hidden garden │    │
│  │ of floating flowers... │    │
│  └────────────────────────┘    │
│                                │
│  [🌸 Pick a flower]            │
│  [➡️ Keep floating]            │
│                                │
└────────────────────────────────┘
```

### Question Screen
```
┌────────────────────────────────┐
│  ❓ Comprehension Check        │
├────────────────────────────────┤
│                                │
│  What did Cinnamoroll find     │
│  hidden in the clouds?         │
│                                │
│  ○ A sleeping dragon           │
│  ● A garden of flowers         │
│  ○ A rainbow bridge            │
│  ○ A treasure chest            │
│                                │
│  [Check Answer]                │
│                                │
└────────────────────────────────┘
```

---

## 🗂️ Data Structures

### Story Node
```javascript
{
  id: 'ch1_garden',
  title: 'The Hidden Garden',
  content: 'The clouds parted to reveal...',
  illustration: 'garden_clouds',
  audio: null, // Optional narration
  choices: [
    { text: 'Pick a flower', nextId: 'ch1_flower', item: 'flower' },
    { text: 'Keep floating', nextId: 'ch1_continue' }
  ],
  question: {
    text: 'What did Cinnamoroll find?',
    options: ['dragon', 'garden', 'bridge', 'treasure'],
    answer: 1,
    hint: 'Look at the flowers...'
  }
}
```

### Story Progress
```javascript
{
  currentNodeId: 'ch1_garden',
  storyId: 'cloud_adventure',
  inventory: ['cloud_map', 'flower'],
  questionsAnswered: 12,
  questionsCorrect: 10,
  choicesHistory: ['start', 'ch1_intro', 'ch1_garden'],
  endingsUnlocked: ['happy_ending'],
  readingTime: 450  // seconds
}
```

### Story Definition
```javascript
{
  id: 'cloud_adventure',
  title: 'Cloud Adventure',
  difficulty: 2,
  totalPages: 24,
  endings: ['happy', 'secret', 'adventure'],
  nodes: { /* ... */ }
}
```

---

## 📦 New Modules Needed

### StoryEngine.js
```javascript
class StoryEngine {
  loadStory(storyId)
  getCurrentNode()
  makeChoice(choiceIndex)
  checkAnswer(answerIndex)
  getProgress()
  getInventory()
}
```

### DialogueSystem.js
```javascript
class DialogueSystem {
  displayText(text, speed)
  displayChoice(choices)
  animateCharacter(emotion)
  playNarration(audioUrl)
}
```

### ComprehensionTracker.js
```javascript
class ComprehensionTracker {
  recordAnswer(questionId, correct)
  getAccuracyRate()
  getWeakAreas()
  generateReport()
}
```

---

## 🧪 Test Cases

- [ ] Story loads correctly
- [ ] Choices branch to correct nodes
- [ ] Items are collected properly
- [ ] Questions validate correctly
- [ ] Progress saves and loads
- [ ] All endings are reachable

---

## 📈 Assessment Metrics

| Skill | Weight | Measurement |
|-------|--------|-------------|
| Reading | 40% | Comprehension accuracy |
| Vocabulary | 20% | Word recognition |
| Retention | 25% | Recall questions |
| Speed | 15% | Reading pace |

---

## ✅ Acceptance Criteria

- [ ] Branching narrative works flawlessly
- [ ] Text is age-appropriate per difficulty
- [ ] Questions test actual comprehension
- [ ] Mobile reading experience is comfortable
- [ ] Progress saves reliably
