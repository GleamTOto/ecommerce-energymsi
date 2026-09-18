import type { Metadata } from "next"
import { SolarPage } from "@/components/solar/SolarPage"

export const metadata: Metadata = { title: "Soluciones solares | EnergyMSI", description: "Conozca soluciones solares y una estimación informativa para su proyecto." }
export default function Page() { return <SolarPage /> }
