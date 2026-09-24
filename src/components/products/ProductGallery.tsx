"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ProductImage } from "@/components/products/ProductImage"

interface ProductGalleryProps {
  images: string[]
  productName: string
  description?: string
}

export function ProductGallery({ images, productName, description }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const currentImage = images[selectedIndex]

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-white p-6">
        <ProductImage
          src={currentImage}
          alt={productName}
          fit="contain"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 bg-white p-1 transition-colors",
                selectedIndex === index
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground/50"
              )}
            >
              <ProductImage
                src={image}
                alt={`${productName} - ${index + 1}`}
                fit="contain"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Description */}
      {description && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Descripcion</h3>
          <div className="text-sm text-muted-foreground space-y-3">
            {description
              .split("\n\n")
              .filter((paragraph) => paragraph.trim())
              .map((paragraph, index) => (
                <p key={index} className="whitespace-pre-line">
                  {paragraph}
                </p>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
