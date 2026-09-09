/**
 * Backward compatibility wrapper for Vikram Persona Knowledge
 * Delegates directly to the modular src/app/knowledge architecture.
 */

export { VIKRAM_DATABASE } from "../knowledge/collections/canonicalFactsLegacy";
export { PERSONA_DIRECTIVES as VIKRAM_SYSTEM_INSTRUCTION } from "../knowledge/persona/personaDirectives";
export { VOICE_EXAMPLES as VIKRAM_CURATED_KNOWLEDGE } from "../knowledge/collections/voiceExamples";
export type { VoiceExample as KnowledgeQAPair } from "../knowledge/collections/types";

import { retrieveRelevantKnowledge, sanitizeRawRecord } from "../knowledge/retrievalEngine";

export function findCuratedAnswer(prompt: string): string | null {
  const result = retrieveRelevantKnowledge(prompt);
  return result.directAnswer || (result.contextChunks.length > 0 ? sanitizeRawRecord(result.contextChunks[0]) : null);
}
