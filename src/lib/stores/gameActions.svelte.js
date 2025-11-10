/**
 * Game actions using Svelte 5 runes
 * All game logic and state mutations
 */
import { gameState, transitionTo } from './gameStore.svelte.js';
import { transitionState, setTransitioning } from './transitionStore.svelte.js';
import { ConfigurationLoader } from '../configuration/ConfigurationLoader.js';

// Create a single instance of the configuration loader
const configLoader = new ConfigurationLoader();

/**
 * Helper for animation timing
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Shuffle array helper
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
function shuffle(array) {
	let currentIndex = array.length,
		temporaryValue,
		randomIndex;

	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

/**
 * Transition to screen with animation
 * Prevents race conditions via isTransitioning flag
 * @param {string|null} newState - Target state (null uses current state)
 * @param {'default' | 'round' | 'journal'} animationType - Type of animation
 * @returns {Promise<void>}
 */
export async function transitionToScreen(newState = null, animationType = 'default') {
	// Prevent concurrent transitions
	if (transitionState.isTransitioning) {
		console.warn('Transition already in progress, ignoring');
		return;
	}

	setTransitioning(true);

	try {
		// Check if we're in a browser environment (not in tests)
		const hasDom = typeof document !== 'undefined';

		// Exit animation
		if (hasDom) {
			const currentScreenEl = document.querySelector('.dc-screen-container');
			if (currentScreenEl) {
				currentScreenEl.classList.add('screen-transition-out');
				await sleep(300);
			}
		}

		// Update state (validated) only if newState is provided
		if (newState && newState !== gameState.state) {
			transitionTo(newState);
		}

		// Wait for render
		await sleep(50);

		// Enter animation
		if (hasDom) {
			const newScreenEl = document.querySelector('.dc-screen-container');
			if (newScreenEl) {
				newScreenEl.classList.remove('screen-transition-out');

				const animClass =
					{
						round: 'round-transition',
						journal: 'journal-transition',
						default: 'screen-transition-in'
					}[animationType] || 'screen-transition-in';

				newScreenEl.classList.add(animClass);

				const duration = animationType === 'round' ? 800 : animationType === 'journal' ? 1200 : 500;

				setTimeout(() => newScreenEl.classList.remove(animClass), duration);
			}
		}
	} finally {
		setTransitioning(false);
	}
}

/**
 * Legacy nextScreen function for compatibility
 * @param {string|null} action - State to transition to
 */
export const nextScreen = (action) => {
	if (action) {
		transitionTo(action);
	}
};

/**
 * Load system configuration
 * @param {object} systemConfig - System configuration
 * @param {string} systemConfig.gameConfigUrl - URL to game config
 * @returns {Promise<void>}
 */
export const loadSystemConfig = async (systemConfig) => {
	if (!systemConfig || !systemConfig.gameConfigUrl) {
		throw new Error('Must provide a valid game configuration and URL');
	}

	await configLoader.loadSystemSettings(systemConfig);
	const gameConfig = await configLoader.loadGameSettings(systemConfig.gameConfigUrl);

	gameState.config = gameConfig;
	gameState.stylesheet = gameConfig.stylesheet;
	gameState.systemConfig = systemConfig;

	transitionTo('options');
	await transitionToScreen();
};

/**
 * Start a new game
 * @param {object} player - Player object with name
 * @param {object} options - Game options
 */
export const startGame = (player, options = {}) => {
	if (!player || !player.name) {
		throw new Error('Must provide a valid player');
	}

	const gameConfig = configLoader.loadUserSettings(options);

	// Reset game state
	gameState.config = gameConfig;
	gameState.round = 1;
	gameState.player = player;
	gameState.playerName = player.name;
	gameState.tokens = 10;
	gameState.kingsRevealed = 0;
	gameState.kingOfHearts = false;
	gameState.kingOfDiamonds = false;
	gameState.kingOfClubs = false;
	gameState.kingOfSpades = false;
	gameState.aceOfHeartsRevealed = false;
	gameState.gameOver = false;
	gameState.win = false;
	gameState.tower = 54;
	gameState.bonus = 0;
	gameState.log = [];
	gameState.journalEntries = [];
	gameState.cardsToDraw = 0;
	gameState.currentCard = null;
	gameState.diceRoll = 0;

	// Set up deck
	gameState.deck = [...gameConfig.deck];

	if (gameConfig.options.difficulty === 0) {
		gameState.aceOfHeartsRevealed = true;
		gameState.deck = gameState.deck.filter((c) => !(c.card === 'A' && c.suit === 'hearts'));
	}

	gameState.deck = shuffle(gameState.deck);

	transitionTo('intro');
	nextScreen();
};

