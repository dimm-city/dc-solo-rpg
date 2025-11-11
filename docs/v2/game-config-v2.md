# Game Configuration V2: Simplified Creator Experience

## Executive Summary

This document proposes three distinct solutions for simplifying the game creation process in DC Solo RPG. The current system requires creators to manage multiple file formats (YAML, CSV, Markdown, CSS) which creates friction for non-technical users. Each solution prioritizes ease of creation, immersive storytelling, and simplified publishing while removing or greatly simplifying theming and UI customization.

### Current Pain Points

1. **Multiple file formats** - Requires knowledge of YAML, CSV, Markdown, and CSS
2. **File management** - Creators must manage 3-4 separate files per game
3. **Tedious customization** - 38+ label fields that most creators won't customize
4. **Complex theming** - CSS and dice themes add unnecessary complexity
5. **Limited card text** - Single-line descriptions limit storytelling potential
6. **Error-prone** - Syntax errors in YAML/CSV can break games

### Design Principles for V2

1. **Single source of truth** - Minimize file management
2. **Plain text where possible** - Use familiar formats
3. **Smart defaults** - Remove need to configure labels/styling
4. **Rich storytelling** - Support paragraph-length card descriptions
5. **Easy to publish** - Simple export/share workflow
6. **Validate early** - Catch errors before testing

---

## Solution 1: Single Markdown File (Simplest)

**Best for:** Writers, authors, and non-technical creators who are comfortable with Markdown

### Overview

Everything in one `.game.md` file using familiar Markdown syntax with YAML frontmatter for metadata and a simple card deck format. No separate CSV, no YAML config, no CSS needed.

### File Structure

```markdown
---
title: Future Lost
subtitle: A Dimm City Campaign
win-message: You have managed to repair the time machine and return home!
lose-message: The time machine has been damaged beyond repair
---

# Introduction

## Who You Are

You are a time traveler, an explorer of the temporal realms, who has accidentally
landed in a dystopian future. This future is a grim shadow of the world you once
knew, where society has collapsed, and dangerous creatures roam the streets.

## Your Mission

Your mission is to survive in this harsh and unfamiliar world while trying to
repair your time machine. You'll need to scavenge for resources, navigate through
the ruins, interact with other survivors, and deal with rogue technology.

---

# Card Deck

## Ace of Hearts - Primary Success
**You find a survivor who knows how to repair the time machine.**

This survivor is an engineer from before the collapse. She recognizes your time
machine's design and offers to help. With her expertise, you finally have a real
chance of getting home. She'll need time to study the damage, but hope fills
your heart for the first time since you arrived.

## Ace of Diamonds
**You discover a hidden stash of resources.**

Behind a false wall in an abandoned building, you find a prepper's cache:
canned food, clean water, tools, and even some medical supplies. Everything
is still sealed and usable. This discovery gives you the resources you need
to survive while working on the time machine.

## Ace of Clubs
**You find a map of the city, helping you navigate safely.**

The map shows safe routes, danger zones, and even marks locations of interest.
Someone took the time to update this after the collapse, marking radiation
zones and mutant territories. With this knowledge, you can avoid the worst
dangers and find the parts you need more efficiently.

## Ace of Spades
**You manage to repair a crucial part of your time machine.**

## King of Hearts - Failure Counter
**A group of hostile survivors has spotted you.**

## King of Diamonds - Failure Counter
**Your stash of resources is stolen.**

## King of Clubs - Failure Counter
**You get lost in a dangerous part of the city.**

## King of Spades - Failure Counter
**The time machine suffers a major malfunction.**

## 3 of Hearts
**You're betrayed by a survivor you trusted.**

You thought you had made an ally, someone who understood the value of cooperation
in this harsh world. But they led you into an ambush, and their friends took
everything you were carrying. You managed to escape, but the betrayal stings
worse than your injuries.

## 4 of Hearts
**A survivor offers to trade useful items.**

## 5 of Hearts
**A group of survivors tries to steal your supplies.**

You hear them before you see them - whispers and footsteps. They think you're
an easy mark, alone and distracted. But you've survived too long to be caught
off guard. The confrontation is tense, weapons drawn, until they realize you're
not worth the risk. They back off, but you know you'll need to be more careful.

---
```

### Processing Rules

1. **Frontmatter** - YAML between `---` markers (only title + 2 messages required)
2. **Introduction** - Everything between frontmatter and first `---`
3. **Cards** - Start with `## [Rank] of [Suit]` or `## [Rank] of [Suit] - [Type]`
   - Types: "Primary Success" or "Failure Counter" (optional for other cards)
   - First line after heading (bold) = short description (shown in log)
   - Following paragraphs = full card text (shown when drawn)
   - Cards without full text will only show the short description

