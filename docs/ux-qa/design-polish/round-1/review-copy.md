# Design polish, round 1: copy and content review

Reviewer: UX writer and content designer. Code under test: `claude/vibrant-curie-w9bn88` @ f9adc3d
(captures at 563b9b1 / f9adc3d). Verdict: **not approved** (24 findings: 2 high, 11 medium, 11 low).

Paths below are relative to `/tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/`
(`shots/`, `sheets/`) or to the repo (`src/...`).

## Method

- Read every visible string in every captured state: the board metrics (`metrics-board.json`, 162 states, roles:
  title, description, eyebrow, result line, step label, caption, notice, card notes) and the surfaces metrics
  (`metrics-surfaces.json`, 88 states). Extracted text dumps: `review-copy/board-text.txt`,
  `review-copy/surfaces-text-iphone13.txt`. Counted line wraps per string per viewport (python over
  `texts[].lines`).
- Opened the sheets and shots that bear on copy (board: salvation-n2-step, notice-skip-damage, caption-easy-fourth-ace,
  caption-ace, caption-king, task-result-nat20, stability-nat1, journal-entry; surfaces: home-return, library-stories,
  settings-home, gameover-loss-stability, final-log-epitaph).
- Grepped every player-facing string in the source: `rollResult.js`, `cardInfo.js`, `storyCards.js`,
  `useRuleCaptions.svelte.js`, `GameScreen.svelte`, `endingSummary.js`, `gameTimeline.js`, the step composables,
  `PlayerInfoBar.svelte`, `HomeHeader.svelte`, `JournalEntry.svelte`, `GameGuide.svelte`, `HelpModal.svelte`,
  settings, HUD cells, `+page.svelte` toasts, error pages.
- Checked accessible names against visible labels (WCAG 2.5.3 Label in Name) from the metrics `controls[].name`.
- Skills applied: vectorlab `verbs` (verb-first, no bare Continue/OK), `labels` (visible labels, placeholders only
  for format), `errors` (blameless, one recovery step, no raw technical text), `empty-states` (header, value line,
  one CTA). References: Microsoft Writing Style Guide (sentence case, numerals, "please"), Google developer style
  (one term per concept, ellipsis), Mailchimp (plain, active, specific).
- Did not reopen owner decisions (BRIEF "Owner decisions", CLAUDE.md rules, ux-qa-review "Owner playtest round" and
  "Playtest follow-ups"): Dream Console / Dimm City naming, Lucid/Surreal on any natural, fourth Ace wins only on
  Easy, the mirrored HUD, "Final log" as the ending's journal, "The fourth Ace was revealed." as the Easy cause line.

## Canonical glossary (proposed; every finding below applies it)

| Concept | Write it | Never |
|---|---|---|
| The life resource | Stability ("−1 Stability", "16/20") | damage, tower, "no loss" |
| The win counter | Token / Tokens, capital T, like Stability | token (lower case), "lost" for a removed Token |
| The win mechanic | Salvation, capital S | salvation |
| Card ranks as game pieces | King, Kings, Ace, Aces | Doom, Bonus, Victory |
| Roll states | Lucid, Surreal | |
| The round's first roll | Roll for tasks (button), "the roll for tasks" (prose) | roll for cards |
| The opening roll | Instability / "the opening roll" | |
| The book | journal | log (alone) |
| One round's writing | entry | |
| The ending's writing | final log | |
| A finished game in the library | story (the place: Story Library) | run, completed game |
| The help content | Game Guide (title), Guide (short label) | Help / Game help / How to play for the same thing |
| Narration | Read aloud | Voice, Audio |
| Automatic play | Auto-play | Auto, Auto-Play, Hands-free (as a feature name) |
| The game list page | home | console, menu, home screen |
| Counts in UI chrome | numerals ("King 1 of 4", "14+") | |
| Counts in prose and ordinals | words ("all four Kings", "the fourth Ace") | "all 4 Kings" |

## Findings

### CP-1-01 · high · "no token lost" reads a missed Salvation as good news

- **Surface:** board result line (Salvation), final-log timeline. **Viewports:** all.
- **States:** salvation-n1-miss, salvation-n2-miss, salvation-n3-miss, salvation-e1/e2/e3-miss, salvation-n1/n2/n3-nat1,
  salvation-e1/e2/e3-nat1, final-log-timeline.
- **Issue:** Tokens are the thing the player wants to lose; Stability is the thing they want to keep. The result line
  uses the same frame for both: "no Stability lost" (good) and "no token lost" (a miss). On a natural 1 the line has no
  other miss signal at all: "Natural 1 · no token lost · Surreal: …" reads as relief. The button the player just
  pressed said "Roll to **remove** a token", so the verb flips between button and result. The timeline already writes
  the same event a third way: "rolled 9 · missed 14+ · 6 left".
