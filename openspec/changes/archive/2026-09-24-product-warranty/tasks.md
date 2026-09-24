# Tasks: Configurable Product Warranty

## Overview

This document breaks down the product warranty feature into atomic, ordered, and testable implementation tasks. Total estimated changes: ~150 lines across 9 files (excluding migration).

**PR Strategy**: single-pr  
**Review Budget**: ~400 lines (well within budget)

---

## Task 1: Database Migration — Add Warranty Column

**Files**: 
- `prisma/schema.prisma` (modify)
- `prisma/migrations/<timestamp>_add_warranty_field/migration.sql` (auto-generated)

**Dependencies**: None

**Estimated complexity**: Low

**Estimated lines**: +1 (schema) + ~5 (migration SQL)

### Description

Add an optional `warranty` field to the Product model in the Prisma schema. This is a nullable `String?` field positioned after `specs Json?` (line 112) and before `isNew`.

**Schema change** (`prisma/schema.prisma`, after line 112):
```prisma
  specs        Json?
  warranty     String?    // ← ADD THIS LINE
  isNew        Boolean       @default(false)
```

**Migration command**:
```bash
npx prisma migrate dev --name add-warranty-field
```

This generates a migration file with:
```sql
ALTER TABLE "products" ADD COLUMN "warranty" TEXT;
```

**Rollback**: 
```sql
ALTER TABLE "products" DROP COLUMN "warranty";
```
Or run `npx prisma migrate reset` (destroys all data).

### Acceptance Criteria

- [x] `warranty String?` added to Product model in `prisma/schema.prisma`
- [x] Migration file created in `prisma/migrations/`
- [x] Migration runs successfully without errors
- [x] Existing products remain intact (no data loss)
- [x] All existing products have `warranty = NULL` after migration

### Testing

1. Run `npx prisma migrate dev --name add-warranty-field`
2. Verify migration succeeds
3. Check database: `SELECT id, name, warranty FROM products LIMIT 5;` — all should show `NULL` for warranty
4. Run `npx prisma studio` — verify Product model shows warranty field

---

## Task 2: TypeScript Types — Add Warranty to Product Interface

**Files**: 
- `src/types/index.ts` (modify)

**Dependencies**: Task 1 (migration must exist for Prisma types to regenerate)

**Estimated complexity**: Low

**Estimated lines**: +1

### Description

Add the optional `warranty` field to the `Product` TypeScript interface.

**Type change** (`src/types/index.ts`, after line 17):
```typescript
export interface Product {
  id: string
  name: string
  slug: string
  sku?: string
  description: string
  price: number
  comparePrice?: number
  cost: number
  margin: number
  unit: string
  minStock: number
  status: ProductStatus
  images?: string[]
  specs: Record<string, string>
  warranty?: string    // ← ADD THIS LINE
  stock: number
  isNew: boolean
  isFeatured: boolean
  rating: number
  supplier: string
  category: string
}
```

### Acceptance Criteria

- [x] `warranty?: string` added to Product interface
- [x] TypeScript compilation succeeds (`npx tsc --noEmit`)
- [x] No type errors in existing code that uses Product type

### Testing

1. Run `npx tsc --noEmit` — should pass with no errors
2. Run `npx eslint` — should pass
3. Verify IDE shows no type errors

---

## Task 3: Transformer — Map Warranty Field with Normalization

**Files**: 
- `src/lib/transformers.ts` (modify)

**Dependencies**: Task 1, Task 2

**Estimated complexity**: Low

**Estimated lines**: +1

### Description

Update the `transformProduct` function to map the `warranty` field from Prisma to the domain type. Empty strings are normalized to `undefined`.

**Transformer change** (`src/lib/transformers.ts`, after line 38):
```typescript
export function transformProduct(product: ProductWithRelations): Product {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku || undefined,
    supplier: product.supplier?.name || "Sin proveedor",
    category: product.category.slug,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : undefined,
    cost: product.cost ? Number(product.cost) : 0,
    margin: product.margin ? Number(product.margin) : 0,
    unit: product.unit,
    minStock: product.minStock,
    status: product.status as "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK",
    images: Array.isArray(product.images) && product.images.length > 0 ? product.images : undefined,
    description: product.description || "",
    specs: (product.specs as Record<string, string>) || {},
    warranty: product.warranty || undefined,    // ← ADD THIS LINE
    stock: product.stock,
    isNew: product.isNew,
    isFeatured: product.isFeatured,
    rating: 4.5,
  }
}
```

