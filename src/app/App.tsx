import { useRef, useEffect, useState, useCallback, lazy, Suspense } from "react";
import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { WorkSection } from "./components/WorkSection";
import { AboutSection } from "./components/AboutSection";
import { ExperienceTimeline } from "./components/ExperienceTimeline";
import "../styles/animations.css";
import { ClientsSection } from "./components/ClientsSection";
import { SkillsSection } from "./components/SkillsSection";
import { FooterCTA } from "./components/FooterCTA";
import { SpaceSparkles } from "./components/SpaceSparkles";
import { GeminiPromptBar } from "./components/GeminiPromptBar";

const CaseStudyAdopt = lazy(() => import("./components/CaseStudyAdopt").then(m => ({ default: m.CaseStudyAdopt })));
const CaseStudyAdoptV2 = lazy(() => import("./components/playbook/CaseStudyAdoptV2").then(m => ({ default: m.CaseStudyAdoptV2 })));
const AdoptLandingPage = lazy(() => import("./components/adopt/AdoptLandingPage").then(m => ({ default: m.AdoptLandingPage })));
const VibeCodingPage = lazy(() => import("./components/vibecoding/VibeCodingPage").then(m => ({ default: m.VibeCodingPage })));
const Feedback360Page = lazy(() => import("./components/feedback/Feedback360Page").then(m => ({ default: m.Feedback360Page })));

type Route = "home" | "adopt" | "scale-copilot" | "scale-copilot-engage" | "adopt-v2" | "adopt-landing" | "vibe-coding" | "feedback-360";
type ThemeMode = "dark" | "light";

const routeFromPath = (): Route => {
  const p = window.location.pathname.replace(/\/$/, "");
  if (p.endsWith("/work/feedback-360") || p.endsWith("/feedback-360")) return "feedback-360";
  if (p.endsWith("/adopt-landing") || p.endsWith("/adopt")) return "adopt-landing";
  if (p.endsWith("/scale-copilot-engage") || p.endsWith("/work/scale-copilot-engage")) return "scale-copilot-engage";
  if (p.endsWith("/scale-copilot") || p.endsWith("/playbook/scale-copilot") || p.endsWith("/work/scale-copilot") || p.endsWith("/playbook/adopt-v2")) return "scale-copilot";
  if (p.endsWith("/playbook/adopt")) return "adopt";
  if (p.endsWith("/vibe-coding")) return "vibe-coding";
  return "home";
};

const initialAdoptTheme = (): ThemeMode => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("adopt_theme_mode") || localStorage.getItem("theme_mode");
    if (saved === "light" || saved === "dark") return saved;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  }
  return "light";
};

/*
 * Detect lower-end systems so we can degrade gracefully.
 *   - prefers-reduced-motion → user asked for less motion
 *   - hardwareConcurrency ≤ 4 → likely a low-core laptop
 *   - deviceMemory ≤ 4 → likely RAM-constrained
 * Sets data-perf="lite" on <html> for CSS overrides.
 */
function usePerfMode() {
  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const lowCores = (navigator.hardwareConcurrency ?? 8) <= 4;
    const lowMem = ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4;
    const lite = reduceMotion || lowCores || lowMem;
    document.documentElement.dataset.perf = lite ? "lite" : "full";
  }, []);
}


/*
 * Three-phase parallax — all motion done via transform: translate3d (GPU-composited),
 * scroll handler throttled with requestAnimationFrame so it runs at most once per frame.
 *   Phase 1 — normal parallax until Feedback 360 card centres in viewport
 *   Phase 2 — Earth locked at viewport centre
 * In lite-perf mode the parallax is replaced by a single static position.
 */
