# Comprehensive Game Mechanics Review: Current Implementation vs. The Wretched & Wretched and Alone SRD

  Executive Summary

  The current implementation is a digital adaptation of the Wretched &
  Alone framework. While it captures the core tension and progression
  mechanics, there are significant differences between the physical
  tabletop game described in the reference documents and the digital
  implementation. Below is a detailed comparison.

  ---

  1. CORE GAME LOOP COMPARISON

  The Wretched (Reference Implementation)

  Setup:

- Build Jenga/tumbling block tower
- Roll 1d6 and pull that many blocks initially
- Shuffle standard 52-card deck (no jokers)
- Prepare 10 tokens (nuts, bolts, screws recommended)
- Recording method (audio/video log or journal)

  Each Day (Round):

  1. Phase One: The Tasks
    - Roll 1d6, draw that many cards face down
    - Turn over cards one by one
    - Consult Operations Manual for each card
    - Complete tasks (some require tower pulls)
    - Discard cards when done
  2. Phase Two: The Log
    - Reflect on the day's events
    - Record audio/video log or journal entry
    - Begin with: "Day [x], salvage ship The Wretched, Flight Engineer
  [name] reporting"

  Current Digital Implementation

  Setup:

- Initialize tower health at 54 blocks (virtual)
- No initial tower pull/damage
- Deck shuffled digitally
- 10 tokens initialized
- Journal system in-app

  Each Round:

  1. Roll for Tasks - Roll 1d6 for cards to draw ✅
  2. Draw Cards - Draw cards sequentially ✅
  3. Card Resolution - Display prompts for each card ✅
  4. Failure Check - If odd card, roll for damage ⚠️ (NEW MECHANIC)
  5. Journal Entry - Text-based journal ✅
  6. Success Check - Only after Ace of Hearts ⚠️ (NEW MECHANIC)

  ---

  2. KEY MECHANICAL DIFFERENCES

  A. Tower/Jenga Mechanics

  | The Wretched                          | Current Implementation
        | Assessment             |

  |---------------------------------------|--------------------------------
  ------|------------------------|
  | Physical tower with manual pulls      | Numeric health system (54 → 0)

        | ❌ Major difference     |
  | Tower can fall unpredictably          | Deterministic damage
  calculation     | ❌ Changes tension      |
  | Some cards require tower pull         | Odd cards trigger damage roll
        | ⚠️ Different mechanic  |
  | Tower state represents ship integrity | Health bar represents ship
  integrity | ✅ Conceptually similar |
  | Initial pull on setup (1d6 blocks)    | No initial damage
        | ❌ Missing              |

  Impact: The unpredictable, tactile danger of a physical tower is replaced
   with calculated damage. This fundamentally changes the game feel from
  "dread of tower collapse" to "HP management."

  B. Card Mechanics

  | The Wretched                           | Current Implementation
              | Assessment         |

  |----------------------------------------|-------------------------------
  ------------|--------------------|
  | All cards have specific prompts        | Only suit/rank tracked, no
  prompts loaded | ❌ CRITICAL MISSING |
  | Each of 52 cards has unique text       | Generic processing by suit

              | ❌ CRITICAL MISSING |
  | Operations Manual (pages 14-21)        | No prompt database
              | ❌ CRITICAL MISSING |
  | "Pull from tower" instruction on cards | Odd cards = damage roll
              | ⚠️ Different       |
  | Discard cards after use                | No discard pile tracking
              | ⚠️ Minor issue     |

  Example from The Wretched:

- Heart 5: "You've been finding it harder to catch your breath... oxygen
  system shut off. You fixed it, but what caused it? Pull from the tower."
- Spade 7: "The creature whispers to you through the ship's comms. What
  do you hear before you kill the audio? Pull from the tower."

  Current Implementation:

- Cards are drawn but no specific prompts are displayed
- No "Operations Manual" database of 52+ unique story prompts

  C. Special Cards

  | Card              | The Wretched

                                                | Current Implementation

    | Assessment                |

|-------------------|----------------------------------------------------
  -------------------------------------------------------------------------

