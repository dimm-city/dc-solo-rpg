# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DC Solo RPG is a SvelteKit-based web component library for creating solo role-playing games. The project implements the **Wretched and Alone** game system, which uses a 52-card deck (The Oracle) and mechanics derived from the SRD (System Reference Document). The core focus is on simplicity and ease of game creation for non-technical users.

**Key Philosophy:** This is a hobby project. Keep architecture simple and maintainable. Avoid enterprise-level complexity.

## Important: Use Code Index Skill

**CRITICAL:** Before exploring the codebase or gathering context, ALWAYS use the `code-index-builder` skill to leverage indexed documentation in `.references/`. This directory contains:

- `project.index.md` - Comprehensive codebase index
- `codebase_ast.md` - AST analysis of the project structure
- `external-docs/` - Scraped web documentation

Using the code index tools will provide the most efficient context gathering and minimize token usage.

## Common Commands

### Development

```bash
npm run dev              # Start development server
npm run dev -- --open    # Start dev server and open in browser
npm run build            # Build production version
npm run preview          # Preview production build
```

### Testing

```bash
npm run test:unit        # Run unit tests with Vitest
npm run test             # Run Playwright tests (e2e)
```

### Code Quality

```bash
npm run check            # Type-check with svelte-check
npm run check:watch      # Type-check in watch mode
npm run lint             # Check code style with Prettier and ESLint
npm run format           # Auto-format code with Prettier
```

### Package Management

```bash
npm run package          # Build library for publishing
npm run prepublishOnly   # Pre-publish checks (runs automatically)
```

## Project Structure

### Core Directories

- **`src/lib/`** - Library code (the actual published package)
  - **`components/`** - Svelte components (Game, GameSelector, CardDeck, etc.)
  - **`stores/`** - Game state management using Svelte 5 runes
  - **`parsers/`** - Markdown game file parser (markdownParser.js)
  - **`configuration/`** - Game configuration objects and constants
  - **`utils/`** - Utility functions (logger, timing)

- **`src/routes/`** - SvelteKit routes (demo/showcase app)
  - Demo pages and examples
  - Not included in published package

- **`static/games/`** - The built-in games (`*.game.md`, plus a folder per game for its card art). The home loader finds them at build time (`src/routes/builtInGames.js`, an `import.meta.glob`), so adding a game is adding its file. There is no games index to generate or maintain. One game ships built in, `ghost-in-the-machine` (Locked in the Tech District): it is also the fixture the unit and e2e tests play, so it carries every edge of the format on purpose (an explicit `difficulty`, images in every placement including a decorative one and one before the headline, explicit card names on the skip-damage Ace and the last Challenge, and a last Event with no story). The other Dimm City games live in the `dimm-city/solo-rpg-games` repository and reach players through the default game source.

- **GitHub game sources**: players add public repositories in Settings (`components/settings/GameSourcesSection.svelte`). `stores/gameSources.svelte.js` keeps the list and each source's cached games in localStorage (`dc-solo-rpg-game-sources`), checks a source at most once an hour (`shouldRefresh`; `refreshGameSources()` runs on home load and from "Refresh now") and never drops cached games over a failed check. `services/githubGames.js` reads the `owner/repo[/folder][@branch]` string (or a github.com link) and does one check through GitHub's Contents API: the listing's ETag is sent back (304 = unchanged, free), only files with a new `sha` are downloaded, and a rate-limit 403 keeps the cache. A source game is an uploaded-game config (`isCustom: true`, so it plays at `/game/custom/[slug]`) plus `source: { id, owner, repo, branch, path, sha, url }`; its slug is the slugified source id, `--`, the file name. The home card shows the repository instead of the Custom badge. `DEFAULT_SOURCES` (`dimm-city/solo-rpg-games`) is added once per browser by `seedDefaultSources()` and stays removed if the player removes it (`seeded` in storage). The Playwright config presets that storage as already seeded with no sources, so the e2e suite never calls GitHub. Creator docs: "Hosting Games on GitHub" in `docs/game-config.md`

