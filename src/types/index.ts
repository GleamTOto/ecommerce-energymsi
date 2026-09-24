export type ProductStatus = "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK"

export interface Product {
  id: string
  name: string
  slug: string
  sku?: string
  description: string
  price: number
  comparePrice?: number
  cost: number
  margin: number
  unit: string
  minStock: number
  status: ProductStatus
  images?: string[]
  specs: Record<string, string>
  warranty?: string
  stock: number
  isNew: boolean
  isFeatured: boolean
  rating: number
  supplier: string
  category: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  color?: string
  description?: string
  productCount: number
}

export interface Supplier {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  productCount: number
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface FilterState {
  categories: string[]
  suppliers: string[]
  priceRange: [number, number]
  sortBy: 'popular' | 'price-asc' | 'price-desc' | 'newest' | 'rating'
  search: string
}
