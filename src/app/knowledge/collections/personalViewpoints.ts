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
  },
  {
    id: "viewpoint-blank-canvas-action",
    topic: "The Blank-Canvas Moment & Behavioral Progression in AI",
    belief: "Don't design only for whether people understand the capability. Design for whether they can confidently take the next action.",
    whyIHoldThisBelief: "When someone arrives at an open prompt field, they still have to interpret capability, connect it to a task, formulate the request, and judge if effort is worthwhile. That is a surprisingly large cognitive step. Awareness, intent, first use, proficiency, and habit formation are different design problems; adding more education or prompt catalogs doesn't solve it if people cannot take the next meaningful action.",
    concreteExamples: [
      "Exploring contextual starting points, task-relevant scenarios, prompt starters, and lower-interpretation guidance in Copilot adoption experiences"
    ],
    exceptionsAndNuances: "Experienced power users with established prompt libraries and habitual workflows who prefer a blank canvas for unconstrained zero-shot interactions.",
    searchKeywords: ["ai adoption", "how does vikram think about ai adoption", "blank-canvas moment", "blank canvas", "what does vikram mean by the blank-canvas moment", "prompt friction", "behavioral progression"],
    sourceRef: "Owner Knowledge Interview",
    verificationStatus: "verified",
    publicApprovalStatus: "approved",
    lastReviewedDate: "2026-09-09",
    applicableTimePeriod: "Permanent",
    relatedProjects: ["Copilot Adoption", "AdoptIQ"],
    relatedTopics: ["behavioral-design", "ai-adoption", "prompt-interaction"]
  },
  {
    id: "viewpoint-essential-complexity",
    topic: "Simplify the Experience, Not the Truth of the System",
    belief: "Complexity itself is not the enemy. Unstructured complexity is the problem. Simplify the experience, not the truth of the system.",
    whyIHoldThisBelief: "In technical, layered, and interconnected enterprise systems, simplification becomes misleading if it hides relationships or system state that operators need to make confident decisions. Experienced users need depth and precision more than visual minimalism. The designer's role is to structure depth through information architecture, progressive disclosure, system hierarchy, and dependency relationships so users access the right complexity at the right moment.",
    concreteExamples: [
      "Structuring technical depth in Anthos and Cloud Security without collapsing interconnected multi-cloud dependencies into flat dashboards"
    ],
    exceptionsAndNuances: "Consumer utility apps with single-intent tasks where radical interface reduction absorbs nearly all backend variables without consequence.",
    searchKeywords: ["complexity in enterprise products", "how does vikram approach complexity", "essential complexity", "oversimplification", "simplify the experience", "truth of the system"],
    sourceRef: "Owner Knowledge Interview",
    verificationStatus: "verified",
    publicApprovalStatus: "approved",
    lastReviewedDate: "2026-09-09",
    applicableTimePeriod: "Permanent",
    relatedProjects: ["Anthos", "Google Cloud Security"],
    relatedTopics: ["systems-design", "enterprise-ux", "information-architecture"]
  },
  {
    id: "viewpoint-craft-interrogate-strategy",
    topic: "Using Craft to Interrogate Strategy Across Levels of Resolution",
    belief: "I use craft not only to execute strategy, but to interrogate it. My role as a design leader is to move between levels of resolution.",
    whyIHoldThisBelief: "When strategic intent is agreed upon in the abstract, divergent interpretations appear at the interaction layer because trade-offs haven't become tangible. Moving closer to craft—information hierarchy, key interaction states, flows, or prototypes—reveals what a strategy document cannot, replacing vague debates like 'simple' or 'intelligent' with precise operational questions about user control, automation boundaries, and breakdown states.",
    concreteExamples: [
      "Selective hands-on prototyping when product strategy fails to converge, uncovering unfeasible roadmap assumptions and feeding learnings back into strategic direction"
    ],
    exceptionsAndNuances: "When product direction and interaction models are already proven and converging smoothly; leaders should then delegate fully to preserve team autonomy and focus on organizational scaling.",
    searchKeywords: ["how hands-on is vikram", "hands-on as a design leader", "craft and strategy", "interrogate strategy", "levels of resolution", "hands-on"],
    sourceRef: "Owner Knowledge Interview",
    verificationStatus: "verified",
    publicApprovalStatus: "approved",
    lastReviewedDate: "2026-09-09",
    applicableTimePeriod: "Permanent",
    relatedProjects: [],
    relatedTopics: ["leadership", "craft", "design-strategy"]
  },
  {
    id: "viewpoint-ai-autonomy-calibration",
    topic: "Calibrating AI Autonomy, Trust Boundaries & Deliberate Friction",
    belief: "Automate the reversible. Assist with the consequential. Make uncertainty visible. When the cost of being wrong is high, optimize for recoverability and accountability, not just efficiency.",
    whyIHoldThisBelief: "Autonomy should scale with confidence, reversibility, and clarity of consequence. Trust is a calibration problem rather than a permission problem. Adding confirmation dialogs everywhere creates an illusion of safety while causing fatigue and mechanical clicking. Consequential moments warrant deliberate friction for reflection, transparent reasoning, and easy error recovery.",
    concreteExamples: [
      "Proactively automating low-risk reversible tasks; having AI prepare, summarize, or pre-fill for consequential actions while keeping humans in control"
    ],
    exceptionsAndNuances: "Deterministic, rule-based operations with 100% formal verification and zero probabilistic variance can be fully automated regardless of scale.",
    searchKeywords: ["how does vikram decide when ai should act autonomously", "ai autonomy", "autonomously", "human in the loop", "trust boundaries", "deliberate friction", "reversibility"],
    sourceRef: "Owner Knowledge Interview",
    verificationStatus: "verified",
    publicApprovalStatus: "approved",
    lastReviewedDate: "2026-09-09",
    applicableTimePeriod: "Permanent",
    relatedProjects: ["AI Finance", "Cloud Security"],
    relatedTopics: ["ai-interaction", "trust", "automation-ethics"]
  },
  {
    id: "viewpoint-coherence-over-uniformity",
    topic: "Coherence Over Uniformity & Intentional Contrast",
    belief: "Design systems create coherence. Contrast creates meaning. I don’t optimize for consistency at all costs; I optimize for a coherent experience with intentional moments of difference.",
    whyIHoldThisBelief: "In art, contrast gives meaning to composition; if everything has the same weight, nothing has emphasis. Forcing pivotal moments—important decisions, transitions, achievements, warnings, or reveals—into standard component treatments preserves the design system at the expense of human experience. Coherence means belonging to the same world without requiring identical uniformity.",
    concreteExamples: [
      "Breaking component rhythms for pivotal milestones, critical decisions, or high-friction security warnings"
    ],
    exceptionsAndNuances: "Repetitive, high-volume transactional data entry (e.g. ERP tables or call-center forms) where strict visual monotony reduces visual distraction and accelerates muscle memory.",
    searchKeywords: ["how does being an artist influence vikram", "consistency vs coherence", "coherence over uniformity", "contrast creates meaning", "design dogma", "artistic influence"],
    sourceRef: "Owner Knowledge Interview",
    verificationStatus: "verified",
    publicApprovalStatus: "approved",
    lastReviewedDate: "2026-09-09",
    applicableTimePeriod: "Permanent",
    relatedProjects: [],
    relatedTopics: ["artistic-critique", "design-systems", "visual-rhythm"]
  },
  {
    id: "viewpoint-collaboration-and-critique",
    topic: "Operating Cadence, Design Critique & Cross-Functional Partnership",
    belief: "Bring me your point of view, not just your work. In critique, I want to strengthen the thinking behind the design, not redesign it in my image.",
    whyIHoldThisBelief: "A design leader can easily turn personal taste into organizational authority. In critique, I strictly separate 1) what is objectively unclear, 2) what is a strategic or product concern, and 3) what is simply my personal preference. True alignment means everyone understands the decision, respects the reasoning, and commits to next steps, not having identical opinions.",
    concreteExamples: [
      "Early engineering integration around technical constraints; separating user problems from business intent with PMs; empowering designers who demonstrate sound rationale and system coherence"
    ],
    exceptionsAndNuances: "Urgent production incidents or zero-day security vulnerabilities where immediate executive direction is required before consensus or extensive critique.",
    searchKeywords: ["what is vikram like to work with", "how does vikram run design critiques", "working with vikram", "design critiques", "feedback", "critique", "collaboration", "non-negotiables"],
    sourceRef: "Owner Knowledge Interview",
    verificationStatus: "verified",
    publicApprovalStatus: "approved",
    lastReviewedDate: "2026-09-09",
    applicableTimePeriod: "Permanent",
    relatedProjects: [],
    relatedTopics: ["leadership-cadence", "design-critique", "team-culture"]
  }
];
