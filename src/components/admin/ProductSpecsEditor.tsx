"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"

interface SpecRow {
  key: string
  value: string
}

interface ProductSpecsEditorProps {
  value: Record<string, string>
  onChange: (specs: Record<string, string>) => void
}

export function ProductSpecsEditor({ value, onChange }: ProductSpecsEditorProps) {
  const [rows, setRows] = useState<SpecRow[]>(() => {
    const entries = Object.entries(value || {})
    if (entries.length === 0) return [{ key: "", value: "" }]
    return entries.map(([key, val]) => ({ key, value: val }))
  })

  // Sync rows -> parent whenever rows change
  useEffect(() => {
    const specs: Record<string, string> = {}
    for (const row of rows) {
      const trimmedKey = row.key.trim()
      if (trimmedKey) {
        specs[trimmedKey] = row.value
      }
    }
    onChange(specs)
  }, [rows, onChange])

  const updateRow = (index: number, field: "key" | "value", val: string) => {
    setRows((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: val }
      return next
    })
  }

  const addRow = () => {
    setRows((prev) => [...prev, { key: "", value: "" }])
  }

  const removeRow = (index: number) => {
    setRows((prev) => {
      if (prev.length === 1) return [{ key: "", value: "" }]
      return prev.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="space-y-3">
      <Label>Especificaciones técnicas</Label>
      <p className="text-sm text-muted-foreground">
        Agrega especificaciones como voltaje, capacidad, tipo de batería, etc.
      </p>

      {rows.map((row, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="flex-1 space-y-1">
            <Input
              placeholder="Ej: Voltaje, Capacidad, Tipo"
              value={row.key}
              onChange={(e) => updateRow(index, "key", e.target.value)}
              className="h-9"
            />
          </div>
          <div className="flex-1 space-y-1">
            <Input
              placeholder="Ej: 12V, 7.5Ah, Plomo-ácido"
              value={row.value}
              onChange={(e) => updateRow(index, "value", e.target.value)}
              className="h-9"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 h-9 w-9 text-muted-foreground hover:text-destructive"
            onClick={() => removeRow(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addRow}
        className="mt-2"
      >
        <Plus className="mr-1 h-3 w-3" />
        Agregar especificación
      </Button>
    </div>
  )
}
