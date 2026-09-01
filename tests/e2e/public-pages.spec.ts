import { expect, test } from "@playwright/test";
import { clearCartStorage } from "./helpers";

test("shows a not-found message for an unknown public shop", async ({
  page,
}) => {
  await clearCartStorage(page);

  await page.goto("/shop-that-does-not-exist");

  await expect(page.getByText("La página que buscás no existe.")).toBeVisible();
});
