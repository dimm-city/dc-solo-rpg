/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	webServer: {
		// Use dev server (separate from preview on 4173)
		command: 'npm run dev',
		port: 5173,
		reuseExistingServer: !process.env.CI,
		timeout: 120000
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	timeout: 30000, // 30 second timeout per test
	expect: {
		timeout: 10000 // 10 second timeout for assertions
	},
	use: {
		// Use Playwright's bundled Chromium instead of system Chrome
		launchOptions: {
			args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
			headless: true
		},
		javaScriptEnabled: true,
		viewport: { width: 1280, height: 720 },
		baseURL: 'http://localhost:5173',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
		trace: 'retain-on-failure'
	},
	// Configure different viewport projects
	projects: [
		{
			name: 'Desktop Chrome',
			use: {
				viewport: { width: 1280, height: 720 }
			}
		},
		{
			name: 'Mobile Chrome',
			use: {
				viewport: { width: 375, height: 667 },
				isMobile: true,
				hasTouch: true
			}
		},
		{
			name: 'Tablet',
			use: {
				viewport: { width: 768, height: 1024 },
				isMobile: true,
				hasTouch: true
			}
		}
	]
};

export default config;
