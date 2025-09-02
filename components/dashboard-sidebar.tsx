"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const items = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/category", label: "Category" },
  { href: "/dashboard/bank", label: "Bank Details" },
  { href: "/dashboard/gst-bill", label: "GST Bill Generate" },
]

export function DashboardSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <aside className="w-64 shrink-0 h-full border-r bg-white">
      <nav className="p-4 space-y-1">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            onClick={onNavigate}
            className={cn(
              "block rounded-md px-3 py-2 text-sm hover:bg-gray-100",
              pathname === it.href ? "bg-gray-100 font-medium" : "text-gray-700",
            )}
          >
            {it.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
