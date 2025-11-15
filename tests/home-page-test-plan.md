# DC Solo RPG Home Page - Comprehensive Test Plan

## Application Overview

The DC Solo RPG home page is the entry point to a SvelteKit-based solo role-playing game application. The application uses the **Wretched and Alone** game system and provides multiple cyberpunk-themed solo RPG experiences.

### Key Features

- **Splash Screen**: Animated entry screen (shown once per browser session)
- **Instructions Choice**: First-time user onboarding flow with three options
- **Game Selection**: Grid display of available games with animated card interface
- **Modal Overlays**: Three types of modals (Help, About, Settings)
- **Navigation**: Header with logo, version, and quick-access buttons
- **Responsive Design**: Mobile-first design with breakpoints at 600px, 700px, 900px, 1200px
- **Accessibility**: Reduced motion support, ARIA labels, keyboard navigation

### Technology Stack

- **Framework**: SvelteKit with Svelte 5 (runes API)
- **Styling**: Custom CSS with augmented-ui library for cyberpunk aesthetics
- **State**: Svelte 5 reactive state ($state)
- **Storage**: SessionStorage (splash), LocalStorage (instructions preference)
- **Animation**: Svelte transitions (fade, fly, scale)

---

## Test Scenarios

### 1. Initial Page Load and Splash Screen

#### 1.1 First-Time Visit - Splash Screen Display

**Prerequisites:** Fresh browser session, localStorage cleared

**Steps:**

1. Navigate to the home page at `http://localhost:5173/`
2. Wait for page to fully load

**Expected Results:**

- Splash screen component is visible on first load
- NeuralBackground component renders animated background
- Splash screen displays application branding/animation
- No other content is visible behind splash
- Splash screen completes after animation duration (approximately 3-5 seconds)

**Validation:**

- Verify `showSplash` state is `true` initially
- Verify `sessionStorage.getItem('splashShown')` is `null` or does not exist
- After completion, verify `sessionStorage.getItem('splashShown')` is `'true'`

#### 1.2 Returning Visit - Skip Splash Screen

**Prerequisites:** Same browser session (splash already shown)

**Steps:**

1. Navigate to the home page
2. Observe initial render

**Expected Results:**

- Splash screen is NOT displayed
- User is taken directly to either:
  - Instructions choice screen (if never skipped)
  - Game selection screen (if instructions already seen or skipped)
- sessionStorage contains `splashShown: 'true'`

#### 1.3 Splash to Instructions Flow

**Prerequisites:** Fresh session, instructions not seen

**Steps:**

1. Navigate to home page
2. Wait for splash screen to complete
3. Observe transition

**Expected Results:**

- Splash screen fades out (850ms total: 800ms fade + 50ms buffer)
- Instructions choice screen fades in after splash completes
- No content flash or layout shift during transition
- showInstructionsChoice state is `true`

---

### 2. Instructions Choice Screen

#### 2.1 Instructions Choice Display

**Prerequisites:** Splash complete, instructions not previously seen

**Steps:**

1. Wait for instructions choice screen to appear
2. Examine all elements on screen

**Expected Results:**

- Screen displays with fade-in animation (600ms duration)
- Title "How To Play" is visible and properly styled
- Subtitle asks: "Would you like to learn the game mechanics, or skip straight to the games?"
- Three choice cards are displayed:
  1. "Learn How to Play" (cyan theme, book icon)
  2. "Skip Once" (magenta theme, skip icon)
  3. "Skip Always" (yellow theme, double-skip icon)
- Each card shows:
  - Icon (SVG)
  - Title
  - Description text
  - Recommendation badge
- Cards have proper glassmorphism background with blur effect
- Proper spacing and responsive layout

#### 2.2 Learn How to Play Button

**Steps:**

1. From instructions choice screen
2. Click "Learn How to Play" card
3. Observe navigation

**Expected Results:**

- User is navigated to `/how-to` route
- SessionStorage is updated with instructions shown marker
- Function `markInstructionsShownInSession()` is called

#### 2.3 Skip Once Button

