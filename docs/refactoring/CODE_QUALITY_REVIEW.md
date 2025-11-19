# DC Solo RPG - Code Quality Review

**Review Date:** 2025-11-19
**Reviewers:** Claude (AI Code Analysis)
**Status:** Complete

---

## Table of Contents

1. [Component Architecture & Organization](#1-component-architecture--organization)
2. [State Management Patterns](#2-state-management-patterns)
3. [Code Duplication](#3-code-duplication)
4. [Error Handling](#4-error-handling)
5. [Type Safety & Documentation](#5-type-safety--documentation)
6. [Performance & Optimization](#6-performance--optimization)
7. [Code Smells](#7-code-smells)
8. [Testing & Testability](#8-testing--testability)
9. [Naming & Conventions](#9-naming--conventions)
10. [File Organization](#10-file-organization)

---

## 1. Component Architecture & Organization

### Issue 1.1: StatusDisplay Component Too Large (2,006 lines) {#issue-11}

**File:** `src/lib/components/StatusDisplay.svelte`
**Severity:** 🔴 Critical
**Lines:** 1-2006

**Problem:**
The StatusDisplay component is massive and handles too many responsibilities:
- Player info bar
- Stats grid (4 stat items)
- Dice readout
- Deck visualization
- Progress tracker
- Mobile/desktop responsive logic
- All animations

**Impact:**
- Hard to maintain
- Difficult to test
- Poor code reusability
- Slow development velocity

**Recommended Solution:**
Extract into smaller components:
- `PlayerInfoBar.svelte` (lines 103-206)
- `StatsGrid.svelte` (lines 212-556)
- `DiceReadout.svelte` (lines 297-390)
- `DeckReadout.svelte` (lines 392-422)
- `ProgressTracker.svelte` (lines 559-575)

**Benefits:**
- 90% size reduction (2,006 → 200 lines)
- Clear separation of concerns
- Easier testing
- Better reusability

**Estimated Effort:** Medium (2-3 days)
**Priority:** CRITICAL

---

### Issue 1.2: GameScreen Component Doing Too Much (1,399 lines) {#issue-12}

**File:** `src/lib/components/GameScreen.svelte`
**Severity:** 🔴 Critical
**Lines:** 1-1399

**Problem:**
GameScreen handles:
- All screen state management
- Button state for 7 different screens
- Auto-play logic
- Keyboard shortcuts
- Click handling
- Modal management

**Impact:**
- Complex logic hard to follow
- Testing requires full game setup
- Changes risk breaking multiple screens

**Recommended Solution:**
Extract screen-specific logic into composables:
- `useRollForTasks.js` (lines 118-152)
- `useFailureCheck.js` (lines 154-182)
- `useSuccessCheck.js` (lines 183-206)
- `useJournalEntry.js` (lines 286-315)

**Benefits:**
- 71% size reduction (1,399 → 400 lines)
- Composable screen logic (reusable)
- Easier to add new screens
- Better testability

**Estimated Effort:** Large (4-6 hours)
**Priority:** CRITICAL

---

### Issue 1.3: CardDeck Mixed Responsibilities (1,030 lines) {#issue-13}

**File:** `src/lib/components/CardDeck.svelte`
**Severity:** 🟠 High
**Lines:** 1-1030

**Problem:**
Mixes animation logic, auto-play, card display, and button management.

**Recommended Solution:**
- Extract `useCardAnimation.js` composable for animation state machine
- Separate `CardDisplay.svelte` for presentation
- Keep CardDeck as container only

**Estimated Effort:** Medium (3-4 hours)
**Priority:** HIGH

---

## 2. State Management Patterns

### Issue 2.1: Overuse of $effect in Multiple Components {#issue-21}

**Files:** 11 components use `$effect`
**Severity:** 🔴 Critical

**Locations:**
- `GameScreen.svelte` (lines 501-571) - Single unified effect ✅ GOOD
- `CardDeck.svelte` (lines 111-149) - Auto-play effect
- `JournalEntry.svelte` (lines 186-251, 267-271) - Multiple effects
- `StoryMode.svelte` (line 180) - Keyboard listener

**Problems:**
1. JournalEntry has 3 separate `$effect` blocks that could conflict
2. CardDeck auto-play uses $effect when event-driven pattern would be better
3. Several components use $effect for side effects that should be in event handlers

**Example from JournalEntry.svelte:**
```javascript
// ❌ BAD - Reactive effect for side effect
$effect(() => {
    if (showAutoJournalTimer) {
        startAutoJournalTimer();
    }
});

// ✅ GOOD - Event-driven
function onRecordingStart() {
    if (gameplaySettings.autoSaveJournal) {
        startAutoJournalTimer();
    }
}
```

**Recommended Solution:**
- Replace $effect with event-driven pattern where possible
- Example from CardDeck (lines 111-149): Move auto-play trigger to `onProceed()` completion instead of $effect watching state
- Consolidate JournalEntry effects into one unified effect (like GameScreen did)

**Estimated Effort:** Medium (2-3 hours per component)
**Priority:** CRITICAL

---

### Issue 2.2: Duplicated State Between Components {#issue-22}

**Files:** `CardDeck.svelte`, `GameScreen.svelte`
**Severity:** 🟡 Medium
**Lines:** CardDeck lines 19-39, GameScreen lines 118-270

**Problem:**
Button state management duplicated across multiple screens:
```javascript
// CardDeck
let animationStage = $state('idle');
let buttonText = $derived.by(() => { /* logic */ });

// GameScreen - Similar patterns for 7 different screens
let rollTasksRolled = $state(false);
let rollTasksRolling = $state(false);
const rollTasksButtonText = $derived(/* ... */);

let failureCheckRolling = $state(false);
let failureCheckResult = $state();
const failureCheckButtonText = $derived(/* ... */);
// ... 5 more times
```

**Recommended Solution:**
Create `useButtonState()` composable pattern:
```javascript
function useButtonState(labels) {
    let result = $state(undefined);
    let processing = $state(false);
    const text = $derived(result ? labels.after : labels.before);
    return { result, processing, text };
}

// Usage
const rollTasks = useButtonState({
    before: 'Roll Dice',
    after: 'Draw Cards'
});
```

**Estimated Effort:** Small (1-2 hours)
**Priority:** MEDIUM

---

### Issue 2.3: Pending State Pattern Not Consistently Documented {#issue-23}

**File:** `src/lib/stores/gameStore.svelte.js`
**Severity:** 🟡 Medium
**Lines:** 76-87

**Problem:**
The `pendingUpdates` pattern is well-designed but lacks documentation:
```javascript
pendingUpdates: {
    diceRoll: null,
    towerDamage: null,
    towerGain: null,
    tokenChange: null,
    aceChange: null,
    kingsChange: null,
    kingsSuit: null,
    isLucid: null,
    isSurreal: null
}
```

**Recommended Solution:**
- Add JSDoc documentation explaining the pattern
- Create helper functions: `setPending()`, `applyPending()`, `clearPending()`
- Ensure all state mutations use this pattern consistently

**Example:**
```javascript
/**
 * Pending state updates
 *
 * Used to defer state changes until animations complete. This ensures
 * visual consistency - e.g., dice show result before stats update.
 *
 * @example
 * // Store pending update
 * gameState.pendingUpdates.towerDamage = 5;
 *
 * // Apply after animation
 * await rollDiceAnimation();
 * applyPendingDiceRoll();
 */
pendingUpdates: { /* ... */ }
```

**Estimated Effort:** Small (1-2 hours)
**Priority:** MEDIUM

---

## 3. Code Duplication

### Issue 3.1: Button Text Logic Duplicated Across Screens {#issue-31}

**File:** `src/lib/components/GameScreen.svelte`
**Severity:** 🟢 Low
**Lines:** 145-151, 181, 206, 234-239, 268-269

**Problem:**
Each screen has duplicate pattern:
```javascript
const rollForTasksButtonText = $derived(
    rollTasksRolled ? 'Draw N Cards' : 'Roll Dice'
);
const failureCheckButtonText = $derived(
    failureCheckResult ? 'Continue' : 'Roll for Damage'
);
```

**Recommended Solution:**
Create `getButtonText(state, result)` utility:
```javascript
const buttonText = getButtonText(screenState, { rolled, result });
```

**Estimated Effort:** Small (30 minutes)
**Priority:** LOW

---

### Issue 3.2: Animation Constants Used Inconsistently {#issue-32}

**Files:** Multiple components
**Severity:** 🟢 Low

**Problem:**
Good: ANIMATION_DURATION constants exist in `constants/animations.js`
Bad: Some components still use magic numbers:
- CardDeck line 469: `600ms` (should use `CARD_DISMISS`)
- GameScreen line 59: `200` (should use `TRANSITION_DURATION`)

**Recommended Solution:**
- Audit all animation durations
- Replace magic numbers with named constants

**Estimated Effort:** Small (1 hour)
**Priority:** LOW

---

### Issue 3.3: D20 Mechanics Helper Functions {#issue-33}

**File:** `src/lib/stores/gameActions.svelte.js`
**Severity:** 🟢 Low
**Lines:** 20-170

**Problem:**
Well-organized helper functions (GOOD), but could be extracted to dedicated module.

**Recommended Solution:**
Move to `src/lib/services/d20Mechanics.js`:
```javascript
// src/lib/services/d20Mechanics.js
export function calculateSalvationThreshold(acesRevealed) { /* ... */ }
export function getSalvationResult(roll, acesRevealed) { /* ... */ }
export function applySuccessCheckOutcome(roll, acesRevealed) { /* ... */ }
```

**Benefits:**
- Easier testing
- Better organization
- Reusable across features

**Estimated Effort:** Small (30 minutes)
**Priority:** MEDIUM

---

## 4. Error Handling

### Issue 4.1: Silent Errors in Auto-Play {#issue-41}

**File:** `src/lib/components/CardDeck.svelte`
**Severity:** 🟡 Medium
**Lines:** 75-79

**Problem:**
```javascript
} catch (error) {
    logger.error('Proceed to byte failed:', error);
    animationStage = 'idle';
    // Don't trigger auto-draw on error
}
```

Errors are logged but not surfaced to user. Game could appear frozen.

**Recommended Solution:**
```javascript
let errorMessage = $state(null);

} catch (error) {
    logger.error('Proceed to byte failed:', error);
    errorMessage = 'Failed to draw card. Please try again.';
    animationStage = 'idle';
}

// In template
{#if errorMessage}
    <div class="error-banner">
        {errorMessage}
        <button onclick={() => errorMessage = null}>Dismiss</button>
    </div>
{/if}
```

**Estimated Effort:** Small (1 hour)
**Priority:** MEDIUM

---

### Issue 4.2: Missing Try-Catch in Journal Audio {#issue-42}

**File:** `src/lib/components/JournalEntry.svelte`
**Severity:** 🔴 Critical
**Lines:** 49-103

**Problem:**
Audio recording functions lack error boundaries:
```javascript
async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // If this fails after permission granted, no recovery
}
```

**Recommended Solution:**
```javascript
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        // ... recording logic
    } catch (error) {
        logger.error('[Audio] Recording failed:', error);
        recordingError = 'Microphone access failed. Please check permissions.';
        isRecording = false;
        // Show user-friendly error message
    }
}
```

**Estimated Effort:** Small (1 hour)
**Priority:** CRITICAL

---

### Issue 4.3: Validation Errors Not User-Friendly {#issue-43}

**File:** `src/lib/parsers/markdownParser.js`
**Severity:** 🟢 Low
**Lines:** 9-16

**Problem:**
ValidationError class is good, but error messages could be more helpful:
```javascript
throw new ValidationError(`Missing required frontmatter fields: ${missingFields.join(', ')}`);
```

**Recommended Solution:**
```javascript
const suggestions = missingFields.map(field => {
    const examples = {
        title: 'title: My Amazing Game',
        subtitle: 'subtitle: A Journey Through Time'
    };
    return `  - ${field}: ${examples[field] || '(value)'}`;
}).join('\n');

throw new ValidationError(
    `Missing required frontmatter fields:\n${suggestions}\n\n` +
    `See documentation: docs/game-config.md`
);
```

**Estimated Effort:** Small (1-2 hours)
**Priority:** LOW

---

## 5. Type Safety & Documentation

### Issue 5.1: Missing JSDoc for Complex Functions {#issue-51}

**File:** `src/lib/stores/gameActions.svelte.js`
**Severity:** 🟡 Medium
**Lines:** Throughout

**Problem:**
Many functions lack JSDoc, especially complex ones:
```javascript
export function applyPendingDiceRoll() {
    // 50+ lines of complex logic
    // No JSDoc explaining when/why to call this
}
```

**Recommended Solution:**
```javascript
/**
 * Apply pending dice roll state to game state
 *
 * Called after dice animation completes to ensure visual consistency.
 * Applies: tower damage, token changes, Lucid/Surreal states
 *
 * @throws {Error} If no pending dice roll exists
 * @see {applyPendingTaskRoll} For roll-for-tasks specific logic
 *
 * @example
 * // Standard flow
 * const roll = rollDie(20);
 * gameState.pendingUpdates.diceRoll = roll;
 * await rollDiceAnimation();
 * applyPendingDiceRoll(); // Apply after animation
 */
export function applyPendingDiceRoll() {
    // ... implementation
}
```

**Estimated Effort:** Medium (2-3 hours)
**Priority:** HIGH

---

### Issue 5.2: Unclear Component Props {#issue-52}

**File:** Multiple Svelte components
**Severity:** 🟢 Low

**Problem:**
Example from CardDeck.svelte line 11:
```javascript
let {
    card = $bindable(null),
    animationStage = $bindable('idle'),
    onrequestcard = () => {},
    onconfirmcard = () => {}
} = $props();
```

No JSDoc explaining prop contracts.

**Recommended Solution:**
```javascript
/**
 * CardDeck Component
 *
 * Displays and animates a single card from the deck using a 5-stage
 * animation state machine.
 *
 * @component
 * @example
 * <CardDeck
 *   bind:card={currentCard}
 *   bind:animationStage={stage}
 *   onrequestcard={() => drawCard()}
 *   onconfirmcard={() => advanceGame()}
 * />
 */

/**
 * @typedef {Object} CardDeckProps
 * @property {Card | null} card - Current card to display (bindable)
 * @property {AnimationStage} animationStage - Current animation stage (bindable)
 * @property {() => void} onrequestcard - Called when card draw is requested
 * @property {() => void} onconfirmcard - Called when card is confirmed/dismissed
 */
let {
    card = $bindable(null),
    animationStage = $bindable('idle'),
    onrequestcard = () => {},
    onconfirmcard = () => {}
} = $props();
```

**Estimated Effort:** Small (2 hours for all components)
**Priority:** LOW

---

### Issue 5.3: Magic Strings for State Names {#issue-53}

**Files:** `gameStore.svelte.js`, `transitions.js`
**Severity:** 🟢 Low
**Lines:** gameStore 48, transitions throughout

**Problem:**
State names are strings, prone to typos:
```javascript
state: 'loadGame',  // Could be 'laodGame' by mistake
```

**Recommended Solution:**
```javascript
// src/lib/constants/gameStates.js
export const GAME_STATES = {
    LOAD_GAME: 'loadGame',
    SHOW_INTRO: 'showIntro',
    INITIAL_DAMAGE_ROLL: 'initialDamageRoll',
    START_ROUND: 'startRound',
    ROLL_FOR_TASKS: 'rollForTasks',
    DRAW_CARD: 'drawCard',
    FAILURE_CHECK: 'failureCheck',
    SUCCESS_CHECK: 'successCheck',
    FINAL_DAMAGE_ROLL: 'finalDamageRoll',
    LOG: 'log',
    FINAL_LOG: 'finalLog',
    GAME_OVER: 'gameOver',
    EXIT_GAME: 'exitGame'
} as const;

// Usage
import { GAME_STATES } from '$lib/constants/gameStates.js';
gameState.state = GAME_STATES.LOAD_GAME;
```

**Estimated Effort:** Small (1 hour)
**Priority:** LOW

---

## 6. Performance & Optimization

### Issue 6.1: Large Derived Computations {#issue-61}

**File:** `src/lib/components/StatusDisplay.svelte`
**Severity:** 🟢 Low
**Lines:** 73-85

**Problem:**
```javascript
const dicePips = $derived(() => {
    const roll = gameState.diceRoll || 0;
    const pips = [false, false, false, false, false];
    const binary = roll.toString(2).padStart(5, '0');
    for (let i = 0; i < 5; i++) {
        pips[i] = binary[i] === '1';
    }
    return pips;
});
```

**Note:** This is actually fine - $derived already memoizes. Only recomputes when gameState.diceRoll changes.

**No action needed** - current implementation is optimal.

---

### Issue 6.2: Unnecessary Re-renders from Context Text {#issue-62}

**File:** `src/lib/components/GameScreen.svelte`
**Severity:** 🟢 Low
**Lines:** 62-116

**Problem:**
Large derived object recreated on every screen change:
```javascript
const contextText = $derived.by(() => {
    switch (currentScreen) {
        case 'initialDamageRoll':
            return { title: '...', description: '...', showStats: true };
        // ... many cases
    }
});
```

**Recommended Solution:**
Move to static config object:
```javascript
// src/lib/config/screenContexts.js
export const SCREEN_CONTEXTS = {
    initialDamageRoll: {
        title: 'Initial Instability',
        description: 'Before your journey begins...',
        showStats: true
    },
    // ... all screens
};

// Usage
const contextText = $derived(SCREEN_CONTEXTS[currentScreen] || null);
```

**Estimated Effort:** Small (30 minutes)
**Priority:** LOW

---

### Issue 6.3: Console.log Calls in Production {#issue-63}

**Files:** 17 files with console statements
**Severity:** 🟡 Medium

**Problem:**
50 console statements found (grep results). Many should use logger instead.

**Examples:**
- StoryMode.svelte lines 35-84: 4 console.log calls
- CardDeck.svelte: console.log for debugging

**Recommended Solution:**
```javascript
// ❌ BAD
console.log('[StoryMode] Current round:', currentRoundIndex);

// ✅ GOOD
import { logger } from '$lib/utils/logger.js';
logger.debug('[StoryMode] Current round:', currentRoundIndex);
```

Logger already filters based on NODE_ENV in production.

**Estimated Effort:** Small (1 hour)
**Priority:** MEDIUM

---

## 7. Code Smells

### Issue 7.1: Magic Numbers in Dice Pips {#issue-71}

**File:** `src/lib/components/StatusDisplay.svelte`
**Severity:** 🟢 Low
**Lines:** 75-85

**Problem:**
```javascript
const pips = [false, false, false, false, false];
const binary = roll.toString(2).padStart(5, '0');
```

Why 5? Not immediately clear.

**Recommended Solution:**
```javascript
const PIP_COUNT = 5; // D20 rolls mapped to 5-bit binary display
const pips = new Array(PIP_COUNT).fill(false);
const binary = roll.toString(2).padStart(PIP_COUNT, '0');
```

**Estimated Effort:** Trivial (5 minutes)
**Priority:** LOW

---

### Issue 7.2: Deep Nesting in GameScreen Auto-Play {#issue-72}

**File:** `src/lib/components/GameScreen.svelte`
**Severity:** 🟡 Medium
**Lines:** 577-743

**Problem:**
Auto-play logic has 4-5 levels of nesting:
```javascript
switch (currentScreen) {
    case 'rollForTasks':
        if (gameplaySettings.autoRollDice) {
            if (!rollTasksRolled && !rollTasksRolling) {
                // Deep nesting
            }
        }
}
```

**Recommended Solution:**
Extract each case to named function:
```javascript
function triggerRollForTasksAutoPlay() {
    // Early returns reduce nesting
    if (!gameplaySettings.autoRollDice) return;
    if (rollTasksRolled || rollTasksRolling) return;

    autoPlayCanceller = autoRoll(() => handleRollForTasks());
}

switch (currentScreen) {
    case 'rollForTasks':
        triggerRollForTasksAutoPlay();
        break;
}
```

**Estimated Effort:** Medium (2 hours)
**Priority:** MEDIUM

---

### Issue 7.3: Commented-Out Code {#issue-73}

**Files:** `StatusDisplay.svelte`, `GameScreen.svelte`, `CardDeck.svelte`
**Severity:** 🟢 Low

**Examples:**
- StatusDisplay lines 415-421: Old deck visualization
- CardDeck lines 253-254: Old animation logic
- GameScreen lines 881-966: Entire toolbar section (commented)

**Recommended Solution:**
Remove dead code. If needed for reference, rely on git history.

**Estimated Effort:** Trivial (15 minutes)
**Priority:** LOW

---

## 8. Testing & Testability

### Issue 8.1: Hard to Test Auto-Play Logic {#issue-81}

**Files:** `GameScreen.svelte`, `CardDeck.svelte`
**Severity:** 🟡 Medium

**Problem:**
Auto-play logic tightly coupled to components, hard to test in isolation.

**Recommended Solution:**
Extract to testable composables:
```javascript
// useAutoPlay.svelte.js
export function useAutoPlay(settings) {
    // Testable logic
}

// In test
import { useAutoPlay } from './useAutoPlay.svelte.js';

test('auto-play triggers after delay', async () => {
    const autoPlay = useAutoPlay({ autoRollDice: true });
    const action = vi.fn();

    autoPlay.trigger(action, 100);
    await sleep(150);

    expect(action).toHaveBeenCalled();
});
```

**Estimated Effort:** Medium (3-4 hours)
**Priority:** HIGH

---

### Issue 8.2: Missing Tests for Critical Paths {#issue-82}

**Severity:** 🔴 Critical

**Missing Tests:**
- No tests for pending state application
- No tests for animation state machine in CardDeck
- No tests for auto-play cancellation

**Recommended Solution:**
```javascript
// gameStore.test.js
describe('Pending State System', () => {
    it('should apply dice roll after animation', () => {
        gameState.pendingUpdates.diceRoll = 15;
        gameState.pendingUpdates.towerDamage = 5;

        applyPendingDiceRoll();

        expect(gameState.tower).toBe(15); // 20 - 5
        expect(gameState.pendingUpdates.diceRoll).toBe(null);
    });

    it('should not apply if no pending state', () => {
        const tower = gameState.tower;
        applyPendingDiceRoll();
        expect(gameState.tower).toBe(tower); // Unchanged
    });
});
```

**Estimated Effort:** Large (6-8 hours)
**Priority:** CRITICAL

---

### Issue 8.3: Services Difficult to Mock {#issue-83}

**File:** `src/lib/stores/audioStore.svelte.js`
**Severity:** 🟡 Medium

**Problem:**
TTS service lacks injection pattern, hard to mock:
```javascript
// Components directly import speak()
import { speak } from '../stores/audioStore.svelte.js';
```

**Recommended Solution:**
```javascript
// audioStore.svelte.js
let mockMode = false;
let mockImplementation = null;

export function setMockMode(enabled, impl = null) {
    mockMode = enabled;
    mockImplementation = impl;
}

export async function speak(text) {
    if (mockMode && mockImplementation) {
        return mockImplementation(text);
    }
    // ... real implementation
}

// In tests
import { speak, setMockMode } from '$lib/stores/audioStore.svelte.js';

beforeEach(() => {
    setMockMode(true, vi.fn());
});
```

**Estimated Effort:** Medium (2-3 hours)
**Priority:** MEDIUM

---

## 9. Naming & Conventions

### Issue 9.1: Inconsistent Event Handler Naming {#issue-91}

**Files:** Multiple components
**Severity:** 🟢 Low

**Problem:**
Mix of patterns:
- `onclick` (Svelte props, lowercase)
- `onProceed` (functions, camelCase)
- `handleButtonClick` (functions, handle prefix)

**Recommended Solution:**
Standardize convention:
```javascript
// Props from parent: lowercase (Svelte convention)
let { onclick, onconfirmcard, onrequestcard } = $props();

// Internal handlers: handle prefix
function handleDismiss() { /* ... */ }
function handleProceed() { /* ... */ }

// Usage
<button onclick={handleDismiss}>Dismiss</button>
```

**Estimated Effort:** Small (1 hour)
**Priority:** LOW

---

### Issue 9.2: Unclear Variable Names {#issue-92}

**File:** `src/lib/components/CardDeck.svelte`
**Severity:** 🟢 Low
**Lines:** 108-110

**Problem:**
```javascript
let autoPlayCanceller = $state(null);
```

What is this? A function? An object? (It's an object with `cancel()` method)

**Recommended Solution:**
```javascript
/** @type {{cancel: () => void} | null} */
let autoPlayCanceller = $state(null);

// Or better name
let autoPlayController = $state(null);
let autoPlayHandle = $state(null);
```

**Estimated Effort:** Trivial (30 minutes)
**Priority:** LOW

---

## 10. File Organization

### Issue 10.1: Utils Folder Mixed Concerns {#issue-101}

**Directory:** `src/lib/utils/`
**Severity:** 🟢 Low

**Problem:**
Contains:
- `logger.js` (logging utility) ✅
- `timing.js` (sleep helper) ✅
- `autoPlay.js` (game feature logic) ❌
- `instructionsStorage.js` (localStorage helper) ✅

autoPlay.js is not a utility, it's game logic.

**Recommended Solution:**
Move `autoPlay.js` to `lib/features/` or `lib/gameplay/` or `lib/composables/`
Keep utils for pure helpers only.

**Estimated Effort:** Trivial (15 minutes)
**Priority:** LOW

---

### Issue 10.2: Services vs Stores Unclear {#issue-102}

**Directories:** `services/` and `stores/`
**Severity:** 🟢 Low

**Problem:**
Overlap:
- `stores/audioStore.svelte.js` contains service-like functions (`speak()`)
- `services/random.js` could arguably be in utils

**Recommended Solution:**
Clarify convention:
- **Stores:** Reactive state (uses $state, $derived)
- **Services:** Stateless logic, pure functions
- **Utils:** Generic helpers, not domain-specific

Consider:
- Renaming audioStore → audioService
- Or splitting into audioState.svelte.js + audioService.js

**Estimated Effort:** Small (1 hour discussion + refactor)
**Priority:** LOW

---

### Issue 10.3: Configuration Files Consistency {#issue-103}

**Directory:** `src/lib/configuration/`
**Severity:** 🟢 Low

**Problem:**
- DiceThemes.js exports object ✅
- GameSettings.js exports class ❌
- DifficultyLevels.js exports object ✅

**Recommended Solution:**
Standardize all as objects (no classes for config):
```javascript
// ❌ Current GameSettings.js
export class GameSettings { /* ... */ }

// ✅ Better
export const DEFAULT_GAME_SETTINGS = {
    startingStability: 20,
    startingTokens: 10,
    // ...
};
```

Or document why GameSettings is a class (if there's a good reason).

**Estimated Effort:** Trivial (30 minutes)
**Priority:** LOW

---

## Summary Statistics

### Issues by Severity
- 🔴 **Critical:** 5 issues
- 🟠 **High:** 3 issues
- 🟡 **Medium:** 10 issues
- 🟢 **Low:** 15 issues

**Total:** 33 issues identified

### Issues by Category
- Component Architecture: 3 issues
- State Management: 3 issues
- Code Duplication: 3 issues
- Error Handling: 3 issues
- Type Safety & Documentation: 3 issues
- Performance: 3 issues
- Code Smells: 3 issues
- Testing: 3 issues
- Naming & Conventions: 2 issues
- File Organization: 3 issues

### Estimated Effort by Priority
- Critical: 15-20 hours
- High: 8-10 hours
- Medium: 10-12 hours
- Low: 8-10 hours

**Total Estimated Effort:** 41-52 hours (5-7 developer days)

---

## Positive Findings ✅

The codebase shows many excellent practices:

1. **Animation Constants System** - Well organized, prevents magic numbers
2. **Pending State Pattern** - Elegant solution for animation timing
3. **Random Service** - Mockable RNG for testing
4. **Validation Error Class** - Proper error handling in parser
5. **Transition Graph** - Clear state machine definition
6. **Auto-Play Utilities** - Cancellable promise pattern
7. **Svelte 5 Runes** - Modern reactive patterns
8. **Centralized Initialization** - Single source of truth

---

## Next Steps

1. Review and prioritize critical issues
2. Create GitHub issues for each problem
3. Assign owners to issues
4. Begin with highest priority items
5. Track progress in [STATUS.md](./STATUS.md)

---

**Document Version:** 1.0
**Last Updated:** 2025-11-19
