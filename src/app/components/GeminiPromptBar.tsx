import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Mic } from "lucide-react";
import { askGemini, ChatMessage } from "../utils/geminiClient";

interface GeminiPromptBarProps {
  mode: "dark" | "light";
}

const SUGGESTION_CHIPS = [
  "What did you do at Google",
  "Explain Adopt framework",
  "Tell me about your career journey",
];

/**
 * CanvasWaveform: Exact high-DPI Siri/Gemini canvas ribbon wave component from AdoptIQ
 */
function CanvasWaveform({
  state,
  activity = 1,
  isLight,
}: {
  state: "idle" | "listening" | "analyzing" | "submitting" | "results";
  activity?: number;
  isLight: boolean;
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

    let animId: number;
    let step = 0;
    let currentAmp = 50;
    let currentSpeed = 1;
    const dpr = window.devicePixelRatio || 1;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    const waves = [
      { color: "rgba(192, 132, 252, 0.62)", speed: 0.032, shift: 0, freq: 2.8, ampMult: 1.15 },
      { color: "rgba(59, 130, 246, 0.54)", speed: 0.045, shift: 2.1, freq: 2.4, ampMult: 1.05 },
      { color: "rgba(56, 189, 248, 0.52)", speed: 0.058, shift: 4.2, freq: 3.2, ampMult: 0.92 },
      { color: "rgba(168, 85, 247, 0.48)", speed: 0.026, shift: 1.2, freq: 2.0, ampMult: 1.2 },
      { color: "rgba(244, 114, 182, 0.42)", speed: 0.038, shift: 3.0, freq: 2.6, ampMult: 0.98 },
    ];

    const render = () => {
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      ctx.clearRect(0, 0, w, h);

      const st = stateRef.current;
      const act = activityRef.current;
      const isBusy = st === "analyzing" || st === "submitting";
      const isListening = st === "listening";

      let targetAmp = 46;
      if (isListening) targetAmp = 64 + act * 16;
      if (isBusy) targetAmp = 105;
      currentAmp += (targetAmp - currentAmp) * 0.06;

      let targetSpeed = 1;
      if (isListening) targetSpeed = 1.35;
      if (isBusy) targetSpeed = 3.6;
      currentSpeed += (targetSpeed - currentSpeed) * 0.05;

      waves.forEach((wave) => {
        // Find visible range where wave has actual amplitude
        const minVisibleAmp = 0.5;
        let startX = -1;
        let endX = -1;

        for (let x = 0; x <= w; x += 4) {
          const normX = (x / w) * 4 - 2;
          const bell = Math.exp(-Math.pow(normX * 1.35, 2));
          if (currentAmp * bell * wave.ampMult > minVisibleAmp) {
            if (startX === -1) startX = x;
            endX = x;
          }
        }

        if (startX === -1 || endX <= startX) return;

        ctx.beginPath();
        // Top edge with smooth sinusoidal window taper at edges
        for (let x = startX; x <= endX; x += 3) {
          const normX = (x / w) * 4 - 2;
          const progress = (x - startX) / (endX - startX);
          const windowFade = Math.sin(progress * Math.PI);
          const bell = Math.exp(-Math.pow(normX * 1.35, 2)) * windowFade;
          const yOffset = Math.sin(normX * wave.freq + step * wave.speed + wave.shift) * currentAmp * wave.ampMult * bell;
          ctx.lineTo(x, h / 2 + yOffset);
        }
        // Bottom edge with matching taper
        for (let x = endX; x >= startX; x -= 3) {
          const normX = (x / w) * 4 - 2;
          const progress = (x - startX) / (endX - startX);
          const windowFade = Math.sin(progress * Math.PI);
          const bell = Math.exp(-Math.pow(normX * 1.35, 2)) * windowFade;
          const yOffset = Math.sin(normX * wave.freq + step * wave.speed + wave.shift) * currentAmp * wave.ampMult * bell;
          ctx.lineTo(x, h / 2 - yOffset);
        }
        ctx.closePath();
        ctx.fillStyle = wave.color;
        ctx.fill();
      });

      step += currentSpeed;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(92%, 840px)",
        height: "220px",
        zIndex: 0,
        pointerEvents: "none",
        mixBlendMode: isLight ? "multiply" : "screen",
        opacity: state === "listening" ? 0.95 : state === "results" ? 0.25 : 0.78,
        transition: "opacity 0.4s ease",
        maskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 30%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 30%, transparent 80%)",
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

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
      className="fixed bottom-0 left-0 right-0 z-[80] pointer-events-none flex flex-col items-center justify-end px-3 sm:px-6"
      style={{
        bottom: "20px",
        paddingBottom: "max(12px, env(safe-area-inset-bottom, 12px))",
      }}
    >
      {/* ── EXPANDABLE CONVERSATIONAL DRAWER / CARD ── */}
      {isOpen && (
        <div
          ref={drawerRef}
          role="region"
          aria-label="Vikram AI Chat"
          className="pointer-events-auto w-full max-w-[720px] mb-3 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col animate-in fade-in slide-in-from-bottom-6"
          style={{
            height: "min(490px, 62vh)",
            background: isLight ? "rgba(255, 255, 255, 0.96)" : "rgba(10, 15, 30, 0.95)",
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
            </div>

            {/* Actions: Clear, Minimize */}
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

      {/* ── SUGGESTION PILLS (Subtle & Transparent Glassmorphic Design) ── */}
      {(!isOpen || messages.length === 0) && (
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-2.5 max-w-[760px] relative z-20">
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
      )}

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

      {/* ── ADOPTIQ EXACT COMPONENT STAGE (Canvas Waveform + Glowing Command Bar) ── */}
      <div className="adoptiq-input-stage pointer-events-auto">
        {/* Exact AdoptIQ Siri/Gemini Canvas Waveform (flowing behind the bar) */}
        <CanvasWaveform state={waveState} activity={inputVal.length > 0 ? 1.2 : 1} isLight={isLight} />

        {/* Command Bar Wrapper with Rotating Conic Glow on Active */}
        <div ref={wrapperRef} className="command-bar-wrapper">
          {/* Active Conic Gradient Glow Layer (Exact AdoptIQ Glow Effect) */}
          {isActive && (
            <>
              {/* Outer Blurred Glow */}
              <div
                className="conic-glow-layer blur-sm transition-opacity duration-500 opacity-40"
                aria-hidden="true"
              />
              {/* Crisp Border Glow */}
              <div
                className="conic-glow-layer transition-opacity duration-500 opacity-100"
                aria-hidden="true"
              />
              {/* Inner Spill Glow Mask */}
              <div
                className="conic-glow-layer ai-glow-spill-mask blur-md pointer-events-none inset-[-12%] opacity-25"
                aria-hidden="true"
              />
            </>
          )}

          {/* Exact AdoptIQ Command Bar */}
          <div
            className={`command-bar ${isFocused || isActive ? "command-bar--focused" : ""}`}
            onClick={() => inputRef.current?.focus()}
          >
            {/* Formatted Content: "Hi, I'm Vikram. Ask me anything." (Unbolded) */}
            <div className="relative flex-1 flex items-center min-w-0 h-full">
              {!inputVal && (
                <div className="pointer-events-none absolute left-0 right-0 flex items-center text-[15px] sm:text-[16px] tracking-tight select-none z-10 overflow-hidden text-ellipsis whitespace-nowrap font-normal">
                  <span
                    className="mr-1.5 shrink-0"
                    style={{ color: isLight ? "#475569" : "#cbd5e1" }}
                  >
                    Hi, I’m Vikram.
                  </span>
                  <span
                    className="truncate"
                    style={{ color: isLight ? "#64748b" : "#94a3b8" }}
                  >
                    Ask me anything.
                  </span>
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
                className="w-full bg-transparent border-none outline-none text-[15px] sm:text-[16px] font-normal relative z-20"
                style={{
                  color: isLight ? "#070e24" : "#f8fafc",
                  caretColor: isLight ? "#7c3aed" : "#a855f7",
                }}
                aria-label="Ask Vikram anything"
              />
            </div>

            {/* Right Action Controls: Voice Microphone + Exact AdoptIQ Circular Submit Button (sA) */}
            <div className="flex items-center gap-2 relative z-20 shrink-0">
              {/* Microphone Voice Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMicClick();
                }}
                title={isListening ? "Stop listening" : "Ask with voice"}
                aria-label={isListening ? "Stop listening" : "Ask with voice"}
                className={`p-2 rounded-full transition-all duration-200 cursor-pointer ${
                  isListening
                    ? "bg-red-500/20 text-red-500 scale-110 shadow-lg"
                    : "text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:scale-105 active:scale-95"
                }`}
                style={{
                  boxShadow: isListening ? "0 0 0 4px rgba(239, 68, 68, 0.3)" : undefined,
                }}
              >
                <Mic size={18} strokeWidth={2} />
              </button>

              {/* Exact AdoptIQ Submit Button with ArrowUp (sA from AdoptIQ) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSend();
                }}
                disabled={!inputVal.trim() || isLoading}
                title="Send query"
                aria-label="Run query"
                className="submit-button"
              >
                <ArrowUp size={22} strokeWidth={1.9} />
              </button>
            </div>
          </div>
        </div>

        {/* ── SUBTITLE HELPER TEXT ── */}
        <div
          className="text-center text-[11px] sm:text-xs font-normal tracking-wide mt-1.5 select-none transition-colors relative z-20"
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
