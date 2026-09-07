import { useMemo, useEffect, useRef, useCallback } from "react";

/* ── Star Canvas (replaces 740 individual DOM nodes) ────────────
 * All 4 star layers drawn on one <canvas>. Each layer has a parallax
 * factor; on scroll a single RAF call redraws the canvas — zero
 * extra GPU compositing layers, no style/layout recalculation.
 */
type StarDef = { x: number; y: number; size: number; opacity: number; blue: boolean };

function StarCanvas() {
  const canvasRef1 = useRef<HTMLCanvasElement>(null);
  const canvasRef2 = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  const starsLayer1 = useMemo<StarDef[]>(() => 
    Array.from({ length: 360 }, () => ({
      x: Math.random(),
      y: Math.random() * 1.3,
      size: 0.7 + Math.random() * 0.4,
      opacity: 0.08 + Math.random() * 0.32,
      blue: false,
    })),
  []);

  const starsLayer2 = useMemo<StarDef[]>(() => 
    Array.from({ length: 240 }, () => ({
      x: Math.random(),
      y: Math.random() * 1.3,
      size: 1.0 + Math.random() * 0.8,
      opacity: 0.18 + Math.random() * 0.50,
      blue: Math.random() < 0.25,
    })),
  []);

  const drawLayer = useCallback((canvas: HTMLCanvasElement | null, stars: StarDef[]) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      ctx.globalAlpha = s.opacity;
      ctx.fillStyle = s.blue ? "rgb(160,190,255)" : "#fff";
      ctx.fillRect(Math.round(s.x * w), Math.round(s.y * h), s.size, s.size);
    }
    ctx.globalAlpha = 1;
  }, []);

  useEffect(() => {
    let animId = 0;
    const resize = () => {
      if (document.documentElement.getAttribute("data-theme") === "light") return;
      const w = window.innerWidth;
      const h = Math.round(window.innerHeight * 1.4);
      if (canvasRef1.current) {
        canvasRef1.current.width = w;
        canvasRef1.current.height = h;
        drawLayer(canvasRef1.current, starsLayer1);
      }
      if (canvasRef2.current) {
        canvasRef2.current.width = w;
        canvasRef2.current.height = h;
        drawLayer(canvasRef2.current, starsLayer2);
      }
    };
    
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(resize, { timeout: 150 });
    } else {
      animId = requestAnimationFrame(resize);
    }

    window.addEventListener("resize", resize, { passive: true });
    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [drawLayer, starsLayer1, starsLayer2]);

  useEffect(() => {
    const onScroll = () => {
      if (document.documentElement.getAttribute("data-theme") === "light") return;
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        if (document.documentElement.getAttribute("data-theme") === "light") return;
        const scrollY = window.scrollY;
        const pastHero = scrollY > window.innerHeight * 1.2;
        if (canvasRef1.current) {
          if (pastHero) {
            canvasRef1.current.style.display = "none";
          } else {
            canvasRef1.current.style.display = "block";
            canvasRef1.current.style.transform = `translate3d(0, ${-scrollY * 0.05}px, 0)`;
          }
        }
        if (canvasRef2.current) {
          if (pastHero) {
            canvasRef2.current.style.display = "none";
          } else {
            canvasRef2.current.style.display = "block";
            canvasRef2.current.style.transform = `translate3d(0, ${-scrollY * 0.16}px, 0)`;
          }
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef1}
        className="hero-star-canvas"
        style={{
          position: "fixed",
          top: "-20%",
          left: 0,
          width: "100%",
          height: "140%",
          pointerEvents: "none",
          zIndex: 0,
          willChange: "transform",
        }}
      />
      <canvas
        ref={canvasRef2}
        className="hero-star-canvas"
        style={{
          position: "fixed",
          top: "-20%",
          left: 0,
          width: "100%",
          height: "140%",
          pointerEvents: "none",
          zIndex: 0,
          willChange: "transform",
        }}
      />
    </>
  );
}

/* ── Shooting stars ─────────────────────────────────────────── */
function ShootingStars() {
  return (
    <>
      <style>{`
        @keyframes mt1 {
          0%     { transform: rotate(22deg) translateX(0px);   opacity: 0; }
          4%     { opacity: 1; }
          36%    { transform: rotate(22deg) translateX(960px); opacity: 0; }
          36.1%  { transform: rotate(22deg) translateX(0px);   opacity: 0; }
          100%   { transform: rotate(22deg) translateX(0px);   opacity: 0; }
        }
        @keyframes mt2 {
          0%     { transform: rotate(27deg) translateX(0px);   opacity: 0; }
          4%     { opacity: 0.72; }
          38%    { transform: rotate(27deg) translateX(800px); opacity: 0; }
          38.1%  { transform: rotate(27deg) translateX(0px);   opacity: 0; }
          100%   { transform: rotate(27deg) translateX(0px);   opacity: 0; }
        }
      `}</style>
      <div className="absolute pointer-events-none"
        style={{ zIndex:1, top:'4%', left:'2%', animation:'mt1 7s linear 0.5s infinite backwards' }}>
        <div style={{ display:'flex', alignItems:'center' }}>
          <div style={{ width:'160px', height:'0.8px',
            background:'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0.80) 100%)',
            borderRadius:'0 1px 1px 0' }} />
          <div style={{ width:'3px', height:'3px', borderRadius:'50%', flexShrink:0, marginLeft:'-1px',
            background:'white', boxShadow:'0 0 3px 1px rgba(255,255,255,0.6), 0 0 8px 3px rgba(210,230,255,0.25)' }} />
        </div>
      </div>
      <div className="absolute pointer-events-none"
        style={{ zIndex:1, top:'1%', left:'21%', animation:'mt2 9s linear 3.5s infinite backwards' }}>
        <div style={{ display:'flex', alignItems:'center' }}>
          <div style={{ width:'110px', height:'0.6px',
            background:'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0.65) 100%)',
            borderRadius:'0 1px 1px 0' }} />
          <div style={{ width:'2px', height:'2px', borderRadius:'50%', flexShrink:0, marginLeft:'-1px',
            background:'rgba(255,255,255,0.9)',
            boxShadow:'0 0 2px 1px rgba(255,255,255,0.5), 0 0 6px 2px rgba(210,230,255,0.2)' }} />
        </div>
      </div>
    </>
  );
}

interface HeroProps {
  mode?: "dark" | "light";
}

export function Hero({ mode = "dark" }: HeroProps) {
  const isLight = mode === "light";

  const handleExploreClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById("work");
    if (!target) return;

    const startY = window.scrollY;
    const targetY = Math.max(0, target.getBoundingClientRect().top + window.scrollY - 20);
    const distance = targetY - startY;
    if (Math.abs(distance) < 2) return;

    const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      window.scrollTo({ top: targetY, behavior: "auto" });
      if (window.history.pushState) window.history.pushState(null, "", "#work");
      return;
    }

    const duration = 1400; // 1.4s cinematic scroll
    let startTime: number | null = null;
    let isCancelled = false;

    const cancel = () => {
      isCancelled = true;
    };
    window.addEventListener("wheel", cancel, { passive: true, once: true });
    window.addEventListener("touchmove", cancel, { passive: true, once: true });

    // Smooth ease-in-out quartic curve
    const easeInOutQuart = (t: number) =>
      t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

    const scrollStep = (timestamp: number) => {
      if (isCancelled) return;
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = easeInOutQuart(progress);

      window.scrollTo(0, startY + distance * ease);

      if (progress < 1) {
        requestAnimationFrame(scrollStep);
      } else {
        if (window.history.pushState) {
          window.history.pushState(null, "", "#work");
        }
      }
    };

    requestAnimationFrame(scrollStep);
  };

  return (
    <>
      {!isLight && (
        <div className="hide-in-light fade-with-theme"><StarCanvas /></div>
      )}

      <section className="hero-section relative flex flex-col" style={{ zIndex: 4, minHeight: isLight ? "82vh" : undefined }}>
        {!isLight && (
          <div className="hide-in-light fade-with-theme"><ShootingStars /></div>
        )}

        <div className="hero-title-block max-w-[780px] pt-12 sm:pt-16 md:pt-24 lg:pt-28 relative z-20 text-left items-start" style={{ transform: "translateY(50px)" }}>
          <div className="hero-heading-container flex flex-col items-start text-left min-h-[140px] sm:min-h-[160px]">
            {/* Greeting */}
            <p
              className={`mb-3 sm:mb-4 flex items-center gap-1.5 ${isLight ? "text-[#475569]" : "text-white/75"}`}
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "clamp(20px, 1.8vw, 24px)", lineHeight: 1.3 }}
            >
              <span>Hi, I'm Vikram</span>
            </p>

            {/* Main Editorial Serif Heading */}
            <h1
              className="leading-[1.08] tracking-[-0.03em]"
              style={{
                fontFamily: "Georgia, serif",
                fontWeight: 900,
                fontSize: "clamp(1.85rem, 3.6vw, 3.15rem)",
                margin: "0 0 0 0",
              }}
            >
              <span
                className={`block whitespace-normal sm:whitespace-nowrap ${isLight ? "text-[#070e24]" : "text-white"}`}
              >
                I design AI-first products
              </span>
              <span
                className={`block whitespace-normal sm:whitespace-nowrap ${isLight ? "text-[#070e24]" : "text-white"}`}
              >
                that feel human.
              </span>
            </h1>
          </div>

          <div className="hero-subtitle-block flex flex-col items-start text-left" style={{ marginTop: '2px', marginBottom: 0, width: '100%' }}>
            {/* Subtitle */}
            <p
              className={`font-semibold max-w-3xl sm:whitespace-nowrap ${isLight ? "text-[#475569]" : "text-white/80"}`}
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "clamp(19px, 1.55vw, 22.5px)", lineHeight: 1.4, margin: "0 0 28px 0" }}
            >
              Product Designer at Microsoft. Previously at Google and McKinsey.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-5 sm:gap-7">
              <a
                href="#work"
                onClick={handleExploreClick}
                className="primary-button btn-primary adopt-hero-btn-primary group"
                style={{ textDecoration: "none" }}
              >
                <span>Explore my work</span>
                <span className="btn-primary-circle-arrow adopt-btn-circle-arrow">
                  <svg
                    className="w-3.5 h-3.5 text-[#3e38f5] stroke-[2.5]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14M19 12l-7 7-7-7" />
                  </svg>
                </span>
              </a>

              <a
                href="#about"
                className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer group ${
                  isLight ? "text-[#070e24] hover:text-[#3e38f5]" : "text-white/85 hover:text-white"
                }`}
              >
                <span className={`border-b pb-0.5 ${isLight ? "border-[#070e24] group-hover:border-[#3e38f5]" : "border-white/60 group-hover:border-white"}`}>
                  About my journey
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
