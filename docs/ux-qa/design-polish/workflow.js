export const meta = {
  name: 'design-polish-review-v2',
  description: 'Design polish on PR #52: review, fix, verify only what changed, then a full sign-off round, until every reviewer approves',
  whenToUse: 'Iterative design polish of the DC Solo RPG app (faster loop, artifacts saved to the PR)',
  phases: [
    { title: 'Capture', detail: 'Round 1 reused; verify rounds recapture only what changed; sign-off rounds recapture everything' },
    { title: 'Review', detail: 'Game UX, visual and type, copy, layout and responsive reviewers' },
    { title: 'Plan', detail: 'Design lead merges open findings into one work-list and saves the round to the PR' },
    { title: 'Develop', detail: 'Two developers in their own worktrees' },
    { title: 'Integrate', detail: 'Merge, full verification, working doc, push to PR #52' },
  ],
}

const REPO = '/home/user/dc-solo-rpg'
const BRANCH = 'claude/vibrant-curie-w9bn88'
const SP = '/tmp/claude-0/-home-user-dc-solo-rpg/46ef24c3-c9b5-5b09-b975-f7e3d89a4702/scratchpad'
const DR = SP + '/design-review'
const TOOLS = DR + '/tools'
const ARCHIVE = 'docs/ux-qa/design-polish'
const BRIEF = SP + '/ux-fix/BRIEF.md'
const MAX_ROUNDS = 10
const TRAILER = 'Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_01LRucPctvQBb3dHaC2jbeyn'

const OWNER_ASK = `dispatch a team of game design and visual design experts to do a design review that focuses on text and action positioning. there are some areas in the app that the text is cluttered, redundant, shifts positions depending on game state, and generally feels unpolished. we should also change the font of all numbers in the tiles to use the LED style numbers and make the tiles all use the same progressive styling like the kings tile so that the background slightly shifts to an appropriate color and the tiles values change. this review should be focused on the nits and minor details for the most part and is not meant to be an overhaul but perfecting the design by putting the final touches on things like text and typography fixes, consistent text positioning and useful copy and ensuring the design on common screen sizes. ensure they are highly critical and apply industry best practices and tools to their reviews. have a developer agent field all of the findings and make the changes on a new draft PR. then send the results back to the review team. do this alliteratively until all review agents approve every detail of the design`

const OWN1 = 'OWN-1 (owner requirement): every number in the HUD tiles (Stability, Kings, Roll, Cards, Aces, Tokens, including each /max) uses the LED face (--font-led, DSEG7 Classic), as the Roll tile already does (src/lib/components/status/RollCell.svelte: the digits over faint unlit "88" segments). The values must read as one family across the six tiles, align on one baseline, and fit at 360px wide.'
const OWN2 = 'OWN-2 (owner requirement): every HUD tile uses the Kings tile\'s progressive styling. As its value moves into a new tier, the tile background shifts slightly to a fitting colour (the reference is the Kings tile\'s urgent gradient in src/lib/components/status/KingsCell.svelte, .urgent) and the value\'s colour changes with it. Each tile needs tiers that fit what its value means to the player: Stability by stabilityTier (steady, caution, danger, critical) in hudTiers.js; Tokens falling is good news; Cards running out is pressure; Aces rising is hope (Salvation unlocking); the Roll tile for a natural 20, a natural 1, and a pending Lucid or Surreal. Subtle, on-palette, legible, eased with the animation tokens, instant under reduced motion, and never louder than the Kings at 3 of 4.'

const CONTEXT = `## Context
You are on a design-polish team for DC Solo RPG ("Dream Console" by Dimm City), a SvelteKit 2 / Svelte 5 solo journaling game (Wretched and Alone, d20 variant). Repo: ${REPO}. Branch: ${BRANCH}. Draft PR: https://github.com/dimm-city/dc-solo-rpg/pull/52. CLAUDE.md (already in your context) describes the rules and the architecture.

The owner's request for this review, verbatim: "${OWNER_ASK}"

This is NOT an overhaul. It is the final pass on the details: text and typography, consistent text and action positioning across game states, clutter and redundant copy, useful copy, and fit on common screen sizes. Two owner requirements are fixed:
- ${OWN1}
- ${OWN2}

Owner decisions that stand (never reopen them): the "Owner decisions" section of ${BRIEF} (read only that section and "Environment"; its team table and ports are out of date); the rules in CLAUDE.md (the fourth Ace wins only on Easy, Hard adds tokens on a missed Salvation, Lucid/Surreal on any natural 20/1 and only the kept die counts); and the decisions recorded in ${REPO}/docs/ux-qa/ux-qa-review.md under "Owner playtest round" and "Playtest follow-ups" (for example: the journal autofocus is desktop only, lixdu is the large board font, the HUD is one mirrored row Stability, Kings | Roll, Cards | Aces, Tokens, with Lucid and Surreal as two icons under the roll). Skim the rest of that doc so you don't re-raise what earlier rounds already fixed or decided.

Environment: 4 shared CPUs. Be frugal with servers and browsers, and stop every server you start. Chromium is at /opt/pw-browsers/chromium; launch it with args ['--no-sandbox','--headless=new','--use-angle=swiftshader'] (require('playwright') works anywhere). Never run "playwright install". The 3D dice are slow under swiftshader. On a dev server you can force states in page.evaluate: await import('/src/lib/stores/gameStore.svelte.js') gives the live gameState; await import('/src/lib/services/random.js') gives mockDieRoll(n) (sticky until resetRNG()), mockDieRollSequence([...]) and resetRNG(). Set localStorage 'dc-solo-rpg:instructions-seen' to 'true' to skip the splash. The capture scripts for this review are in ${TOOLS}/board and ${TOOLS}/surfaces (a copy without images is committed in ${REPO}/${ARCHIVE}/tools). The games are /game/future-lost and /game/ghost-in-the-machine; run "npm run -s generate:games-index" in a checkout if static/games/index.json is missing. All scratch output for this review goes under ${DR}.`

