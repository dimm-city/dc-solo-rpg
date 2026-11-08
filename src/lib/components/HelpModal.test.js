/**
 * Unit tests for HelpModal component
 * Tests the game guide modal (a ContentModal that lists every help section)
 *
 * ContentModal renders into a portal appended to document.body, so queries
 * go through `screen` / `document.body` rather than the render container.
 */
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import HelpModal from './HelpModal.svelte';
import { markRuleTipSeen } from '../utils/instructionsStorage.js';

const SECTION_TITLES = [
	'The goal',
	'Rounds and cards',
	'Stability checks',
	'Lucid and Surreal',
	'Salvation',
	'How it ends',
	'Difficulty'
];

async function renderModal(props = {}) {
	const result = render(HelpModal, { props: { isOpen: true, onClose: vi.fn(), ...props } });
	// ContentModal moves its element into a body-level portal inside an effect
	await tick();
	return result;
}

describe('HelpModal', () => {
	// Outro transitions can leave portal nodes behind after unmount; clear them between tests
	beforeEach(() => localStorage.clear());
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
		expect(document.body.querySelectorAll('.guide-section').length).toBe(SECTION_TITLES.length);
	});

	it('should display help message text', async () => {
		await renderModal();

		expect(document.body.textContent).toContain('20 Stability');
		expect(document.body.textContent).toContain('Odd cards');
		expect(document.body.textContent).toContain('all four Kings');
		expect(document.body.textContent).toContain('Roll 17 or higher');
	});

	it('states the Lucid and Surreal rule for every roll (owner decision 1)', async () => {
		await renderModal();

		const text = document.body.textContent.replace(/\s+/g, ' ');
		expect(text).toContain('Any natural 20 makes you Lucid; any natural 1 makes you Surreal.');
		expect(text).toContain('the opening roll, the roll for tasks, Stability checks and Salvation');
		expect(text).toContain('Lucid: your next roll uses two dice and keeps the higher.');
		expect(text).not.toMatch(/d20s|keep high|keep low|2 dice|roll for cards|all 4 Kings/);
		expect(text).not.toContain('on a Stability check makes you');
	});

	it('states the four-Aces rule, and the Easy exception where the fourth Ace ends the game', async () => {
		await renderModal();

		const text = document.body.textContent.replace(/\s+/g, ' ');
		expect(text).toContain('Remove every Token to escape.');
		expect(text).toContain('No target: a Stability check, then 1 Token comes off');
		expect(text).toContain('With all four Aces there is no target.');
		expect(text).toContain('And the fourth Ace ends the game');
		expect(text).toContain('Hard changes one thing: a missed Salvation roll adds 1 Token');
		expect(text).not.toContain('The fourth Ace ends the game.');
		// Three endings: escape, fall, taken (the deck never runs out first)
		expect(text).not.toContain('if the deck runs out');
		expect(text).not.toMatch(/automatic|assured/);
	});

	it('lists no "Rules you\'ve met" before any rule tip has been shown', async () => {
		await renderModal();

		expect(screen.queryByRole('heading', { name: "Rules you've met" })).toBeNull();
	});

	it('lists the rule tips the player has met, once each, in the order met', async () => {
		markRuleTipSeen('lucid');
		markRuleTipSeen('odd');
		markRuleTipSeen('lucid');
		markRuleTipSeen('some-future-tip'); // unknown ids are skipped
		await renderModal();

		const heading = screen.getByRole('heading', { name: "Rules you've met" });
		const items = [...heading.parentElement.querySelectorAll('li')].map((li) => li.textContent);
		expect(items).toEqual([
			'Lucid: your next roll uses two dice and keeps the higher.',
			'Odd cards call for a Stability check. Low rolls cost Stability.'
		]);
		expect(screen.getByRole('button', { name: "Rules you've met" })).toBeInTheDocument();
	});

	it("keeps every met rule true on every difficulty, in the board's words (game-copy-v-01)", async () => {
		for (const id of ['ace', 'fourth-ace', 'token']) markRuleTipSeen(id);
		await renderModal();

		const heading = screen.getByRole('heading', { name: "Rules you've met" });
		const items = [...heading.parentElement.querySelectorAll('li')].map((li) => li.textContent);
		expect(items).toEqual([
			'Every Ace you reveal makes Salvation easier. On Normal and Hard, with all four there is no target: each Salvation is a Stability check, and the Token comes off if you hold on.',
			'On Easy, the fourth Ace ends the game: survive its Stability check and you escape.',
			'On Hard, a missed Salvation roll adds a Token (two on a natural 1).'
		]);
		expect(items.join(' ')).not.toMatch(/failed/i);
	});

	it('should have "Done" as its footer button, like every dialog (MN-03)', async () => {
		await renderModal();

		expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
	});

	it('should not render when isOpen is false', async () => {
		await renderModal({ isOpen: false });

		expect(document.body.querySelector('.content-modal-backdrop')).toBeNull();
		expect(document.body.textContent).not.toContain('Game Guide');
	});

	it('should call onClose when the footer button is clicked', async () => {
		const onClose = vi.fn();
		await renderModal({ onClose });

		screen.getByRole('button', { name: 'Done' }).click();

		expect(onClose).toHaveBeenCalled();
	});

	it('should call onClose when the close button is clicked', async () => {
		const onClose = vi.fn();
		await renderModal({ onClose });

		screen.getByRole('button', { name: 'Close Game Guide' }).click();

		expect(onClose).toHaveBeenCalled();
	});
});
