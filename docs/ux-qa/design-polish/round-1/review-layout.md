# Layout and responsive design review, round 1

Reviewer: layout and responsive design specialist. Code under test: `claude/vibrant-curie-w9bn88` @ 563b9b1
(captures) and f9adc3d (source read). Skills applied: viewports, spacing, surfaces, keyboard.

Inputs: `manifest-board.md`, `drift-board.md` (all six core tables), `metrics-board.json` (summary,
issues, per-state landmarks), `metrics-surfaces-summary.json` and `metrics-surfaces.json`, the board
and surface shots at every core viewport, and my own measurements on a dev server (port 5196,
stopped). My scripts, crops and numbers are in
`/tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/review-layout/`
(`measure.json`, `drift.json`, `hud-led-compare.png`, `victory-crop.png`, `cardl-top.png`, `kb*.cjs`,
`loadjump.cjs`, `textw.cjs`).

Verdict: **not approved**. 16 findings: 4 high, 6 medium, 6 low.

## What passes (measured, not re-raised)

- No page-level horizontal overflow: 0 of 932 board captures and 0 of 522 surface captures.
- Horizontal centres never move: Δcx 0 for title, caption, result line, step button and label in every
  board state.
- Keyboard on the board (1440x900): Skip to action, Exit, Help, Settings, Dice, Auto, Voice, then the
  step button, which is the visual order. Every stop shows a ring (3px cyan outline plus a 6px halo on
  header buttons; a white 3px frame and glow on the step button). Settings traps Tab (six stops, then
  back to Close), and Escape returns focus to the Settings button. Space and Enter press the step
  button through the whole round. A card takes focus when it is dealt.
- Modals have a single scroller (the ContentModal body). There is no double scroll.
- Line length: intro paragraphs run 67 to 74 characters per line from 768px up, card stories about 55
  to 60, and result and description lines are capped at 600px.
- Header controls are 44x44 or larger at every width (60x44 or 64x44 from 721px up).

## Findings

### LR-1-01 · high · The board's title, result line and rule caption move with the game state

- **Surface:** board (ContextBackground column): every round step.
- **Viewports:** all six core viewports.
- **States:** every board state; worst pairs below.
- **Issue:** the column is anchored at its **bottom**, on the 40% line (`margin-top: auto`), and every
  line in it is variable: the caption (0, 57 or 77px), the card eyebrow (0 or 28px), the title (1 to 3
  lines), the description or result (1 to 3 lines) and the notice (0 or 32px). Any change below the
  title pushes the title up or down. When the column is taller than the space above the line (a
  caption on a short table), it switches to top-anchored, and everything jumps again.
- **Evidence (drift tables, Δtop of the screen title, px):**
  - Within one step, before and after the roll. The player is looking straight at this.
    - `salvation-n1-step` to `salvation-n1-nat20`: −50 (android-small), −25 (iphone-13), −29
      (landscape), −32 (ipad-portrait), −35 (laptop), −35 (desktop).
    - `instability-roll` to `instability-result`: +43, +44, +15, +17, +21, +21.
    - `round-start-lucid` to `task-result-nat20`: −27, −49, −29, −32, −35, −35.
    - `stability-check` to `stability-nat1`: −33 (ipad), −22 (laptop), −34 (desktop).
    - `stability-check` to `stability-11-19`: +20 (phones).
    - `notice-return-king` to `notice-return-king-result`: +18 to +21.
  - A rule caption appearing: `stability-check` to `caption-odd` moves the title +21 (android-small),
    +69 (landscape) and +47 (laptop). `salvation-n2-step` to `caption-king`: +40 (landscape).
  - Max Δtop of the title per viewport: 97, 103, 98, 137, 87 and 154. The result line moves up to
    48px between result states (android-small) and 101px (landscape).
  - Drift sheets: `sheets/board/drift-android-small.png`, `drift-iphone-13.png`,
    `drift-iphone-13-landscape.png`, `drift-desktop.png`.
  - Source: `src/lib/components/game/ContextBackground.svelte:62-96` (bottom: 60%, margin-top: auto)
    and `src/lib/components/RuleCaption.svelte` (rendered inside the column,
    `GameScreen.svelte:836-838`).
