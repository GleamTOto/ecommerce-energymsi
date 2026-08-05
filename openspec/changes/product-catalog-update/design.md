# Design: Product Catalog Update

## Technical Approach

Migrate from 12 gaming mock products to 106 real inventory items by evolving the data model (Prisma schema + TypeScript types), creating an XLSX import script, implementing COP currency formatting, adding skeleton image placeholders, and completing admin CRUD with new fields. The migration is phased: data layer first (foundation), then parallel work on images/currency, then admin CRUD, finally cleanup.

## Architecture Decisions

### Decision: Prisma Schema Migration Strategy

**Choice**: Two-step migration — (1) add Supplier model alongside Brand, (2) migrate data, (3) drop Brand
**Alternatives considered**: Direct rename (breaks relations), keep both models permanently (confusing)
**Rationale**: Preserves existing data, allows gradual transition, minimizes downtime. Since the app is UI-only with no production data, we can actually do a direct rename + field additions in a single migration.

### Decision: Product Type Evolution

**Choice**: Add new fields (sku, supplierId, cost, margin, unit, minStock, status) to existing Product model, make images optional, rename originalPrice → comparePrice (already done in schema), replace brand relation with supplier
**Alternatives considered**: Create new ProductV2 model (unnecessary complexity)
**Rationale**: Incremental evolution is simpler. The schema already has comparePrice. Adding fields is non-breaking for the migration script.

### Decision: Image Placeholder Strategy

**Choice**: Create shared `ProductImage` component that conditionally renders Next.js `<Image>` or shadcn `<Skeleton>` with icon
**Alternatives considered**: Always render Image with placeholder URL (wastes bandwidth), separate placeholder component (more imports)
**Rationale**: Single component handles both cases, reduces duplication across 6+ locations, graceful fallback on error.

### Decision: Currency Formatting

**Choice**: `formatCOP` utility using `Intl.NumberFormat` with locale `es-CO`, currency `COP`, minimumFractionDigits: 0
**Alternatives considered**: Manual string formatting (error-prone), currency library (overkill)
**Rationale**: Native Intl API is fast, locale-aware, no dependencies. COP has no decimal cents in common display.

### Decision: XLSX Import Architecture

**Choice**: One-time Node.js script using `xlsx` (SheetJS) library, upsert by SKU, auto-generate slugs with collision handling
**Alternatives considered**: API endpoint (unnecessary for one-time import), manual data entry (106 products)
**Rationale**: Script is idempotent, can be re-run if data changes, handles all 106 products + 13 categories + 9 suppliers in one pass.

### Decision: Admin CRUD Flow

**Choice**: Route Handlers for all CRUD (per project rules), react-hook-form + zod for validation, dedicated edit page at `/admin/products/[id]/edit`
**Alternatives considered**: Server Actions (violates project rules), modal forms (violates project rules)
**Rationale**: Follows established patterns. Edit page pre-fills form with current data. Auto-calculate margin from cost/price.

### Decision: Cart Migration Strategy

**Choice**: Add version key to localStorage, detect stale cart on load, clear + notify on mismatch
**Alternatives considered**: Transform old cart items (complex, error-prone), preserve cart (type mismatch crashes)
**Rationale**: Cart is ephemeral data. Clearing on type change is safe and prevents crashes. User can re-add items.

### Decision: Price Filter Redesign

**Choice**: Dynamic range calculation from actual product data (min/max price), slider with COP-formatted labels
**Alternatives considered**: Hardcoded 5000-5M range (inflexible), separate min/max inputs only (less intuitive)
**Rationale**: COP prices range from ~5K to ~5M. Dynamic range adapts to catalog. Slider + inputs give flexibility.

## Data Flow

