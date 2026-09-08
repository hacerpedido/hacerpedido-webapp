import { readFileSync } from "node:fs";

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function createS3Client(): S3Client {
  const endpoint = process.env.HP_S3_ENDPOINT;

  return new S3Client({
    region: process.env.AWS_REGION ?? "us-east-1",
    followRegionRedirects: true,
    credentials: {
      accessKeyId: process.env.HP_AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.HP_AWS_SECRET_ACCESS_KEY as string,
    },
    ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
  });
}

export async function uploadFile(
  fileName: string,
  key: string,
  mime: string,
): Promise<void> {
  const fileContent = readFileSync(fileName);
  const s3 = createS3Client();

  const params = {
    Bucket: process.env.HP_AWS_IMAGES_BUCKET,
    Key: key,
    Body: fileContent,
    ContentType: mime,
    // Long-lived, immutable cache: each upload produces a new key
    // (`${shopId}-${imageType}-${random10}.${ext}` in app/api/images/route.ts),
    // so a year-long TTL is safe — the next edit gets a brand-new URL.
    // Pairs with images.minimumCacheTTL in next.config.ts so Vercel's image
    // optimizer keeps the transformed variants cached at the edge too.
    CacheControl: "public, max-age=31536000, immutable",
    ACL: "public-read" as const,
  };

  await s3.send(new PutObjectCommand(params));
}

export async function deleteFile(key: string): Promise<void> {
  const s3 = createS3Client();

  const params = {
    Bucket: process.env.HP_AWS_IMAGES_BUCKET,
    Key: key,
  };

  await s3.send(new DeleteObjectCommand(params));
}
