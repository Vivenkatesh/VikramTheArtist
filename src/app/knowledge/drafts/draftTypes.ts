/**
 * Owner Interview Workflow — Draft Schemas
 * Version: 2026.1.0
 */

import { PublicApprovalStatus, VerificationStatus, AnswerMode } from "../collections/types";

export interface ExtractedClaim {
  claim: string;
  category: "role" | "metric" | "timeline" | "technical" | "collaborative";
  status: VerificationStatus;
}

export interface OwnerInterviewDraft {
  id: string;
  createdAt: string;
  updatedAt: string;
  targetProjectOrTopic: string;
  questionAsked: string;
  originalAnswer: string;
  firstPersonVersion: string;
  extractedFactualClaims: ExtractedClaim[];
  decisionAndTradeOff: {
    decision: string;
    tradeOff: string;
    alternativesRejected?: string[];
  };
  reflectionOrViewpoint: string;
  visitorQuestionsAnswered: string[];
  missingEvidenceAndSensitivities: {
    missingEvidence: string[];
    sensitiveDetailsForReview: string[];
  };
  status: "draft" | "approved" | "discarded" | "withdrawn";
  publishedTargetCollection?: "project_stories" | "canonical_facts" | "personal_viewpoints" | "voice_examples";
  publishedRecordId?: string;
  ownerNotes?: string;
}

export interface KnowledgeCoverageGap {
  id: string;
  topic: string;
  priority: "high" | "medium" | "low";
  unansweredVisitorQuestions: string[];
  suggestedAngle: string;
}
