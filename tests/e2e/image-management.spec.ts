import { expect, test } from "@playwright/test";

const token = "/e2e-image-token/edit";
const imageType = "logo";

// This is a deliberately tiny, valid PNG. Sending a real multipart image
// exercises the upload contract without requiring AWS credentials.
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

test.describe("shop image management", () => {
  test("uploads a logo through the editor without contacting AWS", async ({
    page,
  }) => {
    await page.route("**/api/images", (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ image: "mock-logo.png" }),
        status: 200,
      }),
    );

    await page.goto(token);
    await page.getByRole("button", { name: "Editar logo" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.locator('input[type="file"]').setInputFiles({
      name: "test-logo.png",
      mimeType: "image/png",
      buffer: png,
    });

    const preview = dialog.getByAltText("Vista previa");
    await expect(preview).toBeVisible();
    const previewBounds = await preview.boundingBox();
    expect(previewBounds).not.toBeNull();
    if (!previewBounds) {
      throw new Error(
        "The image preview must have visible bounds for cropping",
      );
    }

    // ReactCrop requires a user crop before it enables the upload path.
    await page.mouse.move(previewBounds.x, previewBounds.y);
    await page.mouse.down();
    await page.mouse.move(
      previewBounds.x + previewBounds.width,
      previewBounds.y + previewBounds.height,
    );
    await page.mouse.up();

    const uploadRequest = page.waitForRequest(
      (request) =>
        request.url().includes("/api/images") && request.method() === "POST",
    );
    await dialog.getByRole("button", { name: "Aceptar" }).click();

    const request = await uploadRequest;
    const uploadRequestBody = request.postData() ?? "";
    expect(uploadRequestBody).toContain("image_type");
    expect(uploadRequestBody).toContain(imageType);
    expect(uploadRequestBody).not.toContain("shop_id");
    await expect(request.headerValue("authorization")).resolves.toBe(
      "Bearer e2e-image-token",
    );
  });

  test("deletes the current logo through the editor without contacting AWS", async ({
    page,
  }) => {
    await page.route("**/api/images", (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ deleted: "/logo512.png" }),
        status: 200,
      }),
    );

    await page.goto(token);
    await page.getByRole("button", { name: "Editar logo" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const deleteRequest = page.waitForRequest(
      (request) =>
        request.url().includes("/api/images") && request.method() === "DELETE",
    );
    await dialog.getByRole("button", { name: "Borrar imagen actual" }).click();

    const request = await deleteRequest;
    const deleteRequestBody = request.postData() ?? "";
    expect(deleteRequestBody).toContain(imageType);
    expect(deleteRequestBody).not.toContain("shop_id");
    await expect(request.headerValue("authorization")).resolves.toBe(
      "Bearer e2e-image-token",
    );
  });

  test("shows the configured image in the admin preview and public page", async ({
    page,
  }) => {
    await page.goto(token);
    const preview = page.locator("aside").getByRole("img", {
      name: "E2E Image Shop",
    });
    await expect(preview).toBeVisible();

    await page.goto("/e2e-image-shop");
    await expect(
      page.getByRole("img", { name: "E2E Image Shop" }),
    ).toBeVisible();
  });
});
