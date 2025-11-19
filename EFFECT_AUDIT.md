# $effect Usage Audit - Comprehensive Review

**Date:** 2025-11-19
**Purpose:** Identify all $effect usage and recommend refactoring patterns
**Status:** ✅ **ALL PHASES COMPLETE** - All infinite loop risks resolved + Code quality improvements

---

## FIXES COMPLETED

### Phase 1: HIGH RISK ✅ (Commit: 38c25e1)
- ✅ GameSelector.svelte - Eliminated 3 chained effects
- ✅ JournalEntry.svelte - Extracted timer logic to pure function
- ✅ GameScreen.svelte - Added guard + untrack patterns
- ✅ useInstructionsPreference.svelte.js - Added one-time flag

### Phase 2: MEDIUM RISK ✅ (Commit: 42bc701)
- ✅ +layout.svelte - Fixed DiceBox init guard with $state tracking
- ✅ CardDeck.svelte - Added card ID guard to prevent duplicate TTS
- ✅ useStoryGeneration.svelte.js - Converted $effect to onMount
- ✅ useSavedGames.svelte.js - Converted $effect to onMount
- ❌ Portal pattern extraction (ATTEMPTED but REVERTED - see TEST_CRASH_INVESTIGATION.md)
  - Caused reactive loops due to layered $effects
  - Original pattern works fine, left as-is

### Phase 3: Code Quality Improvements ✅ (Commit: 397b83c)
- ✅ Game.svelte - Converted audio init $effect to onMount (clarity)
- ✅ Removed 228 lines of dead code (useScreenController.svelte.js)
- ✅ Updated documentation to match reality (README.md)

**Test Results:** 461 passing tests (up from 417, +44 tests!)

---

## Executive Summary

**Total $effect instances found:** 15 in source code (excluding docs/tests)

**Risk Assessment:**
- 🔴 **HIGH RISK (Immediate refactor needed):** 4 instances → ✅ **ALL FIXED**
- 🟡 **MEDIUM RISK (Review and improve):** 7 instances → ✅ **4 FIXED, 3 OK AS-IS**
- 🟢 **LOW RISK (Can remain as-is):** 4 instances → ✅ **ALL OK**

---

## 🔴 HIGH RISK - MUST REFACTOR IMMEDIATELY

### 1. GameSelector.svelte - THREE chained $effects (Lines 30, 35, 40)

```javascript
// ❌ DANGER: Three separate $effects creating reactive chain
$effect(() => {
    customGames = getCustomGames();  // Effect 1
});

$effect(() => {
    allGames = [...customGames, ...games].sort(...);  // Effect 2 - depends on Effect 1
});

$effect(() => {
    if (selectedGame) {  // Effect 3 - depends on Effect 2
        // Check for saved game
        hasSavedGame(gameSlug).then((exists) => {
            savedGameExists = exists;  // Mutates state inside async!
        });
    }
});
```

**Why Dangerous:**
- Effect 1 updates `customGames`
- This triggers Effect 2 which updates `allGames`
- This triggers Effect 3 which makes async call and updates `savedGameExists`
- State mutation inside async callback can trigger effects again
- **Classic cascade/infinite loop pattern**

**Recommended Fix:**
```javascript
// ✅ SAFE: Use $derived for synchronous dependencies, onMount for initial load

import { onMount } from 'svelte';

let customGames = $state([]);
let allGames = $derived([...customGames, ...games].sort((a, b) => a.title.localeCompare(b.title)));
let savedGameExists = $state(false);

onMount(() => {
    customGames = getCustomGames();
});

// Use watch pattern for async side effect
let lastCheckedSlug = '';
$effect(() => {
    if (selectedGame) {
        const gameSlug = selectedGame.slug || /*...*/;

        // Only check if slug changed (prevent re-trigger)
        if (gameSlug !== lastCheckedSlug) {
            lastCheckedSlug = gameSlug;
            hasSavedGame(gameSlug).then((exists) => {
                savedGameExists = exists;
            });
        }
    }
});
```

