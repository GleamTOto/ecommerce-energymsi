import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { transformProduct } from "@/lib/transformers"

type Params = Promise<{ id: string }>

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params

    // Try to find by slug first, then by id
    // Note: Don't filter by isActive here - admin edit page needs to load inactive products
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ slug: id }, { id: id }],
      },
      include: {
        category: true,
        supplier: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Return both transformed data AND raw IDs for admin edit form
    const transformed = transformProduct(product)
    return NextResponse.json({
      ...transformed,
      categoryId: product.categoryId,
      supplierId: product.supplierId || "",
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      { error: "Error fetching product" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.slug || !body.sku || !body.description) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: name, slug, sku, description" },
        { status: 400 }
      )
    }

    if (!body.categoryId) {
      return NextResponse.json(
        { error: "La categoría es requerida" },
        { status: 400 }
      )
    }

    if (body.price === undefined || body.price < 0) {
      return NextResponse.json(
        { error: "El precio debe ser mayor o igual a 0" },
        { status: 400 }
      )
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        sku: body.sku,
        description: body.description,
        price: body.price,
        comparePrice: body.comparePrice ?? null,
        cost: body.cost ?? 0,
        margin: body.margin ?? 0,
        unit: body.unit || "UNIDAD",
        minStock: body.minStock ?? 0,
        status: body.status || "ACTIVE",
        stock: body.stock ?? 0,
        images: body.images || [],
        specs: body.specs || {},
        warranty: body.warranty || null,
        isNew: body.isNew ?? false,
        isFeatured: body.isFeatured ?? false,
        isActive: body.isActive ?? true,
        categoryId: body.categoryId,
        supplierId: body.supplierId || null, // Convert empty string to null
      },
      include: {
        category: true,
        supplier: true,
      },
    })

    return NextResponse.json(transformProduct(product))
  } catch (error) {
    console.error("Error updating product:", error)
    
    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: "Producto no encontrado" },
          { status: 404 }
        )
      }
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: "El slug o SKU ya existe" },
          { status: 409 }
        )
      }
    }
    
    return NextResponse.json(
      { error: "Error al actualizar el producto" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params

    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { error: "Error deleting product" },
      { status: 500 }
    )
  }
}