```
XLSX File
  ↓ (import script)
Prisma DB (categories, suppliers, products)
  ↓ (Route Handlers)
API (/api/products, /api/categories, /api/suppliers)
  ↓ (Zustand stores)
UI Components (ProductCard, FilterSidebar, AdminList)
  ↓ (formatCOP, ProductImage)
Rendered Output
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modify | Add Supplier model, update Product (sku, cost, margin, unit, minStock, status, supplierId), update Category (color, description), add ProductStatus enum |
| `src/types/index.ts` | Modify | Update Product (add sku, supplier, cost, margin, unit, minStock, status; make images optional; rename originalPrice → comparePrice), rename Brand → Supplier, update FilterState (brands → suppliers) |
| `scripts/import-products.ts` | Create | XLSX parser script: parse inventory, seed categories/suppliers, upsert 106 products by SKU |
| `src/lib/format-currency.ts` | Create | formatCOP utility using Intl.NumberFormat |
| `src/components/products/ProductImage.tsx` | Create | Shared image/skeleton component with fallback |
| `src/app/(admin-panel)/admin/products/[id]/edit/page.tsx` | Create | Admin edit page with form pre-population |
| `src/app/(admin-panel)/admin/products/new/page.tsx` | Modify | Add SKU, supplier, cost, margin, unit, minStock, status fields; make images optional |
| `src/app/(admin-panel)/admin/products/page.tsx` | Modify | Add SKU, supplier, status columns; use formatCOP; use ProductImage |
| `src/app/api/products/route.ts` | Modify | Update to use supplier relation, add pagination, search by SKU |
| `src/app/api/products/[id]/route.ts` | Modify | Update to use supplier relation, handle new fields |
| `src/app/api/suppliers/route.ts` | Create | GET /api/suppliers (replace /api/brands) |
| `src/lib/transformers.ts` | Modify | Update transformProduct (add new fields, supplier), rename transformBrand → transformSupplier |
| `src/stores/products-store.ts` | Modify | Rename brands → suppliers, update defaultFilters priceRange for COP |
| `src/stores/cart-store.ts` | Modify | Add version key to persist config, migration logic |
| `src/components/products/ProductCard.tsx` | Modify | Use ProductImage, formatCOP, display supplier instead of brand |
| `src/components/products/ProductDetail.tsx` | Modify | Use ProductImage, formatCOP |
| `src/components/products/FilterSidebar.tsx` | Modify | Replace BrandFilter with SupplierFilter, update priceRange defaults |
| `src/components/products/BrandFilter.tsx` | Delete | Replaced by SupplierFilter |
| `src/components/products/SupplierFilter.tsx` | Create | Filter by supplier (replaces BrandFilter) |
| `src/components/products/PriceFilter.tsx` | Modify | Dynamic range, formatCOP labels, COP-appropriate step |
| `src/components/cart/CartItem.tsx` | Modify | Use ProductImage, formatCOP |
| `src/components/cart/CartSummary.tsx` | Modify | Use formatCOP |
| `src/components/checkout/OrderSummary.tsx` | Modify | Use formatCOP |
| `src/components/home/BrandSection.tsx` | Rename | → SupplierSection, fetch from API |
| `src/app/api/checkout/route.ts` | Modify | Change currency: "pen" → "cop", update amounts for COP (no decimals) |
| `src/app/(shop)/profile/page.tsx` | Modify | Use formatCOP |
| `src/app/(shop)/profile/orders/page.tsx` | Modify | Use formatCOP, ProductImage |
| `src/app/(shop)/profile/settings/page.tsx` | Modify | Update currency option to COP |
| `src/app/(admin-panel)/admin/page.tsx` | Modify | Use formatCOP |
| `src/app/(admin-panel)/admin/users/page.tsx` | Modify | Use formatCOP |
| `src/app/(admin-panel)/admin/payments/page.tsx` | Modify | Use formatCOP |
| `src/app/(admin-panel)/admin/settings/page.tsx` | Modify | Update currency option to COP |
| `src/data/mock-products.ts` | Delete | Replaced by API + import script |

## Interfaces / Contracts

### Updated Product Type

```typescript
export interface Product {
  id: string
  name: string
  slug: string
  sku: string
  description: string
  price: number
  comparePrice?: number
  cost: number
  margin: number
  unit: string // "UNIDAD", "CAJA", etc.
  minStock: number
  status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK"
  images?: string[]
  specs: Record<string, string>
  stock: number
  isNew: boolean
  isFeatured: boolean
  rating: number
  supplier: string // supplier name
  category: string // category slug
}
```

### Updated Supplier Type

```typescript
export interface Supplier {
  id: string
  name: string
  slug: string
  description?: string
  color?: string // hex color
  productCount: number
}
```

### Updated Category Type

```typescript
export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  color?: string
  description?: string
  productCount: number
}
```

### Updated FilterState

```typescript
export interface FilterState {
  categories: string[]
  suppliers: string[] // was: brands
  priceRange: [number, number] // COP values
  sortBy: "popular" | "price-asc" | "price-desc" | "newest" | "rating"
}
```

### API Contracts

**GET /api/products**
```typescript
// Query params
?category=slug&supplier=slug&minPrice=5000&maxPrice=500000&sortBy=price-asc&search=NET&page=1&limit=20

// Response
{
  products: Product[],
  total: number,
  page: number,
  limit: number
}
```

**POST /api/products**
```typescript
// Request
{
  name: string,
  sku: string,
  description: string,
  price: number,
  comparePrice?: number,
  cost: number,
  margin: number,
  unit: string,
  minStock: number,
  status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK",
  stock: number,
  images?: string[],
  specs?: Record<string, string>,
  categoryId: string,
  supplierId: string,
  isNew?: boolean,
  isFeatured?: boolean
}

