import { expect, test } from "@playwright/test";
import {
  addProduct,
  clearCartStorage,
  interceptWhatsApp,
  navigateToShop,
  reachCart,
} from "./helpers";

test.beforeEach(async ({ page }) => {
  // Keep this journey independent if it is run against a reused browser
  // context (for example, while debugging a single worker).
  await clearCartStorage(page);
});

test("decrements quantities, removes products, and updates the total", async ({
  page,
}) => {
  await navigateToShop(page);
  await addProduct(page, "product-e2e-product", 2);
  await addProduct(page, "product-e2e-second-product", 1);

  const reviewOrder = page.getByTestId("review-order");
  await expect(reviewOrder).toHaveText("Revisar mi pedido3");

  // Decreasing a product to one keeps it in the cart and updates the count.
  const firstProduct = page.getByTestId("product-e2e-product");
  await firstProduct.click();
  await firstProduct.getByRole("button", { name: "Decrease quantity" }).click();
  await firstProduct.getByRole("button", { name: "Add product" }).click();
  await expect(reviewOrder).toHaveText("Revisar mi pedido2");

  // Decreasing the second product to zero removes it from the order list.
  const secondProduct = page.getByTestId("product-e2e-second-product");
  await secondProduct.click();
  await secondProduct
    .getByRole("button", { name: "Decrease quantity" })
    .click();
  await secondProduct.getByRole("button", { name: "Add product" }).click();
  await expect(reviewOrder).toHaveText("Revisar mi pedido1");

  await reviewOrder.click();
  await expect(page.getByText("E2E Product")).toBeVisible();
  await expect(page.getByText("E2E Second Product")).not.toBeVisible();
});

test("removing the last product disables checkout", async ({ page }) => {
  await reachCart(page);

  await page.getByRole("button", { name: "Volver" }).click();
  const reviewOrder = page.getByTestId("review-order");
  await expect(reviewOrder).toHaveText("Revisar mi pedido1");
  const product = page.getByTestId("product-e2e-product");
  await product.click();
  await product.getByRole("button", { name: "Decrease quantity" }).click();
  await product.getByRole("button", { name: "Add product" }).click();

  await expect(reviewOrder).toHaveText("Revisar mi pedido0");
  await expect(reviewOrder).toBeDisabled();
});

test("restores the address requirement when switching back to delivery", async ({
  page,
}) => {
  await reachCart(page);
  const modeSwitch = page.getByRole("checkbox", {
    name: "Cambiar entre delivery y takeaway",
  });

  await modeSwitch.check();
  await expect(page.getByTestId("customer-address")).not.toBeVisible();
  await modeSwitch.uncheck();
  await expect(page.getByTestId("customer-address")).toBeVisible();

  await page.getByTestId("customer-name").fill("Delivery Customer");
  await interceptWhatsApp(page);
  await page.getByTestId("submit-whatsapp-order").click();
  await expect(page.getByText("Necesitamos tu dirección")).toBeVisible();
});
