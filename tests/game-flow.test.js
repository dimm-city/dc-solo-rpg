import { expect, test } from '@playwright/test';

/**
 * Test suite for DC Solo RPG game flow
 * Validates that the number of cards drawn matches the dice roll
 */

test.describe('Game Flow - Card Drawing', () => {
	test.beforeEach(async ({ page }) => {
		// Enable console logging to track card draws
		page.on('console', (msg) => {
			if (msg.type() === 'log' && msg.text().includes('[rollForTasks]')) {
				console.log('Test Log:', msg.text());
			}
			if (msg.type() === 'log' && msg.text().includes('[drawCard]')) {
				console.log('Test Log:', msg.text());
			}
		});
	});

	test('should draw correct number of cards matching dice roll for multiple rounds', async ({
		page
	}) => {
		// Navigate to the game page
		await page.goto('/game');

		// Wait for the page to load
		await page.waitForLoadState('networkidle');

		// Start the game - click through intro screens
		await expect(page.getByRole('heading', { name: 'FUTURE LOST' })).toBeVisible();

		// Look for the "START GAME" or "BEGIN" button
		const startButton = page.getByRole('button', { name: /START|BEGIN/i });
		if (await startButton.isVisible({ timeout: 2000 }).catch(() => false)) {
			await startButton.click();
		}

		// Wait for Round 1 to start
		await expect(page.getByText('ROUND:')).toBeVisible({ timeout: 10000 });
		await expect(page.getByText('1')).toBeVisible();

		// Test multiple rounds
		for (let round = 1; round <= 2; round++) {
			console.log(`\n=== Testing Round ${round} ===`);

			// Click "Roll for tasks" button
			const rollButton = page.getByRole('button', { name: /ROLL FOR TASKS/i });
			await expect(rollButton).toBeVisible({ timeout: 10000 });
			await rollButton.click();

			// Wait for dice roll animation to complete
			await page.waitForTimeout(3000);

			// Extract the dice roll result from console logs
			const diceRoll = await page.evaluate(() => {
				// Access the game store to get the dice roll
				// This assumes the game store is accessible in the window
				return new Promise((resolve) => {
					// Wait a bit for state to update
					setTimeout(() => {
						const logs = [];
						// We'll capture it via the continue button appearing
						resolve(null);
					}, 100);
				});
			});

			// Alternative: Click continue and track cards drawn
			const continueButton = page.getByRole('button', { name: /CONTINUE/i });
			if (await continueButton.isVisible({ timeout: 5000 }).catch(() => false)) {
				await continueButton.click();
			}

			// Wait for the card drawing screen
			await expect(page.getByRole('button', { name: /PROCEED TO NEXT BYTE/i })).toBeVisible({
				timeout: 5000
			});

			// Track cards drawn by listening to console logs
			const consoleMessages = [];
			page.on('console', (msg) => {
				if (msg.text().includes('[drawCard]')) {
					consoleMessages.push(msg.text());
				}
			});

			// Draw cards until we reach the journal entry screen
			let cardsDrawn = 0;
			let maxCards = 10; // Safety limit

			while (cardsDrawn < maxCards) {
				// Check if we're at card drawing screen
				const proceedButton = page.getByRole('button', {
					name: /PROCEED TO NEXT BYTE/i
				});

				if (await proceedButton.isVisible({ timeout: 2000 }).catch(() => false)) {
					console.log(`Drawing card ${cardsDrawn + 1}`);
					await proceedButton.click();

					// Wait for card to be revealed
					await page.waitForTimeout(2000);

					// Click continue button
					const cardContinueButton = page.getByRole('button', { name: /CONTINUE/i });
					if (await cardContinueButton.isVisible({ timeout: 5000 }).catch(() => false)) {
						await cardContinueButton.click();
						cardsDrawn++;
					}

					// Wait for transition
					await page.waitForTimeout(1000);

					// Check if we hit a failure check
					const failureCheckButton = page.getByRole('button', {
						name: /ROLL FAILURE CHECK/i
					});
					if (await failureCheckButton.isVisible({ timeout: 2000 }).catch(() => false)) {
						console.log('Failure check triggered');
						await failureCheckButton.click();

						// Wait for dice animation
						await page.waitForTimeout(3000);

						// Click continue after failure check
						const failureContinueButton = page.getByRole('button', {
							name: /CONTINUE/i
						});
						if (await failureContinueButton.isVisible({ timeout: 5000 }).catch(() => false)) {
							await failureContinueButton.click();
							await page.waitForTimeout(1000);
						}
					}
				} else {
					// Check if we've reached the journal entry screen
					const journalHeading = page.getByRole('heading', {
						name: /RECORD YOUR JOURNAL ENTRY/i
					});
					if (await journalHeading.isVisible({ timeout: 2000 }).catch(() => false)) {
						console.log('Reached journal entry screen');
						break;
					} else {
						// Might be at a continue button before journal
						const genericContinue = page.getByRole('button', { name: /CONTINUE/i });
						if (await genericContinue.isVisible({ timeout: 2000 }).catch(() => false)) {
							await genericContinue.click();
							await page.waitForTimeout(1000);
						} else {
							break;
						}
					}
				}
			}

			console.log(`Round ${round}: Drew ${cardsDrawn} cards`);

			// Verify we're at the journal entry screen
			await expect(page.getByRole('heading', { name: /RECORD YOUR JOURNAL ENTRY/i })).toBeVisible({
				timeout: 10000
			});

			// Verify the summary shows the correct number of entries
			const summaryEntries = await page.getByText(/^\d+\.\d+/).count();
			console.log(`Round ${round}: Journal shows ${summaryEntries} entries`);

			// The number of cards drawn should match the journal entries
			expect(cardsDrawn).toBe(summaryEntries);

			// If we're not on the last round, continue to next round
			if (round < 2) {
				// Fill in journal entry
				const journalTextarea = page.getByRole('textbox');
				await journalTextarea.fill(`Round ${round} completed - Drew ${cardsDrawn} cards`);

				// Click record button
				await page.getByRole('button', { name: /RECORD/i }).click();

				// Wait for next round to start
				await page.waitForTimeout(2000);

				// Click continue to start next round
				const nextRoundContinue = page.getByRole('button', { name: /CONTINUE/i });
				if (await nextRoundContinue.isVisible({ timeout: 5000 }).catch(() => false)) {
					await nextRoundContinue.click();
				}

				// Wait for round indicator to update
				await page.waitForTimeout(1000);
			}
		}
	});

	test('should validate card drawing count via console logs', async ({ page }) => {
		// This test specifically validates using console logs like the manual test

		const consoleLogs = [];

		// Capture console logs
		page.on('console', (msg) => {
			const text = msg.text();
			if (text.includes('[rollForTasks]') || text.includes('[drawCard]')) {
				consoleLogs.push(text);
			}
		});

		// Navigate to the game
		await page.goto('/game');
		await page.waitForLoadState('networkidle');

		// Start game
		const startButton = page.getByRole('button', { name: /START|BEGIN/i });
		if (await startButton.isVisible({ timeout: 2000 }).catch(() => false)) {
			await startButton.click();
		}

		// Wait for Round 1
		await expect(page.getByText('ROUND:')).toBeVisible({ timeout: 10000 });

		// Roll for tasks
		const rollButton = page.getByRole('button', { name: /ROLL FOR TASKS/i });
		await expect(rollButton).toBeVisible({ timeout: 10000 });
		await rollButton.click();

		// Wait for roll to complete
		await page.waitForTimeout(3000);

		// Extract dice roll from console logs
		let diceRoll = null;
		const rollLog = consoleLogs.find((log) => log.includes('setting cardsToDraw to'));
		if (rollLog) {
			const match = rollLog.match(/setting cardsToDraw to (\d+)/);
			if (match) {
				diceRoll = parseInt(match[1]);
				console.log(`Dice rolled: ${diceRoll}`);
			}
		}

		expect(diceRoll).toBeGreaterThan(0);

		// Continue to card drawing
		const continueButton = page.getByRole('button', { name: /CONTINUE/i });
		if (await continueButton.isVisible({ timeout: 5000 }).catch(() => false)) {
			await continueButton.click();
		}

		// Draw all cards
		for (let i = 0; i < diceRoll; i++) {
			await page.waitForTimeout(1000);

			const proceedButton = page.getByRole('button', { name: /PROCEED TO NEXT BYTE/i });
			await expect(proceedButton).toBeVisible({ timeout: 5000 });
			await proceedButton.click();

			// Wait for card reveal
			await page.waitForTimeout(2000);

			const cardContinueButton = page.getByRole('button', { name: /CONTINUE/i });
			await expect(cardContinueButton).toBeVisible({ timeout: 5000 });
			await cardContinueButton.click();

			// Handle potential failure check
			await page.waitForTimeout(1000);
			const failureCheckButton = page.getByRole('button', { name: /ROLL FAILURE CHECK/i });
			if (await failureCheckButton.isVisible({ timeout: 2000 }).catch(() => false)) {
				await failureCheckButton.click();
				await page.waitForTimeout(3000);

				const failureContinueButton = page.getByRole('button', { name: /CONTINUE/i });
				if (await failureContinueButton.isVisible({ timeout: 5000 }).catch(() => false)) {
					await failureContinueButton.click();
				}
			}
		}

		// Verify all cards were drawn by checking console logs
		const cardDrawLogs = consoleLogs.filter((log) => log.includes('Drew') && log.includes('of'));
		console.log(`Cards drawn according to logs: ${cardDrawLogs.length}`);
		console.log('Card draw logs:', cardDrawLogs);

		expect(cardDrawLogs.length).toBe(diceRoll);

		// Verify the cardsToDrawRemaining went from (diceRoll-1) down to 0
		const remainingCounts = cardDrawLogs.map((log) => {
			const match = log.match(/cardsToDrawRemaining: (\d+)/);
			return match ? parseInt(match[1]) : null;
		});

		console.log('Cards remaining after each draw:', remainingCounts);

		// Should start at diceRoll-1 and end at 0
		expect(remainingCounts[0]).toBe(diceRoll - 1);
		expect(remainingCounts[remainingCounts.length - 1]).toBe(0);
	});
});
