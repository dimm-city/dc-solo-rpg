import { logger } from '../utils/logger.js';

/**
 * useEnrichedRounds - Turn a saved game into the rounds story mode reads
 *
 * Groups the card log by round and attaches the round's journal entry. Each round also gets
 * the state at its END (`endState`): a card's snapshot is taken when it is drawn, before its
 * effect, so the end of a round is the first snapshot of the next round, and the end of the
 * last round is the saved final state. (Using the last card's snapshot showed the final round
 * one King short and the last Stability loss missing.)
 *
 * @param {Object} savedGame - A completed save (see indexedDBStorage)
 * @returns {Array<{
 *   roundNumber: number,
 *   cards: Array<Object>,
 *   journalEntry: {text: string, audio: string|null} | null,
 *   endState: {tower: number, kingsRevealed: number, acesRevealed: number, tokens: number, aceOfHeartsRevealed: boolean},
 *   gameOverMessage: string|null,
 *   isWon: boolean
 * }>}
 */
export function useEnrichedRounds(savedGame) {
	if (!savedGame?.cardLog) return [];

	const journalEntries = savedGame.journalEntries || [];

	// Cards only: the log also holds roll entries such as the opening 'initial-damage'
	const cardEntries = savedGame.cardLog.filter(
		(entry) => entry.card && entry.type !== 'initial-damage' && entry.type !== 'final-damage'
	);

	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- throwaway local, not reactive state
	const roundsMap = new Map();
	for (const entry of cardEntries) {
		if (!roundsMap.has(entry.round)) roundsMap.set(entry.round, []);
		roundsMap.get(entry.round).push(entry);
	}

	const winMessage = savedGame.config?.['win-message'] || savedGame.config?.winMessage;
	const loseMessage = savedGame.config?.['lose-message'] || savedGame.config?.loseMessage;
	const gameOverMessage = savedGame.isWon ? winMessage : loseMessage;

	const finalState = {
		tower: savedGame.finalTower ?? savedGame.tower,
		kingsRevealed: savedGame.kingsRevealed ?? cardEntries.filter((c) => c.card === 'K').length,
		acesRevealed: savedGame.acesRevealed ?? cardEntries.filter((c) => c.card === 'A').length,
		tokens: savedGame.tokens,
		aceOfHeartsRevealed:
			savedGame.aceOfHeartsRevealed ??
			cardEntries.some((c) => c.card === 'A' && c.suit === 'hearts')
	};

	const ordered = Array.from(roundsMap.entries()).sort((a, b) => a[0] - b[0]);

	const rounds = ordered.map(([roundNumber, cards], index) => {
		const entry = journalEntries.find((j) => j.round === roundNumber);
		const text = entry?.text?.trim() ? entry.text : '';
		const audio = entry?.audioData || null;
		const next = ordered[index + 1];
		const isFinalRound = !next;

		return {
			roundNumber,
			cards: cards.map((card) => ({
				card: card.card,
				suit: card.suit,
				type: card.type,
				modifier: card.modifier,
				description: card.description,
				story: card.story,
				diceRoll: card.diceRoll,
				damageDealt: card.damageDealt
			})),
			journalEntry: text || audio ? { text, audio } : null,
			endState: isFinalRound ? finalState : (next[1][0].gameState ?? null),
			gameOverMessage: isFinalRound ? gameOverMessage || null : null,
			isWon: !!savedGame.isWon
		};
	});

	logger.debug(
		'[useEnrichedRounds] Rounds:',
		rounds.length,
		'journal entries:',
		journalEntries.length
	);
	return rounds;
}
