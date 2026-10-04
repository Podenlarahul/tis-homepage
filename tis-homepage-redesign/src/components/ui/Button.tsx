
'use client'
import { useMagnetic } from '@/hooks/useMagnetic'
export function Button({ children, variant='primary', ...props }: any) {
  const mag = useMagnetic()
  return <button ref={mag.ref} style={mag.style} className={`h-12 px-6 rounded-full font-semibold text-[13px] tracking-wide will-change-transform ${variant==='primary' ? 'bg-[#C5A880] text-[#0A1931]' : 'border border-current'} `} {...props}>{children}</button>
}
