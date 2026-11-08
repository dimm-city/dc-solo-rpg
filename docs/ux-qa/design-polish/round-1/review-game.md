# Design polish, round 1: game UX review

Reviewer: game UX designer (information design of play). Code under test: `claude/vibrant-curie-w9bn88` @ 563b9b1
(round-1 captures). Verdict: **not approved**. 22 findings (5 high, 15 medium, 2 low) plus the OWN-2
specification. The lens: at every step, does the player see what they need, in a stable place, in the right
order of importance, said once, and true to the rules for their difficulty?

## Method

- Read the board and surfaces manifests, the drift tables (all six core viewports), the metrics digests
  (`summary`/`issues`, per-state HUD and board text boxes via python), and every board sheet that bears on
  play: drift sheets, HUD tier matrix, captions, cards, Salvation by difficulty, endings, journal, story mode,
  intro, Help and Settings. Individual shots for detail; crops and montages are in
  `review-game/crops/` (montage script `review-game/montage.py`).
- Source read-only in `/home/user/dc-solo-rpg`: `GameScreen.svelte`, `game/ContextBackground.svelte`,
  `game/StepAction.svelte`, `AugmentedButton.svelte`, the six HUD cells and `hudTiers.js`, `utils/rollResult.js`,
  `card/cardInfo.js`, `composables/useRuleCaptions.svelte.js`, `utils/endingSummary.js`, `GameOver.svelte`.
- DSEG7 Classic glyph coverage checked from the font's cmap
  (`node_modules/dseg/fonts/DSEG7-Classic/DSEG7Classic-Bold.ttf`): ` !-.0-9:A-Za-z_`, **no `/`**.
- Contrast computed with the WCAG 2.x formula on the sampled backgrounds from the metrics.
- Frameworks: Hodent's pillars (clarity, form follows function, feedback, consistency, minimal cognitive
  load), Nielsen (visibility of status, match with the real world, consistency, recognition over recall),
  the SRD's progressive rule teaching, and the VectorLab `ux-audit`, `verbs` and `motion` skills
  (no `.ux-profile.md`: catalog defaults).
- No dev server was needed: every finding below is shown by a capture, a measurement or a file:line.

## Principle used for every copy finding: one job per element

| Element | Its one job | Never |
|---|---|---|
| Screen title | the phase (Instability, Round N, Stability Check, Final Check, Salvation) | wrap past its slot |
| Eyebrow | the cause (the card behind a check) | |
| Description (before the roll) | the stakes: what the numbers will do | restate the button |
| Result line (after the roll) | the outcome, in a fixed grammar | restate the button or the HUD totals |
| Step button | the next action, verb first, one line | carry rules or totals |
| Modifier hint (Lucid/Surreal) | the dice rule this roll will use | ride inside the button |
| Rule caption (tips on, once) | the general rule, true when shown | repeat the description |
| HUD | the running totals and their tiers | |

## Findings

### GD-1-01 · high · "Salvation is assured / automatic" is false with four Aces
- **Surface:** board step button, card mechanic note, Help rule tip, Settings difficulty help, Aces tooltip.
- **Viewports:** all. **States:** salvation-n4-step, notice-skip-damage, card-skip-damage, salvation-n4-fatal, settings-game, help-game.
- **Issue:** On Normal and Hard, with four Aces each Salvation is a Stability check and the game is lost if it
  takes Stability to 0 (CLAUDE.md). The copy promises the opposite: the button reads "ROLL FOR STABILITY ·
  SALVATION IS ASSURED", the fourth Ace's card says "ACE · SALVATION IS NOW ASSURED", Help and Settings say
  "automatic".
- **Evidence:** `shots/board/salvation-n4-step/*.png` (button), `shots/board/salvation-n4-fatal/*.png` (the
  same roll: "Rolled 3 · −2 Stability · 0/20 · nothing left to hold on to", game lost),
  `shots/board/card-skip-damage/iphone-13.png`. Sources: `src/lib/utils/rollResult.js:210`,
  `src/lib/components/card/cardInfo.js:82,87`, `src/lib/components/HelpModal.svelte:18`,
  `src/lib/components/settings/SettingsModal.svelte:69`, `src/lib/components/status/hudTiers.js:68`.
- **Recommendation:** remove "assured" and "automatic" from all player copy. Exact copy:
  - step button: "Roll for Salvation" (see GD-1-05/GD-1-10);
  - description with four Aces: "No target now: this roll is a Stability check. Hold on and a token comes off.";
  - card note: Ace of Hearts as the fourth Ace "Salvation unlocked · no target"; another Ace making four with
    Salvation unlocked "Ace · Salvation now has no target"; before the Ace of Hearts "Ace · Salvation will have no target"
    (each followed by "· a Stability check follows" when it applies, as now);
  - Help `ace`: "Every Ace you reveal makes Salvation easier. With all four there is no target: each Salvation is a
    Stability check, and the token comes off if you hold on.";
  - Settings: "Normal: missed Salvation rolls add no Tokens; with four Aces each Salvation is a Stability check.";
  - `fourAcesRule` (Normal/Hard): "each Salvation is a Stability check; hold on and a token comes off".
- **Acceptance:** `grep -rniE "assured|automatic after" src/lib --include=*.svelte --include=*.js` finds no player
  copy (tests aside); salvation-n4-step, notice-skip-damage, card-skip-damage, settings-game and help-game show the
  new copy at 360 and 1440.
- **Files:** `src/lib/utils/rollResult.js`, `src/lib/components/card/cardInfo.js`, `src/lib/components/HelpModal.svelte`,
  `src/lib/components/settings/SettingsModal.svelte`, `src/lib/components/status/hudTiers.js`, their tests.

