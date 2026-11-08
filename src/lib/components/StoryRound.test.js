/** Story mode's card panel shows the card's picture, small, when the card has one */
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import StoryRound from './StoryRound.svelte';

const round = (image) => ({
	cards: [
		{
			card: '7',
			suit: 'clubs',
			type: 'challenge',
			description: 'A setback',
			story: 'It costs you.',
			image
		}
	],
	journalEntry: { text: 'I wrote this.' }
});

describe('StoryRound card art', () => {
	it('shows the picture in the open card panel, before the description', async () => {
		const { container, getByRole } = render(StoryRound, {
			round: round({ src: '/games/art/alley.jpg', alt: 'A dim alley' }),
			roundNumber: 1,
			showStats: false
		});
		await fireEvent.click(getByRole('button', { name: /7 of Clubs/ }));
		const img = container.querySelector('.card-panel-art img');
		expect(img?.getAttribute('src')).toBe('/games/art/alley.jpg');
		expect(img?.getAttribute('alt')).toBe('A dim alley');
		const panel = container.querySelector('.card-panel');
		const next = panel.querySelector('.card-panel-art').nextElementSibling;
		expect(next.classList.contains('card-panel-desc')).toBe(true);
	});

	it('shows no frame without a picture, and none after a broken one', async () => {
		const { container, getByRole, rerender } = render(StoryRound, {
			round: round(null),
			roundNumber: 1,
			showStats: false
		});
		await fireEvent.click(getByRole('button', { name: /7 of Clubs/ }));
		expect(container.querySelector('.card-panel-art')).toBeNull();

		await rerender({
			round: round({ src: '/missing.jpg', alt: '' }),
			roundNumber: 1,
			showStats: false
		});
		await fireEvent.click(getByRole('button', { name: /7 of Clubs/ }));
		const img = container.querySelector('.card-panel-art img');
		if (img) {
			await fireEvent.error(img);
			expect(container.querySelector('.card-panel-art')).toBeNull();
		}
	});
});
