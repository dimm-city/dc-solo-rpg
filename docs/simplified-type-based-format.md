# Simplified Markdown Format: Type-Based Cards

This document proposes a simplified markdown format that focuses on **card types** rather than card identifiers, making it significantly easier for writers to create games while remaining flexible for future engine enhancements.

## Attribution

This format is designed for games using the **Wretched and Alone SRD** (System Reference Document), a solo journaling RPG system that uses a standard 52-card deck (The Oracle) and a block tower as core mechanics. All card type definitions and mechanics align with the official SRD.

---

## Overview

Instead of requiring writers to specify card identifiers (like "A-hearts" or "3-diamonds"), they simply write cards organized by **type**. The system automatically assigns cards to the standard 52-card deck (The Oracle) based on order, or allows explicit assignment for special cases.

### Key Improvements Over Previous Variants

1. **No card identifiers needed** - Writers focus on story, not deck management
2. **Type-based organization** - Clear structure by card purpose
3. **Auto-assignment** - System handles deck construction
4. **Future-proof** - Supports upcoming action system
5. **Narrative cards** - New type for reflective/story moments

---

## Card Types

Based on the **Wretched and Alone SRD** mechanics:

### 1. Primary Success (Salvation)
- **Count**: Exactly 1 card (Ace of Hearts)
- **SRD Term**: "Salvation" - the main path to victory
- **Mechanics**: Has 10 tokens placed on it. At the end of each round, roll a die - on a 6, remove one token. Win when all tokens are removed.
- **Purpose**: Main victory condition with <1% win rate by design
- **Note**: The game is designed to be nearly impossible to win; the journey and story matter more than victory
- **Final Tension**: Per SRD, achieving salvation "may come with a final pull from the tower" - even success carries risk of last-moment failure, creating dramatic tension

### 2. Failure Counter
- **Count**: Exactly 4 cards (all Kings)
- **SRD Mechanics**: Revealing all 4 Kings = instant game over
- **Purpose**: Escalating existential threat throughout the game
- **Note**: Each King revealed increases tension and moves closer to inevitable failure

### 3. Challenge
- **Count**: 16 cards (odd-numbered cards: 3, 5, 7, 9)
- **SRD Mechanics**: "Usually requires you to pull from the tower" - odd-numbered cards **usually** trigger a block tower pull. If tower falls = game over
- **Purpose**: Immediate dangerous moments that physically test fate through the tower
- **Note**: Only odd numbered cards 3-9, excluding Aces (4 ranks × 4 suits = 16 cards). The "usually" qualifier preserves designer flexibility per SRD intent

### 4. Event
- **Count**: 28 cards (even-numbered cards: 2, 4, 6, 8, 10, J, Q)
- **SRD Mechanics**: "Usually safe" - even-numbered cards **usually** don't require tower pulls
- **Purpose**: Moments of respite, discovery, world-building, and narrative development
- **Note**: These cards provide breathing room between challenges (7 ranks × 4 suits = 28 cards, excluding Kings which are Failure Counters). The "usually" qualifier preserves designer flexibility per SRD intent

### 5. Narrative (Bonus/Help Cards)
- **Count**: 3 cards (remaining Aces: A♦, A♣, A♠)
- **SRD Term**: "Bonus or help in your plight"
- **Mechanics**: Provides some advantage or relief; does NOT trigger damage checks unless modified
- **Purpose**: Reflective moments, emotional beats, and small victories that help sustain hope
- **Special**: Writers can use these for character development, connections, or moments of beauty amid despair
- **Note**: Standard Narrative cards are safe moments of respite. They only trigger damage if explicitly given a damage-trigger modifier (future feature)

---

## Special Card Modifiers

Per the Wretched and Alone SRD, some cards can have **special one-time effects** beyond their base type. These are specified using modifiers in the card type header.

### Available Special Modifiers