**Steps:**

1. From instructions choice screen
2. Click "Skip Once" card
3. Wait for transition

**Expected Results:**

- Instructions choice screen fades out (300ms)
- Game selection screen fades in after 300ms delay
- SessionStorage is updated (instructions shown this session)
- LocalStorage is NOT updated (preference not saved permanently)
- On next browser session, instructions choice will be shown again

#### 2.4 Skip Always Button

**Steps:**

1. From instructions choice screen
2. Click "Skip Always" card
3. Observe behavior
4. Close browser and reopen

**Expected Results:**

- Instructions choice screen fades out (300ms)
- Game selection screen fades in
- Both sessionStorage AND localStorage are updated
- Function `markInstructionsAsSeen()` is called
- Function `markInstructionsShownInSession()` is called
- On future visits, instructions are never shown again

#### 2.5 Instructions Choice - Accessibility

**Steps:**

1. Use keyboard Tab to navigate between cards
2. Use Enter/Space to select a card
3. Verify focus states

**Expected Results:**

- Tab key moves focus between the three cards
- Focused card shows visual indication (border or outline)
- Enter or Space key activates the focused card
- Focus order is logical (Learn, Skip Once, Skip Always)

---

### 3. Game Selection Screen

#### 3.1 Game Selection Screen Display

**Prerequisites:** Instructions flow complete or skipped

**Steps:**

1. Reach game selection screen
2. Examine all elements

**Expected Results:**

- Screen displays with fade-in animation (600ms)
- Page header is visible and sticky at top
- Header contains:
  - Logo (D20 dice image) with floating animation
  - Version text "DC-S-0.1.0" in yellow
  - Three header buttons: About (?), How to Play (i), Settings (gear icon)
- Game cards grid is displayed
- Grid shows all available games from `/static/games/*.game.md` files
- Each game card displays:
  - Game title (uppercase, yellow text with glow)
  - Game subtitle/description
  - Unique augmented-ui corner clips
  - Glassmorphism background
  - Gradient border (cyan/magenta/yellow combinations)
  - Box shadow with neon glow effect
- Cards are arranged in responsive grid (3 columns on desktop)
- Data attribute `data-testid="home-page"` is present on container
- Data attribute `data-testid="game-selector"` is present on game selector
- Each game card has `data-testid="game-card-{slug}"` attribute

#### 3.2 Game Cards - Visual States

**Steps:**

