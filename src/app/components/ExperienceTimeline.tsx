import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";

/* ── Icons ─────────────────────────────────────────────────────── */

function BriefcaseIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  );
}

function GradCapIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3zm-5 9.18v4L12 21l5-2.82v-4L12 17l-5-2.82z" />
    </svg>
  );
}

/* ── Company Logos ─────────────────────────────────────────────── */

function MicrosoftLogo() {
  return (
    <svg width="33" height="33" viewBox="0 0 30 30" style={{ display: "block" }}>
      <rect x="0"    y="0"    width="13.5" height="13.5" fill="#f25022" />
      <rect x="16.5" y="0"    width="13.5" height="13.5" fill="#7fba00" />
      <rect x="0"    y="16.5" width="13.5" height="13.5" fill="#00a4ef" />
      <rect x="16.5" y="16.5" width="13.5" height="13.5" fill="#ffb900" />
    </svg>
  );
}

function OracleLogo() {
  return (
    <>
      <img src={`${import.meta.env.BASE_URL}IMG/Oracle.png`} alt="Oracle" loading="lazy" decoding="async" fetchPriority="low" width={89} height={12} className="hide-in-light-inline" style={{ height: "12.6px", width: "auto", objectFit: "contain" }} />
      <img src={`${import.meta.env.BASE_URL}IMG/Oracle_Light.png`} alt="Oracle" loading="lazy" decoding="async" fetchPriority="low" className="show-in-light-inline" style={{ height: "12.6px", width: "auto", objectFit: "contain" }} />
    </>
  );
}

function GoogleLogo() {
  return <img src={`${import.meta.env.BASE_URL}IMG/Google.png`} alt="Google" loading="lazy" decoding="async" fetchPriority="low" width={90} height={31} style={{ height: "31px", width: "auto", objectFit: "contain" }} />;
}

function McKinseyLogo() {
  return (
    <>
      <img src={`${import.meta.env.BASE_URL}IMG/McKinsey.png`} alt="McKinsey & Company" loading="lazy" decoding="async" fetchPriority="low" width={112} height={33} className="hide-in-light-inline" style={{ height: "32px", width: "auto", objectFit: "contain" }} />
      <img src={`${import.meta.env.BASE_URL}IMG/McKinsey_Light.png`} alt="McKinsey & Company" loading="lazy" decoding="async" fetchPriority="low" className="show-in-light-inline" style={{ height: "32px", width: "auto", objectFit: "contain" }} />
    </>
  );
}

function CognizantLogo() {
  return (
    <>
      <img src={`${import.meta.env.BASE_URL}IMG/Cognizant.png`} alt="Cognizant" loading="lazy" decoding="async" fetchPriority="low" width={94} height={29} className="hide-in-light-inline" style={{ height: "25.5px", width: "auto", objectFit: "contain" }} />
      <img src={`${import.meta.env.BASE_URL}IMG/Cognizant_Light.png`} alt="Cognizant" loading="lazy" decoding="async" fetchPriority="low" className="show-in-light-inline" style={{ height: "25.5px", width: "auto", objectFit: "contain" }} />
    </>
  );
}

function TCSLogo() {
  return (
    <>
      <img src={`${import.meta.env.BASE_URL}IMG/TCS.png`} alt="TCS" loading="lazy" decoding="async" fetchPriority="low" width={26} height={16} className="hide-in-light-inline" style={{ height: "18px", width: "auto", objectFit: "contain" }} />
      <img src={`${import.meta.env.BASE_URL}IMG/TCS_light.png`} alt="TCS" loading="lazy" decoding="async" fetchPriority="low" className="show-in-light-inline" style={{ height: "18px", width: "auto", objectFit: "contain" }} />
    </>
  );
}

