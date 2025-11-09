# Neural Dice Interface - Usage Guide

## Overview

The NeuralDiceInterface component provides a cyberpunk-themed wrapper around the existing 3D dice roller with neural scan effects, particle systems, and animated state transitions.

## File Locations

- **Main Component**: `/home/founder3/code/dimm-city/dc-solo-rpg/src/lib/components/NeuralDiceInterface.svelte`
- **Updated Component**: `/home/founder3/code/dimm-city/dc-solo-rpg/src/lib/components/ThreeJSDiceBoxRoller.svelte`

## Basic Usage

```svelte
<script>
  import NeuralDiceInterface from '$lib/components/NeuralDiceInterface.svelte';

  let diceInterface;

  async function handleRollStart() {
    console.log('Dice roll started');
  }

  async function handleRollComplete(event) {
    console.log('Dice roll complete:', event.detail.result);
  }

  async function handleResultAcknowledged(event) {
    console.log('Result acknowledged:', event.detail.result);
    // Continue with game logic
  }

  // Programmatically trigger a roll
  async function triggerRoll() {
    const result = await diceInterface.roll();
    console.log('Roll result:', result);
  }
</script>

<NeuralDiceInterface
  bind:this={diceInterface}
  header="INITIATE PROBABILITY SCAN"
  on:rollstart={handleRollStart}
  on:rollcomplete={handleRollComplete}
  on:resultacknowledged={handleResultAcknowledged}
/>
```

## Component API

### Props

- **`header`** (string, optional): Button text when in idle state
  - Default: `"INITIATE PROBABILITY SCAN"`

### Methods

- **`roll(values = null)`**: Programmatically trigger a dice roll
  - **Parameters**:
    - `values` (number, optional): Force a specific dice result (1-6)
  - **Returns**: Promise that resolves to the dice result (number)

### Events

- **`rollstart`**: Dispatched when a roll begins
  ```javascript
  on:rollstart={() => console.log('Roll started')}
  ```

- **`rollcomplete`**: Dispatched when dice settle with result
  ```javascript
  on:rollcomplete={(event) => console.log('Result:', event.detail.result)}
  ```

- **`resultacknowledged`**: Dispatched when user acknowledges the result
  ```javascript
  on:resultacknowledged={(event) => console.log('Acknowledged:', event.detail.result)}
  ```

## State Machine

The component follows this state flow:

```
idle → anticipating → rolling → settling → revealed → idle
```

### State Details

1. **idle**: Waiting for user interaction
   - Scan grid pulsing gently
   - Particles drifting slowly
   - Button: "INITIATE PROBABILITY SCAN"

2. **anticipating** (400ms): Preparing for roll
   - Grid accelerates
   - Particle spawn rate increases
   - Button: "INITIATING..."

3. **rolling**: Dice tumbling
   - Probability streams flowing vertically
   - Particles rushing toward edges
   - Button: "PROCESSING QUANTUM STATE..."

4. **settling** (600ms): Dice stopped, calculating
   - Bio-pulse rings expand from center
   - Particle burst effect
   - Button: "ANALYZING RESULT..."

5. **revealed**: Result displayed
   - Neural HUD overlay with result
   - Button: "ACKNOWLEDGE RESULT"
   - Waits for user to acknowledge

## Visual Effects

### Particle System
- Desktop: 50 particles max
- Tablet (≤768px): 30 particles max
- Mobile (≤450px): 15 particles max
- 60fps canvas-based rendering
- GPU-accelerated transforms

### Neural Grid
- CSS-based animated background
- Accelerates during anticipation phase
- Scanning motion during rolling

### Probability Streams
- Vertical flowing bars during roll phase
- Desktop: 10 streams
- Mobile: 5 streams