- **Evidence:** `shots/board/salvation-n1-nat1/iphone-13.png`, `shots/board/salvation-n2-miss/android-small.png`;
  `src/lib/utils/rollResult.js:176` (`'no token lost'`), `src/lib/utils/gameTimeline.js:71` (`missed ${threshold}+`),
  `gameTimeline.js:31` (`'no loss'` for a 11-19 Stability roll vs the board's "no Stability lost").
- **Recommendation:** one grammar on the board and in the timeline, with the timeline's verb:
  - miss: "Rolled 16 · missed 17+" ; natural 1: "Natural 1 · missed · Surreal" (Hard keeps "+1 Token" / "+2 Tokens").
  - Stability 11-19 in the timeline: "Rolled 11 · no Stability lost" (sentence-case "Rolled", same words as the board).
  - This amends GD-1-07, which keeps "no token lost": drop it. If GD-1-07's "no totals" rule is not adopted, append
    "· 6 left" to the miss as the hit already does.
- **Acceptance:** `grep -rn "no token lost\|'no loss'" src/lib --include=*.js` finds nothing outside tests;
  salvation-n2-miss and salvation-n1-nat1 show "Rolled 9 · missed 14+" / "Natural 1 · missed · Surreal…" at 360 and
  1440; final-log-timeline lines start "Rolled".
- **Files:** `src/lib/utils/rollResult.js`, `src/lib/utils/gameTimeline.js`, `rollResult.test.js`,
  `gameTimeline` tests.

### CP-1-02 · high · The Ace of Hearts fires the "each Ace makes Salvation easier" caption, so Salvation is never introduced on its Ace and the number is wrong when shown

- **Surface:** rule caption (tips on), Help "Rules you've met". **Viewports:** all.
- **States:** caption-ace (Normal), caption-salvation (Normal).
- **Issue:** `drawCard()` sets `aceOfHeartsRevealed = true` when the card is drawn
  (`gameActions.svelte.js:315`), but `acesRevealed` only goes up in `confirmCard()` (`:430`). The caption tracker
  observes the flag flip first (no Ace count change, nothing fires), then on confirm sees `aces` 0→1 with
  `heartsAce` already true in both snapshots, so `next.heartsAce && !before.heartsAce` is false and it takes the
  `ace` branch (`useRuleCaptions.svelte.js:117-122`): the Ace of Hearts teaches "Each Ace makes salvation easier. You
  now need 17+." before Salvation was ever introduced. "Salvation unlocked" then only fires on the first Salvation
  screen and, behind the queue, shows on **round 3**. In the capture the Ace caption shows on round 2 reading
  "You now need 17+" while the HUD shows Aces 2/4 and the next Salvation button says 14+. The unit test that should
  catch this flips both fields in one observation (`useRuleCaptions.test.js:220-226`), which the real flow never does.
  (GD-1-02 covers the late queue and wording; this is the trigger bug underneath it.)
- **Evidence:** `shots/board/caption-ace/iphone-13.png` (caption 17+, HUD ACES 2/4); manifest-board capture note
  ("Salvation unlocked only on round 3's Roll for Tasks"); code lines above.
- **Recommendation:** in `observe`, decide on the confirmed card, not the flag: when `aces` increases and the
  confirmed card (last log entry) is A♥, fire `salvation`; otherwise fire `ace`. Build each caption's text when it is
  shown, from the live `acesRevealed` (GD-1-02's timeless wording also works). Add a test that observes
  `drawCard` (heartsAce true, aces 0) then the confirm (aces 1) and expects `salvation`, and one where A♦ came first
  (aces 1 → A♥ makes 2) that still expects `salvation`.
- **Acceptance:** the two new unit tests pass; a scripted Normal game shows "Salvation unlocked…" as the first caption
  after the Ace of Hearts (on its Stability check or the first Salvation screen), and no caption ever names a
  threshold different from the Aces tile's.
- **Files:** `src/lib/composables/useRuleCaptions.svelte.js`, `useRuleCaptions.test.js`.

### CP-1-03 · medium · Two header toggles fail Label in Name: visible "Voice" is announced as "Toggle Audio"

- **Surface:** in-game header bar (721px and up), home hamburger. **Viewports:** iphone-13-landscape, ipad-portrait,
  laptop, desktop (bar); phones (hamburger).
- **States:** every board state at those widths; autoplay-on; home-menu.
- **Issue:** WCAG 2.5.3 (Level A): the accessible name must contain the visible label. Measured names
  (`metrics-board.json` round-start/desktop controls): visible "Voice" → name "Toggle Audio" (does not contain
  "Voice"); visible "Auto on" → name "Toggle Auto-Play" (does not contain "Auto on"). A voice-control user saying
  "click Voice" gets nothing, and a screen reader hears a third name for the feature. "Toggle" is also redundant with
  `aria-pressed` (the role already says "toggle button"), and the home hamburger is named "Toggle menu".
- **Evidence:** `shots/board/round-start/desktop.png`, `shots/board/autoplay-on/desktop.png`;
  `src/lib/components/status/PlayerInfoBar.svelte:238-250`, `src/lib/components/home/HomeHeader.svelte:159`.
- **Recommendation:** drop the `aria-label` on the two toggles so the name is the visible text, and use the glossary
  names: visible "Auto-play" and "Read aloud" (no " on" suffix; the state is `aria-pressed` plus the active style,
  as the phone menu already does with its On/Off chip). Hamburger `aria-label="Menu"` (keep `aria-expanded`). The
  removed "Player · Guest" segment (CP-1-08) frees the width "Read aloud" needs at 721px.
- **Acceptance:** an accessibility snapshot at 768 and 1440 lists the bar buttons as "Exit game", "Game Guide" (or the
  visible "Guide", see CP-1-04), "Game settings", "Change dice theme", "Auto-play" (pressed/not pressed), "Read aloud"
  (pressed/not pressed); every visible bar label is a substring of its name; the label fits on one line at 721px.
- **Files:** `src/lib/components/status/PlayerInfoBar.svelte`, `src/lib/components/home/HomeHeader.svelte`.

### CP-1-04 · medium · One feature, two to four names across breakpoints and dialogs

- **Surface:** home nav, home menu, in-game bar and menu, modal titles, static pages, dialogs. **Viewports:** all.
- **States:** home-menu (phone and desktop), game-menu, help-home, help-game, settings-home, dice-theme-home,
  dice-theme-game, page-how-to, page-about, page-404, page-game-not-found, library-stories, exit-confirm-game,
  final-log-epitaph, any board state at ≥721px.
- **Issue:**
  - Read aloud: bar "Voice", name "Toggle Audio", phone menu "Read aloud", Settings Play mode "Read aloud", Advanced
    heading "Read aloud" (and Settings has a separate "Voice" field that picks the voice).
  - Auto-play: bar "Auto"/"Auto on", name "Toggle Auto-Play", menu "Auto-play", Settings heading "Auto-play".
  - Help: home nav and menu "Help", in-game bar "Help" (name "Game help"), modal title "Game Guide", Settings caption
    "The Game Guide lists the ones you have met", /how-to page "How to play" (same content).
  - Story Library: desktop nav "Stories", phone menu and page title "Story Library".
  - Dice: bar "Dice", menus "Dice theme", modal title "Dice".
  - Home: "Back to the console" (about, how-to, 404, not-found), "Back to menu" (library back button name), "Home"
    (epitaph), "the home screen" (exit dialog).
  - Leaving: bar "Exit" (name "Exit game"), dialog "Leave the game?" with "Leave".
- **Evidence:** `metrics-board.json` header labels at desktop (Exit, Help, Settings, Player, Dice, Auto, Voice);
  `shots/surfaces/home-menu/desktop.png`; `shots/surfaces/page-404/iphone-13.png`;
  `shots/surfaces/exit-confirm-game/iphone-13.png`; `PlayerInfoBar.svelte:199-298`, `HomeHeader.svelte:136-186`,
  `HelpModal.svelte:27`, `DiceThemePicker.svelte` (title), `StaticPage.svelte:38`, `ErrorScreen.svelte:20`,
  `BrowseGames.svelte:54`, `JournalEntry.svelte:296-303`, `GameScreen.svelte:955-958`.
- **Recommendation (exact):**
  - Bar and menus: "Read aloud", "Auto-play" (CP-1-03); in-game bar "Guide" with name "Game Guide"; home nav
    "Story Library" (there is room from 900px), "Guide"; phone menus "Game Guide", "Dice theme", "Story Library".
  - Modal titles: "Game Guide" (unchanged), "Dice theme". /how-to h1 and tab title "Game Guide" (URL unchanged).
  - Home: static pages, 404 and not-found link "Back to home"; library back button name "Back to home"; epitaph
    "Go home" (as GD-1-20); exit dialog body "Your progress is saved. Pick it up from home."
  - Exit dialog: title "Exit the game?", confirm "Exit game", cancel "Keep playing".
- **Acceptance:** `grep -rn "Stories\|Toggle Audio\|>Voice\|Back to the console\|Back to menu\|Leave the game" src`
  finds nothing user-facing; the same feature carries the same name at 360, 768 and 1440 (home-menu, game-menu,
  board header, modal titles).
- **Files:** as in Evidence.

### CP-1-05 · medium · Game terms change case and wording from screen to screen

- **Surface:** result lines, captions, intro goal, journal status line, ending, Guide, Settings, HUD screen-reader
  text. **Viewports:** all.
- **States:** salvation-*-hit/nat20/hard-*, intro, easy-intro, caption-ace, caption-hard-token, caption-easy-ace-third,
  caption-salvation, journal-entry, final-log-victory, gameover-win-*, help-home, settings-home.
- **Issue:**
  - Token: lower case in result lines ("−1 token · 5 left", `rollResult.js:53,171,175,195`), captions ("roll to remove
    a token"), intro goal ("clear all 10 tokens", `rollResult.js:232`), status line ("10 tokens left",
    `endingSummary.js:100`), timeline (`gameTimeline.js:69-70`); capitalised in the HUD, Guide ("Remove every Token"),
    Settings ("add no Tokens"), Help met list ("remove a Token"), ending recap ("Tokens left"). The same line pairs
    "−1 Stability" with "−1 token" (salvation-n4-loss).
  - Salvation: "salvation" in three captions (`useRuleCaptions.svelte.js:33,35,135`), "Salvation" everywhere else.
  - The first roll of a round: button "Roll for tasks", Guide "the roll for cards" (`GameGuide.svelte:174-175`).
  - Numerals in prose: Guide "all 4 Kings" (`GameGuide.svelte:114`) vs caption "all four Kings".
- **Evidence:** `shots/board/salvation-n4-loss/iphone-13.png`, `shots/board/caption-ace/iphone-13.png`,
  `shots/surfaces/help-home/iphone-13.png`, `shots/board/journal-entry/android-small.png`.
- **Recommendation:** apply the glossary: "Token"/"Tokens" capitalised in every player string (count helper →
  `count(n, 'Token')`; intro goal "clear all 10 Tokens"; status line "10 Tokens left"); "Salvation" capitalised in
  captions; Guide "the roll for tasks" and "all four Kings". This sets the case for GD-1-07's exact lines too
  ("−1 Token", "+2 Tokens").
- **Acceptance:** `grep -rnE "[^A-Z]token|salvation" src/lib --include=*.svelte --include=*.js` shows no lower-case
  player copy (identifiers, comments and tests aside); spot check salvation-n2-hit, caption-ace, journal-entry, help.
- **Files:** `src/lib/utils/rollResult.js`, `endingSummary.js`, `gameTimeline.js`, `useRuleCaptions.svelte.js`,
  `GameGuide.svelte`, tests.

### CP-1-06 · medium · Card types have two vocabularies: VICTORY / DOOM / BONUS on the card, Salvation / King / Ace in story mode

- **Surface:** card face badge and its spoken name, story mode card chips, card mechanic note. **Viewports:** all.
- **States:** card-ace-hearts, card-primary-success(-long), card-king, card-failure-counter(-long), card-final-king,
  card-ace-narrative, card-narrative*, card-skip-damage, card-return-king, card-fourth-ace-easy, story-round-1,
  story-ai-panel.
- **Issue:** `cardInfo.js:15-21` labels the types Victory, Doom, Bonus; `story/storyCards.js:9-15` labels the same
  types Salvation, King, Ace. "Doom" and "Bonus" appear nowhere else in the game; "Victory" is false (GD-1-14). The
  card is spoken "Ace of Clubs, Bonus" in play and "Ace of Hearts, Salvation" in story mode. With the badge fixed, the
  footer then repeats it ("KING" badge over "KING · 1 OF 4"), and the repeated word is what makes the Ace footers
  wrap to two lines at 360-390 (card-ace-narrative, card-ace-hearts).
- **Evidence:** `shots/board/card-skip-damage/iphone-13.png` (BONUS), `shots/surfaces/story-round-1/iphone-13.png`
  ("Ace of Hearts, Salvation"); wrap counts: card mechanic notes 2 lines at android-small and iphone-13.
- **Recommendation:** one shared table (export it from `cardInfo.js`, import it in `storyCards.js`):
  primary-success "Salvation", failure-counter "King", narrative "Ace", challenge "Challenge", event "Event". Footer
  drops the word the badge already says: "1 of 4" (with the pips), "Salvation now needs 14+ · a Stability check
  follows", "Odd · a Stability check follows" (Challenge keeps "Odd", which the badge does not say).
- **Acceptance:** every card badge and `getCardName` uses the table; story mode chips and card badges agree; the Ace
  footers fit one line at 390px.
- **Files:** `src/lib/components/card/cardInfo.js`, `src/lib/components/story/storyCards.js`, their tests.

### CP-1-07 · medium · "Read your story" opens the library list, not the story

- **Surface:** final log epitaph. **Viewports:** all. **States:** final-log-epitaph, final-log-victory-epitaph.
- **Issue:** the primary button says "Read your story" but goes to `/?story=1`, which only sets `showBrowseGames`
  (the Story Library list). The player then has to find the run among the others (library-stories has two identical
  "Future Lost · Escaped" cards). The label promises a destination it doesn't reach.
- **Evidence:** `src/lib/components/JournalEntry.svelte:282-286`, `src/routes/+page.svelte:109-111`;
  `shots/surfaces/library-stories/iphone-13.png`.
- **Recommendation:** open story mode on the run just saved (pass its id: `/?story=<id>`, then open `StoryMode` for
  it; Back returns to the library). If that is not done this round, the label must say what happens: "Open Story
  Library".
- **Acceptance:** after Record final log, pressing the primary button shows this run's round 1 in story mode (or the
  label reads "Open Story Library").
- **Files:** `src/lib/components/JournalEntry.svelte`, `src/routes/+page.svelte`.

### CP-1-08 · medium · The default name "Guest" is shown as if it were information

- **Surface:** in-game header ("PLAYER GUEST", 721px and up), final-log epitaph ("GUEST, ROUND 4"), story mode header
  ("Guest"). **Viewports:** all (header: ≥721px).
- **States:** every board state at iphone-13-landscape, ipad-portrait, laptop, desktop; final-log-epitaph,
  final-log-victory-epitaph; story-round-1 and every story-* state.
- **Issue:** sign-in is off (`REQUIRE_SIGN_IN = false`), so the name is always the fallback "Guest"
  (`routes/game/[slug]/+page.server.js:55`, `routes/game/custom/[slug]/+page.svelte:13`). It takes a labelled slot in
  the header between Settings and the title, signs every epitaph, and sits in every story header: clutter that says
  nothing. In landscape the epitaph's "GUEST, ROUND 4" line is cut by the actions (final-log-epitaph,
  iphone-13-landscape).
