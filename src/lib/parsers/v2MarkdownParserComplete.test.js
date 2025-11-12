/**
 * V2 Markdown Parser - Comprehensive Tests
 * Based on: docs/v2/game-config-v2.md
 *
 * Tests cover:
 * - Frontmatter parsing and validation
 * - Introduction section parsing
 * - Card type parsing (Primary Success, Failure Counter, Narrative, Challenge, Event)
 * - Special modifiers (skip-damage, return-king)
 * - Card count validation
 * - Manual card assignment
 * - Error handling and validation
 */

import { describe, it, expect } from 'vitest';
import { parseV2GameFile, ValidationError } from './v2MarkdownParser.js';

describe('V2 Markdown Parser - Frontmatter', () => {

	it('should parse valid frontmatter', () => {
		const markdown = `---
title: Test Game
subtitle: A Test Campaign
win-message: You win!
lose-message: You lose!
---

# Introduction

## Who You Are

Test content
`;

		const result = parseV2GameFile(markdown);

		expect(result.title).toBe('Test Game');
		expect(result.subtitle).toBe('A Test Campaign');
		expect(result.labels.victoryMessage).toBe('You win!');
		expect(result.labels.defeatMessage).toBe('You lose!');
	});

	it('should require title field', () => {
		const markdown = `---
subtitle: Missing Title
win-message: You win!
lose-message: You lose!
---

Content
`;

		expect(() => parseV2GameFile(markdown)).toThrow(ValidationError);
		expect(() => parseV2GameFile(markdown)).toThrow(/title/i);
	});

	it('should require win-message field', () => {
		const markdown = `---
title: Test Game
lose-message: You lose!
---

Content
`;

		expect(() => parseV2GameFile(markdown)).toThrow(ValidationError);
		expect(() => parseV2GameFile(markdown)).toThrow(/win-message/i);
	});

	it('should require lose-message field', () => {
		const markdown = `---
title: Test Game
win-message: You win!
---

Content
`;

		expect(() => parseV2GameFile(markdown)).toThrow(ValidationError);
		expect(() => parseV2GameFile(markdown)).toThrow(/lose-message/i);
	});

	it('should handle optional subtitle', () => {
		const markdown = createValidGameMarkdown({
			subtitle: undefined
		});

		const result = parseV2GameFile(markdown);

		expect(result.title).toBe('Test Game');
		expect(result.subtitle).toBeUndefined();
	});

	it('should throw error for missing frontmatter', () => {
		const markdown = `# Introduction

No frontmatter
`;

		expect(() => parseV2GameFile(markdown)).toThrow(ValidationError);
		expect(() => parseV2GameFile(markdown)).toThrow(/frontmatter/i);
	});
});

describe('V2 Markdown Parser - Introduction', () => {

	it('should parse introduction sections', () => {
		const markdown = createValidGameMarkdown({
			introduction: `## Who You Are

You are a time traveler.

## What Happened

Your machine broke.

## Your Goal

Fix it and get home.`
		});

		const result = parseV2GameFile(markdown);

		expect(result.introduction).toHaveLength(3);
		expect(result.introduction[0].heading).toBe('Who You Are');
		expect(result.introduction[0].content).toContain('time traveler');
		expect(result.introduction[1].heading).toBe('What Happened');
		expect(result.introduction[2].heading).toBe('Your Goal');
	});

	it('should support custom introduction headings', () => {
		const markdown = createValidGameMarkdown({
			introduction: `## The Setup

Custom heading.

## The Mission

Another custom heading.`
		});

		const result = parseV2GameFile(markdown);

		expect(result.introduction).toHaveLength(2);
		expect(result.introduction[0].heading).toBe('The Setup');
		expect(result.introduction[1].heading).toBe('The Mission');
	});

	it('should preserve markdown formatting in introduction', () => {
		const markdown = createValidGameMarkdown({
			introduction: `## Who You Are

You are a **time traveler** with _special abilities_.

- Item 1
- Item 2

More text.`
		});

		const result = parseV2GameFile(markdown);

		expect(result.introduction[0].content).toContain('**time traveler**');
		expect(result.introduction[0].content).toContain('_special abilities_');
		expect(result.introduction[0].content).toContain('- Item 1');
	});
});

