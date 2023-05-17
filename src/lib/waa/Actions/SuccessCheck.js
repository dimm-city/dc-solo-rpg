import { d6 } from '../Dice.js';

class SuccessCheck {
	//rollDice = d6;

	async run(state, config) {
		if (state.successCounterActive) {
			state.status = "Roll for success bonus";
			const result = config.rollDice ? await config.rollDice(6) : d6(); //this.rollDice();
			if (result === 6) state.successCounter++;
			else if (result === 5 && state.successBonusActive) state.successCounter++;
			state.status = "";
			return result;
		}
		return null;
	}
}

const instance = new SuccessCheck();
export const rollDice = instance.rollDice;
export default instance.run;
