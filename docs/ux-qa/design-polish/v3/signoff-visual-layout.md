# Sign-off 4: visual/typography + layout/responsive

Sign-off 4 is complete. Captures: signoff-4 (head 7b4f138); HEAD 2de6ebc changes only docs. My probes ran at HEAD
on a dev server (port 5198, stopped at the end): v3/vl5/hover.cjs (s-11), v3/vl5/modals.cjs and settings-scroll.cjs
(dialog scroll), v3/vl5/tableclip.cjs (desktop table overflow), and a board capture at Safari's visible areas
(390x664 and 750x342) into round-vl5short/. Grids and crops are in v3/vl5/. The sign-off 3 review is saved as
v3/signoff-visual-layout.signoff3.md. OWN-6 and OWN-7 are not in this pair's list, so they get no verdict here.

## Verdicts

- **visual-layout-s-11: resolved.** v3/vl5/hover.cjs at HEAD (dev server, port 5198), real touch taps at 390 and
  360, then a real mouse at 1440 (v3/vl5/hover/report.txt).
  - After tapping Begin, the roll and Begin round 1, the step button reads `:hover` true but border
    `#d946ef` to `#00ffff`, wrapper glow `rgba(217,70,239,0.3)`, filter none. The only brightness is the 400ms
    `changed` window (brightness(1.4) to 1.002 at 150ms and 1050ms after the Begin tap).
  - The toolbar ⋯ after a tap and Escape: `:hover` true, background transparent.
  - At 1440 with a mouse: hover gives `#ffd700` to `#00ffff`, brightness(1.08), the gold glow; the toolbar Guide
    hover gives `rgba(0,238,255,0.1)`.
  - In the signoff-4 captures every step button has the magenta frame (round-start, task-result, stability-nat1,
    salvation-n4-fatal and result-hold were the gold ones before).
- **visual-layout-s-12: resolved.** signoff-4 drift, caption-odd: at 1440 the caption is 480,732 480x36 and the step
  button 480,820 480x48 (0px difference on both edges). 360: 8..352; 390: 8..382; 844x390: 566..836 w 270, all as
  in signoff-3.
- **visual-layout-s-13: resolved.** signoff-4 raw library-stories/iphone-13-landscape.json: back button 32,8 44x44;
  title 28px, one line, 13.9..46.1; subtitle 59.4..76.9, so the block is 63px; the second row of cards starts at
  y 274.1 (was 352). The sort control's right edge (812) lines up with the grid. 360, 390 and 1440 boxes match
  signoff-3 (360: back 24,24; title 24,84 312x64.4; subtitle 24,152.4).

## New findings

### visual-layout-s-14 · medium · layout · pages: on a notched iPhone in landscape, Home and Game Over draw text under the notch

`src/app.html:5` sets `viewport-fit=cover`, so in landscape Safari lays the page out edge to edge and reports side
insets (47px each side on an iPhone 13). The board (GameScreen.svelte:1490-1491), the library
(BrowseGames.svelte:371-372), story navigation and ContentModal pad by `env(safe-area-inset-left/right)`. Home and
Game Over do not, so their content sits inside the insets.

- Home at 844x390 (signoff-4 raw home-first-visit/iphone-13-landscape.json): the pitch "A solo journaling game." starts
  at x 16, the menu button is 770.7..818.7 (the right inset starts at 797), the first card's title starts at x 40. The
  logo sits at the header's 25px padding (HomeHeader.svelte:206, `clamp(16px, 3vw, 32px)`; +page.svelte:518,
  `var(--space-md)` sides).
- Game Over at 844x390 (gameover-loss-kings raw): the recap's outer tiles span 25..135 and 709..819; the Stability value
  starts at x 43.1 and the Tokens max and padlock end at 797+. GameOver.svelte:303-306 gives landscape 16px sides.
- Overlay: v3/vl5/notch-landscape.png shades the 47px insets on both captures and draws the sensor housing on the left:
  it covers the "A" of the pitch and the left edge of the Stability tile.
- Fix: give the Home column and header, and the Game Over content, side padding of
  `max(<current>, env(safe-area-inset-left/right))`, as BrowseGames already does.
- Acceptance: with the page's computed side padding read at 844x390, every Home and Game Over text and control box would
  sit at x ≥ 47 and right edge ≤ 797 when the insets are 47 (check the CSS: each horizontal padding on those containers
  is a `max(…, env(safe-area-inset-*))`). Captures at 360, 390, 844x390 (no insets) and 1440 are unchanged.

