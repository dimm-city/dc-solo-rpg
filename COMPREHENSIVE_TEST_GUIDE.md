# Comprehensive End-to-End Test Guide

This document describes the comprehensive validation test created in `tests/comprehensive-validation.spec.js`.

## Overview

This test plays through a complete game from start to finish and validates **every aspect** of the game logic, including:

- ✅ Math calculations (damage, bonuses, token removal)
- ✅ Screen sequences and state transitions
- ✅ Win conditions (all 10 tokens removed, tower > 0)
- ✅ Loss conditions (tower <= 0 OR 4 kings revealed)
- ✅ Card mechanics (odd/even, aces, kings)
- ✅ Journal entries
- ✅ Success checks
- ✅ Game state consistency

## Running the Test

```bash
# Standard run
npm run test

# Run specific test
npx playwright test tests/comprehensive-validation.spec.js

# With UI mode (see what's happening)
npx playwright test tests/comprehensive-validation.spec.js --ui

# Debug mode
npx playwright test tests/comprehensive-validation.spec.js --debug

# Headed mode (see browser)
npx playwright test tests/comprehensive-validation.spec.js --headed
```

## What the Test Validates

### 1. Game Setup (Phase 1)

✅ **Home Page**
- Game selector loads
- Game list displays
- Can select game

✅ **Options Screen**
- Options screen appears
- Can configure difficulty
- Start button works

✅ **Intro Screen**
- Game title and rules display
- Start button transitions to gameplay

✅ **Screenshots:** `test-01-home.png`, `test-02-options.png`, `test-03-intro.png`

---

### 2. Gameplay Loop (Phase 2)

#### Roll for Tasks

✅ **Dice Rolling**
- Dice roller appears
- Rolls 1-6 randomly
- Number determines cards to draw
- State updates correctly

✅ **Screenshot:** `test-04-start-round-{N}.png`

#### Drawing Cards

✅ **Card Drawing**
- Card deck appears
- Can click to draw
- Card info displays
- Tracks odd vs even cards

✅ **Odd Cards (Failure Check)**
- Automatically triggers failure check
- Dice roller appears
- Rolls 1-6
- **Math validation:**
  ```
  Damage = Max(Roll - Bonus, 0)
  New Tower = Old Tower - Damage
  ```
- **Example:**
  ```
  Tower: 54, Roll: 5, Bonus: 2
  Damage = Max(5 - 2, 0) = 3
  New Tower = 54 - 3 = 51 ✅
  ```

✅ **Even Cards**
- No failure check
- Continues to next card

✅ **Screenshot:** `test-05-round-{N}-draw.png`

#### Damage Tracking

The test tracks **every** damage event and validates the math:

```javascript
{
  round: 1,
  card: 3,
  roll: 5,
  bonus: 2,
  damage: 3,              // Calculated: Max(5 - 2, 0)
  towerBefore: 54,
  towerAfter: 51          // Verified: 54 - 3 = 51
}
```

#### Journal Entry

✅ **Journal Recording**
- Textarea appears after round
- Can enter text
- State tracks:
  - Round number
  - Tower health
  - Tokens remaining
- Save button works

✅ **Screenshot:** `test-06-round-{N}-journal.png`

#### Success Check (Ace of Hearts)

✅ **Success Check Mechanics**
- Triggers when Ace of Hearts drawn
- Dice roller appears
- Rolls 1-6
- **Token removal logic:**
  ```
  Remove token if:
    Roll === 6 OR (Roll + Bonus === 6)
  ```
- **Example:**
  ```
  Tokens: 10, Roll: 4, Bonus: 2
  4 + 2 = 6 → Remove token ✅
  New Tokens: 9
  ```

✅ **Screenshot:** `test-07-round-{N}-success.png`

#### Game Over - Win Condition

✅ **Win Condition Check**
- All 10 tokens removed
- Tower > 0
- "VICTORY" message displays
- Can see final stats

✅ **Screenshot:** `test-victory-final.png`

#### Game Over - Loss Conditions

✅ **Tower Collapse**
- Tower <= 0
- "Tower has fallen" message

