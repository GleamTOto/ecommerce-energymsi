"use client"

import Image from "next/image"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { calculateEstimate, solarAssumptionsText, type SolarEstimate } from "@/lib/solar-calculator"
import { buildServiceWhatsAppURL } from "@/lib/whatsapp-message"

const calculatorSchema = z.object({
  monthlyKwh: z.coerce.number().positive("Ingrese un consumo mayor que cero").max(100000, "Ingrese un valor menor a 100.000"),
  billValue: z.coerce.number().positive("Ingrese un valor mayor que cero").max(1_000_000_000, "Ingrese un valor válido"),
  city: z.string().trim().min(2, "Ingrese la ciudad"),
  installationType: z.enum(["rooftop", "ground", "mixed"]),
  batteryBackup: z.boolean(),
})
type CalculatorValues = z.input<typeof calculatorSchema>
type CalculatorOutput = z.output<typeof calculatorSchema>

const quoteSchema = z.object({
  name: z.string().trim().min(2, "Ingrese su nombre").max(100),
  company: z.string().trim().max(100).optional(),
  phone: z.string().trim().min(7, "Ingrese un teléfono válido").max(30),
  email: z.string().email("Ingrese un correo válido").optional().or(z.literal("")),
  city: z.string().trim().min(2, "Ingrese la ciudad").max(100),
  monthlyKwh: z.coerce.number().positive("Ingrese el consumo aproximado").max(100000),
  billValue: z.coerce.number().positive("Ingrese el valor aproximado").max(1_000_000_000),
  installationType: z.enum(["rooftop", "ground", "mixed"]),
  batteryBackup: z.boolean(),
  message: z.string().max(1000).optional(),
})
type QuoteValues = z.input<typeof quoteSchema>
type QuoteOutput = z.output<typeof quoteSchema>

const errorText = (message: string | undefined, id: string) => message && <p id={id} className="mt-1 text-sm text-destructive">{message}</p>

