# Complete Svelte 5 Modernization Plan

## Overview

This plan addresses ALL architectural improvements identified in the expert reviews. The work is divided into phases based on dependencies and impact.

**Total Estimated Time:** 8-12 hours
**Code Reduction:** ~40% (eliminate ~1000+ lines)
**Complexity Reduction:** ~60%

---

## Phase 1: Remove Legacy Code (30 minutes)

**Impact:** Immediate cleanup, no functional changes
**Risk:** Minimal - files are unused

### Step 1.1: Delete Unused Legacy Files

```bash
# Verify no imports exist (should return nothing)
grep -r "from.*WAAStore" src/ --exclude-dir=node_modules
grep -r "import.*WAAStore" src/ --exclude-dir=node_modules

# Delete legacy store files
rm src/lib/stores/WAAStore.js
rm src/lib/stores/WAAStateMachine.js

# Verify tests still pass
npm test
```

**Files to delete:**
- `src/lib/stores/WAAStore.js` (536 lines)
- `src/lib/stores/WAAStateMachine.js` (83 lines)

### Step 1.2: Rename Misleading Test File

```bash
# Rename test to reflect what it actually tests
git mv src/lib/stores/WAAStore.test.js src/lib/stores/gameFlow.test.js

# Update test file header comment
# Edit line 1-5 to reference gameStore.svelte.js instead of WAAStore.js

# Run tests
npm test
```

**Verification:**
- All tests pass
- Test file name reflects actual functionality

---

## Phase 2: Remove ConfigurationLoader (2-3 hours)

**Impact:** Eliminate 186 lines, simplify data loading
**Risk:** Medium - touches game initialization

### Current State

**Problem:** Dual data loading systems
1. `ConfigurationLoader.js` - Legacy client-side loader (186 lines)
2. `+page.server.js` - Modern SvelteKit server loader (already working!)

**Solution:** The `[slug]` route ALREADY loads everything correctly. We just need to remove ConfigurationLoader usage.

### Step 2.1: Remove ConfigurationLoader from gameActions

**File:** `src/lib/stores/gameActions.svelte.js`

```javascript
// REMOVE these lines (7-10):
import { ConfigurationLoader } from '../configuration/ConfigurationLoader.js';
const configLoader = new ConfigurationLoader();

// DELETE the entire loadSystemConfig function (currently uses ConfigurationLoader)
// This function is ONLY called from routes/game/+page.svelte which we're removing anyway
```

### Step 2.2: Remove Hardcoded Game Route

**File:** `src/routes/game/+page.svelte`

**Problem:** This file hardcodes "future-lost" game and duplicates server load logic

```bash
# This file should not exist - delete it
rm src/routes/game/+page.svelte
```

**Why:** The dynamic `[slug]` route already handles everything better.

### Step 2.3: Update Game.svelte Component

**File:** `src/lib/components/Game.svelte`

**Current:** Expects `systemSettings` prop and calls `loadSystemConfig()`
**New:** Config already loaded by SvelteKit, just initialize game state

```javascript
// REMOVE export function (lines 31-38)
export const startGame = async () => {
	if (systemSettings.gameConfigUrl && systemSettings.player?.name) {
		await loadSystemConfig(systemSettings);
		ongameloaded(systemSettings);
	} else {
		gameState.status = 'Please select a player and a game';
	}
};

// This function becomes unnecessary - initialization happens in +page.svelte onMount
```

### Step 2.4: Simplify [slug] Page Component

**File:** `src/routes/game/[slug]/+page.svelte`

This file already does everything correctly! Just keep it as-is.

### Step 2.5: Delete ConfigurationLoader Files

```bash
# Remove the entire configuration loader system
rm src/lib/configuration/ConfigurationLoader.js
rm src/lib/configuration/ConfigurationLoader.test.js
rm src/lib/configuration/SystemSettings.js

# Run tests
npm test

# Test game loading manually
npm run dev
# Visit http://localhost:5173/game/future-lost
```

**Verification:**
- Game loads correctly at `/game/future-lost`
- Config, deck, introduction all load
- Custom stylesheet applies
- No console errors

---

## Phase 3: Simplify State Transitions (2-3 hours)

**Impact:** Remove ~300 lines of complex transition code
**Risk:** Low - Svelte handles transitions natively

### Current State

**Problem:** 5 layers of transition complexity
1. `transitionStore.svelte.js` - Prevents race conditions (29 lines)
2. `transitions.js` - State graph validation
3. `transitionToScreen()` in gameActions - Animation orchestration
4. Manual DOM manipulation and sleep() calls
5. CSS classes for animations

**Solution:** Use Svelte's built-in `transition:` directive

### Step 3.1: Identify Current Transition Usage

```bash
# Find all transitionToScreen calls
grep -rn "transitionToScreen" src/lib/components/
```

### Step 3.2: Replace with Svelte Transitions

**File:** `src/lib/components/Game.svelte`

```svelte
<script>
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	// Remove transitionToScreen import
	// Keep gameState for screen tracking
</script>

<!-- BEFORE: Complex screen switching -->
{#if currentScreen == 'intro'}
	<div class="dc-game-bg dc-intro-wrapper">
		<IntroScreen />
	</div>
{/if}

<!-- AFTER: Use Svelte transitions -->
{#if currentScreen == 'intro'}
	<div class="dc-game-bg dc-intro-wrapper" transition:fade={{ duration: 300 }}>
		<IntroScreen />
	</div>
{/if}
```

**For all screen transitions:**
- Replace `await transitionToScreen('newState')` with direct `transitionTo('newState')`
- Add `transition:fade` or `transition:fly` to screen containers
- Remove all `sleep()` calls

### Step 3.3: Update Action Functions

**File:** `src/lib/stores/gameActions.svelte.js`

```javascript
// DELETE transitionToScreen function entirely (50+ lines)
// KEEP simple transitionTo function from gameStore

// Update all action functions to use transitionTo directly
export async function startNextRound() {
	gameState.round++;
	transitionTo('startRound'); // Direct state change, Svelte handles animation
}
```

### Step 3.4: Remove Transition Infrastructure

