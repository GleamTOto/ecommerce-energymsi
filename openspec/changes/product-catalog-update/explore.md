## Exploration: product-catalog-update

### Current State

EnergyMSI is a Next.js 16 e-commerce app currently in UI-only phase with mock data + Prisma/PostgreSQL backend partially wired. The product catalog has 12 gaming-focused mock products, 7 categories, and 12 brands. The app already has Route Handlers for products/categories/brands CRUD, Zustand stores, and a mix of mock-data imports and API-fetching components.

**Key finding**: The app is in a HYBRID state — some components fetch from API (ProductGrid, CategoryGrid, FeaturedProducts, admin pages) while others still import directly from `mock-products.ts` (BrandFilter, CategoryFilter, BrandSection, checkout page, mock-user orders).

### Affected Areas

#### Files importing directly from `mock-products.ts` (MUST change):
- `src/components/products/BrandFilter.tsx` — imports `brands` for filter checkboxes
- `src/components/products/CategoryFilter.tsx` — imports `categories` for filter checkboxes
- `src/components/home/BrandSection.tsx` — imports `brands` for homepage brand display
- `src/app/(shop)/checkout/page.tsx` — imports `products` for mock cart items
- `src/data/mock-user.ts` — imports `products` for order item images and favorites

#### All Image Display Locations (need skeleton placeholders):
| File | Line | Context |
|------|------|---------|
| `src/components/products/ProductCard.tsx` | 64 | Main product card image (already has PLACEHOLDER_IMAGE fallback) |
| `src/components/products/ProductGallery.tsx` | 19, 43 | Product detail main image + thumbnails |
| `src/components/cart/CartItem.tsx` | 22 | Cart item thumbnail |
| `src/components/checkout/OrderSummary.tsx` | 29 | Checkout order item image |
| `src/app/(admin-panel)/admin/products/page.tsx` | 279 | Admin product table thumbnail |
| `src/components/admin/ImageUpload.tsx` | 113 | Admin image upload preview |
| `src/data/mock-user.ts` | 87,106,114,133,152 | Mock order item images |
| `src/components/cart/StripeCheckoutButton.tsx` | 35 | Sends image to Stripe |
| `src/app/api/orders/[id]/route.ts` | 65 | Order API returns image |
| `src/app/api/orders/route.ts` | 48 | Orders API returns image |
| `src/app/api/admin/orders/route.ts` | 64 | Admin orders API returns image |

#### Admin CRUD Flow:
- **List**: `src/app/(admin-panel)/admin/products/page.tsx` — fetches `/api/products`, has search + category filter, delete via AlertDialog
- **Create**: `src/app/(admin-panel)/admin/products/new/page.tsx` — react-hook-form + zod, requires ImageUpload (at least 1 image), POSTs to `/api/products`
- **Edit**: **DOES NOT EXIST** — dropdown links to `/admin/products/${id}/edit` but no page exists
- **Delete**: Inline in list page, DELETE to `/api/products/${id}`
- **API**: `src/app/api/products/route.ts` (GET/POST), `src/app/api/products/[id]/route.ts` (GET/PUT/DELETE)

#### Zustand Stores:
- `src/stores/products-store.ts` — fetches from `/api/products`, `/api/categories`, `/api/brands`; has FilterState with `brands` and `categories` arrays
- `src/stores/cart-store.ts` — stores full `Product` objects in CartItem; persisted to localStorage
- `src/stores/admin-store.ts` — dashboard/orders/users only; no product management

#### Type System (`src/types/index.ts`):
- `Product` — used by 10+ files
- `Category` — used by stores, filters, transformers
- `Brand` — used by stores, filters, transformers, BrandSection
- `FilterState` — has `brands: string[]` field
- `CartItem` — wraps `Product`

#### Pricing (46 occurrences of `S/` format):
- All prices use `S/ {price.toFixed(2)}` inline — no centralized formatter
- Stripe checkout uses `currency: "pen"` 
- New data is in COP (Colombian Pesos) — need `$` symbol with thousand separators

### Approaches

#### 1. Type Evolution (Product type)

**Current fields** → **New mapping**:
| Current | New XLSX Column | Action |
|---------|----------------|--------|
| `id` | auto | Keep |
| `name` | Nombre del Producto | Keep |
| `slug` | auto-generated | Keep |
| `brand` | Proveedor | Rename to `supplier` |
| `category` | Categoría | Keep (new categories) |
| `price` | Precio Venta (COP) | Keep (change currency) |
| `originalPrice` | — | Keep optional |
| `images` | — | Make optional, default `[]` |
| `description` | — | Keep optional |
| `specs` | — | Keep optional |
| `stock` | Stock Actual | Keep |
| `isNew` | — | Keep, derive from data |
| `isFeatured` | — | Keep, admin-managed |
| `rating` | — | Remove or make optional (not in xlsx) |

