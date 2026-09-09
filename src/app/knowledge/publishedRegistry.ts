/**
 * Published Knowledge Registry
 * 
 * Strict Gatekeeper: Only records with publicApprovalStatus === 'approved'
 * are published into the public runtime retrieval collection.
 * Any draft, internal-only, or superseded records are strictly quarantined.
 */

import { CANONICAL_FACTS, CANONICAL_METRICS } from "./collections/canonicalFacts";
import { PROJECT_STORIES } from "./collections/projectStories";
import { PERSONAL_VIEWPOINTS } from "./collections/personalViewpoints";
import { PERSONAL_INTERESTS } from "./collections/personalInterests";
import { VOICE_EXAMPLES } from "./collections/voiceExamples";
import { EVIDENCE_ASSETS } from "./collections/evidenceAssets";
import { BOUNDARY_RULES } from "./collections/boundaries";
import { CANONICAL_CONTACT_PROFILE, CANONICAL_OWNER_PROFILE } from "./collections/contactProfile";

export { CANONICAL_CONTACT_PROFILE, CANONICAL_OWNER_PROFILE };

export const PUBLISHED_FACTS = CANONICAL_FACTS.filter(
  (f) => f.publicApprovalStatus === "approved"
);

export const PUBLISHED_METRICS = CANONICAL_METRICS.filter(
  (m) => m.publicApprovalStatus === "approved"
);

export const PUBLISHED_STORIES = PROJECT_STORIES.filter(
  (s) => s.publicApprovalStatus === "approved"
);

export const PUBLISHED_VIEWPOINTS = PERSONAL_VIEWPOINTS.filter(
  (v) => v.publicApprovalStatus === "approved"
);

export const PUBLISHED_INTERESTS = PERSONAL_INTERESTS.filter(
  (i) => i.publicApprovalStatus === "approved"
);

export const PUBLISHED_VOICE = VOICE_EXAMPLES.filter(
  (v) => v.publicApprovalStatus === "approved"
);

export const PUBLISHED_ASSETS = EVIDENCE_ASSETS.filter(
  (a) => a.publicApprovalStatus === "approved"
);

export const PUBLISHED_BOUNDARIES = BOUNDARY_RULES.filter(
  (b) => b.publicApprovalStatus === "approved"
);

export const PUBLISHED_KNOWLEDGE_SUMMARY = {
  totalApprovedFacts: PUBLISHED_FACTS.length,
  totalApprovedMetrics: PUBLISHED_METRICS.length,
  totalApprovedStories: PUBLISHED_STORIES.length,
  totalApprovedViewpoints: PUBLISHED_VIEWPOINTS.length,
  totalApprovedInterests: PUBLISHED_INTERESTS.length,
  totalApprovedVoiceExamples: PUBLISHED_VOICE.length,
  totalApprovedAssets: PUBLISHED_ASSETS.length,
  totalApprovedBoundaries: PUBLISHED_BOUNDARIES.length
};
