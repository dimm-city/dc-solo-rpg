# $effect Loop Investigation - Round 2

## Date: 2025-11-19 (Second Pass)

## User Report
"We are still seeing issues with effect loops" - despite previous fixes

## Files to Check
Found 11 files with $effect usage (excluding tests):
1. AudioPlayer.svelte
2. CardDeck.svelte
3. ConfirmModal.svelte
4. DiceThemePicker.svelte
5. GameScreen.svelte
6. GameSelector.svelte
7. Game.svelte
8. JournalEntry.svelte
9. SettingsModal.svelte
10. useInstructionsPreference.svelte.js
11. useStoryNavigation.svelte.js

**Note:** OverlayModal.svelte (user opened) has NO $effect - clean ✅

## Red Flags to Look For

Based on lessons learned:
1. ❌ Mutating $state in cleanup functions
2. ❌ Chained $effects (Effect A updates state → Effect B reads it)
3. ❌ Missing guards on $effects that modify state
4. ❌ Using $state for non-reactive values
5. ❌ $effect without dependencies (runs every tick)
6. ❌ Async operations mutating state without guards
7. ❌ Reading and writing same $state in one $effect

## Investigation Results

### ❌ CRITICAL ISSUE FOUND: CardDeck.svelte

**File:** `src/lib/components/CardDeck.svelte`
**Line:** 106
**Issue:** `lastRevealedCardId` declared as `$state('')` but used as a guard variable

**Problem:**
```javascript
let lastRevealedCardId = $state('');  // ❌ Reactive state

$effect(() => {
    if (animationStage === 'revealed' && card) {
        const cardId = `${card.card}-${card.suit}`;

        if (cardId !== lastRevealedCardId) {  // ← Reads $state
            lastRevealedCardId = cardId;  // ← Writes $state ❌ REACTIVE LOOP!
            // ... TTS logic
        }
    } else if (animationStage !== 'revealed') {
        lastRevealedCardId = '';  // ← Writes $state ❌ REACTIVE LOOP!
    }
});
```

**Why This Causes Loops:**
1. Effect reads `lastRevealedCardId` (creates reactive dependency)
2. Effect writes `lastRevealedCardId` (triggers re-run due to dependency)
3. Even with guard check, the reactive dependency exists
4. Writing to $state in effect creates feedback loop

**Solution:**
Change to plain variable (same fix as autoPlayCanceller):
```javascript
let lastRevealedCardId = '';  // ✅ Plain variable - no reactive dependency
```

**Lesson:** Guard variables used for comparison logic should NOT be $state. Only use $state for values that need to trigger reactive updates in templates or other effects.

---

### ✅ All Other Files: CLEAN

**AudioPlayer.svelte (Lines 19-34)**
- Effect reads `audioData` prop, writes unrelated states
- No recursive dependencies
- Severity: LOW - isolated, no loop risk

**ConfirmModal.svelte (Lines 44-49)**
- Correct portal pattern with `isOpen` guard
- No state mutations, only DOM manipulation
- Severity: LOW - clean ✅

**DiceThemePicker.svelte (Lines 34-46)**
- Correct portal pattern with `isOpen` guard
- Proper cleanup function
- Severity: LOW - clean ✅

**Game.svelte (Lines 32-39)**
- Simple callback invocations based on screen state
- No state mutations
- Severity: LOW - clean ✅

**GameSelector.svelte (Lines 42-72)** ⚠️ Previously suspected
- Uses `lastCheckedSlug` as plain variable (line 41) - ✅ CORRECT!
- Async mutations of `savedGameExists` and `saveMetadata` are safe
- These states aren't dependencies of the effect
- Severity: LOW - guard pattern correctly implemented ✅

**JournalEntry.svelte (Lines 193-204)**
- Already fixed - uses pure function extraction
- Severity: LOW - clean ✅

**GameScreen.svelte**
- Already fixed - uses guard + untrack pattern
- Severity: LOW - clean ✅

**SettingsModal.svelte (Lines 25-37)**
- Correct portal pattern with `isOpen` guard
- Proper cleanup function
- Severity: LOW - clean ✅

**useInstructionsPreference.svelte.js**
- Already fixed - uses one-time flag
- Severity: LOW - clean ✅

**useStoryNavigation.svelte.js (Lines 67-72)**
- Clean event listener pattern
- No dependencies, proper cleanup
- Severity: LOW - clean ✅

---

## Summary

**Issues Found:** 1 CRITICAL
**Issues Fixed:** 1 ✅
**Files Clean:** 11/11
**Tests:** 461 passing ✅

**Root Cause:** Using `$state` for guard variables that are both read and written in the same $effect creates reactive dependency loops.

**Pattern to Avoid:**
```javascript
let guardVar = $state(initialValue);  // ❌ DON'T
$effect(() => {
    if (something !== guardVar) {  // Reads guardVar
        guardVar = something;  // Writes guardVar → LOOP!
    }
});
```

**Correct Pattern:**
```javascript
let guardVar = initialValue;  // ✅ DO - plain variable
$effect(() => {
    if (something !== guardVar) {  // Reads plain var
        guardVar = something;  // Writes plain var → No reactive dependency
    }
});
```

