# Visual Design Review & Refinement Plan
**Project**: Dimm City Solo RPG - Game Interface Polish
**Date**: 2025-11-11
**Branch**: claude/svelte-5-migration-runes-011CUykd8vReQjCXB95tvReo

## Objective
Conduct comprehensive end-to-end visual design review and refinement of the game interface at http://localhost:5173/game/future-lost, focusing on spacing, layout, label positioning relative to augmented-ui shapes, and overall visual polish.

## Constraints
- **CANNOT CHANGE**: NeuralBackground.svelte, ThreeJSDiceBoxRoller.svelte
- **CAN CHANGE**: All other components and styles
- **MUST**: Test on multiple screen sizes (Desktop, Tablet, Mobile)
- **MUST**: Capture screenshots of all game states
- **FOCUS**: Details, creativity, unique and engaging experience

---

## Game States to Review

Based on code analysis, the following game states exist:

### 1. Pre-Game States
- **loadGame**: Loading screen
- **options**: Options/settings screen
- **intro**: Introduction/story screen

### 2. Main Game Loop States
- **startRound**: Round start screen (displays round number + "Roll for tasks" button)
- **rollForTasks**: Dice rolling screen for task determination
- **drawCard**: Card drawing screen
- **failureCheck**: Failure resolution screen
- **successCheck**: Success resolution screen
- **log/finalLog**: Journal entry screen

### 3. End States
- **gameOver**: Game over screen
- **exitGame**: Exit confirmation

### 4. Persistent UI Elements (visible across game loop states)
- **StatusDisplay**: Player info bar + 4 stat panels (Health, Failure, Luck, Success)
- **NeuralBackground**: Animated background (no changes)
- **ThreeJSDiceBoxRoller**: Dice physics (no changes)

---

## Components Analysis

### Primary Components
1. `/src/lib/components/Game.svelte` - Root game container
2. `/src/lib/components/GameScreen.svelte` - Screen state manager
3. `/src/lib/components/StatusDisplay.svelte` - Top status bar and stats
4. `/src/lib/components/IntroScreen.svelte`
5. `/src/lib/components/LoadScreen.svelte`
6. `/src/lib/components/OptionsScreen.svelte`
7. `/src/lib/components/DrawCard.svelte`
8. `/src/lib/components/CardDeck.svelte`
9. `/src/lib/components/RollForTasks.svelte`
10. `/src/lib/components/SuccessCheck.svelte`
11. `/src/lib/components/FailureCheck.svelte`
12. `/src/lib/components/JournalEntry.svelte`
13. `/src/lib/components/GameOver.svelte`
14. `/src/lib/components/AugmentedButton.svelte`
15. `/src/lib/components/ContinueButton.svelte`

### Design System Elements
- **augmented-ui**: Custom cyberpunk-style borders and clips
- **Glassmorphism**: Backdrop blur and transparency effects
- **Glowing animations**: Multi-layer box-shadow pulse animations
- **Color scheme**: Cyan (#00eeff), Magenta (#ff00ff), Green (#00ff88), Red (#ff0055), Yellow (#ffdd00)

---

## Task Breakdown

### Phase 1: Initial Documentation & State Capture
**Agent**: bunjs-typescript-expert
**Status**: Pending

1. **Task 1.1**: Set up local dev server and verify game loads
   - Start `npm run dev`
   - Navigate to http://localhost:5173/game/future-lost
   - Verify all components render

2. **Task 1.2**: Capture baseline screenshots of ALL game states
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)
   - States to capture:
     - loadGame
     - options
     - intro
     - startRound (Round 1, Round 5)
     - rollForTasks (before roll, during roll, after roll)
     - drawCard
     - failureCheck
     - successCheck
     - log/finalLog
     - gameOver
   - Save to `/test-results/visual-review-baseline/`

3. **Task 1.3**: Document current visual issues
   - Create issue log with screenshots
   - Note spacing problems
   - Note label alignment with augmented-ui shapes
   - Note any overflow/clipping issues
   - Note color/contrast issues
   - Note animation/transition issues
   - Save as `/test-results/visual-review-baseline/ISSUES.md`

---

### Phase 2: StatusDisplay Refinement
**Agent**: bunjs-typescript-expert
**Status**: Pending
**Dependencies**: Phase 1 complete

4. **Task 2.1**: Review StatusDisplay spacing and layout
   - Player info bar padding and alignment
   - Stats grid gap and responsive behavior
   - Label positioning relative to augmented-ui clips
   - Value text alignment and sizing
   - Progress bar positioning

5. **Task 2.2**: Implement StatusDisplay improvements
   - Adjust padding/margins for visual balance
   - Ensure labels don't overlap with augmented-ui shapes
   - Verify responsive behavior on all screen sizes
   - Test glow animations don't cause layout shift

6. **Task 2.3**: Capture post-improvement screenshots
   - Same states/sizes as baseline
   - Save to `/test-results/visual-review-iteration-1/`

---

### Phase 3: Game State Screens Refinement
**Agent**: bunjs-typescript-expert
**Status**: Pending
**Dependencies**: Phase 2 complete

7. **Task 3.1**: Review and refine startRound screen
   - Center alignment of round number
   - Button positioning and sizing
   - Spacing relative to StatusDisplay

8. **Task 3.2**: Review and refine card-related screens
   - DrawCard component layout
   - CardDeck animations and positioning
   - Card flip animations
   - Card content readability

9. **Task 3.3**: Review and refine check screens
   - SuccessCheck layout and messaging
   - FailureCheck layout and messaging
   - Button placement and sizing

