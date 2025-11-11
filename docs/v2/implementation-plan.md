# DC Solo RPG V2 Migration - Implementation Plan & Progress Tracker

**Document Version:** 1.0
**Created:** 2025-11-11
**Status:** Planning → In Progress
**Target Completion:** 3-4 weeks

---

## Executive Summary

### Objective
Migrate DC Solo RPG from V1 (YAML/CSV-based) to V2 (Type-Based Markdown Format) while fixing critical SRD compliance bugs.

### Current State Assessment
- **Architecture:** ✅ Excellent (Svelte 5 runes, clean state management)
- **Mechanical Framework:** ⚠️ 65-70% SRD compliant (4 critical bugs)
- **Content System:** ❌ 0% (no V2 parser, blocks game creation)
- **Overall Playability:** 35% (works but unplayable without content)

### Target State
- **Architecture:** ✅ Maintained (no major refactoring needed)
- **Mechanical Framework:** ✅ 95%+ SRD compliant (all bugs fixed)
- **Content System:** ✅ 100% (V2 parser + validation + tooling)
- **Overall Playability:** ✅ 98% (production-ready)

### Timeline & Effort
- **Total Effort:** 28-40 hours development time
- **Critical Path:** 8-11 hours (blocks content creation)
- **Parallel Tracks:** 20-29 hours (can run concurrently)
- **Expected Duration:** 3-4 weeks with proper parallelization

### Key References
- **Framework Review:** `/docs/v2/game-engine-review.md`
- **V2 Format Spec:** `/docs/v2/game-config-v2.md`
- **Type-Based Format:** `/docs/v2/simplified-type-based-format.md`
- **SRD Mechanics:** `/docs/v2/wretched-alone-mechanics-guide.md`
- **Example Game:** `/docs/v2/type-based-future-lost.game.md`
- **Template:** `/docs/v2/game-template.game.md`

---

## Progress Overview

### Overall Completion: 0%

```
Critical Path:      [░░░░░░░░░░] 0%   (0/11 hours)
Track A - Bugs:     [░░░░░░░░░░] 0%   (0/3 hours)
Track B - Tests:    [░░░░░░░░░░] 0%   (0/3 hours)
Track C - Tools:    [░░░░░░░░░░] 0%   (0/6 hours)
Track D - Docs:     [░░░░░░░░░░] 0%   (0/4 hours)
Track E - Content:  [░░░░░░░░░░] 0%   (0/6 hours)
Track F - UI:       [░░░░░░░░░░] 0%   (0/4 hours)
```

### Milestone Status
- [ ] **Milestone 1:** Critical bugs fixed (Week 1)
- [ ] **Milestone 2:** V2 parser working (Week 1-2)
- [ ] **Milestone 3:** First V2 game playable (Week 2)
- [ ] **Milestone 4:** All tooling complete (Week 3)
- [ ] **Milestone 5:** Production ready (Week 4)

---

## Critical Path (Sequential Dependencies)

**Total:** 8-11 hours | **Status:** Not Started | **Priority:** CRITICAL

These tasks MUST complete in order and block all content creation work.

### ☐ CP-1: V2 Markdown Parser Implementation

**Status:** ❌ Not Started
**Priority:** CRITICAL
**Effort:** 6-8 hours
**Dependencies:** None
**Assignee:** _Unassigned_
**Blocks:** CP-2, all Track C, all Track E

#### Description
Create parser to convert Type-Based Markdown format (`.game.md` files) into game configuration objects that the engine can load.

#### Files to Create
- [ ] `/src/lib/parsers/v2MarkdownParser.js` - Main parser implementation
- [ ] `/src/lib/parsers/v2MarkdownParser.test.js` - Comprehensive test suite

#### Key Functions to Implement

##### 1. Main Parser Function
```javascript
export function parseV2GameFile(markdown: string): GameConfig
```
- Parse frontmatter (YAML between `---` markers)
- Split into sections (Introduction, Card Deck)
- Parse introduction sections (all `## headings`)
- Parse card sections (`### Type` headings with classification)
- Validate card counts (1+4+3+16+28 = 52)
- Assign cards to deck positions
- Build final configuration object

##### 2. Card Section Parser
```javascript
function parseCardSection(section: string): CardDefinition
```
- Parse `### Type: modifiers` header
- Extract type (Primary Success, Failure Counter, Narrative, Challenge, Event)
- Parse optional modifiers (skip-damage, return-king, explicit assignments)
- Extract `**Description**` (bold text)
- Extract story content (everything after description)

##### 3. Card Assignment
```javascript
function assignCardsToDeck(cardsByType: CardsByType): Deck
```
- Primary Success → A♥
- Failure Counters → K♥, K♦, K♣, K♠
- Narrative → A♦, A♣, A♠ (with optional modifiers)
- Challenge → 3, 5, 7, 9 (auto-assign or explicit)
- Event → 2, 4, 6, 8, 10, J, Q (auto-assign or explicit)

##### 4. Validation
```javascript
function validateCardCounts(cardsByType: CardsByType): void
```
- Exactly 1 Primary Success
- Exactly 4 Failure Counters
- Exactly 3 Narrative (including modifier variants)
- Maximum 1 skip-damage modifier
- Maximum 1 return-king modifier
- Exactly 16 Challenge cards
- Exactly 28 Event cards
- No duplicate explicit assignments

#### Success Criteria
- [ ] Parse valid V2 markdown files correctly
- [ ] Validate all card count requirements (1+4+3+16+28 = 52)
- [ ] Handle special modifiers (skip-damage, return-king)
- [ ] Support explicit card assignments (`: 7-hearts` notation)
- [ ] Throw clear, actionable error messages for invalid input
- [ ] 90%+ test coverage

#### Test Cases Required
- [ ] Valid complete game file
- [ ] Invalid card counts (too few/many of each type)
- [ ] Missing required frontmatter fields
- [ ] Missing required sections
- [ ] Duplicate special modifiers
- [ ] Duplicate explicit card assignments
- [ ] Edge cases (empty descriptions, very long stories, special characters)
- [ ] Malformed markdown syntax

#### Documentation References
- **Format Spec:** `/docs/v2/game-config-v2.md` §"Type-Based Markdown Format"
- **Card Types:** `/docs/v2/game-config-v2.md` §"Card Types (Based on Wretched and Alone SRD)"
- **Special Modifiers:** `/docs/v2/game-config-v2.md` §"Special Card Modifiers"
- **Format Details:** `/docs/v2/simplified-type-based-format.md`
- **Example Input:** `/docs/v2/type-based-future-lost.game.md`

#### Implementation Notes
- Use Svelte/SvelteKit compatible JavaScript (ESM modules)
- Consider using `js-yaml` for frontmatter parsing
- Markdown parsing can use simple regex or `marked` library
- Must validate card counts before assignment
- Clear error messages with line numbers if possible

---

### ☐ CP-2: Game Loader Integration

**Status:** ❌ Not Started
**Priority:** CRITICAL
**Effort:** 2-3 hours
**Dependencies:** CP-1 (V2 Parser)
**Assignee:** _Unassigned_
**Blocks:** All Track E (content creation)

#### Description
Integrate V2 parser into game loading system with backward compatibility for V1 games.

#### Files to Create
- [ ] `/src/lib/loaders/gameLoader.js` - Universal game loader

#### Files to Modify
- [ ] `/src/routes/game/[slug]/+page.server.js` - Use new loader
- [ ] `/src/lib/stores/gameInit.js` - Accept V2 format configs
- [ ] `/src/lib/components/DrawCard.svelte` - Display V2 card content (description + story)

#### Key Functions

##### Universal Game Loader
```javascript
export async function loadGame(gameSlug: string): Promise<GameConfig>
```
- Check for V2 format (`.game.md` file) first
- Fall back to V1 format (config.yml + deck.csv + intro.md) if V2 not found
- Return standardized config object regardless of source format
- Log warnings for deprecated V1 format

##### V1 Loader (Backward Compatibility)
```javascript
async function loadV1Game(gameSlug: string): Promise<GameConfig>
```
- Load config.yml, deck.csv, intro.md in parallel
- Parse using existing V1 parsers
- Convert to standardized config format
- Mark with `metadata.format = 'v1-legacy'`

#### Success Criteria
- [ ] V2 games load correctly from `.game.md` files
- [ ] V1 games still work (backward compatibility maintained)
- [ ] Clear error messages for missing files
- [ ] Proper metadata passed through to game state
- [ ] Card descriptions and stories displayed correctly in UI

#### Documentation References
- **Current Init:** `/src/lib/stores/gameInit.js` lines 31-83
- **Format Spec:** `/docs/v2/game-config-v2.md` §"Publishing Workflow"
- **Migration:** `/docs/v2/game-config-v2.md` §"Migration Path from V1"

#### Implementation Notes
- Maintain V1 support for at least 6 months
- Consider caching parsed V2 games for performance
- Ensure proper error handling for network failures
- Update DrawCard component to show both short description and full story

---

## Parallel Track A: Critical Bug Fixes

**Total:** 2-3 hours | **Status:** Not Started | **Priority:** CRITICAL
**Can start:** Immediately | **No dependencies**

These bugs violate the Wretched & Alone SRD and must be fixed for framework compliance.

### ☐ A-1: Fix Ace Classification Bug