const VIEWPORTS = `Core viewports: android-small 360x640 (isMobile, hasTouch, deviceScaleFactor 2); iphone-13 390x844 (devices['iPhone 13'] with deviceScaleFactor 2); iphone-13-landscape 844x390 (devices['iPhone 13 landscape'] with deviceScaleFactor 2); ipad-portrait 768x1024 (hasTouch, deviceScaleFactor 1); laptop 1280x720 (deviceScaleFactor 1); desktop 1440x900 (deviceScaleFactor 1). Extended viewports, for the home page, the round-start board, a drawn card, a Stability result, the journal entry and the game-over screen: iphone-se 375x667, pixel-7 412x915, ipad-landscape 1024x768, fhd 1920x1080.`

const CAPTURE_GROUPS = [
  {
    key: 'board', port: 5191,
    always: 'every board state at the four drift viewports (android-small, iphone-13, iphone-13-landscape, desktop), so the drift table and drift sheets are always current; and the HUD tier matrix at every core viewport whenever anything under src/lib/components/status/, src/styles.css or src/lib/constants/ changed',
  },
  {
    key: 'surfaces', port: 5192,
    always: 'the home page, one card overlay, the journal entry, the final log and one game-over screen, at every core viewport',
  },
]

const REVIEWERS = [
  {
    key: 'game', prefix: 'GD', port: 5193, title: 'Game UX designer',
    lens: `You are a senior game UX designer who has shipped narrative and card games (think Inscryption, Slay the Spire, Citizen Sleeper, Reigns). Review play as information design. At every step, does the player see exactly what they need, in a stable place, in the right order of importance? Check: the hierarchy of the screen title, step button, rule caption, result line and HUD in each game state; text that moves between states (use the drift tables); the same fact stated twice on one screen (HUD, caption, button and card note repeating each other); feedback for each outcome (natural 1/20, Lucid/Surreal, Stability tiers, Kings, Aces, Salvation) that is clear but not noisy; that the HUD tiles' progressive states (OWN-2) map to what each value means for the player and escalate sensibly; that copy teaches the rules through play (the SRD's progressive rule teaching) and matches the rules in CLAUDE.md exactly, per difficulty; the endings, the journal and story mode as moments in the game's arc. Apply Celia Hodent's game UX pillars (clarity, form follows function, feedback, consistency, minimal cognitive load) and Nielsen's heuristics.`,
    skills: ['vectorlab-ux-skills:ux-audit', 'vectorlab-ux-skills:verbs', 'vectorlab-ux-skills:motion'],
    owns: 'OWN-2',
  },
  {
    key: 'visual', prefix: 'VT', port: 5194, title: 'Visual and typography designer',
    lens: `You are a senior visual and typographic designer for games and product UI. Review typography and visual detail: the type scale (count the distinct sizes and weights in the metrics and flag near-duplicates such as 13px next to 14px); line heights, letter-spacing and case per role; font roles (lixdu for large titles only, Inter for UI and reading, Share Tech Mono, DSEG7 LED for every HUD number per OWN-1: digit metrics, the unlit-segment ghosts, baseline alignment of the value with its /max, sizes that read as one family across tiles); optical alignment (centre lines, baselines across the HUD tiles, icon-to-text alignment); the 4/8pt spacing rhythm and padding consistency inside frames, buttons and modals; colour use (60-30-10, danger red only for danger, and OWN-2's progressive tile backgrounds being subtle, on-palette and legible; you judge OWN-2's visual execution too); contrast (WCAG 2.2 AA: 4.5:1 for body text, 3:1 for large text and UI parts; compute it from the metrics); widows, orphans and balanced wraps in headings and button labels; truncation; anything that looks unfinished.`,
    skills: ['vectorlab-ux-skills:typography', 'vectorlab-ux-skills:spacing', 'vectorlab-ux-skills:colour-palette', 'vectorlab-ux-skills:anti-slop'],
    owns: 'OWN-1',
  },
  {
    key: 'copy', prefix: 'CP', port: 5195, title: 'UX writer and content designer',
    lens: `You are a senior UX writer and content designer for games. Read every word on every screen and state, in the captures and in the source strings (grep the .svelte files and composables such as useRuleCaptions and utils/rollResult.js; a game's own card and story text is the author's, not yours, unless it is UI chrome). Check: every line earns its place (cut clutter, and cut anything said elsewhere on the same screen); button labels are verb-first and specific; the same thing has the same name everywhere (Stability, Tokens, Kings, Aces, Lucid, Surreal, Salvation, Roll for Tasks, journal/log/record, story/library, Dream Console and Dimm City); capitalisation is consistent per role; punctuation (the middle-dot separator, ellipses, numerals vs words), tense and person are consistent; numbers in copy match the HUD and the rules; rule captions are short, accurate and once per game where the owner decided so; empty, loading and error states are useful; aria-labels and screen-reader text agree with the visible text. References: the Microsoft Writing Style Guide, the Google developer documentation style guide and Mailchimp's content style guide.`,
    skills: ['vectorlab-ux-skills:verbs', 'vectorlab-ux-skills:labels', 'vectorlab-ux-skills:errors', 'vectorlab-ux-skills:empty-states'],
    owns: null,
  },
  {
    key: 'layout', prefix: 'LR', port: 5196, title: 'Layout and responsive design specialist',
    lens: `You are a senior layout and responsive design specialist. Review positioning and fit at every captured size. Check: text and actions that change position between game states (from the drift tables, any shift over 2px that is not an intended layout change is a finding; the primary action stays in one slot, and the title, caption and result lines do not jump); the primary action's reach (the thumb zone on phones, the same place every step); safe areas; the landscape phone layout; tablet layouts that are neither stretched phones nor squeezed desktops; the HUD row at 360px (labels never clipped, LED digits fit); modal and overlay sizing (max widths, inner scroll, sticky actions, no double scroll); page overflow; clipped text; touch targets of at least 44x44 CSS px (Apple HIG) or 48dp (Material); reading line length of 45-75 characters; z-order collisions (dice, captions, button); keyboard focus order and visible focus. Use the metrics: measure, don't eyeball.`,
    skills: ['vectorlab-ux-skills:viewports', 'vectorlab-ux-skills:spacing', 'vectorlab-ux-skills:surfaces', 'vectorlab-ux-skills:keyboard'],
    owns: null,
  },
]

