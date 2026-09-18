"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { MessageSquare, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/stores/cart-store"
import {
  buildWhatsAppMessage,
  buildWhatsAppURL,
  WHATSAPP_PHONE,
} from "@/lib/whatsapp-message"

const PHONE_REGEX = /^\d{10,15}$/

export function WhatsAppCheckoutButton() {
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)
  const { data: session, status } = useSession()
  const router = useRouter()

  const isLoading = status === "loading"

  const handleClick = () => {
    if (!session) {
      router.push("/login?callbackUrl=/cart")
      return
    }

    if (!PHONE_REGEX.test(WHATSAPP_PHONE)) {
      toast.error("WhatsApp no configurado")
      return
    }

    const message = buildWhatsAppMessage(items)
    clearCart()
    window.open(buildWhatsAppURL(WHATSAPP_PHONE, message), "_blank")
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading || items.length === 0}
      className="w-full bg-green-600 hover:bg-green-700"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Cargando...
        </>
      ) : (
        <>
          <MessageSquare className="mr-2 h-4 w-4" />
          Pedir por WhatsApp
        </>
      )}
    </Button>
  )
}
