const mockPoolQuery = jest.fn();
const mockUploadFile = jest.fn();
const mockDeleteFile = jest.fn();
const mockWriteFile = jest.fn();
const mockRm = jest.fn();
const mockRandomString = jest.fn((length) =>
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

if (!global.Response) {
  global.Response = class TestResponse {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status ?? 200;
    }

    static json(body, init) {
      return new TestResponse(body, init);
    }

    async json() {
      return this.body;
    }
  };
}

const { DELETE, POST } = require("../../app/api/images/route");

const shopID = "550e8400-e29b-41d4-a716-446655440000";

function imageFile(contents, name, type) {
  const file = new File([contents], name, { type });
  Object.defineProperty(file, "arrayBuffer", {
    value: async () => Buffer.from(contents).buffer,
  });
  return file;
}

function formRequest(values) {
  const form = new FormData();
  for (const [name, value] of Object.entries(values)) form.append(name, value);
  return { formData: jest.fn().mockResolvedValue(form) };
}

function imageRequest(overrides = {}) {
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
        .mockResolvedValueOnce({ rows: [{ oldKey: "old-logo.png" }] })
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
        'UPDATE shops SET "logo" = $1 WHERE id = $2',
        [`${shopID}-logo-image-key.png`, shopID],
      );
      expect(mockDeleteFile).toHaveBeenCalledWith("old-logo.png");
      expect(mockRm).toHaveBeenCalledWith(
        expect.stringContaining("hacerpedido-image-temporary-file.png"),
        { force: true },
      );
    });

    test("cleans up the temporary file when S3 upload fails", async () => {
      mockPoolQuery.mockResolvedValue({ rows: [{ oldKey: null }] });
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
        .mockResolvedValueOnce({ rows: [{ oldKey: "old-logo.png" }] })
        .mockRejectedValueOnce(new Error("database unavailable"));

      await expect(POST(imageRequest())).rejects.toThrow(
        "database unavailable",
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
        .mockResolvedValueOnce({ rows: [{ oldKey: "old-logo.png" }] })
        .mockRejectedValueOnce(new Error("database unavailable"));
      mockDeleteFile.mockRejectedValue(new Error("cleanup failed"));

      try {
        await expect(POST(imageRequest())).rejects.toThrow(
          "database unavailable",
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
        .mockResolvedValueOnce({ rows: [{ oldKey: "old-logo.png" }] })
        .mockResolvedValueOnce({ rows: [] });
      mockDeleteFile.mockRejectedValueOnce(new Error("S3 delete failed"));

      try {
        const response = await POST(imageRequest());

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({
          image: `${shopID}-logo-image-key.png`,
        });
        expect(mockPoolQuery).toHaveBeenLastCalledWith(
          'UPDATE shops SET "logo" = $1 WHERE id = $2',
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
        .mockResolvedValueOnce({ rows: [{ oldKey: "background.jpg" }] })
        .mockResolvedValueOnce({ rows: [] });

      const response = await DELETE(
        formRequest({ image_type: "background", shop_id: shopID }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ deleted: "background.jpg" });
      expect(mockPoolQuery).toHaveBeenNthCalledWith(
        1,
        'SELECT "background" AS "oldKey" FROM shops WHERE id = $1',
        [shopID],
      );
      expect(mockPoolQuery).toHaveBeenNthCalledWith(
        2,
        'UPDATE shops SET "background" = NULL WHERE id = $1',
        [shopID],
      );
      expect(mockDeleteFile).toHaveBeenCalledWith("background.jpg");
    });

    test("clears a shop image without calling S3 when no stored key exists", async () => {
      mockPoolQuery
        .mockResolvedValueOnce({ rows: [{ oldKey: null }] })
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
      ).rejects.toThrow("database unavailable");

      expect(mockDeleteFile).not.toHaveBeenCalled();
    });

    test("does not fail the request when removing the cleared object fails", async () => {
      const errorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockPoolQuery
        .mockResolvedValueOnce({ rows: [{ oldKey: "background.jpg" }] })
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
          'UPDATE shops SET "background" = NULL WHERE id = $1',
          [shopID],
        );
        expect(mockDeleteFile).toHaveBeenCalledWith("background.jpg");
        expect(errorSpy).toHaveBeenCalledTimes(1);
      } finally {
        errorSpy.mockRestore();
      }
    });
  });
});
