import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendDir = process.env.BACKEND_DIR || (
  fs.existsSync(path.resolve(__dirname, '../TicketDot'))
    ? path.resolve(__dirname, '../TicketDot')
    : path.resolve(__dirname, '../../TicketDot')
);

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.js',
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'go run ./cmd/api/main.go',
      cwd: backendDir,
      url: 'http://127.0.0.1:8080/health',
      reuseExistingServer: !process.env.CI,
      env: {
        DATABASE_URL: process.env.DATABASE_URL || 'postgres://postgres:Shinas@localhost:5432/busticket_test?sslmode=disable',
        APP_ENV: 'development',
        JWT_SECRET: 'dev-jwt-secret-ticketdot-round-3-must-be-long-enough',
        PAYMENT_GATEWAY: 'fake',
        PAYMENT_WEBHOOK_SECRET: process.env.PAYMENT_WEBHOOK_SECRET || 'rzp_test_dev_dummy_webhook_secret',
        LOGIN_RATE_LIMIT: '1000',
        SIGNUP_RATE_LIMIT: '1000',
        GLOBAL_RATE_LIMIT: '5000',
        RATE_LIMIT_WEBHOOK_PER_MIN: '5000',
        PORT: '8080',
        ALLOWED_ORIGINS: 'http://localhost:5173,http://127.0.0.1:5173',
      },
      timeout: 120000,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
});
