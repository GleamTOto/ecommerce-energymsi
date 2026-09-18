export const solarCalculatorConfig = {
  daysPerMonth: 30,
  peakSunHours: 4.5,
  performanceRatio: 0.8,
  precision: 2,
  currency: "COP",
} as const

export interface SolarEstimateInput {
  monthlyKwh: number
  billValue: number
  city: string
  installationType: "rooftop" | "ground" | "mixed"
  batteryBackup: boolean
}

export interface SolarEstimate {
  monthlyKwh: number
  billValue: number
  city: string
  installationType: SolarEstimateInput["installationType"]
  batteryBackup: boolean
  estimatedKwp: number
  estimatedGeneration: number
  isApproximate: true
  config: typeof solarCalculatorConfig
}

const round = (value: number) => Number(value.toFixed(solarCalculatorConfig.precision))

export function calculateEstimate(input: SolarEstimateInput): SolarEstimate {
  if (!Number.isFinite(input.monthlyKwh) || input.monthlyKwh <= 0 || input.monthlyKwh > 100000) {
    throw new Error("Monthly consumption must be between 0 and 100,000 kWh")
  }
  if (!Number.isFinite(input.billValue) || input.billValue <= 0 || input.billValue > 1_000_000_000) {
    throw new Error("Bill value must be positive and within the supported range")
  }
  if (!input.city.trim()) throw new Error("City is required")
  const denominator = solarCalculatorConfig.daysPerMonth * solarCalculatorConfig.peakSunHours * solarCalculatorConfig.performanceRatio
  return {
    ...input,
    estimatedKwp: round(input.monthlyKwh / denominator),
    estimatedGeneration: round(input.monthlyKwh),
    isApproximate: true,
    config: solarCalculatorConfig,
  }
}

export const solarAssumptionsText = `Informational estimate only. Formula: kWp = monthly kWh / (days per month × peak sun hours × performance ratio). This configuration uses ${solarCalculatorConfig.daysPerMonth} days, ${solarCalculatorConfig.peakSunHours} peak sun hours, and a ${solarCalculatorConfig.performanceRatio} performance ratio. Battery backup indicates a requested backup requirement, not a guaranteed capacity. Final sizing depends on technical evaluation and installation conditions.`