- **`docs/`** - Documentation for game creators
  - `game-config.md` - Type-based markdown format specification
  - `simplified-type-based-format.md` - Complete format guide with examples
  - `wretched-alone-mechanics-guide.md` - Game mechanics documentation

- **`.references/`** - Indexed documentation (**gitignored**, regenerate as needed)
  - Use `code-index-builder` skill to leverage these files

## Architecture

### State Management (Svelte 5 Runes)

The project uses **Svelte 5 runes** for reactive state management. The old StateMachine class has been eliminated.

**Core Pattern:**

```javascript
// gameStore.svelte.js - Single source of truth
let gameState = $state({
	state: 'loadGame',
	tower: 20, // D20 system: Stability (was 54 in old d6 system)
	tokens: 10,
	deck: [],
	acesRevealed: 0, // D20 system: Tracks Aces for Salvation threshold
	isLucid: false, // D20 system: Advantage on next roll (natural 20)
	isSurreal: false // D20 system: Disadvantage on next roll (natural 1)
	// ... all game state
});

// Export getter functions for computed values
export function getCurrentScreen() {
	return gameState.state;
}
```

**Actions Pattern:**

```javascript
// gameActions.svelte.js - All state mutations
export const startGame = (player, config, options) => {
	initializeGame(config, player, options);
};

export const drawCard = () => {
	// Modify gameState directly
	gameState.currentCard = gameState.deck.pop();
	transitionTo('cardDrawn');
};
```

**Key Files:**

- `src/lib/stores/gameStore.svelte.js` - Core state and transition management
- `src/lib/stores/gameActions.svelte.js` - All game logic and mutations
- `src/lib/stores/gameInit.js` - Game initialization logic
- `src/lib/stores/transitions.js` - State machine transition graph

### Game Creation Format

Games are created using a **single markdown file** (`.game.md`) with type-based card organization:

```markdown
---
title: Game Title
subtitle: Game Subtitle
win-message: Victory message
lose-message: Defeat message
---

# Introduction

[Game setup and narrative]

# Card Deck

### Primary Success

[1 card - Ace of Hearts - main win condition]

### Failure Counter

[4 cards - All Kings - instant loss when all revealed]

### Narrative

[3 cards - Remaining Aces - reflective moments, abilities]

### Challenge

[16 cards - Ranks 3, 5, 7, 9 - Stability checks (like all odd ranks, Aces included)]

### Event

[28 cards - Even ranks (2,4,6,8,10,J,Q) - safe moments]
```

**Key Concepts:**

- Writers focus on **card types**, not card identifiers
- System auto-assigns cards to the 52-card deck
- Optional special modifiers: `skip-damage`, `return-king`
- Optional card image: one markdown image line (`![alt](art/x.jpg)`) in the card body; shown framed above the story on the card face (`card/CardDisplay.svelte`) and as a thumbnail in story mode (`StoryRound.svelte`). Relative paths resolve against the game file's URL when `parseGameFile` is given `{ baseUrl }`; the next cards' pictures are fetched ahead (`GameScreen.svelte`, `utils/preloadImages.js`) and auto-play holds a card with a picture 1.5s longer
- Parser: `src/lib/parsers/markdownParser.js`

**Full specification:** See `docs/game-config.md` and `docs/simplified-type-based-format.md`

### Component Architecture

**Main Components:**

- `Game.svelte` - Root game component, handles lifecycle
- `GameSelector.svelte` - Game selection interface
- `GameScreen.svelte` - Main game play screen: the intro, the table and the one step button (`game/StepAction.svelte`)
- `CardDeck.svelte` - Card drawing interface (the card itself is `card/CardDisplay.svelte`)
- `StatusDisplay.svelte` - In-game header plus the one-row HUD (`status/StatusHUD.svelte`)
- 3D dice: `stores/diceStore.svelte.js` (uses @3d-dice/dice-box-threejs), shown in the dice container in `src/routes/+layout.svelte`

**Component Pattern:**

