# Cloud Kingdom Explorer - Product Requirements Document

> **Build Order: #8** | **Priority: MEDIUM** | **Complexity: HIGH**

## 📋 Overview

| Field | Value |
|-------|-------|
| **Game Name** | Cloud Kingdom Explorer |
| **Type** | Top-Down Exploration |
| **Target Age** | 6-35 (difficulty scaled) |
| **Primary Theme** | Exploration + Discovery |
| **Secondary Themes** | Critical Thinking, Memorization |
| **Estimated Dev Time** | 10-12 hours |
| **Dependencies** | Core systems + Tile Map |

---

## 🎯 Objectives

### Learning Goals
- **Spatial Reasoning** (All ages)
- **Navigation** (Ages 6-10)
- **Problem Solving** (Ages 11-15)
- **Resource Management** (Ages 16-25)
- **Strategic Planning** (Ages 26-35)

### Game Goals
- Explore the cloud kingdom
- Collect treasures and items
- Solve environmental puzzles
- Complete quests
- Unlock new areas

---

## 🎮 Gameplay Description

### Core Mechanic
1. Move character on tile-based map
2. Interact with objects and NPCs
3. Collect items into inventory
4. Solve puzzles to progress
5. Complete area objectives

### Exploration Flow
```
╔════════════════════════════════╗
║  Cloud Kingdom   💎12  🗝️3    ║
╠════════════════════════════════╣
║  ░░░░░░░░░░░░░░░░░░░░░░░░░░   ║
║  ░░☁️☁️☁️🌸☁️☁️☁️🌈☁️☁️☁️░░   ║
║  ░░☁️🏠☁️☁️☁️☁️☁️☁️☁️💎☁️░░   ║
║  ░░☁️☁️☁️☁️🐰☁️☁️☁️☁️☁️☁️░░   ║
║  ░░☁️☁️🌺☁️☁️☁️🗝️☁️☁️☁️☁️░░   ║
║  ░░☁️☁️☁️☁️☁️🚪☁️☁️☁️☁️☁️░░   ║
║  ░░░░░░░░░░░░░░░░░░░░░░░░░░   ║
╠════════════════════════════════╣
║  Quest: Find 3 hidden flowers  ║
╚════════════════════════════════╝
```

---

## 📊 Difficulty Scaling

| Age | Map Size | Features |
|-----|----------|----------|
| 6-8 | 8×8 | Simple paths, no puzzles |
| 9-10 | 12×12 | Basic keys and doors |
| 11-12 | 16×16 | Switches and bridges |
| 13-15 | 20×20 | Multi-step puzzles |
| 16-20 | 24×24 | Resource management |
| 21-25 | 32×32 | Time-limited areas |
| 26-35 | 40×40 | Full quest chains |

---

## 🎨 Visual Design

### Map View
```
┌────────────────────────────────┐
│  💎 12    🗝️ 3    🌸 5/10     │
├────────────────────────────────┤
│                                │
│   ☁️ ☁️ ☁️ 🏠 ☁️ ☁️ ☁️ ☁️     │
│   ☁️ 🌲 ☁️ ☁️ ☁️ 🌲 ☁️ ☁️     │
│   ☁️ ☁️ ☁️ 💎 🐰 ☁️ ☁️ 🚪     │
│   ☁️ ☁️ 🌺 ☁️ ☁️ ☁️ 🗝️ ☁️     │
│   ☁️ 🌲 ☁️ ☁️ ☁️ 🌲 ☁️ ☁️     │
│                                │
├────────────────────────────────┤
│  [🎒 Inventory]  [📋 Quests]   │
└────────────────────────────────┘
```

### Inventory Screen
```
┌────────────────────────────────┐
│  🎒 Inventory                  │
├────────────────────────────────┤
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
│  │ 🗝️ │ │ 🌸 │ │ 💎 │ │    │  │
│  │ x3 │ │ x5 │ │ x12│ │    │  │
│  └────┘ └────┘ └────┘ └────┘  │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
│  │ 🍬 │ │ 📜 │ │    │ │    │  │
│  │ x2 │ │ x1 │ │    │ │    │  │
│  └────┘ └────┘ └────┘ └────┘  │
│                                │
│  Selected: Golden Key 🗝️       │
│  "Opens locked cloud doors"    │
└────────────────────────────────┘
```

---

## 🗂️ Data Structures

### Tile Definition
```javascript
{
  id: 'cloud',
  walkable: true,
  sprite: '☁️',
  interaction: null
}

{
  id: 'locked_door',
  walkable: false,
  sprite: '🚪',
  interaction: {
    type: 'door',
    requires: 'golden_key',
    opensTo: 'cloud'
  }
}
```

### Map Definition
```javascript
{
  id: 'starter_island',
  name: 'Starter Island',
  width: 12,
  height: 12,
  tiles: [
    [0,0,0,1,1,1,1,1,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,1,0,0],
    // ... more rows
  ],
  tileTypes: {
    0: 'void',
    1: 'cloud',
    2: 'tree',
    3: 'flower'
  },
  entities: [
    { type: 'item', id: 'key_001', x: 5, y: 3 },
    { type: 'npc', id: 'mocha', x: 2, y: 4 }
  ],
  connections: [
    { x: 11, y: 5, toMap: 'rainbow_bridge', toX: 0, toY: 5 }
  ]
}
```

### Player State
```javascript
{
  currentMap: 'starter_island',
  position: { x: 5, y: 5 },
  inventory: {
    'golden_key': 2,
    'flower': 5,
    'gem': 12
  },
  quests: {
    'collect_flowers': { required: 10, collected: 5 }
  },
  visitedMaps: ['starter_island'],
  discoveredSecrets: []
}
```

---

## 📦 New Modules Needed

### TileMapEngine.js
```javascript
class TileMapEngine {
  loadMap(mapData)
  getTile(x, y)
  setTile(x, y, tileId)
  isWalkable(x, y)
  render(ctx, viewport)
}
```

### PlayerController.js
```javascript
class PlayerController {
  move(direction)
  interact()
  canMoveTo(x, y)
  handleCollision(tile, entity)
}
```

### InventorySystem.js
```javascript
class InventorySystem {
  addItem(itemId, quantity)
  removeItem(itemId, quantity)
  hasItem(itemId, quantity)
  getItems()
}
```

### QuestManager.js
```javascript
class QuestManager {
  startQuest(questId)
  updateProgress(questId, data)
  isComplete(questId)
  getActiveQuests()
}
```

---

## 🧪 Test Cases

- [ ] Character moves in all 4 directions
- [ ] Collision detection works
- [ ] Items can be collected
- [ ] Doors unlock with keys
- [ ] Map transitions work
- [ ] Quests track progress correctly

---

## 📈 Assessment Metrics

| Skill | Weight | Measurement |
|-------|--------|-------------|
| Spatial | 35% | Navigation efficiency |
| Problem Solving | 30% | Puzzles solved |
| Memory | 20% | Backtracking frequency |
| Persistence | 15% | Areas completed |

---

## ✅ Acceptance Criteria

- [ ] Smooth tile-based movement
- [ ] Clear visual feedback
- [ ] Intuitive puzzle mechanics
- [ ] Mobile touch controls work
- [ ] Save/load progress works
- [ ] All areas are completable
