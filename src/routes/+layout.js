/** @type {import('./$types').LayoutLoad} */
export async function load({data}) {
	
	console.log("Layout Client Load - Data:", data);

	const games = [
		{ title: 'Artful Detective', url: '/games/artful-detective' },
		{ title: 'Gnome Alone', url: '/games/gnome-alone' },
		{ title: 'Future Lost', url: '/games/future-lost/' },
		{ title: 'WAA Game Template', url: '/games/full-example' }
	];
	const players = [
		{
			name: 'Guest'
		}
	];
	return data;
}
