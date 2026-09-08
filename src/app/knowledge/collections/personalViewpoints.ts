import { PersonalViewpoint } from "./types";

export const PERSONAL_VIEWPOINTS: PersonalViewpoint[] = [
  {
    id: "viewpoint-ai-human",
    topic: "AI-First Products That Feel Human",
    belief: "AI products should feel human, transparent, and indispensable—not robotic, opaque, or intimidating.",
    whyIHoldThisBelief: "Most AI interfaces today fail because they present a blank prompt box and expect users to know what to ask, causing prompt paralysis. Human-centered AI must offer ambient context, transparent reasoning, and intuitive affordances that meet people in their natural workflows.",
    concreteExamples: [
      "Replacing raw LLM generation in Copilot with contextual community prompt cues and recognition loops in Viva Engage",
      "Designing explainable AI confidence scores and inspectable reasoning trails in Oracle financial workflows"
    ],
    exceptionsAndNuances: "For deterministic, high-throughput background automation (e.g. batch ETL or log parsing), ambient human metaphor is unnecessary; precision, speed, and clear error telemetry take precedence.",
    searchKeywords: ["ai-first", "human", "philosophy", "design approach", "what is your design philosophy", "approach to ai"],
    sourceRef: "Hero tagline & Portfolio core philosophy",
    verificationStatus: "verified",
    publicApprovalStatus: "approved",
    lastReviewedDate: "2026-09-08",
    applicableTimePeriod: "Permanent",
    relatedProjects: ["Copilot Adoption", "AdoptIQ"],
    relatedTopics: ["ai-philosophy", "interaction-design"]
  },
  {
    id: "viewpoint-adoption-behavioral",
    topic: "Product Adoption is Behavioral, Not Technological",
    belief: "Software adoption fails when organizations treat it as a licensing rollout rather than a human behavioral journey.",
    whyIHoldThisBelief: "I've seen companies spend millions on modern AI platforms only for seats to sit empty. Buying technology is instantaneous; changing how human beings work, overcome fear of failure, and build daily habits takes deliberate, empathetic scaffolding.",
    concreteExamples: [
      "The 5-stage ADOPT framework (Awareness, Discovery, Optimization, Proficiency, Transformation) which moves teams from passive curiosity to habituated workflows"
    ],
    exceptionsAndNuances: "In purely invisible platform upgrades (e.g., swapping a database engine or TLS certificate), behavioral change is irrelevant. But any tool that touches how a human creates or decides requires behavioral design.",
    searchKeywords: ["adoption", "adopt framework", "why adopt", "behavioral design", "change management"],
    sourceRef: "ADOPT Playbook & Case Study",
    verificationStatus: "verified",
    publicApprovalStatus: "approved",
    lastReviewedDate: "2026-09-08",
    applicableTimePeriod: "Permanent",
    relatedProjects: ["Copilot Adoption", "ADOPT Playbook"],
    relatedTopics: ["adoption", "behavioral-psychology"]
  },
  {
    id: "viewpoint-craft-and-strategy",
    topic: "Strategy and Craft Must Never Be Decoupled",
    belief: "Design leaders must balance high-level executive roadmapping with deep hands-on execution and interaction craft.",
    whyIHoldThisBelief: "When design leadership retreats into slide decks and spreadsheets, products lose soul and technical feasibility breaks down. The strongest design leaders can align with the C-suite in the morning and prototype high-fidelity motion and interaction in the afternoon.",
    concreteExamples: [
      "Building full working interactive prototypes to demonstrate complex cloud security workflows to Google engineering leads",
      "Directing roadmap vision while maintaining hands-on Figma and code craft"
    ],
    exceptionsAndNuances: "As organizations scale to hundreds of designers, leaders cannot micromanage every pixel. The leader's craft shifts to defining systems architecture, quality standards, and unblocking team rituals.",
    searchKeywords: ["strategy", "craft", "leadership style", "hands-on", "design leadership philosophy"],
    sourceRef: "Design Philosophy & Portfolio Narrative",
    verificationStatus: "verified",
    publicApprovalStatus: "approved",
    lastReviewedDate: "2026-09-08",
    applicableTimePeriod: "Permanent",
    relatedProjects: [],
    relatedTopics: ["leadership", "craft"]
  },
  {
    id: "viewpoint-trust-prerequisite",
    topic: "Trust is the Prerequisite for Enterprise Automation",
    belief: "Users will actively reject automated intelligence if they cannot inspect the data lineage, understand confidence, and reverse the outcome.",
    whyIHoldThisBelief: "In high-stakes domains like cloud security and enterprise finance, a single error can trigger millions in regulatory fines or downtime. AI cannot be an opaque black box; explainability is not an afterthought, it is the primary interface.",
    concreteExamples: [
      "Providing inspectable audit trails for AI automated ledger reconciliation at Oracle",
      "Providing transparent policy remediation previews in Google Anthos"
    ],
    exceptionsAndNuances: "Low-stakes consumer experiences (like playlist recommendations or spellcheck) tolerate low explainability because the cost of failure is negligible.",
    searchKeywords: ["trust", "explainable ai", "automation", "transparency", "enterprise trust"],
    sourceRef: "Google & Oracle Case Studies",
    verificationStatus: "verified",
    publicApprovalStatus: "approved",
    lastReviewedDate: "2026-09-08",
    applicableTimePeriod: "Permanent",
    relatedProjects: ["Anthos", "AI Finance"],
    relatedTopics: ["trust", "explainable-ai"]
  },
  {
    id: "viewpoint-vibe-coding",
    topic: "Vibe Coding as a Design Amplifier",
    belief: "AI-assisted vibe coding bridges the historic chasm between visual design intent and production software reality.",
    whyIHoldThisBelief: "Designers have spent decades trapped in static mockups that get compromised during engineering handoff. When designers code directly with AI assistants, they can explore micro-interactions, responsive states, and edge cases in the live medium.",
    concreteExamples: [
      "Building and shipping this portfolio and interactive AdoptIQ tools through direct vibe-coding sessions"
    ],
    exceptionsAndNuances: "Vibe coding does not replace rigorous systems engineering or architectural hygiene for distributed multi-tenant backends; it is a rapid prototyping and delivery accelerator for design and frontend craft.",
    searchKeywords: ["vibe coding", "vibe-coding", "ai coding", "prototyping", "design engineering"],
    sourceRef: "VibeCodingPage.tsx & Portfolio narrative",
    verificationStatus: "verified",
    publicApprovalStatus: "approved",
    lastReviewedDate: "2026-09-08",
    applicableTimePeriod: "2024 – Present",
    relatedProjects: ["Vibe Coding Showcase", "AdoptIQ"],
    relatedTopics: ["vibe-coding", "prototyping", "craft"]
  }
];
