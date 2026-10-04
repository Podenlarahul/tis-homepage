
'use client'
import { useScrollReveal } from '@/hooks/useScrollReveal'
export function Reveal({ children, delay=0 }: { children: React.ReactNode, delay?: number }) {
  const { ref, isVisible } = useScrollReveal()
  return <div ref={ref as any} style={{ transitionDelay: `${delay}ms`, opacity: isVisible ? 1 : 0, transform: isVisible ? 'translate3d(0,0,0)' : 'translate3d(0,24px,0)', transition: 'all 0.6s cubic-bezier(0.22,1,0.36,1)' }}>{children}</div>
}
