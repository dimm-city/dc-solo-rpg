# Testing Guide

This document describes the testing strategy for DC Solo RPG.

## Testing Stack

- **Vitest** - Fast unit test framework powered by Vite
- **@testing-library/svelte** - Testing utilities for Svelte components
- **jsdom** - DOM implementation for Node.js testing
- **Playwright** - End-to-end browser testing (for CI/CD pipelines)

## Running Tests

```bash
# Run all Vitest unit tests
npm run test:unit

# Run tests in watch mode (useful during development)
npm run test:unit -- --watch

# Run tests with coverage
npm run test:unit -- --coverage

# Run specific test file
npm run test:unit -- src/lib/stores/gameStore.test.js

# Run Playwright E2E tests (requires proper display/GPU support)
npm test
```

## Test Structure

### Unit Tests

Unit tests are located alongside the source files with `.test.js` extension:

```
src/lib/
├── stores/
│   ├── gameStore.svelte.js
│   ├── gameStore.test.js          # 38 tests ✓
│   ├── transitions.js
│   └── transitions.test.js        # 45 tests ✓
└── components/
    └── [component tests - TBD]
```

### E2E Tests

Playwright tests are located in the `tests/` directory:

```
tests/
├── reliable-game-flow.spec.js   # Comprehensive game flow tests
├── debug-error.spec.js          # Debug helpers
├── minimal.spec.js              # Minimal navigation tests
└── ...
```

## Test Coverage

### Store Tests (83 tests - All passing ✓)

#### gameStore.test.js (38 tests)
Tests the core Svelte 5 runes-based game state management:

- **Initial State** - Validates default game state values
- **State Queries** - Tests getCurrentScreen(), getGameStats(), etc.
- **Win/Loss Conditions** - Tests getHasWon() and getHasLost()
- **Event Management** - Tests getCurrentEvents() filtering
- **State Transitions** - Tests validateTransition() and transitionTo()
- **State Updates** - Tests updateGameState() mutations
- **King Tracking** - Tests king card revelation tracking
- **Ace Tracking** - Tests Ace of Hearts revelation
- **Journal Entries** - Tests journal entry management
- **Game Configuration** - Tests config, system config, and stylesheet storage

#### transitions.test.js (45 tests)
Tests the pure state transition graph:

- **Transition Graph Structure** - Validates all required states exist
- **Valid Transitions** - Tests all allowed state transitions
- **Invalid Transitions** - Tests rejected transitions
- **Emergency Exits** - Tests exitGame and errorScreen always available
- **Edge Cases** - Tests undefined/null/unknown states
- **Complex Game Flows** - Tests complete game scenarios
- **State Machine Integrity** - Tests for orphaned states and circular dependencies

### Component Tests (Future Work)

Component tests require additional configuration for Svelte 5 runes in testing environments. The following component test templates have been created but need Svelte 5 SSR testing support:

- `IntroScreen.test.js` - Game introduction and rules
- `NeuralBackground.test.js` - Canvas background error handling
- `StatusDisplay.test.js` - Game status UI

**Note**: These tests are currently disabled pending better Svelte 5 component testing support in `@testing-library/svelte`.

## Playwright E2E Tests

Playwright tests require a proper display environment (X server or equivalent). They are designed to run in:

- **GitHub Actions** - CI/CD pipelines with headless Chrome
- **GitLab CI** - CI/CD with Docker containers
- **Local Development** - Machines with display support

### Current Playwright Test Status

**Known Issue**: Playwright tests currently fail in environments without proper display/GPU support due to Chromium initialization requirements. The test infrastructure is complete and will work in standard CI/CD environments.

**Test Suite Includes**:
- Multi-viewport testing (Desktop, Mobile, Tablet)
- Comprehensive data-testid selectors throughout the app
- Screenshot/video/trace capture on failure
- Proper timeouts and error handling

## Test Configuration

### Vitest Configuration (`vite.config.js`)

```javascript
test: {
  include: ['src/**/*.{test,spec}.{js,ts}'],
  environment: 'jsdom',
  globals: true,
  setupFiles: ['./src/test-setup.js'],
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    include: ['src/lib/**/*.{js,ts,svelte}'],
    exclude: ['**/*.spec.js', '**/*.test.js', '**/test-setup.js']
  }
}
```

### Playwright Configuration (`playwright.config.js`)

```javascript
{
  webServer: {
    command: 'npm run dev',
    port: 5173
  },
  use: {
    launchOptions: {
      args: ['--headless=new', '--no-sandbox', '--disable-setuid-sandbox']
    },
    baseURL: 'http://localhost:5173'
  },
  projects: [
    { name: 'Desktop Chrome', use: { viewport: { width: 1280, height: 1280 } } },
    { name: 'Mobile Chrome', use: { viewport: { width: 375, height: 667 }, isMobile: true } },
    { name: 'Tablet', use: { viewport: { width: 768, height: 1024 }, isMobile: true } }
  ]
}
```

## Writing Tests

### Unit Test Example

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { gameState, transitionTo } from './gameStore.svelte.js';

describe('gameStore', () => {
  beforeEach(() => {
    // Reset state before each test
    gameState.state = 'loadGame';
  });

  it('should transition to valid state', () => {
    transitionTo('options');
    expect(gameState.state).toBe('options');
  });
});
```

### Playwright Test Example

```javascript
import { test, expect } from '@playwright/test';

test('should complete game flow', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('game-select').selectOption({ index: 1 });
  await page.getByTestId('load-game-button').click();

  await expect(page.getByTestId('game-container')).toBeVisible();
});
```

## Test Best Practices

1. **Isolation** - Each test should be independent and not rely on other tests
2. **Reset State** - Use `beforeEach()` to reset state before each test
3. **Descriptive Names** - Test names should clearly describe what is being tested
4. **AAA Pattern** - Arrange, Act, Assert structure
5. **Single Assertion** - Each test should verify one behavior (when possible)
6. **Mock External Dependencies** - Mock network calls, file system, etc.

## Continuous Integration

### For GitHub Actions

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run unit tests
  run: npm run test:unit -- --run

- name: Run E2E tests
  run: npm test
```

### For GitLab CI

```yaml
test:
  script:
    - npm ci
    - npx playwright install --with-deps
    - npm run test:unit -- --run
    - npm test
```

## Troubleshooting

### Playwright Tests Failing

**Error**: `Page crashed` or `Missing X server`

**Solution**: Ensure you're running in an environment with display support. Use `xvfb-run` on Linux:

```bash
xvfb-run npm test
```

### Component Tests Not Working

**Error**: `lifecycle_function_unavailable` or `mount(...) is not available`

**Solution**: Svelte 5 component testing is still evolving. For now, focus on unit tests for stores and logic. Component tests will be added when `@testing-library/svelte` fully supports Svelte 5 runes.

### Test Timeouts

**Error**: `Test timeout exceeded`

**Solution**: Increase timeout in `vite.config.js`:

```javascript
test: {
  testTimeout: 10000 // 10 seconds
}
```

## Future Improvements

- [ ] Complete Svelte 5 component testing setup
- [ ] Add visual regression testing
- [ ] Add integration tests for game logic flows
- [ ] Increase code coverage to 80%+
- [ ] Add accessibility testing with axe-core
- [ ] Add performance testing benchmarks

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Svelte](https://testing-library.com/docs/svelte-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Svelte 5 Testing Guide](https://svelte.dev/docs/svelte/v5-migration-guide#Testing)
