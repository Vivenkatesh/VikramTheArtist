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
  PUBLISHED_ASSETS,
  CANONICAL_CONTACT_PROFILE,
  CANONICAL_OWNER_PROFILE
} from "./publishedRegistry";
import { AnswerMode } from "./collections/types";

import { AUDIO_STORY_METADATA } from "./audioStoryData";

export type UtilityIntent = "resume_request" | "linkedin_request" | "phone_request" | "contact_request" | "audio_journey";

export type IntentType =
  | "boundary_fallback"
  | "utility_intent"
  | "owner_fact"
  | "project_question"
  | "recorded_viewpoint"
  | "synthesis"
  | "general_knowledge";

export type RecordType =
  | "canonical_owner_profile"
  | "canonical_fact"
  | "project_story"
  | "personal_viewpoint"
  | "voice_example"
  | "utility"
  | "boundary";

export interface RetrievalResult {
  mode: AnswerMode;
  directAnswer: string | null;
  matchedBoundary: boolean;
  contextChunks: string[];
  sources: string[];
  confidence: number;
  card?: "resume" | "linkedin" | "phone" | "audio";
  utilityIntent?: UtilityIntent;
  detectedIntent?: IntentType;
  selectedRecordType?: RecordType;
}

export interface UtilityMatch {
  intent: UtilityIntent;
  card?: "resume" | "linkedin" | "phone" | "audio";
  directAnswer: string;
  source: string;
}

/**
 * Universal Sanitizer: Converts internal retrieval records into clean, natural conversational prose.
 * Strips bracketed headers and metadata tags so they are NEVER exposed verbatim in the UI.
 */
export function sanitizeRawRecord(text: string): string {
  if (!text) return "";

  let cleaned = text;

  // 1. If it's a Recorded Viewpoint chunk
  if (cleaned.includes("[Recorded Viewpoint:")) {
    const beliefMatch = cleaned.match(/Belief:\s*([^]+?)(?=\nReasoning:|$)/i);
    const reasoningMatch = cleaned.match(/Reasoning:\s*([^]+?)(?=\nExamples:|\nExceptions:|$)/i);
    const belief = beliefMatch ? beliefMatch[1].trim() : "";
    const reasoning = reasoningMatch ? reasoningMatch[1].trim() : "";

    if (belief && reasoning) {
      if (reasoning.startsWith(belief)) {
        return reasoning;
      }
      return `${belief}\n\n${reasoning}`;
    }
    if (belief) return belief;
    if (reasoning) return reasoning;
  }

  // 2. If it's a Project Story chunk
  if (cleaned.includes("[Project Story:")) {
    const contextMatch = cleaned.match(/Context:\s*([^]+?)(?=\nUser Problem:|$)/i);
    const decisionMatch = cleaned.match(/Decision & Trade-Off:\s*([^]+?)(?=\nOutcome:|$)/i);
    const outcomeMatch = cleaned.match(/Outcome:\s*([^]+?)(?=\nReflection:|$)/i);

    const parts = [
      contextMatch?.[1]?.trim(),
      decisionMatch?.[1]?.trim(),
      outcomeMatch?.[1]?.trim()
    ].filter(Boolean);

    if (parts.length > 0) {
      return parts.join("\n\n");
    }
  }

  // 3. Fallback: Strip internal brackets and field prefixes
  cleaned = cleaned
    .replace(/\[(Recorded Viewpoint|Project Story|Personal Interest|Approved Metric):[^\]]+\]\n?/gi, "")
    .replace(/^(Belief|Reasoning|Examples|Exceptions|Context|User Problem|Contribution|Decision & Trade-Off|Outcome|Reflection|Source|Confidence):\s*/gim, "")
    .trim();

  return cleaned;
}

/**
 * Deterministic Utility Intent Detector
 * Resolves explicit resume, LinkedIn, phone/mobile, contact, and audio requests before general knowledge retrieval.
 */
