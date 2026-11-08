import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseGameFile } from '../../parsers/markdownParser.js';
import { storyHtml, storyPlain } from './storyText.js';

describe('storyHtml', () => {
	it('draws _word_ and *word* as italic, with no marker left', () => {
		const story =
			"Not with mercy—it just _ends_, like a switch flipping. You're _using_ it. *Run.*";
		const html = storyHtml(story);
		expect(html).toBe(
			"Not with mercy—it just <em>ends</em>, like a switch flipping. You're <em>using</em> it. <em>Run.</em>"
		);
		expect(html).not.toMatch(/[_*]/);
	});

	it('draws **word** and __word__ as bold, and italic inside bold', () => {
		expect(storyHtml('**Stop.** __Now__')).toBe('<strong>Stop.</strong> <strong>Now</strong>');
		expect(storyHtml('**not _yet_**')).toBe('<strong>not <em>yet</em></strong>');
	});

	it('leaves a marker inside a word, or one that is not closed, as text', () => {
		expect(storyHtml('snake_case_name and 2*3*4')).toBe('snake_case_name and 2*3*4');
		expect(storyHtml('a lone _ and * here')).toBe('a lone _ and * here');
		expect(storyHtml('_ spaced _')).toBe('_ spaced _');
	});

	it('keeps emphasis to one line, and turns line breaks into <br>', () => {
		expect(storyHtml('_one_\n\n_two_')).toBe('<em>one</em><br><br><em>two</em>');
		expect(storyHtml('_open\nclose_')).toBe('_open<br>close_');
	});

	it('shows HTML in a story as text, never as markup', () => {
		const html = storyHtml('<img src=x onerror="alert(1)"> & _so_');
		expect(html).toBe('&lt;img src=x onerror="alert(1)"&gt; &amp; <em>so</em>');
	});

	it('is empty for no story', () => {
		expect(storyHtml(null)).toBe('');
		expect(storyHtml('')).toBe('');
	});
});

describe('storyPlain', () => {
	it('drops the markers and keeps the words', () => {
		expect(storyPlain("it just _ends_. You're *using* it. **Run**")).toBe(
			"it just ends. You're using it. Run"
		);
		expect(storyPlain('snake_case')).toBe('snake_case');
		expect(storyPlain(undefined)).toBe('');
	});
});

describe('the shipped games', () => {
	it('leave no emphasis marker in any rendered story', () => {
		let emphasised = 0;
		for (const slug of ['ghost-in-the-machine', 'future-lost']) {
			const text = readFileSync(`static/games/${slug}.game.md`, 'utf8');
			const game = parseGameFile(text);
			for (const card of game.deck) {
				const html = storyHtml(card.story);
				emphasised += (html.match(/<em>/g) ?? []).length;
				expect(html, `${slug} ${card.card} ${card.suit}`).not.toMatch(/(^|[\s>(—-])[_*]\S/);
				expect(html, `${slug} ${card.card} ${card.suit}`).not.toMatch(/\S[_*]($|[\s<.,;:!?)—-])/);
			}
		}
		// Every run in Ghost in the Machine's stories (40, on 39 lines), drawn in italic
		expect(emphasised).toBe(40);
	});

	it("draws the Ace of Hearts' 'ends' and 'using' in italic", () => {
		const text = readFileSync('static/games/ghost-in-the-machine.game.md', 'utf8');
		const ace = parseGameFile(text).deck.find((c) => c.type === 'primary-success');
		const html = storyHtml(ace.story);
		expect(html).toContain('just <em>ends</em>, like');
		expect(html).toContain('<em>using</em> it.');
	});
});
