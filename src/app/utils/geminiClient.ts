/**
 * Gemini API Client for Vikram's Conversational Concierge
 */

import { VIKRAM_SYSTEM_INSTRUCTION, findCuratedAnswer } from "./vikramPersonaKnowledge";

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: number;
}

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
 * Ask Gemini a question about Vikram, with automatic fallback to curated knowledge
 */
export async function askGemini(
  prompt: string,
  history: ChatMessage[] = []
): Promise<{ text: string; source: "gemini" | "knowledge-base" }> {
  const apiKey = getStoredApiKey();

  // If an API key is present, attempt live Gemini API call
  if (apiKey) {
    try {
      const contents = history.map((msg) => ({
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
              parts: [{ text: VIKRAM_SYSTEM_INSTRUCTION }],
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
          return { text: candidate, source: "gemini" };
        }
      } else {
        console.warn("Gemini API call failed, status:", response.status);
      }
    } catch (err) {
      console.warn("Gemini API network error, falling back to curated knowledge:", err);
    }
  }

  // Fallback to high-fidelity curated knowledge engine
  const curatedMatch = findCuratedAnswer(prompt);
  if (curatedMatch) {
    return { text: curatedMatch, source: "knowledge-base" };
  }

  // Default direct first-person response synthesized from verified database
  return {
    text: "I am a Product Design Leader with 18+ years of global experience across Microsoft, Google, McKinsey, and Oracle. Currently, I lead Copilot Adoption Community experiences at Microsoft, scaling enterprise usage to 1.5M+ MAU across 850+ tenants and expanding Copilot weekly active users from 936K to 3.4M. Ask me about my work on Copilot, Google Cloud & Anthos, enterprise AI workflows, or my design leadership philosophy.",
    source: "knowledge-base",
  };
}