```svelte
<script>
	import { gameState } from '$lib/stores/gameStore.svelte.js';
	import { someAction } from '$lib/stores/gameActions.svelte.js';

	// Access reactive state directly
	$: tower = gameState.tower;
</script>

<div>Tower: {tower}</div>
```

### Testing

Tests use **Vitest** with jsdom environment:

```bash
npm run test:unit        # Run all tests
npm run test:unit -- src/lib/stores/gameStore.test.js  # Run specific test
```

**Test Pattern:**

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { gameState } from './gameStore.svelte.js';

describe('Game State', () => {
	beforeEach(() => {
		// Reset state before each test
	});

	it('should initialize correctly', () => {
		expect(gameState.tower).toBe(20); // D20 system: 20 Stability
	});
});
```

**Coverage:**

```bash
npm run test:unit -- --coverage
```

## Game Mechanics (D20 System)

The game uses a **D20 dice system** inspired by Wretched and Alone mechanics but with tactical depth:

### Core Resources

- **Stability**: 20 points (your life). Reaches 0 = instant loss.
- **Tokens**: Start with 10. Remove all to win. On Normal they only ever fall.
- **Aces Revealed**: 0-4. Determines Salvation success threshold; on Easy the fourth Ace ends the game.

### D20 Rolling Mechanics

- **Standard Roll**: 1d20 for all checks
- **Lucid State (Advantage)**: Roll 2d20, keep highest. Triggered by a natural 20 on any d20 roll (the opening instability roll, Roll for Tasks, a Stability check or Salvation).
- **Surreal State (Disadvantage)**: Roll 2d20, keep lowest. Triggered by a natural 1 on any d20 roll.
- On 2d20, only the kept die counts as a natural 20 or 1.
- The modifier applies to, and is used up by, the next roll, whichever roll that is. The two never stack, and a new game starts with neither.

### Salvation System (Win Condition)

Drawing the Ace of Hearts unlocks Salvation checks. Each subsequent Ace improves success rate:

- **1 Ace**: Roll ≥17 to remove 1 token (20% success)
- **2 Aces**: Roll ≥14 to remove 1 token (35% success)
- **3 Aces**: Roll ≥11 to remove 1 token (50% success)
- **4 Aces**: No target. Each Salvation check is a Stability check (read on the Stability table, any Lucid or Surreal applied and used up), and the token comes off if Stability holds; if the roll takes Stability to 0 the game is lost instead (`calculateAutomaticSalvation`). The game is still won only by the last token. On Easy there is no Salvation roll with four Aces: **the fourth Ace ends the game**. Being odd it calls for a Stability check like any Ace, and that check is the last roll of the game (`isFinalStabilityCheck`, gated by `fourthAceWins`): if Stability is still above 0 afterwards the game is won, whatever tokens remain; if it reaches 0 the game is lost by Stability. A fourth Ace with `skip-damage` skips the check and wins outright (on Easy only).

**Token Changes** (1 to 3 Aces; `calculateSalvationResult(roll, threshold, { hard })`):

- Natural 20: -2 tokens (critical success), Lucid
- At/above threshold: -1 token (success)
- Below threshold: no change on Normal; +1 token on Hard
- Natural 1: a miss, Surreal; no change on Normal; +2 tokens on Hard

So on Normal tokens only ever fall and can never rise above the starting count.

### Difficulty

`difficulty` is 0 = Easy, 1 = Normal, 2 = Hard (`src/lib/constants/difficulty.js`; `fourthAceWins(gameState)` gates the Easy rule and `isHardGame(gameState)` the Hard one). The one place that decides whether the fourth Ace ends the game is `fourthAceWins`: the actions, the card note, the HUD and the rule captions all read it.

- **Easy**: the Normal rules, with the Ace of Hearts revealed (and out of the deck) from the start, and the fourth Ace ends the game (see above).
- **Normal**: tokens only ever fall, and the game is won by clearing every token. The fourth Ace does not end the game: with four Aces each Salvation is a Stability check, then -1 token if Stability holds.
- **Hard**: Normal, except that a missed Salvation roll adds tokens (+1, or +2 on a natural 1).

Win rates (Monte Carlo through the real actions, see `docs/d20-mechanics-guide.md` 7.3): Easy 54.9% (95% CI 54.2-55.6%, 20,000 games), Normal 1.28% (1.17-1.39%, 40,000), Hard 0.30% (0.25-0.36%, 40,000). Hard is the SRD's <1% ruleset and Normal sits just above it; Easy is the level where escape is likely. On Normal and Hard the Kings end about 83% of games and Stability about 16%; on Easy the fourth Ace wins 54% and the Kings take 42%.

### Card Types

1. **Primary Success (Salvation)** - Ace of Hearts
   - Unlocks Salvation checks
   - First Ace sets threshold to 17 (20% win chance)
   - Odd rank, so it also triggers a Stability check

2. **Failure Counter** - All 4 Kings
   - Revealing all 4 = instant game over
   - Escalating existential threat

3. **Narrative (Abilities)** - Remaining 3 Aces
   - Reflective moments, emotional beats
   - Each Ace improves Salvation threshold
   - Aces are odd ranks, so every Ace (Ace of Hearts included) triggers a Stability check, unless a Narrative card carries `skip-damage`
   - The fourth Ace (whichever suit comes last) ends the game on Easy: survive its Stability check and the game is won (the ending's cause line reads "The fourth Ace was revealed."); on Normal and Hard it only removes the Salvation target
   - Optional special modifiers (skip-damage, return-king)

4. **Challenge** - Ranks 3, 5, 7, 9 - 16 cards
   - Trigger Stability checks (d20 roll)
   - Loss comes from the roll, not the card: natural 1 = -3 (+ Surreal), 2-5 = -2, 6-10 = -1, 11-19 = 0
   - Natural 20: no loss, +1 Stability (max 20) + Lucid state

5. **Event** - Even cards (2, 4, 6, 8, 10, J, Q) - 28 cards
   - **Usually** safe from Stability checks
   - Respite, discovery, world-building

### Progressive Rule Teaching

Per SRD, rules should be revealed **through play**, not presented upfront. Card prompts teach mechanics naturally.

### Random Number Generation

All randomness goes through `src/lib/services/random.js`:

```javascript
import { rollDie, rollAdvantage, rollDisadvantage } from '$lib/services/random.js';

