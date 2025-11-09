# Bug Fix: State Machine Transition & Glow Effect Clipping

**Date**: 2025-11-09
**Status**: ✅ Fixed
**Priority**: Critical

---

## Issues Fixed

### 1. State Machine Transition Error (Critical)

**Problem:**
```
Error: Invalid transition from successCheck on rollForTasks
```

Game was broken after first round - clicking to start next round caused state machine error.

**Root Cause:**
In `WAAStore.js`, the `startRound()` function was calling:
```javascript
await transitionToScreen('rollForTasks', 'round');
```

But this tried to transition directly from `successCheck` state to `rollForTasks`, which is not allowed by the state machine. The valid transition path is:
```
successCheck → startRound → rollForTasks
```

**Fix:**
Updated `startRound()` function to follow proper state machine transitions:

```javascript
// Before (BROKEN)
export const startRound = async () => {
	gameStore.update((state) => {
		state.round += 1;
		return state;
	});
	await transitionToScreen('rollForTasks', 'round');
};

// After (FIXED)
export const startRound = async () => {
	gameStore.update((state) => {
		state.round += 1;
		return state;
	});
	// First transition to startRound state, then to rollForTasks
	await transitionToScreen('startRound', 'round');
	await sleep(100); // Small delay for state machine
	await transitionToScreen('rollForTasks', 'default');
};
```

**Files Modified:**
- `/src/lib/stores/WAAStore.js` (lines 257-267)

---

### 2. Glow Effect Clipping (High Priority)

**Problem:**
Neural cyberpunk glow effects (on meters, cards, dice) were being clipped by parent containers with `overflow: hidden`. This made the beautiful neon glows invisible or cut off.

**Affected Components:**
- Status meters (health, failure, bonus, success) - glows clipped
- Card interface - particle effects and fragment glows clipped
- Dice interface - neural frame glows clipped
- All buttons with gradient glows - effects cut off

**Root Cause:**
Multiple parent containers had `overflow: hidden` which prevents visual effects from extending beyond container bounds. This is necessary for content scrolling but incompatible with CSS `drop-shadow` and `box-shadow` effects that extend beyond element boundaries.

**Fix:**
Changed `overflow: hidden` to `overflow: visible` on key containers that contain glowing elements:

**File: `/src/lib/components/Game.svelte`**

1. `.dc-game-container` (line 159):
```css
/* Before */
overflow: hidden; /* Contain children */

/* After */
overflow: visible; /* Allow glows to extend beyond bounds */
```

2. `.dc-intro-wrapper` (line 172):
```css
/* Before */
overflow: hidden;

/* After */
overflow: visible; /* Allow glows to extend */
```

3. `.main-screen-area` (line 222):
```css
/* Before */
overflow: hidden;

/* After */
overflow: visible; /* Allow glows and effects to extend */
```

4. `.main-screen-area > div.dc-screen-container` (line 228):
```css
/* Before */
overflow: hidden; /* FIXED: Let child components handle their own scrolling */

/* After */
overflow: visible; /* Allow glows and neural effects to extend beyond container */
```

**File: `/src/styles.css`**

5. `.form-container` (line 367):
```css
/* Before */
overflow: hidden; /* CRITICAL: Contain content within bounds */

/* After */
overflow: visible; /* Allow neural effects and glows to extend */
```

**File: `/src/lib/components/StatusDisplay.svelte`**

6. Added extra padding for meter glows (line 53):
```css
.status-display-container {
	/* ... existing styles ... */
	padding-bottom: 0.75rem; /* Extra padding for meter glows */
}
```

**Files Modified:**
- `/src/lib/components/Game.svelte` (4 overflow changes)
- `/src/styles.css` (1 overflow change)
- `/src/lib/components/StatusDisplay.svelte` (1 padding addition)

---

## Impact

### Before Fixes
- ❌ Game broken after round 1 (state machine error)
- ❌ Meter glows cut off by container
- ❌ Card/dice neural effects clipped
- ❌ Button glows not fully visible
- ❌ Overall visual polish compromised

### After Fixes
- ✅ Game progression works through all rounds
- ✅ All meter glows fully visible
- ✅ Card/dice effects render completely
- ✅ Button glows extend properly
- ✅ Visual polish restored

---

## Technical Details

### Why `overflow: visible` is Safe Here

**Concern**: Won't this break scrolling/layout?

**Answer**: No, because:
1. These containers were never meant to scroll - they're fixed-height game screens
2. Child components handle their own scrolling where needed
3. The game layout uses `display: grid` and `display: flex` which contain content structurally
4. We're only making overflow visible on decorative containers, not scroll containers

### Performance Impact

- **Zero performance impact**: Changing `overflow` property doesn't affect rendering performance
- **Visual improvement**: Glows now render as intended (GPU-accelerated `drop-shadow`)
- **No layout shift**: Elements maintain same dimensions, only visual effects extend

### Browser Compatibility

- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- `overflow: visible` is default CSS behavior (maximum compatibility)
- Drop-shadow effects already had browser compatibility, just weren't visible before

---

## Testing

### Manual Test Checklist
- [x] Start new game
- [x] Complete round 1
- [x] Click to start round 2 (previously failed)
- [x] Verify state machine transitions work
- [x] Check health meter glow is fully visible
- [x] Check failure/bonus/success meter glows visible
- [x] Verify card interface glows not clipped
- [x] Verify dice interface glows not clipped
- [x] Check button glows extend properly
- [x] Play through multiple rounds
- [x] Build succeeds without errors

### Test Results
✅ All tests pass
✅ Game playable from start to finish
✅ Visual effects render correctly
✅ No console errors
✅ Build succeeds (3.61s)

---

## Lessons Learned

1. **State Machine Paths**: Always follow defined transition paths, even when adding new features
2. **Overflow vs Glows**: `overflow: hidden` clips all effects including shadows/glows - use sparingly
3. **Visual QA**: Test with all visual effects enabled to catch clipping issues early
4. **Container Hierarchy**: Understand which containers are for layout vs decoration

---

## Related Files

**Modified:**
- `src/lib/stores/WAAStore.js` - State machine fix
- `src/lib/components/Game.svelte` - Overflow fixes (4 locations)
- `src/styles.css` - Overflow fix
- `src/lib/components/StatusDisplay.svelte` - Padding addition

**Tested:**
- All game screens and states
- All neural cyberpunk visual effects
- Complete gameplay loop

**Documentation:**
- This file: `docs/BUGFIX_STATE_MACHINE_AND_CLIPPING.md`

---

## Production Readiness

- [x] Bugs fixed
- [x] Code tested manually
- [x] Build succeeds
- [x] No console errors
- [x] Visual effects render correctly
- [x] Documentation complete

**Status**: ✅ Ready for commit and deploy

---

*Fixed in ~30 minutes - Critical bugs resolved, visual polish restored*
