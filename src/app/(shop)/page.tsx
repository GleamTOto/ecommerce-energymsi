import { HeroBanner } from "@/components/home/HeroBanner"
import { CategoryGrid } from "@/components/home/CategoryGrid"
import { FeaturedProducts } from "@/components/home/FeaturedProducts"
import { SupplierSection } from "@/components/home/SupplierSection"
import { prisma } from "@/lib/prisma"
import { transformProduct } from "@/lib/transformers"

async function getFeaturedProducts() {
  try {
    // Direct database query instead of API call
    let products = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      include: {
        category: true,
        supplier: true,
      },
      take: 10, // Get more to shuffle
    })

    // If no featured products, get any products with images
    if (products.length === 0) {
      console.log("[HomePage] No featured products found, getting random products with images")
      products = await prisma.product.findMany({
        where: {
          isActive: true,
          images: {
            isEmpty: false,
          },
        },
        include: {
          category: true,
          supplier: true,
        },
        take: 10,
      })
    }

    // Shuffle and take 3
    const shuffled = products.sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, 3)

    console.log(`[HomePage] Selected ${selected.length} products for HeroBanner`)
    
    return selected.map(transformProduct)
  } catch (error) {
    console.error("[HomePage] Error fetching featured products:", error)
    return []
  }
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts()

  return (
    <>
      <HeroBanner products={featuredProducts} />
      <CategoryGrid />
      <FeaturedProducts />
      <SupplierSection />
    </>
  )
}