```bash
# Delete transition management files
rm src/lib/stores/transitionStore.svelte.js
rm src/lib/stores/transitions.js  # If this file exists

# Update imports in components
# Remove: import { transitionToScreen } from ...
# Use: import { transitionTo } from '../stores/gameStore.svelte.js'
```

**Verification:**
- Screen transitions still animate smoothly
- No race conditions (Svelte handles this)
- Simpler, more declarative code

---

## Phase 4: Add Error Boundaries (30 minutes)

**Impact:** Better error handling UX
**Risk:** None - additive change

### Step 4.1: Create Root Error Page

**File:** `src/routes/+error.svelte`

```svelte
<script>
	import { page } from '$app/stores';
	import AugmentedButton from '$lib/components/AugmentedButton.svelte';
</script>

<div class="error-container">
	<h1>Oops! Something went wrong</h1>
	<p class="error-message">{$page.error?.message || 'An unexpected error occurred'}</p>
	<AugmentedButton href="/" text="Return Home" />
</div>

<style>
	.error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 2rem;
		text-align: center;
	}

	.error-message {
		color: var(--color-error, #ef4444);
		margin: 1rem 0 2rem;
	}
</style>
```

### Step 4.2: Create Game-Specific Error Page

**File:** `src/routes/game/[slug]/+error.svelte`

```svelte
<script>
	import { page } from '$app/stores';
	import AugmentedButton from '$lib/components/AugmentedButton.svelte';

	const slug = $page.params.slug;
</script>

<div class="game-error">
	<h1>Game Not Found</h1>
	<p>The game "{slug}" could not be loaded.</p>
	<p class="error-details">{$page.error?.message}</p>

	<div class="actions">
		<AugmentedButton href="/" text="Browse Games" />
	</div>
</div>

<style>
	.game-error {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 2rem;
		text-align: center;
		background: var(--game-bg, #1a1a1a);
	}

	.error-details {
		color: #888;
		font-size: 0.875rem;
		margin-top: 0.5rem;
	}

	.actions {
		margin-top: 2rem;
	}
</style>
```

**Verification:**
- Visit `/game/nonexistent` - should show error page
- Visit `/game/future-lost` - should load normally

---

## Phase 5: Improve Routing Structure (1-2 hours)

**Impact:** Cleaner navigation, better URLs
**Risk:** Low - mostly organizational

### Current Routing

```
/ → Home page (game selector) ✅ Good
/game → Hardcoded route ❌ Remove (done in Phase 2)
/game/[slug] → Dynamic game loading ✅ Good
```

### Step 5.1: Verify Clean Routing

After Phase 2, routing should be:

```
/ → Game library (list of available games)
/game/[slug] → Play specific game
```

**File:** `src/routes/+page.svelte` (already correct!)

This file already:
- Lists available games from server data
- Links to `/game/{slug}` routes
- Provides clean navigation

**No changes needed!**

### Step 5.2: Optional - Add Game Layout

**File:** `src/routes/game/+layout.svelte`

```svelte
<script>
	let { children } = $props();
</script>

<div class="game-layout">
	{@render children()}
</div>

<style>
	.game-layout {
		position: fixed;
		inset: 0;
		overflow: hidden;
		/* Game-specific base styles */
	}

	/* Hide site header/footer for fullscreen games */
	:global(body > header),
	:global(body > footer) {
		display: none;
	}
</style>
```

This moves fullscreen game styles from individual pages to shared layout.

**Then update:** `src/routes/game/[slug]/+page.svelte`

```svelte
<!-- Remove these styles - now in layout -->
<style>
	/* DELETE fullscreen game styles - moved to +layout.svelte */

	/* Keep only page-specific styles */
	.game-page {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}
</style>
```

**Verification:**
- Games still render fullscreen
- Header/footer hidden in game routes
- Styles properly scoped

---

## Phase 6: Extract GameScreen Router (1-2 hours)

**Impact:** Simplify Game.svelte, better separation of concerns
**Risk:** Low - pure refactor

### Current State

`Game.svelte` has 120+ lines of inline screen routing (lines 57-120)

### Step 6.1: Create GameScreen Component

**File:** `src/lib/components/GameScreen.svelte`

```svelte
<script>
	import { gameState } from '../stores/gameStore.svelte.js';
	import { transitionTo } from '../stores/gameActions.svelte.js';
	import { fade } from 'svelte/transition';

	import LoadScreen from './LoadScreen.svelte';
	import OptionsScreen from './OptionsScreen.svelte';
	import IntroScreen from './IntroScreen.svelte';
	import GameOver from './GameOver.svelte';
	import JournalEntry from './JournalEntry.svelte';
	import SuccessCheck from './SuccessCheck.svelte';
	import RollForTasks from './RollForTasks.svelte';
	import DrawCard from './DrawCard.svelte';
	import FailureCheck from './FailureCheck.svelte';
	import StatusDisplay from './StatusDisplay.svelte';
	import Toolbar from './Toolbar.svelte';
	import AugmentedButton from './AugmentedButton.svelte';

	let {
		systemSettings = {},
		onfailurecheckcompleted = () => {},
		onjournalsaved = () => {}
	} = $props();

	const currentScreen = $derived(gameState.state);
</script>

{#if currentScreen == 'loadGame'}
	<div class="dc-game-bg" transition:fade={{ duration: 300 }}>
		<LoadScreen />
	</div>
{:else if currentScreen == 'options'}
	<div class="dc-game-bg" transition:fade={{ duration: 300 }}>
		<OptionsScreen {systemSettings} />
	</div>
{:else if currentScreen == 'intro'}
	<div class="dc-game-bg dc-intro-wrapper" transition:fade={{ duration: 300 }}>
		<IntroScreen />
	</div>
{:else if currentScreen == 'gameOver'}
	<div class="dc-fade-in dc-screen-container" transition:fade={{ duration: 300 }}>
		<GameOver />
	</div>
{:else if currentScreen == 'finalLog' || currentScreen == 'log'}
	<div class="dc-fade-in dc-screen-container dc-journal-screen" transition:fade={{ duration: 300 }}>
		<JournalEntry {onjournalsaved} />
	</div>
{:else if currentScreen == 'exitGame'}
	<div transition:fade={{ duration: 300 }}>Game Exited</div>
{:else}
	<div class="game-screen dc-game-bg">
		<div class="toolbar-area">
			<Toolbar />
		</div>
		<div class="status-display-area dc-fade-in">
			{#if currentScreen != 'log' && currentScreen != 'finalLog'}
				<StatusDisplay />
			{/if}
		</div>
		<div class="main-screen-area dc-table-bg">
			{#if currentScreen == 'startRound'}
				<div class="dc-fade-in dc-screen-container" transition:fade={{ duration: 300 }}>
					<h4>Round {gameState.round}</h4>
					<AugmentedButton
						text="Roll for tasks"
						onclick={() => transitionTo('rollForTasks')}
					/>
				</div>
			{:else if currentScreen == 'rollForTasks'}
				<div class="dc-fade-in dc-screen-container" transition:fade={{ duration: 300 }}>
					<RollForTasks />
				</div>
			{:else if currentScreen == 'drawCard'}
				<div class="dc-fade-in dc-screen-container" transition:fade={{ duration: 300 }}>
					<DrawCard />
				</div>
			{:else if currentScreen == 'successCheck'}
				<div class="dc-fade-in dc-screen-container" transition:fade={{ duration: 300 }}>
					<SuccessCheck />
				</div>
			{:else if currentScreen == 'failureCheck'}
				<div class="dc-fade-in dc-screen-container" transition:fade={{ duration: 300 }}>
					<FailureCheck {onfailurecheckcompleted} />
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	/* Move all screen layout styles from Game.svelte here */
	.game-screen {
		display: grid;
		grid-template-rows: auto auto 1fr;
		height: 100%;
		width: 100%;
	}

	.toolbar-area {
		grid-row: 1;
	}

	.status-display-area {
		grid-row: 2;
	}

	.main-screen-area {
		grid-row: 3;
		overflow-y: auto;
	}

	/* Additional styles... */
</style>
```

