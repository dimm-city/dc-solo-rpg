# Neural Dice Interface - Visual Reference

## Component Layout

```
┌─────────────────────────────────────────────────────────┐
│  ┏━━━━┓                                    ┏━━━━┓       │ ← Neural Frame
│  ┃    ┃                                    ┃    ┃       │   (Corner Brackets)
│  ┗━━━━┛                                    ┗━━━━┛       │
│                                                          │
│         ╔══════════════════════════════╗                │
│         ║  PROBABILITY LOCKED          ║                │ ← Result Overlay
│         ║         【 6 】              ║                │   (Revealed State)
│         ║  QUANTUM-STATE-ABC123        ║                │
│         ╚══════════════════════════════╝                │
│                                                          │
│                    ▓▓▓▓▓▓                                │
│              ░░   ▓ DICE ▓   ░░                          │ ← 3D Dice
│                ░░ ▓▓▓▓▓▓ ░░                             │   (ThreeJS Canvas)
│               ░░░        ░░░                             │
│              ░░░░░      ░░░░░                            │ ← Bio-Pulse Rings
│             ░░░░░░░    ░░░░░░░                           │   (Settling Phase)
│                                                          │
│  ┌ ┬ ┬ ┬ ┬ ┬ ┬ ┬ ┬ ┬ ┬ ┬ ┬ ┬ ┬ ┬ ┬ ┬ ┬ ┬ ┬ ┬ ┬ ┬ ┐     │
│  │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │     │ ← Scan Grid
│  ├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤     │   (CSS Background)
│  │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │     │
│                                                          │
│    ∘  ∘     ∘    ∘   ∘     ∘   ∘    ∘                   │ ← Particles
│      ∘   ∘    ∘     ∘   ∘    ∘    ∘   ∘                 │   (Canvas Layer)
│                                                          │
│              ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┃                          │ ← Probability Streams
│              ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┃ ┃                          │   (Rolling Phase)
│              ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓                          │
│                                                          │
│  ┏━━━━┓                                    ┏━━━━┓       │
│  ┃    ┃   ╔═══════════════════════════╗   ┃    ┃       │
│  ┗━━━━┛   ║ ACKNOWLEDGE RESULT        ║   ┗━━━━┛       │ ← Button
│            ╚═══════════════════════════╝                │   (Bottom Center)
└─────────────────────────────────────────────────────────┘
```

## State Visual Reference

### State 1: IDLE
```
┌─────────────────────────┐
│   ┌ ┬ ┬ ┬ ┬ ┬ ┬ ┬ ┬ ┐   │  Grid: Gentle pulsing
│   ├─┼─┼─┼─┼─┼─┼─┼─┼─┤   │  Opacity: 0.3 ↔ 0.5
│   │ │ │ │ │ │ │ │ │ │   │  Size: 40px ↔ 42px
│                         │
│    ∘   ∘    ∘    ∘     │  Particles: Slow drift
│  ∘    ∘  ∘    ∘   ∘    │  Spawn rate: 0.1
│                         │  Movement: Random float
│                         │
│  ╔═══════════════════╗  │  Button: Pulsing glow
│  ║ INITIATE SCAN     ║  │  Color: Cyan/Magenta
│  ╚═══════════════════╝  │  State: Clickable
└─────────────────────────┘
```

### State 2: ANTICIPATING (400ms)
```
┌─────────────────────────┐
│   ┌┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┐   │  Grid: Accelerating
│   ├┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┤   │  Opacity: 0.3 → 0.7
│   │││││││││││││││││││   │  Size: 40px → 30px
│                         │
│   ∘∘ ∘∘ ∘∘ ∘∘ ∘∘ ∘∘    │  Particles: Speeding up
│  ∘∘ ∘∘ ∘∘ ∘∘ ∘∘ ∘∘ ∘∘  │  Spawn rate: 0.3
│                         │  Movement: Faster
│                         │
│  ╔═══════════════════╗  │  Button: Semi-transparent
│  ║ INITIATING...     ║  │  Color: Faded
│  ╚═══════════════════╝  │  State: Disabled
└─────────────────────────┘
```

### State 3: ROLLING (Variable)
```
┌─────────────────────────┐
│   ┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃   │  Streams: Flowing down
│   ┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃   │  Color: Cyan/Magenta
│   ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓   │  Speed: 2-5px/frame
│                         │
│        ▓▓▓▓▓            │  Dice: Tumbling
│      ▓▓  ⚄  ▓▓          │  State: Rolling
│        ▓▓▓▓▓            │  Physics: Active
│                         │
│  ∘∘∘ ∘∘∘ ∘∘∘ ∘∘∘ ∘∘∘   │  Particles: High activity
│   ∘∘∘ ∘∘∘ ∘∘∘ ∘∘∘ ∘∘∘  │  Spawn rate: 0.4
│                         │
│  ╔═══════════════════╗  │  Button: Processing
│  ║ PROCESSING...     ║  │  Color: Semi-transparent
│  ╚═══════════════════╝  │  State: Disabled
└─────────────────────────┘
```

