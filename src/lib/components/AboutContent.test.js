/**
 * Unit tests for AboutContent (the About text in the About modal and on /about)
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import AboutContent from './AboutContent.svelte';

describe('AboutContent', () => {
	it('keeps numerals and names whole at line ends (visual-layout-s-19)', () => {
		const { container } = render(AboutContent);

		// "52-card" never splits at its hyphen; a no-wrap span keeps the real hyphen in the web font
		const deck = [...container.querySelectorAll('.nobreak')].map((el) => el.textContent);
		expect(deck).toContain('52-card');

		// The licence name and the source game's title never split
		expect(container.textContent).toContain('CC\u00a0Attribution\u00a03.0\u00a0Unported');
		expect(container.textContent).toContain('The\u00a0Wretched');

		// No other numeral can end a line apart from the word after it
		const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
		const breakable = [];
		for (let node = walker.nextNode(); node; node = walker.nextNode()) {
			if (node.parentElement.closest('.nobreak')) continue;
			const pairs = node.textContent.match(/\b\d+[ \t\n-]+[A-Za-z]+/g);
			if (pairs) breakable.push(...pairs);
		}
		expect(breakable).toEqual([]);
	});
});
