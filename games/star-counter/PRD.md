# Cinnamoroll's Star Counter - Product Requirements Document

> **Build Order: #2** | **Priority: HIGH** | **Complexity: MEDIUM**

## 📋 Overview

| Field | Value |
|-------|-------|
| **Game Name** | Cinnamoroll's Star Counter |
| **Type** | Arcade + Math Education |
| **Target Age** | 6-35 (difficulty scaled) |
| **Primary Theme** | Math |
| **Secondary Themes** | Fun, Visual, Rewards |
| **Estimated Dev Time** | 6-8 hours |
| **Dependencies** | PhysicsEngine, Collision, InputManager |

---

## 🎯 Objectives

### Learning Goals
- **Number recognition** (Ages 6-8)
- **Basic arithmetic** (Ages 9-12) - Addition, subtraction
- **Intermediate math** (Ages 13-18) - Multiplication, division
- **Advanced math** (Ages 19-35) - Fractions, percentages, algebra

### Game Goals
- Catch the correct answer before it falls
- Build combos for consecutive correct answers
- Avoid wrong answers (penalty)
- Beat high scores

---

## 🎮 Gameplay Description

### Core Mechanic
1. A math problem appears at top of screen (e.g., "2 + 3 = ?")
2. Multiple stars fall from the sky, each with a number
3. Player moves Cinnamoroll left/right to catch the CORRECT answer
4. Correct catch = points + combo multiplier
5. Wrong catch = lose a life (or penalty)
6. Stars that fall off screen = missed (neutral or penalty)

### Player Movement
- **Desktop**: Arrow keys or A/D keys
- **Mobile**: Tilt device OR touch left/right sides
- **Alternative**: Swipe to move

### Win/Lose Conditions
- **Win**: Reach target score OR survive time limit
- **Lose**: Lose all lives (3 lives default)

### Scoring System
```
Correct Answer: +100 points × combo multiplier
Wrong Answer: -50 points, reset combo, lose life
Missed (fell): -0 points (easy) / -25 points (hard)

Combo Multiplier:
1 correct = 1x
2 correct = 1.5x
3 correct = 2x
5 correct = 3x
10 correct = 5x
```

---

## 📊 Difficulty Scaling

| Age Range | Math Type | Fall Speed | Stars Count | Lives |
|-----------|-----------|------------|-------------|-------|
| 6-8 | Number recognition | Slow | 3 | 5 |
| 9-10 | Addition (1-10) | Slow | 3 | 5 |
| 11-12 | Add/Subtract (1-20) | Medium | 4 | 4 |
| 13-15 | Multiply/Divide | Medium | 4 | 3 |
| 16-18 | Mixed operations | Fast | 5 | 3 |
| 19-25 | Fractions, % | Fast | 5 | 3 |
| 26-35 | Algebra basics | Very Fast | 6 | 2 |

### Problem Types by Difficulty

**Level 1 (Ages 6-8): Number Recognition**
```
"Find the number 5!"
Stars: [3] [5] [8]
```

**Level 2 (Ages 9-10): Simple Addition**
```
"2 + 3 = ?"
Stars: [4] [5] [6]
```

**Level 3 (Ages 11-12): Addition & Subtraction**
```
"15 - 7 = ?"
Stars: [7] [8] [9] [22]
```

**Level 4 (Ages 13-15): Multiplication & Division**
```
"6 × 7 = ?"
Stars: [36] [42] [48] [54]
```

**Level 5 (Ages 16-18): Mixed Operations**
```
"(8 + 4) × 2 = ?"
Stars: [16] [20] [24] [28] [32]
```

**Level 6 (Ages 19-25): Fractions & Percentages**
```
"50% of 80 = ?"
Stars: [30] [40] [50] [60] [80]
```

**Level 7 (Ages 26-35): Basic Algebra**
```
"If x + 5 = 12, what is x?"
Stars: [5] [7] [12] [17]
```

---

## 🎨 Visual Design

### Screen Layout
```
┌────────────────────────────────┐
│  ❤️❤️❤️   Score: 1250   ×3    │
├────────────────────────────────┤
│        ┌───────────────┐       │
│        │   7 × 8 = ?   │       │
│        └───────────────┘       │
│                                │
│    ⭐        ⭐                │
│   [48]      [54]      ⭐      │
│                      [56]     │
│        ⭐                     │
│       [64]                    │
│                               │
│                               │
│           🐰                  │
│         ━━━━━                 │
└────────────────────────────────┘
```

### Star Design
- Bright yellow/gold with number inside
- Gentle rotation animation while falling
- Glow effect on correct answer (optional hint for easy mode)
- Wrong answers slightly duller color

### Cinnamoroll Position
- Moves along bottom 20% of screen
- Faces direction of movement
- Catching animation (ears perk up)
- Wrong catch animation (sad face)

