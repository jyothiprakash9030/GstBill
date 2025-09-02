"use client"

import * as React from "react"
import useSWR from "swr"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Product = {
  id: string
  name: string
  category?: string
  variant?: string
  price?: number
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const STORAGE_KEY = "listofprodutes_overrides"

export default function CategoryManager() {
  const { data, isLoading } = useSWR<Product[]>("/listofprodutes.json", fetcher)
  const [overrides, setOverrides] = React.useState<Product[] | null>(null)
  const [query, setQuery] = React.useState("")
  const [selectedId, setSelectedId] = React.useState<string | "">("")
  const [editingId, setEditingId] = React.useState<string>("")
  const [draft, setDraft] = React.useState<Partial<Product>>({})

  // Load overrides from localStorage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setOverrides(JSON.parse(raw))
    } catch {}
  }, [])

  const saveOverrides = (next: Product[]) => {
    setOverrides(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const base = data ?? []
  // Merge overrides by id
  const byId: Record<string, Product> = {}
  base.forEach((p) => (byId[p.id] = p))
  ;(overrides ?? []).forEach((p) => (byId[p.id] = p))
  const products = Object.values(byId)

  const filtered = React.useMemo(() => {
    if (!query.trim()) return products
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      const hay = [p.name, p.category, p.variant].filter(Boolean).join(" ").toLowerCase()
      return hay.includes(q)
    })
  }, [query, products])

  const startEdit = (p: Product) => {
    setEditingId(p.id)
    setDraft(p)
  }

  const cancelEdit = () => {
    setEditingId("")
    setDraft({})
  }

  const saveEdit = () => {
    if (!editingId) return
    const next = [...products]
    const idx = next.findIndex((x) => x.id === editingId)
    if (idx >= 0) {
      next[idx] = { ...next[idx], ...draft, id: editingId }
    }
    saveOverrides(next)
    cancelEdit()
  }

  const deleteItem = (id: string) => {
    const next = products.filter((p) => p.id !== id)
    saveOverrides(next)
    if (selectedId === id) setSelectedId("")
  }

  const selected = products.find((p) => p.id === selectedId)

  return (
    <section className="space-y-4">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <Input
          placeholder="Search products (e.g., tea, masala tea, black tea)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="md:max-w-sm"
        />
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="border rounded-md px-3 py-2 bg-background"
        >
          <option value="">Select item...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <div className="rounded-md border p-3 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="text-muted-foreground">Name</div>
              <div className="font-medium">{selected.name}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Category</div>
              <div className="font-medium">{selected.category ?? "-"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Variant</div>
              <div className="font-medium">{selected.variant ?? "-"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Price</div>
              <div className="font-medium">{selected.price ?? "-"}</div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="font-medium">Products ({filtered.length})</div>
          {isLoading && <div className="text-xs text-muted-foreground">Loading…</div>}
        </div>
        <div className="divide-y">
          {filtered.map((p) => {
            const isEditing = editingId === p.id
            return (
              <div key={p.id} className="p-3">
                {!isEditing ? (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="text-pretty">
                      <span className="font-medium">{p.name}</span>{" "}
                      <span className="text-muted-foreground">
                        {p.category ? `• ${p.category}` : ""} {p.variant ? `• ${p.variant}` : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(p)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteItem(p.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    <Input
                      value={draft.name ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                      placeholder="Name"
                    />
                    <Input
                      value={draft.category ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                      placeholder="Category"
                    />
                    <Input
                      value={draft.variant ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, variant: e.target.value }))}
                      placeholder="Variant"
                    />
                    <Input
                      value={draft.price?.toString() ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, price: Number(e.target.value || 0) }))}
                      placeholder="Price"
                      type="number"
                    />
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={saveEdit}>
                        Save
                      </Button>
                      <Button variant="outline" size="sm" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground">No products match your search.</div>
          )}
        </div>
      </div>
    </section>
  )
}