export function detectUtilityIntent(query: string): UtilityMatch | null {
  const clean = query
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .trim();

  // 1. Phone / Mobile Number Requests (Explicit only)
  // Must be an explicit request for phone/mobile number, or asking to call
  const phonePattern = /\b(?:phone|mobile|cell)\s*(?:number|no)\b|\b(?:cell\s*phone|telephone)\b|\bcontact\s+(?:number|no)\b|\b(?:call|phone)\s+(?:vikram|you|him)\b|\bwhat\s+is\s+your\s+phone\b|\bwhat\s+is\s+your\s+mobile\b/i;
  if (phonePattern.test(clean) || clean === "what is your phone number" || clean === "what is your mobile number" || clean === "phone number" || clean === "phone") {
    return {
      intent: "phone_request",
      card: "phone",
      directAnswer: `Mobile: ${CANONICAL_CONTACT_PROFILE.phone}\n\nYou can reach Vikram at the number above.`,
      source: CANONICAL_CONTACT_PROFILE.sourceRef
    };
  }

  // 2. Resume / CV Requests
  const resumePattern = /\b(resume|cv|curriculum\s+vitae)\b/i;
  if (resumePattern.test(clean)) {
    return {
      intent: "resume_request",
      card: "resume",
      directAnswer: `**${CANONICAL_CONTACT_PROFILE.resumeTitle}**\n${CANONICAL_CONTACT_PROFILE.resumeSubtitle}\n\n[View Resume](${CANONICAL_CONTACT_PROFILE.resumeUrl})`,
      source: "Canonical Resume"
    };
  }

  // 3. LinkedIn / Professional Profile Requests
  const linkedinPattern = /\b(linkedin|linked\s*in)\b|\bprofessional\s+profile\b/i;
  if (linkedinPattern.test(clean)) {
    return {
      intent: "linkedin_request",
      card: "linkedin",
      directAnswer: `**${CANONICAL_CONTACT_PROFILE.name}**\n${CANONICAL_CONTACT_PROFILE.headline}\n${CANONICAL_CONTACT_PROFILE.currentRole}\n[${CANONICAL_CONTACT_PROFILE.linkedinHandle}](${CANONICAL_CONTACT_PROFILE.linkedinUrl})\n\n[View LinkedIn Profile](${CANONICAL_CONTACT_PROFILE.linkedinUrl})`,
      source: "Canonical LinkedIn Profile"
    };
  }

  // 4. General Contact / Email Requests
  const contactPattern = /\b(?:how\s+can\s+i\s+contact\s+(?:you|vikram|him)|how\s+to\s+reach\s+(?:you|vikram|him)|contact\s+info(?:rmation)?|email\s+address|your\s+email|contact\s+details)\b/i;
  if (contactPattern.test(clean) || clean === "how can i contact you" || clean === "how to contact you" || clean === "contact") {
    return {
      intent: "contact_request",
      directAnswer: `You can reach me by email at ${CANONICAL_CONTACT_PROFILE.email}, connect with me on LinkedIn at ${CANONICAL_CONTACT_PROFILE.linkedinUrl}, or view my resume.`,
      source: CANONICAL_CONTACT_PROFILE.sourceRef
    };
  }

  // 5. Audio Deep Dive / Journey Requests
  const isDedicatedPill = clean.includes("tell me your story — audio") ||
                          clean.includes("tell me your story - audio") ||
                          clean.includes("🎧 tell me your story");

  const audioWords = /\b(audio|listen|hear|podcast|recording|deep\s*dive)\b/i;
  const playPattern = /\bplay\s+(?:the\s+|your\s+)?(?:career\s+)?(?:story|journey|deep\s*dive|recording|podcast|audio)\b/i;
  const explicitListenPhrases = /\bcan\s+i\s+(?:listen|hear)\b|\b(?:is\s+there\s+a|do\s+you\s+have\s+an?)\s+(?:podcast|audio|recording)\b|\b(?:listen|hear)\s+instead\b/i;

  const hasAudioIntent = isDedicatedPill ||
    playPattern.test(clean) ||
    explicitListenPhrases.test(clean) ||
    (audioWords.test(clean) && (clean.includes("story") || clean.includes("journey") || clean.includes("career") || clean.includes("tell me")));

  if (hasAudioIntent) {
    return {
      intent: "audio_journey",
      card: "audio",
      directAnswer: AUDIO_STORY_METADATA.initialResponse,
      source: AUDIO_STORY_METADATA.attributionNotice
    };
  }

  return null;
}

/**
 * Deterministic Owner Fact Detector
 * Resolves simple factual and profile questions directly from verified CANONICAL_OWNER_PROFILE
 * before entering semantic search or philosophy retrieval.
 */