function SolarCalculator({ onEstimate }: { onEstimate: (estimate: SolarEstimate) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<CalculatorValues, unknown, CalculatorOutput>({ resolver: zodResolver(calculatorSchema), defaultValues: { installationType: "rooftop", batteryBackup: false } })
  return <form onSubmit={handleSubmit((values) => onEstimate(calculateEstimate(values)))} className="space-y-4 rounded-xl border bg-card p-6">
    <div><Label htmlFor="calculator-monthly-kwh">Consumo mensual (kWh)</Label><Input id="calculator-monthly-kwh" type="number" min="1" {...register("monthlyKwh")} aria-invalid={!!errors.monthlyKwh} aria-describedby={errors.monthlyKwh ? "calculator-monthly-kwh-error" : undefined} />{errorText(errors.monthlyKwh?.message, "calculator-monthly-kwh-error")}</div>
    <div><Label htmlFor="calculator-bill-value">Valor promedio de factura (COP)</Label><Input id="calculator-bill-value" type="number" min="1" {...register("billValue")} aria-invalid={!!errors.billValue} aria-describedby={errors.billValue ? "calculator-bill-value-error" : undefined} />{errorText(errors.billValue?.message, "calculator-bill-value-error")}</div>
    <div><Label htmlFor="calculator-city">Ciudad</Label><Input id="calculator-city" {...register("city")} aria-invalid={!!errors.city} aria-describedby={errors.city ? "calculator-city-error" : undefined} />{errorText(errors.city?.message, "calculator-city-error")}</div>
     <fieldset aria-invalid={!!errors.installationType} aria-describedby={`calculator-installation-type-help${errors.installationType ? " calculator-installation-type-error" : ""}`}><legend className="mb-2 text-sm font-medium">Tipo de instalación</legend><p id="calculator-installation-type-help" className="mb-2 text-sm text-muted-foreground">Seleccione la ubicación principal de los paneles.</p><div className="grid gap-2 sm:grid-cols-3">{[["rooftop", "Techo"], ["ground", "Suelo"], ["mixed", "Mixta"]].map(([value, label]) => <label key={value} htmlFor={`calculator-installation-${value}`} className="flex items-center gap-2 text-sm"><input id={`calculator-installation-${value}`} type="radio" value={value} {...register("installationType")} aria-invalid={!!errors.installationType} aria-describedby={`calculator-installation-type-help${errors.installationType ? " calculator-installation-type-error" : ""}`} />{label}</label>)}</div>{errorText(errors.installationType?.message, "calculator-installation-type-error")}</fieldset>
     <div><label htmlFor="calculator-battery-backup" className="flex items-center gap-2 text-sm"><input id="calculator-battery-backup" type="checkbox" {...register("batteryBackup")} aria-invalid={!!errors.batteryBackup} aria-describedby="calculator-battery-backup-help" />Requiero respaldo con batería</label><p id="calculator-battery-backup-help" className="ml-6 text-sm text-muted-foreground">Indique si necesita respaldo durante interrupciones.</p></div>
    <Button type="submit" className="w-full">Calcular estimación informativa</Button>
  </form>
}

function EstimateResult({ estimate }: { estimate: SolarEstimate | null }) {
  if (!estimate) return <div className="flex min-h-full items-center rounded-xl bg-muted p-6 text-muted-foreground">Complete los datos para consultar una estimación aproximada.</div>
  return <div aria-live="polite" className="space-y-5 rounded-xl bg-zinc-900 p-6 text-white"><p className="font-semibold text-orange-300">Resultado aproximado</p><div className="grid gap-4 sm:grid-cols-2"><div><p className="text-sm text-white/60">Consumo analizado</p><p className="text-2xl font-bold">{estimate.monthlyKwh} kWh/mes</p></div><div><p className="text-sm text-white/60">Sistema estimado</p><p className="text-2xl font-bold">{estimate.estimatedKwp} kWp</p></div><div><p className="text-sm text-white/60">Generación de referencia</p><p className="text-2xl font-bold">{estimate.estimatedGeneration} kWh/mes</p></div><div><p className="text-sm text-white/60">Respaldo</p><p className="text-2xl font-bold">{estimate.batteryBackup ? "Solicitado" : "No solicitado"}</p></div></div><p className="text-sm text-white/70">{solarAssumptionsText}</p></div>
}

function QuoteForm({ estimate }: { estimate: SolarEstimate | null }) {
  const [status, setStatus] = useState("")
  const { register, handleSubmit, formState: { errors } } = useForm<QuoteValues, unknown, QuoteOutput>({ resolver: zodResolver(quoteSchema), defaultValues: { installationType: "rooftop", batteryBackup: false }, shouldFocusError: true })
  const onSubmit = (values: QuoteOutput) => {
    try {
      setStatus("")
      const estimateSummary = estimate ? `${estimate.estimatedKwp} kWp / ${estimate.estimatedGeneration} kWh/mes` : undefined
      window.open(buildServiceWhatsAppURL({ action: "solar-quote", ...values, estimateSummary }), "_blank", "noopener,noreferrer")
      setStatus("WhatsApp se abrió con sus datos. La información no se almacena en este sitio.")
    } catch { setStatus("No fue posible abrir WhatsApp. Revise la configuración del destino e inténtelo nuevamente.") }
  }
  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-2xl border bg-card p-6 md:p-10">
    <div className="grid gap-4 md:grid-cols-2"><div><Label htmlFor="quote-name">Nombre *</Label><Input id="quote-name" {...register("name")} aria-invalid={!!errors.name} aria-describedby={errors.name ? "quote-name-error" : undefined} />{errorText(errors.name?.message, "quote-name-error")}</div><div><Label htmlFor="quote-company">Empresa</Label><Input id="quote-company" {...register("company")} aria-invalid={!!errors.company} aria-describedby={errors.company ? "quote-company-error" : undefined} />{errorText(errors.company?.message, "quote-company-error")}</div><div><Label htmlFor="quote-phone">Teléfono *</Label><Input id="quote-phone" {...register("phone")} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "quote-phone-error" : undefined} />{errorText(errors.phone?.message, "quote-phone-error")}</div><div><Label htmlFor="quote-email">Correo electrónico</Label><Input id="quote-email" type="email" {...register("email")} aria-invalid={!!errors.email} aria-describedby={errors.email ? "quote-email-error" : undefined} />{errorText(errors.email?.message, "quote-email-error")}</div><div><Label htmlFor="quote-city">Ciudad *</Label><Input id="quote-city" {...register("city")} aria-invalid={!!errors.city} aria-describedby={errors.city ? "quote-city-error" : undefined} />{errorText(errors.city?.message, "quote-city-error")}</div><div><Label htmlFor="quote-kwh">Consumo mensual aproximado (kWh) *</Label><Input id="quote-kwh" type="number" {...register("monthlyKwh")} aria-invalid={!!errors.monthlyKwh} aria-describedby={errors.monthlyKwh ? "quote-kwh-error" : undefined} />{errorText(errors.monthlyKwh?.message, "quote-kwh-error")}</div><div><Label htmlFor="quote-bill">Última factura aproximada (COP) *</Label><Input id="quote-bill" type="number" {...register("billValue")} aria-invalid={!!errors.billValue} aria-describedby={errors.billValue ? "quote-bill-error" : undefined} />{errorText(errors.billValue?.message, "quote-bill-error")}</div></div>
     <fieldset aria-invalid={!!errors.installationType} aria-describedby={`quote-installation-type-help${errors.installationType ? " quote-installation-type-error" : ""}`}><legend className="mb-2 text-sm font-medium">Tipo de instalación *</legend><p id="quote-installation-type-help" className="mb-2 text-sm text-muted-foreground">Seleccione la ubicación principal de los paneles.</p><div className="flex flex-wrap gap-4">{[["rooftop", "Techo"], ["ground", "Suelo"], ["mixed", "Mixta"]].map(([value, label]) => <label key={value} htmlFor={`quote-installation-${value}`} className="flex items-center gap-2 text-sm"><input id={`quote-installation-${value}`} type="radio" value={value} {...register("installationType")} aria-invalid={!!errors.installationType} aria-describedby={`quote-installation-type-help${errors.installationType ? " quote-installation-type-error" : ""}`} />{label}</label>)}</div>{errorText(errors.installationType?.message, "quote-installation-type-error")}</fieldset>
     <div><label htmlFor="quote-battery-backup" className="flex items-center gap-2 text-sm"><input id="quote-battery-backup" type="checkbox" {...register("batteryBackup")} aria-invalid={!!errors.batteryBackup} aria-describedby="quote-battery-backup-help" />Me interesa respaldo con batería</label><p id="quote-battery-backup-help" className="ml-6 text-sm text-muted-foreground">Indique si necesita respaldo durante interrupciones.</p></div>
    <div><Label htmlFor="quote-message">Mensaje adicional</Label><Textarea id="quote-message" {...register("message")} placeholder="Cuéntenos sobre su necesidad" aria-invalid={!!errors.message} aria-describedby={errors.message ? "quote-message-error" : undefined} />{errorText(errors.message?.message, "quote-message-error")}</div>
    <p className="text-sm text-muted-foreground">Al continuar se abrirá WhatsApp con el contexto diligenciado. No guardamos solicitudes dentro de este sitio.</p><Button type="submit" size="lg" className="w-full bg-green-600 hover:bg-green-700">Solicitar cotización por WhatsApp</Button><div aria-live="polite" role={status.startsWith("No") ? "alert" : "status"} className="text-sm text-primary">{status}</div>
  </form>
}

