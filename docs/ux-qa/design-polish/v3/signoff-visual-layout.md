# Sign-off 2: visual/typography + layout/responsive

Captures: signoff-2 (head 0ea3607). Source at HEAD 7e10008 differs only in a comment. I ran my own probes at HEAD
on a dev server (port 5199, now stopped). Their scripts and output are in v3/vl3/:

- hud125/: the HUD at 16px and 20px roots
- menu/: the ⋯ menu keyboard model
- menu-dialogs/ and intro-settings/: focus in and out of dialogs
- orphans/: lone last words, scanned live across the surfaces
- pitch/: the home and first-run pitch at seven widths
- motion/: a roll for tasks and two card draws at iPhone 13, with every landmark's box sampled each frame, the
  video and a frame sheet (motion/sheet.png)
- pairs/: per-state review sheets

The prior review is saved as v3/signoff-visual-layout.signoff1.md.

## Verdicts

- **VT-1-11: resolved.** I computed the Inter sizes on every captured screen (raw texts and elements, 45 states x 4
  viewports).
  - No screen uses more than 5 Inter sizes.
  - The only pair 1px apart is the planned 11px HUD label next to the 12px toolbar label at 360, and only below
    375px (VT-1-10 exemption).
  - The fractional sizes (22.464, 24.624, 25.896, 32.4, 35.1) are all lixdu display titles, which are exempt.
  - The 13.33px entries in the story library are `<button>` containers whose text renders in child spans.
  - The notice tab is 14px on one line at 360, 390, 844x390 and 1440 (notice-return-king raw).
- **VT-1-14: resolved.**
  - At 844x390 the final log ends "THE END · The fourth King / was revealed.", with no lone word
    (final-log-timeline/iphone-13-landscape.png).
  - The other listed states pass: round-start has no lone words at any viewport (orphan scan); the home pitch and
    first-run are covered under s-05; the home card title wraps "LOCKED IN / THE TECH / DISTRICT", a balanced
    display title.
  - Lone words outside VT-1-14's listed states are filed as s-09.
- **visual-layout-s-01: resolved.** I probed 360, 375, 390, 412, 844x390 and 1440 at 16px and 20px roots, with the
  widest values (18/20, 0/4, 20, 52, 3/4, 10/10). Result: 0 fails. The tiles are disjoint, ink clearance is at
  least 4.0px on phones, and the Roll|Cards seam is 0.00px off (-0.01 at 844x390@20). At the default root the
  sizes are unchanged: 11/12px labels, 18px values and 11px maxes on phones (vl3/hud125/hud125.json, sheet.png).
- **visual-layout-s-02: resolved.**
  - The Ace of Hearts card face shows "it just *ends*" and "You're *using* it." in italic, with no markers, at 360
    and 390 (card-primary-success-long).
  - Every card.story consumer goes through storyText.js: CardDisplay.svelte and StoryRound.svelte:95 use
    storyHtml(), and CardDeck.svelte:174 uses storyPlain() for narration. No other consumer exists.
- **visual-layout-s-03: resolved.** Measured at 360 and 390 (vl3/menu/android-small.txt and iphone-13.txt):
  - Enter or Space on ⋯ focuses Settings.
  - ArrowDown cycles Settings, Dice theme, Auto-play, Read aloud and wraps; ArrowUp, End and Home also work.
  - Tab, Shift+Tab and Escape close the menu (aria-expanded false) with focus on ⋯.
  - ArrowUp or ArrowDown on ⋯ opens the menu on its last or first item.
  - The step button is never focused while the menu is open.
  - The fill is rgb(8,12,22); no glow shows through (vl3/menu/menu-390-crops.png).
  - What happens after an item is chosen is a separate defect, filed as s-07.
- **visual-layout-s-04: resolved.**
  - In caption-odd the caption has the readout's 8px top-left and bottom-right chamfers, with a 1px gradient
    border at the readout's 55% (zoom: vl3/caption-corners-360.png).
  - At 844x390 the caption spans 566..836, which matches the step button's 566..836.
  - In drift.md every other position is unchanged (caption Δ0 at every viewport).
