# Creating a New Cinnamoroll Game

> Step-by-step guide to adding a new game card to the system

## 📋 Prerequisites

Before creating a new game, ensure you understand:
- The core module architecture (`/core`)
- Character system (`/characters`)
- JavaScript ES6 modules

## 🚀 Quick Start

### Step 1: Create Game Folder

```
games/
└── your-game-name/
    ├── index.html
    ├── YourGame.js
    ├── your-game.config.js
    ├── your-game.styles.css
    └── README.md
```

### Step 2: Create Configuration

```javascript
// your-game.config.js
import { BASE_CONFIG } from '../../games/flappy-cinnamoroll/flappy.config.js';

export const YOUR_GAME_CONFIG = {
  ...BASE_CONFIG,
  
  // Override defaults
  CANVAS_WIDTH: 400,
  CANVAS_HEIGHT: 600,
  
  // Your game-specific settings
  YOUR_SETTING: value
};
```

### Step 3: Create Game Class

```javascript
// YourGame.js
import { GameEngine, GameState } from '../../core/engine/GameEngine.js';
import { PhysicsEngine } from '../../core/physics/PhysicsEngine.js';
import { SoundManager, SoundType } from '../../core/audio/SoundManager.js';
import { InputManager, InputActions } from '../../core/input/InputManager.js';
import { CinnamorollSprite } from '../../characters/cinnamoroll/CinnamorollSprite.js';
import { YOUR_GAME_CONFIG } from './your-game.config.js';

export class YourGame extends GameEngine {
  constructor(canvasId) {
    super(YOUR_GAME_CONFIG, canvasId);
    
    // Initialize systems
    this.physics = new PhysicsEngine({
      gravity: YOUR_GAME_CONFIG.GRAVITY
    });
    
    this.sound = SoundManager.getInstance();
    this.input = new InputManager(this.canvas);
  }
  
  onInit() {
    // Setup player
    this.player = CinnamorollSprite.fromConfig(
      YOUR_GAME_CONFIG,
      this.canvas.width,
      this.canvas.height
    );
    
    // Setup input
    this.input.init();
    this.input.onAction(InputActions.JUMP, () => this.handleJump());
    
    // Initialize sound
    this.sound.init();
  }
  
  onUpdate(deltaTime) {
    // Apply physics
    this.physics.applyGravity(this.player);
    this.physics.applyVelocity(this.player);
    
    // Update player animation
    this.player.update(deltaTime);
    
    // Your game logic here
  }
  
  onRender(ctx) {
    // Clear and draw background
    this.clearCanvas('#87CEEB');
    
    // Draw player
    this.player.render(ctx);
    
    // Draw UI
    this.drawScore(ctx);
  }
  
  handleJump() {
    if (this.state === GameState.PLAYING) {
      this.player.velocity = YOUR_GAME_CONFIG.FLAP_FORCE;
      this.sound.play(SoundType.JUMP);
    }
  }
  
  drawScore(ctx) {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.score, this.canvas.width / 2, 50);
  }
}
```

### Step 4: Create HTML Entry Point

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Game Name</title>
  <link rel="stylesheet" href="your-game.styles.css">
</head>
<body>
  <canvas id="gameCanvas"></canvas>
  
  <script type="module">
    import { YourGame } from './YourGame.js';
    
    const game = new YourGame('gameCanvas');
    game.start();
  </script>
</body>
</html>
```

## 🎮 Using Core Systems

### Physics

```javascript
import { PhysicsEngine } from '../../core/physics/PhysicsEngine.js';
import { Collision } from '../../core/physics/Collision.js';
import { Bounds } from '../../core/physics/Bounds.js';

// Create physics engine
const physics = new PhysicsEngine({
  gravity: 0.5,
  maxVelocity: { x: 10, y: 15 }
});

// Apply to entity
physics.applyGravity(entity);
physics.applyVelocity(entity);
physics.clampVelocity(entity);

// Check collisions
if (Collision.checkAABB(player, obstacle)) {
  // Handle collision
}

