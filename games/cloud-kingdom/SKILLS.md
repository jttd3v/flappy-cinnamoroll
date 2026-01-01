# Cloud Kingdom Explorer - AI Coding Skills Guide

## 🎯 Required Skills

| Skill | Level | Priority |
|-------|-------|----------|
| Tile-Based Maps | Intermediate | HIGH |
| Collision Detection | Basic | HIGH |
| Keyboard/Touch Input | Intermediate | HIGH |
| State Management | Intermediate | HIGH |

---

## 📚 Key Implementations

### Tile Map Engine
```javascript
class TileMapEngine {
  constructor(mapData, tileSize = 48) {
    this.map = mapData;
    this.tileSize = tileSize;
    this.tileTypes = this.loadTileTypes();
  }
  
  loadTileTypes() {
    return {
      void: { walkable: false, sprite: '░' },
      cloud: { walkable: true, sprite: '☁️' },
      tree: { walkable: false, sprite: '🌲' },
      flower: { walkable: true, sprite: '🌸', collectible: true },
      door: { walkable: false, sprite: '🚪', interactive: true },
      gem: { walkable: true, sprite: '💎', collectible: true }
    };
  }
  
  getTile(x, y) {
    if (x < 0 || y < 0 || x >= this.map.width || y >= this.map.height) {
      return this.tileTypes.void;
    }
    const tileId = this.map.tiles[y][x];
    const typeName = this.map.tileTypes[tileId];
    return this.tileTypes[typeName];
  }
  
  isWalkable(x, y) {
    return this.getTile(x, y).walkable;
  }
  
  getEntityAt(x, y) {
    return this.map.entities.find(e => e.x === x && e.y === y);
  }
  
  removeEntity(entityId) {
    const index = this.map.entities.findIndex(e => e.id === entityId);
    if (index !== -1) {
      this.map.entities.splice(index, 1);
    }
  }
  
  render(ctx, viewportX, viewportY, viewportWidth, viewportHeight) {
    const startTileX = Math.floor(viewportX / this.tileSize);
    const startTileY = Math.floor(viewportY / this.tileSize);
    const endTileX = Math.ceil((viewportX + viewportWidth) / this.tileSize);
    const endTileY = Math.ceil((viewportY + viewportHeight) / this.tileSize);
    
    for (let y = startTileY; y <= endTileY; y++) {
      for (let x = startTileX; x <= endTileX; x++) {
        const tile = this.getTile(x, y);
        const screenX = x * this.tileSize - viewportX;
        const screenY = y * this.tileSize - viewportY;
        
        // Draw tile
        ctx.font = `${this.tileSize * 0.8}px Arial`;
        ctx.fillText(tile.sprite, screenX, screenY + this.tileSize * 0.8);
      }
    }
    
    // Draw entities
    for (const entity of this.map.entities) {
      const screenX = entity.x * this.tileSize - viewportX;
      const screenY = entity.y * this.tileSize - viewportY;
      ctx.fillText(entity.sprite || '❓', screenX, screenY + this.tileSize * 0.8);
    }
  }
}
```

### Player Controller
```javascript
class PlayerController {
  constructor(tileMap, startX, startY) {
    this.tileMap = tileMap;
    this.x = startX;
    this.y = startY;
    this.inventory = new InventorySystem();
    this.moving = false;
  }
  
  move(direction) {
    if (this.moving) return false;
    
    const delta = {
      up: { dx: 0, dy: -1 },
      down: { dx: 0, dy: 1 },
      left: { dx: -1, dy: 0 },
      right: { dx: 1, dy: 0 }
    }[direction];
    
    if (!delta) return false;
    
    const newX = this.x + delta.dx;
    const newY = this.y + delta.dy;
    
    if (this.tileMap.isWalkable(newX, newY)) {
      this.moving = true;
      this.x = newX;
      this.y = newY;
      
      // Check for collectibles
      this.checkTileInteraction();
      
      setTimeout(() => { this.moving = false; }, 150);
      return true;
    }
    
    return false;
  }
  
  checkTileInteraction() {
    const tile = this.tileMap.getTile(this.x, this.y);
    const entity = this.tileMap.getEntityAt(this.x, this.y);
    
    if (entity && entity.type === 'item') {
      this.inventory.addItem(entity.itemId, entity.quantity || 1);
      this.tileMap.removeEntity(entity.id);
      return { type: 'pickup', item: entity };
    }
    
    return null;
  }
  
  interact() {
    // Check adjacent tiles for interactive objects
    const directions = [
      { dx: 0, dy: -1 },  // up
      { dx: 0, dy: 1 },   // down
      { dx: -1, dy: 0 },  // left
      { dx: 1, dy: 0 }    // right
    ];
    
    for (const { dx, dy } of directions) {
      const tile = this.tileMap.getTile(this.x + dx, this.y + dy);
      if (tile.interactive) {
        return this.handleInteraction(tile, this.x + dx, this.y + dy);
      }
    }
    
    return null;
  }
  
  handleInteraction(tile, x, y) {
    if (tile.requires && this.inventory.hasItem(tile.requires)) {
      this.inventory.removeItem(tile.requires, 1);
      // Open door, etc.
      return { type: 'unlock', tile, x, y };
    }
    return { type: 'locked', tile, x, y };
  }
}
```

### Inventory System
```javascript
class InventorySystem {
  constructor() {
    this.items = {};
    this.maxSlots = 20;
  }
  
  addItem(itemId, quantity = 1) {
    if (this.items[itemId]) {
      this.items[itemId] += quantity;
    } else {
      if (Object.keys(this.items).length >= this.maxSlots) {
        return false;  // Inventory full
      }
      this.items[itemId] = quantity;
    }
    return true;
  }
  
  removeItem(itemId, quantity = 1) {
    if (!this.hasItem(itemId, quantity)) return false;
    
    this.items[itemId] -= quantity;
    if (this.items[itemId] <= 0) {
      delete this.items[itemId];
    }
    return true;
  }
  
  hasItem(itemId, quantity = 1) {
    return (this.items[itemId] || 0) >= quantity;
  }
  
  getCount(itemId) {
    return this.items[itemId] || 0;
  }
  
  getAll() {
    return { ...this.items };
  }
}
```

---

## 📦 File Structure

```
games/cloud-kingdom/
├── index.html
├── CloudKingdomGame.js
├── cloud-kingdom.config.js
├── components/
│   ├── TileMapEngine.js
│   ├── PlayerController.js
│   ├── InventorySystem.js
│   ├── QuestManager.js
│   └── Camera.js
├── data/
│   ├── maps/
│   │   ├── starter-island.json
│   │   └── rainbow-bridge.json
│   └── items.js
├── PRD.md
├── SKILLS.md
└── README.md
```

---

## 🗺️ Map Data Format

```javascript
// maps/starter-island.json
{
  "id": "starter_island",
  "name": "Starter Island",
  "width": 12,
  "height": 10,
  "tiles": [
    [0,0,1,1,1,1,1,1,1,1,0,0],
    [0,1,1,1,2,1,1,2,1,1,1,0],
    // ...
  ],
  "tileTypes": {
    "0": "void",
    "1": "cloud",
    "2": "tree"
  },
  "entities": [
    { "id": "key_001", "type": "item", "itemId": "golden_key", "x": 5, "y": 3, "sprite": "🗝️" }
  ],
  "playerStart": { "x": 6, "y": 5 }
}
```

---

## ⚠️ Common Pitfalls

1. **Camera jitter** - Use integer pixel values
2. **Input delay** - Debounce but stay responsive
3. **Save file corruption** - Validate on load
4. **Softlocks** - Ensure all keys are obtainable
