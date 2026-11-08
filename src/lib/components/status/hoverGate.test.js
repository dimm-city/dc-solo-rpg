/**
 * Hover styles only where a pointer can hover (visual-layout-s-11).
 *
 * On touch, a tap leaves :hover stuck on the element until the next tap elsewhere, so an ungated
 * hover rule makes the step button's frame (and the toolbar's light) follow the last tap instead
 * of the game state. Every :hover rule in these components sits inside
 * `@media (hover: hover) and (pointer: fine)`; the only exception is the reduced-motion block,
 * which only takes the movement away.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const FILES = [
	'src/lib/components/AugmentedButton.svelte',
	'src/lib/components/status/PlayerInfoBar.svelte'
];

/** Every rule's selector with the at-rule conditions it sits inside */
function rules(css) {
	const out = [];
	const stack = [];
	let buf = '';
	for (const ch of css.replace(/\/\*[\s\S]*?\*\//g, '')) {
		if (ch === '{') {
			const head = buf.trim();
			buf = '';
			if (head.startsWith('@')) stack.push({ at: head });
			else {
				out.push({ selector: head, within: stack.filter((s) => s.at).map((s) => s.at) });
				stack.push({});
			}
		} else if (ch === '}') {
			stack.pop();
			buf = '';
		} else if (ch === ';') buf = '';
		else buf += ch;
	}
	return out;
}

const style = (file) => readFileSync(file, 'utf8').match(/<style>([\s\S]*?)<\/style>/)[1];

describe('hover gating', () => {
	for (const file of FILES) {
		it(`${file}: every :hover rule is for pointer devices only`, () => {
			const hovers = rules(style(file)).filter((r) => r.selector.includes(':hover'));
			expect(hovers.length).toBeGreaterThan(0);
			for (const r of hovers) {
				const gated = r.within.some(
					(at) =>
						/\(hover:\s*hover\)\s*and\s*\(pointer:\s*fine\)/.test(at) ||
						/prefers-reduced-motion:\s*reduce/.test(at)
				);
				expect(gated, `${r.selector} is not inside @media (hover: hover) and (pointer: fine)`).toBe(
					true
				);
			}
		});
	}

	it('the parser sees an ungated rule', () => {
		const found = rules(
			'.a:hover { color: red; } @media (hover: hover) and (pointer: fine) { .b:hover { color: red; } }'
		);
		expect(found).toEqual([
			{ selector: '.a:hover', within: [] },
			{ selector: '.b:hover', within: ['@media (hover: hover) and (pointer: fine)'] }
		]);
	});
});