**New fields to add**:
| Field | XLSX Column | Type |
|-------|------------|------|
| `sku` | Referencia | `string` (unique) |
| `supplier` | Proveedor | `string` (replaces brand) |
| `unit` | Unidad | `string` |
| `cost` | Costo Compra | `number` |
| `minStock` | Stock Mín. | `number` |
| `status` | Estado | `string` (enum: active/inactive) |
| `categoryDescription` | Desc. Categoría | `string` |
| `margin` | Margen (%) | `number` |

#### 2. Category/Brand Mapping Strategy

**Option A — Replace Brand with Supplier**:
- Rename `Brand` model → `Supplier` in Prisma schema
- Rename `Brand` type → `Supplier` in types
- Update `BrandSection` → `SupplierSection` or remove
- Update `BrandFilter` → `SupplierFilter`
- Update `FilterState.brands` → `FilterState.suppliers`
- Effort: Medium (touch ~15 files)

**Option B — Keep Brand model, populate with suppliers**:
- Keep the `Brand` model as-is, just populate it with supplier names
- Less code change, semantically confusing
- Effort: Low

**Recommendation**: Option A — clean rename. The data model should reflect reality.

**Categories**: Complete replacement. 7 gaming → 13 real categories (baterías, UPS, herramientas, soldadura, etc.). Need new icon mappings in `CategoryGrid.tsx`. The `Category.icon` field uses lucide icon names — need to map new categories to appropriate icons.

#### 3. Image Strategy

**Create a shared `<ProductImage>` component** that handles the no-image case:
```tsx
function ProductImage({ images, name, className }) {
  if (!images || images.length === 0) {
    return <Skeleton className={className} /> // or a styled placeholder
  }
  return <Image src={images[0]} alt={name} ... />
}
```

Replace all 6+ image display locations with this component.

#### 4. Currency Migration (S/ → COP $)

**Create a `formatCurrency` utility**:
```tsx
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount)
}
```

Replace all 46 `S/` occurrences. Also update Stripe `currency: "pen"` → `"cop"`.

#### 5. XLSX Import Strategy

**Create an import script/endpoint**:
- Server-side script to parse xlsx and seed the database via Prisma
- Or an admin API endpoint `/api/admin/import-products` that accepts xlsx upload
- Must handle: category creation, supplier creation, product upsert by SKU

#### 6. Admin CRUD Adaptation

- **Create form**: Add new fields (sku, supplier, unit, cost, minStock, status). Remove image requirement.
- **Edit page**: MUST CREATE — currently doesn't exist at `/admin/products/[id]/edit`
- **List page**: Add SKU column, supplier column, status badge. Remove image column or show skeleton.
- **Delete**: Already works, keep as-is.

### Recommendation

**Phased approach**:

1. **Phase 1 — Data Layer**: Update Prisma schema (add fields, rename Brand→Supplier), update types, update transformers, create xlsx import script
2. **Phase 2 — Image Placeholders**: Create shared `ProductImage` component, replace all image display locations
3. **Phase 3 — Currency**: Create `formatCOP` utility, replace all `S/` formatting
4. **Phase 4 — Admin CRUD**: Adapt create form, create edit page, update list page
5. **Phase 5 — Cleanup**: Remove all mock-products imports, update filters, update BrandSection

### Risks

1. **Prisma migration with existing data**: If DB has existing products/orders, renaming Brand→Supplier requires a careful migration. May need to create new Supplier model and migrate relations.
2. **Cart persistence**: `cart-store` uses `persist` middleware with localStorage. If Product type changes shape, existing carts will have stale data. Need migration or clear strategy.
3. **Order history**: Existing mock orders in `mock-user.ts` reference product images. If images become empty, order history display breaks.
4. **Stripe currency change**: Switching from PEN to COP requires Stripe account configuration for COP.
5. **Price range filters**: Current `PriceFilter` has max 5000 (S/). COP prices will be in millions (e.g., $1,500,000 COP). Slider and defaults need complete rework.
6. **No edit page**: The admin edit page doesn't exist — this is a pre-existing gap that MUST be addressed for "admin CRUD must work correctly."
7. **Filter components still use mock data**: `BrandFilter` and `CategoryFilter` import from mock-products instead of the store/API. This is a pre-existing bug.

### Ready for Proposal

**Yes** — the exploration is complete. The orchestrator should tell the user:

> "Exploration complete. The change touches ~30 files across data layer, types, UI components, admin pages, and API routes. Key findings: (1) Admin edit page doesn't exist yet, (2) 3 filter/home components still import mock data instead of using API, (3) Currency is hardcoded as S/ in 46 places, (4) Product images are displayed in 6+ locations needing skeleton placeholders. Recommend a 5-phase approach starting with data layer changes. Ready to proceed to proposal."
