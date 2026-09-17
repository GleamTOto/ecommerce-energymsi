import { HeroBanner } from "@/components/home/HeroBanner"
import { CategoryGrid } from "@/components/home/CategoryGrid"
import { FeaturedProducts } from "@/components/home/FeaturedProducts"
import { SupplierSection } from "@/components/home/SupplierSection"
import { featuredProductsWithImages } from "@/data/mock-featured"

async function getFeaturedProducts() {
  try {
    // Use VERCEL_URL in production, fallback to localhost for development
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL 
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
    const res = await fetch(
      `${baseUrl}/api/products?featured=true&limit=3`,
      { cache: "no-store" }
    )
    if (!res.ok) return featuredProductsWithImages
    const data = await res.json()
    const products = data.products || data || []
    // Fallback to mock if API returns empty
    return products.length > 0 ? products : featuredProductsWithImages
  } catch {
    return featuredProductsWithImages
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
