import { describe, it, expect } from 'vitest';
import { parseGameFile, ValidationError } from './markdownParser.js';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Markdown Parser Integration Tests
 *
 * Tests the type-based markdown parser with:
 * - Valid game file parsing
 * - Invalid card counts
 * - Special modifiers (skip-damage, return-king)
 * - Missing required frontmatter
 * - Malformed markdown
 * - Edge cases
 */

describe('Markdown Parser', () => {
	describe('Valid Game Files', () => {
		it('should parse future-lost.game.md successfully', () => {
			const gamePath = join(process.cwd(), 'static', 'games', 'future-lost.game.md');
			const markdown = readFileSync(gamePath, 'utf-8');

			const result = parseGameFile(markdown);

			// Verify structure
			expect(result).toHaveProperty('title');
			expect(result).toHaveProperty('subtitle');
			expect(result).toHaveProperty('win-message');
			expect(result).toHaveProperty('lose-message');
			expect(result).toHaveProperty('introduction');
			expect(result).toHaveProperty('deck');
			expect(result).toHaveProperty('metadata');

			// Verify metadata
			expect(result.metadata.format).toBe('v2-type-based');
			expect(result.metadata.version).toBe('2.0');

			// Verify deck has exactly 52 cards
			expect(result.deck).toHaveLength(52);

			// Verify card types are assigned correctly
			const primarySuccess = result.deck.filter((c) => c.type === 'primary-success');
			expect(primarySuccess).toHaveLength(1);
			expect(primarySuccess[0].card).toBe('A');
			expect(primarySuccess[0].suit).toBe('hearts');

			const failureCounters = result.deck.filter((c) => c.type === 'failure-counter');
			expect(failureCounters).toHaveLength(4);
			failureCounters.forEach((card) => {
				expect(card.card).toBe('K');
			});

			const narratives = result.deck.filter((c) => c.type === 'narrative');
			expect(narratives).toHaveLength(3);
			narratives.forEach((card) => {
				expect(card.card).toBe('A');
			});

			const challenges = result.deck.filter((c) => c.type === 'challenge');
			expect(challenges).toHaveLength(16);

			const events = result.deck.filter((c) => c.type === 'event');
			expect(events).toHaveLength(28);
		});

		it('should parse introduction sections correctly', () => {
			const gamePath = join(process.cwd(), 'static', 'games', 'future-lost.game.md');
			const markdown = readFileSync(gamePath, 'utf-8');

			const result = parseGameFile(markdown);

			expect(result.introduction).toBeInstanceOf(Array);
			expect(result.introduction.length).toBeGreaterThan(0);

			result.introduction.forEach((section) => {
				expect(section).toHaveProperty('heading');
				expect(section).toHaveProperty('content');
				expect(typeof section.heading).toBe('string');
				expect(typeof section.content).toBe('string');
			});
		});

		it('should handle special modifiers correctly', () => {
			const gamePath = join(process.cwd(), 'static', 'games', 'future-lost.game.md');
			const markdown = readFileSync(gamePath, 'utf-8');

			const result = parseGameFile(markdown);

			// Find cards with special modifiers
			const skipDamageCards = result.deck.filter((c) => c.modifier === 'skip-damage');
			const returnKingCards = result.deck.filter((c) => c.modifier === 'return-king');

			// Should have at most one of each special modifier
			expect(skipDamageCards.length).toBeLessThanOrEqual(1);
			expect(returnKingCards.length).toBeLessThanOrEqual(1);
		});
	});

	describe('Narrative modifiers in built deck', () => {
		it('keeps skip-damage and return-king on exactly one Ace each', () => {
			const markdown = readFileSync(
				join(process.cwd(), 'static', 'games', 'future-lost.game.md'),
				'utf-8'
			);
			const { deck } = parseGameFile(markdown);
			const skip = deck.filter((c) => c.modifier === 'skip-damage');
			const ret = deck.filter((c) => c.modifier === 'return-king');
			expect(skip).toHaveLength(1);
			expect(ret).toHaveLength(1);
			expect(skip[0].card).toBe('A');
			expect(ret[0].card).toBe('A');
		});
	});

	describe('Invalid Card Counts', () => {
		it('should reject game with too few Primary Success cards', () => {
			const invalidMarkdown = `---
title: Test Game
win-message: You won!
lose-message: You lost!
---

## Introduction
Test intro

## Card Deck

### Failure Counter
**King of Hearts**
Description

---

### Failure Counter
**King of Diamonds**
Description

---

### Failure Counter
**King of Clubs**
Description

---

### Failure Counter
**King of Spades**
Description

---

### Narrative
**Ace of Diamonds**
Description

---

### Narrative
**Ace of Clubs**
Description

---

### Narrative
**Ace of Spades**
Description
`;

			// Add 16 challenges and 28 events to make 52 total without primary success
			const challenges = Array(16)
				.fill(null)
				.map(
					(_, i) => `
---

### Challenge
**Challenge ${i + 1}**
Description
`
				)
				.join('');

			const events = Array(28)
				.fill(null)
				.map(
					(_, i) => `
---

### Event
**Event ${i + 1}**
Description
`
				)
				.join('');

			const fullMarkdown = invalidMarkdown + challenges + events;

			expect(() => parseGameFile(fullMarkdown)).toThrow(ValidationError);
			expect(() => parseGameFile(fullMarkdown)).toThrow(/Expected exactly 1 Primary Success card/);
		});

		it('should reject game with too many Failure Counter cards', () => {
			const invalidMarkdown = `---
title: Test Game
win-message: You won!
lose-message: You lost!
---

## Introduction
Test intro

## Card Deck

### Primary Success
**Ace of Hearts**
Description

---

### Failure Counter
**King 1**
Description

---

### Failure Counter
**King 2**
Description

---

### Failure Counter
**King 3**
Description

---

### Failure Counter
**King 4**
Description

---

### Failure Counter
**King 5**
Description

---

### Narrative
**Ace of Diamonds**
Description

---

### Narrative
**Ace of Clubs**
Description

---

### Narrative
**Ace of Spades**
Description
`;

			// Add challenges and events
			const challenges = Array(16)
				.fill(null)
				.map(
					(_, i) => `
---

### Challenge
**Challenge ${i + 1}**
Description
`
				)
				.join('');

			const events = Array(27)
				.fill(null)
				.map(
					(_, i) => `
---

### Event
**Event ${i + 1}**
Description
`
				)
				.join('');

			const fullMarkdown = invalidMarkdown + challenges + events;

			expect(() => parseGameFile(fullMarkdown)).toThrow(ValidationError);
			expect(() => parseGameFile(fullMarkdown)).toThrow(/Expected exactly 4 Failure Counter cards/);
		});

		it('should reject game with incorrect Narrative count', () => {
			const invalidMarkdown = `---
title: Test Game
win-message: You won!
lose-message: You lost!
---

## Introduction
Test intro

## Card Deck

### Primary Success
**Ace of Hearts**
Description

---

### Failure Counter
**King 1**
Description

---

### Failure Counter
**King 2**
Description

---

### Failure Counter
**King 3**
Description

---

### Failure Counter
**King 4**
Description

---

### Narrative
**Ace of Diamonds**
Description

---

### Narrative
**Ace of Clubs**
Description
`;

			// Only 2 narratives instead of 3
			const challenges = Array(16)
				.fill(null)
				.map(
					(_, i) => `
---

### Challenge
**Challenge ${i + 1}**
Description
`
				)
				.join('');

			const events = Array(29)
				.fill(null)
				.map(
					(_, i) => `
---

### Event
**Event ${i + 1}**
Description
`
				)
				.join('');

			const fullMarkdown = invalidMarkdown + challenges + events;

			expect(() => parseGameFile(fullMarkdown)).toThrow(ValidationError);
			expect(() => parseGameFile(fullMarkdown)).toThrow(/Expected exactly 3 Narrative cards/);
		});

		it('should reject game with too few Challenge cards', () => {
			const invalidMarkdown = `---
title: Test Game
win-message: You won!
lose-message: You lost!
---

## Introduction
Test intro

## Card Deck

### Primary Success
**Ace of Hearts**
Description

---

### Failure Counter
**King 1**
Description

---

### Failure Counter
**King 2**
Description

---

### Failure Counter
**King 3**
Description

---

### Failure Counter
**King 4**
Description

---

### Narrative
**Ace of Diamonds**
Description

---

### Narrative
**Ace of Clubs**
Description

---

### Narrative
**Ace of Spades**
Description
`;

			// Only 10 challenges instead of 16
			const challenges = Array(10)
				.fill(null)
				.map(
					(_, i) => `
---

### Challenge
**Challenge ${i + 1}**
Description
`
				)
				.join('');

			const events = Array(28)
				.fill(null)
				.map(
					(_, i) => `
---

### Event
**Event ${i + 1}**
Description
`
				)
				.join('');

			const fullMarkdown = invalidMarkdown + challenges + events;

			expect(() => parseGameFile(fullMarkdown)).toThrow(ValidationError);
			expect(() => parseGameFile(fullMarkdown)).toThrow(/Expected exactly 16 Challenge cards/);
		});

		it('should reject game with too many Event cards', () => {
			const invalidMarkdown = `---
title: Test Game
win-message: You won!
lose-message: You lost!
---

## Introduction
Test intro

## Card Deck

### Primary Success
**Ace of Hearts**
Description

---

### Failure Counter
**King 1**
Description

---

### Failure Counter
**King 2**
Description

---

### Failure Counter
**King 3**
Description

---

### Failure Counter
**King 4**
Description

---

### Narrative
**Ace of Diamonds**
Description

---

### Narrative
**Ace of Clubs**
Description

---

### Narrative
**Ace of Spades**
Description
`;

			const challenges = Array(16)
				.fill(null)
				.map(
					(_, i) => `
---

### Challenge
**Challenge ${i + 1}**
Description
`
				)
				.join('');

			// 30 events instead of 28
			const events = Array(30)
				.fill(null)
				.map(
					(_, i) => `
---

### Event
**Event ${i + 1}**
Description
`
				)
				.join('');

			const fullMarkdown = invalidMarkdown + challenges + events;

			expect(() => parseGameFile(fullMarkdown)).toThrow(ValidationError);
			expect(() => parseGameFile(fullMarkdown)).toThrow(/Expected exactly 28 Event cards/);
		});
	});

	describe('Special Modifiers', () => {
		it('should reject multiple skip-damage modifiers', () => {
			const invalidMarkdown = `---
title: Test Game
win-message: You won!
lose-message: You lost!
---

## Introduction
Test intro

## Card Deck

### Primary Success
**Ace of Hearts**
Description

---

### Failure Counter
**King 1**
Description

---

### Failure Counter
**King 2**
Description

---

### Failure Counter
**King 3**
Description

---

### Failure Counter
**King 4**
Description

---

### Narrative: skip-damage
**Ace of Diamonds**
Description

---

### Narrative: skip-damage
**Ace of Clubs**
Description

---

### Narrative
**Ace of Spades**
Description
`;

			const challenges = Array(16)
				.fill(null)
				.map(
					(_, i) => `
---

### Challenge
**Challenge ${i + 1}**
Description
`
				)
				.join('');

			const events = Array(28)
				.fill(null)
				.map(
					(_, i) => `
---

### Event
**Event ${i + 1}**
Description
`
				)
				.join('');

			const fullMarkdown = invalidMarkdown + challenges + events;

			expect(() => parseGameFile(fullMarkdown)).toThrow(ValidationError);
			expect(() => parseGameFile(fullMarkdown)).toThrow(
				/Only ONE Narrative card can have skip-damage/
			);
		});

		it('should reject multiple return-king modifiers', () => {
			const invalidMarkdown = `---
title: Test Game
win-message: You won!
lose-message: You lost!
---

## Introduction
Test intro

## Card Deck

### Primary Success
**Ace of Hearts**
Description

---

### Failure Counter
**King 1**
Description

---

### Failure Counter
**King 2**
Description

---

### Failure Counter
**King 3**
Description

---

### Failure Counter
**King 4**
Description

---

### Narrative: return-king
**Ace of Diamonds**
Description

---

### Narrative: return-king
**Ace of Clubs**
Description

---

### Narrative
**Ace of Spades**
Description
`;

			const challenges = Array(16)
				.fill(null)
				.map(
					(_, i) => `
---

### Challenge
**Challenge ${i + 1}**
Description
`
				)
				.join('');

			const events = Array(28)
				.fill(null)
				.map(
					(_, i) => `
---

### Event
**Event ${i + 1}**
Description
`
				)
				.join('');

			const fullMarkdown = invalidMarkdown + challenges + events;

			expect(() => parseGameFile(fullMarkdown)).toThrow(ValidationError);
			expect(() => parseGameFile(fullMarkdown)).toThrow(
				/Only ONE Narrative card can have return-king/
			);
		});
	});

	describe('Missing Required Frontmatter', () => {
		it('should reject game without title', () => {
			const invalidMarkdown = `---
win-message: You won!
lose-message: You lost!
---

## Introduction
Test intro

## Card Deck
`;

			expect(() => parseGameFile(invalidMarkdown)).toThrow(ValidationError);
			expect(() => parseGameFile(invalidMarkdown)).toThrow(
				/Missing required frontmatter fields.*title/
			);
		});

		it('should reject game without win-message', () => {
			const invalidMarkdown = `---
title: Test Game
lose-message: You lost!
---

## Introduction
Test intro

## Card Deck
`;

			expect(() => parseGameFile(invalidMarkdown)).toThrow(ValidationError);
			expect(() => parseGameFile(invalidMarkdown)).toThrow(
				/Missing required frontmatter fields.*win-message/
			);
		});

		it('should reject game without lose-message', () => {
			const invalidMarkdown = `---
title: Test Game
win-message: You won!
---

## Introduction
Test intro

## Card Deck
`;

			expect(() => parseGameFile(invalidMarkdown)).toThrow(ValidationError);
			expect(() => parseGameFile(invalidMarkdown)).toThrow(
				/Missing required frontmatter fields.*lose-message/
			);
		});
	});

	describe('Malformed Markdown', () => {
		it('should reject game without frontmatter', () => {
			const invalidMarkdown = `## Introduction
Test intro

## Card Deck
`;

			expect(() => parseGameFile(invalidMarkdown)).toThrow(ValidationError);
			expect(() => parseGameFile(invalidMarkdown)).toThrow(/No frontmatter found/);
		});

		it('should reject game without Card Deck section', () => {
			const invalidMarkdown = `---
title: Test Game
win-message: You won!
lose-message: You lost!
---

## Introduction
Test intro
`;

			expect(() => parseGameFile(invalidMarkdown)).toThrow(ValidationError);
			expect(() => parseGameFile(invalidMarkdown)).toThrow(/No "## Card Deck" section found/);
		});

		it('should reject card without description', () => {
			const invalidMarkdown = `---
title: Test Game
win-message: You won!
lose-message: You lost!
---

## Introduction
Test intro

## Card Deck

### Primary Success
This is not bold

---

### Failure Counter
**King 1**
Description
`;

			expect(() => parseGameFile(invalidMarkdown)).toThrow(ValidationError);
			expect(() => parseGameFile(invalidMarkdown)).toThrow(/Card missing description/);
		});

		it('should reject invalid input types', () => {
			expect(() => parseGameFile(null)).toThrow(ValidationError);
			expect(() => parseGameFile(undefined)).toThrow(ValidationError);
			expect(() => parseGameFile(123)).toThrow(ValidationError);
			expect(() => parseGameFile('')).toThrow(ValidationError);
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty introduction section', () => {
			const markdown = `---
title: Test Game
win-message: You won!
lose-message: You lost!
---

## Card Deck

### Primary Success
**Ace of Hearts**
Description

---

### Failure Counter
**King 1**
Description

---

### Failure Counter
**King 2**
Description

---

### Failure Counter
**King 3**
Description

---

### Failure Counter
**King 4**
Description

---

### Narrative
**Ace of Diamonds**
Description

---

### Narrative
**Ace of Clubs**
Description

---

### Narrative
**Ace of Spades**
Description
`;

			const challenges = Array(16)
				.fill(null)
				.map(
					(_, i) => `
---

### Challenge
**Challenge ${i + 1}**
Description
`
				)
				.join('');

			const events = Array(28)
				.fill(null)
				.map(
					(_, i) => `
---

### Event
**Event ${i + 1}**
Description
`
				)
				.join('');

			const fullMarkdown = markdown + challenges + events;

			const result = parseGameFile(fullMarkdown);
			expect(result.introduction).toHaveLength(0);
		});

		it('should handle optional subtitle field', () => {
			const markdown = `---
title: Test Game
subtitle: A thrilling adventure
win-message: You won!
lose-message: You lost!
---

## Introduction
Test intro

## Card Deck

### Primary Success
**Ace of Hearts**
Description

---

### Failure Counter
**King 1**
Description

---

### Failure Counter
**King 2**
Description

---

### Failure Counter
**King 3**
Description

---

### Failure Counter
**King 4**
Description

---

### Narrative
**Ace of Diamonds**
Description

---

### Narrative
**Ace of Clubs**
Description

---

### Narrative
**Ace of Spades**
Description
`;

			const challenges = Array(16)
				.fill(null)
				.map(
					(_, i) => `
---

### Challenge
**Challenge ${i + 1}**
Description
`
				)
				.join('');

			const events = Array(28)
				.fill(null)
				.map(
					(_, i) => `
---

### Event
**Event ${i + 1}**
Description
`
				)
				.join('');

			const fullMarkdown = markdown + challenges + events;

			const result = parseGameFile(fullMarkdown);
			expect(result.subtitle).toBe('A thrilling adventure');
		});

		it('should handle cards with story content', () => {
			const gamePath = join(process.cwd(), 'static', 'games', 'future-lost.game.md');
			const markdown = readFileSync(gamePath, 'utf-8');

			const result = parseGameFile(markdown);

			// At least some cards should have story content
			const cardsWithStory = result.deck.filter((c) => c.story && c.story.length > 0);
			expect(cardsWithStory.length).toBeGreaterThan(0);
		});

		it('should normalize card type variations', () => {
			const markdown = `---
title: Test Game
win-message: You won!
lose-message: You lost!
---

## Introduction
Test intro

## Card Deck

### Primary Success
**Ace of Hearts**
Description

---

### failure counter
**King 1**
Description

---

### Failure-Counter
**King 2**
Description

---

### FAILURE COUNTER
**King 3**
Description

---

### Failure Counter
**King 4**
Description

---

### narrative
**Ace of Diamonds**
Description

---

### NARRATIVE
**Ace of Clubs**
Description

---

### Narrative
**Ace of Spades**
Description
`;

			const challenges = Array(16)
				.fill(null)
				.map(
					(_, i) => `
---

### challenge
**Challenge ${i + 1}**
Description
`
				)
				.join('');

			const events = Array(28)
				.fill(null)
				.map(
					(_, i) => `
---

### EVENT
**Event ${i + 1}**
Description
`
				)
				.join('');

			const fullMarkdown = markdown + challenges + events;

			const result = parseGameFile(fullMarkdown);

			// Should parse successfully despite case variations
			expect(result.deck).toHaveLength(52);
			expect(result.deck.filter((c) => c.type === 'failure-counter')).toHaveLength(4);
			expect(result.deck.filter((c) => c.type === 'narrative')).toHaveLength(3);
			expect(result.deck.filter((c) => c.type === 'challenge')).toHaveLength(16);
			expect(result.deck.filter((c) => c.type === 'event')).toHaveLength(28);
		});
	});
});

