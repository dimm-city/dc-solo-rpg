import { test, expect } from '@playwright/test';

test('Complete game playthrough with screenshots', async ({ page }) => {
	// Navigate to home page
	await page.goto('http://localhost:5173/');
	await page.waitForSelector('.dc-game-selector', { timeout: 5000 });

	// Screenshot 1: Home page with game selector
	await page.screenshot({ path: 'screenshots/01-home-page.png', fullPage: true });
	console.log('Screenshot 1: Home page');

	// Select a game
	await page.selectOption('select[name="game"]', { label: 'Future Lost' });
	await page.screenshot({ path: 'screenshots/02-game-selected.png', fullPage: true });
	console.log('Screenshot 2: Game selected');

	// Start the game
	await page.click('button:has-text("Start Game")');
	await page.waitForSelector('.dc-game-container', { timeout: 5000 });
	await page.screenshot({ path: 'screenshots/03-options-screen.png', fullPage: true });
	console.log('Screenshot 3: Options screen');

	// Start game from options
	await page.click('button:has-text("Start Game")');
	await page.waitForTimeout(500);
	await page.screenshot({ path: 'screenshots/04-intro-screen.png', fullPage: true });
	console.log('Screenshot 4: Intro screen');

	// Skip intro and start round
	await page.click('button:has-text("start")');
	await page.waitForTimeout(1000);
	await page.screenshot({ path: 'screenshots/05-roll-for-tasks.png', fullPage: true });
	console.log('Screenshot 5: Roll for tasks screen');

	// Roll the dice
	await page.click('.dc-dice-roller-container');
	await page.waitForTimeout(2000); // Wait for dice animation
	await page.screenshot({ path: 'screenshots/06-dice-rolled.png', fullPage: true });
	console.log('Screenshot 6: Dice rolled result');

	// Confirm roll
	await page.click('.dc-dice-roller-container');
	await page.waitForTimeout(1000);
	await page.screenshot({ path: 'screenshots/07-draw-card-screen.png', fullPage: true });
	console.log('Screenshot 7: Draw card screen');

	// Draw a card
	await page.click('.dc-card-deck');
	await page.waitForTimeout(500);
	await page.screenshot({ path: 'screenshots/08-card-drawn.png', fullPage: true });
	console.log('Screenshot 8: Card drawn');

	// Confirm card (may trigger failure check or continue drawing)
	await page.click('.dc-card-deck');
	await page.waitForTimeout(1000);

	// Check current state and take appropriate screenshot
	const currentUrl = page.url();
	if (
		await page
			.locator('.dc-failure-check-container')
			.isVisible()
			.catch(() => false)
	) {
		await page.screenshot({ path: 'screenshots/09-failure-check.png', fullPage: true });
		console.log('Screenshot 9: Failure check screen');

		// Roll failure check
		await page.click('.dc-dice-roller-container');
		await page.waitForTimeout(2000);
		await page.screenshot({ path: 'screenshots/10-failure-result.png', fullPage: true });
		console.log('Screenshot 10: Failure check result');

		// Confirm failure check
		await page.click('.dc-dice-roller-container');
		await page.waitForTimeout(1000);
	}

	// Continue drawing cards until round is complete
	for (let i = 0; i < 5; i++) {
		try {
			if (await page.locator('.dc-card-deck').isVisible({ timeout: 1000 })) {
				await page.click('.dc-card-deck');
				await page.waitForTimeout(500);
				await page.click('.dc-card-deck');
				await page.waitForTimeout(1000);
			} else {
				break;
			}
		} catch (e) {
			break;
		}
	}

	// Should be at journal entry screen
	await page.waitForSelector('.dc-journal-container', { timeout: 5000 });
	await page.screenshot({ path: 'screenshots/11-journal-entry.png', fullPage: true });
	console.log('Screenshot 11: Journal entry screen');

	// Enter journal text
	await page.fill(
		'textarea',
		'This is my journal entry for round 1. The game is working perfectly with Svelte 5!'
	);
	await page.screenshot({ path: 'screenshots/12-journal-filled.png', fullPage: true });
	console.log('Screenshot 12: Journal entry filled');

	// Save journal
	await page.click('button:has-text("Save")');
	await page.waitForTimeout(1000);
	await page.screenshot({ path: 'screenshots/13-success-check.png', fullPage: true });
	console.log('Screenshot 13: Success check screen');

	// Roll success check
	await page.click('.dc-dice-roller-container');
	await page.waitForTimeout(2000);
	await page.screenshot({ path: 'screenshots/14-success-result.png', fullPage: true });
	console.log('Screenshot 14: Success check result');

	// Confirm and continue to next round
	await page.click('.dc-dice-roller-container');
	await page.waitForTimeout(1500);
	await page.screenshot({ path: 'screenshots/15-next-round.png', fullPage: true });
	console.log('Screenshot 15: Next round starts');

	// Take a final screenshot showing the game state
	await page.screenshot({ path: 'screenshots/16-game-in-progress.png', fullPage: true });
	console.log('Screenshot 16: Game in progress');

	console.log('\\n✅ All screenshots captured successfully!');
});