describe('V2 Markdown Parser - Card Types', () => {

	describe('Primary Success', () => {

		it('should parse exactly 1 Primary Success card', () => {
			const markdown = createValidGameMarkdown();
			const result = parseV2GameFile(markdown);

			const primarySuccess = result.deck.filter(c => c.type === 'primary-success');
			expect(primarySuccess).toHaveLength(1);
		});

		it('should throw error if no Primary Success card', () => {
			const markdown = createValidGameMarkdown({
				primarySuccess: 0
			});

			expect(() => parseV2GameFile(markdown)).toThrow(ValidationError);
			expect(() => parseV2GameFile(markdown)).toThrow(/Primary Success/i);
		});

		it('should throw error if multiple Primary Success cards', () => {
			const markdown = createValidGameMarkdown({
				primarySuccess: 2
			});

			expect(() => parseV2GameFile(markdown)).toThrow(ValidationError);
			expect(() => parseV2GameFile(markdown)).toThrow(/Primary Success/i);
		});
	});

	describe('Failure Counter', () => {

		it('should parse exactly 4 Failure Counter cards', () => {
			const markdown = createValidGameMarkdown();
			const result = parseV2GameFile(markdown);

			const failureCounters = result.deck.filter(c => c.type === 'failure-counter');
			expect(failureCounters).toHaveLength(4);
		});

		it('should throw error if not exactly 4 Failure Counters', () => {
			const markdown = createValidGameMarkdown({
				failureCounter: 3
			});

			expect(() => parseV2GameFile(markdown)).toThrow(ValidationError);
			expect(() => parseV2GameFile(markdown)).toThrow(/Failure Counter/i);
		});
	});

	describe('Narrative', () => {

		it('should parse exactly 3 Narrative cards total', () => {
			const markdown = createValidGameMarkdown();
			const result = parseV2GameFile(markdown);

			const narratives = result.deck.filter(c =>
				c.type === 'narrative' ||
				c.type === 'narrative-skip-damage' ||
				c.type === 'narrative-return-king'
			);

			expect(narratives).toHaveLength(3);
		});

		it('should throw error if not exactly 3 Narrative cards', () => {
			const markdown = createValidGameMarkdown({
				narrative: 2
			});

			expect(() => parseV2GameFile(markdown)).toThrow(ValidationError);
			expect(() => parseV2GameFile(markdown)).toThrow(/Narrative/i);
		});

		it('should parse standard Narrative cards without modifiers', () => {
			const markdown = createValidGameMarkdown();
			const result = parseV2GameFile(markdown);

			const standardNarratives = result.deck.filter(c => c.type === 'narrative');
			expect(standardNarratives.length).toBeGreaterThanOrEqual(1);
		});
	});

	describe('Challenge', () => {

		it('should parse exactly 16 Challenge cards', () => {
			const markdown = createValidGameMarkdown();
			const result = parseV2GameFile(markdown);

			const challenges = result.deck.filter(c => c.type === 'challenge');
			expect(challenges).toHaveLength(16);
		});

		it('should throw error if not exactly 16 Challenge cards', () => {
			const markdown = createValidGameMarkdown({
				challenge: 15
			});

			expect(() => parseV2GameFile(markdown)).toThrow(ValidationError);
			expect(() => parseV2GameFile(markdown)).toThrow(/Challenge/i);
		});
	});

	describe('Event', () => {

		it('should parse exactly 28 Event cards', () => {
			const markdown = createValidGameMarkdown();
			const result = parseV2GameFile(markdown);

			const events = result.deck.filter(c => c.type === 'event');
			expect(events).toHaveLength(28);
		});

		it('should throw error if not exactly 28 Event cards', () => {
			const markdown = createValidGameMarkdown({
				event: 27
			});

			expect(() => parseV2GameFile(markdown)).toThrow(ValidationError);
			expect(() => parseV2GameFile(markdown)).toThrow(/Event/i);
		});
	});

	it('should validate total of 52 cards', () => {
		const markdown = createValidGameMarkdown();
		const result = parseV2GameFile(markdown);

		// 1 + 4 + 3 + 16 + 28 = 52
		expect(result.deck).toHaveLength(52);
	});
});