**Normalization logic**: `product.warranty || undefined` converts:
- `null` → `undefined`
- `""` → `undefined`
- `"1 ano"` → `"1 ano"`

### Acceptance Criteria

- [x] `warranty` field mapped in `transformProduct` return object
- [x] Empty string normalized to `undefined`
- [x] Null normalized to `undefined`
- [x] Non-empty string preserved as-is

### Testing

1. Create a test product with `warranty = "1 ano"` → verify `transformProduct` returns `warranty: "1 ano"`
2. Create a test product with `warranty = null` → verify `transformProduct` returns `warranty: undefined`
3. Create a test product with `warranty = ""` → verify `transformProduct` returns `warranty: undefined`
4. Run `npx tsc --noEmit` — should pass

---

## Task 4: Search Service — Add Warranty to Search Query

**Files**: 
- `src/lib/search.ts` (modify)
- `src/app/api/products/route.ts` (modify — search results transform)

**Dependencies**: Task 1, Task 2

**Estimated complexity**: Medium

**Estimated lines**: +2 (search.ts) +1 (route.ts)

### Description

The search service uses a raw SQL query that manually selects fields. Add `warranty` to the SELECT clause and update the Zod schema and manual transform in the API route.

**Search schema change** (`src/lib/search.ts`, after line 27):
```typescript
const SearchProductRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  sku: z.string().nullable(),
  description: z.string().nullable(),
  price: z.preprocess(/* ... */),
  images: z.array(z.string()).nullable(),
  stock: z.number(),
  isNew: z.boolean(),
  isFeatured: z.boolean(),
  categoryId: z.string(),
  supplierId: z.string().nullable(),
  warranty: z.string().nullable(),    // ← ADD THIS LINE
  categoryName: z.string(),
  categorySlug: z.string(),
  supplierName: z.string().nullable(),
  supplierSlug: z.string().nullable(),
  score: z.number(),
})
```

**SQL query change** (`src/lib/search.ts`, after line 154):
```sql
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
  p.warranty,    -- ← ADD THIS LINE
  c.name AS "categoryName",
  c.slug AS "categorySlug",
  s.name AS "supplierName",
  s.slug AS "supplierSlug",
  /* ... scoring logic ... */
```

**API route transform change** (`src/app/api/products/route.ts`, after line 53):
```typescript
const transformedProducts = result.products.map((p) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  sku: p.sku || undefined,
  supplier: p.supplierName || "Sin proveedor",
  category: p.categorySlug,
  price: Number(p.price),
  comparePrice: undefined,
  cost: 0,
  margin: 0,
  unit: "UNIDAD",
  minStock: 0,
  status: "ACTIVE" as const,
  images: Array.isArray(p.images) && p.images.length > 0 ? p.images : undefined,
  description: p.description || "",
  specs: {},
  warranty: p.warranty || undefined,    // ← ADD THIS LINE
  stock: p.stock,
  isNew: p.isNew,
  isFeatured: p.isFeatured,
  rating: 4.5,
}))
```

### Acceptance Criteria

- [x] `warranty` added to `SearchProductRowSchema`
- [x] `p.warranty` added to SQL SELECT clause
- [x] Search results transform includes `warranty` field
- [x] Empty string normalized to `undefined` in search results

### Testing

1. Run a search query: `GET /api/products?search=bateria`
2. Verify response includes `warranty` field for each product
3. Verify products with `warranty = NULL` return `warranty: undefined` (or omit field)
4. Verify products with `warranty = "1 ano"` return `warranty: "1 ano"`

---

## Task 5: API POST — Include Warranty in Product Creation

**Files**: 
- `src/app/api/products/route.ts` (modify)

**Dependencies**: Task 1, Task 2, Task 3

**Estimated complexity**: Low

**Estimated lines**: +1

### Description

Update the POST route handler to accept and persist the `warranty` field. Empty strings are normalized to `null` before persisting.