**Status:** ❌ Not Started
**Priority:** CRITICAL
**Effort:** 30 minutes
**Dependencies:** None
**Assignee:** _Unassigned_
**Impact:** Game 15-20% easier than intended, violates SRD

#### Description
Aces are currently excluded from odd-rank damage triggers, but per the SRD they ARE odd-ranked and should trigger damage checks.

#### Root Cause
**File:** `/src/lib/stores/gameActions.svelte.js` line 156

**Current Code (WRONG):**
```javascript
const isOdd = card.card !== 'A' && parseInt(card.card) % 2 !== 0;
//            ^^^^^^^^^^^^^^^^^ ❌ EXPLICITLY EXCLUDES ACES
```

**Impact:**
- Framework expects 20 damage-triggering cards (A, 3, 5, 7, 9)
- Implementation has only 16 (3, 5, 7, 9)
- Game significantly easier (Aces provide bonus without risk)
- Violates SRD tension mechanic

#### Fix Required

**Corrected Code:**
```javascript
const oddRanks = ['A', '3', '5', '7', '9'];
const isOdd = oddRanks.includes(card.card);
```

#### Files to Modify
- [ ] `/src/lib/stores/gameActions.svelte.js` line 156 - Apply fix

#### Tests to Update
- [ ] `/src/lib/stores/gameActions.test.js` - Ace damage behavior
- [ ] `/src/lib/stores/gameFlow.test.js` - Game flow with Aces

**OLD TEST (validates wrong behavior):**
```javascript
test('ace of hearts should not trigger damage check', () => {
  expect(gameState.state).toBe('log'); // WRONG
});
```

**NEW TEST (correct behavior):**
```javascript
test('ace of hearts triggers damage check AND adds bonus', () => {
  const card = { card: 'A', suit: 'hearts' };
  drawAndProcessCard(card);

  expect(gameState.state).toBe('failureCheck'); // Triggers damage
  expect(gameState.bonus).toBe(1); // Still adds bonus
  expect(gameState.aceOfHeartsRevealed).toBe(true); // Still activates win
});
```

#### Success Criteria
- [ ] All Aces trigger damage checks
- [ ] Aces still add to bonus counter
- [ ] Ace of Hearts still activates win condition
- [ ] All tests pass with updated behavior
- [ ] Game difficulty increases appropriately

#### Documentation References
- **Bug Report:** `/docs/v2/game-engine-review.md` §5.3 "Card Mechanics & Classification"
- **SRD Spec:** `/docs/v2/wretched-alone-mechanics-guide.md` - Odd/even rank mechanics
- **Card Types:** `/docs/v2/game-config-v2.md` §"Card Types" (Narrative cards ARE odd)
- **Test Evidence:** `/docs/v2/game-engine-review.md` lines 411-421

#### Validation
After fix:
1. Run test suite: `npm test gameActions`
2. Play test game, draw all 4 Aces
3. Verify each Ace triggers damage check
4. Verify bonus counter still increments
5. Verify Ace of Hearts activates win countdown

---

### ☐ A-2: Add Initial Damage Roll

**Status:** ❌ Not Started
**Priority:** CRITICAL
**Effort:** 15 minutes
**Dependencies:** None
**Assignee:** _Unassigned_
**Impact:** Game ~5-15% easier without initial damage

#### Description
Game should start with 48-53 resources (after initial 1d6 damage roll), not 54. This is a V2 SRD digital enhancement.

#### Root Cause
**File:** `/src/lib/stores/gameInit.js` lines 31-83

**Current Code (MISSING):**
```javascript
Object.assign(gameState, {
    tower: 54,  // ❌ NO INITIAL DAMAGE APPLIED
    tokens: finalConfig.options?.startingTokens || 10,
    round: 1,
    deck
});
```

#### Fix Required

**Corrected Code:**
```javascript
// Roll 1d6 for initial damage
const initialDamageRoll = Math.floor(Math.random() * 6) + 1;
const startingTower = 54 - initialDamageRoll;

Object.assign(gameState, {
    tower: startingTower,  // Now 48-53 instead of 54
    tokens: finalConfig.options?.startingTokens || 10,
    round: 1,
    deck
});

// Log initial damage for transparency
gameState.log.push({
    type: 'system',
    message: `Initial setup: Lost ${initialDamageRoll} resources to instability`
});
```

#### Optional: Configuration Override
```javascript
// Allow disabling for easier games or testing
const applyInitialDamage = finalConfig.options?.initialDamage !== false;
const startingTower = applyInitialDamage
  ? 54 - Math.floor(Math.random() * 6) - 1
  : 54;
```

#### Files to Modify
- [ ] `/src/lib/stores/gameInit.js` line 74 - Add initial damage roll

#### Files to Update (Optional)
- [ ] `/src/lib/stores/gameInit.test.js` - Test initial damage range

#### Success Criteria
- [ ] Game starts at 48-53 resources (random)
- [ ] Initial damage logged for player visibility
- [ ] Configuration option available to disable (optional)
- [ ] Tests verify starting range

#### Documentation References
- **Bug Report:** `/docs/v2/game-engine-review.md` §5.1 "Game Setup & Initialization"
- **SRD Spec:** `/docs/v2/wretched-alone-mechanics-guide.md` - Setup phase
- **Impact Analysis:** `/docs/v2/game-engine-review.md` lines 333-372

#### Validation
After fix:
1. Initialize 20 new games
2. Verify all start with tower between 48-53
3. Check game log shows initial damage
4. Verify roughly even distribution of rolls

---

### ☐ A-3: Implement Final Damage Roll

**Status:** ❌ Not Started
**Priority:** CRITICAL
**Effort:** 1.5-2 hours
**Dependencies:** None
**Assignee:** _Unassigned_
**Impact:** Missing SRD signature "victory snatched away" mechanic

#### Description
When all tokens are removed, player should face a final damage roll. Only if they survive this roll do they win. This is the SRD's dramatic tension mechanic.

#### Root Cause
**File:** `/src/lib/stores/gameActions.svelte.js` lines 271-289

**Current Code (INCOMPLETE):**
```javascript
if (gameState.tokens === 0) {
    gameState.win = true;
    transitionTo('gameOver');  // ❌ MISSING FINAL DAMAGE ROLL
}
```

**Expected Flow:**
```
tokens=0 → FINAL DAMAGE ROLL → if resources>0 → WIN else → LOSS
```

**Current Flow:**
```
tokens=0 → WIN (immediate)
```

#### Implementation Steps

##### Step 1: Add Final Damage State to Transition Graph

**File:** `/src/lib/stores/transitions.js`

```javascript
export const transitionGraph = {
  // ... existing states ...
  successCheck: {
    tokensRemaining: 'log',
    allTokensRemoved: 'finalDamageRoll' // NEW TRANSITION
  },
  finalDamageRoll: {  // NEW STATE
    survived: 'gameOver',
    defeated: 'gameOver'
  }
};
```

##### Step 2: Create FinalDamageRoll Component

**File:** `/src/lib/components/FinalDamageRoll.svelte` (NEW)

```svelte
<script>
  import { gameState, performFinalDamageRoll } from '$lib/stores/gameActions.svelte.js';
  import ThreeJSDiceBoxRoller from './ThreeJSDiceBoxRoller.svelte';

  let rolled = false;

  async function handleRoll(result) {
    rolled = true;
    await performFinalDamageRoll(result);
  }
</script>

<div class="final-damage-roll">
  <h2>The Final Test</h2>
  <p>
    You've completed the countdown, but salvation comes with a final risk.
    Roll one last time to see if you truly escape...
  </p>

  <div class="stats">
    <p><strong>Current Resources:</strong> {gameState.tower}</p>
    <p><strong>Bonus Counter:</strong> {gameState.bonus}</p>
    <p><strong>Possible Damage:</strong> 1-6, reduced by bonus</p>
  </div>

  {#if !rolled}
    <ThreeJSDiceBoxRoller onrollcompleted={handleRoll} />
  {:else}
    <p class="suspense">Determining your fate...</p>
  {/if}
</div>

<style>
  .final-damage-roll {
    text-align: center;
    padding: 2rem;
  }

  .stats {
    margin: 1.5rem 0;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
  }

  .suspense {
    font-style: italic;
    animation: pulse 1s infinite;
  }
</style>
```

##### Step 3: Add performFinalDamageRoll Action

**File:** `/src/lib/stores/gameActions.svelte.js` (NEW FUNCTION)

```javascript
/**
 * Perform the final damage roll after all tokens are removed
 * This is the SRD's "salvation with risk" mechanic
 */
export function performFinalDamageRoll(roll) {
  logger.debug('[performFinalDamageRoll] Roll:', roll, 'Bonus:', gameState.bonus, 'Tower:', gameState.tower);

  // Calculate damage (same formula as regular damage checks)
  const damage = Math.max(roll - gameState.bonus, 0);
  gameState.tower -= damage;

  logger.debug(`[performFinalDamageRoll] Damage: ${damage}, Remaining Tower: ${gameState.tower}`);

  // Log the final roll
  gameState.log.push({
    type: 'final-damage',
    roll,
    damage,
    tower: gameState.tower,
    timestamp: Date.now()
  });

  // Determine outcome
  if (gameState.tower > 0) {
    // VICTORY - Survived the final test
    gameState.win = true;
    gameState.gameOver = true;
    gameState.status = 'Victory! Against all odds, you survived.';
    logger.info('[performFinalDamageRoll] VICTORY - Player survived final roll');
    transitionTo('gameOver');
  } else {
    // DEFEAT - Victory snatched away
    gameState.win = false;
    gameState.gameOver = true;
    gameState.status = 'So close... Victory was within reach, but the final test proved too much.';
    logger.info('[performFinalDamageRoll] DEFEAT - Final roll depleted tower');
    transitionTo('gameOver');
  }
}
```

