# Product Data Model Specification

## Purpose

Define the evolved data model for products, categories, and suppliers to support 106 real inventory items with SKU tracking, cost/margin accounting, supplier relationships, and stock management.

## Requirements

### Requirement: Product Type Evolution

The TypeScript `Product` interface MUST include these new fields: `sku` (string, unique), `supplierId` (string), `cost` (number, purchase cost in COP), `margin` (number, percentage), `unit` (string, e.g. "UNIDAD", "CAJA"), `minStock` (number, minimum stock threshold), `status` (enum: ACTIVE | INACTIVE | OUT_OF_STOCK).

The existing `brand` field MUST be replaced by `supplier` (string, supplier name). The `images` field MUST become optional (`images?: string[]`). The `originalPrice` field MUST be renamed to `comparePrice` for clarity.

#### Scenario: Product with complete inventory data

- GIVEN a product from the xlsx import
- WHEN the product is loaded via API
- THEN the Product object MUST contain sku, supplier, cost, margin, unit, minStock, status fields
- AND price MUST be in COP (no decimal conversion from PEN)

#### Scenario: Product without images

- GIVEN a product that has no images in the xlsx
- WHEN the product is loaded
- THEN the images field MUST be an empty array or undefined
- AND the product MUST still render correctly using ProductImage placeholder

#### Scenario: Product status transitions

- GIVEN a product with stock = 0 and minStock > 0
- WHEN stock reaches zero
- THEN status MUST be set to OUT_OF_STOCK
- AND the product SHOULD remain visible in catalog but marked as unavailable

### Requirement: Supplier Model (replaces Brand)

The Prisma `Brand` model MUST be renamed to `Supplier`. The TypeScript `Brand` interface MUST be renamed to `Supplier`. The Supplier model MUST include: `id`, `name`, `slug` (unique), `description?`, `color?` (hex color for UI), `productCount` (computed).

#### Scenario: Supplier list with colors

- GIVEN 9 suppliers from xlsx (Netion, Green Point, MovilTronics, Truper, Unitec, Importronic, Otros, EvoBike, etc.)
- WHEN the supplier list is rendered
- THEN each supplier MUST display its assigned color
- AND productCount MUST reflect actual product associations

### Requirement: Category Model Extension

The `Category` model MUST add: `color` (string, hex), `description` (string), `productCount` (computed). The 13 categories from xlsx MUST be seeded with their descriptions and colors.

#### Scenario: Category with description and color

- GIVEN a category from the xlsx "Categorias" sheet
- WHEN loaded via API
- THEN the category MUST include color, description, and accurate productCount

### Requirement: Prisma Schema Migration

The Prisma schema MUST reflect all type changes. The `Brand` model MUST be renamed to `Supplier` with new fields. The `Product` model MUST add: `sku` (unique), `cost` (Decimal 12,2), `margin` (Decimal 5,2), `unit` (String), `minStock` (Int), `status` (enum ProductStatus). The `brandId`/`brand` relation MUST become `supplierId`/`supplier`.

#### Scenario: Prisma migration preserves existing data

- GIVEN existing products in the database
- WHEN the migration runs
- THEN existing products MUST be reassigned from Brand to Supplier
- AND no data MUST be lost during the rename

### Requirement: FilterState Type Update

The `FilterState` interface MUST replace `brands: string[]` with `suppliers: string[]`. The `priceRange` MUST support COP values (up to millions).

#### Scenario: Filter by supplier instead of brand

- GIVEN the filter sidebar
- WHEN a user selects suppliers
- THEN products MUST be filtered by supplierId
- AND the URL query param MUST be `supplier` not `brand`

### Requirement: Product Warranty Field

The Product data model MUST support an optional `warranty` field (string) that stores per-product warranty information. The Prisma schema MUST define `warranty String?` on the Product model. The TypeScript `Product` interface MUST include `warranty?: string`. The `transformProduct` function MUST map the warranty field from Prisma to the domain type, returning `undefined` when the database value is null.

#### Scenario: Product with warranty value

- GIVEN a product stored with warranty = "1 ano de garantia"
- WHEN the product is loaded via `transformProduct`
- THEN the resulting Product object MUST have `warranty` equal to "1 ano de garantia"

#### Scenario: Product without warranty (null)

- GIVEN a product stored with warranty = null
- WHEN the product is loaded via `transformProduct`
- THEN the resulting Product object MUST have `warranty` equal to `undefined`

#### Scenario: Product without warranty (empty string)

- GIVEN a product stored with warranty = ""
- WHEN the product is loaded via `transformProduct`
- THEN the resulting Product object MUST have `warranty` equal to `undefined` (empty strings normalized to undefined)

#### Scenario: Migration adds nullable column

- GIVEN existing products in the database with no warranty column
- WHEN `npx prisma migrate dev --name add-warranty-field` runs
- THEN the migration MUST add a nullable `warranty` column to the `products` table
- AND no existing data MUST be lost
- AND all existing rows MUST have warranty = null

### Requirement: Product Detail Warranty Display

The `ProductDetail` component MUST conditionally render warranty information based on the product's `warranty` field. The hardcoded "1 ano de garantia" text MUST be removed. When `product.warranty` is truthy, the warranty section MUST display the value. When `product.warranty` is falsy (undefined, null, or empty), the warranty section MUST be hidden entirely.

#### Scenario: Display warranty when present

- GIVEN a product with `warranty = "2 anos de garantia"`
- WHEN the ProductDetail component renders
- THEN the ShieldCheck icon and warranty text "2 anos de garantia" MUST be visible
- AND the text MUST come from `product.warranty`, not be hardcoded

#### Scenario: Hide warranty when absent

- GIVEN a product with `warranty = undefined`
- WHEN the ProductDetail component renders
- THEN the warranty section (ShieldCheck icon and text) MUST NOT be rendered
- AND the remaining benefits (shipping, returns) MUST still display

#### Scenario: Hide warranty when empty string

- GIVEN a product with `warranty = ""`
- WHEN the ProductDetail component renders
- THEN the warranty section MUST NOT be rendered

#### Scenario: Long warranty text

- GIVEN a product with `warranty = "3 anos de garantia cubriendo defectos de fabricacion con servicio tecnico autorizado"`
- WHEN the ProductDetail component renders
- THEN the full warranty text MUST be displayed without truncation

### Requirement: Mock Data Warranty Samples

The mock product data in `src/data/mock-products.ts` SHOULD include warranty values on a subset of products to enable visual testing of both states (with and without warranty).

#### Scenario: Mixed warranty values in mock data

- GIVEN the mock products array
- WHEN loaded for development or testing
- THEN at least 3 products MUST have a non-empty `warranty` value
- AND at least 3 products MUST have `warranty` omitted or undefined
## Dependencies

- None (this is the foundational data model; all other capabilities depend on this)

## Constraints

- Prisma 7 with PostgreSQL 16
- No Server Actions — use Route Handlers for API
- Path alias `@/*` → `./src/*`
- Decimal precision for COP: `@db.Decimal(12, 2)` for prices/cost, `@db.Decimal(5, 2)` for margin
