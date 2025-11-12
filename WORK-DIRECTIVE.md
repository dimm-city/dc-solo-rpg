# DC Solo RPG V2 Migration - Focused Implementation Directive

**Agent Assignment:** Multiple Specialist Agents
**Priority:** CRITICAL - Test Fixes Required
**Status:** 77% Complete - Need test fixes and validation
**Last Updated:** 2025-11-11 (Comprehensive Code Review)

---

## Current State Summary

### COMPLETED (Verified by Code Review)

- ✅ V2 Markdown Parser fully implemented (534 lines, production-ready)
- ✅ V2 game file exists (`/static/games/future-lost.game.md`, 18KB)
- ✅ Ace classification bug FIXED (gameActions.svelte.js lines 134-139)
- ✅ Initial damage roll IMPLEMENTED (gameInit.js lines 56-60)
- ✅ Final damage roll COMPLETE (gameActions.svelte.js line 297 + component)
- ✅ FinalDamageRoll.svelte component exists (Svelte 5 runes, proper state management)
- ✅ Transition state for finalDamageRoll exists (transitions.js line 15-16)
- ✅ finalDamageRoll.test.js exists with passing test suite
- ✅ v2MarkdownParser.test.js exists with 21 passing tests

### CRITICAL ISSUES (Blocking Completion)

**ACTUAL TEST STATUS (Verified 2025-11-11):**

```
Test Files:  5 failed | 5 passed (10 total)
Tests:       72 failed | 245 passed (317 total)
Pass Rate:   77.3%
```

**Priority Breakdown:**

1. ❌ **41 FAILING TESTS** - v2MarkdownParserComplete.test.js (QUICK FIX - 15 min)
   - Root cause: Wrong function name imported (`parseGameMarkdown` vs `parseV2GameFile`)

2. ❌ **18 FAILING TESTS** - wretchedAloneMechanics.test.js (MEDIUM - 2-3 hours)
   - Root cause: Invalid state transitions in test setup
   - Tests calling functions without proper state context

3. ❌ **~13 FAILING TESTS** - Other files (HIGH - 2-4 hours)
   - Need investigation (gameActions.test.js, gameFlow.test.js)

4. ⚠️ **Integration tests TIMING OUT** - Status unknown, needs investigation

### Unit Test Failures Analysis

**Root Causes Identified:**

1. **Parser Test Import Error:** `v2MarkdownParserComplete.test.js` line 16 imports wrong function name
2. **State Machine Violations:** Tests calling action functions without setting `gameState.state`
3. **Test Isolation Issues:** Tests not properly resetting game state between runs
4. **Mock Configuration:** Some tests missing `gameState.config.labels` causing undefined errors

**Key Discovery:** Most failures are **test engineering problems**, not implementation bugs. The production code is solid.

---

## TASK ASSIGNMENTS FOR SPECIALIST AGENTS

### TASK 1: Fix Parser Test Import (CRITICAL - 15 minutes)

**Agent:** bunjs-typescript-expert
**Priority:** HIGHEST (Quick win - 41 tests fixed)

**Objective:** Fix function name import in comprehensive parser test file

**File to Fix:**

- `/home/founder3/code/dimm-city/dc-solo-rpg/src/lib/parsers/v2MarkdownParserComplete.test.js`

**Specific Changes:**

```javascript
// Line 16 - Change from:
import { parseGameMarkdown, ValidationError } from './v2MarkdownParser.js';

// To:
import { parseV2GameFile, ValidationError } from './v2MarkdownParser.js';

// Then find/replace throughout file:
// parseGameMarkdown → parseV2GameFile
```

**Verification:**

```bash
npm run test:unit -- v2MarkdownParserComplete.test.js
```

**Success Criteria:**

- 41 tests pass immediately
- No import errors
- All parser validation tests working

---

### TASK 2: Fix Mechanics Test State Setup (HIGH - 2-3 hours)

**Agent:** svelte-code-reviewer
**Priority:** HIGH (18 tests)

**Objective:** Fix invalid state transitions in wretchedAloneMechanics tests

**File to Fix:**

- `/home/founder3/code/dimm-city/dc-solo-rpg/src/lib/stores/wretchedAloneMechanics.test.js`

