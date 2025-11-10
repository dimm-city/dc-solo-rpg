# Game Flow Tests

## Overview

This directory contains Playwright end-to-end tests for the DC Solo RPG game flow.

## Test Files

### `game-flow.test.js`

Tests the core game flow, specifically validating that the number of cards drawn matches the dice roll result.

**Test Cases:**

1. **Full Round Flow Test** - Tests multiple rounds of gameplay:
   - Starts the game
   - Rolls for tasks
   - Draws cards (with failure checks as needed)
   - Validates the number of cards drawn matches the journal entries
   - Tests 2 complete rounds

2. **Console Log Validation Test** - Validates card drawing using console logs:
   - Captures console logs for `[rollForTasks]` and `[drawCard]` events
   - Extracts the dice roll value
   - Draws all cards for the round
   - Verifies the number of card draw logs matches the dice roll
   - Validates the `cardsToDrawRemaining` counter decrements correctly

## Running the Tests

### Prerequisites

Make sure you have the dev server running or the build is up to date:

```bash
npm run build
```

### Run All Tests

```bash
npm test
```

### Run Specific Test File

```bash
npx playwright test tests/game-flow.test.js
```

### Run in Headed Mode (See the Browser)

```bash
npx playwright test tests/game-flow.test.js --headed
```

### Run in Debug Mode

```bash
npx playwright test tests/game-flow.test.js --debug
```

### Run with UI Mode (Interactive)

```bash
npx playwright test tests/game-flow.test.js --ui
```

## Test Architecture

The tests use Playwright's API to:

1. **Navigate the game** - Clicks through intro screens and game flow
2. **Monitor console logs** - Captures `[rollForTasks]` and `[drawCard]` debug logs
3. **Interact with UI elements** - Clicks buttons like "ROLL FOR TASKS", "INTERCEPT FRAGMENT", "CONTINUE"
4. **Handle dynamic flow** - Manages failure checks that occur with odd cards
5. **Validate results** - Compares card count with dice roll and journal entries

## Key Features Tested

- ✅ Card drawing count matches dice roll
- ✅ Console logs show correct `cardsToDrawRemaining` decrement
- ✅ Failure checks are triggered for odd cards
- ✅ Health updates occur after dice animation (timing validation)
- ✅ Journal entries reflect all cards drawn in the round

## Debugging Tips

If tests fail:

1. **Run in headed mode** to see what's happening:

   ```bash
   npx playwright test --headed
   ```

2. **Check console output** - The test logs console messages for debugging

3. **Use debug mode** to step through:

   ```bash
   npx playwright test --debug
   ```

4. **Check screenshots** - Playwright automatically takes screenshots on failure (stored in `test-results/`)

## Configuration

Test configuration is in `playwright.config.js` at the project root.

The config specifies:

- Test directory: `tests/`
- Web server command: Builds and previews the app
- Port: 4173
