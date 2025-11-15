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
		// Transition to showIntro screen
		transitionTo('showIntro');
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
 * Generate Number
 * @returns {Promise<number>} Dice roll result
 */
export async function rollForTasks() {
	const roll = gameState.getRandomNumber();

	gameState.cardsToDraw = roll;
	// Defer diceRoll update until after animation
	gameState.pendingUpdates.diceRoll = roll;
	gameState.currentCard = null;

	logger.debug(`[rollForTasks] Dice rolled: ${roll}, setting cardsToDraw to ${roll}`);
	return roll;
}

/**
 * Apply pending dice roll for rollForTasks (after animation completes)
 */
export function applyPendingTaskRoll() {
	if (gameState.pendingUpdates.diceRoll !== null) {
		gameState.diceRoll = gameState.pendingUpdates.diceRoll;
		gameState.pendingUpdates.diceRoll = null;
		logger.debug('[applyPendingTaskRoll] Applied pending task roll');
	}
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

	// Store pending updates (to be applied when card is dismissed)
	// Track kings - store in pending state
	if (card.card === 'K') {
		gameState.pendingUpdates.kingsChange = 1;
		gameState.pendingUpdates.kingsSuit = card.suit;
	} else {
		gameState.pendingUpdates.kingsChange = null;
		gameState.pendingUpdates.kingsSuit = null;
	}

	// Track aces - store in pending state
	if (card.card === 'A') {
		gameState.pendingUpdates.bonusChange = 1;
		if (card.suit === 'hearts') {
			// Ace of hearts is tracked immediately for game logic
			gameState.aceOfHeartsRevealed = true;
		}
	} else {
		gameState.pendingUpdates.bonusChange = null;
	}

	// Check for game over (4 kings) - use pending + current state
	const totalKings =
		gameState.kingsRevealed + (gameState.pendingUpdates.kingsChange ? 1 : 0);
	if (totalKings === 4) {
		// Apply pending king update before game over
		if (gameState.pendingUpdates.kingsChange) {
			gameState.kingsRevealed += 1;
			const suitKey = `kingOf${gameState.pendingUpdates.kingsSuit.charAt(0).toUpperCase() + gameState.pendingUpdates.kingsSuit.slice(1)}`;
			gameState[suitKey] = true;
			gameState.pendingUpdates.kingsChange = null;
			gameState.pendingUpdates.kingsSuit = null;
		}
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
 * This is called when the card is dismissed, so we apply pending stat updates here
 */
export function confirmCard() {
	logger.debug('[confirmCard] Called');
	logger.debug(
		`[confirmCard] Current state: ${gameState.state}, cardsToDraw: ${gameState.cardsToDraw}`
	);

	const card = gameState.currentCard;

	// Apply pending stat updates from the card that was just displayed
	if (gameState.pendingUpdates.bonusChange) {
		gameState.bonus += gameState.pendingUpdates.bonusChange;
		gameState.pendingUpdates.bonusChange = null;
		logger.debug('[confirmCard] Applied pending bonus change');
	}

	if (gameState.pendingUpdates.kingsChange) {
		gameState.kingsRevealed += gameState.pendingUpdates.kingsChange;
		const suitKey = `kingOf${gameState.pendingUpdates.kingsSuit.charAt(0).toUpperCase() + gameState.pendingUpdates.kingsSuit.slice(1)}`;
		gameState[suitKey] = true;
		gameState.pendingUpdates.kingsChange = null;
		gameState.pendingUpdates.kingsSuit = null;
		logger.debug('[confirmCard] Applied pending kings change');
	}

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
 * This now stores the result in pending state to be applied after dice animation
 * @param {number} result - Dice roll result
 */
export function applyFailureCheckResult(result) {
	if (gameState.gameOver) {
		throw new Error('The game is over, stop playing with the tower!');
	}

	// Store in pending state (to be applied after dice animation)
	gameState.pendingUpdates.diceRoll = result;

	// Calculate damage (but don't apply yet)
	const blocksToRemove = Math.max(result - gameState.bonus, 0);
	gameState.pendingUpdates.towerDamage = blocksToRemove;

	logger.debug(
		`[applyFailureCheckResult] Stored pending dice roll ${result}, pending damage ${blocksToRemove}`
	);

	// Note: We don't transition state here anymore
	// The caller should call applyPendingDiceRoll() after the dice animation completes
}

/**
 * Apply pending dice roll updates after animation completes
 * This should be called after the dice animation finishes
 */
export function applyPendingDiceRoll() {
	if (gameState.pendingUpdates.diceRoll === null) {
		logger.warn('[applyPendingDiceRoll] No pending dice roll to apply');
		return;
	}

	const result = gameState.pendingUpdates.diceRoll;
	const blocksToRemove = gameState.pendingUpdates.towerDamage;

	// Apply the dice roll to state
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

	// Apply tower damage
	gameState.tower -= blocksToRemove;

	// Clear pending updates
	gameState.pendingUpdates.diceRoll = null;
	gameState.pendingUpdates.towerDamage = null;

	logger.debug(
		`[applyPendingDiceRoll] Applied dice roll ${result}, removed ${blocksToRemove} blocks, tower now at ${gameState.tower}`
	);

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
		if (gameState.aceOfHeartsRevealed && gameState.tokens > 0) {
			// Go to success check screen (only if there are tokens to remove)
			transitionTo('successCheck');
		} else if (gameState.tokens === 0 && gameState.aceOfHeartsRevealed) {
			// All tokens removed, go to final damage roll
			transitionTo('finalDamageRoll');
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

	// Store pending updates (to be applied after dice animation)
	gameState.pendingUpdates.diceRoll = roll;

	// Calculate token change but don't apply yet
	if (roll === 6 || (gameState.config.difficulty > 0 && roll + gameState.bonus === 6)) {
		gameState.pendingUpdates.tokenChange = -1;
	} else {
		gameState.pendingUpdates.tokenChange = 0;
	}

	logger.debug(`[successCheck] Stored pending roll ${roll}, pending token change ${gameState.pendingUpdates.tokenChange}`);

	return roll;
}

/**
 * Apply pending success check updates after dice animation completes
 */
export function applyPendingSuccessCheck() {
	if (gameState.pendingUpdates.diceRoll === null) {
		logger.warn('[applyPendingSuccessCheck] No pending success check to apply');
		return;
	}

	// Apply dice roll
	gameState.diceRoll = gameState.pendingUpdates.diceRoll;

	// Apply token change
	if (gameState.pendingUpdates.tokenChange !== null && gameState.pendingUpdates.tokenChange !== 0) {
		gameState.tokens += gameState.pendingUpdates.tokenChange;
	}

	// Clear pending updates
	gameState.pendingUpdates.diceRoll = null;
	gameState.pendingUpdates.tokenChange = null;

	logger.debug('[applyPendingSuccessCheck] Applied pending success check, tokens now:', gameState.tokens);

	// Transition based on token state
	if (gameState.tokens === 0) {
		// Per SRD: Don't immediately win - must face final damage roll first
		logger.debug('[applyPendingSuccessCheck] All tokens removed, transitioning to final damage roll');
		transitionTo('finalDamageRoll');
	} else {
		// Continue the game - start next round
		startRound();
	}
}

/**
 * Perform the initial damage roll before round 1
 * This is the SRD's digital enhancement - game starts with some instability
 * @param {number} roll - Dice roll result (1-6)
 */
export function performInitialDamageRoll(roll) {
	logger.debug('[performInitialDamageRoll] Roll:', roll, 'Tower:', gameState.tower);

	// Store pending updates (to be applied after dice animation)
	gameState.pendingUpdates.diceRoll = roll;
	gameState.pendingUpdates.towerDamage = roll;

	logger.debug(`[performInitialDamageRoll] Stored pending roll ${roll}, pending damage: ${roll}`);

	// Note: State transitions will happen in applyPendingInitialDamageRoll after animation
}

/**
 * Apply pending initial damage roll after dice animation completes
 */
export function applyPendingInitialDamageRoll() {
	if (gameState.pendingUpdates.diceRoll === null) {
		logger.warn('[applyPendingInitialDamageRoll] No pending initial damage roll to apply');
		return;
	}

	const roll = gameState.pendingUpdates.diceRoll;
	const damage = gameState.pendingUpdates.towerDamage;

	// Apply dice roll
	gameState.diceRoll = roll;

	// Apply tower damage
	gameState.tower = Math.max(gameState.tower - damage, 0);

	// Clear pending updates
	gameState.pendingUpdates.diceRoll = null;
	gameState.pendingUpdates.towerDamage = null;

	logger.debug(`[applyPendingInitialDamageRoll] Applied initial damage: ${damage}, tower now: ${gameState.tower}`);

	// Log the initial damage
	gameState.log.push({
		type: 'initial-damage',
		roll,
		damage,
		tower: gameState.tower,
		timestamp: Date.now(),
		round: 0,
		id: '0.0'
	});

	// Transition to first round
	transitionTo('rollForTasks');
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

	// Store pending updates (to be applied after dice animation)
	gameState.pendingUpdates.diceRoll = roll;

	// Calculate damage but don't apply yet
	const damage = Math.max(roll - gameState.bonus, 0);
	gameState.pendingUpdates.towerDamage = damage;

	logger.debug(`[performFinalDamageRoll] Stored pending roll ${roll}, pending damage: ${damage}`);

	// Note: State transitions will happen in applyPendingFinalDamageRoll after animation
}

/**
 * Apply pending final damage roll after dice animation completes
 */
export function applyPendingFinalDamageRoll() {
	if (gameState.pendingUpdates.diceRoll === null) {
		logger.warn('[applyPendingFinalDamageRoll] No pending final damage roll to apply');
		return;
	}

	const roll = gameState.pendingUpdates.diceRoll;
	const damage = gameState.pendingUpdates.towerDamage;

	// Apply dice roll
	gameState.diceRoll = roll;

	// Apply tower damage
	gameState.tower = Math.max(gameState.tower - damage, 0);

	// Clear pending updates
	gameState.pendingUpdates.diceRoll = null;
	gameState.pendingUpdates.towerDamage = null;

	logger.debug(`[applyPendingFinalDamageRoll] Applied final damage roll: ${roll}, damage: ${damage}, tower now: ${gameState.tower}`);

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
		logger.info('[applyPendingFinalDamageRoll] VICTORY - Player survived final roll');
	} else {
		// DEFEAT - Victory snatched away
		gameState.win = false;
		gameState.gameOver = true;
		gameState.status =
			gameState.config.labels?.finalDamageRollLoss ??
			'So close... Victory was within reach, but the final test proved too much.';
		logger.info('[applyPendingFinalDamageRoll] DEFEAT - Final roll depleted tower');
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
	// Use originalConfig to ensure clean restart
	startGame(gameState.player, gameState.originalConfig, {});
}

/**
 * Exit the game
 * @returns {Promise<void>}
 */
export async function exitGame() {
	const player = gameState.player;
	const originalConfig = gameState.originalConfig;

	// Reset state (restore original config for restart)
	gameState.config = JSON.parse(JSON.stringify(originalConfig)); // Deep copy
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
