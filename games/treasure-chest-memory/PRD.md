# Treasure Chest Memory - Product Requirements Document

> **Build Order: #1** | **Priority: HIGH** | **Complexity: LOW**

## 📋 Overview

| Field | Value |
|-------|-------|
| **Game Name** | Treasure Chest Memory |
| **Type** | Card Matching / Memory Game |
| **Target Age** | 6-35 (difficulty scaled) |
| **Primary Theme** | Memorization |
| **Secondary Themes** | Visual, Fun, Rewards |
| **Estimated Dev Time** | 4-6 hours |
| **Dependencies** | Core systems only |

---

## 🎯 Objectives

### Learning Goals
- **Short-term memory** - Remember card positions
- **Concentration** - Focus on the game board
- **Pattern recognition** - Identify matching pairs
- **Cognitive flexibility** - Adapt strategy as cards flip

### Game Goals
- Match all pairs with minimum flips
- Beat personal best scores
- Unlock new card themes
- Earn stars for the Career Assessment

---

## 🎮 Gameplay Description

### Core Mechanic
1. Player sees a grid of face-down "treasure chest" cards
2. Click/tap to flip a card and reveal the image
3. Click/tap a second card to try matching
4. If match → cards stay revealed + earn points
5. If no match → both cards flip back face-down
6. Continue until all pairs are matched

### Win Condition
- All pairs matched

### Scoring System
```
Base Score = 1000 points
Penalty per flip = -10 points (after minimum flips)
Time Bonus = +50 points per second under par time
Perfect Game = 2x multiplier (minimum flips)
```

### Star Rating
- ⭐⭐⭐ = Perfect or near-perfect
- ⭐⭐ = Completed with some mistakes
- ⭐ = Completed with many mistakes

---

## 📊 Difficulty Scaling

| Age Range | Grid Size | Pairs | Time Limit | Card Reveal |
|-----------|-----------|-------|------------|-------------|
| 6-8 | 2×3 | 3 | None | 3 sec preview |
| 9-12 | 3×4 | 6 | None | 2 sec preview |
| 13-15 | 4×4 | 8 | 120 sec | 1 sec preview |
| 16-18 | 4×5 | 10 | 90 sec | No preview |
| 19-25 | 5×4 | 10 | 60 sec | No preview |
| 26-35 | 6×4 | 12 | 45 sec | No preview |

### Difficulty Modifiers
- **Easy (Age 6-8)**: Cards briefly show at start, slower flip animation
- **Medium (Age 9-15)**: Standard gameplay
- **Hard (Age 16-25)**: Time pressure, more pairs
- **Expert (Age 26-35)**: Shuffle cards periodically, strict time

---

## 🎨 Visual Design

### Card Themes (Unlockable)
1. **Cinnamoroll Friends** (Default) - Character faces
2. **Sweet Treats** - Candy, cake, ice cream
3. **Cloud Shapes** - Different cloud types
4. **Numbers** - For math practice mode
5. **Letters** - For alphabet practice mode

### Card States
```
┌─────────┐   ┌─────────┐   ┌─────────┐
│  ╭───╮  │   │         │   │  ✓ ✓   │
│  │ ? │  │   │  🐰    │   │   🐰   │
│  ╰───╯  │   │         │   │  ✓ ✓   │
│ CHEST   │   │ FLIPPED │   │ MATCHED │
└─────────┘   └─────────┘   └─────────┘
  (hidden)     (revealed)   (completed)
```