function AllscriptsLogo() {
  return (
    <>
      <img src={`${import.meta.env.BASE_URL}IMG/Allscripts.png`} alt="Allscripts" loading="lazy" decoding="async" fetchPriority="low" width={67} height={17} className="hide-in-light-inline" style={{ height: "19px", width: "auto", objectFit: "contain" }} />
      <img src={`${import.meta.env.BASE_URL}IMG/Allscripts_Light.png`} alt="Allscripts" loading="lazy" decoding="async" fetchPriority="low" className="show-in-light-inline" style={{ height: "19px", width: "auto", objectFit: "contain" }} />
    </>
  );
}

function LionbridgeLogo() {
  return (
    <span style={{ color: "var(--text-2)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em" }}>LIONBRIDGE</span>
  );
}

function NTTTRLogo() {
  return (
    <span style={{ color: "var(--text-2)", fontSize: "13px", fontWeight: 600, letterSpacing: "0.04em" }}>NTTTR</span>
  );
}

function HFILogo() {
  return <img src={`${import.meta.env.BASE_URL}IMG/Hfi.png`} alt="HFI" loading="lazy" decoding="async" fetchPriority="low" width={32} height={23} style={{ height: "22px", width: "auto", objectFit: "contain" }} />;
}

function CSELogo() {
  return null;
}

/* ── Data ─────────────────────────────────────────────────────── */

type EntryType = "work" | "education";

interface Entry {
  type: EntryType;
  company: string;
  role?: string;
  period: string;
  location?: string;
  isCurrent?: boolean;
  accentColor: string;
  logo: ReactNode;
  descriptions?: string[];
}

const entries: Entry[] = [
  {
    type: "work", company: "Microsoft", role: "Product Design Lead",
    period: "May 2025 – Present", location: "India", isCurrent: true,
    accentColor: "#0078d4", logo: <MicrosoftLogo />,
    descriptions: [
      "Leading Copilot adoption design in Viva Engage, shaping Communities experiences to scale usage.",
      "Integrated Viva Engage Communities into Teams, simplifying AI workflows into trusted, accessible daily collaboration.",
    ],
  },
  {
    type: "work", company: "Oracle", role: "Sr. Principal Product Designer",
    period: "Mar – May 2025", location: "Remote",
    accentColor: "#c74634", logo: <OracleLogo />,
    descriptions: [
      "Managed a design team for AI-powered finance products to deliver cloud-based experiences for automating and analysing enterprise financial operations.",
    ],
  },
  {
    type: "work", company: "Google", role: "Lead UX Designer",
    period: "Oct 2021 – Jan 2024", location: "New York City",
    accentColor: "#4285F4", logo: <GoogleLogo />,
    descriptions: [
      "Designed the user experience of cloud security tools by creating intuitive and efficient solutions that simplify complex tasks.",
      "Leveraged AI to automate tasks, provide insights, and enhance user experience.",
      "Partnered with stakeholders, user researchers, and product managers to set the product vision and roadmap.",
      "Managed and mentored a team of designers to deliver exceptional user experiences.",
    ],
  },
  {
    type: "work", company: "McKinsey & Company", role: "Lead Product Designer",
    period: "Sep 2017 – Oct 2021", location: "Prague",
    accentColor: "#8b7bb8", logo: <McKinseyLogo />,
    descriptions: [
      "Led UX strategy for high-impact projects, aligning design goals with business objectives.",
      "Mentored design teams and fostered a culture of innovation.",
      "Designed products with innovative chatbot and AI-driven solutions.",
    ],
  },
  {
    type: "work", company: "Cognizant Technology Solutions", role: "Sr. User Experience Designer",
    period: "Mar 2014 – Sep 2017", location: "Chennai",
    accentColor: "#1a77c9", logo: <CognizantLogo />,
    descriptions: [
      "Led, managed, and mentored UX teams providing design direction, project management, and stakeholder management to ensure successful project delivery and client satisfaction.",
    ],
  },
  {
    type: "education", company: "Human Factors International",
    period: "2012", accentColor: "#34A853", logo: <HFILogo />,
    descriptions: [
      "Certified Usability Analyst",
      "UX for Mobility",
    ],
  },
  {
    type: "work", company: "Tata Consultancy Services", role: "Sr. User Experience Designer",
    period: "Aug 2010 – Mar 2014", location: "Mumbai",
    accentColor: "#e0335a", logo: <TCSLogo />,
    descriptions: [
      "Executed all facets of user-centered design — from user research and information architecture to prototyping and usability testing — to deliver impactful solutions for clients.",
    ],
  },
  {
    type: "work", company: "Allscripts", role: "UI Designer",
    period: "May 2009 – Aug 2010", location: "Pune",
    accentColor: "#7c3aed", logo: <AllscriptsLogo />,
  },
  {
    type: "work", company: "Lionbridge", role: "Graphic Designer",
    period: "Nov 2007 – May 2009", location: "Chennai",
    accentColor: "#f97316", logo: <LionbridgeLogo />,
  },
  {
    type: "work", company: "NTTTR", role: "Intern UI Designer",
    period: "2007", accentColor: "#6b7280", logo: <NTTTRLogo />,
  },
  {
    type: "education", company: "Computer Science Engineering",
    period: "2003 – 2007", accentColor: "#34A853", logo: <CSELogo />,
  },
];

