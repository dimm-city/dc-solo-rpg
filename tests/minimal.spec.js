import { test, expect } from '@playwright/test';

test('Minimal home page test', async ({ page }) => {
	console.log('Starting test...');

	await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
	console.log('Navigation completed');

	// Try to get page content instead of title
	const content = await page.content();
	console.log(`Page has ${content.length} characters of HTML`);

	expect(content).toContain('Dimm City');
});

test('Minimal game page test', async ({ page }) => {
	console.log('Starting game test...');

	await page.goto('/game/future-lost', { waitUntil: 'networkidle', timeout: 15000 });
	console.log('Game navigation completed');

	const content = await page.content();
	console.log(`Game page has ${content.length} characters of HTML`);

	expect(content.length).toBeGreaterThan(0);
});
