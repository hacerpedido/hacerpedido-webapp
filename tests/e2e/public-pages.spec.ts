import { expect, test } from "@playwright/test";
import { clearCartStorage } from "./helpers";

test("shows a not-found message for an unknown public shop", async ({
  page,
}) => {
  await clearCartStorage(page);

  await page.goto("/shop-that-does-not-exist");

  await expect(page.getByText("La página que buscás no existe.")).toBeVisible();
});

test("renders a public shop with an empty catalog", async ({ page }) => {
  await clearCartStorage(page);
  await page.goto("/e2e-image-shop");

  await expect(
    page.getByRole("heading", { name: "E2E Image Shop" }),
  ).toBeVisible();
  await expect(page).toHaveTitle("E2E Image Shop | Hacer Pedido");
  await expect(page.locator('[data-testid^="product-"]')).toHaveCount(0);
});