- **Evidence:** `sheets/board/salvation-n2-step.png` (PLAYER GUEST), `shots/surfaces/final-log-epitaph/iphone-13.png`,
  `shots/surfaces/story-round-1/iphone-13.png`; `PlayerInfoBar.svelte:215-218`.
- **Recommendation:** treat "Guest" (and an empty name) as no name: hide the header Player segment
  (`PlayerInfoBar.svelte:215-218`), sign the epitaph "Round 4" (`JournalEntry.svelte:251`), and omit the name from the
  story header (`StoryMode.svelte:131-133`). Show the real name only when one exists.
- **Acceptance:** with sign-in off no screen shows "Guest"; the header at 768 and 1440 has no Player segment.
- **Files:** `PlayerInfoBar.svelte`, `JournalEntry.svelte` (epitaph signature), `StoryMode.svelte` (header meta).

### CP-1-09 · medium · "Winning was never likely." is untrue on Easy

- **Surface:** Game Over afterword. **Viewports:** all. **States:** any Easy loss (not captured; see capture requests),
  gameover-loss-kings and gameover-loss-stability (Normal: correct there).
- **Issue:** the afterword is shown on every loss (`GameOver.svelte:90`, `endingSummary.js:12,55`) whatever the
  difficulty. On Easy the player wins 54.9% of games (CLAUDE.md), so "Winning was never likely" is false and reads as a
  brush-off exactly when an Easy player expected to win.