### Step 6.2: Simplify Game.svelte

**File:** `src/lib/components/Game.svelte`

```svelte
<script>
	import { gameState } from '../stores/gameStore.svelte.js';
	import NeuralBackground from './NeuralBackground.svelte';
	import GameScreen from './GameScreen.svelte';

	let {
		systemSettings = $bindable({}),
		ongameloaded = () => {},
		ongameover = () => {},
		onexitgame = () => {},
		onfailurecheckcompleted = () => {},
		onjournalsaved = () => {}
	} = $props();

	const gameStylesheet = $derived(gameState.stylesheet);
	const currentScreen = $derived(gameState.state);

	$effect(() => {
		if (currentScreen == 'gameOver') {
			ongameover(gameState.state);
		} else if (currentScreen == 'exitGame') {
			onexitgame(gameState.state);
		}
	});
</script>

<svelte:head>
	<link rel="stylesheet" href={gameStylesheet} />
</svelte:head>

<div class="dc-game-container dc-game-bg">
	<NeuralBackground />
	<GameScreen
		{systemSettings}
		{onfailurecheckcompleted}
		{onjournalsaved}
	/>
</div>

<style>
	.dc-game-container {
		position: relative;
		width: 100%;
		height: 100%;
	}
</style>
```

**Result:** Game.svelte reduced from 200+ lines to ~50 lines

**Verification:**
- All screens still render correctly
- Transitions work
- Props flow correctly

---

## Phase 7: Final Cleanup (1 hour)

### Step 7.1: Remove Unused Imports

```bash
# Find unused imports across all components
grep -rn "import.*transitionToScreen" src/lib/components/
grep -rn "import.*ConfigurationLoader" src/
```

### Step 7.2: Update Documentation

Update these files to reflect new architecture:
- `README.md` - Update setup instructions
- `docs/ARCHITECTURE.md` - Document new simplified structure
- `docs/SVELTE_5_MIGRATION_PLAN.md` - Mark as complete

### Step 7.3: Run Full Test Suite

```bash
# Unit tests
npm test

# Type checking (if using TypeScript)
npm run check

# Build production bundle
npm run build

# Manual testing checklist:
# - Load game from home page
# - Play through a round
# - View journal
# - Check game over screen
# - Verify custom styles load
# - Test error pages (visit /game/nonexistent)
```

---

## Summary of Changes

### Files Deleted (10 files, ~900 lines)
- ✅ `src/lib/stores/WAAStore.js` (536 lines)
- ✅ `src/lib/stores/WAAStateMachine.js` (83 lines)
- ✅ `src/lib/configuration/ConfigurationLoader.js` (186 lines)
- ✅ `src/lib/configuration/ConfigurationLoader.test.js`
- ✅ `src/lib/configuration/SystemSettings.js`
- ✅ `src/lib/stores/transitionStore.svelte.js` (29 lines)
- ✅ `src/lib/stores/transitions.js` (if exists)
- ✅ `src/routes/game/+page.svelte` (100 lines)

### Files Created (3 files, ~200 lines)
- ✅ `src/routes/+error.svelte`
- ✅ `src/routes/game/[slug]/+error.svelte`
- ✅ `src/routes/game/+layout.svelte` (optional)
- ✅ `src/lib/components/GameScreen.svelte`

### Files Modified (5-10 files)
- ✅ `src/lib/stores/gameActions.svelte.js` - Remove ConfigurationLoader
- ✅ `src/lib/components/Game.svelte` - Simplify to use GameScreen
- ✅ `src/routes/game/[slug]/+page.svelte` - Already good, minor cleanup
- ✅ Various components - Remove transitionToScreen, use transitionTo

### Net Impact
- **Lines removed:** ~900
- **Lines added:** ~200
- **Net reduction:** ~700 lines (40% of state/config code)
- **Complexity reduction:** ~60%

---

## Implementation Order

Follow this exact order to avoid breaking changes:

