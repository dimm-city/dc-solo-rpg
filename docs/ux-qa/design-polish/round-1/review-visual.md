# Visual and typography review, round 1

Reviewer: visual and typographic design. Code under review: `claude/vibrant-curie-w9bn88` @ 563b9b1 (captures) / f9adc3d (source read). Verdict: **not approved** (owner requirements OWN-1 and OWN-2 are not met yet, and there are 22 findings below).

Skills applied: vectorlab typography, spacing, colour-palette, anti-slop. Contrast is WCAG 2.2 (4.5:1 normal text, 3:1 large text and UI parts), computed from the capture metrics and, for proposed colours, with `review-visual/contrast.py` (sRGB relative luminance, tints composited over the HUD base `#0c0c16`).

Working files (all under `/tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/review-visual/`):

- `typescale.py`: type-scale digest of `metrics-board.json` per viewport.
- `contrast.py`: the contrast helper.
- `proto/led-proto.cjs`: an OWN-1 prototype. It injects CSS into the running dev server (no source edits), puts every HUD number in DSEG7 and measures fit, overflow and baselines at 360, 390, 844x390 and 1280. Results are in `proto/current.json` and `proto/proposal.json`. Renders are `proto/compare.png` (current vs proposal at 360, landscape and laptop) and `proto/*-start.png` / `*-wide.png`.
- `crops/`: crops of the shots cited below.

---

## Owner requirement OWN-1: LED numbers in every HUD tile

### What the tiles do now (measured)

| tile | face now | phone size (value / max) | landscape | ≥601px |
|---|---|---|---|---|
| Stability, Kings, Aces, Tokens | Share Tech Mono 400 | 20px / 12px | 18 / 12 | 24 / 14 |
| Cards | Share Tech Mono 400 | 20px | 18 | 24 |
| Roll | DSEG7 Classic Bold over a 10% "88" | 22px | 20 | 26 |

- Two faces and two digit heights. Share Tech Mono digits are about 0.7em tall, so 14px of ink on phones. DSEG7 digits fill the whole em (hhea ascent 1000, descent 0, digit bounds 0-1000), so 22px of ink. The Roll reads about 1.5x larger than its neighbours: `sheets/board/hud-tiers-iphone-13.png`, `review-visual/crops/tiers-i13-0.png`.
- The values are not on one baseline. The Roll baseline sits **5px** below the other five at 360 and 390 (105.5 vs 100.5), **4px** below in landscape (100 vs 96) and **6px** below at 1280 (110 vs 104). Source: `proto/current.json`, baseline probe.
- DSEG7 has **no "/" glyph** (its cmap: space, `!`, `-`, `.`, `0-9`, `:`, A-Z, a-z, `_`). A "/max" in `--font-led` silently falls back to Share Tech Mono, so the slash needs its own explicit span.

### Specification I will accept

The full text is in ownerSpecs OWN-1 of the structured output. In short:

1. **Face.** All 12 runs (6 values and 4 maxes, Cards and Roll having none) use DSEG7 Classic Bold (`var(--font-led)`, 700). The slash is its own `aria-hidden` span in `var(--font-mono)` at 1.25x the max size, in the max colour, on the shared baseline.
2. **Sizes.** One size pair per viewport class, the same in all six tiles. The Roll's own `--led-size` (1.625, 1.375 and 1.25rem) goes, and the Roll uses the value size.
   - Phones (≤600px wide): value **18px**, max **11px**. An 11px DSEG digit is 11px tall, taller than the 8.7px cap height of Inter at 12px, so the 12px floor's purpose is met.
   - Landscape (≤500px tall, ≥601px wide): value **16px**, max **10px**. The value row there is 20px, and 18px would leave 1px each side.
   - iPad, laptop and desktop: value **20px**, max **12px**.
   - Prototype at 18/11 on 360: the widest tiles (Stability "20/20", Tokens "12/10") measure 55.4px in content boxes of 61.2px and 60.2px. No cell overflows at 360, 390, 844 or 1280.
