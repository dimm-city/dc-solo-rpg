import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { handle as authHandle } from './auth.js';
import { isPublicPath } from '$lib/auth/publicPaths.js';

// Google sign-in is turned off until there is an OAuth client for the deployed sites.
// Set to true to require it again (needs GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and AUTH_SECRET).
const REQUIRE_SIGN_IN = false;

/** @type {import('@sveltejs/kit').Handle} */
async function authorize({ event, resolve }) {
	const { pathname } = event.url;
	const session = await event.locals.auth();

	if (pathname === '/signin' && session?.user) {
		throw redirect(303, '/');
	}
	if (!session?.user && !isPublicPath(pathname)) {
		throw redirect(303, '/signin');
	}
	return resolve(event);
}

/** @type {import('@sveltejs/kit').Handle} */
const withoutAuth = ({ event, resolve }) => resolve(event);

export const handle = REQUIRE_SIGN_IN ? sequence(authHandle, authorize) : withoutAuth;
