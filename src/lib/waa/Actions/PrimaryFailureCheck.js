import { d6 } from '../Dice.js';

export default (state) => {
	let score = 0;
	for (let diceIndex = 0; diceIndex < state.primaryFailureCounter; diceIndex++) {
		let number = d6(); // this.rollDice();
		if (number === 1) {
			score++;
			if (score === state.primaryFailureCounter) break;
		}
	}
	state.primaryFailureCounter = state.primaryFailureCounter - score;
};