function EarthParallax({ mode = "dark" }: { mode?: ThemeMode }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const sunRef = useRef<HTMLImageElement>(null);
  const atmRef = useRef<HTMLDivElement>(null);
  const planet1Ref = useRef<HTMLImageElement>(null);
  const astroRef = useRef<HTMLDivElement>(null);
  const isLight = mode === "light";

  useEffect(() => {
    const el  = imgRef.current;
    const sun = sunRef.current;
    const atm = atmRef.current;
    const planet1 = planet1Ref.current;
    const astro = astroRef.current;
    if (!el) return;

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const Y_OFFSET = -20;                           // Atmospheric halo
    const Y_OFFSET_EARTH = isMobile ? -50 : -110;   // Earth offset (moved upward by 50px)
    const X_OFFSET_EARTH = 0;                       // Earth centered horizontally
    const Y_OFFSET_SUN = isLight ? -55 : -40;       // Sun (aligned with earth displacement)
    const setPos = (top: number, left: number, scale: number = 1) => {
      const tAtm = top + Y_OFFSET;
      if (el) el.style.transform = `translate3d(${left + X_OFFSET_EARTH}px, ${top + Y_OFFSET_EARTH}px, 0) translate(-50%, -50%) scale(${scale})`;
      if (sun) sun.style.transform = `translate3d(${left}px, ${top + Y_OFFSET_SUN}px, 0) translate(-50%, -50%) scale(${scale})`;
      if (atm) atm.style.transform = `translate3d(${left}px, ${tAtm}px, 0) translate(-50%, -50%) scale(${scale})`;
    };

    // Lite-perf: park everything in a sensible static spot, skip scroll listener entirely.
    if (document.documentElement.dataset.perf === "lite") {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const h = el.offsetHeight || 1200;
      setPos(vh * 0.75 - 20 + h / 2, vw / 2, 1);
      if (planet1) planet1.style.transform = "scale(1)";
      if (astro) {
        astro.style.transform = "translate3d(0, 0, 0) translateY(-50%)";
        astro.style.opacity = "1";
      }
      return;
    }

    let targetScrollY = window.scrollY;
    let currentScrollY = window.scrollY;
    let rafId = 0;
    let isRunning = false;

    let cachedEarthH = el.offsetHeight || 1200;
    let cachedCard3Top = 0;
    let cachedCard3Height = 0;
    let cachedLastCardTop = 0;
    let cachedWorkTitleBottom = 0;
    let cachedClientsTop = 0;
    let cachedFooterTop = 0;
    let hasCards = false;
    let cachedCardsCount = 0;

    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor;

    const measureCards = () => {
      cachedEarthH = el.offsetHeight || 1200;
      const workHeader = document.querySelector<HTMLElement>("#work .scroll-arrow-jump") || document.querySelector<HTMLElement>("#work h2") || document.querySelector<HTMLElement>("#work");
      if (workHeader) {
        const rect = workHeader.getBoundingClientRect();
        cachedWorkTitleBottom = rect.bottom + window.scrollY;
      }
      const clientsEl = document.getElementById("clients") || document.querySelector(".marquee-fade");
      if (clientsEl) {
        const rect = clientsEl.getBoundingClientRect();
        cachedClientsTop = rect.top + window.scrollY;
      }
      const footerEl = document.getElementById("contact");
      if (footerEl) {
        const rect = footerEl.getBoundingClientRect();
        cachedFooterTop = rect.top + window.scrollY;
      } else {
        cachedFooterTop = document.documentElement.scrollHeight - window.innerHeight;
      }
      const cards = Array.from(document.querySelectorAll<HTMLElement>(".ws-card")).filter(
        (c) => c.offsetParent !== null
      );
      cachedCardsCount = cards.length;
      if (cards.length >= 3) {
        hasCards = true;
        const c3 = cards[2];
        const last = cards[cards.length - 1];
        const c3Rect = c3.getBoundingClientRect();
        const lastRect = last.getBoundingClientRect();
        cachedCard3Top = c3Rect.top + window.scrollY;
        cachedCard3Height = c3Rect.height;
        cachedLastCardTop = lastRect.top + window.scrollY;
      } else {
        hasCards = false;
      }
    };

    measureCards();

    const compute = (scrollY: number) => {
      const vw      = window.innerWidth;
      const vh      = window.innerHeight;
      const isMobileNow = vw < 768;

      // On mobile:
      // Initially in hero, Earth is 20% visible.
      // When hero disappears on scroll, Earth goes down and just 10% is visible from the bottom,
      // and astronaut scrolls away upwards off the screen.
      if (isMobileNow) {
        const scale = 0.90;
        const scaledH = (el.offsetHeight || 1200) * scale;

        // Progress of hero exiting screen (0 to 1)
        const heroExitDist = Math.max(1, vh * 0.45);
        const heroProgress = Math.min(1, Math.max(0, scrollY / heroExitDist));
        const eased = heroProgress * heroProgress * (3 - 2 * heroProgress);

        // Visibility smoothly transitions from 20% (0.20) down to 10% (0.10)
        const currentVisibility = 0.20 - eased * 0.10;
        const mobileCenterY = vh + (scaledH / 2) - (scaledH * currentVisibility) + 10;
        setPos(mobileCenterY, vw / 2, scale);

        if (planet1) {
          planet1.style.transform = `scale(${scale})`;
        }

        if (astro) {
          // On landing, astronaut starts 135px higher (moved up 25px for complete clearance), then scrolls away upwards
          const upwardOffset = -135 - scrollY * 1.1;
          const astroOpacity = Math.max(0, 1 - scrollY / (vh * 0.35));
          astro.style.transform = `translate3d(40px, ${upwardOffset}px, 0) translateY(-50%) rotate(${8 - scrollY * 0.03}deg)`;
          astro.style.opacity = `${astroOpacity}`;
        }
        return;
      }

      // Earth horizon starts cleanly on landing (moved upward by 50px)
      const minTopBelowArrow = cachedWorkTitleBottom ? (cachedWorkTitleBottom + 16 - 50) : (vh * 0.78 - 50);
      const initialCenterY = Math.max(vh * 0.78 + cachedEarthH / 2 - 50, minTopBelowArrow + cachedEarthH / 2 - Y_OFFSET_EARTH);
      const phase1Y = initialCenterY - scrollY * 0.7;

      // Calculate scroll progress towards reaching the stop spot (vh / 2)
      const totalTravelToStop = Math.max(1, initialCenterY - vh / 2);
      const scrollProgress = Math.min(1, Math.max(0, (initialCenterY - phase1Y) / totalTravelToStop));
      // Proportional scale: from 1.0 (full size) down to 0.50 (50% reduced size) at stop spot
      const currentScale = Math.max(0.50, 1 - scrollProgress * 0.50);

      // Planet 1 stays in place and scales down / zooms out to 50% on scroll
      if (planet1) {
        const planet1Scale = Math.max(0.50, 1 - scrollProgress * 0.50);
        planet1.style.transform = `scale(${planet1Scale})`;
      }

      const card3Top      = cachedCard3Top - scrollY;
      const lastTop       = cachedLastCardTop - scrollY;

      const stickTrigger = card3Top + cachedCard3Height / 2 - vh / 2;
      const lastStickyTop = 96 + Math.max(0, cachedCardsCount - 1) * 24;
      const exitTrigger  = lastTop - lastStickyTop;

      // Astronaut scroll-driven descent when last card exits, and dramatic landing in footer
      if (astro) {
        const floatLayer = astro.querySelector<HTMLElement>(".astro-layer-float");
        const standLayer = astro.querySelector<HTMLElement>(".astro-layer-stand");

        if (exitTrigger > 0) {
          astro.style.transform = `translate3d(50px, -65vh, 0) translateY(-50%) rotate(8deg)`;
          astro.style.opacity = "0";
          astro.style.display = "none";
          if (standLayer) standLayer.style.opacity = "0";
          if (floatLayer) floatLayer.style.opacity = "1";
        } else {
          astro.style.display = "block";
          const dist = Math.abs(exitTrigger);
          const entranceDistance = vh * 0.85;
          const entranceProgress = Math.min(1, dist / entranceDistance);
          const easedEntrance = 1 - Math.pow(1 - entranceProgress, 3);

          const startY = -vh * 0.65;
          const startX = 60;
          const startRot = 8;

          let curY = startY + (0 - startY) * easedEntrance;
          let curX = startX + (0 - startX) * easedEntrance;
          let curRot = startRot + (0 - startRot) * easedEntrance;

          const footerRelativeTop = cachedFooterTop ? cachedFooterTop - scrollY : vh * 2;
          const clientsRelativeTop = cachedClientsTop ? cachedClientsTop - scrollY : vh * 2;

          // Size progression: starts at compact flight size (0.68) in earlier sections.
          // After crossing "Top customers I worked for", progressively scales up to 1.0 to match the standing astronaut
          const baseFlightScale = 0.68;
          const targetFlightScale = 1.0;
          const growthStart = vh * 0.60;
          const growthEnd   = -vh * 0.20;
          const growthP     = Math.min(1, Math.max(0, (growthStart - clientsRelativeTop) / (growthStart - growthEnd)));
          const easedGrowth = growthP * growthP * (3 - 2 * growthP);
          const currentFlightScale = baseFlightScale + (targetFlightScale - baseFlightScale) * easedGrowth;

          // Detect footer approach for dramatic landing motion
          const landingStart = vh * 0.92; // initiates as footer comes into view
          const landingEnd   = vh * 0.35; // touches down firmly
          let landingProgress = 0;
          if (footerRelativeTop <= landingStart) {
            landingProgress = Math.min(1, Math.max(0, (landingStart - footerRelativeTop) / (landingStart - landingEnd)));
          }

          if (landingProgress > 0) {
            // Dramatic decelerating touchdown curve
            const p = landingProgress;
            // Quintic easing out for cinematic deceleration
            const easedLand = 1 - Math.pow(1 - p, 4);

            // Ground level: plants astronaut standing tall and upright on the footer ground line (moved downward by 50px)
            const approxAstroH = Math.min(480, Math.max(320, vw * 0.28));
            const groundTargetY = (vh * 0.5) - (approxAstroH * 0.5) + 30;

            curY = curY + (groundTargetY - curY) * easedLand;
            curRot = curRot + (0 - curRot) * easedLand; // Straightens to 0deg upright posture

            // Jump-to-stand handoff: when standing pose touches down (p >= 0.38), floating astronaut completely vanishes
            const isStanding = p >= 0.38;
            if (standLayer) {
              standLayer.style.opacity = isStanding ? "1" : "0";
              standLayer.style.display = isStanding ? "flex" : "none";
            }
            if (floatLayer) {
              floatLayer.style.opacity = isStanding ? "0" : "1";
              floatLayer.style.display = isStanding ? "none" : "flex";
            }

            // Touchdown compression impact feel right at jump landing (0.38 to 0.72)
            let bounceX = 1;
            let bounceY = 1;
            if (p >= 0.38 && p <= 0.72) {
              const impactPhase = (p - 0.38) / 0.34;
              const bounce = Math.sin(impactPhase * Math.PI);
              bounceX = 1 + bounce * 0.065;
              bounceY = 1 - bounce * 0.065;
            }

            const activeScale = isStanding ? 1.0 : currentFlightScale;
            const finalScaleX = activeScale * bounceX;
            const finalScaleY = activeScale * bounceY;

            astro.style.transform = `translate3d(${curX}px, ${curY}px, 0) translateY(-50%) rotate(${curRot}deg) scale(${finalScaleX}, ${finalScaleY})`;
            astro.style.opacity = "1";

            const innerFloat = astro.querySelector<HTMLElement>(".astro-inner-motion");
            if (innerFloat) {
              if (p > 0.65) {
                innerFloat.style.animation = "astronautStandBreath 4.5s ease-in-out infinite";
              } else {
                innerFloat.style.animation = "astronautFloat 7s ease-in-out infinite";
              }
            }
          } else {
            if (standLayer) {
              standLayer.style.opacity = "0";
              standLayer.style.display = "none";
            }
            if (floatLayer) {
              floatLayer.style.opacity = "1";
              floatLayer.style.display = "flex";
            }

            astro.style.transform = `translate3d(${curX}px, ${curY}px, 0) translateY(-50%) rotate(${curRot}deg) scale(${currentFlightScale})`;
            astro.style.opacity = `${Math.min(1, entranceProgress * 2.2)}`;

            const innerFloat = astro.querySelector<HTMLElement>(".astro-inner-motion");
            if (innerFloat) {
              innerFloat.style.animation = "astronautFloat 7s ease-in-out infinite";
            }
          }
        }
      }

      if (!hasCards) {
        setPos(phase1Y, vw / 2, currentScale);
        return;
      }

      const BLEND = 180;

      if (stickTrigger > BLEND) {
        setPos(phase1Y, vw / 2, currentScale);
      } else if (stickTrigger > 0) {
        const p     = 1 - stickTrigger / BLEND;
        const eased = p * p * (3 - 2 * p);
        setPos(phase1Y + (vh / 2 - phase1Y) * eased, vw / 2, 0.50);
      } else if (exitTrigger > 0) {
        setPos(vh / 2, vw / 2, 0.50);
      } else {
        const dist     = Math.abs(exitTrigger);
        const progress = Math.min(1, dist / (vh * 0.7));
        const eased    = 1 - Math.pow(1 - progress, 3);

        const toX = vw * 0.18 - 270;
        const toY = vh * 0.70 + 270;

        setPos(
          vh / 2 + (toY - vh / 2) * eased,
          vw / 2 + (toX - vw / 2) * eased,
          0.50,
        );
      }
    };

    const renderLoop = () => {
      if (document.hidden) {
        isRunning = false;
        return;
      }
      const delta = targetScrollY - currentScrollY;
      if (Math.abs(delta) < 0.05) {
        currentScrollY = targetScrollY;
      } else {
        currentScrollY = lerp(currentScrollY, targetScrollY, 0.095);
      }

      compute(currentScrollY);

      if (currentScrollY !== targetScrollY) {
        rafId = requestAnimationFrame(renderLoop);
      } else {
        isRunning = false;
      }
    };

    const onScroll = () => {
      targetScrollY = window.scrollY;
      if (!isRunning && !document.hidden) {
        isRunning = true;
        rafId = requestAnimationFrame(renderLoop);
      }
    };

    const onResize = () => {
      measureCards();
      targetScrollY = window.scrollY;
      currentScrollY = window.scrollY;
      compute(window.scrollY);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (rafId) cancelAnimationFrame(rafId);
        isRunning = false;
      } else {
        targetScrollY = window.scrollY;
        currentScrollY = window.scrollY;
        compute(window.scrollY);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    const onLoad = () => {
      measureCards();
      compute(window.scrollY);
    };
    el.addEventListener("load", onLoad, { once: true });

    // Invalidate cached offsets on font loading
    if (typeof document !== "undefined" && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        measureCards();
        compute(window.scrollY);
      }).catch(() => {});
    }

    // Invalidate cached offsets when layout changes (e.g. experience disclosure expansion, dynamic accordions)
    let roRaf = 0;
    let resizeObserver: ResizeObserver | null = null;
    if (typeof window !== "undefined" && "ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(() => {
        if (roRaf) cancelAnimationFrame(roRaf);
        roRaf = requestAnimationFrame(() => {
          roRaf = 0;
          measureCards();
          compute(window.scrollY);
        });
      });
      resizeObserver.observe(document.body);
    }

    // Invalidate cached offsets on theme changes
    let themeObserver: MutationObserver | null = null;
    if (typeof window !== "undefined" && "MutationObserver" in window) {
      themeObserver = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.type === "attributes" && m.attributeName === "data-theme") {
            measureCards();
            compute(window.scrollY);
            break;
          }
        }
      });
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    }

    compute(window.scrollY);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (roRaf) cancelAnimationFrame(roRaf);
      if (resizeObserver) resizeObserver.disconnect();
      if (themeObserver) themeObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      el.removeEventListener("load", onLoad);
    };
  }, [isLight]);

  return (
    <>

      {/* Small Left Planet (Planet 1) positioned above Earth horizon */}
      {!isLight && (
        <picture style={{ display: "contents" }}>
          <source
            type="image/avif"
            srcSet={`${import.meta.env.BASE_URL}IMG/Planet%201-128.avif 128w, ${import.meta.env.BASE_URL}IMG/Planet%201-256.avif 256w, ${import.meta.env.BASE_URL}IMG/Planet%201-384.avif 384w`}
            sizes="clamp(110px, 9vw, 170px)"
          />
          <source
            type="image/webp"
            srcSet={`${import.meta.env.BASE_URL}IMG/Planet%201-128.webp 128w, ${import.meta.env.BASE_URL}IMG/Planet%201-256.webp 256w, ${import.meta.env.BASE_URL}IMG/Planet%201-384.webp 384w`}
            sizes="clamp(110px, 9vw, 170px)"
          />
          <img
            ref={planet1Ref}
            src={`${import.meta.env.BASE_URL}IMG/Planet%201.png`}
            alt=""
            decoding="async"
            fetchPriority="high"
            width={384}
            height={384}
            className="planet1-element"
            style={{
              position: "fixed",
              top: "28vh",
              left: "calc(max(-10px, 0.8vw) - 50px)",
              width: "clamp(110px, 9vw, 170px)",
              height: "auto",
              zIndex: 0,
              pointerEvents: "none",
              opacity: 0.95,
              filter: "drop-shadow(0 0 20px rgba(139, 92, 246, 0.35))",
              willChange: "transform",
              transformOrigin: "center center",
            }}
          />
        </picture>
      )}

      {/* Floating & Standing Astronaut in space on right, enters from top with scroll and lands on footer */}
      {!isLight && (
        <div
          ref={astroRef}
          className="astro-wrapper hidden md:block"
          style={{
            position: "fixed",
            top: "50vh",
            right: "clamp(24px, 4.5vw, 90px)",
            zIndex: 15,
            pointerEvents: "none",
            userSelect: "none",
            transform: "translate3d(50px, -65vh, 0) translateY(-50%) rotate(8deg)",
            opacity: 0,
            willChange: "transform, opacity",
          }}
        >
          <div
            className="astro-inner-motion"
            style={{
              animation: "astronautFloat 7s ease-in-out infinite",
              willChange: "transform",
              position: "relative",
              width: "clamp(180px, 18.5vw, 295px)",
              height: "clamp(260px, 26vw, 410px)",
            }}
          >
            {/* 1. Floating pose layer (Active during space flight) */}
            <div
              className="astro-layer-float"
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <picture style={{ display: "contents" }}>
                <source
                  type="image/avif"
                  srcSet={`${import.meta.env.BASE_URL}IMG/Astronaut-200.avif 200w, ${import.meta.env.BASE_URL}IMG/Astronaut-368.avif 368w`}
                  sizes="clamp(180px, 18.5vw, 295px)"
                />
                <source
                  type="image/webp"
                  srcSet={`${import.meta.env.BASE_URL}IMG/Astronaut-200.webp 200w, ${import.meta.env.BASE_URL}IMG/Astronaut-368.webp 368w`}
                  sizes="clamp(180px, 18.5vw, 295px)"
                />
                <img
                  src={`${import.meta.env.BASE_URL}IMG/Astronaut.png`}
                  alt="Floating Astronaut"
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  width={368}
                  height={366}
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                    filter: "drop-shadow(0 24px 45px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 25px rgba(100, 160, 255, 0.25))",
                  }}
                />
              </picture>
            </div>

            {/* 2. Standing upright pose layer (Active upon touchdown landing in footer) */}
            <div
              className="astro-layer-stand"
              style={{
                position: "absolute",
                inset: 0,
                display: "none",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0,
              }}
            >
              <picture style={{ display: "contents" }}>
                <source
                  type="image/avif"
                  srcSet={`${import.meta.env.BASE_URL}IMG/Astronaut_Standing-480.avif 480w, ${import.meta.env.BASE_URL}IMG/Astronaut_Standing-768.avif 768w, ${import.meta.env.BASE_URL}IMG/Astronaut_Standing-1024.avif 1024w`}
                  sizes="(max-width: 768px) 80vw, 450px"
                />
                <source
                  type="image/webp"
                  srcSet={`${import.meta.env.BASE_URL}IMG/Astronaut_Standing-480.webp 480w, ${import.meta.env.BASE_URL}IMG/Astronaut_Standing-768.webp 768w, ${import.meta.env.BASE_URL}IMG/Astronaut_Standing-1024.webp 1024w`}
                  sizes="(max-width: 768px) 80vw, 450px"
                />
                <img
                  src={`${import.meta.env.BASE_URL}IMG/Astronaut_Standing.png`}
                  alt="Standing Astronaut"
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  width={1024}
                  height={1536}
                  style={{
                    width: "82%",
                    height: "auto",
                    objectFit: "contain",
                    filter: "drop-shadow(0 28px 45px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 35px rgba(100, 160, 255, 0.35))",
                  }}
                />
              </picture>
            </div>
          </div>
        </div>
      )}

      {/* Sun glow halo — visible in light mode only */}
      {isLight && (
        <div
          ref={atmRef}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "calc(130vw + 140px)",
            maxWidth: "2000px",
            aspectRatio: "1 / 1",
            borderRadius: "50%",
            background: [
              "radial-gradient(circle, transparent 38%, rgba(255,180,90,0.16) 46%, rgba(255,200,120,0.22) 52%, rgba(255,170,90,0.12) 60%, transparent 70%)",
              "radial-gradient(circle, transparent 30%, rgba(255,210,140,0.10) 56%, transparent 76%)",
            ].join(", "),
            filter: "blur(10px)",
            pointerEvents: "none",
            zIndex: 0,
            willChange: "transform",
            transform: "translate3d(50vw, calc(75vh + 580px), 0) translate(-50%, -50%)",
            transition: "background 0.6s ease",
          }}
        />
      )}
      {/* Earth — primary orb; defines parallax positioning. Visible in dark, fades out in light. */}
      <picture style={{ display: "contents" }}>
        <source
          type="image/avif"
          srcSet={`${import.meta.env.BASE_URL}IMG/Earth_only_2x-768.avif 768w, ${import.meta.env.BASE_URL}IMG/Earth_only_2x-1200.avif 1200w, ${import.meta.env.BASE_URL}IMG/Earth_only_2x-1536.avif 1536w`}
          sizes="(max-width: 768px) 100vw, 160vw"
        />
        <source
          type="image/webp"
          srcSet={`${import.meta.env.BASE_URL}IMG/Earth_only_2x-768.webp 768w, ${import.meta.env.BASE_URL}IMG/Earth_only_2x-1200.webp 1200w, ${import.meta.env.BASE_URL}IMG/Earth_only_2x-1536.webp 1536w`}
          sizes="(max-width: 768px) 100vw, 160vw"
        />
        <img
          ref={imgRef}
          src={`${import.meta.env.BASE_URL}IMG/Earth_only_2x.png`}
          alt=""
          decoding="async"
          fetchPriority={isLight ? "low" : "high"}
          width={1536}
          height={1024}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "160vw",
            maxWidth: "2400px",
            minWidth: "1500px",
            height: "auto",
            zIndex: 0,
            pointerEvents: "none",
            opacity: isLight ? 0 : 0.68,
            willChange: "transform",
            transform: "translate3d(50vw, calc(75vh + 530px), 0) translate(-50%, -50%)",
          }}
          className="earth-orb"
        />
      </picture>

      {/* Sun — same anchor as Earth, 30% larger; mounts for light mode */}
      {isLight && (
        <picture style={{ display: "contents" }}>
          <source
            type="image/avif"
            srcSet={`${import.meta.env.BASE_URL}IMG/Sun_only_2x-480.avif 480w, ${import.meta.env.BASE_URL}IMG/Sun_only_2x-768.avif 768w, ${import.meta.env.BASE_URL}IMG/Sun_only_2x-891.avif 891w`}
            sizes="(max-width: 768px) 130vw, 130vw"
          />
          <source
            type="image/webp"
            srcSet={`${import.meta.env.BASE_URL}IMG/Sun_only_2x-480.webp 480w, ${import.meta.env.BASE_URL}IMG/Sun_only_2x-768.webp 768w, ${import.meta.env.BASE_URL}IMG/Sun_only_2x-891.webp 891w`}
            sizes="(max-width: 768px) 130vw, 130vw"
          />
          <img
            ref={sunRef}
            src={`${import.meta.env.BASE_URL}IMG/Sun_only_2x.png`}
            alt=""
            decoding="async"
            loading="eager"
            fetchPriority="high"
            width={891}
            height={891}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "130vw",
              maxWidth: "1950px",
              height: "auto",
              zIndex: 0,
              pointerEvents: "none",
              opacity: 0.95,
              willChange: "transform",
              transform: "translate3d(50vw, calc(75vh + 580px), 0) translate(-50%, -50%)",
              transition: "opacity 0.7s ease",
            }}
            className="sun-orb"
          />
        </picture>
      )}
    </>
  );
}

