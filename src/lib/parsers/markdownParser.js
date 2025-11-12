/**
 * Type-Based Markdown Parser
 * Parses .game.md files into game configuration objects
 */

/**
 * Custom error class for validation failures
 */
export class ValidationError extends Error {
	constructor(errors) {
		const message = Array.isArray(errors) ? errors.join('\n') : errors;
		super(message);
		this.name = 'ValidationError';
		this.errors = Array.isArray(errors) ? errors : [errors];
	}
}

/**
 * Parse frontmatter from markdown
 * @param {string} content - Markdown content
 * @returns {{frontmatter: object, content: string}}
 */
function parseFrontmatter(content) {
	// Prevent ReDoS by limiting input size and using safer parsing
	const MAX_FRONTMATTER_SIZE = 10000; // 10KB reasonable limit for game metadata

	if (content.length > MAX_FRONTMATTER_SIZE * 10) {
		throw new ValidationError('File too large. Game files should be under 100KB.');
	}

	// Find frontmatter boundaries using indexOf instead of complex regex
	if (!content.startsWith('---')) {
		throw new ValidationError('No frontmatter found. File must start with --- frontmatter ---');
	}

	const firstDelimiter = content.indexOf('\n', 3); // After opening ---
	if (firstDelimiter === -1) {
		throw new ValidationError('Invalid frontmatter format. Missing closing ---');
	}

	const closingDelimiter = content.indexOf('\n---\n', firstDelimiter);
	if (closingDelimiter === -1) {
		throw new ValidationError('Invalid frontmatter format. Missing closing ---');
	}

	const frontmatterText = content.substring(firstDelimiter + 1, closingDelimiter);
	const remainingContent = content.substring(closingDelimiter + 5); // Skip \n---\n

	if (frontmatterText.length > MAX_FRONTMATTER_SIZE) {
		throw new ValidationError('Frontmatter section too large. Should contain only title, subtitle, and messages.');
	}

	// Simple YAML parsing for our limited use case
	const frontmatter = {};
	const lines = frontmatterText.split('\n');

	for (const line of lines) {
		const colonIndex = line.indexOf(':');
		if (colonIndex > 0) {
			const key = line.substring(0, colonIndex).trim();
			const value = line.substring(colonIndex + 1).trim();
			frontmatter[key] = value;
		}
	}

	// Validate required fields
	const requiredFields = ['title', 'win-message', 'lose-message'];
	const missingFields = requiredFields.filter(field => !frontmatter[field]);

	if (missingFields.length > 0) {
		throw new ValidationError(
			`Missing required frontmatter fields: ${missingFields.join(', ')}`
		);
	}

	return { frontmatter, content: remainingContent };
}

/**
 * Split content into introduction and card deck sections
 * @param {string} content - Markdown content after frontmatter
 * @returns {{introduction: string, cardDeck: string}}
 */
function splitSections(content) {
	const cardDeckRegex = /^#\s+Card Deck\s*$/m;
	const match = content.search(cardDeckRegex);

	if (match === -1) {
		throw new ValidationError('No "# Card Deck" section found');
	}

	const introduction = content.substring(0, match).trim();
	const cardDeck = content.substring(match).trim();

	return { introduction, cardDeck };
}

/**
 * Parse introduction section into structured format
 * @param {string} introduction - Introduction markdown
 * @returns {Array<{heading: string, content: string}>}
 */
function parseIntroduction(introduction) {
	const sections = [];
	const headingRegex = /^##\s+(.+)$/gm;

	let lastIndex = 0;
	let match;
	const matches = [];

	// Collect all h2 headings
	while ((match = headingRegex.exec(introduction)) !== null) {
		matches.push({
			heading: match[1].trim(),
			index: match.index,
			fullMatch: match[0]
		});
	}

	// Extract content between headings
	for (let i = 0; i < matches.length; i++) {
		const current = matches[i];
		const next = matches[i + 1];

		const contentStart = current.index + current.fullMatch.length;
		const contentEnd = next ? next.index : introduction.length;

		sections.push({
			heading: current.heading,
			content: introduction.substring(contentStart, contentEnd).trim()
		});
	}

	return sections;
}

