
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Tula's International School | Best Boarding School in Dehradun",
  description: "Modern Learning in a Traditional Setting - 22 acre CBSE boarding campus at Dhoolkot, Dehradun. Admissions Open 2026-27",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
