/**
 * XLSX Product Import Script
 *
 * Parses the inventory xlsx file and generates mock-products.ts with
 * categories, suppliers, and products from real inventory data.
 *
 * Usage: npx tsx scripts/import-products.ts
 */

import * as XLSX from "xlsx"
import * as fs from "fs"
import * as path from "path"

const XLSX_PATH = "/Users/danielbohorquez/Downloads/inventario_energy_msi_3.xlsx"
const OUTPUT_PATH = path.resolve(__dirname, "../src/data/mock-products.ts")

// ==================== Helpers ====================

function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
}

function ensureUniqueSlug(slug: string, existingSlugs: Set<string>): string {
  if (!existingSlugs.has(slug)) return slug
  let counter = 1
  while (existingSlugs.has(`${slug}-${counter}`)) {
    counter++
  }
  return `${slug}-${counter}`
}

function mapStatus(statusStr: string | undefined | null): "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" {
  if (!statusStr) return "OUT_OF_STOCK"
  const s = statusStr.toString().trim()
  if (s.includes("OK") || s.includes("Disponible")) return "ACTIVE"
  if (s.includes("Agotado")) return "OUT_OF_STOCK"
  if (s.includes("Bajo") || s.includes("Inactivo")) return "INACTIVE"
  return "ACTIVE"
}

function toNumber(val: unknown, fallback = 0): number {
  if (val === null || val === undefined || val === "") return fallback
  const n = Number(val)
  return isNaN(n) ? fallback : Math.round(n * 100) / 100
}

function normalizeSupplier(name: string): string {
  const trimmed = name.trim()
  // Normalize case: "otros" → "Otros"
  if (trimmed.toLowerCase() === "otros") return "Otros"
  return trimmed
}

// ==================== Parse XLSX ====================

console.log("📦 Reading xlsx file:", XLSX_PATH)
const workbook = XLSX.readFile(XLSX_PATH)

// --- Categories ---
console.log("\n📂 Parsing categories...")
const catSheet = workbook.Sheets["Categorias"]
const catRows = XLSX.utils.sheet_to_json(catSheet, { header: 1 }) as unknown[][]

interface RawCategory {
  name: string
  color: string
  description: string
}

const rawCategories: RawCategory[] = []
const categorySlugSet = new Set<string>()

for (let i = 4; i < catRows.length; i++) {
  const row = catRows[i]
  if (!row || !row[0] || !String(row[0]).trim()) continue
  const name = String(row[0]).trim()
  const color = row[1] ? String(row[1]).trim() : "#666666"
  const description = row[3] ? String(row[3]).trim() : ""
  const slug = ensureUniqueSlug(slugify(name), categorySlugSet)
  categorySlugSet.add(slug)
  rawCategories.push({ name, color, description })
}

console.log(`  Found ${rawCategories.length} categories`)

// Build category lookup (name → slug)
const categoryNameToSlug = new Map<string, string>()
for (const cat of rawCategories) {
  categoryNameToSlug.set(cat.name.toLowerCase(), slugify(cat.name))
}

// --- Products ---
console.log("\n📦 Parsing products...")
const invSheet = workbook.Sheets["Inventario"]
const invRows = XLSX.utils.sheet_to_json(invSheet, { header: 1 }) as unknown[][]

interface RawProduct {
  sku: string
  name: string
  category: string
  supplier: string
  unit: string
  cost: number
  price: number
  margin: number
  stock: number
  minStock: number
  status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK"
}

const rawProducts: RawProduct[] = []
const supplierSet = new Set<string>()
const skuSet = new Set<string>()

for (let i = 6; i < invRows.length; i++) {
  const row = invRows[i]
  if (!row || !row[0] || !String(row[0]).trim()) continue

  let sku = String(row[0]).trim()
  // Handle duplicate SKUs
  if (skuSet.has(sku)) {
    let counter = 2
    while (skuSet.has(`${sku}-V${counter}`)) counter++
    sku = `${sku}-V${counter}`
  }
  skuSet.add(sku)

  const name = String(row[1] || "").trim()
  const categoryName = String(row[2] || "").trim()
  const supplierName = normalizeSupplier(String(row[3] || "Otros"))
  const unit = String(row[4] || "und").trim().toUpperCase()
  const cost = toNumber(row[5])
  const price = toNumber(row[6])
  const margin = toNumber(row[7])
  const stock = toNumber(row[9])
  const minStock = toNumber(row[10])
  const status = mapStatus(row[12] as string)

  supplierSet.add(supplierName)

  rawProducts.push({ sku, name, category: categoryName, supplier: supplierName, unit, cost, price, margin, stock, minStock, status })
}

