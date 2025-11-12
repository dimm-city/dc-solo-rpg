/**
 * Game actions using Svelte 5 runes
 * All game logic and state mutations
 */
import { gameState, transitionTo } from './gameStore.svelte.js';
import { initializeGame } from './gameInit.js';
import { logger } from '../utils/logger.js';

/**
 * Mock services object for test compatibility
 * Tests can set services.gameSettings to provide config
 */
export const services = {
	gameSettings: null
};

/**
 * Start a new game
 * @param {object} player - Player object with name
 * @param {object} gameConfigOrOptions - Game configuration object OR options (for backwards compatibility)
 * @param {object} options - Game options (optional, used when gameConfigOrOptions is a full config)
 */
export const startGame = (player, gameConfigOrOptions = {}, options = {}) => {
	if (!player || !player.name) {
		throw new Error('Must provide a valid player');
	}

	// Determine if we got a full config or just options
	let gameConfig;
	let isFullConfig = false;

	// If gameConfigOrOptions has a deck, it's a full config
	if (gameConfigOrOptions.deck) {
		gameConfig = gameConfigOrOptions;
		isFullConfig = true;
	} else {
		// Otherwise, use services.gameSettings and treat second param as options
		gameConfig = services.gameSettings || gameState.config;
		options = gameConfigOrOptions;
	}

	if (!gameConfig || !gameConfig.deck) {
		throw new Error('Game configuration with deck is required');
	}

	// If this is a full config (initial game load), use centralized initialization
	// If just options (from OptionsScreen), apply options and transition to intro
	if (isFullConfig) {
		initializeGame(gameConfig, player, options);
	} else {
		// Apply options to existing game state
		if (gameState.config) {
			gameState.config = {
				...gameState.config,
				options: { ...(gameState.config.options || {}), ...options }
			};
		}
		// Transition to intro screen
		transitionTo('intro');
	}
};

/**
 * Start a new round
 */
export const startRound = () => {
	logger.debug('[startRound] Called, current state:', gameState.state);

	gameState.round += 1;
	transitionTo('startRound');

	logger.debug('[startRound] Completed, new state:', gameState.state);
};

/**
 * Roll for tasks
 * @returns {Promise<number>} Dice roll result
 */
export async function rollForTasks() {
	const roll = gameState.getRandomNumber();

	gameState.cardsToDraw = roll;
	gameState.diceRoll = roll;
	gameState.currentCard = null;

	logger.debug(`[rollForTasks] Dice rolled: ${roll}, setting cardsToDraw to ${roll}`);
	return roll;
}

/**
 * Confirm task roll and proceed
 */
export function confirmTaskRoll() {
	logger.debug('[confirmTaskRoll] Called');
	transitionTo('drawCard');
	logger.debug('[confirmTaskRoll] Completed');
}

/**
 * Draw a card from the deck
 * @returns {object|null} The drawn card or null if deck is empty
 */
export function drawCard() {
	logger.debug('[drawCard] Function called');
	logger.debug(`[drawCard] BEFORE: cardsToDraw=${gameState.cardsToDraw}, state=${gameState.state}`);

	if (gameState.deck.length === 0) {
		gameState.gameOver = true;
		transitionTo('gameOver');
		return null;
	}

	const card = gameState.deck.pop();
	gameState.currentCard = card;
	gameState.cardsToDraw -= 1;

	logger.debug(
		`[drawCard] Drew ${card.card} of ${card.suit}, cardsToDrawRemaining: ${gameState.cardsToDraw}`
	);

	// Add to log
	card.id = `${gameState.round}.${gameState.log.filter((l) => l.round === gameState.round).length + 1}`;
	card.round = gameState.round;
	gameState.log.push(card);

	// Track kings
	if (card.card === 'K') {
		gameState.kingsRevealed += 1;
		const suitKey = `kingOf${card.suit.charAt(0).toUpperCase() + card.suit.slice(1)}`;
		gameState[suitKey] = true;
	}

	// Track aces
	if (card.card === 'A') {
		gameState.bonus += 1;
		if (card.suit === 'hearts') {
			gameState.aceOfHeartsRevealed = true;
		}
	}

	// Check for game over (4 kings)
	if (gameState.kingsRevealed === 4) {
		gameState.gameOver = true;
		gameState.win = false;
		gameState.status = gameState.config.labels.failureCounterLoss;
		transitionTo('gameOver');
		return card;
	}

	// Stay in drawCard state to show the card to the user
	// Transition will happen in confirmCard() after user sees it
	return card;
}

/**
 * Confirm drawn card and proceed
 */
export function confirmCard() {
	logger.debug('[confirmCard] Called');
	logger.debug(
		`[confirmCard] Current state: ${gameState.state}, cardsToDraw: ${gameState.cardsToDraw}`
	);

	const card = gameState.currentCard;

	// Clear the current card
	gameState.currentCard = null;

	// Determine next state based on the card that was just confirmed
	if (card) {
		// Per Wretched & Alone SRD: A, 3, 5, 7, 9 are odd-ranked and trigger damage
		const oddRanks = ['A', '3', '5', '7', '9'];
		const isOdd = oddRanks.includes(card.card);

		if (isOdd) {
			// Odd card requires failure check
			transitionTo('failureCheck');
		} else if (gameState.cardsToDraw > 0) {
			// More cards to draw
			transitionTo('drawCard');
		} else {
			// All cards drawn, go to journal
			transitionTo('log');
		}
	}
}

/**
 * Get failure check roll (without applying damage)
 * @returns {number} Dice roll result
 */
export function getFailureCheckRoll() {
	return gameState.getRandomNumber();
}