##### Step 4: Update SuccessCheck Function

**File:** `/src/lib/stores/gameActions.svelte.js` - Modify `successCheck()` function

**Current:**
```javascript
if (gameState.tokens === 0) {
    gameState.win = true;
    transitionTo('gameOver');
}
```

**New:**
```javascript
if (gameState.tokens === 0) {
    // Don't immediately win - must face final damage roll first
    logger.debug('[successCheck] All tokens removed, transitioning to final damage roll');
    transitionTo('finalDamageRoll');
    return result;
}
```

##### Step 5: Update GameScreen Component

**File:** `/src/lib/components/GameScreen.svelte`

Add new screen case:
```svelte
{:else if currentScreen == 'finalDamageRoll'}
  <FinalDamageRoll />
```

#### Files to Create
- [ ] `/src/lib/components/FinalDamageRoll.svelte` - Component for final roll UI

#### Files to Modify
- [ ] `/src/lib/stores/transitions.js` - Add finalDamageRoll state
- [ ] `/src/lib/stores/gameActions.svelte.js` - Add performFinalDamageRoll(), update successCheck()
- [ ] `/src/lib/components/GameScreen.svelte` - Add finalDamageRoll screen

#### Tests to Create
- [ ] `/src/lib/stores/gameActions.test.js` - Add final damage roll test suite

**Test Cases:**
```javascript
describe('Final Damage Roll', () => {
  test('should transition to finalDamageRoll when all tokens removed', () => {
    gameState.winConditionActive = true;
    gameState.tokens = 1;
    gameState.tower = 30;

    successCheck(6); // Remove last token

    expect(gameState.state).toBe('finalDamageRoll');
    expect(gameState.win).toBe(false); // Not won yet
  });

  test('should win if tower > 0 after final roll', () => {
    gameState.tower = 10;
    gameState.bonus = 2;

    performFinalDamageRoll(3); // Damage = 3-2 = 1, tower = 9

    expect(gameState.win).toBe(true);
    expect(gameState.tower).toBe(9);
    expect(gameState.gameOver).toBe(true);
  });

  test('should lose if final roll depletes tower', () => {
    gameState.tower = 2;
    gameState.bonus = 0;

    performFinalDamageRoll(5); // Damage = 5, tower = -3

    expect(gameState.win).toBe(false);
    expect(gameState.tower).toBeLessThanOrEqual(0);
    expect(gameState.gameOver).toBe(true);
  });

  test('should apply bonus counter to final roll', () => {
    gameState.tower = 3;
    gameState.bonus = 4;

    performFinalDamageRoll(4); // Damage = 4-4 = 0

    expect(gameState.tower).toBe(3); // No damage taken
    expect(gameState.win).toBe(true);
  });

  test('edge case: exactly lethal damage', () => {
    gameState.tower = 3;
    gameState.bonus = 0;

    performFinalDamageRoll(3); // Damage = 3, tower = 0

    expect(gameState.win).toBe(false); // tower <= 0 means loss
    expect(gameState.tower).toBe(0);
  });
});
```

#### Success Criteria
- [ ] Final roll triggers when all tokens removed
- [ ] Damage calculation uses bonus counter correctly
- [ ] Win only if tower > 0 after roll
- [ ] Loss if tower ≤ 0 after roll
- [ ] Appropriate victory/defeat messages
- [ ] Proper state transition to game over
- [ ] All tests pass

#### Documentation References
- **Bug Report:** `/docs/v2/game-engine-review.md` §5.5 "Win Conditions"
- **SRD Spec:** `/docs/v2/wretched-alone-mechanics-guide.md` - Salvation mechanics
- **Missing Mechanic:** `/docs/v2/game-engine-review.md` lines 450-512
- **Current Implementation:** `/src/lib/stores/gameActions.svelte.js` lines 271-289

#### Validation
After implementation:
1. Play through game to token countdown = 0
2. Verify final damage roll screen appears
3. Roll with high resources (should win)
4. Roll with low resources (might lose)
5. Verify bonus counter reduces damage
6. Test edge case: exactly lethal damage
7. Check all log entries created correctly

---

## Parallel Track B: Test Suite Updates

**Total:** 2-3 hours | **Status:** Not Started | **Priority:** HIGH
**Can start:** After Track A completes | **Dependencies:** Track A bug fixes

### ☐ B-1: Update Ace Classification Tests

**Status:** ❌ Not Started
**Priority:** HIGH
**Effort:** 30 minutes
**Dependencies:** A-1 (Ace bug fix)
**Assignee:** _Unassigned_

#### Description
Update all tests that currently validate the WRONG Ace behavior to expect correct SRD-compliant behavior.

#### Files to Modify
- [ ] `/src/lib/stores/gameActions.test.js` - Ace damage behavior tests
- [ ] `/src/lib/stores/gameFlow.test.js` - Game flow with Ace cards

#### Tests to Fix

**All Aces (A♥, A♦, A♣, A♠):**
- Remove assertions that Aces skip damage checks
- Add assertions that Aces trigger failureCheck state
- Verify Aces still add to bonus counter
- Verify Ace of Hearts still activates win condition

**Example Updates:**

```javascript
// BEFORE (validates wrong behavior)
test('ace of hearts - should go to log without damage check', async () => {
  const card = { card: 'A', suit: 'hearts' };
  drawAndProcessCard(card);
  expect(gameState.state).toBe('log'); // WRONG
});

// AFTER (validates correct behavior)
test('ace of hearts - triggers damage AND adds bonus AND activates win', async () => {
  const card = { card: 'A', suit: 'hearts' };
  drawAndProcessCard(card);

  expect(gameState.state).toBe('failureCheck'); // Triggers damage (odd rank)
  expect(gameState.bonus).toBe(1); // Still adds bonus
  expect(gameState.aceOfHeartsRevealed).toBe(true); // Still activates win
});

test('ace of diamonds - triggers damage AND adds bonus', async () => {
  const card = { card: 'A', suit: 'diamonds' };
  drawAndProcessCard(card);

  expect(gameState.state).toBe('failureCheck');
  expect(gameState.bonus).toBe(1);
});

// Similar updates for A♣ and A♠
```

#### Success Criteria
- [ ] All Ace tests expect damage check state
- [ ] All Ace tests verify bonus increment
- [ ] Ace of Hearts test verifies win condition activation
- [ ] All tests pass after A-1 fix applied
- [ ] Test coverage maintained at 85%+

#### Documentation References
- **Wrong Tests:** `/docs/v2/game-engine-review.md` §6.2 "Tests Validating Incorrect Behavior"
- **Correct Behavior:** `/docs/v2/wretched-alone-mechanics-guide.md` - Odd rank mechanics

---

### ☐ B-2: Add Final Damage Roll Tests

**Status:** ❌ Not Started
**Priority:** HIGH
**Effort:** 45 minutes
**Dependencies:** A-3 (Final damage roll implementation)
**Assignee:** _Unassigned_

#### Description
Create comprehensive test suite for final damage roll mechanic.

#### Files to Modify
- [ ] `/src/lib/stores/gameActions.test.js` - Add new test suite

#### Test Suite
See detailed test cases in A-3 above.

#### Success Criteria
- [ ] Test transition to final damage roll
- [ ] Test victory scenario (tower > 0)
- [ ] Test defeat scenario (tower ≤ 0)
- [ ] Test bonus counter application
- [ ] Test edge cases (exactly lethal, high bonus)
- [ ] All tests pass
- [ ] Test coverage for new code at 90%+

---

### ☐ B-3: Add Card Type Distribution Tests

**Status:** ❌ Not Started
**Priority:** MEDIUM
**Effort:** 30 minutes
**Dependencies:** None
**Assignee:** _Unassigned_

#### Description
Verify standard deck has correct V2 card type distribution.

#### Files to Modify
- [ ] `/src/lib/stores/gameStore.test.js` - Add new test suite

#### Test Cases

