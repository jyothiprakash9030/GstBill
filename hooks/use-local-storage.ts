"use client"
import { useEffect, useState } from "react"
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial)
  useEffect(() => {
    const r = localStorage.getItem(key)
    if (r) setValue(JSON.parse(r))
  }, [key])
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])
  return [value, setValue] as const
}
