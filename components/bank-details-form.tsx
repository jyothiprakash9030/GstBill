"use client"

import * as React from "react"
import useSWR from "swr"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Bank = {
  accountHolder: string
  bankName: string
  accountNumber: string
  ifsc: string
  branch: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())
const STORAGE_KEY = "bankdetails_overrides"

export default function BankDetailsForm() {
  const { data } = useSWR<Bank>("/bankdetails.json", fetcher)
  const [override, setOverride] = React.useState<Bank | null>(null)
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState<Bank | null>(null)

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setOverride(JSON.parse(raw))
    } catch {}
  }, [])

  const current: Bank | null = override ?? data ?? null

  const startEdit = () => {
    if (!current) return
    setDraft(current)
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setDraft(null)
  }

  const save = () => {
    if (!draft) return
    setOverride(draft)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
    setEditing(false)
  }

  const remove = () => {
    setOverride(null)
    localStorage.removeItem(STORAGE_KEY)
    setEditing(false)
  }

  const setDefault = () => {
    // Save current as default (override) and disable inputs
    if (!current) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
    setOverride(current)
    setEditing(false)
  }

  const disabled = !editing

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Bank details</h2>
        {!editing ? (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={setDefault}>
              Set Default
            </Button>
            <Button onClick={startEdit}>Edit</Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button onClick={save}>Save</Button>
            <Button variant="outline" onClick={cancelEdit}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={remove}>
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">Account holder</label>
          <Input
            value={(editing ? draft?.accountHolder : current?.accountHolder) ?? ""}
            onChange={(e) => editing && setDraft((d) => ({ ...(d as Bank), accountHolder: e.target.value }))}
            disabled={disabled}
            name="accountHolder"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">Bank name</label>
          <Input
            value={(editing ? draft?.bankName : current?.bankName) ?? ""}
            onChange={(e) => editing && setDraft((d) => ({ ...(d as Bank), bankName: e.target.value }))}
            disabled={disabled}
            name="bankName"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">Account number</label>
          <Input
            value={(editing ? draft?.accountNumber : current?.accountNumber) ?? ""}
            onChange={(e) => editing && setDraft((d) => ({ ...(d as Bank), accountNumber: e.target.value }))}
            disabled={disabled}
            name="accountNumber"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">IFSC</label>
          <Input
            value={(editing ? draft?.ifsc : current?.ifsc) ?? ""}
            onChange={(e) => editing && setDraft((d) => ({ ...(d as Bank), ifsc: e.target.value }))}
            disabled={disabled}
            name="ifsc"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">Branch</label>
          <Input
            value={(editing ? draft?.branch : current?.branch) ?? ""}
            onChange={(e) => editing && setDraft((d) => ({ ...(d as Bank), branch: e.target.value }))}
            disabled={disabled}
            name="branch"
          />
        </div>
      </div>

      {!current && <div className="text-sm text-muted-foreground">No bank details available yet.</div>}
    </section>
  )
}