### Advantages

- ✅ Single file to manage
- ✅ Familiar Markdown syntax
- ✅ Easy to write long-form card descriptions
- ✅ Works with any text editor
- ✅ Can be versioned in Git easily
- ✅ Minimalist frontmatter (3 required fields)
- ✅ Human-readable and easy to review

### Disadvantages

- ⚠️ Must follow heading format exactly
- ⚠️ Requires learning minimal YAML for frontmatter
- ⚠️ No visual preview while editing

### Publishing Workflow

1. Write `my-game.game.md` file
2. Upload to DC Solo RPG website or drop into `/static/games/` folder
3. System converts to internal format automatically
4. Share link: `https://dcsolorpg.com/game/my-game`

---

## Solution 2: Google Sheets + JSON Export (Most Accessible)

**Best for:** Creators who prefer spreadsheets and want real-time collaboration

### Overview

Use Google Sheets as the editing interface with three simple tabs: Game Info, Introduction, and Card Deck. Export to JSON via a custom menu option. No local files, no syntax errors, collaborative editing built-in.

### Google Sheet Structure

#### Tab 1: Game Info
```
| Field         | Value                                                    |
|---------------|----------------------------------------------------------|
| Title         | Future Lost                                               |
| Subtitle      | A Dimm City Campaign                                     |
| Win Message   | You have managed to repair the time machine!             |
| Lose Message  | The time machine has been damaged beyond repair          |
```

#### Tab 2: Introduction
```
| Section       | Content                                                  |
|---------------|----------------------------------------------------------|
| Who You Are   | You are a time traveler, an explorer of the temporal... |
| Your Mission  | Your mission is to survive in this harsh world while... |
```

#### Tab 3: Card Deck
```
| Rank | Suit     | Special Type      | Short Description                                    | Full Story (optional)                        |
|------|----------|-------------------|------------------------------------------------------|---------------------------------------------|
| A    | hearts   | Primary Success   | You find a survivor who knows how to repair...       | This survivor is an engineer from before... |
| A    | diamonds |                   | You discover a hidden stash of resources.            | Behind a false wall in an abandoned...      |
| K    | hearts   | Failure Counter   | A group of hostile survivors has spotted you.        |                                             |
| 3    | hearts   |                   | You're betrayed by a survivor you trusted.           | You thought you had made an ally...         |
```

### Features

1. **Template Sheet** - Start from a copy of the official template
2. **Data Validation** - Dropdowns for Rank, Suit, and Special Type
3. **Auto-numbering** - Formula checks you have exactly 52 cards
4. **Export Menu** - Custom Google Apps Script adds "DC Solo RPG" menu
   - Export to JSON (downloads .json file)
   - Validate Deck (checks for errors)
   - Preview Game (generates preview link)
5. **Collaboration** - Multiple creators can work simultaneously
6. **Comments** - Use sheet comments for feedback/notes

### Export Format (JSON)

```json
{
  "title": "Future Lost",
  "subtitle": "A Dimm City Campaign",
  "winMessage": "You have managed to repair the time machine!",
  "loseMessage": "The time machine has been damaged beyond repair",
  "introduction": {
    "whoYouAre": "You are a time traveler...",
    "yourMission": "Your mission is to survive..."
  },
  "deck": [
    {
      "card": "A",
      "suit": "hearts",
      "type": "primary-success",
      "description": "You find a survivor who knows how to repair...",
      "story": "This survivor is an engineer from before..."
    }
  ]
}
```

### Advantages

- ✅ Most familiar interface for non-technical users
- ✅ No syntax errors possible
- ✅ Data validation prevents common mistakes
- ✅ Built-in collaboration tools
- ✅ Works on any device (phone, tablet, desktop)
- ✅ Version history built into Google Sheets
- ✅ No installation required
- ✅ Can copy/paste from existing spreadsheets

### Disadvantages

- ⚠️ Requires Google account
- ⚠️ Must install Apps Script for export
- ⚠️ Less good for very long card stories (though multi-line cells work)
- ⚠️ Requires internet connection

### Publishing Workflow

1. Make a copy of official template sheet
2. Fill in Game Info, Introduction, and Card Deck tabs
3. Click "DC Solo RPG" menu → "Validate Deck" to check for errors
4. Click "DC Solo RPG" menu → "Export to JSON"
5. Upload JSON file to DC Solo RPG website
6. Share link: `https://dcsolorpg.com/game/my-game`

