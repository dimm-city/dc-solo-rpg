/**
 * Shared HUD helpers: Stability tiers, the Aces summary and the 2d20 badge and caption.
 * Pure functions, so the HUD cells and their tests agree.
 */

export const MAX_STABILITY = 20;

/**
 * Stability tier: steady (16-20), caution (11-15), danger (5-10), critical (4 or less).
 * @param {number} stability
 * @returns {'steady'|'caution'|'danger'|'critical'}
 */
export function stabilityTier(stability) {
	if (stability <= 4) return 'critical';
	if (stability <= 10) return 'danger';
	if (stability <= 15) return 'caution';
	return 'steady';
}

/**
 * Describe a 2d20 roll, e.g. "high of 15, 6". Returns null when the dice are
 * unknown or the kept die does not match the displayed roll.
 * @param {{rolls:number[], isLucid:boolean, isSurreal:boolean, finalValue:number}|null} last
 * @param {number} shown The roll shown in the HUD
 */
export function describeTwoDiceRoll(last, shown) {
	if (!last || last.rolls?.length !== 2 || last.finalValue !== shown) return null;
	if (!last.isLucid && !last.isSurreal) return null;
	return `${last.isLucid ? 'high' : 'low'} of ${last.rolls[0]}, ${last.rolls[1]}`;
}

/** Salvation needs this roll or better for 1-3 Aces; 4 Aces succeed on their own */
const SALVATION_NEED = { 1: '17+', 2: '14+', 3: '11+', 4: 'auto' };

/**
 * What the Aces mean for Salvation, e.g. { count: 2, need: '14+' }.
 * `need` is null before the first Ace (no Salvation threshold yet) and 'auto' at 4.
 * Mirrors getSalvationThreshold() in services/d20Mechanics.js.
 * @param {number} aces Aces revealed (0-4)
 * @returns {{count:number, need:string|null}}
 */
export function acesSummary(aces) {
	const count = Math.max(0, Math.min(4, aces || 0));
	return { count, need: SALVATION_NEED[count] ?? null };
}

/**
 * The 2d20 badge for the next roll: "2d20↑" while Lucid (keep the higher), "2d20↓" while
 * Surreal (keep the lower), null otherwise. Lucid/Surreal applies to the next d20 roll,
 * whichever roll that is.
 * @param {{isLucid?:boolean, isSurreal?:boolean}} state
 * @returns {{kind:'lucid'|'surreal', text:string, label:string}|null}
 */
export function rollBadge({ isLucid, isSurreal }) {
	if (isLucid) {
		return {
			kind: 'lucid',
			text: '2d20↑',
			label: 'Lucid: your next roll uses two d20 and keeps the higher'
		};
	}
	if (isSurreal) {
		return {
			kind: 'surreal',
			text: '2d20↓',
			label: 'Surreal: your next roll uses two d20 and keeps the lower'
		};
	}
	return null;
}
