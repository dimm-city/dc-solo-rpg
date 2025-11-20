import { logger } from '../utils/logger.js';

/**
 * useEnrichedRounds - Process saved game data into enriched rounds
 *
 * Takes a saved game object and transforms it into an array of enriched rounds,
 * merging card log data with journal entries and adding game state snapshots.
 *
 * @param {Object} savedGame - The complete saved game object
 * @returns {Array} Array of enriched round objects with cards, journal, and game state
 *
 * @example
 * const enrichedRounds = useEnrichedRounds(savedGame);
 * enrichedRounds.forEach(round => {
 *   logger.debug(round.roundNumber, round.cards, round.journalEntry);
 * });
 */
export function useEnrichedRounds(savedGame) {
	if (!savedGame?.cardLog) return [];

	const cardLog = savedGame.cardLog;
	const journalEntries = savedGame.journalEntries || [];

	logger.debug('[useEnrichedRounds] Processing saved game:', {
		totalCards: cardLog.length,
		totalJournals: journalEntries.length,
		journalRounds: journalEntries.map((j) => j.round),
		fullJournalData: journalEntries
	});

	// Log each journal entry in detail
	journalEntries.forEach((j, idx) => {
		logger.debug(`[useEnrichedRounds] Journal ${idx}:`, {
			round: j.round,
			hasText: !!j.text,
			textLength: j.text?.length || 0,
			textPreview: j.text?.substring(0, 30) || '(empty)',
			hasAudio: !!j.audioData,
			dateRecorded: j.dateRecorded
		});
	});

	// Filter out non-card entries (like 'initial-damage', 'final-damage')
	const cardEntries = cardLog.filter(
		(entry) => entry.type !== 'initial-damage' && entry.type !== 'final-damage'
	);

	// Group cards by round number
	const roundsMap = new Map();
	for (const cardEntry of cardEntries) {
		const roundNum = cardEntry.round;
		if (!roundsMap.has(roundNum)) {
			roundsMap.set(roundNum, []);
		}
		roundsMap.get(roundNum).push(cardEntry);
	}

	// Get win/lose message from game config
	const winMessage = savedGame.config?.['win-message'] || savedGame.config?.winMessage;
	const loseMessage = savedGame.config?.['lose-message'] || savedGame.config?.loseMessage;
	const gameOverMessage = savedGame.isWon ? winMessage : loseMessage;

	// Convert map to array of round objects
	const rounds = Array.from(roundsMap.entries())
		.sort((a, b) => a[0] - b[0]) // Sort by round number
		.map(([roundNum, cards], index, array) => {
			// Find journal entry for this round
			const journalEntry = journalEntries.find((j) => j.round === roundNum);

			logger.debug(`[useEnrichedRounds] Round ${roundNum}:`, {
				cardCount: cards.length,
				hasJournal: !!journalEntry,
				journalText: journalEntry?.text?.substring(0, 50)
			});

			// Get game state from the last card in the round (most recent state)
			const lastCard = cards[cards.length - 1];

			// Check if this is the final round
			const isFinalRound = index === array.length - 1;

			return {
				roundNumber: roundNum,
				cards: cards.map((cardEntry) => ({
					card: cardEntry.card,
					suit: cardEntry.suit,
					type: cardEntry.type,
					modifier: cardEntry.modifier,
					description: cardEntry.description,
					story: cardEntry.story,
					damageRoll: cardEntry.damageRoll,
					damageDealt: cardEntry.damageDealt
				})),
				journalEntry: journalEntry
					? {
							text: journalEntry.text,
							audio: journalEntry.audioData
						}
					: null,
				gameState: lastCard.gameState || {
					tower: 'N/A',
					tokens: 'N/A',
					bonus: 0,
					kingsRevealed: 0,
					aceOfHeartsRevealed: false
				},
				// Add game over message to final round
				gameOverMessage: isFinalRound ? gameOverMessage : null,
				isWon: savedGame.isWon
			};
		});

	logger.debug('[useEnrichedRounds] Total enriched rounds:', rounds.length);
	return rounds;
}
