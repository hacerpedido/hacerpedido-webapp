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

  // Characterizes a security-relevant gap (#128/#146): for an unknown token
  // the editor still renders an empty form instead of the not-found state.
  // nested-knex returns a truthy empty object for a missing row, so the
  // `shop == null` guard in pages/[...params].jsx never fires.
  test('renders an empty editor for an unknown token instead of a not-found state (#128)', async ({ page }) => {
    await page.goto('/does-not-exist/edit');

    // The editor form is shown with no seeded data.
    await expect(page.getByTestId('edit-shop-name')).toBeVisible();
    await expect(page.getByTestId('edit-shop-name')).toHaveValue('');
    await expect(
      page.getByText('No hay un comercio en la base de datos para el token does-not-exist')
    ).not.toBeVisible();
  });
}
