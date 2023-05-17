import { d6 } from '../Dice.js';

export default async (state, config) => {
	let score = 0;
	for (let diceIndex = 0; diceIndex < state.primaryFailureCounter; diceIndex++) {
		let number = d6(); //Check the logic on this, what is the failure check supposed to do? config.rollDice ? await config.rollDice(6) : d6();
		if (number === 1) {
			score++;
			if (score === state.primaryFailureCounter) break;
		}
	}
	state.primaryFailureCounter = state.primaryFailureCounter - score;
};
