# Sign-off 4: game UX + UX writing lenses

Head under review: 2de6ebc (src as of 7b4f138). Captures: v3/signoff-4 (head 7b4f138).
Previous passes: v3/signoff-game-copy.signoff1.md, v3/signoff-game-copy.signoff3.md (sign-off 3); sign-off 2 in git.
Probes this pass go in v3/gcs4/ (outputs in v3/gcs4/out/).

## Progress
- [x] verdicts s-12, s-13, s-14, s-15
- [x] state review (board, surfaces) at 360/390/844x390/1440
- [x] dev server on :5296 stopped

## Verdicts (written as I go)
Probes: v3/gcs4/probe.cjs on a dev server at :5296 (src = 7b4f138). `rk` builds a final log with a return-King row
(as gameActions writes it), `recap` reads the Game Over recap's accessibility tree (Ace of Hearts found and never found),
`cue` opens a 4-round Kings final log and scrolls its timeline to the end. Outputs: v3/gcs4/out/.

### game-copy-s-12 · resolved
Lines measured word by word (probe `rk`): at 360 the row reads 'A♠ · K♥ went back into the' / 'deck · Kings 0 of 4'; at 844x390
the same two lines; at 390 and 1440 one line 'A♠ · K♥ went back into the deck · Kings 0 of 4'. The label shares its line with
the first words at both acceptance widths, and the total 'Kings 0 of 4' always has 'deck ·' with it (out/rk-android-small.png,
out/rk-iphone-13-landscape.png). The wording is unchanged, so the board notice, story cards and final log still name the event one
way. timelineClauses.test.js covers the split. Acceptance met.

### game-copy-s-13 · resolved
Probe `recap`, accessibility tree of [data-testid=run-recap] at 360, 844x390 and 1440, both endings: 'term: Stability /
definition: 0 of 20', 'Kings / 1 of 4', 'Rounds / 2', 'Drawn / 3 of 52 cards', 'Aces / 1 of 4', 'Tokens / 7 of 10 left'. Each
label is read once. Acceptance met.

### game-copy-s-14 · resolved
gameover-loss-kings (signoff-4 shots and probe `recap` GEO): at 360 two rows of three, every tile 104px in the HUD's columns
(x 16, 128, 240; rows y 289 and 354); at 844x390 six tiles of 129px in one row; at 1440 six of 135px in one row. Tokens shows
10/10 dimmed with no tint or glow and a padlock to the right of the count (shots/gameover-loss-kings/*.png), the HUD's locked
cue (count dim, padlock), and reads 'Tokens / locked, the Ace of Hearts never found'. The count stays centred in its tile
(844x390: count 1465-1592 in a tile centred at 1527 device px). Acceptance met.

### game-copy-s-15 · resolved
Probe `cue` (4-round Kings log): 360 Timeline tab, open: class more-below, 40px bottom mask, chevron opacity 1; scrolled to the
end (63px): more-above only, 24px top fade, chevron opacity 0 (out/cue-end-android-small.png: 'THE END · The fourth King was
revealed.' fully visible). 844x390 open: more-below and chevron (out/cue-open-iphone-13-landscape.png); at the end (301px):
chevron gone, top fade on. 390 and 1440: the timeline fits, no mask, no chevron. signoff-4/shots/final-log-timeline agree.
Acceptance met.

## State review (signoff-4: 45 states x 4 viewports, plus the probes above)
Source changes since sign-off 3 (3d0eb29..7b4f138): the timeline's clause breaking and scroll cue, the recap's spoken text
and locked Tokens tile, hover styles limited to pointer devices, the rule caption's width, the Story Library header in
landscape. None of them changes any other string. I read every board and surface shot and the per-shot text runs
(work/raw/board and work/raw/surfaces) through both lenses.

Board:
- The readout says only what helps the next press: the card tab (only when a card caused the step), the title, one body line
  (the stakes before the roll, the result after it), a notice tab only when a modifier did something ('K♥ went back into the
  deck'), and the Surreal/Lucid hint over the button that will use it. No line repeats another; no non-event is stated.
- Stakes copy matches CLAUDE.md per difficulty: '10 or less costs Stability.'; 'You need 17+ / 14+ to remove a Token.';
  four Aces 'No target now. Survive this Stability check and a Token comes off.'; Easy 'Come through this roll with any
  Stability left and you escape.'; opening 'The situation is already precarious. 10 or less costs Stability.'; round start
  'Your roll sets how many cards you draw, from 1 to 6.'
- Results in one grammar: 'Rolled 16 · 5 cards this round', 'Rolled 8 · −1 Stability', 'Natural 1 · −3 Stability · Surreal',
  'Natural 20 · +1 Stability · Lucid', 'Rolled 9 · missed 14+', 'Rolled 3 · −2 Stability · you fall'. Totals stay in the HUD.
- Step labels verb-first, one per step, named by where they go: Begin your journey, Roll for tasks, Draw the cards, Roll for
  Stability, Draw the next card, Go to Salvation, Roll for Salvation, Open your journal, Face the end.
- The phone title wrap ('STABILITY CHECK' on two lines, the drift table's only mover). Correction to sign-off 3's reasoning:
  not every change of title happens behind an overlay; 'Go to Salvation' swaps STABILITY CHECK for SALVATION in place.
  Probe gcs4/swap.cjs framed that swap at 390x844 (out/swap-sheet.png): the title element is one fixed 342x57 slot
  (24,114) before and after, the frame, divider, body line (y 146 in the crop) and button do not move; the old readout fades
  out and SALVATION fades in centred in the same slot. Nothing jumps, so I still accept it from these lenses. Whether the
  two-line title should fit on one line is the visual-layout lens's call.
Surfaces: cards ('Round 1 · Card 4 of 5', 'Unlocked · needs 17+ · a Stability check follows', King '1 of 4', Tap/Click to
continue), journal (THIS ROUND / YOUR ENTRY, 'Record entry'), final log (label-first header totals, timeline rows as above),
endings (cause lines per CLAUDE.md: 'The fourth King was revealed.', 'Your Stability reached 0.', 'The fourth Ace was
revealed.', 'The last Token was removed.'; afterword on Normal/Hard losses only), the recap (six tiles in the HUD's order and
tiers, labels read once), Settings, Guide, exit confirm ('Exit the game?' / 'Keep playing' / 'Exit game'), home, library
('Escaped', 'Fell when Stability reached 0', 'Taken by the fourth King'), story mode, About. The prose forms 'Tokens 9 left'
(journal header, timeline, story mode) beside the tiles' '9/10' (spoken '9 of 10 left') are the decided split from
game-copy-v-04 (sign-off 1): kept.
No new findings.

## Approval
- game: approved. s-14 resolved; no open or regressed item; no new finding.
- copy: approved. s-12 and s-13 resolved; no open or regressed item; no new finding.
- s-15 (raised for the visual-layout lens) is resolved too.