**POST handler change** (`src/app/api/products/route.ts`, after line 178):
```typescript
const product = await prisma.product.create({
  data: {
    name: body.name,
    slug: body.slug,
    sku: body.sku,
    description: body.description,
    price: body.price,
    comparePrice: body.comparePrice,
    cost: body.cost,
    margin: body.margin,
    unit: body.unit || "UNIDAD",
    minStock: body.minStock || 0,
    status: body.status || "ACTIVE",
    stock: body.stock || 0,
    images: body.images || [],
    specs: body.specs || {},
    warranty: body.warranty || null,    // ← ADD THIS LINE
    isNew: body.isNew || false,
    isFeatured: body.isFeatured || false,
    categoryId: body.categoryId,
    supplierId: body.supplierId,
  },
  include: {
    category: true,
    supplier: true,
  },
})
```

**Normalization logic**: `body.warranty || null` converts:
- `undefined` → `null`
- `""` → `null`
- `"1 ano"` → `"1 ano"`

### Acceptance Criteria

- [x] POST handler accepts `warranty` field from request body
- [x] Empty string normalized to `null` before persisting
- [x] Product created with `warranty` value in database
- [x] Response includes `warranty` field (via `transformProduct`)

### Testing

1. Create product via API:
   ```bash
   curl -X POST http://localhost:3000/api/products \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","slug":"test","sku":"TEST","description":"Test","price":100,"cost":50,"margin":50,"categoryId":"1","supplierId":"1","warranty":"1 ano"}'
   ```
2. Verify database: `SELECT id, name, warranty FROM products WHERE slug='test';` — should show `warranty = "1 ano"`
3. Create another product without warranty field → verify `warranty = NULL` in database
4. Create product with `warranty: ""` → verify `warranty = NULL` in database

---

## Task 6: API PUT — Include Warranty in Product Update

**Files**: 
- `src/app/api/products/[id]/route.ts` (modify)

**Dependencies**: Task 1, Task 2, Task 3

**Estimated complexity**: Low

**Estimated lines**: +1

### Description

Update the PUT route handler to accept and persist the `warranty` field. Empty strings are normalized to `null`.

**PUT handler change** (`src/app/api/products/[id]/route.ts`, after line 95):
```typescript
const product = await prisma.product.update({
  where: { id },
  data: {
    name: body.name,
    slug: body.slug,
    sku: body.sku,
    description: body.description,
    price: body.price,
    comparePrice: body.comparePrice,
    cost: body.cost,
    margin: body.margin,
    unit: body.unit || "UNIDAD",
    minStock: body.minStock ?? 0,
    status: body.status || "ACTIVE",
    stock: body.stock ?? 0,
    images: body.images || [],
    specs: body.specs || {},
    warranty: body.warranty || null,    // ← ADD THIS LINE
    isNew: body.isNew ?? false,
    isFeatured: body.isFeatured ?? false,
    isActive: body.isActive ?? true,
    categoryId: body.categoryId,
    supplierId: body.supplierId || null,
  },
  include: {
    category: true,
    supplier: true,
  },
})
```

### Acceptance Criteria

- [x] PUT handler accepts `warranty` field from request body
- [x] Empty string normalized to `null` before persisting
- [x] Product updated with new `warranty` value in database
- [x] Clearing warranty (sending `""` or `null`) sets database value to `NULL`
- [x] Response includes updated `warranty` field

### Testing

1. Update product warranty:
   ```bash
   curl -X PUT http://localhost:3000/api/products/<product-id> \
     -H "Content-Type: application/json" \
     -d '{"name":"Updated","slug":"updated","sku":"UPD","description":"Updated","price":200,"cost":100,"margin":50,"categoryId":"1","supplierId":"1","warranty":"2 anos"}'
   ```
2. Verify database: `SELECT id, name, warranty FROM products WHERE slug='updated';` — should show `warranty = "2 anos"`
3. Clear warranty: send `warranty: ""` → verify `warranty = NULL` in database
4. Verify GET `/api/products/<id>` returns updated warranty value

---

## Task 7: Admin Form — Add Warranty Input and Validation

