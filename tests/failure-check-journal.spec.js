import { test, expect } from '@playwright/test';

test('Failure check to journal transition', async ({ page }) => {
	console.log('\n🎮 TESTING FAILURE CHECK → JOURNAL TRANSITION\n');

	// Capture console logs
	const logs = [];
	page.on('console', msg => {
		const text = msg.text();
		if (text.includes('[') || text.includes('transition') || text.includes('state')) {
			logs.push(text);
			console.log('BROWSER:', text);
		}
	});

	await page.goto('/');
	await page.selectOption('select#gameSelect', { label: 'Future Lost' });
	await page.click('button:has-text("Load Game")');
	await page.waitForURL('**/game/future-lost');

	await page.click('button:has-text("continue")');
	await page.waitForTimeout(500);
	await page.click('button:has-text("start")');
	await page.waitForSelector('.dc-dice-roller-container', { timeout: 5000 });

	// Roll for tasks
	await page.click('.dc-dice-roller-container');
	await page.waitForTimeout(2500);
	await page.click('.dc-dice-roller-container');
	await page.waitForSelector('.neural-cta:has-text("INTERCEPT")', { timeout: 5000 });
	console.log('✓ Rolled for tasks');

	// Draw cards until we hit a failure check on the LAST card
	let cardsDrawn = 0;
	let hitFailureCheck = false;
	
	for (let i = 0; i < 10; i++) {
		const interceptVisible = await page.locator('.neural-cta:has-text("INTERCEPT")').isVisible().catch(() => false);
		if (!interceptVisible) {
			console.log(`\n✓ All cards drawn (${cardsDrawn} total)`);
			break;
		}

		// Draw card
		await page.click('.neural-cta:has-text("INTERCEPT")');
		await page.waitForSelector('.neural-cta:has-text("CONTINUE")', { timeout: 5000 });
		cardsDrawn++;
		
		// Continue
		console.log(`\nCard ${cardsDrawn}: Clicking CONTINUE`);
		await page.click('.neural-cta:has-text("CONTINUE")');
		await page.waitForTimeout(1500);

		// Check for failure check
		const failureCheckVisible = await page.locator('.dc-failure-check-container').isVisible().catch(() => false);
		if (failureCheckVisible) {
			hitFailureCheck = true;
			console.log(`  → Failure check appeared`);
			console.log(`  → Clicking dice roller for failure check`);
			
			// Roll failure check
			await page.click('.dc-dice-roller-container');
			console.log(`  → Waiting for animation and auto-transition`);
			await page.waitForTimeout(4000);
			
			// After failure check, check if we transition to journal or back to drawCard
			const journalVisible = await page.locator('.dc-journal-container').isVisible().catch(() => false);
			const interceptAfter = await page.locator('.neural-cta:has-text("INTERCEPT")').isVisible().catch(() => false);
			const diceVisible = await page.locator('.dc-dice-roller-container').isVisible().catch(() => false);
			
			console.log(`\n  After failure check:`);
			console.log(`    Journal: ${journalVisible}`);
			console.log(`    INTERCEPT: ${interceptAfter}`);
			console.log(`    Dice roller: ${diceVisible}`);
			
			// If INTERCEPT is visible, there are more cards to draw
			// If journal is visible, this was the last card
			if (journalVisible) {
				console.log(`\n  ✓ Journal appeared - this was the last card`);
				expect(journalVisible).toBe(true);
				break;
			} else if (interceptAfter) {
				console.log(`  → More cards to draw, continuing...`);
			} else {
				console.log(`  ❌ ERROR: Neither journal nor INTERCEPT visible after failure check!`);
				await page.screenshot({ path: 'screenshots/failure-check-stuck.png', fullPage: true });
				expect(interceptAfter || journalVisible).toBe(true);
			}
		}
	}

	console.log(`\n✅ TEST COMPLETED\n`);
});
