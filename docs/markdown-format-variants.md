# Pure Markdown Game Configuration: Three Formatting Variants

This document presents three distinct markdown-based formats for DC Solo RPG game configuration. Each variant uses different markdown conventions to balance readability, parseability, and creator experience.

---

## Variant 1: Marp-Inspired Format

**Inspired by:** Marp (Markdown Presentation Ecosystem)
**Best for:** Creators familiar with presentation tools, those who want clear visual separation between cards

### Format Overview

Uses horizontal rules (`---`) as card separators, similar to how Marp separates slides. Each card is treated as a distinct "slide" with optional metadata in HTML comments.

### Example File: `future-lost.game.md`

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

## Your Goal

You must gather the necessary components and knowledge to repair your time
machine and return home. But in this dark future, every action draws unwanted
attention, and failure means being lost in time forever.

---
<!-- card: A♥ -->
<!-- type: primary-success -->

# You find a survivor who knows how to repair the time machine

This survivor is an engineer from before the collapse. She recognizes your time
machine's design and offers to help. With her expertise, you finally have a real
chance of getting home. She'll need time to study the damage, but hope fills
your heart for the first time since you arrived.

---
<!-- card: A♦ -->

# You discover a hidden stash of resources

Behind a false wall in an abandoned building, you find a prepper's cache:
canned food, clean water, tools, and even some medical supplies. Everything
is still sealed and usable. This discovery gives you the resources you need
to survive while working on the time machine.

---
<!-- card: A♣ -->

# You find a map of the city

The map shows safe routes, danger zones, and even marks locations of interest.
Someone took the time to update this after the collapse, marking radiation
zones and mutant territories. With this knowledge, you can avoid the worst
dangers and find the parts you need more efficiently.

---
<!-- card: A♠ -->

# You manage to repair a crucial part of your time machine

After hours of painstaking work, you finally get the quantum flux capacitor
working again. It's not perfect, but it's functional. Each successful repair
brings you one step closer to going home.

---
<!-- card: K♥ -->
<!-- type: failure-counter -->

# A group of hostile survivors has spotted you

---
<!-- card: K♦ -->
<!-- type: failure-counter -->

# Your stash of resources is stolen

---
<!-- card: K♣ -->
<!-- type: failure-counter -->

# You get lost in a dangerous part of the city

---
<!-- card: K♠ -->
<!-- type: failure-counter -->

# The time machine suffers a major malfunction

---
<!-- card: 3♥ -->

# You're betrayed by a survivor you trusted

You thought you had made an ally, someone who understood the value of cooperation
in this harsh world. But they led you into an ambush, and their friends took
everything you were carrying. You managed to escape, but the betrayal stings
worse than your injuries.

---
<!-- card: 4♥ -->

# A survivor offers to trade useful items

---
<!-- card: 5♥ -->

# A group of survivors tries to steal your supplies

You hear them before you see them - whispers and footsteps. They think you're
an easy mark, alone and distracted. But you've survived too long to be caught
off guard. The confrontation is tense, weapons drawn, until they realize you're
not worth the risk. They back off, but you know you'll need to be more careful.

---
<!-- card: 2♦ -->

# You discover a cache of useful tools

---
<!-- card: 3♦ -->

# You find a stash of spoiled food

The smell hits you before you even open the container. Days of searching, and
you find nothing but rotting provisions. You'll need to keep looking.

---
<!-- card: 10♠ -->

# You find some helpful parts among ruined buildings