10. **Task 3.4**: Review and refine journal screen
    - JournalEntry scrolling behavior
    - Text readability
    - Input field styling
    - Save button positioning

11. **Task 3.5**: Review and refine intro/end screens
    - IntroScreen layout and text flow
    - GameOver layout and final stats display
    - OptionsScreen control layout

12. **Task 3.6**: Capture post-improvement screenshots
    - All states/sizes
    - Save to `/test-results/visual-review-iteration-2/`

---

### Phase 4: Responsive & Cross-Browser Testing
**Agent**: bunjs-typescript-expert
**Status**: Pending
**Dependencies**: Phase 3 complete

13. **Task 4.1**: Test additional screen sizes
    - Small mobile (320x568)
    - Large desktop (2560x1440)
    - Ultrawide (3440x1440)
    - Portrait tablet (768x1024)

14. **Task 4.2**: Test edge cases
    - Long player names
    - Maximum stat values
    - Minimum stat values
    - Long card text
    - Long journal entries

15. **Task 4.3**: Test animations and transitions
    - Verify all animations complete smoothly
    - Check for layout shifts during animations
    - Verify reduced-motion accessibility

16. **Task 4.4**: Capture comprehensive test screenshots
    - Save to `/test-results/visual-review-final/`

---

### Phase 5: Architecture & Design Review
**Agent**: bun-node-architect
**Status**: Pending
**Dependencies**: Phase 4 complete

17. **Task 5.1**: Review design decisions
    - Evaluate visual hierarchy
    - Assess color usage and contrast
    - Review spacing consistency
    - Evaluate responsive patterns
    - Check accessibility considerations

18. **Task 5.2**: Provide design feedback
    - Document architectural concerns
    - Suggest improvements for consistency
    - Identify any remaining issues
    - Save as `/test-results/visual-review-final/ARCHITECTURE_FEEDBACK.md`

---

### Phase 6: Code Quality Review
**Agent**: code-quality-reviewer
**Status**: Pending
**Dependencies**: Phase 4 complete

19. **Task 6.1**: Review CSS/style implementations
    - Check for code duplication
    - Verify CSS variable usage
    - Review media query organization
    - Check for unused styles

20. **Task 6.2**: Review component structure
    - Verify proper separation of concerns
    - Check for unnecessary complexity
    - Review prop usage and naming

21. **Task 6.3**: Provide code quality feedback
    - Document code quality issues
    - Suggest refactoring opportunities
    - Save as `/test-results/visual-review-final/CODE_QUALITY_FEEDBACK.md`

---

### Phase 7: Iteration & Final Polish
**Agent**: bunjs-typescript-expert
**Status**: Pending
**Dependencies**: Phase 5 & 6 complete

22. **Task 7.1**: Address architecture feedback
    - Implement suggested design improvements
    - Verify consistency across all states

23. **Task 7.2**: Address code quality feedback
    - Refactor as recommended
    - Clean up CSS/styles

24. **Task 7.3**: Final comprehensive review
    - Test complete game flow on all screen sizes
    - Verify all issues resolved
    - Capture final screenshots

---

### Phase 8: End-to-End Validation
**Agent**: bun-node-architect + code-quality-reviewer
**Status**: Pending
**Dependencies**: Phase 7 complete

25. **Task 8.1**: Final architectural review
    - Verify all feedback addressed
    - Confirm visual design quality
    - Sign off on design

26. **Task 8.2**: Final code review
    - Verify all code quality issues resolved
    - Confirm maintainability
    - Sign off on implementation

27. **Task 8.3**: Create summary report
    - Before/after comparison
    - List of all changes
    - Screenshots grid
    - Save as `/test-results/visual-review-final/SUMMARY.md`

---

## Success Criteria

### Visual Design
- [ ] Consistent spacing across all screens
- [ ] Labels properly positioned relative to augmented-ui shapes
- [ ] No text overlap or clipping issues
- [ ] Smooth transitions between states
- [ ] Responsive behavior on all screen sizes (320px - 3440px width)
- [ ] Maintains cyberpunk/augmented aesthetic
- [ ] Enhanced visual interest and engagement

### Code Quality
- [ ] Clean, maintainable CSS
- [ ] Proper use of CSS variables
- [ ] No code duplication
- [ ] Well-organized media queries
- [ ] Proper component separation

### Accessibility
- [ ] Reduced-motion support
- [ ] Adequate color contrast
- [ ] Keyboard navigation support
- [ ] ARIA labels where appropriate

---

## Iteration Strategy

After each phase of implementation:
1. bunjs-typescript-expert captures screenshots
2. bun-node-architect reviews design decisions
3. code-quality-reviewer reviews code quality
4. Feedback is documented
5. bunjs-typescript-expert implements improvements
6. Repeat until both reviewers sign off

Maximum 3 iterations of the refinement loop before final validation.

---

## Timeline Estimate

- Phase 1: 30-45 minutes
- Phase 2: 45-60 minutes
- Phase 3: 60-90 minutes
- Phase 4: 45-60 minutes
- Phase 5: 30 minutes
- Phase 6: 30 minutes
- Phase 7: 60-90 minutes
- Phase 8: 30 minutes

**Total**: 5-7 hours (with iteration cycles)

---

## Notes

- Focus on making the experience truly unique and engaging
- Pay attention to small details that enhance the cyberpunk aesthetic
- Ensure the game feels polished and professional
- Don't be afraid to be creative with spacing and layout
- The augmented-ui shapes are a key part of the brand - work with them, not against them
