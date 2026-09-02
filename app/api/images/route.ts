import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { getPool } from "#lib/db/pool";
import * as s3utils from "#lib/utils/aws-s3";
import { randomString } from "#lib/utils/utils";

const validator: { isUUID(value: string): boolean } = require("validator");

export const runtime = "nodejs";

const acceptedImageTypes = ["logo", "background"];
const acceptedMimeTypes = ["image/png", "image/jpeg"];

const pool = getPool();

function field(form: FormData, name: string): string | undefined {
  const value = form.get(name);
  return typeof value === "string" ? value : undefined;
}

function errorResponse(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

async function parseForm(request: Request): Promise<FormData | Response> {
  try {
    return await request.formData();
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : String(error),
    );
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
  const form = await parseForm(request);
  if (form instanceof Response) return form;

  const imageType = field(form, "image_type");
  const shopID = field(form, "shop_id");
  if (!imageType || !acceptedImageTypes.includes(imageType)) {
    return errorResponse("Wrong parameters (1).");
  }
  if (!shopID || !validator.isUUID(shopID)) {
    return errorResponse("Wrong parameters (2).");
  }

  const image = form.get("image");
  if (!(image instanceof File) || image.size === 0) {
    return errorResponse("Wrong parameters (3).");
  }
  const mime = image.type;
  if (!mime || !acceptedMimeTypes.includes(mime)) {
    return errorResponse("Wrong parameters (4).");
  }

  const imageColumn = imageType === "logo" ? "logo" : "background";
  const { rows: selectData } = await pool.query(
    `SELECT "${imageColumn}" AS "oldKey" FROM shops WHERE id = $1`,
    [shopID],
  );
  if (selectData.length === 0) {
    return errorResponse("Wrong parameters (5).");
  }

  const oldKey = selectData[0].oldKey;
  const extension = mime === "image/png" ? "png" : "jpg";
  const key = `${shopID}-${imageType}-${randomString(10)}.${extension}`;
  const temporaryFile = path.join(
    os.tmpdir(),
    `hacerpedido-image-${randomString(16)}.${extension}`,
  );

  try {
    await fs.writeFile(temporaryFile, Buffer.from(await image.arrayBuffer()));
    await s3utils.uploadFile(temporaryFile, key, mime);
    try {
      await pool.query(`UPDATE shops SET "${imageColumn}" = $1 WHERE id = $2`, [
        key,
        shopID,
      ]);
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
  const form = await parseForm(request);
  if (form instanceof Response) return form;

  const imageType = field(form, "image_type");
  const shopID = field(form, "shop_id");
  if (!imageType || !acceptedImageTypes.includes(imageType)) {
    return errorResponse("Wrong parameters (1).");
  }
  if (!shopID || !validator.isUUID(shopID)) {
    return errorResponse("Wrong parameters (2).");
  }

  const imageColumn = imageType === "logo" ? "logo" : "background";
  const { rows: selectData } = await pool.query(
    `SELECT "${imageColumn}" AS "oldKey" FROM shops WHERE id = $1`,
    [shopID],
  );
  if (selectData.length === 0) {
    return errorResponse("Wrong parameters (5).");
  }

  const oldKey = selectData[0].oldKey;
  await pool.query(`UPDATE shops SET "${imageColumn}" = NULL WHERE id = $1`, [
    shopID,
  ]);
  if (oldKey) {
    await cleanupBestEffort("remove cleared image", oldKey, () =>
      s3utils.deleteFile(oldKey),
    );
  }
  return Response.json({ deleted: oldKey });
}
