/**
 * Audio Story Metadata, Chapters, and Approved Transcript
 * 
 * Deep-dive audio source and editorial transcript for Ask Vikram AMA.
 * Source file: public/about-vikram.mp3 -> Canonical URL: /about-vikram.mp3
 */

export interface AudioChapter {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  startTime?: number; // Seek timestamp in seconds if calibrated
}

export const AUDIO_STORY_METADATA = {
  src: "/about-vikram.mp3",
  supertitle: "THE DEEP DIVE",
  title: "My journey through design, technology & AI",
  subtitle: "A podcast-style deep dive into 18+ years across visual design, UX, enterprise systems, design leadership and AI.",
  durationLabel: "~18 min",
  estimatedSeconds: 1038,
  accessibleLabel: "Listen to Vikram's design journey",
  attributionNotice: "A narrated podcast-style deep dive into Vikram's career and design journey.",
  initialResponse: "Absolutely. Here’s a podcast-style deep dive into my journey—from my early years in design to enterprise systems, AI, and how my approach to design evolved along the way."
};

export const AUDIO_CHAPTERS: AudioChapter[] = [
  {
    id: "chapter-01",
    number: "01",
    title: "Where it started",
    subtitle: "Computer Science → visual design",
    description: "Early technical grounding in Computer Science, discovering graphic composition, visual hierarchy, and the emotional resonance of design."
  },
  {
    id: "chapter-02",
    number: "02",
    title: "Becoming a UX designer",
    subtitle: "Human factors, interaction and usability",
    description: "Transitioning from static visuals to human factors, cognitive ergonomics, usability testing, and interaction architectures."
  },
  {
    id: "chapter-03",
    number: "03",
    title: "Designing complex systems",
    subtitle: "Enterprise products, cloud and security",
    description: "Tackling scale and ambiguity across TCS, Cognizant, McKinsey consulting in Europe, and Google in New York with Cloud Security and Anthos."
  },
  {
    id: "chapter-04",
    number: "04",
    title: "Moving toward AI",
    subtitle: "Human behavior, adoption and trust",
    description: "Leading enterprise AI adoption and Copilot UX at Microsoft. Why capability alone is insufficient without clarity, context, and control."
  },
  {
    id: "chapter-05",
    number: "05",
    title: "Becoming a hands-on design leader",
    subtitle: "Strategy, systems thinking and craft",
    description: "Operating across organizational strategy and pixel-level craft. Using prototypes and artifacts to interrogate strategic assumptions."
  },
  {
    id: "chapter-06",
    number: "06",
    title: "Why Ask Vikram exists",
    subtitle: "Turning a portfolio into an AI conversation",
    description: "Reimagining the static portfolio as a live conversational demonstration of human-centered AI interaction."
  }
];

export const AUDIO_FOLLOW_UP_PROMPTS = [
  "What shaped your design philosophy?",
  "Why did you move toward AI?",
  "How did art influence your career?"
];

export const CLEANED_TRANSCRIPT_PARAGRAPHS: { speaker: string; text: string }[] = [
  {
    speaker: "Narrator",
    text: "Welcome to this deep dive into the career, design philosophy, and creative trajectory of Vikram. Over more than 18 years across India, Europe, and the United States, Vikram has worked at the frontier of digital experience—shaping enterprise software, leading multidisciplinary design teams, and reimagining how people interact with complex technology and artificial intelligence."
  },
  {
    speaker: "Narrator",
    text: "To understand how Vikram designs today, you have to look at how his career began. He didn't start in a traditional design academy; he started with a technical foundation in Computer Science. That early training gave him an intuitive understanding of systems architecture, logic, constraints, and data flows. But he was consistently pulled toward the human side of technology—how an interface communicates, where the eye travels, and how visual hierarchy guides human understanding."
  },
  {
    speaker: "Narrator",
    text: "His early career began in graphic, visual, and interaction design. That phase sharpened his sensitivity to composition, typography, rhythm, contrast, and balance—principles deeply informed by his personal background in fine art. In Vikram's view, art trains you to pay attention to what is difficult to quantify but immediately felt: tension, silence, visual weight, and emotional residue."
  },
  {
    speaker: "Narrator",
    text: "As digital products matured, Vikram's focus expanded into human factors, usability, and UX architecture. He began working on increasingly complex problem spaces across global organizations—from TCS and Cognizant to strategic consulting at McKinsey in Europe. Working with leadership teams across industries taught him how business strategy, technical feasibility, and user needs intersect."
  },
  {
    speaker: "Narrator",
    text: "That trajectory led him to Google in New York as a Lead Product Designer, where he tackled high-stakes cloud security and multi-cloud infrastructure within Google Cloud Anthos. In multi-cloud and security environments, complexity cannot simply be hidden; doing so leaves administrators blind to critical risk. Vikram focused on structured disclosure—organizing vast system states so operators can assess health quickly, identify threats with confidence, and take decisive, reversible action."
  },
  {
    speaker: "Narrator",
    text: "Today, as a Lead Product Designer at Microsoft, Vikram's focus is centered on enterprise AI, Copilot adoption, and behavioral analytics in Viva Engage. In AI design, the challenge isn't merely generating answers or creating chat boxes; it is designing for trust, context, and human confidence. When people interact with AI, they experience uncertainty around accuracy, prompt phrasing, and consequences. Vikram's work structures the interaction so the system guides users toward the next meaningful action while keeping them firmly in control."
  },
  {
    speaker: "Narrator",
    text: "Throughout this journey, Vikram has maintained a distinctive leadership philosophy: he is a hands-on product design leader who operates simultaneously across strategy, systems thinking, and interaction craft. He doesn't view strategy and execution as separate stages. Instead, he uses tangible design artifacts—prototypes, flows, and interaction models—to interrogate strategy and verify whether the thinking holds up in practice."
  },
  {
    speaker: "Narrator",
    text: "Even this portfolio itself reflects that mindset. Rather than presenting a conventional catalog of static case studies, Vikram built Ask Vikram—an interactive, conversational AI portfolio that allows visitors to query his experience, inspect his design principles, and experience firsthand the kind of human-centered AI interface he designs."
  }
];
