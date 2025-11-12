# Game Configuration: Type-Based Markdown Format

## Executive Summary

This document describes the **Type-Based Markdown Format** for game creation in DC Solo RPG. The system uses a **single markdown file** that focuses on card types rather than card identifiers, making it significantly easier for writers to create games while maintaining full compliance with the Wretched and Alone SRD.

### Design Principles

1. **Single source of truth** - One markdown file per game
2. **Plain text** - Use familiar Markdown syntax
3. **Smart defaults** - Remove need to configure labels/styling
4. **Rich storytelling** - Support paragraph-length card descriptions
5. **Easy to publish** - Simple export/share workflow
6. **Validate early** - Catch errors before testing
7. **Type-based organization** - Focus on card purpose, not deck mechanics
8. **SRD compliance** - Align with Wretched and Alone official mechanics

---

## Type-Based Markdown Format

### Overview

Everything in one `.game.md` file using type-based card organization. Writers create cards grouped by **purpose** (Primary Success, Failure Counter, Challenge, Event, Narrative) and the system automatically assigns them to the standard 52-card deck. No card identifiers needed, no CSV files, no complex configuration.

### Card Types (Based on Wretched and Alone SRD)

The format uses five card types that map directly to the standard 52-card deck:

1. **Primary Success** (1 card) - Ace of Hearts (salvation mechanism)
2. **Failure Counter** (4 cards) - All Kings (escalating threat)
3. **Narrative** (3 cards) - Remaining Aces (bonus/help cards, do NOT trigger damage unless modified)
4. **Challenge** (16 cards) - Odd-numbered cards: 3, 5, 7, 9 (trigger damage checks)
5. **Event** (28 cards) - Even-numbered cards: 2, 4, 6, 8, 10, J, Q (safe from damage)

**Total:** 1 + 4 + 3 + 16 + 28 = 52 cards ✓

### Special Card Modifiers

Narrative cards can optionally include special one-time modifiers:

- **`skip-damage`** - Skip the next damage check (max 1 per game)
  - Syntax: `## Narrative: skip-damage`
  - Example: "A moment of perfect timing saves you from the next danger"

- **`return-king`** - Return a previously drawn King to the deck (max 1 per game)
  - Syntax: `## Narrative: return-king`
  - Example: "A second chance to undo a catastrophic setback"

These modifiers are **optional** - standard `## Narrative` cards without modifiers are perfectly valid.

### Key Benefits

1. **No card identifiers needed** - Writers focus on story, not "7-hearts" or "Q-diamonds"
2. **Type-based organization** - Clear structure by card purpose
3. **Auto-assignment** - System handles deck construction automatically
4. **Future-proof** - Supports upcoming custom action system
5. **SRD-compliant** - Aligns with official Wretched and Alone mechanics
6. **Rich storytelling** - Paragraph-length descriptions with Markdown support
7. **Single file management** - One `.game.md` file contains everything

---

## File Structure

A complete game file looks like this:

```markdown
---
title: Future Lost
subtitle: A Dimm City Campaign
win-message: You have managed to repair the time machine and return home!
lose-message: The time machine has been damaged beyond repair
---

# Introduction

## Who You Are

You are a time traveler stranded in a dystopian future, desperately trying to
repair your damaged time machine before the authorities discover you.

## What Happened

Your journey through time went catastrophically wrong. The temporal distortion
field destabilized, throwing you into an unknown era. The time machine's core
systems are failing, and you're running out of time.

## Your Goal

You must gather the necessary components and knowledge to repair your time
machine and return home. But in this dark future, every action draws unwanted
attention, and failure means being lost in time forever.

---

# Card Deck

### Primary Success

**You find a survivor who knows how to repair the time machine**

This survivor is an engineer from before the collapse. She recognizes your time
machine's design and offers to help. With her expertise, you finally have a real
chance of getting home.

---

### Failure Counter

**A group of hostile survivors has spotted you**

They move through the ruins with purpose, weapons ready. You recognize the look
in their eyes - they've survived by taking from others.

---

### Failure Counter

**Your stash of resources is stolen**

---

### Failure Counter

**You get lost in a dangerous part of the city**

---

### Failure Counter

**The time machine suffers a major malfunction**

---

### Narrative: skip-damage

**A moment of perfect timing saves you**

In the chaos of your escape, something impossible happens. A piece of falling
debris catches on a support beam at the last second. The universe aligns in
your favor, just this once, shielding you from the next danger.

---

### Narrative: return-king

**A second chance manifests**

Against all odds, you discover a way to undo what seemed irreversible. The
catastrophe can be unwound, the damage repaired. Sometimes the universe gives
you a chance to rewrite your failures.

---

### Narrative

**A connection across time**

Late at night, you realize that somewhere in the past, the choices being made
will eventually save you. Time isn't a line - it's a web connecting moments
across centuries.

---

### Challenge

**You're betrayed by a survivor you trusted**

You thought you had made an ally, someone who understood the value of cooperation.
But they led you into an ambush.

---

[... 15 more Challenge cards ...]

---

### Event

**You discover a hidden stash of resources**

Behind a false wall in an abandoned building, you find a prepper's cache:
canned food, clean water, tools, and even some medical supplies.

---

[... 27 more Event cards ...]
```