export function detectOwnerFact(query: string): RetrievalResult | null {
  const clean = query
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[?.,!]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Guard: Synthesis questions ("What kind of designer are you?") must route to synthesis
  if (clean.includes("kind of designer") || clean.includes("what kind")) {
    return null;
  }

  // Guard: Company-specific questions must route to project questions
  if (clean.includes("google") || clean.includes("microsoft") || clean.includes("oracle") || clean.includes("mckinsey")) {
    return null;
  }

  // 1. Current Company / Workplace
  const isCurrentCompany =
    /\bwhere\s+(?:do|are)\s+(?:you|vikram|he)\s+(?:currently\s+)?work(?:ing)?\b/i.test(clean) ||
    /\b(?:what|which)\s+company\s+(?:do|are)\s+(?:you|vikram|he)\s+(?:currently\s+)?work\s+(?:for|at)\b/i.test(clean) ||
    /\bwho\s+do\s+(?:you|vikram|he)\s+work\s+for\b/i.test(clean) ||
    /\bwho\s+is\s+(?:your|his)\s+employer\b/i.test(clean) ||
    /\bcurrent\s+(?:company|employer|workplace)\b/i.test(clean) ||
    clean === "where do you work" ||
    clean === "where are you working" ||
    clean === "where are you currently working" ||
    clean === "what company do you work for" ||
    clean === "who do you work for";

  if (isCurrentCompany) {
    const directAnswer = `I’m currently a Lead Product Designer at Microsoft, based in Hyderabad, India.`;
    return {
      mode: "documented_experience",
      directAnswer,
      matchedBoundary: false,
      contextChunks: [directAnswer],
      sources: ["Canonical Owner Profile"],
      confidence: 1.0,
      detectedIntent: "owner_fact",
      selectedRecordType: "canonical_owner_profile"
    };
  }

  // 2. Current Role / What do you do
  const isCurrentRoleGeneral =
    clean === "what do you do" ||
    clean === "what is your role" ||
    clean === "what is your current role" ||
    clean === "what is your job" ||
    clean === "what is your title" ||
    clean === "what do you do now" ||
    /\bwhat\s+is\s+your\s+(?:current\s+)?role\b/i.test(clean) ||
    /\bwhat\s+do\s+you\s+do\b/i.test(clean);

  if (isCurrentRoleGeneral) {
    const directAnswer = `I’m a Lead Product Designer at Microsoft, working across AI, enterprise product design, and design leadership.`;
    return {
      mode: "documented_experience",
      directAnswer,
      matchedBoundary: false,
      contextChunks: [directAnswer],
      sources: ["Canonical Owner Profile"],
      confidence: 1.0,
      detectedIntent: "owner_fact",
      selectedRecordType: "canonical_owner_profile"
    };
  }

  // 3. Current Location
  const isLocation =
    /\bwhere\s+are\s+you\s+(?:based|located|living)\b/i.test(clean) ||
    /\bwhere\s+do\s+you\s+live\b/i.test(clean) ||
    /\bwhat\s+is\s+your\s+(?:current\s+)?location\b/i.test(clean) ||
    /\bwhich\s+city\s+(?:are\s+you\s+in|do\s+you\s+live\s+in)\b/i.test(clean) ||
    clean === "where are you based" ||
    clean === "where are you located" ||
    clean === "where do you live";

  if (isLocation) {
    const directAnswer = `I’m based in Hyderabad, India.`;
    return {
      mode: "documented_experience",
      directAnswer,
      matchedBoundary: false,
      contextChunks: [directAnswer],
      sources: ["Canonical Owner Profile"],
      confidence: 1.0,
      detectedIntent: "owner_fact",
      selectedRecordType: "canonical_owner_profile"
    };
  }

  // 4. Years of Experience
  const isExperienceYears =
    /\bhow\s+many\s+years\s+(?:of\s+)?experience\b/i.test(clean) ||
    /\bhow\s+much\s+experience\b/i.test(clean) ||
    /\bhow\s+long\s+have\s+you\s+been\s+(?:working|in\s+design|designing)\b/i.test(clean) ||
    /\byears\s+of\s+experience\b/i.test(clean) ||
    clean === "how many years of experience do you have" ||
    clean === "how much experience do you have";

  if (isExperienceYears) {
    const directAnswer = `I have 18+ years of experience in product design and design leadership across India, Europe, and the US.`;
    return {
      mode: "documented_experience",
      directAnswer,
      matchedBoundary: false,
      contextChunks: [directAnswer],
      sources: ["Canonical Owner Profile"],
      confidence: 1.0,
      detectedIntent: "owner_fact",
      selectedRecordType: "canonical_owner_profile"
    };
  }

  // 5. Identity / Who are you
  const isWhoAreYou =
    clean === "who are you" ||
    clean === "who is vikram" ||
    clean === "who is vikram venkatesh" ||
    clean === "tell me about yourself" ||
    clean === "introduce yourself" ||
    clean === "can you introduce yourself" ||
    /^\bwho\s+are\s+you\b/i.test(clean) ||
    /^\bwho\s+is\s+vikram\b/i.test(clean) ||
    /^\btell\s+me\s+about\s+yourself\b/i.test(clean) ||
    /^\bintroduce\s+yourself\b/i.test(clean);

  if (isWhoAreYou) {
    const directAnswer = `I’m Vikram Venkatesh, a hands-on Product Design Leader with 18+ years of experience across technology, enterprise products, and AI.`;
    return {
      mode: "documented_experience",
      directAnswer,
      matchedBoundary: false,
      contextChunks: [directAnswer],
      sources: ["Canonical Owner Profile"],
      confidence: 1.0,
      detectedIntent: "owner_fact",
      selectedRecordType: "canonical_owner_profile"
    };
  }

  // 6. How did you get into design
  const isGetIntoDesign =
    /\bhow\s+did\s+you\s+get\s+into\s+design\b/i.test(clean) ||
    /\bhow\s+did\s+you\s+start\s+(?:in\s+)?design\b/i.test(clean) ||
    /\bhow\s+did\s+you\s+become\s+a\s+designer\b/i.test(clean) ||
    /\bwhy\s+did\s+you\s+choose\s+design\b/i.test(clean);

  if (isGetIntoDesign) {
    const directAnswer = `I started with a Computer Science degree, which gave me a deep appreciation for systems and technology. Early on, I was drawn to visual arts, drawing, and UI design, which naturally led me to merge technical logic with human-centered product design.`;
    return {
      mode: "documented_experience",
      directAnswer,
      matchedBoundary: false,
      contextChunks: [directAnswer],
      sources: ["Canonical Owner Profile"],
      confidence: 1.0,
      detectedIntent: "owner_fact",
      selectedRecordType: "canonical_owner_profile"
    };
  }

  // 7. Background
  const isBackground =
    clean === "what is your background" ||
    clean === "tell me about your background" ||
    clean === "your background" ||
    /\b(?:what\s+is\s+your\s+)?background\b/i.test(clean);

  if (isBackground) {
    const directAnswer = `I have 18+ years of experience in product design, spanning enterprise platforms, AI-first tools, and design leadership at companies like Microsoft, Google, and McKinsey. My background bridges a Computer Science foundation with visual craft, interaction design, and systems thinking.`;
    return {
      mode: "documented_experience",
      directAnswer,
      matchedBoundary: false,
      contextChunks: [directAnswer],
      sources: ["Canonical Owner Profile"],
      confidence: 1.0,
      detectedIntent: "owner_fact",
      selectedRecordType: "canonical_owner_profile"
    };
  }

  // 8. Education / What did you study
  const isEducation =
    /\b(?:what\s+is\s+your\s+)?education(?:al\s+background)?\b/i.test(clean) ||
    /\bwhat\s+did\s+you\s+study\b/i.test(clean) ||
    /\bwhere\s+did\s+you\s+study\b/i.test(clean) ||
    /\bwhat\s+degree\s+do\s+you\s+have\b/i.test(clean);

  if (isEducation) {
    const directAnswer = `I hold a Bachelor's Degree in Computer Science, which gave me strong technical grounding before I focused my career on product and interaction design.`;
    return {
      mode: "documented_experience",
      directAnswer,
      matchedBoundary: false,
      contextChunks: [directAnswer],
      sources: ["Canonical Owner Profile"],
      confidence: 1.0,
      detectedIntent: "owner_fact",
      selectedRecordType: "canonical_owner_profile"
    };
  }

  // 9. Career Chronology / List of Employers
  const isCareerChronology =
    /\bwhere\s+have\s+you\s+worked\b/i.test(clean) ||
    /\bwhat\s+companies\s+have\s+you\s+worked\s+(?:at|for)?\b/i.test(clean) ||
    /\b(?:career|work)\s+history\b/i.test(clean) ||
    /\bcareer\s+timeline\b/i.test(clean) ||
    /\bpast\s+companies\b/i.test(clean) ||
    /\blist\s+of\s+companies\b/i.test(clean);

  if (isCareerChronology) {
    const directAnswer = `Over my 18+ years in product design, I have worked across Microsoft, Oracle, Google, McKinsey & Company, Cognizant, and TCS.`;
    return {
      mode: "documented_experience",
      directAnswer,
      matchedBoundary: false,
      contextChunks: [directAnswer],
      sources: ["Canonical Owner Profile"],
      confidence: 1.0,
      detectedIntent: "owner_fact",
      selectedRecordType: "canonical_owner_profile"
    };
  }

  // 10. Text Career Story ("Tell me your story")
  const isTextStory =
    clean === "tell me your story" ||
    clean === "tell me about your story" ||
    clean === "tell me about your journey" ||
    clean === "what is your story";

  if (isTextStory) {
    const directAnswer = `I’ve been designing software for over 18 years across India, Europe, and the US. Starting from a Computer Science foundation, I moved into visual and interaction design at companies like TCS and Cognizant, consulted on enterprise transformations at McKinsey in Europe, led cloud security UX at Google in New York, and today I lead product design for Copilot adoption and AI experiences at Microsoft.`;
    return {
      mode: "documented_experience",
      directAnswer,
      matchedBoundary: false,
      contextChunks: [directAnswer],
      sources: ["Canonical Owner Profile"],
      confidence: 1.0,
      detectedIntent: "owner_fact",
      selectedRecordType: "canonical_owner_profile"
    };
  }

  return null;
}

