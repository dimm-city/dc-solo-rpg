# Composables

Reusable Svelte 5 runes-based composables for DC Solo RPG.

## Overview

Composables are functions that encapsulate stateful logic using Svelte 5 runes (`$state`, `$derived`, etc.). They provide a way to share reactive functionality across components without prop drilling or complex inheritance.

## Available Composables

### Screen Composables

Screen-specific composables that manage state and logic for each game screen.

**Location:** `src/lib/composables/screen/`

**Available Composables:**

- `useRollForTasks()` - Roll for Tasks ("Round N"): the roll, then the cards are dealt on their own
- `useFailureCheck()` - Stability check screen logic
- `useSuccessCheck()` - Salvation screen logic (at four Aces: no target, a Stability check)
- `useInitialDamage()` - The opening instability roll
- `createResultHold()` (`resultHold.svelte.js`) - the beat a result stays up before the game moves
  on by itself (`ANIMATION_DURATION.RESULT_HOLD`, 2s); pausable, drawn as a line on the button

**Features:**

- Every roll goes through `gameState.rollWithModifiers()`, so Lucid/Surreal applies to every roll
- Integration with dice rolling and 3D animations; "Rolling…" while the dice roll, and a press
  then skips to the result
- A result line that holds for 2s, then the game moves on by itself (a press moves on at once).
  Results that end the game (the fatal roll, the last token) wait for the player.
- Auto-play trigger support
- Button state (`buttonText`, plus `buttonHint`: the modifier, on roll buttons only)
- State reset on screen transitions

GameScreen owns one instance of each and mounts a single `StepAction` button for every step,
driven by the current screen's composable.

**Usage Example (useRollForTasks):**

```javascript
import { useRollForTasks } from '$lib/composables/screen/useRollForTasks.svelte.js';

const rollTasks = useRollForTasks();

// Roll; a second press during the roll skips it; once rolled, the deal waits the result hold
// (rollTasks.hold), and a press deals at once
async function onButtonClick() {
	await rollTasks.handleRollForTasks(triggerAutoPlay);
}

// Access state: rollTasks.buttonText, rollTasks.buttonHint, rollTasks.resultLine, rollTasks.rolling

// Reset when the screen is entered (also cancels a pending deal)
rollTasks.resetState();
```

**Common Pattern:**
Each screen composable exports:

- State getters (e.g., `rolled`, `rolling`, `result`, `resultLine`)
- Handler function (e.g., `handleRollForTasks()`)
- Reset function (`resetState()`)
- Derived values for the button (`buttonText`, `buttonHint`)
- `hold`: the result hold (`active`, `paused`, `duration`, `id`; GameScreen pauses it under dialogs)

---

## Best Practices

### 1. Use Composables in Components, Not Other Composables

Composables should be called from components, not from other composables. This prevents deep nesting and keeps the dependency graph simple.

```javascript
// ❌ Don't do this
export function useComplexFeature() {
	const rolls = useRollForTasks(); // Composable calling composable
	const checks = useFailureCheck();
	// ...
}

// ✅ Do this instead
// Component.svelte
const rolls = useRollForTasks();
const checks = useFailureCheck();
const feature = useComplexFeature(rolls, checks); // Pass as params
```

### 2. Always Clean Up Event Listeners

Use `onMount` and return a cleanup function:

```javascript
onMount(() => {
	window.addEventListener('keydown', onKeydown);
	return () => window.removeEventListener('keydown', onKeydown);
});
```

### 3. Use $effect for Reactive Cleanup

When state changes trigger cleanup needs:

```javascript
$effect(() => {
	if (currentScreen === 'newScreen') {
		cancelPending(); // Cancel when screen changes
	}
});
```

### 4. Export Composables as Named Exports

Always use named exports for composables:

```javascript
// ✅ Named export
export function useMyComposable() { ... }

// ❌ Default export
export default function useMyComposable() { ... }
```

### 5. Document Return Values

Use JSDoc to document the return type:

```javascript
/**
 * @returns {Object} Roll state
 * @returns {boolean} returns.rolled - True once the roll is done
 * @returns {boolean} returns.rolling - True while the dice are rolling
 */
export function useRollForTasks() {
	// ...
}
```

---

## Testing Composables

### Unit Testing

Composables can be tested using Vitest with a Svelte component wrapper:

```javascript
import { describe, it, expect } from 'vitest';
import { mount } from '@testing-library/svelte';

// Create a test wrapper component
const TestWrapper = `
<script>
  import { useMyComposable } from './useMyComposable.svelte.js';
  export let onMount = () => {};

  const composable = useMyComposable();
  onMount(composable);
</script>
`;

describe('useMyComposable', () => {
	it('should initialize with default state', () => {
		let capturedComposable;

		mount(TestWrapper, {
			props: {
				onMount: (composable) => {
					capturedComposable = composable;
				}
			}
		});

		expect(capturedComposable.someState).toBe(expectedValue);
	});
});
```

---

## Phase 2 Roadmap

The following enhancements are planned for Phase 2:

1. **useScreenController expansions**:
   - Extract `useRollForTasks.svelte.js` to separate file (150-180 lines)
   - Extract `useFailureCheck.svelte.js` to separate file (120-150 lines)
   - Extract `useSuccessCheck.svelte.js` to separate file (120-150 lines)
   - Extract `useInitialDamage.svelte.js` to separate file (80-100 lines)

2. **JournalEntry composables**:
   - `useAudioRecording.svelte.js` (150-200 lines)

3. **StoryMode composables**:
   - `useStoryNavigation.svelte.js` (100-120 lines)
   - `useEnrichedRounds.svelte.js` (150-200 lines)

---

## Contributing

When creating new composables:

1. **Naming**: Use `use*` prefix (e.g., `useMyFeature`)
2. **File location**: `src/lib/composables/useMyFeature.svelte.js`
3. **Documentation**: Include JSDoc comments with examples
4. **Testing**: Add unit tests in `useMyFeature.test.js`
5. **Update this README**: Add your composable to the "Available Composables" section

---

## Resources

- [Svelte 5 Runes Documentation](https://svelte-5-preview.vercel.app/docs/runes)
- [CLAUDE.md](../../../CLAUDE.md) - Project instructions