#### 1. Skip Damage (`skip-damage`)
- **Can be assigned to**: ONE Narrative card only
- **Effect**: Player may skip the next damage check when instructed
- **Example text**: *"The next time you are told to pull from the tower you may choose not to"*
- **Usage**: One-time only per game
- **Strategic value**: Save for critical moments when resources are low

**Example:**
```markdown
#### Narrative: skip-damage

**A stroke of incredible luck protects you**

This moment of grace shields you from the next danger. The next time you would
pull from the tower, you may choose not to.
```

#### 2. Return King (`return-king`)
- **Can be assigned to**: ONE Narrative card only
- **Effect**: Allows player to shuffle a previously drawn King back into the deck
- **Example text**: *"If you have previously drawn the King of Spades you may shuffle it back into the deck"*
- **Usage**: One-time only per game
- **Strategic value**: Resets the failure counter, providing critical relief

**Example:**
```markdown
#### Narrative: return-king

**A second chance emerges from the darkness**

Against all odds, you find a way to undo a catastrophic setback. If you have
previously drawn the King of Spades, you may shuffle it back into the deck.
```

### Combining Modifiers with Card Assignment

You can combine explicit card assignment with special modifiers:

```markdown
#### Narrative: A-clubs, skip-damage

**A moment of perfect timing saves you**

The universe aligns in your favor. When danger comes, you'll have one chance
to avoid it entirely.
```

### Note on "Multiple Mechanics"

The Primary Success card inherently has dual behavior (activates salvation countdown AND may trigger damage check), but this is handled by standard game logic for all Aces - no special syntax needed.

---

## Format Example

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
chance of getting home. She'll need time to study the damage, but hope fills
your heart for the first time since you arrived.

Her name is Dr. Chen, and she was part of the team that first theorized temporal
mechanics. She thought she was the last one who understood the technology.
Finding you, and your machine, has reignited something in her eyes - purpose.

---

### Failure Counter

**A group of hostile survivors has spotted you**

They move through the ruins with purpose, weapons ready. You recognize the look
in their eyes - they've survived by taking from others, and they've marked you
as their next target.

---

### Failure Counter

**Your stash of resources is stolen**

You return to your hideout to find it ransacked. Everything you'd carefully
gathered - food, tools, spare parts - gone. Someone was watching, waiting for
you to leave. The violation leaves you vulnerable and paranoid.

---

### Failure Counter

**You get lost in a dangerous part of the city**

---

### Failure Counter

**The time machine suffers a major malfunction**

---

### Narrative

**A moment of hope amid the ruins**

As the sun sets over the broken skyline, you find yourself on a rooftop garden.
Somehow, plants still grow here - tomatoes, herbs, even flowers. Someone tended
this place with love. For a moment, you remember why you have to get home, why
all of this matters. The world may be broken, but life persists.

You pick a tomato, the first fresh food you've had in weeks. As you eat it,
tears stream down your face. You will survive this. You will make it home.

---

### Narrative

**The weight of displacement**

You find an old photograph in the rubble - a family smiling at the camera,
taken maybe twenty years ago in your time, but a century in the past here.
What happened to them? Did they survive the collapse? Did their children?

The temporal paradox makes your head spin. This is someone's future, but it's
your present. If you succeed, if you fix your machine and leave, will anything
you've done here matter? Will anyone remember?

The questions haunt you as you carefully pocket the photograph.

---

### Narrative

**A connection across time**

---

### Challenge

**You're betrayed by a survivor you trusted**

You thought you had made an ally, someone who understood the value of cooperation
in this harsh world. But they led you into an ambush, and their friends took
everything you were carrying. You managed to escape, but the betrayal stings
worse than your injuries.

Trust, you realize, is the rarest resource in this world.

---

### Challenge

**A group of survivors tries to steal your supplies**

You hear them before you see them - whispers and footsteps. They think you're
an easy mark, alone and distracted. But you've survived too long to be caught
off guard. The confrontation is tense, weapons drawn, until they realize you're
not worth the risk. They back off, but you know you'll need to be more careful.

