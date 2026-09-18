"use client"

import { useEffect, useState } from "react"
import { ArrowDown, ArrowUp, GripVertical, Loader2, Save, X } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductImage } from "@/components/products/ProductImage"

interface HeroProduct {
  id: string
  name: string
  images?: string[]
  isNew: boolean
  isFeatured: boolean
  status: string
}

function ProductRow({ product, controls }: { product: HeroProduct; controls: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <GripVertical className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
        <ProductImage src={product.images?.[0]} alt={product.name} sizes="56px" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{product.name}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {product.isFeatured && <Badge variant="default">Destacado</Badge>}
          {product.isNew && <Badge variant="secondary">Nuevo</Badge>}
          <Badge variant={product.status === "ACTIVE" ? "outline" : "destructive"}>{product.status}</Badge>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">{controls}</div>
    </div>
  )
}

export default function HeroBannerAdminPage() {
  const [selected, setSelected] = useState<HeroProduct[]>([])
  const [available, setAvailable] = useState<HeroProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/hero-banner")
      .then(async (response) => {
        if (!response.ok) throw new Error("No se pudo cargar la configuracion")
        return response.json()
      })
      .then((data) => {
        setSelected(data.selected ?? [])
        setAvailable(data.available ?? [])
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false))
  }, [])

  const addProduct = (product: HeroProduct) => {
    setSelected((current) => [...current, product])
  }

  const removeProduct = (id: string) => {
    setSelected((current) => current.filter((product) => product.id !== id))
  }

  const moveProduct = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= selected.length) return
    setSelected((current) => {
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const save = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/hero-banner", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: selected.map((product) => product.id) }),
      })
      if (!response.ok) throw new Error("No se pudo guardar la configuracion")
      toast.success("HeroBanner actualizado")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar la configuracion")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>

  const selectedIds = new Set(selected.map((product) => product.id))
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Productos del HeroBanner</h1>
          <p className="text-muted-foreground">Selecciona productos destacados o nuevos y define el orden del carrusel.</p>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar orden
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seleccionados ({selected.length})</CardTitle>
          <CardDescription>El orden guardado se muestra primero en el HeroBanner. Usa los controles accesibles para reordenar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {selected.length === 0 && <p className="text-sm text-muted-foreground">No hay productos configurados. Se usara el fallback de productos destacados.</p>}
          {selected.map((product, index) => (
            <ProductRow key={product.id} product={product} controls={
              <>
                <Button variant="ghost" size="icon-sm" aria-label={`Mover ${product.name} arriba`} disabled={index === 0} onClick={() => moveProduct(index, -1)}><ArrowUp /></Button>
                <Button variant="ghost" size="icon-sm" aria-label={`Mover ${product.name} abajo`} disabled={index === selected.length - 1} onClick={() => moveProduct(index, 1)}><ArrowDown /></Button>
                <Button variant="ghost" size="icon-sm" aria-label={`Quitar ${product.name}`} onClick={() => removeProduct(product.id)}><X /></Button>
              </>
            } />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Productos destacados o nuevos disponibles</CardTitle>
          <CardDescription>Estos productos provienen de la base de datos y tienen activa la marca Destacado o Nuevo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {available.map((product) => (
            <ProductRow key={product.id} product={product} controls={
              <Button variant="outline" size="sm" disabled={selectedIds.has(product.id)} onClick={() => addProduct(product)}>
                {selectedIds.has(product.id) ? "Seleccionado" : "Agregar"}
              </Button>
            } />
          ))}
          {available.length === 0 && <p className="text-sm text-muted-foreground">No hay productos marcados como destacados o nuevos.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
