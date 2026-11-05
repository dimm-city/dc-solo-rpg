/**
 * Shared HUD helpers: Stability tiers and the 2d20 roll caption.
 * Pure functions so the desktop panel and the compact phone HUD agree.
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
