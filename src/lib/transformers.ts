import type { Product, Category, Supplier } from "@/types"
import type {
  Product as PrismaProduct,
  Category as PrismaCategory,
  Supplier as PrismaSupplier,
} from "@/generated/prisma/client/client"

type ProductWithRelations = PrismaProduct & {
  category: PrismaCategory
  supplier: PrismaSupplier | null
}

type CategoryWithCount = PrismaCategory & {
  _count?: { products: number }
}

type SupplierWithCount = PrismaSupplier & {
  _count?: { products: number }
}

export function transformProduct(product: ProductWithRelations): Product {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku || undefined,
    supplier: product.supplier?.name || "Sin proveedor",
    category: product.category.slug,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : undefined,
    cost: product.cost ? Number(product.cost) : 0,
    margin: product.margin ? Number(product.margin) : 0,
    unit: product.unit,
    minStock: product.minStock,
    status: product.status as "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK",
    images: product.images.length > 0 ? product.images : undefined,
    description: product.description || "",
    specs: (product.specs as Record<string, string>) || {},
    stock: product.stock,
    isNew: product.isNew,
    isFeatured: product.isFeatured,
    rating: 4.5, // Default rating - could be calculated from reviews in the future
  }
}

export function transformCategory(category: CategoryWithCount): Category {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    icon: category.icon || "Package",
    color: category.color || undefined,
    description: category.description || undefined,
    productCount: category._count?.products || 0,
  }
}

export function transformSupplier(supplier: SupplierWithCount): Supplier {
  return {
    id: supplier.id,
    name: supplier.name,
    slug: supplier.slug,
    description: supplier.description || undefined,
    color: supplier.color || undefined,
    productCount: supplier._count?.products || 0,
  }
}
