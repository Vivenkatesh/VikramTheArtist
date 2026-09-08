/**
 * Gemini API Client for Vikram's Conversational Concierge
 * Version: 2026.1.0 (Connected to Versioned Persona & Hybrid Retrieval Engine)
 */

import { retrieveRelevantKnowledge } from "../knowledge/retrievalEngine";
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

/**
 * Ask Gemini a question about Vikram, with grounded hybrid retrieval and fallback
 */
export async function askGemini(
  prompt: string,
  history: ChatMessage[] = []
): Promise<{ text: string; source: "gemini" | "knowledge-base"; mode?: string }> {
  // Step 1: Hybrid Retrieval Engine processes the query against published knowledge
  const retrieval = retrieveRelevantKnowledge(prompt);

  // If a strict boundary was triggered, immediately return the approved boundary wording
  if (retrieval.matchedBoundary && retrieval.directAnswer) {
    return {
      text: retrieval.directAnswer,
      source: "knowledge-base",
      mode: retrieval.mode
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
            text: candidate,
            source: "gemini",
            mode: retrieval.mode
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
      text: retrieval.directAnswer,
      source: "knowledge-base",
      mode: retrieval.mode
    };
  }

  // Step 3: Default grounded synthesis from retrieved context chunks
  if (retrieval.contextChunks.length > 0) {
    return {
      text: retrieval.contextChunks[0],
      source: "knowledge-base",
      mode: retrieval.mode
    };
  }

  return {
    text: "I am a Product Design Leader with 18+ years of global experience across Microsoft, Google, McKinsey, and Oracle. Currently, I lead Copilot Adoption Community experiences at Microsoft, scaling enterprise usage to 1.5M+ MAU across 850+ tenants and expanding Copilot weekly active users from 936K to 3.4M. Ask me about my work on Copilot, Google Cloud & Anthos, enterprise AI workflows, or my design leadership philosophy.",
    source: "knowledge-base",
  };
}