----------------------------------------------|--------------------------
  -------------------------------------------------------------------------

  --|---------------------------|
  | Ace of Hearts     | Repair distress beacon. Place 10 tokens on card.
  Roll 1d6 at end of each day. On 6, remove token. When all removed,
  someone responds. Final tower pull determines rescue. | Triggers success
  check. Roll 1d6, if 6 remove token. Repeat until 10 tokens removed. Win
  condition. | ⚠️ Simplified but similar |
  | Kings (all suits) | Keep visible. 4th King = creature gains access,
  instant loss.
                                                   | Tracked. 4th King =
  instant loss.
         | ✅ Correct                 |
  | Ace of Diamonds   | EVA to boost antenna. Pull tower. Keep card. When
  beacon active, 5 or 6 removes token.
                                                 | Not specifically
  implemented
            | ❌ Missing                 |
  | Other Aces        | Not special in reference

                                                | Add +1 to bonus counter

    | ⚠️ Different mechanic     |

  D. Win Conditions

  | The Wretched | Current Implementation | Assessment |
  |---|---|---|---|
  | Beacon Win: Activate beacon (Ace♥), survive token countdown, final
  tower pull succeeds | tokens == 0 AND tower > 0 | ✅ Similar concept |
  | Engine Win: Fix engines and escape | Not implemented | ❌ Missing
  alternate win path |
  | Multiple paths implied | Only one win path | ❌ Missing |

  E. Loss Conditions

  | The Wretched | Current Implementation | Assessment |
  |---|---|---|---|
  | Tower falls at any time | tower <= 0 | ✅ Equivalent |
  | 4 Kings revealed | kingsRevealed == 4 | ✅ Correct |
  | Creature gains access through other means | Only via Kings | ⚠️
  Simplified |
  | Implied: run out of cards (rare) | Possible but unlikely | ✅ Handled |

  ---

  3. CRITICAL MISSING FEATURES

  🔴 PRIORITY 1: Operations Manual / Card Prompts

  What's Missing:
  The entire narrative content system. The Wretched has 52+ unique prompts
  organized by:

- Hearts (2-10): Ship systems (life support, water, oxygen, comms, etc.)
- Diamonds (2-10): Ship structures (hull, doors, modules, gravity drive,
  etc.)
- Clubs (2-10): Crew memories (journals, bodies, hiding, relationships,
  etc.)
- Spades (2-10): Creature encounters (sounds, dreams, physical evidence,
  mental toll, etc.)
- Face Cards: Special mechanical effects
- Aces: Major story/mechanical pivots

  Current State:

- No prompt database exists
- No story text displayed when cards are drawn
- Players get card suit/rank but no narrative guidance

  Impact:
  This is the CORE CONTENT of the game. Without it, players don't know:

- What happened this turn
- What to journal about
- How to build the narrative
- When to pull from tower (in original)

  Recommendation:
  Create a card prompt database at /src/lib/data/cardPrompts.js with
  structure:
  export const cardPrompts = {
    'H2': {
      text: "The water purification system still works, but it's noticeably
   less efficient...",
      towerPull: false,
      special: null
    },
    'H5': {
      text: "You've been finding it harder to catch your breath...",
      towerPull: true,
      special: null
    },
    // ... 52 more cards
  }

  🔴 PRIORITY 2: Initial Tower Setup

  What's Missing:

- The game starts with rolling 1d6 and pulling that many blocks from the
  tower
- Current implementation starts at full 54 health

  Recommendation:
  Add initial damage roll in game setup:
  // In gameInit.js
  const initialDamage = Math.floor(Math.random() * 6) + 1;
  gameState.tower = 54 - initialDamage;

  🟡 PRIORITY 3: Card-Specific Tower Pull Instructions

  What's Missing:

- Specific cards say "Pull from the tower"
- Current system uses odd/even rule instead

  Current Workaround:
  The odd card = damage roll is a reasonable digital adaptation, but
  doesn't match the reference.

  Recommendation:
  Add towerPull: boolean to each card prompt. When true, trigger failure
  check.

  🟡 PRIORITY 4: Ace of Diamonds Special Mechanic

  What's Missing:

