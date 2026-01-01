# Flappy Cinnamoroll - Game PRD

> A simple Flappy Bird–style game featuring Cinnamoroll flying through cloud gaps.

---

## 1. Overview

| Item | Value |
|------|-------|
| **Tech Stack** | HTML5 Canvas + Vanilla JavaScript |
| **Target** | Single HTML file, browser-playable |
| **MVP Scope** | Playable in 1 session of coding |

---

## 2. Game Concept

**Goal:** Keep Cinnamoroll flying by tapping/clicking. Pass through cloud gaps to score points. Avoid hitting clouds.

### Core Loop
```
Tap → Flap (upward impulse)
No input → Fall (gravity)
Hit cloud → Game Over
Pass cloud gap → Score +1
```

---

## 3. Game States

| State | Description | Transition |
|-------|-------------|------------|
| **IDLE** | Shows "Click to Start" | Click → PLAYING |
| **PLAYING** | Game running | Collision → GAME_OVER |
| **GAME_OVER** | Shows score, "Click to Restart" | Click → IDLE |

---

## 4. Game Elements

### 4.1 Player (Cinnamoroll)
- **Position:** Fixed X (left side ~15%), variable Y
- **Size:** ~40x40 pixels
- **Visual:** Simple cute character (can be emoji or drawn)
- **Physics:**
  - Gravity: `0.4` px/frame
  - Flap impulse: `-8` px (upward)
  - Max fall speed: `10` px/frame

### 4.2 Obstacles (Cloud Pairs)
- **Structure:** Top cloud + Bottom cloud with gap
- **Gap size:** `150` px (adjustable for difficulty)
- **Width:** `60` px each
- **Speed:** `3` px/frame (move left)
- **Spawn:** Every `150` frames (~2.5 sec at 60fps)
- **Removal:** When off-screen (x < -width)

### 4.3 Background
- **Color:** Light blue sky (`#87CEEB`)
- **Optional:** Simple scrolling clouds (decorative only)

---

## 5. Controls

| Input | Action |
|-------|--------|
| Mouse click | Flap |
| Spacebar | Flap |
| Touch (mobile) | Flap |

---

## 6. Scoring

- **+1 point** when Cinnamoroll passes a cloud pair
- Track with `scored` flag per cloud to prevent double-counting
- Display score top-center during gameplay
- Show final score on Game Over

---

## 7. Collision Detection

Simple rectangle collision (AABB):
```javascript
function checkCollision(player, cloud) {
  // Guard clause - skip if invalid objects
  if (!player || !cloud) return false;
  
  return (
    player.x + player.width > cloud.x &&
    player.x < cloud.x + cloud.width &&
    player.y < cloud.topHeight ||        // Hit top cloud
    player.y + player.height > cloud.bottomY  // Hit bottom cloud
  );
}
```

### Bounds Checking (Defensive)
```javascript
function clampPlayer(player) {
  // Prevent going above screen
  player.y = Math.max(0, player.y);
  
  // Clamp velocity to prevent runaway speeds
  player.velocity = Math.min(player.velocity, CONFIG.MAX_FALL_SPEED);
  
  // Ground collision = game over
  if (player.y + player.height >= CONFIG.CANVAS_HEIGHT) {
    return true; // collision detected
  }
  return false;
}
```

---

## 8. File Structure

```
flappy-cinnamoroll/
├── index.html           ← Single file containing everything
├── cinnamoroll-flap.md  ← This PRD
└── (optional) assets/
    └── cinnamoroll.png
```

---

## 9. Implementation Plan (Senior Dev Assessment)

### Summary

| Metric | Value |
|--------|-------|
| **Total Phases** | 4 (MVP) + 1 (Optional Polish) |
| **Total Tasks** | 18 core tasks |
| **Estimated Time** | 2-3 hours for experienced dev |
| **Minimum Playable** | After Phase 3 (~1.5 hours) |
| **Risk Level** | Low (well-understood mechanics) |

---

### Phase 1: Foundation (30 min) — BLOCKING
> ⚠️ Everything depends on this. Must complete 100%.

| # | Task | Est. | Dependency | Priority |
|---|------|------|------------|----------|
| 1.1 | Create `index.html` with HTML5 boilerplate | 5 min | None | P0 |
| 1.2 | Add `<canvas>` element (400x600) | 2 min | 1.1 | P0 |
| 1.3 | Get canvas context, verify not null | 3 min | 1.2 | P0 |
| 1.4 | Define CONFIG constants object | 5 min | None | P0 |
| 1.5 | Define STATE constants (IDLE/PLAYING/GAME_OVER) | 2 min | None | P0 |
| 1.6 | Set up `requestAnimationFrame` game loop | 10 min | 1.3 | P0 |
| 1.7 | Implement basic `render()` - clear and fill background | 3 min | 1.6 | P0 |

