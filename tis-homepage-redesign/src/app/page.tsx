import React, { useEffect, useRef, useState, useCallback } from "react";

// ───────────────────────── Hooks ─────────────────────────

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const p = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        setProgress(p);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return progress;
}

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("tis-theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved || (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
    setMounted(true);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("tis-theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  }, []);

  return { theme, toggle, mounted };
}

function useScrollReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(entry.target);
        }
      },
      { threshold, rootMargin: "0px 0px -80px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useMagnetic(strength = 0.28) {
  const ref = useRef<HTMLButtonElement & HTMLAnchorElement>(null) as any;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
    };
    const onLeave = () => {
      el.style.transform = "translate3d(0,0,0)";
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);
  return ref;
}

function useCountUp(target: number, trigger: boolean, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start: number | null = null;
    let raf = 0;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
      else setValue(target);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, trigger, duration]);
  return value;
}

// ───────────────────────── Components ─────────────────────────

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className = "",
}) => {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

// ───────────────────────── Main App ─────────────────────────

export default function App() {
  const progress = useScrollProgress();
  const { theme, toggle, mounted } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [toast, setToast] = useState("");

  // Cursor refs
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const dotPos = useRef({ x: -100, y: -100 });
  const hoverRef = useRef(false);

  // Scroll detection for navbar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Custom cursor RAF
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const move = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener("mousemove", move);

    let raf = 0;
    const animate = () => {
      // lerp
      ringPos.current.x += (mouse.current.x - ringPos.current.x) * 0.14;
      ringPos.current.y += (mouse.current.y - ringPos.current.y) * 0.14;
      dotPos.current.x += (mouse.current.x - dotPos.current.x) * 0.35;
      dotPos.current.y += (mouse.current.y - dotPos.current.y) * 0.35;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%) scale(${hoverRef.current ? 1.8 : 1})`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    const handleEnter = () => (hoverRef.current = true);
    const handleLeave = () => (hoverRef.current = false);
    const attach = () => {
      document.querySelectorAll("a, button, [data-cursor-hover]").forEach((el) => {
        el.addEventListener("mouseenter", handleEnter);
        el.addEventListener("mouseleave", handleLeave);
      });
    };
    attach();
    const obs = new MutationObserver(attach);
    obs.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
      obs.disconnect();
      document.querySelectorAll("a, button, [data-cursor-hover]").forEach((el) => {
        el.removeEventListener("mouseenter", handleEnter);
        el.removeEventListener("mouseleave", handleLeave);
      });
    };
  }, []);

  // Toast
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3800);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  const magneticPrimary = useMagnetic(0.22);
  const magneticSecondary = useMagnetic(0.18);
  const magneticApply = useMagnetic(0.28);

  // Stats countup
  const statsReveal = useScrollReveal(0.2);
  const c22 = useCountUp(22, statsReveal.visible);
  const c2013 = useCountUp(2013, statsReveal.visible);
  const c100 = useCountUp(100, statsReveal.visible);
  const c25 = useCountUp(25, statsReveal.visible);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        :root{
          --bg:#FFFBF5;
          --bg-soft:#F6F0E8;
          --card:#FFFFFF;
          --text:#0A1931;
          --text-muted:rgba(10,25,49,0.62);
          --border:rgba(10,25,49,0.08);
          --gold:#C5A880;
          --navy:#0A1931;
          --green:#22c55e;
        }
        .dark{
          --bg:#0F0F10;
          --bg-soft:#17171A;
          --card:#1C1C1F;
          --text:#FFFBF5;
          --text-muted:rgba(255,251,245,0.62);
          --border:rgba(255,251,245,0.08);
        }
        *{font-family:Inter, system-ui, -apple-system, sans-serif;}
        h1,h2,h3,.serif{font-family:"Playfair Display", Georgia, serif;}
        html{scroll-behavior:smooth;}
        body{
          background:var(--bg);
          color:var(--text);
          transition: background-color 0.4s ease, color 0.4s ease;
          overflow-x:hidden;
          -webkit-font-smoothing:antialiased;
        }
        ::selection{background:var(--gold); color:var(--navy);}
        @keyframes marquee{
          0%{transform:translateX(0)}
          100%{transform:translateX(-50%)}
        }
        @keyframes float{
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-6px)}
        }
        @keyframes pulse-dot{
          0%{box-shadow:0 0 0 0 rgba(34,197,94,0.5)}
          70%{box-shadow:0 0 0 6px rgba(34,197,94,0)}
          100%{box-shadow:0 0 0 0 rgba(34,197,94,0)}
        }
        @keyframes scrollMouse{
          0%{transform:translateY(0); opacity:1}
          100%{transform:translateY(8px); opacity:0}
        }
        .custom-cursor{
          position:fixed;
          top:0; left:0;
          pointer-events:none;
          z-index:10000;
          will-change:transform;
        }
        .cursor-ring{
          width:32px; height:32px;
          border:1px solid var(--gold);
          border-radius:9999px;
          transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
          background: rgba(197,168,128,0.06);
        }
        .cursor-dot{
          width:6px; height:6px;
          background:var(--gold);
          border-radius:9999px;
        }
        @media (pointer: coarse){
          .custom-cursor{display:none !important}
        }
        @media (pointer: fine){
          *{cursor:none !important}
          a, button{cursor:none !important}
        }
        .glass{
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          background: rgba(255,255,255,0.82);
          border:1px solid rgba(10,25,49,0.08);
        }
        .dark .glass{
          background: rgba(28,28,31,0.76);
          border-color: rgba(255,251,245,0.08);
        }
      `}</style>

      {/* Progress */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          zIndex: 9999,
          background: "transparent",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "var(--gold)",
            transition: "width 0.1s linear",
          }}
        />
      </div>

      {/* Custom cursor */}
      <div ref={ringRef} className="custom-cursor cursor-ring" />
      <div ref={dotRef} className="custom-cursor cursor-dot" />

      {/* Navbar */}
      <header
        className={`fixed top-[3px] inset-x-0 z-50 transition-all duration-500 ${
          scrolled ? "py-3" : "py-5"
        }`}
      >
        <div
          className={`mx-auto max-w-[1280px] px-5 md:px-8 flex items-center justify-between transition-all duration-500 ${
            scrolled
              ? "glass rounded-full shadow-[0_8px_32px_rgba(10,25,49,0.08)] py-3 px-5 md:px-7"
              : "bg-transparent"
          }`}
        >
          {/* Logo */}
          <a href="#" className="flex items-center gap-3" data-cursor-hover aria-label="Tulas International School home">
            <div className="w-9 h-9 rounded-[10px] bg-[#0A1931] dark:bg-white flex items-center justify-center text-white dark:text-[#0A1931] font-bold text-[15px] tracking-[0.02em] serif">
              TIS
            </div>
            <span className="serif font-semibold text-[15px] md:text-[16px] tracking-tight leading-none">
              Tula&apos;s International School
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {[
              { label: "About", id: "about" },
              { label: "Academics", id: "academics" },
              { label: "Campus Life", id: "campus" },
              { label: "Admissions", id: "admissions" },
            ].map((l) => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                data-cursor-hover
                className="text-[13.5px] font-medium tracking-wide opacity-80 hover:opacity-100 transition-opacity"
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              data-cursor-hover
              aria-label="Toggle theme"
              className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors"
              style={{ borderColor: "var(--border)", background: "var(--card)" }}
            >
              {mounted && (
                <span className="relative w-4 h-4 block overflow-hidden">
                  <span
                    className={`absolute inset-0 transition-all duration-400 ${
                      theme === "light" ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0"
                    }`}
                  >
                    {/* Sun */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                    </svg>
                  </span>
                  <span
                    className={`absolute inset-0 transition-all duration-400 ${
                      theme === "dark" ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                    }`}
                  >
                    {/* Moon */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  </span>
                </span>
              )}
            </button>

            <a
              ref={magneticApply as any}
              href="#admissions"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("admissions");
              }}
              data-cursor-hover
              className="hidden md:inline-flex h-9 px-5 rounded-full bg-[#C5A880] text-[#0A1931] text-[13px] font-semibold tracking-wide items-center justify-center transition-transform will-change-transform"
            >
              Apply Now
            </a>

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              data-cursor-hover
              aria-label="Menu"
              className="lg:hidden w-9 h-9 rounded-full border flex items-center justify-center"
              style={{ borderColor: "var(--border)", background: "var(--card)" }}
            >
              <span className="w-[14px] h-[11px] flex flex-col justify-between">
                <span className={`h-[1.5px] bg-current block transition-all ${mobileOpen ? "rotate-45 translate-y-[4.5px]" : ""}`} />
                <span className={`h-[1.5px] bg-current block transition-all ${mobileOpen ? "opacity-0" : ""}`} />
                <span className={`h-[1.5px] bg-current block transition-all ${mobileOpen ? "-rotate-45 -translate-y-[4.5px]" : ""}`} />
              </span>
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div
          className={`lg:hidden fixed inset-0 z-40 transition ${mobileOpen ? "visible" : "invisible"}`}
          aria-hidden={!mobileOpen}
        >
          <div
            className={`absolute inset-0 bg-[#0A1931]/30 backdrop-blur-sm transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"}`}
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={`absolute top-0 right-0 h-[100dvh] w-[84%] max-w-[360px] bg-[var(--card)] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              mobileOpen ? "translate-x-0" : "translate-x-full"
            } p-8 pt-24 flex flex-col gap-7`}
          >
            {[
              { label: "About", id: "about" },
              { label: "Academics", id: "academics" },
              { label: "Campus Life", id: "campus" },
              { label: "Admissions", id: "admissions" },
            ].map((l) => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                className="text-left text-[22px] serif font-medium tracking-tight"
              >
                {l.label}
              </button>
            ))}
            <a
              href="#admissions"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("admissions");
              }}
              className="mt-4 h-12 rounded-full bg-[#C5A880] text-[#0A1931] font-semibold flex items-center justify-center"
            >
              Apply Now
            </a>
            <p className="mt-auto text-[12px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Dhoolkot, P.O. Selaqui, Chakrata Road,
              <br /> Dehradun - 248011
            </p>
          </div>
        </div>
      </header>

      <main className="pt-[88px]">
        {/* HERO */}
        <section className="relative max-w-[1280px] mx-auto px-5 md:px-8 pb-12 md:pb-20">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-8 items-center">
            <div>
              <Reveal>
                <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full border text-[11px] font-semibold tracking-[0.08em] uppercase" style={{ borderColor: "var(--border)", background: "var(--bg-soft)" }}>
                  <span
                    className="w-2 h-2 rounded-full bg-[#22c55e]"
                    style={{ animation: "pulse-dot 2s infinite" }}
                  />
                  Admissions Open 2026-27
                </div>
              </Reveal>

              <Reveal delay={80}>
                <h1 className="serif mt-7 text-[40px] md:text-[56px] lg:text-[62px] leading-[0.95] tracking-[-0.03em] font-[600]">
                  Modern Learning in a <br />
                  <span className="relative inline-block">
                    <span className="relative z-10">Traditional Setting</span>
                    <span className="absolute bottom-[0.15em] left-0 right-0 h-[0.36em] bg-[#C5A880]/40 -rotate-[0.6deg] -z-0" />
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={160}>
                <p className="mt-6 text-[15.5px] md:text-[17px] leading-[1.7] max-w-[56ch]" style={{ color: "var(--text-muted)" }}>
                  Tula&apos;s International School, spread over 22 acres at Dhoolkot, Dehradun, is CBSE&apos;s finest boarding school for
                  girls &amp; boys. Where historic charm meets smart boards, VR labs, and timeless values.
                </p>
              </Reveal>

              <Reveal delay={240}>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    ref={magneticPrimary as any}
                    data-cursor-hover
                    onClick={() => scrollTo("admissions")}
                    className="h-[48px] px-7 rounded-full bg-[#0A1931] dark:bg-[#FFFBF5] text-white dark:text-[#0A1931] text-[14px] font-semibold tracking-wide inline-flex items-center justify-center gap-2 will-change-transform transition-transform"
                  >
                    Start Your Application
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button
                    ref={magneticSecondary as any}
                    data-cursor-hover
                    onClick={() => showToast("Virtual tour launching soon — preview copy generated")}
                    className="h-[48px] px-7 rounded-full border text-[14px] font-semibold tracking-wide inline-flex items-center justify-center gap-2 will-change-transform"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <span className="w-7 h-7 rounded-full bg-[var(--bg-soft)] border flex items-center justify-center" style={{ borderColor: "var(--border)" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5.14v14l11-7-11-7z" />
                      </svg>
                    </span>
                    Take Virtual Tour
                  </button>
                </div>
              </Reveal>

              <div className="hidden md:flex mt-14 items-center gap-3 text-[11px] tracking-[0.12em] uppercase opacity-60">
                <div className="w-10 h-[42px] rounded-full border flex items-start justify-center pt-2" style={{ borderColor: "var(--border)" }}>
                  <div className="w-[3px] h-[8px] rounded-full bg-current" style={{ animation: "scrollMouse 1.4s infinite" }} />
                </div>
                Scroll to explore
              </div>
            </div>

            {/* Visual */}
            <Reveal delay={120} className="relative">
              <div className="relative">
                <div className="rounded-[24px] overflow-hidden aspect-[4/3] md:aspect-[1.15] bg-[var(--bg-soft)]">
                  <img
                    src="https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=2000"
                    alt="Tula's International School campus"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating cards */}
                <div
                  className="absolute -left-3 md:-left-8 top-[14%] glass rounded-[16px] px-4 py-3 shadow-[0_12px_32px_rgba(10,25,49,0.10)] max-w-[200px]"
                  style={{ animation: "float 5s ease-in-out infinite" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#0A1931] text-white flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c0 2 2.5 3 6 3s6-1 6-3v-5" />
                      </svg>
                    </div>
                    <div className="text-[11px] font-semibold tracking-wide leading-tight">
                      CBSE Affiliated
                      <br />
                      <span className="opacity-60 font-medium">100% Boarding</span>
                    </div>
                  </div>
                </div>

                <div
                  className="absolute -right-2 md:-right-6 bottom-[10%] glass rounded-[18px] px-5 py-4 shadow-[0_16px_40px_rgba(10,25,49,0.12)] w-[232px]"
                  style={{ animation: "float 5.6s ease-in-out infinite reverse" }}
                >
                  <div className="text-[11px] tracking-[0.1em] uppercase opacity-60 font-semibold">Campus Insight</div>
                  <div className="serif mt-1 text-[16px] leading-tight font-semibold">22 Acres of Learning &amp; Growth</div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {["https://i.pravatar.cc/32?img=32", "https://i.pravatar.cc/32?img=12", "https://i.pravatar.cc/32?img=8"].map((src, i) => (
                        <img key={i} src={src} alt="Student avatar" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                      ))}
                    </div>
                    <span className="text-[12px] font-medium" style={{ color: "var(--text-muted)" }}>
                      600+ Students
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* STATS */}
        <section ref={statsReveal.ref as any} className="border-y" style={{ borderColor: "var(--border)", background: "var(--bg-soft)" }}>
          <div className="max-w-[1280px] mx-auto px-5 md:px-8 grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0" style={{ borderColor: "var(--border)" } as any}>
            {[
              { val: c22, suffix: "+", label: "Acres Campus", sub: "Dhoolkot, Dehradun" },
              { val: c2013, suffix: "", label: "Established", sub: "Legacy of trust" },
              { val: c100, suffix: "%", label: "CBSE Boarding", sub: "Girls & Boys" },
              { val: c25, suffix: "+", label: "Sports & Activities", sub: "Holistic growth" },
            ].map((s, i) => (
              <div key={i} className="py-8 md:py-10 px-2 md:px-6">
                <div className="serif text-[34px] md:text-[40px] leading-none font-semibold tracking-[-0.02em]">
                  {s.val}
                  {s.suffix}
                </div>
                <div className="mt-2 text-[13px] font-semibold tracking-wide">{s.label}</div>
                <div className="text-[12px] mt-1" style={{ color: "var(--text-muted)" }}>
                  {s.sub}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="max-w-[1280px] mx-auto px-5 md:px-8 py-16 md:py-28">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-10 lg:gap-16 items-start">
            <Reveal>
              <div className="relative">
                <div className="rounded-[22px] overflow-hidden aspect-[4/5] bg-[var(--bg-soft)]">
                  <img
                    src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200"
                    alt="Students collaborating"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -right-5 -bottom-8 w-[58%] rounded-[18px] overflow-hidden aspect-[4/3] shadow-[0_18px_50px_rgba(10,25,49,0.18)] border-[6px] border-[var(--bg)]">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800"
                    alt="Historic manor classroom"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -left-4 top-[42%] glass rounded-full px-4 py-2 text-[11px] font-semibold tracking-wide shadow-lg">
                  Est. 2013 • CBSE
                </div>
              </div>
            </Reveal>

            <div>
              <Reveal>
                <div className="text-[11px] tracking-[0.14em] uppercase font-semibold opacity-60">Our Philosophy</div>
                <h2 className="serif mt-4 text-[32px] md:text-[44px] leading-[1.02] tracking-[-0.03em] font-semibold max-w-[18ch]">
                  An Incredible Fusion of Modern Learning and Traditional Values
                </h2>
              </Reveal>

              <Reveal delay={100}>
                <p className="mt-6 text-[15.5px] leading-[1.75]" style={{ color: "var(--text-muted)" }}>
                  Housed in a historic manor repurposed with purpose, TIS brings together smart boards, VR labs and 22 acres of
                  playgrounds where respect, kindness and integrity are lived every day. We balance coding with classics, AI &
                  robotics with philosophical debates, community service, Founder&apos;s Day and Sports Day traditions.
                </p>
              </Reveal>

              <Reveal delay={180}>
                <div className="mt-7 flex flex-wrap gap-2">
                  {["Respect", "Kindness", "Integrity", "Excellence"].map((v) => (
                    <span
                      key={v}
                      data-cursor-hover
                      className="px-4 py-2 rounded-full border text-[12px] font-medium tracking-wide"
                      style={{ borderColor: "var(--border)", background: "var(--card)" }}
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={240}>
                <button
                  onClick={() => showToast("About brochure copy ready — contact team for campus visit")}
                  data-cursor-hover
                  className="mt-8 h-11 px-6 rounded-full border text-[13px] font-semibold inline-flex items-center gap-2"
                  style={{ borderColor: "var(--text)", color: "var(--text)" }}
                >
                  Learn More
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </button>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ACADEMIC PILLARS */}
        <section id="academics" className="py-16 md:py-24" style={{ background: "var(--bg-soft)" }}>
          <div className="max-w-[1280px] mx-auto px-5 md:px-8">
            <Reveal>
              <div className="text-[11px] tracking-[0.14em] uppercase font-semibold opacity-60">Academics</div>
              <h2 className="serif mt-4 text-[30px] md:text-[44px] leading-[1.05] tracking-[-0.03em] font-semibold max-w-[16ch]">
                Holistic Education That Prepares Global Citizens
              </h2>
            </Reveal>

            <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  k: "01",
                  title: "Academic Excellence",
                  desc: "IIT/JEE, NEET integrated prep, smart boards, VR labs, personal mentoring and 100% CBSE focus.",
                  icon: "🎓",
                },
                {
                  k: "02",
                  title: "Sports & Fitness",
                  desc: "Cricket, football, swimming, squash, horse riding, basketball and 25+ activities for resilience.",
                  icon: "⚽",
                },
                {
                  k: "03",
                  title: "Leadership & Character",
                  desc: "Prefectorial system, debates, community service, Founder's Day rituals that build integrity.",
                  icon: "🌿",
                },
                {
                  k: "04",
                  title: "Global Exposure",
                  desc: "Student Exchange, Model UN, international collaborations and cross-cultural immersions.",
                  icon: "🌍",
                },
              ].map((card, i) => (
                <Reveal key={card.k} delay={i * 80}>
                  <div
                    data-cursor-hover
                    className="group rounded-[20px] p-6 bg-[var(--card)] border transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(10,25,49,0.10)] hover:border-[#C5A880]/60 min-h-[248px] flex flex-col"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] tracking-[0.14em] opacity-50 font-semibold">{card.k}</span>
                      <span className="text-[18px]">{card.icon}</span>
                    </div>
                    <h3 className="serif mt-5 text-[19px] font-semibold leading-tight">{card.title}</h3>
                    <p className="mt-3 text-[13.5px] leading-[1.6]" style={{ color: "var(--text-muted)" }}>
                      {card.desc}
                    </p>
                    <div className="mt-auto pt-6 flex items-center gap-2 text-[12px] font-semibold opacity-70 group-hover:opacity-100">
                      Explore <span aria-hidden>→</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            {/* Bento facilities */}
            <div className="mt-6 grid md:grid-cols-12 gap-5">
              {[
                { title: "World-Class Boarding", sub: "Safe, warm, pastoral care", span: "md:col-span-5", img: "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1000" },
                { title: "Advanced Labs", sub: "AI, Robotics, VR", span: "md:col-span-4", img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000" },
                { title: "Sports Arena", sub: "Squash to horse riding", span: "md:col-span-3", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000" },
                { title: "Library", sub: "Classics & digital archives", span: "md:col-span-7", img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1000" },
                { title: "22 Acre Green Campus", sub: "Dhoolkot, Dehradun", span: "md:col-span-5", img: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?q=80&w=1000" },
              ].map((b, idx) => (
                <Reveal key={idx} delay={idx * 60} className={`${b.span}`}>
                  <div className="rounded-[20px] overflow-hidden border bg-[var(--card)] flex h-[220px] group" style={{ borderColor: "var(--border)" }}>
                    <div className="flex-1 p-6 flex flex-col justify-center">
                      <div className="serif text-[18px] font-semibold leading-tight">{b.title}</div>
                      <div className="mt-1 text-[12px]" style={{ color: "var(--text-muted)" }}>{b.sub}</div>
                    </div>
                    <div className="w-[44%] overflow-hidden">
                      <img src={b.img} alt={b.title} className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-700" />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CAMPUS LIFE GRID */}
        <section id="campus" className="max-w-[1280px] mx-auto px-5 md:px-8 py-16 md:py-28">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-[11px] tracking-[0.14em] uppercase font-semibold opacity-60">Campus Life</div>
                <h2 className="serif mt-4 text-[30px] md:text-[42px] leading-[1.05] tracking-[-0.03em] font-semibold">Life at Tula&apos;s Beyond Classrooms</h2>
              </div>
              <div className="text-[13px] max-w-[32ch]" style={{ color: "var(--text-muted)" }}>
                A boarding experience that shapes character — sports, music, leadership, and mountain air.
              </div>
            </div>
          </Reveal>

          <div className="mt-10 grid md:grid-cols-12 gap-4 auto-rows-[220px] md:auto-rows-[260px]">
            {[
              { title: "Horse Riding", img: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=1000", span: "md:col-span-8" },
              { title: "Swimming", img: "https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=1000", span: "md:col-span-4" },
              { title: "Smart Classrooms", img: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1000", span: "md:col-span-4" },
              { title: "Cultural Fest", img: "https://images.unsplash.com/photo-1516450360452-9312abbf6f7e?q=80&w=1000", span: "md:col-span-4" },
              { title: "Boarding Life", img: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000", span: "md:col-span-4" },
              { title: "VR Labs", img: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=1000", span: "md:col-span-12 md:row-span-1" },
            ].map((c, i) => (
              <Reveal key={i} delay={i * 70} className={`${c.span} h-full`}>
                <div data-cursor-hover className="relative rounded-[20px] overflow-hidden h-full group border" style={{ borderColor: "var(--border)" }}>
                  <img src={c.img} alt={c.title} className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1931]/70 via-[#0A1931]/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 flex items-center justify-between">
                    <span className="serif text-white text-[18px] font-semibold tracking-tight">{c.title}</span>
                    <span className="w-8 h-8 rounded-full bg-white/90 text-[#0A1931] flex items-center justify-center text-[12px]">↗</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="border-y py-16 md:py-24" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
          <div className="max-w-[1280px] mx-auto px-5 md:px-8">
            <Reveal>
              <div className="text-[11px] tracking-[0.14em] uppercase font-semibold opacity-60">Community Voices</div>
              <h2 className="serif mt-4 text-[30px] md:text-[42px] leading-[1.05] tracking-[-0.03em] font-semibold">What Parents &amp; Students Say</h2>
            </Reveal>

            <div className="mt-10 grid md:grid-cols-3 gap-5">
              {[
                { q: "TIS gave my daughter confidence, discipline and a global outlook — all while keeping our values intact.", name: "Mrs. Sharma", role: "Parent, Class 11" },
                { q: "From squash court to Model UN — every day feels like growth. The 22-acre campus is pure freedom.", name: "Arjun Mehta", role: "Student, Class 12" },
                { q: "Best decision for our son. Pastoral care is exceptional, academics are integrated and future-ready.", name: "Mr. Singh", role: "Parent, Class 9" },
              ].map((t, i) => (
                <Reveal key={i} delay={i * 90}>
                  <div className="rounded-[20px] border p-7 bg-[var(--bg-soft)] min-h-[200px] flex flex-col" style={{ borderColor: "var(--border)" }}>
                    <div className="text-[28px] leading-none opacity-20 serif">“</div>
                    <p className="mt-1 text-[15px] leading-[1.6]">{t.q}</p>
                    <div className="mt-auto pt-6 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0A1931] text-white flex items-center justify-center text-[12px] font-semibold">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold leading-tight">{t.name}</div>
                        <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>{t.role}</div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Marquee */}
          <div className="mt-14 border-y py-3 overflow-hidden" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
            <div className="flex w-max" style={{ animation: "marquee 42s linear infinite" }}>
              {[0, 1].map((dup) => (
                <div key={dup} className="flex gap-10 pr-10 shrink-0 items-center">
                  {"CBSE Affiliated • 22 Acre Campus • 100% Boarding • Student Exchange • Model UN • IIT-JEE Integrated • Horse Riding • Squash • Swimming • Smart Boards • VR Labs • ".split("•").map((part, i) => (
                    <span key={`${dup}-${i}`} className="text-[13px] font-semibold tracking-[0.12em] uppercase whitespace-nowrap opacity-70">
                      {part.trim()}
                      {i < 11 ? <span className="mx-10 opacity-30">•</span> : null}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="admissions" className="max-w-[1280px] mx-auto px-5 md:px-8 py-14 md:py-20">
          <div className="rounded-[28px] md:rounded-[32px] overflow-hidden bg-[#0A1931] text-[#FFFBF5] p-6 md:p-10 lg:p-12 grid lg:grid-cols-[1.05fr_0.9fr] gap-10 relative">
            {/* gold glow */}
            <div className="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-[#C5A880]/20 blur-[60px]" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 w-[380px] h-[380px] rounded-full bg-[#C5A880]/10 blur-[60px]" />

            <div className="relative">
              <Reveal>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] tracking-[0.1em] uppercase font-semibold">
                  Admissions Open 2026-27
                </div>
                <h2 className="serif mt-6 text-[32px] md:text-[44px] leading-[0.98] tracking-[-0.03em] font-semibold">
                  Begin Your Child&apos;s Exceptional Journey at TIS
                </h2>
                <p className="mt-5 text-[14px] leading-[1.7] text-white/70 max-w-[48ch]">
                  Dhoolkot, P.O. Selaqui, Chakrata Road, Dehradun – 248011
                  <br /> Helpline +91-9837983791 • info@tis.edu.in
                  <br />
                  Visit campus, take a virtual tour, or request our detailed brochure.
                </p>

                <div className="mt-8 flex flex-wrap gap-2">
                  {["CBSE", "Boarding Girls & Boys", "22 Acres", "Est. 2013"].map((b) => (
                    <span key={b} className="px-3.5 py-1.5 rounded-full bg-white/[0.08] border border-white/10 text-[11px] tracking-wide font-medium">
                      {b}
                    </span>
                  ))}
                </div>

                <div className="mt-10 grid grid-cols-3 gap-6 max-w-[420px]">
                  <div>
                    <div className="text-[22px] serif font-semibold">22+</div>
                    <div className="text-[11px] text-white/60 uppercase tracking-wide">Acres</div>
                  </div>
                  <div>
                    <div className="text-[22px] serif font-semibold">600+</div>
                    <div className="text-[11px] text-white/60 uppercase tracking-wide">Students</div>
                  </div>
                  <div>
                    <div className="text-[22px] serif font-semibold">100%</div>
                    <div className="text-[11px] text-white/60 uppercase tracking-wide">Boarding</div>
                  </div>
                </div>
              </Reveal>
            </div>

            <Reveal delay={120}>
              <div className="relative rounded-[20px] bg-white text-[#0A1931] p-6 md:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
                <div className="serif text-[20px] font-semibold leading-tight">Get Brochure &amp; Fee Details</div>
                <p className="mt-2 text-[13px] leading-[1.6] text-[#0A1931]/60">
                  Share a few details and our admissions team will contact you within 24 hours.
                </p>

                <form
                  className="mt-6 space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    showToast("Application draft copied — team will contact shortly");
                  }}
                >
                  <div>
                    <label className="text-[11px] font-semibold tracking-[0.08em] uppercase opacity-70">Parent Name</label>
                    <input
                      required
                      placeholder="Full name"
                      className="mt-2 w-full h-11 px-4 rounded-full border bg-[#FFFBF5] text-[14px] outline-none focus:border-[#0A1931] transition-colors"
                      style={{ borderColor: "rgba(10,25,49,0.12)" }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold tracking-[0.08em] uppercase opacity-70">Grade Seeking</label>
                      <select className="mt-2 w-full h-11 px-4 rounded-full border bg-[#FFFBF5] text-[14px] outline-none focus:border-[#0A1931]">
                        <option>Grade 4</option>
                        <option>Grade 5</option>
                        <option>Grade 6</option>
                        <option>Grade 7</option>
                        <option>Grade 8</option>
                        <option>Grade 9</option>
                        <option>Grade 11</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold tracking-[0.08em] uppercase opacity-70">Phone</label>
                      <input
                        required
                        placeholder="+91"
                        className="mt-2 w-full h-11 px-4 rounded-full border bg-[#FFFBF5] text-[14px] outline-none focus:border-[#0A1931] transition-colors"
                        style={{ borderColor: "rgba(10,25,49,0.12)" }}
                      />
                    </div>
                  </div>

                  <button
                    data-cursor-hover
                    type="submit"
                    className="w-full h-12 rounded-full bg-[#C5A880] text-[#0A1931] font-semibold text-[14px] tracking-wide hover:brightness-[0.98] active:brightness-[0.96] transition"
                  >
                    Get Brochure &amp; Fee Details
                  </button>
                  <div className="text-[11px] leading-[1.5] text-center text-[#0A1931]/50">
                    No spam. We respect your privacy. Admissions office will call only once.
                  </div>
                </form>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-6" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 py-12 md:py-16 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-[#0A1931] dark:bg-white flex items-center justify-center text-white dark:text-[#0A1931] font-bold serif">TIS</div>
              <span className="serif font-semibold tracking-tight">Tula&apos;s International School</span>
            </div>
            <p className="mt-4 text-[13px] leading-[1.6] max-w-[36ch]" style={{ color: "var(--text-muted)" }}>
              CBSE&apos;s finest boarding school for girls &amp; boys at Dhoolkot, Dehradun. Modern learning in a traditional setting.
            </p>
            <p className="mt-4 text-[12px] leading-[1.6]" style={{ color: "var(--text-muted)" }}>
              Dhoolkot, P.O. Selaqui, Chakrata Road, Dehradun - 248011
              <br />
              +91-9837983791 • info@tis.edu.in
            </p>
            <div className="mt-5 flex gap-2">
              {[
                { l: "IG", href: "#" },
                { l: "FB", href: "#" },
                { l: "YT", href: "#" },
              ].map((s) => (
                <a key={s.l} href={s.href} data-cursor-hover className="w-8 h-8 rounded-full border flex items-center justify-center text-[11px] font-semibold" style={{ borderColor: "var(--border)" }}>
                  {s.l}
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="text-[11px] tracking-[0.12em] uppercase font-semibold opacity-60">Quick Links</div>
            <div className="mt-4 flex flex-col gap-2.5 text-[13px]">
              {["About Us", "Campus Tour", "Admissions", "Contact"].map((l) => (
                <a key={l} href="#" className="opacity-80 hover:opacity-100 transition-opacity" data-cursor-hover>
                  {l}
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="text-[11px] tracking-[0.12em] uppercase font-semibold opacity-60">Academics</div>
            <div className="mt-4 flex flex-col gap-2.5 text-[13px]">
              {["CBSE Curriculum", "Sports", "Boarding", "Global Programs"].map((l) => (
                <a key={l} href="#" className="opacity-80 hover:opacity-100 transition-opacity" data-cursor-hover>
                  {l}
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="text-[11px] tracking-[0.12em] uppercase font-semibold opacity-60">Contact</div>
            <div className="mt-4 text-[13px] leading-[1.6]" style={{ color: "var(--text-muted)" }}>
              Admissions Helpline
              <br />
              <span className="text-[15px] font-semibold" style={{ color: "var(--text)" }}>+91-9837983791</span>
              <br />
              <br />
              Mon–Sat, 9am – 6pm IST
              <br />
              Virtual tours available
            </div>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-5 md:px-8 py-6 border-t flex flex-wrap items-center justify-between gap-3 text-[11px]" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
          <span>© {new Date().getFullYear()} Tula&apos;s International School, Dehradun. All rights reserved.</span>
          <span>CBSE Affiliated • Est. 2013 • 22 Acres • Dhoolkot</span>
        </div>
      </footer>

      {/* Toast */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9998] transition-all duration-500 ${toast ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"}`}
      >
        <div className="rounded-full px-5 py-3 bg-[#0A1931] text-white text-[13px] font-medium shadow-[0_12px_40px_rgba(0,0,0,0.3)] flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-[#C5A880] text-[#0A1931] flex items-center justify-center text-[12px]">✓</span>
          {toast}
        </div>
      </div>
    </>
  );
}
