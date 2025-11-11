# Simplified Markdown Format: Type-Based Cards

This document proposes a simplified markdown format that focuses on **card types** rather than card identifiers, making it significantly easier for writers to create games while remaining flexible for future engine enhancements.

---

## Overview

Instead of requiring writers to specify card identifiers (like "A-hearts" or "3-diamonds"), they simply write cards organized by **type**. The system automatically assigns cards to the standard 52-card deck based on order, or allows explicit assignment for special cases.

### Key Improvements Over Previous Variants

1. **No card identifiers needed** - Writers focus on story, not deck management
2. **Type-based organization** - Clear structure by card purpose
3. **Auto-assignment** - System handles deck construction
4. **Future-proof** - Supports upcoming action system
5. **Narrative cards** - New type for reflective/story moments

---

## Card Types

Based on current and planned game mechanics:

### 1. Primary Success
- **Count**: Exactly 1 card (Ace of Hearts)
- **Mechanics**: Triggers success checks at end of each round
- **Purpose**: Main victory condition - players roll to remove tokens

### 2. Failure Counter
- **Count**: Exactly 4 cards (all Kings)
- **Mechanics**: Revealing all 4 = instant game over
- **Purpose**: Escalating threat throughout the game

### 3. Challenge
- **Count**: 24 cards (all odd-numbered cards: A, 3, 5, 7, 9, J)
- **Mechanics**: Triggers failure check - roll dice, tower takes damage
- **Purpose**: Immediate threats that test player luck
- **Note**: Excludes Ace of Hearts (Primary Success)

### 4. Event
- **Count**: 20 cards (all even-numbered cards: 2, 4, 6, 8, 10, Q)
- **Mechanics**: No immediate mechanical effect
- **Purpose**: World-building, resource discovery, safe moments

### 5. Narrative (NEW)
- **Count**: 3 cards (remaining Aces: A♦, A♣, A♠)
- **Mechanics**: Provides bonus point, no check triggered
- **Purpose**: Reflective moments, character development, story beats
- **Special**: Writers can use these for meta-narrative or emotional beats

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

## Primary Success

**You find a survivor who knows how to repair the time machine**

This survivor is an engineer from before the collapse. She recognizes your time
machine's design and offers to help. With her expertise, you finally have a real
chance of getting home. She'll need time to study the damage, but hope fills
your heart for the first time since you arrived.

Her name is Dr. Chen, and she was part of the team that first theorized temporal
mechanics. She thought she was the last one who understood the technology.
Finding you, and your machine, has reignited something in her eyes - purpose.

---

## Failure Counter

**A group of hostile survivors has spotted you**

They move through the ruins with purpose, weapons ready. You recognize the look
in their eyes - they've survived by taking from others, and they've marked you
as their next target.

---

## Failure Counter

**Your stash of resources is stolen**

You return to your hideout to find it ransacked. Everything you'd carefully
gathered - food, tools, spare parts - gone. Someone was watching, waiting for
you to leave. The violation leaves you vulnerable and paranoid.

---

## Failure Counter

**You get lost in a dangerous part of the city**

---

## Failure Counter

**The time machine suffers a major malfunction**

---

## Narrative

**A moment of hope amid the ruins**

As the sun sets over the broken skyline, you find yourself on a rooftop garden.
Somehow, plants still grow here - tomatoes, herbs, even flowers. Someone tended
this place with love. For a moment, you remember why you have to get home, why
all of this matters. The world may be broken, but life persists.

You pick a tomato, the first fresh food you've had in weeks. As you eat it,
tears stream down your face. You will survive this. You will make it home.

---

## Narrative

**The weight of displacement**

You find an old photograph in the rubble - a family smiling at the camera,
taken maybe twenty years ago in your time, but a century in the past here.
What happened to them? Did they survive the collapse? Did their children?

The temporal paradox makes your head spin. This is someone's future, but it's
your present. If you succeed, if you fix your machine and leave, will anything
you've done here matter? Will anyone remember?

The questions haunt you as you carefully pocket the photograph.

---

## Narrative

**A connection across time**

---

## Challenge

**You're betrayed by a survivor you trusted**

You thought you had made an ally, someone who understood the value of cooperation
in this harsh world. But they led you into an ambush, and their friends took
everything you were carrying. You managed to escape, but the betrayal stings
worse than your injuries.

Trust, you realize, is the rarest resource in this world.

---

## Challenge

**A group of survivors tries to steal your supplies**

