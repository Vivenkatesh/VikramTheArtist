import { useEffect, useRef, useState } from "react";

export function FooterCTA() {
  const footerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <footer
      ref={footerRef}
      id="contact"
      className="relative text-center overflow-hidden"
      style={{ padding: "70px 0 100px" }}
    >
      <style>{`
        .footer-birds-layer {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100vw;
          overflow: hidden;
          pointer-events: none;
          z-index: 1;
        }

        .footer-birds-layer .bird {
          background-image: url('${import.meta.env.BASE_URL}IMG/bird-cells-new.svg');
          background-size: auto 100%;
          width: 88px;
          height: 125px;
          will-change: background-position;
          animation-name: fly-cycle;
          animation-timing-function: steps(10);
          animation-iteration-count: infinite;
        }

        .footer-birds-layer.paused .bird,
        .footer-birds-layer.paused .bird-container {
          animation-play-state: paused !important;
        }

        @media (prefers-reduced-motion: reduce) {
          .footer-birds-layer {
            display: none !important;
          }
        }

        .footer-birds-layer .bird--one {
          animation-duration: 0.95s;
          animation-delay: -0.4s;		
        }
        
        .footer-birds-layer .bird--two {
          animation-duration: 0.85s;
          animation-delay: -0.7s;
        }
        
        .footer-birds-layer .bird--three {
          animation-duration: 1.15s;
          animation-delay: -0.2s;
        }
        
        .footer-birds-layer .bird--four {
          animation-duration: 1.05s;
          animation-delay: -0.5s;
        }

        .footer-birds-layer .bird-container {
          position: absolute;
          left: 0;
          will-change: transform, opacity;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        /* Bird 1: Upward soaring flight climbing high above astronaut */
        .footer-birds-layer .bird-container--one {
          top: 26%;
          animation-name: fly-soar-high-right;
          animation-duration: 20s;
          animation-delay: 0s;
        }
        
        /* Bird 2: High altitude sun-to-peak trajectory */
        .footer-birds-layer .bird-container--two {
          top: 16%;
          animation-name: fly-sun-to-peak;
          animation-duration: 24s;
          animation-delay: 4.5s;
        }
        
        /* Bird 3: Smooth mountain-ridge arc high in the sky */
        .footer-birds-layer .bird-container--three {
          top: 22%;
          animation-name: fly-ridge-arc;
          animation-duration: 22s;
          animation-delay: 10s;
        }
        
        /* Bird 4: Thermal climb rising steeply away from cliff slope */
        .footer-birds-layer .bird-container--four {
          top: 30%;
          animation-name: fly-steep-thermal;
          animation-duration: 21s;
          animation-delay: 15s;
        }

        @keyframes fly-cycle {
          100% {
            background-position: -900px 0;
          }
        }

        /* Flight Path 1: Climbs diagonally from left to high top-right corner */
        @keyframes fly-soar-high-right {
          0% {
            transform: translate3d(-100px, 120px, 0) scale(0.24);
            opacity: 0;
          }
          3% {
            opacity: 0.95;
          }
          30% {
            transform: translate3d(25vw, 10px, 0) scale(0.25);
          }
          60% {
            transform: translate3d(52vw, -110px, 0) scale(0.22);
          }
          80% {
            transform: translate3d(70vw, -190px, 0) scale(0.18);
            opacity: 0.9;
          }
          100% {
            transform: translate3d(calc(100vw + 80px), -280px, 0) scale(0.14);
            opacity: 0;
          }
        }

        /* Flight Path 2: High altitude sun-to-peak trajectory */
        @keyframes fly-sun-to-peak {
          0% {
            transform: translate3d(-100px, -20px, 0) scale(0.20);
            opacity: 0;
          }
          3% {
            opacity: 0.85;
          }
          35% {
            transform: translate3d(28vw, -90px, 0) scale(0.21);
          }
          65% {
            transform: translate3d(55vw, -160px, 0) scale(0.18);
          }
          85% {
            transform: translate3d(75vw, -220px, 0) scale(0.15);
            opacity: 0.8;
          }
          100% {
            transform: translate3d(calc(100vw + 80px), -290px, 0) scale(0.12);
            opacity: 0;
          }
        }

        /* Flight Path 3: Mountain-ridge arc high in the sky */
        @keyframes fly-ridge-arc {
          0% {
            transform: translate3d(-100px, 80px, 0) scale(0.22);
            opacity: 0;
          }
          4% {
            opacity: 0.9;
          }
          30% {
            transform: translate3d(24vw, -20px, 0) scale(0.23);
          }
          55% {
            transform: translate3d(48vw, -120px, 0) scale(0.20);
          }
          80% {
            transform: translate3d(72vw, -210px, 0) scale(0.16);
            opacity: 0.85;
          }
          100% {
            transform: translate3d(calc(100vw + 80px), -310px, 0) scale(0.13);
            opacity: 0;
          }
        }

        /* Flight Path 4: Steeper thermal climb soaring into high clouds */
        @keyframes fly-steep-thermal {
          0% {
            transform: translate3d(-100px, 150px, 0) scale(0.26);
            opacity: 0;
          }
          3% {
            opacity: 0.95;
          }
          25% {
            transform: translate3d(20vw, 30px, 0) scale(0.25);
          }
          50% {
            transform: translate3d(42vw, -100px, 0) scale(0.21);
          }
          75% {
            transform: translate3d(65vw, -220px, 0) scale(0.16);
          }
          100% {
            transform: translate3d(calc(90vw + 80px), -340px, 0) scale(0.12);
            opacity: 0;
          }
        }

        .footer-link {
          color: #3b35eb;
          text-decoration: underline;
          text-underline-offset: 3px;
          font-weight: 500;
          transition: color 0.2s ease;
        }
        :root:not([data-theme="light"]) .footer-link,
        html[data-theme="dark"] .footer-link {
          color: #93c5fd;
        }
        .footer-link:hover {
          opacity: 0.85;
        }
      `}</style>

      {/* Animated Flying Birds Layer */}
      <div className={`footer-birds-layer ${isVisible ? "" : "paused"}`}>
        <div className="bird-container bird-container--one">
          <div className="bird bird--one" />
        </div>
        <div className="bird-container bird-container--two">
          <div className="bird bird--two" />
        </div>
        <div className="bird-container bird-container--three">
          <div className="bird bird--three" />
        </div>
        <div className="bird-container bird-container--four">
          <div className="bird bird--four" />
        </div>
      </div>

      {/* Subtle radial glow */}
      <div
        className="footer-glow hide-in-light fade-with-theme"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 80% at 42% 50%, rgba(8, 20, 60, 0.85) 0%, transparent 68%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 2, transform: "translateY(-50px)" }}>
        {/* Heading */}
        <h2
          style={{
            fontFamily: "Georgia, serif",
            fontWeight: 300,
            fontSize: "clamp(1rem, 2.4vw, 2.5rem)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            color: "var(--text-1)",
            margin: "0 0 28px",
          }}
        >
          Lets design the future, together ✨
        </h2>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
            fontWeight: 300,
            fontSize: "clamp(16px, 1.4vw, 22px)",
            lineHeight: 1.5,
            color: "var(--text-2)",
            margin: 0,
          }}
        >
          Here&apos;s my{" "}
          <a
            href="https://drive.google.com/file/d/1gexpxviNXsTsOfx1RBZwYVW2caqICJGl/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            resume
          </a>
          . Get in touch on{" "}
          <a
            href="https://www.linkedin.com/in/vikramtheartist"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            LinkedIn
          </a>
          !
        </p>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: "210px",
          borderTop: "1px solid var(--border-soft)",
          paddingTop: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ color: "var(--text-3)", fontSize: "11px" }}>
          © {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}
