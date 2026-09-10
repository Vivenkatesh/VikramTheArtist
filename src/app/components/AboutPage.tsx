import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Nav } from "./Nav";
import { GeminiPromptBar } from "./GeminiPromptBar";
import "../../styles/about-page.css";

interface AboutPageProps {
  mode: "dark" | "light";
  onToggleTheme: () => void;
  onBack: () => void;
  onNavigateVibeCoding: () => void;
  onNavigateHome: (hash?: string) => void;
}

const experience = [
  { name: "Microsoft", src: null },
  { name: "Google", src: "IMG/Google.png" },
  { name: "McKinsey & Company", src: "IMG/McKinsey.png" },
  { name: "Oracle", src: "IMG/Oracle_Light.png" },
];

const principles = [
  ["01", "Empower people", "Design for real needs. Advocate for equality. Help others reach their potential."],
  ["02", "Lead with care", "Build trust and psychological safety so people and ideas can grow."],
  ["03", "Stay curious", "Keep learning through art, technology and philosophy. Make space for mindfulness."],
];

function CompanyLogo({ name, src }: { name: string; src: string | null }) {
  if (src) {
    return <img src={`${import.meta.env.BASE_URL}${src}`} alt={name} loading="lazy" decoding="async" />;
  }

  return (
    <svg viewBox="0 0 30 30" aria-label={name} role="img">
      <rect x="0" y="0" width="13.5" height="13.5" />
      <rect x="16.5" y="0" width="13.5" height="13.5" />
      <rect x="0" y="16.5" width="13.5" height="13.5" />
      <rect x="16.5" y="16.5" width="13.5" height="13.5" />
    </svg>
  );
}

export function AboutPage({ mode, onToggleTheme, onBack, onNavigateVibeCoding, onNavigateHome }: AboutPageProps) {
  const [isAmaOpen, setIsAmaOpen] = useState(false);

  useEffect(() => {
    document.title = "About Vikram — Product Design Leader";
  }, []);

  return (
    <div className="about-page">
      <Nav mode={mode} onToggleTheme={onToggleTheme} onNavigateVibeCoding={onNavigateVibeCoding} onNavigateHome={onNavigateHome} />

      <main>
        <section className="about-intro" aria-labelledby="about-title">
          <div className="about-portrait-wrap">
            <div className="about-portrait">
              <img src={`${import.meta.env.BASE_URL}IMG/Vikram.png`} alt="Portrait of Vikram" />
            </div>
            <div className="about-person-card">
              <h2>Vikram</h2>
              <p>Artist at heart and Product Designer by profession</p>
              <div className="about-person-links">
                <a href="https://www.linkedin.com/in/vikramtheartist" target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={14} /></a>
                <a href="mailto:vikramtheartist@gmail.com">Email <ArrowUpRight size={14} /></a>
              </div>
            </div>
          </div>

          <div className="about-copy-column">
            <p className="about-eyebrow">THE PERSON BEHIND THE WORK</p>
            <h1 id="about-title" className="about-identity-title"><span>I Design,</span><em>Therefore I am</em></h1>
            <p>I&apos;m Vikram, a product design leader with 18+ years of experience across the US, Europe and India.</p>
            <p>At Microsoft, I lead design initiatives for Copilot adoption and Engage Analytics, turning complex enterprise systems into intuitive AI experiences.</p>
            <p>My journey spans Google, McKinsey and Oracle. I connect strategic vision with hands-on craft—and help teams do their best work through mentorship, trust and design excellence.</p>
            <div className="about-facts">
              <p className="about-facts-label">EXPERIENCE ACROSS</p>
              <div className="about-companies">
                {experience.map((company) => <span key={company.name}><CompanyLogo name={company.name} src={company.src} /></span>)}
              </div>
              <div className="about-fact-grid">
                <div><strong>18+ years</strong><small>Product design &amp; leadership</small></div>
                <div><strong>US · Europe · India</strong><small>International experience</small></div>
              </div>
            </div>

            <div className="about-philosophy">
              <p className="about-facts-label">DESIGN PHILOSOPHY</p>
              <h2>Better design can make better lives.</h2>
              <p className="about-philosophy-intro">My purpose is simple: help people thrive, turn complexity into possibility, and create positive change through design.</p>
              <div className="about-principles">
                {principles.map(([number, title, copy]) => (
                  <div className="about-principle" key={number}><span>{number}</span><div><strong>{title}</strong><small>{copy}</small></div></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="about-ama-above-footer">
          <GeminiPromptBar mode={mode} isDocked={false} isOpen={isAmaOpen} onOpenChange={setIsAmaOpen} placement="inline" />
        </div>

        <section className="about-closing" id="contact">
          <div className="about-closing-content">
            <h2>Create something that makes a positive difference.</h2>
            <p className="about-closing-subtitle">
              Here&apos;s my{" "}
              <a href="https://drive.google.com/file/d/1gexpxviNXsTsOfx1RBZwYVW2caqICJGl/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="footer-link">resume</a>
              . Get in touch on{" "}
              <a href="https://www.linkedin.com/in/vikramtheartist" target="_blank" rel="noopener noreferrer" className="footer-link">LinkedIn</a>
              !
            </p>
          </div>
          <div className="about-closing-rule"><span>ART · DESIGN · PHILOSOPHY · TECHNOLOGY · WELL-BEING</span></div>
          <div className="about-footer-line"><span>© Vikram</span></div>
        </section>
      </main>
    </div>
  );
}