- **Evidence:** `src/lib/utils/endingSummary.js:12,55`; `shots/surfaces/gameover-loss-stability/iphone-13.png`
  (the line in place).
- **Recommendation:** pass the difficulty to `getEndingText`; on Easy the afterword is "What you wrote along the way is
  the story." (Normal and Hard keep both sentences.)
- **Acceptance:** unit test: Easy loss → afterword without "never likely"; capture an Easy loss.
- **Files:** `src/lib/utils/endingSummary.js` (+ test), `src/lib/components/GameOver.svelte`.

### CP-1-10 · medium · The Difficulty help explains all three levels at once, and the options are out of order

- **Surface:** Settings › Gameplay › Difficulty. **Viewports:** all. **States:** settings-home, settings-game,
  settings-home-end.
- **Issue:** a six-line paragraph above the select covers Easy, Normal and Hard plus "Applies next game"
  (`SettingsModal.svelte:66-71`), whatever is selected; it also says four Aces make Salvation "automatic" (GD-1-01).
  The options run "Game default, Normal, Easy, Hard", so Normal sits between the default and Easy. "Game default"
  doesn't say what the default is.
- **Evidence:** `shots/surfaces/settings-home/iphone-13.png` (help is 6 lines at 390px).
- **Recommendation:** order "Game default, Easy, Normal, Hard". Help text describes the selected option only, two
  short sentences, the second always "Applies from your next game.":
  - Game default: "Each game sets its own; most use Normal."
  - Easy: "The Ace of Hearts starts revealed, and surviving the fourth Ace wins."
  - Normal: "Tokens only ever fall. Remove them all to escape."
  - Hard: "A missed Salvation roll adds a Token (two on a natural 1)."