/* ── Light Mode Cinematic Sky Parallax & Zoomout ────────────── */
function LightSkyParallax() {
  const imgRef = useRef<HTMLImageElement>(null);
  const earthCloudRef = useRef<HTMLImageElement>(null);
  const footerLightRef = useRef<HTMLImageElement>(null);
  const astroRef = useRef<HTMLDivElement>(null);
  const cloudsGroupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    const earthCloud = earthCloudRef.current;
    const footerLight = footerLightRef.current;
    const astro = astroRef.current;
    const cloudsGroup = cloudsGroupRef.current;
    if (!img) return;

    if (document.documentElement.dataset.perf === "lite") {
      img.style.transform = "none";
      if (earthCloud) earthCloud.style.display = "none";
      if (footerLight) footerLight.style.display = "none";
      return;
    }

    let rafId = 0;
    let targetScroll = window.scrollY;
    let currentScroll = window.scrollY;
    let isRunning = false;

    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    let cachedLastCardDocTop = 0;
    let cachedAboutDocTop = 0;
    let cachedSkillsDocTop = 0;

    const measureOffsets = () => {
      const cards = document.querySelectorAll<HTMLElement>(".ws-card");
      if (cards.length > 0) {
        const lastCard = cards[cards.length - 1];
        cachedLastCardDocTop = lastCard.getBoundingClientRect().top + window.scrollY;
      }
      const aboutEl = document.getElementById("about");
      if (aboutEl) {
        cachedAboutDocTop = aboutEl.getBoundingClientRect().top + window.scrollY;
      }
      const skillsEl = document.getElementById("skills");
      if (skillsEl) {
        cachedSkillsDocTop = skillsEl.getBoundingClientRect().top + window.scrollY;
      }
    };
    measureOffsets();

    const update = () => {
      currentScroll += (targetScroll - currentScroll) * 0.14;
      if (Math.abs(targetScroll - currentScroll) < 0.1) {
        currentScroll = targetScroll;
      }

      currentMouseX += (targetMouseX - currentMouseX) * 0.08;
      currentMouseY += (targetMouseY - currentMouseY) * 0.08;

      const s = currentScroll;

      // Transition is delayed through all preceding cards; it starts only as the last card in My Work is reached/cleared
      let workExitProgress = 0;
      if (cachedLastCardDocTop) {
        const lastCardTop = cachedLastCardDocTop - s;
        const triggerPoint = 180;
        if (lastCardTop <= triggerPoint) {
          workExitProgress = Math.min(Math.max((triggerPoint - lastCardTop) / 420, 0), 1);
        }
      } else {
        workExitProgress = Math.min(Math.max((s - 1800) / 420, 0), 1);
      }

      const easedTransition = 1 - Math.pow(1 - workExitProgress, 2.4);

      // 1. Hero Background Sky: Stays fully crisp & active through Hero and all My Work cards;
      // Only after the last card ("Notification Experience Design") does it slowly fade out
      const heroScale = 1.06 - Math.min(s / 1800, 1) * 0.06;
      const heroPanY = -Math.min(s / 1800, 1) * 28 + currentMouseY * 8;
      const heroPanX = currentMouseX * 10;
      const heroOpacity = Math.max(0, 1 - easedTransition * 0.95);

      if (img) {
        img.style.transform = `translate3d(${heroPanX.toFixed(2)}px, ${heroPanY.toFixed(2)}px, 0) scale(${heroScale.toFixed(4)})`;
        img.style.filter = "none";
        img.style.opacity = heroOpacity.toFixed(3);
        img.style.display = heroOpacity <= 0.005 ? "none" : "block";
      }

      // Check About Section for fading out moving clouds container
      let aboutProgress = 0;
      if (cachedAboutDocTop) {
        const aboutTop = cachedAboutDocTop - s;
        const triggerPoint = window.innerHeight * 0.82;
        if (aboutTop <= triggerPoint) {
          aboutProgress = Math.min(Math.max((triggerPoint - aboutTop) / 300, 0), 1);
        }
      }

      // Check Skills Section: Only after user scrolls to Skills section, Cloud with Earth fades out and Footer Light fades in
      let skillsProgress = 0;
      if (cachedSkillsDocTop) {
        const skillsTop = cachedSkillsDocTop - s;
        const triggerPoint = window.innerHeight * 0.40;
        if (skillsTop <= triggerPoint) {
          skillsProgress = Math.min(Math.max((triggerPoint - skillsTop) / 320, 0), 1);
        }
      }
      const easedSkills = 1 - Math.pow(1 - skillsProgress, 2.4);

      // 2. Cloud with Earth Scene: Fades in after last card in My Work, and fades out as user scrolls into Skills section
      if (earthCloud) {
        const baseEarthOpacity = Math.min(1, easedTransition * 1.15);
        const finalEarthOpacity = Math.max(0, baseEarthOpacity * (1 - easedSkills * 1.05));
        // Clamped scroll progression to ensure translation never exceeds scale margin
        const earthScrollProgress = Math.min(Math.max((s - 1800) / 1500, 0), 1);
        const earthDescentY = (1 - easedTransition) * 35 - earthScrollProgress * 15 + currentMouseY * 12;
        const earthDescentX = currentMouseX * 14;
        const earthScale = 1.12 - easedTransition * 0.04;

        earthCloud.style.transform = `translate3d(${earthDescentX.toFixed(2)}px, ${earthDescentY.toFixed(2)}px, 0) scale(${earthScale.toFixed(4)})`;
        earthCloud.style.opacity = finalEarthOpacity.toFixed(3);
        earthCloud.style.filter = "none";
        earthCloud.style.display = finalEarthOpacity <= 0.005 ? "none" : "block";
      }

      // 3. Footer Light Scene: Fades in at Skills section and continues through the footer
      if (footerLight) {
        const footerOpacity = Math.min(1, easedSkills * 1.15);
        const footerPanY = -easedSkills * 20 + currentMouseY * 12;
        const footerPanX = currentMouseX * 14;
        const footerScale = 1.08 - easedSkills * 0.04;

        footerLight.style.transform = `translate3d(${footerPanX.toFixed(2)}px, ${footerPanY.toFixed(2)}px, 0) scale(${footerScale.toFixed(4)})`;
        footerLight.style.opacity = footerOpacity.toFixed(3);
        footerLight.style.display = footerOpacity <= 0.005 ? "none" : "block";
      }

      // 4. Clouds Group: Visible during hero & work sections; smoothly fades out and completely disappears when entering About section until footer
      if (cloudsGroup) {
        const cloudOpacity = Math.max(0, 1 - aboutProgress * 1.25);
        cloudsGroup.style.opacity = cloudOpacity.toFixed(3);
        cloudsGroup.style.display = cloudOpacity <= 0.01 ? "none" : "block";
        cloudsGroup.style.filter = "none";
      }

      // 5. Skater Astronaut (Midground): Authentic S-Curved Slalom Skating Path + Interactive Cursor Movement
      // Trajectory: Starts bottom -> carves RIGHT past board rail -> sweeps LEFT past shoulder -> hooks UP-RIGHT toward horizon sun
      const t = Math.min(s / 650, 1.25);
      const easedT = t < 1 ? 1 - Math.pow(1 - t, 2.0) : t;

      // S-curve wave parameters
      const carveFrequency = 1.7 * Math.PI;
      const waveAmp = 68 * Math.max(1 - t * 0.35, 0.45);
      const carveWave = Math.sin(t * carveFrequency) * waveAmp;

      // Cursor movement tracking effect (dynamic board float & tilt based on mouse position)
      const cursorX = currentMouseX * 36;
      const cursorY = currentMouseY * 24;
      const cursorTilt = currentMouseX * 5.5 + currentMouseY * 2.0;

      // Combined 3D perspective S-curve trajectory + cursor parallax
      const moveX = -easedT * 140 + carveWave + cursorX;
      const moveY = -easedT * 310 + cursorY;
      const scale = Math.max(1 - easedT * 0.65, 0.35);

      // Derivative-based dynamic board banking: starts at 0deg at rest, banks into turns naturally
      const bankingAmp = 7.8 * Math.max(1 - t * 0.35, 0.45);
      const bankingTilt = Math.cos(t * carveFrequency) * bankingAmp * Math.min(t * 4.0, 1);
      const tilt = bankingTilt + easedT * 1.5 + cursorTilt;
      // Graceful sunset fade-away dissolution only after the 2nd card in My Work comes into view (s: 1350px -> 1750px)
      const fadeProgress = Math.max(0, Math.min((s - 1350) / 400, 1));
      const astroOpacity = Number((1 - Math.pow(fadeProgress, 1.4)).toFixed(3));

      if (astro) {
        if (astroOpacity <= 0) {
          astro.style.display = "none";
        } else {
          astro.style.display = "block";
          astro.style.transform = `translate3d(${moveX.toFixed(2)}px, ${moveY.toFixed(2)}px, 0) scale(${scale.toFixed(4)}) rotate(${tilt.toFixed(2)}deg)`;
          astro.style.opacity = String(astroOpacity);
        }
      }

      const isScrollMoving = Math.abs(targetScroll - currentScroll) >= 0.1;
      const isMouseMoving = Math.abs(targetMouseX - currentMouseX) >= 0.001 || Math.abs(targetMouseY - currentMouseY) >= 0.001;

      if (isScrollMoving || isMouseMoving) {
        rafId = requestAnimationFrame(update);
      } else {
        isRunning = false;
      }
    };

    const onScroll = () => {
      targetScroll = window.scrollY;
      if (!isRunning) {
        isRunning = true;
        rafId = requestAnimationFrame(update);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      targetMouseX = Math.max(-1, Math.min(1, (e.clientX - cx) / cx));
      targetMouseY = Math.max(-1, Math.min(1, (e.clientY - cy) / cy));
      if (!isRunning) {
        isRunning = true;
        rafId = requestAnimationFrame(update);
      }
    };

    const onResize = () => {
      measureOffsets();
      update();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    // Invalidate cached offsets on font loading
    if (typeof document !== "undefined" && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        measureOffsets();
        update();
      }).catch(() => {});
    }

    // Invalidate cached offsets when layout changes (e.g. experience disclosure expansion)
    let roRaf = 0;
    let resizeObserver: ResizeObserver | null = null;
    if (typeof window !== "undefined" && "ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(() => {
        if (roRaf) cancelAnimationFrame(roRaf);
        roRaf = requestAnimationFrame(() => {
          roRaf = 0;
          measureOffsets();
          update();
        });
      });
      resizeObserver.observe(document.body);
    }

    // Invalidate cached offsets on theme changes
    let themeObserver: MutationObserver | null = null;
    if (typeof window !== "undefined" && "MutationObserver" in window) {
      themeObserver = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.type === "attributes" && m.attributeName === "data-theme") {
            measureOffsets();
            update();
            break;
          }
        }
      });
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    }

    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      if (rafId) cancelAnimationFrame(rafId);
      if (roRaf) cancelAnimationFrame(roRaf);
      if (resizeObserver) resizeObserver.disconnect();
      if (themeObserver) themeObserver.disconnect();
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 w-full pointer-events-none overflow-hidden"
      style={{
        zIndex: 0,
        width: "100vw",
        height: "100vh",
      }}
    >
      {/* 1. Background Sky (Hero) */}
      <picture style={{ display: "contents" }}>
        <source
          type="image/avif"
          srcSet={`${import.meta.env.BASE_URL}IMG/Landing_background-768.avif 768w, ${import.meta.env.BASE_URL}IMG/Landing_background-1440.avif 1440w, ${import.meta.env.BASE_URL}IMG/Landing_background-1586.avif 1586w`}
          sizes="100vw"
        />
        <source
          type="image/webp"
          srcSet={`${import.meta.env.BASE_URL}IMG/Landing_background-768.webp 768w, ${import.meta.env.BASE_URL}IMG/Landing_background-1440.webp 1440w, ${import.meta.env.BASE_URL}IMG/Landing_background-1586.webp 1586w`}
          sizes="100vw"
        />
        <img
          ref={imgRef}
          src={`${import.meta.env.BASE_URL}IMG/Landing_background.png`}
          alt=""
          loading="eager"
          fetchPriority="high"
          decoding="async"
          width={1586}
          height={1184}
          className="w-full h-full select-none absolute inset-0"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top center",
            transformOrigin: "center 30%",
            willChange: "transform, filter, opacity",
          }}
        />
      </picture>

      {/* 2. Cloud with Earth Scene (Fades in after My Work cards, fades out at Skills) */}
      <picture style={{ display: "contents" }}>
        <source
          type="image/avif"
          srcSet={`${import.meta.env.BASE_URL}IMG/Cloud%20with%20earth-768.avif 768w, ${import.meta.env.BASE_URL}IMG/Cloud%20with%20earth-1280.avif 1280w, ${import.meta.env.BASE_URL}IMG/Cloud%20with%20earth-1584.avif 1584w`}
          sizes="100vw"
        />
        <source
          type="image/webp"
          srcSet={`${import.meta.env.BASE_URL}IMG/Cloud%20with%20earth-768.webp 768w, ${import.meta.env.BASE_URL}IMG/Cloud%20with%20earth-1280.webp 1280w, ${import.meta.env.BASE_URL}IMG/Cloud%20with%20earth-1584.webp 1584w`}
          sizes="100vw"
        />
        <img
          ref={earthCloudRef}
          src={`${import.meta.env.BASE_URL}IMG/Cloud%20with%20earth.png`}
          alt=""
          loading="lazy"
          fetchPriority="low"
          decoding="async"
          width={1584}
          height={1184}
          className="w-full h-full select-none absolute inset-0"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center center",
            transformOrigin: "center center",
            opacity: 0,
            display: "none",
            willChange: "transform, filter, opacity",
          }}
        />
      </picture>

      {/* 3. Footer Light Scene (Fades in at Skills section through footer) */}
      <picture style={{ display: "contents" }}>
        <source
          type="image/avif"
          srcSet={`${import.meta.env.BASE_URL}IMG/Footer%20Light-768.avif 768w, ${import.meta.env.BASE_URL}IMG/Footer%20Light-1280.avif 1280w, ${import.meta.env.BASE_URL}IMG/Footer%20Light-1672.avif 1672w`}
          sizes="100vw"
        />
        <source
          type="image/webp"
          srcSet={`${import.meta.env.BASE_URL}IMG/Footer%20Light-768.webp 768w, ${import.meta.env.BASE_URL}IMG/Footer%20Light-1280.webp 1280w, ${import.meta.env.BASE_URL}IMG/Footer%20Light-1672.webp 1672w`}
          sizes="100vw"
        />
        <img
          ref={footerLightRef}
          src={`${import.meta.env.BASE_URL}IMG/Footer%20Light.png`}
          alt=""
          loading="lazy"
          fetchPriority="low"
          decoding="async"
          width={1672}
          height={1184}
          className="w-full h-full select-none absolute inset-0"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center center",
            transformOrigin: "center center",
            opacity: 0,
            display: "none",
            willChange: "transform, opacity",
          }}
        />
      </picture>

      {/* Floating & Passing Panoramic Clouds Container */}
      <div
        ref={cloudsGroupRef}
        className="absolute inset-0 pointer-events-none"
        style={{ willChange: "opacity, filter" }}
      >
        
        {/* ── BACKGROUND PASSING CLOUDS (Behind Astronaut, z-index 4 - 6) ── */}
        
        {/* 1. Cloud 3 - Deep Horizon Drift */}
        <div
          className="pointer-events-none z-4 hidden sm:block absolute top-0 left-0"
          style={{
            top: "clamp(410px, calc(38vh + 50px), 570px)",
            width: "clamp(270px, 27vw, 440px)",
            maxWidth: "460px",
            animation: "featherDriftLtoR 125s linear infinite",
            animationDelay: "-0s",
            willChange: "transform",
            filter: "drop-shadow(0 15px 30px rgba(0, 20, 50, 0.06))",
          }}
        >
          <div style={{ animation: "featherFloatA 16s ease-in-out infinite", willChange: "transform" }}>
            <picture style={{ display: "contents" }}>
              <source
                type="image/avif"
                srcSet={`${import.meta.env.BASE_URL}IMG/Clouds_3-360.avif 360w, ${import.meta.env.BASE_URL}IMG/Clouds_3-500.avif 500w, ${import.meta.env.BASE_URL}IMG/Clouds_3-640.avif 640w`}
                sizes="clamp(270px, 27vw, 460px)"
              />
              <source
                type="image/webp"
                srcSet={`${import.meta.env.BASE_URL}IMG/Clouds_3-360.webp 360w, ${import.meta.env.BASE_URL}IMG/Clouds_3-500.webp 500w, ${import.meta.env.BASE_URL}IMG/Clouds_3-640.webp 640w`}
                sizes="clamp(270px, 27vw, 460px)"
              />
              <img
                src={`${import.meta.env.BASE_URL}IMG/Clouds_3.png`}
                alt=""
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                width={720}
                height={504}
                className="w-full h-auto object-contain select-none opacity-80"
              />
            </picture>
          </div>
        </div>

        {/* 2. Cloud 2 - Mid Horizon Drift */}
        <div
          className="pointer-events-none z-5 hidden sm:block absolute top-0 left-0"
          style={{
            top: "clamp(470px, calc(44vh + 50px), 630px)",
            width: "clamp(250px, 25vw, 400px)",
            maxWidth: "420px",
            animation: "featherDriftLtoR 125s linear infinite",
            animationDelay: "-31.25s",
            willChange: "transform",
            filter: "drop-shadow(0 15px 30px rgba(0, 20, 50, 0.07))",
          }}
        >
          <div style={{ animation: "featherFloatB 19s ease-in-out infinite", willChange: "transform" }}>
            <picture style={{ display: "contents" }}>
              <source
                type="image/avif"
                srcSet={`${import.meta.env.BASE_URL}IMG/Clouds_2-320.avif 320w, ${import.meta.env.BASE_URL}IMG/Clouds_2-440.avif 440w, ${import.meta.env.BASE_URL}IMG/Clouds_2-540.avif 540w`}
                sizes="clamp(250px, 25vw, 420px)"
              />
              <source
                type="image/webp"
                srcSet={`${import.meta.env.BASE_URL}IMG/Clouds_2-320.webp 320w, ${import.meta.env.BASE_URL}IMG/Clouds_2-440.webp 440w, ${import.meta.env.BASE_URL}IMG/Clouds_2-540.webp 540w`}
                sizes="clamp(250px, 25vw, 420px)"
              />
              <img
                src={`${import.meta.env.BASE_URL}IMG/Clouds_2.png`}
                alt=""
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                width={720}
                height={504}
                className="w-full h-auto object-contain select-none opacity-85"
              />
            </picture>
          </div>
        </div>

        {/* 3. Cloud 3 - Center Ramp Horizon Drift */}
        <div
          className="pointer-events-none z-5 hidden sm:block absolute top-0 left-0"
          style={{
            top: "clamp(530px, calc(50vh + 50px), 710px)",
            width: "clamp(290px, 29vw, 460px)",
            maxWidth: "480px",
            animation: "featherDriftLtoR 125s linear infinite",
            animationDelay: "-62.5s",
            willChange: "transform",
            filter: "drop-shadow(0 15px 30px rgba(0, 20, 50, 0.08))",
          }}
        >
          <div style={{ animation: "featherFloatC 18s ease-in-out infinite", willChange: "transform" }}>
            <picture style={{ display: "contents" }}>
              <source
                type="image/avif"
                srcSet={`${import.meta.env.BASE_URL}IMG/Clouds_3-360.avif 360w, ${import.meta.env.BASE_URL}IMG/Clouds_3-500.avif 500w, ${import.meta.env.BASE_URL}IMG/Clouds_3-640.avif 640w`}
                sizes="clamp(290px, 29vw, 480px)"
              />
              <source
                type="image/webp"
                srcSet={`${import.meta.env.BASE_URL}IMG/Clouds_3-360.webp 360w, ${import.meta.env.BASE_URL}IMG/Clouds_3-500.webp 500w, ${import.meta.env.BASE_URL}IMG/Clouds_3-640.webp 640w`}
                sizes="clamp(290px, 29vw, 480px)"
              />
              <img
                src={`${import.meta.env.BASE_URL}IMG/Clouds_3.png`}
                alt=""
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                width={720}
                height={504}
                className="w-full h-auto object-contain select-none opacity-82"
              />
            </picture>
          </div>
        </div>

        {/* 4. Cloud 2 - Upper Sky Floating Feather */}
        <div
          className="pointer-events-none z-6 hidden sm:block absolute top-0 left-0"
          style={{
            top: "clamp(390px, calc(36vh + 50px), 530px)",
            width: "clamp(240px, 24vw, 380px)",
            maxWidth: "400px",
            animation: "featherDriftLtoR 125s linear infinite",
            animationDelay: "-93.75s",
            willChange: "transform",
            filter: "drop-shadow(0 15px 30px rgba(0, 20, 50, 0.07))",
          }}
        >
          <div style={{ animation: "featherFloatD 15s ease-in-out infinite", willChange: "transform" }}>
            <picture style={{ display: "contents" }}>
              <source
                type="image/avif"
                srcSet={`${import.meta.env.BASE_URL}IMG/Clouds_2-320.avif 320w, ${import.meta.env.BASE_URL}IMG/Clouds_2-440.avif 440w, ${import.meta.env.BASE_URL}IMG/Clouds_2-540.avif 540w`}
                sizes="clamp(240px, 24vw, 400px)"
              />
              <source
                type="image/webp"
                srcSet={`${import.meta.env.BASE_URL}IMG/Clouds_2-320.webp 320w, ${import.meta.env.BASE_URL}IMG/Clouds_2-440.webp 440w, ${import.meta.env.BASE_URL}IMG/Clouds_2-540.webp 540w`}
                sizes="clamp(240px, 24vw, 400px)"
              />
              <img
                src={`${import.meta.env.BASE_URL}IMG/Clouds_2.png`}
                alt=""
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                width={720}
                height={504}
                className="w-full h-auto object-contain select-none opacity-88"
              />
            </picture>
          </div>
        </div>

        {/* 5. Cloud 5 - Mid Sky Atmospheric Drift */}
        <div
          className="pointer-events-none z-5 hidden sm:block absolute top-0 left-0"
          style={{
            top: "clamp(550px, calc(42vh + 150px), 710px)",
            width: "clamp(260px, 26vw, 420px)",
            maxWidth: "440px",
            animation: "featherDriftLtoR 120s linear infinite",
            animationDelay: "-48s",
            willChange: "transform",
            filter: "drop-shadow(0 15px 30px rgba(0, 20, 50, 0.07))",
          }}
        >
          <div style={{ animation: "featherFloatA 17.5s ease-in-out infinite", willChange: "transform" }}>
            <picture style={{ display: "contents" }}>
              <source
                type="image/avif"
                srcSet={`${import.meta.env.BASE_URL}IMG/Cloud_5-360.avif 360w, ${import.meta.env.BASE_URL}IMG/Cloud_5-540.avif 540w, ${import.meta.env.BASE_URL}IMG/Cloud_5-720.avif 720w`}
                sizes="clamp(260px, 26vw, 440px)"
              />
              <source
                type="image/webp"
                srcSet={`${import.meta.env.BASE_URL}IMG/Cloud_5-360.webp 360w, ${import.meta.env.BASE_URL}IMG/Cloud_5-540.webp 540w, ${import.meta.env.BASE_URL}IMG/Cloud_5-720.webp 720w`}
                sizes="clamp(260px, 26vw, 440px)"
              />
              <img
                src={`${import.meta.env.BASE_URL}IMG/Cloud_5.png`}
                alt=""
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                width={720}
                height={504}
                className="w-full h-auto object-contain select-none opacity-85"
              />
            </picture>
          </div>
        </div>

        {/* ── MIDGROUND: Skateboard Astronaut (z-index 10) ── */}
        <div
          ref={astroRef}
          className="light-skater-astro pointer-events-none z-10 hidden sm:block absolute"
          style={{
            right: "clamp(160px, calc(5vw + 150px), 210px)",
            top: "clamp(340px, 46vh, 520px)",
            width: "clamp(252px, 25.2vw, 384px)",
            maxWidth: "410px",
            transformOrigin: "bottom center",
            willChange: "transform, opacity",
            filter: "drop-shadow(0 20px 35px rgba(20, 35, 60, 0.22))",
          }}
        >
          <div
            className="w-full h-auto"
            style={{
              animation: "skaterFeatherBalance 8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite",
              transformOrigin: "bottom center",
              willChange: "transform",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transformStyle: "preserve-3d",
            }}
          >
            <picture style={{ display: "contents" }}>
              <source
                type="image/avif"
                srcSet={`${import.meta.env.BASE_URL}IMG/Astronaut_Skateboard_Light-360.avif 360w, ${import.meta.env.BASE_URL}IMG/Astronaut_Skateboard_Light-540.avif 540w, ${import.meta.env.BASE_URL}IMG/Astronaut_Skateboard_Light-960.avif 960w`}
                sizes="clamp(252px, 25.2vw, 410px)"
              />
              <source
                type="image/webp"
                srcSet={`${import.meta.env.BASE_URL}IMG/Astronaut_Skateboard_Light-360.webp 360w, ${import.meta.env.BASE_URL}IMG/Astronaut_Skateboard_Light-540.webp 540w, ${import.meta.env.BASE_URL}IMG/Astronaut_Skateboard_Light-960.webp 960w`}
                sizes="clamp(252px, 25.2vw, 410px)"
              />
              <img
                src={`${import.meta.env.BASE_URL}IMG/Astronaut_Skateboard_Light.png`}
                alt="Astronaut on skateboard"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                width={960}
                height={1440}
                className="w-full h-auto object-contain select-none"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "translateZ(0)",
                }}
              />
            </picture>
          </div>
        </div>

        {/* ── FOREGROUND PASSING CLOUDS (In Front of Astronaut, z-index 18 - 22) ── */}
        
        {/* 6. Cloud 1 - Lower Foreground Feather Drift */}
        <div
          className="pointer-events-none z-18 hidden sm:block absolute top-0 left-0"
          style={{
            top: "clamp(610px, calc(58vh + 50px), 810px)",
            width: "clamp(260px, 26vw, 410px)",
            maxWidth: "440px",
            animation: "featherDriftLtoR 108s linear infinite",
            animationDelay: "-13.5s",
            willChange: "transform",
            filter: "drop-shadow(0 15px 30px rgba(0, 20, 50, 0.10))",
          }}
        >
          <div style={{ animation: "featherFloatA 17s ease-in-out infinite", willChange: "transform" }}>
            <picture style={{ display: "contents" }}>
              <source
                type="image/avif"
                srcSet={`${import.meta.env.BASE_URL}IMG/Clouds_1-360.avif 360w, ${import.meta.env.BASE_URL}IMG/Clouds_1-480.avif 480w, ${import.meta.env.BASE_URL}IMG/Clouds_1-600.avif 600w`}
                sizes="clamp(260px, 26vw, 440px)"
              />
              <source
                type="image/webp"
                srcSet={`${import.meta.env.BASE_URL}IMG/Clouds_1-360.webp 360w, ${import.meta.env.BASE_URL}IMG/Clouds_1-480.webp 480w, ${import.meta.env.BASE_URL}IMG/Clouds_1-600.webp 600w`}
                sizes="clamp(260px, 26vw, 440px)"
              />
              <img
                src={`${import.meta.env.BASE_URL}IMG/Clouds_1.png`}
                alt=""
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                width={720}
                height={504}
                className="w-full h-auto object-contain select-none opacity-92"
              />
            </picture>
          </div>
        </div>

        {/* 7. Cloud 4 - Mid Foreground Floating Feather */}
        <div
          className="pointer-events-none z-20 hidden sm:block absolute top-0 left-0"
          style={{
            top: "clamp(520px, calc(51vh + 50px), 720px)",
            width: "clamp(210px, 21vw, 320px)",
            maxWidth: "340px",
            animation: "featherDriftLtoR 108s linear infinite",
            animationDelay: "-40.5s",
            willChange: "transform",
            filter: "drop-shadow(0 15px 30px rgba(0, 20, 50, 0.08))",
          }}
        >
          <div style={{ animation: "featherFloatD 15s ease-in-out infinite", willChange: "transform" }}>
            <picture style={{ display: "contents" }}>
              <source
                type="image/avif"
                srcSet={`${import.meta.env.BASE_URL}IMG/Clouds_4-240.avif 240w, ${import.meta.env.BASE_URL}IMG/Clouds_4-320.avif 320w`}
                sizes="clamp(210px, 21vw, 340px)"
              />
              <source
                type="image/webp"
                srcSet={`${import.meta.env.BASE_URL}IMG/Clouds_4-240.webp 240w, ${import.meta.env.BASE_URL}IMG/Clouds_4-320.webp 320w`}
                sizes="clamp(210px, 21vw, 340px)"
              />
              <img
                src={`${import.meta.env.BASE_URL}IMG/Clouds_4.png`}
                alt=""
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                width={720}
                height={504}
                className="w-full h-auto object-contain select-none opacity-90"
              />
            </picture>
          </div>
        </div>


        {/* 9. Cloud 1 - Over Board Tail Foreground */}
        <div
          className="pointer-events-none z-21 hidden sm:block absolute top-0 left-0"
          style={{
            top: "clamp(630px, calc(60vh + 50px), 840px)",
            width: "clamp(280px, 28vw, 440px)",
            maxWidth: "460px",
            animation: "featherDriftLtoR 108s linear infinite",
            animationDelay: "-78s",
            willChange: "transform",
            filter: "drop-shadow(0 15px 30px rgba(0, 20, 50, 0.10))",
          }}
        >
          <div style={{ animation: "featherFloatB 18s ease-in-out infinite", willChange: "transform" }}>
            <picture style={{ display: "contents" }}>
              <source
                type="image/avif"
                srcSet={`${import.meta.env.BASE_URL}IMG/Clouds_1-360.avif 360w, ${import.meta.env.BASE_URL}IMG/Clouds_1-480.avif 480w, ${import.meta.env.BASE_URL}IMG/Clouds_1-600.avif 600w`}
                sizes="clamp(280px, 28vw, 460px)"
              />
              <source
                type="image/webp"
                srcSet={`${import.meta.env.BASE_URL}IMG/Clouds_1-360.webp 360w, ${import.meta.env.BASE_URL}IMG/Clouds_1-480.webp 480w, ${import.meta.env.BASE_URL}IMG/Clouds_1-600.webp 600w`}
                sizes="clamp(280px, 28vw, 460px)"
              />
              <img
                src={`${import.meta.env.BASE_URL}IMG/Clouds_1.png`}
                alt=""
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                width={720}
                height={504}
                className="w-full h-auto object-contain select-none opacity-94"
              />
            </picture>
          </div>
        </div>

        {/* 10. Cloud 4 - Lower Front Foreground Feather */}
        <div
          className="pointer-events-none z-22 hidden sm:block absolute top-0 left-0"
          style={{
            top: "clamp(550px, calc(54vh + 50px), 760px)",
            width: "clamp(220px, 22vw, 340px)",
            maxWidth: "360px",
            animation: "featherDriftLtoR 108s linear infinite",
            animationDelay: "-96s",
            willChange: "transform",
            filter: "drop-shadow(0 15px 30px rgba(0, 20, 50, 0.08))",
          }}
        >
          <div style={{ animation: "featherFloatC 16s ease-in-out infinite", willChange: "transform" }}>
            <picture style={{ display: "contents" }}>
              <source
                type="image/avif"
                srcSet={`${import.meta.env.BASE_URL}IMG/Clouds_4-240.avif 240w, ${import.meta.env.BASE_URL}IMG/Clouds_4-320.avif 320w`}
                sizes="clamp(220px, 22vw, 360px)"
              />
              <source
                type="image/webp"
                srcSet={`${import.meta.env.BASE_URL}IMG/Clouds_4-240.webp 240w, ${import.meta.env.BASE_URL}IMG/Clouds_4-320.webp 320w`}
                sizes="clamp(220px, 22vw, 360px)"
              />
              <img
                src={`${import.meta.env.BASE_URL}IMG/Clouds_4.png`}
                alt=""
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                width={720}
                height={504}
                className="w-full h-auto object-contain select-none opacity-90"
              />
            </picture>
          </div>
        </div>

      </div>
    </div>
  );
}