---

### Challenge

**You're injured in a fight with a survivor**

---

### Challenge

**You fall into a trap set by other survivors**

---

### Challenge

**You're caught in a dispute between survivor factions**

---

### Challenge

**You're exposed to harmful radiation while scavenging**

---

### Challenge

**You're trapped in a collapsed building**

---

### Challenge

**You're chased by a pack of mutated animals**

---

### Challenge

**A piece of your time machine malfunctions**

---

### Challenge

**A malfunctioning robot attacks you**

---

### Challenge

**You're pursued by a rogue AI**

---

### Challenge

**You're caught in a toxic gas leak**

---

### Challenge

**A valuable item you found turns out to be useless**

---

### Challenge

**A valuable item you found breaks**

---

### Challenge

**You accidentally lose some of your supplies**

---

### Challenge

**You find a stash of spoiled food**

---

### Challenge

**You accidentally wander into a dangerous part of the city**

---

### Challenge

**A piece of your time machine breaks down**

---

### Challenge

**You're caught in a territorial dispute between survivor groups**

---

### Challenge

**A survivor you trusted betrays you**

---

### Challenge

**You get lost and wander into danger**

---

### Challenge

**Equipment failure at a critical moment**

---

### Event

**You discover a hidden stash of resources**

Behind a false wall in an abandoned building, you find a prepper's cache:
canned food, clean water, tools, and even some medical supplies. Everything
is still sealed and usable. This discovery gives you the resources you need
to survive while working on the time machine.

---

### Event

**You find a map of the city, helping you navigate safely**

The map shows safe routes, danger zones, and even marks locations of interest.
Someone took the time to update this after the collapse, marking radiation
zones and mutant territories. With this knowledge, you can avoid the worst
dangers and find the parts you need more efficiently.

---

### Event

**You encounter a helpful survivor**

---

### Event

**A survivor offers to trade useful items**

---

### Event

**A survivor shares valuable information about the city**

---

### Event

**A survivor helps you find a safe route through a dangerous area**

---

### Event

**You meet a survivor who offers to help you**

---

### Event

**You find a survivor who can repair a part of your time machine**

---

### Event

**You discover a cache of useful tools**

---

### Event

**You find a map of the city**

---

### Event

**You find a working vehicle**

---

### Event

**You find a source of clean water**

---

### Event

**You find a well-stocked abandoned shop**

---

### Event

**You're given food by another survivor while scavenging**

---

### Event

**You find an abandoned house with some food still inside**

---

### Event

**You discover a shortcut through the city**

---

### Event

**You find a safe hideout**

---

### Event

**You discover a safe route through a dangerous part of the city**

---

### Event

**You find a safe route through a dangerous area**

---

### Event

**You find a hidden underground bunker**

---

### Event

**You find a working computer**

---

### Event

**You manage to deactivate a dangerous AI**

---

### Event

**You find a piece of technology that can aid in your repair**

---

### Event

**You find a complete toolkit for your time machine**

---

### Event

**You find some helpful parts among ruined buildings**

---

### Event

**You find a blueprint of the time machine**
```

---

## Card Assignment Rules

### Automatic Assignment (Default)

Cards are assigned to the deck in this order:

1. **Primary Success** → A♥ (Ace of Hearts)
2. **Failure Counters** (4 cards) → K♥, K♦, K♣, K♠ (all Kings)
3. **Narrative** (3 cards) → A♦, A♣, A♠ (remaining Aces)
4. **Challenge** (16 cards) → 3, 5, 7, 9 (odd-numbered cards, all suits, excluding Aces)
5. **Event** (28 cards) → 2, 4, 6, 8, 10, J, Q (even-numbered cards, all suits, excluding Kings)

Within each type, cards are assigned to suits in order: ♥ ♦ ♣ ♠, then ranks ascending.

### Manual Assignment (Optional)

For advanced creators who want specific cards in specific positions:

```markdown
### Challenge: 7-hearts

