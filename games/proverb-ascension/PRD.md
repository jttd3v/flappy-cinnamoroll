# Proverb Ascension - Product Requirements Document

## 1. Game Title
**Proverb Ascension** - Wisdom Through Mastery

## 2. Game Intent
Transform proverb memorization into a mastery-based cognitive game where **understanding unlocks progress**. No meaning, no level-up.

**Core Rule:** Wisdom must be earned, not clicked.

---

## 3. Player Objective
Master Proverbs 1:1–5 through:
- Explaining meaning (paraphrase)
- Applying to real situations (anchoring)
- Recalling accurately over time (spaced retrieval)

**Winning condition:** Retention and comprehension, not completion speed.

---

## 4. Educational Foundation

### Cognitive Science Backing
- **Spaced Retrieval** - Memory consolidation through timed intervals
- **Elaborative Encoding** - Personal anchors strengthen recall
- **Desirable Difficulties** - Friction creates deeper learning

### Supported By
- *Make It Stick* (Brown, Roediger, McDaniel)
- *Peak* by Anders Ericsson
- Cognitive load theory research

---

## 5. Game Structure

### Levels (Fixed Progression)
Each proverb is one **Level**:

| Level | Proverb Focus | Verse |
|-------|---------------|-------|
| 1 | Purpose of Proverbs | 1:1 |
| 2 | Understanding Wisdom | 1:2 |
| 3 | Moral Judgment | 1:3 |
| 4 | Discretion & Youth | 1:4 |
| 5 | Growth Through Listening | 1:5 |

---

## 6. Core Game Loop

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   READ → DECODE → ANCHOR → RECALL → RETURN     │
│     │                         │         │      │
│     └─────────────────────────┴─────────┘      │
│            (Failure loops back)                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

1. **Read Phase** - Player reads the proverb (timed exposure)
2. **Decode Phase** - Player paraphrases meaning in own words
3. **Anchor Phase** - Player links proverb to personal experience
4. **Recall Phase** - Timed recall without text visible
5. **Interval Return** - Proverb reappears at spaced intervals

---

## 7. Mechanics

### A. Meaning Gate
- Player must write a paraphrase (minimum word count)
- System checks length, originality (no copy-paste)
- Keyword presence validation
- Shallow answers = no progress

### B. Real-World Anchor
- Short scenario/experience input
- Connects abstract wisdom to concrete life
- Encourages experiential encoding

### C. Spaced Retrieval Timer
- Intervals: 2, 5, 10, 20, 40 minutes
- Missed recall resets interval stage
- Visual countdown to next review

### D. Cognitive Load Control
- Max 2 active proverbs simultaneously
- Prevents working memory overload
- Focus on depth over breadth

---

## 8. Age-Based Difficulty (7 Levels)

| Level | Age Range | Min Words | Hint Availability | Interval Multiplier |
|-------|-----------|-----------|-------------------|---------------------|
| 1 | ≤8 | 3 | Full text hints | 0.5x (faster) |
| 2 | 9-10 | 5 | First letter hints | 0.7x |
| 3 | 11-12 | 8 | Keyword hints | 1.0x |
| 4 | 13-15 | 12 | Limited hints | 1.0x |
| 5 | 16-18 | 15 | No hints | 1.2x |
| 6 | 19-25 | 20 | No hints | 1.5x |
| 7 | 26+ | 25 | No hints | 2.0x (longer) |

---

## 9. Scoring System

| Action | Points |
|--------|--------|
| Clear paraphrase (meeting word count) | +10 |
| Strong real-world anchor | +10 |
| Accurate first-try recall | +15 |
| Perfect interval streak | +20 |
| Level mastery badge | +50 |

**Penalties:**
- Shallow paraphrase: 0 points, retry required
- Copy-paste detected: -5 points, retry required
- Missed interval: Interval resets (no point loss)

---

## 10. Progression Rules

- Levels unlock sequentially (no skipping)
- Mastery requires 3 successful recalls at increasing intervals
- Badge awarded per fully mastered proverb
- **Endgame:** "Five Seals of Wisdom" achievement

---

## 11. Failure States

- Repeated shallow answers → Coaching prompt appears
- Skipped meaning phase → Cannot proceed
- Failed recall → Returns to Decode phase
- **Philosophy:** Failure is instructional, not punitive

---

## 12. UX/UI Design

- Calm, focused interface (wisdom aesthetic)
- Soft gradients: cream, gold, soft purple
- Progress tied to **mastery %**, not time elapsed
- Minimal animation, zero distraction
- Responsive for mobile and desktop

---

## 13. Technical Constraints

- Single-page app
- HTML + CSS + vanilla JavaScript
- LocalStorage persistence (offline-first)
- No external dependencies required
- File:// protocol compatible

---

## 14. Success Metrics

- All 5 proverbs recalled after 40-minute interval
- User can explain each proverb's meaning
- Target retention rate: 75–85%
- Completion time: 45–90 minutes

---

## 15. Integration Notes

### Architecture Alignment
- Extends `GameEngine` from `core/engine/GameEngine.js`
- Uses `EventSystem` for state changes
- LocalStorage for persistence (offline-first)
- Age-based difficulty via `getDifficultyFromAge()`

### Borrowed Patterns
- Streak tracking from Dream Journal
- Badge system from Quiz Quest
- Text validation utilities

---

*"The fear of the LORD is the beginning of knowledge, but fools despise wisdom and instruction." - Proverbs 1:7*
