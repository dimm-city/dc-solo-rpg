/**
 * Game initialization utilities
 * Centralized logic for initializing game state
 */
import { gameState, createRunState } from './gameStore.svelte.js';
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
	// Difficulty: game config (author default) < player setting < passed options
	const finalConfig = {
		...gameConfig,
		options: {
			...gameConfig.options,
			...(savedDiceTheme && { dice: savedDiceTheme }),
			...(savedSettings.difficulty != null && { difficulty: savedSettings.difficulty }),
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

	// Deep copy for restart. Keep the player's difficulty setting out of it so a restart re-reads it
	const restartConfig = JSON.parse(JSON.stringify(finalConfig));
	const restartDifficulty = options.difficulty ?? gameConfig.options?.difficulty;
	if (restartDifficulty === undefined) delete restartConfig.options.difficulty;
	else restartConfig.options.difficulty = restartDifficulty;

	// Initialize all game state in one operation, starting from a fresh run so nothing
	// (Lucid, Surreal, pending updates, the last card) carries over from an earlier game.
	// Note: Initial damage roll is now interactive, applied after intro screen
	Object.assign(gameState, createRunState(), {
		config: finalConfig,
		originalConfig: restartConfig,
		stylesheet: finalConfig.stylesheet || gameConfig.stylesheet || '',
		systemConfig: { gameConfigUrl: `/games/${gameConfig.slug || 'default'}/` },
		state: 'showIntro',
		round: 1,
		player,
		playerName: player.name,
		tokens: startingTokens,
		aceOfHeartsRevealed,
		acesRevealed: aceOfHeartsRevealed ? 1 : 0, // D20 system: Track Aces for salvation threshold
		tower: 20, // D20 system: Always start at 20 Stability
		deck
	});
}
