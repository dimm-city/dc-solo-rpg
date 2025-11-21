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
- **Tokens**: Start with 10. Remove all to win.
- **Aces Revealed**: 0-4. Determines Salvation success threshold.

### D20 Rolling Mechanics

- **Standard Roll**: 1d20 for all checks
- **Lucid State (Advantage)**: Roll 2d20, keep highest. Triggered by natural 20 on Stability checks.
- **Surreal State (Disadvantage)**: Roll 2d20, keep lowest. Triggered by natural 1 on Stability checks.

### Salvation System (Win Condition)

Drawing the Ace of Hearts unlocks Salvation checks. Each subsequent Ace improves success rate:

- **1 Ace**: Roll ≥17 to remove 1 token (20% success, 5% chance)
- **2 Aces**: Roll ≥14 to remove 1 token (35% success)
- **3 Aces**: Roll ≥11 to remove 1 token (50% success)
- **4 Aces**: Automatic success (100% success)

**Graduated Token Changes:**

- Natural 1: +2 tokens (critical failure)
- Below threshold: +1 token (failure)
- At/above threshold: -1 token (success)
- Natural 20: -2 tokens (critical success)

### Card Types

1. **Primary Success (Salvation)** - Ace of Hearts
   - Unlocks Salvation checks
   - First Ace sets threshold to 17 (20% win chance)

2. **Failure Counter** - All 4 Kings
   - Revealing all 4 = instant game over
   - Escalating existential threat

3. **Narrative (Abilities)** - Remaining 3 Aces
   - Reflective moments, emotional beats
   - Each Ace improves Salvation threshold
   - Optional special modifiers (skip-damage, return-king)

4. **Challenge** - Odd cards (3, 5, 7, 9) - 16 cards
   - **Usually** trigger Stability checks (d20 roll)
   - Failure: Lose Stability equal to card rank
   - Natural 20: +1 Stability (max 20) + Lucid state
   - Natural 1: Surreal state

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
    difficulty: 0, // 0 = easy (Ace of Hearts pre-revealed), 1 = normal
    startingTokens: 10, // Number of tokens to start with
    diceTheme: "pinkdreams"  // Dice theme (user can change in settings)
  }
}
```

**Note:** Difficulty is controlled by the game author in the config frontmatter, not by user settings. Users can only change dice theme.

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

- `src/lib/services/random.js` - Centralized RNG service (mockable for testing)
- `src/lib/stores/cardDrawing.test.js` - Card drawing logic tests (D20 system)
- `src/lib/stores/gameBalance.test.js` - Game balance tests (D20 system)
- `src/lib/stores/diceStore.svelte.js` - 3D dice visualization with DiceBox

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

## Animation Patterns & Best Practices (Phase 2 Learnings)

### Animation Constants System

**Key File:** `src/lib/constants/animations.js`

All animations use centralized constants to ensure consistency:

```javascript
import { ANIMATION_DURATION, ANIMATION_EASING, Z_INDEX } from '$lib/constants/animations.js';

