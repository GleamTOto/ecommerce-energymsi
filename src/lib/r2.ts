import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"

const R2_PUBLIC_URL_FALLBACK = process.env.R2_PUBLIC_BASE_URL

export class R2ConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "R2ConfigurationError"
  }
}

export class R2ObjectVerificationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "R2ObjectVerificationError"
  }
}

interface R2Config {
  bucket: string
  publicUrl: string
  client: S3Client
}

let client: S3Client | undefined

function getConfig(): R2Config {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  const bucket = process.env.R2_BUCKET_NAME
  const publicUrl = process.env.R2_PUBLIC_URL || R2_PUBLIC_URL_FALLBACK

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    throw new R2ConfigurationError("R2 storage is not configured")
  }

  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    })
  }

  return { bucket, publicUrl: publicUrl.replace(/\/$/, ""), client }
}

const safeObjectKeyPattern = /^products\/[A-Za-z0-9._-]+$/

export function assertSafeObjectKey(key: string): string {
  if (!safeObjectKeyPattern.test(key)) {
    throw new R2ObjectVerificationError("Invalid R2 object key")
  }
  return key
}

export async function uploadFile(
  body: Buffer,
  contentType: string,
  key: string
): Promise<void> {
  assertSafeObjectKey(key)
  const { bucket, client } = getConfig()

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  )
}

export async function getObjectMetadata(key: string): Promise<{
  contentType: string | undefined
  size: number | undefined
}> {
  assertSafeObjectKey(key)
  const { bucket, client } = getConfig()
  const result = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
  return { contentType: result.ContentType, size: result.ContentLength }
}

export async function verifyObject(
  key: string,
  expected: { contentType: string; size: number }
): Promise<void> {
  const metadata = await getObjectMetadata(key)
  if (metadata.contentType?.split(";", 1)[0] !== expected.contentType) {
    throw new R2ObjectVerificationError("R2 object has the wrong content type")
  }
  if (metadata.size !== expected.size) {
    throw new R2ObjectVerificationError("R2 object has the wrong content size")
  }
}

export function getPublicUrl(key: string): string {
  assertSafeObjectKey(key)
  const { publicUrl } = getConfig()
  return `${publicUrl}/${key.replace(/^\/+/, "")}`
}

export async function deleteFile(key: string): Promise<void> {
  assertSafeObjectKey(key)
  const { bucket, client } = getConfig()
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
}