```

### Parsing Rules

1. **Frontmatter**: YAML between opening `---` and first section
2. **Introduction**: Content before first card separator (before second `---`)
3. **Cards**: Each section between `---` separators
   - HTML comments provide metadata: `<!-- card: rank+suit -->`, `<!-- type: card-type -->`
   - First heading (H1) = short description
   - Remaining paragraphs = full story (optional)
   - Unicode card symbols: ♥ (hearts), ♦ (diamonds), ♣ (clubs), ♠ (spades)

### Advantages

- ✅ Visually clear card boundaries
- ✅ Clean, uncluttered markdown
- ✅ HTML comments don't render in previews
- ✅ Works well with Marp tools for presentations
- ✅ Easy to navigate in editors with markdown preview

### Disadvantages

- ⚠️ Requires HTML comment parsing
- ⚠️ Card metadata not visible in plain text readers
- ⚠️ Unicode symbols might not copy/paste well

---

## Variant 2: Code Block + Blockquote Format

**Inspired by:** Jekyll/Hugo frontmatter patterns
**Best for:** Developers, technical creators who prefer explicit structured data

### Format Overview

Uses fenced code blocks for card metadata and blockquotes for rich story content. This makes the structure explicit and easy to parse.

### Example File: `future-lost.game.md`

````markdown
---
title: Future Lost
subtitle: A Dimm City Campaign
win-message: You have managed to repair the time machine and return home!
lose-message: The time machine has been damaged beyond repair
---

# Introduction

> ## Who You Are
>
> You are a time traveler stranded in a dystopian future, desperately trying to
> repair your damaged time machine before the authorities discover you.

> ## Your Goal
>
> You must gather the necessary components and knowledge to repair your time
> machine and return home. But in this dark future, every action draws unwanted
> attention, and failure means being lost in time forever.

---

## Cards

```card
rank: A
suit: hearts
type: primary-success
```

**You find a survivor who knows how to repair the time machine**

> This survivor is an engineer from before the collapse. She recognizes your time
> machine's design and offers to help. With her expertise, you finally have a real
> chance of getting home. She'll need time to study the damage, but hope fills
> your heart for the first time since you arrived.

---

```card
rank: A
suit: diamonds
```

**You discover a hidden stash of resources**

> Behind a false wall in an abandoned building, you find a prepper's cache:
> canned food, clean water, tools, and even some medical supplies. Everything
> is still sealed and usable. This discovery gives you the resources you need
> to survive while working on the time machine.

---

```card
rank: A
suit: clubs
```

**You find a map of the city**

> The map shows safe routes, danger zones, and even marks locations of interest.
> Someone took the time to update this after the collapse, marking radiation
> zones and mutant territories. With this knowledge, you can avoid the worst
> dangers and find the parts you need more efficiently.

---

```card
rank: A
suit: spades
```

**You manage to repair a crucial part of your time machine**

> After hours of painstaking work, you finally get the quantum flux capacitor
> working again. It's not perfect, but it's functional. Each successful repair
> brings you one step closer to going home.

---

```card
rank: K
suit: hearts
type: failure-counter
```

**A group of hostile survivors has spotted you**

---

```card
rank: K
suit: diamonds
type: failure-counter
```

**Your stash of resources is stolen**

---

```card
rank: K
suit: clubs
type: failure-counter
```

**You get lost in a dangerous part of the city**

---

```card
rank: K
suit: spades
type: failure-counter
```

**The time machine suffers a major malfunction**

---

```card
rank: 3
suit: hearts
```

**You're betrayed by a survivor you trusted**

> You thought you had made an ally, someone who understood the value of cooperation
> in this harsh world. But they led you into an ambush, and their friends took
> everything you were carrying. You managed to escape, but the betrayal stings
> worse than your injuries.

---

```card
rank: 4
suit: hearts
```

**A survivor offers to trade useful items**

---

```card
rank: 5
suit: hearts
```

**A group of survivors tries to steal your supplies**

> You hear them before you see them - whispers and footsteps. They think you're
> an easy mark, alone and distracted. But you've survived too long to be caught
> off guard. The confrontation is tense, weapons drawn, until they realize you're
> not worth the risk. They back off, but you know you'll need to be more careful.

---

```card
rank: 2
suit: diamonds
```

**You discover a cache of useful tools**

---

```card
rank: 3
suit: diamonds
```

**You find a stash of spoiled food**

> The smell hits you before you even open the container. Days of searching, and
> you find nothing but rotting provisions. You'll need to keep looking.

---

```card
rank: 10
suit: spades
```

**You find some helpful parts among ruined buildings**

````

### Parsing Rules

1. **Frontmatter**: YAML between opening `---` and first section
2. **Introduction**: Content in blockquotes before "## Cards" heading
3. **Cards**: Each section with a ` ```card` code block
   - Code block contains YAML metadata (rank, suit, type)
   - Bold text immediately after = short description
   - Blockquote following = full story (optional)
   - Cards separated by `---`

