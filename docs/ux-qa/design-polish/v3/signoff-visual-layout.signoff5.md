# Sign-off 5: visual/typography + layout/responsive

Sign-off 5 is complete. Captures: signoff-5 (head e3d3d88; HEAD 884ba8b changes only the workflow file). Probes run at HEAD on a
dev server (port 5196) into v3/vl6/. The sign-off 4 review is saved as v3/signoff-visual-layout.signoff4.md.

## Verdicts

- **visual-layout-s-14: resolved.** v3/vl6/s14.cjs and s14c.cjs at HEAD with real insets through CDP
  (`Emulation.setSafeAreaInsetsOverride`, left/right 47, bottom 21) at 844x390; every visible text run and control
  measured (sr-only excluded). Report: v3/vl6/s14/report-iphone-13-landscape-i47.txt.
  - Home first visit and return: every box 47..797 (logo and pitch start at 47, menu button ends at 797); scrolled to
    the end the same. The first-run frame computes 47px padding each side; its content is 224..620. The open menu's
    items end at 797 (the menu button itself reaches 799.4 only under its `:hover` scale, see below).
  - Game Over (Kings, real run): 82.3..758 with insets against 43.1..797.1 without, so the OverlayModal stage's own
    inset is in effect and nothing doubles. Story Library 47..797, story mode 102..742, About 62..733.
  - Without insets nothing moved: every tracked element box in the signoff-5 raw metrics for home-first-visit,
    home-return, gameover-loss-kings and gameover-win-tokens at 360, 390, 844x390 and 1440 is identical to signoff-4.
  - The board intro is not padded for the notch (its text starts at x 16 with 47px insets): filed as s-16, since s-14
    named only Home and Game Over.
- **visual-layout-s-15: resolved.** v3/vl6/s15.cjs at HEAD (report v3/vl6/s15/report.txt, shots v3/vl6/s15/).
  - Settings at 360x640 opens with `more-below`, the 40px bottom mask and the chevron (328,531 24x24) at opacity 1;
    scrolled to the end (94px) it has only `more-above` and the chevron at 0; at the middle both classes and the
    chevron back. Opening Advanced at the end brings the cue back at once (hidden 1,581px): the ResizeObserver on
    the body's child sees the disclosure grow.
  - Game Guide at 844x390 (hidden 3,216) and at 750x342 (3,293), and Settings at both landscape sizes: the same open,
    end and middle behaviour. Guide at 360, 390 and 1440: the same.
  - Exit confirm at every size and Settings at 390 and 1440 (they fit): no class, mask none, chevron at opacity 0.
  - Grids: v3/vl6/g-360-settings.png (open and end at 360), v3/vl6/g-844-guide.png (Guide 844x390, Settings 750x342).
  - Layout is untouched: every tracked box in settings-game, help-game and exit-confirm-game is identical to
    signoff-4 at all four viewports.

## New findings

### visual-layout-s-16 · medium · layout · play: on a notched iPhone in landscape, the game intro's text sits under the notch

The intro is the first screen of every game. It is an absolute overlay over the table (`.dc-intro-wrapper`,
GameScreen.svelte:1127-1135, `inset: 0`), so it is outside `.ui-content-layer`, whose landscape padding is the only
safe-area term on the board (GameScreen.svelte:1489-1492). Its text column pads by a flat `var(--space-md)`
(`.intro-story-container .content`, GameScreen.svelte:1265-1276).

- v3/vl6/s14b.cjs at HEAD with real insets through CDP (left/right 47, bottom 21) at 844x390 (report
  v3/vl6/s14/report-board-iphone-13-landscape-i47.txt): the intro's title, headings and every paragraph line start at
  x 16 (11 runs on the first screen, 10 more scrolled to the end). Every other board state measured the same way
  (opening roll, round start, task result, card, Stability check and result, the journal, Guide, Settings and Exit)
  starts at x 49.8 or more and ends at 797 or less; the intro's own step button ends at 797.
- Overlay: v3/vl6/notch-intro-landscape.png (the 47px insets shaded, the sensor housing drawn at the left) covers the
  start of "You are", "desperately", "the authorities", "What happened", "Your journey" and "temporal".
- Fix: give `.intro-story-container .content` side padding of `max(var(--space-md), env(safe-area-inset-left))` and
  the same on the right, as Home and the library do. In landscape the intro's right edge is the action column, so the
  right term only matters in portrait; it is harmless there (0).
- Acceptance: with 47px insets at 844x390 every intro text run starts at x 47 or more (title, headings and paragraphs;
  first screen and scrolled to the end). With no insets, the intro captures at 360, 390, 844x390 and 1440 are unchanged.

### visual-layout-s-17 · medium · layout · global: reading lines run to 85-95 characters; the code's `65ch` measures render about 88 in Inter

