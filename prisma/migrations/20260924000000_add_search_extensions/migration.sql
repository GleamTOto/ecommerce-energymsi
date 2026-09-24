-- Enable search extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Make unaccent IMMUTABLE so it can be used in indexes
CREATE OR REPLACE FUNCTION f_unaccent(text) RETURNS text AS $$
  SELECT public.unaccent('public.unaccent', $1)
$$ LANGUAGE sql IMMUTABLE;

-- GIN trigram indexes for fuzzy search
CREATE INDEX IF NOT EXISTS idx_products_name_trgm
  ON products USING GIN (f_unaccent(name) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_description_trgm
  ON products USING GIN (f_unaccent(COALESCE(description, '')) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_sku_trgm
  ON products USING GIN (f_unaccent(COALESCE(sku, '')) gin_trgm_ops);
