import { describe, it, expect } from 'vitest';
import { isPublicPath } from './publicPaths.js';

describe('isPublicPath', () => {
	it.each(['/', '/game/x', '/game/custom/x', '/aboutx', '/signinx', '/authx', '/games'])(
		'protects %s',
		(p) => expect(isPublicPath(p)).toBe(false)
	);

	it.each([
		'/signin',
		'/auth/callback/google',
		'/auth/signin/google',
		'/about',
		'/how-to',
		'/_app/immutable/x.js'
	])('allows %s', (p) => expect(isPublicPath(p)).toBe(true));
});
