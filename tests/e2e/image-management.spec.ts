import { expect, test } from "@playwright/test";

const token = "/e2e-image-token/edit";
const imageType = "logo";
const shopId = "00000000-0000-0000-0000-000000000006";

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
    let uploadRequestBody: string | null = null;
    await page.route("**/api/images", async (route) => {
      uploadRequestBody = route.request().postData() ?? null;
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ image: "mock-logo.png" }),
        status: 200,
      });
    });

    await page.goto(token);
    await expect(
      page.getByRole("button", { name: "Editar logo" }),
    ).toBeVisible();
    await page.evaluate(
      async ({ bytes, shopId }) => {
        const data = new FormData();
        data.append(
          "image",
          new File([new Uint8Array(bytes)], "test-logo.png", {
            type: "image/png",
          }),
        );
        data.append("shop_id", shopId);
        data.append("image_type", "logo");
        await fetch("/api/images", { method: "POST", body: data });
      },
      { bytes: [...png], shopId },
    );
    expect(uploadRequestBody).toContain("image_type");
    expect(uploadRequestBody).toContain("logo");
  });

  test("deletes the current logo through the editor without contacting AWS", async ({
    page,
  }) => {
    let deleteRequest: { image_type?: string; shop_id?: string } | undefined;
    await page.route("**/api/images", async (route) => {
      if (route.request().method() === "DELETE") {
        const body = route.request().postData() ?? "";
        deleteRequest = {
          image_type: body.includes("logo") ? "logo" : undefined,
          shop_id: body.match(new RegExp(shopId))?.[0],
        };
      }
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ deleted: "/logo512.png" }),
        status: 200,
      });
    });

    await page.goto(token);
    await expect(
      page.getByRole("button", { name: "Editar logo" }),
    ).toBeVisible();
    await page.evaluate(async (shopId) => {
      const data = new FormData();
      data.append("shop_id", shopId);
      data.append("image_type", "logo");
      await fetch("/api/images", { method: "DELETE", body: data });
    }, shopId);
    expect(deleteRequest?.image_type).toBe(imageType);
    expect(deleteRequest?.shop_id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
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
