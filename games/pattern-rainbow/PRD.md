# Pattern Rainbow - Product Requirements Document

> **Build Order: #3** | **Priority: HIGH** | **Complexity: LOW**

## 📋 Overview

| Field | Value |
|-------|-------|
| **Game Name** | Pattern Rainbow |
| **Type** | Pattern Recognition / Puzzle |
| **Target Age** | 6-35 (difficulty scaled) |
| **Primary Theme** | Visual / Abstract |
| **Secondary Themes** | Critical Thinking, Fun |
| **Estimated Dev Time** | 4-6 hours |
| **Dependencies** | Core systems only |

---

## 🎯 Objectives

### Learning Goals
- **Pattern recognition** - Identify repeating sequences
- **Logical reasoning** - Predict next element
- **Visual discrimination** - Distinguish shapes/colors
- **Sequential thinking** - Understand order

### Game Goals
- Complete pattern sequences
- Progress through increasing complexity
- Earn stars and unlock themes
- Achieve high accuracy scores

---

## 🎮 Gameplay Description

### Core Mechanic
1. A pattern sequence is shown with one element missing
2. Player selects the correct element from choices
3. Correct = progress + points
4. Wrong = hint or retry
5. Complete rounds to advance difficulty

### Example Patterns

**Level 1 (AB Pattern)**
```
🔴 🔵 🔴 🔵 [ ? ]
Options: 🔴 🔵 🟢
Answer: 🔴
```

**Level 2 (ABC Pattern)**
```
⭐ 🌙 ☁️ ⭐ 🌙 [ ? ]
Options: ⭐ 🌙 ☁️
Answer: ☁️
```

**Level 3 (AABB Pattern)**
```
🟡 🟡 🔵 🔵 🟡 [ ? ]
Options: 🟡 🔵 🟢
Answer: 🟡
```

**Level 4 (Growing Pattern)**
```
1 2 3 4 [ ? ]
Options: 4 5 6
Answer: 5
```

**Level 5 (Shape + Color)**
```
🔴⬛ 🔵⬛ 🔴⬛ 🔵⬛ [ ? ]
Options: 🔴⬛ 🔵⬛ 🟢⬛
Answer: 🔴⬛
```

**Level 6 (Rotation Pattern)**
```
↑ → ↓ ← [ ? ]
Options: ↑ → ↓
Answer: ↑
```

**Level 7 (Mathematical)**
```
2 4 8 16 [ ? ]
Options: 24 32 64
Answer: 32
```

---

## 📊 Difficulty Scaling

| Age Range | Pattern Type | Sequence Length | Choices | Hints |
|-----------|--------------|-----------------|---------|-------|
| 6-8 | AB, ABC colors | 4-5 | 2-3 | Unlimited |
| 9-10 | AABB, ABB | 5-6 | 3 | 3 |
| 11-12 | Growing numbers | 5-6 | 3-4 | 2 |
| 13-15 | Shape + Color | 6-7 | 4 | 1 |
| 16-18 | Rotation, Math | 6-8 | 4 | 0 |
| 19-25 | Complex math | 6-8 | 4 | 0 |
| 26-35 | Multi-rule | 8-10 | 5 | 0 |

### Pattern Types

1. **Simple Repeat**: 🔴🔵🔴🔵
2. **Triple Repeat**: 🔴🔵🟢🔴🔵🟢
3. **Double Pattern**: 🔴🔴🔵🔵
4. **Growing**: 1,2,3,4...
5. **Skip Counting**: 2,4,6,8...
6. **Geometric**: △◻△◻
7. **Rotation**: ↑→↓←
8. **Size Pattern**: small, medium, large
9. **Mathematical**: 2,4,8,16... (×2)
10. **Multi-attribute**: Red-Circle, Blue-Square...

---

## 🎨 Visual Design

### Screen Layout
```
┌────────────────────────────────┐
│  Level 3      Score: 450      │
│  ●●●○○ Progress               │
├────────────────────────────────┤
│                                │
│    Complete the pattern:       │
│                                │
│   🔴  🔵  🔴  🔵  [ ? ]       │
│                                │
│   ─────────────────────────    │
│                                │
│   Choose the answer:           │
│                                │
│    [🔴]    [🔵]    [🟢]       │
│                                │
├────────────────────────────────┤
│  💡 Hint (2 left)   [Skip]    │
└────────────────────────────────┘
```

### Visual Elements
- **Pattern sequence**: Large, colorful shapes
- **Missing slot**: Dashed border, question mark
- **Answer choices**: Buttons below pattern
- **Progress bar**: Dots showing round progress
- **Cinnamoroll mascot**: Reacts to answers

### Color Palette
- Primary shapes: Bright, distinct colors
- Background: Soft gradient (pastel rainbow)
- Correct: Green glow + sparkles
- Wrong: Gentle red shake
- UI: Pink/white Cinnamoroll theme

### Animations
1. Pattern elements slide in sequentially
2. Selection bounce on hover
3. Correct answer celebration (confetti)
4. Wrong answer gentle shake
5. Level transition fade

---

