import type { CartItem } from "@/types"
import { formatCOP } from "@/lib/format-currency"

const MAX_ITEMS = 20

/**
 * Build a formatted WhatsApp message from cart items.
 * Format: one line per product "{name} x{qty} — {price_cop}",
 * truncated at 20 items with a "+N more items..." suffix,
 * ending with "Total: {total_cop}".
 */
export function buildWhatsAppMessage(items: CartItem[]): string {
  const lines: string[] = []

  const visible = items.slice(0, MAX_ITEMS)
  for (const item of visible) {
    const linePrice = item.product.price * item.quantity
    lines.push(`${item.product.name} x${item.quantity} — ${formatCOP(linePrice)}`)
  }

  const remaining = items.length - MAX_ITEMS
  if (remaining > 0) {
    lines.push(`+${remaining} more items...`)
  }

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )
  lines.push(`Total: ${formatCOP(total)}`)

  return lines.join("\n")
}

/**
 * Build a WhatsApp deep-link URL.
 * Phone must be digits only (country code + number, no + or spaces).
 */
export function buildWhatsAppURL(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}
