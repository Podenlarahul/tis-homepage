
'use client'
import { useEffect, useRef, useState } from 'react'
export function useMagnetic(strength = 0.28) {
  const ref = useRef<any>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const el = ref.current as HTMLElement
    if (!el) return
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const x = e.clientX - (r.left + r.width / 2)
      const y = e.clientY - (r.top + r.height / 2)
      setPos({ x: x * strength, y: y * strength })
    }
    const leave = () => setPos({ x: 0, y: 0 })
    el.addEventListener('mousemove', move)
    el.addEventListener('mouseleave', leave)
    return () => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave) }
  }, [strength])
  return { ref, style: { transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` } as React.CSSProperties }
}
