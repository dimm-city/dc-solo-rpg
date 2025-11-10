import { test, expect } from '@playwright/test';

/**
 * Integration tests for card drawing and failure check UI flow
 * 
 * These tests verify that:
 * 1. Cards are displayed before failure checks
 * 2. Card information appears in the journal
 * 3. The neural background is visible throughout the game
 * 4. Header font sizes are appropriate
 */

test.describe('Card Drawing and Failure Check UI Flow', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to game page
		await page.goto('/game');
		
		// Wait for the game to load
		await page.waitForSelector('h2:has-text("Future Lost")', { timeout: 5000 });
		
		// Start the game
		await page.click('button:has-text("Start Game")');
		await page.waitForTimeout(500);
		
		// Skip intro screens
		await page.click('button:has-text("continue")');
		await page.waitForTimeout(500);
		await page.click('button:has-text("start")');
		await page.waitForTimeout(2000);
	});

	test('should display card before failure check', async ({ page }) => {
		// Roll for tasks
		await page.click('button:has-text("Roll for tasks")');
		await page.waitForTimeout(5000); // Wait for dice animation
		
		// Click to continue after dice roll
		await page.click('button:has-text("Click to continue")');
		await page.waitForTimeout(500);
		
		// Draw cards until we hit a failure check
		let maxAttempts = 10;
		let foundFailureCheck = false;
		
		for (let i = 0; i < maxAttempts; i++) {
			// Click intercept fragment
			const interceptButton = await page.$('button:has-text("INTERCEPT FRAGMENT")');
			if (!interceptButton) break;
			
			await interceptButton.click();
			await page.waitForTimeout(2000); // Wait for card animation
			
			// Check if we can see card description
			const cardDescription = await page.$('p.fragment-data, p.card-description');
			if (cardDescription) {
				const descText = await cardDescription.textContent();
				console.log('Card description visible:', descText);
			}
			
			// Check if we're in failure check state
			const failureCheckButton = await page.$('button:has-text("Roll failure check")');
			
			if (failureCheckButton) {
				foundFailureCheck = true;
				
				// CRITICAL: Card information should be visible
				const cardInfo = await page.$('.card-info');
				expect(cardInfo).not.toBeNull();
				
				// Check that card description is displayed
				const cardDesc = await page.$('.card-description');
				expect(cardDesc).not.toBeNull();
				const descText = await cardDesc?.textContent();
				expect(descText).toBeTruthy();
				expect(descText.length).toBeGreaterThan(0);
				
				// Check that card ID is displayed
				const cardId = await page.$('.card-id');
				expect(cardId).not.toBeNull();
				const idText = await cardId?.textContent();
				expect(idText).toMatch(/\w+ of \w+/); // e.g., "5 of hearts"
				
				console.log('✓ Card displayed before failure check:', descText);
				break;
			} else {
				// Click continue to next card
				const continueButton = await page.$('button:has-text("CONTINUE")');
				if (continueButton) {
					await continueButton.click();
					await page.waitForTimeout(500);
				}
			}
		}
		
		expect(foundFailureCheck).toBe(true);
	});

	test('should show card information in journal', async ({ page }) => {
		// Roll for tasks
		await page.click('button:has-text("Roll for tasks")');
		await page.waitForTimeout(5000);
		await page.click('button:has-text("Click to continue")');
		await page.waitForTimeout(500);
		
		// Draw all cards and track descriptions
		const drawnCards = [];
		let maxAttempts = 10;
		
		for (let i = 0; i < maxAttempts; i++) {
			// Check if we reached journal screen
			const journalHeading = await page.$('h2:has-text("Record your journal entry"), h2:has-text("RECORD YOUR JOURNAL ENTRY")');
			if (journalHeading) {
				console.log('Reached journal screen');
				break;
			}
			
			// Check for intercept button
			const interceptButton = await page.$('button:has-text("INTERCEPT FRAGMENT")');
			if (!interceptButton) {
				// Might be in failure check or other state
				const failureButton = await page.$('button:has-text("Roll failure check")');
				if (failureButton) {
					await failureButton.click();
					await page.waitForTimeout(5000);
					
					// Click to continue after failure check
					const continueBtn = await page.$('button:has-text("Click to continue")');
					if (continueBtn) {
						await continueBtn.click();
						await page.waitForTimeout(500);
					}
				}
				continue;
			}
			
			// Draw card
			await interceptButton.click();
			await page.waitForTimeout(2000);
			
			// Try to get card description
			const cardDesc = await page.$('p.fragment-data, p.card-description');
			if (cardDesc) {
				const text = await cardDesc.textContent();
				drawnCards.push(text);
				console.log('Drew card:', text);
			}
			
			// Click continue
			const continueButton = await page.$('button:has-text("CONTINUE")');
			if (continueButton) {
				await continueButton.click();
				await page.waitForTimeout(500);
			}
			
			// Handle failure check if needed
			const failureButton = await page.$('button:has-text("Roll failure check")');
			if (failureButton) {
				// Record the card description from failure check screen
				const failureCardDesc = await page.$('.card-description');
				if (failureCardDesc) {
					const text = await failureCardDesc.textContent();
					console.log('Failure check card:', text);
				}
				
				await failureButton.click();
				await page.waitForTimeout(5000);
				
				const continueBtn = await page.$('button:has-text("Click to continue")');
				if (continueBtn) {
					await continueBtn.click();
					await page.waitForTimeout(500);
				}
			}
		}
		
		// Should now be on journal screen
		const journalHeading = await page.waitForSelector('h2:has-text("Record your journal entry"), h2:has-text("RECORD YOUR JOURNAL ENTRY")');
		expect(journalHeading).not.toBeNull();
		
		// Check that card descriptions appear in the summary
		const summarySection = await page.$('div.journal-header-area, [class*="journal"]');
		expect(summarySection).not.toBeNull();
		
		// Get all event descriptions
		const eventParagraphs = await page.$$('p');
		const eventTexts = await Promise.all(eventParagraphs.map(p => p.textContent()));
		
		// Filter for game events (format: "1.1:description")
		const gameEvents = eventTexts.filter(text => /^\d+\.\d+:/.test(text));
		
		console.log('Journal events:', gameEvents);
		expect(gameEvents.length).toBeGreaterThan(0);
		
		// Verify events contain card information
		for (const event of gameEvents) {
			expect(event).toMatch(/^\d+\.\d+:/); // Should have ID format
			expect(event.length).toBeGreaterThan(5); // Should have description
		}
	});

	test('should display neural background throughout game', async ({ page }) => {
		// Check for neural background canvas
		const neuralBackground = await page.$('canvas.particle-field');
		expect(neuralBackground).not.toBeNull();
		
		// Check for scan grid
		const scanGrid = await page.$('.scan-grid');
		expect(scanGrid).not.toBeNull();
		
		// Roll for tasks and verify background still visible
		await page.click('button:has-text("Roll for tasks")');
		await page.waitForTimeout(3000);
		
		const backgroundAfterRoll = await page.$('canvas.particle-field');
		expect(backgroundAfterRoll).not.toBeNull();
	});

	test('should have appropriately sized headers', async ({ page }) => {
		// Check toolbar header size
		const toolbarHeader = await page.$('h3:has-text("Future Lost")');
		expect(toolbarHeader).not.toBeNull();
		
		const headerStyles = await toolbarHeader?.evaluate(el => {
			const styles = window.getComputedStyle(el);
			return {
				fontSize: styles.fontSize,
				fontFamily: styles.fontFamily
			};
		});
		
		// Font size should be reasonable (not too large)
		const fontSize = parseInt(headerStyles?.fontSize || '0');
		expect(fontSize).toBeLessThan(30); // Should be less than 30px
		expect(fontSize).toBeGreaterThan(14); // But still readable
		
		console.log('Toolbar header font size:', headerStyles?.fontSize);
	});
});

test.describe('Mobile Responsiveness', () => {
	test('should be playable on mobile screen sizes', async ({ page }) => {
		// Set viewport to mobile size
		await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
		
		await page.goto('/game');
		await page.waitForSelector('h2:has-text("Future Lost")', { timeout: 5000 });
		
		// Start game
		await page.click('button:has-text("Start Game")');
		await page.waitForTimeout(500);
		
		// Check that content is visible and not overflowing
		const body = await page.$('body');
		const bodyBox = await body?.boundingBox();
		
		expect(bodyBox?.width).toBeLessThanOrEqual(375);
		
		// Navigate through game
		await page.click('button:has-text("continue")');
		await page.waitForTimeout(500);
		await page.click('button:has-text("start")');
		await page.waitForTimeout(2000);
		
		// Check that buttons are accessible
		const rollButton = await page.$('button:has-text("Roll for tasks")');
		expect(rollButton).not.toBeNull();
		
		const rollBox = await rollButton?.boundingBox();
		expect(rollBox?.width).toBeLessThanOrEqual(375);
		expect(rollBox?.height).toBeGreaterThanOrEqual(44); // Minimum touch target size
	});
});