### Color Palette
- Background: Soft sky gradient (#87CEEB → #E0F6FF)
- Card back: Warm brown treasure chest (#8B4513)
- Card front: White with pastel border (#FFB6C1)
- Match highlight: Golden glow (#FFD700)

### Animations
1. Card flip (3D rotation effect via CSS)
2. Match celebration (sparkle particles)
3. Wrong match (gentle shake)
4. Victory (confetti + Cinnamoroll dance)

---

## 🔊 Audio Design

| Event | Sound Type | Description |
|-------|------------|-------------|
| Card flip | Click | Soft "pop" |
| Match found | Chime | Happy two-note melody |
| No match | Soft buzz | Gentle "nope" tone |
| Game complete | Fanfare | Victory melody |
| Star earned | Sparkle | Magical tinkling |
| Timer warning | Tick | When <10 seconds |

---

## 📱 UI Components

### Main Game Screen
```
┌────────────────────────────────┐
│  ⭐ Score: 850   ⏱️ 0:45      │
│  Flips: 12      Pairs: 4/6    │
├────────────────────────────────┤
│                                │
│   [?] [?] [🐰] [?]            │
│                                │
│   [?] [☁️] [?] [☁️]           │
│                                │
│   [🐰] [?] [?] [?]            │
│                                │
├────────────────────────────────┤
│        [🔇] [⏸️] [🏠]         │
└────────────────────────────────┘
```

### Result Screen
```
┌────────────────────────────────┐
│       🎉 Great Job! 🎉        │
│                                │
│         ⭐⭐⭐               │
│                                │
│    Final Score: 1250          │
│    Flips: 12 (Perfect!)       │
│    Time: 0:45                 │
│                                │
│    [Play Again] [Home]        │
│                                │
│    🏆 New Best Score!         │
└────────────────────────────────┘
```

---

## 🗂️ Data Structures

### Card Object
```javascript
{
  id: 0,              // Unique card ID
  pairId: 'cinna_1',  // Matching pair identifier
  image: '🐰',        // Display content (emoji/image path)
  state: 'hidden',    // 'hidden' | 'flipped' | 'matched'
  position: { row: 0, col: 0 }
}
```

### Game State
```javascript
{
  cards: [],
  flippedCards: [],   // Currently flipped (max 2)
  matchedPairs: 0,
  totalPairs: 6,
  flips: 0,
  score: 1000,
  timeElapsed: 0,
  timeLimit: null,    // null = no limit
  difficulty: 1,
  theme: 'cinnamoroll'
}
```

### Progress Data (for Career Assessment)
```javascript
{
  gamesPlayed: 5,
  bestScore: 1450,
  averageFlips: 14,
  perfectGames: 2,
  totalStarsEarned: 12,
  memorySkillScore: 85  // 0-100 scale
}
```

---

## 🔄 Game Flow

```
┌─────────────┐
│   START     │
└──────┬──────┘
       ▼
┌─────────────┐
│ Select      │
│ Difficulty  │
└──────┬──────┘
       ▼
┌─────────────┐
│ Preview     │◄─── (Easy mode only)
│ Cards       │
└──────┬──────┘
       ▼
┌─────────────┐
│ GAME LOOP   │◄──────────────┐
│ Flip Card 1 │               │
└──────┬──────┘               │
       ▼                      │
┌─────────────┐               │
│ Flip Card 2 │               │
└──────┬──────┘               │
       ▼                      │
   ┌───────┐                  │
   │Match? │                  │
   └───┬───┘                  │
    Y/ \N                     │
    /   \                     │
   ▼     ▼                    │
┌─────┐ ┌─────┐               │
│Keep │ │Hide │               │
│Open │ │Both │               │
└──┬──┘ └──┬──┘               │
   │       │                  │
   └───┬───┘                  │
       ▼                      │
   ┌───────┐                  │
   │All    │──No──────────────┘
   │Done?  │
   └───┬───┘
       │Yes
       ▼
┌─────────────┐
│ Show Result │
│ Save Score  │
└─────────────┘
```

---

## 🧪 Test Cases

### Functional Tests
- [ ] Cards shuffle randomly each game
- [ ] Only 2 cards can be flipped at once
- [ ] Matched pairs stay visible
- [ ] Unmatched pairs flip back after delay
- [ ] Score calculates correctly
- [ ] Timer counts correctly (when enabled)
- [ ] Game detects win condition
- [ ] Difficulty changes grid size

### Edge Cases
- [ ] Rapid clicking doesn't break game
- [ ] Same card clicked twice is ignored
- [ ] Game pauses correctly
- [ ] Progress saves on browser close
- [ ] Works on touch devices

---

## 📈 Assessment Metrics

This game contributes to Career Assessment in:

| Skill Category | Weight | Measurement |
|----------------|--------|-------------|
| Memory | 40% | Average flips vs optimal |
| Attention | 30% | Consistency across games |
| Processing Speed | 20% | Time to complete |
| Strategy | 10% | Improvement over time |

---

## 🔗 Dependencies

### Required Core Modules
- `EventSystem.js` - Game events (flip, match, win)
- `SoundManager.js` - Audio feedback
- `Leaderboard.js` - Score persistence
- `InputManager.js` - Click/touch handling
- `MathUtils.js` - Shuffle algorithm

### Optional Enhancements
- **CSS 3D Transforms** - Card flip animation
- **Canvas Particles** - Celebration effects
- **Haptic Feedback API** - Mobile vibration

---

## 🚀 Future Enhancements

1. **Multiplayer Mode** - Take turns, most pairs wins
2. **Daily Challenge** - Same seed for all players
3. **Custom Card Creator** - Upload own images
4. **Themed Backgrounds** - Match card theme
5. **Streak System** - Bonus for consecutive matches

---

## ✅ Acceptance Criteria

- [ ] Grid displays correctly for all difficulty levels
- [ ] Cards flip with smooth animation
- [ ] Matching logic works 100% correctly
- [ ] Score persists to leaderboard
- [ ] Mobile touch works perfectly
- [ ] Sounds play at appropriate times
- [ ] Difficulty scales with user age
- [ ] Progress data saves for assessment
- [ ] Accessible (keyboard navigation)
- [ ] Performance: 60fps on mobile
