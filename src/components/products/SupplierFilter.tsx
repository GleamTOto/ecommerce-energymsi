"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, Search } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useProductsStore } from "@/stores/products-store"

interface SupplierFilterProps {
  selectedSuppliers: string[]
  onSuppliersChange: (suppliers: string[]) => void
}

export function SupplierFilter({ selectedSuppliers, onSuppliersChange }: SupplierFilterProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { suppliers, fetchSuppliers } = useProductsStore()

  useEffect(() => {
    if (suppliers.length === 0) {
      fetchSuppliers()
    }
  }, [suppliers.length, fetchSuppliers])

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSupplierToggle = (supplierName: string) => {
    if (selectedSuppliers.includes(supplierName)) {
      onSuppliersChange(selectedSuppliers.filter((b) => b !== supplierName))
    } else {
      onSuppliersChange([...selectedSuppliers, supplierName])
    }
  }

  return (
    <div className="border-b pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-2 font-medium"
      >
        Proveedor
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isOpen && (
        <div className="mt-2 space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar proveedor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>

          <div className="max-h-48 space-y-2 overflow-y-auto">
            {suppliers.length === 0 ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))
            ) : (
              filteredSuppliers.map((supplier) => (
                <div key={supplier.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`supplier-${supplier.id}`}
                    checked={selectedSuppliers.includes(supplier.name)}
                    onCheckedChange={() => handleSupplierToggle(supplier.name)}
                  />
                  <Label
                    htmlFor={`supplier-${supplier.id}`}
                    className="flex flex-1 cursor-pointer items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-2">
                      {supplier.color && (
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: supplier.color }}
                        />
                      )}
                      {supplier.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {supplier.productCount}
                    </span>
                  </Label>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
