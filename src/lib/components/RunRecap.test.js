/**
 * RunRecap - the Game Over tiles. A max led by a 1 ("/10") closes up to its slash, as in the
 * HUD, because a seven-segment "1" lights only its right-hand segments (visual-layout-v-01).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/svelte';
import { gameState, createRunState } from '../stores/gameStore.svelte.js';
import RunRecap from './RunRecap.svelte';

describe('RunRecap', () => {
	beforeEach(() => {
		Object.assign(gameState, createRunState(), {
			round: 6,
			tower: 18,
			kingsRevealed: 1,
			acesRevealed: 2,
			tokens: 0,
			aceOfHeartsRevealed: true,
			log: [],
			config: { options: { startingTokens: 10 } }
		});
	});

	it('pulls a max that starts with 1 up to its slash, and only that max', () => {
		const { getByTestId } = render(RunRecap);
		expect(getByTestId('recap-tokens').querySelector('.max')).toHaveClass('lead-one');
		for (const key of ['stability', 'kings', 'aces', 'cards']) {
			expect(getByTestId(`recap-${key}`).querySelector('.max')).not.toHaveClass('lead-one');
		}
	});

	it('leaves a max that does not start with 1 alone', () => {
		gameState.config = { options: { startingTokens: 8 } };
		const { getByTestId } = render(RunRecap);
		expect(getByTestId('recap-tokens').querySelector('.max')).not.toHaveClass('lead-one');
	});
});
