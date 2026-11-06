# UX and visual QA review

A critical review of every part of the app's UX, with recommendations. This is a working
document: it is committed and pushed after each section so that work survives a container
restart. Branch: `claude/vibrant-curie-w9bn88`.

## Status

- Started: 2026-11-06, against `main` at 17b967d (PR #50 merged).
- Current phase: broad review, next: Auto-play, keyboard, screen reader, reduced motion (coverage item 13).
- Last section completed: Story Library and story mode (items 10-12 done).

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

## Animation inventory

_Every animation in the app: where, trigger, duration and easing, verdict (keep, tune, simplify,
redesign, remove) and why._

## Recommendations

_Prioritised plan, written last: what to fix first and how._
