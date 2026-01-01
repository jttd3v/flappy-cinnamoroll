# Flappy Cinnamoroll - Game Card

> A Flappy Bird-style game featuring Cinnamoroll flying through cloud gaps.

## 🎮 Game Overview

| Property | Value |
|----------|-------|
| **Game Type** | Endless vertical scroller |
| **Difficulty** | Progressive (speed increases) |
| **Controls** | Click / Tap / Spacebar |
| **Objective** | Pass through cloud gaps to score |

## 🗂️ Files

```
games/flappy-cinnamoroll/
├── index.html          # Main game file (standalone)
├── FlappyGame.js       # Game logic module (future refactor)
├── flappy.config.js    # Game configuration
├── flappy.styles.css   # Game-specific styles
└── README.md           # This file
```

## 🎯 Core Mechanics

### Physics
- **Gravity**: Constant downward force (0.4 px/frame)
- **Flap Force**: Upward impulse on input (-8 px)
- **Max Fall Speed**: Capped at 10 px/frame

### Obstacles
- Cloud pairs with gaps spawn from the right
- Gap size: 150px (constant)
- Speed increases every 5 points

### Ghost Enemy
- Appears after score reaches 5
- Chases player vertically
- Speed scales with game speed

## 🔧 Configuration

All settings can be modified in `flappy.config.js`:

```javascript
export const FLAPPY_CONFIG = {
  // Physics
  GRAVITY: 0.4,
  FLAP_FORCE: -8,
  
  // Obstacles
  BASE_CLOUD_SPEED: 3,
  CLOUD_GAP: 150,
  SPAWN_INTERVAL: 100,
  
  // Difficulty
  SPEED_INCREMENT: 0.5,
  SPEED_INCREASE_INTERVAL: 5,
  
  // Ghost
  GHOST_SPAWN_SCORE: 5,
  GHOST_BASE_SPEED: 1.5
};
```

## 🎨 Uses from Core

This game card uses the following core systems:

| Module | Usage |
|--------|-------|
| `PhysicsEngine` | Gravity, velocity |
| `Collision` | AABB collision, gap obstacles |
| `SoundManager` | Flap, score, collision sounds |
| `Leaderboard` | Score persistence |
| `InputManager` | Click, touch, keyboard |
| `EventSystem` | Game events |

## 🐰 Uses from Characters

| Character | Role |
|-----------|------|
| `CinnamorollSprite` | Player character |
| `Ghost` | Chasing enemy |

## 📊 State Machine

```
NAME_ENTRY → IDLE → PLAYING → GAME_OVER
                ↑               ↓
                └───────────────┘
```

## 🏆 Scoring

- +1 point per cloud passed
- Speed increases every 5 points
- Ghost appears at score 5
- Leaderboard saves top 5 scores

## 🔊 Sound Effects

| Event | Sound |
|-------|-------|
| Flap/Jump | Quick rising tone |
| Score | Two-note rising melody |
| Collision | Descending harsh tone |
| Speed Up | Whoosh effect |
| Ghost Appear | Eerie low tone |

## 📱 Mobile Support

- Touch controls enabled
- Responsive canvas sizing
- `touch-action: manipulation` for no delay

## 🔮 Future Improvements

- [ ] Sprite animation frames
- [ ] Power-ups (shield, slow-mo)
- [ ] Multiple backgrounds/themes
- [ ] Achievement system
- [ ] Share score feature
