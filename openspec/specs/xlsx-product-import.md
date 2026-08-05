# XLSX Product Import Specification

## Purpose

Import 106 real inventory products from an xlsx file into the application's data layer, seeding 13 categories, 9 suppliers, and all product records with correct relationships.

## Requirements

### Requirement: XLSX Parser Script

A server-side script MUST exist at `scripts/import-products.ts` (or similar). It MUST parse the xlsx file at `/Users/danielbohorquez/Downloads/inventario_energy_msi_3.xlsx`. It MUST use a library like `xlsx` (SheetJS) for parsing.

#### Scenario: Script executes successfully

- GIVEN the xlsx file exists at the expected path
- WHEN the import script is run (`npx tsx scripts/import-products.ts`)
- THEN it MUST parse the "Inventario" sheet
- AND it MUST skip rows 1-5 (headers) and read 106 products starting at row 6
- AND it MUST log progress (imported X of 106 products)

### Requirement: Column Mapping

The script MUST map xlsx columns to database fields:

| XLSX Column | Database Field |
|---|---|
| Referencia | Product.sku |
| Nombre del Producto | Product.name |
| Categoría | Category.name (relation) |
| Proveedor | Supplier.name (relation) |
| Unidad | Product.unit |
| Costo Compra | Product.cost |
| Precio Venta | Product.price |
| Margen (%) | Product.margin |
| Stock Actual | Product.stock |
| Stock Mín. | Product.minStock |
| Estado | Product.status |
| Desc. Categoría | Category.description |

#### Scenario: Correct field mapping

- GIVEN a row with Referencia="NET-001", Nombre="Laptop Netion", Precio Venta=1500000
- WHEN the row is parsed
- THEN a Product MUST be created with sku="NET-001", name="Laptop Netion", price=1500000
- AND the product MUST be linked to the correct Category and Supplier

### Requirement: Category Seeding

The script MUST read the "Categorias" sheet and seed 13 categories with name, slug, color, and description. Categories MUST be upserted by slug (idempotent).

#### Scenario: Categories seeded from xlsx

- GIVEN the "Categorias" sheet has 13 rows
- WHEN the import runs
- THEN 13 Category records MUST exist in the database
- AND each MUST have color and description from the xlsx
- AND running the script again MUST NOT create duplicates

### Requirement: Supplier Seeding

The script MUST extract unique supplier names from the "Inventario" sheet (9 unique suppliers) and create Supplier records. Suppliers MUST be upserted by slug (idempotent).

#### Scenario: Suppliers extracted and seeded

- GIVEN 106 product rows with 9 unique supplier names
- WHEN the import runs
- THEN 9 Supplier records MUST exist
- AND each product MUST be linked to its supplier via supplierId

### Requirement: Product Upsert by SKU

Products MUST be upserted using `sku` as the unique key. If a product with the same SKU exists, it MUST be updated. If not, it MUST be created.

#### Scenario: First import creates products

- GIVEN an empty products table
- WHEN the import runs
- THEN 106 Product records MUST be created
- AND each MUST have a unique SKU

#### Scenario: Re-import updates existing products

- GIVEN 106 products already imported
- WHEN the import runs again with updated prices
- THEN product count MUST remain 106
- AND updated prices MUST be reflected
- AND no duplicates MUST be created

### Requirement: Slug Generation

Product slugs MUST be auto-generated from the product name (lowercase, hyphenated, unique). If a slug collision occurs, a numeric suffix MUST be appended.

#### Scenario: Unique slug generation

- GIVEN two products named "Kit Herramientas" from different suppliers
- WHEN slugs are generated
- THEN one MUST be `kit-herramientas` and the other `kit-herramientas-1`

### Requirement: Status Mapping

The xlsx "Estado" column MUST be mapped to the ProductStatus enum: ACTIVE, INACTIVE, OUT_OF_STOCK.

#### Scenario: Status mapping

- GIVEN a product with Estado="Disponible"
- WHEN imported
- THEN status MUST be ACTIVE
- GIVEN Estado="Agotado"
- THEN status MUST be OUT_OF_STOCK

## Dependencies

- `product-data-model`: Prisma schema must have Supplier model, updated Product model with SKU, cost, margin, etc.
- `xlsx` npm package must be installed

## Constraints

- Script runs server-side only (not a Route Handler — one-time import tool)
- Must be idempotent (safe to run multiple times)
- Must handle missing/null values gracefully (e.g., missing description → empty string)
- COP values are integers (no decimal conversion needed)
