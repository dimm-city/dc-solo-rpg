---
name: dimm-city-game-creator
description: Generate complete Dimm City-themed Wretched & Alone solo journaling games in .game.md format. Use when user requests creating a Dimm City game, generating a campaign file, or building a themed solo RPG. Creates 52-card games with proper mechanical balance, rich creaturepunk atmosphere, auto-validation, and supports iteration. Maintains exact card distribution (1 Primary Success, 4 Failure Counters, 3 Narratives, 16 Challenges, 28 Events) per Wretched & Alone SRD.
---

# Dimm City Game Creator

Generate complete, validated `.game.md` files for Wretched & Alone solo journaling games set in the Dimm City creaturepunk universe.

## Overview

Create fully playable 52-card games that maintain perfect mechanical balance while incorporating:

- Dimm City lore (five districts, factions, creaturepunk aesthetic)
- Rich sensory details (sight, sound, smell, touch, taste)
- Type-based markdown format compliance
- Auto-validation and correction
- District-specific atmosphere and challenges

## Quick Start

**Simple usage:**

1. User provides concept: "Generate a game about [protagonist] in [district]"
2. Read relevant references for context (`world-overview.md`, `districts.md`)
3. Generate complete 52-card game following template structure
4. Auto-validate card counts and format
5. Save to `[game-name].game.md` in current directory
6. Present validation report

**Example prompts:**

- "Generate a gutterdruid healing toxic Wastes"
- "Create a wirephreak escape from Tech District lockdown"
- "Make a gang warfare game in Neon District"

## Generation Process

### Step 1: Load Context

Before generating, read these reference files:

- `references/world-overview.md` - Core Dimm City lore, tone, slang
- `references/districts.md` - District-specific details
- `references/game-config.md` - Format specification
- `references/game-template.game.md` - Template structure

### Step 2: Generate Structure

**Frontmatter (required):**

```yaml
---
title: Game Title
subtitle: A Dimm City Solo Campaign
win-message: Victory description
lose-message: Defeat description
---
```

**Introduction sections:**

- `## Who You Are` - Protagonist identity, skills, situation (1-3 paragraphs)
- `## What Happened` - Inciting incident (1-5 paragraphs)
- `## Your Goal` - Victory condition and stakes (1-2 paragraphs)

### Step 3: Generate 52 Cards

**CRITICAL DISTRIBUTION (never change):**

- 1 Primary Success (Ace of Hearts)
- 4 Failure Counters (all Kings - escalating threats)
- 3 Narrative cards (A♦, A♣, A♠ - respite/reflection)
- 16 Challenge cards (ranks 3, 5, 7, 9 - trigger damage)
- 28 Event cards (ranks 2, 4, 6, 8, 10, J, Q - safe moments)
- **Total: 52**

**Card types:**

1. **Primary Success** - Salvation moment (finding ally, crucial discovery, breakthrough)
2. **Failure Counters** - Escalating threats (external threat → resource loss → trapped → catastrophe)
3. **Narrative** - Bonus/help cards, optional modifiers (max 1 `skip-damage`, max 1 `return-king`)
4. **Challenge** - Immediate dangers (combat, environmental, betrayals, system failures)
5. **Event** - Safe moments (resources, helpful encounters, quiet moments, world-building)

**Card structure:**

```markdown
### [Card Type]: [optional modifier]

**[Short description - 1-2 sentences]**

[Full narrative - 2-5 paragraphs with sensory details]
```

### Step 4: Apply Dimm City Aesthetic

**Every card must include:**

- **Sensory details** engaging multiple senses
- **Dimm City slang** (DimmCitz, shorty, mercsercs, etc.)
- **District-specific flavor** from `districts.md`
- **Creaturepunk tone** (gritty visceral, weird surreal, dark humor, hope amid chaos)

**Voice:** "Coagulated blood in the wire" not "blood in the circuitry"

### Step 5: Validate & Report

Auto-validate:

- Card counts (52 total, correct distribution)
- Format (frontmatter, sections, modifiers)
- No duplicates if using explicit assignment

Auto-correct once if needed, then present:

```markdown
## Validation Report

**Status**: [✓ PASSED | ⚠ CORRECTED | ✗ ISSUES REMAIN]

**Card Counts**:

- Primary Success: 1 ✓
- Failure Counters: 4 ✓
- Narrative: 3 ✓
- Challenge: 16 ✓
- Event: 28 ✓
- Total: 52 ✓

**Modifiers**: skip-damage: [0-1], return-king: [0-1]
**Auto-Corrections**: [list or "None"]
**Remaining Issues**: [list or "None"]
```

## Iteration Support

**Generate variations:**

- "Make it darker" / "Add more hope"
- "Generate 3 variations"
- "Create combat-heavy version"

**Adjust elements:**

- "Focus on [faction]"
- "Switch from [district] to [district]"
- "Change protagonist to [role]"

**Regenerate cards:**

- "Regenerate all challenges"
- "Rewrite narrative cards"
- "Replace events 10-15"

## Writing Guidelines

**Card balance:**

- Challenges: 4-6 severe, 10-12 moderate
- Events: 10-12 helpful, 10-12 neutral, 6-8 bittersweet

**Thematic cohesion:**

- Recurring elements (NPCs, locations)
- Escalating stakes
- Consistent atmosphere

**Avoid:**

- Formulaic structure
- Generic descriptions
- Changing core mechanics
- Padding unnecessarily

## Key Reminders

**Never change:**

- 52 cards total (1+4+3+16+28)
- Odd ranks trigger damage (3, 5, 7, 9)
- Even ranks safe (2, 4, 6, 8, 10, J, Q, K)
- Primary Success = Ace of Hearts

**Always include:**

- Sensory details (all 5 senses)
- Dimm City slang and tone
- District flavor
- Short description + full narrative
- Thematic cohesion

Generate games that make Dimm City bleed neon into solo journaling.

## Resources

### references/

- `game-config.md` - Format specification
- `game-template.game.md` - Complete template
- `wretched-alone-mechanics-guide.md` - Mechanics reference
- `world-overview.md` - Dimm City lore
- `districts.md` - District details