/**
 * Deterministic Project Question Detector
 * Resolves specific project and company experience questions (Google, Microsoft, Oracle, McKinsey, ADOPT)
 */
export function detectProjectQuestion(query: string): RetrievalResult | null {
  const clean = query
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[?.,!]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // 1. Google / Anthos / Cloud Security
  if (/\bgoogle\b/i.test(clean) || /\banthos\b/i.test(clean)) {
    const directAnswer = `At Google in New York, I worked as a Lead UX Designer across Google Cloud, including Anthos and Cloud Security. I focused on making technically complex enterprise systems easier to understand and use without oversimplifying them.`;
    return {
      mode: "documented_experience",
      directAnswer,
      matchedBoundary: false,
      contextChunks: [directAnswer],
      sources: ["Google: Google Cloud Security & Anthos UX Modernization"],
      confidence: 0.95,
      detectedIntent: "project_question",
      selectedRecordType: "project_story"
    };
  }

  // 2. Microsoft Projects & Roles
  if (
    /\bmicrosoft\b/i.test(clean) ||
    /\bcopilot\b/i.test(clean) ||
    /\bviva\s+engage\b/i.test(clean) ||
    /\bengage\s+analytics\b/i.test(clean)
  ) {
    const directAnswer = `At Microsoft, I’m a Lead Product Designer focused on AI and enterprise experiences. Most recently, I’ve been leading design initiatives around Copilot adoption across Viva Engage and Teams, along with Engage Analytics.`;
    return {
      mode: "documented_experience",
      directAnswer,
      matchedBoundary: false,
      contextChunks: [directAnswer],
      sources: ["Microsoft: Driving Copilot Adoption in Viva Engage & Teams"],
      confidence: 0.95,
      detectedIntent: "project_question",
      selectedRecordType: "project_story"
    };
  }

  // 3. Oracle
  if (/\boracle\b/i.test(clean)) {
    const directAnswer = `At Oracle, I spent a short tenure as a Sr. Principal Product Designer, working on enterprise AI and financial workflows before moving to Microsoft.`;
    return {
      mode: "documented_experience",
      directAnswer,
      matchedBoundary: false,
      contextChunks: [directAnswer],
      sources: ["Oracle: Enterprise AI"],
      confidence: 0.95,
      detectedIntent: "project_question",
      selectedRecordType: "project_story"
    };
  }

  // 4. McKinsey & Company
  if (/\bmckinsey\b/i.test(clean)) {
    const directAnswer = `At McKinsey & Company in Europe (Prague), I worked as a Design Consultant and Expert, helping enterprise clients shape product strategy, lead design transformations, and work across cross-functional teams.`;
    return {
      mode: "documented_experience",
      directAnswer,
      matchedBoundary: false,
      contextChunks: [directAnswer],
      sources: ["McKinsey & Company: Enterprise Transformation"],
      confidence: 0.95,
      detectedIntent: "project_question",
      selectedRecordType: "project_story"
    };
  }

  // 5. ADOPT Framework / Playbook
  if (/\badopt\b/i.test(clean) || /\badoptiq\b/i.test(clean)) {
    const directAnswer = `The ADOPT framework is a 5-stage behavioral progression model I formulated to help organizations achieve sustainable AI adoption: Awareness, Discovery, Optimization, Proficiency, and Transformation.\n\nIt recognizes that software adoption is fundamentally a human behavioral journey, not merely a software rollout.`;
    return {
      mode: "documented_experience",
      directAnswer,
      matchedBoundary: false,
      contextChunks: [directAnswer],
      sources: ["Framework: ADOPT Behavioral Playbook"],
      confidence: 0.95,
      detectedIntent: "project_question",
      selectedRecordType: "project_story"
    };
  }

  return null;
}

