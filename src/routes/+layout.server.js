/** @type {import('./$types').LayoutServerLoad} */
export async function load(event) {
	// locals.auth only exists when sign-in is enabled (see REQUIRE_SIGN_IN in hooks.server.js)
	const session = (await event.locals.auth?.()) ?? null;
	return {
		session
	};
}