**Known Issues:**

#### Issue 1: Tests calling `applyFailureCheckResult()` without proper state

**Lines:** 588, 746, 773, 790

**Error:**

```
Invalid transition: log → gameOver
Valid transitions from log: successCheck, startRound
```

**Fix Pattern:**

```javascript
// BEFORE calling applyFailureCheckResult(), add:
gameState.state = 'failureCheck';
gameState.cardsToDraw = 0;
gameState.config = createMockGameConfig(); // Ensure labels exist
```

#### Issue 2: Tests calling `successCheck()` without proper state

**Line:** 810

**Error:**

```
Invalid transition: startRound → startRound
```

**Fix Pattern:**

```javascript
// Set proper state before successCheck():
gameState.state = 'successCheck'; // or appropriate previous state
```

#### Issue 3: Ace of Hearts detection failing

**Line:** 710

**Investigation Needed:** Card structure may need additional fields

**Specific Tests to Fix:**

1. "should handle exactly lethal damage" (line 741)
2. "should handle maximum bonus (all 4 Aces)" (line 752)
3. "should handle win card as first card" (line 710)
4. All tests with "Invalid transition" errors

**Verification:**

```bash
npm run test:unit -- wretchedAloneMechanics.test.js
```

**Success Criteria:**

- 18 tests pass
- All state transitions valid
- No "Invalid transition" errors

---

### TASK 3: Investigate & Fix Remaining Test Failures (HIGH - 2-4 hours)

**Agent:** svelte-code-reviewer
**Priority:** HIGH (~13 tests)

**Objective:** Fix remaining test failures in gameActions.test.js and gameFlow.test.js

**Files to Investigate:**

1. `/home/founder3/code/dimm-city/dc-solo-rpg/src/lib/stores/gameActions.test.js`
2. `/home/founder3/code/dimm-city/dc-solo-rpg/src/lib/stores/gameFlow.test.js`

**Approach:**

1. Run each test file individually to get exact failure counts
2. Identify failure patterns (likely similar state setup issues)
3. Apply same fix patterns from Task 2
4. Check for assertions that need updating for V2 mechanics

**Known Potential Issues:**

- State transition setup (same as Task 2)
- Status field assertions (expects `undefined`, gets `""`)
- Player object comparisons using `toBe` instead of `toStrictEqual`
- Assertions expecting old behavior (skip to log vs damage check for Aces)

**Verification:**

```bash
npm run test:unit -- gameActions.test.js
npm run test:unit -- gameFlow.test.js
npm run test:unit  # Full suite
```

**Success Criteria:**

- All tests in both files passing
- Zero "Invalid transition" errors
- Assertions match V2 mechanics (Aces trigger damage checks)

---

### TASK 4: Add Card Distribution Tests (MEDIUM - 1 hour)

**Agent:** bunjs-typescript-expert
**Priority:** MEDIUM (New feature)

**Objective:** Verify standard deck has correct V2 card type distribution

**File to Modify:**
`/home/founder3/code/dimm-city/dc-solo-rpg/src/lib/stores/gameStore.test.js`

**Test Suite to Add:**

