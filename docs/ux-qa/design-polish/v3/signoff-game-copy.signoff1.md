# Sign-off: game UX + UX writing lenses 

Head under review: a449adc (origin/claude/vibrant-curie-w9bn88). src changes since the signoff-1 captures (d3a902a): timing only
(13c9bda, 17d84e4, a449adc), so the stills stand for copy and layout. Timing evidence (mine, iPhone 13 390x844, dev server):
v3/gcs/timing/ (telemetry.json per run = per-frame samples; events.json; video/*.webm; own6-own7-iphone13.mp4;
manual/fr/own6-dice-sink.png, manual/fr/own7-draw-a.png, own7-draw-b.png; doubletap-*.json; beatprobe-300ms.json).

## Timing measurements
- Tokens at a449adc: DICE_SINK 800 (ease (0.4,0,0.6,1)), DICE_SINK_REDUCED 350, DRAW_PAUSE 100 (owner set it back from 300:
  "The owner did not ask for a pause on the empty table between cards"), RESULT_HOLD 2000.
- OWN-6 dice sink (telemetry, manual run): .rolling drops (z 1000 -> -10) in the same frame the result line appears
  (5788 and 10801); opacity 1 -> 0 over 798ms and 837ms. Frame sheet manual/fr/own6-dice-sink.png: the d20 darkens over
  ~5 frames behind the step button, never in front of it. Reduced motion (rm run): no throw, static d20 fades 1 -> 0 in 354ms.
- OWN-7 card to card (manual run at 100ms): lift 199-231ms, empty table 81-105ms, rise 255-265ms: 0.56-0.58s.
  Auto-play (auto run): empty 79-104ms. First card: 2.0s result hold, then ~150ms to materialising.
  At 300ms (manual-300ms run): empty 281-303ms; tap/Space/Enter in the gap drew at once (85-101ms / 21ms / 9ms after
  the table emptied), one card each (beatprobe-300ms.json).
- Double input (doubletap-*.json): with motion a second tap at +150/+250/+400ms or a second Space at +150ms lands on the
  rising card and is ignored (0 skipped). Under reduced motion the next card is up instantly after the 100ms gap, so a
  second tap at +150ms or +250ms, or a second Space at +150ms, dismisses it unread: 1 card skipped in each of 3 trials,
  and on the round's last card the game jumped straight to the journal.

## Verdicts

| id | verdict | note |
|---|---|---|
| GD-1-07 | resolved | Grammar holds: 'Rolled 3 · −2 Stability · you fall', 'Rolled 15 · −1 Token · you escape', four-Ace win 'Rolled 15 · no Stability lost · you escape', equal dice not named. Measured in the app (v3/gcs/measure.cjs, body 342px at 390, 312px at 360): every single-die and equal-dice form is one line at 390 (232-337px). The developer's "one line" does not hold for two unequal dice: seven forms are 346-413px (e.g. 'Natural 20 (high of 20, 7) · 6 cards this round · Lucid' 401px) and take two lines. Accepted: the OWN-4 body slot reserves two lines and .context-result balances on clause breaks (ContextBackground.svelte:296-309), so nothing moves, which is what the criterion protected; every form fits two lines at 360. |
| OWN-4 | resolved | Game lens. One framed readout: card tab (rank+suit), title, stakes or result in one reserved body slot, notice tab only when a modifier did something (formatModifierNotice drops 'No …': rollResult.js:265; GameScreen.svelte:104). Card description gone from the board; 'An odd card demands a price' cut to '10 or less costs Stability.'. drift.md: body, notice, caption, step button Δ0 in every state at all four viewports; the title ink moves 13-14px only between one- and two-line titles in a fixed, centred slot (Δcx 0). No clipped text in any board state (raw metrics problems lists). Residual: the K-return notice's count repeats the HUD (game-copy-s-03), and the final log/story still state the non-event (game-copy-s-04). |
| game-copy-v-01 | resolved | HelpModal.svelte:18 Ace tip now 'On Normal and Hard, with all four there is no target…'; :23 'a missed Salvation roll'. No 'failed Salvation' in player copy (two code comments only). |
| game-copy-v-02 | resolved | hudTiers.js:262 and useRuleCaptions.svelte.js:64 say 'each Salvation roll is a Stability check'; grep for 'each roll is a Stability check' is empty. |
| game-copy-v-03 | resolved | Caption 'Salvation unlocked. Each round ends with a roll to remove a Token. Remove them all to escape.'; intro goal 'remove all 10 Tokens' (seen in the recording); Tokens tier 'all removed' (hudTiers.js:308). No player string uses 'clear' for Tokens. |
| game-copy-v-04 | resolved | Journal and final-log header 'Stability 16 of 20 · Kings 1 of 4' (+ 'Tokens n left' once Salvation is unlocked, endingSummary.js:115-121); story RoundStats 'Stability 20 of 20 · Kings 0 of 4 · Aces 1 of 4 · Tokens 9 left'. Meets its acceptance. The timeline rows under that header now disagree with it: game-copy-s-02. |
| game-copy-v-05 | resolved | TTSSection.svelte:268 intro 'Use your own API key for a cloud voice.'; :281 'Stored only in this browser.' once. |
| game-copy-v-06 | resolved | Captions 'A natural 20 makes you Lucid, for one roll: this one.' / 'A natural 1 makes you Surreal, for one roll: this one.'; the hint 'Surreal · two dice, keep the lower' shares no phrase. |
| game-copy-v-07 | resolved | Modal title 'SETTINGS' (settings-game shots), bar label 'Settings' with no aria-label (PlayerInfoBar.svelte:219), menus 'Settings'; grep finds no 'Game settings'/'Game Settings'. |
| OWN-6 | resolved | Token DICE_SINK 800ms, ease (0.4,0,0.6,1); DICE_SINK_REDUCED 350ms. Recorded (iPhone 13, timing/manual): .rolling and z 1000→-10 drop in the frame the result line appears; opacity 1→0 over 798ms and 837ms, ending well inside the 2s hold. Frame sheet manual/fr/own6-dice-sink.png: the d20 darkens and fades over ~5 frames behind the step button; the HUD, title and result are never covered. Reduced motion (timing/rm): no throw, the static d20 fades in 354ms. |
| OWN-7 | open | Owner-tuned: I propose no retune. At a449adc DRAW_PAUSE is 100ms by the owner's call ('did not ask for a pause on the empty table'). Measured on iPhone 13: card to card 0.56-0.58s (lift 199-231, empty 81-105, rise 255-265ms); auto-play gaps 79-104ms; first card ~150ms after the 2s result hold: consistent across all three. Inputs: with motion a tap/Space/Enter in the gap never double-draws (300ms run: each drew at once, once). Against the item's own words ('a deliberate beat on the empty table') the gap is again what it was when the owner called it too fast; that is for the owner. The reduced-motion double-input skip is a separate defect: game-copy-s-01. |

## New findings

- **game-copy-s-01 · medium · game · play: under reduced motion a quick second tap or Space throws away the next card unread.**
  - doubletap-rm.json: a second tap at +150ms, a second tap at +250ms, and a second Space at +150ms after the dismissing input each skipped one card (3/3); on the round's last card the game went straight to the journal. doubletap-motion.json: 0/4 skipped.
  - Cause: CardDeck.svelte:77 and :229 sleep 0 under reduced motion, so the next card is 'revealed' 100ms (DRAW_PAUSE) after the dismiss, and CardDisplay.svelte:45 accepts a dismiss at once. With motion the 220ms lift + 100ms + 250ms rise ignore a second input for ~570ms.
  - Fix (not a pause retune): a newly shown card ignores dismiss input until it has been up ~400ms (the step button's STEP_GUARD_MS), whatever the motion setting.
  - Acceptance: reduced motion at 390x844, a second tap at +150 and +250ms or a second Space at +150ms leaves the next card face up (0 skipped); with motion still 0 skipped; a tap on a card up for 1s dismisses it at once.
- **game-copy-s-02 · low · copy · overlays: the final log states one fact in two forms on one screen.**
  - final-log-timeline/iphone-13.png: header 'Stability 17 of 20 · Kings 4 of 4' (y73); rows 'K♣ · 4 of 4 Kings' (y539) and '7♦ · Rolled 3 · −2 Stability · 17/20' (y474); Salvation rows '6 Tokens left' vs header 'Tokens 6 left'. android-small.png: 'Instability · Rolled 14 · no Stability lost ·' with '20/20' alone on line 2.
  - Cause: game-copy-v-04 made the header label-first; gameTimeline.js:64, :90 ('n/20'), :124 ('n of 4 Kings') and the Token totals kept the old forms.
  - Fix: rows take the header's forms: running total '17 of 20' (the clause before names Stability), 'Kings 2 of 4', 'Tokens 6 left'; the total never sits alone on a line.
  - Acceptance: at 360 and 390 the final-log timeline has no 'n/20', King and Token counts read as in the header, and no line holds a lone total.
- **game-copy-s-03 · low · copy · play: the return-King notice repeats the HUD.**
  - notice-return-king at all four viewports: 'K♥ went back into the deck · 0 of 4 Kings out' sits under the Kings tile '0/4', whose skull dims in the same beat (KingsCell.svelte:49). It is the only board line still carrying a total (DP-1-07: 'No totals: the HUD shows them', rollResult.js header), in the old count form, and at the 14px VT-1-11 asks for it wraps at 360.
  - Fix: the board notice is 'K♥ went back into the deck' (formatModifierNotice, rollResult.js:265, drops the count clause); the live announcement keeps the count; the final log keeps its row.
  - Acceptance: one line 'K♥ went back into the deck' at 360, 390, 844x390 and 1440 (at 14px too); the live region still reads the Kings count.
- **game-copy-s-04 · low · copy · overlays: the final log and story mode still state the non-event OWN-4 removed from the board.**
  - buildTimeline on a return-king Ace with no King out (v3/gcs/tl.mjs) gives 'A♠︎ · No King was out to return'; storyCards.modifierLine returns the same, shown at StoryRound.svelte:99-100. gameTimeline.js:148-154 says 'as the board logged it', but the board no longer shows it (GameScreen.svelte:104).
  - Fix: timeline and story skip a modifierResult that formatModifierNotice rejects: one rule everywhere.
  - Acceptance: no note for a return-king card with no King out in either the final-log timeline or the story card panel; with a King out both keep 'K♥ went back into the deck…'.
- **game-copy-s-05 · low · copy · story: story mode says the round's position twice.**
  - story-round-1 at 360, 390, 844x390 and 1440: heading 'ROUND 1 of 10' (StoryRound.svelte:55) and the pager 'Round 1 of 10' (StoryNavigation.svelte:34) are on screen together; desktop adds the 1-10 markers, and the meta line says '10 rounds'.
  - Fix: heading 'Round 1'; the sticky pager keeps 'Round 1 of 10'.
  - Acceptance: 'of 10' appears once on story-round-1 at every core viewport.
- **game-copy-s-06 · low · copy · story: the Stability ending has a different name in the library.**
  - The Guide names the endings 'You escape' / 'You fall' / 'You are taken' (GameGuide.svelte:244-249), and the board's fatal line says 'you fall' (rollResult.js:50, chosen in round 1 as the Guide's name). The library and story mode say 'Escaped' and 'Taken by the fourth King', but 'Stability gave out' (storyOutcome.js:12; library-stories/iphone-13.png).
  - Fix: 'Fell when Stability reached 0' (the Guide's verb, the game-over cause's words).
  - Acceptance: the three outcome labels use the Guide's verbs, and each fits one line on a library card at 360.

## Approval
- game: not approved (OWN-7 is the owner's call; game-copy-s-01 is open).
- copy: not approved (game-copy-s-02 to s-06 are open).
