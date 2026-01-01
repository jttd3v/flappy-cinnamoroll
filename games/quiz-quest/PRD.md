# Cinnamoroll Quiz Quest - Product Requirements Document

> **Build Order: #4** | **Priority: HIGH** | **Status: IMPLEMENTED ✅**

## 📋 Overview

| Field | Value |
|-------|-------|
| **Game Name** | Cinnamoroll Quiz Quest |
| **Type** | Adventure + Quiz Hybrid |
| **Target Age** | 6-35 (difficulty scaled via 7 levels) |
| **Primary Theme** | Trivia Adventure with Map Exploration |
| **Secondary Themes** | Knowledge Testing, Streaks, Time Management |
| **Implementation** | Single-file architecture (QuizQuestGame.js) |
| **Total Questions** | ~90 questions across 6 categories |

---

## 🎯 Current Implementation

### Learning Goals
- **Knowledge recall** - Facts across 6 subject categories
- **Reading comprehension** - Understanding question text
- **Critical thinking** - Selecting correct answers from choices
- **Time management** - Answering under pressure (difficulty 2+)

### Game Goals
- Explore a visual world map with 6 themed locations
- Answer 5 questions per location
- Earn points, stars, and maintain streaks
- Unlock all locations to achieve victory

---

## 🎮 Gameplay Description

### Core Game Flow
1. Player starts at the **Start Screen** showing high score
2. Clicking "Start Adventure" opens the **World Map**
3. Player clicks on an unlocked location to see its info
4. Clicking "Enter" starts a **5-question quiz** for that category
5. Each correct answer earns points + 1 star
6. Wrong answers lose 1 life (3 starting lives)
7. Complete location → unlock next location
8. All 6 locations complete → **Victory Screen**
9. Lose all lives → **Game Over Screen**

### Question Flow (Quizizz-Style UI)
```
┌─────────────────────────────────────┐
│  🔬 Science          Score: 350     │
│  ─────────────────────────────────  │
│  Question 2/5     ● ○ ○ ○ ○         │
│                                     │
│  ┌─────┐  What is the largest       │
│  │ 28  │  organ in the human body?  │
│  └─────┘                            │
│  (timer)                            │
│                                     │
│  ┌────────────┐  ┌────────────┐     │
│  │   Skin     │  │   Heart    │     │
│  └────────────┘  └────────────┘     │
│  ┌────────────┐  ┌────────────┐     │
│  │   Brain    │  │   Liver    │     │
│  └────────────┘  └────────────┘     │
└─────────────────────────────────────┘
```

---

## 📊 Difficulty System

### 🚨 PLANNED: Adaptive Performance-Based Difficulty

> **Status:** 📋 PLANNED | **Priority:** HIGH

Replace age-based difficulty with **real-time adaptive difficulty** based on player performance.

#### Performance Metrics Tracked

| Metric | Description | Weight |
|--------|-------------|--------|
| **Response Speed** | Time taken to answer (seconds) | 40% |
| **Accuracy Rate** | Correct answers / Total answers | 60% |

#### Initial Calibration System

> 🛡️ **Defensive Programming:** Never assume player skill level. Always calibrate first.

Before main gameplay, run **3 warm-up calibration questions** at medium difficulty (Level 3) to determine starting level.

```javascript
const CALIBRATION_CONFIG = {
  QUESTIONS_COUNT: 3,           // Warm-up questions
  BASE_LEVEL: 3,                // Start calibration at Champion level
  MIN_LEVEL: 1,                 // Floor
  MAX_LEVEL: 7,                 // Ceiling
  WINDOW_SIZE: 5,               // Rolling answer window
  DEFAULT_SPEED_SCORE: 0.5     // Fallback when no timer
};
```

| Calibration Result | Starting Level |
|--------------------|----------------|
| 0/3 correct | Level 1 (Explorer) |
| 1/3 correct | Level 2 (Adventurer) |
| 2/3 correct | Level 3 (Champion) |
| 3/3 correct, slow | Level 4 (Hero) |
| 3/3 correct, fast | Level 5 (Legend) |

#### Adaptive Algorithm (with Defensive Programming)

