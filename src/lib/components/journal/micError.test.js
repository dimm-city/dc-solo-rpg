import { describe, it, expect } from 'vitest';
import { micErrorMessage } from './micError.js';

const failure = (name) => Object.assign(new Error('getUserMedia failed'), { name });

describe('micErrorMessage (NV-07)', () => {
	it('says the microphone is blocked only when permission was refused', () => {
		expect(micErrorMessage(failure('NotAllowedError'))).toBe(
			'The microphone is blocked. Allow it in your browser to record.'
		);
		expect(micErrorMessage(failure('SecurityError'))).toMatch(/blocked/);
	});

	it('says there is no microphone when none is found', () => {
		expect(micErrorMessage(failure('NotFoundError'))).toBe(
			'No microphone found. Connect one to record.'
		);
		expect(micErrorMessage(failure('OverconstrainedError'))).toMatch(/No microphone/);
	});

	it('says recording could not start for anything else', () => {
		for (const error of [failure('NotReadableError'), new TypeError('no mediaDevices'), null]) {
			expect(micErrorMessage(error)).toBe(
				"Couldn't start recording. Try again, or write your entry instead."
			);
		}
	});
});
