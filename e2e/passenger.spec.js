import { test, expect } from '@playwright/test';

test.describe('Passenger Journey Smoke Test', () => {
  test('signup, login, search, pick seats, lock, pay via demo flow, see ticket', async ({ page }) => {
    const timestamp = Date.now();
    const email = `passenger_smoke_${timestamp}@test.com`;
    const password = 'Password123!';

    // 1. Signup
    await page.goto('/signup');
    await page.fill('#name', 'Smoke Tester');
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.fill('#confirmPassword', password);
    await page.click('button[type="submit"]');

    // Should redirect to /login
    await expect(page).toHaveURL(/.*\/login/);

    // 2. Login
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');

    // Should redirect to /dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);

    // 3. Search for buses (Mumbai -> Pune for Tomorrow)
    await page.fill('input[placeholder*="Mumbai"]', 'Mumbai');
    await page.fill('input[placeholder*="Pune"]', 'Pune');
    await page.click('button:has-text("Tomorrow")');
    await page.click('button[type="submit"]:has-text("Find Buses")');

    // Should navigate to /search
    await expect(page).toHaveURL(/.*\/search.*/);

    // Wait for bus cards and click "Select Seats"
    const selectSeatsBtn = page.locator('button:has-text("Select Seats")').first();
    await expect(selectSeatsBtn).toBeVisible({ timeout: 15000 });
    await selectSeatsBtn.click();

    // Should navigate to /seat-selection
    await expect(page).toHaveURL(/.*\/seat-selection.*/);

    // 4. Pick an available seat
    const availableSeat = page.locator('button[aria-label*="available"]').first();
    await expect(availableSeat).toBeVisible({ timeout: 10000 });
    await availableSeat.click();

    // Lock seats
    const lockBtn = page.locator('button:has-text("Lock & Proceed")');
    await expect(lockBtn).toBeEnabled();
    await lockBtn.click();

    // 5. Fill passenger details
    await expect(page.locator('button:has-text("Proceed to Payment")')).toBeVisible({ timeout: 10000 });

    const nameInput = page.locator('input[placeholder="Full Name"]').first();
    await nameInput.fill('Smoke Tester');

    const ageInput = page.locator('input[placeholder="Age"]').first();
    await ageInput.fill('28');

    const phoneInput = page.locator('input[placeholder="Mobile No."]').first();
    await phoneInput.fill('9876543210');

    // 6. Open Payment Modal
    await page.click('button:has-text("Proceed to Payment")');

    // Modal opens, wait for Pay button
    const payBtn = page.locator('[data-testid="pay-button"]');
    await expect(payBtn).toBeVisible({ timeout: 15000 });
    await expect(payBtn).toContainText('Pay ₹', { timeout: 15000 });
    await expect(payBtn).toBeEnabled({ timeout: 15000 });
    await payBtn.click();

    // 7. Verify booking confirmation and ticket view
    await expect(page).toHaveURL(/.*\/booking-success.*/, { timeout: 20000 });
    await expect(page.locator('text=Booking Confirmed!')).toBeVisible();
    await expect(page.locator('text=Your seats have been successfully reserved')).toBeVisible();
  });
});
