/**
 * The screen controllers must use the composable instance owned by GameScreen.
 * When each controller created its own instance, GameScreen's table-tap handler
 * held a separate copy that never saw the button's roll, so tapping the table
 * after rolling started a second roll and replaced the result.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import RollForTasksController from './RollForTasksController.svelte';
import FailureCheckController from './FailureCheckController.svelte';
import SuccessCheckController from './SuccessCheckController.svelte';

const cases = [
	{
		name: 'RollForTasksController',
		Component: RollForTasksController,
		prop: 'rollForTasks',
		handler: 'handleRollForTasks',
		disabledKey: 'buttonDisabled',
		testid: 'roll-tasks-button'
	},
	{
		name: 'FailureCheckController',
		Component: FailureCheckController,
		prop: 'failureCheck',
		handler: 'handleFailureCheck',
		disabledKey: 'rolling',
		testid: 'failure-check-button'
	},
	{
		name: 'SuccessCheckController',
		Component: SuccessCheckController,
		prop: 'successCheck',
		handler: 'handleSuccessCheck',
		disabledKey: 'rolling',
		testid: 'success-check-button'
	}
];

describe.each(cases)('$name', ({ Component, prop, handler, disabledKey, testid }) => {
	it('renders its button from the shared instance and calls its handler', async () => {
		const shared = { buttonText: 'SHARED STATE', [disabledKey]: false, [handler]: vi.fn() };
		const triggerAutoPlay = vi.fn();
		const { getByTestId } = render(Component, { props: { [prop]: shared, triggerAutoPlay } });

		const button = getByTestId(testid);
		expect(button.textContent).toContain('SHARED STATE');

		await fireEvent.click(button);
		expect(shared[handler]).toHaveBeenCalledTimes(1);
		expect(shared[handler]).toHaveBeenCalledWith(triggerAutoPlay);
	});

	it('disables its button while the shared instance is rolling', () => {
		const shared = { buttonText: 'ROLLING', [disabledKey]: true, [handler]: vi.fn() };
		const { getByTestId } = render(Component, { props: { [prop]: shared } });

		expect(getByTestId(testid).disabled).toBe(true);
	});
});
