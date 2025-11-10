import { test, expect } from '@playwright/test';

// Test against preview (production) build
test.use({ baseURL: 'http://localhost:4173' });

test('Preview - home page test', async ({ page }) => {
	console.log('Testing against production build...');

	await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 });
	console.log('Navigation completed');

	const content = await page.content();
	console.log(`Page has ${content.length} characters of HTML`);

	expect(content).toContain('Dimm City');
});

test('Preview - game page test', async ({ page }) => {
	console.log('Testing game page against production build...');

	await page.goto('/game/future-lost', { waitUntil: 'networkidle', timeout: 15000 });
	console.log('Game navigation completed');

	const content = await page.content();
	console.log(`Game page has ${content.length} characters of HTML`);

	expect(content.length).toBeGreaterThan(0);
});
