import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { handle as authHandle } from './auth.js';
import { isPublicPath } from '$lib/auth/publicPaths.js';

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

export const handle = sequence(authHandle, authorize);
