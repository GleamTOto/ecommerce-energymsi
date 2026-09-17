import { HeroBanner } from "@/components/home/HeroBanner"
import { CategoryGrid } from "@/components/home/CategoryGrid"
import { FeaturedProducts } from "@/components/home/FeaturedProducts"
import { SupplierSection } from "@/components/home/SupplierSection"
import { prisma } from "@/lib/prisma"
import { transformProduct } from "@/lib/transformers"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

async function getFeaturedProducts() {
  try {
    console.log("[HomePage] Starting getFeaturedProducts...")
    console.log("[HomePage] DATABASE_URL exists:", !!process.env.DATABASE_URL)
    
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

    console.log(`[HomePage] Featured products query returned ${products.length} products`)

    // If no featured products, get any products with images
    if (products.length === 0) {
      console.log("[HomePage] No featured products found, getting random products with images")
      products = await prisma.product.findMany({
        where: {
          isActive: true,
        },
        include: {
          category: true,
          supplier: true,
        },
        take: 10,
      })
      
      // Filter products with images
      products = products.filter(p => p.images && p.images.length > 0)
      console.log(`[HomePage] Found ${products.length} products with images`)
    }

    // Shuffle and take 3
    const shuffled = products.sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, 3)

    console.log(`[HomePage] Selected ${selected.length} products for HeroBanner`)
    console.log(`[HomePage] Product IDs:`, selected.map(p => p.id))
    console.log(`[HomePage] Product images:`, selected.map(p => ({ name: p.name, images: p.images?.length || 0 })))
    
    return selected.map(transformProduct)
  } catch (error) {
    console.error("[HomePage] Error fetching featured products:", error)
    console.error("[HomePage] Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    return []
  }
}

export default async function HomePage() {
  console.log("[HomePage] Rendering HomePage...")
  const featuredProducts = await getFeaturedProducts()
  console.log(`[HomePage] Passing ${featuredProducts.length} products to HeroBanner`)

  return (
    <>
      <HeroBanner products={featuredProducts} />
      <CategoryGrid />
      <FeaturedProducts />
      <SupplierSection />
    </>
  )
}
