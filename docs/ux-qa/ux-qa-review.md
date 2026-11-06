# UX and visual QA review

A critical review of every part of the app's UX, with recommendations. This is a working
document: it is committed and pushed after each section so that work survives a container
restart. Branch: `claude/vibrant-curie-w9bn88`.

## Status

- Started: 2026-11-06, against `main` at 17b967d (PR #50 merged).
- Current phase: broad review (coverage items 2 onward).
- Last section completed: Reported bug (Lucid/Surreal extra click).

## How to resume after a restart

1. `git fetch origin claude/vibrant-curie-w9bn88 && git checkout claude/vibrant-curie-w9bn88`.
2. Read **Status** and the **Coverage** checklist below. Continue with the first unchecked item.
3. Screenshots and videos are not committed. Re-capture what you need; the **Method** section
   says how.

## Method

**Evidence root** (not committed):
`/tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/ux-qa/`.
Findings cite files relative to it, for example `lucid/keys-desktop-lucid/shots/15-…png`.

**Servers.**

- Dev server for state forcing: `npx vite dev --port 5173 --strictPort` (run in the background,
  log in `ux-qa/dev.log`).
- Production build for timing-faithful animation capture: `npm run build && npx vite preview
--port 4173 --strictPort`.

**Browser.** Playwright Chromium at `/opt/pw-browsers/chromium` with `--no-sandbox
--headless=new --use-angle=swiftshader`, deviceScaleFactor 1. All scripts share `ux-qa/lib.cjs`,
which:

- serves augmented-ui from `node_modules` (unpkg is blocked), so clipped frames render as
  designed;
- aborts Google Fonts requests;
- sets `dc-solo-rpg:instructions-seen=true` unless a run tests the first-time path.

**Viewports** (`lib.cjs` `VIEWPORTS`): `desktop` 1280x800, `d1440` 1440x900, `d1280x720`,
`ipad` (iPad gen 7, 810x1080, touch), `iphone13` (390x664, touch), `small` 360x640 (touch),
`landscape` (iPhone 13 landscape, 750x342).

**Forcing states** (dev server only). `store(page, src)` in `lib.cjs` runs code with the live
modules: `gs` (gameStore), `rnd` (random service) and `acts` (gameActions). For example
`gs.gameState.isLucid = true`, or `rnd.mockDieRoll(20)` before a roll (it sticks until
`rnd.resetRNG()`). `snap(page)` returns the state, the visible buttons (`[x]` = disabled), the
state chip, the rule caption, the result line and the card stage.

**Scripts** (all in `ux-qa/`):

- `lucid-matrix.cjs <scenario> <vp> <lucid|surreal>`: drives a game with one input method,
  forces the modifier at a chosen step, and logs every action, what changed, and any action that
  had no effect (`log.jsonl`, `shots/`, `video/`). Scenarios: `click`, `keys`, `tap`, `touch`,
  `dbl`, `auto`, `draw`, `journal`, `easy`, `captions`.
- `caption-geometry.cjs <vp> <20|1>`: first-time path with captions on; rolls a real natural 20
  or 1 on Roll for Tasks, then reports what sits on top of the primary button.
- `lucid-persist.cjs carry|resume`: the modifier across a new game and across save and resume.
- `dice-timing.cjs` + `settle.py`: calls `rollDice()` directly, 1d20 against 2d20, with a red
  marker frame before each throw, then measures from the video when the dice stop moving
  against when the promise resolves (when the button wakes).
- `midroll-resize.cjs`: checks for HUD or dice-world resizes during a Lucid roll.
- `sheet.py`: contact sheets from extracted frames.

**Fonts.** Inter renders (installed locally). Orbitron and Share Tech Mono do NOT: Google Fonts
is blocked and neither is installed, so HUD mono text falls back to DejaVu Sans Mono and any
Orbitron text to the next fallback. The display font (lixdu) is self-hosted and renders.
Typography findings about mono and Orbitron text are caveated.

**Dice timings.** swiftshader renders WebGL in software, so absolute dice durations are slower
than on real hardware. Ratios and dead time are still meaningful.

## Severity scale

- **S1 Blocker**: stops play, loses work, or misleads the player about the rules.
- **S2 Major**: clearly hurts the experience or looks broken; most players will notice.
- **S3 Minor**: rough edge that a careful player notices.
- **S4 Polish**: would lift the game from good to award-worthy.

## Coverage

Tick an item only when its findings are written below.

- [x] Reported bug: an extra confirmation click when the player is Lucid or Surreal
- [ ] Home: splash, instructions choice, game selector, game cards, saved-game continue and delete
- [ ] Header and menus (desktop and phone), About, Help, Settings (every control), dice theme picker
- [ ] Static pages: /about, /how-to, /signin
- [ ] Game start: loading, intro, opening instability roll
- [ ] Round flow: start round, roll for tasks, draw card, card reveal and dismiss
- [ ] Stability check, Salvation check, Lucid and Surreal, skip-damage and return-king cards
- [ ] HUD: desktop panels and the phone compact HUD, every tier and state change
- [ ] Rule captions and keyboard hint
- [ ] Journal: entry, prompts, save beat, audio record and playback, auto-journal timer, TTS
- [ ] Endings: win, loss by Kings, loss by Stability, final log, epitaph, run recap
- [ ] Story Library and story mode (browse, read, navigate, generated story)
- [ ] Auto-play, keyboard-only play, screen reader announcements, reduced motion
- [ ] Every animation and transition (timing, easing, jank, layering, consistency)
- [ ] Viewports: 1440x900, 1280x720, tablet, iPhone 13, small phone (360x640), landscape phone

## Findings

### 1. Reported bug: an extra click when Lucid or Surreal

**Result.** No step needs an extra click in Chromium in any of the 14 runs below: every action
changed the screen (`noEffect: 0` in each `log.jsonl`). The reported "extra confirmation" is,
with high confidence, LS-01: while the player is Lucid or Surreal, every step button gets a
bordered pill above it ("LUCID roll two dice, keep the higher"), including the three or four
buttons that do not roll. Above "Continue", the pill reads as a prompt that the button
confirms. LS-02 makes this worse: the modifier survives into the next game, where the pill sits
over one-die steps it does not apply to. Five more Lucid/Surreal defects turned up on the way
(LS-03 to LS-07).

**What was tried** (each with the modifier forced at the step shown, or gained through a real
natural 20 or 1 from `mockDieRoll`):

| Run (`lucid/…`)          | Input                            | Viewport              | Forced at                             | Extra click?          |
| ------------------------ | -------------------------------- | --------------------- | ------------------------------------- | --------------------- |
| `keys-desktop-lucid`     | Space/Enter only                 | 1280x800              | Roll for Tasks, then a real nat 20    | No                    |
| `dbl-desktop-lucid`      | clicks, repeated during the roll | 1280x800              | after the roll; journal, next round   | No (LS-06)            |
| `auto-desktop-lucid`     | header Auto-Play toggle          | 1280x800              | Roll for Tasks                        | No (LS-07)            |
| `touch-iphone13-lucid`   | `tap()` touch events             | iPhone 13             | Roll for Tasks                        | No                    |
| `touch-ipad-surreal`     | `tap()` touch events             | iPad                  | Roll for Tasks                        | No                    |
| `captions-{vp}-{20,1}`   | click, captions on               | all 7 viewports       | real nat 20 / nat 1 on Roll for Tasks | No (landscape: VP-01) |
| `persist-carry-desktop`  | exit, then a new game            | 1280x800              | Roll for Tasks                        | LS-02                 |
| `persist-resume-desktop` | save, reload, resume             | 1280x800              | Roll for Tasks                        | LS-04                 |
| `dice-timing/desktop`    | `rollDice()` 1d20 vs 2d20 x4     | 1280x800              | n/a                                   | LS-05                 |
| `midroll-resize.cjs`     | click                            | desktop, iPad, iPhone | Roll for Tasks                        | No                    |

Also checked and ruled out:

- **The rule caption covering the button.** It sits at the top of the table and never overlaps
  the button, except in landscape, where the button is off screen anyway (VP-01).
- **A HUD or dice-world resize mid-throw.** Using the modifier removes the "LUCID: next roll…"
  line from the Last Roll panel, but the HUD row keeps its height (130px desktop, 240px iPad,
  64px phone), and no `resize` event fires during the roll.
- **The dice overlay eating clicks.** It has `pointer-events: none`.
- **Card dismissal, the journal and the next round while Lucid.** Each needs exactly the same
  input as without the modifier.

Not tried: a real iPhone. iOS Safari swallows the first tap when a tap changes visible content
on hover, and emulated Chromium cannot reproduce that. LS-01's pill is not a hover effect, so
it is unlikely, but this is the one path no capture here covers.

#### LS-01 · S2 · The Lucid/Surreal pill turns every step into a pseudo-confirmation

- **Surface, viewport:** every round step, all viewports.
- **What happens:** `StepAction` shows the pill whenever `isLucid` or `isSurreal` is set,
  whatever the button does. After a natural 20 on a Stability check, the screen shows the same
  fact four times: the result line ("…Lucid: your next roll keeps the higher of two dice"), the
  pill, the HUD badge ("LUCID: NEXT ROLL HIGH OF 2D20") and, the first time, a RULE caption.
  The pill sits directly above CONTINUE, so the button reads as "confirm Lucid"
  (`lucid/keys-desktop-lucid/shots/15-13-failureCheck-after.png`). It then rides along on
  every step button until the next roll: Continue, (card), Begin Round N, Draw N Cards, and only
  then the roll (`dbl-desktop-lucid/log.jsonl` t=38.9 to 41.1: "BEGIN ROUND 2" and "ROLL DICE"
  both carry it). Each of those presses looks as if it confirms the modifier, and none of them
  uses it.
- **Why it matters:** the player reads extra confirmations into the flow, and the one press that
  does use the modifier looks no different from the presses before it.
- **Recommendation (redesign):** show the modifier on the roll button only, and in its label:
  "Roll · Lucid: 2 dice, keep high" or "Roll for damage · Surreal: 2 dice, keep low". Keep the
  HUD badge as the persistent reminder. Drop the pill from Continue, Begin Round and Draw. In
  the result line of the roll that used the modifier, add "(high of 17, 4)" (see LS-03).
- **Effort:** S. `src/lib/components/game/StepAction.svelte:17-23` (add a `rolls` prop that only
  the roll states pass, or move the text into the button label from the composables).

#### LS-02 · S1 · Lucid/Surreal carries into the next game and the opening roll ignores it

- **Surface, viewport:** game start; all viewports.
- **Repro:** be Lucid or Surreal (natural 20 or 1, or end a game on one, for example a natural 20
  Salvation win). Exit with X, then Exit Game, or use Restart from the final log. Start any game.
- **What happens:** the new game starts with the modifier. The pill says "LUCID roll two dice,
  keep the higher" over "Roll for instability", one die is thrown, and the pill is still there
  over CONTINUE and Begin Round 1. The modifier is only used on Roll for Tasks
  (`lucid/persist-carry-desktop/05-new-game-initial-roll.png`,
  `06-new-game-after-initial-roll.png`: one die, "Rolled 19", pill still up).
- **Root cause:**
  - `initializeGame` (`src/lib/stores/gameInit.js:76-102`) never resets `isLucid`,
    `isSurreal` or `pendingUpdates`. `exitGame` (`gameActions.svelte.js:1050`) doesn't either.
    Navigation home and back is client-side, so the module state survives.
  - The opening roll calls `rollDie(20)` directly
    (`src/lib/composables/screen/useInitialDamage.svelte.js:41`), not
    `gameState.rollWithModifiers()`, so it never consumes the modifier.
- **Why it matters:** it misleads the player about a rule (two dice promised, one thrown), and it
  is the clearest "extra confirmation under Lucid" path in the build: two extra presses under a
  stale modifier.
- **Recommendation:** reset `isLucid: false, isSurreal: false` and every `pendingUpdates` field
  in `initializeGame`. The opening roll is a fresh start, so it should not take a modifier from
  anything; with the reset in place it never sees one.
- **Effort:** S.

#### LS-03 · S2 · Two dice are thrown but nothing says which one counted

- **Surface, viewport:** every Lucid/Surreal roll, all viewports.
- **What happens:** the HUD caption meant to say "(high of 15, 6)" never renders, and the result
  line says only "Rolled 19 · Draw 5 cards". The player watches two dice land on, say, 19 and 5,
  and gets one number with no explanation.
- **Root cause:** `rollDice` reads `result.rolls`
  (`src/lib/stores/diceStore.svelte.js:241`), but dice-box-threejs returns the dice under
  `result.sets[0].rolls`. The fallback stores `[result.total]`, the sum of both dice:
  `lastRoll.rolls` was `[24]`, `[32]` and `[40]` in `keys-desktop-lucid` and `captions-small-20`.
  `describeTwoDiceRoll` (`src/lib/components/status/hudTiers.js:27`) then returns null.
  `finalValue` is also the sum (line 243).
- **Recommendation:** read `result.sets.flatMap((s) => s.rolls.map((r) => r.value))`. Add the
  kept die to the result line for any 2d20 roll: "Rolled 19 (high of 19, 5) · Draw 5 cards".
  Add a unit test against the real dice-box result shape.
- **Effort:** S.

#### LS-04 · S1 · Save and resume drops Lucid, Surreal and the Aces count

- **Surface, viewport:** saved-game resume; all viewports.
- **What happens:** resumed while Lucid, the game comes back with `isLucid: false`
  (`persist-resume-desktop`, RESUMED snapshot). Worse, `acesRevealed` comes back as 0. Repro
  (`resume-aces.cjs`, shots in `resume-aces/`): save with the Ace of Hearts plus one more Ace
  (2 Aces, so 14+ should succeed), reload, resume, reach Salvation. The button says "ROLL TO
  REMOVE A TOKEN · NEED 17+" (it clamps to one Ace), and a roll of 15 reads "Rolled 15 · needed
  20+ · +1 token · 11 left". Two different wrong thresholds are on screen at once, and only a
  natural 20 can ever succeed again (`getSalvationThreshold(0)` returns 20).
- **Root cause:** `getSerializableState` and `restoreGameState`
  (`src/lib/stores/indexedDBStorage.js:114-195`, `462-497`) omit `isLucid`, `isSurreal`,
  `acesRevealed` and `pendingUpdates`.
- **Recommendation:** save and restore all four. Bump `SAVE_VERSION`, or derive `acesRevealed`
  from the log when an old save has none.
- **Effort:** S.

#### LS-05 · S3 · The button stays asleep for about a second after the dice stop

- **Surface, viewport:** every roll; worst with two dice.
- **What happens:** in `lucid/dbl-desktop-lucid/sheet-lucid-roll.png` the two dice are still
  from +1.6s, but ROLL DICE stays disabled until +3.4s. Across 8 direct rolls
  (`dice-timing/desktop/results.json`), the throw took 3.0–4.1s for 1d20 and 3.7–5.5s for
  2d20 under swiftshader, and the dice stopped visibly moving 0.7–1.1s before the promise
  resolved. A player taps the moment the dice look still, the tap hits a disabled button and
  nothing happens. That reads as "it needs another click", and it lands more often on the
  longer two-dice roll.
- **Recommendation:** resolve as soon as every die is at rest (an angular-velocity threshold, or
  the dice-box `rollComplete` event at most 300ms after the last collision). Accept a tap while
  rolling as "skip to result": snap the dice to their faces and show the result line. Never
  ignore a tap in silence; at minimum show a pressed state.
- **Effort:** M. `src/lib/stores/diceStore.svelte.js:233`, and the composables' `rolling` guard.

#### LS-06 · S3 · A tap during the roll can skip the result it was waiting for

- **Surface, viewport:** Roll for Tasks and the checks; all viewports.
- **What happens:** in `dbl-desktop-lucid/log.jsonl` t=41.8 to 44.5, taps during the two-dice
  roll were swallowed, but the one at +3.0s landed the instant the button woke as "DRAW 5
  CARDS". The game moved straight into the card draw, and the result line was never on screen.
- **Recommendation:** ignore input for 400ms after a button changes meaning (Roll becoming
  Continue), and give the change a 150ms highlight so the new label is noticed.
- **Effort:** S.

#### LS-07 · S2 · Turning Auto-Play on does nothing until the player clicks once more

- **Surface, viewport:** header Auto-Play toggle; all viewports.
- **What happens:** toggled on at "Roll for instability", nothing happens for 50s
  (`auto.out`, first run). Auto-play only arms on the next screen entry, so the player must
  press the step button once by hand. After that, a full Lucid round ran with no input.
- **Root cause:** `toggleAutoPlay` (`src/lib/components/status/PlayerInfoBar.svelte:59`) only
  updates settings. `triggerAutoPlayForCurrentScreen` runs only from `handleScreenEntry`
  (`src/lib/components/GameScreen.svelte:400`) and from roll completions.
- **Recommendation:** when Auto-Play is switched on, arm the current step at once (export a
  `rearmAutoPlay()` from GameScreen, or watch the setting). When it is switched off, cancel the
  pending timer.
- **Effort:** S.

## Animation inventory

_Every animation in the app: where, trigger, duration and easing, verdict (keep, tune, simplify,
redesign, remove) and why._

## Recommendations

_Prioritised plan, written last: what to fix first and how._
