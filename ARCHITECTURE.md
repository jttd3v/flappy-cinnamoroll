# 🎮 Cinnamoroll Game System - Architecture Plan

> A modular, reusable game engine for Cinnamoroll-themed games

---

## 📋 Executive Summary

This document outlines the architecture for transforming the Flappy Cinnamoroll game into a **modular game system** that can power multiple Cinnamoroll-themed games. Each game will be a "card" (self-contained game module) while sharing core systems like physics, audio, rendering, and player management.

---

## 🏗️ Proposed Folder Structure

```
cinnamoroll-games/
│
├── 📁 core/                          # Shared game engine (reusable across ALL games)
│   ├── 📁 engine/
│   │   ├── GameEngine.js             # Main game loop, state machine, lifecycle
│   │   ├── EventSystem.js            # Pub/sub event system
│   │   └── EntityManager.js          # Entity-component system base
│   │
│   ├── 📁 physics/
│   │   ├── PhysicsEngine.js          # Base physics class
│   │   ├── Gravity.js                # Gravity system (configurable)
│   │   ├── Collision.js              # AABB, circle, polygon collision
│   │   ├── Movement.js               # Velocity, acceleration, friction
│   │   └── Bounds.js                 # Screen bounds, clamping
│   │
│   ├── 📁 rendering/
│   │   ├── CanvasRenderer.js         # Canvas 2D rendering utilities
│   │   ├── Shapes.js                 # Draw circles, rectangles, clouds
│   │   ├── Text.js                   # Text rendering with outlines
│   │   ├── Background.js             # Gradient backgrounds, parallax
│   │   └── Animation.js              # Sprite animation, tweening
│   │
│   ├── 📁 audio/
│   │   ├── SoundManager.js           # Web Audio API wrapper
│   │   ├── SoundEffects.js           # Procedural sound generation
│   │   └── MusicPlayer.js            # Background music (future)
│   │
│   ├── 📁 input/
│   │   ├── InputManager.js           # Unified input handling
│   │   ├── TouchInput.js             # Mobile touch events
│   │   ├── KeyboardInput.js          # Keyboard events
│   │   └── MouseInput.js             # Mouse/click events
│   │
│   ├── 📁 storage/
│   │   ├── StorageManager.js         # LocalStorage wrapper
│   │   ├── Leaderboard.js            # Score management system
│   │   └── PlayerProfile.js          # Player data management
│   │
│   ├── 📁 ui/
│   │   ├── UIManager.js              # UI component management
│   │   ├── Modal.js                  # Modal dialogs
│   │   ├── Button.js                 # Canvas buttons
│   │   └── ScoreDisplay.js           # Score/HUD components
│   │
│   ├── 📁 media/
│   │   ├── RecordingManager.js       # Screen/webcam recording
│   │   └── Screenshot.js             # Screenshot capture
│   │
│   ├── 📁 utils/
│   │   ├── MathUtils.js              # Math helpers (clamp, lerp, random)
│   │   ├── ColorUtils.js             # Color manipulation
│   │   ├── TimeUtils.js              # Delta time, timers
│   │   └── Validators.js             # Input validation
│   │
│   └── index.js                      # Core barrel export
│
├── 📁 characters/                    # Shared character assets & definitions
│   ├── 📁 cinnamoroll/
│   │   ├── CinnamorollSprite.js      # Character rendering
│   │   ├── CinnamorollAnimations.js  # Walk, jump, fly, hurt animations
│   │   └── cinnamoroll.config.js     # Character properties
│   │
│   ├── 📁 enemies/
│   │   ├── Ghost.js                  # Ghost enemy
│   │   ├── CloudMonster.js           # Future enemy
│   │   └── EnemyBase.js              # Base enemy class
│   │
│   └── 📁 shared/
│       ├── CharacterBase.js          # Base character class
│       └── CharacterFactory.js       # Character instantiation
│
├── 📁 games/                         # Individual game "cards"
│   │
│   ├── 📁 flappy-cinnamoroll/        # GAME CARD #1: Flappy Bird Clone
│   │   ├── index.html                # Game entry point
│   │   ├── FlappyGame.js             # Game-specific logic
│   │   ├── CloudObstacle.js          # Cloud pipe obstacles
│   │   ├── flappy.config.js          # Game-specific config
│   │   ├── flappy.styles.css         # Game-specific styles
│   │   └── README.md                 # Game documentation
│   │
│   ├── 📁 runner-cinnamoroll/        # GAME CARD #2: Endless Runner (future)
│   │   ├── index.html
│   │   ├── RunnerGame.js
│   │   ├── Platform.js
│   │   ├── runner.config.js
│   │   └── README.md
│   │
│   └── 📁 jump-cinnamoroll/          # GAME CARD #3: Jump Game (future)
│       ├── index.html
│       ├── JumpGame.js
│       └── README.md
│
├── 📁 shared-assets/                 # Shared visual assets
│   ├── 📁 images/
│   │   ├── cinnamoroll-sprite.png
│   │   ├── cloud-tileset.png
│   │   └── backgrounds/
│   │
│   ├── 📁 fonts/
│   │   └── kawaii-font.woff2
│   │
│   └── 📁 audio/
│       ├── jump.wav
│       ├── score.wav
│       └── bgm/
│
├── 📁 themes/                        # Visual themes (reusable)
│   ├── sky-theme.css
│   ├── night-theme.css
│   └── sakura-theme.css
│
├── 📁 docs/                          # Documentation
│   ├── API.md                        # Core API reference
│   ├── CREATING_NEW_GAME.md          # How to create a new game card
│   └── PHYSICS_GUIDE.md              # Physics system guide
│
├── index.html                        # Game launcher/selector
├── package.json                      # NPM package (optional build)
└── README.md                         # Project overview
```

