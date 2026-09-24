"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, X, Clock, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"

const SEARCH_HISTORY_KEY = "ecommerce-search-history"
const MAX_HISTORY_ITEMS = 10

// Autocomplete result shape from /api/products/autocomplete
interface AutocompleteResult {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  category: string
  stock: number
}

// localStorage helpers
function getSearchHistory(): string[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveSearchToHistory(query: string): void {
  if (typeof window === "undefined" || !query.trim()) return
  try {
    const history = getSearchHistory()
    const normalizedQuery = query.trim().toLowerCase()
    // Remove duplicate if exists, then add to front
    const filtered = history.filter(
      (item) => item.toLowerCase() !== normalizedQuery
    )
    const updated = [normalizedQuery, ...filtered].slice(0, MAX_HISTORY_ITEMS)
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated))
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

function clearSearchHistory(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY)
  } catch {
    // Silently fail
  }
}

export function SearchBar({ mobile = false }: { mobile?: boolean }) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<AutocompleteResult[]>([])
  const [history, setHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load search history on mount
  useEffect(() => {
    setHistory(getSearchHistory())
  }, [])

  // Server-side autocomplete with debounce + AbortController
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setIsOpen(false)
      return
    }

    // Cancel previous request
    abortControllerRef.current?.abort()

    // Debounce 300ms
    debounceTimerRef.current = setTimeout(async () => {
      const controller = new AbortController()
      abortControllerRef.current = controller

      try {
        const res = await fetch(
          `/api/products/autocomplete?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        )
        if (!res.ok) throw new Error("Autocomplete failed")
        const data: AutocompleteResult[] = await res.json()
        setResults(data)
        setIsOpen(true)
        setShowHistory(false)
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return
        setResults([]) // graceful: empty dropdown on error
      }
    }, 300)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [query])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setShowHistory(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleFocus = () => {
    if (query.trim() && results.length > 0) {
      setIsOpen(true)
      setShowHistory(false)
    } else if (!query.trim() && history.length > 0) {
      setShowHistory(true)
      setIsOpen(false)
    }
  }

  const handleSelect = () => {
    // Keep the query text in the input, just close the dropdown
    setIsOpen(false)
    setShowHistory(false)
  }

  const handleHistorySelect = (historyItem: string) => {
    setQuery(historyItem)
    setShowHistory(false)
    setIsOpen(true)
  }

  const handleClear = () => {
    setQuery("")
    setResults([])
    setIsOpen(false)
    setShowHistory(false)
  }

  const handleClearHistory = () => {
    clearSearchHistory()
    setHistory([])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      saveSearchToHistory(query)
      setHistory(getSearchHistory())
      // Navigate to search results page
      window.location.href = `/products?search=${encodeURIComponent(query)}`
    }
  }

  // Save to history when selecting a product
  const handleProductClick = (productName: string) => {
    setQuery(productName)
    saveSearchToHistory(productName)
    setHistory(getSearchHistory())
    handleSelect()
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        placeholder="Buscar productos..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        className={`${mobile ? "w-full" : "w-full"} pl-10 pr-10`}
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Search History Dropdown */}
      {showHistory && history.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border bg-card shadow-lg z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Búsquedas recientes
            </span>
            <button
              onClick={handleClearHistory}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" />
              Limpiar
            </button>
          </div>
          {history.map((item, index) => (
            <button
              key={`${item}-${index}`}
              onClick={() => handleHistorySelect(item)}
              className="flex items-center gap-3 w-full px-3 py-2 hover:bg-accent transition-colors text-left border-b last:border-b-0"
            >
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-foreground">{item}</span>
            </button>
          ))}
        </div>
      )}

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 max-h-[70vh] overflow-y-auto rounded-lg border bg-card shadow-lg z-50">
          {results.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              onClick={() => handleProductClick(product.name)}
              className="flex items-center gap-3 p-3 hover:bg-accent transition-colors border-b last:border-b-0"
            >
              {/* Product Image */}
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-white p-1">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-contain"
                    sizes="48px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {product.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {product.category}
                </p>
              </div>

              {/* Price */}
              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-semibold text-primary">
                  ${product.price.toLocaleString("es-CO")}
                </p>
                {product.stock > 0 ? (
                  <p className="text-xs text-green-600">En stock</p>
                ) : (
                  <p className="text-xs text-red-500">Agotado</p>
                )}
              </div>
            </Link>
          ))}

          {/* View All Link */}
          <Link
            href={`/products?search=${encodeURIComponent(query)}`}
            onClick={() => {
              saveSearchToHistory(query)
              setHistory(getSearchHistory())
              handleSelect()
            }}
            className="flex items-center justify-center p-3 text-sm font-medium text-primary hover:bg-accent transition-colors border-t"
          >
            Ver todos los resultados para &quot;{query}&quot;
          </Link>
        </div>
      )}

      {/* No Results State */}
      {isOpen && query.trim() && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border bg-card shadow-lg z-50 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No se encontraron resultados para &quot;<span className="font-medium text-foreground">{query}</span>&quot;
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Intenta con otras palabras clave
          </p>
        </div>
      )}
    </div>
  )
}
