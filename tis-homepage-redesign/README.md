
# Tulas International School (TIS) - Homepage Redesign
A modern, animated redesign of the Tulas International School homepage focusing on high conversion, fluid animations, and mobile responsiveness.

## 🚀 Live Demo
- **Live URL:** https://tis-redesign.vercel.app
- **Repository:** https://github.com/your-username/tis-homepage-redesign
- **Preview:** Fixed artifact built with Next.js 14 + Tailwind + Framer Motion patterns

## 🛠 Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion patterns via RAF + IntersectionObserver
- **Icons:** Lucide React
- **Deployment:** Vercel

## ✨ Standout Features Implemented (4/4)
1. **Custom Cursor:** RAF lerp 0.14/0.35, scale 1.8x on hover, hidden on coarse pointer
2. **Scroll Reveals:** IntersectionObserver once:true, 0.3-0.6s, stagger
3. **Theme Switcher:** CSS variables + localStorage + animated sun/moon
4. **Scroll Progress:** Fixed top 3px, width = scroll %

## 📦 Getting Started Locally
```bash
git clone https://github.com/your-username/tis-homepage-redesign.git
cd tis-homepage-redesign
npm install
npm run dev
```
Open http://localhost:3000

## Component Architecture Overview
- `components/ui/` - Button, Card, Badge
- `components/layout/` - Navbar, Footer
- `components/sections/` - Hero, About, Academics, Campus, Testimonials, CTA
- `components/animation/` - Cursor, Scroll Progress, Reveal
- `hooks/` - useScrollProgress, useTheme, useScrollReveal, useMagnetic
- `data/` - navigation, stats
- `styles/` - globals.css

## Brand Identity Retained
- Navy #0A1931, Gold #C5A880, Cream #FFFBF5
- Copy from tis.edu.in - 22 acre CBSE boarding, best boarding school Dehradun
- Playfair Display + Inter

## Deployment
```bash
npm run build
vercel --prod
```
