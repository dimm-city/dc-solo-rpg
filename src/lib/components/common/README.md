# Common Components

Reusable UI components for DC Solo RPG. These components provide consistent styling and behavior across the application.

## Overview

The common components library provides fundamental building blocks that are used throughout the application. All components follow the mechanical/ethereal aesthetic established in the animation style guide and use standardized animation constants.

## Available Components

### EmptyState

Displays a centered message when there's no data to show.

**Usage:**
```svelte
<script>
  import EmptyState from '$lib/components/common/EmptyState.svelte';
</script>

<EmptyState
  icon="📭"
  title="No games found"
  description="Start a new game to begin your journey"
  actionText="Start Game"
  onAction={() => startGame()}
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `string` | `'📭'` | Icon or emoji to display |
| `title` | `string` | `'Nothing here'` | Main title text |
| `description` | `string \| null` | `null` | Optional description text |
| `actionText` | `string \| null` | `null` | Optional action button text |
| `onAction` | `Function \| null` | `null` | Optional action button handler |
| `class` | `string` | `''` | Optional CSS class for container |

**Features:**
- Fades in with 200ms NORMAL animation
- Centered layout with flexible content
- Optional action button with hover effects
- Respects `prefers-reduced-motion`

---

### LoadingSpinner

Displays a spinning loader with optional text.

**Usage:**
```svelte
<script>
  import LoadingSpinner from '$lib/components/common/LoadingSpinner.svelte';
</script>

<!-- Large spinner with text -->
<LoadingSpinner size="large" text="Loading game..." />

<!-- Small spinner only -->
<LoadingSpinner size="small" />
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size variant |
| `text` | `string \| null` | `null` | Optional loading text |
| `class` | `string` | `''` | Optional CSS class for container |

**Size Mappings:**
- `small`: 24px
- `medium`: 48px
- `large`: 72px

**Features:**
- Smooth mechanical rotation using cubic-bezier easing
- SVG-based spinner for crisp rendering at any size
- Track + head design for visual depth
- Reduced motion support (simpler rotation)
- Accessible with `aria-label` and `role="status"`

---

### ErrorMessage

Displays error messages with consistent styling and optional retry action.

**Usage:**
```svelte
<script>
  import ErrorMessage from '$lib/components/common/ErrorMessage.svelte';
</script>

<!-- Error with retry -->
<ErrorMessage
  title="Failed to load game"
  message="The game file could not be found"
  severity="error"
  onRetry={() => loadGame()}
/>

<!-- Warning -->
<ErrorMessage
  title="Unstable connection"
  message="Your connection may be interrupted"
  severity="warning"
/>

<!-- Info with dismiss -->
<ErrorMessage
  title="New feature available"
  message="Story mode now supports AI-enhanced narratives"
  severity="info"
  onDismiss={() => hideMessage()}
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'Error'` | Error title |
| `message` | `string` | required | Error message/description |
| `severity` | `'error' \| 'warning' \| 'info'` | `'error'` | Severity level |
| `retryText` | `string` | `'Retry'` | Optional retry button text |
| `onRetry` | `Function \| null` | `null` | Optional retry handler |
| `onDismiss` | `Function \| null` | `null` | Optional dismiss handler |
| `class` | `string` | `''` | Optional CSS class for container |

**Severity Colors:**
- `error`: Red tones (⚠️)
- `warning`: Yellow tones (⚠️)
- `info`: Blue tones (ℹ️)

**Features:**
- Scales in with 200ms NORMAL animation
- Icon + title + message layout
- Optional retry button
- Optional dismiss button (×)
- Accessible with `role="alert"` and `aria-live="assertive"`
- Respects `prefers-reduced-motion`

---

### CardTypeInfo

Displays information about card types in the Wretched and Alone system.

**Usage:**
```svelte
<script>
  import CardTypeInfo from '$lib/components/common/CardTypeInfo.svelte';
</script>

<!-- Full variant with description -->
<CardTypeInfo
  type="primary-success"
  variant="full"
  showDescription={true}
/>

<!-- Compact variant -->
<CardTypeInfo type="challenge" variant="compact" />

<!-- Badge variant -->
<CardTypeInfo type="event" variant="badge" />
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `CardType` | required | Card type identifier |
| `variant` | `'full' \| 'compact' \| 'badge'` | `'full'` | Display variant |
| `showDescription` | `boolean` | `false` | Show description text (full variant only) |
| `class` | `string` | `''` | Optional CSS class for container |

**Card Types:**
| Type | Name | Icon | Color | Description |
|------|------|------|-------|-------------|
| `primary-success` | Primary Success / Salvation | ♥ | Red | Ace of Hearts - Unlocks Salvation checks |
| `failure-counter` | Failure Counter / King | 👑 | Purple | All 4 Kings - Instant loss when all revealed |
| `narrative` | Narrative / Ability | ✨ | Blue | Remaining 3 Aces - Reflective moments |
| `challenge` | Challenge | ⚡ | Orange | Odd cards - Usually trigger Stability checks |
| `event` | Event | 🌟 | Green | Even cards - Usually safe from checks |

**Variant Behaviors:**
- `full`: Icon + full name + optional description
- `compact`: Smaller icon + short name
- `badge`: Inline badge with icon + short name, colored background

**Features:**
- Fades in with animation
- Color-coded by card type
- Consistent iconography
- Flexible layouts for different contexts

---

## Design System

### Color Variables

Components use CSS custom properties for consistent theming:

```css
--text-primary: #e0e0e0        /* Primary text */
--text-secondary: #a0a0a0      /* Secondary text */
--primary-color: #4a9eff       /* Primary action color */
--primary-color-hover: #3a8eef /* Primary hover */
--text-on-primary: #ffffff     /* Text on primary bg */
--error-bg: rgba(220, 53, 69, 0.1)
--error-border: rgba(220, 53, 69, 0.3)
--error-color: #dc3545
/* ... etc */
```

### Spacing Scale

Components use the standard spacing scale:

```css
--space-xs: 0.25rem   /* 4px */
--space-sm: 0.5rem    /* 8px */
--space-md: 1rem      /* 16px */
--space-lg: 1.5rem    /* 24px */
--space-xl: 2rem      /* 32px */
```

### Animation Constants

All components use centralized animation constants:

```javascript
import { ANIMATION_DURATION, ANIMATION_EASING } from '$lib/constants/animations.js';

