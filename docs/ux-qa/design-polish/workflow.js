export const meta = {
  name: 'design-polish-v3',
  description: 'Tight design-polish loop on PR #52: owner items built while round 1 is verified, fixes pushed as they build, sign-off on key states',
  whenToUse: 'Finishing the DC Solo RPG design polish after round 1',
  phases: [
    { title: 'Build and verify', detail: 'Owner-items developer alongside two combined verifiers' },
    { title: 'Fix', detail: 'Board and surfaces developers; each pushes as soon as it builds' },
    { title: 'QA and capture', detail: 'Full checks, fix-forward, alongside a key-state capture' },
    { title: 'Sign-off', detail: 'Two combined reviewers, four lenses, on the key states' },
  ],
}

const REPO = '/home/user/dc-solo-rpg'
const BRANCH = 'claude/vibrant-curie-w9bn88'
const SP = '/tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad'
const DR = SP + '/design-review'
const TOOLS = DR + '/tools'
const LEDGER = DR + '/ledger-r1.json'
const OWNER_SHOTS = DR + '/owner'
const R2 = DR + '/round-2'
const ARCHIVE = 'docs/ux-qa/design-polish'
const BRIEF = SP + '/ux-fix/BRIEF.md'
const MAX_SIGNOFFS = 3
const TRAILER = 'Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01LRucPctvQBb3dHaC2jbeyn'

const OWNER_ASK = `dispatch a team of game design and visual design experts to do a design review that focuses on text and action positioning. there are some areas in the app that the text is cluttered, redundant, shifts positions depending on game state, and generally feels unpolished. we should also change the font of all numbers in the tiles to use the LED style numbers and make the tiles all use the same progressive styling like the kings tile so that the background slightly shifts to an appropriate color and the tiles values change. this review should be focused on the nits and minor details for the most part and is not meant to be an overhaul but perfecting the design by putting the final touches on things like text and typography fixes, consistent text positioning and useful copy and ensuring the design on common screen sizes. ensure they are highly critical and apply industry best practices and tools to their reviews. have a developer agent field all of the findings and make the changes on a new draft PR. then send the results back to the review team. do this alliteratively until all review agents approve every detail of the design`

const OWNER_ITEMS = [
  {
    id: 'OWN-3', lens: 'layout', area: 'play',
    text: `OWN-3 (owner requirement): "On small devices the top toolbar should be displayed at the bottom under the roll button." The toolbar is the in-game header bar (Exit, Help, the game title, the round, the more menu). On phones in portrait (up to 600px wide) it sits under the step button, clear of the browser's bottom bar and the home-indicator safe area; the HUD row stays at the top. For landscape phones, decide whether it moves too and say why. Owner's screenshot (header circled, arrow to the space under the roll button): ${OWNER_SHOTS}/toolbar-to-bottom.jpg`,
  },
  {
    id: 'OWN-4', lens: 'game', area: 'play',
    text: `OWN-4 (owner requirement): "The text in the center of the game board is cluttered, and somewhat meaningless and unsettled. This text needs to appear to be more integrated with the game board." In the owner's screenshot (${OWNER_SHOTS}/board-centre-text.jpg, a Normal game on a phone) the circled block is the card line ("A♠ · A second chance manifests from the darkness"), the screen title ("STABILITY CHECK"), the description ("An odd card demands a price. 10 or less costs Stability.") and the notice ("No King was out to return"), with the RULE caption below. Make it settled (nothing jumps or reflows between states), uncluttered (only what helps the player act now; never a statement of a non-event such as "No King was out to return"; no line that repeats another), meaningful, and part of the board's visual language, not loose text floating over the grid. It must work at every core viewport. The visual lens judges its visual execution too.`,
  },
  {
    id: 'OWN-5', lens: 'layout', area: 'play',
    text: `OWN-5 (owner report): the card line above the screen title is cut off at the left edge on a phone: "A♠ · A second chance manifests from the darkness" loses its "A" (${OWNER_SHOTS}/board-centre-text.jpg). No text in the board's centre may be clipped at any core viewport: long lines wrap cleanly or are shortened.`,
  },
]

