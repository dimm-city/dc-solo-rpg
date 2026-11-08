# Design polish, round 1: plan

Design lead's work-list for round 1. It merges every open finding (OWN-1, OWN-2 and the GD, VT, CP and LR findings of round 1) into 26 items for two developers. Each item names its source findings, an exact spec, what each source reviewer will check, the files, and the states to recapture. One finding is declined, with its reason. The reviews behind the source ids are in this folder (review-*.md); the ledger is ../ledger.json.

- Board developer (areas hud, play, global): DP-1-01 to DP-1-15.
- Surfaces developer (areas overlays, pages, story): DP-1-16 to DP-1-26.

## How the conflicts between reviewers were decided

Every item carries its own decision note. In short:

- **HUD digits (OWN-1).** The OWN-1 owner's (visual) sizes are used: 18/11px on phones, 16/10px in landscape, 20/12px elsewhere. LR's 20/18/24px and GD's 22/20/26px do not fit 360px once the row is mirrored.
  - The ghost "8"s sit behind the value only.
  - The slash is an explicit Share Tech Mono span.
  - HUD labels are 11px at 374px and below and 12px from 375px (VT-1-10's measured exemption).
- **HUD tiers (OWN-2).** The visual spec says the game reviewer's tier boundaries win, so GD's boundaries are used with VT's mechanism, colours and alphas. Every value also stays inside both reviewers' loudness caps:
  - Kings 3-4 is the loudest at .16.
  - Stability critical is .14, pulsing to .07.
  - Every other tier is ≤.12.
  - Tokens turn green near zero, so the value's colour changes with its tier, as the owner asked.
  - The Kings label is red from the first King (VT-1-15).
- **The board column.** Every slot is reserved, so the column's height is constant per viewport and anchoring no longer moves anything.
  - Portrait keeps the 40% bottom anchor (RF-02).
  - Landscape anchors to the top.
  - The rule caption leaves the column and docks above the step button at every viewport (LR's placement; GD chose the same place for landscape).
- **The step button.** The consequence moves to the description (GD-1-05), so the button holds one line of at most 20 characters.
  - The Lucid/Surreal hint moves to a reserved line on the table above the button (GD-1-09).
  - The frame is fixed at 48px. The 60-64px sub-line designs (VT-1-03, LR-1-05) are not needed.
  - The landscape label is 16px; LR's 15px is off the type scale.
- **Copy.** GD's one-job-per-element table, with CP's amendments: 'Roll for Salvation', 'missed 17+', and Token capitalised. Descriptions are trimmed to fit two lines at 360px.
  - One change vocabulary on every Stability roll: 'no Stability lost', never 'Stability holds'.
  - No totals in result lines; the live region keeps them.
  - The final-log timeline keeps a running total, because it has no HUD beside it.
- **Captions.** GD's priority and 'still true' rules, plus CP-1-02's trigger fix. 'Salvation unlocked' shows on the first Salvation screen. No caption starts on the Ace of Hearts' own Stability check, so the Salvation caption is the first one after that card.
- **Dialog titles.** Inter 18px (VT-1-09) replaces LR-1-11's 28px lixdu. MN-07 still holds: no display face under 28px.
- **Card footers.** CP-1-06's 'one line at 390px' cannot hold: the two facts need about 428px, and the box is 327px. They break cleanly at the separator on phones and are one line from 768px.
- **Recap labels.** CP's HUD words are used. 'Cards drawn' does not fit a phone tile, so the Cards value reads '{drawn}/52'.

## Seams between the two developers

- **No shared files, with one exception.** Both developers add the same new file, src/lib/components/card/SuitText.svelte, copied byte for byte from the scratchpad (plan-work/SuitText.svelte, sha256 04e473f331eda01fcadc88ed17ae530b034aa927478699758a25ccefbf77febb; the full text is at the end of this plan). Git merges an identical add with no conflict. The surfaces developer owns it; the board developer lists it in touchedOutside.
- **Files outside both area lists, assigned for this round:**
  - Board: src/lib/stores/gameActions.svelte.js (DP-1-08) and src/game.css (DP-1-14).
  - Surfaces: src/lib/utils/endingSummary.js, src/lib/utils/gameTimeline.js, src/lib/stores/customGames.js and static/games/ghost-in-the-machine.game.md (DP-1-16 to DP-1-24).
- **Keep every export name** in rollResult.js, hudTiers.js, cardInfo.js, endingSummary.js and gameTimeline.js: change values, add exports, rename nothing. The other developer's code and tests keep compiling.
- **Strings that flow across the seam.** The board writes card.modifierResult (DP-1-08), and the surfaces timeline shows it (DP-1-18). The sentences are fixed in both items.
- **AugmentedButton's 48px minimum** (DP-1-05) also applies to the surfaces' buttons once merged. The surfaces developer should expect it in round-2 screenshots.

## Board developer: hud, play, global

### DP-1-01 · HUD numbers in the LED face: one size family, fixed digit fields, a truly mirrored row

- Area: hud (board developer)
- Sources: OWN-1, GD-1-18, LR-1-03, VT-1-08, LR-1-04, VT-1-10
- Unit test: no
- Files: src/lib/components/status/StatusHUD.svelte, src/lib/components/status/StabilityCell.svelte, src/lib/components/status/KingsCell.svelte, src/lib/components/status/RollCell.svelte, src/lib/components/status/CardsCell.svelte, src/lib/components/status/AcesCell.svelte, src/lib/components/status/TokensCell.svelte, src/lib/components/status/hud.test.js
- Recapture: Every hud-* state, hud-all-worst, hud-all-best and round-start at all six core viewports plus iphone-se 375 and pixel-7 412; every board state at the four drift viewports (HUD row unchanged in height)

**Spec**

DECISIONS (all three reviewers): sizes are the OWN-1 owner's (visual): 18/11px phones, 16/10px landscape, 20/12px elsewhere. LR's 20/18/24 and GD's 22/20/26 do not fit 360px once the row is mirrored (VT prototype: Stability 20/20 and Tokens 12/10 measure 55.4px in about 60px boxes). Unlit ghosts sit behind the value only (VT, GD-1-18): the max never changes, so it never jitters, and LR's max ghosts add nothing. The slash is an explicit mono span (VT): a declared font, not a fallback, so GD-1-18's drawn bar is not needed. HUD labels are 11px at 374px and below and 12px from 375px (VT-1-10's measured exemption): six 12px labels in mirrored tracks leave 3.6px a side at 360, under the 4px floor, so LR-1-03's '12px at 360' cannot hold.

1. MARKUP, every tile with a number (Roll and Cards have no max):
<span class="hud-value"><span class="led-field"><span class="led-off" aria-hidden="true">88</span><span class="led-on current">{n}</span></span><span class="hud-slash" aria-hidden="true">/</span><span class="hud-max">20</span></span>
Ghost cells: Stability '88' /20, Kings '8' /4, Roll '88', Cards '88', Aces '8' /4, Tokens '88' /{start}. The Roll's own .led markup is replaced by this, with the same look.
2. SHARED CSS (StatusHUD.svelte):
- .hud-value: display inline-flex; align-items baseline; font-size var(--value-size).
- .led-field: position relative; display inline-block; font-family var(--font-led); font-weight 700; line-height 1; white-space nowrap.
- .led-off: colour var(--value-color); opacity .10; no text-shadow.
- .led-on: position absolute; inset 0; text-align right; colour var(--value-color); text-shadow 0 0 6px color-mix(in srgb, var(--value-color) 45%, transparent).
- .hud-max: font-family var(--font-led); weight 700; font-size var(--max-size); line-height 1; colour var(--max-color, rgba(255,255,255,.6)); no glow.
- .hud-slash: font-family var(--font-mono); font-size calc(var(--max-size) * 1.25); line-height 0 (it never enlarges the line box); colour var(--max-color); margin-inline 1px.
- --value-size / --max-size: 1.25rem / .75rem by default; 1.125rem / .6875rem at max-width 600px; 1rem / .625rem at (max-height 500px) and (min-width 601px).
- Remove RollCell's --led-size and its private .led / .led-off / .led-on rules. Its idle '--' keeps opacity .6 on .led-on. Drop font-variant-numeric on HUD values.
3. MIRRORED ROW: at max-width 600px use grid-template-columns minmax(min-content,1.2fr) minmax(min-content,1fr) minmax(min-content,1fr) minmax(min-content,1fr) minmax(min-content,1fr) minmax(min-content,1.2fr). The wider tracks (1.3 1.25 1 1 1.25 1.3) stay. Move the row's side padding into the outer cells, so every tint (DP-1-02) runs frame to frame: .status-hud padding-inline 0; the first cell adds the old row padding (.5rem, or .125rem at max-width 600px) to its padding-inline-start, and the last cell adds it to its padding-inline-end.
4. TOKENS LOCK: while locked, the lock icon sits in the foot row in place of the bar: centred, the foot row's height (12, 14 or 16px), rgba(255,255,255,.6). The label carries no lock and no lock room: delete --lock-room and its padding. The unlock beat is unchanged.
5. LABELS: 11px with .03em tracking at max-width 374px; 12px with .06em from 375 to 600px; 12px with .08em above 600px (as now).
6. UNCHANGED: HUD height 64px (52px landscape), foot rows, hairlines. DP-1-03 rewrites the sr-only text.

**Acceptance**

VT (OWN-1):
- Computed fontFamily is DSEG7 Classic on every .led-on, .led-off and .hud-max at android-small, iphone-se, iphone-13, pixel-7, iphone-13-landscape, ipad-portrait, laptop and desktop. .hud-slash declares var(--font-mono).
- At 360, with Stability 20/20, Kings 4/4, Roll 20, Cards 52, Aces 4/4, and Tokens both 12/10 (Hard) and 10/10 locked: no .hud-cell has scrollWidth > clientWidth.
- The six value baselines are within ±0.5px at every core viewport, and value and max share a baseline within each tile.
- The tier sheet shows the same digit height in all six tiles.

LR (LR-1-03, LR-1-04):
- The six lit-digit boxes share top and bottom (±0.5px).
- Each value box is ≥3px from its cell edge.
- Value, slash and max x are identical (Δ0) for Stability 20/4/1, Cards 52/20/5 and Tokens 10/1/12.
- HUD height stays 64px (52px landscape).

GD (GD-1-18):
- Slash and max x are identical (±0.5px) per tile across the hud-* states.

VT (VT-1-08, VT-1-10):
- The Roll|Cards hairline is within ±1px of the viewport centre at 360, 375, 390 and 412.
- Every label is ≥4px from its cell edges and from the frame's inner edge, mirrored within 1px.
- Gaps from label ink to value top, and from value bottom to the foot, are ≥4px (≥2px landscape).
- HUD labels are 12px from 375px and 11px only at 374px and below. Note for GD's OWN-2 D: ≥6px outer-label clearance is met where it fits; at 360-412 the 4px floor applies, measured above.

### DP-1-02 · Progressive tiers on all six HUD tiles: one eased tint layer, tier colours for value, label and bar

- Area: hud (board developer)
- Sources: OWN-2, LR-1-04, GD-1-19, VT-1-06, VT-1-15, VT-1-07, GD-1-16
- Unit test: yes
- Files: src/lib/components/status/hudTiers.js, src/lib/components/status/hud.test.js, src/lib/components/status/StatusHUD.svelte, src/lib/components/status/StabilityCell.svelte, src/lib/components/status/KingsCell.svelte, src/lib/components/status/RollCell.svelte, src/lib/components/status/CardsCell.svelte, src/lib/components/status/AcesCell.svelte, src/lib/components/status/TokensCell.svelte
- Recapture: CR-3 tier matrix (every boundary listed in acceptance) plus 0/150/300ms transition frames and reduced-motion frames, hud-all-worst, hud-all-best, stability-rolling, rm-static-roll; all six core viewports

**Spec**

DECISIONS. VT's own spec says the game reviewer's tier boundaries win and VT's colours, alphas and mechanism stand. Both are applied, and every number also stays inside both reviewers' caps.
- Kings tiers 0-2 / 3-4 (GD). VT-1-15's label rule makes the label red from the first King, separately from the tint tier.
- Stability critical is .14, pulsing to .07 (VT's ceiling). It stays under Kings .16, and GD's rule holds: Kings 3-4 and Stability critical are the strongest; every other tier is ≤.12.
- Aces use GD's boundaries and alphas (.04/.07/.10/.12, and gold for Easy's fourth). They sit inside VT's ceiling; VT's .14 for four Aces broke GD's .12 cap.
- Cards use GD's boundaries (13 and 7) with VT's colours and alphas.
- Tokens turn green at 2 or fewer (GD). The owner asked that 'the value's colour changes with' the tier, and VT's yellow-only ladder keeps Tokens one colour from unlock to 0.
- Roll: one tier per pending modifier, at .10 (VT). Lucid is on from the natural 20 until the next result lands, so 'natural 20' and 'Lucid pending' are one span of play. GD's separate .06 'pending over another value' only differs while dice are in flight, when the LED shows '--' (GD-1-16).
- Glow: one recipe, 0 0 6px at 45% of the value colour (VT). Only Kings 3-4 keeps 0 0 10px rgba(255,77,109,.8).
- The locked Tokens max is .5 (VT, 5.36:1), which passes GD-1-19's zero-fail acceptance.

A. TIER FUNCTIONS (hudTiers.js, pure, exported, unit-tested at every boundary):
- stabilityTier(n): existing.
- kingsTier(n): 'calm' for 0-2, 'urgent' for 3-4.
- rollTier({ hasRolled, isLucid, isSurreal }): 'lucid' if isLucid (Lucid wins), else 'surreal' if isSurreal, else 'plain' if hasRolled, else 'idle'.
- cardsTier(n): 'full' for 13 and up, 'low' for 7-12, 'out' for 6 or fewer.
- acesTier({ count, heartsAce, fourthWins }), in this order: 'none' at 0; 'final' at 4 with fourthWins; 'four' at 4; 'locked' for 1-3 without the Ace of Hearts; then 'one', 'two', 'three'.
- tokensTier({ unlocked, tokens, start }), in this order: 'locked'; 'over' if tokens > start; 'clear' if 0; 'near' if ≤2; 'half' if ≤ start/2; 'full'.
Every cell root carries data-tier.

B. TINT LAYER: one per cell, the cell's first child, <span class="tint" aria-hidden="true"></span>. Shared CSS:
- position absolute; inset 0; pointer-events none; z-index 0.
- background-color var(--tint-color, transparent); opacity var(--tint-alpha, 0).
- mask-image and -webkit-mask-image: linear-gradient(180deg, #000, rgba(0,0,0,.25)). This is the Kings look: the top alpha, down to a quarter at the bottom.
- transition: background-color and opacity, var(--dur-overlay) var(--ease-enter).
- Label and readout get position relative and z-index 1. The hairline ::before gets z-index 2. The frame border stays visible over the tints.
- Delete the Kings .urgent gradient (KingsCell.svelte:122-128). The tint layer replaces it.
- The value colour (--value-color, also on the ghosts), the value's text-shadow, the label colour and the bar fill colour all transition over var(--dur-overlay) var(--ease-enter).
- Under prefers-reduced-motion every one of these transitions is none.

C. LADDER: tint colour @ top alpha · value colour · label colour. 'neutral' = rgba(255,255,255,.72).
- STABILITY: steady: none · #00ff88 · neutral. caution: #ffd700@.06 · #ffd700 · #ffd700. danger: #ff8a3d@.10 · #ff8a3d · #ff8a3d. critical: #ff4d6d@.14 · #ff4d6d · #ff4d6d; the tint's opacity pulses .14↔.07 (1.6s ease-in-out infinite), static .14 under reduced motion. Remove criticalPulse from .current: digits never pulse. The bar keeps its colour and pulse.
- KINGS: calm: none · #f2f4f8 · neutral at 0, #ff4d6d at 1-2. urgent: #ff4d6d@.16 · #ff4d6d with text-shadow 0 0 10px rgba(255,77,109,.8) · #ff4d6d. Skull pulses unchanged.
- ROLL: idle: none · '--' in #ffd700 at .6 · neutral. plain: none · #ffd700 · neutral. lucid: #00ffaa@.10 · #00ffaa (LED and ghosts) · #00ffaa. surreal: #f07cff@.10 · #f07cff · #f07cff.
  - In flight (GD-1-16): from the moment a roll starts until gameState.diceRoll takes its result, the LED shows '--' at .6 in the current tier colour. That covers diceState.isRolling, and under reduced motion the static roll shown before the result applies. The tier and its tint stay, then are recomputed when the result lands.
  - The arrows are unchanged.
- CARDS (never red): full: none · #e2e9f2 · neutral, bar as now. low: #ffd700@.05 · #ffe08a · #ffd700, bar #ffd700. out: #ff8a3d@.09 · #ff8a3d · #ff8a3d, bar #ff8a3d.
- ACES: none: none · #f2f4f8 · neutral. locked: none · #00ffff · #00ffff. one #00ffff@.04, two @.07, three @.10 and four @.12, all with value and label #00ffff. final (Easy, 4): #ffd700@.12 · #ffd700 · #ffd700. Pips unchanged.
- TOKENS: locked: none · rgba(255,255,255,.6), max rgba(255,255,255,.5) · neutral. full: none · #ffd700 · #ffd700. half: #ffd700@.06 · #ffd700 · #ffd700. near: #00ff88@.10 · #00ff88 · #00ff88. clear: #00ff88@.12 · #00ff88 · #00ff88. over: #ff8a3d@.08 · #ff8a3d · #ff8a3d, with the striped bar as now. Otherwise the bar follows the value colour. The unlock beat is unchanged.
- MAX: rgba(255,255,255,.6) in every tier, locked Tokens .5. Ghosts: the value colour at .10.
- CEILING: no tint above .14 except Kings urgent at .16.

D. NO REFLOW: tiers change only colour, background and opacity. Never weight, size, padding, border or tracking.

**Acceptance**

GD (OWN-2):
- The tier matrix (CR-3) at android-small, iphone-13, landscape and desktop shows every step at its boundaries:
  - Stability 16, 15, 11, 10, 5, 4, 1, 0.
  - Kings 0 to 4.
  - Cards 52, 13, 12, 7, 6, 1, 0.
  - Aces 0; 1 without the Ace of Hearts; 1, 2 and 3 with it; 4 on Normal; 4 on Easy.
  - Tokens locked, 10, 6, 5, 3, 2, 1, 0 and 12/10.
  - Roll idle, plain, natural 20, natural 1, Lucid pending, Surreal pending and rolling.
- In hud-all-worst, the Kings 3/4 tint is the strongest, Stability critical the next, and every other tile is ≤.12 (sampled).
- Frames at 0, 150 and 300ms of one change per tile interpolate. Under reduced motion the end state is on frame 0.
- Zero HUD contrast fails in the metrics.
- stability-rolling and rm-static-roll show '--' in the Roll tile.

VT (OWN-2 visual, VT-1-06, VT-1-07, VT-1-15):
- Every value is ≥4.5:1 on its own tint.
- The critical value is ≥4.5:1 in frames at 0, 0.4, 0.8 and 1.2s of hud-stability-1.
- The locked '/10' is ≥5.0:1.
- In hud-kings-0, hud-aces-normal-0 and hud-stability-20 every label computes to rgba(255,255,255,.72). The Kings label is #ff4d6d at 1-4.
- No tile is louder than Kings 3/4.

LR (LR-1-04):
- Across every hud-* tier state, all label, value and foot boxes are Δ0.
- Each tint's rect equals its cell's rect.
- The Stability and Tokens tints touch the frame's inner border with no strip (2x crop of hud-all-worst and hud-all-best).

Unit tests cover every tier function at every boundary.

### DP-1-03 · HUD spoken text and tooltips: label first, then the value, then a tier word

- Area: hud (board developer)
- Sources: CP-1-12, CP-1-16, GD-1-01
- Unit test: yes
- Files: src/lib/components/status/hudTiers.js, src/lib/components/status/hud.test.js, src/lib/components/status/StabilityCell.svelte, src/lib/components/status/KingsCell.svelte, src/lib/components/status/RollCell.svelte, src/lib/components/status/CardsCell.svelte, src/lib/components/status/AcesCell.svelte, src/lib/components/status/TokensCell.svelte
- Recapture: hud-* tier states (a11y snapshot) at iphone-13 and desktop

**Spec**

Add pure functions in hudTiers.js, one per tile and fed by the DP-1-02 tier functions, and use them for each cell's sr-only text. Every string starts with the tile's visible label; Kings and Tokens can have custom labels from config.labels.
- STABILITY: 'Stability {n} of 20', plus ', falling' (caution), ', low' (danger) or ', critical' (critical).
- KINGS: '{label} {n} of 4', plus ', one more ends the game' at 3 or ', all four revealed' at 4.
- ROLL: 'Roll: none yet' (idle) and 'Roll: rolling' (in flight). Otherwise 'Roll {n}', plus ', {high|low} of {a} and {b}' for two dice, plus ', natural 20' or ', natural 1'. Examples: 'Roll 20, natural 20'; 'Roll 6, low of 6 and 15'.
- CARDS: 'Cards {n} of 52 left', plus ', running low' (low) or ', running out' (out).
- ACES, by tier:
  - none: 'Aces 0 of 4'.
  - locked: 'Aces {n} of 4, Salvation locked until the Ace of Hearts'.
  - one to three: 'Aces {n} of 4, Salvation needs {t} or more'.
  - four: 'Aces 4 of 4, Salvation has no target: each roll is a Stability check'.
  - final: 'Aces 4 of 4, survive the final Stability check and you escape'.
- TOKENS: locked: '{label} locked until the Ace of Hearts'. Otherwise '{label} {n} of {start} left', plus a tier word:
  - half: ', halfway there'.
  - near: ', two to go' at 2 and ', one to go' at 1.
  - clear: ', all cleared'.
  - over: ', {k} more than at the start'.
TOOLTIPS (title):
- Aces: 'Each Ace makes Salvation easier' (0); 'Salvation unlocks with the Ace of Hearts' (locked); 'Salvation needs {t}+' (one to three); 'All four Aces: {fourAcesRule}' (four and final).
- fourAcesRule on Normal and Hard: 'each Salvation is a Stability check; hold on and a Token comes off' (GD-1-01: never 'automatic'). Easy is unchanged.
- Locked Tokens: 'Find the Ace of Hearts to unlock Salvation' (as now).
ROLL ARROWS (rollModifiers, the aria-label and title):
- On: 'Lucid: your next roll uses two dice and keeps the higher.' and 'Surreal: your next roll uses two dice and keeps the lower.'
- Off: 'Lucid: off' and 'Surreal: off' (CP-1-16's long form).

**Acceptance**

CP:
- A unit test per tile asserts the exact spoken string at every tier.
- Every string starts with the visible label.
- An accessibility snapshot of hud-stability-4, hud-kings-3, hud-cards-5, hud-tokens-1 and hud-aces-normal-2 shows these strings.

GD:
- grep -niE 'automatic|assured' src/lib/components/status finds nothing outside tests.

CP-1-16:
- The arrow labels read the long form when on and 'Lucid: off' / 'Surreal: off' when off.

### DP-1-04 · Board text column: fixed slots, one title size per class, clause-safe result line

- Area: play (board developer)
- Sources: GD-1-03, LR-1-01, GD-1-04, LR-1-08, VT-1-16, VT-1-04, VT-1-14, VT-1-11
- Unit test: no
- Files: src/lib/components/game/ContextBackground.svelte, src/lib/components/GameScreen.svelte
- Recapture: Every board state at all six core viewports (drift tables and sheets), caption-* with their tips-off twins, notice-*, easy-final-check, task-result-nat20, stability-nat1, salvation-n4-nat1

**Spec**

DECISIONS:
- CAPTION. The rule caption leaves the column (DP-1-09) and docks above the step button at every viewport. This is LR's placement. GD chose the same spot for landscape, so there is now one place everywhere, beside the action it explains. It never covers the column, so NV-02's 'never overlap' still holds.
- ANCHORING. With every slot reserved, the column's height is constant per viewport, so the anchor no longer moves anything. Portrait keeps the bottom anchor on the 40% line (RF-02: text stays above the dice line; LR). Landscape anchors to the top (GD and LR). GD's top-pinned layout and LR's bottom anchor then put every element in the same place.
- TITLES. GD's sizes (one line from 600px wide and in landscape) replace LR's wider column (LR-1-08). LR's acceptance is still met: STABILITY CHECK is one line at laptop and desktop, and after the rename FINAL CHECK is one line, not two.
- RESULT MODIFIER. The result's modifier is the single coloured word (GD-1-07, CP-1-16). It is its own element (VT-1-04). The rule sentence moves to the hint line (DP-1-05) and the caption (DP-1-09), so the result line is never two clauses of rule text.

1. COLUMN. Four slots, always present: eyebrow, title, a 12px gap, body. ContextBackground no longer takes children; the caption moves to GameScreen (DP-1-09).
2. EYEBROW SLOT.
- One line: Inter 600, 14px, line-height 21px, margin-bottom 8px.
- white-space nowrap; overflow hidden; text-overflow ellipsis; max-width 600px; the full text in a title attribute.
- With no card, the slot holds '\u00a0' with visibility hidden.
- Rendered with SuitText (DP-1-15).
3. TITLE SLOT. The h2 is the slot: height calc(var(--title-lines) * 1.15em); display flex; align-items flex-end; justify-content center; text-align center. The last line therefore sits at a fixed y.
- --title-lines: 2 below 600px wide, 1 from 600px and at (max-height 500px) and (orientation landscape).
- font-size: clamp(1.375rem, 6.5vw, 1.75rem) below 600px; clamp(1.75rem, 4.8vw, 3rem) from 600px; 1.75rem at max-height 500px, which replaces GameScreen's clamp(1.75rem, 8vh, 2.25rem).
- Keep lixdu, uppercase, .04em tracking, text-wrap balance and no mid-word breaks.
- Colour #19c3c6 at opacity 1, text-shadow 0 0 12px rgba(0,255,255,.35) (VT-1-16; no --yellow).
- Rename the Easy title 'Final Stability Check' to 'Final Check' (GameScreen contextText).
4. BODY SLOT (.context-below): the description before the roll, the result line after it, then the notice.
- align-content start; min-height calc(3 * var(--result-size) + 29px): two result lines plus one notice line.
- Description: 16px Inter 400 at every width, line-height 1.5, #b3b3b3, text-wrap pretty.
- Result line: --result-size is 16px below 600px wide and in landscape, 18px from 600 to 1023px, 20px from 1024px; line-height 1.5; Inter 600 #fff; no vw clamp.
- Notice: 14px Inter 600, line-height 21px, #00ffff, margin-top 8px, text-wrap pretty, rendered with SuitText.
- Copy limit (DP-1-06 and DP-1-07): at 360px, descriptions and result lines are at most two lines.
5. RESULT CLAUSES. Split resultLine on ' · '. Every clause but the last renders as <span class="clause">{clause}\u00a0·</span> with white-space nowrap; spans are joined by a normal space. So a line breaks only after a separator, and the '·' stays at the line end. A last clause that is exactly 'Lucid' or 'Surreal' gets class modifier and colour #00ffaa or #f07cff. Keep text-wrap balance on the line. The live-region text is unchanged (DP-1-07).
6. ANCHOR.
- Portrait: the column's bottom stays on the 40% line (.context-text-background bottom 60%; .context-column margin-top auto). At every portrait core viewport the column must fit above that line: about 172 of 187px at 360x640.
- Landscape (max-height 500px): .context-column margin-top 0.

**Acceptance**

GD (GD-1-03, GD-1-04) and LR (LR-1-01, LR-1-08), from the drift tables at all six core viewports:
- Per viewport, across all board states, these move ≤2px: the eyebrow top; the title's last-line bottom in portrait, or its first-line top in landscape; the body top; the notice top.
- The title top differs only between one- and two-line titles (≤ one line-height).
- Each caption-* state against its tips-off twin: title, eyebrow, result line and step button Δ0.
- In portrait the body slot ends at or above the 40% line, so above the 44% dice line.
- No column text overlaps the HUD or the step area at any viewport.
- Every screen title is one line at ≥600px wide and in landscape, and at most two lines on phones.
- INSTABILITY is one line at 360px; STABILITY CHECK is one line at 768, 1280 and 1440px.

VT:
- VT-1-04: no result line starts or ends inside a clause in any nat-20 or nat-1 state at 360, 390 and 844x390. The modifier word is a separate element at ≥4.5:1.
- VT-1-16: sampled glow pixels are within 15° of the title's hue.
- VT-1-11: board body sizes are on the scale (14, 16, 18, 20), with no fractional Inter size.
- VT-1-14: no one-word last line in the description or notice at 360, 390, 768, 844 and 1280.

### DP-1-05 · Step button: one fixed 48px slot, a one-line verb label, the modifier hint on its own line, a centred key-cap

- Area: play (board developer)
- Sources: GD-1-09, GD-1-10, GD-1-11, VT-1-01, VT-1-03, VT-1-05, LR-1-05, LR-1-12, LR-1-06, VT-1-10, CP-1-16
- Unit test: no
- Files: src/lib/components/game/StepAction.svelte, src/lib/components/AugmentedButton.svelte, src/lib/components/GameScreen.svelte, src/lib/utils/rollResult.js
- Recapture: Every board state at all six core viewports; round-start-lucid/surreal, stability-check-lucid/surreal, salvation-step-lucid at 360 and 844x390; laptop, desktop and fhd key-cap shots for every label (CR-8)

**Spec**

DECISIONS:
- CONSEQUENCE. The consequence clause ('need 14+') moves to the description (GD-1-05: one job per element), not to a sub-line inside the button (VT-1-03, LR-1-05). The button then holds one line of at most 20 characters.
- HINT. The Lucid/Surreal hint moves to a reserved line on the table above the button (GD-1-09). There its colours measure 14.5:1 and 8.3:1, so VT-1-01's pale on-button tints are not needed.
- HEIGHT. The frame is fixed at 48px. That meets LR-1-06's 48dp and GD-1-10's fixed frame; VT's and LR's 60-64px were sized for the sub-line, which is gone.
- LANDSCAPE LABEL. 16px (VT-1-03, GD-1-10). LR's 15px is off the type scale, so the column widens instead.

1. LABEL. The button's text and accessible name are step.text only: no ' · hint'. .label-main gets white-space nowrap and no balance.
2. HINT LINE. A <p class="step-hint" id="step-hint" data-testid="roll-modifier"> inside .step-action, directly above the ButtonBar, always rendered:
- height 20px; margin-bottom 4px; Inter 600, 14px (12px at max-height 500px), line-height 20px, tracking .02em, sentence case, centred.
- Content: the HUD arrow at 12px (RollCell's ARROW path: up for Lucid, down for Surreal; fill currentColor), a 6px gap, then 'Lucid · two dice, keep the higher' in #00ffaa or 'Surreal · two dice, keep the lower' in #f07cff.
- With no hint: '\u00a0' with visibility hidden.
- The button has aria-describedby="step-hint" only while a hint shows.
- LUCID_HINT and SURREAL_HINT in rollResult.js take these texts; keep the export names.
3. FRAME. .step-action .aug-button: height 48px; padding-block 0; box-sizing border-box; the label centred, at every viewport. In AugmentedButton, .aug-button gets min-height 48px at every width (LR-1-06): it was 43.2px from 451 to 768px.
4. KEY-CAP, at (hover: hover) and (pointer: fine):
- .key-hint: position absolute; right 16px; top 50%; transform translateY(-50%); font-size 12px; opacity 1.
- A button that holds a key-hint gets padding-inline 84px, so the label centres on the button's axis and never runs under the chip.
- The chip's colours are unchanged (≥6.1:1).
5. LANDSCAPE (max-height 500px, orientation landscape):
- --action-col: clamp(248px, 32vw, 280px), up from a 200px floor.
- The step label is 1rem with padding-inline 16px, which leaves ≥216px for the label ('Roll for instability' is about 205px).
- The hint line is 12px and fits the column.
6. LENGTH. With the DP-1-06 copy every step label is ≤20 characters and stays one line at every core viewport.

**Acceptance**

GD (GD-1-09, GD-1-10) and LR (LR-1-05), from the drift tables:
- The step button's top and height are identical (±1px) across every board state per viewport: Δh 0.
- The step label is one line, Δtop ≤2px.
- The hint appearing moves nothing.

VT (VT-1-01, VT-1-03, VT-1-05):
- Both hints are ≥4.5:1 (expect 14.5:1 and 8.3:1) in round-start-lucid, round-start-surreal, stability-check-lucid, stability-check-surreal and salvation-step-lucid at every viewport.
- The hint is ≤1 line at 360 and at 844x390.
- Line 1 is a single line at 360, 375, 390 and 844x390.

GD-1-11, VT-1-05, LR-1-12:
- At laptop, desktop and fhd, the label's centre x equals the button's centre x (±1px).
- The key-cap x is identical (±1px) in every state.
- The key-cap text is 12px and ≥4.5:1.
- 'ROLL FOR STABILITY' and 'ROLL FOR INSTABILITY' are one line at 1280.

LR-1-06:
- smallTargets lists no .aug-button at android-small, iphone-se, iphone-13, pixel-7, iphone-13-landscape, ipad-portrait or ipad-landscape.

CP-1-16:
- The hint text is exactly 'Lucid · two dice, keep the higher' or 'Surreal · two dice, keep the lower'.
- The button's accessible name equals its visible label.

### DP-1-06 · Board copy: titles, descriptions and step labels, one job per element

- Area: play (board developer)
- Sources: GD-1-05, GD-1-06, GD-1-12, GD-1-01, GD-1-15, CP-1-05, CP-1-18, CP-1-19
- Unit test: yes
- Files: src/lib/components/GameScreen.svelte, src/lib/utils/rollResult.js, src/lib/utils/rollResult.test.js, src/lib/composables/screen/useInitialDamage.svelte.js, src/lib/composables/screen/useRollForTasks.svelte.js, src/lib/composables/screen/useFailureCheck.svelte.js, src/lib/composables/screen/useSuccessCheck.svelte.js, src/lib/composables/screen/screenComposables.test.js
- Recapture: instability-roll, instability-result, round-start, task-result, stability-check, stability-check-ace, stability-11-19, result-hold, salvation-n1..n4-step, salvation-e*-step, salvation-h1-step, easy-final-check, easy-final-escape, caption-*, intro, easy-intro; all six core viewports; scripted run for the labels

**Spec**

DECISION: GD's one-job table and copy, with CP's amendments: 'Roll for Salvation', and Token capitalised. Descriptions are trimmed to ≤66 characters so they fit two lines at 360px in the reserved body slot (DP-1-04); each keeps its stakes.

Write source strings in sentence case; CSS uppercases the button. Custom config.labels still override where they do today.

TITLES: 'Instability' · 'Round {n}' · 'Stability Check' · 'Final Check' (Easy's fourth-Ace check) · 'Salvation'.

DESCRIPTIONS:
- initialDamageRoll: 'The situation is already precarious. 10 or less costs Stability.'
- rollForTasks: 'Your roll sets how many cards you draw, from 1 to 6.'
- failureCheck: 'An odd card demands a price. 10 or less costs Stability.'
- Final check (Easy): 'Come through this roll with any Stability left and you escape.'
- successCheck with 1-3 Aces: 'You need {t}+ to remove a Token.' Hard adds ' A miss adds one.'
- successCheck with four Aces (Normal, Hard): 'No target now. Survive this Stability check and a Token comes off.'

STEP LABELS (useInitialDamage, useRollForTasks, useFailureCheck, useSuccessCheck, formatSalvationButton, FINAL_CHECK_LABEL; keep the export names):
- Before the roll:
  - 'Roll for instability'.
  - 'Roll for tasks'.
  - 'Roll for Stability': every Stability check, the final check included. Never 'damage'.
  - 'Roll for Salvation': every threshold, and four Aces.
- While rolling: 'Rolling…'.
- After the result, named by its destination:
  - opening roll: 'Begin round 1'.
  - task roll: 'Draw the cards', or 'Draw the card' for one.
  - a Stability check with cards left in the round: 'Draw the next card'.
  - the round's last check, Salvation unlocked: 'Go to Salvation'.
  - the round's last check otherwise, and after Salvation: 'Open your journal'. If Settings › Journal is 'skip' (autoHandleJournaling === 'skip'), it is 'Begin round {n+1}' instead.
  - a won game: 'Escape'. A lost game: 'Face the end'.

INTRO GOAL: formatIntroGoal({ stability, tokens, aceRevealed, fourthAceWins }); GameScreen passes fourthAceWins(gameState).
- Normal and Hard: 'Hold on to your 20 Stability. Find the Ace of Hearts, then clear all 10 Tokens to escape.'
- Easy: 'Hold on to your 20 Stability. The Ace of Hearts is already revealed: clear all 10 Tokens, or survive the fourth Ace, to escape.'
- One token: 'the one Token'.

No '...' in any of these strings. Update rollResult.test.js, screenComposables.test.js and the e2e copy assertions.

**Acceptance**

GD (GD-1-05):
- On every board state, no two of {caption, description or result, step label, notice} share a run of three or more words, case-insensitive, with DP-1-09's caption copy.
- The copy matches these tables at every difficulty.

GD (GD-1-01, GD-1-06):
- grep -rniE 'assured|automatic after|roll for damage' src/lib finds no player copy (tests aside).
- No player-facing label contains 'damage'.

GD (GD-1-12):
- No step label reads 'Continue'.
- In a scripted run (instability, round 1, card, check, …, Salvation, journal) each post-result label names the screen that follows.

GD (GD-1-10):
- Every label is ≤20 characters and one line. Every description is ≤2 lines at 360.

GD (GD-1-15):
- easy-intro shows the Easy line. The Normal and Hard intros change only to 'Tokens'.

CP:
- CP-1-19: the accessible names are in sentence case ('Draw the cards').
- CP-1-18: no '...' in these strings.

### DP-1-07 · Result lines: one grammar, no totals on screen, the modifier as one word

- Area: play (board developer)
- Sources: GD-1-07, CP-1-01, CP-1-05, GD-1-08, CP-1-16
- Unit test: yes
- Files: src/lib/utils/rollResult.js, src/lib/utils/rollResult.test.js, src/lib/components/GameScreen.svelte
- Recapture: stability-* results, task-result*, salvation-n*/e*/h*-hit/miss/nat20/nat1, salvation-n4-*, salvation-last-token, stability-fatal, easy-final-escape, easy-final-fatal, rm-*-result; all six core viewports

**Spec**

DECISION: GD's grammar, with CP's amendments:
- A miss reads 'missed {t}+', not 'no token lost'.
- Token is capitalised.
- The change clause has one vocabulary on every Stability roll. GD's 'Stability holds' variants become 'no Stability lost', so a 15 reads the same on a check, a four-Ace Salvation and the final check.
- Totals leave the line (the HUD shows them) and stay in the live announcement.

rollResult.js (keep every export name; the separator is ' · '):
- HEAD: 'Rolled N', 'Natural 20' or 'Natural 1', plus ' (high of a, b)' or ' (low of a, b)' for two dice.
- STABILITY CHECK AND OPENING ROLL: '{head} · {change}', plus ' · Lucid' on a natural 20 or ' · Surreal' on a natural 1.
  - {change} is one of: '+1 Stability' | 'Stability already full' | '−n Stability' | 'no Stability lost'.
  - Fatal: '{head} · −n Stability · nothing left to hold on to'.
  - Easy final check survived: '{head} · {change} · you escape' (no modifier).
- TASKS: '{head} · {n} cards this round' ('1 card this round'), plus ' · Lucid' or ' · Surreal'.
- SALVATION, 1-3 Aces:
  - hit: '{head} · −1 Token'. Natural 20: 'Natural 20 · −2 Tokens · Lucid'.
  - miss: '{head} · missed {t}+'. Natural 1: 'Natural 1 · missed · Surreal'.
  - Hard miss: 'Rolled 9 · missed 17+ · +1 Token'. Hard natural 1: 'Natural 1 · missed · +2 Tokens · Surreal'.
- FOUR ACES: '{head} · {change} · −1 Token', plus the modifier. Fatal as above.
- THE WINNING ROLL (Tokens reach 0): the Token clause becomes 'the last Token is gone · you escape', with no modifier:
  - 'Rolled 15 · the last Token is gone · you escape'.
  - Four Aces: 'Rolled 15 · no Stability lost · the last Token is gone · you escape'.
- EXACT EXAMPLES:
  - 'Rolled 8 · −1 Stability'
  - 'Rolled 15 · no Stability lost'
  - 'Natural 20 · +1 Stability · Lucid'
  - 'Natural 1 · −3 Stability · Surreal'
  - 'Rolled 6 (low of 6, 15) · −1 Stability'
  - 'Rolled 3 · −2 Stability · nothing left to hold on to'
  - 'Rolled 16 · 5 cards this round'
  - 'Rolled 17 · −1 Token'
  - 'Rolled 16 · missed 17+'
- LUCID_NOTE and SURREAL_NOTE become the words 'Lucid' and 'Surreal'. The rule lives in the hint line (DP-1-05) and the caption (DP-1-09).

LIVE REGION (GameScreen) = the result line plus the totals:
- after Stability rolls and four-Ace Salvation: '. Stability {n} of 20.'
- after Salvation: '. {n} of {start} Tokens left.'
- after the task roll: nothing more.

**Acceptance**

GD (GD-1-07):
- Every result line is one line at ≥390px and at most two at 360px.
- No '/20' or 'left' in any result line.
- The live region still reads the totals. For salvation-n2-hit: '… · −1 Token. 6 of 10 Tokens left.'

GD (GD-1-08):
- salvation-last-token reads 'Rolled 15 · the last Token is gone · you escape' at 360 and 1440.

CP (CP-1-01, CP-1-05, CP-1-16):
- grep "no token lost\|'no loss'" src/lib/utils/rollResult.js finds nothing.
- salvation-n2-miss and salvation-n1-nat1 show 'Rolled 9 · missed 14+' and 'Natural 1 · missed · Surreal'.
- Every user-facing 'Token' is capitalised.
- No 'keep high', 'keep low' or '2 dice' remains.

Unit tests in rollResult.test.js cover every line above.

### DP-1-08 · Modifier notices: past tense, named by their card

- Area: play (board developer)
- Sources: GD-1-13, CP-1-22
- Unit test: yes
- Files: src/lib/stores/gameActions.svelte.js, src/lib/components/GameScreen.svelte
- Recapture: notice-skip-damage, notice-return-king, notice-return-king-result; all six core viewports

**Spec**

src/lib/stores/gameActions.svelte.js belongs to the board developer this round; the surfaces developer does not touch it.
- card.modifierResult (also used as gameState.status):
  - skip-damage: '{rank}{suit} skipped its Stability check' (e.g. 'A♣ skipped its Stability check').
  - return-king: 'K{suit} went back into the deck · {n} of 4 Kings out' (e.g. 'K♥ went back into the deck · 0 of 4 Kings out').
  - return-king with no King out: 'No King was out to return'.
  - Suit symbols: ♠ ♥ ♦ ♣.
- GameScreen shows modifierResult as it is, on the Stability check and on Salvation. Drop the `${cardName} · ` prefix on Salvation.
- Rendered through SuitText (DP-1-15).
- The notice still lasts one step (NV-06).
- The final-log timeline shows the same sentences (DP-1-18). The card face keeps its present-tense line (DP-1-16).
- Update the store tests that assert the old strings.

**Acceptance**

GD (GD-1-13):
- notice-skip-damage, notice-return-king and notice-return-king-result show the new lines.
- No notice says 'this time'.
- On Salvation after a skip-damage Ace, the notice is past tense and about the card, so it no longer contradicts the description.

CP (CP-1-22):
- The notice and the timeline use exactly 'A♣ skipped its Stability check' and 'K♥ went back into the deck · 0 of 4 Kings out'.

### DP-1-09 · Rule captions: shown where the rule applies, true when shown, docked above the step button

- Area: play (board developer)
- Sources: GD-1-02, CP-1-02, CP-1-05, CP-1-16, CP-1-19, VT-1-14
- Unit test: yes
- Files: src/lib/composables/useRuleCaptions.svelte.js, src/lib/composables/useRuleCaptions.test.js, src/lib/components/RuleCaption.svelte, src/lib/components/GameScreen.svelte
- Recapture: caption-* (all) at all six core viewports, plus CR-2: a real Normal game with tips on, each caption as it first appears (iphone-13, desktop)

**Spec**

DECISION: GD's priority, 'still true' check and timeless text, on top of CP-1-02's trigger fix. The Salvation caption shows on the first Salvation screen (GD: where its rule applies).
One explicit exception, which both reviewers' acceptances allow for: on the Ace of Hearts' own Stability check no caption starts. So 'Salvation unlocked' is the first caption after that card (CP), shown on the first Salvation screen (GD). An 'odd' caption waiting on that check shows on the next Stability check.

1. TRIGGER (createRuleCaptions.observe). When acesRevealed rises:
- fire 'fourth-ace' on Easy at 4;
- else fire 'salvation' if the newest log entry is the Ace of Hearts (card 'A', suit 'hearts');
- else fire 'ace' when heartsAce.
Keep Easy's fallback: 'salvation' fires on the first Salvation screen.
2. PRIORITY instead of first-in first-out. A caption can start each time the player arrives at a table screen (rollForTasks, failureCheck, successCheck), at most one per arrival. The 'g.state !== shownOn' same-type rule goes.
- Priority: salvation, fourth-ace, lucid, surreal, king, ace, token, odd.
- Where each can show:
  - salvation: successCheck, before its roll.
  - fourth-ace: the final check, before its roll.
  - lucid and surreal: any roll step, before its roll.
  - king, ace, token: any table screen.
  - odd: failureCheck.
- Still true: lucid needs gameState.isLucid and surreal needs isSurreal. A queued caption that is no longer true is dropped.
3. TEXT is built when shown, from live values:
- odd: 'Odd cards call for a Stability check.'
- king: 'King {kingsRevealed} of 4. When all four are revealed, your journey ends.'
- ace: 'Each Ace makes Salvation easier: 17+ with one, 14+ with two, 11+ with three.' On Easy with three Aces out, add ' One more Ace and you escape, if you survive its check.' With four Aces on Normal or Hard: 'With all four Aces, Salvation has no target: each roll is a Stability check.'
- salvation: 'Salvation unlocked. Each round ends with a roll to clear a Token. Clear them all to escape.'
- fourth-ace: 'On Easy, the fourth Ace ends the game.'
- lucid: 'A natural 20 makes you Lucid: your next roll uses two dice and keeps the higher.'
- surreal: 'A natural 1 makes you Surreal: your next roll uses two dice and keeps the lower.'
- token: 'On Hard, a missed Salvation roll adds a Token. Hope costs.'
4. LIFETIME. A visible caption is dismissed when the step's roll starts (the dice and the static roll use the lower table), on a tap, on Escape, or after 6s. It pauses under overlays, as now. Once per game and the Settings › Rule tips switch are unchanged.
5. PLACEMENT (GameScreen, RuleCaption):
- Wrap StepAction in .step-anchor (position relative). The caption renders inside it: position absolute; bottom calc(100% + 12px); left 0; right 0; margin-inline auto; width min(100%, 420px).
- In landscape the anchor is the centred button block in the action column, and the caption is the column width minus 16px.
- text-wrap balance. The label is 'Rule' in the source: CSS uppercases it; 12px mono as now. The text is 14px, line-height 1.4.
- It never covers the column, the hint line or the button, and its arrival moves nothing.
6. The Help summaries are the surfaces developer's (DP-1-20).

**Acceptance**

CP (CP-1-02), unit tests:
- (a) Draw the Ace of Hearts (heartsAce true, aces 0), then confirm (aces 1): expect 'salvation'.
- (b) The Ace of Diamonds, then the Ace of Hearts (aces 1 to 2): expect 'salvation'.
- (c) The Ace of Hearts, then the Ace of Diamonds: expect 'ace'.
- Plus tests for priority, still-true, dismiss-on-roll and the hold on the Ace of Hearts' own check.
- useRuleCaptions.test.js:220-226 is replaced by the real two-step flow.

GD (GD-1-02), a scripted Normal game with tips on (CR-2), at iphone-13 and desktop:
- 'Salvation unlocked' is the first caption after the Ace of Hearts, on the first Salvation screen.
- Lucid and Surreal captions appear only on a screen whose step shows the matching hint.
- The Ace caption never disagrees with the Aces tile.
- No other caption shows later than the first table screen after its trigger, except the odd caption held by the Ace of Hearts' own check.

CP-1-05, CP-1-16:
- 'Salvation' and 'Token' are capitalised in every caption.
- The Lucid and Surreal captions use the long form.

LR (LR-1-01):
- Each caption-* state against its tips-off twin: title, eyebrow, result and button Δ0.
- The caption box never intersects the column, the hint or the button at any core viewport, android-small included.

VT (VT-1-14):
- No one-word last line in a caption at 360, 390, 844 and 1280.

### DP-1-10 · Reduced-motion roll placed in the table; no off-screen game screen on load

- Area: play (board developer)
- Sources: GD-1-17, LR-1-02, VT-1-22
- Unit test: no
- Files: src/lib/components/GameScreen.svelte, src/routes/+layout.svelte, src/lib/components/status/StatusHUD.svelte
- Recapture: rm-static-roll (no resize) and rm-* at all six core viewports; per-frame load sampling (loadjump) at iphone-13 and desktop; intro

**Spec**

1. SCREEN STACK (GameScreen): wrap the screen blocks (loadGame, gameOver, exitGame and the game screen) in .screen-stack { display grid; height 100%; min-height 0 }, each block grid-area 1 / 1 and min-height 0. The outgoing load screen then never pushes the game screen down a viewport during its 200ms fade, and the intro fades in on screen.
2. STATIC ROLL. Move the markup from +layout.svelte into GameScreen's .main-screen-area: the same diceState.staticRoll source, the same d20 SVG, the same out:fade DICE_SINK. Its band:
- portrait: position absolute; left 0; right 0; top 44% (the dice line); bottom = the step anchor's height + 12px. The anchor is the hint line, 20px plus 4px, the 48px button and the ButtonBar's padding (about 104px); expose it as --step-anchor-h on .main-screen-area.
- landscape (max-height 500px): right var(--action-col); top = the column's fixed height + 8px; bottom 8px.
- The die is 96px; 64px at max-height 500px, or when the band is under 112px. Centred.
- z-index above the column text, below dialogs.
- The caption is dismissed when the roll starts (DP-1-09), so the band is free.
- The die's number is Inter 600 (VT-1-12).
3. REMOVE --hud-bottom: the publish in StatusHUD.svelte:24-48 and its doc comment, and .static-roll in +layout.svelte. Nothing reads the variable any more.

**Acceptance**

LR (LR-1-02):
- Per-frame sampling from navigation (review-layout/loadjump.cjs): .game-screen top is 0 throughout, the intro's opacity ramps from 0 to 1 on screen, and nothing snaps when the load screen unmounts.
- --hud-bottom is no longer set on :root (it has no consumer). This replaces the '--hud-bottom = HUD bottom + 8' check.

GD (GD-1-17), VT (VT-1-22), LR:
- rm-static-roll at every core viewport, with no resize: the whole d20 outline is inside the viewport and overlaps no text.
- In portrait it sits between the body slot's bottom and the step anchor's top; in landscape, left of the action column and below the column.
- The Roll tile shows '--' meanwhile (DP-1-02).

### DP-1-11 · In-game header: one name per feature, labels in names, no Guest, 12px labels, frame edges shared with the HUD

- Area: hud (board developer)
- Sources: CP-1-03, CP-1-04, CP-1-08, LR-1-14, VT-1-10, VT-1-21, VT-1-12, VT-1-11
- Unit test: no
- Files: src/lib/components/status/PlayerInfoBar.svelte, src/lib/components/StatusDisplay.svelte, src/lib/components/GameScreen.svelte
- Recapture: round-start and autoplay-on at all six core viewports plus 721px and fhd; header-menu, header-menu-autoplay-on; exit-confirm-game; a long-titled game (card-*-long) header at 360, 390, 768

**Spec**

1. LABELS AND NAMES. Each accessible name contains its visible label (WCAG 2.5.3); aria-pressed carries a toggle's state.
- Exit: 'Exit', named 'Exit game' (as now).
- Help becomes visible 'Guide', named 'Game Guide'.
- Settings: 'Settings', named 'Game settings' (as now).
- Dice: 'Dice', named 'Dice theme'.
- Auto toggle: visible 'Auto-play' with no ' on' suffix and no aria-label.
- Voice toggle: visible 'Read aloud' with no ' on' suffix and no aria-label.
- More: named 'More game options' (as now).
- Phone game-menu items stay 'Settings', 'Dice theme', 'Auto-play', 'Read aloud'. Their On/Off state is 12px.
2. PLAYER SEGMENT: rendered only when gameState.player?.name is non-empty and not 'Guest' (case-insensitive). Otherwise it is not rendered and reserves no space.
3. SIZES AND WEIGHTS:
- Every header label (the button labels and the Round label): 12px, Inter 600, tracking .06em.
- Header title: 16px from 601px, 14px at 600px and below.
- The round value: 16px Inter 600 (was 700).
- No 10, 11 or 15px text left in the header.
4. TITLE: up to two lines (-webkit-line-clamp 2, text-wrap balance) instead of an ellipsis, at every width. The bar's height does not change.
5. WIDTH: from 1024px wide the header bar is max-width 960px with margin-inline auto, so its edges match the HUD's. The mirrored grid and the centred title are unchanged.
6. EXIT DIALOG (the GameScreen ConfirmModal props): title 'Exit the game?', message 'Your progress is saved. Pick it up from home.', confirm 'Exit game', cancel 'Keep playing'.

**Acceptance**

CP (CP-1-03, CP-1-04, CP-1-08):
- An accessibility snapshot at 768 and 1440 shows each visible bar label as a substring of its name, and 'Auto-play' and 'Read aloud' as pressed or not-pressed buttons.
- The labels fit one line at 721px.
- With sign-in off: no 'Guest' and no Player segment at 721, 768 and 1440.
- grep finds no 'Toggle Audio', 'Toggle Auto-Play', '>Voice' or 'Leave the game'.
- exit-confirm-game shows the new copy.

LR (LR-1-14):
- The longest bundled title is not clipped at 360, 390 or 768.

VT:
- VT-1-10: no header text under 12px.
- VT-1-21: header and HUD left and right edges are within ±1px at 1280, 1440 and 1920.
- VT-1-12: header Inter weights are 400 or 600 only.

### DP-1-12 · Intro: the scroll cue in its own band, a sentence-case call to action

- Area: play (board developer)
- Sources: VT-1-13, CP-1-19
- Unit test: no
- Files: src/lib/components/GameScreen.svelte
- Recapture: intro, easy-intro, rm-intro, intro-end at all six core viewports

**Spec**

1. CUE BAND. Whenever the intro overflows, .intro-scroll-area gets padding-bottom 52px, and the cue (44px disc) sits in that band at bottom 4px. No text can scroll under it.
- The band stays while overflowing, at the end too, so the scroller never changes height and the text never jumps.
- The cue still shows only while not at the end.
- Keep the scroller's 24px bottom fade.
2. The CTA's source text is 'Begin your journey'. CSS uppercases it; this is its accessible name.

**Acceptance**

VT (VT-1-13):
- No text run's box intersects the cue's box in intro, easy-intro and rm-intro at 360, 390 and 844x390.

CP (CP-1-19):
- The CTA's accessible name is 'Begin your journey'.

### DP-1-13 · Board bottom safe area

- Area: global (board developer)
- Sources: LR-1-13
- Unit test: no
- Files: src/styles.css, src/lib/components/GameScreen.svelte
- Recapture: round-start and caption-easy-fourth-ace at iphone-13 and iphone-13-landscape with --safe-bottom forced

**Spec**

- styles.css: :root { --safe-bottom: env(safe-area-inset-bottom, 0px) }.
- GameScreen: .ui-content-layer gets padding-bottom max(0.5rem, var(--safe-bottom)) in portrait and in landscape (landscape keeps its left and right insets).
- Every bottom-inset use goes through --safe-bottom, so a capture can force it.

**Acceptance**

LR (LR-1-13):
- With --safe-bottom forced to 34px at 390x844, the step button's bottom is at 810 or above.
- With 21px at 844x390, the button and all column text end at 369 or above.

### DP-1-14 · Global type scale, Inter weights and one yellow (board and global files)

- Area: global (board developer)
- Sources: VT-1-11, VT-1-12, VT-1-16
- Unit test: no
- Files: src/styles.css, src/game.css, src/lib/components/ContinueButton.svelte, src/lib/components/KeyboardHint.svelte, src/lib/components/StatusDisplay.svelte
- Recapture: round-start, stability-check, salvation-n2-step, task-result-nat20 at all six core viewports (type-scale digest)

**Spec**

1. SIZES. One UI scale: 12, 14, 16, 18, 20 and 24px, plus the display sizes (lixdu titles, the LED digits).
- In the board's files (status/*, GameScreen, game/*, RuleCaption, ContinueButton, AugmentedButton, ButtonBar, KeyboardHint, StatusDisplay, +layout, styles.css), replace every Inter size at 10, 11, 13, 15, 17, 19, 22 or 26px, and every vw-clamped UI size, with a scale size.
- Mapping: 10 and 11 → 12. 13 → 12 for uppercase micro-labels, or 14. 15 → 16, or 14 for meta lines. 17 → 16. 19 → 18. 22 → 20, or 24. 26 → 24.
- Exceptions: the 11px HUD labels at 374px and below (DP-1-01), and display titles.
- The --text-* tokens in styles.css keep their names and values: they are already on the scale.
2. WEIGHTS. Inter at 400 and 600 only in those files: 700 → 600, 500 → 400. lixdu and DSEG7 keep their own weights.
3. YELLOW (game.css). Remove --yellow (#f8f400da). --fourth-accent and --dc-health-meter-med use var(--color-brand-yellow).

**Acceptance**

VT (VT-1-11, VT-1-12, VT-1-16), round-2 board metrics:
- At most six distinct Inter sizes per screen.
- No two sizes 1px apart on one screen (except the 11px HUD labels at 374px and below).
- No fractional Inter sizes.
- Inter weights ⊆ {400, 600}.
- No --yellow left anywhere in src.

### DP-1-15 · Suit symbols on the board drawn with the HUD's pip shapes

- Area: play (board developer)
- Sources: VT-1-17
- Unit test: no
- Files: src/lib/components/card/SuitText.svelte, src/lib/components/game/ContextBackground.svelte
- Recapture: stability-check, stability-check-ace, notice-skip-damage, notice-return-king at iphone-13 and desktop

**Spec**

This is the board half of VT-1-17; DP-1-16 is the surfaces half.
- Copy /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/plan-work/SuitText.svelte, byte for byte, to src/lib/components/card/SuitText.svelte. Its sha256 is 04e473f331eda01fcadc88ed17ae530b034aa927478699758a25ccefbf77febb; the full text is also in plan.md.
- Never edit it, and list it in touchedOutside. The surfaces developer adds the same bytes, so git merges the identical add cleanly.
- Use <SuitText text={…} /> for the eyebrow ('7♠ · Caught in a toxic gas leak') and the modifier notice (DP-1-08) in ContextBackground. GameScreen still builds the strings.
- SuitText draws ♠ ♥ ♦ ♣ as inline SVGs with the AcesCell pip paths (0.9em, vertical-align -0.1em, currentColor, role img, aria-label 'spades' and so on).

**Acceptance**

VT (VT-1-17):
- The rendered-font audit shows no '(system)' face for suit runs in stability-check*, notice-* and stability-check-ace.
- The eyebrow's suit shapes match the HUD pips.
- The file's sha256 matches.

## Surfaces developer: overlays, pages, story

### DP-1-16 · Card face: one type vocabulary, footers that add information, named endings, suit shapes

- Area: overlays (surfaces developer)
- Sources: GD-1-14, CP-1-06, GD-1-01, CP-1-22, GD-1-12, GD-1-21, VT-1-17, VT-1-11, VT-1-14
- Unit test: yes
- Files: src/lib/components/card/cardInfo.js, src/lib/components/card/CardDisplay.svelte, src/lib/components/card/SuitText.svelte, src/lib/components/story/storyCards.js
- Recapture: card-* (all, including card-primary-success, card-failure-counter, card-final-king, card-narrative, card-narrative-skip-damage, card-narrative-return-king, card-fourth-ace-easy, *-long) and story-round-1 at all six core viewports plus iphone-se and pixel-7

**Spec**

DECISION on CP-1-06's 'Ace footers on one line at 390px': at 12px uppercase, 'SALVATION NOW NEEDS 14+ · A STABILITY CHECK FOLLOWS' needs about 428px, and the note box is 327px at 390px. Cutting further would lose one of the two facts. So the footer breaks cleanly at the separator on phones (GD-1-21), and is one line from 768px.

1. ONE TYPE TABLE, exported from cardInfo.js and imported by story/storyCards.js: TYPE_LABELS = { 'primary-success': 'Salvation', 'failure-counter': 'King', narrative: 'Ace', challenge: 'Challenge', event: 'Event' }.
- getCardName leaves out the type when it repeats the rank: 'King of Spades', 'Ace of Clubs', 'Ace of Hearts, Salvation', '7 of Spades, Challenge'.
2. FOOTER (mechanic note): it drops what the badge already says.
- King: '{n} of 4' (keep any pips).
- Ace of Hearts (badge Salvation): 'Unlocked · needs {t}+ · a Stability check follows'. As the fourth Ace on Normal or Hard: 'Unlocked · no target · a Stability check follows'.
- Another Ace (badge Ace):
  - after the Ace of Hearts: 'Salvation now needs {t}+ · a Stability check follows';
  - before it: 'Salvation will need {t}+ · a Stability check follows';
  - making four: 'Salvation now has no target · …' or 'Salvation will have no target · …'.
  - With skip-damage, no '· a Stability check follows', as now.
- Easy's fourth Ace: 'The fourth Ace · survive its Stability check and you escape', or 'The fourth Ace · you escape' (both unchanged).
- Odd challenge: 'Odd · a Stability check follows' (unchanged).
- No 'assured' anywhere (GD-1-01).
- Each '·' segment is a white-space nowrap span. A line breaks only after a separator, which stays at the line end (GD-1-21).
- The note is 12px (from 13), uppercase, .08em.
3. MODIFIER LINE on the card face (present tense): skip-damage 'No Stability check for this Ace'; return-king 'A King goes back into the deck', or 'No King is out to return'.
4. FOOTER HINT:
- The fourth King: 'Tap to face the end' / 'Click to face the end'.
- Easy's fourth Ace with skip-damage: 'Tap to escape' / 'Click to escape'.
- Every other card: 'Tap to continue' / 'Click to continue'.
5. SUIT SHAPES. Create src/lib/components/card/SuitText.svelte from /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/plan-work/SuitText.svelte, byte for byte (sha256 04e473f331eda01fcadc88ed17ae530b034aa927478699758a25ccefbf77febb). You own it; the board developer adds the identical file.
- Use it for the corner index here, the journal's round-card list and the timeline (DP-1-18), and the story chips and prompts (DP-1-25).
- Show the bottom-right corner index upright (no rotation) at opacity .6.
6. SIZES (VT-1-11): card story 16px on phones (from 17), 18px from 601px; card title 20px (from 22); tap hint 14px; deal progress 12px uppercase. text-wrap pretty on the story and the headline (VT-1-14).
7. STORY MODE (storyCards.js): chips use TYPE_LABELS. Modifier wording follows the notice: entry.modifierResult when logged, else 'Skipped its Stability check' or 'A King went back into the deck'.

**Acceptance**

GD (GD-1-14):
- The card-ace-hearts badge reads SALVATION.
- getCardName gives 'Ace of Hearts, Salvation'.

CP (CP-1-06, CP-1-22):
- No 'Victory', 'Doom' or 'Bonus' in src (tests aside).
- Card badges, getCardName and the story chips use the one table.
- The four surfaces use only the sentence pairs above.
- Ace footers are one line from 768px, and at 360-390 break only at a separator.

GD (GD-1-01, GD-1-12, GD-1-21):
- grep 'assured' in src/lib/components/card finds nothing.
- card-king-final shows 'Tap to face the end'.
- At 360 and 390 no note line ends in a bare number or article, or starts with '·'.

VT (VT-1-17, VT-1-11):
- No '(system)' face for suit runs on cards or story chips.
- The card corners use the HUD pip shapes.
- The inverted index is upright.
- Card sizes are on the scale.

Unit tests cover getMechanicNote, getModifierNote and getCardName.

### DP-1-17 · Game Over: the title fits, a cause line for the token win, an honest afterword, the recap in HUD terms

- Area: overlays (surfaces developer)
- Sources: VT-1-02, LR-1-07, GD-1-08, CP-1-09, GD-1-22, VT-1-20, CP-1-14, GD-1-20, CP-1-11, VT-1-10, VT-1-11, VT-1-14
- Unit test: yes
- Files: src/lib/components/GameOver.svelte, src/lib/components/RunRecap.svelte, src/lib/utils/endingSummary.js, src/lib/utils/endingSummary.test.js
- Recapture: gameover-loss-kings, gameover-loss-stability, gameover-win-tokens, gameover-win-easy-ace and their -end states, plus an Easy loss (CR-C3) at all six core viewports plus iphone-se, pixel-7, ipad-landscape and fhd

**Spec**

DECISION on the recap labels: CP's HUD words are used. 'Cards drawn' at 12px uppercase does not fit a third-width tile at 360px (about 111px of 104). The Cards value reads '{drawn}/52', and its spoken text says 'drawn'.

1. TITLE: font-size clamp(2rem, 9vw, 4rem); max-inline-size 100%. Recheck 'Game Over' (it may now be one line).
2. CAUSE LINE (endingSummary.getEndingText): a win by the last Token gets causeLine 'The last Token was removed.' (labels.tokensCauseLine overrides it), in the victory accent like the fourth-Ace win.
3. AFTERWORD: on Easy (fourthAceWins(state)) it is 'What you wrote along the way is the story.' Normal and Hard keep both sentences. labels.gameOverAfterword overrides, as now.
4. RECAP (getRunRecap, RunRecap): labels 'Rounds', 'Cards', 'Kings', 'Aces', 'Stability', 'Tokens'. Tokens shows only once the Ace of Hearts is out, as now.
- Values: Rounds '{round}'; Cards '{drawn}/52'; Kings '{n}/4'; Aces '{n}/4'; Stability '{n}/20'; Tokens '{n}/{start}'.
- Set in the HUD's LED face (DP-1-01): DSEG7 digits, the slash an aria-hidden span in var(--font-mono) at 1.25x, the max at 0.6 of the value.
- Value size 24px from 601px, 18px on phones.
- Each dd also carries sr-only text: 'Kings 1 of 4', 'Cards drawn 23 of 52', and so on.
- dt labels 12px (from 11px), on one line at 360px.
- Kings stays danger red when above 0.
5. CTA: 'Write your final log' (labels.gameOverButtonText overrides). The final-log sheet keeps 'Record final log'.
6. text-wrap balance on the ending message.

**Acceptance**

VT (VT-1-02) and LR (LR-1-07):
- The title box is within [16, vw−16] at 360, 375, 390 and 412, for 'Victory' and for 'Game Over'.
- No 'outside' issue is reported.

GD (GD-1-08):
- gameover-win-tokens shows 'The last Token was removed.' at 360 and 1440.

CP (CP-1-09):
- A unit test: an Easy loss gets the afterword without 'never likely'.
- A captured Easy loss shows it.

GD (GD-1-22), VT (VT-1-20), CP (CP-1-14):
- Every recap tile uses n/max in the LED face.
- One count format.
- Every label is one line at 360.
- No 'survived'.

GD (GD-1-20) and CP (CP-1-11):
- The CTA reads 'Write your final log'.

VT-1-10:
- No ending text under 12px.

### DP-1-18 · Journal and final log: one vocabulary, honest destinations, clean status lines and timeline, room in landscape

- Area: overlays (surfaces developer)
- Sources: CP-1-11, GD-1-20, CP-1-07, CP-1-08, GD-1-21, CP-1-05, CP-1-01, CP-1-22, VT-1-07, VT-1-14, LR-1-10, CP-1-04, CP-1-19
- Unit test: yes
- Files: src/lib/components/JournalEntry.svelte, src/lib/components/journal/AutoJournalTimer.svelte, src/lib/components/journal/GameTimeline.svelte, src/lib/utils/gameTimeline.js, src/lib/utils/gameTimeline.test.js, src/lib/utils/endingSummary.js, src/routes/+page.svelte
- Recapture: journal-entry, journal-entry-long-text, journal-saved-beat, journal-auto-timer, journal-voice-*, final-log, final-log-writing, final-log-timeline, final-log-victory, final-log-epitaph, final-log-victory-epitaph at all six core viewports plus 750x342; the epitaph's 'Read your story' landing (story-round-1)

**Spec**

DECISION on the timeline: it takes the board's result-line vocabulary ('Rolled', 'no Stability lost', 'missed 14+', Token capitalised; CP-1-01's one grammar). It keeps a running total as the last clause before any modifier, because the final log has no HUD beside it.

1. JOURNAL COPY:
- Saved beat: 'Saved to your journal'.
- Button: 'Record entry' (sentence case in the source; labels.journalEntrySaveButtonText overrides).
- The final sheet keeps 'Record final log'.
- AutoJournalTimer: 'Next round in {n}s · type to stay'.
2. EPITAPH:
- Text links 'Play again' (labels override) and 'Go home'.
- The primary button 'Read your story' navigates to /?story=latest. On ?story=latest, src/routes/+page.svelte opens the Story Library, then story mode for the newest completed story, exactly as selecting its card does. Back returns to the library. Any other ?story value still opens the library list.
- Signature: 'Round {n}' when the player name is empty or 'Guest' (case-insensitive); otherwise '{name}, round {n}'. It is never cut off by the actions in landscape.
3. STATUS LINE (getStatusLine): 'Stability 18/20 · 1 of 4 Kings · 6 Tokens left' ('1 Token left'). Each segment is a white-space nowrap span, with the '·' kept at the line end.
4. TIMELINE (utils/gameTimeline.js, journal/GameTimeline.svelte):
- Roll heads: 'Rolled N', 'Natural 20', 'Natural 1'. Never 'no loss': 'no Stability lost'.
- Stability lines end '· 18/20' before any modifier.
- Salvation:
  - hit: 'Rolled 17 · −1 Token · 6 Tokens left'.
  - miss: 'Rolled 9 · missed 14+ · 6 Tokens left'.
  - natural 1 miss: 'Natural 1 · missed · 6 Tokens left · Surreal'.
  - Hard: '+1 Token'.
- skip-damage: 'skipped its Stability check', after the card label.
- return-king: entry.modifierResult (DP-1-08's sentence).
- LAST_TOKEN_CAUSE: 'The last Token was removed.'
- Clauses are nowrap spans; separators rgba(255,255,255,.5); suits through SuitText (DP-1-16).
5. ROUND-CARD LIST: suits through SuitText.
6. LANDSCAPE (max-height 500px, orientation landscape): the journal entry uses the final log's two-column layout.
- The card list on the left, about 40%, scrolling inside itself.
- The entry on the right at the body's full height, the textarea at least 140px.
- Voice note and Record entry stay in the footer.

**Acceptance**

CP (CP-1-11, CP-1-19, CP-1-04):
- grep finds no user-facing 'Saved to your log', 'Record Entry', 'Continuing in' or bare 'Home' button.
- journal-saved-beat and journal-auto-timer show the new lines.

CP (CP-1-07):
- After Record final log, the primary button opens this run's round 1 in story mode.

CP (CP-1-08):
- No 'Guest' on the epitaph.

CP (CP-1-01, CP-1-05, CP-1-22):
- final-log-timeline lines start with 'Rolled' or 'Natural'.
- No 'no loss' and no lower-case 'token' in user-facing strings.

GD (GD-1-20):
- The epitaph links read 'Play again' and 'Go home'.

GD (GD-1-21), VT (VT-1-14):
- At 360 and 390, no status-line or timeline line ends in a bare number or starts with '·'.

VT (VT-1-07):
- The timeline separators are ≥4.5:1.

LR (LR-1-10):
- At 844x390 and 750x342 the textarea is at least 140px tall, and Record entry shows without scrolling.

Unit tests cover gameTimeline and getStatusLine.

### DP-1-19 · Dialogs: one title style, quieter section headings, room in landscape

- Area: overlays (surfaces developer)
- Sources: VT-1-09, LR-1-11, VT-1-11
- Unit test: no
- Files: src/lib/components/ContentModal.svelte, src/lib/components/ConfirmModal.svelte, src/lib/components/settings/SettingsModal.svelte, src/lib/components/GameGuide.svelte, src/lib/components/AboutContent.svelte, src/lib/components/DiceThemePicker.svelte
- Recapture: settings-game, settings-home, settings-home-advanced, help-game, help-home, dice-theme-game, dice-theme-home, about-modal-home, confirm-*, exit-confirm-game, story-ai-settings at all six core viewports

**Spec**

DECISION: VT-1-09's Inter title replaces the 28px lixdu title that LR-1-11 kept. MN-07's rule (no display face below 28px) still holds, because lixdu leaves dialogs entirely, and the landscape space LR wanted is freed.

1. TITLES: .content-header h2 (ContentModal) and the ConfirmModal title, at every width: Inter 600, 18px, uppercase, tracking .08em, line-height 1.2, no text-shadow.
2. SECTION HEADINGS: .cm-section-title, GameGuide .guide-title and the About h3s: Inter 600, 16px, sentence case, #00ffff, line-height 1.25.
3. FIELDS: field labels 16px/600; helper text 14px/400.
4. BODY: 16px. Confirm body 15 → 16. Guide body 17 → 16 on phones (18px on desktop). Lead 19 → 18.
5. LANDSCAPE (max-height 500px): dialog max-height calc(100dvh − 16px); header and footer padding 8px 24px; both stay pinned.

**Acceptance**

VT (VT-1-09, VT-1-11):
- Every .content-header h2 computes to Inter 18px/600 at all core viewports.
- Section headings are 16px/600.
- Dialog sizes are on the scale.

VT and LR (LR-1-11):
- At 844x390, the settings-game dialog shows the Difficulty select without scrolling.
- The body scroller is ≥60% of the dialog's height.
- The header and footer stay pinned.

### DP-1-20 · Game Guide and Help: true rules, one vocabulary, a visible chip-row edge

- Area: overlays (surfaces developer)
- Sources: GD-1-01, CP-1-05, CP-1-15, CP-1-16, VT-1-19, CP-1-04
- Unit test: no
- Files: src/lib/components/HelpModal.svelte, src/lib/components/GameGuide.svelte, src/lib/components/DiceThemePicker.svelte, src/routes/how-to/+page.svelte
- Recapture: help-game, help-game-end, help-home, help-home-mid, help-home-end, page-how-to, page-how-to-mid, dice-theme-game, dice-theme-home at all six core viewports

**Spec**

1. HELP (HelpModal RULE_TIP_SUMMARIES):
- ace: 'Every Ace you reveal makes Salvation easier. With all four there is no target: each Salvation is a Stability check, and the Token comes off if you hold on.'
- The other summaries stay. They already use the long Lucid and Surreal form and a capital Token.
2. GUIDE (GameGuide.svelte):
- 'the roll for tasks', not 'the roll for cards'.
- 'all four Kings'.
- Delete 'You are lost if the deck runs out first.', which leaves three endings: escape, fall, taken.
- Lucid and Surreal in the long form: 'Lucid: your next roll uses two dice and keeps the higher.' / 'Surreal: your next roll uses two dice and keeps the lower.' No 'd20s'.
- Token and Salvation capitalised; no 'automatic' or 'assured'.
3. CHIP ROW on phones:
- While the row can scroll further right: mask-image linear-gradient(90deg, #000 calc(100% − 32px), transparent).
- scroll-padding-inline 20px; padding-inline-end 20px.
4. NAMES:
- The Help modal title stays 'Game Guide'.
- The DiceThemePicker title is 'Dice theme'.
- /how-to's h1 and tab title are 'Game Guide'.

**Acceptance**

GD (GD-1-01):
- help-game and help-home show the new ace summary.
- No 'automatic' or 'assured'.

CP (CP-1-05, CP-1-15, CP-1-16):
- grep -nE 'keep high|keep low|2 dice|d20s|roll for cards|all 4 Kings' in these files finds nothing.
- The Guide lists three ending bullets.

CP (CP-1-04):
- page-how-to's title and the dice-theme dialog title match.

VT (VT-1-19):
- In help-game at 360 and 390 the cut chip fades out at the edge.
- The last chip becomes fully visible when scrolled.

### DP-1-21 · Settings copy: difficulty help for the selected option, journal and narration options, key fields

- Area: overlays (surfaces developer)
- Sources: CP-1-10, GD-1-01, CP-1-20, CP-1-23
- Unit test: no
- Files: src/lib/components/settings/SettingsModal.svelte, src/lib/components/settings/AudioSettings.svelte, src/lib/components/settings/AIProviderSection.svelte, src/lib/components/settings/TTSSection.svelte
- Recapture: settings-game, settings-home, settings-home-end, settings-home-advanced, settings-home-advanced-end, story-ai-settings, story-ai-settings-end at all six core viewports, with each difficulty option selected at 390

**Spec**

1. DIFFICULTY (SettingsModal):
- Options in this order: 'Game default', 'Easy', 'Normal', 'Hard'.
- The help describes only the selected option, followed by ' Applies from your next game.':
  - Game default: 'Each game sets its own; most use Normal.'
  - Easy: 'The Ace of Hearts starts revealed, and surviving the fourth Ace wins.'
  - Normal: 'Tokens only ever fall. Remove them all to escape.'
  - Hard: 'A missed Salvation roll adds a Token (two on a natural 1).'
- aria-describedby reads the current text.
- No 'automatic' (GD-1-01).
2. NARRATION AND JOURNAL (AudioSettings):
- 'Read prompts' becomes 'Read instructions', with help "Read each step's instructions aloud."
- 'Journaling' becomes 'Journal', with help 'What happens when the journal opens.'
- Options: 'Wait for me' (manual), 'Skip the journal' (skip), 'Count down, then move on' (timed).
3. KEY FIELDS (AIProviderSection, TTSSection):
- Placeholders: 'sk-ant-…' for Anthropic, 'sk-…' for OpenAI, none for the others.
- Keep the 'Create one at …' helper, and add the helper text 'Stored only in this browser.' under each key field.

**Acceptance**

CP (CP-1-10):
- At 390px the difficulty help is at most three lines for every option.
- It changes with the selection, and the select's description reads the current text.

GD (GD-1-01):
- settings-game and settings-home show no 'automatic'.

CP (CP-1-20):
- Settings contains no 'prompt'.
- The options read as above.

CP (CP-1-23):
- No key-field placeholder starts with 'Paste'.

### DP-1-22 · Home: one name per feature, readable small text, a clean Continue button, nothing on the fold

- Area: pages (surfaces developer)
- Sources: CP-1-03, CP-1-04, CP-1-19, VT-1-07, VT-1-10, VT-1-18, LR-1-15, VT-1-14, VT-1-11
- Unit test: no
- Files: src/lib/components/home/HomeHeader.svelte, src/lib/components/home/HomeGameCard.svelte, src/lib/components/home/FirstRunPanel.svelte, src/routes/+page.svelte
- Recapture: home, home-first-visit, home-first-visit-mid, home-first-visit-end, home-return, home-return-mid, home-return-end, home-menu, home-custom-game, first-run at all six core viewports plus iphone-se, pixel-7, ipad-landscape and fhd

**Spec**

1. HOMEHEADER:
- The hamburger is named 'Menu'.
- Desktop nav: 'Story Library' (not 'Stories') and 'Guide' (named 'Game Guide').
- Menu items, in sentence case in the source: 'Upload game', 'Dice theme', 'Sign out', 'Story Library', 'Game Guide'.
- The 'Dimm City' maker line is 12px #b4c4d6.
- The menu's On/Off state is 12px.
2. HOMEGAMECARD:
- A saved game's Continue button is a two-line button by design: 'Continue' over a sub-line 'Round 3 · 5 min ago' (14px/400, sentence case, no leading '·').
- Every primary button in a row of cards is the same height.
- The 'Custom' badge is 12px.
- Card titles and sub-labels get text-wrap balance.
- At (min-width 601px) and (max-height 820px) the key art is aspect-ratio 21/9.
3. +PAGE.SVELTE: the home pitch is 24px (from 26) with text-wrap balance. Meta lines are 14px (from 15).
4. FIRSTRUNPANEL: the pitch gets text-wrap balance.

**Acceptance**

CP (CP-1-03, CP-1-04, CP-1-19):
- grep finds no 'Toggle menu', no user-facing 'Stories', and no 'Upload Game', 'Dice Theme' or 'Sign Out'.
- home-menu shows the new names at 360, 768 and 1440.

VT (VT-1-07, VT-1-10):
- The maker line is ≥4.5:1, even over the logo glow, and 12px.
- The under-12px list is empty for the home states.

VT (VT-1-18):
- No line starts with '·' in home-return at any viewport.
- Primary button heights are equal across the cards in a row.

LR (LR-1-15):
- At 1280x720 both PLAY buttons are fully visible with ≥24px clear below them.

VT (VT-1-14):
- No one-word last line under 10 characters in home-return or first-run at 360, 390, 768 and 1280.
- The iPad card title does not leave 'TECH' alone on a line.

### DP-1-23 · Home messages: plain upload and save errors, consistent confirm dialogs, punctuation

- Area: pages (surfaces developer)
- Sources: CP-1-13, CP-1-17, CP-1-18
- Unit test: yes
- Files: src/lib/stores/customGames.js, src/routes/+page.svelte, src/lib/components/home/Toast.svelte, src/lib/components/home/FirstRunPanel.svelte
- Recapture: confirm-delete-save, confirm-new-game, confirm-remove-game, home-toast-save-deleted, first-run, and three upload-error toasts (CR-C1: .txt, no frontmatter, bad card line) at iphone-13 and desktop

**Spec**

1. UPLOAD ERRORS. In stores/customGames.js, add friendlyUploadError(error): it maps the parser's ValidationError messages to plain reasons. The parser itself is unchanged, so its tests stand.
- 'No frontmatter found' and 'Invalid frontmatter format' → "it doesn't start with a --- block"
- 'Missing required frontmatter fields: X' → 'it has no X'
- 'No "## Card Deck" section found' → 'it has no Card Deck section'
- 'File too large' → "it's larger than 100KB"
- any card-count list → "its deck doesn't have the cards the format needs"
- anything else → "it isn't a valid game file"
addCustomGame returns { success: false, reason } and +page.svelte writes the toast.
2. TOAST COPY (+page.svelte):
- Wrong file type: 'Choose a file that ends in .game.md.'
- Parse failure: 'Couldn't add “{file name}”: {reason}. Fix the file and upload it again.'
- Storage failure: "Couldn't save the game in this browser. Free up some space and try again."
- Unknown error: "Couldn't add that file. Try again, or check it opens in a text editor."
- Bad save: "That save couldn't be opened. Start a new game or delete the save."
- Success: 'Added “{title}”' (curly quotes).
- No 'Error:', 'Failed' or 'Parser' prefix.
3. TOAST BEHAVIOUR (Toast.svelte): error toasts are role=alert, stay at least 10s and can be dismissed. Other toasts stay role=status with their current timing.
4. CONFIRM DIALOGS (+page.svelte): cancel 'Keep <object>', confirm '<Verb> <object>'.
- Delete save: 'Delete your {game} save (Round {n})? This can't be undone.' Buttons 'Keep save' / 'Delete save'.
- New game: 'Start {game} from the beginning? Your Round {n} save will be replaced. This can't be undone.' Buttons 'Keep my save' / 'Start new game'.
- Remove game: 'Remove {game} from your games? To play it again, upload its file.' Buttons 'Keep game' / 'Remove game'.
5. FIRST-RUN (FirstRunPanel): the button reads 'I know how to play: skip the tips', with no full stop.

**Acceptance**

CP (CP-1-13):
- Upload a .txt, a .game.md with no frontmatter, and one with a bad card line.
- Each toast matches the copy above, has no 'Error:', 'Failed' or 'Parser' prefix, and stays at least 10s.

CP (CP-1-17):
- confirm-delete-save, confirm-new-game and confirm-remove-game show the copy above.
- No dialog says 'Keep it' or 'for good'.

CP (CP-1-18):
- No user-facing string in these files ends in '...'.
- Every quote is curly.
- The first-run button has no full stop.

### DP-1-24 · Static pages, errors and the shipped game's metadata

- Area: pages (surfaces developer)
- Sources: CP-1-04, CP-1-18, CP-1-24
- Unit test: no
- Files: src/lib/components/StaticPage.svelte, src/lib/components/ErrorScreen.svelte, src/routes/game/custom/[slug]/+page.svelte, static/games/ghost-in-the-machine.game.md
- Recapture: page-404, page-game-not-found, page-custom-game-not-found, page-about, page-how-to, home, library-stories at iphone-13 and desktop

**Spec**

1. One home link everywhere: 'Back to home'. This covers StaticPage, ErrorScreen, 404, game-not-found and custom-game-not-found.
2. routes/game/custom/[slug]/+page.svelte: 'Loading the game…'.
3. static/games/ghost-in-the-machine.game.md frontmatter:
- title 'Locked in the Tech District'
- subtitle 'A grab-and-go turned mad dash for the gate'
Keep the slug. Run npm run -s generate:games-index, and commit index.json only if git tracks it. Update any test that asserts the old title.

**Acceptance**

CP (CP-1-04, CP-1-18):
- grep finds no 'Back to the console', 'Back to menu' or 'Loading custom game...'.
- page-404, page-game-not-found, page-custom-game-not-found, page-about and page-how-to show 'Back to home'.

CP (CP-1-24):
- Home, the library and the in-game header show 'Locked in the Tech District' and the new subtitle.

### DP-1-25 · Story Library and story mode: one noun, a consistent delete dialog, no Guest, room in landscape, 44px targets

- Area: story (surfaces developer)
- Sources: CP-1-21, CP-1-17, CP-1-04, CP-1-08, LR-1-09, LR-1-06
- Unit test: no
- Files: src/lib/components/BrowseGames.svelte, src/lib/components/StoryMode.svelte, src/lib/components/StoryRound.svelte, src/lib/components/story/StoryProgressBar.svelte, src/lib/components/story/StoryNavigation.svelte
- Recapture: library-empty, library-stories, library-card-menu, library-delete-confirm, story-round-1, story-round-2, story-last-round, story-end, story-end-loss, story-final-log at all six core viewports plus 750x342

**Spec**

1. BROWSEGAMES:
- Subtitle: 'Your finished games, in your own words.'
- Empty-state heading: 'No stories yet'. The body and the 'Choose a game' CTA stay.
- The back button is named 'Back to home'.
- Delete dialog: body '“{title}” ({outcome}, {date}) and its journal will be deleted. This can't be undone.' Buttons 'Keep story' / 'Delete story'.
- Failure notice: "That story couldn't be deleted. Try again."
2. STORYMODE: no player name in the header when it is empty or 'Guest' (case-insensitive).
3. LANDSCAPE (max-height 500px):
- .story-header padding-top 12px.
- The title is 1.75rem on one line (nowrap, ellipsis, the full title in a title attribute), in row 1 beside the back and AI buttons.
- Hide .progress-markers, as below 640px.
- Nav bar padding 8px; its buttons stay ≥44px.
4. TARGETS:
- StoryProgressBar .progress-marker: min-width 44px; height 44px.
- StoryRound .chip: min-height 44px.
5. SUITS: StoryRound's chips and prompts use SuitText (DP-1-16).

**Acceptance**

CP (CP-1-21, CP-1-17, CP-1-04):
- library-empty shows the new subtitle and heading.
- library-delete-confirm shows the new copy, with no bare 'Delete' and no 'for good'.
- The back button is named 'Back to home'.

CP (CP-1-08):
- No 'Guest' in any story-* header.

LR (LR-1-09):
- At 844x390 and 750x342, the round's card chips and the first two journal lines are visible above the nav bar in the first view.

LR (LR-1-06):
- smallTargets is empty in the story-* states at every touch viewport.

### DP-1-26 · Inter at two weights across the surfaces files

- Area: overlays (surfaces developer)
- Sources: VT-1-12
- Unit test: no
- Files: src/lib/components/ContentModal.svelte, src/lib/components/ConfirmModal.svelte, src/lib/components/settings/SettingsModal.svelte, src/lib/components/settings/AIProviderSection.svelte, src/lib/components/GameGuide.svelte, src/lib/components/AboutContent.svelte, src/lib/components/home/HomeHeader.svelte, src/lib/components/home/HomeGameCard.svelte, src/lib/components/home/Toast.svelte, src/lib/components/GameSelector.svelte, src/routes/+page.svelte, src/lib/components/BrowseGames.svelte, src/lib/components/browse/GameCard.svelte, src/lib/components/StoryMode.svelte, src/lib/components/StoryRound.svelte, src/lib/components/story/RoundStats.svelte, src/lib/components/story/GameOverMessage.svelte, src/lib/components/journal/AutoJournalTimer.svelte, src/lib/components/SignIn.svelte
- Recapture: Every surfaces state at iphone-13 and desktop (weights digest)

**Spec**

This is the surfaces half of VT-1-12; DP-1-14 is the board half.
- Inter appears at 400 (reading text) and 600 (labels, buttons, headings, values) only: 700 → 600 and 500 → 400. lixdu headings keep their own weight.
- Files: ContentModal (DONE and the danger buttons), ConfirmModal, SettingsModal, AIProviderSection, GameGuide, AboutContent, HomeHeader ('Dream Console'), HomeGameCard, Toast, GameSelector, src/routes/+page.svelte, BrowseGames, browse/GameCard, StoryMode, StoryRound, story/RoundStats, story/GameOverMessage, journal/AutoJournalTimer, SignIn.
- Several of these files are also in other items of yours: make this change in the same edits.

**Acceptance**

VT (VT-1-12): computed Inter weights ⊆ {400, 600} across the round-2 surfaces metrics.

## Declined

- **LR-1-16**: Contradicts an owner decision. In the Final round (ux-qa-review.md, the owner's HUD markup) the owner decided that the dice are thrown across the whole screen on top of the UI, then sink beneath the board after one beat. Bounding the dice world above the step slot would reverse that. The die covers the 'Rolling…' label only until it sinks, and after the roll the button and result line are in front of it.

## Coverage: every open finding and the items that carry it

| Finding | Items |
|---|---|
| OWN-1 | DP-1-01 |
| OWN-2 | DP-1-02 |
| GD-1-01 | DP-1-03, DP-1-06, DP-1-16, DP-1-20, DP-1-21 |
| GD-1-02 | DP-1-09 |
| GD-1-03 | DP-1-04 |
| GD-1-04 | DP-1-04 |
| GD-1-05 | DP-1-06 |
| GD-1-06 | DP-1-06 |
| GD-1-07 | DP-1-07 |
| GD-1-08 | DP-1-07, DP-1-17 |
| GD-1-09 | DP-1-05 |
| GD-1-10 | DP-1-05 |
| GD-1-11 | DP-1-05 |
| GD-1-12 | DP-1-06, DP-1-16 |
| GD-1-13 | DP-1-08 |
| GD-1-14 | DP-1-16 |
| GD-1-15 | DP-1-06 |
| GD-1-16 | DP-1-02 |
| GD-1-17 | DP-1-10 |
| GD-1-18 | DP-1-01 |
| GD-1-19 | DP-1-02 |
| GD-1-20 | DP-1-17, DP-1-18 |
| GD-1-21 | DP-1-16, DP-1-18 |
| GD-1-22 | DP-1-17 |
| VT-1-01 | DP-1-05 |
| VT-1-02 | DP-1-17 |
| VT-1-03 | DP-1-05 |
| VT-1-04 | DP-1-04 |
| VT-1-05 | DP-1-05 |
| VT-1-06 | DP-1-02 |
| VT-1-07 | DP-1-02, DP-1-18, DP-1-22 |
| VT-1-08 | DP-1-01 |
| VT-1-09 | DP-1-19 |
| VT-1-10 | DP-1-01, DP-1-05, DP-1-11, DP-1-17, DP-1-22 |
| VT-1-11 | DP-1-04, DP-1-11, DP-1-14, DP-1-16, DP-1-17, DP-1-19, DP-1-22 |
| VT-1-12 | DP-1-11, DP-1-14, DP-1-26 |
| VT-1-13 | DP-1-12 |
| VT-1-14 | DP-1-04, DP-1-09, DP-1-16, DP-1-17, DP-1-18, DP-1-22 |
| VT-1-15 | DP-1-02 |
| VT-1-16 | DP-1-04, DP-1-14 |
| VT-1-17 | DP-1-15, DP-1-16 |
| VT-1-18 | DP-1-22 |
| VT-1-19 | DP-1-20 |
| VT-1-20 | DP-1-17 |
| VT-1-21 | DP-1-11 |
| VT-1-22 | DP-1-10 |
| CP-1-01 | DP-1-07, DP-1-18 |
| CP-1-02 | DP-1-09 |
| CP-1-03 | DP-1-11, DP-1-22 |
| CP-1-04 | DP-1-11, DP-1-18, DP-1-20, DP-1-22, DP-1-24, DP-1-25 |
| CP-1-05 | DP-1-06, DP-1-07, DP-1-09, DP-1-18, DP-1-20 |
| CP-1-06 | DP-1-16 |
| CP-1-07 | DP-1-18 |
| CP-1-08 | DP-1-11, DP-1-18, DP-1-25 |
| CP-1-09 | DP-1-17 |
| CP-1-10 | DP-1-21 |
| CP-1-11 | DP-1-17, DP-1-18 |
| CP-1-12 | DP-1-03 |
| CP-1-13 | DP-1-23 |
| CP-1-14 | DP-1-17 |
| CP-1-15 | DP-1-20 |
| CP-1-16 | DP-1-03, DP-1-05, DP-1-07, DP-1-09, DP-1-20 |
| CP-1-17 | DP-1-23, DP-1-25 |
| CP-1-18 | DP-1-06, DP-1-23, DP-1-24 |
| CP-1-19 | DP-1-06, DP-1-09, DP-1-12, DP-1-18, DP-1-22 |
| CP-1-20 | DP-1-21 |
| CP-1-21 | DP-1-25 |
| CP-1-22 | DP-1-08, DP-1-16, DP-1-18 |
| CP-1-23 | DP-1-21 |
| CP-1-24 | DP-1-24 |
| LR-1-01 | DP-1-04 |
| LR-1-02 | DP-1-10 |
| LR-1-03 | DP-1-01 |
| LR-1-04 | DP-1-01, DP-1-02 |
| LR-1-05 | DP-1-05 |
| LR-1-06 | DP-1-05, DP-1-25 |
| LR-1-07 | DP-1-17 |
| LR-1-08 | DP-1-04 |
| LR-1-09 | DP-1-25 |
| LR-1-10 | DP-1-18 |
| LR-1-11 | DP-1-19 |
| LR-1-12 | DP-1-05 |
| LR-1-13 | DP-1-13 |
| LR-1-14 | DP-1-11 |
| LR-1-15 | DP-1-22 |
| LR-1-16 | declined |

## SuitText.svelte (the shared file, exact text)

```svelte
<script>
	/**
	 * SuitText - a line of text whose suit symbols (♠ ♥ ♦ ♣) are drawn with the HUD's own pip
	 * shapes (status/AcesCell.svelte) instead of a system fallback font (design polish VT-1-17).
	 * Each symbol becomes an inline SVG, 0.9em tall, in the text's colour, named for screen
	 * readers. Shared by the board (eyebrow, notices) and the card, journal, timeline and story.
	 */
	let { text = '' } = $props();

	const NAMES = { '♠': 'spades', '♥': 'hearts', '♦': 'diamonds', '♣': 'clubs' };
	const parts = $derived(
		String(text ?? '')
			.replace(/\uFE0E/gu, '')
			.split(/([♠♥♦♣])/u)
			.filter((part) => part !== '')
	);
</script>

{#each parts as part, index (index)}{#if NAMES[part]}<svg
			class="suit"
			viewBox="0 0 24 24"
			fill="currentColor"
			role="img"
			aria-label={NAMES[part]}
			>{#if part === '♥'}<path
					d="M12 20.5S3.5 14.6 3.5 9.1C3.5 6.3 5.6 4.25 8.1 4.25c1.75 0 3.1.95 3.9 2.35.8-1.4 2.15-2.35 3.9-2.35 2.5 0 4.6 2.05 4.6 4.85 0 5.5-8.5 11.4-8.5 11.4z"
				/>{:else if part === '♠'}<path
					d="M12 3c-2.4 3.4-8 6.9-8 11a3.9 3.9 0 0 0 7 2.35L9.8 20.75h4.4L13 16.35A3.9 3.9 0 0 0 20 14c0-4.1-5.6-7.6-8-11z"
				/>{:else if part === '♦'}<path d="M12 2.75 19 12l-7 9.25L5 12z" />{:else}<circle
					cx="12"
					cy="7.25"
					r="4.1"
				/><circle cx="7.1" cy="13.6" r="4.1" /><circle cx="16.9" cy="13.6" r="4.1" /><path
					d="M12 10.5 14.4 20.75H9.6z"
				/>{/if}</svg
		>{:else}{part}{/if}{/each}

<style>
	.suit {
		display: inline-block;
		width: 0.9em;
		height: 0.9em;
		vertical-align: -0.1em;
	}
</style>
```