✅ **4 Kings Revealed**
- Track each king drawn
- Game over when 4th king appears
- "4 Kings revealed" message

✅ **Screenshot:** `test-gameover-round-{N}.png`

---

### 3. Verification (Phase 3)

#### Screen Sequence Validation

```
Expected flow:
1. HomePage
2. OptionsScreen
3. IntroScreen
4. RollForTasks
5. DrawCard
6. [FailureCheck if odd card]
7. JournalEntry
8. [SuccessCheck if Ace♥]
9. RollForTasks (next round) OR GameOver
```

Test verifies:
- ✅ All screens appear
- ✅ Screens appear in correct order
- ✅ No screens skipped
- ✅ Game reaches GameOver

#### Math Verification

For every damage event, test validates:

```javascript
✅ Roll value (1-6)
✅ Bonus applied correctly
✅ Damage = Max(Roll - Bonus, 0)
✅ Tower health decremented correctly
✅ No negative damage
✅ Tower can't go below 0
```

**Example Console Output:**
```
🧮 DAMAGE CALCULATIONS (8 events):
  1. R1 Card1: Roll 3 - Bonus 0 = 3 damage → Tower 54→51 ✅
  2. R1 Card4: Roll 5 - Bonus 0 = 5 damage → Tower 51→46 ✅
  3. R2 Card2: Roll 4 - Bonus 1 = 3 damage → Tower 46→43 ✅
  ...
✅ All damage calculations correct
```

#### Journal Entry Verification

```
📖 JOURNAL ENTRIES (5 entries):
  Round 1: Tower 46, Tokens 10
  Round 2: Tower 43, Tokens 9
  Round 3: Tower 38, Tokens 8
  ...
✅ Journal entries recorded
```

#### Game Statistics

```
🎮 GAME COMPLETION:
  Rounds played: 8
  Cards drawn: 34
  Damage events: 12
  Game reached end: Yes
✅ Game reached completion
```

---

## Test Output Example

```
================================================================================
🎮 COMPREHENSIVE GAME TEST - FULL VALIDATION
================================================================================

PHASE 1: GAME SETUP
--------------------------------------------------------------------------------
📍 Screen 1: HomePage
✓ Home page loaded
✓ Selected "Future Lost" game
📍 Screen 2: OptionsScreen
✓ Options screen loaded
📍 Screen 3: IntroScreen
✓ Intro screen loaded
📍 Screen 4: RollForTasks
✓ Round 1 started

PHASE 2: GAMEPLAY
--------------------------------------------------------------------------------

================================================================================
ROUND 1
================================================================================
📊 Game State: Tower: 54/54, Tokens: 10/10, Round: 1

🎲 ROLL FOR TASKS
  Rolled: 4 - will draw 4 cards

🃏 ROUND 1 - Drawing Cards
  → Card 1: Seven of Diamonds
    ⚠️  ODD CARD - Failure check triggered
    🎲 Failure roll: 3
    💥 Damage: 3 - 0 bonus = 3
    🏗️  Tower: 54 → 51
    ✓ UI shows tower: 51
    ✅ Math verified: 51 = 51

  → Card 2: Four of Clubs
    ✓ Even card - no failure check

  → Card 3: Nine of Spades
    ⚠️  ODD CARD - Failure check triggered
    🎲 Failure roll: 5
    💥 Damage: 5 - 0 bonus = 5
    🏗️  Tower: 51 → 46
    ✅ Math verified: 46 = 46

  → Card 4: Two of Hearts
    ✓ Even card - no failure check

  ✓ Round complete - drew 4 cards

📝 JOURNAL - Round 1
  ✓ Journal entry: "Round 1 complete. Tower: 46/54, Tokens: 10/10, Kings: 0/4"

[... more rounds ...]

================================================================================
🎯 GAME OVER DETECTED
================================================================================
✅ RESULT: VICTORY!
   Final state: Tokens: 0/10, Tower: 23/54

PHASE 3: TEST VERIFICATION
================================================================================

📋 SCREEN SEQUENCE (28 screens):
   1. HomePage
   2. OptionsScreen
   3. IntroScreen
   4. RollForTasks
   5. DrawCard
   6. FailureCheck
   ...
  28. GameOver
✅ Screen sequence valid

🧮 DAMAGE CALCULATIONS (12 events):
  1. R1 Card1: Roll 3 - Bonus 0 = 3 damage → Tower 54→51 ✅
  2. R1 Card3: Roll 5 - Bonus 0 = 5 damage → Tower 51→46 ✅
  ...
✅ All damage calculations correct

📖 JOURNAL ENTRIES (8 entries):
  Round 1: Tower 46, Tokens 10
  Round 2: Tower 43, Tokens 9
  ...
✅ Journal entries recorded

🎮 GAME COMPLETION:
  Rounds played: 8
  Cards drawn: 34
  Damage events: 12
  Game reached end: Yes
✅ Game reached completion

================================================================================
🎉 COMPREHENSIVE TEST COMPLETE
================================================================================
```

