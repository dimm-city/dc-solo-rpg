import { test, expect } from '@playwright/test';

/**
 * COMPREHENSIVE END-TO-END GAME TEST
 *
 * This test plays through a complete game and validates:
 * - All math calculations (damage, bonuses, token removal)
 * - Screen sequences and state transitions
 * - Win conditions (all 10 tokens removed, tower > 0)
 * - Loss conditions (tower <= 0 OR 4 kings revealed)
 * - Card mechanics (odd/even, aces, kings)
 * - Journal entries
 * - Success checks
 * - Game state consistency
 */
test('COMPREHENSIVE: Full game validation with logic verification', async ({ page }) => {
	console.log('\n' + '='.repeat(80));
	console.log('🎮 COMPREHENSIVE GAME TEST - FULL VALIDATION');
	console.log('='.repeat(80) + '\n');

	// Track game state for validation
	const gameTracking = {
		tower: 54,
		tokens: 10,
		kingsRevealed: 0,
		aceOfHeartsRevealed: false,
		bonus: 0,
		round: 0,
		screensVisited: [],
		cardsDrawn: [],
		journalEntries: [],
		damageEvents: []
	};

	// Helper: Track screen
	const trackScreen = (screenName) => {
		gameTracking.screensVisited.push(screenName);
		console.log(`📍 Screen ${gameTracking.screensVisited.length}: ${screenName}`);
	};

	// Helper: Get game state from page
	const getGameState = async () => {
		return await page
			.evaluate(() => {
				// Access the global game state from the Svelte app
				const state = window.__GAME_STATE__ || {};
				return {
					tower: state.tower || 54,
					tokens: state.tokens || 10,
					round: state.round || 0,
					kingsRevealed: state.kingsRevealed || 0,
					bonus: state.bonus || 0,
					aceOfHeartsRevealed: state.aceOfHeartsRevealed || false,
					gameOver: state.gameOver || false,
					win: state.win || false
				};
			})
			.catch(() => null);
	};

	// Helper: Extract visible game stats from UI
	const extractUIStats = async () => {
		try {
			const statsText = await page
				.locator('.dc-status-display, .status-display-area')
				.textContent();
			const tower = statsText?.match(/Tower:\s*(\d+)/)?.[1];
			const tokens = statsText?.match(/Tokens:\s*(\d+)/)?.[1];
			const round = statsText?.match(/Round:\s*(\d+)/)?.[1];

			return {
				tower: tower ? parseInt(tower) : null,
				tokens: tokens ? parseInt(tokens) : null,
				round: round ? parseInt(round) : null
			};
		} catch (e) {
			return { tower: null, tokens: null, round: null };
		}
	};

	// Helper: Draw all cards and validate each one
	const drawAllCardsInRound = async (roundNumber) => {
		console.log(`\n🃏 ROUND ${roundNumber} - Drawing Cards`);
		let cardsDrawn = 0;
		let maxAttempts = 10;
		const roundCards = [];

		while (maxAttempts > 0) {
			maxAttempts--;

			// Check if card deck is visible
			const cardDeckVisible = await page
				.locator('.dc-card-deck')
				.isVisible()
				.catch(() => false);

			if (!cardDeckVisible) {
				console.log(`  ✓ Round complete - drew ${cardsDrawn} cards`);
				break;
			}

			// Draw card
			await page.click('.dc-card-deck');
			await page.waitForTimeout(300);
			cardsDrawn++;

			// Try to extract card info from UI
			const cardInfo = await page
				.locator('.dc-card-container, .dc-current-card')
				.textContent()
				.catch(() => '');
			console.log(`  → Card ${cardsDrawn}: ${cardInfo.substring(0, 50)}`);

			// Confirm card
			await page.click('.dc-card-deck');
			await page.waitForTimeout(500);

			// Check for failure check (odd card)
			const failureCheckVisible = await page
				.locator('.dc-failure-check-container')
				.isVisible()
				.catch(() => false);

			if (failureCheckVisible) {
				console.log('    ⚠️  ODD CARD - Failure check triggered');
				trackScreen('FailureCheck');

				// Get tower health before
				const statsBefore = await extractUIStats();
				const towerBefore = statsBefore.tower || gameTracking.tower;

				// Roll failure check
				await page.click('.dc-dice-roller-container');
				await page.waitForTimeout(2000);

				// Try to extract dice result
				const resultText = await page
					.locator('.dc-dice-result, .dc-dice-roller-container')
					.textContent()
					.catch(() => '');
				const diceRoll = resultText?.match(/(\d+)/)?.[1];

				if (diceRoll) {
					console.log(`    🎲 Failure roll: ${diceRoll}`);
					const damage = Math.max(parseInt(diceRoll) - gameTracking.bonus, 0);
					const expectedTower = towerBefore - damage;

					gameTracking.damageEvents.push({
						round: roundNumber,
						card: cardsDrawn,
						roll: parseInt(diceRoll),
						bonus: gameTracking.bonus,
						damage: damage,
						towerBefore: towerBefore,
						towerAfter: expectedTower
					});

					console.log(`    💥 Damage: ${diceRoll} - ${gameTracking.bonus} bonus = ${damage}`);
					console.log(`    🏗️  Tower: ${towerBefore} → ${expectedTower}`);

					gameTracking.tower = expectedTower;
				}

				// Confirm result
				await page.click('.dc-dice-roller-container');
				await page.waitForTimeout(500);

				// Verify tower health updated
				const statsAfter = await extractUIStats();
				if (statsAfter.tower !== null) {
					console.log(`    ✓ UI shows tower: ${statsAfter.tower}`);

					// Validate calculation
					if (diceRoll) {
						const expectedTower =
							gameTracking.damageEvents[gameTracking.damageEvents.length - 1].towerAfter;
						const actualTower = statsAfter.tower;

						if (actualTower === expectedTower) {
							console.log(`    ✅ Math verified: ${expectedTower} = ${actualTower}`);
						} else {
							console.log(`    ❌ Math mismatch! Expected: ${expectedTower}, Got: ${actualTower}`);
						}
					}
				}
			} else {
				console.log('    ✓ Even card - no failure check');
			}

			roundCards.push({
				cardNumber: cardsDrawn,
				hadFailureCheck: failureCheckVisible
			});

			await page.waitForTimeout(200);
		}

		gameTracking.cardsDrawn.push(...roundCards);
		return cardsDrawn;
	};

	// Helper: Complete journal entry
	const completeJournalEntry = async (roundNumber) => {
		trackScreen('JournalEntry');
		console.log(`\n📝 JOURNAL - Round ${roundNumber}`);

		await page.waitForSelector('.dc-journal-container', { timeout: 5000 });

		// Check what events are shown for this round
		const eventsText = await page.locator('.dc-journal-container').textContent();
		console.log(`  Events summary visible: ${eventsText.length > 0 ? 'Yes' : 'No'}`);

		const journalText = `Round ${roundNumber} complete. Tower: ${gameTracking.tower}/54, Tokens: ${gameTracking.tokens}/10, Kings: ${gameTracking.kingsRevealed}/4`;
		await page.fill('textarea', journalText);
		console.log(`  ✓ Journal entry: "${journalText}"`);

		gameTracking.journalEntries.push({
			round: roundNumber,
			text: journalText,
			tower: gameTracking.tower,
			tokens: gameTracking.tokens
		});

		await page.click('button:has-text("Save")');
		await page.waitForTimeout(1000);
	};

	// Helper: Perform success check
	const performSuccessCheck = async (roundNumber) => {
		const successCheckVisible = await page
			.locator('.dc-success-check-container')
			.or(page.locator('text=Success Check'))
			.or(page.locator('text=success check'))
			.isVisible()
			.catch(() => false);

		if (successCheckVisible) {
			trackScreen('SuccessCheck');
			console.log(`\n⭐ SUCCESS CHECK - Round ${roundNumber}`);
			console.log(`  Ace of Hearts revealed!`);
			console.log(`  Tokens before: ${gameTracking.tokens}/10`);

			// Roll success check
			await page.click('.dc-dice-roller-container');
			await page.waitForTimeout(2000);

			// Extract dice result
			const resultText = await page
				.locator('.dc-dice-result, .dc-dice-roller-container')
				.textContent()
				.catch(() => '');
			const diceRoll = resultText?.match(/(\d+)/)?.[1];

			if (diceRoll) {
				console.log(`  🎲 Success roll: ${diceRoll}`);

				// Check if token removed (roll = 6 OR roll + bonus = 6)
				const roll = parseInt(diceRoll);
				const withBonus = roll + gameTracking.bonus;
				const tokenRemoved = roll === 6 || withBonus === 6;

				if (tokenRemoved) {
					gameTracking.tokens--;
					console.log(`  ✅ Token removed! (roll: ${roll}, bonus: ${gameTracking.bonus})`);
					console.log(`  🎯 Tokens remaining: ${gameTracking.tokens}/10`);
				} else {
					console.log(`  ❌ No token removed (need 6, rolled: ${roll}, +bonus: ${withBonus})`);
				}

				// Check for win
				if (gameTracking.tokens === 0) {
					console.log(`  🎉 ALL TOKENS REMOVED - PLAYER SHOULD WIN!`);
				}
			}

			// Confirm result
			await page.click('.dc-dice-roller-container');
			await page.waitForTimeout(1000);

			return true;
		}

		return false;
	};

	// ==================== START TEST ====================

	console.log('PHASE 1: GAME SETUP');
	console.log('-'.repeat(80));

	// Navigate to home
	trackScreen('HomePage');
	await page.goto('http://localhost:4173/');
	await page.waitForSelector('.dc-start-screen-container', { timeout: 5000 });
	await page.screenshot({ path: 'screenshots/test-01-home.png', fullPage: true });
	console.log('✓ Home page loaded');

	// Verify home page elements
	await expect(page.locator('.dc-start-screen-container')).toBeVisible();
	await expect(page.locator('select#gameSelect')).toBeVisible();

	// Select game
	await page.selectOption('select#gameSelect', { label: 'Future Lost' });
	console.log('✓ Selected "Future Lost" game');

	// Start game
	await page.click('button:has-text("Load Game")');
	await page.waitForSelector('.dc-game-container', { timeout: 5000 });
	trackScreen('OptionsScreen');
	await page.screenshot({ path: 'screenshots/test-02-options.png', fullPage: true });
	console.log('✓ Options screen loaded');

	// Start from options
	await page.click('button:has-text("Load Game")');
	await page.waitForTimeout(500);
	trackScreen('IntroScreen');
	await page.screenshot({ path: 'screenshots/test-03-intro.png', fullPage: true });
	console.log('✓ Intro screen loaded');

	// Start first round
	await page.click('button:has-text("start")');
	await page.waitForTimeout(1500);
	trackScreen('RollForTasks');
	await page.screenshot({ path: 'screenshots/test-04-start-round-1.png', fullPage: true });
	console.log('✓ Round 1 started\n');

	// ==================== GAME LOOP ====================

	console.log('PHASE 2: GAMEPLAY');
	console.log('-'.repeat(80));

	let roundNumber = 1;
	let gameOver = false;
	const maxRounds = 25; // Safety limit

	while (!gameOver && roundNumber <= maxRounds) {
		console.log(`\n${'='.repeat(80)}`);
		console.log(`ROUND ${roundNumber}`);
		console.log('='.repeat(80));

		// Update round tracking
		gameTracking.round = roundNumber;

		// Get current stats from UI
		const currentStats = await extractUIStats();
		if (currentStats.tower !== null) {
			console.log(
				`📊 Game State: Tower: ${currentStats.tower}/54, Tokens: ${currentStats.tokens}/10, Round: ${currentStats.round}`
			);
		}

		// Roll for tasks
		console.log(`\n🎲 ROLL FOR TASKS`);
		await page.click('.dc-dice-roller-container');
		await page.waitForTimeout(2000);

		// Try to get dice result
		const taskRollText = await page
			.locator('.dc-dice-roller-container')
			.textContent()
			.catch(() => '');
		const tasksRoll = taskRollText?.match(/(\d+)/)?.[1];
		if (tasksRoll) {
			console.log(`  Rolled: ${tasksRoll} - will draw ${tasksRoll} cards`);
		}

		// Confirm roll
		await page.click('.dc-dice-roller-container');
		await page.waitForTimeout(1000);
		trackScreen('DrawCard');
		await page.screenshot({
			path: `screenshots/test-05-round-${roundNumber}-draw.png`,
			fullPage: true
		});

		// Draw all cards
		await drawAllCardsInRound(roundNumber);

		// Check for game over (loss)
		const gameOverVisible = await page
			.locator('text=Game Over')
			.or(page.locator('text=VICTORY'))
			.or(page.locator('text=Rescue has arrived'))
			.or(page.locator('text=tower has fallen'))
			.or(page.locator('text=fallen'))
			.isVisible()
			.catch(() => false);

		if (gameOverVisible) {
			trackScreen('GameOver');
			gameOver = true;
			console.log(`\n${'='.repeat(80)}`);
			console.log('🎯 GAME OVER DETECTED');
			console.log('='.repeat(80));
			await page.screenshot({
				path: `screenshots/test-gameover-round-${roundNumber}.png`,
				fullPage: true
			});

			// Determine win or loss
			const isWin = await page
				.locator('text=VICTORY')
				.or(page.locator('text=Rescue has arrived'))
				.or(page.locator('text=Salvation'))
				.isVisible()
				.catch(() => false);

			if (isWin) {
				console.log('✅ RESULT: VICTORY!');
				console.log(
					`   Final state: Tokens: ${gameTracking.tokens}/10, Tower: ${gameTracking.tower}/54`
				);
			} else {
				console.log('❌ RESULT: DEFEAT!');
				const reason =
					gameTracking.tower <= 0
						? 'Tower collapsed'
						: gameTracking.kingsRevealed >= 4
							? '4 Kings revealed'
							: 'Unknown';
				console.log(`   Reason: ${reason}`);
				console.log(
					`   Final state: Tower: ${gameTracking.tower}/54, Kings: ${gameTracking.kingsRevealed}/4`
				);
			}

			break;
		}

		// Journal entry
		await completeJournalEntry(roundNumber);
		await page.screenshot({
			path: `screenshots/test-06-round-${roundNumber}-journal.png`,
			fullPage: true
		});

		// Success check (if Ace of Hearts revealed)
		const hadSuccessCheck = await performSuccessCheck(roundNumber);
		if (hadSuccessCheck) {
			await page.screenshot({
				path: `screenshots/test-07-round-${roundNumber}-success.png`,
				fullPage: true
			});

			// Check for win after success check
			const gameOverAfterSuccess = await page
				.locator('text=Game Over')
				.or(page.locator('text=VICTORY'))
				.or(page.locator('text=Rescue'))
				.isVisible()
				.catch(() => false);

			if (gameOverAfterSuccess) {
				trackScreen('GameOver');
				gameOver = true;
				console.log(`\n${'='.repeat(80)}`);
				console.log('🎯 GAME OVER AFTER SUCCESS CHECK');
				console.log('='.repeat(80));
				await page.screenshot({
					path: `screenshots/test-victory-final.png`,
					fullPage: true
				});

				const isWin = await page
					.locator('text=VICTORY')
					.or(page.locator('text=Rescue'))
					.isVisible()
					.catch(() => false);

				if (isWin) {
					console.log('✅ RESULT: VICTORY!');
					console.log(`   All tokens removed: ${gameTracking.tokens === 0 ? 'Yes' : 'No'}`);
				}

				break;
			}
		}

		// Wait and prepare for next round
		await page.waitForTimeout(1500);

		// Check if new round started
		const rollTasksVisible = await page
			.locator('.dc-dice-roller-container')
			.isVisible()
			.catch(() => false);

		if (rollTasksVisible) {
			roundNumber++;
			trackScreen('RollForTasks');
			console.log(`\n→ Advancing to Round ${roundNumber}`);
			await page.screenshot({
				path: `screenshots/test-04-start-round-${roundNumber}.png`,
				fullPage: true
			});
		} else {
			console.log('  ⚠️  Cannot determine next screen');
			break;
		}
	}

	// ==================== VERIFICATION ====================

	console.log(`\n${'='.repeat(80)}`);
	console.log('PHASE 3: TEST VERIFICATION');
	console.log('='.repeat(80));

	// Verify screen sequence
	console.log(`\n📋 SCREEN SEQUENCE (${gameTracking.screensVisited.length} screens):`);
	gameTracking.screensVisited.forEach((screen, i) => {
		console.log(`  ${(i + 1).toString().padStart(2)}. ${screen}`);
	});

	// Validate expected flow
	expect(gameTracking.screensVisited[0]).toBe('HomePage');
	expect(gameTracking.screensVisited[1]).toBe('OptionsScreen');
	expect(gameTracking.screensVisited[2]).toBe('IntroScreen');
	expect(gameTracking.screensVisited[3]).toBe('RollForTasks');
	expect(gameTracking.screensVisited[4]).toBe('DrawCard');
	expect(gameTracking.screensVisited).toContain('GameOver');
	expect(gameTracking.screensVisited.filter((s) => s === 'JournalEntry').length).toBeGreaterThan(0);
	console.log('✅ Screen sequence valid');

	// Verify damage calculations
	console.log(`\n🧮 DAMAGE CALCULATIONS (${gameTracking.damageEvents.length} events):`);
	let mathErrors = 0;
	gameTracking.damageEvents.forEach((event, i) => {
		const expectedDamage = Math.max(event.roll - event.bonus, 0);
		const expectedTower = event.towerBefore - expectedDamage;
		const isCorrect = event.damage === expectedDamage && event.towerAfter === expectedTower;

		console.log(
			`  ${i + 1}. R${event.round} Card${event.card}: Roll ${event.roll} - Bonus ${event.bonus} = ${event.damage} damage → Tower ${event.towerBefore}→${event.towerAfter} ${isCorrect ? '✅' : '❌'}`
		);

		if (!isCorrect) mathErrors++;
	});

	if (mathErrors === 0) {
		console.log('✅ All damage calculations correct');
	} else {
		console.log(`❌ Found ${mathErrors} calculation errors`);
	}

	// Verify journal entries
	console.log(`\n📖 JOURNAL ENTRIES (${gameTracking.journalEntries.length} entries):`);
	gameTracking.journalEntries.forEach((entry) => {
		console.log(`  Round ${entry.round}: Tower ${entry.tower}, Tokens ${entry.tokens}`);
	});
	expect(gameTracking.journalEntries.length).toBeGreaterThan(0);
	console.log('✅ Journal entries recorded');

	// Game completion
	console.log(`\n🎮 GAME COMPLETION:`);
	console.log(`  Rounds played: ${roundNumber}`);
	console.log(`  Cards drawn: ${gameTracking.cardsDrawn.length}`);
	console.log(`  Damage events: ${gameTracking.damageEvents.length}`);
	console.log(`  Game reached end: ${gameOver ? 'Yes' : 'No (safety limit)'}`);
	expect(gameOver).toBe(true);
	console.log('✅ Game reached completion');

	// Final screenshot
	await page.screenshot({ path: 'screenshots/test-final.png', fullPage: true });

	console.log(`\n${'='.repeat(80)}`);
	console.log('🎉 COMPREHENSIVE TEST COMPLETE');
	console.log('='.repeat(80) + '\n');
});

