import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import SettingsModal from './SettingsModal.svelte';
import { getSettings, resetSettings } from '../../stores/settingsStore.svelte.js';

describe('SettingsModal difficulty', () => {
	beforeEach(() => resetSettings());
	afterEach(() => {
		document.body.querySelectorAll('.content-modal-portal').forEach((node) => node.remove());
	});

	it('updates the difficulty setting from the select', async () => {
		render(SettingsModal, { props: { isOpen: true, onClose: vi.fn() } });
		await tick();

		const select = screen.getByLabelText('Difficulty');
		expect(select.value).toBe('default');

		await fireEvent.change(select, { target: { value: 'easy' } });
		expect(getSettings().difficulty).toBe(0);

		await fireEvent.change(select, { target: { value: 'normal' } });
		expect(getSettings().difficulty).toBe(1);

		await fireEvent.change(select, { target: { value: 'default' } });
		expect(getSettings().difficulty).toBeNull();
	});
});
