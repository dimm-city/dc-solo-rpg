/** @type {import('./$types').LayoutLoad} */
export async function load() {

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
    return {
       
    };
}