### visual-layout-s-15 · medium · layout · overlays: dialog bodies scroll with no cue, and the fold can fall on a divider

Every other scroller in the app shows a bottom fade and the cyan chevron while content remains below (the card story,
the journal's round list, the final-log timeline: `journal/scrollEdges.js`). ContentModal's scrolling body
(`.content-body-wrapper`, ContentModal.svelte:317-323) has none (mask none). Where the fold lands between blocks, the
dialog's first screen reads as complete.

- Settings at 360x640 (v3/vl5/modals.cjs, report v3/vl5/modals/report.txt; shot v3/vl5/modals/android-small-settings.png):
  the body is 64..559; the Rule tips row ends at 526 and the section divider sits at 550, 9px above the fold. 94px are
  hidden below, including the whole "Advanced" disclosure (Voice, read-aloud details, auto-play timing): see
  android-small-settings-end.png. Nothing is cut at the fold, so nothing says there is more.
- Game Guide at 844x390 (iphone-13-landscape-guide.png): the body is 69..317; the chip index and its divider end above
  the fold and "The goal" starts at 328, 11px below it. 3,216px of the guide are hidden with no cue.
- Fix: put `scrollEdges` on `.content-body-wrapper` and reuse the journal's cue (40px bottom fade and the cyan chevron
  while `below`, gone at the end). This covers Settings, the Game Guide, Dice theme and About in one place.
- Acceptance: Settings at 360x640 and the Game Guide at 844x390 and 750x342 open with the fade and chevron at the bottom
  of the body; both are gone once scrolled to the end; a dialog that fits (Exit) shows neither.

## Checked and not filed

- **Two-line STABILITY CHECK on phones.** Still the only board element that moves (13px at 360, 14px at 390), with
  Δcx 0 and its box fixed; the description and result share one centred slot at 201..221 (one line) or 189..233 (two
  lines) at 360, centre 211 in every state. Every change of title happens behind the full-screen card or the journal,
  so a player never sees the two titles swap in place. Same centred-slot model as sign-offs 1 to 3.
- **Readout hairline under a two-line title.** It is present at y 181.5 in every state at 390 (pixel row 363 at 2x is
  the brightest in round-start, stability-check, stability-nat20 and salvation-n4-step); it is only quieter under the
  title's glow.
- **Desktop table overflow.** The raw `clipped` entry on desktop (table 744 tall, scrollHeight 760) has no element past
  the table's bottom (vl5/tableclip.cjs at 1440 and 1280): it is trailing space, nothing is cut.
- **Short viewports.** round-vl5short at 390x664 and 750x342: the readout, notice tab, Surreal hint, rule caption, step
  button and toolbar all fit, nothing overlaps, and the caption docks above the step button in landscape.
- **Game Over recap padlock.** The Tokens value is centred on the tile (label 1076.4, value 1077.5 at 1440); the padlock
  hangs outside the group on the right, centred on the large digits.
- **Card focus frame.** The white 5px frame on the surfaces card captures is the card's `:focus-visible` style
  (CardDisplay.svelte:416-419), not a lost type colour; touch captures show the type colour.
- **Final-log timeline.** "Instability" in the mono face is the row's lead label, as cards are (GameTimeline.svelte:105,
  113-114); the 12px hanging indent on the wrapped line is the list's indent.
- **Settings section gap.** The 43px under Rule tips (against 17px under other rows) is the section's own bottom padding
  before the Advanced block: a section break, not a row gap.
- **Type and contrast.** Board Inter sizes per screen are at most six (12, 14, 16, 18, 20 plus the display title);
  under-12px runs are only the planned HUD labels and maxes. Every board text run is at least 8.5:1 except the unlit LED
  ghosts (decorative). No page-level horizontal overflow on any board or surface capture; every control is 44px or more
  except one inline link on About (inline links are exempt).
- **Header menu at 844x390 and 1440.** Missing by design: the ⋯ menu exists only at 720px and below, where it was
  captured; wider screens show every control in the bar.

## Approval

- visual: **approved.** s-11 is resolved and I have no new visual finding; the readout, the HUD tiers, the cards, the
  endings and the dialogs hold up at every captured viewport.
- layout: **not approved.** s-12 and s-13 are resolved, but s-14 (Home and Game Over under the landscape notch) and
  s-15 (dialog bodies scroll with no cue; Settings at 360 hides Advanced below a divider) are open.
