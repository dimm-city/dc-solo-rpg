/**
 * StepAction is the one step button GameScreen mounts for every round step.
 * It shows the Lucid/Surreal modifier only when its caller passes one (the roll buttons),
 * inside the label, and never as a separate chip.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import StepAction from './StepAction.svelte';

describe('StepAction', () => {
	it('renders its label and calls its handler', async () => {
		const onclick = vi.fn();
		const { getByTestId } = render(StepAction, {
			props: { text: 'Roll for damage', onclick, testid: 'x-button' }
		});
		const button = getByTestId('x-button');
		expect(button.textContent).toContain('Roll for damage');
		expect(button.getAttribute('aria-label')).toBe('Roll for damage');

		await fireEvent.click(button);
		expect(onclick).toHaveBeenCalledTimes(1);
	});

	it('puts the modifier inside the roll button label', () => {
		const { getByTestId } = render(StepAction, {
			props: { text: 'Roll for damage', hint: 'Lucid: 2 dice, keep high', testid: 'roll-button' }
		});
		const button = getByTestId('roll-button');
		expect(getByTestId('roll-modifier').textContent).toBe('Lucid: 2 dice, keep high');
		expect(button.contains(getByTestId('roll-modifier'))).toBe(true);
		expect(button.getAttribute('aria-label')).toBe('Roll for damage · Lucid: 2 dice, keep high');
	});

	it('shows no modifier and no chip without a hint (Continue, Draw and the rest)', () => {
		const { queryByTestId, container } = render(StepAction, {
			props: { text: 'Continue', testid: 'continue-button' }
		});
		expect(queryByTestId('roll-modifier')).toBeNull();
		expect(queryByTestId('state-chip')).toBeNull();
		expect(container.textContent.trim()).toBe('Continue');
	});

	it('disables the button when asked', () => {
		const { getByTestId } = render(StepAction, {
			props: { text: 'Draw 3 Cards', disabled: true, testid: 'deal-button' }
		});
		expect(getByTestId('deal-button').disabled).toBe(true);
	});

	it('marks a button that has just changed meaning', () => {
		const { container } = render(StepAction, {
			props: { text: 'Continue', changed: true, testid: 'c-button' }
		});
		expect(container.querySelector('.step-action.changed')).not.toBeNull();
	});
});
