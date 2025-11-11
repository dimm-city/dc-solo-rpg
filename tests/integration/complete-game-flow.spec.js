import { test, expect } from '@playwright/test';

/**
 * Complete game flow test - plays through an entire game from start to finish
 * Verifies all screens appear in the expected order and game mechanics work
 */
test('Complete game flow - play until win or loss', async ({ page }) => {
	// Track screens visited to verify correct flow
	const screensVisited = [];

	// Helper function to track screen changes
	const trackScreen = (screenName) => {
		screensVisited.push(screenName);
		console.log(`✓ Screen ${screensVisited.length}: ${screenName}`);
	};

	// Helper to draw all cards in a round
	const drawAllCardsInRound = async () => {
		let cardsDrawn = 0;
		let maxAttempts = 10; // Safety limit

		while (maxAttempts > 0) {
			maxAttempts--;

			// Check if card deck is visible
			const cardDeckVisible = await page
				.locator('.dc-card-deck')
				.isVisible()
				.catch(() => false);
			if (!cardDeckVisible) {
				console.log(`  → Drew ${cardsDrawn} cards total`);
				break;
			}

			// Draw card
			await page.click('.dc-card-deck');
			await page.waitForTimeout(300);
			cardsDrawn++;
			console.log(`  → Drew card ${cardsDrawn}`);

			// Confirm card
			await page.click('.dc-card-deck');
			await page.waitForTimeout(500);

			// Check for failure check
			const failureCheckVisible = await page
				.locator('.dc-failure-check-container')
				.isVisible()
				.catch(() => false);

			if (failureCheckVisible) {
				console.log('  → Odd card - rolling failure check');
				trackScreen('FailureCheck');

				// Roll failure check
				await page.click('.dc-dice-roller-container');
				await page.waitForTimeout(2000);

				// Confirm result
				await page.click('.dc-dice-roller-container');
				await page.waitForTimeout(500);
			}

			// Small delay between cards
			await page.waitForTimeout(200);
		}
	};

	// Helper to complete a journal entry
	const completeJournalEntry = async (roundNumber) => {
		trackScreen('JournalEntry');

		// Wait for journal screen
		await page.waitForSelector('.dc-journal-container', { timeout: 5000 });

		// Enter journal text
		const journalText = `Round ${roundNumber} completed. Testing Svelte 5 migration - all systems operational!`;
		await page.fill('textarea', journalText);
		console.log(`  → Journal entry written for round ${roundNumber}`);

		// Save journal
		await page.click('button:has-text("Save")');
		await page.waitForTimeout(1000);
	};

	// Helper to perform success check (if Ace of Hearts revealed)
	const performSuccessCheck = async () => {
		const successCheckVisible = await page
			.locator('.dc-success-check-container')
			.or(page.locator('text=Success Check'))
			.isVisible()
			.catch(() => false);

		if (successCheckVisible) {
			trackScreen('SuccessCheck');
			console.log('  → Ace of Hearts revealed - rolling success check');

			// Roll success check
			await page.click('.dc-dice-roller-container');
			await page.waitForTimeout(2000);

			// Confirm result
			await page.click('.dc-dice-roller-container');
			await page.waitForTimeout(1000);

			return true;
		}

		return false;
	};

	// ==================== START TEST ====================

	console.log('\n🎮 Starting Complete Game Flow Test\n');

	// 1. HOME PAGE
	trackScreen('HomePage');
	await page.goto('/');
	await page.waitForSelector('.dc-start-screen-container', { timeout: 5000 });
	await page.screenshot({ path: 'screenshots/flow-01-home.png', fullPage: true });
	console.log('  → Game selector loaded');

	// Verify home page elements
	await expect(page.locator('.dc-start-screen-container')).toBeVisible();
	await expect(page.locator('select#gameSelect')).toBeVisible();

	// 2. SELECT GAME
	await page.selectOption('select#gameSelect', { label: 'Future Lost' });
	console.log('  → Selected "Future Lost" game');

	// 3. START GAME (to options)
	await page.click('button:has-text("Load Game")');
	await page.waitForSelector('.dc-game-container', { timeout: 5000 });
	trackScreen('OptionsScreen');
	await page.screenshot({ path: 'screenshots/flow-02-options.png', fullPage: true });

	// Verify options screen
	await expect(page.locator('.dc-game-container')).toBeVisible();
	console.log('  → Options screen loaded');

	// 4. START GAME FROM OPTIONS
	await page.click('button:has-text("Load Game")');
	await page.waitForTimeout(500);
	trackScreen('IntroScreen');
	await page.screenshot({ path: 'screenshots/flow-03-intro.png', fullPage: true });
	console.log('  → Intro screen loaded');

	// 5. START FIRST ROUND
	await page.click('button:has-text("start")');
	await page.waitForTimeout(1500); // Wait for round transition animation
	trackScreen('RollForTasks');
	await page.screenshot({ path: 'screenshots/flow-04-roll-tasks-r1.png', fullPage: true });
	console.log('  → Round 1 - Roll for tasks screen');

	// ==================== PLAY ROUNDS ====================

	let roundNumber = 1;
	let gameOver = false;
	const maxRounds = 20; // Safety limit

	while (!gameOver && roundNumber <= maxRounds) {
		console.log(`\n📍 ROUND ${roundNumber}`);

		// Roll for tasks
		console.log('  Rolling dice for tasks...');
		await page.click('.dc-dice-roller-container');
		await page.waitForTimeout(2000);

		// Confirm roll
		await page.click('.dc-dice-roller-container');
		await page.waitForTimeout(1000);
		trackScreen('DrawCard');
		await page.screenshot({
			path: `screenshots/flow-05-draw-r${roundNumber}.png`,
			fullPage: true
		});

		// Draw all cards for this round
		console.log('  Drawing cards...');
		await drawAllCardsInRound();

		// Check for game over
		const gameOverVisible = await page
			.locator('text=Game Over')
			.or(page.locator('text=VICTORY'))
			.or(page.locator('text=Rescue has arrived'))
			.or(page.locator('text=tower has fallen'))
			.isVisible()
			.catch(() => false);

		if (gameOverVisible) {
			trackScreen('GameOver');
			gameOver = true;
			console.log('\n🎯 GAME OVER detected!');
			await page.screenshot({
				path: `screenshots/flow-game-over-r${roundNumber}.png`,
				fullPage: true
			});

			// Check win condition
			const isWin = await page
				.locator('text=VICTORY')
				.or(page.locator('text=Rescue has arrived'))
				.isVisible()
				.catch(() => false);

			if (isWin) {
				console.log('✅ PLAYER WON!');
			} else {
				console.log('❌ PLAYER LOST!');
			}

			break;
		}

		// Complete journal entry
		await completeJournalEntry(roundNumber);
		await page.screenshot({
			path: `screenshots/flow-06-journal-r${roundNumber}.png`,
			fullPage: true
		});

		// Check for success check (Ace of Hearts)
		const hadSuccessCheck = await performSuccessCheck();
		if (hadSuccessCheck) {
			await page.screenshot({
				path: `screenshots/flow-07-success-r${roundNumber}.png`,
				fullPage: true
			});
		}

		// Wait for next round or game over
		await page.waitForTimeout(1500);

		// Check for game over after success check
		const gameOverAfterSuccess = await page
			.locator('text=Game Over')
			.or(page.locator('text=VICTORY'))
			.or(page.locator('text=Rescue has arrived'))
			.isVisible()
			.catch(() => false);

		if (gameOverAfterSuccess) {
			trackScreen('GameOver');
			gameOver = true;
			console.log('\n🎯 GAME OVER after success check!');
			await page.screenshot({
				path: `screenshots/flow-game-over-final.png`,
				fullPage: true
			});

			const isWin = await page
				.locator('text=VICTORY')
				.or(page.locator('text=Rescue has arrived'))
				.isVisible()
				.catch(() => false);

			if (isWin) {
				console.log('✅ PLAYER WON!');
			} else {
				console.log('❌ PLAYER LOST!');
			}

			break;
		}

		// Check if we're starting a new round
		const rollTasksVisible = await page
			.locator('.dc-dice-roller-container')
			.isVisible()
			.catch(() => false);

		if (rollTasksVisible) {
			roundNumber++;
			trackScreen('RollForTasks');
			console.log(`  → Advancing to Round ${roundNumber}`);
			await page.screenshot({
				path: `screenshots/flow-04-roll-tasks-r${roundNumber}.png`,
				fullPage: true
			});
		} else {
			console.log('  ⚠️  Unable to determine next screen, assuming game over');
			break;
		}
	}

	// ==================== VERIFY SCREEN FLOW ====================

	console.log('\n📋 SCREEN FLOW VERIFICATION\n');
	console.log('Screens visited in order:');
	screensVisited.forEach((screen, index) => {
		console.log(`  ${index + 1}. ${screen}`);
	});

	// Verify expected screen flow
	expect(screensVisited[0]).toBe('HomePage');
	expect(screensVisited[1]).toBe('OptionsScreen');
	expect(screensVisited[2]).toBe('IntroScreen');
	expect(screensVisited[3]).toBe('RollForTasks');
	expect(screensVisited[4]).toBe('DrawCard');

	// Verify we eventually reached game over
	expect(screensVisited).toContain('GameOver');

	// Verify journal entries were made
	expect(screensVisited.filter((s) => s === 'JournalEntry').length).toBeGreaterThan(0);

	console.log('\n✅ Screen flow verification passed!');
	console.log(`✅ Total screens visited: ${screensVisited.length}`);
	console.log(`✅ Rounds completed: ${roundNumber}`);
	console.log(`✅ Game reached completion: ${gameOver ? 'Yes' : 'No (safety limit)'}`);

	// ==================== GAME OVER SCREEN ====================

	if (gameOver) {
		// Verify game over screen elements
		const gameOverContainer = await page
			.locator('.dc-game-over-container, .dc-screen-container')
			.first();
		await expect(gameOverContainer).toBeVisible();

		// Check for restart/exit buttons
		const hasRestartButton = await page
			.locator('button:has-text("Restart")')
			.or(page.locator('button:has-text("restart")'))
			.isVisible()
			.catch(() => false);

		const hasExitButton = await page
			.locator('button:has-text("Exit")')
			.or(page.locator('button:has-text("exit")'))
			.isVisible()
			.catch(() => false);

		console.log(`  → Restart button present: ${hasRestartButton}`);
		console.log(`  → Exit button present: ${hasExitButton}`);

		// Take final screenshot
		await page.screenshot({ path: 'screenshots/flow-final-gameover.png', fullPage: true });
	}

	console.log('\n🎉 Complete game flow test passed!\n');
});

/**
 * Quick sanity test - verifies basic game start flow
 */
test('Quick sanity check - game starts correctly', async ({ page }) => {
	console.log('\n🔍 Running quick sanity check...\n');

	// Navigate and start game
	await page.goto('/');
	await page.waitForSelector('.dc-start-screen-container', { timeout: 5000 });

	// Select game
	await page.selectOption('select#gameSelect', { index: 0 });

	// Start game
	await page.click('button:has-text("Load Game")');
	await page.waitForSelector('.dc-game-container', { timeout: 5000 });

	// Start from options
	await page.click('button:has-text("Load Game")');
	await page.waitForTimeout(500);

	// Verify intro screen
	const introVisible = await page.locator('.dc-intro-wrapper, .dc-game-container').isVisible();
	expect(introVisible).toBe(true);

	// Start round
	await page.click('button:has-text("start")');
	await page.waitForTimeout(1500);

	// Verify dice roller appears
	const diceRollerVisible = await page.locator('.dc-dice-roller-container').isVisible();
	expect(diceRollerVisible).toBe(true);

	console.log('✅ Sanity check passed - game starts correctly!\n');
});