- **Acceptance:** at 390px the help is at most 3 lines for each option; the text changes with the selection (and
  `aria-describedby` reads the current one).
- **Files:** `src/lib/components/settings/SettingsModal.svelte` (+ test).

### CP-1-11 · medium · The journal is called a journal, a log and a record; the timer doesn't say what comes next

- **Surface:** journal sheet, saved beat, auto-journal timer, final log, ending CTA. **Viewports:** all.
- **States:** journal-entry, journal-saved-beat, journal-auto-timer, final-log, final-log-writing, gameover-*.
- **Issue:** the sheet's eyebrow says "Journal"; the save beat says "Saved to your log"
  (`JournalEntry.svelte:320`); the button is "Record Entry" (title case in source, so the accessible name differs
  from "Record final log" on the same sheet); the ending CTA "Record your final log" opens the sheet whose button is
  "Record final log" (GD-1-20); the countdown reads "Continuing in 27s · type to stay"
  (`AutoJournalTimer.svelte:19`), but "continuing" is the generic word the rest of the game is moving away from
  (GD-1-12).
- **Evidence:** `shots/surfaces/journal-saved-beat/iphone-13.png`, `shots/surfaces/journal-auto-timer/iphone-13.png`,
  `shots/surfaces/final-log/iphone-13.png`.
- **Recommendation:** "Saved to your journal"; button "Record entry" (sentence case in source); timer "Next round in
  27s · type to stay"; ending CTA "Write your final log" (as GD-1-20); the final-log sheet keeps "Record final log".
- **Acceptance:** `grep -rn "Saved to your log\|Record Entry\|Continuing in" src` finds nothing user-facing; the
  journal-saved-beat and journal-auto-timer shots show the new lines.
- **Files:** `src/lib/components/JournalEntry.svelte`, `src/lib/components/journal/AutoJournalTimer.svelte`,
  `src/lib/components/GameOver.svelte`.

### CP-1-12 · medium · HUD screen-reader text follows a different pattern per tile, and the coming tiers (OWN-2) have no words

- **Surface:** HUD tiles' `sr-only` text and tooltips. **Viewports:** all. **States:** every board state; hud-* tiers.
- **Issue:** the six tiles speak six shapes: "Stability 16 of 20" (`StabilityCell.svelte:51`), "Kings: 1 of 4
  revealed" (`KingsCell.svelte:90`), "Last roll 8" / "No roll yet" (`RollCell.svelte:82-86`), "47 of 52 cards left"
  (`CardsCell.svelte:26`), "Aces 2 of 4 (Hearts, Diamonds), Salvation needs 14 or more" (`AcesCell.svelte:41-43`),
  "10 of 10 Tokens left" (`TokensCell.svelte:25-29`). A screen-reader user browsing the row hears the label first on
  some and last on others. OWN-2 will give every tile a colour tier (Stability critical, Cards running out, Tokens
  near zero, Aces unlocking, Roll natural 20/1); colour alone must not carry that meaning (WCAG 1.4.1), and today the
  spoken text has no tier word (the Stability pulse at 4/20 is silent).
- **Evidence:** source lines above; `sheets/board/hud-tiers-iphone-13.png`.
- **Recommendation:** label first, value, then the tier word only when the tier is not the resting one:
  "Stability 4 of 20, critical"; "Kings 3 of 4, one more ends the game"; "Roll 20, natural 20" / "Roll 6, low of 6
  and 15" / "Roll: none yet"; "Cards 5 of 52 left, running out"; "Aces 2 of 4, Salvation needs 14 or more";
  "Tokens 1 of 10 left, one to go" / "Tokens locked until the Ace of Hearts". Tier words come from the same tier
  function that picks the colour (hudTiers.js), so they cannot drift.
- **Acceptance:** a unit test per cell renders the spoken string for each tier; strings start with the visible label.
- **Files:** `src/lib/components/status/*.svelte`, `src/lib/components/status/hudTiers.js`, `hud.test.js`.

### CP-1-13 · medium · Upload and save errors show raw parser text, start with "Error:", vanish in 5 seconds and give no next step

- **Surface:** home toasts. **Viewports:** all. **States:** not captured (capture request CR-C1); toast style in
  home-custom-game.
- **Issue:** `+page.svelte:249` shows `Error: ${result.error}`, where `result.error` is e.g. "Failed to parse game
  file: Parser error: No frontmatter found. File must start with --- frontmatter ---" (`customGames.js:145`,
  `markdownParser.js:36,567`): three error prefixes and markdown jargon in a toast that disappears after 5s. `:252`
  shows a raw JavaScript `error.message`. `:235` "Please choose a .game.md file" (no "please" in instructions:
  Microsoft style). `:167` "That save couldn't be opened" names no way forward. `customGames.js:137` "Failed to save
  game to storage".
