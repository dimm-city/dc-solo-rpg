# DC Solo RPG - Component Refactoring Guide

**Last Updated:** 2025-11-19
**Status:** Planning Complete

This document provides detailed, component-by-component refactoring instructions.

---

## Table of Contents

1. [StatusDisplay Refactoring](#statusdisplay-refactoring)
2. [GameScreen Refactoring](#gamescreen-refactoring)
3. [CardDeck Refactoring](#carddeck-refactoring)
4. [JournalEntry Refactoring](#journalentry-refactoring)
5. [StoryMode Refactoring](#storymode-refactoring)
6. [StoryRound Refactoring](#storyround-refactoring)
7. [BrowseGames Refactoring](#browsegames-refactoring)
8. [Settings Components](#settings-components)
9. [Reusable Components Created](#reusable-components-created)

---

## StatusDisplay Refactoring

**Current:** 2,006 lines
**Target:** ~200 lines (90% reduction)
**Priority:** CRITICAL
**Estimated Effort:** 2-3 days

### Before Structure
```
StatusDisplay.svelte (2,006 lines)
└── Everything in one file
```

### After Structure
```
status/
├── StatusDisplay.svelte          (~200 lines) - Orchestrator
├── PlayerInfoBar.svelte           (~180 lines) - Player info + buttons
├── StatsGrid.svelte               (~120 lines) - Grid container
├── StabilityPanel.svelte          (~130 lines) - Stability bar
├── FailureCounterPanel.svelte     (~110 lines) - King indicators
├── AbilitiesPanel.svelte          (~140 lines) - Ability icons
├── SuccessTokensPanel.svelte      (~170 lines) - Token grid
├── DiceReadout.svelte             (~230 lines) - Dice display ⭐
└── ProgressTracker.svelte         (~110 lines) - Cards progress
```

### Step-by-Step Extraction

#### Step 1: Create PlayerInfoBar.svelte

**Extract from:** StatusDisplay.svelte lines 103-206

**New file:** `src/lib/components/status/PlayerInfoBar.svelte`

**Props:**
```typescript
interface PlayerInfoBarProps {
    playerName: string;
    gameTitle: string;
    round: number;
    onExitClick: () => void;
    onHelpClick: () => void;
    onSettingsClick: () => void;
    onDiceThemeClick: () => void;
}
```

**Template:**
```svelte
<script>
    let {
        playerName,
        gameTitle,
        round,
        onExitClick,
        onHelpClick,
        onSettingsClick,
        onDiceThemeClick
    } = $props();
</script>

<div class="player-round-bar">
    <div class="player-info">
        <div class="player-name">{playerName}</div>
        <div class="game-title">{gameTitle}</div>
        <div class="round-number">Round {round}</div>
    </div>

    <div class="action-buttons">
        <button onclick={onDiceThemeClick}>🎲</button>
        <button onclick={onSettingsClick}>⚙️</button>
        <button onclick={onHelpClick}>❓</button>
        <button onclick={onExitClick}>✕</button>
    </div>
</div>

<style>
    /* Copy styles from StatusDisplay lines 620-780 */
</style>
```

**Testing:**
```javascript
// PlayerInfoBar.test.js
import { render } from '@testing-library/svelte';
import PlayerInfoBar from './PlayerInfoBar.svelte';

test('displays player info correctly', () => {
    const { getByText } = render(PlayerInfoBar, {
        playerName: 'Test Player',
        gameTitle: 'Test Game',
        round: 3
    });

    expect(getByText('Test Player')).toBeInTheDocument();
    expect(getByText('Round 3')).toBeInTheDocument();
});
```

---

#### Step 2: Create DiceReadout.svelte ⭐

**Extract from:** StatusDisplay.svelte lines 73-85, 559-632

**New file:** `src/lib/components/status/DiceReadout.svelte`

**Props:**
```typescript
interface DiceReadoutProps {
    lastRoll: number;
    isLucid: boolean;
    isSurreal: boolean;
    showBinaryPips?: boolean; // default: true
}
```

**Implementation:**
```svelte
<script>
    const PIP_COUNT = 5; // D20 rolls mapped to 5-bit binary display

    let {
        lastRoll,
        isLucid,
        isSurreal,
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

    const modifierState = $derived(() => {
        if (isLucid) return 'lucid';
        if (isSurreal) return 'surreal';
        return null;
    });
</script>

<div class="dice-readout-panel" data-modifier={modifierState}>
    <div class="dice-value">{lastRoll}</div>

    {#if showBinaryPips}
        <div class="binary-pips">
            {#each dicePips as pip}
                <div class="pip" class:active={pip}></div>
            {/each}
        </div>
    {/if}

    {#if modifierState}
        <div class="modifier-badge" class:lucid={isLucid} class:surreal={isSurreal}>
            {isLucid ? 'LUCID' : 'SURREAL'}
        </div>
    {/if}
</div>

<style>
    /* Copy styles from StatusDisplay lines 559-632 */
</style>
```

**Reusability:** Can be used in:
- StatusDisplay (current)
- GameScreen during roll screens
- StoryMode to show roll results

---

#### Step 3: Create StatsGrid.svelte

**New file:** `src/lib/components/status/StatsGrid.svelte`

**Purpose:** Container for the 4 stat panels with responsive layout

**Template:**
```svelte
<script>
    import StabilityPanel from './StabilityPanel.svelte';
    import FailureCounterPanel from './FailureCounterPanel.svelte';
    import AbilitiesPanel from './AbilitiesPanel.svelte';
    import SuccessTokensPanel from './SuccessTokensPanel.svelte';

    let {
        stability,
        maxStability,
        isLucid,
        isSurreal,
        kingsRevealed,
        acesRevealed,
        maxAces,
        tokens,
        maxTokens
    } = $props();
</script>

<div class="stats-grid">
    <StabilityPanel {stability} {maxStability} {isLucid} {isSurreal} />
    <FailureCounterPanel {kingsRevealed} />
    <AbilitiesPanel {acesRevealed} {maxAces} />
    <SuccessTokensPanel {tokens} {maxTokens} />
</div>

<style>
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--space-sm);
    }

    @media (max-width: 768px) {
        .stats-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
</style>
```

---

#### Step 4: Create Individual Stat Panels

**StabilityPanel.svelte:**
```svelte
<script>
    let { stability, maxStability, isLucid, isSurreal } = $props();

    const fillPercentage = $derived((stability / maxStability) * 100);
    const barClass = $derived(() => {
        if (stability <= 5) return 'critical';
        if (stability <= 10) return 'warning';
        return 'healthy';
    });
</script>

<div class="stat-panel stability-panel">
    <div class="stat-header">
        <span class="stat-label">Stability</span>
        <span class="stat-value">{stability}/{maxStability}</span>
    </div>

    <div class="stability-bar" class:{barClass}>
        <div class="fill" style="width: {fillPercentage}%"></div>
    </div>

    {#if isLucid || isSurreal}
        <div class="modifier-badge" class:lucid={isLucid} class:surreal={isSurreal}>
            {isLucid ? '↑ LUCID' : '↓ SURREAL'}
        </div>
    {/if}
</div>
```

**FailureCounterPanel.svelte:**
```svelte
<script>
    let { kingsRevealed } = $props();

    const kings = [
        { suit: 'hearts', revealed: kingsRevealed.hearts },
        { suit: 'diamonds', revealed: kingsRevealed.diamonds },
        { suit: 'clubs', revealed: kingsRevealed.clubs },
        { suit: 'spades', revealed: kingsRevealed.spades }
    ];
</script>

<div class="stat-panel failure-panel">
    <div class="stat-header">
        <span class="stat-label">Failure</span>
    </div>

    <div class="kings-grid">
        {#each kings as king}
            <div class="king-indicator" class:revealed={king.revealed} data-suit={king.suit}>
                <span class="suit-symbol">♥♦♣♠</span>
            </div>
        {/each}
    </div>
</div>
```

**AbilitiesPanel.svelte** and **SuccessTokensPanel.svelte:** Similar pattern

---

#### Step 5: Update StatusDisplay.svelte

**New file:** `src/lib/components/StatusDisplay.svelte` (~200 lines)

```svelte
<script>
    import { gameState } from '$lib/stores/gameStore.svelte.js';
    import PlayerInfoBar from './status/PlayerInfoBar.svelte';
    import StatsGrid from './status/StatsGrid.svelte';
    import DiceReadout from './status/DiceReadout.svelte';
    import ProgressTracker from './status/ProgressTracker.svelte';

    let { onHelpClick, onExitClick, onSettingsClick } = $props();
</script>

<div class="status-display-container">
    <PlayerInfoBar
        playerName={gameState.playerName}
        gameTitle={gameState.config?.title}
        round={gameState.round}
        {onExitClick}
        {onHelpClick}
        {onSettingsClick}
        onDiceThemeClick={() => {/* ... */}}
    />

    <StatsGrid
        stability={gameState.tower}
        maxStability={20}
        isLucid={gameState.isLucid}
        isSurreal={gameState.isSurreal}
        kingsRevealed={{
            hearts: gameState.kingOfHearts,
            diamonds: gameState.kingOfDiamonds,
            clubs: gameState.kingOfClubs,
            spades: gameState.kingOfSpades
        }}
        acesRevealed={gameState.acesRevealed}
        maxAces={4}
        tokens={gameState.tokens}
        maxTokens={10}
    />

    <DiceReadout
        lastRoll={gameState.diceRoll}
        isLucid={gameState.isLucid}
        isSurreal={gameState.isSurreal}
    />

    <ProgressTracker
        cardsDrawn={gameState.cardsDrawn}
        totalCards={gameState.cardsToDraw}
    />
</div>

<style>
    .status-display-container {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
        width: 100%;
    }
</style>
```

---

## GameScreen Refactoring

**Current:** 1,399 lines
**Target:** ~400 lines (71% reduction)
**Priority:** CRITICAL
**Estimated Effort:** 3-4 days

### Composables to Create

#### useScreenController.svelte.js

```javascript
// src/lib/composables/useScreenController.svelte.js

export function useScreenController() {
    // Roll for tasks state
    let rollTasksRolled = $state(false);
    let rollTasksRolling = $state(false);
    let rollTasksConfirming = $state(false);

    // Failure check state
    let failureCheckRolling = $state(false);
    let failureCheckResult = $state(undefined);

    // Success check state
    let successCheckRolling = $state(false);
    let successCheckResult = $state(undefined);

    // Button text derivations
    const rollForTasksButtonText = $derived(
        rollTasksRolled ? `Draw ${gameState.cardsToDraw} Cards` : 'Roll Dice'
    );

    const failureCheckButtonText = $derived(
        failureCheckResult ? 'Continue' : 'Roll for Damage'
    );

    const successCheckButtonText = $derived(
        successCheckResult ? 'Continue' : 'Roll to Remove Token'
    );

    // Action handlers
    async function handleRollForTasks() {
        if (rollTasksRolling || rollTasksConfirming) return;

        if (rollTasksRolled) {
            rollTasksConfirming = true;
            await confirmTaskRoll();
            rollTasksConfirming = false;
        } else {
            rollTasksRolling = true;
            const { roll, wasLucid, wasSurreal } = await rollForTasks();
            await rollDice(roll, { isLucid: wasLucid, isSurreal: wasSurreal });
            rollTasksRolling = false;
            applyPendingTaskRoll();
            rollTasksRolled = true;
        }
    }

    // Reset functions
    function resetRollForTasks() {
        rollTasksRolled = false;
        rollTasksRolling = false;
        rollTasksConfirming = false;
    }

    return {
        // State
        rollForTasks: {
            rolled: rollTasksRolled,
            rolling: rollTasksRolling,
            confirming: rollTasksConfirming,
            buttonText: rollForTasksButtonText,
            buttonDisabled: $derived(rollTasksRolling || rollTasksConfirming),
            handle: handleRollForTasks,
            reset: resetRollForTasks
        },
        failureCheck: { /* similar */ },
        successCheck: { /* similar */ }
    };
}
```

**Usage in GameScreen:**
```javascript
const screenController = useScreenController();

// Access state
{screenController.rollForTasks.buttonText}

// Call action
<button onclick={screenController.rollForTasks.handle}>
    {screenController.rollForTasks.buttonText}
</button>
```

---

## CardDeck Refactoring

**Current:** 1,030 lines
**Target:** ~400 lines (61% reduction)
**Priority:** HIGH
**Estimated Effort:** 2-3 days

### useCardAnimationState.svelte.js

```javascript
// src/lib/composables/useCardAnimationState.svelte.js

export function useCardAnimationState() {
    let stage = $state('idle');
    let particles = $state([]);

    const STAGES = {
        IDLE: 'idle',
        ANTICIPATING: 'anticipating',
        MATERIALIZING: 'materializing',
        REVEALED: 'revealed',
        DISMISSING: 'dismissing'
    };

    async function proceed() {
        if (stage !== STAGES.IDLE) return;

        stage = STAGES.ANTICIPATING;
        await sleep(200);

        stage = STAGES.MATERIALIZING;
        await sleep(300);

        stage = STAGES.REVEALED;
    }

    async function dismiss() {
        if (stage !== STAGES.REVEALED) return;

        stage = STAGES.DISMISSING;
        await sleep(600);

        reset();
    }

    function reset() {
        stage = STAGES.IDLE;
        particles = [];
    }

    return {
        stage,
        particles,
        canProceed: $derived(stage === STAGES.IDLE),
        canDismiss: $derived(stage === STAGES.REVEALED),
        proceed,
        dismiss,
        reset
    };
}
```

---

## JournalEntry Refactoring

**Current:** 1,033 lines
**Target:** ~300 lines (71% reduction)
**Priority:** HIGH
**Estimated Effort:** 2-3 days

### AudioRecorder.svelte ⭐

```svelte
<script>
    import { useAudioRecording } from '$lib/composables/useAudioRecording.svelte.js';

    let {
        audioData = $bindable(null),
        maxDuration = 300, // 5 minutes
        onError = (error) => console.error(error)
    } = $props();

    const recorder = useAudioRecording();

    async function handleStartRecording() {
        try {
            await recorder.start();
        } catch (error) {
            onError(error);
        }
    }

    // Bind audioData
    $effect(() => {
        audioData = recorder.audioData;
    });
</script>

<div class="audio-recorder">
    {#if !recorder.isRecording && !recorder.audioData}
        <button onclick={handleStartRecording}>
            🎤 Start Recording
        </button>
    {/if}

    {#if recorder.isRecording}
        <div class="recording-controls">
            <span class="recording-time">{recorder.duration}s</span>
            <button onclick={() => recorder.pause()}>⏸</button>
            <button onclick={() => recorder.stop()}>⏹</button>
        </div>
    {/if}

    {#if recorder.audioData}
        <div class="playback-controls">
            <AudioPlayer data={recorder.audioData} />
            <button onclick={() => recorder.clear()}>🗑️</button>
        </div>
    {/if}
</div>
```

**Reusability:** Can be used anywhere audio recording is needed

---

## Component Dependency Graph

```
Common Components (Created First)
├── EmptyState.svelte
├── LoadingSpinner.svelte
├── ErrorMessage.svelte
└── CardTypeInfo.svelte

StatusDisplay (Phase 1)
├── PlayerInfoBar.svelte
├── DiceReadout.svelte ⭐ ─┐
├── StatsGrid.svelte        │
│   ├── StabilityPanel       │
│   ├── FailureCounterPanel  │
│   ├── AbilitiesPanel       │
│   └── SuccessTokensPanel   │
└── ProgressTracker          │
                             │
GameScreen (Phase 2)         │
├── Uses DiceReadout ←───────┘
├── ContextBackground
└── Screen Controllers

CardDeck (Phase 3)
├── CardDisplay.svelte ⭐ ─┐
├── ParticleCanvas ⭐       │
└── CardAnimations          │
                            │
StoryMode (Phase 4)         │
├── Uses CardDisplay ←──────┘
├── StoryProgressBar
└── StoryNavigation

JournalEntry (Phase 3)
├── AudioRecorder ⭐
├── AudioPlayback
└── AutoJournalTimer

BrowseGames (Phase 4)
├── GameCard ⭐
└── SortControls
```

**Legend:**
- ⭐ = Highly reusable component
- → = Dependency relationship

---

## Refactoring Checklist Template

For each component refactored:

```markdown
### [Component Name] Refactoring

- [ ] **Plan**
  - [ ] Identify extraction points
  - [ ] Define new component boundaries
  - [ ] List props/interfaces

- [ ] **Create New Files**
  - [ ] Create component directory if needed
  - [ ] Create sub-component files
  - [ ] Create composable files

- [ ] **Extract Logic**
  - [ ] Copy relevant code sections
  - [ ] Define props/interfaces
  - [ ] Extract styles
  - [ ] Add JSDoc documentation

- [ ] **Update Parent**
  - [ ] Import new components
  - [ ] Replace inline logic with components
  - [ ] Pass props correctly

- [ ] **Testing**
  - [ ] Write unit tests for composables
  - [ ] Write component tests
  - [ ] Run integration tests
  - [ ] Visual regression testing

- [ ] **Verification**
  - [ ] Build succeeds
  - [ ] No TypeScript errors
  - [ ] No visual regressions
  - [ ] Performance maintained

- [ ] **Documentation**
  - [ ] Update component documentation
  - [ ] Add usage examples
  - [ ] Update README if needed

- [ ] **Cleanup**
  - [ ] Remove old code
  - [ ] Update imports
  - [ ] Remove unused dependencies
```

---

## Migration Strategy

### Option A: Big Bang (Not Recommended)
Refactor all components in one PR. **Risk:** High chance of breaking changes.

### Option B: Incremental (Recommended)
Refactor one component at a time with these phases:

1. **Phase 1: Infrastructure** (Week 1)
   - Create composables directory
   - Create common components
   - Refactor StatusDisplay

2. **Phase 2: Core Game** (Week 2)
   - Refactor GameScreen
   - Extract screen controllers

3. **Phase 3: Features** (Week 3)
   - Refactor CardDeck
   - Refactor JournalEntry

4. **Phase 4: Polish** (Week 4)
   - Refactor StoryMode
   - Refactor BrowseGames

5. **Phase 5: Settings** (Week 5)
   - Refactor AISettings
   - Refactor other settings

### Feature Branch Strategy

```bash
# Main refactoring branch
git checkout -b refactor/component-architecture

# Sub-branches for each component
git checkout -b refactor/status-display
git checkout -b refactor/game-screen
git checkout -b refactor/card-deck
# etc.

# Merge sub-branches into main refactoring branch
# Merge main refactoring branch into main after full testing
```

---

## Testing Each Refactoring

### Visual Regression Testing

```bash
# Before refactoring
npm run build
npm run preview
# Take screenshots

# After refactoring
npm run build
npm run preview
# Compare screenshots
```

### Unit Testing Checklist

- [ ] All composables have tests
- [ ] All new components have tests
- [ ] Edge cases covered
- [ ] Error handling tested

### Integration Testing

- [ ] Full game flow works
- [ ] Auto-play works correctly
- [ ] State transitions work
- [ ] Animations work

---

## Rollback Plan

If a refactoring causes issues:

1. **Immediate:** Revert the PR
2. **Analysis:** Identify what broke
3. **Fix:** Address the issue
4. **Retry:** Submit updated PR

Keep feature branches until refactoring is fully verified in production.

---

**Document Version:** 1.0
**Last Updated:** 2025-11-19
