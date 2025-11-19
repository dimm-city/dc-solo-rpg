# DC Solo RPG - Refactoring & Improvement Status

**Last Updated:** 2025-11-19
**Status:** Planning Complete, Ready to Execute
**Estimated Total Effort:** 16-21 developer days

---

## 📊 Overview

This document tracks the status of the comprehensive refactoring and improvement plan for DC Solo RPG. The plan addresses code quality issues, component architecture, and maintainability concerns identified in the codebase review.

**Key Metrics:**
- **Total Components to Refactor:** 10 critical/high-priority components
- **New Components to Create:** 40-45 focused components
- **Largest Component Reduction:** 2,006 → 200 lines (90% reduction)
- **Overall Codebase Improvement:** Better testability, maintainability, and developer experience

---

## 📋 Quick Links

- [Detailed Code Quality Review](./CODE_QUALITY_REVIEW.md) - All findings from code analysis
- [Component Refactoring Guide](./COMPONENT_REFACTORING.md) - Component-by-component breakdown
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md) - How to execute refactorings
- [Testing Strategy](./TESTING_STRATEGY.md) - Testing approach for refactored code

---

## 🎯 Phase Progress

### Phase 1: Critical Infrastructure (Week 1-2)
**Status:** ⏳ Not Started
**Estimated Effort:** 3-4 days
**Priority:** CRITICAL

#### 1.1 Create Composables Directory Structure
- [ ] Create `src/lib/composables/` directory
- [ ] Create `useResponsiveLayout.svelte.js`
- [ ] Create `useAutoPlay.svelte.js` (move from utils/)
- [ ] Create `useKeyboardShortcuts.svelte.js`
- [ ] Create `useScreenController.svelte.js`
- [ ] Create composables README with usage guide
- [ ] **Estimated Effort:** 2 days

#### 1.2 Create Common Components Library
- [ ] Create `src/lib/components/common/` directory
- [ ] Create `EmptyState.svelte`
- [ ] Create `LoadingSpinner.svelte`
- [ ] Create `ErrorMessage.svelte`
- [ ] Create `CardTypeInfo.svelte`
- [ ] Document component APIs
- [ ] **Estimated Effort:** 1 day

#### 1.3 Refactor StatusDisplay (2,006 lines → 200 lines)
- [ ] Create `src/lib/components/status/` directory
- [ ] Extract `PlayerInfoBar.svelte` (150-200 lines)
- [ ] Extract `StatsGrid.svelte` (100-150 lines)
- [ ] Extract `StabilityPanel.svelte` (120-150 lines)
- [ ] Extract `FailureCounterPanel.svelte` (100-120 lines)
- [ ] Extract `AbilitiesPanel.svelte` (120-150 lines)
- [ ] Extract `SuccessTokensPanel.svelte` (150-180 lines)
- [ ] Extract `DiceReadout.svelte` (200-250 lines) ⭐ REUSABLE
- [ ] Extract `ProgressTracker.svelte` (100-120 lines)
- [ ] Update `StatusDisplay.svelte` to use new components
- [ ] Verify no visual regressions
- [ ] Update tests
- [ ] **Estimated Effort:** 2-3 days

**Phase 1 Deliverables:**
- ✅ Reusable composables infrastructure
- ✅ Common component library
- ✅ StatusDisplay broken into 8 focused components
- ✅ 90% reduction in StatusDisplay size

---

### Phase 2: Game Screen Simplification (Week 2-3)
**Status:** ⏳ Not Started
**Estimated Effort:** 3-4 days
**Priority:** CRITICAL
**Blockers:** Phase 1.1 (useAutoPlay needs to be moved first)

#### 2.1 Extract Game Screen Composables
- [ ] Create `src/lib/composables/screen/` directory
- [ ] Create `useScreenController.svelte.js` (200-250 lines)
- [ ] Enhance `useAutoPlay.svelte.js` with screen integration
- [ ] Create `useKeyboardShortcuts.svelte.js` (80-100 lines)
- [ ] Create `useRollForTasks.svelte.js`
- [ ] Create `useFailureCheck.svelte.js`
- [ ] Create `useSuccessCheck.svelte.js`
- [ ] Create `useInitialDamage.svelte.js`
- [ ] Create `useFinalDamage.svelte.js`
- [ ] **Estimated Effort:** 2 days

