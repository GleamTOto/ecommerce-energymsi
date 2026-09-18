import type { CartItem } from "@/types"
import { formatCOP } from "@/lib/format-currency"

const MAX_ITEMS = 20
const PHONE_REGEX = /^\d{10,15}$/

// Canonical business WhatsApp number, matching the number shown in the footer.
export const WHATSAPP_PHONE = "573114316782"
export const WHATSAPP_DISPLAY_PHONE = "+57 311 431 6782"

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
  if (!PHONE_REGEX.test(phone)) {
    throw new Error("Invalid WhatsApp phone configuration")
  }
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

export type ServiceWhatsAppAction = "technical-service" | "advisor" | "solar-quote"

export interface ServiceWhatsAppContext {
  action: ServiceWhatsAppAction
  name?: string
  phone?: string
  city?: string
  company?: string
  installationType?: string
  monthlyKwh?: number
  billValue?: number
  batteryBackup?: boolean
  message?: string
  estimateSummary?: string
}

export function buildServiceWhatsAppMessage(context: ServiceWhatsAppContext): string {
  const labels: Record<ServiceWhatsAppAction, string> = {
    "technical-service": "Solicitud de servicio técnico UPS",
    advisor: "Solicitud de contacto con asesor UPS",
    "solar-quote": "Solicitud de cotización solar",
  }
  const fields = [
    `Página: ${context.action === "solar-quote" ? "Soluciones solares" : "Servicio técnico UPS"}`,
    `Acción: ${labels[context.action]}`,
    context.name && `Nombre: ${context.name}`,
    context.phone && `Teléfono: ${context.phone}`,
    context.company && `Empresa: ${context.company}`,
    context.city && `Ciudad: ${context.city}`,
    context.installationType && `Tipo de instalación: ${context.installationType}`,
    context.monthlyKwh !== undefined && `Consumo mensual aproximado: ${context.monthlyKwh} kWh`,
    context.billValue !== undefined && `Última factura aproximada: ${context.billValue}`,
    context.batteryBackup !== undefined && `Respaldo con batería: ${context.batteryBackup ? "Sí" : "No"}`,
    context.message && `Mensaje: ${context.message}`,
    context.estimateSummary && `Resumen del estimador: ${context.estimateSummary}`,
    context.action === "solar-quote" && "Estado: estimación informativa; requiere evaluación técnica.",
  ].filter(Boolean)
  return fields.join("\n")
}

export function buildServiceWhatsAppURL(context: ServiceWhatsAppContext): string {
  return buildWhatsAppURL(WHATSAPP_PHONE, buildServiceWhatsAppMessage(context))
}
