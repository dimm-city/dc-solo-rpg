/**
 * CardDisplay art: a card with an image shows it framed above the story, with its alt text;
 * a card without one shows no frame; a broken image hides the frame.
 */
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import CardDisplay from './CardDisplay.svelte';

const seven = (image = null) => ({
	card: '7',
	suit: 'clubs',
	type: 'challenge',
	description: 'A setback',
	story: 'It costs you.',
	image
});

describe('CardDisplay art', () => {
	it('shows the image framed above the story, with its alt text', () => {
		const { container } = render(CardDisplay, {
			card: seven({ src: '/games/art/alley.jpg', alt: 'A dim alley' }),
			animationStage: 'revealed'
		});
		const img = container.querySelector('.card-art img');
		expect(img?.getAttribute('src')).toBe('/games/art/alley.jpg');
		expect(img?.getAttribute('alt')).toBe('A dim alley');
		const wrap = container.querySelector('.story-wrap');
		expect(wrap.firstElementChild.classList.contains('card-art')).toBe(true);
		expect(wrap.lastElementChild.classList.contains('more-cue')).toBe(true);
		// The alt text is part of what the card tells a screen reader
		expect(
			container.querySelector('[data-testid="card"]').getAttribute('aria-describedby')
		).toContain(img.id);
	});

	it('keeps a decorative image (empty alt) out of the description', () => {
		const { container } = render(CardDisplay, {
			card: seven({ src: '/games/art/alley.jpg', alt: '' }),
			animationStage: 'revealed'
		});
		const img = container.querySelector('.card-art img');
		expect(img?.getAttribute('alt')).toBe('');
		expect(
			container.querySelector('[data-testid="card"]').getAttribute('aria-describedby')
		).not.toContain(img.id);
	});

	it('shows no frame for a card without an image', () => {
		const { container } = render(CardDisplay, { card: seven(), animationStage: 'revealed' });
		expect(container.querySelector('.card-art')).toBeNull();
		expect(container.querySelector('.byte-story')?.textContent).toBe('It costs you.');
	});

	it('hides the frame when the image fails to load', async () => {
		const { container } = render(CardDisplay, {
			card: seven({ src: '/games/art/missing.jpg', alt: 'Gone' }),
			animationStage: 'revealed'
		});
		await fireEvent.error(container.querySelector('.card-art img'));
		await tick();
		expect(container.querySelector('.card-art')).toBeNull();
	});
});
