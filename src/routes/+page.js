/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
    const data = await fetch('/games/index.json').then(res => res.json());
    if (data) {
        return {
            games: data.games || []
        };
    } else {
        console.error("Failed to load games data");
    }
    return { games: [] };
};

export const prerender = false;
export const ssr = false;
export const csr = true;