**Deliverable:** Blue canvas that runs at 60fps. No visible game yet.

---

### Phase 2: Player Character (30 min) — CORE
> 🎮 After this phase, you have something interactive.

| # | Task | Est. | Dependency | Priority |
|---|------|------|------------|----------|
| 2.1 | Create player object `{x, y, velocity, width, height}` | 3 min | 1.4 | P0 |
| 2.2 | Draw player (white circle or emoji "☁️🐰") | 5 min | 2.1 | P0 |
| 2.3 | Apply gravity each frame (`velocity += GRAVITY`) | 5 min | 2.1 | P0 |
| 2.4 | Update position (`y += velocity`) | 2 min | 2.3 | P0 |
| 2.5 | Add click/space/touch event listeners | 8 min | 1.6 | P0 |
| 2.6 | Implement flap (`velocity = FLAP_FORCE`) | 3 min | 2.5 | P0 |
| 2.7 | Clamp velocity and Y bounds | 4 min | 2.4 | P0 |

**Deliverable:** Character falls, flaps on input, stays on screen.

---

### Phase 3: Obstacles + Collision (35 min) — CORE
> 🎯 After this phase, game is PLAYABLE (can win/lose).

| # | Task | Est. | Dependency | Priority |
|---|------|------|------------|----------|
| 3.1 | Create clouds array `[]` | 2 min | 1.4 | P0 |
| 3.2 | `spawnCloud()` - create cloud pair with random gap Y | 10 min | 3.1 | P0 |
| 3.3 | Draw clouds (white rectangles, top + bottom) | 8 min | 3.2 | P0 |
| 3.4 | Move clouds left each frame | 3 min | 3.1 | P0 |
| 3.5 | Remove clouds when off-screen (`x < -width`) | 5 min | 3.4 | P0 |
| 3.6 | Implement AABB collision check | 7 min | 2.1, 3.1 | P0 |

**Deliverable:** ✅ MINIMUM PLAYABLE GAME — clouds move, collision kills player.

---

### Phase 4: Game States + Scoring (25 min) — COMPLETE MVP
> 🏆 After this phase, it's a COMPLETE game loop.

| # | Task | Est. | Dependency | Priority |
|---|------|------|------------|----------|
| 4.1 | Implement state machine (IDLE → PLAYING → GAME_OVER) | 8 min | 1.5 | P0 |
| 4.2 | Add score variable, increment when passing cloud | 7 min | 3.5 | P0 |
| 4.3 | Draw score on screen (top center) | 3 min | 4.2 | P0 |
| 4.4 | Add `scored` flag to clouds, prevent double-count | 4 min | 4.2 | P0 |
| 4.5 | Implement `resetGame()` function | 3 min | All above | P0 |

**Deliverable:** ✅ FULL MVP — Start screen, gameplay, score, game over, restart.

---

### Phase 5: Polish (Optional, 20+ min) — NICE TO HAVE
> ✨ Only after MVP is working and tested.

| # | Task | Est. | Dependency | Priority |
|---|------|------|------------|----------|
| 5.1 | Add "Click to Start" text on IDLE screen | 5 min | 4.1 | P2 |
| 5.2 | Add "Game Over" + final score display | 5 min | 4.1 | P2 |
| 5.3 | High score with localStorage | 10 min | 4.2 | P3 |
| 5.4 | Simple tilt animation on flap | 15 min | 2.6 | P3 |
| 5.5 | Add cute Cinnamoroll image sprite | 10 min | 2.2 | P3 |

---

### Critical Path (Minimum Viable)

```
1.1 → 1.2 → 1.3 → 1.6 → 2.1 → 2.3 → 2.4 → 3.1 → 3.2 → 3.4 → 3.6 → 4.1
                              ↓
                        2.5 → 2.6
```

**Shortest path to playable:** ~12 tasks, ~1.5 hours

---

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Canvas not supported | Very Low | High | Check `getContext` exists |
| Collision feels unfair | Medium | Medium | Tune hitbox smaller than visual |
| Gap impossible to pass | Low | High | Clamp random Y with MIN/MAX |
| Input lag on mobile | Low | Medium | Use `touchstart` not `touchend` |
| Score counts twice | Medium | Low | Boolean flag per cloud |

---

### Definition of Done

