import { test, expect } from '@playwright/test';

test('Simply navigate to home page', async ({ page }) => {
	console.log('Attempting to navigate to home...');
	await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 10000 });
	console.log('Navigation completed');

	await page.waitForTimeout(2000);
	console.log('Waited 2 seconds');

	const title = await page.title();
	console.log(`Page title: ${title}`);

	expect(title).toBeTruthy();
});

test('Simply navigate to game page', async ({ page }) => {
	console.log('Attempting to navigate to game...');
	await page.goto('/game/future-lost', { waitUntil: 'domcontentloaded', timeout: 10000 });
	console.log('Navigation completed');

	await page.waitForTimeout(2000);
	console.log('Waited 2 seconds');

	const title = await page.title();
	console.log(`Page title: ${title}`);

	expect(title).toBeTruthy();
});