- **Recommendation:** give every line a fixed slot, so a state change only swaps text.
  1. **Take the caption out of the column.** Dock it above the step button: render `<RuleCaption>`
     in `.step-slot` (GameScreen.svelte:866-884) at `position: absolute; left: 0; right: 0;
     bottom: calc(100% + 12px)`, max-width 420px, centred. The slot never grows. In landscape the
     slot is the right-hand action column, so the caption sits above the button in that column
     (about 170px are free there at 844x390). The caption still never covers the title or result
     (NV-02 holds), it sits next to the action it explains, and its arrival moves nothing. Move the
     reduced-motion `.static-roll` bottom (`+layout.svelte:170`, now 6rem) up to clear the caption.
  2. **Reserve the eyebrow line on every board state.** Keep the `<p class="context-eyebrow">` with
     `visibility: hidden` and a non-breaking space when there is no card. The ROUND, SALVATION and
     STABILITY CHECK titles then share one baseline.
  3. **Give the lines under the title one fixed slot.** A `.context-below` wrapper holds the
     description or result, then the notice, with `min-height: 4.5rem` (72px: three description lines
     or two result lines plus the notice) and `align-content: start`. Description and result then
     swap inside a fixed box. Copy constraint for the copy team: a result line is at most 2 lines at
     360px (316px wide, 16px). Today four results take 3 lines: `task-result-nat20`,
     `salvation-n4-nat20`, `salvation-n4-nat1` and `salvation-hard-nat1`.
  4. **Portrait:** keep the column bottom on the 40% line (so RF-02, the dice off the result line,
     still holds). With slots 2 and 3 fixed, the title's last line sits at a constant y, and a
     two-line title grows upwards only. **Landscape (max-height 500px):** the table is 254px tall,
     too short for a bottom anchor. Anchor the column at the top of the table instead
     (`.context-column { margin-top: 0 }`), so the title's first line sits at a constant y (eyebrow
     slot 28px, then the title at about 160px, where it is today) and a long title grows downwards.
- **Acceptance:** rerun the board capture and the drift tables at all six core viewports.
  - Screen title: the bottom of the last line (portrait) or the top of the first line (landscape)
    varies ≤2px across all board states.
  - Each screen against its result state: title, eyebrow and result-line tops Δ ≤ 2px.
  - Each `caption-*` state against its tips-off twin: title, eyebrow, result line and step button
    Δ = 0.
  - No text box overlaps the HUD or the step button.
  - No column text below the 40% line in portrait, except the Easy three-line title case, which
    already runs past it.
- **Files:** `src/lib/components/game/ContextBackground.svelte`, `src/lib/components/RuleCaption.svelte`,
  `src/lib/components/GameScreen.svelte`, `src/routes/+layout.svelte` (static roll).

### LR-1-02 · high · On load the game screen is laid out one viewport below the screen, so the reduced-motion roll is off screen and the intro never fades in

- **Surface:** game load, the intro, the reduced-motion static roll.
- **Viewports:** all.
- **States:** `intro`, `rm-static-roll` (iphone-13 and desktop: the d20 never shows), and every
  reduced-motion roll until the window is resized.
- **Issue:** the root cause is in `GameScreen.svelte`. The loadGame block has `transition:fade`
  (`GameScreen.svelte:789-796`), so it stays in normal flow for its 200ms fade-out, and the
  `.game-screen` mounts **below** it.
  - I sampled every frame from navigation at iphone-13 (`review-layout/loadjump.cjs`):
    - from 853ms to 1077ms, `.game-screen` top is 844 (exactly one viewport down) and the HUD top
      is 908;
    - the intro's fade-in (opacity 0 to 1) plays during that time, off screen;
    - at 1077ms the load screen unmounts and the game screen snaps to top 0, already at opacity 1.
  - So the player sees the load screen fade to an empty frame, and then the intro pops in with no
    fade.
  - StatusHUD publishes `--hud-bottom` once, in that window (`StatusHUD.svelte:30-48`). Its
    ResizeObserver only fires on a size change, never on a move, so the stale value stays.
  - Measured `--hud-bottom` against the real HUD bottom + 8:
    | viewport | `--hud-bottom` | real HUD bottom + 8 | offset = viewport height |
    |---|---|---|---|
    | 360x640 | 776 | 136 | 640 |
    | 390x844 | 980 | 136 | 844 |
    | 844x390 | 516 | 126 | 390 |
    | 768x1024 | 1164 | 140 | 1024 |
    | 1280x720 | 860 | 140 | 720 |
    | 1440x900 | 1040 | 140 | 900 |
  - `.static-roll` (`+layout.svelte:166-172`) is placed from that value, so its top lands below
    the viewport.
- **Evidence:** `review-layout/loadjump.cjs` output (above);
  `review-layout/measure.json` (`hudBottomVar`); shots `rm-static-roll` against
  `rm-static-roll-after-resize` (iphone-13, desktop).
