---
name: s3-images
description: Upload and delete shop images on AWS S3 for HacerPedido, including the images route, the UploadImage editor component, and S3 env vars. Use when working with shop/logo/background images, image uploads or deletes, AWS S3, or the images API route.
---

# S3 image uploads

Shop images (logo, background, product uploads) are stored on AWS S3 and uploaded from the EditShop flow.

## When to use

- Adding/editing the upload or delete image endpoint (`app/api/images/route.ts`)
- Working with `components/EditShop/UploadImage.tsx` (crop + upload UI)
- Troubleshooting image uploads/deletes or S3 env configuration

## How it works

- `lib/utils/aws-s3.ts` uses **AWS SDK v3** (`@aws-sdk/client-s3`) and exports:
  - `uploadFile(fileName, key, mime)` — reads the local file, sends a `PutObjectCommand` with `ACL: "public-read"`.
  - `deleteFile(key)` — sends a `DeleteObjectCommand`.
- API route `app/api/images/route.ts` wraps these for the browser flow.
- UI: `components/EditShop/UploadImage.tsx` drives crop + upload on the editor.

## Env vars (names only — never commit values)

`HP_AWS_ACCESS_KEY_ID`, `HP_AWS_SECRET_ACCESS_KEY`, `HP_AWS_IMAGES_BUCKET`, `NEXT_PUBLIC_IMAGE_BUCKET_URL`.

## Typical tasks

**Upload a file:**
1. Confirm the four env vars are set in `.env.local` (upload fails without credentials).
2. Call `uploadFile(fileName, key, mime)` from `lib/utils/aws-s3.ts` (or hit `POST /api/images`).
3. Key should be a sensible path (e.g. `shops/<shopid>/<image>.jpg`); ACL is `public-read` so the object is publicly fetchable via `NEXT_PUBLIC_IMAGE_BUCKET_URL`.

**Delete a file:**
1. Call `deleteFile(key)` (or `DELETE /api/images`) with the object key.
2. Clean up any URL references in the shop record afterwards.

## Gotchas

- Uses `@aws-sdk/client-s3` (v3) — keep using v3 command call styles.
- `uploadFile` reads from a local path (`fs.readFileSync`) — in serverless contexts make sure the file exists on disk first (upload to a temp file, not a stream).
- Bucket must allow public-read ACL for images to render (`NEXT_PUBLIC_IMAGE_BUCKET_URL` is what the browser uses).
- Never log or commit AWS credentials.

## References

- Repo: `lib/utils/aws-s3.ts`, `app/api/images/route.ts`, `components/EditShop/UploadImage.tsx`.
