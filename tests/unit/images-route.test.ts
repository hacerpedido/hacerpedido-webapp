/** @jest-environment node */
// The route runs on the Node runtime and loads the `pg` driver through Drizzle,
// whose crypto helpers require Node globals (TextEncoder) absent in jsdom.
const mockPoolQuery = jest.fn();
const mockUploadFile = jest.fn();
const mockDeleteFile = jest.fn();
const mockWriteFile = jest.fn();
const mockRm = jest.fn();
const mockRandomString = jest.fn((length: number) =>
  length === 10 ? "image-key" : "temporary-file",
);

jest.mock("#lib/db/pool", () => ({
  getPool: jest.fn(() => ({ query: mockPoolQuery })),
}));
jest.mock("#lib/utils/aws-s3", () => ({
  uploadFile: mockUploadFile,
  deleteFile: mockDeleteFile,
}));
jest.mock("node:fs", () => ({
  promises: {
    writeFile: mockWriteFile,
    rm: mockRm,
  },
}));
jest.mock("#lib/utils/utils", () => ({ randomString: mockRandomString }));

class TestResponse {
  body: unknown;
  status: number;

  constructor(body: unknown, init: { status?: number } = {}) {
    this.body = body;
    this.status = init.status ?? 200;
  }

  static json(body: unknown, init?: { status?: number }): TestResponse {
    return new TestResponse(body, init);
  }

  async json(): Promise<unknown> {
    return this.body;
  }
}

if (!global.Response) {
  global.Response = TestResponse as unknown as typeof Response;
}

interface ImageRequest {
  formData: () => Promise<FormData>;
}

type ImagesHandler = (request: ImageRequest) => Promise<TestResponse>;

// Deferred require: an ESM import would be hoisted above the shared mock
// handles, making the mocked factories run before they initialize.
const { DELETE, POST } = require("../../app/api/images/route") as {
  POST: ImagesHandler;
  DELETE: ImagesHandler;
};

const shopID = "550e8400-e29b-41d4-a716-446655440000";

function imageFile(contents: string, name: string, type: string): File {
  const file = new File([contents], name, { type });
  Object.defineProperty(file, "arrayBuffer", {
    value: async (): Promise<ArrayBuffer> => Buffer.from(contents).buffer,
  });
  return file;
}

function formRequest(values: Record<string, unknown>): ImageRequest {
  const form = new FormData();
  for (const [name, value] of Object.entries(values)) {
    form.append(name, value as string | Blob);
  }
  return { formData: jest.fn().mockResolvedValue(form) };
}

function imageRequest(overrides: Record<string, unknown> = {}): ImageRequest {
  return formRequest({
    image_type: "logo",
    shop_id: shopID,
    image: imageFile("image contents", "logo.png", "image/png"),
    ...overrides,
  });
}