---

## Format Specification

### 1. Frontmatter (Required)

```yaml
---
title: Your Game Title          # Required
subtitle: Your Game Subtitle    # Optional
win-message: Victory message    # Required
lose-message: Defeat message    # Required
---
```

**Only 4 fields total** - simple and focused

### 2. Introduction Sections (Required)

Use any H2 headings (`## Your Heading`) to organize the introduction. Common sections:

- `## Who You Are` - Character/setting introduction
- `## What Happened` - How they got here
- `## Your Goal` - What they're trying to achieve

Supports **full Markdown** formatting.

### 3. Card Deck (Required)

Cards are organized by type using H3 headings:

```markdown
### [Card Type]

**[Short description shown in game log]**

[Optional longer story shown when card is drawn. Can be multiple paragraphs
with full Markdown support.]

---
```

**Card counts:**
- Primary Success: exactly 1
- Failure Counter: exactly 4
- Narrative: exactly 3
- Challenge: exactly 16
- Event: exactly 28

Total = 52 cards

### 4. Optional Special Modifiers

Narrative cards can include special one-time modifiers:

```markdown
### Narrative: skip-damage

**A moment of perfect timing saves you**

Story here...

---

### Narrative: return-king

**A second chance manifests**

Story here...
```

**Available modifiers:**
- `skip-damage` - Skip next damage check (max 1 per game)
- `return-king` - Return King to deck (max 1 per game)

These are **optional** - standard `### Narrative` cards are valid without modifiers.

### 5. Optional Manual Card Assignment

For advanced creators who want specific cards in specific positions:

```markdown
### Challenge: 7-hearts

**Specific event for seven of hearts**

Story here...
```

Can be combined with modifiers:

```markdown
### Narrative: A-clubs, skip-damage

**Assigned to Ace of Clubs with skip-damage modifier**

Story here...
```

The `: 7-hearts` notation explicitly assigns this card. Useful for:
- Thematic suit matching (hearts = people, diamonds = resources, etc.)
- Specific rank significance in your narrative
- Future custom action assignment

---

## Advantages

### For Writers

1. **No deck management** - Just write cards grouped by purpose
2. **Clear structure** - Type headers show card function at a glance
3. **Focus on narrative** - Card identifiers are implementation details
4. **Flexible length** - Write short or long stories as needed
5. **Narrative cards** - New space for reflection and character development
6. **Familiar tools** - Works with any text editor
7. **Version control** - Easy to track changes in Git

### For Implementation

1. **Simple parsing** - Type headers + auto-assignment
2. **Validated by default** - Count requirements enforced
3. **Future-proof** - Easy to add custom actions
4. **Backward compatible** - Can convert from/to old CSV format
5. **Explicit override** - Advanced users can specify exact cards

### For Players

1. **Better storytelling** - Writers focus on narrative, not technical details
2. **Consistent experience** - Standard deck ensures balanced gameplay
3. **Richer content** - Narrative cards add depth
4. **Thematic coherence** - Writers group related events together

---

## Universal Simplifications

These simplifications apply to the system:

### 1. Remove Label Customization

- Use smart defaults for all UI text
- Only expose: `title`, `subtitle`, `win-message`, `lose-message`
- **Reduces configuration from 38+ fields to 4**

### 2. Remove Theme/Styling

- Use single, polished default theme
- Remove CSS customization entirely
- Remove dice theme configuration
- **Focus on content, not presentation**

### 3. Simplified Card Types

- **Primary Success** - Ace of Hearts only (activates salvation countdown)
- **Failure Counter** - All Kings (4 revealed = instant game over)
- **Narrative** - Remaining Aces (bonus/help cards, do NOT trigger damage unless modified)
  - Each Ace adds +1 to bonus counter (reduces damage)
  - May include `skip-damage` or `return-king` modifiers (max 1 each)
  - Standard Narrative cards are safe - no damage checks
  - Only trigger damage if explicitly given a damage-trigger modifier (future feature)