/**
 * Normalize card type string
 * @param {string} type - Raw type string
 * @returns {string} Normalized type
 */
function normalizeType(type) {
	const normalized = type.toLowerCase().trim();

	// Map various forms to canonical types
	const typeMap = {
		'primary success': 'primary-success',
		'primary-success': 'primary-success',
		'failure counter': 'failure-counter',
		'failure-counter': 'failure-counter',
		narrative: 'narrative',
		challenge: 'challenge',
		event: 'event'
	};

	return typeMap[normalized] || normalized;
}

/**
 * Parse modifiers from card header
 * @param {string} modifierText - Text after colon in header
 * @returns {{explicit: string|null, special: string|null}}
 */
function parseModifiers(modifierText) {
	if (!modifierText) {
		return { explicit: null, special: null };
	}

	const parts = modifierText.split(',').map(p => p.trim());
	let explicit = null;
	let special = null;

	for (const part of parts) {
		if (part === 'skip-damage' || part === 'return-king') {
			special = part;
		} else if (part.match(/^[A23456789JQK10]+-[a-z]+$/i)) {
			// Card assignment like "7-hearts" or "A-clubs"
			explicit = part.toLowerCase();
		}
	}

	return { explicit, special };
}

/**
 * Parse individual card section
 * @param {string} section - Card section markdown
 * @returns {object} Parsed card data
 */
