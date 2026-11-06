/**
 * ConfirmModal is a compact ContentModal: a named modal dialog with Cancel, an outlined
 * destructive action, a 44px close and Escape, all routed to the right callbacks.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import ConfirmModal from './ConfirmModal.svelte';

async function open(props = {}) {
	const onConfirm = vi.fn();
	const onCancel = vi.fn();
	render(ConfirmModal, {
		props: {
			isOpen: true,
			title: 'Delete Saved Game',
			message: 'Delete your save?\n\nThis cannot be undone.',
			confirmText: 'Delete',
			cancelText: 'Cancel',
			onConfirm,
			onCancel,
			...props
		}
	});
	await tick();
	return { onConfirm, onCancel };
}

describe('ConfirmModal', () => {
	afterEach(() => {
		document.body.querySelectorAll('.content-modal-portal').forEach((node) => node.remove());
	});

	it('is a modal dialog named by its title, with the message', async () => {
		await open();
		const dialog = screen.getByRole('dialog', { name: 'Delete Saved Game' });
		expect(dialog).toHaveAttribute('aria-modal', 'true');
		expect(screen.getByTestId('confirm-message')).toHaveTextContent('This cannot be undone.');
	});

	it('confirms with the action and cancels with Cancel, Close or Escape', async () => {
		const { onConfirm, onCancel } = await open();
		await fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
		expect(onConfirm).toHaveBeenCalledTimes(1);

		await fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		await fireEvent.click(screen.getByRole('button', { name: 'Close Delete Saved Game' }));
		await fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
		expect(onCancel).toHaveBeenCalledTimes(3);
	});

	it('marks the confirming action destructive unless told otherwise', async () => {
		await open();
		expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass('danger');
	});

	it('can confirm without the destructive style', async () => {
		await open({ destructive: false, confirmText: 'Leave' });
		expect(screen.getByRole('button', { name: 'Leave' })).not.toHaveClass('danger');
	});
});