console.log(`  Found ${rawProducts.length} products`)
console.log(`  Found ${supplierSet.size} unique suppliers:`, [...supplierSet].sort())

// --- Suppliers ---
const supplierNames = [...supplierSet].sort()
const supplierSlugSet = new Set<string>()

interface RawSupplier {
  name: string
  color: string
}

// Assign colors to suppliers
const supplierColors: Record<string, string> = {
  Netion: "#2563EB",
  "Green Point": "#16A34A",
  MovilTronics: "#DC2626",
  Truper: "#EA580C",
  Unitec: "#7C3AED",
  Importronic: "#0891B2",
  Otros: "#6B7280",
  EvoBike: "#DB2777",
}

const rawSuppliers: RawSupplier[] = supplierNames.map((name) => ({
  name,
  color: supplierColors[name] || "#6B7280",
}))

// ==================== Generate Output ====================

console.log("\n🔨 Generating mock-products.ts...")

// Build category data
const categorySlugs = new Map<string, string>()
for (const cat of rawCategories) {
  categorySlugs.set(cat.name, ensureUniqueSlug(slugify(cat.name), new Set()))
}

// Re-compute with unique tracking
const finalCategorySlugs = new Set<string>()
const categoriesData = rawCategories.map((cat, idx) => {
  const slug = ensureUniqueSlug(slugify(cat.name), finalCategorySlugs)
  finalCategorySlugs.add(slug)
  // Count products in this category
  const productCount = rawProducts.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase()).length
  return { id: String(idx + 1), name: cat.name, slug, icon: "Package", color: cat.color, description: cat.description, productCount }
})

// Build supplier data
const finalSupplierSlugs = new Set<string>()
const suppliersData = rawSuppliers.map((sup, idx) => {
  const slug = ensureUniqueSlug(slugify(sup.name), finalSupplierSlugs)
  finalSupplierSlugs.add(slug)
  const productCount = rawProducts.filter((p) => p.supplier === sup.name).length
  return { id: String(idx + 1), name: sup.name, slug, color: sup.color, productCount }
})

// Build product data
const finalProductSlugs = new Set<string>()
const productsData = rawProducts.map((prod, idx) => {
  const slug = ensureUniqueSlug(slugify(prod.name), finalProductSlugs)
  finalProductSlugs.add(slug)

  // Map category name to slug
  const catSlug = categorySlugs.get(prod.category) || slugify(prod.category)

  return {
    id: String(idx + 1),
    name: prod.name,
    slug,
    sku: prod.sku,
    description: prod.name, // Use name as description since xlsx doesn't have one
    price: prod.price,
    cost: prod.cost,
    margin: prod.margin,
    unit: prod.unit,
    minStock: prod.minStock,
    status: prod.status,
    stock: prod.stock,
    isNew: false,
    isFeatured: prod.status === "ACTIVE" && prod.stock > 0,
    rating: 0,
    supplier: prod.supplier,
    category: catSlug,
    specs: {} as Record<string, string>,
  }
})

// ==================== Write File ====================

const output = `import { Product, Category, Supplier } from "@/types"

export const categories: Category[] = ${JSON.stringify(categoriesData, null, 2)}

export const suppliers: Supplier[] = ${JSON.stringify(suppliersData, null, 2)}

export const products: Product[] = ${JSON.stringify(productsData, null, 2)}

export const featuredProducts = products.filter((p) => p.isFeatured)
export const newProducts = products.filter((p) => p.isNew)
`

fs.writeFileSync(OUTPUT_PATH, output, "utf-8")

console.log(`\n✅ Generated ${OUTPUT_PATH}`)
console.log(`   ${categoriesData.length} categories`)
console.log(`   ${suppliersData.length} suppliers`)
console.log(`   ${productsData.length} products`)
