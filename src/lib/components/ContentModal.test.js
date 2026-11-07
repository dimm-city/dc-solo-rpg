import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import HelpModal from './HelpModal.svelte';

describe('ContentModal accessibility', () => {
	afterEach(() => {
		vi.restoreAllMocks();
		document.body.querySelectorAll('.content-modal-portal').forEach((node) => node.remove());
	});

	async function open(onClose = vi.fn()) {
		render(HelpModal, { props: { isOpen: true, onClose } });
		await tick();
		return onClose;
	}

	it('is a labelled modal dialog and takes focus', async () => {
		await open();
		const dialog = screen.getByRole('dialog', { name: 'Game Guide' });
		expect(dialog).toHaveAttribute('aria-modal', 'true');
		expect(document.activeElement).toBe(dialog);
	});

	it('closes on Escape', async () => {
		const onClose = await open();
		await fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
		expect(onClose).toHaveBeenCalled();
	});

	it('wraps Tab from the last control back to the first', async () => {
		// jsdom has no layout, so report every element as rendered
		vi.spyOn(Element.prototype, 'getClientRects').mockReturnValue([1]);
		await open();
		const dialog = screen.getByRole('dialog');
		const last = screen.getByRole('button', { name: 'Done' });
		last.focus();
		await fireEvent.keyDown(dialog, { key: 'Tab' });
		expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close Game Guide' }));
	});
});