// Response: Product
```

**PUT /api/products/[id]**
```typescript
// Request: same as POST
// Response: Product
```

**DELETE /api/products/[id]**
```typescript
// Response: { success: true }
```

**GET /api/suppliers**
```typescript
// Response: Supplier[]
```

### formatCOP Utility

```typescript
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
// formatCOP(150000) → "$150.000"
// formatCOP(2500000) → "$2.500.000"
```

### ProductImage Component

```typescript
interface ProductImageProps {
  src?: string
  alt: string
  className?: string
  priority?: boolean
  aspectRatio?: "square" | "4/3" // default: square
}

// Renders Next.js Image if src provided, else Skeleton with Package icon
// On image error, falls back to Skeleton
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | formatCOP formatting | Test typical prices, zero, large amounts, edge cases |
| Unit | Slug generation | Test collision handling, special chars, unicode |
| Unit | Cart migration | Test version mismatch detection, clear behavior |
| Integration | XLSX import script | Run against actual xlsx, verify 106 products, 13 categories, 9 suppliers created |
| Integration | API endpoints | Test CRUD operations with new fields, pagination, search by SKU |
| Integration | Prisma migration | Run migration, verify data integrity, no loss |
| E2E | Admin CRUD flow | Create/edit/delete product with new fields, verify list updates |
| E2E | Catalog display | Verify 106 products render, COP formatting, skeleton placeholders |
| E2E | Filter functionality | Test supplier filter, price range filter with COP values |

## Migration / Rollout

### Phase 1: Data Layer (Foundation)
1. Update Prisma schema (add Supplier model, update Product/Category)
2. Run migration (`prisma migrate dev`)
3. Update TypeScript types
4. Update transformers
5. Install `xlsx` package
6. Create import script
7. Run import script to seed 106 products

### Phase 2: Image Placeholders (Parallel)
1. Create ProductImage component
2. Replace Image in ProductCard, ProductDetail, CartItem, OrderSummary, admin list, profile orders
3. Test skeleton rendering in all locations

### Phase 3: Currency (Parallel)
1. Create formatCOP utility
2. Replace all 39 `S/` occurrences with formatCOP()
3. Update Stripe checkout route (currency: "cop", integer amounts)
4. Grep to verify zero `S/` remaining

### Phase 4: Admin CRUD
1. Update create form (add new fields, make images optional)
2. Create edit page at `/admin/products/[id]/edit`
3. Update list page (SKU, supplier, status columns, formatCOP, ProductImage)
4. Update API routes to handle new fields

### Phase 5: Cleanup
1. Rename BrandFilter → SupplierFilter, update to use API
2. Update FilterSidebar (supplier filter, price range defaults)
3. Update products-store (brands → suppliers, priceRange)
4. Rename BrandSection → SupplierSection, fetch from API
5. Add cart localStorage versioning + migration
6. Delete mock-products.ts
7. Remove all direct imports from mock-products

### Rollback Plan
- Git revert the PR
- If migration ran: `prisma migrate reset` to restore from last seed
- Cart auto-heals on version mismatch
- XLSX import is idempotent (safe to re-run)

## Open Questions

- [ ] Should the import script generate mock specs for products, or leave specs empty?
- [ ] What color palette for the 9 suppliers (hex codes)?
- [ ] Should OUT_OF_STOCK products be visible in catalog or hidden?
- [ ] What is the free shipping threshold in COP? (Currently S/ 200 in PEN)
- [ ] Should the admin edit page show a delete button, or keep delete only in list page?

## Execution Order

```
Phase 1: Data Layer (1-2 days)
  ├─ Prisma schema update
  ├─ TypeScript types
  ├─ Transformers
  └─ XLSX import script + seed

Phase 2: Images (0.5 day) ─┐
                            ├─→ Phase 4: Admin CRUD (1 day)
Phase 3: Currency (0.5 day) ┘         │
                                       └─→ Phase 5: Cleanup (1 day)
```

**Dependencies**:
- Phase 1 must complete first (types drive everything)
- Phases 2 & 3 can run in parallel
- Phase 4 depends on Phase 1 (new fields must exist)
- Phase 5 depends on all previous phases

**Milestones**:
1. ✅ 106 products visible in API after import
2. ✅ All prices display in COP format
3. ✅ Skeleton placeholders render in all locations
4. ✅ Admin can create/edit/delete with new fields
5. ✅ Zero `S/` remaining, zero mock-products imports
