import { numberToIndianCurrencySentence } from "@/lib/currency"
import type React from "react"

export type Item = { id: string; name: string; rate: number; qty: number; amount: number }
export type Parties = {
  company: { name?: string; gst?: string; address?: string; phone?: string; email?: string }
  client: { name?: string; gst?: string; address?: string; phone?: string; email?: string }
}
export type InvoiceMeta = { number?: string; place?: string; date?: string; due?: string }
export type Taxes = { cgst?: number; sgst?: number; igst?: number; notes?: string }
export type Bank = { bankName?: string; accountNo?: string; pan?: string; branchIfsc?: string }
export type Watermark = { text?: string; enabled?: boolean }

function Row({ left, right }: { left: string | React.ReactNode; right?: string | React.ReactNode }) {
  return (
    <div className="flex justify-between text-xs">
      <div>{left}</div>
      <div className="text-right">{right}</div>
    </div>
  )
}

export function InvoicePreview({
  items,
  parties,
  invoice,
  taxes,
  bank,
  watermark,
}: {
  items: Item[]
  parties: Parties
  invoice: InvoiceMeta
  taxes: Taxes
  bank?: Bank
  watermark?: Watermark
}) {
  const taxable = items.reduce((s, i) => s + i.amount, 0)
  const cgst = ((taxes.cgst || 0) * taxable) / 100
  const sgst = ((taxes.sgst || 0) * taxable) / 100
  const igst = ((taxes.igst || 0) * taxable) / 100
  const taxTotal = +(cgst + sgst + igst).toFixed(2)
  const grand = +(taxable + taxTotal).toFixed(2)

  return (
    <div
      id="invoice-a4"
      className="invoice-a4 relative mx-auto"
      style={
        {
          color: "#111827",
          backgroundColor: "#ffffff",
          ["--border"]: "#e5e7eb",
          ["--ring"]: "#93c5fd",
          ["--foreground"]: "#111827",
          ["--background"]: "#ffffff",
        } as React.CSSProperties
      }
    >
      {watermark?.enabled && watermark?.text && (
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute inset-0 flex items-center justify-center"
          style={{ overflow: "hidden", zIndex: 1 }}
        >
          <div
            className="uppercase font-extrabold text-5xl"
            style={{
              transform: "rotate(-35deg)",
              letterSpacing: "0.3em",
              color: "rgba(0,0,0,0.14)", // bolder than before but still subtle
              userSelect: "none",
              whiteSpace: "nowrap",
            }}
          >
            {watermark.text}
          </div>
        </div>
      )}

      <div className="border-b pb-2">
        <div className="text-center font-semibold">TAX INVOICE</div>
        <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="font-medium">{parties.company.name || "Company Name"}</div>
            <div>{parties.company.address}</div>
            <Row left="GSTIN:" right={parties.company.gst} />
            <Row left="Phone:" right={parties.company.phone} />
            <Row left="Email:" right={parties.company.email} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Row left="Invoice No." right={invoice.number} />
            <Row left="Place" right={invoice.place} />
            <Row left="Invoice Date" right={invoice.date} />
            <Row left="Due Date" right={invoice.due} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-b py-2 text-xs">
        <div>
          <div className="font-medium">Consignee (Ship to)</div>
          <div className="font-medium">{parties.client.name}</div>
          <div>{parties.client.address}</div>
          <Row left="GSTIN" right={parties.client.gst} />
          <Row left="Phone" right={parties.client.phone} />
          {parties.client.email && <Row left="Email" right={parties.client.email} />}
        </div>
        <div>
          <div className="font-medium">Buyer (Bill to)</div>
          <div className="font-medium">{parties.client.name}</div>
          <div>{parties.client.address}</div>
          <Row left="GSTIN" right={parties.client.gst} />
          <Row left="Phone" right={parties.client.phone} />
        </div>
      </div>

      <div className="mt-2">
        <table className="w-full border text-xs">
          <thead>
            <tr className="bg-[#f3f4f6]">
              <th className="border px-2 py-1 text-left">Sl</th>
              <th className="border px-2 py-1 text-left">Description of Goods</th>
              <th className="border px-2 py-1">Qty</th>
              <th className="border px-2 py-1">Rate</th>
              <th className="border px-2 py-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="border px-2 py-6 text-center text-[#9ca3af]">
                  No items
                </td>
              </tr>
            )}
            {items.map((it, idx) => (
              <tr key={it.id}>
                <td className="border px-2 py-1">{idx + 1}</td>
                <td className="border px-2 py-1">{it.name}</td>
                <td className="border px-2 py-1 text-center">{it.qty}</td>
                <td className="border px-2 py-1 text-right">{it.rate.toFixed(2)}</td>
                <td className="border px-2 py-1 text-right">{it.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="border px-2 py-1 text-right font-medium" colSpan={4}>
                Total
              </td>
              <td className="border px-2 py-1 text-right font-medium">{taxable.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-2 text-xs">
        <div>
          {taxes.notes && (
            <>
              <div className="font-medium">Notes</div>
              <div className="border p-2 min-h-[48px]">{taxes.notes}</div>
            </>
          )}
        </div>
        <div className="border p-2 space-y-1">
          {taxes.cgst ? <Row left={`CGST ${taxes.cgst}%`} right={cgst.toFixed(2)} /> : null}
          {taxes.sgst ? <Row left={`SGST ${taxes.sgst}%`} right={sgst.toFixed(2)} /> : null}
          {taxes.igst ? <Row left={`IGST ${taxes.igst}%`} right={igst.toFixed(2)} /> : null}
          <Row
            left={<span className="font-medium">Tax Total</span>}
            right={<span className="font-medium">{taxTotal.toFixed(2)}</span>}
          />
          <Row
            left={<span className="font-semibold">Grand Total</span>}
            right={<span className="font-semibold">{grand.toFixed(2)}</span>}
          />
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
        <div className="border p-2">
          <div>
            <span className="font-medium">Tax Amount (in words):</span> {numberToIndianCurrencySentence(grand)}
          </div>
        </div>
        <div className="border p-2">
          <div className="font-medium">Company's Bank Details</div>
          <div>Bank Name: {bank?.bankName}</div>
          <div>A/c No: {bank?.accountNo}</div>
          <div>Company's PAN: {bank?.pan}</div>
          <div>Branch & IFSC: {bank?.branchIfsc}</div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <div className="w-56 text-center border p-2 text-xs">
          <div className="h-12" />
          <div className="font-medium">Authorised Signatory</div>
        </div>
      </div>
    </div>
  )
}
