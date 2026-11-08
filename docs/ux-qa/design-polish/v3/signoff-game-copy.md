# Sign-off 2: game UX + UX writing lenses

Head under review: 6c774d6 (captures at 0ea3607, signoff-2). Previous pass kept at v3/signoff-game-copy.signoff1.md.

## Progress
- [x] verdicts s-01..s-06
- [x] state review (board, surfaces) at 360/390/844x390/1440

## Verdicts (written as I go)

### game-copy-s-01 · resolved
Probe re-run at 6c774d6 on a dev server (v3/gcs/s2-doubletap.cjs, iPhone 13 390x844; results v3/gcs/timing/s2-doubletap-rm.json and s2-doubletap-motion.json), with a fifth case that lands on the round's last card.
Reduced motion: second tap at +150ms, +250ms, +400ms, second Space at +150ms, and Space x2 at +150ms onto the last card: 0 of 5 skipped, the next card face up each time, the game never left drawCard. Motion on: 0 of 5. Single tap or Space on a card up ~0.9s: 'dismissing' 5-14ms (rm) and 3-16ms (motion) after the input. Log shows the guard: card 'materializing' for 219-390ms under rm, the second input lands inside it and is ignored.

### game-copy-s-02 · open (one row left)
The captured final-log-timeline passes: at 360 and 390 no 'n/20', 'Kings 1 of 4'..'Kings 4 of 4' as in the header, and the Instability row breaks 'Instability · Rolled 14 ·' / 'no Stability lost · 20 of 20' with the total held to its clause (gameTimeline.js HOLD).
But the return-King row, the one row whose count was kept on purpose (s-03), still uses the old form and is not held: probe v3/gcs/s2-rk.cjs renders a final log with a return-king Ace that sent K♥ back (v3/gcs/s2/final-log-return-king-android-small.png). At 360 it reads 'A♠ · K♥ went back into the deck ·' / '0 of 4 Kings out': the total alone on line 2, in the count-first form, under the header 'Kings 0 of 4' and two rows below 'K♥ · Kings 1 of 4'. Source: gameActions.svelte.js:390 builds '· n of 4 Kings out'; gameTimeline.js:165-167 and storyCards.modifierLine pass it through as is (story mode shows it above RoundStats 'Kings 0 of 4').
Fix: count in the header's form, held to its clause: 'K♥ went back into the deck · Kings 0 of 4' (no-break around the dot), in the timeline and story card panel; update TOTAL_CLAUSE (rollResult.js:258) so the board still drops it.

### game-copy-s-03 · resolved
notice-return-king at 360, 844x390 and 1440 (and 390): the notice tab reads 'K♥ went back into the deck', one line, under the Kings tile '0/4'. GameScreen.svelte:115-120: board passes withTotals:false, modifierAnnouncement keeps the count for the live region (announced at :319).

### game-copy-s-04 · resolved
buildTimeline + modifierLine (v3/gcs/s2-tl.mjs): a return-king Ace with no King out gives only 'Aces 1 of 4' and its check row, no note; storyCards.modifierLine gives ''. With a King out both give 'K♥ went back into the deck · 0 of 4 Kings out' (its count form is the s-02 residue).

### game-copy-s-05 · resolved
story-round-1 at 360, 390, 844x390, 1440: heading 'ROUND 1', pager 'Round 1 of 10': 'of 10' once. (Desktop markers 1-10 and the meta '10 rounds' are not the position.)

