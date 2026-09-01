const { expect } = require("@playwright/test");

/**
 * Navigate from home to a specific shop by selecting its category then card.
 */
async function navigateToShop(
  page,
  shopSlug = "e2e-fixture-shop",
  category = "Comida",
) {
  await page.goto("/");
  await page.getByTestId(`category-${category}`).click();
  await page.getByTestId(`shop-card-${shopSlug}`).click();
}

/**
 * Add a product with a given quantity via the quantity popup.
 *
 * The popup starts at the product's current amount (0), so reaching a target
 * quantity requires that many `increase` clicks before confirming.
 */
async function addProduct(page, productTestId, quantity = 1) {
  const product = page.getByTestId(productTestId);
  await product.click();
  const popup = product.getByTestId("quantity-popup");
  await expect(popup).toBeVisible();
  for (let i = 0; i < quantity; i++) {
    await popup.getByTestId("quantity-increase").click();
  }
  await popup.getByTestId("quantity-add").click();
  await expect(popup).not.toBeVisible();
}

/**
 * Click "review order" and wait for the cart form to be ready.
 */
async function goToCart(page) {
  await page.getByTestId("review-order").click();
  await expect(page.getByTestId("customer-name")).toBeVisible();
}

/**
 * Convenience: navigate to the fixture shop, add the default product, and
 * reach the cart form. Accepts an optional custom quantity.
 */
async function reachCart(page, quantity = 1) {
  await navigateToShop(page);
  await addProduct(page, "product-e2e-product", quantity);
  await goToCart(page);
}

/**
 * Intercept WhatsApp navigation so the page never actually leaves the app.
 */
async function interceptWhatsApp(page) {
  await page.route("https://wa.me/**", (route) =>
    route.fulfill({ body: "", contentType: "text/plain", status: 200 }),
  );
}

/**
 * Submit the WhatsApp order, wait for wa.me navigation, and return the
 * parsed outgoing URL for further assertion.
 */
async function submitAndParseWhatsApp(page) {
  const whatsappNavigation = page.waitForURL(
    /^https:\/\/wa\.me\/5491100000000\?text=/,
    {
      waitUntil: "commit",
    },
  );
  await page.getByTestId("submit-whatsapp-order").click({ noWaitAfter: true });
  await whatsappNavigation;
  return new URL(page.url());
}

module.exports = {
  addProduct,
  goToCart,
  interceptWhatsApp,
  navigateToShop,
  reachCart,
  submitAndParseWhatsApp,
};