// Standard roll
const roll = rollDie(20); // 1-20

// Advantage (Lucid)
const lucidRoll = rollAdvantage(20); // 2d20 keep high

// Disadvantage (Surreal)
const surrealRoll = rollDisadvantage(20); // 2d20 keep low
```

**Testing Support:** The random service can be mocked for deterministic tests:

```javascript
import { mockDieRoll, mockDieRollSequence, resetRNG } from '$lib/services/random.js';

// Mock a single roll
mockDieRoll(20); // Next roll will be natural 20

// Mock a sequence
mockDieRollSequence([1, 10, 20]); // Next 3 rolls

// Reset to Math.random
resetRNG();
```

## Configuration Objects

**Game Configuration:**

```javascript
{
  title: "Game Title",
  subtitle: "Game Subtitle",
  introduction: { /* markdown sections */ },
  deck: [ /* 52 card objects */ ],
  options: {
    difficulty: 0, // 0 = easy (Ace of Hearts pre-revealed), 1 = normal, 2 = hard; author default (frontmatter), overridable by the player
    startingTokens: 10, // Number of tokens to start with
    diceTheme: "pinkdreams"  // Dice theme (user can change in settings)
  }
}
```

**Note:** Difficulty has an author default (`difficulty: easy|normal|hard` in the `.game.md` frontmatter, Normal if absent) and a player override ("Game default", "Normal", "Easy" or "Hard" in the settings modal). Precedence: frontmatter < player setting < explicit `options` passed to `startGame`. Users can also change dice theme.

**Card Object:**

```javascript
{
  card: "7",              // Card rank
  suit: "hearts",         // hearts, diamonds, clubs, spades
  type: "challenge",      // primary-success, failure-counter, narrative, challenge, event
  modifier: null,         // null, "skip-damage", "return-king"
  description: "Short description",
  story: "Full narrative text (markdown supported)",
  image: null             // or { src, alt }: optional picture, a markdown image line in the card body
}
```

## Important Files

### Core State Management

- `src/lib/stores/gameStore.svelte.js` - Core game state (Svelte 5 runes)
- `src/lib/stores/gameActions.svelte.js` - All game actions and mutations
- `src/lib/stores/gameInit.js` - Game initialization
- `src/lib/stores/transitions.js` - State transition graph
- `src/lib/stores/customGames.js` - Uploaded games (localStorage)
- `src/lib/stores/gameSources.svelte.js` - GitHub game sources and their cached games
- `src/lib/services/githubGames.js` - The source string and one check through GitHub's API

### Game Mechanics

- `src/lib/services/random.js` - Centralized RNG service (mockable for testing)
- `src/lib/stores/cardDrawing.test.js` - Card drawing logic tests (D20 system)
- `src/lib/stores/gameBalance.test.js` - Game balance tests (D20 system)
- `src/lib/stores/diceStore.svelte.js` - 3D dice visualization with DiceBox

### Parsing

- `src/lib/parsers/markdownParser.js` - Markdown format parser
- `src/lib/parsers/markdownParser.test.js` - Parser tests

### Configuration

- `src/lib/configuration/DiceThemes.js` - Dice theme configuration

### Entry Points

- `src/lib/index.js` - Main library exports
- `src/lib/components/Game.svelte` - Root game component
- `src/lib/components/GameSelector.svelte` - Game selection component

## Package Publishing

This is a published npm package: `@dimm-city/dc-solo-rpg`

**Exports:**

```javascript
export { Game, GameSelector } from '@dimm-city/dc-solo-rpg';
export { gameState, getCurrentScreen, getGameStats } from '@dimm-city/dc-solo-rpg';
export * from '@dimm-city/dc-solo-rpg'; // All game actions
```

**Build:**

```bash
npm run build    # Builds to dist/
npm run package  # Prepares for publishing
```

**Package Contents:**

- `dist/` directory only (no tests, no routes)
- Type definitions included
- Svelte component exports

## Development Workflow

1. **Make changes** to `src/lib/` files
2. **Run tests**: `npm run test:unit`
3. **Check types**: `npm run check`
4. **Format code**: `npm run format`
5. **Test in demo**: `npm run dev`
6. **Build package**: `npm run build`

## Common Patterns

### Adding a New Game Action

```javascript
// src/lib/stores/gameActions.svelte.js
export const myAction = () => {
	// Mutate gameState directly
	gameState.someValue = newValue;

	// Trigger transition if needed
	transitionTo('newState');

	// Log for debugging
	logger.debug('[myAction] Description', gameState);
};
```

### Adding a New Component

```svelte
<!-- src/lib/components/MyComponent.svelte -->
<script>
	import { gameState } from '$lib/stores/gameStore.svelte.js';
	import { myAction } from '$lib/stores/gameActions.svelte.js';

	// Access reactive state
	$: value = gameState.someValue;
