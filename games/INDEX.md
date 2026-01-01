# Cinnamoroll Learning Games - Master Index

> A collection of 10 educational games for ages 6-35

## 🎮 Game Collection

| # | Game | Theme | Complexity | Status |
|---|------|-------|------------|--------|
| 1 | [Treasure Chest Memory](treasure-chest/) | Memory + Visual | LOW | 📋 PRD Ready |
| 2 | [Star Counter](star-counter/) | Math + Fun | LOW | 📋 PRD Ready |
| 3 | [Pattern Rainbow](pattern-rainbow/) | Logic + Visual | MEDIUM | 📋 PRD Ready |
| 4 | [Quiz Quest](quiz-quest/) | Knowledge + Exploration | MEDIUM | 📋 PRD Ready |
| 5 | [Candy Shop](candy-shop/) | Math + Rewards | MEDIUM | 📋 PRD Ready |
| 6 | [Story Cloud Adventure](story-cloud/) | Reading + Exploration | HIGH | 📋 PRD Ready |
| 7 | [Dream Journal](dream-journal/) | Writing + Creativity | MEDIUM | 📋 PRD Ready |
| 8 | [Cloud Kingdom Explorer](cloud-kingdom/) | Exploration + Logic | HIGH | 📋 PRD Ready |
| 9 | [Puzzle Cloud Path](puzzle-path/) | Critical Thinking | MEDIUM | 📋 PRD Ready |
| 10 | [Career Clouds](career-clouds/) | Assessment + Meta | HIGH | 📋 PRD Ready |

---

## 📁 Folder Structure

```
games/
├── treasure-chest/         # Game 1: Memory
│   ├── PRD.md
│   ├── SKILLS.md
│   ├── memory.config.js
│   └── README.md
├── star-counter/           # Game 2: Math
│   ├── PRD.md
│   ├── SKILLS.md
│   ├── star-counter.config.js
│   └── README.md
├── pattern-rainbow/        # Game 3: Patterns
│   ├── PRD.md
│   ├── SKILLS.md
│   ├── pattern.config.js
│   └── README.md
├── quiz-quest/             # Game 4: Quiz
│   ├── PRD.md
│   ├── SKILLS.md
│   ├── quiz.config.js
│   └── README.md
├── candy-shop/             # Game 5: Shop Sim
│   ├── PRD.md
│   ├── SKILLS.md
│   ├── candy-shop.config.js
│   └── README.md
├── story-cloud/            # Game 6: Reading
│   ├── PRD.md
│   ├── SKILLS.md
│   ├── story-cloud.config.js
│   └── README.md
├── dream-journal/          # Game 7: Writing
│   ├── PRD.md
│   ├── SKILLS.md
│   ├── dream-journal.config.js
│   └── README.md
├── cloud-kingdom/          # Game 8: Exploration
│   ├── PRD.md
│   ├── SKILLS.md
│   ├── cloud-kingdom.config.js
│   └── README.md
├── puzzle-path/            # Game 9: Puzzles
│   ├── PRD.md
│   ├── SKILLS.md
│   ├── puzzle-path.config.js
│   └── README.md
├── career-clouds/          # Game 10: Assessment
│   ├── PRD.md
│   ├── SKILLS.md
│   ├── career-clouds.config.js
│   └── README.md
└── INDEX.md                # This file
```

---

## 🎯 Recommended Build Order

1. **Treasure Chest Memory** - Establishes card flip mechanic
2. **Star Counter** - Core math system
3. **Pattern Rainbow** - Pattern recognition engine
4. **Quiz Quest** - Question/answer framework
5. **Candy Shop** - Currency and shop mechanics
6. **Story Cloud Adventure** - Branching narrative system
7. **Dream Journal** - Text input and storage
8. **Cloud Kingdom Explorer** - Tile-based engine
9. **Puzzle Cloud Path** - Sliding puzzle system
10. **Career Clouds** - Aggregates ALL game data

---

## 📊 Skill Coverage

| Skill | Primary Games | Secondary Games |
|-------|--------------|-----------------|
| Math | Star Counter, Candy Shop | Quiz Quest |
| Memory | Treasure Chest | Quiz Quest, Story Cloud |
| Logic | Pattern Rainbow, Puzzle Path | Cloud Kingdom |
| Reading | Story Cloud | Quiz Quest |
| Writing | Dream Journal | - |
| Spatial | Cloud Kingdom, Puzzle Path | Pattern Rainbow |
| Creativity | Dream Journal | Pattern Rainbow |

---

## 🔧 Shared Core Systems

All games use these shared modules from `core/`:

- `GameEngine.js` - Main game loop
- `EventSystem.js` - Event handling
- `InputManager.js` - Keyboard/mouse/touch
- `SoundManager.js` - Audio
- `Leaderboard.js` - Score persistence
- `CanvasRenderer.js` - Drawing utilities
- `MathUtils.js` - Random, interpolation

---

## 📈 Difficulty Scaling Function

All games use this consistent function:

```javascript
export function getDifficultyFromAge(age) {
  if (age <= 8) return 1;   // Easy
  if (age <= 10) return 2;
  if (age <= 12) return 3;
  if (age <= 15) return 4;
  if (age <= 18) return 5;
  if (age <= 25) return 6;
  return 7;                  // Most difficult
}
```

---

## ✅ Implementation Checklist

For each game, implement:

- [ ] Main game class
- [ ] Config integration
- [ ] Difficulty scaling
- [ ] Score/progress saving
- [ ] Mobile touch support
- [ ] Sound effects
- [ ] Visual feedback
- [ ] Unit tests
