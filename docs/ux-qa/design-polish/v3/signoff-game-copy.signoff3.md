# Sign-off 3: game UX + UX writing lenses

Head under review: d7345d4 (src as of 3d0eb29; d7345d4 only adds docs/ux-qa notes). Captures: v3/signoff-3 (head 3d0eb29).
Previous passes: v3/signoff-game-copy.signoff1.md; sign-off 2 is in git (docs/ux-qa/design-polish/v3/signoff-game-copy.md at f642635).
Probes this pass (dev server on :5295, stopped at the end): v3/gcs3/rk.cjs (final log with a return-King row, new and old saved
forms, 360/390/844x390), v3/gcs3/probe2.cjs (recap accessibility tree, Settings play-mode help, the return-King row's geometry).
Outputs in v3/gcs3/out/.

## Progress
- [x] verdicts s-02, s-07, s-08, s-09, s-10, s-11
- [x] state review (board, surfaces) at 360/390/844x390/1440
- [x] dev server on :5295 stopped

## Verdicts (written as I go)

### game-copy-s-02 · resolved
rk.cjs at 360, 390 and 844x390, with the row as gameActions now writes it ('K♥ went back into the deck · Kings 0 of 4')
and as an old save holds it ('… · 0 of 4 Kings out'): both render 'A♠ · K♥ went back into the deck · Kings 0 of 4', so old saves
are normalised. No 'n/20' anywhere; the header reads 'Stability 18 of 20 · Kings 0 of 4' and the rows 'Kings 1 of 4',
'… · 20 of 20', '… · 18 of 20'. The total is never alone on a line (out/final-log-return-king-new-android-small.png).
Acceptance met. The side effect the developer noted (the card label 'A♠ ·' alone on line 1 at 360) is filed below as s-12.

### game-copy-s-07 · resolved
rollResult.js:327 tokensTotal = ' Tokens ${tokens} of ${start} left.'; 'salvation' gives '. Tokens 6 of 10 left.' and 'salvation-four'
'. Stability 15 of 20. Tokens 3 of 10 left.', the order of hudTiers.tokensSpoken (:301). Grep of src/lib without tests for
count-first 'of N Tokens', 'of 4 Kings' or 'Kings out': only the legacy-format comments in rollResult.js:257 and gameTimeline.js:164.

### game-copy-s-08 · resolved
The recap tile reads 'Drawn' (endingSummary.js:117), spoken 'Drawn 3 of 52 cards' (probe2 aria tree). No surface uses a bare 'Cards'
for cards drawn: the HUD's 'Cards' is the deck left; the Guide's 'Cards drawn' is the per-round table. 'DRAWN' fits one line in
gameover-* and game-over-* at 360, 390, 844x390 and 1440. (The label is now spoken twice per tile; see s-13.)

### game-copy-s-09 · resolved
Order Stability, Kings, Rounds | Drawn, Aces, Tokens at every viewport (game-over-kings/desktop.png one row; game-over-stability and
-win at 360 two rows of three). Tiers match the HUD a beat earlier: Stability 0/20 red (critical) against salvation-n4-fatal's red
0/20; 14/20 yellow on the Easy win against easy-final-check's yellow 14/20; Aces 4/4 cyan on Normal and yellow on Easy, as the HUD;
Tokens 6/10 yellow as the HUD; Tokens 0/10 green (cleared) on gameover-win-tokens; Kings 4/4 red with its tint, label red only once a
King is out; Rounds and Drawn neutral.

### game-copy-s-10 · resolved
playMode.js:18-24 now reads 'The narrator reads the cards, the instructions and the rolls. You roll and move on.' and 'The narrator
reads, and the game rolls and moves on by itself. The journal waits on a countdown.' probe2 clicked each mode in Settings (from home,
1440): the help under Play mode shows exactly those strings; no Settings text contains 'prompt' (also covered by
SettingsModal.test.js:103-109 with Advanced open).

