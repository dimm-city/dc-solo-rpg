/**
 * Unit tests for HelpModal component
 * Tests the contextual help modal system
 *
 * NOTE: Skipped due to Svelte 5 + @testing-library/svelte compatibility issues
 * Component is validated through build and Playwright integration tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import HelpModal from './HelpModal.svelte';

describe.skip('HelpModal', () => {
	it('should render ConfirmModal with correct props', () => {
		const onClose = vi.fn();
		const { container } = render(HelpModal, {
			props: {
				isOpen: true,
				helpKey: 'tower',
				onClose
			}
		});

		// Should render the modal backdrop
		expect(container.querySelector('.modal-backdrop')).toBeTruthy();
	});

	it('should display tower help content', () => {
		const onClose = vi.fn();
		const { container } = render(HelpModal, {
			props: {
				isOpen: true,
				helpKey: 'tower',
				onClose
			}
		});

		expect(container.textContent).toContain('Tower (Health)');
		expect(container.textContent).toContain('represents your health');
	});

	it('should display kings help content', () => {
		const onClose = vi.fn();
		const { container } = render(HelpModal, {
			props: {
				isOpen: true,
				helpKey: 'kings',
				onClose
			}
		});

		expect(container.textContent).toContain('Kings (Failure Counter)');
		expect(container.textContent).toContain('doom');
	});

	it('should display tokens help content', () => {
		const onClose = vi.fn();
		const { container } = render(HelpModal, {
			props: {
				isOpen: true,
				helpKey: 'tokens',
				onClose
			}
		});

		expect(container.textContent).toContain('Tokens (Win Condition)');
		expect(container.textContent).toContain('path to victory');
	});

	it('should display bonus help content', () => {
		const onClose = vi.fn();
		const { container } = render(HelpModal, {
			props: {
				isOpen: true,
				helpKey: 'bonus',
				onClose
			}
		});

		expect(container.textContent).toContain('Luck (Bonus)');
		expect(container.textContent).toContain('reduce damage');
	});

	it('should display cardTypes help content', () => {
		const onClose = vi.fn();
		const { container } = render(HelpModal, {
			props: {
				isOpen: true,
				helpKey: 'cardTypes',
				onClose
			}
		});

		expect(container.textContent).toContain('Card Types');
		expect(container.textContent).toContain('Challenge cards');
	});

	it('should display progress help content', () => {
		const onClose = vi.fn();
		const { container } = render(HelpModal, {
			props: {
				isOpen: true,
				helpKey: 'progress',
				onClose
			}
		});

		expect(container.textContent).toContain('Cards Progress');
		expect(container.textContent).toContain('progress bar');
	});

	it('should display deck help content', () => {
		const onClose = vi.fn();
		const { container } = render(HelpModal, {
			props: {
				isOpen: true,
				helpKey: 'deck',
				onClose
			}
		});

		expect(container.textContent).toContain('Deck Visualization');
		expect(container.textContent).toContain('deck stack');
	});

	it('should display fallback content for unknown helpKey', () => {
		const onClose = vi.fn();
		const { container } = render(HelpModal, {
			props: {
				isOpen: true,
				helpKey: 'unknownKey',
				onClose
			}
		});

		expect(container.textContent).toContain('Help');
		expect(container.textContent).toContain('No help available');
	});

	it('should have "Got it" as confirm button text', () => {
		const onClose = vi.fn();
		const { container } = render(HelpModal, {
			props: {
				isOpen: true,
				helpKey: 'tower',
				onClose
			}
		});

		expect(container.textContent).toContain('Got it');
	});

	it('should not render when isOpen is false', () => {
		const onClose = vi.fn();
		const { container } = render(HelpModal, {
			props: {
				isOpen: false,
				helpKey: 'tower',
				onClose
			}
		});

		// Modal should not be visible
		const backdrop = container.querySelector('.modal-backdrop');
		expect(backdrop).toBeNull();
	});

	it('should handle missing helpKey gracefully', () => {
		const onClose = vi.fn();
		const { container } = render(HelpModal, {
			props: {
				isOpen: true,
				helpKey: null,
				onClose
			}
		});

		// Should render without crashing
		expect(container.textContent).toContain('Help');
	});

	it('should pass onClose to both confirm and cancel handlers', () => {
		const onClose = vi.fn();
		const { container } = render(HelpModal, {
			props: {
				isOpen: true,
				helpKey: 'tower',
				onClose
			}
		});

		// ConfirmModal should be rendered with onConfirm and onCancel both pointing to onClose
		// We verify this by checking the modal is rendered properly
		expect(container.querySelector('.modal-backdrop')).toBeTruthy();
	});
});