**Specific event for seven of hearts**

Story here...
```

The `: 7-hearts` notation explicitly assigns this card. Useful for:
- Thematic suit matching (hearts = people, diamonds = resources, clubs = places, spades = technology)
- Specific rank significance in your narrative
- Future custom action assignment

---

## Parsing Algorithm

```javascript
function parseTypeBasedFormat(markdown) {
  const sections = splitIntoSections(markdown);
  const config = parseFrontmatter(sections[0]);
  const introduction = parseIntroduction(sections[1]);

  // Collect cards by type
  const cardsByType = {
    'primary-success': [],
    'failure-counter': [],
    'narrative': [],
    'narrative-skip-damage': [],    // Special: skip damage modifier
    'narrative-return-king': [],    // Special: return king modifier
    'challenge': [],
    'event': []
  };

  for (const section of sections.slice(2)) {
    const { type, modifier, explicitAssignment, description, story } = parseCardSection(section);

    // Build the full type key (e.g., "narrative-skip-damage")
    const typeKey = modifier ? `${type}-${modifier}` : type;

    cardsByType[typeKey].push({
      description,
      story,
      explicitAssignment // e.g., "7-hearts" or null
    });
  }

  // Validate counts
  validateCardCounts(cardsByType);

  // Assign to deck
  const deck = assignCardsToDeck(cardsByType);

  return { config, introduction, deck };
}

