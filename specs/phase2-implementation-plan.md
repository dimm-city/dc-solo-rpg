# Phase 2 Implementation Plan

## Overview

Phase 1 achieved an overall **4.85/5.0 AAA quality rating** across 16 completed issues. This Phase 2 plan addresses:
1. Remaining recommendations from Phase 1 design reviews
2. Deferred Issue 6 (Story Mode Animations)
3. Quality improvements and polish
4. Documentation and maintainability

**Phase 1 Completion Summary:**
- ✅ Stream 1: Branding (Issues 1-3) - 4.83/5
- ✅ Stream 2: Modal System (Issues 9, 8, 5) - 5.0/5
- ✅ Stream 3: Card System (Issues 10-14) - 4.6/5
- ✅ Stream 4: Transitions (Issues 15, 16) - 4.8/5
- ✅ Stream 5: Dice Animation (Issue 7) - 5.0/5
- ✅ Stream 6: Animation Standards (Issue 4) - 9.2/10

---

## Phase 2 Issues

### Issue 18: Story Mode Animations (Deferred from Phase 1)
**Priority:** High
**Source:** Issue 6 from Phase 1, deferred due to accessibility

**Goal:** Implement smooth animations for Story Mode transitions

**Requirements:**
- Opening story mode: 250-300ms with ease-out
- Opening a game save: smooth fade with subtle upward motion
- Moving between rounds: crossfade between states
- Closing a game: fade out with subtle scale-down

**Files to Modify:**
- `src/lib/components/StoryMode.svelte`
- `src/lib/components/StoryRound.svelte`
- Related routing/navigation components

**Acceptance Criteria:**
- All transitions follow mechanical/ethereal aesthetic
- Timing consistent with Phase 1 (200-300ms)
- No jarring jumps or incomplete animations
- Crossfade feels smooth between rounds

**Agent Assignment:** `web-design-expert`
**Estimated Time:** 4-5 hours

---

### Issue 19: Card Display Verification in Gameplay
**Priority:** High
**Source:** Stream 3 review - Issues 13 & 14 need live testing

**Goal:** Verify card display changes work correctly across all card types

**Testing Required:**
- Play through actual game to draw all card types:
  - Primary Success (Ace of Hearts)
  - Failure Counter (Kings)
  - Narrative (Other Aces)
  - Challenge (Odd ranks: 3, 5, 7, 9)
  - Event (Even ranks: 2, 4, 6, 8, 10, J, Q)

**Verification Points:**
- Issue 10: Background animation is subtle and non-distracting
- Issue 11: Badge appears with gentle fade+scale
- Issue 12: No hover effects on cards
- Issue 13: Status display remains visible and legible
- Issue 14: Text contrast meets WCAG AA (4.5:1) on all card types

**Acceptance Criteria:**
- Capture screenshots of all 5 card types
- Verify 4.5:1 contrast ratio using color picker
- Confirm status display visible in all cases
- Document any issues found

**Agent Assignment:** `web-design-expert`
**Estimated Time:** 2 hours

---

### Issue 20: Journal Entry Close Verification
**Priority:** Medium
**Source:** Stream 4 review - Issue 16 needs visual testing

**Goal:** Visually verify journal entry close transition in actual gameplay

**Testing Required:**
- Complete a game round to access journal entry
- Test journal entry save and close animations
- Verify smooth fade-out with scale-down
- Confirm backdrop fades simultaneously

**Acceptance Criteria:**
- Capture before/after screenshots
- Verify 200ms timing
- Confirm scale effect (1.0 → 0.95)
- Document transition quality

**Agent Assignment:** `web-design-expert`
**Estimated Time:** 1 hour

---

### Issue 21: Version Number Styling Refinement (Optional)
**Priority:** Low
**Source:** Stream 1 review - Minor visual refinement

**Goal:** Make version number more subtle in About modal

**Current State:**
- Version displays in yellow/gold color (matches brand)
- Visually prominent

**Proposed Changes:**
- Consider lighter font weight (400 instead of 500)
- Or use subdued color (rgba(255, 255, 255, 0.6) instead of yellow)
- Maintain readability while reducing visual weight

**Files to Modify:**
- About modal component

**Acceptance Criteria:**
- Version number is readable but less prominent
- Still maintains brand consistency
- Captures before/after screenshots

**Agent Assignment:** `svelte5-expert-dev`
**Estimated Time:** 30 minutes

---