```javascript
describe('V2 Card Type Distribution', () => {
  test('should have exactly 1 Primary Success (A♥)', () => {
    const deck = createStandardDeck();
    const primarySuccess = deck.filter(
      c => c.card === 'A' && c.suit === 'hearts'
    );
    expect(primarySuccess).toHaveLength(1);
  });

  test('should have exactly 4 Failure Counters (K♥,K♦,K♣,K♠)', () => {
    const deck = createStandardDeck();
    const kings = deck.filter(c => c.card === 'K');
    expect(kings).toHaveLength(4);

    // Verify all suits present
    const suits = kings.map(k => k.suit).sort();
    expect(suits).toEqual(['clubs', 'diamonds', 'hearts', 'spades']);
  });

  test('should have exactly 3 Narrative cards (A♦,A♣,A♠)', () => {
    const deck = createStandardDeck();
    const narratives = deck.filter(
      c => c.card === 'A' && c.suit !== 'hearts'
    );
    expect(narratives).toHaveLength(3);
  });

  test('should have exactly 16 Challenge cards (3,5,7,9 × 4 suits)', () => {
    const deck = createStandardDeck();
    const challenges = deck.filter(
      c => ['3', '5', '7', '9'].includes(c.card)
    );
    expect(challenges).toHaveLength(16);

    // Verify distribution: 4 of each rank
    ['3', '5', '7', '9'].forEach(rank => {
      const count = challenges.filter(c => c.card === rank).length;
      expect(count).toBe(4); // One per suit
    });
  });

  test('should have exactly 28 Event cards (2,4,6,8,10,J,Q × 4 suits)', () => {
    const deck = createStandardDeck();
    const events = deck.filter(
      c => ['2', '4', '6', '8', '10', 'J', 'Q'].includes(c.card)
    );
    expect(events).toHaveLength(28);

    // Verify distribution: 4 of each rank
    ['2', '4', '6', '8', '10', 'J', 'Q'].forEach(rank => {
      const count = events.filter(c => c.card === rank).length;
      expect(count).toBe(4); // One per suit
    });
  });

  test('should have exactly 20 damage-triggering cards (A,3,5,7,9)', () => {
    const deck = createStandardDeck();
    const damageCards = deck.filter(
      c => ['A', '3', '5', '7', '9'].includes(c.card)
    );
    expect(damageCards).toHaveLength(20);
  });

  test('should have exactly 32 safe cards (2,4,6,8,10,J,Q,K)', () => {
    const deck = createStandardDeck();
    const safeCards = deck.filter(
      c => ['2', '4', '6', '8', '10', 'J', 'Q', 'K'].includes(c.card)
    );
    expect(safeCards).toHaveLength(32);
  });

  test('total deck should be exactly 52 cards', () => {
    const deck = createStandardDeck();
    expect(deck).toHaveLength(52);
  });
});
```

#### Success Criteria
- [ ] All card count tests pass
- [ ] Distribution by suit verified
- [ ] Odd/even classification verified
- [ ] Total equals 52 cards

#### Documentation References
- **Card Types:** `/docs/v2/game-config-v2.md` §"Card Types (Based on Wretched and Alone SRD)"
- **Missing Tests:** `/docs/v2/game-engine-review.md` §6.3 "Missing Test Suites"

---

## Parallel Track C: V2 Tooling

**Total:** 4-6 hours | **Status:** Not Started | **Priority:** HIGH
**Can start:** After CP-1 completes | **Dependencies:** Critical Path

### ☐ C-1: Validation CLI Tool

**Status:** ❌ Not Started
**Priority:** HIGH
**Effort:** 1-1.5 hours
**Dependencies:** CP-1 (V2 Parser)
**Assignee:** _Unassigned_

#### Description
Create command-line tool to validate `.game.md` files before testing in the engine.

#### Files to Create
- [ ] `/tools/validate-game.js` - CLI validation tool
- [ ] `/tools/validate-game.test.js` - Tests for validator

#### Implementation

```javascript
#!/usr/bin/env node
// /tools/validate-game.js

import { parseV2GameFile } from '../src/lib/parsers/v2MarkdownParser.js';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk'; // For colored output (optional)

const filePath = process.argv[2];

if (!filePath) {
  console.error(chalk.red('❌ Error: No file specified'));
  console.log('Usage: npm run validate-game <path-to-game.md>');
  process.exit(1);
}

// Check file exists
if (!fs.existsSync(filePath)) {
  console.error(chalk.red(`❌ Error: File not found: ${filePath}`));
  process.exit(1);
}

// Check file extension
if (!filePath.endsWith('.game.md')) {
  console.warn(chalk.yellow('⚠️  Warning: File does not have .game.md extension'));
}

try {
  console.log(chalk.blue('🔍 Validating game file...\n'));

  const markdown = fs.readFileSync(filePath, 'utf-8');
  const gameConfig = parseV2GameFile(markdown);

  console.log(chalk.green('✅ Validation passed!\n'));

  // Display game info
  console.log(chalk.bold('Game Information:'));
  console.log(`  Title:    ${gameConfig.title}`);
  console.log(`  Subtitle: ${gameConfig.subtitle || '(none)'}`);
  console.log(`  Format:   ${gameConfig.metadata.format} v${gameConfig.metadata.version}\n`);

  // Display card distribution
  console.log(chalk.bold('Card Distribution:'));
  const distribution = analyzeDistribution(gameConfig.deck);

  console.log(`  Primary Success:   ${distribution['primary-success']} / 1`);
  console.log(`  Failure Counters:  ${distribution['failure-counter']} / 4`);
  console.log(`  Narrative:         ${distribution['narrative']} / 3`);
  console.log(`  Challenge:         ${distribution['challenge']} / 16`);
  console.log(`  Event:             ${distribution['event']} / 28`);
  console.log(chalk.bold(`  Total:             ${gameConfig.deck.length} / 52\n`));

  // Check for special modifiers
  const modifiers = findModifiers(gameConfig.deck);
  if (modifiers.length > 0) {
    console.log(chalk.bold('Special Modifiers:'));
    modifiers.forEach(mod => {
      console.log(`  ${mod.card} - ${mod.modifier}`);
    });
    console.log();
  }

  console.log(chalk.green('✨ Game is ready to play!'));

} catch (error) {
  console.error(chalk.red('❌ Validation failed:\n'));
  console.error(error.message);

  if (error.errors) {
    console.log(chalk.red('\nErrors found:'));
    error.errors.forEach(err => {
      console.log(chalk.red(`  • ${err}`));
    });
  }

  process.exit(1);
}

function analyzeDistribution(deck) {
  const dist = {
    'primary-success': 0,
    'failure-counter': 0,
    'narrative': 0,
    'challenge': 0,
    'event': 0
  };

  deck.forEach(card => {
    if (card.type) {
      dist[card.type]++;
    }
  });

  return dist;
}

function findModifiers(deck) {
  return deck
    .filter(card => card.modifier)
    .map(card => ({
      card: `${card.card}${card.suit}`,
      modifier: card.modifier
    }));
}
```

#### Package.json Script

```json
{
  "scripts": {
    "validate-game": "node tools/validate-game.js"
  }
}
```

#### Usage Examples

```bash
# Validate a game file
npm run validate-game static/games/future-lost.game.md

# Validate during development
npm run validate-game docs/v2/type-based-future-lost.game.md
```

#### Success Criteria
- [ ] Validates correct V2 markdown files
- [ ] Shows clear error messages for validation failures
- [ ] Displays card distribution summary
- [ ] Shows special modifiers if present
- [ ] Exits with proper error codes (0 = success, 1 = failure)
- [ ] Colorized output for better readability (optional)

#### Documentation References
- **Format Spec:** `/docs/v2/game-config-v2.md` §"Smart Validation"
- **Validation Rules:** `/docs/v2/simplified-type-based-format.md`

---

### ☐ C-2: V1→V2 Conversion Tool

**Status:** ❌ Not Started
**Priority:** HIGH
**Effort:** 2-3 hours
**Dependencies:** CP-1 (V2 Parser)
**Assignee:** _Unassigned_

#### Description
Automatically convert existing V1 games (YAML + CSV + MD) to V2 format (single .game.md).

#### Files to Create
- [ ] `/tools/convert-v1-to-v2.js` - Conversion CLI tool
- [ ] `/tools/convert-v1-to-v2.test.js` - Tests for converter

#### Implementation

```javascript
#!/usr/bin/env node
// /tools/convert-v1-to-v2.js

import yaml from 'yaml';
import fs from 'fs';
import path from 'path';
import { parse as parseCSV } from 'csv-parse/sync';

const gameSlug = process.argv[2];

if (!gameSlug) {
  console.error('❌ Error: No game slug specified');
  console.log('Usage: npm run convert-v1-to-v2 <game-slug>');
  console.log('Example: npm run convert-v1-to-v2 future-lost');
  process.exit(1);
}

const gamePath = `static/games/${gameSlug}`;

// Check if V1 game exists
if (!fs.existsSync(gamePath)) {
  console.error(`❌ Error: V1 game not found at ${gamePath}`);
  process.exit(1);
}

console.log(`🔄 Converting ${gameSlug} from V1 to V2 format...\n`);

try {
  // Read V1 files
  const configPath = `${gamePath}/config.yml`;
  const deckPath = `${gamePath}/deck.csv`;
  const introPath = `${gamePath}/intro.md`;

  const config = yaml.parse(fs.readFileSync(configPath, 'utf-8'));
  const deckCSV = fs.readFileSync(deckPath, 'utf-8');
  const intro = fs.readFileSync(introPath, 'utf-8');

  // Parse CSV
  const deckRows = parseCSV(deckCSV, { columns: true });

  // Build V2 markdown
  const v2Markdown = buildV2Markdown(config, deckRows, intro);

  // Write output
  const outputPath = `static/games/${gameSlug}.game.md`;
  fs.writeFileSync(outputPath, v2Markdown);

  console.log(`✅ Successfully converted to V2 format`);
  console.log(`   Output: ${outputPath}\n`);
  console.log('⚠️  Important: Review the output file and:');
  console.log('   1. Verify card assignments are correct');
  console.log('   2. Consider adding longer card descriptions');
  console.log('   3. Optionally add skip-damage or return-king modifiers');
  console.log(`   4. Validate: npm run validate-game ${outputPath}\n`);

} catch (error) {
  console.error('❌ Conversion failed:');
  console.error(error.message);
  process.exit(1);
}

function buildV2Markdown(config, deckRows, intro) {
  // Categorize cards by V2 types
  const cardsByType = categorizeCards(deckRows);

  // Build frontmatter
  const frontmatter = `---