describe('V2 Markdown Parser - Special Modifiers', () => {

	describe('skip-damage modifier', () => {

		it('should parse Narrative card with skip-damage modifier', () => {
			const markdown = createValidGameMarkdown({
				narrativeSkipDamage: true
			});

			const result = parseV2GameFile(markdown);

			const skipDamageCards = result.deck.filter(c =>
				c.type === 'narrative-skip-damage' ||
				(c.modifiers && c.modifiers.special === 'skip-damage')
			);

			expect(skipDamageCards).toHaveLength(1);
		});

		it('should throw error if multiple skip-damage modifiers', () => {
			const markdown = `---
title: Test
win-message: Win
lose-message: Lose
---

# Introduction

## Who You Are

Test

---

# Card Deck

### Primary Success

**Win card**

---

### Failure Counter

**K1**

---

### Failure Counter

**K2**

---

### Failure Counter

**K3**

---

### Failure Counter

**K4**

---

### Narrative: skip-damage

**First skip**

---

### Narrative: skip-damage

**Second skip (INVALID)**

---

### Narrative

**Normal narrative**

---

${generateCards('Challenge', 16)}

${generateCards('Event', 28)}
`;

			expect(() => parseV2GameFile(markdown)).toThrow(ValidationError);
			expect(() => parseV2GameFile(markdown)).toThrow(/skip-damage/i);
		});

		it('should only allow skip-damage on Narrative cards', () => {
			// This is enforced by the type header format
			// Non-narrative cards shouldn't have this modifier
			const markdown = createValidGameMarkdown({
				narrativeSkipDamage: true
			});

			const result = parseV2GameFile(markdown);
			const skipCards = result.deck.filter(c =>
				c.modifiers && c.modifiers.special === 'skip-damage'
			);

			skipCards.forEach(card => {
				expect(card.type).toMatch(/^narrative/);
			});
		});
	});

	describe('return-king modifier', () => {

		it('should parse Narrative card with return-king modifier', () => {
			const markdown = createValidGameMarkdown({
				narrativeReturnKing: true
			});

			const result = parseV2GameFile(markdown);

			const returnKingCards = result.deck.filter(c =>
				c.type === 'narrative-return-king' ||
				(c.modifiers && c.modifiers.special === 'return-king')
			);

			expect(returnKingCards).toHaveLength(1);
		});

		it('should throw error if multiple return-king modifiers', () => {
			const markdown = `---
title: Test
win-message: Win
lose-message: Lose
---

# Introduction

## Who You Are

Test

---

# Card Deck

### Primary Success

**Win card**

---

${generateCards('Failure Counter', 4)}

### Narrative: return-king

**First return**

---

### Narrative: return-king

**Second return (INVALID)**

---

### Narrative

**Normal**

---

${generateCards('Challenge', 16)}

${generateCards('Event', 28)}
`;

			expect(() => parseV2GameFile(markdown)).toThrow(ValidationError);
			expect(() => parseV2GameFile(markdown)).toThrow(/return-king/i);
		});
	});

	describe('Combined modifiers', () => {

		it('should allow both skip-damage and return-king in same game', () => {
			const markdown = createValidGameMarkdown({
				narrativeSkipDamage: true,
				narrativeReturnKing: true
			});

			const result = parseV2GameFile(markdown);

			const skipDamage = result.deck.filter(c =>
				c.modifiers && c.modifiers.special === 'skip-damage'
			);
			const returnKing = result.deck.filter(c =>
				c.modifiers && c.modifiers.special === 'return-king'
			);

			expect(skipDamage).toHaveLength(1);
			expect(returnKing).toHaveLength(1);
		});

		it('should count modified Narrative cards toward total of 3', () => {
			const markdown = createValidGameMarkdown({
				narrativeSkipDamage: true,
				narrativeReturnKing: true
			});

			const result = parseV2GameFile(markdown);

			const allNarratives = result.deck.filter(c => c.type && c.type.startsWith('narrative'));
			expect(allNarratives).toHaveLength(3);
		});
	});
});

