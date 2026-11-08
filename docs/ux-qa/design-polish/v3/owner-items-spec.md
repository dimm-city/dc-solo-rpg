# Owner items OWN-3, OWN-4, OWN-5: spec

Written before the build. Numbers are CSS px at the core viewports (android-small 360x640,
iphone-13 390x844, iphone-13-landscape 844x390, ipad-portrait 768x1024, laptop 1280x720,
desktop 1440x900). "Phones" means portrait up to 600px wide:
`(max-width: 600px) and (orientation: portrait)`.

## OWN-3: the toolbar under the step button on phones

**What moves.** The in-game header bar (Exit, Guide, the game title, the round, ⋯). Nothing
else: the HUD row stays at the top of the screen, the table and the step button keep their
place in the table.

**Phones (portrait, up to 600px wide).**

- Screen rows, top to bottom: HUD, table (all the remaining height, with the step button at its
  foot), toolbar. Row gap 8px (unchanged).
- Screen padding: top `max(8px, env(safe-area-inset-top))` (the HUD is now the top element, so
  it clears a notch in a home-screen app), sides 8px, bottom `max(8px, var(--safe-bottom))`. The
  game route is 100dvh, so the toolbar ends above the browser's own bottom bar, and the
  home-indicator inset (`--safe-bottom`) keeps it clear of the indicator.
- The toolbar is the same component, the same controls in the same order, 48px tall and the
  HUD's width (edge to edge with it). Its frame is mirrored vertically: the 18px bevels are on
  its top edge, facing the board, and the two 9px steps on its bottom edge, so it reads as the
  same object docked to the other end of the screen. The frame is drawn by a decorative layer
  that is flipped; the controls are not transformed.
- Between the step button and the toolbar: the button bar's 16px bottom padding plus the 8px
  row gap, so 24px from the button's frame to the toolbar's top edge. A press aimed at the
  step button never lands on Exit (which sits under its left end).
- The ⋯ menu opens upward from the docked toolbar: its bottom edge 6px above the ⋯ button,
  right edges aligned (it opened downward, off the screen). At the top it still opens downward.
  The rule: it opens on the side of the button with more room.
- DOM order is unchanged (header, HUD, table): a screen reader still hears the game's title and
  round first; the "Skip to action" link stays the first tab stop.

**Landscape phones (up to 500px tall): the toolbar stays at the top.** Why:

1. There is no reach problem to solve. In landscape the phone is held at both ends, the top
   corners are inside the thumbs' arc and the screen is 342-430px tall.
2. "Under the roll button" in landscape is the foot of the right-hand action column, 248-280px
   wide. Exit, Guide, the title, the round and ⋯ do not fit there at 44px targets without
   cutting the title, and the column's free height above the button is the rule caption's dock.
3. Header and HUD stay one band at the top, so the table keeps its full height on the
   shortest screen.

**Tablets and desktop (over 600px wide, or landscape): unchanged**, header above the HUD.

## OWN-4: the board's centre text becomes one composed readout