```javascript
describe('V2 Card Type Distribution', () => {
	test('should have exactly 1 Primary Success (A♥)', () => {
		const config = createMockGameConfig();
		initializeGame(config, { name: 'Test' });
		const aceHearts = gameState.deck.filter((c) => c.card === 'A' && c.suit === 'hearts');
		expect(aceHearts.length).toBe(1);
	});

	test('should have exactly 4 Failure Counters (K♥,K♦,K♣,K♠)', () => {
		const config = createMockGameConfig();
		initializeGame(config, { name: 'Test' });
		const kings = gameState.deck.filter((c) => c.card === 'K');
		expect(kings.length).toBe(4);
	});

	test('should have exactly 3 Narrative cards (A♦,A♣,A♠)', () => {
		const config = createMockGameConfig();
		initializeGame(config, { name: 'Test' });
		const narrativeAces = gameState.deck.filter((c) => c.card === 'A' && c.suit !== 'hearts');
		expect(narrativeAces.length).toBe(3);
	});

	test('should have exactly 16 Challenge cards (3,5,7,9 × 4 suits)', () => {
		const config = createMockGameConfig();
		initializeGame(config, { name: 'Test' });
		const challengeCards = gameState.deck.filter((c) => ['3', '5', '7', '9'].includes(c.card));
		expect(challengeCards.length).toBe(16);
	});

	test('should have exactly 28 Event cards (2,4,6,8,10,J,Q × 4 suits)', () => {
		const config = createMockGameConfig();
		initializeGame(config, { name: 'Test' });
		const eventCards = gameState.deck.filter((c) =>
			['2', '4', '6', '8', '10', 'J', 'Q'].includes(c.card)
		);
		expect(eventCards.length).toBe(28);
	});

	test('should have exactly 20 damage-triggering cards (A,3,5,7,9)', () => {
		const config = createMockGameConfig();
		initializeGame(config, { name: 'Test' });
		const oddCards = gameState.deck.filter((c) => ['A', '3', '5', '7', '9'].includes(c.card));
		expect(oddCards.length).toBe(20);
	});

	test('should have exactly 32 safe cards (2,4,6,8,10,J,Q,K)', () => {
		const config = createMockGameConfig();
		initializeGame(config, { name: 'Test' });
		const safeCards = gameState.deck.filter((c) =>
			['2', '4', '6', '8', '10', 'J', 'Q', 'K'].includes(c.card)
		);
		expect(safeCards.length).toBe(32);
	});

	test('total deck should be exactly 52 cards', () => {
		const config = createMockGameConfig();
		initializeGame(config, { name: 'Test' });
		expect(gameState.deck.length).toBe(52);
	});
});
```

**Success Criteria:**

- 8 new tests added
- All tests passing
- Verifies standard deck composition matches V2 specification

---

### TASK 5: Fix Integration Test Timeouts (HIGH - 2-3 hours)

**Agent:** svelte-code-reviewer
**Priority:** HIGH (Blocks production)

**Objective:** Integration tests complete successfully within timeout

**Files with Issues:**

- `tests/integration/comprehensive-validation.spec.js`
- `tests/integration/full-game-validation.spec.js`
- `tests/comprehensive-mobile-screenshot.spec.js`

**Known Issue:**

- Test timeout (30s) on `page.selectOption('select#gameSelect')`
- Game select dropdown not appearing or not populating

**Investigation Steps:**

1. Check if V2 game loader is working in browser
2. Verify game selection dropdown populates with games
3. Check for JavaScript errors in browser console
4. Verify `/static/games/future-lost.game.md` loads correctly
5. Check network requests for game file loading
6. Examine game list endpoint to ensure V2 games are included

**Possible Causes:**

- V2 game file not being detected by game list endpoint
- Loader trying V2 but failing silently
- Game list endpoint not including V2 games
- Frontend not recognizing `.game.md` file extension

**Fix Approach:**

1. Ensure game list endpoint includes both V1 and V2 games
2. Test V2 game loading in isolation
3. Add better error handling/logging
4. Increase timeout if necessary (but fix root cause first)

**Success Criteria:**

- All integration tests pass within 30s timeout
- No test failures or timeouts
- Games load successfully in browser
- V2 games appear in game selection dropdown

---

### TASK 6: Final Validation (FINAL - 1 hour)

**Agent:** svelte-quality-checker
**Priority:** FINAL

**Objective:** Verify complete game works end-to-end

**Process:**

1. Run full test suite: `npm test`
2. Verify all unit tests pass (317/317 target)
3. Verify all integration tests pass
4. Run end-to-end test 3 times consecutively
5. All 3 runs must complete without failures

**Commands:**

```bash
# Full test suite
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# Watch mode for development
npm run test:unit -- --watch
```

**Success Criteria:**

- ✅ All unit tests passing (317/317)
- ✅ All integration tests passing
- ✅ 3 consecutive successful end-to-end runs
- ✅ No failures, no timeouts, no errors
- ✅ Code quality checks pass

---

## File Paths Reference

### Source Files (Verified Complete)