describe("images API route", () => {
  beforeEach(() => {
    mockPoolQuery.mockReset();
    mockUploadFile.mockReset().mockResolvedValue(undefined);
    mockDeleteFile.mockReset().mockResolvedValue(undefined);
    mockWriteFile.mockReset().mockResolvedValue(undefined);
    mockRm.mockReset().mockResolvedValue(undefined);
    mockRandomString.mockClear();
  });

  describe("POST", () => {
    test.each([
      ["image_type", { image_type: "banner" }, "Wrong parameters (1)."],
      ["shop_id", { shop_id: "not-a-uuid" }, "Wrong parameters (2)."],
      ["image", { image: "not a file" }, "Wrong parameters (3)."],
      [
        "mime type",
        { image: imageFile("gif", "logo.gif", "image/gif") },
        "Wrong parameters (4).",
      ],
    ])("rejects an invalid %s", async (_name, override, message) => {
      const response = await POST(imageRequest(override));

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: message });
      expect(mockPoolQuery).not.toHaveBeenCalled();
    });

    test("rejects a valid image request for an unknown shop", async () => {
      mockPoolQuery.mockResolvedValue({ rows: [] });

      const response = await POST(imageRequest());

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "Wrong parameters (5)." });
      expect(mockWriteFile).not.toHaveBeenCalled();
    });

    test("uploads the image, updates the shop, deletes the replacement, and cleans up", async () => {
      mockPoolQuery
        .mockResolvedValueOnce({ rows: [["old-logo.png"]] })
        .mockResolvedValueOnce({ rows: [] });

      const response = await POST(imageRequest());

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        image: `${shopID}-logo-image-key.png`,
      });
      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringContaining("hacerpedido-image-temporary-file.png"),
        expect.any(Buffer),
      );
      expect(mockUploadFile).toHaveBeenCalledWith(
        expect.stringContaining("hacerpedido-image-temporary-file.png"),
        `${shopID}-logo-image-key.png`,
        "image/png",
      );
      expect(mockPoolQuery).toHaveBeenLastCalledWith(
        expect.objectContaining({
          text: 'update "shops" set "logo" = $1 where "shops"."id" = $2',
        }),
        [`${shopID}-logo-image-key.png`, shopID],
      );
      expect(mockDeleteFile).toHaveBeenCalledWith("old-logo.png");
      expect(mockRm).toHaveBeenCalledWith(
        expect.stringContaining("hacerpedido-image-temporary-file.png"),
        { force: true },
      );
    });

    test("cleans up the temporary file when S3 upload fails", async () => {
      mockPoolQuery.mockResolvedValue({ rows: [[null]] });
      mockUploadFile.mockRejectedValue(new Error("S3 unavailable"));

      await expect(POST(imageRequest())).rejects.toThrow("S3 unavailable");

      expect(mockPoolQuery).toHaveBeenCalledTimes(1);
      expect(mockRm).toHaveBeenCalledWith(
        expect.stringContaining("hacerpedido-image-temporary-file.png"),
        { force: true },
      );
      expect(mockDeleteFile).not.toHaveBeenCalled();
    });

    test("removes the just-uploaded object when the database update fails", async () => {
      mockPoolQuery
        .mockResolvedValueOnce({ rows: [["old-logo.png"]] })
        .mockRejectedValueOnce(new Error("database unavailable"));

      await expect(POST(imageRequest())).rejects.toThrow(
        /Failed query: update "shops" set "logo"/,
      );

      expect(mockUploadFile).toHaveBeenCalled();
      // Rollback cleanup of the freshly uploaded object, not the old one.
      expect(mockDeleteFile).toHaveBeenCalledWith(
        `${shopID}-logo-image-key.png`,
      );
      expect(mockRm).toHaveBeenCalledWith(
        expect.stringContaining("hacerpedido-image-temporary-file.png"),
        { force: true },
      );
    });

    test("reports the original database error and logs a failed rollback cleanup", async () => {
      const errorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockPoolQuery
        .mockResolvedValueOnce({ rows: [["old-logo.png"]] })
        .mockRejectedValueOnce(new Error("database unavailable"));
      mockDeleteFile.mockRejectedValue(new Error("cleanup failed"));

      try {
        await expect(POST(imageRequest())).rejects.toThrow(
          /Failed query: update "shops" set "logo"/,
        );
        expect(mockDeleteFile).toHaveBeenCalledWith(
          `${shopID}-logo-image-key.png`,
        );
        expect(errorSpy).toHaveBeenCalledTimes(1);
      } finally {
        errorSpy.mockRestore();
      }
    });

    test("does not fail the request when removing the replaced object fails", async () => {
      const errorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockPoolQuery
        .mockResolvedValueOnce({ rows: [["old-logo.png"]] })
        .mockResolvedValueOnce({ rows: [] });
      mockDeleteFile.mockRejectedValueOnce(new Error("S3 delete failed"));

      try {
        const response = await POST(imageRequest());

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({
          image: `${shopID}-logo-image-key.png`,
        });
        expect(mockPoolQuery).toHaveBeenLastCalledWith(
          expect.objectContaining({
            text: 'update "shops" set "logo" = $1 where "shops"."id" = $2',
          }),
          [`${shopID}-logo-image-key.png`, shopID],
        );
        expect(mockDeleteFile).toHaveBeenCalledWith("old-logo.png");
        expect(errorSpy).toHaveBeenCalledTimes(1);
      } finally {
        errorSpy.mockRestore();
      }
    });
  });

  describe("DELETE", () => {
    test("clears the image column and deletes the stored image", async () => {
      mockPoolQuery
        .mockResolvedValueOnce({ rows: [["background.jpg"]] })
        .mockResolvedValueOnce({ rows: [] });

      const response = await DELETE(
        formRequest({ image_type: "background", shop_id: shopID }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ deleted: "background.jpg" });
      expect(mockPoolQuery).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          text: 'select "background" from "shops" where "shops"."id" = $1',
        }),
        [shopID],
      );
      // Drizzle sends NULL as a parameter.
      expect(mockPoolQuery).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          text: 'update "shops" set "background" = $1 where "shops"."id" = $2',
        }),
        [null, shopID],
      );
      expect(mockDeleteFile).toHaveBeenCalledWith("background.jpg");
    });

    test("clears a shop image without calling S3 when no stored key exists", async () => {
      mockPoolQuery
        .mockResolvedValueOnce({ rows: [[null]] })
        .mockResolvedValueOnce({ rows: [] });

      const response = await DELETE(
        formRequest({ image_type: "logo", shop_id: shopID }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ deleted: null });
      expect(mockDeleteFile).not.toHaveBeenCalled();
    });

    test("propagates database failures while deleting an image", async () => {
      mockPoolQuery.mockRejectedValue(new Error("database unavailable"));

      await expect(
        DELETE(formRequest({ image_type: "logo", shop_id: shopID })),
      ).rejects.toThrow(/Failed query: select "logo" from "shops"/);

      expect(mockDeleteFile).not.toHaveBeenCalled();
    });

    test("does not fail the request when removing the cleared object fails", async () => {
      const errorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockPoolQuery
        .mockResolvedValueOnce({ rows: [["background.jpg"]] })
        .mockResolvedValueOnce({ rows: [] });
      mockDeleteFile.mockRejectedValueOnce(new Error("S3 delete failed"));

      try {
        const response = await DELETE(
          formRequest({ image_type: "background", shop_id: shopID }),
        );

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ deleted: "background.jpg" });
        expect(mockPoolQuery).toHaveBeenNthCalledWith(
          2,
          expect.objectContaining({
            text: 'update "shops" set "background" = $1 where "shops"."id" = $2',
          }),
          [null, shopID],
        );
        expect(mockDeleteFile).toHaveBeenCalledWith("background.jpg");
        expect(errorSpy).toHaveBeenCalledTimes(1);
      } finally {
        errorSpy.mockRestore();
      }
    });
  });
});