**Files**: 
- `src/components/admin/ProductForm.tsx` (modify)

**Dependencies**: Task 1, Task 2

**Estimated complexity**: Medium

**Estimated lines**: +15 (schema + interface + defaultValues + JSX)

### Description

Add warranty field to the admin product form: update zod schema, `ProductFormInitialData` interface, default values, and add the input field in the "Informacion Basica" card.

**Zod schema change** (`src/components/admin/ProductForm.tsx`, after line 43):
```typescript
export const productFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  slug: z.string().min(1, "El slug es requerido"),
  sku: z.string().min(1, "El SKU es requerido"),
  description: z.string().min(1, "La descripcion es requerida"),
  price: z.number().min(0, "El precio debe ser mayor a 0"),
  comparePrice: z.number().optional().nullable(),
  cost: z.number().min(0, "El costo debe ser mayor o igual a 0"),
  margin: z.number().min(0).max(100, "El margen debe ser entre 0 y 100"),
  unit: z.string().min(1, "La unidad es requerida"),
  minStock: z.number().min(0, "El stock minimo debe ser mayor o igual a 0"),
  stock: z.number().min(0, "El stock debe ser mayor o igual a 0"),
  status: z.enum(["ACTIVE", "INACTIVE", "OUT_OF_STOCK"]),
  categoryId: z.string().min(1, "La categoria es requerida"),
  supplierId: z.string().min(1, "El proveedor es requerido"),
  isNew: z.boolean(),
  isFeatured: z.boolean(),
  specs: z.record(z.string(), z.string()),
  warranty: z.string().optional(),    // ← ADD THIS LINE
})
```

**Interface change** (`src/components/admin/ProductForm.tsx`, after line 72):
```typescript
export interface ProductFormInitialData {
  name: string
  slug: string
  sku: string
  description: string
  price: number
  comparePrice?: number | null
  cost: number
  margin: number
  unit: string
  minStock: number
  stock: number
  status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK"
  categoryId: string
  supplierId: string
  isNew: boolean
  isFeatured: boolean
  specs: Record<string, string>
  images?: string[]
  warranty?: string | null    // ← ADD THIS LINE
}
```

**Default values change** (`src/components/admin/ProductForm.tsx`, after line 148):
```typescript
defaultValues: initialData
  ? {
      name: initialData.name,
      slug: initialData.slug,
      sku: initialData.sku,
      description: initialData.description,
      price: initialData.price,
      comparePrice: initialData.comparePrice ?? null,
      cost: initialData.cost,
      margin: initialData.margin,
      unit: initialData.unit,
      minStock: initialData.minStock,
      stock: initialData.stock,
      status: initialData.status,
      categoryId: initialData.categoryId,
      supplierId: initialData.supplierId,
      isNew: initialData.isNew,
      isFeatured: initialData.isFeatured,
      specs: initialData.specs,
      warranty: initialData.warranty ?? undefined,    // ← ADD THIS LINE
    }
  : {
      isNew: false,
      isFeatured: false,
      stock: 0,
      cost: 0,
      margin: 0,
      unit: "UNIDAD",
      minStock: 0,
      status: "ACTIVE" as const,
      specs: {},
      warranty: undefined,    // ← ADD THIS LINE
    },
```

**JSX input** (`src/components/admin/ProductForm.tsx`, after line 302, inside "Informacion Basica" CardContent):
```tsx
<div className="space-y-2">
  <Label htmlFor="description">Descripcion</Label>
  <Textarea
    id="description"
    placeholder="Descripcion detallada del producto"
    rows={4}
    {...register("description")}
  />
  {errors.description && (
    <p className="text-sm text-destructive">{errors.description.message}</p>
  )}
</div>

{/* ← ADD THIS BLOCK */}
<div className="space-y-2">
  <Label htmlFor="warranty">Garantia (opcional)</Label>
  <Input
    id="warranty"
    placeholder="Ej: 1 ano, 6 meses"
    {...register("warranty")}
  />
</div>

<div className="grid gap-4 sm:grid-cols-2">
  {/* ... rest of form ... */}
</div>
```

### Acceptance Criteria