// Added by the owner while stage 1 ran; a separate developer builds them, and they join the sign-off
const LATE_ITEMS = [
  { id: 'OWN-6', lens: 'game', area: 'global', text: 'OWN-6 (owner requirement): "The dice fade animation is too fast." After a roll lands the dice sank and faded over 350ms (DICE_SINK). It must be a calm, readable sink and fade: the player sees the dice settle and leave rather than blink out; the HUD, title and result line are never covered; reduced motion stays a short plain fade. Judge it by measuring: read the token and record a roll (video or frame sheet). A separate developer is building this item. If origin/claude/vibrant-curie-w9bn88 has no commit citing it yet (git fetch, then git log --grep), wait for one before you verify it: check every minute for up to 60 minutes with a Monitor until-loop, and only then judge it.' },
  { id: 'OWN-7', lens: 'game', area: 'play', text: 'OWN-7 (owner requirement): "The time before a card is drawn is too fast." After a card was dismissed the next was drawn 100ms later (NEXT_DRAW_MS in CardDeck), so cards arrived on top of each other. Each draw needs a deliberate beat on the empty table so every card lands as its own moment, consistent for the first card of a round, later cards and auto-play; a tap or Space during the beat is never lost and never draws twice. Judge it by measuring: read the tokens and record two draws. A separate developer is building this item. If origin/claude/vibrant-curie-w9bn88 has no commit citing it yet (git fetch, then git log --grep), wait for one before you verify it: check every minute for up to 60 minutes with a Monitor until-loop, and only then judge it.' },
]

const CONTEXT = `## Context
You are on a design-polish team for DC Solo RPG ("Dream Console" by Dimm City), a SvelteKit 2 / Svelte 5 solo journaling game. Repo: ${REPO}. Branch: ${BRANCH}. Draft PR: https://github.com/dimm-city/dc-solo-rpg/pull/52 (the owner tests it on their phone through the PR's preview site, which rebuilds on every push). CLAUDE.md (in your context) has the rules and architecture.

The owner's original request: "${OWNER_ASK}"

Polish, not an overhaul: text and typography, consistent text and action positioning across game states, clutter and redundant copy, useful copy, fit on common screen sizes. Round 1 is done and pushed: 86 findings from four expert lenses (game UX, visual and typography, UX writing, layout and responsive) became 26 work items, all built. Every finding, its acceptance criteria and the work done on it are in ${LEDGER} (read it with python or jq; it is large). The full round-1 reviews are in ${DR}/round-1/review-*.md. The owner then added, from their phone:
${OWNER_ITEMS.map((o) => '- ' + o.text).join('\n')}

Owner decisions that stand (never reopen): the "Owner decisions" section of ${BRIEF}; the rules in CLAUDE.md; the decisions under "Owner playtest round" and "Playtest follow-ups" in ${REPO}/docs/ux-qa/ux-qa-review.md (journal autofocus desktop only, lixdu as the large board font, the HUD as one mirrored row Stability, Kings | Roll, Cards | Aces, Tokens, the dice thrown on top of everything then sinking).

Environment: 4 shared CPUs; stop every server you start. Chromium: /opt/pw-browsers/chromium with args ['--no-sandbox','--headless=new','--use-angle=swiftshader']; never run "playwright install". On a dev server, page.evaluate can import '/src/lib/stores/gameStore.svelte.js' (gameState) and '/src/lib/services/random.js' (mockDieRoll, mockDieRollSequence, resetRNG). localStorage 'dc-solo-rpg:instructions-seen' = 'true' skips the splash. Capture scripts: ${TOOLS}/board and ${TOOLS}/surfaces (they take a state filter and a viewport list; read their headers). Captures of the round-1 fixes (at 31e689a) for every state at every viewport: ${R2}/shots/<group>/<state>/<viewport>.png, with manifests, metrics and the board drift table in ${R2}/. Scratch output goes under ${DR}/v3/.`

