if (process.env.JEST_WORKER_ID) {
  test.skip('runs with the Playwright E2E runner', () => {});
} else {
  const { expect, test } = require('@playwright/test');

  // The popup starts at the product's current amount (0), so reaching a target
  // quantity requires that many `increase` clicks before confirming.
  const addProduct = async (page, productTestId, quantity = 1) => {
    const product = page.getByTestId(productTestId);
    await product.click();
    const popup = product.getByTestId('quantity-popup');
    await expect(popup).toBeVisible();
    for (let i = 0; i < quantity; i++) {
      await popup.getByTestId('quantity-increase').click();
    }
    await popup.getByTestId('quantity-add').click();
    await expect(popup).not.toBeVisible();
  };

  const reachCart = async (page, quantity = 1) => {
    await page.goto('/');
    await page.getByTestId('category-Comida').click();
    await page.getByTestId('shop-card-e2e-fixture-shop').click();
    await addProduct(page, 'product-e2e-product', quantity);
    await page.getByTestId('review-order').click();
    await expect(page.getByTestId('customer-name')).toBeVisible();
  };

  // Characterizes the current behavior tracked in #142: the shop slice is
  // blacklisted from Redux persistence, so a full reload on the cart page
  // loses the shop and `pages/cart.jsx` redirects to home.
  test('reload on the cart page loses the in-progress order and redirects home (#142)', async ({ page }) => {
    await reachCart(page);

    await page.reload();
    await page.waitForURL('**/');

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId('review-order')).not.toBeVisible();
  });

  // Characterizes a second gap tracked in #142: `components/Cart/Form.jsx`
  // never dispatches to the persisted `cart` slice (the import is commented
  // out), so the customer data lives only in local form state and is lost on
  // any navigation away and back, even without a reload.
  test('loses customer form data when navigating away and back (#142)', async ({ page }) => {
    await reachCart(page);

    await page.getByTestId('customer-name').fill('Persist Name');
    await page.getByTestId('customer-address').fill('Persist Address');
    await page.getByTestId('order-notes').fill('Persist Notes');

    // Go back to the shop and forward again.
    await page.goBack();
    await page.waitForURL('**/e2e-fixture-shop');
    await page.goForward();
    await page.waitForURL('**/cart');

    await expect(page.getByTestId('customer-name')).toHaveValue('');
    await expect(page.getByTestId('customer-address')).toHaveValue('');
    await expect(page.getByTestId('order-notes')).toHaveValue('');
  });
}
