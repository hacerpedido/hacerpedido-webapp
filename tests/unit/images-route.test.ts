/** @jest-environment node */
// The route runs on the Node runtime and loads the `pg` driver through Drizzle,
// whose crypto helpers require Node globals (TextEncoder) absent in jsdom.

const mockPoolQuery = jest.fn();
const mockUploadFile = jest.fn();
const mockDeleteFile = jest.fn();
const mockWriteFile = jest.fn();
const mockRm = jest.fn();
const mockAuthorizeEditorRequest = jest.fn();

jest.mock("#lib/db/pool", () => ({
  getPool: jest.fn(() => ({ query: mockPoolQuery })),
}));
jest.mock("#lib/utils/aws-s3", () => ({
  uploadFile: mockUploadFile,
  deleteFile: mockDeleteFile,
}));
jest.mock("#lib/server/editor-authorization", () => ({
  authorizeEditorRequest: mockAuthorizeEditorRequest,
}));
jest.mock("node:fs", () => ({
  promises: {
    writeFile: mockWriteFile,
    rm: mockRm,
  },
}));

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

interface ImagePart {
  contents: Buffer;
  filename: string;
  contentType: string;
}

type ImageRequest = Request;

type ImagesHandler = (request: ImageRequest) => Promise<Response>;

// Deferred require: an ESM import would be hoisted above the shared mock
// handles, making the mocked factories run before they initialize.
const { DELETE, POST } = require("../../app/api/images/route") as {
  POST: ImagesHandler;
  DELETE: ImagesHandler;
};
const sharpModule = require("sharp") as typeof import("sharp");
const sharp = (sharpModule.default ??
  sharpModule) as unknown as typeof sharpModule.default;

const shopID = "550e8400-e29b-41d4-a716-446655440000";

const validPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

function imageFile(
  contents: string | Buffer,
  name: string,
  type: string,
): ImagePart {
  const source =
    typeof contents === "string" ? Buffer.from(contents) : contents;
  return { contents: source, filename: name, contentType: type };
}

function formRequest(values: Record<string, string | ImagePart>): ImageRequest {
  const boundary = "----hacerpedido-test-boundary";
  const body = multipartBody(values, boundary);
  return new Request("http://localhost/api/images", {
    method: "POST",
    headers: {
      "content-type": `multipart/form-data; boundary=${boundary}`,
      "content-length": String(body.length),
    },
    body: body as unknown as BodyInit,
  });
}

function multipartBody(
  values: Record<string, string | ImagePart>,
  boundary: string,
): Buffer {
  const chunks: Buffer[] = [];
  for (const [name, value] of Object.entries(values)) {
    if (typeof value === "string") {
      chunks.push(
        Buffer.from(
          `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`,
        ),
      );
      continue;
    }
    chunks.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${name}"; filename="${value.filename}"\r\nContent-Type: ${value.contentType}\r\n\r\n`,
      ),
      value.contents,
      Buffer.from("\r\n"),
    );
  }
  chunks.push(Buffer.from(`--${boundary}--\r\n`));
  return Buffer.concat(chunks);
}

function streamedRequest(
  values: Record<string, string | ImagePart>,
  options: {
    declaredLength?: number;
    prefix?: Buffer;
    truncate?: boolean;
  } = {},
): ImageRequest {
  const boundary = "----hacerpedido-stream-boundary";
  const completeBody = Buffer.concat([
    options.prefix ?? Buffer.alloc(0),
    multipartBody(values, boundary),
  ]);
  const closingBoundary = Buffer.from(`--${boundary}--\r\n`);
  const body = options.truncate
    ? completeBody.subarray(0, completeBody.length - closingBoundary.length)
    : completeBody;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (let offset = 0; offset < body.length; offset += 16 * 1024) {
        controller.enqueue(body.subarray(offset, offset + 16 * 1024));
      }
      controller.close();
    },
  });
  const headers: Record<string, string> = {
    "content-type": `multipart/form-data; boundary=${boundary}`,
  };
  if (options.declaredLength !== undefined) {
    headers["content-length"] = String(options.declaredLength);
  }
  return new Request("http://localhost/api/images", {
    method: "POST",
    headers,
    body: stream,
    duplex: "half",
  } as RequestInit & { duplex: "half" });
}