---

### 2. JournalEntry.svelte - Complex timer management (Line 193)

```javascript
// ❌ DANGER: Reads settings reactively, sets timers, mutates state
$effect(() => {
    const gameplaySettings = getGameplaySettings();  // Reactive read
    const audioSettings = getAudioSettings();  // Reactive read

    // Clear any existing timer
    if (autoJournalInterval) {
        clearInterval(autoJournalInterval);
        autoJournalInterval = null;  // State mutation 1
    }
    if (autoJournalTimer) {
        clearTimeout(autoJournalTimer);
        autoJournalTimer = null;  // State mutation 2
    }

    // Sets up NEW timers that will mutate state
    // ... timer callbacks update journalText, autoJournalTimer, etc.
});
```

**Why Dangerous:**
- Reads two reactive sources (settings)
- Mutates state inside effect (timer variables)
- Timer callbacks will mutate MORE state
- Can trigger re-runs when timers update state
- **High risk of infinite loop if settings or timer state changes**

**Recommended Fix:**
```javascript
// ✅ SAFE: Separate concerns - use untrack for state reads, cleanup properly

import { untrack } from 'svelte';

let timerCleanup = null;

$effect(() => {
    // Only react to settings changes
    const gameplaySettings = getGameplaySettings();
    const audioSettings = getAudioSettings();

    // Cancel previous cleanup
    if (timerCleanup) {
        timerCleanup();
    }

    // Setup new timers (don't read reactive state inside setup)
    timerCleanup = setupAutoJournaling(gameplaySettings, audioSettings);

    // Cleanup on effect re-run or unmount
    return () => {
        if (timerCleanup) {
            timerCleanup();
        }
    };
});

function setupAutoJournaling(gameplaySettings, audioSettings) {
    // Pure function - no reactive dependencies
    let interval = null;
    let timeout = null;

    // Setup logic here...

    return () => {
        if (interval) clearInterval(interval);
        if (timeout) clearTimeout(timeout);
    };
}
```

---

### 3. GameScreen.svelte - Screen transition effect (Line 348)

```javascript
// ❌ DANGER: Reads currentScreen reactively, calls cancelAutoPlay which might update state
$effect(() => {
    // Cancel any existing auto-play first
    cancelAutoPlay();  // Might mutate state

    // Handle screen-specific entry logic
    switch (currentScreen) {  // Reactive read
        case 'showIntro':
            setTimeout(() => triggerAutoPlayForCurrentScreen(), 0);  // Async state mutation
            break;
        // ... more cases
    }
});
```

**Why Dangerous:**
- `currentScreen` is reactive
- `cancelAutoPlay()` might update state (e.g., `autoPlayActive = false`)
- `triggerAutoPlayForCurrentScreen()` DEFINITELY updates state
- If state updates trigger screen changes, **infinite loop**

**Recommended Fix:**
```javascript
// ✅ SAFE: Use untrack to prevent feedback loop

import { untrack } from 'svelte';

let lastScreen = '';

$effect(() => {
    // Only run when screen actually changes
    if (currentScreen !== lastScreen) {
        const prevScreen = lastScreen;
        lastScreen = currentScreen;

        // Cancel previous screen's auto-play (untracked to prevent loop)
        untrack(() => {
            cancelAutoPlay();
        });

        // Handle screen entry (delay to next tick)
        setTimeout(() => {
            handleScreenEntry(currentScreen, prevScreen);
        }, 0);
    }
});

function handleScreenEntry(screen, prevScreen) {
    // Pure logic - called once per screen change
    switch (screen) {
        case 'showIntro':
            triggerAutoPlayForCurrentScreen();
            break;
        // ...
    }
}
```

---

### 4. useInstructionsPreference.svelte.js - Auto-skip logic (Line 27)