---

## 🎯 Core Systems Breakdown

### 1. **Game Engine** (`core/engine/`)

```javascript
// GameEngine.js - Base game class all games inherit from
class GameEngine {
  constructor(config) {
    this.config = config;
    this.state = GameState.IDLE;
    this.entities = [];
    this.systems = [];
  }
  
  // Lifecycle hooks (override in game cards)
  onInit() {}
  onStart() {}
  onUpdate(deltaTime) {}
  onRender(ctx) {}
  onPause() {}
  onResume() {}
  onGameOver() {}
  onReset() {}
  
  // State machine
  setState(newState) {}
  
  // Main loop
  gameLoop(timestamp) {}
}
```

### 2. **Physics System** (`core/physics/`)

```javascript
// PhysicsEngine.js - Configurable physics
class PhysicsEngine {
  constructor(config = {}) {
    this.gravity = config.gravity ?? 0.4;
    this.friction = config.friction ?? 1;
    this.maxVelocity = config.maxVelocity ?? { x: 10, y: 10 };
  }
  
  applyGravity(entity, deltaTime) {}
  applyVelocity(entity, deltaTime) {}
  applyFriction(entity) {}
  clampVelocity(entity) {}
}

// Collision.js - Multiple collision detection methods
class CollisionSystem {
  static checkAABB(a, b) {}           // Rectangle collision
  static checkCircle(a, b) {}          // Circle collision
  static checkPointInRect(point, rect) {}
  static checkBounds(entity, bounds) {}
}
```

### 3. **Event System** (`core/engine/EventSystem.js`)

```javascript
// EventSystem.js - Decoupled communication
class EventSystem {
  static listeners = new Map();
  
  static on(event, callback, context) {}
  static off(event, callback) {}
  static emit(event, data) {}
  static once(event, callback) {}
  static clear() {}
}

// Predefined events
const GameEvents = {
  // Lifecycle
  GAME_START: 'game:start',
  GAME_PAUSE: 'game:pause',
  GAME_RESUME: 'game:resume',
  GAME_OVER: 'game:over',
  GAME_RESET: 'game:reset',
  
  // Gameplay
  PLAYER_JUMP: 'player:jump',
  PLAYER_HIT: 'player:hit',
  SCORE_UPDATE: 'score:update',
  LEVEL_UP: 'level:up',
  
  // UI
  UI_CLICK: 'ui:click',
  MODAL_OPEN: 'modal:open',
  MODAL_CLOSE: 'modal:close'
};
```

### 4. **Sound System** (`core/audio/`)

```javascript
// SoundManager.js - Web Audio API abstraction
class SoundManager {
  constructor() {
    this.audioContext = null;
    this.sounds = new Map();
    this.muted = false;
    this.volume = 1;
  }
  
  init() {}
  loadSound(key, url) {}
  play(key, options = {}) {}
  playProcedural(type, params) {}  // Generate sounds on the fly
  setVolume(vol) {}
  mute() {}
  unmute() {}
}

// SoundEffects.js - Procedural sound generation
class SoundEffects {
  static createJumpSound(ctx) {}
  static createScoreSound(ctx) {}
  static createCollisionSound(ctx) {}
  static createPowerUpSound(ctx) {}
}
```