- Parser: `/home/founder3/code/dimm-city/dc-solo-rpg/src/lib/parsers/v2MarkdownParser.js` (534 lines, production-ready)
- Game Actions: `/home/founder3/code/dimm-city/dc-solo-rpg/src/lib/stores/gameActions.svelte.js` (Ace fix lines 134-139, damage check 170-186)
- Game Init: `/home/founder3/code/dimm-city/dc-solo-rpg/src/lib/stores/gameInit.js` (Initial damage lines 56-60)
- Transitions: `/home/founder3/code/dimm-city/dc-solo-rpg/src/lib/stores/transitions.js` (FSM, 45 passing tests)
- Final Damage Component: `/home/founder3/code/dimm-city/dc-solo-rpg/src/lib/components/FinalDamageRoll.svelte` (Svelte 5 runes)

### Test Files (Need Fixes)

- Parser Tests (Working): `/home/founder3/code/dimm-city/dc-solo-rpg/src/lib/parsers/v2MarkdownParser.test.js` (21 passing)
- Parser Tests (Broken): `/home/founder3/code/dimm-city/dc-solo-rpg/src/lib/parsers/v2MarkdownParserComplete.test.js` (41 failing - import error)
- Mechanics Tests: `/home/founder3/code/dimm-city/dc-solo-rpg/src/lib/stores/wretchedAloneMechanics.test.js` (18 failing - state setup)
- Game Actions Tests: `/home/founder3/code/dimm-city/dc-solo-rpg/src/lib/stores/gameActions.test.js` (status unknown)
- Game Flow Tests: `/home/founder3/code/dimm-city/dc-solo-rpg/src/lib/stores/gameFlow.test.js` (status unknown)
- Final Damage Tests: `/home/founder3/code/dimm-city/dc-solo-rpg/src/lib/stores/finalDamageRoll.test.js` (all passing)
- Game Store Tests: `/home/founder3/code/dimm-city/dc-solo-rpg/src/lib/stores/gameStore.test.js` (target for distribution tests)

### Game Files

- V2 Game: `/home/founder3/code/dimm-city/dc-solo-rpg/static/games/future-lost.game.md` (18,241 bytes, verified exists)
- V1 Game: `/home/founder3/code/dimm-city/dc-solo-rpg/static/games/future-lost/` (directory, legacy)

### Documentation

- Implementation Plan: `/home/founder3/code/dimm-city/dc-solo-rpg/docs/v2/implementation-plan.md`
- Wretched & Alone SRD: `/home/founder3/code/dimm-city/dc-solo-rpg/docs/wretched-alone-mechanics-guide.md`

---

## Testing Commands

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run specific test file
npm run test:unit -- v2MarkdownParserComplete.test.js
npm run test:unit -- wretchedAloneMechanics.test.js
npm run test:unit -- gameActions.test.js
npm run test:unit -- gameFlow.test.js

# Run unit tests in watch mode
npm run test:unit -- --watch

