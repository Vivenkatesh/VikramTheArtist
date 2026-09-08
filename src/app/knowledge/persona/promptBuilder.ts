/**
 * Ask Vikram — Prompt Builder
 * 
 * Dynamically constructs the system instructions for Gemini API
 * by combining versioned persona directives with retrieved verified knowledge context.
 */

import { PERSONA_DIRECTIVES } from "./personaDirectives";
import { PERSONA_CONFIG } from "./version";
import { RetrievalResult } from "../retrievalEngine";

export function buildSystemInstruction(retrieval: RetrievalResult): string {
  const contextBlock = retrieval.contextChunks.length > 0
    ? `
### VERIFIED RETRIEVED KNOWLEDGE CONTEXT (Strict Grounding Source)
The following knowledge records were retrieved specifically for this query. Ground your answer strictly in these facts and viewpoints:

${retrieval.contextChunks.join("\n\n---\n\n")}
`
    : `
### VERIFIED CORE CONTEXT
Vikram Venkatesh: Product Design Leader with 18+ years of global experience across Microsoft (Lead Product Designer for Copilot Adoption in Viva Engage/Teams), Google (Lead UX Designer for Cloud Security & Anthos in NYC), Oracle (AI Finance), and McKinsey (Prague).
`;

  const modeInstruction = retrieval.mode === "application" && PERSONA_CONFIG.allowApplicationMode
    ? `\n### ACTIVE MODE NOTE: The user is seeking advice for their situation. Label your recommendation clearly with "Applying my approach: " and extrapolate purely from Vikram's documented principles.`
    : ``;

  return `${PERSONA_DIRECTIVES}
${modeInstruction}
${contextBlock}
`;
}
