# Core API Reference

> Complete API documentation for the Cinnamoroll Game Engine core modules

## Table of Contents

1. [GameEngine](#gameengine)
2. [EventSystem](#eventsystem)
3. [PhysicsEngine](#physicsengine)
4. [Collision](#collision)
5. [Bounds](#bounds)
6. [SoundManager](#soundmanager)
7. [InputManager](#inputmanager)
8. [Leaderboard](#leaderboard)
9. [CanvasRenderer](#canvasrenderer)
10. [MathUtils](#mathutils)

---

## GameEngine

Base class for all game cards.

### Import
```javascript
import { GameEngine, GameState } from './core/engine/GameEngine.js';
```

### Constructor
```javascript
new GameEngine(config, canvasId = 'gameCanvas')
```

### Properties
| Property | Type | Description |
|----------|------|-------------|
| `config` | Object | Game configuration |
| `canvas` | HTMLCanvasElement | Canvas element |
| `ctx` | CanvasRenderingContext2D | Canvas context |
| `state` | GameState | Current game state |
| `score` | number | Current score |
| `highScore` | number | High score |
| `entities` | Array | Game entities |
| `frameCount` | number | Frames elapsed |
| `deltaTime` | number | Time since last frame |

### Lifecycle Methods (Override in subclass)
| Method | Description |
|--------|-------------|
| `onInit()` | Called once on initialization |
| `onStart()` | Called when game starts |
| `onUpdate(deltaTime)` | Called each frame during play |
| `onRender(ctx)` | Called each frame for rendering |
| `onPause()` | Called when game pauses |
| `onResume()` | Called when game resumes |
| `onGameOver()` | Called on game over |
| `onReset()` | Called when game resets |

### Methods
```javascript
start()                    // Start game loop
stop()                     // Stop game loop
pause()                    // Pause game
resume()                   // Resume game
reset()                    // Reset to initial state
addEntity(entity)          // Add entity
removeEntity(entity)       // Remove entity
clearCanvas(color?)        // Clear canvas
addScore(amount = 1)       // Increment score
```

### GameState Enum
```javascript
GameState.LOADING    // -2
GameState.NAME_ENTRY // -1
GameState.IDLE       // 0
GameState.PLAYING    // 1
GameState.PAUSED     // 2
GameState.GAME_OVER  // 3
```

---

## EventSystem

Pub/sub event system for decoupled communication.

### Import
```javascript
import { EventSystem, GameEvents } from './core/engine/EventSystem.js';
```

### Static Methods
```javascript
EventSystem.on(event, callback, context?)    // Subscribe
EventSystem.once(event, callback, context?)  // Subscribe once
EventSystem.off(event, callback)             // Unsubscribe
EventSystem.emit(event, data?)               // Emit event
EventSystem.clear(event?)                    // Clear listeners
EventSystem.hasListeners(event)              // Check listeners
EventSystem.setDebug(enabled)                // Toggle debug
```

### GameEvents Enum
```javascript
// Lifecycle
GameEvents.GAME_START
GameEvents.GAME_PAUSE
GameEvents.GAME_RESUME
GameEvents.GAME_OVER
GameEvents.GAME_RESET

// Player
GameEvents.PLAYER_JUMP
GameEvents.PLAYER_HIT
GameEvents.PLAYER_DEATH

// Score
GameEvents.SCORE_UPDATE
GameEvents.HIGH_SCORE
GameEvents.MILESTONE

// Input
GameEvents.INPUT_ACTION
GameEvents.KEY_DOWN
GameEvents.KEY_UP
GameEvents.TOUCH_START
GameEvents.TOUCH_END
```

---

## PhysicsEngine

Configurable physics system.

### Import
```javascript
import { PhysicsEngine } from './core/physics/PhysicsEngine.js';
```

### Constructor
```javascript
new PhysicsEngine({
  gravity: 0.4,
  friction: 1,
  maxVelocity: { x: 10, y: 10 },
  enableGravity: true
})
```

### Methods
```javascript
applyGravity(entity, deltaTime?)      // Apply gravity
applyVelocity(entity, deltaTime?)     // Apply velocity
applyImpulse(entity, forceX, forceY)  // Instant velocity change
setVelocity(entity, vx?, vy?)         // Set velocity
applyFriction(entity, friction?)      // Apply friction
clampVelocity(entity)                 // Clamp to max
update(entity, deltaTime?)            // Full physics update
updateAll(entities, deltaTime?)       // Update array

// Static
PhysicsEngine.distance(a, b)          // Distance between
PhysicsEngine.angleBetween(from, to)  // Angle between
PhysicsEngine.moveTowards(e, x, y, speed)
PhysicsEngine.isMoving(entity)
```

---

## Collision

Collision detection methods.

### Import
```javascript
import { Collision } from './core/physics/Collision.js';
```

### Static Methods
```javascript
// Rectangle collision
Collision.checkAABB(a, b)
Collision.checkAABBWithMargin(a, b, shrinkA, shrinkB)

// Circle collision
Collision.checkCircle(a, b)
Collision.checkCircleRect(circle, rect)

// Point collision
Collision.checkPointInRect(point, rect)
Collision.checkPointInCircle(point, circle)

// Bounds
Collision.checkBounds(entity, bounds)
Collision.isOutsideBounds(entity, bounds)
Collision.clampToBounds(entity, bounds)

// Specialized
Collision.checkGapObstacle(entity, obstacle, screenHeight)
Collision.getOverlap(a, b)
Collision.getCollisionResponse(moving, static)
```

---

## Bounds

Screen boundary management.

### Import
```javascript
import { Bounds } from './core/physics/Bounds.js';
```

### Constructor
```javascript
new Bounds({ x, y, width, height, padding })

// Or use factory
Bounds.fromCanvas(canvas, padding?)
Bounds.fromConfig(config)
```

### Properties
```javascript
bounds.right       // x + width
bounds.bottom      // y + height
bounds.centerX     // center X
bounds.centerY     // center Y
bounds.innerLeft   // with padding
bounds.innerRight
bounds.innerTop
bounds.innerBottom
```

### Methods
```javascript
contains(entity)           // Fully inside?
intersects(entity)         // Partially inside?
isOutside(entity)          // Completely outside?
getEdgeCollisions(entity)  // Which edges touched

clamp(entity, options?)    // Clamp to bounds
clampVertical(entity)      // Vertical only
clampHorizontal(entity)    // Horizontal only

wrap(entity, options?)     // Wrap around

getRandomPosition(w?, h?)          // Random inside
getEdgeSpawnPosition(edge, w?, h?) // Spawn at edge
```

---

## SoundManager

Web Audio API sound system.

### Import
```javascript
import { SoundManager, SoundType, soundManager } from './core/audio/SoundManager.js';
```

### Singleton
```javascript
const sound = SoundManager.getInstance();
// or use exported instance
soundManager
```

### Methods
```javascript
init()                      // Initialize (call after user input)
resume()                    // Resume suspended context
play(type, options?)        // Play sound
playTone(options)           // Custom tone
playSequence(notes, gap?)   // Play note sequence
setVolume(vol)              // Set volume (0-1)
mute()                      // Mute
unmute()                    // Unmute
toggleMute()                // Toggle mute
isAvailable()               // Check if audio works
destroy()                   // Cleanup
```

### SoundType Enum
```javascript
SoundType.JUMP
SoundType.FLAP
SoundType.SCORE
SoundType.COLLISION
SoundType.GAME_OVER
SoundType.POWER_UP
SoundType.SPEED_UP
SoundType.GHOST_APPEAR
SoundType.BUTTON_CLICK
SoundType.MILESTONE
```

---

## InputManager

Unified input handling.

### Import
```javascript
import { InputManager, InputActions } from './core/input/InputManager.js';
```

### Constructor
```javascript
new InputManager(targetElement)
```

### Methods
```javascript
init()                             // Attach listeners
destroy()                          // Remove listeners
mapAction(action, binding)         // Map action to inputs
onAction(action, callback)         // Listen for action
isKeyDown(key)                     // Check key state
isAnyKeyDown(keys)                 // Check multiple keys
isActionActive(action)             // Check action state
getPointerPosition()               // Get mouse/touch pos
isPointerDown()                    // Is clicking/touching?
enable()                           // Enable input
disable()                          // Disable input
clearState()                       // Clear all state
```

### InputActions Enum
```javascript
InputActions.JUMP
InputActions.FLAP
InputActions.MOVE_LEFT
InputActions.MOVE_RIGHT
InputActions.MOVE_UP
InputActions.MOVE_DOWN
InputActions.PAUSE
InputActions.CONFIRM
InputActions.CANCEL
InputActions.PRIMARY_ACTION
```

---

## Leaderboard

Score management system.

### Import
```javascript
import { Leaderboard } from './core/storage/Leaderboard.js';
```

### Constructor
```javascript
new Leaderboard(storageKey, maxEntries = 10)
```

### Methods
```javascript
getScores()                    // Get all scores
getTopScores(n?)               // Get top N
getHighScore()                 // Get #1 score

validateName(name)             // Validate player name
findPlayer(name)               // Find player entry
playerExists(name)             // Check if exists
getPlayerBestScore(name)       // Get player's best
getAllPlayers()                // Get all names

addScore(name, score)          // Add/update score
isHighScore(score)             // Qualifies for board?
getRank(score)                 // Get rank for score

formatDatetime(isoString)      // Format date
clear()                        // Clear all data
export()                       // Export as JSON
import(json)                   // Import from JSON
```

---

## CanvasRenderer

Canvas drawing utilities.

### Import
```javascript
import { CanvasRenderer } from './core/rendering/CanvasRenderer.js';
```

### Constructor
```javascript
new CanvasRenderer(ctx)
```

### Methods
```javascript
// Basic
clear(fillColor?)
drawGradientBackground(topColor, bottomColor)

// Shapes
rect(x, y, w, h, options)
roundRect(x, y, w, h, radius, options)
circle(x, y, radius, options)
ellipse(x, y, rx, ry, rotation?, options)
line(x1, y1, x2, y2, options)

// Cinnamoroll themed
cloud(x, y, size, options)
cloudObstacle(cloud, gapHeight, canvasHeight, options)

// Text
text(text, x, y, options)
centeredText(text, y, options)

// Transforms
save()
restore()
translate(x, y)
rotate(angle)
scale(x, y)

// Effects
withShadow(drawFn, shadowOptions)
withAlpha(drawFn, alpha)
setAlpha(alpha)
```

---

## MathUtils

Math utility functions.

### Import
```javascript
import { MathUtils } from './core/utils/MathUtils.js';
```

### Methods
```javascript
// Clamping
MathUtils.clamp(value, min, max)
MathUtils.inRange(value, min, max)
MathUtils.wrap(value, min, max)

// Interpolation
MathUtils.lerp(start, end, t)
MathUtils.inverseLerp(start, end, value)
MathUtils.smoothStep(t)
MathUtils.smootherStep(t)
MathUtils.map(value, inMin, inMax, outMin, outMax)

// Random
MathUtils.randomInt(min, max)
MathUtils.randomFloat(min, max)
MathUtils.randomBool(probability?)
MathUtils.randomPick(array)
MathUtils.shuffle(array)
MathUtils.randomGaussian(mean?, stdDev?)

// Distance & Angles
MathUtils.distance(x1, y1, x2, y2)
MathUtils.distanceSquared(x1, y1, x2, y2)
MathUtils.angleBetween(x1, y1, x2, y2)
MathUtils.degToRad(degrees)
MathUtils.radToDeg(radians)
MathUtils.normalizeAngle(angle)

// Vectors
MathUtils.magnitude(x, y)
MathUtils.normalize(x, y)
MathUtils.dot(x1, y1, x2, y2)
MathUtils.cross(x1, y1, x2, y2)

// Easing
MathUtils.easing.linear(t)
MathUtils.easing.easeInQuad(t)
MathUtils.easing.easeOutQuad(t)
MathUtils.easing.easeInOutQuad(t)
MathUtils.easing.easeInCubic(t)
MathUtils.easing.easeOutCubic(t)
MathUtils.easing.easeInOutCubic(t)
MathUtils.easing.easeInElastic(t)
MathUtils.easing.easeOutElastic(t)
MathUtils.easing.easeOutBounce(t)
```

---

*Generated for Cinnamoroll Game Engine v1.0.0*
