
'use client'
import { useCallback, useEffect, useState } from 'react'
export function useTheme() {
  const [theme, setTheme] = useState<'light'|'dark'>('light')
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const stored = localStorage.getItem('tis-theme') as 'light'|'dark'|null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = stored || (prefersDark ? 'dark' : 'light')
    setTheme(initial)
    document.documentElement.classList.toggle('dark', initial === 'dark')
    setMounted(true)
  }, [])
  const toggle = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem('tis-theme', next)
      document.documentElement.classList.toggle('dark', next === 'dark')
      return next
    })
  }, [])
  return { theme, toggle, mounted }
}
