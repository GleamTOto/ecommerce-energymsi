import { create } from "zustand"
import type { Product, Category, Supplier, FilterState } from "@/types"

interface ProductsState {
  products: Product[]
  categories: Category[]
  suppliers: Supplier[]
  featuredProducts: Product[]
  filters: FilterState
  loading: boolean
  error: string | null

  // Actions
  fetchProducts: (filters?: Partial<FilterState>) => Promise<void>
  fetchFeaturedProducts: () => Promise<void>
  fetchCategories: () => Promise<void>
  fetchSuppliers: () => Promise<void>
  setFilters: (filters: Partial<FilterState>) => void
  resetFilters: () => void
}

const defaultFilters: FilterState = {
  categories: [],
  suppliers: [],
  priceRange: [0, 5000000],
  sortBy: "newest",
  search: "",
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  categories: [],
  suppliers: [],
  featuredProducts: [],
  filters: defaultFilters,
  loading: false,
  error: null,

  fetchProducts: async (filterOverrides) => {
    set({ loading: true, error: null })
    try {
      const filters = { ...get().filters, ...filterOverrides }
      const params = new URLSearchParams()

      // Multi-select: send all selected values (not just when length === 1)
      filters.categories.forEach((c) => params.append("category", c))
      filters.suppliers.forEach((s) => params.append("supplier", s))

      if (filters.priceRange[0] > 0) {
        params.set("minPrice", filters.priceRange[0].toString())
      }
      if (filters.priceRange[1] < 5000000) {
        params.set("maxPrice", filters.priceRange[1].toString())
      }
      if (filters.sortBy) {
        params.set("sortBy", filters.sortBy)
      }
      if (filters.search) {
        params.set("search", filters.search)
      }

      const response = await fetch(`/api/products?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch products")

      const data = await response.json()
      set({ products: data.products, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchFeaturedProducts: async () => {
    try {
      const response = await fetch("/api/products?featured=true&limit=8")
      if (!response.ok) throw new Error("Failed to fetch featured products")

      const data = await response.json()
      set({ featuredProducts: data.products })
    } catch (error) {
      console.error("Error fetching featured products:", error)
    }
  },

  fetchCategories: async () => {
    try {
      const response = await fetch("/api/categories")
      if (!response.ok) throw new Error("Failed to fetch categories")

      const categories = await response.json()
      set({ categories })
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  },

  fetchSuppliers: async () => {
    try {
      const response = await fetch("/api/suppliers")
      if (!response.ok) throw new Error("Failed to fetch suppliers")

      const suppliers = await response.json()
      set({ suppliers })
    } catch (error) {
      console.error("Error fetching suppliers:", error)
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }))
  },

  resetFilters: () => {
    set({ filters: defaultFilters })
  },
}))