- [x] `warranty` added to zod schema with `.optional()`
- [x] `warranty?: string | null` added to `ProductFormInitialData`
- [x] Default values include `warranty` for both create and edit modes
- [x] Input field rendered in "Informacion Basica" card after description
- [x] Input has label "Garantia (opcional)" and placeholder "Ej: 1 ano, 6 meses"
- [x] Form validates successfully with empty warranty field
- [x] Form validates successfully with warranty value
- [x] Special characters (parentheses, accents) accepted in warranty

### Testing

1. Navigate to `/admin/products/new`
2. Fill form with warranty = "1 ano de garantia" → submit → verify product created with warranty
3. Leave warranty empty → submit → verify product created with warranty = NULL
4. Navigate to `/admin/products/<id>/edit` for product with warranty → verify input pre-filled
5. Clear warranty field → save → verify product updated with warranty = NULL
6. Type "Garantia limitada (2 anos)" → verify no validation errors

---

## Task 8: Admin Edit Page — Include Warranty in Initial Data

**Files**: 
- `src/app/(admin-panel)/admin/products/[id]/edit/page.tsx` (modify)

**Dependencies**: Task 1, Task 2, Task 7

**Estimated complexity**: Low

**Estimated lines**: +1

### Description

Update the edit page to include `warranty` when constructing the `ProductFormInitialData` object from the API response.

**Edit page change** (`src/app/(admin-panel)/admin/products/[id]/edit/page.tsx`, after line 58):
```typescript
const initialData: ProductFormInitialData = {
  name: data.name,
  slug: data.slug,
  sku: data.sku || "",
  description: data.description,
  price: data.price,
  comparePrice: data.comparePrice ?? null,
  cost: data.cost,
  margin: data.margin,
  unit: data.unit,
  minStock: data.minStock,
  stock: data.stock,
  status: data.status,
  categoryId: data.categoryId || "",
  supplierId: data.supplierId || "",
  isNew: data.isNew,
  isFeatured: data.isFeatured,
  specs: data.specs || {},
  images: data.images,
  warranty: data.warranty,    // ← ADD THIS LINE
}
```

### Acceptance Criteria

- [x] `warranty` included in `initialData` object
- [x] Edit page pre-fills warranty input when product has warranty value
- [x] Edit page shows empty warranty input when product has no warranty

### Testing

1. Navigate to `/admin/products/<id-with-warranty>/edit` → verify warranty input pre-filled
2. Navigate to `/admin/products/<id-without-warranty>/edit` → verify warranty input is empty
3. Change warranty value → save → verify database updated
4. Clear warranty → save → verify database updated to NULL

---

## Task 9: ProductDetail — Conditional Warranty Rendering

**Files**: 
- `src/components/products/ProductDetail.tsx` (modify)

**Dependencies**: Task 1, Task 2, Task 3

**Estimated complexity**: Low

**Estimated lines**: -7 (remove hardcoded) +9 (add conditional) = +2 net

### Description

Replace the hardcoded "1 ano de garantia" section with conditional rendering based on `product.warranty`.

**Remove hardcoded block** (`src/components/products/ProductDetail.tsx`, lines 179-185):
```tsx
// DELETE THIS BLOCK:
<div className="flex items-center gap-3 text-sm">
  <ShieldCheck className="h-5 w-5 text-muted-foreground" />
  <div>
    <p className="font-medium">Garantia</p>
    <p className="text-xs text-muted-foreground">1 ano de garantia</p>
  </div>
</div>
```

**Replace with conditional render**:
```tsx
{product.warranty && (
  <div className="flex items-center gap-3 text-sm">
    <ShieldCheck className="h-5 w-5 text-muted-foreground" />
    <div>
      <p className="font-medium">Garantia</p>
      <p className="text-xs text-muted-foreground">{product.warranty}</p>
    </div>
  </div>
)}
```

### Acceptance Criteria

- [x] Hardcoded "1 ano de garantia" text removed
- [x] Warranty section renders only when `product.warranty` is truthy
- [x] Warranty section hidden when `product.warranty` is `undefined`, `null`, or empty string
- [x] ShieldCheck icon and text display correctly when warranty exists
- [x] Long warranty text displays without truncation
- [x] Other benefits (shipping, returns) still display regardless of warranty

