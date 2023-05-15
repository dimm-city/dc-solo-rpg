import { d6 } from '../Dice.js';

class SuccessCheck {
	//rollDice = d6;

	run(state) {
		if (state.successCounterActive) {
			const result = d6(); //this.rollDice();
			if (result === 6) state.successCounter++;
			else if (result === 5 && state.successBonusActive) state.successCounter++;
			return result;
		}
		return null;
	}
}

const instance = new SuccessCheck();
export const rollDice = instance.rollDice;
export default instance.run;