- **Recommendation:**
  1. Stop the outgoing screen taking space. Wrap the screen blocks in one grid cell (a
     `.screen-stack { display: grid }` with each block at `grid-area: 1 / 1`), or give the loadGame
     and gameOver blocks `position: absolute; inset: 0`. The game screen then mounts at top 0, and
     the intro's fade-in is seen.
  2. Make `--hud-bottom` follow position, not just size. Publish again in a `requestAnimationFrame`
     after mount, and on every `gameState.state` change. Better still, drop the JS variable and lay
     `.static-roll` out inside the board in CSS (absolute in `.main-screen-area`, top 44%).
- **Acceptance:**
  - Per-frame sampling from navigation shows `.game-screen` top = 0 throughout, and the intro's
    opacity ramps 0 to 1 while on screen.
  - Without any resize, `--hud-bottom` = HUD bottom + 8 (±1px) at all six core viewports.
  - `rm-static-roll` shows the d20 outline between the result line and the button at iphone-13 and
    desktop.
- **Files:** `src/lib/components/GameScreen.svelte`, `src/lib/components/status/StatusHUD.svelte`,
  `src/routes/+layout.svelte`.

### LR-1-03 · high · OWN-1 is not met, and a straight swap to LED digits jitters, gaps and misaligns

- **Surface:** HUD row.
- **Viewports:** all, critical at 360.
- **States:** every board state; `hud-*`.
- **Issue:** Stability, Kings, Cards, Aces, Tokens and every /max are Share Tech Mono (metrics:
  "HUD value" 20px and "HUD value max" 12px at 360). Only Roll is DSEG7, and it is set larger than
  the others:
  | width | Roll | other values |
  |---|---|---|
  | ≤600 | 22px | 20px |
  | ≥601 | 26px | 24px |
  | landscape | 20px | 18px |

  So the lit digits do not share a box. At 360 the Roll digits run from 83.5 to 105.5, the others
  from 84.5 to 104.5.

  I tried the swap on the dev server (all values and maxes in `--font-led`, worst case 20/20, 4/4,
  20, 52, 4/4, 12/10; `review-layout/shots/hud-led-*.png`, `hud-led-compare.png`):
  - It fits: no cell overflows at 360, 390, 844x390, 768 or 1280 (scrollWidth = clientWidth).
  - **Fit is tight.** At 360, Stability and Tokens hold a 58.7px value in a 61.2px content box,
    about 1px clear of each hairline.
  - **No slash in the font.** DSEG7 Classic has no "/" glyph. In `DSEG7Classic-Bold.ttf` "/" has the
    same .notdef advance as "€" and "?", so the browser falls back to Share Tech Mono for it.
  - **Gap after a "1".** DSEG7 lights only the right-hand segments of a "1", so "12/10" reads as
    "12/ 10".
  - **Values jitter as they change**, already today:
    - "/20" moves 5.4px left when Stability goes from 20 to 4 (x 43.7 to 38.3, `hud-stability-20`
      against `hud-stability-4`).
    - Cards moves 5.4px from 52 to 5.
    - Tokens "/10" moves 5.4px.
    - In LED digits (16.3px each at 20px) every one of these would be 8.2px.
- **Recommendation:**
  1. One LED size for all six values per breakpoint: 20px at ≤600 (Roll down from 22px), 18px in
     landscape (Roll down from 20px), 24px at ≥601 (Roll down from 26px). The /max is 0.6em
     (12, 11 and 14px). The value and max sit in one line box (`line-height: 1`, `align-items:
     baseline`). DSEG7 has descent 0, so the digit bottoms then share the baseline.
  2. Fixed digit cells, as RollCell already does. Every number renders over unlit "8"s
     (`.led-off`, opacity 0.1), with the lit digits right-aligned on them:
     | tile | value cells | max cells |
     |---|---|---|
     | Stability | 88 | /88 |
     | Kings | 8 | /8 |
     | Roll | 88 | – |
     | Cards | 88 | – |
     | Aces | 8 | /8 |
     | Tokens | 88 | /88 |

     Value and max then never move as numbers change, and the gap after a "1" reads as unlit
     segments.
  3. The separator is a non-LED span, `aria-hidden` (the sr-only text already says "20 of 20"):
     the mono "/" at the max size, or a 1.5px x 0.7em rule skewed −15°, with 2px each side.
  4. HUD labels go from 11px to 12px at ≤600 (`StatusHUD.svelte:240-243`; the viewports rule: no
     type under 12px). Measured at 360 with 12px labels (0.03em) and 20px LED values, the six cell
     minimums plus padding come to about 308px of the 344px row. It fits.
