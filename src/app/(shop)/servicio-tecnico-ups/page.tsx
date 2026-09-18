import type { Metadata } from "next"
import { UpsPage } from "@/components/ups/UpsPage"

export const metadata: Metadata = { title: "Servicio técnico UPS | EnergyMSI", description: "Mantenimiento y soporte técnico para sistemas UPS." }
export default function Page() { return <UpsPage /> }