const initialThemeMode = (): ThemeMode => {
  if (typeof window !== "undefined") {
    const urlTheme = new URLSearchParams(window.location.search).get("theme");
    if (urlTheme === "light" || urlTheme === "dark") return urlTheme;

    if (routeFromPath() === "home") return "light";

    const saved = localStorage.getItem("theme_mode") || localStorage.getItem("adopt_theme_mode");
    if (saved === "light" || saved === "dark") return saved;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  }
  return "light";
};

export default function App() {
  const [route, setRoute] = useState<Route>(() => routeFromPath());
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => initialThemeMode());

  usePerfMode();

  useEffect(() => {
    const onPop = () => setRoute(routeFromPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const id = window.location.hash.replace("#", "");
      const timer = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [route]);

  // Apply the selected theme mode globally
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeMode);
    if (themeMode === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, [themeMode]);

  const navigate = useCallback((next: Route) => {
    if (next === route) return;
    const path =
      next === "feedback-360" ? "/work/feedback-360"
      : next === "data-security" ? "/data-security"
      : next === "adopt-landing" ? "/adopt-landing"
      : next === "adopt" ? "/playbook/adopt"
      : next === "scale-copilot-engage" ? "/scale-copilot-engage"
      : next === "scale-copilot" || next === "adopt-v2" ? "/scale-copilot"
      : next === "vibe-coding" ? "/vibe-coding"
      : "/";
    window.history.pushState({}, "", path);
    setRoute(next);
    window.scrollTo(0, 0);
  }, [route]);

  const toggleThemeMode = useCallback(() => {
    setThemeMode((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        localStorage.setItem("theme_mode", next);
        localStorage.setItem("adopt_theme_mode", next);
      }
      return next;
    });
  }, []);

  const isLight = themeMode === "light";
  const [isDocked, setIsDocked] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  useEffect(() => {
    if (route !== "home") return;

    const onScroll = () => {
      const sy = window.scrollY;
      const workEl = document.getElementById("work");
      const workTop = workEl ? workEl.getBoundingClientRect().top + window.scrollY : 750;
      // Appear at the top with the menu before "My work" section
      const dockThreshold = Math.max(220, workTop - 500);

      if (!isDocked && sy >= dockThreshold) {
        setIsDocked(true);
      } else if (isDocked && sy < dockThreshold - 40) {
        setIsDocked(false);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isDocked, route]);

  if (route === "feedback-360") {
    return (
      <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--bg-page)" }} />}>
        <Feedback360Page
          onNavigateHome={() => navigate("home")}
          onNavigateWork={() => {
            navigate("home");
            setTimeout(() => {
              document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }}
        />
      </Suspense>
    );

  }
  if (route === "vibe-coding") {
    return (
      <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--bg-page)" }} />}>
        <VibeCodingPage
          mode={themeMode}
          onToggleTheme={toggleThemeMode}
          onBack={() => navigate("home")}
          onNavigateAdopt={() => navigate("adopt-landing")}
        />
      </Suspense>
    );
  }
  if (route === "adopt-landing") {
    return (
      <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--bg-page)" }} />}>
        <AdoptLandingPage
          mode={themeMode}
          onToggleTheme={toggleThemeMode}
          onBack={() => navigate("home")}
          onExplorePlaybook={() => {
            const el = document.getElementById("playbook-stages");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          onViewCaseStudy={() => navigate("scale-copilot-engage")}
        />
      </Suspense>
    );
  }
  if (route === "adopt") {
    return (
      <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--bg-page)" }} />}>
        <CaseStudyAdopt onBack={() => navigate("home")} />
      </Suspense>
    );
  }
  if (route === "scale-copilot" || route === "adopt-v2") {
    return (
      <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--bg-page)" }} />}>
        <CaseStudyAdoptV2 onBack={() => navigate("home")} />
      </Suspense>
    );
  }
  if (route === "scale-copilot-engage") {
    return (
      <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--bg-page)" }} />}>
        <CaseStudyAdoptV2 story="engage" onBack={() => navigate("home")} />
      </Suspense>
    );
  }

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 ${isLight ? "light" : ""} ${isSidePanelOpen ? "has-side-panel-open" : ""}`}
      style={{
        background: "var(--bg-page)",
        color: "var(--text-1)",
        fontFamily: "'Inter', sans-serif",
        position: "relative",
      }}
    >
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Dynamic Animated Cosmic Gradient Background (Dark mode only) */}
      {!isLight && (
        <div className="cosmic-gradient-bg hide-in-light fade-with-theme">
          <div className="cosmic-gradient-layer cosmic-grad-1" />
          <div className="cosmic-gradient-layer cosmic-grad-2" />
          <div className="cosmic-gradient-layer cosmic-grad-3" />
        </div>
      )}

      {/* Light Mode Full-Bleed Daylight Sky Backdrop with Zoomout Parallax */}
      {isLight && <LightSkyParallax />}

      {!isLight && <EarthParallax mode="dark" />}
      {!isLight && <SpaceSparkles mode="dark" />}

      <Nav
        mode={themeMode}
        onToggleTheme={toggleThemeMode}
        onNavigateVibeCoding={() => navigate("vibe-coding")}
        isDocked={isDocked}
      />
      <main id="main-content" tabIndex={-1} className="portfolio-main" style={{ position: "relative", zIndex: 1, outline: "none" }}>
        <Hero mode={themeMode} />
        <WorkSection
          onPlaybookOpen={() => navigate("adopt-landing")}
          onCaseStudyOpen={() => navigate("scale-copilot-engage")}
        />
        <AboutSection />
        <ExperienceTimeline />
        <ClientsSection />
        <SkillsSection />
        <FooterCTA />
      </main>
      <GeminiPromptBar
        mode={themeMode}
        isDocked={isDocked}
        isOpen={isSidePanelOpen}
        onOpenChange={setIsSidePanelOpen}
      />
    </div>
  );
}