- **Evidence:** code lines above.
- **Recommendation (exact):**
  - wrong type: "Choose a file that ends in .game.md."
  - parse failure: "Couldn't add “<file name>”: <reason>. Fix the file and upload it again." where `<reason>` is the
    validation message without its prefixes, e.g. "it doesn't start with a --- block" (map the five most common
    `ValidationError`s to plain reasons; fall back to "it isn't a valid game file").
  - storage: "Couldn't save the game in this browser. Free up some space and try again."
  - unknown error: "Couldn't add that file. Try again, or check it opens in a text editor."
  - bad save: "That save couldn't be opened. Start a new game or delete the save."
  - error toasts stay until dismissed (or 10s), with `role="alert"`; success toasts keep 3-5s.
- **Acceptance:** upload a .txt, a file with no frontmatter and a file with a bad card line; each toast matches the
  copy above, has no "Error:"/"Failed"/"Parser" prefix, and stays ≥10s.
- **Files:** `src/routes/+page.svelte`, `src/lib/stores/customGames.js`, `src/lib/parsers/markdownParser.js`
  (reason strings), `src/lib/components/home/Toast.svelte`.

### CP-1-14 · low · Ending recap labels: "Rounds survived" counts the round you fell in, and four labels wrap

- **Surface:** Game Over recap tiles, story mode stats. **Viewports:** all; wrap at 360-390.
- **States:** gameover-loss-kings, gameover-loss-stability, gameover-win-*, game-over-stability, game-over-kings,
  game-over-win.
- **Issue:** the fourth King came in round 4 and the recap says "Rounds survived 4" (`endingSummary.js:71`).
  Four of the six labels wrap to two lines on phones ("ROUNDS / SURVIVED", "KINGS / REVEALED", "ACES / REVEALED",
  "FINAL / STABILITY") while "CARDS DRAWN" fits, so the tiles read unevenly; the HUD the player watched all game
  called the same things Stability, Kings, Aces, Cards, Tokens.
- **Evidence:** `shots/surfaces/gameover-loss-stability/iphone-13.png`, `shots/surfaces/gameover-loss-kings/iphone-13.png`.
- **Recommendation:** labels "Rounds", "Cards", "Kings", "Aces", "Stability", "Tokens" (the HUD's words; one line at
  360px); values "n/max" per GD-1-22.
- **Acceptance:** at 360px every recap label is one line; no "survived".
- **Files:** `src/lib/utils/endingSummary.js` (labels, + test); `src/lib/components/RunRecap.svelte` renders them.

### CP-1-15 · low · The Game Guide lists an ending that can't happen

- **Surface:** Game Guide › How it ends; /how-to. **Viewports:** all. **States:** help-home-mid/-end, page-how-to-mid.
- **Issue:** "You are lost if the deck runs out first." (`GameGuide.svelte:229`). Every unrevealed King is still in
  the deck and the fourth one ends the game, so the deck can never run out first (return-king puts a King back, so
  the same holds). A rule that never fires costs reading time and invites "what happens then?".
- **Evidence:** `GameGuide.svelte:222-231`; `gameActions.svelte.js:272-277` (the only deck-empty path, with no
  cause line).
- **Recommendation:** delete the bullet. The list is then "You escape… / You fall… / You are taken…".
- **Acceptance:** the Guide has three ending bullets.
- **Files:** `src/lib/components/GameGuide.svelte`.

### CP-1-16 · low · Lucid and Surreal are explained six different ways

- **Surface:** caption, result line, step hint, HUD arrows (name and tooltip), Guide, Help "Rules you've met".
- **Viewports:** all. **States:** caption-lucid/surreal, stability-nat20/nat1, round-start-lucid/surreal,
  hud-roll-*-pending, help-home-mid.
- **Issue:** "Lucid. Your next roll uses two dice and keeps the higher." / "Lucid: your next roll keeps the higher of
  two dice" / "Lucid: 2 dice, keep high" / "Lucid: next roll keeps the higher of two dice" / "Lucid (off): a natural 20
  makes the next roll keep the higher of two dice" / "your next roll uses two d20s and keeps the higher". Numerals and
  words for the same "two", "high" vs "higher", "d20s" vs "dice".
- **Evidence:** `rollResult.js:37-41`, `useRuleCaptions.svelte.js:126-130`, `hudTiers.js:125-134`,
  `GameGuide.svelte:176-180`, `HelpModal.svelte:21-22`.
- **Recommendation:** two forms only. Long (caption, Help met list, Guide, HUD arrow name when on): "Lucid: your next
  roll uses two dice and keeps the higher." / "…keeps the lower." Short (the roll hint wherever GD-1-09 puts it):
  "Lucid · two dice, keep the higher". HUD arrow when off: "Lucid: off". Result lines: the single word (GD-1-07).
- **Acceptance:** `grep -rn "keep high\|keep low\|2 dice\|d20s" src/lib` finds nothing user-facing.
- **Files:** as in Evidence.

### CP-1-17 · low · Confirm dialogs use different button patterns and say "can't be undone" twice

- **Surface:** confirmation dialogs. **Viewports:** all.
- **States:** confirm-delete-save, confirm-new-game, confirm-remove-game, library-delete-confirm, exit-confirm-game.
- **Issue:** cancel is "Keep it" (three dialogs), "Keep my save", "Keep playing"; confirm is "Delete save", "Remove
  game", "Start new game", but just "Delete" for a story. The story body says "will be deleted for good. This can't be
  undone." (`BrowseGames.svelte:34`). The new-game body names the game twice: "Start Locked In the Tech District
  again? This replaces your Locked In the Tech District save (Round 3), and can't be undone." (`+page.svelte:217`).
