# Cinnamoroll Learning Games - AI Agent Instructions

## Architecture Overview

This is a **modular educational game engine** featuring 10+ Cinnamoroll-themed games for ages 6-35. The architecture separates shared engine code (`core/`) from individual game implementations (`games/`).

### Key Structure
```
core/           → Shared engine: GameEngine, Physics, Audio, Input, Storage
characters/     → Reusable character sprites (CinnamorollSprite, Ghost, CharacterBase)
games/          → Individual game "cards" - each is a self-contained module
src/            → TypeScript source for modern engine components
shared-assets/  → Audio, images, CSS shared across all games
```

### Game Card Pattern
Each game in `games/` follows this structure:
- `GameName.js` - Main game class (often self-contained with inlined config for `file://` compatibility)
- `game.config.js` - Configuration exports (may be duplicated in main file)
- `index.html` - Entry point with ES6 module imports
- `PRD.md` - Product requirements document
- `SKILLS.md` - Educational skills mapping

## Critical Patterns

### 1. GameEngine Inheritance
All games extend `GameEngine` from [core/engine/GameEngine.js](core/engine/GameEngine.js). Override lifecycle hooks:
```javascript
class MyGame extends GameEngine {
  onInit() {}      // Setup - called once
  onStart() {}     // Game begins
  onUpdate(dt) {}  // Game loop logic
  onRender(ctx) {} // Canvas drawing
  onGameOver() {}  // Cleanup, show scores
}
```

### 2. Age-Based Adaptive Difficulty (7 Levels)
Every game implements `getDifficultyFromAge(age)` mapping ages to difficulty 1-7:
```javascript
function getDifficultyFromAge(age) {
  if (age <= 8) return 1;   // Explorer
  if (age <= 10) return 2;  // Adventurer
  if (age <= 12) return 3;  // Champion
  if (age <= 15) return 4;  // Hero
  if (age <= 18) return 5;  // Legend
  if (age <= 25) return 6;  // Master
  return 7;                 // Sage
}
```
Each difficulty level adjusts game parameters (time limits, complexity, hints available).

### 3. Config Inlining Pattern
Games duplicate config inside the main JS file for **`file://` protocol compatibility**:
```javascript
// At top of GameName.js - inlined for direct file access
const CONFIG = Object.freeze({ ... });

// Also exported separately in game.config.js for module imports
```

### 4. Event-Driven Communication
Use `EventSystem` for decoupled game events:
```javascript
import { EventSystem, GameEvents } from '../../core/engine/EventSystem.js';
EventSystem.emit(GameEvents.SCORE_UPDATE, { score: 100 });
EventSystem.on(GameEvents.PLAYER_HIT, (data) => { ... });
```

### 5. Character System
Extend `CharacterBase` for new characters. See [characters/cinnamoroll/CinnamorollSprite.js](characters/cinnamoroll/CinnamorollSprite.js) for the standard implementation with:
- Physics properties (`velocity`, `velocityX`, `velocityY`)
- Bounds helpers (`centerX`, `centerY`, `right`, `bottom`, `bounds`)
- Canvas rendering with rotation and scale

## Development Commands

```powershell
npm run dev          # Vite dev server with hot reload
npm run test         # Run Vitest unit tests
npm run test:ui      # Interactive test UI
npm run build        # TypeScript + Vite production build
python -m http.server 8080  # Simple server for file:// testing
```

**Quick launch**: Double-click `start-games.bat` to start Python server and open launcher.

## Testing Conventions

- Unit tests: `tests/unit/*.test.ts` - Uses Vitest with jsdom
- E2E tests: `tests/e2e/*.spec.ts` - Uses Playwright
- Test setup: [tests/setup.ts](tests/setup.ts)
- Import from `src/core/` for TypeScript modules

## Creating New Games

1. Copy existing game folder structure from `games/candy-shop/` or similar
2. Create `PRD.md` with requirements, `SKILLS.md` with educational mappings
3. Implement game class extending `GameEngine`
4. Add age-based difficulty via `getDifficultyFromAge()`
5. Include inlined config for `file://` compatibility
6. Add entry to [games/INDEX.md](games/INDEX.md)

See [docs/CREATING_NEW_GAME.md](docs/CREATING_NEW_GAME.md) for detailed guide.

## Path Aliases (TypeScript/Vite)

```typescript
import { GameEngine } from '@core/engine/GameEngine';  // → src/core/
import { MyGame } from '@games/my-game';               // → src/games/
```

## Key External Dependencies

- `gsap` - Animation library (vendor chunked in build)
- `howler` - Audio playback
- `canvas-confetti` - Celebration effects
- `dexie` / `sql.js` - Local storage/database

## Important Files to Understand

- [ARCHITECTURE.md](ARCHITECTURE.md) - Full system design document
- [docs/API.md](docs/API.md) - Core module API reference
- [core/index.js](core/index.js) - Barrel exports for all core modules
- [games/INDEX.md](games/INDEX.md) - Game collection overview and build order

## Feature Flag Pattern (Quiz Quest Reference)

New features use **feature flags** for safe rollout. See `games/quiz-quest/QuizQuestGame.js`:
```javascript
// In constructor - toggle features without code changes
this._powerupsEnabled = true;      // Power-up system
this._explanationEnabled = true;   // Post-answer explanations

// In handlers - guard clauses check flags first
useFiftyFifty() {
  if (!this._powerupsEnabled) return;
  if (!this.currentQuestion) return;
  if (this._answerSelected) return;
  // ... safe to proceed
}
```

### Available Quiz Quest Modules
- `AdaptiveDifficulty.js` - Performance-based difficulty (rolling window, not age-based)
- Power-ups: 50/50, Hint (first letter), Skip
- Explanation modal with category-specific feedback

## Effective One-Shot Prompts

When prompting AI agents for this codebase, include:
- **Game name** and whether it's new or existing
- **Difficulty level context** if modifying age-based behavior
- **Target file(s)** when known (e.g., "in CandyShopGame.js")
- **Reference an existing game** for pattern consistency (e.g., "follow candy-shop structure")

Example prompts:
```
"Add a hint system to quiz-quest following the pattern in candy-shop"
"Create new game 'word-cloud' - word puzzle, extend GameEngine, 7 difficulty levels"
"Fix collision detection in star-counter onUpdate method"
"Add power-ups to star-counter following quiz-quest's feature flag pattern"
```
