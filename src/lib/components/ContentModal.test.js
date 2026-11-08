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

	// visual-layout-s-15: the body shows the journal's "more below" cue while content remains
	// below the fold, drops it at the end, and fades its top once scrolled
	it('cues content below the fold and clears the cue at the end', async () => {
		await open();
		const body = screen.getByTestId('content-body');
		const cue = screen.getByTestId('content-more-cue');
		// jsdom does no layout: a 500px body over 900px of content
		let top = 0;
		Object.defineProperty(body, 'clientHeight', { configurable: true, get: () => 500 });
		Object.defineProperty(body, 'scrollHeight', { configurable: true, get: () => 900 });
		Object.defineProperty(body, 'scrollTop', {
			configurable: true,
			get: () => top,
			set: (v) => (top = v)
		});
		await fireEvent.scroll(body);
		expect(body).toHaveClass('more-below');
		expect(body).not.toHaveClass('more-above');
		expect(cue).toHaveClass('visible');

		body.scrollTop = 400; // the end
		await fireEvent.scroll(body);
		expect(body).not.toHaveClass('more-below');
		expect(body).toHaveClass('more-above');
		expect(cue).not.toHaveClass('visible');

		body.scrollTop = 200; // back up
		await fireEvent.scroll(body);
		expect(body).toHaveClass('more-below');
		expect(cue).toHaveClass('visible');
	});

	it('shows no cue when the body fits', async () => {
		await open();
		// jsdom reports 0 for both heights: everything fits
		expect(screen.getByTestId('content-body')).not.toHaveClass('more-below');
		expect(screen.getByTestId('content-more-cue')).not.toHaveClass('visible');
	});
});