const DEV_GROUPS = [
  {
    key: 'board', title: 'Board developer (HUD, game screen, global styles)', areas: ['hud', 'play', 'global'], port: 5201,
    files: 'src/lib/components/status/* (all HUD cells, StatusHUD, PlayerInfoBar, hudTiers.js and its tests), GameScreen.svelte, src/lib/components/game/*, RuleCaption, ContinueButton, AugmentedButton, ButtonBar, KeyboardHint, StatusDisplay, Game.svelte, src/lib/composables/screen/*, useRuleCaptions, useAutoPlay, src/lib/utils/rollResult.js, src/styles.css, src/lib/constants/animations.js, src/routes/+layout.svelte, src/app.html',
  },
  {
    key: 'surfaces', title: 'Surfaces developer (overlays, pages, story)', areas: ['overlays', 'pages', 'story'], port: 5202,
    files: 'src/lib/components/card/*, CardDeck, DrawCard, OverlayModal, ContentModal, ConfirmModal, JournalEntry, src/lib/components/journal/*, GameOver, RunRecap, DiceThemePicker, HelpModal, GameGuide, AboutModal, AboutContent, SettingsModal and src/lib/components/settings/*, Splash, GameSelector, src/lib/components/home/*, StaticPage, ErrorScreen, LoadScreen, SignIn, src/routes/**/+page.svelte and +error.svelte, StoryMode, StoryRound, src/lib/components/story/*, BrowseGames, src/lib/components/browse/*, useStoryNavigation, storyGeneration.js',
  },
]

// ---------- schemas ----------
const STR = { type: 'string' }
const STRS = { type: 'array', items: STR }
const CAPTURE_SCHEMA = {
  type: 'object',
  properties: {
    group: STR, manifest: STR, latestManifest: STR, sheetsDir: STR, shotsDir: STR, metrics: STR, drift: STR,
    recaptured: STRS, states: { type: 'number' }, shots: { type: 'number' }, unreachable: STRS, notes: STR,
  },
  required: ['group', 'manifest', 'sheetsDir', 'shotsDir', 'metrics', 'states', 'shots', 'unreachable', 'notes'],
}
const FINDING = {
  type: 'object',
  properties: {
    id: STR,
    severity: { type: 'string', enum: ['high', 'medium', 'low'] },
    surface: STR, viewports: STRS, states: STR, issue: STR, evidence: STR,
    recommendation: STR, acceptance: STR, files: STRS,
  },
  required: ['id', 'severity', 'surface', 'issue', 'evidence', 'recommendation', 'acceptance'],
}
const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    approve: { type: 'boolean' },
    summary: STR,
    verdicts: {
      type: 'array',
      items: {
        type: 'object',
        properties: { id: STR, status: { type: 'string', enum: ['resolved', 'open', 'regressed', 'withdrawn'] }, note: STR },
        required: ['id', 'status', 'note'],
      },
    },
    findings: { type: 'array', items: FINDING },
    ownerSpecs: { type: 'array', items: { type: 'object', properties: { id: STR, spec: STR }, required: ['id', 'spec'] } },
    captureRequests: STRS,
  },
  required: ['approve', 'summary', 'verdicts', 'findings', 'captureRequests'],
}
const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    summary: STR,
    archived: { type: 'boolean' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: STR, title: STR,
          area: { type: 'string', enum: ['hud', 'play', 'global', 'overlays', 'pages', 'story'] },
          sources: STRS, spec: STR, acceptance: STR, files: STRS, states: STR, unitTest: { type: 'boolean' },
        },
        required: ['id', 'title', 'area', 'sources', 'spec', 'acceptance'],
      },
    },
    declined: { type: 'array', items: { type: 'object', properties: { source: STR, reason: STR }, required: ['source', 'reason'] } },
  },
  required: ['summary', 'archived', 'items', 'declined'],
}
const DEV_SCHEMA = {
  type: 'object',
  properties: {
    group: STR, branch: STR, worktree: STR,
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: { id: STR, status: { type: 'string', enum: ['done', 'partial', 'not-done'] }, change: STR },
        required: ['id', 'status', 'change'],
      },
    },
    commits: STRS, touchedOutside: STRS, verification: STR, screenshots: STR, notes: STR,
  },
  required: ['group', 'branch', 'worktree', 'items', 'commits', 'verification', 'notes'],
}
const INTEG_SCHEMA = {
  type: 'object',
  properties: {
    head: STR, pushed: { type: 'boolean' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: { id: STR, status: { type: 'string', enum: ['done', 'partial', 'not-done', 'reverted'] }, note: STR },
        required: ['id', 'status', 'note'],
      },
    },
    checks: STR, notes: STR,
  },
  required: ['head', 'pushed', 'items', 'checks', 'notes'],
}