- **visual-layout-s-05: resolved.** I probed home and first-run at 360, 375, 390, 412, 768, 844x390 and 1280
  (vl3/pitch).
  - Each sentence stays on one line at every width.
  - At 360, 375 and 390 both surfaces read "A solo journaling game." / "Draw, roll, write."; home also does at 412.
  - First-run at 412 and up, and home at 768 and up, fit on one line.
  - No width overflows horizontally.

The owner items and timing were not on my list. The motion probe at iPhone 13 (390x664, the Safari viewport)
records a roll for tasks and two draws.
- The HUD, toolbar, readout and step button each keep one box for every frame they are visible. Only the card
  moves, within its 8px rise.
- The die resting on the step button and the beats between cards follow the owner's decisions.

## New findings

### visual-layout-s-06 · medium · layout · play: the intro's Begin button is not in the step slot

When the intro hands over to the board, the primary action jumps at every viewport. In landscape the intro button
is also a different size and wraps to two lines. Boxes are from the signoff-2 raw intro and round-start controls:

| viewport | intro "Begin your journey" | first board step ("Roll for tasks") | change |
|---|---|---|---|
| 360x640 | 16,576 328x48 | 24,512 312x48 | Δy −64, Δx +8, Δw −16 |
| 390x844 | 16,780 358x48 | 24,716 342x48 | Δy −64, Δw −16 |
| 844x390 | 590,161 238x67 ("BEGIN YOUR / JOURNEY") | 566,314 270x48 | Δy +153, Δh −19 |
| 1440x900 | 480,836 480x48 | 480,820 480x48 | Δy −16 |