- **Evidence:** `shots/surfaces/library-delete-confirm/iphone-13.png`, `shots/surfaces/confirm-new-game/iphone-13.png`.
- **Recommendation (exact):** cancel "Keep <object>", confirm "<Verb> <object>":
  - Delete save: "Delete your <game> save (Round 3)? This can't be undone." → "Keep save" / "Delete save".
  - New game: "Start <game> from the beginning? Your Round 3 save will be replaced. This can't be undone." →
    "Keep my save" / "Start new game".
  - Remove game: "Remove <game> from your games? To play it again, upload its file." → "Keep game" / "Remove game".
  - Delete story: "“Future Lost” (Escaped, Nov 7, 2026) and its journal will be deleted. This can't be undone." →
    "Keep story" / "Delete story".
  - Exit: per CP-1-04.
- **Acceptance:** each dialog shows the copy above; no "for good"; no bare "Delete" or "Keep it".
- **Files:** `src/routes/+page.svelte`, `src/lib/components/BrowseGames.svelte`.

### CP-1-18 · low · Punctuation: three-dot ellipses, straight quotes, a button that ends with a full stop

- **Surface:** opening roll description, custom-game loading, upload toast, first-run panel.
- **Viewports:** all. **States:** instability-roll, rm-instability-roll, home-custom-game, first-run.
- **Issue:** "…how much ground you've already lost..." uses three full stops (`GameScreen.svelte:128`) while the rest
  of the UI uses "…" ("Rolling…", "Connecting to the ether…", "Reading the game file…"); so does "Loading custom
  game..." (`routes/game/custom/[slug]/+page.svelte:62`). The toast writes `Added "The Night Archive"` with straight
  quotes (`+page.svelte:247`) where dialogs and error pages use “ ”. The first-run button "I know how to play: don't
  show tips." ends with a full stop (`FirstRunPanel.svelte:25`); buttons don't.
- **Evidence:** `shots/board/instability-roll/iphone-13.png`, `shots/surfaces/home-custom-game/iphone-13.png`,
  `shots/surfaces/first-run/iphone-13.png`.
- **Recommendation:** "…" everywhere (the instability description itself is rewritten in GD-1-05, without the
  trailing ellipsis); toast `Added “The Night Archive”`; "Loading the game…"; first-run link "I know how to play: skip
  the tips" (no full stop).
- **Acceptance:** `grep -rn "\.\.\.['\"<\`]" src --include=*.svelte` finds no user-facing string; quotes are curly in
  all user-facing strings.
- **Files:** as in Evidence.

### CP-1-19 · low · Labels are typed in four cases in the source, so accessible names don't match their siblings

- **Surface:** step button, journal, intro, home menu, caption label. **Viewports:** all (visible text is uppercased
  by CSS; screen readers, voice control and narration use the source).
- **States:** task-result, journal-entry, intro, home-menu, caption-*.
- **Issue:** "Draw 5 Cards" (`useRollForTasks.svelte.js:122`) next to the result "Draw 5 cards"; "Record Entry"
  (`JournalEntry.svelte:328`) next to "Record final log"; "Begin Your Journey" (`GameScreen.svelte:936`); "Upload
  Game", "Dice Theme", "Sign Out" (`HomeHeader.svelte:170-190`) next to "Story Library"/"Settings"; caption label
  "RULE" typed in capitals (`RuleCaption.svelte:39`).
- **Recommendation:** sentence case in source for every label ("Draw 5 cards", "Record entry", "Begin your journey",
  "Upload game", "Dice theme", "Sign out", "Rule"); case is CSS's job.
- **Acceptance:** an accessibility snapshot of those states shows sentence-case names; tests that match the old
  strings are updated.
- **Files:** as in Issue, plus `screenComposables.test.js` and e2e selectors.

### CP-1-20 · low · Settings still talks about journal "prompts" the game no longer has

- **Surface:** Settings › Advanced › Read aloud and Auto-play. **Viewports:** all. **States:** settings-home-advanced,
  settings-home-advanced-end.
- **Issue:** "Read prompts / Read screen prompts and instructions." and "Journaling / What happens at each journal
  prompt." (`AudioSettings.svelte:45-46,153-154`). The owner removed the journal prompts; in this game "prompt" now
  only means the author's card text. The options "Manual: you continue / Skip: continue at once / Timed: pause with
  countdown" use "continue" for two different things.
- **Recommendation:** "Read instructions" / "Read each step's instructions aloud."; "Journal" / "What happens when the
  journal opens."; options "Wait for me", "Skip the journal", "Count down, then move on".
- **Acceptance:** no "prompt" in Settings; options read as above.
- **Files:** `src/lib/components/settings/AudioSettings.svelte`.

### CP-1-21 · low · The Story Library calls one thing a run, a completed game and a story

- **Surface:** Story Library header and empty state. **Viewports:** all. **States:** library-empty, library-stories.
- **Issue:** subtitle "Your finished runs, in your own words." over the empty-state heading "No completed games yet",
  whose body says "its story is kept here"; the cards say "Read story" and the menu "Delete story…".
- **Evidence:** `shots/surfaces/library-empty/iphone-13.png`; `BrowseGames.svelte:62,90-92`.
- **Recommendation:** subtitle "Your finished games, in your own words."; empty heading "No stories yet"; body
  unchanged; CTA "Choose a game" unchanged.
- **Acceptance:** library-empty shows the new heading and subtitle.
- **Files:** `src/lib/components/BrowseGames.svelte`.

### CP-1-22 · low · A modifier is described four ways, and its notice names cards two ways

- **Surface:** card face note, board notice, final-log timeline, story mode. **Viewports:** all.
- **States:** card-skip-damage, card-return-king, notice-skip-damage, notice-return-king(-result), final-log-timeline.
- **Issue:** skip-damage: "No Stability check this time" (card), "A♣ · No Stability check this time" (notice), "no
  Stability check" (timeline), "No Stability check" (story). return-king: "A King returns to the deck" (card), "King of
  Hearts returns to the deck · 0 of 4" (notice: the full name, and a bare count), "Returns a King to the deck"
  (story), and when no King is out "No King is out to return" (card, `cardInfo.js:130`) vs "No King to return"
  (notice, `gameActions.svelte.js:374`). The two notices name their card differently (glyph vs words).