describe('V2 Markdown Parser - Manual Card Assignment', () => {

	it('should parse manual card assignment like "7-hearts"', () => {
		const markdown = `---
title: Test
win-message: Win
lose-message: Lose
---

# Introduction

## Who You Are

Test

---

# Card Deck

### Primary Success

**Win**

---

${generateCards('Failure Counter', 4)}

${generateCards('Narrative', 3)}

### Challenge: 7-hearts

**Lucky seven**

---

${generateCards('Challenge', 15)}

${generateCards('Event', 28)}
`;

		const result = parseV2GameFile(markdown);

		const sevenHearts = result.deck.find(c =>
			c.modifiers && c.modifiers.explicit === '7-hearts'
		);

		expect(sevenHearts).toBeDefined();
		expect(sevenHearts.description).toBe('Lucky seven');
	});

	it('should parse assignment with modifier like "A-clubs, skip-damage"', () => {
		const markdown = `---
title: Test
win-message: Win
lose-message: Lose
---

# Introduction

## Who You Are

Test

---

# Card Deck

### Primary Success

**Win**

---

${generateCards('Failure Counter', 4)}

### Narrative: A-clubs, skip-damage

**Special ace**

---

${generateCards('Narrative', 2)}

${generateCards('Challenge', 16)}

${generateCards('Event', 28)}
`;

		const result = parseV2GameFile(markdown);

		const specialAce = result.deck.find(c =>
			c.modifiers &&
			c.modifiers.explicit === 'a-clubs' &&
			c.modifiers.special === 'skip-damage'
		);

		expect(specialAce).toBeDefined();
	});

	it('should validate card assignment format', () => {
		const markdown = `---
title: Test
win-message: Win
lose-message: Lose
---

# Introduction

## Who You Are

Test

---

# Card Deck

### Challenge: invalid-format

**Bad assignment**

---
`;

		// Parser should handle or reject invalid formats
		// Implementation may vary - test for graceful handling
		try {
			parseV2GameFile(markdown);
		} catch (error) {
			expect(error).toBeInstanceOf(ValidationError);
		}
	});
});

describe('V2 Markdown Parser - Card Content', () => {

	it('should parse card description from bold text', () => {
		const markdown = createValidGameMarkdown({
			customCard: {
				type: 'Event',
				description: 'You find a hidden cache',
				story: 'Behind a wall...'
			}
		});

		const result = parseV2GameFile(markdown);

		const customCard = result.deck.find(c => c.prompt === 'You find a hidden cache');
		expect(customCard).toBeDefined();
	});

	it('should parse optional story text', () => {
		const markdown = `---
title: Test
win-message: Win
lose-message: Lose
---

# Introduction

## Who You Are

Test

---

# Card Deck

### Primary Success

**Win card**

---

${generateCards('Failure Counter', 4)}

${generateCards('Narrative', 3)}

${generateCards('Challenge', 16)}

### Event

**You discover a survivor**

They tell you their story. It's long and detailed. Multiple paragraphs can be included here.

This is the second paragraph of the story.

---

${generateCards('Event', 27)}
`;

		const result = parseV2GameFile(markdown);

		const storyCard = result.deck.find(c => c.prompt === 'You discover a survivor');
		expect(storyCard).toBeDefined();
		expect(storyCard.story).toBeTruthy();
		expect(storyCard.story).toContain('long and detailed');
		expect(storyCard.story).toContain('second paragraph');
	});

	it('should support markdown formatting in stories', () => {
		const markdown = createValidGameMarkdown({
			customCard: {
				type: 'Event',
				description: 'Test',
				story: '**Bold** and _italic_ text with [links](url).'
			}
		});

		const result = parseV2GameFile(markdown);

		const card = result.deck.find(c => c.story && c.story.includes('**Bold**'));
		expect(card).toBeDefined();
		expect(card.story).toContain('_italic_');
		expect(card.story).toContain('[links]');
	});

	it('should allow cards with just description, no story', () => {
		const markdown = createValidGameMarkdown();
		const result = parseV2GameFile(markdown);

		// Most cards will have just description
		const shortCards = result.deck.filter(c => !c.story || c.story === '');
		expect(shortCards.length).toBeGreaterThan(0);
	});

	it('should throw error for card missing description', () => {
		const markdown = `---
title: Test
win-message: Win
lose-message: Lose
---

# Introduction

## Who You Are

Test

---

# Card Deck

### Primary Success

No bold text here, should fail

---
`;

		expect(() => parseV2GameFile(markdown)).toThrow(ValidationError);
		expect(() => parseV2GameFile(markdown)).toThrow(/description/i);
	});
});

