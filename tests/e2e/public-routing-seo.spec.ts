import { expect, test } from "@playwright/test";

if (process.env.JEST_WORKER_ID) {
  test.skip("runs with the Playwright E2E runner", () => {});
} else {
  test("serves the public home route with its stable SEO title", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(
      "Hacer Pedido | Pedí a tu comercio favorito por WhatsApp.",
    );
    await expect(page.getByTestId("category-Comida")).toBeVisible();
  });

  test("routes a public shop slug and exposes its share metadata", async ({
    page,
  }) => {
    await page.goto("/e2e-fixture-shop");

    await expect(page).toHaveTitle("E2E Fixture Shop | Hacer Pedido");
    await expect(
      page.getByRole("heading", { name: "e2e fixture shop" }),
    ).toBeVisible();
    await expect(
      page.locator('meta[property="og:title"][content="E2E Fixture Shop"]'),
    ).toHaveAttribute("content", "E2E Fixture Shop");
    await expect(
      page.locator('meta[property="og:type"][content="article"]').first(),
    ).toHaveAttribute("content", "article");
    await expect(
      page.locator(
        'meta[property="og:url"][content="https://hacerpedido.com/e2e-fixture-shop"]',
      ),
    ).toHaveAttribute("content", "https://hacerpedido.com/e2e-fixture-shop");
  });
}
