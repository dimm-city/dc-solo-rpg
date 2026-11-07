/**
 * Game actions using Svelte 5 runes
 * All game logic and state mutations
 */
import { gameState, transitionTo, createRunState } from './gameStore.svelte.js';
import { initializeGame } from './gameInit.js';
import { logger } from '../utils/logger.js';
import { randomInt } from '../services/random.js';
import { saveGame, loadGame, clearSave, restoreGameState } from './indexedDBStorage.js';
import {
	convertD20ToCardCount,
	calculateStabilityLoss,
	getSalvationThreshold,
	calculateSalvationResult,
	calculateAutomaticSalvation
} from '../services/d20Mechanics.js';
import { isHardGame, fourthAceWins } from '../constants/difficulty.js';

// Re-export D20 mechanics for backwards compatibility
export {
	convertD20ToCardCount,
	calculateStabilityLoss,
	getSalvationThreshold,
	calculateSalvationResult,
	calculateAutomaticSalvation
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
 * Start a new round of gameplay
 *
 * Increments the round counter and opens the round on the Roll for Tasks screen
 * (titled "Round N"), where the player rolls d20 to determine how many cards to draw.
 *
 * @see {applyPendingTaskRoll} - Called after task roll animation completes
 */
export const startRound = () => {
	logger.debug('[startRound] Called, current state:', gameState.state);

	gameState.round += 1;
	openRound();

	logger.debug('[startRound] Completed, new state:', gameState.state);
};

/** Clear last round's deal and open the Roll for Tasks screen */
function openRound() {
	gameState.taskRoll = null;
	gameState.lastCard = null;
	transitionTo('rollForTasks');
}

/** A new roll starts: forget any modifier an earlier, unapplied roll left pending */
function clearPendingModifier() {
	gameState.pendingUpdates.isLucid = null;
	gameState.pendingUpdates.isSurreal = null;
}

/**
 * Natural 20 → Lucid, natural 1 → Surreal, on every d20 roll. Deferred until the dice
 * have landed, then applied here. The two states never stack: gaining one clears the other.
 */
function queueModifierFromRoll(roll) {
	clearPendingModifier();
	if (roll === 20) gameState.pendingUpdates.isLucid = true;
	else if (roll === 1) gameState.pendingUpdates.isSurreal = true;
}

/** Apply the modifier the last roll earned (see queueModifierFromRoll) */
function applyPendingModifier() {
	const { isLucid, isSurreal } = gameState.pendingUpdates;
	if (isLucid) {
		gameState.isLucid = true;
		gameState.isSurreal = false;
	} else if (isSurreal) {
		gameState.isSurreal = true;
		gameState.isLucid = false;
	}
	clearPendingModifier();
}

/**
 * Roll for number of tasks (cards to draw)
 * D20 system: Roll d20, convert to 1-6 cards, handle Lucid/Surreal states
 * @returns {Promise<{roll: number, wasLucid: boolean, wasSurreal: boolean}>} Roll result and modifier flags
 */
/**
 * Roll for tasks - determines number of cards to draw this round
 *
 * Rolls D20 with Lucid/Surreal modifiers and converts to card count (1-6).
 * Also handles granting Lucid/Surreal states for natural 20/1.
 *
 * @returns {Object} Roll results and card count
 * @returns {number} roll - D20 roll result (1-20)
 * @returns {number} cardCount - Number of cards to draw (1-6)
 * @returns {boolean} wasLucid - True if Lucid state was active
 * @returns {boolean} wasSurreal - True if Surreal state was active
 * @returns {boolean} gainedLucid - True if natural 20 (grants Lucid)
 * @returns {boolean} gainedSurreal - True if natural 1 (grants Surreal)
 *
 * @example
 * // Test roll for tasks
 * gameState.isLucid = true;
 * const { roll, cardCount, wasLucid } = rollForTasks();
 * expect(wasLucid).toBe(true); // Lucid was consumed
 */
export async function rollForTasks() {
	// Roll d20 with Lucid/Surreal modifiers
	const { roll, dice, wasLucid, wasSurreal } = gameState.rollWithModifiers();

	// Convert d20 result to card count (1-6)
	const cardCount = convertD20ToCardCount(roll);

	gameState.cardsToDraw = cardCount;
	// Defer diceRoll update until after animation (store actual d20 roll)
	gameState.pendingUpdates.diceRoll = roll;
	gameState.currentCard = null;
	pendingTaskDice = dice;

	// Track if this roll grants Lucid/Surreal for next roll (applied after the animation)
	const gainedLucid = roll === 20;
	const gainedSurreal = roll === 1;
	queueModifierFromRoll(roll);

	logger.debug(
		`[rollForTasks] D20 rolled: ${roll} (${wasLucid ? 'LUCID' : wasSurreal ? 'SURREAL' : 'normal'}) → ${cardCount} cards`
	);

	return {
		roll,
		dice,
		cardCount,
		wasLucid,
		wasSurreal,
		gainedLucid,
		gainedSurreal
	};
}

/** Dice thrown by the last task roll, kept until its result is applied */
let pendingTaskDice = null;

/**
 * Apply pending dice roll for rollForTasks (after animation completes).
 * Records the round's deal in gameState.taskRoll ({ roll, dice, cards }) for the card overlay.
 */
export function applyPendingTaskRoll() {
	if (gameState.pendingUpdates.diceRoll !== null) {
		const roll = gameState.pendingUpdates.diceRoll;
		gameState.diceRoll = roll;
		gameState.taskRoll = { roll, dice: pendingTaskDice ?? [roll], cards: gameState.cardsToDraw };
		gameState.pendingUpdates.diceRoll = null;
		pendingTaskDice = null;
		logger.debug('[applyPendingTaskRoll] Applied pending task roll');
	}

	// Apply pending modifier state changes (after animation)
	applyPendingModifier();
}

/**
 * Confirm task roll and proceed to card drawing
 *
 * Transitions from roll-for-tasks screen to drawCard state after player
 * acknowledges the dice roll result.
 *
 * @see {applyPendingTaskRoll} - Should be called before this to apply roll
 * @see {drawCard} - Next state after confirmation
 */
export function confirmTaskRoll() {
	logger.debug('[confirmTaskRoll] Called');
	transitionTo('drawCard');
	logger.debug('[confirmTaskRoll] Completed');
}

/**
 * Draw a card from the deck and set up pending state changes
 *
 * Core game loop function. Draws next card, decrements cardsToDraw counter,
 * adds to game log, and stores pending updates for Aces/Kings. The card is
 * displayed to the player, then confirmCard() applies the pending updates.
 *
 * Special Card Handling:
 * - Ace of Hearts: Sets aceOfHeartsRevealed (unlocks Salvation checks)
 * - Other Aces: Increments acesRevealed counter (improves Salvation threshold)
 * - Kings: Tracks which suit revealed, checks for 4 Kings (instant loss)
 *
 * Pending Updates Pattern:
 * - Sets pendingUpdates.aceChange, kingsChange, gameOverCondition
 * - Actual stat changes happen in confirmCard() after player dismisses card
 * - Ensures card is visible before game state changes
 *
 * Game Over Conditions:
 * - Deck empty → game over (loss)
 * - 4 Kings revealed → pending game over (applied in confirmCard)
 *
 * @returns {object|null} The drawn card object, or null if deck is empty
 *
 * @see {confirmCard} - Applies pending updates when card is dismissed
 * @see {startRound} - Calls this to begin round's card draws
 *
 * @example
 * // Standard card draw flow
 * const card = drawCard(); // Draws card, sets pendingUpdates
 * // ... player reads card ...
 * confirmCard(); // Applies pending updates and transitions
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

/** Per Wretched & Alone SRD: A, 3, 5, 7, 9 are odd-ranked and trigger a Stability check */
const ODD_RANKS = ['A', '3', '5', '7', '9'];

/**
 * On Easy the fourth Ace ends the game (fourthAceWins). Being odd, it calls for a Stability
 * check like any Ace, and that check is the last roll of the game: survive it and the game is
 * won, whatever tokens remain; lose the last Stability to it and the game is lost. No such
 * state outlives that check, so on the Stability check screen the Aces count alone says it is
 * the final one. On Normal and Hard the fourth Ace ends nothing: Salvation goes on, as a
 * Stability check per token (see getSalvationCheckRoll).
 * @returns {boolean}
 */
export function isFinalStabilityCheck() {
	return gameState.acesRevealed >= 4 && fourthAceWins(gameState);
}

/** The game is won: the status line is the author's win message */
function winGame() {
	gameState.win = true;
	gameState.gameOver = true;
	gameState.status =
		gameState.config.labels?.successCheckWin ?? 'Victory! Against all odds, you escaped.';
}

const cap = (word) => word.charAt(0).toUpperCase() + word.slice(1);

/**
 * return-king modifier: put the first revealed King (hearts, diamonds, clubs, spades order)
 * back into the deck at a random position so it can be drawn again.
 * @param {Object} card - The Narrative card carrying the modifier (annotated with the outcome)
 */
function returnKingToDeck(card) {
	const suit = ['hearts', 'diamonds', 'clubs', 'spades'].find((s) => gameState[`kingOf${cap(s)}`]);
	if (!suit) {
		card.modifierResult = 'No King to return';
		gameState.status = card.modifierResult;
		return;
	}

	// Reinsert a fresh copy of the King (the log keeps its own entry, with id/round/gameState)
	const logged = gameState.log.find((l) => l.card === 'K' && l.suit === suit);
	const { id, round, gameState: snapshot, ...king } = logged ?? { card: 'K', suit };
	gameState.deck.splice(randomInt(0, gameState.deck.length), 0, king);

	gameState.kingsRevealed -= 1;
	gameState[`kingOf${cap(suit)}`] = false;
	card.modifierResult = `King of ${cap(suit)} returns to the deck · ${gameState.kingsRevealed} of 4`;
	gameState.status = card.modifierResult;
}

/**
 * Confirm drawn card and apply pending updates
 *
 * Called when player dismisses the card. Applies pending stat changes (Aces, Kings),
 * checks for game over conditions, and transitions to the next appropriate state.
 *
 * Flow:
 * 1. Apply pending Ace changes (increments acesRevealed for Salvation threshold)
 * 2. Apply pending King changes (tracks which Kings revealed for game over)
 * 3. Check for game over conditions (4 Kings = instant loss; on Easy a fourth Ace that skips
 *    its Stability check = instant win, see isFinalStabilityCheck)
 * 4. Determine next state:
 *    - Odd rank (A,3,5,7,9) → failureCheck (on Easy the fourth Ace's check decides the game)
 *    - More cards to draw → drawCard
 *    - Ace of Hearts revealed + tokens > 0 → successCheck
 *    - Otherwise → log (journal entry)
 *
 * @see {drawCard} - Draws the card that gets confirmed here
 * @see {getFailureCheckRoll} - Called next for odd-ranked cards
 * @see {successCheck} - Called if Salvation is available
 *
 * @example
 * // Standard flow after drawing a card
 * drawCard(); // Draws card and sets pendingUpdates
 * // ... player reads card ...
 * confirmCard(); // Applies updates and transitions to next state
 */
export function confirmCard() {
	logger.debug('[confirmCard] Called');
	logger.debug(
		`[confirmCard] Current state: ${gameState.state}, cardsToDraw: ${gameState.cardsToDraw}`
	);

	const card = gameState.currentCard;
	// Kept after the card leaves the screen: the Stability check it causes names it
	if (card) gameState.lastCard = card;

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

	// return-king modifier: shuffle a revealed King back into the deck (no effect if none revealed)
	if (card?.modifier === 'return-king') {
		returnKingToDeck(card);
	}
	// skip-damage modifier: an odd card that skips its own Stability check says so
	if (card?.modifier === 'skip-damage' && ODD_RANKS.includes(card.card)) {
		card.modifierResult = 'No Stability check this time';
		gameState.status = card.modifierResult;
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

	// On Easy the fourth Ace ends the game. Its Stability check decides it (applyPendingDiceRoll);
	// a fourth Ace that skips its check, as skip-damage promises, frees the player outright.
	if (card?.card === 'A' && card.modifier === 'skip-damage' && isFinalStabilityCheck()) {
		winGame();
		logger.info('[confirmCard] VICTORY - the fourth Ace, with no Stability check to survive');
		transitionTo('gameOver');
		saveGame(gameState);
		return;
	}

	// Clear the current card
	gameState.currentCard = null;

	// Determine next state based on the card that was just confirmed
	if (card) {
		// Per Wretched & Alone SRD: A, 3, 5, 7, 9 are odd-ranked and trigger damage
		const isOdd = ODD_RANKS.includes(card.card);

		// skip-damage modifier: this card skips its own failure check
		if (isOdd && card.modifier !== 'skip-damage') {
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
/**
 * Get failure check roll and stability calculations (test-friendly version)
 *
 * Performs a failure check roll and returns all calculated values including
 * stability loss/gain and state changes. This function is designed for testing -
 * it returns detailed results without requiring inspection of pending state.
 *
 * Note: Does NOT set pending state or apply changes. Use applyFailureCheckResult()
 * for that.
 *
 * @returns {Object} Roll results and calculations
 * @returns {number} roll - D20 roll result (1-20)
 * @returns {boolean} wasLucid - True if Lucid state was active
 * @returns {boolean} wasSurreal - True if Surreal state was active
 * @returns {number} stabilityLoss - Stability points to lose
 * @returns {number} stabilityGain - Stability points to gain (0 or 1)
 * @returns {boolean} lucidGained - True if natural 20 (grants Lucid)
 * @returns {boolean} surrealGained - True if natural 1 (grants Surreal)
 *
 * @example
 * // Test failure check mechanics
 * gameState.currentCard = { rank: 7 };
 * const { roll, stabilityLoss } = getFailureCheckRoll();
 */
export function getFailureCheckRoll() {
	// Roll d20 with Lucid/Surreal modifiers
	const { roll, dice, wasLucid, wasSurreal } = gameState.rollWithModifiers();

	// Calculate stability loss/gain using D20 table
	const { loss, gainedLucid, gainedSurreal, optionalGain } = calculateStabilityLoss(roll);

	logger.debug(
		`[getFailureCheckRoll] D20 roll: ${roll} (${wasLucid ? 'LUCID' : wasSurreal ? 'SURREAL' : 'normal'}), loss: ${loss}, gain: ${optionalGain || 0}`
	);

	return {
		roll,
		dice,
		wasLucid,
		wasSurreal,
		stabilityLoss: loss,
		stabilityGain: optionalGain || 0,
		lucidGained: gainedLucid,
		surrealGained: gainedSurreal
	};
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
	const { loss, optionalGain } = calculateStabilityLoss(result);

	gameState.pendingUpdates.towerDamage = loss;
	// Natural 20 → Lucid, natural 1 → Surreal (deferred until after animation)
	queueModifierFromRoll(result);
	// Natural 20 also restores 1 Stability (auto-applied)
	gameState.pendingUpdates.towerGain = optionalGain > 0 ? optionalGain : null;

	logger.debug(
		`[applyFailureCheckResult] Stored pending dice roll ${result}, pending stability loss ${loss}, optional gain ${optionalGain}`
	);

	// Note: We don't transition state here anymore
	// The caller should call applyPendingDiceRoll() after the dice animation completes
}

/**
 * Apply pending dice roll updates after dice animation completes
 *
 * Applies stability changes, modifier states (Lucid/Surreal), and checks for game over.
 * Must be called AFTER dice animation to ensure visual consistency.
 *
 * D20 System Mechanics:
 * - Stability Gain: Natural 20 grants +1 Stability (max 20) + Lucid state
 * - Stability Loss: Based on roll ranges (1=3, 2-5=2, 6-10=1, 11+=0)
 * - Lucid State: Advantage on next roll (2d20 keep high)
 * - Surreal State: Disadvantage on next roll (2d20 keep low)
 * - Game Over: Stability ≤ 0 triggers instant loss
 * - The fourth Ace's check on Easy (isFinalStabilityCheck): Stability holds → the game is won
 *
 * State Flow:
 * 1. Apply pending dice roll to gameState.diceRoll
 * 2. Update last log entry with roll and damage
 * 3. Apply stability gain (if natural 20)
 * 4. Apply stability loss (if any)
 * 5. Check for stability collapse (game over), or (Easy) the win on the fourth Ace's check
 * 6. Apply Lucid/Surreal states
 * 7. Transition to next state or success check
 * 8. Auto-save game state
 *
 * @throws {Error} Logs warning if no pending dice roll exists
 *
 * @see {getFailureCheckRoll} - Creates the pending dice roll
 * @see {calculateStabilityLoss} - Determines stability loss from roll
 * @see {applyPendingSuccessCheck} - Similar pattern for success checks
 *
 * @example
 * // Standard failure check flow
 * const roll = getFailureCheckRoll(); // Sets pendingUpdates.diceRoll
 * await animateDiceRoll(roll); // Show 3D dice animation
 * applyPendingDiceRoll(); // Apply after animation completes
 */
export function applyPendingDiceRoll({ advance = true } = {}) {
	if (gameState.pendingUpdates.diceRoll === null) {
		logger.warn('[applyPendingDiceRoll] No pending dice roll to apply');
		return;
	}

	const result = gameState.pendingUpdates.diceRoll;
	const stabilityLoss = gameState.pendingUpdates.towerDamage || 0;

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

	// Apply the Stability gain (natural 20) and loss; at 0 the game is lost
	applyPendingStability();

	// On Easy the fourth Ace's check is the last roll of the game: Stability held, so it is won
	if (!gameState.gameOver && isFinalStabilityCheck()) {
		winGame();
		logger.info("[applyPendingDiceRoll] VICTORY - the fourth Ace's Stability check held");
	}

	// Apply pending modifier state changes (after animation)
	applyPendingModifier();

	// Clear pending updates
	gameState.pendingUpdates.diceRoll = null;

	if (advance) {
		advanceAfterFailureCheck();
	}
}

/**
 * Apply a Stability check's pending result: the gain first (natural 20, capped at 20 Stability),
 * then the loss. Stability at 0 ends the game. Shared by the Stability check and the four-Aces
 * Salvation (Normal and Hard), whose token only comes off if Stability holds.
 */
function applyPendingStability() {
	const loss = gameState.pendingUpdates.towerDamage || 0;
	const gain = gameState.pendingUpdates.towerGain || 0;

	if (gain > 0) {
		gameState.tower = Math.min(gameState.tower + gain, 20);
	}
	if (loss > 0) {
		gameState.tower -= loss;
	}
	gameState.pendingUpdates.towerDamage = null;
	gameState.pendingUpdates.towerGain = null;
	logger.debug(
		`[applyPendingStability] +${gain} -${loss}, Stability now at ${Math.max(0, gameState.tower)}`
	);

	// Stability collapse
	if (gameState.tower <= 0) {
		gameState.tower = 0;
		gameState.status =
			gameState.config.labels?.failureCheckLoss ?? 'Stability collapsed completely';
		gameState.gameOver = true;
	}
}

/**
 * Leave the Stability check screen once the player has seen the result
 *
 * Counterpart to applyPendingDiceRoll({ advance: false }): the state was already
 * updated (so the HUD shows it), this only moves to the next screen and saves.
 */
export function advanceAfterFailureCheck() {
	if (gameState.gameOver) {
		transitionTo('gameOver');
	} else if (gameState.cardsToDraw > 0) {
		transitionTo('drawCard');
	} else if (gameState.aceOfHeartsRevealed && gameState.tokens > 0) {
		// All cards drawn - check for success check first, then journal
		transitionTo('successCheck');
	} else {
		transitionTo('log');
	}

	// Auto-save after applying damage
	saveGame(gameState);
}

/**
 * Legacy failure check (kept for compatibility)
 * @deprecated Use getFailureCheckRoll + applyFailureCheckResult
 * @returns {Promise<Object>} Roll result from getFailureCheckRoll() ({ roll, wasLucid, ... })
 */
export async function failureCheck() {
	const result = getFailureCheckRoll();
	applyFailureCheckResult(result.roll);
	return result;
}

/**
 * Record round in journal. After the ending this records the final log: the last round's
 * second entry, marked `final` so the story can tell it from the round's own entry.
 * @param {object} journalEntry - Journal entry
 * @param {string} [journalEntry.text] - Entry text (optional)
 * @param {string} [journalEntry.audioData] - Base64 encoded audio data (optional)
 */
export async function recordRound(journalEntry) {
	if (journalEntry == null) {
		throw new Error('Journal entry object is required');
	}

	const isFinal = gameState.gameOver;

	// Check if a journal entry already exists for this round
	const existingEntry = gameState.journalEntries.find(
		(entry) => entry.round === gameState.round && !!entry.final === isFinal
	);
	if (existingEntry) {
		logger.warn(
			`[recordRound] WARNING: Journal entry already exists for round ${gameState.round}. Preventing duplicate.`,
			{
				existingEntry,
				attemptedEntry: journalEntry
			}
		);
		logger.warn(
			`[recordRound] WARNING: Cannot save journal entry - an entry already exists for round ${gameState.round}. Each round can only have one journal entry.`
		);
		return; // Prevent duplicate
	}

	// Create a new object to avoid mutating the passed reference
	const newEntry = {
		round: gameState.round,
		...(isFinal && { final: true }),
		text: journalEntry.text || '',
		audioData: journalEntry.audioData || null,
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- timestamp string only, not reactive state
		dateRecorded: journalEntry.dateRecorded || new Date().toISOString()
	};

	gameState.journalEntries.push(newEntry);
	logger.debug(`[recordRound] Saved journal for round ${gameState.round}:`, {
		round: newEntry.round,
		final: isFinal,
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
/**
 * Get Salvation check roll and calculations (test-friendly version)
 *
 * Performs a Salvation (success) check roll and returns all calculated values.
 * This function is designed for testing - it returns detailed results without
 * requiring inspection of pending state.
 *
 * Also sets pending state so applyPendingSuccessCheck() can be called after
 * dice animation.
 *
 * @returns {Object} Roll results and calculations
 * @returns {number} roll - D20 roll result (1-20)
 * @returns {number} threshold - Success threshold based on Aces revealed
 * @returns {number} tokenChange - Token change (-2, -1 or 0; a miss adds +1 or +2 on Hard)
 * @returns {boolean} wasLucid - True if Lucid state was active
 * @returns {boolean} wasSurreal - True if Surreal state was active
 * @returns {boolean} gainedLucid - True if natural 20 (grants Lucid)
 * @returns {boolean} gainedSurreal - True if natural 1 (grants Surreal)
 *
 * @example
 * // Test Salvation mechanics
 * gameState.acesRevealed = 3; // 50% success rate
 * const { roll, threshold, tokenChange } = getSalvationCheckRoll();
 * expect(threshold).toBe(11); // 3 Aces = threshold 11
 */
/**
 * The roll Salvation needs right now. Salvation only opens with the Ace of Hearts, which
 * counts as the first Ace, so the button and the roll always agree on one threshold.
 * @returns {number} 17, 14 or 11, or 0 when there is no target (four Aces on Normal and Hard;
 *   on Easy the fourth Ace ends the game first)
 */
export function getCurrentSalvationThreshold() {
	return getSalvationThreshold(Math.max(1, gameState.acesRevealed));
}

export function getSalvationCheckRoll() {
	// Get threshold based on Aces revealed
	const threshold = getCurrentSalvationThreshold();

	// Roll d20 with Lucid/Surreal modifiers
	const { roll, dice, wasLucid, wasSurreal } = gameState.rollWithModifiers();

	// Four Aces (Normal and Hard): no target to beat, but the token only comes off after one
	// Stability check. The roll is read on the Stability table; at 0 Stability the game is lost.
	if (threshold === 0) {
		const outcome = calculateAutomaticSalvation(roll, gameState.tower);
		gameState.pendingUpdates.diceRoll = roll;
		gameState.pendingUpdates.towerDamage = outcome.stabilityLoss;
		gameState.pendingUpdates.towerGain = outcome.stabilityGain > 0 ? outcome.stabilityGain : null;
		gameState.pendingUpdates.tokenChange = outcome.tokenChange;
		queueModifierFromRoll(roll);
		logger.debug(
			`[getSalvationCheckRoll] Four Aces: Stability check ${roll}, Stability ${gameState.tower} -> ${outcome.stabilityAfter}, token change ${outcome.tokenChange}`
		);
		return {
			roll,
			dice,
			threshold,
			tokenChange: outcome.tokenChange,
			automatic: true,
			stabilityLoss: outcome.stabilityLoss,
			stabilityGain: outcome.stabilityGain,
			wasLucid,
			wasSurreal,
			gainedLucid: outcome.gainedLucid,
			gainedSurreal: outcome.gainedSurreal
		};
	}

	// Calculate token change using salvation table (a miss adds tokens on Hard only)
	const { tokenChange, gainedLucid, gainedSurreal } = calculateSalvationResult(roll, threshold, {
		hard: isHardGame(gameState)
	});

	// Store pending updates (to be applied after dice animation)
	gameState.pendingUpdates.diceRoll = roll;
	gameState.pendingUpdates.tokenChange = tokenChange;
	// Natural 20 → Lucid, natural 1 → Surreal (deferred until after animation)
	queueModifierFromRoll(roll);

	logger.debug(
		`[getSalvationCheckRoll] D20 roll: ${roll} (${wasLucid ? 'LUCID' : wasSurreal ? 'SURREAL' : 'normal'}), threshold: ${threshold}, token change: ${tokenChange}`
	);

	return {
		roll,
		dice,
		threshold,
		tokenChange,
		automatic: false,
		wasLucid,
		wasSurreal,
		gainedLucid,
		gainedSurreal
	};
}

/**
 * Roll the Salvation check and save, so a reload mid-roll resumes on this roll's result
 * (the pending result is saved and shown on resume) rather than offering a free re-roll.
 * @returns {ReturnType<typeof getSalvationCheckRoll>}
 */
export function successCheck() {
	const result = getSalvationCheckRoll();
	saveGame(gameState);
	return result;
}

/**
 * Apply pending Salvation check updates after dice animation completes
 *
 * Applies token changes based on success/failure, handles Lucid/Surreal states,
 * and checks for victory condition. Must be called AFTER dice animation.
 *
 * D20 System:
 * - Critical Success (Natural 20): -2 tokens + Lucid state
 * - Success (≥ threshold): -1 token
 * - Miss (below threshold): no change on Normal, +1 token on Hard
 * - Natural 1: Surreal state; no change on Normal, +2 tokens on Hard
 * - Four Aces (Hard only, no threshold): the roll is a Stability check; -1 token if Stability
 *   holds, otherwise the game is lost by Stability
 *
 * Victory Condition:
 * - Tokens reach 0 → Instant victory (game over, win = true)
 *
 * State Flow:
 * 1. Apply pending dice roll
 * 2. Four Aces: apply the Stability gain or loss (Stability at 0 ends the game)
 * 3. Apply token change (-2 to +2), floored at 0
 * 4. Apply Lucid/Surreal states
 * 5. Check for victory (tokens = 0)
 * 6. Transition to game over or journal entry
 *
 * @throws {Error} Logs warning if no pending success check exists
 *
 * @see {successCheck} - Creates the pending success check
 * @see {calculateSalvationResult} - Determines token changes
 * @see {applyPendingDiceRoll} - Similar pattern for failure checks
 *
 * @example
 * // Standard Salvation flow
 * const result = successCheck(); // Sets pendingUpdates
 * await animateDiceRoll(result.roll); // Show 3D dice animation
 * applyPendingSuccessCheck(); // Apply after animation completes
 */
export function applyPendingSuccessCheck({ advance = true } = {}) {
	if (gameState.pendingUpdates.diceRoll === null && gameState.pendingUpdates.tokenChange === null) {
		logger.warn('[applyPendingSuccessCheck] No pending success check to apply');
		return;
	}

	// Apply dice roll
	if (gameState.pendingUpdates.diceRoll !== null) {
		gameState.diceRoll = gameState.pendingUpdates.diceRoll;
	}
	const before = { tower: gameState.tower, tokens: gameState.tokens };

	// Four Aces (Hard): the Stability check comes first. If it takes the last Stability, the game
	// is lost and the token stays (its pending change is 0).
	if (
		gameState.pendingUpdates.towerDamage !== null ||
		gameState.pendingUpdates.towerGain !== null
	) {
		applyPendingStability();
	}

	// Apply token change (a miss on Normal is 0: nothing changes)
	if (!gameState.gameOver && gameState.pendingUpdates.tokenChange) {
		gameState.tokens += gameState.pendingUpdates.tokenChange;

		// Ensure tokens don't go below 0
		gameState.tokens = Math.max(gameState.tokens, 0);
	}

	// Apply pending modifier state changes (after animation)
	applyPendingModifier();

	// Clear pending updates
	gameState.pendingUpdates.diceRoll = null;
	gameState.pendingUpdates.tokenChange = null;

	logger.debug(
		'[applyPendingSuccessCheck] Applied pending success check, tokens now:',
		gameState.tokens
	);

	// Log the roll and what it did (cards log themselves when drawn): the final log's timeline
	// reads it. Every reader of the log picks cards by their `card` field, so a roll entry is
	// passed over wherever cards are listed.
	gameState.log.push({
		type: 'salvation',
		id: `${gameState.round}.salvation`,
		round: gameState.round,
		roll: gameState.diceRoll,
		threshold: getCurrentSalvationThreshold(),
		tokenChange: gameState.tokens - before.tokens,
		tokens: gameState.tokens,
		stabilityChange: gameState.tower - before.tower,
		tower: gameState.tower,
		timestamp: Date.now()
	});

	if (gameState.tokens === 0 && !gameState.gameOver) {
		// D20 System: Victory when tokens reach 0 (no final damage roll)
		winGame();
		logger.info('[applyPendingSuccessCheck] VICTORY - All tokens removed');
	}

	if (advance) {
		advanceAfterSuccessCheck();
	}
}

/**
 * Leave the Salvation check screen once the player has seen the result
 * (victory goes to the ending, otherwise to the round's journal entry)
 */
export function advanceAfterSuccessCheck() {
	if (gameState.gameOver) {
		transitionTo('gameOver');

		// Auto-save after victory
		saveGame(gameState);
	} else {
		// Continue the game - go to journal entry before starting next round
		transitionTo('log');
		saveGame(gameState);
	}
}

/**
 * Perform the initial damage roll before round 1
 * D20 system: Uses calculateStabilityLoss() and handles Lucid/Surreal triggers
 * This is the SRD's digital enhancement - game starts with some instability
 * @param {number} [roll] - D20 roll result (1-20). Omit to roll now, like every other check
 *   (with the Lucid/Surreal modifier, though a fresh game never has one).
 * @returns {{ roll: number, dice: number[], wasLucid: boolean, wasSurreal: boolean }}
 */
export function performInitialDamageRoll(roll) {
	const thrown =
		roll === undefined
			? gameState.rollWithModifiers()
			: { roll, dice: [roll], wasLucid: false, wasSurreal: false };
	logger.debug('[performInitialDamageRoll] D20 Roll:', thrown.roll, 'Stability:', gameState.tower);

	// Calculate stability loss using d20 table
	const { loss, optionalGain } = calculateStabilityLoss(thrown.roll);

	// Store pending updates (to be applied after dice animation)
	gameState.pendingUpdates.diceRoll = thrown.roll;
	gameState.pendingUpdates.towerDamage = loss;
	// Natural 20 → Lucid, natural 1 → Surreal (deferred until after animation)
	queueModifierFromRoll(thrown.roll);
	// Natural 20 also restores 1 Stability (auto-applied)
	gameState.pendingUpdates.towerGain = optionalGain > 0 ? optionalGain : null;

	logger.debug(
		`[performInitialDamageRoll] Stored pending roll ${thrown.roll}, pending stability loss: ${loss}, optional gain: ${optionalGain}`
	);

	// Note: State transitions will happen in applyPendingInitialDamageRoll after animation
	return thrown;
}

/**
 * Apply pending initial damage roll after dice animation completes
 * D20 system: Handles both stability loss and stability gain
 */
export function applyPendingInitialDamageRoll({ advance = true } = {}) {
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
	applyPendingModifier();

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

	if (advance) {
		advanceAfterInitialDamage();
	}
}

/**
 * Leave the initial instability screen once the player has seen the result
 * (round 1 opens on Roll for Tasks)
 */
export function advanceAfterInitialDamage() {
	openRound();
}

/**
 * Restart the game from the beginning
 *
 * Resets game state and starts a new game with the same player and original
 * configuration. Clears any saved progress for this game.
 *
 * @see {startGame} - Performs the actual game initialization
 * @see {exitGame} - Returns to game selection screen instead of restarting
 */
export function restartGame() {
	// Use originalConfig to ensure clean restart
	startGame(gameState.player, gameState.originalConfig, {});
}

/**
 * Exit the game
 *
 * Resets the whole run (Lucid, Surreal, pending updates and all) and drops the loaded
 * config, so starting any game afterwards, the same one included, begins a fresh run.
 * The saved game is untouched: it can still be resumed from the home screen.
 * @returns {Promise<void>}
 */
export async function exitGame() {
	Object.assign(gameState, createRunState(), { config: null, stylesheet: '' });
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
