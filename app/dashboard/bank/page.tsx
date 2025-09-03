"use client"
import * as React from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

type Bank = { bankName?: string; accountNo?: string; pan?: string; branchIfsc?: string }

const fetcher = (url: string) => fetch(url).then((r) => r.json())
const OVERRIDES_KEY = "bankdetails_overrides"

function normalizeBank(raw: any): Bank {
  if (!raw) return {}
  return {
    bankName: raw.bankName ?? raw.bank_name ?? raw.bank ?? "",
    accountNo: raw.accountNo ?? raw.account_number ?? raw.accountNumber ?? "",
    pan: raw.pan ?? raw.companyPan ?? "",
    branchIfsc:
      raw.branchIfsc ??
      raw.branch_ifsc ??
      [raw.branch, raw.ifsc].filter((x) => typeof x === "string" && x.trim().length > 0).join(" ").trim() ??
      "",
  }
}

export default function BankPage() {
  const { data, mutate } = useSWR("/api/bankdetails", fetcher)
  const base = React.useMemo<Bank>(() => normalizeBank(data), [data])

  const [override, setOverride] = React.useState<Bank | null>(null)
  const current: Bank = override ?? base ?? {}

  const { toast } = useToast()
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState<Bank>(current)

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(OVERRIDES_KEY)
      if (raw) setOverride(JSON.parse(raw))
    } catch {}
  }, [])

  React.useEffect(() => {
    if (!editing) setDraft(current)
  }, [current, editing])

  const disabled = !editing

  function saveOverride(next: Bank | null) {
    setOverride(next)
    try {
      if (next) localStorage.setItem(OVERRIDES_KEY, JSON.stringify(next))
      else localStorage.removeItem(OVERRIDES_KEY)
    } catch {}
  }

  function startEdit() {
    setDraft(current)
    setEditing(true)
  }

  async function save() {
    try {
      await fetch("/api/bankdetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      })
      saveOverride(draft)
      setEditing(false)
      mutate() // refresh SWR cache
      toast({ title: "Bank details saved" })
    } catch {
      toast({ title: "Error saving", variant: "destructive" })
    }
  }

  function cancel() {
    setDraft(current)
    setEditing(false)
    toast({ title: "Edit cancelled" })
  }

  async function remove() {
    try {
      await fetch("/api/bankdetails", { method: "DELETE" })
      saveOverride(null)
      setDraft({})
      setEditing(false)
      mutate()
      toast({ title: "Deleted", variant: "destructive" })
    } catch {
      toast({ title: "Error deleting", variant: "destructive" })
    }
  }

  function setDefault() {
    saveOverride(current)
    setEditing(false)
    toast({ title: "Set as default" })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Bank details</h1>
      <div className="bg-white p-4 border rounded-lg grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label>BANK NAME</Label>
          <Input
            value={draft.bankName || ""}
            onChange={(e) => setDraft({ ...draft, bankName: e.target.value })}
            disabled={disabled}
          />
        </div>
        <div className="space-y-1">
          <Label>A/c No</Label>
          <Input
            value={draft.accountNo || ""}
            onChange={(e) => setDraft({ ...draft, accountNo: e.target.value })}
            disabled={disabled}
          />
        </div>
        <div className="space-y-1">
          <Label>Company PAN</Label>
          <Input
            value={draft.pan || ""}
            onChange={(e) => setDraft({ ...draft, pan: e.target.value })}
            disabled={disabled}
          />
        </div>
        <div className="space-y-1">
          <Label>Branch & IFSC code</Label>
          <Input
            value={draft.branchIfsc || ""}
            onChange={(e) => setDraft({ ...draft, branchIfsc: e.target.value })}
            disabled={disabled}
          />
        </div>

        <div className="col-span-full flex gap-3">
          {!editing ? (
            <>
              <Button variant="outline" onClick={setDefault}>
                Set Default
              </Button>
              <Button onClick={startEdit}>Edit</Button>
            </>
          ) : (
            <>
              <Button onClick={save}>Save</Button>
              <Button variant="outline" onClick={cancel}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={remove}>
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
