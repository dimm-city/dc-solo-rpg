# Sign-off: visual/typography + layout/responsive (signoff-1 captures; src unchanged from d3a902a to 7fb6eba)

Evidence: signoff-1 shots, drift.md and raw metrics; my own probes on a dev server at HEAD (port 5199, stopped):
v3/vl2/probe (readout containment at 360, 390, 844x390, 1440 and 360 with a 20px root; keyboard order;
the more menu), v3/vl2/hud125 (HUD at larger text sizes), v3/vl2/dock (toolbar with safe-area insets and short
viewports), v3/vl2/firstrun (first-run panel at six widths). Crops are in v3/vl2/.
OWN-6 and OWN-7 are game-lens timing items and are not in this pair's list, so they get no verdict here.

## Verdicts

- **VT-1-11: open.** Every surface now uses only 12/14/16/18/20 plus display sizes. The HUD's 11px at 374px and
  below is the planned exemption. The board's notice tab is still 13px (`ContextBackground.svelte:218` and `:360`,
  0.8125rem on phones and landscape). In notice-return-king at 360, 390 and 844x390 it sits beside the card tab's
  14px and the toolbar's 12px "ROUND" label, so the Inter sizes on that screen are 12/13/14/16. That fails "no two
  sizes 1px apart on one screen". The developer left it for the OWN-4 column, which has shipped. Use 0.875rem, as
  from 600px up. At 360 the tab then wraps to two balanced lines, which it is built to do.
- **VT-1-14: open.** The first-run panel is fixed: "The game teaches you as you go." fits one line at 360, 375,
  390, 768, 844 and 1280, and Play is 61px tall at all six widths (v3/vl2/firstrun). final-log is one of the
  item's states, and at 844x390 it still ends with a lone word: "THE END · The fourth King was / revealed."
  (signoff-1 shots/final-log-timeline/iphone-13-landscape.png, crop v3/vl2/finallog-land-crop.png; round 2 shows
  the same). The cause is `GameTimeline.svelte:126-128`: the end clause gets `white-space: normal` but no
  `text-wrap: pretty`/`balance`. The other listed states pass: round-start at 360, the skip-damage notice (now
  one line) and home-return. caption-easy-ace-third passes by construction: `.rule-text` has
  `text-wrap: balance`, and the caption is under 6 lines.
- **LR-1-01: resolved** (via OWN-4). In drift.md the panel, hairline, body, tabs, caption and step button hold to
  the pixel in every board state at all four viewports. A screen against its result state gives Δ0, and a caption
  state against its tips-off twin gives Δ0. No text overlaps the HUD or the button. Only the title ink changes: on
  phones the title is centred in a fixed two-line box, so "STABILITY CHECK" (two lines) has its top 13-14px above
  a one-line "ROUND 1". Its centre is unchanged (Δcx 0), the box and everything around it stay put, and the swap
  is a crossfade. I accept that centred-slot model in place of round 1's last-line rule.
- **OWN-3: resolved.** Phones in portrait (≤600px) stack the HUD, then the table, then the toolbar. At 390 the
  button sits at 716-764 and the bar at 788-836: a 24px gap, 48px tall, edge to edge with the HUD (8..382).
  - Safe area: with a 34px bottom inset the bar ends at 810 (844-34). It also fits at 390x664 (Safari's visible
    area: 608-656), at 360x560 (Android with its bars: 504-552) and at 412x915.
  - Frame: mirrored, with the bevels facing the board.
  - Menu: opens upward, 6px above the ⋯ button, right edges aligned (390: 150..374, 582..784).
  - Breakpoint: at 601px the bar returns to the top.
  - Landscape keeps the bar at the top, for stated reasons (no reach problem, and the 270px action column cannot
    hold the bar at 44px targets). That is a sound call.
- **OWN-5: resolved.** The card line is now a two-glyph tab. In every readout state probed, every text box stays
  inside the readout's inner box and each tab's text stays inside its tab, with no page overflow. The states
  were: round start, instability, the Stability check with the return-King notice and its nat-1 result, 4-Ace
  Salvation with the skip notice and its nat-1 result, and the nat-20 task roll under Surreal. The viewports were
  360, 390, 844x390, 1440 and 360 with a 20px root. At the 20px root a three-line body or a two-line notice moves
  only the panel's bottom edge (report-*.json in v3/vl2/probe).
- **visual-layout-v-01: resolved.** At 360 in gameover-win-tokens, the gap from the slash to the max ink is 6
  device px for both "18/20" and "0/10". The developer's table (surfaces-1/ink-gaps.txt) is within 0.5px
  everywhere, and the HUD shares the token.
- **visual-layout-v-02: resolved.** The mirrored King index is 16px at full colour: 6.0:1 against the card face
  (measured from pixels in card-failure-counter/iphone-13.png). Orange is higher. It still reads as secondary to
  the 20px top index.

## New findings

