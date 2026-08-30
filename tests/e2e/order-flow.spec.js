if (process.env.JEST_WORKER_ID) {
  test.skip('runs with the Playwright E2E runner', () => {});
} else {
  const { expect, test } = require('@playwright/test');

  test('places one deterministic fixture product order through WhatsApp', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('category-Comida').click();
    await page.getByTestId('shop-card-e2e-fixture-shop').click();

    const product = page.getByTestId('product-e2e-fixture-product');
    await expect(product).toBeVisible();
    await product.click();

    await expect(page.getByTestId('quantity-popup')).toBeVisible();
    await page.getByTestId('quantity-increase').click();
    await page.getByTestId('quantity-add').click();

    await page.getByTestId('review-order').click();
    await page.getByTestId('customer-name').fill('E2E Customer');
    await page.getByTestId('customer-address').fill('E2E Address');
    await page.getByTestId('order-notes').fill('E2E Notes');

    await page.route('https://wa.me/**', (route) =>
      route.fulfill({ body: '', contentType: 'text/plain', status: 200 })
    );
    const whatsappNavigation = page.waitForURL(/^https:\/\/wa\.me\/5491100000000\?text=/, {
      waitUntil: 'commit',
    });
    await page.getByTestId('submit-whatsapp-order').click({ noWaitAfter: true });
    await whatsappNavigation;

    const outgoingURL = new URL(page.url());
    expect(outgoingURL.hostname).toBe('wa.me');
    expect(outgoingURL.pathname).toBe('/5491100000000');

    const decodedOrder = outgoingURL.searchParams.get('text');
    expect(decodedOrder).toContain('✅ 1 x E2E Product');
  });
}
