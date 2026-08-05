import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { toast } from "sonner"
import type { Product, CartItem } from "@/types"

interface CartState {
  items: CartItem[]

  // Actions
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void

  // Computed helpers
  getSubtotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          )

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            }
          }

          return {
            items: [...state.items, { product, quantity }],
          }
        })
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }))
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        )
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: "energyMSI-cart",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persistedState: unknown) => {
        const state = persistedState as { items?: CartItem[] } | undefined
        if (!state?.items || state.items.length === 0) {
          return { items: [] }
        }

        // Check if items have the new Product shape (sku + supplier fields)
        const firstItem = state.items[0]
        const isNewShape =
          firstItem.product &&
          "sku" in firstItem.product &&
          "supplier" in firstItem.product

        if (!isNewShape) {
          // Old cart shape detected — clear and notify
          toast.info(
            "Tu carrito fue actualizado. Por favor, agrega los productos nuevamente."
          )
          return { items: [] }
        }

        return { items: state.items }
      },
    }
  )
)
