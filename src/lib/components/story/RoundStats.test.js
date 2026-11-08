/**
 * RoundStats - story mode's end-of-round stats read label first, "n of max", like the
 * journal's status line (game-copy-v-04)
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import RoundStats from './RoundStats.svelte';

/** "Label value" for each stat, in order */
function readStats(container) {
	return [...container.querySelectorAll('.stat')].map(
		(stat) => `${stat.querySelector('dt').textContent} ${stat.querySelector('dd').textContent}`
	);
}

describe('RoundStats', () => {
	it('reads label first, n of max, with Tokens once Salvation is unlocked', () => {
		const { container } = render(RoundStats, {
			props: {
				state: {
					tower: 16,
					kingsRevealed: 1,
					acesRevealed: 2,
					tokens: 10,
					aceOfHeartsRevealed: true
				}
			}
		});
		expect(readStats(container)).toEqual([
			'Stability 16 of 20',
			'Kings 1 of 4',
			'Aces 2 of 4',
			'Tokens 10 left'
		]);
	});

	it('leaves Tokens out before the Ace of Hearts, and never shows Stability below 0', () => {
		const { container } = render(RoundStats, {
			props: { state: { tower: -1, kingsRevealed: 4, acesRevealed: 0, tokens: 10 } }
		});
		expect(readStats(container)).toEqual(['Stability 0 of 20', 'Kings 4 of 4', 'Aces 0 of 4']);
	});

	it('renders nothing without a state', () => {
		const { container } = render(RoundStats, { props: { state: null } });
		expect(container.querySelector('.round-stats')).toBeNull();
	});
});
