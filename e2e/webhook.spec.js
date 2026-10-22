import { test, expect } from '@playwright/test';
import crypto from 'node:crypto';

test.describe('Webhook Before Verify E2E Smoke Test', () => {
  test('user opens modal, webhook confirms payment before client verify, client sees confirmed booking', async ({ page }) => {
    const timestamp = Date.now();
    const email = `webhook_smoke_${timestamp}@test.com`;
    const password = 'Password123!';
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || 'rzp_test_dev_dummy_webhook_secret';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_dev_dummy_secret';
    const paymentId = `pay_e2e${timestamp}`;

    // Mock Razorpay Checkout SDK on window
    await page.addInitScript(({ pId }) => {
      window.Razorpay = class MockRazorpay {
        constructor(options) {
          this.options = options;
          window.__lastRzp = this;
        }
        open() {
          window.__rzpOpened = true;
        }
      };
    }, { pId: paymentId });

    // 1. Signup
    await page.goto('/signup');
    await page.fill('#name', 'Webhook Tester');
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
    await nameInput.fill('Webhook Tester');

    const ageInput = page.locator('input[placeholder="Age"]').first();
    await ageInput.fill('30');

    const phoneInput = page.locator('input[placeholder="Mobile No."]').first();
    await phoneInput.fill('9876543210');

    // 6. Set up listener for order creation before opening modal
    const orderPromise = page.waitForResponse((res) =>
      res.url().includes('/payments/orders') && (res.status() === 200 || res.status() === 201)
    );

    // Open Payment Modal
    await page.click('button:has-text("Proceed to Payment")');

    // Wait for the gateway order creation response
    const orderRes = await orderPromise;
    const orderJson = await orderRes.json();
    const orderData = orderJson.data;
    expect(orderData).toBeDefined();
    expect(orderData.order_id).toBeDefined();

    const orderId = orderData.order_id;
    const amountPaise = orderData.amount_paise || orderData.amount || 50000;
    const currency = orderData.currency || 'INR';

    // Modal is open, click pay button to trigger checkout
    const payBtn = page.locator('[data-testid="pay-button"]');
    await expect(payBtn).toBeVisible({ timeout: 15000 });
    await expect(payBtn).toBeEnabled({ timeout: 15000 });
    await payBtn.click();

    // Wait for mock Razorpay open() to have been called
    await page.waitForFunction(() => window.__rzpOpened === true);

    // 7. Backend receives the webhook BEFORE client verify
    const webhookPayloadObj = {
      entity: 'event',
      account_id: 'acc_test',
      event: 'payment.captured',
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: paymentId,
            entity: 'payment',
            amount: amountPaise,
            currency: currency,
            status: 'captured',
            order_id: orderId,
            method: 'upi',
            captured: true,
          },
        },
      },
      created_at: Math.floor(Date.now() / 1000),
    };
    const rawWebhookBody = JSON.stringify(webhookPayloadObj);
    const webhookSig = crypto.createHmac('sha256', webhookSecret).update(rawWebhookBody).digest('hex');
    const eventId = `evt_e2e_${Date.now()}`;

    // Post webhook directly to backend
    const webhookRes = await page.request.post('http://127.0.0.1:8080/payments/webhook', {
      data: rawWebhookBody,
      headers: {
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': webhookSig,
        'X-Razorpay-Event-Id': eventId,
      },
    });
    expect(webhookRes.status()).toBe(200);

    // 8. Now client checkout handler triggers verify call with the same payment ID
    const verifySig = crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex');
    await page.evaluate(({ pId, sig }) => {
      window.__lastRzp.options.handler({
        razorpay_payment_id: pId,
        razorpay_signature: sig,
      });
    }, { pId: paymentId, sig: verifySig });

    // 9. Booking is confirmed without error!
    await expect(page).toHaveURL(/.*\/booking-success.*/, { timeout: 20000 });
    await expect(page.locator('text=Booking Confirmed!')).toBeVisible();
    await expect(page.locator('text=Your seats have been successfully reserved')).toBeVisible();

    // 10. Check "My Bookings" page
    await page.goto('/my-bookings');
    await expect(page.locator('text=Confirmed').first()).toBeVisible({ timeout: 10000 });
  });
});