function parseCardSection(section) {
  // Parse header: "## Type: card-assignment, modifier"
  const headerMatch = section.match(/^##\s+([^:\n]+)(?::\s+(.+))?/);
  if (!headerMatch) {
    throw new ParseError('Invalid card section header');
  }

  const type = normalizeType(headerMatch[1].trim());
  const modifiers = headerMatch[2] ? headerMatch[2].split(',').map(s => s.trim()) : [];

  // Separate explicit assignment from modifier
  let explicitAssignment = null;
  let modifier = null;

  for (const mod of modifiers) {
    if (isCardIdentifier(mod)) {
      // e.g., "7-hearts" or "A-clubs"
      explicitAssignment = mod;
    } else {
      // e.g., "skip-damage" or "return-king"
      modifier = mod;
    }
  }

  // Extract description and story
  const contentMatch = section.match(/\*\*(.+?)\*\*\n\n([\s\S]*)/);
  const description = contentMatch ? contentMatch[1] : '';
  const story = contentMatch ? contentMatch[2].trim() : '';

  return { type, modifier, explicitAssignment, description, story };
}

function isCardIdentifier(str) {
  // Matches patterns like: "A-hearts", "7-diamonds", "K-spades"
  return /^([A23456789]|10|[JQKA])-(?:hearts|diamonds|clubs|spades)$/i.test(str);
}

function assignCardsToDeck(cardsByType) {
  const deck = [];

  // Primary Success: A♥
  const primarySuccess = cardsByType['primary-success'][0];
  deck.push({
    card: 'A',
    suit: 'hearts',
    type: 'primary-success',
    description: primarySuccess.description,
    story: primarySuccess.story
  });

  // Failure Counters: All Kings
  const kingSuits = ['hearts', 'diamonds', 'clubs', 'spades'];
  cardsByType['failure-counter'].forEach((card, i) => {
    deck.push({
      card: 'K',
      suit: kingSuits[i],
      type: 'failure-counter',
      description: card.description,
      story: card.story
    });
  });

  // Narrative: Remaining Aces (including special modifiers)
  const narrativeSuits = ['diamonds', 'clubs', 'spades'];
  const allNarratives = [
    ...cardsByType['narrative'],
    ...cardsByType['narrative-skip-damage'],
    ...cardsByType['narrative-return-king']
  ];

  allNarratives.forEach((card, i) => {
    // Determine modifier from source
    let modifier = null;
    if (cardsByType['narrative-skip-damage'].includes(card)) {
      modifier = 'skip-damage';
    } else if (cardsByType['narrative-return-king'].includes(card)) {
      modifier = 'return-king';
    }

    deck.push({
      card: 'A',
      suit: narrativeSuits[i],
      type: 'narrative',
      modifier: modifier,  // null, "skip-damage", or "return-king"
      description: card.description,
      story: card.story
    });
  });

  // Challenge: Odd cards (3, 5, 7, 9) × 4 suits = 16 cards
  const challengeRanks = ['3', '5', '7', '9'];
  const allSuits = ['hearts', 'diamonds', 'clubs', 'spades'];
  let challengeIndex = 0;

  for (const rank of challengeRanks) {
    for (const suit of allSuits) {
      if (challengeIndex < cardsByType['challenge'].length) {
        const card = cardsByType['challenge'][challengeIndex];

        if (card.explicitAssignment) {
          // Use explicit assignment
          const [assignedRank, assignedSuit] = parseAssignment(card.explicitAssignment);
          deck.push({
            card: assignedRank,
            suit: assignedSuit,
            type: 'challenge',
            description: card.description,
            story: card.story
          });
        } else {
          // Auto-assign
          deck.push({
            card: rank,
            suit: suit,
            type: 'challenge',
            description: card.description,
            story: card.story
          });
        }

        challengeIndex++;
      }
    }
  }

  // Event: Even cards (2, 4, 6, 8, 10, J, Q) × 4 suits = 28 cards
  const eventRanks = ['2', '4', '6', '8', '10', 'J', 'Q'];
  let eventIndex = 0;

  for (const rank of eventRanks) {
    for (const suit of allSuits) {
      if (eventIndex < cardsByType['event'].length) {
        const card = cardsByType['event'][eventIndex];

        if (card.explicitAssignment) {
          const [assignedRank, assignedSuit] = parseAssignment(card.explicitAssignment);
          deck.push({
            card: assignedRank,
            suit: assignedSuit,
            type: 'event',
            description: card.description,
            story: card.story
          });
        } else {
          deck.push({
            card: rank,
            suit: suit,
            type: 'event',
            description: card.description,
            story: card.story
          });
        }

        eventIndex++;
      }
    }
  }

  return deck;
}

function validateCardCounts(cardsByType) {
  const errors = [];

  // Check fixed counts
  if (cardsByType['primary-success'].length !== 1) {
    errors.push(`Expected 1 Primary Success card, found ${cardsByType['primary-success'].length}`);
  }

  if (cardsByType['failure-counter'].length !== 4) {
    errors.push(`Expected 4 Failure Counter cards, found ${cardsByType['failure-counter'].length}`);
  }

  // Narrative cards: total must be 3 (including special modifiers)
  const narrativeTotal =
    cardsByType['narrative'].length +
    cardsByType['narrative-skip-damage'].length +
    cardsByType['narrative-return-king'].length;

  if (narrativeTotal !== 3) {
    errors.push(`Expected 3 total Narrative cards, found ${narrativeTotal}`);
  }

  // Validate only one of each special modifier
  if (cardsByType['narrative-skip-damage'].length > 1) {
    errors.push('Only ONE Narrative card can have skip-damage modifier');
  }

  if (cardsByType['narrative-return-king'].length > 1) {
    errors.push('Only ONE Narrative card can have return-king modifier');
  }

  if (cardsByType['challenge'].length !== 16) {
    errors.push(`Expected 16 Challenge cards, found ${cardsByType['challenge'].length}`);
  }

  if (cardsByType['event'].length !== 28) {
    errors.push(`Expected 28 Event cards, found ${cardsByType['event'].length}`);
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('\n'));
  }
}
```

---

## Advanced: Future Extensibility

The format is designed to easily extend with custom modifiers as the engine evolves:

### Future Custom Modifiers Examples

```markdown
### Challenge: environmental-hazard

