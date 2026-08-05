# Proposal: Product Catalog Update

## Intent

Replace the 12 gaming mock products with 106 real inventory products from an xlsx file (13 categories, 9 suppliers, COP pricing). Adapt the entire catalog pipeline — types, data layer, admin CRUD, filters, currency display, and image handling — to support real business data. Admin CRUD must be fully operational for daily use.

## Scope

### In Scope
- New Product type with SKU, supplier, cost, margin, unit, minStock, status fields
- Prisma schema update: rename Brand → Supplier, add new product fields
- XLSX import script to seed 106 products, 13 categories, 9 suppliers
- Shared `ProductImage` component with skeleton placeholders (no real images yet)
- `formatCOP` currency utility replacing all 46 hardcoded `S/` occurrences
- Admin edit page (currently missing) + adapt create/list forms for new fields
- Price filter rework for COP range (millions, not thousands)
- Cart localStorage migration strategy for type shape change
- Replace all mock-products direct imports with API/store fetching

### Out of Scope
- Real product images (skeleton placeholders only)
- Stripe payment integration for COP (deferred — currency config change only)
- Backend authentication/authorization improvements
- Order history migration for mock-user.ts

## Capabilities

### New Capabilities
- `product-data-model`: Product type evolution, Prisma schema (SKU, supplier, cost, margin, unit, minStock, status), Category/Supplier models, transformers
- `product-image-placeholders`: Shared ProductImage component rendering skeleton when no images exist, used across 6+ display locations
- `cop-currency`: formatCOP utility using Intl.NumberFormat for Colombian Pesos, replacing all S/ formatting
- `xlsx-product-import`: Server-side script to parse xlsx and seed database (categories, suppliers, 106 products with upsert by SKU)
- `admin-product-crud`: Complete admin CRUD — create form with new fields, new edit page at `/admin/products/[id]/edit`, updated list with SKU/supplier/status columns

### Modified Capabilities
_None — no existing specs to modify (openspec/specs/ is empty)._

## Approach

5-phase execution (per exploration recommendation):

1. **Data Layer**: Update Prisma schema (add fields, Brand→Supplier rename), update TypeScript types, update transformers, create xlsx import script
2. **Image Placeholders**: Create shared `ProductImage` component, replace all 6+ image display locations with skeleton fallback
3. **Currency**: Create `formatCOP` utility, replace all 46 `S/` occurrences, update Stripe currency config
4. **Admin CRUD**: Adapt create form (new fields, remove image requirement), create edit page, update list page (SKU/supplier/status columns)
5. **Cleanup**: Remove all mock-products direct imports, update filters to use API/store, update BrandSection → SupplierSection, fix cart localStorage migration

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/types/index.ts` | Modified | Product, Category, Brand→Supplier, FilterState types |
| `prisma/schema.prisma` | Modified | Add fields, rename Brand→Supplier model |
| `src/data/mock-products.ts` | Removed | Replaced by xlsx import + API |
| `src/components/products/ProductImage.tsx` | New | Shared image/skeleton component |
| `src/lib/format-currency.ts` | New | formatCOP utility |
| `src/app/(admin-panel)/admin/products/[id]/edit/page.tsx` | New | Admin edit page |
| `src/app/(admin-panel)/admin/products/new/page.tsx` | Modified | Add new fields, remove image requirement |
| `src/app/(admin-panel)/admin/products/page.tsx` | Modified | SKU/supplier/status columns |
| `src/components/products/FilterSidebar.tsx` | Modified | Price filter for COP range |
| `src/stores/cart-store.ts` | Modified | localStorage migration for new type |
| `src/components/home/BrandSection.tsx` | Modified | Rename to SupplierSection |
| `src/app/api/products/route.ts` | Modified | Adapt to new schema |
| 6+ image display files | Modified | Replace with ProductImage component |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Prisma Brand→Supplier migration breaks existing relations | High | Create new Supplier model, migrate data in steps, keep Brand as alias during transition |
| Cart localStorage stale data on type change | High | Add version key to cart persist; clear + notify on version mismatch |
| Price filter max=5000 unusable for COP (millions) | High | Rework PriceFilter with dynamic range based on actual data; default [0, max_in_catalog] |
| Admin edit page doesn't exist (pre-existing gap) | High | Create as dedicated page per project rules (no modals); use react-hook-form + zod |
| Stripe configured for PEN, needs COP | Medium | Update `currency: "pen"` → `"cop"`; note: requires Stripe account COP support |
| mock-user.ts references images[0] for orders | Medium | Update mock orders to use ProductImage component; defer full order migration |
| 46 hardcoded S/ occurrences missed | Low | Grep-based audit after formatCOP utility is created; lint rule optional |

## Rollback Plan

1. Git revert the PR — all changes are additive or type-level
2. Prisma: if migration ran, use `prisma migrate reset` to restore from last known seed
3. Cart: localStorage auto-heals on version mismatch (cleared on next load)
4. No data loss: xlsx import is idempotent (upsert by SKU)

## Dependencies

- Phase 1 (Data Layer) must complete before Phases 2-5 — types drive everything
- Phase 2 (Images) and Phase 3 (Currency) are independent of each other
- Phase 4 (Admin CRUD) depends on Phase 1 (new fields must exist)
- Phase 5 (Cleanup) depends on all previous phases

## Success Criteria

- [ ] 106 products from xlsx visible in catalog with correct categories and suppliers
- [ ] All prices display in COP format ($X.XXX) — zero `S/` remaining
- [ ] Product images show skeleton placeholders in all 6+ locations
- [ ] Admin can create, edit, and delete products with new fields (SKU, supplier, cost, etc.)
- [ ] Admin edit page exists and works at `/admin/products/[id]/edit`
- [ ] Price filter works for COP range (no hardcoded 5000 max)
- [ ] Cart persists correctly after type change (no stale data crashes)
- [ ] Zero direct imports from `mock-products.ts` in components
- [ ] `npm run build` passes with no type errors
