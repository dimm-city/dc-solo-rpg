import { redirect } from '@sveltejs/kit';
import { signIn } from '../../auth.js';

/**
 * While sign-in is off (REQUIRE_SIGN_IN in hooks.server.js), locals.auth is not set and there is
 * nothing to sign in to, so /signin goes straight back to the games.
 * @type {import('./$types').PageServerLoad}
 */
export function load({ locals }) {
	if (!locals.auth) redirect(307, '/');
	return {};
}

export const actions = { default: signIn };