### Bio-Pulse Rings
- Expanding circles during settling phase
- Magenta colored (#d946ef)
- Two rings with 1s delay offset

### Neural Frame
- Corner brackets that light up when active
- Cyan colored (#00ffff)
- Semi-transparent overlay

## Color Scheme

The component uses the Neural Data Fragment aesthetic:

- **Neon Cyan**: `#00ffff` - Primary accent, frames, grids
- **Cyber Magenta**: `#d946ef` - Secondary accent, pulses, gradients
- **Background**: `var(--color-bg-darker, #000)` - Deep black

## Performance

- All animations use GPU-accelerated properties (transform, opacity, filter)
- Particle count adapts to screen size
- 60fps target for smooth rendering
- Efficient lifecycle management with proper cleanup

## Accessibility

### Reduced Motion Support

When `prefers-reduced-motion: reduce` is set:
- All decorative animations disabled
- Particle effects disabled
- Core functionality remains intact
- Button interactions still work

### ARIA Attributes

- All decorative elements marked with `aria-hidden="true"`
- Button has proper accessible text
- Result overlay is screen-reader friendly

## Button States

| State | Text | Appearance | Disabled |
|-------|------|------------|----------|
| idle | "INITIATE PROBABILITY SCAN" | Pulsing glow | No |
| anticipating | "INITIATING..." | Semi-transparent | Yes |
| rolling | "PROCESSING QUANTUM STATE..." | Semi-transparent | Yes |
| settling | "ANALYZING RESULT..." | Semi-transparent | Yes |
| revealed | "ACKNOWLEDGE RESULT" | Bright cyan glow | No |

## Integration Example

Replace the existing dice roller with the neural interface:

```svelte
<!-- Before -->
<ThreeJSDiceBoxRoller
  bind:this={diceRoller}
  header="Roll Dice"
  on:click={handleRoll}
/>

<!-- After -->
<NeuralDiceInterface
  bind:this={diceInterface}
  header="INITIATE PROBABILITY SCAN"
  on:rollstart={() => console.log('Rolling...')}
  on:rollcomplete={(e) => console.log('Result:', e.detail.result)}
  on:resultacknowledged={(e) => processGameAction(e.detail.result)}
/>
```

## Styling Integration

The component respects CSS custom properties from your design system:

- `--color-bg-darker`
- `--color-neon-cyan`
- `--color-cyber-magenta`
- `--color-text-primary`
- `--color-text-secondary`
- `--font-display`
- `--font-mono`
- `--space-*` (spacing scale)
- `--text-*` (typography scale)

## Mobile Responsive Breakpoints

- **Desktop**: Full effects (>768px)
- **Tablet**: Reduced particle count (≤768px)
- **Mobile**: Minimal particles, simplified effects (≤450px)

## Browser Compatibility

- Modern browsers with Canvas API support
- WebGL support required for 3D dice
- Falls back gracefully with reduced motion

## Common Patterns

### Wait for roll to complete before continuing

```svelte
<script>
  let diceInterface;
  let isProcessing = false;

  async function performGameAction() {
    if (isProcessing) return;

    isProcessing = true;
    const result = await diceInterface.roll();

    // Result is now available
    await processResult(result);

    isProcessing = false;
  }
</script>
```

### Force a specific result (for testing)

```svelte
<script>
  async function testWithSix() {
    const result = await diceInterface.roll(6);
    console.log('Forced result:', result); // Always 6
  }
</script>
```

### Listen to all events

```svelte
<NeuralDiceInterface
  on:rollstart={() => {
    console.log('Roll started');
    disableGameControls();
  }}
  on:rollcomplete={(e) => {
    console.log('Roll complete:', e.detail.result);
    updateGameState(e.detail.result);
  }}
  on:resultacknowledged={(e) => {
    console.log('Result acknowledged');
    enableGameControls();
    continueGame();
  }}
/>
```

## Troubleshooting

### Dice not visible
- Ensure `/dice` assets are available in public folder
- Check browser console for WebGL errors
- Verify canvas element is rendering

### Particles not animating
- Check if `prefers-reduced-motion` is set
- Verify canvas context is available
- Check browser console for errors

### Button not responding
- Check if component is in transitional state
- Verify no parent elements blocking pointer events
- Check for JavaScript errors in console

## Technical Notes

- Uses Svelte's `createEventDispatcher` for event handling
- Implements proper lifecycle management with `onMount` and `onDestroy`
- Canvas rendering uses `requestAnimationFrame` for 60fps
- Particle lifecycle managed efficiently to prevent memory leaks
- All timing uses promises and `async/await` for clarity