```javascript
// ❌ DANGER: Calls transitionTo() which updates gameState, creating feedback loop
$effect(() => {
    const instructionsSeen = hasSeenInstructions();  // Reads storage
    const instructionsShownInSession = hasShownInstructionsInSession();  // Reads sessionStorage

    if (instructionsSeen || instructionsShownInSession) {
        transitionTo('showIntro');  // MUTATES gameState.state!
    }
});
```

**Why Dangerous:**
- Reads from storage (potentially reactive)
- Calls `transitionTo()` which updates `gameState.state`
- If any reactive dependency tracks `gameState`, this creates a loop
- Runs on EVERY component render without guard

**Recommended Fix:**
```javascript
// ✅ SAFE: Use onMount with one-time check

import { onMount } from 'svelte';

let initialized = false;

onMount(() => {
    if (!initialized) {
        initialized = true;

        const instructionsSeen = hasSeenInstructions();
        const instructionsShownInSession = hasShownInstructionsInSession();

        if (instructionsSeen || instructionsShownInSession) {
            transitionTo('showIntro');
        }
    }
});
```

---

## 🟡 MEDIUM RISK - REVIEW AND IMPROVE

### 5. +layout.svelte - DiceBox initialization (Line 40)

```javascript
// ⚠️ CURRENT FIX: Uses untrack(), but could be simpler
$effect(() => {
    const shouldInit = showDice && diceContainer;

    if (shouldInit) {
        const alreadyInitialized = untrack(() => isDiceBoxInitialized());

        if (!alreadyInitialized && !initAttempted) {
            initAttempted = true;
            initializeDiceBox(diceContainer).catch(...);
        }
    } else {
        initAttempted = false;
    }
});
```

**Current Issues:**
- Uses `untrack()` which is good
- But `initAttempted` flag is fragile (not $state, so might not persist)
- Multiple conditions to track

**Better Fix:**
```javascript
// ✅ BETTER: Use explicit watcher with clear dependencies

let lastShowDiceValue = false;

$effect(() => {
    // Only react when showDice changes from false -> true
    if (showDice && !lastShowDiceValue && diceContainer) {
        lastShowDiceValue = true;

        // Check initialization WITHOUT reactive dependency
        const alreadyInit = untrack(() => isDiceBoxInitialized());

        if (!alreadyInit) {
            initializeDiceBox(diceContainer).catch((error) => {
                console.warn('DiceBox init failed:', error.message);
            });
        }
    } else if (!showDice) {
        lastShowDiceValue = false;
    }
});
```

---

### 6. CardDeck.svelte - Auto-read TTS (Line 106)

```javascript
// ⚠️ Reads multiple reactive sources, triggers async operations
$effect(() => {
    if (animationStage === 'revealed' && card) {
        const audioSettings = getAudioSettings();  // Reactive
        const gameplaySettings = getGameplaySettings();  // Reactive

        const cardText = `${card.description}. ${card.story || ''}`;

        if (audioSettings.autoReadCards) {
            speak(cardText).then(() => {
                // Auto-dismiss logic
            });
        }

        // Auto-dismiss timer setup
        // ...
    }
});
```

**Issues:**
- Multiple reactive reads (settings, animationStage, card)
- Async operations (TTS) that might complete after state changes
- Auto-dismiss timer setup

**Better Fix:**
```javascript
// ✅ BETTER: Guard with stable identifier

let lastRevealedCardId = '';

$effect(() => {
    if (animationStage === 'revealed' && card) {
        const cardId = `${card.card}-${card.suit}`;

        // Only trigger TTS for NEW card revelations
        if (cardId !== lastRevealedCardId) {
            lastRevealedCardId = cardId;

            const audioSettings = untrack(() => getAudioSettings());
            const gameplaySettings = untrack(() => getGameplaySettings());

            handleCardRevealed(card, audioSettings, gameplaySettings);
        }
    } else if (animationStage !== 'revealed') {
        lastRevealedCardId = '';  // Reset when not revealed
    }
});

function handleCardRevealed(card, audioSettings, gameplaySettings) {
    // Pure function - no reactive dependencies
    const cardText = `${card.description}. ${card.story || ''}`;

    if (audioSettings.autoReadCards) {
        speak(cardText).then(() => {
            // Auto-dismiss logic
        });
    }
}
```