```javascript
class AdaptiveDifficulty {
  constructor() {
    this.currentLevel = CALIBRATION_CONFIG.BASE_LEVEL;
    this.recentAnswers = [];
    this.isCalibrated = false;
    this.calibrationAnswers = [];
  }

  // ========== DEFENSIVE: Input Validation ==========
  
  validateInputs(responseTimeMs, maxTimeMs) {
    // Guard against null/undefined
    if (typeof responseTimeMs !== 'number' || isNaN(responseTimeMs)) {
      console.warn('[AdaptiveDifficulty] Invalid responseTimeMs, defaulting to maxTime');
      responseTimeMs = maxTimeMs || 30000;
    }
    // Guard against negative values
    if (responseTimeMs < 0) responseTimeMs = 0;
    if (maxTimeMs < 0) maxTimeMs = 30000;
    
    return { responseTimeMs, maxTimeMs };
  }

  // ========== CALIBRATION PHASE ==========
  
  recordCalibrationAnswer(isCorrect, responseTimeMs, maxTimeMs) {
    const validated = this.validateInputs(responseTimeMs, maxTimeMs);
    const speedScore = this.calculateSpeedScore(validated.responseTimeMs, validated.maxTimeMs);
    
    this.calibrationAnswers.push({ isCorrect, speedScore });
    
    if (this.calibrationAnswers.length >= CALIBRATION_CONFIG.QUESTIONS_COUNT) {
      this.finalizeCalibration();
    }
  }
  
  finalizeCalibration() {
    const correct = this.calibrationAnswers.filter(a => a.isCorrect).length;
    const avgSpeed = this.calibrationAnswers.reduce((sum, a) => sum + a.speedScore, 0) 
                     / this.calibrationAnswers.length;
    
    // Determine starting level based on calibration
    if (correct === 0) {
      this.currentLevel = 1;
    } else if (correct === 1) {
      this.currentLevel = 2;
    } else if (correct === 2) {
      this.currentLevel = 3;
    } else if (correct === 3 && avgSpeed < 0.6) {
      this.currentLevel = 4;  // All correct but slow
    } else {
      this.currentLevel = 5;  // All correct and fast
    }
    
    this.isCalibrated = true;
    this.saveToStorage();  // Persist calibration result
  }

  // ========== MAIN TRACKING ==========
  
  recordAnswer(isCorrect, responseTimeMs, maxTimeMs) {
    // DEFENSIVE: Validate all inputs
    const validated = this.validateInputs(responseTimeMs, maxTimeMs);
    const speedScore = this.calculateSpeedScore(validated.responseTimeMs, validated.maxTimeMs);
    
    this.recentAnswers.push({ isCorrect, speedScore, timestamp: Date.now() });
    
    // DEFENSIVE: Enforce window size limit
    while (this.recentAnswers.length > CALIBRATION_CONFIG.WINDOW_SIZE) {
      this.recentAnswers.shift();
    }
    
    this.updateDifficulty();
    this.saveToStorage();  // Persist after each answer
  }

  calculateSpeedScore(responseTimeMs, maxTimeMs) {
    // DEFENSIVE: Handle no-timer mode (Explorer difficulty)
    if (!maxTimeMs || maxTimeMs === null || maxTimeMs <= 0) {
      return CALIBRATION_CONFIG.DEFAULT_SPEED_SCORE;  // Neutral score
    }
    
    // DEFENSIVE: Clamp ratio between 0 and 1
    const ratio = Math.max(0, Math.min(1, responseTimeMs / maxTimeMs));
    
    if (ratio < 0.25) return 1.0;   // Very fast
    if (ratio < 0.50) return 0.75;  // Fast
    if (ratio < 0.75) return 0.5;   // Moderate
    return 0.25;                     // Slow
  }

  updateDifficulty() {
    // DEFENSIVE: Require minimum data before adjusting
    if (this.recentAnswers.length < 3) return;
    
    const correct = this.recentAnswers.filter(a => a.isCorrect).length;
    const accuracy = correct / this.recentAnswers.length;
    
    // DEFENSIVE: Guard against division by zero
    const avgSpeed = this.recentAnswers.length > 0 
      ? this.recentAnswers.reduce((sum, a) => sum + (a.speedScore || 0), 0) / this.recentAnswers.length
      : CALIBRATION_CONFIG.DEFAULT_SPEED_SCORE;
    
    // Combined performance score (0-1)
    const performance = (accuracy * 0.6) + (avgSpeed * 0.4);
    
    // DEFENSIVE: Clamp level within valid bounds
    if (performance > 0.8 && this.currentLevel < CALIBRATION_CONFIG.MAX_LEVEL) {
      this.currentLevel++;
    } else if (performance < 0.4 && this.currentLevel > CALIBRATION_CONFIG.MIN_LEVEL) {
      this.currentLevel--;
    }
    
    // DEFENSIVE: Final bounds check
    this.currentLevel = Math.max(
      CALIBRATION_CONFIG.MIN_LEVEL, 
      Math.min(CALIBRATION_CONFIG.MAX_LEVEL, this.currentLevel)
    );
  }

  // ========== PERSISTENCE ==========
  
  saveToStorage() {
    try {
      const data = {
        currentLevel: this.currentLevel,
        isCalibrated: this.isCalibrated,
        recentAnswers: this.recentAnswers,
        lastUpdated: Date.now()
      };
      localStorage.setItem('quizQuestAdaptive', JSON.stringify(data));
    } catch (e) {
      console.warn('[AdaptiveDifficulty] Failed to save:', e);
      // DEFENSIVE: Continue without storage - don't break the game
    }
  }
  
  loadFromStorage() {
    try {
      const data = JSON.parse(localStorage.getItem('quizQuestAdaptive'));
      if (data && typeof data.currentLevel === 'number') {
        this.currentLevel = Math.max(
          CALIBRATION_CONFIG.MIN_LEVEL,
          Math.min(CALIBRATION_CONFIG.MAX_LEVEL, data.currentLevel)
        );
        this.isCalibrated = data.isCalibrated || false;
        this.recentAnswers = Array.isArray(data.recentAnswers) ? data.recentAnswers : [];
      }
    } catch (e) {
      console.warn('[AdaptiveDifficulty] Failed to load, using defaults:', e);
      // DEFENSIVE: Use defaults on error
      this.reset();
    }
  }
  
  reset() {
    this.currentLevel = CALIBRATION_CONFIG.BASE_LEVEL;
    this.recentAnswers = [];
    this.isCalibrated = false;
    this.calibrationAnswers = [];
  }
}
```