- **Acceptance:** at 360, 375, 390, 844x390, 768 and 1280:
  - every value and max digit computes to DSEG7 Classic;
  - the six lit-digit boxes share top and bottom (±0.5px);
  - no cell has scrollWidth > clientWidth, and each value box is ≥3px from its cell edge;
  - no label is clipped, and labels are ≥12px;
  - value and max x positions are identical (Δ0) for 20/20, 4/20 and 1/20, for Cards 52, 20 and 5,
    and for Tokens 10, 1 and 12.
- **Files:** `src/lib/components/status/StabilityCell.svelte`, `KingsCell.svelte`, `RollCell.svelte`,
  `CardsCell.svelte`, `AcesCell.svelte`, `TokensCell.svelte`, `StatusHUD.svelte`.

### LR-1-04 · high · OWN-2 is not met, and the HUD's geometry would leave the corner tiles' tints short of the frame

- **Surface:** HUD row.
- **Viewports:** all.
- **States:** `hud-stability-*`, `hud-tokens-*`, `hud-cards-*`, `hud-aces-*`, `hud-roll-*`,
  `hud-all-worst`, `hud-all-best`.
- **Issue:** only Kings has a tier background (`KingsCell.svelte` `.urgent`). The others need one,
  and from a layout view two things matter.
  - **The tint will stop short of the frame on the outer tiles.** The row's inline padding sits on
    `.status-hud` (`0 0.5rem`, or `0 0.125rem` at ≤600; `StatusHUD.svelte:99`). The first and last
    cells start inside it:
    | viewport | HUD left edge | first cell left edge | gap |
    |---|---|---|---|
    | 1280x720 | 160 | 168 | 8px (6px after the 2px border) |
    | 360x640 | 8 | 10 | 2px |

    A Stability or Tokens tint would leave an untinted strip against the frame. Kings, in the
    middle, never shows this.
  - **A tier change must not reflow.** If a tier changes weight, size, padding or a border, every
    cell moves, because columns are `minmax(min-content, …fr)`.
