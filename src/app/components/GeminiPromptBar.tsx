import React, { useState, useRef, useEffect } from "react";
import { askGemini, ChatMessage, getStoredApiKey, setStoredApiKey } from "../utils/geminiClient";

interface GeminiPromptBarProps {
  mode: "dark" | "light";
}

const SUGGESTION_CHIPS = [
  "What's your design approach?",
  "Why did you create ADOPT?",
  "What inspires you?",
];

export function GeminiPromptBar({ mode }: GeminiPromptBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const isLight = mode === "light";
  const isActive = isFocused || isOpen || isListening || inputVal.trim().length > 0;

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

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

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

  // Toggle voice recognition
  const handleMicClick = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatusNotice("Speech recognition is not supported in this browser.");
      setTimeout(() => setStatusNotice(null), 3500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setStatusNotice("Listening... speak your question");
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputVal(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        setStatusNotice(null);
      };

      recognition.onend = () => {
        setIsListening(false);
        setStatusNotice(null);
        inputRef.current?.focus();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Could not start speech recognition:", err);
      setIsListening(false);
      setStatusNotice("Microphone access unavailable.");
      setTimeout(() => setStatusNotice(null), 3000);
    }
  };

  // Helper to format simple markdown (**bold**, *bullet points*, [links](url))
  const formatMessageText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("* ");
      const lineContent = isBullet ? line.trim().slice(2) : line;

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
      className="fixed bottom-0 left-0 right-0 z-[80] pointer-events-none flex flex-col items-center justify-end px-3 sm:px-6 pb-3 sm:pb-5"
      style={{
        paddingBottom: "max(14px, env(safe-area-inset-bottom, 14px))",
      }}
    >
      {/* ── EXPANDABLE CONVERSATIONAL DRAWER / CARD ── */}
      {isOpen && (
        <div
          ref={drawerRef}
          role="region"
          aria-label="Vikram AI Chat"
          className="pointer-events-auto w-full max-w-[700px] mb-3 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col animate-in fade-in slide-in-from-bottom-6"
          style={{
            height: "min(490px, 62vh)",
            background: isLight ? "rgba(255, 255, 255, 0.95)" : "rgba(10, 15, 30, 0.94)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: isLight ? "1px solid rgba(226, 232, 240, 0.9)" : "1px solid rgba(255, 255, 255, 0.14)",
            boxShadow: isLight
              ? "0 20px 50px -10px rgba(0, 0, 0, 0.15), 0 0 35px rgba(56, 189, 248, 0.2)"
              : "0 25px 60px -10px rgba(0, 0, 0, 0.7), 0 0 40px rgba(139, 92, 246, 0.25)",
          }}
        >
          {/* Drawer Header */}
          <div
            className="flex items-center justify-between px-5 py-3.5 border-b"
            style={{
              borderColor: isLight ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.08)",
              background: isLight ? "rgba(248, 250, 252, 0.7)" : "rgba(255, 255, 255, 0.03)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                  <path
                    d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4772 12 22C12 16.4772 16.4772 12 22 12C16.4772 12 12 7.52285 12 2Z"
                    fill="url(#gemini-drawer-sparkle)"
                  />
                  <defs>
                    <linearGradient id="gemini-drawer-sparkle" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#00d2ff" />
                      <stop offset="0.4" stopColor="#3b82f6" />
                      <stop offset="0.75" stopColor="#a855f7" />
                      <stop offset="1" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="text-sm font-semibold tracking-tight" style={{ color: isLight ? "#0f172a" : "#f1f5f9" }}>
                Ask Vikram Anything
              </span>
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                style={{
                  color: isLight ? "#0369a1" : "#7dd3fc",
                  backgroundColor: isLight ? "#e0f2fe" : "rgba(56, 189, 248, 0.12)",
                  borderColor: isLight ? "#bae6fd" : "rgba(56, 189, 248, 0.25)",
                }}
              >
                Gemini Model
              </span>
            </div>

            {/* Actions: Settings, Clear, Minimize */}
            <div className="flex items-center gap-1.5">
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
                . Keys are saved locally in your browser. If empty, the built-in offline knowledge engine answers your queries authentically.
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
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(168, 85, 247, 0.2))",
                  }}
                >
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
                    <path
                      d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4772 12 22C12 16.4772 16.4772 12 22 12C16.4772 12 12 7.52285 12 2Z"
                      fill="url(#gemini-welcome-sparkle)"
                    />
                    <defs>
                      <linearGradient id="gemini-welcome-sparkle" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#00d2ff" />
                        <stop offset="0.45" stopColor="#3b82f6" />
                        <stop offset="0.8" stopColor="#a855f7" />
                        <stop offset="1" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1" style={{ color: isLight ? "#0f172a" : "#f8fafc" }}>
                    Ask Me Anything
                  </h4>
                  <p className="text-xs max-w-sm mx-auto" style={{ color: isLight ? "#64748b" : "#94a3b8" }}>
                    I&apos;m Vikram. Ask me directly about scaling Copilot adoption at Microsoft, leading Cloud Security UX & Anthos at Google, or my design approach and frameworks.
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
              <div
                className="flex items-center gap-2 text-xs py-2 px-3 rounded-xl max-w-xs"
                style={{ background: isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.04)" }}
              >
                <span className="inline-block animate-spin text-blue-500">✦</span>
                <span style={{ color: isLight ? "#64748b" : "#94a3b8" }}>Thinking & querying verified database...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* ── SUGGESTION PILLS (Modeled on screenshot with cyan/blue glow border) ── */}
      {(!isOpen || messages.length === 0) && (
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-3 max-w-[760px]">
          {SUGGESTION_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleSend(chip)}
              className="gemini-suggestion-chip px-5 sm:px-6 py-2 sm:py-2.5 rounded-full backdrop-blur-md cursor-pointer select-none text-xs sm:text-sm font-medium tracking-tight"
              style={{
                background: isLight ? "rgba(255, 255, 255, 0.90)" : "rgba(15, 23, 42, 0.88)",
                color: isLight ? "#0c1c4f" : "#f1f5f9",
                border: isLight ? "1.5px solid rgba(56, 189, 248, 0.55)" : "1.5px solid rgba(56, 189, 248, 0.45)",
                boxShadow: isLight
                  ? "0 4px 14px rgba(56, 189, 248, 0.22), 0 1px 3px rgba(0, 0, 0, 0.05)"
                  : "0 4px 18px rgba(56, 189, 248, 0.25), 0 0 12px rgba(139, 92, 246, 0.15)",
              }}
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* ── STATUS NOTICE TOOLTIP / SPEECH FEEDBACK ── */}
      {statusNotice && (
        <div
          className="pointer-events-auto mb-2 text-xs font-medium px-3.5 py-1.5 rounded-full border shadow-sm animate-in fade-in"
          style={{
            background: isLight ? "rgba(255, 255, 255, 0.96)" : "rgba(30, 41, 59, 0.96)",
            color: isListening ? "#ef4444" : isLight ? "#0369a1" : "#38bdf8",
            borderColor: isListening ? "rgba(239, 68, 68, 0.4)" : isLight ? "#bae6fd" : "rgba(56, 189, 248, 0.3)",
          }}
        >
          {isListening && <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2 animate-ping" />}
          {statusNotice}
        </div>
      )}

      {/* ── GEMINI MODELED PROMPT BAR (Outer Glow Aura + Flowing Gradient Border) ── */}
      <div className="pointer-events-auto w-full max-w-[700px] relative">
        {/* Ambient Blur Aura (Intensifies and pulses when active/focused) */}
        <div
          className={`gemini-ambient-glow absolute -inset-1 rounded-full pointer-events-none transition-all duration-500 ${
            isActive ? "opacity-90" : "opacity-35"
          }`}
          style={{
            background:
              "linear-gradient(115deg, rgba(0, 210, 255, 0.7) 0%, rgba(59, 130, 246, 0.6) 25%, rgba(168, 85, 247, 0.7) 55%, rgba(236, 72, 153, 0.7) 85%, rgba(0, 210, 255, 0.7) 100%)",
            backgroundSize: "200% 200%",
          }}
        />

        {/* Outer Pill with Flowing Multi-Stop Gradient Border */}
        <div
          className={`relative rounded-full p-[2px] transition-all duration-300 shadow-xl ${
            isActive ? "gemini-gradient-border-active shadow-2xl scale-[1.008]" : "gemini-gradient-border"
          }`}
        >
          {/* Inner Glassy Surface */}
          <div
            className="w-full flex items-center justify-between px-6 sm:px-8 py-3.5 sm:py-4 rounded-full transition-colors relative"
            style={{
              background: isLight ? "rgba(255, 255, 255, 0.96)" : "rgba(10, 15, 28, 0.93)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow: isLight
                ? "inset 0 1px 2px rgba(255, 255, 255, 0.8), 0 4px 20px rgba(0, 0, 0, 0.04)"
                : "inset 0 1px 1px rgba(255, 255, 255, 0.12), 0 8px 30px rgba(0, 0, 0, 0.4)",
            }}
            onClick={() => inputRef.current?.focus()}
          >
            {/* Formatted Text Placeholder: "Hi, I’m Vikram. Ask me anything." */}
            {!inputVal && (
              <div className="pointer-events-none absolute left-6 sm:left-8 flex items-center text-sm sm:text-[17px] tracking-tight select-none z-10 transition-opacity">
                <span
                  className="font-bold mr-2"
                  style={{ color: isLight ? "#070e24" : "#ffffff" }}
                >
                  Hi, I’m Vikram.
                </span>
                <span
                  className="font-normal"
                  style={{ color: isLight ? "rgba(12, 28, 79, 0.92)" : "rgba(241, 245, 249, 0.88)" }}
                >
                  Ask me anything.
                </span>
              </div>
            )}

            {/* Input Field */}
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onFocus={() => {
                setIsFocused(true);
                if (!isOpen && messages.length > 0) setIsOpen(true);
              }}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1 bg-transparent border-none outline-none text-sm sm:text-[17px] font-normal relative z-20 transition-colors pr-2"
              style={{
                color: isLight ? "#070e24" : "#f8fafc",
                caretColor: isLight ? "#2563eb" : "#38bdf8",
              }}
              aria-label="Ask Vikram anything"
            />

            {/* Right Action Icons: Microphone (matching design) + Send when text typed */}
            <div className="relative z-20 flex items-center gap-2 shrink-0">
              {/* Send Button (Appears when text is typed) */}
              {inputVal.trim().length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSend();
                  }}
                  disabled={isLoading}
                  title="Send question"
                  aria-label="Send question"
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-md"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              )}

              {/* Microphone Icon Button (Exact match from screenshot) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMicClick();
                }}
                title={isListening ? "Stop listening" : "Ask with voice"}
                aria-label={isListening ? "Stop listening" : "Ask with voice"}
                className={`p-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                  isListening
                    ? "bg-red-500/20 text-red-500 scale-110 shadow-lg"
                    : "hover:scale-110 active:scale-95"
                }`}
                style={{
                  color: isListening
                    ? "#ef4444"
                    : isLight
                    ? "#0a194f"
                    : "#f1f5f9",
                  boxShadow: isListening ? "0 0 0 4px rgba(239, 68, 68, 0.3)" : undefined,
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── SUBTITLE HELPER TEXT (Exact match from screenshot) ── */}
        <div
          className="text-center text-[11px] sm:text-xs font-normal tracking-wide mt-2 select-none transition-colors"
          style={{
            color: isLight ? "rgba(71, 85, 105, 0.85)" : "rgba(148, 163, 184, 0.75)",
          }}
        >
          AI companion • Based on my work &amp; stories
        </div>
      </div>
    </div>
  );
}
