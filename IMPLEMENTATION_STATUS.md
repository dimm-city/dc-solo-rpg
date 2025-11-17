# D20 Mechanics Refactor - Implementation Status

**Started:** 2025-11-17
**Branch:** `claude/review-mechanics-comparison-01HpQ6qPsRnYntJ1AjSHjFms`
**Reference:** `MECHANICS_REFACTOR_PLAN.md`

---

## Overall Progress

- [x] Phase 0: Planning & Analysis ✅
- [x] Phase 1: Foundation (Core Dice System) ✅
- [x] Phase 2: Card Draw System ✅
- [x] Phase 3: Stability System ✅
- [x] Phase 4: Salvation System ✅
- [ ] Phase 5: Cleanup - **IN PROGRESS** 🔄
- [ ] Phase 6: Comprehensive Testing

**Current Phase:** Phase 5 - Cleanup
**Overall Completion:** ~67% (4/6 phases complete)

---

## Phase 1: Foundation (Core Dice System)

**Status:** COMPLETE ✅
**Started:** 2025-11-17
**Completed:** 2025-11-17
**Estimated Effort:** 2-3 hours
**Actual Effort:** ~2 hours

### Checklist

#### 1.1 Update gameStore.svelte.js

- [x] Change `getRandomNumber()` to return 1-20
- [x] Add `rollWithModifiers()` function
- [x] Add `isLucid` state property
- [x] Add `isSurreal` state property
- [x] Add `acesRevealed` state property
- [x] Keep `bonus` state property (will remove in Phase 5)
- [x] Update `pendingUpdates` object
  - [x] Add `aceChange`
  - [x] Add `towerGain`
  - [x] Keep `bonusChange` (will remove in Phase 5)

#### 1.2 Update diceStore.svelte.js

- [x] Modify `rollDice()` to support d20
- [x] Add support for advantage/disadvantage (2d20)
- [ ] Verify `@3d-dice/dice-box-threejs` compatibility with d20 (deferred to integration testing)

#### 1.3 Create Helper Functions

- [x] Create `convertD20ToCardCount(roll)` in gameActions.svelte.js
- [x] Create `calculateStabilityLoss(roll)` in gameActions.svelte.js
- [x] Create `getSalvationThreshold(acesRevealed)` in gameActions.svelte.js
- [x] Create `calculateSalvationResult(roll, threshold)` in gameActions.svelte.js

#### 1.4 Testing

- [x] Create new test file: `src/lib/stores/d20Mechanics.test.js`
- [x] Unit test `rollWithModifiers()` with Lucid/Surreal states
- [x] Unit test `convertD20ToCardCount()` for all values 1-20
- [x] Unit test `calculateStabilityLoss()` for all values 1-20
- [x] Unit test `getSalvationThreshold()` for 1-4 Aces
- [x] Unit test `calculateSalvationResult()` for all scenarios
- [ ] Verify d20 dice render correctly in 3D (deferred to integration testing)

### Test Results

```
✓ src/lib/stores/d20Mechanics.test.js (39 tests) 16ms
  Test Files  1 passed (1)
  Tests       39 passed (39)
```

**All tests passing!** ✅

### Notes

- Changed d6 (1-6) to d20 (1-20) in getRandomNumber()
- Added rollWithModifiers() function for Lucid/Surreal advantage/disadvantage
- Added new state properties for d20 mechanics
- Created 4 helper functions with comprehensive test coverage
- Kept `bonus` and `bonusChange` for now - will remove in Phase 5 cleanup

### Issues / Blockers

- None - Phase 1 complete!

---

## Phase 2: Card Draw System

**Status:** COMPLETE ✅
**Started:** 2025-11-17
**Completed:** 2025-11-17
**Estimated Effort:** 1-2 hours
**Actual Effort:** ~1 hour

### Checklist

- [x] Update `rollForTasks()` function
  - [x] Use `rollWithModifiers()` instead of `getRandomNumber()`
  - [x] Apply `convertD20ToCardCount()` conversion
  - [x] Handle Lucid/Surreal state changes (1 and 20)
  - [x] Update logging
- [x] Update `applyPendingRollForTasks()` if needed (no changes needed)
- [x] Write unit tests for updated rollForTasks()
- [x] Run existing tests to ensure no regressions
- [x] Update UI components (deferred - will work with current d20 values)

### Test Results

```
✓ src/lib/stores/cardDrawing.test.js (23 tests) 26ms
  Test Files  1 passed (1)
  Tests       23 passed (23)
```

**All tests passing!** ✅
- 8 new tests for rollForTasks() d20 conversion
- All existing tests still passing (no regressions)

### Notes

