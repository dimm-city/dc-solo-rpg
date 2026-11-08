# Surfaces capture, round 1

Everything that is not the board, at six core viewports (and four extended ones for the home page, a drawn card, the journal and two endings). Code under test: `f9adc3d Design polish round 1: save the capture scripts, manifests and drift tables` on `claude/vibrant-curie-w9bn88` in /home/user/dc-solo-rpg, served by `vite dev` on port 5192. Captured 2026-11-07 23:01 UTC with Chromium (swiftshader), no reduced motion.

## How to read the metrics

- **Files.** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/metrics-surfaces.json has everything: `states.<state>.<viewport>` with `elements` (every visible text element and control), `clipped`, `outside`, `smallTargets`, `lowContrast` and page-level fields. /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/metrics-surfaces-summary.json holds only the flags per state and viewport (start there). /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/metrics/surfaces/<state>.json is one state at every viewport, the same shape as the big file.
- **Coordinates** are CSS pixels from the top left of the viewport as shot (`box` = the element's border box; `textBox` = the union of its own text runs; `visibleBox` = the part left after clipping ancestors and the viewport). Shots at android-small, iphone-13, iphone-13-landscape and the extended phones are at device scale 2, so multiply by 2 to find a box in the PNG.
- **What counts as an element.** Any element with its own text, plus every control (button, link, field, summary, tab, switch, focusable). A button and the text span inside it appear as two rows: `role: "button"` (the control, its full text and tap size) and `role: "button text"` (the span, with its own font). `text` is what renders (text-transform applied for controls, source case for spans); `name` is the accessible name when it differs (icon buttons). Elements behind a modal (`inert`), screen-reader-only text, fully transparent elements and anything scrolled out of view are left out and counted in `counts`; `offscreenTexts` lists up to 60 of the scrolled-away texts.
- **Role** is a heuristic: title (h1), heading (h2-h6), label, value (digits), caption (small/help/meta/hint classes), body text (p), list item, quote, button, button text, link, field, tab, menu item, disclosure, result line, caption (rule caption), text (anything else). `sel` is a short path (tag.class) and `testid` the nearest data-testid, to find it in the code.
- **Font.** `font.family` is the CSS stack; `font.rendered` is the face Chrome actually used for that node's text (CDP `CSS.getPlatformFontsForNode`; "(system)" marks a non-web font). size, weight, lineHeight (px, or "normal"), letterSpacing, transform, align and variantNumeric (when set) are computed values.
- **Colour and contrast.** `color` is the CSS colour (`aN` = alpha), `colorEffective` the colour after opacity is composited over the background. `bg` is the effective background, sampled from the screenshot pixels inside the text box (the most common colour once text-coloured pixels are set aside; `bgShare` is the share of the box it covers, so a low share means a busy background such as art, a gradient or a glow). For glowing text (a text-shadow) that is not a button label, the box is mostly glow, so `bg` is read from a ring clear of it instead (12px plus 0.6 of the font size out, 10px wide); the glow is not counted as background, `bgInBox` keeps the inside sample and `bgSource` says which was used. Colours are binned at 4 bits per channel, so a gradient or scanlines still read as one background. `bgDom` is the background-colour chain from the DOM, for comparison. Elements painted over by an overlay (a card, the journal, a dialog over the HUD) are marked `covered: true` (`partlyCovered` when some sample points are hidden, `coveredBy` names what is on top) and left out of `lowContrast`. `contrast` is the WCAG 2 ratio of `colorEffective` on `bg`; `contrastGlyph` uses the brightest-differing rendered glyph pixel instead (counts glows and gradient text). `large` follows WCAG (24px, or 18.66px at 700+). `wcag` is AAA / AA / fail against 7/4.5 (3/4.5 when large). `lowContrast` lists the fails.
- **Fit.** `pageOverflowX`: the document is wider than the viewport. `clipped`: text with more content than its box where overflow is hidden or an ellipsis applies, or text cut by a clipping ancestor. `outside`: elements crossing a viewport edge; `reachable: true` means a scroller can bring them in (the summary lists only the unreachable ones). `smallTargets`: controls under 44x44 CSS px on touch viewports (`under24` marks those below the WCAG 2.2 AA minimum of 24px; `inline` marks links in running text, which WCAG exempts).
- **Sheets.** One PNG per state: android-small, iphone-13, ipad-portrait and iphone-13-landscape on the first row, laptop and desktop on the second, every shot scaled to 600px tall and labelled with its viewport; "not captured" boxes mark viewports where the state does not apply (see below). `<state>--extended.png` does the same for iphone-se, pixel-7, ipad-landscape and fhd where they were shot.
- **Rerun:** start the dev server (`cd /home/user/dc-solo-rpg && npx vite dev --port 5192 --strictPort`), then `cd /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/tools/surfaces && ROUND=2 node capture.cjs && ROUND=2 python3 post.py && ROUND=2 node manifest.cjs`. `GROUP=`, `VPS=`, `STATES=<regex>`, `EXT=0` and `SKIP_SEED=1` narrow a run.

## Viewports

| Viewport | Size | Scale | Touch |
| --- | --- | --- | --- |
| android-small | 360x640 | 2 | yes |
| iphone-13 | 390x844 | 2 | yes |
| iphone-13-landscape | 844x390 | 2 | yes |
| ipad-portrait | 768x1024 | 1 | yes |
| laptop | 1280x720 | 1 | no |
| desktop | 1440x900 | 1 | no |
| iphone-se (extended) | 375x667 | 2 | yes |
| pixel-7 (extended) | 412x915 | 2 | yes |
| ipad-landscape (extended) | 1024x768 | 1 | yes |
| fhd (extended) | 1920x1080 | 1 | no |

## Counts

- States defined: 92; states with shots: 88.
- Shots: 522 (502 at core viewports, 20 at extended viewports).
- Sheets: 93 in /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces.
- Not applicable at some viewports: 50; capture failures: 0.

## Seed data

The return-visit and library states start from one storage state (localStorage and IndexedDB, /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/tools/surfaces/seed-state.json), written by playing four games through the real game actions in the page with the dice mocked per roll: a Kings loss (Future Lost, 4 rounds), a Stability loss (Ghost in the Machine, shown as "Locked In the Tech District", 4 rounds), a tokens win (Future Lost, Normal, 10 rounds) and an Easy win by the fourth Ace (Future Lost, 3 rounds), each with journal entries and a final log; then an in-progress Ghost in the Machine save at the start of round 3, and an AI summary saved on the tokens win with `saveAIStory()`. The home page clock is held 5 minutes after the seed so the save label reads the same everywhere. Card, journal and ending states play fresh games the same way in their own contexts.

## Capture notes

- Determinism: every card, journal and ending state plays the same cards and rolls at every viewport (deck order set, each die roll mocked), so the copy is identical across viewports; each forced card is shown as "Round 1 · Card 1 of 3".
- Shots are taken once the page is still (fonts loaded, no finite animation running, dice settled). Three states are deliberately mid-motion and say so in their notes: `splash`, `journal-saved-beat`, `journal-voice-playing` (and the toasts in `home-toast-save-deleted` and `home-custom-game`).
- The board team captured concurrently on the same 4 CPUs, so a few steps were rerun with longer waits (tools/surfaces/fill.cjs); every shot listed here exists on disk and is backed by a metrics record.
- The iPhone 13 sizes are the full screen the brief names (390x844 and 844x390), not Playwright's descriptor viewport (390x664, 750x342), matching the board capture.

## States

### Home

#### `splash`

- **Shows:** The splash on a first visit (empty storage), about 400ms in, before it fades.
- **Reached:** flow: fresh context, / loaded; shot while the splash is up (it lasts 1.2s).
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/splash.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/splash/<viewport>.png
- **Metric flags:** low contrast: desktop 3, ipad-portrait 1, laptop 3
- **Notes:** android-small: about 400ms into the 1.2s splash · ipad-portrait: about 400ms into the 1.2s splash · laptop: about 400ms into the 1.2s splash · desktop: about 400ms into the 1.2s splash · iphone-13: about 400ms into the 1.2s splash · iphone-13-landscape: about 400ms into the 1.2s splash

#### `first-run`

- **Shows:** The one-time instructions choice after the splash: Play, Read the rules first, and the no-tips link.
- **Reached:** flow: fresh context, / after the splash.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/first-run.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/first-run/<viewport>.png

#### `home-first-visit`

- **Shows:** The game selector straight after the first-run choice: no saved games, Play on both cards.
- **Reached:** flow: "Play" on the first-run panel.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/home-first-visit.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/home-first-visit/<viewport>.png

#### `home-return`

- **Shows:** The game selector on a return visit: Ghost in the Machine has a save (Continue, New game, Delete save), Future Lost has none (Play).
- **Reached:** flow: / with the seeded storage (an in-progress Ghost in the Machine save at round 3, four finished runs).
- **Captured:** 6/6 core; extended iphone-se, pixel-7, ipad-landscape, fhd
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/home-return.png; extended: /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/home-return--extended.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/home-return/<viewport>.png

#### `home-menu`

- **Shows:** The home menu open: the hamburger menu below 900px, the "More" menu from 900px up.
- **Reached:** flow: the menu button.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/home-menu.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/home-menu/<viewport>.png

#### `home-toast-save-deleted`

- **Shows:** Home just after the save is deleted: the "Save deleted" toast and the card back to Play.
- **Reached:** flow: Delete save confirmed; shot about 500ms later.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/home-toast-save-deleted.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/home-toast-save-deleted/<viewport>.png
- **Metric flags:** low contrast: iphone-13 1
- **Notes:** android-small: about 450ms after the delete; the toast lasts 3s · laptop: about 450ms after the delete; the toast lasts 3s · desktop: about 450ms after the delete; the toast lasts 3s · ipad-portrait: about 450ms after the delete; the toast lasts 3s · iphone-13: about 450ms after the delete; the toast lasts 3s · iphone-13-landscape: about 450ms after the delete; the toast lasts 3s

#### `home-custom-game`

- **Shows:** Home with an uploaded custom game ("The Night Archive", a copy of Future Lost with a new title) scrolled into view: its card, Custom badge and remove button, and the "Added" toast. The Ghost in the Machine save is still there.
- **Reached:** flow: the file set on the hidden upload input (what Upload Game opens), tools/surfaces/fixtures/night-archive.game.md.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/home-custom-game.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/home-custom-game/<viewport>.png
- **Metric flags:** low contrast: iphone-13 1
- **Notes:** android-small: the "Added" toast is up (it lasts 5s) · laptop: the "Added" toast is up (it lasts 5s) · desktop: the "Added" toast is up (it lasts 5s) · ipad-portrait: the "Added" toast is up (it lasts 5s) · iphone-13: the "Added" toast is up (it lasts 5s) · iphone-13-landscape: the "Added" toast is up (it lasts 5s)

#### `home-first-visit-mid`

- **Shows:** Half way down the first-visit game selector (only where it scrolls more than 1.5 screens).
- **Reached:** flow: the page scroller set to 50%.
- **Captured:** 2/6 core (android-small, iphone-13-landscape)
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/home-first-visit-mid.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/home-first-visit-mid/<viewport>.png
- **Notes:** android-small: scroller main, 50% of 551px · iphone-13-landscape: scroller main, 50% of 387px

#### `home-first-visit-end`

- **Shows:** The bottom of the first-visit game selector (only where it scrolls).
- **Reached:** flow: the page scroller set to the end.
- **Captured:** 4/6 core (android-small, iphone-13, iphone-13-landscape, laptop)
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/home-first-visit-end.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/home-first-visit-end/<viewport>.png
- **Metric flags:** low contrast: iphone-13 1
- **Notes:** android-small: scroller main, scrolled 551px to the end · laptop: scroller main, scrolled 121px to the end · iphone-13: scroller main, scrolled 345px to the end · iphone-13-landscape: scroller main, scrolled 387px to the end

#### `home-return-mid`

- **Shows:** Half way down the return-visit game selector (only where it scrolls more than 1.5 screens).
- **Reached:** flow: the page scroller set to 50%.
- **Captured:** 2/6 core (android-small, iphone-13-landscape)
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/home-return-mid.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/home-return-mid/<viewport>.png
- **Metric flags:** low contrast: iphone-13-landscape 1
- **Notes:** android-small: scroller main, 50% of 617px · iphone-13-landscape: scroller main, 50% of 443px

#### `home-return-end`

- **Shows:** The bottom of the return-visit game selector (only where it scrolls).
- **Reached:** flow: the page scroller set to the end.
- **Captured:** 4/6 core (android-small, iphone-13, iphone-13-landscape, laptop)
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/home-return-end.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/home-return-end/<viewport>.png
- **Notes:** android-small: scroller main, scrolled 617px to the end · laptop: scroller main, scrolled 177px to the end · iphone-13: scroller main, scrolled 401px to the end · iphone-13-landscape: scroller main, scrolled 443px to the end

### Pages

#### `page-about`

- **Shows:** /about, top (see page-about-mid and -end)
- **Reached:** flow: direct URL.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/page-about.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/page-about/<viewport>.png
- **Metric flags:** tap <44: ipad-portrait 2, iphone-13 1
- **Notes:** android-small: HTTP 200 · ipad-portrait: HTTP 200 · laptop: HTTP 200 · desktop: HTTP 200 · iphone-13: HTTP 200 · iphone-13-landscape: HTTP 200

#### `page-how-to`

- **Shows:** /how-to, top (see page-how-to-mid and -end)
- **Reached:** flow: direct URL.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/page-how-to.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/page-how-to/<viewport>.png
- **Metric flags:** off-screen: iphone-13 1
- **Notes:** android-small: HTTP 200 · ipad-portrait: HTTP 200 · laptop: HTTP 200 · desktop: HTTP 200 · iphone-13: HTTP 200 · iphone-13-landscape: HTTP 200

#### `page-signin`

- **Shows:** /signin. Sign-in is off (REQUIRE_SIGN_IN = false), so it redirects to the home page; the shot is where it lands.
- **Reached:** flow: direct URL (redirect 307 to /).
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/page-signin.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/page-signin/<viewport>.png
- **Notes:** android-small: /signin landed on / (sign-in is off: the page redirects home) · ipad-portrait: /signin landed on / (sign-in is off: the page redirects home) · laptop: /signin landed on / (sign-in is off: the page redirects home) · desktop: /signin landed on / (sign-in is off: the page redirects home) · iphone-13: /signin landed on / (sign-in is off: the page redirects home) · iphone-13-landscape: /signin landed on / (sign-in is off: the page redirects home)

#### `page-404`

- **Shows:** The 404 page (/no-such-page).
- **Reached:** flow: direct URL.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/page-404.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/page-404/<viewport>.png
- **Notes:** android-small: HTTP 404 · ipad-portrait: HTTP 404 · laptop: HTTP 404 · desktop: HTTP 404 · iphone-13: HTTP 404 · iphone-13-landscape: HTTP 404

#### `page-game-not-found`

- **Shows:** A missing built-in game (/game/no-such-game): the game error page.
- **Reached:** flow: direct URL.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/page-game-not-found.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/page-game-not-found/<viewport>.png
- **Notes:** android-small: HTTP 404 · ipad-portrait: HTTP 404 · laptop: HTTP 404 · desktop: HTTP 404 · iphone-13: HTTP 404 · iphone-13-landscape: HTTP 404

#### `page-custom-game-not-found`

- **Shows:** A missing custom game (/game/custom/no-such-game): ErrorScreen.
- **Reached:** flow: direct URL.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/page-custom-game-not-found.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/page-custom-game-not-found/<viewport>.png
- **Notes:** android-small: HTTP 200 · ipad-portrait: HTTP 200 · laptop: HTTP 200 · desktop: HTTP 200 · iphone-13: HTTP 200 · iphone-13-landscape: HTTP 200

#### `page-about-mid`

- **Shows:** Half way down /about (only where it scrolls more than 1.5 screens).
- **Reached:** flow: the page scroller set to 50%.
- **Captured:** 2/6 core (android-small, iphone-13-landscape)
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/page-about-mid.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/page-about-mid/<viewport>.png
- **Metric flags:** tap <44: iphone-13-landscape 1
- **Notes:** android-small: scroller main, 50% of 466px · iphone-13-landscape: scroller main, 50% of 439px

#### `page-about-end`

- **Shows:** The bottom of /about (only where it scrolls).
- **Reached:** flow: the page scroller set to the end.
- **Captured:** 4/6 core (android-small, iphone-13, iphone-13-landscape, laptop)
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/page-about-end.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/page-about-end/<viewport>.png
- **Metric flags:** tap <44: iphone-13-landscape 2, iphone-13 1
- **Notes:** android-small: scroller main, scrolled 466px to the end · laptop: scroller main, scrolled 137px to the end · iphone-13: scroller main, scrolled 177px to the end · iphone-13-landscape: scroller main, scrolled 439px to the end

#### `page-how-to-mid`

- **Shows:** Half way down /how-to (only where it scrolls more than 1.5 screens).
- **Reached:** flow: the page scroller set to 50%.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/page-how-to-mid.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/page-how-to-mid/<viewport>.png
- **Notes:** android-small: scroller main, 50% of 4974px · ipad-portrait: scroller main, 50% of 2666px · laptop: scroller main, 50% of 3051px · desktop: scroller main, 50% of 2871px · iphone-13: scroller main, 50% of 4423px · iphone-13-landscape: scroller main, 50% of 3298px

#### `page-how-to-end`

- **Shows:** The bottom of /how-to (only where it scrolls).
- **Reached:** flow: the page scroller set to the end.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/page-how-to-end.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/page-how-to-end/<viewport>.png
- **Notes:** android-small: scroller main, scrolled 4974px to the end · ipad-portrait: scroller main, scrolled 2666px to the end · laptop: scroller main, scrolled 3051px to the end · desktop: scroller main, scrolled 2871px to the end · iphone-13: scroller main, scrolled 4423px to the end · iphone-13-landscape: scroller main, scrolled 3298px to the end

### Modals

#### `about-modal-home`

- **Shows:** The About modal from home, top of its content.
- **Reached:** flow: menu, About.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/about-modal-home.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/about-modal-home/<viewport>.png
- **Metric flags:** tap <44: ipad-portrait 2, iphone-13 1

#### `about-modal-home-end`

- **Shows:** The About modal scrolled to the end (where it scrolls; else the same view).
- **Reached:** flow: About, its body scrolled to the bottom.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/about-modal-home-end.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/about-modal-home-end/<viewport>.png
- **Metric flags:** tap <44: android-small 1, ipad-portrait 2, iphone-13-landscape 2, iphone-13 1
- **Notes:** desktop: the modal does not scroll here: same view as the top · ipad-portrait: the modal does not scroll here: same view as the top

#### `settings-home`

- **Shows:** Game Settings from home, top: difficulty, play mode, rule tips.
- **Reached:** flow: Settings (header button from 900px, menu below).
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/settings-home.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/settings-home/<viewport>.png
- **Metric flags:** clipped: iphone-13 1

#### `settings-home-end`

- **Shows:** Game Settings scrolled to the end, Advanced closed.
- **Reached:** flow: Settings, body scrolled to the bottom.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/settings-home-end.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/settings-home-end/<viewport>.png
- **Metric flags:** clipped: iphone-13 1
- **Notes:** desktop: does not scroll here: same view as the top · ipad-portrait: does not scroll here: same view as the top · iphone-13: does not scroll here: same view as the top

#### `settings-home-advanced`

- **Shows:** Game Settings with Advanced open, scrolled to the Advanced heading (read aloud, voice).
- **Reached:** flow: Settings, Advanced summary clicked, scrolled to it.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/settings-home-advanced.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/settings-home-advanced/<viewport>.png

#### `settings-home-advanced-end`

- **Shows:** Game Settings with Advanced open, scrolled to the end (auto-play timing).
- **Reached:** flow: as above, body scrolled to the bottom.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/settings-home-advanced-end.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/settings-home-advanced-end/<viewport>.png

#### `help-home`

- **Shows:** The Game Guide (help modal) from home, top: contents.
- **Reached:** flow: Help.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/help-home.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/help-home/<viewport>.png
- **Metric flags:** off-screen: android-small 1, iphone-13 1

#### `help-home-mid`

- **Shows:** The Game Guide scrolled half way (the roll tables).
- **Reached:** flow: Help, body scrolled to 50%.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/help-home-mid.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/help-home-mid/<viewport>.png

#### `help-home-end`

- **Shows:** The Game Guide scrolled to the end, with its footer.
- **Reached:** flow: Help, body scrolled to the bottom.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/help-home-end.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/help-home-end/<viewport>.png

#### `dice-theme-home`

- **Shows:** The dice theme picker from home, top.
- **Reached:** flow: menu, Dice Theme.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/dice-theme-home.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/dice-theme-home/<viewport>.png

#### `dice-theme-home-end`

- **Shows:** The dice theme picker scrolled to the end.
- **Reached:** flow: Dice Theme, body scrolled to the bottom.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/dice-theme-home-end.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/dice-theme-home-end/<viewport>.png
- **Notes:** desktop: does not scroll here: same view as the top · ipad-portrait: does not scroll here: same view as the top

#### `confirm-new-game`

- **Shows:** The "New game" confirmation on a saved game (replaces the save).
- **Reached:** flow: New game on the Ghost in the Machine card.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/confirm-new-game.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/confirm-new-game/<viewport>.png

#### `confirm-delete-save`

- **Shows:** The "Delete save" confirmation.
- **Reached:** flow: Delete save on the Ghost in the Machine card.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/confirm-delete-save.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/confirm-delete-save/<viewport>.png

#### `confirm-remove-game`

- **Shows:** The "Remove game" confirmation for a custom game.
- **Reached:** flow: the custom card's remove button.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/confirm-remove-game.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/confirm-remove-game/<viewport>.png

### In-game modals

#### `game-menu`

- **Shows:** The in-game "More game options" menu open (phones and narrow tablets: the ⋯ button; from 721px the header has inline buttons, so this is the board with the header). The board is at Round 1, before the task roll.
- **Reached:** actions: game loaded, opening roll 14 through the actions; flow: the ⋯ button.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/game-menu.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/game-menu/<viewport>.png
- **Metric flags:** low contrast: desktop 1, ipad-portrait 1, iphone-13-landscape 1, laptop 1; tap <44: ipad-portrait 1
- **Notes:** ipad-portrait: no ⋯ menu at this width: the header shows every button inline (board at Round 1) · laptop: no ⋯ menu at this width: the header shows every button inline (board at Round 1) · desktop: no ⋯ menu at this width: the header shows every button inline (board at Round 1) · iphone-13-landscape: no ⋯ menu at this width: the header shows every button inline (board at Round 1)

#### `settings-game`

- **Shows:** Game Settings opened in game.
- **Reached:** flow: header settings button (or ⋯ menu, Settings).
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/settings-game.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/settings-game/<viewport>.png
- **Metric flags:** clipped: iphone-13 1; tap <44: ipad-portrait 1

#### `help-game`

- **Shows:** The Game Guide opened in game, top.
- **Reached:** flow: header help button.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/help-game.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/help-game/<viewport>.png
- **Metric flags:** off-screen: android-small 1, iphone-13 1

#### `help-game-end`

- **Shows:** The Game Guide in game, scrolled to the end.
- **Reached:** flow: help, body scrolled to the bottom.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/help-game-end.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/help-game-end/<viewport>.png

#### `dice-theme-game`

- **Shows:** The dice theme picker opened in game.
- **Reached:** flow: header dice button (or ⋯ menu, Dice Theme).
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/dice-theme-game.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/dice-theme-game/<viewport>.png
- **Metric flags:** tap <44: ipad-portrait 1

#### `exit-confirm-game`

- **Shows:** The exit confirmation ("Leave the game?") in game.
- **Reached:** flow: header exit button.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/exit-confirm-game.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/exit-confirm-game/<viewport>.png
- **Metric flags:** tap <44: ipad-portrait 1

### Cards

#### `card-event-short`

- **Shows:** Event card, short story (Future Lost 6♠, 149 chars).
- **Reached:** forced deck order (6♠ on top), then the real auto-draw: state set to drawCard with 3 cards to draw.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/card-event-short.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/card-event-short/<viewport>.png
- **Notes:** android-small: card 6s · ipad-portrait: card 6s · laptop: card 6s · desktop: card 6s · iphone-13: card 6s · iphone-13-landscape: card 6s

#### `card-event-long`

- **Shows:** Event card, long story (Ghost in the Machine 8♥, 625 chars).
- **Reached:** forced deck order, real auto-draw.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/card-event-long.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/card-event-long/<viewport>.png
- **Metric flags:** clipped: android-small 1, ipad-portrait 1, iphone-13 1
- **Notes:** android-small: card 8h · ipad-portrait: card 8h · laptop: card 8h · desktop: card 8h · iphone-13: card 8h · iphone-13-landscape: card 8h

#### `card-challenge-short`

- **Shows:** Challenge card, short story (Future Lost 9♦, 228 chars): footer says a Stability check follows.
- **Reached:** forced deck order, real auto-draw.
- **Captured:** 6/6 core; extended iphone-se, pixel-7, ipad-landscape, fhd
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/card-challenge-short.png; extended: /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/card-challenge-short--extended.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/card-challenge-short/<viewport>.png
- **Notes:** android-small: card 9d · ipad-portrait: card 9d · laptop: card 9d · desktop: card 9d · iphone-se: card 9d · pixel-7: card 9d · ipad-landscape: card 9d · fhd: card 9d · iphone-13: card 9d · iphone-13-landscape: card 9d

#### `card-challenge-long`

- **Shows:** Challenge card, long story (Ghost in the Machine 5♣, 714 chars).
- **Reached:** forced deck order, real auto-draw.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/card-challenge-long.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/card-challenge-long/<viewport>.png
- **Metric flags:** clipped: android-small 1, ipad-portrait 1, iphone-13 1
- **Notes:** android-small: card 5c · ipad-portrait: card 5c · laptop: card 5c · desktop: card 5c · iphone-13: card 5c · iphone-13-landscape: card 5c

#### `card-primary-success`

- **Shows:** Ace of Hearts (Victory badge), Future Lost, 693 chars: Salvation unlocks.
- **Reached:** forced deck order (no Aces yet), real auto-draw.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/card-primary-success.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/card-primary-success/<viewport>.png
- **Notes:** android-small: card Ah · ipad-portrait: card Ah · laptop: card Ah · desktop: card Ah · iphone-13: card Ah · iphone-13-landscape: card Ah

#### `card-primary-success-long`

- **Shows:** Ace of Hearts, Ghost in the Machine, 1166 chars (the longest story in either game).
- **Reached:** forced deck order, real auto-draw.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/card-primary-success-long.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/card-primary-success-long/<viewport>.png
- **Metric flags:** clipped: android-small 1, ipad-portrait 1, iphone-13 1
- **Notes:** android-small: card Ah · ipad-portrait: card Ah · laptop: card Ah · desktop: card Ah · iphone-13: card Ah · iphone-13-landscape: card Ah

#### `card-failure-counter`

- **Shows:** First King (Doom badge), Future Lost K♠, King 1 of 4.
- **Reached:** forced deck order, kingsRevealed 0, real auto-draw.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/card-failure-counter.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/card-failure-counter/<viewport>.png
- **Notes:** android-small: card Ks · ipad-portrait: card Ks · laptop: card Ks · desktop: card Ks · iphone-13: card Ks · iphone-13-landscape: card Ks

#### `card-failure-counter-long`

- **Shows:** Third King, Ghost in the Machine K♦ (706 chars), King 3 of 4.
- **Reached:** forced: kingsRevealed 2 (♥ ♣), deck order; real auto-draw.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/card-failure-counter-long.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/card-failure-counter-long/<viewport>.png
- **Metric flags:** clipped: android-small 1, ipad-portrait 1, iphone-13 1
- **Notes:** android-small: card Kd · ipad-portrait: card Kd · laptop: card Kd · desktop: card Kd · iphone-13: card Kd · iphone-13-landscape: card Kd

#### `card-final-king`

- **Shows:** The fourth King (Future Lost K♥), revealed and waiting: the card that ends the game.
- **Reached:** forced: kingsRevealed 3, deck order; real auto-draw.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/card-final-king.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/card-final-king/<viewport>.png
- **Notes:** android-small: card Kh · ipad-portrait: card Kh · laptop: card Kh · desktop: card Kh · iphone-13: card Kh · iphone-13-landscape: card Kh

#### `card-narrative`

- **Shows:** Narrative Ace without a modifier (Future Lost A♦, Bonus badge) with the Ace of Hearts out: Salvation threshold note.
- **Reached:** forced: aceOfHeartsRevealed, acesRevealed 1; real auto-draw.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/card-narrative.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/card-narrative/<viewport>.png
- **Notes:** android-small: card Ad · ipad-portrait: card Ad · laptop: card Ad · desktop: card Ad · iphone-13: card Ad · iphone-13-landscape: card Ad

#### `card-narrative-skip-damage`

- **Shows:** Narrative Ace with skip-damage (Future Lost A♣, 558 chars): modifier line.
- **Reached:** forced: acesRevealed 2; real auto-draw.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/card-narrative-skip-damage.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/card-narrative-skip-damage/<viewport>.png
- **Notes:** android-small: card Ac · ipad-portrait: card Ac · laptop: card Ac · desktop: card Ac · iphone-13: card Ac · iphone-13-landscape: card Ac

#### `card-narrative-return-king`

- **Shows:** Narrative Ace with return-king (Ghost in the Machine A♠, 916 chars) with one King revealed.
- **Reached:** forced: kingsRevealed 1 (♥); real auto-draw.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/card-narrative-return-king.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/card-narrative-return-king/<viewport>.png
- **Metric flags:** clipped: android-small 1, ipad-portrait 1, iphone-13 1
- **Notes:** android-small: card As · ipad-portrait: card As · laptop: card As · desktop: card As · iphone-13: card As · iphone-13-landscape: card As

#### `card-fourth-ace-easy`

- **Shows:** The fourth Ace on Easy (Ghost in the Machine A♦): the card says this Ace ends the game.
- **Reached:** forced: difficulty Easy at runtime, acesRevealed 3; real auto-draw.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/card-fourth-ace-easy.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/card-fourth-ace-easy/<viewport>.png
- **Metric flags:** clipped: android-small 1, ipad-portrait 1, iphone-13 1
- **Notes:** android-small: card Ad · ipad-portrait: card Ad · laptop: card Ad · desktop: card Ad · iphone-13: card Ad · iphone-13-landscape: card Ad

### Journal

#### `journal-entry`

- **Shows:** The journal (record log) after a 6-card round 2: the round list (a King, an Ace, three Stability checks, Lucid from the task roll), an empty entry, Voice note and Record Entry.
- **Reached:** actions: opening roll, round 1 with an entry, round 2 dealt 6 cards (task roll 20) with checks 12, 6, 15, 3; ends on the log state.
- **Captured:** 6/6 core; extended iphone-se, pixel-7, ipad-landscape, fhd
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/journal-entry.png; extended: /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/journal-entry--extended.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/journal-entry/<viewport>.png
- **Metric flags:** tap <44: ipad-portrait 1

#### `journal-entry-long-text`

- **Shows:** The same journal with a long entry typed (about 1,400 characters).
- **Reached:** flow: the entry filled.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/journal-entry-long-text.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/journal-entry-long-text/<viewport>.png
- **Metric flags:** tap <44: ipad-portrait 1
- **Notes:** android-small: 976 characters typed · ipad-portrait: 976 characters typed · laptop: 976 characters typed · desktop: 976 characters typed · iphone-13: 976 characters typed · iphone-13-landscape: 976 characters typed

#### `journal-voice-recording`

- **Shows:** The voice note recording (fake microphone), about 2s in.
- **Reached:** flow: Voice note pressed.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/journal-voice-recording.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/journal-voice-recording/<viewport>.png
- **Metric flags:** low contrast: android-small 1, desktop 1, ipad-portrait 1, iphone-13-landscape 1, iphone-13 1, laptop 1; tap <44: ipad-portrait 1

#### `journal-voice-recorded`

- **Shows:** The voice note recorded: play and delete controls.
- **Reached:** flow: Stop pressed.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/journal-voice-recorded.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/journal-voice-recorded/<viewport>.png
- **Metric flags:** tap <44: ipad-portrait 1

#### `journal-voice-playing`

- **Shows:** The voice note playing back (about 400ms into 2s).
- **Reached:** flow: Play pressed.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/journal-voice-playing.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/journal-voice-playing/<viewport>.png
- **Metric flags:** tap <44: ipad-portrait 1
- **Notes:** android-small: about 400ms into the 2s playback · ipad-portrait: about 400ms into the 2s playback · laptop: about 400ms into the 2s playback · desktop: about 400ms into the 2s playback · iphone-13: about 400ms into the 2s playback · iphone-13-landscape: about 400ms into the 2s playback

#### `journal-saved-beat`

- **Shows:** The "saved" beat right after Record Entry (about 300ms into its 800ms).
- **Reached:** flow: Record Entry pressed; shot at once.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/journal-saved-beat.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/journal-saved-beat/<viewport>.png
- **Metric flags:** low contrast: desktop 2, ipad-portrait 2, iphone-13-landscape 2, laptop 2
- **Notes:** android-small: about 300ms into the 800ms beat · ipad-portrait: about 300ms into the 800ms beat · laptop: about 300ms into the 800ms beat · desktop: about 300ms into the 800ms beat · iphone-13: about 300ms into the 800ms beat · iphone-13-landscape: about 300ms into the 800ms beat

#### `journal-auto-timer`

- **Shows:** The journal with the timed auto-journal countdown running (30s setting).
- **Reached:** forced setting (autoHandleJournaling timed, 30s); actions: round 3 played to the log.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/journal-auto-timer.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/journal-auto-timer/<viewport>.png
- **Metric flags:** tap <44: ipad-portrait 1

### Endings

#### `gameover-win-easy-ace`

- **Shows:** Victory on Easy by the fourth Ace (cause line "The fourth Ace was revealed."), with the run recap.
- **Reached:** actions: Easy (difficulty setting 0), 3 rounds; the fourth Ace's Stability check rolls 14 and holds.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/gameover-win-easy-ace.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/gameover-win-easy-ace/<viewport>.png
- **Metric flags:** off-screen: android-small 1; tap <44: ipad-portrait 1

#### `gameover-win-tokens`

- **Shows:** Victory on Normal by the last token (10 rounds), with the run recap.
- **Reached:** actions: Normal, 10 rounds, each Salvation roll 19.
- **Captured:** 6/6 core; extended iphone-se, pixel-7, ipad-landscape, fhd
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/gameover-win-tokens.png; extended: /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/gameover-win-tokens--extended.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/gameover-win-tokens/<viewport>.png
- **Metric flags:** off-screen: android-small 1; tap <44: ipad-portrait 1

#### `gameover-loss-kings`

- **Shows:** Game Over by the fourth King (round 4), with the run recap and afterword.
- **Reached:** actions: Normal, Kings in rounds 1-4.
- **Captured:** 6/6 core; extended iphone-se, pixel-7, ipad-landscape, fhd
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/gameover-loss-kings.png; extended: /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/gameover-loss-kings--extended.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/gameover-loss-kings/<viewport>.png
- **Metric flags:** tap <44: ipad-portrait 1

#### `gameover-loss-stability`

- **Shows:** Game Over by Stability (Ghost in the Machine, round 4), after the drain beat.
- **Reached:** actions: Normal, Stability checks rolling 4, 1, 3, 5, 2, 1, 1, 1.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/gameover-loss-stability.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/gameover-loss-stability/<viewport>.png
- **Metric flags:** tap <44: ipad-portrait 1

#### `gameover-win-easy-ace-end`

- **Shows:** The Easy win scrolled to the bottom (only where the ending scrolls).
- **Reached:** as above, ending scrolled.
- **Captured:** 0/6 core

#### `gameover-win-tokens-end`

- **Shows:** The tokens win scrolled to the bottom (only where it scrolls).
- **Reached:** as above.
- **Captured:** 0/6 core

#### `gameover-loss-kings-end`

- **Shows:** The Kings loss scrolled to the bottom (only where it scrolls).
- **Reached:** as above.
- **Captured:** 0/6 core

#### `gameover-loss-stability-end`

- **Shows:** The Stability loss scrolled to the bottom (only where it scrolls).
- **Reached:** as above.
- **Captured:** 1/6 core (android-small)
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/gameover-loss-stability-end.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/gameover-loss-stability-end/<viewport>.png

### Final log

#### `final-log`

- **Shows:** The final log after the Kings loss, as it opens: phones (<768px) show "Your entry" with the Timeline / Your entry switch; 768px and up show the timeline beside the entry.
- **Reached:** flow: "Record your final log" on the Kings loss.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/final-log.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/final-log/<viewport>.png
- **Metric flags:** low contrast: desktop 9, ipad-portrait 9, iphone-13-landscape 4, laptop 8; tap <44: ipad-portrait 1

#### `final-log-timeline`

- **Shows:** Phones: the Timeline view (switch pressed). 768px and up: the same side-by-side sheet with the timeline scrolled to its end.
- **Reached:** flow: Timeline tab (phones) / timeline scrolled (wide).
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/final-log-timeline.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/final-log-timeline/<viewport>.png
- **Metric flags:** low contrast: android-small 8, desktop 9, ipad-portrait 9, iphone-13-landscape 4, iphone-13 9, laptop 9; tap <44: ipad-portrait 1
- **Notes:** android-small: phone: Timeline tab · ipad-portrait: side by side (no switch at this width); the timeline fits, so this is the same view as final-log · laptop: side by side (no switch at this width): timeline scrolled to its end · desktop: side by side (no switch at this width); the timeline fits, so this is the same view as final-log · iphone-13: phone: Timeline tab · iphone-13-landscape: side by side (no switch at this width): timeline scrolled to its end

#### `final-log-writing`

- **Shows:** The final log with an entry typed (phones: Your entry view).
- **Reached:** flow: entry filled.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/final-log-writing.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/final-log-writing/<viewport>.png
- **Metric flags:** low contrast: desktop 9, ipad-portrait 9, iphone-13-landscape 4, laptop 8; tap <44: ipad-portrait 1

#### `final-log-epitaph`

- **Shows:** After Record Entry on the final log: the epitaph and the final actions (Read your story, New game, Exit).
- **Reached:** flow: Record Entry.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/final-log-epitaph.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/final-log-epitaph/<viewport>.png
- **Metric flags:** low contrast: desktop 9, ipad-portrait 9, iphone-13-landscape 3, laptop 7; tap <44: ipad-portrait 1

#### `final-log-victory`

- **Shows:** The final log after the tokens win (victory tone), as it opens.
- **Reached:** flow: "Record your final log" on the tokens win.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/final-log-victory.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/final-log-victory/<viewport>.png
- **Metric flags:** low contrast: desktop 12, ipad-portrait 10, iphone-13-landscape 4, laptop 9; tap <44: ipad-portrait 1

#### `final-log-victory-epitaph`

- **Shows:** The victory final log after Record Entry (epitaph).
- **Reached:** flow: entry filled, Record Entry.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/final-log-victory-epitaph.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/final-log-victory-epitaph/<viewport>.png
- **Metric flags:** low contrast: desktop 10, ipad-portrait 10, iphone-13-landscape 3, laptop 7; tap <44: ipad-portrait 1

### Stories

#### `library-empty`

- **Shows:** The Story Library with no finished games.
- **Reached:** flow: /?story with empty storage.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/library-empty.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/library-empty/<viewport>.png

#### `library-stories`

- **Shows:** The Story Library with four finished runs (Easy win, tokens win, Kings loss, Stability loss).
- **Reached:** flow: /?story with the seeded storage.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/library-stories.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/library-stories/<viewport>.png

#### `library-card-menu`

- **Shows:** A story card's options menu open (Delete).
- **Reached:** flow: the card's "More options" button.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/library-card-menu.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/library-card-menu/<viewport>.png

#### `library-delete-confirm`

- **Shows:** The delete-story confirmation.
- **Reached:** flow: Delete in the card menu.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/library-delete-confirm.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/library-delete-confirm/<viewport>.png

#### `story-round-1`

- **Shows:** Story mode, the 10-round tokens win, round 1 (header, progress bar, round, navigation).
- **Reached:** flow: the story card for the 10-round run.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/story-round-1.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/story-round-1/<viewport>.png
- **Metric flags:** low contrast: desktop 2, ipad-portrait 2, iphone-13-landscape 2, iphone-13 2, laptop 2; clipped: iphone-13 1; tap <44: android-small 3, ipad-portrait 13, iphone-13-landscape 13, iphone-13 3

#### `story-round-2`

- **Shows:** Story mode after Next: round 2.
- **Reached:** flow: Next.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/story-round-2.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/story-round-2/<viewport>.png
- **Metric flags:** tap <44: android-small 3, ipad-portrait 13, iphone-13-landscape 13, iphone-13 3

#### `story-last-round`

- **Shows:** Story mode on the last round (10), top.
- **Reached:** flow: the last progress-bar step.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/story-last-round.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/story-last-round/<viewport>.png
- **Metric flags:** low contrast: desktop 2, ipad-portrait 2, iphone-13-landscape 2, iphone-13 2, laptop 2; tap <44: android-small 3, ipad-portrait 13, iphone-13-landscape 13, iphone-13 3

#### `story-final-log`

- **Shows:** Story mode, last round scrolled to the "Final log" section.
- **Reached:** flow: scrolled to [data-testid=story-final-log].
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/story-final-log.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/story-final-log/<viewport>.png
- **Metric flags:** low contrast: desktop 2, ipad-portrait 2, iphone-13-landscape 2, iphone-13 2, laptop 2; tap <44: ipad-portrait 13, iphone-13 3

#### `story-end`

- **Shows:** Story mode, last round scrolled to the bottom: the game-over message and the navigation.
- **Reached:** flow: scrolled to the bottom.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/story-end.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/story-end/<viewport>.png
- **Metric flags:** low contrast: desktop 2, ipad-portrait 2, iphone-13-landscape 2, iphone-13 2, laptop 2; tap <44: ipad-portrait 13, iphone-13 3

#### `story-ai-summary`

- **Shows:** The AI summary dialog with a saved summary (GeneratedStory).
- **Reached:** forced storage: saveAIStory() on the tokens-win record (the way the app saves one); flow: the AI summary button.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/story-ai-summary.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/story-ai-summary/<viewport>.png
- **Metric flags:** tap <44: android-small 3, ipad-portrait 13, iphone-13-landscape 13, iphone-13 3

#### `story-end-loss`

- **Shows:** Story mode for the Kings loss, last round scrolled to the bottom (loss message).
- **Reached:** flow: the Kings-loss story card, last step, scrolled.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/story-end-loss.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/story-end-loss/<viewport>.png
- **Metric flags:** low contrast: desktop 2, ipad-portrait 2, iphone-13-landscape 2, iphone-13 2, laptop 2; tap <44: ipad-portrait 6, iphone-13 2

#### `story-ai-panel`

- **Shows:** The AI summary dialog with no AI configured (Kings loss run).
- **Reached:** flow: the AI summary button.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/story-ai-panel.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/story-ai-panel/<viewport>.png
- **Metric flags:** tap <44: android-small 2, ipad-portrait 6, iphone-13-landscape 6, iphone-13 2

#### `story-ai-panel-ready`

- **Shows:** The AI summary dialog with a provider configured (placeholder key): the offer to write a summary. Nothing is generated.
- **Reached:** forced storage: saveAISettings() with a placeholder key; flow: story reopened, AI summary button.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/story-ai-panel-ready.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/story-ai-panel-ready/<viewport>.png
- **Metric flags:** clipped: iphone-13 1; tap <44: android-small 3, ipad-portrait 7, iphone-13-landscape 7, iphone-13 3
- **Notes:** android-small: placeholder API key saved; nothing generated · laptop: placeholder API key saved; nothing generated · desktop: placeholder API key saved; nothing generated · ipad-portrait: placeholder API key saved; nothing generated · iphone-13: placeholder API key saved; nothing generated · iphone-13-landscape: placeholder API key saved; nothing generated

#### `story-ai-settings`

- **Shows:** The AI provider settings inside the summary dialog, top.
- **Reached:** flow: the dialog's settings button.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/story-ai-settings.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/story-ai-settings/<viewport>.png
- **Metric flags:** tap <44: android-small 3, ipad-portrait 7, iphone-13-landscape 6, iphone-13 3

#### `story-ai-settings-end`

- **Shows:** The AI provider settings scrolled to the end (narration).
- **Reached:** flow: dialog body scrolled to the bottom.
- **Captured:** 6/6 core
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/story-ai-settings-end.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/story-ai-settings-end/<viewport>.png
- **Metric flags:** tap <44: android-small 2, ipad-portrait 7, iphone-13-landscape 6, iphone-13 3

#### `library-stories-mid`

- **Shows:** Half way down the Story Library with four runs (only where it scrolls more than 1.5 screens).
- **Reached:** flow: the page scroller set to 50%.
- **Captured:** 0/6 core

#### `library-stories-end`

- **Shows:** The bottom of the Story Library with four runs (only where it scrolls).
- **Reached:** flow: the page scroller set to the end.
- **Captured:** 3/6 core (android-small, iphone-13, iphone-13-landscape)
- **Sheet:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/sheets/surfaces/library-stories-end.png
- **Shots:** /tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad/design-review/round-1/shots/surfaces/library-stories-end/<viewport>.png
- **Notes:** android-small: scroller div.browse-games, scrolled 236px to the end · iphone-13: scroller div.browse-games, scrolled 8px to the end · iphone-13-landscape: scroller div.browse-games, scrolled 166px to the end

## Not captured

### Not applicable at a viewport (by design)

- `home-first-visit-mid` at iphone-13: scrolls less than 1.5 screens: no mid view.
- `home-first-visit-mid` at ipad-portrait: the page fits: nothing to scroll.
- `home-first-visit-mid` at laptop: scrolls less than 1.5 screens: no mid view.
- `home-first-visit-mid` at desktop: the page fits: nothing to scroll.
- `home-first-visit-end` at ipad-portrait: the page fits: nothing to scroll.
- `home-first-visit-end` at desktop: the page fits: nothing to scroll.
- `home-return-mid` at iphone-13: scrolls less than 1.5 screens: no mid view.
- `home-return-mid` at ipad-portrait: the page fits: nothing to scroll.
- `home-return-mid` at laptop: scrolls less than 1.5 screens: no mid view.
- `home-return-mid` at desktop: the page fits: nothing to scroll.
- `home-return-end` at ipad-portrait: the page fits: nothing to scroll.
- `home-return-end` at desktop: the page fits: nothing to scroll.
- `page-about-mid` at iphone-13: scrolls less than 1.5 screens: no mid view.
- `page-about-mid` at ipad-portrait: the page fits: nothing to scroll.
- `page-about-mid` at laptop: scrolls less than 1.5 screens: no mid view.
- `page-about-mid` at desktop: the page fits: nothing to scroll.
- `page-about-end` at ipad-portrait: the page fits: nothing to scroll.
- `page-about-end` at desktop: the page fits: nothing to scroll.
- `gameover-win-easy-ace-end` at android-small: the ending fits: nothing to scroll.
- `gameover-win-easy-ace-end` at iphone-13: the ending fits: nothing to scroll.
- `gameover-win-easy-ace-end` at iphone-13-landscape: the ending fits: nothing to scroll.
- `gameover-win-easy-ace-end` at ipad-portrait: the ending fits: nothing to scroll.
- `gameover-win-easy-ace-end` at laptop: the ending fits: nothing to scroll.
- `gameover-win-easy-ace-end` at desktop: the ending fits: nothing to scroll.
- `gameover-win-tokens-end` at android-small: the ending fits: nothing to scroll.
- `gameover-win-tokens-end` at iphone-13: the ending fits: nothing to scroll.
- `gameover-win-tokens-end` at iphone-13-landscape: the ending fits: nothing to scroll.
- `gameover-win-tokens-end` at ipad-portrait: the ending fits: nothing to scroll.
- `gameover-win-tokens-end` at laptop: the ending fits: nothing to scroll.
- `gameover-win-tokens-end` at desktop: the ending fits: nothing to scroll.
- `gameover-loss-kings-end` at android-small: the ending fits: nothing to scroll.
- `gameover-loss-kings-end` at iphone-13: the ending fits: nothing to scroll.
- `gameover-loss-kings-end` at iphone-13-landscape: the ending fits: nothing to scroll.
- `gameover-loss-kings-end` at ipad-portrait: the ending fits: nothing to scroll.
- `gameover-loss-kings-end` at laptop: the ending fits: nothing to scroll.
- `gameover-loss-kings-end` at desktop: the ending fits: nothing to scroll.
- `gameover-loss-stability-end` at iphone-13: the ending fits: nothing to scroll.
- `gameover-loss-stability-end` at iphone-13-landscape: the ending fits: nothing to scroll.
- `gameover-loss-stability-end` at ipad-portrait: the ending fits: nothing to scroll.
- `gameover-loss-stability-end` at laptop: the ending fits: nothing to scroll.
- `gameover-loss-stability-end` at desktop: the ending fits: nothing to scroll.
- `library-stories-mid` at android-small: scrolls less than 1.5 screens: no mid view.
- `library-stories-mid` at iphone-13: scrolls less than 1.5 screens: no mid view.
- `library-stories-mid` at iphone-13-landscape: scrolls less than 1.5 screens: no mid view.
- `library-stories-mid` at ipad-portrait: the page fits: nothing to scroll.
- `library-stories-mid` at laptop: the page fits: nothing to scroll.
- `library-stories-mid` at desktop: the page fits: nothing to scroll.
- `library-stories-end` at ipad-portrait: the page fits: nothing to scroll.
- `library-stories-end` at laptop: the page fits: nothing to scroll.
- `library-stories-end` at desktop: the page fits: nothing to scroll.

### Capture failures

- None.

### Unreachable states, and why

- **The sign-in page (SignIn.svelte) and Sign Out.** Sign-in is off (`REQUIRE_SIGN_IN = false` in src/hooks.server.js), so /signin redirects (307) to the home page and the home menu has no Sign Out. Showing them needs a code change and Google OAuth credentials. `page-signin` records where /signin lands.
- **An exit confirmation on home, and the About modal in game.** Neither exists: home has no exit, and the in-game header has no About.
- **The loading screen (LoadScreen).** It shows for a moment while the game file loads on a local dev server, too briefly to shoot reliably; it is part of the game page, not a surface in this list.
- **AI summary while writing, its errors, and a summary with narration.** Writing a summary calls the provider (an API key and a network the capture environment blocks). The dialog is captured unconfigured, configured with a placeholder key, with a saved summary, and with its settings form.
- **Read-aloud and narration controls in use.** Headless Chromium has no speech voices and the on-device model downloads from Hugging Face (blocked); the settings for them are captured (`settings-home-advanced`, `story-ai-settings-end`).
- **Voice-note error (microphone blocked) and story-mode audio.** The capture grants a fake microphone, so the error never shows; no saved run holds a recording, so story mode shows no audio players.
- **Card in-between stages:** the fourth King's "doom" beat (about 400ms after it is dismissed) and the auto-play hold bar on a card (auto-play on). Both are motion on the card overlay and belong to the animation review; the settled final King is `card-final-king`.
- **Upload and library error toasts** ("Please choose a .game.md file", a library that fails to load). They need a bad file or a failing IndexedDB; the toast itself is shown by `home-toast-save-deleted` and `home-custom-game`.
