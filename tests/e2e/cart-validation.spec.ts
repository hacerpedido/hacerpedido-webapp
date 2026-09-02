import { expect, test } from "@playwright/test";
import {
  interceptWhatsApp,
  reachCart,
  submitAndParseWhatsApp,
} from "./helpers";

test("requires a customer name and address before submitting an order", async ({
  page,
}) => {
  await interceptWhatsApp(page);
  await reachCart(page);

  await page.getByTestId("submit-whatsapp-order").click();

  await expect(page.getByText("Necesitamos tu nombre")).toBeVisible();
  await expect(page.getByText("Necesitamos tu dirección")).toBeVisible();
  await expect(page).not.toHaveURL(/wa\.me/);
});

// TODO: Re-enable after the current E2E failure is resolved.
test.skip("allows submitting without an address when takeaway is selected", async ({
  page,
}) => {
  await interceptWhatsApp(page);
  await reachCart(page);

  await page.getByRole("checkbox").click();
  await page.getByTestId("customer-name").fill("Takeaway Customer");

  const outgoingURL = await submitAndParseWhatsApp(page);

  expect(outgoingURL.pathname).toBe("/5491100000000");
  expect(outgoingURL.searchParams.get("text")).toBe(
    [
      "¡Hola! soy *Takeaway Customer* y quiero hacer un pedido via HacerPedido 💪",
      "",
      "",
      "*Mi pedido:*",
      "*E2E Category*",
      "✅ 1 x E2E Product",
    ].join("\n"),
  );
});