---

### 7-9. Portal Effects (ConfirmModal, DiceThemePicker, SettingsModal)

```javascript
// ⚠️ Pattern repeated 3 times - DOM manipulation in $effect
$effect(() => {
    if (isOpen && modalElement && portalTarget) {
        portalTarget.appendChild(modalElement);
    }

    return () => {
        if (modalElement && portalTarget && portalTarget.contains(modalElement)) {
            portalTarget.removeChild(modalElement);
        }
    };
});
```

**Issues:**
- DOM manipulation is a side effect (okay in $effect)
- But needs careful cleanup
- Multiple components duplicating same logic

**Better Fix:**
```javascript
// ✅ BETTER: Extract to reusable composable

// src/lib/composables/usePortal.svelte.js
export function usePortal() {
    let element = $state(null);
    let targetId = $state('portal');

    $effect(() => {
        const target = document.getElementById(targetId);

        if (element && target) {
            target.appendChild(element);

            return () => {
                if (target.contains(element)) {
                    target.removeChild(element);
                }
            };
        }
    });

    return {
        get element() { return element; },
        set element(el) { element = el; },
        get targetId() { return targetId; },
        set targetId(id) { targetId = id; }
    };
}

// Usage in component:
const portal = usePortal();
let modalElement;

$: portal.element = modalElement;
```

---

### 10. useStoryGeneration.svelte.js - Initialization effect (Line 39)

```javascript
// ⚠️ Complex initialization with multiple async operations
$effect(() => {
    async function initialize() {
        aiConfigured = await isAIConfigured();  // State mutation 1
        ttsAvailable = await isTTSAvailable();  // State mutation 2

        if (saveKey) {
            const existingStory = await loadAIStory(saveKey);
            // ... more state mutations
        }
    }

    initialize();
});
```

**Issues:**
- Multiple async state updates
- No guard - runs on EVERY reactive change
- `saveKey` might be reactive, triggering re-initialization

**Better Fix:**
```javascript
// ✅ BETTER: Use onMount for one-time initialization

import { onMount } from 'svelte';

let initialized = false;

onMount(async () => {
    if (!initialized) {
        initialized = true;
        await initialize();
    }
});

async function initialize() {
    aiConfigured = await isAIConfigured();
    ttsAvailable = await isTTSAvailable();

    if (saveKey) {
        const existingStory = await loadAIStory(saveKey);
        // ...
    }
}
```

---

### 11. useSavedGames.svelte.js - Mount effect (Line 25)

```javascript
// ⚠️ Uses flag pattern but runs in $effect
let mounted = false;

$effect(() => {
    if (!mounted) {
        mounted = true;
        loadCompletedGames();
    }
});
```

**Issues:**
- Tries to simulate onMount with flag
- But $effect still runs on every reactive change
- Flag prevents execution but effect still runs

**Better Fix:**
```javascript
// ✅ BETTER: Just use onMount!

import { onMount } from 'svelte';

onMount(() => {
    loadCompletedGames();
});
```

---

## 🟢 LOW RISK - CAN REMAIN AS-IS

### 12. useStoryNavigation.svelte.js - Keyboard handler (Line 67)

```javascript
// ✅ SAFE: Proper event listener pattern with cleanup
$effect(() => {
    window.addEventListener('keydown', handleKeyboard);
    return () => {
        window.removeEventListener('keydown', handleKeyboard);
    };
});
```

**Why Safe:**
- Classic event listener pattern
- Proper cleanup function
- No reactive state mutations inside effect
- Handler is stable function reference

