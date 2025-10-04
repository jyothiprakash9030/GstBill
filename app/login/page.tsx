"use client"
import { useState } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import { login } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"
import { Eye, EyeOff } from "lucide-react"
import { AlertDialogDescription } from "@radix-ui/react-alert-dialog"

export default function LoginPage() {
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (login(username.trim(), password)) {
      setOpen(true)
      toast({ title: "Login successful", description: "Redirecting to dashboard..." })
      setTimeout(() => {
        setOpen(false)
        router.push("/dashboard")
      }, 1200)
    } else {
      toast({ title: "Invalid credentials", description: "Use user: test, password: test@123", variant: "destructive" })
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <SiteNavbar />
      <div className="flex-1 grid place-items-center bg-gray-50 px-4">
        <form onSubmit={submit} className="w-full max-w-sm bg-white p-6 rounded-lg border space-y-4">
          <div className="space-y-2">
            <Label htmlFor="u">User name</Label>
            <Input id="u" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p">Password</Label>
            <div className="relative">
              <Input
                id="p"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 px-3 grid place-items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
      </div>
      <SiteFooter />
      <AlertDialog open={open}>
      <AlertDialogContent>
  <AlertDialogHeader>
    <AlertDialogTitle>Login successful</AlertDialogTitle>
    <AlertDialogDescription>
      You will be redirected to the dashboard.
    </AlertDialogDescription>
  </AlertDialogHeader>
</AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