**You discover a hidden cache**

Gain 1d6 resources immediately.

---

### Event: tech-boost

**You find advanced technology**

Provides a temporary advantage against future challenges.

---

### Challenge: 7-hearts, radiation-zone

**A toxic gas leak fills the corridor**

Combines explicit card assignment with custom modifier.
```

### Parser Output with Custom Modifiers

The parser extracts the modifier and passes it to the engine:

```javascript
{
  card: '7',
  suit: 'hearts',
  type: 'challenge',
  modifier: 'radiation-zone',  // Engine can implement custom behavior
  description: 'A toxic gas leak fills the corridor',
  story: '...'
}
```

### Current vs Future Modifiers

**Current (Built-in):**
- `skip-damage` - Skip next damage check (one-time, Narrative only)
- `return-king` - Return King to deck (one-time, Narrative only)

**Future (Extensible):**
- `boost-resources` - Add resources
- `tech-boost` - Temporary advantage
- `environmental-hazard` - Custom challenge behavior
- `narrative-choice` - Branching story paths
- And any custom modifiers creators design

The simple modifier system means the format can grow without adding complexity to the basic structure.

---

## Benefits Over Previous Variants

### For Writers

1. **No deck management** - Just write cards grouped by purpose
2. **Clear structure** - Type headers show card function at a glance
3. **Focus on narrative** - Card identifiers are implementation details
4. **Flexible length** - Write short or long stories as needed
5. **Narrative cards** - New space for reflection and character development

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

## Progressive Rule Teaching (SRD Principle)

### Overview

A core principle of Wretched and Alone games is that **rules should be revealed progressively through play**, not presented as a complete rulebook upfront. The Oracle (card draws) teaches the game as you play.

### Design Philosophy from SRD

- Players learn mechanics through experiencing them in context
- Early cards should explain basic concepts naturally
- Complex mechanics are introduced only when they become relevant
- The act of drawing cards and encountering prompts is the tutorial
- Journaling responses reinforces understanding organically

### Embedding Tutorial Elements in Prompts

When writing card content, content creators should:

1. **Early Challenge Cards** - Include gentle reminders about tower mechanics
   - Example: "Draw a block from the tower carefully. If it falls, your journey ends here."

2. **First Narrative Card** - Can explain the bonus/hope mechanic narratively
   - Example: "This moment of peace steadies your hand - when danger comes, you'll be more prepared."

3. **Failure Counter Cards** - Remind players of the escalating threat
   - Example: "This is the [first/second/third/fourth] major setback. Four such disasters will end everything."

4. **Primary Success Card** - Explains the countdown mechanic when revealed
   - Example: "Hope is now real, but fragile. Each day, there's a small chance you'll get closer to salvation."

### What NOT to Do

- Don't create a separate "rules" section in the introduction
- Don't front-load all mechanics before play begins
- Don't assume players have read a manual
- Don't break immersion with meta-game language

### What TO Do

- Embed mechanical explanations in narrative context
- Let the first few cards be gentler, more explanatory
- Trust the card structure to teach through repetition
- Use the introduction to set tone and stakes, not teach rules

### Example: Tutorial Through Play

**Card 1 (Challenge)** - "You encounter your first real danger. The old building groans as you search for supplies. *Take a risk by drawing from the tower - if it falls, your story ends here.*"

**Card 2 (Event)** - "A moment of calm. You find a safe corner to rest and plan your next move. *No danger here - just breathe and record your thoughts.*"

**Card 3 (Narrative/Ace)** - "Against all odds, you discover something that gives you hope. *This small victory will help you survive what comes next - you'll be a little more resilient when danger strikes again.*"

This progressive teaching respects player intelligence while ensuring they understand mechanics through natural discovery.

---

## Card Type Guidelines (Aligned with SRD)

#### Primary Success (Salvation)
- **SRD Context**: This represents the ultimate hope - the slim chance of escape or victory
- The turning point where genuine salvation becomes possible
- Should feel monumental and earned when revealed
- Consider making this a person (ally/mentor), discovery (crucial knowledge), or breakthrough (final piece needed)
- Remember: Even with this card revealed, winning requires removing 10 tokens at 1/6 chance per round

#### Failure Counter (4 cards)
- **SRD Context**: These are the inexorable forces driving toward defeat
- Escalating threats or catastrophic setbacks
- Each should feel substantial, dangerous, and world-changing
- Consider the progression: 1st King = external threat emerges, 2nd King = resources/safety lost, 3rd King = lost/trapped, 4th King = final catastrophic failure
- Each King revealed should deepen the sense that defeat is inevitable

#### Narrative (3 cards - Bonus/Help)
- **SRD Context**: Small mercies and moments of grace that sustain you
- Reflective moments that don't drive immediate action
- Brief respites that remind you why you're fighting
- Character development or emotional processing
- World-building that reveals theme and meaning
- Consider: 1 moment of unexpected beauty/hope, 1 connection to what was lost, 1 realization about self/situation
- These provide emotional fuel to continue the doomed journey
- **Special Mechanics**: Optionally assign `skip-damage` or `return-king` to ONE Narrative card each (see Multiple Mechanics section)

#### Challenge (16 cards - Tower Pulls)
- **SRD Context**: "Usually requires you to pull from the tower" - moments where fate is tested
- Immediate dangers that physically threaten through tower mechanics
- Conflicts, accidents, hostile encounters, disasters
- Equipment failures, environmental hazards, confrontations
- Balance severe immediate threats (4-6) with moderate dangers (10-12)
- Each tower pull increases instability - the more you draw, the closer to collapse
- Remember: The tower falling is often how these games end

#### Event (28 cards - Safe Cards)
- **SRD Context**: "Usually safe" - no tower pull, but not necessarily positive
- Can be neutral, positive, or even bittersweet
- Resource discoveries, helpful encounters, information gained
- Safe exploration, quiet moments, environmental details
- World-building that doesn't require immediate response
- Balance genuinely helpful (10-12), neutral/observational (10-12), and bittersweet (6-8)
- These cards let you breathe, journal, and develop the story without risking the tower

---

## Complete Template

```markdown
---
title: Your Game Title
subtitle: Your Game Subtitle
win-message: Your victory message
lose-message: Your defeat message
---

