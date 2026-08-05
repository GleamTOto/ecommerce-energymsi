-- Create ProductStatus enum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK');

-- Rename Brand model to Supplier
ALTER TABLE "brands" RENAME TO "suppliers";

-- Add new columns to suppliers (formerly brands)
ALTER TABLE "suppliers" ADD COLUMN "description" TEXT;
ALTER TABLE "suppliers" ADD COLUMN "color" TEXT;
-- Rename logo to color if needed (logo is dropped, color added)
ALTER TABLE "suppliers" DROP COLUMN "logo";

-- Add new columns to categories
ALTER TABLE "categories" ADD COLUMN "color" TEXT;
ALTER TABLE "categories" ADD COLUMN "description" TEXT;

-- Add new columns to products
ALTER TABLE "products" ADD COLUMN "sku" TEXT;
ALTER TABLE "products" ADD COLUMN "cost" DECIMAL(12,2);
ALTER TABLE "products" ADD COLUMN "margin" DECIMAL(5,2);
ALTER TABLE "products" ADD COLUMN "unit" TEXT NOT NULL DEFAULT 'UNIDAD';
ALTER TABLE "products" ADD COLUMN "minStock" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "products" ADD COLUMN "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "products" ADD COLUMN "supplierId" TEXT;

-- Migrate brand relations to supplier relations
UPDATE "products" SET "supplierId" = "brandId";

-- Drop the old brandId column and add the new relation
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_brandId_fkey";
ALTER TABLE "products" DROP COLUMN "brandId";

-- Create unique index on sku (nullable, only for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS "products_sku_key" ON "products"("sku") WHERE "sku" IS NOT NULL;

-- Add supplier relation (nullable)
ALTER TABLE "products" ADD CONSTRAINT "products_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS "products_supplierId_idx" ON "products"("supplierId");
CREATE INDEX IF NOT EXISTS "products_sku_idx" ON "products"("sku");

-- Update price precision from Decimal(10,2) to Decimal(12,2)
ALTER TABLE "products" ALTER COLUMN "price" TYPE DECIMAL(12,2);
ALTER TABLE "products" ALTER COLUMN "comparePrice" TYPE DECIMAL(12,2);
ALTER TABLE "orders" ALTER COLUMN "subtotal" TYPE DECIMAL(12,2);
ALTER TABLE "orders" ALTER COLUMN "shipping" TYPE DECIMAL(12,2);
ALTER TABLE "orders" ALTER COLUMN "total" TYPE DECIMAL(12,2);
ALTER TABLE "order_items" ALTER COLUMN "price" TYPE DECIMAL(12,2);
ALTER TABLE "order_items" ALTER COLUMN "total" TYPE DECIMAL(12,2);
