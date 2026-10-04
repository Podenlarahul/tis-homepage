
'use client'
import { useScrollProgress } from '@/hooks/useScrollProgress'
export function ScrollProgress() {
  const p = useScrollProgress()
  return <div className="fixed top-0 left-0 right-0 h-[3px] z-[9999] origin-left pointer-events-none"><div className="h-full bg-[#C5A880] will-change-transform" style={{ width: `${p}%` }} /></div>
}
