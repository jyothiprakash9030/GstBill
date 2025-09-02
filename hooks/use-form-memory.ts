"use client"

type Snapshot = Record<string, string>

const memoryStore: Record<string, Snapshot> = {}

export function getFormSnapshot(formKey: string): Snapshot {
  return memoryStore[formKey] ?? {}
}

export function setFormField(formKey: string, name: string, value: string) {
  memoryStore[formKey] = { ...(memoryStore[formKey] ?? {}), [name]: value }
}

export function clearForm(formKey: string) {
  delete memoryStore[formKey]
}
