"use client"

import * as React from "react"
import Link from "next/link"
import Autoplay from "embla-carousel-autoplay"
import { Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { ProductImage } from "@/components/products/ProductImage"
import { formatCOP } from "@/lib/format-currency"
import type { Product } from "@/types"

const gradients = [
  "from-violet-900 via-purple-900 to-slate-900",
  "from-blue-900 via-cyan-900 to-slate-900",
  "from-emerald-900 via-teal-900 to-slate-900",
]

async function fetchProducts(signal: AbortSignal) {
  const response = await fetch("/api/hero-banner", { signal })
  if (!response.ok) {
    throw new Error(`Product request failed with status ${response.status}`)
  }

  const data: { products?: Product[] } = await response.json()
  return data.products ?? []
}

export function HeroBanner() {
  const [products, setProducts] = React.useState<Product[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )

  React.useEffect(() => {
    const controller = new AbortController()

    async function loadProducts() {
      try {
        setProducts((await fetchProducts(controller.signal)).slice(0, 3))
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("[HeroBanner] Error fetching products:", error)
          setProducts([])
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    void loadProducts()
    return () => controller.abort()
  }, [])

  // Take first 3 products or pad with empty slides
  const slides = products.slice(0, 3).map((product, index) => ({
    id: product.id,
    product,
    gradient: gradients[index % gradients.length],
  }))

  if (isLoading) {
    return (
      <section className="relative min-h-[420px] animate-pulse bg-slate-900" aria-label="Loading products">
        <div className="container mx-auto flex min-h-[420px] items-center justify-center px-4">
          <div className="h-8 w-48 rounded bg-white/10" />
        </div>
      </section>
    )
  }

  if (slides.length === 0) {
    return null
  }

  return (
    <section className="relative">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          {slides.map((slide) => {
            const hasImage = slide.product.images && slide.product.images.length > 0
            return (
              <CarouselItem key={slide.id}>
                <div className={`relative overflow-hidden bg-gradient-to-br ${slide.gradient}`}>
                  {/* Background Product Image */}
                  {hasImage && (
                    <div className="absolute inset-0 opacity-20">
                      <ProductImage
                        src={slide.product.images?.[0]}
                        alt=""
                        className="w-full h-full"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
                      {/* Text Content */}
                      <div className="max-w-xl text-center lg:text-left">
                        <span className="inline-block rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white mb-3">
                          {slide.product.isNew ? "Nuevo" : slide.product.isFeatured ? "Destacado" : "Disponible"}
                        </span>
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                          {slide.product.name}
                          <span className="block text-primary">{formatCOP(slide.product.price)}</span>
                        </h2>
                        <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-md mx-auto lg:mx-0">
                          {slide.product.description || `Producto de la categoría ${slide.product.category}`}
                        </p>
                        <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                          <Button asChild size="default">
                            <Link href={`/products/${slide.product.slug}`}>Ver Producto</Link>
                          </Button>
                          <Button asChild variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                            <Link href="/products">Ver Todo</Link>
                          </Button>
                        </div>
                      </div>

                      {/* Visual Element */}
                      <div className="relative w-72 h-52 sm:w-96 sm:h-72 lg:w-[500px] lg:h-80">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-3xl rounded-full" />
                        <div className="relative h-full overflow-hidden shadow-2xl rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 p-4">
                          {hasImage ? (
                            <ProductImage
                              src={slide.product.images?.[0]}
                              alt={slide.product.name}
                              fit="contain"
                              className="w-full h-full"
                            />
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center gap-4">
                              <div className="rounded-full bg-white/10 p-6">
                                <Zap className="h-16 w-16 text-primary" />
                              </div>
                              <p className="text-sm text-white/60 text-center">
                                Producto destacado
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            )
          })}
        </CarouselContent>

        {/* Navigation Arrows */}
        <CarouselPrevious className="left-4 hidden sm:flex" />
        <CarouselNext className="right-4 hidden sm:flex" />

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className="h-1.5 w-6 rounded-full bg-white/30 transition-colors"
            />
          ))}
        </div>
      </Carousel>
    </section>
  )
}
