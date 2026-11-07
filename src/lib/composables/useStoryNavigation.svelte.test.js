/**
 * Story mode keys: arrows move between rounds, Escape leaves, and neither fires while a
 * dialog, a text field or a menu owns the keyboard (SM-03).
 */
/* global $effect -- runes compile in .svelte.test.js files */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { flushSync } from 'svelte';
import { useStoryNavigation, shouldIgnoreStoryKey } from './useStoryNavigation.svelte.js';

function press(key, target = window) {
	const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
	target.dispatchEvent(event);
	flushSync();
	return event;
}

describe('useStoryNavigation', () => {
	let cleanup;
	let nav;
	let onExit;

	beforeEach(() => {
		document.body.innerHTML = '';
		onExit = vi.fn();
		cleanup = $effect.root(() => {
			nav = useStoryNavigation(() => 3, onExit);
		});
		flushSync();
	});

	afterEach(() => cleanup());

	it('moves between rounds and records the direction', () => {
		expect(nav.currentRoundIndex).toBe(0);
		expect(nav.canGoPrevious).toBe(false);

		nav.nextRound();
		expect(nav.currentRoundIndex).toBe(1);
		expect(nav.direction).toBe(1);

		nav.previousRound();
		expect(nav.currentRoundIndex).toBe(0);
		expect(nav.direction).toBe(-1);

		nav.jumpToRound(2);
		expect(nav.currentRoundIndex).toBe(2);
		expect(nav.direction).toBe(1);
		expect(nav.canGoNext).toBe(false);
	});

	it('stays inside the story', () => {
		nav.previousRound();
		expect(nav.currentRoundIndex).toBe(0);
		nav.jumpToRound(7);
		expect(nav.currentRoundIndex).toBe(0);
		nav.jumpToRound(-1);
		expect(nav.currentRoundIndex).toBe(0);
	});

	it('handles the arrow keys and Escape on the page', () => {
		press('ArrowRight');
		expect(nav.currentRoundIndex).toBe(1);
		press('ArrowLeft');
		expect(nav.currentRoundIndex).toBe(0);
		press('Escape');
		expect(onExit).toHaveBeenCalledTimes(1);
	});

	it('leaves Escape and the arrows alone while a dialog is open', () => {
		const dialog = document.createElement('div');
		dialog.setAttribute('role', 'dialog');
		dialog.setAttribute('aria-modal', 'true');
		const button = document.createElement('button');
		dialog.append(button);
		document.body.append(dialog);

		press('Escape', button);
		press('ArrowRight', button);
		// Even a key that reaches the window from elsewhere is ignored while the dialog is up
		press('Escape');

		expect(onExit).not.toHaveBeenCalled();
		expect(nav.currentRoundIndex).toBe(0);
	});

	it('leaves the keys alone inside a text field', () => {
		const input = document.createElement('input');
		document.body.append(input);

		press('ArrowRight', input);
		press('Escape', input);

		expect(nav.currentRoundIndex).toBe(0);
		expect(onExit).not.toHaveBeenCalled();
	});

	it('removes its listener when story mode closes', () => {
		cleanup();
		press('Escape');
		expect(onExit).not.toHaveBeenCalled();
		cleanup = () => {};
	});
});

describe('shouldIgnoreStoryKey', () => {
	it('ignores keys another handler already used, and modified keys', () => {
		const handled = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
		handled.preventDefault();
		expect(shouldIgnoreStoryKey(handled, document)).toBe(true);
		expect(
			shouldIgnoreStoryKey(new KeyboardEvent('keydown', { key: 'ArrowLeft', altKey: true }))
		).toBe(true);
	});

	it('lets a plain key on the page through', () => {
		document.body.innerHTML = '';
		const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
		expect(shouldIgnoreStoryKey(event, document)).toBe(false);
	});
});
