# Board drift, round 1

Where the screen title, rule caption, result line, step button and step label sit in every board state, per viewport.
Boxes are CSS px from the viewport top-left as x,y wxh. Title, result line and step label use the text box (ink of the lines);
the caption and step button use the element box. Each element is compared with the first board state that shows it (the
"reference", first row with a value); a cell marked **!** has its top edge, horizontal centre or height more than 2px off the
reference (Δtop, Δbottom and Δcx are given; a width change alone is not flagged, since a different word changes a centred
line's width without moving it). The max delta row gives max - min across all states per element. Captions only appear in
caption-* states (rule tips are off elsewhere). Card, journal, intro, header-menu and game-over states are not board states.

## android-small (360x640)

| state | screen title | rule caption | result line | step button | step label |
|---|---|---|---|---|---|
| instability-roll | 28,226 304x24 | – | – | 24,564 312x44 | 78,575 205x20 |
| instability-result | **!** 28,269 304x24 (Δtop +43, Δbottom +43, Δcx +0) | – | 67,309 226x20 | 24,564 312x44 | 132,575 95x20 |
| round-start | **!** 81,248 198x24 (Δtop +22, Δbottom +22, Δcx +0) | – | – | 24,564 312x44 | 104,575 152x20 |
| task-result | **!** 81,269 198x24 (Δtop +43, Δbottom +43, Δcx +0) | – | 85,309 189x20 | 24,564 312x44 | 111,575 138x20 |
| stability-check | **!** 52,222 256x51 (Δtop -4, Δbottom +22, Δcx +0) | – | – | 24,564 312x44 | 95,575 170x20 |
| stability-rolling | **!** 52,222 256x51 (Δtop -4, Δbottom +22, Δcx +0) | – | – | 24,564 312x44 | 132,575 95x20 |
| stability-11-19 | **!** 52,242 256x51 (Δtop +16, Δbottom +43, Δcx +0) | – | 46,309 267x20 | 24,564 312x44 | 132,575 95x20 |
| stability-check-ace | **!** 52,222 256x51 (Δtop -4, Δbottom +22, Δcx +0) | – | – | 24,564 312x44 | 95,575 170x20 |
| stability-6-10 | **!** 52,242 256x51 (Δtop +16, Δbottom +43, Δcx +0) | – | 67,309 226x20 | 24,564 312x44 | 132,575 95x20 |
| stability-2-5 | **!** 52,242 256x51 (Δtop +16, Δbottom +43, Δcx +0) | – | 67,309 226x20 | 24,564 312x44 | 132,575 95x20 |
| salvation-n2-step | **!** 42,271 275x24 (Δtop +45, Δbottom +45, Δcx +0) | – | – | **!** 24,546 312x62 (Δtop -18, Δbottom +0, Δcx +0) | **!** 92,557 175x39 (Δtop -19, Δbottom +0, Δcx -0) |
| salvation-n2-miss | **!** 42,269 275x24 (Δtop +43, Δbottom +43, Δcx +0) | – | 38,309 283x20 | 24,564 312x44 | 132,575 95x20 |
| round-start-r2 | **!** 75,248 211x24 (Δtop +22, Δbottom +22, Δcx +0) | – | – | 24,564 312x44 | 104,575 152x20 |
| task-result-nat1 | **!** 75,245 211x24 (Δtop +19, Δbottom +19, Δcx +0) | – | **!** 34,285 292x44 (Δtop -24, Δbottom +0, Δcx +0) | 24,564 312x44 | 119,575 123x20 |
| round-start-surreal | **!** 75,248 211x24 (Δtop +22, Δbottom +22, Δcx +0) | – | – | **!** 24,547 312x61 (Δtop -17, Δbottom +0, Δcx +0) | **!** 104,558 152x20 (Δtop -17, Δbottom -17, Δcx +0) |
| task-result-nat20 | **!** 75,221 211x24 (Δtop -5, Δbottom -5, Δcx +0) | – | **!** 53,261 254x68 (Δtop -48, Δbottom +0, Δcx -0) | 24,564 312x44 | 111,575 138x20 |
| round-start-lucid | **!** 75,248 211x24 (Δtop +22, Δbottom +22, Δcx +0) | – | – | **!** 24,547 312x61 (Δtop -17, Δbottom +0, Δcx +0) | **!** 104,558 152x20 (Δtop -17, Δbottom -17, Δcx -0) |
| stability-nat1 | **!** 52,218 256x51 (Δtop -8, Δbottom +19, Δcx +0) | – | **!** 37,285 286x44 (Δtop -24, Δbottom +0, Δcx +0) | 24,564 312x44 | 132,575 95x20 |
| stability-check-surreal | **!** 52,222 256x51 (Δtop -4, Δbottom +22, Δcx +0) | – | – | **!** 24,547 312x61 (Δtop -17, Δbottom +0, Δcx +0) | **!** 95,558 170x20 (Δtop -17, Δbottom -17, Δcx +0) |
| stability-2d20-surreal | **!** 52,218 256x51 (Δtop -8, Δbottom +19, Δcx +0) | – | **!** 95,285 171x44 (Δtop -24, Δbottom +0, Δcx +0) | 24,564 312x44 | 132,575 95x20 |
| stability-nat20 | **!** 52,218 256x51 (Δtop -8, Δbottom +19, Δcx +0) | – | **!** 36,285 287x44 (Δtop -24, Δbottom +0, Δcx -0) | 24,564 312x44 | 132,575 95x20 |
| stability-check-lucid | **!** 52,222 256x51 (Δtop -4, Δbottom +22, Δcx +0) | – | – | **!** 24,547 312x61 (Δtop -17, Δbottom +0, Δcx +0) | **!** 95,558 170x20 (Δtop -17, Δbottom -17, Δcx +0) |
| stability-2d20-lucid | **!** 52,218 256x51 (Δtop -8, Δbottom +19, Δcx +0) | – | **!** 85,285 190x44 (Δtop -24, Δbottom +0, Δcx -0) | 24,564 312x44 | 132,575 95x20 |
| result-hold | **!** 52,242 256x51 (Δtop +16, Δbottom +43, Δcx +0) | – | 67,309 226x20 | 24,564 312x44 | 132,575 95x20 |
| salvation-n1-step | **!** 42,271 275x24 (Δtop +45, Δbottom +45, Δcx +0) | – | – | **!** 24,546 312x62 (Δtop -18, Δbottom +0, Δcx +0) | **!** 92,557 175x39 (Δtop -19, Δbottom +0, Δcx -0) |
| salvation-n1-nat20 | **!** 42,221 275x24 (Δtop -5, Δbottom -5, Δcx +0) | – | **!** 70,261 220x68 (Δtop -48, Δbottom +0, Δcx +0) | 24,564 312x44 | 132,575 95x20 |
| salvation-n1-hit | **!** 42,269 275x24 (Δtop +43, Δbottom +43, Δcx +0) | – | 76,309 208x20 | 24,564 312x44 | 132,575 95x20 |
| salvation-n1-miss | **!** 42,269 275x24 (Δtop +43, Δbottom +43, Δcx +0) | – | 33,309 293x20 | 24,564 312x44 | 132,575 95x20 |
| salvation-n1-nat1 | **!** 42,245 275x24 (Δtop +19, Δbottom +19, Δcx +0) | – | **!** 31,285 298x44 (Δtop -24, Δbottom +0, Δcx +0) | 24,564 312x44 | 132,575 95x20 |
| salvation-n2-nat20 | **!** 42,221 275x24 (Δtop -5, Δbottom -5, Δcx +0) | – | **!** 70,261 220x68 (Δtop -48, Δbottom +0, Δcx +0) | 24,564 312x44 | 132,575 95x20 |
| salvation-n2-hit | **!** 42,269 275x24 (Δtop +43, Δbottom +43, Δcx +0) | – | 76,309 208x20 | 24,564 312x44 | 132,575 95x20 |
| salvation-n2-nat1 | **!** 42,245 275x24 (Δtop +19, Δbottom +19, Δcx +0) | – | **!** 31,285 298x44 (Δtop -24, Δbottom +0, Δcx +0) | 24,564 312x44 | 132,575 95x20 |
| salvation-n3-step | **!** 42,271 275x24 (Δtop +45, Δbottom +45, Δcx +0) | – | – | **!** 24,546 312x62 (Δtop -18, Δbottom +0, Δcx +0) | **!** 92,557 175x39 (Δtop -19, Δbottom +0, Δcx -0) |
| salvation-n3-nat20 | **!** 42,221 275x24 (Δtop -5, Δbottom -5, Δcx +0) | – | **!** 70,261 220x68 (Δtop -48, Δbottom +0, Δcx +0) | 24,564 312x44 | 132,575 95x20 |
| salvation-n3-hit | **!** 42,269 275x24 (Δtop +43, Δbottom +43, Δcx +0) | – | 76,309 208x20 | 24,564 312x44 | 132,575 95x20 |
| salvation-n3-miss | **!** 42,269 275x24 (Δtop +43, Δbottom +43, Δcx +0) | – | 33,309 293x20 | 24,564 312x44 | 132,575 95x20 |
| salvation-n3-nat1 | **!** 42,245 275x24 (Δtop +19, Δbottom +19, Δcx +0) | – | **!** 31,285 298x44 (Δtop -24, Δbottom +0, Δcx +0) | 24,564 312x44 | 132,575 95x20 |
| salvation-n4-step | 42,226 275x24 | – | – | **!** 24,546 312x62 (Δtop -18, Δbottom +0, Δcx +0) | **!** 73,557 214x39 (Δtop -19, Δbottom +0, Δcx -0) |
| salvation-n4-nat20 | **!** 42,221 275x24 (Δtop -5, Δbottom -5, Δcx +0) | – | **!** 56,261 249x68 (Δtop -48, Δbottom +0, Δcx +0) | 24,564 312x44 | 132,575 95x20 |
| salvation-n4-hold | **!** 42,245 275x24 (Δtop +19, Δbottom +19, Δcx +0) | – | **!** 93,285 174x44 (Δtop -24, Δbottom +0, Δcx +0) | 24,564 312x44 | 132,575 95x20 |
| salvation-n4-loss | **!** 42,269 275x24 (Δtop +43, Δbottom +43, Δcx +0) | – | 30,309 300x20 | 24,564 312x44 | 132,575 95x20 |
| salvation-n4-nat1 | **!** 42,221 275x24 (Δtop -5, Δbottom -5, Δcx +0) | – | **!** 52,261 255x68 (Δtop -48, Δbottom +0, Δcx -0) | 24,564 312x44 | 132,575 95x20 |
| salvation-step-lucid | **!** 42,271 275x24 (Δtop +45, Δbottom +45, Δcx +0) | – | – | **!** 24,528 312x80 (Δtop -36, Δbottom +0, Δcx +0) | **!** 92,539 175x39 (Δtop -36, Δbottom -17, Δcx -0) |
| salvation-last-token | **!** 42,269 275x24 (Δtop +43, Δbottom +43, Δcx +0) | – | 76,309 208x20 | 24,564 312x44 | 145,575 71x20 |
| salvation-n4-fatal | **!** 42,245 275x24 (Δtop +19, Δbottom +19, Δcx +0) | – | **!** 72,285 215x44 (Δtop -24, Δbottom +0, Δcx +0) | 24,564 312x44 | 115,575 129x20 |
| stability-fatal | **!** 52,218 256x51 (Δtop -8, Δbottom +19, Δcx +0) | – | **!** 72,285 215x44 (Δtop -24, Δbottom +0, Δcx +0) | 24,564 312x44 | 115,575 129x20 |
| notice-return-king | **!** 52,195 256x51 (Δtop -31, Δbottom -4, Δcx +0) | – | – | 24,564 312x44 | 95,575 170x20 |
| notice-return-king-result | **!** 52,213 256x51 (Δtop -13, Δbottom +14, Δcx +0) | – | **!** 46,280 267x20 (Δtop -29, Δbottom -29, Δcx +0) | 24,564 312x44 | 132,575 95x20 |
| notice-skip-damage | **!** 42,197 275x24 (Δtop -29, Δbottom -29, Δcx +0) | – | – | **!** 24,546 312x62 (Δtop -18, Δbottom +0, Δcx +0) | **!** 73,557 214x39 (Δtop -19, Δbottom +0, Δcx -0) |
| keyboard-skip-link | **!** 75,248 211x24 (Δtop +22, Δbottom +22, Δcx +0) | – | – | 24,564 312x44 | 104,575 152x20 |
| keyboard-step-focus | **!** 75,248 211x24 (Δtop +22, Δbottom +22, Δcx +0) | – | – | 24,564 312x44 | 104,575 152x20 |
| header-menu | **!** 75,248 211x24 (Δtop +22, Δbottom +22, Δcx +0) | – | – | 24,564 312x44 | 104,575 152x20 |
| autoplay-on | **!** 81,248 198x24 (Δtop +22, Δbottom +22, Δcx +0) | – | – | 24,564 312x44 | 104,575 152x20 |
| header-menu-autoplay-on | **!** 81,248 198x24 (Δtop +22, Δbottom +22, Δcx +0) | – | – | 24,564 312x44 | 104,575 152x20 |
| easy-round-start | **!** 81,248 198x24 (Δtop +22, Δbottom +22, Δcx +0) | – | – | 24,564 312x44 | 104,575 152x20 |
| salvation-e1-step | **!** 42,271 275x24 (Δtop +45, Δbottom +45, Δcx +0) | – | – | **!** 24,546 312x62 (Δtop -18, Δbottom +0, Δcx +0) | **!** 92,557 175x39 (Δtop -19, Δbottom +0, Δcx -0) |
| salvation-e1-nat20 | **!** 42,221 275x24 (Δtop -5, Δbottom -5, Δcx +0) | – | **!** 70,261 220x68 (Δtop -48, Δbottom +0, Δcx +0) | 24,564 312x44 | 132,575 95x20 |
| salvation-e1-hit | **!** 42,269 275x24 (Δtop +43, Δbottom +43, Δcx +0) | – | 76,309 208x20 | 24,564 312x44 | 132,575 95x20 |
| salvation-e1-miss | **!** 42,269 275x24 (Δtop +43, Δbottom +43, Δcx +0) | – | 33,309 293x20 | 24,564 312x44 | 132,575 95x20 |
| salvation-e1-nat1 | **!** 42,245 275x24 (Δtop +19, Δbottom +19, Δcx +0) | – | **!** 31,285 298x44 (Δtop -24, Δbottom +0, Δcx +0) | 24,564 312x44 | 132,575 95x20 |
| salvation-e2-step | **!** 42,271 275x24 (Δtop +45, Δbottom +45, Δcx +0) | – | – | **!** 24,546 312x62 (Δtop -18, Δbottom +0, Δcx +0) | **!** 92,557 175x39 (Δtop -19, Δbottom +0, Δcx -0) |
| salvation-e2-nat20 | **!** 42,221 275x24 (Δtop -5, Δbottom -5, Δcx +0) | – | **!** 70,261 220x68 (Δtop -48, Δbottom +0, Δcx +0) | 24,564 312x44 | 132,575 95x20 |
| salvation-e2-hit | **!** 42,269 275x24 (Δtop +43, Δbottom +43, Δcx +0) | – | 76,309 208x20 | 24,564 312x44 | 132,575 95x20 |
| salvation-e2-miss | **!** 42,269 275x24 (Δtop +43, Δbottom +43, Δcx +0) | – | 33,309 293x20 | 24,564 312x44 | 132,575 95x20 |
| salvation-e2-nat1 | **!** 42,245 275x24 (Δtop +19, Δbottom +19, Δcx +0) | – | **!** 31,285 298x44 (Δtop -24, Δbottom +0, Δcx +0) | 24,564 312x44 | 132,575 95x20 |
| salvation-e3-step | **!** 42,271 275x24 (Δtop +45, Δbottom +45, Δcx +0) | – | – | **!** 24,546 312x62 (Δtop -18, Δbottom +0, Δcx +0) | **!** 92,557 175x39 (Δtop -19, Δbottom +0, Δcx -0) |
| salvation-e3-nat20 | **!** 42,221 275x24 (Δtop -5, Δbottom -5, Δcx +0) | – | **!** 70,261 220x68 (Δtop -48, Δbottom +0, Δcx +0) | 24,564 312x44 | 132,575 95x20 |
| salvation-e3-hit | **!** 42,269 275x24 (Δtop +43, Δbottom +43, Δcx +0) | – | 76,309 208x20 | 24,564 312x44 | 132,575 95x20 |
| salvation-e3-miss | **!** 42,269 275x24 (Δtop +43, Δbottom +43, Δcx +0) | – | 33,309 293x20 | 24,564 312x44 | 132,575 95x20 |
| salvation-e3-nat1 | **!** 42,245 275x24 (Δtop +19, Δbottom +19, Δcx +0) | – | **!** 31,285 298x44 (Δtop -24, Δbottom +0, Δcx +0) | 24,564 312x44 | 132,575 95x20 |
| easy-final-check | **!** 52,174 256x78 (Δtop -52, Δbottom +2, Δcx +0) | – | – | **!** 24,526 312x82 (Δtop -38, Δbottom +0, Δcx +0) | **!** 87,537 186x58 (Δtop -38, Δbottom +0, Δcx +0) |
| easy-final-escape | **!** 52,192 256x78 (Δtop -35, Δbottom +19, Δcx +0) | – | **!** 84,285 192x44 (Δtop -24, Δbottom +0, Δcx -0) | 24,564 312x44 | 145,575 71x20 |
| easy-final-fatal | **!** 52,192 256x78 (Δtop -35, Δbottom +19, Δcx +0) | – | **!** 72,285 215x44 (Δtop -24, Δbottom +0, Δcx +0) | 24,564 312x44 | 115,575 129x20 |
| salvation-h1-step | **!** 42,271 275x24 (Δtop +45, Δbottom +45, Δcx +0) | – | – | **!** 24,546 312x62 (Δtop -18, Δbottom +0, Δcx +0) | **!** 92,557 175x39 (Δtop -19, Δbottom +0, Δcx -0) |
| salvation-hard-miss | **!** 42,269 275x24 (Δtop +43, Δbottom +43, Δcx +0) | – | 28,309 305x20 | 24,564 312x44 | 132,575 95x20 |
| salvation-hard-nat1 | **!** 42,221 275x24 (Δtop -5, Δbottom -5, Δcx +0) | – | **!** 73,261 213x68 (Δtop -48, Δbottom +0, Δcx -0) | 24,564 312x44 | 132,575 95x20 |
| salvation-hard-over | **!** 42,269 275x24 (Δtop +43, Δbottom +43, Δcx +0) | – | 22,309 315x20 | 24,564 312x44 | 132,575 95x20 |
| caption-odd | **!** 52,243 256x51 (Δtop +17, Δbottom +44, Δcx +0) | 22,144 316x57 | – | 24,564 312x44 | 95,575 170x20 |
| caption-king | **!** 42,271 275x24 (Δtop +45, Δbottom +45, Δcx +0) | **!** 22,201 316x57 (Δtop +57, Δbottom +57, Δcx +0) | – | **!** 24,546 312x62 (Δtop -18, Δbottom +0, Δcx +0) | **!** 92,557 175x39 (Δtop -19, Δbottom +0, Δcx -0) |
| caption-ace | **!** 75,248 211x24 (Δtop +22, Δbottom +22, Δcx +0) | **!** 22,178 316x57 (Δtop +34, Δbottom +34, Δcx +0) | – | 24,564 312x44 | 104,575 152x20 |
| caption-lucid | **!** 52,264 256x51 (Δtop +38, Δbottom +65, Δcx +0) | 22,144 316x57 | – | 24,564 312x44 | 95,575 170x20 |
| caption-surreal | **!** 42,271 275x24 (Δtop +45, Δbottom +45, Δcx +0) | **!** 22,201 316x57 (Δtop +57, Δbottom +57, Δcx +0) | – | **!** 24,546 312x62 (Δtop -18, Δbottom +0, Δcx +0) | **!** 92,557 175x39 (Δtop -19, Δbottom +0, Δcx -0) |
| caption-salvation | **!** 75,248 211x24 (Δtop +22, Δbottom +22, Δcx +0) | **!** 22,159 316x77 (Δtop +15, Δbottom +34, Δcx +0) | – | 24,564 312x44 | 104,575 152x20 |
| caption-hard-token | **!** 42,269 275x24 (Δtop +43, Δbottom +43, Δcx +0) | **!** 22,199 316x57 (Δtop +55, Δbottom +55, Δcx +0) | 28,309 305x20 | 24,564 312x44 | 132,575 95x20 |
| caption-easy-odd | **!** 52,243 256x51 (Δtop +17, Δbottom +44, Δcx +0) | 22,144 316x57 | – | 24,564 312x44 | 95,575 170x20 |
| caption-easy-salvation | **!** 42,271 275x24 (Δtop +45, Δbottom +45, Δcx +0) | **!** 22,181 316x77 (Δtop +37, Δbottom +57, Δcx +0) | – | **!** 24,546 312x62 (Δtop -18, Δbottom +0, Δcx +0) | **!** 92,557 175x39 (Δtop -19, Δbottom +0, Δcx -0) |
| caption-easy-ace-third | **!** 75,248 211x24 (Δtop +22, Δbottom +22, Δcx +0) | **!** 22,159 316x77 (Δtop +15, Δbottom +34, Δcx +0) | – | 24,564 312x44 | 104,575 152x20 |
| caption-easy-fourth-ace | **!** 52,243 256x78 (Δtop +17, Δbottom +71, Δcx +0) | 22,144 316x57 | – | **!** 24,526 312x82 (Δtop -38, Δbottom +0, Δcx +0) | **!** 87,537 186x58 (Δtop -38, Δbottom +0, Δcx +0) |
| **max delta** | Δtop 97 · Δbottom 100 · Δcx 0 · Δw 107 · Δh 54 | Δtop 57 · Δbottom 57 · Δcx 0 · Δw 0 · Δh 20 | Δtop 48 · Δbottom 29 · Δcx 0 · Δw 145 · Δh 48 | Δtop 38 · Δbottom 0 · Δcx 0 · Δw 0 · Δh 38 | Δtop 38 · Δbottom 18 · Δcx 0 · Δw 143 · Δh 38 |

Reference states: screen title = instability-roll, rule caption = caption-odd, result line = instability-result, step button = instability-roll, step label = instability-roll

Flagged shifts over 2px at android-small: 158

- instability-result: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.0, Δheight +0.0
- round-start: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.1, Δheight +0.0
- task-result: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.1, Δheight +0.0
- stability-check: screen title Δtop -4.5, Δbottom +22.4, Δcentre-x +0.1, Δheight +26.9
- stability-rolling: screen title Δtop -4.5, Δbottom +22.4, Δcentre-x +0.1, Δheight +26.9
- stability-11-19: screen title Δtop +16.3, Δbottom +43.2, Δcentre-x +0.1, Δheight +26.9
- stability-check-ace: screen title Δtop -4.5, Δbottom +22.4, Δcentre-x +0.1, Δheight +26.9
- stability-6-10: screen title Δtop +16.3, Δbottom +43.2, Δcentre-x +0.1, Δheight +26.9
- stability-2-5: screen title Δtop +16.3, Δbottom +43.2, Δcentre-x +0.1, Δheight +26.9
- salvation-n2-step: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.0, Δheight +0.0
- salvation-n2-step: step button Δtop -18.4, Δbottom +0.0, Δcentre-x +0.0, Δheight +18.4
- salvation-n2-step: step label Δtop -18.8, Δbottom +0.4, Δcentre-x -0.1, Δheight +19.2
- salvation-n2-miss: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.0, Δheight +0.0
- round-start-r2: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.1, Δheight +0.0
- task-result-nat1: screen title Δtop +19.2, Δbottom +19.2, Δcentre-x +0.1, Δheight +0.0
- task-result-nat1: result line Δtop -24.0, Δbottom +0.0, Δcentre-x +0.1, Δheight +24.0
- round-start-surreal: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.1, Δheight +0.0
- round-start-surreal: step button Δtop -16.8, Δbottom +0.0, Δcentre-x +0.0, Δheight +16.8
- round-start-surreal: step label Δtop -17.2, Δbottom -17.2, Δcentre-x +0.1, Δheight +0.0
- task-result-nat20: screen title Δtop -4.8, Δbottom -4.8, Δcentre-x +0.1, Δheight +0.0
- task-result-nat20: result line Δtop -48.0, Δbottom +0.0, Δcentre-x -0.1, Δheight +48.0
- round-start-lucid: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.1, Δheight +0.0
- round-start-lucid: step button Δtop -16.8, Δbottom +0.0, Δcentre-x +0.0, Δheight +16.8
- round-start-lucid: step label Δtop -17.2, Δbottom -17.2, Δcentre-x -0.1, Δheight +0.0
- stability-nat1: screen title Δtop -7.7, Δbottom +19.2, Δcentre-x +0.1, Δheight +26.9
- stability-nat1: result line Δtop -24.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +24.0
- stability-check-surreal: screen title Δtop -4.5, Δbottom +22.4, Δcentre-x +0.1, Δheight +26.9
- stability-check-surreal: step button Δtop -16.8, Δbottom +0.0, Δcentre-x +0.0, Δheight +16.8
- stability-check-surreal: step label Δtop -17.2, Δbottom -17.2, Δcentre-x +0.0, Δheight +0.0
- stability-2d20-surreal: screen title Δtop -7.7, Δbottom +19.2, Δcentre-x +0.1, Δheight +26.9
- stability-2d20-surreal: result line Δtop -24.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +24.0
- stability-nat20: screen title Δtop -7.7, Δbottom +19.2, Δcentre-x +0.1, Δheight +26.9
- stability-nat20: result line Δtop -24.0, Δbottom +0.0, Δcentre-x -0.1, Δheight +24.0
- stability-check-lucid: screen title Δtop -4.5, Δbottom +22.4, Δcentre-x +0.1, Δheight +26.9
- stability-check-lucid: step button Δtop -16.8, Δbottom +0.0, Δcentre-x +0.0, Δheight +16.8
- stability-check-lucid: step label Δtop -17.2, Δbottom -17.2, Δcentre-x +0.0, Δheight +0.0
- stability-2d20-lucid: screen title Δtop -7.7, Δbottom +19.2, Δcentre-x +0.1, Δheight +26.9
- stability-2d20-lucid: result line Δtop -24.0, Δbottom +0.0, Δcentre-x -0.1, Δheight +24.0
- result-hold: screen title Δtop +16.3, Δbottom +43.2, Δcentre-x +0.1, Δheight +26.9
- salvation-n1-step: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.0, Δheight +0.0
- salvation-n1-step: step button Δtop -18.4, Δbottom +0.0, Δcentre-x +0.0, Δheight +18.4
- salvation-n1-step: step label Δtop -18.8, Δbottom +0.4, Δcentre-x -0.1, Δheight +19.2
- salvation-n1-nat20: screen title Δtop -4.8, Δbottom -4.8, Δcentre-x +0.0, Δheight +0.0
- salvation-n1-nat20: result line Δtop -48.0, Δbottom +0.0, Δcentre-x +0.1, Δheight +48.0
- salvation-n1-hit: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.0, Δheight +0.0
- salvation-n1-miss: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.0, Δheight +0.0
- salvation-n1-nat1: screen title Δtop +19.2, Δbottom +19.2, Δcentre-x +0.0, Δheight +0.0
- salvation-n1-nat1: result line Δtop -24.0, Δbottom +0.0, Δcentre-x +0.1, Δheight +24.0
- salvation-n2-nat20: screen title Δtop -4.8, Δbottom -4.8, Δcentre-x +0.0, Δheight +0.0
- salvation-n2-nat20: result line Δtop -48.0, Δbottom +0.0, Δcentre-x +0.1, Δheight +48.0
- salvation-n2-hit: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.0, Δheight +0.0
- salvation-n2-nat1: screen title Δtop +19.2, Δbottom +19.2, Δcentre-x +0.0, Δheight +0.0
- salvation-n2-nat1: result line Δtop -24.0, Δbottom +0.0, Δcentre-x +0.1, Δheight +24.0
- salvation-n3-step: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.0, Δheight +0.0
- salvation-n3-step: step button Δtop -18.4, Δbottom +0.0, Δcentre-x +0.0, Δheight +18.4
- salvation-n3-step: step label Δtop -18.8, Δbottom +0.4, Δcentre-x -0.1, Δheight +19.2
- salvation-n3-nat20: screen title Δtop -4.8, Δbottom -4.8, Δcentre-x +0.0, Δheight +0.0
- salvation-n3-nat20: result line Δtop -48.0, Δbottom +0.0, Δcentre-x +0.1, Δheight +48.0
- salvation-n3-hit: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.0, Δheight +0.0
- salvation-n3-miss: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.0, Δheight +0.0
- salvation-n3-nat1: screen title Δtop +19.2, Δbottom +19.2, Δcentre-x +0.0, Δheight +0.0
- salvation-n3-nat1: result line Δtop -24.0, Δbottom +0.0, Δcentre-x +0.1, Δheight +24.0
- salvation-n4-step: step button Δtop -18.4, Δbottom +0.0, Δcentre-x +0.0, Δheight +18.4
- salvation-n4-step: step label Δtop -18.8, Δbottom +0.4, Δcentre-x -0.1, Δheight +19.2
- salvation-n4-nat20: screen title Δtop -4.8, Δbottom -4.8, Δcentre-x +0.0, Δheight +0.0
- salvation-n4-nat20: result line Δtop -48.0, Δbottom +0.0, Δcentre-x +0.1, Δheight +48.0
- salvation-n4-hold: screen title Δtop +19.2, Δbottom +19.2, Δcentre-x +0.0, Δheight +0.0
- salvation-n4-hold: result line Δtop -24.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +24.0
- salvation-n4-loss: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.0, Δheight +0.0
- salvation-n4-nat1: screen title Δtop -4.8, Δbottom -4.8, Δcentre-x +0.0, Δheight +0.0
- salvation-n4-nat1: result line Δtop -48.0, Δbottom +0.0, Δcentre-x -0.1, Δheight +48.0
- salvation-step-lucid: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.0, Δheight +0.0
- salvation-step-lucid: step button Δtop -36.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +36.0
- salvation-step-lucid: step label Δtop -36.4, Δbottom -17.2, Δcentre-x -0.1, Δheight +19.2
- salvation-last-token: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.0, Δheight +0.0
- salvation-n4-fatal: screen title Δtop +19.2, Δbottom +19.2, Δcentre-x +0.0, Δheight +0.0
- salvation-n4-fatal: result line Δtop -24.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +24.0
- stability-fatal: screen title Δtop -7.7, Δbottom +19.2, Δcentre-x +0.1, Δheight +26.9
- stability-fatal: result line Δtop -24.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +24.0
- notice-return-king: screen title Δtop -31.1, Δbottom -4.2, Δcentre-x +0.1, Δheight +26.9
- notice-return-king-result: screen title Δtop -12.7, Δbottom +14.2, Δcentre-x +0.1, Δheight +26.9
- notice-return-king-result: result line Δtop -29.0, Δbottom -29.0, Δcentre-x +0.0, Δheight +0.0
- notice-skip-damage: screen title Δtop -29.0, Δbottom -29.0, Δcentre-x +0.0, Δheight +0.0
- notice-skip-damage: step button Δtop -18.4, Δbottom +0.0, Δcentre-x +0.0, Δheight +18.4
- notice-skip-damage: step label Δtop -18.8, Δbottom +0.4, Δcentre-x -0.1, Δheight +19.2
- keyboard-skip-link: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.1, Δheight +0.0
- keyboard-step-focus: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.1, Δheight +0.0
- header-menu: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.1, Δheight +0.0
- autoplay-on: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.1, Δheight +0.0
- header-menu-autoplay-on: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.1, Δheight +0.0
- easy-round-start: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.1, Δheight +0.0
- salvation-e1-step: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.0, Δheight +0.0
- salvation-e1-step: step button Δtop -18.4, Δbottom +0.0, Δcentre-x +0.0, Δheight +18.4
- salvation-e1-step: step label Δtop -18.8, Δbottom +0.4, Δcentre-x -0.1, Δheight +19.2
- salvation-e1-nat20: screen title Δtop -4.8, Δbottom -4.8, Δcentre-x +0.0, Δheight +0.0
- salvation-e1-nat20: result line Δtop -48.0, Δbottom +0.0, Δcentre-x +0.1, Δheight +48.0
- salvation-e1-hit: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.0, Δheight +0.0
- salvation-e1-miss: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.0, Δheight +0.0
- salvation-e1-nat1: screen title Δtop +19.2, Δbottom +19.2, Δcentre-x +0.0, Δheight +0.0
- salvation-e1-nat1: result line Δtop -24.0, Δbottom +0.0, Δcentre-x +0.1, Δheight +24.0
- salvation-e2-step: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.0, Δheight +0.0
- salvation-e2-step: step button Δtop -18.4, Δbottom +0.0, Δcentre-x +0.0, Δheight +18.4
- salvation-e2-step: step label Δtop -18.8, Δbottom +0.4, Δcentre-x -0.1, Δheight +19.2
- salvation-e2-nat20: screen title Δtop -4.8, Δbottom -4.8, Δcentre-x +0.0, Δheight +0.0
- salvation-e2-nat20: result line Δtop -48.0, Δbottom +0.0, Δcentre-x +0.1, Δheight +48.0
- salvation-e2-hit: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.0, Δheight +0.0
- salvation-e2-miss: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.0, Δheight +0.0
- salvation-e2-nat1: screen title Δtop +19.2, Δbottom +19.2, Δcentre-x +0.0, Δheight +0.0
- salvation-e2-nat1: result line Δtop -24.0, Δbottom +0.0, Δcentre-x +0.1, Δheight +24.0
- salvation-e3-step: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.0, Δheight +0.0
- salvation-e3-step: step button Δtop -18.4, Δbottom +0.0, Δcentre-x +0.0, Δheight +18.4
- salvation-e3-step: step label Δtop -18.8, Δbottom +0.4, Δcentre-x -0.1, Δheight +19.2
- salvation-e3-nat20: screen title Δtop -4.8, Δbottom -4.8, Δcentre-x +0.0, Δheight +0.0
- salvation-e3-nat20: result line Δtop -48.0, Δbottom +0.0, Δcentre-x +0.1, Δheight +48.0
- salvation-e3-hit: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.0, Δheight +0.0
- salvation-e3-miss: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.0, Δheight +0.0
- salvation-e3-nat1: screen title Δtop +19.2, Δbottom +19.2, Δcentre-x +0.0, Δheight +0.0
- salvation-e3-nat1: result line Δtop -24.0, Δbottom +0.0, Δcentre-x +0.1, Δheight +24.0
- easy-final-check: screen title Δtop -52.1, Δbottom +1.7, Δcentre-x +0.1, Δheight +53.8
- easy-final-check: step button Δtop -37.6, Δbottom +0.0, Δcentre-x +0.0, Δheight +37.6
- easy-final-check: step label Δtop -38.0, Δbottom +0.4, Δcentre-x +0.0, Δheight +38.4
- easy-final-escape: screen title Δtop -34.6, Δbottom +19.2, Δcentre-x +0.1, Δheight +53.8
- easy-final-escape: result line Δtop -24.0, Δbottom +0.0, Δcentre-x -0.1, Δheight +24.0
- easy-final-fatal: screen title Δtop -34.6, Δbottom +19.2, Δcentre-x +0.1, Δheight +53.8
- easy-final-fatal: result line Δtop -24.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +24.0
- salvation-h1-step: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.0, Δheight +0.0
- salvation-h1-step: step button Δtop -18.4, Δbottom +0.0, Δcentre-x +0.0, Δheight +18.4
- salvation-h1-step: step label Δtop -18.8, Δbottom +0.4, Δcentre-x -0.1, Δheight +19.2
- salvation-hard-miss: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.0, Δheight +0.0
- salvation-hard-nat1: screen title Δtop -4.8, Δbottom -4.8, Δcentre-x +0.0, Δheight +0.0
- salvation-hard-nat1: result line Δtop -48.0, Δbottom +0.0, Δcentre-x -0.1, Δheight +48.0
- salvation-hard-over: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.0, Δheight +0.0
- caption-odd: screen title Δtop +17.1, Δbottom +44.0, Δcentre-x +0.1, Δheight +26.9
- caption-king: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.0, Δheight +0.0
- caption-king: rule caption Δtop +56.7, Δbottom +56.7, Δcentre-x +0.0, Δheight +0.0
- caption-king: step button Δtop -18.4, Δbottom +0.0, Δcentre-x +0.0, Δheight +18.4
- caption-king: step label Δtop -18.8, Δbottom +0.4, Δcentre-x -0.1, Δheight +19.2
- caption-ace: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.1, Δheight +0.0
- caption-ace: rule caption Δtop +34.3, Δbottom +34.3, Δcentre-x +0.0, Δheight +0.0
- caption-lucid: screen title Δtop +38.1, Δbottom +65.0, Δcentre-x +0.1, Δheight +26.9
- caption-surreal: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.0, Δheight +0.0
- caption-surreal: rule caption Δtop +56.7, Δbottom +56.7, Δcentre-x +0.0, Δheight +0.0
- caption-surreal: step button Δtop -18.4, Δbottom +0.0, Δcentre-x +0.0, Δheight +18.4
- caption-surreal: step label Δtop -18.8, Δbottom +0.4, Δcentre-x -0.1, Δheight +19.2
- caption-salvation: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.1, Δheight +0.0
- caption-salvation: rule caption Δtop +14.7, Δbottom +34.3, Δcentre-x +0.0, Δheight +19.6
- caption-hard-token: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.0, Δheight +0.0
- caption-hard-token: rule caption Δtop +55.1, Δbottom +55.1, Δcentre-x +0.0, Δheight +0.0
- caption-easy-odd: screen title Δtop +17.1, Δbottom +44.0, Δcentre-x +0.1, Δheight +26.9
- caption-easy-salvation: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.0, Δheight +0.0
- caption-easy-salvation: rule caption Δtop +37.1, Δbottom +56.7, Δcentre-x +0.0, Δheight +19.6
- caption-easy-salvation: step button Δtop -18.4, Δbottom +0.0, Δcentre-x +0.0, Δheight +18.4
- caption-easy-salvation: step label Δtop -18.8, Δbottom +0.4, Δcentre-x -0.1, Δheight +19.2
- caption-easy-ace-third: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.1, Δheight +0.0
- caption-easy-ace-third: rule caption Δtop +14.7, Δbottom +34.3, Δcentre-x +0.0, Δheight +19.6
- caption-easy-fourth-ace: screen title Δtop +17.1, Δbottom +70.9, Δcentre-x +0.1, Δheight +53.8
- caption-easy-fourth-ace: step button Δtop -37.6, Δbottom +0.0, Δcentre-x +0.0, Δheight +37.6
- caption-easy-fourth-ace: step label Δtop -38.0, Δbottom +0.4, Δcentre-x +0.0, Δheight +38.4

## iphone-13 (390x844)

| state | screen title | rule caption | result line | step button | step label |
|---|---|---|---|---|---|
| instability-roll | 30,306 330x25 | – | – | 24,768 342x44 | 92,779 205x20 |
| instability-result | **!** 30,350 330x25 (Δtop +43, Δbottom +43, Δcx +0) | – | 82,391 226x20 | 24,768 342x44 | 148,779 95x20 |
| round-start | **!** 88,351 214x25 (Δtop +45, Δbottom +45, Δcx +0) | – | – | 24,768 342x44 | 119,779 152x20 |
| task-result | **!** 88,350 214x25 (Δtop +43, Δbottom +43, Δcx +0) | – | 100,391 189x20 | 24,768 342x44 | 126,779 138x20 |
| stability-check | **!** 56,300 278x54 (Δtop -7, Δbottom +22, Δcx +0) | – | – | 24,768 342x44 | 110,779 170x20 |
| stability-rolling | **!** 56,300 278x54 (Δtop -7, Δbottom +22, Δcx +0) | – | – | 24,768 342x44 | 148,779 95x20 |
| stability-11-19 | **!** 56,320 278x54 (Δtop +14, Δbottom +43, Δcx +0) | – | 61,391 267x20 | 24,768 342x44 | 148,779 95x20 |
| stability-check-ace | **!** 56,300 278x54 (Δtop -7, Δbottom +22, Δcx +0) | – | – | 24,768 342x44 | 110,779 170x20 |
| stability-6-10 | **!** 56,320 278x54 (Δtop +14, Δbottom +43, Δcx +0) | – | 82,391 226x20 | 24,768 342x44 | 148,779 95x20 |
| stability-2-5 | **!** 56,320 278x54 (Δtop +14, Δbottom +43, Δcx +0) | – | 82,391 226x20 | 24,768 342x44 | 148,779 95x20 |
| salvation-n2-step | **!** 46,351 298x25 (Δtop +45, Δbottom +45, Δcx +0) | – | – | **!** 24,750 342x62 (Δtop -18, Δbottom +0, Δcx +0) | **!** 107,761 175x39 (Δtop -19, Δbottom +0, Δcx -0) |
| salvation-n2-miss | **!** 46,350 298x25 (Δtop +43, Δbottom +43, Δcx +0) | – | 54,391 283x20 | 24,768 342x44 | 148,779 95x20 |
| round-start-r2 | **!** 81,351 228x25 (Δtop +45, Δbottom +45, Δcx +0) | – | – | 24,768 342x44 | 119,779 152x20 |
| task-result-nat1 | **!** 81,326 228x25 (Δtop +19, Δbottom +19, Δcx +0) | – | **!** 49,367 292x44 (Δtop -24, Δbottom +0, Δcx -0) | 24,768 342x44 | 134,779 123x20 |
| round-start-surreal | **!** 81,351 228x25 (Δtop +45, Δbottom +45, Δcx +0) | – | – | **!** 24,751 342x61 (Δtop -17, Δbottom +0, Δcx +0) | **!** 119,762 152x20 (Δtop -17, Δbottom -17, Δcx +0) |
| task-result-nat20 | **!** 81,302 228x25 (Δtop -5, Δbottom -5, Δcx +0) | – | **!** 68,343 254x68 (Δtop -48, Δbottom +0, Δcx -0) | 24,768 342x44 | 126,779 138x20 |
| round-start-lucid | **!** 81,351 228x25 (Δtop +45, Δbottom +45, Δcx +0) | – | – | **!** 24,751 342x61 (Δtop -17, Δbottom +0, Δcx +0) | **!** 119,762 152x20 (Δtop -17, Δbottom -17, Δcx -0) |
| stability-nat1 | **!** 56,296 278x54 (Δtop -10, Δbottom +19, Δcx +0) | – | **!** 52,367 286x44 (Δtop -24, Δbottom +0, Δcx +0) | 24,768 342x44 | 148,779 95x20 |
| stability-check-surreal | **!** 56,300 278x54 (Δtop -7, Δbottom +22, Δcx +0) | – | – | **!** 24,751 342x61 (Δtop -17, Δbottom +0, Δcx +0) | **!** 110,762 170x20 (Δtop -17, Δbottom -17, Δcx +0) |
| stability-2d20-surreal | **!** 56,320 278x54 (Δtop +14, Δbottom +43, Δcx +0) | – | 28,391 334x20 | 24,768 342x44 | 148,779 95x20 |
| stability-nat20 | **!** 56,296 278x54 (Δtop -10, Δbottom +19, Δcx +0) | – | **!** 52,367 287x44 (Δtop -24, Δbottom +0, Δcx -0) | 24,768 342x44 | 148,779 95x20 |
| stability-check-lucid | **!** 56,300 278x54 (Δtop -7, Δbottom +22, Δcx +0) | – | – | **!** 24,751 342x61 (Δtop -17, Δbottom +0, Δcx +0) | **!** 110,762 170x20 (Δtop -17, Δbottom -17, Δcx +0) |
| stability-2d20-lucid | **!** 56,296 278x54 (Δtop -10, Δbottom +19, Δcx +0) | – | **!** 100,367 190x44 (Δtop -24, Δbottom +0, Δcx -0) | 24,768 342x44 | 148,779 95x20 |
| result-hold | **!** 56,320 278x54 (Δtop +14, Δbottom +43, Δcx +0) | – | 82,391 226x20 | 24,768 342x44 | 148,779 95x20 |
| salvation-n1-step | **!** 46,351 298x25 (Δtop +45, Δbottom +45, Δcx +0) | – | – | **!** 24,750 342x62 (Δtop -18, Δbottom +0, Δcx +0) | **!** 107,761 175x39 (Δtop -19, Δbottom +0, Δcx -0) |
| salvation-n1-nat20 | **!** 46,326 298x25 (Δtop +19, Δbottom +19, Δcx +0) | – | **!** 32,367 325x44 (Δtop -24, Δbottom +0, Δcx +0) | 24,768 342x44 | 148,779 95x20 |
| salvation-n1-hit | **!** 46,350 298x25 (Δtop +43, Δbottom +43, Δcx +0) | – | 91,391 208x20 | 24,768 342x44 | 148,779 95x20 |
| salvation-n1-miss | **!** 46,350 298x25 (Δtop +43, Δbottom +43, Δcx +0) | – | 48,391 293x20 | 24,768 342x44 | 148,779 95x20 |
| salvation-n1-nat1 | **!** 46,326 298x25 (Δtop +19, Δbottom +19, Δcx +0) | – | **!** 46,367 298x44 (Δtop -24, Δbottom +0, Δcx +0) | 24,768 342x44 | 148,779 95x20 |
| salvation-n2-nat20 | **!** 46,326 298x25 (Δtop +19, Δbottom +19, Δcx +0) | – | **!** 32,367 325x44 (Δtop -24, Δbottom +0, Δcx +0) | 24,768 342x44 | 148,779 95x20 |
| salvation-n2-hit | **!** 46,350 298x25 (Δtop +43, Δbottom +43, Δcx +0) | – | 91,391 208x20 | 24,768 342x44 | 148,779 95x20 |
| salvation-n2-nat1 | **!** 46,326 298x25 (Δtop +19, Δbottom +19, Δcx +0) | – | **!** 46,367 298x44 (Δtop -24, Δbottom +0, Δcx +0) | 24,768 342x44 | 148,779 95x20 |
| salvation-n3-step | **!** 46,351 298x25 (Δtop +45, Δbottom +45, Δcx +0) | – | – | **!** 24,750 342x62 (Δtop -18, Δbottom +0, Δcx +0) | **!** 107,761 175x39 (Δtop -19, Δbottom +0, Δcx -0) |
| salvation-n3-nat20 | **!** 46,326 298x25 (Δtop +19, Δbottom +19, Δcx +0) | – | **!** 32,367 325x44 (Δtop -24, Δbottom +0, Δcx +0) | 24,768 342x44 | 148,779 95x20 |
| salvation-n3-hit | **!** 46,350 298x25 (Δtop +43, Δbottom +43, Δcx +0) | – | 91,391 208x20 | 24,768 342x44 | 148,779 95x20 |
| salvation-n3-miss | **!** 46,350 298x25 (Δtop +43, Δbottom +43, Δcx +0) | – | 48,391 293x20 | 24,768 342x44 | 148,779 95x20 |
| salvation-n3-nat1 | **!** 46,326 298x25 (Δtop +19, Δbottom +19, Δcx +0) | – | **!** 46,367 298x44 (Δtop -24, Δbottom +0, Δcx +0) | 24,768 342x44 | 148,779 95x20 |
| salvation-n4-step | **!** 46,329 298x25 (Δtop +22, Δbottom +22, Δcx +0) | – | – | **!** 24,750 342x62 (Δtop -18, Δbottom +0, Δcx +0) | **!** 88,761 214x39 (Δtop -19, Δbottom +0, Δcx -0) |
| salvation-n4-nat20 | **!** 46,302 298x25 (Δtop -5, Δbottom -5, Δcx +0) | – | **!** 71,343 249x68 (Δtop -48, Δbottom +0, Δcx +0) | 24,768 342x44 | 148,779 95x20 |
| salvation-n4-hold | **!** 46,350 298x25 (Δtop +43, Δbottom +43, Δcx +0) | – | 24,391 341x20 | 24,768 342x44 | 148,779 95x20 |
| salvation-n4-loss | **!** 46,350 298x25 (Δtop +43, Δbottom +43, Δcx +0) | – | 45,391 300x20 | 24,768 342x44 | 148,779 95x20 |
| salvation-n4-nat1 | **!** 46,302 298x25 (Δtop -5, Δbottom -5, Δcx +0) | – | **!** 68,343 255x68 (Δtop -48, Δbottom +0, Δcx -0) | 24,768 342x44 | 148,779 95x20 |
| salvation-step-lucid | **!** 46,351 298x25 (Δtop +45, Δbottom +45, Δcx +0) | – | – | **!** 24,732 342x80 (Δtop -36, Δbottom +0, Δcx +0) | **!** 107,743 175x39 (Δtop -36, Δbottom -17, Δcx -0) |
| salvation-last-token | **!** 46,350 298x25 (Δtop +43, Δbottom +43, Δcx +0) | – | 91,391 208x20 | 24,768 342x44 | 160,779 71x20 |
| salvation-n4-fatal | **!** 46,326 298x25 (Δtop +19, Δbottom +19, Δcx +0) | – | **!** 87,367 215x44 (Δtop -24, Δbottom +0, Δcx +0) | 24,768 342x44 | 130,779 129x20 |
| stability-fatal | **!** 56,296 278x54 (Δtop -10, Δbottom +19, Δcx +0) | – | **!** 87,367 215x44 (Δtop -24, Δbottom +0, Δcx +0) | 24,768 342x44 | 130,779 129x20 |
| notice-return-king | **!** 56,271 278x54 (Δtop -36, Δbottom -7, Δcx +0) | – | – | 24,768 342x44 | 110,779 170x20 |
| notice-return-king-result | **!** 56,292 278x54 (Δtop -15, Δbottom +14, Δcx +0) | – | **!** 61,362 267x20 (Δtop -29, Δbottom -29, Δcx +0) | 24,768 342x44 | 148,779 95x20 |
| notice-skip-damage | **!** 46,300 298x25 (Δtop -7, Δbottom -7, Δcx +0) | – | – | **!** 24,750 342x62 (Δtop -18, Δbottom +0, Δcx +0) | **!** 88,761 214x39 (Δtop -19, Δbottom +0, Δcx -0) |
| keyboard-skip-link | **!** 81,351 228x25 (Δtop +45, Δbottom +45, Δcx +0) | – | – | 24,768 342x44 | 119,779 152x20 |
| keyboard-step-focus | **!** 81,351 228x25 (Δtop +45, Δbottom +45, Δcx +0) | – | – | 24,768 342x44 | 119,779 152x20 |
| header-menu | **!** 81,351 228x25 (Δtop +45, Δbottom +45, Δcx +0) | – | – | 24,768 342x44 | 119,779 152x20 |
| autoplay-on | **!** 88,351 214x25 (Δtop +45, Δbottom +45, Δcx +0) | – | – | 24,768 342x44 | 119,779 152x20 |
| header-menu-autoplay-on | **!** 88,351 214x25 (Δtop +45, Δbottom +45, Δcx +0) | – | – | 24,768 342x44 | 119,779 152x20 |
| easy-round-start | **!** 88,351 214x25 (Δtop +45, Δbottom +45, Δcx +0) | – | – | 24,768 342x44 | 119,779 152x20 |
| salvation-e1-step | **!** 46,351 298x25 (Δtop +45, Δbottom +45, Δcx +0) | – | – | **!** 24,750 342x62 (Δtop -18, Δbottom +0, Δcx +0) | **!** 107,761 175x39 (Δtop -19, Δbottom +0, Δcx -0) |
| salvation-e1-nat20 | **!** 46,326 298x25 (Δtop +19, Δbottom +19, Δcx +0) | – | **!** 32,367 325x44 (Δtop -24, Δbottom +0, Δcx +0) | 24,768 342x44 | 148,779 95x20 |
| salvation-e1-hit | **!** 46,350 298x25 (Δtop +43, Δbottom +43, Δcx +0) | – | 91,391 208x20 | 24,768 342x44 | 148,779 95x20 |
| salvation-e1-miss | **!** 46,350 298x25 (Δtop +43, Δbottom +43, Δcx +0) | – | 48,391 293x20 | 24,768 342x44 | 148,779 95x20 |
| salvation-e1-nat1 | **!** 46,326 298x25 (Δtop +19, Δbottom +19, Δcx +0) | – | **!** 46,367 298x44 (Δtop -24, Δbottom +0, Δcx +0) | 24,768 342x44 | 148,779 95x20 |
| salvation-e2-step | **!** 46,351 298x25 (Δtop +45, Δbottom +45, Δcx +0) | – | – | **!** 24,750 342x62 (Δtop -18, Δbottom +0, Δcx +0) | **!** 107,761 175x39 (Δtop -19, Δbottom +0, Δcx -0) |
| salvation-e2-nat20 | **!** 46,326 298x25 (Δtop +19, Δbottom +19, Δcx +0) | – | **!** 32,367 325x44 (Δtop -24, Δbottom +0, Δcx +0) | 24,768 342x44 | 148,779 95x20 |
| salvation-e2-hit | **!** 46,350 298x25 (Δtop +43, Δbottom +43, Δcx +0) | – | 91,391 208x20 | 24,768 342x44 | 148,779 95x20 |
| salvation-e2-miss | **!** 46,350 298x25 (Δtop +43, Δbottom +43, Δcx +0) | – | 48,391 293x20 | 24,768 342x44 | 148,779 95x20 |
| salvation-e2-nat1 | **!** 46,326 298x25 (Δtop +19, Δbottom +19, Δcx +0) | – | **!** 46,367 298x44 (Δtop -24, Δbottom +0, Δcx +0) | 24,768 342x44 | 148,779 95x20 |
| salvation-e3-step | **!** 46,351 298x25 (Δtop +45, Δbottom +45, Δcx +0) | – | – | **!** 24,750 342x62 (Δtop -18, Δbottom +0, Δcx +0) | **!** 107,761 175x39 (Δtop -19, Δbottom +0, Δcx -0) |
| salvation-e3-nat20 | **!** 46,326 298x25 (Δtop +19, Δbottom +19, Δcx +0) | – | **!** 32,367 325x44 (Δtop -24, Δbottom +0, Δcx +0) | 24,768 342x44 | 148,779 95x20 |
| salvation-e3-hit | **!** 46,350 298x25 (Δtop +43, Δbottom +43, Δcx +0) | – | 91,391 208x20 | 24,768 342x44 | 148,779 95x20 |
| salvation-e3-miss | **!** 46,350 298x25 (Δtop +43, Δbottom +43, Δcx +0) | – | 48,391 293x20 | 24,768 342x44 | 148,779 95x20 |
| salvation-e3-nat1 | **!** 46,326 298x25 (Δtop +19, Δbottom +19, Δcx +0) | – | **!** 46,367 298x44 (Δtop -24, Δbottom +0, Δcx +0) | 24,768 342x44 | 148,779 95x20 |
| easy-final-check | **!** 56,248 278x83 (Δtop -58, Δbottom +0, Δcx +0) | – | – | **!** 24,750 342x62 (Δtop -18, Δbottom +0, Δcx +0) | **!** 54,761 282x39 (Δtop -19, Δbottom +0, Δcx +0) |
| easy-final-escape | **!** 56,267 278x83 (Δtop -39, Δbottom +19, Δcx +0) | – | **!** 99,367 192x44 (Δtop -24, Δbottom +0, Δcx -0) | 24,768 342x44 | 160,779 71x20 |
| easy-final-fatal | **!** 56,267 278x83 (Δtop -39, Δbottom +19, Δcx +0) | – | **!** 87,367 215x44 (Δtop -24, Δbottom +0, Δcx +0) | 24,768 342x44 | 130,779 129x20 |
| salvation-h1-step | **!** 46,351 298x25 (Δtop +45, Δbottom +45, Δcx +0) | – | – | **!** 24,750 342x62 (Δtop -18, Δbottom +0, Δcx +0) | **!** 107,761 175x39 (Δtop -19, Δbottom +0, Δcx -0) |
| salvation-hard-miss | **!** 46,350 298x25 (Δtop +43, Δbottom +43, Δcx +0) | – | 43,391 305x20 | 24,768 342x44 | 148,779 95x20 |
| salvation-hard-nat1 | **!** 46,326 298x25 (Δtop +19, Δbottom +19, Δcx +0) | – | **!** 35,367 319x44 (Δtop -24, Δbottom +0, Δcx -0) | 24,768 342x44 | 148,779 95x20 |
| salvation-hard-over | **!** 46,350 298x25 (Δtop +43, Δbottom +43, Δcx +0) | – | 37,391 315x20 | 24,768 342x44 | 148,779 95x20 |
| caption-odd | **!** 56,300 278x54 (Δtop -7, Δbottom +22, Δcx +0) | 23,200 344x57 | – | 24,768 342x44 | 110,779 170x20 |
| caption-king | **!** 46,351 298x25 (Δtop +45, Δbottom +45, Δcx +0) | **!** 23,280 344x57 (Δtop +81, Δbottom +80, Δcx +0) | – | **!** 24,750 342x62 (Δtop -18, Δbottom +0, Δcx +0) | **!** 107,761 175x39 (Δtop -19, Δbottom +0, Δcx -0) |
| caption-ace | **!** 81,351 228x25 (Δtop +45, Δbottom +45, Δcx +0) | **!** 23,280 344x57 (Δtop +81, Δbottom +80, Δcx +0) | – | 24,768 342x44 | 119,779 152x20 |
| caption-lucid | **!** 56,300 278x54 (Δtop -7, Δbottom +22, Δcx +0) | **!** 23,179 344x57 (Δtop -21, Δbottom -21, Δcx +0) | – | 24,768 342x44 | 110,779 170x20 |
| caption-surreal | **!** 46,351 298x25 (Δtop +45, Δbottom +45, Δcx +0) | **!** 23,280 344x57 (Δtop +81, Δbottom +80, Δcx +0) | – | **!** 24,750 342x62 (Δtop -18, Δbottom +0, Δcx +0) | **!** 107,761 175x39 (Δtop -19, Δbottom +0, Δcx -0) |
| caption-salvation | **!** 81,351 228x25 (Δtop +45, Δbottom +45, Δcx +0) | **!** 23,260 344x77 (Δtop +61, Δbottom +80, Δcx +0) | – | 24,768 342x44 | 119,779 152x20 |
| caption-hard-token | **!** 46,350 298x25 (Δtop +43, Δbottom +43, Δcx +0) | **!** 23,278 344x57 (Δtop +79, Δbottom +79, Δcx +0) | 43,391 305x20 | 24,768 342x44 | 148,779 95x20 |
| caption-easy-odd | **!** 56,300 278x54 (Δtop -7, Δbottom +22, Δcx +0) | 23,200 344x57 | – | 24,768 342x44 | 110,779 170x20 |
| caption-easy-salvation | **!** 46,351 298x25 (Δtop +45, Δbottom +45, Δcx +0) | **!** 23,260 344x77 (Δtop +61, Δbottom +80, Δcx +0) | – | **!** 24,750 342x62 (Δtop -18, Δbottom +0, Δcx +0) | **!** 107,761 175x39 (Δtop -19, Δbottom +0, Δcx -0) |
| caption-easy-ace-third | **!** 81,351 228x25 (Δtop +45, Δbottom +45, Δcx +0) | **!** 23,260 344x77 (Δtop +61, Δbottom +80, Δcx +0) | – | 24,768 342x44 | 119,779 152x20 |
| caption-easy-fourth-ace | **!** 56,248 278x83 (Δtop -58, Δbottom +0, Δcx +0) | **!** 23,148 344x57 (Δtop -52, Δbottom -52, Δcx +0) | – | **!** 24,750 342x62 (Δtop -18, Δbottom +0, Δcx +0) | **!** 54,761 282x39 (Δtop -19, Δbottom +0, Δcx +0) |
| rm-instability-roll | 30,306 330x25 | – | – | 24,768 342x44 | 92,779 205x20 |
| rm-static-roll | 30,306 330x25 | – | – | 24,768 342x44 | 148,779 95x20 |
| rm-instability-result | **!** 30,350 330x25 (Δtop +43, Δbottom +43, Δcx +0) | – | 82,391 226x20 | 24,768 342x44 | 148,779 95x20 |
| rm-round-start | **!** 88,351 214x25 (Δtop +45, Δbottom +45, Δcx +0) | – | – | 24,768 342x44 | 119,779 152x20 |
| rm-task-result | **!** 88,350 214x25 (Δtop +43, Δbottom +43, Δcx +0) | – | 106,391 179x20 | 24,768 342x44 | 126,779 138x20 |
| rm-stability-check | **!** 56,300 278x54 (Δtop -7, Δbottom +22, Δcx +0) | – | – | 24,768 342x44 | 110,779 170x20 |
| rm-static-roll-after-resize | **!** 56,300 278x54 (Δtop -7, Δbottom +22, Δcx +0) | – | – | 24,768 342x44 | 148,779 95x20 |
| rm-stability-result | **!** 56,320 278x54 (Δtop +14, Δbottom +43, Δcx +0) | – | 82,391 226x20 | 24,768 342x44 | 148,779 95x20 |
| rm-salvation-step | **!** 46,351 298x25 (Δtop +45, Δbottom +45, Δcx +0) | – | – | **!** 24,750 342x62 (Δtop -18, Δbottom +0, Δcx +0) | **!** 107,761 175x39 (Δtop -19, Δbottom +0, Δcx -0) |
| rm-salvation-hit | **!** 46,350 298x25 (Δtop +43, Δbottom +43, Δcx +0) | – | 91,391 208x20 | 24,768 342x44 | 148,779 95x20 |
| rm-result-hold | **!** 88,350 214x25 (Δtop +43, Δbottom +43, Δcx +0) | – | 100,391 189x20 | 24,768 342x44 | 126,779 138x20 |
| **max delta** | Δtop 103 · Δbottom 51 · Δcx 0 · Δw 116 · Δh 58 | Δtop 132 · Δbottom 132 · Δcx 0 · Δw 0 · Δh 20 | Δtop 48 · Δbottom 29 · Δcx 0 · Δw 162 · Δh 48 | Δtop 36 · Δbottom 0 · Δcx 0 · Δw 0 · Δh 36 | Δtop 36 · Δbottom 18 · Δcx 0 · Δw 211 · Δh 19 |

Reference states: screen title = instability-roll, rule caption = caption-odd, result line = instability-result, step button = instability-roll, step label = instability-roll

Flagged shifts over 2px at iphone-13: 170

- instability-result: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.0, Δheight +0.0
- round-start: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.1, Δheight +0.0
- task-result: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.1, Δheight +0.0
- stability-check: screen title Δtop -6.7, Δbottom +22.4, Δcentre-x +0.0, Δheight +29.1
- stability-rolling: screen title Δtop -6.7, Δbottom +22.4, Δcentre-x +0.0, Δheight +29.1
- stability-11-19: screen title Δtop +14.0, Δbottom +43.1, Δcentre-x +0.0, Δheight +29.1
- stability-check-ace: screen title Δtop -6.7, Δbottom +22.4, Δcentre-x +0.0, Δheight +29.1
- stability-6-10: screen title Δtop +14.0, Δbottom +43.1, Δcentre-x +0.0, Δheight +29.1
- stability-2-5: screen title Δtop +14.0, Δbottom +43.1, Δcentre-x +0.0, Δheight +29.1
- salvation-n2-step: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.1, Δheight +0.0
- salvation-n2-step: step button Δtop -18.4, Δbottom +0.0, Δcentre-x +0.0, Δheight +18.4
- salvation-n2-step: step label Δtop -18.8, Δbottom +0.4, Δcentre-x -0.1, Δheight +19.2
- salvation-n2-miss: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.1, Δheight +0.0
- round-start-r2: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.1, Δheight +0.0
- task-result-nat1: screen title Δtop +19.2, Δbottom +19.2, Δcentre-x +0.1, Δheight +0.0
- task-result-nat1: result line Δtop -24.0, Δbottom +0.0, Δcentre-x -0.1, Δheight +24.0
- round-start-surreal: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.1, Δheight +0.0
- round-start-surreal: step button Δtop -16.8, Δbottom +0.0, Δcentre-x +0.0, Δheight +16.8
- round-start-surreal: step label Δtop -17.2, Δbottom -17.2, Δcentre-x +0.1, Δheight +0.0
- task-result-nat20: screen title Δtop -4.8, Δbottom -4.8, Δcentre-x +0.1, Δheight +0.0
- task-result-nat20: result line Δtop -48.0, Δbottom +0.0, Δcentre-x -0.1, Δheight +48.0
- round-start-lucid: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.1, Δheight +0.0
- round-start-lucid: step button Δtop -16.8, Δbottom +0.0, Δcentre-x +0.0, Δheight +16.8
- round-start-lucid: step label Δtop -17.2, Δbottom -17.2, Δcentre-x -0.1, Δheight +0.0
- stability-nat1: screen title Δtop -10.0, Δbottom +19.1, Δcentre-x +0.0, Δheight +29.1
- stability-nat1: result line Δtop -24.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +24.0
- stability-check-surreal: screen title Δtop -6.7, Δbottom +22.4, Δcentre-x +0.0, Δheight +29.1
- stability-check-surreal: step button Δtop -16.8, Δbottom +0.0, Δcentre-x +0.0, Δheight +16.8
- stability-check-surreal: step label Δtop -17.2, Δbottom -17.2, Δcentre-x +0.0, Δheight +0.0
- stability-2d20-surreal: screen title Δtop +14.0, Δbottom +43.1, Δcentre-x +0.0, Δheight +29.1
- stability-nat20: screen title Δtop -10.0, Δbottom +19.1, Δcentre-x +0.0, Δheight +29.1
- stability-nat20: result line Δtop -24.0, Δbottom +0.0, Δcentre-x -0.1, Δheight +24.0
- stability-check-lucid: screen title Δtop -6.7, Δbottom +22.4, Δcentre-x +0.0, Δheight +29.1
- stability-check-lucid: step button Δtop -16.8, Δbottom +0.0, Δcentre-x +0.0, Δheight +16.8
- stability-check-lucid: step label Δtop -17.2, Δbottom -17.2, Δcentre-x +0.0, Δheight +0.0
- stability-2d20-lucid: screen title Δtop -10.0, Δbottom +19.1, Δcentre-x +0.0, Δheight +29.1
- stability-2d20-lucid: result line Δtop -24.0, Δbottom +0.0, Δcentre-x -0.1, Δheight +24.0
- result-hold: screen title Δtop +14.0, Δbottom +43.1, Δcentre-x +0.0, Δheight +29.1
- salvation-n1-step: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.1, Δheight +0.0
- salvation-n1-step: step button Δtop -18.4, Δbottom +0.0, Δcentre-x +0.0, Δheight +18.4
- salvation-n1-step: step label Δtop -18.8, Δbottom +0.4, Δcentre-x -0.1, Δheight +19.2
- salvation-n1-nat20: screen title Δtop +19.2, Δbottom +19.2, Δcentre-x +0.1, Δheight +0.0
- salvation-n1-nat20: result line Δtop -24.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +24.0
- salvation-n1-hit: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.1, Δheight +0.0
- salvation-n1-miss: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.1, Δheight +0.0
- salvation-n1-nat1: screen title Δtop +19.2, Δbottom +19.2, Δcentre-x +0.1, Δheight +0.0
- salvation-n1-nat1: result line Δtop -24.0, Δbottom +0.0, Δcentre-x +0.1, Δheight +24.0
- salvation-n2-nat20: screen title Δtop +19.2, Δbottom +19.2, Δcentre-x +0.1, Δheight +0.0
- salvation-n2-nat20: result line Δtop -24.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +24.0
- salvation-n2-hit: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.1, Δheight +0.0
- salvation-n2-nat1: screen title Δtop +19.2, Δbottom +19.2, Δcentre-x +0.1, Δheight +0.0
- salvation-n2-nat1: result line Δtop -24.0, Δbottom +0.0, Δcentre-x +0.1, Δheight +24.0
- salvation-n3-step: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.1, Δheight +0.0
- salvation-n3-step: step button Δtop -18.4, Δbottom +0.0, Δcentre-x +0.0, Δheight +18.4
- salvation-n3-step: step label Δtop -18.8, Δbottom +0.4, Δcentre-x -0.1, Δheight +19.2
- salvation-n3-nat20: screen title Δtop +19.2, Δbottom +19.2, Δcentre-x +0.1, Δheight +0.0
- salvation-n3-nat20: result line Δtop -24.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +24.0
- salvation-n3-hit: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.1, Δheight +0.0
- salvation-n3-miss: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.1, Δheight +0.0
- salvation-n3-nat1: screen title Δtop +19.2, Δbottom +19.2, Δcentre-x +0.1, Δheight +0.0
- salvation-n3-nat1: result line Δtop -24.0, Δbottom +0.0, Δcentre-x +0.1, Δheight +24.0
- salvation-n4-step: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.1, Δheight +0.0
- salvation-n4-step: step button Δtop -18.4, Δbottom +0.0, Δcentre-x +0.0, Δheight +18.4
- salvation-n4-step: step label Δtop -18.8, Δbottom +0.4, Δcentre-x -0.1, Δheight +19.2
- salvation-n4-nat20: screen title Δtop -4.8, Δbottom -4.8, Δcentre-x +0.1, Δheight +0.0
- salvation-n4-nat20: result line Δtop -48.0, Δbottom +0.0, Δcentre-x +0.1, Δheight +48.0
- salvation-n4-hold: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.1, Δheight +0.0
- salvation-n4-loss: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.1, Δheight +0.0
- salvation-n4-nat1: screen title Δtop -4.8, Δbottom -4.8, Δcentre-x +0.1, Δheight +0.0
- salvation-n4-nat1: result line Δtop -48.0, Δbottom +0.0, Δcentre-x -0.1, Δheight +48.0
- salvation-step-lucid: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.1, Δheight +0.0
- salvation-step-lucid: step button Δtop -36.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +36.0
- salvation-step-lucid: step label Δtop -36.4, Δbottom -17.2, Δcentre-x -0.1, Δheight +19.2
- salvation-last-token: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.1, Δheight +0.0
- salvation-n4-fatal: screen title Δtop +19.2, Δbottom +19.2, Δcentre-x +0.1, Δheight +0.0
- salvation-n4-fatal: result line Δtop -24.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +24.0
- stability-fatal: screen title Δtop -10.0, Δbottom +19.1, Δcentre-x +0.0, Δheight +29.1
- stability-fatal: result line Δtop -24.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +24.0
- notice-return-king: screen title Δtop -35.7, Δbottom -6.6, Δcentre-x +0.0, Δheight +29.1
- notice-return-king-result: screen title Δtop -15.0, Δbottom +14.1, Δcentre-x +0.0, Δheight +29.1
- notice-return-king-result: result line Δtop -29.0, Δbottom -29.0, Δcentre-x +0.0, Δheight +0.0
- notice-skip-damage: screen title Δtop -6.6, Δbottom -6.6, Δcentre-x +0.1, Δheight +0.0
- notice-skip-damage: step button Δtop -18.4, Δbottom +0.0, Δcentre-x +0.0, Δheight +18.4
- notice-skip-damage: step label Δtop -18.8, Δbottom +0.4, Δcentre-x -0.1, Δheight +19.2
- keyboard-skip-link: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.1, Δheight +0.0
- keyboard-step-focus: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.1, Δheight +0.0
- header-menu: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.1, Δheight +0.0
- autoplay-on: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.1, Δheight +0.0
- header-menu-autoplay-on: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.1, Δheight +0.0
- easy-round-start: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.1, Δheight +0.0
- salvation-e1-step: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.1, Δheight +0.0
- salvation-e1-step: step button Δtop -18.4, Δbottom +0.0, Δcentre-x +0.0, Δheight +18.4
- salvation-e1-step: step label Δtop -18.8, Δbottom +0.4, Δcentre-x -0.1, Δheight +19.2
- salvation-e1-nat20: screen title Δtop +19.2, Δbottom +19.2, Δcentre-x +0.1, Δheight +0.0
- salvation-e1-nat20: result line Δtop -24.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +24.0
- salvation-e1-hit: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.1, Δheight +0.0
- salvation-e1-miss: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.1, Δheight +0.0
- salvation-e1-nat1: screen title Δtop +19.2, Δbottom +19.2, Δcentre-x +0.1, Δheight +0.0
- salvation-e1-nat1: result line Δtop -24.0, Δbottom +0.0, Δcentre-x +0.1, Δheight +24.0
- salvation-e2-step: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.1, Δheight +0.0
- salvation-e2-step: step button Δtop -18.4, Δbottom +0.0, Δcentre-x +0.0, Δheight +18.4
- salvation-e2-step: step label Δtop -18.8, Δbottom +0.4, Δcentre-x -0.1, Δheight +19.2
- salvation-e2-nat20: screen title Δtop +19.2, Δbottom +19.2, Δcentre-x +0.1, Δheight +0.0
- salvation-e2-nat20: result line Δtop -24.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +24.0
- salvation-e2-hit: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.1, Δheight +0.0
- salvation-e2-miss: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.1, Δheight +0.0
- salvation-e2-nat1: screen title Δtop +19.2, Δbottom +19.2, Δcentre-x +0.1, Δheight +0.0
- salvation-e2-nat1: result line Δtop -24.0, Δbottom +0.0, Δcentre-x +0.1, Δheight +24.0
- salvation-e3-step: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.1, Δheight +0.0
- salvation-e3-step: step button Δtop -18.4, Δbottom +0.0, Δcentre-x +0.0, Δheight +18.4
- salvation-e3-step: step label Δtop -18.8, Δbottom +0.4, Δcentre-x -0.1, Δheight +19.2
- salvation-e3-nat20: screen title Δtop +19.2, Δbottom +19.2, Δcentre-x +0.1, Δheight +0.0
- salvation-e3-nat20: result line Δtop -24.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +24.0
- salvation-e3-hit: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.1, Δheight +0.0
- salvation-e3-miss: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.1, Δheight +0.0
- salvation-e3-nat1: screen title Δtop +19.2, Δbottom +19.2, Δcentre-x +0.1, Δheight +0.0
- salvation-e3-nat1: result line Δtop -24.0, Δbottom +0.0, Δcentre-x +0.1, Δheight +24.0
- easy-final-check: screen title Δtop -58.3, Δbottom +0.0, Δcentre-x +0.0, Δheight +58.3
- easy-final-check: step button Δtop -18.4, Δbottom +0.0, Δcentre-x +0.0, Δheight +18.4
- easy-final-check: step label Δtop -18.8, Δbottom +0.4, Δcentre-x +0.1, Δheight +19.2
- easy-final-escape: screen title Δtop -39.1, Δbottom +19.2, Δcentre-x +0.0, Δheight +58.3
- easy-final-escape: result line Δtop -24.0, Δbottom +0.0, Δcentre-x -0.1, Δheight +24.0
- easy-final-fatal: screen title Δtop -39.1, Δbottom +19.2, Δcentre-x +0.0, Δheight +58.3
- easy-final-fatal: result line Δtop -24.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +24.0
- salvation-h1-step: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.1, Δheight +0.0
- salvation-h1-step: step button Δtop -18.4, Δbottom +0.0, Δcentre-x +0.0, Δheight +18.4
- salvation-h1-step: step label Δtop -18.8, Δbottom +0.4, Δcentre-x -0.1, Δheight +19.2
- salvation-hard-miss: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.1, Δheight +0.0
- salvation-hard-nat1: screen title Δtop +19.2, Δbottom +19.2, Δcentre-x +0.1, Δheight +0.0
- salvation-hard-nat1: result line Δtop -24.0, Δbottom +0.0, Δcentre-x -0.1, Δheight +24.0
- salvation-hard-over: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.1, Δheight +0.0
- caption-odd: screen title Δtop -6.7, Δbottom +22.4, Δcentre-x +0.0, Δheight +29.1
- caption-king: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.1, Δheight +0.0
- caption-king: rule caption Δtop +80.5, Δbottom +80.5, Δcentre-x +0.0, Δheight +0.0
- caption-king: step button Δtop -18.4, Δbottom +0.0, Δcentre-x +0.0, Δheight +18.4
- caption-king: step label Δtop -18.8, Δbottom +0.4, Δcentre-x -0.1, Δheight +19.2
- caption-ace: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.1, Δheight +0.0
- caption-ace: rule caption Δtop +80.5, Δbottom +80.5, Δcentre-x +0.0, Δheight +0.0
- caption-lucid: screen title Δtop -6.7, Δbottom +22.4, Δcentre-x +0.0, Δheight +29.1
- caption-lucid: rule caption Δtop -21.0, Δbottom -21.0, Δcentre-x +0.0, Δheight +0.0
- caption-surreal: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.1, Δheight +0.0
- caption-surreal: rule caption Δtop +80.5, Δbottom +80.5, Δcentre-x +0.0, Δheight +0.0
- caption-surreal: step button Δtop -18.4, Δbottom +0.0, Δcentre-x +0.0, Δheight +18.4
- caption-surreal: step label Δtop -18.8, Δbottom +0.4, Δcentre-x -0.1, Δheight +19.2
- caption-salvation: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.1, Δheight +0.0
- caption-salvation: rule caption Δtop +60.9, Δbottom +80.5, Δcentre-x +0.0, Δheight +19.6
- caption-hard-token: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.1, Δheight +0.0
- caption-hard-token: rule caption Δtop +78.9, Δbottom +78.9, Δcentre-x +0.0, Δheight +0.0
- caption-easy-odd: screen title Δtop -6.7, Δbottom +22.4, Δcentre-x +0.0, Δheight +29.1
- caption-easy-salvation: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.1, Δheight +0.0
- caption-easy-salvation: rule caption Δtop +60.9, Δbottom +80.5, Δcentre-x +0.0, Δheight +19.6
- caption-easy-salvation: step button Δtop -18.4, Δbottom +0.0, Δcentre-x +0.0, Δheight +18.4
- caption-easy-salvation: step label Δtop -18.8, Δbottom +0.4, Δcentre-x -0.1, Δheight +19.2
- caption-easy-ace-third: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.1, Δheight +0.0
- caption-easy-ace-third: rule caption Δtop +60.9, Δbottom +80.5, Δcentre-x +0.0, Δheight +19.6
- caption-easy-fourth-ace: screen title Δtop -58.3, Δbottom +0.0, Δcentre-x +0.0, Δheight +58.3
- caption-easy-fourth-ace: rule caption Δtop -51.6, Δbottom -51.6, Δcentre-x +0.0, Δheight +0.0
- caption-easy-fourth-ace: step button Δtop -18.4, Δbottom +0.0, Δcentre-x +0.0, Δheight +18.4
- caption-easy-fourth-ace: step label Δtop -18.8, Δbottom +0.4, Δcentre-x +0.1, Δheight +19.2
- rm-instability-result: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.0, Δheight +0.0
- rm-round-start: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.1, Δheight +0.0
- rm-task-result: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.1, Δheight +0.0
- rm-stability-check: screen title Δtop -6.7, Δbottom +22.4, Δcentre-x +0.0, Δheight +29.1
- rm-static-roll-after-resize: screen title Δtop -6.7, Δbottom +22.4, Δcentre-x +0.0, Δheight +29.1
- rm-stability-result: screen title Δtop +14.0, Δbottom +43.1, Δcentre-x +0.0, Δheight +29.1
- rm-salvation-step: screen title Δtop +44.8, Δbottom +44.8, Δcentre-x +0.1, Δheight +0.0
- rm-salvation-step: step button Δtop -18.4, Δbottom +0.0, Δcentre-x +0.0, Δheight +18.4
- rm-salvation-step: step label Δtop -18.8, Δbottom +0.4, Δcentre-x -0.1, Δheight +19.2
- rm-salvation-hit: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.1, Δheight +0.0
- rm-result-hold: screen title Δtop +43.2, Δbottom +43.2, Δcentre-x +0.1, Δheight +0.0

## iphone-13-landscape (844x390)

| state | screen title | rule caption | result line | step button | step label |
|---|---|---|---|---|---|
| instability-roll | 84,141 406x31 | – | – | 582,295 238x67 | 638,307 126x43 |
| instability-result | **!** 84,156 406x31 (Δtop +15, Δbottom +15, Δcx +0) | – | 146,199 282x24 | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| round-start | **!** 155,163 264x31 (Δtop +22, Δbottom +22, Δcx +0) | – | – | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 616,328 170x21 (Δtop +22, Δbottom -0, Δcx -0) |
| task-result | **!** 155,156 264x31 (Δtop +15, Δbottom +15, Δcx +0) | – | 169,199 237x24 | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 624,328 155x21 (Δtop +22, Δbottom -0, Δcx +0) |
| stability-check | **!** 116,163 342x67 (Δtop +22, Δbottom +58, Δcx +0) | – | – | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 605,328 192x21 (Δtop +22, Δbottom -0, Δcx +0) |
| stability-rolling | **!** 116,163 342x67 (Δtop +22, Δbottom +58, Δcx +0) | – | – | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| stability-11-19 | **!** 116,163 342x67 (Δtop +22, Δbottom +58, Δcx +0) | – | **!** 120,242 334x24 (Δtop +43, Δbottom +43, Δcx -0) | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| stability-check-ace | **!** 116,163 342x67 (Δtop +22, Δbottom +58, Δcx +0) | – | – | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 605,328 192x21 (Δtop +22, Δbottom -0, Δcx +0) |
| stability-6-10 | **!** 116,163 342x67 (Δtop +22, Δbottom +58, Δcx +0) | – | **!** 146,242 282x24 (Δtop +43, Δbottom +43, Δcx +0) | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| stability-2-5 | **!** 116,163 342x67 (Δtop +22, Δbottom +58, Δcx +0) | – | **!** 146,242 282x24 (Δtop +43, Δbottom +43, Δcx +0) | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-n2-step | **!** 104,163 367x31 (Δtop +22, Δbottom +22, Δcx +0) | – | – | 582,295 238x67 | 602,307 197x43 |
| salvation-n2-miss | **!** 104,156 367x31 (Δtop +15, Δbottom +15, Δcx +0) | – | 110,199 354x24 | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| round-start-r2 | **!** 146,163 281x31 (Δtop +22, Δbottom +22, Δcx +0) | – | – | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 616,328 170x21 (Δtop +22, Δbottom -0, Δcx -0) |
| task-result-nat1 | **!** 146,134 281x31 (Δtop -7, Δbottom -7, Δcx +0) | – | **!** 105,177 365x54 (Δtop -22, Δbottom +8, Δcx +0) | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 632,328 138x21 (Δtop +22, Δbottom -0, Δcx +0) |
| round-start-surreal | **!** 146,163 281x31 (Δtop +22, Δbottom +22, Δcx +0) | – | – | **!** 582,299 238x63 (Δtop +4, Δbottom +0, Δcx +0) | **!** 616,311 170x21 (Δtop +4, Δbottom -18, Δcx -0) |
| task-result-nat20 | **!** 146,134 281x31 (Δtop -7, Δbottom -7, Δcx +0) | – | **!** 52,177 471x54 (Δtop -22, Δbottom +8, Δcx +0) | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 623,328 155x21 (Δtop +22, Δbottom -0, Δcx -0) |
| round-start-lucid | **!** 146,163 281x31 (Δtop +22, Δbottom +22, Δcx +0) | – | – | **!** 582,299 238x63 (Δtop +4, Δbottom +0, Δcx +0) | **!** 616,311 170x21 (Δtop +4, Δbottom -18, Δcx -0) |
| stability-nat1 | **!** 116,163 342x67 (Δtop +22, Δbottom +58, Δcx +0) | – | **!** 108,242 358x54 (Δtop +43, Δbottom +73, Δcx -0) | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| stability-check-surreal | **!** 116,163 342x67 (Δtop +22, Δbottom +58, Δcx +0) | – | – | **!** 582,299 238x63 (Δtop +4, Δbottom +0, Δcx +0) | **!** 605,311 192x21 (Δtop +4, Δbottom -18, Δcx +0) |
| stability-2d20-surreal | **!** 116,163 342x67 (Δtop +22, Δbottom +58, Δcx +0) | – | **!** 78,242 417x24 (Δtop +43, Δbottom +43, Δcx -0) | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| stability-nat20 | **!** 116,163 342x67 (Δtop +22, Δbottom +58, Δcx +0) | – | **!** 108,242 359x54 (Δtop +43, Δbottom +73, Δcx +0) | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| stability-check-lucid | **!** 116,163 342x67 (Δtop +22, Δbottom +58, Δcx +0) | – | – | **!** 582,299 238x63 (Δtop +4, Δbottom +0, Δcx +0) | **!** 605,311 192x21 (Δtop +4, Δbottom -18, Δcx +0) |
| stability-2d20-lucid | **!** 116,163 342x67 (Δtop +22, Δbottom +58, Δcx +0) | – | **!** 48,242 478x24 (Δtop +43, Δbottom +43, Δcx +0) | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| result-hold | **!** 116,163 342x67 (Δtop +22, Δbottom +58, Δcx +0) | – | **!** 146,242 282x24 (Δtop +43, Δbottom +43, Δcx +0) | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-n1-step | **!** 104,163 367x31 (Δtop +22, Δbottom +22, Δcx +0) | – | – | 582,295 238x67 | 602,307 197x43 |
| salvation-n1-nat20 | **!** 104,134 367x31 (Δtop -7, Δbottom -7, Δcx +0) | – | **!** 84,177 406x54 (Δtop -22, Δbottom +8, Δcx -0) | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-n1-hit | **!** 104,156 367x31 (Δtop +15, Δbottom +15, Δcx +0) | – | 157,199 260x24 | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-n1-miss | **!** 104,156 367x31 (Δtop +15, Δbottom +15, Δcx +0) | – | 104,199 367x24 | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-n1-nat1 | **!** 104,134 367x31 (Δtop -7, Δbottom -7, Δcx +0) | – | **!** 101,177 372x54 (Δtop -22, Δbottom +8, Δcx -0) | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-n2-nat20 | **!** 104,134 367x31 (Δtop -7, Δbottom -7, Δcx +0) | – | **!** 84,177 406x54 (Δtop -22, Δbottom +8, Δcx -0) | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-n2-hit | **!** 104,156 367x31 (Δtop +15, Δbottom +15, Δcx +0) | – | 157,199 260x24 | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-n2-nat1 | **!** 104,134 367x31 (Δtop -7, Δbottom -7, Δcx +0) | – | **!** 101,177 372x54 (Δtop -22, Δbottom +8, Δcx -0) | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-n3-step | **!** 104,163 367x31 (Δtop +22, Δbottom +22, Δcx +0) | – | – | 582,295 238x67 | 602,307 197x43 |
| salvation-n3-nat20 | **!** 104,134 367x31 (Δtop -7, Δbottom -7, Δcx +0) | – | **!** 84,177 406x54 (Δtop -22, Δbottom +8, Δcx -0) | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-n3-hit | **!** 104,156 367x31 (Δtop +15, Δbottom +15, Δcx +0) | – | 157,199 260x24 | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-n3-miss | **!** 104,156 367x31 (Δtop +15, Δbottom +15, Δcx +0) | – | 104,199 367x24 | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-n3-nat1 | **!** 104,134 367x31 (Δtop -7, Δbottom -7, Δcx +0) | – | **!** 101,177 372x54 (Δtop -22, Δbottom +8, Δcx -0) | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-n4-step | 104,141 367x31 | – | – | **!** 582,273 238x89 (Δtop -22, Δbottom +0, Δcx +0) | **!** 596,285 209x64 (Δtop -22, Δbottom -0, Δcx -0) |
| salvation-n4-nat20 | **!** 104,134 367x31 (Δtop -7, Δbottom -7, Δcx +0) | – | **!** 51,177 471x54 (Δtop -22, Δbottom +8, Δcx +0) | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-n4-hold | **!** 104,156 367x31 (Δtop +15, Δbottom +15, Δcx +0) | – | 74,199 427x24 | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-n4-loss | **!** 104,156 367x31 (Δtop +15, Δbottom +15, Δcx +0) | – | 100,199 374x24 | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-n4-nat1 | **!** 104,134 367x31 (Δtop -7, Δbottom -7, Δcx +0) | – | **!** 48,177 477x54 (Δtop -22, Δbottom +8, Δcx -0) | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-step-lucid | **!** 104,163 367x31 (Δtop +22, Δbottom +22, Δcx +0) | – | – | **!** 582,277 238x85 (Δtop -18, Δbottom +0, Δcx +0) | **!** 602,289 197x43 (Δtop -18, Δbottom -18, Δcx -0) |
| salvation-last-token | **!** 104,156 367x31 (Δtop +15, Δbottom +15, Δcx +0) | – | 157,199 260x24 | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 661,328 80x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-n4-fatal | **!** 104,156 367x31 (Δtop +15, Δbottom +15, Δcx +0) | – | 26,199 522x24 | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 628,328 146x21 (Δtop +22, Δbottom -0, Δcx -0) |
| stability-fatal | **!** 116,163 342x67 (Δtop +22, Δbottom +58, Δcx +0) | – | **!** 26,242 522x24 (Δtop +43, Δbottom +43, Δcx -0) | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 628,328 146x21 (Δtop +22, Δbottom -0, Δcx -0) |
| notice-return-king | **!** 116,163 342x67 (Δtop +22, Δbottom +58, Δcx +0) | – | – | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 605,328 192x21 (Δtop +22, Δbottom -0, Δcx +0) |
| notice-return-king-result | **!** 116,163 342x67 (Δtop +22, Δbottom +58, Δcx +0) | – | **!** 120,242 334x24 (Δtop +43, Δbottom +43, Δcx -0) | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| notice-skip-damage | **!** 104,134 367x31 (Δtop -7, Δbottom -7, Δcx +0) | – | – | **!** 582,273 238x89 (Δtop -22, Δbottom +0, Δcx +0) | **!** 596,285 209x64 (Δtop -22, Δbottom -0, Δcx -0) |
| keyboard-skip-link | **!** 146,163 281x31 (Δtop +22, Δbottom +22, Δcx +0) | – | – | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 616,328 170x21 (Δtop +22, Δbottom -0, Δcx -0) |
| keyboard-step-focus | **!** 146,163 281x31 (Δtop +22, Δbottom +22, Δcx +0) | – | – | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 616,328 170x21 (Δtop +22, Δbottom -0, Δcx -0) |
| autoplay-on | **!** 155,163 264x31 (Δtop +22, Δbottom +22, Δcx +0) | – | – | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 616,328 170x21 (Δtop +22, Δbottom -0, Δcx -0) |
| easy-round-start | **!** 155,163 264x31 (Δtop +22, Δbottom +22, Δcx +0) | – | – | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 616,328 170x21 (Δtop +22, Δbottom -0, Δcx -0) |
| salvation-e1-step | **!** 104,163 367x31 (Δtop +22, Δbottom +22, Δcx +0) | – | – | 582,295 238x67 | 602,307 197x43 |
| salvation-e1-nat20 | **!** 104,134 367x31 (Δtop -7, Δbottom -7, Δcx +0) | – | **!** 84,177 406x54 (Δtop -22, Δbottom +8, Δcx -0) | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-e1-hit | **!** 104,156 367x31 (Δtop +15, Δbottom +15, Δcx +0) | – | 157,199 260x24 | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-e1-miss | **!** 104,156 367x31 (Δtop +15, Δbottom +15, Δcx +0) | – | 104,199 367x24 | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-e1-nat1 | **!** 104,134 367x31 (Δtop -7, Δbottom -7, Δcx +0) | – | **!** 101,177 372x54 (Δtop -22, Δbottom +8, Δcx -0) | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-e2-step | **!** 104,163 367x31 (Δtop +22, Δbottom +22, Δcx +0) | – | – | 582,295 238x67 | 602,307 197x43 |
| salvation-e2-nat20 | **!** 104,134 367x31 (Δtop -7, Δbottom -7, Δcx +0) | – | **!** 84,177 406x54 (Δtop -22, Δbottom +8, Δcx -0) | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-e2-hit | **!** 104,156 367x31 (Δtop +15, Δbottom +15, Δcx +0) | – | 157,199 260x24 | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-e2-miss | **!** 104,156 367x31 (Δtop +15, Δbottom +15, Δcx +0) | – | 104,199 367x24 | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-e2-nat1 | **!** 104,134 367x31 (Δtop -7, Δbottom -7, Δcx +0) | – | **!** 101,177 372x54 (Δtop -22, Δbottom +8, Δcx -0) | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-e3-step | **!** 104,163 367x31 (Δtop +22, Δbottom +22, Δcx +0) | – | – | 582,295 238x67 | 602,307 197x43 |
| salvation-e3-nat20 | **!** 104,134 367x31 (Δtop -7, Δbottom -7, Δcx +0) | – | **!** 84,177 406x54 (Δtop -22, Δbottom +8, Δcx -0) | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-e3-hit | **!** 104,156 367x31 (Δtop +15, Δbottom +15, Δcx +0) | – | 157,199 260x24 | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-e3-miss | **!** 104,156 367x31 (Δtop +15, Δbottom +15, Δcx +0) | – | 104,199 367x24 | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-e3-nat1 | **!** 104,134 367x31 (Δtop -7, Δbottom -7, Δcx +0) | – | **!** 101,177 372x54 (Δtop -22, Δbottom +8, Δcx -0) | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| easy-final-check | **!** 116,163 342x103 (Δtop +22, Δbottom +94, Δcx +0) | – | – | **!** 582,273 238x89 (Δtop -22, Δbottom +0, Δcx +0) | **!** 596,285 209x64 (Δtop -22, Δbottom -0, Δcx -0) |
| easy-final-escape | **!** 116,163 342x103 (Δtop +22, Δbottom +94, Δcx +0) | – | **!** 55,278 463x24 (Δtop +79, Δbottom +79, Δcx -0) | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 661,328 80x21 (Δtop +22, Δbottom -0, Δcx +0) |
| easy-final-fatal | **!** 116,163 342x103 (Δtop +22, Δbottom +94, Δcx +0) | – | **!** 26,278 522x24 (Δtop +79, Δbottom +79, Δcx -0) | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 628,328 146x21 (Δtop +22, Δbottom -0, Δcx -0) |
| salvation-h1-step | **!** 104,163 367x31 (Δtop +22, Δbottom +22, Δcx +0) | – | – | 582,295 238x67 | 602,307 197x43 |
| salvation-hard-miss | **!** 104,156 367x31 (Δtop +15, Δbottom +15, Δcx +0) | – | 96,199 381x24 | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-hard-nat1 | **!** 104,134 367x31 (Δtop -7, Δbottom -7, Δcx +0) | – | **!** 87,177 399x54 (Δtop -22, Δbottom +8, Δcx -0) | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| salvation-hard-over | **!** 104,156 367x31 (Δtop +15, Δbottom +15, Δcx +0) | – | 90,199 394x24 | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| caption-odd | **!** 116,232 342x67 (Δtop +91, Δbottom +127, Δcx +0) | 77,132 420x57 | – | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 605,328 192x21 (Δtop +22, Δbottom -0, Δcx +0) |
| caption-king | **!** 104,203 367x31 (Δtop +62, Δbottom +62, Δcx +0) | 77,132 420x57 | – | 582,295 238x67 | 602,307 197x43 |
| caption-ace | **!** 146,184 281x31 (Δtop +43, Δbottom +43, Δcx +0) | **!** 79,132 416x38 (Δtop +0, Δbottom -19, Δcx +0) | – | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 616,328 170x21 (Δtop +22, Δbottom -0, Δcx -0) |
| caption-lucid | **!** 116,232 342x67 (Δtop +91, Δbottom +127, Δcx +0) | 77,132 420x57 | – | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 605,328 192x21 (Δtop +22, Δbottom -0, Δcx +0) |
| caption-surreal | **!** 104,203 367x31 (Δtop +62, Δbottom +62, Δcx +0) | 77,132 420x57 | – | 582,295 238x67 | 602,307 197x43 |
| caption-salvation | **!** 146,203 281x31 (Δtop +62, Δbottom +62, Δcx +0) | 77,132 420x57 | – | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 616,328 170x21 (Δtop +22, Δbottom -0, Δcx -0) |
| caption-hard-token | **!** 104,184 367x31 (Δtop +43, Δbottom +43, Δcx +0) | **!** 97,132 380x38 (Δtop +0, Δbottom -19, Δcx -0) | **!** 96,227 381x24 (Δtop +28, Δbottom +28, Δcx -0) | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 648,328 107x21 (Δtop +22, Δbottom -0, Δcx +0) |
| caption-easy-odd | **!** 116,232 342x67 (Δtop +91, Δbottom +127, Δcx +0) | 77,132 420x57 | – | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 605,328 192x21 (Δtop +22, Δbottom -0, Δcx +0) |
| caption-easy-salvation | **!** 104,203 367x31 (Δtop +62, Δbottom +62, Δcx +0) | 77,132 420x57 | – | 582,295 238x67 | 602,307 197x43 |
| caption-easy-ace-third | **!** 146,223 281x31 (Δtop +82, Δbottom +82, Δcx +0) | **!** 77,132 420x77 (Δtop +0, Δbottom +20, Δcx +0) | – | **!** 582,316 238x46 (Δtop +22, Δbottom +0, Δcx +0) | **!** 616,328 170x21 (Δtop +22, Δbottom -0, Δcx -0) |
| caption-easy-fourth-ace | **!** 116,232 342x103 (Δtop +91, Δbottom +163, Δcx +0) | 77,132 420x57 | – | **!** 582,273 238x89 (Δtop -22, Δbottom +0, Δcx +0) | **!** 596,285 209x64 (Δtop -22, Δbottom -0, Δcx -0) |
| **max delta** | Δtop 98 · Δbottom 170 · Δcx 0 · Δw 142 · Δh 72 | Δtop 0 · Δbottom 39 · Δcx 0 · Δw 40 · Δh 39 | Δtop 101 · Δbottom 79 · Δcx 0 · Δw 286 · Δh 30 | Δtop 43 · Δbottom 0 · Δcx 0 · Δw 0 · Δh 43 | Δtop 43 · Δbottom 18 · Δcx 0 · Δw 129 · Δh 43 |

Reference states: screen title = instability-roll, rule caption = caption-odd, result line = instability-result, step button = instability-roll, step label = instability-roll

Flagged shifts over 2px at iphone-13-landscape: 267

- instability-result: screen title Δtop +14.7, Δbottom +14.7, Δcentre-x +0.0, Δheight +0.0
- instability-result: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- instability-result: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- round-start: screen title Δtop +22.3, Δbottom +22.3, Δcentre-x +0.1, Δheight +0.0
- round-start: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- round-start: step label Δtop +21.6, Δbottom -0.0, Δcentre-x -0.0, Δheight -21.6
- task-result: screen title Δtop +14.7, Δbottom +14.7, Δcentre-x +0.1, Δheight +0.0
- task-result: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- task-result: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- stability-check: screen title Δtop +22.0, Δbottom +57.9, Δcentre-x +0.1, Δheight +35.9
- stability-check: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- stability-check: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- stability-rolling: screen title Δtop +22.0, Δbottom +57.9, Δcentre-x +0.1, Δheight +35.9
- stability-rolling: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- stability-rolling: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- stability-11-19: screen title Δtop +22.0, Δbottom +57.9, Δcentre-x +0.1, Δheight +35.9
- stability-11-19: result line Δtop +43.2, Δbottom +43.2, Δcentre-x -0.1, Δheight +0.0
- stability-11-19: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- stability-11-19: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- stability-check-ace: screen title Δtop +22.0, Δbottom +57.9, Δcentre-x +0.1, Δheight +35.9
- stability-check-ace: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- stability-check-ace: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- stability-6-10: screen title Δtop +22.0, Δbottom +57.9, Δcentre-x +0.1, Δheight +35.9
- stability-6-10: result line Δtop +43.2, Δbottom +43.2, Δcentre-x +0.0, Δheight +0.0
- stability-6-10: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- stability-6-10: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- stability-2-5: screen title Δtop +22.0, Δbottom +57.9, Δcentre-x +0.1, Δheight +35.9
- stability-2-5: result line Δtop +43.2, Δbottom +43.2, Δcentre-x +0.0, Δheight +0.0
- stability-2-5: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- stability-2-5: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n2-step: screen title Δtop +22.3, Δbottom +22.3, Δcentre-x +0.0, Δheight +0.0
- salvation-n2-miss: screen title Δtop +14.7, Δbottom +14.7, Δcentre-x +0.0, Δheight +0.0
- salvation-n2-miss: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n2-miss: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- round-start-r2: screen title Δtop +22.3, Δbottom +22.3, Δcentre-x +0.1, Δheight +0.0
- round-start-r2: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- round-start-r2: step label Δtop +21.6, Δbottom -0.0, Δcentre-x -0.0, Δheight -21.6
- task-result-nat1: screen title Δtop -7.0, Δbottom -7.0, Δcentre-x +0.1, Δheight +0.0
- task-result-nat1: result line Δtop -21.7, Δbottom +8.3, Δcentre-x +0.0, Δheight +30.0
- task-result-nat1: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- task-result-nat1: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- round-start-surreal: screen title Δtop +22.3, Δbottom +22.3, Δcentre-x +0.1, Δheight +0.0
- round-start-surreal: step button Δtop +4.0, Δbottom +0.0, Δcentre-x +0.0, Δheight -4.0
- round-start-surreal: step label Δtop +4.0, Δbottom -17.6, Δcentre-x -0.0, Δheight -21.6
- task-result-nat20: screen title Δtop -7.0, Δbottom -7.0, Δcentre-x +0.1, Δheight +0.0
- task-result-nat20: result line Δtop -21.7, Δbottom +8.3, Δcentre-x +0.0, Δheight +30.0
- task-result-nat20: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- task-result-nat20: step label Δtop +21.6, Δbottom -0.0, Δcentre-x -0.1, Δheight -21.6
- round-start-lucid: screen title Δtop +22.3, Δbottom +22.3, Δcentre-x +0.1, Δheight +0.0
- round-start-lucid: step button Δtop +4.0, Δbottom +0.0, Δcentre-x +0.0, Δheight -4.0
- round-start-lucid: step label Δtop +4.0, Δbottom -17.6, Δcentre-x -0.0, Δheight -21.6
- stability-nat1: screen title Δtop +22.0, Δbottom +57.9, Δcentre-x +0.1, Δheight +35.9
- stability-nat1: result line Δtop +43.2, Δbottom +73.2, Δcentre-x -0.1, Δheight +30.0
- stability-nat1: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- stability-nat1: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- stability-check-surreal: screen title Δtop +22.0, Δbottom +57.9, Δcentre-x +0.1, Δheight +35.9
- stability-check-surreal: step button Δtop +4.0, Δbottom +0.0, Δcentre-x +0.0, Δheight -4.0
- stability-check-surreal: step label Δtop +4.0, Δbottom -17.6, Δcentre-x +0.0, Δheight -21.6
- stability-2d20-surreal: screen title Δtop +22.0, Δbottom +57.9, Δcentre-x +0.1, Δheight +35.9
- stability-2d20-surreal: result line Δtop +43.2, Δbottom +43.2, Δcentre-x -0.0, Δheight +0.0
- stability-2d20-surreal: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- stability-2d20-surreal: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- stability-nat20: screen title Δtop +22.0, Δbottom +57.9, Δcentre-x +0.1, Δheight +35.9
- stability-nat20: result line Δtop +43.2, Δbottom +73.2, Δcentre-x +0.0, Δheight +30.0
- stability-nat20: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- stability-nat20: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- stability-check-lucid: screen title Δtop +22.0, Δbottom +57.9, Δcentre-x +0.1, Δheight +35.9
- stability-check-lucid: step button Δtop +4.0, Δbottom +0.0, Δcentre-x +0.0, Δheight -4.0
- stability-check-lucid: step label Δtop +4.0, Δbottom -17.6, Δcentre-x +0.0, Δheight -21.6
- stability-2d20-lucid: screen title Δtop +22.0, Δbottom +57.9, Δcentre-x +0.1, Δheight +35.9
- stability-2d20-lucid: result line Δtop +43.2, Δbottom +43.2, Δcentre-x +0.0, Δheight +0.0
- stability-2d20-lucid: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- stability-2d20-lucid: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- result-hold: screen title Δtop +22.0, Δbottom +57.9, Δcentre-x +0.1, Δheight +35.9
- result-hold: result line Δtop +43.2, Δbottom +43.2, Δcentre-x +0.0, Δheight +0.0
- result-hold: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- result-hold: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n1-step: screen title Δtop +22.3, Δbottom +22.3, Δcentre-x +0.0, Δheight +0.0
- salvation-n1-nat20: screen title Δtop -7.0, Δbottom -7.0, Δcentre-x +0.0, Δheight +0.0
- salvation-n1-nat20: result line Δtop -21.7, Δbottom +8.3, Δcentre-x -0.1, Δheight +30.0
- salvation-n1-nat20: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n1-nat20: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n1-hit: screen title Δtop +14.7, Δbottom +14.7, Δcentre-x +0.0, Δheight +0.0
- salvation-n1-hit: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n1-hit: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n1-miss: screen title Δtop +14.7, Δbottom +14.7, Δcentre-x +0.0, Δheight +0.0
- salvation-n1-miss: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n1-miss: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n1-nat1: screen title Δtop -7.0, Δbottom -7.0, Δcentre-x +0.0, Δheight +0.0
- salvation-n1-nat1: result line Δtop -21.7, Δbottom +8.3, Δcentre-x -0.1, Δheight +30.0
- salvation-n1-nat1: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n1-nat1: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n2-nat20: screen title Δtop -7.0, Δbottom -7.0, Δcentre-x +0.0, Δheight +0.0
- salvation-n2-nat20: result line Δtop -21.7, Δbottom +8.3, Δcentre-x -0.1, Δheight +30.0
- salvation-n2-nat20: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n2-nat20: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n2-hit: screen title Δtop +14.7, Δbottom +14.7, Δcentre-x +0.0, Δheight +0.0
- salvation-n2-hit: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n2-hit: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n2-nat1: screen title Δtop -7.0, Δbottom -7.0, Δcentre-x +0.0, Δheight +0.0
- salvation-n2-nat1: result line Δtop -21.7, Δbottom +8.3, Δcentre-x -0.1, Δheight +30.0
- salvation-n2-nat1: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n2-nat1: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n3-step: screen title Δtop +22.3, Δbottom +22.3, Δcentre-x +0.0, Δheight +0.0
- salvation-n3-nat20: screen title Δtop -7.0, Δbottom -7.0, Δcentre-x +0.0, Δheight +0.0
- salvation-n3-nat20: result line Δtop -21.7, Δbottom +8.3, Δcentre-x -0.1, Δheight +30.0
- salvation-n3-nat20: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n3-nat20: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n3-hit: screen title Δtop +14.7, Δbottom +14.7, Δcentre-x +0.0, Δheight +0.0
- salvation-n3-hit: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n3-hit: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n3-miss: screen title Δtop +14.7, Δbottom +14.7, Δcentre-x +0.0, Δheight +0.0
- salvation-n3-miss: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n3-miss: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n3-nat1: screen title Δtop -7.0, Δbottom -7.0, Δcentre-x +0.0, Δheight +0.0
- salvation-n3-nat1: result line Δtop -21.7, Δbottom +8.3, Δcentre-x -0.1, Δheight +30.0
- salvation-n3-nat1: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n3-nat1: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n4-step: step button Δtop -21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight +21.6
- salvation-n4-step: step label Δtop -21.6, Δbottom -0.0, Δcentre-x -0.1, Δheight +21.6
- salvation-n4-nat20: screen title Δtop -7.0, Δbottom -7.0, Δcentre-x +0.0, Δheight +0.0
- salvation-n4-nat20: result line Δtop -21.7, Δbottom +8.3, Δcentre-x +0.0, Δheight +30.0
- salvation-n4-nat20: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n4-nat20: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n4-hold: screen title Δtop +14.7, Δbottom +14.7, Δcentre-x +0.0, Δheight +0.0
- salvation-n4-hold: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n4-hold: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n4-loss: screen title Δtop +14.7, Δbottom +14.7, Δcentre-x +0.0, Δheight +0.0
- salvation-n4-loss: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n4-loss: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n4-nat1: screen title Δtop -7.0, Δbottom -7.0, Δcentre-x +0.0, Δheight +0.0
- salvation-n4-nat1: result line Δtop -21.7, Δbottom +8.3, Δcentre-x -0.1, Δheight +30.0
- salvation-n4-nat1: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n4-nat1: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-step-lucid: screen title Δtop +22.3, Δbottom +22.3, Δcentre-x +0.0, Δheight +0.0
- salvation-step-lucid: step button Δtop -17.6, Δbottom +0.0, Δcentre-x +0.0, Δheight +17.6
- salvation-step-lucid: step label Δtop -17.6, Δbottom -17.6, Δcentre-x -0.1, Δheight +0.0
- salvation-last-token: screen title Δtop +14.7, Δbottom +14.7, Δcentre-x +0.0, Δheight +0.0
- salvation-last-token: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-last-token: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n4-fatal: screen title Δtop +14.7, Δbottom +14.7, Δcentre-x +0.0, Δheight +0.0
- salvation-n4-fatal: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-n4-fatal: step label Δtop +21.6, Δbottom -0.0, Δcentre-x -0.1, Δheight -21.6
- stability-fatal: screen title Δtop +22.0, Δbottom +57.9, Δcentre-x +0.1, Δheight +35.9
- stability-fatal: result line Δtop +43.2, Δbottom +43.2, Δcentre-x -0.1, Δheight +0.0
- stability-fatal: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- stability-fatal: step label Δtop +21.6, Δbottom -0.0, Δcentre-x -0.1, Δheight -21.6
- notice-return-king: screen title Δtop +22.0, Δbottom +57.9, Δcentre-x +0.1, Δheight +35.9
- notice-return-king: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- notice-return-king: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- notice-return-king-result: screen title Δtop +22.0, Δbottom +57.9, Δcentre-x +0.1, Δheight +35.9
- notice-return-king-result: result line Δtop +43.2, Δbottom +43.2, Δcentre-x -0.1, Δheight +0.0
- notice-return-king-result: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- notice-return-king-result: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- notice-skip-damage: screen title Δtop -7.0, Δbottom -7.0, Δcentre-x +0.0, Δheight +0.0
- notice-skip-damage: step button Δtop -21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight +21.6
- notice-skip-damage: step label Δtop -21.6, Δbottom -0.0, Δcentre-x -0.1, Δheight +21.6
- keyboard-skip-link: screen title Δtop +22.3, Δbottom +22.3, Δcentre-x +0.1, Δheight +0.0
- keyboard-skip-link: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- keyboard-skip-link: step label Δtop +21.6, Δbottom -0.0, Δcentre-x -0.0, Δheight -21.6
- keyboard-step-focus: screen title Δtop +22.3, Δbottom +22.3, Δcentre-x +0.1, Δheight +0.0
- keyboard-step-focus: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- keyboard-step-focus: step label Δtop +21.6, Δbottom -0.0, Δcentre-x -0.0, Δheight -21.6
- autoplay-on: screen title Δtop +22.3, Δbottom +22.3, Δcentre-x +0.1, Δheight +0.0
- autoplay-on: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- autoplay-on: step label Δtop +21.6, Δbottom -0.0, Δcentre-x -0.0, Δheight -21.6
- easy-round-start: screen title Δtop +22.3, Δbottom +22.3, Δcentre-x +0.1, Δheight +0.0
- easy-round-start: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- easy-round-start: step label Δtop +21.6, Δbottom -0.0, Δcentre-x -0.0, Δheight -21.6
- salvation-e1-step: screen title Δtop +22.3, Δbottom +22.3, Δcentre-x +0.0, Δheight +0.0
- salvation-e1-nat20: screen title Δtop -7.0, Δbottom -7.0, Δcentre-x +0.0, Δheight +0.0
- salvation-e1-nat20: result line Δtop -21.7, Δbottom +8.3, Δcentre-x -0.1, Δheight +30.0
- salvation-e1-nat20: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-e1-nat20: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-e1-hit: screen title Δtop +14.7, Δbottom +14.7, Δcentre-x +0.0, Δheight +0.0
- salvation-e1-hit: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-e1-hit: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-e1-miss: screen title Δtop +14.7, Δbottom +14.7, Δcentre-x +0.0, Δheight +0.0
- salvation-e1-miss: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-e1-miss: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-e1-nat1: screen title Δtop -7.0, Δbottom -7.0, Δcentre-x +0.0, Δheight +0.0
- salvation-e1-nat1: result line Δtop -21.7, Δbottom +8.3, Δcentre-x -0.1, Δheight +30.0
- salvation-e1-nat1: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-e1-nat1: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-e2-step: screen title Δtop +22.3, Δbottom +22.3, Δcentre-x +0.0, Δheight +0.0
- salvation-e2-nat20: screen title Δtop -7.0, Δbottom -7.0, Δcentre-x +0.0, Δheight +0.0
- salvation-e2-nat20: result line Δtop -21.7, Δbottom +8.3, Δcentre-x -0.1, Δheight +30.0
- salvation-e2-nat20: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-e2-nat20: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-e2-hit: screen title Δtop +14.7, Δbottom +14.7, Δcentre-x +0.0, Δheight +0.0
- salvation-e2-hit: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-e2-hit: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-e2-miss: screen title Δtop +14.7, Δbottom +14.7, Δcentre-x +0.0, Δheight +0.0
- salvation-e2-miss: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-e2-miss: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-e2-nat1: screen title Δtop -7.0, Δbottom -7.0, Δcentre-x +0.0, Δheight +0.0
- salvation-e2-nat1: result line Δtop -21.7, Δbottom +8.3, Δcentre-x -0.1, Δheight +30.0
- salvation-e2-nat1: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-e2-nat1: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-e3-step: screen title Δtop +22.3, Δbottom +22.3, Δcentre-x +0.0, Δheight +0.0
- salvation-e3-nat20: screen title Δtop -7.0, Δbottom -7.0, Δcentre-x +0.0, Δheight +0.0
- salvation-e3-nat20: result line Δtop -21.7, Δbottom +8.3, Δcentre-x -0.1, Δheight +30.0
- salvation-e3-nat20: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-e3-nat20: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-e3-hit: screen title Δtop +14.7, Δbottom +14.7, Δcentre-x +0.0, Δheight +0.0
- salvation-e3-hit: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-e3-hit: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-e3-miss: screen title Δtop +14.7, Δbottom +14.7, Δcentre-x +0.0, Δheight +0.0
- salvation-e3-miss: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-e3-miss: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-e3-nat1: screen title Δtop -7.0, Δbottom -7.0, Δcentre-x +0.0, Δheight +0.0
- salvation-e3-nat1: result line Δtop -21.7, Δbottom +8.3, Δcentre-x -0.1, Δheight +30.0
- salvation-e3-nat1: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-e3-nat1: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- easy-final-check: screen title Δtop +22.0, Δbottom +93.8, Δcentre-x +0.1, Δheight +71.8
- easy-final-check: step button Δtop -21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight +21.6
- easy-final-check: step label Δtop -21.6, Δbottom -0.0, Δcentre-x -0.1, Δheight +21.6
- easy-final-escape: screen title Δtop +22.0, Δbottom +93.8, Δcentre-x +0.1, Δheight +71.8
- easy-final-escape: result line Δtop +79.0, Δbottom +79.0, Δcentre-x -0.1, Δheight +0.0
- easy-final-escape: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- easy-final-escape: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- easy-final-fatal: screen title Δtop +22.0, Δbottom +93.8, Δcentre-x +0.1, Δheight +71.8
- easy-final-fatal: result line Δtop +79.0, Δbottom +79.0, Δcentre-x -0.1, Δheight +0.0
- easy-final-fatal: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- easy-final-fatal: step label Δtop +21.6, Δbottom -0.0, Δcentre-x -0.1, Δheight -21.6
- salvation-h1-step: screen title Δtop +22.3, Δbottom +22.3, Δcentre-x +0.0, Δheight +0.0
- salvation-hard-miss: screen title Δtop +14.7, Δbottom +14.7, Δcentre-x +0.0, Δheight +0.0
- salvation-hard-miss: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-hard-miss: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-hard-nat1: screen title Δtop -7.0, Δbottom -7.0, Δcentre-x +0.0, Δheight +0.0
- salvation-hard-nat1: result line Δtop -21.7, Δbottom +8.3, Δcentre-x -0.0, Δheight +30.0
- salvation-hard-nat1: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-hard-nat1: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-hard-over: screen title Δtop +14.7, Δbottom +14.7, Δcentre-x +0.0, Δheight +0.0
- salvation-hard-over: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- salvation-hard-over: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- caption-odd: screen title Δtop +91.2, Δbottom +127.1, Δcentre-x +0.1, Δheight +35.9
- caption-odd: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- caption-odd: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- caption-king: screen title Δtop +62.2, Δbottom +62.2, Δcentre-x +0.0, Δheight +0.0
- caption-ace: screen title Δtop +42.8, Δbottom +42.8, Δcentre-x +0.1, Δheight +0.0
- caption-ace: rule caption Δtop +0.0, Δbottom -19.4, Δcentre-x +0.0, Δheight -19.4
- caption-ace: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- caption-ace: step label Δtop +21.6, Δbottom -0.0, Δcentre-x -0.0, Δheight -21.6
- caption-lucid: screen title Δtop +91.2, Δbottom +127.1, Δcentre-x +0.1, Δheight +35.9
- caption-lucid: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- caption-lucid: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- caption-surreal: screen title Δtop +62.2, Δbottom +62.2, Δcentre-x +0.0, Δheight +0.0
- caption-salvation: screen title Δtop +62.2, Δbottom +62.2, Δcentre-x +0.1, Δheight +0.0
- caption-salvation: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- caption-salvation: step label Δtop +21.6, Δbottom -0.0, Δcentre-x -0.0, Δheight -21.6
- caption-hard-token: screen title Δtop +42.8, Δbottom +42.8, Δcentre-x +0.0, Δheight +0.0
- caption-hard-token: rule caption Δtop +0.0, Δbottom -19.4, Δcentre-x -0.1, Δheight -19.4
- caption-hard-token: result line Δtop +28.1, Δbottom +28.1, Δcentre-x -0.1, Δheight +0.0
- caption-hard-token: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- caption-hard-token: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- caption-easy-odd: screen title Δtop +91.2, Δbottom +127.1, Δcentre-x +0.1, Δheight +35.9
- caption-easy-odd: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- caption-easy-odd: step label Δtop +21.6, Δbottom -0.0, Δcentre-x +0.0, Δheight -21.6
- caption-easy-salvation: screen title Δtop +62.2, Δbottom +62.2, Δcentre-x +0.0, Δheight +0.0
- caption-easy-ace-third: screen title Δtop +81.8, Δbottom +81.8, Δcentre-x +0.1, Δheight +0.0
- caption-easy-ace-third: rule caption Δtop +0.0, Δbottom +19.6, Δcentre-x +0.0, Δheight +19.6
- caption-easy-ace-third: step button Δtop +21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight -21.6
- caption-easy-ace-third: step label Δtop +21.6, Δbottom -0.0, Δcentre-x -0.0, Δheight -21.6
- caption-easy-fourth-ace: screen title Δtop +91.2, Δbottom +163.0, Δcentre-x +0.1, Δheight +71.8
- caption-easy-fourth-ace: step button Δtop -21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight +21.6
- caption-easy-fourth-ace: step label Δtop -21.6, Δbottom -0.0, Δcentre-x -0.1, Δheight +21.6

## ipad-portrait (768x1024)

| state | screen title | rule caption | result line | step button | step label |
|---|---|---|---|---|---|
| instability-roll | 59,376 650x50 | – | – | 144,949 480x43 | 282,960 205x20 |
| instability-result | **!** 59,393 650x50 (Δtop +17, Δbottom +17, Δcx +0) | – | 254,462 260x22 | 144,949 480x43 | 336,960 95x20 |
| round-start | **!** 173,398 422x50 (Δtop +22, Δbottom +22, Δcx -0) | – | – | 144,949 480x43 | 308,960 152x20 |
| task-result | **!** 173,393 422x50 (Δtop +17, Δbottom +17, Δcx -0) | – | 275,462 218x22 | 144,949 480x43 | 315,960 138x20 |
| stability-check | **!** 110,341 547x107 (Δtop -35, Δbottom +22, Δcx +0) | – | – | 144,949 480x43 | 299,960 170x20 |
| stability-rolling | **!** 110,341 547x107 (Δtop -35, Δbottom +22, Δcx +0) | – | – | 144,949 480x43 | 336,960 95x20 |
| stability-11-19 | **!** 110,336 547x107 (Δtop -40, Δbottom +17, Δcx +0) | – | 230,462 308x22 | 144,949 480x43 | 336,960 95x20 |
| stability-check-ace | **!** 110,341 547x107 (Δtop -35, Δbottom +22, Δcx +0) | – | – | 144,949 480x43 | 299,960 170x20 |
| stability-6-10 | **!** 110,336 547x107 (Δtop -40, Δbottom +17, Δcx +0) | – | 254,462 260x22 | 144,949 480x43 | 336,960 95x20 |
| stability-2-5 | **!** 110,336 547x107 (Δtop -40, Δbottom +17, Δcx +0) | – | 254,462 260x22 | 144,949 480x43 | 336,960 95x20 |
| salvation-n2-step | **!** 90,398 587x50 (Δtop +22, Δbottom +22, Δcx +0) | – | – | 144,949 480x43 | 212,960 345x20 |
| salvation-n2-miss | **!** 90,393 587x50 (Δtop +17, Δbottom +17, Δcx +0) | – | 221,462 326x22 | 144,949 480x43 | 336,960 95x20 |
| round-start-r2 | **!** 159,398 450x50 (Δtop +22, Δbottom +22, Δcx +0) | – | – | 144,949 480x43 | 308,960 152x20 |
| task-result-nat1 | **!** 159,366 450x50 (Δtop -10, Δbottom -10, Δcx +0) | – | **!** 216,434 336x50 (Δtop -28, Δbottom +0, Δcx +0) | 144,949 480x43 | 323,960 123x20 |
| round-start-surreal | **!** 159,398 450x50 (Δtop +22, Δbottom +22, Δcx +0) | – | – | **!** 144,931 480x61 (Δtop -18, Δbottom +0, Δcx +0) | **!** 308,942 152x20 (Δtop -18, Δbottom -18, Δcx +0) |
| task-result-nat20 | **!** 159,366 450x50 (Δtop -10, Δbottom -10, Δcx +0) | – | **!** 167,434 434x50 (Δtop -28, Δbottom +0, Δcx +0) | 144,949 480x43 | 315,960 138x20 |
| round-start-lucid | **!** 159,398 450x50 (Δtop +22, Δbottom +22, Δcx +0) | – | – | **!** 144,931 480x61 (Δtop -18, Δbottom +0, Δcx +0) | **!** 308,942 152x20 (Δtop -18, Δbottom -18, Δcx -0) |
| stability-nat1 | **!** 110,308 547x107 (Δtop -68, Δbottom -10, Δcx +0) | – | **!** 219,434 329x50 (Δtop -28, Δbottom +0, Δcx +0) | 144,949 480x43 | 336,960 95x20 |
| stability-check-surreal | **!** 110,341 547x107 (Δtop -35, Δbottom +22, Δcx +0) | – | – | **!** 144,931 480x61 (Δtop -18, Δbottom +0, Δcx +0) | **!** 299,942 170x20 (Δtop -18, Δbottom -18, Δcx +0) |
| stability-2d20-surreal | **!** 110,336 547x107 (Δtop -40, Δbottom +17, Δcx +0) | – | 192,462 384x22 | 144,949 480x43 | 336,960 95x20 |
| stability-nat20 | **!** 110,308 547x107 (Δtop -68, Δbottom -10, Δcx +0) | – | **!** 219,434 330x50 (Δtop -28, Δbottom +0, Δcx +0) | 144,949 480x43 | 336,960 95x20 |
| stability-check-lucid | **!** 110,341 547x107 (Δtop -35, Δbottom +22, Δcx +0) | – | – | **!** 144,931 480x61 (Δtop -18, Δbottom +0, Δcx +0) | **!** 299,942 170x20 (Δtop -18, Δbottom -18, Δcx +0) |
| stability-2d20-lucid | **!** 110,336 547x107 (Δtop -40, Δbottom +17, Δcx +0) | – | 164,462 440x22 | 144,949 480x43 | 336,960 95x20 |
| result-hold | **!** 110,336 547x107 (Δtop -40, Δbottom +17, Δcx +0) | – | 254,462 260x22 | 144,949 480x43 | 336,960 95x20 |
| salvation-n1-step | **!** 90,398 587x50 (Δtop +22, Δbottom +22, Δcx +0) | – | – | 144,949 480x43 | 212,960 344x20 |
| salvation-n1-nat20 | **!** 90,366 587x50 (Δtop -10, Δbottom -10, Δcx +0) | – | **!** 197,434 374x50 (Δtop -28, Δbottom +0, Δcx +0) | 144,949 480x43 | 336,960 95x20 |
| salvation-n1-hit | **!** 90,393 587x50 (Δtop +17, Δbottom +17, Δcx +0) | – | 264,462 240x22 | 144,949 480x43 | 336,960 95x20 |
| salvation-n1-miss | **!** 90,393 587x50 (Δtop +17, Δbottom +17, Δcx +0) | – | 215,462 338x22 | 144,949 480x43 | 336,960 95x20 |
| salvation-n1-nat1 | **!** 90,366 587x50 (Δtop -10, Δbottom -10, Δcx +0) | – | **!** 213,434 342x50 (Δtop -28, Δbottom +0, Δcx +0) | 144,949 480x43 | 336,960 95x20 |
| salvation-n2-nat20 | **!** 90,366 587x50 (Δtop -10, Δbottom -10, Δcx +0) | – | **!** 197,434 374x50 (Δtop -28, Δbottom +0, Δcx +0) | 144,949 480x43 | 336,960 95x20 |
| salvation-n2-hit | **!** 90,393 587x50 (Δtop +17, Δbottom +17, Δcx +0) | – | 264,462 240x22 | 144,949 480x43 | 336,960 95x20 |
| salvation-n2-nat1 | **!** 90,366 587x50 (Δtop -10, Δbottom -10, Δcx +0) | – | **!** 213,434 342x50 (Δtop -28, Δbottom +0, Δcx +0) | 144,949 480x43 | 336,960 95x20 |
| salvation-n3-step | **!** 90,398 587x50 (Δtop +22, Δbottom +22, Δcx +0) | – | – | 144,949 480x43 | 213,960 341x20 |
| salvation-n3-nat20 | **!** 90,366 587x50 (Δtop -10, Δbottom -10, Δcx +0) | – | **!** 197,434 374x50 (Δtop -28, Δbottom +0, Δcx +0) | 144,949 480x43 | 336,960 95x20 |
| salvation-n3-hit | **!** 90,393 587x50 (Δtop +17, Δbottom +17, Δcx +0) | – | 264,462 240x22 | 144,949 480x43 | 336,960 95x20 |
| salvation-n3-miss | **!** 90,393 587x50 (Δtop +17, Δbottom +17, Δcx +0) | – | 215,462 338x22 | 144,949 480x43 | 336,960 95x20 |
| salvation-n3-nat1 | **!** 90,366 587x50 (Δtop -10, Δbottom -10, Δcx +0) | – | **!** 213,434 342x50 (Δtop -28, Δbottom +0, Δcx +0) | 144,949 480x43 | 336,960 95x20 |
| salvation-n4-step | 90,376 587x50 | – | – | 144,949 480x43 | 176,960 417x20 |
| salvation-n4-nat20 | **!** 90,366 587x50 (Δtop -10, Δbottom -10, Δcx +0) | – | **!** 167,434 434x50 (Δtop -28, Δbottom +0, Δcx +0) | 144,949 480x43 | 336,960 95x20 |
| salvation-n4-hold | **!** 90,393 587x50 (Δtop +17, Δbottom +17, Δcx +0) | – | 187,462 393x22 | 144,949 480x43 | 336,960 95x20 |
| salvation-n4-loss | **!** 90,393 587x50 (Δtop +17, Δbottom +17, Δcx +0) | – | 212,462 345x22 | 144,949 480x43 | 336,960 95x20 |
| salvation-n4-nat1 | **!** 90,366 587x50 (Δtop -10, Δbottom -10, Δcx +0) | – | **!** 164,434 440x50 (Δtop -28, Δbottom +0, Δcx +0) | 144,949 480x43 | 336,960 95x20 |
| salvation-step-lucid | **!** 90,398 587x50 (Δtop +22, Δbottom +22, Δcx +0) | – | – | **!** 144,931 480x61 (Δtop -18, Δbottom +0, Δcx +0) | **!** 212,942 345x20 (Δtop -18, Δbottom -18, Δcx +0) |
| salvation-last-token | **!** 90,393 587x50 (Δtop +17, Δbottom +17, Δcx +0) | – | 264,462 240x22 | 144,949 480x43 | 349,960 71x20 |
| salvation-n4-fatal | **!** 90,393 587x50 (Δtop +17, Δbottom +17, Δcx +0) | – | 143,462 481x22 | 144,949 480x43 | 319,960 129x20 |
| stability-fatal | **!** 110,336 547x107 (Δtop -40, Δbottom +17, Δcx +0) | – | 143,462 481x22 | 144,949 480x43 | 319,960 129x20 |
| notice-return-king | **!** 110,312 547x107 (Δtop -64, Δbottom -7, Δcx +0) | – | – | 144,949 480x43 | 299,960 170x20 |
| notice-return-king-result | **!** 110,307 547x107 (Δtop -69, Δbottom -12, Δcx +0) | – | **!** 230,432 308x22 (Δtop -29, Δbottom -29, Δcx +0) | 144,949 480x43 | 336,960 95x20 |
| notice-skip-damage | **!** 90,347 587x50 (Δtop -29, Δbottom -29, Δcx +0) | – | – | 144,949 480x43 | 176,960 417x20 |
| keyboard-skip-link | **!** 159,398 450x50 (Δtop +22, Δbottom +22, Δcx +0) | – | – | 144,949 480x43 | 308,960 152x20 |
| keyboard-step-focus | **!** 159,398 450x50 (Δtop +22, Δbottom +22, Δcx +0) | – | – | 144,949 480x43 | 308,960 152x20 |
| autoplay-on | **!** 173,398 422x50 (Δtop +22, Δbottom +22, Δcx -0) | – | – | 144,949 480x43 | 308,960 152x20 |
| easy-round-start | **!** 173,398 422x50 (Δtop +22, Δbottom +22, Δcx -0) | – | – | 144,949 480x43 | 308,960 152x20 |
| salvation-e1-step | **!** 90,398 587x50 (Δtop +22, Δbottom +22, Δcx +0) | – | – | 144,949 480x43 | 212,960 344x20 |
| salvation-e1-nat20 | **!** 90,366 587x50 (Δtop -10, Δbottom -10, Δcx +0) | – | **!** 197,434 374x50 (Δtop -28, Δbottom +0, Δcx +0) | 144,949 480x43 | 336,960 95x20 |
| salvation-e1-hit | **!** 90,393 587x50 (Δtop +17, Δbottom +17, Δcx +0) | – | 264,462 240x22 | 144,949 480x43 | 336,960 95x20 |
| salvation-e1-miss | **!** 90,393 587x50 (Δtop +17, Δbottom +17, Δcx +0) | – | 215,462 338x22 | 144,949 480x43 | 336,960 95x20 |
| salvation-e1-nat1 | **!** 90,366 587x50 (Δtop -10, Δbottom -10, Δcx +0) | – | **!** 213,434 342x50 (Δtop -28, Δbottom +0, Δcx +0) | 144,949 480x43 | 336,960 95x20 |
| salvation-e2-step | **!** 90,398 587x50 (Δtop +22, Δbottom +22, Δcx +0) | – | – | 144,949 480x43 | 212,960 345x20 |
| salvation-e2-nat20 | **!** 90,366 587x50 (Δtop -10, Δbottom -10, Δcx +0) | – | **!** 197,434 374x50 (Δtop -28, Δbottom +0, Δcx +0) | 144,949 480x43 | 336,960 95x20 |
| salvation-e2-hit | **!** 90,393 587x50 (Δtop +17, Δbottom +17, Δcx +0) | – | 264,462 240x22 | 144,949 480x43 | 336,960 95x20 |
| salvation-e2-miss | **!** 90,393 587x50 (Δtop +17, Δbottom +17, Δcx +0) | – | 215,462 338x22 | 144,949 480x43 | 336,960 95x20 |
| salvation-e2-nat1 | **!** 90,366 587x50 (Δtop -10, Δbottom -10, Δcx +0) | – | **!** 213,434 342x50 (Δtop -28, Δbottom +0, Δcx +0) | 144,949 480x43 | 336,960 95x20 |
| salvation-e3-step | **!** 90,398 587x50 (Δtop +22, Δbottom +22, Δcx +0) | – | – | 144,949 480x43 | 213,960 341x20 |
| salvation-e3-nat20 | **!** 90,366 587x50 (Δtop -10, Δbottom -10, Δcx +0) | – | **!** 197,434 374x50 (Δtop -28, Δbottom +0, Δcx +0) | 144,949 480x43 | 336,960 95x20 |
| salvation-e3-hit | **!** 90,393 587x50 (Δtop +17, Δbottom +17, Δcx +0) | – | 264,462 240x22 | 144,949 480x43 | 336,960 95x20 |
| salvation-e3-miss | **!** 90,393 587x50 (Δtop +17, Δbottom +17, Δcx +0) | – | 215,462 338x22 | 144,949 480x43 | 336,960 95x20 |
| salvation-e3-nat1 | **!** 90,366 587x50 (Δtop -10, Δbottom -10, Δcx +0) | – | **!** 213,434 342x50 (Δtop -28, Δbottom +0, Δcx +0) | 144,949 480x43 | 336,960 95x20 |
| easy-final-check | **!** 110,261 547x165 (Δtop -115, Δbottom +0, Δcx +0) | – | – | **!** 144,930 480x62 (Δtop -19, Δbottom +0, Δcx +0) | **!** 243,941 282x39 (Δtop -19, Δbottom +0, Δcx +0) |
| easy-final-escape | **!** 110,278 547x165 (Δtop -98, Δbottom +17, Δcx +0) | – | 171,462 426x22 | 144,949 480x43 | 349,960 71x20 |
| easy-final-fatal | **!** 110,278 547x165 (Δtop -98, Δbottom +17, Δcx +0) | – | 143,462 481x22 | 144,949 480x43 | 319,960 129x20 |
| salvation-h1-step | **!** 90,398 587x50 (Δtop +22, Δbottom +22, Δcx +0) | – | – | 144,949 480x43 | 212,960 344x20 |
| salvation-hard-miss | **!** 90,393 587x50 (Δtop +17, Δbottom +17, Δcx +0) | – | 208,462 351x22 | 144,949 480x43 | 336,960 95x20 |
| salvation-hard-nat1 | **!** 90,366 587x50 (Δtop -10, Δbottom -10, Δcx +0) | – | **!** 200,434 368x50 (Δtop -28, Δbottom +0, Δcx +0) | 144,949 480x43 | 336,960 95x20 |
| salvation-hard-over | **!** 90,393 587x50 (Δtop +17, Δbottom +17, Δcx +0) | – | 202,462 363x22 | 144,949 480x43 | 336,960 95x20 |
| caption-odd | **!** 110,341 547x107 (Δtop -35, Δbottom +22, Δcx +0) | 174,240 420x57 | – | 144,949 480x43 | 299,960 170x20 |
| caption-king | **!** 90,398 587x50 (Δtop +22, Δbottom +22, Δcx +0) | **!** 174,326 420x57 (Δtop +86, Δbottom +86, Δcx +0) | – | 144,949 480x43 | 212,960 345x20 |
| caption-ace | **!** 159,398 450x50 (Δtop +22, Δbottom +22, Δcx +0) | **!** 176,346 416x38 (Δtop +106, Δbottom +86, Δcx +0) | – | 144,949 480x43 | 308,960 152x20 |
| caption-lucid | **!** 110,341 547x107 (Δtop -35, Δbottom +22, Δcx +0) | 174,240 420x57 | – | 144,949 480x43 | 299,960 170x20 |
| caption-surreal | **!** 90,398 587x50 (Δtop +22, Δbottom +22, Δcx +0) | **!** 174,326 420x57 (Δtop +86, Δbottom +86, Δcx +0) | – | 144,949 480x43 | 212,960 345x20 |
| caption-salvation | **!** 159,398 450x50 (Δtop +22, Δbottom +22, Δcx +0) | **!** 174,326 420x57 (Δtop +86, Δbottom +86, Δcx +0) | – | 144,949 480x43 | 308,960 152x20 |
| caption-hard-token | **!** 90,393 587x50 (Δtop +17, Δbottom +17, Δcx +0) | **!** 194,340 380x38 (Δtop +100, Δbottom +81, Δcx -0) | 208,462 351x22 | 144,949 480x43 | 336,960 95x20 |
| caption-easy-odd | **!** 110,341 547x107 (Δtop -35, Δbottom +22, Δcx +0) | 174,240 420x57 | – | 144,949 480x43 | 299,960 170x20 |
| caption-easy-salvation | **!** 90,398 587x50 (Δtop +22, Δbottom +22, Δcx +0) | **!** 174,326 420x57 (Δtop +86, Δbottom +86, Δcx +0) | – | 144,949 480x43 | 212,960 344x20 |
| caption-easy-ace-third | **!** 159,398 450x50 (Δtop +22, Δbottom +22, Δcx +0) | **!** 174,307 420x77 (Δtop +67, Δbottom +86, Δcx +0) | – | 144,949 480x43 | 308,960 152x20 |
| caption-easy-fourth-ace | **!** 110,261 547x165 (Δtop -115, Δbottom +0, Δcx +0) | **!** 174,160 420x57 (Δtop -80, Δbottom -80, Δcx +0) | – | **!** 144,930 480x62 (Δtop -19, Δbottom +0, Δcx +0) | **!** 243,941 282x39 (Δtop -19, Δbottom +0, Δcx +0) |
| **max delta** | Δtop 137 · Δbottom 51 · Δcx 0 · Δw 228 · Δh 115 | Δtop 186 · Δbottom 166 · Δcx 0 · Δw 40 · Δh 39 | Δtop 29 · Δbottom 29 · Δcx 0 · Δw 263 · Δh 28 | Δtop 19 · Δbottom 0 · Δcx 0 · Δw 0 · Δh 19 | Δtop 19 · Δbottom 18 · Δcx 0 · Δw 346 · Δh 19 |

Reference states: screen title = instability-roll, rule caption = caption-odd, result line = instability-result, step button = instability-roll, step label = instability-roll

Flagged shifts over 2px at ipad-portrait: 126

- instability-result: screen title Δtop +17.1, Δbottom +17.1, Δcentre-x +0.0, Δheight +0.0
- round-start: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x -0.1, Δheight +0.0
- task-result: screen title Δtop +17.1, Δbottom +17.1, Δcentre-x -0.1, Δheight +0.0
- stability-check: screen title Δtop -35.0, Δbottom +22.4, Δcentre-x +0.0, Δheight +57.4
- stability-rolling: screen title Δtop -35.0, Δbottom +22.4, Δcentre-x +0.0, Δheight +57.4
- stability-11-19: screen title Δtop -40.3, Δbottom +17.1, Δcentre-x +0.0, Δheight +57.4
- stability-check-ace: screen title Δtop -35.0, Δbottom +22.4, Δcentre-x +0.0, Δheight +57.4
- stability-6-10: screen title Δtop -40.3, Δbottom +17.1, Δcentre-x +0.0, Δheight +57.4
- stability-2-5: screen title Δtop -40.3, Δbottom +17.1, Δcentre-x +0.0, Δheight +57.4
- salvation-n2-step: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.0, Δheight +0.0
- salvation-n2-miss: screen title Δtop +17.1, Δbottom +17.1, Δcentre-x +0.0, Δheight +0.0
- round-start-r2: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.0, Δheight +0.0
- task-result-nat1: screen title Δtop -10.5, Δbottom -10.5, Δcentre-x +0.0, Δheight +0.0
- task-result-nat1: result line Δtop -27.6, Δbottom +0.1, Δcentre-x +0.1, Δheight +27.7
- round-start-surreal: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.0, Δheight +0.0
- round-start-surreal: step button Δtop -17.6, Δbottom +0.0, Δcentre-x +0.0, Δheight +17.6
- round-start-surreal: step label Δtop -17.6, Δbottom -17.6, Δcentre-x +0.1, Δheight +0.0
- task-result-nat20: screen title Δtop -10.5, Δbottom -10.5, Δcentre-x +0.0, Δheight +0.0
- task-result-nat20: result line Δtop -27.6, Δbottom +0.1, Δcentre-x +0.1, Δheight +27.7
- round-start-lucid: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.0, Δheight +0.0
- round-start-lucid: step button Δtop -17.6, Δbottom +0.0, Δcentre-x +0.0, Δheight +17.6
- round-start-lucid: step label Δtop -17.6, Δbottom -17.6, Δcentre-x -0.1, Δheight +0.0
- stability-nat1: screen title Δtop -67.9, Δbottom -10.5, Δcentre-x +0.0, Δheight +57.4
- stability-nat1: result line Δtop -27.6, Δbottom +0.1, Δcentre-x +0.0, Δheight +27.7
- stability-check-surreal: screen title Δtop -35.0, Δbottom +22.4, Δcentre-x +0.0, Δheight +57.4
- stability-check-surreal: step button Δtop -17.6, Δbottom +0.0, Δcentre-x +0.0, Δheight +17.6
- stability-check-surreal: step label Δtop -17.6, Δbottom -17.6, Δcentre-x +0.0, Δheight +0.0
- stability-2d20-surreal: screen title Δtop -40.3, Δbottom +17.1, Δcentre-x +0.0, Δheight +57.4
- stability-nat20: screen title Δtop -67.9, Δbottom -10.5, Δcentre-x +0.0, Δheight +57.4
- stability-nat20: result line Δtop -27.6, Δbottom +0.1, Δcentre-x +0.0, Δheight +27.7
- stability-check-lucid: screen title Δtop -35.0, Δbottom +22.4, Δcentre-x +0.0, Δheight +57.4
- stability-check-lucid: step button Δtop -17.6, Δbottom +0.0, Δcentre-x +0.0, Δheight +17.6
- stability-check-lucid: step label Δtop -17.6, Δbottom -17.6, Δcentre-x +0.0, Δheight +0.0
- stability-2d20-lucid: screen title Δtop -40.3, Δbottom +17.1, Δcentre-x +0.0, Δheight +57.4
- result-hold: screen title Δtop -40.3, Δbottom +17.1, Δcentre-x +0.0, Δheight +57.4
- salvation-n1-step: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.0, Δheight +0.0
- salvation-n1-nat20: screen title Δtop -10.5, Δbottom -10.5, Δcentre-x +0.0, Δheight +0.0
- salvation-n1-nat20: result line Δtop -27.6, Δbottom +0.1, Δcentre-x +0.1, Δheight +27.7
- salvation-n1-hit: screen title Δtop +17.1, Δbottom +17.1, Δcentre-x +0.0, Δheight +0.0
- salvation-n1-miss: screen title Δtop +17.1, Δbottom +17.1, Δcentre-x +0.0, Δheight +0.0
- salvation-n1-nat1: screen title Δtop -10.5, Δbottom -10.5, Δcentre-x +0.0, Δheight +0.0
- salvation-n1-nat1: result line Δtop -27.6, Δbottom +0.1, Δcentre-x +0.1, Δheight +27.7
- salvation-n2-nat20: screen title Δtop -10.5, Δbottom -10.5, Δcentre-x +0.0, Δheight +0.0
- salvation-n2-nat20: result line Δtop -27.6, Δbottom +0.1, Δcentre-x +0.1, Δheight +27.7
- salvation-n2-hit: screen title Δtop +17.1, Δbottom +17.1, Δcentre-x +0.0, Δheight +0.0
- salvation-n2-nat1: screen title Δtop -10.5, Δbottom -10.5, Δcentre-x +0.0, Δheight +0.0
- salvation-n2-nat1: result line Δtop -27.6, Δbottom +0.1, Δcentre-x +0.1, Δheight +27.7
- salvation-n3-step: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.0, Δheight +0.0
- salvation-n3-nat20: screen title Δtop -10.5, Δbottom -10.5, Δcentre-x +0.0, Δheight +0.0
- salvation-n3-nat20: result line Δtop -27.6, Δbottom +0.1, Δcentre-x +0.1, Δheight +27.7
- salvation-n3-hit: screen title Δtop +17.1, Δbottom +17.1, Δcentre-x +0.0, Δheight +0.0
- salvation-n3-miss: screen title Δtop +17.1, Δbottom +17.1, Δcentre-x +0.0, Δheight +0.0
- salvation-n3-nat1: screen title Δtop -10.5, Δbottom -10.5, Δcentre-x +0.0, Δheight +0.0
- salvation-n3-nat1: result line Δtop -27.6, Δbottom +0.1, Δcentre-x +0.1, Δheight +27.7
- salvation-n4-nat20: screen title Δtop -10.5, Δbottom -10.5, Δcentre-x +0.0, Δheight +0.0
- salvation-n4-nat20: result line Δtop -27.6, Δbottom +0.1, Δcentre-x +0.1, Δheight +27.7
- salvation-n4-hold: screen title Δtop +17.1, Δbottom +17.1, Δcentre-x +0.0, Δheight +0.0
- salvation-n4-loss: screen title Δtop +17.1, Δbottom +17.1, Δcentre-x +0.0, Δheight +0.0
- salvation-n4-nat1: screen title Δtop -10.5, Δbottom -10.5, Δcentre-x +0.0, Δheight +0.0
- salvation-n4-nat1: result line Δtop -27.6, Δbottom +0.1, Δcentre-x +0.0, Δheight +27.7
- salvation-step-lucid: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.0, Δheight +0.0
- salvation-step-lucid: step button Δtop -17.6, Δbottom +0.0, Δcentre-x +0.0, Δheight +17.6
- salvation-step-lucid: step label Δtop -17.6, Δbottom -17.6, Δcentre-x +0.0, Δheight +0.0
- salvation-last-token: screen title Δtop +17.1, Δbottom +17.1, Δcentre-x +0.0, Δheight +0.0
- salvation-n4-fatal: screen title Δtop +17.1, Δbottom +17.1, Δcentre-x +0.0, Δheight +0.0
- stability-fatal: screen title Δtop -40.3, Δbottom +17.1, Δcentre-x +0.0, Δheight +57.4
- notice-return-king: screen title Δtop -64.0, Δbottom -6.6, Δcentre-x +0.0, Δheight +57.4
- notice-return-king-result: screen title Δtop -69.3, Δbottom -11.9, Δcentre-x +0.0, Δheight +57.4
- notice-return-king-result: result line Δtop -29.0, Δbottom -29.0, Δcentre-x +0.0, Δheight +0.0
- notice-skip-damage: screen title Δtop -29.0, Δbottom -29.0, Δcentre-x +0.0, Δheight +0.0
- keyboard-skip-link: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.0, Δheight +0.0
- keyboard-step-focus: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.0, Δheight +0.0
- autoplay-on: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x -0.1, Δheight +0.0
- easy-round-start: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x -0.1, Δheight +0.0
- salvation-e1-step: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.0, Δheight +0.0
- salvation-e1-nat20: screen title Δtop -10.5, Δbottom -10.5, Δcentre-x +0.0, Δheight +0.0
- salvation-e1-nat20: result line Δtop -27.6, Δbottom +0.1, Δcentre-x +0.1, Δheight +27.7
- salvation-e1-hit: screen title Δtop +17.1, Δbottom +17.1, Δcentre-x +0.0, Δheight +0.0
- salvation-e1-miss: screen title Δtop +17.1, Δbottom +17.1, Δcentre-x +0.0, Δheight +0.0
- salvation-e1-nat1: screen title Δtop -10.5, Δbottom -10.5, Δcentre-x +0.0, Δheight +0.0
- salvation-e1-nat1: result line Δtop -27.6, Δbottom +0.1, Δcentre-x +0.1, Δheight +27.7
- salvation-e2-step: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.0, Δheight +0.0
- salvation-e2-nat20: screen title Δtop -10.5, Δbottom -10.5, Δcentre-x +0.0, Δheight +0.0
- salvation-e2-nat20: result line Δtop -27.6, Δbottom +0.1, Δcentre-x +0.1, Δheight +27.7
- salvation-e2-hit: screen title Δtop +17.1, Δbottom +17.1, Δcentre-x +0.0, Δheight +0.0
- salvation-e2-miss: screen title Δtop +17.1, Δbottom +17.1, Δcentre-x +0.0, Δheight +0.0
- salvation-e2-nat1: screen title Δtop -10.5, Δbottom -10.5, Δcentre-x +0.0, Δheight +0.0
- salvation-e2-nat1: result line Δtop -27.6, Δbottom +0.1, Δcentre-x +0.1, Δheight +27.7
- salvation-e3-step: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.0, Δheight +0.0
- salvation-e3-nat20: screen title Δtop -10.5, Δbottom -10.5, Δcentre-x +0.0, Δheight +0.0
- salvation-e3-nat20: result line Δtop -27.6, Δbottom +0.1, Δcentre-x +0.1, Δheight +27.7
- salvation-e3-hit: screen title Δtop +17.1, Δbottom +17.1, Δcentre-x +0.0, Δheight +0.0
- salvation-e3-miss: screen title Δtop +17.1, Δbottom +17.1, Δcentre-x +0.0, Δheight +0.0
- salvation-e3-nat1: screen title Δtop -10.5, Δbottom -10.5, Δcentre-x +0.0, Δheight +0.0
- salvation-e3-nat1: result line Δtop -27.6, Δbottom +0.1, Δcentre-x +0.1, Δheight +27.7
- easy-final-check: screen title Δtop -114.8, Δbottom +0.0, Δcentre-x +0.0, Δheight +114.8
- easy-final-check: step button Δtop -19.2, Δbottom +0.0, Δcentre-x +0.0, Δheight +19.2
- easy-final-check: step label Δtop -19.2, Δbottom +0.0, Δcentre-x +0.1, Δheight +19.2
- easy-final-escape: screen title Δtop -97.7, Δbottom +17.1, Δcentre-x +0.0, Δheight +114.8
- easy-final-fatal: screen title Δtop -97.7, Δbottom +17.1, Δcentre-x +0.0, Δheight +114.8
- salvation-h1-step: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.0, Δheight +0.0
- salvation-hard-miss: screen title Δtop +17.1, Δbottom +17.1, Δcentre-x +0.0, Δheight +0.0
- salvation-hard-nat1: screen title Δtop -10.5, Δbottom -10.5, Δcentre-x +0.0, Δheight +0.0
- salvation-hard-nat1: result line Δtop -27.6, Δbottom +0.1, Δcentre-x +0.1, Δheight +27.7
- salvation-hard-over: screen title Δtop +17.1, Δbottom +17.1, Δcentre-x +0.0, Δheight +0.0
- caption-odd: screen title Δtop -35.0, Δbottom +22.4, Δcentre-x +0.0, Δheight +57.4
- caption-king: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.0, Δheight +0.0
- caption-king: rule caption Δtop +86.4, Δbottom +86.4, Δcentre-x +0.0, Δheight +0.0
- caption-ace: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.0, Δheight +0.0
- caption-ace: rule caption Δtop +105.8, Δbottom +86.4, Δcentre-x +0.0, Δheight -19.4
- caption-lucid: screen title Δtop -35.0, Δbottom +22.4, Δcentre-x +0.0, Δheight +57.4
- caption-surreal: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.0, Δheight +0.0
- caption-surreal: rule caption Δtop +86.4, Δbottom +86.4, Δcentre-x +0.0, Δheight +0.0
- caption-salvation: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.0, Δheight +0.0
- caption-salvation: rule caption Δtop +86.4, Δbottom +86.4, Δcentre-x +0.0, Δheight +0.0
- caption-hard-token: screen title Δtop +17.1, Δbottom +17.1, Δcentre-x +0.0, Δheight +0.0
- caption-hard-token: rule caption Δtop +100.5, Δbottom +81.1, Δcentre-x -0.1, Δheight -19.4
- caption-easy-odd: screen title Δtop -35.0, Δbottom +22.4, Δcentre-x +0.0, Δheight +57.4
- caption-easy-salvation: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.0, Δheight +0.0
- caption-easy-salvation: rule caption Δtop +86.4, Δbottom +86.4, Δcentre-x +0.0, Δheight +0.0
- caption-easy-ace-third: screen title Δtop +22.4, Δbottom +22.4, Δcentre-x +0.0, Δheight +0.0
- caption-easy-ace-third: rule caption Δtop +66.8, Δbottom +86.4, Δcentre-x +0.0, Δheight +19.6
- caption-easy-fourth-ace: screen title Δtop -114.8, Δbottom +0.0, Δcentre-x +0.0, Δheight +114.8
- caption-easy-fourth-ace: rule caption Δtop -79.8, Δbottom -79.8, Δcentre-x +0.0, Δheight +0.0
- caption-easy-fourth-ace: step button Δtop -19.2, Δbottom +0.0, Δcentre-x +0.0, Δheight +19.2
- caption-easy-fourth-ace: step label Δtop -19.2, Δbottom +0.0, Δcentre-x +0.1, Δheight +19.2

## laptop (1280x720)

| state | screen title | rule caption | result line | step button | step label |
|---|---|---|---|---|---|
| instability-roll | 276,242 729x56 | – | – | 400,642 480x46 | 492,654 231x21 |
| instability-result | **!** 276,263 729x56 (Δtop +21, Δbottom +21, Δcx +0) | – | 499,339 282x24 | 400,642 480x46 | 554,654 107x21 |
| round-start | **!** 403,268 473x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | 400,642 480x46 | 523,654 170x21 |
| task-result | **!** 403,263 473x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 522,339 237x24 | 400,642 480x46 | 530,654 155x21 |
| stability-check | **!** 333,203 614x120 (Δtop -39, Δbottom +26, Δcx -0) | – | – | 400,642 480x46 | 512,654 192x21 |
| stability-rolling | **!** 333,203 614x120 (Δtop -39, Δbottom +26, Δcx -0) | – | – | 400,642 480x46 | 554,654 107x21 |
| stability-11-19 | **!** 333,199 614x120 (Δtop -43, Δbottom +21, Δcx -0) | – | 473,339 334x24 | 400,642 480x46 | 554,654 107x21 |
| stability-check-ace | **!** 333,203 614x120 (Δtop -39, Δbottom +26, Δcx -0) | – | – | 400,642 480x46 | 512,654 192x21 |
| stability-6-10 | **!** 333,199 614x120 (Δtop -43, Δbottom +21, Δcx -0) | – | 499,339 282x24 | 400,642 480x46 | 554,654 107x21 |
| stability-2-5 | **!** 333,199 614x120 (Δtop -43, Δbottom +21, Δcx -0) | – | 499,339 282x24 | 400,642 480x46 | 554,654 107x21 |
| salvation-n2-step | **!** 311,268 659x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | 400,642 480x46 | 414,654 388x21 |
| salvation-n2-miss | **!** 311,263 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 463,339 354x24 | 400,642 480x46 | 554,654 107x21 |
| round-start-r2 | **!** 388,268 505x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | 400,642 480x46 | 523,654 170x21 |
| task-result-nat1 | **!** 388,233 505x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 458,309 365x54 (Δtop -30, Δbottom +0, Δcx +0) | 400,642 480x46 | 539,654 138x21 |
| round-start-surreal | **!** 388,268 505x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | **!** 400,625 480x63 (Δtop -18, Δbottom +0, Δcx +0) | **!** 523,637 170x21 (Δtop -18, Δbottom -18, Δcx +0) |
| task-result-nat20 | **!** 388,233 505x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 405,309 471x54 (Δtop -30, Δbottom +0, Δcx +0) | 400,642 480x46 | 530,654 155x21 |
| round-start-lucid | **!** 388,268 505x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | **!** 400,625 480x63 (Δtop -18, Δbottom +0, Δcx +0) | **!** 523,637 170x21 (Δtop -18, Δbottom -18, Δcx +0) |
| stability-nat1 | **!** 333,181 614x120 (Δtop -61, Δbottom +3, Δcx -0) | – | **!** 461,321 358x54 (Δtop -18, Δbottom +12, Δcx +0) | 400,642 480x46 | 554,654 107x21 |
| stability-check-surreal | **!** 333,203 614x120 (Δtop -39, Δbottom +26, Δcx -0) | – | – | **!** 400,625 480x63 (Δtop -18, Δbottom +0, Δcx +0) | **!** 512,637 192x21 (Δtop -18, Δbottom -18, Δcx -0) |
| stability-2d20-surreal | **!** 333,199 614x120 (Δtop -43, Δbottom +21, Δcx -0) | – | 431,339 417x24 | 400,642 480x46 | 554,654 107x21 |
| stability-nat20 | **!** 333,181 614x120 (Δtop -61, Δbottom +3, Δcx -0) | – | **!** 461,321 359x54 (Δtop -18, Δbottom +12, Δcx +0) | 400,642 480x46 | 554,654 107x21 |
| stability-check-lucid | **!** 333,203 614x120 (Δtop -39, Δbottom +26, Δcx -0) | – | – | **!** 400,625 480x63 (Δtop -18, Δbottom +0, Δcx +0) | **!** 512,637 192x21 (Δtop -18, Δbottom -18, Δcx -0) |
| stability-2d20-lucid | **!** 333,199 614x120 (Δtop -43, Δbottom +21, Δcx -0) | – | 401,339 478x24 | 400,642 480x46 | 554,654 107x21 |
| result-hold | **!** 333,199 614x120 (Δtop -43, Δbottom +21, Δcx -0) | – | 499,339 282x24 | 400,642 480x46 | 554,654 107x21 |
| salvation-n1-step | **!** 311,268 659x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | 400,642 480x46 | 414,654 386x21 |
| salvation-n1-nat20 | **!** 311,233 659x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 437,309 406x54 (Δtop -30, Δbottom +0, Δcx +0) | 400,642 480x46 | 554,654 107x21 |
| salvation-n1-hit | **!** 311,263 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 510,339 260x24 | 400,642 480x46 | 554,654 107x21 |
| salvation-n1-miss | **!** 311,263 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 457,339 367x24 | 400,642 480x46 | 554,654 107x21 |
| salvation-n1-nat1 | **!** 311,233 659x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 454,309 372x54 (Δtop -30, Δbottom +0, Δcx +0) | 400,642 480x46 | 554,654 107x21 |
| salvation-n2-nat20 | **!** 311,233 659x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 437,309 406x54 (Δtop -30, Δbottom +0, Δcx +0) | 400,642 480x46 | 554,654 107x21 |
| salvation-n2-hit | **!** 311,263 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 510,339 260x24 | 400,642 480x46 | 554,654 107x21 |
| salvation-n2-nat1 | **!** 311,233 659x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 454,309 372x54 (Δtop -30, Δbottom +0, Δcx +0) | 400,642 480x46 | 554,654 107x21 |
| salvation-n3-step | **!** 311,268 659x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | 400,642 480x46 | 416,654 384x21 |
| salvation-n3-nat20 | **!** 311,233 659x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 437,309 406x54 (Δtop -30, Δbottom +0, Δcx +0) | 400,642 480x46 | 554,654 107x21 |
| salvation-n3-hit | **!** 311,263 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 510,339 260x24 | 400,642 480x46 | 554,654 107x21 |
| salvation-n3-miss | **!** 311,263 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 457,339 367x24 | 400,642 480x46 | 554,654 107x21 |
| salvation-n3-nat1 | **!** 311,233 659x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 454,309 372x54 (Δtop -30, Δbottom +0, Δcx +0) | 400,642 480x46 | 554,654 107x21 |
| salvation-n4-step | 311,242 659x56 | – | – | **!** 400,621 480x67 (Δtop -22, Δbottom +0, Δcx +0) | **!** 487,633 241x43 (Δtop -22, Δbottom +0, Δcx +0) |
| salvation-n4-nat20 | **!** 311,233 659x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 404,309 471x54 (Δtop -30, Δbottom +0, Δcx +0) | 400,642 480x46 | 554,654 107x21 |
| salvation-n4-hold | **!** 311,263 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 427,339 427x24 | 400,642 480x46 | 554,654 107x21 |
| salvation-n4-loss | **!** 311,263 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 453,339 374x24 | 400,642 480x46 | 554,654 107x21 |
| salvation-n4-nat1 | **!** 311,233 659x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 401,309 477x54 (Δtop -30, Δbottom +0, Δcx -0) | 400,642 480x46 | 554,654 107x21 |
| salvation-step-lucid | **!** 311,268 659x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | **!** 400,625 480x63 (Δtop -18, Δbottom +0, Δcx +0) | **!** 414,637 388x21 (Δtop -18, Δbottom -18, Δcx -0) |
| salvation-last-token | **!** 311,263 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 510,339 260x24 | 400,642 480x46 | 568,654 80x21 |
| salvation-n4-fatal | **!** 311,263 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 379,339 522x24 | 400,642 480x46 | 535,654 146x21 |
| stability-fatal | **!** 333,199 614x120 (Δtop -43, Δbottom +21, Δcx -0) | – | 379,339 522x24 | 400,642 480x46 | 535,654 146x21 |
| notice-return-king | **!** 333,181 614x120 (Δtop -61, Δbottom +3, Δcx -0) | – | – | 400,642 480x46 | 512,654 192x21 |
| notice-return-king-result | **!** 333,181 614x120 (Δtop -61, Δbottom +3, Δcx -0) | – | **!** 473,321 334x24 (Δtop -18, Δbottom -18, Δcx +0) | 400,642 480x46 | 554,654 107x21 |
| notice-skip-damage | **!** 311,210 659x56 (Δtop -32, Δbottom -32, Δcx -0) | – | – | **!** 400,621 480x67 (Δtop -22, Δbottom +0, Δcx +0) | **!** 487,633 241x43 (Δtop -22, Δbottom +0, Δcx +0) |
| keyboard-skip-link | **!** 388,268 505x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | 400,642 480x46 | 523,654 170x21 |
| keyboard-step-focus | **!** 388,268 505x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | 400,642 480x46 | 523,654 170x21 |
| autoplay-on | **!** 403,268 473x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | 400,642 480x46 | 523,654 170x21 |
| easy-round-start | **!** 403,268 473x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | 400,642 480x46 | 523,654 170x21 |
| salvation-e1-step | **!** 311,268 659x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | 400,642 480x46 | 414,654 386x21 |
| salvation-e1-nat20 | **!** 311,233 659x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 437,309 406x54 (Δtop -30, Δbottom +0, Δcx +0) | 400,642 480x46 | 554,654 107x21 |
| salvation-e1-hit | **!** 311,263 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 510,339 260x24 | 400,642 480x46 | 554,654 107x21 |
| salvation-e1-miss | **!** 311,263 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 457,339 367x24 | 400,642 480x46 | 554,654 107x21 |
| salvation-e1-nat1 | **!** 311,233 659x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 454,309 372x54 (Δtop -30, Δbottom +0, Δcx +0) | 400,642 480x46 | 554,654 107x21 |
| salvation-e2-step | **!** 311,268 659x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | 400,642 480x46 | 414,654 388x21 |
| salvation-e2-nat20 | **!** 311,233 659x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 437,309 406x54 (Δtop -30, Δbottom +0, Δcx +0) | 400,642 480x46 | 554,654 107x21 |
| salvation-e2-hit | **!** 311,263 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 510,339 260x24 | 400,642 480x46 | 554,654 107x21 |
| salvation-e2-miss | **!** 311,263 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 457,339 367x24 | 400,642 480x46 | 554,654 107x21 |
| salvation-e2-nat1 | **!** 311,233 659x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 454,309 372x54 (Δtop -30, Δbottom +0, Δcx +0) | 400,642 480x46 | 554,654 107x21 |
| salvation-e3-step | **!** 311,268 659x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | 400,642 480x46 | 416,654 384x21 |
| salvation-e3-nat20 | **!** 311,233 659x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 437,309 406x54 (Δtop -30, Δbottom +0, Δcx +0) | 400,642 480x46 | 554,654 107x21 |
| salvation-e3-hit | **!** 311,263 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 510,339 260x24 | 400,642 480x46 | 554,654 107x21 |
| salvation-e3-miss | **!** 311,263 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 457,339 367x24 | 400,642 480x46 | 554,654 107x21 |
| salvation-e3-nat1 | **!** 311,233 659x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 454,309 372x54 (Δtop -30, Δbottom +0, Δcx +0) | 400,642 480x46 | 554,654 107x21 |
| easy-final-check | **!** 333,181 614x185 (Δtop -61, Δbottom +68, Δcx -0) | – | – | **!** 400,621 480x67 (Δtop -22, Δbottom +0, Δcx +0) | **!** 450,633 317x43 (Δtop -22, Δbottom +0, Δcx +0) |
| easy-final-escape | **!** 333,181 614x185 (Δtop -61, Δbottom +68, Δcx -0) | – | **!** 408,385 463x24 (Δtop +47, Δbottom +47, Δcx +0) | 400,642 480x46 | 568,654 80x21 |
| easy-final-fatal | **!** 333,181 614x185 (Δtop -61, Δbottom +68, Δcx -0) | – | **!** 379,385 522x24 (Δtop +47, Δbottom +47, Δcx -0) | 400,642 480x46 | 535,654 146x21 |
| salvation-h1-step | **!** 311,268 659x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | 400,642 480x46 | 414,654 386x21 |
| salvation-hard-miss | **!** 311,263 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 450,339 381x24 | 400,642 480x46 | 554,654 107x21 |
| salvation-hard-nat1 | **!** 311,233 659x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 440,309 399x54 (Δtop -30, Δbottom +0, Δcx -0) | 400,642 480x46 | 554,654 107x21 |
| salvation-hard-over | **!** 311,263 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 443,339 394x24 | 400,642 480x46 | 554,654 107x21 |
| caption-odd | **!** 333,250 614x120 (Δtop +8, Δbottom +73, Δcx -0) | 430,148 420x57 | – | 400,642 480x46 | 512,654 192x21 |
| caption-king | **!** 311,268 659x56 (Δtop +26, Δbottom +26, Δcx -0) | **!** 430,194 420x57 (Δtop +46, Δbottom +46, Δcx +0) | – | 400,642 480x46 | 414,654 388x21 |
| caption-ace | **!** 388,268 505x56 (Δtop +26, Δbottom +26, Δcx -0) | **!** 432,214 416x38 (Δtop +66, Δbottom +46, Δcx +0) | – | 400,642 480x46 | 523,654 170x21 |
| caption-lucid | **!** 333,250 614x120 (Δtop +8, Δbottom +73, Δcx -0) | 430,148 420x57 | – | 400,642 480x46 | 512,654 192x21 |
| caption-surreal | **!** 311,268 659x56 (Δtop +26, Δbottom +26, Δcx -0) | **!** 430,194 420x57 (Δtop +46, Δbottom +46, Δcx +0) | – | 400,642 480x46 | 414,654 388x21 |
| caption-salvation | **!** 388,268 505x56 (Δtop +26, Δbottom +26, Δcx -0) | **!** 430,194 420x57 (Δtop +46, Δbottom +46, Δcx +0) | – | 400,642 480x46 | 523,654 170x21 |
| caption-hard-token | **!** 311,263 659x56 (Δtop +21, Δbottom +21, Δcx -0) | **!** 450,209 380x38 (Δtop +61, Δbottom +42, Δcx -0) | 450,339 381x24 | 400,642 480x46 | 554,654 107x21 |
| caption-easy-odd | **!** 333,250 614x120 (Δtop +8, Δbottom +73, Δcx -0) | 430,148 420x57 | – | 400,642 480x46 | 512,654 192x21 |
| caption-easy-salvation | **!** 311,268 659x56 (Δtop +26, Δbottom +26, Δcx -0) | **!** 430,194 420x57 (Δtop +46, Δbottom +46, Δcx +0) | – | 400,642 480x46 | 414,654 386x21 |
| caption-easy-ace-third | **!** 388,268 505x56 (Δtop +26, Δbottom +26, Δcx -0) | **!** 430,175 420x77 (Δtop +27, Δbottom +46, Δcx +0) | – | 400,642 480x46 | 523,654 170x21 |
| caption-easy-fourth-ace | **!** 333,250 614x185 (Δtop +8, Δbottom +137, Δcx -0) | 430,148 420x57 | – | **!** 400,621 480x67 (Δtop -22, Δbottom +0, Δcx +0) | **!** 450,633 317x43 (Δtop -22, Δbottom +0, Δcx +0) |
| **max delta** | Δtop 87 · Δbottom 169 · Δcx 0 · Δw 256 · Δh 129 | Δtop 66 · Δbottom 46 · Δcx 0 · Δw 40 · Δh 39 | Δtop 77 · Δbottom 64 · Δcx 0 · Δw 286 · Δh 30 | Δtop 22 · Δbottom 0 · Δcx 0 · Δw 0 · Δh 22 | Δtop 22 · Δbottom 18 · Δcx 0 · Δw 308 · Δh 22 |

Reference states: screen title = instability-roll, rule caption = caption-odd, result line = instability-result, step button = instability-roll, step label = instability-roll

Flagged shifts over 2px at laptop: 131

- instability-result: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x +0.0, Δheight +0.0
- round-start: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- task-result: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- stability-check: screen title Δtop -38.8, Δbottom +25.6, Δcentre-x -0.0, Δheight +64.4
- stability-rolling: screen title Δtop -38.8, Δbottom +25.6, Δcentre-x -0.0, Δheight +64.4
- stability-11-19: screen title Δtop -43.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +64.4
- stability-check-ace: screen title Δtop -38.8, Δbottom +25.6, Δcentre-x -0.0, Δheight +64.4
- stability-6-10: screen title Δtop -43.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +64.4
- stability-2-5: screen title Δtop -43.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +64.4
- salvation-n2-step: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- salvation-n2-miss: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- round-start-r2: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- task-result-nat1: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- task-result-nat1: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- round-start-surreal: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- round-start-surreal: step button Δtop -17.6, Δbottom +0.0, Δcentre-x +0.0, Δheight +17.6
- round-start-surreal: step label Δtop -17.6, Δbottom -17.6, Δcentre-x +0.0, Δheight +0.0
- task-result-nat20: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- task-result-nat20: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- round-start-lucid: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- round-start-lucid: step button Δtop -17.6, Δbottom +0.0, Δcentre-x +0.0, Δheight +17.6
- round-start-lucid: step label Δtop -17.6, Δbottom -17.6, Δcentre-x +0.0, Δheight +0.0
- stability-nat1: screen title Δtop -61.0, Δbottom +3.4, Δcentre-x -0.0, Δheight +64.4
- stability-nat1: result line Δtop -17.8, Δbottom +12.2, Δcentre-x +0.0, Δheight +30.0
- stability-check-surreal: screen title Δtop -38.8, Δbottom +25.6, Δcentre-x -0.0, Δheight +64.4
- stability-check-surreal: step button Δtop -17.6, Δbottom +0.0, Δcentre-x +0.0, Δheight +17.6
- stability-check-surreal: step label Δtop -17.6, Δbottom -17.6, Δcentre-x -0.0, Δheight +0.0
- stability-2d20-surreal: screen title Δtop -43.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +64.4
- stability-nat20: screen title Δtop -61.0, Δbottom +3.4, Δcentre-x -0.0, Δheight +64.4
- stability-nat20: result line Δtop -17.8, Δbottom +12.2, Δcentre-x +0.0, Δheight +30.0
- stability-check-lucid: screen title Δtop -38.8, Δbottom +25.6, Δcentre-x -0.0, Δheight +64.4
- stability-check-lucid: step button Δtop -17.6, Δbottom +0.0, Δcentre-x +0.0, Δheight +17.6
- stability-check-lucid: step label Δtop -17.6, Δbottom -17.6, Δcentre-x -0.0, Δheight +0.0
- stability-2d20-lucid: screen title Δtop -43.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +64.4
- result-hold: screen title Δtop -43.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +64.4
- salvation-n1-step: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- salvation-n1-nat20: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- salvation-n1-nat20: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- salvation-n1-hit: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- salvation-n1-miss: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- salvation-n1-nat1: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- salvation-n1-nat1: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- salvation-n2-nat20: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- salvation-n2-nat20: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- salvation-n2-hit: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- salvation-n2-nat1: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- salvation-n2-nat1: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- salvation-n3-step: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- salvation-n3-nat20: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- salvation-n3-nat20: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- salvation-n3-hit: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- salvation-n3-miss: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- salvation-n3-nat1: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- salvation-n3-nat1: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- salvation-n4-step: step button Δtop -21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight +21.6
- salvation-n4-step: step label Δtop -21.6, Δbottom +0.0, Δcentre-x +0.1, Δheight +21.6
- salvation-n4-nat20: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- salvation-n4-nat20: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- salvation-n4-hold: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- salvation-n4-loss: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- salvation-n4-nat1: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- salvation-n4-nat1: result line Δtop -30.0, Δbottom +0.0, Δcentre-x -0.0, Δheight +30.0
- salvation-step-lucid: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- salvation-step-lucid: step button Δtop -17.6, Δbottom +0.0, Δcentre-x +0.0, Δheight +17.6
- salvation-step-lucid: step label Δtop -17.6, Δbottom -17.6, Δcentre-x -0.0, Δheight +0.0
- salvation-last-token: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- salvation-n4-fatal: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- stability-fatal: screen title Δtop -43.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +64.4
- notice-return-king: screen title Δtop -61.0, Δbottom +3.4, Δcentre-x -0.0, Δheight +64.4
- notice-return-king-result: screen title Δtop -61.0, Δbottom +3.4, Δcentre-x -0.0, Δheight +64.4
- notice-return-king-result: result line Δtop -17.8, Δbottom -17.8, Δcentre-x +0.0, Δheight +0.0
- notice-skip-damage: screen title Δtop -32.0, Δbottom -32.0, Δcentre-x -0.0, Δheight +0.0
- notice-skip-damage: step button Δtop -21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight +21.6
- notice-skip-damage: step label Δtop -21.6, Δbottom +0.0, Δcentre-x +0.1, Δheight +21.6
- keyboard-skip-link: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- keyboard-step-focus: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- autoplay-on: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- easy-round-start: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- salvation-e1-step: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- salvation-e1-nat20: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- salvation-e1-nat20: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- salvation-e1-hit: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- salvation-e1-miss: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- salvation-e1-nat1: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- salvation-e1-nat1: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- salvation-e2-step: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- salvation-e2-nat20: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- salvation-e2-nat20: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- salvation-e2-hit: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- salvation-e2-miss: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- salvation-e2-nat1: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- salvation-e2-nat1: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- salvation-e3-step: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- salvation-e3-nat20: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- salvation-e3-nat20: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- salvation-e3-hit: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- salvation-e3-miss: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- salvation-e3-nat1: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- salvation-e3-nat1: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- easy-final-check: screen title Δtop -61.0, Δbottom +67.8, Δcentre-x -0.0, Δheight +128.8
- easy-final-check: step button Δtop -21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight +21.6
- easy-final-check: step label Δtop -21.6, Δbottom +0.0, Δcentre-x +0.1, Δheight +21.6
- easy-final-escape: screen title Δtop -61.0, Δbottom +67.8, Δcentre-x -0.0, Δheight +128.8
- easy-final-escape: result line Δtop +46.6, Δbottom +46.6, Δcentre-x +0.0, Δheight +0.0
- easy-final-fatal: screen title Δtop -61.0, Δbottom +67.8, Δcentre-x -0.0, Δheight +128.8
- easy-final-fatal: result line Δtop +46.6, Δbottom +46.6, Δcentre-x -0.0, Δheight +0.0
- salvation-h1-step: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- salvation-hard-miss: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- salvation-hard-nat1: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- salvation-hard-nat1: result line Δtop -30.0, Δbottom +0.0, Δcentre-x -0.0, Δheight +30.0
- salvation-hard-over: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- caption-odd: screen title Δtop +8.2, Δbottom +72.6, Δcentre-x -0.0, Δheight +64.4
- caption-king: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- caption-king: rule caption Δtop +46.4, Δbottom +46.4, Δcentre-x +0.0, Δheight +0.0
- caption-ace: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- caption-ace: rule caption Δtop +65.8, Δbottom +46.4, Δcentre-x +0.0, Δheight -19.4
- caption-lucid: screen title Δtop +8.2, Δbottom +72.6, Δcentre-x -0.0, Δheight +64.4
- caption-surreal: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- caption-surreal: rule caption Δtop +46.4, Δbottom +46.4, Δcentre-x +0.0, Δheight +0.0
- caption-salvation: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- caption-salvation: rule caption Δtop +46.4, Δbottom +46.4, Δcentre-x +0.0, Δheight +0.0
- caption-hard-token: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- caption-hard-token: rule caption Δtop +61.4, Δbottom +42.0, Δcentre-x -0.0, Δheight -19.4
- caption-easy-odd: screen title Δtop +8.2, Δbottom +72.6, Δcentre-x -0.0, Δheight +64.4
- caption-easy-salvation: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- caption-easy-salvation: rule caption Δtop +46.4, Δbottom +46.4, Δcentre-x +0.0, Δheight +0.0
- caption-easy-ace-third: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- caption-easy-ace-third: rule caption Δtop +26.8, Δbottom +46.4, Δcentre-x +0.0, Δheight +19.6
- caption-easy-fourth-ace: screen title Δtop +8.2, Δbottom +137.0, Δcentre-x -0.0, Δheight +128.8
- caption-easy-fourth-ace: step button Δtop -21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight +21.6
- caption-easy-fourth-ace: step label Δtop -21.6, Δbottom +0.0, Δcentre-x +0.1, Δheight +21.6

## desktop (1440x900)

| state | screen title | rule caption | result line | step button | step label |
|---|---|---|---|---|---|
| instability-roll | 356,314 729x56 | – | – | 480,822 480x46 | 572,834 231x21 |
| instability-result | **!** 356,335 729x56 (Δtop +21, Δbottom +21, Δcx +0) | – | 579,411 282x24 | 480,822 480x46 | 634,834 107x21 |
| round-start | **!** 483,340 473x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | 480,822 480x46 | 603,834 170x21 |
| task-result | **!** 483,335 473x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 602,411 237x24 | 480,822 480x46 | 610,834 155x21 |
| stability-check | **!** 413,275 614x120 (Δtop -39, Δbottom +26, Δcx -0) | – | – | 480,822 480x46 | 592,834 192x21 |
| stability-rolling | **!** 413,275 614x120 (Δtop -39, Δbottom +26, Δcx -0) | – | – | 480,822 480x46 | 634,834 107x21 |
| stability-11-19 | **!** 413,271 614x120 (Δtop -43, Δbottom +21, Δcx -0) | – | 553,411 334x24 | 480,822 480x46 | 634,834 107x21 |
| stability-check-ace | **!** 413,275 614x120 (Δtop -39, Δbottom +26, Δcx -0) | – | – | 480,822 480x46 | 592,834 192x21 |
| stability-6-10 | **!** 413,271 614x120 (Δtop -43, Δbottom +21, Δcx -0) | – | 579,411 282x24 | 480,822 480x46 | 634,834 107x21 |
| stability-2-5 | **!** 413,271 614x120 (Δtop -43, Δbottom +21, Δcx -0) | – | 579,411 282x24 | 480,822 480x46 | 634,834 107x21 |
| salvation-n2-step | **!** 391,340 659x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | 480,822 480x46 | 494,834 388x21 |
| salvation-n2-miss | **!** 391,335 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 543,411 354x24 | 480,822 480x46 | 634,834 107x21 |
| round-start-r2 | **!** 468,340 505x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | 480,822 480x46 | 603,834 170x21 |
| task-result-nat1 | **!** 468,305 505x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 538,381 365x54 (Δtop -30, Δbottom +0, Δcx +0) | 480,822 480x46 | 619,834 138x21 |
| round-start-surreal | **!** 468,340 505x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | **!** 480,805 480x63 (Δtop -18, Δbottom +0, Δcx +0) | **!** 603,817 170x21 (Δtop -18, Δbottom -18, Δcx +0) |
| task-result-nat20 | **!** 468,305 505x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 485,381 471x54 (Δtop -30, Δbottom +0, Δcx +0) | 480,822 480x46 | 610,834 155x21 |
| round-start-lucid | **!** 468,340 505x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | **!** 480,805 480x63 (Δtop -18, Δbottom +0, Δcx +0) | **!** 603,817 170x21 (Δtop -18, Δbottom -18, Δcx +0) |
| stability-nat1 | **!** 413,241 614x120 (Δtop -73, Δbottom -9, Δcx -0) | – | **!** 541,381 358x54 (Δtop -30, Δbottom +0, Δcx +0) | 480,822 480x46 | 634,834 107x21 |
| stability-check-surreal | **!** 413,275 614x120 (Δtop -39, Δbottom +26, Δcx -0) | – | – | **!** 480,805 480x63 (Δtop -18, Δbottom +0, Δcx +0) | **!** 592,817 192x21 (Δtop -18, Δbottom -18, Δcx -0) |
| stability-2d20-surreal | **!** 413,271 614x120 (Δtop -43, Δbottom +21, Δcx -0) | – | 511,411 417x24 | 480,822 480x46 | 634,834 107x21 |
| stability-nat20 | **!** 413,241 614x120 (Δtop -73, Δbottom -9, Δcx -0) | – | **!** 541,381 359x54 (Δtop -30, Δbottom +0, Δcx +0) | 480,822 480x46 | 634,834 107x21 |
| stability-check-lucid | **!** 413,275 614x120 (Δtop -39, Δbottom +26, Δcx -0) | – | – | **!** 480,805 480x63 (Δtop -18, Δbottom +0, Δcx +0) | **!** 592,817 192x21 (Δtop -18, Δbottom -18, Δcx -0) |
| stability-2d20-lucid | **!** 413,271 614x120 (Δtop -43, Δbottom +21, Δcx -0) | – | 481,411 478x24 | 480,822 480x46 | 634,834 107x21 |
| result-hold | **!** 413,271 614x120 (Δtop -43, Δbottom +21, Δcx -0) | – | 579,411 282x24 | 480,822 480x46 | 634,834 107x21 |
| salvation-n1-step | **!** 391,340 659x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | 480,822 480x46 | 494,834 386x21 |
| salvation-n1-nat20 | **!** 391,305 659x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 517,381 406x54 (Δtop -30, Δbottom +0, Δcx +0) | 480,822 480x46 | 634,834 107x21 |
| salvation-n1-hit | **!** 391,335 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 590,411 260x24 | 480,822 480x46 | 634,834 107x21 |
| salvation-n1-miss | **!** 391,335 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 537,411 367x24 | 480,822 480x46 | 634,834 107x21 |
| salvation-n1-nat1 | **!** 391,305 659x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 534,381 372x54 (Δtop -30, Δbottom +0, Δcx +0) | 480,822 480x46 | 634,834 107x21 |
| salvation-n2-nat20 | **!** 391,305 659x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 517,381 406x54 (Δtop -30, Δbottom +0, Δcx +0) | 480,822 480x46 | 634,834 107x21 |
| salvation-n2-hit | **!** 391,335 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 590,411 260x24 | 480,822 480x46 | 634,834 107x21 |
| salvation-n2-nat1 | **!** 391,305 659x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 534,381 372x54 (Δtop -30, Δbottom +0, Δcx +0) | 480,822 480x46 | 634,834 107x21 |
| salvation-n3-step | **!** 391,340 659x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | 480,822 480x46 | 496,834 384x21 |
| salvation-n3-nat20 | **!** 391,305 659x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 517,381 406x54 (Δtop -30, Δbottom +0, Δcx +0) | 480,822 480x46 | 634,834 107x21 |
| salvation-n3-hit | **!** 391,335 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 590,411 260x24 | 480,822 480x46 | 634,834 107x21 |
| salvation-n3-miss | **!** 391,335 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 537,411 367x24 | 480,822 480x46 | 634,834 107x21 |
| salvation-n3-nat1 | **!** 391,305 659x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 534,381 372x54 (Δtop -30, Δbottom +0, Δcx +0) | 480,822 480x46 | 634,834 107x21 |
| salvation-n4-step | 391,314 659x56 | – | – | **!** 480,801 480x67 (Δtop -22, Δbottom +0, Δcx +0) | **!** 567,813 241x43 (Δtop -22, Δbottom +0, Δcx +0) |
| salvation-n4-nat20 | **!** 391,305 659x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 484,381 471x54 (Δtop -30, Δbottom +0, Δcx +0) | 480,822 480x46 | 634,834 107x21 |
| salvation-n4-hold | **!** 391,335 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 507,411 427x24 | 480,822 480x46 | 634,834 107x21 |
| salvation-n4-loss | **!** 391,335 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 533,411 374x24 | 480,822 480x46 | 634,834 107x21 |
| salvation-n4-nat1 | **!** 391,305 659x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 481,381 477x54 (Δtop -30, Δbottom +0, Δcx -0) | 480,822 480x46 | 634,834 107x21 |
| salvation-step-lucid | **!** 391,340 659x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | **!** 480,805 480x63 (Δtop -18, Δbottom +0, Δcx +0) | **!** 494,817 388x21 (Δtop -18, Δbottom -18, Δcx -0) |
| salvation-last-token | **!** 391,335 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 590,411 260x24 | 480,822 480x46 | 648,834 80x21 |
| salvation-n4-fatal | **!** 391,335 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 459,411 522x24 | 480,822 480x46 | 615,834 146x21 |
| stability-fatal | **!** 413,271 614x120 (Δtop -43, Δbottom +21, Δcx -0) | – | 459,411 522x24 | 480,822 480x46 | 615,834 146x21 |
| notice-return-king | **!** 413,243 614x120 (Δtop -71, Δbottom -6, Δcx -0) | – | – | 480,822 480x46 | 592,834 192x21 |
| notice-return-king-result | **!** 413,239 614x120 (Δtop -75, Δbottom -11, Δcx -0) | – | **!** 553,379 334x24 (Δtop -32, Δbottom -32, Δcx +0) | 480,822 480x46 | 634,834 107x21 |
| notice-skip-damage | **!** 391,282 659x56 (Δtop -32, Δbottom -32, Δcx -0) | – | – | **!** 480,801 480x67 (Δtop -22, Δbottom +0, Δcx +0) | **!** 567,813 241x43 (Δtop -22, Δbottom +0, Δcx +0) |
| keyboard-skip-link | **!** 468,340 505x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | 480,822 480x46 | 603,834 170x21 |
| keyboard-step-focus | **!** 468,340 505x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | 480,822 480x46 | 603,834 170x21 |
| autoplay-on | **!** 483,340 473x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | 480,822 480x46 | 603,834 170x21 |
| easy-round-start | **!** 483,340 473x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | 480,822 480x46 | 603,834 170x21 |
| salvation-e1-step | **!** 391,340 659x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | 480,822 480x46 | 494,834 386x21 |
| salvation-e1-nat20 | **!** 391,305 659x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 517,381 406x54 (Δtop -30, Δbottom +0, Δcx +0) | 480,822 480x46 | 634,834 107x21 |
| salvation-e1-hit | **!** 391,335 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 590,411 260x24 | 480,822 480x46 | 634,834 107x21 |
| salvation-e1-miss | **!** 391,335 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 537,411 367x24 | 480,822 480x46 | 634,834 107x21 |
| salvation-e1-nat1 | **!** 391,305 659x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 534,381 372x54 (Δtop -30, Δbottom +0, Δcx +0) | 480,822 480x46 | 634,834 107x21 |
| salvation-e2-step | **!** 391,340 659x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | 480,822 480x46 | 494,834 388x21 |
| salvation-e2-nat20 | **!** 391,305 659x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 517,381 406x54 (Δtop -30, Δbottom +0, Δcx +0) | 480,822 480x46 | 634,834 107x21 |
| salvation-e2-hit | **!** 391,335 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 590,411 260x24 | 480,822 480x46 | 634,834 107x21 |
| salvation-e2-miss | **!** 391,335 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 537,411 367x24 | 480,822 480x46 | 634,834 107x21 |
| salvation-e2-nat1 | **!** 391,305 659x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 534,381 372x54 (Δtop -30, Δbottom +0, Δcx +0) | 480,822 480x46 | 634,834 107x21 |
| salvation-e3-step | **!** 391,340 659x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | 480,822 480x46 | 496,834 384x21 |
| salvation-e3-nat20 | **!** 391,305 659x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 517,381 406x54 (Δtop -30, Δbottom +0, Δcx +0) | 480,822 480x46 | 634,834 107x21 |
| salvation-e3-hit | **!** 391,335 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 590,411 260x24 | 480,822 480x46 | 634,834 107x21 |
| salvation-e3-miss | **!** 391,335 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 537,411 367x24 | 480,822 480x46 | 634,834 107x21 |
| salvation-e3-nat1 | **!** 391,305 659x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 534,381 372x54 (Δtop -30, Δbottom +0, Δcx +0) | 480,822 480x46 | 634,834 107x21 |
| easy-final-check | **!** 413,185 614x185 (Δtop -129, Δbottom +0, Δcx -0) | – | – | **!** 480,801 480x67 (Δtop -22, Δbottom +0, Δcx +0) | **!** 530,813 317x43 (Δtop -22, Δbottom +0, Δcx +0) |
| easy-final-escape | **!** 413,206 614x185 (Δtop -108, Δbottom +21, Δcx -0) | – | 488,411 463x24 | 480,822 480x46 | 648,834 80x21 |
| easy-final-fatal | **!** 413,206 614x185 (Δtop -108, Δbottom +21, Δcx -0) | – | 459,411 522x24 | 480,822 480x46 | 615,834 146x21 |
| salvation-h1-step | **!** 391,340 659x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | 480,822 480x46 | 494,834 386x21 |
| salvation-hard-miss | **!** 391,335 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 530,411 381x24 | 480,822 480x46 | 634,834 107x21 |
| salvation-hard-nat1 | **!** 391,305 659x56 (Δtop -9, Δbottom -9, Δcx -0) | – | **!** 520,381 399x54 (Δtop -30, Δbottom +0, Δcx -0) | 480,822 480x46 | 634,834 107x21 |
| salvation-hard-over | **!** 391,335 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 523,411 394x24 | 480,822 480x46 | 634,834 107x21 |
| caption-odd | **!** 413,275 614x120 (Δtop -39, Δbottom +26, Δcx -0) | 510,173 420x57 | – | 480,822 480x46 | 592,834 192x21 |
| caption-king | **!** 391,340 659x56 (Δtop +26, Δbottom +26, Δcx -0) | **!** 510,266 420x57 (Δtop +93, Δbottom +93, Δcx +0) | – | 480,822 480x46 | 494,834 388x21 |
| caption-ace | **!** 468,340 505x56 (Δtop +26, Δbottom +26, Δcx -0) | **!** 512,286 416x38 (Δtop +113, Δbottom +93, Δcx +0) | – | 480,822 480x46 | 603,834 170x21 |
| caption-lucid | **!** 413,275 614x120 (Δtop -39, Δbottom +26, Δcx -0) | 510,173 420x57 | – | 480,822 480x46 | 592,834 192x21 |
| caption-surreal | **!** 391,340 659x56 (Δtop +26, Δbottom +26, Δcx -0) | **!** 510,266 420x57 (Δtop +93, Δbottom +93, Δcx +0) | – | 480,822 480x46 | 494,834 388x21 |
| caption-salvation | **!** 468,340 505x56 (Δtop +26, Δbottom +26, Δcx -0) | **!** 510,266 420x57 (Δtop +93, Δbottom +93, Δcx +0) | – | 480,822 480x46 | 603,834 170x21 |
| caption-hard-token | **!** 391,335 659x56 (Δtop +21, Δbottom +21, Δcx -0) | **!** 530,281 380x38 (Δtop +108, Δbottom +89, Δcx -0) | 530,411 381x24 | 480,822 480x46 | 634,834 107x21 |
| caption-easy-odd | **!** 413,275 614x120 (Δtop -39, Δbottom +26, Δcx -0) | 510,173 420x57 | – | 480,822 480x46 | 592,834 192x21 |
| caption-easy-salvation | **!** 391,340 659x56 (Δtop +26, Δbottom +26, Δcx -0) | **!** 510,266 420x57 (Δtop +93, Δbottom +93, Δcx +0) | – | 480,822 480x46 | 494,834 386x21 |
| caption-easy-ace-third | **!** 468,340 505x56 (Δtop +26, Δbottom +26, Δcx -0) | **!** 510,247 420x77 (Δtop +74, Δbottom +93, Δcx +0) | – | 480,822 480x46 | 603,834 170x21 |
| caption-easy-fourth-ace | **!** 413,250 614x185 (Δtop -64, Δbottom +65, Δcx -0) | **!** 510,148 420x57 (Δtop -25, Δbottom -25, Δcx +0) | – | **!** 480,801 480x67 (Δtop -22, Δbottom +0, Δcx +0) | **!** 530,813 317x43 (Δtop -22, Δbottom +0, Δcx +0) |
| rm-instability-roll | 356,314 729x56 | – | – | 480,822 480x46 | 572,834 231x21 |
| rm-static-roll | 356,314 729x56 | – | – | 480,822 480x46 | 634,834 107x21 |
| rm-instability-result | **!** 356,335 729x56 (Δtop +21, Δbottom +21, Δcx +0) | – | 579,411 282x24 | 480,822 480x46 | 634,834 107x21 |
| rm-round-start | **!** 483,340 473x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | 480,822 480x46 | 603,834 170x21 |
| rm-task-result | **!** 483,335 473x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 608,411 224x24 | 480,822 480x46 | 610,834 155x21 |
| rm-stability-check | **!** 413,275 614x120 (Δtop -39, Δbottom +26, Δcx -0) | – | – | 480,822 480x46 | 592,834 192x21 |
| rm-static-roll-after-resize | **!** 413,275 614x120 (Δtop -39, Δbottom +26, Δcx -0) | – | – | 480,822 480x46 | 634,834 107x21 |
| rm-stability-result | **!** 413,271 614x120 (Δtop -43, Δbottom +21, Δcx -0) | – | 579,411 282x24 | 480,822 480x46 | 634,834 107x21 |
| rm-salvation-step | **!** 391,340 659x56 (Δtop +26, Δbottom +26, Δcx -0) | – | – | 480,822 480x46 | 494,834 388x21 |
| rm-salvation-hit | **!** 391,335 659x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 590,411 260x24 | 480,822 480x46 | 634,834 107x21 |
| rm-result-hold | **!** 483,335 473x56 (Δtop +21, Δbottom +21, Δcx -0) | – | 602,411 237x24 | 480,822 480x46 | 610,834 156x21 |
| **max delta** | Δtop 154 · Δbottom 97 · Δcx 0 · Δw 256 · Δh 129 | Δtop 138 · Δbottom 118 · Δcx 0 · Δw 40 · Δh 39 | Δtop 32 · Δbottom 32 · Δcx 0 · Δw 299 · Δh 30 | Δtop 22 · Δbottom 0 · Δcx 0 · Δw 0 · Δh 22 | Δtop 22 · Δbottom 18 · Δcx 0 · Δw 308 · Δh 22 |

Reference states: screen title = instability-roll, rule caption = caption-odd, result line = instability-result, step button = instability-roll, step label = instability-roll

Flagged shifts over 2px at desktop: 139

- instability-result: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x +0.0, Δheight +0.0
- round-start: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- task-result: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- stability-check: screen title Δtop -38.8, Δbottom +25.6, Δcentre-x -0.0, Δheight +64.4
- stability-rolling: screen title Δtop -38.8, Δbottom +25.6, Δcentre-x -0.0, Δheight +64.4
- stability-11-19: screen title Δtop -43.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +64.4
- stability-check-ace: screen title Δtop -38.8, Δbottom +25.6, Δcentre-x -0.0, Δheight +64.4
- stability-6-10: screen title Δtop -43.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +64.4
- stability-2-5: screen title Δtop -43.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +64.4
- salvation-n2-step: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- salvation-n2-miss: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- round-start-r2: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- task-result-nat1: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- task-result-nat1: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- round-start-surreal: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- round-start-surreal: step button Δtop -17.6, Δbottom +0.0, Δcentre-x +0.0, Δheight +17.6
- round-start-surreal: step label Δtop -17.6, Δbottom -17.6, Δcentre-x +0.0, Δheight +0.0
- task-result-nat20: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- task-result-nat20: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- round-start-lucid: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- round-start-lucid: step button Δtop -17.6, Δbottom +0.0, Δcentre-x +0.0, Δheight +17.6
- round-start-lucid: step label Δtop -17.6, Δbottom -17.6, Δcentre-x +0.0, Δheight +0.0
- stability-nat1: screen title Δtop -73.2, Δbottom -8.8, Δcentre-x -0.0, Δheight +64.4
- stability-nat1: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- stability-check-surreal: screen title Δtop -38.8, Δbottom +25.6, Δcentre-x -0.0, Δheight +64.4
- stability-check-surreal: step button Δtop -17.6, Δbottom +0.0, Δcentre-x +0.0, Δheight +17.6
- stability-check-surreal: step label Δtop -17.6, Δbottom -17.6, Δcentre-x -0.0, Δheight +0.0
- stability-2d20-surreal: screen title Δtop -43.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +64.4
- stability-nat20: screen title Δtop -73.2, Δbottom -8.8, Δcentre-x -0.0, Δheight +64.4
- stability-nat20: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- stability-check-lucid: screen title Δtop -38.8, Δbottom +25.6, Δcentre-x -0.0, Δheight +64.4
- stability-check-lucid: step button Δtop -17.6, Δbottom +0.0, Δcentre-x +0.0, Δheight +17.6
- stability-check-lucid: step label Δtop -17.6, Δbottom -17.6, Δcentre-x -0.0, Δheight +0.0
- stability-2d20-lucid: screen title Δtop -43.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +64.4
- result-hold: screen title Δtop -43.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +64.4
- salvation-n1-step: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- salvation-n1-nat20: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- salvation-n1-nat20: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- salvation-n1-hit: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- salvation-n1-miss: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- salvation-n1-nat1: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- salvation-n1-nat1: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- salvation-n2-nat20: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- salvation-n2-nat20: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- salvation-n2-hit: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- salvation-n2-nat1: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- salvation-n2-nat1: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- salvation-n3-step: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- salvation-n3-nat20: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- salvation-n3-nat20: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- salvation-n3-hit: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- salvation-n3-miss: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- salvation-n3-nat1: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- salvation-n3-nat1: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- salvation-n4-step: step button Δtop -21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight +21.6
- salvation-n4-step: step label Δtop -21.6, Δbottom +0.0, Δcentre-x +0.1, Δheight +21.6
- salvation-n4-nat20: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- salvation-n4-nat20: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- salvation-n4-hold: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- salvation-n4-loss: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- salvation-n4-nat1: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- salvation-n4-nat1: result line Δtop -30.0, Δbottom +0.0, Δcentre-x -0.0, Δheight +30.0
- salvation-step-lucid: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- salvation-step-lucid: step button Δtop -17.6, Δbottom +0.0, Δcentre-x +0.0, Δheight +17.6
- salvation-step-lucid: step label Δtop -17.6, Δbottom -17.6, Δcentre-x -0.0, Δheight +0.0
- salvation-last-token: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- salvation-n4-fatal: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- stability-fatal: screen title Δtop -43.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +64.4
- notice-return-king: screen title Δtop -70.8, Δbottom -6.4, Δcentre-x -0.0, Δheight +64.4
- notice-return-king-result: screen title Δtop -75.2, Δbottom -10.8, Δcentre-x -0.0, Δheight +64.4
- notice-return-king-result: result line Δtop -32.0, Δbottom -32.0, Δcentre-x +0.0, Δheight +0.0
- notice-skip-damage: screen title Δtop -32.0, Δbottom -32.0, Δcentre-x -0.0, Δheight +0.0
- notice-skip-damage: step button Δtop -21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight +21.6
- notice-skip-damage: step label Δtop -21.6, Δbottom +0.0, Δcentre-x +0.1, Δheight +21.6
- keyboard-skip-link: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- keyboard-step-focus: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- autoplay-on: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- easy-round-start: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- salvation-e1-step: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- salvation-e1-nat20: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- salvation-e1-nat20: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- salvation-e1-hit: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- salvation-e1-miss: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- salvation-e1-nat1: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- salvation-e1-nat1: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- salvation-e2-step: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- salvation-e2-nat20: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- salvation-e2-nat20: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- salvation-e2-hit: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- salvation-e2-miss: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- salvation-e2-nat1: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- salvation-e2-nat1: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- salvation-e3-step: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- salvation-e3-nat20: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- salvation-e3-nat20: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- salvation-e3-hit: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- salvation-e3-miss: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- salvation-e3-nat1: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- salvation-e3-nat1: result line Δtop -30.0, Δbottom +0.0, Δcentre-x +0.0, Δheight +30.0
- easy-final-check: screen title Δtop -128.7, Δbottom +0.1, Δcentre-x -0.0, Δheight +128.8
- easy-final-check: step button Δtop -21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight +21.6
- easy-final-check: step label Δtop -21.6, Δbottom +0.0, Δcentre-x +0.1, Δheight +21.6
- easy-final-escape: screen title Δtop -107.6, Δbottom +21.2, Δcentre-x -0.0, Δheight +128.8
- easy-final-fatal: screen title Δtop -107.6, Δbottom +21.2, Δcentre-x -0.0, Δheight +128.8
- salvation-h1-step: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- salvation-hard-miss: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- salvation-hard-nat1: screen title Δtop -8.8, Δbottom -8.8, Δcentre-x -0.0, Δheight +0.0
- salvation-hard-nat1: result line Δtop -30.0, Δbottom +0.0, Δcentre-x -0.0, Δheight +30.0
- salvation-hard-over: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- caption-odd: screen title Δtop -38.8, Δbottom +25.6, Δcentre-x -0.0, Δheight +64.4
- caption-king: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- caption-king: rule caption Δtop +93.4, Δbottom +93.4, Δcentre-x +0.0, Δheight +0.0
- caption-ace: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- caption-ace: rule caption Δtop +112.8, Δbottom +93.4, Δcentre-x +0.0, Δheight -19.4
- caption-lucid: screen title Δtop -38.8, Δbottom +25.6, Δcentre-x -0.0, Δheight +64.4
- caption-surreal: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- caption-surreal: rule caption Δtop +93.4, Δbottom +93.4, Δcentre-x +0.0, Δheight +0.0
- caption-salvation: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- caption-salvation: rule caption Δtop +93.4, Δbottom +93.4, Δcentre-x +0.0, Δheight +0.0
- caption-hard-token: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- caption-hard-token: rule caption Δtop +108.4, Δbottom +89.0, Δcentre-x -0.0, Δheight -19.4
- caption-easy-odd: screen title Δtop -38.8, Δbottom +25.6, Δcentre-x -0.0, Δheight +64.4
- caption-easy-salvation: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- caption-easy-salvation: rule caption Δtop +93.4, Δbottom +93.4, Δcentre-x +0.0, Δheight +0.0
- caption-easy-ace-third: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- caption-easy-ace-third: rule caption Δtop +73.8, Δbottom +93.4, Δcentre-x +0.0, Δheight +19.6
- caption-easy-fourth-ace: screen title Δtop -63.8, Δbottom +65.0, Δcentre-x -0.0, Δheight +128.8
- caption-easy-fourth-ace: rule caption Δtop -25.0, Δbottom -25.0, Δcentre-x +0.0, Δheight +0.0
- caption-easy-fourth-ace: step button Δtop -21.6, Δbottom +0.0, Δcentre-x +0.0, Δheight +21.6
- caption-easy-fourth-ace: step label Δtop -21.6, Δbottom +0.0, Δcentre-x +0.1, Δheight +21.6
- rm-instability-result: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x +0.0, Δheight +0.0
- rm-round-start: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- rm-task-result: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- rm-stability-check: screen title Δtop -38.8, Δbottom +25.6, Δcentre-x -0.0, Δheight +64.4
- rm-static-roll-after-resize: screen title Δtop -38.8, Δbottom +25.6, Δcentre-x -0.0, Δheight +64.4
- rm-stability-result: screen title Δtop -43.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +64.4
- rm-salvation-step: screen title Δtop +25.6, Δbottom +25.6, Δcentre-x -0.0, Δheight +0.0
- rm-salvation-hit: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0
- rm-result-hold: screen title Δtop +21.2, Δbottom +21.2, Δcentre-x -0.0, Δheight +0.0