#### 2.2 Extract Screen-Specific Components
- [ ] Create `src/lib/components/game/` directory
- [ ] Extract `ContextBackground.svelte` (80-100 lines)
- [ ] Extract `RollForTasksController.svelte` (100-120 lines)
- [ ] Extract `FailureCheckController.svelte` (100-120 lines)
- [ ] Extract `SuccessCheckController.svelte` (100-120 lines)
- [ ] **Estimated Effort:** 1 day

#### 2.3 Update GameScreen to Use New Architecture
- [ ] Update `GameScreen.svelte` to use composables
- [ ] Replace inline logic with screen controllers
- [ ] Verify auto-play still works correctly
- [ ] Update tests
- [ ] Verify no regressions
- [ ] **Estimated Effort:** 1 day

**Phase 2 Deliverables:**
- ✅ GameScreen reduced from 1,399 → 400 lines (71% reduction)
- ✅ Composable screen logic patterns
- ✅ Reusable screen controllers
- ✅ Better auto-play architecture

---

### Phase 3: Card & Journal Components (Week 3-4)
**Status:** ⏳ Not Started
**Estimated Effort:** 4-6 days
**Priority:** HIGH

#### 3.1 Refactor CardDeck (1,030 lines → 400 lines)
- [ ] Create `src/lib/components/card/` directory
- [ ] Create `useCardAnimationState.svelte.js` (200-250 lines)
- [ ] Extract `CardDisplay.svelte` (250-300 lines) ⭐ REUSABLE
- [ ] Extract `ParticleCanvas.svelte` (150-200 lines) ⭐ REUSABLE
- [ ] Extract `CardAnimations.svelte` (bio-pulse, corruption)
- [ ] Update `CardDeck.svelte` to use new components
- [ ] Verify animations still work correctly
- [ ] Update tests
- [ ] **Estimated Effort:** 2-3 days

#### 3.2 Refactor JournalEntry (1,033 lines → 300 lines)
- [ ] Create `src/lib/components/journal/` directory
- [ ] Create `useAudioRecording.svelte.js` (150-200 lines)
- [ ] Extract `AudioRecorder.svelte` (250-300 lines) ⭐ HIGHLY REUSABLE
- [ ] Extract `AudioPlayback.svelte` (150-200 lines)
- [ ] Extract `AutoJournalTimer.svelte` (100-120 lines)
- [ ] Update `JournalEntry.svelte` to use new components
- [ ] Add error handling for audio recording
- [ ] Update tests
- [ ] **Estimated Effort:** 2-3 days

**Phase 3 Deliverables:**
- ✅ CardDeck reduced 61%
- ✅ JournalEntry reduced 71%
- ✅ 3 highly reusable components created
- ✅ Better audio recording architecture

---

### Phase 4: Story Mode Polish (Week 4-5)
**Status:** ⏳ Not Started
**Estimated Effort:** 3-4 days
**Priority:** MEDIUM

#### 4.1 Refactor StoryMode (826 lines → 400 lines)
- [ ] Create `src/lib/components/story/` directory
- [ ] Create `useStoryNavigation.svelte.js` (100-120 lines)
- [ ] Create `useEnrichedRounds.svelte.js` (150-200 lines)
- [ ] Extract `StoryProgressBar.svelte` (120-150 lines)
- [ ] Extract `StoryNavigation.svelte` (prev/next buttons)
- [ ] Update `StoryMode.svelte` to use new components
- [ ] Update tests
- [ ] **Estimated Effort:** 1-2 days

#### 4.2 Refactor StoryRound (739 lines → 350 lines)
- [ ] Reuse `CardDisplay.svelte` from card/ directory
- [ ] Extract `RoundStats.svelte` (100-120 lines)
- [ ] Extract `GameOverMessage.svelte`
- [ ] Update `StoryRound.svelte` to use new components
- [ ] Update tests
- [ ] **Estimated Effort:** 1 day

#### 4.3 Refactor BrowseGames (708 lines → 350 lines)
- [ ] Create `src/lib/components/browse/` directory
- [ ] Create `useSavedGames.svelte.js` (100-120 lines)
- [ ] Extract `GameCard.svelte` (150-180 lines) ⭐ REUSABLE
- [ ] Extract `SortControls.svelte`
- [ ] Update `BrowseGames.svelte` to use new components
- [ ] Update tests
- [ ] **Estimated Effort:** 1 day

**Phase 4 Deliverables:**
- ✅ Story mode components reduced ~50%
- ✅ Better separation of concerns
- ✅ Reusable game card component

---

