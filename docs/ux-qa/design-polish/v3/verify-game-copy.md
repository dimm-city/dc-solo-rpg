# Verify round 1: game UX + UX writing lenses

Code: origin/claude/vibrant-curie-w9bn88 @ b78e191 (src identical to 31e689a). Evidence: round-2 captures and
metrics (`round-2/metrics-board.json`, `metrics-surfaces.json`, `drift-board.md`), a compact dump of every
visible text and control per state at `v3/gc/compact.json` (query: `python3 -I v3/gc/q.py <state> <vp> tc`).
Out of scope here (being rebuilt for OWN-3/4/5): the board's centre text column and the in-game header position.
Verdicts on centre-column items judge their copy and their own acceptance only.

## Verdicts

| id | verdict | note |
|---|---|---|
| GD-1-01 | resolved | grep `assured|automatic after` in src/lib finds no player copy. salvation-n4-step: "No target now. Survive this Stability check and a Token comes off." / "Roll for Salvation"; card-skip-damage note "Salvation now has no target"; Settings Normal help no longer mentions four Aces; Guide 4-Ace row "No target: a Stability check, then 1 Token comes off". (Easy gap in the Help tip: see game-copy-v-01.) |
| GD-1-02 | resolved | Real Normal game (real-caption-01..06): odd on the first check, Salvation on the first Salvation screen, Surreal on round 7's roll step with the hint shown, Lucid on the Salvation step with the hint shown, Ace text matches the Aces tile. Priority + still-true + live text in useRuleCaptions.svelte.js:72-104, 187-205. Every caption capitalises Salvation/Token. Scripted caption-lucid/surreal not captured (manifest l.283), the real run covers them. |
| GD-1-03 | resolved | Against its acceptance: per viewport the title bottom, body top (256/338px) and step button are Δ0; title top differs only by one title line (27-29px); captions dock above the button and move nothing. Superseded by the OWN-4 rebuild; re-judged at sign-off. |
| GD-1-04 | resolved | "Final Check"; titles one line at ≥600px and landscape (drift Δh 0), INSTABILITY one line at 360 (24px). |
| GD-1-05 | resolved | Script over every board state at 360/390: no 3-word run shared by caption, description/result, button, notice. Copy matches the table per difficulty (Hard adds "A miss adds one."). Caption vs hint near-duplicate slips the metric on morphology: game-copy-v-06. |
| GD-1-06 | resolved | Every Stability check, the Final Check included, reads "Roll for Stability"; no player label contains "damage". |
| GD-1-07 | open | Grammar is right everywhere. Fails "one line at ≥390px": at iphone-13 seven states wrap to 2 lines (44px): stability-fatal, salvation-n4-fatal, easy-final-fatal ("Rolled 3 · −2 Stability · nothing left to hold on to"), salvation-last-token ("Rolled 15 · the last Token is gone · you escape"), task-result-nat20 ("Natural 20 (low of 20, 20) · 6 cards this round · Lucid"). Satisfy: fatal "Rolled 3 · −2 Stability · you fall" (the Guide's name for the ending, parallel to "you escape"); last token "Rolled 15 · −1 Token · you escape" (same effect grammar as every other hit; keeps GD-1-08's closing words); drop the "(low of a, b)" parenthetical when both dice match. Then re-measure one line at 390. |
| GD-1-08 | resolved | salvation-last-token result and gameover-win-tokens cause line "The last Token was removed." in the victory accent (shot android-small). Shortening per GD-1-07 keeps "you escape". |
| GD-1-09 | resolved | Hint is a line above the button ("Lucid · two dice, keep the higher" / "Surreal · two dice, keep the lower"), present on every roll step with a pending modifier and on no other step (21 pending states checked); step button Δ0. |
| GD-1-10 | resolved | Step label one line in every state at every core viewport (92-103 states each); button Δtop/Δh 0. |
| GD-1-11 | resolved | Key-cap at one x per viewport (laptop 809, desktop 889, all states); label centre = button centre ±1px. |
| GD-1-12 | resolved | "Begin round 1", "Draw the next card", "Go to Salvation" (stability-2-5), "Open your journal", "Escape", "Face the end"; no step reads "Continue"; card-king-final "Tap to face the end", card-ace-fourth-skip-easy "Tap to escape". |
| GD-1-13 | resolved | "A♣ skipped its Stability check", "K♥ went back into the deck · 0 of 4 Kings out"; no "this time". (Whether these notices belong on the board at all is OWN-4.) |
| GD-1-14 | resolved | Badge SALVATION (card-ace-hearts); TYPE_LABELS['primary-success'] = 'Salvation'. |
| GD-1-15 | resolved | easy-intro: "...clear all 10 Tokens, or survive the fourth Ace, to escape."; Normal unchanged. (Verb: game-copy-v-03.) |
| GD-1-16 | resolved | Roll tile "--" in stability-rolling, hud-roll-rolling(-lucid), rm-static-roll; spoken "Roll: rolling". |
| GD-1-17 | resolved | rm-static-roll (no resize) shows the d20 "8" in the lower table, clear of title and button (iphone-13, desktop); placed in CSS in GameScreen.svelte (.static-roll), no --hud-bottom left in src. |
| GD-1-18 | resolved | Max x identical in every hud-* state per tile and viewport (e.g. 360: 54 / 110.5 / 267.3 / 326.4). |
| GD-1-19 | resolved | No HUD contrast fail outside the dice-in-flight frames at landscape (owner decision: dice on top of everything). |
| GD-1-20 | resolved | "Write your final log" → sheet "Record final log"; epitaph "Play again" / "Go home". |
| GD-1-21 | resolved | 360/390: notes break only after a separator (card-ace-hearts "UNLOCKED · NEEDS 17+ · / A STABILITY CHECK FOLLOWS"), journal "Stability 16/20 · 1 of 4 Kings · / 10 Tokens left". |
| GD-1-22 | resolved | Recap tiles in LED n/max (gameover-win-tokens 360). Status-line grammar: game-copy-v-04. |
| OWN-2 | resolved | Game lens: tiers carry meaning and are spoken (Stability "critical", Kings "one more ends the game", Cards "running out", Tokens "halfway there"/"all cleared"); Kings 3/4 loudest in hud-all-worst. Visual execution is the visual lens's call. |
| CP-1-01 | resolved | "Rolled 16 · missed 17+", "Natural 1 · missed · Surreal", Hard "+1 Token"; timeline "Rolled 11 · no Stability lost"; grep finds no "no token lost"/'no loss'. |
| CP-1-02 | resolved | Trigger fixed (lastIsHeartsAce), tests (a)(b)(c) at useRuleCaptions.test.js:56-71; capc2 runs show "Salvation unlocked" as the first caption after the Ace of Hearts in both orders. |
| CP-1-03 | resolved | Bar toggles named by their visible text, aria-pressed carries state; hamburger "Menu". 768px fits; 721 not captured. |
| CP-1-04 | resolved | Game Guide / Dice theme / Story Library / Back to home / Exit the game? everywhere; grep finds none of the old names. Case nit on Settings: game-copy-v-07. |
| CP-1-05 | resolved | Token and Salvation capitalised in board, captions, intro, journal, timeline; Guide "roll for tasks", "all four Kings". |
| CP-1-06 | resolved | One table (cardInfo TYPE_LABELS, used by story chips); footer drops the badge word. The "one line at 390" sub-criterion is not met (card-ace-narrative 390: two lines, y 731/749) but each clause stays whole, so I withdraw that sub-criterion: no player cost. |
| CP-1-07 | resolved | "Read your story" goes to /?story=latest and opens that run (final-log-epitaph-landing shows its round 1). |
| CP-1-08 | resolved | No "Guest" anywhere; no Player segment at 768/1440; epitaph signed "Round 4"; story header has no name. |
| CP-1-09 | resolved | gameover-loss-easy-kings: "What you wrote along the way is the story."; Normal keeps both sentences. |
| CP-1-10 | resolved | Order Game default, Easy, Normal, Hard; help per option + "Applies from your next game.", aria-describedby. |
| CP-1-11 | resolved | "Saved to your journal", "Record entry", "Next round in 27s · type to stay". |
| CP-1-12 | resolved | Label-first spoken text with tier words. Wording error in the 4-Ace string: game-copy-v-02. |
| CP-1-13 | resolved | Toasts match (wrong type, no frontmatter, bad card fallback), role=alert, 10s. |
| CP-1-14 | resolved | Recap labels Rounds/Cards/Kings/Aces/Stability/Tokens, one line at 360; no "survived". |
| CP-1-15 | resolved | Three ending bullets. |
| CP-1-16 | resolved | grep finds no user-facing "keep high/low", "2 dice", "d20s". |
| CP-1-17 | resolved | Keep save/Delete save, Keep my save/Start new game, Keep game/Remove game, Keep story/Delete story; no "for good". |
| CP-1-18 | resolved | App strings use "…" and curly quotes; first-run "I know how to play: skip the tips". Leftover only in the exported, unused GameSelector.svelte:97,217 ('Uploading...', 'Upload Custom Game'). |
| CP-1-19 | resolved | Sentence case in source for every named label. |
| CP-1-20 | resolved | "Read instructions", "Journal / What happens when the journal opens.", "Wait for me / Skip the journal / Count down, then move on"; no "prompt". |
| CP-1-21 | resolved | "Your finished games, in your own words." / "No stories yet". |
| CP-1-22 | resolved | Card present tense, notice/timeline/story past tense, glyph first. |
| CP-1-23 | resolved | No "Paste" placeholder. New redundancy it introduced: game-copy-v-05. |
| CP-1-24 | resolved | "Locked in the Tech District" on home and library. |

