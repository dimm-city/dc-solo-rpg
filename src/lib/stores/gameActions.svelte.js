/**
 * Game actions using Svelte 5 runes
 * All game logic and state mutations
 */
import { gameState, transitionTo } from './gameStore.svelte.js';
import { initializeGame } from './gameInit.js';
import { logger } from '../utils/logger.js';
import { saveGame, loadGame, clearSave, restoreGameState } from './indexedDBStorage.js';
import {
	convertD20ToCardCount,
	calculateStabilityLoss,
	getSalvationThreshold,
	calculateSalvationResult
} from '../services/d20Mechanics.js';

// Re-export D20 mechanics for backwards compatibility
export {
	convertD20ToCardCount,
	calculateStabilityLoss,
	getSalvationThreshold,
	calculateSalvationResult
};

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
		// Clear any existing save when starting a new game
		// Extract game slug for clearing save
		const gameSlug =
			gameConfig.slug || gameConfig.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'default';
		clearSave(gameSlug);
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
		// Save after updating options
		saveGame(gameState);
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
 * Roll for number of tasks (cards to draw)
 * D20 system: Roll d20, convert to 1-6 cards, handle Lucid/Surreal states
 * @returns {Promise<{roll: number, wasLucid: boolean, wasSurreal: boolean}>} Roll result and modifier flags
 */
export async function rollForTasks() {
	// Roll d20 with Lucid/Surreal modifiers
	const { roll, wasLucid, wasSurreal } = gameState.rollWithModifiers();

	// Convert d20 result to card count (1-6)
	const cardCount = convertD20ToCardCount(roll);

	gameState.cardsToDraw = cardCount;
	// Defer diceRoll update until after animation (store actual d20 roll)
	gameState.pendingUpdates.diceRoll = roll;
	gameState.currentCard = null;

	// Handle Lucid/Surreal state changes from this roll (deferred until after animation)
	if (roll === 20) {
		gameState.pendingUpdates.isLucid = true;
		logger.debug(`[rollForTasks] Natural 20! Next roll will be Lucid (advantage)`);
	} else if (roll === 1) {
		gameState.pendingUpdates.isSurreal = true;
		logger.debug(`[rollForTasks] Natural 1! Next roll will be Surreal (disadvantage)`);
	}

	logger.debug(
		`[rollForTasks] D20 rolled: ${roll} (${wasLucid ? 'LUCID' : wasSurreal ? 'SURREAL' : 'normal'}) → ${cardCount} cards`
	);
	return { roll, wasLucid, wasSurreal };
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

	// Apply pending modifier state changes (after animation)
	if (gameState.pendingUpdates.isLucid !== null) {
		gameState.isLucid = gameState.pendingUpdates.isLucid;
		gameState.pendingUpdates.isLucid = null;
		logger.debug('[applyPendingTaskRoll] Applied pending Lucid state');
	}
	if (gameState.pendingUpdates.isSurreal !== null) {
		gameState.isSurreal = gameState.pendingUpdates.isSurreal;
		gameState.pendingUpdates.isSurreal = null;
		logger.debug('[applyPendingTaskRoll] Applied pending Surreal state');
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
		saveGame(gameState);
		return null;
	}

	const card = gameState.deck.pop();
	gameState.currentCard = card;
	gameState.cardsToDraw -= 1;

	logger.debug(
		`[drawCard] Drew ${card.card} of ${card.suit}, cardsToDrawRemaining: ${gameState.cardsToDraw}`
	);

	// Add to log with game state snapshot
	card.id = `${gameState.round}.${gameState.log.filter((l) => l.round === gameState.round).length + 1}`;
	card.round = gameState.round;
	card.gameState = {
		tower: gameState.tower,
		tokens: gameState.tokens,
		kingsRevealed: gameState.kingsRevealed,
		aceOfHeartsRevealed: gameState.aceOfHeartsRevealed,
		acesRevealed: gameState.acesRevealed // D20 system: track total Aces for salvation threshold
	};
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
	// D20 system: Aces modify salvation threshold via acesRevealed counter
	if (card.card === 'A') {
		gameState.pendingUpdates.aceChange = 1;
		if (card.suit === 'hearts') {
			// Ace of hearts is tracked immediately for game logic
			gameState.aceOfHeartsRevealed = true;
		}
	} else {
		gameState.pendingUpdates.aceChange = null;
	}

	// Check for game over (4 kings) - mark as pending, don't trigger immediately
	const totalKings = gameState.kingsRevealed + (gameState.pendingUpdates.kingsChange ? 1 : 0);
	if (totalKings === 4) {
		// Mark that game will end after this card is confirmed
		gameState.pendingUpdates.gameOverCondition = {
			type: 'kingsRevealed',
			win: false,
			status: gameState.config.labels.failureCounterLoss
		};
	}

	// Auto-save after drawing a card
	saveGame(gameState);

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
	// D20 system: Aces increment acesRevealed counter (used for salvation threshold)
	if (gameState.pendingUpdates.aceChange) {
		gameState.acesRevealed += gameState.pendingUpdates.aceChange;
		gameState.pendingUpdates.aceChange = null;
		logger.debug(
			'[confirmCard] Applied pending ace change, acesRevealed now:',
			gameState.acesRevealed
		);
	}

	if (gameState.pendingUpdates.kingsChange) {
		gameState.kingsRevealed += gameState.pendingUpdates.kingsChange;
		const suitKey = `kingOf${gameState.pendingUpdates.kingsSuit.charAt(0).toUpperCase() + gameState.pendingUpdates.kingsSuit.slice(1)}`;
		gameState[suitKey] = true;
		gameState.pendingUpdates.kingsChange = null;
		gameState.pendingUpdates.kingsSuit = null;
		logger.debug('[confirmCard] Applied pending kings change');
	}

	// Check for pending game over condition (4 kings, tower collapse, etc.)
	if (gameState.pendingUpdates.gameOverCondition) {
		const condition = gameState.pendingUpdates.gameOverCondition;
		gameState.gameOver = true;
		gameState.win = condition.win;
		gameState.status = condition.status;
		gameState.pendingUpdates.gameOverCondition = null;
		logger.info(`[confirmCard] Game Over - ${condition.type}`);
		transitionTo('gameOver');
		saveGame(gameState);
		return; // Exit early, game is over
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
			// All cards drawn - check for success check first, then journal
			if (gameState.aceOfHeartsRevealed && gameState.tokens > 0) {
				transitionTo('successCheck');
			} else {
				transitionTo('log');
			}
		}
	}
}