### game-copy-s-06 · resolved
library-stories: 'Escaped', 'Taken by the fourth King', 'Fell when Stability reached 0'; the last fits one line at 360 (about 248px of the card's row) and at 1440. Matches the Guide's escape / fall / taken.

## State review (signoff-2, 45 states x 4 viewports; src since 0ea3607 is a comment-only change in drawBeat.js)
Board: intro, round-start, task-result, every Stability and Salvation state, easy-final-check, caption-odd, Surreal hint, result-hold, rm-static-roll, notice-return-king, header-menu: one readout frame, card tab + title + one reserved body line + notice only when a modifier did something; step labels verb-first (Roll for tasks / Draw the cards / Roll for Stability / Draw the next card / Roll for Salvation / Open your journal / Face the end); stakes copy exact per CLAUDE.md ('10 or less costs Stability.', 'You need 17+ to remove a Token.', 'No target now. Survive this Stability check and a Token comes off.', 'Come through this roll with any Stability left and you escape.'); result grammar holds ('Natural 1 · −3 Stability · Surreal', 'Rolled 9 · missed 14+', 'Rolled 3 · −2 Stability · you fall'). Cards: 'Round 1 · Card 2 of 5', note lines accurate ('Odd · a Stability check follows', 'Unlocked · needs 17+', King '1 of 4'), 'Tap/Click to continue'. Guide, exit confirm, settings, home, about, library, story: copy accurate. Found below.

## New findings
- game-copy-s-07 · low · copy · play: the live region's Tokens total is count-first. rollResult.js:323 ' 6 of 10 Tokens left.' while the same function says ' Stability 14 of 20.', the HUD tile's own spoken text is 'Tokens 6 of 10 left' (hudTiers.js:301) and the screen shows 'Tokens 6 left'. A screen-reader user hears two orders for one count within seconds. Fix: ' Tokens 6 of 10 left.'. Acceptance: formatResultTotals('salvation'|'salvation-four') gives '… Tokens 6 of 10 left.'; grep of src/lib (no tests) finds no count-first 'of N Tokens' or 'of 4 Kings' in a player-facing or announced string (the Kings-out one goes with s-02).
- game-copy-s-08 · medium · copy · overlays: 'Cards' means two opposite counts. The HUD's Cards tile is the deck left (StatusHUD.svelte:51 count = deck.length; CardsCell.svelte:3; spoken 'Cards 22 of 52 left'), counting down from 52. The ending's recap tile with the same label is cards drawn (endingSummary.js:97, spoken 'Cards drawn'), counting up: gameover-win-tokens shows 'CARDS 30/52' after a game whose HUD ended at 22. Fix: label the recap tile 'Drawn' (spoken 'Cards drawn 30 of 52'), or show the HUD's count. Acceptance: no surface uses the bare label 'Cards' for cards drawn; the recap label fits one line at 360.
- game-copy-s-09 · low · game · overlays: the ending's recap does not read as the HUD (GD-1-22's aim). Order: Rounds, Cards, Kings / Aces, Stability, Tokens (endingSummary.js:95-105) against the HUD's Stability, Kings | Roll, Cards | Aces, Tokens, so Stability, the resource the player watched all game, moves from first to fifth. Tint: only Kings is marked (RunRecap.svelte:23, danger when n>0); on the Stability ending 'STABILITY 0/20' is yellow (game-over-stability/iphone-13.png) one beat after the HUD showed it red (salvation-n4-fatal), and the win's 'TOKENS 0/10' is yellow too. Fix: HUD order with Rounds in Roll's slot (Stability, Kings, Rounds | Drawn, Aces, Tokens), and each tile takes its HUD tier for the final value (hudTiers.js). Acceptance: on game-over-kings/-stability/-win at 360 and 1440 the tiles run in that order, Stability 0/20 is in the HUD's critical colour, Kings 4/4 unchanged, Tokens 0/N in the HUD's cleared colour.
- game-copy-s-10 · low · copy · overlays: Settings still says 'prompt'. CP-1-20's acceptance was 'Settings contains no "prompt"', and the Advanced options now say 'Read instructions' and 'Count down, then move on'. But the Play mode help (SettingsModal.svelte:56-58) shows playMode.js:18 'The narrator reads each card, prompt and roll.' and :23 '… Journal prompts wait on a countdown.' when Read aloud or Hands-free is selected. Fix: 'The narrator reads the cards, the instructions and the rolls. You roll and move on.' / 'The narrator reads, and the game rolls and moves on by itself. The journal waits on a countdown.' Acceptance: no Settings string, play mode help included, contains 'prompt'.
- game-copy-s-11 · low · copy · overlays: in landscape the journal and final log lose their labels, so the entry field is named only by its placeholder. JournalEntry.svelte:929-932 hides every .section-label at max-height 500px; journal-entry/iphone-13-landscape.png and final-log-timeline/-writing landscape show the two columns with no 'This round' / 'Timeline' / 'Your entry', and once text is typed (final-log-writing landscape) nothing visible names the field. The desktop final log, the same two columns, keeps 'TIMELINE' and 'YOUR ENTRY'. Fix: keep the 12px labels in landscape (about 20px), at least 'Your entry'. Acceptance: at 844x390 journal-entry, final-log and final-log-writing show a visible label over each column.

## Approval
- game: not approved (game-copy-s-09).
- copy: not approved (game-copy-s-02 open; s-07, s-08, s-10, s-11).
