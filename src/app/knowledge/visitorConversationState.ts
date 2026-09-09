/**
 * Visitor Conversation State Management
 * 
 * Cleanly separates dynamic visitor session state (messages, turn counts, active context)
 * from static published knowledge collections.
 */

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: number;
  source?: "gemini" | "knowledge-base" | "boundary";
  answerMode?: "documented_experience" | "recorded_viewpoint" | "application";
  card?: "resume" | "linkedin" | "phone" | "audio";
  utilityIntent?: "resume_request" | "linkedin_request" | "phone_request" | "audio_journey";
}

export interface ConversationState {
  messages: ChatMessage[];
  maxTurns: number;
  activeTopic?: string;
}

const STORAGE_KEY = "vikram_ama_session_history_v2";

export function loadStoredSession(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    // Ignore storage parse errors
  }
  return [];
}

export function saveStoredSession(messages: ChatMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    // Keep at most 20 recent messages in session storage
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-20)));
  } catch (e) {
    // Storage quota or privacy mode error
  }
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // Ignore
  }
}