1. Hover mouse over each game card
2. Click a game card (but don't confirm)
3. Click outside to deselect
4. Repeat with different cards

**Expected Results:**

**Hover State:**

- Card lifts up (translateY(-6px))
- Card scales slightly (scale 1.02)
- Brightness increases (filter: brightness 1.2)
- Box shadow intensifies based on card color theme
- Transition is smooth (0.35s cubic-bezier)

**Selected State:**

- Card has persistent lift effect (translateY(-6px))
- Border thickness increases (--aug-border-all: 3px)
- Enhanced glow effect
- Card maintains selection appearance
- CSS class `.selected` is applied

**Active State (click):**

- Card depresses slightly (translateY(-2px))
- Immediate visual feedback

#### 3.3 Game Cards - Responsive Behavior

**Steps:**

1. Resize browser to various widths:
   - 1400px (desktop)
   - 1000px (large tablet)
   - 850px (tablet)
   - 650px (small tablet)
   - 500px (mobile)

**Expected Results:**

**Desktop (> 1200px):**

- 3 columns grid
- Full spacing and padding

**Large Tablet (900px - 1200px):**

- 3 columns grid
- Tighter gaps

**Tablet (600px - 900px):**

- 2 columns grid
- Medium gaps
- Adjusted padding

**Mobile (< 600px):**

- 1 column (full width)
- Compact padding
- Cards remain fully functional

#### 3.4 Game Selection - Keyboard Navigation

**Steps:**

1. Use Tab key to navigate game cards
2. Use Enter/Space to select
3. Use Tab to reach modal buttons
4. Use Escape to cancel

**Expected Results:**

- Tab key navigates through all interactive elements
- Game cards receive focus indicators
- Enter/Space activates card selection
- Focus moves to confirm modal when card selected
- Escape key cancels modal and returns focus

#### 3.5 Game Card Staggered Animation

**Prerequisites:** Fresh page load

**Steps:**

1. Load game selection screen
2. Observe cards appearing

**Expected Results:**

- Cards fade in with staggered timing
- Card 1: 0.1s delay
- Card 2: 0.2s delay
- Card 3: 0.3s delay
- Card 4: 0.4s delay
- Card 5: 0.5s delay
- Each card animates from translateY(20px) scale(0.95) to normal
- Cards have floating animation (25s loop with individual offsets)

---

### 4. Game Confirmation Modal

#### 4.1 Open Game Confirmation Modal

**Steps:**

1. From game selection screen
2. Click any game card (e.g., "Future Lost")
3. Observe modal appearance

**Expected Results:**

- ConfirmModal component appears
- Modal uses portal rendering (appends to document.body)
- Backdrop is semi-transparent black (rgba 0,0,0,0.85) with blur
- Modal content flies in from top (y: -500, 400ms duration)
- Modal displays:
  - Title: "Load Game"
  - Message: 'Start "[Game Title]"?'
  - Confirm button: "START GAME"
  - Cancel button: "CANCEL"
- Modal has highest z-index (999999)
- Background content is still visible but blurred
- Modal is centered on screen

#### 4.2 Confirm Game Selection

**Steps:**

1. Open game confirmation modal
2. Click "START GAME" button
3. Observe navigation

**Expected Results:**

- User navigates to `/game/{game-slug}` route
- Modal closes immediately
- Smooth transition to game page
- Selected game state is cleared

#### 4.3 Cancel Game Selection

**Steps:**

1. Open game confirmation modal
2. Click "CANCEL" button
3. Observe behavior

**Expected Results:**

- Modal closes with fade-out animation
- User remains on game selection screen
- selectedGame state is reset to null
- showModal state is false
- Game card is no longer selected (no .selected class)

#### 4.4 Cancel via Backdrop Click

**Steps:**

1. Open game confirmation modal
2. Click outside modal (on backdrop)
3. Observe behavior

**Expected Results:**

- Same as Cancel button behavior
- Modal closes
- Selection is cleared
- User returns to game selection

#### 4.5 Cancel via Escape Key

**Steps:**

1. Open game confirmation modal
2. Press Escape key
3. Observe behavior

**Expected Results:**

- Same as Cancel button behavior
- Modal closes immediately
- Focus returns to game selection screen

---

### 5. About Modal

#### 5.1 Open About Modal

**Steps:**

1. From game selection screen
2. Click About button (info icon with circle) in header
3. Observe modal appearance

**Expected Results:**

- OverlayModal component renders
- Modal appears with combined fade-in (400ms) and scale-with-height animation (500ms)
- Modal scales from 0.7 to 1.0 and opacity from 0.3 to 1.0
- If animateHeight is true, height animates from 40dvh to 70dvh
- Modal backdrop is semi-transparent (rgba 0,0,0,0.5) with 4px blur
- Modal content displays:
  - Title: "About DC Solo RPG" (cyan, glowing)
  - Body paragraphs describing the game
  - Attribution text (smaller, italic, at bottom)
  - "Close" button at bottom right
- Modal has augmented-ui corner clips (16px all corners)
- Modal has gradient border (cyan to magenta)
- Modal has glassmorphism background with blur
- Fixed height: 70dvh
- z-index: 1000

#### 5.2 About Modal - Content Scrolling

**Prerequisites:** Small viewport or zoomed view

**Steps:**

1. Open About modal
2. Scroll within modal content
3. Observe behavior

**Expected Results:**

- Modal content area is scrollable (overflow-y: auto)
- Scrollbar appears if content exceeds modal height
- Backdrop and modal frame remain fixed
- Scroll is smooth and responsive
- Title remains visible at top (sticky not required, but all content accessible)

#### 5.3 Close About Modal

**Steps:**

1. Open About modal
2. Click "Close" button
3. Observe animation

**Expected Results:**

- Modal scales down (1.0 to 0.8) with fade-out (400ms)
- Modal and backdrop both fade out
- showAboutModal state becomes false
- User returns to game selection screen
- Focus returns to About button (accessibility)

#### 5.4 About Modal - Accessibility

**Steps:**

1. Open About modal
2. Use Tab to navigate
3. Check ARIA attributes
4. Test with screen reader (optional)

**Expected Results:**

- Modal title uses semantic heading tag (h2)
- Modal has proper heading hierarchy
- Close button is keyboard accessible
- Tab key focuses Close button
- Button has visible focus indicator
- Content is readable and properly structured

---

### 6. Settings Modal

#### 6.1 Open Settings Modal

**Steps:**

1. From game selection screen
2. Click Settings button (gear icon) in header
3. Observe modal appearance

**Expected Results:**

- OverlayModal component renders with same animations as About modal
- Modal displays:
  - Title: "Game Settings" (cyan, glowing)
  - Description paragraph
  - "Open Settings Page" button with gear icon
  - "Close" button at bottom
- Modal has same styling as About modal
- Fixed height: 70dvh
- z-index: 1000

#### 6.2 Navigate to Settings Page

**Steps:**

1. Open Settings modal
2. Click "Open Settings Page" button
3. Observe navigation

**Expected Results:**

- User navigates to `/settings` route
- Modal closes immediately (showSettingsModal set to false)
- Navigation is handled by goto('/settings')
- Smooth transition to settings page

#### 6.3 Close Settings Modal

**Steps:**

1. Open Settings modal
2. Click "Close" button
3. Observe behavior

**Expected Results:**

- Same close animation as About modal
- Modal fades out and scales down
- showSettingsModal state becomes false
- User remains on game selection screen
- Focus returns to Settings button

---

### 7. Help/How To Play Navigation

#### 7.1 Navigate to How To Play

**Steps:**

1. From game selection screen
2. Click "How to Play" link (question mark icon) in header
3. Observe navigation

**Expected Results:**

- User navigates to `/how-to` route
- Link uses standard anchor tag (not modal)
- No modal interaction
- Navigation is immediate
- User can use browser back button to return

---

### 8. Header and Navigation

#### 8.1 Header Sticky Behavior

**Steps:**

1. Load game selection screen
2. Scroll down page (if content is long enough)
3. Observe header position

**Expected Results:**

- Header remains at top of viewport (position: sticky, top: 0)
- Header has semi-transparent background with backdrop-filter blur
- Header stays visible while scrolling
- z-index: 100 (below modals but above content)

#### 8.2 Logo and Version Display

**Steps:**

1. Examine header logo area
2. Verify visual styling

**Expected Results:**

- D20 dice logo (150px image) is displayed
- Logo has drop-shadow with purple/magenta glow
- Logo has floating animation (6s infinite)
- Version text "DC-S-0.1.0" is visible next to logo
- Version text is yellow with text glow
- Version text is uppercase with wide letter-spacing
- Logo and version are horizontally aligned

#### 8.3 Header Button Interactions

**Steps:**

1. Hover over each header button (About, Help, Settings)
2. Click each button
3. Observe visual feedback

**Expected Results:**

**Hover State:**

- Icon color changes from yellow to cyan
- Icon scales up (transform: scale 1.1)
- Drop-shadow changes to cyan glow
- Transition is smooth (var(--transition-fast))

**Active State:**

- Icon scales down slightly (scale 1.05)
- Provides tactile feedback

**Click:**

- About button opens About modal
- How to Play navigates to /how-to
- Settings button opens Settings modal

#### 8.4 Header Responsive Behavior

**Steps:**

1. Resize browser to mobile width (< 600px)
2. Examine header layout

**Expected Results:**

- Header padding reduces (var(--space-sm) var(--space-md))
- Logo size scales down (clamp 48px to 72px)
- Button spacing reduces (gap: var(--space-sm))
- Button icons reduce to 24x24px
- Layout remains functional and readable

---

### 9. Modal Overlay System

#### 9.1 Multiple Modal Prevention

**Steps:**

1. Open About modal
2. Attempt to open Settings modal (via header button)
3. Observe behavior

**Expected Results:**

- Only one modal should be open at a time
- If implementation allows, clicking another modal button should:
  - Either: Close first modal and open second
  - Or: Prevent second modal from opening
- No z-index conflicts or stacking issues

#### 9.2 Modal z-index Stacking

**Steps:**

1. Open game confirmation modal (z-index: 999999)
2. Close and open About modal (z-index: 1000)
3. Verify proper layering

**Expected Results:**

- Game confirmation modal always appears above everything (z-index: 999999)
- Overlay modals (About, Settings) use z-index: 1000
- No content bleeds through modals
- Backdrops properly obscure content below

#### 9.3 Modal Backdrop Blur Effect

**Steps:**

1. Open any modal
2. Observe background content

**Expected Results:**

- Game confirmation modal: backdrop-filter blur(8px)
- Overlay modals: backdrop-filter blur(4px)
- Background content is visibly blurred but still recognizable
- Blur effect works in supported browsers
- Graceful fallback if blur not supported

---

### 10. Reduced Motion Accessibility

#### 10.1 Reduced Motion - Animations Disabled

**Prerequisites:** Enable "Reduce Motion" in OS settings

**Steps:**

1. Navigate to home page
2. Observe all transitions and animations

**Expected Results:**

- All animations are disabled or significantly reduced
- No floating animations on cards or logo
- No scale/transform transitions on hover
- Fade transitions may remain (or be instant)
- Page remains fully functional
- No motion sickness triggers
- CSS media query `@media (prefers-reduced-motion: reduce)` is respected

---

### 11. Performance and Loading

#### 11.1 Initial Page Load Performance

**Steps:**

1. Clear browser cache
2. Navigate to home page
3. Measure load time

**Expected Results:**

- Page loads within 2-3 seconds on typical connection
- NeuralBackground renders without blocking
- Game cards appear smoothly
- No layout shift during load
- No console errors

#### 11.2 Game Data Loading

**Steps:**

1. Check browser DevTools Network tab
2. Observe requests on page load

**Expected Results:**

- Server loads game data from `/static/games/*.game.md` files
- Page data includes array of games with:
  - slug (filename without .game.md)
  - title (from frontmatter or generated from slug)
  - subtitle (from frontmatter)
- Games are sorted alphabetically by title
- No unnecessary API calls
- Data is available on initial render (SSR)

#### 11.3 Image and Asset Loading

**Steps:**

1. Check Network tab for asset requests
2. Verify all resources load

**Expected Results:**

- Logo image `/d20-150.png` loads successfully
- All SVG icons are inline (no external requests)
- Fonts load correctly
- No 404 errors for assets

---

### 12. Browser Compatibility

#### 12.1 Chrome/Edge (Chromium)

**Steps:**

1. Test all features in Chrome or Edge
2. Verify visual appearance
3. Test all interactions

**Expected Results:**

- All features work correctly
- Backdrop-filter blur effects work
- Animations are smooth
- No console errors

#### 12.2 Firefox

**Steps:**

1. Test all features in Firefox
2. Verify visual appearance

**Expected Results:**

- All features work correctly
- Backdrop-filter may require enabling in about:config
- Alternative styling if blur not supported
- No functionality loss

#### 12.3 Safari (Desktop and iOS)

**Steps:**

1. Test in Safari
2. Test on iOS device or simulator

**Expected Results:**

- All features work correctly
- -webkit-backdrop-filter is used for blur support
- Touch interactions work on mobile
- No webkit-specific bugs

---

### 13. Edge Cases and Error Handling

#### 13.1 No Games Available

**Prerequisites:** Empty `/static/games/` directory

**Steps:**

1. Navigate to home page
2. Reach game selection screen

**Expected Results:**

- Game grid displays empty or with message
- No JavaScript errors
- Application remains functional
- User sees appropriate feedback

#### 13.2 Rapid Button Clicking

**Steps:**

1. Rapidly click header buttons
2. Rapidly open/close modals
3. Quickly select/deselect games

**Expected Results:**

- No race conditions
- State updates consistently
- Animations don't conflict
- Modals don't stack incorrectly
- No console errors

#### 13.3 Deep Linking

**Steps:**

1. Navigate directly to home page with fragment/hash
2. Test URL variations

**Expected Results:**

- Page loads normally regardless of URL parameters
- Splash behavior is consistent
- No URL-based errors

#### 13.4 LocalStorage Unavailable

**Prerequisites:** Disable localStorage (browser privacy mode)

**Steps:**

1. Navigate to home page in private/incognito mode
2. Test instructions flow

**Expected Results:**

- App handles localStorage errors gracefully
- Instructions may show every time (acceptable)
- SessionStorage still works
- No crashes or console errors

---

### 14. Mobile-Specific Testing

#### 14.1 Mobile Touch Interactions

**Steps:**

1. Test on mobile device or emulator
2. Tap all interactive elements

**Expected Results:**

- All buttons and cards respond to touch
- No hover-only interactions
- Touch targets are appropriately sized (min 44x44px)
- No accidental activations
- Smooth scrolling

#### 14.2 Mobile Modal Interactions

**Steps:**

1. Open modals on mobile device
2. Scroll modal content
3. Close modals

**Expected Results:**

- Modals fill viewport appropriately
- Close buttons are easily tappable
- Scroll works within modals
- Background doesn't scroll when modal open (body scroll lock)
- Modals are readable on small screens

#### 14.3 Mobile Keyboard

**Steps:**

1. Test on device with touch keyboard
2. Interact with any inputs (if present)

**Expected Results:**

- Keyboard doesn't obscure important content
- Viewport adjusts appropriately
- Modal remains accessible with keyboard open

#### 14.4 Landscape vs Portrait

**Steps:**

1. Rotate device between portrait and landscape
2. Verify all screens adapt

**Expected Results:**

- Layout adapts to orientation change
- No content is cut off
- Modals remain centered
- Grid adjusts column count if needed

---

### 15. Session and State Management

#### 15.1 Browser Refresh

**Steps:**

1. Reach game selection screen
2. Refresh browser (F5 or Cmd+R)
3. Observe behavior

**Expected Results:**

- Splash screen is not shown (session persists)
- User returns to game selection screen
- SessionStorage persists within tab
- No data loss

#### 15.2 New Tab

**Steps:**

1. Reach game selection screen
2. Open home page in new tab
3. Observe behavior

**Expected Results:**

- New tab shows splash screen (new session)
- Instructions flow runs if applicable
- SessionStorage is separate per tab

#### 15.3 Close and Reopen Browser

**Steps:**

1. Complete instructions flow (skip always)
2. Close browser completely
3. Reopen and navigate to home page

**Expected Results:**

- LocalStorage persists (instructions preference)
- Splash shows (new session)
- Instructions are skipped (localStorage remembered)
- User goes straight to game selection after splash

---

### 16. Visual Regression Testing

#### 16.1 Screenshot Comparison - Desktop

**Steps:**

1. Capture screenshots of:
   - Splash screen
   - Instructions choice screen
   - Game selection screen
   - About modal open
   - Settings modal open
   - Game confirmation modal open
2. Compare with baseline images

**Expected Results:**

- No unexpected visual changes
- Colors, spacing, typography match design
- Animations render correctly in screenshots

#### 16.2 Screenshot Comparison - Mobile

**Steps:**

1. Capture mobile screenshots (375px width) of all screens
2. Compare with mobile baselines

**Expected Results:**

- Mobile layouts match design
- Text is readable
- Buttons are appropriately sized
- No overflow or layout breaks

---

## Test Execution Guidelines

### Test Environments

1. **Local Development**: `http://localhost:5173`
2. **Build Preview**: `npm run build && npm run preview`
3. **Production**: Deployed URL

### Browser Matrix

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari iOS (latest)
- Mobile Chrome Android (latest)

### Viewport Sizes

- Desktop: 1920x1080, 1440x900
- Tablet: 768x1024, 1024x768
- Mobile: 375x667, 414x896, 390x844

### Testing Tools

- **Manual Testing**: Visual inspection and interaction
- **Playwright**: Automated E2E tests
- **DevTools**: Performance, Network, Console monitoring
- **Accessibility**: Lighthouse, axe DevTools
- **Screen Readers**: NVDA (Windows), VoiceOver (Mac/iOS)

---

## Test Data

### Sample Games

The test plan assumes at least these games exist in `/static/games/`:

1. `artful-detective.game.md` - "Artful Detective" / "Solve mysteries in a noir-cyberpunk city"
2. `future-lost.game.md` - "Future Lost" / "Navigate a post-apocalyptic wasteland"
3. `gnome-alone.game.md` - "Gnome Alone" / "Survive as a lone gnome adventurer"
4. `simple-example.game.md` - "Simple Example" / "Quick start tutorial game"
5. `full-example.game.md` - "Full Example" / "Complete game demonstration"

---

## Known Issues and Limitations

### Documented Behavior

1. **Splash Screen**: Only shown once per browser session (by design)
2. **LocalStorage**: Instructions preference stored permanently (can be cleared via browser)
3. **Modal Stacking**: Only one modal should be open at a time (not enforced in code)

### Browser-Specific

1. **Backdrop Blur**: May not work in older browsers (graceful degradation)
2. **Augmented UI**: Requires modern CSS support

---

## Success Criteria

A successful test execution should verify:

1. All modals open and close correctly
2. Modal content is fully visible and readable
3. Modal overlays display properly with backdrop blur
4. Games are displayed in selection screen
5. All navigation flows work correctly
6. Responsive design works across all breakpoints
7. Accessibility features function properly
8. No console errors or warnings
9. State management persists correctly
10. Animations are smooth and non-intrusive

---

## Appendix A: Test Automation

### Playwright Test Selectors

```javascript
// Page container
'[data-testid="home-page"]';

// Game selector
'[data-testid="game-selector"]';

// Individual game cards
'[data-testid="game-card-future-lost"]';
'[data-testid="game-card-artful-detective"]';
// etc.

// Header buttons
'button[aria-label="About"]';
'a[aria-label="How to Play"]';
'button[aria-label="Settings"]';

// Modals
'.overlay-modal-container';
'.modal-backdrop';

// Buttons in modals
'button:has-text("Close")';
'button:has-text("Open Settings Page")';
```

### Sample Playwright Test

```javascript
test('should open and close About modal', async ({ page }) => {
	await page.goto('/');

	// Wait for game selection to load
	await page.waitForSelector('[data-testid="home-page"]', { timeout: 5000 });

	// Click About button
	await page.click('button[aria-label="About"]');

	// Verify modal is visible
	await expect(page.locator('.overlay-modal-container')).toBeVisible();
	await expect(page.locator('h2:has-text("About DC Solo RPG")')).toBeVisible();

	// Close modal
	await page.click('button:has-text("Close")');

	// Verify modal is closed
	await expect(page.locator('.overlay-modal-container')).not.toBeVisible();
});
```

---

## Appendix B: Accessibility Checklist

- [ ] All buttons have accessible labels
- [ ] Modals have proper ARIA attributes
- [ ] Keyboard navigation works for all interactive elements
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA standards
- [ ] Reduced motion preference is respected
- [ ] Screen reader announces modal content correctly
- [ ] Heading hierarchy is logical (h1, h2, h3)
- [ ] Interactive elements have min 44x44px touch targets
- [ ] Form elements (if any) have associated labels

---

**Test Plan Version**: 1.0
**Last Updated**: 2025-11-14
**Application Version**: DC-S-0.1.0
**Test Coverage**: Home Page Modal Functionality and Game Display