### 5. **Input System** (`core/input/`)

```javascript
// InputManager.js - Unified input handling
class InputManager {
  constructor(target) {
    this.target = target;
    this.keys = new Set();
    this.touches = [];
    this.mouse = { x: 0, y: 0, pressed: false };
  }
  
  init() {}
  bindAction(inputType, action, callback) {}
  isKeyDown(key) {}
  isActionActive(action) {}
  getPointerPosition() {}
  destroy() {}
}

// Input actions (game-agnostic)
const InputActions = {
  JUMP: 'jump',
  MOVE_LEFT: 'moveLeft',
  MOVE_RIGHT: 'moveRight',
  PAUSE: 'pause',
  CONFIRM: 'confirm',
  CANCEL: 'cancel'
};
```

### 6. **Storage System** (`core/storage/`)

```javascript
// StorageManager.js - Persistent data
class StorageManager {
  constructor(namespace) {
    this.namespace = namespace;
  }
  
  get(key, defaultValue) {}
  set(key, value) {}
  remove(key) {}
  clear() {}
  getAll() {}
}

// Leaderboard.js - Score management
class Leaderboard {
  constructor(storageKey, maxEntries = 10) {}
  
  getScores() {}
  addScore(name, score) {}
  getPlayerBest(name) {}
  isHighScore(score) {}
  getRank(score) {}
}

// PlayerProfile.js - Player data
class PlayerProfile {
  constructor(name) {
    this.name = name;
    this.stats = {};
    this.achievements = [];
    this.settings = {};
  }
  
  save() {}
  load() {}
  updateStat(key, value) {}
  unlockAchievement(id) {}
}
```

---

## 🎮 Game Card Structure

Each game "card" follows this pattern:

```javascript
// games/flappy-cinnamoroll/FlappyGame.js

import { GameEngine, EventSystem, PhysicsEngine } from '../../core';
import { Cinnamoroll } from '../../characters/cinnamoroll';
import { CloudObstacle } from './CloudObstacle';
import { FLAPPY_CONFIG } from './flappy.config';

class FlappyGame extends GameEngine {
  constructor(canvasId) {
    super(FLAPPY_CONFIG);
    this.physics = new PhysicsEngine({
      gravity: FLAPPY_CONFIG.GRAVITY,
      maxVelocity: { y: FLAPPY_CONFIG.MAX_FALL_SPEED }
    });
  }
  
  onInit() {
    this.player = new Cinnamoroll(this.config);
    this.obstacles = [];
    this.score = 0;
  }
  
  onUpdate(deltaTime) {
    // Apply gravity
    this.physics.applyGravity(this.player, deltaTime);
    
    // Update obstacles
    this.obstacles.forEach(obs => obs.update(deltaTime));
    
    // Check collisions
    this.checkCollisions();
  }
  
  onRender(ctx) {
    this.drawBackground(ctx);
    this.obstacles.forEach(obs => obs.render(ctx));
    this.player.render(ctx);
    this.drawUI(ctx);
  }
  
  // Game-specific methods
  spawnObstacle() {}
  checkCollisions() {}
  handleJump() {}
}
```

---

## 📛 Naming Conventions

### Files
| Type | Convention | Example |
|------|------------|---------|
| Classes | PascalCase | `GameEngine.js`, `PhysicsEngine.js` |
| Configs | kebab-case + `.config` | `flappy.config.js`, `runner.config.js` |
| Utils | PascalCase + `Utils` | `MathUtils.js`, `ColorUtils.js` |
| Styles | kebab-case | `flappy.styles.css` |
| Constants | SCREAMING_SNAKE | Inside files: `MAX_VELOCITY` |

### Variables & Functions
```javascript
// Constants
const MAX_FALL_SPEED = 10;
const GAME_STATES = { IDLE: 0, PLAYING: 1 };

// Classes
class PlayerCharacter {}
class CollisionSystem {}

// Functions
function calculateVelocity() {}
function handlePlayerInput() {}

// Private members (convention)
_privateMethod() {}
_internalState = {};

// Event names
'game:start'
'player:jump'
'score:update'
```