| Milestone | Criteria |
|-----------|----------|
| **Playable** | Player can flap, clouds spawn, collision detected |
| **Complete MVP** | All 4 phases done, can start/play/die/restart |
| **Production Ready** | Phase 5 done, tested on mobile, no console errors |

---

## 10. Key Constants

```javascript
const CONFIG = {
  // Canvas
  CANVAS_WIDTH: 400,
  CANVAS_HEIGHT: 600,
  
  // Physics
  GRAVITY: 0.4,
  FLAP_FORCE: -8,
  MAX_FALL_SPEED: 10,
  
  // Player
  PLAYER_SIZE: 40,
  PLAYER_X_PERCENT: 0.15,  // 15% from left
  
  // Obstacles
  CLOUD_SPEED: 3,
  CLOUD_GAP: 150,
  CLOUD_WIDTH: 60,
  SPAWN_INTERVAL: 150,
  
  // Safety bounds
  MIN_GAP_Y: 100,          // Minimum distance from top
  MAX_GAP_Y_OFFSET: 200    // Max variation from center
};

// Game states (use constants, not strings)
const STATE = {
  IDLE: 0,
  PLAYING: 1,
  GAME_OVER: 2
};
```

---

## 11. Engineering Principles

### Keep It Simple
- Single HTML file for MVP
- No frameworks, no build tools
- Vanilla JS only

### SOLID (Light Application)
- **Single Responsibility:** Separate functions: `update()`, `render()`, `handleInput()`
- **Open/Closed:** CONFIG object allows tuning without code changes
- **Liskov:** Player and obstacles share common `update()` pattern
- Player logic separate from obstacle logic

### DRY
- One gravity constant used everywhere
- One collision function reused for all clouds
- One `spawnCloud()` function for all obstacles
- One `resetGame()` for restart logic

### Defensive Programming
- **Input validation:** Ignore inputs during GAME_OVER state
- **Bounds clamping:** Player Y always within `[0, canvasHeight]`
- **Velocity clamping:** `velocity = Math.min(velocity, MAX_FALL_SPEED)`
- **Null checks:** Verify canvas context exists before drawing
- **Double-score prevention:** `cloud.scored` flag checked before incrementing
- **Array cleanup:** Remove off-screen clouds to prevent memory growth
- **State guards:** Only update physics when `state === PLAYING`
- **Fallback assets:** Use emoji/shapes if image fails to load

### Game Loop Best Practices
- **Fixed timestep awareness:** Use `deltaTime` for consistent speed across devices
- **Clear before draw:** Always `ctx.clearRect()` before rendering
- **Update then render:** Physics first, drawing second
- **Single requestAnimationFrame:** Never stack multiple RAF calls

---

## 12. Out of Scope (v1)

❌ Animations/sprite sheets  
❌ Sound effects  
❌ Parallax scrolling  
❌ Difficulty progression  
❌ Multiple characters  
❌ Power-ups  

---

## 13. Success Criteria

✅ Game loads in browser  
✅ Cinnamoroll responds to input  
✅ Clouds spawn and move  
✅ Collision ends game  
✅ Score displays correctly  
✅ Can restart after game over  

---

## 14. Common Pitfalls to Avoid

| Pitfall | Prevention |
|---------|------------|
| Multiple RAF loops stacking | Store RAF ID, cancel on reset |
| Clouds array growing forever | Remove clouds when `x < -width` |
| Score counting same cloud twice | `cloud.scored = true` flag |
| Physics speed varies by FPS | Use deltaTime or fixed timestep |
| Input fires during game over | Check `state === PLAYING` first |
| Player teleports through cloud | Velocity clamping prevents this |
| Canvas null reference | Check `getContext('2d')` exists |
| Impossible gaps near edges | Clamp gap Y with MIN/MAX bounds |

---

## 15. Minimal Game Loop Template

```javascript
let lastTime = 0;
let rafId = null;

function gameLoop(timestamp) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  
  // Only update physics when playing
  if (state === STATE.PLAYING) {
    update(deltaTime);
  }
  
  // Always render (shows start/game over screens)
  render();
  
  // Continue loop
  rafId = requestAnimationFrame(gameLoop);
}

function resetGame() {
  // Cancel existing loop before starting new one
  if (rafId) cancelAnimationFrame(rafId);
  
  // Reset all state
  player.y = CONFIG.CANVAS_HEIGHT / 2;
  player.velocity = 0;
  clouds.length = 0;  // Clear array without reassigning
  score = 0;
  frameCount = 0;
  state = STATE.IDLE;
}
```

---

*Keep it simple. Ship it. Iterate later.*