### Issue 22: Animation Constants Consolidation
**Priority:** Medium
**Source:** Stream 6 quality gate recommendations

**Goal:** Create centralized animation constants for consistency

**Requirements:**
1. **JavaScript Constants File** (`src/lib/constants/animations.js`):
   ```javascript
   export const ANIMATION_DURATION = {
     FAST: 150,
     NORMAL: 200,
     SLOW: 300,
     CARD_DISMISS: 600,
     DICE_FADE: 250,
   };

   export const ANIMATION_EASING = {
     MECHANICAL: 'cubic-bezier(0.4, 0, 0.6, 1)',
     EASE_OUT: 'ease-out',
     EASE_IN: 'ease-in',
   };
   ```

2. **Update Svelte Transitions:**
   - Replace inline duration values with constants
   - Example: `transition:fade={{ duration: ANIMATION_DURATION.NORMAL }}`

3. **Mirror in CSS Custom Properties:**
   - Already exists in global styles
   - Ensure alignment with JS constants

**Files to Modify:**
- Create `src/lib/constants/animations.js`
- Update components using Svelte transitions
- Verify CSS custom properties alignment

**Acceptance Criteria:**
- All Svelte transitions use constants
- Constants documented with usage examples
- No regression in animation timing

**Agent Assignment:** `svelte5-expert-dev`
**Estimated Time:** 2-3 hours

---

### Issue 23: Animation Style Guide Documentation
**Priority:** Medium
**Source:** Stream 6 quality gate recommendations

**Goal:** Document animation standards for future development

**Deliverable:** Create `docs/animation-style-guide.md` containing:

1. **Animation Principles**
   - Mechanical vs ethereal aesthetic
   - Timing standards (150-300ms)
   - Easing functions to use/avoid

2. **Common Patterns**
   - Modal entrance/exit (with code examples)
   - Card transitions
   - Page transitions
   - Button interactions

3. **Component Library**
   - Reusable transition functions
   - OverlayModal pattern
   - Sequential animation pattern (Issue 15 example)

4. **Testing Checklist**
   - Visual smoothness
   - 60fps performance
   - Accessibility (prefers-reduced-motion)
   - Cross-browser compatibility

5. **Anti-Patterns**
   - What NOT to do (bounce, spring effects)
   - Common mistakes to avoid

**Acceptance Criteria:**
- Comprehensive guide with code examples
- Screenshots/GIFs demonstrating patterns
- Easily understood by new developers

**Agent Assignment:** `web-design-expert`
**Estimated Time:** 3-4 hours

---

### Issue 24: Accessibility Audit Enhancement
**Priority:** Medium
**Source:** Stream 4 recommendations

**Goal:** Enhance accessibility for state transitions

**Tasks:**
1. **Add aria-hidden to game content when modal open**
   - Currently using `inert` attribute
   - Add `aria-hidden="true"` for screen reader clarity

2. **Test keyboard navigation**
   - Verify tab order when modals open
   - Ensure focus returns correctly when modal closes
   - Test Escape key to close modals

3. **Screen reader testing**
   - Test with NVDA/JAWS (Windows) or VoiceOver (Mac)
   - Verify modal announcements
   - Ensure game state changes are announced

**Files to Modify:**
- `src/lib/components/Game.svelte`
- `src/routes/+page.svelte`
- Modal components

**Acceptance Criteria:**
- All modals have proper `aria-hidden` coordination
- Keyboard navigation works flawlessly
- Screen reader announces state changes appropriately
- Document accessibility testing results

**Agent Assignment:** `svelte5-expert-dev`
**Estimated Time:** 2-3 hours

---

### Issue 25: Performance Profiling on Mobile
**Priority:** Low
**Source:** Stream 6 recommendations

**Goal:** Verify 60fps performance on mobile/low-end devices

**Testing Required:**
- Test on actual mobile devices (iOS, Android)
- Use Chrome DevTools mobile emulation with CPU throttling
- Profile animations under various conditions:
  - 4x CPU slowdown
  - Slow 3G network
  - Low-end device presets

**Metrics to Capture:**
- Frame rate during animations
- Scripting time per frame
- Rendering/painting time
- Memory usage during continuous animations

**Acceptance Criteria:**
- Animations maintain ≥30fps on 4x CPU throttling
- No memory leaks during extended gameplay
- Identify any performance bottlenecks
- Document optimization recommendations if needed

**Agent Assignment:** `web-design-expert`
**Estimated Time:** 2 hours

