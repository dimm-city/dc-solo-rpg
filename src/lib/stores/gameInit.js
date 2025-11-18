/**
 * Game initialization utilities
 * Centralized logic for initializing game state
 */
import { gameState } from './gameStore.svelte.js';
import { getSettings } from './settingsStore.svelte.js';
import { shuffleArray } from '../services/random.js';
import { getDiceTheme } from '../configuration/DiceThemes.js';

/**
 * Shuffle array in place using Fisher-Yates algorithm
 * @deprecated Use shuffleArray from random service instead
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
export function shuffle(array) {
	return shuffleArray(array);
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

	// Convert saved dice theme key to full theme object
	const savedDiceTheme = savedSettings.diceTheme ? getDiceTheme(savedSettings.diceTheme) : null;

	// Merge options: config options < saved settings < passed options
	// Note: Difficulty is controlled by game config, not user settings
	const finalConfig = {
		...gameConfig,
		options: {
			...gameConfig.options,
			...(savedDiceTheme && { dice: savedDiceTheme }),
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

	// Initialize all game state in one operation
	// Note: Initial damage roll is now interactive, applied after intro screen
	Object.assign(gameState, {
		config: finalConfig,
		originalConfig: JSON.parse(JSON.stringify(finalConfig)), // Deep copy for restart
		stylesheet: finalConfig.stylesheet || gameConfig.stylesheet || '',
		systemConfig: { gameConfigUrl: `/games/${gameConfig.slug || 'default'}/` },
		state: 'showIntro',
		round: 1,
		player,
		playerName: player.name,
		tokens: startingTokens,
		kingsRevealed: 0,
		kingOfHearts: false,
		kingOfDiamonds: false,
		kingOfClubs: false,
		kingOfSpades: false,
		aceOfHeartsRevealed,
		acesRevealed: aceOfHeartsRevealed ? 1 : 0, // D20 system: Track Aces for salvation threshold
		gameOver: false,
		win: false,
		tower: 20, // D20 system: Always start at 20 Stability (was 54 in d6 system)
		log: [],
		journalEntries: [],
		cardsToDraw: 0,
		currentCard: null,
		diceRoll: 0,
		deck
	});
}