3. **Ghosts.** An unlit "8" per digit cell, behind the current value only: Stability 88, Kings 8, Roll 88, Cards 88, Aces 8, Tokens 88 (the digit count of max(start, current)). Same face and size, the value's tier colour at opacity 0.10, no shadow, right-aligned, so a 7 sits in the ones place. No ghosts behind the max.
4. **Baseline.** Value and max digits share one baseline. All six value baselines are within **±0.5px** of each other at every viewport. Gaps from the label ink to the value top, and from the value bottom to the foot, are ≥4px (≥2px in landscape).
5. **Colour.**
   - The value takes its tier colour (OWN-2), with one glow recipe: `0 0 6px` at 45% of the value colour.
   - Max: `rgba(255,255,255,0.6)`, no glow. It measures ≥6.1:1 on every OWN-2 tint.
   - Locked Tokens: value at 0.6 white, max at 0.5 white (≥5.0:1).
   - The Roll's idle "--" stays (lit at 0.6).
6. **Stability.** DSEG advances are uniform (0.816em), so a tile's width never changes as its value changes. The row heights (64px and 52px), the labels, the foot rows and the hairlines do not move.

## Owner requirement OWN-2: progressive tile styling (visual execution)

### Now

Only Kings has a background tier: `.urgent` at 3 of 4, `KingsCell.svelte:122-128`. Even that one **snaps**. It is a `linear-gradient` background with no transition, and gradients cannot be transitioned. The other tiles:

- **Stability** colours its label, value and bar by tier, but has no background.
- **Tokens** is always gold, with no tiers.
- **Cards** is always white, with no tiers.
- **Aces** has only off/on: cyan from 1 Ace.
- **Roll** never changes colour. Only its arrows light; a natural 20 and a natural 1 look the same as a 12: `sheets/board/hud-tiers-iphone-13.png`, rows roll-nat20, roll-nat1 and all-worst.

### Specification

The full ladder is in ownerSpecs OWN-2. The mechanism:

- **One tint layer per cell.** A `span.tint`, absolute, inset 0, under the content, with:
  - `background-color: var(--tint-color)`
  - `opacity: var(--tint-alpha)`
  - a static `mask-image: linear-gradient(180deg, #000, rgba(0,0,0,.25))`, which reproduces the Kings gradient (top alpha, a quarter at the bottom)
- **Transitions.** `background-color` and `opacity` ease over `var(--dur-overlay)` and `var(--ease-enter)`, the same as the bar fill in `StatusHUD.svelte:200-202`. The value's `color` and `text-shadow` and the label's `color` use the same timing. Under reduced motion, none.
- **Kings.** Its 3-of-4 look moves onto the same layer: `#ff4d6d` at 0.16, the reference.
- **Loudness ceiling.** No other tile goes above **0.14**.
- **Labels.** Neutral `rgba(255,255,255,0.72)` at the rest tier; the tier colour at every other tier.
- **Pulses.** Alert pulses animate the tint layer, never the value's opacity (see VT-1-06).

Every value colour in the ladder measures **≥5.1:1** on its own tint at full alpha. The worst case is `#ff4d6d` on the Kings-3 tint, at 5.1:1.

---

## Findings

Severity: **high** means wrong, broken, unreadable or misleading; **medium** means clearly unpolished or inconsistent; **low** means a nit.

### VT-1-01 · high · The Surreal hint on the step button fails contrast (2.06:1)

- **Where.** Board, step button. All core viewports. States: round-start-surreal and stability-check-surreal; also any roll step with Surreal pending, such as salvation with Surreal.
- **Evidence.** `metrics-board.json`: "Surreal: 2 dice, keep low" is 13px Inter 600, `rgb(217,70,239)` on `#8223bf`, **2.06:1** (min 2.04), 12 fails. The Lucid hint (`#00ffff`) measures 5.69:1. Shot: `sheets/board/stability-check-surreal.png`.
- **Cause.** `StepAction.svelte:139-141`: `.label-hint.surreal { color: var(--color-cyber-magenta) }` puts magenta on the magenta-violet button (`AugmentedButton.svelte`, `background: linear-gradient(135deg,#831d98,#6d22c7)`).
- **Fix.** Surreal hint colour `#ffd6ff` (5.55:1 on `#8223bf`; `#ffc2ff` gives 4.9:1). Keep Lucid `#00ffff` (5.69:1), or use `#b8fff8` (6.36:1) so both hints are pale tints of their HUD arrow colours.
- **Acceptance.** Both hints ≥4.5:1 (contrastMin) at every viewport in round-start-surreal, round-start-lucid, stability-check-surreal, stability-check-lucid and salvation-step-lucid.

### VT-1-02 · high · "VICTORY" runs off both edges at 360px