1. ✅ **Phase 1** (30 min) - Delete legacy stores (safe, no dependencies)
2. ✅ **Phase 4** (30 min) - Add error pages (additive, no conflicts)
3. ✅ **Phase 2** (2-3 hrs) - Remove ConfigurationLoader (requires testing)
4. ✅ **Phase 5** (1 hr) - Add game layout (optional, improves structure)
5. ✅ **Phase 3** (2-3 hrs) - Simplify transitions (requires component updates)
6. ✅ **Phase 6** (1-2 hrs) - Extract GameScreen (final refactor)
7. ✅ **Phase 7** (1 hr) - Cleanup and documentation

**Total Time:** 8-12 hours depending on testing thoroughness

---

## Testing Strategy

### After Each Phase

```bash
# Run unit tests
npm test

# Check for build errors
npm run build

# Manual smoke test
npm run dev
# Visit http://localhost:5173
# Select and play a game
```

### Comprehensive Testing (After All Phases)

**Unit Tests:**
- ✅ All existing tests pass
- ✅ No new console warnings
- ✅ Coverage maintained

**Integration Tests:**
- ✅ Game selection from home page
- ✅ Game loads with correct config
- ✅ Deck shuffles and draws cards
- ✅ State transitions work
- ✅ Journal entries save
- ✅ Game over logic functions
- ✅ Custom stylesheets load

**Error Handling:**
- ✅ Invalid game slug shows error page
- ✅ Missing config files handled gracefully
- ✅ Error page includes "back home" link

**Browser Testing:**
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (if available)

---

## Rollback Strategy

Each phase is self-contained. If issues arise:

```bash
# Check current git status
git status

# Rollback specific phase
git checkout HEAD -- <file-path>

# Or rollback everything
git reset --hard HEAD

# Or create a safety branch before starting
git checkout -b backup-before-migration
git checkout -b phase1-migration
# ... do work ...
# If problems: git checkout backup-before-migration
```

---

## Success Criteria

When complete, the codebase should have:

- ✅ No WAAStore or WAAStateMachine references
- ✅ No ConfigurationLoader usage
- ✅ All data loaded via SvelteKit `+page.server.js`
- ✅ Error pages for invalid routes
- ✅ Svelte transitions instead of manual animations
- ✅ Clean component hierarchy (Game → GameScreen → Screens)
- ✅ All tests passing
- ✅ Production build successful
- ✅ No console errors during gameplay
- ✅ 40% less state management code
- ✅ Documentation updated

---

## Philosophy Preserved

This plan respects your architectural preferences:

✅ **Keep lifecycle hooks** - `onMount`/`onDestroy` remain in components
✅ **Minimal $effect usage** - Only where absolutely necessary
✅ **Event-driven patterns** - Props and callbacks over reactive magic
✅ **Proper cleanup** - `onDestroy` for event handler cleanup
✅ **Svelte 5 runes** - `$state`, `$derived`, `$props` throughout
✅ **Standard patterns** - No over-engineering, follow framework conventions

---

## Notes

- Each phase can be committed separately
- Phases 1, 4, and 5 are safe and quick wins
- Phases 2, 3, and 6 require more careful testing
- Phase 7 is cleanup and can be done incrementally
- The plan is designed to minimize risk while maximizing impact

Good luck! 🚀

This document provides a complete, step-by-step plan to migrate from dual state management systems (legacy Svelte 4 + Svelte 5) to using only Svelte 5 runes-based stores.

**Current State:**
- ✅ All 14 Svelte components already use `gameStore.svelte.js` and `gameActions.svelte.js`
- ✅ All unit tests in `WAAStore.test.js` already test the new Svelte 5 stores
- ❌ Legacy files `WAAStore.js` and `WAAStateMachine.js` still exist (536+ lines total)
- ❌ Test file named `WAAStore.test.js` is confusing (it tests new stores, not WAAStore)

**Target State:**
- Single source of truth: `gameStore.svelte.js` (167 lines)
- All actions in: `gameActions.svelte.js` (502 lines)
- State transitions validated by: `transitions.js` (41 lines)
- Animation state managed by: `transitionStore.svelte.js` (29 lines)
- Delete: `WAAStore.js`, `WAAStateMachine.js`
- Rename: `WAAStore.test.js` → `gameFlow.test.js` (reflects actual testing focus)

**What This Migration Does:**
- Removes duplicate state management code
- Eliminates synchronization bugs between dual systems
- Reduces codebase complexity by ~30%
- Maintains ALL existing functionality using Svelte 5 runes patterns

**What This Migration Does NOT Do:**
- ❌ Does NOT convert `onMount`/`onDestroy` to `$effect()` (keeping lifecycle hooks)
- ❌ Does NOT change event handler patterns (they work fine)
- ❌ Does NOT introduce `$effect()` where not needed (following action/event-driven design)

---

## Pre-Migration Checklist

Before starting the migration, verify:

- [ ] All unit tests currently pass: `npm run test:unit`
- [ ] Git working directory is clean: `git status`
- [ ] You're on a feature branch (not `main`): `git branch --show-current`
- [ ] Node version >= 20.0.0: `node --version`
- [ ] All dependencies installed: `npm install`

**Create a backup branch (recommended):**
```bash
git checkout -b backup/pre-phase1-migration
git push origin backup/pre-phase1-migration
git checkout claude/svelte-5-migration-runes-011CUykd8vReQjCXB95tvReo
```

---

## Files Affected Summary

### Files to DELETE (2 files)
```
src/lib/stores/WAAStore.js                    (536 lines)
src/lib/stores/WAAStateMachine.js             (83 lines)
```

### Files to RENAME (1 file)
```
src/lib/stores/WAAStore.test.js  →  src/lib/stores/gameFlow.test.js
```

### Files to UPDATE (1 file)
```
src/lib/stores/gameFlow.test.js               (Update import paths and test descriptions)
```

### Files VERIFIED as Already Migrated (14 Svelte components)
```
✅ src/lib/components/Game.svelte
✅ src/lib/components/ThreeJSDiceBoxRoller.svelte
✅ src/lib/components/GameOver.svelte
✅ src/lib/components/JournalEntry.svelte
✅ src/lib/components/IntroScreen.svelte
✅ src/lib/components/DrawCard.svelte
✅ src/routes/game/[slug]/+page.svelte
✅ src/lib/components/OptionsScreen.svelte
✅ src/lib/components/RollForTasks.svelte
✅ src/lib/components/StatusDisplay.svelte
✅ src/lib/components/SuccessCheck.svelte
✅ src/lib/components/Toolbar.svelte
✅ src/lib/components/FailureCheck.svelte
✅ src/lib/components/HealthMeter.svelte
```