### Colors
- Background: Gradient sky (day/night cycle based on time)
- Stars: Gold (#FFD700) with white text
- Correct: Green flash (#4CAF50)
- Wrong: Red flash (#F44336)

---

## 🔊 Audio Design

| Event | Sound |
|-------|-------|
| Star catch (correct) | Happy chime + "ding!" |
| Star catch (wrong) | Sad buzzer |
| Combo increase | Rising tone |
| Combo break | Falling tone |
| New problem | Soft whoosh |
| Level up | Fanfare |
| Game over | Gentle sad music |

---

## 🔄 Game Flow

```
┌─────────────┐
│   START     │
└──────┬──────┘
       ▼
┌─────────────┐
│ Show Rules  │
│ (First time)│
└──────┬──────┘
       ▼
┌─────────────────────────────┐
│         GAME LOOP           │◄────┐
│  1. Generate math problem   │     │
│  2. Spawn falling stars     │     │
│  3. Player moves            │     │
│  4. Check collisions        │     │
│  5. Update score/lives      │     │
└──────────────┬──────────────┘     │
               ▼                    │
         ┌──────────┐               │
         │Lives > 0?│───Yes─────────┘
         └────┬─────┘
              │No
              ▼
       ┌─────────────┐
       │  GAME OVER  │
       │ Show Score  │
       │ Leaderboard │
       └─────────────┘
```

---

## 🗂️ Data Structures

### Star Object
```javascript
{
  id: 0,
  value: 42,           // Number displayed
  isCorrect: true,     // Is this the answer?
  x: 150,
  y: -50,
  speed: 3,
  rotation: 0,
  width: 60,
  height: 60
}
```

### Problem Object
```javascript
{
  question: "7 × 8 = ?",
  answer: 56,
  distractors: [48, 54, 64],  // Wrong answers
  type: 'multiplication',
  difficulty: 4
}
```

### Game State
```javascript
{
  score: 0,
  lives: 3,
  combo: 0,
  currentProblem: null,
  stars: [],
  player: { x: 200, y: 550, width: 50, height: 50 },
  difficulty: 1,
  problemsSolved: 0,
  gamePhase: 'playing'  // 'playing' | 'paused' | 'gameOver'
}
```

---

## 📦 New Modules Needed

### MathProblemGenerator.js
```javascript
// Generates age-appropriate math problems
class MathProblemGenerator {
  constructor(difficulty) { }
  
  generateProblem()     // Returns { question, answer, distractors }
  generateDistractors() // Creates believable wrong answers
  
  // Problem types
  numberRecognition()   // "Find the 5"
  addition()            // "3 + 4 = ?"
  subtraction()         // "10 - 3 = ?"
  multiplication()      // "6 × 7 = ?"
  division()            // "24 ÷ 4 = ?"
  mixedOperations()     // "(5 + 3) × 2 = ?"
  fractions()           // "1/2 of 20 = ?"
  percentages()         // "25% of 80 = ?"
  basicAlgebra()        // "x + 5 = 12, x = ?"
}
```

### FallingObject.js (extends CharacterBase)
```javascript
class FallingObject extends CharacterBase {
  constructor(value, isCorrect, speed) { }
  
  update(deltaTime)  // Move down, rotate
  render(ctx)        // Draw star with number
  isOffScreen()      // Check if fell past bottom
}
```

---

## 🧪 Test Cases

### Functional
- [ ] Problems generate correctly for each difficulty
- [ ] Distractors are believable (not obviously wrong)
- [ ] Player movement is smooth
- [ ] Collision detection is accurate
- [ ] Score calculates correctly with combo
- [ ] Lives decrease on wrong catch
- [ ] Game over triggers at 0 lives

### Math Accuracy
- [ ] All generated problems have correct answers
- [ ] Distractors don't accidentally equal the answer
- [ ] No duplicate numbers in same problem
- [ ] Division problems result in whole numbers (for basic levels)

### Edge Cases
- [ ] Very fast star spawn doesn't overlap
- [ ] Player can't move off screen
- [ ] Pause/resume works correctly
- [ ] Mobile tilt controls calibrated

---

## 📈 Assessment Metrics

This game measures:

| Skill Category | Weight | Measurement |
|----------------|--------|-------------|
| Mathematical | 50% | Problems solved correctly |
| Processing Speed | 25% | Average reaction time |
| Attention | 15% | Combo length |
| Strategy | 10% | Risk-taking (catching close calls) |

---

## 🔗 Dependencies

### Required Core Modules
- `PhysicsEngine.js` - Gravity for falling stars
- `Collision.js` - Star/player collision
- `InputManager.js` - Player movement
- `SoundManager.js` - Audio feedback
- `Leaderboard.js` - Score persistence
- `EventSystem.js` - Game events

### Required Characters
- `CinnamorollSprite.js` - Player character

### New Modules to Create
- `MathProblemGenerator.js` - Math problem creation
- `FallingStar.js` - Star entity

---

## 🚀 Optional Enhancements

1. **Power-ups** - Slow time, shield, 2x points
2. **Boss rounds** - Rapid fire problems
3. **Daily challenges** - Same problems for all players
4. **Subject modes** - Focus on specific operations
5. **Two-player** - Race to catch answers
6. **Device motion** - Tilt to move (mobile)

---

## ✅ Acceptance Criteria

- [ ] All difficulty levels generate appropriate problems
- [ ] Math is 100% accurate
- [ ] Player controls feel responsive
- [ ] Collision detection is fair (not frustrating)
- [ ] Audio enhances gameplay
- [ ] Mobile touch/tilt works
- [ ] Assessment data records properly
- [ ] Performance: 60fps even with many stars
