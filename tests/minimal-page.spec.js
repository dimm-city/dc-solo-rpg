import { test, expect } from '@playwright/test';

test('Minimal hello world page', async ({ page }) => {
	console.log('Testing minimal page...');

	await page.goto('/test', { waitUntil: 'domcontentloaded', timeout: 15000 });
	console.log('Navigation completed');

	const content = await page.textContent('h1');
	console.log(`Page heading: ${content}`);

	expect(content).toBe('Hello World');
});
