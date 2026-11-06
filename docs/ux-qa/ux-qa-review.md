# UX and visual QA review

A critical review of every part of the app's UX, with recommendations. This is a working
document: it is committed and pushed after each section so that work survives a container
restart. Branch: `claude/vibrant-curie-w9bn88`.

## Status

- Started: 2026-11-06, against `main` at 17b967d (PR #50 merged).
- Current phase: not started.
- Last section completed: none.

## How to resume after a restart

1. `git fetch origin claude/vibrant-curie-w9bn88 && git checkout claude/vibrant-curie-w9bn88`.
2. Read **Status** and the **Coverage** checklist below. Continue with the first unchecked item.
3. Screenshots and videos are not committed. Re-capture what you need; the **Method** section
   says how.

## Method

_How captures are made (servers, viewports, scripts, how to force game states). Fill in as you go._

## Severity scale

- **S1 Blocker**: stops play, loses work, or misleads the player about the rules.
- **S2 Major**: clearly hurts the experience or looks broken; most players will notice.
- **S3 Minor**: rough edge that a careful player notices.
- **S4 Polish**: would lift the game from good to award-worthy.

## Coverage

Tick an item only when its findings are written below.

- [ ] Reported bug: an extra confirmation click when the player is Lucid or Surreal
- [ ] Home: splash, instructions choice, game selector, game cards, saved-game continue and delete
- [ ] Header and menus (desktop and phone), About, Help, Settings (every control), dice theme picker
- [ ] Static pages: /about, /how-to, /signin
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

_One entry per finding: ID, severity, surface, viewport, what happens, evidence (screenshot or
frame times), why it matters, recommendation (keep, simplify, redesign or remove) and effort._

## Animation inventory

_Every animation in the app: where, trigger, duration and easing, verdict (keep, tune, simplify,
redesign, remove) and why._

## Recommendations

_Prioritised plan, written last: what to fix first and how._