**Verdict:** ✅ Keep as-is

---

### 13. Game.svelte - Audio initialization (Line 27)

```javascript
// ✅ SAFE: One-time initialization, no reactive dependencies
$effect(() => {
    initializeAudioStore();
});
```

**Why Safe:**
- Simple one-time call
- No reactive reads
- No state mutations that would re-trigger

**Verdict:** ✅ Keep as-is (or use onMount for clarity)

---

### 14. Game.svelte - Game over callbacks (Line 31)

```javascript
// ✅ SAFE: Simple callback pattern
$effect(() => {
    if (currentScreen == 'gameOver') {
        ongameover(gameState.state);
    } else if (currentScreen == 'exitGame') {
        onexitgame(gameState.state);
    }
});
```

**Why Safe:**
- Reads `currentScreen` (reactive dependency - intended)
- Calls prop callbacks (side effects - intended)
- Callbacks don't update local state
- Clear, predictable behavior

**Verdict:** ✅ Keep as-is

---

### 15. AudioPlayer.svelte - Convert audio data (Line 19)

```javascript
// ✅ SAFE: Pure transformation
$effect(() => {
    if (audioData) {
        if (audioData.startsWith('data:')) {
            audioURL = audioData;
        }
    } else {
        audioURL = null;
        if (audioElement) {
            audioElement.pause();
            audioElement.currentTime = 0;
        }
    }
});
```

**Why Safe:**
- Simple transformation of prop to local state
- DOM operations (pause, currentTime) are safe
- No complex state mutations
- Clear dependency (audioData)

**Verdict:** ✅ Keep as-is (though could use $derived for audioURL)

---

## Summary Table

| File | Line | Risk | Pattern | Recommended Action |
|------|------|------|---------|-------------------|
| GameSelector.svelte | 30-50 | 🔴 HIGH | Chained effects | **REFACTOR IMMEDIATELY** - Use $derived + onMount |
| JournalEntry.svelte | 193 | 🔴 HIGH | Complex timers | **REFACTOR IMMEDIATELY** - Extract timer logic |
| GameScreen.svelte | 348 | 🔴 HIGH | Screen transitions | **REFACTOR IMMEDIATELY** - Use guard + untrack |
| useInstructionsPreference | 27 | 🔴 HIGH | Auto-transition | **REFACTOR IMMEDIATELY** - Use onMount |
| +layout.svelte | 40 | 🟡 MEDIUM | DiceBox init | Improve guard logic |
| CardDeck.svelte | 106 | 🟡 MEDIUM | TTS auto-read | Add card ID guard |
| ConfirmModal.svelte | 45 | 🟡 MEDIUM | Portal | Extract to composable |
| DiceThemePicker.svelte | 34 | 🟡 MEDIUM | Portal | Extract to composable |
| SettingsModal.svelte | 25 | 🟡 MEDIUM | Portal | Extract to composable |
| useStoryGeneration | 39 | 🟡 MEDIUM | Initialization | Use onMount |
| useSavedGames | 25 | 🟡 MEDIUM | Mount simulation | Use onMount |
| useStoryNavigation | 67 | 🟢 LOW | Event listener | Keep as-is |
| Game.svelte | 27 | 🟢 LOW | Audio init | Keep or use onMount |
| Game.svelte | 31 | 🟢 LOW | Callbacks | Keep as-is |
| AudioPlayer.svelte | 19 | 🟢 LOW | Data transform | Keep as-is |

---

## Recommended Refactoring Priority

### Phase 1 (Immediate - This Sprint)
1. ✅ Fix GameSelector.svelte (highest risk - 3 chained effects)
2. ✅ Fix JournalEntry.svelte (timer management)
3. ✅ Fix GameScreen.svelte (screen transitions)
4. ✅ Fix useInstructionsPreference (auto-transition)

