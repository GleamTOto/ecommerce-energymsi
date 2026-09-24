# Design: Configurable Product Warranty

## Technical Approach

Add an optional `warranty` field (nullable `String?`) to the Product model, propagate it through the type system, admin form, API handlers, transformer, and frontend display. The hardcoded "1 ano de garantia" in `ProductDetail.tsx` (lines 179-185) is replaced with conditional rendering driven by `product.warranty`. Empty strings are normalized to `null` at the API layer and to `undefined` at the transformer layer.

## Architecture Decisions

| Decision | Choice | Alternative | Rationale |
|----------|--------|-------------|-----------|
| DB column type | `String?` (nullable) | `String @default("")` | Nullable matches the "absent = hidden" semantic; empty string is a UI concern, not a DB concern |
| Warranty input placement | "Informacion Basica" card, after description | Separate "Warranty" card | Follows existing pattern — single text field doesn't warrant its own card |
| Zod validation | `z.string().optional()` | `z.string().nullable()` | react-hook-form sends `""` for empty inputs; `.optional()` accepts both `undefined` and empty string without coercion at schema level |
| Empty string handling | Normalize at API boundary (`body.warranty \|\| null`) | Normalize in transformer only | DB should never store `""` — single normalization point at write time |
| Frontend conditional | `{product.warranty && (...)}` block | Always render with fallback text | Spec requires hiding the section entirely when warranty is absent |

## Data Flow

```
Admin Form (warranty: string)
    │
    ▼
POST/PUT /api/products
    │  normalize: body.warranty || null
    ▼
Prisma (warranty: String? → DB column)
    │
    ▼
transformProduct()
    │  normalize: product.warranty || undefined
    ▼
Product type { warranty?: string }
    │
    ▼
ProductDetail — conditional render
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modify | Add `warranty String?` to Product model (after line 112, near `specs`) |
| `src/types/index.ts` | Modify | Add `warranty?: string` to Product interface (after line 23) |
| `src/lib/transformers.ts` | Modify | Map `warranty` field with empty-string-to-undefined normalization (line 42) |
| `src/components/admin/ProductForm.tsx` | Modify | Add `warranty` to zod schema, `ProductFormInitialData`, defaultValues, and JSX input |
| `src/app/(admin-panel)/admin/products/[id]/edit/page.tsx` | Modify | Include `warranty: data.warranty` in initialData (line 59) |
| `src/app/api/products/route.ts` | Modify | Include `warranty` in POST create data (line 182) and search results transform (line 58) |
| `src/app/api/products/[id]/route.ts` | Modify | Include `warranty` in PUT update data (line 100) |
| `src/components/products/ProductDetail.tsx` | Modify | Replace hardcoded warranty block (lines 179-185) with conditional render |
| `src/data/mock-products.ts` | Modify | Add `warranty` to 3+ products, leave others without |

## Interfaces / Contracts

### Prisma Schema (add to Product model)

```prisma
warranty       String?
```

Position: after `specs Json?` (line 112), before `isNew`.

### TypeScript Interface (add to Product)

```typescript
warranty?: string
```

### Zod Schema (add to productFormSchema)

```typescript
warranty: z.string().optional(),
```

### ProductFormInitialData (add field)

```typescript
warranty?: string | null
```

### Admin Form Input (JSX — inside "Informacion Basica" CardContent, after description block ~line 302)

```tsx
<div className="space-y-2">
  <Label htmlFor="warranty">Garantia (opcional)</Label>
  <Input
    id="warranty"
    placeholder="Ej: 1 ano, 6 meses"
    {...register("warranty")}
  />
</div>
```

### transformProduct (add to return object)

```typescript
warranty: product.warranty || undefined,
```

### API POST (add to prisma.product.create data)

```typescript
warranty: body.warranty || null,
```

### API PUT (add to prisma.product.update data)

```typescript
warranty: body.warranty || null,
```

### ProductDetail (replace lines 179-185)

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

### Mock Data (add warranty to products with ids 1, 5, 8 as samples)

```typescript
// Product 1: "Bateria Netion 12v 1.2ah"
warranty: "1 ano de garantia"

// Product 5: pick a mid-list product
warranty: "6 meses de garantia"

// Product 8: pick another
warranty: "2 anos de garantia"
```

## Database Migration

```sql
-- Migration: add-warranty-field
ALTER TABLE "products" ADD COLUMN "warranty" TEXT;
```

Generated via: `npx prisma migrate dev --name add-warranty-field`

**Rollback**: `ALTER TABLE "products" DROP COLUMN "warranty";` or `npx prisma migrate reset`. Nullable column — no data loss, all existing rows get `NULL`.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Manual | Admin form create/edit with and without warranty | Browser test on `/admin/products/new` and `/admin/products/[id]/edit` |
| Manual | ProductDetail shows/hides warranty section | Visit product pages with and without warranty values |
| API | POST/PUT accept warranty, normalize empty to null | curl or browser devtools on `/api/products` |
| Lint | No type errors after interface change | `npx eslint` (project test command) |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No feature flag needed. The column is nullable and additive — deploy migration first, then code. Existing products display without warranty section (backward compatible). No data backfill required.

## Open Questions

None.
