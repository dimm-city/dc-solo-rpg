// spec: tests/home-page-test-plan.md

import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { openHomePage } from './helpers';

/**
 * Uploading a file that is not a game (CP-1-13): each error toast says what is wrong in plain
 * words and what to do next, with no "Error:", "Failed" or "Parser" prefix. It is an alert,
 * stays at least 10 seconds and can be dismissed.
 */

const GAME = readFileSync(
	new URL('../static/games/ghost-in-the-machine.game.md', import.meta.url),
	'utf8'
);

async function upload(page: Page, name: string, text: string) {
	await page.locator('input[type="file"]').setInputFiles({
		name,
		mimeType: 'text/markdown',
		buffer: Buffer.from(text)
	});
	const toast = page.getByRole('alert').locator('.home-toast');
	await expect(toast).toBeVisible();
	return toast;
}

test.describe('Upload errors', () => {
	test.beforeEach(async ({ page }) => {
		await openHomePage(page);
	});

	const cases = [
		{
			what: 'a file of the wrong type',
			name: 'notes.txt',
			text: 'Just notes',
			copy: 'Choose a file that ends in .game.md.'
		},
		{
			what: 'a game file with no frontmatter',
			name: 'broken.game.md',
			text: '# A game\n\nNo frontmatter here.',
			copy: "Couldn't add “broken.game.md”: it doesn't start with a --- block. Fix the file and upload it again."
		},
		{
			what: 'a game file with a bad card line',
			name: 'typo.game.md',
			text: GAME.replace('### Challenge', '### Chalenge'),
			copy: "Couldn't add “typo.game.md”: it isn't a valid game file. Fix the file and upload it again."
		}
	];

	for (const { what, name, text, copy } of cases) {
		test(`says plainly what is wrong with ${what}`, async ({ page }) => {
			const toast = await upload(page, name, text);
			await expect(toast).toHaveText(copy);
			await expect(toast).not.toContainText(/Error:|Failed|Parser/);
		});
	}

	test('an error toast stays at least 10 seconds, and can be dismissed', async ({ page }) => {
		const toast = await upload(page, 'notes.txt', 'Just notes');
		await page.waitForTimeout(9000);
		await expect(toast).toBeVisible();
		await toast.getByRole('button', { name: 'Dismiss' }).click();
		await expect(toast).toHaveCount(0);
	});

	test('a game file that parses is added, its title in curly quotes', async ({ page }) => {
		await page.locator('input[type="file"]').setInputFiles({
			name: 'night-archive.game.md',
			mimeType: 'text/markdown',
			buffer: Buffer.from(GAME.replace(/^title: .*$/m, 'title: The Night Archive'))
		});
		await expect(page.getByRole('status').locator('.home-toast')).toHaveText(
			'Added “The Night Archive”'
		);
		await expect(page.getByTestId('game-card-night-archive')).toBeVisible();
	});
});