- **Where.** Game over (win). android-small. States: gameover-win-tokens, gameover-win-easy-ace.
- **Evidence.** `metrics-surfaces.json` (outside): `h1.game-over-title` box x **-3.8**, w **367.6** in a 360px viewport. The V and Y are cut: `review-visual/crops/victory-360.png`.
- **Cause.** `GameOver.svelte:204-219`: `font-size: clamp(2.5rem, 9vw, 4rem)` with `letter-spacing: 0.05em`. In lixdu "VICTORY" is about 9.2em wide, so the 40px floor is 368px.
- **Fix.** `font-size: clamp(2rem, 9vw, 4rem)`: 32.4px at 360, 294px wide, 33px clear each side. Check "GAME OVER", which wraps to two lines today; it may then fit on one.
- **Acceptance.** The title box lies inside [16, 344] at 360, and inside [16, vw−16] at 375, 390 and 412, for both titles.

### VT-1-03 · medium · Step button labels wrap badly, and the button changes height between steps

- **Where.** Board, step button. android-small, iphone-13, iphone-13-landscape, laptop, desktop. States: salvation-n1/n2/n3-step, salvation-n4-step, notice-skip-damage, easy-final-check, caption-easy-fourth-ace, salvation-step-lucid, and every roll step with a Lucid/Surreal hint.
- **Evidence** (`metrics-board.json`, step label lines):
  - "ROLL TO REMOVE A / TOKEN · NEED 14+" wraps to 2 lines at 360 and in landscape. The article "A" is left at the end of line 1 and the separator sits mid-line.
  - "ROLL FOR STABILITY / · SALVATION / IS ASSURED" takes **3 lines in landscape** (`sheets/board/notice-skip-damage.png`), and 2 lines even at 1280 and 1440, where the Space chip squeezes it.
  - "Roll for Stability · survive this and you escape" takes **3 lines** at 360 and in landscape (easy-final-check).
  - The drift table shows the button growing 44 → 62 → 80px (Δtop −18 / −36). `text-wrap: balance` on `.label-main` (`StepAction.svelte:126-128`) cannot find the separator, because the label is one string (`StepAction.svelte:48`, and the label text from GameScreen).
  - Landscape uses an 18px label in a 300px slot, larger than on phones (16px).
- **Fix.**
  1. Line 1 is the verb only, in caps: "ROLL TO REMOVE A TOKEN", "ROLL FOR STABILITY". Each fits one line at 360 (about 230px and 185px of 264px).
  2. The consequence moves to the hint line, in sentence case at 14px Inter 600: "Need 14+", "Salvation is assured", "Survive this and you escape". When Lucid or Surreal is pending, append it: "Need 14+ · Lucid: 2 dice, keep high".
  3. Reserve the hint line, so the button height is fixed at every step: min-height 60px on phones, 64px from 601px, with the label vertically centred.
  4. The landscape label is 16px.
- **Acceptance.**
  - Label line 1 is a single line at 360, 375, 390 and 844x390 in every board state.
  - The hint is ≤1 line at 360.
  - The step button's top and height are identical (±1px) across all board states per viewport in the drift table.

### VT-1-04 · medium · The result line wraps mid-clause, and the Lucid/Surreal explanation runs on

- **Where.** Board, result line. All core viewports. States: task-result-nat20, task-result-nat1, stability-nat1, stability-nat20, salvation-n*-nat20/nat1, salvation-hard-nat1 and salvation-e*-nat20/nat1.
- **Evidence.**
  - 360: "Natural 20 (low of 20, 20) · Draw / 6 cards · Lucid: your next roll / keeps the higher of two dice" (3 lines; "Draw" is split from "6 cards"). Sheets: `sheets/board/task-result-nat20.png`, `sheets/board/stability-nat1.png`.
  - 1280 and landscape: "… · Lucid: / your next roll keeps …": the colon clause breaks after its label.
  - The result line grows to 68px and its top moves −48px (drift table).
- **Cause.** One string in `ContextBackground.svelte:49`, styled by `.context-result` at `:155-168`.
- **Fix.**
  - Render the outcome as clauses split on " · ", each `white-space: nowrap`, so lines break only at a separator: "Natural 20 (low of 20, 20) · Draw 6 cards".
  - Move the modifier sentence to its own `<p class="context-result-note">` in 14px Inter 400, line-height 1.5, in the modifier colour (Lucid `#00ffaa`, Surreal `#f07cff`; both ≥8:1 on the table), with `text-wrap: balance`.
