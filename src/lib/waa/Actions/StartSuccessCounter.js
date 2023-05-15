import PrimaryFailureCheck from './PrimaryFailureCheck.js';

export default (state) => {
	const result = {
		message: 'Starting success counter'
	};
	PrimaryFailureCheck(state);
	state.successCounterActive = true;
	return result;
};
