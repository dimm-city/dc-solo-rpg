/**
 * StepAction is the one step button GameScreen mounts for every round step: a one-line verb
 * label in a fixed frame. The Lucid/Surreal modifier its caller passes (the roll buttons) sits
 * on its own reserved line above the button, which describes the button while it shows.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import StepAction from './StepAction.svelte';

describe('StepAction', () => {
	it('renders its label and calls its handler', async () => {
		const onclick = vi.fn();
		const { getByTestId } = render(StepAction, {
			props: { text: 'Roll for Stability', onclick, testid: 'x-button' }
		});
		const button = getByTestId('x-button');
		expect(button.textContent).toContain('Roll for Stability');
		expect(button.getAttribute('aria-label')).toBe('Roll for Stability');

		await fireEvent.click(button);
		expect(onclick).toHaveBeenCalledTimes(1);
	});

	it('puts the modifier on its own line above the button, which it describes', () => {
		const { getByTestId } = render(StepAction, {
			props: {
				text: 'Roll for Stability',
				hint: 'Lucid · two dice, keep the higher',
				testid: 'roll-button'
			}
		});
		const button = getByTestId('roll-button');
		const hint = getByTestId('roll-modifier');
		expect(hint.textContent.trim()).toBe('Lucid · two dice, keep the higher');
		expect(hint.classList.contains('lucid')).toBe(true);
		expect(hint.querySelector('svg')).toBeTruthy(); // the HUD's arrow
		expect(button.contains(hint)).toBe(false);
		// The button's name is its visible label; the hint describes it
		expect(button.getAttribute('aria-label')).toBe('Roll for Stability');
		expect(button.getAttribute('aria-describedby')).toBe(hint.id);
	});

	it('colours a Surreal hint as Surreal', () => {
		const { getByTestId } = render(StepAction, {
			props: {
				text: 'Roll for Salvation',
				hint: 'Surreal · two dice, keep the lower',
				testid: 'roll-button'
			}
		});
		expect(getByTestId('roll-modifier').classList.contains('surreal')).toBe(true);
	});

	it('keeps the hint line, empty and hidden, without a hint, so nothing moves', () => {
		const { getByTestId, queryByTestId } = render(StepAction, {
			props: { text: 'Draw the next card', testid: 'next-button' }
		});
		const hint = getByTestId('roll-modifier');
		expect(hint.classList.contains('empty')).toBe(true);
		expect(hint.getAttribute('aria-hidden')).toBe('true');
		expect(hint.textContent.trim()).toBe('');
		expect(getByTestId('next-button').hasAttribute('aria-describedby')).toBe(false);
		expect(queryByTestId('state-chip')).toBeNull();
		expect(getByTestId('next-button').textContent.trim()).toBe('Draw the next card');
	});

	it('disables the button when asked', () => {
		const { getByTestId } = render(StepAction, {
			props: { text: 'Draw the cards', disabled: true, testid: 'deal-button' }
		});
		expect(getByTestId('deal-button').disabled).toBe(true);
	});

	it('marks a button that has just changed meaning', () => {
		const { container } = render(StepAction, {
			props: { text: 'Draw the next card', changed: true, testid: 'c-button' }
		});
		expect(container.querySelector('.step-action.changed')).not.toBeNull();
	});

	it('draws a line inside the button that runs out while the game is about to move on', () => {
		const { getByTestId, container } = render(StepAction, {
			props: {
				text: 'Open your journal',
				advancing: true,
				advanceProgress: () => 0.25,
				testid: 'c-button'
			}
		});
		const line = getByTestId('step-advance');
		expect(getByTestId('c-button').contains(line)).toBe(true);
		expect(line.style.transform).toBe('scaleX(0.75)'); // what is left of the hold
		expect(line.getAttribute('aria-hidden')).toBe('true');
		expect(line.classList.contains('paused')).toBe(false);
		// Decorative only: the label and accessible name are unchanged
		expect(getByTestId('c-button').getAttribute('aria-label')).toBe('Open your journal');
		expect(container.querySelector('.label-main').textContent).toBe('Open your journal');
	});

	it('shows a full, dim line while the hold waits for the voice', () => {
		const { getByTestId } = render(StepAction, {
			props: {
				text: 'Draw the cards',
				advancing: true,
				advanceWaiting: true,
				advanceProgress: () => 0,
				testid: 'd-button'
			}
		});
		const line = getByTestId('step-advance');
		expect(line.classList.contains('waiting')).toBe(true);
		expect(line.style.transform).toBe('scaleX(1)');
	});

	it('stops the line while paused, and has none when nothing is pending', async () => {
		const { getByTestId, queryByTestId, rerender } = render(StepAction, {
			props: { text: 'Go to Salvation', advancing: true, advancePaused: true, testid: 'c-button' }
		});
		expect(getByTestId('step-advance').classList.contains('paused')).toBe(true);
		await rerender({ text: 'Go to Salvation', advancing: false, testid: 'c-button' });
		expect(queryByTestId('step-advance')).toBeNull();
	});
});
