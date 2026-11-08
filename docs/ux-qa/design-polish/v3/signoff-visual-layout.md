# Sign-off 3: visual/typography + layout/responsive

Sign-off 3 is complete.

Captures: signoff-3 (head 3d0eb29). HEAD d7345d4 changes only docs/ux-qa/ux-qa-review.md. My own probes ran at HEAD
on a dev server (port 5197, stopped at the end). Scripts and output are in v3/vl4/. The sign-off 2 review is saved
as v3/signoff-visual-layout.signoff2.md.

## Verdicts

- **visual-layout-s-06: resolved.** The signoff-3 raw controls give the Begin box and the round-start step box as
  identical at every core viewport: 360 24,512 312x48; 390 24,716 342x48; 844x390 565.9,314 270.1x48; 1440
  480,820 480x48 (0px difference). The label is one line everywhere (19.2px box at 16px, 21.6px at 18px). The
  landscape Begin now reads "BEGIN YOUR JOURNEY" on one line in the action column (intro/iphone-13-landscape.png).
- **visual-layout-s-07: resolved.** vl4/menu-dialogs.cjs at 390 and 360 (touch) and in a 700px window, for
  Settings and Dice theme (vl4/menu-dialogs/report.txt). Enter on ⋯ then Enter on the item: the dialog is open with
  focus inside it. 40 Tab and 40 Shift+Tab presses never leave it. One Escape closes it, and focus is on "More game
  options".