- **Acceptance.**
  - No line starts or ends inside a clause, in any nat-20 or nat-1 state at 360, 390 and 844.
  - The outcome line is ≤2 lines at 360.
  - The note is a separate element with ≥4.5:1 contrast.

### VT-1-05 · medium · The Space key-cap fails contrast and pushes the button label 32px off centre

- **Where.** Board, step button. laptop, desktop, fhd. All states that show the key-cap.
- **Evidence.**
  - Key hint "Space": 11px at opacity 0.75, **3.87–4.29:1** (185 fails).
  - Desktop "ROLL FOR TASKS": label centre x **687.8** vs button centre **720** (button 480 at x 480; chip at x 786.5, w 50.9). Same 32px offset on every state (`metrics-board.json`, round-start-surreal and salvation-n2-step on desktop).
  - The chip also forces 2-line labels at 1280 and 1440 (VT-1-03).
- **Cause.** `AugmentedButton.svelte:262-276`: `.key-hint` is a flex item (gap 0.75em) at `font-size: 0.6875rem` and `opacity: 0.75`.
- **Fix.**
  - Take the chip out of the flow: `position: absolute; right: 16px; top: 50%; transform: translateY(-50%)`. Give the button `padding-inline: 72px` on pointer-fine screens, so the label stays centred and never runs under the chip.
  - Chip text 12px, opacity 1. Yellow on the chip's darkened ground is ≥6.1:1.
- **Acceptance.** Label centre within ±1px of the button centre at 1280, 1440 and 1920. Chip contrast ≥4.5:1. "ROLL FOR STABILITY" on one line at 1280.

### VT-1-06 · medium · The critical-Stability pulse drops the value to 2.67:1

- **Where.** HUD, Stability tile. android-small, iphone-13, iphone-13-landscape, ipad-portrait, laptop, desktop. States: stability-fatal, salvation-n4-fatal, easy-final-fatal, and any Stability ≤4 (hud-stability-4, hud-stability-1, hud-all-worst).
- **Evidence.** `metrics-board.json`: HUD value "0" measures **2.67–4.26:1**, 7 fails. The value pulses its opacity to 0.55.
- **Cause.** `StabilityCell.svelte:84-87` and `:132-140`: `criticalPulse` animates `opacity` on `.current` and `.fill`.
- **Fix.**
  - Pulse the OWN-2 tint layer (opacity 0.14 ↔ 0.07, 1.6s, ease-in-out) and the bar. Keep the value's colour and opacity constant at `#ff4d6d` (5.2:1 on the critical tint).
  - Reduced motion: static tint, no pulse.
- **Acceptance.** The value meets ≥4.5:1 at every frame. Sample at 0, 0.4s, 0.8s and 1.2s in hud-stability-1.

### VT-1-07 · medium · Small secondary text below 4.5:1

- **Where.** HUD (Tokens locked), home header, final log. All core viewports.
- **Evidence.**
  - Locked Tokens max "/10" at `rgba(255,255,255,0.4)`: **3.78–3.81:1**, 234 fails. `TokensCell.svelte:112-114`.
  - Home "Dimm City" maker line, 11px `#9fb3c8` over the logo glow: **4.14–4.29:1**, in home-custom-game, home-first-visit-end and home-toast-save-deleted. `HomeHeader.svelte:243-247`.
  - Timeline separators "·" at 0.4 white: **3.77:1**, 207 fails, in final-log*.
