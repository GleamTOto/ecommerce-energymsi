"use client"

import { useEffect } from "react"
import Link from "next/link"
import {
  Battery,
  BatteryCharging,
  Scale,
  Gamepad2,
  Car,
  Zap,
  Wrench,
  Flame,
  Gauge,
  Shield,
  CircuitBoard,
  Plug,
  Sun,
  Package,
} from "lucide-react"
import { useProductsStore } from "@/stores/products-store"
import { Skeleton } from "@/components/ui/skeleton"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Baterias: Battery,
  "Baterias Para UPS": BatteryCharging,
  "Baterias Para Bascula": Scale,
  "Baterias Para Juguetes": Gamepad2,
  "Movilidad Eléctrica": Car,
  Inversores: Zap,
  "Puntas Y Destornilladores": Wrench,
  "Equipos de Soldadura": Flame,
  "Accesorios Para Vehiculo": Car,
  Multimetros: Gauge,
  "Ups Y Sistemas De Proteccion": Shield,
  "Herramientas De Electronica": CircuitBoard,
  Cargadores: Plug,
  Solar: Sun,
  Package: Package,
}

const getCategoryIcon = (categoryName: string, iconKey: string): React.ComponentType<{ className?: string }> => {
  return iconMap[categoryName] || iconMap[iconKey] || Package
}

export function CategoryGrid() {
  const { categories, fetchCategories } = useProductsStore()

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return (
    <section className="pt-6 pb-2 sm:pt-8 sm:pb-4">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 sm:gap-4">
          {categories.length === 0
            ? Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))
            : categories.map((category) => {
                const Icon = getCategoryIcon(category.name, category.icon)
                return (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.slug}`}
                    className="group relative flex flex-col items-center justify-center rounded-xl border-2 bg-card p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1"
                    style={{
                      borderColor: `${category.color}20`,
                    }}
                  >
                    {/* Icon Container */}
                    <div
                      className="mb-3 flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: `${category.color}15`,
                      }}
                    >
                      <span style={{ color: category.color }}>
                        <Icon
                          className="h-7 w-7 transition-all duration-300 group-hover:scale-110"
                        />
                      </span>
                    </div>

                    {/* Category Name */}
                    <h3 className="text-center text-sm font-semibold text-foreground line-clamp-2 mb-2 transition-colors duration-300 group-hover:text-foreground">
                      {category.name}
                    </h3>

                    {/* Product Count Badge */}
                    <div
                      className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white transition-all duration-300 group-hover:scale-110"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.productCount}
                    </div>

                    {/* Hover Gradient Overlay */}
                    <div
                      className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-10"
                      style={{
                        background: `linear-gradient(135deg, ${category.color} 0%, transparent 100%)`,
                      }}
                    />
                  </Link>
                )
              })}
        </div>
      </div>
    </section>
  )
}