### GD-1-02 · high · Rule captions arrive a round late, and say things that are no longer true
- **Surface:** rule caption (tips on). **Viewports:** all. **States:** caption-ace, caption-lucid, caption-surreal, caption-king, caption-salvation.
- **Issue:** Captions queue FIFO, one per screen, and only on a screen type other than the last caption's
  (`useRuleCaptions.svelte.js:222`); the text is frozen when the trigger fires. In the scripted Normal game
  (capture notes): the King caption shows on Salvation, the Ace caption on round 2, Lucid on round 2's check,
  Surreal on round 2's Salvation, and "Salvation unlocked" only on **round 3**, after two Salvation screens.
  By then: caption-ace says "You now need 17+" while the HUD shows Aces 2/4 (14+); caption-lucid and
  caption-surreal say "Your next roll uses two dice" on a screen whose roll does not (the step button carries no
  hint, the HUD arrows are dark). Progressive teaching that teaches after the fact, or wrongly, breaks trust.
  Also: "salvation" is lower case in three captions while the game term is "Salvation" everywhere else, and the
  King caption opens with a bare "1 of 4."
- **Evidence:** `shots/board/caption-ace/iphone-13.png` (HUD 2/4, caption 17+), `shots/board/caption-lucid/iphone-13.png`
  and `caption-surreal` (no modifier hint on the button, both arrows dim; crops `review-game/crops/hud-caption-*.png`),
  `tools/board/notes-round-1.md` ("Rule captions show late in a real game"). Source:
  `src/lib/composables/useRuleCaptions.svelte.js:22-40,104-140,195-230`.
- **Recommendation:**
  1. Each caption gets a priority and a "still true" check run when it is about to show; a caption that is no
     longer true is dropped. Priority: salvation, fourth-ace, lucid/surreal, king, ace, token, odd.
  2. Show on the screen where the rule bites: `salvation` on the first Salvation screen (pre-empts the queue);
     `lucid`/`surreal` on the next roll step while the modifier is pending (dropped once used); `king` and `ace`
     on the next table screen; drop the "screen type must differ" rule for these.
  3. Timeless wording, built at show time:
     - odd: "Odd cards call for a Stability check." (the stakes live in the description, GD-1-05)
     - king: "King {n} of 4. When all four are revealed, your journey ends." ({n} = live count)
     - ace: "Each Ace makes Salvation easier: 17+ with one, 14+ with two, 11+ with three." Easy at 3 Aces (still 3
       when shown): append " One more Ace and you escape, if you survive its check."
     - lucid: "A natural 20 makes you Lucid: your next roll uses two dice and keeps the higher."
     - surreal: "A natural 1 makes you Surreal: your next roll uses two dice and keeps the lower."
     - token (Hard): "On Hard, a missed Salvation roll adds a token. Hope costs."
     - fourth-ace (Easy): "On Easy, the fourth Ace ends the game."
- **Acceptance:** replay the scripted Normal game (capture request CR-2): Salvation caption on round 1's first
  Salvation screen; each Lucid/Surreal caption only on a screen whose step shows the matching hint; the Ace caption
  never names a threshold that disagrees with the HUD; no caption later than the first table screen after its
  trigger; every caption writes "Salvation" with a capital S.
- **Files:** `src/lib/composables/useRuleCaptions.svelte.js` (+ test), `src/lib/components/HelpModal.svelte` (keep the
  "Rules you've met" texts in step).

### GD-1-03 · high · The board column jumps 97-154px between consecutive steps
- **Surface:** board (screen title, eyebrow, caption, description/result, notice). **Viewports:** all six core.
- **States:** every board state; worst pairs: instability-roll → instability-result, stability-check → stability-nat1,
  easy-final-check, caption-*, task-result-nat20.
- **Issue:** The column's bottom is pinned to the 40% line and it grows upwards
  (`ContextBackground.svelte:68,89`), so every extra line (a caption, an eyebrow, a 2-line title, a 2-3 line result)
  lifts the title. The eye's anchor moves on almost every press. Owner's named defect.
- **Evidence:** `drift-board.md` max deltas: screen title Δtop 97 (android-small), 103 (iphone-13), 98 (landscape),
  137 (ipad-portrait), 87 (laptop), 154 (desktop); rule caption Δtop 132 (iphone-13), 186 (ipad-portrait); result
  line Δtop 48 (phones) to 101 (landscape). Drift sheets `sheets/board/drift-*.png`.
- **Recommendation:** pin the column from the top with fixed slots per viewport; nothing pushes anything:
  1. **Caption slot:** reserved directly under the HUD (top = HUD bottom + 12px), two caption lines tall (57px
     measured), the caption fades in and out inside it. On landscape phones (max-height 500px) the caption takes the
     empty right-hand column above the step button, at the button's width.
  2. **Eyebrow slot:** one line (21px), empty unless a card caused the step.
  3. **Title slot:** fixed height, two title lines below 600px wide, one line from 600px and on landscape
     (GD-1-04); title text bottom-aligned in the slot.
  4. 12px gap, then the **body slot** (description before the roll, result after): min-height two result lines,
     text top-aligned, so a longer result grows down, never up.
  5. **Notice:** directly under the body slot's reserved height.
- **Acceptance:** re-run the drift tables: per viewport, across all board states, eyebrow top, title bottom,
  body (description/result) top and notice top move ≤ 2px; title top differs only between one- and two-line titles
  (≤ one title line-height) and not at all for the same title; a caption appearing moves nothing else (Δ 0); the
  body slot ends above the dice landing line (44% of the table) at every core viewport.
- **Files:** `src/lib/components/game/ContextBackground.svelte`, `src/lib/components/GameScreen.svelte`,
  `src/lib/components/RuleCaption.svelte`.

