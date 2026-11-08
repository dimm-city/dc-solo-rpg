# Sign-off 8: layout/responsive (visual/typography held as well)

Sign-off 8 is complete. HEAD is 865c891. The only src change since the signoff-7 captures (a32f7b0) is commit 616cb31:
five lines of CSS in src/lib/components/GameGuide.svelte (`git diff --stat a32f7b0 HEAD -- src static`). Following
the owner's note, no full capture was made. I ran one targeted probe on a dev server (port 5295, now stopped) and took
7 table crops. Output is in v3/vl9/. The sign-off 7 review is saved as v3/signoff-visual-layout.signoff7.md.

## Verdict

- **visual-layout-s-20: resolved.** Probe: v3/vl9/valign9.cjs, output v3/vl9/valign9.out.
  - Coverage: every row of all three Guide tables (18 rows), on /how-to and in the in-game Guide, at 360x640,
    390x844, 844x390 and 1440x900. That is 144 rows, and 0 fail.
  - The probe measures each cell's first-line glyph top, its first-line baseline (from a zero-height inline-block
    marker) and its last-line bottom. It measures the row height and table width with the fix, then again with the
    pre-fix `middle` forced in the same page.
  - **Body rows:** in all 120, the key and the value start within 1px of each other (first-line top -1px, baseline
    +1px). The limit was 3px.
    - Wrapped rows before the fix: "4 Aces" -37px at 360 on /how-to, -25px on the in-game Guide and at 390, and -13px
      on the in-game Guide at 390. "1" and "20" were -25px or -13px.
  - **Header rows:** "To succeed" ends exactly on the last line of "ACES REVEALED" (0px) at every viewport, on both
    surfaces. Before the fix it was 10-11px off. The 16 one-line header rows are at 0px.
  - **Sizes:** row height and table width change by 0 in all 144 rows.
  - **Clipping:** no cell's ink extends past its cell.
  - Crops: v3/vl9/salvation-how-to-android-small.png, stability-how-to-android-small.png,
    salvation-in-game-{android-small,iphone-13,iphone-13-landscape,desktop}.png and stability-in-game-android-small.png.
    "1" reads beside "Lose 3 Stability", "20" beside "Gain 1 Stability", and "4 Aces" beside "No target: a". The
    column heads sit on the rule beneath them.
  - Choosing `top` over the `baseline` I suggested is right. It leaves a 1px baseline offset between Share Tech Mono
    and Inter, which is within tolerance and invisible at reading size. Baseline would have grown every one-line row
    by 1px.

## Checked and not filed

- **Scope.** The rule is scoped to `.guide-table`, which appears only in GameGuide.svelte (three tables). No other
  surface can change. The board, HUD, toolbar and every other overlay are byte-identical to the signoff-7 captures,
  where the drift table read 0px for the toolbar, title slot, caption, result line and step button at all four
  viewports. The sign-off 7 notes on those still stand.
- **In-game header on the intro.** The header is opacity 0 and inert under the intro (`.dock-toolbar` opacity 0,
  `.status-display-area` inert), so it cannot be focused or clicked there. This is intended: it appears once play
  starts. Not a defect.
- **/how-to table width at 360.** The table is 262px on /how-to and 312px in the in-game Guide, because of the page's
  own content padding. It was reviewed and left as it is in every earlier sign-off. No cell overflows (sign-off 7's
  table probe). Not reopened.

## Approval

- layout: **approved.** s-20 is resolved against every acceptance criterion. There is no open or regressed layout
  item and no new finding.
- visual: **approved.** It was held in sign-off 7, and nothing visual changed apart from this alignment, which
  improves the Guide's tables.
