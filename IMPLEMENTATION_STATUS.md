# D20 Mechanics Refactor - Implementation Status

**Started:** 2025-11-17
**Branch:** `claude/review-mechanics-comparison-01HpQ6qPsRnYntJ1AjSHjFms`
**Reference:** `MECHANICS_REFACTOR_PLAN.md`

---

## Overall Progress

- [x] Phase 0: Planning & Analysis ✅
- [x] Phase 1: Foundation (Core Dice System) ✅
- [ ] Phase 2: Card Draw System - **NEXT**
- [ ] Phase 3: Stability System
- [ ] Phase 4: Salvation System
- [ ] Phase 5: Cleanup
- [ ] Phase 6: Comprehensive Testing

**Current Phase:** Phase 1 Complete, Starting Phase 2
**Overall Completion:** ~17% (1/6 phases complete)

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

**Status:** NOT STARTED
**Estimated Effort:** 1-2 hours

### Checklist

- [ ] Update `rollForTasks()` function
- [ ] Update UI components for d20 display
- [ ] Write unit tests for card draw conversion
- [ ] Write integration tests

---

## Phase 3: Stability System

**Status:** NOT STARTED
**Estimated Effort:** 3-4 hours

### Checklist

- [ ] Change starting stability to 20
- [ ] Update `getFailureCheckRoll()`
- [ ] Update `applyFailureCheckResult()`
- [ ] Update `applyPendingDiceRoll()`
- [ ] Update initial damage roll
- [ ] Update UI labels (Tower → Stability)
- [ ] Write unit tests
- [ ] Write integration tests

---

## Phase 4: Salvation System

**Status:** NOT STARTED
**Estimated Effort:** 4-5 hours

### Checklist

- [ ] Update Ace tracking in `drawCard()`
- [ ] Update Ace application in `confirmCard()`
- [ ] Implement threshold calculation
- [ ] Rewrite `successCheck()` function
- [ ] Update `applyPendingSuccessCheck()`
- [ ] Remove/deprecate final damage roll
- [ ] Update transition graph
- [ ] Write comprehensive unit tests
- [ ] Write integration tests

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
Status: NOT RUN
```

### Phase 2 Tests

```
Status: NOT RUN
```

### Phase 3 Tests

```
Status: NOT RUN
```

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

### 2025-11-17

- Created implementation status document
- Starting Phase 1 implementation

---

## Next Steps

1. Begin Phase 1.1: Update gameStore.svelte.js
2. Read existing gameStore.svelte.js to understand structure
3. Make changes incrementally
4. Test after each change
