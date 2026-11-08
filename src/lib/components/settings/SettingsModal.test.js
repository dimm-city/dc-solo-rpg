import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import SettingsModal from './SettingsModal.svelte';
import { getSettings, resetSettings } from '../../stores/settingsStore.svelte.js';
import {
	getAudioSettings,
	getGameplaySettings,
	resetSettings as resetAudioSettings,
	updateGameplaySettings
} from '../../stores/audioStore.svelte.js';
import { areRuleTipsEnabled, markInstructionsAsSeen } from '../../utils/instructionsStorage.js';
import { logger } from '../../utils/logger.js';

async function openSettings() {
	render(SettingsModal, { props: { isOpen: true, onClose: vi.fn() } });
	await tick();
}

describe('SettingsModal', () => {
	beforeEach(() => {
		// jsdom has no speech synthesis: the voice list logs that it cannot load, which is expected
		vi.spyOn(logger, 'error').mockImplementation(() => {});
		localStorage.clear();
		resetSettings();
		resetAudioSettings();
	});
	afterEach(() => {
		vi.restoreAllMocks();
		document.body.querySelectorAll('.content-modal-portal').forEach((node) => node.remove());
	});

	it('updates the difficulty setting from the select', async () => {
		await openSettings();

		const select = screen.getByLabelText('Difficulty');
		expect(select.value).toBe('default');

		await fireEvent.change(select, { target: { value: 'easy' } });
		expect(getSettings().difficulty).toBe(0);

		await fireEvent.change(select, { target: { value: 'normal' } });
		expect(getSettings().difficulty).toBe(1);

		await fireEvent.change(select, { target: { value: 'hard' } });
		expect(getSettings().difficulty).toBe(2);

		await fireEvent.change(select, { target: { value: 'default' } });
		expect(getSettings().difficulty).toBeNull();
	});

	it('offers Game default, Easy, Normal and Hard, and says what the selected one changes', async () => {
		await openSettings();

		const select = screen.getByLabelText('Difficulty');
		expect([...select.options].map((o) => o.textContent)).toEqual([
			'Game default',
			'Easy',
			'Normal',
			'Hard'
		]);
		const help = () => document.getElementById('difficulty-help').textContent.trim();
		const expected = {
			default: 'Each game sets its own; most use Normal.',
			easy: 'The Ace of Hearts starts revealed, and surviving the fourth Ace wins.',
			normal: 'Tokens only ever fall. Remove them all to escape.',
			hard: 'A missed Salvation roll adds a Token (two on a natural 1).'
		};
		expect(help()).toBe(`${expected.default} Applies from your next game.`);
		for (const [value, text] of Object.entries(expected)) {
			await fireEvent.change(select, { target: { value } });
			expect(help()).toBe(`${text} Applies from your next game.`);
			expect(select.getAttribute('aria-describedby')).toBe('difficulty-help');
		}
		expect(document.body.textContent).not.toMatch(/automatic|prompt/i);
	});

	it('opens on Manual play mode with default settings', async () => {
		await openSettings();

		expect(screen.getByRole('radiogroup', { name: 'Play mode' })).toBeInTheDocument();
		expect(screen.getByRole('radio', { name: 'Manual' }).checked).toBe(true);
	});

	it('Hands-free turns on reading aloud and auto-play; Manual turns both off', async () => {
		await openSettings();

		await fireEvent.click(screen.getByRole('radio', { name: 'Hands-free' }));
		expect(getAudioSettings().autoReadCards).toBe(true);
		expect(getGameplaySettings().autoRollDice).toBe(true);
		expect(getGameplaySettings().autoHandleJournaling).toBe('timed');
		expect(screen.getByRole('radio', { name: 'Hands-free' }).checked).toBe(true);

		await fireEvent.click(screen.getByRole('radio', { name: 'Read aloud' }));
		expect(getAudioSettings().autoAnnounceRolls).toBe(true);
		expect(getGameplaySettings().autoRollDice).toBe(false);

		await fireEvent.click(screen.getByRole('radio', { name: 'Manual' }));
		expect(getAudioSettings().autoReadPrompts).toBe(false);
		expect(getGameplaySettings().autoContinueAfterReading).toBe(false);
	});

	it('selects no play mode for a custom mix, and says so', async () => {
		updateGameplaySettings({ autoRollDice: true });
		await openSettings();

		for (const name of ['Manual', 'Read aloud', 'Hands-free']) {
			expect(screen.getByRole('radio', { name }).checked).toBe(false);
		}
		expect(document.body.textContent).toContain('Custom: your own mix');
	});

	it('the Rule tips switch turns tips off and back on', async () => {
		markInstructionsAsSeen(); // e.g. "don't show tips" was chosen before
		await openSettings();

		const tips = screen.getByRole('switch', { name: 'Rule tips' });
		expect(tips.checked).toBe(false);

		await fireEvent.click(tips);
		expect(areRuleTipsEnabled()).toBe(true);
		await fireEvent.click(tips);
		expect(areRuleTipsEnabled()).toBe(false);
	});

	it('keeps every finer control under Advanced', async () => {
		await openSettings();

		const advanced = document.body.querySelector('details.settings-advanced');
		expect(advanced.open).toBe(false);
		for (const label of [
			'Voice provider',
			'Read cards',
			'Read instructions',
			'Announce dice rolls',
			'Reading speed',
			'Auto-roll dice',
			'Continue after reading',
			'Advance delay',
			'Journal'
		]) {
			expect(advanced.contains(screen.getByLabelText(label))).toBe(true);
		}
	});

	it('lists the browser and on-device voices, and no cloud service without a key', async () => {
		await openSettings();

		const options = [...screen.getByLabelText('Voice provider').options].map((o) => o.value);
		expect(options).toEqual(['browser', 'supertonic']);
		expect(screen.getByRole('button', { name: 'Add a voice service' })).toBeInTheDocument();
	});
});