---

## Screenshots Captured

The test captures screenshots at every major game phase:

### Setup Phase
- `test-01-home.png` - Home page with game selector
- `test-02-options.png` - Options configuration screen
- `test-03-intro.png` - Intro screen with rules

### Each Round
- `test-04-start-round-{N}.png` - Roll for tasks screen
- `test-05-round-{N}-draw.png` - Drawing cards screen
- `test-06-round-{N}-journal.png` - Journal entry screen
- `test-07-round-{N}-success.png` - Success check (if Ace♥)

### Game Over
- `test-gameover-round-{N}.png` - Loss condition
- `test-victory-final.png` - Win condition
- `test-final.png` - Final screenshot

---

## What Gets Validated

### ✅ Correct Math
- Damage calculation: `Max(Roll - Bonus, 0)`
- Tower health decrement
- Token removal on success check
- Bonus from aces applied

### ✅ Game Logic
- Odd cards → Failure check
- Even cards → Continue
- Aces → +1 bonus
- Kings → Track count (4 = loss)
- Ace of Hearts → Enable success checks

### ✅ Win Conditions
- All 10 tokens removed
- Tower > 0
- Victory screen shows

### ✅ Loss Conditions
- Tower <= 0 OR
- 4 Kings revealed
- Loss screen shows appropriate message

### ✅ State Transitions
- All screens appear in correct order
- No skipped screens
- Invalid transitions caught
- Smooth animations complete

### ✅ UI Consistency
- Stats display updates
- Cards display correctly
- Dice animations work
- Journal saves

---

## Error Detection

The test will **FAIL** if:

❌ Math is wrong (damage calculation)
❌ Tower goes negative
❌ Tokens miscounted
❌ Win/loss condition incorrect
❌ Screen sequence wrong
❌ Game doesn't reach completion
❌ UI elements missing
❌ State transitions invalid

---

## Smoke Test

Quick validation test (`SMOKE TEST: Game starts and first round works`):

✅ Home page loads
✅ Can select game
✅ Options screen appears
✅ Intro screen appears
✅ Can start round
✅ Dice roller works
✅ Card deck appears

---

## Running Locally

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Run test (in another terminal):**
   ```bash
   npx playwright test tests/comprehensive-validation.spec.js --headed
   ```

3. **View screenshots:**
   ```bash
   ls screenshots/
   ```

4. **See detailed output:**
   - Console shows all game events
   - Math calculations validated
   - Screen sequence tracked
   - Final statistics displayed

---

## Expected Result

When you run this test, you should see:

✅ All screens load in correct order
✅ All math calculations are correct
✅ Game plays through multiple rounds
✅ Game reaches win or loss condition
✅ All screenshots captured
✅ Test passes with green checkmarks

If the test fails, it will show:
- Which math calculation was wrong
- Which screen didn't appear
- Which validation failed
- Stack trace for debugging

---

## Next Steps

After running the test successfully:

1. ✅ Verify screenshots look correct
2. ✅ Check console output for any warnings
3. ✅ Validate math calculations in output
4. ✅ Confirm win/loss conditions work
5. ✅ Test passes = Game logic is verified!

---

**This test is your proof that the Svelte 5 migration maintains perfect game logic!** 🎉
