/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
    const games = await fetch('/data/games').then(res => res.json());
    if (games) {
        return {
            games: games
        };
    } else {
        console.error("Failed to load games data");
    }
    return { games: [] };
};

export const prerender = false;
export const ssr = false;
export const csr = true;