### Testing

1. Visit product page with `warranty = "2 anos"` → verify warranty section visible with correct text
2. Visit product page with `warranty = undefined` → verify warranty section hidden
3. Visit product page with `warranty = ""` → verify warranty section hidden
4. Visit product page with long warranty text → verify full text displays
5. Verify shipping and returns sections still display in all cases

---

## Task 10: Mock Data — Add Warranty Samples

**Files**: 
- `src/data/mock-products.ts` (modify)

**Dependencies**: Task 1, Task 2

**Estimated complexity**: Low

**Estimated lines**: +3 (add warranty to 3 products)

### Description

Add `warranty` values to a subset of mock products to enable visual testing of both states (with and without warranty).

**Mock data changes** (add to specific products):
```typescript
// Product 1: "Bateria Netion 12v 1.2ah" (around line 192)
{
  "id": "1",
  "name": "Bateria Netion 12v 1.2ah",
  // ... other fields ...
  "specs": {},
  "warranty": "1 ano de garantia"    // ← ADD THIS LINE
}

// Product 5: "Bateria Netion 12v 4ah" (around line 273)
{
  "id": "5",
  "name": "Bateria Netion 12v 4ah",
  // ... other fields ...
  "specs": {},
  "warranty": "6 meses de garantia"    // ← ADD THIS LINE
}

// Product 8: pick another product (around line 350+)
{
  "id": "8",
  // ... other fields ...
  "specs": {},
  "warranty": "2 anos de garantia"    // ← ADD THIS LINE
}
```

Leave other products without `warranty` field (or with `warranty: undefined`) to test the "no warranty" state.

### Acceptance Criteria

- [x] At least 3 products have non-empty `warranty` values
- [x] At least 3 products have `warranty` omitted or `undefined`
- [x] Mock data loads without errors
- [x] Product pages display warranty correctly for products with values
- [x] Product pages hide warranty section for products without values

### Testing

1. Run dev server: `npm run dev`
2. Visit product pages for products 1, 5, 8 → verify warranty sections display
3. Visit product pages for other products → verify warranty sections hidden
4. Verify no console errors or type errors

---

## Task 11: Migration Deploy — Apply to Production Database

**Files**: 
- None (deployment step)

**Dependencies**: Tasks 1-10 (all code changes complete)

**Estimated complexity**: Low

**Estimated lines**: 0

### Description

Deploy the migration to the production database (NeonDB). This is a non-destructive operation that adds a nullable column.

**Deployment command**:
```bash
npx prisma migrate deploy
```

**Pre-deployment checklist**:
- [ ] All code changes tested locally
- [ ] Migration tested in development
- [ ] Backup strategy confirmed (NeonDB automatic backups)
- [ ] Rollback plan documented

**Rollback plan**:
```sql
ALTER TABLE "products" DROP COLUMN "warranty";
```

Or revert code via git and run `npx prisma migrate reset` (destroys data — use only in development).

### Acceptance Criteria

- [x] Migration deployed successfully to production
- [x] No data loss occurred
- [x] All existing products have `warranty = NULL`
- [x] Application starts without errors
- [x] Product pages load correctly

### Testing

1. Run `npx prisma migrate deploy` on production
2. Verify migration succeeds
3. Check production database: `SELECT COUNT(*) FROM products WHERE warranty IS NOT NULL;` — should be 0
4. Visit production site → verify product pages load
5. Verify admin panel works (create/edit products)

---

## Task 12: End-to-End Verification — Test Full Flow

**Files**: 
- None (verification step)

**Dependencies**: Tasks 1-11 (all implementation complete)

**Estimated complexity**: Medium

**Estimated lines**: 0

### Description

Comprehensive end-to-end testing of the entire warranty feature across all layers.

### Test Scenarios

#### Scenario 1: Create Product with Warranty
1. Navigate to `/admin/products/new`
2. Fill all required fields
3. Enter warranty = "1 ano de garantia"
4. Submit form
5. **Verify**: Product created with warranty in database
6. **Verify**: Product detail page shows warranty section