**Note:** These components already import from `gameStore.svelte.js` and `gameActions.svelte.js` exclusively. NO changes needed.

---

## Step-by-Step Implementation

### Step 1: Verify No Remaining WAAStore Imports

**Objective:** Confirm that NO files in `src/` currently import from WAAStore or WAAStateMachine.

**Commands to run:**
```bash
# Search for any imports of WAAStore or WAAStateMachine
grep -r "from.*WAAStore" src/ --include="*.svelte" --include="*.js" | grep -v "test.js"
grep -r "from.*WAAStateMachine" src/ --include="*.svelte" --include="*.js" | grep -v "test.js"
```

**Expected result:**
- No matches (except in test files)

**If you find any matches:**
- STOP - Do not proceed
- Document the file(s) that still import WAAStore
- Update those files to use `gameStore.svelte.js` and `gameActions.svelte.js` first
- Return to Step 1

**Verification:**
```bash
# Should return: "No files found importing WAAStore"
```

**Rollback strategy:**
- N/A - This is read-only verification

---

### Step 2: Run Full Test Suite Before Changes

**Objective:** Establish baseline - all tests should pass before we make any changes.

**Commands to run:**
```bash
# Run unit tests
npm run test:unit

# Run Playwright tests (optional but recommended)
npm run test
```

**Expected result:**
- All unit tests pass
- Note: Some Playwright tests may have known issues (document them)

**If tests fail:**
- STOP - Do not proceed
- Fix failing tests first
- Return to Step 2

**Verification:**
- ✅ `gameStore.test.js` passes (tests core state management)
- ✅ `gameActions.test.js` passes (tests game mechanics)
- ✅ `WAAStore.test.js` passes (actually tests gameStore/gameActions)
- ✅ `transitions.test.js` passes (tests state transition validation)

**Rollback strategy:**
- N/A - No changes made yet

---

### Step 3: Rename WAAStore.test.js to gameFlow.test.js

**Objective:** Clarify that this test file tests the integrated game flow, not the legacy WAAStore.

**Rationale:**
- The file `WAAStore.test.js` currently imports from `gameStore.svelte.js` and `gameActions.svelte.js`
- It does NOT test `WAAStore.js` - it tests the NEW Svelte 5 stores
- The name is confusing and misleading
- Better name: `gameFlow.test.js` (describes what it actually tests: full game flow integration)

**Commands to run:**
```bash
cd /home/founder3/code/dimm-city/dc-solo-rpg

# Rename the file
git mv src/lib/stores/WAAStore.test.js src/lib/stores/gameFlow.test.js
```

**Expected result:**
- File renamed successfully
- Git tracks it as a rename (not delete + add)

**Verification:**
```bash
# Verify rename
git status | grep "renamed:"

# Should show: renamed: src/lib/stores/WAAStore.test.js -> src/lib/stores/gameFlow.test.js
```

**Rollback strategy:**
```bash
# Undo the rename
git mv src/lib/stores/gameFlow.test.js src/lib/stores/WAAStore.test.js
git restore src/lib/stores/WAAStore.test.js
```

---

### Step 4: Update Test File Comments and Descriptions

**Objective:** Update the renamed test file to reflect its actual purpose.

**File to modify:** `/home/founder3/code/dimm-city/dc-solo-rpg/src/lib/stores/gameFlow.test.js`

**Changes required:**

1. Update the describe block name:
   ```javascript
   // OLD:
   describe('WAAStore', () => {

   // NEW:
   describe('Game Flow Integration', () => {
   ```

2. Update the header comment:
   ```javascript
   // OLD (lines 1-18):
   import { test, describe, expect, vi, beforeEach } from 'vitest';
   import { readFileSync } from 'fs';
   import { gameState } from './gameStore.svelte.js';
   // ... rest of imports

   // NEW:
   /**
    * Integration tests for complete game flow
    * Tests the full game lifecycle using Svelte 5 runes-based stores:
    * - gameStore.svelte.js (state management)
    * - gameActions.svelte.js (game logic)
    *
    * Covers: loading config, starting game, drawing cards, failure/success checks,
    * journal recording, and game restart/exit flows.
    */
   import { test, describe, expect, vi, beforeEach } from 'vitest';
   import { readFileSync } from 'fs';
   import { gameState } from './gameStore.svelte.js';
   // ... rest of imports
   ```

**Verification:**
```bash
# Run the renamed test file
npm run test:unit -- gameFlow.test.js

# Should pass with new name
```

**Rollback strategy:**
```bash
# Revert changes
git restore src/lib/stores/gameFlow.test.js
```

---

### Step 5: Verify Tests Still Pass After Rename

**Objective:** Confirm that renaming and updating comments didn't break anything.

**Commands to run:**
```bash
# Run all unit tests
npm run test:unit

# Specifically verify the renamed file
npm run test:unit -- gameFlow.test.js
```

**Expected result:**
- All tests pass
- Same number of tests as before (no tests lost in rename)

**If tests fail:**
- Review the changes made in Step 4
- Check for typos in the describe block or imports
- Revert and retry

**Verification:**
- ✅ All 525+ tests pass
- ✅ `gameFlow.test.js` specifically passes

**Rollback strategy:**
```bash
# Revert all changes from Steps 3-4
git restore --staged .
git restore .
```

---

### Step 6: Delete WAAStore.js

**Objective:** Remove the legacy Svelte 4 store file.

**File to delete:** `/home/founder3/code/dimm-city/dc-solo-rpg/src/lib/stores/WAAStore.js`

**Pre-deletion verification:**
```bash
# CRITICAL: Verify NO files import from this file (excluding tests)
grep -r "from.*WAAStore\.js" src/ --include="*.svelte" --include="*.js" | grep -v "test.js"

# Expected: No results
```