// ---------- ledger ----------
const ledger = {}
const seed = (id, reviewer, text) => {
  ledger[id] = {
    id, reviewer, round: 0, status: 'open', declineCount: 0, declineReason: null, lastNote: null, work: [], spec: null,
    finding: { id, severity: 'high', surface: 'HUD tiles', issue: text, evidence: 'Owner requirement', recommendation: text, acceptance: 'The owning reviewer signs off on every tile at every core viewport' },
  }
}
seed('OWN-1', 'visual', OWN1)
seed('OWN-2', 'game', OWN2)

const addFinding = (rv, f, round) => {
  let id = String(f.id || '')
  if (!id.startsWith(rv.prefix + '-')) id = `${rv.prefix}-${round}-${id || 'X'}`
  while (ledger[id]) id = id + 'b'
  ledger[id] = { id, reviewer: rv.key, round, status: 'open', declineCount: 0, declineReason: null, lastNote: null, work: [], spec: null, finding: { ...f, id } }
}
const tracked = (key) => Object.values(ledger).filter((e) => e.reviewer === key && !['resolved', 'withdrawn', 'owner'].includes(e.status))
const blockingFor = (key) => Object.values(ledger).filter((e) => e.reviewer === key && ['open', 'regressed'].includes(e.status))
const openAll = () => Object.values(ledger).filter((e) => ['open', 'regressed'].includes(e.status))
const brief = (e) => ({
  id: e.id, reviewer: e.reviewer, status: e.status, severity: e.finding.severity, surface: e.finding.surface,
  viewports: e.finding.viewports, states: e.finding.states, issue: e.finding.issue, evidence: e.finding.evidence,
  recommendation: e.finding.recommendation, acceptance: e.finding.acceptance, files: e.finding.files,
  ownerSpec: e.spec, reviewerLastNote: e.lastNote, timesDeclined: e.declineCount, lastDeclineReason: e.declineReason,
  work: e.work,
})

const compactLedger = () => JSON.stringify(Object.values(ledger).map((e) => ({
  id: e.id, reviewer: e.reviewer, round: e.round, status: e.status, severity: e.finding.severity,
  surface: e.finding.surface, issue: e.finding.issue, declineReason: e.declineReason, lastNote: e.lastNote, work: e.work,
})))

// A round with no plan (everyone clear, or the final sign-off) still gets saved to the PR
const archive = (round) => agent(`Save design-review round ${round} to the PR. In the main checkout ${REPO} (on ${BRANCH}, clean, up to date with origin): run ${DR}/archive.sh ${round} (it copies the round's markdown and the capture scripts into ${ARCHIVE}) and write this ledger, verbatim, to ${ARCHIVE}/ledger.json. Commit only ${ARCHIVE} ("Design polish round ${round}: reviews", ending with the trailer below) and git push -u origin ${BRANCH} (fast-forward only; never force; retry a network error up to 4 times with 2, 4, 8 and 16 second waits). Reply with the commit sha, or why it failed.
Trailer:
${TRAILER}

Ledger:
${compactLedger()}`, { label: `archive:r${round}`, phase: 'Integrate', effort: 'low' })

// ---------- prompts ----------
const capturePrompt = (g, round, mode, requests, prevHead, items) => `${CONTEXT}

## Your role: capture engineer (${g.key}), round ${round} (${mode === 'signoff' ? 'full sign-off recapture' : 'targeted recapture'})
The scripts in ${TOOLS}/${g.key}/ already capture every ${g.key} state (round 1 took them 90 minutes to write; rerunning is the fast part). Use them; fix any step the UI changes broke; never edit, stage or commit anything in ${REPO}. The code under test is the main checkout ${REPO} at the head of ${BRANCH} (git -C ${REPO} log --oneline -5). Start one dev server (cd ${REPO} && npx vite dev --port ${g.port} --strictPort, in the background) and stop it when you are done.

${mode === 'signoff'
    ? `### What to capture: everything
This is the sign-off round: every reviewer will judge every detail from these captures. Rerun every ${g.key} state at every core viewport, and the extended viewports where round 1 had them. ${VIEWPORTS}`
    : `### What to capture: only what changed, plus a fixed set
