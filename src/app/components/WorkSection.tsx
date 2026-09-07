import { ReactNode, useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import adoptThumb from "@/assets/img/Adopt_Thumb.png";

/* px each stacked card peeks below the previous; BASE_TOP = where card 0 sticks */
const PEEK     = 22;   // px
const BASE_TOP = 96;   // px below viewport top (clears the fixed nav)
const PLAYBOOK_PASSWORD = "designtoimproveworld";
const PLAYBOOK_LINK = "https://www.figma.com/deck/vGd7lTFMt1PeMQTr7dcz7l/ADOPT?node-id=1-125042&t=0hOVNm0DbUaw8jaK-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1";


/* ── Project data ──────────────────────────────────────────────────── */

type CTA = { label: string; href?: string; internal?: boolean; disabled?: boolean };

const projects: {
  title: string;
  description: string;
  ctas: CTA[];
  thumb: ReactNode;
}[] = [
  {
    title: "Driving Copilot Adoption",
    description:
      "Built ADOPT playbook, applied it to scale Copilot adoption, and evolved it into AdoptIQ.ai. an AI-powered adoption engine.",
    ctas: [
      { label: "Playbook", href: "/adopt", internal: true },
      { label: "View Copilot Use Case", href: "/scale-copilot-engage", internal: true },
      { label: "AdoptIQ.ai", href: "https://adoptiqai.vercel.app/" },
    ],
    thumb: (
      <div className="w-full h-full overflow-hidden rounded-xl">
        <picture>
          <source
            type="image/avif"
            srcSet={`${import.meta.env.BASE_URL}IMG/Adopt_Thumb-480.avif 480w, ${import.meta.env.BASE_URL}IMG/Adopt_Thumb-800.avif 800w, ${import.meta.env.BASE_URL}IMG/Adopt_Thumb-1087.avif 1087w`}
            sizes="(max-width: 768px) 100vw, 450px"
          />
          <source
            type="image/webp"
            srcSet={`${import.meta.env.BASE_URL}IMG/Adopt_Thumb-480.webp 480w, ${import.meta.env.BASE_URL}IMG/Adopt_Thumb-800.webp 800w, ${import.meta.env.BASE_URL}IMG/Adopt_Thumb-1087.webp 1087w`}
            sizes="(max-width: 768px) 100vw, 450px"
          />
          <img
            src={`${import.meta.env.BASE_URL}IMG/Adopt_Thumb.png`}
            alt="Driving Copilot Adoption"
            loading="lazy"
            decoding="async"
            fetchPriority="auto"
            width={1087}
            height={1067}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", opacity: 0.9 }}
          />
        </picture>
      </div>
    ),
  },
  {
    title: "Data Security",
    description:
      "Led groundbreaking UX design projects for Cloud Security and Anthos, driving innovation and improving user experiences.",
    ctas: [{ label: "Data Security Posture Mgmt", href: "https://datasecurity-vikram.framer.website/" }],
    thumb: (
      <div className="w-full h-full overflow-hidden rounded-xl">
        <picture>
          <source
            type="image/avif"
            srcSet={`${import.meta.env.BASE_URL}IMG/Data%20Security_Card-360.avif 360w, ${import.meta.env.BASE_URL}IMG/Data%20Security_Card-540.avif 540w, ${import.meta.env.BASE_URL}IMG/Data%20Security_Card-728.avif 728w`}
            sizes="(max-width: 768px) 100vw, 450px"
          />
          <source
            type="image/webp"
            srcSet={`${import.meta.env.BASE_URL}IMG/Data%20Security_Card-360.webp 360w, ${import.meta.env.BASE_URL}IMG/Data%20Security_Card-540.webp 540w, ${import.meta.env.BASE_URL}IMG/Data%20Security_Card-728.webp 728w`}
            sizes="(max-width: 768px) 100vw, 450px"
          />
          <img
            src={`${import.meta.env.BASE_URL}IMG/Data%20Security_Card.png`}
            alt="Data Security"
            loading="lazy"
            decoding="async"
            fetchPriority="auto"
            width={728}
            height={516}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
          />
        </picture>
      </div>
    ),
  },
  {
    title: "Engage Analytics",
    description:
      "Built experiences that help communicators plan and execute campaigns in Viva Engage. Designed Aggregate Analytics to measure campaign performance through audience, engagement, and sentiment insights.",
    ctas: [
      {
        label: "Coming soon",
        disabled: true,
      },
    ],
    thumb: (
      <div
        className="w-full h-full overflow-hidden rounded-xl"
        style={{
          background:
            "radial-gradient(120% 140% at 95% 100%, rgba(255,129,84,0.24) 0%, rgba(255,129,84,0) 40%), radial-gradient(120% 120% at 10% 0%, rgba(64,133,255,0.24) 0%, rgba(64,133,255,0) 38%), linear-gradient(140deg, #060b18 0%, #0b1530 52%, #111b38 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "14px",
          display: "grid",
          gridTemplateColumns: "1.25fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: "10px",
        }}
      >
        <div
          style={{
            gridColumn: "1 / 2",
            gridRow: "1 / 2",
            borderRadius: "14px",
            border: "1px solid rgba(130,170,255,0.20)",
            background: "linear-gradient(170deg, rgba(12,24,55,0.92), rgba(8,15,34,0.92))",
            padding: "10px",
            position: "relative",
          }}
        >
          <div style={{ color: "rgba(220,232,255,0.92)", fontSize: "11px", fontWeight: 600 }}>Engage Trends</div>
          <div
            style={{
              position: "absolute",
              left: "10px",
              right: "10px",
              bottom: "10px",
              height: "42px",
              borderRadius: "10px",
              background:
                "linear-gradient(180deg, rgba(66,133,244,0.05), rgba(66,133,244,0.18)), radial-gradient(50% 90% at 30% 100%, rgba(124,92,255,0.18), transparent)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
            }}
          >
            <svg viewBox="0 0 200 60" width="100%" height="100%" preserveAspectRatio="none" style={{ opacity: 0.95 }}>
              <path
                d="M0,44 C16,52 30,20 46,30 C62,40 78,50 94,36 C110,22 126,18 142,26 C158,34 174,44 200,12"
                fill="none"
                stroke="#59a6ff"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <div
          style={{
            gridColumn: "2 / 3",
            gridRow: "1 / 2",
            borderRadius: "14px",
            border: "1px solid rgba(130,170,255,0.20)",
            background: "linear-gradient(170deg, rgba(15,31,67,0.92), rgba(10,18,40,0.92))",
            padding: "10px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ color: "rgba(220,232,255,0.92)", fontSize: "11px", fontWeight: 600 }}>Total reach</div>
          <div style={{ color: "white", fontSize: "28px", fontWeight: 600, lineHeight: 1 }}>27°</div>
          <div style={{ color: "rgba(183,206,255,0.8)", fontSize: "10px" }}>Cloudy</div>
        </div>

        <div
          style={{
            gridColumn: "1 / 2",
            gridRow: "2 / 3",
            borderRadius: "14px",
            border: "1px solid rgba(130,170,255,0.20)",
            background: "linear-gradient(170deg, rgba(12,24,55,0.92), rgba(8,15,34,0.92))",
            padding: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ color: "rgba(220,232,255,0.92)", fontSize: "11px", fontWeight: 600 }}>Productivity</div>
            <div style={{ color: "white", fontSize: "24px", fontWeight: 700, lineHeight: 1.1, marginTop: "6px" }}>78%</div>
          </div>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "9999px",
              background:
                "conic-gradient(from 180deg, #4f8cff 0deg 210deg, #8759ff 210deg 300deg, rgba(255,255,255,0.12) 300deg 360deg)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <div style={{ width: "42px", height: "42px", borderRadius: "9999px", background: "#0b1330" }} />
          </div>
        </div>

        <div
          style={{
            gridColumn: "2 / 3",
            gridRow: "2 / 3",
            borderRadius: "14px",
            border: "1px solid rgba(130,170,255,0.20)",
            background:
              "radial-gradient(100% 130% at 80% 100%, rgba(255,137,93,0.26), rgba(255,137,93,0) 48%), linear-gradient(170deg, rgba(34,27,58,0.94), rgba(22,17,42,0.94))",
            padding: "10px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ color: "rgba(239,228,255,0.92)", fontSize: "11px", fontWeight: 600, alignSelf: "flex-start" }}>
            Sentiment
          </div>
          <div
            style={{
              width: "62px",
              height: "62px",
              borderRadius: "9999px",
              background:
                "conic-gradient(from 200deg, #8a4dff 0deg 160deg, #ff9f62 160deg 280deg, rgba(255,255,255,0.14) 280deg 360deg)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "9999px",
                background: "rgba(18,14,34,0.92)",
                color: "white",
                fontSize: "10px",
                display: "grid",
                placeItems: "center",
              }}
            >
              Green
            </div>
          </div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "10px" }}>Deep Work</div>
        </div>
      </div>
    ),
  },
  {
    title: "Viva Engage Communities",
    description:
      "Reimagine how Communities in Viva Engage can help us achieve local goals, foster deeper connections, and drive meaningful engagement.",
    ctas: [{ label: "View Communities Case Study", href: "https://www.figma.com/deck/ELKvu1uZ9wBlg314EFdMVO/Communities-2.0--Hack?node-id=1-16&viewport=-101%2C-140%2C0.65&t=5MqLdsILtEH45MGQ-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1", internal: true }],
    thumb: (
      <div className="w-full h-full overflow-hidden rounded-xl">
        <picture>
          <source
            type="image/avif"
            srcSet={`${import.meta.env.BASE_URL}IMG/Communities-360.avif 360w, ${import.meta.env.BASE_URL}IMG/Communities-540.avif 540w, ${import.meta.env.BASE_URL}IMG/Communities-728.avif 728w`}
            sizes="(max-width: 768px) 100vw, 450px"
          />
          <source
            type="image/webp"
            srcSet={`${import.meta.env.BASE_URL}IMG/Communities-360.webp 360w, ${import.meta.env.BASE_URL}IMG/Communities-540.webp 540w, ${import.meta.env.BASE_URL}IMG/Communities-728.webp 728w`}
            sizes="(max-width: 768px) 100vw, 450px"
          />
          <img
            src={`${import.meta.env.BASE_URL}IMG/Communities.png`}
            alt="Viva Engage Communities"
            loading="lazy"
            decoding="async"
            fetchPriority="auto"
            width={728}
            height={540}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
          />
        </picture>
      </div>
    ),
  },
  {
    title: "AI Powered Help-desk Experience",
    description:
      "Redesign the help desk experience to self-serve & self-help for solving the technology needs through a predictive & personalised experience.",
    ctas: [{ label: "View Help-desk Case Study", href: "https://docs.google.com/presentation/d/e/2PACX-1vQvENFUrPSpj9opoTOxY0pCLjRgFd63Jnu5Ps8BQa4SBmR6Tj_uToYbOo2EoOZS3Dj5kqW2d9gaSXrF/pub?start=false&loop=false&delayms=3000" }],
    thumb: (
      <div className="w-full h-full overflow-hidden rounded-xl">
        <picture>
          <source
            type="image/avif"
            srcSet={`${import.meta.env.BASE_URL}IMG/Helpdesk_Card-360.avif 360w, ${import.meta.env.BASE_URL}IMG/Helpdesk_Card-540.avif 540w, ${import.meta.env.BASE_URL}IMG/Helpdesk_Card-728.avif 728w`}
            sizes="(max-width: 768px) 100vw, 450px"
          />
          <source
            type="image/webp"
            srcSet={`${import.meta.env.BASE_URL}IMG/Helpdesk_Card-360.webp 360w, ${import.meta.env.BASE_URL}IMG/Helpdesk_Card-540.webp 540w, ${import.meta.env.BASE_URL}IMG/Helpdesk_Card-728.webp 728w`}
            sizes="(max-width: 768px) 100vw, 450px"
          />
          <img
            src={`${import.meta.env.BASE_URL}IMG/Helpdesk_Card.png`}
            alt="AI Powered Help-desk Experience"
            loading="lazy"
            decoding="async"
            fetchPriority="auto"
            width={728}
            height={540}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
          />
        </picture>
      </div>
    ),
  },
  {
    title: "Feedback 360",
    description:
      "Feedback 360 is aimed to develop a formal mechanism for confidentially giving and receiving feedback for self-developmental purposes.",
    ctas: [
      { label: "Discovery", href: "https://www.behance.net/gallery/98921683/Feedback-360" },
      { label: "Design Executing Process", href: "https://www.behance.net/gallery/98947311/Design-Execution-Process" },
    ],
    thumb: (
      <div className="w-full h-full overflow-hidden rounded-xl">
        <picture>
          <source
            type="image/avif"
            srcSet={`${import.meta.env.BASE_URL}IMG/feedback_Card-360.avif 360w, ${import.meta.env.BASE_URL}IMG/feedback_Card-540.avif 540w, ${import.meta.env.BASE_URL}IMG/feedback_Card-728.avif 728w`}
            sizes="(max-width: 768px) 100vw, 450px"
          />
          <source
            type="image/webp"
            srcSet={`${import.meta.env.BASE_URL}IMG/feedback_Card-360.webp 360w, ${import.meta.env.BASE_URL}IMG/feedback_Card-540.webp 540w, ${import.meta.env.BASE_URL}IMG/feedback_Card-728.webp 728w`}
            sizes="(max-width: 768px) 100vw, 450px"
          />
          <img
            src={`${import.meta.env.BASE_URL}IMG/feedback_Card.png`}
            alt="Feedback 360"
            loading="lazy"
            decoding="async"
            fetchPriority="auto"
            width={728}
            height={570}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
          />
        </picture>
      </div>
    ),
  },
  {
    title: "Notification Experience Design",
    description:
      "Notification XD Playbook helps the product to proactively notify the on-going users problems and also allowing them to take necessary action through recommendations at any point in time.",
    ctas: [{ label: "View Notification Playbook", href: "https://docs.google.com/presentation/d/10f2xETw-H17PE4fwk7_gnLniytWco4oBRpC-0JpCjNw/pub?start=false&loop=false&delayms=10000" }],
    thumb: (
      <div className="w-full h-full overflow-hidden rounded-xl">
        <picture>
          <source
            type="image/avif"
            srcSet={`${import.meta.env.BASE_URL}IMG/Notification_Card-360.avif 360w, ${import.meta.env.BASE_URL}IMG/Notification_Card-540.avif 540w, ${import.meta.env.BASE_URL}IMG/Notification_Card-728.avif 728w`}
            sizes="(max-width: 768px) 100vw, 450px"
          />
          <source
            type="image/webp"
            srcSet={`${import.meta.env.BASE_URL}IMG/Notification_Card-360.webp 360w, ${import.meta.env.BASE_URL}IMG/Notification_Card-540.webp 540w, ${import.meta.env.BASE_URL}IMG/Notification_Card-728.webp 728w`}
            sizes="(max-width: 768px) 100vw, 450px"
          />
          <img
            src={`${import.meta.env.BASE_URL}IMG/Notification_Card.png`}
            alt="Notification Experience Design"
            loading="lazy"
            decoding="async"
            fetchPriority="auto"
            width={728}
            height={588}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
          />
        </picture>
      </div>
    ),
  },
];

/* ── Card component ────────────────────────────────────────────────── */

function ProjectCard({
  title,
  description,
  ctas,
  thumb,
  onInternalCta,
}: {
  title: string;
  description: string;
  ctas: CTA[];
  thumb: ReactNode;
  onInternalCta?: (cta: CTA) => void;
}) {
  return (
    <div
      className="project-card flex rounded-[40px] overflow-hidden"
      style={{
        minHeight: "300px",
      }}
    >
      {/* Left: text content */}
      <div
        className="project-card-text flex flex-col justify-between"
        style={{ flex: "0 0 54%", padding: "40px 48px" }}
      >
        <div>
          <h3
            className="project-card-title"
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 400,
              fontSize: "28px",
              lineHeight: 1.25,
              color: "white",
              marginBottom: "16px",
            }}
          >
            {title}
          </h3>
          <p
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: "16px",
              lineHeight: 1.75,
              margin: 0,
            }}
          >
            {description}
          </p>
        </div>
        <div className="project-card-ctas flex flex-col items-start gap-3" style={{ marginTop: "28px" }}>
          {ctas.map((cta) => {
            const arrow = (
              <span
                aria-hidden
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            );
            const innerStyle: React.CSSProperties = {
              padding: "11px 28px",
              fontSize: "14px",
              fontWeight: 400,
              fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
            };
            const innerClass = "shine-inner text-white/80 hover:text-white text-sm";

            if (cta.disabled) {
              return (
                <span key={cta.label} className="shine-wrap opacity-60 pointer-events-none">
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="shine-inner text-white/60 text-sm"
                    style={{ ...innerStyle, border: "1px solid rgba(255,255,255,0.13)", cursor: "not-allowed", fontFamily: "inherit" }}
                  >
                    <span>{cta.label}</span>
                  </button>
                </span>
              );
            }

            if (cta.internal) {
              return (
                <span key={cta.label} className="shine-wrap">
                  <button
                    type="button"
                    onClick={() => onInternalCta?.(cta)}
                    className={innerClass}
                    style={{ ...innerStyle, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    <span>{cta.label}</span>
                    {arrow}
                  </button>
                </span>
              );
            }

            return (
              <span key={cta.label} className="shine-wrap">
                <a
                  href={cta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={innerClass}
                  style={innerStyle}
                >
                  <span>{cta.label}</span>
                  {arrow}
                </a>
              </span>
            );
          })}
        </div>
      </div>

      {/* Right: thumbnail — inset with rounded corners */}
      <div
        className="project-card-thumb"
        style={{
          flex: 1,
          margin: "20px 20px 20px 0",
          borderRadius: "24px",
          overflow: "hidden",
        }}
      >
        {thumb}
      </div>
    </div>
  );
}

/* ── Section ───────────────────────────────────────────────────────── */

export function WorkSection({
  onPlaybookOpen,
  onCaseStudyOpen,
}: {
  onPlaybookOpen?: () => void;
  onCaseStudyOpen?: () => void;
} = {}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [pendingProtectedLink, setPendingProtectedLink] = useState<string>("");

  const [activeMobileSlide, setActiveMobileSlide] = useState(0);
  const mobileSliderRef = useRef<HTMLDivElement>(null);

  const openPasswordModal = (link: string) => {
    setPasswordInput("");
    setPasswordError("");
    setPendingProtectedLink(link);
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwordInput === PLAYBOOK_PASSWORD) {
      setShowPasswordModal(false);
      setPasswordError("");
      if (pendingProtectedLink === "/scale-copilot-engage" || pendingProtectedLink.includes("scale-copilot")) {
        if (onCaseStudyOpen) onCaseStudyOpen();
        else window.location.pathname = "/scale-copilot-engage";
        return;
      }
      if (pendingProtectedLink) {
        window.open(pendingProtectedLink, "_blank", "noopener,noreferrer");
      }
      return;
    }
    setPasswordError("Incorrect password. Please try again.");
  };

  const handleCtaAction = (cta: CTA) => {
    if (!cta.href) return;
    if (cta.href.startsWith("/adopt") || cta.href.includes("adopt-landing")) {
      if (onPlaybookOpen) {
        onPlaybookOpen();
        if (cta.href.includes("#")) {
          const hash = cta.href.split("#")[1];
          setTimeout(() => {
            const el = document.getElementById(hash);
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }, 150);
        }
      } else {
        window.location.href = cta.href;
      }
      return;
    }
    if (
      cta.href === "/scale-copilot-engage" ||
      cta.href?.includes("scale-copilot") ||
      cta.href === "/playbook/adopt-v2" ||
      cta.href?.includes("adopt-v2") ||
      cta.label === "View Copilot Use Case"
    ) {
      if (onCaseStudyOpen) onCaseStudyOpen();
      else window.location.pathname = "/scale-copilot-engage";
      return;
    }
    openPasswordModal(cta.href);
  };

  const handleMobileScroll = () => {
    const el = mobileSliderRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const firstChild = el.firstElementChild as HTMLElement | null;
    const cardWidth = firstChild ? firstChild.offsetWidth + 16 : el.clientWidth;
    const activeIndex = Math.round(scrollLeft / cardWidth);
    setActiveMobileSlide(Math.min(Math.max(0, activeIndex), projects.length - 1));
  };

  const scrollToMobileSlide = (index: number) => {
    const el = mobileSliderRef.current;
    if (!el) return;
    const targetChild = el.children[index] as HTMLElement | undefined;
    if (targetChild) {
      targetChild.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    }
    setActiveMobileSlide(index);
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Helper to ensure image loading and verify readiness before async decoding
    const preloadCardImage = (el: HTMLElement) => {
      const img = el.querySelector<HTMLImageElement>("img");
      if (!img) return;
      if (img.loading === "lazy") {
        img.loading = "eager";
      }
      if ("decode" in img) {
        // If already completed and ready, skip redundant decode
        if (img.complete && img.naturalWidth > 0) return;
        img.decode().catch(() => {});
      }
    };

    // Observe elements to reveal on scroll / smooth entrance
    const revealElements = section.querySelectorAll<HTMLElement>(".work-reveal-header, .work-reveal-card");
    
    if (typeof window !== "undefined" && "IntersectionObserver" in window) {
      // 1. Vertical Observer with top (200px) and bottom (400px) margins for upward and downward scrolling
      const verticalObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-revealed");
              preloadCardImage(entry.target as HTMLElement);
            }
          });
        },
        {
          root: null,
          rootMargin: "200px 0px 400px 0px",
          threshold: 0.01,
        }
      );

      revealElements.forEach((el) => verticalObserver.observe(el));

      // 2. Mobile Horizontal Carousel Observer (scoped to horizontal scroll container)
      let horizontalObserver: IntersectionObserver | null = null;
      const slider = mobileSliderRef.current;
      if (slider) {
        const mobileCards = slider.querySelectorAll<HTMLElement>(".work-reveal-card");
        // Immediately ensure the first two mobile cards are preloaded on mount
        if (mobileCards[0]) preloadCardImage(mobileCards[0]);
        if (mobileCards[1]) preloadCardImage(mobileCards[1]);

        horizontalObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-revealed");
                preloadCardImage(entry.target as HTMLElement);
              }
            });
          },
          {
            root: slider,
            rootMargin: "0px 400px 0px 400px",
            threshold: 0.01,
          }
        );

        mobileCards.forEach((c) => horizontalObserver!.observe(c));
      }

      return () => {
        verticalObserver.disconnect();
        if (horizontalObserver) horizontalObserver.disconnect();
      };
    } else {
      revealElements.forEach((el) => {
        el.classList.add("is-revealed");
        preloadCardImage(el);
      });
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      id="work"
      className="relative px-0 sm:px-4 md:px-8"
      style={{ paddingTop: "clamp(80px, 12vw, 240px)", maxWidth: "900px", margin: "0 auto" }}
    >
      <style>{`
        @keyframes gentleArrowJump {
          0%, 100% {
            transform: translateY(0);
            opacity: 0.8;
          }
          50% {
            transform: translateY(7px);
            opacity: 1;
          }
        }
        .scroll-arrow-jump {
          animation: gentleArrowJump 2s ease-in-out infinite;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      {/* Light Mode Work Header */}
      <div className="work-reveal-header hidden [data-theme='light']_:block mb-10 text-left w-full">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#64748b] mb-2" style={{ letterSpacing: "0.16em", fontFamily: "'Inter', sans-serif" }}>
          SELECTED WORK
        </p>
        <h2 className="text-[clamp(2.2rem,4vw,3.25rem)] font-normal text-[#070e24] tracking-tight leading-tight" style={{ fontFamily: "Georgia, serif" }}>
          Ideas made tangible.
        </h2>
      </div>

      {/* Dark Mode Clickable Heading + Jumping Arrow */}
      <div
        data-no-sparkle="true"
        className="work-reveal-header [data-theme='light']_:hidden no-sparkle work-header-block flex flex-col items-center justify-center cursor-pointer select-none mb-8 sm:mb-12 group"
        onClick={(e) => {
          e.stopPropagation();
          const firstCard = document.querySelector(".ws-card");
          if (firstCard) {
            const top = firstCard.getBoundingClientRect().top + window.scrollY - 110;
            window.scrollTo({ top, behavior: "smooth" });
          }
        }}
        style={{ position: "relative", zIndex: 10 }}
      >
        {/* Heading */}
        <h2
          className="text-center h-grad-bright transition-opacity duration-200 group-hover:opacity-95"
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "clamp(1.75rem, 5.5vw, 3.125rem)",
            lineHeight: 1.15,
            fontWeight: 300,
            marginBottom: "0px",
            paddingBottom: "0",
          }}
        >
          <span>My </span><span>work</span>
        </h2>

        {/* Gentle jumping arrow below My Work */}
        <div
          className="scroll-arrow-jump transition-opacity duration-200 group-hover:opacity-100"
          style={{ marginTop: "2px", opacity: 0.85 }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--text-1)" }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* ── Mobile Version: Horizontal Swipe Slider (md:hidden) ── */}
      <div className="block md:hidden relative w-full pb-6 px-0">
        {/* Carousel Track */}
        <div
          ref={mobileSliderRef}
          onScroll={handleMobileScroll}
          className="flex overflow-x-auto snap-x snap-mandatory gap-3.5 pl-4 pr-12 pb-3 pt-1 scrollbar-none w-full"
          style={{
            WebkitOverflowScrolling: "touch",
            scrollSnapType: "x mandatory",
            scrollBehavior: "smooth",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {projects.map((p, i) => (
            <div
              key={p.title}
              className="w-[82vw] max-w-[325px] shrink-0 snap-start"
            >
              <div className="work-reveal-card">
                <ProjectCard
                  {...p}
                  onInternalCta={handleCtaAction}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Pagination & Navigation Bar */}
        <div className="flex items-center justify-between px-6 mt-4">
          {/* Pagination Indicators */}
          <div className="flex items-center gap-1">
            {projects.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Go to slide ${idx + 1}`}
                aria-current={activeMobileSlide === idx ? "true" : undefined}
                onClick={() => scrollToMobileSlide(idx)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center -mx-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full"
              >
                <span
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeMobileSlide === idx
                      ? "w-7 bg-white shadow-xs"
                      : "w-2 bg-white/30 hover:bg-white/50"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Counter & Arrow Controls */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-white/50">
              <span className="text-white font-medium">{activeMobileSlide + 1}</span> / {projects.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Previous work"
                disabled={activeMobileSlide === 0}
                onClick={() => scrollToMobileSlide(activeMobileSlide - 1)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-white/15 bg-white/5 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-white active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                aria-label="Next work"
                disabled={activeMobileSlide === projects.length - 1}
                onClick={() => scrollToMobileSlide(activeMobileSlide + 1)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-white/15 bg-white/5 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-white active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Desktop & Tablet Version: Sticky Card Stack (hidden md:flex) ── */}
      <div className="hidden md:flex flex-col">
        {projects.map((p, i) => (
          <div
            key={p.title}
            className="ws-card"
            style={{
              position: "sticky",
              top: `${BASE_TOP + i * PEEK}px`,
              zIndex: i + 1,
              marginBottom: "20px",
            }}
          >
            <div className="work-reveal-card">
              <ProjectCard
                {...p}
                onInternalCta={handleCtaAction}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Spacer — brief pause at the fully-stacked state before the next section */}
      <div className="hidden md:block" style={{ height: "80px" }} />

      {showPasswordModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="playbook-password-title"
          className="fixed inset-0 z-[120] flex items-center justify-center px-6"
          style={{ background: "rgba(6, 9, 16, 0.72)", backdropFilter: "blur(4px)" }}
        >
          <form
            onSubmit={handlePasswordSubmit}
            className="w-full max-w-[420px] rounded-2xl border p-6"
            style={{
              background: "rgba(11, 14, 24, 0.94)",
              borderColor: "rgba(255,255,255,0.18)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
            }}
          >
            <h3
              id="playbook-password-title"
              style={{ color: "white", fontSize: "24px", fontWeight: 600, lineHeight: 1.2 }}
            >
              Enter password to open Playbook
            </h3>
            <p style={{ color: "rgba(255,255,255,0.68)", marginTop: "8px", fontSize: "14px", lineHeight: 1.6 }}>
              Access to this case study is protected.
            </p>

            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              autoFocus
              placeholder="Type password"
              className="mt-5 w-full rounded-xl border px-4 py-3 text-[15px]"
              style={{
                borderColor: "rgba(255,255,255,0.24)",
                background: "rgba(255,255,255,0.06)",
                color: "white",
                outline: "none",
              }}
            />

            {passwordError && (
              <p style={{ color: "#ff8a8a", marginTop: "10px", fontSize: "13px" }}>{passwordError}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="rounded-xl border px-4 py-2.5 text-sm font-medium"
                style={{ borderColor: "rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.9)" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl px-4 py-2.5 text-sm font-semibold"
                style={{ background: "#c5dc4b", color: "#111827" }}
              >
                Open Playbook
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
