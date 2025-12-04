import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E-Commerce frontend tests
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Run tests sequentially for checkout flow
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for sequential tests
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:5177',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:5177',
  //   reuseExistingServer: !process.env.CI,
  // },
});
