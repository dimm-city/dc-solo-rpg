# Composables

Reusable Svelte 5 runes-based composables for DC Solo RPG.

## Overview

Composables are functions that encapsulate stateful logic using Svelte 5 runes (`$state`, `$derived`, etc.). They provide a way to share reactive functionality across components without prop drilling or complex inheritance.

## Available Composables

### useResponsiveLayout

Reactive composable for responsive layout detection.

**Features:**

- Desktop/mobile detection via media queries
- Window dimensions tracking
- Breakpoint matching (mobile: <768px, tablet: 768-1024px, desktop: ≥1024px)
- Accessibility: `prefers-reduced-motion` detection

**Usage:**

```javascript
import { useResponsiveLayout } from '$lib/composables/useResponsiveLayout.svelte.js';

const layout = useResponsiveLayout();

// Access reactive state
$: if (layout.isDesktop) {
	console.log('Desktop detected');
}

$: if (layout.matchesBreakpoint('mobile')) {
	console.log('Mobile breakpoint');
}

// Current breakpoint: 'mobile' | 'tablet' | 'desktop'
$: currentBreakpoint = layout.getCurrentBreakpoint();
```

**API:**

```typescript
{
  // Reactive state
  isDesktop: boolean,
  isMobile: boolean,
  windowWidth: number,
  windowHeight: number,
  prefersReducedMotion: boolean,

  // Methods
  matchesBreakpoint(breakpoint: 'mobile' | 'tablet' | 'desktop'): boolean,
  getCurrentBreakpoint(): 'mobile' | 'tablet' | 'desktop',

  // Constants
  BREAKPOINTS: { mobile: 768, tablet: 1024, desktop: 1280 }
}
```

---

### useAutoPlay

Reactive composable for auto-play functionality with cancellable delays and TTS integration.

**Features:**

- Auto-advance after TTS and delay
- Auto-roll dice after delay
- Cancellable operations
- Active state tracking

**Usage:**

```javascript
import { useAutoPlay } from '$lib/composables/useAutoPlay.svelte.js';

const autoPlay = useAutoPlay();

// Auto-advance after speaking and delay
const { cancel } = autoPlay.advance({
	text: 'Draw a card',
	shouldRead: true,
	action: () => drawCard(),
	customDelay: 2000 // Optional override
});

// Auto-roll dice
const { cancel } = autoPlay.roll(() => handleRoll());

// Cancel specific action
cancel();

// Cancel all auto-play
autoPlay.cancelAll();

// Check if auto-play is active
$: if (autoPlay.isActive) {
	console.log(`${autoPlay.activeCount} auto-play actions running`);
}
```

**API:**

```typescript
{
  // Actions
  advance(options: {
    text?: string,
    shouldRead?: boolean,
    action: Function,
    customDelay?: number
  }): { cancel: Function },

  roll(rollAction: Function): { cancel: Function },
  cancelAll(): void,

  // State
  isActive: boolean,
  activeCount: number,

  // Helpers
  isEnabled(): boolean,
  getCountdownText(remaining: number): string
}
```

**Backward Compatibility:**

The composable also exports standalone functions for backward compatibility with existing code:

```javascript
import { autoAdvance, autoRoll, isAutoPlayEnabled } from '$lib/composables/useAutoPlay.svelte.js';

// Legacy usage (still works)
const { cancel } = autoAdvance({ text: 'Hello', action: () => {} });
const { cancel } = autoRoll(() => roll());
const enabled = isAutoPlayEnabled();
```

**Migration Guide:**

To migrate from `utils/autoPlay.js` to the composable:

```javascript
// Before (utils/autoPlay.js)
import { autoAdvance, autoRoll } from '$lib/utils/autoPlay.js';

const canceller1 = autoAdvance({ ... });
const canceller2 = autoRoll(() => {});

// After (composable)
import { useAutoPlay } from '$lib/composables/useAutoPlay.svelte.js';

const autoPlay = useAutoPlay();
const canceller1 = autoPlay.advance({ ... });
const canceller2 = autoPlay.roll(() => {});

// Or use cancelAll to cancel everything at once
autoPlay.cancelAll();
```

---

### useKeyboardShortcuts

Reactive composable for keyboard shortcut handling.

**Features:**

- Common shortcuts: Space, Enter, Escape, Arrow keys
- Automatic input/textarea detection (ignores shortcuts when typing)
- Configurable preventDefault
- Specialized helpers for game screens and modals

**Usage:**

```javascript
import { useKeyboardShortcuts } from '$lib/composables/useKeyboardShortcuts.svelte.js';

const keyboard = useKeyboardShortcuts({
	onSpace: () => drawCard(),
	onEnter: () => drawCard(),
	onEscape: () => closeModal(),
	onArrowLeft: () => previousRound(),
	onArrowRight: () => nextRound(),
	disabled: () => isModalOpen, // Function that returns true when disabled
	preventDefault: true // Default: true
});

onMount(() => {
	keyboard.enable();
	return () => keyboard.disable();
});

// Check state
$: if (keyboard.isEnabled) {
	console.log(`Last key pressed: ${keyboard.lastKey}`);
}
```

**Specialized Helpers:**

