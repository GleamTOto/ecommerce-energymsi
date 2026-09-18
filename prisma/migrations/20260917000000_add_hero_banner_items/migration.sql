CREATE TABLE "hero_banner_items" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_banner_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "hero_banner_items_position_key" ON "hero_banner_items"("position");
CREATE UNIQUE INDEX "hero_banner_items_productId_key" ON "hero_banner_items"("productId");

ALTER TABLE "hero_banner_items" ADD CONSTRAINT "hero_banner_items_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