#### Difficulty Adjustment Rules

| Performance Score | Action | Condition |
|-------------------|--------|----------|
| > 80% | **Increase** difficulty | Fast + Accurate |
| 40-80% | **Maintain** difficulty | Comfortable zone |
| < 40% | **Decrease** difficulty | Struggling |

#### Speed Thresholds (for 30s timer)

| Response Time | Speed Rating | Score |
|---------------|--------------|-------|
| < 7.5s | Very Fast | 1.0 |
| 7.5-15s | Fast | 0.75 |
| 15-22.5s | Moderate | 0.5 |
| > 22.5s | Slow | 0.25 |

#### UI Feedback for Difficulty Changes

```
┌─────────────────────────────────┐
│  📈 Level Up!                   │
│  You're doing great!            │
│  Questions will be harder now.  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  💪 Keep Trying!                │
│  Let's make it a bit easier.   │
└─────────────────────────────────┘
```

---

### Current: Age-Based Difficulty (DEPRECATED)

> ⚠️ **To be replaced** by adaptive system above

```javascript
getDifficultyFromAge(age):
  age ≤ 8   → Difficulty 1 (Explorer)
  age ≤ 10  → Difficulty 2 (Adventurer)
  age ≤ 12  → Difficulty 3 (Champion)
  age ≤ 15  → Difficulty 4 (Hero)
  age ≤ 18  → Difficulty 5 (Legend)
  age ≤ 25  → Difficulty 6 (Master)
  age > 25  → Difficulty 7 (Sage)
```

### Difficulty Presets (DIFFICULTY_PRESETS)

| Level | Name | Choices | Time Limit | Hints |
|-------|------|---------|------------|-------|
| 1 | Explorer | 3 | None | 5 |
| 2 | Adventurer | 3 | 60s | 4 |
| 3 | Champion | 4 | 45s | 3 |
| 4 | Hero | 4 | 30s | 2 |
| 5 | Legend | 4 | 25s | 1 |
| 6 | Master | 4 | 20s | 0 |
| 7 | Sage | 5 | 15s | 0 |

### Difficulty-to-Question-Tier Mapping

> 🛡️ **Defensive Programming:** Questions only have 5 tiers, but difficulty has 7 levels. Define explicit mapping with fallback.

| Difficulty Level | Question Tier | Fallback |
|------------------|---------------|----------|
| 1 (Explorer) | Tier 1 | - |
| 2 (Adventurer) | Tier 2 | Tier 1 |
| 3 (Champion) | Tier 3 | Tier 2 |
| 4 (Hero) | Tier 4 | Tier 3 |
| 5 (Legend) | Tier 5 | Tier 4 |
| 6 (Master) | Tier 5 | Tier 4 |
| 7 (Sage) | Tier 5 | Tier 4 |

