import { ProjectStory } from "./types";

export const PROJECT_STORIES: ProjectStory[] = [
  // ── 1. Driving Copilot Adoption & ADOPT Framework ──
  {
    id: "story-copilot-adoption",
    projectKey: "copilot-adoption",
    title: "Driving Copilot Adoption in Viva Engage & Teams",
    company: "Microsoft",
    context: "Enterprises purchased tens of thousands of Microsoft 365 Copilot licenses, but employees were stuck in trial fatigue and inconsistent usage patterns.",
    userProblem: "Employees found generative AI intimidating or generic, lacking social proof, contextual prompts, and safe environments to learn everyday habits.",
    constraints: [
      "Rigid enterprise IT compliance and multi-tenant security boundaries",
      "Fragmented user surfaces across Teams and Viva Engage",
      "Need for measurable habit formation rather than superficial one-off interactions"
    ],
    mySpecificContribution: [
      "Architected the end-to-end Copilot Adoption Community experience inside Viva Engage",
      "Led design integrating Viva Engage Communities directly into Microsoft Teams collaboration flows",
      "Formulated the 5-stage ADOPT behavioral model: Awareness, Discovery, Optimization, Proficiency, and Transformation",
      "Prototyped interactive prompt sharing, community recognition, and leadership sponsorship rituals"
    ],
    collaborators: [
      "Viva Engage Product Managers",
      "Teams Platform Engineering Leads",
      "Enterprise Customer Success Architects",
      "User Researchers"
    ],
    optionsConsidered: [
      "Option A: Static in-app help documentation and guided tooltips (low emotional resonance, poor retention)",
      "Option B: Top-down mandatory training modules (felt like compliance chores, rejected by users)",
      "Option C (Selected): Peer-led community learning with contextual prompt inspiration and leadership recognition"
    ],
    decision: "Anchor adoption in human community dynamics and psychological safety, embedding shared prompt rituals directly into the daily Teams workspace.",
    tradeOff: "Accepted higher initial community moderation overhead in exchange for organic peer-driven engagement and genuine workflow transformation.",
    outcome: "Scaled Copilot adoption to 1.5M+ MAU across 850+ enterprise tenants, achieving 2.5x tenant growth and expanding weekly active users 3x (from 936K to 3.4M WAU).",
    reflection: "Enterprise AI adoption is fundamentally a behavioral challenge, not a feature delivery problem. Real impact happens when software nurtures community habits.",
    relatedMetrics: ["metric-msft-copilot-mau", "metric-msft-copilot-wau-growth", "metric-msft-tenant-growth"],
    sourceRef: "Microsoft Viva Engage Case Study & Internal Playbook",
    verificationStatus: "verified",
    publicApprovalStatus: "approved",
    lastReviewedDate: "2026-09-08",
    applicableTimePeriod: "2025 – Present",
    relatedProjects: ["Copilot Adoption", "AdoptIQ"],
    relatedTopics: ["enterprise-ai", "adoption-frameworks", "behavioral-design"]
  },

  // ── 2. Google Cloud Security & Anthos UX Overhaul ──
  {
    id: "story-google-anthos-security",
    projectKey: "google-anthos-security",
    title: "Google Cloud Security & Anthos UX Modernization",
    company: "Google",
    context: "Google Cloud's hybrid/multi-cloud platform (Anthos) and Cloud Security Command Center offered immense architectural power but were notoriously complex to configure and manage.",
    userProblem: "Security administrators and DevOps engineers struggled with fragmented configuration panes, dense tabular data, and high cognitive load when triaging threats across multi-cloud environments.",
    constraints: [
      "Complex distributed backend architectures with multi-second API latency",
      "Extreme risk aversion: misconfigurations could compromise enterprise infrastructure",
      "Strict Google Material Design system standards and cross-cloud parity requirements"
    ],
    mySpecificContribution: [
      "Led the comprehensive UX overhaul of Anthos management interfaces across 39 months",
      "Consolidated multi-pane security telemetry into cohesive, actionable dashboard cards and automated remediation workflows",
      "Transformed manual CLI-heavy policy enforcement into visual posture management workflows",
      "Mentored and guided cross-functional design squads across NYC and Sunnyvale"
    ],
    collaborators: [
      "Cloud Security Staff Engineers",
      "Anthos Product Directors",
      "Security Research Scientists",
      "Technical Program Managers"
    ],
    optionsConsidered: [
      "Option A: Incremental patching of legacy tables (faster, but failed to address deep user fatigue)",
      "Option B (Selected): 0-to-1 workflow re-architecture organizing UI around administrator intent and automated triage"
    ],
    decision: "Shifted the interaction paradigm from passive reactive monitoring to proactive, guided posture remediation.",
    tradeOff: "Required convincing engineering leadership to refactor backend aggregation endpoints to support unified frontend states.",
    outcome: "Accelerated enterprise product adoption by 30% and elevated CSAT by 25% across 39 months, unlocking faster enterprise cloud migration.",
    reflection: "In mission-critical enterprise tools, simplicity is an act of engineering courage. Designing for security means earning the operator's trust at every step.",
    relatedMetrics: ["metric-google-anthos-adoption", "metric-google-anthos-csat"],
    sourceRef: "Google Cloud UX Portfolio & OKR Reviews",
    verificationStatus: "verified",
    publicApprovalStatus: "approved",
    lastReviewedDate: "2026-09-08",
    applicableTimePeriod: "2021 – 2024",
    relatedProjects: ["Anthos", "Data Security Posture Mgmt"],
    relatedTopics: ["cloud-security", "developer-tools", "enterprise-ux"]
  },

  // ── 3. AI-Powered Financial Operations at Oracle ──
  {
    id: "story-oracle-ai-finance",
    projectKey: "oracle-ai-finance",
    title: "AI-Powered Enterprise Financial Operations & Reconciliation",
    company: "Oracle",
    context: "Global finance teams spend thousands of manual hours reconciling discrepancies across multi-tiered general ledgers, invoices, and banking feeds.",
    userProblem: "Finance analysts relied on fragile spreadsheets and legacy ERP interfaces to spot anomalies, leading to delayed financial close cycles and audit risk.",
    constraints: [
      "Zero tolerance for financial miscalculations or unexplainable AI predictions",
      "Dense regulatory compliance requirements (SOX, IFRS)",
      "Complex data pipelines spanning multiple legacy database architectures"
    ],
    mySpecificContribution: [
      "Directed UX strategy for machine-learning-assisted financial reconciliation",
      "Designed transparent confidence scoring and visual audit trails for automated matching recommendations",
      "Created unified exception-handling flows allowing finance leaders to resolve high-risk mismatches in minutes"
    ],
    collaborators: [
      "Oracle ERP Machine Learning Engineers",
      "Finance Domain Product Managers",
      "Enterprise Architecture Teams"
    ],
    optionsConsidered: [
      "Option A: Fully autonomous black-box reconciliation (rejected due to audit distrust)",
      "Option B (Selected): Human-in-the-loop transparent decision cockpit with explainable AI cues"
    ],
    decision: "Make every AI prediction inspectable and reversible, highlighting data lineage and confidence factors directly in the interaction flow.",
    tradeOff: "Added progressive disclosure UI overhead, but secured complete buy-in from risk-averse enterprise auditors.",
    outcome: "Dramatically streamlined cloud-based financial close workflows and set a new standard for explainable AI in enterprise ERP.",
    reflection: "When designing for enterprise finance, trust is the primary currency. If users don't understand why an AI recommended a match, they will reject it 100% of the time.",
    relatedMetrics: [],
    sourceRef: "Oracle Financial Cloud Design Strategy",
    verificationStatus: "verified",
    publicApprovalStatus: "approved",
    lastReviewedDate: "2026-09-08",
    applicableTimePeriod: "Mar 2025 – May 2025",
    relatedProjects: ["AI Finance Automation"],
    relatedTopics: ["fintech", "explainable-ai", "enterprise-systems"]
  },

  // ── 4. Feedback 360° Case Study ──
  {
    id: "story-feedback-360",
    projectKey: "feedback-360",
    title: "Feedback 360°: From Feedback Anxiety to Growth",
    company: "Enterprise Design Leadership",
    context: "Peer feedback in modern workplaces is frequently burdened by anxiety, defensiveness, and superficial rating forms.",
    userProblem: "Employees fear negative evaluations, while reviewers struggle to give constructive feedback that is specific, compassionate, and actionable.",
    constraints: [
      "Psychological safety was paramount: confidentiality leaks would destroy trust",
      "Short 5-day design sprint to align divergent cross-functional perspectives",
      "Balancing developmental feedback (coaching) with evaluative feedback (performance reviews)"
    ],
    mySpecificContribution: [
      "Led a cross-functional team through a 5-day Design Sprint from ambiguity to prototype validation",
      "Deconstructed the psychological tension between 'developmental' and 'evaluative' feedback mechanisms",
      "Designed perspective cues and structured prompts that guide reviewers to focus on behaviors rather than personal traits",
      "Conducted evaluative usability testing with 15+ stakeholders and practitioners"
    ],
    collaborators: [
      "Product Management",
      "Behavioral Researchers",
      "Engineering Leads",
      "HR Leadership Partners"
    ],
    optionsConsidered: [
      "Option A: Unified numeric 1-to-5 rating scale (familiar, but triggered extreme anxiety and score bargaining)",
      "Option B (Selected): Dual-channel model separating confidential developmental coaching from formal evaluative milestones"
    ],
    decision: "Split the experience into two validated directions: a safe, ongoing 'developmental' reflection channel and a clear 'evaluative' summary.",
    tradeOff: "Required building two interaction models, but eliminated the fear that casual feedback would negatively impact compensation.",
    outcome: "Delivered 2 fully validated directions with 88% user confidence in psychological safety and clear actionability during testing.",
    reflection: "Great interaction design solves emotional problems before solving technical ones. Reducing fear is often the highest-leverage UX intervention.",
    relatedMetrics: [],
    sourceRef: "Feedback 360° Case Study (Behance & Portfolio)",
    verificationStatus: "verified",
    publicApprovalStatus: "approved",
    lastReviewedDate: "2026-09-08",
    applicableTimePeriod: "6 Months Engagement",
    relatedProjects: ["Feedback 360°"],
    relatedTopics: ["design-sprint", "psychological-safety", "user-research"]
  },

  // ── 5. Viva Engage Communities 2.0 ──
  {
    id: "story-viva-communities-2",
    projectKey: "viva-communities-2",
    title: "Viva Engage Communities 2.0: Local Empowerment",
    company: "Microsoft",
    context: "Enterprise communities often devolve into broadcast announcement channels where everyday members feel disconnected from localized team goals.",
    userProblem: "Community leaders lacked lightweight tools to organize local initiatives, recognize grassroots champions, and drive participatory rituals.",
    constraints: [
      "Tight hackathon sprint timeline with rapid production feasibility requirements",
      "Integration within the existing Viva Engage and Microsoft Graph data model"
    ],
    mySpecificContribution: [
      "Spearheaded the UX strategy for Communities 2.0, focusing on local goal ownership and social connection",
      "Crafted interactive community badges, champion spotlights, and micro-initiative pledge cards",
      "Presented the working deck and prototypes to executive engineering leadership"
    ],
    collaborators: [
      "Viva Engage Hackathon Team",
      "Graph API Engineers",
      "Community Experience Researchers"
    ],
    optionsConsidered: [
      "Option A: More granular admin controls (too administrative)",
      "Option B (Selected): Grassroots community agency with public pledge goals and celebratory feedback loops"
    ],
    decision: "Empower individual members to propose and rally around micro-goals within existing tenant community structures.",
    tradeOff: "Accepted looser centralized curation to promote genuine grassroots vibrancy.",
    outcome: "Selected as a flagship forward-looking vision deck for future Viva Engage community roadmap planning.",
    reflection: "When enterprise software treats employees like collaborative communities rather than corporate resources, engagement transforms automatically.",
    relatedMetrics: [],
    sourceRef: "Communities 2.0 Hack Deck (Figma)",
    verificationStatus: "verified",
    publicApprovalStatus: "approved",
    lastReviewedDate: "2026-09-08",
    applicableTimePeriod: "2025",
    relatedProjects: ["Viva Engage Communities"],
    relatedTopics: ["community-ux", "social-collaboration"]
  },

  // ── 6. Engage Analytics ──
  {
    id: "story-engage-analytics",
    projectKey: "engage-analytics",
    title: "Engage Analytics: Translating Signals into Leadership Insights",
    company: "Microsoft",
    context: "Enterprise communicators and corporate executives broadcasted company-wide campaigns in Viva Engage without clear visibility into emotional resonance or true employee reach.",
    userProblem: "Raw impression counts failed to show whether employees actually read, understood, or felt energized by corporate communications.",
    constraints: [
      "Strict privacy protections ensuring individual employee sentiment cannot be unmasked by managers",
      "Aggregating millions of telemetry events in real time across massive enterprise tenants"
    ],
    mySpecificContribution: [
      "Designed Aggregate Analytics to measure campaign performance through audience, engagement, and sentiment insights",
      "Constructed intuitive sentiment distribution dials ('Deep Work', 'Green' sentiment) and engagement trends",
      "Created clean executive storytelling dashboards that simplify complex data into actionable decisions"
    ],
    collaborators: [
      "Viva Engage Data Science Engineers",
      "Corporate Communications Customer Advisory Board"
    ],
    optionsConsidered: [
      "Option A: Dense tabular export tools (left communicators doing manual spreadsheet analysis)",
      "Option B (Selected): Executive visual dashboards combining reach, interaction velocity, and qualitative sentiment"
    ],
    decision: "Build visual data storytelling components that answer 'What should I do next?' rather than just 'What happened?'",
    tradeOff: "Enforced strict minimum cohort sizes (privacy threshold) to protect employee anonymity, slightly limiting micro-team reporting.",
    outcome: "Enabled enterprise communicators across hundreds of tenants to plan, measure, and optimize leadership campaigns with data confidence.",
    reflection: "Analytics UX should never just be a mirror of the database. Great analytics UX is a decision-support engine.",
    relatedMetrics: [],
    sourceRef: "WorkSection.tsx & Engage Analytics Roadmap",
    verificationStatus: "verified",
    publicApprovalStatus: "approved",
    lastReviewedDate: "2026-09-08",
    applicableTimePeriod: "2025 – Present",
    relatedProjects: ["Engage Analytics"],
    relatedTopics: ["data-storytelling", "analytics-ux", "enterprise-insights"]
  },

  // ── 7. Notification Experience Design (Notification XD) ──
  {
    id: "story-notification-xd",
    projectKey: "notification-xd",
    title: "Notification Experience Design Playbook",
    company: "Strategic Enterprise Frameworks",
    context: "Enterprise SaaS products bombard users with disconnected, low-priority alerts that result in notification fatigue and ignored critical errors.",
    userProblem: "Users routinely closed alert banners without reading them because notifications lacked context, urgency tiering, and actionable next steps.",
    constraints: [
      "Disparate product modules with inconsistent alerting conventions",
      "Engineering resistance to adopting a centralized notification schema"
    ],
    mySpecificContribution: [
      "Created the comprehensive Notification Experience Design Playbook",
      "Defined a 4-tier urgency taxonomy (Critical, Action Required, Informational, Delight) with explicit component specifications",
      "Coupled every alert state with a concrete, contextual recommendation and one-click remediation"
    ],
    collaborators: [
      "UX Designers across product verticals",
      "Platform Frontend Architects"
    ],
    optionsConsidered: [
      "Option A: Centralized notification bell drawer with chronological logs (passive, easily ignored)",
      "Option B (Selected): In-situ contextual alerts with direct inline resolution actions"
    ],
    decision: "Never notify a user about a problem without providing an immediate pathway to resolve it.",
    tradeOff: "Required frontend teams to wire action callbacks into alert components rather than simply throwing strings.",
    outcome: "Standardized notification patterns across enterprise products, reducing alert dismissal rates and speeding resolution times.",
    reflection: "A notification is not an announcement—it is a conversation with the user in their moment of need.",
    relatedMetrics: [],
    sourceRef: "Notification XD Playbook (Google Slides)",
    verificationStatus: "verified",
    publicApprovalStatus: "approved",
    lastReviewedDate: "2026-09-08",
    applicableTimePeriod: "Framework Reference",
    relatedProjects: ["Notification Experience Design"],
    relatedTopics: ["design-systems", "interaction-patterns"]
  }
];