- **visual-layout-s-08: resolved.** vl4/motes.cjs (the developer's pixel probe, rerun at HEAD) at 360 and 1440:
  `.neural-background` is z-index −1 on home, library, story mode and About. 0 changed pixels inside any opaque box,
  except 12 at the clipped corner of the desktop home card (outside the chamfer, not on the fill). The motes still
  show in the gaps (871 to 246,313 changed pixels per page).
- **visual-layout-s-09: resolved.** vl4/orphans.cjs (the acceptance scan) at 360, 390, 844x390 and 1440
  (vl4/orphans.log). The only hits are the home card display title "LOCKED IN THE TECH DISTRICT" (balanced, accepted
  under VT-1-14) and one card story ending "straightforward." (16 characters, inside the acceptance). The exit
  dialog reads "Pick it up / from home." AboutContent.svelte:27 and :35 use "Dimm&nbsp;City".
- **visual-layout-s-10: resolved.** vl4/journal.cjs, a six-card round at 360 and 375 (vl4/journal/report.txt).
  - At the top, the list has `more-below`, the 40px mask and the chevron at opacity 1. At 375 the edge falls exactly
    between rows (0 cut rows), which is the case the finding was about, and the cue still shows.
  - Scrolled to the end, the class and mask are gone and the chevron is at opacity 0. Scrolled back up 20px, the
    cue returns.
  - vl4/journal/se-pair.png shows top and end side by side.

## New findings

### visual-layout-s-11 · medium · visual · play: on phones a tap leaves the step button in its hover style

The step button's look depends on what the player last tapped, not on the game state. After a tap, the frame turns
gold to cyan, brightens and gets a gold glow. It stays that way until the player taps something else (a card), and
the next step button is magenta to cyan again. The step button is mounted once and keeps the same slot, so a phone
player sees its frame flip between two styles from step to step. The owner asked for exactly this slot to be
settled.

- Probe vl4/hover.cjs uses real touch taps (`page.tap`) at 390 and 360, where `(hover: hover)` is false and
  `(pointer: fine)` is false (vl4/hover/report.txt, sheet vl4/hover/sheet-iphone-13.png):
  - Before any tap: `:hover` false, `--aug-border-bg` is `linear-gradient(135deg, #d946ef, #00ffff)`, filter none,
    wrapper glow `rgba(217,70,239,0.3)`.
  - After tapping Begin, and again after tapping to roll: `:hover` true, border
    `linear-gradient(135deg, #ffd700, #00ffff)`, `filter: brightness(1.08)`, wrapper glow
    `drop-shadow(rgba(255,215,0,0.35) 0 0 10px)`. The new label ("Roll for instability", "Begin round 1") inherits
    it.
  - After a tap elsewhere it is back to the rest style.
- The captures show the same split. round-start, task-result, stability-nat1, salvation-n4-fatal and result-hold
  have the gold frame (the button was the last thing pressed). stability-check, notice-return-king and
  easy-final-check have the magenta one (compare round-start/android-small.png with
  stability-check/android-small.png).
- Cause: the hover rules are not limited to hover-capable pointers. AugmentedButton.svelte:123-129
  (`.aug-button-wrapper:hover` glow) and :227-237 (`.aug-button:hover` border, brightness and shadow, and
  `.aug-button.primary:hover` lifts 2px). The key-cap in the same file is already gated
  (`@media (hover: hover) and (pointer: fine)`, :294). The toolbar's `.status-bar-button:hover`
  (PlayerInfoBar.svelte:504) has the same gap.
- Fix: move these hover rules inside `@media (hover: hover) and (pointer: fine)`, as the key-cap is. Press feedback
  on touch stays with `:active` and the 400ms `changed` highlight. Do the same for the toolbar buttons.
- Acceptance:
  - Rerun vl4/hover.cjs at 390 and 360 (touch). After each tap (Begin, the roll, Begin round 1), the step button
    reads the rest values: border `#d946ef` to `#00ffff`, filter none (or the `changed` brightness inside its
    400ms window), and the phone wrapper glow.
  - At 1440 with a mouse, hover still shows the gold frame.

### visual-layout-s-12 · low · layout · play: on desktop the rule caption is narrower than the step button it docks above

The caption docks directly above the step button, and the two relate differently at each breakpoint.

| viewport | caption | step button | relation |
|---|---|---|---|
| 360 | 8..352 (344) | 24..336 (312) | caption wider; shares the HUD, readout and toolbar edges |
| 844x390 | 566..836 (270) | 566..836 (270) | edge to edge (the s-04 rule) |
| 1440 | 510..930 (420) | 480..960 (480) | caption 30px inside each edge; it shares no edge on the board (readout and HUD 240..1200) |

- Evidence: signoff-3/drift.md (caption-odd rows), crop vl4/caption-desktop-crop.png.
- Cause: RuleCaption.svelte:63 sets `width: min(100%, 420px)`. Only landscape (:104-108) matches the button.
- At 1440 the two stacked boxes are 87.5% of each other's width. Near-equal widths read as a misalignment, not a
  choice.
- Fix: cap the caption at the step button's width instead of 420px: `width: min(100%, var(--cta-max, 480px))`.
  Phones are unchanged (100% is under 480). On desktop it then shares both edges with the button, as in
  landscape. 480px of 14px text is about 68ch, inside the 45-75ch measure.
- Acceptance: in caption-odd at 1440 the caption box is 480,y 480xh, with x and w ±1px of the step button. At 360,
  390 and 844x390 the boxes are unchanged.

### visual-layout-s-13 · low · layout · pages: in landscape the Story Library title takes two lines at the desktop size

- At 844x390 the library title is lixdu 40px on two lines ("STORY / LIBRARY", 32..124). With the subtitle it fills
  32..152, which is 39% of the viewport height, so only one row of cards shows (library-stories/iphone-13-landscape.png).
- The cause is `.page-title { font-size: clamp(1.75rem, 6vw, 2.5rem) }` (BrowseGames.svelte:196-205). It sizes the
  title by width, so a landscape phone gets the desktop 40px.
- Story mode, one tap away in the same viewport, already has a landscape rule (LR-1-09, StoryMode.svelte
  `@media (max-height: 500px)`): a 1.75rem title on one line beside the back button. The two Story Library pages
  therefore use different title sizes and header layouts at 844x390, and the back button sits centred on a
  152px block in one and on a 32px line in the other.
- Fix: give the library the same landscape rule. At `(max-height: 500px)` set `.page-title` to 1.75rem on one line,
  with the back button centred on it as in story mode.
- Acceptance:
  - At 844x390 the library title is 28px and one line, and the header block (title plus subtitle) is 64px or less.
  - The second row of story cards starts above y 330.
  - 360, 390 and 1440 are unchanged.

## Checked and not filed

- **Two-line STABILITY CHECK.** The title is the only thing that moves (13-14px of ink, phones in portrait), and its
  box holds. This is the centred-slot model I accepted in sign-offs 1 and 2. The card tab to title gap is 8px in
  those states, which still groups the tab with the title.
- **Desktop description wrap.** salvation-n4-step wraps at 1440 ("…Survive this Stability / check and a Token comes
  off.", 600px max-width at 20px). It is balanced, and its slot holds.
- **Card note separators.** "UNLOCKED · NEEDS 17+ · / A STABILITY CHECK FOLLOWS" ends a line on "·" at 360 and 390.
  That is the DP-1-04/DP-1-16 clause rule (the separator stays with its clause), not a defect.
- **Second home card title at 360.** "LOCKED / IN THE / TECH / DISTRICT" is four lines (129px) at 28px with balance
  (vl4/home/android-small-card2.png). No three-line break fits a 280px body at 28px, the text is author content,
  and it is below the fold. Left as a note for the owner.
- **Home at 844x390.** The first view is header, pitch and key art, and the card titles start at y 374. The page
  scrolls, the cut art and title act as the cue, and fitting a Play button above the fold would mean a different
  card layout, which is beyond polish.
- **Dice theme tiles.** Two-word names wrap at 360 and 390 ("PINK / DREAMS", "BLOOD / MOON", "GLITTER / PARTY"),
  which makes those rows taller. Labels stay top-aligned in each row. This is ordinary grid behaviour.
- **HUD labels at 844x390.** The labels' line boxes are cut by 0.5px at the HUD frame (raw `clipped`). The ink has
  at least 4px of clearance (s-01).
- **Touch targets.** Every board control is 44px or more at every core viewport (raw controls).
- **Overflow.** No page-level horizontal overflow on any board or surface capture.

## Approval

- visual: **not approved.** s-11 is open: the primary button's frame changes style with the last tap on every phone.
- layout: **not approved.** s-12 and s-13 are open.

All five listed items (s-06 to s-10) are resolved. The dev server I started (port 5197) is stopped.
