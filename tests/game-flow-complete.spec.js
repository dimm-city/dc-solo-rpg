import { test, expect } from '@playwright/test';

/**
 * Test that verifies the complete game flow works correctly
 */
test('Complete game flow - single round', async ({ page }) => {
	console.log('\n🎮 TESTING COMPLETE GAME FLOW\n');

	// Navigate to home and select game
	await page.goto('/');
	await page.selectOption('select#gameSelect', { label: 'Future Lost' });
	await page.click('button:has-text("Load Game")');
	await page.waitForURL('**/game/future-lost');
	console.log('✓ Game loaded');

	// Go through intro
	await page.click('button:has-text("continue")');
	await page.waitForTimeout(500);
	await page.click('button:has-text("start")');
	await page.waitForSelector('.dc-dice-roller-container', { timeout: 5000 });
	console.log('✓ Game started');

	// ROUND 1
	console.log('\nROUND 1:');
	
	// Roll for tasks
	await page.click('.dc-dice-roller-container');
	await page.waitForTimeout(2500);
	await page.click('.dc-dice-roller-container');
	
	// Wait for card interface to appear with longer timeout
	await page.waitForSelector('.neural-cta:has-text("INTERCEPT")', { timeout: 10000 });
	console.log('  ✓ Rolled for tasks');

	// Draw all cards
	let cardsDrawn = 0;
	for (let i = 0; i < 10; i++) {
		const interceptVisible = await page.locator('.neural-cta:has-text("INTERCEPT")').isVisible().catch(() => false);
		if (!interceptVisible) break;

		// Intercept card
		await page.click('.neural-cta:has-text("INTERCEPT")');
		await page.waitForSelector('.neural-cta:has-text("CONTINUE")', { timeout: 5000 });
		cardsDrawn++;
		
		// Continue
		await page.click('.neural-cta:has-text("CONTINUE")');
		// Wait longer for transition to next screen
		await page.waitForTimeout(1500);

		// Check for failure check
		const failureCheckVisible = await page.locator('.dc-failure-check-container').isVisible().catch(() => false);
		if (failureCheckVisible) {
			console.log(`    Card ${cardsDrawn}: Failure check`);
			// Click to roll failure check - should auto-transition after
			await page.click('.dc-dice-roller-container');
			// Wait for dice animation + auto-transition
			await page.waitForTimeout(4000);
		}
	}

	console.log(`  ✓ Drew ${cardsDrawn} cards`);
	expect(cardsDrawn).toBeGreaterThanOrEqual(1);
	expect(cardsDrawn).toBeLessThanOrEqual(6);

	// Journal should appear automatically
	const journalVisible = await page.waitForSelector('.dc-journal-container', { timeout: 10000 }).catch(() => null);
	expect(journalVisible).not.toBeNull();
	console.log('  ✓ Journal screen appeared');

	await page.fill('textarea', 'Round 1 complete');
	await page.click('button:has-text("Record")');
	// Wait for async journal save and transition
	await page.waitForTimeout(2000);
	
	// Round 2 should start
	await page.waitForSelector('.dc-dice-roller-container', { timeout: 10000 });
	console.log('  ✓ Round 2 started');

	console.log('\n✅ TEST PASSED\n');
});

test('Multiple rounds - stress test', async ({ page }) => {
	console.log('\n🎮 STRESS TEST: MULTIPLE ROUNDS\n');

	await page.goto('/');
	await page.selectOption('select#gameSelect', { label: 'Future Lost' });
	await page.click('button:has-text("Load Game")');
	await page.waitForURL('**/game/future-lost');

	await page.click('button:has-text("continue")');
	await page.waitForTimeout(500);
	await page.click('button:has-text("start")');
	await page.waitForSelector('.dc-dice-roller-container', { timeout: 5000 });
	console.log('✓ Game started');

	// Play 3 rounds
	for (let round = 1; round <= 3; round++) {
		console.log(`\nROUND ${round}:`);
		
		// Roll for tasks
		await page.click('.dc-dice-roller-container');
		await page.waitForTimeout(2500);
		await page.click('.dc-dice-roller-container');
		await page.waitForSelector('.neural-cta:has-text("INTERCEPT")', { timeout: 10000 });

		// Draw all cards
		let cardsDrawn = 0;
		for (let i = 0; i < 10; i++) {
			const interceptVisible = await page.locator('.neural-cta:has-text("INTERCEPT")').isVisible().catch(() => false);
			if (!interceptVisible) break;

			await page.click('.neural-cta:has-text("INTERCEPT")');
			await page.waitForSelector('.neural-cta:has-text("CONTINUE")', { timeout: 5000 });
			cardsDrawn++;
			await page.click('.neural-cta:has-text("CONTINUE")');
			await page.waitForTimeout(1500);

			const failureCheckVisible = await page.locator('.dc-failure-check-container').isVisible().catch(() => false);
			if (failureCheckVisible) {
				await page.click('.dc-dice-roller-container');
				await page.waitForTimeout(4000);
			}
		}

		console.log(`  ✓ Drew ${cardsDrawn} cards`);

		// Journal
		await page.waitForSelector('.dc-journal-container', { timeout: 10000 });
		await page.fill('textarea', `Round ${round}`);
		await page.click('button:has-text("Record")');
		// Wait for async journal save and transition
		await page.waitForTimeout(2000);
		
		if (round < 3) {
			await page.waitForSelector('.dc-dice-roller-container', { timeout: 10000 });
		}
	}

	console.log('\n✅ STRESS TEST PASSED\n');
});
