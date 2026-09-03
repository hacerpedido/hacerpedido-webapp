import { expect, test } from "@playwright/test";
import { clearCartStorage } from "./helpers";

// Spec #174: keyboard-driven customer flow + landmark/accessibility-name
// assertions. Exercises the home → shop → cart → checkout path that a screen
// reader or keyboard-only user would take.

test.describe("customer flow keyboard accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await clearCartStorage(page);
  });

  test("home category filter is keyboard-activatable", async ({ page }) => {
    await page.goto("/");

    const categoryButton = page.getByTestId("category-Comida").first();
    await expect(categoryButton).toBeVisible();
    await expect(categoryButton).toHaveAccessibleName("Comida");

    await categoryButton.focus();
    await page.keyboard.press("Enter");
    await expect(categoryButton).toHaveAttribute("aria-pressed", "true");
  });

  test("shop product button can be activated via keyboard", async ({
    page,
  }) => {
    await page.goto("/e2e-fixture-shop");

    const product = page.getByTestId("product-e2e-product");
    await expect(product).toBeVisible();

    // Product button uses aria-label={name}.
    await expect(product.locator("button").first()).toHaveAccessibleName(
      "E2E Product",
    );

    await product.locator("button").first().focus();
    await page.keyboard.press("Enter");

    await expect(product.getByTestId("quantity-popup")).toBeVisible();
  });

  test("quantity popup controls are reachable and typed via keyboard", async ({
    page,
  }) => {
    await page.goto("/e2e-fixture-shop");

    const product = page.getByTestId("product-e2e-product");
    await product.locator("button").first().click();

    const increase = product.getByTestId("quantity-increase");
    await increase.focus();
    await page.keyboard.press("Enter");
    await increase.focus();
    await page.keyboard.press("Enter");

    const addButton = product.getByTestId("quantity-add");
    // Accessible name comes from aria-label="Add product" on the button;
    // surface text on the inner span is the Spanish-default "Agregar".
    await expect(addButton).toHaveAccessibleName(/Agregar|Add product/i);
    await addButton.focus();
    await page.keyboard.press("Enter");
    await expect(product.getByTestId("quantity-popup")).not.toBeVisible();
  });

  test("cart form fields are reachable via keyboard and focusable", async ({
    page,
  }) => {
    await page.goto("/e2e-fixture-shop");
    const product = page.getByTestId("product-e2e-product");
    await product.locator("button").first().click();
    const popup = product.getByTestId("quantity-popup");
    await popup.getByTestId("quantity-increase").click();
    await popup.getByTestId("quantity-add").click();
    await expect(popup).not.toBeVisible();

    await page.getByTestId("review-order").focus();
    await page.keyboard.press("Enter");

    const nameField = page.getByTestId("customer-name");
    await expect(nameField).toBeVisible();
    await nameField.focus();
    await expect(nameField).toBeFocused();
    await page.keyboard.type("Cliente Test");

    const submit = page.getByTestId("submit-whatsapp-order");
    await expect(submit).toBeVisible();
    await submit.focus();
    await expect(submit).toBeFocused();
  });
});

test.describe("public pages landmark and accessible-name structure", () => {
  test.beforeEach(async ({ page }) => {
    await clearCartStorage(page);
  });

  test("home page exposes navigation landmarks and named category buttons", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.locator("nav[aria-label='Categorías']").first(),
    ).toBeVisible();

    const categoryButton = page.getByTestId("category-Comida").first();
    await expect(categoryButton).toHaveAccessibleName("Comida");
  });

  test("shop page exposes a header landmark and product buttons with accessible names", async ({
    page,
  }) => {
    await page.goto("/e2e-fixture-shop");
    await expect(page.locator("header").first()).toBeVisible();

    const firstProduct = page.getByTestId("product-e2e-product");
    await expect(firstProduct.locator("button").first()).toHaveAccessibleName(
      "E2E Product",
    );
  });
});