## 🔊 Audio Design

| Event | Sound |
|-------|-------|
| Element appear | Soft pop |
| Select answer | Click |
| Correct | Happy chime |
| Wrong | Soft "try again" tone |
| Hint used | Whoosh |
| Level complete | Fanfare |
| New pattern type | Discovery sound |

---

## 🔄 Game Flow

```
┌─────────────┐
│   START     │
└──────┬──────┘
       ▼
┌─────────────┐
│ Select      │
│ Difficulty  │
└──────┬──────┘
       ▼
┌─────────────────────────────┐
│       ROUND LOOP            │◄────┐
│  1. Generate pattern        │     │
│  2. Show sequence           │     │
│  3. Wait for answer         │     │
│  4. Check correctness       │     │
└──────────────┬──────────────┘     │
               ▼                    │
         ┌──────────┐               │
         │Correct?  │               │
         └────┬─────┘               │
           Y/ \N                    │
          /   \                     │
         ▼     ▼                    │
    ┌──────┐ ┌──────┐               │
    │Points│ │Retry/│               │
    │Next  │ │Hint  │               │
    └──┬───┘ └──┬───┘               │
       │        │                   │
       └────┬───┘                   │
            ▼                       │
     ┌────────────┐                 │
     │Round Done? │──No─────────────┘
     └─────┬──────┘
           │Yes
           ▼
    ┌─────────────┐
    │Level Up or  │
    │ Game Over   │
    └─────────────┘
```

---

## 🗂️ Data Structures

### Pattern Object
```javascript
{
  type: 'repeat',       // 'repeat' | 'growing' | 'rotation' | 'math'
  elements: ['🔴', '🔵', '🔴', '🔵'],
  missingIndex: 4,      // Where the ? goes
  answer: '🔴',
  choices: ['🔴', '🔵', '🟢'],
  rule: 'AB'            // Pattern rule description
}
```

### Game State
```javascript
{
  currentLevel: 1,
  currentRound: 1,
  roundsPerLevel: 5,
  score: 0,
  streak: 0,
  hintsRemaining: 3,
  patternsCompleted: 0,
  difficulty: 1
}
```

### Element Types
```javascript
{
  colors: ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣'],
  shapes: ['⭐', '🌙', '☁️', '💖', '🌸', '✨'],
  arrows: ['↑', '→', '↓', '←'],
  numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  sizes: ['S', 'M', 'L']
}
```

---

## 📦 New Modules Needed

### PatternGenerator.js
```javascript
class PatternGenerator {
  constructor(difficulty) { }
  
  generate()              // Returns pattern object
  
  // Pattern types
  simpleRepeat(elements, length)   // AB, ABC
  doubleRepeat(elements)           // AABB, AAABBB
  growingSequence(start, step)     // 1,2,3...
  skipCounting(start, skip)        // 2,4,6...
  rotationPattern(directions)      // ↑→↓←
  mathematicalPattern(rule)        // ×2, +3, etc.
  
  generateChoices(answer, pool)    // Create wrong options
}
```

---

## 🧪 Test Cases

### Functional
- [ ] Patterns generate correctly for each type
- [ ] Answer is always in choices
- [ ] Missing index varies position
- [ ] Hints reduce correctly
- [ ] Score calculates properly
- [ ] Level progression works

### Pattern Accuracy
- [ ] AB patterns repeat correctly
- [ ] Growing sequences are mathematically correct
- [ ] Rotations cycle properly
- [ ] Multi-attribute patterns are consistent

### Edge Cases
- [ ] Answer never appears twice in choices
- [ ] Skip doesn't penalize
- [ ] No duplicate patterns in same level
- [ ] Hint highlights correct answer

---

## 📈 Assessment Metrics

| Skill Category | Weight | Measurement |
|----------------|--------|-------------|
| Pattern Recognition | 40% | Accuracy rate |
| Logical Reasoning | 30% | Complex pattern success |
| Processing Speed | 20% | Time per pattern |
| Persistence | 10% | Retry success rate |

---

## 🔗 Dependencies

### Required Core Modules
- `EventSystem.js` - Game events
- `SoundManager.js` - Audio feedback
- `Leaderboard.js` - Score persistence
- `InputManager.js` - Selection handling
- `MathUtils.js` - Number patterns

### New Modules to Create
- `PatternGenerator.js` - Pattern creation
- `PatternRenderer.js` - Visual display

---

## 🚀 Optional Enhancements

1. **Create Mode** - Design your own patterns
2. **Timed Challenge** - Speed round mode
3. **Pattern Types Filter** - Practice specific types
4. **Multiplayer Race** - Who solves faster
5. **Daily Pattern** - Same for all players
6. **Achievement Badges** - Pattern master, streak king

---

## ✅ Acceptance Criteria

- [ ] All pattern types generate correctly
- [ ] Visual display is clear and appealing
- [ ] Difficulty scales appropriately
- [ ] Hints help without giving away answer
- [ ] Mobile touch works perfectly
- [ ] Assessment data records properly
- [ ] Accessible for all ages
- [ ] Performance smooth on all devices