/**
 * Deterministic Viewpoint Question Detector
 * Resolves core leadership philosophy, complexity, critique, and AI trust viewpoints.
 */
export function detectViewpointQuestion(query: string): RetrievalResult | null {
  const clean = query
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[?.,!]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Guard: Synthesis questions ("What kind of designer are you?") should route to synthesis
  if (clean.includes("kind of designer") || clean.includes("what kind")) {
    return null;
  }

  // 1. Hands-on Leadership
  if (
    /\bhands[\s-]on\b/i.test(clean) ||
    (/\bcraft\b/i.test(clean) && /\bstrategy\b/i.test(clean)) ||
    /\bhow\s+hands[\s-]on\b/i.test(clean) ||
    /\bbalance\s+strategy\s+and\s+(?:execution|craft)\b/i.test(clean)
  ) {
    const directAnswer = `I am hands-on even when I am being strategic. Strategy is part of my craft, and craft is how I make strategy concrete. Even when I’m working strategically, I stay close to the design itself and use design as a thinking tool to shape product direction.`;
    return {
      mode: "recorded_viewpoint",
      directAnswer,
      matchedBoundary: false,
      contextChunks: [directAnswer],
      sources: ["Viewpoint: Career Journey, Hands-on Leadership & Design Management"],
      confidence: 0.95,
      detectedIntent: "recorded_viewpoint",
      selectedRecordType: "personal_viewpoint"
    };
  }

  // 2. Complexity in Enterprise Systems
  if (
    /\bcomplex(?:ity)?\b/i.test(clean) ||
    /\boversimplif(?:y|ication)\b/i.test(clean) ||
    /\bsimplify\s+the\s+experience\b/i.test(clean)
  ) {
    const directAnswer = `Complexity itself is not the enemy; unstructured complexity is the problem. My core principle is to simplify the experience, not the truth of the system.\n\nIn technical, layered enterprise systems, superficial simplification becomes misleading if it hides dependencies or system states that operators need to make confident decisions. Experienced users need depth and precision more than visual minimalism. The designer's role is to structure depth through information architecture, progressive disclosure, and clear system hierarchies so users access the right complexity at the right moment.`;
    return {
      mode: "recorded_viewpoint",
      directAnswer,
      matchedBoundary: false,
      contextChunks: [directAnswer],
      sources: ["Viewpoint: Simplify the Experience, Not the Truth of the System"],
      confidence: 0.95,
      detectedIntent: "recorded_viewpoint",
      selectedRecordType: "personal_viewpoint"
    };
  }

  // 3. Design Critiques & Team Cadence
  if (
    /\bcritique(?:s)?\b/i.test(clean) ||
    /\bdesign\s+critique\b/i.test(clean) ||
    (/\bhow\s+do\s+you\b/i.test(clean) && /\b(?:run|give|handle)\s+(?:design\s+)?feedback\b/i.test(clean))
  ) {
    const directAnswer = `My core rule for critique is: bring me your point of view, not just your work. In critique, I want to strengthen the thinking behind the design, not redesign it in my image.\n\nI deliberately separate feedback into three distinct buckets: 1) what is objectively unclear or broken, 2) what is a strategic or product concern, and 3) what is simply personal preference. True alignment means everyone understands the decision, respects the reasoning, and commits to next steps.`;
    return {
      mode: "recorded_viewpoint",
      directAnswer,
      matchedBoundary: false,
      contextChunks: [directAnswer],
      sources: ["Viewpoint: Operating Cadence, Design Critique & Cross-Functional Partnership"],
      confidence: 0.95,
      detectedIntent: "recorded_viewpoint",
      selectedRecordType: "personal_viewpoint"
    };
  }

  // 4. AI Autonomy & Deliberate Friction
  if (
    /\bautonom(?:y|ous|ously)\b/i.test(clean) ||
    /\btrust\s+boundaries\b/i.test(clean) ||
    /\bdeliberate\s+friction\b/i.test(clean) ||
    /\bexplainab(?:le|ility)\b/i.test(clean)
  ) {
    const directAnswer = `Automate the reversible. Assist with the consequential. Make uncertainty visible. When the cost of being wrong is high, optimize for recoverability and accountability, not just efficiency.\n\nAutonomy should scale with confidence, reversibility, and clarity of consequence. Trust is a calibration problem rather than a permission problem: low-risk, reversible tasks should happen seamlessly, while consequential actions warrant deliberate friction, inspectable reasoning, and transparent recovery trails.`;
    return {
      mode: "recorded_viewpoint",
      directAnswer,
      matchedBoundary: false,
      contextChunks: [directAnswer],
      sources: ["Viewpoint: Calibrating AI Autonomy, Trust Boundaries & Deliberate Friction"],
      confidence: 0.95,
      detectedIntent: "recorded_viewpoint",
      selectedRecordType: "personal_viewpoint"
    };
  }

  // 5. Art & Design Influence (Contrast vs Coherence)
  if (
    /\bartist\b/i.test(clean) ||
    /\bcoherence\s+over\s+uniformity\b/i.test(clean) ||
    /\bcontrast\s+creates\s+meaning\b/i.test(clean) ||
    /\bconsistency\s+vs\s+coherence\b/i.test(clean)
  ) {
    const directAnswer = `Design systems create coherence. Contrast creates meaning. I don’t optimize for consistency at all costs; I optimize for a coherent experience with intentional moments of difference.\n\nIn painting and visual art, contrast gives meaning to composition—if everything has the exact same weight, nothing has emphasis. Forcing pivotal moments into standard component treatments preserves the design system at the expense of human experience. Coherence means belonging to the same world without requiring identical uniformity.`;
    return {
      mode: "recorded_viewpoint",
      directAnswer,
      matchedBoundary: false,
      contextChunks: [directAnswer],
      sources: ["Viewpoint: Coherence Over Uniformity & Intentional Contrast"],
      confidence: 0.95,
      detectedIntent: "recorded_viewpoint",
      selectedRecordType: "personal_viewpoint"
    };
  }

  return null;
}

