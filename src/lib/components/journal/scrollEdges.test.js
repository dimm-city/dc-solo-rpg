/**
 * scrollEdges (visual-layout-s-10): the journal's round list shows its "more below" cue while
 * rows remain below the scroll edge, and drops it at the end of the list.
 */
import { describe, it, expect, vi } from 'vitest';
import { scrollEdges } from './scrollEdges.js';

/** A scroller of the given heights (jsdom does no layout) */
function scroller({ clientHeight, scrollHeight, scrollTop = 0 }) {
	const node = document.createElement('ul');
	Object.defineProperty(node, 'clientHeight', { configurable: true, get: () => clientHeight });
	Object.defineProperty(node, 'scrollHeight', { configurable: true, get: () => scrollHeight });
	node.scrollTop = scrollTop;
	Object.defineProperty(node, 'scrollTop', {
		configurable: true,
		get: () => scrollTop,
		set: (v) => {
			scrollTop = v;
		}
	});
	return node;
}

describe('scrollEdges', () => {
	it('reports more below while rows are hidden, and none at the end of the list', () => {
		const node = scroller({ clientHeight: 180, scrollHeight: 300 });
		const onchange = vi.fn();
		const action = scrollEdges(node, onchange);
		expect(onchange).toHaveBeenLastCalledWith({ above: false, below: true });

		node.scrollTop = 60;
		node.dispatchEvent(new Event('scroll'));
		expect(onchange).toHaveBeenLastCalledWith({ above: true, below: true });

		node.scrollTop = 120; // the last row's bottom edge is in view
		node.dispatchEvent(new Event('scroll'));
		expect(onchange).toHaveBeenLastCalledWith({ above: true, below: false });
		action.destroy();
	});

	it('reports nothing hidden when the whole list fits', () => {
		const onchange = vi.fn();
		scrollEdges(scroller({ clientHeight: 300, scrollHeight: 300 }), onchange);
		expect(onchange).toHaveBeenLastCalledWith({ above: false, below: false });
	});

	it('stops listening once destroyed', () => {
		const node = scroller({ clientHeight: 100, scrollHeight: 300 });
		const onchange = vi.fn();
		scrollEdges(node, onchange).destroy();
		onchange.mockClear();
		node.dispatchEvent(new Event('scroll'));
		expect(onchange).not.toHaveBeenCalled();
	});
});