</script>

<button on:click={myAction}>
	Value: {value}
</button>
```

### Adding Tests

```javascript
// src/lib/stores/myFeature.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { gameState } from './gameStore.svelte.js';
import { myAction } from './gameActions.svelte.js';

describe('My Feature', () => {
	beforeEach(() => {
		// Reset gameState or set up test conditions
	});

	it('should do something', () => {
		myAction();
		expect(gameState.someValue).toBe(expectedValue);
	});
});
```

## Animation Patterns & Best Practices (Phase 2 Learnings)

### Animation Constants System (the standard)

**Key File:** `src/lib/constants/animations.js`, the one token set for JS and CSS.
`animationTokensCss()` renders the same values as custom properties on `:root` (from
`src/routes/+layout.svelte`); `styles.css` defines no motion numbers of its own.

| JS (`ANIMATION_DURATION`) | CSS                    | Value   | Use                                 |
| ------------------------- | ---------------------- | ------- | ----------------------------------- |
| `STATE` (= `FAST`)        | `--dur-state`          | 120ms   | Hover, press, chip or label change  |
| `ENTER` (= `NORMAL`)      | `--dur-enter`          | 200ms   | Enter/exit, screen and page swaps   |
| `OVERLAY` (= `SLOW`)      | `--dur-overlay`        | 300ms   | A dialog or overlay opening         |
| `BEAT`                    | `--dur-beat`           | 400ms   | A held moment (King ignite, unlock) |
| `SEQUENCE_MAX`            | `--dur-sequence-max`   | 1.5s    | Longest staged sequence             |
| `AMBIENT`, `AMBIENT_SLOW` | `--dur-ambient(-slow)` | 4s / 8s | The only ambient loop periods       |
| `RESULT_HOLD`             | (none)                 | 2s      | A result holds, then moves on       |
| `DEAL_HOLD`, `DEAL_BEAT`  | (none)                 | 3s / 1s | Task roll result to the first card  |
| `DICE_SINK`               | `--dur-dice-sink`      | 800ms   | Landed dice sink and fade (in-out)  |
| `DRAW_PAUSE`              | (none)                 | 100ms   | Gap before the next card is drawn   |

```javascript
import { ANIMATION_DURATION, ANIMATION_EASING, Z_INDEX } from '$lib/constants/animations.js';