- **Evidence:** `cardInfo.js:123-133`, `storyCards.js:16-19`, `gameActions.svelte.js:386,453`,
  `GameScreen.svelte:143-146`, `gameTimeline.js:114-124`.
- **Recommendation:** card face (present): "No Stability check for this Ace" / "A King goes back into the deck";
  notice and timeline (past, glyph first, as GD-1-13): "A♣ skipped its Stability check" / "K♥ went back into the deck
  · 0 of 4 Kings out"; story mode uses the notice wording.
- **Acceptance:** the four surfaces use those two sentence pairs only.
- **Files:** as in Evidence.

### CP-1-23 · low · Key fields use the placeholder to repeat the label

- **Surface:** AI settings and voice service fields. **Viewports:** all. **States:** story-ai-settings,
  settings-home-advanced (add a voice service, not captured open).
- **Issue:** label "API key" with placeholder "Paste your API key" (`AIProviderSection.svelte:129`); "Paste your key"
  (`TTSSection.svelte:285,325`). Placeholders are for format hints; these restate the label and vanish on input.
- **Recommendation:** Anthropic placeholder "sk-ant-…", OpenAI "sk-…", others none; keep the existing helper line
  ("Create one at …"), and add "Stored only in this browser." as helper text under each key field.
- **Acceptance:** no key field placeholder starts with "Paste".
- **Files:** `src/lib/components/settings/AIProviderSection.svelte`, `TTSSection.svelte`.

### CP-1-24 · low · Shipped game metadata: "Locked In the Tech District" and an unhyphenated subtitle

- **Surface:** home card, header title, library, story mode, tab title. **Viewports:** all.
- **States:** home-*, card-*-long, library-stories, gameover-loss-stability.
- **Issue:** the built-in game's title capitalises a short preposition ("Locked In the Tech District"; title case
  keeps "in" lower case), and its subtitle "Grab and go turned mad dash for the gate"
  needs the compound modifier hyphenated and an article. This is the shipped game file, not player text.
- **Evidence:** `static/games/ghost-in-the-machine.game.md:2-3`; `shots/surfaces/library-stories/iphone-13.png`.
- **Recommendation (owner's call, author content):** "Locked in the Tech District"; "A grab-and-go turned mad dash for
  the gate".
- **Acceptance:** home and library show the new title; the slug is unchanged.
- **Files:** `static/games/ghost-in-the-machine.game.md`, `static/games/index.json` (regenerate).

## GD and VT findings I endorse (copy view), with amendments

- **GD-1-01** ("assured"/"automatic"): agree, exact copy fine. Also covers `hudTiers.js:68` and `HelpModal.svelte:18`.
- **GD-1-02** (captions late and stale): agree; CP-1-02 is the trigger bug under it. King caption: "King 1 of 4. When
  all four are revealed, your journey ends." is right.
- **GD-1-05** (one job per element; the fourth-Ace screen says the same thing four times): agree with the table.
  Amendment: "Roll for Salvation" (not "Roll to remove a token") and Token capitalised (CP-1-05).
- **GD-1-06** ("Roll for damage" → "Roll for Stability"): agree.
- **GD-1-07** (result line grammar): agree with dropping totals and the 9-word Lucid/Surreal sentence (it is why 13
  result strings wrap to 2-3 lines even on desktop). Amendments: "missed 17+" instead of "no token lost" (CP-1-01),
  "Token" capitalised (CP-1-05).
- **GD-1-12** ("Continue" names no destination): agree; with CP-1-11 the journal step is "Open your journal".
- **GD-1-13**, **GD-1-14** (extended by CP-1-06), **GD-1-15**, **GD-1-20**, **GD-1-21**, **GD-1-22**,
  **VT-1-18** (dangling "·" in the home Continue button): agree.

## Capture requests for round 2

- **CR-C1** Upload error toasts at iphone-13 and desktop: a .txt file, a .game.md with no frontmatter, a .game.md with
  a malformed card line; and the "save couldn't be opened" toast (corrupt the IndexedDB save).
- **CR-C2** A real Normal game (tips on) where the Ace of Hearts is the first Ace: the caption on its Stability check
  and on round 1's Salvation; and a game where the Ace of Diamonds comes before the Ace of Hearts.
- **CR-C3** An Easy loss (Stability and Kings) through to Game Over, to read the afterword.
- **CR-C4** The epitaph's primary button pressed: the screen it lands on.
- **CR-C5** The header bar at 768 and 1440 with Auto-play and Read aloud both on, plus a Playwright accessibility
  snapshot (`page.accessibility.snapshot()`) of the bar and of the HUD row at Stability 4, Cards 5, Tokens 1, Kings 3.
- **CR-C6** Settings with each Difficulty option selected (Game default, Easy, Normal, Hard) at 390 and 1440.
- **CR-C7** The opening instability roll on a natural 1 and a natural 20 (result line copy).
- **CR-C8** Settings › Advanced › "Add a voice service" opened (key field placeholders).

## Skill audit notes

- **verbs:** 45 board states end on "Continue" (GD-1-12); "Home", "Previous"/"Next" (story nav, acceptable as
  pagination), "Done" on dialogs (owner decision MN-03, kept). Everything else is verb-first.
- **labels:** every Settings and journal control has a visible, bound label; the only placeholder misuse is CP-1-23.
- **errors:** the only blaming-adjacent copy is "You didn't write this round." in story mode, which is neutral fact,
  kept; error pages and the not-found screens are fine ("We couldn't find a game called “…”." + a way home);
  toasts fail (CP-1-13).
- **empty-states:** the Story Library empty state has header, value line and one CTA ("Choose a game"); only its noun
  changes (CP-1-21).
