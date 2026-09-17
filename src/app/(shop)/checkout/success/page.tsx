"use client"

import { useEffect } from "react"
import Link from "next/link"
import { CheckCircle, MessageCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCartStore } from "@/stores/cart-store"

export default function CheckoutSuccessPage() {
  const clearCart = useCartStore((state) => state.clearCart)

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <div className="container max-w-lg py-12">
      <Card className="text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Pedido enviado</CardTitle>
          <CardDescription>
            Te contactaremos por WhatsApp para confirmar tu pedido.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center justify-center gap-2 text-sm">
              <MessageCircle className="h-4 w-4" />
              <span>Recibiras una respuesta por WhatsApp pronto</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/profile/orders">
                Ver mis pedidos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/products">
                Seguir comprando
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
