# Sign-off 6: visual/typography + layout/responsive

Sign-off 6 is complete. Captures: signoff-6 (head 4568859; HEAD 12db0bf changes only tests and docs, no src). Probes run
at HEAD on a dev server (port 5197, stopped) into v3/vl7/. The sign-off 5 review is saved as
v3/signoff-visual-layout.signoff5.md.

## Verdicts

- **visual-layout-s-16: resolved.** v3/vl7/s16.cjs at HEAD with real insets through CDP
  (`Emulation.setSafeAreaInsetsOverride`, left/right 47, bottom 21) at 844x390; every visible text run and control
  measured (sr-only excluded). Report v3/vl7/s16/report-board-iphone-13-landscape-i47.txt.
  - Intro, first screen: 14 runs, minL 47, maxR 797, 0 under the notch. Scrolled to the end: 12 runs, minL 47, 0 bad.
    Shot: v3/vl7/s16/iphone-13-landscape-i47-b-intro.png (title and every paragraph start at 47; the scroll cue is
    centred on the column).
  - Every other board state the same probe walks (opening roll, round start, task result, draw, card, Stability check
    and result, Guide, Settings and Exit dialogs, journal): minL 49.8-55, maxR <= 797, 0 bad. Nothing doubled.
  - The skip link with the insets (Tab, so `:focus-visible`): 47..180, level with the toolbar's left edge (47); 8 without
    insets (v3/vl7/skip.cjs, v3/vl7/skip-844-i47.png).
  - Without insets: signoff-6 against signoff-5, the intro at 360 and 390 differs by 8 and 26 pixels (background motes
    only). 844x390 and 1440 changed only through s-17's measure (below), as expected.
- **visual-layout-s-17: resolved.** v3/vl7/m7.cjs at HEAD, its own count (all descendant text, a collapsed space counted
  once), reports v3/vl7/measure/report.txt and report-landscape.txt. Longest line, 360 / 390 / 844x390 / 1440:
  - Intro, Future Lost: 43 / 47 / 61 / 61. Ghost in the Machine: 45 / 50 / 67 / 67.
  - Card story, every one of the 104 stories of both games set in the real `.byte-story`: 42 / 47 / 70 / 66; 0 lines
    over 75 out of 838-1,337 lines per viewport (p95 39 / 42 / 64 / 61).
  - Game Guide (in game): 46 / 50 / 69 / 69. /how-to: 37 / 43 / 69 / 69. About: 32 / 39 / 61 / 61.
  - 360 and 390 are unchanged: the column widths (intro 328 / 358, card 291 / 319, About 262 / 292) are those of
    sign-off 5, and every phone shot is pixel-identical to signoff-5 bar background motes.
  - At 844x390 the drawn card shows its title and both paragraphs with no scroll (the story scroller's scrollHeight
    210 = clientHeight 210; v3/vl7/measure/iphone-13-landscape-card.png); the longest story (Ace of Hearts, 1,166
    characters) shows title and first paragraph (signoff-6 card-primary-success-long/iphone-13-landscape.png).
  - On desktop the 480px intro column now lines up with the 480px step button (signoff-6 intro/desktop.png).

## New findings

### visual-layout-s-18 · low · layout · pages: the reading measure stops at four surfaces; story mode, the AI summary dialog and Settings help still run 76-85 characters

s-17 set `--measure` on the card story, intro, Guide and About. Three other places that show sentences still set their
width in `ch` or not at all, so at 844x390 and 1440 they run past 75 characters a line (v3/vl7/m7.cjs, sumpanel.cjs and
settings-m.cjs; report v3/vl7/measure/report.txt):