1. The developers changed the code since the last capture at ${prevHead}: git -C ${REPO} diff --name-only ${prevHead} HEAD. The work items they did are below.
2. From the latest manifest (${DR}/latest/manifest-${g.key}.md; if it doesn't exist yet, create it from ${DR}/round-1/manifest-${g.key}.md), pick every state that renders a changed file or that a work item or reviewer request names, and rerun those at every core viewport. ${VIEWPORTS}
3. Always also rerun: ${g.always}.
Work items:
${JSON.stringify(items.map((it) => ({ id: it.id, title: it.title, area: it.area, files: it.files, states: it.states })), null, 1)}`}
${requests.length ? `\nStates the reviewers asked for:\n${requests.map((r) => '- ' + r).join('\n')}\n` : ''}
### Output (round ${round})
- The same layout as round 1: shots ${DR}/round-${round}/shots/${g.key}/<state>/<viewport>.png; contact sheets ${DR}/round-${round}/sheets/${g.key}/<state>.png; metrics ${DR}/round-${round}/metrics-${g.key}.json, with the same top-level summary and issues digest${g.key === 'board' ? `; drift ${DR}/round-${round}/drift-board.md and the drift sheets` : ''}; manifest ${DR}/round-${round}/manifest-${g.key}.md listing what you recaptured this round.
- Update ${DR}/latest/manifest-${g.key}.md: every ${g.key} state with the round folder that holds its newest capture, so a reviewer always finds the current picture of every state in one place.
Return the paths, the list of recaptured states, and the counts.`

const capsBlock = (caps) => caps.map((c) => `- ${c.group}: manifest ${c.manifest}${c.latestManifest ? '; latest of every state ' + c.latestManifest : ''}; sheets ${c.sheetsDir}; shots ${c.shotsDir}; metrics ${c.metrics}${c.drift ? '; drift ' + c.drift : ''}${c.recaptured && c.recaptured.length ? '; recaptured this round: ' + c.recaptured.join(', ') : ''}; unreachable: ${(c.unreachable || []).join('; ') || 'none'}`).join('\n')

const reviewPrompt = (rv, round, mode, caps, others, lastItems) => {
  const mine = tracked(rv.key).map(brief)
  const common = `${CONTEXT}

## Your role: ${rv.title}
${rv.lens}

## Material (round ${round})
Captures:
${capsBlock(caps) || '- (the capture agents failed this round: capture what you need yourself)'}
How to work fast without missing anything: start from the manifests and the digests. The metrics JSON files are large: read their top-level "summary" and "issues" keys (and ${DR}/round-1/metrics-surfaces-summary.json for the surfaces) with python or jq, never the whole file. Open the contact sheets that bear on your lens with the Read tool, and individual shots for detail. Read the source in the main checkout ${REPO}, read-only: never edit, stage or commit anything there. If you need a state that was not captured, capture it yourself: start a dev server on port ${rv.port} (cd ${REPO} && npx vite dev --port ${rv.port} --strictPort, in the background), keep scripts and shots under ${DR}/round-${round}/review-${rv.key}/, and stop the server when done. Load these skills with the Skill tool and apply them: ${rv.skills.join(', ')}. You may install audit tools (axe-core, a WCAG or APCA contrast calculator) into ${TOOLS}/node_modules with npm, never into the project.

## Rules for findings
Be highly critical: this pass takes the game from good to award-winning, so nits count. But every finding must be a real defect you can show (a screenshot path, a measurement, a file:line), not one defensible taste swapped for another, and it must fit the non-overhaul scope. One finding per distinct problem; when the same problem shows on several screens, make it one finding that lists every place. Each finding: id "${rv.prefix}-${round}-NN"; severity (high: wrong, broken, unreadable or misleading; medium: clearly unpolished or inconsistent; low: a nit); surface; viewports; states; the issue; evidence; a concrete recommendation (exact copy, sizes, tokens and positions; say what to remove where you can); acceptance (how you will verify the fix); and the files involved. List states the capture team should add in captureRequests. Write your full review as markdown to ${DR}/round-${round}/review-${rv.key}.md as soon as you have it (it is committed to the PR so it survives a restart).`

  if (mode === 'full') {
    return `${common}

## Round ${round}: full review
Cover every captured state through its sheet or the metrics. Leave verdicts empty. ${rv.owns ? `You own the verification of ${rv.owns} (see Context). Look at what the tiles do now, and put your exact specification for it in ownerSpecs (id "${rv.owns}"): per tile, the sizes, colours, tiers and transitions you will accept. Raise anything else about the tiles as normal findings.` : ''} Set approve=false unless you truly find nothing.`
  }

  const tasks = mode === 'verify'
    ? `## Round ${round}: verify what changed
The developers pushed fixes to ${BRANCH} (git -C ${REPO} log --oneline -20). This is a focused round: the captures hold only what changed plus a fixed set, and the latest manifests point at the newest picture of every state.
1. Verify each of your tracked items below against the captures and the code. Give a verdict per item id: resolved (it fully meets your acceptance), open (not done or only partly done; say exactly what is still wrong and what would satisfy you), regressed (it got worse or broke something else), or withdrawn (you now agree it is not a defect; say why). For a declined item, withdraw it if the reason holds and keep it open if it doesn't, saying why.
2. Review every surface the work items touched (below) through your lens, for regressions and for anything the fixes introduced. Report those as new findings (ids ${rv.prefix}-${round}-NN).
3. Set approve=true when every tracked item is resolved or withdrawn and you have no new findings. A full sign-off round follows once every reviewer is clear, so you will see the whole design again before the work is finished.
The work items done this round:
${JSON.stringify(lastItems.map((it) => ({ id: it.id, title: it.title, area: it.area, sources: it.sources, files: it.files })), null, 1)}`
    : `## Round ${round}: full sign-off
Every reviewer was clear after the last verify round, and the captures are complete again. This is the sign-off.
1. Review the whole design through your lens, every state and every core viewport, as thoroughly as in round 1. Check that everything you raised in earlier rounds still holds (no regressions) and look for anything still short of award-winning.
2. Give verdicts for any tracked items below (normally none).
3. approve=true only if you sign off on every detail of the design as it stands. Otherwise approve=false, with new findings (ids ${rv.prefix}-${round}-NN) that say exactly what stops you.`

  return `${common}

${tasks}

Your tracked items, each with the work done on it ("work": the plan item, the developers' status and their note) or the reason it was declined:
${JSON.stringify(mine, null, 1)}

Other reviewers' open items (don't duplicate them, and don't re-raise a settled point unless it is wrong):
${JSON.stringify(others.map((e) => ({ id: e.id, reviewer: e.reviewer, surface: e.finding.surface, issue: e.finding.issue })), null, 1)}`
}

const planPrompt = (round, open, ledgerJson) => `${CONTEXT}

## Your role: design lead, round ${round}
First, save the round so a container restart loses nothing. In the main checkout ${REPO} (on ${BRANCH}, clean, up to date with origin): write the plan (below) to ${DR}/round-${round}/plan.md; run ${DR}/archive.sh ${round} (it copies the round's markdown and the capture scripts into ${ARCHIVE}); and write the ledger below, verbatim, to ${ARCHIVE}/ledger.json. Then commit only ${ARCHIVE} ("Design polish round ${round}: reviews and plan", ending with the trailer below) and git push -u origin ${BRANCH} (a fast-forward; never force; on a network error retry up to 4 times with 2, 4, 8 and 16 second waits). Set archived=true if the push succeeded.
Trailer:
${TRAILER}

Ledger:
${ledgerJson}

## The plan
Merge every open finding into one work-list for two developers. Open findings and owner items (OWN-1 and OWN-2 carry their reviewer's spec in ownerSpec):
${JSON.stringify(open.map(brief), null, 1)}

- Merge duplicates and keep every source id. Where reviewers conflict, decide, and write the decision and its rationale into the item so that every source reviewer can accept it.
- Decline a finding only if it contradicts an owner decision (see Context) or would be an overhaul rather than polish, and give the reason. Never decline OWN-1 or OWN-2. A finding already declined once and kept open by its reviewer (timesDeclined >= 1) must be implemented now, unless the decline rests on a named owner decision.
- Each item: id "DP-${round}-NN", a title, an area (hud | play | global | overlays | pages | story), a precise spec (exact copy, tokens, sizes and positions), acceptance (what each source reviewer will check), the source ids, the files, the states and viewports to recapture for it (states), and unitTest (true for any logic change). Specs precise enough that the reviewers accept the result first time are what make this loop fast.
- Area ownership, so the two developers never edit the same file. Board developer (areas hud, play, global): ${DEV_GROUPS[0].files}. Surfaces developer (areas overlays, pages, story): ${DEV_GROUPS[1].files}. An item that needs both: split it into two items, one per area, and say how they fit together.
- Every open finding must end up either in an item's sources or in declined.`

const devPrompt = (g, round, items) => {
  const wt = `/home/user/dc-solo-rpg-wt/dp-${g.key}-r${round}`
  const br = `design/${g.key}-r${round}`
  return `${CONTEXT}

## Your role: ${g.title}, round ${round}
Implement every work item below, completely, to the bar of an award-winning game. The reviewers will check each against its acceptance, so meet it exactly:
${JSON.stringify(items, null, 1)}

The reviews behind each source id are in ${DR}/round-*/review-*.md; the plan is ${DR}/round-${round}/plan.md.

### Setup: your own worktree (the main checkout is shared; don't edit it)
cd ${REPO} && git fetch origin ${BRANCH}
git worktree add ${wt} -b ${br} origin/${BRANCH}
cp -al ${REPO}/node_modules ${wt}/node_modules
cd ${wt} && npm run -s generate:games-index && npx svelte-kit sync
If ${wt} or ${br} already exists from an earlier attempt, inspect it: continue from it if it holds your commits; otherwise remove that worktree and branch (only those) and recreate them.

### Rules
- Edit only files in your area: ${g.files}. If an item truly needs a change elsewhere, keep it minimal and self-contained and list it in touchedOutside.
- Svelte 5 runes; the animation tokens; prefers-reduced-motion for anything you animate; match the existing style; prefer removing to adding; no new dependencies. Every logic change gets a Vitest unit test. Update the e2e specs whose assertions your change legitimately changes (copy, positions); never skip or weaken a test.
- Commit per item or tight group, citing item ids (e.g. "DP-${round}-04: keep the step button in one slot"), and end every message with:
${TRAILER}
- Do not push. Do not touch other branches.

### Verify before you report
1. In your worktree: npx vitest run, npx eslint ., npx prettier --check ., npm run check (0 errors), npm run build. All must pass.
2. The Playwright specs your changes affect (not the whole suite: the integrator runs it), with a config copied from ${SP}/e2e/pw.override.config.mjs into ${DR}/round-${round}/dev-${g.key}/ and pointed at your worktree: testDir ${wt}/tests; webServer { command: 'npx vite dev --port ${g.port} --strictPort', port: ${g.port}, cwd: '${wt}', reuseExistingServer: false }; use.baseURL http://localhost:${g.port}.
3. Look at your work: screenshots of every surface you changed at android-small 360x640, iphone-13, iphone-13-landscape and desktop 1440x900 (plus any viewport an item names), under ${DR}/round-${round}/dev-${g.key}/. The capture scripts in ${TOOLS} can do this for you (point them at your dev server). View them and fix what you see.
Stop every server you start. Leave the worktree clean (everything committed).

Report each item as done, partial or not-done, with what changed or why not; your commits (git log --oneline origin/${BRANCH}..HEAD); touchedOutside; the verification results; the screenshot folder.`
}

const integratePrompt = (round, devs, planPath) => `${CONTEXT}

## Your role: integrator, round ${round}
The developers committed on local branches:
${JSON.stringify(devs.map((d) => ({ group: d.group, branch: d.branch, worktree: d.worktree, commits: d.commits, touchedOutside: d.touchedOutside, items: d.items, verification: d.verification, notes: d.notes })), null, 1)}

In the main checkout ${REPO} (confirm it is clean, on ${BRANCH}, and up to date with origin/${BRANCH}):
1. git merge --no-ff each developer branch, with the message "Design polish round ${round}: merge <group>" and the trailer below. Resolve conflicts keeping both intents.
2. npx svelte-kit sync; npx vitest run; npx eslint .; npx prettier --check .; npm run check (0 errors); npm run build; then the full Playwright suite: npm run -s generate:games-index if needed, make sure nothing else is listening on port 5173, and run npx playwright test --config ${SP}/e2e/pw.override.config.mjs --reporter=list in the background (about 10 minutes) and wait for it. Fix every failure at its root: where a behaviour change is legitimate, update the spec; never skip or weaken a test. Commit fixes citing item ids, or "Design polish round ${round}: ...".
3. Record the round in docs/ux-qa/ux-qa-review.md: add, or extend, a section "## Design polish review (2026-11-07)" just before "## Recommendations", with a subsection "### Round ${round}": each reviewer's verdict summary (from ${DR}/round-${round}/review-*.md), a table of the work items (id, title, source findings, status), the declined findings with reasons, and the verification results. Short plain sentences. The plan is ${planPath}; the full reviews are archived in ${ARCHIVE}/round-${round}/.
4. Every commit message ends with:
${TRAILER}
5. git push -u origin ${BRANCH}. It must be a fast-forward: never force. On a network error, retry up to 4 times with 2, 4, 8 and 16 second waits.
6. Once their commits are merged, remove the developer worktrees (git worktree remove --force <worktree>) and delete their local branches (git branch -D <branch>). Stop every server you started.

Report the head sha, whether the push succeeded, each item's final status (from the developer reports, adjusted for anything you fixed or reverted), the check results, and notes.`

// ---------- the loop ----------
const history = []
let caps = (args && args.round1Caps) || []
let capturedHead = (args && args.round1Head) || null
let requests = []
let approved = {}
let finalRound = 0
let integ = null
let mode = 'full'
let lastItems = []
// A reviewer who has signed off on the full design keeps that sign-off; they still verify every
// later change in the verify rounds, but don't repeat the full pass
const signedOff = {}

for (let round = 1; round <= MAX_ROUNDS; round++) {
  finalRound = round
  if (!(round === 1 && caps.length === CAPTURE_GROUPS.length)) {
    phase('Capture')
    const capMode = mode === 'signoff' ? 'signoff' : 'verify'
    caps = (await parallel(CAPTURE_GROUPS.map((g) => () =>
      agent(capturePrompt(g, round, capMode, requests.filter((r) => r.group === g.key).map((r) => r.text), capturedHead, lastItems.filter((it) => (g.key === 'board') === ['hud', 'play', 'global'].includes(it.area))), {
        label: `capture:${g.key}:r${round}`, phase: 'Capture', schema: CAPTURE_SCHEMA, effort: capMode === 'verify' ? 'medium' : 'high',
      })))).filter(Boolean)
    capturedHead = integ ? integ.head : capturedHead
    log(`Round ${round} (${mode}): captured ${caps.map((c) => `${c.group} ${c.states} states / ${c.shots} shots`).join(', ')}`)
  } else {
    log('Round 1: reusing the captures already made (board and surfaces)')
  }

  phase('Review')
  const othersFor = (key) => openAll().filter((e) => e.reviewer !== key)
  const active = mode === 'signoff' ? REVIEWERS.filter((rv) => !signedOff[rv.key]) : REVIEWERS
  const reviews = await parallel(active.map((rv) => () =>
    agent(reviewPrompt(rv, round, mode, caps, othersFor(rv.key), lastItems), {
      label: `review:${rv.key}:r${round}`, phase: 'Review', schema: REVIEW_SCHEMA,
    })))

  requests = []
  let newCount = 0
  const roundStats = { round, mode, approvals: {}, newFindings: {}, verdicts: {} }
  active.forEach((rv, i) => {
    const r = reviews[i]
    if (!r) {
      approved[rv.key] = false
      newCount += 1
      log(`Round ${round}: the ${rv.title} review failed; counted as not approved`)
      return
    }
    if (mode !== 'full') {
      for (const e of tracked(rv.key)) e.status = 'open'
      for (const v of r.verdicts || []) {
        const e = ledger[v.id]
        if (!e || e.reviewer !== rv.key) continue
        e.lastNote = v.note
        if (v.status === 'open' && e.declineCount >= 2) e.status = 'owner'
        else e.status = v.status
      }
    }
    for (const s of r.ownerSpecs || []) if (ledger[s.id]) ledger[s.id].spec = s.spec
    for (const f of r.findings || []) addFinding(rv, f, round)
    newCount += (r.findings || []).length
    for (const q of r.captureRequests || []) {
      const t = String(q)
      const group = /home|page|modal|journal|log|story|library|game.?over|overlay|settings|about|help|recap|timeline|splash|selector/i.test(t) ? 'surfaces' : 'board'
      requests.push({ group, text: `${t} (asked by ${rv.title})` })
    }
    const blocking = blockingFor(rv.key)
    approved[rv.key] = r.approve === true && blocking.length === 0
    if (r.approve && blocking.length) log(`Round ${round}: ${rv.title} approved but still has ${blocking.length} open items; counted as not approved`)
    roundStats.approvals[rv.key] = approved[rv.key]
    roundStats.newFindings[rv.key] = (r.findings || []).length
    roundStats.verdicts[rv.key] = (r.verdicts || []).reduce((m, v) => ({ ...m, [v.status]: (m[v.status] || 0) + 1 }), {})
  })
  if (mode === 'signoff') for (const rv of active) if (approved[rv.key]) signedOff[rv.key] = true
  const open = openAll()
  const everyoneClear = REVIEWERS.every((rv) => approved[rv.key])
  const allSigned = REVIEWERS.every((rv) => signedOff[rv.key])
  log(`Round ${round} (${mode}${mode === 'signoff' ? ': ' + active.map((rv) => rv.key).join(', ') : ''}): ${open.length} open items, ${newCount} new; signed off ${REVIEWERS.filter((rv) => signedOff[rv.key]).map((rv) => rv.key).join(', ') || 'none'}; approvals ${REVIEWERS.map((rv) => `${rv.key}=${approved[rv.key] ? 'yes' : 'no'}`).join(', ')}`)
  history.push(roundStats)

  if (everyoneClear && allSigned) {
    await archive(round)
    log(`Round ${round}: every reviewer signed off on every detail`)
    break
  }
  if (everyoneClear && open.length === 0) {
    await archive(round)
    mode = 'signoff'
    lastItems = []
    log(`Round ${round}: every reviewer is clear; next round is the full sign-off (${REVIEWERS.filter((rv) => !signedOff[rv.key]).map((rv) => rv.key).join(', ')})`)
    continue
  }
  if (round === MAX_ROUNDS) {
    await archive(round)
    log(`Stopped after ${MAX_ROUNDS} review rounds with ${open.length} items still open (round cap)`)
    break
  }

  phase('Plan')
  const ledgerJson = compactLedger()
  const plan = await agent(planPrompt(round, open, ledgerJson), { label: `plan:r${round}`, phase: 'Plan', schema: PLAN_SCHEMA })
  if (!plan) {
    log(`Round ${round}: planning failed; stopping`)
    break
  }
  if (!plan.archived) log(`Round ${round}: the reviews and plan were not pushed to the PR (they are in ${DR}/round-${round}/)`)
  for (const item of plan.items) {
    for (const s of item.sources || []) {
      const e = ledger[s]
      if (!e) continue
      e.status = 'planned'
      e.work.push({ round, item: item.id, title: item.title })
    }
  }
  for (const d of plan.declined || []) {
    const e = ledger[d.source]
    if (!e || e.id.startsWith('OWN-')) continue
    e.status = 'declined'
    e.declineCount += 1
    e.declineReason = d.reason
  }
  const unplanned = openAll()
  if (unplanned.length) log(`Round ${round}: the plan left ${unplanned.length} findings unassigned (${unplanned.map((e) => e.id).join(', ')}); they stay open`)
  roundStats.planItems = plan.items.length
  roundStats.declined = (plan.declined || []).length

  phase('Develop')
  const groups = DEV_GROUPS.map((g) => ({ g, items: plan.items.filter((it) => g.areas.includes(it.area)) })).filter((x) => x.items.length)
  const devs = (await parallel(groups.map(({ g, items }) => () =>
    agent(devPrompt(g, round, items), { label: `dev:${g.key}:r${round}`, phase: 'Develop', schema: DEV_SCHEMA, effort: 'high' })))).filter(Boolean)
  if (devs.length < groups.length) log(`Round ${round}: ${groups.length - devs.length} developer(s) failed; their items stay open`)

  phase('Integrate')
  integ = devs.length
    ? await agent(integratePrompt(round, devs, `${DR}/round-${round}/plan.md`), { label: `integrate:r${round}`, phase: 'Integrate', schema: INTEG_SCHEMA, effort: 'high' })
    : null
  const statusById = {}
  for (const d of devs) for (const it of d.items || []) statusById[it.id] = { status: it.status, note: it.change }
  for (const it of (integ && integ.items) || []) statusById[it.id] = { status: it.status, note: it.note }
  for (const e of Object.values(ledger)) {
    for (const w of e.work) if (w.round === round && statusById[w.item]) Object.assign(w, statusById[w.item])
  }
  roundStats.integration = integ ? { head: integ.head, pushed: integ.pushed, checks: integ.checks } : null
  if (!integ || !integ.pushed) {
    log(`Round ${round}: integration ${integ ? 'did not push' : 'failed'}; stopping so the next review doesn't judge stale code`)
    break
  }
  log(`Round ${round}: pushed ${integ.head}`)
  lastItems = plan.items
  mode = 'verify'
}

const all = Object.values(ledger)
return {
  rounds: finalRound,
  allApproved: REVIEWERS.every((rv) => signedOff[rv.key] && approved[rv.key]),
  signedOff,
  approvals: approved,
  head: integ ? integ.head : null,
  history,
  counts: all.reduce((m, e) => ({ ...m, [e.status]: (m[e.status] || 0) + 1 }), {}),
  stillOpen: all.filter((e) => ['open', 'regressed', 'planned', 'declined'].includes(e.status)).map(brief),
  forOwner: all.filter((e) => e.status === 'owner').map(brief),
  findings: all.map((e) => ({ id: e.id, reviewer: e.reviewer, round: e.round, status: e.status, severity: e.finding.severity, surface: e.finding.surface, issue: e.finding.issue, work: e.work })),
}