### Phase 2 (Next Sprint)
5. Improve +layout.svelte (already has untrack, make more robust)
6. Improve CardDeck.svelte (add card ID guard)
7. Extract portal pattern to composable
8. Convert mount simulations to onMount

### Phase 3 (Future - Optional)
9. Review low-risk instances for onMount conversions
10. Document $effect usage patterns in style guide
11. Add ESLint rule to catch unsafe $effect patterns

---

## General Patterns to Follow

### ✅ SAFE $effect Patterns

**1. Event Listeners**
```javascript
$effect(() => {
    element.addEventListener('event', handler);
    return () => element.removeEventListener('event', handler);
});
```

**2. DOM Side Effects (with cleanup)**
```javascript
$effect(() => {
    if (condition) {
        doSomething();
    }
    return () => cleanup();
});
```

**3. Pure Transformations (prefer $derived instead)**
```javascript
// Okay but $derived is better
$effect(() => {
    derived = transform(source);
});

// Better:
const derived = $derived(transform(source));
```

---

### ❌ UNSAFE $effect Patterns

**1. Chained Effects**
```javascript
// BAD!
$effect(() => { a = getA(); });
$effect(() => { b = computeB(a); });  // Creates chain
$effect(() => { c = computeC(b); });  // Loop risk!
```

**2. Async State Updates**
```javascript
// BAD!
$effect(() => {
    fetchData().then(data => {
        state = data;  // Might trigger effect again!
    });
});
```

**3. Reading State You Just Updated**
```javascript
// BAD!
$effect(() => {
    state = newValue;  // Update
    if (state === something) {  // Read - creates loop!
        // ...
    }
});
```

**4. Complex Conditional Logic**
```javascript
// BAD!
$effect(() => {
    if (a && b && !c && d) {
        updateE();
        updateF();
        updateG();
    }
});
```

---

## Tools and Techniques

### 1. Use `untrack()` for Conditional Reads

```javascript
import { untrack } from 'svelte';

$effect(() => {
    // Reactive dependency (will trigger re-run)
    const shouldCheck = someCondition;

    if (shouldCheck) {
        // Check state WITHOUT creating dependency
        const value = untrack(() => someState);
        doSomething(value);
    }
});
```

### 2. Use Guard Flags

```javascript
let lastValue = '';

$effect(() => {
    if (currentValue !== lastValue) {
        lastValue = currentValue;
        doSomething(currentValue);
    }
});
```

### 3. Use `onMount` for Initialization

```javascript
import { onMount } from 'svelte';

// Instead of:
$effect(() => { initialize(); });

// Use:
onMount(() => { initialize(); });
```

### 4. Use `$derived` for Computed Values

```javascript
// Instead of:
let result;
$effect(() => {
    result = compute(source);
});

// Use:
const result = $derived(compute(source));
```

---

## Next Steps

1. **Create Issues** for each HIGH RISK refactor
2. **Assign Priority** to development team
3. **Test Thoroughly** after each refactor
4. **Document Patterns** in style guide
5. **Add Linting Rules** to prevent future issues

---

## Testing Strategy

For each refactored $effect:

1. **Unit Test** - Verify logic in isolation
2. **Integration Test** - Test with real reactive dependencies
3. **Performance Test** - Ensure no excessive re-runs
4. **Console Test** - Watch for "effect_update_depth_exceeded"
5. **User Test** - Manual testing of affected features

---

## Conclusion

**Current State:** 🔴 **HIGH RISK**
- 4 effects with immediate infinite loop risk
- 7 effects needing improvement
- 4 effects that are safe

**Required Action:** **IMMEDIATE REFACTORING**
- Start with GameSelector.svelte (most dangerous)
- Fix all HIGH RISK effects this sprint
- Improve MEDIUM RISK effects next sprint

**Expected Outcome After Refactoring:**
- ✅ Zero infinite loop errors
- ✅ Predictable reactive behavior
- ✅ Better performance
- ✅ Maintainable codebase