### Advantages

- ✅ Explicit, structured metadata
- ✅ Syntax highlighting in code editors
- ✅ Easy to parse programmatically
- ✅ Metadata visible in plain text
- ✅ Blockquotes visually distinguish story content

### Disadvantages

- ⚠️ More verbose than other formats
- ⚠️ Blockquotes add visual noise
- ⚠️ Requires YAML parsing for card metadata
- ⚠️ More typing for creators

---

## Variant 3: Clean Heading Format

**Inspired by:** CommonMark specifications
**Best for:** Writers, non-technical creators who want minimal syntax

### Format Overview

Uses only standard markdown headings and text. No special syntax, HTML comments, or code blocks. The simplest possible format.

### Example File: `future-lost.game.md`

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

## Your Goal

You must gather the necessary components and knowledge to repair your time
machine and return home. But in this dark future, every action draws unwanted
attention, and failure means being lost in time forever.

---

# Card Deck

## A♥ - Primary Success

**You find a survivor who knows how to repair the time machine**

This survivor is an engineer from before the collapse. She recognizes your time
machine's design and offers to help. With her expertise, you finally have a real
chance of getting home. She'll need time to study the damage, but hope fills
your heart for the first time since you arrived.

## A♦

**You discover a hidden stash of resources**

Behind a false wall in an abandoned building, you find a prepper's cache:
canned food, clean water, tools, and even some medical supplies. Everything
is still sealed and usable. This discovery gives you the resources you need
to survive while working on the time machine.

## A♣

**You find a map of the city**

The map shows safe routes, danger zones, and even marks locations of interest.
Someone took the time to update this after the collapse, marking radiation
zones and mutant territories. With this knowledge, you can avoid the worst
dangers and find the parts you need more efficiently.

## A♠

**You manage to repair a crucial part of your time machine**

After hours of painstaking work, you finally get the quantum flux capacitor
working again. It's not perfect, but it's functional. Each successful repair
brings you one step closer to going home.

## K♥ - Failure Counter

**A group of hostile survivors has spotted you**

## K♦ - Failure Counter

**Your stash of resources is stolen**

## K♣ - Failure Counter

**You get lost in a dangerous part of the city**

## K♠ - Failure Counter

**The time machine suffers a major malfunction**

## 3♥

**You're betrayed by a survivor you trusted**

You thought you had made an ally, someone who understood the value of cooperation
in this harsh world. But they led you into an ambush, and their friends took
everything you were carrying. You managed to escape, but the betrayal stings
worse than your injuries.

## 4♥

**A survivor offers to trade useful items**

## 5♥

**A group of survivors tries to steal your supplies**

You hear them before you see them - whispers and footsteps. They think you're
an easy mark, alone and distracted. But you've survived too long to be caught
off guard. The confrontation is tense, weapons drawn, until they realize you're
not worth the risk. They back off, but you know you'll need to be more careful.

## 2♦

**You discover a cache of useful tools**

## 3♦

**You find a stash of spoiled food**

The smell hits you before you even open the container. Days of searching, and
you find nothing but rotting provisions. You'll need to keep looking.

## 10♠

