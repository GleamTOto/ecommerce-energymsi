"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Menu,
  User,
  Heart,
  Package,
  Store,
  Settings,
  Zap,
  Sun,
  Monitor,
  Keyboard,
  Mouse,
  Headphones,
  HardDrive,
  Cpu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useProductsStore } from "@/stores/products-store"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Monitor,
  Keyboard,
  Mouse,
  Headphones,
  HardDrive,
  Cpu,
  Package,
}

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()
  const { categories, fetchCategories } = useProductsStore()

  React.useEffect(() => {
    if (categories.length === 0) {
      fetchCategories()
    }
  }, [categories.length, fetchCategories])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-4">
          {/* User Actions */}
          <div className="flex flex-col gap-2">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
            >
              <User className="h-4 w-4" />
              Mi Cuenta
            </Link>
            <Link
              href="/profile/favorites"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
            >
              <Heart className="h-4 w-4" />
              Favoritos
            </Link>
            <Link
              href="/profile/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
            >
              <Package className="h-4 w-4" />
              Mis Pedidos
            </Link>
          </div>

          <Separator />

          <nav aria-label="Servicios" className="flex flex-col gap-1">
            <p className="px-3 text-xs font-semibold uppercase text-muted-foreground">Servicios</p>
            <Link href="/servicio-tecnico-ups" aria-current={pathname === "/servicio-tecnico-ups" ? "page" : undefined} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"><Zap className="h-4 w-4" />Servicio técnico UPS</Link>
            <Link href="/soluciones-solares" aria-current={pathname === "/soluciones-solares" ? "page" : undefined} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"><Sun className="h-4 w-4" />Soluciones solares</Link>
          </nav>

          <Separator />

          {/* Categories */}
          <div className="flex flex-col gap-1">
            <p className="px-3 text-xs font-semibold uppercase text-muted-foreground">
              Categorias
            </p>
            {categories.length === 0
              ? Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="mx-3 h-9 rounded-lg" />
                ))
              : categories.map((category) => {
                  const Icon = iconMap[category.icon] || Package

                  return (
                    <Link
                      key={category.id}
                      href={`/products?category=${category.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                    >
                      <Icon className="h-4 w-4" />
                      {category.name}
                    </Link>
                  )
                })}
          </div>

          <Separator />

          <Link
            href="/profile/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
          >
            <Settings className="h-4 w-4" />
            Configuración
          </Link>

          {/* Tienda */}
          <Link
            href="/products"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Store className="h-4 w-4" />
            Ir a la Tienda
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}
