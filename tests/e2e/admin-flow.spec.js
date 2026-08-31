if (process.env.JEST_WORKER_ID) {
  test.skip('runs with the Playwright E2E runner', () => {});
} else {
  const { expect, test } = require('@playwright/test');

  // The editor lives at /{typeformtoken}/edit (pages/[...params].jsx) and is
  // seeded with the fixture token `e2e-fixture-token`.
  test('loads the shop editor by token and shows the seeded data', async ({ page }) => {
    await page.goto('/e2e-fixture-token/edit');

    const nameInput = page.getByTestId('edit-shop-name');
    await expect(nameInput).toHaveValue('E2E Fixture Shop');
    await expect(page.getByTestId('edit-shop-address')).toHaveValue('E2E Address');
    await expect(page.getByTestId('edit-shop-deliverycost')).toHaveValue('0');
    await expect(page.getByTestId('edit-shop-opentimes')).toHaveValue('E2E hours');
  });

  test('loads the Handsontable product editor without a ReferenceError', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    await page.goto('/e2e-fixture-token/edit');

    await expect(page.getByRole('heading', { name: 'Tu menú o listado de precios' })).toBeVisible();
    await expect(page.locator('.handsontable').first()).toBeVisible();
    expect(pageErrors.filter((error) => error.name === 'ReferenceError')).toEqual([]);
  });

  // Characterizes the save round-trip: POST /api/shop/by-token updates the
  // shop, the page shows the confirmation box, and the change survives a
  // reload (persisted in Postgres).
  test('saves edited shop fields and persists them across reloads', async ({ page }) => {
    await page.goto('/e2e-fixture-token/edit');
    await expect(page.getByTestId('edit-shop-name')).toHaveValue('E2E Fixture Shop');

    const editedName = 'E2E Fixture Shop (edited)';
    await page.getByTestId('edit-shop-name').fill(editedName);
    await page.getByTestId('save-shop').click();

    await expect(page.getByText('Tus cambios fueron guardados.')).toBeVisible();

    // The save handler refreshes the shop data; a full reload must keep it.
    await page.reload();
    await expect(page.getByTestId('edit-shop-name')).toHaveValue(editedName);
  });

  // Regression for #128: an unknown token must NOT render an empty editor.
  // The by-token API answers 404 and the page shows the not-found state.
  test('shows a not-found state for an unknown token', async ({ page }) => {
    await page.goto('/does-not-exist/edit');

    await expect(
      page.getByText('No hay un comercio en la base de datos para el token does-not-exist')
    ).toBeVisible();
    await expect(page.getByTestId('edit-shop-name')).not.toBeVisible();
  });
}
