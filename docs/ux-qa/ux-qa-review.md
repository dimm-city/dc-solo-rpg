# UX and visual QA review

A critical review of every part of the app's UX, with recommendations. This is a working
document: it is committed and pushed after each section so that work survives a container
restart. Branch: `claude/vibrant-curie-w9bn88`.

## Status

- Started: 2026-11-06, against `main` at 17b967d (PR #50 merged).
- Current phase: fix round complete and merged (see **Fix round**); owner decisions pending.
- Last section completed: Recommendations (all coverage items done).

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
- `playthrough.cjs <label> desktop|mobile` (a copy of the e2e tool, writing to
  `ux-qa/playthrough/`) plus `animations.py` (10fps sheets, 4s per action): full games on the
  production build (`pt-desktop`: 14 rounds, loss by Kings; `pt-mobile`).
- `tour.cjs <vp>` (production build): splash, instructions choice, home, menu, every modal
  scrolled to the end, Story Library, /about, /how-to, /signin and two error pages.
- `delete-modal.cjs`, `endings.cjs win|kings|stability <vp> [reduced]`, `checks.cjs` (return-king,
  skip-damage, 4 Aces, natural 1 on Salvation, Stability tiers), `journal.cjs` (fake microphone
  via `--use-fake-device-for-media-stream`), `story.cjs` (writes a 5-round completed game through
  the store), `a11y.cjs` (tab order, focus rings, accessible names, reduced motion),
  `viewports.cjs <vp>` (fit checks), `step-swap.cjs` and `probe-hint.cjs` (rAF and layout
  probes), `resume-aces.cjs`.
- `insert.py` and `commit.sh`: add a section to this document and push it (prettier, then
  commit only this file, then push with 2/4/8/16s retries).

**Timing caveat for the playthrough sheets.** The logged action time is taken before
Playwright's actionability wait, so sheet offsets can be 0.3–0.5s early. Running two browsers at
once (as during the mobile playthrough) slows everything; durations in findings come from code
or from single-browser rAF probes.

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
- [x] Home: splash, instructions choice, game selector, game cards, saved-game continue and delete
- [x] Header and menus (desktop and phone), About, Help, Settings (every control), dice theme picker
- [x] Static pages: /about, /how-to, /signin
- [x] Game start: loading, intro, opening instability roll
- [x] Round flow: start round, roll for tasks, draw card, card reveal and dismiss
- [x] Stability check, Salvation check, Lucid and Surreal, skip-damage and return-king cards
- [x] HUD: desktop panels and the phone compact HUD, every tier and state change
- [x] Rule captions and keyboard hint
- [x] Journal: entry, prompts, save beat, audio record and playback, auto-journal timer, TTS
- [x] Endings: win, loss by Kings, loss by Stability, final log, epitaph, run recap
- [x] Story Library and story mode (browse, read, navigate, generated story)
- [x] Auto-play, keyboard-only play, screen reader announcements, reduced motion
- [x] Every animation and transition (timing, easing, jank, layering, consistency)
- [x] Viewports: 1440x900, 1280x720, tablet, iPhone 13, small phone (360x640), landscape phone

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

### 2. Home: splash, instructions choice, game selector, saved games

Evidence: `tour/d1440/` and `tour/iphone13/` (production build), `tour/delete-*/`,
`tour/sheet-delete-exit.png`.

#### HM-01 · S2 · Home is two small tiles in the corner of an empty page

- **Viewport:** desktop and tablet.
- **What happens:** at 1440x900 the two game cards sit in the top-left 900x280px. The rest is
  an empty grid (`tour/d1440/06-home.png`). There is no pitch, no art and no sense of what a
  session is. This was visual-design v2 F1, and it is still open.
- **Why it matters:** this is the first screen after the splash, and it says "prototype".
- **Recommendation (redesign):** a centred column (max 960px) with a one-line pitch ("A solo
  journaling game. Draw, roll, write."). Under it, a 2-up grid of cards, each with a key-art
  band (duotone, 16:9), title, the game's own subtitle, "about 30 minutes", and a labelled
  primary button. Keep the clipped frames.
- **Effort:** M (art needed: one image per game).

#### HM-02 · S2 · Play, resume and delete are bare icons, and a saved game blocks a new one

- **Viewport:** all.
- **What happens:**
  - Each card has a 48px icon-only play button. A saved game shows a yellow play icon plus a
    red trash can, and nothing else (`tour/delete-d1440/01-home-with-save.png`).
  - The save's round, Stability and date are never shown, although `getSaveMetadata` is already
    loaded for each card.
  - With a save, there is no way to start a fresh game except deleting the save first.
- **Recommendation (redesign):**
  - With no save: a text button, "Play".
  - With a save: a primary "Continue · Round 3 · 2 h ago", a secondary "New game" that confirms
    the overwrite, and "Delete save" as a small text link.
- **Effort:** S. `src/routes/+page.svelte:858-930`.

#### HM-03 · S3 · Cards are uneven, and one has a placeholder subtitle

- **What happens:** titles wrap to 2 and 3 lines, so the cards are 240px and 270px tall and the
  play buttons sit at y=327 and y=358 (`tour/d1440/06-home.png`). "Locked In the Tech District"
  shows "Begin your adventure": the subtitles come from a hard-coded map
  (`src/routes/+page.svelte:376`) that only knows retired slugs.
- **Recommendation:** read the subtitle from the game's frontmatter. Give cards a fixed title
  block (3 lines) and pin actions to the card bottom (`margin-top: auto`).
- **Effort:** S.

#### HM-04 · S3 · The splash is long, unskippable, off-brand and overlaps the next screen

- **What happens:**
  - 2.5s of splash, then an 850ms wait, then a 600ms fade before anything is usable: about 4s
    on every new browser session (`Splash.svelte:53`, `+page.svelte:272`). No tap or key skips
    it.
  - The status line cycles through 13 phrases at 375ms each (`Splash.svelte:36`), too fast to
    read one.
  - The splash says "DIMM CITY / Dream Console", the header says "DREAM CONSOLE" and /about
    says "Dimm City Solo RPG": three names.
  - The splash's own 800ms `transition:fade` starts only after `isVisible` flips at 850ms, so it
    is still fading while the choice screen fades in. On iPhone a faint "DIMM" sits behind the
    first card (`tour/iphone13/05-instructions-choice.png`).
- **Recommendation (simplify):** 1.2s total. One phrase, then fade out over 300ms, and unmount
  before the next screen fades in. Any tap or key skips it. Show it once per install
  (localStorage), not per session. Pick one product name.
- **Effort:** S.

#### HM-05 · S2 · The first-time choice hides an option and sends beginners to the wrong rules

- **What happens:**
  - Three 270px-tall cards are stacked vertically. At 1440x900 the third ("Skip Always") is
    below the fold (`tour/d1440/05-instructions-choice.png`).
  - The recommended choice, "Learn How to Play", goes to /how-to, which teaches out-of-date
    rules (ST-01).
  - The game already teaches through play with rule captions, so the choice is mostly
    friction.
- **Recommendation (redesign):** one compact panel.
  - Primary: "Play. The game teaches you as you go."
  - Secondary: "Read the rules first", which opens the Game Guide (Help modal).
  - Text link: "I know how to play: don't show tips."
- **Effort:** S.

#### HM-06 · S3 · On desktop the whole navigation is one hamburger in the far corner

- **What happens:** the inline header buttons exist but are hard-hidden with
  `style="display: none;"` (`src/routes/+page.svelte:504`). At 1440px, Story Library, Settings
  and Help live behind a 24px hamburger at the top-right (`tour/d1440/07-menu-open.png`).
- **Recommendation:** at 900px and up, show the header actions inline with text labels
  ("Stories", "Settings", "Help"), and keep the hamburger for phones.
- **Effort:** S.

#### HM-07 · S3 · Delete confirmation styles the destructive action like a primary CTA

- **What happens:** DELETE uses the same pink-to-orange gradient as other CTAs, the copy repeats
  itself ("permanently delete… This cannot be undone"), and the "Saved game deleted" banner is
  inserted above the grid, pushing the cards down (`tour/sheet-delete-exit.png`).
- **Recommendation:** an outlined red destructive button, and copy that names what is lost:
  "Delete your Future Lost save (Round 3)? This can't be undone." Show the result as an overlay
  toast (fixed, bottom-centre, 3s), not an inline banner.
- **Effort:** S.

### 3. Header, menus and modals

Evidence: `tour/*/07-…` to `24-…`, `lucid/captions-iphone13-1/02-lucid-caption-up.png`.

#### MN-01 · S2 · The Help modal states the Lucid/Surreal rule wrongly

- **What happens:** the Game Guide says "A natural 20 on a Stability check makes you Lucid"
  (`src/lib/components/HelpModal.svelte:128`). In play, any natural 20 or 1 does it: Roll for
  Tasks, Salvation and the opening roll too (`gameActions.svelte.js:142-150, 765-770, 941-947`).
- **Recommendation:** "Any natural 20 makes you Lucid; any natural 1 makes you Surreal."
- **Effort:** S.

#### MN-02 · S3 · The Exit Game dialog says progress will be lost; it isn't

- **What happens:** "Your current game progress will be lost and you'll return to the options
  screen" (`GameScreen.svelte:784`). The save is kept (resume works), and there is no options
  screen. "CONTINUE PLAYING" wraps to two lines at 1280px (`tour/sheet-delete-exit.png`).
- **Recommendation:** "Leave the game? Your progress is saved. Continue it from the home
  screen." Buttons: "Keep playing" and "Leave".
- **Effort:** S.

#### MN-03 · S3 · Four modal families with different footers and close buttons

- **What happens:** Settings and About end in "DONE ✓", Help in "GOT IT ✓", and the dice picker
  in a pill-shaped "CLOSE" with a different frame, title size and close glyph. The dice picker is
  its own modal, not `ContentModal`. Its close X is 37x40px on desktop and 26x44px on phone.
- **Recommendation:** build every modal on `ContentModal`, with one footer button ("Done") and
  a 44x44px close target.
- **Effort:** S.

#### MN-04 · S3 · Settings is a 2.5-screen scroll with the presets at the bottom

- **What happens:** 13 controls in 5 sections, 1588px tall on desktop and 1906px on phone. The
  "Quick presets" (Full auto-play, Audio only, Turn all off) are what most players want, and
  they come last, below the toggles they overwrite.
- **Recommendation (simplify):** open with Difficulty and a 3-way segmented "Play mode" (Manual,
  Read aloud, Hands-free). Fold delay, journaling, voice provider and voice under "Advanced".
- **Effort:** M.

#### MN-05 · S3 · The dice theme picker shows no dice and lists white twice

- **What happens:** eight text tiles with no preview, and "Default (White)" next to "White"
  (`DiceThemes.js:11-17`). The title wraps ("SELECT DICE / THEME").
- **Recommendation:** a 64px static render of a d20 per theme, one white option, title "Dice".
- **Effort:** M (render the images once).

#### MN-06 · S3 · The in-game header is a row of unlabelled icons

- **What happens:** desktop shows X, ?, gear, then dice, a play triangle and a waveform. Phone
  shows six icons around "1 ROUND". The play triangle means Auto-Play and the waveform means
  read-aloud, and on/off is a colour change only. `title` tooltips don't exist on touch. The
  phone header drops the game's title.
- **Recommendation:** on desktop, put a 10px label under each icon ("AUTO", "VOICE"), and show
  the on state as filled plus the label in cyan. On phone, keep X, Help and one "⋯" menu, which
  holds the rest with labels.
- **Effort:** S–M.

#### MN-07 · S4 · The display font is used below its legible size

- **What happens:** lixdu (the house display face) is set at 14–20px on modal titles,
  buttons and labels: "GAME SETTINGS", "SIGN IN WITH GOOGLE", the Story Library's "START A NEW
  GAME". At those sizes its M, K and W are hard to tell apart. The house rule (display
  font for titles of 24px and up) is broken.
- **Recommendation:** Inter 600, uppercase, 0.08em tracking for every button and every title
  under 28px. Keep lixdu for screen titles only.
- **Effort:** S.

### 4. Static pages: /about, /how-to, /signin, error pages

Evidence: `tour/*/25-…` to `30-…`, `tour/d1440-sheet-pages.png`.

#### ST-01 · S1 · /how-to teaches the wrong rules, to the wrong audience

- **What happens:** the page is SRD text for game designers, from the d6 era. It says players
  "earn a success token", calls Stability a "health meter", says "the success cards of the other
  topics give some bonus" and "this may come with a final roll", and advises that tokens "can be
  anything physical". It contradicts the in-game Game Guide on every mechanic. It is where
  "Learn How to Play (Recommended for first-time players)" sends new players.
- **Recommendation (remove):** replace the page body with the Game Guide. Extract
  `GameGuide.svelte` from `HelpModal.svelte` and render it in both places, so there is one
  source of rules.
- **Effort:** S. `src/routes/how-to/+page.svelte`.

#### ST-02 · S3 · /about contradicts the About modal

- **What happens:** the page calls the product "Dimm City Solo RPG"; the modal calls it "Dream
  Console". The page uses generic copy ("a thrilling adventure"), with 600px of text in 1110px
  cards, so the right half of each card is empty.
- **Recommendation:** render the About modal's content as the page, in a 720px column, under one
  name.
- **Effort:** S.

#### ST-03 · S3 · /signin is a dead end while sign-in is off

- **What happens:** with `REQUIRE_SIGN_IN = false` (`src/hooks.server.js:8`), /signin still
  says "SIGN IN REQUIRED" and offers a Google button with no OAuth client behind it. There is no
  link back to the games.
- **Recommendation:** redirect /signin to / while sign-in is off.
- **Effort:** S.

#### ST-04 · S3 · Error pages are off-theme, and the 404 title overflows on phones

- **What happens:**
  - The 404 page has a green title, a red "Not Found" and a grey "Error code: 404".
  - At 390px, "OOPS! SOMETHING WENT WRONG" is clipped at both edges
    (`tour/iphone13/29-page-nope-404.png`).
  - The game-not-found page has a flat grey background, says the same thing twice, and uses an
    off-palette orange gradient button.
- **Recommendation:** one themed error layout. The title "Signal lost" at
  `clamp(1.5rem, 8vw, 3rem)`, one sentence, and a "Back to the console" button.
- **Effort:** S.

#### ST-05 · S4 · Every page has the same tab title

- **What happens:** `<title>` is "Dream Console" on every route, including inside a game.
- **Recommendation:** "Future Lost · Dream Console", "Story Library · Dream Console", and so on.
- **Effort:** S.

### 5. Game start: loading, intro, opening instability roll

Evidence: `playthrough/pt-desktop/` (production build, 1440x900) and `playthrough/pt-mobile/`
(iPhone 13), with `playthrough/sheet-start.png` and `sheet-mobile-start.png`.

#### GS-01 · S3 · Four presses and about 20 seconds from Play to the first card

- **What happens:** Play (t=12.0s), Begin Your Journey (14.6), Roll for Instability (17.1),
  Continue (21.0), Begin Round 1 (23.3), Roll Dice (25.5), first card on screen at about 33s
  (`playthrough/pt-desktop/timeline.json`). "Round 1 · A new chapter begins. Prepare yourself
  for what lies ahead." is a whole step with its own button, and it comes back every round.
- **Recommendation (simplify):** delete the Begin Round step. Make "Round N" the title of the
  Roll for Tasks screen. That saves one press per round, about 14 per game. Keep the opening
  instability roll: it teaches the Stability table on a roll that cannot hurt much.
- **Effort:** S. `StartRoundController.svelte`, `transitions.js`.

#### GS-02 · S3 · The intro is a document with a gap, cut off on phones

- **What happens:** on desktop the intro text ends at 45% of the height, then there is an empty
  gap, then a button pinned to the bottom (`sheet-start.png`, frame 2). On iPhone, the text runs
  under the button with no cue that it scrolls ("…and return home. But in this dark future,
  every" is cut, `pt-mobile/shots/007`). The headings are lixdu yellow at 20–24px. Nothing at
  the end says what winning means.
- **Recommendation:** centre the column vertically, add a 24px fade mask and a "scroll" chevron
  when it overflows, and end on one plain line: "Hold on to your Stability. Find the Ace of
  Hearts. Clear 10 tokens to escape."
- **Effort:** S. `GameScreen.svelte` (`.intro-story-container`).

#### GS-03 · S3 · While the die is rolling, the button already says "Continue"

- **What happens:** on the instability, Stability and Salvation steps, the label switches to
  "CONTINUE" (disabled) the moment Roll is pressed, before the result exists (`sheet-start.png`,
  frame 4; `checks/desktop-teach/` frame 4). Roll for Tasks keeps "ROLL DICE" (disabled)
  instead. The cause is that the label derives from the stored result, which is set before the
  animation: `useInitialDamage.svelte.js:72`, `useFailureCheck.svelte.js:74`,
  `useSuccessCheck.svelte.js:73`.
- **Recommendation:** label "Rolling…" while `rolling` is true on every step, then the post-roll
  label.
- **Effort:** S.

### 6. Round flow: roll for tasks, draw, card reveal and dismiss

Evidence: `playthrough/pt-desktop/timeline.json` (14 rounds), `playthrough/sheet-round.png`,
`checks/desktop-teach/`, `lucid/captions-iphone13-1/`.

#### RF-01 · S2 · A round is about 40 seconds of mostly mechanical presses

- **What happens:** over 14 rounds on desktop, each round took 21–53s (median about 40s), with
  4–11 button presses plus 3–11 card or table taps. The script tapped the table 74 times
  because no enabled button had been visible for a second: every roll locks input for 3–4s
  (under swiftshader). A typical round: Begin Round, Roll, Draw N, N card taps, Roll plus
  Continue for each odd card, Roll plus Continue for Salvation, Record Entry. That is 13–16
  inputs, most of them confirmations of something the game already decided.
- **Why it matters:** in Wretched and Alone the ritual is drawing and writing. Here the
  confirmations crowd out both, and dread decays into clicking.
- **Recommendation (simplify), target 8 inputs and 25s per round or less:**
  1. Remove Begin Round (GS-01).
  2. Start dealing on its own 1.2s after the Roll for Tasks result, keeping "Rolled 17 · 5
     cards" in the card overlay's header. One press fewer.
  3. Let a tap during a roll snap the dice to their faces (LS-05).
  4. Dismiss cards in 300ms, not 600 (see the Animation inventory).
- **Effort:** M.

#### RF-02 · S2 · The dice come to rest on top of the result line

- **What happens:** the throw area is the whole table, and the result line sits at 45% height,
  so the die often lands on it. On iPhone: "Surreal: your next roll keeps the low[die]ice"
  (`lucid/captions-iphone13-1/02-lucid-caption-up.png`). On desktop: "Natural 1 · +2 tokens · 6
  left · Surreal: your next roll k[die]" (`checks/desktop-teach/09-salvation-nat1.png`). The
  dice stay up for 750ms after the result appears (DICE_DELAY plus DICE_FADE).
- **Recommendation:** either confine the dice to the lower half of the table (container top at
  55%, with the result line above it), or fade the dice out first (250ms) and only then fade the
  result line in. The first is better: the die stays visible as evidence.
- **Effort:** S. `src/routes/+layout.svelte:86-92`, `ContextBackground.svelte:41-49`.

#### RF-03 · S3 · The Stability check never says which card caused it

- **What happens:** the check screen says "An odd card demands a price", but not which card.
  `FailureCheckController` has a card block for that, but `confirmCard` clears `currentCard`
  before the transition (`gameActions.svelte.js:408`), so it never renders. This was flagged
  before PR #50 and is still open.
- **Recommendation:** keep the confirmed card as `gameState.lastCard`, and show "7♠ · Caught in a
  toxic gas leak" as a small line above the title.
- **Effort:** S.

#### RF-04 · S3 · The card is roomy, but silent about what it does

- **What happens:**
  - On desktop the card is about 540x760px; the text ends near 55% of its height, and a pulsing
    ring fills the empty middle (`sheet-round.png`, frame 3).
  - "BYTE-6-HEA" is still printed in the footer.
  - The badge says EVENT, CHALLENGE, DOOM or BONUS. It never says the consequence: an odd card
    looks no different from an even one until the next screen.
- **Recommendation:** size the card to its content (min-height 420px, max-height 640px). Replace
  the ID with a one-line mechanic footer for the cards that matter: "Odd · a Stability check
  follows", "King · 3 of 4", "Ace · Salvation now needs 14+".
- **Effort:** S–M. `src/lib/components/card/CardDisplay.svelte:274`.

#### RF-05 · S4 · After the roll, the title repeats the button

- **What happens:** after Roll for Tasks the title becomes "DRAW 1 CARD" above a "DRAW 1 CARD"
  button (`pt-mobile/shots/017`).
- **Recommendation:** keep the title "Round N"; the result line carries the count.
- **Effort:** S. `GameScreen.svelte:72-75`.

### 7. Stability check, Salvation, Lucid and Surreal, card modifiers, Easy

Evidence: `checks/desktop-teach/` (forced: return-king, skip-damage, 4 Aces, natural 1 on
Salvation, Stability tiers), `resume-aces/`, `lucid/`. See also LS-01 to LS-07.

#### CK-01 · S2 · skip-damage and return-king cards do their work in silence

- **What happens:**
  - Both carry the same "BONUS" badge as any Ace. Nothing on the card says what it does.
  - return-king: Kings drop from 2/4 to 1/4 with no message
    (`checks/desktop-teach/02-return-king-card.png`, `03-after-return-king.png`).
    `gameState.status = 'A King returns to the deck'` is set but rendered nowhere.
  - skip-damage: the Ace is odd, but the game goes straight to the journal
    (`05-skip-damage-card.png`, `06-after-skip-damage.png`), right after a rule caption taught
    "Odd cards test your Stability".
- **Why it matters:** the two kindest cards in the deck look like bugs.
- **Recommendation:** a modifier line on the card face ("A King returns to the deck" or "No
  Stability check this time"). When it applies, a result line ("King of Hearts returns to the
  deck · 1 of 4"), and the skull un-igniting in reverse.
- **Effort:** S.

#### CK-02 · S3 · "Success Check", "Salvation" and "Success" name one thing three ways

- **What happens:** the screen title is "SUCCESS CHECK", the Help and the captions say
  "Salvation", and the HUD says "SUCCESS". Every round's description says "The Ace of Hearts has
  appeared", which is stale after round one and false in Easy, where the Ace starts revealed.
  In Easy the "Salvation unlocked" caption never fires, so Easy players are never taught the
  win condition in play.
- **Recommendation:** call it Salvation everywhere. Description: "Roll to remove a token. You
  need 14+." In Easy, fire the Salvation caption on the first Salvation screen.
- **Effort:** S. `GameScreen.svelte:91-93`, `useRuleCaptions.svelte.js:91`.

#### CK-03 · S3 · With four Aces the success is automatic, but the player still waits on a die

- **What happens:** "REMOVE A TOKEN · AUTOMATIC" still throws a d20 (`lastRoll [15]`) and blocks
  input for 3–4s, then asks for Continue (`checks/desktop-teach/07-…`, `08-…`).
- **Recommendation:** no dice. One press shows "−1 token · 4 left" at once.
- **Effort:** S. `useSuccessCheck.svelte.js:31-60`.

#### CK-04 · S4 · The fatal roll reads like any other roll

- **What happens:** at 2 Stability, rolling 3 shows "Rolled 3 · −2 Stability · 0/20" and a
  plain CONTINUE (`endings/stability-desktop/02-stability-result.png`).
- **Recommendation:** "… · 0/20 · nothing left to hold on to", with the button reading "Face the
  end".
- **Effort:** S.

### 8. HUD: desktop panels and the phone compact HUD

Evidence: `checks/desktop-teach/10-…` to `17-…` (tiers), `checks/mini/stats-grid.png`,
`checks/hint/01-hint.png`, `playthrough/sheet-mobile-start.png`.

What works: the phone CompactHUD (one 64px row: Stability n/20, Kings n/4, tokens or lock,
cards, roll) is clear and should be the model for every width. The Stability tiers read well:
green 16–20, yellow 11–15, orange 5–10, red at 4 and under, plus a red flash on damage.

#### HD-01 · S2 · On desktop the Kings panel overlaps the Stability panel

- **What happens:** the Kings frame starts 30px inside the Stability frame (Stability x 8–158,
  Kings x 128–242 at 1280px), and the Stability panel's clipped tab draws a second outline
  behind it (`checks/hint/01-hint.png`, top-left). Visual-design v2 flagged the stray tab, and
  it is still there.
- **Recommendation:** drop the negative overlap and the `--aug-*-extend` tab. Give both panels
  one frame with an 8px gap.
- **Effort:** S. `StabilityPanel.svelte`, `FailureCounterPanel.svelte`.

#### HD-02 · S3 · The desktop HUD is three islands, 130px tall

- **What happens:** at 1440px the panels cluster at the left, centre and right with 300px gaps.
  Labels are 10–11px mono, the panels have six different gradient borders, and "ABILITIES"
  shows four unlabelled icons (star, shield, mushroom, lightning) for the Aces.
- **Recommendation (redesign):** use the CompactHUD design at all widths: one centred row, max
  960px wide, 64px tall, with 12px labels. Replace ABILITIES with "Aces 2/4 · need 14+".
- **Effort:** M.

#### HD-03 · S3 · The Last Roll panel's modifier note wraps into three tiny lines

- **What happens:** "SURREAL: NEXT ROLL LOW OF 2D20" at 10px across three lines
  (`checks/desktop-teach/10-…`). It is also the third place that says it (see LS-01).
- **Recommendation:** a small badge next to the number ("2d20↓" or "2d20↑", with
  `aria-label`), and the full rule in a tooltip.
- **Effort:** S.

#### HD-04 · S3 · A global rule breaks every fixed element inside the game

- **What happens:** `Game.svelte:131` sets `position: relative` on every direct child of
  `.dc-game-container` except the background. That beats the components' own `position: fixed`
  and `absolute`:
  - `KeyboardHint` renders as a full-width bar at the bottom edge, 56px tall with 22px visible,
    instead of a centred toast (`checks/hint/01-hint.png`; probe: `position: relative`, y=778
    of 800).
  - `MiniStatusHUD` (meant for top-right, `z-index: 1000`) renders off-screen below the fold
    (y=816 of 800) on the card, check and journal screens. Dead UI.
  - The screen-reader live region becomes `relative` (harmless only because it is 1px).
- **Recommendation:** scope the rule to `.dc-game-container > .game-screen`. Delete
  `MiniStatusHUD` (the CompactHUD and the panels already cover it).
- **Effort:** S.

### 9. Rule captions and keyboard hint

Evidence: `lucid/captions-*`, `checks/desktop-teach/`, `checks/hint/`.

What works: one-time captions at the top of the table ("RULE Odd cards test your Stability…"),
each firing on first contact and gone after 6s, are the right way to teach through play.

#### RC-01 · S2 · The keyboard hint is broken

- **What happens:** see HD-04. "Space or Enter to continue" is a clipped strip under the button
  in round 1 (`playthrough/sheet-round.png`, frame 1).
- **Recommendation:** fix HD-04. Better still, drop the toast and show "Space" as a small key-cap
  inside the primary button on pointer devices: it is always true, and it never covers
  anything.
- **Effort:** S.

#### RC-02 · S3 · Captions run their 6 seconds behind the card overlay

- **What happens:** a caption fired as the player taps Draw keeps counting down behind the fog
  (the Surreal caption was still mounted under the card in `touch-iphone13-lucid`). Two captions
  in a row (Surreal, then the token rule) take 12s of the top of the table.
- **Recommendation:** pause the caption timer while an overlay is open, and show at most one
  caption per screen; queue the rest for the next screen.
- **Effort:** S. `useRuleCaptions.svelte.js:138-170`.

#### RC-03 · S3 · "Never show instructions again" also silently turns off every caption

- **What happens:** "Skip Always · I know how to play, never show instructions again" sets
  the same flag that disables in-play captions (`useRuleCaptions.svelte.js:139`). There is no
  setting to turn captions back on, and no record of past captions.
- **Recommendation:** a "Rule tips" toggle in Settings, Gameplay. List each caption once seen in
  the Help modal under "Rules you've met".
- **Effort:** S.

### 10. Journal: entry, prompts, save beat, voice note, auto-journal timer, read-aloud

Evidence: `journal/desktop/` and `journal/desktop-sheet.png` (dev server; fake microphone through
`--use-fake-device-for-media-stream`), `playthrough/sheet-mobile-start.png`, `endings/*`.
Read-aloud was reviewed in Settings and in code only: the capture machine has no audio output.

What works: the sheet leads with "This round" (rank, suit and title of each card), two prompt
chips, the status line ("Stability 14/20 · 1 of 4 Kings"), and focus lands in the textarea on
desktop but not on touch, so the keyboard does not cover the sheet. This is a real
improvement since PR #50.

#### JR-01 · S2 · Opening the voice note pushes its controls out of view

- **What happens:** "Voice note" adds an "AUDIO RECORDING (OPTIONAL)" panel inside the sheet's
  scroll area, under the textarea. At 1280x800 the Play and Delete buttons after recording are
  cut off at the bottom edge (`journal/desktop/06-recorded.png`). The panel has no close
  control: once opened it stays. The two buttons are icon-only, with a `title` but no visible
  label. The panel's frame never renders, because the attribute is `augmented-ui=` instead of
  `data-augmented-ui=` (`JournalEntry.svelte:408`).
- **Recommendation:** put the voice note on the footer row: a record button that turns into
  "● 0:07 · Stop", then "▶ 0:07 · Delete". Nothing is added inside the scroll area. Fix the
  attribute.
- **Effort:** S–M. `JournalEntry.svelte:395-430`, `journal/AudioRecorder.svelte`,
  `journal/AudioPlayback.svelte`.

#### JR-02 · S3 · The "Entry saved" beat is too faint to register

- **What happens:** after Record Entry, the footer swaps to a small grey "ENTRY SAVED" for 800ms
  and the sheet fades (`endings/kings-desktop-b.png`, frame 2). It reads as the sheet going
  dead, not as a moment.
- **Recommendation:** keep the 800ms, but make it the sheet's moment: the entry text dims to 60%,
  a cyan "Saved to your log" with a check replaces the button in the same slot, and the sheet
  then scales to 0.98 as it fades out.
- **Effort:** S.

#### JR-03 · S3 · The auto-journal countdown is set in the display font

- **What happens:** "AUTO-CONTINUING IN 7S (WRITE OR RECORD TO CANCEL)" is lixdu caps at about
  14px (`journal/desktop/11-auto-timer-2s.png`). Its bar animates `width`, which the house
  style guide lists as an anti-pattern.
- **Recommendation:** Inter at 13px: "Continuing in 7s · type to stay". Animate the bar with
  `transform: scaleX()`.
- **Effort:** S. `journal/AutoJournalTimer.svelte`.

#### JR-04 · S3 · On phones the prompt chips are cut off and the title wraps

- **What happens:** at 390px "JOURNAL ENTRY" wraps to two lines, and the second prompt chip is
  cut at the right edge ("What are you afrai", `playthrough/sheet-mobile-start.png`, frame 11).
- **Recommendation:** let chips wrap (`flex-wrap: wrap`), and title the sheet "Round 3" in the
  display font with "Journal" as a small label.
- **Effort:** S.

#### JR-05 · S3 · Read-aloud is offered with providers that cannot work yet

- **What happens:** Settings, Narration lists DimmCityAI, OpenAI and ElevenLabs next to the free
  browser voice. Without a key, each shows "Key needed" under a collapsed "Advanced" disclosure,
  and nothing stops the player from choosing one. The on-device Supertonic voice that CLAUDE.md
  documents is commented out of the list (`settings/TTSSection.svelte:115`).
- **Recommendation:** list only the browser voice until a key is present, with "Add a voice
  service" as a link that opens the key field. Either bring Supertonic back or drop it from
  CLAUDE.md.
- **Effort:** S.

### 11. Endings: win, loss by Kings, loss by Stability, final log, epitaph, recap

Evidence: `endings/kings-desktop/`, `endings/win-desktop/`, `endings/stability-desktop/`,
`endings/kings-beat-sheet.png` (10fps from the video), `playthrough/sheet-desktop-end.png`.

What works: the ending now names its cause ("The fourth King was revealed." or "Your Stability
reached 0."), shows a recap (rounds, cards, Kings, Aces, final Stability), adds the afterword on
a loss, hides the HUD, and closes on an epitaph with Read your story, Play again and Home. These
are fixes from PR #50, and they land.

#### EN-01 · S2 · The final King gets the same reveal as any card, and the beat has dead frames

- **What happens** (`endings/kings-beat-sheet.png`, offsets from the tap on the fourth King):
  - +0.6s to +1.5s: the standard 600ms card dismissal.
  - +1.6s to +1.8s: 200ms of an empty, black table.
  - +2.0s to +2.4s: four 56px skulls ignite in the middle of an empty screen.
  - +2.6s to +2.8s: 400ms of empty magenta.
  - +3.0s to +4.0s: GAME OVER drops in letter by letter, then the recap.

  The fourth King's card itself is a normal reveal with a DOOM badge
  (`endings/kings-desktop/02-fourth-king-card.png`).

- **Recommendation (redesign the beat):** stage it on the card. When the fourth King is revealed,
  hold the card 400ms, ignite the four skulls in the HUD row above it (250ms stagger), then cut
  the card to the ending backdrop with no black or empty frames. Total 1.5s from reveal to
  title. Let the title fade in as one word over 400ms, not letter by letter.
- **Effort:** M. `GameOver.svelte`, `CardDeck.svelte`.

#### EN-02 · S3 · The final log drops the ending's backdrop and shrinks the recap to 10px

- **What happens:** "Record your final log" opens the same blue fog as a round's journal
  (`endings/kings-desktop-b.png`, frames 1–3). The recap ("ROUNDS SURVIVED 1 CARDS DRAWN 1
  KINGS…") runs as one 10–11px mono line. The three end buttons have equal weight, and Home has
  a different (yellow) frame.
- **Recommendation:** keep the ending backdrop (magenta for a loss, green for a win) behind the
  final log. Lay the recap out as the same 5-tile grid as the Game Over screen. Make "Read your
  story" primary and the other two text buttons.
- **Effort:** S.

#### EN-03 · S3 · The ending layout leaves an orphan tile

- **What happens:** five recap tiles in a 4-column grid leave "FINAL STABILITY" alone on a second
  row (six tiles on a win leave two). The message is in mono at 14px, smaller than the cause
  line's visual weight suggests (`endings/win-stab-sheet.png`).
- **Recommendation:** five or six equal tiles in one row on desktop (3x2 on phone). Set the
  message in Inter at 18px.
- **Effort:** S.

#### EN-04 · S4 · A debug log ships in the ending

- **What happens:** `GameOver.svelte:23` runs `console.log('DBG', …)` on every ending.
- **Recommendation:** remove it.
- **Effort:** S.

### 12. Story Library and story mode

Evidence: `story/desktop/`, `story/iphone13/` and their sheets (a 5-round completed game written
through the store), `endings/*/13-…`, `14-…`.

#### SM-01 · S2 · Story mode leads with an AI upsell and buries the player's writing

- **What happens:**
  - The page opens on a large "AI STORY SUMMARY" panel ("Configure your AI provider…") above
    the rounds (`story/desktop/02-story-top.png`).
  - Each round lists every card in full, then the player's own journal entry under them, then a
    stats strip. The entry sits about one screen down.
  - The page is 2953px tall at 1280x800.
- **Why it matters:** this is where the player's story is meant to live, and it reads as a
  settings dashboard.
- **Recommendation (redesign):** lead each round with the journal entry in a reading face (Inter
  18px, 640px measure), with the round's cards as a single line of chips above it ("J♣ · 4♦ ·
  K♠"), each expandable. Move AI summary to a small "Summarise with AI" button in the header.
- **Effort:** M. `StoryMode.svelte`, `StoryRound.svelte`.

#### SM-02 · S2 · The AI story settings offer retired models

- **What happens:** the model list is Claude 3.5 Sonnet (Recommended), Claude 3 Opus and Claude 3
  Haiku, or GPT-4o, GPT-4 Turbo and GPT-4 (`settings/AIProviderSection.svelte:66-77`;
  `storyGeneration.js:138` defaults to `claude-3-5-sonnet-20241022`). Retired model IDs fail at
  the provider, so a player who pastes a key gets an error.
- **Recommendation:** current model IDs, a single default, and a "Test key" button that makes
  one tiny call and reports the result before the player leaves settings.
- **Effort:** S.

#### SM-03 · S3 · Escape in the AI settings also exits story mode

- **What happens:** with the AI settings open, Escape closed the dialog and story mode together,
  landing in the Library (`story/desktop/07-after-escape.png`). The story's own keyboard handler
  (`useStoryNavigation.svelte.js:60`) does not check for an open dialog.
- **Recommendation:** ignore Escape in the story handler while a dialog is open, or stop
  propagation in the dialog.
- **Effort:** S.

#### SM-04 · S3 · Library cards hide the outcome and use the retired word "Tower"

- **What happens:** each card shows Player, Journey, "Tower: 14" and the date, but not whether
  the run was a win or a loss, and how it ended. The delete control is a red × next to the
  title, one tap from "View story". On iPhone the back button renders as an empty circle (its
  chevron is missing). The 1400px sort dropdown sits above a single card.
- **Recommendation:** card = title, an "Escaped" or "Taken by the fourth King" line, rounds and
  date, with Delete in an overflow menu. Rename Tower to Stability everywhere (also in story
  mode's header and round stats, which say "Tower", "Failures" and "Tokens").
- **Effort:** S.

#### SM-05 · S3 · Round navigation blanks the content, and the title overflows on phones

- **What happens:** the crossfade between rounds shows an empty content area for about 150ms
  (`story/iphone13/04-nav-arrow-150ms.png`). On iPhone, "AI STORY GENERATION SETTINGS" runs off
  the right edge.
- **Recommendation:** slide the incoming round in from the side it comes from (16px, 200ms,
  opacity plus transform) while the outgoing round fades over 120ms; never show neither. Clamp
  dialog titles at `clamp(1.25rem, 6vw, 2rem)`.
- **Effort:** S.

### 13. Auto-play, keyboard-only play, screen reader, reduced motion

Evidence: `lucid/auto-desktop-lucid/` and `auto.out`, `lucid/keys-desktop-lucid/log.jsonl`,
`a11y/` (`a11y.cjs`: desktop, `reducedMotion: 'reduce'`), `a11y/sheet.png`.

What works: keyboard-only play gets through every step (24 Space/Enter presses and 0 dead
presses in `keys-desktop-lucid`). The revealed card takes focus and gets a 5px white ring.
Result lines and King or Salvation events reach a polite live region. Header buttons have
names and a 3px cyan focus ring.

#### AC-01 · S2 · Auto-play shows each card for two seconds

- **What happens:** the header Auto-Play preset sets `autoAdvanceDelay: 2000`. With read-aloud
  off, `CardDeck` dismisses a revealed card after that delay (`CardDeck.svelte:122-128`). In
  the auto run, cards were on screen about 2s each (`auto.out`, revealed 38.3s, dismissing
  40.3s). Cards carry 60–100 words, which take 15–25s to read. Auto-play also arms only on the
  next screen (LS-07).
- **Recommendation:** with read-aloud off, scale the card hold with its length: 1.5s plus 60ms
  per word, capped at 15s, and pause while the pointer is over the card or it has focus. Show a
  thin progress line at the card's bottom edge so the player can see it is about to move on.
- **Effort:** S.

#### AC-02 · S2 · Screen readers hear "Continue, button" instead of the card

- **What happens:** the revealed card takes focus as `role="button"` with
  `aria-label="Continue"` (`card/CardDisplay.svelte:107-109`). The label replaces the card's
  content as its accessible name, so focus announces "Continue, button". The card's title and
  story are never read, and the live region still holds the previous roll's line ("Rolled 5 ·
  Draw 2 cards", `a11y.cjs` output).
- **Recommendation:** label the card by its content: `aria-labelledby` pointing at the title,
  plus `aria-describedby` at the story, and put "Press Enter to continue" in a visually hidden
  hint. When a card is revealed, announce "8 of Spades, Event: You discover a shortcut through
  the city" in the live region.
- **Effort:** S.

#### AC-03 · S2 · The primary button has no visible keyboard focus

- **What happens:** Tab reaches the step button after the six header buttons, and it shows no
  focus indicator (`outline: none`; the clip-path cuts any outline), while the header buttons
  show a 3px cyan ring (`a11y.cjs` tab order). This fails WCAG 2.4.7. The step button is also
  the seventh tab stop on every screen.
- **Recommendation:** a focus style inside the clip: `:focus-visible` swaps the border to 3px
  white and adds an inner glow. Put the step button first in the tab order (DOM order, or skip
  the header with a "Skip to action" link).
- **Effort:** S. `AugmentedButton.svelte`.

#### AC-04 · S2 · Reduced motion still throws 3D dice for 3–4 seconds

- **What happens:** with `prefers-reduced-motion: reduce`, the die still tumbles across the
  table (`a11y/03-reduced-roll-400ms.png`), and the step stays locked for 3.4s. The earlier
  review raised this, and it is still open: `diceStore.svelte.js` never checks the preference.
  The rest of the app does honour it (fades become instant, the GameOver beat is skipped).
- **Recommendation:** under reduced motion, skip `diceBoxInstance.roll()`. Show the result as a
  large number in a d20 outline for 600ms (opacity only), then the result line.
- **Effort:** S. `src/lib/stores/diceStore.svelte.js:189-259`.

#### AC-05 · S3 · Live-region and caption announcements compete

- **What happens:** the result line goes to the game's live region, while the rule caption has
  its own `aria-live` region and the keyboard hint is a third `role="status"`. A natural 20 on
  a first game fires the result line and the Lucid caption in the same tick, and screen readers
  drop or merge one of them.
- **Recommendation:** route captions through the single live region, queued 1s after the result
  line.
- **Effort:** S.

### 14. Animations and transitions

Evidence: 10fps contact sheets in `playthrough/pt-desktop/animations/` (50 sheets, production
build, cut by `animations.py` from the full-game video), `endings/kings-beat-sheet.png`,
`lucid/dbl-desktop-lucid/sheet-lucid-roll.png`, `dice-timing/`, and rAF probes
(`step-swap.cjs`, `stale-result.cjs`). The full inventory, with a verdict for each animation, is
in the **Animation inventory** section below. The findings here are the ones that need work.

Caveats: swiftshader renders WebGL and filters in software, so durations measured from video run
long. In the playthrough sheets the logged action time comes before Playwright's actionability
wait, so offsets can be 0.3–0.5s early. Durations below are from code, and the sheets are used
for order, gaps and layering.

**The standard itself:**

- It defines time twice. `animations.js` has FAST 150, NORMAL 200 and SLOW 300ms, while
  `styles.css:135-139` has `--anim-fast` 0.3s, `--anim-normal` 0.5s and `--anim-slow` 0.8s.
  "Fast" means 150ms in JS and 300ms in CSS, and components use both.
- It has no tokens for ambient loops, so every component invents its own (2s, 2.4s, 3s, 4s, 5s,
  6s, 10s, 12s).
- Its 600ms card dismissal is too long for a 30px move.
- It is silent on the two things that cost this game the most time: dice duration, and holds
  between beats.

**Recommended standard:** one token set, exported to CSS custom properties from
`animations.js`:

- 120ms for state changes (hover, press, chip);
- 200ms for enter and exit;
- 300ms for an overlay;
- 400ms for a beat (a held moment);
- 1.5s maximum for any staged sequence;
- ambient loops at 4s or 8s only, paused when covered and under reduced motion.

#### AN-01 · S2 · Drawing a card takes about 3 seconds, a third of it blank

- **What happens** (`pt-desktop/animations/07-drawcard-tap-revealed-card.png`, card to card):
  - the dismiss (600ms, up 30px, scale 0.95);
  - about 200ms of empty fog;
  - the hatched card back for about 600ms (250ms anticipation, then a wait for the card);
  - a blank card face for about 500ms (the glitch shake, two steps of 200ms);
  - then header, title, body and footer fade in one by one at 150, 300, 450 and 600ms, 300ms
    each;
  - then "Click to continue" pulses from +1s.

  The code budget is 1.85s, and the observed sequence is about 3s. A round has 1–6 of these.

- **Recommendation (redesign):**
  - Dismiss in 220ms (opacity plus 12px up, ease-in).
  - A card back is only worth showing if it turns over: either flip it (rotateY, 300ms,
    `backface-visibility`), or drop it and let the face rise in 250ms with all text present.
  - No blank face, no glitch.
  - Target 600ms card to card.
- **Effort:** M. `card/CardDisplay.svelte:376-600`, `CardDeck.svelte:98-143`.

#### AN-02 · S3 · The step button vanishes for about 300ms on every step

- **What happens:** pressing Continue removes the old step at once, and the new button fades in
  under two stacked effects: Svelte `transition:fade` (200ms) and `.dc-fade-in` (350ms ease-in,
  `Game.svelte:187`). rAF probe: opacity 0.00 at 57ms, 0.06 at 291ms, 0.72 at 462ms, 1.00 at
  566ms (`step-swap.cjs`). The primary control blinks out between every pair of steps, more than
  ten times a round.
- **Recommendation (simplify):** mount the button slot once, outside `{#key currentScreen}`, and
  change only its label (a 120ms crossfade on the text). Remove `.dc-fade-in` from
  `ContinueButton`.
- **Effort:** S.

#### AN-03 · S3 · Ambient loops never stop, and some animate paint-heavy properties

- **What happens:**
  - Every `AugmentedButton` runs `atmospheric-pulse` (3s, infinite) under a permanent
    `filter: drop-shadow` with `will-change: filter`. Primary buttons also loop
    `background-position` (gradient-shift, 3s) and `box-shadow` (primary-glow-pulse, 2s), both
    repaints.
  - The card loops two 4s `bio-pulse` rings behind its text, plus a 2.4s hint pulse.
  - `NeuralBackground` redraws up to 50 canvas particles with `shadowBlur: 10` every frame, and
    reassigns a `$state` array each frame. It never pauses: not under overlays, and not under
    reduced motion.
  - The Success panel loops token-glow (5s), Game Over loops a scan line (10s), and the splash
    loops flicker (3s) and scan (12s).
- **Why it matters:** the screen never rests, so nothing urgent can stand out. On phones it costs
  battery and frame rate (the earlier review saw multi-second stalls).
- **Recommendation:** keep at most one ambient loop per screen: the background grid at 8s,
  opacity only. Make the CTA glow static. Pause `NeuralBackground` when an overlay is open, when
  the tab is hidden, and under reduced motion. Keep `particles` in a plain array, and drop
  `shadowBlur` for a pre-rendered glow sprite.
- **Effort:** S–M.

#### AN-04 · S3 · Modal entrances follow three different patterns

- **What happens:**
  - `ContentModal` (Settings, Help, About): fade 200ms plus 16px fly, 300ms, cubicOut. Good.
  - `ConfirmModal` (Exit, Delete): flies in from 500px above at full opacity over 400ms
    (`ConfirmModal.svelte:75`). It is the heaviest movement in the app, used for the least
    dramatic dialog.
  - `OverlayModal` (card, journal): fog plus 0.95 scale, 200ms. Its fog is driven by a JS
    `tick` that writes `style.transform` on three cloud layers every frame, over three SVG
    `feTurbulence` filters.
  - The dice theme picker has its own `fadeIn` and `slideIn` keyframes.
- **Recommendation:** one entrance for every dialog: 200ms fade plus 8px rise, cubicOut, and
  140ms out. Replace the turbulence fog with a pre-rendered blurred PNG and animate its opacity
  only.
- **Effort:** S.

#### AN-05 · S3 · The HUD's entrance plays while it is hidden; its loops run all game

- **What happens:** the HUD panels slide down with `linear` easing over 0.6–0.85s, staggered by
  0.15–0.45s. They mount under the intro, which hides the table, so the slide plays unseen
  (`pt-desktop/animations/01-…`: the HUD is already in place at the first frame after the
  intro). `linear` is on the style guide's own list of anti-patterns.
- **Recommendation (remove):** drop the slide-downs. Fade the whole HUD in once, 200ms, as the
  table appears.
- **Effort:** S.

#### AN-06 · S3 · Screen-level fades are slow and inconsistent

- **What happens:** home's instructions-to-games swap fades 600ms, and the splash fades 800ms
  (twice, see HM-04). Page navigation uses the View Transitions API at `--anim-fast` = 300ms
  with a 20px rise. The intro-to-table hand-off is 300ms out, then 300ms in (good: no black
  frame).
- **Recommendation:** 200ms for every screen swap. Keep the View Transition but make the rise
  8px.
- **Effort:** S.

### 15. Viewports

Evidence: `viewports/<vp>/` (`viewports.cjs`: intro, instability roll and result, card, journal,
Game Over, with a fit check of every button, card and textarea), `viewports/*-sheet.png`,
`viewports/phones-sheet.png`, `lucid/captions-*`, `tour/*`.

Measured HUD height: 196px at 1440x900 and at 1280x720 (27% of the 720px screen), 306px on iPad
portrait (28%), and 128px on phones (header plus the 64px CompactHUD).

#### VP-01 · S1 · Landscape phones cannot play

- **Viewport:** iPhone 13 landscape, 750x342.
- **What happens:** at 750px wide the desktop HUD is used, and it takes 306 of 342px.
  - The step button is below the fold: "ROLL FOR INSTABILITY" at y=338–380, and in the caption
    run "DRAW 6 CARDS" at y=373 with the table area 4px tall.
  - The page cannot scroll (scrollHeight equals the viewport).
  - The card shrinks to about 130px wide with its text cut.
  - The journal's textarea (y=322–398) and Record Entry button are off screen, and so is Game
    Over's "Record your final log" (y=414–456).
  - The Kings panel sits on top of the Stability panel.

  Evidence: `lucid/captions-landscape-20/02-lucid-caption-up.png`,
  `viewports/phones-sheet.png` (bottom rows), `viewports.out`.

- **Recommendation:** treat `(max-height: 500px)` as a phone. Use the CompactHUD, and put the
  step button in a right-hand column beside the table, so the HUD, table and button share the
  width, not the height. As a stop-gap (S), show a "Turn your phone upright" panel in
  landscape below 500px tall.
- **Effort:** M (stop-gap S).

#### VP-02 · S2 · Tablet portrait gets the desktop HUD, unbalanced and 306px tall

- **Viewport:** iPad portrait, 810x1080.
- **What happens:** Stability, Kings, Success and Abilities stack in a 2x2 block on the left,
  with Last Roll and Cards on the right and nothing in between. The HUD is 28% of the screen.
  The intro text fills the top third, then 600px of empty space before the button
  (`viewports/ipad-sheet.png`).
- **Recommendation:** use the CompactHUD up to 900px wide (or everywhere, HD-02), and centre the
  intro column vertically (GS-02).
- **Effort:** S.

#### VP-03 · S3 · On small phones the screen title breaks mid-word

- **Viewport:** 360x640.
- **What happens:** "INITIAL INSTABILITY" wraps as "INITIAL / INSTABILIT / Y"
  (`viewports/phones-sheet.png`, row 2). The cause is `overflow-wrap: break-word` with a 24px
  minimum size in lixdu (`ContextBackground.svelte:60-68`). The die also lands on the result
  line on every phone size (RF-02).
- **Recommendation:** `font-size: clamp(1.25rem, 7vw, 3.5rem)`, `overflow-wrap: normal`, and
  shorter titles ("Instability", "Salvation").
- **Effort:** S.

#### VP-04 · S3 · On phones the journal's actions stack in the wrong order

- **Viewport:** iPhone 13 and 360x640.
- **What happens:** the action row wraps, so RECORD ENTRY sits above "Voice note"
  (`viewports/phones-sheet.png`, journal column), putting the secondary action at the bottom
  under the thumb.
- **Recommendation:** one row: a 44px microphone icon button on the left, Record Entry filling
  the rest.
- **Effort:** S.

#### Fit at 1440x900, 1280x720 and on iPhone 13

No control is off screen at these sizes (`viewports.out`: `offscreen: []`). At 1280x720 the
card, journal and Game Over all fit, but the 196px HUD leaves the table 480px for the title, the
dice, the result line and the button, which is why dice and result line collide.

## Animation inventory

Every animation and transition, from code (`grep` of `@keyframes`, `transition:`, `in:`/`out:`)
and checked against the captures. "Observed" is from the 10fps sheets (swiftshader, see section
14 caveats). Verdicts: keep, tune, simplify, redesign, remove.

**Global and screen level**

| Animation                      | Where, trigger                               | Duration, easing                               | Observed                                     | Verdict  | Change                                          |
| ------------------------------ | -------------------------------------------- | ---------------------------------------------- | -------------------------------------------- | -------- | ----------------------------------------------- |
| Splash letters, subtitle, fade | `Splash.svelte`, first visit per session     | slideIn 0.9s staggered to 1.15s; fade 800ms x2 | about 4s before the next screen; overlaps it | simplify | 1.2s total, one 300ms fade, skippable (HM-04)   |
| Splash flicker and scan        | same                                         | 3s and 12s, infinite                           | flicker reads as a fault                     | remove   | none                                            |
| Home screen swaps              | `+page.svelte` choice to games               | fade 600ms                                     | sluggish                                     | tune     | 200ms                                           |
| Home logo float, card fade-in  | `+page.svelte`                               | float 6s infinite; cardFadeIn 0.6s, delay 0.3s | fine                                         | tune     | 250ms card fade, no delay; stop the float       |
| Page navigation                | `+layout.svelte` View Transitions            | 300ms fade-out-scale / fade-in-rise 20px       | smooth                                       | tune     | 200ms, 8px                                      |
| Neural background              | `NeuralBackground.svelte`, always            | rAF particle canvas plus grid-pulse 4s         | constant motion behind everything            | simplify | pause under overlays and reduced motion (AN-03) |
| Intro to table                 | `GameScreen.svelte`                          | intro out 300ms, table in 300ms after 300ms    | no black gap, good                           | keep     | none                                            |
| Step screens                   | `GameScreen.svelte` `{#key}` + `.dc-fade-in` | fade 200ms plus 350ms ease-in                  | button invisible for about 300ms (AN-02)     | simplify | persistent button slot, 120ms label swap        |
| Context title and result line  | `ContextBackground.svelte`                   | out 150ms, then in 150ms after 150ms           | clean, sequenced                             | keep     | none                                            |

**Dice**

| Animation          | Where, trigger              | Duration, easing                             | Observed                                                  | Verdict  | Change                                                      |
| ------------------ | --------------------------- | -------------------------------------------- | --------------------------------------------------------- | -------- | ----------------------------------------------------------- |
| Dice container in  | `+layout.svelte` `.rolling` | 150ms opacity plus scale 0.95 to 1           | fine                                                      | keep     | none                                                        |
| 3D throw           | `diceStore.rollDice`        | physics, 3.0–5.5s here                       | dice still 0.7–1.8s before the button wakes (LS-05)       | redesign | resolve at rest, tap to skip, reduced-motion number (AC-04) |
| Dice container out | `+layout.svelte`            | hold 500ms, then 250ms fade, z-index delayed | dice sit on the result line (RF-02) and over the card fog | tune     | confine to the lower table; fade before the result line     |

**Cards and overlays**

| Animation                 | Where, trigger                     | Duration, easing                           | Observed                               | Verdict  | Change                                     |
| ------------------------- | ---------------------------------- | ------------------------------------------ | -------------------------------------- | -------- | ------------------------------------------ |
| Card overlay fog          | `OverlayModal.svelte`              | 200ms JS tick over 3 SVG turbulence layers | heavy on phones                        | simplify | static blurred image, opacity only (AN-04) |
| Card back and appear      | `CardDisplay.svelte` anticipating  | card-appear 250ms ease-out                 | back shown about 600ms                 | redesign | flip, or drop the back (AN-01)             |
| Glitch shake              | `CardDisplay.svelte` materializing | 200ms steps(2) x2                          | blank face shaking                     | remove   | none                                       |
| Face text stagger         | `.reveal`                          | 300ms each, 150/300/450/600ms              | text arrives piece by piece over 900ms | simplify | all at once, or one 120ms step             |
| Bio-pulse rings           | behind the card text               | 4s infinite x2, scale 1 to 3               | ring behind body copy                  | remove   | none                                       |
| "Click to continue" pulse | card footer                        | 2.4s infinite after 1s                     | fine as a cue                          | tune     | pulse twice, then stay                     |
| Card dismiss              | `byte-dismiss`                     | 600ms, cubic-bezier(.4,0,.6,1)             | long for a 30px move                   | tune     | 220ms ease-in, 12px                        |
| Journal sheet in          | `OverlayModal` stage               | 200ms scale 0.95 plus fade                 | fine                                   | keep     | none                                       |
| "Entry saved" beat        | `JournalEntry.svelte`              | 150ms fade, 800ms hold                     | too faint to notice (JR-02)            | redesign | in-slot confirmation                       |
| Auto-journal bar          | `AutoJournalTimer.svelte`          | width, every 100ms                         | animates layout                        | tune     | `scaleX`                                   |
| Epitaph                   | `JournalEntry.svelte`              | fade 300ms                                 | fine                                   | keep     | none                                       |

**HUD**

| Animation             | Where, trigger                            | Duration, easing                                 | Observed                              | Verdict | Change                |
| --------------------- | ----------------------------------------- | ------------------------------------------------ | ------------------------------------- | ------- | --------------------- |
| HUD slide-downs       | status panels and header, game start      | 0.6–0.85s **linear**, staggered                  | plays under the intro, unseen (AN-05) | remove  | one 200ms fade        |
| Stability hit         | `StabilityPanel.svelte`                   | flash 300ms ease-out plus 2px shake 300ms linear | readable                              | keep    | ease-out on the shake |
| Critical pulse        | Stability 4 or less, panel and CompactHUD | 1.6s infinite                                    | right signal                          | keep    | none                  |
| King ignite and pulse | `FailureCounterPanel.svelte`              | 0.6s ignite; pulse speeds up per King            | good escalation                       | keep    | none                  |
| Ace flash, ring, star | `SuccessTokensPanel.svelte`               | 0.6s, 1.2s, 0.3s                                 | fine                                  | keep    | none                  |
| Token glow            | Success panel                             | 5s infinite                                      | ambient noise                         | remove  | none                  |

**Endings, modals and the rest**

| Animation                   | Where, trigger                          | Duration, easing                               | Observed                                 | Verdict  | Change                                    |
| --------------------------- | --------------------------------------- | ---------------------------------------------- | ---------------------------------------- | -------- | ----------------------------------------- |
| Game Over beat              | `GameOver.svelte`                       | 1.5s: skulls 250ms stagger, or Stability drain | black and empty frames around it (EN-01) | redesign | stage it on the card and HUD              |
| Game Over title             | letter dropIn                           | 0.9s each, 100ms stagger, default ease, -80px  | about 1.9s to read "GAME OVER"           | simplify | whole word, 400ms fade plus 8px           |
| Game Over message and recap | fadeIn                                  | 0.6s at 0.8 / 1.1 / 1.4 / 1.7s                 | button usable about 2.3s after the title | tune     | 200ms each, 100ms stagger                 |
| Game Over scan line         | `GameOver.svelte`                       | 10s linear infinite                            | fine                                     | keep     | pause under reduced motion (already done) |
| Content modals              | `ContentModal.svelte`                   | fade 200ms plus fly 16px 300ms cubicOut        | good                                     | keep     | the model for every dialog                |
| Confirm modals              | `ConfirmModal.svelte`                   | fly y -500px, 400ms, full opacity              | heavy drop                               | redesign | ContentModal entrance (AN-04)             |
| Dice theme picker           | `DiceThemePicker.svelte`                | own fadeIn and slideIn keyframes               | inconsistent                             | simplify | ContentModal                              |
| Rule caption                | `RuleCaption.svelte`                    | fade 200ms, reduced-motion 0                   | good                                     | keep     | pause while covered (RC-02)               |
| Keyboard hint               | `KeyboardHint.svelte`                   | fade-in-out 5s                                 | broken layout (HD-04)                    | remove   | key-cap in the button                     |
| CTA glow and gradient       | `AugmentedButton.svelte`                | 3s, 3s and 2s infinite; box-shadow, background | constant shimmer, repaints               | simplify | static glow, 120ms hover (AN-03)          |
| Button bar resize           | `ButtonBar.svelte`                      | height and width 0.3s                          | animates layout                          | remove   | none                                      |
| Story mode open, rounds     | `StoryMode.svelte`                      | scale 250ms; crossfade 300ms                   | blank content mid-swap (SM-05)           | tune     | directional slide                         |
| Story library and cards     | `BrowseGames.svelte`, `GameCard.svelte` | fly 20px, 250ms quintOut                       | fine                                     | keep     | none                                      |
| Loading ring                | `LoadScreen.svelte`                     | 1.6s pulse                                     | fine                                     | keep     | none                                      |
| Recorder and player         | `AudioRecorder`, `AudioPlayer`          | pulse, wave                                    | fine                                     | keep     | none                                      |

## Fix round (2026-11-06)

**Owner decisions:**

- Any natural 20 makes the player Lucid, and any natural 1 makes them Surreal, on every d20 roll.
- The "one button per step" rule may be broken: Begin Round can go, and cards can deal on their
  own.
- Every identified issue is to be worked through.

**Lead's defaults:**

- The product name is "Dream Console", with Dimm City as the maker.
- Key art is generated CSS/SVG per game.
- `MiniStatusHUD` is deleted.
- All TTS providers stay; the ones that need a key are gated behind it.

**Teams.** Each team works on its own branch (`ux/<team>`, local worktrees, merged into
`claude/vibrant-curie-w9bn88` by the lead):

| Team                                  | Findings                                                                                                                         | Status |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------ |
| T1 Rules, rolls and round flow        | LS-01–07, GS-01–03, RF-01–03, RF-05, CK-01 (result lines), CK-02–04, MN-02, RC-02, AC-03 (tab order), AC-04, AC-05, AN-02, VP-03 | merged |
| T2 Card, overlays, journal and ending | AN-01, AN-04, RF-04, CK-01 (card face), AC-01, AC-02, JR-01–04, VP-04, EN-01–04, MN-03, MN-05, VP-01 (card, journal, Game Over)  | merged |
| T3 Home, pages, menus and settings    | ST-01–05, MN-01, MN-04, MN-06, HM-01–07, JR-05, RC-03, AN-06 (home and splash)                                                   | merged |
| T4 HUD, layout and visual system      | HD-01–04, VP-01, VP-02, RC-01, AN-03, AN-05, AN-06 (navigation), AC-03 (focus ring), MN-07, animation tokens, self-hosted fonts  | merged |
| T5 Story                              | SM-01–05 (merged at 0b17fb6; the beta refusal fallback was removed after review)                                                 | merged |

All five teams are merged. Their worktrees and local branches have been removed.

**Integration fixes by the lead:**

- **Merge conflicts.** `GameScreen` (T1 vs T4) kept T1's flow and dropped the keyboard-hint
  toast, with T4's "Space" key-cap on the step button instead. `useRuleCaptions` keeps T1's
  pause-under-overlays and T3's rule-tips switch. The confirmation spec uses T3's copy on T2's
  dialog.
- **VP-01.** The landscape button column is now `.step-slot` (T1's persistent slot had broken
  T4's rule).
- **Header.** Its backdrop blur is gone (T4's override no longer matched T3's rewritten header;
  the production build painted filled corners).
- **Cleanup.** The unused `variant="danger"` prop is dropped, and so is the beta refusal fallback
  in the story summary.

**Verification on the merged branch:**

- **Static checks.** Vitest 785 passed, 1 skipped. ESLint and Prettier are clean. svelte-check
  reports 0 errors and 0 warnings. The build passes (publint "All good").
- **Playwright.** The full suite ran on the three projects: 427 passed, 5 skipped by design, 0
  failed.
- **Full games on the production build.** Desktop at 1440x900: 9 journal entries, through the
  final log to the Story Library, 0 console errors. iPhone 13: 11 journal entries to the Story
  Library, 1 console error (a SvelteKit navigation fetch that was cut off, mobile only, not yet
  traced).

**Not done as written:**

- **RF-01, partly.** A round is about 8 inputs before Salvation unlocks and about 10 after (it was
  about 12). Reaching 8 needs results that move on by themselves; that waits on the owner.
- **EN-01.** The fourth-King flare is staged on the card's own King pips. The HUD's skulls sit
  under the card overlay's scrim.
- **SM-05.** The dialog-title clamp was not applied: phone dialog titles are Inter 18px (MN-07)
  instead.
- **SM-02.** The OpenAI default (`gpt-5-mini`) is unverified; openai.com is blocked here. The
  model is a free-text field, and "Test key" checks it.

**Open decisions for the owner:**

1. **Auto-advance results.** Should Stability and Salvation results move on by themselves after
   a beat, which would reach 8 inputs?
2. **2d20 naturals.** Should a 20 or 1 on the dropped die also trigger Lucid or Surreal?
   Currently only the kept die does.
3. **Four Aces.** The automatic Salvation throws no die, so it neither uses nor earns a modifier.
   This is assumed right.
4. **Story deletion.** The Story Library now has a Delete action, which it never had. Keep it?
5. **Rule tips.** "Rules you've met" records a tip when it is queued. Tips fire once per game.
   Should they fire once ever?

## Verification pass (2026-11-07)

A check of every finding on the PR head (#51, 8fde2f5), plus a hunt for problems the fixes or
the merge caused. The review lists 74 finding IDs (not 75).

**Method.** Worktree `ux/verify`. Production build on port 4192 for look and timing, dev server
on 5192 for forcing states. Fonts are now bundled, so every capture renders Inter, Share Tech
Mono and lixdu. The evidence root (not committed) is
`/tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/ux-verify/`,
and the notes below cite files relative to it. The scripts there:

- `flow.cjs <vp>`: one forced round at each of 1440x900, 1280x720, iPad, iPhone 13, 360x640,
  844x390 and 750x342. It covers a natural 20 on the opening roll, a 2d20 task roll, an odd
  card, its Stability check, an even card, the journal and Round 2. It logs a probe per step
  (`flow/<vp>/probes.json`): labels, result line, live region, font audit, off-screen controls
  and HUD height.
- `tour.cjs <vp>` (production): first run and splash, home, menus, every home dialog, the Story
  Library, static and error pages, then a saved game (Continue, New game, Delete save and
  toast).
- `special.cjs`, `persist.cjs`, `a11y.cjs` (keyboard only, focus, names, reduced motion, phone
  menu), `autoplay.cjs`, `ending.cjs kings|stability|win` (recorded), `story.cjs`,
  `journal.cjs` (fake microphone, and none), `easy.cjs`, `stale-probe.cjs` (a mutation log of
  the step label, result line and live region) and `dice-timing.cjs` (production, red marker
  frame, frame diff of the dice area).
- `playthrough.cjs` plus `animations.py` at 10fps: a full production game at 1440x900 (15
  rounds, lost to the fourth King, 0 console errors, 29 sheets in
  `playthrough/pt-desktop/animations/`).

**Not verified here, by instruction.**

- **Being changed elsewhere:** RF-01 (auto-advance), CK-03 (automatic Salvation with a
  modifier), the rule-tips toggle (RC-03) and the mobile "Failed to fetch" console error.
- **Being redesigned:** the HUD row (HD-02, HD-03), the in-game header layout (MN-06), dice
  staging (RF-02) and the dice rows of the animation inventory.

For these, the notes say what the current build does, but give no verdict.

### Status of every finding

| ID    | Status            | Note (evidence)                                                                                                                                                                                                                                                                                          |
| ----- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LS-01 | Fixed             | The modifier is part of the roll button's label only ("Roll for tasks · Lucid: 2 dice, keep high"). Continue and Draw carry nothing; the HUD keeps a 2d20↑ badge (`flow/d1440/04-…`, `05-round1-lucid.png`).                                                                                             |
| LS-02 | Fixed             | Lucid, then Leave, then the other game: `lucid: false`, and "Roll for instability" has no hint (`persist/desktop/03-new-game-instability.png`).                                                                                                                                                          |
| LS-03 | Fixed             | "Rolled 3 (high of 3, 2) · Draw 2 cards", with `lastRoll [3,2]` (`flow/d1440/07-round1-result.png`). The reduced-motion static dice show both, the dropped one dimmed.                                                                                                                                   |
| LS-04 | Fixed             | Saved with Lucid and 2 Aces, reloaded and resumed: Lucid kept, 2 Aces, "need 14+" on the button and in the description (`persist/desktop/05-resumed.png`, `06-resumed-salvation.png`).                                                                                                                   |
| LS-05 | Fixed             | Production, 1d20: the button woke 0.0–0.4s after the dice stopped (it was 0.7–1.1s) (`dice-timing/results.json`, `dice-timing/f25/`). A press during "Rolling…" skips to the result (sheets 03 and 06).                                                                                                  |
| LS-06 | Fixed             | 400ms guard plus a highlight when the button changes meaning (`GameScreen.svelte:205-226`). Keyboard-only play had no dead or misdirected presses (`a11y/desktop`).                                                                                                                                      |
| LS-07 | Fixed             | Switched on at the opening roll, it rolled by itself 2.9s later (the auto-roll delay). Switched off, play stops at the next step (`autoplay/desktop`).                                                                                                                                                   |
| HM-01 | Fixed             | A centred 960px column, the pitch, generated key art per game (owner decision 4), subtitle, "About 30 min" and a labelled Play (`tour/d1440/01-home.png`).                                                                                                                                               |
| HM-02 | Fixed             | "Continue · Round 1 · just now", New game (confirms the overwrite) and a "Delete save" link (`tour/d1440/18-home-with-save.png`, `19-new-game-confirm.png`). But see NV-03.                                                                                                                              |
| HM-03 | Fixed             | Equal cards (533px), buttons level at y=673, subtitles from the frontmatter.                                                                                                                                                                                                                             |
| HM-04 | Fixed             | About 1.2s of splash, one name. A tap on the splash brings up the panel in 0.33s. Once per install: a reload shows no splash (`tour/d1440/first-run/`).                                                                                                                                                  |
| HM-05 | Fixed             | One panel: Play, "Read the rules first" (opens the Game Guide), and a "don't show tips" link (`tour/d1440/first-run/04-…`, `05-…`).                                                                                                                                                                      |
| HM-06 | Fixed             | Stories, Settings, Help and More sit inline from 900px; the hamburger is for phones only.                                                                                                                                                                                                                |
| HM-07 | Fixed             | Outlined red destructive button, and copy that names the save. "Save deleted" toast at the bottom centre; the grid does not move (`tour/d1440/20-…`, `21-…`).                                                                                                                                            |
| MN-01 | Fixed             | The Game Guide: "Any natural 20 makes you Lucid; any natural 1 makes you Surreal… every roll in the game".                                                                                                                                                                                               |
| MN-02 | Fixed             | "Leave the game? Your progress is saved…", with Keep playing and Leave (`tour/d1440/17-exit-dialog.png`). There is one gap before the opening roll (NV-08).                                                                                                                                              |
| MN-03 | Partly fixed      | Every dialog is now ContentModal: same frame and entrance, and a 44x44 close. The footer labels still differ: Done (Settings, About, Dice), Got it (Help), Close (AI summary).                                                                                                                           |
| MN-04 | Fixed             | Opens with Difficulty, a Play mode switch (Manual, Read aloud, Hands-free) and Rule tips; the rest folds under Advanced. 667px, no scroll at 1440x900.                                                                                                                                                   |
| MN-05 | Fixed             | A d20 render per theme, one White, title "Dice" (`tour/d1440/m-dialogs.png`).                                                                                                                                                                                                                            |
| MN-06 | Being changed     | Header layout is being redesigned. The behaviour holds: labels under the desktop icons, "Auto on" and "Voice on" states, and on phones X, Help and a ⋯ menu with labelled toggles; Escape returns focus (`a11y/iphone13/06-phone-menu.png`).                                                             |
| MN-07 | Partly fixed      | Buttons, labels and titles under 28px are Inter 600 (font audit clean on home, dialogs, story and endings). Still in lixdu: the intro's section headings at 20px on every viewport, and the screen title on phones (NV-05).                                                                              |
| ST-01 | Fixed             | /how-to renders the Game Guide (`tour/d1440/13-page-how-to.png`).                                                                                                                                                                                                                                        |
| ST-02 | Fixed             | /about renders the About content in a 720px column, under one name.                                                                                                                                                                                                                                      |
| ST-03 | Fixed             | /signin redirects to /.                                                                                                                                                                                                                                                                                  |
| ST-04 | Fixed             | "Signal lost", one sentence, "Back to the console". No overflow at 360 or 390 (`tour/*/…-page-nope-404.png`).                                                                                                                                                                                            |
| ST-05 | Fixed             | "Future Lost · Dream Console", "Story Library · …", "About · …", "How to play · …", "Signal lost · …".                                                                                                                                                                                                   |
| GS-01 | Fixed             | No Begin Round; "Round N" titles the roll screen.                                                                                                                                                                                                                                                        |
| GS-02 | Partly fixed      | Desktop and iPad: the column is centred and ends on the goal line. Portrait phones: a fade mask and a scroll cue. Landscape phones: the top of the intro is cut off and cannot be scrolled to (NV-01).                                                                                                   |
| GS-03 | Fixed             | "Rolling…" on every roll step (`flow/*/03-…`, `06-…`, `10-…`).                                                                                                                                                                                                                                           |
| RF-01 | Being changed     | Auto-advance of results is being implemented elsewhere.                                                                                                                                                                                                                                                  |
| RF-02 | Being changed     | Dice staging is being redesigned. Now: the dice land below the result line on desktop and phones (result 306–366px, dice area 430–704px at 1280x800), but a die can come to rest half off the left or right edge (`special/desktop/08-…`).                                                               |
| RF-03 | Fixed             | "7♠ · You're caught in a toxic gas leak" above the Stability check title (`flow/d1440/09-stability-check.png`). On short tables the rule caption covers it (NV-02).                                                                                                                                     |
| RF-04 | Fixed             | The card sizes to its content (520x420 on desktop, 344x420 at 360). Mechanic footer ("Odd · a Stability check follows", "King · 3 of 4" with pips, "Ace · Salvation will need 14+"); no BYTE IDs.                                                                                                        |
| RF-05 | Fixed             | The title stays "Round 1" after the roll; the result line carries the count.                                                                                                                                                                                                                             |
| CK-01 | Partly fixed      | Card lines "A King returns to the deck" and "No Stability check this time"; notice "King of Hearts returns to the deck · 2 of 4"; Kings 3→2. Not done: the skull goes dark with no un-ignite (`KingsCell.svelte:48-51`). See NV-06.                                                                      |
| CK-02 | Fixed             | "Salvation" title, "Roll to remove a token. You need 14+.", HUD "need 14+". On Easy the Salvation tip fires on the first Salvation screen (`easy/desktop/04-easy-first-salvation.png`).                                                                                                                  |
| CK-03 | Being changed     | Automatic Salvation is being changed elsewhere.                                                                                                                                                                                                                                                          |
| CK-04 | Fixed             | "Rolled 3 · −2 Stability · 0/20 · nothing left to hold on to", and the button reads "Face the end" (`ending/stability-desktop/01-fatal-result.png`).                                                                                                                                                     |
| HD-01 | Fixed             | One HUD row with no overlap at any of the seven viewports.                                                                                                                                                                                                                                               |
| HD-02 | Being changed     | The HUD row is being redesigned. Now: one centred row, 124px with the header on desktop and iPad, 120px on phones, 112px in landscape.                                                                                                                                                                   |
| HD-03 | Being changed     | Being redesigned. Now: a "2d20↑" or "2d20↓" badge in the Roll cell, with an accessible label.                                                                                                                                                                                                            |
| HD-04 | Fixed             | The global rule is gone (`Game.svelte:105-111` uses `isolation`); MiniStatusHUD and the keyboard-hint toast are deleted.                                                                                                                                                                                 |
| RC-01 | Fixed             | A "Space" key-cap inside the step button on pointer devices, none on touch.                                                                                                                                                                                                                              |
| RC-02 | Fixed             | Captions pause under the card and the journal, one at a time. A side effect: a paused caption resumes on the next table screen (the odd-card tip on Round 2's roll, `flow/iphone13/15-round2.png`).                                                                                                      |
| RC-03 | Being changed     | The rule-tips toggle is being changed elsewhere. "Rules you've met" is in the Help modal (`HelpModal.svelte:31-34`).                                                                                                                                                                                     |
| JR-01 | Fixed             | The voice note lives on the footer row: Record, then "Stop 0:02", then "Play 0:02 · Delete", all on screen at 360x640 (`journal/small/02-recorded.png`). Error copy: NV-07.                                                                                                                              |
| JR-02 | Fixed             | The entry dims, and a cyan "✓ Saved to your log" takes the button's slot (`flow/d1440/14-journal-saved-250ms.png`).                                                                                                                                                                                      |
| JR-03 | Fixed             | Inter 13px "Continuing in Ns · type to stay", with a `scaleX` bar (`AutoJournalTimer.svelte:19-36`; checked in code).                                                                                                                                                                                    |
| JR-04 | Fixed             | The chips wrap; "Round 1" is the title in the display face, with "Journal" as a small label (`flow/iphone13/13-journal.png`).                                                                                                                                                                            |
| JR-05 | Fixed             | Browser voice and the on-device voice (265 MB) are listed; key-based services sit behind "Add a voice service" (`story/iphone13/09-ai-settings.png`).                                                                                                                                                    |
| EN-01 | Fixed differently | The pips light on the card itself, which holds 700ms on a magenta backdrop; then GAME OVER fades in as one word. About 1.2s from tap to title, and about 1.8s to the button; no black or empty frames (`ending/kings-beat-sheet.png`). The HUD skulls aren't used (they're under the scrim). Acceptable. |
| EN-02 | Fixed             | The final log keeps the magenta or green ending backdrop and shows the recap as tiles. "Read your story" is primary; Play again and Home are text buttons (`ending/m-final.png`).                                                                                                                        |
| EN-03 | Fixed             | 5 tiles (a loss) or 6 (a win) in one row at 1280; the message is Inter 18px.                                                                                                                                                                                                                             |
| EN-04 | Fixed             | No `console.log`; no "DBG" in the console on any ending.                                                                                                                                                                                                                                                 |
| SM-01 | Fixed             | Each round leads with the outcome line, card chips and the entry (640px measure, Inter 16px rather than 18). "Summarise with AI" is a header button (`story/desktop/03-story-top.png`).                                                                                                                  |
| SM-02 | Fixed             | Claude Sonnet, Opus and Haiku 5.5, a single default and "Test key". The OpenAI default is still unverified (lead's note).                                                                                                                                                                                |
| SM-03 | Fixed             | Escape closes the AI dialog (settings view, then summary view) and stays in story mode.                                                                                                                                                                                                                  |
| SM-04 | Fixed             | "Taken by the fourth King · 5 rounds · date", "Delete story…" in an overflow menu, the back chevron renders, and "Tower" is gone.                                                                                                                                                                        |
| SM-05 | Fixed differently | No blank frame at 60, 120 or 200ms after a page turn (`story/desktop/04-…` to `07-…`). Phone dialog titles are Inter 18px rather than the clamp, and they fit.                                                                                                                                           |
| AC-01 | Fixed             | The hold is 1.5s plus 60ms a word, pauses under the pointer, and draws a shrinking line (`autoplay/desktop/03-card-hold-1500ms.png`).                                                                                                                                                                    |
| AC-02 | Fixed differently | The card's name comes from its content ("7 of Spades, Challenge: …"), and its description includes "Press Enter to continue". Focus announces the card instead of the live region. Acceptable.                                                                                                           |
| AC-03 | Fixed             | "Skip to action" is the first tab stop; the step button has a white inset ring (`a11y/desktop/m-focus.png`).                                                                                                                                                                                             |
| AC-04 | Fixed             | Reduced motion shows static d20 outlines for 600ms, then the result. No canvas throw, and the motes are cleared (`a11y/reduced-roll-desktop/01-static-120ms.png`).                                                                                                                                       |
| AC-05 | Fixed             | One live region: the result goes first, a caption about 1s later. But see NV-04 (stale messages).                                                                                                                                                                                                        |
| AN-01 | Fixed             | The face rises in about 250ms with all its text: no back, no blank face, no glitch. The dismiss is about 220ms, with no black frame to the next screen (`playthrough/pt-desktop/animations/07-…`).                                                                                                       |
| AN-02 | Fixed             | The step button never blinks out; only its label crossfades. But see NV-04 (a stale label crossfades out).                                                                                                                                                                                               |
| AN-03 | Fixed             | No loops on AugmentedButton. The motes pause under dialogs and overlays (0 changed pixels) and are cleared under reduced motion; the token glow is gone.                                                                                                                                                 |
| AN-04 | Fixed             | ContentModal, ConfirmModal and the Dice picker share one entrance (200ms fade plus an 8px rise). The overlay uses a static scrim (`OverlayModal.svelte`).                                                                                                                                                |
| AN-05 | Fixed             | No slide-downs. The HUD arrives with the table, and the header fades in over 200ms (`playthrough/…/animations/01-…`).                                                                                                                                                                                    |
| AN-06 | Fixed             | Home swaps are 200ms; page View Transitions are 200ms with an 8px rise; the splash fades in 300ms.                                                                                                                                                                                                       |
| VP-01 | Partly fixed      | Landscape phones now play: a 112px HUD, the button in a right-hand column, a 690x278 card, a journal that fits, and no control off screen at 750x342 or 844x390. Left: the intro top (NV-01) and the caption overlap (NV-02).                                                                            |
| VP-02 | Fixed             | iPad portrait: a one-row 124px HUD and a centred intro (`flow/m-ipad.png`).                                                                                                                                                                                                                              |
| VP-03 | Fixed             | Whole words wrap ("Stability / Check"); titles are short ("Instability", "Salvation"). But at 23–27px in lixdu (NV-05).                                                                                                                                                                                  |
| VP-04 | Fixed             | One row: a 44px microphone button, then Record Entry (`flow/iphone13/13-journal.png`, `flow/small/13-journal.png`).                                                                                                                                                                                      |

**Counts:** 59 fixed, 3 fixed differently (all acceptable), 5 partly fixed, 0 not fixed, 0
regressed, and 7 being changed.

**The animation inventory.** Every verdict outside the dice rows was applied, checked in code
and on the 10fps sheets:

- **Splash.** It plays about 1.2s with one fade; the flicker and scan loops are gone.
- **Home.** Swaps take 200ms; the cards fade in over 250ms with no delay, and the float is gone.
- **Steps and the card.** The step slot is persistent. The card back, the glitch, the text
  stagger and the bio-pulse rings are gone. The "Click to continue" pulse runs twice, and the
  dismiss is 220ms.
- **Journal.** The saved beat is in the button's slot, and the auto-journal bar uses `scaleX`.
- **HUD.** The slide-downs and the token glow are gone, and the shake eases out.
- **Endings.** The GAME OVER title fades in as one word.
- **Dialogs.** One entrance for every dialog.
- **Other.** The keyboard-hint toast and the button-bar resize are gone.

The dice rows are being redesigned.

### New issues

#### NV-01 · S2 · On landscape phones the top of the intro is cut off and cannot be reached

- **Surface, viewport:** the game intro; 844x390 and 750x342.
- **What happens:**
  - In landscape, `.intro-story-container` is a row with `align-items: center`. The text area
    is taller than the screen (575px of 390, 601px of 342), so it is centred and overflows the
    top and bottom.
  - Its own scroller is as tall as its content (scrollHeight equals clientHeight), so it never
    scrolls and the scroll cue never shows.
  - The player lands mid-paragraph ("…discover you.") with no game title and no "Who you are"
    heading. The column top is at −77px and −113px.
- **Evidence:** `flow/land844/01-intro.png`, `flow/landscape/01-intro.png`,
  `flow/m-landscape-intro.png`, and the parent chain from `intro-land.cjs` (the scroll area is
  575px inside a 390px container).
- **Recommendation:** in the landscape rule, let the text area take the column's height
  (`align-self: stretch; min-height: 0` on `.intro-scroll-area`), so `.content` scrolls and the
  cue appears. Keep the button centred in its own column.
- **Effort:** S. `src/lib/components/GameScreen.svelte:1214` (the landscape
  `.intro-story-container` rule).

#### NV-02 · S2 · The rule caption covers the card line, the title and the result line on short tables

- **Surface, viewport:** Stability check and round screens; 1280x720, 1280x800, 360x640,
  844x390, 750x342.
- **What happens:** the caption sits at the top of the table. The context block grows upwards
  from 40% of the table, and is now taller: RF-03's card line, VP-03's two-line titles and the
  modifier notice. On short tables the two collide:
  - **1280x720:** the caption hides the card line and the top of "STABILITY".
  - **1280x800 (return-king check):** the caption's text prints over the card line.
  - **360x640:** the card line is cut by the caption's border.
  - **Landscape:** the caption hides "ROUND 1" and the top of the result line ("Rolled 3 (high
    of 3, 2) · Draw 2 cards").

  Only 1440x900 and taller are clear.

- **Evidence:** `flow/m-check-overlap.png` (crops from `flow/d1280x720/09-…`,
  `special/desktop/03-…`, `flow/d1440/09-…`), `flow/m-small.png` (09),
  `flow/m-landscape-intro.png` (05, 07).
- **Recommendation:** put the caption in the same flow as the context block (caption, card line,
  title, result, in one column anchored at the top of the table, with the dice below), so they
  push each other instead of overlapping. If that is too big a change, hide the caption while the
  context block would reach it.
- **Effort:** S–M. `src/lib/components/RuleCaption.svelte:47-55` (absolute, top 8px),
  `src/lib/components/game/ContextBackground.svelte:56` (`bottom: 60%`).

#### NV-03 · S2 · After leaving a game, the home screen cannot scroll

- **Surface, viewport:** home after Leave (or any client-side route back from a game); iPhone 13,
  844x390, 1280x720, and any viewport where the cards overflow.
- **What happens:**
  - The game layout's global rules (`body > main` set to `overflow: hidden`, or `visible` at
    450px wide or 600px tall and less) stay loaded after client-side navigation. `html` is
    `overflow: hidden`, so nothing scrolls.
  - **iPhone 13:** the second game's Play sits at y=1005 and cannot be reached.
  - **844x390:** the saved game's Continue, New game and Delete save are below the fold and
    cannot be reached.
  - **1280x720:** the Play buttons sit at the bottom edge.
  - A fresh load scrolls fine (`main` is `overflow-y: auto`).
  - The rule predates the PR. HM-01's taller cards (400–530px) are what made it matter.
- **Evidence:** `home-after-game.cjs` output, `home-after-game/<vp>/01-fresh-load.png` against
  `02-after-game.png`, and `newgame-land.cjs` (the button stays at y=665 after
  `scrollIntoView`).
- **Recommendation:** scope those rules to `.game-layout` (or toggle a class on `body` from the
  game layout with an effect that removes it on leave). Give the home page its own scroller.
- **Effort:** S. `src/routes/game/+layout.svelte:22-36`.

#### NV-04 · S3 · A step's last result carries into its next visit: a stale label and a stale announcement every round

- **Surface, viewport:** start of every round, and every second Stability check in a round; all
  viewports. Most noticeable with a screen reader.
- **What happens:**
  - The roll composables are reset on screen entry, after GameScreen has already derived the
    button label and the result line from the previous visit.
  - **Entering Round 2:** the button crossfades from "Draw 0 Cards" to "Roll for tasks", and the
    live region announces Round 1's "Rolled 8 · Draw 3 cards".
  - **Entering a second Stability check:** the label crossfades out of a stale "Continue".
  - The visual ghost lasts about 120ms under the fading overlay; the iPad run caught "DRAW 0
    CARDS ROLL FOR TASKS" in the button.
  - The wrong announcement is heard at the start of every round.
- **Evidence:** `stale/desktop/rec.txt` (the lines at 11345ms and 18705–18846ms),
  `flow-ipad.log` (journal-saved-250ms), and `round2 live` in every `flow/<vp>/probes.json`.
- **Recommendation:** reset a step's state when its screen is left (or key it by round and visit),
  so nothing stale is derived on entry. Announce a result line only when it changes on the current
  screen.
- **Effort:** S. `src/lib/components/GameScreen.svelte:232-236` (announcer effect), `519-555`
  (reset on entry).

#### NV-05 · S3 · On phones the screen title is in the display face below 28px

- **Surface, viewport:** Instability, Round N, Stability check, Salvation; 360x640 (23px), iPhone
  13 (25px), 750x342 (27px).
- **What happens:**
  - VP-03's `clamp(1.25rem, 6.5vw, 3.5rem)` keeps lixdu at 23–27px.
  - The house rule (`src/styles.css:47`, CLAUDE.md) puts the display face at 28px and up only.
  - The component's own comment says 20px.
  - The intro's section headings are lixdu at 20px on every viewport (MN-07).
- **Evidence:** `fonts` in `flow/iphone13/probes.json`, `flow/small/probes.json` and
  `flow/landscape/probes.json`, and `flow/m-small.png`.
- **Recommendation:** below 28px, set the title in the UI face (Inter 700, uppercase): lixdu at
  28px does not fit "INSTABILITY" in 328px. Do the same for intro headings under 28px, and fix the
  comment.
- **Effort:** S. `src/lib/components/game/ContextBackground.svelte:84-86`,
  `GameScreen.svelte:1057-1067`.

#### NV-06 · S3 · A card modifier's notice outlives its moment

- **Surface, viewport:** the Salvation screen after a skip-damage Ace; all viewports.
- **What happens:**
  - The modifier notice shows on every table screen for the rest of the round.
  - When a skip-damage Ace is the round's last card, Salvation reads "Salvation / Roll to remove
    a token. You need 14+. / No Stability check this time". That reads as if this roll were
    skipped.
  - The notice stays under the Salvation result too.
- **Evidence:** `special/desktop/07-salvation.png`, `08-salvation-nat1-at-result.png` (the
  skip-damage Ace confirmed last, then Salvation).
- **Recommendation:** show the notice only on the first screen after the card, or name the card
  in it ("A♣ · No Stability check this time").
- **Effort:** S. `src/lib/components/GameScreen.svelte:91-95, 124, 130`.

#### NV-07 · S4 · The voice note blames a "blocked" microphone for every failure

- **Surface, viewport:** journal, Voice note; all.
- **What happens:** with no microphone (NotFoundError), the sheet still says "The microphone is
  blocked. Allow it in your browser to record." Every `getUserMedia` error gets this line.
- **Evidence:** `journal/desktop-nomic/01-recording.png`, `journal/m-voice.png`.
- **Recommendation:** NotAllowedError gets the blocked line. NotFoundError gets "No microphone
  found." Anything else gets "Couldn't start recording."
- **Effort:** S. `src/lib/components/journal/VoiceNote.svelte:64-68`.

#### NV-08 · S4 · "Your progress is saved" is not true before the opening roll

- **Surface, viewport:** Exit on the Instability screen before rolling; all.
- **What happens:** `saveGame` skips the `initialDamageRoll` state, so leaving there keeps no
  save. The home card shows Play, not Continue. Little is lost (the intro), but the dialog
  promises otherwise.
- **Evidence:** `newgame-land.cjs` first run (Play after Leave), `indexedDBStorage.js:219-229`.
- **Recommendation:** save at `initialDamageRoll` too (resume onto the opening roll), or word the
  dialog for that step.
- **Effort:** S.

### Overall verdict

The fix round landed, and it shows:

- **Rules.** The game now tells the truth about its rules: Lucid and Surreal behave the same on
  every roll, survive a save, reset per game and say which die counted.
- **The card.** A card reads in about 250ms, says what it does, and leaves in 220ms.
- **The ending.** It is staged without dead frames.
- **Home, story mode and dialogs.** These look designed rather than assembled.
- **Accessibility.** Keyboard-only play, focus rings, the skip link, card names, one live region
  and static dice under reduced motion are at a level few hobby games reach.

The first-time path is also good now: a 1.2s splash, one choice, and a home with art.

It is not at the award-winning bar yet, for three reasons:

1. **Layout on common screens.** The table still loses to the screen on short and landscape
   viewports. The caption covers the card line and the title at 1280x720 and 1280x800 (NV-02),
   and the landscape intro hides its own title (NV-01).
2. **The home after a game.** Leaving a game breaks scrolling on the home screen on phones
   (NV-03).
3. **Unfinished work.** Pace (RF-01, about 10 inputs a round) and the HUD and dice staging are
   still mid-change.

Fix NV-01 to NV-03 before this merges, all three are S effort. Then do NV-04 and NV-05 with the
HUD redesign. After that, the remaining gap is polish rather than defects.

## Recommendations

### Earlier reviews: what is fixed, open, or fixed badly

The earlier reviews are `playthrough/reviews/game-ux.md`, `visual-design.md` and
`visual-design-v2.md` in the scratchpad.

**Fixed well by PR #50:**

- the table-tap re-roll;
- a result line on every roll, held until Continue;
- one button per step, in the same slot;
- Space and Enter press the visible button;
- one-time rule captions;
- numbers in the HUD (n/20, n/4, tokens left);
- the CompactHUD on phones;
- King escalation (the pulse speeds up per King);
- Stability tiers with the damage flash;
- journal prompts, status line and saved beat;
- the ending's cause line, recap, afterword and Read your story;
- rank and suit on cards;
- dice hidden at rest;
- ContextBackground contrast;
- "GAME OVER" spacing;
- the zoom lock removed;
- tap-to-advance removed from the intro;
- a content column and centred CTAs on desktop.

**Fixed badly:**

- **The keyboard hint** now renders as a clipped strip (HD-04, RC-01).
- **The 2d20 caption** ("high of 15, 6") is wired to a field dice-box never fills (LS-03).
- **The "Entry saved" beat** is too faint to register (JR-02).
- **The fourth-King beat** exists but sits between dead frames, away from the card (EN-01).
- **Captions.** The "Skip always" choice silently turns captions off (RC-03).
- **Dice placement.** Dice no longer cover the HUD, but now land on the result line (RF-02).

**Still open:**

- no authored art direction, and an empty home (HM-01);
- the Stability panel's stray tab (HD-01);
- the Stability check never names its card (RF-03);
- the 3D dice ignore reduced motion (AC-04);
- the display font used at small sizes (MN-07);
- the turbulence fog cost on phones (AN-04);
- fonts still load from Google Fonts. When it is unavailable (as in these captures), HUD
  numbers fall back to the system monospace and Orbitron is lost. Self-host Inter and one mono.

### Prioritised plan

Effort: S under half a day, M one to three days, L longer.

**1. Rules the player is misled about (all S1/S2, all S effort, do first)**

1. LS-02: reset `isLucid`, `isSurreal` and `pendingUpdates` in `initializeGame`.
2. LS-04: save and restore `acesRevealed`, `isLucid` and `isSurreal`. Bump `SAVE_VERSION`.
3. ST-01 and HM-05: replace /how-to with the Game Guide, and fix MN-01 (natural 20 on any
   roll).
4. VP-01 stop-gap: "Turn your phone upright" in landscape.
5. CK-01: show what skip-damage and return-king cards do.

**2. The reported Lucid/Surreal "extra confirmation" (S)**

LS-01 (the pill only on the roll button, in its label), LS-03 (read `result.sets`; say which
die counted), LS-07 (arm auto-play on toggle).

**3. One global CSS rule that breaks three components (S)**

HD-04: scope `Game.svelte:131`, so the keyboard hint works. Delete `MiniStatusHUD`.

**4. Pace: target 8 inputs and 25s per round, down from about 15 and 40 (M)**

GS-01 (drop Begin Round), RF-01 (deal on its own after the task roll), LS-05 and LS-06 (resolve
dice at rest, tap to skip, a 400ms guard on a changed button), CK-03 (no dice for automatic
Salvation).

**5. The card, the heart of the game (M)**

AN-01 (600ms card to card, no blank face, no glitch, a 220ms dismiss), AN-02 (a persistent
button slot), RF-04 (size the card to its content; a mechanic footer instead of BYTE-IDs).

**6. Rolls that read (S)**

RF-02 (dice in the lower table, the result line above), RF-03 (name the triggering card),
CK-02 (call it "Salvation" everywhere), GS-03 ("Rolling…" while rolling).

**7. Access (S)**

AC-02 (the card's accessible name is its content), AC-03 (a focus ring on the primary button),
AC-04 (no 3D throw under reduced motion), AC-01 (auto-play holds a card long enough to read it),
AC-05 (one live region).

**8. The ending and the story (M)**

EN-01 (stage the fourth King on the card, 1.5s, no dead frames), EN-02 (the final log on the
ending backdrop), SM-01 (story mode leads with the player's words), SM-02 (current AI models and
a key test), SM-03 and SM-04.

**9. One visual system (M)**

HD-02 (the CompactHUD design at all widths), VP-02, MN-03 (one modal entrance and footer),
MN-07 (display font only for screen titles), AN-03 (one ambient loop; static CTA glow; pause
`NeuralBackground`), and one animation token set (section 14).

**10. First impression (M–L)**

HM-01 (a real home with key art per game), HM-02 (labelled Play and Continue with round and
date), HM-04 (a 1.2s skippable splash, one product name), HM-06 (labelled header actions on
desktop).

### Quick wins (S, about an hour each)

- LS-02 reset; LS-03 `result.sets`; LS-04 save fields.
- HD-04 scope the global rule.
- MN-01 Help text; MN-02 Exit copy.
- EN-04 remove the `console.log`.
- ST-03 redirect /signin.
- CK-03 no dice at 4 Aces.
- AC-03 focus ring.
- RC-02 pause captions under overlays.
- JR-03 timer font and `scaleX`.
- VP-03 title wrap.
- JR-01 fix `data-augmented-ui`.
- SM-03 Escape.
