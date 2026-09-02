import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import * as s3utils from "#lib/utils/aws-s3";
import { randomString } from "#lib/utils/utils";

const validator: { isUUID(value: string): boolean } = require("validator");
const { Pool } = require("pg");

export const runtime = "nodejs";

const acceptedImageTypes = ["logo", "background"];
const acceptedMimeTypes = ["image/png", "image/jpeg"];

const pool = new Pool({ connectionString: process.env.PG_CONNECTION_STRING });

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
    await pool.query(`UPDATE shops SET "${imageColumn}" = $1 WHERE id = $2`, [
      key,
      shopID,
    ]);
    if (oldKey) await s3utils.deleteFile(oldKey);
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
  if (oldKey) await s3utils.deleteFile(oldKey);
  return Response.json({ deleted: oldKey });
}
