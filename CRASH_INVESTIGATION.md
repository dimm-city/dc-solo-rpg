# Game Crash Investigation

## Date: 2025-11-19

## Issue Report
**User Report:** Game crashes after rolling for number of cards to draw and moving to draw cards phase.

## Crash Timeline
1. ✅ Roll for number of cards (rollForTasks screen)
2. ✅ Confirm roll
3. ❌ CRASH when transitioning to drawCard screen

## Investigation Steps

### 1. Check Recent Changes
Recent commits that could affect card drawing:
- 42bc701: MEDIUM RISK $effect fixes (CardDeck.svelte TTS guard added)
- 397b83c: Code quality improvements (Game.svelte audio init to onMount)

### 2. Identify Suspect Code

**CardDeck.svelte lines 105-156:**
```javascript
let autoPlayCanceller = $state(null);
let lastRevealedCardId = $state('');

$effect(() => {
    if (animationStage === 'revealed' && card) {
        const cardId = `${card.card}-${card.suit}`;

        if (cardId !== lastRevealedCardId) {
            lastRevealedCardId = cardId;
            // ... TTS logic ...
        }
    } else if (animationStage !== 'revealed') {
        lastRevealedCardId = '';
    }

    // ❌ PROBLEM: Cleanup mutates $state!
    return () => {
        if (autoPlayCanceller) {
            autoPlayCanceller.cancel();
            autoPlayCanceller = null;  // State mutation in cleanup!
        }
    };
});
```

### 3. Root Cause Analysis

**ISSUE:** Mutating `$state` variables in cleanup function

The cleanup function sets `autoPlayCanceller = null`, which is a $state variable.
This state mutation can cause:
1. Reactive loop - cleanup triggers $effect to re-run
2. Timing issues - cleanup runs during state transitions
3. Undefined behavior - mutating state during effect cleanup

**When cleanup runs:**
- When $effect dependencies change (animationStage, card)
- When component unmounts
- When transitioning between screens

**Why this crashes:**
- Cleanup runs during screen transition (rollForTasks → drawCard)
- Mutates `autoPlayCanceller` state
- This can trigger the $effect to run again
- Creates race condition or infinite loop
- Browser crashes or hangs

### 4. Fix Strategy

**Solution:** Don't mutate $state in cleanup functions.

**Options:**
1. Use local variable to track canceller (not $state)
2. Move cleanup logic outside of $effect
3. Use untrack() when mutating state in cleanup (discouraged)

**Best Approach:** Make `autoPlayCanceller` a plain variable, not $state

### 5. Fix Applied ✅

**File:** `src/lib/components/CardDeck.svelte` line 105

**Change:**
```javascript
// ❌ BEFORE: Reactive state - dangerous to mutate in cleanup
let autoPlayCanceller = $state(null);

// ✅ AFTER: Plain variable - safe to mutate anywhere
let autoPlayCanceller = null; // Plain variable - no need for $state, just holds reference
```

**Why this fixes it:**
- `autoPlayCanceller` doesn't need to be reactive
- It's just a reference to a cancel function
- Mutating it in cleanup no longer triggers reactive updates
- No more infinite loops or race conditions

### 6. Test Results

**Before Fix:**
- Game crashes after rolling for cards → transitioning to drawCard

**After Fix:**
- ✅ All 461 tests passing
- ✅ Duration: 13.40s
- ✅ No crashes or regressions

### 7. Lesson Learned

**Rule:** Never mutate `$state` variables in `$effect` cleanup functions.

**Why:**
- Cleanup runs when dependencies change
- Mutating state in cleanup can trigger the effect again
- Creates reactive loops and timing issues
- Hard to debug, causes crashes

**Correct Pattern:**
- Only use `$state` for values that need reactivity
- Use plain variables for simple references/caching
- Never mutate state in cleanup - use local variables instead
- Or use `untrack()` if absolutely necessary (rare)

**This mistake happened because:**
- I was too eager to use `$state` everywhere
- Didn't think about cleanup timing
- Assumed "more reactive = better" (wrong!)
- Should have asked: "Does this NEED to be reactive?"

**Better question to ask:** "Will other parts of the UI need to react to changes in this value?"
- If YES → use `$state`
- If NO → use plain variable