/**
 * Start a new round with page-turn animation
 * @returns {Promise<void>}
 */
export const startRound = async () => {
	console.log('[startRound] Called, current state:', gameState.state);

	gameState.round += 1;

	// First transition to startRound state with page-turn animation
	await transitionToScreen('startRound', 'round');
	await sleep(100); // Small delay for visual feedback

	// Then transition to rollForTasks
	await transitionToScreen('rollForTasks', 'default');

	console.log('[startRound] Completed, new state:', gameState.state);
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

	console.log(`[rollForTasks] Dice rolled: ${roll}, setting cardsToDraw to ${roll}`);
	return roll;
}

/**
 * Confirm task roll and proceed
 * @returns {Promise<void>}
 */
export async function confirmTaskRoll() {
	console.log('[confirmTaskRoll] Called');
	transitionTo('drawCard');
	await transitionToScreen();
	console.log('[confirmTaskRoll] Completed');
}

/**
 * Draw a card from the deck
 * @returns {void}
 */
export async function drawCard() {
	console.log('[drawCard] Function called');
	console.log(`[drawCard] BEFORE: cardsToDraw=${gameState.cardsToDraw}, state=${gameState.state}`);

	if (gameState.deck.length === 0) {
		gameState.gameOver = true;
		transitionTo('gameOver');
		await transitionToScreen();
		return null;
	}

	const card = gameState.deck.pop();
	gameState.currentCard = card;
	gameState.cardsToDraw -= 1;

	console.log(
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
 * @returns {Promise<void>}
 */
export async function confirmCard() {
	console.log('[confirmCard] Called');
	console.log(
		`[confirmCard] Current state: ${gameState.state}, cardsToDraw: ${gameState.cardsToDraw}`
	);

	const card = gameState.currentCard;
	
	// Clear the current card
	gameState.currentCard = null;

	// Determine next state based on the card that was just confirmed
	if (card) {
		const isOdd = card.card !== 'A' && parseInt(card.card) % 2 !== 0;

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
	
	await transitionToScreen();
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
/**
 * Apply failure check result and update health
 * @param {number} result - Dice roll result
 */
export async function applyFailureCheckResult(result) {
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
	
	// Trigger screen transition after state change
	await transitionToScreen();
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
 * @returns {Promise<void>}
 */
export async function confirmFailureCheck() {
	await transitionToScreen();
}

/**
 * Record round in journal
 * @param {object} journalEntry - Journal entry
 * @param {string} journalEntry.text - Entry text
 * @returns {Promise<void>}
 */
export async function recordRound(journalEntry) {
	if (journalEntry == null || journalEntry.text == null) {
		throw new Error('No journal entries provided for this round');
	}

	journalEntry.id = gameState.round;
	journalEntry.round = gameState.round;
	journalEntry.dateRecorded = journalEntry.dateRecorded || new Date().toISOString();
	gameState.journalEntries.push(journalEntry);

	let nextAction = null;
	if (!gameState.gameOver) {
		if (gameState.aceOfHeartsRevealed) {
			nextAction = 'successCheck';
		} else {
			nextAction = 'startRound';
		}
	}

	// Apply transition if not game over
	if (nextAction) {
		const transitionType = nextAction === 'startRound' ? 'round' : 'default';
		await transitionToScreen(nextAction, transitionType);
	}
}

/**
 * Perform success check
 * @returns {Promise<number>} Dice roll result
 */
export async function successCheck() {
	const roll = gameState.getRandomNumber();
	gameState.diceRoll = roll;

	if (roll === 6 || (gameState.config.difficulty > 0 && roll + gameState.bonus === 6)) {
		gameState.tokens -= 1;
	}

	if (gameState.tokens === 0) {
		gameState.win = true;
		gameState.status = gameState.config.labels?.successCheckWin ?? 'Salvation has arrived';
		gameState.gameOver = true;
		transitionTo('gameOver');
	} else {
		transitionTo('startRound');
	}

	return roll;
}

/**
 * Confirm success check and proceed
 * @returns {Promise<void>}
 */
export async function confirmSuccessCheck() {
	await transitionToScreen();
}

/**
 * Restart the game
 */
export function restartGame() {
	startGame(gameState.player, gameState.config.options);
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

	nextScreen('exitGame');
}

// Export configLoader for components that need it
export { configLoader as services };
