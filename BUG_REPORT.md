# Bug Report - Integration Test Findings

**Date:** 2025-11-19
**Test Suite:** `gameIntegration.test.js` (38 tests, 20 failures)
**Method:** Documentation-driven integration tests

## Executive Summary

Integration tests written purely from CLAUDE.md documentation revealed **5 critical bugs** and **2 API design issues** that prevent the game mechanics from working as documented.

---

## 🔴 Critical Bugs

### Bug #1: Missing Function `getSalvationCheckRoll()`

**Severity:** CRITICAL
**Type:** Missing Implementation
**Tests Failing:** 7 tests

**Issue:**
Documentation describes a function `getSalvationCheckRoll()` that should return salvation roll details, but this function doesn't exist in the codebase.

**Expected (from docs):**
```javascript
const { roll, threshold, tokenChange } = getSalvationCheckRoll();
```

**Actual:**
```javascript
// Function doesn't exist
// Use successCheck() instead, which doesn't return values
```

**Impact:**
- Cannot test Salvation mechanics in isolation
- API doesn't match documentation
- Makes testing difficult

**Recommended Fix:**
Create wrapper function that exposes test-friendly API:
```javascript
export function getSalvationCheckRoll() {
  const { roll, wasLucid, wasSurreal } = gameState.rollWithModifiers();
  const threshold = getSalvationThreshold(gameState.acesRevealed);
  const { tokenChange, gainedLucid, gainedSurreal } = calculateSalvationResult(roll, threshold);

  return {
    roll,
    threshold,
    tokenChange,
    wasLucid,
    wasSurreal,
    gainedLucid,
    gainedSurreal
  };
}
```

---

### Bug #2: `getFailureCheckRoll()` Missing Return Values

**Severity:** HIGH
**Type:** Incomplete Implementation
**Tests Failing:** 4 tests

**Issue:**
`getFailureCheckRoll()` only returns `{ roll, wasLucid, wasSurreal }` but tests expect `{ roll, stabilityLoss, stabilityGain, lucidGained, surrealGained }`.

**Current Implementation:**
```javascript
export function getFailureCheckRoll() {
  const { roll, wasLucid, wasSurreal } = gameState.rollWithModifiers();
  return { roll, wasLucid, wasSurreal }; // Missing stability calculations
}
```

**Expected:**
```javascript
export function getFailureCheckRoll() {
  const { roll, wasLucid, wasSurreal } = gameState.rollWithModifiers();

  // Calculate stability loss
  const { loss, gainedLucid, gainedSurreal, optionalGain } =
    calculateStabilityLoss(roll);

  return {
    roll,
    wasLucid,
    wasSurreal,
    stabilityLoss: loss,
    stabilityGain: optionalGain || 0,
    lucidGained: gainedLucid,
    surrealGained: gainedSurreal
  };
}
```

**Impact:**
- Tests cannot verify stability calculations
- Forces tests to call multiple functions
- API design mismatch with documentation

---

### Bug #3: `rollForTasks()` Missing Return Values

**Severity:** HIGH
**Type:** Incomplete Implementation
**Tests Failing:** 4 tests

**Issue:**
`rollForTasks()` doesn't return `cardCount`, `wasLucid`, or `wasSurreal` properties.

**Current Behavior:**
```javascript
export function rollForTasks() {
  // Sets gameState.cardsToDraw internally
  // Returns nothing useful for testing
}
```

**Expected:**
```javascript
export function rollForTasks() {
  const { roll, wasLucid, wasSurreal } = gameState.rollWithModifiers();
  const cardCount = convertD20ToCardCount(roll);

  // Set internal state
  gameState.pendingUpdates.diceRoll = roll;
  gameState.cardsToDraw = cardCount;

  // Return values for testing
  return {
    roll,
    cardCount,
    wasLucid,
    wasSurreal
  };
}
```

**Impact:**
- Cannot verify roll-to-card-count conversion
- Cannot verify Lucid/Surreal application
- Testing requires internal state inspection

---

### Bug #4: Stability Loss Calculation Returns Undefined

**Severity:** HIGH
**Type:** Logic Error
**Tests Failing:** 2 tests

**Issue:**
When calling `getFailureCheckRoll()` with current card rank 7 and roll 1, `stabilityLoss` is undefined instead of 7.

**Root Cause:**
`getFailureCheckRoll()` doesn't call `calculateStabilityLoss()` - it just returns the raw roll.

**Test Case:**
```javascript
gameState.currentCard = { card: '7', suit: 'hearts', rank: 7 };
mockDieRoll(1); // Natural 1, should be max damage
const { stabilityLoss } = getFailureCheckRoll();
expect(stabilityLoss).toBe(7); // FAILS: undefined
```

**Expected Behavior:**
- Roll 1 on rank 7 card = 7 stability loss
- Function should return calculated loss

**Actual Behavior:**
- Returns undefined
- Loss is calculated later in `applyFailureCheckResult()`

---

### Bug #5: Natural 20 Doesn't Set Lucid State After `applyPendingDiceRoll()`

**Severity:** MEDIUM
**Type:** State Management Bug
**Tests Failing:** 1 test

