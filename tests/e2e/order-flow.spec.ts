import { expect, test } from "@playwright/test";
import {
  addProduct,
  FIXTURE,
  fillCustomerForm,
  interceptWhatsApp,
  navigateToShop,
  reviewCart,
  submitAndParseWhatsApp,
} from "./helpers";

test("places one deterministic fixture product order through WhatsApp", async ({
  page,
}) => {
  await navigateToShop(page);
  await addProduct(page, FIXTURE.productTestIds[0], 1);
  await reviewCart(page);
  await fillCustomerForm(page, {
    name: "E2E Customer",
    address: "E2E Address",
    notes: "E2E Notes",
  });

  await interceptWhatsApp(page);
  const outgoingURL = await submitAndParseWhatsApp(page);

  expect(outgoingURL.hostname).toBe("wa.me");
  expect(outgoingURL.pathname).toBe("/5491100000000");
  expect(outgoingURL.searchParams.get("text")).toContain("✅ 1 x E2E Product");
});

test("orders two products with quantities through a golden WhatsApp message", async ({
  page,
}) => {
  await navigateToShop(page);

  await addProduct(page, FIXTURE.productTestIds[0], 1);
  await addProduct(page, FIXTURE.productTestIds[1], 2);
  await reviewCart(page);
  await fillCustomerForm(page, {
    name: "Golden Customer",
    address: "Golden Address",
    notes: "Golden Notes",
  });

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

  await addProduct(page, FIXTURE.productTestIds[0], 4);
  await addProduct(page, FIXTURE.productTestIds[1], 7);
  await reviewCart(page);
  await fillCustomerForm(page, {
    name: "Large Order Customer",
    address: "Large Order Address",
    notes: "Please check both quantities",
  });

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