**Commands to run:**
```bash
cd /home/founder3/code/dimm-city/dc-solo-rpg

# Delete the file
git rm src/lib/stores/WAAStore.js
```

**Expected result:**
- File deleted and staged for commit
- Git status shows: `deleted: src/lib/stores/WAAStore.js`

**Verification:**
```bash
# Verify file is gone
ls src/lib/stores/WAAStore.js 2>&1

# Should show: "No such file or directory"

# Verify git tracked the deletion
git status | grep "deleted.*WAAStore.js"
```

**Rollback strategy:**
```bash
# Restore the deleted file
git restore --staged src/lib/stores/WAAStore.js
git restore src/lib/stores/WAAStore.js
```

---

### Step 7: Delete WAAStateMachine.js

**Objective:** Remove the legacy state machine class.

**File to delete:** `/home/founder3/code/dimm-city/dc-solo-rpg/src/lib/stores/WAAStateMachine.js`

**Pre-deletion verification:**
```bash
# CRITICAL: Verify NO files import from this file
grep -r "from.*WAAStateMachine" src/ --include="*.svelte" --include="*.js"

# Expected: Only WAAStore.js should match (which we already deleted)
```

**Commands to run:**
```bash
cd /home/founder3/code/dimm-city/dc-solo-rpg

# Delete the file
git rm src/lib/stores/WAAStateMachine.js
```

**Expected result:**
- File deleted and staged for commit
- Git status shows: `deleted: src/lib/stores/WAAStateMachine.js`

**Verification:**
```bash
# Verify file is gone
ls src/lib/stores/WAAStateMachine.js 2>&1

# Should show: "No such file or directory"

# Verify git tracked the deletion
git status | grep "deleted.*WAAStateMachine.js"
```

**Rollback strategy:**
```bash
# Restore the deleted file
git restore --staged src/lib/stores/WAAStateMachine.js
git restore src/lib/stores/WAAStateMachine.js
```

---

### Step 8: Run Full Test Suite After Deletions

**Objective:** Verify that deleting legacy files didn't break anything.

**Commands to run:**
```bash
# Run all unit tests
npm run test:unit

# Check for build errors
npm run build
```

**Expected result:**
- ✅ All unit tests pass
- ✅ Build succeeds without errors
- ✅ No import errors
- ✅ No missing module errors

**If tests fail or build fails:**
- STOP immediately
- Check error messages for any references to WAAStore or WAAStateMachine
- This indicates a file still imports from deleted files
- Find the file and update its imports
- Or rollback and investigate

**Verification checklist:**
- [ ] `npm run test:unit` passes
- [ ] `npm run build` succeeds
- [ ] No console errors about missing modules
- [ ] No TypeScript/JSDoc errors

**Rollback strategy:**
```bash
# Restore deleted files
git restore --staged src/lib/stores/WAAStore.js
git restore src/lib/stores/WAAStore.js
git restore --staged src/lib/stores/WAAStateMachine.js
git restore src/lib/stores/WAAStateMachine.js

# Re-run tests
npm run test:unit
```

---

### Step 9: Verify Store Architecture

**Objective:** Confirm the new Svelte 5 runes-based architecture is complete and functional.

**Commands to run:**
```bash
# List all remaining store files
ls -lh src/lib/stores/

# Should see:
# - gameStore.svelte.js        (Core state using $state)
# - gameActions.svelte.js      (All game logic)
# - transitions.js             (State transition graph - pure function)
# - transitionStore.svelte.js  (Animation state using $state)
# - gameStore.test.js          (Tests for gameStore)
# - gameActions.test.js        (Tests for gameActions)
# - gameFlow.test.js           (Integration tests)
# - transitions.test.js        (Tests for transition validation)
# - cardDrawing.test.js        (Tests for card mechanics)
```

**Verify architecture patterns:**
```bash
# Check that gameStore uses $state
grep -A 5 "let gameState = \$state" src/lib/stores/gameStore.svelte.js

# Check that components import from gameStore.svelte.js
grep -r "from.*gameStore\.svelte\.js" src/lib/components/ | wc -l

# Should be 14 (all components)
```

**Expected results:**
- ✅ Only Svelte 5 runes-based stores remain
- ✅ No Svelte 4 stores (writable, derived) in store files
- ✅ All components use `gameStore.svelte.js` and `gameActions.svelte.js`
- ✅ State transitions validated by pure function (`transitions.js`)

**Verification checklist:**
- [ ] `gameStore.svelte.js` exists and uses `$state`
- [ ] `gameActions.svelte.js` exists and imports from gameStore
- [ ] `transitions.js` exists with pure validation functions
- [ ] `transitionStore.svelte.js` exists for animation state
- [ ] All test files exist and pass
- [ ] No legacy store files remain

**Rollback strategy:**
- N/A - This is read-only verification

---

### Step 10: Check Documentation References

**Objective:** Identify any documentation files that reference the deleted stores.

**Commands to run:**
```bash
# Search documentation for references to WAAStore
grep -r "WAAStore" docs/ --include="*.md"

# Search documentation for references to WAAStateMachine
grep -r "WAAStateMachine" docs/ --include="*.md"
```

**Expected result:**
- Several documentation files will reference the old stores (this is OK)
- These are historical/architectural reviews
- They should be left as-is (they document the migration journey)

**Files that will reference old stores (DO NOT change these):**
- `docs/ARCHITECTURE_REVIEW.md` - Historical review of old architecture
- `docs/SVELTE_5_MIGRATION_PLAN.md` - Original migration plan
- `docs/design-review-recommendations.md` - Original design recommendations
- `docs/game-engine.md` - May reference old architecture

**Note:** These docs serve as a historical record. Leave them unchanged.

**Verification:**
- [ ] Documentation references identified
- [ ] Confirmed these are historical documents
- [ ] No action required

**Rollback strategy:**
- N/A - No changes made

---

### Step 11: Update Project README (Optional)

**Objective:** Update main README if it references the old store architecture.

**File to check:** `/home/founder3/code/dimm-city/dc-solo-rpg/README.md`

**Commands to run:**
```bash
# Check if README mentions WAAStore
grep -i "waastore\|state.*machine" README.md
```