in:fade={{ duration: ANIMATION_DURATION.ENTER }} // 200ms
```

```css
transition: transform var(--dur-state) var(--ease-enter); /* 120ms state change */
```

- **Easing**: `--ease-enter` (cubic out) for entering, `--ease-exit` (cubic in) for leaving;
  `ANIMATION_EASING` keeps MECHANICAL, EASE_OUT, CUBIC_OUT, CUBIC_IN, QUINT_OUT
- **Distance**: an entering element rises at most 8px (`--rise-enter`)
- **Loops**: at most one ambient loop per screen (the `NeuralBackground` motes), paused under
  overlays, in hidden tabs and under reduced motion; CTA glows are static. Alert loops (critical
  Stability, lit Kings) are the only other loops.
- **Older names** (`FAST`, `NORMAL`, `SLOW`, `CARD_DISMISS`, `DICE_*`, `--transition-*`,
  `--anim-*`) still work; never rename or remove an export.
- **Z-Index**: BACKGROUND, CONTENT, STATUS_DISPLAY, FOG_OVERLAY, MODAL, DICE_ROLLING, etc.

### Sequential Animation Pattern

**Problem:** Card dismissal causing jarring transitions
**Solution:** Async/await pattern for smooth sequencing

```javascript
async function handleDismiss() {
	if (animationStage !== 'revealed') return;

	// 1. The card lifts away (220ms; instant under reduced motion)
	animationStage = 'dismissing';
	await sleep(reducedMotion() ? 0 : DISMISS_MS);

	// 2. Notify the parent (the state transition), then reset the card
	onconfirmcard();
	animationStage = 'idle';
	card = null;

	// 3. More cards this round: the next one is drawn after the draw pause
	//    (ANIMATION_DURATION.DRAW_PAUSE, 100ms: card to card in about 0.57s); a tap or Space
	//    during the pause draws it at once, once
	triggerAutoDrawIfNeeded();
}
```

**Key Principle:** Complete visual animation → Trigger next state → Reset → Brief pause before the next item.
`ANIMATION_DURATION.CARD_DISMISS` (600ms) is an older name the card no longer uses.

**Applies to:**

- Card dismissal (CardDeck.svelte)
- Modal transitions
- State changes requiring smooth hand-off

### Z-Index Choreography Pattern (dice)

**Goal:** dice are thrown on top of everything, then sink beneath the board once they land.

```css
.dice-container.rolling {
	z-index: 1000; /* above the header, HUD, title and button; dialogs and menus stay above */
}
.dice-container {
	z-index: -10; /* behind the page content the moment the sink starts */
	opacity: 0;
	transform: translateY(var(--rise-enter)) scale(0.9);
	filter: brightness(0.3);
	/* No z-index in the transition list: it drops at once, then the dice sink, darken and fade */
	transition:
		transform var(--dur-dice-sink) var(--ease-dice-sink),
		filter var(--dur-dice-sink) var(--ease-dice-sink),
		opacity var(--dur-dice-sink) var(--ease-dice-sink);
}
```

**Key Principle:** drop the z-index first, then animate. The HUD, title, button and result line
are in front of the dice for the whole sink, so the result line is never covered. The sink is
`DICE_SINK` (800ms, ease-in-out `ANIMATION_EASING.DICE_SINK`): slow enough to see the dice settle
and leave. Under reduced motion there is no throw (the number shows in a d20 outline) and the
sink is a plain 350ms fade (`DICE_SINK_REDUCED`, `--dur-dice-sink-reduced`).

**Applies to:**

- Dice (`src/routes/+layout.svelte`, `diceStore.rollDice`)

### OverlayModal Reusable Pattern

**File:** `src/lib/components/OverlayModal.svelte`

Standard 200ms modal with fog overlay, used project-wide:

```svelte
<script>
	import OverlayModal from '$lib/components/OverlayModal.svelte';
	let showModal = false;