**Diagnosis.** The circled block was four loose lines over the grid: the card line (cause), the
title (phase), the description (stakes, whose first sentence "An odd card demands a price"
repeats the RULE caption and the card line) and a notice that stated a non-event ("No King was
out to return"). Each had its own size and colour, none was attached to anything, and the block
was pinned at its bottom, 40% down the table, so it floated.

**The answer: the readout.** One framed panel on the table, the board's own language: the HUD's
frame (augmented-ui `tl-clip br-clip`, the same cyan-to-magenta gradient, at 1px and 55%
strength so the HUD stays the louder frame), the HUD's dark fill, edge to edge with the HUD.
One job per line, every slot reserved, nothing else.

```
              ┌────┐
   ╱──────────│ A♠ │──────────────────╮   card tab: the card behind this step (when there is one)
   │         STABILITY                │   title: the phase (lixdu)
   │           CHECK                  │
   │   ──────────────────────────     │   rule: a hairline
   │   10 or less costs Stability.    │   body: the stakes before the roll, the outcome after it
   ╰──────────────────────────────────╱
     ┌──────────────────────────────┐
     │ K♥ went back into the deck · │      notice tab: what a card modifier did (only when it did
     │ 0 of 4 Kings out             │      something)
     └──────────────────────────────┘
```

**Lines and their one job.**

| Slot   | Job                       | Before the roll                  | After the roll                    |
| ------ | ------------------------- | -------------------------------- | --------------------------------- |
| Card   | the card behind the check | `A♠` (rank and suit pip only)    | same                              |
| Title  | the phase                 | `Stability Check`                | same                              |
| Body   | stakes, then outcome      | `10 or less costs Stability.`    | `Rolled 8 · −1 Stability`         |
| Notice | what a modifier did       | `K♥ went back into the deck · …` | same (it stays for the step)      |
| RULE   | the general rule (once)   | docked above the button, as now  |                                   |

**Copy changes.**

- Stability check: `An odd card demands a price. 10 or less costs Stability.` becomes
  `10 or less costs Stability.` (the cause is the card tab and the RULE caption).
- The card line loses its description: the tab is the card's rank and suit pip (`A♠`). The
  card's full text was read on the card a moment before; on the board the card is only the
  cause of the check, and two glyphs say that. (The description still lives on the card, in the
  journal and in Story Mode.) This also ends OWN-5 by construction.
- A non-event is never shown: a modifier whose result reads "No …" ("No King was out to
  return") gets no notice tab and no announcement.
- Everything else keeps its round-1 copy (DP-1-06): Instability, Round N, Salvation, Final
  Check and their descriptions, the result lines (DP-1-07).

**Typography.**

- Title: lixdu 700, uppercase, 0.04em tracking, line-height 1.15, #19c3c6 with the 12px cyan
  glow. Size: phones `min(clamp(22px, 6.5vw, 28px), 7.2cqi)` in a two-line slot (only
  "Stability Check" and "Final Check" take two lines); over 600px `min(clamp(28px, 4.2vw, 40px),
  5cqi)` and landscape `min(28px, 5cqi)`, one line. The `cqi` cap is 1% of the readout's inner
  width: "STABILITY CHECK" is 18.55em wide in lixdu (93% of the slot at 5cqi) and the longest
  word, "INSTABILITY", 13.02em (94% at 7.2cqi), so no title can overflow the panel at any width
  or text size. The title is centred in its slot (a one-line title in the phones' two-line slot
  sits on the slot's centre line).
- Body: Inter, 16px (phones, landscape), 18px (600-1023px), 20px (1024px and up), line-height
  1.5, centred, `text-wrap: balance`. Stakes 400 in #b8b8c8; outcome 600 in #fff with the
  Lucid/Surreal word in its HUD colour; the outcome breaks only between clauses (" · ").
  Max line length 600px.
- Card tab: Inter 600 14px, white, the HUD's suit pip (SuitText), tabular figures.
- Notice tab: Inter 600 13px (14px over 600px), cyan #00ffff, line-height 18px, breaks only
  between clauses, `text-wrap: balance`.

**Geometry.**

| Viewport class       | Width                        | Top            | Padding (t / x / b) | Title slot | Body slot |
| -------------------- | ---------------------------- | -------------- | ------------------- | ---------- | --------- |
| Phones               | the table's (= the HUD's)    | table top + 16 | 18 / 16 / 20        | 2 lines    | 2 lines   |
| 600px and up         | `min(100%, 960px)` (= HUD's) | table top + 20 | 20 / 28 / 22        | 1 line     | 2 lines   |
| Landscape (≤500 tall) | the table left of the action column, left edge on the HUD's, 8px clear of the column | table top + 14 | 16 / 16 / 18 | 1 line | 2 lines |

- Hairline: 1px, `linear-gradient(90deg, transparent, rgba(0,255,255,.35), transparent)`,
  10px above and below (12px over 600px, 8px in landscape), 80% of the inner width.
- Card tab: 22px tall, 10px side padding, centred on the panel's top border (11px above it,
  11px inside), opaque #08080f fill, 1px cyan border at 60%, 4px clipped corners like the
  frame. With no card there is no tab and nothing else changes.
- Notice tab: min 22px tall, 3px 10px padding, centred on the panel's bottom border, max width
  the panel less 32px, the same fill and border. When it wraps it grows downward, away from
  the panel, so the panel and everything above it never move.
- The panel is a fixed height per viewport class (both slots reserved). The only growth is a
  result longer than two lines (a two-dice, four-Ace winning roll at 360px), which extends
  the panel's bottom edge; nothing above it moves.

**Motion.** The panel fades in and out (120ms) when the table's text comes and goes (card,
journal). Between steps the frame stays; the title and body crossfade inside it (120ms out,
then 120ms in) as now; the tabs fade (120ms). Reduced motion: instant.

**Where it sits.** Pinned to the top of the table, under the HUD, so the HUD and the readout
are one instrument cluster at the top, the open table below is the dice tray, and the RULE
caption, the hint and the step button are the action cluster at the bottom (with the toolbar
under it on phones). The reduced-motion roll keeps its band below the readout (from 44% on
portrait screens; in landscape, from under the readout).

## OWN-5: no clipped text in the board's centre

- The card line was a single `nowrap` line with `overflow: hidden`, centred: when the text was
  wider than the column, Chromium overflowed it on both sides, so the first glyph was cut
  (the suit pips are SVGs, so `text-overflow: ellipsis` never applied).
- After OWN-4 there is no single-line, clipped text in the board's centre: the card tab is two
  glyphs; the title is capped to fit the panel (`cqi`) and wraps only between words; the body
  and the notice wrap between clauses, never inside one, and never clip (`overflow: visible`).
- Checked at every core viewport and at 360px with a 125% browser text size (20px root): every
  text box inside the panel's inner box, nothing past the panel's edges.

## As built (measured at d15379e)

| Viewport            | Readout (x, y, w, h)  | Title slot | Body slot | Same in every state                            |
| ------------------- | --------------------- | ---------- | --------- | ---------------------------------------------- |
| android-small       | 8, 96, 344, 159       | 52px       | 48px      | yes, except the 3-line four-Ace winning result (+24px at the bottom edge) |
| iphone-13           | 8, 96, 374, 165       | 58px       | 48px      | yes (every state captured)                     |
| iphone-13-landscape | 8, 138, 550, 129      | 30px       | 48px      | yes                                            |
| desktop             | 240, 160, 960, 173    | 46px       | 60px      | yes                                            |

- The readout's left and right edges are the HUD's at every portrait size and on desktop; in
  landscape its left edge is the HUD's and it stops 8px short of the action column.
- At 360px with a 20px root (125% text): no text outside the panel's inner box, no horizontal
  scroll; the opening roll's two-sentence stakes take three lines there (the panel's bottom edge
  extends 30px for that one state).
- Phones: step button to toolbar 24px; toolbar 48px tall, ends 8px above the bottom (plus
  `--safe-bottom`); the ⋯ menu opens upward, 6px above the button, right edges aligned.