/**
 * Deterministic Synthesis Question Detector
 * Resolves cross-cutting design identity questions.
 */
export function detectSynthesisQuestion(query: string): RetrievalResult | null {
  const clean = query
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[?.,!]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // 1. Design Identity / What kind of designer are you
  if (
    /\bwhat\s+kind\s+of\s+designer\b/i.test(clean) ||
    /\bdescribe\s+(?:your|vikram's)\s+design\s+(?:identity|style|approach)\b/i.test(clean) ||
    /\bwhat\s+is\s+your\s+design\s+philosophy\b/i.test(clean) ||
    /\bwhat\s+connects\s+(?:your|vikram's)\s+work\b/i.test(clean) ||
    /\bthrough[\s-]line\b/i.test(clean) ||
    /\bdesign\s+identity\b/i.test(clean)
  ) {
    const directAnswer = `I’m a hands-on product design leader working across strategy, systems thinking, and detailed craft. Even when I’m working strategically, I stay close to the design itself and use design as a thinking tool to shape product direction.`;
    return {
      mode: "recorded_viewpoint",
      directAnswer,
      matchedBoundary: false,
      contextChunks: [directAnswer],
      sources: ["Synthesis: Design Identity & Leadership Profile"],
      confidence: 0.95,
      detectedIntent: "synthesis",
      selectedRecordType: "personal_viewpoint"
    };
  }

  return null;
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
      const lowerKw = kw.toLowerCase().trim();
      const regex = new RegExp(`(^|\\b|\\s)${lowerKw.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}(\\b|\\s|$)`, "i");
      if (regex.test(clean)) {
        return b.approvedFallbackWording;
      }
    }
  }
  return null;
}

