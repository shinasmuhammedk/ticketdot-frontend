import { test, expect } from '@playwright/test';

test.describe('Authentication & Session Invalidation Smoke Test', () => {
  test('passenger logout revokes refresh token and prevents reuse', async ({ page, request }) => {
    // 1. Login as seeded passenger
    await page.goto('/login');
    await page.fill('#email', 'passenger@test.com');
    await page.fill('#password', 'Password123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/dashboard/);

    // 2. Retrieve refresh token from localStorage
    const refreshToken = await page.evaluate(() => localStorage.getItem('refresh_token'));
    expect(refreshToken).toBeTruthy();

    // 3. Open user dropdown in Navbar and click Logout
    // The account menu trigger is the button in the header right containing the user initial or name
    const accountBtn = page.locator('header button').last();
    await accountBtn.click();

    const logoutBtn = page.locator('button:has-text("Log out")');
    await expect(logoutBtn).toBeVisible({ timeout: 5000 });
    await logoutBtn.click();

    // Confirm redirected to /login
    await expect(page).toHaveURL(/.*\/login/);

    // Confirm local storage cleared
    const storedToken = await page.evaluate(() => localStorage.getItem('token'));
    const storedRefresh = await page.evaluate(() => localStorage.getItem('refresh_token'));
    expect(storedToken).toBeNull();
    expect(storedRefresh).toBeNull();

    // 4. Confirm refresh token is rejected by the backend server
    const apiBaseUrl = process.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const refreshRes = await request.post(`${apiBaseUrl}/auth/refresh`, {
      data: {
        refresh_token: refreshToken,
      },
    });

    expect(refreshRes.status()).toBe(401);
  });
});