### Phase 5: Settings & Polish (Week 5)
**Status:** ⏳ Not Started
**Estimated Effort:** 2-3 days
**Priority:** LOW

#### 5.1 Refactor AISettings (487 lines → 250 lines)
- [ ] Extract `AIProviderSection.svelte` (200 lines)
- [ ] Extract `TTSSection.svelte` (200 lines)
- [ ] Update `AISettings.svelte`
- [ ] **Estimated Effort:** 1 day

#### 5.2 Refactor StoryGenerationPanel (428 lines → 250 lines)
- [ ] Create `useStoryGeneration.svelte.js` (150 lines)
- [ ] Extract `GeneratedStory.svelte` (120 lines)
- [ ] Update `StoryGenerationPanel.svelte`
- [ ] **Estimated Effort:** 1 day

#### 5.3 Refactor IntroScreen (408 lines → 250 lines)
- [ ] Extract `ChoiceCard.svelte` (100 lines)
- [ ] Create `useInstructionsPreference.svelte.js` (60 lines)
- [ ] Update `IntroScreen.svelte`
- [ ] **Estimated Effort:** 1 day

**Phase 5 Deliverables:**
- ✅ Settings components cleaned up
- ✅ Better code organization
- ✅ Reusable choice card pattern

---

## 🔧 Code Quality Issues

