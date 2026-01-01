# Puzzle Cloud Path - Product Requirements Document

> **Build Order: #9** | **Priority: MEDIUM** | **Complexity: MEDIUM**

## 📋 Overview

| Field | Value |
|-------|-------|
| **Game Name** | Puzzle Cloud Path |
| **Type** | Sliding Tile Puzzle |
| **Target Age** | 6-35 (difficulty scaled) |
| **Primary Theme** | Critical Thinking |
| **Secondary Themes** | Memorization, Visual |
| **Estimated Dev Time** | 6-8 hours |
| **Dependencies** | Core systems |

---

## 🎯 Objectives

### Learning Goals
- **Visual Recognition** (Ages 6-8)
- **Spatial Reasoning** (Ages 9-12)
- **Sequential Planning** (Ages 13-18)
- **Optimization** (Ages 19-25)
- **Algorithmic Thinking** (Ages 26-35)

### Game Goals
- Slide tiles to solve puzzle
- Complete picture or pattern
- Solve in minimum moves
- Beat time records
- Unlock new puzzle themes

---

## 🎮 Gameplay Description

### Core Mechanic
1. View scrambled puzzle
2. Slide tiles into empty space
3. Reconstruct the image/pattern
4. Earn stars based on moves/time
5. Progress to harder puzzles

### Puzzle Flow
```
╔════════════════════════════════╗
║  Puzzle Cloud Path  ⭐⭐⭐     ║
╠════════════════════════════════╣
║                                ║
║   Target:    Your Puzzle:      ║
║   ┌───────┐  ┌───────┐        ║
║   │ 1 2 3 │  │ 2 · 3 │        ║
║   │ 4 5 6 │  │ 1 5 6 │        ║
║   │ 7 8 · │  │ 4 7 8 │        ║
║   └───────┘  └───────┘        ║
║                                ║
║   Moves: 12    Best: 8        ║
║   Time: 0:45                   ║
║                                ║
║   [Hint]  [Reset]              ║
╚════════════════════════════════╝
```

---

## 📊 Difficulty Scaling

| Age | Grid Size | Features |
|-----|-----------|----------|
| 6-8 | 2×2 | Picture puzzles |
| 9-10 | 3×3 | Number sequence |
| 11-12 | 3×3 | Pattern matching |
| 13-15 | 4×4 | Mixed puzzles |
| 16-20 | 4×4 | Move limit |
| 21-25 | 5×5 | Time limit |
| 26-35 | 5×5+ | Optimal moves |

---

## 🎨 Visual Design

### Puzzle Screen
```
┌────────────────────────────────┐
│  Level 5    ⭐⭐⭐⭐⭐        │
│  Cinnamoroll Puzzle            │
├────────────────────────────────┤
│                                │
│   ┌────┬────┬────┐            │
│   │🐰 │    │☁️ │            │
│   ├────┼────┼────┤            │
│   │💭 │⭐ │🌸 │            │
│   ├────┼────┼────┤            │
│   │🎀 │🍬 │💖 │            │
│   └────┴────┴────┘            │
│                                │
│   Moves: 5/15   Time: 0:32    │
│                                │
│  [💡 Hint]  [↩️ Reset]         │
└────────────────────────────────┘
```

### Completion Screen
```
┌────────────────────────────────┐
│  🎉 Puzzle Complete! 🎉       │
├────────────────────────────────┤
│                                │
│   ⭐⭐⭐                       │
│                                │
│   Moves: 12                    │
│   Time: 0:45                   │
│   Best: 8 moves                │
│                                │
│   [Next Puzzle]  [Try Again]   │
│                                │
└────────────────────────────────┘
```

---

## 🗂️ Data Structures

### Puzzle Definition
```javascript
{
  id: 'puzzle_001',
  name: 'Cinnamoroll',
  difficulty: 2,
  gridSize: 3,
  type: 'image',  // or 'number', 'pattern'
  tiles: ['🐰', '☁️', '💭', '⭐', '🌸', '🎀', '🍬', '💖'],
  emptyPosition: 8,  // 0-indexed
  parMoves: 8,
  parTime: 60
}
```

### Puzzle State
```javascript
{
  currentPuzzle: 'puzzle_001',
  tiles: [1, 0, 2, 3, 4, 5, 6, 7, 8],  // 0 = empty
  emptyIndex: 1,
  moves: 5,
  startTime: 1705312500000,
  hintsUsed: 1
}
```

### Player Progress
```javascript
{
  completedPuzzles: ['puzzle_001', 'puzzle_002'],
  bestScores: {
    'puzzle_001': { moves: 8, time: 45, stars: 3 }
  },
  currentLevel: 5,
  totalStars: 23,
  hintsAvailable: 3
}
```

---

## 📦 New Modules Needed

### TilePuzzleEngine.js
```javascript
class TilePuzzleEngine {
  createPuzzle(size, type)
  shuffle(moves)
  moveTile(index)
  canMove(index)
  isSolved()
  getHint()
}
```

### PuzzleRenderer.js
```javascript
class PuzzleRenderer {
  renderGrid(state, tileImages)
  animateMove(fromIndex, toIndex)
  highlightMovable(indices)
  showCompletion()
}
```

### MoveTracker.js
```javascript
class MoveTracker {
  recordMove(fromIndex, toIndex)
  getOptimalMoves()
  getHintMove()
  canUndo()
  undo()
}
```

---

## 🧪 Test Cases

- [ ] Tiles move correctly
- [ ] Only valid moves allowed
- [ ] Puzzle detects solved state
- [ ] Move count is accurate
- [ ] Timer works correctly
- [ ] All puzzles are solvable

---

## 📈 Assessment Metrics

| Skill | Weight | Measurement |
|-------|--------|-------------|
| Problem Solving | 40% | Completion rate |
| Efficiency | 30% | Moves vs optimal |
| Speed | 20% | Time to solve |
| Persistence | 10% | Retry rate |

---

## ✅ Acceptance Criteria

- [ ] Smooth tile animations
- [ ] All generated puzzles solvable
- [ ] Touch drag support
- [ ] Undo functionality
- [ ] Star rating matches performance
- [ ] Works on mobile screens