title: ${config.title}
subtitle: ${config.subtitle || ''}
win-message: ${config['win-message'] || config.winMessage}
lose-message: ${config['lose-message'] || config.loseMessage}
---`;

  // Introduction (use existing intro.md content)
  const introduction = intro.startsWith('# Introduction')
    ? intro
    : `# Introduction\n\n${intro}`;

  // Build card sections
  const cardSections = buildCardSections(cardsByType);

  return `${frontmatter}

${introduction}

---

# Card Deck

${cardSections}
`;
}

function categorizeCards(deckRows) {
  const types = {
    'primary-success': [],
    'failure-counter': [],
    'narrative': [],
    'challenge': [],
    'event': []
  };

  deckRows.forEach(row => {
    const rank = row.card || row.rank;
    const suit = row.suit;
    const description = row.description || row.prompt;

    // Determine type based on card
    if (rank === 'A' && suit === 'hearts') {
      types['primary-success'].push({ rank, suit, description });
    } else if (rank === 'K') {
      types['failure-counter'].push({ rank, suit, description });
    } else if (rank === 'A') {
      types['narrative'].push({ rank, suit, description });
    } else if (['3', '5', '7', '9'].includes(rank)) {
      types['challenge'].push({ rank, suit, description });
    } else {
      types['event'].push({ rank, suit, description });
    }
  });

  return types;
}

function buildCardSections(cardsByType) {
  let sections = [];

  // Primary Success
  if (cardsByType['primary-success'].length > 0) {
    sections.push(`## Primary Success\n\n**${cardsByType['primary-success'][0].description}**\n\n---`);
  }

  // Failure Counters
  cardsByType['failure-counter'].forEach(card => {
    sections.push(`## Failure Counter\n\n**${card.description}**\n\n---`);
  });

  // Narrative (suggest modifiers in comments)
  cardsByType['narrative'].forEach((card, i) => {
    if (i === 0) {
      sections.push(`## Narrative: skip-damage\n<!-- Consider using skip-damage modifier for this card -->\n\n**${card.description}**\n\n---`);
    } else if (i === 1) {
      sections.push(`## Narrative: return-king\n<!-- Consider using return-king modifier for this card -->\n\n**${card.description}**\n\n---`);
    } else {
      sections.push(`## Narrative\n\n**${card.description}**\n\n---`);
    }
  });

  // Challenge
  cardsByType['challenge'].forEach(card => {
    sections.push(`## Challenge\n\n**${card.description}**\n\n---`);
  });

  // Event
  cardsByType['event'].forEach(card => {
    sections.push(`## Event\n\n**${card.description}**\n\n---`);
  });

  return sections.join('\n\n');
}
```

#### Package.json Script

```json
{
  "scripts": {
    "convert-v1-to-v2": "node tools/convert-v1-to-v2.js"
  }
}
```

#### Usage

```bash
# Convert existing game
npm run convert-v1-to-v2 future-lost