async function generatedImage(
  width: number,
  height: number,
  format: "png" | "webp" = "png",
): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 1 },
    },
  })
    [format]()
    .toBuffer();
}

function deleteRequest(imageType = "logo"): ImageRequest {
  return formRequest({ image_type: imageType });
}

function imageRequestValues(
  overrides: Record<string, string | ImagePart> = {},
): Record<string, string | ImagePart> {
  return {
    image_type: "logo",
    shop_id: shopID,
    image: imageFile(validPng, "logo.png", "image/png"),
    ...overrides,
  };
}

function imageRequest(
  overrides: Record<string, string | ImagePart> = {},
): ImageRequest {
  return formRequest(imageRequestValues(overrides));
}

describe("images API route", () => {
  beforeEach(() => {
    mockPoolQuery.mockReset();
    mockUploadFile.mockReset().mockResolvedValue(undefined);
    mockDeleteFile.mockReset().mockResolvedValue(undefined);
    mockWriteFile.mockReset().mockResolvedValue(undefined);
    mockRm.mockReset().mockResolvedValue(undefined);
    mockAuthorizeEditorRequest.mockReset().mockResolvedValue(shopID);
  });

  describe("POST", () => {
    test("rejects unauthorized requests before reading FormData", async () => {
      const request = imageRequest();
      mockAuthorizeEditorRequest.mockResolvedValue(null);

      const response = await POST(request);

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: "Unauthorized." });
      expect(mockPoolQuery).not.toHaveBeenCalled();
      expect(mockUploadFile).not.toHaveBeenCalled();
    });

    test("uses the authorized shop instead of the submitted shop_id", async () => {
      const submittedShopID = "00000000-0000-4000-8000-000000000000";
      mockPoolQuery
        .mockResolvedValueOnce({ rows: [[null]] })
        .mockResolvedValueOnce({ rows: [[shopID]] });

      const response = await POST(imageRequest({ shop_id: submittedShopID }));

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        image: expect.stringMatching(
          new RegExp(`^${shopID}-logo-[0-9a-f-]+\\.png$`),
        ),
      });
      expect(mockPoolQuery).toHaveBeenLastCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('update "shops" set "logo" = $1'),
        }),
        expect.arrayContaining([expect.any(String), shopID]),
      );
    });

    test("rejects an input over the 5 MiB cap before database or S3 work", async () => {
      const oversized = imageFile(
        Buffer.alloc(5 * 1024 * 1024 + 1),
        "logo.png",
        "image/png",
      );

      const response = await POST(imageRequest({ image: oversized }));

      expect(response.status).toBe(413);
      expect(mockPoolQuery).not.toHaveBeenCalled();
      expect(mockUploadFile).not.toHaveBeenCalled();
    });

    test("rejects an oversized declared Content-Length before parsing", async () => {
      const response = await POST(
        streamedRequest(
          { image_type: "logo" },
          { declaredLength: 5 * 1024 * 1024 + 64 * 1024 + 1 },
        ),
      );

      expect(response.status).toBe(413);
      expect(mockPoolQuery).not.toHaveBeenCalled();
    });

    test("rejects a request whose streamed total exceeds the allowance", async () => {
      const response = await POST(
        streamedRequest(imageRequestValues(), {
          prefix: Buffer.alloc(5 * 1024 * 1024 + 64 * 1024 + 1),
        }),
      );

      expect(response.status).toBe(413);
      expect(mockPoolQuery).not.toHaveBeenCalled();
      expect(mockUploadFile).not.toHaveBeenCalled();
    });

    test("enforces the file cap while streaming without Content-Length", async () => {
      const response = await POST(
        streamedRequest(
          imageRequestValues({
            image: imageFile(
              Buffer.alloc(5 * 1024 * 1024 + 1),
              "logo.png",
              "image/png",
            ),
          }),
        ),
      );

      expect(response.status).toBe(413);
      expect(mockPoolQuery).not.toHaveBeenCalled();
      expect(mockUploadFile).not.toHaveBeenCalled();
    });

    test("rejects malformed multipart bodies", async () => {
      const response = await POST(
        new Request("http://localhost/api/images", {
          method: "POST",
          headers: {
            "content-type": "multipart/form-data; boundary=missing",
          },
          body: "not a multipart body",
        }),
      );

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: "Invalid multipart request.",
      });
      expect(mockPoolQuery).not.toHaveBeenCalled();
    });

    test("returns a controlled error for unexpected EOF during an active image file", async () => {
      const response = await POST(
        streamedRequest(
          imageRequestValues({
            image: imageFile(
              Buffer.concat([validPng, Buffer.alloc(64 * 1024)]),
              "logo.png",
              "image/png",
            ),
          }),
          { truncate: true },
        ),
      );

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: "Invalid multipart request.",
      });
      expect(mockPoolQuery).not.toHaveBeenCalled();
      expect(mockUploadFile).not.toHaveBeenCalled();
    });

    test("returns 413 when the aggregate limit is exceeded during an active image file", async () => {
      const response = await POST(
        streamedRequest(
          imageRequestValues({
            image: imageFile(
              Buffer.alloc(5 * 1024 * 1024 - 128),
              "logo.png",
              "image/png",
            ),
          }),
          { prefix: Buffer.alloc(64 * 1024) },
        ),
      );

      expect(response.status).toBe(413);
      expect(await response.json()).toEqual({ error: "Image too large." });
      expect(mockPoolQuery).not.toHaveBeenCalled();
      expect(mockUploadFile).not.toHaveBeenCalled();
    });

    test.each([
      ["image_type", { image_type: "banner" }, "Wrong parameters (1)."],
      ["image", { image: "not a file" }, "Wrong parameters (3)."],
      [
        "malformed contents",
        { image: imageFile("not an image", "logo.png", "image/png") },
        "Invalid image.",
      ],
    ])("rejects an invalid %s", async (_name, override, message) => {
      const response = await POST(imageRequest(override));

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: message });
      expect(mockPoolQuery).not.toHaveBeenCalled();
    });

    test("rejects a valid image in an unsupported format", async () => {
      const webp = await generatedImage(1, 1, "webp");
      const response = await POST(
        imageRequest({ image: imageFile(webp, "logo.webp", "image/webp") }),
      );

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "Invalid image." });
      expect(mockPoolQuery).not.toHaveBeenCalled();
    });

    test.each([
      ["dimension", 4097, 1],
      ["pixel", 4096, 4097],
    ])(
      "rejects an image over the maximum %s limit",
      async (_name, width, height) => {
        const oversized = await generatedImage(width, height);
        const response = await POST(
          imageRequest({
            image: imageFile(oversized, "logo.png", "image/png"),
          }),
        );

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ error: "Invalid image." });
        expect(mockPoolQuery).not.toHaveBeenCalled();
      },
    );

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
        .mockResolvedValueOnce({ rows: [[shopID]] });

      const response = await POST(imageRequest());

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        image: expect.stringMatching(
          new RegExp(`^${shopID}-logo-[0-9a-f-]+\\.png$`),
        ),
      });
      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringMatching(/hacerpedido-image-[0-9a-f-]+\.png$/),
        expect.any(Buffer),
      );
      expect(mockUploadFile).toHaveBeenCalledWith(
        expect.stringMatching(/hacerpedido-image-[0-9a-f-]+\.png$/),
        expect.stringMatching(new RegExp(`^${shopID}-logo-[0-9a-f-]+\\.png$`)),
        "image/png",
      );
      expect(mockPoolQuery).toHaveBeenLastCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('update "shops" set "logo" = $1'),
        }),
        expect.arrayContaining([
          expect.stringMatching(
            new RegExp(`^${shopID}-logo-[0-9a-f-]+\\.png$`),
          ),
          shopID,
          "old-logo.png",
        ]),
      );
      expect(mockDeleteFile).toHaveBeenCalledWith("old-logo.png");
      expect(mockRm).toHaveBeenCalledWith(
        expect.stringMatching(/hacerpedido-image-[0-9a-f-]+\.png$/),
        { force: true },
      );
    });

    test("cleans up a fresh upload when the compare-and-swap loses", async () => {
      mockPoolQuery
        .mockResolvedValueOnce({ rows: [["old-logo.png"]] })
        .mockResolvedValueOnce({ rows: [] });

      const response = await POST(imageRequest());

      expect(response.status).toBe(409);
      expect(await response.json()).toEqual({
        error: "The image changed. Please try again.",
      });
      expect(mockDeleteFile).toHaveBeenCalledTimes(1);
      expect(mockDeleteFile).toHaveBeenCalledWith(
        expect.stringMatching(new RegExp(`^${shopID}-logo-[0-9a-f-]+\\.png$`)),
      );
      expect(mockDeleteFile).not.toHaveBeenCalledWith("old-logo.png");
    });

    test("cleans up the temporary file when S3 upload fails", async () => {
      mockPoolQuery.mockResolvedValue({ rows: [[null]] });
      mockUploadFile.mockRejectedValue(new Error("S3 unavailable"));

      await expect(POST(imageRequest())).rejects.toThrow("S3 unavailable");

      expect(mockPoolQuery).toHaveBeenCalledTimes(1);
      expect(mockRm).toHaveBeenCalledWith(
        expect.stringMatching(/hacerpedido-image-[0-9a-f-]+\.png$/),
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
        expect.stringMatching(new RegExp(`^${shopID}-logo-[0-9a-f-]+\\.png$`)),
      );
      expect(mockRm).toHaveBeenCalledWith(
        expect.stringMatching(/hacerpedido-image-[0-9a-f-]+\.png$/),
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
          expect.stringMatching(
            new RegExp(`^${shopID}-logo-[0-9a-f-]+\\.png$`),
          ),
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
        .mockResolvedValueOnce({ rows: [[shopID]] });
      mockDeleteFile.mockRejectedValueOnce(new Error("S3 delete failed"));

      try {
        const response = await POST(imageRequest());

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({
          image: expect.stringMatching(
            new RegExp(`^${shopID}-logo-[0-9a-f-]+\\.png$`),
          ),
        });
        expect(mockPoolQuery).toHaveBeenLastCalledWith(
          expect.objectContaining({
            text: expect.stringContaining('update "shops" set "logo" = $1'),
          }),
          expect.arrayContaining([
            expect.stringMatching(
              new RegExp(`^${shopID}-logo-[0-9a-f-]+\\.png$`),
            ),
            shopID,
            "old-logo.png",
          ]),
        );
        expect(mockDeleteFile).toHaveBeenCalledWith("old-logo.png");
        expect(errorSpy).toHaveBeenCalledTimes(1);
      } finally {
        errorSpy.mockRestore();
      }
    });
  });

  describe("DELETE", () => {
    test("rejects unauthorized requests before reading FormData", async () => {
      const request = formRequest({ image_type: "logo", shop_id: shopID });
      mockAuthorizeEditorRequest.mockResolvedValue(null);

      const response = await DELETE(request);

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: "Unauthorized." });
      expect(mockPoolQuery).not.toHaveBeenCalled();
      expect(mockDeleteFile).not.toHaveBeenCalled();
    });

    test("clears the image column and deletes the stored image", async () => {
      mockPoolQuery
        .mockResolvedValueOnce({ rows: [["background.jpg"]] })
        .mockResolvedValueOnce({ rows: [[shopID]] });

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
          text: expect.stringContaining('update "shops" set "background" = $1'),
        }),
        [null, shopID, "background.jpg"],
      );
      expect(mockDeleteFile).toHaveBeenCalledWith("background.jpg");
    });

    test("does not delete an image when the compare-and-swap loses", async () => {
      mockPoolQuery
        .mockResolvedValueOnce({ rows: [["background.jpg"]] })
        .mockResolvedValueOnce({ rows: [] });

      const response = await DELETE(deleteRequest("background"));

      expect(response.status).toBe(409);
      expect(await response.json()).toEqual({
        error: "The image changed. Please try again.",
      });
      expect(mockDeleteFile).not.toHaveBeenCalled();
    });

    test("clears a shop image without calling S3 when no stored key exists", async () => {
      mockPoolQuery
        .mockResolvedValueOnce({ rows: [[null]] })
        .mockResolvedValueOnce({ rows: [[shopID]] });

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
        .mockResolvedValueOnce({ rows: [[shopID]] });
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
            text: expect.stringContaining(
              'update "shops" set "background" = $1',
            ),
          }),
          [null, shopID, "background.jpg"],
        );
        expect(mockDeleteFile).toHaveBeenCalledWith("background.jpg");
        expect(errorSpy).toHaveBeenCalledTimes(1);
      } finally {
        errorSpy.mockRestore();
      }
    });
  });
});
