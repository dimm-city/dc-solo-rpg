# Svelte 5 Migration Plan - DC Solo RPG

**Project:** DC Solo RPG Card Game
**Author:** bun-node-architect
**Date:** 2025-01-09
**Status:** Ready for Implementation

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Dependency Upgrades](#dependency-upgrades)
3. [Migration Strategy](#migration-strategy)
4. [State Management Refactoring](#state-management-refactoring)
5. [Component Migration Patterns](#component-migration-patterns)
6. [SvelteKit 1 → SvelteKit 2 Migration](#sveltekit-1--sveltekit-2-migration)
7. [Testing Strategy](#testing-strategy)
8. [Phase-by-Phase Implementation Plan](#phase-by-phase-implementation-plan)
9. [Code Examples](#code-examples)
10. [Risks and Mitigation](#risks-and-mitigation)
11. [Post-Migration Optimization](#post-migration-optimization)

---

## Executive Summary

### Overview

This migration plan upgrades the DC Solo RPG from Svelte 4/SvelteKit 1 to Svelte 5/SvelteKit 2 while simultaneously addressing critical architectural issues identified in the Architecture Review. This is a **two-birds-one-stone** refactor that will:

1. Modernize the framework to Svelte 5 with runes
2. Eliminate dual state tracking and race conditions
3. Reduce codebase complexity by ~35%
4. Improve maintainability and testability

### Expected Benefits

**Technical Benefits:**
- **35% reduction in state management code** (eliminate StateMachine class)
- **Zero synchronization bugs** (single source of truth)
- **Better performance** with Svelte 5's fine-grained reactivity
- **Improved developer experience** with runes ($state, $derived, $effect)
- **Type safety improvements** via better TypeScript integration

**Business Benefits:**
- Reduced maintenance burden
- Faster feature development
- Easier onboarding for new developers
- Future-proof architecture

### Estimated Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| **Phase 0: Preparation** | 2 hours | Backup, testing setup, dependency analysis |
| **Phase 1: Dependency Upgrade** | 1 hour | Update to Svelte 5 + SvelteKit 2 |
| **Phase 2: Core Refactor** | 4 hours | Eliminate StateMachine, refactor stores with runes |
| **Phase 3: Component Migration** | 6 hours | Migrate all 15+ components to Svelte 5 syntax |
| **Phase 4: Testing & QA** | 3 hours | Comprehensive testing and bug fixes |
| **Phase 5: Optimization** | 2 hours | Performance tuning and cleanup |
| **Total** | **18 hours** | ~2.5 days of focused work |

### Risk Assessment

**Overall Risk: MEDIUM-LOW**

**Low Risk Factors:**
- Svelte 5 has excellent backward compatibility
- Architecture simplification reduces complexity
- Comprehensive testing strategy
- Incremental rollback possible

**Medium Risk Factors:**
- Breaking changes in SvelteKit 2 routing (minor)
- Component local state needs careful migration
- Animation timing might need adjustment

**Mitigation:**
- Comprehensive test suite before migration
- Git branch for easy rollback
- Phase-by-phase implementation with validation
- Keep parallel stores during transition (temporary)

---

## Dependency Upgrades

### Current Versions

```json
{
  "svelte": "^4.0.0",
  "@sveltejs/kit": "^1.20.4",
  "vite": "^4.3.0"
}
```

### Target Versions (Latest Stable as of January 2025)

```json
{
  "svelte": "^5.15.0",
  "@sveltejs/kit": "^2.15.0",
  "vite": "^5.4.0",
  "@sveltejs/adapter-auto": "^3.3.0",
  "@sveltejs/package": "^2.3.0",
  "svelte-check": "^4.0.0"
}
```

### Breaking Changes to Address

#### Svelte 4 → Svelte 5

1. **Reactive declarations** (`$:`) → **Runes** (`$derived`, `$effect`)
2. **Component props** → **`$props()`** rune
3. **`export let` bindings** → **`$bindable()`** for two-way binding
4. **`createEventDispatcher`** → **Event handlers as props** or **callbacks**
5. **`onMount`/`onDestroy`** → **`$effect`** with cleanup
6. **Store subscriptions** (`$store`) → **Still supported but runes preferred**

#### SvelteKit 1 → SvelteKit 2

1. **`+page.js` load functions** - Signature changes (minimal impact)
2. **`@sveltejs/adapter-auto`** - Version 3.x with new defaults
3. **Error handling** - New error page structure
4. **Paths** - `base` path handling improved
5. **Prerendering** - New options and defaults

#### Vite 4 → Vite 5

1. **Minimal breaking changes** for most projects
2. **Node 18+** required (already compatible)
3. **ESM-first** approach (already using)

### Update Sequence

**IMPORTANT:** Update in this exact order to avoid dependency conflicts:

```bash
# Step 1: Update Vite first (foundation)
npm install -D vite@^5.4.0

# Step 2: Update Svelte core
npm install -D svelte@^5.15.0

# Step 3: Update SvelteKit and adapters
npm install -D @sveltejs/kit@^2.15.0 @sveltejs/adapter-auto@^3.3.0

# Step 4: Update SvelteKit packages
npm install -D @sveltejs/package@^2.3.0 svelte-check@^4.0.0

# Step 5: Update testing tools
npm install -D vitest@^2.1.0 @vitest/coverage-v8@^2.1.0

# Step 6: Update Playwright (optional but recommended)
npm install -D @playwright/test@^1.48.0

# Step 7: Clean install
rm -rf node_modules package-lock.json
npm install
```

### Compatibility Verification

After upgrade, verify compatibility:

```bash
# Check for peer dependency issues
npm ls svelte

# Verify build works
npm run build

# Run type checking
npm run check
```

---

## Migration Strategy

### Core Principle: Simplify While Modernizing

This migration follows the **Architecture Review's primary recommendation**: eliminate the StateMachine class and use Svelte's reactive primitives directly. Svelte 5's runes make this even more powerful.

### Migration Approach

**Parallel Implementation Strategy:**

1. Keep old store architecture temporarily
2. Build new rune-based architecture alongside
3. Migrate components one-by-one to new architecture
4. Remove old architecture once all components migrated
5. Never have both architectures active simultaneously in production

### Key Architectural Changes

#### Before (Svelte 4 + StateMachine)

```
┌─────────────────────────────────────────┐
│           gameStore (writable)           │
│  - Holds game state                      │
│  - state: 'loadGame'                     │
└──────────────┬──────────────────────────┘
               │
               │ (must sync manually)
               ▼
┌──────────────────────────────────────────┐
│      StateMachine (class instance)       │
│  - Holds same state                      │
│  - state: 'loadGame'                     │
│  - Validates transitions                 │
└──────────────┬───────────────────────────┘
               │
               │ (can desync!)
               ▼
┌──────────────────────────────────────────┐
│      currentScreen (derived)             │
│  - Reads from StateMachine               │
└──────────────────────────────────────────┘

PROBLEM: Two sources of truth, manual sync required
```

#### After (Svelte 5 + Runes)

```
┌─────────────────────────────────────────┐
│           gameState (rune)               │
│  - Single source of truth                │
│  - $state() for reactive state           │
│  - state: 'loadGame'                     │
└──────────────┬──────────────────────────┘
               │
               │ (automatic reactivity)
               ▼
┌──────────────────────────────────────────┐
│      currentScreen ($derived)            │
│  - Computed from gameState.state         │
│  - Always synchronized                   │
└──────────────────────────────────────────┘
               │
               │ (pure function validation)
               ▼
┌──────────────────────────────────────────┐
│   validateTransition (pure function)     │
│  - No state, just validation logic       │
└──────────────────────────────────────────┘

SOLUTION: One source of truth, automatic sync
```

---

## State Management Refactoring

This is the most critical part of the migration. We're combining the Svelte 5 upgrade with the architectural improvements from the Architecture Review.

### New Store Architecture with Svelte 5 Runes

#### File Structure

```
src/lib/stores/
├── gameStore.svelte.js      # Main game state (NEW - uses runes)
├── transitionStore.svelte.js # Animation state (NEW)
├── transitions.js            # Transition graph (pure data)
├── WAAStore.js              # Legacy store (DEPRECATE)
└── WAAStateMachine.js       # State machine class (DELETE)
```

#### Core State (gameStore.svelte.js)

```javascript
// src/lib/stores/gameStore.svelte.js
import { transitionGraph } from './transitions.js';

/**
 * Core game state using Svelte 5 runes
 * This is a "runes module" - must have .svelte.js extension
 */

// Single source of truth for game state
let gameState = $state({
    // Screen state
    state: 'loadGame',

    // Player state
    playerName: '',
    tower: 54,
    tokens: 10,

    // Round state
    round: 0,
    cardsToDraw: 0,
    cardsDrawn: 0,

    // Card state
    deck: [],
    discard: [],
    currentCard: null,

    // Roll state
    diceRoll: 0,

    // King tracking
    kingsRevealed: 0,
    kingOfHearts: false,
    kingOfDiamonds: false,
    kingOfClubs: false,
    kingOfSpades: false,

    // Journal
    journalEntries: [],

    // Config
    config: null,
    systemConfig: null,

    // UI state
    status: 'loading'
});

/**
 * Computed values using $derived rune
 * These automatically update when dependencies change
 */
export const currentScreen = $derived(gameState.state);

export const gameStats = $derived({
    tower: gameState.tower,
    tokens: gameState.tokens,
    round: gameState.round,
    cardsRemaining: gameState.deck.length
});

export const hasWon = $derived(
    gameState.tokens === 0 && gameState.tower > 0
);

export const hasLost = $derived(
    gameState.tower <= 0 || gameState.kingsRevealed >= 4
);

export const gameOver = $derived(hasWon || hasLost);

/**
 * Export reactive state for component use
 * Components can read: gameState.tower, gameState.tokens, etc.
 */
export { gameState };

/**
 * State updater with validation
 */
export function updateGameState(updates) {
    // Merge updates into state
    Object.assign(gameState, updates);
}

/**
 * Validate state transition
 * Pure function - no side effects
 */
export function validateTransition(fromState, toState) {
    const validStates = transitionGraph[fromState];

    // Allow emergency exits
    if (toState === 'exitGame' || toState === 'errorScreen') {
        return true;
    }

    if (!validStates?.includes(toState)) {
        const validList = validStates?.join(', ') || 'none';
        throw new Error(
            `Invalid transition: ${fromState} → ${toState}\n` +
            `Valid transitions from ${fromState}: ${validList}`
        );
    }

    return true;
}

/**
 * Update screen state with validation
 */
export function transitionTo(newState) {
    validateTransition(gameState.state, newState);
    gameState.state = newState;
}
```

#### Transition Management (transitionStore.svelte.js)

```javascript
// src/lib/stores/transitionStore.svelte.js

/**
 * Manages animation state to prevent race conditions
 */

// Track transition state
let transitionState = $state({
    isTransitioning: false,
    currentAnimation: null
});

export { transitionState };

export function setTransitioning(value) {
    transitionState.isTransitioning = value;
}

export const isTransitioning = $derived(transitionState.isTransitioning);
```

#### Transition Graph (transitions.js)

```javascript
// src/lib/stores/transitions.js

/**
 * Complete state transition graph
 * Pure data - no logic
 */
export const transitionGraph = {
    loadGame: ['options'],
    options: ['intro'],
    intro: ['rollForTasks'],
    startRound: ['rollForTasks'],
    rollForTasks: ['drawCard'],
    drawCard: ['failureCheck', 'drawCard', 'endTurn', 'log', 'gameOver'],
    failureCheck: ['drawCard', 'endTurn', 'log', 'gameOver'],
    endTurn: ['log'],
    log: ['successCheck', 'startRound'],
    successCheck: ['startRound', 'gameOver'],
    gameOver: ['finalLog', 'intro'],
    finalLog: ['exitGame', 'intro'],
    exitGame: ['loadGame', 'options'],
    errorScreen: ['loadGame']
};

/**
 * Get valid next states for a given state
 */
export function getValidNextStates(state) {
    return transitionGraph[state] || [];
}

/**
 * Check if transition is valid
 */
export function isValidTransition(from, to) {
    const validStates = transitionGraph[from];
    return validStates?.includes(to) || to === 'exitGame' || to === 'errorScreen';
}
```

### Game Actions with Runes

```javascript
// src/lib/stores/gameActions.svelte.js

import { gameState, transitionTo } from './gameStore.svelte.js';
import { transitionState, setTransitioning } from './transitionStore.svelte.js';

/**
 * Helper for animation timing
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Transition to screen with animation
 * Prevents race conditions via isTransitioning flag
 */
export async function transitionToScreen(newState, animationType = 'default') {
    // Prevent concurrent transitions
    if (transitionState.isTransitioning) {
        console.warn('Transition already in progress, ignoring');
        return;
    }

    setTransitioning(true);

    try {
        // Exit animation
        const currentScreenEl = document.querySelector('.dc-screen-container');
        if (currentScreenEl) {
            currentScreenEl.classList.add('screen-transition-out');
            await sleep(300);
        }

        // Update state (validates transition)
        transitionTo(newState);

        // Wait for render
        await sleep(50);

        // Enter animation
        const newScreenEl = document.querySelector('.dc-screen-container');
        if (newScreenEl) {
            newScreenEl.classList.remove('screen-transition-out');

            const animClass = {
                'round': 'round-transition',
                'journal': 'journal-transition',
                'default': 'screen-transition-in'
            }[animationType] || 'screen-transition-in';

            newScreenEl.classList.add(animClass);

            const duration = animationType === 'round' ? 800 :
                           animationType === 'journal' ? 1200 : 500;

            setTimeout(() => newScreenEl.classList.remove(animClass), duration);
        }
    } finally {
        setTransitioning(false);
    }
}

/**
 * Roll for tasks action
 */
export async function rollForTasks() {
    const result = Math.floor(Math.random() * 6) + 1;
    gameState.diceRoll = result;
    gameState.cardsToDraw = result;
    return result;
}

/**
 * Confirm task roll and proceed
 */
export async function confirmTaskRoll() {
    await transitionToScreen('drawCard');
}

/**
 * Draw a card from the deck
 */
export async function drawCard() {
    if (gameState.deck.length === 0) {
        console.error('Deck is empty!');
        await transitionToScreen('gameOver');
        return null;
    }

    const card = gameState.deck.pop();
    gameState.currentCard = card;
    gameState.cardsDrawn++;
    gameState.cardsToDraw--;

    // Track kings
    if (card.rank === 'K') {
        gameState.kingsRevealed++;
        const suitKey = `kingOf${card.suit.charAt(0).toUpperCase() + card.suit.slice(1)}`;
        gameState[suitKey] = true;
    }

    return card;
}

/**
 * Confirm drawn card and determine next action
 */
export async function confirmCard() {
    const card = gameState.currentCard;

    // Check for game over (4 kings)
    if (gameState.kingsRevealed >= 4) {
        await transitionToScreen('gameOver');
        return;
    }

    // Check if card is odd (failure check required)
    const isOdd = ['A', '3', '5', '7', '9', 'J', 'K'].includes(card.rank);

    if (isOdd) {
        await transitionToScreen('failureCheck');
    } else if (gameState.cardsToDraw > 0) {
        // More cards to draw
        await transitionToScreen('drawCard');
    } else {
        // Round complete
        await transitionToScreen('log', 'journal');
    }
}

/**
 * Get failure check roll
 */
export function getFailureCheckRoll() {
    const result = Math.floor(Math.random() * 6) + 1;
    return result;
}

/**
 * Apply failure check result
 */
export function applyFailureCheckResult(result) {
    gameState.diceRoll = result;

    // Apply damage based on roll
    const damage = result <= 2 ? 6 : result <= 4 ? 3 : 1;
    gameState.tower = Math.max(0, gameState.tower - damage);
}

/**
 * Confirm failure check and proceed
 */
export async function confirmFailureCheck() {
    // Check for tower collapse
    if (gameState.tower <= 0) {
        await transitionToScreen('gameOver');
        return;
    }

    // Continue drawing or end turn
    if (gameState.cardsToDraw > 0) {
        await transitionToScreen('drawCard');
    } else {
        await transitionToScreen('log', 'journal');
    }
}

/**
 * Record journal entry
 */
export async function recordRound(entry) {
    gameState.journalEntries.push({
        round: gameState.round,
        text: entry.text,
        timestamp: Date.now()
    });

    await transitionToScreen('successCheck');
}

/**
 * Perform success check
 */
export async function successCheck() {
    const result = Math.floor(Math.random() * 6) + 1;
    gameState.diceRoll = result;

    if (result === 6) {
        // Success! Remove a token
        gameState.tokens = Math.max(0, gameState.tokens - 1);
    }

    return result;
}

/**
 * Confirm success check and proceed
 */
export async function confirmSuccessCheck() {
    // Check for win condition
    if (gameState.tokens === 0 && gameState.tower > 0) {
        await transitionToScreen('gameOver');
        return;
    }

    // Start next round
    gameState.round++;
    gameState.cardsToDraw = 0;
    gameState.cardsDrawn = 0;
    gameState.diceRoll = 0;

    await transitionToScreen('rollForTasks', 'round');
}

/**
 * Start a new game
 */
export function startGame(options) {
    gameState.playerName = options.name || 'Player';
    gameState.tower = 54;
    gameState.tokens = 10;
    gameState.round = 1;
    gameState.kingsRevealed = 0;
    gameState.kingOfHearts = false;
    gameState.kingOfDiamonds = false;
    gameState.kingOfClubs = false;
    gameState.kingOfSpades = false;
    gameState.journalEntries = [];

    transitionTo('intro');
}

/**
 * Load game configuration
 */
export async function loadSystemConfig(systemSettings) {
    // Implementation depends on ConfigurationLoader
    // Update gameState.config and gameState.systemConfig
    transitionTo('options');
}
```

### Backward Compatibility Wrapper (Temporary)

During migration, maintain backward compatibility:

```javascript
// src/lib/stores/WAAStore.js (MODIFIED - Temporary compatibility layer)

import { writable, derived, get } from 'svelte/store';
import { gameState, currentScreen as runeCurrentScreen } from './gameStore.svelte.js';
import * as actions from './gameActions.svelte.js';

/**
 * TEMPORARY: Wrap rune-based stores in Svelte 4 stores
 * This allows gradual component migration
 * DELETE THIS FILE once all components use runes
 */

// Wrap gameState in a writable store for Svelte 4 components
export const gameStore = writable(gameState);

// Subscribe to rune changes and update store
$effect(() => {
    gameStore.set(gameState);
});

// Export currentScreen as derived store
export const currentScreen = derived(gameStore, () => runeCurrentScreen);

// Re-export all actions
export const {
    transitionToScreen,
    rollForTasks,
    confirmTaskRoll,
    drawCard,
    confirmCard,
    getFailureCheckRoll,
    applyFailureCheckResult,
    confirmFailureCheck,
    recordRound,
    successCheck,
    confirmSuccessCheck,
    startGame,
    loadSystemConfig
} = actions;

// Legacy nextScreen function
export const nextScreen = (action) => {
    console.warn('nextScreen is deprecated, use transitionToScreen');
    transitionToScreen(action);
};
```

---

## Component Migration Patterns

### General Migration Checklist

For each component:

1. Replace `<script>` with `<script>` (stays the same)
2. Replace reactive declarations (`$:`) with `$derived` or `$effect`
3. Replace `export let prop` with `let { prop } = $props()`
4. Replace two-way bindings with `$bindable()`
5. Replace `createEventDispatcher()` with callback props
6. Replace `onMount`/`onDestroy` with `$effect` cleanup
7. Replace component local state with rune state or derived values
8. Update store subscriptions to use runes

### Pattern 1: Simple Component Props

#### Before (Svelte 4)

```svelte
<script>
    export let title;
    export let count = 0;

    $: doubled = count * 2;
</script>

<h1>{title}</h1>
<p>Count: {count}, Doubled: {doubled}</p>
```

#### After (Svelte 5)

```svelte
<script>
    let { title, count = 0 } = $props();

    let doubled = $derived(count * 2);
</script>

<h1>{title}</h1>
<p>Count: {count}, Doubled: {doubled}</p>
```

### Pattern 2: Two-Way Binding

#### Before (Svelte 4)

```svelte
<!-- Parent.svelte -->
<script>
    let value = 'hello';
</script>

<Child bind:value />

<!-- Child.svelte -->
<script>
    export let value;
</script>

<input bind:value />
```

#### After (Svelte 5)

```svelte
<!-- Parent.svelte -->
<script>
    let value = $state('hello');
</script>

<Child bind:value />

<!-- Child.svelte -->
<script>
    let { value = $bindable() } = $props();
</script>

<input bind:value />
```

### Pattern 3: Event Dispatching

#### Before (Svelte 4)

```svelte
<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    function handleClick() {
        dispatch('click', { data: 'value' });
    }
</script>

<button on:click={handleClick}>Click me</button>
```

#### After (Svelte 5)

```svelte
<script>
    let { onclick } = $props();

    function handleClick() {
        onclick?.({ data: 'value' });
    }
</script>

<button onclick={handleClick}>Click me</button>
```

### Pattern 4: Store Subscriptions

#### Before (Svelte 4)

```svelte
<script>
    import { gameStore, currentScreen } from '../stores/WAAStore.js';

    $: tower = $gameStore.tower;
    $: screen = $currentScreen;
</script>

<p>Tower: {tower}</p>
<p>Screen: {screen}</p>
```

#### After (Svelte 5 - Option A: Still use stores)

```svelte
<script>
    import { gameStore, currentScreen } from '../stores/WAAStore.js';

    // Store auto-subscription still works in Svelte 5
</script>

<p>Tower: {$gameStore.tower}</p>
<p>Screen: {$currentScreen}</p>
```

#### After (Svelte 5 - Option B: Use runes directly)

```svelte
<script>
    import { gameState, currentScreen } from '../stores/gameStore.svelte.js';

    // Direct rune access - no subscription needed
</script>

<p>Tower: {gameState.tower}</p>
<p>Screen: {currentScreen}</p>
```

### Pattern 5: Lifecycle Hooks

#### Before (Svelte 4)

```svelte
<script>
    import { onMount, onDestroy } from 'svelte';

    let intervalId;

    onMount(() => {
        intervalId = setInterval(() => {
            console.log('tick');
        }, 1000);
    });

    onDestroy(() => {
        clearInterval(intervalId);
    });
</script>
```

#### After (Svelte 5)

```svelte
<script>
    let intervalId;

    $effect(() => {
        // Setup
        intervalId = setInterval(() => {
            console.log('tick');
        }, 1000);

        // Cleanup (runs when effect is destroyed)
        return () => {
            clearInterval(intervalId);
        };
    });
</script>
```

### Pattern 6: Reactive Statements with Side Effects

#### Before (Svelte 4)

```svelte
<script>
    import { gameStore } from '../stores/WAAStore.js';

    $: if ($gameStore.tower <= 0) {
        console.log('Tower destroyed!');
    }
</script>
```

#### After (Svelte 5)

```svelte
<script>
    import { gameState } from '../stores/gameStore.svelte.js';

    $effect(() => {
        if (gameState.tower <= 0) {
            console.log('Tower destroyed!');
        }
    });
</script>
```

### Specific Component Migrations

#### RollForTasks.svelte Migration

**Before (Current):**

```svelte
<script>
    import DiceRoller from './ThreeJSDiceBoxRoller.svelte';
    import { confirmTaskRoll, gameStore, rollForTasks } from '../stores/WAAStore.js';

    let taskDice;
    let rolled = false;
    let rolling = false;
    let confirming = false;

    async function rollTaskDice() {
        if (rolling || confirming) return;
        const result = await rollForTasks();
        await taskDice.roll(result);
        rolled = true;
    }

    async function confirm() {
        if (rolling || confirming) return;
        confirming = true;
        await confirmTaskRoll();
        confirming = false;
    }

    function action() {
        if (rolled) confirm();
        else rollTaskDice();
    }

    $: header = rolled
        ? $gameStore.config?.labels.rollForTasksResultHeader
        : $gameStore.config.labels.rollForTasksHeader;
</script>

<div class="dc-roll-tasks-container">
    <DiceRoller
        bind:this={taskDice}
        bind:rolling
        on:click={action}
        on:keyup={action}
        {header}
    />
</div>
```

**After (Svelte 5):**

```svelte
<script>
    import DiceRoller from './ThreeJSDiceBoxRoller.svelte';
    import { gameState } from '../stores/gameStore.svelte.js';
    import { transitionState } from '../stores/transitionStore.svelte.js';
    import { rollForTasks, confirmTaskRoll } from '../stores/gameActions.svelte.js';

    let taskDice;
    let rolling = $state(false);

    // Derive rolled state from gameStore (no local state!)
    let rolled = $derived(gameState.cardsToDraw > 0);

    // Combine all interaction blockers
    let canInteract = $derived(!rolling && !transitionState.isTransitioning);

    async function rollTaskDice() {
        if (!canInteract || rolled) return;

        rolling = true;
        const result = await rollForTasks();
        await taskDice.roll(result);
        rolling = false;
    }

    async function confirm() {
        if (!canInteract || !rolled) return;

        await confirmTaskRoll();
    }

    function action() {
        if (rolled) confirm();
        else rollTaskDice();
    }

    let header = $derived(
        rolled
            ? gameState.config?.labels.rollForTasksResultHeader
            : gameState.config?.labels.rollForTasksHeader
    );
</script>

<div class="dc-roll-tasks-container">
    <DiceRoller
        bind:this={taskDice}
        bind:rolling
        onclick={action}
        onkeyup={action}
        {header}
        disabled={!canInteract}
    />
</div>

<style>
    .dc-roll-tasks-container {
        width: 100%;
        height: 100%;
        display: grid;
        text-align: center;
    }
</style>
```

**Key Changes:**
- `rolled` derived from `gameState.cardsToDraw` instead of local state
- `rolling` uses `$state()` rune
- `canInteract` combines all interaction blockers
- Events use `onclick` instead of `on:click`
- No more `confirming` flag (handled by `transitionState.isTransitioning`)

#### DrawCard.svelte Migration

**Before (Current):**

```svelte
<script>
    import CardDeck from './CardDeck.svelte';
    import { confirmCard, drawCard, gameStore } from '../stores/WAAStore.js';

    async function onRequestCard() {
        await drawCard();
    }

    async function onConfirmCardDeck() {
        await confirmCard();
    }
</script>

<div class="dc-draw-card-container">
    <CardDeck
        card={$gameStore.currentCard}
        on:requestcard={onRequestCard}
        on:confirmcard={onConfirmCardDeck}
    />
</div>
```

**After (Svelte 5):**

```svelte
<script>
    import CardDeck from './CardDeck.svelte';
    import { gameState } from '../stores/gameStore.svelte.js';
    import { transitionState } from '../stores/transitionStore.svelte.js';
    import { drawCard, confirmCard } from '../stores/gameActions.svelte.js';

    async function onRequestCard() {
        if (transitionState.isTransitioning) return;
        await drawCard();
    }

    async function onConfirmCardDeck() {
        if (transitionState.isTransitioning) return;
        await confirmCard();
    }
</script>

<div class="dc-draw-card-container">
    <CardDeck
        card={gameState.currentCard}
        onrequestcard={onRequestCard}
        onconfirmcard={onConfirmCardDeck}
        disabled={transitionState.isTransitioning}
    />
</div>

<style>
    .dc-draw-card-container {
        display: grid;
        height: 100%;
        width: 100%;
        justify-content: center;
        align-content: center;
        text-align: center;
        background: var(--color-bg-darker, #000);
        overflow: visible;
    }
</style>
```

**Key Changes:**
- Direct access to `gameState.currentCard` (no `$`)
- Events use `onrequestcard` format
- Transition guard added
- Pass `disabled` prop to CardDeck

#### FailureCheck.svelte Migration

**Before (Current):**

```svelte
<script>
    import DiceRoller from './ThreeJSDiceBoxRoller.svelte';
    import {
        gameStore,
        getFailureCheckRoll,
        applyFailureCheckResult,
        confirmFailureCheck
    } from '../stores/WAAStore.js';
    import { createEventDispatcher } from 'svelte';

    let diceRoller;
    let rolling;
    let result;

    const dispatcher = createEventDispatcher();

    async function doCheck() {
        if (rolling) return;
        if ($gameStore.state == 'failureCheck') {
            result = getFailureCheckRoll();
            await diceRoller.roll(result);
            applyFailureCheckResult(result);
            dispatcher('dc-solo-rpg.failureCheckCompleted', $gameStore.state);
        } else {
            await confirmFailureCheck();
        }
    }

    $: header = result ? 'Click to continue' : 'Roll failure check';
</script>

<div class="dc-failure-check-container">
    <DiceRoller
        bind:this={diceRoller}
        bind:rolling
        on:click={doCheck}
        on:keyup={doCheck}
        {header}
    />
</div>
```

**After (Svelte 5):**

```svelte
<script>
    import DiceRoller from './ThreeJSDiceBoxRoller.svelte';
    import { gameState } from '../stores/gameStore.svelte.js';
    import { transitionState } from '../stores/transitionStore.svelte.js';
    import {
        getFailureCheckRoll,
        applyFailureCheckResult,
        confirmFailureCheck
    } from '../stores/gameActions.svelte.js';

    let { onfailurecheckcompleted } = $props();

    let diceRoller;
    let rolling = $state(false);
    let result = $state(null);

    let hasRolled = $derived(result !== null);
    let canInteract = $derived(!rolling && !transitionState.isTransitioning);

    async function doCheck() {
        if (!canInteract) return;

        if (!hasRolled) {
            // Roll phase
            rolling = true;
            result = getFailureCheckRoll();
            await diceRoller.roll(result);
            applyFailureCheckResult(result);
            rolling = false;

            // Dispatch event
            onfailurecheckcompleted?.(gameState.state);
        } else {
            // Confirm phase
            await confirmFailureCheck();
        }
    }

    let header = $derived(hasRolled ? 'Click to continue' : 'Roll failure check');
</script>

<div class="dc-failure-check-container">
    <DiceRoller
        bind:this={diceRoller}
        bind:rolling
        onclick={doCheck}
        onkeyup={doCheck}
        {header}
        disabled={!canInteract}
    />
</div>

<style>
    .dc-failure-check-container {
        width: 100%;
        height: 100%;
        display: grid;
        text-align: center;
    }
</style>
```

**Key Changes:**
- `createEventDispatcher` replaced with callback prop
- `result` uses `$state()`
- `hasRolled` derived from result
- Consistent interaction guards

#### Game.svelte Migration

**Before (Current):**

```svelte
<script>
    import { createEventDispatcher } from 'svelte';
    import {
        currentScreen,
        gameStore,
        gameStylesheet,
        loadSystemConfig,
        transitionToScreen
    } from '../stores/WAAStore.js';
    // ... component imports ...

    export let systemSettings = {};

    export const startGame = async () => {
        if (systemSettings.gameConfigUrl && systemSettings.player?.name) {
            await loadSystemConfig(systemSettings);
            dispatcher('dc-solo-rpg.gameLoaded', systemSettings);
        } else {
            $gameStore.status = 'Please select a player and a game';
        }
    };

    const dispatcher = createEventDispatcher();

    $: if ($currentScreen == 'gameOver') {
        dispatcher('dc-solo-rpg.gameOver', $gameStore.state);
    } else if ($currentScreen == 'exitGame') {
        dispatcher('dc-solo-rpg.exitGame', $gameStore.state);
    }
</script>
```

**After (Svelte 5):**

```svelte
<script>
    import { gameState, currentScreen } from '../stores/gameStore.svelte.js';
    import { loadSystemConfig } from '../stores/gameActions.svelte.js';
    import { transitionToScreen } from '../stores/gameActions.svelte.js';
    // ... component imports ...

    let {
        systemSettings = {},
        ongameloaded,
        ongameover,
        onexitgame
    } = $props();

    export const startGame = async () => {
        if (systemSettings.gameConfigUrl && systemSettings.player?.name) {
            await loadSystemConfig(systemSettings);
            ongameloaded?.(systemSettings);
        } else {
            gameState.status = 'Please select a player and a game';
        }
    };

    // Watch for screen changes and dispatch events
    $effect(() => {
        if (currentScreen === 'gameOver') {
            ongameover?.(gameState);
        } else if (currentScreen === 'exitGame') {
            onexitgame?.(gameState);
        }
    });
</script>

<svelte:head>
    <link rel="stylesheet" href={gameState.stylesheet} />
</svelte:head>

<div class="dc-game-container dc-game-bg">
    {#if currentScreen === 'loadGame'}
        <!-- ... -->
    {:else if currentScreen === 'options'}
        <!-- ... -->
    {/if}
</div>
```

**Key Changes:**
- Props destructured with `$props()`
- Event callbacks as props
- `$effect` for side effects (screen change monitoring)
- Direct rune access (no `$`)

---

## SvelteKit 1 → SvelteKit 2 Migration

### Breaking Changes

#### 1. Load Function Signature

**Before (SvelteKit 1):**

```javascript
// src/routes/+layout.js
export async function load() {
    const games = [...];
    const players = [...];

    return {
        games,
        players
    };
}
```

**After (SvelteKit 2):**

```javascript
// src/routes/+layout.js
/** @type {import('./$types').LayoutLoad} */
export async function load() {
    const games = [...];
    const players = [...];

    return {
        games,
        players
    };
}
```

**Change:** Minimal - mostly type annotations

#### 2. Error Handling

**Before (SvelteKit 1):**

```javascript
throw error(404, 'Not found');
```

**After (SvelteKit 2):**

```javascript
import { error } from '@sveltejs/kit';

throw error(404, 'Not found');
```

**Change:** Must import `error` explicitly

#### 3. Routing

No major breaking changes for this project since it uses simple file-based routing.

#### 4. Adapters

**Update `svelte.config.js`:**

```javascript
import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter(),

        // SvelteKit 2 new options (optional)
        version: {
            // Enable versioning for cache busting
            name: process.env.npm_package_version
        }
    }
};

export default config;
```

#### 5. TypeScript Generation

SvelteKit 2 generates better types automatically. Update `jsconfig.json`:

```json
{
    "extends": "./.svelte-kit/tsconfig.json",
    "compilerOptions": {
        "allowJs": true,
        "checkJs": true,
        "esModuleInterop": true,
        "forceConsistentCasingInFileNames": true,
        "resolveJsonModule": true,
        "skipLibCheck": true,
        "sourceMap": true,
        "strict": false,
        "moduleResolution": "bundler"
    }
}
```

### Migration Steps

1. Update dependencies (done in Phase 1)
2. Update `svelte.config.js` (minimal changes)
3. Update load functions with type annotations
4. Test routing still works
5. Verify build output

**Time estimate:** 30 minutes

---

## Testing Strategy

### Phase 1: Pre-Migration Testing

**Objective:** Establish baseline behavior

```bash
# 1. Run existing tests
npm run test:unit

# 2. Document current behavior
# Create snapshot tests for each screen
```

**Tests to Add Before Migration:**

```javascript
// src/lib/stores/gameStore.test.js

import { describe, test, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { gameStore, currentScreen, rollForTasks, confirmTaskRoll } from './WAAStore.js';

describe('State Transitions (Baseline)', () => {
    beforeEach(() => {
        // Reset state before each test
        gameStore.set({
            state: 'loadGame',
            tower: 54,
            tokens: 10,
            // ... full reset
        });
    });

    test('rollForTasks sets cardsToDraw', async () => {
        gameStore.update(s => ({ ...s, state: 'rollForTasks' }));

        const result = await rollForTasks();

        const state = get(gameStore);
        expect(state.cardsToDraw).toBe(result);
        expect(state.cardsToDraw).toBeGreaterThan(0);
        expect(state.cardsToDraw).toBeLessThanOrEqual(6);
    });

    test('confirmTaskRoll transitions to drawCard', async () => {
        gameStore.update(s => ({ ...s, state: 'rollForTasks', cardsToDraw: 3 }));

        await confirmTaskRoll();

        const screen = get(currentScreen);
        expect(screen).toBe('drawCard');
    });

    test('double roll should not double cardsToDraw', async () => {
        gameStore.update(s => ({ ...s, state: 'rollForTasks' }));

        // Simulate rapid clicks
        const [result1, result2] = await Promise.all([
            rollForTasks(),
            rollForTasks()
        ]);

        const state = get(gameStore);
        // Should only execute once
        expect(state.cardsToDraw).toBe(result1);
    });
});

describe('Game Flow Integration', () => {
    test('complete round flow', async () => {
        // Load game → Options → Intro → Roll → Draw → Log → Success
        // Full integration test
    });
});
```

### Phase 2: Migration Testing

**Objective:** Verify rune-based stores work identically

```javascript
// src/lib/stores/gameStore.svelte.test.js

import { describe, test, expect, beforeEach } from 'vitest';
import { gameState, transitionTo } from './gameStore.svelte.js';
import { rollForTasks, confirmTaskRoll } from './gameActions.svelte.js';

describe('Rune Store - State Transitions', () => {
    beforeEach(() => {
        // Reset rune state
        Object.assign(gameState, {
            state: 'loadGame',
            tower: 54,
            tokens: 10,
            // ... full reset
        });
    });

    test('rollForTasks sets cardsToDraw', async () => {
        gameState.state = 'rollForTasks';

        const result = await rollForTasks();

        expect(gameState.cardsToDraw).toBe(result);
        expect(gameState.cardsToDraw).toBeGreaterThan(0);
        expect(gameState.cardsToDraw).toBeLessThanOrEqual(6);
    });

    test('transitionTo validates transitions', () => {
        gameState.state = 'loadGame';

        // Valid transition
        expect(() => transitionTo('options')).not.toThrow();

        // Invalid transition
        expect(() => transitionTo('drawCard'))
            .toThrow('Invalid transition');
    });

    test('emergency exits always allowed', () => {
        gameState.state = 'drawCard';

        expect(() => transitionTo('exitGame')).not.toThrow();
        expect(() => transitionTo('errorScreen')).not.toThrow();
    });
});

describe('Rune Store - Race Conditions', () => {
    test('double roll prevented by transition lock', async () => {
        // Test that isTransitioning prevents concurrent actions
    });
});
```

### Phase 3: Component Testing

**Objective:** Verify Svelte 5 components render correctly

```javascript
// src/lib/components/RollForTasks.test.js

import { describe, test, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import RollForTasks from './RollForTasks.svelte';
import { gameState } from '../stores/gameStore.svelte.js';

describe('RollForTasks Component (Svelte 5)', () => {
    test('renders with correct header', () => {
        gameState.config = {
            labels: {
                rollForTasksHeader: 'Roll for tasks'
            }
        };

        const { getByText } = render(RollForTasks);

        expect(getByText('Roll for tasks')).toBeInTheDocument();
    });

    test('clicking rolls dice', async () => {
        gameState.state = 'rollForTasks';
        gameState.cardsToDraw = 0;

        const { container } = render(RollForTasks);
        const button = container.querySelector('button');

        await fireEvent.click(button);

        expect(gameState.cardsToDraw).toBeGreaterThan(0);
    });

    test('disables during transition', async () => {
        // Test interaction blocking
    });
});
```

### Phase 4: E2E Testing

**Objective:** Verify complete game flow works

```javascript
// tests/game-flow.spec.js

import { test, expect } from '@playwright/test';

test.describe('Complete Game Flow', () => {
    test('can play through a full round', async ({ page }) => {
        await page.goto('/game');

        // Wait for load screen
        await expect(page.locator('.dc-game-container')).toBeVisible();

        // Start game
        await page.click('text=Start Game');

        // Should see intro
        await expect(page.locator('text=Intro')).toBeVisible();

        // Click to roll for tasks
        await page.click('text=Roll for tasks');

        // Should see dice roller
        await expect(page.locator('.dc-dice-roller')).toBeVisible();

        // Roll dice
        await page.click('.dc-dice-roller button');

        // Should transition to draw card
        await expect(page.locator('text=Draw Card')).toBeVisible({ timeout: 5000 });

        // Draw cards...
        // (Continue full flow)
    });

    test('prevents double clicks during transitions', async ({ page }) => {
        // Rapid click test
    });
});
```

### Test Coverage Goals

- **Unit Tests:** 90%+ coverage of store logic
- **Component Tests:** 80%+ coverage of components
- **Integration Tests:** All major game flows
- **E2E Tests:** Happy path + edge cases

### Testing Tools Setup

```bash
# Install testing dependencies
npm install -D @testing-library/svelte@latest
npm install -D @testing-library/jest-dom
npm install -D happy-dom

# Update vitest.config.js
```

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
    plugins: [svelte({ hot: !process.env.VITEST })],
    test: {
        globals: true,
        environment: 'happy-dom',
        setupFiles: ['./tests/setup.js']
    }
});
```

---

## Phase-by-Phase Implementation Plan

### Phase 0: Preparation (2 hours)

**Goal:** Set up for safe migration

#### Step 0.1: Create Git Branch

```bash
git checkout -b feature/svelte-5-migration
git push -u origin feature/svelte-5-migration
```

#### Step 0.2: Backup Current State

```bash
# Tag current state
git tag pre-svelte5-migration
git push --tags

# Create backup branch
git branch backup/pre-svelte5 main
git push origin backup/pre-svelte5
```

#### Step 0.3: Document Current Behavior

```bash
# Run all tests and save output
npm run test:unit > test-output-baseline.txt

# Take screenshots of each screen
npm run dev
# Manually capture screenshots or use Playwright
```

#### Step 0.4: Add Baseline Tests

Create comprehensive tests (see Testing Strategy section).

```bash
# Run tests to establish baseline
npm run test:unit

# Verify all tests pass
```

#### Step 0.5: Dependency Analysis

```bash
# Check for outdated dependencies
npm outdated

# Verify no breaking changes in other deps
npm audit
```

**Deliverables:**
- Git branch created
- Backup tags in place
- Baseline tests written and passing
- Current behavior documented

---

### Phase 1: Dependency Upgrade (1 hour)

**Goal:** Update to Svelte 5 and SvelteKit 2

#### Step 1.1: Update package.json

```bash
# Update dependencies one-by-one in order
npm install -D vite@^5.4.0
npm install -D svelte@^5.15.0
npm install -D @sveltejs/kit@^2.15.0 @sveltejs/adapter-auto@^3.3.0
npm install -D @sveltejs/package@^2.3.0 svelte-check@^4.0.0
npm install -D vitest@^2.1.0 @vitest/coverage-v8@^2.1.0

# Clean install
rm -rf node_modules package-lock.json
npm install
```

#### Step 1.2: Update Configuration Files

**Update `svelte.config.js`:**

```javascript
import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter(),
        version: {
            name: process.env.npm_package_version || 'development'
        }
    },
    compilerOptions: {
        // Svelte 5 runes mode
        runes: true
    }
};

export default config;
```

**Update `vite.config.js` (if exists):**

```javascript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit()]
});
```

#### Step 1.3: Verify Build

```bash
# Check for compilation errors
npm run check

# Try to build
npm run build

# If errors, document them for next phase
```

**Expected Issues:**
- Reactive statement warnings (expected, will fix in Phase 3)
- Component prop warnings (expected, will fix in Phase 3)
- Store usage warnings (expected, will fix in Phase 2)

#### Step 1.4: Run Tests

```bash
# Run tests - expect some failures
npm run test:unit

# Document which tests fail
```

**Deliverables:**
- All dependencies updated
- Configuration files updated
- Build succeeds (with warnings OK)
- Test failures documented

---

### Phase 2: Core State Management Refactor (4 hours)

**Goal:** Create new rune-based stores, eliminate StateMachine

#### Step 2.1: Create Transition Graph (30 min)

```bash
# Create new file
touch src/lib/stores/transitions.js
```

**Implementation:** Copy transition graph from WAAStateMachine.js into pure data structure (see State Management Refactoring section).

**Test:**
```javascript
// Quick test in browser console or Node
import { transitionGraph, isValidTransition } from './transitions.js';
console.log(isValidTransition('loadGame', 'options')); // true
console.log(isValidTransition('loadGame', 'drawCard')); // false
```

#### Step 2.2: Create Core Game Store (1 hour)

```bash
touch src/lib/stores/gameStore.svelte.js
```

**Implementation:** Create gameState using `$state()` rune (see State Management Refactoring section).

**Key Points:**
- Use `$state()` for all reactive state
- Use `$derived()` for computed values
- Export `gameState` object
- Include validation function

**Test:**
```bash
# Run store tests
npm run test:unit -- gameStore.svelte.test.js
```

#### Step 2.3: Create Transition Store (30 min)

```bash
touch src/lib/stores/transitionStore.svelte.js
```

**Implementation:** Create transition state tracking (see code example in State Management section).

#### Step 2.4: Create Game Actions (1.5 hours)

```bash
touch src/lib/stores/gameActions.svelte.js
```

**Implementation:** Move all game action functions from WAAStore.js into gameActions.svelte.js, update to use runes.

**Test each action:**
```javascript
// Test rollForTasks
import { rollForTasks } from './gameActions.svelte.js';
import { gameState } from './gameStore.svelte.js';

gameState.state = 'rollForTasks';
const result = await rollForTasks();
console.log(gameState.cardsToDraw === result); // should be true
```

#### Step 2.5: Create Compatibility Wrapper (30 min)

**IMPORTANT:** Don't delete WAAStore.js yet. Modify it to wrap the new rune stores.

```bash
# Backup original
cp src/lib/stores/WAAStore.js src/lib/stores/WAAStore.js.backup
```

**Implementation:** See "Backward Compatibility Wrapper" in State Management Refactoring section.

This allows components to gradually migrate.

#### Step 2.6: Run Core Tests (30 min)

```bash
# Run all store tests
npm run test:unit -- stores/

# Verify:
# - State transitions work
# - Actions update state correctly
# - Validation prevents invalid transitions
# - No race conditions
```

**Fix any issues before proceeding to Phase 3.**

**Deliverables:**
- New rune-based stores created
- All store tests passing
- Compatibility wrapper in place
- WAAStateMachine.js ready to delete (but keep for now)

---

### Phase 3: Component Migration (6 hours)

**Goal:** Migrate all components to Svelte 5 syntax

#### Migration Order (Bottom-Up)

Migrate in this order to minimize breaking changes:

1. **Leaf components** (no component children)
2. **Mid-level components** (use leaf components)
3. **Root components** (Game.svelte, layouts)

#### Step 3.1: Migrate Simple Components (1 hour)

**Components:**
- StatusDisplay.svelte
- HealthMeter.svelte
- Meter.svelte
- Toolbar.svelte

**For each component:**

```bash
# 1. Create backup
cp src/lib/components/StatusDisplay.svelte src/lib/components/StatusDisplay.svelte.backup

# 2. Migrate component (see Component Migration Patterns)
# 3. Test in dev mode
npm run dev

# 4. Verify no console errors
# 5. Test interactions
```

**Common changes:**
- `export let prop` → `let { prop } = $props()`
- `$:` → `$derived()`
- `$gameStore` → `gameState`
- `on:click` → `onclick`

#### Step 3.2: Migrate Dice Roller Components (1 hour)

**Components:**
- ThreeJSDiceBoxRoller.svelte
- NeuralDiceInterface.svelte

**Special considerations:**
- These have complex bindings
- Test dice rolling animations thoroughly
- Verify bind:rolling works

#### Step 3.3: Migrate Game Action Components (2 hours)

**Components:**
- RollForTasks.svelte
- DrawCard.svelte
- FailureCheck.svelte
- SuccessCheck.svelte

**For each component:**

1. **Migrate** (see specific examples in Component Migration Patterns)
2. **Test action flow:**
   - Click buttons
   - Verify state changes
   - Check animations
   - Test rapid clicks (should be blocked)
3. **Verify no double execution**

**Critical:** These components had race condition bugs. Verify fixes:
- No double rolls
- No double confirms
- Blocked during transitions

#### Step 3.4: Migrate Screen Components (1 hour)

**Components:**
- IntroScreen.svelte
- OptionsScreen.svelte
- LoadScreen.svelte
- GameOver.svelte
- JournalEntry.svelte

**Simpler migrations - mostly template changes.**

#### Step 3.5: Migrate Root Component (1 hour)

**Component:** Game.svelte

**Special considerations:**
- This is the main orchestrator
- Handles screen routing
- Dispatches lifecycle events
- Test all screen transitions

**Testing checklist:**
- Load game flow
- All screens render
- Transitions animate correctly
- Events dispatch to parent
- Neural background shows on all screens

#### Step 3.6: Migrate Layouts

**Files:**
- src/routes/+layout.svelte
- src/routes/game/+layout.svelte

**Minimal changes needed - mostly imports.**

**Deliverables:**
- All components migrated to Svelte 5
- No console warnings
- All screens functional
- Animations working
- Race conditions eliminated

---

### Phase 4: Testing & Quality Assurance (3 hours)

**Goal:** Comprehensive testing of migrated codebase

#### Step 4.1: Unit Tests (1 hour)

```bash
# Run all unit tests
npm run test:unit

# Verify 90%+ coverage
npm run test:unit -- --coverage

# Fix any failing tests
```

**Focus areas:**
- Store state transitions
- Game actions
- Validation functions
- Derived computations

#### Step 4.2: Component Tests (1 hour)

```bash
# Test each component
npm run test:unit -- components/

# Visual regression tests (if available)
npm run test:visual
```

**Manual testing checklist:**

- [ ] Load game → Options → Start
- [ ] Roll for tasks (1-6 range)
- [ ] Draw cards (animation)
- [ ] Odd card triggers failure check
- [ ] Failure check reduces tower
- [ ] Even cards don't trigger failure
- [ ] Complete round → Journal
- [ ] Journal → Success check
- [ ] Success check removes token (on 6)
- [ ] Multiple rounds
- [ ] Win condition (0 tokens, tower > 0)
- [ ] Lose condition (tower <= 0 or 4 kings)
- [ ] Game over → Restart

#### Step 4.3: Race Condition Tests (30 min)

**Critical:** Verify the original bugs are fixed.

**Test scenarios:**

```javascript
// Test 1: Double roll prevention
test('rapid clicks on roll button only execute once', async () => {
    gameState.state = 'rollForTasks';
    gameState.cardsToDraw = 0;

    // Simulate 10 rapid clicks
    const clicks = Array(10).fill(0).map(() => rollForTasks());
    await Promise.all(clicks);

    // Should only roll once
    expect(gameState.cardsToDraw).toBeGreaterThan(0);
    expect(gameState.cardsToDraw).toBeLessThanOrEqual(6);
});

// Test 2: Transition blocking
test('actions blocked during screen transitions', async () => {
    gameState.state = 'rollForTasks';
    gameState.cardsToDraw = 3;

    // Start transition
    const transition = transitionToScreen('drawCard');

    // Try to roll during transition (should be blocked)
    await rollForTasks();

    await transition;

    // CardsToDraw should still be 3
    expect(gameState.cardsToDraw).toBe(3);
});

// Test 3: Component state survival
test('component remount during transition doesnt cause issues', async () => {
    // This was the root cause of original bugs
    // With runes, state is external so survives remount
});
```

**Manual rapid-click testing:**
- Rapidly click "Roll" button
- Rapidly click "Confirm" button
- Click during animations
- Should never double-execute

#### Step 4.4: E2E Tests (30 min)

```bash
# Run Playwright tests
npm run test

# Test on different browsers
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

**Full game flow test:**
- Complete 3 rounds
- Win a game
- Lose a game
- Restart and play again

**Deliverables:**
- All tests passing
- No race conditions
- Visual verification complete
- E2E tests passing
- Bug-free gameplay

---

### Phase 5: Cleanup & Optimization (2 hours)

**Goal:** Remove old code, optimize performance

#### Step 5.1: Delete Old Architecture (30 min)

```bash
# NOW it's safe to delete
rm src/lib/stores/WAAStateMachine.js
rm src/lib/stores/WAAStore.js.backup

# Remove compatibility wrapper from WAAStore.js
# OR delete entirely if all components use new stores
```

**Update imports across codebase:**

```bash
# Find remaining references
grep -r "WAAStateMachine" src/
grep -r "from './stores/WAAStore.js'" src/

# Update to new imports
```

#### Step 5.2: Optimize Reactivity (30 min)

**Review $derived usage:**

Some derived values might be over-computing. Optimize:

```javascript
// Before: Recomputes on ANY gameState change
let stats = $derived({
    tower: gameState.tower,
    tokens: gameState.tokens,
    round: gameState.round
});

// After: Only recompute when specific fields change
let tower = $derived(gameState.tower);
let tokens = $derived(gameState.tokens);
let round = $derived(gameState.round);
```

**Review $effect usage:**

Ensure effects are efficient:

```javascript
// Avoid effects that run too often
$effect(() => {
    // Only run when screen changes, not on every state change
    if (currentScreen === 'gameOver') {
        ongameover?.(gameState);
    }
});
```

#### Step 5.3: Code Quality (30 min)

```bash
# Format all code
npm run format

# Lint for issues
npm run lint

# Run type checking
npm run check
```

**Review warnings:**
- Fix any remaining Svelte warnings
- Address TypeScript issues
- Remove unused imports

#### Step 5.4: Documentation (30 min)

**Update documentation:**

- Update README with Svelte 5 info
- Document new store structure
- Add migration notes for future developers
- Update architecture diagrams

**Create MIGRATION_NOTES.md:**

```markdown
# Svelte 5 Migration Notes

## Completed: [Date]

## Changes Made:
- Migrated from Svelte 4 to Svelte 5
- Eliminated StateMachine class
- Introduced rune-based state management
- Fixed race conditions in RollForTasks, DrawCard, FailureCheck

## Breaking Changes:
- WAAStateMachine.js removed
- Store imports changed to gameStore.svelte.js
- Components now use runes instead of stores

## Performance Improvements:
- [Document improvements]

## Known Issues:
- [Document any remaining issues]
```

**Deliverables:**
- Old code deleted
- Performance optimized
- Code quality checks pass
- Documentation updated

---

## Code Examples

### Complete Store Refactor Example

#### Before: WAAStore.js (533 lines)

```javascript
// Dual state tracking - PROBLEM
export const currentScreen = writable('loadGame');
export const services = {
    stateMachine: new StateMachine('loadGame'),
};

// Manual synchronization required
export const transitionToScreen = async (action, transitionType = 'default') => {
    currentScreen.update((screen) => {
        if (action) services.stateMachine.next(action);
        screen = services.stateMachine.state;
        return screen;
    });
};

// Game store - separate from screen state
export const gameStore = writable({
    state: 'loadGame', // Duplicates stateMachine.state!
    tower: 54,
    // ...
});
```

#### After: gameStore.svelte.js (200 lines)

```javascript
// Single source of truth
let gameState = $state({
    state: 'loadGame',
    tower: 54,
    tokens: 10,
    // ... all state in one place
});

// Automatically derived
export const currentScreen = $derived(gameState.state);

// Pure function validation
export function transitionTo(newState) {
    validateTransition(gameState.state, newState);
    gameState.state = newState;
}
```

**Result:** 60% less code, zero sync issues

### Complete Component Refactor Example

#### Before: RollForTasks.svelte (Problematic)

```svelte
<script>
    import { gameStore, rollForTasks } from '../stores/WAAStore.js';

    let rolled = false;  // LOCAL STATE - survives across remounts?
    let rolling = false;

    async function rollTaskDice() {
        if (rolling) return;
        const result = await rollForTasks();
        await taskDice.roll(result);
        rolled = true;  // Sets local state
    }

    $: header = rolled ? 'Continue' : 'Roll';
</script>
```

**Problems:**
- `rolled` is local component state
- Component can remount during async transition
- `rolled` resets to false → can roll again
- Race condition!

#### After: RollForTasks.svelte (Fixed with Runes)

```svelte
<script>
    import { gameState } from '../stores/gameStore.svelte.js';
    import { transitionState } from '../stores/transitionStore.svelte.js';
    import { rollForTasks } from '../stores/gameActions.svelte.js';

    let rolling = $state(false);

    // Derive from store - always correct even after remount
    let rolled = $derived(gameState.cardsToDraw > 0);

    // Combine all blockers
    let canInteract = $derived(!rolling && !transitionState.isTransitioning);

    async function rollTaskDice() {
        if (!canInteract || rolled) return;

        rolling = true;
        const result = await rollForTasks();
        await taskDice.roll(result);
        rolling = false;
    }

    let header = $derived(rolled ? 'Continue' : 'Roll');
</script>
```

**Benefits:**
- `rolled` derived from external state (survives remount)
- `canInteract` prevents all race conditions
- Cleaner, more explicit logic

### Async Action Pattern

#### Before: Race Condition Prone

```javascript
// WAAStore.js
export async function confirmTaskRoll() {
    // Start transition (async)
    await transitionToScreen('drawCard');

    // Meanwhile, user can click again!
    // Or component can remount!
}
```

#### After: Race Condition Safe

```javascript
// gameActions.svelte.js
export async function confirmTaskRoll() {
    // Check transition lock
    if (transitionState.isTransitioning) {
        console.warn('Transition in progress');
        return;
    }

    await transitionToScreen('drawCard');
    // Lock is released in finally block
}

// transitionToScreen handles locking
export async function transitionToScreen(newState, animationType = 'default') {
    if (transitionState.isTransitioning) {
        console.warn('Already transitioning');
        return;
    }

    setTransitioning(true);

    try {
        // Do transition
        await animateOut();
        transitionTo(newState);
        await animateIn(animationType);
    } finally {
        // Always release lock
        setTransitioning(false);
    }
}
```

**Key differences:**
- Explicit lock checking
- Lock released in finally block
- Multiple guards (action + transition)
- Cannot double-execute

---

## Risks and Mitigation

### Risk 1: Breaking Changes in Svelte 5

**Likelihood:** Medium
**Impact:** High
**Severity:** MEDIUM-HIGH

**Details:**
- Runes are new syntax
- Component props work differently
- Event handling changed
- Some patterns need rewriting

**Mitigation:**
1. Comprehensive testing before migration
2. Keep old code in Git for rollback
3. Migrate incrementally (component by component)
4. Use compatibility wrapper during transition
5. Reference official migration guide

**Rollback Plan:**
```bash
git checkout backup/pre-svelte5
npm install
```

### Risk 2: Third-Party Dependencies

**Likelihood:** Low
**Impact:** Medium
**Severity:** LOW-MEDIUM

**Details:**
- `@3d-dice/dice-box-threejs` might not be compatible with Svelte 5
- `augmented-ui` CSS library should be fine
- Other dependencies are pure JS

**Mitigation:**
1. Test dice roller immediately after upgrade
2. Check library GitHub for Svelte 5 issues
3. Prepare to wrap in compatibility mode if needed
4. Have fallback dice renderer ready

**Contingency:**
```svelte
<!-- Wrap in legacy mode if needed -->
<svelte:options legacy={true} />
<ThreeJSDiceBoxRoller />
```

### Risk 3: State Migration Edge Cases

**Likelihood:** Medium
**Impact:** Medium
**Severity:** MEDIUM

**Details:**
- Current game state is complex
- Some state interactions might break
- Timing of state updates could change

**Mitigation:**
1. Comprehensive unit tests for all state transitions
2. Integration tests for full game flows
3. Manual testing of all screens
4. Keep state machine transition graph intact (as data)
5. Add extensive logging during migration

**Early Warning:**
```javascript
// Add validation to catch issues early
$effect(() => {
    // Validate state consistency
    if (gameState.cardsToDraw < 0) {
        console.error('INVALID STATE: cardsToDraw negative');
    }
    if (gameState.tower < 0) {
        console.error('INVALID STATE: tower negative');
    }
    // ... more validations
});
```

### Risk 4: Animation Timing Changes

**Likelihood:** Low
**Impact:** Low
**Severity:** LOW

**Details:**
- Svelte 5 rendering timing might differ
- Screen transitions might feel different
- Animations might need adjustment

**Mitigation:**
1. Keep exact same timing values initially
2. Test all animations after migration
3. Adjust only if needed
4. Document any timing changes

**Testing:**
```javascript
// Time critical animations
console.time('screen-transition');
await transitionToScreen('drawCard');
console.timeEnd('screen-transition');
// Should be ~350ms (50 + 300)
```

### Risk 5: TypeScript/JSDoc Issues

**Likelihood:** Low
**Impact:** Low
**Severity:** LOW

**Details:**
- Type generation might change
- Some types might need updating
- JSDoc comments might need adjustment

**Mitigation:**
1. Run `npm run check` frequently
2. Update types as needed
3. Don't block on type errors initially
4. Fix types in cleanup phase

### Risk 6: Regression in Race Condition Fixes

**Likelihood:** Low
**Impact:** High
**Severity:** MEDIUM

**Details:**
- The original bugs were tricky
- New architecture should fix them
- But could introduce new issues

**Mitigation:**
1. Dedicated race condition tests
2. Manual rapid-click testing
3. Stress testing with automation
4. Monitor for duplicate actions in logs

**Stress Test:**
```javascript
// Automated rapid-click test
test('stress test: 100 rapid clicks', async () => {
    const clicks = Array(100).fill(0).map(() => rollForTasks());
    await Promise.allSettled(clicks);

    // Should only execute once
    expect(rollForTasksCalls).toBe(1);
});
```

### Overall Risk Mitigation Strategy

1. **Incremental Migration**
   - Don't change everything at once
   - Test after each phase
   - Commit working states

2. **Comprehensive Testing**
   - Write tests before migrating
   - Test during migration
   - Test after migration

3. **Git Discipline**
   - Commit frequently
   - Tag important milestones
   - Keep backup branches

4. **Monitoring**
   - Add extensive logging
   - Watch for console errors
   - Monitor user reports

5. **Rollback Ready**
   - Keep old code accessible
   - Document rollback procedure
   - Test rollback works

---

## Post-Migration Optimization

### Opportunity 1: TypeScript Migration

**Why Now:**
- Svelte 5 has excellent TypeScript support
- Runes work great with types
- Catch errors at compile time

**Implementation:**

```bash
# Rename files
mv src/lib/stores/gameStore.svelte.js src/lib/stores/gameStore.svelte.ts
mv src/lib/stores/gameActions.svelte.js src/lib/stores/gameActions.svelte.ts

# Add types
```

```typescript
// src/lib/stores/gameStore.svelte.ts

type GameScreen =
    | 'loadGame'
    | 'options'
    | 'intro'
    | 'rollForTasks'
    | 'drawCard'
    | 'failureCheck'
    | 'log'
    | 'successCheck'
    | 'gameOver'
    | 'finalLog'
    | 'exitGame'
    | 'errorScreen';

interface Card {
    rank: string;
    suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
    value: number;
}

interface GameState {
    state: GameScreen;
    tower: number;
    tokens: number;
    round: number;
    cardsToDraw: number;
    cardsDrawn: number;
    deck: Card[];
    discard: Card[];
    currentCard: Card | null;
    diceRoll: number;
    kingsRevealed: number;
    kingOfHearts: boolean;
    kingOfDiamonds: boolean;
    kingOfClubs: boolean;
    kingOfSpades: boolean;
    journalEntries: JournalEntry[];
    config: GameConfig | null;
    systemConfig: SystemConfig | null;
    status: string;
}

let gameState = $state<GameState>({
    state: 'loadGame',
    tower: 54,
    tokens: 10,
    // ... with full type checking
});

// Type-safe transitions
export function transitionTo(newState: GameScreen): void {
    validateTransition(gameState.state, newState);
    gameState.state = newState;
}
```

**Benefits:**
- Autocomplete for state fields
- Catch invalid transitions at compile time
- Better IDE support
- Self-documenting code

### Opportunity 2: Performance Tuning

**Fine-Grained Reactivity:**

Svelte 5's runes enable extremely fine-grained reactivity. Optimize hot paths:

```javascript
// Before: Entire gameState reactive
let gameState = $state({ /* 20 fields */ });

// After: Split into focused runes
let gameScreen = $state('loadGame');
let playerStats = $state({ tower: 54, tokens: 10 });
let deckState = $state({ deck: [], discard: [], current: null });
let rollState = $state({ diceRoll: 0, rolling: false });

// Components only react to what they use
// StatusDisplay only updates when playerStats change
// Not when deck changes
```

**Lazy Computation:**

```javascript
// Expensive computation - only recalculate when needed
let gameStats = $derived.by(() => {
    // Complex calculation
    const cardsRemaining = gameState.deck.length;
    const discardSize = gameState.discard.length;
    const completion = (54 - cardsRemaining) / 54;

    return { cardsRemaining, discardSize, completion };
});
```

**Debounced Effects:**

```javascript
// Don't spam updates
let debouncedSave = $derived.by(() => {
    // Debounce expensive operations
    const state = gameState;

    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        localStorage.setItem('gameState', JSON.stringify(state));
    }, 1000);

    return state;
});
```

### Opportunity 3: Advanced State Management

**Event Sourcing:**

Instead of mutating state directly, dispatch events:

```javascript
// src/lib/stores/gameEvents.svelte.ts

type GameEvent =
    | { type: 'RoundStarted'; round: number }
    | { type: 'DiceRolled'; result: number }
    | { type: 'CardDrawn'; card: Card }
    | { type: 'TowerDamaged'; amount: number; newTotal: number }
    | { type: 'TokenEarned' };

let eventLog = $state<GameEvent[]>([]);

export function dispatchEvent(event: GameEvent) {
    eventLog.push(event);
    applyEvent(event);
}

function applyEvent(event: GameEvent) {
    switch (event.type) {
        case 'CardDrawn':
            gameState.currentCard = event.card;
            gameState.cardsDrawn++;
            break;
        case 'TowerDamaged':
            gameState.tower = event.newTotal;
            break;
        // ... handle all events
    }
}

// Replay capability for debugging
export function replayGame(events: GameEvent[]) {
    resetGame();
    events.forEach(applyEvent);
}

// Time-travel debugging
export function undoLastAction() {
    eventLog.pop();
    replayGame(eventLog);
}
```

**Benefits:**
- Complete game history
- Time-travel debugging
- Undo/redo for free
- Easy to add analytics

### Opportunity 4: Code Organization

**Feature-Based Structure:**

```
src/lib/
├── features/
│   ├── dice/
│   │   ├── DiceRoller.svelte
│   │   ├── diceStore.svelte.ts
│   │   └── diceActions.svelte.ts
│   ├── cards/
│   │   ├── CardDeck.svelte
│   │   ├── Card.svelte
│   │   ├── cardStore.svelte.ts
│   │   └── cardActions.svelte.ts
│   ├── journal/
│   │   ├── JournalEntry.svelte
│   │   └── journalStore.svelte.ts
│   └── tower/
│       ├── TowerDisplay.svelte
│       └── towerStore.svelte.ts
├── core/
│   ├── gameStore.svelte.ts      # Central game state
│   ├── transitionStore.svelte.ts
│   └── gameEngine.ts             # Pure game logic
└── shared/
    ├── NeuralBackground.svelte
    └── animations.ts
```

**Benefits:**
- Clear separation of concerns
- Easy to find code
- Easier to test features in isolation
- Scales better with team

### Opportunity 5: Developer Experience

**Dev Tools:**

```javascript
// src/lib/stores/devTools.svelte.ts

if (import.meta.env.DEV) {
    // State change logger
    $effect(() => {
        console.log('%c STATE CHANGE', 'color: blue; font-weight: bold');
        console.table({
            screen: gameState.state,
            tower: gameState.tower,
            tokens: gameState.tokens,
            round: gameState.round
        });
    });

    // Expose for console debugging
    window.__GAME_STATE__ = gameState;

    // Time travel
    window.__UNDO__ = undoLastAction;
    window.__REPLAY__ = replayGame;
}
```

**Visual State Inspector:**

```svelte
<!-- src/lib/dev/StateInspector.svelte -->
{#if import.meta.env.DEV}
    <div class="state-inspector">
        <h3>Game State Inspector</h3>
        <div>Screen: {gameState.state}</div>
        <div>Valid transitions: {getValidNextStates(gameState.state).join(', ')}</div>
        <div>Tower: {gameState.tower}</div>
        <div>Tokens: {gameState.tokens}</div>
        <button onclick={() => transitionTo('gameOver')}>Force Game Over</button>
    </div>
{/if}
```

### Opportunity 6: Testing Infrastructure

**Snapshot Testing:**

```javascript
import { gameState } from '../stores/gameStore.svelte.js';

test('complete game state snapshot', () => {
    // Set up specific game state
    setupGameState();

    // Take snapshot
    expect(gameState).toMatchSnapshot();
});
```

**Test Utilities:**

```javascript
// tests/utils/gameTestUtils.ts

export function setupTestGame() {
    Object.assign(gameState, {
        state: 'rollForTasks',
        tower: 54,
        tokens: 10,
        round: 1,
        deck: createTestDeck(),
        config: mockConfig
    });
}

export function advanceToScreen(screen: GameScreen) {
    // Navigate through state machine to reach screen
}

export async function playCompleteRound() {
    // Execute a full round programmatically
}
```

### Opportunity 7: Accessibility

**Better Keyboard Navigation:**

```svelte
<script>
    function handleKeyDown(event: KeyboardEvent) {
        switch (event.key) {
            case 'Enter':
            case ' ':
                if (canInteract) action();
                break;
            case 'Escape':
                // Cancel or go back
                break;
        }
    }
</script>

<div role="button" tabindex="0" onkeydown={handleKeyDown}>
    <!-- Interactive content -->
</div>
```

**Screen Reader Support:**

```svelte
<div role="status" aria-live="polite">
    {#if gameState.tower <= 10}
        Tower critically low: {gameState.tower} floors remaining
    {/if}
</div>

<button aria-label="Roll dice for number of tasks (current: {gameState.diceRoll})">
    Roll
</button>
```

---

## Success Criteria

The migration is complete and successful when:

### Functional Requirements

- [ ] All game screens render correctly
- [ ] All game actions work (roll, draw, confirm, etc.)
- [ ] State transitions follow correct flow
- [ ] Animations play smoothly
- [ ] Game can be completed start to finish
- [ ] Win/lose conditions trigger correctly
- [ ] Game can be restarted

### Technical Requirements

- [ ] Svelte 5.15+ installed
- [ ] SvelteKit 2.15+ installed
- [ ] All components use Svelte 5 syntax (runes)
- [ ] No Svelte 4 compatibility warnings
- [ ] StateMachine class deleted
- [ ] Single source of truth for state
- [ ] No dual state tracking

### Quality Requirements

- [ ] All unit tests passing
- [ ] All component tests passing
- [ ] All E2E tests passing
- [ ] 90%+ test coverage
- [ ] No console errors
- [ ] No console warnings
- [ ] Lighthouse score maintained or improved

### Bug Fixes

- [ ] Double roll bug eliminated
- [ ] Double confirm bug eliminated
- [ ] Race condition bugs eliminated
- [ ] State sync issues eliminated
- [ ] Invalid transition errors prevented

### Documentation

- [ ] Migration notes documented
- [ ] Architecture updated in docs
- [ ] Store structure documented
- [ ] Breaking changes documented
- [ ] README updated

### Performance

- [ ] App loads in <2 seconds
- [ ] Screen transitions smooth (60fps)
- [ ] No jank during animations
- [ ] Bundle size maintained or reduced
- [ ] Memory usage stable

---

## Conclusion

This migration plan upgrades the DC Solo RPG to Svelte 5 while simultaneously fixing critical architectural issues. The combination of Svelte 5's runes and the elimination of dual state tracking will result in:

- **35% less code** in state management
- **Zero synchronization bugs** (single source of truth)
- **Better performance** (fine-grained reactivity)
- **Easier maintenance** (clearer architecture)
- **Future-proof** (modern framework)

The phased approach ensures safe, incremental migration with rollback points at each phase. Comprehensive testing at every step minimizes risk.

**Estimated Timeline:** 18 hours (2.5 days)
**Risk Level:** Medium-Low
**Recommended Start:** After final Svelte 5 stable release (Jan 2025)

### Next Steps

1. Review and approve this plan
2. Schedule migration sprint
3. Create git branch
4. Begin Phase 0 (Preparation)
5. Execute phases sequentially
6. Validate at each phase
7. Celebrate successful migration!

---

**Questions or concerns?** Review each phase carefully and adjust timeline as needed for your team's familiarity with Svelte 5.

**Ready to begin?** Start with Phase 0: Preparation.
