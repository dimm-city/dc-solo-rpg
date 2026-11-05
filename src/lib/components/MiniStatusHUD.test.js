/**
 * Unit tests for MiniStatusHUD component
 * Tests the mini HUD that appears during card reveals
 *
 * Component is validated through build and Playwright integration tests
 */
import { flushSync } from 'svelte';
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/svelte';
import MiniStatusHUD from './MiniStatusHUD.svelte';
import { gameState } from '$lib/stores/gameStore.svelte.js';

describe('MiniStatusHUD', () => {
	beforeEach(() => {
		// Reset game state to known values
		gameState.tower = 20;
		gameState.kingsRevealed = 0;
		gameState.tokens = 10;
	});

	it('should not render when show prop is false', () => {
		const { container } = render(MiniStatusHUD, { props: { show: false } });
		expect(container.querySelector('.mini-status-hud')).toBeNull();
	});

	it('should render when show prop is true', () => {
		const { container } = render(MiniStatusHUD, { props: { show: true } });
		expect(container.querySelector('.mini-status-hud')).toBeTruthy();
	});

	it('should display tower value from game state', () => {
		gameState.tower = 42;
		const { container } = render(MiniStatusHUD, { props: { show: true } });
		const values = container.querySelectorAll('.value');
		expect(values[0].textContent).toBe('42');
	});

	it('should display kings revealed with format "X/4"', () => {
		gameState.kingsRevealed = 2;
		const { container } = render(MiniStatusHUD, { props: { show: true } });
		const values = container.querySelectorAll('.value');
		expect(values[1].textContent).toBe('2/4');
	});

	it('should display tokens value from game state', () => {
		gameState.tokens = 7;
		const { container } = render(MiniStatusHUD, { props: { show: true } });
		const values = container.querySelectorAll('.value');
		expect(values[2].textContent).toBe('7');
	});

	it('should always show exactly three stats (tower, kings, tokens)', () => {
		const { container } = render(MiniStatusHUD, { props: { show: true } });
		expect(container.querySelectorAll('.stat').length).toBe(3);
		expect(container.querySelectorAll('.value').length).toBe(3);
	});

	it('should have proper ARIA titles for accessibility', () => {
		const { container } = render(MiniStatusHUD, { props: { show: true } });
		const stats = container.querySelectorAll('.stat');
		expect(stats[0].getAttribute('title')).toBe('Tower (Health)');
		expect(stats[1].getAttribute('title')).toBe('Kings Revealed');
		expect(stats[2].getAttribute('title')).toBe('Tokens (Win Condition)');
	});

	it('should reactively update when game state changes', () => {
		const { container } = render(MiniStatusHUD, { props: { show: true } });

		// Initial values
		let values = container.querySelectorAll('.value');
		expect(values[0].textContent).toBe('20');

		// Change game state
		gameState.tower = 30;
		flushSync();

		// Should update
		values = container.querySelectorAll('.value');
		expect(values[0].textContent).toBe('30');
	});
});
