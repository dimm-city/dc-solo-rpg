import PrimaryFailureCheck from './PrimaryFailureCheck.js';

export default async (state, config) => {
	const result = {
		message: 'Starting success counter'
	};
	await PrimaryFailureCheck(state, config);
	state.successCounterActive = true;
	return result;
};