### CSS Classes
```css
/* BEM naming for game UI */
.game-container {}
.game-container__canvas {}
.game-container--fullscreen {}

.modal {}
.modal__title {}
.modal--visible {}

.btn {}
.btn--primary {}
.btn--disabled {}
```

---

## 🔧 Configuration System

Each game has its own config that extends base config:

```javascript
// core/BaseConfig.js
const BASE_CONFIG = {
  // Canvas defaults
  CANVAS_WIDTH: 400,
  CANVAS_HEIGHT: 600,
  
  // Physics defaults
  GRAVITY: 0.4,
  MAX_FALL_SPEED: 10,
  
  // Game defaults
  DEBUG_MODE: false,
  SHOW_HITBOXES: false
};

// games/flappy-cinnamoroll/flappy.config.js
import { BASE_CONFIG } from '../../core/BaseConfig';

export const FLAPPY_CONFIG = {
  ...BASE_CONFIG,
  
  // Override/extend
  GRAVITY: 0.4,
  FLAP_FORCE: -8,
  
  // Game-specific
  PLAYER_SIZE: 40,
  PLAYER_X_PERCENT: 0.15,
  
  CLOUD_SPEED: 3,
  CLOUD_GAP: 150,
  CLOUD_WIDTH: 60,
  SPAWN_INTERVAL: 100,
  
  SPEED_INCREMENT: 0.5,
  SPEED_INCREASE_INTERVAL: 5,
  
  GHOST_SPAWN_SCORE: 5,
  GHOST_BASE_SPEED: 1.5
};
```

---

## 🔄 Module Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                     GAME CARDS (games/)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Flappy     │  │   Runner     │  │    Jump      │       │
│  │ Cinnamoroll  │  │ Cinnamoroll  │  │ Cinnamoroll  │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   CHARACTERS (characters/)                   │
│  ┌────────────────┐  ┌────────────────┐                     │
│  │  Cinnamoroll   │  │    Enemies     │                     │
│  │    Sprite      │  │   (Ghost...)   │                     │
│  └────────┬───────┘  └────────┬───────┘                     │
└───────────┼────────────────────┼────────────────────────────┘
            │                    │
            ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    CORE ENGINE (core/)                       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ Engine  │ │ Physics │ │  Audio  │ │  Input  │           │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘           │
│       │          │          │          │                    │
│  ┌────┴────┐ ┌────┴────┐ ┌────┴────┐ ┌────┴────┐           │
│  │Rendering│ │ Storage │ │   UI    │ │  Utils  │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Implementation Phases

### Phase 1: Extract Core Systems (Current Sprint)
- [ ] Create folder structure
- [ ] Extract `EventSystem` from existing code
- [ ] Extract `SoundManager` from existing code
- [ ] Extract `Leaderboard` system
- [ ] Create `MathUtils`, `ColorUtils`

### Phase 2: Physics & Rendering
- [ ] Create `PhysicsEngine` with gravity, velocity
- [ ] Create `CollisionSystem` (AABB, bounds)
- [ ] Extract `CanvasRenderer` utilities
- [ ] Create `Background` system

### Phase 3: Character System
- [ ] Create `CharacterBase` class
- [ ] Extract `CinnamorollSprite` rendering
- [ ] Extract `Ghost` enemy
- [ ] Create `CharacterFactory`

### Phase 4: Game Engine
- [ ] Create `GameEngine` base class
- [ ] Implement state machine
- [ ] Create `InputManager`
- [ ] Wrap Flappy game as first "card"

### Phase 5: Polish & Documentation
- [ ] Write API documentation
- [ ] Create "How to create new game" guide
- [ ] Add TypeScript definitions (optional)
- [ ] Create game launcher

---

## 🎯 Benefits of This Architecture

| Benefit | Description |
|---------|-------------|
| **Reusability** | Physics, audio, rendering work across all games |
| **Maintainability** | Fix a bug once, all games benefit |
| **Scalability** | Add new games easily |
| **Testability** | Core systems can be unit tested |
| **Consistency** | Same look/feel across all Cinnamoroll games |
| **Modularity** | Load only what you need |

---

## 🚀 Next Steps

1. **Approve this architecture** - Review and adjust as needed
2. **Create the folder structure** - Set up all directories
3. **Begin Phase 1** - Extract core systems from current code
4. **Wrap Flappy as Card #1** - First working modular game

---

*"Build once, play forever!"* 🐰✨
