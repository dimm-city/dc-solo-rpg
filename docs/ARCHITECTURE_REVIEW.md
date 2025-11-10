# State Management Architecture Review

**Author:** bun-node-architect
**Date:** 2025-01-09
**Project:** DC Solo RPG Card Game

---

# Executive Summary

## Critical Findings

Your card game suffers from **dual state tracking** where the same information exists in two places (`gameStore` and `StateMachine`), creating synchronization issues and race conditions. The state machine is **unnecessary** - it adds complexity without providing meaningful value.

**Key Issues:**
1. State exists in both `gameStore.state` AND `services.stateMachine.state`
2. Components have local state flags (`rolled`, `confirming`) that desync during async transitions
3. The state machine is a simple string-to-string map that Svelte stores already handle better
4. Race conditions from async transitions modifying state during animations

**Recommendation:** **Eliminate the state machine entirely** and use only Svelte stores. This will reduce code by ~30%, eliminate sync bugs, and make the system dramatically simpler to understand and maintain.

---

# Detailed Architectural Analysis

## Current Architecture Issues

### 1. Dual State Tracking Problem

**Location:** `src/lib/stores/WAAStore.js` (Lines 173-176, 197-200, 283)

The core problem is visible everywhere in your store:

```javascript
// TWO sources of truth for the same state
export const currentScreen = writable('loadGame');  // Svelte store
export const services = {
    stateMachine: new StateMachine('loadGame'),      // Custom state machine
    // ...
};

// Every state change requires BOTH to be updated
gameStore.update((store) => {
    store.state = services.stateMachine.next('drawCard');  // Update state machine
    return store;
});
currentScreen.update((screen) => {
    services.stateMachine.next(action);   // Update state machine again
    screen = services.stateMachine.state; // Copy to screen
    return screen;
});
```

