"use client"
import * as React from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export const runtime = 'edge';

type Product = { id: string; name: string; price?: number; category?: string; variant?: string }

const fetcher: (url: string) => Promise<Product[]> = (url) =>
  fetch(url).then((r) => r.json());


export default function CategoryPage() {
const { data: products, mutate } = useSWR<Product[]>("/api/products", fetcher);

  const [name, setName] = React.useState("")
  const [price, setPrice] = React.useState("")
  const [editing, setEditing] = React.useState<string | null>(null)
  const [query, setQuery] = React.useState("")
  const { toast } = useToast()

  async function addOrUpdate() {
    if (!name || !price) return toast({ title: "Missing fields", variant: "destructive" })
    const p = Number.parseFloat(price)
    if (Number.isNaN(p)) return toast({ title: "Invalid price", variant: "destructive" })

    if (editing) {
      // Update product
      await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing, name, price: p }),
      })
      toast({ title: "Product updated" })
    } else {
      // Create product
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: crypto.randomUUID(), name, price: p }),
      })
      toast({ title: "Product created" })
    }

    setName("")
    setPrice("")
    setEditing(null)
    mutate() // reload from API
  }

  function edit(id: string) {
    const item = products?.find((x) => x.id === id)
    if (!item) return
    setEditing(id)
    setName(item.name)
    setPrice(item.price != null ? String(item.price) : "")
  }

  async function remove(id: string) {
    await fetch("/api/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    toast({ title: "Product deleted", variant: "destructive" })
    mutate()
  }

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products ?? []
    return (products ?? []).filter((p) => {
      const hay = [p.name, p.category, p.variant].filter(Boolean).join(" ").toLowerCase()
      return hay.includes(q)
    })
  }, [products, query])

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
            />
          </div>
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
