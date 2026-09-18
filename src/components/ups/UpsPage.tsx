"use client"

import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { buildServiceWhatsAppURL } from "@/lib/whatsapp-message"

function WhatsAppButton({ action, children }: { action: "technical-service" | "advisor"; children: React.ReactNode }) {
  const [error, setError] = useState("")
  const handleClick = () => {
    try { setError(""); window.open(buildServiceWhatsAppURL({ action }), "_blank", "noopener,noreferrer") }
    catch { setError("WhatsApp no está disponible. Comuníquese con nuestro equipo por otro medio.") }
  }
  return <div><Button onClick={handleClick} size="lg" className="bg-green-600 hover:bg-green-700">{children}</Button>{error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}</div>
}

export function UpsPage() {
  return <div className="bg-[#fcf9f8]">
    <div className="container mx-auto space-y-20 px-4 py-8 md:py-16">
      <section className="relative flex min-h-[480px] items-center overflow-hidden rounded-2xl bg-zinc-900 text-white">
        <Image src="/services/ups-hero.png" alt="Infraestructura de respaldo energético UPS" fill className="object-cover opacity-60" priority />
        <div className="relative z-10 max-w-2xl space-y-6 p-8 md:p-16"><p className="font-semibold uppercase tracking-[0.2em] text-orange-300">Servicio especializado</p><h1 className="text-4xl font-bold md:text-6xl">Servicio técnico para UPS</h1><p className="text-lg text-white/80">Mantenimiento, diagnóstico y alternativas para mantener disponible su infraestructura crítica.</p><WhatsAppButton action="technical-service">Solicitar servicio técnico</WhatsAppButton></div>
      </section>
      <section className="space-y-10"><div className="max-w-2xl"><p className="font-semibold text-primary">Acompañamiento especializado</p><h2 className="mt-2 text-3xl font-bold">Proteja la continuidad de su operación</h2></div><div className="grid gap-6 md:grid-cols-3">{[["Mantenimiento preventivo","Revise el estado de sus equipos y planifique intervenciones oportunas."],["Diagnóstico técnico","Identifique oportunidades de reparación, renovación y mejora."],["Soporte para infraestructura","Reciba orientación para sistemas de respaldo energético de misión crítica."]].map(([title,text]) => <article key={title} className="rounded-xl border bg-card p-6 shadow-sm"><h3 className="text-xl font-semibold">{title}</h3><p className="mt-3 text-muted-foreground">{text}</p></article>)}</div></section>
      <section className="grid items-center gap-10 md:grid-cols-2"><div className="space-y-5"><p className="font-semibold text-primary">Experiencia e infraestructura</p><h2 className="text-3xl font-bold">Un respaldo pensado para su operación</h2><p className="text-muted-foreground">Nuestro equipo puede acompañar la evaluación de mantenimiento, reparación o renovación según las condiciones reales de su instalación.</p><ul className="space-y-3 text-sm"><li>✓ Evaluación de sistemas de respaldo</li><li>✓ Recomendaciones según el contexto operativo</li><li>✓ Atención orientada a continuidad y seguridad</li></ul></div><Image src="/services/ups-data-center.png" alt="Centro de datos con infraestructura UPS" width={688} height={384} className="rounded-xl object-cover" /></section>
      <section className="rounded-2xl bg-zinc-900 p-8 text-center text-white md:p-12"><h2 className="text-3xl font-bold">¿Necesita mantenimiento para su UPS?</h2><p className="mx-auto mt-4 max-w-2xl text-white/80">Solicite una evaluación técnica de su sistema de respaldo energético y conozca las alternativas disponibles.</p><div className="mt-7 flex justify-center"><WhatsAppButton action="advisor">Contactar asesor</WhatsAppButton></div></section>
    </div>
  </div>
}
