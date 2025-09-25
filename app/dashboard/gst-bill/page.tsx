"use client"
import * as React from "react"
import useSWR, { SWRConfiguration } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { InvoicePreview, type Item as PreviewItem, type Taxes as PreviewTaxes } from "@/components/invoice-preview"
import { PdfExportButton } from "@/components/pdf-export"
import { useGstBillStore } from "@/hooks/use-gst-bill-store"
import { useMemo, useState } from "react"

type Product = { id: string; name: string; price?: number }
type Bank = { bankName?: string; accountNo?: string; pan?: string; branchIfsc?: string }
type Company = { name?: string; gst?: string; address?: string; phone?: string; email?: string }

// Explicitly type the fetcher to return Promise<Product[]>
const fetcher = async (url: string): Promise<any> => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch ${url}`)
  return response.json()
}

const PRODUCT_OVERRIDES_KEY = "listofprodutes_overrides"
const BANK_OVERRIDES_KEY = "bankdetails_overrides"
const COMPANY_OVERRIDES_KEY = "companydetails_overrides"

function normalizeBank(raw: any): Bank {
  if (!raw) return {}
  return {
    bankName: raw.bankName ?? raw.bank_name ?? raw.bank ?? "",
    accountNo: raw.accountNo ?? raw.account_number ?? raw.accountNumber ?? "",
    pan: raw.pan ?? raw.companyPan ?? "",
    branchIfsc:
      raw.branchIfsc ??
      raw.branch_ifsc ??
      [raw.branch, raw.ifsc]
        .filter((x) => typeof x === "string" && x.trim().length > 0)
        .join(" ")
        .trim() ??
      "",
  }
}

function normalizeCompany(raw: any): Company {
  if (!raw) return {}
  return {
    name: raw.name ?? "",
    gst: raw.gst ?? "",
    address: raw.address ?? "",
    phone: raw.phone ?? "",
    email: raw.email ?? "",
  }
}

export default function GstBillPage() {
  const { data: baseProducts } = useSWR<Product[], Error>("/listofprodutes.json", fetcher)
  const [productOverrides, setProductOverrides] = React.useState<Product[] | null>(null)
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(PRODUCT_OVERRIDES_KEY)
      if (raw) setProductOverrides(JSON.parse(raw))
    } catch {}
  }, [])
  const products: Product[] = useMemo(() => {
    const map = new Map<string, Product>()
    ;(baseProducts ?? []).forEach((p) => map.set(p.id, p))
    ;(productOverrides ?? []).forEach((p) => map.set(p.id, p))
    return Array.from(map.values())
  }, [baseProducts, productOverrides])

  const { data: bankBaseRaw } = useSWR("/bankdetails.json", fetcher)
  const baseBank = useMemo(() => normalizeBank(bankBaseRaw), [bankBaseRaw])
  const [bankOverride, setBankOverride] = React.useState<Bank | null>(null)
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(BANK_OVERRIDES_KEY)
      if (raw) setBankOverride(JSON.parse(raw))
    } catch {}
  }, [])
  const bank: Bank = bankOverride ?? baseBank ?? {}

  const { data: companyBaseRaw } = useSWR("/api/company", fetcher)
  const baseCompany = useMemo(() => normalizeCompany(companyBaseRaw), [companyBaseRaw])
  const [companyOverride, setCompanyOverride] = React.useState<Company | null>(null)
  const [isEditingCompany, setIsEditingCompany] = React.useState(false)
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(COMPANY_OVERRIDES_KEY)
      if (raw) setCompanyOverride(JSON.parse(raw))
    } catch {}
  }, [])
  const savedCompany: Company = companyOverride ?? baseCompany ?? {}

  const { toast } = useToast()

  const {
    company,
    client,
    invoice,
    taxes,
    watermark,
    items,
    setCompany,
    setClient,
    setInvoice,
    setTaxes,
    setWatermark,
    setItems,
    reset,
  } = useGstBillStore()

  // Sync company details with store on mount or when savedCompany changes
  React.useEffect(() => {
    setCompany(savedCompany)
  }, [savedCompany, setCompany])

  // Local state to handle tax inputs as strings
  const [taxInputs, setTaxInputs] = useState({
    cgst: taxes.cgst !== undefined ? taxes.cgst.toString() : "2.5",
    sgst: taxes.sgst !== undefined ? taxes.sgst.toString() : "",
    igst: taxes.igst !== undefined ? taxes.igst.toString() : "",
  })

  // Sync local state with store when taxes change
  React.useEffect(() => {
    setTaxInputs({
      cgst: taxes.cgst !== undefined ? taxes.cgst.toString() : "2.5",
      sgst: taxes.sgst !== undefined ? taxes.sgst.toString() : "",
      igst: taxes.igst !== undefined ? taxes.igst.toString() : "",
    })
  }, [taxes])

  // Handle tax input changes
  const handleTaxChange = (field: keyof PreviewTaxes, value: string) => {
    setTaxInputs((prev) => ({ ...prev, [field]: value }))
    setTaxes({
      ...taxes,
      [field]: value === "" ? undefined : isNaN(parseFloat(value)) ? undefined : parseFloat(value),
    })
  }

  // Handle company details save
  const handleSaveCompany = async () => {
    try {
      const response = await fetch("/api/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(company),
      })
      if (response.ok) {
        setCompanyOverride(company)
        localStorage.setItem(COMPANY_OVERRIDES_KEY, JSON.stringify(company))
        setIsEditingCompany(false)
        toast({ title: "Company details saved successfully" })
      } else {
        throw new Error("Failed to save company details")
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to save company details", variant: "destructive" })
    }
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setCompany(savedCompany)
    setIsEditingCompany(false)
  }

  function addItem() {
    setItems((prev:any) => [...prev, { id: crypto.randomUUID(), name: "", rate: 0, qty: 1, amount: 0, hsn: "" }])
  }
  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }
  function setItemField(id: string, field: keyof PreviewItem, value: any) {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i
        const next = { ...i, [field]: value }
        if (field !== "hsn") {
          const qty = Number(next.qty || 0)
          const rate = Number(next.rate || 0)
          next.amount = +(qty * rate).toFixed(2)
        }
        return next
      }),
    )
  }
function chooseProductById(itemId: string, productId: string) {
  const p = products.find((x) => x.id === productId)
  if (!p) return
  setItems((prev) =>
    prev.map((i:any) =>
      i.id === itemId
        ? {
            ...i,
            name: p.name,
            rate: Number(p.price ?? 0), // ✅ keep as number
            amount: +(i.qty * Number(p.price ?? 0)).toFixed(2), // ✅ stays number
          }
        : i
    )
  )
}

  const previewTaxes: PreviewTaxes = useMemo(
    () => ({
      cgst: taxInputs.cgst === "" ? undefined : parseFloat(taxInputs.cgst),
      sgst: taxInputs.sgst === "" ? undefined : parseFloat(taxInputs.sgst),
      igst: taxInputs.igst === "" ? undefined : parseFloat(taxInputs.igst),
      notes: taxes.notes,
    }),
    [taxInputs, taxes.notes],
  )

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <h1 className="text-xl font-semibold">GST Bill Generate</h1>

      {/* Company Details */}
      <section className="bg-white border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Company Details</h2>
          {!isEditingCompany ? (
            <Button size="sm" onClick={() => setIsEditingCompany(true)}>
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveCompany}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>
          )}
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label>Company name</Label>
            <Input
              value={company.name ?? ""}
              onChange={(e) => setCompany({ ...company, name: e.target.value })}
              disabled={!isEditingCompany}
            />
          </div>
          <div className="space-y-1">
            <Label>GST number</Label>
            <Input
              value={company.gst ?? ""}
              onChange={(e) => setCompany({ ...company, gst: e.target.value })}
              disabled={!isEditingCompany}
            />
          </div>
          <div className="space-y-1 md:col-span-3">
            <Label>Address</Label>
            <Input
              value={company.address ?? ""}
              onChange={(e) => setCompany({ ...company, address: e.target.value })}
              disabled={!isEditingCompany}
            />
          </div>
          <div className="space-y-1">
            <Label>Phone number</Label>
            <Input
              value={company.phone ?? ""}
              onChange={(e) => setCompany({ ...company, phone: e.target.value })}
              disabled={!isEditingCompany}
            />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input
              value={company.email ?? ""}
              onChange={(e) => setCompany({ ...company, email: e.target.value })}
              disabled={!isEditingCompany}
            />
          </div>
        </div>
      </section>

      {/* Client Details */}
      <section className="bg-white border rounded-lg p-4 space-y-3">
        <h2 className="font-medium">Client Details</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label>Client name</Label>
            <Input value={client.name} onChange={(e) => setClient({ name: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Client GST number</Label>
            <Input value={client.gst} onChange={(e) => setClient({ gst: e.target.value })} />
          </div>
          <div className="space-y-1 md:col-span-3">
            <Label>Client address</Label>
            <Input value={client.address} onChange={(e) => setClient({ address: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Client phone</Label>
            <Input value={client.phone} onChange={(e) => setClient({ phone: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Client email (optional)</Label>
            <Input value={client.email} onChange={(e) => setClient({ email: e.target.value })} />
          </div>
        </div>
      </section>

      {/* Invoice Details */}
      <section className="bg-white border rounded-lg p-4 space-y-3">
        <h2 className="font-medium">Invoice Details</h2>
        <div className="grid md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label>Invoice number</Label>
            <Input value={invoice.number} onChange={(e) => setInvoice({ number: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Place/Location</Label>
            <Input value={invoice.place} onChange={(e) => setInvoice({ place: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Invoice date</Label>
            <Input type="date" value={invoice.date} onChange={(e) => setInvoice({ date: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Due date</Label>
            <Input type="date" value={invoice.due} onChange={(e) => setInvoice({ due: e.target.value })} />
          </div>
        </div>
      </section>

      {/* Items */}
      <section className="bg-white border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Items</h2>
          <Button size="sm" onClick={addItem}>
            Add item
          </Button>
        </div>
        <div className="space-y-3">
          {items.map((it) => {
            const currentProductId = products.find((p) => p.name === it.name)?.id ?? ""
            return (
              <div key={it.id} className="grid gap-3 md:grid-cols-[2fr,1fr,1fr,1fr,1fr,auto]">
                <div className="space-y-1">
                  <Label>Product</Label>
                  <select
                    className="h-9 w-full rounded-md border px-2 text-sm"
                    value={currentProductId}
                    onChange={(e) => chooseProductById(it.id, e.target.value)}
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>HSN/SAC</Label>
                  <Input value={it.hsn || ""} onChange={(e) => setItemField(it.id, "hsn", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Quantity</Label>
                  <Input value={it.qty} onChange={(e) => setItemField(it.id, "qty", Number(e.target.value || 0))} />
                </div>
                <div className="space-y-1">
                  <Label>Rate</Label>
                  <Input value={it.rate} readOnly />
                </div>
                <div className="space-y-1">
                  <Label>Amount</Label>
                  <Input value={it.amount} readOnly />
                </div>
                <div className="flex items-end">
                  <Button variant="destructive" size="sm" onClick={() => removeItem(it.id)} aria-label="Remove item">
                    X
                  </Button>
                </div>
              </div>
            )
          })}
          {items.length === 0 && (
            <div className="text-sm text-gray-500">
              Add items from your product list. Rates auto-fill; amount = qty × rate.
            </div>
          )}
        </div>
      </section>

      {/* Taxes and Notes */}
      <section className="bg-white border rounded-lg p-4 space-y-3">
        <h2 className="font-medium">Tax Details</h2>
        <div className="grid md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label>CGST rate (%)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={taxInputs.cgst || "2.5"}
              onChange={(e) => handleTaxChange("cgst", e.target.value)}
              onBlur={() => {
                if (taxInputs.cgst !== "" && !isNaN(parseFloat(taxInputs.cgst))) {
                  setTaxInputs((prev) => ({
                    ...prev,
                    cgst: parseFloat(taxInputs.cgst).toString(),
                  }))
                }
              }}
            />
          </div>
          <div className="space-y-1">
            <Label>SGST rate (%)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={taxInputs.sgst}
              onChange={(e) => handleTaxChange("sgst", e.target.value)}
              onBlur={() => {
                if (taxInputs.sgst !== "" && !isNaN(parseFloat(taxInputs.sgst))) {
                  setTaxInputs((prev) => ({ ...prev, sgst: parseFloat(taxInputs.sgst).toString() }))
                }
              }}
            />
          </div>
          <div className="space-y-1">
            <Label>IGST rate (%)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={taxInputs.igst}
              onChange={(e) => handleTaxChange("igst", e.target.value)}
              onBlur={() => {
                if (taxInputs.igst !== "" && !isNaN(parseFloat(taxInputs.igst))) {
                  setTaxInputs((prev) => ({ ...prev, igst: parseFloat(taxInputs.igst).toString() }))
                }
              }}
            />
          </div>
          <div className="space-y-1 md:col-span-4">
            <Label>Additional notes</Label>
            <Textarea value={taxes.notes || ""} onChange={(e) => setTaxes({ notes: e.target.value })} />
          </div>
        </div>
      </section>

      {/* Watermark */}
      <section className="bg-white border rounded-lg p-4 space-y-3">
        <h2 className="font-medium">Watermark</h2>
        <div className="grid md:grid-cols-[1fr,auto] gap-3 items-end">
          <div className="space-y-1">
            <Label>Watermark text</Label>
            <Input value={watermark.text} onChange={(e) => setWatermark({ text: e.target.value })} placeholder="" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={watermark.enabled ? "default" : "outline"}
              onClick={() => setWatermark({ enabled: !watermark.enabled })}
            >
              {watermark.enabled ? "Applied" : "Apply"}
            </Button>
          </div>
        </div>
      </section>

      <div className="flex gap-3">
        <Button onClick={() => toast({ title: "Preview updated" })}>Preview</Button>
        <PdfExportButton />
        <Button variant="outline" onClick={reset}>
          Clear
        </Button>
      </div>

      {/* Preview */}
      <section className="bg-gray-100 p-4 rounded-lg">
        <InvoicePreview
          items={items}
          parties={{ company, client }}
          invoice={invoice}
          taxes={previewTaxes}
          bank={bank}
          watermark={watermark}
        />
      </section>
    </div>
  )
}