- **Recommendation:**
  - Move the row's inline padding into the first and last cells
    (`.hud-cell:first-child { padding-inline-start: … }`, `:last-child { padding-inline-end: … }`,
    `.status-hud { padding-inline: 0 }`). Every tint then runs frame to frame. `.status-hud`'s
    augmented-ui clip-path clips its children, so the Stability and Tokens tints follow the tl and br
    corner clips.
  - Keep the hairlines above the tints (`z-index: 1` on `::before`), so two tinted neighbours
    (Stability critical next to Kings urgent in `hud-all-worst`) stay separated.
  - Tiers change colour and background only. Ease them with the 300ms token (`--dur-overlay`;
    Kings' `.urgent` switches instantly today) and make them instant under reduced motion.
- **Acceptance:**
  - Across all `hud-*` tier states, every label, value and foot box is Δ0 (only colours change).
  - Each tint's rectangle equals its cell's rectangle, and the first and last tints touch the
    frame's inner border (no strip in a 2x crop of `hud-all-worst` or `hud-all-best`).
- **Files:** `src/lib/components/status/StatusHUD.svelte` and the six cell components.

### LR-1-05 · medium · The step button changes height (44 to 89px) and its label wraps, so the action's top edge and label jump

- **Surface:** step button (StepAction).
- **Viewports:** all; worst on phones and landscape.
- **States:** `salvation-*-step`, `salvation-step-lucid`, `round-start-lucid`, `round-start-surreal`,
  `stability-check-lucid`, `stability-check-surreal`, `easy-final-check`, `caption-easy-fourth-ace`,
  `notice-skip-damage`, `instability-roll` (landscape), `hud-roll-*-pending`.
- **Issue:** the button's bottom stays put and it grows upwards.
  - Step button height at android-small:
    | label | height | top moves |
    |---|---|---|
    | one line | 44px | – |
    | wrapped "ROLL TO REMOVE A TOKEN · NEED 14+" | 62px | −18 |
    | Lucid or Surreal hint | 61px | −17 |
    | both | 80px | −36 |
    | "ROLL FOR STABILITY · SURVIVE THIS AND YOU ESCAPE" | 82px | −38 |
  - Max height change per viewport: 38, 36, 43, 19, 22 and 22px. In landscape the column button
    reaches 89px (3 lines).
  - Measured label widths (Inter 600, uppercase, 0.08em, 16px):
    | label | width | room |
    |---|---|---|
    | "Roll to remove a token · need 14+" | 345px | 264px at 360 |
    | "Roll for Stability · survive this and you escape" | 494px | 264px at 360 |
    | "Roll for instability" | 205px | 190px in the landscape column (238 − 2×24), so it wraps |
    | "Roll for Salvation" | 194px | 190px in the landscape column, so it would wrap too |
- **Evidence:** drift tables (step button and step label columns); `review-layout/textw.cjs`;
  `review-layout/land.png`.
- **Recommendation:**
  1. Fix the step button at **64px** high at every viewport. Reserve the label row and a 13px
     sub-line row; with no sub-line, the label centres in the 64px. In
     `StepAction.svelte`: `.step-action :global(.aug-button) { height: 64px }`.
  2. The main label is always one line. The clause after " · " moves into the sub-line, with the
     Lucid/Surreal hint (for example "ROLL FOR SALVATION" over "Need 14+ · Lucid: 2 dice, keep
     high", 228px at 13px). The words are the copy team's; the constraint is ≤264px at 16px on 360.
  3. In the landscape action column, give the step button `padding-inline: 1rem` and
     `font-size: 0.9375rem`. That leaves 206px of text width; "Roll for instability" is about 192px.
     Keep the sub-line ≤206px at 13px (or 12px).
- **Acceptance:** in the drift tables, the step button's Δtop and Δh are 0, and the step label's
  Δtop is ≤2px, in every board state at all six core viewports. Every step label textBox is one line
  high.
- **Files:** `src/lib/components/game/StepAction.svelte`, `src/lib/components/GameScreen.svelte`
  (step label text), `src/lib/components/AugmentedButton.svelte`.

### LR-1-06 · medium · Touch targets under 44px on tablets, landscape phones and story mode

- **Surface:** every AugmentedButton at 451 to 768px wide; story mode.
- **Viewports:** ipad-portrait (and any 451-768px touch device); iphone-13-landscape; phones (story
  chips).
- **States:**
  - board (87 captures);
  - intro;
  - journal-*, final-log-*;
  - gameover-*;
  - story-*.
- **Issue:**
  - The phone 44px floor (`styles.css:643-649`) applies only at ≤450px. At ≤768px AugmentedButton
    drops to 16px text with 0.75rem padding, which is 43.2px tall (`AugmentedButton.svelte:306-309`).
    On iPad portrait that covers:
    - the step button and Begin Your Journey (480x43.2);
    - Record Entry (187x43);
    - Record final log (222x43);
    - Read your story (218x43);
    - Record your final log (278x43).
  - Story progress markers are 36x36 (`StoryProgressBar.svelte:78-82`) on iPad portrait and in
    landscape.
  - Story card chips are 52-56x40 on phones.
- **Evidence:** `metrics-board.json` issues (smallTargets: 87 at ipad-portrait); the
  `metrics-surfaces-summary.json` smallTargets rows for `journal-*`, `final-log*`, `gameover-*` and
  `story-*`.
- **Recommendation:**
  - `.aug-button { min-height: 48px }` at every width. That is Material's 48dp and above HIG's 44pt;
    the step button gets 64px from LR-1-05.
  - `.progress-marker { min-width: 44px; height: 44px }`.
  - Story `.chip { min-height: 44px }`.
- **Acceptance:** the smallTargets lists are empty (inline text links excepted) for every touch
  viewport: android-small, iphone-se, iphone-13, pixel-7, iphone-13-landscape, ipad-portrait and
  ipad-landscape.
- **Files:** `src/lib/components/AugmentedButton.svelte`, `src/lib/components/story/StoryProgressBar.svelte`,
  the story round chips (`src/lib/components/StoryRound.svelte`).

### LR-1-07 · medium · "VICTORY" runs past both edges at 360px

- **Surface:** game over.
- **Viewports:** android-small (360); 375 is 1.4px clear.
- **States:** `gameover-win-tokens`, `gameover-win-easy-ace`, `game-over-win`.
- **Issue:** the title's floor is 40px (`clamp(2.5rem, 9vw, 4rem)`, `GameOver.svelte:208`). "Victory"
  in lixdu at 40px with 0.05em tracking measures 367.6px, but the content box at 360 is 328px. The h1
  box spans x −3.8 to 363.8, and the "Y" touches the screen edge.
- **Evidence:** `metrics-surfaces` outside (`h1.game-over-title`, x −3.8, w 367.6);
  `review-layout/victory-crop.png`.
- **Recommendation:** `font-size: clamp(2rem, 9vw, 4rem)`, which gives 32.4px at 360 (297.7px wide,
  15px clear each side) and 33.75px at 375. Add `max-inline-size: 100%`. GAME OVER keeps its two
  lines.
- **Acceptance:** the game-over title box lies within [16, vw − 16] at 360 and 375, and the
  `outside` issue is gone.
- **Files:** `src/lib/components/GameOver.svelte`.

### LR-1-08 · medium · On laptop and desktop, STABILITY CHECK takes two lines and FINAL STABILITY CHECK three, because the column is 79px too narrow

- **Surface:** board title.
- **Viewports:** laptop, desktop (and fhd).
- **States:**
  - `stability-check*`;
  - `stability-*` results;
  - `notice-return-king*`;
  - `easy-final-*`, `caption-easy-fourth-ace`.
- **Issue:** the title is 56px. "STABILITY CHECK" measures 1038.6px but the column is
  `min(92%, 60rem)` = 960px, so at 1280 and 1440 it breaks into two lines (title box 120px). FINAL
  STABILITY CHECK breaks into three (185px), a one-word-per-line stack on a 1440px screen.
- **Evidence:**
  - drift tables, laptop and desktop: title h 56 / 120 / 185;
  - `review-layout/textw.cjs`;
  - `ContextBackground.svelte:68-75`.
- **Recommendation:** `.context-text-background { width: min(92%, 66rem) }` (1056px). At 1280 and up
  STABILITY CHECK fits one line, and FINAL STABILITY CHECK takes two (1402px).
- **Acceptance:** at laptop and desktop, the `stability-check` title is one line (≈56px) and
  `easy-final-check` is two, with no clipping and no overlap with the HUD.
- **Files:** `src/lib/components/game/ContextBackground.svelte`.

### LR-1-09 · medium · Story mode in landscape: the first view shows no round content

- **Surface:** story mode.
- **Viewports:** iphone-13-landscape (844x390); also 750x342.
- **States:** `story-round-1`, `story-round-2`, `story-last-round`, `story-end`, `story-final-log`.
- **Issue:** the first 390px hold only chrome:
  - the 48px back button;
  - "FUTURE LOST" at 38px on **two** lines (it is 532px wide at 38px; the title cell is about
    500px);
  - the meta line and the AI button;
  - the progress track;
  - a row of 36px round markers;
  - "ROUND 1 of 10";
  - the sticky Previous/Next bar (about 64px), which repeats "Round 1 of 10".

  There are zero lines of journal or card text.
- **Evidence:** `shots/surfaces/story-round-1/iphone-13-landscape.png`;
  `review-layout/storyl.png`.
- **Recommendation:** in `@media (max-height: 500px)`:
  - `.story-header` padding-top 12px;
  - the title at 1.75rem on one line (`white-space: nowrap; overflow: hidden; text-overflow:
    ellipsis`, with the full name in a `title` attribute), in row 1 beside the back button and the
    AI button;
  - hide `.progress-markers`, as at ≤640px (the track and the nav are enough);
  - nav bar padding 8px (its buttons stay at 44px).
- **Acceptance:** at 844x390 and 750x342, the round's card chips and the first two journal lines are
  above the nav bar in the first view.
- **Files:** `src/lib/components/StoryMode.svelte`, `src/lib/components/story/StoryProgressBar.svelte`,
  `src/lib/components/story/StoryNavigation.svelte`.

### LR-1-10 · medium · The journal in landscape leaves two lines to write in; the final log in the same space gets nine

- **Surface:** journal entry.
- **Viewports:** iphone-13-landscape (and 750x342).
- **States:** `journal-entry`, `journal-entry-long-text`, `journal-voice-*`, `journal-auto-timer`.
- **Issue:**
  - At 844x390 the textarea is 744x80, two visible lines once its padding is taken off. The round's
    card list takes the rest.
  - The final log in the same overlay uses two columns at this size, with a 432x210 entry.
  - The playtest fix aimed to keep four lines of writing on short windows.
- **Evidence:** `metrics-surfaces.json` `journal-entry` / iphone-13-landscape (textarea
  50,227 744x80) against `final-log` (362,94 432x210); `review-layout/go-land.png`.
- **Recommendation:** at `(max-height: 500px) and (orientation: landscape)`, give the journal the
  final log's two-column layout:
  - the card list on the left, about 40% wide, scrolling inside itself;
  - the entry on the right, filling the body's height (≥200px);
  - Voice note and Record Entry stay in the footer.
- **Acceptance:** at 844x390 and 750x342 the textarea shows ≥4 lines (≥140px), and Record Entry is
  visible without scrolling.
- **Files:** `src/lib/components/JournalEntry.svelte`.

### LR-1-11 · low · Dialogs in landscape spend 46% of their height on the header and footer

- **Surface:** ContentModal family: Settings, Help, Dice theme, AI summary.
- **Viewports:** iphone-13-landscape.
- **States:** `settings-game`, `settings-home*`, `help-*`, `dice-theme-*`, `story-ai-*`.
- **Issue:** at 844x390 the dialog is 343px tall (88dvh) and its scroll body is 185px. The header
  takes 75px (28px display title plus 16px padding) and the footer 80px (48px Done plus 2×16px).
- **Evidence:** measured with `review-layout/scrollers.cjs`
  (`content-body-wrapper` 720x185 inside 720x343); `shots/surfaces/settings-game/iphone-13-landscape.png`.
- **Recommendation:** in `ContentModal.svelte` `@media (max-height: 500px)`:
  - `max-height: calc(100dvh − 16px)`;
  - header padding `8px 24px`;
  - footer padding `8px 24px`.

  The body becomes about 250px (+35%). The display title stays at 28px (MN-07).
- **Acceptance:** at 844x390 the body scroller is ≥60% of the dialog's height, and the header and
  footer stay pinned.
- **Files:** `src/lib/components/ContentModal.svelte`.

### LR-1-12 · low · On desktop the Space key cap pushes the step label 32px off the centre line

- **Surface:** step button (pointer-fine viewports).
- **Viewports:** laptop, desktop, fhd.
- **States:** every board state.
- **Issue:** the key cap sits inline after the label and the pair is centred, so the label's centre is
  607.75 (laptop) and 687.75 (desktop). The button, title and result line are centred at 640 and 720.
  Every action label sits left of the column's axis.
- **Evidence:** `metrics-board.json` stability-check landmarks: stepButton centre against stepLabel
  centre; keyHint box 717,656 51x18.5 (laptop).
- **Recommendation:** in AugmentedButton, take `.key-hint` out of the flow: `position: absolute;
  right: 20px; top: 50%; transform: translateY(-50%)`. Add equal inline padding on both sides (the
  hint's width plus 12px), so the label centres on the axis.
- **Acceptance:** at laptop and desktop the step label's centre equals the button's centre (±1px).
- **Files:** `src/lib/components/AugmentedButton.svelte`.

### LR-1-13 · low · The board ignores the bottom safe area

- **Surface:** board.
- **Viewports:** iPhone portrait and landscape (viewport-fit=cover, home-indicator devices).
- **States:** every board state.
- **Issue:**
  - `app.html` sets `viewport-fit=cover`, but `.ui-content-layer` pads only the left and right
    insets, and only in landscape (`GameScreen.svelte:1246-1250`).
  - **Portrait iPhone 13:** the step button ends at y 812 of 844. That is 32px from the edge,
    inside the 34px home-indicator zone.
  - **Landscape:** the column text runs to y 385 of 390 (`caption-easy-fourth-ace`, description
    346-385), inside the 21px zone.
- **Evidence:** drift tables (step button box); `metrics-board.json` `caption-easy-fourth-ace`
  landmarks; `grep safe-area src`.
- **Recommendation:**
  - Define `--safe-bottom: env(safe-area-inset-bottom, 0px)`.
  - `.ui-content-layer { padding-bottom: max(0.5rem, var(--safe-bottom)) }`, in portrait and in
    landscape.
  - Use the custom property everywhere, so a capture can override it (34px or 21px) and prove it.
- **Acceptance:** with `--safe-bottom: 34px` forced at 390x844, the step button's bottom is ≤810.
  With 21px at 844x390, the button and all column text end ≤369.
- **Files:** `src/lib/components/GameScreen.svelte`, `src/app.html`, `src/styles.css`.

### LR-1-14 · low · The header truncates the game's name while a constant "PLAYER GUEST" takes the room

- **Surface:** in-game header.
- **Viewports:** android-small, iphone-13, ipad-portrait.
- **States:** any state of "Locked In the Tech District" (`card-*-long`, `card-fourth-ace-easy`,
  `card-narrative-return-king`).
- **Issue:**
  - The title `h5.game-title` needs 201px and gets 136 (360), 166 (390) and 168 (768), so it ends in
    an ellipsis.
  - From 721px up the header also shows "PLAYER / GUEST" (51px plus gaps). Sign-in is off, so it
    is always "Guest".
  - The header's small labels (PLAYER, ROUND, EXIT, HELP…) are 10px.
- **Evidence:** `metrics-surfaces` clipped rows (scrollWidth 201 / clientWidth 136, 166, 168);
  the header element boxes at ipad-portrait.
- **Recommendation:**
  - Hide the Player block while `REQUIRE_SIGN_IN` is false.
  - On phones, let the title wrap to two lines at 14px (`-webkit-line-clamp: 2`) instead of an
    ellipsis.
  - Raise the header's small labels to 11-12px where they fit.
- **Acceptance:** no clipped header title for the longest bundled title at 360, 390 and 768.
- **Files:** `src/lib/components/status/PlayerInfoBar.svelte`.

### LR-1-15 · low · Home at 1280x720: the Play buttons sit on the fold

- **Surface:** home.
- **Viewports:** laptop (1280x720).
- **States:** `home`, `home-first-visit`.
- **Issue:** the 16:9 key art (251px on a 446px card) pushes both PLAY buttons to y 672.7-720.7,
  0.7px past the fold, with nothing to show there is more below.
- **Evidence:** `metrics-board.json` issues (`outside`: PLAY, laptop); `shots/board/home/laptop.png`;
  `metrics-surfaces` home-first-visit laptop (PLAY 673-721).
- **Recommendation:** `HomeGameCard.svelte` `.key-art`, in
  `@media (min-width: 601px) and (max-height: 820px)`: `aspect-ratio: 21 / 9` (about 191px). PLAY then
  ends at about y 661.
- **Acceptance:** at 1280x720 both PLAY buttons are fully visible, with ≥24px clear below.
- **Files:** `src/lib/components/home/HomeGameCard.svelte`.

### LR-1-16 · low · The 3D dice fly over, and can land on, the step button

- **Surface:** board during a roll.
- **Viewports:** seen at laptop; possible at any viewport.
- **States:** `stability-rolling`.
- **Issue:**
  - The 3D throw area is the whole screen (`+layout.svelte:118-121`, `.dice-container { inset: 0 }`,
    z 1000 while rolling).
  - At 1280x720 the die covers the step button's "Rolling…" label mid-throw, and nothing keeps it
    from coming to rest there.
  - The reduced-motion roll already stops 6rem above the bottom.
- **Evidence:** `shots/board/stability-rolling/laptop.png` (die over "RO…ING").
- **Recommendation:** bound the dice world above the step slot (for example `.dice-container { bottom:
  var(--step-slot-h, 96px) }`, published from the slot). The die then never rests on the action and
  "Rolling…" stays readable. The physics bounds are the animation team's call; the collision is this
  finding.
- **Acceptance:** a 3D-dice-at-rest capture (requested below) shows no die over the step button at any
  core viewport.
- **Files:** `src/routes/+layout.svelte`, `src/lib/stores/diceStore.svelte.js`.

## Notes for the other lenses (not findings here)

- **Tablet (ipad-portrait).** The board is a phone column stretched to 768x1024. The roughly 460px
  band between the result line and the button is the dice landing zone, so I do not flag it. The
  tablet defects are the 43.2px buttons (LR-1-06) and the 14px description, which is the phone
  minimum of `clamp(0.875rem, 1.5vw, 1rem)` (typography).
- **The card at 85-90dvh** is an owner decision (playtest round), so its empty lower half on tablets
  is not raised.

## Capture requests

1. Board states at Safari's visible area, 390x664 and 750x342: round-start, stability-nat1,
   salvation-step-lucid, easy-final-check, caption-easy-fourth-ace, task-result-nat20.
2. Safe-area proof: after LR-1-13, the same states with `--safe-bottom` forced to 34px (portrait)
   and 21px (landscape), with the home-indicator zone outlined in the shot.
3. Load to intro, frame by frame (every 50ms from navigation to 1.5s) at iphone-13 and desktop:
   `.game-screen` top and the intro's opacity (to verify LR-1-02).
4. HUD worst and edge values after OWN-1 at 360, 375, 390, 844x390 and 768, as 2x HUD crops:
   - 20/20 · 4/4 · 20 · 52 · 4/4 · 12/10;
   - 1/20 · 0/4 · 1 · 5 · 1/4 · 1/10;
   - 10/20 · 3/4 · 11 · 10 · 0/4 · 10/10.
5. A drift run with rule tips on through a whole scripted round. Each caption appears and is
   dismissed in place, so the title, result line and button are compared with and without it.
6. Story mode at 844x390 and 750x342, scrolled to show the first round's text (story-round-1,
   story-final-log).
7. The 3D dice at rest (not skipped) for one Stability check at android-small, iphone-13, laptop and
   desktop.
8. Step buttons with the longest label plus a modifier hint, in the landscape column and at 360:
   salvation-n1-step with Lucid, salvation-n4-step with Surreal, easy-final-check with Lucid.
9. /game/ghost-in-the-machine: the board states with the longest card eyebrow (a wrapping
   "N♠ · …" line) at 360 and 844x390.
