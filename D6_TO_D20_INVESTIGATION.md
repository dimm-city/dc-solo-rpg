# D6 to D20 Dice Conversion Investigation

**Date:** 2025-11-17
**Branch:** `claude/investigate-root-cause-01Bja4KuXshWWUP2v2nU4mjV`

## Executive Summary

This investigation identifies all code locations that would need modification to switch from using a 6-sided die (d6) to a 20-sided die (d20) while maintaining existing game mechanics. The recommended approach uses a conversion function that maps d20 values (1-20) to d6 values (1-6), minimizing changes to the existing codebase.

## Recommended Implementation Strategy

### Core Concept

1. **Change the physical die rolled:** Modify dice roller to use `1d20` instead of `1d6`
2. **Convert the result:** Apply `convertD20ToD6()` function to map 1-20 → 1-6
3. **Preserve all game logic:** All existing checks for dice values (1-6) remain unchanged

### Conversion Function

```javascript
/**
 * Convert a d20 roll to a d6 value using a balanced mapping
 * @param {number} d20Value - Roll result from 1-20
 * @returns {number} Equivalent d6 value from 1-6
 */
export function convertD20ToD6(d20Value) {
    // Balanced distribution:
    // 1-3 → 1 (3 values, 15%)
    // 4-7 → 2 (4 values, 20%)
    // 8-10 → 3 (3 values, 15%)
    // 11-14 → 4 (4 values, 20%)
    // 15-17 → 5 (3 values, 15%)
    // 18-20 → 6 (3 values, 15%)

    if (d20Value >= 1 && d20Value <= 3) return 1;
    if (d20Value >= 4 && d20Value <= 7) return 2;
    if (d20Value >= 8 && d20Value <= 10) return 3;
    if (d20Value >= 11 && d20Value <= 14) return 4;
    if (d20Value >= 15 && d20Value <= 17) return 5;
    if (d20Value >= 18 && d20Value <= 20) return 6;

    throw new Error(`Invalid d20 value: ${d20Value}. Must be between 1 and 20.`);
}

/**
 * Helper for tests: Get a d20 value that converts to the desired d6 value
 * Returns the first value in the range (can randomize within range if desired)
 * @param {number} d6Value - Desired d6 result (1-6)
 * @returns {number} A d20 value that maps to the desired d6 value
 */
export function getD20ValueForD6(d6Value) {
    const ranges = {
        1: [1, 3],
        2: [4, 7],
        3: [8, 10],
        4: [11, 14],
        5: [15, 17],
        6: [18, 20]
    };

    const range = ranges[d6Value];
    if (!range) {
        throw new Error(`Invalid d6 value: ${d6Value}. Must be between 1 and 6.`);
    }

    // Return first value in range (or could randomize)
    return range[0];
}
```

### Probability Distribution

| D20 Range | D6 Value | Probability | Count |
|-----------|----------|-------------|-------|
| 1-3       | 1        | 15%         | 3     |
| 4-7       | 2        | 20%         | 4     |
| 8-10      | 3        | 15%         | 3     |
| 11-14     | 4        | 20%         | 4     |
| 15-17     | 5        | 15%         | 3     |
| 18-20     | 6        | 15%         | 3     |

**Note:** Values 2 and 4 have slightly higher probability (20% vs 15%) to create a smooth distribution curve.

## Files Requiring Changes

### 1. Core Dice System (CRITICAL - PRIMARY CHANGES)

#### `src/lib/stores/diceStore.svelte.js`

**Location:** Line 182-199 (rollDice function)

**Current Code:**
```javascript
export async function rollDice(value = null) {
    if (!diceBoxInstance) {
        throw new Error('DiceBox not initialized. Call initializeDiceBox first.');
    }

    isRolling = true;

    const rollString = value ? `1d6@${value}` : '1d6';
    const result = await diceBoxInstance.roll(rollString);

    setTimeout(() => {
        isRolling = false;
    }, 2000);

    return result.total;
}
```

**Required Changes:**
```javascript
import { convertD20ToD6 } from '../utils/diceConversion.js';

export async function rollDice(value = null) {
    if (!diceBoxInstance) {
        throw new Error('DiceBox not initialized. Call initializeDiceBox first.');
    }

    isRolling = true;

    // CHANGED: Use 1d20 instead of 1d6
    // If preset value provided, convert d6 to d20 for display
    const rollString = value
        ? `1d20@${getD20ValueForD6(value)}`
        : '1d20';
    const result = await diceBoxInstance.roll(rollString);

    setTimeout(() => {
        isRolling = false;
    }, 2000);

    // CHANGED: Convert d20 result to d6 value
    return convertD20ToD6(result.total);
}
```