export function SolarPage() {
  const [estimate, setEstimate] = useState<SolarEstimate | null>(null)
  return <div className="bg-[#fcf9f8]"><div className="container mx-auto space-y-20 px-4 py-8 md:py-16">
    <section className="relative flex min-h-[500px] items-center overflow-hidden rounded-2xl bg-zinc-900 text-white"><Image src="/services/solar-hero.png" alt="Paneles solares instalados en un entorno residencial" fill className="object-cover opacity-60" priority /><div className="relative z-10 max-w-2xl space-y-6 p-8 md:p-16"><p className="font-semibold uppercase tracking-[0.2em] text-orange-300">Energía inteligente</p><h1 className="text-4xl font-bold md:text-6xl">Soluciones solares para su futuro</h1><p className="text-lg text-white/80">Conozca una referencia inicial para conversar sobre una solución solar adaptada a su instalación.</p><a href="#estimador"><Button size="lg">Calcular mi sistema</Button></a></div></section>
    <section className="space-y-10"><div className="max-w-2xl"><p className="font-semibold text-primary">De la idea a la instalación</p><h2 className="mt-2 text-3xl font-bold">Acompañamiento en cada etapa</h2></div><div className="grid gap-6 md:grid-cols-3">{[["1. Analizamos","Entendemos su consumo, espacio y objetivos."],["2. Diseñamos","Definimos una alternativa acorde con las condiciones del proyecto."],["3. Integramos","Acompañamos la implementación y la evaluación técnica."]].map(([title, text]) => <article key={title} className="rounded-xl border bg-card p-6"><h3 className="text-xl font-semibold">{title}</h3><p className="mt-3 text-muted-foreground">{text}</p></article>)}</div></section>
    <section id="estimador" className="scroll-mt-24 space-y-8"><div><p className="font-semibold text-primary">Estimador informativo</p><h2 className="mt-2 text-3xl font-bold">Conozca una referencia inicial</h2><p className="mt-3 max-w-3xl text-muted-foreground">El resultado usa supuestos configurables y no reemplaza un diseño de ingeniería, una promesa de ahorro ni una proyección de retorno.</p></div><div className="grid gap-6 lg:grid-cols-2"><SolarCalculator onEstimate={setEstimate} /><EstimateResult estimate={estimate} /></div></section>
    <section className="space-y-8"><div><p className="font-semibold text-primary">Siguiente paso</p><h2 className="mt-2 text-3xl font-bold">Solicite una cotización</h2><p className="mt-3 max-w-3xl text-muted-foreground">Comparta sus datos para abrir una conversación con nuestro equipo. La solución definitiva depende de una evaluación técnica y de las condiciones de instalación.</p></div><QuoteForm estimate={estimate} /></section>
  </div></div>
}
