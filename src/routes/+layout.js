/** @type {import('./$types').LayoutLoad} */
export async function load({ data }) {
	console.log('Layout Client Load - Data:', data);

	return data;
}
