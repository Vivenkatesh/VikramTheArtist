import { useState, useEffect } from "react";

interface NavProps {
  mode?: "dark" | "light";
  onToggleTheme?: () => void;
  onNavigateVibeCoding?: () => void;
  isDocked?: boolean;
}

export function Nav({ mode = "dark", onToggleTheme, onNavigateVibeCoding, isDocked = false }: NavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isLight = mode === "light";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`portfolio-nav fixed top-0 left-0 right-0 z-50 flex items-center justify-between transition-all duration-300 pointer-events-auto ${
          isScrolled ? "is-scrolled" : ""
        }`}
        style={{
          padding: isScrolled ? "12px 32px" : "20px 32px",
        }}
      >
        {/* ── Left Placeholder (Maintains flex layout and reserves space for docked search bar) ── */}
        <div
          className="pointer-events-auto transition-all duration-500 ease-out hidden md:block"
          style={{
            width: isDocked ? "clamp(280px, 26vw, 390px)" : "0px",
            height: "44px",
          }}
        />

        {/* ── Desktop Navigation Links (hidden md:flex) ── */}
        <div className="hidden md:flex items-center gap-6 sm:gap-8">
          <a
            href="#work"
            className={`text-[13.5px] font-medium tracking-normal transition-colors duration-200 ${
              isLight ? "text-[#334155] hover:text-[#070e24]" : "text-white/70 hover:text-white"
            }`}
          >
            My Work
          </a>
          <a
            href="#experience"
            className={`text-[13.5px] font-medium tracking-normal transition-colors duration-200 ${
              isLight ? "text-[#334155] hover:text-[#070e24]" : "text-white/70 hover:text-white"
            }`}
          >
            My Experience
          </a>
          <a
            href="/vibe-coding"
            onClick={(e) => {
              if (onNavigateVibeCoding) {
                e.preventDefault();
                onNavigateVibeCoding();
              }
            }}
            className={`text-[13.5px] font-medium tracking-normal transition-colors duration-200 ${
              isLight ? "text-[#334155] hover:text-[#070e24]" : "text-white/70 hover:text-white"
            }`}
          >
            Vibe Coding
          </a>

          {/* Theme toggle */}
          {onToggleTheme && (
            <button
              type="button"
              aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
              onClick={onToggleTheme}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                isLight
                  ? "bg-white/80 border-slate-300/80 text-slate-800 hover:bg-white shadow-xs"
                  : "bg-white/10 border-white/15 text-yellow-300 hover:bg-white/20"
              }`}
              style={{
                width: "36px",
                height: "36px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isLight ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
                </svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4.2" />
                  <path d="M12 2v2.2M12 19.8V22M4.93 4.93l1.56 1.56M17.51 17.51l1.56 1.56M2 12h2.2M19.8 12H22M4.93 19.07l1.56-1.56M17.51 6.49l1.56-1.56" />
                </svg>
              )}
            </button>
          )}

          <a
            href="#contact"
            className="primary-button btn-primary adopt-hero-btn-primary group"
            style={{
              textDecoration: "none",
              padding: "6px 6px 6px 18px",
              fontSize: "13.5px",
              gap: "10px",
            }}
          >
            <span>Get In Touch</span>
            <span
              className="btn-primary-circle-arrow adopt-btn-circle-arrow"
              style={{ width: "28px", height: "28px" }}
            >
              <svg
                className="w-3.5 h-3.5 text-[#3e38f5] stroke-[2.5]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </span>
          </a>
        </div>

        {/* ── Mobile Hamburger Toggle Button (md:hidden) ── */}
        <div className="flex md:hidden items-center gap-3 pointer-events-auto">
          {onToggleTheme && (
            <button
              type="button"
              aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
              onClick={onToggleTheme}
              className={`p-2 rounded-full border transition-all ${
                isLight ? "bg-white/90 border-slate-300 text-slate-800" : "text-white/70 hover:text-white bg-white/5 border border-white/10"
              }`}
            >
              {isLight ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4.2" />
                  <path d="M12 2v2.2M12 19.8V22M4.93 4.93l1.56 1.56M17.51 17.51l1.56 1.56M2 12h2.2M19.8 12H22M4.93 19.07l1.56-1.56M17.51 6.49l1.56-1.56" />
                </svg>
              )}
            </button>
          )}

          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`w-10 h-10 rounded-full border flex items-center justify-center active:scale-95 transition-all shadow-md ${
              isLight
                ? "border-slate-300/80 bg-white/90 text-slate-800"
                : "border-white/18 bg-[#090d1c]/80 backdrop-blur-md text-white"
            }`}
          >
            {mobileMenuOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu Dropdown Drawer Overlay ── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden flex flex-col justify-start pt-20 px-5 pb-8 backdrop-blur-2xl bg-[#060913]/95 transition-all animate-fadeIn"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="flex flex-col gap-3 mt-4"
            onClick={(e) => e.stopPropagation()}
          >
            <a
              href="#work"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-white text-base font-medium tracking-wide hover:bg-white/[0.08] transition-all"
            >
              <span>My Work</span>
              <span className="text-white/40">→</span>
            </a>

            <a
              href="#experience"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-white text-base font-medium tracking-wide hover:bg-white/[0.08] transition-all"
            >
              <span>My Experience</span>
              <span className="text-white/40">→</span>
            </a>

            <a
              href="/vibe-coding"
              onClick={(e) => {
                setMobileMenuOpen(false);
                if (onNavigateVibeCoding) {
                  e.preventDefault();
                  onNavigateVibeCoding();
                }
              }}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-white text-base font-medium tracking-wide hover:bg-white/[0.08] transition-all"
            >
              <span>Vibe Coding</span>
              <span className="text-white/40">→</span>
            </a>

            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#3e38f5] to-[#7c3aed] text-white text-base font-semibold tracking-wide shadow-lg shadow-indigo-500/25"
            >
              <span>Get In Touch</span>
              <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#3e38f5]">
                <svg className="w-3.5 h-3.5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      )}
    </>
  );
}