### Apps Script Code (Provided)

The official template includes a pre-installed Apps Script that:
- Validates card count (must be 52)
- Checks for duplicate cards
- Ensures all required fields are filled
- Generates properly formatted JSON
- Provides one-click export

---

## Solution 3: Interactive Web Creator (Most Powerful)

**Best for:** All users, especially those wanting live preview and guided creation

### Overview

A dedicated web application at `dcsolorpg.com/create` that guides creators through the game-building process with a visual interface, live preview, and automatic validation. No files to manage until export.

### Interface Design

#### Step 1: Game Basics
```
┌─────────────────────────────────────────────────────────┐
│ Create Your Game                                [Step 1/4]│
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Game Title *                                            │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Future Lost                                         │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ Subtitle (optional)                                     │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ A Dimm City Campaign                                │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ Win Message *                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ You managed to repair the time machine!             │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ Lose Message *                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ The time machine is damaged beyond repair           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│         [Back]                            [Next Step →] │
└─────────────────────────────────────────────────────────┘
```

#### Step 2: Introduction
```
┌─────────────────────────────────────────────────────────┐
│ Write Your Introduction                     [Step 2/4] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Who You Are *                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ You are a time traveler, an explorer of the        │ │
│ │ temporal realms, who has accidentally landed in a  │ │
│ │ dystopian future...                                │ │
│ │                                                     │ │
│ │                                          [250/1000] │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ Your Mission *                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Your mission is to survive in this harsh and       │ │
│ │ unfamiliar world while trying to repair your time  │ │
│ │ machine...                                          │ │
│ │                                          [180/1000] │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ℹ️ Tip: Use vivid language to immerse players in      │
│     your world. Set the tone and stakes.               │
│                                                          │
│         [← Back]                          [Next Step →] │
└─────────────────────────────────────────────────────────┘
```

#### Step 3: Card Deck Builder
```
┌─────────────────────────────────────────────────────────────────────┐
│ Build Your Card Deck                            [Step 3/4] 15/52 📊 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ ┌─ Add New Card ───────────────────────────────────────────────┐   │
│ │                                                                │   │
│ │  Rank: [A▾]  Suit: [hearts▾]  Type: [Primary Success▾]       │   │
│ │                                                                │   │
│ │  Short Description (shown in game log) *                      │   │
│ │  ┌────────────────────────────────────────────────────────┐   │   │
│ │  │ You find a survivor who knows how to repair the        │   │   │
│ │  │ time machine                                            │   │   │
│ │  └────────────────────────────────────────────────────────┘   │   │
│ │                                                                │   │
│ │  Full Story (optional, shown when card is drawn)              │   │
│ │  ┌────────────────────────────────────────────────────────┐   │   │
│ │  │ This survivor is an engineer from before the collapse. │   │   │
│ │  │ She recognizes your time machine's design and offers   │   │   │
│ │  │ to help. With her expertise, you finally have a real   │   │   │
│ │  │ chance of getting home...                     [250/500]│   │   │
│ │  └────────────────────────────────────────────────────────┘   │   │
│ │                                                                │   │
│ │  [Add Card]  or  [Add Card & Create Another]                  │   │
│ └────────────────────────────────────────────────────────────────┘   │
│                                                                      │
│ ┌─ Your Deck ──────────────────────────────────────────────────┐   │
│ │                                                                │   │
│ │  🃁 A♥ (Primary Success) - You find a survivor who knows...  │   │
│ │      [Edit] [Delete] [Preview]                                │   │
│ │                                                                │   │
│ │  🃁 A♦ - You discover a hidden stash of resources...         │   │
│ │      [Edit] [Delete] [Preview]                                │   │
│ │                                                                │   │
│ │  🃁 K♥ (Failure) - A group of hostile survivors...           │   │
│ │      [Edit] [Delete] [Preview]                                │   │
│ │                                                                │   │
│ │  ... 12 more cards ...                                        │   │
│ │                                                                │   │
│ │  [Bulk Import from CSV] [Generate Remaining Cards w/ AI]      │   │
│ └────────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ⚠️ You need 37 more cards to complete your deck (52 total)         │
│                                                                      │
│  [← Back]  [Save Draft]  [Preview Game]         [Next Step →]       │
└─────────────────────────────────────────────────────────────────────┘
```

