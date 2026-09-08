/**
 * Hybrid Retrieval Engine for Ask Vikram
 * 
 * Combines exact lookup for canonical facts with BM25 / token-relevance semantic
 * retrieval for narrative stories, viewpoints, and evidence assets.
 * Strictly operates on PUBLISHED approved knowledge only.
 */

import {
  PUBLISHED_BOUNDARIES,
  PUBLISHED_VOICE,
  PUBLISHED_FACTS,
  PUBLISHED_METRICS,
  PUBLISHED_STORIES,
  PUBLISHED_VIEWPOINTS,
  PUBLISHED_INTERESTS,
  PUBLISHED_ASSETS
} from "./publishedRegistry";
import { AnswerMode } from "./collections/types";

export interface RetrievalResult {
  mode: AnswerMode;
  directAnswer: string | null;
  matchedBoundary: boolean;
  contextChunks: string[];
  sources: string[];
  confidence: number;
}

/**
 * Tokenize and clean text for relevance matching
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

/**
 * Exact boundary and guardrail lookup
 */
export function checkBoundaries(query: string): string | null {
  const clean = query.toLowerCase().trim();
  for (const b of PUBLISHED_BOUNDARIES) {
    for (const kw of b.triggerKeywords) {
      if (clean.includes(kw.toLowerCase())) {
        return b.approvedFallbackWording;
      }
    }
  }
  return null;
}

/**
 * Exact / High-Confidence Voice Calibration Lookup
 */