/**
 * Exact / High-Confidence Voice Calibration Lookup
 */
export function findExactVoiceMatch(query: string): { answer: string; mode: AnswerMode; source: string; confidence: number } | null {
  const clean = query
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .trim();
  let bestMatch: (typeof PUBLISHED_VOICE)[0] | null = null;
  let maxScore = 0;
  let bestMatchedKwLen = 0;

  for (const item of PUBLISHED_VOICE) {
    let score = 0;
    let longestKw = 0;
    for (const kw of item.triggerKeywords) {
      const lowerKw = kw
        .toLowerCase()
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"');
      if (clean.includes(lowerKw)) {
        const kwScore = lowerKw.length * (lowerKw.split(" ").length > 1 ? 2 : 1);
        score += kwScore;
        if (lowerKw.length > longestKw) longestKw = lowerKw.length;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = item;
      bestMatchedKwLen = longestKw;
    }
  }

  if (bestMatch && maxScore >= 6) {
    const coverageRatio = Math.min(1.0, bestMatchedKwLen / Math.max(clean.length, 1));
    const dynamicConfidence = Math.round((0.84 + coverageRatio * 0.14) * 100) / 100;

    return {
      answer: bestMatch.approvedAnswer,
      mode: bestMatch.preferredAnswerMode,
      source: bestMatch.sourceRef,
      confidence: dynamicConfidence
    };
  }

  return null;
}

/**
 * Hybrid Retrieval Engine for Ask Vikram
 * 
 * Strict Priority Hierarchy:
 * 1. Boundary Guardrails (boundary_fallback)
 * 2. Utility Intents: Resume, LinkedIn, Phone, Audio (utility_intent)
 * 3. Owner Profile Facts: Company, Role, Location, Experience, Identity, Education, Career Chronology (owner_fact)
 * 4. Project Questions: Google, Microsoft Copilot/Engage, Oracle, McKinsey, ADOPT (project_question)
 * 5. Recorded Viewpoints: Hands-on Leadership, Complexity, Critiques, AI Autonomy, Art/Contrast (recorded_viewpoint)
 * 6. Synthesis: Design Identity, Complex AI Product Strategy (synthesis)
 * 7. Curated Voice Match (recorded_viewpoint)
 * 8. Canonical Fact Search (owner_fact)
 * 9. Semantic BM25 Search across Stories & Viewpoints with clean prose sanitization
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
      confidence: 1.0,
      detectedIntent: "boundary_fallback",
      selectedRecordType: "boundary"
    };
  }

  // 2. Deterministic Utility Intents (Resume, LinkedIn, Phone, Audio Requests)
  const utility = detectUtilityIntent(query);
  if (utility) {
    return {
      mode: "documented_experience",
      directAnswer: utility.directAnswer,
      matchedBoundary: false,
      contextChunks: [utility.directAnswer],
      sources: [utility.source],
      confidence: 1.0,
      card: utility.card,
      utilityIntent: utility.intent,
      detectedIntent: "utility_intent",
      selectedRecordType: "utility"
    };
  }

  // 3. High-Priority Deterministic Owner Fact Layer
  const ownerFact = detectOwnerFact(query);
  if (ownerFact) {
    return ownerFact;
  }

  // 4. Deterministic Project Questions (Google, Microsoft, Oracle, McKinsey, ADOPT)
  const projectQuestion = detectProjectQuestion(query);
  if (projectQuestion) {
    return projectQuestion;
  }

  // 5. Deterministic Recorded Viewpoints (Hands-on leadership, complexity, critiques, etc.)
  const viewpointQuestion = detectViewpointQuestion(query);
  if (viewpointQuestion) {
    return viewpointQuestion;
  }

  // 6. Synthesis Questions (Design identity, complex AI design)
  const synthesisQuestion = detectSynthesisQuestion(query);
  if (synthesisQuestion) {
    return synthesisQuestion;
  }

  // 7. Check exact voice & curated calibrations
  const exactVoice = findExactVoiceMatch(query);
  if (exactVoice) {
    return {
      mode: exactVoice.mode,
      directAnswer: exactVoice.answer,
      matchedBoundary: false,
      contextChunks: [exactVoice.answer],
      sources: [exactVoice.source],
      confidence: exactVoice.confidence,
      detectedIntent: "recorded_viewpoint",
      selectedRecordType: "voice_example"
    };
  }

  // 8. Exact Canonical Fact Lookup from PUBLISHED_FACTS
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

  // If a direct canonical fact scores high
  if (bestFactAnswer && factScore >= 12) {
    return {
      mode: "documented_experience",
      directAnswer: bestFactAnswer,
      matchedBoundary: false,
      contextChunks: [bestFactAnswer],
      sources: ["Canonical Facts Collection"],
      confidence: 0.9,
      detectedIntent: "owner_fact",
      selectedRecordType: "canonical_fact"
    };
  }

  // 9. Semantic scoring across Project Stories, Viewpoints, Interests, and Assets
  type ScoredCandidate = {
    text: string;
    source: string;
    mode: AnswerMode;
    score: number;
    intent: IntentType;
    recordType: RecordType;
  };

  const candidates: ScoredCandidate[] = [];

  // Index Project Stories
  for (const story of PUBLISHED_STORIES) {
    const combinedStoryText = `${story.title} ${story.company} ${story.context} ${story.userProblem} ${story.decision} ${story.tradeOff} ${story.outcome} ${story.reflection} ${story.relatedTopics.join(" ")}`;
    const storyTokens = tokenize(combinedStoryText);
    
    let score = 0;
    for (const t of queryTokens) {
      if (storyTokens.includes(t)) score += 3;
    }
    if (clean.includes(story.projectKey.replace("-", " "))) score += 10;
    if (clean.includes(story.company.toLowerCase())) score += 5;

    if (score > 0) {
      // Natural clean narrative without raw metadata brackets
      const cleanStoryProse = `${story.context}\n\n${story.decision}\n\n${story.outcome}`;
      candidates.push({
        text: cleanStoryProse,
        source: `${story.company}: ${story.title}`,
        mode: "documented_experience",
        score,
        intent: "project_question",
        recordType: "project_story"
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
      // Natural clean prose without raw metadata brackets
      const cleanVpProse = vp.whyIHoldThisBelief.startsWith(vp.belief)
        ? vp.whyIHoldThisBelief
        : `${vp.belief}\n\n${vp.whyIHoldThisBelief}`;
      candidates.push({
        text: cleanVpProse,
        source: `Viewpoint: ${vp.topic}`,
        mode: "recorded_viewpoint",
        score,
        intent: "recorded_viewpoint",
        recordType: "personal_viewpoint"
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
      candidates.push({
        text: pi.approvedMaterial,
        source: `Personal Interest: ${pi.topic}`,
        mode: "recorded_viewpoint",
        score,
        intent: "recorded_viewpoint",
        recordType: "personal_viewpoint"
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
        text: `${m.approvedPublicWording} (Population: ${m.population})`,
        source: `Metric: ${m.name}`,
        mode: "documented_experience",
        score,
        intent: "project_question",
        recordType: "canonical_fact"
      });
    }
  }

  // Sort candidates by score descending
  candidates.sort((a, b) => b.score - a.score);
  const topCandidates = candidates.slice(0, limit);

  // Conservative Phase 1 Fallback: If no candidate reaches strong confidence threshold,
  // do not guess or synthesize loosely related records.
  if (topCandidates.length === 0 || topCandidates[0].score < 12) {
    const conservativeFallback = "I haven’t captured enough verified detail about that yet, and I’d rather not guess. If you’d like to go deeper, feel free to contact me directly.";
    return {
      mode: "documented_experience",
      directAnswer: bestFactAnswer || conservativeFallback,
      matchedBoundary: false,
      contextChunks: [bestFactAnswer || conservativeFallback],
      sources: ["Conservative Verified Knowledge Boundary"],
      confidence: bestFactAnswer ? 0.9 : 0.3,
      detectedIntent: bestFactAnswer ? "owner_fact" : "general_knowledge",
      selectedRecordType: "canonical_owner_profile"
    };
  }

  const primaryCandidate = topCandidates[0];

  return {
    mode: primaryCandidate.mode || "documented_experience",
    directAnswer: bestFactAnswer || sanitizeRawRecord(primaryCandidate.text),
    matchedBoundary: false,
    contextChunks: topCandidates.map((c) => sanitizeRawRecord(c.text)),
    sources: topCandidates.map((c) => c.source),
    confidence: Math.min(1.0, 0.6 + primaryCandidate.score * 0.04),
    detectedIntent: primaryCandidate.intent,
    selectedRecordType: primaryCandidate.recordType
  };
}