### Critical Issues (Fix Immediately)
- [ ] **Issue #1:** Replace $effect with event-driven patterns in JournalEntry
  - See: [CODE_QUALITY_REVIEW.md#issue-21](./CODE_QUALITY_REVIEW.md#issue-21)
  - **Effort:** Medium (2-3 hours per component)
  - **Priority:** CRITICAL

- [ ] **Issue #2:** Add error handling for audio recording
  - See: [CODE_QUALITY_REVIEW.md#issue-42](./CODE_QUALITY_REVIEW.md#issue-42)
  - **Effort:** Small (1 hour)
  - **Priority:** CRITICAL

- [ ] **Issue #3:** Add tests for pending state system
  - See: [CODE_QUALITY_REVIEW.md#issue-82](./CODE_QUALITY_REVIEW.md#issue-82)
  - **Effort:** Large (6-8 hours)
  - **Priority:** CRITICAL

### High Priority Issues
- [ ] **Issue #4:** Improve JSDoc coverage in gameActions.svelte.js
  - See: [CODE_QUALITY_REVIEW.md#issue-51](./CODE_QUALITY_REVIEW.md#issue-51)
  - **Effort:** Medium (2-3 hours)
  - **Priority:** HIGH

- [ ] **Issue #5:** Create reusable button state pattern
  - See: [CODE_QUALITY_REVIEW.md#issue-31](./CODE_QUALITY_REVIEW.md#issue-31)
  - **Effort:** Small (1-2 hours)
  - **Priority:** MEDIUM

- [ ] **Issue #6:** Replace console.log with logger
  - See: [CODE_QUALITY_REVIEW.md#issue-63](./CODE_QUALITY_REVIEW.md#issue-63)
  - **Effort:** Small (1 hour)
  - **Priority:** MEDIUM

- [ ] **Issue #7:** Extract D20 mechanics to dedicated module
  - See: [CODE_QUALITY_REVIEW.md#issue-33](./CODE_QUALITY_REVIEW.md#issue-33)
  - **Effort:** Small (30 minutes)
  - **Priority:** MEDIUM

### Medium/Low Priority Issues
- [ ] **Issue #8:** Remove commented-out code
  - See: [CODE_QUALITY_REVIEW.md#issue-73](./CODE_QUALITY_REVIEW.md#issue-73)
  - **Effort:** Trivial (15 minutes)
  - **Priority:** LOW

- [ ] **Issue #9:** Create state constants enum
  - See: [CODE_QUALITY_REVIEW.md#issue-53](./CODE_QUALITY_REVIEW.md#issue-53)
  - **Effort:** Small (1 hour)
  - **Priority:** LOW

- [ ] **Issue #10:** Standardize event handler naming
  - See: [CODE_QUALITY_REVIEW.md#issue-91](./CODE_QUALITY_REVIEW.md#issue-91)
  - **Effort:** Small (1 hour)
  - **Priority:** LOW

---

## 📈 Progress Metrics

### Component Size Reduction
| Component | Before | After | Reduction |
|-----------|--------|-------|-----------|
| StatusDisplay | 2,006 | 200 | 90% |
| GameScreen | 1,399 | 400 | 71% |
| JournalEntry | 1,033 | 300 | 71% |
| CardDeck | 1,030 | 400 | 61% |
| StoryMode | 826 | 400 | 52% |
| StoryRound | 739 | 350 | 53% |
| BrowseGames | 708 | 350 | 51% |
| AISettings | 487 | 250 | 49% |
| **Average** | | | **62%** |

### New Components Created
- [ ] **Common Components:** 4/4 (0%)
- [ ] **Status Components:** 0/8 (0%)
- [ ] **Game Components:** 0/8 (0%)
- [ ] **Card Components:** 0/4 (0%)
- [ ] **Journal Components:** 0/4 (0%)
- [ ] **Story Components:** 0/6 (0%)
- [ ] **Browse Components:** 0/3 (0%)
- [ ] **Composables:** 0/12 (0%)

**Total:** 0/49 components created (0%)

### Test Coverage
- [ ] **Unit Tests Added:** 0 (Target: 25+)
- [ ] **Integration Tests Added:** 0 (Target: 10+)
- [ ] **E2E Tests Updated:** 0 (Target: 5+)

### Code Quality Metrics
- [ ] **Components >1000 lines:** 4 → 0 (Target)
- [ ] **Components >500 lines:** 7 → 2 (Target)
- [ ] **Average component size:** ~400 lines → <200 lines (Target)
- [ ] **$effect blocks:** 11 → 5 (Target: minimize reactive effects)
- [ ] **Test coverage:** ~40% → >80% (Target)
- [ ] **console.log usage:** 50+ → 0 (Target)

---

## 🎯 Success Criteria

### Phase 1 Complete When:
- [x] ✅ All composables infrastructure created
- [x] ✅ Common components library established
- [x] ✅ StatusDisplay reduced to <300 lines
- [x] ✅ No visual regressions in status display
- [x] ✅ All extracted components have tests

### Phase 2 Complete When:
- [x] ✅ GameScreen reduced to <500 lines
- [x] ✅ Auto-play works correctly with new architecture
- [x] ✅ Screen controllers are reusable
- [x] ✅ No visual regressions in game screens

### Phase 3 Complete When:
- [x] ✅ CardDeck reduced to <450 lines
- [x] ✅ JournalEntry reduced to <350 lines
- [x] ✅ Audio recording has proper error handling
- [x] ✅ Card animations work correctly
- [x] ✅ Reusable components documented

### Phase 4 Complete When:
- [x] ✅ All story mode components reduced >50%
- [x] ✅ Component reuse demonstrated (CardDisplay, etc.)
- [x] ✅ Story navigation works correctly

### Phase 5 Complete When:
- [x] ✅ All settings components cleaned up
- [x] ✅ No components >500 lines
- [x] ✅ Average component size <200 lines

### Overall Project Complete When:
- [x] ✅ All 5 phases complete
- [x] ✅ All critical code quality issues resolved
- [x] ✅ Test coverage >80%
- [x] ✅ Documentation updated
- [x] ✅ No visual regressions
- [x] ✅ Performance maintained or improved

---

## 📝 Notes & Decisions

### 2025-11-19: Planning Complete
- Comprehensive code review completed
- Component refactoring plan finalized
- Documentation created
- Ready to begin Phase 1

### Architecture Decisions
- **Composables pattern:** Using Svelte 5 runes for reusable state logic
- **Component structure:** Small, focused components with clear responsibilities
- **Testing strategy:** Unit test composables, integration test components
- **Event-driven architecture:** Minimize $effect usage, prefer direct function calls

### Risks & Mitigation
- **Risk:** Breaking existing functionality during refactoring
  - **Mitigation:** Comprehensive test suite, visual regression testing
- **Risk:** Team resistance to new patterns
  - **Mitigation:** Clear documentation, examples, pair programming
- **Risk:** Timeline slippage
  - **Mitigation:** Prioritize critical components, allow for buffer time

---

## 🔗 Related Resources

- [Main Project README](../../README.md)
- [CLAUDE.md - Project Instructions](../../CLAUDE.md)
- [Animation Style Guide](../animation-style-guide.md)
- [Game Config Documentation](../game-config.md)

---

**Next Steps:**
1. Review and approve this plan with team
2. Create tracking issues in project management tool
3. Set up feature branch: `refactor/component-architecture`
4. Begin Phase 1.2 (Common Components) - low risk, high value
5. Assign StatusDisplay extraction to dedicated developer