export function findExactVoiceMatch(query: string): { answer: string; mode: AnswerMode; source: string } | null {
  const clean = query.toLowerCase().trim();
  let bestMatch: (typeof PUBLISHED_VOICE)[0] | null = null;
  let maxScore = 0;

  for (const item of PUBLISHED_VOICE) {
    let score = 0;
    for (const kw of item.triggerKeywords) {
      const lowerKw = kw.toLowerCase();
      if (clean.includes(lowerKw)) {
        // Boost full phrase matches
        score += lowerKw.length * (lowerKw.split(" ").length > 1 ? 2 : 1);
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = item;
    }
  }

  // Threshold score of 6 ensures strong match confidence
  if (bestMatch && maxScore >= 6) {
    return {
      answer: bestMatch.approvedAnswer,
      mode: bestMatch.preferredAnswerMode,
      source: bestMatch.sourceRef
    };
  }

  return null;
}

/**
 * Semantic BM25 / token relevance retriever for narrative material
 */
export function retrieveRelevantKnowledge(query: string, limit = 4): RetrievalResult {
  // 1. Check strict boundaries first
  const boundaryFallback = checkBoundaries(query);
  if (boundaryFallback) {
    return {
      mode: "documented_experience",
      directAnswer: boundaryFallback,
      matchedBoundary: true,
      contextChunks: [boundaryFallback],
      sources: ["Portfolio Boundary Rules"],
      confidence: 1.0
    };
  }

  // 2. Check exact voice & curated calibrations
  const exactVoice = findExactVoiceMatch(query);
  if (exactVoice) {
    return {
      mode: exactVoice.mode,
      directAnswer: exactVoice.answer,
      matchedBoundary: false,
      contextChunks: [exactVoice.answer],
      sources: [exactVoice.source],
      confidence: 0.95
    };
  }

  // 3. Exact Canonical Fact Lookup
  const clean = query.toLowerCase().trim();
  const queryTokens = tokenize(query);

  let bestFactAnswer: string | null = null;
  let factScore = 0;
  for (const fact of PUBLISHED_FACTS) {
    let score = 0;
    for (const kw of fact.searchKeywords) {
      if (clean.includes(kw.toLowerCase())) {
        score += kw.length * 2;
      }
    }
    if (score > factScore && score >= 8) {
      factScore = score;
      bestFactAnswer = fact.approvedWording || fact.exactClaim;
    }
  }

  // If a direct canonical fact scores high (e.g. location, education, years)
  if (bestFactAnswer && factScore >= 12) {
    return {
      mode: "documented_experience",
      directAnswer: bestFactAnswer,
      matchedBoundary: false,
      contextChunks: [bestFactAnswer],
      sources: ["Canonical Facts Collection"],
      confidence: 0.9
    };
  }

  // 4. Semantic scoring across Project Stories, Viewpoints, Interests, and Assets
  type ScoredChunk = {
    text: string;
    source: string;
    mode: AnswerMode;
    score: number;
  };

  const candidates: ScoredChunk[] = [];

  // Index Project Stories (keeping decision, trade-off, and context unified)
  for (const story of PUBLISHED_STORIES) {
    const combinedStoryText = `${story.title} ${story.company} ${story.context} ${story.userProblem} ${story.decision} ${story.tradeOff} ${story.outcome} ${story.reflection} ${story.relatedTopics.join(" ")}`;
    const storyTokens = tokenize(combinedStoryText);
    
    let score = 0;
    for (const t of queryTokens) {
      if (storyTokens.includes(t)) score += 3;
    }
    // Substring bonus for project key
    if (clean.includes(story.projectKey.replace("-", " "))) score += 10;
    if (clean.includes(story.company.toLowerCase())) score += 5;

    if (score > 0) {
      const chunk = `[Project Story: ${story.title} (${story.company})]
Context: ${story.context}
User Problem: ${story.userProblem}
Contribution: ${story.mySpecificContribution.join("; ")}
Decision & Trade-Off: ${story.decision} (Trade-off: ${story.tradeOff})
Outcome: ${story.outcome}
Reflection: ${story.reflection}`;

      candidates.push({
        text: chunk,
        source: `${story.company}: ${story.title}`,
        mode: "documented_experience",
        score
      });
    }
  }

  // Index Personal Viewpoints
  for (const vp of PUBLISHED_VIEWPOINTS) {
    const combinedVpText = `${vp.topic} ${vp.belief} ${vp.whyIHoldThisBelief} ${vp.concreteExamples.join(" ")} ${vp.searchKeywords.join(" ")}`;
    const vpTokens = tokenize(combinedVpText);
    let score = 0;
    for (const t of queryTokens) {
      if (vpTokens.includes(t)) score += 3;
    }
    for (const kw of vp.searchKeywords) {
      if (clean.includes(kw)) score += 6;
    }

    if (score > 0) {
      const chunk = `[Recorded Viewpoint: ${vp.topic}]
Belief: ${vp.belief}
Reasoning: ${vp.whyIHoldThisBelief}
Examples: ${vp.concreteExamples.join("; ")}
Exceptions: ${vp.exceptionsAndNuances}`;

      candidates.push({
        text: chunk,
        source: `Viewpoint: ${vp.topic}`,
        mode: "recorded_viewpoint",
        score
      });
    }
  }

  // Index Personal Interests
  for (const pi of PUBLISHED_INTERESTS) {
    const combinedPiText = `${pi.topic} ${pi.approvedMaterial} ${pi.searchKeywords.join(" ")}`;
    const piTokens = tokenize(combinedPiText);
    let score = 0;
    for (const t of queryTokens) {
      if (piTokens.includes(t)) score += 3;
    }
    for (const kw of pi.searchKeywords) {
      if (clean.includes(kw)) score += 6;
    }

    if (score > 0) {
      const chunk = `[Personal Interest: ${pi.topic}]
${pi.approvedMaterial}`;

      candidates.push({
        text: chunk,
        source: `Personal Interest: ${pi.topic}`,
        mode: "recorded_viewpoint",
        score
      });
    }
  }

  // Index Canonical Metrics
  for (const m of PUBLISHED_METRICS) {
    const combinedMetricText = `${m.name} ${m.metricDefinition} ${m.approvedPublicWording} ${m.population}`;
    const mTokens = tokenize(combinedMetricText);
    let score = 0;
    for (const t of queryTokens) {
      if (mTokens.includes(t)) score += 2;
    }
    if (score > 0) {
      candidates.push({
        text: `[Approved Metric: ${m.name}] Value: ${m.finalValue}. ${m.approvedPublicWording} (Population: ${m.population})`,
        source: `Metric: ${m.name}`,
        mode: "documented_experience",
        score
      });
    }
  }

  // Sort candidates by score descending
  candidates.sort((a, b) => b.score - a.score);
  const topCandidates = candidates.slice(0, limit);

  // If no candidates matched at all, provide general background fallback
  if (topCandidates.length === 0) {
    return {
      mode: "documented_experience",
      directAnswer: bestFactAnswer || null,
      matchedBoundary: false,
      contextChunks: [
        "Vikram Venkatesh is a Product Design Leader with 18+ years experience across Microsoft (Lead Product Designer for Copilot Adoption in Viva Engage/Teams), Google (Lead UX Designer for Cloud Security & Anthos in NYC), Oracle (AI Finance), and McKinsey (Prague)."
      ],
      sources: ["General Portfolio Knowledge"],
      confidence: 0.5
    };
  }

  const primaryMode: AnswerMode = topCandidates[0].mode || "documented_experience";

  return {
    mode: primaryMode,
    directAnswer: bestFactAnswer || null,
    matchedBoundary: false,
    contextChunks: topCandidates.map((c) => c.text),
    sources: topCandidates.map((c) => c.source),
    confidence: Math.min(1.0, 0.6 + topCandidates[0].score * 0.04)
  };
}
