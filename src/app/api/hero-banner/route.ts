import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { transformProduct } from "@/lib/transformers"

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5)
}

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: {
      isActive: true,
      OR: [{ isFeatured: true }, { isNew: true }],
    },
    include: { category: true, supplier: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function GET() {
  try {
    const configuredItems = await prisma.heroBannerItem.findMany({
      where: { product: { isActive: true } },
      orderBy: { position: "asc" },
      include: { product: { include: { category: true, supplier: true } } },
    })
    const featuredProducts = await getFeaturedProducts()
    const selectedIds = new Set(configuredItems.map((item) => item.productId))
    const selected = configuredItems.map((item) => transformProduct(item.product))
    const fallbackFeatured = shuffle(
      featuredProducts.filter((product) => !selectedIds.has(product.id))
    )

    const newProducts = shuffle(await prisma.product.findMany({
      where: { isActive: true, isNew: true, id: { notIn: [...selectedIds] } },
      include: { category: true, supplier: true },
    }))
    const activeProducts = shuffle(await prisma.product.findMany({
      where: { isActive: true, id: { notIn: [...selectedIds] } },
      include: { category: true, supplier: true },
    }))
    const fallback = [...fallbackFeatured, ...newProducts, ...activeProducts].filter(
      (product, index, products) =>
        !selectedIds.has(product.id) && products.findIndex((candidate) => candidate.id === product.id) === index
    )
    return NextResponse.json({
      products: [...selected, ...fallback.slice(0, Math.max(0, 3 - selected.length))],
      selected: configuredItems.map((item) => transformProduct(item.product)),
      available: featuredProducts.map(transformProduct),
    })
  } catch (error) {
    console.error("Error fetching HeroBanner configuration:", error)
    return NextResponse.json({ error: "Error fetching HeroBanner configuration" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const productIds = body.productIds
    if (!Array.isArray(productIds) || productIds.some((id) => typeof id !== "string")) {
      return NextResponse.json({ error: "productIds must be an array of strings" }, { status: 400 })
    }

    const uniqueIds = [...new Set(productIds)]
    const eligibleCount = await prisma.product.count({
      where: {
        id: { in: uniqueIds },
        isActive: true,
        OR: [{ isFeatured: true }, { isNew: true }],
      },
    })
    if (eligibleCount !== uniqueIds.length) {
      return NextResponse.json(
        { error: "Only active featured or new products can be displayed" },
        { status: 400 }
      )
    }

    await prisma.$transaction(async (tx) => {
      await tx.heroBannerItem.deleteMany()
      if (uniqueIds.length > 0) {
        await tx.heroBannerItem.createMany({
          data: uniqueIds.map((productId, position) => ({ productId, position })),
        })
      }
    })

    return NextResponse.json({ success: true, productIds: uniqueIds })
  } catch (error) {
    console.error("Error updating HeroBanner configuration:", error)
    return NextResponse.json({ error: "Error updating HeroBanner configuration" }, { status: 500 })
  }
}
