/**
 * Unit tests for KeyboardHint component
 * Tests the keyboard shortcut hint that appears and fades
 *
 * NOTE: Skipped due to Svelte 5 + @testing-library/svelte compatibility issues
 * Component is validated through build and Playwright integration tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/svelte';
import KeyboardHint from './KeyboardHint.svelte';

describe.skip('KeyboardHint', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should not render when show prop is false', () => {
		const { container } = render(KeyboardHint, { props: { show: false } });
		expect(container.querySelector('.keyboard-hint')).toBeNull();
	});

	it('should not be visible immediately when show is true', () => {
		const { container } = render(KeyboardHint, { props: { show: true } });
		// Component may exist but should not be visible yet
		const hint = container.querySelector('.keyboard-hint');
		expect(hint).toBeNull();
	});

	it('should become visible after 1 second delay', async () => {
		const { container } = render(KeyboardHint, { props: { show: true } });

		// Initially not visible
		expect(container.querySelector('.keyboard-hint')).toBeNull();

		// Advance time by 1 second
		await vi.advanceTimersByTimeAsync(1000);

		// Should be visible now
		const hint = container.querySelector('.keyboard-hint');
		expect(hint).toBeTruthy();
	});

	it('should hide after 6 seconds total', async () => {
		const { container } = render(KeyboardHint, { props: { show: true } });

		// Advance to when it becomes visible (1s)
		await vi.advanceTimersByTimeAsync(1000);
		expect(container.querySelector('.keyboard-hint')).toBeTruthy();

		// Advance past the hide time (additional 5s = 6s total)
		await vi.advanceTimersByTimeAsync(5000);

		// Should be hidden now
		expect(container.querySelector('.keyboard-hint')).toBeNull();
	});

	it('should display "Space" key instruction', async () => {
		const { container } = render(KeyboardHint, { props: { show: true } });

		await vi.advanceTimersByTimeAsync(1000);

		const kbd = container.querySelector('kbd');
		expect(kbd).toBeTruthy();
		expect(kbd.textContent).toBe('Space');
	});

	it('should mention "Enter" as alternative', async () => {
		const { container } = render(KeyboardHint, { props: { show: true } });

		await vi.advanceTimersByTimeAsync(1000);

		const hint = container.querySelector('.keyboard-hint');
		expect(hint.textContent).toContain('Enter');
	});

	it('should have proper ARIA attributes for screen readers', async () => {
		const { container } = render(KeyboardHint, { props: { show: true } });

		await vi.advanceTimersByTimeAsync(1000);

		const hint = container.querySelector('.keyboard-hint');
		expect(hint.getAttribute('role')).toBe('status');
		expect(hint.getAttribute('aria-live')).toBe('polite');
	});
});
