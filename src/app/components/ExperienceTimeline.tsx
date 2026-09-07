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
    <svg width="24" height="24" viewBox="0 0 30 30" style={{ display: "block" }}>
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
      <img src={`${import.meta.env.BASE_URL}IMG/Oracle.png`} alt="Oracle" loading="lazy" decoding="async" fetchPriority="low" width={89} height={12} className="hide-in-light-inline" style={{ height: "13px", width: "auto", objectFit: "contain" }} />
      <img src={`${import.meta.env.BASE_URL}IMG/Oracle_Light.png`} alt="Oracle" loading="lazy" decoding="async" fetchPriority="low" className="show-in-light-inline" style={{ height: "13px", width: "auto", objectFit: "contain" }} />
    </>
  );
}

function GoogleLogo() {
  return <img src={`${import.meta.env.BASE_URL}IMG/Google.png`} alt="Google" loading="lazy" decoding="async" fetchPriority="low" width={90} height={31} style={{ height: "22px", width: "auto", objectFit: "contain" }} />;
}

function McKinseyLogo() {
  return (
    <>
      <img src={`${import.meta.env.BASE_URL}IMG/McKinsey.png`} alt="McKinsey & Company" loading="lazy" decoding="async" fetchPriority="low" width={112} height={33} className="hide-in-light-inline" style={{ height: "22px", width: "auto", objectFit: "contain" }} />
      <img src={`${import.meta.env.BASE_URL}IMG/McKinsey_Light.png`} alt="McKinsey & Company" loading="lazy" decoding="async" fetchPriority="low" className="show-in-light-inline" style={{ height: "22px", width: "auto", objectFit: "contain" }} />
    </>
  );
}

function CognizantLogo() {
  return (
    <>
      <img src={`${import.meta.env.BASE_URL}IMG/Cognizant.png`} alt="Cognizant" loading="lazy" decoding="async" fetchPriority="low" width={94} height={29} className="hide-in-light-inline" style={{ height: "17px", width: "auto", objectFit: "contain" }} />
      <img src={`${import.meta.env.BASE_URL}IMG/Cognizant_Light.png`} alt="Cognizant" loading="lazy" decoding="async" fetchPriority="low" className="show-in-light-inline" style={{ height: "17px", width: "auto", objectFit: "contain" }} />
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
      <img src={`${import.meta.env.BASE_URL}IMG/Allscripts.png`} alt="Allscripts" loading="lazy" decoding="async" fetchPriority="low" width={67} height={17} className="hide-in-light-inline" style={{ height: "18px", width: "auto", objectFit: "contain" }} />
      <img src={`${import.meta.env.BASE_URL}IMG/Allscripts_Light.png`} alt="Allscripts" loading="lazy" decoding="async" fetchPriority="low" className="show-in-light-inline" style={{ height: "18px", width: "auto", objectFit: "contain" }} />
    </>
  );
}

function LionbridgeLogo() {
  return (
    <span
      className="font-bold tracking-[0.06em]"
      style={{ fontSize: "11px", color: "var(--text-1, #0f172a)", letterSpacing: "0.06em" }}
    >
      LIONBRIDGE
    </span>
  );
}

function NTTTRLogo() {
  return (
    <span
      className="font-bold tracking-[0.04em]"
      style={{ fontSize: "12px", color: "var(--text-1, #0f172a)", letterSpacing: "0.04em" }}
    >
      NTTTR
    </span>
  );
}