You hear them before you see them - whispers and footsteps. They think you're
an easy mark, alone and distracted. But you've survived too long to be caught
off guard. The confrontation is tense, weapons drawn, until they realize you're
not worth the risk. They back off, but you know you'll need to be more careful.

---

## Challenge

**You're injured in a fight with a survivor**

---

## Challenge

**You fall into a trap set by other survivors**

---

## Challenge

**You're caught in a dispute between survivor factions**

---

## Challenge

**You're exposed to harmful radiation while scavenging**

---

## Challenge

**You're trapped in a collapsed building**

---

## Challenge

**You're chased by a pack of mutated animals**

---

## Challenge

**A piece of your time machine malfunctions**

---

## Challenge

**A malfunctioning robot attacks you**

---

## Challenge

**You're pursued by a rogue AI**

---

## Challenge

**You're caught in a toxic gas leak**

---

## Challenge

**A valuable item you found turns out to be useless**

---

## Challenge

**A valuable item you found breaks**

---

## Challenge

**You accidentally lose some of your supplies**

---

## Challenge

**You find a stash of spoiled food**

---

## Challenge

**You accidentally wander into a dangerous part of the city**

---

## Challenge

**A piece of your time machine breaks down**

---

## Challenge

**You're caught in a territorial dispute between survivor groups**

---

## Challenge

**A survivor you trusted betrays you**

---

## Challenge

**You get lost and wander into danger**

---

## Challenge

**Equipment failure at a critical moment**

---

## Event

**You discover a hidden stash of resources**

Behind a false wall in an abandoned building, you find a prepper's cache:
canned food, clean water, tools, and even some medical supplies. Everything
is still sealed and usable. This discovery gives you the resources you need
to survive while working on the time machine.

---

## Event

**You find a map of the city, helping you navigate safely**

The map shows safe routes, danger zones, and even marks locations of interest.
Someone took the time to update this after the collapse, marking radiation
zones and mutant territories. With this knowledge, you can avoid the worst
dangers and find the parts you need more efficiently.

---

## Event

**You encounter a helpful survivor**

---

## Event

**A survivor offers to trade useful items**

---

## Event

**A survivor shares valuable information about the city**

---

## Event

**A survivor helps you find a safe route through a dangerous area**

---

## Event

**You meet a survivor who offers to help you**

---

## Event

**You find a survivor who can repair a part of your time machine**

---

## Event

**You discover a cache of useful tools**

---

## Event

**You find a map of the city**

---

## Event

**You find a working vehicle**

---

## Event

**You find a source of clean water**

---

## Event

**You find a well-stocked abandoned shop**

---

## Event

**You're given food by another survivor while scavenging**

---

## Event

**You find an abandoned house with some food still inside**

---

## Event

**You discover a shortcut through the city**

---

## Event

**You find a safe hideout**

---

## Event

**You discover a safe route through a dangerous part of the city**

---

## Event

**You find a safe route through a dangerous area**

---

## Event

**You find a hidden underground bunker**

---

## Event

**You find a working computer**

---

## Event

**You manage to deactivate a dangerous AI**

---

## Event

**You find a piece of technology that can aid in your repair**

---

## Event

**You find a complete toolkit for your time machine**

---

## Event

**You find some helpful parts among ruined buildings**

---

## Event

**You find a blueprint of the time machine**
```

---

## Card Assignment Rules

### Automatic Assignment (Default)

Cards are assigned to the deck in this order:

1. **Primary Success** → A♥ (Ace of Hearts)
2. **Failure Counters** (4 cards) → K♥, K♦, K♣, K♠ (all Kings)
3. **Narrative** (3 cards) → A♦, A♣, A♠ (remaining Aces)
4. **Challenge** (24 cards) → 3, 5, 7, 9, J (odd cards, all suits)
5. **Event** (20 cards) → 2, 4, 6, 8, 10, Q (even cards, all suits)

Within each type, cards are assigned to suits in order: ♥ ♦ ♣ ♠, then ranks ascending.

### Manual Assignment (Optional)

For advanced creators who want specific cards in specific positions:

```markdown
## Challenge: 7-hearts

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
    'challenge': [],
    'event': []
  };

  for (const section of sections.slice(2)) {
    const { type, explicitAssignment, description, story } = parseCardSection(section);

    cardsByType[type].push({
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

function assignCardsToDeck(cardsByType) {
  const deck = [];

  // Primary Success: A♥
  deck.push({
    card: 'A',
    suit: 'hearts',
    type: 'primary-success',
    ...cardsByType['primary-success'][0]
  });

  // Failure Counters: All Kings
  const kingSuits = ['hearts', 'diamonds', 'clubs', 'spades'];
  cardsByType['failure-counter'].forEach((card, i) => {
    deck.push({
      card: 'K',
      suit: kingSuits[i],
      type: 'failure-counter',
      ...card
    });
  });

  // Narrative: Remaining Aces
  const narrativeSuits = ['diamonds', 'clubs', 'spades'];
  cardsByType['narrative'].forEach((card, i) => {
    deck.push({
      card: 'A',
      suit: narrativeSuits[i],
      type: 'narrative',
      ...card
    });
  });

  // Challenge: Odd cards (3, 5, 7, 9, J) × 4 suits
  const challengeRanks = ['3', '5', '7', '9', 'J'];
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
            ...card
          });
        } else {
          // Auto-assign
          deck.push({
            card: rank,
            suit: suit,
            type: 'challenge',
            ...card
          });
        }

        challengeIndex++;
      }
    }
  }

  // Event: Even cards (2, 4, 6, 8, 10, Q) × 4 suits (skip Q♠ = 23 cards)
  const eventRanks = ['2', '4', '6', '8', '10', 'Q'];
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
            ...card
          });
        } else {
          deck.push({
            card: rank,
            suit: suit,
            type: 'event',
            ...card
          });
        }

        eventIndex++;
      }
    }
  }

  return deck;
}