### GD-1-04 · medium · Screen titles wrap to two or three lines where one fits
- **Surface:** screen title. **Viewports:** ipad-portrait, laptop, desktop (two and three lines); landscape (three lines).
- **States:** stability-check (and every Stability Check state), easy-final-check, caption-easy-fourth-ace.
- **Issue:** At 1440px the column is 960px wide, yet "STABILITY CHECK" sets in two lines (614×120) and
  "FINAL STABILITY CHECK" in three (614×185): the title is 56px lixdu (about 1.18em per character), so 15
  characters need 991px. The three-line title is the tallest thing on the board and pushes the result line down.
- **Evidence:** metrics: easy-final-check desktop title textBox 613.8×184.8, laptop the same, ipad-portrait
  547×164.8, landscape 341.9×102.8; `review-game/crops/m-desk-a.png`, `m-land-a.png`.
- **Recommendation:** rename "Final Stability Check" to **"Final Check"** (the eyebrow names the Ace, the
  description says Stability; 11 characters, the same as INSTABILITY). Cap the title so "STABILITY CHECK" is one
  line from 600px: `font-size: clamp(1.375rem, 5vw, 3rem)` (768px: 38px ≈ 680px in a 691px column; 1440px: 48px ≈
  850px in 960px), and `1.75rem` at `max-height: 500px` (landscape: ≈ 496px in a 542px column). Phones keep the
  current minimum (22-25px, "INSTABILITY" on one line at 360px) with a two-line title slot (GD-1-03).
- **Acceptance:** metrics: every screen title is one line at ≥ 600px wide and on landscape, at most two lines on
  phones; "INSTABILITY" one line at 360px.
- **Files:** `src/lib/components/game/ContextBackground.svelte:124`, `src/lib/components/GameScreen.svelte` (title),
  `src/lib/stores/gameActions.svelte.js`/tests that assert the title.

### GD-1-05 · medium · The same fact is said two to four times on one screen
- **Surface:** board description, result line, step button, rule caption, HUD.
- **Viewports:** all. **States:** salvation-n*-step, salvation-e*-step, salvation-h1-step, round-start, task-result,
  stability-check, caption-odd, caption-easy-fourth-ace, easy-final-check, stability-nat1/round-start-surreal and the
  other Lucid/Surreal pairs, instability-roll.
- **Issue:** examples, verbatim:
  - salvation-n2-step: description "Roll to remove a token. You need 14+." and button "ROLL TO REMOVE A TOKEN · NEED 14+".
  - caption-easy-fourth-ace: caption "Survive its Stability check and you escape.", description "Survive this one
    Stability check and you escape.", button "ROLL FOR STABILITY · SURVIVE THIS AND YOU ESCAPE". Three times.
  - caption-odd: caption "Odd cards test your Stability. Roll the d20; low rolls cost Stability.", description
    "An odd card demands a price. Roll to see how much Stability you lose.", button "ROLL FOR DAMAGE".
  - task-result: result "Rolled 16 · Draw 5 cards", button "DRAW 5 CARDS".
  - round-start: description "Roll to see how many cards you draw this round.", button "ROLL FOR TASKS".
  - A natural 1: result "… Surreal: your next roll keeps the lower of two dice", caption "Surreal. Your next roll
    uses two dice and keeps the lower.", next button "… Surreal: 2 dice, keep low", HUD arrow. Four times.
- **Evidence:** `review-game/crops/m-iphone-a.png`, `m-iphone-capt.png`, `m-desk-a.png`; metrics texts for the states above.
- **Recommendation:** apply the one-job table above. Exact copy (Normal unless noted):

  | Step | Title | Description (before the roll) | Button |
  |---|---|---|---|
  | Opening roll | Instability | "Before your journey begins, the situation is already precarious. 10 or less costs Stability." | Roll for instability |
  | Round start | Round N | "Your roll sets how many cards you draw, from 1 to 6." | Roll for tasks |
  | Stability check | Stability Check | "An odd card demands a price. 10 or less costs Stability; 11 or more holds." | Roll for Stability |
  | Fourth Ace, Easy | Final Check | "The fourth Ace is out. Keep any Stability through this roll and you escape; lose the last of it and you fall." | Roll for Stability |
  | Salvation, 1-3 Aces | Salvation | "You need 14+ to remove a token." Hard adds: " A miss adds one." | Roll for Salvation |
  | Salvation, 4 Aces | Salvation | "No target now: this roll is a Stability check. Hold on and a token comes off." | Roll for Salvation |

  The stakes are exact per the rules (1: −3, 2-5: −2, 6-10: −1, 11-19: 0, 20: +1; tasks 1 to 6 cards). Captions as in
  GD-1-02, results as in GD-1-07, the modifier hint as in GD-1-09. After the task roll the button reads "Draw the
  cards" ("Draw the card" for one) and the result "Rolled 16 · 5 cards this round".
- **Acceptance:** on every board state no two of {caption, description or result, button label, notice} share a run
  of three or more words (case-insensitive); the copy matches the table at every difficulty.
- **Files:** `src/lib/components/GameScreen.svelte:95-150`, `src/lib/utils/rollResult.js`,
  `src/lib/composables/screen/useRollForTasks.svelte.js:117-123`, `useSuccessCheck`, `useFailureCheck`,
  `src/lib/composables/useRuleCaptions.svelte.js`, their tests.

### GD-1-06 · medium · One roll, two names: "Roll for damage" vs "Roll for Stability"
- **Surface:** step button. **Viewports:** all. **States:** stability-check, stability-check-ace, stability-check-lucid/surreal,
  notice-return-king, caption-odd vs salvation-n4-step, easy-final-check.
- **Issue:** The Stability check is "ROLL FOR DAMAGE"; the identical roll on the Stability table is "ROLL FOR STABILITY"
  with four Aces and on Easy's final check. "Damage" appears nowhere else (the HUD, results and rules say Stability),
  and a natural 20 heals (+1).