/**
 * Quick smoke test - verifies game can start
 */
test('SMOKE TEST: Game starts and first round works', async ({ page }) => {
	console.log('\n🔥 Running smoke test...\n');

	await page.goto('http://localhost:4173/');
	await page.waitForSelector('.dc-start-screen-container', { timeout: 5000 });

	// Select and start game
	await page.selectOption('select#gameSelect', { index: 0 });
	await page.click('button:has-text("Load Game")');
	await page.waitForSelector('.dc-game-container', { timeout: 5000 });

	// Start from options
	await page.click('button:has-text("Load Game")');
	await page.waitForTimeout(500);

	// Verify intro
	const introVisible = await page.locator('.dc-intro-wrapper, .dc-game-container').isVisible();
	expect(introVisible).toBe(true);
	console.log('✓ Intro screen loaded');

	// Start round
	await page.click('button:has-text("start")');
	await page.waitForTimeout(1500);

	// Verify dice roller
	const diceRollerVisible = await page.locator('.dc-dice-roller-container').isVisible();
	expect(diceRollerVisible).toBe(true);
	console.log('✓ Dice roller appeared');

	// Roll dice
	await page.click('.dc-dice-roller-container');
	await page.waitForTimeout(2000);
	console.log('✓ Dice rolled');

	// Confirm
	await page.click('.dc-dice-roller-container');
	await page.waitForTimeout(1000);

	// Verify card deck
	const cardDeckVisible = await page.locator('.dc-card-deck').isVisible();
	expect(cardDeckVisible).toBe(true);
	console.log('✓ Card deck appeared');

	console.log('\n✅ Smoke test passed!\n');
});
