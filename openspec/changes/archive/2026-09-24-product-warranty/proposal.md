# Proposal: Configurable Product Warranty

## Intent

Replace hardcoded "1 ano de garantia" in `ProductDetail.tsx` (lines 179-185) with configurable per-product warranty. Currently all products show identical warranty text. This enables admin configuration where some products display warranty and others don't.

## Scope

### In Scope
- Add optional `warranty` field to Product data model
- Add warranty input to admin product form (create/edit)
- Conditional rendering in ProductDetail
- Update transformer and mock data

### Out of Scope
- Warranty templates or predefined options
- Warranty document generation
- Warranty claims workflow
- Bulk warranty updates
- Expiration tracking

## Capabilities

### New Capabilities
_None_

### Modified Capabilities
- `product-data-model`: Add optional `warranty` field (String?) to Product model
- `admin-product-crud`: Add warranty input to forms, update validation schema

## Approach

**Database**: Add `warranty String?` to Product model in `prisma/schema.prisma`. Nullable field, non-destructive migration.

**Types**: Add `warranty?: string` to Product interface in `src/types/index.ts`.

**Admin**: Add text input to `src/components/admin/ProductForm.tsx` with placeholder "Ej: 1 ano, 6 meses". Add `warranty: z.string().optional()` to zod schema. Pre-fill on edit page.

**API**: Include warranty in POST/PUT handlers (`src/app/api/products/route.ts`, `src/app/api/products/[id]/route.ts`). Update `transformProduct` in `src/lib/transformers.ts`.

**Frontend**: Replace hardcoded warranty section in `src/components/products/ProductDetail.tsx` with conditional rendering: show only if `product.warranty` exists.

**Migration**: `npx prisma migrate dev --name add-warranty-field`. Adds nullable column, no data loss.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modified | Add `warranty String?` to Product |
| `src/types/index.ts` | Modified | Add `warranty?: string` |
| `src/components/admin/ProductForm.tsx` | Modified | Add input, update zod schema |
| `src/app/(admin-panel)/admin/products/[id]/edit/page.tsx` | Modified | Pre-fill warranty |
| `src/app/api/products/route.ts` | Modified | Include in POST |
| `src/app/api/products/[id]/route.ts` | Modified | Include in PUT |
| `src/lib/transformers.ts` | Modified | Map warranty field |
| `src/components/products/ProductDetail.tsx` | Modified | Conditional rendering |
| `src/data/mock-products.ts` | Modified | Add sample values |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Migration fails | Low | Nullable field, safe ALTER TABLE |
| Validation rejects empty | Low | Use `.optional()` not `.nullable()` |
| Hardcoded text elsewhere | Low | Grep "garantia" before implementation |

## Rollback Plan

Revert code via git. Drop `warranty` column or run `npx prisma migrate reset`. Existing products unaffected (nullable column).

## Dependencies

None

## Success Criteria

- [ ] Admin sets warranty when creating/editing products
- [ ] ProductDetail shows warranty only when value exists
- [ ] Products without warranty hide section entirely
- [ ] Existing products work (warranty = null)
- [ ] Migration runs without data loss