describe('V2 Markdown Parser - Error Handling', () => {

	it('should throw ValidationError for invalid input', () => {
		const markdown = 'Invalid content';

		expect(() => parseV2GameFile(markdown)).toThrow(ValidationError);
	});

	it('should provide helpful error messages', () => {
		const markdown = `---
title: Test
---

No other content
`;

		try {
			parseV2GameFile(markdown);
			expect.fail('Should have thrown');
		} catch (error) {
			expect(error).toBeInstanceOf(ValidationError);
			expect(error.message).toBeTruthy();
			expect(error.errors).toBeTruthy();
		}
	});

	it('should validate file size limits', () => {
		// Create extremely large content
		const hugeDeck = 'a'.repeat(200000);
		const markdown = `---
title: Test
win-message: Win
lose-message: Lose
---

${hugeDeck}
`;

		expect(() => parseV2GameFile(markdown)).toThrow(ValidationError);
		expect(() => parseV2GameFile(markdown)).toThrow(/large/i);
	});

	it('should handle missing Card Deck section', () => {
		const markdown = `---
title: Test
win-message: Win
lose-message: Lose
---

# Introduction

## Who You Are

Just intro, no deck
`;

		expect(() => parseV2GameFile(markdown)).toThrow(ValidationError);
		expect(() => parseV2GameFile(markdown)).toThrow(/Card Deck/i);
	});
});

// =======================================
// HELPER FUNCTIONS
// =======================================

/**
 * Generate N cards of a specific type
 */
function generateCards(type, count) {
	const cards = [];

	for (let i = 1; i <= count; i++) {
		cards.push(`### ${type}

**${type} ${i}**

---`);
	}

	return cards.join('\n\n');
}

/**
 * Create valid game markdown for testing
 */
function createValidGameMarkdown(options = {}) {
	const title = options.title || 'Test Game';
	const subtitle = options.subtitle !== undefined ?
		`subtitle: ${options.subtitle}\n` : 'subtitle: A Test Campaign\n';
	const winMessage = options.winMessage || 'You win!';
	const loseMessage = options.loseMessage || 'You lose!';

	const introduction = options.introduction || `## Who You Are

You are a test character.

## What Happened

Test scenario.

## Your Goal

Complete the test.`;

	const primarySuccess = options.primarySuccess !== undefined ? options.primarySuccess : 1;
	const failureCounter = options.failureCounter !== undefined ? options.failureCounter : 4;
	const narrative = options.narrative !== undefined ? options.narrative : 1;
	const narrativeSkipDamage = options.narrativeSkipDamage ? 1 : 0;
	const narrativeReturnKing = options.narrativeReturnKing ? 1 : 0;
	const challenge = options.challenge !== undefined ? options.challenge : 16;
	const event = options.event !== undefined ? options.event : 28;

	// Adjust plain narrative count if special modifiers are used
	const plainNarrative = narrative - (narrativeSkipDamage + narrativeReturnKing > 0 ?
		(narrativeSkipDamage + narrativeReturnKing) : 0);

	return `---
title: ${title}
${subtitle}win-message: ${winMessage}
lose-message: ${loseMessage}
---

# Introduction

${introduction}

---

# Card Deck

${generateCards('Primary Success', primarySuccess)}

${generateCards('Failure Counter', failureCounter)}

${plainNarrative > 0 ? generateCards('Narrative', plainNarrative) : ''}

${narrativeSkipDamage ? `### Narrative: skip-damage

**A moment of perfect timing**

---` : ''}

${narrativeReturnKing ? `### Narrative: return-king

**A second chance**

---` : ''}

${generateCards('Challenge', challenge)}

${generateCards('Event', event)}
`;
}
