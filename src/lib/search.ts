import { prisma } from "@/lib/prisma"
import { Prisma } from "@/generated/prisma/client/client"
import { z } from "zod"

// Zod schema for raw query result validation
const SearchProductRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  sku: z.string().nullable(),
  description: z.string().nullable(),
  price: z.preprocess((val) => {
    // Handle Prisma Decimal2 object from raw queries
    if (val && typeof val === "object" && "toNumber" in val && typeof val.toNumber === "function") {
      return val.toNumber()
    }
    // Handle string representation
    if (typeof val === "string") {
      return parseFloat(val)
    }
    // Handle number
    if (typeof val === "number") {
      return val
    }
    return val
  }, z.number()),
  images: z.array(z.string()).nullable(),
  stock: z.number(),
  isNew: z.boolean(),
  isFeatured: z.boolean(),
  categoryId: z.string(),
  supplierId: z.string().nullable(),
  categoryName: z.string(),
  categorySlug: z.string(),
  supplierName: z.string().nullable(),
  supplierSlug: z.string().nullable(),
  score: z.number(),
})

export type SearchProduct = z.infer<typeof SearchProductRowSchema>

interface SearchFilters {
  search?: string
  categories?: string[]
  suppliers?: string[]
  minPrice?: number
  maxPrice?: number
  featured?: boolean
  isNew?: boolean
  sortBy?: string
  limit?: number
  offset?: number
}

/**
 * Build dynamic WHERE clauses for filters.
 * Returns a Prisma.sql template that can be interpolated into the main query.
 */
function buildFilterClauses(filters: {
  categories?: string[] | null
  suppliers?: string[] | null
  minPrice?: number | null
  maxPrice?: number | null
  featured?: boolean | null
  isNew?: boolean | null
}) {
  const clauses: Prisma.Sql[] = []

  if (filters.categories && filters.categories.length > 0) {
    clauses.push(Prisma.sql`c.slug = ANY(${filters.categories}::text[])`)
  }

  if (filters.suppliers && filters.suppliers.length > 0) {
    clauses.push(Prisma.sql`s.slug = ANY(${filters.suppliers}::text[])`)
  }

  if (filters.minPrice != null) {
    clauses.push(Prisma.sql`p.price >= ${filters.minPrice}`)
  }

  if (filters.maxPrice != null) {
    clauses.push(Prisma.sql`p.price <= ${filters.maxPrice}`)
  }

  if (filters.featured != null) {
    clauses.push(Prisma.sql`p."isFeatured" = ${filters.featured}`)
  }

  if (filters.isNew != null) {
    clauses.push(Prisma.sql`p."isNew" = ${filters.isNew}`)
  }

  if (clauses.length === 0) {
    return Prisma.sql``
  }

  // Join clauses with AND
  return clauses.reduce((acc, clause, i) => {
    if (i === 0) return clause
    return Prisma.sql`${acc} AND ${clause}`
  })
}

/**
 * Search products with weighted relevance scoring.
 * Uses pg_trgm + unaccent for fuzzy matching.
 *
 * Scoring:
 * - SKU exact match: 100
 * - Name contains ALL tokens: 80
 * - Name contains ANY token: 50
 * - Supplier/Category name matches any token: 40
 * - Description contains any token: 20
 * - Trigram similarity > 0.3: 10
 */
