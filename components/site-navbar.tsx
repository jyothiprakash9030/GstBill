"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Facebook, Instagram, LogOut, Menu, UserRound, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { isLoggedIn, logout } from "@/lib/auth"

export function SiteNavbar({
  onMenuToggle,
  menuOpen,
}: {
  onMenuToggle?: () => void
  menuOpen?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [authed, setAuthed] = useState(false)
  useEffect(() => setAuthed(isLoggedIn()), [pathname])

  const inDashboard = pathname?.startsWith("/dashboard")

  return (
    <header className="w-full border-b bg-white sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onMenuToggle && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onMenuToggle}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
          <Link href="/" className="font-semibold">
            GST Builder
          </Link>
        </div>
        <nav className="flex items-center gap-3">
          <Link
            href="https://instagram.com"
            target="_blank"
            aria-label="Instagram"
            className="text-gray-600 hover:text-gray-900"
          >
            <Instagram className="h-5 w-5" />
          </Link>
          <Link
            href="https://facebook.com"
            target="_blank"
            aria-label="Facebook"
            className="text-gray-600 hover:text-gray-900"
          >
            <Facebook className="h-5 w-5" />
          </Link>

          {!authed ? (
            // Before login: show icon-only login on non-dashboard pages
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/login")}
              aria-label="Login"
              className="shrink-0"
            >
              <UserRound className="h-4 w-4" />
            </Button>
          ) : inDashboard ? (
            // Inside dashboard: show only Logout (icon with no label)
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                logout()
                router.push("/")
              }}
              aria-label="Logout"
              className="shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          ) : (
            // After login on non-dashboard: show Admin button to /dashboard
            <Button size="sm" onClick={() => router.push("/dashboard")} aria-label="Go to dashboard">
              Admin
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