- **Fix.**
  - Locked max: 0.5 white (5.0:1).
  - Maker line: 12px `#b4c4d6` (5.2:1 even on the glow's `#53470d`; 11.0:1 on the plain header).
  - Timeline separators: 0.5 white (5.3:1). (Separators are punctuation, but they are text runs and the audit counts them.)
- **Acceptance.** Zero contrast FAILs for these runs in the next metrics.

### VT-1-08 · medium · On phones the HUD's mirror axis is off centre and the labels crowd the frame

- **Where.** HUD. android-small, iphone-13, iphone-se, pixel-7. All game states.
- **Evidence.** `proto/current.json`:
  - The Roll | Cards hairline is at x **183.0** at 360 (centre 180) and **201.8** at 390 (centre 195). That is 3px and 7px right of the centred header title (centre 195 at 390).
  - The columns are deliberately asymmetric on phones: `1.3fr 1.15fr 1fr 0.9fr 1.15fr 1.15fr` (`StatusHUD.svelte:230-232`). Widths at 360: 65.2 / 57.7 / 50.1 | 45.1 / 57.7 / 64.2.
  - Label clearance to the cell edges is uneven: Roll 10.4px; Cards **2.6px** (it nearly touches both hairlines); Tokens **2.0px** to the frame edge (label right 348 vs HUD right 352); Stability's "S" sits in the frame's 8px clipped corner (`proto/compare.png`, row 1).
  - Desktop is symmetric: the hairline at 640 is the centre at 1280.
- **Fix.**
  - Mirrored tracks on phones, `minmax(min-content,1.2fr) minmax(min-content,1fr) minmax(min-content,1fr)` twice, mirrored. The sum of label widths at 11px is 255.6px of 340px, which leaves about 7px per side.
  - Optionally free the Tokens label's 13px "lock room" (`TokensCell.svelte:122-130`). Show the lock in the foot row, in place of the bar while locked, so Stability and Tokens can share a symmetric outer track.
- **Acceptance.**
  - The Roll | Cards hairline within ±1px of the viewport centre at 360, 375, 390 and 412.
  - Every label ≥4px from its cell edges and from the frame's inner edge.

### VT-1-09 · medium · Dialog titles change face and size by viewport, and section headings outweigh them

- **Where.** Modals: Game Settings, Game Guide, Dice, About, confirmations. All core viewports.
- **Evidence** (`metrics-surfaces.json`):
  - Content-modal titles are **lixdu 28px** from 641px, including landscape phones, where "GAME SETTINGS" takes about 64px of the 390px height and leaves room for two lines of content (`sheets/surfaces/settings-game.png`, `help-game.png`, `dice-theme-game.png`).
  - The same titles are **Inter 600 18px caps** at ≤640px.
  - Confirm titles are **Inter 600 17px caps** at every width.
  - Section headings (`h3` "Gameplay", "The goal", "How it plays") are **Inter 700 18px**: the same size as the phone dialog title, and heavier.
- **Cause.** `ContentModal.svelte:265-275` (lixdu 28px), `:277-284` (compact 17px), `:463-469` (phones 18px); `SettingsModal.svelte:256`, `GameGuide.svelte:335`, `AboutContent.svelte:83` (700).
- **Fix.**
  - One dialog title style at every width and in both modal families: Inter 600, 18px, uppercase, 0.08em, line-height 1.2, `text-shadow: none`.
  - Section headings: Inter 600, 16px, sentence case, cyan, line-height 1.25.
  - Field labels stay 16/600; helper text 14/400.
  - lixdu stays for screen titles, game titles and endings only.
- **Acceptance.**
  - Every `.content-header h2` computes to Inter 18/600 at all six core viewports.
  - Section headings are 16/600.
  - The landscape settings dialog shows the Difficulty select without scrolling.

### VT-1-10 · medium · Text below 12px in chrome and labels

- **Where.** In-game header, home header, endings, menus, HUD labels. All core viewports.
- **Evidence** (`metrics-surfaces.json`, under 12px):
  - **10px**: header button labels Exit, Help, Settings, Dice, Auto, Voice (`PlayerInfoBar.svelte:399-401`); header labels Player and Round (`:450-452`).
  - **11px**: the "Dimm City" maker line; ending stat labels such as "Rounds survived" (`RunRecap.svelte:51-54`); the "Custom" badge; the menu state "Off"; the key-cap "Space"; HUD labels on phones (`StatusHUD.svelte:240-243`).
  - The desktop header at 1440 is 52px tall with 10px labels under 20px icons: `review-visual/crops/header-desk.png`.
- **Fix.**
  - 12px minimum for every run, uppercase labels included: header labels and button labels 12px/600/0.06em; stat labels 12px; badge and menu state 12px.
  - HUD labels may stay 11px below 375px wide only. At 360 the sum of six labels at 12px is 279px of 340px, about 5px per side, which is too tight. Use 12px from 375px up.
- **Acceptance.** The metrics "under 12px" list is empty, except HUD labels at ≤374px.

### VT-1-11 · medium · The type scale has 1px steps (near-duplicate sizes)

- **Where.** App-wide. All core viewports.
- **Evidence.**
  - Board at 390 (`review-visual/typescale.py metrics-board.json iphone-13`): Inter in **10, 11, 12, 13, 14, 15, 16, 17, 18, 20**px (10 sizes).
  - Surfaces add 19, 22, 23.04, 24, 26 and fractional 18.432 (iPad result line).
  - Near-duplicate pairs on one screen:
    - Card story 17px next to card title 20px and the tap hint 14px.
    - The deal-progress / mechanic-note / step-hint roles at 13px next to the 14px eyebrow and caption.
    - Header title 15px next to the 16px step label.
    - Help/About body 17px and lead 19px against board body 16px and 18px.
- **Fix.** One scale: **12 / 14 / 16 / 18 / 20 / 24**, plus display sizes.
  - 10 and 11 → 12.
  - 13 → 12 for uppercase micro-labels (deal progress, mechanic note) and → 14 for the step hint.
  - 15 → 16 (header title, header value, confirm body); 15 → 14 for meta lines such as "3 rounds · Nov 7".
  - 17 → 16 (card story on phones, help body, confirm body); keep 18 on desktop.
  - 19 → 18 (lead).
  - 22 → 20 or 24 (card title 20, Game Over stats 24).
  - 26 → 24 (home pitch).
  - The fluid `clamp()` on the result line ends at a whole step: `clamp(1rem, 2.4vw, 1.25rem)` gives 18.432 at 768. Use 16 → 18 → 20 by breakpoint instead.
- **Acceptance.** ≤6 distinct Inter sizes per screen in the next metrics; no pair 1px apart on the same screen.

### VT-1-12 · low · Four Inter weights; 700 is used across seven components

- **Where.** Header values, Done and danger buttons, story stats and outcome, library card titles, section headings, home brand. All core viewports.
- **Evidence.** `metrics-surfaces.json`: Inter 400 (186 roles), **500** (8), 600 (226), **700** (44). Examples:
  - 700: "GUEST" and the round number in the header (`PlayerInfoBar.svelte:460-467`); "DONE" and danger buttons (`ContentModal.svelte:363,413,425,536`); story stats "20/20" and "0 of 4"; "Escaped"; library titles; "Dream Console" (`HomeHeader.svelte:233-234`).
  - 500: "of 10", "Delete save", "Save deleted", the home pitch.
  - The step button is 600 while Done is 700: the same role at two weights.
- **Fix.** Three weights: 400 (reading), 600 (labels, buttons, headings, values), and lixdu's own face. Map 700 → 600 and 500 → 400; the home pitch → 400 at its size.
- **Acceptance.** Computed Inter weights ⊆ {400, 600} in the next surfaces metrics.

### VT-1-13 · medium · The intro scroll cue sits on top of body text

- **Where.** Intro. android-small, iphone-13-landscape. States: intro, easy-intro, rm-intro.
- **Evidence.** `sheets/board/intro.png`: the 44px chevron disc covers "kno⌄ledge" at 360 and "com⌄ponents" in landscape. Body copy runs under a control.
- **Cause.** `GameScreen.svelte:1079-1094`: `.intro-scroll-cue` is absolutely placed at `bottom: 0.25rem` over the scroller.
- **Fix.**
  - Give the scroller `mask-image: linear-gradient(180deg, #000 calc(100% - 64px), transparent)` while the cue shows, so text fades out before the cue.
  - Or put the cue in its own 52px band below the scroller (padding-bottom 56px on the scroll content).
- **Acceptance.** No text run's box intersects the cue's box in intro at 360, 390 and 844x390.

### VT-1-14 · low · Widows, orphans and unbalanced short paragraphs

- **Where.** Board descriptions and captions, home, first-run, card subtitles, final-log timeline. All core viewports.
- **Evidence** (one word on the last line):
  - Board:
    - "…Stability check and a token comes / off." (notice-skip-damage at 360; laptop "token comes off.").
    - "…draw this / round." (round-start at 360, game-menu).
    - "…if you survive its / check." (caption-easy-ace-third at 844, 1280, 1440).
  - Home and first-run:
    - "A solo journaling game. Draw, roll, / write." (home-return at 360 and 390; first-run at 390).
    - "…mad dash for the / gate" (home-return, iPad).
    - "The game teaches you as you / go." and "…don't show / tips." (first-run at 360).
  - Final log: "Instability · rolled 14 · no loss · / 20/20" (final-log, landscape).
  - Titles: "LOCKED / IN THE / TECH / DISTRICT" (iPad home card, "TECH" alone).
- **Fix.**
  - `text-wrap: pretty` on every `p` in board, card, caption, home card and dialog copy.
  - `text-wrap: balance` on the home pitch, first-run pitch, game-card titles and sub-labels, captions, and the ending message.
  - Timeline clauses `nowrap` as in VT-1-04.
  - For "Draw, roll, write." use a non-breaking space before the last word at minimum, or balance.
- **Acceptance.** No line holding a single word of fewer than 10 characters in those states at 360, 390, 768, 844 and 1280.

### VT-1-15 · low · Danger red and identity colours on labels at rest

- **Where.** HUD labels. All core viewports. States: every HUD state at rest (hud-kings-0, hud-aces-normal-0, round-start).
- **Evidence.**
  - "KINGS" is `#ff4d6d` (the `--color-danger` token, "danger only") at **0 of 4** (`KingsCell.svelte:99-101`).
  - Aces is cyan at 0 (`AcesCell.svelte:131-133`); Stability is green at 20/20.
  - At rest the label row shows four colours: green, red, white and cyan, plus grey Tokens.
  - 60-30-10: the accent budget is spent before anything happens. Danger red appears without danger.
- **Fix.** The OWN-2 label rule: neutral `rgba(255,255,255,0.72)` at a tile's rest tier, the tier colour from the next tier up. Kings turns red at 1.
- **Acceptance.** In hud-kings-0, hud-aces-normal-0 and hud-stability-20 every label computes to the neutral. Kings at 1 to 4 is `#ff4d6d`.

### VT-1-16 · low · The screen title's glow is a different hue from its text

- **Where.** Board, screen title. All core viewports. All board states.
- **Evidence.** `ContextBackground.svelte:123-138`: cyan at `opacity: 0.6` with `text-shadow: 0 0 10px var(--yellow)`. `--yellow` is `#f8f400da` (`src/game.css:8`), a fourth yellow beside `#ffd700`. The result is a muddy teal (about `#0a9a9d`) with an olive fringe: `review-visual/crops/title-i13.png`, `title-desk.png`.
- **Fix.** Colour, not opacity: `color: #19c3c6` (9.1:1 on the table; it keeps the title quieter than full cyan). Glow in its own hue: `text-shadow: 0 0 12px rgba(0,255,255,0.35)`. Retire `--yellow` in favour of `--color-brand-yellow`.
- **Acceptance.** The glow hue matches the text hue (sampled pixels within 15° hue). No `--yellow` references.

### VT-1-17 · low · Suit glyphs come from system fallback fonts; the inverted corner index reads "♥L"

- **Where.** Card corners, board eyebrow, journal list, final-log timeline, story chips. All core viewports.
- **Evidence.**
  - `metrics-surfaces.json` (rendered font): ♠ ♥ ♦ ♣ render in **DejaVu Sans Mono** inside Share Tech Mono runs (card corner index, journal round-card, timeline) and in **Liberation Sans** inside Inter runs (story chips, prompts). On devices that becomes Apple Symbols or Noto, so the suit shapes differ by platform and from the HUD's SVG pips.
  - The card's inverted bottom index of "7♠" reads as "♥L" (`sheets/board/card-challenge.png`, bottom right).
- **Fix.**
  - One `SuitIcon` component reusing the AcesCell SVG paths (`AcesCell.svelte:100-115`): sized 0.9em, `vertical-align: -0.1em` (cap-height alignment), colour inherited.
  - Use it wherever a suit is shown.
  - Drop the inverted index, or render it upright at 0.6 opacity.
- **Acceptance.** No "(system)" faces in the rendered-font audit for suit runs. Card corners show the same suit shapes as the HUD pips.

### VT-1-18 · low · The home Continue button wraps with a leading separator

- **Where.** Home, saved-game card. ipad-portrait (and any card narrower than about 300px). States: home-return.
- **Evidence.** `shots/surfaces/home-return/ipad-portrait.png`: "CONTINUE / · Round 3 · 5 min ago". The second line starts with "·".
- **Fix.** A two-line button by design, like first-run's Play: "CONTINUE" over a sub-line "Round 3 · 5 min ago" (14px/400, sentence case). No leading separator, and the same height on every card.
- **Acceptance.** No line starts with "·" at any viewport. Button heights are equal across cards in a row.

### VT-1-19 · low · On phones the Game Guide chip row looks truncated

- **Where.** Game Guide (Help). android-small, iphone-13. States: help-game, help-home.
- **Evidence.** "Stabili…" and "Stability c…" are cut at the dialog edge (`sheets/surfaces/help-game.png`; outside: "Stability checks"). It is a deliberate horizontal scroller (`GameGuide.svelte:406-416`) with no affordance.
- **Fix.** Fade the scroller's right edge: `mask-image: linear-gradient(90deg, #000 calc(100% - 32px), transparent)`. Add `scroll-padding-inline: 20px` and 20px end padding, so the last chip can scroll clear.
- **Acceptance.** The cut chip fades. The last chip reaches full visibility when scrolled.

### VT-1-20 · low · Ending stats use two number formats; one label wraps alone

- **Where.** Game over (all endings). All core viewports.
- **Evidence.**
  - Tiles read "0 of 4" next to "18/20" and "0/20" (`sheets/surfaces/gameover-win-tokens.png`, `gameover-loss-stability.png`). The HUD says "0/4"; the journal and story say "1 of 4 Kings" and "0 of 4".
  - "ROUNDS SURVIVED" is the only label that wraps at 1280, 1440 and 844 (tiles are equal width).
- **Fix.**
  - Use "n/4" for Kings and Aces wherever a count sits beside a max in a tile, matching the HUD and Final Stability. Prose ("1 of 4 Kings") stays prose.
  - Give stat labels `text-wrap: balance` and reserve two label lines in every tile, so a lone wrap no longer reads as a misalignment. Or shorten to "Rounds", which the game-design reviewer should confirm.
- **Acceptance.** One count format across the tiles. No tile alone at 2 label lines in a row.

### VT-1-21 · low · From 1024px up the in-game header and the HUD do not share edges

- **Where.** In-game header and HUD. laptop, desktop, fhd, ipad-landscape. All board states.
- **Evidence.** `review-visual/crops/header-desk.png`: at 1440 the header frame spans x 8–1432 and the HUD 240–1200, two stacked neon frames with unrelated edges. Exit and Voice sit 700px from the centre line.
- **Fix.** Cap the in-game header at the HUD's width from 1024px up (`max-width: 960px; margin-inline: auto`), so the two frames share left and right edges. The mirrored grid and the centred title are unchanged.
- **Acceptance.** Header and HUD left and right edges within ±1px at 1280, 1440 and 1920.

### VT-1-22 · medium · The reduced-motion d20 number is drawn below the viewport

- **Where.** Board, reduced-motion roll. iphone-13, desktop. State: rm-static-roll.
- **Evidence.** Capture notes: `--hud-bottom` holds a stale 980px or 1040px (the HUD ends at about 130px), so `.static-roll` sits off screen. `rm-static-roll-after-resize` shows the number only after a 1px resize. The number is the only roll feedback a reduced-motion player gets.
- **Cause.** `StatusHUD.svelte:27-48` publishes the HUD bottom from a ResizeObserver plus window resize. A position change (the table arriving) is not a resize, so the first value sticks.
- **Fix.** Read the HUD rect when the static roll is shown (or also on `transitionend`/`animationend` of the table), or position `.static-roll` relative to the board instead of a published pixel value.
- **Acceptance.** rm-static-roll at iphone-13 and desktop shows the number between the HUD bottom and the step button, with no resize.

---

## Capture requests for round 2

1. **HUD tier change in motion.** Frames at 0, 100, 200, 300 and 400ms for Stability 16→15, 11→10 and 5→4; Kings 2→3; Tokens 6→5; Cards 27→26 and 14→13; Aces 0→1; Roll after a natural 20 and a natural 1. Once with reduced motion, to verify instant.
2. **HUD tier sheet at iphone-se (375) and pixel-7 (412)**, as well as the core six. Also at 360 with root font-size 20px (browser text size 125%) to check that the LED values and labels still fit.
3. **Baseline probe output** per HUD tile per viewport in the metrics (value baseline y, max baseline y), so OWN-1's ±0.5px can be read directly.
4. **Board long-label states at iphone-se and pixel-7:** salvation-n2-step, salvation-n4-step, easy-final-check, notice-skip-damage, task-result-nat20, stability-nat1.
5. **The opening instability roll on a natural 1 and a natural 20** (result-line wrap with the modifier note).
6. **/game/ghost-in-the-machine:** intro, round-start, card-event, journal-entry, game-over at 360 and 1440 (title and subtitle lengths differ).
7. **Critical-Stability frames** at 0, 0.4, 0.8 and 1.2s for the VT-1-06 contrast check.
8. **gameover-win-tokens and gameover-loss-kings at 375 and 412**, to confirm the title fits.