function validateCardCounts(cardsByType) {
  const expected = {
    'primary-success': 1,
    'failure-counter': 4,
    'narrative': 3,
    'challenge': 24,
    'event': 20
  };

  const errors = [];

  for (const [type, count] of Object.entries(expected)) {
    const actual = cardsByType[type].length;
    if (actual !== count) {
      errors.push(`Expected ${count} ${type} cards, found ${actual}`);
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('\n'));
  }
}
```

---

## Future-Proofing for Custom Actions

When the engine supports custom card actions, the format easily extends:

```markdown
## Challenge: custom-action-name

**Description**

Story...
```

Or with explicit assignment:

```markdown
## Challenge: 7-hearts, disable-technology

**A critical system failure disables nearby tech**

Story...
```

The parser can extract action names and pass them to the engine:

```javascript
{
  card: '7',
  suit: 'hearts',
  type: 'challenge',
  action: 'disable-technology', // Future use
  description: '...',
  story: '...'
}
```

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

## Card Type Guidelines

### Primary Success
- The turning point - hope arrives
- Should feel earned and significant
- Consider making this a character or ally

### Failure Counter (4 cards)
- Escalating threats or major setbacks
- Each should feel substantial and dangerous
- Consider: 1 external threat, 1 resource loss, 1 getting lost, 1 equipment failure

### Narrative (3 cards)
- Reflective moments that don't drive action
- Character development or emotional beats
- World-building that reveals theme
- Meta-commentary on the situation
- Consider: 1 moment of hope, 1 moment of doubt, 1 connection to home

### Challenge (24 cards)
- Immediate dangers requiring luck to overcome
- Conflicts, accidents, hostile encounters
- Equipment failures, environmental hazards
- Balance severe (4-6) and moderate (18-20) threats

### Event (20 cards)
- Neutral or positive developments
- Resource discoveries, helpful NPCs
- Safe exploration, information gathering
- Environmental details, safe moments
- Balance helpful (10-12) and neutral (8-10) events

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

## Primary Success

**[Short description]**

[Optional longer story - this is your big reveal, make it meaningful]

---

## Failure Counter

**[Short description for first king]**

[Optional story]

---

## Failure Counter

**[Short description for second king]**

---

## Failure Counter

**[Short description for third king]**

---

## Failure Counter

**[Short description for fourth king]**

---

## Narrative

**[Short description for first narrative card]**

[This should be a reflective or emotional beat - no immediate mechanical threat]

---

## Narrative

**[Short description for second narrative card]**

---

## Narrative

**[Short description for third narrative card]**

---

## Challenge

**[Short description - this triggers a failure check]**

[Optional story - 24 of these total]

---

[... 23 more Challenge cards ...]

---

## Event

**[Short description - safe or positive]**

[Optional story - 20 of these total]

---

[... 19 more Event cards ...]
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

## Recommendation

**This type-based format is the recommended approach** because:

1. Lowest cognitive load for writers
2. Clear mechanical purpose for each card type
3. Auto-assignment removes tedious work
4. Narrative cards enable richer storytelling
5. Future-proof for action system
6. Easy to validate (counts are known)
7. Natural organization by function

The format strikes the perfect balance between **simplicity for creators** and **flexibility for the engine**.
