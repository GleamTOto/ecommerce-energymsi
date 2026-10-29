/**
 * Create the migration input JSON from Product.images without changing data.
 *
 * This utility only reads Product.id and Product.images, then writes records
 * compatible with scripts/migrate-cloudinary-to-r2.ts. URL validation is
 * informational: legacy and malformed URLs remain in the output for review.
 *
 * Example:
 *   npx tsx scripts/audit-product-images.ts --output product-images.json
 */

import { writeFile } from "node:fs/promises"
import { prisma } from "@/lib/prisma"

interface ProductImageRecord {
  productId: string
  imageIndex: number
  url: string
}

interface ImageSummary {
  totalReferences: number
  uniqueUrls: number
  duplicateReferences: number
  legacyNonCloudinaryReferences: number
  invalidUrlReferences: number
  hostDistribution: Record<string, number>
}

function getOutputPath() {
  const outputFlagIndex = process.argv.indexOf("--output")
  if (outputFlagIndex === -1) return "product-images.json"

  const outputPath = process.argv[outputFlagIndex + 1]
  if (!outputPath || outputPath.startsWith("--")) {
    throw new Error("--output requires a path")
  }
  return outputPath
}

function classifyUrl(url: string) {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase()
    const isCloudinary = parsed.protocol === "https:" && hostname === "res.cloudinary.com"

    return {
      host: hostname || "no-host",
      isCloudinary,
      isValid: parsed.protocol === "http:" || parsed.protocol === "https:",
    }
  } catch {
    return { host: "invalid-url", isCloudinary: false, isValid: false }
  }
}

function summarize(records: ProductImageRecord[]): ImageSummary {
  const urls = new Set<string>()
  const hostDistribution: Record<string, number> = {}
  let legacyNonCloudinaryReferences = 0
  let invalidUrlReferences = 0

  for (const record of records) {
    urls.add(record.url)
    const classification = classifyUrl(record.url)
    hostDistribution[classification.host] = (hostDistribution[classification.host] || 0) + 1
    if (!classification.isValid) invalidUrlReferences += 1
    else if (!classification.isCloudinary) legacyNonCloudinaryReferences += 1
  }

  return {
    totalReferences: records.length,
    uniqueUrls: urls.size,
    duplicateReferences: records.length - urls.size,
    legacyNonCloudinaryReferences,
    invalidUrlReferences,
    hostDistribution: Object.fromEntries(
      Object.entries(hostDistribution).sort(([left], [right]) => left.localeCompare(right)),
    ),
  }
}

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, images: true },
    orderBy: { id: "asc" },
  })
  const records: ProductImageRecord[] = []

  for (const product of products) {
    product.images.forEach((image, imageIndex) => {
      const url = image.trim()
      if (url) records.push({ productId: product.id, imageIndex, url })
    })
  }

  const outputPath = getOutputPath()
  await writeFile(outputPath, `${JSON.stringify(records, null, 2)}\n`, "utf8")

  const summary = summarize(records)
  console.log(`Product image inventory written (${summary.totalReferences} references).`)
  console.log(`Unique URLs: ${summary.uniqueUrls}; duplicate references: ${summary.duplicateReferences}.`)
  console.log(`Legacy non-Cloudinary references: ${summary.legacyNonCloudinaryReferences}; invalid URLs: ${summary.invalidUrlReferences}.`)
  console.log(`Host distribution: ${JSON.stringify(summary.hostDistribution)}.`)
}

main()
  .catch(() => {
    console.error("Product image inventory failed.")
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