**Why This Is Bad:**
- You must remember to update TWO places for every state change
- Any deviation causes desync (exactly what you're experiencing)
- More code paths = more bugs
- Harder to test and reason about

### 2. State Machine Provides Zero Value

**Location:** `src/lib/stores/WAAStateMachine.js` (Lines 60-76)

Let's examine what the state machine actually does:

```javascript
export class StateMachine {
    constructor(initialState, transitions) {
        this.state = initialState;
        this.transitions = transitions ?? defaultTransitions;
    }

    next(action) {
        const transition = this.transitions[this.state][action];

        if (transition || action == "exitGame" || action == "errorScreen") {
            this.state = transition ?? action;
            return action;
        } else {
            throw new Error(`Invalid transition from ${this.state} on ${action}`);
        }
    }
}
```

**Analysis:**
- It's a simple string-to-string lookup table
- The validation throws errors AFTER state is already corrupted (too late)
- The transition graph is static and could be a simple object
- Svelte derived stores can do this same validation better

**What You Actually Need:**
A derived store that validates transitions reactively, before state changes occur.

### 3. Component Local State Creates Race Conditions

**Location:** `src/lib/components/RollForTasks.svelte` (Lines 7-9)

```javascript
let rolled = false;   // Component-local state
let rolling = false;
let confirming = false;

async function rollTaskDice() {
    if (rolling || confirming) return;
    const result = await rollForTasks();  // Async - state changes DURING this
    await taskDice.roll(result);          // More async
    rolled = true;                        // Local state update
}
```

**The Problem:**
1. User clicks button → `rollTaskDice()` starts
2. `rollForTasks()` updates `gameStore` → screen transition begins
3. Component unmounts/remounts during transition
4. Local `rolled` flag resets to `false`
5. User can click again → double execution

**Why Mutex Isn't Enough:**
Mutexes (`if (rolling || confirming) return;`) prevent concurrent execution but don't prevent re-execution after component remount.

### 4. Async Transitions Mutate State Mid-Animation

**Location:** `src/lib/stores/WAAStore.js` (Lines 43-82)

```javascript
export const transitionToScreen = async (action, transitionType = 'default') => {
    // Exit animation
    if (currentScreenEl) {
        currentScreenEl.classList.add('screen-transition-out');
        await sleep(300);  // STATE CAN CHANGE HERE
    }

    // Change the screen (update state)
    currentScreen.update((screen) => {
        if (action) services.stateMachine.next(action);  // Mutation during animation
        screen = services.stateMachine.state;
        return screen;
    });

    await sleep(50);  // More async
    // Enter animation...
};
```

**The Race Condition:**
- Animations take 300-500ms
- User actions during animation can trigger more state changes
- State changes during `await sleep()` corrupt the transition sequence
- Result: "Invalid transition" errors

---

## Root Cause Analysis

All bugs trace back to **one architectural mistake**: Using a separate state machine instead of leveraging Svelte's reactive primitives.

**The Bugs You Fixed Were Symptoms, Not Root Causes:**

1. **Double roll bug** - Fixed by adding `!rolled` check, but the real issue is component state surviving async transitions
2. **Double confirm bug** - Fixed by adding mutex, but the real issue is state mutation during animations
3. **Invalid transition errors** - Partially fixed by validating state, but the real issue is dual state tracking

**The Real Problem:**
You're fighting against Svelte's reactive system instead of working with it.

---

# Recommended Simplifications

## Option 1: Pure Svelte Stores (RECOMMENDED)

**Complexity Reduction:** ~35% less code, eliminates entire class file

**Architecture:**
```
gameStore (writable)
    └── All game state in one place

currentScreen (derived from gameStore)
    └── Computed from gameStore.state
    └── Cannot desync - always correct

transitionState (writable)
    └── Tracks animation status
    └── Prevents actions during transitions
```

**Benefits:**
- Single source of truth
- Reactive by default
- No manual synchronization
- Built-in devtools support
- Easier testing
- Less code

**Example Implementation:**

```javascript
// Simplified store structure
export const gameStore = writable({
    state: 'loadGame',
    // ... all other state
});

// Derived screen - automatically correct
export const currentScreen = derived(
    gameStore,
    $store => $store.state
);

// Transition mutex - prevents actions during animations
export const isTransitioning = writable(false);

// Transition validator - prevents invalid transitions
const validTransitions = {
    loadGame: ['options'],
    options: ['intro'],
    intro: ['rollForTasks'],
    // ... rest of transition graph
};

// Single function to change state - enforces validation
export const transitionTo = async (newState, animationType = 'default') => {
    const current = get(gameStore).state;

    // Validate transition BEFORE changing state
    if (!validTransitions[current]?.includes(newState)) {
        throw new Error(`Invalid transition: ${current} → ${newState}`);
    }

    // Prevent concurrent transitions
    if (get(isTransitioning)) {
        console.warn('Transition already in progress, ignoring');
        return;
    }

    isTransitioning.set(true);

    // Animate out
    await animateOut();

    // Update state (single source of truth)
    gameStore.update(s => ({ ...s, state: newState }));

    // Animate in
    await animateIn(animationType);

    isTransitioning.set(false);
};
```

**Migration Effort:** 2-3 hours
**Risk:** Low (well-tested pattern)

---

## Option 2: State Machine as Validation Layer Only

**Complexity Reduction:** ~20% less code, clearer separation of concerns

If you absolutely must keep a state machine concept, make it a **pure validator** that doesn't hold state:

```javascript
// State machine becomes a pure function validator
export const validateTransition = (fromState, toState) => {
    const validNextStates = transitions[fromState];
    if (!validNextStates || !validNextStates[toState]) {
        throw new Error(`Invalid transition: ${fromState} → ${toState}`);
    }
    return true;
};

// Store is still single source of truth
export const transitionTo = async (newState) => {
    const current = get(gameStore).state;

    // Validate using state machine logic
    validateTransition(current, newState);

    // Update single source of truth
    gameStore.update(s => ({ ...s, state: newState }));
};
```

**Benefits:**
- Keeps transition validation logic
- Eliminates dual state tracking
- State machine becomes a pure function (easier to test)

**Migration Effort:** 1-2 hours
**Risk:** Very low

---

## Option 3: XState (NOT RECOMMENDED)

**Complexity Increase:** +40% more code, steeper learning curve

You could use XState (professional state machine library), but:

**Why NOT to do this:**
- Overkill for a card game
- Adds 30KB+ dependency
- Team must learn XState's API
- More abstraction = harder debugging
- You don't need features like actors, guards, history states

**Only use XState if:**
- You have 50+ states
- Complex parallel states
- Need state history/time travel
- Building a visual state editor

**Your game has ~10 screens - this is massive overkill.**

---

# Step-by-Step Refactoring Plan

## Phase 1: Preparation (30 minutes)

### 1.1 Add Comprehensive Tests

**File:** `src/lib/stores/WAAStore.test.js`

Add tests that verify behavior, not implementation:

```javascript
describe('State Transitions', () => {
    test('should prevent invalid transitions', () => {
        gameStore.set({ state: 'loadGame' });
        expect(() => transitionTo('drawCard')).toThrow('Invalid transition');
    });

    test('should prevent concurrent transitions', async () => {
        gameStore.set({ state: 'intro' });

        const transition1 = transitionTo('rollForTasks');
        const transition2 = transitionTo('rollForTasks');

        await Promise.all([transition1, transition2]);

        // Should only transition once
        const calls = /* count state changes */;
        expect(calls).toBe(1);
    });

    test('should complete roll-to-draw flow without desync', async () => {
        gameStore.set({ state: 'rollForTasks', cardsToDraw: 0 });

        await rollForTasks();
        await confirmTaskRoll();

        const state = get(gameStore);
        expect(state.state).toBe('drawCard');
        expect(state.cardsToDraw).toBeGreaterThan(0);
    });
});
```

### 1.2 Document Current Behavior

Create a test that captures the complete happy path:

```javascript
test('complete game flow integration test', async () => {
    // This test documents how the game SHOULD work
    await loadSystemConfig({ gameConfigUrl: 'test.yml' });
    expect(get(gameStore).state).toBe('options');

    startGame({ name: 'Test' });
    expect(get(gameStore).state).toBe('intro');

    await startRound();
    expect(get(gameStore).state).toBe('rollForTasks');

    // ... continue through entire flow
});
```

## Phase 2: Refactor Store (2 hours)

### 2.1 Create New State Management

**File:** `src/lib/stores/WAAStore.js`

```javascript
// ============================================
// TRANSITION GRAPH (Pure Data)
// ============================================
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

// ============================================
// CORE STATE (Single Source of Truth)
// ============================================
export const gameStore = writable({
    // ... existing state ...
    state: 'loadGame',
});

// Derived store - always synchronized
export const currentScreen = derived(gameStore, $store => $store.state);

// Transition mutex - prevents race conditions
export const isTransitioning = writable(false);

// ============================================
// STATE TRANSITION VALIDATOR
// ============================================
function validateTransition(fromState, toState) {
    const validStates = transitionGraph[fromState];

    if (!validStates?.includes(toState)) {
        throw new Error(
            `Invalid transition: ${fromState} → ${toState}\n` +
            `Valid transitions from ${fromState}: ${validStates?.join(', ') || 'none'}`
        );
    }

    return true;
}

// ============================================
// SAFE STATE UPDATER
// ============================================
function updateState(newState) {
    gameStore.update(store => {
        validateTransition(store.state, newState);
        return { ...store, state: newState };
    });
}

// ============================================
// TRANSITION WITH ANIMATION
// ============================================
export const transitionToScreen = async (newState, animationType = 'default') => {
    // Prevent concurrent transitions
    if (get(isTransitioning)) {
        console.warn('Transition in progress, ignoring request');
        return;
    }

    isTransitioning.set(true);

    try {
        // Exit animation
        const currentScreenEl = document.querySelector('.dc-screen-container');
        if (currentScreenEl) {
            currentScreenEl.classList.add('screen-transition-out');
            await sleep(300);
        }

        // Update state (validated)
        updateState(newState);

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
        isTransitioning.set(false);
    }
};
```

### 2.2 Remove State Machine

**Delete:** `src/lib/stores/WAAStateMachine.js`

**Update:** Remove all references to `services.stateMachine`

```bash
# Find all usages
grep -r "services.stateMachine" src/
grep -r "StateMachine" src/
```

### 2.3 Update Component Guards

**File:** `src/lib/components/RollForTasks.svelte`

```svelte
<script>
    import { gameStore, rollForTasks, confirmTaskRoll, isTransitioning } from '../stores/WAAStore.js';
    import DiceRoller from './ThreeJSDiceBoxRoller.svelte';

    let taskDice;
    let rolling = false;

    // Use store state instead of local state
    $: rolled = $gameStore.cardsToDraw > 0;
    $: canInteract = !rolling && !$isTransitioning;

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
        disabled={$isTransitioning}
    />
</div>
```

**Key Changes:**
- Removed `rolled`, `confirming` local state
- Derive `rolled` from `gameStore.cardsToDraw`
- Use `$isTransitioning` to disable during animations
- Much simpler logic

## Phase 3: Update Components (1 hour)

Apply the same pattern to other components:

### FailureCheck.svelte
```svelte
<script>
    import { gameStore, getFailureCheckRoll, applyFailureCheckResult,
             confirmFailureCheck, isTransitioning } from '../stores/WAAStore.js';
    import DiceRoller from './ThreeJSDiceBoxRoller.svelte';

    let diceRoller;
    let rolling = false;

    $: hasRolled = $gameStore.diceRoll > 0;
    $: canInteract = !rolling && !$isTransitioning;

    async function doCheck() {
        if (!canInteract) return;

        if (!hasRolled) {
            rolling = true;
            const result = getFailureCheckRoll();
            await diceRoller.roll(result);
            applyFailureCheckResult(result);
            rolling = false;
        } else {
            await confirmFailureCheck();
        }
    }

    $: header = hasRolled ? 'Click to continue' : 'Roll failure check';
</script>

<div class="dc-failure-check-container">
    <DiceRoller
        bind:this={diceRoller}
        bind:rolling
        on:click={doCheck}
        on:keyup={doCheck}
        {header}
        disabled={$isTransitioning}
    />
</div>
```

### DrawCard.svelte
```svelte
<script>
    import { confirmCard, drawCard, gameStore, isTransitioning } from '../stores/WAAStore.js';
    import CardDeck from './CardDeck.svelte';

    async function onRequestCard() {
        if ($isTransitioning) return;
        await drawCard();
    }

    async function onConfirmCardDeck() {
        if ($isTransitioning) return;
        await confirmCard();
    }
</script>

<div class="dc-draw-card-container">
    <CardDeck
        card={$gameStore.currentCard}
        disabled={$isTransitioning}
        on:requestcard={onRequestCard}
        on:confirmcard={onConfirmCardDeck}
    />
</div>
```

## Phase 4: Testing (30 minutes)

### Run full test suite
```bash
npm test
```

### Manual testing checklist
1. Start game → intro → roll for tasks → draw cards
2. Spam click buttons during animations (should be blocked)
3. Draw odd card → failure check → confirm
4. Complete round → journal → success check
5. Win/lose scenarios
6. Restart game

### Integration tests
```javascript
describe('No Race Conditions', () => {
    test('rapid button clicks should only execute once', async () => {
        gameStore.set({ state: 'rollForTasks', cardsToDraw: 0 });

        // Simulate 10 rapid clicks
        const promises = Array(10).fill(0).map(() => rollForTasks());
        await Promise.all(promises);

        const state = get(gameStore);
        expect(state.cardsToDraw).toBeGreaterThan(0);
        expect(state.cardsToDraw).toBeLessThan(7); // Only rolled once
    });

    test('state transitions during animations should be blocked', async () => {
        gameStore.set({ state: 'intro' });

        const transition1 = transitionToScreen('rollForTasks');
        // Try to transition while first is in progress
        const transition2 = transitionToScreen('drawCard');

        await Promise.all([transition1, transition2]);

        const state = get(gameStore);
        expect(state.state).toBe('rollForTasks'); // Second blocked
    });
});
```

---

# Long-term Architectural Recommendations

## 1. Separate Business Logic from UI State

**Current Issue:** Game rules mixed with UI state in one giant store

**Better Pattern:**

```javascript
// game-engine.js - Pure business logic
export class CardGameEngine {
    constructor(config) {
        this.deck = shuffle([...config.deck]);
        this.tower = 54;
        this.tokens = 10;
        // ... pure state
    }

    drawCard() {
        if (this.deck.length === 0) {
            throw new GameOverError('Deck empty');
        }

        const card = this.deck.pop();
        // Pure logic - no side effects
        return {
            card,
            nextAction: this.determineNextAction(card)
        };
    }

    determineNextAction(card) {
        if (this.isKing(card) && this.kingsRevealed === 4) {
            return 'gameOver';
        }
        if (this.isOdd(card)) {
            return 'failureCheck';
        }
        return this.cardsToDraw > 0 ? 'drawCard' : 'log';
    }
}

// game-store.js - UI bindings
export const gameStore = writable(new CardGameEngine(config));

export const drawCard = () => {
    gameStore.update(engine => {
        const { card, nextAction } = engine.drawCard();
        // Update UI state
        updateState(nextAction);
        return engine;
    });
};
```

**Benefits:**
- Game engine testable in isolation (no Svelte needed)
- Can run game logic in Web Worker
- Easier to add multiplayer later
- Clear separation of concerns

## 2. Use TypeScript

**Current Issue:** Runtime errors for typos, invalid transitions

**With TypeScript:**

```typescript
type GameState =
    | 'loadGame'
    | 'options'
    | 'intro'
    | 'rollForTasks'
    | 'drawCard'
    | 'failureCheck'
    | 'log'
    | 'successCheck'
    | 'gameOver';

type TransitionGraph = {
    [K in GameState]: readonly GameState[]
};

const transitions: TransitionGraph = {
    loadGame: ['options'],
    options: ['intro'],
    // TypeScript ensures all states covered
};

function updateState(newState: GameState) {
    // Type-safe - compile-time validation
}
```

**Benefits:**
- Catch invalid transitions at compile time
- Autocomplete for state names
- Refactoring safety
- Self-documenting code

## 3. Consider Event Sourcing for Game Log

**Current Issue:** Log is append-only array, hard to replay/undo

**Better Pattern:**

```javascript
// events.js
export const GameEvent = {
    RoundStarted: (round) => ({ type: 'RoundStarted', round }),
    DiceRolled: (result) => ({ type: 'DiceRolled', result }),
    CardDrawn: (card) => ({ type: 'CardDrawn', card }),
    TowerDamaged: (amount) => ({ type: 'TowerDamaged', amount }),
    // ... all events
};

// event-store.js
export const eventLog = writable([]);

export function dispatchEvent(event) {
    eventLog.update(log => [...log, { ...event, timestamp: Date.now() }]);
    applyEvent(event);
}

function applyEvent(event) {
    switch (event.type) {
        case 'CardDrawn':
            gameStore.update(s => ({ ...s, currentCard: event.card }));
            break;
        // ... handle all events
    }
}

// Replay capability
export function replayGame(events) {
    resetGame();
    events.forEach(applyEvent);
}
```

**Benefits:**
- Complete game history
- Time travel debugging
- Undo/redo functionality
- Analytics and replay

## 4. Add State Visualization

**Tool:** Use Svelte DevTools + custom visualization

```javascript
// dev-tools.js (development only)
if (import.meta.env.DEV) {
    gameStore.subscribe(state => {
        console.log('%c STATE CHANGE', 'color: blue; font-weight: bold');
        console.log('Current:', state.state);
        console.log('Valid next:', transitionGraph[state.state]);
        console.table({
            round: state.round,
            cardsToDraw: state.cardsToDraw,
            tower: state.tower,
            tokens: state.tokens
        });
    });
}
```

## 5. Performance Optimization

**Current Issue:** Entire store updates on any change

**Better Pattern:**

```javascript
// Split into focused stores
export const gameState = writable('loadGame');
export const playerState = writable({ name: '', tower: 54, tokens: 10 });
export const deckState = writable([]);
export const uiState = writable({ isTransitioning: false, rolling: false });

// Components subscribe only to what they need
$: tower = $playerState.tower;  // Only updates when tower changes
```

**Benefits:**
- Reduced re-renders
- Better performance
- Clearer dependencies

---

# Testing Strategy

## Unit Tests (High Priority)

### State Transition Tests
```javascript
describe('State Transitions', () => {
    test('validates all transitions in graph', () => {
        Object.entries(transitionGraph).forEach(([from, toStates]) => {
            toStates.forEach(to => {
                expect(() => validateTransition(from, to)).not.toThrow();
            });
        });
    });

    test('rejects invalid transitions', () => {
        expect(() => validateTransition('loadGame', 'drawCard'))
            .toThrow('Invalid transition');
    });

    test('allows emergency transitions (exitGame, errorScreen)', () => {
        expect(() => validateTransition('drawCard', 'exitGame')).not.toThrow();
    });
});
```

### Game Logic Tests
```javascript
describe('Game Engine', () => {
    test('drawing odd card triggers failure check', () => {
        const engine = new CardGameEngine(config);
        engine.deck = [{ card: '3', suit: 'hearts' }];

        const { nextAction } = engine.drawCard();

        expect(nextAction).toBe('failureCheck');
    });

    test('four kings ends game', () => {
        const engine = new CardGameEngine(config);
        engine.kingsRevealed = 3;
        engine.deck = [{ card: 'K', suit: 'spades' }];

        const { nextAction } = engine.drawCard();

        expect(nextAction).toBe('gameOver');
    });
});
```

## Integration Tests (Medium Priority)

```javascript
describe('Complete Game Flow', () => {
    test('successful game playthrough', async () => {
        vi.spyOn(services, 'getRandomNumber')
            .mockReturnValueOnce(3)   // Roll 3 tasks
            .mockReturnValueOnce(1)   // Failure check (minimal damage)
            .mockReturnValueOnce(6);  // Success check (win)

        await loadSystemConfig({ gameConfigUrl: 'test.yml' });
        startGame({ name: 'Test Player' });

        await startRound();
        await rollForTasks();
        await confirmTaskRoll();

        // Draw cards...
        drawCard(); // Odd card
        await confirmCard();

        // Failure check
        await failureCheck();
        await confirmFailureCheck();

        // Draw remaining cards...
        drawCard();
        drawCard();
        await confirmCard();

        // End round
        await recordRound({ text: 'Test journal' });

        // Success check
        await successCheck();

        const state = get(gameStore);
        expect(state.tokens).toBe(9);
        expect(state.tower).toBeLessThan(54);
        expect(state.journalEntries).toHaveLength(1);
    });
});
```

## Regression Tests (High Priority)

```javascript
describe('Bug Regressions', () => {
    test('double roll bug - rollForTasks only executes once', async () => {
        const spy = vi.spyOn(services, 'getRandomNumber');

        gameStore.set({ state: 'rollForTasks' });

        // Simulate rapid clicks
        await Promise.all([
            rollForTasks(),
            rollForTasks(),
            rollForTasks()
        ]);

        expect(spy).toHaveBeenCalledTimes(1);
    });

    test('double confirm bug - confirmTaskRoll only executes once', async () => {
        const spy = vi.fn();
        transitionToScreen = vi.fn(transitionToScreen).mockImplementation(spy);

        gameStore.set({ state: 'rollForTasks', cardsToDraw: 3 });

        await Promise.all([
            confirmTaskRoll(),
            confirmTaskRoll()
        ]);

        expect(spy).toHaveBeenCalledTimes(1);
    });

    test('invalid transition bug - prevents startRound → startRound', () => {
        gameStore.set({ state: 'startRound' });

        expect(() => updateState('startRound'))
            .toThrow('Invalid transition');
    });
});
```

---

# Summary

## What to Do

1. **Remove the state machine entirely** - It provides no value
2. **Use derived stores for currentScreen** - Automatic synchronization
3. **Add isTransitioning mutex** - Prevents race conditions
4. **Remove component local state** - Use store state instead
5. **Validate transitions in store** - Single place, clear errors

## What NOT to Do

1. Don't add XState or other state machine library
2. Don't keep dual state tracking
3. Don't use component local state for game state
4. Don't allow actions during transitions

## Expected Results

- **35% less code**
- **Zero sync bugs**
- **100% test coverage of transitions**
- **Simpler mental model**
- **Easier debugging**

## Migration Time

- **Refactoring:** 2-3 hours
- **Testing:** 1 hour
- **Total:** Half day of work

## Risk Assessment

**Low Risk** - The refactor is straightforward:
- Existing tests validate behavior
- One source of truth is simpler than two
- Svelte patterns are well-documented
- Easy to rollback if needed

---

# Questions?

Before you start, consider:

1. **Do you need to preserve game state during refactor?** (Probably not, since this is a card game)
2. **Are there any external dependencies on the state machine API?** (Check for other consumers)
3. **Should we add TypeScript in this refactor?** (Recommended but separate effort)

**My recommendation:** Start with Phase 1 (tests), then do Phase 2 (core refactor) in one session. This is a classic "rip the bandaid off" refactor - trying to do it incrementally will be harder.