describe('Markdown Parser - difficulty frontmatter', () => {
	const base = readFileSync(join(process.cwd(), 'static', 'games', 'future-lost.game.md'), 'utf-8');
	const withDifficulty = (line) => base.replace(/^---\r?\n/, `---\n${line}\n`);

	it('should parse difficulty: easy as 0', () => {
		expect(parseGameFile(withDifficulty('difficulty: easy')).options).toEqual({ difficulty: 0 });
	});

	it('should parse difficulty case-insensitively', () => {
		expect(parseGameFile(withDifficulty('difficulty: Normal')).options).toEqual({ difficulty: 1 });
	});

	it('should parse difficulty: hard as 2', () => {
		expect(parseGameFile(withDifficulty('difficulty: hard')).options).toEqual({ difficulty: 2 });
		expect(parseGameFile(withDifficulty('difficulty: HARD')).options).toEqual({ difficulty: 2 });
	});

	it('should default to Normal when difficulty is absent', () => {
		expect(parseGameFile(base).options).toEqual({ difficulty: 1 });
	});

	it('should throw ValidationError for an invalid difficulty', () => {
		const markdown = withDifficulty('difficulty: brutal');
		expect(() => parseGameFile(markdown)).toThrow(ValidationError);
		expect(() => parseGameFile(markdown)).toThrow(/easy, normal, hard/);
	});

	it('should reject object-prototype keys as difficulty', () => {
		expect(() => parseGameFile(withDifficulty('difficulty: constructor'))).toThrow(ValidationError);
	});
});

