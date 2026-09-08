import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Mic } from "lucide-react";
import { askGemini, ChatMessage } from "../utils/geminiClient";
import { loadStoredSession, saveStoredSession, clearStoredSession } from "../knowledge/visitorConversationState";

interface GeminiPromptBarProps {
  mode: "dark" | "light";
}

const SUGGESTION_CHIPS = [
  "What did you do at Google",
  "Explain Adopt framework",
  "Tell me about your career journey",
];

/**
 * CanvasWaveform: High-DPI Siri/Gemini canvas ribbon wave component from AdoptIQ
 */
function CanvasWaveform({
  state,
  activity = 1,
  isLight,
  isDocked = false,
}: {
  state: "idle" | "listening" | "analyzing" | "submitting" | "results";
  activity?: number;
  isLight: boolean;
  isDocked?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef(state);
  const activityRef = useRef(activity);

  useEffect(() => {
    stateRef.current = state;
    activityRef.current = activity;
  }, [state, activity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let t = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(rect.width * dpr, 300);
      canvas.height = Math.max(rect.height * dpr, isDocked ? 60 : 120);
    };

    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      t += 0.024;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const st = stateRef.current;
      const act = activityRef.current;
      const baseAmp = isDocked ? 8 : (st === "listening" ? 28 : st === "analyzing" ? 38 : 14) * act;

      const layers = [
        { color: isLight ? "rgba(59, 130, 246, 0.45)" : "rgba(56, 189, 248, 0.55)", freq: 0.008, speed: 1.0, phase: 0 },
        { color: isLight ? "rgba(147, 51, 234, 0.40)" : "rgba(168, 85, 247, 0.50)", freq: 0.012, speed: 1.3, phase: 1.6 },
        { color: isLight ? "rgba(236, 72, 153, 0.35)" : "rgba(244, 114, 182, 0.45)", freq: 0.010, speed: 0.8, phase: 3.2 },
      ];

      layers.forEach((layer) => {
        ctx.beginPath();
        const midY = h / 2;
        for (let x = 0; x <= w; x += 3) {
          const envelope = Math.sin((x / w) * Math.PI);
          const y = midY + Math.sin(x * layer.freq + t * layer.speed + layer.phase) * baseAmp * envelope;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.strokeStyle = layer.color;
        ctx.lineWidth = isDocked ? 1.5 : 2.5;
        ctx.stroke();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [isLight, isDocked]);

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: isDocked ? "110%" : "min(98%, 980px)",
        height: isDocked ? "90px" : "220px",
        zIndex: 0,
        pointerEvents: "none",
        mixBlendMode: isLight ? "multiply" : "screen",
        opacity: state === "listening" ? 0.95 : state === "results" ? 0.25 : isDocked ? 0.45 : 0.78,
        transition: "opacity 0.4s ease, height 0.4s ease",
      }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

export function GeminiPromptBar({ mode }: GeminiPromptBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadStoredSession());
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [isDocked, setIsDocked] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isLight = mode === "light";
  const isActive = isFocused || isOpen || isListening || inputVal.trim().length > 0;
  const waveState = isLoading
    ? "analyzing"
    : isListening || isFocused || inputVal.length > 0
    ? "listening"
    : "idle";

  // Scroll spy: smooth transition between floating bottom bar and top navigation menu
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 260;
      setIsDocked(scrolled);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animate conic gradient angle smoothly on active without rotating element geometry
  useEffect(() => {
    if (!isActive) return;
    let animId: number;
    const start = performance.now();
    const tick = (now: number) => {
      const deg = (((now - start) / 3500) % 1) * 360;
      if (wrapperRef.current) {
        wrapperRef.current.style.setProperty("--conic-angle", `${deg}deg`);
      }
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isActive]);

  // Persist session history
  useEffect(() => {
    saveStoredSession(messages);
  }, [messages]);

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
        source: response.source,
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

  const handleClearChat = () => {
    setMessages([]);
    clearStoredSession();
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
      setStatusNotice(null);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatusNotice("Voice input isn't supported on this browser.");
      setTimeout(() => setStatusNotice(null), 3500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setStatusNotice("Listening... speak your question.");
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setInputVal(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          setStatusNotice("Microphone permission was denied.");
        } else if (event.error === "no-speech") {
          setStatusNotice("No speech detected. Try again.");
        } else {
          setStatusNotice("Voice error: " + event.error);
        }
        setTimeout(() => setStatusNotice(null), 3500);
      };

      recognition.onend = () => {
        setIsListening(false);
        setStatusNotice(null);
        if (inputRef.current && inputRef.current.value.trim().length > 0) {
          handleSend(inputRef.current.value);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Could not start speech recognition:", err);
      setIsListening(false);
      setStatusNotice("Could not access microphone.");
      setTimeout(() => setStatusNotice(null), 3000);
    }
  };

  const formatMessageText = (rawText: string) => {
    const lines = rawText.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("* ") || /^\d+\.\s/.test(trimmed);
      const cleanLine = isBullet
        ? trimmed.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "")
        : line;

      const parts = cleanLine.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
      const parsedParts = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong
              key={pIdx}
              className="font-bold"
              style={{ color: "var(--gemini-bold, inherit)" }}
            >
              {part.slice(2, -2)}
            </strong>
          );
        }
        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) {
          return (
            <a
              key={pIdx}
              href={linkMatch[2]}
              target={linkMatch[2].startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="underline font-semibold hover:opacity-80 transition-opacity"
              style={{ color: isLight ? "#0284c7" : "#38bdf8" }}
            >
              {linkMatch[1]}
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
    <aside
      aria-label="Ask Vikram AI Assistant"
      className={`fixed z-[80] pointer-events-none transition-all duration-500 ease-out ${
        isDocked ? "left-4 md:left-8" : "left-1/2 -translate-x-1/2"
      }`}
      style={{
        top: isDocked ? "12px" : "auto",
        bottom: isDocked ? "auto" : "20px",
        width: isDocked ? "min(320px, calc(100vw - 110px))" : "min(760px, calc(100vw - 28px))",
        display: "flex",
        flexDirection: "column",
        alignItems: isDocked ? "flex-start" : "center",
      }}
    >
      {/* ── EXPANDABLE CONVERSATIONAL DRAWER / CARD (FLOATING OR DOCKED) ── */}
      {isOpen && (
        <div
          ref={drawerRef}
          role="region"
          aria-label="Vikram AI Chat"
          className={`pointer-events-auto rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col ${
            isDocked
              ? "mt-2 w-[min(560px,calc(100vw-36px))] animate-in fade-in slide-in-from-top-4"
              : "mb-3 w-full max-w-[720px] animate-in fade-in slide-in-from-bottom-6"
          }`}
          style={{
            order: isDocked ? 2 : 0, // In docked mode, drawer sits below the input bar
            height: isDocked ? "min(520px, 76vh)" : "min(490px, 62vh)",
            background: isLight ? "rgba(255, 255, 255, 0.97)" : "rgba(10, 15, 30, 0.96)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: isLight ? "1px solid rgba(226, 232, 240, 0.9)" : "1px solid rgba(255, 255, 255, 0.14)",
            boxShadow: isLight
              ? "0 20px 50px -10px rgba(0, 0, 0, 0.15), 0 0 35px rgba(56, 189, 248, 0.2)"
              : "0 25px 60px -10px rgba(0, 0, 0, 0.7), 0 0 40px rgba(139, 92, 246, 0.25)",
          }}
        >
          {/* Drawer Header with Persistent AI Disclosure */}
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
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight" style={{ color: isLight ? "#0f172a" : "#f1f5f9" }}>
                  Ask Vikram Anything
                </span>
                {/* Persistent unobtrusive AI representation disclosure badge */}
                <span
                  className="text-[10.5px] font-medium px-2 py-0.5 rounded-full"
                  style={{
                    background: isLight ? "rgba(59, 130, 246, 0.1)" : "rgba(56, 189, 248, 0.15)",
                    color: isLight ? "#0284c7" : "#38bdf8",
                    border: isLight ? "1px solid rgba(59, 130, 246, 0.2)" : "1px solid rgba(56, 189, 248, 0.25)",
                  }}
                >
                  AI Representation
                </span>
              </div>
            </div>

            {/* Actions: Clear, Close */}
            <div className="flex items-center gap-1.5">
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
                    Ask Vikram Anything
                  </h4>
                  <p className="text-xs max-w-sm mx-auto" style={{ color: isLight ? "#64748b" : "#94a3b8" }}>
                    I&apos;m Vikram&apos;s AI representation. Ask me directly about scaling Copilot adoption at Microsoft, leading Cloud Security UX &amp; Anthos at Google, or my design approach and frameworks.
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

      {/* ── SUGGESTION PILLS (Disappear smoothly when scrolled into menu) ── */}
      <div
        className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 max-w-[760px] relative z-20 transition-all duration-300 ease-out"
        style={{
          order: 0,
          opacity: isDocked || (isOpen && messages.length > 0) ? 0 : 1,
          maxHeight: isDocked || (isOpen && messages.length > 0) ? "0px" : "60px",
          marginBottom: isDocked || (isOpen && messages.length > 0) ? "0px" : "10px",
          overflow: "hidden",
          pointerEvents: isDocked || (isOpen && messages.length > 0) ? "none" : "auto",
        }}
      >
        {SUGGESTION_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => handleSend(chip)}
            className="gemini-suggestion-chip px-4 sm:px-4.5 py-1.5 rounded-full cursor-pointer select-none text-xs sm:text-[13px] font-normal tracking-tight"
            style={{
              background: isLight ? "rgba(255, 255, 255, 0.38)" : "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              color: isLight ? "#334155" : "rgba(241, 245, 249, 0.85)",
              border: isLight ? "1px solid rgba(255, 255, 255, 0.65)" : "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: isLight
                ? "0 2px 10px rgba(0, 0, 0, 0.03), inset 0 1px 1px rgba(255, 255, 255, 0.8)"
                : "0 2px 12px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.08)",
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* ── STATUS NOTICE TOOLTIP / SPEECH FEEDBACK ── */}
      {statusNotice && (
        <div
          className="pointer-events-auto mb-2 text-xs font-medium px-3.5 py-1.5 rounded-full border shadow-sm animate-in fade-in relative z-20"
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

      {/* ── ADOPTIQ COMPONENT STAGE (Canvas Waveform + Glowing Command Bar) ── */}
      <div
        className="adoptiq-input-stage pointer-events-auto transition-all duration-500 ease-out"
        style={{
          order: 1,
          width: isDocked ? "100%" : "min(100%, 1060px)",
        }}
      >
        {/* Exact AdoptIQ Siri/Gemini Canvas Waveform (flowing behind the bar) */}
        <CanvasWaveform
          state={waveState}
          activity={inputVal.length > 0 ? 1.2 : 1}
          isLight={isLight}
          isDocked={isDocked}
        />

        {/* Command Bar Wrapper with Rotating Conic Glow on Active */}
        <div
          ref={wrapperRef}
          className={`command-bar-wrapper ${isDocked ? "command-bar-wrapper--docked" : ""}`}
        >
          {/* Active Conic Gradient Glow Layer */}
          {isActive && (
            <>
              <div
                className="conic-glow-layer blur-sm transition-opacity duration-500 opacity-40"
                aria-hidden="true"
              />
              <div
                className="conic-glow-layer transition-opacity duration-500 opacity-100"
                aria-hidden="true"
              />
              <div
                className="conic-glow-layer ai-glow-spill-mask blur-md pointer-events-none inset-[-12%] opacity-25"
                aria-hidden="true"
              />
            </>
          )}

          {/* Exact AdoptIQ Command Bar */}
          <div
            className={`command-bar ${isDocked ? "command-bar--docked" : ""} ${isFocused || isActive ? "command-bar--focused" : ""}`}
            onClick={() => inputRef.current?.focus()}
          >
            {/* Formatted Content & Unobtrusive AI Disclosure */}
            <div className="relative flex-1 flex items-center min-w-0 h-full">
              {/* Floating Placeholder / AI Disclosure */}
              {!inputVal && (
                <div
                  className="absolute left-0 top-0 bottom-0 flex items-center pointer-events-none select-none text-[13px] sm:text-[14.5px] font-normal leading-none"
                  style={{
                    letterSpacing: "-0.01em",
                  }}
                >
                  <span
                    className="mr-1.5 text-blue-500 font-semibold"
                    style={{ fontSize: isDocked ? "11px" : "13px" }}
                  >
                    ✦
                  </span>
                  {isDocked ? (
                    <span
                      className="truncate"
                      style={{ color: isLight ? "#64748b" : "#94a3b8" }}
                    >
                      Ask Vikram&apos;s AI...
                    </span>
                  ) : (
                    <span
                      className="truncate"
                      style={{ color: isLight ? "#64748b" : "#94a3b8" }}
                    >
                      Hi, I&apos;m Vikram. Ask me anything.
                    </span>
                  )}
                </div>
              )}

              {/* Interactive Input */}
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
                className={`w-full bg-transparent border-none outline-none font-normal relative z-20 ${
                  isDocked ? "text-[12.5px] sm:text-[13px]" : "text-[15px] sm:text-[16px]"
                }`}
                style={{
                  color: isLight ? "#070e24" : "#f8fafc",
                  caretColor: isLight ? "#7c3aed" : "#a855f7",
                }}
                aria-label="Ask Vikram AI anything"
              />
            </div>

            {/* Right Action Controls: Voice Microphone + Submit Button */}
            <div className="flex items-center gap-1.5 sm:gap-2 relative z-20 shrink-0">
              {/* Microphone Voice Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMicClick();
                }}
                title={isListening ? "Stop listening" : "Ask with voice"}
                aria-label={isListening ? "Stop listening" : "Ask with voice"}
                className={`rounded-full transition-all duration-200 cursor-pointer ${
                  isDocked ? "p-1.5" : "p-2"
                } ${
                  isListening
                    ? "bg-red-500/20 text-red-500 scale-110 shadow-lg"
                    : "text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:scale-105 active:scale-95"
                }`}
              >
                <Mic className={isDocked ? "w-3.5 h-3.5" : "w-4 h-4"} />
              </button>

              {/* Exact AdoptIQ Circular Submit Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSend();
                }}
                disabled={!inputVal.trim() || isLoading}
                title="Send message"
                aria-label="Send message"
                className={`submit-button ${isDocked ? "submit-button--docked" : ""}`}
              >
                <ArrowUp className={isDocked ? "w-3 h-3" : "w-4 h-4"} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