/**
 * Get failure check roll (without applying damage)
 * D20 system: Uses rollWithModifiers() for Lucid/Surreal advantage/disadvantage
 * @returns {{roll: number, wasLucid: boolean, wasSurreal: boolean}} Roll result and modifier flags
 */
export function getFailureCheckRoll() {
	// Roll d20 with Lucid/Surreal modifiers
	const { roll, wasLucid, wasSurreal } = gameState.rollWithModifiers();

	logger.debug(
		`[getFailureCheckRoll] D20 roll: ${roll} (${wasLucid ? 'LUCID' : wasSurreal ? 'SURREAL' : 'normal'})`
	);
	return { roll, wasLucid, wasSurreal };
}

/**
 * Apply failure check result and update health
 * D20 system: Uses calculateStabilityLoss() and handles Lucid/Surreal state changes
 * Stores result in pending state to be applied after dice animation
 * @param {number} result - D20 roll result
 */
export function applyFailureCheckResult(result) {
	if (gameState.gameOver) {
		throw new Error('The game is over, stop playing with the tower!');
	}

	// Store in pending state (to be applied after dice animation)
	gameState.pendingUpdates.diceRoll = result;

	// Calculate stability loss using d20 table (bonus no longer applies)
	const { loss, gainedLucid, gainedSurreal, optionalGain } = calculateStabilityLoss(result);

	gameState.pendingUpdates.towerDamage = loss;

	// Handle Lucid/Surreal state changes from this roll (deferred until after animation)
	if (gainedLucid) {
		gameState.pendingUpdates.isLucid = true;
		logger.debug(`[applyFailureCheckResult] Natural 20! Next roll will be Lucid`);
	} else if (gainedSurreal) {
		gameState.pendingUpdates.isSurreal = true;
		logger.debug(`[applyFailureCheckResult] Natural 1! Next roll will be Surreal`);
	}

	// Handle optional stability gain (auto-apply for now)
	if (optionalGain > 0) {
		gameState.pendingUpdates.towerGain = optionalGain;
	}

	logger.debug(
		`[applyFailureCheckResult] Stored pending dice roll ${result}, pending stability loss ${loss}, optional gain ${optionalGain}`
	);

	// Note: We don't transition state here anymore
	// The caller should call applyPendingDiceRoll() after the dice animation completes
}

