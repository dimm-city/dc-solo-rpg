# DC Solo RPG - Refactoring Implementation Guide

**Last Updated:** 2025-11-19

This guide provides step-by-step instructions for executing the refactoring plan.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Setting Up Your Environment](#setting-up-your-environment)
3. [Refactoring Process](#refactoring-process)
4. [Code Examples](#code-examples)
5. [Testing Guidelines](#testing-guidelines)
6. [Common Pitfalls](#common-pitfalls)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

Before starting any refactoring work:

1. **Read the documentation:**
   - [STATUS.md](./STATUS.md) - Overall progress tracking
   - [CODE_QUALITY_REVIEW.md](./CODE_QUALITY_REVIEW.md) - Detailed issues
   - [COMPONENT_REFACTORING.md](./COMPONENT_REFACTORING.md) - Component details

2. **Understand the codebase:**
   - Review [CLAUDE.md](../../CLAUDE.md) - Project instructions
   - Read [Animation Style Guide](../animation-style-guide.md)
   - Understand the game mechanics

3. **Set up your development environment:**
   - Node.js >= 20.0.0
   - npm installed
   - Editor with Svelte support (VS Code + Svelte extension recommended)

---

## Setting Up Your Environment

### 1. Clone and Branch

```bash
# Ensure you're on latest main
git checkout main
git pull origin main

# Create feature branch
git checkout -b refactor/component-architecture

# Or component-specific branch
git checkout -b refactor/status-display
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Visit http://localhost:5173 to see the app running.

### 4. Run Tests

```bash
# Unit tests
npm run test:unit

# E2E tests
npm run test

# Type checking
npm run check
```

---

## Refactoring Process

### General Workflow

For each component refactoring, follow these steps:

#### Step 1: Create Branch
```bash
git checkout -b refactor/[component-name]
```

#### Step 2: Create Directory Structure

Example for StatusDisplay:
```bash
mkdir -p src/lib/components/status
```

#### Step 3: Extract Sub-Components

**Pattern for creating a new component:**

```bash
# 1. Create the file
touch src/lib/components/status/PlayerInfoBar.svelte

# 2. Copy relevant code from original component
# 3. Define props interface
# 4. Extract styles
# 5. Add JSDoc documentation
```

**Template for new component:**
```svelte
<script>
/**
 * ComponentName - Brief description
 *
 * @component
 * @example
 * <ComponentName prop1="value" prop2={variable} />
 */

/**
 * @typedef {Object} ComponentNameProps
 * @property {string} prop1 - Description
 * @property {number} prop2 - Description
 */
let {
    prop1,
    prop2,
    onEvent = () => {}
} = $props();

// Component logic
</script>

<div class="component-name">
    <!-- Template -->
</div>

<style>
    /* Component styles */
</style>
```

#### Step 4: Update Parent Component

```svelte
<script>
// Import new components
import SubComponent from './path/SubComponent.svelte';

// Remove extracted logic
// Keep only orchestration logic
</script>

<div class="parent-component">
    <SubComponent prop1="value" prop2={variable} onEvent={handleEvent} />
</div>
```

#### Step 5: Test

```bash
# Build to check for errors
npm run build

# Run unit tests
npm run test:unit

# Manual testing
npm run dev
# Test in browser
```

#### Step 6: Commit

```bash
git add .
git commit -m "refactor(StatusDisplay): Extract PlayerInfoBar component

- Create PlayerInfoBar.svelte (180 lines)
- Extract player info display logic
- Extract action button logic
- Add component tests
- Update StatusDisplay to use new component

Reduces StatusDisplay from 2006 → 1826 lines"
```

#### Step 7: Repeat for Each Sub-Component

Continue extracting until parent component is at target size.

---

## Code Examples

### Example 1: Extracting a Simple Component

**Before (in StatusDisplay.svelte):**
```svelte
<div class="player-round-bar">
    <div class="player-info">
        <div class="player-name">{gameState.playerName}</div>
        <div class="game-title">{gameState.config?.title}</div>
        <div class="round-number">Round {gameState.round}</div>
    </div>
    <div class="action-buttons">
        <button onclick={handleHelp}>❓</button>
        <button onclick={handleExit}>✕</button>
    </div>
</div>
```

**After (PlayerInfoBar.svelte):**
```svelte
<script>
/**
 * PlayerInfoBar - Displays player name, game title, round, and action buttons
 */
let {
    playerName,
    gameTitle,
    round,
    onHelpClick,
    onExitClick
} = $props();
</script>

<div class="player-round-bar">
    <div class="player-info">
        <div class="player-name">{playerName}</div>
        <div class="game-title">{gameTitle}</div>
        <div class="round-number">Round {round}</div>
    </div>
    <div class="action-buttons">
        <button onclick={onHelpClick}>❓</button>
        <button onclick={onExitClick}>✕</button>
    </div>
</div>
```

**Updated Parent (StatusDisplay.svelte):**
```svelte
<script>
import PlayerInfoBar from './status/PlayerInfoBar.svelte';
import { gameState } from '$lib/stores/gameStore.svelte.js';

let { onHelpClick, onExitClick } = $props();
</script>

<PlayerInfoBar
    playerName={gameState.playerName}
    gameTitle={gameState.config?.title}
    round={gameState.round}
    {onHelpClick}
    {onExitClick}
/>
```

---

### Example 2: Extracting a Composable

**Before (in GameScreen.svelte):**
```svelte
<script>
let rollTasksRolled = $state(false);
let rollTasksRolling = $state(false);
let rollTasksConfirming = $state(false);

const rollForTasksButtonText = $derived(
    rollTasksRolled
        ? `Draw ${gameState.cardsToDraw} Cards`
        : 'Roll Dice'
);

async function handleRollForTasks() {
    if (rollTasksRolling || rollTasksConfirming) return;

    if (rollTasksRolled) {
        rollTasksConfirming = true;
        await confirmTaskRoll();
        rollTasksConfirming = false;
    } else {
        rollTasksRolling = true;
        const { roll } = await rollForTasks();
        await rollDice(roll);
        rollTasksRolling = false;
        rollTasksRolled = true;
    }
}
</script>
```

**After (useRollForTasks.svelte.js):**
```javascript
// src/lib/composables/screen/useRollForTasks.svelte.js

import { rollForTasks, confirmTaskRoll } from '$lib/stores/gameActions.svelte.js';
import { rollDice } from '$lib/stores/diceStore.svelte.js';
import { gameState } from '$lib/stores/gameStore.svelte.js';

export function useRollForTasks() {
    let rolled = $state(false);
    let rolling = $state(false);
    let confirming = $state(false);

    const buttonText = $derived(
        rolled
            ? `Draw ${gameState.cardsToDraw} Cards`
            : 'Roll Dice'
    );

    const buttonDisabled = $derived(rolling || confirming);

    async function handle() {
        if (rolling || confirming) return;

        if (rolled) {
            confirming = true;
            await confirmTaskRoll();
            confirming = false;
        } else {
            rolling = true;
            const { roll } = await rollForTasks();
            await rollDice(roll);
            rolling = false;
            rolled = true;
        }
    }

    function reset() {
        rolled = false;
        rolling = false;
        confirming = false;
    }

    return {
        rolled,
        rolling,
        confirming,
        buttonText,
        buttonDisabled,
        handle,
        reset
    };
}
```

**Updated GameScreen.svelte:**
```svelte
<script>
import { useRollForTasks } from '$lib/composables/screen/useRollForTasks.svelte.js';

const rollForTasks = useRollForTasks();

// Reset on screen change
$effect(() => {
    if (currentScreen === 'rollForTasks') {
        rollForTasks.reset();
    }
});
</script>

<button
    onclick={rollForTasks.handle}
    disabled={rollForTasks.buttonDisabled}
>
    {rollForTasks.buttonText}
</button>
```

---

### Example 3: Creating a Reusable Component

**DiceReadout.svelte (can be used in multiple places):**

```svelte
<script>
/**
 * DiceReadout - Displays last dice roll with optional binary pips
 *
 * @component
 * @example
 * <DiceReadout
 *   lastRoll={15}
 *   isLucid={true}
 *   showBinaryPips={true}
 * />
 */

const PIP_COUNT = 5;

let {
    lastRoll,
    isLucid = false,
    isSurreal = false,
    showBinaryPips = true
} = $props();

const dicePips = $derived.by(() => {
    const roll = lastRoll || 0;
    const pips = new Array(PIP_COUNT).fill(false);
    const binary = roll.toString(2).padStart(PIP_COUNT, '0');
    for (let i = 0; i < PIP_COUNT; i++) {
        pips[i] = binary[i] === '1';
    }
    return pips;
});
</script>

<div class="dice-readout" data-lucid={isLucid} data-surreal={isSurreal}>
    <div class="dice-value">{lastRoll}</div>

    {#if showBinaryPips}
        <div class="binary-pips">
            {#each dicePips as pip}
                <div class="pip" class:active={pip}></div>
            {/each}
        </div>
    {/if}

    {#if isLucid}
        <div class="modifier lucid">↑ LUCID</div>
    {/if}

    {#if isSurreal}
        <div class="modifier surreal">↓ SURREAL</div>
    {/if}
</div>

<style>
    .dice-readout {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-sm);
    }

    .dice-value {
        font-size: var(--text-3xl);
        font-weight: bold;
    }

    .binary-pips {
        display: flex;
        gap: var(--space-xs);
    }

    .pip {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--color-gray-600);
    }

    .pip.active {
        background: var(--color-neon-cyan);
        box-shadow: 0 0 8px var(--color-neon-cyan);
    }

    .modifier {
        font-size: var(--text-sm);
        padding: var(--space-xs) var(--space-sm);
        border-radius: 4px;
    }

    .modifier.lucid {
        background: var(--color-success);
        color: white;
    }

    .modifier.surreal {
        background: var(--color-danger);
        color: white;
    }
</style>
```

**Usage in multiple places:**

```svelte
<!-- In StatusDisplay -->
<DiceReadout
    lastRoll={gameState.diceRoll}
    isLucid={gameState.isLucid}
    isSurreal={gameState.isSurreal}
/>

<!-- In GameScreen during roll -->
<DiceReadout
    lastRoll={currentRoll}
    isLucid={wasLucid}
    isSurreal={wasSurreal}
    showBinaryPips={false}
/>

<!-- In StoryMode -->
<DiceReadout
    lastRoll={round.diceRoll}
    showBinaryPips={true}
/>
```

---

## Testing Guidelines

### Unit Testing Components

**Test file location:** Same directory as component, named `ComponentName.test.js`

**Example test (PlayerInfoBar.test.js):**

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import PlayerInfoBar from './PlayerInfoBar.svelte';

describe('PlayerInfoBar', () => {
    it('renders player info correctly', () => {
        const { getByText } = render(PlayerInfoBar, {
            playerName: 'Test Player',
            gameTitle: 'Test Game',
            round: 3,
            onHelpClick: () => {},
            onExitClick: () => {}
        });

        expect(getByText('Test Player')).toBeInTheDocument();
        expect(getByText('Test Game')).toBeInTheDocument();
        expect(getByText('Round 3')).toBeInTheDocument();
    });

    it('calls onHelpClick when help button clicked', async () => {
        const onHelpClick = vi.fn();
        const { getByText } = render(PlayerInfoBar, {
            playerName: 'Test',
            gameTitle: 'Test',
            round: 1,
            onHelpClick,
            onExitClick: () => {}
        });

        const helpButton = getByText('❓');
        await fireEvent.click(helpButton);

        expect(onHelpClick).toHaveBeenCalledOnce();
    });
});
```

### Unit Testing Composables

**Example test (useRollForTasks.test.js):**

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { useRollForTasks } from './useRollForTasks.svelte.js';

describe('useRollForTasks', () => {
    let rollForTasks;

    beforeEach(() => {
        rollForTasks = useRollForTasks();
    });

    it('starts in unrolled state', () => {
        expect(rollForTasks.rolled).toBe(false);
        expect(rollForTasks.rolling).toBe(false);
        expect(rollForTasks.buttonText).toBe('Roll Dice');
    });

    it('updates button text after roll', async () => {
        await rollForTasks.handle();

        expect(rollForTasks.rolled).toBe(true);
        expect(rollForTasks.buttonText).toContain('Draw');
    });

    it('resets state correctly', () => {
        rollForTasks.rolled = true;
        rollForTasks.reset();

        expect(rollForTasks.rolled).toBe(false);
        expect(rollForTasks.buttonText).toBe('Roll Dice');
    });
});
```

### Integration Testing

**Example integration test:**

```javascript
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import StatusDisplay from './StatusDisplay.svelte';
import { gameState } from '$lib/stores/gameStore.svelte.js';

describe('StatusDisplay Integration', () => {
    it('displays all game stats correctly', () => {
        gameState.playerName = 'Test Player';
        gameState.tower = 15;
        gameState.tokens = 7;
        gameState.acesRevealed = 2;

        const { getByText } = render(StatusDisplay, {
            onHelpClick: () => {},
            onExitClick: () => {},
            onSettingsClick: () => {}
        });

        expect(getByText('Test Player')).toBeInTheDocument();
        expect(getByText(/15/)).toBeInTheDocument(); // Stability
        expect(getByText(/7/)).toBeInTheDocument();  // Tokens
    });

    it('calls exit handler when exit button clicked', async () => {
        let exitCalled = false;
        const { getByText } = render(StatusDisplay, {
            onHelpClick: () => {},
            onExitClick: () => { exitCalled = true; },
            onSettingsClick: () => {}
        });

        const exitButton = getByText('✕');
        await fireEvent.click(exitButton);

        expect(exitCalled).toBe(true);
    });
});
```

### Visual Regression Testing

**Manual checklist:**

1. Before refactoring:
   ```bash
   npm run build && npm run preview
   ```
   - Take screenshots of all screens
   - Note any animations

2. After refactoring:
   ```bash
   npm run build && npm run preview
   ```
   - Take screenshots of same screens
   - Compare side-by-side
   - Verify animations still work

3. Check responsive layouts:
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)

---

## Common Pitfalls

### ❌ Pitfall 1: Breaking Reactive Dependencies

**Bad:**
```javascript
// Composable
export function useComponent() {
    let value = $state(0);
    return value; // ❌ Returns value, not reactive reference
}

// Component
const value = useComponent();
// value is now a number, not reactive!
```

**Good:**
```javascript
// Composable
export function useComponent() {
    let value = $state(0);
    return { value }; // ✅ Returns object containing reactive value
}

// Component
const component = useComponent();
// component.value is reactive
```

---

### ❌ Pitfall 2: Forgetting to Pass Event Handlers

**Bad:**
```svelte
<!-- Parent -->
<SubComponent />

<!-- SubComponent -->
<button onclick={onEvent}>Click</button>
<!-- onEvent is undefined! -->
```

**Good:**
```svelte
<!-- Parent -->
<SubComponent onEvent={handleEvent} />

<!-- SubComponent -->
let { onEvent = () => {} } = $props();
<button onclick={onEvent}>Click</button>
```

---

### ❌ Pitfall 3: Not Extracting Styles

**Bad:**
```svelte
<!-- PlayerInfoBar.svelte -->
<div class="player-round-bar">...</div>

<!-- Styles still in StatusDisplay.svelte -->
```

**Good:**
```svelte
<!-- PlayerInfoBar.svelte -->
<div class="player-round-bar">...</div>

<style>
    .player-round-bar {
        /* Extracted styles here */
    }
</style>
```

---

### ❌ Pitfall 4: Over-Abstracting

**Bad:**
```svelte
<!-- Creating a component for 3 lines of code -->
<GenericWrapper>
    <div class="simple">Text</div>
</GenericWrapper>
```

**Good:**
```svelte
<!-- Keep simple things simple -->
<div class="simple">Text</div>
```

**Rule of Thumb:** Only extract if:
- Component is >100 lines
- Logic is reused in multiple places
- Component has distinct responsibility

---

## Troubleshooting

### Build Errors

**Error:** `Cannot find module 'Component'`

**Solution:** Check import paths
```javascript
// ❌ Wrong
import Component from './Component';

// ✅ Correct
import Component from './Component.svelte';
```

---

**Error:** `$ is not defined`

**Solution:** Svelte 5 runes need proper context
```javascript
// ❌ Wrong - Outside component or composable
const value = $state(0);

// ✅ Correct - Inside component or composable
export function useComponent() {
    let value = $state(0);
    return { value };
}
```

---

### Test Failures

**Error:** `TypeError: Cannot read property 'subscribe' of undefined`

**Solution:** Mock stores in tests
```javascript
import { vi } from 'vitest';

vi.mock('$lib/stores/gameStore.svelte.js', () => ({
    gameState: {
        playerName: 'Test',
        tower: 20,
        // ... mock state
    }
}));
```

---

### Visual Regressions

**Issue:** Component looks different after refactoring

**Debug Steps:**
1. Check if styles were copied correctly
2. Verify CSS class names match
3. Check if CSS variables are imported
4. Use browser DevTools to compare DOM structure

---

## Best Practices

### ✅ DO

1. **Write tests first** (TDD approach)
2. **Extract small components** (100-300 lines)
3. **Use TypeScript types in JSDoc** for better IDE support
4. **Document props** with JSDoc
5. **Commit frequently** with descriptive messages
6. **Test in browser** after each extraction

### ❌ DON'T

1. **Don't refactor multiple components at once**
2. **Don't change functionality while refactoring**
3. **Don't skip tests**
4. **Don't commit broken code**
5. **Don't optimize prematurely**

---

## Checklist for Each Refactoring

```markdown
- [ ] Read component refactoring guide
- [ ] Create feature branch
- [ ] Create directory structure
- [ ] Extract first sub-component
  - [ ] Create file
  - [ ] Define props
  - [ ] Copy logic
  - [ ] Extract styles
  - [ ] Add JSDoc
  - [ ] Write tests
- [ ] Update parent component
  - [ ] Import new component
  - [ ] Pass props
  - [ ] Remove extracted logic
- [ ] Test
  - [ ] npm run build (no errors)
  - [ ] npm run test:unit (all pass)
  - [ ] npm run check (type check)
  - [ ] Manual browser test
- [ ] Commit with descriptive message
- [ ] Repeat for next sub-component
- [ ] Final verification
  - [ ] All tests pass
  - [ ] No visual regressions
  - [ ] Component size meets target
  - [ ] Documentation updated
- [ ] Create pull request
- [ ] Code review
- [ ] Merge
```

---

## Getting Help

### Resources

- **Project Documentation:** `/docs/`
- **Animation Guide:** `/docs/animation-style-guide.md`
- **Project Instructions:** `CLAUDE.md`
- **Svelte 5 Docs:** https://svelte.dev/docs/svelte/overview

### Questions?

- Check existing issues in project tracker
- Review refactoring documentation
- Ask team members
- Create detailed GitHub issue

---

**Document Version:** 1.0
**Last Updated:** 2025-11-19