---

### Issue 26: Status Display Text Shadow Enhancement (Optional)
**Priority:** Low
**Source:** Stream 3 review recommendations

**Goal:** Enhance status display visibility through fog overlays

**Current State:**
- Status display already has text-shadows
- Visible through most fog conditions

**Proposed Enhancement:**
- Add subtle glow effect to status numbers
- Increase shadow spread for better separation from background
- Test visibility during card display

**Files to Modify:**
- `src/lib/components/StatusDisplay.svelte`

**Acceptance Criteria:**
- Status numbers clearly visible through fog
- Glow effect subtle and not distracting
- Works across all game states

**Agent Assignment:** `web-design-expert`
**Estimated Time:** 1 hour

---

## Work Stream Organization

### Stream 7: Verification and Testing
**Issues:** 19, 20, 25
**Agent:** `web-design-expert`
**Dependencies:** None
**Estimated Timeline:** 5 hours
**Priority:** High

**Rationale:** These are verification tasks from Phase 1 that require actual gameplay testing.

---

### Stream 8: Story Mode Enhancement
**Issues:** 18
**Agent:** `web-design-expert`
**Dependencies:** None
**Estimated Timeline:** 4-5 hours
**Priority:** High

**Rationale:** Completes the deferred Issue 6 from Phase 1.

---

### Stream 9: Code Quality and Documentation
**Issues:** 22, 23, 24
**Agent:** `svelte5-expert-dev` (Issue 22, 24), `web-design-expert` (Issue 23)
**Dependencies:** Stream 7 should complete first for reference
**Estimated Timeline:** 7-10 hours
**Priority:** Medium

**Rationale:** Improves maintainability and sets standards for future development.

---

### Stream 10: Optional Polish
**Issues:** 21, 26
**Agent:** `web-design-expert` or `svelte5-expert-dev`
**Dependencies:** All other streams
**Estimated Timeline:** 1.5 hours
**Priority:** Low

**Rationale:** Nice-to-have improvements that don't affect core functionality.

---

## Execution Strategy

### Week 1: Verification and Story Mode
**Day 1-2:** Launch Stream 7 (Verification)
- Test card displays across all types
- Verify journal entry transitions
- Mobile performance profiling

**Day 3-5:** Launch Stream 8 (Story Mode)
- Implement Story Mode animations
- Apply OverlayModal pattern
- Test all Story Mode transitions

### Week 2: Quality and Documentation
**Day 6-8:** Launch Stream 9 (Code Quality)
- Create animation constants
- Write style guide documentation
- Accessibility enhancements

**Day 9-10:** Stream 10 (Optional Polish)
- Version number styling
- Status display enhancements
- Final QA pass

---

## Success Criteria

Phase 2 will be considered complete when:

1. **All High-Priority Issues Resolved:**
   - Issue 18: Story Mode animations complete
   - Issue 19: Card display verified across all types
   - Issue 20: Journal close verified

2. **Documentation Complete:**
   - Animation style guide published
   - Animation constants in place
   - Accessibility testing documented

3. **AAA Quality Maintained:**
   - All new work meets 4.5+/5.0 rating
   - No regressions from Phase 1
   - 60fps performance maintained

4. **Optional Items Evaluated:**
   - Decision made on Issues 21, 26
   - Either implemented or documented as not needed

---

## Phase 3 Planning

After Phase 2 completion, evaluate need for Phase 3 based on:
- Web-design-expert feedback on completed work
- User testing results (if conducted)
- Any new issues discovered during Phase 2
- Additional polish opportunities

**Potential Phase 3 Topics:**
- User-configurable animation speeds
- Skeleton loading screens
- Advanced accessibility features
- Animation performance optimizations
- Cross-browser testing and fixes

---

## Review Criteria for Phase 2

Each issue must meet:

1. **Functional Correctness:** Works as specified
2. **Visual Polish:** Maintains AAA quality standards
3. **Performance:** 60fps on desktop, ≥30fps on mobile with throttling
4. **Accessibility:** WCAG AA compliance maintained
5. **Documentation:** Changes documented appropriately
6. **No Regressions:** Phase 1 work remains intact

---

**Document Version:** 1.0
**Created:** 2025-11-17
**Phase 1 Completion:** 2025-11-17
**Estimated Phase 2 Duration:** 2 weeks
**Total Issues:** 9 (6 high/medium priority, 3 optional)