- **Evidence:** `shots/board/stability-check/*` vs `shots/board/salvation-n4-step/*`; `useFailureCheck.svelte.js:121`.
- **Recommendation:** "Roll for Stability" on every Stability check (normal, final, four-Ace Salvation uses "Roll for
  Salvation" per GD-1-05).
- **Acceptance:** no "damage" in any player-facing label; all Stability checks read "ROLL FOR STABILITY".
- **Files:** `src/lib/composables/screen/useFailureCheck.svelte.js`, `screenComposables.test.js`, e2e selectors that use the text.

### GD-1-07 · medium · Result lines change grammar by outcome and run to three lines
- **Surface:** result line. **Viewports:** all (wraps worst at 360-390 and landscape).
- **States:** stability-6-10 vs stability-nat1/nat20, task-result-nat20, salvation-n*-nat20/nat1, salvation-n4-*.
- **Issue:** A plain check ends with the total ("Rolled 8 · −1 Stability · 18/20"); a natural 1 or 20 drops it and
  appends a 9-word rule ("Natural 1 · −3 Stability · Surreal: your next roll keeps the lower of two dice"); Salvation
  appends "· 5 left". The totals repeat the HUD 300px above; the rule sentence makes the line 2-3 lines (44-68px at
  360) and, with the bottom-anchored column, lifts the title 24-48px.
- **Evidence:** drift-board.md (android-small: task-result-nat20 result 254×68, Δtop −48; stability-nat1 Δtop −24);
  `review-game/crops/m-laptop-a.png` (salvation-n4-nat1: five segments).
- **Recommendation:** one grammar: `[roll] · [effect] · [modifier word]`, no running totals on screen (the HUD shows
  them, and OWN-2 makes the change visible there); the polite live announcement keeps the totals for screen-reader
  users ("Stability 18 of 20"). The modifier is one word, "Lucid" (#00ffaa) or "Surreal" (#f07cff), both ≥ 7:1 on the
  table. Exact lines: "Rolled 8 · −1 Stability"; "Rolled 15 · no Stability lost"; "Natural 20 · +1 Stability · Lucid";
  "Natural 20 · Stability already full · Lucid"; "Natural 1 · −3 Stability · Surreal"; "Rolled 6 (low of 6, 15) ·
  −1 Stability"; fatal "Rolled 3 · −2 Stability · nothing left to hold on to"; Easy final "Rolled 15 · Stability holds
  · you escape"; tasks "Rolled 16 · 5 cards this round", "Natural 20 · 6 cards this round · Lucid"; Salvation "Rolled 17
  · −1 token", "Natural 20 · −2 tokens · Lucid", "Rolled 16 · needed 17+ · no token lost", "Natural 1 · no token lost ·
  Surreal", Hard "Rolled 9 · needed 17+ · +1 token", "Natural 1 · +2 tokens · Surreal"; four Aces "Rolled 15 · Stability
  holds · −1 token", "Rolled 8 · −1 Stability · −1 token", "Natural 1 · −3 Stability · −1 token · Surreal"; last token
  per GD-1-08.
- **Acceptance:** every result line is one line at ≥ 390px and at most two at 360px; no "/20" or "left" in a result
  line except the terminal ones; the live region still reads the totals.
- **Files:** `src/lib/utils/rollResult.js` (+ test), `src/lib/components/GameScreen.svelte` (announcer text).

### GD-1-08 · medium · Winning by the last token is the flattest moment in the game
- **Surface:** result line, ending cause line. **Viewports:** all. **States:** salvation-last-token, gameover-win-tokens, game-over-win.
- **Issue:** The roll that wins reads like any hit: "Rolled 15 · −1 token · 0 left". The fatal roll gets "nothing left
  to hold on to" and Easy's escape gets "you escape". On the ending, the Kings, Stability and fourth-Ace endings each
  carry a cause line; the token win has none (`endingSummary.js:37-44` returns ''), though the timeline already says
  "The last token was removed." (`gameTimeline.js:17`).
- **Evidence:** `review-game/crops/m-laptop-a.png` (salvation-last-token), `review-game/crops/m-iphone-end.png`
  (gameover-win-tokens has no gold cause line; gameover-win-easy-ace has one).
- **Recommendation:** result "Rolled 15 · the last token is gone · you escape" (button stays "Escape"); ending cause
  line "The last token was removed." in the victory accent, as the fourth-Ace win does.
- **Acceptance:** salvation-last-token and gameover-win-tokens show the new lines at 360 and 1440.
- **Files:** `src/lib/utils/rollResult.js`, `src/lib/utils/endingSummary.js` (+ tests).

### GD-1-09 · high · The Lucid/Surreal hint inside the step button is unreadable (Surreal 2.06:1) and grows the button
- **Surface:** step button. **Viewports:** all.
- **States:** round-start-surreal, stability-check-surreal, round-start-lucid, stability-check-lucid, salvation-step-lucid,
  hud-roll-nat1/nat20/pending, hud-all-worst/best.
- **Issue:** "Surreal: 2 dice, keep low" is #d946ef on the purple button (#8223bf): 2.06:1 at every viewport, at the
  exact moment the rule matters. The hint is a second line inside the button, so the button grows 17-36px upwards
  (its top moves while its bottom stays).
- **Evidence:** metrics issues (12× contrast 2.06-2.08); drift-board.md: round-start-surreal step button Δtop −17
  (android-small), salvation-step-lucid Δtop −36 (android-small), −18 (desktop).
- **Recommendation:** move the hint out of the frame into a reserved 20px line directly above the step button, on the
  table: the HUD's arrow icon (12px) + "Lucid · 2 dice, keep high" in #00ffaa or "Surreal · 2 dice, keep low" in
  #f07cff (14.5:1 and 8.3:1 on the table), 13px Inter 600. The slot is always reserved (empty when no modifier), the
  button references it with `aria-describedby` so the accessible name stays the action.
- **Acceptance:** zero contrast issues for the hint; the step button box is identical (±1px) across all step states per
  viewport; the hint appearing moves nothing.
- **Files:** `src/lib/components/game/StepAction.svelte:72-90,130-141`, `src/lib/components/GameScreen.svelte`.

### GD-1-10 · medium · The step button also changes height because labels wrap (phones, and every label on landscape)
- **Surface:** step button. **Viewports:** android-small, iphone-13 (Salvation), iphone-13-landscape (all), ipad/laptop/desktop (final check).
- **States:** salvation-*-step, easy-final-check, caption-easy-fourth-ace, instability-roll (landscape).
- **Issue:** "ROLL TO REMOVE A TOKEN · NEED 14+" and "ROLL FOR STABILITY · SURVIVE THIS AND YOU ESCAPE" wrap to two
  lines on phones (button 62px instead of 44px) and two to three lines on landscape, where the label area is 214px at
  18px: even "ROLL FOR INSTABILITY" wraps there (126×42.6), and "· SALVATION / IS ASSURED" starts a line with "·".
- **Evidence:** drift-board.md (salvation-n2-step Δtop −18, easy-final-check −22 desktop); metrics landscape step label
  209×64.2; `review-game/crops/m-land-a.png`.
- **Recommendation:** with GD-1-05/GD-1-12 every label is one line of ≤ 20 characters ("Roll for instability" is the
  longest, 205px at 16px). On landscape set the label to 1rem and give the label area ≥ 210px. Fix the frame height
  (44px phones, 46px from 601px, as now for one-line labels).
- **Acceptance:** step label one line at every core viewport in every state; step button Δtop/Δh 0 in the drift tables.
- **Files:** `src/lib/components/game/StepAction.svelte`, `src/lib/components/AugmentedButton.svelte`, landscape styles in `GameScreen.svelte`.

### GD-1-11 · medium · The Space key-cap rides after the label: the label sits off-centre and the key-cap jumps 156px
- **Surface:** step button (pointer devices). **Viewports:** laptop, desktop (and fhd).
- **States:** every board state.
- **Issue:** The key-cap is an inline flex item after the label, so label+key-cap are centred together: the label is
  ~30px left of the button's centre, and the key-cap's x changes with every label (desktop 741 → 897px). On "ROLL TO
  REMOVE A TOKEN · NEED 14+" the label nearly touches the left chamfer.
- **Evidence:** metrics landmarks keyHint x: instability-roll 816.6, instability-result 754.8, salvation-n2-step 895.4,
  salvation-last-token 741.1 (desktop); `review-game/crops/desk-buttons.png`.
- **Recommendation:** position the key-cap absolutely: `right: 20px; top: 50%; translate: 0 -50%`; centre the label on
  the button's full width with symmetric `padding-inline` = key-cap width + 12px on both sides.
- **Acceptance:** keyHint box x identical (±1px) in every state per viewport; step label centre x = button centre x (±1px).
- **Files:** `src/lib/components/AugmentedButton.svelte:88-92,262-286`.

### GD-1-12 · medium · "Continue" never says where it goes
- **Surface:** step button after every result; card footer. **Viewports:** all.
- **States:** instability-result, stability-11-19 and every stability-* result, salvation-*-hit/miss/nat*, result-hold, card-king-final.
- **Issue:** 42+ shots end on "CONTINUE", which leads to a card, to Salvation, to the journal or to round 1. With
  auto-advance the run-out line counts down on a label that doesn't say what is coming (Nielsen: visibility of status;
  VectorLab `verbs` bans "Continue" outside a wizard). Source also mixes case: "Draw 5 Cards" (title case,
  `useRollForTasks.svelte.js:122`, read out as the accessible name) vs sentence case elsewhere.
- **Evidence:** `review-game/crops/m-iphone-a.png`; `useFailureCheck.svelte.js:118`, `useSuccessCheck.svelte.js:129`,
  `useInitialDamage.svelte.js:99`.
- **Recommendation:** name the destination: after the opening roll "Begin round 1"; after a Stability check with cards
  left "Draw the next card"; after the round's last check with Salvation unlocked "Go to Salvation"; otherwise, and
  after Salvation, "Open your journal"; keep "Escape" and "Face the end". Card footer: the fourth King "Tap to face the
  end" / "Click to face the end"; Easy's fourth Ace with skip-damage "Tap to escape" / "Click to escape"; others keep
  "Tap to continue". Sentence case in source for every label.
- **Acceptance:** no step button reads "Continue"; each label matches the screen that follows in a scripted run;
  card-king-final shows "Tap to face the end".
- **Files:** the four step composables, `src/lib/components/card/CardDisplay.svelte:303-308`, `cardInfo.js` (`endsGameOnConfirm`), tests.

### GD-1-13 · medium · A modifier notice contradicts the line above it
- **Surface:** board notice. **Viewports:** all. **States:** notice-skip-damage, notice-return-king, notice-return-king-result.
- **Issue:** On Salvation after a skip-damage Ace the description says "survive one Stability check and a token comes
  off" and the notice right below says "A♣ · No Stability check this time". Read together, they contradict. The
  return-king notice ends "· 0 of 4" without saying of what.
- **Evidence:** `review-game/crops/m-laptop-a.png` (notice-skip-damage), `shots/board/notice-return-king-result/*`;
  `src/lib/stores/gameActions.svelte.js:386,453`.
- **Recommendation:** past tense, attributed to the card: "A♣ skipped its Stability check"; "K♥ went back into the deck
  · 0 of 4 Kings out". The card face keeps its own present-tense note.
- **Acceptance:** notice-skip-damage and notice-return-king(-result) show the new lines; no notice uses "this time".
- **Files:** `src/lib/stores/gameActions.svelte.js`, `src/lib/components/GameScreen.svelte:140-146`, tests.

### GD-1-14 · medium · The Ace of Hearts wears a "VICTORY" badge
- **Surface:** card face badge, card accessible name. **Viewports:** all. **States:** card-ace-hearts, card-primary-success(-long).
- **Issue:** Drawing the Ace of Hearts only unlocks Salvation (Normal wins 1.28% of games); the badge says VICTORY,
  while its own footer says "SALVATION UNLOCKED". Two names, one of them false.
- **Evidence:** `review-game/crops/m-iphone-cards.png`; `src/lib/components/card/cardInfo.js:14-20`.
- **Recommendation:** badge and spoken type "Salvation" for `primary-success`.
- **Acceptance:** card-ace-hearts badge reads SALVATION; `getCardName` gives "Ace of Hearts, Salvation".
- **Files:** `src/lib/components/card/cardInfo.js` (+ test).

### GD-1-15 · medium · Easy's intro hides how most Easy games are won
- **Surface:** intro goal line. **Viewports:** all. **States:** easy-intro.
- **Issue:** "Hold on to your 20 Stability. The Ace of Hearts is already revealed: clear all 10 tokens to escape."
  On Easy the fourth Ace ends the game (54% of games won that way, CLAUDE.md); the goal line names only the rare route.
- **Evidence:** `shots/board/easy-intro/iphone-13.png`; `src/lib/utils/rollResult.js` `formatIntroGoal`.
- **Recommendation:** Easy: "Hold on to your 20 Stability. The Ace of Hearts is already revealed: clear all 10 tokens,
  or survive the fourth Ace, to escape." (pass `fourthAceWins` to `formatIntroGoal`). Normal and Hard unchanged.
- **Acceptance:** easy-intro shows the line; intro on Normal/Hard unchanged.
- **Files:** `src/lib/utils/rollResult.js`, `src/lib/components/GameScreen.svelte` (introGoal), test.

### GD-1-16 · medium · While the dice are in the air the Roll tile still shows the previous roll
- **Surface:** HUD Roll tile. **Viewports:** all. **States:** stability-rolling, rm-static-roll-after-resize.
- **Issue:** During a roll the LED keeps the last result (16 while the Stability die is in the air). Under reduced motion
  the screen shows two different numbers at once: the static d20 "8" and the LED "3".
- **Evidence:** `review-game/crops/m-iphone-roll.png` (both states).
- **Recommendation:** while a roll is in flight the LED shows "--" (the idle style); the new value lands with the result
  line. A pending modifier's tint stays during the roll and clears when the result lands (OWN-2).
- **Acceptance:** stability-rolling and rm-static-roll show "--" in the Roll tile at every viewport.
- **Files:** `src/lib/components/status/RollCell.svelte` (read the dice store's rolling state).

### GD-1-17 · high · Under reduced motion the roll's number is off-screen
- **Surface:** reduced-motion static roll. **Viewports:** iphone-13, desktop (all likely). **States:** rm-static-roll.
- **Issue:** `--hud-bottom` is published once on mount and refreshed only by a size change or window resize, so it holds
  980/1040px while the HUD ends at ~130px; `.static-roll` lands below the viewport and the reduced-motion player gets
  no roll at all, only "Rolling…".
- **Evidence:** `shots/board/rm-static-roll/*` vs `rm-static-roll-after-resize`; `tools/board/notes-round-1.md`;
  `src/lib/components/status/StatusHUD.svelte:24-45`, `src/routes/+layout.svelte:167-170`.
- **Recommendation:** place the static roll inside the game table in CSS (e.g. absolutely positioned in the table at the
  dice landing line, 56% of the table height), not from a JS-published pixel value; if the variable stays, re-publish
  it on every screen change.
- **Acceptance:** rm-static-roll shows the d20 number at every core viewport without a resize, in the lower table,
  clear of the result line and the button.
- **Files:** `src/routes/+layout.svelte`, `src/lib/components/status/StatusHUD.svelte`.

### GD-1-18 · medium · HUD values re-centre when their digit count changes; the LED face has no "/"
- **Surface:** HUD tiles (OWN-1 dependency). **Viewports:** all. **States:** hud-stability-*, hud-tokens-*, hud-cards-*.
- **Issue:** Values are centred text, so "/20" moves 5.4px left when Stability goes 20 → 4, "/10" moves 5.4px when
  Tokens go 10 → 5, Cards re-centres at 9. Only the Roll tile has a fixed field (unlit "88"). DSEG7 Classic has no "/"
  glyph (cmap: ` !-.0-9:A-Za-z_`), so an LED "/20" (OWN-1) would fall back to Share Tech Mono for the slash.
- **Evidence:** metrics iphone-13: hud-stability-20 "/20" x 47.2 vs hud-stability-4 x 41.8; hud-tokens-10-unlocked
  "/10" x 349.0 vs hud-tokens-5 343.6.
- **Recommendation:** every value is a fixed-width, right-aligned LED field over unlit ghosts (Stability "88", Kings
  "8", Roll "88", Cards "88", Aces "8", Tokens "88"); the max is a fixed LED field without ghosts; the slash is drawn
  (a 1.5px × 0.62em bar skewed −20°, in the max colour), never a glyph.
- **Acceptance:** in every hud-* state the slash and max x positions are identical (±0.5px) per tile; every HUD value
  glyph renders in DSEG7 (no fallback); fits at 360px (see OWN-2 D).
- **Files:** the six cells in `src/lib/components/status/`, `StatusHUD.svelte`.

### GD-1-19 · medium · HUD text drops below AA at the fatal moment and before the Ace of Hearts
- **Surface:** HUD Stability and Tokens tiles. **Viewports:** all.
- **States:** stability-fatal, salvation-n4-fatal, easy-final-fatal; every state before the Ace of Hearts (locked Tokens).
- **Issue:** The critical-tier pulse fades the Stability digits to 0.55 opacity, so the "0" that ends the game measures
  2.67:1 (laptop), 2.92 (desktop), 3.23 (iphone-13). The locked Tokens max "/10" is white at 0.4: 3.81:1 (234 hits).
- **Evidence:** metrics issues (contrast "0", "/10").
- **Recommendation:** pulse the tile tint, never the digits (OWN-2); max digits at rgba(255,255,255,0.6) or brighter in
  every state, locked included (7.3:1).
- **Acceptance:** zero HUD contrast issues in metrics-board.json at every viewport.
- **Files:** `StabilityCell.svelte`, `TokensCell.svelte`, `StatusHUD.svelte`.

### GD-1-20 · medium · The ending's call to action and the final log's save button say nearly the same thing
- **Surface:** game over → final log. **Viewports:** all. **States:** gameover-*, final-log, final-log-victory, final-log-epitaph.
- **Issue:** "RECORD YOUR FINAL LOG" opens the sheet; "RECORD FINAL LOG" on that sheet saves it. Two consecutive screens,
  two different actions, one label. On the epitaph, "HOME" is not a verb.
- **Evidence:** `review-game/crops/m-iphone-end.png`; `GameOver.svelte:96`, `JournalEntry.svelte:283-328`.
- **Recommendation:** ending CTA "Write your final log"; the sheet keeps "Record final log"; epitaph links "Play again",
  "Go home".
- **Acceptance:** the four gameover-* shots and final-log-epitaph show the new labels.
- **Files:** `src/lib/components/GameOver.svelte`, `src/lib/components/JournalEntry.svelte`.

### GD-1-21 · low · Dot-separated lines break inside a segment
- **Surface:** journal status line, final-log status line, card mechanic notes, step labels.
- **Viewports:** android-small, iphone-13, iphone-13-landscape.
- **States:** journal-entry ("· 10 / tokens left"), final-log-victory ("· 0 / tokens left"), card-ace-hearts,
  card-ace-narrative, card-return-king ("· A / STABILITY CHECK FOLLOWS"), salvation-n4-step landscape ("· SALVATION / IS ASSURED").
- **Issue:** a number is split from its noun, an article ends a line, a line starts with "·".
- **Evidence:** `review-game/crops/m-iphone-journal.png`, `m-iphone-end.png`, `m-iphone-cards.png`, `m-land-a.png`.
- **Recommendation:** render each "·" segment as a `white-space: nowrap` span and break only after a separator (the
  "·" stays at the end of the line); applies to `getStatusLine` consumers, `CardDisplay` notes and any remaining
  two-part label.
- **Acceptance:** at 360 and 390px no line in these surfaces ends in a bare number or article or starts with "·".
- **Files:** `src/lib/components/JournalEntry.svelte`, `src/lib/utils/endingSummary.js`, `src/lib/components/card/CardDisplay.svelte`.

### GD-1-22 · low · The ending recap mixes notations the HUD never used
- **Surface:** game-over recap tiles, final-log status line. **Viewports:** all. **States:** gameover-*, final-log*.
- **Issue:** The recap shows "KINGS REVEALED 0 of 4" beside "FINAL STABILITY 18/20"; the HUD the player watched all
  game wrote "0/4". The recap tiles are the run's final readout.
- **Evidence:** `review-game/crops/m-iphone-end.png`; `src/lib/utils/endingSummary.js:62-85`.
- **Recommendation:** "n/max" in every recap tile ("0/4", "1/4", "18/20"), set in the HUD's LED face (OWN-1) so the
  ending reads as the same instrument; the prose status line keeps "of".
- **Acceptance:** gameover-* recap tiles all use "n/max" in the LED face.
- **Files:** `src/lib/utils/endingSummary.js`, `src/lib/components/RunRecap.svelte`.

## OWN-2 specification: progressive tiers on every HUD tile

**A. One mechanism, all six tiles (Kings included).**
- Each tile root carries `data-tier`. One tint layer per tile (`span.tier-tint`, `position:absolute; inset:0`, under the
  label, readout and hairline, `pointer-events:none`) painted `background-color: rgba(var(--tint-rgb), var(--tint-a))`
  with `mask-image` (and `-webkit-mask-image`) `linear-gradient(180deg, #000, rgba(0,0,0,.25))`: exactly the Kings
  `.urgent` shape (top a, bottom a/4). Base tier: `--tint-a: 0`. The tint stays inside the frame (no paint past the
  Stability top-left and Tokens bottom-right chamfers).
- The current value (LED, OWN-1) takes `--tier-color`; unlit ghosts the same colour at 0.1; glow
  `0 0 6px rgba(tier,.55), 0 0 14px rgba(tier,.25)` (the Roll LED recipe).
- Labels keep their current colours (Kings red, Aces cyan, Tokens yellow, Roll and Cards white .72); the Stability
  label keeps following its tier.
- Max digits: rgba(255,255,255,.6) in every tier and state (≥ 6.5:1 on the strongest tint).
- Transition: tint `background-color`, value `color` and `text-shadow` over `var(--dur-overlay)` (300ms)
  `var(--ease-enter)` (the bar fill's existing precedent), both directions, starting on the frame the value changes; no
  transition on first render or resume; `transition: none` under `prefers-reduced-motion` (instant).
- Loudness cap: tint top alpha .16 and glow `0 0 10px rgba(255,77,109,.8)` only for Kings 3-4 and Stability critical;
  every other tier ≤ .12 alpha and ≤ the 6px/.55 glow. No new loops: the only pulse is Stability critical, on the tint
  layer's opacity (1 → .5, 1.6s, the existing alert loop); digits never pulse (GD-1-19). Kings keeps its skull pulse.

**B. Tiers (value colour · tint rgb · top alpha).**
1. **Stability** (`stabilityTier`): steady 16-20 #00ff88 · none; caution 11-15 #ffd700 · 255,215,0 · .06; danger 5-10
   #ff8a3d · 255,138,61 · .10; critical ≤ 4 (and 0) #ff4d6d · 255,77,109 · .16 + tint pulse.
2. **Kings** (the reference, same look): 0-2 #fff · none; 3-4 #ff4d6d · 255,77,109 · .16, glow 10px/.8. Gains the shared
   tint layer and the 300ms transition.
3. **Roll** (only the kept die counts): idle "--" (no roll yet, and while dice are in the air, GD-1-16) #ffd700 at .6 ·
   none; plain 2-19 #ffd700 · none; natural 20 (Lucid on) #00ffaa · 0,255,170 · .10; natural 1 (Surreal on) #f07cff ·
   240,124,255 · .10; Lucid pending over another value #ffd700 · 0,255,170 · .06; Surreal pending likewise · 240,124,255 ·
   .06. A pending tint stays through the roll and clears when the result lands. The arrows are unchanged.
4. **Cards** (running out is pressure; never red): 13-52 #e2e9f2 · none; 7-12 (about two rounds) #ffd700 · 255,215,0 ·
   .06; 0-6 (one deal or less) #ff8a3d · 255,138,61 · .10.
5. **Aces** (rising is hope): 0 #fff · none; 1-3 before the Ace of Hearts (Salvation locked) #00ffff · none; 1/2/3
   with Salvation unlocked (17+/14+/11+) #00ffff · 0,255,255 · .04/.07/.10; 4 on Normal and Hard (no target) #00ffff ·
   .12; 4 on Easy (the final check; `fourthAceWins`) #ffd700 · 255,215,0 · .12.
6. **Tokens** (falling is good news): locked value rgba(255,255,255,.6), max .6 · none; above half of the start #ffd700
   · none; half or less and > 2 #ffd700 · 255,215,0 · .06; 1-2 left #00ff88 · 0,255,136 · .10; 0 (until Escape)
   #00ff88 · .12; above the start (Hard) #ff8a3d · 255,138,61 · .08 + the existing striped bar.

**C. Legibility.** Every value ≥ 4.5:1 on its tinted ground (computed on the HUD base #0e0e18: critical #ff4d6d on
#351826 = 4.99:1; every other tier ≥ 7.1:1). Zero HUD contrast issues in the metrics.

**D. Fit and typography (with OWN-1).** LED value 22px on phones, 20px on landscape phones, 26px from 601px, max at
0.6 of that; all six values on one baseline (±0.5px) in every tier; one row at 360px with no clipped label, the outer
labels ≥ 6px inside the frame on both sides and mirrored within 1px (today Stability sits 5px from the left edge and
Tokens 10px from the right at 360px).

**E. How I will verify.** The tier matrix (CR-3) at android-small, iphone-13, landscape and desktop: each tile shows the
listed tier at every boundary value; transition frames at 0/150/300ms interpolate, and under reduced motion the end
state is on frame 0; in hud-all-worst the Kings 3/4 and Stability critical tints are the strongest (sampled tint
colour) and no other tile exceeds .12; zero HUD contrast issues.

## Capture requests for round 2

- **CR-1** Opening instability roll on a natural 1 and a natural 20 (result line, then Round 1 with the modifier hint), all core viewports.
- **CR-2** A real Normal game with rule tips on, unforced, each caption shot as it first appears with the HUD and the
  step button visible (iphone-13 and desktop), so caption timing and truth can be checked against the HUD.
- **CR-3** The HUD tier matrix at every boundary: Stability 16/15/11/10/5/4/1/0; Kings 0-4; Cards 52/13/12/7/6/1/0;
  Aces 0, 1 without the Ace of Hearts, 1/2/3 with it, 4 Normal, 4 Easy; Tokens locked, 10, 6, 5, 3, 2, 1, 0, 12/10;
  Roll idle, plain, nat 20, nat 1, Lucid pending, Surreal pending, rolling. At android-small, iphone-13, landscape,
  desktop; plus frames at 0/150/300ms for one tier change per tile and the same under reduced motion.
- **CR-4** hud-all-worst and hud-all-best after OWN-2 (loudness comparison).
- **CR-5** The Roll tile while the dice are in the air with Lucid pending; rm-static-roll without any resize.
- **CR-6** Easy: a fourth Ace with skip-damage (card footer, ending) and the Easy intro.
- **CR-7** Every step state with a Lucid and a Surreal hint at 360px and landscape (hint slot), and every step label at landscape.
- **CR-8** Desktop and laptop step buttons with the Space key-cap for every label.
- **CR-9** Journal and final-log status lines at 360px with two-digit tokens; gameover-win-tokens on Normal and Hard.
- **CR-10** iPhone 13 with Safari's bars (390×664, 750×342) for the board with a caption, the final check and Salvation.
- **CR-11** /game/ghost-in-the-machine: intro, a Stability check, Salvation and the endings (custom labels).

## Skill audit notes (ux-audit, verbs, motion)

- **verbs:** fail on "Continue" (GD-1-12), "Home" (GD-1-20), "Record your final log" opening a sheet (GD-1-20), source
  case "Draw 5 Cards" (GD-1-12). Pass elsewhere (Roll for…, Draw…, Escape, Face the end, Begin your journey).
- **motion:** the OWN-2 transitions must use the 300ms token with ease-out; tier colour changes are paint-only on six
  small tiles (precedent: the bar fill). The critical pulse moves from the digits to the tint (GD-1-19). Reduced motion:
  instant tiers; GD-1-17 breaks the reduced-motion roll today.
- **ux-audit gate:** 5 (copy) fail (GD-1-01, 05, 12); 7 (motion) partial (GD-1-17, 19); 9 (375px) pass for overflow, the
  HUD fits; 10 (visual finish) fail on drift and wrapping titles (GD-1-03, 04, 09-11).