</script>

<OverlayModal isOpen={showModal} onClose={() => (showModal = false)}>
	<div>Modal content here</div>
</OverlayModal>
```

**Features:**

- 200ms entrance/exit (7x faster than original 1400ms)
- Fog overlay + modal scale simultaneously
- `inert` + `aria-hidden` coordination
- Escape key support
- Click-outside-to-close

**Performance:** Modal opening went from feeling sluggish to instant (4.83/5 → 5.0/5 rating)

### Directional Slide Pattern

**File:** `src/lib/components/StoryMode.svelte`

Moving between rounds, the incoming round slides 16px in from the side it comes from (200ms,
`ANIMATION_DURATION.ENTER`, cubic out) while the outgoing one fades in 120ms (`STATE`), so the
swap never reads as a blank. Under reduced motion both are instant.

```javascript
function roundIn(_node, { direction }) {
	if (reducedMotion()) return { duration: 0 };
	return {
		duration: ANIMATION_DURATION.ENTER,
		easing: cubicOut,
		css: (t, u) => `opacity: ${t}; transform: translateX(${u * 16 * direction}px);`
	};
}
```

```svelte
{#key nav.currentRoundIndex}
	<div in:roundIn={{ direction: nav.direction }} out:roundOut><!-- Round content --></div>
{/key}
```

**Key Principle:** Direction tells the reader where they are going; keep the exit shorter than the
entrance. (`ANIMATION_DURATION.ROUND_TRANSITION` is an older name, kept for compatibility.)

### Animation Design Principles

**Mechanical/Ethereal Aesthetic:**

- ✅ Use: `cubic-bezier(0.4, 0, 0.6, 1)`, `ease-out`, `cubic-out`
- ❌ Avoid: Bounce, spring, elastic effects
- ⏱️ Timing: 120ms state, 200ms enter/exit, 300ms overlay, 400ms beat, 1.5s max sequence

**Performance:**

- Use GPU-accelerated properties: `transform`, `opacity`, `filter`
- Avoid: `width`, `height`, `top`, `left`, `margin`, `padding`
- Target: 60fps on desktop, ≥30fps on mobile with throttling

**Accessibility:**

- Always include `prefers-reduced-motion` support
- Coordinate `inert` with `aria-hidden` on modals
- Ensure keyboard navigation works during/after animations

### Animation Style Guide

**Complete documentation:** `docs/animation-style-guide.md` (the v2 table at the top is the
standard)

Covers:

- Duration decision trees
- 6 production-ready code patterns
- 50+ point testing checklist
- Anti-patterns with examples
- Performance guidelines
- Accessibility patterns
- Component library reference
- Quick reference table

**Use this guide when:**

- Adding new animations
- Refactoring existing animations
- Reviewing animation code
- Teaching animation patterns to new developers

## Supertonic TTS Integration

The project includes **Supertonic Neural TTS** - a fast, on-device text-to-speech system that runs **entirely in the browser** via ONNX Runtime Web. There is no server-side TTS endpoint and no `src/routes/api/`.

### Overview

- **Model**: Supertone/supertonic (66M parameters)
- **Architecture**: 4-stage diffusion-based TTS pipeline
- **Runtime**: `onnxruntime-web` (execution providers: `webgpu`, falling back to `wasm`)
- **License**: OpenRAIL-M (model), MIT (code)
- **Processing**: Client-side only, in `SupertonicTTSProvider`

**4-Stage Pipeline** (four ONNX sessions created in `_loadModels()`):

1. **Duration Predictor** (`duration_predictor.onnx`) - Predicts durations from text
2. **Text Encoder** (`text_encoder.onnx`) - Generates semantic embeddings
3. **Vector Estimator** (`vector_estimator.onnx`) - Diffusion model for the latent (default 5 denoising steps, `totalStep`)
4. **Vocoder** (`vocoder.onnx`) - Converts latent to an audio waveform

### Where Assets Load From

Nothing is bundled in the package or served from `static/`. At initialization the provider fetches, from `config.assetsPath` (default `https://huggingface.co/Supertone/supertonic/resolve/main`):

- `onnx/tts.json` and `onnx/unicode_indexer.json` (model config and character indexer)
- `onnx/*.onnx` (the four models above)
- `voice_styles/{F1,F2,M1,M2}.json` (pre-extracted voice style embeddings)

The ONNX Runtime Web WASM files are loaded from jsDelivr (`ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.2/dist/'`). Keep that version in step with the `onnxruntime-web` dependency. `static/assets/` only holds the upstream model card (`README.md`), `LICENSE` and `config.json`.

### Key Files

- `src/lib/services/tts/providers/SupertonicTTSProvider.js` - The provider: model loading, inference (`UnicodeProcessor`, `TextToSpeech`), text chunking and Web Audio playback
- `src/lib/services/tts/providers/BaseTTSProvider.js` - Base class the provider extends
- `src/lib/services/tts/providers/index.js` - Registers the provider under the `supertonic` key
- `src/lib/services/tts/textToSpeech.js` - TTS service that selects and drives the active provider

### Usage

```javascript
import { SupertonicTTSProvider } from '$lib/services/tts/providers/SupertonicTTSProvider.js';

const provider = new SupertonicTTSProvider();
await provider.initialize({ voice: 'F1', speed: 1.0 }); // downloads models; can take a while
await provider.speak('Hello world');
```

- Voices: `F1`, `F2`, `M1`, `M2` (`SUPERTONIC_VOICES`)
- Speed: defaults to 1.05
- Text is split into chunks of up to 300 characters (`maxChunkLength`), synthesized per chunk, and played through the Web Audio API
- `pause()`/`resume()` suspend and resume the `AudioContext`; `stop()` stops the current source

### Implementation Notes

- Step tensors (`total_step`, `current_step`) must be `Float32Array`, not int
- Vector estimator returns `denoised_latent`; vocoder returns `wav_tts`
- Text IDs are `int64` (`BigInt64Array`), built from `unicode_indexer.json`
- Style tensors: `style_ttl` is `[1, 50, 256]`, `style_dp` is `[1, 8, 16]`

## Notes

- **Node version**: Requires Node.js >= 20.0.0 (use `nvm use` if available)
- **Svelte version**: 5.43.5 (uses modern runes API)
- **Package scope**: `@dimm-city/dc-solo-rpg`
- **License**: CC-BY-4.0 (Creative Commons Attribution)
- **Attribution required**: See LICENSE file for Wretched and Alone attribution requirements

## Git Branches

- `main` - Production branch (use for PRs by default)
- `dev` - Development branch (current branch)

## Attribution

This work is based on The Wretched (http://loottheroom.itch.io/wretched), product of Chris Bissette and Loot The Room, and licensed under the Creative Commons Attribution 3.0 Unported license (http://creativecommons.org/licenses/by/3.0/).

Projects using DC Solo RPG must include proper attribution. See LICENSE file for details.
