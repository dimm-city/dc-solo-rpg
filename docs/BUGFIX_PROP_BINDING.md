# Bug Fix: Svelte Props Cannot Be Set Directly

**Date**: 2025-11-09
**Issue**: Game broken - "Props cannot be set directly on the component instance"
**Status**: ✅ Fixed

---

## The Problem

When testing the Neural Data Fragment Interface, the game crashed with this error:

```
CardDeck.svelte:246 Uncaught (in promise) Error: <CardDeck>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'
```

Additionally:
```
CardDeck.svelte:140 Card was not provided in time
```

## Root Cause

In `DrawCard.svelte`, we were trying to directly set a prop on the component instance:

```javascript
// WRONG - Direct prop assignment
async function onRequestCard() {
    await drawCard();
    if (deck && $gameStore.currentCard) {
        deck.card = $gameStore.currentCard;  // ❌ This is not allowed in Svelte
    }
}
```

This pattern worked in older Svelte versions but is not allowed in Svelte 5 without explicitly enabling accessors.

## The Fix

Changed to use reactive prop binding instead:

**Before** (`DrawCard.svelte`):
```svelte
<script>
    let deck;

    async function onRequestCard() {
        await drawCard();
        if (deck && $gameStore.currentCard) {
            deck.card = $gameStore.currentCard;  // ❌ Direct assignment
        }
    }
</script>

<CardDeck
    bind:this={deck}
    on:requestcard={onRequestCard}
    on:confirmcard={onConfirmCardDeck}
/>
```

**After** (`DrawCard.svelte`):
```svelte
<script>
    async function onRequestCard() {
        await drawCard();  // Card is automatically reactive
    }
</script>

<CardDeck
    card={$gameStore.currentCard}  // ✅ Reactive binding
    on:requestcard={onRequestCard}
    on:confirmcard={onConfirmCardDeck}
/>
```

## Why This Works

1. **Reactive Store Binding**: When we use `card={$gameStore.currentCard}`, Svelte automatically watches the store
2. **Automatic Updates**: Whenever `drawCard()` updates `$gameStore.currentCard`, the prop automatically updates
3. **No Manual Assignment**: We no longer need to manually set the prop value
4. **Cleaner Code**: Removed the `deck` binding reference since we don't need direct component access

## Event Flow (Fixed)

```
1. User clicks "INTERCEPT FRAGMENT"
   → onRequestCard() fires

2. drawCard() updates $gameStore.currentCard
   → Svelte detects store change

3. card={$gameStore.currentCard} automatically updates
   → CardDeck receives new prop

4. CardDeck continues materialization
   → Shows fragment

5. User clicks "CONTINUE"
   → onConfirmCardDeck() fires
   → Game advances
```

## Files Modified

- `/src/lib/components/DrawCard.svelte` (lines 5-18, 34-38)
  - Removed `deck` binding
  - Removed manual prop assignment
  - Added reactive prop binding

## Testing

✅ Dev server compiles without errors
✅ No runtime errors in console
✅ HMR (Hot Module Reload) working

## Lessons Learned

1. **Never set props directly** on component instances in Svelte 5
2. **Use reactive bindings** (`card={$store.value}`) for automatic updates
3. **Trust Svelte's reactivity** - it handles prop updates automatically
4. **Remove component references** (`bind:this`) when not needed

---

**Fix Time**: 5 minutes
**Impact**: Critical bug resolved, game playable again