### State 4: SETTLING (600ms)
```
┌─────────────────────────┐
│                         │
│        ╔═══════╗        │  Bio-Pulse: Expanding
│      ╱           ╲      │  Size: 100px → 400px
│     │    ▓▓▓▓▓    │     │  Color: Magenta
│     │  ▓▓  ⚅  ▓▓  │     │  Opacity: 0.8 → 0
│     │    ▓▓▓▓▓    │     │
│      ╲           ╱      │  Dice: Stopped
│        ╚═══════╝        │  Result: Known
│                         │
│  ∘∘∘∘∘∘∘∘→ ← ∘∘∘∘∘∘∘∘  │  Particles: Rush center
│   ∘∘∘∘∘∘→   ←∘∘∘∘∘∘∘   │  Spawn rate: 0.5
│                         │  Movement: Converging
│                         │
│  ╔═══════════════════╗  │  Button: Analyzing
│  ║ ANALYZING...      ║  │  Color: Semi-transparent
│  ╚═══════════════════╝  │  State: Disabled
└─────────────────────────┘
```

### State 5: REVEALED (Infinite)
```
┌─────────────────────────┐
│  ╔═══════════════════╗  │  HUD: Result display
│  ║ PROBABILITY LOCKED║  │  Border: Cyan glow
│  ║                   ║  │  Shadow: Multi-layer
│  ║      【 6 】      ║  │  Font: 3rem Orbitron
│  ║                   ║  │  Pulse: Brightness
│  ║  QUANTUM-ABC123   ║  │  ID: Timestamp-based
│  ╚═══════════════════╝  │
│                         │
│        ▓▓▓▓▓            │  Dice: Settled
│      ▓▓  ⚅  ▓▓          │  State: Static
│        ▓▓▓▓▓            │  Result: 6
│                         │
│    ∘   ∘    ∘    ∘     │  Particles: Calm
│  ∘    ∘  ∘    ∘   ∘    │  Spawn rate: 0.1
│                         │  Movement: Gentle
│                         │
│  ╔═══════════════════╗  │  Button: Ready
│  ║ ACKNOWLEDGE       ║  │  Color: Bright cyan
│  ╚═══════════════════╝  │  State: Clickable
└─────────────────────────┘
```

## Color Palette

### Primary Colors
```
┌────────────────┬──────────┬─────────────┐
│ Color          │ Hex      │ Usage       │
├────────────────┼──────────┼─────────────┤
│ Neon Cyan      │ #00ffff  │ Accents     │
│ Cyber Magenta  │ #d946ef  │ Highlights  │
│ Deep Black     │ #000000  │ Background  │
│ Pure White     │ #ffffff  │ Text        │
└────────────────┴──────────┴─────────────┘
```

### Gradients
```
Button:
  linear-gradient(135deg, #d946ef 0%, #00ffff 100%)

Result HUD Background:
  linear-gradient(135deg,
    rgba(10, 10, 10, 0.95) 0%,
    rgba(26, 26, 26, 0.9) 50%,
    rgba(10, 10, 10, 0.95) 100%
  )
```

## Typography

### Button Text
```
Font: Orbitron (monospace)
Size: 1rem (16px)
Weight: 700 (bold)
Transform: UPPERCASE
Spacing: 0.05em (wider)
Color: #ffffff
```

### Result Value
```
Font: Orbitron (monospace)
Size: 3rem (48px)
Weight: 700 (bold)
Color: #ffffff
Shadow:
  0 0 20px #d946ef (magenta glow)
  0 0 40px #00ffff (cyan glow)
```

### Result Label
```
Font: Orbitron (monospace)
Size: 0.75rem (12px)
Transform: UPPERCASE
Spacing: 0.1em (wider)
Color: #00ffff (cyan)
Opacity: 0.8
```

## Animation Timings

### State Transitions
```
┌───────────────┬──────────┬────────────┐
│ Transition    │ Duration │ Easing     │
├───────────────┼──────────┼────────────┤
│ Anticipating  │ 400ms    │ ease-in    │
│ Rolling       │ Variable │ dice-box   │
│ Settling      │ 600ms    │ ease-out   │
│ Revealed      │ Infinite │ -          │
└───────────────┴──────────┴────────────┘
```

