"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  ProductForm,
  type ProductFormData,
  type UploadedImage,
} from "@/components/admin/ProductForm"

export default function NewProductPage() {
  const router = useRouter()

  const handleSubmit = async (data: ProductFormData, images: UploadedImage[]) => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          images: images.map((img) => img.url),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error creating product")
      }

      toast.success("Producto creado exitosamente")
      router.push("/admin/products")
    } catch (error) {
      console.error("Error creating product:", error)
      toast.error(
        error instanceof Error ? error.message : "Error al crear el producto"
      )
      throw error
    }
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
          <h1 className="text-2xl font-bold">Nuevo Producto</h1>
          <p className="text-muted-foreground">
            Agrega un nuevo producto al catalogo
          </p>
        </div>
      </div>

      <ProductForm
        onSubmit={handleSubmit}
        submitLabel="Crear Producto"
      />
    </div>
  )
}
