"use client"

import { Truck } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { CartItem } from "@/types"
import { WhatsAppCheckoutButton } from "./WhatsAppCheckoutButton"
import { formatCOP } from "@/lib/format-currency"

interface CartSummaryProps {
  items: CartItem[]
}

export function CartSummary({ items }: CartSummaryProps) {
  const subtotal = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  )
  const shipping = subtotal >= 200000 ? 0 : 15000
  const total = subtotal + shipping

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold">Resumen del Pedido</h2>

      <div className="mt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCOP(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Envio</span>
          <span>{shipping === 0 ? "Gratis" : formatCOP(shipping)}</span>
        </div>

        {shipping > 0 && (
          <div className="flex items-center gap-2 rounded-md bg-muted p-3 text-xs">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <span>
              Agrega {formatCOP(200000 - subtotal)} mas para envio gratis
            </span>
          </div>
        )}

        <Separator />

        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span className="text-lg text-primary">{formatCOP(total)}</span>
        </div>
      </div>

      <div className="mt-6">
        <WhatsAppCheckoutButton />
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Pedido via WhatsApp. Te contactaremos para confirmar.
      </p>
    </div>
  )
}
