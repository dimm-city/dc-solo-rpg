/**
 * Unit tests for HelpIcon component
 * Tests the help icon button for contextual help
 *
 * NOTE: Skipped due to Svelte 5 + @testing-library/svelte compatibility issues
 * Component is validated through build and Playwright integration tests
 */
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import HelpIcon from './HelpIcon.svelte';

describe.skip('HelpIcon', () => {
	it('should render a button element', () => {
		const { container } = render(HelpIcon);
		const button = container.querySelector('button');
		expect(button).toBeTruthy();
		expect(button.classList.contains('help-icon')).toBe(true);
	});

	it('should have type="button" to prevent form submission', () => {
		const { container } = render(HelpIcon);
		const button = container.querySelector('button');
		expect(button.getAttribute('type')).toBe('button');
	});

	it('should have default aria-label', () => {
		const { container } = render(HelpIcon);
		const button = container.querySelector('button');
		expect(button.getAttribute('aria-label')).toBe('Show help');
	});

	it('should accept custom aria-label', () => {
		const { container } = render(HelpIcon, {
			props: { ariaLabel: 'Help about tokens' }
		});
		const button = container.querySelector('button');
		expect(button.getAttribute('aria-label')).toBe('Help about tokens');
	});

	it('should render an SVG icon', () => {
		const { container } = render(HelpIcon);
		const svg = container.querySelector('svg');
		expect(svg).toBeTruthy();
	});

	it('should call onclick handler when clicked', async () => {
		const handleClick = vi.fn();
		const { container } = render(HelpIcon, {
			props: { onclick: handleClick }
		});

		const button = container.querySelector('button');
		await fireEvent.click(button);

		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it('should work without onclick handler', () => {
		const { container } = render(HelpIcon);
		const button = container.querySelector('button');

		// Should not throw when clicked without handler
		expect(() => fireEvent.click(button)).not.toThrow();
	});

	it('should be keyboard accessible', async () => {
		const handleClick = vi.fn();
		const { container } = render(HelpIcon, {
			props: { onclick: handleClick }
		});

		const button = container.querySelector('button');

		// Simulate Enter key
		await fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });

		// Button should be focusable and activatable by keyboard
		expect(button.tagName).toBe('BUTTON');
	});

	it('should have accessible SVG dimensions', () => {
		const { container } = render(HelpIcon);
		const svg = container.querySelector('svg');

		expect(svg.getAttribute('width')).toBe('18');
		expect(svg.getAttribute('height')).toBe('18');
	});
});
