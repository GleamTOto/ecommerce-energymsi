# Cloudflare R2 MVP migration

This MVP moves new product image uploads to Cloudflare R2 without changing `Product.images` (`String[]`). Cloudinary remains available as a legacy fallback and rollback path; it is not used for new uploads. Existing Cloudinary URLs remain valid during the transition.

## Quick path

1. Create an R2 bucket and a scoped S3-compatible API token.
2. Set the server-only variables below in the deployment environment.
3. Deploy and verify an authenticated admin upload/delete flow.
4. Generate and review the read-only product-image inventory before creating a migration manifest.

## Environment

```text
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
```

`R2_PUBLIC_URL` is the canonical public base URL. `R2_PUBLIC_BASE_URL` is accepted only as a compatibility alias. Never expose the access key, secret, account ID, or bucket details to the browser.

## Architecture and files

| Area | MVP implementation |
| --- | --- |
| Storage | `src/lib/r2.ts` uses the AWS S3 client against the R2 endpoint, validates `products/` keys, and verifies objects with authenticated `HeadObject` metadata. The client is server-only. |
| Upload API | `POST /api/upload` accepts `file`, validates JPEG/PNG/WebP/GIF and 5 MB, and returns `{ url, publicId }`. |
| Delete API | `DELETE /api/upload?publicId=...` deletes only validated `products/` R2 keys. Legacy IDs are skipped safely. |
| Authorization | Upload/delete and product create/update/delete require an `ADMIN` session. Public reads remain public. |
| Admin flow | `src/components/admin/ImageUpload.tsx` validates upload responses, preserves successful partial batches, and removes only R2 keys while retaining legacy images safely. |
| Compatibility | `Product.images` and existing Cloudinary URLs are unchanged. Next Image keeps Cloudinary and adds the configured R2 hostname. |
| Dependencies | `@aws-sdk/client-s3` and the retained `cloudinary` package for legacy fallback/rollback; no presigned URL dependency is needed for server-side multipart uploads. |

## Migration utility

### Product image inventory

Generate the migration input directly from PostgreSQL without changing any data:

```bash
npx tsx scripts/audit-product-images.ts --output product-images.json
```

The utility reads only `Product.id` and `Product.images`, writes UTF-8 JSON records in the format expected by the migration utility, and always preserves repeated URL references. Its terminal output contains only counts and a sanitized host distribution. Legacy non-Cloudinary URLs and malformed URLs are reported for review but do not make the inventory fail. Do not run this against production unless the database access is explicitly authorized.

Review `product-images.json` and the summary before using the migration utility. The reviewed inventory must be available before any `--execute --apply` run; inventory generation itself never uploads, updates, or deletes data.

`scripts/migrate-cloudinary-to-r2.ts` reads an explicit JSON record list, rejects redirects, validates authorized Cloudinary HTTPS URLs and the actual downloaded content type/size, and writes a manifest. It is dry-run by default and never changes the database without both `--execute` and `--apply`. R2 verification uses authenticated `HeadObject` metadata. Source URLs are hashed into deterministic keys, so identical source URLs reuse one verified object while every product reference remains in the manifest and can be applied independently. Use `--resume <manifest>` to reuse verified `newUrl`/`key` records and preserve deduplication across previous manifests. Use `--limit` and `--resume-from` for bounded batches. Individual download, R2 verification, and persistence failures remain `failed` and are reported in the manifest. It was not run without credentials or a real manifest.

Generate the read-only input inventory with:

```bash
node --import dotenv/config --import tsx scripts/audit-product-images.ts \
  --output /tmp/energymsi-product-images.json
```

The pre-migration inventory found 131 references, 131 unique URLs, no duplicates, no invalid URLs, and all sources on the Cloudinary host. Review the generated file before any `--execute --apply` run.

## Status and verification

- R2 probe status: **completed**; the configured connection was tested with a temporary upload, authenticated metadata verification, and immediate deletion. No probe object remained.
- R2 connectivity probe: **passed** after correcting the diagnostic harness import; cleanup was confirmed.
- Read-only PostgreSQL inventory: **passed**; 131 product-image references were exported without modifying data.
- Controlled migration: **completed** in six batches; 131/131 references applied, 131 verified objects, and zero recorded failures.
- Post-migration inventory: **passed**; all 131 references now resolve to the configured R2 host.
- `npm install`: run during implementation; result is recorded with the delivery verification.
- `npm run lint` and `npm run build`: run during implementation; pre-existing failures are reported separately if present.
- HTTP 402: the audit found no application code returning 402. A prior 402 may be upstream Cloudinary billing/quota/delivery behavior, but its cause is unconfirmed.

## Deployment, rollback, and cost

Configure the five R2 variables before deployment. Cloudinary configuration and the legacy adapter remain available for rollback, while new uploads continue to use R2. Rollback is the previous upload route plus retaining existing URLs; do not delete old Cloudinary objects until all products have been verified on R2. The current configured public host is an `r2.dev` endpoint; replace it with an authorized custom domain before treating this as the definitive production CDN. R2 storage, operations, egress, custom-domain, and cache costs depend on the account plan and traffic; confirm current Cloudflare pricing before production rollout.

Remaining Cloudinary work: inventory and review existing URLs, run the manifest migration in controlled batches, verify product pages, then remove legacy delivery/configuration only after rollback coverage is no longer required.
