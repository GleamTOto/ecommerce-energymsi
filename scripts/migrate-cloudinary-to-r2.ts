/**
 * Create an R2 migration manifest from Cloudinary image records.
 *
 * Input JSON: [{ "productId": "...", "imageIndex": 0, "url": "https://..." }]
 * Default: dry-run validation only. Use --execute to upload and --apply to
 * update Product.images after a successful upload. The script never changes
 * the database without --apply.
 *
 * Examples:
 *   npx tsx scripts/migrate-cloudinary-to-r2.ts --input cloudinary.json
 *   npx tsx scripts/migrate-cloudinary-to-r2.ts --input cloudinary.json --execute --limit 25
 *   npx tsx scripts/migrate-cloudinary-to-r2.ts --input cloudinary.json --execute --apply
 *   npx tsx scripts/migrate-cloudinary-to-r2.ts --input cloudinary.json --resume cloudinary.json.manifest.json
 */

import { createHash } from "node:crypto"
import { readFile, writeFile } from "node:fs/promises"
import { prisma } from "@/lib/prisma"
import { getObjectMetadata, getPublicUrl, uploadFile, verifyObject } from "@/lib/r2"

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])
const maxSize = 5 * 1024 * 1024

interface InputRecord {
  productId: string
  imageIndex: number
  url: string
}

interface ManifestRecord extends InputRecord {
  newUrl?: string
  key?: string
  status: "dry-run" | "migrated" | "failed" | "applied"
  failure?: string
}

function argument(name: string) {
  const index = process.argv.indexOf(name)
  return index === -1 ? undefined : process.argv[index + 1]
}

function hasFlag(name: string) {
  return process.argv.includes(name)
}

function assertInput(value: unknown): InputRecord[] {
  if (!Array.isArray(value)) throw new Error("Input must be a JSON array")
  return value.map((record, index) => {
    if (
      !record ||
      typeof record !== "object" ||
      typeof (record as InputRecord).productId !== "string" ||
      typeof (record as InputRecord).imageIndex !== "number" ||
      typeof (record as InputRecord).url !== "string"
    ) {
      throw new Error(`Invalid record at index ${index}`)
    }
    return record as InputRecord
  })
}

async function download(url: string) {
  const parsed = new URL(url)
  if (parsed.protocol !== "https:" || parsed.hostname !== "res.cloudinary.com") {
    throw new Error("URL is not a Cloudinary URL")
  }

  const response = await fetch(url, { redirect: "error" })
  if (!response.ok) throw new Error(`Download returned HTTP ${response.status}`)

  const contentType = response.headers.get("content-type")?.split(";", 1)[0] || ""
  const contentLength = Number(response.headers.get("content-length") || 0)
  if (!allowedTypes.has(contentType)) throw new Error(`Unsupported content type: ${contentType || "missing"}`)
  if (contentLength > maxSize) throw new Error("Downloaded image exceeds 5 MB")

  if (!response.body) throw new Error("Download did not return a body")
  const chunks: Buffer[] = []
  let totalSize = 0
  const reader = response.body.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    totalSize += value.byteLength
    if (totalSize > maxSize) throw new Error("Downloaded image exceeds 5 MB")
    chunks.push(Buffer.from(value))
  }
  const body = Buffer.concat(chunks)
  if (body.length === 0) throw new Error("Invalid downloaded image size")
  return { body, contentType }
}

function recordId(record: InputRecord) {
  return `${record.productId}\u0000${record.imageIndex}\u0000${record.url}`
}

function deterministicKey(record: InputRecord, contentType: string) {
  const extension = contentType.split("/")[1].replace("jpeg", "jpg")
  const sourceHash = createHash("sha256").update(record.url).digest("hex").slice(0, 32)
  return `products/migrated-${sourceHash}.${extension}`
}

async function verifyR2(record: ManifestRecord, expected?: { contentType: string; size: number }) {
  if (!record.key || !record.newUrl) throw new Error("Missing migrated object metadata")
  if (expected) return verifyObject(record.key, expected)
  await getObjectMetadata(record.key)
}

async function applyRecord(record: ManifestRecord) {
  const newUrl = record.newUrl
  if (!newUrl) throw new Error("Missing migrated URL")
  await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: record.productId } })
    if (!product || product.images[record.imageIndex] !== record.url) {
      throw new Error("Product image no longer matches the manifest")
    }
    const images = [...product.images]
    images[record.imageIndex] = newUrl
    await tx.product.update({ where: { id: product.id }, data: { images } })
  })
}

async function main() {
  const inputPath = argument("--input")
  if (!inputPath) throw new Error("--input is required")

  const outputPath = argument("--output") || `${inputPath}.manifest.json`
  const resumePath = argument("--resume")
  const execute = hasFlag("--execute")
  const apply = hasFlag("--apply")
  if (apply && !execute) throw new Error("--apply requires --execute")

  const limit = Number(argument("--limit") || Infinity)
  const resumeFrom = Number(argument("--resume-from") || 0)
  const records = assertInput(JSON.parse(await readFile(inputPath, "utf8")))
    .slice(resumeFrom, resumeFrom + limit)
  const previous = resumePath
    ? (JSON.parse(await readFile(resumePath, "utf8")) as unknown[])
    : []
  if (!Array.isArray(previous)) throw new Error("Resume manifest must be a JSON array")

  const previousById = new Map<string, ManifestRecord>()
  const previousByUrl = new Map<string, ManifestRecord>()
  for (const value of previous) {
    const record = value as ManifestRecord
    if (typeof record?.productId === "string" && typeof record.imageIndex === "number" && typeof record.url === "string") {
      previousById.set(recordId(record), record)
      if (record.key && record.newUrl && (record.status === "migrated" || record.status === "applied")) {
        previousByUrl.set(record.url, record)
      }
    }
  }

  const manifest: ManifestRecord[] = []
  const processed = new Set<string>()
  const migratedByUrl = new Map<string, ManifestRecord>()
  for (const record of records) {
    const id = recordId(record)
    if (processed.has(id)) continue
    processed.add(id)

    const existing = previousById.get(id)
    const result: ManifestRecord = existing
      ? { ...existing }
      : { ...record, status: execute ? "failed" : "dry-run" }
    try {
      const reusable = migratedByUrl.get(record.url) || previousByUrl.get(record.url)
      if (reusable) {
        if (execute) await verifyR2(reusable)
        result.key = reusable.key
        result.newUrl = reusable.newUrl
        if (!execute) {
          result.status = "dry-run"
        } else if (apply) {
          if (existing?.status !== "applied") await applyRecord(result)
          result.status = "applied"
        } else {
          result.status = existing?.status === "applied" ? "applied" : "migrated"
        }
        migratedByUrl.set(record.url, result)
        manifest.push(result)
        continue
      }

      const { body, contentType } = await download(record.url)
      if (execute) {
        const key = existing?.key || deterministicKey(record, contentType)
        await uploadFile(body, contentType, key)
        result.key = key
        result.newUrl = getPublicUrl(key)
        await verifyR2(result, { contentType, size: body.length })
        result.status = "migrated"
        if (apply) {
          await applyRecord(result)
          result.status = "applied"
        }
      }
      if (result.status === "migrated" || result.status === "applied") migratedByUrl.set(record.url, result)
    } catch (error) {
      result.status = "failed"
      result.failure = error instanceof Error ? error.message : "Unknown migration failure"
    }
    manifest.push(result)
  }

  await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`Wrote ${manifest.length} records to ${outputPath}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