The CSS `ch` unit is the width of "0", and Inter's "0" is much wider than its average character in running text
(measured 0.466em per character: 656px holds 88 characters at 16px). So every measure set as `65ch` renders about 88
characters a line, and the 720px `--content-max` column renders 85-95 at 16px. Both are past the 45-75 character
reading measure (WCAG 1.4.8 asks for no more than 80).

- Measured at HEAD, characters per rendered line, longest line of each block (v3/vl6/measure.cjs and measure2.cjs,
  reports v3/vl6/measure/report.txt and report2.txt):
  - The drawn card's story (CardDisplay.svelte:605-606, `max-width: 65ch`): 88 at 844x390 (16px, 656px wide,
    "The ruins all look the same after a while. You took a wrong turn, then another, and now"; see
    v3/vl6/s14/iphone-13-landscape-i47-b-card.png and signoff-5 card-event, card-challenge, card-primary-success-long
    at 844x390). 360: 37, 390: 44, 1440: 61 (18px in a 520px card), all fine.
  - The game intro (`.intro-column`, GameScreen.svelte:1283-1288, `max-width: var(--content-max, 720px)`, styles.css:78):
    95 at 1440 (16px, 720px; "You must gather the necessary components…", signoff-5 intro/desktop.png). 844x390: 70;
    360: 44; 390: 48.
  - The Game Guide (GameGuide.svelte:290-294, `max-width: 65ch` at 18px, held to 656px by the 720px dialog): 86 at
    844x390 and at 1440 ("Any natural 20 makes you Lucid…"; signoff-5 help-game).
  - About (StaticPage.svelte:57-61, the same 720px column): 86 at 844x390 (651px) and 85 at 1440 (622px;
    signoff-5 page-about).
- Fix: one reading measure in em, not `ch` or px, so it holds at 16 and 18px. For Inter about 34em gives 70-73
  characters. Use it for `.byte-story` (replace `65ch`), `.game-guide` (replace `65ch`), `.intro-column` and the
  StaticPage column (`max-width: min(var(--content-max), 34em)`, or a `--measure: 34em` token beside
  `--content-max`). Headings and the card's title row can keep the wider box; only running text needs the measure.
- Acceptance: with the same measurement at 360, 390, 844x390 and 1440, no line of running text in the card story,
  the intro, the Game Guide or About is longer than 75 characters; the 360 and 390 figures are unchanged (37-48), and
  the card story at 844x390 still shows its title and first paragraph without scrolling the card.

## Checked and not filed

- **No regression since sign-off 4.** The signoff-5 drift table is identical to signoff-4's at all four viewports
  (toolbar, caption, result line and step button Δ0; the two-line STABILITY CHECK title on phones is still the only
  mover, 13px at 360 and 14px at 390, Δcx 0, as accepted in sign-offs 1 to 4). Every board text run and control box is
  identical to signoff-4 in every state, except game-over-stability at 1440, where only the run's values differ (the
  forced flow dealt other numbers), not positions. Every tracked surface element box is identical in all 16 surface
  states at all four viewports; the `clipped` and `smallTargets` entries are the same as signoff-4 (the HUD under a
  dialog, the collapsed Advanced block, the story scroller, About's inline link).
- **Home in landscape (844x390).** The first screen holds the header, the pitch, both key arts and the tops of the card
  titles; Play starts at y 553. It is a list page, the cut titles say the page goes on, and putting Play on the first
  screen would need a side-by-side card in landscape, a re-layout beyond polish.
- **Home Menu button and touch.** With real taps (v3/vl6/hover.cjs) the button reads `:hover` false after opening and
  closing at 360 and 390; one sample at 390 read the 1.1 hover scale while the menu was open, and nothing stays stuck
  after closing. Not filed.
- **Guide chip row at 360 and 390.** It runs off the dialog's edge by design (a scroll row with a visible cut edge,
  DP-1-20), not clipping; at 844x390 and 1440 the chips wrap.
- **The new dialog cue.** The chevron sits 8px from the dialog edge and 4px above the body's bottom, as the journal's
  does, has `pointer-events: none` and `aria-hidden`, fades by opacity only (no transition under reduced motion), and
  covers no control at any size (the probe's overlap list is empty in every open state).
- **Board and surfaces through the visual lens.** HUD tiers, LED digits, the readout, notice tab, captions, cards,
  endings, journal, final log, library, story mode and dialogs read as in sign-off 4 at every captured viewport.
- **Header menu at 844x390 and 1440.** Missing by design: the ⋯ menu exists only at phone portrait widths.

## Approval

- visual: **approved.** No visual item was open, nothing visual changed except the dialog cue, which matches the
  journal's, and I have no new visual finding.
- layout: **not approved.** s-14 and s-15 are resolved, but two new findings stand: s-16 (the game intro's text sits
  under the notch on a landscape iPhone) and s-17 (reading lines of 85-95 characters on the card in landscape, the
  desktop intro, the Game Guide and About; the code's `65ch` renders about 88 characters in Inter).
