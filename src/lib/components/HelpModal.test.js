/**
 * Unit tests for HelpModal component
 * Tests the game guide modal (a ContentModal that lists every help section)
 *
 * ContentModal renders into a portal appended to document.body, so queries
 * go through `screen` / `document.body` rather than the render container.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import HelpModal from './HelpModal.svelte';

const SECTION_TITLES = [
	'Stability (Your Life)',
	'Tokens (Path to Victory)',
	'Abilities (Aces)',
	'Failure Counter (Kings)',
	'Lucid & Surreal States',
	'Card Types',
	'The Deck',
	'How to Win',
	'How to Lose'
];

async function renderModal(props = {}) {
	const result = render(HelpModal, { props: { isOpen: true, onClose: vi.fn(), ...props } });
	// ContentModal moves its element into a body-level portal inside an effect
	await tick();
	return result;
}

describe('HelpModal', () => {
	// Outro transitions can leave portal nodes behind after unmount; clear them between tests
	afterEach(() => {
		document.body.querySelectorAll('.content-modal-portal').forEach((node) => node.remove());
	});

	it('should render the modal with the "Game Guide" title', async () => {
		await renderModal();

		expect(
			document.body.querySelector('.content-modal-portal .content-modal-backdrop')
		).toBeTruthy();
		expect(screen.getByRole('heading', { name: 'Game Guide' })).toBeInTheDocument();
	});

	it('should display every help section', async () => {
		await renderModal();

		for (const title of SECTION_TITLES) {
			expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
		}
		expect(document.body.querySelectorAll('.help-section').length).toBe(SECTION_TITLES.length);
	});

	it('should display help message text', async () => {
		await renderModal();

		expect(document.body.textContent).toContain('You start with 20 Stability');
		expect(document.body.textContent).toContain('Challenge cards');
		expect(document.body.textContent).toContain('Reveal all 4 Kings');
	});

	it('should have "Got it" as confirm button text', async () => {
		await renderModal();

		expect(screen.getByRole('button', { name: 'Got it' })).toBeInTheDocument();
	});

	it('should not render when isOpen is false', async () => {
		await renderModal({ isOpen: false });

		expect(document.body.querySelector('.content-modal-backdrop')).toBeNull();
		expect(document.body.textContent).not.toContain('Game Guide');
	});

	it('should call onClose when the footer button is clicked', async () => {
		const onClose = vi.fn();
		await renderModal({ onClose });

		screen.getByRole('button', { name: 'Got it' }).click();

		expect(onClose).toHaveBeenCalled();
	});

	it('should call onClose when the close button is clicked', async () => {
		const onClose = vi.fn();
		await renderModal({ onClose });

		screen.getByRole('button', { name: 'Close Game Guide' }).click();

		expect(onClose).toHaveBeenCalled();
	});
});