// Durations
ANIMATION_DURATION.FAST      // 150ms
ANIMATION_DURATION.NORMAL    // 200ms
ANIMATION_DURATION.SLOW      // 300ms

// Easing
ANIMATION_EASING.MECHANICAL  // cubic-bezier(0.4, 0, 0.6, 1)
ANIMATION_EASING.EASE_OUT    // ease-out
ANIMATION_EASING.CUBIC_OUT   // cubicOut (Svelte)
```

---

## Accessibility

All common components follow accessibility best practices:

### EmptyState
- Semantic heading structure (`<h2>` for title)
- Clear visual hierarchy
- Keyboard-accessible action button

### LoadingSpinner
- `role="status"` for screen reader announcements
- `aria-label="Loading"` for context
- Optional text for additional context
- Reduced motion support

### ErrorMessage
- `role="alert"` for immediate announcement
- `aria-live="assertive"` for critical errors
- Semantic heading structure
- Clear dismiss button with `aria-label`
- Keyboard-accessible actions

### CardTypeInfo
- `title` attribute on badge variant for tooltips
- Clear color contrast
- Icon + text for redundant information

---

## Testing

### Unit Tests

Test common components with Vitest:

```javascript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import EmptyState from './EmptyState.svelte';

describe('EmptyState', () => {
  it('should render title and description', () => {
    render(EmptyState, {
      props: {
        title: 'No games',
        description: 'Start a new game'
      }
    });

    expect(screen.getByText('No games')).toBeInTheDocument();
    expect(screen.getByText('Start a new game')).toBeInTheDocument();
  });

  it('should call onAction when button clicked', async () => {
    const handleAction = vi.fn();

    render(EmptyState, {
      props: {
        title: 'Empty',
        actionText: 'Do something',
        onAction: handleAction
      }
    });

    const button = screen.getByText('Do something');
    await button.click();

    expect(handleAction).toHaveBeenCalledOnce();
  });
});
```

### Visual Regression Tests

Common components should be tested for visual regressions:

```javascript
// Playwright visual regression test
test('EmptyState renders correctly', async ({ page }) => {
  await page.goto('/test/empty-state');
  await expect(page).toHaveScreenshot('empty-state.png');
});
```

---

## Best Practices

### 1. Use Consistent Props Pattern

Follow the Svelte 5 runes pattern:

```svelte
<script>
let {
  prop1,
  prop2 = 'default',
  class: className = ''
} = $props();
</script>
```

### 2. Support `class` Prop for Custom Styling

Always accept a `class` prop for additional styling:

```svelte
<div class="component-name {className}">
  <!-- content -->
</div>
```

### 3. Use Semantic HTML

Choose appropriate HTML elements:

- `<button>` for actions
- `<h2>` / `<h3>` for headings
- `role` and `aria-*` attributes for accessibility

### 4. Respect `prefers-reduced-motion`

Always include reduced motion support:

```css
@media (prefers-reduced-motion: reduce) {
  .animated-element {
    animation: none;
    transition: none;
  }
}
```

### 5. Use Animation Constants

Never use magic numbers for durations:

```svelte
<!-- ❌ Don't do this -->
<div in:fade={{ duration: 200 }}>

<!-- ✅ Do this instead -->
<div in:fade={{ duration: ANIMATION_DURATION.NORMAL }}>
```

---

## Contributing

When adding new common components:

1. **Create the component**: `src/lib/components/common/ComponentName.svelte`
2. **Document with JSDoc**: Include examples in component docblock
3. **Add to this README**: Update the "Available Components" section
4. **Write tests**: Add unit tests in `ComponentName.test.js`
5. **Test accessibility**: Use axe-core or similar tools
6. **Test reduced motion**: Verify behavior with `prefers-reduced-motion`

---

## Resources

- [Animation Style Guide](../../../docs/animation-style-guide.md)
- [Animation Constants](../../constants/animations.js)
- [CLAUDE.md](../../../CLAUDE.md) - Project instructions
- [Refactoring Status](../../../docs/refactoring/STATUS.md)
