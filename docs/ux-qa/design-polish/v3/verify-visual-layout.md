# Verify round 1: visual/typography + layout/responsive

Evidence: round-2 captures (board at 31e689a, surfaces at 2d9714f), metrics-board.json, metrics-surfaces.json, drift-board.md, code at origin/claude/vibrant-curie-w9bn88 (b78e191). Crops in v3/vl/.
Out of scope here (being rebuilt): the board centre text column and the in-game header position.

## Verdicts (in progress)

- VT-1-01 resolved. Hint moved off the button: "Surreal · two dice, keep the lower" 8.36:1 (min 8.03), Lucid 14.7:1, every vp, all five states. v3/vl/step-surreal.png.
- VT-1-03 resolved. Step button one box per vp in every board state (360: 24,560 312x48 in 153 states; 390: 764/48 in 190; 844: 314/48; 768: 944/48; 1280: 640/48; 1440: 820/48). Label text height 20/21px everywhere (one line). Hint one line (17px) at 360.
- VT-1-05 resolved. Space key-cap inside the button on the right (laptop x 808.7 w55), 12px, 6.5:1; label centre = button centre (0 states off by >1px).
- LR-1-05 resolved. Same data as VT-1-03: Δtop 0, Δh 0 for the button and label at all six core vps.
- LR-1-12 resolved. Label centre within ±1px of button centre in every state at laptop and desktop.
- VT-1-08 resolved. Roll|Cards boundary − vw/2 = 0.0 at 360/375/390/412 (and −0.1 at 768). Min label clearance to its cell: 4.0px (Stability) at 360/375/390/412; Kings 4.8 at 375.
- LR-1-03 resolved. All values and max DSEG7 Classic; lit value boxes share top/bottom per vp (87/105 phones, 83/99 landscape, 89/109 768+); value and max x constant per tile across all states (no variants); baseline delta max−value = 0.
- LR-1-04 resolved. Cell boxes have one x/w per tile per vp across every tier state; tints visible to the frame in hud-all-worst / hud-all-best (v3/vl/hud-tiers-360.png).
- VT-1-15 resolved. At rest every label is rgba(255,255,255,.72); KINGS red only at 1+ (hud-tiers-360.png row 1 vs rows 3-5).
- VT-1-02 / LR-1-07 resolved. 'Victory' 31.2..328.9 at 360 (32.4px), 33.8..356.2 at 390; 'Game Over' wraps to two lines within 16..344.
- VT-1-09 resolved. Every .content-header h2 = Inter 18/600 (167 captures); section titles 16/600; landscape settings shows Difficulty select at y141-185 with no scroll.
- LR-1-11 resolved. 844x390 settings: body ~68..317 of a 374px dialog (67%), header/footer pinned.
- VT-1-12 resolved. Inter weights across both metrics sets: 400 and 600 only.
- VT-1-11 open. ≤6 sizes holds and fractional sizes are only display titles, but 1px neighbours remain: 15px (StoryGenerationPanel.svelte:157,207 summary trigger; SortControls.svelte:37; TTSSection.svelte:392; AIProviderSection.svelte:222; ErrorScreen.svelte:72) sits beside 14 and 16 on story, library, final-log, settings-advanced and error pages; 17px (StaticPage.svelte:93 About body, ErrorScreen.svelte:56) beside 16 and 18; 13px theme names (DiceThemePicker.svelte:131) beside 12 and 14.
- VT-1-10 resolved (with the plan's exemptions). Under-12 list holds only HUD labels at 360 (11px, the planned ≤374 exemption) and the HUD /max at 11px phones and 10px landscape (DSEG7; plan DP-1-01 sizes; digit ink is 10-11px tall, taller than a 12px Inter cap).
- VT-1-06 resolved. Digits never animate (StabilityCell.svelte:93-99: only .tint 0.14-0.07 and the bar pulse). hud-stability-1 value 5.62:1 (360), 5.84 (844), 5.62 (1280).
- VT-1-07 resolved. No contrast FAIL in home*, final-log* or locked Tokens (Tokens 10 locked 7.24:1). The one home FAIL (home-first-visit-end@iphone-se PLAY 2.47) is a button scrolled out (visible h 0.9px); its label measures 5.65.
- VT-1-13 resolved. Cue in its own band above the CTA; text fades out above it (v3/vl/intro-cue.png, 360 and 390 long-text).
- VT-1-14 open. first-run at 360: 'The game teaches you as you / go.' (span 214px wide, text needs 223.2px; FirstRunPanel.svelte:118 .play-detail has no text-wrap: balance), which also makes that button 78px tall vs 61px at 375+. Board-column parts deferred to the OWN-4 sign-off.
- VT-1-16 resolved. Screen titles render cyan with a cyan halo (rm-static.png); no --yellow references in src.
- VT-1-17 resolved. No suit glyph text runs remain in either metrics set (all SVG via SuitText).
- VT-1-18 resolved. Continue is two lines 'Continue' / 'Round 3 · 5 min ago'; Play and Continue both 60px at 768 and 1280.
- VT-1-19 resolved. Edge fade present at 360 (help-chips-360.png); .more-right toggled by scroll position, padding-inline-end 20px (GameGuide.svelte:428-435).
- VT-1-20 resolved. All tiles n/max in the LED face, labels one line. (New defect on the same tiles: v-01.)
- VT-1-21 resolved. Header and HUD left and right edges Δ0 at every vp incl. 1280/1440/1920.
- VT-1-22 / LR-1-02 resolved. rm-static-roll shows the d20 between description and button at 390 and 1440; loadjump-iphone-13.json: gameScreenTop 0 for all 277 frames, intro opacity 0 -> 0.58 -> 1 on screen.
- OWN-1 resolved (see LR-1-03 / LR-1-04).
- LR-1-06 resolved. No smallTargets on touch vps except inline text links (The Wretched, CC Attribution, platform.claude.com).
- LR-1-08 resolved. stability-check title one line 890x48 at 1280/1440; easy-final-check one line too.
- LR-1-09 resolved. 844x390 and 750x342: chips and two journal lines above the nav (story-round-1-land.png).
- LR-1-10 resolved. Textarea about 205px (844x390) and 164px (750x342); Record Entry visible.
- LR-1-13 resolved (by layout, not a forced board capture): GameScreen.svelte:1287 padding-bottom max(.5rem, --safe-bottom) lifts the 390x844 button bottom from 812 to 786; landscape :1395 max(.375rem, ...) gives 362 -> 347. Re-check with the OWN-3 bottom toolbar.
- LR-1-14 resolved. 'Locked in the Tech District' wraps to two lines, no ellipsis, at 360/390/768.
- LR-1-15 resolved. 1280x720 Play buttons 610-670, 50px clear.
- VT-1-04 resolved against its criteria at 31e689a (whole clauses, outcome ≤2 lines at 360, modifier a separate span ≥8.4:1); final judgement with OWN-4.
- LR-1-01 open, tracked entirely by OWN-4/OWN-5 (no separate work): the round-1 numbers pass (portrait last-line bottom Δ0, landscape top Δ0, result top Δ0), but the title's first line still moves 27px (360) / 29px (390) when it wraps, and the eyebrow is clipped at 360/390 in 18 captures.

## New defects

- v-01 (low, visual, pages) RunRecap: a max starting with 1 leaves an unlit gap after the slash ('0/ 10', gameover-tokens-tile.png). The HUD compensates with .lead-one (StatusHUD.svelte:264, TokensCell.svelte:71); RunRecap.svelte:28-29/118 does not.
- v-02 (low, visual, play) Card face: the second corner index (.corner-index.mirrored, CardDisplay.svelte:701-704, opacity .6) measures 2.85:1 (Kings), 3.5:1 (challenge orange), at 20px (needs 4.5). Round 1 measured the same element at 5.95:1.
