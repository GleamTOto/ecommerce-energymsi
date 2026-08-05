# Tasks: Product Catalog Update

## Phase 1: Data Layer Foundation (PR 1)

- [x] 1.1 Prisma Schema Migration — Rename Brand to Supplier, add new Product fields (sku, cost, margin, unit, minStock, status, supplierId), create migration file
- [x] 1.2 TypeScript Type Updates — Update Product interface, add Supplier interface, update Category, update FilterState (brands → suppliers)
- [x] 1.3 XLSX Import Script — Create scripts/import-products.ts, parse xlsx, transform data, generate slugs, handle SKU uniqueness
- [x] 1.4 Generate Mock Data — Run import script, generate 106 products, 14 categories, 8 suppliers from xlsx
- [x] 1.5 Update Mock Data Structure — Replace mock-products.ts with new data, update exports to match new types
- [x] 1.6 Type Validation — Run tsc --noEmit, fix all type errors across 27 files, ensure clean compilation

## Phase 2: Image Placeholders (PR 2)

- [x] 2.1 Create ProductImage component with skeleton fallback
- [x] 2.2 Replace Image in ProductCard with ProductImage
- [x] 2.3 Replace Image in ProductDetail with ProductImage
- [x] 2.4 Replace Image in CartItem with ProductImage
- [x] 2.5 Replace Image in OrderSummary with ProductImage
- [x] 2.6 Replace Image in admin products list with ProductImage
- [x] 2.7 Replace Image in profile orders with ProductImage

## Phase 3: Currency (PR 3)

- [x] 3.1 Create formatCOP utility using Intl.NumberFormat
- [x] 3.2 Replace all S/ occurrences in ProductCard
- [x] 3.3 Replace all S/ occurrences in ProductDetail
- [x] 3.4 Replace all S/ occurrences in CartItem and CartSummary
- [x] 3.5 Replace all S/ occurrences in OrderSummary
- [x] 3.6 Replace all S/ occurrences in admin pages
- [x] 3.7 Replace all S/ occurrences in profile pages
- [x] 3.8 Update Stripe checkout route (currency: "cop")
- [x] 3.9 Grep to verify zero S/ remaining

## Phase 4: Admin CRUD (PR 4)

- [x] 4.1 Adapt admin create form with new fields (SKU, supplier, cost, margin, unit, minStock, status)
- [x] 4.2 Create admin edit page at /admin/products/[id]/edit
- [x] 4.3 Update admin list page with SKU/supplier/status columns
- [x] 4.4 Update API routes for new fields and pagination
- [x] 4.5 Add search by SKU support

## Phase 5: Cleanup (PR 5)

- [ ] 5.1 Update FilterSidebar with supplier filter and COP price range
- [ ] 5.2 Update products-store (brands → suppliers, priceRange defaults)
- [ ] 5.3 Rename BrandSection → SupplierSection
- [ ] 5.4 Add cart localStorage versioning + migration
- [ ] 5.5 Remove all direct imports from mock-products in components
- [ ] 5.6 Final build verification (npm run build)
