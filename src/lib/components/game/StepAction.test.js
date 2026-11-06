/**
 * The screen controllers must use the composable instance owned by GameScreen.
 * When each controller created its own instance, GameScreen's table-tap handler
 * held a separate copy that never saw the button's roll, so tapping the table
 * after rolling started a second roll and replaced the result.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { gameState } from '../../stores/gameStore.svelte.js';
import { render, fireEvent } from '@testing-library/svelte';
import RollForTasksController from './RollForTasksController.svelte';
import FailureCheckController from './FailureCheckController.svelte';
import SuccessCheckController from './SuccessCheckController.svelte';
import InitialDamageController from './InitialDamageController.svelte';
import StartRoundController from './StartRoundController.svelte';
import StepAction from './StepAction.svelte';

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

describe('StepAction', () => {
	beforeEach(() => {
		gameState.isLucid = false;
		gameState.isSurreal = false;
	});

	it('shows a Lucid chip before the player rolls', () => {
		gameState.isLucid = true;
		const { getByTestId } = render(StepAction, {
			props: { text: 'Roll', onclick: vi.fn(), testid: 'x-button' }
		});
		expect(getByTestId('state-chip').textContent).toContain('Lucid');
	});

	it('shows a Surreal chip and no chip otherwise', () => {
		gameState.isSurreal = true;
		const first = render(StepAction, { props: { text: 'Roll', testid: 'a-button' } });
		expect(first.getByTestId('state-chip').textContent).toContain('Surreal');
		first.unmount();

		gameState.isSurreal = false;
		const second = render(StepAction, { props: { text: 'Roll', testid: 'b-button' } });
		expect(second.queryByTestId('state-chip')).toBeNull();
	});
});

describe('InitialDamageController and StartRoundController', () => {
	it('gives the initial roll a button that calls the shared handler', async () => {
		const shared = {
			buttonText: 'Roll for instability',
			rolling: false,
			handleInitialDamageRoll: vi.fn()
		};
		const { getByTestId } = render(InitialDamageController, {
			props: { initialDamage: shared }
		});
		const button = getByTestId('initial-damage-button');
		expect(button.textContent).toContain('Roll for instability');
		await fireEvent.click(button);
		expect(shared.handleInitialDamageRoll).toHaveBeenCalledTimes(1);
	});

	it('gives the round start a Begin Round button', async () => {
		gameState.round = 3;
		const onbegin = vi.fn();
		const { getByTestId } = render(StartRoundController, { props: { onbegin } });
		const button = getByTestId('start-round-button');
		expect(button.textContent).toContain('Begin Round 3');
		await fireEvent.click(button);
		expect(onbegin).toHaveBeenCalledTimes(1);
	});
});
