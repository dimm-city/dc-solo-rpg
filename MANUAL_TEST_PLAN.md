# DC Solo RPG - Comprehensive Manual Test Plan

**Application URL:** http://localhost:5173/
**Test Date:** 2025-11-19
**Version:** 0.2.0
**Test Type:** Manual End-to-End Testing

---

## Table of Contents

1. [Application Overview](#application-overview)
2. [Pre-Test Setup](#pre-test-setup)
3. [Test Scenarios](#test-scenarios)
4. [Test Results Template](#test-results-template)

---

## Application Overview

DC Solo RPG is a narrative-driven solo role-playing game built on the Wretched and Alone system. The application features:

- **Game Mechanics**: D20 dice system with Stability (20 points), Tokens (10 starting), and card-based narrative
- **Game States**: Splash screen, instructions, game selection, gameplay, and game over
- **Core Features**: Save/resume games, custom game upload, story library, settings (dice theme)
- **Technology**: SvelteKit with Svelte 5 runes, 3D dice (@3d-dice/dice-box-threejs), IndexedDB storage

---

## Pre-Test Setup

### Environment Check

- [ ] Node.js version >= 20.0.0 installed
- [ ] Development server running at http://localhost:5173/
- [ ] Browser console open (F12) to check for JavaScript errors
- [ ] Browser: Chrome/Firefox/Safari (latest version)
- [ ] Clear browser storage (IndexedDB, localStorage, sessionStorage) for fresh start

### Test Data Required

- [ ] At least one .game.md file ready for custom game upload (use `/home/user/dc-solo-rpg/static/games/future-lost.game.md` as example)
- [ ] Test player name ready (e.g., "TestPlayer")

---

## Test Scenarios

### Section 1: Initial Load and Splash Screen

#### Test 1.1: Application Loads Successfully

**Priority:** Critical
**Precondition:** Fresh browser session (clear sessionStorage)

**Steps:**
1. Open browser and navigate to http://localhost:5173/
2. Wait for page to fully load (check network tab)
3. Observe the splash screen animation

**Expected Results:**
- [ ] Page loads without errors (check console)
- [ ] Neural background animation appears (animated dots/particles)
- [ ] Splash screen displays with "Dream Console" branding
- [ ] D20 logo visible and animated (floating effect)
- [ ] Splash screen auto-advances after ~5 seconds OR has a skip button
- [ ] No JavaScript console errors

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Console Errors (if any):


```

---

#### Test 1.2: Splash Screen Skip Behavior

**Priority:** High
**Precondition:** Fresh browser session

**Steps:**
1. Navigate to http://localhost:5173/
2. If skip button is present, click it during splash animation
3. If auto-advance, wait for completion
4. Observe next screen

**Expected Results:**
- [ ] Splash screen transitions to Instructions Choice screen (if first visit)
- [ ] Fade-out animation is smooth (600ms)
- [ ] SessionStorage stores "splashShown" = true
- [ ] Next screen appears after transition completes

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


```

---

### Section 2: Instructions Choice Screen

#### Test 2.1: Instructions Choice Screen Display

**Priority:** High
**Precondition:** First visit (instructions not seen)

**Steps:**
1. Complete splash screen
2. Observe Instructions Choice screen

**Expected Results:**
- [ ] Title "How To Play" displays
- [ ] Subtitle explaining options displays
- [ ] Three choice cards visible:
  - "Learn How to Play" (recommended for first-time)
  - "Skip Once" (show again next time)
  - "Skip Always" (never show again)
- [ ] Each card has icon, title, description, and recommendation text
- [ ] Cards have hover effects (glow, transform)

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


```

---

#### Test 2.2: "Learn How to Play" Navigation

**Priority:** Medium
**Precondition:** Instructions Choice screen displayed

**Steps:**
1. Click "Learn How to Play" card
2. Observe navigation

**Expected Results:**
- [ ] Browser navigates to /how-to route
- [ ] Instructions/help page displays
- [ ] Session storage marks instructions as shown

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


```

---

#### Test 2.3: "Skip Once" Behavior

**Priority:** High
**Precondition:** Instructions Choice screen displayed

**Steps:**
1. Click "Skip Once" card
2. Observe transition to game selection
3. Refresh browser
4. Observe splash/instructions behavior

**Expected Results:**
- [ ] Transitions to game selection screen (300ms fade)
- [ ] SessionStorage marks instructions shown for this session
- [ ] After refresh: Splash skipped, instructions NOT shown (session persists)
- [ ] After closing browser and reopening: Instructions Choice appears again

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


```

---

#### Test 2.4: "Skip Always" Behavior

**Priority:** High
**Precondition:** Instructions Choice screen displayed

**Steps:**
1. Click "Skip Always" card
2. Observe transition to game selection
3. Refresh browser
4. Close browser and reopen
5. Navigate to application

**Expected Results:**
- [ ] Transitions to game selection screen
- [ ] LocalStorage stores permanent skip preference
- [ ] After refresh: Goes directly to game selection (skips splash and instructions)
- [ ] After browser restart: Still skips instructions permanently

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


```

---

### Section 3: Game Selection Screen

#### Test 3.1: Game Selection Screen Display

**Priority:** Critical
**Precondition:** Instructions skipped or completed

**Steps:**
1. Arrive at game selection screen
2. Observe layout and elements

**Expected Results:**
- [ ] Page header visible with:
  - D20 logo (animated floating)
  - "Dream Console" text
  - Upload button (desktop) or hamburger menu (mobile)
  - About, Help buttons (desktop)
- [ ] Game cards grid displays available games:
  - Future Lost
  - Ghost in the Machine
  - (Any custom games if previously uploaded)
- [ ] Each game card shows:
  - Title with augmented-ui styling
  - Subtitle/description
  - Action button (Start or Resume)
- [ ] Cards have gradient borders (rotating cyan/magenta/yellow)
- [ ] Cards have floating animation (staggered)
- [ ] Neural background visible behind cards

**Expected Game Cards:**
```
- Future Lost: "Navigate a post-apocalyptic wasteland"
- Ghost in the Machine: [Check actual subtitle]
```

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Number of games visible:
Game titles:


```

---

#### Test 3.2: Game Card Hover Effects

**Priority:** Low
**Precondition:** Game selection screen displayed

**Steps:**
1. Hover mouse over each game card
2. Move mouse away
3. Observe visual effects

**Expected Results:**
- [ ] Card transforms up slightly (translateY)
- [ ] Border glow intensifies
- [ ] Box shadow increases
- [ ] Background gradient brightens
- [ ] Transition is smooth (0.35s cubic-bezier)
- [ ] Effect reverses when mouse leaves

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


```

---

#### Test 3.3: Header Navigation - About Modal

**Priority:** Medium
**Precondition:** Game selection screen displayed

**Steps:**
1. Click "About" button (info icon) in header
2. Observe modal appearance
3. Read content
4. Close modal (click X, Close button, or Escape key)

**Expected Results:**
- [ ] Modal opens with 200ms fade-in
- [ ] Fog overlay appears behind modal
- [ ] Modal displays:
  - Title: "About Dream Console"
  - Description of game system
  - Version: 0.2.0
  - Attribution to Wretched and Alone (Chris Bissette)
- [ ] Close button works
- [ ] Escape key closes modal
- [ ] Click outside modal closes it
- [ ] Game selection screen is inert while modal open

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Version displayed:
Attribution present: [ YES / NO ]
```

---

#### Test 3.4: Header Navigation - Help Modal

**Priority:** Medium
**Precondition:** Game selection screen displayed

**Steps:**
1. Click "Help" button (question mark icon) in header
2. Observe modal content
3. Test close functionality

**Expected Results:**
- [ ] Help modal opens with 200ms fade-in
- [ ] Modal displays game mechanics explanation:
  - Stability (Tower): 20 points
  - Tokens: 10 starting
  - D20 dice system
  - Card types (Primary Success, Failure Counter, Narrative, Challenge, Event)
  - Win/loss conditions
- [ ] Close button/Escape key works

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


```

---

#### Test 3.5: Settings Modal - Open and Display

**Priority:** High
**Precondition:** Game selection screen displayed

**Steps:**
1. Click Settings button in header (if present) or hamburger menu → Settings
2. Observe settings modal

**Expected Results:**
- [ ] Settings modal opens with 200ms fade-in
- [ ] Modal displays:
  - Title: "Game Settings"
  - Dice Theme selector with dropdown
  - Difficulty Level selector with dropdown
  - Save Settings button
  - Close button
- [ ] Available dice themes listed (e.g., "Pink Dreams", "Default", etc.)
- [ ] Difficulty options: NORMAL, HARD (capitalized, underscores replaced with spaces)

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Dice themes available:


Difficulty levels available:


```

---

#### Test 3.6: Settings - Dice Theme Change

**Priority:** Medium
**Precondition:** Settings modal open

**Steps:**
1. Note current dice theme selection
2. Select a different dice theme from dropdown
3. Click "Save Settings" button
4. Observe confirmation
5. Close settings modal
6. Reopen settings modal

**Expected Results:**
- [ ] Dice theme dropdown allows selection
- [ ] Save button triggers save action
- [ ] "Settings saved!" message displays briefly (2s fade-in-out)
- [ ] LocalStorage stores selected theme
- [ ] After reopen: Selected theme persists

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Theme selected:
LocalStorage key: gameSettings
```

---

#### Test 3.7: Settings - Difficulty Change

**Priority:** Medium
**Precondition:** Settings modal open

**Steps:**
1. Select a different difficulty level
2. Save settings
3. Verify persistence

**Expected Results:**
- [ ] Difficulty dropdown allows selection
- [ ] Settings save successfully
- [ ] Selection persists after modal close/reopen
- [ ] **Note:** Difficulty is set by game author in config, not user setting (verify this behavior)

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


```

---

#### Test 3.8: Mobile Menu (Responsive)

**Priority:** Medium
**Precondition:** Browser width < 768px OR mobile device

**Steps:**
1. Resize browser to mobile width (<768px) or use device emulation
2. Observe header changes
3. Click hamburger menu icon
4. Observe dropdown menu

**Expected Results:**
- [ ] Desktop buttons hidden (Upload, About, Help)
- [ ] Hamburger menu icon visible (three lines)
- [ ] Click hamburger opens dropdown with:
  - Upload Game
  - Story Library
  - About
  - Help
- [ ] Menu items have hover effects
- [ ] Click outside menu closes it
- [ ] Menu icon changes to X when open

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Screen width tested:
```

---

### Section 4: Custom Game Upload

#### Test 4.1: Upload Button Visibility

**Priority:** High
**Precondition:** Game selection screen displayed

**Steps:**
1. Locate upload button in header (upload icon) or hamburger menu
2. Verify it's clickable

**Expected Results:**
- [ ] Upload button visible (desktop: header, mobile: hamburger menu)
- [ ] Icon: Upload arrow pointing up
- [ ] Hover effect works (transform, glow)
- [ ] Not disabled

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


```

---

#### Test 4.2: Upload Valid .game.md File

**Priority:** Critical
**Precondition:** .game.md file prepared

**Steps:**
1. Click upload button
2. File picker dialog opens
3. Select a valid .game.md file (e.g., future-lost.game.md)
4. Observe upload process

**Expected Results:**
- [ ] File picker dialog opens
- [ ] Accepts .game.md and .md files
- [ ] Status message: "Uploading and parsing game file..."
- [ ] After parse: "Successfully loaded '[Game Title]'!" message
- [ ] Message auto-dismisses after 5 seconds
- [ ] New custom game card appears in game grid
- [ ] Card has "Custom" badge
- [ ] Remove button (X) appears on card
- [ ] LocalStorage stores custom game data

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Game title uploaded:
Custom badge visible: [ YES / NO ]
Remove button visible: [ YES / NO ]
```

---

#### Test 4.3: Upload Invalid File

**Priority:** High
**Precondition:** Game selection screen displayed

**Steps:**
1. Click upload button
2. Select a file that is NOT .game.md (e.g., .txt, .jpg, .pdf)
3. Observe error handling

**Expected Results:**
- [ ] Error message: "Please select a .game.md file"
- [ ] Message auto-dismisses after 3 seconds
- [ ] No game card added
- [ ] File input resets

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Error message displayed:
```

---

#### Test 4.4: Upload Malformed .game.md File

**Priority:** High
**Precondition:** Malformed .game.md file prepared (missing frontmatter, invalid syntax)

**Steps:**
1. Click upload button
2. Select a malformed .game.md file
3. Observe error handling

**Expected Results:**
- [ ] Error message: "Error: [specific parse error]"
- [ ] Message auto-dismisses after 5 seconds
- [ ] No game card added
- [ ] Parser catches and reports specific error (missing frontmatter, invalid card types, etc.)

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Error message:
```

---

#### Test 4.5: Remove Custom Game

**Priority:** High
**Precondition:** Custom game uploaded and visible

**Steps:**
1. Locate custom game card (has "Custom" badge)
2. Click Remove button (X in top-right corner)
3. Confirm removal in dialog
4. Observe result

**Expected Results:**
- [ ] Confirmation dialog: "Are you sure you want to remove '[Game Title]'?"
- [ ] Click OK: Game card disappears
- [ ] Status message: "Custom game removed"
- [ ] LocalStorage updated (game removed)
- [ ] Click Cancel: Game card remains

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


```

---

### Section 5: Story Library

#### Test 5.1: Browse Story Library

**Priority:** Medium
**Precondition:** Game selection screen displayed

**Steps:**
1. Click "Browse Story Library" button (book icon) in header or hamburger menu
2. Observe Story Library screen

**Expected Results:**
- [ ] Browser navigates to Story Library view
- [ ] Screen displays completed/saved games
- [ ] Each saved game shows:
  - Game title
  - Player name
  - Round number
  - Final outcome (Win/Loss)
  - Timestamp
- [ ] If no completed games: Message displays "No completed games yet"
- [ ] Back button returns to game selection

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Number of completed games:
```

---

#### Test 5.2: View Completed Game Story

**Priority:** Medium
**Precondition:** At least one completed game in library

**Steps:**
1. In Story Library, click on a completed game entry
2. Observe story view

**Expected Results:**
- [ ] Story Mode view opens
- [ ] Displays chronological journal entries:
  - Round number
  - Card drawn (title, description)
  - Dice roll result (if applicable)
  - Stability/token changes
  - Player's journal entry
- [ ] Navigation between rounds works (previous/next buttons)
- [ ] Exit button returns to Story Library

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


```

---

### Section 6: Starting a New Game

#### Test 6.1: Start New Game - No Save Exists

**Priority:** Critical
**Precondition:** Game with no existing save (e.g., first play of "Future Lost")

**Steps:**
1. In game selection screen, click a game card without save data
2. Observe Start button (play icon)
3. Click Start button
4. Observe navigation and loading

**Expected Results:**
- [ ] Start button (play icon) visible on card
- [ ] Click starts game immediately (no confirmation)
- [ ] Browser navigates to /game/[slug] (e.g., /game/future-lost)
- [ ] Game loads with introduction screen
- [ ] No console errors during navigation

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


URL after click:
Game loaded: [ YES / NO ]
```

---

#### Test 6.2: Game Introduction Screen

**Priority:** High
**Precondition:** New game started

**Steps:**
1. After starting new game, observe introduction screen
2. Read game introduction content
3. Locate "Begin Game" or "Start" button

**Expected Results:**
- [ ] Introduction screen displays with:
  - Game title (e.g., "Future Lost")
  - Game subtitle (e.g., "A Dimm City Campaign")
  - Introduction sections:
    - "Who You Are"
    - "What Happened"
    - "Your Goal"
- [ ] Text is readable with good contrast
- [ ] "Begin Game" button visible at bottom
- [ ] Neural background visible
- [ ] Button has augmented-ui styling with glow effect

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Game title displayed:
Introduction sections present:
```

---

#### Test 6.3: Begin Game from Introduction

**Priority:** Critical
**Precondition:** Introduction screen displayed

**Steps:**
1. Click "Begin Game" button
2. Observe transition to gameplay screen

**Expected Results:**
- [ ] Button click triggers transition
- [ ] Gameplay screen loads with:
  - Status display (top): Stability 20, Tokens 10, Round 1
  - Card deck interface (center)
  - Journal/log section (if visible)
  - Toolbar with buttons (Help, Settings, Save, Exit)
- [ ] Initial game state correct:
  - Stability: 20/20
  - Tokens: 10
  - Round: 1
  - Aces Revealed: 0
  - Kings Revealed: 0
  - Deck: 52 cards
- [ ] No console errors

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Initial Stability:
Initial Tokens:
Round:
Deck size:
```

---

### Section 7: Core Gameplay - Card Drawing

#### Test 7.1: Draw First Card

**Priority:** Critical
**Precondition:** Gameplay screen loaded, Round 1

**Steps:**
1. Locate "Draw Card" button or card deck interface
2. Click to draw a card
3. Observe card reveal animation

**Expected Results:**
- [ ] Card deck interface clickable
- [ ] Click triggers card draw
- [ ] Card flip/reveal animation plays
- [ ] Card displays:
  - Card rank and suit (e.g., "7 of Hearts")
  - Card type badge (Primary Success, Failure Counter, Narrative, Challenge, Event)
  - Card title/description (short)
  - Full story text (markdown rendered)
- [ ] Card is styled based on type:
  - Primary Success: Special styling (Ace of Hearts)
  - Failure Counter: Danger/red styling (Kings)
  - Narrative: Reflective styling (other Aces)
  - Challenge: Warning styling (odd ranks)
  - Event: Neutral styling (even ranks)

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Card drawn (rank/suit):
Card type:
Animation smooth: [ YES / NO ]
Story text renders: [ YES / NO ]
```

---

#### Test 7.2: Card Type - Challenge (Stability Check)

**Priority:** Critical
**Precondition:** Challenge card drawn (odd rank: 3, 5, 7, 9)

**Steps:**
1. Draw a Challenge card
2. Read card story
3. Observe dice roll interface appearing
4. Click "Roll D20" button (or automatic roll)
5. Observe dice animation and result

**Expected Results:**
- [ ] Challenge card indicates Stability check required
- [ ] Dice roller interface appears (3D dice box)
- [ ] Dice theme matches user settings
- [ ] Click rolls 1d20
- [ ] Dice animation plays (3D dice roll on surface)
- [ ] Result displayed clearly (1-20)
- [ ] Result determines outcome:
  - **Natural 20**: +1 Stability (max 20), gain Lucid state (advantage on next roll)
  - **Natural 1**: Lose Stability equal to card rank, gain Surreal state (disadvantage on next roll)
  - **2-19**: Lose Stability equal to card rank
- [ ] Stability updates in status display
- [ ] Lucid/Surreal state indicator shows if triggered

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Dice roll result:
Stability change:
New Stability:
Lucid/Surreal triggered: [ YES / NO ]
```

---

#### Test 7.3: Card Type - Event (No Stability Check)

**Priority:** High
**Precondition:** Event card drawn (even rank: 2, 4, 6, 8, 10, J, Q)

**Steps:**
1. Draw an Event card
2. Read card story
3. Observe if dice roll is required

**Expected Results:**
- [ ] Event card displays story
- [ ] **No** dice roll required (safe card)
- [ ] "Continue" or "Confirm" button appears
- [ ] Click advances to next state
- [ ] Stability unchanged
- [ ] No damage taken

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Card type verified as Event:
Dice roll required: [ YES / NO ]
```

---

#### Test 7.4: Card Type - Narrative (Special Modifier: skip-damage)

**Priority:** High
**Precondition:** Narrative card with skip-damage modifier drawn

**Steps:**
1. Draw a Narrative card with "skip-damage" modifier
2. Read card story
3. Observe dice roll behavior

**Expected Results:**
- [ ] Narrative card (Ace) displays
- [ ] Story indicates special protection/luck
- [ ] If dice roll occurs, result shows:
  - Damage skipped (Stability unchanged)
  - Message: "Protected by narrative modifier"
- [ ] Aces Revealed counter increments (+1)
- [ ] No Stability loss regardless of roll result

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Aces Revealed incremented: [ YES / NO ]
Stability unchanged: [ YES / NO ]
```

---

#### Test 7.5: Card Type - Narrative (Special Modifier: return-king)

**Priority:** High
**Precondition:** Narrative card with return-king modifier drawn

**Steps:**
1. Draw a Narrative card with "return-king" modifier
2. Read card story
3. Observe Kings Revealed counter

**Expected Results:**
- [ ] Narrative card (Ace) displays
- [ ] Story indicates reversing a catastrophe
- [ ] Kings Revealed counter decrements (-1)
- [ ] If Kings Revealed was 0, no change
- [ ] Message displays: "A king has been returned to the deck"
- [ ] Aces Revealed counter increments (+1)

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Kings Revealed before:
Kings Revealed after:
Aces Revealed incremented: [ YES / NO ]
```

---

#### Test 7.6: Card Type - Failure Counter (King)

**Priority:** Critical
**Precondition:** Failure Counter card (King) drawn

**Steps:**
1. Draw a King card
2. Read card story
3. Observe Kings Revealed counter
4. Check for game over condition

**Expected Results:**
- [ ] King card displays with danger styling
- [ ] Story describes escalating threat
- [ ] Kings Revealed counter increments (+1)
- [ ] Specific king suit indicator lights up (Hearts, Diamonds, Clubs, or Spades)
- [ ] If 4th King: Instant game over (loss)
- [ ] If <4 Kings: Game continues but warning displayed
- [ ] Counter displays: "Kings Revealed: X/4"

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


King suit drawn:
Kings Revealed count:
Game over triggered: [ YES / NO ]
```

---

#### Test 7.7: Card Type - Primary Success (Ace of Hearts)

**Priority:** Critical
**Precondition:** Ace of Hearts drawn (first time)

**Steps:**
1. Draw Ace of Hearts card
2. Read card story
3. Observe Salvation system unlocked
4. Check status display

**Expected Results:**
- [ ] Ace of Hearts displays with special/heroic styling
- [ ] Story describes finding salvation/hope
- [ ] aceOfHeartsRevealed flag set to true
- [ ] Aces Revealed counter increments (+1)
- [ ] Salvation checks now available
- [ ] Status display shows: "Salvation Unlocked"
- [ ] Success threshold: ≥17 (20% chance with 1 Ace)

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Ace of Hearts revealed:
Aces Revealed count:
Salvation unlocked indicator: [ YES / NO ]
```

---

#### Test 7.8: Lucid State (Advantage)

**Priority:** High
**Precondition:** Natural 20 rolled on Stability check, Lucid state granted

**Steps:**
1. Trigger Lucid state (natural 20 on previous roll)
2. Draw next Challenge card
3. Observe dice roll behavior

**Expected Results:**
- [ ] Lucid state indicator visible in UI
- [ ] Next dice roll shows: "Rolling with Advantage (Lucid)"
- [ ] Two d20 dice rolled simultaneously
- [ ] Higher result is used
- [ ] Both dice results displayed
- [ ] Lucid state consumed (clears after use)
- [ ] Status: "You rolled 2d20 and kept the higher result"

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Lucid indicator visible: [ YES / NO ]
Two dice rolled: [ YES / NO ]
Dice results: [ , ]
Result used:
```

---

#### Test 7.9: Surreal State (Disadvantage)

**Priority:** High
**Precondition:** Natural 1 rolled on Stability check, Surreal state granted

**Steps:**
1. Trigger Surreal state (natural 1 on previous roll)
2. Draw next Challenge card
3. Observe dice roll behavior

**Expected Results:**
- [ ] Surreal state indicator visible in UI
- [ ] Next dice roll shows: "Rolling with Disadvantage (Surreal)"
- [ ] Two d20 dice rolled simultaneously
- [ ] Lower result is used
- [ ] Both dice results displayed
- [ ] Surreal state consumed (clears after use)
- [ ] Status: "You rolled 2d20 and kept the lower result"

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Surreal indicator visible: [ YES / NO ]
Two dice rolled: [ YES / NO ]
Dice results: [ , ]
Result used:
```

---

### Section 8: Salvation System (Win Condition)

#### Test 8.1: First Salvation Check (1 Ace)

**Priority:** Critical
**Precondition:** Ace of Hearts revealed, tokens > 0

**Steps:**
1. After drawing a card, observe if Salvation check prompt appears
2. Click "Attempt Salvation" button
3. Roll d20
4. Observe result

**Expected Results:**
- [ ] Salvation check option appears after card resolution
- [ ] Button text: "Attempt Salvation (Need ≥17)"
- [ ] Click rolls d20
- [ ] Result evaluated:
  - **Natural 1**: +2 tokens (critical failure)
  - **2-16**: +1 token (failure)
  - **17-19**: -1 token (success)
  - **Natural 20**: -2 tokens (critical success)
- [ ] Tokens update in status display
- [ ] Message explains result

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Threshold displayed: ≥17
Roll result:
Token change:
New token count:
```

---

#### Test 8.2: Salvation Check with Multiple Aces

**Priority:** High
**Precondition:** 2+ Aces revealed

**Steps:**
1. Draw additional Aces (2nd, 3rd, or 4th)
2. Attempt Salvation check
3. Observe threshold change

**Expected Results:**
- [ ] Salvation threshold improves with each Ace:
  - **1 Ace**: ≥17 (20% success)
  - **2 Aces**: ≥14 (35% success)
  - **3 Aces**: ≥11 (50% success)
  - **4 Aces**: Automatic success (100%)
- [ ] Threshold displayed in button/UI
- [ ] If 4 Aces: Message "Salvation is certain!"
- [ ] Dice roll respects new threshold

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Aces Revealed:
Threshold displayed:
Roll result:
Success: [ YES / NO ]
```

---

#### Test 8.3: Win Condition - All Tokens Removed

**Priority:** Critical
**Precondition:** Tokens = 1, successful Salvation check

**Steps:**
1. Reduce tokens to 1
2. Attempt Salvation check
3. Roll ≥ threshold (or natural 20)
4. Observe game over

**Expected Results:**
- [ ] Tokens reach 0
- [ ] Game over triggered immediately
- [ ] Win screen displays:
  - "Victory!" or custom win message from game config
  - Final statistics (Stability, Round, Cards Remaining)
  - Journal summary
  - "View Story" button
  - "Play Again" button
  - "Return to Menu" button
- [ ] Game saved to IndexedDB as completed
- [ ] Win flag set to true

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Win message displayed:
Final Stability:
Final Round:
```

---

### Section 9: Loss Conditions

#### Test 9.1: Loss Condition - Stability Reaches 0

**Priority:** Critical
**Precondition:** Stability close to 0

**Steps:**
1. Draw Challenge cards and fail rolls to reduce Stability
2. Reduce Stability to exactly 0
3. Observe game over

**Expected Results:**
- [ ] When Stability reaches 0:
  - Game over triggered immediately
  - Loss screen displays
  - Lose message: Custom from game config OR "The stability has collapsed"
  - Final statistics shown
  - Journal saved
- [ ] "Play Again" and "Return to Menu" buttons available
- [ ] Game saved to IndexedDB as completed (loss)

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Loss message displayed:
Final Round:
Final Tokens:
```

---

#### Test 9.2: Loss Condition - All 4 Kings Revealed

**Priority:** Critical
**Precondition:** 3 Kings revealed

**Steps:**
1. Draw the 4th King card
2. Observe immediate game over

**Expected Results:**
- [ ] Upon 4th King reveal:
  - Game over triggered instantly (no dice roll)
  - Loss screen displays
  - Lose message: "All kings revealed" or custom from config
  - No chance to continue
  - Final statistics displayed
- [ ] Game saved as completed (loss)

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Loss message:
Kings Revealed: 4/4
```

---

### Section 10: Journal and Progression

#### Test 10.1: Journal Entry After Card

**Priority:** Medium
**Precondition:** Card drawn and resolved

**Steps:**
1. After resolving a card (dice roll complete, story read)
2. Observe if journal entry prompt appears
3. Enter journal text (optional)
4. Click "Continue" or "Next"

**Expected Results:**
- [ ] Journal entry modal/panel appears
- [ ] Textarea allows typing (optional)
- [ ] Pre-filled with card summary:
  - Round number
  - Card drawn (rank, suit, type)
  - Dice roll result (if applicable)
  - Stability/token changes
- [ ] Save button stores entry
- [ ] Entry added to journal log
- [ ] Can skip without entering text

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Journal prompt appears: [ YES / NO ]
Entry saved: [ YES / NO ]
```

---

#### Test 10.2: Round Progression

**Priority:** High
**Precondition:** Card resolved, journal entry saved

**Steps:**
1. Complete a full card cycle (draw, resolve, journal)
2. Observe round increment
3. Draw next card

**Expected Results:**
- [ ] Round counter increments by 1
- [ ] Status display updates: "Round X"
- [ ] Deck size decreases by 1
- [ ] Discard pile increases by 1
- [ ] Game state persists correctly
- [ ] No errors during state transition

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Round after card:
Deck size:
Discard pile size:
```

---

### Section 11: Save and Resume

#### Test 11.1: Manual Save During Gameplay

**Priority:** Critical
**Precondition:** Game in progress

**Steps:**
1. During gameplay, click "Save Game" button in toolbar
2. Observe save confirmation
3. Check game selection screen

**Expected Results:**
- [ ] Save button visible in toolbar
- [ ] Click triggers save to IndexedDB
- [ ] Success message: "Game saved!"
- [ ] No interruption to gameplay
- [ ] Return to game selection:
  - Resume button appears on game card
  - Save metadata displays (Round, Stability, Tokens, Timestamp)

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Save confirmation: [ YES / NO ]
IndexedDB entry created: [ YES / NO ]
```

---

#### Test 11.2: Auto-Save on Exit

**Priority:** High
**Precondition:** Game in progress

**Steps:**
1. During gameplay, click "Exit" button in toolbar
2. Observe save behavior
3. Check game selection screen

**Expected Results:**
- [ ] Exit button triggers auto-save
- [ ] Confirmation dialog: "Save game before exiting?"
  - Click "Save & Exit": Game saved, navigates to game selection
  - Click "Exit Without Saving": No save, navigates to game selection
  - Click "Cancel": Stays in game
- [ ] If saved: Resume button appears on game card

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Confirmation dialog appears: [ YES / NO ]
Auto-save works: [ YES / NO ]
```

---

#### Test 11.3: Resume Saved Game

**Priority:** Critical
**Precondition:** Saved game exists

**Steps:**
1. In game selection screen, locate game card with save data
2. Observe Resume button (play icon) instead of Start
3. Click Resume button
4. Observe game loads with saved state

**Expected Results:**
- [ ] Resume button visible on card
- [ ] Save metadata displays:
  - Player name
  - Round number
  - Stability: X/20
  - Tokens: X
  - Timestamp (e.g., "Saved: Nov 19, 2025 2:30 PM")
- [ ] Click Resume loads game
- [ ] Game state matches saved state:
  - Correct Stability, Tokens, Round
  - Deck in correct state (cards drawn/remaining)
  - Aces/Kings counters correct
  - Lucid/Surreal states preserved
  - Journal entries restored
- [ ] No errors during load

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Loaded Stability:
Loaded Tokens:
Loaded Round:
Deck size:
Journal entries count:
```

---

#### Test 11.4: Delete Saved Game

**Priority:** High
**Precondition:** Saved game exists

**Steps:**
1. In game selection screen, locate game card with save data
2. Click Delete Save button (trash icon)
3. Confirm deletion in dialog
4. Observe result

**Expected Results:**
- [ ] Delete button visible next to Resume button
- [ ] Confirmation dialog: "Are you sure you want to delete your saved game for '[Game Title]'? This will permanently delete your saved progress. This cannot be undone."
- [ ] Click DELETE:
  - Save deleted from IndexedDB
  - Status message: "Saved game deleted"
  - Resume button disappears
  - Start button appears
  - Save metadata panel disappears
- [ ] Click CANCEL: No change

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Confirmation dialog text correct: [ YES / NO ]
Save deleted: [ YES / NO ]
```

---

#### Test 11.5: Multiple Saves (Different Games)

**Priority:** Medium
**Precondition:** Multiple games available

**Steps:**
1. Start and save Game A (e.g., Future Lost)
2. Return to game selection
3. Start and save Game B (e.g., Ghost in the Machine)
4. Return to game selection
5. Resume each game

**Expected Results:**
- [ ] Both games show Resume buttons
- [ ] Each game's save data is independent
- [ ] Resume Game A: Loads correct state for Game A
- [ ] Resume Game B: Loads correct state for Game B
- [ ] No state contamination between games
- [ ] IndexedDB stores separate entries (keyed by game slug)

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Game A state correct: [ YES / NO ]
Game B state correct: [ YES / NO ]
```

---

### Section 12: UI and Accessibility

#### Test 12.1: Status Display - Real-time Updates

**Priority:** High
**Precondition:** Game in progress

**Steps:**
1. Observe status display at top of gameplay screen
2. Take damage, roll dice, draw cards
3. Verify status updates in real-time

**Expected Results:**
- [ ] Status display shows:
  - **Stability**: X/20 with bar or visual indicator
  - **Tokens**: X with icon
  - **Round**: X
  - **Aces Revealed**: X/4 (if >0)
  - **Kings Revealed**: X/4 (if >0)
  - **Lucid/Surreal**: Icon/badge if active
- [ ] Values update instantly after each action
- [ ] Visual feedback (color change, animation) on value change
- [ ] No lag or delay

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Status display visible: [ YES / NO ]
Real-time updates: [ YES / NO ]
```

---

#### Test 12.2: Keyboard Navigation

**Priority:** Medium
**Precondition:** Any screen

**Steps:**
1. Use Tab key to navigate through interactive elements
2. Use Enter/Space to activate buttons
3. Use Escape to close modals

**Expected Results:**
- [ ] Tab key cycles through focusable elements (buttons, inputs, links)
- [ ] Focus indicator visible (outline, glow)
- [ ] Enter/Space activates focused button
- [ ] Escape closes open modals
- [ ] No keyboard traps
- [ ] Logical tab order (top to bottom, left to right)

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Tab order logical: [ YES / NO ]
Focus indicator visible: [ YES / NO ]
```

---

#### Test 12.3: Screen Reader Compatibility (Basic)

**Priority:** Low
**Precondition:** Screen reader enabled (e.g., NVDA, JAWS, VoiceOver)

**Steps:**
1. Navigate application with screen reader
2. Test key interactions:
   - Game card selection
   - Modal opening/closing
   - Button activation
   - Status display reading

**Expected Results:**
- [ ] Images have alt text
- [ ] Buttons have accessible labels (aria-label)
- [ ] Modals have proper aria attributes (role="dialog", aria-modal="true")
- [ ] Status updates announced (aria-live regions)
- [ ] Focus management when modals open/close

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Screen reader tested:
Issues found:


```

---

#### Test 12.4: Reduced Motion Preference

**Priority:** Medium
**Precondition:** System preference set to "Reduce Motion"

**Steps:**
1. Enable "Reduce Motion" in OS settings
   - Windows: Settings > Ease of Access > Display > Show animations
   - Mac: System Preferences > Accessibility > Display > Reduce motion
2. Navigate application
3. Observe animations

**Expected Results:**
- [ ] Animations disabled or significantly reduced:
  - Splash screen auto-advances (no fade)
  - Card reveals instant (no flip animation)
  - Modal transitions instant (no fade)
  - Floating animations disabled
  - Dice animation reduced (instant result)
- [ ] Functionality unchanged (just less animation)
- [ ] CSS media query applied: `@media (prefers-reduced-motion: reduce)`

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Animations reduced: [ YES / NO ]
```

---

### Section 13: Responsive Design

#### Test 13.1: Desktop Layout (1920x1080)

**Priority:** Medium
**Precondition:** Browser window 1920x1080

**Steps:**
1. Resize browser to 1920x1080
2. Navigate through all screens
3. Verify layout

**Expected Results:**
- [ ] Game cards grid: 3 columns
- [ ] All header buttons visible (Upload, About, Help)
- [ ] No horizontal scrolling
- [ ] Modals centered, appropriate size
- [ ] Text readable without zoom
- [ ] Dice box fits screen
- [ ] No overflow or clipping

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Game cards columns: 3
Layout issues:


```

---

#### Test 13.2: Tablet Layout (768x1024)

**Priority:** Medium
**Precondition:** Browser window 768x1024 OR iPad device

**Steps:**
1. Resize browser to 768x1024 or use iPad
2. Navigate through screens
3. Verify responsive changes

**Expected Results:**
- [ ] Game cards grid: 2 columns
- [ ] Hamburger menu appears (header buttons move to dropdown)
- [ ] Modals adjust size (70dvh height)
- [ ] Touch targets large enough (48x48px minimum)
- [ ] Text remains readable
- [ ] No horizontal scrolling

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Game cards columns: 2
Hamburger menu visible: [ YES / NO ]
```

---

#### Test 13.3: Mobile Layout (375x667 - iPhone SE)

**Priority:** High
**Precondition:** Browser window 375x667 OR iPhone SE device

**Steps:**
1. Resize browser to 375x667 or use iPhone SE
2. Navigate through all screens
3. Test touch interactions

**Expected Results:**
- [ ] Game cards grid: 1 column
- [ ] Hamburger menu visible
- [ ] All buttons accessible via menu
- [ ] Cards stack vertically with spacing
- [ ] Modals full-screen or near full-screen
- [ ] Text readable without zoom (16px minimum)
- [ ] Touch targets large enough (48x48px)
- [ ] Dice box fits within viewport
- [ ] Status display condenses (icons instead of labels)
- [ ] No horizontal scrolling

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Game cards columns: 1
Layout readable: [ YES / NO ]
Issues:


```

---

#### Test 13.4: Very Small Mobile (320x568 - iPhone 5)

**Priority:** Low
**Precondition:** Browser window 320x568 or equivalent

**Steps:**
1. Resize to 320x568
2. Navigate screens
3. Check for layout breaking

**Expected Results:**
- [ ] Layout remains functional (no breaking)
- [ ] Text may be smaller but still readable
- [ ] Buttons remain accessible
- [ ] Modals remain usable
- [ ] Possible horizontal scroll on some elements (acceptable)

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Layout broken: [ YES / NO ]
Horizontal scroll: [ YES / NO ]
```

---

### Section 14: Performance and Edge Cases

#### Test 14.1: Page Load Performance

**Priority:** Medium
**Precondition:** Fresh browser session

**Steps:**
1. Open browser DevTools > Network tab
2. Clear cache (Ctrl+Shift+Del)
3. Navigate to http://localhost:5173/
4. Measure load times

**Expected Results:**
- [ ] Initial HTML loads < 1s
- [ ] DOMContentLoaded < 2s
- [ ] Page fully interactive < 3s
- [ ] No excessive resource loads (check Size column)
- [ ] No failed requests (red in Network tab)
- [ ] Neural background starts animating quickly

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


DOMContentLoaded time:
Load time:
Failed requests: [ YES / NO ]
```

---

#### Test 14.2: JavaScript Console Errors

**Priority:** Critical
**Precondition:** Any screen

**Steps:**
1. Open browser DevTools > Console tab
2. Navigate through entire application flow:
   - Splash → Instructions → Game Selection → Upload → Settings → Start Game → Gameplay → Save → Resume → Exit
3. Check for errors at each step

**Expected Results:**
- [ ] No console errors (red)
- [ ] No console warnings (yellow) related to app code
- [ ] Info/debug logs acceptable (if any)
- [ ] No unhandled promise rejections
- [ ] No "undefined" or "null" errors

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Errors found:


Warnings found:


```

---

#### Test 14.3: Network Errors (Offline Behavior)

**Priority:** Low
**Precondition:** Game selection screen

**Steps:**
1. Start a game
2. During gameplay, open DevTools > Network tab
3. Enable "Offline" mode in DevTools
4. Continue gameplay (draw cards, roll dice)
5. Observe behavior

**Expected Results:**
- [ ] Game continues to function (no server calls required)
- [ ] Card draws work (deck stored in memory)
- [ ] Dice rolls work (RNG is client-side)
- [ ] Saving to IndexedDB works (offline storage)
- [ ] Only potential issue: Loading new games or navigation
- [ ] Error messages graceful if server needed

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Gameplay continues offline: [ YES / NO ]
IndexedDB saves work: [ YES / NO ]
```

---

#### Test 14.4: Rapid Clicking / Button Spam

**Priority:** Medium
**Precondition:** Any interactive screen

**Steps:**
1. Rapidly click buttons multiple times:
   - Draw Card button (10x rapid clicks)
   - Roll Dice button (10x rapid clicks)
   - Save button (10x rapid clicks)
   - Modal open/close (10x rapid clicks)
2. Observe for errors or duplicates

**Expected Results:**
- [ ] Buttons disable during processing
- [ ] No duplicate actions (e.g., drawing 2 cards at once)
- [ ] No state corruption
- [ ] No console errors
- [ ] UI remains responsive
- [ ] Animations complete before next action

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Duplicate actions: [ YES / NO ]
State corruption: [ YES / NO ]
Errors: [ YES / NO ]
```

---

#### Test 14.5: Browser Back/Forward Navigation

**Priority:** Medium
**Precondition:** Game in progress

**Steps:**
1. Start a game (navigate to /game/[slug])
2. Draw a few cards, progress to Round 3
3. Click browser Back button
4. Observe behavior
5. Click browser Forward button
6. Observe behavior

**Expected Results:**
- [ ] Back button returns to game selection
- [ ] Confirmation dialog: "Leave game? Unsaved progress will be lost."
  - OR auto-saves before navigating back
- [ ] Forward button returns to game (if saved)
- [ ] Game state intact if auto-saved
- [ ] No duplicate state or broken navigation

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Back button behavior:
Confirmation dialog: [ YES / NO ]
Auto-save on back: [ YES / NO ]
```

---

#### Test 14.6: Deck Exhaustion (All 52 Cards Drawn)

**Priority:** Low
**Precondition:** Game in progress

**Steps:**
1. Draw all 52 cards (or use dev tools to simulate)
2. Observe behavior when deck is empty
3. Check for errors

**Expected Results:**
- [ ] When deck size = 0:
  - No more cards can be drawn
  - Message: "Deck exhausted" or similar
  - Game ends gracefully (not a win or loss, just complete)
  - OR game reshuffles discard into deck (if design allows)
- [ ] No errors if attempting to draw with empty deck

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Deck exhaustion handled: [ YES / NO ]
Behavior:


```

---

#### Test 14.7: IndexedDB Storage Limit

**Priority:** Low
**Precondition:** Multiple games saved

**Steps:**
1. Save 10+ games (or simulate large data)
2. Check IndexedDB size in DevTools > Application > Storage
3. Verify saves still work

**Expected Results:**
- [ ] IndexedDB accepts multiple saves
- [ ] Each save keyed by game slug
- [ ] No storage quota errors (browsers typically allow 50-100MB+)
- [ ] If quota reached: Graceful error message

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Notes:


Number of saves stored:
IndexedDB size:
Errors: [ YES / NO ]
```

---

### Section 15: Cross-Browser Compatibility

#### Test 15.1: Chrome/Chromium

**Priority:** High
**Precondition:** Google Chrome or Chromium browser

**Steps:**
1. Open http://localhost:5173/ in Chrome
2. Run through core gameplay flow (Sections 1-7)
3. Test save/resume
4. Check for browser-specific issues

**Expected Results:**
- [ ] All features work
- [ ] 3D dice render correctly
- [ ] Neural background animates smoothly
- [ ] IndexedDB saves work
- [ ] No console errors
- [ ] CSS animations smooth

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Browser Version:
Issues:


```

---

#### Test 15.2: Firefox

**Priority:** High
**Precondition:** Mozilla Firefox browser

**Steps:**
1. Open http://localhost:5173/ in Firefox
2. Run through core gameplay flow
3. Test 3D dice specifically
4. Check for Firefox-specific issues

**Expected Results:**
- [ ] All features work
- [ ] 3D dice render (Three.js compatible)
- [ ] Neural background animates
- [ ] IndexedDB saves work
- [ ] CSS grid/flexbox renders correctly
- [ ] No console errors

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Browser Version:
Issues:


```

---

#### Test 15.3: Safari (macOS/iOS)

**Priority:** Medium
**Precondition:** Safari browser (Mac or iPhone)

**Steps:**
1. Open http://localhost:5173/ in Safari
2. Run through core gameplay flow
3. Test touch interactions (iOS)
4. Check for Safari-specific issues

**Expected Results:**
- [ ] All features work
- [ ] 3D dice render (WebGL support)
- [ ] IndexedDB saves work (Safari has quirks)
- [ ] Touch gestures work (iOS)
- [ ] Backdrop-filter renders (or graceful fallback)
- [ ] No console errors

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Browser Version:
Issues:


```

---

#### Test 15.4: Edge (Chromium)

**Priority:** Low
**Precondition:** Microsoft Edge browser

**Steps:**
1. Open http://localhost:5173/ in Edge
2. Run through core gameplay flow
3. Check for Edge-specific issues

**Expected Results:**
- [ ] All features work (Chromium-based, should match Chrome)
- [ ] No unique issues

**Actual Results:**
```
Status: [ PASS / FAIL / BLOCKED ]
Browser Version:
Issues:


```

---

## Test Results Template

### Summary Report

**Test Date:** YYYY-MM-DD
**Tester Name:**
**Browser(s) Tested:**
**Device(s) Tested:**

#### Overall Results

| Status | Count |
|--------|-------|
| PASS   |       |
| FAIL   |       |
| BLOCKED|       |
| TOTAL  |       |

#### Critical Issues Found

1. **Issue:** [Description]
   - **Severity:** Critical / High / Medium / Low
   - **Steps to Reproduce:**
   - **Expected:**
   - **Actual:**
   - **Screenshot/Video:** [Link if available]

2. **Issue:** [Description]
   - ...

#### Non-Critical Issues Found

1. **Issue:** [Description]
   - ...

#### Recommendations

- [ ] Issue #1 requires immediate fix (blocks gameplay)
- [ ] Issue #2 should be fixed before release
- [ ] Issue #3 is cosmetic, can be deferred

---

## Appendix: Test Data Files

### Valid .game.md Example

Located at: `/home/user/dc-solo-rpg/static/games/future-lost.game.md`

```markdown
---
title: Future Lost
subtitle: A Dimm City Campaign
win-message: You have managed to repair the time machine and return home!
lose-message: The time machine has been damaged beyond repair
---

## Who You Are

You are a time traveler stranded in a dystopian future...

[Full game content omitted for brevity]
```

### Invalid .game.md Example (for error testing)

Create a file `invalid-game.game.md` with:

```markdown
This file has no frontmatter and will fail parsing.

### Card Deck

This section is malformed.
```

---

## Notes for Testers

1. **Console Errors:** Always keep browser console open during testing. Any red errors are critical.

2. **State Inspection:** Use browser DevTools > Application tab to inspect:
   - IndexedDB: Check `dc-solo-rpg` database for saved games
   - LocalStorage: Check `gameSettings` for user preferences
   - SessionStorage: Check `splashShown`, `instructionsShownInSession`, `migrationComplete`

3. **Performance:** If animations are slow or janky, note device specs and browser version.

4. **Screenshots:** Capture screenshots of any visual bugs or errors. Use browser's screenshot tool (F12 > ... > Capture screenshot).

5. **Reproducibility:** If a bug occurs, try to reproduce it 2-3 times to confirm consistency.

6. **Edge Cases:** Don't just test the happy path. Try to break things:
   - Invalid input
   - Rapid clicking
   - Browser back/forward
   - Offline mode
   - Extreme screen sizes

---

## Expected Application Behavior Summary

### Game Mechanics (D20 System)

- **Stability (Tower):** 20 points maximum, lose when reaches 0
- **Tokens:** Start at 10, win when reaches 0 (via Salvation checks)
- **Aces Revealed:** 0-4, improves Salvation success threshold
- **Kings Revealed:** 0-4, instant loss at 4
- **Lucid State (Advantage):** Roll 2d20, keep higher. Triggered by natural 20 on Stability check.
- **Surreal State (Disadvantage):** Roll 2d20, keep lower. Triggered by natural 1 on Stability check.

### Card Types

1. **Primary Success** (Ace of Hearts): Unlocks Salvation checks
2. **Failure Counter** (All Kings): Instant loss when all 4 revealed
3. **Narrative** (Remaining Aces): Reflective moments, may have special modifiers (skip-damage, return-king)
4. **Challenge** (Odd ranks: 3,5,7,9): Usually trigger Stability checks
5. **Event** (Even ranks: 2,4,6,8,10,J,Q): Usually safe, no Stability check

### Salvation System

| Aces Revealed | Success Threshold | Success Rate |
|---------------|-------------------|--------------|
| 1             | ≥17 (17-20)      | 20%          |
| 2             | ≥14 (14-20)      | 35%          |
| 3             | ≥11 (11-20)      | 50%          |
| 4             | Automatic        | 100%         |

**Salvation Results:**
- Natural 1: +2 tokens (critical failure)
- Below threshold: +1 token (failure)
- At/above threshold: -1 token (success)
- Natural 20: -2 tokens (critical success)

### Win Conditions

- **Tokens reach 0** via successful Salvation checks

### Loss Conditions

1. **Stability reaches 0** (instant loss)
2. **All 4 Kings revealed** (instant loss)

---

**END OF TEST PLAN**