**You find some helpful parts among ruined buildings**
```

### Parsing Rules

1. **Frontmatter**: YAML between opening `---` and first section
2. **Introduction**: Content between frontmatter and "# Card Deck" heading
3. **Cards**: Each H2 heading after "# Card Deck"
   - Heading format: `## [Rank][Suit]` or `## [Rank][Suit] - [Type]`
   - Rank: A, 2-10, J, Q, K
   - Suit: ♥ ♦ ♣ ♠ (Unicode symbols)
   - Type (optional): "Primary Success" or "Failure Counter"
   - First line after heading (bold) = short description
   - Following paragraphs = full story (optional)

### Alternative: ASCII Suits

For easier typing, support ASCII alternatives:

```markdown
## A-hearts - Primary Success
## K-diamonds - Failure Counter
## 3-clubs
## 10-spades
```

Mapping:
- `hearts` or `h` → ♥
- `diamonds` or `d` → ♦
- `clubs` or `c` → ♣
- `spades` or `s` → ♠

### Advantages

- ✅ Simplest format - only standard markdown
- ✅ Most readable in plain text
- ✅ No special syntax to learn
- ✅ Easy to write in any editor
- ✅ Renders beautifully in markdown previews
- ✅ No parsing ambiguity

### Disadvantages

- ⚠️ Unicode symbols might not work everywhere (ASCII alternative solves this)
- ⚠️ Heading format must be exact for parsing
- ⚠️ Less explicit structure than code block variant

---

## Comparison Matrix

| Feature                      | Variant 1: Marp | Variant 2: Code Block | Variant 3: Clean |
|------------------------------|-----------------|----------------------|------------------|
| **Ease of Writing**          | ⭐⭐⭐⭐        | ⭐⭐⭐               | ⭐⭐⭐⭐⭐       |
| **Readability**              | ⭐⭐⭐⭐⭐      | ⭐⭐⭐               | ⭐⭐⭐⭐⭐       |
| **Plain Text Clarity**       | ⭐⭐⭐          | ⭐⭐⭐⭐⭐           | ⭐⭐⭐⭐⭐       |
| **Parse Simplicity**         | ⭐⭐⭐          | ⭐⭐⭐⭐⭐           | ⭐⭐⭐⭐         |
| **Editor Support**           | ⭐⭐⭐⭐⭐      | ⭐⭐⭐⭐             | ⭐⭐⭐⭐⭐       |
| **No Special Syntax**        | ⭐⭐⭐          | ⭐⭐                 | ⭐⭐⭐⭐⭐       |
| **Metadata Visibility**      | ⭐⭐            | ⭐⭐⭐⭐⭐           | ⭐⭐⭐⭐         |
| **Visual Card Separation**   | ⭐⭐⭐⭐⭐      | ⭐⭐⭐⭐             | ⭐⭐⭐           |
| **Marp Compatibility**       | ⭐⭐⭐⭐⭐      | ⭐                   | ⭐               |

---

## Implementation: Parser Pseudo-code

### Variant 1: Marp Format Parser

```javascript
function parseMarpFormat(markdown) {
  // Split by --- to get sections
  const sections = markdown.split(/\n---\n/);

  // First section is frontmatter + introduction
  const [frontmatterRaw, ...cardSections] = sections;

  // Parse YAML frontmatter
  const frontmatterMatch = frontmatterRaw.match(/^---\n([\s\S]*?)\n---/);
  const config = yaml.parse(frontmatterMatch[1]);

  // Everything after frontmatter is introduction
  const introduction = frontmatterRaw.replace(/^---\n[\s\S]*?\n---\n/, '');

  // Parse cards
  const cards = cardSections.map(section => {
    // Extract HTML comments
    const cardMatch = section.match(/<!-- card: ([^>]+) -->/);
    const typeMatch = section.match(/<!-- type: ([^>]+) -->/);

    // Parse card notation (e.g., "A♥" or "K♠")
    const [rank, suit] = parseCardNotation(cardMatch[1]);

    // First H1 is short description
    const descMatch = section.match(/# (.+)/);
    const description = descMatch[1];

    // Remaining content is story
    const story = section
      .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
      .replace(/# .+\n/, '') // Remove heading
      .trim();

    return {
      card: rank,
      suit: convertSuitSymbol(suit),
      type: typeMatch ? typeMatch[1] : null,
      description,
      story: story || null
    };
  });

  return { config, introduction, cards };
}
```