```javascript
// For game screens (Space/Enter = primary action)
import { useGameScreenShortcuts } from '$lib/composables/useKeyboardShortcuts.svelte.js';

const shortcuts = useGameScreenShortcuts({
	onPrimaryAction: () => {
		// Find and click primary button
		const btn = document.querySelector('[data-primary]');
		btn?.click();
	},
	disabled: () => showModal
});

shortcuts.enable();
```

```javascript
// For modals (Escape = close)
import { useModalShortcuts } from '$lib/composables/useKeyboardShortcuts.svelte.js';

const shortcuts = useModalShortcuts({
	onClose: () => {
		isOpen = false;
	}
});

shortcuts.enable();
```

**API:**

```typescript
{
  // Actions
  enable(): void,
  disable(): void,
  simulateKeyPress(key: string): void,  // For testing

  // State
  isEnabled: boolean,
  lastKey: string | null,
  lastKeyTimestamp: number
}
```

---

### Screen Composables

Screen-specific composables that manage state and logic for each game screen.

**Location:** `src/lib/composables/screen/`

**Available Composables:**

- `useRollForTasks()` - Roll for Tasks screen logic
- `useFailureCheck()` - Failure Check screen logic
- `useSuccessCheck()` - Success Check (Salvation) screen logic
- `useInitialDamage()` - Initial Damage Roll screen logic
- `useFinalDamage()` - Final Damage Roll screen logic

**Features:**

- Screen-specific state management (rolling, confirming, results)
- Integration with dice rolling and 3D animations
- Auto-play trigger support
- Button state management (text, disabled)
- State reset on screen transitions

**Usage Example (useRollForTasks):**

```javascript
import { useRollForTasks } from '$lib/composables/screen/useRollForTasks.svelte.js';

const rollTasks = useRollForTasks();

// Handle roll/confirm action
async function onButtonClick() {
	await rollTasks.handleRollForTasks(triggerAutoPlay);
}

// Access state
$: buttonText = rollTasks.rollTasksRolled ? 'CONFIRM' : 'ROLL';
$: isDisabled = rollTasks.rollTasksRolling || rollTasks.rollTasksConfirming;

// Reset on screen change
$effect(() => {
	if (currentScreen === 'rollForTasks') {
		rollTasks.resetState();
	}
});
```

**Common Pattern:**
Each screen composable exports:

- State variables (e.g., `rolled`, `rolling`, `confirming`)
- Handler function (e.g., `handleRollForTasks()`)
- Reset function (e.g., `resetState()`)
- Derived values for UI (button text, disabled state)

---

## Best Practices

### 1. Use Composables in Components, Not Other Composables

Composables should be called from components, not from other composables. This prevents deep nesting and keeps the dependency graph simple.

```javascript
// ❌ Don't do this
export function useComplexFeature() {
  const layout = useResponsiveLayout();  // Composable calling composable
  const keyboard = useKeyboardShortcuts({ ... });
  // ...
}

// ✅ Do this instead
// Component.svelte
const layout = useResponsiveLayout();
const keyboard = useKeyboardShortcuts({ ... });
const feature = useComplexFeature(layout, keyboard);  // Pass as params
```

### 2. Always Clean Up Event Listeners

Use `onMount` and return a cleanup function:

```javascript
onMount(() => {
	keyboard.enable();
	return () => keyboard.disable();
});
```

### 3. Use $effect for Reactive Cleanup

When state changes trigger cleanup needs:

```javascript
$effect(() => {
	if (currentScreen === 'newScreen') {
		autoPlay.cancelAll(); // Cancel when screen changes
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
 * @returns {Object} Layout state
 * @returns {boolean} returns.isDesktop - True if desktop
 * @returns {boolean} returns.isMobile - True if mobile
 */
export function useResponsiveLayout() {
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

## Migration from utils/autoPlay.js

The `utils/autoPlay.js` file has been replaced by `composables/useAutoPlay.svelte.js`. The new composable provides:

1. **Backward compatibility**: All original functions are still exported
2. **Enhanced functionality**: Reactive state tracking, cancelAll(), active count
3. **Better organization**: Uses Svelte 5 runes for reactive state

**Migration is optional**. Existing code using `utils/autoPlay.js` will continue to work by importing from the composable instead:

```javascript
// Change this:
import { autoAdvance } from '$lib/utils/autoPlay.js';

// To this:
import { autoAdvance } from '$lib/composables/useAutoPlay.svelte.js';
```

For new code, prefer using the composable:

```javascript
import { useAutoPlay } from '$lib/composables/useAutoPlay.svelte.js';
const autoPlay = useAutoPlay();
```

---

## Phase 2 Roadmap

The following enhancements are planned for Phase 2:

1. **useScreenController expansions**:
   - Extract `useRollForTasks.svelte.js` to separate file (150-180 lines)
   - Extract `useFailureCheck.svelte.js` to separate file (120-150 lines)
   - Extract `useSuccessCheck.svelte.js` to separate file (120-150 lines)
   - Extract `useInitialDamage.svelte.js` to separate file (80-100 lines)
   - Extract `useFinalDamage.svelte.js` to separate file (80-100 lines)

2. **CardDeck composables**:
   - `useCardAnimationState.svelte.js` (200-250 lines)

3. **JournalEntry composables**:
   - `useAudioRecording.svelte.js` (150-200 lines)

4. **StoryMode composables**:
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
- [Refactoring Status](../../../docs/refactoring/STATUS.md) - Refactoring progress