/* ── Timeline Entry ─────────────────────────────────────────────── */

/*
 * Layout math (wrapper maxWidth=720, padding 0 24px → content 672px):
 * Entry padding 14px 20px → entry content 632px.
 * Left col: calc(50% - 23px) = 316 - 23 = 293px of entry content.
 * Dot: 46px. Dot center from wrapper left = 24 + 20 + 293 + 23 = 360px = 50% of 720. ✓
 * Desc spacer = calc(50% - 23px + 46px) = calc(50% + 23px) of entry content.
 */

function TimelineEntry({ entry, index }: { entry: Entry; index: number }) {
  const [hovered, setHovered] = useState(false);
  const isWork = entry.type === "work";
  const hasDesc = (entry.descriptions?.length ?? 0) > 0;
  const isOpened = hovered;

  /* Match .shine-inner button material from theme.css */
  const dotShadow = isOpened
    ? [
        "inset 0 1px 0 rgba(255,255,255,0.52)",
        "inset 0 4px 10px -4px rgba(255,255,255,0.24)",
        "inset 0 -6px 14px -8px rgba(190,210,235,0.28)",
        "inset 0 -2px 10px rgba(0,0,0,0.36)",
        "0 5px 14px rgba(0,0,0,0.35)",
        "0 2px 4px rgba(0,0,0,0.30)",
      ].join(", ")
    : [
        "inset 0 1px 0 rgba(255,255,255,0.42)",
        "inset 0 4px 10px -4px rgba(255,255,255,0.18)",
        "inset 0 -6px 14px -8px rgba(180,200,230,0.22)",
        "inset 0 -2px 10px rgba(0,0,0,0.32)",
        "0 3px 10px rgba(0,0,0,0.30)",
        "0 1px 3px rgba(0,0,0,0.25)",
      ].join(", ");

  const dotBg = isOpened
    ? [
        "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.14) 30%, transparent 62%)",
        "radial-gradient(ellipse 78% 42% at 50% 112%, rgba(180,200,230,0.20) 0%, transparent 58%)",
        "linear-gradient(180deg, rgba(68,78,96,0.96) 0%, rgba(34,40,54,0.98) 38%, rgba(16,20,30,1) 72%, rgba(26,32,46,1) 100%)",
      ].join(", ")
    : [
        "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.10) 30%, transparent 62%)",
        "radial-gradient(ellipse 78% 42% at 50% 112%, rgba(170,195,225,0.14) 0%, transparent 58%)",
        "linear-gradient(180deg, rgba(56,64,80,0.94) 0%, rgba(28,34,46,0.97) 38%, rgba(12,16,24,1) 72%, rgba(20,26,38,1) 100%)",
      ].join(", ");

  return (
    <div
      className={`tl-entry tl-s${index} ${hovered ? "is-hovered" : ""}`}
      role={hasDesc ? "button" : undefined}
      tabIndex={hasDesc ? 0 : undefined}
      aria-expanded={hasDesc ? isOpened : undefined}
      aria-controls={hasDesc ? `tl-desc-${index}` : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onClick={() => hasDesc && setHovered(!hovered)}
      onKeyDown={(e) => {
        if (hasDesc && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          setHovered(!hovered);
        }
      }}
      style={{
        padding: "14px 20px",
        borderRadius: "14px",
        position: "relative",
        cursor: hasDesc ? "pointer" : "default",
        transition: "background 0.25s ease",
        outline: "none",
      }}
    >
      {/* ── Main row ── */}
      <div style={{ display: "flex", alignItems: "center" }}>

        {/* Left: logo + period */}
        <div className="tl-left-col" style={{
          flex: "0 0 calc(50% - 23px)",
          display: "flex", flexDirection: "column",
          alignItems: "flex-end", paddingRight: "18px", gap: "2px",
        }}>
          <div className="tl-logo-box" style={{
            opacity: 1,
            display: "flex", justifyContent: "flex-end",
          }}>
            {entry.logo}
          </div>

          <span style={{
            fontSize: entry.company === "Microsoft" ? "14px" : "12px", letterSpacing: "0.03em", whiteSpace: "nowrap",
            lineHeight: 1.2,
            color: entry.company === "Microsoft" ? "var(--text-2)" : isOpened ? "var(--text-2)" : "var(--text-4)",
            transition: "color 0.35s",
          }}>
            {entry.period}
          </span>

          {entry.isCurrent && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              fontSize: "8.5px", letterSpacing: "0.12em", textTransform: "uppercase",
              color: entry.accentColor, fontWeight: 600,
            }}>
              <span className="tl-blink-dot" style={{
                display: "inline-block", width: "5px", height: "5px",
                borderRadius: "50%", background: entry.accentColor,
              }} />
              May 2025 • Current
            </span>
          )}
        </div>

        {/* Center: dot — liquid glass sphere */}
        <div className="tl-dot-col" style={{ flexShrink: 0, width: "46px", zIndex: 2 }}>
          <div className="tl-dot-sphere" style={{
            width: "46px", height: "46px", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", overflow: "hidden",
            background: dotBg,
            backdropFilter: "blur(20px) saturate(1.5)",
            WebkitBackdropFilter: "blur(20px) saturate(1.5)",
            border: "1px solid rgba(255,255,255,0.05)",
            color: "white",
            boxShadow: dotShadow,
          }}>
            {/* Icon */}
            <div style={{ position: "relative", zIndex: 1 }}>
              {isWork ? <BriefcaseIcon /> : <GradCapIcon />}
            </div>
          </div>
        </div>

        {/* Right: role + company + location */}
        <div className="tl-right-col" style={{ flex: 1, paddingLeft: "18px" }}>
          {isWork ? (
            <>
              <div style={{
                fontSize: "18px", fontWeight: 500, lineHeight: 1.3,
                fontFamily: "'Satoshi', sans-serif", letterSpacing: "0.005em",
                color: "var(--text-1)",
                transition: "color 0.35s",
              }}>
                {entry.role}
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: "5px",
                fontSize: "13.5px", marginTop: "4px",
                color: entry.company === "Microsoft" ? "var(--text-2)" : "var(--text-3)",
                fontFamily: "'Satoshi', sans-serif",
              }}>
                <span>{entry.company}</span>
                {entry.location && <><span>·</span><span>{entry.location}</span></>}
              </div>
              <div className="tl-mobile-date" style={{ display: "none" }}>
                {entry.period} {entry.isCurrent ? "• Current" : ""}
              </div>
            </>
          ) : (
            <>
              <div style={{
                fontSize: "16px", fontWeight: 500,
                fontFamily: "'Satoshi', sans-serif",
                color: "var(--text-1)",
                transition: "color 0.35s",
              }}>
                {entry.company}
              </div>
              <div className="tl-mobile-date" style={{ display: "none" }}>
                {entry.period}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Expandable description ── */}
      {hasDesc && (
        <div id={`tl-desc-${index}`} className="tl-desc-wrapper" aria-hidden={!isOpened}>
          <div className="tl-desc-inner" style={{ display: "flex" }}>
            {/* Spacer aligns content under right column on desktop */}
            <div className="tl-desc-spacer" style={{ flex: "0 0 calc(50% + 2px)", flexShrink: 0 }} />
            <div className="tl-desc-content" style={{ flex: 1, paddingLeft: "18px" }}>
              <ul style={{ margin: 0, padding: "10px 0 6px", listStyle: "none" }}>
                {entry.descriptions!.map((d, i) => (
                  <li key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: "9px",
                    marginBottom: "8px",
                    color: "var(--text-2)", fontSize: "17.5px",
                    lineHeight: 1.7, fontFamily: "'Satoshi', sans-serif",
                  }}>
                    <span style={{
                      flexShrink: 0, marginTop: "10px",
                      width: "4.5px", height: "4.5px", borderRadius: "50%",
                      background: entry.accentColor, display: "block",
                    }} />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Section ─────────────────────────────────────────────────────── */

export function ExperienceTimeline() {
  return (
    <section id="experience" className="relative py-20 overflow-hidden">
      <style>{`
        @keyframes tl-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.2; }
        }
        .tl-blink-dot { animation: tl-blink 1.8s ease-in-out infinite; }

        .tl-entry {
          transition: background 0.25s ease;
        }
        .tl-entry:hover,
        .tl-entry.is-hovered,
        .tl-entry:focus-visible {
          background: rgba(255, 255, 255, 0.04);
        }
        .tl-entry:focus-visible {
          box-shadow: 0 0 0 2px #3b82f6;
        }

        .tl-desc-wrapper {
          display: grid;
          grid-template-rows: 0fr;
          opacity: 0;
          transition: grid-template-rows 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
        }
        .tl-desc-inner {
          overflow: hidden;
        }
        .tl-entry:hover .tl-desc-wrapper,
        .tl-entry.is-hovered .tl-desc-wrapper,
        .tl-entry:focus-visible .tl-desc-wrapper {
          grid-template-rows: 1fr;
          opacity: 1;
        }
        .tl-entry .tl-logo-box {
          transition: transform 0.35s ease;
        }
        .tl-entry:hover .tl-logo-box,
        .tl-entry.is-hovered .tl-logo-box,
        .tl-entry:focus-visible .tl-logo-box {
          transform: scale(1.07) translateX(-2px);
        }
        .tl-entry .tl-dot-sphere {
          transition: box-shadow 0.35s ease, transform 0.35s ease, background 0.35s ease;
        }
        .tl-entry:hover .tl-dot-sphere,
        .tl-entry.is-hovered .tl-dot-sphere,
        .tl-entry:focus-visible .tl-dot-sphere {
          transform: scale(1.15);
        }
      `}</style>

      {/* Heading */}
      <h2 className="text-center mb-16 h-grad-muted" style={{ fontFamily: "Georgia, serif", fontSize: "2.5rem", lineHeight: 1, position: "relative", zIndex: 1, fontWeight: 300 }}>
        <span>My </span><span>experience</span>
      </h2>

      {/* Timeline wrapper */}
      <div style={{ maxWidth: "920px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>

        {/* Vertical spine */}
        <div className="tl-spine" style={{
          position: "absolute",
          left: "50%", top: "24px", bottom: "24px",
          width: "1px",
          transform: "translateX(-50%)",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.14) 12%, rgba(255,255,255,0.14) 88%, rgba(255,255,255,0.03) 100%)",
          zIndex: 0,
          pointerEvents: "none",
        }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {entries.map((entry, i) => (
            <TimelineEntry key={i} entry={entry} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