- Shots: intro/*.png against round-start/*.png.
- Cause: the intro renders its own ButtonBar + ContinueButton (GameScreen.svelte:1018-1024), not the `#step-action`
  slot that every board step uses.
- Fix: render the intro's button with the step slot's geometry (StepAction, or the same position rules) at every
  breakpoint. In landscape it then sits in the action column's bottom slot at 270px, where the label fits on one
  line.
- Acceptance:
  - At 360, 390, 844x390 and 1440, the intro button's box equals the round-start step button's box ±1px (x, y, w, h).
  - Its label is one line at every core viewport.

### visual-layout-s-07 · medium · layout · overlays: dialogs opened from the ⋯ menu lose keyboard focus

Settings and Dice theme opened from the ⋯ menu start with focus on `<body>`. Escape does nothing until the user
Tabs into the dialog. On close, focus falls back to `<body>`, not to ⋯.

- Measured at 390 (touch) and in a 700px desktop window (vl3/menu-dialogs/report.txt):
  - Enter on ⋯, then Enter on Settings: the dialog is open with focus on BODY.
  - Escape: the dialog is still open.
  - Tab, then Escape: the dialog closes with focus on BODY.
  - Dice theme behaves the same way.
- The toolbar path is correct, so this applies only to the ⋯ path. At 844x390 and 1440 focus moves into the
  dialog, Escape closes it, and focus returns to SETTINGS (vl3/intro-settings/report.txt).
- Cause:
  - PlayerInfoBar.svelte:165-168: `fromMenu()` closes the menu without moving focus.
  - ContentModal.svelte:69-75 therefore records the vanishing menu item as `previouslyFocused`. Its
    `dialogElement.focus()` does not hold, and on close focus goes to a removed node.
- Fix: in `fromMenu`, focus ⋯ first (closeMenu({ restoreFocus: true })), then open the dialog. The modal then
  records ⋯ as the trigger and takes focus.
- Acceptance: at 390 (touch) and in a 700px window, after Enter on ⋯ and Enter on Settings (and on Dice theme):
  - focus is inside the dialog;
  - Tab stays inside it;
  - one Escape closes it;
  - focus is back on ⋯.

### visual-layout-s-08 · low · layout · pages: the ambient motes paint over content on home, library, story and About

- NeuralBackground.svelte:158 keeps its default `z-index: var(--neural-z, 10)` on the home route (+page.svelte:386,
  which also hosts the story library and story mode) and on StaticPage. Their content sits at z-index 1
  (+page.svelte:497-498, StaticPage.svelte:50-51). Only Game.svelte:107 sets −1.
- So the motes drift over cards, buttons and prose.
- Pixel evidence: in home-first-visit/android-small.png the opaque Play fill (120,31,174) reads (87,95,198) under a
  mote at (420,1002) device px. The fill is `linear-gradient(#831d98, #6d22c7)`, HomeGameCard.svelte:304.
- Fix: put the motes behind content on these hosts (`--neural-z: 0` or −1, with content at 1), as the game already
  does.
- Acceptance: on home, library, story and About at 360 and 1440:
  - no mote pixels fall inside an opaque button or a text box (the Play fill samples uniform);
  - the motes still show in the gaps.

### visual-layout-s-09 · low · visual · global: lone last words remain in prose outside VT-1-14's states

The live scan (vl3/orphans/orphans.json, vl3/orphans.cjs) finds these:

- **Exit dialog, 390:** "Your progress is saved. Pick it up from / home." Every player sees this.
  ConfirmModal.svelte:54-60 has no text-wrap rule (exit-confirm-game/iphone-13.png).
- **Intro:**
  - 390: "…running out of / time." (intro/iphone-13.png)
  - 360: "…remove all 10 Tokens to / escape."
  - 844x390: "…lost in time / forever."
- **Game Guide and /how-to, 360 to 1440:** paragraphs ending in a lone "draw.", "reminder.", "need.", "fall.",
  "revealed." or "on.".
- **About, 360:** "Dream Console is made by Dimm / City." This splits the studio's name.
- **Card headline, 360:** Ghost in the Machine's Ace of Hearts ends "…know exactly how to / disappear." even with
  `text-wrap: pretty` (CardDisplay.svelte:521-530; card-primary-success-long/android-small.png).
- **Journal round list, 360:** "You find a blueprint of the time / machine".

Only four `text-wrap: pretty` rules exist in src. VT-1-14 recommended pretty on every paragraph of board, card,
caption, home and dialog copy.

- Fix:
  - Make `text-wrap: pretty` the default for body copy (p, li, td, .confirm-message, .round-text) in styles.css.
  - Use `text-wrap: balance` on the card headline (.byte-data, up to 4 lines).
  - Put a no-break space in "Dimm City" on About.
- Acceptance: rerun vl3/orphans.cjs at 360, 390, 844x390 and 1440.
  - No prose block of 2 or more lines ends on a single word under 10 characters.
  - "Dimm City" never splits.

### visual-layout-s-10 · low · layout · overlays: at 360 the journal's round list hides cards with no cue

- At ≤600px the round list scrolls inside itself (an owner decision). Its height is `max-height: min(28dvh, 16rem)`
  (JournalEntry.svelte:849-853).
- At 360 that shows three rows, and the bottom edge falls exactly between the third row's lines.
  - That row reads "You're caught in a toxic gas"; its last word, "leak", is hidden.
  - Three more cards (4♣, A♦, 9♣; raw offscreenTexts inScroller) are out of view.
  - Nothing shows that more follow: no fade, chevron or partial row (journal-entry/android-small.png).
- At 390 and 844x390 a cut row happens to show, and desktop shows all six.
- Fix: give the list the card story's scroll cue (a bottom fade plus the chevron, CardDisplay's scrollCue) while
  rows remain below. Alternatively, size it to whole rows plus half a row.
- Acceptance: at 360 and 375 with a six-card round:
  - while rows remain below, the list shows a cue (a fade with the chevron, or a visibly cut row);
  - the cue goes away at the end of the list.

### Checked and not filed

- **Two-line title drift.** drift.md shows a 13-14px title-ink shift on phones, which is the centred-slot model I
  accepted in sign-off 1 (Δcx 0, the box fixed).
- **Intro toolbar.** The toolbar on the intro is opacity 0 and inert, so it cannot be tabbed into or hit.
- **Desktop main-area overflow.** The 16px "own overflow" on the desktop main area cuts nothing (the step button
  ends at 868, the box at 884).
- **Kings label.** The KINGS label turning red at the first King is the VT-1-15 decision.
- **HUD maxes.** Maxes at 11px (phones) and 10px (landscape) are the OWN-1 spec.
- **Mono face.** Share Tech Mono on the log stat line is the declared --font-mono.
- **Intro tab order.** On phones the DOM order puts the toolbar before the step button. A skip link comes first,
  and the order is the same at every breakpoint; I accepted it in sign-off 1.

## Approval

- visual: **not approved.** s-09 is open; s-08 is filed under layout but is visible on every home screen.
- layout: **not approved.** s-06, s-07, s-08 and s-10 are open.