### Variant 2: Code Block Format Parser

```javascript
function parseCodeBlockFormat(markdown) {
  // Parse frontmatter
  const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/);
  const config = yaml.parse(frontmatterMatch[1]);

  // Extract introduction (blockquotes before ## Cards)
  const introMatch = markdown.match(/\n---\n([\s\S]*?)\n## Cards/);
  const introduction = introMatch[1]
    .replace(/^> /gm, '') // Remove blockquote markers
    .trim();

  // Split by --- to get card sections
  const cardSections = markdown
    .split(/\n## Cards\n/)[1]
    .split(/\n---\n/);

  // Parse each card
  const cards = cardSections.map(section => {
    // Extract YAML from code block
    const metadataMatch = section.match(/```card\n([\s\S]*?)\n```/);
    const metadata = yaml.parse(metadataMatch[1]);

    // Extract description (bold text)
    const descMatch = section.match(/\*\*(.+?)\*\*/);
    const description = descMatch[1];

    // Extract story (blockquote)
    const storyMatch = section.match(/> ([\s\S]*?)(?:\n\n|$)/);
    const story = storyMatch
      ? storyMatch[1].replace(/^> /gm, '').trim()
      : null;

    return {
      card: metadata.rank,
      suit: metadata.suit,
      type: metadata.type || null,
      description,
      story
    };
  });

  return { config, introduction, cards };
}
```

### Variant 3: Clean Format Parser

```javascript
function parseCleanFormat(markdown) {
  // Parse frontmatter
  const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/);
  const config = yaml.parse(frontmatterMatch[1]);

  // Extract introduction (between frontmatter and # Card Deck)
  const introMatch = markdown.match(/\n---\n([\s\S]*?)\n# Card Deck/);
  const introduction = introMatch[1].trim();

  // Split into card sections by H2 headings
  const deckSection = markdown.split(/\n# Card Deck\n/)[1];
  const cardMatches = [...deckSection.matchAll(/## ([^\n]+)\n([\s\S]*?)(?=\n## |$)/g)];

  // Parse each card
  const cards = cardMatches.map(match => {
    const [, heading, content] = match;

    // Parse heading: "A♥ - Primary Success" or "3♦" or "K-hearts - Failure Counter"
    const { rank, suit, type } = parseCardHeading(heading);

    // First line (bold) is description
    const descMatch = content.match(/\*\*(.+?)\*\*/);
    const description = descMatch[1];

    // Remaining paragraphs are story
    const story = content
      .replace(/\*\*.+?\*\*\n+/, '') // Remove description
      .trim() || null;

    return {
      card: rank,
      suit: suit,
      type: type,
      description,
      story
    };
  });

  return { config, introduction, cards };
}

function parseCardHeading(heading) {
  // Support multiple formats:
  // "A♥ - Primary Success"
  // "A-hearts - Primary Success"
  // "10♠"
  // "K-diamonds - Failure Counter"

  const parts = heading.split(' - ');
  const cardPart = parts[0].trim();
  const type = parts[1]?.trim() || null;

  let rank, suit;

  if (cardPart.match(/[♥♦♣♠]/)) {
    // Unicode symbols
    const match = cardPart.match(/^([A-K0-9]+)([♥♦♣♠])$/);
    rank = match[1];
    suit = convertSuitSymbol(match[2]);
  } else {
    // ASCII format: "A-hearts"
    const match = cardPart.match(/^([A-K0-9]+)-(\w+)$/);
    rank = match[1];
    suit = match[2];
  }

  return { rank, suit, type };
}
```

---

## Recommendation

**Primary recommendation: Variant 3 (Clean Heading Format)** with ASCII alternative

### Reasons:

