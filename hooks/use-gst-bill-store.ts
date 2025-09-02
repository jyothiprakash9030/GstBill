"use client"
import { create } from "zustand"

export type Company = { name: string; gst: string; address: string; phone: string; email: string }
export type Client = { name: string; gst: string; address: string; phone: string; email: string }
export type Invoice = { number: string; place: string; date: string; due: string }
export type Taxes = { cgst?: number; sgst?: number; igst?: number; notes?: string }
export type Item = { id: string; name: string; rate: number; qty: number; amount: number }
export type Watermark = { text: string; enabled: boolean }

type State = {
  company: Company
  client: Client
  invoice: Invoice
  taxes: Taxes
  watermark: Watermark
  items: Item[]
  reset: () => void
  setCompany: (next: Partial<Company>) => void
  setClient: (next: Partial<Client>) => void
  setInvoice: (next: Partial<Invoice>) => void
  setTaxes: (next: Partial<Taxes>) => void
  setWatermark: (next: Partial<Watermark>) => void
  setItems: (fn: (prev: Item[]) => Item[]) => void
}

const initial: Omit<
  State,
  "reset" | "setCompany" | "setClient" | "setInvoice" | "setTaxes" | "setWatermark" | "setItems"
> = {
  company: { name: "", gst: "", address: "", phone: "", email: "" },
  client: { name: "", gst: "", address: "", phone: "", email: "" },
  invoice: { number: "", place: "", date: "", due: "" },
  taxes: { cgst: undefined, sgst: undefined, igst: undefined, notes: "" },
  watermark: { text: "", enabled: false },
  items: [],
}

export const useGstBillStore = create<State>((set) => ({
  ...initial,
  reset: () => set(() => ({ ...initial })),
  setCompany: (next) => set((s) => ({ company: { ...s.company, ...next } })),
  setClient: (next) => set((s) => ({ client: { ...s.client, ...next } })),
  setInvoice: (next) => set((s) => ({ invoice: { ...s.invoice, ...next } })),
  setTaxes: (next) => set((s) => ({ taxes: { ...s.taxes, ...next } })),
  setWatermark: (next) => set((s) => ({ watermark: { ...s.watermark, ...next } })),
  setItems: (fn) => set((s) => ({ items: fn(s.items) })),
}))
