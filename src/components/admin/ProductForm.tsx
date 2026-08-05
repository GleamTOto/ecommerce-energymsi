"use client"

import { useEffect, useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImageUpload } from "@/components/admin/ImageUpload"
import { ProductSpecsEditor } from "@/components/admin/ProductSpecsEditor"

// ── Zod Schema ──────────────────────────────────────────────────────────────

export const productFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  slug: z.string().min(1, "El slug es requerido"),
  sku: z.string().min(1, "El SKU es requerido"),
  description: z.string().min(1, "La descripcion es requerida"),
  price: z.number().min(0, "El precio debe ser mayor a 0"),
  comparePrice: z.number().optional().nullable(),
  cost: z.number().min(0, "El costo debe ser mayor o igual a 0"),
  margin: z.number().min(0).max(100, "El margen debe ser entre 0 y 100"),
  unit: z.string().min(1, "La unidad es requerida"),
  minStock: z.number().min(0, "El stock minimo debe ser mayor o igual a 0"),
  stock: z.number().min(0, "El stock debe ser mayor o igual a 0"),
  status: z.enum(["ACTIVE", "INACTIVE", "OUT_OF_STOCK"]),
  categoryId: z.string().min(1, "La categoria es requerida"),
  supplierId: z.string().min(1, "El proveedor es requerido"),
  isNew: z.boolean(),
  isFeatured: z.boolean(),
  specs: z.record(z.string(), z.string()),
})

export type ProductFormData = z.infer<typeof productFormSchema>

// ── Types ───────────────────────────────────────────────────────────────────

export interface UploadedImage {
  url: string
  publicId: string
}

export interface ProductFormInitialData {
  name: string
  slug: string
  sku: string
  description: string
  price: number
  comparePrice?: number | null
  cost: number
  margin: number
  unit: string
  minStock: number
  stock: number
  status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK"
  categoryId: string
  supplierId: string
  isNew: boolean
  isFeatured: boolean
  specs: Record<string, string>
  images?: string[]
}

interface CategoryOption {
  id: string
  name: string
  slug: string
}

interface SupplierOption {
  id: string
  name: string
  slug: string
}