### game-copy-s-11 · resolved
At 844x390: journal-entry shows THIS ROUND over the list and YOUR ENTRY over the field; final-log-writing shows TIMELINE and
YOUR ENTRY with the typed text in the field, label still there; final-log-timeline the same. Phones in portrait keep the switch.

## State review (signoff-3, 45 states x 4 viewports, plus the probes above)
Board, through both lenses, from the shots and the per-shot text runs (work/raw/board/*/<vp>.json):
- One readout frame: card tab (only when a card caused the step), title, divider, one body line (stakes before the roll, the
  result after it), and a notice tab only when a modifier did something. No non-event is ever stated ('No King was out to
  return' is filtered by formatModifierNotice). No line repeats another inside the frame.
- Stakes copy exact per CLAUDE.md: '10 or less costs Stability.'; 'You need 17+ to remove a Token.'; 'No target now. Survive this
  Stability check and a Token comes off.'; Easy 'Come through this roll with any Stability left and you escape.'; round start
  'Your roll sets how many cards you draw, from 1 to 6.'.
- Results: 'Rolled 16 · 5 cards this round', 'Natural 1 · −3 Stability · Surreal', 'Rolled 8 · −1 Stability', 'Natural 20 ·
  +1 Stability · Lucid', 'Rolled 9 · missed 14+', 'Rolled 3 · −2 Stability · you fall'. Totals stay in the HUD; the live region adds
  them label first.
- Step labels verb-first and one per step: Begin your journey, Roll for tasks, Draw the cards, Roll for Stability, Draw the next
  card, Roll for Salvation, Open your journal, Face the end. The Surreal hint 'Surreal · two dice, keep the lower' sits over the
  button that will use it.
- HUD spoken text (hudAria): label first, tier words that mean something ('critical', 'falling', 'one more ends the game',
  'one to go', 'running out', 'Salvation needs 14 or more', 'survive the final Stability check and you escape').
- The title wrap on phones ('STABILITY CHECK' on two lines, the drift table's only mover): every entry into a Stability check comes
  from behind the card overlay, so the 13px shift is never seen as motion, and the stakes line, result line, caption and button
  hold their boxes. I accept it from these lenses (the visual call is the visual-layout lens's, under OWN-4).
Surfaces: cards ('Round 1 · Card 2 of 5', 'Odd · a Stability check follows', 'Unlocked · needs 17+ · a Stability check follows',
King '1 of 4', Tap/Click to continue), journal and final log (label-first header totals, labels at every viewport), endings (cause
lines as CLAUDE.md, afterword on a loss only, Easy afterword without 'never likely'), Settings, Guide (every number and rule
matches CLAUDE.md, Easy and Hard included), exit confirm ('Keep playing' / 'Exit game'), home, library ('Escaped', 'Fell when
Stability reached 0', 'Taken by the fourth King'), story mode (stats label first, 'Round 1 of 10'), About ('prompt' there means a
card's writing prompt, its only sense in the app now). Found the four below.

## New findings

### game-copy-s-12 · low · copy · overlays · the return-King row leaves its card label alone on a line
Evidence: v3/gcs3/out/final-log-return-king-new-android-small.png (360): 'A♠ ·' alone on line 1, then 'K♥ went back into the
deck · Kings 0 of 4' on line 2. rk-alt.cjs measured it: the row is 306px wide at 360 and 266px at 844x390; the held clause is
275px, so with the 31px label it misses one line by about 4px at 360 and goes to its own line at 844x390 too. Every other row in
the timeline keeps its label with its first clause ('Instability · Rolled 14 ·' / 'no Stability lost · 20 of 20'); the developer's
note says the Instability row does the same, but it does not. Cause: GameTimeline.svelte:31-41 makes each clause nowrap, and the
s-02 no-break spaces made 'K♥ went back into the deck · Kings 0 of 4' one 275px unbreakable clause.
Fix (either): shorten the words so they sit beside the label at both widths. Of the four wordings measured, only 'K♥ back in the
deck · Kings 0 of 4' does ('returned to the deck' fits at 360 but not at 844x390). Use it on the board notice too, so the
thing has one name. Or let a clause that holds a total break at its own spaces when it cannot sit beside its label, keeping only
'deck · Kings 0 of 4' together. Acceptance: at 360 and 844x390 'A♠ ·' shares its line with the first words of the row, and no total
sits alone on a line.

### game-copy-s-13 · low · copy · overlays · the ending's recap speaks every label twice
Evidence: probe2 aria tree of the Game Over dialog (390): 'term: Stability / definition: Stability 0 of 20', 'term: Drawn /
definition: Drawn 3 of 52 cards', 'term: Tokens / definition: Tokens 7 of 10 left'. RunRecap.svelte:31 renders the visible dt
(read aloud), and :42 adds an sr-only dd that starts with the same label (endingSummary.js:86-97, tile().spoken). A screen-reader user
hears 'Stability, Stability 0 of 20' six times. The HUD avoids this: its visible label is aria-hidden (CardsCell.svelte:23) and only
the spoken line is read.
Fix: keep the dt as the one spoken label and drop it from the dd's sr-only text: '0 of 20', '1 of 4', '2', '3 of 52 cards',
'1 of 4', '7 of 10 left'. Acceptance: the Game Over aria tree reads each label once per tile ('Stability' then '0 of 20').

### game-copy-s-14 · low · game · overlays · a run that never found the Ace of Hearts gets a five-tile recap that no longer reads as the HUD
Evidence: gameover-loss-kings/android-small.png: Stability, Kings, Rounds, then Drawn and Aces centred on row 2, under the seams
of row 1 (Drawn spans x 72-176, row 1 columns at 16-120, 128-232, 240-344 CSS px). At 844x390 and 1440 it is five tiles in one
row. The HUD the player watched all game had six, with Tokens shown locked (TokensCell.svelte:24-30, spoken 'Tokens locked until
the Ace of Hearts'). endingSummary.js:125 adds the Tokens tile only when aceOfHeartsRevealed, so s-09's 'two rows of three, the
HUD's two halves' (RunRecap.svelte:5-7) breaks on the ending where never finding the way out matters most.
Fix: always include the Tokens tile; when Salvation never opened, show it in the HUD's locked style (the count dim, the padlock),
spoken 'Tokens locked, the Ace of Hearts never found'. Acceptance: on gameover-loss-kings at 360 two rows of three in the HUD's
columns, at 844x390 and 1440 six tiles in one row, Tokens in the HUD's locked look.

### game-copy-s-15 · low · layout · overlays · the final log's timeline has no 'more' cue, unlike the journal list beside it
Raised for the visual-layout lens (it does not hold my approvals). Evidence: final-log-timeline/android-small.png: the pane ends
exactly under the 'ROUND 4' heading, and that round's rows ('K♣ · Kings 4 of 4', 'THE END · The fourth King was revealed.') are
below the edge with no fade and no chevron. final-log-timeline/iphone-13-landscape.png (scrolled to its end): 'ROUND 3' is cut by
the pane's top edge with no fade. gcs3/out/final-log-return-king-new-iphone-13-landscape.png: 'A♠ · Aces 1 of 4' is cut through
its line at the bottom edge. JournalEntry.svelte:231-237 gives the round list the card story's cue through scrollEdges
(visual-layout-s-10); .timeline-scroll (:642) has none. The edge falling between rows is the case s-10 fixed for the list.
Fix: use scrollEdges on .timeline-scroll with the same 40px mask and chevron (and the top mask when scrolled). Acceptance: on
final-log-timeline at 360 and 844x390 a fade and chevron show while rows remain below, and go when scrolled to the end.

## Approval
- game: not approved (game-copy-s-14).
- copy: not approved (game-copy-s-12, game-copy-s-13).
- All six listed items (s-02, s-07 to s-11) are resolved. s-15 is raised for the visual-layout lens.