# Run integration tests
npm run test:integration
```

---

## Success Criteria for Task Completion

### Task 1 (Parser Import Fix)

- [x] Function name changed from `parseGameMarkdown` to `parseV2GameFile`
- [x] All references updated throughout test file
- [x] 41 tests passing
- [x] No import errors

### Task 2 (Mechanics Test Fixes)

- [ ] State setup added before all `applyFailureCheckResult()` calls
- [ ] State setup added before all `successCheck()` calls
- [ ] Mock config includes all required fields (labels, etc.)
- [ ] 18 tests passing
- [ ] No "Invalid transition" errors

### Task 3 (Remaining Test Fixes)

- [ ] gameActions.test.js all tests passing
- [ ] gameFlow.test.js all tests passing
- [ ] All state transition issues resolved
- [ ] Assertions updated for V2 mechanics

### Task 4 (Distribution Tests)

- [ ] 8 new distribution tests in gameStore.test.js
- [ ] All tests passing
- [ ] Deck composition verified

### Task 5 (Integration Tests)

- [ ] No timeouts (tests complete < 30s)
- [ ] All integration tests passing
- [ ] V2 games load successfully in browser
- [ ] Game selection dropdown works

### Task 6 (Final Validation)

- [ ] Full test suite passes (317/317)
- [ ] 3 consecutive successful end-to-end runs
- [ ] Code quality checks pass
- [ ] Ready for production

---

## Code Quality Assessment (From Comprehensive Review)

### V2 Parser Implementation: EXCELLENT ⭐⭐⭐⭐⭐

- Security-conscious (ReDoS prevention, input size limits)
- Well-structured (clear separation of parsing phases)
- Robust error handling (custom ValidationError with helpful messages)
- Type safety (proper validation of all card types and counts)
- Maintainable (good function decomposition, clear naming)
- **Assessment:** Production-ready code

### Game Actions Implementation: GOOD ⭐⭐⭐⭐

- Proper Svelte 5 runes usage
- Clear state transitions
- Good logging for debugging
- Ace classification correctly implemented
- **Minor Issue:** Could add state validation guards before transitions

### State Transitions Implementation: EXCELLENT ⭐⭐⭐⭐⭐

- Pure data structure (no side effects)
- Comprehensive state graph
- Emergency exit paths (exitGame, errorScreen)
- Well-tested (45 passing tests)
- **Assessment:** Well-architected finite state machine

---

## Important Notes

### Do NOT Implement (Already Verified Complete)

- ❌ V2 Parser (534 lines, production-ready)
- ❌ Ace bug fix (lines 134-139, correctly implemented)
- ❌ Initial damage roll (lines 56-60, correctly implemented)
- ❌ Final damage roll (line 297 + component, correctly implemented)
- ❌ FinalDamageRoll component (exists with proper Svelte 5 runes)
- ❌ State transitions (45 tests passing, well-architected)

### Focus ONLY On

- ✅ Fixing 72 failing tests (3 categories)
- ✅ Adding 8 distribution tests
- ✅ Fixing integration test timeouts
- ✅ Final validation (3 consecutive runs)

### Key Insight from Code Review

**Most failures are test engineering problems, not implementation bugs.**
The production code is solid. Tests need proper state setup to respect the finite state machine.

---

## Agent Coordination

### Parallel Work Strategy

Tasks 1, 2, 3 can be executed in parallel by different agents:

- Agent A: Task 1 (Parser import fix - 15 min)
- Agent B: Task 2 (Mechanics state fixes - 2-3 hrs)
- Agent C: Task 3 (Remaining test investigation - 2-4 hrs)

Tasks 4, 5, 6 should execute sequentially after Tasks 1-3 complete.

### Reporting Requirements

After each task completion, agent must report:

1. **What was fixed/implemented**
2. **Test results** (pass/fail counts with command output)
3. **Any issues encountered**
4. **Next steps or blockers**

**Report Format:**

````markdown
## Task [N]: [Task Name] - COMPLETE

### Changes Made

- File 1: [specific changes with line numbers]
- File 2: [specific changes with line numbers]

### Test Results

```bash
[paste full test command output]
```
````

### Status

- ✅ Tests passing: X/Y
- ❌ Tests failing: Z
- ⚠️ Issues: [list any blockers]

### Next Steps

- [Next task or dependencies]

```

---

## Critical Reminders

1. **DO NOT claim completion** until all tests pass 3 consecutive times
2. **Run tests after EVERY change** to catch regressions
3. **Fix tests, don't skip them** - tests are the validation criteria
4. **Use absolute file paths** - agent threads may reset cwd
5. **Report actual test output** - show real pass/fail counts
6. **Respect state machine** - Always set proper `gameState.state` before calling action functions
7. **Include mock config** - Ensure `gameState.config.labels` exists in test setup

---

## Estimated Time to Completion

**Task Breakdown:**
- Task 1: 15 minutes (41 tests fixed)
- Task 2: 2-3 hours (18 tests fixed)
- Task 3: 2-4 hours (~13 tests fixed)
- Task 4: 1 hour (8 new tests)
- Task 5: 2-3 hours (integration fixes)
- Task 6: 1 hour (final validation)

**Total Estimated Effort:** 8.25-12.25 hours

**With Parallel Agent Execution:** 5-8 hours wall time

---

**EXECUTION PLAN:**
1. Launch 3 agents in parallel for Tasks 1, 2, 3
2. Monitor progress and test results
3. Once all pass, proceed with Tasks 4, 5, 6 sequentially
4. Final validation with 3 consecutive successful test runs
```
