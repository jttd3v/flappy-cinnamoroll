# Puzzle Cloud Path - AI Coding Skills Guide

## 🎯 Required Skills

| Skill | Level | Priority |
|-------|-------|----------|
| Array Manipulation | Intermediate | HIGH |
| CSS Animations | Intermediate | MEDIUM |
| Touch/Drag Events | Intermediate | HIGH |
| Puzzle Algorithms | Intermediate | HIGH |

---

## 📚 Key Implementations

### Tile Puzzle Engine
```javascript
class TilePuzzleEngine {
  constructor(size = 3) {
    this.size = size;
    this.totalTiles = size * size;
    this.reset();
  }
  
  reset() {
    // Create solved state: [1,2,3,4,5,6,7,8,0] for 3x3
    this.tiles = [];
    for (let i = 1; i < this.totalTiles; i++) {
      this.tiles.push(i);
    }
    this.tiles.push(0);  // 0 = empty
    this.emptyIndex = this.totalTiles - 1;
    this.moves = 0;
  }
  
  shuffle(moveCount = 100) {
    // Shuffle by making valid random moves
    // This ensures puzzle is always solvable
    for (let i = 0; i < moveCount; i++) {
      const movable = this.getMovableTiles();
      const randomIndex = movable[Math.floor(Math.random() * movable.length)];
      this.moveTile(randomIndex, false);  // Don't count shuffle moves
    }
    this.moves = 0;
  }
  
  getMovableTiles() {
    const movable = [];
    const row = Math.floor(this.emptyIndex / this.size);
    const col = this.emptyIndex % this.size;
    
    // Check adjacent positions
    if (row > 0) movable.push(this.emptyIndex - this.size);  // Above
    if (row < this.size - 1) movable.push(this.emptyIndex + this.size);  // Below
    if (col > 0) movable.push(this.emptyIndex - 1);  // Left
    if (col < this.size - 1) movable.push(this.emptyIndex + 1);  // Right
    
    return movable;
  }
  
  canMove(tileIndex) {
    return this.getMovableTiles().includes(tileIndex);
  }
  
  moveTile(tileIndex, countMove = true) {
    if (!this.canMove(tileIndex)) return false;
    
    // Swap tile with empty space
    this.tiles[this.emptyIndex] = this.tiles[tileIndex];
    this.tiles[tileIndex] = 0;
    this.emptyIndex = tileIndex;
    
    if (countMove) this.moves++;
    return true;
  }
  
  isSolved() {
    for (let i = 0; i < this.totalTiles - 1; i++) {
      if (this.tiles[i] !== i + 1) return false;
    }
    return this.tiles[this.totalTiles - 1] === 0;
  }
  
  getState() {
    return {
      tiles: [...this.tiles],
      emptyIndex: this.emptyIndex,
      moves: this.moves,
      solved: this.isSolved()
    };
  }
}
```

### Puzzle Renderer
```javascript
class PuzzleRenderer {
  constructor(container, engine, tileContent) {
    this.container = container;
    this.engine = engine;
    this.tileContent = tileContent;  // Array of tile displays
    this.tileElements = [];
    
    this.createGrid();
  }
  
  createGrid() {
    this.container.innerHTML = '';
    this.container.style.display = 'grid';
    this.container.style.gridTemplateColumns = `repeat(${this.engine.size}, 1fr)`;
    this.container.style.gap = '4px';
    
    const state = this.engine.getState();
    
    for (let i = 0; i < state.tiles.length; i++) {
      const tile = document.createElement('div');
      tile.className = 'puzzle-tile';
      tile.dataset.index = i;
      
      if (state.tiles[i] === 0) {
        tile.classList.add('empty');
      } else {
        tile.textContent = this.tileContent[state.tiles[i] - 1];
        tile.addEventListener('click', () => this.handleTileClick(i));
      }
      
      this.container.appendChild(tile);
      this.tileElements.push(tile);
    }
  }
  
  handleTileClick(index) {
    if (this.engine.moveTile(index)) {
      this.animateMove(index);
      
      if (this.engine.isSolved()) {
        setTimeout(() => this.showCompletion(), 300);
      }
    }
  }
  
  animateMove(fromIndex) {
    // Swap tile content visually
    const emptyIndex = this.engine.emptyIndex;
    const fromTile = this.tileElements[fromIndex];
    const emptyTile = this.tileElements[emptyIndex];
    
    // Add animation class
    fromTile.classList.add('moving');
    
    setTimeout(() => {
      // Update content
      emptyTile.textContent = fromTile.textContent;
      emptyTile.classList.remove('empty');
      fromTile.textContent = '';
      fromTile.classList.add('empty');
      fromTile.classList.remove('moving');
      
      // Swap references
      [this.tileElements[fromIndex], this.tileElements[emptyIndex]] = 
      [this.tileElements[emptyIndex], this.tileElements[fromIndex]];
    }, 150);
  }
  
  highlightMovable() {
    const movable = this.engine.getMovableTiles();
    this.tileElements.forEach((tile, i) => {
      tile.classList.toggle('movable', movable.includes(i));
    });
  }
  
  showCompletion() {
    this.container.classList.add('solved');
    // Trigger completion callback
    if (this.onComplete) this.onComplete(this.engine.moves);
  }
}
```

### Solvability Check
```javascript
// Check if a puzzle configuration is solvable
function isSolvable(tiles, size) {
  let inversions = 0;
  const flatTiles = tiles.filter(t => t !== 0);
  
  for (let i = 0; i < flatTiles.length; i++) {
    for (let j = i + 1; j < flatTiles.length; j++) {
      if (flatTiles[i] > flatTiles[j]) {
        inversions++;
      }
    }
  }
  
  // For odd grid sizes (3x3, 5x5): solvable if inversions is even
  if (size % 2 === 1) {
    return inversions % 2 === 0;
  }
  
  // For even grid sizes: depends on empty row from bottom
  const emptyIndex = tiles.indexOf(0);
  const emptyRowFromBottom = size - Math.floor(emptyIndex / size);
  
  if (emptyRowFromBottom % 2 === 1) {
    return inversions % 2 === 0;
  } else {
    return inversions % 2 === 1;
  }
}
```

---

## 📦 File Structure

```
games/puzzle-path/
├── index.html
├── PuzzlePathGame.js
├── puzzle-path.config.js
├── components/
│   ├── TilePuzzleEngine.js
│   ├── PuzzleRenderer.js
│   ├── MoveTracker.js
│   └── HintSystem.js
├── data/
│   └── puzzles.js
├── PRD.md
├── SKILLS.md
└── README.md
```

---

## 🎨 CSS for Animations

```css
.puzzle-tile {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  background: linear-gradient(135deg, #ffb7c5, #ffd1dc);
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.puzzle-tile.empty {
  background: transparent;
  cursor: default;
}

.puzzle-tile.movable {
  box-shadow: 0 0 10px rgba(255, 182, 193, 0.8);
}

.puzzle-tile.moving {
  transform: scale(0.95);
}

.puzzle-container.solved .puzzle-tile {
  animation: celebrate 0.5s ease;
}

@keyframes celebrate {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

---

## ⚠️ Common Pitfalls

1. **Unsolvable puzzles** - Always generate by shuffling from solved state
2. **Animation jank** - Use CSS transforms, not position changes
3. **Touch conflicts** - Handle both click and drag
4. **Hint calculation** - Simple A* or BFS for optimal hint
