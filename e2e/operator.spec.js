import { test, expect } from '@playwright/test';

test.describe('Operator Portal Flow Smoke Test', () => {
  test('operator: login, create bus, route, schedule, see it in dashboard', async ({ page }) => {
    // 1. Operator Login
    await page.goto('/login');
    await page.fill('#email', 'operator@test.com');
    await page.fill('#password', 'Password123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/operator\/dashboard/);
    await expect(page.locator('text=Fleet Overview')).toBeVisible();

    // 2. Create Bus
    await page.goto('/operator/create-bus');
    const randomReg = `MH-12-TEST-${Math.floor(1000 + Math.random() * 9000)}`;
    await page.fill('input[placeholder*="MH-"]', randomReg);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/operator\/buses.*/, { timeout: 15000 });
    await expect(page.locator(`text=${randomReg}`)).toBeVisible({ timeout: 10000 });

    // 3. Create Route
    await page.goto('/operator/create-route');
    // Select origin city (index 1) and destination city (index 2)
    const originSelect = page.locator('select').first();
    await originSelect.waitFor();
    await originSelect.selectOption({ index: 1 });

    const destSelect = page.locator('select').nth(1);
    await destSelect.selectOption({ index: 2 });

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/operator\/routes.*/, { timeout: 15000 });

    // 4. Create Schedule
    await page.goto('/operator/create-schedule');
    const routeSelect = page.locator('select').first();
    await routeSelect.waitFor();
    await routeSelect.selectOption({ index: 1 });

    const busSelect = page.locator('select').nth(1);
    await busSelect.selectOption({ index: 1 });

    const fareInput = page.locator('input[placeholder="450"]');
    await fareInput.fill('550');

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/operator\/schedules.*/, { timeout: 15000 });

    // 5. Verify in Dashboard
    await page.goto('/operator/dashboard');
    await expect(page.locator('text=Fleet Overview')).toBeVisible();
    await expect(page.locator('text=Trip Schedules')).toBeVisible();
  });
});