1. **Lowest barrier to entry** - Only standard markdown syntax
2. **Most readable** - Clean text without special characters or blocks
3. **Easy to write** - No HTML comments, code blocks, or blockquotes needed
4. **Universal editor support** - Works in any markdown editor
5. **Beautiful previews** - Renders perfectly in all markdown renderers
6. **Simple parsing** - Only need to handle headings and paragraphs
7. **ASCII fallback** - Solves Unicode symbol issues

### Suggested Implementation Order:

1. **Phase 1**: Implement Variant 3 with ASCII format (`A-hearts`)
2. **Phase 2**: Add Unicode symbol support as enhancement (`A♥`)
3. **Phase 3**: Optional - Add Variant 1 (Marp) for users who want it

### File Extension

Use `.game.md` to distinguish game files from regular markdown:
- `future-lost.game.md`
- `dungeon-crawler.game.md`
- `space-odyssey.game.md`

This allows:
- Special syntax highlighting in editors
- Automatic detection/parsing by game engine
- Clear file purpose identification

---

## Next Steps

1. **Build parser** for Variant 3 (Clean format)
2. **Create validator** to check:
   - Exactly 52 cards
   - One Ace of Hearts (primary-success)
   - Four Kings (failure-counter)
   - No duplicate cards
   - All required fields present
3. **Generate templates** with pre-filled structure
4. **Create converter** from existing V1 config + CSV to new format
5. **Write documentation** with examples and best practices

---

## Appendix: Full Template Example

### Variant 3 Template: `template.game.md`

```markdown
---
title: Your Game Title
subtitle: Your Game Subtitle
win-message: Your victory message here
lose-message: Your defeat message here
---

# Introduction

## Who You Are

Describe the player's character, their background, and the situation they
find themselves in. This sets the tone and context for the entire game.

## Your Goal

Explain what the player needs to accomplish. What are they trying to achieve?
What's at stake? Make it compelling and clear.

---

# Card Deck

## A-hearts - Primary Success

**Short description of what happens**

Optional longer story that provides more detail, atmosphere, and immersion.
This can be multiple paragraphs if needed.

## A-diamonds

**Short description**

## A-clubs

**Short description**

## A-spades

**Short description**

## K-hearts - Failure Counter

**Short description**

## K-diamonds - Failure Counter

**Short description**

## K-clubs - Failure Counter

**Short description**

## K-spades - Failure Counter

**Short description**

## Q-hearts

**Short description**

## Q-diamonds

**Short description**

## Q-clubs

**Short description**

## Q-spades

**Short description**

## J-hearts

**Short description**

## J-diamonds

**Short description**

## J-clubs

**Short description**

## J-spades

**Short description**

## 10-hearts

**Short description**

## 10-diamonds

**Short description**

## 10-clubs

**Short description**

## 10-spades

**Short description**

## 9-hearts

**Short description**

## 9-diamonds

**Short description**

## 9-clubs

**Short description**

## 9-spades

**Short description**

## 8-hearts

**Short description**

## 8-diamonds

**Short description**

## 8-clubs

**Short description**

## 8-spades

**Short description**

## 7-hearts

**Short description**

## 7-diamonds

**Short description**

## 7-clubs

**Short description**

## 7-spades

**Short description**

## 6-hearts

**Short description**

## 6-diamonds

**Short description**

## 6-clubs

**Short description**

## 6-spades

**Short description**

## 5-hearts

**Short description**

## 5-diamonds

**Short description**

## 5-clubs

**Short description**

## 5-spades

**Short description**

## 4-hearts

**Short description**

## 4-diamonds

**Short description**

## 4-clubs

**Short description**

## 4-spades

**Short description**

## 3-hearts

**Short description**

## 3-diamonds

**Short description**

## 3-clubs

**Short description**

## 3-spades

**Short description**

## 2-hearts

**Short description**

## 2-diamonds

**Short description**

## 2-clubs

**Short description**

## 2-spades

**Short description**
```
