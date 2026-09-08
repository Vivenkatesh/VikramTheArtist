/**
 * Audit & Conflict Report for Vikram Venkatesh Portfolio Knowledge Base
 * 
 * Generated for Owner Review: Documents discrepancies, conflicting claims across files,
 * and data gaps without inventing synthetic content.
 */

export interface KnowledgeConflictItem {
  id: string;
  category: "date_conflict" | "metric_gap" | "attribution_nuance" | "security_containment";
  title: string;
  claimA: {
    source: string;
    statement: string;
  };
  claimB: {
    source: string;
    statement: string;
  };
  severity: "high" | "medium" | "low";
  currentPublicHandling: string;
  ownerActionRequired: string;
}

export interface KnowledgeGapItem {
  id: string;
  category: "missing_baseline" | "untracked_tenure" | "missing_collaborators";
  title: string;
  knownFacts: string;
  missingDetail: string;
  publicHandlingPolicy: string;
  ownerActionRequired: string;
}

export const KNOWLEDGE_CONFLICTS: KnowledgeConflictItem[] = [
  {
    id: "CR-001",
    category: "date_conflict",
    title: "Google Tenure Duration & End Date Discrepancy",
    claimA: {
      source: "src/app/components/ExperienceTimeline.tsx (Line 151)",
      statement: "Lead UX Designer, Google: Oct 2021 – Jan 2024 (~28 months), New York City"
    },
    claimB: {
      source: "src/app/utils/vikramPersonaKnowledge.ts (Line 67)",
      statement: "Lead UX Designer, Google: October 2021 – December 2024 (39 months), New York City"
    },
    severity: "high",
    currentPublicHandling: "Persona answers state: 'spent 39 months as Lead UX Designer driving AI-driven product design strategies and 0-to-1 cloud security roadmaps within Google Cloud'. The timeline card displays Oct 2021 – Jan 2024.",
    ownerActionRequired: "Confirm whether Google tenure formally concluded in January 2024 or extended via consulting/contract through December 2024, so both the timeline UI and AMA engine align on identical dates."
  },
  {
    id: "CR-002",
    category: "security_containment",
    title: "Playbook Client-Side Password Containment",
    claimA: {
      source: "src/app/components/playbook/CaseStudyAdoptV2.tsx (Line 52)",
      statement: "Hardcoded client-side password constant: PLAYBOOK_PASSWORD = 'designtoimproveworld'"
    },
    claimB: {
      source: "src/app/knowledge/collections/boundaries.ts",
      statement: "Quarantined from public retrieval; never included in LLM context or fallback matching"
    },
    severity: "high",
    currentPublicHandling: "Explicitly blacklisted in BoundaryRule 'boundary-confidential-ip' so the AI assistant never leaks or confirms the password.",
    ownerActionRequired: "Move password verification to a secure backend endpoint or edge function if enterprise gatekeeping is required."
  },
  {
    id: "CR-003",
    category: "attribution_nuance",
    title: "Client Brands vs Direct In-House Employment",
    claimA: {
      source: "Skills & Notable Clients list",
      statement: "Lists Apple Inc., Citi, GSK, StateFarm, Siemens, Hilton, Netgear, IBM, Comcast"
    },
    claimB: {
      source: "Experience History",
      statement: "Primary employers: Microsoft, Oracle, Google, McKinsey, Cognizant, TCS, Allscripts, Lionbridge"
    },
    severity: "medium",
    currentPublicHandling: "Calibrated Voice Example 'voice-premise-correction' explicitly explains that Apple and others were consulting clients designed for during agency/consulting tenures, not direct internal employment.",
    ownerActionRequired: "No change needed; policy maintains 100% truthfulness."
  }
];

export const KNOWLEDGE_GAPS: KnowledgeGapItem[] = [
  {
    id: "GAP-001",
    category: "missing_baseline",
    title: "Oracle AI Finance Quantitative Baseline",
    knownFacts: "Streamlined cloud-based analytical workflows and automated multi-tier financial reconciliation.",
    missingDetail: "Exact quantitative percentage reduction in reconciliation time or error rates.",
    publicHandlingPolicy: "Describe procedural impact (automated matching, explainable confidence) without inventing fake percentage lifts.",
    ownerActionRequired: "Provide approved quantitative metrics if available for public disclosure."
  },
  {
    id: "GAP-002",
    category: "missing_baseline",
    title: "Microsoft Copilot Adoption Starting Baseline",
    knownFacts: "Expanded Copilot weekly active users from 936K to 3.4M (3x growth); reached 1.5M+ MAU across 850+ tenants.",
    missingDetail: "Exact starting monthly active user count prior to the Viva Engage adoption campaign launch.",
    publicHandlingPolicy: "Cite the verified 936K WAU baseline and 1.5M+ MAU milestone without hallucinating a speculative starting MAU figure.",
    ownerActionRequired: "Confirm initial baseline MAU if available."
  }
];
