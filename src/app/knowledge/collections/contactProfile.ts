/**
 * Canonical Contact & Profile Sources
 * 
 * Verified single source of truth for external profile destinations,
 * canonical resume URL, and verified contact numbers extracted directly
 * from approved resume ("Vikram_Product Design Leader.pdf").
 */

export interface CanonicalContactProfile {
  name: string;
  headline: string;
  currentRole: string;
  experienceSummary: string;
  email: string;
  phone: string;
  resumeUrl: string;
  resumeTitle: string;
  resumeSubtitle: string;
  linkedinUrl: string;
  linkedinHandle: string;
  portfolioUrl: string;
  sourceRef: string;
}

export const CANONICAL_CONTACT_PROFILE: CanonicalContactProfile = {
  name: "Vikram Venkatesh",
  headline: "Product Design Leader",
  currentRole: "Microsoft · AI & Enterprise Product Design",
  experienceSummary: "18+ years · AI, Enterprise & UX Leadership",
  email: "vikramtheartist@gmail.com",
  phone: "+91 90037 57625",
  resumeUrl: "https://drive.google.com/file/d/1gexpxviNXsTsOfx1RBZwYVW2caqICJGl/view?usp=sharing",
  resumeTitle: "Vikram Venkatesh — Resume",
  resumeSubtitle: "Product Design Leader · 18+ years · AI, Enterprise & UX Leadership",
  linkedinUrl: "https://www.linkedin.com/in/vikramtheartist",
  linkedinHandle: "linkedin.com/in/vikramtheartist",
  portfolioUrl: "https://vikramtheartist.com",
  sourceRef: "Approved Resume: Vikram_Product Design Leader.pdf"
};

/**
 * Structured Canonical Owner Profile
 * 
 * Deterministic single source of truth for basic profile facts.
 * Used to resolve simple factual questions (company, role, location, tenure, education)
 * with calibrated, concise answers before entering semantic retrieval.
 */
export interface CanonicalOwnerProfile {
  name: string;
  currentCompany: string;
  currentRole: string;
  currentLocation: string;
  experienceYears: string;
  headline: string;
  linkedin: string;
  resumeUrl: string;
  phone: string;
  email: string;
  education: string;
  currentFocus: string;
  timeline: {
    company: string;
    role: string;
    period: string;
    location: string;
    focus: string;
  }[];
}

export const CANONICAL_OWNER_PROFILE: CanonicalOwnerProfile = {
  name: "Vikram Venkatesh",
  currentCompany: "Microsoft",
  currentRole: "Lead Product Designer",
  currentLocation: "Hyderabad, India",
  experienceYears: "18+",
  headline: "Product Design Leader specializing in AI-first enterprise systems and behavioral adoption",
  linkedin: "https://www.linkedin.com/in/vikramtheartist",
  resumeUrl: "https://drive.google.com/file/d/1gexpxviNXsTsOfx1RBZwYVW2caqICJGl/view?usp=sharing",
  phone: "+91 90037 57625",
  email: "vikramtheartist@gmail.com",
  education: "Bachelor's Degree in Computer Science",
  currentFocus: "Leading Copilot adoption experiences across Viva Engage and Teams, and directing Engage Analytics",
  timeline: [
    {
      company: "Microsoft",
      role: "Lead Product Designer",
      period: "May 2025 – Present",
      location: "Hyderabad, India",
      focus: "Copilot Adoption in Viva Engage & Teams, Engage Analytics"
    },
    {
      company: "Oracle",
      role: "Sr. Principal Product Designer",
      period: "March 2025 – May 2025",
      location: "Remote",
      focus: "AI-driven enterprise finance automation and analytics"
    },
    {
      company: "Google",
      role: "Lead UX Designer",
      period: "2021 – 2024",
      location: "New York, NY",
      focus: "Google Cloud Anthos & Cloud Security UX"
    },
    {
      company: "McKinsey & Company",
      role: "Design Consultant / Expert",
      period: "2018 – 2021",
      location: "Prague, Europe",
      focus: "Enterprise digital transformations and product strategy"
    },
    {
      company: "Cognizant",
      role: "Senior UX Designer",
      period: "2013 – 2018",
      location: "India & Global",
      focus: "Enterprise UX, interaction design and design systems"
    },
    {
      company: "TCS",
      role: "UX & Visual Designer",
      period: "2007 – 2013",
      location: "India",
      focus: "Visual design, UI engineering, and web applications"
    }
  ]
};