describe('Markdown Parser - card images', () => {
	const gamePath = join(process.cwd(), 'static', 'games', 'future-lost.game.md');
	const base = readFileSync(gamePath, 'utf-8');
	const headline = "**You're betrayed by a survivor you trusted**";
	const betrayal = (deck) =>
		deck.find((c) => c.description === "You're betrayed by a survivor you trusted");

	/** Future Lost with the betrayal card's body replaced by `body` (header and description kept) */
	function withCardBody(body) {
		const start = base.indexOf(headline);
		const end = base.indexOf('\n---\n', start);
		return `${base.substring(0, start)}${body}${base.substring(end)}`;
	}

	it('takes one markdown image line off a card as its image, leaving the story text only', () => {
		const markdown = withCardBody(
			`${headline}\n\n![A dim alley, a figure walking away](art/betrayal.jpg)\n\nFirst paragraph.\n\nSecond paragraph.`
		);
		const card = betrayal(parseGameFile(markdown).deck);
		expect(card.image).toEqual({
			src: 'art/betrayal.jpg',
			alt: 'A dim alley, a figure walking away'
		});
		expect(card.story).toBe('First paragraph.\n\nSecond paragraph.');
	});

	it('closes the story up where an image stood between paragraphs', () => {
		const markdown = withCardBody(
			`${headline}\n\nFirst paragraph.\n\n![](art/betrayal.jpg "A title")\n\nSecond paragraph.`
		);
		const card = betrayal(parseGameFile(markdown).deck);
		expect(card.image).toEqual({ src: 'art/betrayal.jpg', alt: '' });
		expect(card.story).toBe('First paragraph.\n\nSecond paragraph.');
	});

	it('accepts the image before the description', () => {
		const markdown = withCardBody(`![Alley](art/betrayal.jpg)\n\n${headline}\n\nThe story.`);
		const card = betrayal(parseGameFile(markdown).deck);
		expect(card.image).toEqual({ src: 'art/betrayal.jpg', alt: 'Alley' });
		expect(card.story).toBe('The story.');
	});

	it('leaves image: null on cards without one', () => {
		const deck = parseGameFile(base).deck;
		expect(deck).toHaveLength(52);
		expect(deck.every((c) => c.image === null)).toBe(true);
	});

	it('rejects more than one image on a card', () => {
		const markdown = withCardBody(`${headline}\n\n![](a.jpg)\n\nText.\n\n![](b.jpg)`);
		expect(() => parseGameFile(markdown)).toThrow(ValidationError);
		expect(() => parseGameFile(markdown)).toThrow(/one image/);
	});

	it('rejects image sources that are not http(s) URLs or paths', () => {
		for (const src of ['javascript:alert(1)', 'data:image/png;base64,AAAA', 'file:///etc/passwd']) {
			const markdown = withCardBody(`${headline}\n\n![](${src})\n\nText.`);
			expect(() => parseGameFile(markdown)).toThrow(/http\(s\) URL or a path/);
		}
	});

	it('resolves a relative path against the game file when baseUrl is given', () => {
		const parse = (src, baseUrl) =>
			betrayal(parseGameFile(withCardBody(`${headline}\n\n![](${src})\n\nText.`), { baseUrl }).deck)
				.image.src;
		expect(parse('art/betrayal.jpg', '/games/future-lost.game.md')).toBe('/games/art/betrayal.jpg');
		expect(parse('./betrayal.jpg', '/games/future-lost.game.md')).toBe('/games/betrayal.jpg');
		expect(parse('/art/betrayal.jpg', '/games/future-lost.game.md')).toBe('/art/betrayal.jpg');
		expect(parse('https://cdn.example/x.jpg?v=2', '/games/future-lost.game.md')).toBe(
			'https://cdn.example/x.jpg?v=2'
		);
		expect(parse('art/x.jpg', 'https://example.com/games/future-lost.game.md')).toBe(
			'https://example.com/games/art/x.jpg'
		);
		// Without a base the path is left as written
		expect(parse('art/betrayal.jpg', undefined)).toBe('art/betrayal.jpg');
	});
});