interface ProductFormProps {
  initialData?: ProductFormInitialData
  onSubmit: (data: ProductFormData, images: UploadedImage[]) => Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

// ── Component ───────────────────────────────────────────────────────────────

export function ProductForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel = "Guardar Producto",
}: ProductFormProps) {
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [images, setImages] = useState<UploadedImage[]>([])
  const [specs, setSpecs] = useState<Record<string, string>>(
    initialData?.specs || {}
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          slug: initialData.slug,
          sku: initialData.sku,
          description: initialData.description,
          price: initialData.price,
          comparePrice: initialData.comparePrice ?? null,
          cost: initialData.cost,
          margin: initialData.margin,
          unit: initialData.unit,
          minStock: initialData.minStock,
          stock: initialData.stock,
          status: initialData.status,
          categoryId: initialData.categoryId,
          supplierId: initialData.supplierId,
          isNew: initialData.isNew,
          isFeatured: initialData.isFeatured,
          specs: initialData.specs,
        }
      : {
          isNew: false,
          isFeatured: false,
          stock: 0,
          cost: 0,
          margin: 0,
          unit: "UNIDAD",
          minStock: 0,
          status: "ACTIVE" as const,
          specs: {},
        },
  })

  // Set images from initialData
  useEffect(() => {
    if (initialData?.images) {
      setImages(initialData.images.map((url) => ({ url, publicId: "" })))
    }
  }, [initialData?.images])

  // Fetch categories and suppliers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, suppliersRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/suppliers"),
        ])
        const categoriesData = await categoriesRes.json()
        const suppliersData = await suppliersRes.json()
        setCategories(categoriesData || [])
        setSuppliers(suppliersData || [])
      } catch (error) {
        console.error("Error fetching options:", error)
      } finally {
        setLoadingOptions(false)
      }
    }
    fetchData()
  }, [])

  // Auto-calculate margin when price or cost changes
  const price = watch("price")
  const cost = watch("cost")

  useEffect(() => {
    if (price > 0 && cost >= 0) {
      const calculatedMargin = ((price - cost) / price) * 100
      setValue("margin", Math.round(calculatedMargin * 100) / 100)
    }
  }, [price, cost, setValue])

  // Stable callback for specs changes
  const handleSpecsChange = useCallback((newSpecs: Record<string, string>) => {
    setSpecs(newSpecs)
    setValue("specs", newSpecs)
  }, [setValue])

  const handleFormSubmit = async (data: ProductFormData) => {
    await onSubmit({ ...data, specs }, images)
  }

  if (loadingOptions) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informacion Basica</CardTitle>
          <CardDescription>Datos principales del producto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                placeholder="Nombre del producto"
                {...register("name", {
                  onChange: (e) => {
                    if (!initialData) {
                      setValue("slug", generateSlug(e.target.value))
                    }
                  },
                })}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                placeholder="nombre-del-producto"
                {...register("slug")}
              />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                placeholder="NET-001"
                {...register("sku")}
              />
              {errors.sku && (
                <p className="text-sm text-destructive">{errors.sku.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unidad</Label>
              <Select
                onValueChange={(value) => setValue("unit", value)}
                defaultValue={initialData?.unit || "UNIDAD"}
              >
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Seleccionar unidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNIDAD">UNIDAD</SelectItem>
                  <SelectItem value="CAJA">CAJA</SelectItem>
                  <SelectItem value="PAQUETE">PAQUETE</SelectItem>
                  <SelectItem value="ROLLO">ROLLO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <Textarea
              id="description"
              placeholder="Descripcion detallada del producto"
              rows={4}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Categoria</Label>
              <Select
                onValueChange={(value) => setValue("categoryId", value)}
                defaultValue={initialData?.categoryId}
              >
                <SelectTrigger id="categoryId">
                  <SelectValue placeholder="Seleccionar categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-destructive">{errors.categoryId.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplierId">Proveedor</Label>
              <Select
                onValueChange={(value) => setValue("supplierId", value)}
                defaultValue={initialData?.supplierId}
              >
                <SelectTrigger id="supplierId">
                  <SelectValue placeholder="Seleccionar proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.supplierId && (
                <p className="text-sm text-destructive">{errors.supplierId.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Inventory */}
      <Card>
        <CardHeader>
          <CardTitle>Precio e Inventario</CardTitle>
          <CardDescription>Configura precio y disponibilidad</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price">Precio Venta ($)</Label>
              <Input
                id="price"
                type="number"
                step="1"
                placeholder="0"
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Costo Compra ($)</Label>
              <Input
                id="cost"
                type="number"
                step="1"
                placeholder="0"
                {...register("cost", { valueAsNumber: true })}
              />
              {errors.cost && (
                <p className="text-sm text-destructive">{errors.cost.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="comparePrice">Precio Comparar (opcional)</Label>
              <Input
                id="comparePrice"
                type="number"
                step="1"
                placeholder="0"
                {...register("comparePrice", { valueAsNumber: true })}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="margin">Margen (%)</Label>
              <Input
                id="margin"
                type="number"
                step="0.01"
                placeholder="0"
                readOnly
                {...register("margin", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">Calculado automaticamente</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                placeholder="0"
                {...register("stock", { valueAsNumber: true })}
              />
              {errors.stock && (
                <p className="text-sm text-destructive">{errors.stock.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStock">Stock Minimo</Label>
              <Input
                id="minStock"
                type="number"
                placeholder="0"
                {...register("minStock", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                onValueChange={(value) =>
                  setValue("status", value as "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK")
                }
                defaultValue={initialData?.status || "ACTIVE"}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Activo</SelectItem>
                  <SelectItem value="INACTIVE">Inactivo</SelectItem>
                  <SelectItem value="OUT_OF_STOCK">Agotado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Imagenes</CardTitle>
          <CardDescription>Sube las imagenes del producto (maximo 5)</CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload
            value={images}
            onChange={setImages}
            maxImages={5}
          />
        </CardContent>
      </Card>

      {/* Specs */}
      <Card>
        <CardHeader>
          <CardTitle>Especificaciones</CardTitle>
          <CardDescription>Agrega especificaciones tecnicas del producto</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductSpecsEditor value={specs} onChange={handleSpecsChange} />
        </CardContent>
      </Card>

      {/* Options */}
      <Card>
        <CardHeader>
          <CardTitle>Opciones</CardTitle>
          <CardDescription>Configuraciones adicionales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isNew"
              checked={watch("isNew")}
              onCheckedChange={(checked) => setValue("isNew", !!checked)}
            />
            <Label htmlFor="isNew" className="font-normal">
              Marcar como producto nuevo
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isFeatured"
              checked={watch("isFeatured")}
              onCheckedChange={(checked) => setValue("isFeatured", !!checked)}
            />
            <Label htmlFor="isFeatured" className="font-normal">
              Mostrar en productos destacados
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  )
}