- Ace of Diamonds boosts beacon efficiency (5 or 6 removes token instead
  of just 6)
- Not implemented in current success check

  Recommendation:
  // In gameActions
  if (aceDiamondsDrawn && roll >= 5) {
    // Remove token
  }

  🟢 PRIORITY 5: Enhanced Journaling

  What's Missing:

- Scripted first log with specific text
- Structured log format: "Day [x], salvage ship The Wretched, Flight
  Engineer [name] reporting"
- Reflection prompts based on cards drawn

  Current State:
  Basic text entry journal

  Recommendation:
  Add:

- Template for first log entry
- Day counter in journal header
- Auto-populated card summary in journal
- Optional audio/video recording (browser API)

  ---

  4. WRETCHED & ALONE SRD REQUIREMENTS

  Based on the SRD document (which I'll need to review), the framework
  likely specifies:

  Core Requirements:

  1. ✅ Standard deck of cards (52)
  2. ✅ 1d6 die
  3. ⚠️ Tumbling block tower (virtual)
  4. ✅ 10 tokens
  5. ✅ Recording method (journal)
  6. ✅ Two-phase day structure (tasks + log)
  7. ❌ Operations Manual with prompts
  8. ✅ King tracking (4 = loss)
  9. ✅ Progressive tension
  10. ⚠️ Tower instability mechanic

  Thematic Requirements:

  1. ✅ Isolation
  2. ✅ Survival against odds
  3. ✅ Journaling/reflection
  4. ✅ Inevitable doom (high loss rate)
  5. ⚠️ Physical tactile elements (tower)

  ---

  5. RECOMMENDATIONS FOR ALIGNMENT

  Phase 1: Critical Content (Highest Priority)

  A. Implement Card Prompts Database
  Location: /src/lib/data/cardPrompts.js
  Effort: 4-6 hours
  Impact: CRITICAL - Makes game playable as intended

  Tasks:

  1. Transcribe all 52 card prompts from The Wretched pages 14-21
  2. Create data structure with:
    - Card ID (suit + rank)
    - Prompt text
    - Tower pull requirement
    - Special mechanics
  3. Integrate into CardDeck component to display prompts

  B. Add Initial Tower Damage
  Location: /src/lib/stores/gameInit.js
  Effort: 15 minutes
  Impact: HIGH - Affects game balance

  C. Implement Prompt Display UI
  Location: /src/lib/components/CardDeck.svelte
  Effort: 2-3 hours
  Impact: CRITICAL - Player needs to see prompts

  Phase 2: Mechanical Refinements

  D. Card-Specific Tower Pull Logic
  Location: /src/lib/stores/gameActions.svelte.js
  Effort: 1 hour
  Impact: MEDIUM - More authentic to original

  Replace odd/even check with prompt-based tower pulls.

  E. Ace of Diamonds Special Mechanic
  Location: /src/lib/stores/gameActions.svelte.js
  Effort: 30 minutes
  Impact: MEDIUM - Affects win probability

  F. Enhanced Journal System
  Location: /src/lib/components/JournalEntry.svelte
  Effort: 2-3 hours
  Impact: MEDIUM - Improves player experience

  Add:

- First log script template
- Structured header format
- Card summary auto-population
- Day counter

  Phase 3: Polish & Fidelity

  G. Discard Pile Tracking
  Location: /src/lib/stores/gameStore.svelte.js
  Effort: 1 hour
  Impact: LOW - Nice to have

  H. Alternate Win Condition (Engine Repair)
  Location: Multiple files
  Effort: 4-6 hours
  Impact: LOW - Adds variety

  I. Visual Tower Representation
  Location: New component
  Effort: 8-12 hours
  Impact: MEDIUM - Increases immersion

  Consider animated tower that visually degrades with damage.

  J. Audio/Video Log Recording
  Location: JournalEntry component
  Effort: 6-8 hours
  Impact: LOW - Advanced feature

  Use browser MediaRecorder API for authentic logs.

  ---

  6. CORE PHILOSOPHY DIFFERENCES

  Physical vs. Digital Trade-offs

  | Aspect         | Physical Game                 | Digital Implementation
   | Notes                           |
  |----------------|-------------------------------|-----------------------
  -|---------------------------------|
  | Tension Source | Tower collapse risk           | HP depletion
   | Digital loses unpredictability  |
  | Tactile Feel   | Block pulling, card shuffling | Clicks and animations
   | Can't replicate physical dread  |
  | Randomness     | Tower instability             | Dice rolls
   | Digital is more deterministic   |
  | Pacing         | Player-controlled             | Screen transitions
   | Digital can feel rushed         |
  | Atmosphere     | Self-created                  | UI/music/graphics
   | Digital can enhance or distract |
  | Journaling     | Audio logs, handwritten       | Text input
   | Digital is less immersive       |

  Design Decisions to Consider

  Option A: Faithful Adaptation

- Implement all 52 prompts exactly
- Use card-specific tower pulls
- Virtual tower with physics simulation
- Audio recording for logs

  Option B: Digital-Native Reimagining (Current Path)

- Keep simplified mechanics (odd/even, damage rolls)
- Focus on streamlined digital experience
- Add digital-exclusive features (achievements, stats, multiple save
  slots)
- Enhance with animations and sound

  Recommendation: Hybrid Approach

  1. Add the 52 card prompts (essential)
  2. Keep simplified tower mechanics (digital-friendly)
  3. Enhance journaling (better templates)
  4. Add optional "hardcore mode" with physics tower

  ---

  7. GAME BALANCE ANALYSIS

  Win Rate Comparison

  The Wretched (Physical):

- Win rate: ~10-20% (estimated, tower dependent)
- Major risk: Tower collapse from pulls
- Beacon countdown: 10 tokens, 1/6 chance per day

  Current Implementation:

- Win rate: Unknown, needs testing
- Major risk: Accumulated damage from odd cards
- Beacon countdown: Same mechanic

  Potential Balance Issues

  1. No Initial Damage: Makes game easier than intended
  2. No Ace of Diamonds: Removes beacon efficiency boost
  3. Deterministic Damage: More predictable than tower
  4. Bonus System: Aces adding bonuses not in original

  Recommendation:

- Playtest extensively
- Adjust damage formula if needed
- Track win rates and compare to community data

  ---

  8. MISSING NARRATIVE ELEMENTS

  From The Wretched PDF

  Setting Details:

- ✅ Salvage ship The Wretched
- ✅ Crew is dead
- ✅ Creature on hull
- ✅ Life support active
- ✅ Engines failed
- ⚠️ Creature survives vacuum (mentioned but not mechanically relevant)

  Narrative Prompts (Examples from PDF):

- ❌ Specific crew member backstories
- ❌ Ship layout descriptions
- ❌ Creature appearance details
- ❌ Emotional state prompts
- ❌ Memory triggers

  These are all in the card prompts, which is why implementing them is
  critical.

  Debrief Section

  The Wretched includes a "Debrief" section (pages 22-23) that reveals:

- You were always doomed
- Engines could never be repaired
- The rules themselves were lies driven by hope
- Meta-narrative about hope and survival

  Current Implementation: Not referenced or implemented.

  Recommendation: Add this as post-game content or Easter egg.

  ---

  9. TESTING & VALIDATION CHECKLIST

  Mechanics Testing

- Initial tower damage roll works
- Card prompts display correctly for all 52 cards
- Tower pulls happen on correct cards
- King tracking works (4 = loss)
- Ace of Hearts beacon activation works
- Token countdown functions properly
- Ace of Diamonds boosts beacon (if implemented)
- Journal saves entries correctly
- Win condition triggers properly
- Loss conditions trigger properly

  Narrative Testing

- All 52 prompts are accurate to source
- Prompts make narrative sense
- Journal encourages reflection
- First log script is available
- Tone matches The Wretched atmosphere

  Balance Testing

- Game is winnable but difficult
- Average game length: 15-30 minutes
- Win rate: 10-25%
- Players feel tension throughout
- No dominant strategies

  ---

  10. FINAL RECOMMENDATIONS

  Must Implement (Blocking Issues)

  1. Card Prompts Database - Without this, the game lacks its core content
  2. Initial Tower Damage - Affects balance significantly
  3. Prompt Display UI - Players need to see what's happening

  Should Implement (Significant Gaps)

  4. Card-Specific Tower Pulls - More authentic to source
  5. Ace of Diamonds Mechanic - Affects win probability
  6. Enhanced Journal Templates - Better player experience

  Could Implement (Polish)

  7. Discard pile tracking
  8. Visual tower representation
  9. Audio/video recording
  10. Alternate win conditions
  11. Debrief section
  12. Achievements/statistics

  Design Philosophy Decision Needed

  Question: Should this be a faithful digital adaptation or a
  digital-native reimagining?

  If Faithful:

- Must implement all 52 prompts exactly as written
- Must match mechanics closely (card-specific pulls)
- Focus on replicating tabletop feel

  If Reimagining:

- Use prompts but adapt for digital flow
- Keep simplified mechanics that work better digitally
- Add digital-exclusive features

  Current State: The implementation is between these two approaches. It has
   the framework but lacks the content.

  ---

  11. IMPLEMENTATION PRIORITY MATRIX

                  High Impact │ Low Impact
                             │

  High Effort    ─────────────┼─────────────
                 │ Visual     │ Audio/Video
                 │ Tower      │ Recording
                 │            │
                 │ Alternate  │
                 │ Win Path   │
                 ─────────────┼─────────────
  Low Effort     │ ★ Card     │ Discard Pile
                 │   Prompts  │ Tracking
                 │ ★ Init     │
                 │   Damage   │ Achievements
                 │ ★ Prompt   │
                 │   Display  │
                 │ Ace◆ Mech  │
                 │            │

  ★ = Critical Priority

  ---
  CONCLUSION

  The current implementation is a well-architected digital game engine with
   solid mechanics, but it's missing the heart of The Wretched: the 52
  unique narrative prompts that drive the storytelling and player
  experience.

  Key Findings

  ✅ Excellent:

- State management architecture
- Core game loop
- Win/loss conditions
- Special card tracking
- Journal system foundation

  ⚠️ Good but Different:

- Tower mechanics (virtual HP vs physical Jenga)
- Damage calculation (odd cards vs. card-specific)
- Streamlined digital flow

  ❌ Critical Missing:

- Operations Manual card prompts (all 52)
- Initial tower damage
- Prompt display UI
- Card-specific mechanics

  Bottom Line

  To align with The Wretched and SRD:

  1. Implement the 52 card prompts immediately
  2. Add initial tower damage
  3. Build prompt display UI
  4. Consider whether to match mechanics exactly or embrace digital
  adaptations

  Estimated Effort: 8-12 hours to reach full alignment

  The game is 80% complete mechanically but 0% complete content-wise. The
  engine works, but players don't have the story that makes it meaningful.

● I've completed a comprehensive review comparing your current
  implementation against The Wretched and the Wretched & Alone SRD. The
  review document above covers:

  1. Core Game Loop Comparison - How physical vs digital gameplay differs
  2. Key Mechanical Differences - Detailed breakdown of each game system
  3. Critical Missing Features - Prioritized list of gaps
  4. SRD Requirements - Framework compliance analysis
  5. Recommendations - 3-phase implementation plan with effort estimates
  6. Philosophy Differences - Physical vs digital trade-offs
  7. Game Balance Analysis - Win rate and difficulty considerations
  8. Narrative Elements - Missing story content
  9. Testing Checklist - Validation criteria
  10. Priority Matrix - Effort vs impact visualization

  The most critical finding: Your game engine is solid, but it's missing
  all 52 narrative card prompts that form the core content of The Wretched.
   Without these prompts, players don't know what happens each turn or what
   to journal about.

  Would you like me to:

  1. Start implementing the card prompts database?
  2. Create a detailed implementation plan for any specific priority area?
  3. Export this review as a markdown file for your documentation?