**Issue:**
After rolling natural 20 and calling `applyPendingDiceRoll()`, `gameState.isLucid` is `false` instead of `true`.

**Test Case:**
```javascript
gameState.tower = 20; // Already at max
mockDieRoll(20);
const { stabilityGain } = getFailureCheckRoll();

gameState.pendingUpdates.diceRoll = 20;
gameState.pendingUpdates.towerGain = stabilityGain;
applyPendingDiceRoll();

expect(gameState.tower).toBe(20); // ✓ PASSES - caps at 20
expect(gameState.isLucid).toBe(true); // ✗ FAILS - is false
```

**Expected:**
- Natural 20 grants +1 stability (capped at 20) AND Lucid state
- Lucid state should persist for next roll

**Actual:**
- Stability caps correctly at 20
- Lucid state is not set (remains false)

**Root Cause:**
Possibly `gainedLucid` is not being set in pending state when tower is already at max.

---

## ⚠️ Design Issues

### Design Issue #1: Split API for Roll and Apply

**Impact:** Testing Difficulty

**Current Pattern:**
```javascript
// Pattern 1: Failure Check
const { roll } = getFailureCheckRoll(); // Returns roll only
applyFailureCheckResult(roll); // Calculates and sets pending
applyPendingDiceRoll(); // Applies to state

// Pattern 2: Success Check
successCheck(); // Does everything, returns nothing
applyPendingSuccessCheck(); // Applies to state
```

**Problem:**
- Two different patterns for similar operations
- No way to inspect calculated values before applying
- Forces tests to inspect pendingUpdates directly

**Recommended:**
- Unify API: All "get" functions should return calculated values
- All "apply" functions should use those values
- Makes testing easier and code more predictable

---

### Design Issue #2: Documentation/Implementation Mismatch

**Impact:** Developer Confusion

**Issue:**
CLAUDE.md describes mechanics that don't match actual implementation:

**Documentation Says:**
```javascript
// From CLAUDE.md
const { roll, threshold, tokenChange } = getSalvationCheckRoll();
```

**Code Actually:**
```javascript
// Actual implementation
successCheck(); // Returns nothing
// Must inspect gameState.pendingUpdates to see values
```

**Recommended:**
Either:
1. Update documentation to match implementation, OR
2. Update implementation to match documentation (preferred)

---

## 📊 Test Results Summary

| Category | Pass | Fail | Rate |
|----------|------|------|------|
| D20 System Mechanics | 3 | 0 | 100% |
| Salvation System | 1 | 5 | 17% |
| Lucid/Surreal States | 2 | 2 | 50% |
| Challenge Cards | 2 | 2 | 50% |
| Event Cards | 1 | 0 | 100% |
| Failure Counter (Kings) | 2 | 0 | 100% |
| Narrative Cards (Aces) | 3 | 1 | 75% |
| Roll for Tasks | 0 | 3 | 0% |
| Game Flow Integration | 0 | 3 | 0% |
| Edge Cases | 2 | 4 | 33% |
| State Machine | 2 | 0 | 100% |
| **TOTAL** | **18** | **20** | **47%** |

---

## 🔧 Recommended Fixes

### Priority 1 (Critical - Blocks Testing)

1. **Create `getSalvationCheckRoll()` function**
   - File: `src/lib/stores/gameActions.svelte.js`
   - Returns: `{ roll, threshold, tokenChange, wasLucid, wasSurreal, gainedLucid, gainedSurreal }`
   - Estimated effort: 30 minutes

2. **Fix `getFailureCheckRoll()` to return stability calculations**
   - Add: `stabilityLoss`, `stabilityGain`, `lucidGained`, `surrealGained`
   - Estimated effort: 20 minutes

3. **Fix `rollForTasks()` to return values**
   - Add: `roll`, `cardCount`, `wasLucid`, `wasSurreal`
   - Estimated effort: 15 minutes

### Priority 2 (High - Correctness)

4. **Fix Lucid state not being set on natural 20**
   - Investigate `applyPendingDiceRoll()` logic
   - Ensure `gainedLucid` is set even when tower is at max
   - Estimated effort: 30 minutes

### Priority 3 (Medium - Maintainability)

5. **Update CLAUDE.md to match actual implementation**
   - Or update implementation to match docs
   - Estimated effort: 1-2 hours

---

## 🎯 Impact Analysis

**Without Fixes:**
- 47% of integration tests fail
- Salvation mechanics cannot be properly tested
- Developers confused by documentation mismatches
- Hidden bugs in production code remain undetected

**With Fixes:**
- 100% test coverage of documented mechanics
- Clear, testable API
- Documentation matches implementation
- Confidence in correctness of game rules

---

## 📝 Next Steps

1. ✅ Run integration tests - COMPLETE
2. ✅ Document all bugs - COMPLETE
3. ⏳ Fix Priority 1 bugs
4. ⏳ Re-run integration tests
5. ⏳ Fix Priority 2 bugs
6. ⏳ Update documentation or code for consistency
7. ⏳ Add integration tests to CI/CD pipeline

---

**Test Command:**
```bash
npm run test:unit -- src/lib/stores/gameIntegration.test.js
```

**Test File:**
`src/lib/stores/gameIntegration.test.js` (1141 lines, 38 tests)
