"use client"
const AUTH_KEY = "authUser"

export function login(u: string, p: string) {
  if (u === "test" && p === "test@123") {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ u, t: Date.now() }))
    return true
  }
  return false
}
export function logout() {
  localStorage.removeItem(AUTH_KEY)
}
export function isLoggedIn() {
  try {
    return !!localStorage.getItem(AUTH_KEY)
  } catch {
    return false
  }
}
