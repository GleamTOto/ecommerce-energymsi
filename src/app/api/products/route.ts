import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { transformProduct } from "@/lib/transformers"
import { searchProducts } from "@/lib/search"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Query params — multi-select via getAll()
    const categories = searchParams.getAll("category")
    const suppliers = searchParams.getAll("supplier")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const sortBy = searchParams.get("sortBy") || "newest"
    const featured = searchParams.get("featured")
    const isNew = searchParams.get("new")
    const limit = searchParams.get("limit")
    const offset = searchParams.get("offset")
    const search = searchParams.get("search")?.slice(0, 200) || null

    // When search is present, delegate to the search service (weighted scoring)
    if (search) {
      const result = await searchProducts({
        search,
        categories: categories.length > 0 ? categories : undefined,
        suppliers: suppliers.length > 0 ? suppliers : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        featured: featured === "true" ? true : undefined,
        isNew: isNew === "true" ? true : undefined,
        sortBy,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
      })

      // Transform search results to match the existing Product type
      const transformedProducts = result.products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku || undefined,
        supplier: p.supplierName || "Sin proveedor",
        category: p.categorySlug,
        price: Number(p.price),
        comparePrice: undefined,
        cost: 0,
        margin: 0,
        unit: "UNIDAD",
        minStock: 0,
        status: "ACTIVE" as const,
        images: Array.isArray(p.images) && p.images.length > 0 ? p.images : undefined,
        description: p.description || "",
        specs: {},
        warranty: p.warranty || undefined,
        stock: p.stock,
        isNew: p.isNew,
        isFeatured: p.isFeatured,
        rating: 4.5,
      }))

      return NextResponse.json({
        products: transformedProducts,
        total: result.total,
        limit: limit ? Number(limit) : null,
        offset: offset ? Number(offset) : 0,
      })
    }

    // Existing Prisma path for non-search queries (backward compat)
    // Build where clause
    const where: Record<string, unknown> = {
      isActive: true,
    }

    if (categories.length > 0) {
      where.category = { slug: { in: categories } }
    }

    if (suppliers.length > 0) {
      where.supplier = { slug: { in: suppliers } }
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) (where.price as Record<string, number>).gte = Number(minPrice)
      if (maxPrice) (where.price as Record<string, number>).lte = Number(maxPrice)
    }

    if (featured === "true") {
      where.isFeatured = true
    }

    if (isNew === "true") {
      where.isNew = true
    }

    // Build orderBy
    let orderBy: Record<string, string> = { createdAt: "desc" }
    
    switch (sortBy) {
      case "price-asc":
        orderBy = { price: "asc" }
        break
      case "price-desc":
        orderBy = { price: "desc" }
        break
      case "newest":
        orderBy = { createdAt: "desc" }
        break
      case "popular":
        orderBy = { stock: "desc" } // Placeholder - would use sales count
        break
    }

    let products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        supplier: true,
      },
      take: limit ? Number(limit) : undefined,
      skip: offset ? Number(offset) : undefined,
    })

    // Shuffle products if featured to show random selection
    if (featured === "true") {
      products = products.sort(() => Math.random() - 0.5)
    }

    const total = await prisma.product.count({ where })

    const transformedProducts = products.map(transformProduct)
    
    // Debug logging for featured products
    if (featured === "true") {
      console.log(`[API] Featured products query:`, {
        where,
        totalFound: transformedProducts.length,
        productsWithImages: transformedProducts.filter(p => p.images && p.images.length > 0).length,
      })
    }

    return NextResponse.json({
      products: transformedProducts,
      total,
      limit: limit ? Number(limit) : null,
      offset: offset ? Number(offset) : 0,
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Error fetching products" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        sku: body.sku,
        description: body.description,
        price: body.price,
        comparePrice: body.comparePrice,
        cost: body.cost,
        margin: body.margin,
        unit: body.unit || "UNIDAD",
        minStock: body.minStock || 0,
        status: body.status || "ACTIVE",
        stock: body.stock || 0,
        images: body.images || [],
        specs: body.specs || {},
        warranty: body.warranty || null,
        isNew: body.isNew || false,
        isFeatured: body.isFeatured || false,
        categoryId: body.categoryId,
        supplierId: body.supplierId,
      },
      include: {
        category: true,
        supplier: true,
      },
    })

    return NextResponse.json(transformProduct(product), { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      { error: "Error creating product" },
      { status: 500 }
    )
  }
}