- **Story mode**, the player's own journal entries and final log, read back: `.journal-text` (StoryRound.svelte:304-310)
  and `.final-log-text` (story/FinalLog.svelte:58-64) have no max-width and fill the 640px `.story-round` column
  (StoryRound.svelte:157) at 18px (35.6em). Over every round of the four seeded runs: 79 ("The last King turned over and
  the lights went with it. I kept writing until the"), 78 and 76 characters, at both 844x390 and 1440. A real entry can
  be any length, so every long entry reads at about 79. Phones: 45 and 49, fine.
- **The AI summary dialog** (story mode, "Summarise with AI"): `.summary-intro` is `max-width: 60ch`
  (StoryGenerationPanel.svelte:177-181), 606px at 16px: lines of 78 and 76 ("An AI can read your journal and the cards you
  drew, and retell this run as one"; v3/vl7/measure/desktop-summary-panel.png).
- **Settings help**: `.cm-help` has no cap (ContentModal.svelte:681-687) and `.cm-section-desc` is `max-width: 65ch`
  (ContentModal.svelte:640-646), the very `ch` measure s-17 found renders long in Inter. At 14px in the 576px row:
  84 ("A short note the first time a rule comes up in a game. The Game Guide lists the ones", signoff-6
  settings-game/desktop.png, also at 844x390) and 85 (the Voice section description under Advanced). Both are past
  WCAG 1.4.8's 80.
- Fix: `max-width: var(--measure)` on `.journal-text`, `.final-log-text`, `.summary-intro` (replacing 60ch),
  `.cm-section-desc` (replacing 65ch) and `.cm-help`. The token is in em, so it gives about 65 characters at 18, 16
  and 14px alike.
- Acceptance: measured the same way at 360, 390, 844x390 and 1440, no line in story mode (every round of the four
  seeded runs, journal entries and final log), the AI summary intro, or the Settings help and section descriptions
  (Advanced open) is longer than 75 characters; the phone figures are unchanged.

### visual-layout-s-19 · low · visual · global: numbers break away from their units at line ends ("10 | Tokens", "52- | card")

A number and the word it counts should never be split by a line break; the eye reads "10" at a line end as a
stray figure. The new measure put two such breaks on the most-read lines, and phones already had others
(v3/vl7/numbreak.cjs and strongbreak.cjs at HEAD):

- Game Guide, "The goal" (the first section): the highlighted key figure `<strong>10 Tokens</strong>`
  (GameGuide.svelte:134) breaks as "and **10** / **Tokens**" at 844x390 and 1440, in the dialog and on /how-to. It
  held on one line before s-17: v3/vl7/guide-goal-s5-vs-s6.png (signoff-5 above, signoff-6 below).
- About: "A standard 52- / card deck" at 844x390 and 1440 (AboutContent.svelte:25; signoff-6 page-about/desktop.png),
  also new with the measure.
- Game Guide elsewhere: "removes 1 / Token" (GameGuide.svelte:228) and "Lose 3 / Stability" in the Stability
  table (GameGuide.svelte:28) at 360; "then 1 / Token comes off" in the Salvation table (GameGuide.svelte:39) at 390;
  "adds 1 / Token" in the Difficulty list (GameGuide.svelte:280) at 360, 844x390 and 1440.
- Fix: a no-break space between a numeral and its unit word in the Guide's text and tables (`20&nbsp;Stability`,
  `10&nbsp;Tokens`, `1&nbsp;Token`, `3&nbsp;Stability`, `2&nbsp;Stability` and the like, including the table data at
  GameGuide.svelte:28-39) and a non-breaking hyphen in About's "52‑card" (U+2011). Not `white-space: nowrap` on
  `strong`, since one bold run there is a whole sentence.
- Acceptance: v3/vl7/numbreak.cjs (extended to hyphens) finds no numeral separated from the next word by a line break
  on the intro of both games, the Guide (dialog and /how-to) or About at 360, 390, 844x390 and 1440.

## Checked and not filed

- **Positions hold.** signoff-6 drift: toolbar, title slot, caption, result line and step button Δ0 at all four
  viewports across the 20 table states. The signoff-6 table measures the title's reserved slot (114, 52/57 high on
  phones); its ink is pixel-identical to sign-off 5, so the two-line STABILITY CHECK still sits 13px (360) and 14px
  (390) higher than one-line titles inside that fixed slot, centred, as accepted in sign-offs 1 to 5.
- **No other change.** Pixel diff of all 178 shots against signoff-5: only the s-17 surfaces moved (cards at 844x390,
  help-game, intro and page-about at 844x390 and 1440); every other board and surface shot differs by at most 84
  pixels of background motes. The `clipped`, `outside` and `smallTargets` lists and page overflow are identical to
  signoff-5 in every surface state (the HUD under a dialog, the collapsed Advanced block, the story scroller, About's
  inline link, Home below the fold); no board state overflows.
- **OWN-3 bottom toolbar with real insets** (v3/vl7/portrait-inset.cjs, v3/vl7/iphone-13-insets.png): iPhone 13 with
  top 47 / bottom 34 puts the HUD at 47..111, the step button at 690..738 (the intro's Begin button is in the same
  slot) and the toolbar at 762..810, exactly clear of the home indicator. 360x640: HUD 24, step 512, toolbar 584..632.
- **Guide, About, intro and card at the new measure.** Left-aligned with a ragged right; chips, tables and section
  rules keep the full column; the lead (18px, 540px) and body (16px, 480px) share a left edge. The card at 844x390
  leaves the right third of the face to the type badge and the ragged edge, which reads as intended.
- **Board and surfaces through both lenses** at every captured viewport (montages v3/vl7/mont-360-*, mont-390-*,
  mont-844-*, mont-1440-A): HUD tiers and LED digits, readout slots, card tab, notice tab, Surreal hint, rule caption,
  result-hold run-out, reduced-motion d20, header menu, cards, endings, journal, final log, library, story mode and
  dialogs read as in sign-off 5.
- **Header menu at 844x390 and 1440.** Missing by design: the ⋯ menu exists only at 720px wide and narrower.

## Approval

- layout: **not approved.** s-16 and s-17 are resolved, but s-18 stands: story mode's journal and final log (76-79),
  the AI summary intro (78) and Settings help (84-85) are still off the reading measure.
- visual: **not approved.** No visual item was open, but s-19 is new: the measure split the Guide's key figure "10
  Tokens" and About's "52-card" across lines, and phones already split "1 Token" and "3 Stability".