const LENSES = {
  game: { title: 'Game UX designer', skills: 'vectorlab-ux-skills:ux-audit, vectorlab-ux-skills:verbs', focus: 'play as information design: what the player needs at each step, in a stable place, in the right order; no fact said twice on one screen; clear, quiet feedback for every outcome; HUD tiers that mean something; copy that teaches the rules exactly (CLAUDE.md, per difficulty); endings, journal and story as moments in the arc (Hodent\'s game UX pillars, Nielsen\'s heuristics)' },
  visual: { title: 'Visual and typography designer', skills: 'vectorlab-ux-skills:typography, vectorlab-ux-skills:spacing, vectorlab-ux-skills:colour-palette, vectorlab-ux-skills:anti-slop', focus: 'type scale and weights, font roles (lixdu large titles only, Inter, DSEG7 LED for HUD numbers), optical and baseline alignment, 4/8pt rhythm, colour (60-30-10, danger red only for danger, subtle tile tiers), WCAG 2.2 AA contrast, balanced wraps, nothing unfinished' },
  copy: { title: 'UX writer and content designer', skills: 'vectorlab-ux-skills:verbs, vectorlab-ux-skills:labels, vectorlab-ux-skills:errors, vectorlab-ux-skills:empty-states', focus: 'every word on every screen: each line earns its place, verb-first specific labels, one name per thing, consistent case and punctuation, numbers that match the HUD and rules, useful empty and error states, screen-reader text that matches what is shown (Microsoft, Google and Mailchimp style guides)' },
  layout: { title: 'Layout and responsive specialist', skills: 'vectorlab-ux-skills:viewports, vectorlab-ux-skills:spacing, vectorlab-ux-skills:surfaces, vectorlab-ux-skills:keyboard', focus: 'positions that hold between game states (over 2px of drift is a finding), the primary action in one slot within thumb reach, safe areas, landscape phones, tablets, the HUD at 360px, modal sizing and scroll, overflow and clipping, 44px targets, 45-75ch reading lines, z-order, focus order; measure, don\'t eyeball' },
}
const PAIRS = [
  { key: 'game-copy', lenses: ['game', 'copy'] },
  { key: 'visual-layout', lenses: ['visual', 'layout'] },
]
const DEV_AREAS = {
  board: { areas: ['hud', 'play', 'global'], port: 5201, files: 'src/lib/components/status/*, GameScreen.svelte, src/lib/components/game/*, RuleCaption, ContinueButton, AugmentedButton, ButtonBar, KeyboardHint, StatusDisplay, Game.svelte, src/lib/composables/screen/*, useRuleCaptions, useAutoPlay, src/lib/utils/rollResult.js, src/styles.css, src/lib/constants/animations.js, src/routes/+layout.svelte, src/app.html' },
  surfaces: { areas: ['overlays', 'pages', 'story'], port: 5202, files: 'src/lib/components/card/*, CardDeck, DrawCard, OverlayModal, ContentModal, ConfirmModal, JournalEntry, src/lib/components/journal/*, GameOver, RunRecap, DiceThemePicker, HelpModal, GameGuide, AboutModal, AboutContent, SettingsModal, src/lib/components/settings/*, Splash, GameSelector, src/lib/components/home/*, StaticPage, ErrorScreen, LoadScreen, SignIn, src/routes/**/+page.svelte and +error.svelte, StoryMode, StoryRound, src/lib/components/story/*, BrowseGames, src/lib/components/browse/*' },
}
const KEY_STATES = {
  board: 'intro, round-start, task-result, card-event, card-challenge, card-king, card-ace-hearts, notice-return-king, stability-check, stability-check-surreal, stability-nat1, stability-6-10, stability-nat20, salvation-n1-step, salvation-n2-miss, salvation-n4-step, salvation-n4-fatal, easy-final-check, caption-odd, result-hold, header-menu, game-over-win, game-over-kings, game-over-stability, hud-all-best, hud-all-worst, hud-stability-4, hud-kings-3, rm-static-roll',
  surfaces: 'home-first-visit, home-return, card-event-short, card-failure-counter, card-primary-success-long, journal-entry, final-log-writing, final-log-timeline, gameover-win-tokens, gameover-loss-kings, settings-game, help-game, exit-confirm-game, library-stories, story-round-1, page-about',
}
const KEY_VIEWPORTS = 'android-small 360x640, iphone-13 390x844, iphone-13-landscape 844x390, desktop 1440x900'

