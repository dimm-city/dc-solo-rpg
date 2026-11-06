/**
 * AugmentedButton: the key-cap hint and the accessible name.
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import AugmentedButton from './AugmentedButton.svelte';

describe('AugmentedButton', () => {
	it('renders no key-cap by default', () => {
		const { container } = render(AugmentedButton, { props: { text: 'Continue' } });
		expect(container.querySelector('kbd')).toBeNull();
	});

	it('shows the hint as a decorative key-cap inside the button', () => {
		const { getByRole } = render(AugmentedButton, {
			props: { text: 'Roll for Tasks', hint: 'Space', variant: 'primary' }
		});
		const button = getByRole('button', { name: 'Roll for Tasks' });
		const kbd = button.querySelector('kbd.key-hint');
		expect(kbd.textContent).toBe('Space');
		// The key-cap is not part of what a screen reader announces
		expect(kbd.getAttribute('aria-hidden')).toBe('true');
		expect(button.getAttribute('aria-label')).toBe('Roll for Tasks');
	});

	it('keeps disabled buttons disabled', () => {
		const { getByRole } = render(AugmentedButton, {
			props: { text: 'Draw', hint: 'Space', disabled: true }
		});
		expect(getByRole('button', { name: 'Draw' }).disabled).toBe(true);
	});
});