// In Svelte transitions
in:fade={{ duration: ANIMATION_DURATION.NORMAL }} // 200ms
in:scale={{ duration: ANIMATION_DURATION.SLOW, easing: cubicOut }} // 300ms
```

**29 Constants Available:**

- **Durations**: FAST (150ms), NORMAL (200ms), SLOW (300ms), CARD_DISMISS (600ms), etc.
- **Easing**: MECHANICAL, EASE_OUT, CUBIC_OUT, QUINT_OUT, etc.
- **Z-Index**: BACKGROUND, CONTENT, STATUS_DISPLAY, FOG_OVERLAY, MODAL, DICE_ROLLING, etc.

**Benefits:**

- No magic numbers
- Consistent timing across application
- Easy to adjust globally
- Self-documenting code

### Sequential Animation Pattern

**Problem:** Card dismissal causing jarring transitions
**Solution:** Async/await pattern for smooth sequencing

```javascript
async function onDismiss() {
	if (animationStage !== 'revealed') return;

	// 1. Start dismiss animation (600ms)
	animationStage = 'dismissing';
	await sleep(ANIMATION_DURATION.CARD_DISMISS);

	// 2. Reset card state FIRST
	animationStage = 'idle';
	particles = [];
	card = null;

	// 3. Small pause for visual clarity (100ms)
	await sleep(100);

	// 4. NOW notify parent - triggers state transition
	onconfirmcard();
}
```

**Key Principle:** Complete visual animation → Reset state → Brief pause → Trigger next state

**Applies to:**

- Card dismissal (CardDeck.svelte)
- Modal transitions
- State changes requiring smooth hand-off

### Z-Index Choreography Pattern

**Problem:** Dice fade-out causing visual "popping"
**Solution:** Delayed z-index transition

```css
.dice-container:not(.rolling):not(.hidden) {
	z-index: 9999; /* Keep high during fade */
	opacity: 0;
	transform: scale(0.9);
	filter: brightness(1) blur(0px);
	transition:
		opacity 250ms ease-out,
		transform 250ms ease-out,
		filter 250ms ease-out,
		z-index 0s 250ms; /* Delay z-index drop until after fade */
}
```

**Key Principle:** `transition: z-index 0s <duration>` delays z-index change until visual animation completes

**Applies to:**

- Dice fade-out (+layout.svelte)
- Any layered element that needs to fade while maintaining z-order

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

### Crossfade Transition Pattern

**File:** `src/lib/components/StoryMode.svelte`

Smooth navigation between rounds using Svelte's crossfade:

```javascript
import { crossfade } from 'svelte/transition';
import { cubicOut } from 'svelte/easing';

const [send, receive] = crossfade({
	duration: ANIMATION_DURATION.ROUND_TRANSITION, // 300ms
	easing: cubicOut
});
```

```svelte
<div
	class="round-wrapper"
	in:receive={{ key: currentRoundIndex }}
	out:send={{ key: currentRoundIndex }}
>
	<!-- Round content -->
</div>
```

**Key Principle:** Use crossfade for navigating between similar content items (rounds, tabs, etc.)

### Animation Design Principles

**Mechanical/Ethereal Aesthetic:**

- ✅ Use: `cubic-bezier(0.4, 0, 0.6, 1)`, `ease-out`, `cubic-out`
- ❌ Avoid: Bounce, spring, elastic effects
- ⏱️ Timing: 150-300ms for most transitions, up to 600ms for card dismissal

**Performance:**

- Use GPU-accelerated properties: `transform`, `opacity`, `filter`
- Avoid: `width`, `height`, `top`, `left`, `margin`, `padding`
- Target: 60fps on desktop, ≥30fps on mobile with throttling

**Accessibility:**

- Always include `prefers-reduced-motion` support
- Coordinate `inert` with `aria-hidden` on modals
- Ensure keyboard navigation works during/after animations

### Animation Style Guide

**Complete documentation:** `docs/animation-style-guide.md` (1,606 lines)

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

The project includes **Supertonic Neural TTS** - a high-performance, on-device text-to-speech system running server-side via ONNX Runtime Node.

### Overview

- **Model**: Supertone/supertonic (66M parameters)
- **Architecture**: 4-stage diffusion-based TTS pipeline
- **Performance**: 0.012 RTF on M4 Pro CPU (83x faster than real-time)
- **License**: OpenRAIL-M (model), MIT (code)
- **Processing**: Server-side via SvelteKit API endpoint

### Official Resources

**GitHub Implementation:**
- Node.js Example: https://github.com/supertone-inc/supertonic/blob/main/nodejs/example_onnx.js
- Helper Functions: https://github.com/supertone-inc/supertonic/blob/main/nodejs/helper.js
- Documentation: https://github.com/supertone-inc/supertonic/blob/main/nodejs/README.md
- Package Info: https://github.com/supertone-inc/supertonic/blob/main/nodejs/package.json

**Model Resources:**
- HuggingFace Hub: https://huggingface.co/Supertone/supertonic
- Interactive Demo: https://huggingface.co/spaces/Supertone/supertonic

### Architecture

**4-Stage Pipeline:**

1. **Duration Predictor** - Predicts phoneme durations from text
2. **Text Encoder** - Generates semantic embeddings
3. **Vector Estimator** - Diffusion model for latent representation (5-step denoising)
4. **Vocoder** - Converts latent to audio waveform

**Key Files:**
- `src/routes/api/tts/supertonic/+server.js` - Server-side API endpoint (Node.js)
- `src/lib/services/tts/providers/SupertonicTTSProvider.js` - Client-side provider (browser)
- `static/assets/onnx/` - ONNX model files (text_encoder, duration_predictor, vector_estimator, vocoder)
- `static/assets/voice_styles/` - Pre-extracted voice embeddings (F1, F2, M1, M2)
- `docs/tts-lessons-learned.md` - Implementation lessons and debugging insights

### Configuration

**Model Config** (`static/assets/onnx/tts.json`):
```javascript
{
  ttl: {
    latent_dim: 24,              // Base latent dimensionality
    chunk_compress_factor: 6     // Compression factor
  },
  ae: {
    sample_rate: 44100,          // Output sample rate
    base_chunk_size: 512,        // Base chunk size for latent
    chunk_compress_factor: 1     // Chunk compression
  }
}
```

**Calculated Values:**
- `latentDim = 24 * 6 = 144` (latent dimensionality)
- `chunkSize = 512 * 1` (audio chunk size)
- `latentLength = Math.floor((wavLength + chunkSize - 1) / chunkSize)`

### API Usage

**Endpoint:** `POST /api/tts/supertonic`

**Request:**
```javascript
{
  text: "Hello world",           // Text to synthesize
  voice: "F1",                   // Voice style (F1, F2, M1, M2)
  speed: 1.05                    // Speed multiplier (default: 1.05, range: 0.5 - 2.0)
}
```

**Response:**
```javascript
{
  audio: [...],                  // Float32Array as regular array
  sampleRate: 44100              // Audio sample rate
}
```

### Tensor Shapes

Critical tensor dimensions for ONNX models:

```javascript
// Duration Predictor inputs
text_ids: [1, 512]              // int64
text_mask: [1, 1, 512]          // float32
style_dp: [1, 8, 16]            // float32