```javascript
function getQuestionTier(difficultyLevel) {
  // DEFENSIVE: Clamp difficulty to valid range
  const level = Math.max(1, Math.min(7, difficultyLevel || 3));
  
  // Map difficulty to question tier (max tier is 5)
  const tierMap = {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 5,  // Master uses Tier 5 (hardest available)
    7: 5   // Sage uses Tier 5 (hardest available)
  };
  
  return tierMap[level] || 3;  // DEFENSIVE: Default to Tier 3
}

function getQuestionWithFallback(category, tier) {
  // DEFENSIVE: Try requested tier, fallback to lower tiers
  for (let t = tier; t >= 1; t--) {
    const questions = QUESTION_BANK[category]?.[t];
    if (questions && questions.length > 0) {
      return questions;
    }
  }
  
  // DEFENSIVE: Ultimate fallback - any questions from category
  console.warn(`[QuestionEngine] No questions found for ${category} tier ${tier}, using fallback`);
  return QUESTION_BANK[category]?.[1] || [];
}
```

---

## 📚 Question Bank Structure

### Categories (6 Total)

| Category | Icon | Color | Name |
|----------|------|-------|------|
| science | 🔬 | #4CAF50 | Science |
| math | 🔢 | #2196F3 | Math |
| language | 📚 | #9C27B0 | Language |
| geography | 🌍 | #FF9800 | Geography |
| history | 📜 | #795548 | History |
| logic | 🧩 | #607D8B | Logic |

### Current Question Count by Category & Tier

| Category | Tier 1 | Tier 2 | Tier 3 | Tier 4 | Tier 5 | Total |
|----------|--------|--------|--------|--------|--------|-------|
| Science | 5 | 5 | 5 | 5 | 4 | **24** |
| Math | 5 | 5 | 5 | 4 | 4 | **23** |
| Geography | 5 | 4 | 4 | 3 | - | **16** |
| History | 3 | 3 | 3 | 3 | - | **12** |
| Logic | 3 | 3 | 3 | 2 | - | **11** |
| Language | 5 | 5 | 5 | 5 | 4 | **24** |
| **Total** | | | | | | **~110** |

---

### 🚨 PLANNED: Expanded Question Bank

> **Status:** 📋 PLANNED | **Priority:** HIGH | **Target:** 300+ questions

#### Target Question Count

| Category | Tier 1 | Tier 2 | Tier 3 | Tier 4 | Tier 5 | Total | +New |
|----------|--------|--------|--------|--------|--------|-------|------|
| Science | 15 | 15 | 12 | 10 | 8 | **60** | +36 |
| Math | 15 | 15 | 12 | 10 | 8 | **60** | +37 |
| Geography | 12 | 12 | 10 | 8 | 8 | **50** | +34 |
| History | 12 | 12 | 10 | 8 | 8 | **50** | +38 |
| Logic | 10 | 10 | 10 | 10 | 10 | **50** | +39 |
| Language | 15 | 12 | 10 | 8 | 5 | **50** | +26 |
| **Total** | | | | | | **320** | +210 |

#### New Questions to Add by Category

##### 🔬 Science (+36 questions)

**Tier 1 (Easy) - Add 10:**
- What do caterpillars become? → Butterflies
- What is the hottest planet? → Venus
- How many legs does a butterfly have? → 6
- What gas do plants breathe in? → Carbon dioxide
- What is the Earth's largest layer? → Mantle
- What animal has the longest lifespan? → Tortoise
- What is rain made of? → Water
- What do we call baby frogs? → Tadpoles
- Which planet has rings? → Saturn
- What makes a rainbow? → Sunlight and rain

**Tier 2 (Medium) - Add 10:**
- What is the largest mammal? → Blue whale
- What part of the plant makes food? → Leaves
- How many bones in the human body? → 206
- What causes thunder? → Lightning heating air
- What is the smallest bone in the body? → Stapes (ear)
- What vitamin comes from sunlight? → Vitamin D
- What are baby kangaroos called? → Joeys
- What is the study of weather called? → Meteorology
- How fast does light travel? → 300,000 km/s
- What planet is closest to the sun? → Mercury

**Tier 3-5 (Hard) - Add 16:**
- Newton's first law is called? → Law of Inertia
- What is the pH of pure water? → 7
- What organelle produces ATP? → Mitochondria
- What is the most abundant element in the universe? → Hydrogen
- What is the half-life of Carbon-14? → ~5,730 years
- What is Avogadro's number? → 6.022 × 10²³
- (etc.)

##### 🔢 Math (+37 questions)

**Tier 1 (Easy) - Add 10:**
- What is 10 - 4? → 6
- How many sides does a pentagon have? → 5
- What is 3 × 3? → 9
- What is double 15? → 30
- How many minutes in an hour? → 60
- What is 20 ÷ 5? → 4
- What comes after 99? → 100
- What shape has 4 equal sides? → Square
- What is 8 + 7? → 15
- How many days in a week? → 7