# Introduction

## Who You Are

Who is the player? What's their situation?

## What Happened

How did they get here? What went wrong?

## Your Goal

What are they trying to achieve? What's at stake?

---

# Card Deck

### Primary Success

**[Short description]**

[Optional longer story - this is your big reveal, make it meaningful]

---

### Failure Counter

**[Short description for first king]**

[Optional story]

---

### Failure Counter

**[Short description for second king]**

---

### Failure Counter

**[Short description for third king]**

---

### Failure Counter

**[Short description for fourth king]**

---

#### Narrative: skip-damage

**[Short description - one-time protection from danger]**

[Optional: A moment of incredible luck or perfect timing that shields you from
the next danger. Use this mechanic strategically when resources are low.]

---

#### Narrative: return-king

**[Short description - undo a catastrophic setback]**

[Optional: A second chance or way to reverse a major failure. If you've drawn
a King before, you can return it to the deck - once.]

---

### Narrative

**[Short description for third narrative card]**

[This should be a reflective or emotional beat - no special mechanics]

---

### Challenge

**[Short description - this triggers a failure check]**

[Optional story - 16 of these total]

---

[... 15 more Challenge cards ...]

---

### Event

**[Short description - safe or positive]**

[Optional story - 28 of these total]

---

[... 27 more Event cards ...]
```

---

## Conversion Tool

For migrating existing games:

```bash
# Convert old CSV + YAML to new format
npm run convert-to-markdown static/games/my-game

