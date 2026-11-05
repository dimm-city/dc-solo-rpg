/**
 * Short reflective prompts for the journal, in the game's voice.
 * Picked from the cards drawn in the round.
 */

export const JOURNAL_PROMPTS = {
	challenge: ['What did this cost you?', 'What did you hold on to?'],
	king: ['What is slipping away?', 'What are you afraid to name?'],
	event: ["What do you notice that you didn't before?", 'What is quiet here?'],
	ace: ['Where does hope come from?', 'What is still worth saving?'],
	narrative: ['What do you remember?', 'Who were you before this?']
};

export const FINAL_PROMPTS = {
	kings: ['What did you leave unsaid?', 'What slipped away for good?'],
	stability: ['What held you up for as long as it did?', 'What gave way first?'],
	win: ['What did it cost to get out?', 'Who are you now?']
};

/** Category of a drawn card. Rank wins over type: any King or Ace gets its own prompts. */
function categoryOf(card) {
	if (card.card === 'K') return 'king';
	if (card.card === 'A') return 'ace';
	if (card.type === 'challenge' || card.type === 'event' || card.type === 'narrative') {
		return card.type;
	}
	return ['3', '5', '7', '9'].includes(card.card) ? 'challenge' : 'event';
}

/**
 * Up to two prompts for a round, from the cards drawn in it.
 * Kings and Aces come first, then challenges, then events.
 * @param {Array<{card?: string, type?: string}>} roundCards
 * @param {number} [max]
 */
export function getJournalPrompts(roundCards = [], max = 2) {
	const order = ['king', 'ace', 'challenge', 'narrative', 'event'];
	const categories = new Set(roundCards.filter((c) => c.card).map(categoryOf));
	const picked = [];
	for (const category of order) {
		if (categories.has(category)) picked.push(JOURNAL_PROMPTS[category][0]);
	}
	if (picked.length === 0) picked.push(JOURNAL_PROMPTS.event[0]);
	// A single category can offer its second prompt too.
	if (picked.length < max) {
		const only = order.find((c) => categories.has(c)) ?? 'event';
		picked.push(JOURNAL_PROMPTS[only][1]);
	}
	return picked.slice(0, max);
}

/** Prompts for the final log, from how the run ended. */
export function getFinalPrompts(cause, win = false) {
	if (win) return FINAL_PROMPTS.win;
	return cause === 'kings' ? FINAL_PROMPTS.kings : FINAL_PROMPTS.stability;
}