**Tier 2 (Medium) - Add 10:**
- What is 144 ÷ 12? → 12
- What is 33% as a fraction? → 1/3
- What is the perimeter of a 5x5 square? → 20
- What is 7²? → 49
- What is 1000 - 247? → 753
- How many degrees in a straight line? → 180
- What is 0.5 as a percentage? → 50%
- What is the area of a 4×6 rectangle? → 24
- What is √144? → 12
- What is 15% of 200? → 30

**Tier 3-5 (Hard) - Add 17:**
- What is the integral of 2x? → x² + C
- What is tan(45°)? → 1
- Solve: 3x - 7 = 14 → x = 7
- What is the sum of interior angles of a hexagon? → 720°
- What is e to the power of 0? → 1
- What is log₂(8)? → 3
- (etc.)

##### 🌍 Geography (+34 questions)

**Tier 1-2 (Easy/Medium) - Add 17:**
- What is the smallest continent? → Australia
- What ocean is the warmest? → Indian Ocean
- What country has the most islands? → Sweden
- What is the capital of Japan? → Tokyo
- What river runs through Egypt? → Nile
- What is the largest country by area? → Russia
- What continent is Egypt in? → Africa
- What is the capital of Canada? → Ottawa
- Which country is known as the Land of the Rising Sun? → Japan
- What is the longest river in Europe? → Volga
- (etc.)

**Tier 3-5 (Hard) - Add 17:**
- What is the driest place on Earth? → Atacama Desert
- What is the capital of Bhutan? → Thimphu
- What sea is the saltiest? → Dead Sea
- What country has the most time zones? → France (12)
- What is the largest landlocked country? → Kazakhstan
- (etc.)

##### 📜 History (+38 questions)

**Tier 1-2 (Easy/Medium) - Add 19:**
- Who invented the telephone? → Alexander Graham Bell
- What year did the moon landing happen? → 1969
- Who was the first woman to fly solo across the Atlantic? → Amelia Earhart
- What ancient wonder was in Egypt? → Great Pyramid of Giza
- Who wrote Romeo and Juliet? → William Shakespeare
- What was the longest war in history? → Reconquista (~781 years)
- Who discovered penicillin? → Alexander Fleming
- What year did World War I start? → 1914
- (etc.)

**Tier 3-5 (Hard) - Add 19:**
- What was the capital of the Byzantine Empire? → Constantinople
- Who was the first Holy Roman Emperor? → Charlemagne
- What year was the Magna Carta signed? → 1215
- Who led the Bolshevik Revolution? → Vladimir Lenin
- What treaty ended the Thirty Years' War? → Peace of Westphalia
- (etc.)

##### 🧩 Logic (+39 questions)

**All Tiers - Add 39:**
- What comes next: 1, 4, 9, 16, ? → 25 (squares)
- If all roses are flowers, are all flowers roses? → No
- What comes next: A, C, E, G, ? → I
- Which doesn't belong: 2, 4, 7, 8? → 7 (not even)
- If yesterday was Tuesday, what day is tomorrow? → Thursday
- Complete: 🔴🔵🔴🔵🔴? → 🔵
- What is the next prime: 2, 3, 5, 7, ? → 11
- Mirror of 'NOON' is? → NOON
- (etc.)

##### 📚 Language (+26 questions)

**Tier 1-2 (Easy/Medium) - Add 13:**
- What is the plural of "mouse"? → Mice
- What is the past tense of "go"? → Went
- Which word is a verb: "run", "blue", "happy"? → Run
- What punctuation ends a question? → Question mark (?)
- What is a word that sounds like another but has different meaning? → Homophone
- What is the opposite of "generous"? → Stingy/Selfish
- (etc.)

**Tier 3-5 (Hard) - Add 13:**
- What does "onomatopoeia" mean? → Words that imitate sounds
- What is a group of crows called? → Murder
- What does "quintessential" mean? → Perfect example of something
- What is the study of word origins called? → Etymology
- (etc.)

#### Implementation Plan

1. **Phase 1:** Add 50 questions (Science + Math priority)
2. **Phase 2:** Add 50 questions (Geography + History)
3. **Phase 3:** Add 50 questions (Logic + Language)
4. **Phase 4:** Add remaining 60 questions + balance tiers

### Question Object Format
```javascript
{
  q: "What is the largest organ in the human body?",
  a: "Skin",                    // Correct answer
  wrong: ["Heart", "Brain", "Liver"]  // Wrong options
}
```

---

## 🗺️ World Map System

### Map Locations (MAP_LOCATIONS)

