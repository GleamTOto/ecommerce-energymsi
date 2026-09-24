# Proposal: Product Search Improvement

## Intent

The current product search is broken end-to-end: the products page ignores `?search=` URL params, the autocomplete loads ALL products client-side (doesn't scale), the API only searches name/description/SKU with basic `ILIKE`, and there are no database indexes for search. We need professional-quality search using PostgreSQL extensions (`pg_trgm`, `unaccent`) that supports multi-word queries, accent insensitivity, fuzzy matching, and relevance ranking — all without external services.

## Scope

### In Scope
- Fix broken search flow: products page must read `?search=` and pass it to API
- Multi-field search: name, SKU, brand/supplier, category, description
- Multi-word support (each word matches independently across fields)
- Accent/case insensitivity via `unaccent` extension
- Fuzzy matching via `pg_trgm` (typo tolerance, partial matches)
- Relevance ranking (SKU exact > name > brand+category > description > fuzzy)
- Database indexes (GIN trigram, expression indexes)
- Server-side autocomplete (replace client-side full-product-load)
- Multi-select filter fix (categories + suppliers send arrays)
- Preserve existing pagination, sorting, URL contracts

### Out of Scope
- External search services (Meilisearch, Elasticsearch, Algolia)
- Semantic/vector search
- Structured attributes model for specs
- Search analytics or query logging
- Full-text search with tsvector (overkill for this catalog size)

## Capabilities

### New Capabilities
- `product-search`: Server-side search with ranking, fuzzy matching, accent insensitivity, and multi-field/multi-word support

### Modified Capabilities
- `product-data-model`: Add search indexes (pg_trgm GIN, expression indexes on unaccent(name))

## Approach

### Database Layer
- Enable `pg_trgm` and `unaccent` extensions via Prisma raw SQL migration
- Add GIN trigram indexes on `name`, `description` columns
- Add expression index on `unaccent(name)` for accent-insensitive lookups
- No schema model changes — indexes only, no column additions

### Backend Layer
- New search service at `src/lib/search.ts` using `prisma.$queryRaw` for ranking queries
- Scoring: weighted sum — SKU exact (100), name all words (80), name any word (50), supplier/category (40), description (20), trigram similarity fallback (10)
- Update `src/app/api/products/route.ts` to delegate to search service when `?search=` present
- New endpoint `GET /api/products/autocomplete?q=...` (max 8 results, lightweight)
- Fix multi-select: accept repeated params `?category=a&category=b`

### Frontend Layer
- Fix `src/app/(shop)/products/page.tsx`: read `search` from URL params into filters
- Add `search: string` to `FilterState` in `src/types/index.ts`
- Update `src/stores/products-store.ts`: pass `search` param, fix multi-select to send all values
- Rewrite `src/components/layout/SearchBar.tsx`: debounced API call to autocomplete endpoint
- Keep URL contract: `/products?search=query`

### Migration Strategy
- Single Prisma migration with raw SQL: `CREATE EXTENSION IF NOT EXISTS`, then `CREATE INDEX`
- Non-destructive: indexes only, no data transforms
- Verify `pg_trgm`/`unaccent` availability on NeonDB before implementation

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `prisma/migrations/` | New | Migration with extensions + indexes |
| `src/lib/search.ts` | New | Search service with ranking logic |
| `src/app/api/products/route.ts` | Modified | Delegate to search service when `?search=` |
| `src/app/api/products/autocomplete/route.ts` | New | Autocomplete endpoint |
| `src/types/index.ts` | Modified | Add `search` to `FilterState` |
| `src/stores/products-store.ts` | Modified | Pass search param, fix multi-select |
| `src/app/(shop)/products/page.tsx` | Modified | Read `?search=` from URL |
| `src/components/layout/SearchBar.tsx` | Modified | Server-side autocomplete with debounce |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Extensions unavailable on NeonDB | Low | Verify before implementation; both are standard contrib |
| `$queryRaw` breaks type safety | Medium | Isolate in search service, validate with Zod |
| Ranking weights need tuning | Medium | Document weights, make configurable, test with real data |
| Autocomplete adds API load | Low | 300ms debounce, limit 8 results |

## Rollback Plan

1. Revert frontend (SearchBar, products page, store) — falls back to current behavior
2. Revert API route — removes search delegation
3. `DROP INDEX` + `DROP EXTENSION` — no data loss (indexes only)
4. Remove `src/lib/search.ts` and autocomplete route

## Dependencies

- NeonDB must support `pg_trgm` and `unaccent` extensions

## Success Criteria

- [ ] `?search=bateria` returns "Batería" products (accent insensitive)
- [ ] `?search=laptop gaming` matches across any fields
- [ ] `?search=lpotop` (typo) returns laptop products via fuzzy match
- [ ] SKU exact match ranks first
- [ ] Autocomplete responds in <200ms with debounce
- [ ] Existing pagination, sorting, filters work alongside search
- [ ] Multi-select sends all selected values
- [ ] No SQL injection (parameterized queries only)
- [ ] `npm run build` passes
