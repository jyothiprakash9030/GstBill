import useSWR, { mutate as globalMutate } from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// Types
export type Product = {
  id: string
  name: string
  price: number
  [key: string]: any
}

export type BankDetails = {
  accountName?: string
  accountNumber?: string
  ifsc?: string
  bankName?: string
  branch?: string
  gstin?: string
  upi?: string
  [key: string]: any
}

// Keys
const PRODUCTS_URL = "/listofprodutes.json"
const BANK_URL = "/bankdetails.json"
const LS_PRODUCTS = "listofprodutes_overrides"
const LS_BANK = "bankdetails_overrides"

function safeParse<T>(str: string | null, fallback: T): T {
  if (!str) return fallback
  try {
    return JSON.parse(str) as T
  } catch {
    return fallback
  }
}

// ---------------- Products ----------------
type ProductOverrides = {
  upsertsById: Record<string, Product>
  deletedIds: string[]
}

function getProductOverrides(): ProductOverrides {
  if (typeof window === "undefined") return { upsertsById: {}, deletedIds: [] }
  return safeParse<ProductOverrides>(localStorage.getItem(LS_PRODUCTS), {
    upsertsById: {},
    deletedIds: [],
  })
}

function setProductOverrides(next: ProductOverrides) {
  if (typeof window === "undefined") return
  localStorage.setItem(LS_PRODUCTS, JSON.stringify(next))
}

export function useProducts() {
  const { data: base, error, isLoading, mutate } = useSWR<Product[]>(PRODUCTS_URL, fetcher)

  // Merge base + overrides
  const overrides = typeof window !== "undefined" ? getProductOverrides() : { upsertsById: {}, deletedIds: [] }
  const baseList = Array.isArray(base) ? base : []
  const upserts = Object.values(overrides.upsertsById || {})
  const deletedSet = new Set(overrides.deletedIds || [])

  // Build a map from base to apply upserts then remove deleted
  const byId = new Map<string, Product>()
  for (const p of baseList) byId.set(p.id, p)
  for (const p of upserts) byId.set(p.id, p)
  for (const id of deletedSet) byId.delete(id)

  const all = Array.from(byId.values())

  const upsertProduct = async (p: Product) => {
    const next = getProductOverrides()
    next.upsertsById[p.id] = p
    // in case it's re-added, ensure not in deleted
    next.deletedIds = (next.deletedIds || []).filter((id) => id !== p.id)
    setProductOverrides(next)
    // revalidate & update
    await mutate()
    await globalMutate(PRODUCTS_URL)
  }

  const deleteProduct = async (id: string) => {
    const next = getProductOverrides()
    delete next.upsertsById[id]
    if (!next.deletedIds) next.deletedIds = []
    if (!next.deletedIds.includes(id)) next.deletedIds.push(id)
    setProductOverrides(next)
    await mutate()
    await globalMutate(PRODUCTS_URL)
  }

  const clearProductOverrides = async () => {
    if (typeof window !== "undefined") localStorage.removeItem(LS_PRODUCTS)
    await mutate()
    await globalMutate(PRODUCTS_URL)
  }

  return { products: all, base, error, isLoading, upsertProduct, deleteProduct, clearProductOverrides }
}

// ---------------- Bank Details ----------------
function getBankOverrides(): BankDetails | null {
  if (typeof window === "undefined") return null
  return safeParse<BankDetails | null>(localStorage.getItem(LS_BANK), null)
}

function setBankOverrides(next: BankDetails | null) {
  if (typeof window === "undefined") return
  if (next) localStorage.setItem(LS_BANK, JSON.stringify(next))
  else localStorage.removeItem(LS_BANK)
}

export function useBankDetails() {
  const { data: base, error, isLoading, mutate } = useSWR<BankDetails>(BANK_URL, fetcher)
  const override = typeof window !== "undefined" ? getBankOverrides() : null
  const details: BankDetails = { ...(base || {}), ...(override || {}) }

  const saveBankDetails = async (next: BankDetails) => {
    setBankOverrides(next)
    await mutate()
    await globalMutate(BANK_URL)
  }

  const deleteBankDetails = async () => {
    setBankOverrides(null)
    await mutate()
    await globalMutate(BANK_URL)
  }

  return { bank: details, base, error, isLoading, saveBankDetails, deleteBankDetails }
}
