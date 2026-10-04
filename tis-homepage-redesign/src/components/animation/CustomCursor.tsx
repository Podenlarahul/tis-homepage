
'use client'
import { useEffect, useRef, useState } from 'react'
export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const mouse = useRef({ x: -100, y: -100 })
  const ring = useRef({ x: -100, y: -100 })
  const dot = useRef({ x: -100, y: -100 })
  const [hover, setHover] = useState(false)
  useEffect(() => {
    const onMove = (e: MouseEvent) => { mouse.current.x = e.clientX; mouse.current.y = e.clientY }
    const onOver = (e: MouseEvent) => { const t = e.target as HTMLElement; if (t.closest('a, button, [data-cursor-hover]')) setHover(true); else setHover(false) }
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver)
    let raf = 0
    const tick = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.14
      ring.current.y += (mouse.current.y - ring.current.y) * 0.14
      dot.current.x += (mouse.current.x - dot.current.x) * 0.35
      dot.current.y += (mouse.current.y - dot.current.y) * 0.35
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) translate(-50%, -50%) scale(${hover ? 1.8 : 1})`
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${dot.current.x}px, ${dot.current.y}px, 0) translate(-50%, -50%)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseover', onOver); cancelAnimationFrame(raf) }
  }, [hover])
  return (<><div ref={ringRef} className="custom-cursor fixed top-0 left-0 w-8 h-8 rounded-full border border-[#C5A880] pointer-events-none z-[9998]" style={{ opacity: hover ? 0.9 : 0.6 }} /><div ref={dotRef} className="custom-cursor fixed top-0 left-0 w-[6px] h-[6px] rounded-full bg-[#C5A880] pointer-events-none z-[9998]" style={{ opacity: hover ? 0 : 1 }} /></>)
}