**If matches found:**
- Review the context
- Update if it's describing current architecture
- Leave unchanged if it's historical

**Expected result:**
- README either doesn't mention stores, or mentions the Svelte 5 approach

**Verification:**
- [ ] README checked
- [ ] No misleading information about architecture

**Rollback strategy:**
```bash
# Revert README if changes made
git restore README.md
```

---

## Testing Strategy

### Unit Tests

**Command:**
```bash
npm run test:unit
```

**Tests to verify:**
1. **gameStore.test.js** (Core state management)
   - Initial state values
   - State transitions
   - Derived getters
   - King/Ace tracking
   - Journal entries

2. **gameActions.test.js** (Game mechanics)
   - Game initialization
   - Round management
   - Dice rolling
   - Card drawing
   - Failure checks
   - Success checks
   - Journal recording

3. **gameFlow.test.js** (Integration)
   - Full game lifecycle
   - Configuration loading
   - Complete game flows
   - Restart and exit

4. **transitions.test.js** (Validation)
   - Valid transitions
   - Invalid transitions
   - Emergency exits

**Expected results:**
- ✅ 525+ tests pass
- ✅ No test failures
- ✅ No import errors
- ✅ Coverage remains high

### Integration Tests (Playwright)

**Command:**
```bash
npm run test
```

**Note:** Playwright tests may have pre-existing issues unrelated to this migration. Document any failures and verify they existed before the migration.

**Tests to verify:**
- Game loads correctly
- UI components render
- User interactions work
- State transitions flow correctly

**Expected results:**
- Integration tests pass (or fail with known issues from before migration)
- No NEW failures introduced

### Manual Testing Checklist

After all automated tests pass, manually verify:

- [ ] Open dev server: `npm run dev`
- [ ] Navigate to a game
- [ ] Start a new game
- [ ] Roll for tasks
- [ ] Draw cards
- [ ] Complete a failure check
- [ ] Record a journal entry
- [ ] Continue to next round
- [ ] Complete a success check (if Ace of Hearts drawn)
- [ ] Verify game over scenarios
- [ ] Restart game
- [ ] Exit game
- [ ] Check browser console for errors

---

## Potential Risks & Mitigation

### Risk 1: Hidden Import References

**Risk:** A file we didn't check still imports from WAAStore.js or WAAStateMachine.js

**Likelihood:** Low (we verified extensively)

**Impact:** High (build/runtime errors)

**Mitigation:**
- Steps 1 and 6/7 include explicit grep searches
- Test suite will catch import errors
- Build process will fail if imports are broken

**Recovery:**
- Git rollback is easy (all changes are staged)
- Restore deleted files temporarily
- Find and update the importing file
- Re-delete legacy files

### Risk 2: Test Failures After Deletion

**Risk:** Tests fail after deleting legacy stores

**Likelihood:** Very Low (test file already migrated)

**Impact:** Medium (blocks completion)

**Mitigation:**
- Step 2 establishes baseline (tests pass before changes)
- Step 5 verifies tests after rename
- Step 8 verifies tests after deletion
- Changes are incremental and verified at each step

**Recovery:**
- Rollback using git
- Investigate test failures
- Ensure all imports are updated
- Retry deletion

### Risk 3: Documentation Becomes Outdated

**Risk:** READMEs or guides reference deleted architecture

**Likelihood:** Medium

**Impact:** Low (confusing but not breaking)