function HFILogo() {
  return <img src={`${import.meta.env.BASE_URL}IMG/Hfi.png`} alt="HFI" loading="lazy" decoding="async" fetchPriority="low" width={32} height={23} style={{ height: "19px", width: "auto", objectFit: "contain" }} />;
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

function TimelineEntry({ entry, index }: { entry: Entry; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const isWork = entry.type === "work";
  const hasDesc = (entry.descriptions?.length ?? 0) > 0;
  const isOpened = hovered || isExpanded;

  /* Match .shine-inner button material from theme.css (Dark mode) */
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

  const toggleExpand = () => {
    if (hasDesc) {
      setIsExpanded((prev) => !prev);
    }
  };

  return (
    <div
      className={`tl-entry tl-s${index} ${isOpened ? "is-hovered is-expanded" : ""}`}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "12px 16px",
        borderRadius: "16px",
        position: "relative",
        transition: "background 0.25s ease",
      }}
    >
      {/* ── LIGHT MODE ROW: Matches attached reference screenshot ── */}
      <div className="tl-light-layout show-in-light w-full">
        {/* Desktop Layout (hidden on mobile) */}
        <div className="hidden md:flex items-start w-full">
          {/* 1. Dates column (left of the timeline) */}
          <div
            className="tl-date-col shrink-0 flex items-center justify-end text-right"
            style={{ width: "150px", height: "24px" }}
          >
            <span
              style={{
                color: "#475569",
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "0.01em",
                whiteSpace: "nowrap",
              }}
            >
              {entry.period}
            </span>
          </div>

          {/* 2. Milestone dot column on the timeline line */}
          <div
            className="tl-dot-col shrink-0 flex items-center justify-center relative"
            style={{ width: "20px", height: "24px", marginLeft: "18px", zIndex: 2 }}
          >
            {entry.isCurrent ? (
              <div className="relative flex items-center justify-center" style={{ width: "20px", height: "20px" }}>
                <span
                  className="absolute rounded-full"
                  style={{
                    width: "18px",
                    height: "18px",
                    backgroundColor: "rgba(59, 130, 246, 0.22)",
                  }}
                />
                <span
                  className="relative rounded-full"
                  style={{
                    width: "10px",
                    height: "10px",
                    backgroundColor: "#2563eb",
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center" style={{ width: "20px", height: "20px" }}>
                <span
                  className="rounded-full"
                  style={{
                    width: "6.5px",
                    height: "6.5px",
                    backgroundColor: "#94a3b8",
                  }}
                />
              </div>
            )}
          </div>

          {/* 3. Company logos column immediately to the right */}
          <div
            className="tl-logo-col shrink-0 flex items-center justify-start"
            style={{ width: "88px", height: "26px", marginLeft: "20px" }}
          >
            <div className="tl-logo-box flex items-center justify-start">
              {entry.logo}
            </div>
          </div>

          {/* 4. Main content column: Company, Role title, Location */}
          <div className="tl-content-col flex-1" style={{ marginLeft: "16px" }}>
            <div className="flex items-start justify-between">
              <div>
                {entry.isCurrent ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: "14px", fontWeight: 500, color: "#0f172a" }}>
                        {entry.company}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 500,
                          color: "#0369a1",
                          background: "#e0f2fe",
                          padding: "1px 8px",
                          borderRadius: "9999px",
                        }}
                      >
                        Current
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: "'Satoshi', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
                        fontSize: "16.5px",
                        fontWeight: 700,
                        color: "#070e24",
                        marginTop: "2px",
                        lineHeight: 1.3,
                      }}
                    >
                      {entry.role}
                    </div>
                    {entry.location && (
                      <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "2px" }}>
                        {entry.location}
                      </div>
                    )}
                  </>
                ) : isWork ? (
                  <>
                    <div
                      style={{
                        fontFamily: "'Satoshi', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
                        fontSize: "16.5px",
                        fontWeight: 700,
                        color: "#070e24",
                        lineHeight: 1.3,
                      }}
                    >
                      {entry.role}
                    </div>
                    {entry.location && (
                      <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "2px" }}>
                        {entry.location}
                      </div>
                    )}
                  </>
                ) : (
                  <div
                    style={{
                      fontFamily: "'Satoshi', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
                      fontSize: "16.5px",
                      fontWeight: 700,
                      color: "#070e24",
                      lineHeight: 1.3,
                    }}
                  >
                    {entry.company}
                  </div>
                )}
              </div>

              {hasDesc && (
                <button
                  type="button"
                  aria-expanded={isOpened}
                  aria-controls={`tl-desc-${index}`}
                  aria-label={`${isOpened ? "Collapse" : "Expand"} details for ${entry.role || entry.company}`}
                  onClick={toggleExpand}
                  className="tl-disclosure-btn p-1.5 rounded-lg text-[#64748b] hover:text-[#070e24] hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      transform: isOpened ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.25s ease",
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Layout (visible on narrow screens) */}
        <div className="flex md:hidden items-start w-full">
          {/* Milestone dot at left */}
          <div className="shrink-0 mr-3 relative flex items-center justify-center" style={{ width: "20px", zIndex: 2, paddingTop: "2px" }}>
            {entry.isCurrent ? (
              <span
                className="rounded-full"
                style={{
                  width: "10px",
                  height: "10px",
                  backgroundColor: "#2563eb",
                  boxShadow: "0 0 0 4px rgba(59, 130, 246, 0.25)",
                }}
              />
            ) : (
              <span
                className="rounded-full"
                style={{
                  width: "6px",
                  height: "6px",
                  backgroundColor: "#94a3b8",
                }}
              />
            )}
          </div>

          {/* Grouped content to the right */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="shrink-0">{entry.logo}</div>
                  {entry.isCurrent && (
                    <span
                      style={{
                        fontSize: "10.5px",
                        fontWeight: 500,
                        color: "#0369a1",
                        background: "#e0f2fe",
                        padding: "1px 7px",
                        borderRadius: "9999px",
                      }}
                    >
                      Current
                    </span>
                  )}
                </div>
                <h3
                  style={{
                    fontFamily: "'Satoshi', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
                    fontSize: "15.5px",
                    fontWeight: 700,
                    lineHeight: 1.3,
                    color: "#070e24",
                    margin: 0,
                  }}
                >
                  {isWork ? entry.role : entry.company}
                </h3>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                  <span>{entry.period}</span>
                  {entry.location && <span> • {entry.location}</span>}
                </div>
              </div>

              {hasDesc && (
                <button
                  type="button"
                  aria-expanded={isOpened}
                  aria-controls={`tl-desc-${index}`}
                  aria-label={`${isOpened ? "Collapse" : "Expand"} details for ${entry.role || entry.company}`}
                  onClick={toggleExpand}
                  className="tl-disclosure-btn p-1.5 rounded-lg text-[#64748b] hover:text-[#070e24] hover:bg-black/5"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      transform: isOpened ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.25s ease",
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Light mode expandable descriptions */}
        {hasDesc && (
          <div
            id={`tl-desc-${index}`}
            className="tl-desc-wrapper"
            aria-hidden={!isOpened}
            style={{
              gridTemplateRows: isOpened ? "1fr" : "0fr",
              opacity: isOpened ? 1 : 0,
            }}
          >
            <div className="tl-desc-inner" style={{ minHeight: 0, overflow: "hidden" }}>
              <div className="hidden md:flex">
                <div className="shrink-0" style={{ width: "312px" }} />
                <div className="flex-1">
                  <ul style={{ margin: 0, padding: "8px 0 4px", listStyle: "none" }}>
                    {entry.descriptions!.map((d, di) => (
                      <li
                        key={di}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "9px",
                          marginBottom: "8px",
                          color: "#334155",
                          fontSize: "14px",
                          lineHeight: 1.6,
                          fontFamily: "'Satoshi', sans-serif",
                        }}
                      >
                        <span
                          style={{
                            flexShrink: 0,
                            marginTop: "8px",
                            width: "4.5px",
                            height: "4.5px",
                            borderRadius: "50%",
                            background: entry.accentColor,
                            display: "block",
                          }}
                        />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Mobile description list */}
              <div className="flex md:hidden" style={{ paddingLeft: "32px" }}>
                <ul style={{ margin: 0, padding: "8px 0 4px", listStyle: "none" }}>
                  {entry.descriptions!.map((d, di) => (
                    <li
                      key={di}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                        marginBottom: "6px",
                        color: "#334155",
                        fontSize: "13px",
                        lineHeight: 1.55,
                        fontFamily: "'Satoshi', sans-serif",
                      }}
                    >
                      <span
                        style={{
                          flexShrink: 0,
                          marginTop: "7px",
                          width: "4px",
                          height: "4px",
                          borderRadius: "50%",
                          background: entry.accentColor,
                          display: "block",
                        }}
                      />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── DARK MODE ROW: Preserving existing dark-mode presentation untouched ── */}
      <div className="tl-dark-layout hide-in-light w-full">
        {/* Main row */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* Left: logo + period */}
          <div
            className="tl-left-col"
            style={{
              flex: "0 0 calc(50% - 23px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              paddingRight: "18px",
              gap: "2px",
            }}
          >
            <div
              className="tl-logo-box"
              style={{
                opacity: 1,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              {entry.logo}
            </div>

            <span
              style={{
                fontSize: entry.company === "Microsoft" ? "14px" : "12px",
                letterSpacing: "0.03em",
                whiteSpace: "nowrap",
                lineHeight: 1.2,
                color: entry.company === "Microsoft" ? "var(--text-2)" : isOpened ? "var(--text-2)" : "var(--text-3)",
                transition: "color 0.35s",
              }}
            >
              {entry.period}
            </span>

            {entry.isCurrent && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "8.5px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--accent-current, #005da6)",
                  fontWeight: 600,
                }}
              >
                <span
                  className="tl-blink-dot"
                  style={{
                    display: "inline-block",
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "var(--accent-current, #005da6)",
                  }}
                />
                May 2025 • Current
              </span>
            )}
          </div>

          {/* Center: dot — liquid glass sphere */}
          <div className="tl-dot-col" style={{ flexShrink: 0, width: "46px", zIndex: 2 }}>
            <div
              className="tl-dot-sphere"
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                background: dotBg,
                backdropFilter: "blur(20px) saturate(1.5)",
                WebkitBackdropFilter: "blur(20px) saturate(1.5)",
                border: "1px solid rgba(255,255,255,0.05)",
                color: "white",
                boxShadow: dotShadow,
              }}
            >
              <div style={{ position: "relative", zIndex: 1 }}>
                {isWork ? <BriefcaseIcon /> : <GradCapIcon />}
              </div>
            </div>
          </div>

          {/* Right: role + company + location */}
          <div className="tl-right-col" style={{ flex: 1, paddingLeft: "18px" }}>
            <div className="flex items-center justify-between">
              <div>
                {isWork ? (
                  <>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: 500,
                        lineHeight: 1.3,
                        fontFamily: "'Satoshi', sans-serif",
                        letterSpacing: "0.005em",
                        color: "var(--text-1)",
                        transition: "color 0.35s",
                      }}
                    >
                      {entry.role}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "13.5px",
                        marginTop: "4px",
                        color: entry.company === "Microsoft" ? "var(--text-2)" : "var(--text-3)",
                        fontFamily: "'Satoshi', sans-serif",
                      }}
                    >
                      <span>{entry.company}</span>
                      {entry.location && <><span>·</span><span>{entry.location}</span></>}
                    </div>
                    <div className="tl-mobile-date" style={{ display: "none" }}>
                      {entry.period} {entry.isCurrent ? "• Current" : ""}
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: 500,
                        fontFamily: "'Satoshi', sans-serif",
                        color: "var(--text-1)",
                        transition: "color 0.35s",
                      }}
                    >
                      {entry.company}
                    </div>
                    <div className="tl-mobile-date" style={{ display: "none" }}>
                      {entry.period}
                    </div>
                  </>
                )}
              </div>

              {hasDesc && (
                <button
                  type="button"
                  aria-expanded={isOpened}
                  aria-controls={`tl-desc-dark-${index}`}
                  aria-label={`${isOpened ? "Collapse" : "Expand"} details for ${entry.role || entry.company}`}
                  onClick={toggleExpand}
                  className="tl-disclosure-btn p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      transform: isOpened ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.25s ease",
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Expandable description in dark mode */}
        {hasDesc && (
          <div
            id={`tl-desc-dark-${index}`}
            className="tl-desc-wrapper"
            aria-hidden={!isOpened}
            style={{
              gridTemplateRows: isOpened ? "1fr" : "0fr",
              opacity: isOpened ? 1 : 0,
            }}
          >
            <div className="tl-desc-inner" style={{ display: "flex", minHeight: 0, overflow: "hidden" }}>
              <div className="tl-desc-spacer" style={{ flex: "0 0 calc(50% + 2px)", flexShrink: 0 }} />
              <div className="tl-desc-content" style={{ flex: 1, paddingLeft: "18px" }}>
                <ul style={{ margin: 0, padding: "10px 0 6px", listStyle: "none" }}>
                  {entry.descriptions!.map((d, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "9px",
                        marginBottom: "8px",
                        color: "var(--text-2)",
                        fontSize: "17.5px",
                        lineHeight: 1.7,
                        fontFamily: "'Satoshi', sans-serif",
                      }}
                    >
                      <span
                        style={{
                          flexShrink: 0,
                          marginTop: "10px",
                          width: "4.5px",
                          height: "4.5px",
                          borderRadius: "50%",
                          background: entry.accentColor,
                          display: "block",
                        }}
                      />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
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
        [data-theme="light"] .tl-entry:hover,
        [data-theme="light"] .tl-entry.is-hovered {
          background: rgba(255, 255, 255, 0.25);
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
          min-height: 0;
        }
        .tl-entry:hover .tl-desc-wrapper,
        .tl-entry.is-hovered .tl-desc-wrapper,
        .tl-entry.is-expanded .tl-desc-wrapper,
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

        /* Continuous light-mode vertical spine aligned behind milestone dots */
        .tl-spine-light {
          position: absolute;
          left: 218px;
          top: 68px;
          bottom: 68px;
          width: 1.5px;
          transform: translateX(-50%);
          background: linear-gradient(to bottom, #93c5fd 0%, #cbd5e1 8%, #cbd5e1 92%, rgba(203, 213, 225, 0.3) 100%);
          z-index: 1;
          pointer-events: none;
        }

        @media (max-width: 767px) {
          .tl-spine-light {
            left: 38px !important;
            top: 44px !important;
            bottom: 44px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .tl-desc-wrapper {
            transition: none !important;
          }
          .tl-blink-dot {
            animation: none !important;
          }
        }
      `}</style>

      {/* Heading */}
      <h2
        className="text-center mb-12 sm:mb-16 h-grad-muted"
        style={{
          fontFamily: "Georgia, serif",
          fontSize: "clamp(2rem, 4vw, 2.75rem)",
          lineHeight: 1.15,
          position: "relative",
          zIndex: 1,
          fontWeight: 300,
        }}
      >
        <span>My </span><span>experience</span>
      </h2>

      {/* Timeline wrapper with restrained frosted glass backing in light mode */}
      <div
        className="experience-glass-panel relative z-1"
        style={{ maxWidth: "860px", margin: "0 auto", position: "relative" }}
      >
        {/* Dark mode vertical spine (centered) */}
        <div
          className="tl-spine hide-in-light"
          style={{
            position: "absolute",
            left: "50%",
            top: "24px",
            bottom: "24px",
            width: "1px",
            transform: "translateX(-50%)",
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.14) 12%, rgba(255,255,255,0.14) 88%, rgba(255,255,255,0.03) 100%)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        {/* Light mode continuous vertical spine */}
        <div className="tl-spine-light show-in-light" />

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {entries.map((entry, i) => (
            <TimelineEntry key={i} entry={entry} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
