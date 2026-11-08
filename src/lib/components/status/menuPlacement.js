/**
 * Where the header's ⋯ menu opens (OWN-3): on the side of its button with more room, right
 * edges aligned, 6px from the button. Docked at the bottom of a phone's screen, the bar's menu
 * opens upward; at the top, downward.
 *
 * @param {{ top: number, bottom: number, right: number }} rect - The ⋯ button's client rect
 * @param {{ innerWidth: number, innerHeight: number }} viewport
 * @returns {{ top?: number, bottom?: number, right: number }} Fixed-position offsets in px
 */
export function menuPlacement(rect, { innerWidth, innerHeight }) {
	const GAP = 6;
	const right = innerWidth - rect.right;
	const roomBelow = innerHeight - rect.bottom;
	return roomBelow >= rect.top
		? { top: rect.bottom + GAP, bottom: undefined, right }
		: { top: undefined, bottom: innerHeight - rect.top + GAP, right };
}