**Mitigation:**
- Step 10 identifies doc references
- Historical docs are left unchanged (they're a record)
- Current architecture docs should be updated in Phase 2

**Recovery:**
- Update docs in a follow-up PR
- Add a note in this migration PR about doc updates needed

### Risk 4: Playwright Tests Break

**Risk:** E2E tests fail unexpectedly

**Likelihood:** Very Low

**Impact:** Medium

**Mitigation:**
- No component code is changing
- All components already use new stores
- Playwright tests should be unaffected

**Recovery:**
- Check if failures existed before migration
- If new failures, investigate component behavior
- Rollback if necessary

---

## Acceptance Criteria

Phase 1 is complete when ALL of the following are true:

### Code Changes
- [ ] `src/lib/stores/WAAStore.js` deleted
- [ ] `src/lib/stores/WAAStateMachine.js` deleted
- [ ] `src/lib/stores/WAAStore.test.js` renamed to `gameFlow.test.js`
- [ ] Test file comments updated to reflect new name
- [ ] No files in `src/` import from deleted stores

### Architecture Verification
- [ ] All components use `gameStore.svelte.js` exclusively
- [ ] All components use `gameActions.svelte.js` for actions
- [ ] State validation uses `transitions.js`
- [ ] Animation state uses `transitionStore.svelte.js`
- [ ] No Svelte 4 writable/derived stores remain in state management

### Testing
- [ ] All unit tests pass (`npm run test:unit`)
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors in dev mode (`npm run dev`)
- [ ] Manual smoke testing completed
- [ ] No new Playwright test failures

### Git State
- [ ] All changes committed to feature branch
- [ ] Git history is clean (rename preserved)
- [ ] Commit message clearly describes changes

### Documentation
- [ ] This migration plan followed completely
- [ ] Any issues encountered are documented
- [ ] Success confirmed and noted

---

## Commit Message Template

When committing these changes, use this template:

```
Complete Phase 1: Remove legacy Svelte 4 state management

Summary:
- Delete WAAStore.js and WAAStateMachine.js (619 lines removed)
- Rename WAAStore.test.js → gameFlow.test.js (clarifies purpose)
- All components already using Svelte 5 runes-based stores
- No functional changes - pure cleanup

Deleted:
- src/lib/stores/WAAStore.js (536 lines)
- src/lib/stores/WAAStateMachine.js (83 lines)

Renamed:
- src/lib/stores/WAAStore.test.js → gameFlow.test.js

Architecture after Phase 1:
- gameStore.svelte.js: Core state ($state rune)
- gameActions.svelte.js: Game logic
- transitions.js: State validation (pure functions)
- transitionStore.svelte.js: Animation state ($state rune)

Testing:
- All 525+ unit tests pass
- Build succeeds
- No breaking changes

Refs: docs/phase1-migration-plan.md
```

---

## Post-Migration Checklist

After completing Phase 1 and committing:

- [ ] Run full test suite one final time
- [ ] Push branch to remote
- [ ] Create PR against main branch
- [ ] Request review from team
- [ ] Document any issues or learnings in PR description
- [ ] Merge PR after approval
- [ ] Delete feature branch after merge

---

## Next Steps: Phase 2 Planning

After Phase 1 is complete, the following work remains:

1. **Component Lifecycle Patterns** (ONLY if needed)
   - Review `onMount`/`onDestroy` usage
   - Keep them if they work (Svelte 5 supports them)
   - Consider `$effect()` only for specific reactive cases

2. **Documentation Updates**
   - Update architecture diagrams
   - Update developer guide
   - Update component documentation

3. **Performance Optimization**
   - Review $derived usage
   - Optimize heavy computations
   - Profile state updates

4. **TypeScript/JSDoc**
   - Add comprehensive type annotations
   - Document APIs fully
   - Enable stricter type checking

---

## Appendix A: File Structure Before & After

### Before Phase 1
```
src/lib/stores/
├── gameStore.svelte.js         (Svelte 5 - in use)
├── gameActions.svelte.js       (Svelte 5 - in use)
├── transitions.js              (Pure functions - in use)
├── transitionStore.svelte.js   (Svelte 5 - in use)
├── WAAStore.js                 ⚠️ (Svelte 4 - NOT used)
├── WAAStateMachine.js          ⚠️ (Legacy - NOT used)
├── WAAStore.test.js            ❌ (Confusing name - tests new stores)
├── gameStore.test.js           (Tests Svelte 5 stores)
├── gameActions.test.js         (Tests Svelte 5 actions)
├── transitions.test.js         (Tests transition validation)
└── cardDrawing.test.js         (Tests card mechanics)
```

### After Phase 1
```
src/lib/stores/
├── gameStore.svelte.js         (Svelte 5 - primary state)
├── gameActions.svelte.js       (Svelte 5 - game logic)
├── transitions.js              (Pure functions - validation)
├── transitionStore.svelte.js   (Svelte 5 - animation state)
├── gameStore.test.js           (Tests core state)
├── gameActions.test.js         (Tests game logic)
├── gameFlow.test.js            ✅ (Integration tests - renamed)
├── transitions.test.js         (Tests transition validation)
└── cardDrawing.test.js         (Tests card mechanics)
```

**Lines of Code:**
- Before: ~1,200 lines (with duplication)
- After: ~740 lines (no duplication)
- **Reduction: ~38% less code**

---

## Appendix B: Quick Reference Commands

### Verify Current State
```bash
# Check for WAAStore imports
grep -r "from.*WAAStore" src/ --include="*.svelte" --include="*.js" | grep -v "test.js"

# Check for WAAStateMachine imports
grep -r "from.*WAAStateMachine" src/ --include="*.svelte" --include="*.js"

# List store files
ls -lh src/lib/stores/
```

### Run Tests
```bash
# All unit tests
npm run test:unit

# Specific test file
npm run test:unit -- gameFlow.test.js

# Build project
npm run build

# Development server
npm run dev
```

### Git Operations
```bash
# Check status
git status

# Rename file
git mv src/lib/stores/WAAStore.test.js src/lib/stores/gameFlow.test.js

# Delete file
git rm src/lib/stores/WAAStore.js

# Restore deleted file
git restore --staged src/lib/stores/WAAStore.js
git restore src/lib/stores/WAAStore.js

# Commit changes
git add .
git commit -m "Complete Phase 1: Remove legacy state management"

# Push to remote
git push origin claude/svelte-5-migration-runes-011CUykd8vReQjCXB95tvReo
```

---

## Appendix C: Rollback Procedures

### Full Rollback (All Steps)
```bash
# Unstage all changes
git restore --staged .

# Discard all changes
git restore .

# Verify clean state
git status

# Should show: "nothing to commit, working tree clean"
```

### Selective Rollback (Specific Steps)
```bash
# Rollback Step 3 (rename)
git mv src/lib/stores/gameFlow.test.js src/lib/stores/WAAStore.test.js

# Rollback Step 4 (test updates)
git restore src/lib/stores/WAAStore.test.js

# Rollback Step 6 (WAAStore deletion)
git restore --staged src/lib/stores/WAAStore.js
git restore src/lib/stores/WAAStore.js

# Rollback Step 7 (WAAStateMachine deletion)
git restore --staged src/lib/stores/WAAStateMachine.js
git restore src/lib/stores/WAAStateMachine.js
```

---

## Appendix D: Troubleshooting

### Problem: Tests fail with "Cannot find module"

**Symptom:**
```
Error: Cannot find module '../stores/WAAStore.js'
```

**Cause:** A file still imports from deleted stores

**Solution:**
1. Find the offending file:
   ```bash
   grep -r "from.*WAAStore" src/
   ```
2. Update the import to use `gameStore.svelte.js` and `gameActions.svelte.js`
3. Or rollback and fix before re-attempting deletion

### Problem: Build fails with import errors

**Symptom:**
```
[vite] Could not resolve '../stores/WAAStore.js'
```

**Cause:** Same as above

**Solution:** Same as above

### Problem: Git won't track rename

**Symptom:** `git status` shows delete + add instead of rename

**Cause:** File contents changed too much OR wrong git command used

**Solution:**
```bash
# Undo the manual rename
mv src/lib/stores/gameFlow.test.js src/lib/stores/WAAStore.test.js

# Use git mv instead
git mv src/lib/stores/WAAStore.test.js src/lib/stores/gameFlow.test.js

# Make content changes AFTER the rename
```

### Problem: Tests pass locally but fail in CI

**Symptom:** CI pipeline fails with import errors

**Cause:** Cache issues or missing files in git

**Solution:**
```bash
# Ensure all changes are committed
git status

# Force push to update CI
git push --force-with-lease

# Clear CI cache if available
```

---

**End of Phase 1 Migration Plan**

This plan is ready for implementation. Follow each step carefully, verify at each checkpoint, and rollback if any unexpected issues arise. Good luck! 🚀
