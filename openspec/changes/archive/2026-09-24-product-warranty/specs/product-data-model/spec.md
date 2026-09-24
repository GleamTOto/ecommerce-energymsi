# Delta for Product Data Model

## ADDED Requirements

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
