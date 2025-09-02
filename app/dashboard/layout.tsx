"use client"
import { type ReactNode, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isLoggedIn } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SiteNavbar } from "@/components/site-navbar"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!isLoggedIn()) router.replace("/login")
    else setReady(true)
  }, [router])

  if (!ready) return null

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNavbar menuOpen={open} onMenuToggle={() => setOpen((v) => !v)} />
      <div className="flex flex-1">
        {/* Desktop fixed sidebar */}
        <div className="hidden md:block">
          <div className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 border-r bg-white overflow-y-auto">
            <DashboardSidebar />
          </div>
        </div>

        {/* Mobile overlay sidebar */}
        {open && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
            <div className="absolute inset-y-0 left-0 bg-white w-64 shadow-xl animate-in slide-in-from-left">
              <DashboardSidebar onNavigate={() => setOpen(false)} />
            </div>
          </div>
        )}

        <main className="flex-1 md:ml-64 px-4 md:px-6 py-6 bg-gray-50">{children}</main>
      </div>
    </div>
  )
}
