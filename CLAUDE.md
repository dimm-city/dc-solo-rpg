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
  tower: 54,
  tokens: 10,
  deck: [],
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
[3 cards - Remaining Aces - reflective moments, bonus/help]

### Challenge
[16 cards - Odd ranks (3,5,7,9) - trigger damage checks]

### Event
[28 cards - Even ranks (2,4,6,8,10,J,Q) - safe moments]
```

**Key Concepts:**
- Writers focus on **card types**, not card identifiers
- System auto-assigns cards to the 52-card deck
- Optional special modifiers: `skip-damage`, `return-king`
- Parser: `src/lib/parsers/markdownParser.js`

**Full specification:** See `docs/game-config.md` and `docs/simplified-type-based-format.md`

### Component Architecture

**Main Components:**
- `Game.svelte` - Root game component, handles lifecycle
- `GameSelector.svelte` - Game selection interface
- `GameScreen.svelte` - Main game play screen
- `IntroScreen.svelte` - Game introduction
- `CardDeck.svelte` - Card drawing interface
- `StatusDisplay.svelte` - Game statistics display
- `ThreeJSDiceBoxRoller.svelte` - 3D dice rolling (uses @3d-dice/dice-box-threejs)

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
    expect(gameState.tower).toBe(54);
  });
});
```

**Coverage:**
```bash
npm run test:unit -- --coverage
```

## Game Mechanics (Wretched and Alone SRD)

The game implements standard Wretched and Alone mechanics:

### Card Types
1. **Primary Success (Salvation)** - Ace of Hearts
   - Activates win condition (10 tokens, roll to remove)
   - <1% win rate by design (journey matters more than victory)

2. **Failure Counter** - All 4 Kings
   - Revealing all 4 = instant game over
   - Escalating existential threat

3. **Narrative (Bonus/Help)** - Remaining 3 Aces
   - Reflective moments, emotional beats
   - Increment bonus counter (reduces damage)
   - Optional special modifiers (skip-damage, return-king)

4. **Challenge** - Odd cards (3, 5, 7, 9) - 16 cards
   - **Usually** trigger damage checks (tower pulls)
   - SRD uses "usually" to preserve designer flexibility

5. **Event** - Even cards (2, 4, 6, 8, 10, J, Q) - 28 cards
   - **Usually** safe from damage
   - Respite, discovery, world-building

### Progressive Rule Teaching
Per SRD, rules should be revealed **through play**, not presented upfront. Card prompts teach mechanics naturally.

## Configuration Objects

**Game Configuration:**
```javascript
{
  title: "Game Title",
  subtitle: "Game Subtitle",
  introduction: { /* markdown sections */ },
  deck: [ /* 52 card objects */ ],
  options: {
    difficulty: "normal", // easy, normal, hard
    diceTheme: "default"  // default, neon, etc.
  }
}
```

**Card Object:**
```javascript
{
  card: "7",              // Card rank
  suit: "hearts",         // hearts, diamonds, clubs, spades
  type: "challenge",      // primary-success, failure-counter, narrative, challenge, event
  modifier: null,         // null, "skip-damage", "return-king"
  description: "Short description",
  story: "Full narrative text (markdown supported)"
}
```

## Important Files

### Core State Management
- `src/lib/stores/gameStore.svelte.js` - Core game state (Svelte 5 runes)
- `src/lib/stores/gameActions.svelte.js` - All game actions and mutations
- `src/lib/stores/gameInit.js` - Game initialization
- `src/lib/stores/transitions.js` - State transition graph

### Game Mechanics
- `src/lib/stores/wretchedAloneMechanics.test.js` - Wretched and Alone mechanics tests
- `src/lib/stores/cardDrawing.test.js` - Card drawing logic tests
- `src/lib/stores/gameBalance.test.js` - Game balance tests
- `src/lib/stores/finalDamageRoll.test.js` - Final damage roll tests

### Parsing
- `src/lib/parsers/markdownParser.js` - Markdown format parser
- `src/lib/parsers/markdownParser.test.js` - Parser tests

### Configuration
- `src/lib/configuration/GameSettings.js` - Game settings object
- `src/lib/configuration/GameOptions.js` - Game options
- `src/lib/configuration/DifficultyLevels.js` - Difficulty configuration
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
