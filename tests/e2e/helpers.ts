import { expect, type Page, type Route } from "@playwright/test";

export const FIXTURE = {
  category: "Comida",
  phoneNumber: "5491100000000",
  productTestIds: ["product-e2e-product", "product-e2e-second-product"],
  shopSlug: "e2e-fixture-shop",
} as const;

export type CustomerForm = {
  name: string;
  address?: string;
  notes?: string;
};

/**
 * Navigate from home to a specific shop by selecting its category then card.
 */
async function navigateToShop(
  page: Page,
  shopSlug = FIXTURE.shopSlug,
  category = FIXTURE.category,
) {
  await page.goto("/");
  await page.getByTestId(`category-${category}`).first().click();
  await page.getByTestId(`shop-card-${shopSlug}`).click();
}

/**
 * Add a product with a given quantity via the quantity popup.
 *
 * The popup starts at the product's current amount (0), so reaching a target
 * quantity requires that many `increase` clicks before confirming.
 */
async function addProduct(page: Page, productTestId: string, quantity = 1) {
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
async function reviewCart(page: Page) {
  await page.getByTestId("review-order").click();
  await expect(page.getByTestId("customer-name")).toBeVisible();
}

/** Fill the customer fields used by the cart form. */
async function fillCustomerForm(page: Page, form: CustomerForm) {
  await page.getByTestId("customer-name").fill(form.name);
  if (form.address !== undefined) {
    await page.getByTestId("customer-address").fill(form.address);
  }
  if (form.notes !== undefined) {
    await page.getByTestId("order-notes").fill(form.notes);
  }
}

/** Clear persisted cart state before a journey starts. */
async function clearCartStorage(page: Page) {
  await page.addInitScript(() => {
    try {
      window.localStorage.removeItem("hacerpedido_cart_state");
    } catch {
      // about:blank has no storage origin during page creation.
    }
  });
}

/**
 * Convenience: navigate to the fixture shop, add the default product, and
 * reach the cart form. Accepts an optional custom quantity.
 */
async function reachCart(page: Page, quantity = 1) {
  await navigateToShop(page);
  await addProduct(page, FIXTURE.productTestIds[0], quantity);
  await reviewCart(page);
}

/**
 * Intercept WhatsApp navigation so the page never actually leaves the app.
 */
async function interceptWhatsApp(page: Page) {
  await page.route("https://wa.me/**", (route: Route) =>
    route.fulfill({ body: "", contentType: "text/plain", status: 200 }),
  );
}

/**
 * Submit the WhatsApp order, wait for wa.me navigation, and return the
 * parsed outgoing URL for further assertion.
 */
async function submitAndParseWhatsApp(
  page: Page,
  phoneNumber = FIXTURE.phoneNumber,
): Promise<URL> {
  const whatsappNavigation = page.waitForURL(
    new RegExp(`^https://wa\\.me/${phoneNumber}\\?text=`),
    {
      waitUntil: "commit",
    },
  );
  await page.getByTestId("submit-whatsapp-order").click({ noWaitAfter: true });
  await whatsappNavigation;
  return new URL(page.url());
}

export {
  addProduct,
  clearCartStorage,
  fillCustomerForm,
  interceptWhatsApp,
  navigateToShop,
  reachCart,
  reviewCart,
  submitAndParseWhatsApp,
};
