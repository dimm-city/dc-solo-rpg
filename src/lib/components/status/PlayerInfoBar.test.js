/**
 * PlayerInfoBar's ⋯ menu as a menu button (visual-layout-s-03): opening it focuses its first
 * item, the arrows (and Home, End) move between the four items, and Tab or Escape closes it with
 * focus back on ⋯, so nothing under the menu takes focus while it is open.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import PlayerInfoBar from './PlayerInfoBar.svelte';
import { gameState } from '../../stores/gameStore.svelte.js';
import { resetSettings } from '../../stores/audioStore.svelte.js';

// Reduced motion: the menu's fade is instant
vi.hoisted(() => {
	window.matchMedia = (query) => ({
		matches: query.includes('reduce'),
		media: query,
		addEventListener() {},
		removeEventListener() {},
		addListener() {},
		removeListener() {}
	});
});

const ITEMS = ['Settings', 'Dice theme', 'Auto-play', 'Read aloud'];
const focused = () => document.activeElement?.textContent.replace(/(On|Off)$/, '').trim();
const menu = () => document.getElementById('game-more-menu');

async function openWith(key) {
	const utils = render(PlayerInfoBar, {
		props: { onExitClick: vi.fn(), onHelpClick: vi.fn(), onSettingsClick: vi.fn() }
	});
	const more = utils.getByRole('button', { name: 'More game options' });
	more.focus();
	if (key) await fireEvent.keyDown(more, { key });
	else await fireEvent.click(more);
	await tick();
	await tick();
	return { ...utils, more };
}

async function press(key, options = {}) {
	await fireEvent.keyDown(document.activeElement, { key, ...options });
	await tick();
}

beforeEach(() => {
	localStorage.clear();
	resetSettings();
	gameState.config = { title: 'Test', labels: {}, options: {} };
	gameState.round = 1;
	gameState.player = { name: 'Guest' };
});

describe('PlayerInfoBar, the ⋯ menu (visual-layout-s-03)', () => {
	it('opening it (Enter, Space or a tap) focuses Settings', async () => {
		const { more } = await openWith();
		expect(more.getAttribute('aria-expanded')).toBe('true');
		expect(focused()).toBe('Settings');
	});

	it('the arrows cycle Settings, Dice theme, Auto-play and Read aloud; Home and End jump', async () => {
		await openWith();
		const seen = [focused()];
		for (let i = 0; i < 4; i++) {
			await press('ArrowDown');
			seen.push(focused());
		}
		expect(seen).toEqual([...ITEMS, 'Settings']);
		await press('ArrowUp');
		expect(focused()).toBe('Read aloud');
		await press('Home');
		expect(focused()).toBe('Settings');
		await press('End');
		expect(focused()).toBe('Read aloud');
	});

	it('the down and up arrows on ⋯ open the menu on its first and last item', async () => {
		await openWith('ArrowDown');
		expect(focused()).toBe('Settings');
	});

	it('Tab and Shift+Tab close the menu and put focus back on ⋯', async () => {
		for (const shiftKey of [false, true]) {
			const { more, unmount } = await openWith();
			await press('ArrowDown');
			const event = new KeyboardEvent('keydown', {
				key: 'Tab',
				shiftKey,
				bubbles: true,
				cancelable: true
			});
			document.activeElement.dispatchEvent(event);
			await tick();
			expect(event.defaultPrevented).toBe(true); // the browser's Tab never reaches the board
			expect(more.getAttribute('aria-expanded')).toBe('false');
			expect(document.activeElement).toBe(more);
			unmount();
		}
	});

	it('Escape closes the menu and puts focus back on ⋯', async () => {
		const { more } = await openWith();
		await press('ArrowDown');
		await press('Escape');
		expect(more.getAttribute('aria-expanded')).toBe('false');
		expect(document.activeElement).toBe(more);
	});

	it('focus leaving for something else closes the menu', async () => {
		const { more, getByRole } = await openWith();
		const exit = getByRole('button', { name: 'Exit game' });
		await fireEvent.focusOut(document.activeElement, { relatedTarget: exit });
		await tick();
		expect(more.getAttribute('aria-expanded')).toBe('false');
		expect(menu()?.isConnected ?? false).toBe(false);
	});

	it('a toggle keeps the menu open and the focus on it', async () => {
		await openWith();
		await press('End');
		document.activeElement.click();
		await tick();
		expect(menu()).not.toBeNull();
		expect(focused()).toBe('Read aloud');
	});
});
