/**
 * Svelte action: tell a scroller's owner whether more content lies above or below its visible
 * part, on scroll and whenever it or its content changes size. The journal's round list uses it
 * for its "more below" cue (visual-layout-s-10), the card story's cue in the same terms, and the
 * final log's timeline for the same cue and a fade at its top once scrolled (game-copy-s-15).
 *
 * @param {HTMLElement} node - The scrolling element
 * @param {(edges: { above: boolean, below: boolean }) => void} onchange
 */
export function scrollEdges(node, onchange) {
	let callback = onchange;
	const update = () => {
		callback?.({
			above: node.scrollTop > 2,
			below: node.scrollTop + node.clientHeight < node.scrollHeight - 2
		});
	};
	node.addEventListener('scroll', update, { passive: true });
	const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
	observer?.observe(node);
	for (const child of node.children) observer?.observe(child);
	update();
	return {
		update(next) {
			callback = next;
			update();
		},
		destroy() {
			node.removeEventListener('scroll', update);
			observer?.disconnect();
		}
	};
}
