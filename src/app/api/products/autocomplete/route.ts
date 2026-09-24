import { NextRequest, NextResponse } from "next/server"
import { searchAutocomplete } from "@/lib/search"

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q")?.slice(0, 200) || ""

    if (!q.trim()) {
      return NextResponse.json([])
    }

    const results = await searchAutocomplete(q)

    // Return lightweight shape for autocomplete
    const suggestions = results.slice(0, 8).map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      images: p.images || [],
      category: p.categoryName,
      stock: p.stock,
    }))

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error("Autocomplete error:", error)
    // Graceful: return empty array, not 500 — prevents UI crash
    return NextResponse.json([])
  }
}
