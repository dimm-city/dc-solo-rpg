# Test Crash Investigation

## Date: 2025-11-19

## Issue
Tests are crashing the session or timing out after MEDIUM RISK $effect fixes were applied.

## Files Modified (7 + 1 new)
1. `src/routes/+layout.svelte` - DiceBox initialization guard (COMPLETED ✅)
2. `src/lib/components/CardDeck.svelte` - TTS auto-read guard (COMPLETED ✅)
3. `src/lib/components/ConfirmModal.svelte` - Portal pattern extraction (COMPLETED ✅)
4. `src/lib/components/DiceThemePicker.svelte` - Portal pattern extraction (COMPLETED ✅)
5. `src/lib/components/settings/SettingsModal.svelte` - Portal pattern extraction (COMPLETED ✅)
6. `src/lib/composables/useStoryGeneration.svelte.js` - Convert $effect to onMount (COMPLETED ✅)
7. `src/lib/composables/useSavedGames.svelte.js` - Convert $effect to onMount (COMPLETED ✅)
8. `src/lib/composables/usePortal.svelte.js` - NEW reusable portal composable (CREATED ✅)

## Potential Issues to Investigate

### CRITICAL: usePortal.svelte.js Infinite Loop Risk
**Status:** INVESTIGATING

The new `usePortal.svelte.js` composable has a $effect that might cause infinite loops:

```javascript
$effect(() => {
    if (contentElement && portalContainer) {
        portalContainer.appendChild(contentElement);

        return () => {
            if (contentElement && portalContainer && portalContainer.contains(contentElement)) {
                portalContainer.removeChild(contentElement);
            }
        };
    }
});
```

**Problem:** The $effect reads `contentElement` reactively. Each component using the portal does:
```javascript
$effect(() => {
    portal.contentElement = contentElement;
});
```

This could create a reactive loop where:
1. Component sets portal.contentElement
2. usePortal $effect triggers
3. DOM manipulation might trigger Svelte reactivity
4. Component $effect re-triggers
5. LOOP!

**Solution:** Add guard pattern or use untrack()

### Issue #2: Portal Components Still Have $effect
**Status:** NEEDS FIX

All three portal components (ConfirmModal, DiceThemePicker, SettingsModal) still have $effect that sets portal.contentElement. This is redundant and could cause issues.

**Better Pattern:** Use reactive assignment ($:) instead of $effect

### Issue #3: Test Environment Compatibility
**Status:** TO CHECK

The portal composable manipulates document.body in onMount. In test environment (jsdom), this might:
- Cause memory leaks if portal containers aren't cleaned up
- Cause timing issues with rapid component mount/unmount
- Trigger errors if document isn't fully initialized

## ROOT CAUSE IDENTIFIED ✅

**Problem:** Portal refactoring created reactive loops

The original pattern:
```javascript
$effect(() => {
    if (isOpen && modalElement && portalTarget) {  // ✅ Checks isOpen!
        portalTarget.appendChild(modalElement);
    }
    return () => { /* cleanup */ };
});
```

My refactored pattern:
```javascript
// Component:
$effect(() => {
    portal.contentElement = modalElement;  // ❌ Always runs when modalElement changes
});

// Portal composable:
$effect(() => {
    if (contentElement && portalContainer) {  // ❌ No isOpen check!
        portalContainer.appendChild(contentElement);
    }
});
```

**Issues:**
1. Lost `isOpen` guard - appendChild called even when modal closed
2. Two layers of $effect creating reactive chain
3. No conditional logic - runs on every reactive change

**Solution:** Revert portal refactoring, keep original simple pattern

## Fix Applied ✅
Reverted files:
- ✅ ConfirmModal.svelte (restored to original working pattern)
- ✅ DiceThemePicker.svelte (restored to original working pattern)
- ✅ SettingsModal.svelte (restored to original working pattern)
- ✅ DELETED usePortal.svelte.js (not needed)

## Actual MEDIUM RISK Fixes Completed
1. ✅ +layout.svelte - DiceBox initialization guard (GOOD)
2. ✅ CardDeck.svelte - TTS auto-read guard (GOOD)
3. ❌ Portal pattern extraction (REVERTED - caused reactive loops)
4. ✅ useStoryGeneration.svelte.js - Convert to onMount (GOOD)
5. ✅ useSavedGames.svelte.js - Convert to onMount (GOOD)

**Net Result:** 4 of 7 MEDIUM RISK issues fixed, 3 portal patterns left as-is (they work fine)

## Testing Results

### Before Fix
- Tests appeared to run but then timeout/crashed session
- All expected error logs appeared normal (IndexedDB warnings, etc.)

### After Fix (Reverted Portal Pattern)
- ✅ Single test file runs successfully (gameStore.test.js - 45 tests passed in 27ms)
- ✅ Full test suite PASSED! **453 passing tests** (11 files)
  - Duration: 11.68s
  - No crashes or timeouts
  - Previous run: 417 passing (increased by 36 tests!)

**ISSUE RESOLVED** ✅

## Key Lessons Learned

1. **Don't over-engineer working patterns**: The original portal $effect pattern was simple and worked. My refactoring added complexity without benefit.

2. **Guard state matters**: The `isOpen` check in the original pattern was crucial - it prevented DOM manipulation when the modal was closed.

3. **Layered $effects are dangerous**: Component $effect → Composable $effect creates chains that can loop.

4. **Test early, test often**: Should have run tests immediately after portal refactoring to catch this faster.

5. **"DRY" isn't always better**: Three components with the same 10-line pattern is better than a buggy abstraction.

## Notes
- Previous test run showed 417 passing tests before MEDIUM RISK fixes
- Tests appear to start running but then timeout/crash
- All expected error logs appear normal (IndexedDB warnings, etc.)
