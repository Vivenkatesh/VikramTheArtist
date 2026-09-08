/**
 * Ask Vikram Knowledge Engine — Schema & Type Definitions
 * Version: 2026.1.0
 */

export type VerificationStatus = "verified" | "unverified" | "disputed" | "in_review";
export type PublicApprovalStatus = "approved" | "draft" | "internal_only" | "rejected";

export type AnswerMode = "documented_experience" | "recorded_viewpoint" | "application";

/**
 * Base metadata for any independently usable knowledge record
 */
export interface KnowledgeRecordBase {
  id: string;
  sourceRef: string;
  verificationStatus: VerificationStatus;
  publicApprovalStatus: PublicApprovalStatus;
  lastReviewedDate: string; // ISO format: YYYY-MM-DD
  applicableTimePeriod: string;
  relatedProjects: string[];
  relatedTopics: string[];
  approvedWording?: string;
  supersededRecordRef?: string;
}

/**
 * Approved Metric Specification
 */
export interface CanonicalMetric {
  id: string;
  name: string;
  metricDefinition: string;
  baseline: string | null;
  finalValue: string;
  measurementPeriod: string;
  population: string;
  attribution: string;
  approvedPublicWording: string;
  publicApprovalStatus: PublicApprovalStatus;
  verificationStatus: VerificationStatus;
  sourceRef: string;
}

/**
 * Collection 1: Canonical Facts (identity, roles, dates, education, responsibilities)
 */
export interface CanonicalFact extends KnowledgeRecordBase {
  category: "identity" | "role" | "date" | "education" | "location" | "status" | "contact" | "skill";
  subject: string;
  exactClaim: string;
  searchKeywords: string[];
  attributes?: Record<string, any>;
}

/**
 * Collection 2: Project Stories (context, problem, constraints, contribution, decisions, outcomes)
 */
export interface ProjectStory extends KnowledgeRecordBase {
  projectKey: string;
  title: string;
  company: string;
  context: string;
  userProblem: string;
  constraints: string[];
  mySpecificContribution: string[];
  collaborators: string[];
  optionsConsidered: string[];
  decision: string;
  tradeOff: string;
  outcome: string;
  reflection: string;
  relatedMetrics?: string[]; // IDs of CanonicalMetric
}

/**
 * Collection 3: Personal Viewpoints (beliefs, reasons, examples, exceptions)
 */
export interface PersonalViewpoint extends KnowledgeRecordBase {
  topic: string;
  belief: string;
  whyIHoldThisBelief: string;
  concreteExamples: string[];
  exceptionsAndNuances: string;
  searchKeywords: string[];
}

/**
 * Collection 4: Personal Interests (art, creativity, philosophy, life outside work)
 */
export interface PersonalInterest extends KnowledgeRecordBase {
  category: "art" | "creativity" | "philosophy" | "spatial_design" | "vibe_coding" | "personal_life";
  topic: string;
  approvedMaterial: string;
  searchKeywords: string[];
}

/**
 * Collection 5: Voice Examples (calibrated Q&A written or approved by Vikram)
 */
export interface VoiceExample extends KnowledgeRecordBase {
  triggerKeywords: string[];
  questionPattern: string;
  approvedAnswer: string;
  voiceCalibrationNotes: string;
  preferredAnswerMode: AnswerMode;
}

/**
 * Collection 6: Evidence Assets (case-study sections, articles, screenshots, diagrams, recordings)
 */
export interface EvidenceAsset extends KnowledgeRecordBase {
  title: string;
  assetType: "case_study_section" | "article" | "screenshot" | "diagram" | "deck" | "recording" | "prototype";
  url?: string;
  internalRoute?: string;
  description: string;
  displayLabel: string;
}

/**
 * Collection 7: Boundaries (excluded subjects, restricted claims, fallback wording, contact destinations)
 */
export interface BoundaryRule extends KnowledgeRecordBase {
  boundaryType: "excluded_subject" | "confidential_data" | "rate_expectation" | "unverified_speculation" | "identity_disclosure";
  triggerKeywords: string[];
  rationale: string;
  approvedFallbackWording: string;
  suggestedDestination?: {
    label: string;
    urlOrEmail: string;
  };
}
