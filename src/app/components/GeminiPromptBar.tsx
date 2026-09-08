import React, { useState, useRef, useEffect } from "react";
import { askGemini, ChatMessage, getStoredApiKey, setStoredApiKey } from "../utils/geminiClient";

interface GeminiPromptBarProps {
  mode: "dark" | "light";
}

const SUGGESTION_CHIPS = [
  "What did you do at Google?",
  "How did you drive Copilot adoption?",
  "Explain the ADOPT framework",
  "Tell me about your career journey",
];

export function GeminiPromptBar({ mode }: GeminiPromptBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [hasCustomKey, setHasCustomKey] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const isLight = mode === "light";

  // Check stored API key on mount
  useEffect(() => {
    const key = getStoredApiKey();
    setHasCustomKey(!!key);
    if (key) setApiKeyInput(key);
  }, []);

  // Auto scroll messages to bottom
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  // Handle ESC key to minimize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || inputVal).trim();
    if (!prompt || isLoading) return;

    setInputVal("");
    setIsOpen(true);

    const userMessage: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      text: prompt,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const response = await askGemini(prompt, newHistory);
      const botMessage: ChatMessage = {
        id: "model-" + Date.now(),
        role: "model",
        text: response.text,
        timestamp: Date.now(),
      };
      setMessages([...newHistory, botMessage]);
    } catch (err) {
      console.error("Failed to generate response:", err);
      const errorMessage: ChatMessage = {
        id: "model-err-" + Date.now(),
        role: "model",
        text: "I ran into a temporary issue connecting to the AI model. Please try asking again!",
        timestamp: Date.now(),
      };
      setMessages([...newHistory, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    setStoredApiKey(apiKeyInput);
    setHasCustomKey(!!apiKeyInput.trim());
    setShowSettings(false);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  // Helper to format simple markdown (**bold**, *bullet points*, [links](url))
  const formatMessageText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Process bullet lines
      const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("* ");
      const lineContent = isBullet ? line.trim().slice(2) : line;

      // Replace bold **text**
      const parts = lineContent.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);

      const parsedParts = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={pIdx} className="font-semibold text-[var(--gemini-bold)]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
          const title = part.slice(1, part.indexOf("]("));
          const url = part.slice(part.indexOf("](") + 2, -1);
          return (
            <a
              key={pIdx}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline hover:text-blue-400 transition-colors"
            >
              {title}
            </a>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc mb-1 leading-relaxed">
            {parsedParts}
          </li>
        );
      }

      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="mb-2 leading-relaxed">
          {parsedParts}
        </p>
      );
    });
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[80] pointer-events-none flex flex-col items-center justify-end px-3 sm:px-6 pb-4 sm:pb-6"
      style={{
        paddingBottom: "max(16px, env(safe-area-inset-bottom, 16px))",
      }}
    >
      {/* ── EXPANDABLE CONVERSATIONAL DRAWER / CARD ── */}
      {isOpen && (
        <div
          ref={drawerRef}
          role="region"
          aria-label="Vikram AI Chat"
          className="pointer-events-auto w-full max-w-[680px] mb-3 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col animate-in fade-in slide-in-from-bottom-6"
          style={{
            height: "min(480px, 60vh)",
            background: isLight ? "rgba(255, 255, 255, 0.94)" : "rgba(13, 18, 31, 0.94)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: isLight ? "1px solid rgba(226, 232, 240, 0.9)" : "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: isLight
              ? "0 20px 45px -10px rgba(0, 0, 0, 0.12), 0 0 24px rgba(66, 133, 244, 0.15)"
              : "0 24px 50px -10px rgba(0, 0, 0, 0.65), 0 0 30px rgba(155, 114, 203, 0.15)",
          }}
        >
          {/* Drawer Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{
              borderColor: isLight ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.08)",
              background: isLight ? "rgba(248, 250, 252, 0.6)" : "rgba(255, 255, 255, 0.03)",
            }}
          >
            <div className="flex items-center gap-2">
              <div className="gemini-sparkle-icon w-5 h-5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                  <path
                    d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4772 12 22C12 16.4772 16.4772 12 22 12C16.4772 12 12 7.52285 12 2Z"
                    fill="url(#gemini-header-grad)"
                  />
                  <defs>
                    <linearGradient id="gemini-header-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#4285F4" />
                      <stop offset="0.5" stopColor="#9B72CB" />
                      <stop offset="1" stopColor="#D96570" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="text-sm font-medium tracking-tight" style={{ color: isLight ? "#0f172a" : "#f1f5f9" }}>
                Ask Me Anything
              </span>
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                style={{
                  color: isLight ? "#0369a1" : "#7dd3fc",
                  backgroundColor: isLight ? "#e0f2fe" : "rgba(56, 189, 248, 0.12)",
                  borderColor: isLight ? "#bae6fd" : "rgba(56, 189, 248, 0.25)",
                }}
              >
                Gemini Powered
              </span>
            </div>

            {/* Actions: Settings, Clear, Minimize */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                title="Configure Gemini API Key"
                aria-label="Configure Gemini API Key"
                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                style={{ color: isLight ? "#64748b" : "#94a3b8" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>

              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Clear conversation"
                  aria-label="Clear conversation"
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  style={{ color: isLight ? "#64748b" : "#94a3b8" }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                aria-label="Close chat"
                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                style={{ color: isLight ? "#64748b" : "#94a3b8" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Settings Panel Modal */}
          {showSettings && (
            <div
              className="p-4 border-b animate-in fade-in"
              style={{
                background: isLight ? "#f8fafc" : "rgba(15, 23, 42, 0.95)",
                borderColor: isLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.1)",
              }}
            >
              <div className="text-xs font-semibold mb-1" style={{ color: isLight ? "#0f172a" : "#f1f5f9" }}>
                Google Gemini API Key
              </div>
              <p className="text-[11px] mb-3 leading-relaxed" style={{ color: isLight ? "#64748b" : "#94a3b8" }}>
                Optionally paste your Gemini API key from{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  Google AI Studio
                </a>
                . Keys are saved locally in your browser. If empty, the built-in offline knowledge engine answers your queries.
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="flex-1 text-xs px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500"
                  style={{
                    background: isLight ? "#ffffff" : "rgba(30, 41, 59, 0.8)",
                    color: isLight ? "#0f172a" : "#f8fafc",
                    borderColor: isLight ? "#cbd5e1" : "rgba(255, 255, 255, 0.15)",
                  }}
                />
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(66,133,244,0.15), rgba(155,114,203,0.15))" }}>
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
                    <path
                      d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4772 12 22C12 16.4772 16.4772 12 22 12C16.4772 12 12 7.52285 12 2Z"
                      fill="url(#gemini-welcome-grad)"
                    />
                    <defs>
                      <linearGradient id="gemini-welcome-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#4285F4" />
                        <stop offset="0.5" stopColor="#9B72CB" />
                        <stop offset="1" stopColor="#D96570" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1" style={{ color: isLight ? "#0f172a" : "#f8fafc" }}>
                    Ask Me Anything
                  </h4>
                  <p className="text-xs max-w-sm mx-auto" style={{ color: isLight ? "#64748b" : "#94a3b8" }}>
                    I&apos;m Vikram Venkatesh. Ask me directly about scaling Copilot adoption at Microsoft, leading Cloud Security UX & Anthos at Google, or my 18+ years in product design leadership.
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none shadow-sm"
                      : isLight
                      ? "bg-slate-100/90 text-slate-800 rounded-bl-none border border-slate-200/80 shadow-sm"
                      : "bg-slate-800/80 text-slate-100 rounded-bl-none border border-white/10 shadow-sm"
                  }`}
                  style={{
                    ["--gemini-bold" as any]: isLight ? "#0f172a" : "#ffffff",
                  }}
                >
                  {msg.role === "user" ? msg.text : formatMessageText(msg.text)}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs py-2 px-3 rounded-xl max-w-xs" style={{ background: isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.04)" }}>
                <span className="inline-block animate-spin text-blue-500">✦</span>
                <span style={{ color: isLight ? "#64748b" : "#94a3b8" }}>Thinking & querying verified database...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* ── QUICK SUGGESTION CHIPS (Visible when drawer is open or input focused) ── */}
      {(!isOpen || messages.length === 0) && (
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-2 max-w-[680px]">
          {SUGGESTION_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleSend(chip)}
              className="text-[11px] sm:text-xs px-3 py-1.5 rounded-full backdrop-blur-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              style={{
                background: isLight ? "rgba(255, 255, 255, 0.88)" : "rgba(15, 23, 42, 0.85)",
                color: isLight ? "#334155" : "#e2e8f0",
                border: isLight ? "1px solid rgba(203, 213, 225, 0.8)" : "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow: isLight
                  ? "0 4px 12px rgba(0, 0, 0, 0.05)"
                  : "0 4px 12px rgba(0, 0, 0, 0.3)",
              }}
            >
              <span className="text-blue-500 mr-1.5 font-medium">✦</span>
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* ── FLOATING GEMINI PROMPT BAR ── */}
      <div
        className="pointer-events-auto w-full max-w-[680px] relative rounded-full p-[1.5px] transition-all duration-300 group hover:shadow-xl"
        style={{
          background: "linear-gradient(135deg, rgba(66, 133, 244, 0.6), rgba(155, 114, 203, 0.6), rgba(217, 101, 112, 0.6))",
          boxShadow: isLight
            ? "0 10px 30px -5px rgba(66, 133, 244, 0.2), 0 0 15px rgba(155, 114, 203, 0.15)"
            : "0 12px 36px -5px rgba(0, 0, 0, 0.5), 0 0 25px rgba(155, 114, 203, 0.25)",
        }}
      >
        <div
          className="w-full flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full transition-colors"
          style={{
            background: isLight ? "rgba(255, 255, 255, 0.95)" : "rgba(13, 18, 31, 0.92)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          {/* Gemini Sparkle Logo */}
          <div
            className="shrink-0 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full cursor-pointer hover:scale-110 transition-transform"
            onClick={() => setIsOpen(!isOpen)}
            title="Toggle Ask Me Anything"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <path
                d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4772 12 22C12 16.4772 16.4772 12 22 12C16.4772 12 12 7.52285 12 2Z"
                fill="url(#gemini-bar-grad)"
              />
              <defs>
                <linearGradient id="gemini-bar-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4285F4" />
                  <stop offset="0.5" stopColor="#9B72CB" />
                  <stop offset="1" stopColor="#D96570" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Prompt Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onFocus={() => {
              if (!isOpen && messages.length > 0) setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask me anything about my work at Microsoft, Google, Anthos..."
            className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
            style={{
              color: isLight ? "#0f172a" : "#f8fafc",
            }}
            aria-label="Ask Vikram anything"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!inputVal.trim() || isLoading}
            aria-label="Send prompt"
            className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              inputVal.trim() && !isLoading
                ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer hover:scale-105 active:scale-95"
                : "text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-40"
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
