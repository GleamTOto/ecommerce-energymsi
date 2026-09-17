import { HeroBanner } from "@/components/home/HeroBanner"
import { CategoryGrid } from "@/components/home/CategoryGrid"
import { FeaturedProducts } from "@/components/home/FeaturedProducts"
import { SupplierSection } from "@/components/home/SupplierSection"
import { featuredProducts as mockFeaturedProducts } from "@/data/mock-products"

async function getFeaturedProducts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const res = await fetch(
      `${baseUrl}/api/products?featured=true&limit=3`,
      { cache: "no-store" }
    )
    if (!res.ok) return mockFeaturedProducts.slice(0, 3)
    const data = await res.json()
    const products = data.products || data || []
    // Fallback to mock if API returns empty
    return products.length > 0 ? products : mockFeaturedProducts.slice(0, 3)
  } catch {
    return mockFeaturedProducts.slice(0, 3)
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
