"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ProductForm,
  type ProductFormData,
  type ProductFormInitialData,
  type UploadedImage,
} from "@/components/admin/ProductForm"

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [product, setProduct] = useState<ProductFormInitialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`)
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Producto no encontrado")
          }
          throw new Error("Error al cargar el producto")
        }

        const data = await response.json()

        // API now returns categoryId and supplierId directly
        const initialData: ProductFormInitialData = {
          name: data.name,
          slug: data.slug,
          sku: data.sku,
          description: data.description,
          price: data.price,
          comparePrice: data.comparePrice ?? null,
          cost: data.cost,
          margin: data.margin,
          unit: data.unit,
          minStock: data.minStock,
          stock: data.stock,
          status: data.status,
          categoryId: data.categoryId || "",
          supplierId: data.supplierId || "",
          isNew: data.isNew,
          isFeatured: data.isFeatured,
          specs: data.specs || {},
          images: data.images,
          warranty: data.warranty,
        }

        setProduct(initialData)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar el producto"
        )
        toast.error("Error al cargar el producto")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  const handleSubmit = async (data: ProductFormData, images: UploadedImage[]) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          images: images.map((img) => img.url),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al actualizar el producto")
      }

      toast.success("Producto actualizado exitosamente")
      router.push("/admin/products")
    } catch (err) {
      console.error("Error updating product:", err)
      toast.error(
        err instanceof Error ? err.message : "Error al actualizar el producto"
      )
      throw err
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Error</h1>
            <p className="text-muted-foreground">{error || "Producto no encontrado"}</p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/products">Volver a productos</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Producto</h1>
          <p className="text-muted-foreground">
            {product.name}
          </p>
        </div>
      </div>

      <ProductForm
        initialData={product}
        onSubmit={handleSubmit}
        isLoading={saving}
        submitLabel="Actualizar Producto"
      />
    </div>
  )
}
