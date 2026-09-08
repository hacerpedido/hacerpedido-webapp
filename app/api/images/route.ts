import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { shops } from "#db/schema";
import { getDb } from "#lib/db/client";
import { authorizeEditorRequest } from "#lib/server/editor-authorization";
import * as s3utils from "#lib/utils/aws-s3";

import Busboy from "busboy";
import { and, eq, isNull } from "drizzle-orm";
import sharp from "sharp";

export const runtime = "nodejs";

const acceptedImageTypes = ["logo", "background"];
const maxInputBytes = 5 * 1024 * 1024;
// The image is capped separately; this allowance is only for multipart
// headers, boundaries, and the two small text fields.
const maxMultipartOverheadBytes = 64 * 1024;
const maxRequestBytes = maxInputBytes + maxMultipartOverheadBytes;
const maxFieldBytes = 128;
const maxImagePixels = 16_000_000;
const maxImageDimension = 4096;

const db = getDb();

function errorResponse(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

function unauthorizedResponse() {
  return Response.json({ error: "Unauthorized." }, { status: 401 });
}

function tooLargeResponse() {
  return Response.json({ error: "Image too large." }, { status: 413 });
}

function conflictResponse() {
  return Response.json(
    { error: "The image changed. Please try again." },
    {
      status: 409,
    },
  );
}

class PayloadTooLargeError extends Error {}

interface ParsedMultipart {
  fields: Map<string, string>;
  image?: Buffer;
}

type MultipartResult = ParsedMultipart | Response;

/**
 * Parse the request without letting undici's FormData implementation buffer
 * an unbounded body. Busboy's limits protect individual parts; the counting
 * transform protects the complete request, including multipart overhead.
 */
async function parseMultipart(request: Request): Promise<MultipartResult> {
  const contentType = request.headers.get("content-type");
  if (!contentType?.toLowerCase().startsWith("multipart/form-data")) {
    return errorResponse("Invalid multipart request.");
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength !== null) {
    if (!/^\d+$/.test(contentLength.trim())) {
      return errorResponse("Invalid multipart request.");
    }
    const declaredLength = Number(contentLength);
    if (!Number.isSafeInteger(declaredLength)) {
      return tooLargeResponse();
    }
    if (declaredLength > maxRequestBytes) return tooLargeResponse();
  }

  if (!request.body) return errorResponse("Invalid multipart request.");

  let busboy: ReturnType<typeof Busboy>;
  try {
    busboy = Busboy({
      headers: Object.fromEntries(request.headers.entries()),
      limits: {
        fileSize: maxInputBytes,
        files: 1,
        fields: 3,
        // Busboy emits partsLimit when the counter reaches the configured
        // value, so 4 permits exactly the three supported parts.
        parts: 4,
        fieldSize: maxFieldBytes,
        headerPairs: 20,
      },
    });
  } catch {
    return errorResponse("Invalid multipart request.");
  }

  const source = Readable.fromWeb(
    request.body as Parameters<typeof Readable.fromWeb>[0],
  );
  let totalBytes = 0;
  const counter = new Transform({
    transform(chunk: unknown, _encoding, callback) {
      const bytes = Buffer.isBuffer(chunk)
        ? chunk
        : Buffer.from(chunk as Uint8Array);
      totalBytes += bytes.length;
      if (totalBytes > maxRequestBytes) {
        callback(new PayloadTooLargeError());
        return;
      }
      callback(null, bytes);
    },
  });

  return new Promise((resolve) => {
    const fields = new Map<string, string>();
    let image: Buffer | undefined;
    let imageParts = 0;
    let invalid = false;
    let limitExceeded = false;
    let settled = false;

    const stopStreams = () => {
      source.destroy();
      counter.destroy();
      busboy.destroy();
    };
    const fail = (response: Response) => {
      if (settled) return;
      settled = true;
      stopStreams();
      resolve(response);
    };
    const failStream = (error: unknown) => {
      if (error instanceof PayloadTooLargeError) {
        fail(tooLargeResponse());
      } else {
        fail(errorResponse("Invalid multipart request."));
      }
    };

    busboy.on("field", (name, value, info) => {
      if (info.valueTruncated) {
        limitExceeded = true;
        return;
      }
      if (fields.has(name)) {
        invalid = true;
        return;
      }
      fields.set(name, value);
    });
    busboy.on("file", (name, file) => {
      file.on("error", failStream);
      imageParts += 1;
      if (name !== "image" || imageParts > 1) {
        invalid = true;
        file.resume();
        return;
      }

      const chunks: Buffer[] = [];
      let fileBytes = 0;
      file.on("data", (chunk: Buffer) => {
        fileBytes += chunk.length;
        if (fileBytes <= maxInputBytes) chunks.push(chunk);
      });
      file.on("limit", () => {
        limitExceeded = true;
      });
      file.on("end", () => {
        if (!settled && fileBytes <= maxInputBytes) {
          image = Buffer.concat(chunks, fileBytes);
        }
      });
    });
    busboy.on("filesLimit", () => {
      limitExceeded = true;
    });
    busboy.on("fieldsLimit", () => {
      limitExceeded = true;
    });
    busboy.on("partsLimit", () => {
      limitExceeded = true;
    });
    busboy.on("error", failStream);
    counter.on("error", failStream);
    source.on("error", failStream);
    busboy.on("close", () => {
      if (settled) return;
      settled = true;
      if (limitExceeded) {
        resolve(tooLargeResponse());
      } else if (invalid) {
        resolve(errorResponse("Wrong parameters (3)."));
      } else {
        resolve({ fields, image });
      }
    });

    source.pipe(counter).pipe(busboy);
  });
}

interface ProcessedImage {
  buffer: Buffer;
  extension: "png" | "jpg";
  mime: "image/png" | "image/jpeg";
}

async function processImage(input: Buffer): Promise<ProcessedImage | Response> {
  if (input.length > maxInputBytes) return tooLargeResponse();
  try {
    const options = {
      failOn: "error" as const,
      limitInputPixels: maxImagePixels,
    };
    const metadata = await sharp(input, options).metadata();
    const format = metadata.format;
    const width = metadata.width;
    const height = metadata.height;
    if (
      (format !== "png" && format !== "jpeg") ||
      !width ||
      !height ||
      width > maxImageDimension ||
      height > maxImageDimension ||
      width * height > maxImagePixels
    ) {
      return errorResponse("Invalid image.");
    }

    const output = await sharp(input, options)
      .rotate()
      .toFormat(format === "png" ? "png" : "jpeg")
      .toBuffer();
    return {
      buffer: output,
      extension: format === "png" ? "png" : "jpg",
      mime: format === "png" ? "image/png" : "image/jpeg",
    };
  } catch {
    return errorResponse("Invalid image.");
  }
}

/**
 * S3/DB failure semantics for image mutations.
 *
 * The `shops` row is the source of truth for which object key is active:
 *  * S3 operations that must complete before the DB commit (uploading the new
 *    image) are awaited and their failures fail the request.
 *  * If the DB commit fails after the upload succeeded, the freshly uploaded
 *    object is removed best-effort so it does not stay orphaned; the original
 *    DB error is still reported.
 *  * S3 cleanups that happen after a successful commit (removing a replaced or
 *    cleared object) are awaited but their failures must not turn a committed,
 *    consistent result into an error. The shop row is already correct and only
 *    an orphaned old object may remain, so the failure is logged for
 *    reconciliation.
 *
 * Retries for transient S3 errors rely on the AWS SDK v3 default retry policy.
 */
async function cleanupBestEffort(
  label: string,
  key: string,
  action: () => Promise<void>,
): Promise<void> {
  try {
    await action();
  } catch (error) {
    console.error(`[images] ${label} "${key}" failed:`, error);
  }
}

export async function POST(request: Request): Promise<Response> {
  const shopID = await authorizeEditorRequest(request);
  if (!shopID) return unauthorizedResponse();

  const form = await parseMultipart(request);
  if (form instanceof Response) return form;

  const imageType = form.fields.get("image_type");
  if (!imageType || !acceptedImageTypes.includes(imageType)) {
    return errorResponse("Wrong parameters (1).");
  }

  if (!form.image || form.image.length === 0) {
    return errorResponse("Wrong parameters (3).");
  }

  const processed = await processImage(form.image);
  if (processed instanceof Response) return processed;

  const imageColumn = imageType === "logo" ? "logo" : "background";
  const selected = await db
    .select({ oldKey: imageColumn === "logo" ? shops.logo : shops.background })
    .from(shops)
    .where(eq(shops.id, shopID));
  if (selected.length === 0) {
    return errorResponse("Wrong parameters (5).");
  }

  const oldKey = selected[0].oldKey;
  const key = `${shopID}-${imageType}-${randomUUID()}.${processed.extension}`;
  const temporaryFile = path.join(
    os.tmpdir(),
    `hacerpedido-image-${randomUUID()}.${processed.extension}`,
  );

  try {
    await fs.writeFile(temporaryFile, processed.buffer);
    await s3utils.uploadFile(temporaryFile, key, processed.mime);
    try {
      const updated = await db
        .update(shops)
        .set(imageColumn === "logo" ? { logo: key } : { background: key })
        .where(
          and(
            eq(shops.id, shopID),
            oldKey === null
              ? isNull(imageColumn === "logo" ? shops.logo : shops.background)
              : eq(
                  imageColumn === "logo" ? shops.logo : shops.background,
                  oldKey,
                ),
          ),
        )
        .returning({ id: shops.id });
      if (updated.length === 0) {
        await cleanupBestEffort(
          "remove uploaded image after compare-and-swap conflict",
          key,
          () => s3utils.deleteFile(key),
        );
        return conflictResponse();
      }
    } catch (error) {
      await cleanupBestEffort(
        "remove uploaded image after database failure",
        key,
        () => s3utils.deleteFile(key),
      );
      throw error;
    }
    if (oldKey) {
      await cleanupBestEffort("remove replaced image", oldKey, () =>
        s3utils.deleteFile(oldKey),
      );
    }
    return Response.json({ image: key });
  } finally {
    await fs.rm(temporaryFile, { force: true });
  }
}

export async function DELETE(request: Request): Promise<Response> {
  const shopID = await authorizeEditorRequest(request);
  if (!shopID) return unauthorizedResponse();

  const form = await parseMultipart(request);
  if (form instanceof Response) return form;

  const imageType = form.fields.get("image_type");
  if (!imageType || !acceptedImageTypes.includes(imageType)) {
    return errorResponse("Wrong parameters (1).");
  }

  const imageColumn = imageType === "logo" ? "logo" : "background";
  const selected = await db
    .select({ oldKey: imageColumn === "logo" ? shops.logo : shops.background })
    .from(shops)
    .where(eq(shops.id, shopID));
  if (selected.length === 0) {
    return errorResponse("Wrong parameters (5).");
  }

  const oldKey = selected[0].oldKey;
  const updated = await db
    .update(shops)
    .set(imageColumn === "logo" ? { logo: null } : { background: null })
    .where(
      and(
        eq(shops.id, shopID),
        oldKey === null
          ? isNull(imageColumn === "logo" ? shops.logo : shops.background)
          : eq(imageColumn === "logo" ? shops.logo : shops.background, oldKey),
      ),
    )
    .returning({ id: shops.id });
  if (updated.length === 0) return conflictResponse();
  if (oldKey) {
    await cleanupBestEffort("remove cleared image", oldKey, () =>
      s3utils.deleteFile(oldKey),
    );
  }
  return Response.json({ deleted: oldKey });
}