/**
 * Apply failure check result and update health
 * @param {number} result - Dice roll result
 */
export function applyFailureCheckResult(result) {
	if (gameState.gameOver) {
		throw new Error('The game is over, stop playing with the tower!');
	}

	gameState.diceRoll = result;

	// Update last log entry with dice roll
	const lastLog = gameState.log?.at(gameState.log.length - 1);
	if (lastLog) {
		gameState.log = [
			...gameState.log.slice(0, -1),
			{
				...lastLog,
				diceRoll: result
			}
		];
	}

	// Calculate and apply damage
	const blocksToRemove = Math.max(result - gameState.bonus, 0);
	gameState.tower -= blocksToRemove;

	// Check for tower collapse
	if (gameState.tower <= 0) {
		gameState.tower = 0;
		gameState.status = gameState.config.labels?.failureCheckLoss ?? 'The tower has fallen';
		gameState.gameOver = true;
		transitionTo('gameOver');
	} else {
		// Continue with next card or end turn
		if (gameState.cardsToDraw > 0) {
			transitionTo('drawCard');
		} else {
			transitionTo('log');
		}
	}
}

/**
 * Legacy failure check (kept for compatibility)
 * @deprecated Use getFailureCheckRoll + applyFailureCheckResult
 * @returns {Promise<number>}
 */
export async function failureCheck() {
	const result = getFailureCheckRoll();
	applyFailureCheckResult(result);
	return result;
}

/**
 * Confirm failure check and proceed
 */
export function confirmFailureCheck() {
	// State transition already handled in applyFailureCheckResult
}

/**
 * Record round in journal
 * @param {object} journalEntry - Journal entry
 * @param {string} journalEntry.text - Entry text
 */
export function recordRound(journalEntry) {
	if (journalEntry == null || journalEntry.text == null) {
		throw new Error('No journal entries provided for this round');
	}

	journalEntry.id = gameState.round;
	journalEntry.round = gameState.round;
	journalEntry.dateRecorded = journalEntry.dateRecorded || new Date().toISOString();
	gameState.journalEntries.push(journalEntry);

	// Determine and execute next action
	if (!gameState.gameOver) {
		if (gameState.aceOfHeartsRevealed) {
			// Go to success check screen
			transitionTo('successCheck');
		} else {
			// Start next round
			startRound();
		}
	}
}

/**
 * Perform success check
 * @returns {number} Dice roll result
 */
export function successCheck() {
	const roll = gameState.getRandomNumber();
	gameState.diceRoll = roll;

	if (roll === 6 || (gameState.config.difficulty > 0 && roll + gameState.bonus === 6)) {
		gameState.tokens -= 1;
	}

	if (gameState.tokens === 0) {
		// Per SRD: Don't immediately win - must face final damage roll first
		logger.debug('[successCheck] All tokens removed, transitioning to final damage roll');
		transitionTo('finalDamageRoll');
	} else {
		transitionTo('startRound');
	}

	return roll;
}

/**
 * Perform the final damage roll after all tokens are removed
 * This is the SRD's "salvation with risk" mechanic - victory can be snatched away at the last moment
 * @param {number} roll - Dice roll result
 */
export function performFinalDamageRoll(roll) {
	logger.debug(
		'[performFinalDamageRoll] Roll:',
		roll,
		'Bonus:',
		gameState.bonus,
		'Tower:',
		gameState.tower
	);

	gameState.diceRoll = roll;

	// Calculate damage (same formula as regular damage checks)
	const damage = Math.max(roll - gameState.bonus, 0);
	gameState.tower = Math.max(gameState.tower - damage, 0);

	logger.debug(
		`[performFinalDamageRoll] Damage: ${damage}, Remaining Tower: ${gameState.tower}`
	);

	// Log the final roll
	gameState.log.push({
		type: 'final-damage',
		roll,
		damage,
		tower: gameState.tower,
		timestamp: Date.now(),
		round: gameState.round,
		id: `${gameState.round}.final`
	});

	// Determine outcome
	if (gameState.tower > 0) {
		// VICTORY - Survived the final test
		gameState.win = true;
		gameState.gameOver = true;
		gameState.status =
			gameState.config.labels?.successCheckWin ?? 'Victory! Against all odds, you survived.';
		logger.info('[performFinalDamageRoll] VICTORY - Player survived final roll');
	} else {
		// DEFEAT - Victory snatched away
		gameState.win = false;
		gameState.gameOver = true;
		gameState.status =
			gameState.config.labels?.finalDamageRollLoss ??
			'So close... Victory was within reach, but the final test proved too much.';
		logger.info('[performFinalDamageRoll] DEFEAT - Final roll depleted tower');
	}

	transitionTo('gameOver');
}

/**
 * Confirm success check and proceed
 */
export function confirmSuccessCheck() {
	// State transition already handled in successCheck
}

/**
 * Restart the game
 */
export function restartGame() {
	startGame(gameState.player, gameState.config, {});
}

/**
 * Exit the game
 * @returns {Promise<void>}
 */
export async function exitGame() {
	const player = gameState.player;

	// Reset state
	gameState.config = {};
	gameState.player = player;
	gameState.deck = [];
	gameState.tokens = 10;
	gameState.kingsRevealed = 0;
	gameState.aceOfHeartsRevealed = false;
	gameState.gameOver = false;
	gameState.win = false;
	gameState.tower = 54;
	gameState.bonus = 0;
	gameState.log = [];
	gameState.journalEntries = [];
	gameState.round = 0;
	gameState.status = '';
	gameState.cardsToDraw = 0;
	gameState.currentCard = null;
	gameState.diceRoll = 0;
	gameState.stylesheet = '';

	transitionTo('exitGame');
}