#### Step 4: Review & Publish
```
┌─────────────────────────────────────────────────────────┐
│ Review & Publish                             [Step 4/4] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ✅ Game Title: Future Lost                              │
│ ✅ Introduction: Complete                                │
│ ✅ Card Deck: 52 cards (complete)                        │
│    • 1 Primary Success card                             │
│    • 4 Failure Counter cards                            │
│    • 47 Event cards                                     │
│                                                          │
│ ┌─ Preview Your Game ─────────────────────────────────┐ │
│ │                                                      │ │
│ │  [Live Preview Panel showing actual game interface] │ │
│ │                                                      │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─ Publishing Options ─────────────────────────────────┐ │
│ │                                                      │ │
│ │  Game URL Slug *                                     │ │
│ │  ┌───────────────────────────────────────────────┐  │ │
│ │  │ future-lost                    [Check Avail.]│  │ │
│ │  └───────────────────────────────────────────────┘  │ │
│ │                                                      │ │
│ │  Your game will be published at:                    │ │
│ │  https://dcsolorpg.com/game/future-lost             │ │
│ │                                                      │ │
│ │  □ Make game public (visible in game library)       │ │
│ │  □ Allow others to remix this game                  │ │
│ │                                                      │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│  [← Back]  [Save Draft]  [Export Files]  [Publish! 🚀] │
└─────────────────────────────────────────────────────────┘
```

### Key Features

1. **Guided Workflow** - Step-by-step process prevents overwhelming creators
2. **Live Validation** - Real-time feedback on errors/missing cards
3. **Progress Tracking** - Visual indicators show completion status
4. **Card Management** - Easy add/edit/delete with visual deck overview
5. **Live Preview** - Play test your game before publishing
6. **Draft Saving** - Auto-save to browser localStorage, optional account for cloud saves
7. **Export Options** - Download as .game.md, JSON, or ZIP
8. **AI Assist** (Optional) - Generate card suggestions based on your theme
9. **Templates** - Start from genre templates (Sci-Fi, Fantasy, Horror, etc.)
10. **Import** - Bring in existing CSV/YAML games for editing

### Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│ Frontend (React/Svelte)                              │
│  • Form validation & state management               │
│  • Live preview renderer                            │
│  • Export format generators                         │
├─────────────────────────────────────────────────────┤
│ Backend API (Optional for publishing)                │
│  • User accounts (optional)                         │
│  • Game storage & hosting                           │
│  • URL slug management                              │
│  • Community features (ratings, comments)           │
└─────────────────────────────────────────────────────┘
```

### Advantages

- ✅ Most user-friendly option
- ✅ No file management required
- ✅ Real-time validation prevents errors
- ✅ Live preview before publishing
- ✅ Works for both technical and non-technical users
- ✅ Can include AI assistance for card generation
- ✅ Handles all export formats
- ✅ Direct publishing to web (no upload needed)
- ✅ Built-in community features possible

### Disadvantages

- ⚠️ Requires building a web application
- ⚠️ Most development effort required
- ⚠️ Requires hosting infrastructure
- ⚠️ Depends on internet connection (unless offline PWA mode)

### Publishing Workflow

1. Visit `dcsolorpg.com/create`
2. Complete 4-step wizard
3. Preview and test your game
4. Click "Publish" button
5. Game is immediately available at your chosen URL
6. Share link: `https://dcsolorpg.com/game/your-game-slug`

---

## Comparison Matrix

| Feature                    | Solution 1: Markdown | Solution 2: Sheets | Solution 3: Web Creator |
|----------------------------|---------------------|-------------------|------------------------|
| **Ease of Learning**       | ⭐⭐⭐             | ⭐⭐⭐⭐⭐         | ⭐⭐⭐⭐⭐             |
| **No Installation**        | ⭐⭐⭐⭐           | ⭐⭐⭐⭐⭐         | ⭐⭐⭐⭐⭐             |
| **Offline Capable**        | ⭐⭐⭐⭐⭐         | ⭐                | ⭐⭐                   |
| **Collaboration**          | ⭐⭐               | ⭐⭐⭐⭐⭐         | ⭐⭐⭐⭐               |
| **Long-form Writing**      | ⭐⭐⭐⭐⭐         | ⭐⭐⭐             | ⭐⭐⭐⭐               |
| **Error Prevention**       | ⭐⭐               | ⭐⭐⭐⭐           | ⭐⭐⭐⭐⭐             |
| **Version Control**        | ⭐⭐⭐⭐⭐         | ⭐⭐⭐⭐           | ⭐⭐⭐                 |
| **Live Preview**           | ❌                 | ❌                | ⭐⭐⭐⭐⭐             |
| **Development Effort**     | ⭐⭐⭐⭐⭐         | ⭐⭐⭐⭐           | ⭐                     |
| **Publishing Simplicity**  | ⭐⭐⭐⭐           | ⭐⭐⭐⭐           | ⭐⭐⭐⭐⭐             |