#### Scenario 2: Create Product without Warranty
1. Navigate to `/admin/products/new`
2. Fill all required fields
3. Leave warranty empty
4. Submit form
5. **Verify**: Product created with `warranty = NULL` in database
6. **Verify**: Product detail page hides warranty section

#### Scenario 3: Edit Product — Add Warranty
1. Navigate to edit page for product without warranty
2. Enter warranty = "2 anos"
3. Save changes
4. **Verify**: Database updated with warranty value
5. **Verify**: Product detail page shows warranty section

#### Scenario 4: Edit Product — Clear Warranty
1. Navigate to edit page for product with warranty
2. Clear warranty field
3. Save changes
4. **Verify**: Database updated with `warranty = NULL`
5. **Verify**: Product detail page hides warranty section

#### Scenario 5: Search Products with Warranty
1. Navigate to product listing page
2. Search for a product with warranty
3. **Verify**: Search results include warranty field
4. Click on product → **Verify**: Warranty displays correctly

#### Scenario 6: API Direct Testing
1. POST to `/api/products` with warranty → **Verify**: Response includes warranty
2. PUT to `/api/products/<id>` with warranty → **Verify**: Response includes updated warranty
3. GET `/api/products/<id>` → **Verify**: Response includes warranty field

### Acceptance Criteria

- [x] All 6 scenarios pass
- [x] No console errors or warnings
- [x] No type errors (`npx tsc --noEmit`)
- [x] No lint errors (`npx eslint`)
- [x] Migration deployed successfully
- [x] Feature works in both development and production

### Testing

Execute all scenarios above and document results.

---

## Summary

| Task | Files | Lines | Complexity | Dependencies |
|------|-------|-------|------------|--------------|
| 1. Database Migration | 1 | +6 | Low | None |
| 2. TypeScript Types | 1 | +1 | Low | Task 1 |
| 3. Transformer | 1 | +1 | Low | Task 1, 2 |
| 4. Search Service | 2 | +3 | Medium | Task 1, 2 |
| 5. API POST | 1 | +1 | Low | Task 1, 2, 3 |
| 6. API PUT | 1 | +1 | Low | Task 1, 2, 3 |
| 7. Admin Form | 1 | +15 | Medium | Task 1, 2 |
| 8. Admin Edit Page | 1 | +1 | Low | Task 1, 2, 7 |
| 9. ProductDetail | 1 | +2 | Low | Task 1, 2, 3 |
| 10. Mock Data | 1 | +3 | Low | Task 1, 2 |
| 11. Migration Deploy | 0 | 0 | Low | Tasks 1-10 |
| 12. E2E Verification | 0 | 0 | Medium | Tasks 1-11 |

**Total**: ~34 lines of code changes across 9 files (excluding migration and verification)

**PR Budget Check**: ~34 lines + migration files (~10 lines) = ~44 lines total — well within 400-line budget ✅

---

## Rollback Considerations

### Code Rollback
```bash
git revert <commit-hash>
```

### Database Rollback
```sql
ALTER TABLE "products" DROP COLUMN "warranty";
```

Or use Prisma:
```bash
npx prisma migrate reset  # WARNING: destroys all data
```

### Rollback Impact
- **Nullable column**: No data loss on rollback
- **Existing products**: Unaffected (warranty = NULL)
- **Frontend**: Reverts to hardcoded "1 ano de garantia"
- **Admin**: Warranty input removed from forms

### Rollback Order
1. Revert code via git
2. Drop column (optional — can leave column if not causing issues)
3. Redeploy

---

## Implementation Order

Execute tasks in this exact order:

1. **Task 1**: Database Migration (foundation)
2. **Task 2**: TypeScript Types (type safety)
3. **Task 3**: Transformer (data mapping)
4. **Task 4**: Search Service (search path)
5. **Task 5**: API POST (create flow)
6. **Task 6**: API PUT (update flow)
7. **Task 7**: Admin Form (UI input)
8. **Task 8**: Admin Edit Page (pre-fill)
9. **Task 9**: ProductDetail (frontend display)
10. **Task 10**: Mock Data (testing data)
11. **Task 11**: Migration Deploy (production)
12. **Task 12**: E2E Verification (final testing)

Each task builds on the previous ones. Do not skip or reorder tasks.
