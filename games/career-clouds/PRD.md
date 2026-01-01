# Career Clouds - Product Requirements Document

> **Build Order: #10** | **Priority: HIGH** | **Complexity: HIGH**

## 📋 Overview

| Field | Value |
|-------|-------|
| **Game Name** | Career Clouds |
| **Type** | Meta-Game Assessment |
| **Target Age** | 6-35 (difficulty scaled) |
| **Primary Theme** | Career Assessment |
| **Secondary Themes** | All Previous Themes |
| **Estimated Dev Time** | 12-15 hours |
| **Dependencies** | ALL previous games |

---

## 🎯 Objectives

### Learning Goals
- **Self-Discovery** (All ages)
- **Strength Identification** (All ages)
- **Career Exploration** (Ages 10+)
- **Goal Setting** (Ages 13+)
- **Decision Making** (Ages 16+)

### Game Goals
- Play mini-games representing careers
- Discover strengths through gameplay
- Explore career paths
- Build a personalized profile
- Get fun career recommendations

---

## 🎮 Gameplay Description

### Core Mechanic
1. Play career-themed mini-games
2. System tracks performance across skills
3. Unlock career cloud islands
4. Explore career information
5. Generate personalized report

### Assessment Flow
```
╔════════════════════════════════╗
║  Career Clouds   🌟 Level 5    ║
╠════════════════════════════════╣
║                                ║
║  Your Career Cloud Map:        ║
║                                ║
║    ☁️🎨    ☁️🔬    ☁️📊      ║
║   Artist  Science  Math       ║
║                                ║
║    ☁️🌍    ☁️📚    ☁️🎭      ║
║   Nature  Teacher  Creative   ║
║                                ║
║    ☁️🏥    ☁️💼    ☁️🔧      ║
║   Helper  Leader  Builder     ║
║                                ║
║  [Explore] [My Profile]        ║
╚════════════════════════════════╝
```

---

## 📊 Difficulty Scaling

| Age | Features | Output |
|-----|----------|--------|
| 6-8 | Simple games, "What I Like" | Fun pictures |
| 9-10 | Basic assessment | Interest areas |
| 11-12 | Skill tracking | Strength map |
| 13-15 | Career exploration | Career matches |
| 16-18 | Detailed assessment | Career paths |
| 19-25 | Full analysis | Industry matches |
| 26-35 | Professional | Development plan |

---

## 🎨 Visual Design

### Career Map Screen
```
┌────────────────────────────────┐
│  🌈 Career Clouds              │
│  Discover Your Strengths!      │
├────────────────────────────────┤
│                                │
│   ☁️──☁️──☁️                  │
│   🎨  🔬  📊                  │
│    \   |   /                   │
│     ☁️─☁️─☁️                  │
│     🌍 📚 🎭                  │
│      \ | /                     │
│       ☁️                       │
│       🐰                       │
│       You!                     │
│                                │
│  Tap a cloud to explore!       │
└────────────────────────────────┘
```

### Strength Profile
```
┌────────────────────────────────┐
│  📊 Your Strength Profile      │
├────────────────────────────────┤
│                                │
│  Math         ████████░░  80%  │
│  Reading      ██████░░░░  60%  │
│  Creativity   █████████░  90%  │
│  Memory       ███████░░░  70%  │
│  Logic        ████████░░  80%  │
│  Writing      ████░░░░░░  40%  │
│                                │
│  Top Careers:                  │
│  🎨 Artist    🔬 Scientist    │
│  💻 Designer  🎮 Game Dev     │
│                                │
│  [View Details] [Share]        │
└────────────────────────────────┘
```

---

## 🗂️ Data Structures

### Skill Assessment
```javascript
{
  skills: {
    math: { score: 80, samples: 45, trend: 'improving' },
    reading: { score: 60, samples: 32, trend: 'stable' },
    creativity: { score: 90, samples: 28, trend: 'improving' },
    memory: { score: 70, samples: 50, trend: 'stable' },
    logic: { score: 80, samples: 38, trend: 'improving' },
    writing: { score: 40, samples: 15, trend: 'stable' },
    spatial: { score: 75, samples: 42, trend: 'improving' },
    social: { score: 65, samples: 20, trend: 'stable' }
  },
  interests: {
    art: 4,
    science: 3,
    nature: 2,
    technology: 5,
    helping: 3
  },
  lastUpdated: '2024-01-15T10:30:00Z'
}
```