/**
 * Apply pending dice roll updates after animation completes
 * D20 system: Handles both stability loss and stability gain
 * This should be called after the dice animation finishes
 */
export function applyPendingDiceRoll() {
	if (gameState.pendingUpdates.diceRoll === null) {
		logger.warn('[applyPendingDiceRoll] No pending dice roll to apply');
		return;
	}

	const result = gameState.pendingUpdates.diceRoll;
	const stabilityLoss = gameState.pendingUpdates.towerDamage || 0;
	const stabilityGain = gameState.pendingUpdates.towerGain || 0;

	// Apply the dice roll to state
	gameState.diceRoll = result;

	// Update last log entry with dice roll
	const lastLog = gameState.log?.at(gameState.log.length - 1);
	if (lastLog) {
		gameState.log = [
			...gameState.log.slice(0, -1),
			{
				...lastLog,
				diceRoll: result,
				damageDealt: stabilityLoss
			}
		];
	}

	// Apply stability gain first (if any, from natural 20)
	if (stabilityGain > 0) {
		gameState.tower = Math.min(gameState.tower + stabilityGain, 20); // Cap at 20 Stability
		logger.debug(
			`[applyPendingDiceRoll] Applied stability gain +${stabilityGain}, stability now at ${gameState.tower} (capped at 20)`
		);
	}

	// Apply stability loss
	if (stabilityLoss > 0) {
		gameState.tower -= stabilityLoss;
		logger.debug(
			`[applyPendingDiceRoll] Applied stability loss -${stabilityLoss}, stability now at ${gameState.tower}`
		);
	}

	// Apply pending modifier state changes (after animation)
	if (gameState.pendingUpdates.isLucid !== null) {
		gameState.isLucid = gameState.pendingUpdates.isLucid;
		gameState.pendingUpdates.isLucid = null;
		logger.debug('[applyPendingDiceRoll] Applied pending Lucid state');
	}
	if (gameState.pendingUpdates.isSurreal !== null) {
		gameState.isSurreal = gameState.pendingUpdates.isSurreal;
		gameState.pendingUpdates.isSurreal = null;
		logger.debug('[applyPendingDiceRoll] Applied pending Surreal state');
	}

	// Clear pending updates
	gameState.pendingUpdates.diceRoll = null;
	gameState.pendingUpdates.towerDamage = null;
	gameState.pendingUpdates.towerGain = null;

	// Check for stability collapse
	if (gameState.tower <= 0) {
		gameState.tower = 0;
		gameState.status =
			gameState.config.labels?.failureCheckLoss ?? 'Stability collapsed completely';
		gameState.gameOver = true;
		transitionTo('gameOver');
	} else {
		// Continue with next card or end turn
		if (gameState.cardsToDraw > 0) {
			transitionTo('drawCard');
		} else {
			// All cards drawn - check for success check first, then journal
			if (gameState.aceOfHeartsRevealed && gameState.tokens > 0) {
				transitionTo('successCheck');
			} else {
				transitionTo('log');
			}
		}
	}

	// Auto-save after applying damage
	saveGame(gameState);
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
 * @param {string} [journalEntry.text] - Entry text (optional)
 * @param {string} [journalEntry.audioData] - Base64 encoded audio data (optional)
 */
export async function recordRound(journalEntry) {
	if (journalEntry == null) {
		throw new Error('Journal entry object is required');
	}

	// Check if a journal entry already exists for this round
	const existingEntry = gameState.journalEntries.find((entry) => entry.round === gameState.round);
	if (existingEntry) {
		logger.warn(
			`[recordRound] WARNING: Journal entry already exists for round ${gameState.round}. Preventing duplicate.`,
			{
				existingEntry,
				attemptedEntry: journalEntry
			}
		);
		console.warn(
			`[recordRound] WARNING: Cannot save journal entry - an entry already exists for round ${gameState.round}. Each round can only have one journal entry.`
		);
		return; // Prevent duplicate
	}

	// Create a new object to avoid mutating the passed reference
	const newEntry = {
		round: gameState.round,
		text: journalEntry.text || '',
		audioData: journalEntry.audioData || null,
		dateRecorded: journalEntry.dateRecorded || new Date().toISOString()
	};

	gameState.journalEntries.push(newEntry);
	logger.debug(`[recordRound] Saved journal for round ${gameState.round}:`, {
		round: newEntry.round,
		hasText: !!newEntry.text,
		hasAudio: !!newEntry.audioData,
		totalEntries: gameState.journalEntries.length
	});

	// Determine and execute next action BEFORE saving
	// Success check now happens BEFORE journal entry, so we just start the next round
	// Transition state first so that when game is saved, it's in the next round state
	if (!gameState.gameOver) {
		startRound();
	}

	// Auto-save after recording journal entry and transitioning state
	await saveGame(gameState);
}

/**
 * Perform success check
 * D20 system: Uses Ace-dependent thresholds and graduated token changes
 * @returns {{roll: number, wasLucid: boolean, wasSurreal: boolean}} Roll result and modifier flags
 */
export function successCheck() {
	// Roll d20 with Lucid/Surreal modifiers
	const { roll, wasLucid, wasSurreal } = gameState.rollWithModifiers();

	// Store pending updates (to be applied after dice animation)
	gameState.pendingUpdates.diceRoll = roll;

	// Get threshold based on Aces revealed
	const threshold = getSalvationThreshold(gameState.acesRevealed);

	// Calculate token change using salvation table
	const { tokenChange, gainedLucid, gainedSurreal } = calculateSalvationResult(roll, threshold);

	gameState.pendingUpdates.tokenChange = tokenChange;

	// Handle Lucid/Surreal state changes from this roll (deferred until after animation)
	if (gainedLucid) {
		gameState.pendingUpdates.isLucid = true;
		logger.debug(`[successCheck] Natural 20! Next roll will be Lucid`);
	} else if (gainedSurreal) {
		gameState.pendingUpdates.isSurreal = true;
		logger.debug(`[successCheck] Natural 1! Next roll will be Surreal`);
	}

	logger.debug(
		`[successCheck] D20 roll: ${roll} (${wasLucid ? 'LUCID' : wasSurreal ? 'SURREAL' : 'normal'}), threshold: ${threshold}, pending token change: ${tokenChange}`
	);

	// Auto-save after success check
	saveGame(gameState);

	return { roll, wasLucid, wasSurreal };
}

/**
 * Apply pending success check updates after dice animation completes
 * D20 system: Handles graduated token changes (+2 to -2) and victory when tokens = 0
 */
export function applyPendingSuccessCheck() {
	if (gameState.pendingUpdates.diceRoll === null) {
		logger.warn('[applyPendingSuccessCheck] No pending success check to apply');
		return;
	}

	// Apply dice roll
	gameState.diceRoll = gameState.pendingUpdates.diceRoll;

	// Apply token change (can be negative for success, positive for failure)
	if (gameState.pendingUpdates.tokenChange !== null && gameState.pendingUpdates.tokenChange !== 0) {
		gameState.tokens += gameState.pendingUpdates.tokenChange;

		// Ensure tokens don't go below 0
		gameState.tokens = Math.max(gameState.tokens, 0);
	}

	// Apply pending modifier state changes (after animation)
	if (gameState.pendingUpdates.isLucid !== null) {
		gameState.isLucid = gameState.pendingUpdates.isLucid;
		gameState.pendingUpdates.isLucid = null;
		logger.debug('[applyPendingSuccessCheck] Applied pending Lucid state');
	}
	if (gameState.pendingUpdates.isSurreal !== null) {
		gameState.isSurreal = gameState.pendingUpdates.isSurreal;
		gameState.pendingUpdates.isSurreal = null;
		logger.debug('[applyPendingSuccessCheck] Applied pending Surreal state');
	}

	// Clear pending updates
	gameState.pendingUpdates.diceRoll = null;
	gameState.pendingUpdates.tokenChange = null;

	logger.debug(
		'[applyPendingSuccessCheck] Applied pending success check, tokens now:',
		gameState.tokens
	);

	// Transition based on token state
	if (gameState.tokens === 0) {
		// D20 System: Victory when tokens reach 0 (no final damage roll)
		gameState.win = true;
		gameState.gameOver = true;
		gameState.status =
			gameState.config.labels?.successCheckWin ?? 'Victory! Against all odds, you escaped.';
		logger.info('[applyPendingSuccessCheck] VICTORY - All tokens removed');
		transitionTo('gameOver');

		// Auto-save after victory
		saveGame(gameState);
	} else {
		// Continue the game - go to journal entry before starting next round
		transitionTo('log');
	}
}

/**
 * Perform the initial damage roll before round 1
 * D20 system: Uses calculateStabilityLoss() and handles Lucid/Surreal triggers
 * This is the SRD's digital enhancement - game starts with some instability
 * @param {number} roll - D20 roll result (1-20)
 */
export function performInitialDamageRoll(roll) {
	logger.debug('[performInitialDamageRoll] D20 Roll:', roll, 'Stability:', gameState.tower);

	// Calculate stability loss using d20 table
	const { loss, gainedLucid, gainedSurreal, optionalGain } = calculateStabilityLoss(roll);

	// Store pending updates (to be applied after dice animation)
	gameState.pendingUpdates.diceRoll = roll;
	gameState.pendingUpdates.towerDamage = loss;

	// Handle Lucid/Surreal state changes from this roll (deferred until after animation)
	if (gainedLucid) {
		gameState.pendingUpdates.isLucid = true;
		logger.debug(`[performInitialDamageRoll] Natural 20! Next roll will be Lucid`);
	} else if (gainedSurreal) {
		gameState.pendingUpdates.isSurreal = true;
		logger.debug(`[performInitialDamageRoll] Natural 1! Next roll will be Surreal`);
	}

	// Handle optional stability gain (auto-apply for now)
	if (optionalGain > 0) {
		gameState.pendingUpdates.towerGain = optionalGain;
	}

	logger.debug(
		`[performInitialDamageRoll] Stored pending roll ${roll}, pending stability loss: ${loss}, optional gain: ${optionalGain}`
	);

	// Note: State transitions will happen in applyPendingInitialDamageRoll after animation
}

/**
 * Apply pending initial damage roll after dice animation completes
 * D20 system: Handles both stability loss and stability gain
 */
export function applyPendingInitialDamageRoll() {
	if (gameState.pendingUpdates.diceRoll === null) {
		logger.warn('[applyPendingInitialDamageRoll] No pending initial damage roll to apply');
		return;
	}

	const roll = gameState.pendingUpdates.diceRoll;
	const stabilityLoss = gameState.pendingUpdates.towerDamage || 0;
	const stabilityGain = gameState.pendingUpdates.towerGain || 0;

	// Apply dice roll
	gameState.diceRoll = roll;

	// Apply stability gain first (if any, from natural 20)
	if (stabilityGain > 0) {
		gameState.tower = Math.min(gameState.tower + stabilityGain, 20); // Cap at 20 Stability
	}

	// Apply stability loss
	gameState.tower = Math.max(gameState.tower - stabilityLoss, 0);

	// Apply pending modifier state changes (after animation)
	if (gameState.pendingUpdates.isLucid !== null) {
		gameState.isLucid = gameState.pendingUpdates.isLucid;
		gameState.pendingUpdates.isLucid = null;
		logger.debug('[applyPendingInitialDamageRoll] Applied pending Lucid state');
	}
	if (gameState.pendingUpdates.isSurreal !== null) {
		gameState.isSurreal = gameState.pendingUpdates.isSurreal;
		gameState.pendingUpdates.isSurreal = null;
		logger.debug('[applyPendingInitialDamageRoll] Applied pending Surreal state');
	}

	// Clear pending updates
	gameState.pendingUpdates.diceRoll = null;
	gameState.pendingUpdates.towerDamage = null;
	gameState.pendingUpdates.towerGain = null;

	logger.debug(
		`[applyPendingInitialDamageRoll] Applied initial stability: loss=${stabilityLoss}, gain=${stabilityGain}, stability now: ${gameState.tower}`
	);

	// Log the initial damage
	gameState.log.push({
		type: 'initial-damage',
		roll,
		damage: stabilityLoss,
		tower: gameState.tower,
		timestamp: Date.now(),
		round: 0,
		id: '0.0'
	});

	// Transition to first round (via startRound screen)
	transitionTo('startRound');
}

/**
 * Perform the final damage roll after all tokens are removed
 * NOTE: This function is for legacy d6 system compatibility only
 * D20 system does not use final damage roll - victory occurs immediately when tokens = 0
 * @param {number} roll - Dice roll result
 * @deprecated D20 system handles victory in applyPendingSuccessCheck()
 */
export function performFinalDamageRoll(roll) {
	logger.debug('[performFinalDamageRoll] Roll:', roll, 'Tower:', gameState.tower);

	// Store pending updates (to be applied after dice animation)
	gameState.pendingUpdates.diceRoll = roll;

	// Calculate damage (D20 system: no bonus modifier)
	const damage = Math.max(roll, 0);
	gameState.pendingUpdates.towerDamage = damage;

	logger.debug(`[performFinalDamageRoll] Stored pending roll ${roll}, pending damage: ${damage}`);

	// Note: State transitions will happen in applyPendingFinalDamageRoll after animation
}

/**
 * Apply pending final damage roll after dice animation completes
 * NOTE: For legacy d6 system compatibility only
 * @deprecated D20 system handles victory in applyPendingSuccessCheck()
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

	logger.debug(
		`[applyPendingFinalDamageRoll] Applied final damage roll: ${roll}, damage: ${damage}, tower now: ${gameState.tower}`
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

	// Auto-save after final damage roll
	saveGame(gameState);
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
	gameState.tower = 20; // D20 system: starts at 20 stability
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

/**
 * Resume a saved game
 * @param {string} gameSlug - Game slug or identifier
 * @returns {Promise<boolean>} Success status
 */
export async function resumeGame(gameSlug) {
	try {
		const saveData = await loadGame(gameSlug);

		if (!saveData) {
			logger.warn(`[resumeGame] No saved game found for ${gameSlug}`);
			return false;
		}

		// Restore the game state
		restoreGameState(gameState, saveData);

		// Safety check: If we're on the recordRound screen and a journal entry already exists,
		// automatically transition to the next round to avoid duplicate journal entry warnings
		if (gameState.state === 'recordRound') {
			const existingEntry = gameState.journalEntries.find(
				(entry) => entry.round === gameState.round
			);
			if (existingEntry) {
				logger.info(
					`[resumeGame] Journal entry already exists for round ${gameState.round}, transitioning to next round`
				);
				if (!gameState.gameOver) {
					startRound();
				}
			}
		}

		logger.info(`[resumeGame] Game resumed successfully for ${gameSlug}`);
		return true;
	} catch (error) {
		logger.error('[resumeGame] Failed to resume game:', error);
		return false;
	}
}

/**
 * Delete saved game
 * @param {string} gameSlug - Game slug or identifier
 * @returns {boolean} Success status
 */
export function deleteSavedGame(gameSlug) {
	return clearSave(gameSlug);
}