// Check bounds
const bounds = new Bounds({ x: 0, y: 0, width: 400, height: 600 });
const result = bounds.clamp(player);
if (result.hit) {
  // Player hit screen edge
}
```

### Sound

```javascript
import { SoundManager, SoundType } from '../../core/audio/SoundManager.js';

const sound = SoundManager.getInstance();
sound.init(); // Call after user interaction

// Play predefined sounds
sound.play(SoundType.JUMP);
sound.play(SoundType.SCORE);
sound.play(SoundType.COLLISION);

// Volume control
sound.setVolume(0.5);
sound.mute();
sound.unmute();
```

### Input

```javascript
import { InputManager, InputActions } from '../../core/input/InputManager.js';

const input = new InputManager(canvas);
input.init();

// Listen for actions
input.onAction(InputActions.JUMP, (data) => {
  console.log('Jump!', data.type); // 'keyboard', 'mouse', or 'touch'
});

// Custom action mapping
input.mapAction('shoot', {
  keys: ['Space', 'KeyX'],
  mouse: true,
  touch: true
});

// Check state
if (input.isKeyDown('ArrowLeft')) {
  player.moveLeft();
}
```

### Events

```javascript
import { EventSystem, GameEvents } from '../../core/engine/EventSystem.js';

// Subscribe to events
EventSystem.on(GameEvents.SCORE_UPDATE, (data) => {
  console.log('Score:', data.score);
});

// Emit events
EventSystem.emit(GameEvents.PLAYER_JUMP);

// One-time listener
EventSystem.once(GameEvents.GAME_OVER, () => {
  saveHighScore();
});
```

### Leaderboard

```javascript
import { Leaderboard } from '../../core/storage/Leaderboard.js';

const leaderboard = new Leaderboard('myGameLeaderboard', 10);

// Add score
const result = leaderboard.addScore('Player1', 100);
if (result.action === 'updated') {
  console.log('New high score!');
}

// Get scores
const topScores = leaderboard.getTopScores(5);
const highScore = leaderboard.getHighScore();
```

## 🐰 Using Characters

### Cinnamoroll

```javascript
import { CinnamorollSprite } from '../../characters/cinnamoroll/CinnamorollSprite.js';

// Create from config
const player = CinnamorollSprite.fromConfig(config, canvasWidth, canvasHeight);

// Or manually
const player = new CinnamorollSprite({
  x: 60,
  y: 300,
  width: 40,
  height: 40
});

// Update and render
player.update(deltaTime);
player.render(ctx);
```

### Ghost Enemy

```javascript
import { Ghost } from '../../characters/enemies/Ghost.js';

const ghost = new Ghost({
  width: 50,
  height: 50,
  baseSpeed: 1.5
});

// Activate ghost
ghost.spawn(-50, player.y);
ghost.setTarget(player);

// Update (pass speed multiplier for difficulty)
ghost.update(deltaTime, currentSpeedMultiplier);

// Check collision
if (ghost.active && Collision.checkAABB(player.getHitbox(), ghost.getHitbox())) {
  gameOver();
}
```

## 📝 Best Practices

### DO ✅

- Extend `GameEngine` for your game class
- Use config files for all magic numbers
- Emit events for significant game moments
- Use the character system for players/enemies
- Document your game in README.md

### DON'T ❌

- Hardcode values in game code
- Create duplicate physics/sound systems
- Modify core modules directly
- Skip input initialization
- Forget mobile touch support

## 🎨 Game Ideas

| Game Type | Description | Core Modules |
|-----------|-------------|--------------|
| **Runner** | Endless runner with obstacles | Physics, Collision, Bounds |
| **Jumper** | Vertical platformer | Physics, Collision |
| **Catcher** | Catch falling items | Collision, Bounds |
| **Shooter** | Simple shoot-em-up | Collision, InputManager |
| **Puzzle** | Match-3 or similar | EventSystem |

## 🆘 Need Help?

1. Check the core module JSDoc comments
2. Look at Flappy Cinnamoroll as reference
3. Review the ARCHITECTURE.md document
