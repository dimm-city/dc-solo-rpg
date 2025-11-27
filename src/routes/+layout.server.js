/** @type {import('./$types').LayoutServerLoad} */
export async function load(event) {
	const session = await event.locals.auth();

	return {
		session
	};
}