# Output: static/games/my-game.game.md
```

---

## Mechanics Coverage Summary

This format supports **all mechanics** described in the Wretched and Alone Mechanics Guide:

### Core Card Types (Fully Supported)
✅ **Primary Success (Salvation)** - 1 card (Ace of Hearts)
  - Activates win condition
  - Places 10 tokens
  - Begins countdown mechanic
  - May trigger damage check (designer choice)

✅ **Failure Counter** - 4 cards (all Kings)
  - Escalating threat tracker
  - 4th King = instant defeat
  - Keep visible during play
  - Even-ranked (no damage)

✅ **Narrative (Bonus/Help)** - 3 cards (remaining Aces)
  - Increment bonus counter (+1 damage reduction each)
  - Reflective/emotional content
  - May trigger damage checks (designer choice)
  - Can host special one-time mechanics

✅ **Challenge** - 16 cards (odd ranks: 3, 5, 7, 9)
  - Usually trigger damage checks
  - Immediate dangers
  - Tower pull mechanics

✅ **Event** - 28 cards (even ranks: 2, 4, 6, 8, 10, J, Q)
  - Usually safe from damage
  - Respite, discovery, world-building
  - No tower pulls required

### Special Modifiers (Fully Supported)
✅ **Skip Damage (`skip-damage`)** - One-time tower pull skip (Narrative only)
✅ **Return King (`return-king`)** - Shuffle King back to deck (Narrative only)
✅ **Explicit card assignment** - Manual placement for thematic suits
✅ **Bonus counter system** - Damage reduction from Aces (0-4)
✅ **Win condition countdown** - 10 tokens with dice rolls
✅ **Final damage roll** - SRD-compliant final tension
✅ **Primary Success dual behavior** - Salvation + damage check (handled by game logic)

### Designer Flexibility (SRD-Aligned)
✅ **"Usually" qualifier** - Odd/even rules are guidelines, not absolutes
✅ **Aces may or may not trigger damage** - Designer decides per game
✅ **Custom mechanics extensibility** - Future-proof for additional mechanics
✅ **Progressive rule teaching** - Tutorial through card prompts
✅ **Accessibility options** - Optional damage mechanics

### Validation & Error Checking
✅ **Card count validation** - Ensures exactly 52 cards (1+4+3+16+28)
✅ **Special modifier validation** - One-time modifiers assigned only once
✅ **Narrative-only modifiers** - Special modifiers restricted to Narrative cards
✅ **Duplicate detection** - No duplicate card assignments

---

## Recommendation

**This type-based format is the recommended approach** because:

1. **Lowest cognitive load for writers** - Focus on story, not deck management
2. **Clear mechanical purpose** - Each card type has explicit SRD-aligned function
3. **Auto-assignment removes tedious work** - System handles the 52-card deck construction
4. **Narrative cards enable richer storytelling** - SRD "bonus/help" cards provide space for reflection
5. **Future-proof for action system** - Easy to extend with custom mechanics
6. **Easy to validate** - Counts are known (1+4+3+16+28 = 52 cards)
7. **Natural organization by function** - Writers group by mechanical purpose, not arbitrary card IDs
8. **SRD-compliant** - Aligns perfectly with official Wretched and Alone mechanics
9. **Simple modifier system** - Optional modifiers add depth without complexity
10. **Special one-time modifiers** - Skip damage and return King for strategic relief

The format strikes the perfect balance between **simplicity for creators** and **flexibility for the engine**, while maintaining full compatibility with the **Wretched and Alone SRD** standard and supporting all mechanics documented in the official mechanics guide.

**Key Simplification:** The format avoids complex "multiple mechanics" arrays - the type header itself (e.g., `Narrative: skip-damage`) captures everything needed, and inherent dual behaviors (like Primary Success triggering both salvation and damage) are handled naturally by game logic.
