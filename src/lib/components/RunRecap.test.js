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

	it('runs in the HUD order, each resource tile carrying its HUD tier (game-copy-s-08, s-09)', () => {
		Object.assign(gameState, { tower: 0, kingsRevealed: 4, tokens: 2 });
		const { getByTestId } = render(RunRecap);
		const tiles = [...getByTestId('run-recap').querySelectorAll('.stat')];
		expect(tiles.map((t) => t.querySelector('dt').textContent)).toEqual([
			'Stability',
			'Kings',
			'Rounds',
			'Drawn',
			'Aces',
			'Tokens'
		]);
		expect(tiles.map((t) => t.dataset.tier)).toEqual([
			'critical',
			'urgent',
			'neutral',
			'neutral',
			'two',
			'near'
		]);
		// The visible label is the tile's only spoken name: the hidden text is the value alone
		// (game-copy-s-13)
		expect(getByTestId('recap-cards').querySelector('.sr-only').textContent).toBe('0 of 52 cards');
		expect(getByTestId('recap-stability').querySelector('.sr-only').textContent).toBe('0 of 20');
		expect(getByTestId('recap-tokens').querySelector('[data-testid="recap-tokens-lock"]')).toBe(
			null
		);
	});

	it('shows Tokens locked, with a padlock, when the Ace of Hearts was never found (game-copy-s-14)', () => {
		Object.assign(gameState, { aceOfHeartsRevealed: false, tokens: 10 });
		const { getByTestId } = render(RunRecap);
		const tiles = [...getByTestId('run-recap').querySelectorAll('.stat')];
		expect(tiles).toHaveLength(6);
		const tokens = getByTestId('recap-tokens');
		expect(tokens.dataset.tier).toBe('locked');
		expect(tokens.querySelector('dt').textContent).toBe('Tokens');
		expect(tokens.querySelector('[data-testid="recap-tokens-lock"]')).not.toBe(null);
		expect(tokens.querySelector('.sr-only').textContent).toBe(
			'locked, the Ace of Hearts never found'
		);
	});
});