- **visual-layout-s-01 · medium · layout · hud: the HUD breaks at 125% text on phones.**
  - What happens: with a 20px root (Samsung Internet or Firefox for Android text size, or a desktop default font
    size), the left half's min-content tracks outgrow 50%, and the Roll tile runs under Cards.
  - 375: Roll cell ends at 210.2, Cards starts at 187.5. The labels overlap by 17.7px ("ROLLCARDS"), the values
    overlap by 5.2px ("2052"), and TOKENS reaches the frame.
  - 390: the labels overlap by 10.2px and the values are 2.3px apart.
  - 360: the labels overlap by 2.9px.
  - 412: fits (0.8px).
  - 18px root at 390: fine.
  - Evidence: v3/vl2/hud125-sheet.png and the numbers from hud125.cjs. Round 2 asked for this check, but the
    android-small-125 HUD set was unreachable, so it never ran.
  - Cause: `StatusHUD.svelte:77-78` and `:348-349`, `minmax(min-content, …)` tracks inside the 50/50 halves of
    `:91`. Labels are rem-sized (`:183`).
  - Fix: cap the label and LED sizes by the HUD's own width (container units, or clamp against vw) so the tracks
    never pass min-content at 50%; keep the seam at 50vw.
  - Acceptance: at 360, 375, 390 and 412 with a 20px root, the tile boxes are disjoint, every label and value ink
    is at least 2px inside its tile and inside the frame, and the Roll|Cards seam is at 50vw ±0.5px.
- **visual-layout-s-02 · medium · visual · overlays: raw Markdown on card faces.**
  - What happens: the shipped Ghost in the Machine shows emphasis markers as literal text. The Ace of Hearts reads
    "it just _ends_, like a switch flipping… You're _using_ it." (signoff-1
    card-primary-success-long/iphone-13.png).
  - Scope: the game file has 39 `_word_` runs.
  - Cause: `CardDisplay.svelte:273` prints `{card.story}` as plain text, and `StoryRound.svelte:96` only turns
    newlines into `<br>`. CLAUDE.md says stories support Markdown.
  - Fix: render inline emphasis (`_x_`, `*x*` to `<em>`), sanitised, on the card, in story mode and anywhere else
    the story is shown.
  - Acceptance: no literal `_`/`*` emphasis markers on any Ghost in the Machine card face or story-mode page at
    360 and 1440, and the emphasised words are italic.
- **visual-layout-s-03 · low · layout · hud: the ⋯ menu is not keyboard-safe now that it opens over the step
  button.**
  - Enter on ⋯ leaves focus on the trigger, and ArrowDown does nothing.
  - The first Tab lands on "Roll for tasks", which is 63% under the open menu at 390 (menu 150..374 x 582..784;
    button 24..366 x 716..764). The items come next because the menu is portalled to the end of `<body>`.
  - The button's focus glow shows through the 97% menu fill, so the Read aloud row looks selected (v3/vl2/menu-tab-390-crop.png).
  - Enter at that point rolls the dice with the menu still open.
  - Fix: on open, move focus to the first item. Up and Down arrows (and Home/End) move between items. Tab or
    focus leaving closes the menu and returns to ⋯. Use an opaque fill.
  - Acceptance: at 360 and 390, Enter on ⋯ focuses Settings, the arrows cycle the four items, Tab or Escape closes
    the menu and refocuses ⋯, and the step button never takes focus while the menu is open.
- **visual-layout-s-04 · low · visual · play: the RULE caption does not use the board's frame language.**
  - It is the only square-cornered panel on the table (`RuleCaption.svelte:67`, a border-image). Its border is at
    full strength, louder than the readout's 55% frame, so secondary help outranks the readout
    (caption-odd/android-small.png).
  - In landscape it is `calc(100% - 16px)` wide (`:90`), so its edges (574..828) sit 8px inside the step button's
    and the HUD's (566..836).
  - Fix: use the readout's frame (tl/br chamfer, 1px, 55%, the same fill), and make the caption full width in the
    landscape column.
  - Acceptance: the caption has the readout's chamfered corners and border alpha, and in landscape its left and
    right edges match the step button's within 1px.
- **visual-layout-s-05 · low · visual · pages: the pitch breaks inside its first sentence.**
  - On home and first-run at 360-390 it reads "A solo journaling / game. Draw, roll, write."
    (home-first-visit/iphone-13.png, crop v3/vl2/home-pitch-390.png; v3/vl2/firstrun/first-run-360x640.png).
  - Cause: `text-wrap: balance` alone (`+page.svelte:440`, `FirstRunPanel.svelte:15`).
  - Fix: keep each sentence whole (nowrap spans), so the break falls between the sentences.
  - Acceptance: at 360, 375, 390 and 412 both surfaces read "A solo journaling game." / "Draw, roll, write.", and
    one line where it fits.

## Approval

- visual: not approved (VT-1-11, VT-1-14, s-02, s-04 and s-05 are open).
- layout: not approved (s-01 and s-03 are open).
