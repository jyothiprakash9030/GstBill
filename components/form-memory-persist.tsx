"use client"

import * as React from "react"
import { clearForm, getFormSnapshot, setFormField } from "@/hooks/use-form-memory"

type Props = {
  formKey: string
  children: React.ReactNode
}

export function FormMemoryPersist({ formKey, children }: Props) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const root = ref.current
    if (!root) return

    const snapshot = getFormSnapshot(formKey)

    // Restore any saved values
    const fill = (el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) => {
      if (!el.name) return
      const saved = snapshot[el.name]
      if (saved !== undefined) {
        if (el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio")) {
          el.checked = saved === "true"
        } else {
          el.value = saved
        }
        el.dispatchEvent(new Event("input", { bubbles: true }))
        el.dispatchEvent(new Event("change", { bubbles: true }))
      }
    }

    const inputs = root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      "input[name], textarea[name], select[name]",
    )
    inputs.forEach(fill)

    // Save on changes
    const onAnyInput = (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      if (!target?.name) return
      const value =
        target instanceof HTMLInputElement && (target.type === "checkbox" || target.type === "radio")
          ? String(target.checked)
          : target.value
      setFormField(formKey, target.name, value)
    }

    inputs.forEach((el) => {
      el.addEventListener("input", onAnyInput)
      el.addEventListener("change", onAnyInput)
    })

    return () => {
      inputs.forEach((el) => {
        el.removeEventListener("input", onAnyInput)
        el.removeEventListener("change", onAnyInput)
      })
    }
  }, [formKey])

  return <div ref={ref}>{children}</div>
}

// Utility to be used from the page Clear button
export function clearFormMemory(formKey: string) {
  clearForm(formKey)
}