const PUBLISH = (br) => `Publishing (the owner watches the preview, so finished work goes up at once): when an item or tight group is done, commit it, then: git fetch origin ${BRANCH} && git merge --no-edit origin/${BRANCH} (in your worktree, on ${br}); if the merge brought in changes, rerun npx vitest run and npm run build; then git push origin HEAD:${BRANCH}. That is a fast-forward of the PR branch; never force. If the push is rejected because someone else pushed first, fetch, merge, test and push again. Push after each item or group, not only at the end.`

const WORKTREE = (name, br) => `Setup: cd ${REPO} && git fetch origin ${BRANCH} && git worktree add /home/user/dc-solo-rpg-wt/${name} -b ${br} origin/${BRANCH} && cp -al ${REPO}/node_modules /home/user/dc-solo-rpg-wt/${name}/node_modules && cd /home/user/dc-solo-rpg-wt/${name} && npm run -s generate:games-index && npx svelte-kit sync. If that worktree or branch exists from an earlier attempt, continue from it when it holds your commits; otherwise remove it (only it) and recreate it.`

const DEV_RULES = (files) => `Rules: edit only ${files}, unless an item truly needs more (then keep it minimal and list it in touchedOutside). Svelte 5 runes, the animation tokens, prefers-reduced-motion, the existing style; prefer removing to adding; no new dependencies. Every logic change gets a Vitest test. Update e2e specs whose assertions your change legitimately changes; never skip or weaken a test. Commit messages cite the item ids and end with:
${TRAILER}
Before each push: npx vitest run and npm run build pass. Before you report: npx eslint ., npx prettier --check . and npm run check also pass, and the Playwright specs your change touches pass (copy ${SP}/e2e/pw.override.config.mjs into ${DR}/v3/ and point testDir, webServer {command 'npx vite dev --port <port> --strictPort', port, cwd: your worktree, reuseExistingServer: false} and use.baseURL at your worktree). Look at your work: screenshots of what you changed at ${KEY_VIEWPORTS} (the capture scripts can do it against your dev server), viewed and fixed. Stop every server you start; leave the worktree clean.`

const STR = { type: 'string' }
const STRS = { type: 'array', items: STR }
const AREA = { type: 'string', enum: ['hud', 'play', 'global', 'overlays', 'pages', 'story'] }
const LENS = { type: 'string', enum: ['game', 'visual', 'copy', 'layout'] }
const FINDING = {
  type: 'object',
  properties: { id: STR, lens: LENS, area: AREA, severity: { type: 'string', enum: ['high', 'medium', 'low'] }, surface: STR, viewports: STRS, issue: STR, evidence: STR, recommendation: STR, acceptance: STR, files: STRS },
  required: ['id', 'lens', 'area', 'severity', 'surface', 'issue', 'evidence', 'recommendation', 'acceptance'],
}
const VERDICTS = {
  type: 'array',
  items: { type: 'object', properties: { id: STR, status: { type: 'string', enum: ['resolved', 'open', 'regressed', 'withdrawn'] }, note: STR }, required: ['id', 'status', 'note'] },
}
const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    summary: STR,
    approve: { type: 'object', properties: { game: { type: 'boolean' }, visual: { type: 'boolean' }, copy: { type: 'boolean' }, layout: { type: 'boolean' } } },
    verdicts: VERDICTS,
    findings: { type: 'array', items: FINDING },
  },
  required: ['summary', 'approve', 'verdicts', 'findings'],
}
const DEV_SCHEMA = {
  type: 'object',
  properties: {
    branch: STR, pushedHead: STR,
    items: { type: 'array', items: { type: 'object', properties: { id: STR, status: { type: 'string', enum: ['done', 'partial', 'not-done'] }, change: STR }, required: ['id', 'status', 'change'] } },
    specs: { type: 'array', items: { type: 'object', properties: { id: STR, spec: STR }, required: ['id', 'spec'] } },
    commits: STRS, touchedOutside: STRS, verification: STR, screenshots: STR, notes: STR,
  },
  required: ['branch', 'pushedHead', 'items', 'commits', 'verification', 'notes'],
}
const QA_SCHEMA = { type: 'object', properties: { head: STR, pushed: { type: 'boolean' }, checks: STR, fixes: STRS, notes: STR }, required: ['head', 'pushed', 'checks', 'notes'] }
const CAPTURE_SCHEMA = { type: 'object', properties: { head: STR, dir: STR, manifest: STR, drift: STR, shots: { type: 'number' }, missing: STRS, notes: STR }, required: ['head', 'dir', 'manifest', 'shots', 'missing', 'notes'] }