export async function searchProducts(
  filters: SearchFilters
): Promise<{ products: SearchProduct[]; total: number }> {
  const searchQuery = filters.search?.slice(0, 200) || ""
  const limit = filters.limit ?? 24
  const offset = filters.offset ?? 0

  // Build dynamic filter clauses
  const filterClauses = buildFilterClauses({
    categories: filters.categories,
    suppliers: filters.suppliers,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    featured: filters.featured,
    isNew: filters.isNew,
  })

  const hasFilters = filterClauses.strings.join("").trim().length > 0

  // Main search query with weighted scoring
  const productsQuery = Prisma.sql`
    WITH search_tokens AS (
      SELECT unnest(string_to_array(f_unaccent(lower(${searchQuery})), ' ')) AS token
      WHERE ${searchQuery} IS NOT NULL AND ${searchQuery} != ''
    ),
    scored AS (
      SELECT
        p.id,
        p.name,
        p.slug,
        p.sku,
        p.description,
        p.price,
        p.images,
        p.stock,
        p."isNew",
        p."isFeatured",
        p."categoryId",
        p."supplierId",
        c.name AS "categoryName",
        c.slug AS "categorySlug",
        s.name AS "supplierName",
        s.slug AS "supplierSlug",
        COALESCE(
          CASE
            WHEN ${searchQuery} IS NOT NULL AND ${searchQuery} != ''
            THEN (
              -- SKU exact match: 100 points
              CASE WHEN f_unaccent(lower(COALESCE(p.sku, ''))) = f_unaccent(lower(${searchQuery}))
                THEN 100 ELSE 0 END
            )
            ELSE 0
          END,
          0
        ) +
        COALESCE(
          CASE
            WHEN ${searchQuery} IS NOT NULL AND ${searchQuery} != ''
            THEN (
              -- Name contains ALL tokens: 80 points
              CASE WHEN EXISTS (
                SELECT 1 FROM search_tokens
                WHERE f_unaccent(lower(p.name)) LIKE '%' || token || '%'
              ) AND NOT EXISTS (
                SELECT 1 FROM search_tokens
                WHERE f_unaccent(lower(p.name)) NOT LIKE '%' || token || '%'
              ) THEN 80 ELSE 0 END
            )
            ELSE 0
          END,
          0
        ) +
        COALESCE(
          CASE
            WHEN ${searchQuery} IS NOT NULL AND ${searchQuery} != ''
            THEN (
              -- Name contains ANY token: 50 points
              CASE WHEN EXISTS (
                SELECT 1 FROM search_tokens
                WHERE f_unaccent(lower(p.name)) LIKE '%' || token || '%'
              ) THEN 50 ELSE 0 END
            )
            ELSE 0
          END,
          0
        ) +
        COALESCE(
          CASE
            WHEN ${searchQuery} IS NOT NULL AND ${searchQuery} != ''
            THEN (
              -- Supplier or Category name matches any token: 40 points
              CASE WHEN EXISTS (
                SELECT 1 FROM search_tokens
                WHERE f_unaccent(lower(COALESCE(s.name, ''))) LIKE '%' || token || '%'
                   OR f_unaccent(lower(c.name)) LIKE '%' || token || '%'
              ) THEN 40 ELSE 0 END
            )
            ELSE 0
          END,
          0
        ) +
        COALESCE(
          CASE
            WHEN ${searchQuery} IS NOT NULL AND ${searchQuery} != ''
            THEN (
              -- Description contains any token: 20 points
              CASE WHEN EXISTS (
                SELECT 1 FROM search_tokens
                WHERE f_unaccent(lower(COALESCE(p.description, ''))) LIKE '%' || token || '%'
              ) THEN 20 ELSE 0 END
            )
            ELSE 0
          END,
          0
        ) +
        COALESCE(
          CASE
            WHEN ${searchQuery} IS NOT NULL AND ${searchQuery} != ''
            THEN (
              -- Trigram similarity fallback: 10 points
              CASE WHEN similarity(f_unaccent(lower(p.name)), f_unaccent(lower(${searchQuery}))) > 0.3
                THEN 10 ELSE 0 END
            )
            ELSE 0
          END,
          0
        ) AS score
      FROM products p
      JOIN categories c ON p."categoryId" = c.id
      LEFT JOIN suppliers s ON p."supplierId" = s.id
      WHERE p."isActive" = true
        ${hasFilters ? Prisma.sql`AND ${filterClauses}` : Prisma.sql``}
    )
    SELECT * FROM scored
    WHERE (${searchQuery} IS NULL OR ${searchQuery} = '' OR score > 0)
    ORDER BY score DESC, name ASC
    LIMIT ${limit} OFFSET ${offset}
  `

  // Count query with same filters
  const countQuery = Prisma.sql`
    WITH search_tokens AS (
      SELECT unnest(string_to_array(f_unaccent(lower(${searchQuery})), ' ')) AS token
      WHERE ${searchQuery} IS NOT NULL AND ${searchQuery} != ''
    ),
    scored AS (
      SELECT
        p.id,
        COALESCE(
          CASE
            WHEN ${searchQuery} IS NOT NULL AND ${searchQuery} != ''
            THEN (
              CASE WHEN f_unaccent(lower(COALESCE(p.sku, ''))) = f_unaccent(lower(${searchQuery}))
                THEN 100 ELSE 0 END
            )
            ELSE 0
          END,
          0
        ) +
        COALESCE(
          CASE
            WHEN ${searchQuery} IS NOT NULL AND ${searchQuery} != ''
            THEN (
              CASE WHEN EXISTS (
                SELECT 1 FROM search_tokens
                WHERE f_unaccent(lower(p.name)) LIKE '%' || token || '%'
              ) AND NOT EXISTS (
                SELECT 1 FROM search_tokens
                WHERE f_unaccent(lower(p.name)) NOT LIKE '%' || token || '%'
              ) THEN 80 ELSE 0 END
            )
            ELSE 0
          END,
          0
        ) +
        COALESCE(
          CASE
            WHEN ${searchQuery} IS NOT NULL AND ${searchQuery} != ''
            THEN (
              CASE WHEN EXISTS (
                SELECT 1 FROM search_tokens
                WHERE f_unaccent(lower(p.name)) LIKE '%' || token || '%'
              ) THEN 50 ELSE 0 END
            )
            ELSE 0
          END,
          0
        ) +
        COALESCE(
          CASE
            WHEN ${searchQuery} IS NOT NULL AND ${searchQuery} != ''
            THEN (
              CASE WHEN EXISTS (
                SELECT 1 FROM search_tokens
                WHERE f_unaccent(lower(COALESCE(s.name, ''))) LIKE '%' || token || '%'
                   OR f_unaccent(lower(c.name)) LIKE '%' || token || '%'
              ) THEN 40 ELSE 0 END
            )
            ELSE 0
          END,
          0
        ) +
        COALESCE(
          CASE
            WHEN ${searchQuery} IS NOT NULL AND ${searchQuery} != ''
            THEN (
              CASE WHEN EXISTS (
                SELECT 1 FROM search_tokens
                WHERE f_unaccent(lower(COALESCE(p.description, ''))) LIKE '%' || token || '%'
              ) THEN 20 ELSE 0 END
            )
            ELSE 0
          END,
          0
        ) +
        COALESCE(
          CASE
            WHEN ${searchQuery} IS NOT NULL AND ${searchQuery} != ''
            THEN (
              CASE WHEN similarity(f_unaccent(lower(p.name)), f_unaccent(lower(${searchQuery}))) > 0.3
                THEN 10 ELSE 0 END
            )
            ELSE 0
          END,
          0
        ) AS score
      FROM products p
      JOIN categories c ON p."categoryId" = c.id
      LEFT JOIN suppliers s ON p."supplierId" = s.id
      WHERE p."isActive" = true
        ${hasFilters ? Prisma.sql`AND ${filterClauses}` : Prisma.sql``}
    )
    SELECT COUNT(*)::int as count FROM scored
    WHERE (${searchQuery} IS NULL OR ${searchQuery} = '' OR score > 0)
  `

  const [rawProducts, countResult] = await Promise.all([
    prisma.$queryRaw(productsQuery),
    prisma.$queryRaw<{ count: number }[]>(countQuery),
  ])

  // Validate with Zod
  const products = SearchProductRowSchema.array().parse(rawProducts)
  const total = countResult[0]?.count ?? 0

  return { products, total }
}

