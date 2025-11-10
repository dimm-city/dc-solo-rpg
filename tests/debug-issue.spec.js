import { test, expect } from '@playwright/test';

test.describe('Debug Issue - Intercept Fragment Button', () => {
	test('should reproduce the intercept fragment error', async ({ page }) => {
		// Set viewport to desktop size
		await page.setViewportSize({ width: 1280, height: 720 });

		// Go to the page
		await page.goto('http://localhost:3000');
		await page.screenshot({ path: '/tmp/test-screenshots/01-initial-load.png', fullPage: true });

		// Select game and player
		await page.selectOption('select#gameSelect', { index: 1 });
		await page.selectOption('select#player', { index: 1 });
		await page.click('button:has-text("Load Game")');

		await page.waitForTimeout(1000);
		await page.screenshot({ path: '/tmp/test-screenshots/02-after-load.png', fullPage: true });

		// Wait for intro screen and go through it
		await page.waitForSelector('button:has-text("continue")', { timeout: 5000 });
		await page.click('button:has-text("continue")');
		await page.waitForTimeout(500);
		
		// Click start button after intro
		await page.waitForSelector('button:has-text("start")', { timeout: 5000 });
		await page.click('button:has-text("start")');
		await page.waitForTimeout(1000);
		await page.screenshot({ path: '/tmp/test-screenshots/03-after-intro.png', fullPage: true });

		// Roll for tasks
		await page.waitForSelector('.dc-dice-roller-container', { timeout: 5000 });
		await page.click('.dc-dice-roller-container');
		await page.waitForTimeout(2000);
		await page.screenshot({ path: '/tmp/test-screenshots/04-after-roll.png', fullPage: true });

		// Click dice again to confirm
		await page.click('.dc-dice-roller-container');
		await page.waitForTimeout(1000);
		await page.screenshot({ path: '/tmp/test-screenshots/05-before-intercept.png', fullPage: true });

		// Now click the intercept fragment button
		console.log('Looking for INTERCEPT FRAGMENT button');
		const interceptButton = await page.locator('button:has-text("INTERCEPT FRAGMENT")');
		await interceptButton.waitFor({ state: 'visible', timeout: 5000 });

		// Listen for console errors
		const errors = [];
		page.on('console', msg => {
			if (msg.type() === 'error') {
				console.error('Browser console error:', msg.text());
				errors.push(msg.text());
			}
		});

		page.on('pageerror', error => {
			console.error('Page error:', error.message);
			errors.push(error.message);
		});

		await page.screenshot({ path: '/tmp/test-screenshots/06-intercept-button-visible.png', fullPage: true });

		await interceptButton.click();
		console.log('Clicked INTERCEPT FRAGMENT button');

		await page.waitForTimeout(2000);
		await page.screenshot({ path: '/tmp/test-screenshots/07-after-intercept-click.png', fullPage: true });

		// Check for errors
		if (errors.length > 0) {
			console.error('Errors detected:', errors);
		}

		// Check if continue button appears
		const continueAfterCard = await page.locator('button:has-text("CONTINUE")');
		const isVisible = await continueAfterCard.isVisible({ timeout: 3000 }).catch(() => false);
		console.log('Continue button visible after intercept:', isVisible);

		await page.screenshot({ path: '/tmp/test-screenshots/08-final-state.png', fullPage: true });
	});

	test('should test mobile viewport layout', async ({ page }) => {
		// Test on mobile viewport
		await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

		await page.goto('http://localhost:3000');
		await page.screenshot({ path: '/tmp/test-screenshots/mobile-01-initial.png', fullPage: true });

		// Select game and player
		await page.selectOption('select#gameSelect', { index: 1 });
		await page.selectOption('select#player', { index: 1 });
		await page.click('button:has-text("Load Game")');

		await page.waitForTimeout(1000);
		await page.screenshot({ path: '/tmp/test-screenshots/mobile-02-after-load.png', fullPage: true });

		// Wait for intro screen and go through it
		await page.waitForSelector('button:has-text("continue")', { timeout: 5000 });
		await page.click('button:has-text("continue")');
		await page.waitForTimeout(500);
		
		// Click start button after intro
		await page.waitForSelector('button:has-text("start")', { timeout: 5000 });
		await page.click('button:has-text("start")');
		await page.waitForTimeout(1000);
		await page.screenshot({ path: '/tmp/test-screenshots/mobile-03-after-intro.png', fullPage: true });

		// Roll for tasks
		await page.waitForSelector('.dc-dice-roller-container', { timeout: 5000 });
		await page.click('.dc-dice-roller-container');
		await page.waitForTimeout(2000);
		await page.screenshot({ path: '/tmp/test-screenshots/mobile-04-after-roll.png', fullPage: true });

		// Click dice again to confirm
		await page.click('.dc-dice-roller-container');
		await page.waitForTimeout(1000);
		await page.screenshot({ path: '/tmp/test-screenshots/mobile-05-draw-card-screen.png', fullPage: true });

		// Check if the button is visible and properly sized
		const interceptButton = await page.locator('button:has-text("INTERCEPT FRAGMENT")');
		const isVisible = await interceptButton.isVisible({ timeout: 5000 });
		const boundingBox = await interceptButton.boundingBox();
		
		console.log('Intercept button visible on mobile:', isVisible);
		console.log('Button bounding box:', boundingBox);

		await page.screenshot({ path: '/tmp/test-screenshots/mobile-06-intercept-button.png', fullPage: true });
	});
});
