# Sign-off 7: layout/responsive (visual/typography held as well)

Sign-off 7 is complete. Captures: signoff-7 (head a32f7b0). HEAD 55f742f changes only docs, with no src or static
change since a32f7b0. Probes ran at HEAD on a dev server (port 5288, stopped), output in v3/vl8/. The sign-off 6
review is saved as v3/signoff-visual-layout.signoff6.md.

## Verdicts

- **visual-layout-s-18: resolved.** Measured at HEAD with v3/vl8/m8.cjs (sign-off 6's m7 counter, unchanged) and
  v3/vl8/s18extra.cjs (the same counter run on every chip panel, the AI summary dialog and Settings with Advanced
  open). Reports: v3/vl8/m8.out and v3/vl8/measure/report-extra.txt. Longest line at 360 / 390 / 844x390 / 1440:
  - **Story mode**, every round of all four seeded runs (journal entries, final log and ending): 45 / 49 / 66 / 66.
    Sign-off 6 measured 45 / 49 / 79 / 79. `.journal-text` is now 540px (30em at 18px) inside the 640px column.
  - **Card panels**, all 51 chips across the four runs opened one by one: 46 / 49 / 69 / 69. No line is over 75.
  - **AI summary intro**: 42 / 42 / 62 / 62 (was 78). The width is 480px (30em at 16px).
  - **Settings**, Advanced open: 45 / 50 / 60 / 60 (was 84 / 85). At 844x390 and 1440, `.cm-section-desc` runs 60
    and `.cm-help` 58, at 420px (30em at 14px). Shots: v3/vl8/measure/desktop-settings.png and
    iphone-13-landscape-settings.png. The control column and the switch keep their place. The help text ends about
    200px short of the switch, which is the usual settings-row layout.
  - Phone figures are unchanged by construction: the column widths (312-358px) are below every new cap.
  - `.story-text` (GeneratedStory) has the same rule at the same size as `.journal-text` (1.125rem, 30em = 540px).
    My seed has no saved summary to fill it, but the 66 measured on `.journal-text` covers the same box.
  - The other changes stay as they were: no new clipping, overflow or small-target entry in any story or Settings
    surface (see below).
- **visual-layout-s-19: resolved.** Measured with my own probe, v3/vl8/numbreak8.cjs (output v3/vl8/nb8.out), written
  separately from the developer's. It walks all visible text as one stream, so a numeral and its word are checked
  even when they sit in different elements. It checks four things:
  - a numeral whose next word, after a space, no-break space, hyphen or element boundary, starts on a later line;
  - a numeral stranded at the start of a line before punctuation;
  - any glyph outside its block or the viewport, with horizontal scrollers excluded;
  - any table cell whose content is wider than the cell.
  - Pages covered: both intros, the in-game Guide (opened from the header, the common path), /how-to, /about and the
    About dialog, at 360, 390, 844x390 and 1440. Result: 0 numerals split from their word, 0 stranded, 0 overflow,
    0 cell overflow. The one hit, "a d20 / decides" at 360 on /about, is a noun followed by its verb, not a count and
    its unit.
  - "**10 Tokens**" now starts a line together at 1440 (signoff-7 help-game/desktop.png; crop in
    v3/vl8/crop-help-settings.png). About reads "A standard / 52-card deck" at 1440 (v3/vl8/about-desk-credits.png).
  - The joins cost nothing in the tables (v3/vl8/tables.cjs): at 360, "Lose 3 Stability / and become / Surreal" and
    "Gain 1 Stability / (max 20) and / become Lucid" fill the 158px cell, with no overflow, and wrap the same way at
    390. At 844x390 and 1440 every cell is one line.
  - About's credit at 1440 now breaks "...Chris Bissette / and Loot The Room, and licensed under / CC Attribution 3.0
    Unported." The licence name is kept whole. The short middle line is a fair price for that.

## New findings

### visual-layout-s-20 · low · layout · overlays: the Guide's tables centre each row key against a wrapped value, so "4 Aces" sits beside the value's third line

Every Guide table (in-game dialog and /how-to) leaves `th` and `td` at the default `vertical-align: middle`
(GameGuide.svelte:390-397, with no vertical-align anywhere in the file). A row key is one line. When its value wraps,
the key is centred on the whole value instead of lining up with its first line, so the eye pairs it with the wrong
words.

Measured with v3/vl8/valign.cjs (output v3/vl8/valign.out). The offset is the value's first-line top minus the
key's:

| Viewport | Row key | Value | Offset |
|---|---|---|---|
| 360 | "4 Aces" | "No target: a / Stability check, / then 1 Token / comes off" (4 lines) | -37px |
| 360 | "1" | "Lose 3 Stability / and become / Surreal" (3 lines) | -25px |
| 360 | "20" | "Gain 1 Stability / (max 20) and / become Lucid" (3 lines) | -25px |
| 390 | "4 Aces" | 3 lines | -25px |
| 390 | "20" | 3 lines | -25px |
| 390 | "1" | 2 lines | -13px |

So at 360, "1" reads beside "and become", "20" beside "(max 20) and", and "4 Aces" beside "then 1 Token".

The header row has the same fault at every viewport, 360 through 1440. "To succeed" is centred against the two-line
"Aces revealed": it sits 10-11px below the first line and 10-11px above the second, so it shares neither.

Evidence: v3/vl8/measure/valign-evidence.png. It shows the 360 Stability and Salvation tables, then the 1440
Salvation header. The same tables are in signoff-7 help-game at 360 and 390 once scrolled, and on /how-to.

These are the tables that teach the dice rules, and phones are the main platform. The standard for a key/value table
with wrapping values is to align each row's cells to their first line, and to sit column headers on the rule below
them.

- **Fix:** add `vertical-align: baseline` to `.guide-table th, .guide-table td` (GameGuide.svelte:390). That lines
  up the first lines of the Share Tech Mono key and the Inter value on one baseline. Add `vertical-align: bottom` to
  `.guide-table thead th` (GameGuide.svelte:399). Change nothing else.
- **Acceptance:** run v3/vl8/valign.cjs (or the same measure) on /how-to and the in-game Guide at 360, 390, 844x390
  and 1440.
  - In every body row, the key's first line and the value's first line are within 3px of each other, allowing for
    the difference in ascent between the two faces.
  - In every header row, the one-line header's line is within 2px of the last line of the two-line header.
  - Row heights and the tables' widths are unchanged.

## Checked and not filed

- **Positions hold.** signoff-7 drift: the toolbar, title slot, caption, result line and step button move 0px at all
  four viewports across the 20 table states.
  - Bottom toolbar on phones: 360 at y=584, 390 at y=788.
  - Top toolbar: 844x390 at y=6, 1440 at y=8.
- **No unintended change.** I pixel-diffed all 178 shots against signoff-6 (v3/vl8/pxdiff.py).
  - Board shots differ only by the ambient motes and the background glow. Examples: v3/vl8/d-round-start-390.png,
    and d-gowin-844.png (the victory screen's radial glow).
  - Real changes appear only in the s-18 and s-19 surfaces: story-round-1 at 844x390 and 1440, settings-game at
    1440, help-game at 1440 and page-about.
  - No board code changed since sign-off 6. Only the story components, ContentModal, StoryGenerationPanel,
    GameGuide, About and the Ghost intro changed.
- **Metrics.** The `clipped`, `outside`, `smallTargets`, `pageOverflowX` and `offscreenTexts` lists match signoff-6
  in all 178 board and surface shots, with two exceptions:
  - page-about at 844x390 lists the new `nobreak` span below the fold, which is the same content.
  - page-about at 390 adds "CC Attribution 3.0 Unported" to `smallTargets`. It is now a single 20px line instead of
    two, and it is an inline link in a sentence. WCAG 2.5.8's inline exception covers it, as it already covered "The
    Wretched" in every earlier sign-off.
- **Board and surfaces through both lenses** at every captured viewport, from the signoff-7 sheets:
  - Board: HUD tiers and LED digits, title slot, card tab, notice tab, Surreal hint, rule caption, result-hold
    run-out and the reduced-motion d20.
  - Overlays and screens: header menu, cards, endings, journal, final log (timeline and entry), library, story mode,
    Settings, the Guide, the exit dialog, Home and About.
  - All of them read as in sign-off 6, apart from the s-18 and s-19 changes above.
- **Settings spacing.** The Rule tips row has 40px below it to the Advanced rule, against 16px between other rows.
  This is the section-boundary spacing (`.cm-section + .cm-section` uses margin 24 plus the row's 16), so the
  hierarchy is consistent. Not filed.
- **Header menu at 844x390 and 1440.** Missing by design: the ⋯ menu exists only at 720px wide and narrower.

## Approval

- layout: **not approved.** s-18 and s-19 are resolved, but s-20 is new. The Guide's row keys sit beside the second
  or third line of their values on phones (25-37px off at 360), and the "To succeed" header floats between the two
  lines of "Aces revealed" at every viewport. The fix is two CSS declarations.