function parseCardSection(section) {
	// Parse header: ### Type or ### Type: modifiers or #### Type: modifiers
	const headerMatch = section.match(/^#{3,4}\s+([^:\n]+)(?::\s*(.+))?/m);

	if (!headerMatch) {
		throw new ValidationError(`Invalid card section format: ${section.substring(0, 50)}...`);
	}

	const type = normalizeType(headerMatch[1].trim());
	const modifiers = parseModifiers(headerMatch[2]);

	// Parse description (text in **bold**)
	const descMatch = section.match(/\*\*(.+?)\*\*/);
	const description = descMatch ? descMatch[1].trim() : '';

	if (!description) {
		throw new ValidationError(
			`Card missing description (text in **bold**): ${section.substring(0, 50)}...`
		);
	}

	// Extract story (everything after the description)
	const descriptionEnd = section.indexOf(description) + description.length + 2; // +2 for **
	let story = section.substring(descriptionEnd).trim();

	// Remove the header if it's still there
	story = story.replace(/^#{3,4}\s+.+$/m, '').trim();

	return {
		type,
		modifiers,
		description,
		story: story || null
	};
}

/**
 * Parse all card sections from card deck markdown
 * @param {string} cardDeckContent - Card deck section
 * @returns {object} Cards grouped by type
 */
function parseCardDeck(cardDeckContent) {
	// Split by horizontal rules or card headers
	const cardSections = cardDeckContent.split(/\n---\n/).filter(s => s.trim());

	const cardsByType = {
		'primary-success': [],
		'failure-counter': [],
		'narrative': [],
		'narrative-skip-damage': [],
		'narrative-return-king': [],
		challenge: [],
		event: []
	};

	for (const section of cardSections) {
		// Skip the "# Card Deck" heading
		if (section.match(/^#\s+Card Deck\s*$/)) {
			continue;
		}

		try {
			const card = parseCardSection(section);

			// Special handling for narrative with modifiers
			if (card.type === 'narrative' && card.modifiers.special) {
				const key = `narrative-${card.modifiers.special}`;
				cardsByType[key].push(card);
			} else if (cardsByType[card.type]) {
				cardsByType[card.type].push(card);
			} else {
				throw new ValidationError(`Unknown card type: ${card.type}`);
			}
		} catch (error) {
			if (error instanceof ValidationError) {
				throw error;
			}
			// Skip sections that don't parse (like extra whitespace)
			console.warn('Skipping card section:', error.message);
		}
	}

	return cardsByType;
}

/**
 * Validate card counts
 * @param {object} cardsByType - Cards grouped by type
 * @throws {ValidationError} If counts are incorrect
 */
function validateCardCounts(cardsByType) {
	const errors = [];

	// Required exact counts
	if (cardsByType['primary-success'].length !== 1) {
		errors.push(
			`Expected exactly 1 Primary Success card, found ${cardsByType['primary-success'].length}`
		);
	}

	if (cardsByType['failure-counter'].length !== 4) {
		errors.push(
			`Expected exactly 4 Failure Counter cards, found ${cardsByType['failure-counter'].length}`
		);
	}

	// Narrative total (including modifiers)
	const narrativeTotal =
		cardsByType['narrative'].length +
		cardsByType['narrative-skip-damage'].length +
		cardsByType['narrative-return-king'].length;

	if (narrativeTotal !== 3) {
		errors.push(`Expected exactly 3 Narrative cards total, found ${narrativeTotal}`);
	}

	// Validate only one of each special modifier
	if (cardsByType['narrative-skip-damage'].length > 1) {
		errors.push('Only ONE Narrative card can have skip-damage modifier');
	}

	if (cardsByType['narrative-return-king'].length > 1) {
		errors.push('Only ONE Narrative card can have return-king modifier');
	}

	if (cardsByType['challenge'].length !== 16) {
		errors.push(`Expected exactly 16 Challenge cards, found ${cardsByType['challenge'].length}`);
	}

	if (cardsByType['event'].length !== 28) {
		errors.push(`Expected exactly 28 Event cards, found ${cardsByType['event'].length}`);
	}

	if (errors.length > 0) {
		throw new ValidationError(errors);
	}
}

/**
 * Parse card assignment string like "7-hearts" to {card: '7', suit: 'hearts'}
 * @param {string} assignment - Assignment string
 * @returns {{card: string, suit: string}}
 */
function parseCardAssignment(assignment) {
	const parts = assignment.split('-');
	if (parts.length !== 2) {
		throw new ValidationError(`Invalid card assignment format: ${assignment}`);
	}

	const [card, suit] = parts;
	const validCards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
	const validSuits = ['hearts', 'diamonds', 'clubs', 'spades'];

	if (!validCards.includes(card.toUpperCase())) {
		throw new ValidationError(`Invalid card rank: ${card}`);
	}

	if (!validSuits.includes(suit.toLowerCase())) {
		throw new ValidationError(`Invalid suit: ${suit}`);
	}

	return { card: card.toUpperCase(), suit: suit.toLowerCase() };
}

/**
 * Assign cards to specific deck positions
 * @param {object} cardsByType - Cards grouped by type
 * @returns {Array} Complete 52-card deck
 */
function assignCardsToDeck(cardsByType) {
	const deck = [];
	const usedAssignments = new Set();

	// Helper to add card with assignment tracking
	function addCard(card, suit, type, data) {
		const assignment = `${card}-${suit}`;
		if (usedAssignments.has(assignment)) {
			throw new ValidationError(`Duplicate card assignment: ${assignment}`);
		}
		usedAssignments.add(assignment);

		deck.push({
			card,
			suit,
			type,
			description: data.description,
			story: data.story,
			modifier: data.modifiers?.special || null
		});
	}

	// 1. Primary Success → A♥
	const primarySuccess = cardsByType['primary-success'][0];
	if (primarySuccess) {
		addCard('A', 'hearts', 'primary-success', primarySuccess);
	}

	// 2. Failure Counters → K♥, K♦, K♣, K♠
	const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
	cardsByType['failure-counter'].forEach((card, i) => {
		if (i < 4) {
			// Ensure we don't overflow
			addCard('K', suits[i], 'failure-counter', card);
		}
	});

	// 3. Narrative → A♦, A♣, A♠ (with optional modifiers)
	const narrativeSuits = ['diamonds', 'clubs', 'spades'];
	const allNarratives = [
		...cardsByType['narrative'].map(c => ({ ...c, type: 'narrative' })),
		...cardsByType['narrative-skip-damage'].map(c => ({ ...c, type: 'narrative' })),
		...cardsByType['narrative-return-king'].map(c => ({ ...c, type: 'narrative' }))
	];

	allNarratives.forEach((card, i) => {
		// Check for explicit assignment
		let suit = narrativeSuits[i];
		if (card.modifiers.explicit) {
			const parsed = parseCardAssignment(card.modifiers.explicit);
			if (parsed.card !== 'A') {
				throw new ValidationError(
					`Narrative card explicit assignment must be an Ace: ${card.modifiers.explicit}`
				);
			}
			suit = parsed.suit;
		}

		addCard('A', suit, 'narrative', card);
	});

	// 4. Challenge → 3, 5, 7, 9 (auto-assign or explicit)
	const challengeRanks = ['3', '5', '7', '9'];
	assignCardsByType(deck, cardsByType['challenge'], challengeRanks, suits, 'challenge', usedAssignments, addCard);

	// 5. Event → 2, 4, 6, 8, 10, J, Q (auto-assign or explicit)
	const eventRanks = ['2', '4', '6', '8', '10', 'J', 'Q'];
	assignCardsByType(deck, cardsByType['event'], eventRanks, suits, 'event', usedAssignments, addCard);

	return deck;
}

/**
 * Helper to assign cards by type with auto-assignment
 * @param {Array} deck - Deck being built
 * @param {Array} cards - Cards of this type
 * @param {Array} ranks - Valid ranks for this type
 * @param {Array} suits - All suits
 * @param {string} type - Card type
 * @param {Set} usedAssignments - Track used assignments
 * @param {Function} addCard - Function to add card
 */
function assignCardsByType(deck, cards, ranks, suits, type, usedAssignments, addCard) {
	// Build available assignments
	const availableAssignments = [];
	for (const rank of ranks) {
		for (const suit of suits) {
			const assignment = `${rank}-${suit}`;
			if (!usedAssignments.has(assignment)) {
				availableAssignments.push({ card: rank, suit });
			}
		}
	}

	// Assign cards
	for (let i = 0; i < cards.length; i++) {
		const cardData = cards[i];

		if (cardData.modifiers.explicit) {
			// Use explicit assignment
			const parsed = parseCardAssignment(cardData.modifiers.explicit);

			// Validate rank is appropriate for type
			if (!ranks.includes(parsed.card)) {
				throw new ValidationError(
					`Invalid explicit assignment for ${type}: ${cardData.modifiers.explicit} (must be one of: ${ranks.join(', ')})`
				);
			}

			addCard(parsed.card, parsed.suit, type, cardData);
		} else {
			// Auto-assign
			if (i >= availableAssignments.length) {
				throw new ValidationError(
					`Not enough available ${type} slots for auto-assignment`
				);
			}

			const assignment = availableAssignments[i];
			addCard(assignment.card, assignment.suit, type, cardData);
		}
	}
}

/**
 * Main parser function
 * Parse Type-Based Markdown format into game configuration
 * @param {string} markdown - Raw markdown content
 * @returns {object} Game configuration object
 */
export function parseGameFile(markdown) {
	if (!markdown || typeof markdown !== 'string') {
		throw new ValidationError('Invalid input: markdown must be a non-empty string');
	}

	try {
		// 1. Parse frontmatter
		const { frontmatter, content } = parseFrontmatter(markdown);

		// 2. Split into sections
		const { introduction, cardDeck } = splitSections(content);

		// 3. Parse introduction
		const introductionSections = parseIntroduction(introduction);

		// 4. Parse card deck
		const cardsByType = parseCardDeck(cardDeck);

		// 5. Validate card counts
		validateCardCounts(cardsByType);

		// 6. Assign cards to deck positions
		const deck = assignCardsToDeck(cardsByType);

		// 7. Build final configuration
		return {
			title: frontmatter.title,
			subtitle: frontmatter.subtitle || '',
			'win-message': frontmatter['win-message'],
			'lose-message': frontmatter['lose-message'],
			introduction: introductionSections,
			deck,
			metadata: {
				format: 'v2-type-based',
				version: '2.0',
				parsed: new Date().toISOString()
			}
		};
	} catch (error) {
		if (error instanceof ValidationError) {
			throw error;
		}
		throw new ValidationError(`Parser error: ${error.message}`);
	}
}