// ---------- state ----------
const status = {}
const lensOf = {}
const areaOf = { ...(args.areaById || {}) }
const notes = {}
const details = {}
for (const [lens, ids] of Object.entries(args.tracked)) for (const id of ids) { lensOf[id] = lens; status[id] = 'built' }
status['LR-1-16'] = 'declined'
for (const o of OWNER_ITEMS) { lensOf[o.id] = o.lens; areaOf[o.id] = o.area; status[o.id] = 'open'; details[o.id] = o.text }
const signedOff = {}
const history = []
let newSeq = 0

const applyReview = (r, lenses, stage, allowed) => {
  if (!r) { log(`${stage}: a review failed`); return }
  for (const v of r.verdicts || []) {
    if (!lensOf[v.id] || !lenses.includes(lensOf[v.id]) || !allowed.includes(v.id)) continue
    status[v.id] = v.status
    notes[v.id] = v.note
  }
  for (const f of r.findings || []) {
    let id = f.id || `X-${++newSeq}`
    while (status[id]) id = id + 'b'
    lensOf[id] = lenses.includes(f.lens) ? f.lens : lenses[0]
    areaOf[id] = f.area
    status[id] = 'open'
    details[id] = `${f.severity} · ${f.surface} · ${f.issue} | evidence: ${f.evidence} | fix: ${f.recommendation} | acceptance: ${f.acceptance}`
  }
}
const openIds = () => Object.keys(status).filter((id) => ['open', 'regressed'].includes(status[id]))
const itemFor = (id) => ({ id, lens: lensOf[id], area: areaOf[id] || 'play', status: status[id], whatIsWrong: notes[id] || null, detail: details[id] || `round-1 finding ${id}: see ${LEDGER}` })
const counts = () => Object.values(status).reduce((m, s) => ({ ...m, [s]: (m[s] || 0) + 1 }), {})

// ---------- prompts ----------
const reviewPrompt = (pair, stage, capsText, ids) => `${CONTEXT}

## Your role: ${pair.lenses.map((l) => LENSES[l].title).join(' and ')}
You hold two expert lenses at once and apply both fully:
${pair.lenses.map((l) => `- ${LENSES[l].title}: ${LENSES[l].focus}. Load and apply: ${LENSES[l].skills}.`).join('\n')}
Be highly critical (this takes the game to award-winning), but every finding must be a real defect you can show (a screenshot path, a measurement, a file:line), within the polish scope, and not one defensible taste swapped for another.

${stage === 'verify'
    ? `## Task: verify round 1 (fast and exact)
