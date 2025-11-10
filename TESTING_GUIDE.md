# Game Flow Testing Guide

## Overview

This document describes the comprehensive test suite created to validate the DC Solo RPG game flow and catch regressions.

## Test Files

### 1. `tests/game-flow-complete.spec.js`

**Purpose:** Validates complete game flow including single rounds and stress testing multiple rounds.

**Tests:**
- **Complete game flow - single round:** Plays through one complete round (roll → draw cards → handle failure checks → journal → next round)
- **Multiple rounds - stress test:** Plays through 3 consecutive rounds to test long-running stability

**Expected behavior:**
- Dice rolls produce 1-6 cards to draw
- Odd cards trigger failure checks with damage calculation
- Even cards don't trigger failure checks
- After all cards drawn, journal screen appears
- After journal save, next round starts automatically

**Current reliability:** 80% pass rate (4/5 runs successful)

### 2. `tests/failure-check-journal.spec.js`

**Purpose:** Specifically tests the transition from failure check to journal screen.

**What it validates:**
- When the last card of a round is odd (triggers failure check), the game should automatically transition to journal after the failure check completes
- Tests both scenarios: failure check on last card vs. failure check on non-last card

### 3. `tests/debug-console.spec.js`

**Purpose:** Helper test for debugging state transitions by capturing console logs.

## Running Tests

```bash
# Run all game flow tests
npm run test tests/game-flow-complete.spec.js

# Run single round test only
npx playwright test "tests/game-flow-complete.spec.js" --grep "Complete game flow - single round"

# Run stress test only
npx playwright test "tests/game-flow-complete.spec.js" --grep "Multiple rounds - stress test"

# Run specific failure check test
npm run test tests/failure-check-journal.spec.js

# Run tests multiple times to check reliability
for i in 1 2 3; do npm run test tests/game-flow-complete.spec.js; done
```

## Known Issues

### Race Condition in confirmTaskRoll (~20% failure rate)

**Symptom:** Occasionally, after rolling for tasks and confirming the roll, the INTERCEPT button doesn't appear within the 10-second timeout.

**Root cause:** The `isTransitioning` flag in the transition system sometimes blocks the `transitionToScreen()` call in `confirmTaskRoll()`, preventing the screen from transitioning to 'drawCard' state.

**Current mitigation:** Added a defensive wait loop (max 1 second) that waits for pending transitions to complete before calling `transitionToScreen()`. This reduces but doesn't eliminate the issue.

**Potential fixes to explore:**
1. Refactor transition system to use a queue instead of a simple flag
2. Add transition timeout/force complete mechanism
3. Investigate if dice animation transitions are not properly completing

## Test Timing Guidelines

Based on empirical testing, these are the recommended wait times:

- **After clicking dice roller (animation):** 2500ms
- **After confirming dice roll:** Wait for element to appear (don't use fixed timeout)
- **After clicking CONTINUE on card:** 1500ms
- **After failure check dice roll:** 4000ms (includes animation + auto-transition)
- **After journal save:** 2000ms (includes async save + transition)

## Validating Changes

When making changes to game logic or state transitions:

1. Run `tests/game-flow-complete.spec.js` at least 3 times
2. All 3 runs should pass (if fewer pass, investigate regression)
3. Check console logs for any new error messages
4. Run `tests/failure-check-journal.spec.js` to specifically test failure check transitions
5. If pass rate drops below 60%, there's likely a new regression

## Test Architecture

### Key Patterns

**Waiting for elements:**
```javascript
await page.waitForSelector('.neural-cta:has-text("INTERCEPT")', { timeout: 10000 });
```

**Checking visibility without throwing:**
```javascript
const isVisible = await page.locator('.element').isVisible().catch(() => false);
```

**Drawing all cards in a round:**
```javascript
for (let i = 0; i < 10; i++) {
    const interceptVisible = await page.locator('.neural-cta:has-text("INTERCEPT")').isVisible().catch(() => false);
    if (!interceptVisible) break;
    // ... draw and confirm card
}
```

### Console Log Markers

The game logs these key events:
- `[rollForTasks]` - Dice rolled for tasks
- `[drawCard]` - Card drawn from deck
- `[confirmCard]` - Card confirmed by player
- `[confirmTaskRoll]` - Task roll confirmed
- `[recordRound]` - Journal entry saved

Use these to debug test failures by adding:
```javascript
page.on('console', msg => {
    if (msg.text().includes('[')) console.log('BROWSER:', msg.text());
});
```

## Future Improvements

1. Add test for success check (Ace of Hearts) mechanics
2. Add test for game over conditions (4 kings or tower collapse)
3. Add test for bonus tracking (Aces increase bonus)
4. Improve test stability to 95%+ pass rate
5. Add visual regression testing with screenshots
6. Add performance benchmarks for transitions
