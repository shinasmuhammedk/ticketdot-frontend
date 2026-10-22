import { test, expect } from '@playwright/test';

test.describe('Role-Based Access Control Smoke Test', () => {
  test('a passenger cannot access operator portal pages', async ({ page }) => {
    // 1. Login as passenger
    await page.goto('/login');
    await page.fill('#email', 'passenger@test.com');
    await page.fill('#password', 'Password123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/dashboard/);

    // 2. Attempt direct navigation to operator dashboard
    await page.goto('/operator/dashboard');
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.locator('text=Fleet Overview')).not.toBeVisible();

    // 3. Attempt direct navigation to create bus
    await page.goto('/operator/create-bus');
    await expect(page).toHaveURL(/.*\/dashboard/);

    // 4. Attempt direct navigation to create schedule
    await page.goto('/operator/create-schedule');
    await expect(page).toHaveURL(/.*\/dashboard/);

    // 5. Attempt direct navigation to operator schedules list
    await page.goto('/operator/schedules');
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('an unauthenticated user is redirected to login when accessing operator routes', async ({ page }) => {
    await page.goto('/operator/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });
});