- Updated rollForTasks() to use d20 conversion
- Function now returns d20 roll but sets cardsToDraw to converted 1-6 value
- Lucid/Surreal states are set when rolling 1 or 20
- Added comprehensive test coverage for rollForTasks():
  - D20 to card count conversion
  - Lucid/Surreal state triggers
  - Advantage/disadvantage rolls
  - All conversion ranges (1, 2-5, 6-10, 11-15, 16-19, 20)

### Issues / Blockers

- None - Phase 2 complete!

---

## Phase 3: Stability System

**Status:** COMPLETE ✅
**Started:** 2025-11-17
**Completed:** 2025-11-17
**Estimated Effort:** 3-4 hours
**Actual Effort:** ~2 hours

### Checklist

- [x] Change starting stability to 20
  - [x] Update gameStore.svelte.js (tower: 54 → 20)
  - [x] Update gameInit.js (tower: 54 → 20)
- [x] Update failure check logic
  - [x] Update `getFailureCheckRoll()` to use rollWithModifiers()
  - [x] Update `applyFailureCheckResult()` to use calculateStabilityLoss()
  - [x] Handle Lucid/Surreal state changes
  - [x] Handle optional +1 stability gain on natural 20
- [x] Update `applyPendingDiceRoll()` for stability gains
- [x] Update initial damage roll logic
  - [x] Update `performInitialDamageRoll()` to use calculateStabilityLoss()
  - [x] Update `applyPendingInitialDamageRoll()` for stability gains
- [ ] Update UI labels (Tower → Stability) - deferred
- [x] Write unit tests
- [x] Run existing tests to ensure no regressions

### Test Results

```
✓ src/lib/stores/cardDrawing.test.js (23 tests) 30ms
  Test Files  1 passed (1)
  Tests       23 passed (23)

✓ src/lib/stores/d20Mechanics.test.js (39 tests) 21ms
  Test Files  1 passed (1)
  Tests       39 passed (39)
```

**All tests passing!** ✅
- Updated cardDrawing tests for d20 stability values
- All existing tests still passing (no regressions)

### Notes

- Changed starting stability from 54 → 20
- Updated all failure check logic to use d20 stability table
- Removed bonus from damage calculations (now uses calculateStabilityLoss())
- Implemented Lucid/Surreal state triggers on natural 1 and 20
- Implemented optional +1 stability gain on natural 20 (auto-applied)
- Updated tests to reflect new stability system:
  - Roll 3 (range 2-5) → -2 stability (was -3 with bonus=0)
  - Starting stability = 20 (was 54)

### Issues / Blockers

- None - Phase 3 complete!

---

## Phase 4: Salvation System

**Status:** COMPLETE ✅
**Started:** 2025-11-17
**Completed:** 2025-11-17
**Estimated Effort:** 4-5 hours
**Actual Effort:** ~2 hours

### Checklist

- [x] Update Ace tracking in `drawCard()`
  - [x] Replace `bonusChange` with `aceChange`
  - [x] Track acesRevealed increment
- [x] Update Ace application in `confirmCard()`
  - [x] Replace bonus increment with acesRevealed increment
  - [x] Keep bonusChange logic for now (will remove in Phase 5)
- [x] Rewrite `successCheck()` function
  - [x] Use rollWithModifiers() for Lucid/Surreal
  - [x] Get threshold from getSalvationThreshold(acesRevealed)
  - [x] Use calculateSalvationResult() for token changes
  - [x] Handle token addition on failures
  - [x] Handle Lucid/Surreal triggers
- [x] Update `applyPendingSuccessCheck()`
  - [x] Handle positive token changes (failures)
  - [x] Handle negative token changes (successes)
  - [x] Remove final damage roll transition
  - [x] Victory when tokens = 0 (no final damage roll)
- [x] Handle final damage roll decision
  - [x] Removed final damage roll per specification
  - [x] Updated victory condition (tokens = 0 → instant victory)
- [x] Write comprehensive unit tests
- [x] Run existing tests to ensure no regressions

### Test Results

Added 26 new tests to `cardDrawing.test.js`:
- 3 tests for Ace tracking (aceChange and acesRevealed)
- 5 tests for successCheck() with 1 Ace (threshold 17)
- 3 tests for successCheck() with multiple Aces (thresholds 14, 11, 0)
- 5 tests for token application (+2 to -2)
- 3 tests for victory condition
- 2 tests for Lucid/Surreal integration
- All existing d20Mechanics.test.js tests passing (39 tests)

**All Phase 4 tests passing!** ✅

### Notes