| ID | Name | Category | Position (x,y) | Default |
|----|------|----------|----------------|---------|
| forest | Wisdom Forest | science | (75, 260) | Unlocked |
| mountain | Math Mountain | math | (190, 200) | Unlocked |
| village | Word Village | language | (305, 245) | Locked |
| ocean | Geography Ocean | geography | (95, 130) | Locked |
| castle | History Castle | history | (280, 90) | Locked |
| temple | Logic Temple | logic | (190, 40) | Locked |

### Map Features
- **Canvas-based rendering** (380×320 pixels)
- **Sky gradient background** with animated clouds ⚠️ *See visual redesign below*
- **Dashed path lines** connecting locations
- **Location markers** with category icons
- **Lock indicators** (🔒) for locked locations
- **Selection highlight** (pink border + enlarged)

---

### 🚨 PLANNED: Visual Redesign - Solid Soft Colors

> **Status:** 📋 PLANNED | **Priority:** MEDIUM

#### Objective
Replace all gradient backgrounds with **solid soft primary colors** for a cleaner, more kawaii aesthetic that matches the Cinnamoroll theme.

#### Color Palette

| Element | Current | New Color | Hex Code |
|---------|---------|-----------|----------|
| Map Background | Sky gradient (#87CEEB) | Soft Sky Blue | `#B8E4F0` |
| Quiz Screen BG | Gradient | Soft Lavender | `#E8E0F0` |
| Start Screen BG | Gradient | Soft Pink | `#FFE4EC` |
| Result Screen BG | Gradient | Soft Mint | `#E0F5E8` |
| Game Over BG | Gradient | Soft Peach | `#FFE8DC` |

#### Answer Button Colors (Solid, No Gradients)

| Button Position | Color Name | Hex Code |
|-----------------|------------|----------|
| Top-Left | Soft Red | `#FFB3B3` |
| Top-Right | Soft Blue | `#B3D4FF` |
| Bottom-Left | Soft Yellow | `#FFF0B3` |
| Bottom-Right | Soft Green | `#B3FFB3` |

#### Category-Specific Colors (Updated)

| Category | Current | New Soft Color | Hex |
|----------|---------|----------------|-----|
| Science | #4CAF50 | Soft Green | `#A8E6CF` |
| Math | #2196F3 | Soft Blue | `#A8D8EA` |
| Language | #9C27B0 | Soft Purple | `#DDA0DD` |
| Geography | #FF9800 | Soft Orange | `#FFDAB3` |
| History | #795548 | Soft Brown | `#D4C4B0` |
| Logic | #607D8B | Soft Gray-Blue | `#B8C5D0` |

#### Implementation Changes

##### MapRenderer.js Changes
```javascript
// BEFORE (gradient approximation)
ctx.fillStyle = '#87CEEB';
ctx.fillRect(0, 0, width, height);

// AFTER (solid soft color)
ctx.fillStyle = '#B8E4F0';  // Soft Sky Blue
ctx.fillRect(0, 0, width, height);
```

##### CSS Changes
```css
/* BEFORE */
.quiz-screen {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* AFTER */
.quiz-screen {
  background-color: #E8E0F0;  /* Soft Lavender */
}

.start-screen {
  background-color: #FFE4EC;  /* Soft Pink */
}

.result-screen {
  background-color: #E0F5E8;  /* Soft Mint */
}

.gameover-screen {
  background-color: #FFE8DC;  /* Soft Peach */
}

/* Answer buttons - remove gradients */
.answer-btn:nth-child(1) { background-color: #FFB3B3; }
.answer-btn:nth-child(2) { background-color: #B3D4FF; }
.answer-btn:nth-child(3) { background-color: #FFF0B3; }
.answer-btn:nth-child(4) { background-color: #B3FFB3; }
```

#### Cloud Styling (Keep but Simplify)
```javascript
// Clouds remain white but with solid opacity
ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';  // Slightly more opaque
```

#### Timer Ring Colors (Updated)

| Time State | Current | New Soft Color |
|------------|---------|----------------|
| Plenty (>10s) | #00ff88 | `#90EE90` (Light Green) |
| Warning (5-10s) | #ffa502 | `#FFD580` (Soft Orange) |
| Critical (<5s) | #ff4757 | `#FF9999` (Soft Red) |

---

## 💯 Scoring System

### Configuration (QUIZ_CONFIG)
```javascript
CORRECT_POINTS: 100        // Base points per correct answer
STREAK_BONUS: 25           // Bonus per streak level
TIME_BONUS_PER_SECOND: 5   // Bonus for remaining time
PERFECT_LOCATION_BONUS: 200 // Bonus for 5/5 correct
```

### Point Calculation
```
Points = 100 (base)
       + (streak × 25)
       + (timeRemaining × 5)
```

### Stars
- **+1 star** per correct answer
- Displayed in map UI and result screens

### Streak System
- Increments on correct answer
- Resets to 0 on wrong answer
- Visual indicator shows "🔥 X in a row!" for streak ≥2

---

## ❤️ Lives System

| Setting | Value |
|---------|-------|
| Starting Lives | 3 |
| Max Lives | 5 |
| Lost per wrong answer | 1 |
| Game Over condition | Lives = 0 |

---

## ⏱️ Timer System (Quizizz Ring Style)

### Visual Implementation
- **Circular SVG ring** timer
- **Color-coded urgency**:
  - Green (#00ff88): > 10 seconds
  - Orange (#ffa502): 5-10 seconds  
  - Red (#ff4757): ≤ 5 seconds (with pulse animation)
- **Time out = wrong answer** (auto-selects null)

---

## 🏗️ Code Architecture

### Classes

#### QuizQuestGame (Main Class)
**Properties:**
- `difficulty` - Current difficulty level (1-7)
- `lives` - Remaining lives
- `score` - Current score
- `streak` - Current answer streak
- `totalStars` - Stars collected
- `currentLocation` - Selected map location
- `currentQuestion` - Active question object
- `questionIndex` - Question number in location (0-4)
- `questionsPerLocation` - Fixed at 5
- `correctInLocation` - Correct answers in current location
- `isPlaying` - Game active state
- `unlockedLocations` - Array of unlocked location IDs

**Methods:**
| Method | Description |
|--------|-------------|
| `init()` | Load progress, setup listeners, show start screen |
| `startGame()` | Reset state, set difficulty from age, show map |
| `handleMapClick(e)` | Detect location clicks on canvas |
| `selectLocation(location)` | Show location info panel |
| `enterLocation()` | Start quiz for selected location |
| `showNextQuestion()` | Load and display next question |
| `renderProgressDots()` | Update question progress UI |
| `renderAnswers()` | Create answer buttons |
| `selectAnswer(answer)` | Process answer selection |
| `handleCorrectAnswer()` | Add points, streak, star |
| `handleWrongAnswer()` | Reset streak, lose life |
| `showFeedback(isCorrect, answer)` | Display result overlay |
| `continueQuiz()` | Advance to next question |
| `completeLocation()` | Finish location, unlock next |
| `unlockNextLocation()` | Add next location to unlocked |
| `showVictory()` | Display win screen |
| `gameOver()` | Display game over screen |
| `startTimer(seconds)` | Begin countdown timer |
| `stopTimer()` | Clear timer interval |
| `updateTimerDisplay()` | Update ring visual |
| `goHome()` | Return to start screen |
| `getHighScore()` | Load from localStorage |
| `saveHighScore(score)` | Save to localStorage |
| `loadProgress()` | Load unlocked locations |
| `saveProgress()` | Save unlocked locations |
| `playSound(type)` | Play audio SFX |

#### MapRenderer
**Methods:**
| Method | Description |
|--------|-------------|
| `render(unlockedLocations)` | Draw full map |
| `drawClouds(ctx)` | Render cloud decorations |
| `drawPaths(ctx, unlocked)` | Draw connecting paths |
| `drawLocation(ctx, loc, unlocked)` | Draw single location |
| `getLocationAt(x, y)` | Hit-test for clicks |
| `selectLocation(location)` | Set selected location |

#### QuestionEngine
**Methods:**
| Method | Description |
|--------|-------------|
| `getQuestion(category, difficulty)` | Get random unused question |
| `shuffleArray(array)` | Fisher-Yates shuffle |
| `reset()` | Clear used questions set |

---

## 💾 Storage

### localStorage Keys
| Key | Data |
|-----|------|
| `quizQuestLeaderboard` | High score (integer) |
| `quizQuestProgress` | `{ unlockedLocations: string[] }` |

---

## 🖥️ Screens

| Screen ID | Purpose |
|-----------|---------|
| `start-screen` | Title, high score, start button |
| `map-screen` | World map, location selection |
| `quiz-screen` | Question display, answers, timer |
| `result-screen` | Victory stats, play again |
| `gameover-screen` | Defeat stats, retry/quit |

---

## 🔊 Audio Integration

Integrates with global `gameAudio` object:
- `playMusic('quiz')` - Background music on game start
- `playSFX('correct')` - Correct answer
- `playSFX('wrong')` - Wrong answer
- `playSFX('start')` - Enter location
- `playSFX('levelup')` - Complete location
- `playSFX('victory')` - Perfect score / win game
- `playSFX('gameover')` - Lose all lives
- `stopMusic()` - On victory/game over

---

## ✅ Implementation Status

### Completed Features
- [x] Age-based 7-tier difficulty system
- [x] 6 category question bank (~110 questions)
- [x] Canvas-based world map with 6 locations
- [x] Location unlock progression
- [x] 5 questions per location
- [x] Quizizz-style timer ring
- [x] Scoring with streaks and time bonus
- [x] Lives system (3 lives)
- [x] Progress persistence (localStorage)
- [x] High score tracking
- [x] Audio integration
- [x] Answer feedback overlay
- [x] Victory and Game Over screens

### Not Implemented (Future Enhancements)
- [ ] Power-ups (hint, 50/50, skip) - Config exists, UI not implemented
- [ ] Boss battles
- [ ] Daily quiz mode
- [ ] Question explanations
- [ ] Image-based questions for young players
- [ ] Achievement badges
- [ ] Multiplayer mode

### 🔜 Planned Enhancements (This Sprint)

| Enhancement | Priority | Status | Description |
|-------------|----------|--------|-------------|
| **Adaptive Difficulty** | 🔴 HIGH | 📋 Planned | Replace age-based with speed+accuracy based |
| **Expanded Questions** | 🔴 HIGH | 📋 Planned | Add 210 new questions (110 → 320 total) |
| **Visual Redesign** | 🟡 MEDIUM | 📋 Planned | Replace gradients with solid soft colors |

---

## 🛡️ Defensive Programming Principles

> Applied throughout the codebase to ensure robustness.

### Input Validation

| Input | Validation | Fallback |
|-------|------------|----------|
| `responseTimeMs` | Must be number, non-negative | `maxTimeMs` or 30000 |
| `maxTimeMs` | Must be number, positive | 30000 (30 seconds) |
| `difficultyLevel` | Must be 1-7 | 3 (Champion) |
| `questionTier` | Must be 1-5 | Cascade down to available tier |
| `category` | Must exist in QUESTION_BANK | First available category |

### Null/Undefined Guards

```javascript
// PATTERN: Always provide defaults
const level = difficultyLevel ?? CALIBRATION_CONFIG.BASE_LEVEL;
const timer = maxTimeMs || null;  // Explicit null for no-timer mode
const score = speedScore ?? CALIBRATION_CONFIG.DEFAULT_SPEED_SCORE;
```

### Bounds Checking

```javascript
// PATTERN: Clamp values within valid ranges
this.currentLevel = Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, this.currentLevel));
const ratio = Math.max(0, Math.min(1, responseTimeMs / maxTimeMs));
const tier = Math.max(1, Math.min(5, requestedTier));
```

### Storage Safety

```javascript
// PATTERN: Try-catch all localStorage operations
try {
  localStorage.setItem(key, JSON.stringify(data));
} catch (e) {
  console.warn('Storage failed:', e);
  // Continue without storage - game still playable
}
```

### Fallback Chains

```javascript
// PATTERN: Multiple fallback levels
const questions = 
  QUESTION_BANK[category]?.[tier] ||     // 1. Requested
  QUESTION_BANK[category]?.[tier - 1] || // 2. Lower tier
  QUESTION_BANK[category]?.[1] ||        // 3. Easiest tier
  QUESTION_BANK['science']?.[1] ||       // 4. Default category
  [{ q: 'What is 1+1?', a: '2', wrong: ['1', '3'] }];  // 5. Ultimate fallback
```

### Error Logging (Non-Breaking)

```javascript
// PATTERN: Warn but don't crash
console.warn(`[Component] Unexpected state: ${state}, using default`);
// NOT: throw new Error(...)
```

---

## 🧪 Test Cases

### Functional
- [x] Questions load correctly per category
- [x] Timer works accurately
- [x] Map progression unlocks properly
- [x] Score calculates correctly (base + streak + time)
- [x] Lives system works
- [x] No duplicate questions per session (tracking in usedQuestions Set)

### Edge Cases
- [x] Timer runs out = wrong answer
- [x] No more lives = game over
- [x] Complete all locations = victory
- [x] Questions recycle when all used in category

---

## 📈 Assessment Metrics

| Skill Category | Measurement |
|----------------|-------------|
| Knowledge | Correct % by subject |
| Processing Speed | Average answer time |
| Persistence | Retry and completion rate |
| Consistency | Streak maintenance |

---

## 🔗 Dependencies

### External
- `PlayerManager` (optional) - For age-based difficulty
- `gameAudio` (optional) - For sound effects

### Internal Components
- `QUIZ_CONFIG` - Game constants
- `DIFFICULTY_PRESETS` - Difficulty settings
- `CATEGORIES` - Category metadata
- `QUESTION_BANK` - All questions
- `MAP_LOCATIONS` - Map location data
