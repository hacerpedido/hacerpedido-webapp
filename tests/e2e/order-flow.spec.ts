import { expect, test } from "@playwright/test";

if (process.env.JEST_WORKER_ID) {
  test.skip("runs with the Playwright E2E runner", () => {});
} else {
  const {
    addProduct,
    interceptWhatsApp,
    navigateToShop,
    submitAndParseWhatsApp,
  } = require("./helpers");

  test("places one deterministic fixture product order through WhatsApp", async ({
    page,
  }) => {
    await navigateToShop(page);
    await addProduct(page, "product-e2e-product", 1);
    await page.getByTestId("review-order").click();

    await page.getByTestId("customer-name").fill("E2E Customer");
    await page.getByTestId("customer-address").fill("E2E Address");
    await page.getByTestId("order-notes").fill("E2E Notes");

    await interceptWhatsApp(page);
    const outgoingURL = await submitAndParseWhatsApp(page);

    expect(outgoingURL.hostname).toBe("wa.me");
    expect(outgoingURL.pathname).toBe("/5491100000000");
    expect(outgoingURL.searchParams.get("text")).toContain(
      "✅ 1 x E2E Product",
    );
  });

  test("orders two products with quantities through a golden WhatsApp message", async ({
    page,
  }) => {
    await navigateToShop(page);

    await addProduct(page, "product-e2e-product", 1);
    await addProduct(page, "product-e2e-second-product", 2);

    await page.getByTestId("review-order").click();
    await page.getByTestId("customer-name").fill("Golden Customer");
    await page.getByTestId("customer-address").fill("Golden Address");
    await page.getByTestId("order-notes").fill("Golden Notes");

    await interceptWhatsApp(page);
    const outgoingURL = await submitAndParseWhatsApp(page);

    const expectedMessage = [
      "¡Hola! soy *Golden Customer* y quiero hacer un pedido via HacerPedido 💪",
      "",
      "📍 *Mi dirección:* Golden Address",
      "📝 *Notas:* Golden Notes",
      "",
      "*Mi pedido:*",
      "*E2E Category*",
      "✅ 1 x E2E Product",
      "✅ 2 x E2E Second Product",
    ].join("\n");

    expect(outgoingURL.searchParams.get("text")).toBe(expectedMessage);
  });

  test("preserves large quantities and every order field in the WhatsApp message", async ({
    page,
  }) => {
    await navigateToShop(page);

    await addProduct(page, "product-e2e-product", 4);
    await addProduct(page, "product-e2e-second-product", 7);

    await page.getByTestId("review-order").click();
    await page.getByTestId("customer-name").fill("Large Order Customer");
    await page.getByTestId("customer-address").fill("Large Order Address");
    await page.getByTestId("order-notes").fill("Please check both quantities");

    await interceptWhatsApp(page);
    const outgoingURL = await submitAndParseWhatsApp(page);

    expect(outgoingURL.hostname).toBe("wa.me");
    expect(outgoingURL.pathname).toBe("/5491100000000");
    expect(outgoingURL.searchParams.get("text")).toBe(
      [
        "¡Hola! soy *Large Order Customer* y quiero hacer un pedido via HacerPedido 💪",
        "",
        "📍 *Mi dirección:* Large Order Address",
        "📝 *Notas:* Please check both quantities",
        "",
        "*Mi pedido:*",
        "*E2E Category*",
        "✅ 4 x E2E Product",
        "✅ 7 x E2E Second Product",
      ].join("\n"),
    );
  });
}