For each item below, check the built result against its acceptance criteria (in ${LEDGER}) using the captures of the round-1 fixes in ${R2} (open the shots for the states and viewports the finding names; use metrics and the drift table to measure) and the code at origin/${BRANCH}. Verdict per id: resolved, open (say exactly what is still wrong and what would satisfy you), regressed, or withdrawn (say why). Then report new defects the round-1 fixes introduced, through your lenses, as findings (ids ${pair.key}-v-NN, with lens and area). Do not review the board's centre text column or the in-game header position: a developer is rebuilding both right now for OWN-3, OWN-4 and OWN-5, and you will judge them at sign-off. Set approve to false for both lenses (sign-off comes later). Time matters: verify, don't re-audit.`
    : `## Task: sign-off
The latest work is pushed (git -C ${REPO} log --oneline -15). Captures of the key states at ${KEY_VIEWPORTS}:
${capsText}
1. Verdict every item below (your lenses' open, built or owner items) against its acceptance criteria and the owner's words: resolved, open, regressed or withdrawn, with a note. For an owner item (OWN-n), the bar is the owner's own words and screenshots in ${OWNER_SHOTS}. OWN-6 and OWN-7 are timing: verify them by reading the tokens in src/lib/constants/animations.js and recording a roll and two card draws on an iPhone 13 viewport (a video or frame sheet into ${DR}/v3/), not from stills.
2. Review every key state at every captured viewport through both lenses, as thoroughly as round 1, and report anything still short of award-winning as findings (ids ${pair.key}-s-NN, with lens and area).
3. approve.<lens> = true only if that lens has no open or regressed item and no new finding, and you would sign off on every detail it covers.`}

Items to verdict (id, lens, area, status, the last note on it, and the detail; round-1 detail is in ${LEDGER}):
${JSON.stringify(ids.map(itemFor), null, 1)}

Write your review as markdown to ${DR}/v3/${stage}-${pair.key}.md as you go, so it survives a restart.`

const devPrompt = (name, area, items, extra) => `${CONTEXT}

## Your role: developer (${name})
Build every item below completely, to the bar of an award-winning game, so the reviewers accept it first time. Each item says what is wrong and what will satisfy the reviewer; round-1 items' full findings and acceptance criteria are in ${LEDGER}.
${extra || ''}
Items:
${JSON.stringify(items, null, 1)}

${WORKTREE(`v3-${name}`, `design/v3-${name}`)}
${DEV_RULES(area.files)}
${PUBLISH(`design/v3-${name}`)}

Report each item as done, partial or not-done with what changed; your commits; the head you last pushed (pushedHead); touchedOutside; verification results; the screenshot folder.`

const ownerDevPrompt = () => devPrompt('owner-items', DEV_AREAS.board, OWNER_ITEMS.map((o) => ({ id: o.id, detail: o.text })),
  `These are the owner's own requirements, from their phone. Open both screenshots in ${OWNER_SHOTS} first. You are also the designer for them: write the spec for each (exact positions, sizes, copy, behaviour per viewport) before you build, return it in specs, and put it at the top of ${DR}/v3/owner-items-spec.md. For OWN-4, read the round-1 game, visual and layout reviews in ${DR}/round-1/ on the board column (GD-1-03, GD-1-05, LR-1-01, VT-1-04) and the current ContextBackground/GameScreen code; the answer is a settled, composed board element with one job per line, not more text. Phones first: the owner plays on a phone.`)

const qaPrompt = (stage) => `${CONTEXT}

## Your role: QA and integration (${stage})
The developers pushed their work to ${BRANCH}. In the main checkout ${REPO}: git checkout ${BRANCH} && git pull --ff-only (it must be clean). Run npx svelte-kit sync, npx vitest run, npx eslint ., npx prettier --check ., npm run check (0 errors), npm run build, then the full Playwright suite (npm run -s generate:games-index if needed; nothing else on port 5173; npx playwright test --config ${SP}/e2e/pw.override.config.mjs --reporter=list in the background, about 10 minutes). Fix every failure at its root and push each fix as soon as it passes (fast-forward; never force; if rejected, pull and retry). Never skip or weaken a test. Commits end with:
${TRAILER}
Then remove the developers' worktrees under /home/user/dc-solo-rpg-wt/v3-* once their commits are on origin/${BRANCH} (git worktree remove --force, then git branch -D their design/v3-* branches). Save the review files: copy ${DR}/v3/*.md into ${REPO}/${ARCHIVE}/v3/, and add a short "### ${stage}" subsection under "## Design polish review (2026-11-07)" in docs/ux-qa/ux-qa-review.md (what was verified, built and found, in short plain sentences). Commit and push. Report the head, whether it pushed, the check results and the fixes.`

const capturePrompt = (stage) => `${CONTEXT}

## Your role: key-state capture (${stage})
Capture the key states of the latest pushed code, fast, for the sign-off reviewers. Use your own worktree so other agents can't disturb the server: cd ${REPO} && git fetch origin ${BRANCH} && git worktree add --detach /home/user/dc-solo-rpg-wt/capture-${stage} origin/${BRANCH} && cp -al ${REPO}/node_modules /home/user/dc-solo-rpg-wt/capture-${stage}/node_modules && cd /home/user/dc-solo-rpg-wt/capture-${stage} && npm run -s generate:games-index && npx svelte-kit sync; then one dev server there (npx vite dev --port 5191 --strictPort, in the background).
States: board: ${KEY_STATES.board}. Surfaces: ${KEY_STATES.surfaces}. Viewports: ${KEY_VIEWPORTS}. Use the existing scripts in ${TOOLS} with their state and viewport filters (fix any step the UI changes broke; the in-game toolbar may now sit at the bottom on phones). Output: ${DR}/v3/${stage}/shots/<state>/<viewport>.png, one contact sheet per state in ${DR}/v3/${stage}/sheets/, a manifest ${DR}/v3/${stage}/manifest.md, and a drift table ${DR}/v3/${stage}/drift.md (where the toolbar, title, caption, result line and step button sit in each board state, per viewport, max delta per element). When done, stop the server and remove the worktree (git worktree remove --force). Report the head you captured, paths, the shot count and anything missing.`

// ---------- the run ----------
phase('Build and verify')
const ownerP = agent(ownerDevPrompt(), { label: 'dev:owner-items', phase: 'Build and verify', schema: DEV_SCHEMA, effort: 'high' })
const verifs = []
for (const pair of PAIRS) {
  const ids = Object.keys(status).filter((id) => pair.lenses.includes(lensOf[id]) && status[id] === 'built')
  const r = await agent(reviewPrompt(pair, 'verify', '', ids), { label: `verify:${pair.key}`, phase: 'Build and verify', schema: REVIEW_SCHEMA, effort: 'high' })
  applyReview(r, pair.lenses, `verify ${pair.key}`, ids)
  verifs.push(r)
}
log(`Round 1 verified: ${JSON.stringify(counts())}`)
history.push({ stage: 'verify', counts: counts() })

let stage = 1
let ownerDev = null
for (;;) {
  // Fix: surfaces work starts as soon as it is known; board work waits for the owner-items developer (same files)
  phase('Fix')
  const open = openIds().filter((id) => !(stage === 1 && id.startsWith('OWN-')))
  const forArea = (key) => open.filter((id) => DEV_AREAS[key].areas.includes(areaOf[id] || 'play')).map(itemFor)
  const surfaceItems = forArea('surfaces')
  const surfacesP = surfaceItems.length ? agent(devPrompt(`surfaces-${stage}`, DEV_AREAS.surfaces, surfaceItems), { label: `dev:surfaces:${stage}`, phase: 'Fix', schema: DEV_SCHEMA, effort: 'high' }) : Promise.resolve(null)
  if (stage === 1) {
    ownerDev = await ownerP
    for (const it of (ownerDev && ownerDev.items) || []) if (it.status === 'done') status[it.id] = 'built'
    for (const s of (ownerDev && ownerDev.specs) || []) details[s.id] = `${details[s.id]}\nThe developer's spec: ${s.spec}`
    log(`Owner items: ${ownerDev ? ownerDev.items.map((i) => `${i.id} ${i.status}`).join(', ') : 'the developer failed'}`)
  }
  const boardItems = forArea('board')
  const boardP = boardItems.length ? agent(devPrompt(`board-${stage}`, DEV_AREAS.board, boardItems), { label: `dev:board:${stage}`, phase: 'Fix', schema: DEV_SCHEMA, effort: 'high' }) : Promise.resolve(null)
  const devs = (await Promise.all([surfacesP, boardP])).filter(Boolean)
  for (const d of devs) for (const it of d.items || []) {
    if (!status[it.id]) continue
    status[it.id] = it.status === 'done' ? 'built' : 'open'
    notes[it.id] = `developer: ${it.status}: ${it.change}`
  }
  log(`Stage ${stage} fixes pushed (${surfaceItems.length} surfaces, ${boardItems.length} board items): ${JSON.stringify(counts())}`)

  phase('QA and capture')
  const [qa, cap] = await parallel([
    () => agent(qaPrompt(`stage-${stage}`), { label: `qa:${stage}`, phase: 'QA and capture', schema: QA_SCHEMA, effort: 'high' }),
    () => agent(capturePrompt(`signoff-${stage}`), { label: `capture:${stage}`, phase: 'QA and capture', schema: CAPTURE_SCHEMA, effort: 'medium' }),
  ])
  log(`Stage ${stage}: QA ${qa ? (qa.pushed ? 'pushed ' + qa.head : 'did not push') : 'failed'}; capture ${cap ? cap.shots + ' shots of ' + cap.head : 'failed'}`)

  phase('Sign-off')
  for (const o of LATE_ITEMS) {
    if (status[o.id]) continue
    lensOf[o.id] = o.lens; areaOf[o.id] = o.area; status[o.id] = 'built'; details[o.id] = o.text
    log(`Added the owner's ${o.id} to the sign-off`)
  }
  const capsText = cap ? `- manifest ${cap.manifest}; shots ${cap.dir}; drift ${cap.drift || 'n/a'}; missing: ${(cap.missing || []).join('; ') || 'none'}` : `- the capture failed: capture the key states yourself from origin/${BRANCH}`
  // Visual and layout first: the game lens judges OWN-6 and OWN-7, whose developer may still be pushing
  for (const pair of [...PAIRS].reverse()) {
    const lenses = pair.lenses.filter((l) => !signedOff[l])
    if (!lenses.length) continue
    const ids = Object.keys(status).filter((id) => lenses.includes(lensOf[id]) && ['open', 'regressed', 'built'].includes(status[id]))
    const r = await agent(reviewPrompt({ ...pair, lenses }, 'signoff', capsText, ids), { label: `signoff:${pair.key}:${stage}`, phase: 'Sign-off', schema: REVIEW_SCHEMA })
    applyReview(r, lenses, `sign-off ${pair.key}`, ids)
    for (const l of lenses) {
      const clear = !Object.keys(status).some((id) => lensOf[id] === l && ['open', 'regressed'].includes(status[id]))
      if (r && r.approve && r.approve[l] === true && clear) signedOff[l] = true
    }
  }
  history.push({ stage, counts: counts(), signedOff: { ...signedOff }, qa: qa && { head: qa.head, checks: qa.checks } })
  log(`Stage ${stage} sign-off: ${Object.keys(LENSES).map((l) => `${l}=${signedOff[l] ? 'signed' : 'no'}`).join(', ')}; open ${openIds().length}`)
  if (Object.keys(LENSES).every((l) => signedOff[l])) break
  if (stage >= MAX_SIGNOFFS) { log(`Stopped after ${MAX_SIGNOFFS} sign-off rounds with ${openIds().length} items open`); break }
  stage += 1
}

return {
  allSignedOff: Object.keys(LENSES).every((l) => signedOff[l]),
  signedOff,
  counts: counts(),
  history,
  ownerSpecs: ownerDev ? ownerDev.specs : null,
  open: openIds().map(itemFor),
}