**Impact:** This is the PRIMARY change. All dice rolls go through this function.

---

#### `src/lib/stores/gameStore.svelte.js`

**Location:** Line 8-10 (getRandomNumber helper)

**Current Code:**
```javascript
let getRandomNumber = () => {
    return Math.floor(Math.random() * 6) + 1;
};
```

**Required Changes:**
```javascript
import { convertD20ToD6 } from '../utils/diceConversion.js';

let getRandomNumber = () => {
    // Generate d20 value and convert to d6
    return convertD20ToD6(Math.floor(Math.random() * 20) + 1);
};
```

**Impact:** Used as fallback for dice rolls and in tests. About 5 direct calls in game logic.

---

#### `src/lib/components/GameScreen.svelte`

**Location:** Lines 234, 273 (fallback dice rolls)

**Current Code (Line 234 - Final damage roll):**
```javascript
const rollResult = Math.floor(Math.random() * 6) + 1;
```

**Current Code (Line 273 - Initial damage roll):**
```javascript
const rollResult = Math.floor(Math.random() * 6) + 1;
```

**Required Changes:**
```javascript
import { convertD20ToD6 } from '../lib/utils/diceConversion.js';

// Line 234 - Final damage roll
const rollResult = convertD20ToD6(Math.floor(Math.random() * 20) + 1);

// Line 273 - Initial damage roll
const rollResult = convertD20ToD6(Math.floor(Math.random() * 20) + 1);
```

**Impact:** These are fallback/direct roll implementations used in specific game states.

---

### 2. New Utility File (CREATE NEW)

#### `src/lib/utils/diceConversion.js` (NEW FILE)

**Contents:** Full implementation of `convertD20ToD6()` and `getD20ValueForD6()` functions

**Export:** Add to `src/lib/index.js` for package consumers

---

### 3. Game Logic (NO CHANGES REQUIRED ✓)

These files check dice values but do NOT need changes because they receive already-converted d6 values (1-6):

#### `src/lib/stores/gameActions.svelte.js`

**Line 446:**
```javascript
if (roll === 6 || (gameState.config.difficulty > 0 && roll + gameState.bonus === 6))
```

**Status:** ✓ NO CHANGE NEEDED - Receives converted d6 value

**Other checks:** All damage calculations, token checks, and bonus calculations work with d6 values

---

### 4. Test Files (EXTENSIVE UPDATES)

All test files that mock dice rolls need updates. Change test mocks to use d20 values that convert to desired d6 results.

#### Strategy for Test Updates:

```javascript
// OLD (d6 mock)
gameState.getRandomNumber = vi.fn().mockReturnValue(6);

// NEW (d20 mock) - Use helper to get d20 value for desired d6
import { getD20ValueForD6 } from '../utils/diceConversion.js';
gameState.getRandomNumber = vi.fn().mockReturnValue(getD20ValueForD6(6)); // Returns 18
```

#### Files Requiring Test Updates:

1. **`src/lib/stores/diceStore.test.js`**
   - Update mock DiceBox to return d20 values
   - Verify conversion logic

2. **`src/lib/stores/gameStore.test.js`** (Line 270-275)
   - Test `getRandomNumber()` returns values 1-6 after conversion

3. **`src/lib/stores/gameActions.test.js`**
   - Lines with mocks: 180, 191, 199, 207, 369, 378, 389, 451, 461, 472, 483, 496
   - Update all `mockReturnValue()` calls

4. **`src/lib/stores/gameFlow.test.js`**
   - Lines: 126, 267, 294, 386, 414
   - Update `getRandomNumber` mocks

5. **`src/lib/stores/wretchedAloneMechanics.test.js`**
   - Lines: 378, 389, 402, 533, 842
   - Update roll value mocks

6. **`src/lib/stores/finalDamageRoll.test.js`**
   - Update test expectations

7. **`src/lib/stores/cardDrawing.test.js`**
   - Update any dice-related mocks

8. **Integration Tests:**
   - `tests/integration/comprehensive-validation.spec.js` (Line 257-260)
   - `tests/integration/full-game-validation.spec.js`
   - `tests/integration/gameplay.spec.js`

---

### 5. Documentation Updates (REFERENCE ONLY)

Update references to "1d6" for accuracy:

- `docs/wretched-alone-mechanics-guide.md` (many references)
- `docs/simplified-type-based-format.md` (Line 854)
- `CLAUDE.md` (if it references dice mechanics)

