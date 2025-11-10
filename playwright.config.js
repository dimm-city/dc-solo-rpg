/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	webServer: {
		command: 'npm run dev',
		port: 5173,
		reuseExistingServer: !process.env.CI
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	use: {
		// Use Playwright's bundled Chromium instead of system Chrome
		launchOptions: {
			args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
			headless: true
		},
		javaScriptEnabled: true,
		viewport: { width: 1280, height: 720 },
		baseURL: 'http://localhost:5173'
	}
};

export default config;