/**
 * Autocomplete search — returns up to 8 ranked suggestions.
 * Uses the same scoring as searchProducts but without filter clauses.
 */
export async function searchAutocomplete(
  query: string
): Promise<SearchProduct[]> {
  const q = query.slice(0, 200)

  if (!q.trim()) {
    return []
  }

  const autocompleteQuery = Prisma.sql`
    WITH search_tokens AS (
      SELECT unnest(string_to_array(f_unaccent(lower(${q})), ' ')) AS token
    ),
    scored AS (
      SELECT
        p.id,
        p.name,
        p.slug,
        p.sku,
        p.description,
        p.price,
        p.images,
        p.stock,
        p."isNew",
        p."isFeatured",
        p."categoryId",
        p."supplierId",
        c.name AS "categoryName",
        c.slug AS "categorySlug",
        s.name AS "supplierName",
        s.slug AS "supplierSlug",
        COALESCE(
          CASE WHEN f_unaccent(lower(COALESCE(p.sku, ''))) = f_unaccent(lower(${q}))
            THEN 100 ELSE 0 END,
          0
        ) +
        COALESCE(
          CASE WHEN EXISTS (
            SELECT 1 FROM search_tokens
            WHERE f_unaccent(lower(p.name)) LIKE '%' || token || '%'
          ) AND NOT EXISTS (
            SELECT 1 FROM search_tokens
            WHERE f_unaccent(lower(p.name)) NOT LIKE '%' || token || '%'
          ) THEN 80 ELSE 0 END,
          0
        ) +
        COALESCE(
          CASE WHEN EXISTS (
            SELECT 1 FROM search_tokens
            WHERE f_unaccent(lower(p.name)) LIKE '%' || token || '%'
          ) THEN 50 ELSE 0 END,
          0
        ) +
        COALESCE(
          CASE WHEN EXISTS (
            SELECT 1 FROM search_tokens
            WHERE f_unaccent(lower(COALESCE(s.name, ''))) LIKE '%' || token || '%'
               OR f_unaccent(lower(c.name)) LIKE '%' || token || '%'
          ) THEN 40 ELSE 0 END,
          0
        ) +
        COALESCE(
          CASE WHEN EXISTS (
            SELECT 1 FROM search_tokens
            WHERE f_unaccent(lower(COALESCE(p.description, ''))) LIKE '%' || token || '%'
          ) THEN 20 ELSE 0 END,
          0
        ) +
        COALESCE(
          CASE WHEN similarity(f_unaccent(lower(p.name)), f_unaccent(lower(${q}))) > 0.3
            THEN 10 ELSE 0 END,
          0
        ) AS score
      FROM products p
      JOIN categories c ON p."categoryId" = c.id
      LEFT JOIN suppliers s ON p."supplierId" = s.id
      WHERE p."isActive" = true
    )
    SELECT * FROM scored
    WHERE score > 0
    ORDER BY score DESC, name ASC
    LIMIT 8
  `

  const rawResults = await prisma.$queryRaw(autocompleteQuery)
  return SearchProductRowSchema.array().parse(rawResults)
}