# Output: static/games/future-lost.game.md
```

#### Success Criteria
- [ ] Reads V1 config.yml, deck.csv, intro.md
- [ ] Maps all cards to correct V2 types
- [ ] Preserves all descriptions
- [ ] Suggests special modifiers in comments
- [ ] Outputs valid `.game.md` file
- [ ] File passes validation tool

#### Documentation References
- **Migration Path:** `/docs/v2/game-config-v2.md` §"Migration Path from V1"
- **Conversion Process:** `/docs/v2/game-config-v2.md` §"Automatic Conversion Tool"

---

### ☐ C-3: Template Generator

**Status:** ❌ Not Started
**Priority:** MEDIUM
**Effort:** 1-1.5 hours
**Dependencies:** CP-1 (V2 Parser)
**Assignee:** _Unassigned_

#### Description
Interactive tool to create new game template from scratch.

#### Files to Create
- [ ] `/tools/create-game.js` - Template generator CLI

#### Implementation

```javascript
#!/usr/bin/env node
// /tools/create-game.js

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function prompt(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

(async () => {
  console.log('🎲 DC Solo RPG Game Creator\n');
  console.log('This tool will create a new game template for you.\n');

  const title = await prompt('Game Title: ');
  const subtitle = await prompt('Subtitle (optional): ');
  const winMessage = await prompt('Win Message: ');
  const loseMessage = await prompt('Lose Message: ');

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  console.log(`\nGame slug: ${slug}`);

  // Load template
  const templatePath = 'docs/v2/game-template.game.md';
  let template = fs.readFileSync(templatePath, 'utf-8');

  // Replace placeholders
  template = template.replace('Your Game Title Here', title);
  template = template.replace('A Wretched & Alone Solo Journaling Game', subtitle || 'A Solo RPG Experience');
  template = template.replace(/win-message: .+/, `win-message: ${winMessage}`);
  template = template.replace(/lose-message: .+/, `lose-message: ${loseMessage}`);

  // Write output
  const outputPath = `static/games/${slug}.game.md`;
  fs.writeFileSync(outputPath, template);

  console.log(`\n✅ Created game template: ${outputPath}\n`);
  console.log('📝 Next steps:');
  console.log('   1. Edit the template with your narrative');
  console.log('   2. Write all 52 cards:');
  console.log('      - 1 Primary Success (Ace of Hearts)');
  console.log('      - 4 Failure Counters (Kings)');
  console.log('      - 3 Narrative cards (other Aces, can add modifiers)');
  console.log('      - 16 Challenge cards (3,5,7,9 - trigger damage)');
  console.log('      - 28 Event cards (2,4,6,8,10,J,Q - safe)');
  console.log(`   3. Validate: npm run validate-game ${outputPath}`);
  console.log('   4. Test in game engine\n');

  rl.close();
})();
```

#### Package.json Script

```json
{
  "scripts": {
    "create-game": "node tools/create-game.js"
  }
}
```

#### Success Criteria
- [ ] Interactive prompts for basic info
- [ ] Generates valid template from base template
- [ ] Creates properly named file
- [ ] Provides clear next steps

---

## Parallel Track D: Documentation

**Total:** 3-4 hours | **Status:** Not Started | **Priority:** HIGH
**Can start:** Immediately | **No dependencies**

### ☐ D-1: Creator Guide for V2 Format

**Status:** ❌ Not Started
**Priority:** HIGH
**Effort:** 1-1.5 hours
**Dependencies:** None (can reference existing docs)
**Assignee:** _Unassigned_

#### Description
Comprehensive guide for game creators using the V2 format.

#### File to Create
- [ ] `/docs/creator-guide.md`

#### Outline

```markdown
# DC Solo RPG Creator Guide (V2 Format)

## Table of Contents
1. Introduction to V2 Format
2. Understanding Card Types
3. Creating Your First Game
4. Writing Effective Cards
5. Special Modifiers
6. Testing & Validation
7. Publishing Your Game
8. Advanced Techniques

## 1. Introduction to V2 Format

### What is V2?
The Type-Based Markdown Format simplifies game creation...

### Benefits
- Single .game.md file (no YAML, CSV)
- Focus on card purpose, not deck mechanics
- Rich storytelling with Markdown support
- Easy validation and testing

## 2. Understanding Card Types

### The Five Card Types

#### Primary Success (1 card - Ace of Hearts)
- Activates the salvation countdown
- Still triggers damage (it's an odd rank!)
- Your "hope" card

#### Failure Counter (4 cards - All Kings)
- Escalating threat
- 4 revealed = instant game over
- Create sense of doom

#### Narrative (3 cards - A♦, A♣, A♠)
- Bonus/help cards
- Add to bonus counter (reduces damage)
- Can have special modifiers
- Still trigger damage (odd rank)

#### Challenge (16 cards - 3,5,7,9)
- Trigger damage checks
- Create tension and resource drain
- Should feel dangerous

#### Event (28 cards - 2,4,6,8,10,J,Q)
- Safe from damage
- Story moments, discoveries
- Breathing room for player

## 3. Creating Your First Game

### Step 1: Use the Template Generator
```bash
npm run create-game
```

### Step 2: Edit Frontmatter
... detailed instructions ...

### Step 3: Write Introduction
... examples and tips ...

### Step 4: Write Card Content
... card writing guide ...

## 4. Writing Effective Cards

### Card Anatomy
- **Short Description** (1 sentence) - shown in log
- **Full Story** (optional) - shown when drawn

### Tips for Each Type
... specific guidance ...

### Progressive Rule Teaching
... SRD principle ...

## 5. Special Modifiers

### skip-damage Modifier
... usage guide ...

### return-king Modifier
... usage guide ...

## 6. Testing & Validation

### Validation Tool
```bash
npm run validate-game static/games/your-game.game.md
```

### Common Errors
... troubleshooting ...

## 7. Publishing Your Game

### Option 1: Direct Upload
### Option 2: Repository-Based
### Option 3: CLI Tool

## 8. Advanced Techniques

### Thematic Suit Matching
### Explicit Card Assignments
### Future: Custom Actions
```

#### Success Criteria
- [ ] Clear explanations of all concepts
- [ ] Practical examples for each card type
- [ ] Troubleshooting section
- [ ] Links to all relevant resources

#### References
- **Format Spec:** `/docs/v2/game-config-v2.md`
- **SRD Mechanics:** `/docs/v2/wretched-alone-mechanics-guide.md`
- **Template:** `/docs/v2/game-template.game.md`
- **Example:** `/docs/v2/type-based-future-lost.game.md`

---

### ☐ D-2: Migration Guide

**Status:** ❌ Not Started
**Priority:** MEDIUM
**Effort:** 1 hour
**Dependencies:** C-2 (Conversion tool)
**Assignee:** _Unassigned_

#### Description
Step-by-step guide for migrating existing V1 games to V2.

#### File to Create
- [ ] `/docs/migration-guide.md`

#### Outline

```markdown
# V1 to V2 Migration Guide

## Why Migrate?
- Simplified workflow
- Better content organization
- Rich storytelling features
- Future-proof format

## What Changes?

### Files
- Before: config.yml + deck.csv + intro.md + (optional CSS)
- After: single .game.md file

### Card Organization
- Before: List all 52 cards with identifiers
- After: Group by type, auto-assignment

## Automatic Conversion

### Step 1: Run Converter
```bash
npm run convert-v1-to-v2 your-game-slug
```

### Step 2: Review Output
... checklist ...

### Step 3: Enhance Content
... suggestions ...

### Step 4: Validate
```bash
npm run validate-game static/games/your-game.game.md
```

## Manual Review Checklist
- [ ] All cards present (52 total)
- [ ] Card types correctly assigned
- [ ] Descriptions preserved
- [ ] Introduction sections complete
- [ ] Win/lose messages correct

## Common Migration Scenarios
... examples ...

## Backward Compatibility Timeline
- Months 1-3: Both V1 and V2 supported
- Months 4-6: V1 deprecated, conversion required
- Month 7+: V1 removed

## Troubleshooting
... common issues and solutions ...
```

#### Success Criteria
- [ ] Clear timeline for V1 deprecation
- [ ] Step-by-step conversion process
- [ ] Review checklist provided
- [ ] Troubleshooting section

---

### ☐ D-3: API Documentation

**Status:** ❌ Not Started
**Priority:** LOW
**Effort:** 1-1.5 hours
**Dependencies:** CP-1 (V2 Parser)
**Assignee:** _Unassigned_

#### Description
Technical documentation for parser API and extension points.

#### File to Create
- [ ] `/docs/api/v2-parser.md`

#### Outline

```markdown
# V2 Parser API Documentation

## parseV2GameFile()

### Signature
```typescript
function parseV2GameFile(markdown: string): GameConfig
```

### Parameters
- `markdown` (string): Raw markdown content of .game.md file

### Returns
GameConfig object:
```typescript
interface GameConfig {
  title: string;
  subtitle?: string;
  'win-message': string;
  'lose-message': string;
  introduction: IntroSection[];
  deck: Card[];
  metadata: {
    format: 'v2-type-based';
    version: string;
  };
}
```

### Throws
- `ValidationError` - Card counts incorrect, missing required fields
- `ParseError` - Malformed markdown syntax

## Configuration Object Schema

### Card Object
```typescript
interface Card {
  card: string;      // 'A', '2'-'10', 'J', 'Q', 'K'
  suit: string;      // 'hearts', 'diamonds', 'clubs', 'spades'
  type: CardType;
  modifier?: string; // 'skip-damage' | 'return-king'
  description: string;
  story?: string;
}
```

### Card Types
```typescript
type CardType =
  | 'primary-success'  // A♥ - Win condition
  | 'failure-counter'  // K♥,K♦,K♣,K♠ - Loss tracking
  | 'narrative'        // A♦,A♣,A♠ - Bonus cards
  | 'challenge'        // 3,5,7,9 - Damage triggers
  | 'event';           // 2,4,6,8,10,J,Q - Safe cards
```

## Extension Points

### Custom Modifiers
Future support for custom modifiers...

### Custom Validators
How to add validation rules...

## Error Handling

### ValidationError
```typescript
class ValidationError extends Error {
  errors: string[];
}
```

### Example
```javascript
try {
  const config = parseV2GameFile(markdown);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation failed:');
    error.errors.forEach(err => console.error(`  - ${err}`));
  }
}
```
```

#### Success Criteria
- [ ] Complete API reference
- [ ] TypeScript types documented
- [ ] Error handling explained
- [ ] Extension points described

---

## Parallel Track E: Content Creation

**Total:** 4-6 hours | **Status:** Not Started | **Priority:** HIGH
**Can start:** After CP-1 completes | **Dependencies:** Critical Path

### ☐ E-1: Convert Existing Game to V2

**Status:** ❌ Not Started
**Priority:** HIGH
**Effort:** 1-2 hours
**Dependencies:** CP-1 (V2 Parser), C-2 (Conversion tool)
**Assignee:** _Unassigned_

#### Description
Convert the existing game to V2 format as first real-world validation.

#### Steps

1. **Run Conversion Tool**
```bash
npm run convert-v1-to-v2 future-lost
```

2. **Manual Review**
- [ ] Check all 52 cards present
- [ ] Verify card type assignments
- [ ] Ensure descriptions preserved

3. **Content Enhancement**
- [ ] Add longer stories to key cards (Primary Success, Kings)
- [ ] Assign skip-damage modifier to one Narrative card
- [ ] Assign return-king modifier to another Narrative card
- [ ] Add thematic suit matching if desired

4. **Validation**
```bash
npm run validate-game static/games/future-lost.game.md
```

5. **Testing**
- [ ] Load in game engine
- [ ] Play through complete game
- [ ] Test all card types display correctly
- [ ] Verify special modifiers work (if implemented in engine)

#### Files
- [ ] `/static/games/future-lost.game.md` - Converted and enhanced

#### Success Criteria
- [ ] Passes validation tool
- [ ] Loads in game engine
- [ ] All cards display correctly
- [ ] Enhanced with longer descriptions
- [ ] Special modifiers assigned

#### Documentation References
- **Example Game:** `/docs/v2/type-based-future-lost.game.md`
- **Current V1:** `/static/games/future-lost/` (if exists)

---

### ☐ E-2: Create Second Reference Game

**Status:** ❌ Not Started
**Priority:** MEDIUM
**Effort:** 2-3 hours
**Dependencies:** CP-1 (V2 Parser)
**Assignee:** _Unassigned_

#### Description
Create brand new game in V2 format to demonstrate different theme and showcase all features.

#### Process

1. **Use Template Generator**
```bash
npm run create-game
```
Enter details for new game theme.

2. **Write Game Content**
- [ ] Compelling introduction (Who You Are, What Happened, Your Goal)
- [ ] 1 Primary Success card (Ace of Hearts) - dramatic win condition
- [ ] 4 Failure Counter cards (Kings) - escalating threats
- [ ] 3 Narrative cards (other Aces) - reflection moments
  - [ ] One with skip-damage modifier
  - [ ] One with return-king modifier
  - [ ] One standard
- [ ] 16 Challenge cards (3,5,7,9) - dangerous situations
- [ ] 28 Event cards (2,4,6,8,10,J,Q) - discoveries, safe moments

3. **Thematic Consistency**
- [ ] All cards fit the narrative theme
- [ ] Progressive difficulty/tension
- [ ] SRD principle: teach rules through play

4. **Validation & Testing**
```bash
npm run validate-game static/games/[new-game].game.md
```

#### Suggested Themes
- Space exploration disaster
- Underground survival
- Time loop mystery
- Post-apocalyptic journey
- Haunted location escape

#### Success Criteria
- [ ] Complete 52-card game
- [ ] Passes validation
- [ ] Loads and plays in engine
- [ ] Demonstrates all V2 features
- [ ] Different theme from Future Lost

---

## Parallel Track F: UI Enhancements (Optional)

**Total:** 3-4 hours | **Status:** Not Started | **Priority:** LOW
**Can start:** After parser (for special modifiers) | **Optional**

### ☐ F-1: Special Modifier UI Components

**Status:** ❌ Not Started
**Priority:** LOW
**Effort:** 2-3 hours
**Dependencies:** CP-1 (V2 Parser with modifier support)
**Assignee:** _Unassigned_

#### Description
Visual indicators and activation UI for special modifiers.

#### Files to Create
- [ ] `/src/lib/components/SpecialModifierCard.svelte` - Enhanced card display

#### Features

##### Visual Indicators
- Badge/icon for skip-damage cards
- Badge/icon for return-king cards
- Highlight when modifier is available
- Grayed out when modifier used

##### Activation UI
- Button to activate skip-damage (when about to fail check)
- Button to activate return-king (when King drawn)
- Confirmation dialog for one-time use
- State tracking for modifier usage

#### State Management

Add to gameState:
```javascript
specialModifiers: {
  skipDamageAvailable: false,
  skipDamageUsed: false,
  returnKingAvailable: false,
  returnKingUsed: false
}
```

#### Success Criteria
- [ ] Modifiers visually distinct
- [ ] Clear activation workflow
- [ ] One-time use enforced
- [ ] State persists through game
- [ ] Works with V2 loaded games

---

### ☐ F-2: Enhanced Game Over Messaging

**Status:** ❌ Not Started
**Priority:** LOW
**Effort:** 1 hour
**Dependencies:** A-3 (Final damage roll)
**Assignee:** _Unassigned_

#### Description
Differentiate game over scenarios and show statistics.

#### File to Modify
- [ ] `/src/lib/components/GameOver.svelte`

#### Enhancements

##### Defeat Scenarios
- Final damage roll failure (specific message)
- Resource depletion during play
- 4 Kings revealed

##### Statistics Display
- Days survived
- Cards drawn
- Damage taken
- Bonus accumulated
- Special modifiers used

##### Replay Encouragement
- "Try different strategies"
- "Every playthrough is unique"
- Highlight choices that mattered

#### Success Criteria
- [ ] Different messages for different losses
- [ ] Statistics displayed
- [ ] Encouraging replay messaging

---

## Migration Strategy & Timeline

### Phase 1: Foundation (Week 1)
**Goal:** Working V2 parser + critical bugs fixed
**Effort:** 12-16 hours
**Parallel Execution:** Critical Path + Track A + Track D-1

- [ ] CP-1: V2 Markdown Parser (6-8 hrs)
- [ ] CP-2: Game Loader Integration (2-3 hrs)
- [ ] A-1: Fix Ace classification (30 min)
- [ ] A-2: Add initial damage roll (15 min)
- [ ] A-3: Implement final damage roll (1.5-2 hrs)
- [ ] D-1: Creator guide (1-1.5 hrs)

**Deliverable:** V2 games can be loaded, all SRD bugs fixed

---

### Phase 2: Validation (Week 2)
**Goal:** Complete tooling + test coverage + first V2 game
**Effort:** 8-12 hours
**Parallel Execution:** Tracks B + C + E-1

- [ ] B-1: Update Ace tests (30 min)
- [ ] B-2: Add final damage tests (45 min)
- [ ] B-3: Add card type tests (30 min)
- [ ] C-1: Validation tool (1-1.5 hrs)
- [ ] C-2: Conversion tool (2-3 hrs)
- [ ] C-3: Template generator (1-1.5 hrs)
- [ ] E-1: Convert existing game (1-2 hrs)

**Deliverable:** Full toolchain working, first V2 game playable

---

### Phase 3: Content & Polish (Week 3)
**Goal:** Production-ready system with multiple games
**Effort:** 7-10 hours
**Parallel Execution:** Tracks D-2, D-3, E-2, F (optional)

- [ ] E-2: Create second game (2-3 hrs)
- [ ] D-2: Migration guide (1 hr)
- [ ] D-3: API documentation (1-1.5 hrs)
- [ ] F-1: Special modifier UI (optional, 2-3 hrs)
- [ ] F-2: Enhanced game over (optional, 1 hr)

**Deliverable:** Production-ready, 2+ V2 games, complete docs

---

### Backward Compatibility Timeline

#### Months 1-3: Dual Support
- V2 recommended, V1 fully supported
- No breaking changes
- Conversion tool available

#### Months 4-6: V1 Deprecated
- Warning messages for V1 games
- Conversion strongly encouraged
- V1 loader still works

#### Month 7+: V2 Only
- V1 loader removed
- V2 required for all games
- Old games must be converted

### Implementation
Game loader maintains dual support:
```javascript
export async function loadGame(gameSlug) {
  // Try V2 first
  try {
    return await loadV2Game(gameSlug);
  } catch (e) {
    logger.warn(`V2 load failed for ${gameSlug}, trying V1`);
  }

  // Fallback to V1
  try {
    return await loadV1Game(gameSlug);
  } catch (e) {
    throw new Error(`Failed to load ${gameSlug} in any format`);
  }
}
```

---

## Risk Assessment & Mitigation

### Risk 1: Breaking Changes to Game Loading
**Severity:** HIGH | **Probability:** MEDIUM

**Description:** V2 parser or loader changes break existing games

**Mitigation:**
- [ ] Maintain V1 loader alongside V2
- [ ] Comprehensive test coverage (85%+)
- [ ] Beta testing period (2 weeks minimum)
- [ ] Clear deprecation timeline communicated
- [ ] Rollback plan if critical issues found

**Validation:**
- Load all existing V1 games
- Verify backward compatibility maintained
- Monitor error logs during transition

---

### Risk 2: Parser Complexity & Edge Cases
**Severity:** MEDIUM | **Probability:** MEDIUM

**Description:** V2 parser fails on edge cases, malformed input

**Mitigation:**
- [ ] Start with strict format requirements
- [ ] Comprehensive error messages with line numbers
- [ ] Extensive test suite (20+ test cases)
- [ ] Validator tool catches issues before engine load
- [ ] Progressive enhancement (strict now, flexible later)

**Edge Cases to Test:**
- Missing frontmatter fields
- Invalid card counts
- Duplicate special modifiers
- Malformed markdown
- Very long descriptions
- Special characters in content
- Empty card descriptions

---

### Risk 3: Content Migration Effort
**Severity:** MEDIUM | **Probability:** LOW

**Description:** Manual effort required to convert/enhance games

**Mitigation:**
- [ ] Automated conversion tool (90%+ accurate)
- [ ] Manual review checklist provided
- [ ] Only 1-2 existing games to convert
- [ ] Template for new games reduces friction
- [ ] Creator guide with examples

**Validation:**
- Test conversion tool on all existing games
- Measure time to convert (target: < 30 min per game)
- Gather feedback from test creators

---

### Risk 4: Special Modifier Implementation
**Severity:** LOW | **Probability:** MEDIUM

**Description:** Special modifiers add complexity, potential bugs

**Mitigation:**
- [ ] Start with 2 SRD-approved modifiers only
- [ ] Extensible design for future additions
- [ ] Clear documentation on mechanics
- [ ] UI can be added later (Track F optional)
- [ ] Parser supports modifiers even if engine doesn't yet

**Validation:**
- Test with/without modifiers
- Ensure graceful degradation if modifier not implemented
- Document which modifiers are active

---

### Risk 5: Performance with Large Games
**Severity:** LOW | **Probability:** LOW

**Description:** Parser performance issues with large markdown files

**Mitigation:**
- [ ] Parser runs once at load time (not runtime overhead)
- [ ] Standard 52-card deck size (small, ~10-20KB files)
- [ ] No runtime parsing overhead
- [ ] Consider caching parsed configs in production
- [ ] Benchmark parse time (target: < 100ms)

**Validation:**
- Measure parse time for typical game file
- Test with very large card descriptions
- Profile memory usage

---

## Testing Strategy

### Unit Tests
**Location:** `/src/lib/parsers/*.test.js`, `/src/lib/stores/*.test.js`
**Target Coverage:** 90%+

**Test Areas:**
- [ ] V2 parser functions (frontmatter, card sections, validation)
- [ ] Card assignment logic
- [ ] Special modifier handling
- [ ] Damage calculation with bug fixes
- [ ] Final damage roll mechanics
- [ ] Ace classification (corrected behavior)

**Key Test Cases:**
```javascript
// Parser tests
- Valid complete game file
- Invalid card counts (too few/many)
- Missing required sections
- Duplicate special modifiers
- Explicit card assignments
- Edge cases (empty descriptions, special chars)

// Game logic tests
- Aces trigger damage checks
- Final damage roll mechanics
- Initial damage roll range
- Card type distribution
- Win/loss conditions
```

---

### Integration Tests
**Location:** `/tests/integration/*.test.js`

**Test Scenarios:**
- [ ] Complete game loading (V1 format)
- [ ] Complete game loading (V2 format)
- [ ] Game initialization with V2 config
- [ ] Card drawing with V2 content (description + story)
- [ ] Special modifier activation (when implemented)
- [ ] Win/loss conditions with new mechanics
- [ ] V1 fallback when V2 not found

---

### End-to-End Tests
**Location:** `/tests/e2e/*.spec.js`
**Tool:** Playwright or Cypress

**Test Flows:**
- [ ] Load V2 game in browser
- [ ] Play through complete game (automated)
- [ ] Trigger special modifiers (when implemented)
- [ ] Test all end states:
  - Win after final damage roll
  - Loss from final damage roll
  - Loss from resource depletion
  - Loss from 4 Kings

---

### Tool Validation Tests
**Location:** `/tools/*.test.js`

**Test Coverage:**
- [ ] Validation tool correctness
  - Accepts valid games
  - Rejects invalid games
  - Shows correct error messages
- [ ] Conversion tool accuracy
  - Preserves all card content
  - Correct type assignments
  - Valid output format
- [ ] Template generator output
  - Valid game structure
  - Correct placeholders

---

## Success Metrics

### Technical Metrics
- [ ] 0 critical bugs in production
- [ ] 90%+ test coverage maintained (currently 85%)
- [ ] < 500ms game load time
- [ ] All V1 games successfully converted to V2
- [ ] Parser handles 100% of valid V2 files
- [ ] < 5% false positive validation errors

### Content Metrics
- [ ] 2+ complete V2 games available
- [ ] 100% card completion for each game (52 cards)
- [ ] All special modifiers demonstrated
- [ ] Rich descriptions (not just single lines)

### Developer Experience Metrics
- [ ] < 30 min to create game template (via tool)
- [ ] < 2 hrs to write complete game (52 cards with descriptions)
- [ ] < 5 min to validate game
- [ ] < 10 min to test in engine
- [ ] < 1 hr to convert existing V1 game

### Player Experience Metrics
- [ ] SRD-compliant mechanics (95%+ after fixes)
- [ ] 10-20% win rate achieved (SRD target)
- [ ] Proper difficulty curve
- [ ] No game-breaking bugs
- [ ] Clear, engaging card narratives

---

## File-by-File Implementation Checklist

### New Files to Create (24 files)

#### Parser & Loaders
- [ ] `/src/lib/parsers/v2MarkdownParser.js` - Main parser
- [ ] `/src/lib/parsers/v2MarkdownParser.test.js` - Parser tests
- [ ] `/src/lib/loaders/gameLoader.js` - Universal loader
- [ ] `/src/lib/loaders/gameLoader.test.js` - Loader tests

#### Components
- [ ] `/src/lib/components/FinalDamageRoll.svelte` - Final roll UI
- [ ] `/src/lib/components/SpecialModifierCard.svelte` - Modifier UI (optional)

#### Tools
- [ ] `/tools/validate-game.js` - Validation CLI
- [ ] `/tools/validate-game.test.js` - Validator tests
- [ ] `/tools/convert-v1-to-v2.js` - Conversion CLI
- [ ] `/tools/convert-v1-to-v2.test.js` - Converter tests
- [ ] `/tools/create-game.js` - Template generator

#### Documentation
- [ ] `/docs/creator-guide.md` - Comprehensive creator guide
- [ ] `/docs/migration-guide.md` - V1→V2 migration guide
- [ ] `/docs/api/v2-parser.md` - Technical API documentation

#### Content
- [ ] `/static/games/future-lost.game.md` - Converted V1 game
- [ ] `/static/games/[new-game].game.md` - Second reference game

#### Tests
- [ ] `/tests/integration/v2-loading.test.js` - V2 loading tests
- [ ] `/tests/integration/special-modifiers.test.js` - Modifier tests
- [ ] `/tests/e2e/v2-game-playthrough.spec.js` - E2E playthrough

---

### Files to Modify (15 files)

#### Game Logic & State
- [ ] `/src/lib/stores/gameActions.svelte.js`
  - Fix Ace classification (line 156)
  - Add performFinalDamageRoll() function
  - Update successCheck() function
- [ ] `/src/lib/stores/gameInit.js`
  - Add initial damage roll (line 74)
  - Accept V2 config format
- [ ] `/src/lib/stores/transitions.js`
  - Add finalDamageRoll state

#### Tests
- [ ] `/src/lib/stores/gameActions.test.js`
  - Update Ace behavior tests
  - Add final damage roll test suite
- [ ] `/src/lib/stores/gameFlow.test.js`
  - Update Ace flow tests
- [ ] `/src/lib/stores/gameStore.test.js`
  - Add card distribution tests

#### Components
- [ ] `/src/lib/components/GameScreen.svelte`
  - Add finalDamageRoll screen case
- [ ] `/src/lib/components/GameOver.svelte`
  - Enhanced defeat messaging (optional)
- [ ] `/src/lib/components/DrawCard.svelte`
  - Display V2 content (description + story)

#### Routes
- [ ] `/src/routes/game/[slug]/+page.server.js`
  - Use new universal loader

#### Project Config
- [ ] `/package.json`
  - Add tool scripts:
    - `"validate-game": "node tools/validate-game.js"`
    - `"convert-v1-to-v2": "node tools/convert-v1-to-v2.js"`
    - `"create-game": "node tools/create-game.js"`

#### Documentation
- [ ] `/README.md`
  - Update with V2 information
  - Add tool usage examples
- [ ] `/docs/v2/game-engine-review.md`
  - Mark resolved issues
- [ ] `/docs/v2/game-config-v2.md`
  - Update implementation status

---

## Execution Recommendations

### Optimal Resource Allocation

For **maximum parallelization**, assign work as follows:

#### Week 1 Team: 2-3 Developers

**Developer 1: Critical Path Lead**
- Primary: CP-1 (V2 Parser) - 6-8 hrs
- Primary: CP-2 (Game Loader) - 2-3 hrs
- Secondary: D-1 (Creator Guide) - 1-1.5 hrs
- **Total: 9.5-12.5 hrs**

**Developer 2: Bug Fixes**
- Primary: A-1 (Ace bug) - 30 min
- Primary: A-2 (Initial damage) - 15 min
- Primary: A-3 (Final damage roll) - 1.5-2 hrs
- Secondary: B-1, B-2 (Test updates) - 1.25 hrs
- **Total: 3.5-4.5 hrs**

**Developer 3: Documentation (can be technical writer)**
- Primary: D-1 (Creator Guide) - 1-1.5 hrs
- Primary: D-2 (Migration Guide) - 1 hr
- Primary: D-3 (API Docs) - 1-1.5 hrs
- **Total: 3-4 hrs**

---

#### Week 2 Team: 1-2 Developers

**Developer 1: Tooling & Testing**
- Primary: C-1 (Validation tool) - 1-1.5 hrs
- Primary: C-2 (Conversion tool) - 2-3 hrs
- Primary: C-3 (Template gen) - 1-1.5 hrs
- Primary: B-3 (Card type tests) - 30 min
- **Total: 5-6.5 hrs**

**Developer 2: Content Creation**
- Primary: E-1 (Convert existing) - 1-2 hrs
- Primary: E-2 (New game) - 2-3 hrs
- **Total: 3-5 hrs**

---

#### Week 3 Team: 1 Developer (Optional Polish)

**Developer 1: UI Enhancements**
- Optional: F-1 (Special modifier UI) - 2-3 hrs
- Optional: F-2 (Enhanced game over) - 1 hr
- **Total: 3-4 hrs**

---

### Dependency Flow Chart

```
Week 1:
┌─────────────────────────────────────────────────┐
│ Critical Path (Sequential)                      │
│  CP-1: Parser (6-8h) → CP-2: Loader (2-3h)     │
└────────────────┬────────────────────────────────┘
                 │ BLOCKS
                 ↓
Week 2:         ┌─────────────────────────┐
                │ All Tooling (Track C)   │
                │ Content Creation (E)     │
                └─────────────────────────┘

Week 1:
┌─────────────────────────────────────────────────┐
│ Bug Fixes (Parallel - No Dependencies)          │
│  A-1: Ace (30m) → B-1: Tests (30m)              │
│  A-2: Initial dmg (15m)                         │
│  A-3: Final dmg (2h) → B-2: Tests (45m)         │
└─────────────────────────────────────────────────┘

Week 1-3:
┌─────────────────────────────────────────────────┐
│ Documentation (Parallel - No Dependencies)      │
│  D-1: Creator guide (1.5h)                      │
│  D-2: Migration guide (1h)                      │
│  D-3: API docs (1.5h)                           │
└─────────────────────────────────────────────────┘
```

---

## Progress Tracking

### Daily Standup Template

```
Date: ___________
Attendees: ___________

Yesterday:
- [ ] Task completed
- [ ] Task in progress (X% done)

Today:
- [ ] Task to start
- [ ] Task to continue

Blockers:
- None / List blockers

Risks:
- None / List emerging risks
```

---

### Weekly Review Template

```
Week: ___________
Milestone: ___________

Completed This Week:
- [ ] Task 1
- [ ] Task 2

In Progress:
- [ ] Task 3 (X% complete)

Next Week Goals:
- [ ] Task 4
- [ ] Task 5

Risks & Issues:
- None / List

Metrics:
- Test coverage: ___%
- Bug count: ___
- Remaining effort: ___ hours
```

---

## Contact & Resources

### Key Documents
- **This Plan:** `/docs/v2/implementation-plan.md`
- **Framework Review:** `/docs/v2/game-engine-review.md`
- **V2 Format Spec:** `/docs/v2/game-config-v2.md`
- **SRD Mechanics:** `/docs/v2/wretched-alone-mechanics-guide.md`

### Code Locations
- **Current Game Store:** `/src/lib/stores/gameStore.svelte.js`
- **Current Actions:** `/src/lib/stores/gameActions.svelte.js`
- **Current Init:** `/src/lib/stores/gameInit.js`
- **Components:** `/src/lib/components/`
- **Tests:** `/src/lib/stores/*.test.js`

### External References
- **Svelte 5 Docs:** https://svelte-5-preview.vercel.app/docs
- **Wretched & Alone SRD:** `/docs/v2/LTR-TheWretched-Pages-Screen.pdf`

---

## Appendix: Quick Reference

### Card Type Counts
- Primary Success: 1 (A♥)
- Failure Counter: 4 (K♥,K♦,K♣,K♠)
- Narrative: 3 (A♦,A♣,A♠)
- Challenge: 16 (3,5,7,9 × 4 suits)
- Event: 28 (2,4,6,8,10,J,Q × 4 suits)
- **Total: 52 cards**

### Special Modifiers
- `skip-damage`: Maximum 1 per game, Narrative cards only
- `return-king`: Maximum 1 per game, Narrative cards only

### Odd vs Even Ranks
- **Odd (triggers damage):** A, 3, 5, 7, 9 (20 cards)
- **Even (safe):** 2, 4, 6, 8, 10, J, Q, K (32 cards)

### CLI Commands
```bash
# Create new game
npm run create-game

# Validate game
npm run validate-game <path-to-game.md>

# Convert V1 to V2
npm run convert-v1-to-v2 <game-slug>

# Run tests
npm test

# Run specific test file
npm test gameActions
```

---

**Document Status:** Living document, update as tasks complete
**Last Updated:** 2025-11-11
**Next Review:** After Phase 1 completion (Week 1)