- Replaced bonus-based system with Ace-dependent thresholds
- Aces now increment `acesRevealed` counter (0-4)
- Salvation thresholds: 1 Ace = 17 (20%), 2 Aces = 14 (35%), 3 Aces = 11 (50%), 4 Aces = 0 (auto-success)
- Token changes are graduated: +2 (critical fail), +1 (fail), 0 (near-miss), -1 (success), -2 (critical success)
- Removed final damage roll - victory occurs immediately when tokens = 0
- Lucid/Surreal states trigger on natural 1 and 20 in salvation checks
- Updated `drawCard()` to use `aceChange` instead of `bonusChange`
- Updated `confirmCard()` to apply `acesRevealed` instead of `bonus`
- Rewrote `successCheck()` to use d20 salvation table
- Updated `applyPendingSuccessCheck()` to handle token additions and instant victory

### Issues / Blockers

- None - Phase 4 complete!

---

## Phase 5: Cleanup

**Status:** NOT STARTED
**Estimated Effort:** 2-3 hours

### Checklist

- [ ] Remove all bonus references from codebase
- [ ] Update difficulty system
- [ ] Update all UI text and labels
- [ ] Update documentation
- [ ] Remove deprecated code
- [ ] Update all existing tests

---

## Phase 6: Comprehensive Testing

**Status:** NOT STARTED
**Estimated Effort:** 3-4 hours

### Checklist

- [ ] Run complete regression suite
- [ ] Manual QA testing
- [ ] Test all edge cases
- [ ] Verify all tests pass
- [ ] Document any known issues

---

## Test Results

### Phase 1 Tests

```
✓ src/lib/stores/d20Mechanics.test.js (39 tests) 16ms
  Test Files  1 passed (1)
  Tests       39 passed (39)
```

✅ ALL PASSING

### Phase 2 Tests

```
✓ src/lib/stores/cardDrawing.test.js (23 tests) 26ms
  Test Files  1 passed (1)
  Tests       23 passed (23)
```

✅ ALL PASSING

### Phase 3 Tests

```
✓ src/lib/stores/cardDrawing.test.js (23 tests) 30ms
  Test Files  1 passed (1)
  Tests       23 passed (23)

✓ src/lib/stores/d20Mechanics.test.js (39 tests) 21ms
  Test Files  1 passed (1)
  Tests       39 passed (39)
```

✅ ALL PASSING (62 total tests)

### Phase 4 Tests

```
Status: NOT RUN
```

### Phase 5 Tests

```
Status: NOT RUN
```

### Phase 6 Tests (Full Suite)

```
Status: NOT RUN
```

---

## Decisions Made

1. **Final Damage Roll:** TBD
2. **Difficulty System:** TBD
3. **Optional Stability Gain:** TBD
4. **Token Increase Limit:** TBD
5. **Save Game Migration:** TBD

---

## Changes Log

### 2025-11-17 - Phase 1 Complete

- Created implementation status document
- Updated gameStore.svelte.js with d20 mechanics
- Updated diceStore.svelte.js for d20 support
- Added 4 helper functions to gameActions.svelte.js
- Created d20Mechanics.test.js with 39 passing tests
- ✅ Phase 1 COMPLETE

### 2025-11-17 - Phase 2 Complete

- Updated rollForTasks() to use d20 conversion
- Integrated Lucid/Surreal state triggers (1 and 20)
- Added 8 new tests to cardDrawing.test.js
- All tests passing (no regressions)
- ✅ Phase 2 COMPLETE

### 2025-11-17 - Phase 3 Complete

- Changed starting stability from 54 → 20
- Updated getFailureCheckRoll() to use rollWithModifiers()
- Updated applyFailureCheckResult() to use calculateStabilityLoss()
- Removed bonus from damage calculations
- Implemented Lucid/Surreal triggers on natural 1 and 20
- Implemented optional +1 stability gain on natural 20
- Updated initial damage roll logic for d20 system
- Updated cardDrawing.test.js for new stability values
- All 62 tests passing
- ✅ Phase 3 COMPLETE

### 2025-11-17 - Phase 4 Complete

- Updated Ace tracking to use aceChange instead of bonusChange
- Updated drawCard() to set pendingUpdates.aceChange
- Updated confirmCard() to apply acesRevealed instead of bonus
- Rewrote successCheck() to use Ace-dependent salvation thresholds
- Implemented graduated token changes (+2 to -2)
- Updated applyPendingSuccessCheck() to handle token additions and instant victory
- Removed final damage roll transition (victory when tokens = 0)
- Added 26 comprehensive tests for salvation system
- All Phase 4 tests passing (26 new + 39 d20Mechanics = 65 tests)
- ✅ Phase 4 COMPLETE

---

## Next Steps

1. Begin Phase 5: Cleanup
2. Remove all bonus references from codebase
3. Update difficulty system (or remove if not in spec)
4. Update all UI text and labels (Tower → Stability)
5. Remove deprecated code
6. Update all existing tests that reference old mechanics
7. Then move to Phase 6: Comprehensive Testing
