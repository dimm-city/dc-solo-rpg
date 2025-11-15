/**
 * Game initialization utilities
 * Centralized logic for initializing game state
 */
import { gameState } from './gameStore.svelte.js';
import { getSettings } from './settingsStore.svelte.js';

/**
 * Shuffle array in place using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
export function shuffle(array) {
	let currentIndex = array.length;
	while (currentIndex !== 0) {
		const randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}
	return array;
}

/**
 * Initialize game state with configuration
 * This is the single source of truth for game initialization
 * Used by both the route loader and the startGame action
 *
 * @param {Object} gameConfig - Complete game configuration
 * @param {Object} player - Player object with name
 * @param {Object} [options] - Optional game options to override config options
 */
export function initializeGame(gameConfig, player, options = {}) {
	if (!player?.name) {
		throw new Error('Must provide a valid player with name');
	}

	if (!gameConfig?.deck) {
		throw new Error('Game configuration must include a deck');
	}

	// Load saved settings from localStorage
	const savedSettings = getSettings();

	// Merge options: saved settings < config options < passed options
	// This allows passed options to override saved settings
	const finalConfig = {
		...gameConfig,
		options: {
			...gameConfig.options,
			difficulty: savedSettings.difficulty,
			dice: savedSettings.diceTheme,
			...options
		}
	};

	// Set up deck with difficulty adjustments
	let deck = shuffle([...gameConfig.deck]);

	// Handle difficulty 0 (easy mode - remove Ace of Hearts)
	let aceOfHeartsRevealed = false;
	let startingTokens = finalConfig.options?.startingTokens || 10;

	if (finalConfig.options?.difficulty === 0) {
		aceOfHeartsRevealed = true;
		deck = deck.filter((c) => !(c.card === 'A' && c.suit === 'hearts'));
		

	}

	// Apply initial damage roll (SRD digital enhancement)
	// Game starts at 48-53 resources instead of 54
	const applyInitialDamage = finalConfig.options?.initialDamage !== false;
	const initialDamageRoll = applyInitialDamage ? Math.floor(Math.random() * 6) + 1 : 0;
	const startingTower = 54 - initialDamageRoll;

	// Initialize all game state in one operation
	Object.assign(gameState, {
		config: finalConfig,
		originalConfig: JSON.parse(JSON.stringify(finalConfig)), // Deep copy for restart
		stylesheet: finalConfig.stylesheet || gameConfig.stylesheet || '',
		systemConfig: { gameConfigUrl: `/games/${gameConfig.slug || 'default'}/` },
		state: 'showIntro',
		round: 1,
		player,
		playerName: player.name,
		tokens: 10,
		kingsRevealed: 0,
		kingOfHearts: false,
		kingOfDiamonds: false,
		kingOfClubs: false,
		kingOfSpades: false,
		aceOfHeartsRevealed,
		gameOver: false,
		win: false,
		tower: startingTower,
		bonus: aceOfHeartsRevealed ? 1 : 0,
		log: [],
		journalEntries: [],
		cardsToDraw: 0,
		currentCard: null,
		diceRoll: 0,
		deck
	});

	// Log initial damage for player visibility
	if (applyInitialDamage) {
		gameState.log.push({
			type: 'system',
			message: `Initial setup: Lost ${initialDamageRoll} resources to instability`,
			round: 0,
			id: '0.0'
		});
	}
}
