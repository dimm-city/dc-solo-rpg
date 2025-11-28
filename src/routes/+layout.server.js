/** @type {import('./$types').LayoutServerLoad} */
export async function load(event) {
	const session = await event.locals.auth();
	console.log("Layout Server Load - Session:", session);
	return {
		session
	};
}