### Career Profile
```javascript
{
  id: 'artist',
  title: 'Artist / Designer',
  icon: '🎨',
  description: 'Create beautiful things that people love!',
  requiredSkills: {
    creativity: 0.8,
    spatial: 0.6,
    detail: 0.5
  },
  relatedGames: ['pattern-rainbow', 'puzzle-path'],
  funFacts: [
    'Artists can work in games, movies, or museums!',
    'Some artists use computers, others use paint.'
  ],
  activities: ['Draw a picture', 'Design a logo']
}
```

### Assessment Data Sources
```javascript
{
  gameData: {
    'treasure-chest': { skill: 'memory', weight: 1.0 },
    'star-counter': { skill: 'math', weight: 1.0 },
    'pattern-rainbow': { skill: 'logic', weight: 0.7, creativity: 0.3 },
    'quiz-quest': { skill: 'knowledge', weight: 0.5, memory: 0.5 },
    'candy-shop': { skill: 'math', weight: 0.8, attention: 0.2 },
    'story-cloud': { skill: 'reading', weight: 1.0 },
    'dream-journal': { skill: 'writing', weight: 0.7, creativity: 0.3 },
    'cloud-kingdom': { skill: 'spatial', weight: 0.6, logic: 0.4 },
    'puzzle-path': { skill: 'spatial', weight: 0.5, logic: 0.5 }
  }
}
```

---

## 📦 New Modules Needed

### AssessmentEngine.js
```javascript
class AssessmentEngine {
  aggregateGameData(allGameStats)
  calculateSkillScores()
  identifyStrengths()
  matchCareers(skills, interests)
  generateReport()
}
```

### CareerDatabase.js
```javascript
class CareerDatabase {
  getCareers()
  getCareerById(id)
  matchSkillsToCareer(skills)
  getCareerActivities(id)
}
```

### ProfileManager.js
```javascript
class ProfileManager {
  createProfile(playerData)
  updateProfile(newData)
  exportProfile()
  shareProfile()
}
```

### ReportGenerator.js
```javascript
class ReportGenerator {
  generateFullReport(assessment)
  generateSummary(assessment)
  generatePDF(report)
  generateShareableImage()
}
```

---

## 🎯 Career Categories

| Category | Icon | Related Skills |
|----------|------|----------------|
| Artist | 🎨 | Creativity, Spatial |
| Scientist | 🔬 | Logic, Math |
| Teacher | 📚 | Reading, Social |
| Doctor/Helper | 🏥 | Caring, Memory |
| Engineer | 🔧 | Math, Logic |
| Writer | ✍️ | Writing, Creativity |
| Leader | 💼 | Social, Logic |
| Nature Explorer | 🌍 | Curiosity, Spatial |
| Performer | 🎭 | Creativity, Social |

---

## 🧪 Test Cases

- [ ] Data aggregates from all games
- [ ] Skill calculations are accurate
- [ ] Career matching is sensible
- [ ] Report generates correctly
- [ ] Age-appropriate content
- [ ] Privacy controls work

---

## 📈 Assessment Metrics

| Metric | Source | Weight |
|--------|--------|--------|
| Math Skill | Star Counter, Candy Shop | 100% of game scores |
| Memory | Treasure Chest, Quiz Quest | 100% of game scores |
| Reading | Story Cloud | 100% of game scores |
| Writing | Dream Journal | Word count + consistency |
| Spatial | Cloud Kingdom, Puzzle Path | Efficiency scores |
| Logic | Pattern Rainbow, Puzzles | Accuracy |
| Creativity | Journal, Patterns | Diversity of responses |

---

## ✅ Acceptance Criteria

- [ ] Integrates ALL previous game data
- [ ] Age-appropriate career descriptions
- [ ] Fun and encouraging tone
- [ ] No "bad" results - all strengths
- [ ] Shareable/printable reports
- [ ] Privacy-focused (no external data)
- [ ] Works offline