// Text Encoder inputs
text_ids: [1, 512]              // int64
text_mask: [1, 1, 512]          // float32
style_ttl: [1, 50, 256]         // float32

// Vector Estimator inputs
noisy_latent: [1, 144, L]       // float32 (L = latent length)
text_emb: [1, 512, 128]         // float32 (from encoder)
style_ttl: [1, 50, 256]         // float32
text_mask: [1, 1, 512]          // float32
latent_mask: [1, 1, L]          // float32
total_step: [1]                 // float32 (not int!)
current_step: [1]               // float32 (not int!)

// Vector Estimator output
denoised_latent: [1, 144, L]    // float32

// Vocoder inputs
latent: [1, 144, L]             // float32

// Vocoder output
wav_tts: [1, samples]           // float32
```

### Implementation Notes

**Diffusion Loop:**
- Default 5 steps (configurable via `totalStep`)
- Higher steps = better quality but slower
- Each step refines the latent representation
- Use Float32Array for step tensors (not BigInt64Array!)

**Output Keys:**
- Vector estimator returns `denoised_latent` (not `latent`)
- Vocoder returns `wav_tts` (not `audio` or `wav`)

**Text Processing:**
- Uses unicode_indexer.json for character-to-phoneme mapping
- Max text length: 512 characters
- Padding: 0-filled to maxLength

**Voice Styles:**
- Pre-extracted embeddings in JSON format
- `style_ttl` for encoder (text-to-latent)
- `style_dp` for duration predictor

### Client Integration

The SupertonicTTSProvider makes API calls and uses Web Audio API for playback:

```javascript
import { SupertonicTTSProvider } from '$lib/services/tts/providers/SupertonicTTSProvider.js';

const provider = new SupertonicTTSProvider();
await provider.initialize({ voice: 'F1', speed: 1.0 });
await provider.speak('Hello world');
```

**Features:**
- Text chunking for long inputs (200 chars per chunk)
- Web Audio API playback
- Pause/resume support (context suspension)
- Stop/cleanup methods

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