---

## Recommendations

### Phase 1: Quick Win (1-2 weeks)
Implement **Solution 1: Single Markdown File**
- Lowest development effort
- Immediately usable
- Appeals to writers and technical users
- Can be version controlled easily

### Phase 2: Accessibility (1-2 months)
Add **Solution 2: Google Sheets Template**
- Reaches non-technical creators
- Minimal server infrastructure needed
- Leverages familiar tools
- Can export to Markdown format from Phase 1

### Phase 3: Full Platform (3-6 months)
Build **Solution 3: Web Creator**
- Best overall experience
- Serves all user types
- Enables community features
- Can import/export to formats from Phase 1 & 2

---

## Universal Simplifications (All Solutions)

Regardless of which solution is chosen, these simplifications should apply to all:

### 1. Remove Label Customization
- Use smart defaults for all UI text
- Only expose: `title`, `subtitle`, `winMessage`, `loseMessage`
- Reduces configuration from 38+ fields to 4

### 2. Remove Theme/Styling
- Use single, polished default theme
- Remove CSS customization entirely
- Remove dice theme configuration
- Focus on content, not presentation

### 3. Simplified Card Types
- **Primary Success** - Ace of Hearts only (triggers success checks)
- **Failure Counter** - Any King (4 revealed = game over)
- **Event** - All other cards (default type, no need to specify)

### 4. Smart Validation
- Auto-check for exactly 52 cards
- Warn if missing Ace of Hearts
- Warn if not exactly 4 Kings
- Validate no duplicate cards

### 5. Rich Card Descriptions
- **Short description** (1 sentence) - shown in game log
- **Full story** (optional, up to 500 words) - shown when card is drawn
- Support Markdown formatting in stories

### 6. Introduction Structure
- **Who You Are** - Character/setting introduction
- **Your Mission** - Goals and stakes
- Both sections support Markdown and long-form text

---

## Migration Path from V1

For existing games using the current system:

1. **Automatic Conversion Tool**
   - Reads existing config.yml + deck.csv + intro.md
   - Outputs V2 format (Markdown, JSON, or both)
   - Preserves all content, ignores deprecated fields

2. **Backward Compatibility**
   - V2 system can still load V1 games
   - Support V1 format for at least 6 months
   - Clear deprecation timeline

3. **Migration Guide**
   - Step-by-step instructions for each solution
   - Before/after examples
   - Common pitfalls and solutions

---

## Next Steps

1. **Gather Feedback** - Share with potential creators for input
2. **Prototype** - Build minimal version of chosen solution
3. **User Testing** - Test with 3-5 non-technical creators
4. **Iterate** - Refine based on feedback
5. **Document** - Create comprehensive creator guide
6. **Launch** - Roll out with example games and templates

---

## Appendix: Example Card Stories

### Short Description Only
```
## 4 of Hearts
**A survivor offers to trade useful items.**
```
(Perfectly fine for cards that don't need backstory)

### With Full Story
```
## 3 of Hearts
**You're betrayed by a survivor you trusted.**

You thought you had made an ally. Sarah seemed different from the others -
reasonable, kind, willing to share information about the safe zones. She
suggested you travel together to a supply depot she knew about.

The ambush came when you were most vulnerable, climbing through a collapsed
building. Her "friends" were waiting. They took everything - your supplies,
your tools, even the spare parts you'd scavenged for the time machine.

Sarah didn't even look you in the eye as they left you there, wounded and alone.
In this world, trust is a luxury you can't afford. The lesson is bitter, but
you won't make this mistake again.
```

### Multiple Paragraphs with Markdown
```
## 8 of Spades
**You find a complete toolkit for your time machine.**

In the basement of an old university's physics building, behind three locked
doors and covered in dust, you find it: a temporal mechanics research lab,
completely intact.

The toolkit is beautiful - precision instruments designed specifically for
quantum field manipulation. Whoever worked here understood time travel theory.
Maybe they were even trying to build their own machine before everything fell
apart.

*This is it.* With these tools, you can finally make the complex repairs your
time machine needs. Your hands shake as you carefully pack each instrument.
After weeks of scavenging and making do, you finally have what you need.

For the first time since you arrived, going home feels **possible**.
```
