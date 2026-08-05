import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { transformSupplier } from "@/lib/transformers"

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(suppliers.map(transformSupplier))
  } catch (error) {
    console.error("Error fetching suppliers:", error)
    return NextResponse.json(
      { error: "Error fetching suppliers" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const supplier = await prisma.supplier.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        color: body.color,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    })

    return NextResponse.json(transformSupplier(supplier), { status: 201 })
  } catch (error) {
    console.error("Error creating supplier:", error)
    return NextResponse.json(
      { error: "Error creating supplier" },
      { status: 500 }
    )
  }
}
