"use client"

import { useState } from "react"
import Image from "next/image"
import { Package } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface ProductImageProps {
  src?: string
  alt: string
  className?: string
  priority?: boolean
  sizes?: string
  fill?: boolean
  fit?: "cover" | "contain"
}

export function ProductImage({
  src,
  alt,
  className,
  priority = false,
  sizes,
  fill = true,
  fit = "cover",
}: ProductImageProps) {
  const [imgError, setImgError] = useState(false)

  const showSkeleton = !src || imgError

  if (showSkeleton) {
    return (
      <Skeleton className={cn("flex items-center justify-center", className)}>
        <Package className="h-8 w-8 text-muted-foreground/50" />
      </Skeleton>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={cn(fit === "contain" ? "object-contain" : "object-cover", className)}
      sizes={sizes}
      priority={priority}
      onError={() => setImgError(true)}
    />
  )
}
