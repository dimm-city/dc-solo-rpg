# Mechanics Refactor Plan: D6 → D20 Dice Module Implementation

**Document Version:** 1.0
**Date:** 2025-11-17
**Purpose:** Comprehensive plan to migrate DC Solo RPG from d6-based Wretched & Alone mechanics to the d20-based Dimm City variant

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current vs. Target Implementation Comparison](#current-vs-target-implementation-comparison)
3. [Critical Changes Required](#critical-changes-required)
4. [Detailed Implementation Plan](#detailed-implementation-plan)
5. [Testing Strategy](#testing-strategy)
6. [Migration Checklist](#migration-checklist)

---

## Executive Summary

This refactor migrates the entire game from **d6-based mechanics to d20-based mechanics** as specified in the "Dimm City: Wretched & Alone — Dice Module (SRD Variant)". This is a **comprehensive overhaul** affecting:

- Core dice rolling (d6 → d20)
- Daily card draw mechanics
- Tower/Stability system (54 resources → 20 stability)
- Salvation/token removal system
- Introduction of Lucid/Surreal state mechanics
- Complete revision of success/failure thresholds

**Impact Level:** HIGH - Affects all core game mechanics
**Backward Compatibility:** NOT REQUIRED (per instructions)
**Risk of Regression:** HIGH - Requires extensive testing

---

## Current vs. Target Implementation Comparison

### 1. Dice System

| Aspect | Current (d6) | Target (d20) |
|--------|-------------|--------------|
| **Dice Type** | d6 (1-6) | d20 (1-20) |
| **Implementation** | `Math.floor(Math.random() * 6) + 1` | `Math.floor(Math.random() * 20) + 1` |
| **Special States** | None | Lucid (roll 20), Surreal (roll 1) |
| **Roll Modifiers** | Bonus counter only | Lucid (2d20 keep high), Surreal (2d20 keep low) |
| **File Location** | `src/lib/stores/gameStore.svelte.js:8-10` | Multiple locations (needs implementation) |

### 2. Daily Card Draw

| Aspect | Current | Target |
|--------|---------|--------|
| **Mechanic** | Direct 1d6 = 1-6 cards | 1d20 with conversion table |
| **Card Ranges** | 1-6 (linear) | 1→1, 2-5→2, 6-10→3, 11-15→4, 16-19→5, 20→6 |
| **Average Cards** | 3.5 cards/round | ~3.5 cards/round (preserved) |
| **Special Effects** | None | Roll 1 → Surreal next roll, Roll 20 → Lucid next roll |
| **File Location** | `gameActions.svelte.js:87-97` | Needs new conversion function |

### 3. Tower/Stability System

| Aspect | Current | Target |
|--------|---------|--------|
| **Starting Value** | 54 resources | 20 stability |
| **Mechanic Name** | "Tower" | "Stability" |
| **Damage Source** | Odd-ranked cards (3,5,7,9) | Same trigger, different damage table |
| **Damage Formula** | `max(roll - bonus, 0)` | Stability Check Table (see below) |
| **Bonus Impact** | Subtracts from damage | NO LONGER APPLIES to stability checks |
| **File Locations** | `gameStore.svelte.js:22`, `gameActions.svelte.js:266-267` | Multiple updates needed |

**Current Damage Formula:**
```javascript
damage = Math.max(roll - bonus, 0);
```

**Target Stability Check Table:**
```
Roll 20:    0 loss, optional +1 temp stability, Lucid next roll
Roll 11-19: 0 loss
Roll 6-10:  -1 stability
Roll 2-5:   -2 stability
Roll 1:     -3 stability, Surreal next roll
```

### 4. Salvation System (Most Complex Change)

#### Current Implementation:

| Aspect | Current |
|--------|---------|
| **Tokens** | 10 (fixed) |
| **Check Frequency** | Once per round after Ace of Hearts revealed |
| **Success Threshold** | Roll 6 OR (roll + bonus = 6) if difficulty > 0 |
| **Success Effect** | Remove 1 token |
| **Failure Effect** | No change |
| **Ace Impact** | Bonus counter helps reach threshold |
| **Final Step** | Final damage roll (1d6) after all tokens removed |

#### Target Implementation:

| Aspect | Target |
|--------|---------|
| **Tokens** | 10 (unchanged) |
| **Check Frequency** | Once per day after Ace of Hearts appears (unchanged) |
| **Success Threshold** | **ACE-DEPENDENT:** 1 Ace=17-20, 2 Aces=14-20, 3 Aces=11-20, 4 Aces=auto |
| **Success Effects** | Roll 20: Remove 2 tokens + Lucid<br>Threshold-19: Remove 1 token |
| **Failure Effects** | 6-(threshold-1): No change<br>2-5: Add 1 token<br>1: Add 2 tokens + Surreal |
| **Ace Impact** | Directly modifies success threshold (not bonus) |
| **Final Step** | Escape when tokens = 0 (no final damage roll mentioned) |

**Critical Difference:** Aces now **modify the success threshold** rather than providing a bonus to the roll. This fundamentally changes the Ace mechanic.

### 5. Bonus Counter System

| Aspect | Current | Target |
|--------|---------|--------|
| **Source** | +1 per Ace (max 4) | Eliminated for stability/salvation |
| **Impact on Damage** | Reduces damage: `max(roll - bonus, 0)` | No longer applies to stability checks |
| **Impact on Success** | Helps reach threshold (roll + bonus = 6) | **Replaced by Ace-dependent thresholds** |
| **Status** | Core mechanic | **REMOVED/REPLACED** |

**CRITICAL:** The bonus counter is **eliminated** in the new system. Aces now work differently:
- **Old:** Aces give bonus → bonus reduces damage and helps success checks
- **New:** Aces modify salvation threshold directly, NO IMPACT on stability damage

### 6. Lucid/Surreal States (NEW)

| Aspect | Target Implementation |
|--------|---------------------|
| **Lucid Trigger** | Roll natural 20 on ANY roll type |
| **Lucid Effect** | Next roll: 2d20, keep highest |
| **Surreal Trigger** | Roll natural 1 on ANY roll type |
| **Surreal Effect** | Next roll: 2d20, keep lowest |
| **Duration** | One roll only (then clears) |
| **Stacking** | Not specified - assume NO |
| **State Storage** | New gameState properties needed |

---

## Critical Changes Required

### Priority 1: Core Dice System

**Files to Modify:**
1. `src/lib/stores/gameStore.svelte.js`
2. `src/lib/stores/diceStore.svelte.js`
3. `src/lib/components/ThreeJSDiceBoxRoller.svelte`

**Changes:**

#### 1.1 Update Random Number Generator

**File:** `src/lib/stores/gameStore.svelte.js:8-10`

**Current:**
```javascript
let getRandomNumber = () => {
    return Math.floor(Math.random() * 6) + 1;
};
```

**Target:**
```javascript
// New d20 generator
let getRandomNumber = () => {
    return Math.floor(Math.random() * 20) + 1;
};

// Optional: Keep d6 generator for backwards compatibility during transition
let getRandomD6 = () => {
    return Math.floor(Math.random() * 6) + 1;
};
```

#### 1.2 Add Lucid/Surreal State Tracking

**File:** `src/lib/stores/gameStore.svelte.js:15-30` (gameState initialization)

**Add new state properties:**
```javascript
let gameState = $state({
    // ... existing properties ...

    // NEW: Lucid/Surreal state tracking
    isLucid: false,        // True if next roll should be 2d20 keep high
    isSurreal: false,      // True if next roll should be 2d20 keep low

    // ... rest of existing properties ...
});
```

#### 1.3 Implement Advantage/Disadvantage Roll Logic

**File:** `src/lib/stores/gameStore.svelte.js` (add new function)

**New function:**
```javascript
/**
 * Roll with Lucid/Surreal modifiers
 * @returns {Object} { roll: number, wasLucid: boolean, wasSurreal: boolean }
 */
let rollWithModifiers = () => {
    let roll1 = Math.floor(Math.random() * 20) + 1;

    // Check for Lucid state (advantage)
    if (gameState.isLucid) {
        const roll2 = Math.floor(Math.random() * 20) + 1;
        roll = Math.max(roll1, roll2);
        logger.debug(`[rollWithModifiers] Lucid roll: ${roll1}, ${roll2} → ${roll}`);
        gameState.isLucid = false; // Clear state after use
        return { roll, wasLucid: true, wasSurreal: false };
    }

    // Check for Surreal state (disadvantage)
    if (gameState.isSurreal) {
        const roll2 = Math.floor(Math.random() * 20) + 1;
        roll = Math.min(roll1, roll2);
        logger.debug(`[rollWithModifiers] Surreal roll: ${roll1}, ${roll2} → ${roll}`);
        gameState.isSurreal = false; // Clear state after use
        return { roll, wasSurreal: true, wasLucid: false };
    }

    // Normal roll
    return { roll: roll1, wasLucid: false, wasSurreal: false };
};
```

#### 1.4 Update 3D Dice Roller

**File:** `src/lib/stores/diceStore.svelte.js:182-199`

**Current:**
```javascript
export async function rollDice(value = null) {
    const rollString = value ? `1d6@${value}` : '1d6';
    const result = await diceBoxInstance.roll(rollString);
    return result.total;
}
```

**Target:**
```javascript
export async function rollDice(value = null, options = {}) {
    const { isLucid = false, isSurreal = false } = options;

    let rollString;

    if (isLucid || isSurreal) {
        // Roll 2d20 for advantage/disadvantage
        // Note: DiceBox will show both dice, we handle keep high/low in code
        rollString = value ? `2d20@${value}` : '2d20';
    } else {
        // Normal roll
        rollString = value ? `1d20@${value}` : '1d20';
    }

    const result = await diceBoxInstance.roll(rollString);
    return result.total;
}
```

**Note:** Verify `@3d-dice/dice-box-threejs` supports d20 dice. May need configuration update.

### Priority 2: Daily Card Draw Conversion

**Files to Modify:**
1. `src/lib/stores/gameActions.svelte.js:87-97`

**Changes:**

#### 2.1 Create D20 to Card Count Conversion Function

**File:** `src/lib/stores/gameActions.svelte.js` (add new function)

```javascript
/**
 * Convert d20 roll to number of cards to draw
 * Per Dimm City D20 Module specification
 * @param {number} roll - D20 roll result (1-20)
 * @returns {number} Number of cards to draw (1-6)
 */
function convertD20ToCardCount(roll) {
    if (roll === 1) return 1;
    if (roll >= 2 && roll <= 5) return 2;
    if (roll >= 6 && roll <= 10) return 3;
    if (roll >= 11 && roll <= 15) return 4;
    if (roll >= 16 && roll <= 19) return 5;
    if (roll === 20) return 6;

    // Fallback (should never happen)
    logger.error(`[convertD20ToCardCount] Invalid roll: ${roll}`);
    return 3;
}
```

#### 2.2 Update rollForTasks Function

**File:** `src/lib/stores/gameActions.svelte.js:87-97`

**Current:**
```javascript
export async function rollForTasks() {
    const roll = gameState.getRandomNumber();

    gameState.cardsToDraw = roll;
    gameState.pendingUpdates.diceRoll = roll;
    gameState.currentCard = null;

    logger.debug(`[rollForTasks] Dice rolled: ${roll}, setting cardsToDraw to ${roll}`);
    return roll;
}
```

**Target:**
```javascript
export async function rollForTasks() {
    // Roll d20 with Lucid/Surreal modifiers
    const { roll, wasLucid, wasSurreal } = gameState.rollWithModifiers();

    // Convert d20 result to card count
    const cardCount = convertD20ToCardCount(roll);

    gameState.cardsToDraw = cardCount;
    gameState.pendingUpdates.diceRoll = roll; // Store actual d20 roll
    gameState.currentCard = null;

    // Handle Lucid/Surreal state changes
    if (roll === 20) {
        gameState.isLucid = true;
        logger.debug(`[rollForTasks] Natural 20! Next roll will be Lucid (advantage)`);
    } else if (roll === 1) {
        gameState.isSurreal = true;
        logger.debug(`[rollForTasks] Natural 1! Next roll will be Surreal (disadvantage)`);
    }

    logger.debug(`[rollForTasks] D20 rolled: ${roll} (${wasLucid ? 'LUCID' : wasSurreal ? 'SURREAL' : 'normal'}) → ${cardCount} cards`);
    return roll;
}
```

### Priority 3: Tower → Stability System Overhaul

**Files to Modify:**
1. `src/lib/stores/gameStore.svelte.js:22`
2. `src/lib/stores/gameInit.js:88`
3. `src/lib/stores/gameActions.svelte.js` (multiple functions)
4. All test files referencing tower values

**Changes:**

#### 3.1 Update Starting Stability

**File:** `src/lib/stores/gameStore.svelte.js:22`

**Current:**
```javascript
tower: 54,
```

**Target:**
```javascript
tower: 20, // Now represents "Stability" in d20 system
```

**File:** `src/lib/stores/gameInit.js:88`

**Current:**
```javascript
tower: 54, // Always start at full health, damage applied interactively
```

**Target:**
```javascript
tower: 20, // Always start at 20 Stability (Dimm City d20 system)
```

#### 3.2 Implement Stability Check Logic

**File:** `src/lib/stores/gameActions.svelte.js` (add new function)

```javascript
/**
 * Calculate stability loss based on d20 roll
 * Per Dimm City D20 Module specification
 * @param {number} roll - D20 roll result (1-20)
 * @returns {Object} { loss: number, gainedLucid: boolean, gainedSurreal: boolean, optionalGain: number }
 */
function calculateStabilityLoss(roll) {
    if (roll === 20) {
        return {
            loss: 0,
            gainedLucid: true,
            gainedSurreal: false,
            optionalGain: 1 // "optional +1 temp stability"
        };
    }
    if (roll >= 11 && roll <= 19) {
        return { loss: 0, gainedLucid: false, gainedSurreal: false, optionalGain: 0 };
    }
    if (roll >= 6 && roll <= 10) {
        return { loss: 1, gainedLucid: false, gainedSurreal: false, optionalGain: 0 };
    }
    if (roll >= 2 && roll <= 5) {
        return { loss: 2, gainedLucid: false, gainedSurreal: false, optionalGain: 0 };
    }
    if (roll === 1) {
        return {
            loss: 3,
            gainedLucid: false,
            gainedSurreal: true,
            optionalGain: 0
        };
    }

    // Fallback
    logger.error(`[calculateStabilityLoss] Invalid roll: ${roll}`);
    return { loss: 0, gainedLucid: false, gainedSurreal: false, optionalGain: 0 };
}
```

#### 3.3 Replace Failure Check Logic

**File:** `src/lib/stores/gameActions.svelte.js:248-275`

**Current:**
```javascript
export function getFailureCheckRoll() {
    return gameState.getRandomNumber();
}

export function applyFailureCheckResult(result) {
    gameState.pendingUpdates.diceRoll = result;

    // Calculate damage (but don't apply yet)
    const blocksToRemove = Math.max(result - gameState.bonus, 0);
    gameState.pendingUpdates.towerDamage = blocksToRemove;
}
```

**Target:**
```javascript
export function getFailureCheckRoll() {
    // Roll d20 with Lucid/Surreal modifiers
    const { roll, wasLucid, wasSurreal } = gameState.rollWithModifiers();

    logger.debug(`[getFailureCheckRoll] D20 roll: ${roll} (${wasLucid ? 'LUCID' : wasSurreal ? 'SURREAL' : 'normal'})`);
    return roll;
}

export function applyFailureCheckResult(result) {
    gameState.pendingUpdates.diceRoll = result;

    // Calculate stability loss using d20 table (bonus no longer applies)
    const { loss, gainedLucid, gainedSurreal, optionalGain } = calculateStabilityLoss(result);

    gameState.pendingUpdates.towerDamage = loss;

    // Handle Lucid/Surreal state changes
    if (gainedLucid) {
        gameState.isLucid = true;
        logger.debug(`[applyFailureCheckResult] Natural 20! Next roll will be Lucid`);
    } else if (gainedSurreal) {
        gameState.isSurreal = true;
        logger.debug(`[applyFailureCheckResult] Natural 1! Next roll will be Surreal`);
    }

    // Note: optionalGain not automatically applied - could be player choice
    // For now, auto-apply it
    if (optionalGain > 0) {
        gameState.pendingUpdates.towerGain = optionalGain;
    }

    logger.debug(`[applyFailureCheckResult] Stability loss: ${loss}, optional gain: ${optionalGain}`);
}
```

#### 3.4 Update Pending Damage Application

**File:** `src/lib/stores/gameActions.svelte.js:278-321`

**Current:**
```javascript
export function applyPendingDiceRoll() {
    // Apply dice roll
    gameState.diceRoll = gameState.pendingUpdates.diceRoll;

    // Apply tower damage if any
    if (gameState.pendingUpdates.towerDamage !== null && gameState.pendingUpdates.towerDamage > 0) {
        const blocksToRemove = gameState.pendingUpdates.towerDamage;
        gameState.tower -= blocksToRemove;

        // ... rest of logic
    }
}
```

**Target:**
```javascript
export function applyPendingDiceRoll() {
    // Apply dice roll
    gameState.diceRoll = gameState.pendingUpdates.diceRoll;

    // Apply stability gain if any (from natural 20)
    if (gameState.pendingUpdates.towerGain !== null && gameState.pendingUpdates.towerGain > 0) {
        const stabilityGain = gameState.pendingUpdates.towerGain;
        gameState.tower += stabilityGain;
        logger.debug(`[applyPendingDiceRoll] Stability gained: ${stabilityGain}, new stability: ${gameState.tower}`);
        gameState.pendingUpdates.towerGain = null;
    }

    // Apply stability loss if any
    if (gameState.pendingUpdates.towerDamage !== null && gameState.pendingUpdates.towerDamage > 0) {
        const stabilityLoss = gameState.pendingUpdates.towerDamage;
        gameState.tower -= stabilityLoss;

        logger.debug(`[applyPendingDiceRoll] Stability lost: ${stabilityLoss}, remaining: ${gameState.tower}`);

        // Check for game over (stability depleted)
        if (gameState.tower <= 0) {
            gameState.tower = 0;
            gameState.status = gameState.config.labels?.failureCheckLoss ?? 'Stability collapsed completely';
            gameState.gameOver = true;
            transitionTo('gameOver');
            return;
        }

        gameState.pendingUpdates.towerDamage = null;
    }
}
```

### Priority 4: Salvation System Overhaul (Most Complex)

**Files to Modify:**
1. `src/lib/stores/gameActions.svelte.js:391-451` (successCheck function)
2. `src/lib/stores/gameActions.svelte.js:516-597` (final damage roll - possibly remove)
3. `src/lib/stores/gameStore.svelte.js` (state tracking for Aces revealed count)

**Changes:**

#### 4.1 Track Number of Aces Revealed

**File:** `src/lib/stores/gameStore.svelte.js:15-30`

**Add new state property:**
```javascript
let gameState = $state({
    // ... existing properties ...

    // NEW: Track how many Aces have been revealed (for salvation threshold)
    acesRevealed: 0, // 0-4

    // ... rest of existing properties ...
});
```

#### 4.2 Update Ace Tracking in drawCard

**File:** `src/lib/stores/gameActions.svelte.js:156-162`

**Current:**
```javascript
// Track aces - store in pending state
if (card.card === 'A') {
    gameState.pendingUpdates.bonusChange = 1;
    if (card.suit === 'hearts') {
        gameState.aceOfHeartsRevealed = true;
    }
}
```

**Target:**
```javascript
// Track aces - store in pending state
if (card.card === 'A') {
    // NO LONGER: gameState.pendingUpdates.bonusChange = 1;
    // Instead, track Ace count for salvation threshold
    gameState.pendingUpdates.aceChange = 1;

    if (card.suit === 'hearts') {
        gameState.aceOfHeartsRevealed = true;
    }
}
```

#### 4.3 Apply Ace Count in confirmCard

**File:** `src/lib/stores/gameActions.svelte.js:207-211`

**Current:**
```javascript
if (gameState.pendingUpdates.bonusChange) {
    gameState.bonus += gameState.pendingUpdates.bonusChange;
    gameState.pendingUpdates.bonusChange = null;
}
```

**Target:**
```javascript
// Replace bonus system with Ace count tracking
if (gameState.pendingUpdates.aceChange) {
    gameState.acesRevealed += gameState.pendingUpdates.aceChange;
    gameState.pendingUpdates.aceChange = null;
    logger.debug(`[confirmCard] Aces revealed: ${gameState.acesRevealed}/4`);
}
```

#### 4.4 Implement Ace-Dependent Threshold System

**File:** `src/lib/stores/gameActions.svelte.js` (add new function)

```javascript
/**
 * Get salvation success threshold based on number of Aces revealed
 * Per Dimm City D20 Module specification
 * @param {number} acesRevealed - Number of Aces revealed (0-4)
 * @returns {number} Minimum roll needed for success (1-20, or 0 for auto-success)
 */
function getSalvationThreshold(acesRevealed) {
    switch (acesRevealed) {
        case 1: return 17; // Success on 17-20 (~20% chance)
        case 2: return 14; // Success on 14-20 (~35% chance)
        case 3: return 11; // Success on 11-20 (~50% chance)
        case 4: return 0;  // Automatic success
        default:
            logger.error(`[getSalvationThreshold] Invalid Aces count: ${acesRevealed}`);
            return 20; // Impossible if no Aces
    }
}

/**
 * Calculate salvation check results based on d20 roll and Ace threshold
 * @param {number} roll - D20 roll result (1-20)
 * @param {number} threshold - Success threshold from getSalvationThreshold
 * @returns {Object} { tokenChange: number, gainedLucid: boolean, gainedSurreal: boolean }
 */
function calculateSalvationResult(roll, threshold) {
    // Auto-success if 4 Aces (threshold = 0)
    if (threshold === 0) {
        return {
            tokenChange: -1,
            gainedLucid: false,
            gainedSurreal: false
        };
    }

    // Natural 20: Remove 2 tokens + Lucid
    if (roll === 20) {
        return {
            tokenChange: -2,
            gainedLucid: true,
            gainedSurreal: false
        };
    }

    // Success (threshold to 19): Remove 1 token
    if (roll >= threshold && roll <= 19) {
        return {
            tokenChange: -1,
            gainedLucid: false,
            gainedSurreal: false
        };
    }

    // Partial failure (6 to threshold-1): No change
    if (roll >= 6 && roll < threshold) {
        return {
            tokenChange: 0,
            gainedLucid: false,
            gainedSurreal: false
        };
    }

    // Failure (2-5): Add 1 token
    if (roll >= 2 && roll <= 5) {
        return {
            tokenChange: 1,
            gainedLucid: false,
            gainedSurreal: false
        };
    }

    // Critical failure (1): Add 2 tokens + Surreal
    if (roll === 1) {
        return {
            tokenChange: 2,
            gainedLucid: false,
            gainedSurreal: true
        };
    }

    // Fallback
    logger.error(`[calculateSalvationResult] Unexpected roll: ${roll}, threshold: ${threshold}`);
    return { tokenChange: 0, gainedLucid: false, gainedSurreal: false };
}
```

#### 4.5 Replace Success Check Function

**File:** `src/lib/stores/gameActions.svelte.js:391-451`

**Current:**
```javascript
export function successCheck() {
    const roll = gameState.getRandomNumber();

    gameState.pendingUpdates.diceRoll = roll;

    if (roll === 6 || (gameState.config.difficulty > 0 && roll + gameState.bonus === 6)) {
        gameState.pendingUpdates.tokenChange = -1;
    } else {
        gameState.pendingUpdates.tokenChange = 0;
    }

    return roll;
}
```

**Target:**
```javascript
export function successCheck() {
    // Roll d20 with Lucid/Surreal modifiers
    const { roll, wasLucid, wasSurreal } = gameState.rollWithModifiers();

    gameState.pendingUpdates.diceRoll = roll;

    // Get threshold based on Aces revealed
    const threshold = getSalvationThreshold(gameState.acesRevealed);

    // Calculate result
    const { tokenChange, gainedLucid, gainedSurreal } = calculateSalvationResult(roll, threshold);

    gameState.pendingUpdates.tokenChange = tokenChange;

    // Handle Lucid/Surreal state changes FROM THIS ROLL
    if (gainedLucid) {
        gameState.isLucid = true;
        logger.debug(`[successCheck] Natural 20! Next roll will be Lucid`);
    } else if (gainedSurreal) {
        gameState.isSurreal = true;
        logger.debug(`[successCheck] Natural 1! Next roll will be Surreal`);
    }

    logger.debug(`[successCheck] D20 roll: ${roll} (${wasLucid ? 'LUCID' : wasSurreal ? 'SURREAL' : 'normal'}), threshold: ${threshold}, token change: ${tokenChange}`);

    return roll;
}
```

#### 4.6 Update Success Check Application

**File:** `src/lib/stores/gameActions.svelte.js:413-451`

**Current:**
```javascript
export function applyPendingSuccessCheck() {
    gameState.diceRoll = gameState.pendingUpdates.diceRoll;

    if (gameState.pendingUpdates.tokenChange !== null && gameState.pendingUpdates.tokenChange !== 0) {
        gameState.tokens += gameState.pendingUpdates.tokenChange;
    }

    if (gameState.tokens === 0) {
        transitionTo('finalDamageRoll');
    } else {
        startRound();
    }
}
```

**Target:**
```javascript
export function applyPendingSuccessCheck() {
    gameState.diceRoll = gameState.pendingUpdates.diceRoll;

    // Apply token change (can be negative, zero, or positive)
    if (gameState.pendingUpdates.tokenChange !== null) {
        const oldTokens = gameState.tokens;
        gameState.tokens += gameState.pendingUpdates.tokenChange;

        // Ensure tokens don't go below 0 or above reasonable limit (e.g., 20)
        gameState.tokens = Math.max(0, Math.min(gameState.tokens, 20));

        logger.debug(`[applyPendingSuccessCheck] Tokens: ${oldTokens} → ${gameState.tokens} (change: ${gameState.pendingUpdates.tokenChange})`);

        gameState.pendingUpdates.tokenChange = null;
    }

    // Check for escape condition
    if (gameState.tokens === 0) {
        // VICTORY - No final damage roll in new system
        gameState.win = true;
        gameState.gameOver = true;
        gameState.status = gameState.config.labels?.successCheckWin ??
            'Escape achieved! Against all odds, you survived.';
        transitionTo('gameOver');
    } else {
        // Continue game
        startRound();
    }
}
```

#### 4.7 Remove or Modify Final Damage Roll

**File:** `src/lib/stores/gameActions.svelte.js:516-597`

**Decision Required:** The new specification does NOT mention a final damage roll after removing all tokens. The document states "Escape occurs when tokens = 0" without additional tests.

**Options:**

**Option A: Remove Final Damage Roll Entirely**
- Delete `performFinalDamageRoll` function
- Delete `applyPendingFinalDamageRoll` function
- Remove `finalDamageRoll` state from transitions
- Victory happens immediately when tokens reach 0

**Option B: Keep as Optional Mode**
- Preserve existing code
- Add difficulty setting to enable/disable final damage roll
- Document as "classic mode" vs "d20 mode"

**Recommendation:** Option A (remove entirely) to match specification exactly.

### Priority 5: Remove Bonus Counter System

**Files to Modify:**
1. `src/lib/stores/gameStore.svelte.js` (remove bonus property)
2. `src/lib/stores/gameActions.svelte.js` (remove all bonus references)
3. All test files referencing bonus

**Changes:**

#### 5.1 Remove Bonus from Game State

**File:** `src/lib/stores/gameStore.svelte.js:25`

**Current:**
```javascript
bonus: 0,
```

**Target:**
```javascript
// REMOVED - bonus counter no longer exists in d20 system
// Aces now modify salvation threshold instead
```

#### 5.2 Remove Bonus from Pending Updates

**File:** `src/lib/stores/gameStore.svelte.js:35-45`

**Current:**
```javascript
pendingUpdates: {
    bonusChange: null,
    // ... other properties
}
```

**Target:**
```javascript
pendingUpdates: {
    aceChange: null, // Tracks Ace reveals for threshold modification
    towerGain: null, // NEW - for stability gains (natural 20 on stability checks)
    // ... other properties
}
```

#### 5.3 Remove Bonus References in All Functions

**Files:** Search entire codebase for `bonus` and remove/replace:
- `gameState.bonus` → Remove or replace with appropriate logic
- `gameState.pendingUpdates.bonusChange` → Replace with `aceChange`

**Key locations:**
- `src/lib/stores/gameActions.svelte.js:156-162` (Ace tracking)
- `src/lib/stores/gameActions.svelte.js:207-211` (confirmCard)
- `src/lib/stores/gameActions.svelte.js:266-267` (damage calculation)
- `src/lib/stores/gameActions.svelte.js:398-401` (success check)

### Priority 6: Update Difficulty System

**Files to Modify:**
1. `src/lib/configuration/DifficultyLevels.js`
2. `src/lib/stores/gameInit.js` (difficulty impact on initialization)
3. `src/lib/stores/gameActions.svelte.js` (remove difficulty impact on success)

**Changes:**

#### 6.1 Clarify Difficulty Levels

**File:** `src/lib/configuration/DifficultyLevels.js`

**Current:**
```javascript
class DifficultyLevels {
    constructor() {
        this.IMPOSSIBLE = 0;
        this.VERY_HARD = 1;
        this.HARD = 2;
        this.MEDIUM = 3;
        this.EASY = 4;
    }
}
```

**Analysis:** The new specification doesn't mention difficulty modes explicitly. The old system used difficulty to:
1. Enable bonus help on success checks (difficulty > 0)
2. Easy mode (difficulty = 0) removes Ace of Hearts

**Target Decision Required:**
- Keep difficulty system for other purposes?
- Remove entirely since salvation thresholds are now Ace-dependent?
- Repurpose for other modifiers (starting stability, etc.)?

**Recommendation:** Remove difficulty impact on success checks since that's now Ace-dependent. Optionally keep for other modifiers.

#### 6.2 Remove Difficulty from Success Check

**File:** `src/lib/stores/gameActions.svelte.js:398-401`

**Current:**
```javascript
if (roll === 6 || (gameState.config.difficulty > 0 && roll + gameState.bonus === 6)) {
    gameState.pendingUpdates.tokenChange = -1;
}
```

**Target:**
```javascript
// REMOVED - success is now purely Ace-threshold based
// See new successCheck() implementation in Priority 4.5
```

---

## Detailed Implementation Plan

### Phase 1: Foundation (Core Dice System)

**Estimated Effort:** 2-3 hours

**Steps:**
1. Update `gameStore.svelte.js`:
   - Change `getRandomNumber()` to return 1-20
   - Add `rollWithModifiers()` function
   - Add `isLucid` and `isSurreal` state properties
   - Add `acesRevealed` state property
   - Remove `bonus` state property

2. Update `diceStore.svelte.js`:
   - Modify `rollDice()` to support d20
   - Add support for advantage/disadvantage (2d20)
   - Verify `@3d-dice/dice-box-threejs` compatibility

3. Create helper functions:
   - `convertD20ToCardCount(roll)`
   - `calculateStabilityLoss(roll)`
   - `getSalvationThreshold(acesRevealed)`
   - `calculateSalvationResult(roll, threshold)`

**Testing:**
- Unit test `rollWithModifiers()` with Lucid/Surreal states
- Unit test `convertD20ToCardCount()` for all values 1-20
- Unit test `calculateStabilityLoss()` for all values 1-20
- Verify d20 dice render correctly in 3D

### Phase 2: Card Draw System

**Estimated Effort:** 1-2 hours

**Steps:**
1. Update `rollForTasks()`:
   - Use `rollWithModifiers()`
   - Apply `convertD20ToCardCount()`
   - Handle Lucid/Surreal state changes
   - Update logging

2. Update UI components:
   - Ensure dice display shows d20 results
   - Update any text mentioning "1-6 cards"

**Testing:**
- Unit test card draw conversion for all d20 values
- Unit test Lucid/Surreal triggers (1 and 20)
- Integration test full round with card drawing

### Phase 3: Stability System

**Estimated Effort:** 3-4 hours

**Steps:**
1. Update starting stability:
   - `gameStore.svelte.js`: Change 54 → 20
   - `gameInit.js`: Change 54 → 20

2. Update failure check logic:
   - `getFailureCheckRoll()`: Use `rollWithModifiers()`
   - `applyFailureCheckResult()`: Use `calculateStabilityLoss()`
   - `applyPendingDiceRoll()`: Handle stability gains (optional +1)

3. Update initial damage:
   - `performInitialDamageRoll()`: Apply d20 stability table
   - Consider if initial damage is still needed

4. Update UI:
   - Rename "Tower" → "Stability" in displays
   - Update visual representations for 0-20 range

**Testing:**
- Unit test stability loss for all d20 values
- Unit test stability gains (natural 20)
- Unit test Lucid/Surreal triggers
- Integration test full game with stability depletion
- Verify game over at stability = 0

### Phase 4: Salvation System

**Estimated Effort:** 4-5 hours (most complex)

**Steps:**
1. Update Ace tracking:
   - `drawCard()`: Track `acesRevealed` instead of bonus
   - `confirmCard()`: Apply Ace count

2. Implement threshold system:
   - Add `getSalvationThreshold()` function
   - Add `calculateSalvationResult()` function

3. Update success check:
   - `successCheck()`: Complete rewrite using threshold system
   - Handle token additions (failures)
   - Handle Lucid/Surreal triggers

4. Update success application:
   - `applyPendingSuccessCheck()`: Handle positive/negative token changes
   - Add bounds checking (0-20 tokens)
   - Victory condition when tokens = 0

5. Remove final damage roll:
   - Delete `performFinalDamageRoll()` (or mark deprecated)
   - Delete `applyPendingFinalDamageRoll()` (or mark deprecated)
   - Remove from transition graph
   - Update tests

**Testing:**
- Unit test threshold calculation for 1-4 Aces
- Unit test salvation results for all d20 values at each threshold
- Unit test token addition on failures
- Unit test Lucid/Surreal triggers
- Integration test full salvation flow from 0→4 Aces
- Edge case: Tokens increasing beyond 10
- Edge case: 4 Aces revealed (auto-success)

### Phase 5: Cleanup

**Estimated Effort:** 2-3 hours

**Steps:**
1. Remove bonus system:
   - Search and remove all `gameState.bonus` references
   - Remove `bonusChange` from pending updates
   - Update all related tests

2. Update difficulty system:
   - Remove difficulty from success checks
   - Document remaining difficulty uses (if any)

3. Update labels and UI text:
   - "Tower" → "Stability" throughout
   - Update any references to "blocks" or "tower falling"
   - Update help text/tutorials

4. Update documentation:
   - `docs/wretched-alone-mechanics-guide.md`
   - README if applicable
   - Inline code comments

**Testing:**
- Full regression suite
- All existing tests updated to d20 system

### Phase 6: Comprehensive Testing

**Estimated Effort:** 3-4 hours

**Test Coverage:**

1. **Unit Tests:**
   - All new helper functions
   - All modified game actions
   - State management (Lucid/Surreal)
   - Ace tracking

2. **Integration Tests:**
   - Complete game flow from start to victory
   - Complete game flow from start to each loss condition
   - Lucid/Surreal state transitions
   - Edge cases (see below)

3. **Edge Cases:**
   - Rolling 20 multiple times in a row (Lucid chain)
   - Rolling 1 multiple times in a row (Surreal chain)
   - Tokens increasing beyond starting value
   - 4 Aces revealed (auto-success salvation)
   - Stability reaching exactly 0
   - Stability gain on natural 20 (optional +1)

---

## Testing Strategy

### Test Files to Update

All existing test files need updates:

1. `src/lib/stores/wretchedAloneMechanics.test.js`
   - Update all expected values (54 tower → 20 stability)
   - Update damage calculations (bonus removed)
   - Update success check thresholds (Ace-based)
   - Add Lucid/Surreal tests

2. `src/lib/stores/cardDrawing.test.js`
   - Update card count expectations (d20 conversion)
   - Add Lucid/Surreal trigger tests

3. `src/lib/stores/gameBalance.test.js`
   - Recalculate expected win rates with d20 system
   - Update damage probability tables

4. `src/lib/stores/finalDamageRoll.test.js`
   - Either remove entirely OR mark as deprecated
   - Update to reflect new victory condition

5. `src/lib/stores/gameActions.test.js`
   - Update all action tests for d20 mechanics

6. `src/lib/stores/gameFlow.test.js`
   - Update full game flow tests

### New Tests Needed

Create new test file: `src/lib/stores/d20Mechanics.test.js`

**Test coverage:**
```javascript
describe('D20 Mechanics', () => {
    describe('Lucid/Surreal States', () => {
        it('should set Lucid state on natural 20')
        it('should set Surreal state on natural 1')
        it('should roll 2d20 keep high when Lucid')
        it('should roll 2d20 keep low when Surreal')
        it('should clear Lucid state after one roll')
        it('should clear Surreal state after one roll')
    });

    describe('D20 to Card Count Conversion', () => {
        it('should return 1 card for roll of 1')
        it('should return 2 cards for rolls 2-5')
        it('should return 3 cards for rolls 6-10')
        it('should return 4 cards for rolls 11-15')
        it('should return 5 cards for rolls 16-19')
        it('should return 6 cards for roll of 20')
    });

    describe('Stability Loss Calculation', () => {
        it('should return 0 loss for natural 20 and set Lucid')
        it('should return 0 loss for rolls 11-19')
        it('should return -1 for rolls 6-10')
        it('should return -2 for rolls 2-5')
        it('should return -3 for natural 1 and set Surreal')
        it('should provide optional +1 gain for natural 20')
    });

    describe('Salvation Thresholds', () => {
        it('should return threshold 17 for 1 Ace')
        it('should return threshold 14 for 2 Aces')
        it('should return threshold 11 for 3 Aces')
        it('should return threshold 0 for 4 Aces (auto-success)')
    });

    describe('Salvation Results', () => {
        it('should remove 2 tokens on natural 20')
        it('should remove 1 token on threshold success')
        it('should not change tokens on near-miss (6 to threshold-1)')
        it('should add 1 token on failure (2-5)')
        it('should add 2 tokens on critical failure (1)')
    });
});
```

### Regression Testing Checklist

- [ ] Game initializes with 20 stability
- [ ] Cards are drawn using d20 conversion table
- [ ] Odd cards trigger stability checks
- [ ] Stability decreases according to d20 table
- [ ] Lucid state triggers on natural 20
- [ ] Surreal state triggers on natural 1
- [ ] Lucid/Surreal states apply to next roll only
- [ ] Aces increment `acesRevealed` counter
- [ ] Salvation threshold changes based on Aces
- [ ] Token removal works with new system
- [ ] Token addition works on failures
- [ ] Victory occurs when tokens reach 0
- [ ] Game over occurs when stability reaches 0
- [ ] Game over occurs when 4 Kings revealed
- [ ] Dice animations work with d20
- [ ] UI displays correct values (stability, Aces, etc.)

---

## Migration Checklist

### Pre-Implementation

- [ ] Review complete plan with stakeholders
- [ ] Decide on final damage roll (keep or remove)
- [ ] Decide on difficulty system (keep, remove, or repurpose)
- [ ] Verify `@3d-dice/dice-box-threejs` supports d20
- [ ] Create feature branch: `feature/d20-mechanics-refactor`
- [ ] Document current test baseline (all tests passing)

### Implementation Phase 1: Foundation

- [ ] Update `getRandomNumber()` to return 1-20
- [ ] Implement `rollWithModifiers()` function
- [ ] Add `isLucid` and `isSurreal` state properties
- [ ] Add `acesRevealed` state property
- [ ] Create all helper functions
- [ ] Update `diceStore.svelte.js` for d20
- [ ] Write unit tests for new functions
- [ ] Verify tests pass

### Implementation Phase 2: Card Draw

- [ ] Update `rollForTasks()` implementation
- [ ] Update related UI components
- [ ] Write unit tests for card draw conversion
- [ ] Write integration tests
- [ ] Verify tests pass

### Implementation Phase 3: Stability

- [ ] Change starting stability to 20
- [ ] Update `getFailureCheckRoll()`
- [ ] Update `applyFailureCheckResult()`
- [ ] Update `applyPendingDiceRoll()`
- [ ] Update initial damage roll
- [ ] Update UI labels (Tower → Stability)
- [ ] Write unit tests for stability system
- [ ] Write integration tests
- [ ] Verify tests pass

### Implementation Phase 4: Salvation

- [ ] Update Ace tracking in `drawCard()`
- [ ] Update Ace application in `confirmCard()`
- [ ] Implement threshold calculation
- [ ] Rewrite `successCheck()` function
- [ ] Update `applyPendingSuccessCheck()`
- [ ] Remove/deprecate final damage roll
- [ ] Update transition graph
- [ ] Write comprehensive unit tests
- [ ] Write integration tests
- [ ] Verify tests pass

### Implementation Phase 5: Cleanup

- [ ] Remove all bonus references
- [ ] Update difficulty system
- [ ] Update all UI text and labels
- [ ] Update documentation
- [ ] Remove deprecated code
- [ ] Update all existing tests
- [ ] Verify full test suite passes

### Implementation Phase 6: Testing

- [ ] Run complete regression suite
- [ ] Manual QA testing
- [ ] Test all edge cases
- [ ] Performance testing (if applicable)
- [ ] Cross-browser testing (if web-based)
- [ ] Document any known issues

### Post-Implementation

- [ ] Code review
- [ ] Update CHANGELOG
- [ ] Update version number (major version bump recommended)
- [ ] Merge to main branch
- [ ] Deploy to production
- [ ] Monitor for issues
- [ ] Update game creator documentation

---

## Risk Assessment

### High Risk Areas

1. **Salvation System Rewrite**
   - **Risk:** Complex logic with many edge cases
   - **Mitigation:** Extensive unit testing, manual QA

2. **Lucid/Surreal State Management**
   - **Risk:** State transitions could be buggy
   - **Mitigation:** Clear state machine logic, comprehensive tests

3. **UI/UX Changes**
   - **Risk:** Players confused by different mechanics
   - **Mitigation:** Clear in-game tutorials, updated documentation

4. **Test Coverage**
   - **Risk:** Missing edge cases causing runtime errors
   - **Mitigation:** Comprehensive test plan, QA testing

### Breaking Changes

- **All save games from old version will be incompatible**
  - Old: 54 tower, bonus counter, d6 mechanics
  - New: 20 stability, Ace thresholds, d20 mechanics
  - **Action Required:** Clear save data or implement migration

- **Game balance completely changed**
  - Win rates will differ
  - Game difficulty curve altered
  - **Action Required:** Playtest and adjust if needed

---

## Open Questions / Decisions Needed

1. **Final Damage Roll:**
   - Remove entirely (matches spec)?
   - Keep as optional mode?
   - **Recommendation:** Remove

2. **Difficulty System:**
   - Remove entirely (not in spec)?
   - Repurpose for other modifiers?
   - **Recommendation:** Keep for future flexibility

3. **Optional Stability Gain:**
   - Auto-apply +1 on natural 20?
   - Player choice?
   - **Recommendation:** Auto-apply for simplicity

4. **Token Increase Limit:**
   - Cap at 20 tokens maximum?
   - No limit?
   - **Recommendation:** Cap at 20

5. **4 Aces Auto-Success:**
   - Still roll for narrative/Lucid/Surreal?
   - Skip roll entirely?
   - **Recommendation:** Still roll but always succeed

6. **Save Game Migration:**
   - Attempt migration?
   - Force clear?
   - **Recommendation:** Force clear (simpler)

---

## Estimated Total Effort

**Development:** 15-20 hours
**Testing:** 5-8 hours
**Documentation:** 2-3 hours
**Total:** 22-31 hours

**Complexity:** HIGH
**Risk:** MEDIUM-HIGH
**Impact:** CRITICAL (affects all core mechanics)

---

## Conclusion

This refactor represents a **complete overhaul** of the game's core mechanics. The changes are extensive but well-defined by the specification. The key challenges are:

1. Implementing Lucid/Surreal state management correctly
2. Rewriting the salvation system with Ace-dependent thresholds
3. Updating all tests to reflect new mechanics
4. Ensuring no regressions in game flow

**Recommended Approach:**
- Implement in phases as outlined
- Test thoroughly after each phase
- Use feature flags if deploying incrementally
- Document all changes clearly
- Plan for comprehensive QA before release

**Success Criteria:**
- All tests passing
- Game playable from start to all win/loss conditions
- Lucid/Surreal states working correctly
- Ace-dependent thresholds functioning as specified
- UI properly updated
- Documentation complete
