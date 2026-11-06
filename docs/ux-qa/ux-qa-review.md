# UX and visual QA review

A critical review of every part of the app's UX, with recommendations. This is a working
document: it is committed and pushed after each section so that work survives a container
restart. Branch: `claude/vibrant-curie-w9bn88`.

## Status

- Started: 2026-11-06, against `main` at 17b967d (PR #50 merged).
- Current phase: broad review, next: Game start (coverage item 5).
- Last section completed: Static pages (items 2-4 done).

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

## Animation inventory

_Every animation in the app: where, trigger, duration and easing, verdict (keep, tune, simplify,
redesign, remove) and why._

## Recommendations

_Prioritised plan, written last: what to fix first and how._
