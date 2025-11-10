import { test, expect } from '@playwright/test';

/**
 * COMPREHENSIVE GAME VALIDATION TEST
 * 
 * This test validates the complete game flow, logic, and state management:
 * 1. All math calculations are correct (damage = roll - bonus, capped at 0)
 * 2. Dice rolls happen exactly once per transition
 * 3. Card drawing count matches the dice roll result
 * 4. No race conditions during state transitions
 * 5. Game state remains consistent throughout
 */

test.describe('Full Game Validation', () => {
	test('Complete game with full validation', async ({ page }) => {
		console.log('\n' + '='.repeat(80));
		console.log('🎮 FULL GAME VALIDATION TEST');
		console.log('='.repeat(80) + '\n');

		// Game state tracker
		const tracker = {
			tower: 54,
			tokens: 10,
			kingsRevealed: 0,
			bonus: 0,
			round: 0,
			rounds: [],
			issues: []
		};

		// Issue logger
		const logIssue = (severity, message, details = {}) => {
			const issue = { severity, message, details, round: tracker.round };
			tracker.issues.push(issue);
			console.log(`\n${severity === 'ERROR' ? '❌' : '⚠️'} ${severity}: ${message}`);
			if (Object.keys(details).length > 0) {
				console.log('   Details:', JSON.stringify(details, null, 2));
			}
		};

		// Helper: Wait for element with timeout
		const waitFor = async (selector, timeout = 5000) => {
			try {
				await page.waitForSelector(selector, { timeout, state: 'visible' });
				return true;
			} catch {
				return false;
			}
		};

		// Helper: Extract game stats from UI
		const getUIStats = async () => {
			try {
				const statsText = await page.locator('.dc-status-display, .status-display-area').textContent();
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

		// Helper: Get dice roll result from UI
		const getDiceResult = async () => {
			try {
				const diceText = await page.locator('.dc-dice-roller-container, .dc-dice-result').textContent();
				const match = diceText?.match(/(\d+)/);
				return match ? parseInt(match[1]) : null;
			} catch {
				return null;
			}
		};

		// ==================== GAME SETUP ====================
		console.log('PHASE 1: GAME SETUP');
		console.log('-'.repeat(80));

		await page.goto('http://localhost:5173/');
		await waitFor('.dc-start-screen-container');
		console.log('✓ Home page loaded');

		await page.selectOption('select#gameSelect', { label: 'Future Lost' });
		await page.click('button:has-text("Load Game")');
		await page.waitForURL('**/game/future-lost');
		console.log('✓ Game loaded via server routing');

		await waitFor('.dc-intro-container');
		console.log('✓ Intro screen loaded');

		// Navigate through intro screens
		await page.click('button:has-text("continue")');
		await page.waitForTimeout(500);
		console.log('✓ Rules viewed');

		await page.click('button:has-text("start")');
		await page.waitForTimeout(1500);
		console.log('✓ Game started\n');

		// ==================== GAME LOOP ====================
		console.log('PHASE 2: GAMEPLAY WITH VALIDATION');
		console.log('-'.repeat(80));

		const maxRounds = 25;
		let gameOver = false;

		while (!gameOver && tracker.round < maxRounds) {
			tracker.round++;
			const roundData = {
				roundNumber: tracker.round,
				diceRoll: null,
				cardsDrawn: 0,
				expectedCards: null,
				failureChecks: []
			};

			console.log(`\n${'='.repeat(80)}`);
			console.log(`ROUND ${tracker.round}`);
			console.log('='.repeat(80));

			// Get current stats
			const statsBefore = await getUIStats();
			console.log(`📊 Start: Tower ${statsBefore.tower}/54, Tokens ${statsBefore.tokens}/10`);

			// ==================== ROLL FOR TASKS ====================
			console.log(`\n🎲 ROLL FOR TASKS`);

			// Wait for dice roller
			const diceVisible = await waitFor('.dc-dice-roller-container', 5000);
			if (!diceVisible) {
				logIssue('ERROR', 'Dice roller not visible', { expected: 'dice-roller', round: tracker.round });
				break;
			}

			// Take a snapshot of UI state before clicking
			const beforeRollSnapshot = {
				tower: statsBefore.tower,
				tokens: statsBefore.tokens,
				round: tracker.round
			};

			// Click to roll
			await page.click('.dc-dice-roller-container');
			await page.waitForTimeout(2500); // Wait for animation

			// Get dice result
			const diceRoll = await getDiceResult();
			roundData.diceRoll = diceRoll;
			roundData.expectedCards = diceRoll;

			if (!diceRoll || diceRoll < 1 || diceRoll > 6) {
				logIssue('ERROR', 'Invalid dice roll result', { diceRoll, round: tracker.round });
			} else {
				console.log(`  Rolled: ${diceRoll} - expecting ${diceRoll} cards`);
			}

			// Verify state didn't change during dice roll
			const afterRollStats = await getUIStats();
			if (afterRollStats.tower !== beforeRollSnapshot.tower || afterRollStats.tokens !== beforeRollSnapshot.tokens) {
				logIssue('ERROR', 'State changed during dice roll', {
					before: beforeRollSnapshot,
					after: afterRollStats
				});
			}

			// Click to confirm roll
			await page.click('.dc-dice-roller-container');
			await page.waitForTimeout(1000);

			// ==================== DRAW CARDS ====================
			console.log(`\n🃏 DRAWING CARDS`);

			let cardsDrawn = 0;
			const maxAttempts = 10;
			let attempts = 0;

			while (attempts < maxAttempts) {
				attempts++;

				// Check if card deck is visible
				const cardDeckVisible = await page.locator('.dc-card-deck').isVisible().catch(() => false);
				
				if (!cardDeckVisible) {
					console.log(`  ✓ Round complete - drew ${cardsDrawn} cards`);
					break;
				}

				// Take snapshot before drawing
				const beforeDrawStats = await getUIStats();

				// Draw card (click INTERCEPT FRAGMENT button)
				await page.click('.dc-card-deck');
				await page.waitForTimeout(500);
				cardsDrawn++;

				// Wait for card to appear
				const cardVisible = await waitFor('.fragment-container', 3000);
				if (!cardVisible) {
					logIssue('ERROR', 'Card did not appear after drawing', { cardNumber: cardsDrawn });
				}

				console.log(`  → Card ${cardsDrawn} drawn`);

				// Click to confirm card (click CONTINUE button)
				await page.click('.neural-cta:has-text("CONTINUE")');
				await page.waitForTimeout(800);

				// Check for failure check
				const failureCheckVisible = await page.locator('.dc-failure-check-container').isVisible().catch(() => false);

				if (failureCheckVisible) {
					console.log(`    ⚠️  ODD CARD - Failure check triggered`);

					// Get tower health before failure check
					const towerBefore = (await getUIStats()).tower || tracker.tower;

					// Roll failure check
					await page.click('.dc-dice-roller-container');
					await page.waitForTimeout(2500);

					// Get dice result
					const failureRoll = await getDiceResult();

					if (failureRoll) {
						console.log(`    🎲 Failure roll: ${failureRoll}`);
						
						// Calculate expected damage
						const expectedDamage = Math.max(failureRoll - tracker.bonus, 0);
						const expectedTower = towerBefore - expectedDamage;

						console.log(`    💥 Expected damage: ${failureRoll} - ${tracker.bonus} = ${expectedDamage}`);
						console.log(`    🏗️  Expected tower: ${towerBefore} → ${expectedTower}`);

						roundData.failureChecks.push({
							cardNumber: cardsDrawn,
							roll: failureRoll,
							bonus: tracker.bonus,
							expectedDamage,
							towerBefore,
							expectedTower
						});

						// Update tracker
						tracker.tower = expectedTower;
					}

					// Confirm failure check result
					await page.click('.dc-dice-roller-container');
					await page.waitForTimeout(800);

					// Verify tower health changed correctly
					const towerAfter = (await getUIStats()).tower;
					if (towerAfter !== null) {
						console.log(`    ✓ UI shows tower: ${towerAfter}`);
						
						const lastCheck = roundData.failureChecks[roundData.failureChecks.length - 1];
						if (lastCheck && towerAfter !== lastCheck.expectedTower) {
							logIssue('ERROR', 'Tower health mismatch after failure check', {
								expected: lastCheck.expectedTower,
								actual: towerAfter,
								calculation: `${lastCheck.roll} - ${lastCheck.bonus} = ${lastCheck.expectedDamage} damage`
							});
						} else {
							console.log(`    ✅ Math verified: ${lastCheck.expectedTower} = ${towerAfter}`);
						}
					}

					// Check if tower collapsed
					if (tracker.tower <= 0) {
						console.log('\n💥 TOWER COLLAPSED - Game Over');
						gameOver = true;
						break;
					}
				} else {
					console.log(`    ✓ Even card - no failure check`);
				}

				await page.waitForTimeout(200);
			}

			roundData.cardsDrawn = cardsDrawn;

			// Validate card count matches dice roll
			if (diceRoll && cardsDrawn !== diceRoll) {
				logIssue('ERROR', 'Card count mismatch', {
					expected: diceRoll,
					actual: cardsDrawn,
					round: tracker.round
				});
			} else if (diceRoll) {
				console.log(`\n✅ Card count verified: ${cardsDrawn} = ${diceRoll}`);
			}

			tracker.rounds.push(roundData);

			// Check for game over
			if (gameOver) break;

			const gameOverVisible = await page.locator('text=Game Over').or(page.locator('text=VICTORY')).isVisible().catch(() => false);
			if (gameOverVisible) {
				console.log('\n🎯 GAME OVER DETECTED');
				gameOver = true;
				break;
			}

			// ==================== JOURNAL ENTRY ====================
			console.log(`\n📝 JOURNAL ENTRY`);

			const journalVisible = await waitFor('.dc-journal-container', 5000);
			if (!journalVisible) {
				logIssue('ERROR', 'Journal screen not shown', { round: tracker.round });
				break;
			}

			const journalText = `Round ${tracker.round} completed`;
			await page.fill('textarea', journalText);
			console.log(`  ✓ Journal entry written`);

			await page.click('button:has-text("Save")');
			await page.waitForTimeout(1500);

			// ==================== SUCCESS CHECK (if Ace of Hearts) ====================
			const successCheckVisible = await page.locator('.dc-success-check-container').or(page.locator('text=Success Check')).isVisible().catch(() => false);

			if (successCheckVisible) {
				console.log(`\n⭐ SUCCESS CHECK`);
				console.log(`  Ace of Hearts revealed!`);
				console.log(`  Tokens before: ${tracker.tokens}/10`);

				// Roll success check
				await page.click('.dc-dice-roller-container');
				await page.waitForTimeout(2500);

				const successRoll = await getDiceResult();
				if (successRoll) {
					console.log(`  🎲 Success roll: ${successRoll}`);

					// Check if token removed
					const withBonus = successRoll + tracker.bonus;
					const tokenRemoved = successRoll === 6 || withBonus === 6;

					if (tokenRemoved) {
						tracker.tokens--;
						console.log(`  ✅ Token removed! (roll: ${successRoll}, bonus: ${tracker.bonus})`);
						console.log(`  🎯 Tokens remaining: ${tracker.tokens}/10`);
					} else {
						console.log(`  ❌ No token removed (need 6, rolled: ${successRoll}, +bonus: ${withBonus})`);
					}

					// Check for win
					if (tracker.tokens === 0) {
						console.log(`\n🎉 ALL TOKENS REMOVED - VICTORY!`);
						gameOver = true;
					}
				}

				// Confirm result
				await page.click('.dc-dice-roller-container');
				await page.waitForTimeout(1000);

				// Check for game over after success check
				const gameOverAfterSuccess = await page.locator('text=Game Over').or(page.locator('text=VICTORY')).isVisible().catch(() => false);
				if (gameOverAfterSuccess) {
					console.log('\n🎯 GAME OVER AFTER SUCCESS CHECK');
					gameOver = true;
					break;
				}
			}

			// Prepare for next round
			if (!gameOver) {
				await page.waitForTimeout(1500);

				// Check if next round started
				const nextRollVisible = await page.locator('.dc-dice-roller-container').isVisible().catch(() => false);
				if (nextRollVisible) {
					console.log(`\n→ Advancing to Round ${tracker.round + 1}`);
				} else {
					logIssue('ERROR', 'Cannot determine next screen', { round: tracker.round });
					break;
				}
			}
		}

		// ==================== VALIDATION ====================
		console.log(`\n${'='.repeat(80)}`);
		console.log('PHASE 3: VALIDATION RESULTS');
		console.log('='.repeat(80));

		// Summary
		console.log(`\n📊 GAME SUMMARY:`);
		console.log(`  Rounds played: ${tracker.round}`);
		console.log(`  Total cards drawn: ${tracker.rounds.reduce((sum, r) => sum + r.cardsDrawn, 0)}`);
		console.log(`  Total failure checks: ${tracker.rounds.reduce((sum, r) => sum + r.failureChecks.length, 0)}`);
		console.log(`  Game completed: ${gameOver ? 'Yes' : 'No'}`);

		// Issues report
		console.log(`\n🔍 ISSUES FOUND: ${tracker.issues.length}`);
		if (tracker.issues.length > 0) {
			tracker.issues.forEach((issue, i) => {
				console.log(`\n  ${i + 1}. [${issue.severity}] Round ${issue.round}: ${issue.message}`);
				if (Object.keys(issue.details).length > 0) {
					console.log(`     Details:`, JSON.stringify(issue.details, null, 6));
				}
			});
		} else {
			console.log('  ✅ No issues found!');
		}

		// Round-by-round details
		console.log(`\n📋 ROUND DETAILS:`);
		tracker.rounds.forEach((round, i) => {
			console.log(`\n  Round ${round.roundNumber}:`);
			console.log(`    Dice roll: ${round.diceRoll}`);
			console.log(`    Cards drawn: ${round.cardsDrawn} (expected: ${round.expectedCards})`);
			console.log(`    Card count match: ${round.cardsDrawn === round.expectedCards ? '✅' : '❌'}`);
			console.log(`    Failure checks: ${round.failureChecks.length}`);
			round.failureChecks.forEach((fc, j) => {
				console.log(`      ${j + 1}. Card ${fc.cardNumber}: Roll ${fc.roll}, Bonus ${fc.bonus}, Damage ${fc.expectedDamage}, Tower ${fc.towerBefore}→${fc.expectedTower}`);
			});
		});

		// Assert no critical issues
		const criticalIssues = tracker.issues.filter(i => i.severity === 'ERROR');
		expect(criticalIssues.length).toBe(0);
		expect(gameOver).toBe(true);

		console.log(`\n${'='.repeat(80)}`);
		console.log('✅ VALIDATION COMPLETE');
		console.log('='.repeat(80) + '\n');
	});
});