- **Challenge** - Odd-numbered cards: 3, 5, 7, 9 (trigger damage checks)
- **Event** - Even-numbered cards: 2, 4, 6, 8, 10, J, Q (safe from damage)

### 4. Smart Validation

- Auto-check for exactly 52 cards (1+4+3+16+28)
- Warn if missing Primary Success (Ace of Hearts)
- Warn if not exactly 4 Failure Counters
- Warn if not exactly 3 Narrative cards (including modifiers)
- Validate special modifiers:
  - Maximum 1 `skip-damage` modifier
  - Maximum 1 `return-king` modifier
  - Only on Narrative cards
- Validate no duplicate card assignments
- Verify card type counts match requirements

### 5. Rich Card Descriptions

- **Short description** (1 sentence) - shown in game log
- **Full story** (optional, up to 500 words) - shown when card is drawn
- Support Markdown formatting in stories (emphasis, lists, paragraphs)

### 6. Introduction Structure

- **Flexible sections** - Use any H2 headings that make sense for your story
- **Common patterns** - Who You Are, What Happened, Your Goal
- Both sections support Markdown and long-form text

---

## Publishing Workflow

### Option 1: Direct Upload

1. Write `my-game.game.md` file
2. Upload to DC Solo RPG website
3. System converts to internal format automatically
4. Share link: `https://dcsolorpg.com/game/my-game`

### Option 2: Repository-Based

1. Create `my-game.game.md` in `/static/games/` folder
2. Commit to Git repository
3. Push to main branch
4. System automatically detects and publishes
5. Share link: `https://dcsolorpg.com/game/my-game`

### Option 3: CLI Tool

```bash
# Publish from command line
npm run publish-game static/games/my-game.game.md

# Output:
# ✓ Validated: 52 cards, all types correct
# ✓ Uploaded to server
# ✓ Published at: https://dcsolorpg.com/game/my-game
```

---

## Complete Template

See [`simplified-type-based-format.md`](./simplified-type-based-format.md) for:

- Complete format specification
- Card type guidelines aligned with SRD
- Parsing algorithm details
- Example cards for each type
- Progressive rule teaching guidance
- Full working template

---

## Next Steps

### For Implementation

1. **Build parser** - Implement markdown-to-game-data converter
2. **Create validator** - Ensure card counts and structure are correct
3. **Update documentation** - Creator guide with examples
4. **Test with creators** - Get feedback from 3-5 non-technical users

### For Creators

1. **Review format** - Read `simplified-type-based-format.md`
2. **Try template** - Use the complete template as starting point
3. **Provide feedback** - What works? What's confusing?
4. **Create new content** - Build games with simplified workflow

---

## Why This Format?

**This type-based format is the recommended approach** because:

1. **Lowest cognitive load for writers** - Focus on story, not deck management
2. **Clear mechanical purpose** - Each card type has explicit SRD-aligned function
3. **Auto-assignment removes tedious work** - System handles the 52-card deck construction
4. **Narrative cards enable richer storytelling** - SRD "bonus/help" cards provide space for reflection
5. **Optional strategic depth** - Special modifiers (skip-damage, return-king) add tactical gameplay
6. **Simple modifier system** - Type headers capture everything; no complex data structures
7. **Future-proof for extensions** - Easy to add custom modifiers as engine evolves
8. **Easy to validate** - Counts are known (1+4+3+16+28 = 52 cards)
9. **Natural organization by function** - Writers group by mechanical purpose, not arbitrary card IDs
10. **SRD-compliant** - Aligns perfectly with official Wretched and Alone mechanics
11. **Single file simplicity** - No juggling multiple formats
12. **Version control friendly** - Plain text, easy diffs, meaningful commit history

The format strikes the perfect balance between **simplicity for creators** and **flexibility for the engine**, while maintaining full compatibility with the **Wretched and Alone SRD** standard.

**Key Design Philosophy:** The format avoids unnecessary complexity. Inherent dual behaviors (like Primary Success activating salvation AND triggering damage) are handled naturally by game logic, not special syntax. Only truly optional enhancements (skip-damage, return-king) need explicit modifiers.

---

## Additional Resources

- **Full Specification**: [`simplified-type-based-format.md`](./simplified-type-based-format.md)
- **Mechanics Guide**: [`wretched-alone-mechanics-guide.md`](./wretched-alone-mechanics-guide.md)
- **SRD Compliance**: All docs aligned with Wretched and Alone SRD
- **Example Game**: [`type-based-future-lost.game.md`](./type-based-future-lost.game.md)

---

**End of Document**

*This configuration approach simplifies game creation while maintaining the depth and balance of the Wretched and Alone framework.*
