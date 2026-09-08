import { expect, test } from "@playwright/test";
import { reachCart } from "./helpers";

// #142: cart state (shop, products, amounts, form fields) now persists through
// a full page reload via localStorage. The cart page should remain visible
// after reload without redirecting home.
test("preserves cart content on reload and stays on /cart", async ({
  page,
}) => {
  await reachCart(page);

  // Fill in customer details
  await page.getByTestId("customer-name").fill("Persist Name");
  await page.getByTestId("customer-address").fill("Persist Address");
  await page.getByTestId("order-notes").fill("Persist Notes");

  await page.reload();
  // Should remain on /cart, not redirect home
  await page.waitForURL("**/cart");
  await expect(page).toHaveURL(/\/cart$/);

  // Cart products should be preserved
  await expect(page.getByText("E2E Product")).toBeVisible();
  await expect(page.getByText("1")).toBeVisible();

  // Form fields should be preserved
  await expect(page.getByTestId("customer-name")).toHaveValue("Persist Name");
  await expect(page.getByTestId("customer-address")).toHaveValue(
    "Persist Address",
  );
  await expect(page.getByTestId("order-notes")).toHaveValue("Persist Notes");
});

// #142: navigating away to the shop page and back should preserve the full
// cart (products, amounts, and form fields) because the CartContext persists
// to localStorage and the Form reads from Context defaults.
test("preserves cart when navigating away and back", async ({ page }) => {
  await reachCart(page);

  await page.getByTestId("customer-name").fill("Navigate Name");
  await page.getByTestId("customer-address").fill("Navigate Address");
  await page.getByTestId("order-notes").fill("Navigate Notes");

  // Go back to the shop and forward again.
  await page.goBack();
  await page.waitForURL("**/e2e-fixture-shop");
  await page.goForward();
  await page.waitForURL("**/cart");

  // Products should still be visible
  await expect(page.getByText("E2E Product")).toBeVisible();

  // Form fields should be preserved via Context defaults
  await expect(page.getByTestId("customer-name")).toHaveValue("Navigate Name");
  await expect(page.getByTestId("customer-address")).toHaveValue(
    "Navigate Address",
  );
  await expect(page.getByTestId("order-notes")).toHaveValue("Navigate Notes");
});

test("clears cart when navigating to home", async ({ page }) => {
  await reachCart(page);

  await page.goto("/");
  await expect(page.getByTestId("category-Comida").first()).toBeVisible();
  await page.waitForFunction(
    () => !localStorage.getItem("hacerpedido_cart_state"),
  );
  await page.getByTestId("category-Comida").first().click();
  await page.getByTestId("shop-card-e2e-fixture-shop").click();

  await expect(page.getByTestId("review-order")).toHaveText(
    "Revisar mi pedido0",
  );
});
