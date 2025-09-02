"use client"
import * as React from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

type Product = { id: string; name: string; price?: number; category?: string; variant?: string }

const fetcher = (url: string) => fetch(url).then((r) => r.json())
const OVERRIDES_KEY = "listofprodutes_overrides"

export default function CategoryPage() {
  const { data: baseProducts } = useSWR<Product[]>("/listofprodutes.json", fetcher)
  const [overrides, setOverrides] = React.useState<Product[] | null>(null)

  const [name, setName] = React.useState("")
  const [price, setPrice] = React.useState<string>("")
  const [editing, setEditing] = React.useState<string | null>(null)
  const [query, setQuery] = React.useState("")
  const [selectedId, setSelectedId] = React.useState<string>("")
  const { toast } = useToast()

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(OVERRIDES_KEY)
      if (raw) setOverrides(JSON.parse(raw))
    } catch {}
  }, [])

  const saveOverrides = (list: Product[]) => {
    setOverrides(list)
    try {
      localStorage.setItem(OVERRIDES_KEY, JSON.stringify(list))
    } catch {}
  }

  const products: Product[] = React.useMemo(() => {
    const map = new Map<string, Product>()
    ;(baseProducts ?? []).forEach((p) => map.set(p.id, p))
    ;(overrides ?? []).forEach((p) => map.set(p.id, p))
    return Array.from(map.values())
  }, [baseProducts, overrides])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => {
      const hay = [p.name, p.category, p.variant].filter(Boolean).join(" ").toLowerCase()
      return hay.includes(q)
    })
  }, [products, query])

  function addOrUpdate() {
    if (!name || !price) return toast({ title: "Missing fields", variant: "destructive" })
    const p = Number.parseFloat(price)
    if (Number.isNaN(p)) return toast({ title: "Invalid price", variant: "destructive" })
    const nextAll = [...products]
    if (editing) {
      const idx = nextAll.findIndex((x) => x.id === editing)
      if (idx >= 0) nextAll[idx] = { ...nextAll[idx], name, price: p }
      toast({ title: "Product updated" })
    } else {
      nextAll.push({ id: crypto.randomUUID(), name, price: p })
      toast({ title: "Product created" })
    }
    saveOverrides(nextAll)
    setName("")
    setPrice("")
    setEditing(null)
  }

  function edit(id: string) {
    const item = products.find((x) => x.id === id)
    if (!item) return
    setEditing(id)
    setName(item.name)
    setPrice(item.price != null ? String(item.price) : "")
  }

  function remove(id: string) {
    const next = products.filter((x) => x.id !== id)
    saveOverrides(next)
    if (editing === id) {
      setEditing(null)
      setName("")
      setPrice("")
    }
    if (selectedId === id) setSelectedId("")
    toast({ title: "Product deleted", variant: "destructive" })
  }

  const selected = products.find((p) => p.id === selectedId)

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-xl font-semibold">Category - Products</h1>

      <div className="bg-white p-4 border rounded-lg space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label>Product name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="" />
          </div>
          <div className="space-y-1">
            <Label>Product price</Label>
            <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="" />
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={addOrUpdate}>
              {editing ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 border rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <h2 className="font-medium">All products</h2>
          <div className="w-full max-w-xs">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products (e.g. tea, masala tea)"
              aria-label="Search products"
            />
          </div>
        </div>

        <div className="mb-4">
          <Label className="text-sm text-muted-foreground">View details</Label>
          <select
            className="mt-1 h-9 w-full max-w-xs rounded-md border px-2 text-sm"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">Select item...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {selected && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-md border p-3 text-sm">
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
          )}
        </div>

        <div className="divide-y">
          {filtered.length === 0 && <div className="text-sm text-gray-500">No matching products.</div>}
          {filtered.map((p) => (
            <div key={p.id} className="py-2 flex items-center justify-between">
              <div className="text-sm">
                <div className="font-medium">{p.name}</div>
                <div className="text-gray-500">Price: {p.price ?? "-"}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => edit(p.id)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => remove(p.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
