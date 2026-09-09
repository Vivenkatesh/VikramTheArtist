/**
 * Gemini API Client for Vikram's Conversational Concierge
 * Version: 2026.1.0 (Connected to Versioned Persona & Hybrid Retrieval Engine)
 */

import { retrieveRelevantKnowledge, sanitizeRawRecord, IntentType, RecordType } from "../knowledge/retrievalEngine";
import { buildSystemInstruction } from "../knowledge/persona/promptBuilder";
import { ChatMessage } from "../knowledge/visitorConversationState";

export type { ChatMessage };

export function getStoredApiKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("gemini_user_api_key") || (import.meta.env.VITE_GEMINI_API_KEY as string) || null;
}

export function setStoredApiKey(key: string): void {
  if (typeof window === "undefined") return;
  if (key.trim()) {
    localStorage.setItem("gemini_user_api_key", key.trim());
  } else {
    localStorage.removeItem("gemini_user_api_key");
  }
}

export interface AskGeminiResponse {
  text: string;
  source: "gemini" | "knowledge-base";
  mode?: string;
  card?: "resume" | "linkedin" | "phone" | "audio";
  detectedIntent?: IntentType;
  selectedRecordType?: RecordType;
}

/**
 * Ask Gemini a question about Vikram, with grounded hybrid retrieval and fallback
 */
export async function askGemini(
  prompt: string,
  history: ChatMessage[] = []
): Promise<AskGeminiResponse> {
  // Step 1: Hybrid Retrieval Engine processes the query against published knowledge
  const retrieval = retrieveRelevantKnowledge(prompt);

  // If a strict boundary was triggered, immediately return the approved boundary wording
  if (retrieval.matchedBoundary && retrieval.directAnswer) {
    return {
      text: sanitizeRawRecord(retrieval.directAnswer),
      source: "knowledge-base",
      mode: retrieval.mode,
      detectedIntent: retrieval.detectedIntent,
      selectedRecordType: retrieval.selectedRecordType
    };
  }

  // If a deterministic utility intent was triggered (Resume, LinkedIn, Phone, Audio), immediately return canonical CTA/card
  if (retrieval.utilityIntent && retrieval.directAnswer) {
    return {
      text: retrieval.directAnswer,
      source: "knowledge-base",
      mode: retrieval.mode,
      card: retrieval.card,
      detectedIntent: retrieval.detectedIntent,
      selectedRecordType: retrieval.selectedRecordType
    };
  }

  // If a deterministic owner fact was triggered (Current company, role, location, years, identity, education),
  // return the calibrated factual answer immediately without entering philosophy retrieval
  if (retrieval.detectedIntent === "owner_fact" && retrieval.directAnswer) {
    return {
      text: sanitizeRawRecord(retrieval.directAnswer),
      source: "knowledge-base",
      mode: retrieval.mode,
      detectedIntent: retrieval.detectedIntent,
      selectedRecordType: retrieval.selectedRecordType
    };
  }

  const apiKey = getStoredApiKey();

  // If an API key is present, execute live Gemini call with dynamically built prompt
  if (apiKey) {
    try {
      const dynamicSystemPrompt = buildSystemInstruction(retrieval);

      const contents = history.slice(-6).map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      }));

      // Append current user prompt
      contents.push({
        role: "user",
        parts: [{ text: prompt }],
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: dynamicSystemPrompt }],
            },
            contents,
            generationConfig: {
              temperature: 0.65,
              maxOutputTokens: 600,
              topP: 0.95,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          return {
            text: sanitizeRawRecord(candidate),
            source: "gemini",
            mode: retrieval.mode,
            detectedIntent: retrieval.detectedIntent,
            selectedRecordType: retrieval.selectedRecordType
          };
        }
      } else {
        console.warn("Gemini API call failed, status:", response.status);
      }
    } catch (err) {
      console.warn("Gemini API network error, falling back to retrieval engine:", err);
    }
  }

  // Step 2: If Gemini is offline or not configured, return the high-confidence direct answer
  if (retrieval.directAnswer) {
    return {
      text: sanitizeRawRecord(retrieval.directAnswer),
      source: "knowledge-base",
      mode: retrieval.mode,
      card: retrieval.card,
      detectedIntent: retrieval.detectedIntent,
      selectedRecordType: retrieval.selectedRecordType
    };
  }

  // Step 3: Default grounded synthesis from retrieved context chunks
  if (retrieval.contextChunks.length > 0) {
    return {
      text: sanitizeRawRecord(retrieval.contextChunks[0]),
      source: "knowledge-base",
      mode: retrieval.mode,
      detectedIntent: retrieval.detectedIntent,
      selectedRecordType: retrieval.selectedRecordType
    };
  }

  return {
    text: "I haven’t captured enough verified detail about that yet, and I’d rather not guess. If you’d like to go deeper, feel free to contact me directly.",
    source: "knowledge-base",
    detectedIntent: "general_knowledge",
    selectedRecordType: "canonical_owner_profile"
  };
}
