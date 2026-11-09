import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { readFileSync } from 'fs';
import { join } from 'path';
import GameSourcesSection from './GameSourcesSection.svelte';
import { getGameSources, resetGameSources } from '../../stores/gameSources.svelte.js';
import { logger } from '../../utils/logger.js';

const gameMarkdown = readFileSync(
	join(process.cwd(), 'static', 'games', 'ghost-in-the-machine.game.md'),
	'utf-8'
);
const LISTING = 'https://api.github.com/repos/dimm-city/dc-solo-rpg/contents/static/games';
const RAW =
	'https://raw.githubusercontent.com/dimm-city/dc-solo-rpg/main/static/games/ghost-in-the-machine.game.md';

function stubGitHub(listing) {
	vi.stubGlobal(
		'fetch',
		vi.fn(async (url) => {
			if (url.startsWith(LISTING)) return listing();
			if (url === RAW) return new Response(gameMarkdown);
			return new Response('not here', { status: 404 });
		})
	);
}

async function addSource(text) {
	const input = screen.getByLabelText('Add a repository');
	await fireEvent.input(input, { target: { value: text } });
	await fireEvent.click(screen.getByRole('button', { name: 'Add repository' }));
	return input;
}

describe('GameSourcesSection', () => {
	beforeEach(() => {
		localStorage.clear();
		resetGameSources();
		vi.spyOn(logger, 'error').mockImplementation(() => {});
		vi.spyOn(logger, 'warn').mockImplementation(() => {});
		stubGitHub(() => new Response('not here', { status: 404 }));
	});
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('starts with a labelled field, a format hint and no repositories', () => {
		render(GameSourcesSection);
		expect(screen.getByRole('heading', { level: 3, name: 'Game sources' })).toBeInTheDocument();
		const input = screen.getByLabelText('Add a repository');
		expect(input).toHaveAttribute('placeholder', 'owner/repo');
		expect(document.getElementById('game-source-help').textContent).toMatch(/@branch/);
		expect(screen.getByText(/No repositories yet/)).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Refresh now' })).toBeNull();
	});

	it('shows one plain error line for a source it cannot read, and clears it on typing', async () => {
		render(GameSourcesSection);
		const input = await addSource('not a repository');
		expect(screen.getByRole('alert').textContent).toMatch(/^Use owner\/repo/);
		expect(input).toHaveAttribute('aria-invalid', 'true');
		expect(getGameSources()).toEqual([]);

		await fireEvent.input(input, { target: { value: 'dimm-city/' } });
		expect(screen.queryByRole('alert')).toBeNull();
		expect(input).not.toHaveAttribute('aria-invalid');
	});

	it('adds a repository, lists it while it is checked, then says what it holds', async () => {
		stubGitHub(
			() =>
				new Response(
					JSON.stringify([
						{
							name: 'ghost-in-the-machine.game.md',
							path: 'static/games/ghost-in-the-machine.game.md',
							sha: 'abc',
							type: 'file',
							download_url: RAW
						}
					]),
					{ status: 200, headers: { etag: '"e1"' } }
				)
		);
		render(GameSourcesSection);
		const input = await addSource(
			'https://github.com/dimm-city/dc-solo-rpg/tree/main/static/games'
		);

		expect(input.value).toBe('');
		const row = screen.getByTestId('game-source-dimm-city/dc-solo-rpg/static/games@main');
		expect(row.textContent).toContain('dimm-city/dc-solo-rpg/static/games');
		expect(row.textContent).toContain('@main');
		await waitFor(() => expect(row.textContent).toContain('1 game, checked just now.'));
		expect(screen.getByRole('button', { name: 'Refresh now' })).toBeEnabled();
		expect(
			screen.getByRole('button', { name: 'Remove dimm-city/dc-solo-rpg/static/games' })
		).toBeInTheDocument();
	});

	it('refuses a repository that is already listed', async () => {
		render(GameSourcesSection);
		await addSource('dimm-city/dc-solo-rpg');
		await addSource('Dimm-City/DC-Solo-RPG');
		expect(screen.getByRole('alert').textContent).toBe('That repository is already in your list.');
		expect(getGameSources()).toHaveLength(1);
	});

	it('says what went wrong under a source GitHub cannot serve, and removes it on Remove', async () => {
		render(GameSourcesSection);
		await addSource('nobody/nothing');
		const row = screen.getByTestId('game-source-nobody/nothing');
		await waitFor(() => expect(row.textContent).toMatch(/Not found on GitHub.*No games yet\./));

		await fireEvent.click(screen.getByRole('button', { name: 'Remove nobody/nothing' }));
		expect(screen.queryByTestId('game-source-nobody/nothing')).toBeNull();
		expect(getGameSources()).toEqual([]);
		expect(screen.getByText(/No repositories yet/)).toBeInTheDocument();
	});
});
