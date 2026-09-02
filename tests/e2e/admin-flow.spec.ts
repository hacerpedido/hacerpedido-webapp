import { expect, test } from "@playwright/test";

// The App Router editor lives at /{typeformtoken}/edit and is seeded with the
// fixture token `e2e-fixture-token`.
test("loads the shop editor by token and shows the seeded data", async ({
  page,
}) => {
  await page.goto("/e2e-fixture-token/edit");

  const nameInput = page.getByTestId("edit-shop-name");
  await expect(nameInput).toHaveValue("E2E Fixture Shop");
  await expect(page.getByTestId("edit-shop-address")).toHaveValue(
    "E2E Address",
  );
  await expect(page.getByTestId("edit-shop-deliverycost")).toHaveValue("0");
  await expect(page.getByTestId("edit-shop-opentimes")).toHaveValue(
    "E2E hours",
  );
});

test("loads the Handsontable product editor without a ReferenceError", async ({
  page,
}) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));

  await page.goto("/e2e-fixture-token/edit");

  await expect(
    page.getByRole("heading", { name: "Tu menú o listado de precios" }),
  ).toBeVisible();
  await expect(page.locator(".handsontable").first()).toBeVisible();
  expect(pageErrors.filter((error) => error.name === "ReferenceError")).toEqual(
    [],
  );
});

test("prevents duplicate editor saves while the request is pending", async ({
  page,
}) => {
  let saveRequests = 0;
  let releaseSave: (() => void) | undefined;
  const saveReleased = new Promise<void>((resolve) => {
    releaseSave = resolve;
  });

  await page.route("**/api/shop/editor", async (route) => {
    saveRequests += 1;
    await saveReleased;
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ message: "Tus cambios fueron guardados." }),
    });
  });

  await page.goto("/e2e-fixture-token/edit");
  const saveButton = page.getByTestId("save-shop");
  await saveButton.click();
  await expect(saveButton).toBeDisabled();

  // Force the second click to exercise the browser guard without waiting for
  // the first request to settle.
  await saveButton.click({ force: true });
  expect(saveRequests).toBe(1);
  releaseSave?.();
  await expect(saveButton).toBeEnabled();
});

test("preserves editor values when the server rejects a valid submission", async ({
  page,
}) => {
  await page.route("**/api/shop/editor", (route) =>
    route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({
        error: 1,
        message: "El nombre del comercio es requerido.",
      }),
    }),
  );

  await page.goto("/e2e-fixture-token/edit");
  const name = page.getByTestId("edit-shop-name");
  const address = page.getByTestId("edit-shop-address");
  await name.fill("Submitted name");
  await address.fill("Submitted address");
  await page.getByTestId("save-shop").click();
  await expect(
    page.getByText("El nombre del comercio es requerido."),
  ).toBeVisible();
  await expect(name).toHaveValue("Submitted name");
  await expect(address).toHaveValue("Submitted address");
});

test("rolls back an optimistic product preview after a rejected save", async ({
  page,
}) => {
  await page.route("**/api/shop/editor", (route) =>
    route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({ error: 1, message: "No se pudo guardar." }),
    }),
  );

  await page.goto("/e2e-fixture-token/edit");
  const productCell = page
    .locator(".ht_master .htCore tbody tr")
    .nth(3)
    .locator("td")
    .nth(1);
  await productCell.dblclick();
  await page.keyboard.press("Control+A");
  await page.keyboard.type("Preview Product");
  await page.keyboard.press("Enter");

  const preview = page.locator("aside");
  await expect(preview.getByText("Preview Product")).toBeVisible();
  await page.getByTestId("save-shop").click();
  await expect(preview.getByText("E2E Product")).toBeVisible();
  await expect(preview.getByText("Preview Product")).not.toBeVisible();
});

// This uses its own private seed shop, keeping its POST mutation independent
// from public-fixture readers when Playwright runs specs in parallel.
// It characterizes the save round-trip: POST /api/shop/by-token updates the
// shop, the page shows the confirmation box, and the change survives a
// reload (persisted in Postgres).
test("saves edited shop fields and persists them across reloads", async ({
  page,
}) => {
  const originalName = "E2E Admin Save Shop";
  const editedName = "E2E Admin Save Shop (edited)";
  try {
    await page.goto("/e2e-admin-save-token/edit");
    await expect(page.getByTestId("edit-shop-name")).toHaveValue(originalName);

    await page.getByTestId("edit-shop-name").fill(editedName);
    await page.getByTestId("save-shop").click();

    await expect(page.getByText("Tus cambios fueron guardados.")).toBeVisible();

    // The save handler refreshes the shop data; a full reload must keep it.
    await page.reload();
    await expect(page.getByTestId("edit-shop-name")).toHaveValue(editedName);
  } finally {
    await page.getByTestId("edit-shop-name").fill(originalName);
    await page.getByTestId("save-shop").click();
    await expect(page.getByText("Tus cambios fueron guardados.")).toBeVisible();
  }
});

// The public App Router route is explicitly dynamic. Prime its original
// response, save through the supported editor, then make a new document
// request to ensure the public catalog does not serve stale shop data.
test("serves editor changes on a fresh public catalog request", async ({
  page,
}) => {
  const originalName = "E2E Public Freshness Shop";
  const editedName = "E2E Public Freshness Shop (edited)";
  const editorPath = "/e2e-public-freshness-token/edit";
  const publicPath = "/e2e-public-freshness-shop";

  try {
    await page.goto(publicPath);
    await expect(page).toHaveTitle(`${originalName} | Hacer Pedido`);

    await page.goto(editorPath);
    await expect(page.getByTestId("edit-shop-name")).toHaveValue(originalName);
    await page.getByTestId("edit-shop-name").fill(editedName);
    await page.getByTestId("save-shop").click();
    await expect(page.getByText("Tus cambios fueron guardados.")).toBeVisible();

    const publicResponse = await page.goto(publicPath);
    expect(publicResponse?.ok()).toBe(true);
    await expect(page).toHaveTitle(`${editedName} | Hacer Pedido`);
    await expect(
      page.getByRole("heading", { name: editedName.toLowerCase() }),
    ).toBeVisible();
  } finally {
    await page.goto(editorPath);
    await expect(page.getByTestId("edit-shop-name")).toBeVisible();
    await page.getByTestId("edit-shop-name").fill(originalName);
    await page.getByTestId("save-shop").click();
    await expect(page.getByText("Tus cambios fueron guardados.")).toBeVisible();
  }
});

// Regression for #128: an unknown token must NOT render an empty editor.
// The by-token API answers 404 and the page shows the not-found state.
test("shows a not-found state for an unknown token", async ({ page }) => {
  await page.goto("/does-not-exist/edit");

  await expect(
    page.getByText(
      "No hay un comercio en la base de datos para el token does-not-exist",
    ),
  ).toBeVisible();
  await expect(page.getByTestId("edit-shop-name")).not.toBeVisible();
});
