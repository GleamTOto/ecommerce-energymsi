"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SupplierFilter } from "./SupplierFilter"
import { PriceFilter } from "./PriceFilter"
import { CategoryFilter } from "./CategoryFilter"
import { FilterState } from "@/types"

interface FilterSidebarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

export function FilterSidebar({ filters, onFiltersChange }: FilterSidebarProps) {
  const hasActiveFilters =
    filters.suppliers.length > 0 ||
    filters.categories.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 5000000

  const handleClearFilters = () => {
    onFiltersChange({
      suppliers: [],
      categories: [],
      priceRange: [0, 5000000],
      sortBy: filters.sortBy,
    })
  }

  return (
    <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto overflow-x-hidden pr-1 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/40">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Filtros</h2>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-auto p-0 text-sm text-primary hover:text-primary/80"
            >
              Limpiar
              <X className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>

        <SupplierFilter
          selectedSuppliers={filters.suppliers}
          onSuppliersChange={(suppliers) =>
            onFiltersChange({ ...filters, suppliers })
          }
        />

        <PriceFilter
          priceRange={filters.priceRange}
          onPriceChange={(priceRange) =>
            onFiltersChange({ ...filters, priceRange })
          }
        />

        <CategoryFilter
          selectedCategories={filters.categories}
          onCategoriesChange={(categories) =>
            onFiltersChange({ ...filters, categories })
          }
        />
      </div>
    </div>
  )
}