### Grid Animations
```
┌──────────────┬──────────┬──────────────┐
│ Animation    │ Duration │ Loop         │
├──────────────┼──────────┼──────────────┤
│ grid-pulse   │ 4s       │ Infinite     │
│ accelerate   │ 0.8s     │ Once         │
│ grid-scan    │ 2s       │ Infinite     │
└──────────────┴──────────┴──────────────┘
```

### Particle Behavior
```
┌─────────────┬───────────┬──────────────┐
│ State       │ Spawn     │ Movement     │
├─────────────┼───────────┼──────────────┤
│ Idle        │ 0.1/frame │ Slow drift   │
│ Anticipate  │ 0.3/frame │ Faster       │
│ Rolling     │ 0.4/frame │ Rapid        │
│ Settling    │ 0.5/frame │ Rush center  │
│ Revealed    │ 0.1/frame │ Slow drift   │
└─────────────┴───────────┴──────────────┘
```

## Responsive Breakpoints

### Desktop (>768px)
```
┌─────────────────────────────────────┐
│                                     │
│  Frame corners: 60x60px             │
│  Max particles: 50                  │
│  Probability streams: 10            │
│  Grid size: 40x40px                 │
│  Min height: 600px                  │
│                                     │
└─────────────────────────────────────┘
```

### Tablet (≤768px)
```
┌───────────────────────────┐
│                           │
│  Frame corners: 40x40px   │
│  Max particles: 30        │
│  Probability streams: 10  │
│  Grid size: 30x30px       │
│  Min height: 500px        │
│                           │
└───────────────────────────┘
```

### Mobile (≤450px)
```
┌─────────────────────┐
│                     │
│  Corners: 30x30px   │
│  Particles: 15      │
│  Streams: 5         │
│  Grid: 25x25px      │
│  Height: 450px      │
│                     │
└─────────────────────┘
```

## Layer Stack (Z-Index)

```
Layer 6: Button (z-index: 6)
         └─ Always on top, clickable
Layer 5: Result Overlay (z-index: 5)
         └─ HUD display in revealed state
Layer 4: Neural Frame (z-index: 4)
         └─ Corner brackets, decorative
Layer 3: Bio-Pulse (z-index: 3)
         └─ Expanding rings in settling
Layer 2: Dice Container (z-index: 2)
         └─ 3D dice canvas (ThreeJS)
Layer 1: Particle Field (z-index: 1)
         └─ Canvas-based particles
Layer 0: Scan Grid (z-index: 0)
         └─ CSS background grid
```

## Performance Targets

### Frame Budget (60fps = 16.67ms)
```
┌──────────────────┬──────────┬──────────┐
│ System           │ Budget   │ Actual   │
├──────────────────┼──────────┼──────────┤
│ Particles        │ <5ms     │ ~2-3ms   │
│ Grid animation   │ <1ms     │ ~0.5ms   │
│ Dice rendering   │ <10ms    │ Varies   │
│ Total            │ <16.67ms │ ~12-15ms │
└──────────────────┴──────────┴──────────┘
```

### GPU-Only Properties
```
✓ transform (translate, scale, rotate)
✓ opacity
✓ filter (blur, brightness, hue-rotate)

✗ width, height (CPU layout)
✗ top, left (CPU layout)
✗ background-position (sometimes CPU)
```

## Accessibility Features

### Reduced Motion
```
When prefers-reduced-motion: reduce

DISABLED:
  - Grid animations
  - Bio-pulse rings
  - Button pulsing
  - Result pulsing
  - Glow sweeps
  - Ellipsis animation

SIMPLIFIED:
  - Result fade-in (200ms)
  - State transitions (instant)

PRESERVED:
  - Core functionality
  - Button interaction
  - Result display
  - State machine
```

### Screen Reader
```
<div aria-hidden="true">    ← Decorative elements
<button type="button">      ← Semantic button
<div class="result-hud">    ← Readable content
```

## Integration Checklist

Before using NeuralDiceInterface:

- [ ] Verify `/dice` assets are in public folder
- [ ] Check WebGL support in target browsers
- [ ] Test on target devices (desktop, tablet, mobile)
- [ ] Verify accessibility (reduced motion, screen reader)
- [ ] Set up event handlers (rollstart, rollcomplete, resultacknowledged)
- [ ] Test programmatic roll() method
- [ ] Verify state machine transitions
- [ ] Check particle performance (60fps)
- [ ] Test responsive breakpoints
- [ ] Validate color scheme matches design system

## Visual Testing URLs

Once dev server is running:
- **Test Page**: http://localhost:5178/test-neural-dice
- **Component Demo**: See all states and transitions
- **Event Log**: Monitor all dispatched events
- **Programmatic Control**: Trigger rolls and force results
