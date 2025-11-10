# Creaturepunk Stats Display & Background Update

## Date
2025-11-09

## Summary
Complete redesign of the status display with creaturepunk aesthetic and removal of the game board background to show neural network animations on all screens.

## Changes Made

### 1. Status Display Redesign (`src/lib/components/StatusDisplay.svelte`)

#### Visual Design
- **Replaced hexagon meters with horizontal stat bars**
- **Angular clip-path corners** for creaturepunk aesthetic
- **Intense neon glows** with dual-layer box-shadows:
  - Green (#00ffaa) for HEALTH
  - Red/Pink (#ff0066) for FAILURE
  - Cyan (#00eeff) for LUCK (renamed from BONUS)
  - Yellow (#ffee00) for SUCCESS
- **Player/Round info bar** with gradient background and multi-colored borders
- **Monospace typography** (Courier New) throughout
- **Progress bars** with gradient fills and glowing effects

#### Data Format
- Changed stat display from single number to **X/Y format**:
  - HEALTH: `54/100`
  - FAILURE: `0/4`
  - LUCK: `0/10`
  - SUCCESS: `0/10`
- Current value larger (1.5rem), max value smaller (0.9rem) and dimmed

#### Label Changes
- Renamed "BONUS" to **"LUCK"**

#### Responsive Layouts
- **Desktop (>900px)**: 4-column grid
- **Tablet (600px-900px)**: 2x2 grid
- **Mobile (<600px)**: 2x2 grid (changed from single column)
- Player/Round info remains horizontal on all screen sizes

### 2. Background Transparency (`src/lib/components/Game.svelte`)

#### `.dc-table-bg` Class
```css
.dc-table-bg {
    border-radius: var(--dc-default-border-radius);
    /* Background removed to show neural network animation on all screens */
    background: transparent;
}
```

**Impact**: The neural network particle animation (previously only visible on card drawing screens) is now visible on ALL game screens:
- Dice rolling
- Card drawing
- Journal entry
- Success/Failure checks
- All other game screens

### 3. Neural Background Component (`src/lib/components/NeuralBackground.svelte`)

**New Component**: Created a reusable NeuralBackground component that provides the animated particle field and scan grid background effect.

#### Features
- **Particle Canvas**: Animated cyan and magenta particles that float upward and wrap around edges
- **Scan Grid**: Pulsing grid background with 40px grid cells
- **Performance**: Adaptive particle count (20 on mobile, 50 on desktop)
- **Responsive**: Grid size adjusts for mobile (30px) and small mobile (25px)
- **Accessibility**: Respects prefers-reduced-motion setting

#### Integration
Applied to all game screens via `Game.svelte` by adding `<NeuralBackground />` inside `.main-screen-area`:

```svelte
<div class="main-screen-area dc-table-bg">
    <NeuralBackground />
    <!-- Game content appears above background -->
</div>
```

### 4. Documentation Updates (`docs/style-guide.md`)

#### Deprecated Variable
- `--dc-dice-roller-bg`: Marked as **DEPRECATED** - no longer used for game board background

#### Updated Class Description
- `dc-table-bg`: Now documented as having transparent background to allow neural network animation visibility

## Breaking Changes

⚠️ **Theme System Impact**:
- The `--dc-dice-roller-bg` CSS variable is no longer applied to the game board
- Custom themes that rely on this variable for game board styling will need updates
- The background is now controlled by the parent `.dc-game-bg` gradient

## Visual Comparison

### Before
- Hexagon meters with drop-shadow glows
- "BONUS" label
- Single number displays
- Gray background on game board obscuring neural effects
- Single column mobile layout

### After
- Horizontal stat bars with angular corners
- "LUCK" label
- X/Y format (e.g., 54/100)
- Transparent background showing neural network on all screens
- 2x2 grid mobile layout
- Intense neon glows matching creaturepunk aesthetic

## Technical Details

### Color Palette
- Health: `#00ffaa` (neon green)
- Failure: `#ff0066` (neon pink/red)
- Luck: `#00eeff` (neon cyan)
- Success: `#ffee00` (neon yellow)
- Player/Round Bar: Cyan primary with magenta/green accent borders

### Glow Effects
- Box-shadow layers: 25px @ 0.8 opacity + 40px @ 0.4 opacity
- Text-shadow layers: 10px @ 1.0 opacity + 20px @ 0.6 opacity
- Inset glows for depth (0.2 opacity)

### Responsive Font Sizes
| Element | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Current Value | 1.5rem | 1.3rem | 1.1rem |
| Divider (/) | 1.0rem | 0.9rem | 0.75rem |
| Max Value | 0.9rem | 0.8rem | 0.7rem |

## Files Modified
1. `src/lib/components/StatusDisplay.svelte` - Complete redesign
2. `src/lib/components/Game.svelte` - Background transparency and neural background integration
3. `src/lib/components/NeuralBackground.svelte` - **NEW**: Reusable neural animation component
4. `docs/style-guide.md` - Documentation updates

## Related Documentation
- See `/docs/NEURAL_DICE_VISUAL_REFERENCE.md` for neural network animation details
- See `/docs/style-guide.md` for complete CSS variable reference
