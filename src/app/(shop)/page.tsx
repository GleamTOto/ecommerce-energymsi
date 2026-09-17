import { HeroBanner } from "@/components/home/HeroBanner"
import { CategoryGrid } from "@/components/home/CategoryGrid"
import { FeaturedProducts } from "@/components/home/FeaturedProducts"
import { SupplierSection } from "@/components/home/SupplierSection"

async function getFeaturedProducts() {
  try {
    // Use VERCEL_URL in production, fallback to localhost for development
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL 
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
    
    console.log(`[HomePage] Fetching featured products from: ${baseUrl}`)
    
    // First try to get featured products
    const res = await fetch(
      `${baseUrl}/api/products?featured=true&limit=3`,
      { cache: "no-store" }
    )
    
    console.log(`[HomePage] Featured products response status: ${res.status}`)
    
    if (res.ok) {
      const data = await res.json()
      const products = data.products || []
      console.log(`[HomePage] Featured products found: ${products.length}`)
      if (products.length > 0) {
        return products
      }
    }
    
    // If no featured products, get any 3 random products with images
    console.log(`[HomePage] No featured products, trying fallback...`)
    const fallbackRes = await fetch(
      `${baseUrl}/api/products?limit=10`,
      { cache: "no-store" }
    )
    
    if (fallbackRes.ok) {
      const data = await fallbackRes.json()
      const allProducts = data.products || []
      console.log(`[HomePage] Total products for fallback: ${allProducts.length}`)
      // Filter products with images and take 3 random ones
      const productsWithImages = allProducts.filter(
        (p: any) => p.images && p.images.length > 0
      )
      console.log(`[HomePage] Products with images: ${productsWithImages.length}`)
      // Shuffle and take 3
      const shuffled = productsWithImages.sort(() => Math.random() - 0.5)
      return shuffled.slice(0, 3)
    }
    
    console.log(`[HomePage] Fallback also failed`)
    return []
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