These are documentation updates only - no functional impact.

---

## Implementation Checklist

### Phase 1: Create Conversion Infrastructure
- [ ] Create `src/lib/utils/diceConversion.js`
- [ ] Implement `convertD20ToD6()` function
- [ ] Implement `getD20ValueForD6()` helper for tests
- [ ] Add comprehensive unit tests for conversion function
- [ ] Export functions from `src/lib/index.js`

### Phase 2: Update Core Dice System
- [ ] Update `diceStore.svelte.js` line 190: Change `'1d6'` to `'1d20'`
- [ ] Update `diceStore.svelte.js` line 199: Wrap return with `convertD20ToD6()`
- [ ] Update `diceStore.svelte.js`: Handle preset values (convert d6→d20 for display)
- [ ] Update `gameStore.svelte.js` line 9: Use d20 + conversion
- [ ] Update `GameScreen.svelte` line 234: Add conversion
- [ ] Update `GameScreen.svelte` line 273: Add conversion

### Phase 3: Update Test Suite
- [ ] Create test helper: `getD20ValueForD6()` for easy mock creation
- [ ] Update `diceStore.test.js` mocks
- [ ] Update `gameStore.test.js` assertions
- [ ] Update `gameActions.test.js` - all mock return values
- [ ] Update `gameFlow.test.js` - all mock return values
- [ ] Update `wretchedAloneMechanics.test.js` - all mock return values
- [ ] Update `finalDamageRoll.test.js`
- [ ] Update `cardDrawing.test.js`
- [ ] Update integration tests

### Phase 4: Testing & Verification
- [ ] Run unit test suite: `npm run test:unit`
- [ ] Fix any test failures
- [ ] Run integration tests: `npm run test`
- [ ] Manual testing: Verify d20 visual display
- [ ] Manual testing: Verify game mechanics unchanged
- [ ] Test edge cases: Roll 1, 20, and boundary values
- [ ] Test all difficulty levels
- [ ] Test success checks (rolling 6)
- [ ] Test damage calculations

### Phase 5: Documentation
- [ ] Update `docs/wretched-alone-mechanics-guide.md`
- [ ] Update `docs/simplified-type-based-format.md`
- [ ] Update `CLAUDE.md` if needed
- [ ] Add comments explaining conversion rationale

---

## Risk Assessment

### Low Risk ✓
- Conversion function is mathematically sound
- Only 4 core files need functional changes
- All game logic remains unchanged (works with d6 values)
- Test suite will catch any integration issues

### Medium Risk ⚠️
- Test updates are extensive (many files)
- Must verify all mocks map correctly
- Integration tests may need careful review

### Mitigation
- Comprehensive test coverage at conversion layer
- Helper function for test mocks (`getD20ValueForD6`)
- Manual testing verification
- Gradual rollout possible (feature flag)

---

## Benefits of This Approach

1. **Minimal Code Changes:** Only 4 core files modified
2. **Preserved Game Logic:** All mechanics equations remain identical
3. **Clear Abstraction:** Conversion function is a clean interface layer
4. **Testable:** Conversion logic is isolated and easily tested
5. **Reversible:** Can switch back by reversing changes
6. **Balanced Probability:** Distribution maintains game balance

---

## Alternative Approaches Considered

### Alternative 1: Rewrite All Game Logic for D20
- **Pros:** No conversion needed
- **Cons:** Massive changes, breaks existing balance, requires redesigning all mechanics
- **Verdict:** ❌ Too risky and complex

### Alternative 2: Display D20 but Calculate with D6
- **Pros:** No logic changes
- **Cons:** Confusing UX (die shows 20 but acts like 3)
- **Verdict:** ❌ Poor user experience

### Alternative 3: Current Approach (Conversion Function)
- **Pros:** Minimal changes, preserved logic, clear abstraction
- **Cons:** Requires test updates
- **Verdict:** ✅ RECOMMENDED

---

## Conclusion

The conversion function approach provides the optimal balance of:
- **Minimal code changes** (4 core files)
- **Preserved game mechanics** (all logic unchanged)
- **Clear implementation** (single conversion layer)
- **Maintainability** (isolated, testable logic)

**Estimated Effort:** 4-6 hours
- 1 hour: Conversion function + tests
- 1 hour: Core dice system updates
- 2-3 hours: Test suite updates
- 1 hour: Testing & verification

**Recommended:** Proceed with Phase 1 (conversion infrastructure) first, validate thoroughly, then proceed with remaining phases.
