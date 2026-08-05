import { HeroBanner } from "@/components/home/HeroBanner"
import { CategoryGrid } from "@/components/home/CategoryGrid"
import { FeaturedProducts } from "@/components/home/FeaturedProducts"
import { SupplierSection } from "@/components/home/SupplierSection"

async function getFeaturedProducts() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/products?featured=true&limit=3`,
      { cache: "no-store" }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.products || data || []
  } catch {
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