## New defects (introduced or exposed by round 1)

- game-copy-v-01 (medium, copy, overlays): Help "Rules you've met" Ace tip is wrong on Easy. HelpModal.svelte:18 "With all four there is no target: each Salvation is a Stability check..." but on Easy the fourth Ace ends the game; the 'fourth-ace' tip (l.19-20) says so, so an Easy player who met both reads two contradicting rules. Token tip (l.23) says "failed" where the board says "missed". Fix: "Every Ace you reveal makes Salvation easier. On Normal and Hard, with all four there is no target: each Salvation is a Stability check, and the Token comes off if you hold on." and "On Hard, a missed Salvation roll adds a Token (two on a natural 1)."
- game-copy-v-02 (low, copy, hud): "Salvation has no target: each roll is a Stability check" (hudTiers.js:262 spoken Aces text; useRuleCaptions.svelte.js:64 caption). Roll for tasks is not a Stability check. Fix: "each Salvation roll is a Stability check".
- game-copy-v-03 (low, copy, play): two verbs for the one Token action. caption-salvation: "Each round ends with a roll to clear a Token. Clear them all to escape." directly under "You need 14+ to remove a Token."; intro goal "clear all 10 Tokens"; HUD spoken "all cleared"; Guide/Settings/board say "remove". Fix: "remove" everywhere (useRuleCaptions.svelte.js:69, intro goal, hudTiers tokens tier word "all removed").
- game-copy-v-04 (low, copy, overlays): status lines mix two number grammars in one line: journal/final log "Stability 16/20 · 1 of 4 Kings · 10 Tokens left"; story round stats "Stability 20/20 · Kings 1 of 4 · Aces 0 of 4". GD-1-22 kept "of" for prose. Fix one grammar, label first like the HUD's spoken text: "Stability 16 of 20 · Kings 1 of 4 · Tokens 10 left" in journal, final log and story mode.
- game-copy-v-05 (low, copy, overlays): Add a voice service says the key is browser-only twice, 200px apart (TTSSection.svelte:269 "The key is stored in this browser only." and :283 "Stored only in this browser."). Fix: intro "Use your own API key for a cloud voice." only.
- game-copy-v-06 (low, game, play): Lucid/Surreal caption repeats the hint right under it (real-caption-03/05: "your next roll uses two dice and keeps the lower." over "Surreal · two dice, keep the lower"). The caption only shows on a step that has the hint (by design), so the effect is always said twice. Fix: on the board the caption teaches the cause: "A natural 20 makes you Lucid, for one roll: this one." / "A natural 1 makes you Surreal, for one roll: this one."; the Guide and Help keep the long form.
- game-copy-v-07 (low, copy, overlays): Settings named three ways in case: bar label "Settings", accessible name "Game settings" (PlayerInfoBar.svelte:216), modal title "Game Settings" (SettingsModal.svelte:79), home and phone menus "Settings". Fix: modal title "Settings"; drop the aria-label so the name is the visible "Settings".
