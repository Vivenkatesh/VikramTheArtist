import React, { useState, useRef, useEffect } from "react";
import {
  ArrowUp,
  Mic,
  FileText,
  ExternalLink,
  Phone,
  Copy,
  Check,
  X,
  Globe,
  Plus,
  SlidersHorizontal,
  Trash2,
  Sparkles,
  User,
  Lightbulb,
  ChevronRight,
  Headphones,
} from "lucide-react";
import { askGemini, ChatMessage } from "../utils/geminiClient";
import { CANONICAL_CONTACT_PROFILE } from "../knowledge/publishedRegistry";
import { AudioStoryCard } from "./AudioStoryCard";

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27A7.18 7.18 0 0 1 4.9 12c0-.79.14-1.56.38-2.27V6.58H1.25A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.25 5.42l4.03-3.15Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
      />
    </svg>
  );
}

function getSuggestionIcon(suggestion: string) {
  const text = suggestion.toLowerCase();
  if (text.includes("google")) {
    return (
      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-2xs shrink-0 border border-slate-100">
        <GoogleIcon />
      </div>
    );
  }
  if (text.includes("playbook") || text.includes("notification") || text.includes("resume")) {
    return (
      <div className="w-6 h-6 rounded-full bg-blue-100/90 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
        <FileText size={13} />
      </div>
    );
  }
  if (text.includes("adoptiq") || text.includes("functionality") || text.includes("adopt framework")) {
    return (
      <div className="w-6 h-6 rounded-full bg-amber-100/90 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
        <Lightbulb size={13} />
      </div>
    );
  }
  if (text.includes("work experience") || text.includes("who is") || text.includes("career")) {
    return (
      <div className="w-6 h-6 rounded-full bg-sky-100/90 dark:bg-sky-900/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
        <User size={13} />
      </div>
    );
  }
  if (text.includes("audio") || text.includes("story") || text.includes("listen")) {
    return (
      <div className="w-6 h-6 rounded-full bg-purple-100/90 dark:bg-purple-900/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
        <Headphones size={13} />
      </div>
    );
  }
  return (
    <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-500 flex items-center justify-center shrink-0">
      <Sparkles size={13} />
    </div>
  );
}

interface GeminiPromptBarProps {
  mode: "dark" | "light";
  isDocked?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: "floating" | "inline";
}

const SUGGESTION_CHIPS = [
  "What did you do at Google",
  "Explain Adopt framework",
  "What is your current role?",
  "🎧 Tell me your story — audio",
];

const SIDE_PANEL_SUGGESTIONS = [
  "Describe the Notification XD Playbook approach",
  "Explain AdoptIQ.ai functionality",
  "Summarize Vikram Venkatesh's work experience",
  "What did you do at Google",
  "Explain Adopt framework",
  "Tell me about your career journey",
  "🎧 Tell me your story — audio",
];

/**
 * Smart contextual suggestion generator based on active query & answer
 */
function getContextualSuggestions(messages: ChatMessage[]): string[] {
  if (messages.length === 0) return SIDE_PANEL_SUGGESTIONS;

  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  const lastModelMsg = [...messages].reverse().find((m) => m.role === "model");

  const lastUserText = (lastUserMsg?.text || "").toLowerCase();
  const lastModelText = (lastModelMsg?.text || "").toLowerCase();
  const combined = lastUserText + " " + lastModelText;

  // Filter out the exact query that was just asked
  const candidates = SIDE_PANEL_SUGGESTIONS.filter((q) => {
    const cleanQ = q.toLowerCase().replace(/🎧\s*|—\s*audio/g, "").trim();
    return !lastUserText.includes(cleanQ) && lastUserText !== cleanQ;
  });

  // Relevance ranking based on conversation context
  const scored = candidates.map((q) => {
    let score = 0;
    const qLower = q.toLowerCase();

    // If query or response was about Google
    if (combined.includes("google") || combined.includes("anthos") || combined.includes("security")) {
      if (qLower.includes("work experience")) score += 6;
      if (qLower.includes("adopt framework")) score += 5;
      if (qLower.includes("adoptiq")) score += 4;
      if (qLower.includes("career journey")) score += 3;
      if (qLower.includes("audio")) score += 2;
    }
    // If query or response was about Adopt / Copilot / Playbook
    else if (
      combined.includes("adopt") ||
      combined.includes("copilot") ||
      combined.includes("playbook") ||
      combined.includes("adoptiq")
    ) {
      if (qLower.includes("notification xd playbook")) score += 6;
      if (qLower.includes("adoptiq.ai")) score += 5;
      if (qLower.includes("adopt framework")) score += 4;
      if (qLower.includes("work experience")) score += 3;
      if (qLower.includes("google")) score += 2;
    }
    // If query or response was about Career / Story / Background
    else if (
      combined.includes("career") ||
      combined.includes("journey") ||
      combined.includes("story") ||
      combined.includes("background") ||
      combined.includes("experience") ||
      combined.includes("leadership")
    ) {
      if (qLower.includes("audio")) score += 6;
      if (qLower.includes("work experience")) score += 5;
      if (qLower.includes("google")) score += 4;
      if (qLower.includes("adopt framework")) score += 3;
      if (qLower.includes("adoptiq")) score += 2;
    }
    // If query was about Resume, LinkedIn, or Contact
    else if (
      combined.includes("resume") ||
      combined.includes("linkedin") ||
      combined.includes("contact") ||
      combined.includes("phone")
    ) {
      if (qLower.includes("work experience")) score += 6;
      if (qLower.includes("career journey")) score += 5;
      if (qLower.includes("audio")) score += 4;
    } else {
      score = 1;
    }

    return { q, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 4).map((item) => item.q);
}

/**
 * CanvasWaveform: High-DPI Siri/Gemini canvas ribbon wave component
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
    let currentAmp = 0;
    let currentSpeed = 1;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);
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

      let targetAmp = 0;
      if (isListening) targetAmp = 58 + act * 8;
      if (isBusy) targetAmp = 72;
      currentAmp += (targetAmp - currentAmp) * 0.06;

      let targetSpeed = 1;
      if (isListening) targetSpeed = 1.35;
      if (isBusy) targetSpeed = 3.6;
      currentSpeed += (targetSpeed - currentSpeed) * 0.05;

      waves.forEach((wave) => {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 3) {
          const normX = (x / w) * 4 - 2;
          const bell = Math.exp(-Math.pow(normX * 1.05, 2));
          const amplitude = 1.4 + currentAmp * wave.ampMult * bell;
          const yOffset = Math.sin(normX * wave.freq + step * wave.speed + wave.shift) * amplitude;
          ctx.lineTo(x, h / 2 + yOffset);
        }
        for (let x = w; x >= 0; x -= 3) {
          const normX = (x / w) * 4 - 2;
          const bell = Math.exp(-Math.pow(normX * 1.05, 2));
          const amplitude = 1.4 + currentAmp * wave.ampMult * bell;
          const yOffset = Math.sin(normX * wave.freq + step * wave.speed + wave.shift) * amplitude;
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
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "100%",
        height: "280px",
        zIndex: 0,
        pointerEvents: "none",
        mixBlendMode: isLight ? "multiply" : "screen",
        opacity: state === "listening" ? 0.95 : state === "results" ? 0.25 : 0.78,
        transition: "opacity 0.4s ease",
      }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

/**
 * ResumeCard: Concise, high-contrast CTA card linking to canonical resume
 */
function ResumeCard({ isLight }: { isLight: boolean }) {
  return (
    <div
      className="rounded-2xl p-4 sm:p-5 transition-all duration-200"
      style={{
        background: isLight ? "#ffffff" : "#282a2c",
        border: isLight ? "1px solid #dadce0" : "1px solid #3c4043",
        boxShadow: isLight
          ? "0 2px 8px -1px rgba(0, 0, 0, 0.08)"
          : "0 4px 16px -2px rgba(0, 0, 0, 0.4)",
      }}
    >
      <div className="flex items-start gap-3.5 mb-3.5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: isLight
              ? "linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(79, 70, 229, 0.15))"
              : "linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(168, 85, 247, 0.2))",
            color: isLight ? "#2563eb" : "#38bdf8",
          }}
        >
          <FileText size={20} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className="font-bold text-sm tracking-tight mb-1 leading-snug"
            style={{ color: isLight ? "#1f1f1f" : "#f8fafc" }}
          >
            {CANONICAL_CONTACT_PROFILE.resumeTitle}
          </h4>
          <p
            className="text-xs leading-relaxed"
            style={{ color: isLight ? "#475569" : "#94a3b8" }}
          >
            {CANONICAL_CONTACT_PROFILE.resumeSubtitle}
          </p>
        </div>
      </div>

      <a
        href={CANONICAL_CONTACT_PROFILE.resumeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all duration-200 group"
        style={{
          background: isLight
            ? "linear-gradient(135deg, #1d4ed8, #2563eb)"
            : "linear-gradient(135deg, #0284c7, #2563eb)",
          color: "#ffffff",
          boxShadow: isLight
            ? "0 2px 8px rgba(37, 99, 235, 0.35)"
            : "0 2px 12px rgba(2, 132, 199, 0.4)",
        }}
      >
        <span>View Resume</span>
        <ExternalLink size={13} strokeWidth={2.2} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </a>
    </div>
  );
}

/**
 * LinkedInCard: Compact LinkedIn-style profile card matching website visual system
 */
function LinkedInCard({ isLight }: { isLight: boolean }) {
  return (
    <div
      className="rounded-2xl p-4 sm:p-5 transition-all duration-200 max-w-sm"
      style={{
        background: isLight ? "#ffffff" : "#282a2c",
        border: isLight ? "1px solid #dadce0" : "1px solid #3c4043",
        boxShadow: isLight
          ? "0 2px 8px -1px rgba(0, 0, 0, 0.08)"
          : "0 4px 16px -2px rgba(0, 0, 0, 0.4)",
      }}
    >
      <div className="flex items-start gap-3.5 mb-3.5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold select-none"
          style={{
            background: "#0A66C2",
            color: "#ffffff",
            boxShadow: "0 2px 8px rgba(10, 102, 194, 0.35)",
          }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <h4
            className="font-bold text-sm tracking-tight truncate mb-0.5"
            style={{ color: isLight ? "#1f1f1f" : "#f8fafc" }}
          >
            {CANONICAL_CONTACT_PROFILE.name}
          </h4>
          <p
            className="text-xs font-semibold leading-snug"
            style={{ color: isLight ? "#0A66C2" : "#38bdf8" }}
          >
            {CANONICAL_CONTACT_PROFILE.headline}
          </p>
          <p
            className="text-[11px] leading-relaxed mt-0.5 truncate"
            style={{ color: isLight ? "#64748b" : "#94a3b8" }}
          >
            {CANONICAL_CONTACT_PROFILE.currentRole}
          </p>
          <span
            className="inline-block text-[10px] mt-1 font-mono"
            style={{ color: isLight ? "#94a3b8" : "#64748b" }}
          >
            {CANONICAL_CONTACT_PROFILE.linkedinHandle}
          </span>
        </div>
      </div>

      <a
        href={CANONICAL_CONTACT_PROFILE.linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all duration-200 group"
        style={{
          background: "#0A66C2",
          color: "#ffffff",
          boxShadow: "0 2px 8px rgba(10, 102, 194, 0.35)",
        }}
      >
        <span>View LinkedIn Profile</span>
        <ExternalLink size={13} strokeWidth={2.2} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </a>
    </div>
  );
}

/**
 * PhoneCard: Explicit contact card with verified mobile number
 */
function PhoneCard({ isLight }: { isLight: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(CANONICAL_CONTACT_PROFILE.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="rounded-2xl p-4 sm:p-5 transition-all duration-200"
      style={{
        background: isLight ? "#ffffff" : "#282a2c",
        border: isLight ? "1px solid #dadce0" : "1px solid #3c4043",
        boxShadow: isLight
          ? "0 2px 8px -1px rgba(0, 0, 0, 0.08)"
          : "0 4px 16px -2px rgba(0, 0, 0, 0.4)",
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: isLight
              ? "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15))"
              : "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))",
            color: isLight ? "#059669" : "#34d399",
          }}
        >
          <Phone size={20} strokeWidth={2.2} />
        </div>
        <div>
          <span
            className="text-[10px] uppercase font-bold tracking-wider block leading-none mb-1"
            style={{ color: isLight ? "#64748b" : "#94a3b8" }}
          >
            Mobile
          </span>
          <a
            href={`tel:${CANONICAL_CONTACT_PROFILE.phone.replace(/\s+/g, "")}`}
            className="font-bold text-sm sm:text-base tracking-tight hover:underline inline-block"
            style={{ color: isLight ? "#1f1f1f" : "#f8fafc" }}
          >
            {CANONICAL_CONTACT_PROFILE.phone}
          </a>
        </div>
      </div>

      <p
        className="text-xs leading-relaxed mb-3.5"
        style={{ color: isLight ? "#475569" : "#94a3b8" }}
      >
        You can reach Vikram at the number above.
      </p>

      <div className="flex items-center gap-2">
        <a
          href={`tel:${CANONICAL_CONTACT_PROFILE.phone.replace(/\s+/g, "")}`}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all duration-200"
          style={{
            background: "linear-gradient(135deg, #059669, #10b981)",
            color: "#ffffff",
            boxShadow: "0 2px 8px rgba(16, 185, 129, 0.35)",
          }}
        >
          <Phone size={12} strokeWidth={2.4} />
          <span>Call Vikram</span>
        </a>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium tracking-tight transition-all duration-200 border cursor-pointer"
          style={{
            background: isLight ? "#ffffff" : "rgba(255, 255, 255, 0.08)",
            color: isLight ? "#334155" : "#e2e8f0",
            borderColor: isLight ? "#dadce0" : "#3c4043",
          }}
        >
          {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>
    </div>
  );
}

function getCardType(msg: ChatMessage): "resume" | "linkedin" | "phone" | "audio" | null {
  if (msg.card) return msg.card;
  if (msg.utilityIntent === "audio_journey" || msg.text.includes("podcast-style deep dive into my journey")) {
    return "audio";
  }
  if (msg.text.includes(CANONICAL_CONTACT_PROFILE.resumeUrl) || msg.text.includes("— Resume")) {
    return "resume";
  }
  if (msg.text.includes(CANONICAL_CONTACT_PROFILE.linkedinUrl) && msg.text.includes("View LinkedIn Profile")) {
    return "linkedin";
  }
  if (msg.text.includes(CANONICAL_CONTACT_PROFILE.phone) && msg.text.includes("You can reach Vikram")) {
    return "phone";
  }
  return null;
}

export function GeminiPromptBar({
  mode,
  isDocked: isDockedProp,
  isOpen: isOpenProp,
  onOpenChange,
  placement = "floating",
}: GeminiPromptBarProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isOpenProp !== undefined ? isOpenProp : internalOpen;
  const setIsOpen = (val: boolean) => {
    setInternalOpen(val);
    onOpenChange?.(val);
  };

  const [inputVal, setInputVal] = useState("");
  const [panelInputVal, setPanelInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [showContextChip, setShowContextChip] = useState(true);

  // Track when visitor scrolls down from hero section so resting AMA engine cleanly disappears
  const [isHeroScrolled, setIsHeroScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const sy = window.scrollY;
      if (!isHeroScrolled && sy > 45) {
        setIsHeroScrolled(true);
      } else if (isHeroScrolled && sy < 25) {
        setIsHeroScrolled(false);
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHeroScrolled]);

  // Scroll listener fallback if isDockedProp not passed
  const [internalDocked, setInternalDocked] = useState(false);
  useEffect(() => {
    if (isDockedProp !== undefined) return;
    const handleScroll = () => {
      const sy = window.scrollY;
      const workEl = document.getElementById("work");
      const workTop = workEl ? workEl.getBoundingClientRect().top + window.scrollY : 750;
      const dockThreshold = Math.max(220, workTop - 500);

      if (!internalDocked && sy >= dockThreshold) {
        setInternalDocked(true);
      } else if (internalDocked && sy < dockThreshold - 40) {
        setInternalDocked(false);
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [internalDocked, isDockedProp]);

  const docked = isDockedProp !== undefined ? isDockedProp : internalDocked;

  const inputRef = useRef<HTMLInputElement>(null);
  const dockedInputRef = useRef<HTMLInputElement>(null);
  const sideInputRef = useRef<HTMLInputElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isLight = mode === "light";
  const isInline = placement === "inline";
  const isActive = isFocused || isOpen || isListening;
  const waveState = isLoading
    ? "analyzing"
    : isListening || isFocused || inputVal.length > 0
    ? "listening"
    : "idle";

  useEffect(() => {
    document.documentElement.classList.toggle("ama-engine-active", isActive);
    return () => document.documentElement.classList.remove("ama-engine-active");
  }, [isActive]);

  // Focus side panel input automatically when panel opens
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (isOpen && !isMobile) {
      setTimeout(() => {
        sideInputRef.current?.focus({ preventScroll: true });
      }, 150);
    }
  }, [isOpen]);

  // Animate conic glow angle smoothly
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

  // Auto scroll messages inside side panel
  useEffect(() => {
    if (isOpen && chatBodyRef.current) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.role === "model" && (lastMsg.card === "audio" || lastMsg.utilityIntent === "audio_journey")) {
        const lastEl = chatBodyRef.current.lastElementChild as HTMLElement;
        if (lastEl) {
          lastEl.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
      }
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isOpen, isLoading]);

  // Handle ESC key to close side panel
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
    const prompt = (textToSend || panelInputVal || inputVal).trim();
    if (!prompt || isLoading) return;

    if (window.matchMedia("(max-width: 767px)").matches) {
      inputRef.current?.blur();
      dockedInputRef.current?.blur();
      sideInputRef.current?.blur();
      setIsFocused(false);
    }

    setInputVal("");
    setPanelInputVal("");
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
        card: response.card,
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

  const handleMobileClose = () => {
    setInputVal("");
    setIsFocused(false);
    inputRef.current?.blur();
    setIsOpen(false);
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
        if (isOpen) {
          setPanelInputVal(transcript);
        } else {
          setInputVal(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        setStatusNotice(null);
      };

      recognition.onend = () => {
        setIsListening(false);
        setStatusNotice(null);
        if (isOpen) {
          sideInputRef.current?.focus({ preventScroll: true });
        } else {
          inputRef.current?.focus({ preventScroll: true });
        }
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
    <>
      {isActive && (
        <div
          className="ama-mobile-active-backdrop"
          style={{
            background: isLight ? "rgba(248, 250, 252, 0.52)" : "rgba(8, 11, 20, 0.58)",
          }}
          aria-hidden="true"
        />
      )}

      {isActive && (
        <button
          type="button"
          className="ama-mobile-close"
          onClick={handleMobileClose}
          aria-label="Close Ask Vikram"
          title="Close Ask Vikram"
        >
          <X size={20} strokeWidth={2.2} />
        </button>
      )}

      {/* ── MOBILE / TABLET OVERLAY BACKDROP ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[95] bg-slate-900/15 dark:bg-black/35 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── ASK VIKRAM RIGHT SIDE PANEL (FROSTED GLASS CARD MATCHING USER MOCKUP) ── */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Ask Vikram Side Panel"
        aria-modal="true"
        className={`fixed top-2 bottom-2 right-2 sm:top-3 sm:bottom-3 sm:right-3.5 z-[100] w-[calc(100%-16px)] sm:w-[430px] md:w-[440px] flex flex-col rounded-[28px] sm:rounded-[32px] overflow-hidden transition-all duration-350 ease-out ${
          isOpen
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "translate-x-[110%] opacity-0 pointer-events-none"
        }`}
        style={{
          background: isLight
            ? "rgba(255, 255, 255, 0.75)"
            : "rgba(18, 24, 34, 0.82)",
          backdropFilter: "blur(32px) saturate(190%)",
          WebkitBackdropFilter: "blur(32px) saturate(190%)",
          border: isLight
            ? "1px solid rgba(255, 255, 255, 0.85)"
            : "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: isLight
            ? "0 24px 60px -12px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.95)"
            : "0 28px 70px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.12)",
        }}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between px-5 pt-4.5 pb-3.5 shrink-0 select-none border-b border-black/[0.04] dark:border-white/[0.06]">
          {/* Left Title with sparkle and subtitle */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                <path
                  d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4772 12 22C12 16.4772 16.4772 12 22 12C16.4772 12 12 7.52285 12 2Z"
                  fill="url(#gemini-panel-sparkle)"
                />
                <defs>
                  <linearGradient id="gemini-panel-sparkle" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#2563eb" />
                    <stop offset="0.5" stopColor="#3b82f6" />
                    <stop offset="1" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[17px] font-bold tracking-tight"
                  style={{ color: isLight ? "#0f172a" : "#f8fafc" }}
                >
                  Ask Vikram
                </span>
              </div>
              <p
                className="text-[11.5px] font-normal leading-tight mt-0.5"
                style={{ color: isLight ? "#64748b" : "#94a3b8" }}
              >
                Thoughtful answers. Real experience.
              </p>
            </div>
          </div>

          {/* Right Header Action Icons: clear conversation, close */}
          <div className="flex items-center gap-1.5 relative">
            <button
              type="button"
              onClick={handleClearChat}
              title="Clear conversation"
              aria-label="Clear conversation"
              className="w-8 h-8 rounded-full border flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all cursor-pointer hover:scale-105"
              style={{
                background: isLight ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 255, 255, 0.08)",
                borderColor: isLight ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.1)",
              }}
            >
              <Trash2 size={15} className="text-slate-500 dark:text-slate-300" />
            </button>

            {/* Close ✕ button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              title="Close side panel (Esc)"
              aria-label="Close side panel"
              className="w-8 h-8 rounded-full border flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all cursor-pointer hover:scale-105"
              style={{
                background: isLight ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 255, 255, 0.08)",
                borderColor: isLight ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.1)",
              }}
            >
              <X size={16} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* Panel Scrollable Body */}
        <div ref={chatBodyRef} className="flex-1 overflow-y-auto gemini-scrollbar px-4 sm:px-5 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col justify-start pt-4 pb-2">
              <div className="mb-5">
                <h2
                  className="text-[24px] sm:text-[26px] font-normal tracking-tight mb-1"
                  style={{ color: isLight ? "#1d4ed8" : "#93c5fd" }}
                >
                  Hi, I'm Vikram,
                </h2>
                <p
                  className="text-[19px] sm:text-[21px] font-normal leading-snug"
                  style={{ color: isLight ? "#0f172a" : "#f1f5f9" }}
                >
                  Ask me anything
                </p>
              </div>

              {/* Suggestions header row */}
              <div className="flex items-center justify-between px-1 mb-2.5">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                  <Sparkles size={13} className="text-blue-500" />
                  <span>Suggested questions</span>
                </div>
                <span className="text-[11px] text-slate-400">Try one of these</span>
              </div>

              {/* Suggestions */}
              <div className="flex flex-col gap-2 w-full">
                {SIDE_PANEL_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSend(suggestion)}
                    className="w-full text-left px-3.5 py-2.5 rounded-full text-[13px] font-medium transition-all duration-200 cursor-pointer flex items-center justify-between group shadow-sm hover:shadow-md hover:scale-[1.01]"
                    style={{
                      background: isLight ? "rgba(255, 255, 255, 0.65)" : "rgba(30, 36, 48, 0.65)",
                      backdropFilter: "blur(14px)",
                      WebkitBackdropFilter: "blur(14px)",
                      color: isLight ? "#1e293b" : "#f1f5f9",
                      border: isLight ? "1px solid rgba(255, 255, 255, 0.85)" : "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isLight ? "rgba(255, 255, 255, 0.95)" : "rgba(38, 46, 62, 0.85)";
                      e.currentTarget.style.borderColor = isLight ? "#3b82f6" : "#60a5fa";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isLight ? "rgba(255, 255, 255, 0.65)" : "rgba(30, 36, 48, 0.65)";
                      e.currentTarget.style.borderColor = isLight ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.1)";
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      {getSuggestionIcon(suggestion)}
                      <span className="truncate">{suggestion}</span>
                    </div>
                    <ChevronRight size={15} className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const cardType = msg.role === "model" ? getCardType(msg) : null;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} w-full`}
                  >
                    {msg.role === "user" ? (
                      <div
                        className="max-w-[88%] rounded-[20px] rounded-br-[6px] px-4 py-2.5 text-[13.5px] font-medium leading-snug flex items-center gap-2.5 shadow-md shadow-blue-500/25 select-none"
                        style={{
                          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                          color: "#ffffff",
                        }}
                      >
                        <span className="flex-1 !text-white">{msg.text}</span>
                        <div className="w-5 h-5 rounded-full border border-white/40 flex items-center justify-center shrink-0">
                          <User size={12} className="text-white" />
                        </div>
                      </div>
                    ) : cardType === "audio" ? (
                      <div className="w-full max-w-[98%] space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div
                          className="w-full rounded-[24px] p-4 text-[13.5px] leading-relaxed shadow-sm border"
                          style={{
                            background: isLight ? "rgba(255, 255, 255, 0.65)" : "rgba(30, 36, 48, 0.65)",
                            backdropFilter: "blur(16px)",
                            WebkitBackdropFilter: "blur(16px)",
                            borderColor: isLight ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.1)",
                            color: isLight ? "#1e293b" : "#f1f5f9",
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-7 h-7 rounded-full bg-blue-100/70 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                              <Sparkles size={14} />
                            </div>
                            <div className="flex-1 space-y-2">
                              {formatMessageText(msg.text)}
                            </div>
                          </div>
                        </div>
                        <AudioStoryCard
                          isLight={isLight}
                          onSelectPrompt={(prompt) => handleSend(prompt)}
                        />
                      </div>
                    ) : cardType === "resume" ? (
                      <div className="w-full max-w-[95%] animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <ResumeCard isLight={isLight} />
                      </div>
                    ) : cardType === "linkedin" ? (
                      <div className="w-full max-w-[95%] animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <LinkedInCard isLight={isLight} />
                      </div>
                    ) : cardType === "phone" ? (
                      <div className="w-full max-w-[95%] animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <PhoneCard isLight={isLight} />
                      </div>
                    ) : (
                      <div className="flex flex-col items-start gap-2 w-full">
                        <div
                          className="w-full rounded-[24px] p-4 text-[13.5px] leading-relaxed shadow-sm border"
                          style={{
                            background: isLight ? "rgba(255, 255, 255, 0.65)" : "rgba(30, 36, 48, 0.65)",
                            backdropFilter: "blur(16px)",
                            WebkitBackdropFilter: "blur(16px)",
                            borderColor: isLight ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.1)",
                            color: isLight ? "#1e293b" : "#f1f5f9",
                            ["--gemini-bold" as any]: isLight ? "#0f172a" : "#ffffff",
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-7 h-7 rounded-full bg-blue-100/70 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                              <Sparkles size={14} />
                            </div>
                            <div className="flex-1 space-y-2">
                              {formatMessageText(msg.text)}
                            </div>
                          </div>
                        </div>

                        {/* Contextual Career Audio Action */}
                        {msg.role === "model" &&
                          !cardType &&
                          (msg.text.includes("consistent thread in my career") ||
                            msg.text.includes("Looking back across my career") ||
                            msg.text.includes("translating complex technology into experiences people can understand") ||
                            msg.text.includes("across my career, the consistent thread")) && (
                            <button
                              type="button"
                              onClick={() => handleSend("🎧 Tell me your story — audio")}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 active:scale-95 cursor-pointer shadow-2xs"
                              style={{
                                background: isLight ? "rgba(255, 255, 255, 0.8)" : "rgba(30, 36, 48, 0.8)",
                                borderColor: isLight ? "#bfdbfe" : "#1e3a8a",
                                color: isLight ? "#2563eb" : "#93c5fd",
                              }}
                            >
                              <span>🎧</span>
                              <span>Listen to the full story</span>
                            </button>
                          )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Suggested Questions Section (Matching User Mockup) */}
              {!isLoading && (
                <div className="pt-2 pb-1 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                      <Sparkles size={13} className="text-blue-500" />
                      <span>Suggested questions</span>
                    </div>
                    <span className="text-[11px] text-slate-400">Try one of these</span>
                  </div>

                  <div className="flex flex-col gap-2 w-full">
                    {getContextualSuggestions(messages).map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleSend(suggestion)}
                        className="w-full text-left px-3.5 py-2.5 rounded-full text-[13px] font-medium transition-all duration-200 cursor-pointer flex items-center justify-between group shadow-sm hover:shadow-md hover:scale-[1.01]"
                        style={{
                          background: isLight ? "rgba(255, 255, 255, 0.65)" : "rgba(30, 36, 48, 0.65)",
                          backdropFilter: "blur(14px)",
                          WebkitBackdropFilter: "blur(14px)",
                          color: isLight ? "#1e293b" : "#f1f5f9",
                          border: isLight ? "1px solid rgba(255, 255, 255, 0.85)" : "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = isLight ? "rgba(255, 255, 255, 0.95)" : "rgba(38, 46, 62, 0.85)";
                          e.currentTarget.style.borderColor = isLight ? "#3b82f6" : "#60a5fa";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isLight ? "rgba(255, 255, 255, 0.65)" : "rgba(30, 36, 48, 0.65)";
                          e.currentTarget.style.borderColor = isLight ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.1)";
                        }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          {getSuggestionIcon(suggestion)}
                          <span className="truncate">{suggestion}</span>
                        </div>
                        <ChevronRight size={15} className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isLoading && (
                <div
                  className="flex items-center gap-3 text-xs py-3 px-4 rounded-[20px] max-w-xs shadow-sm border"
                  style={{
                    background: isLight ? "rgba(255, 255, 255, 0.7)" : "rgba(30, 36, 48, 0.7)",
                    borderColor: isLight ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.1)",
                    color: isLight ? "#475569" : "#cbd5e1",
                  }}
                >
                  <span className="inline-block animate-spin text-blue-500 font-bold">✦</span>
                  <span className="font-normal">Grounded reasoning with Gemini...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Docked Bottom Input Area (Exact replica of mockup) */}
        <div className="p-4 pt-2 shrink-0">
          {/* Active Context Chip if applicable */}
          {showContextChip && (
            <div
              className="mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-normal border shadow-2xs select-none"
              style={{
                background: isLight ? "rgba(241, 245, 249, 0.85)" : "rgba(30, 41, 59, 0.85)",
                borderColor: isLight ? "rgba(226, 232, 240, 0.8)" : "rgba(51, 65, 85, 0.8)",
                color: isLight ? "#334155" : "#e2e8f0",
              }}
            >
              <Globe size={11} className="text-blue-500" />
              <span className="truncate max-w-[200px]">Sharing &ldquo;Vikram Venkatesh — AI Product Design Leader&rdquo;</span>
              <button
                type="button"
                onClick={() => setShowContextChip(false)}
                className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer shrink-0"
                title="Dismiss context"
              >
                <X size={11} />
              </button>
            </div>
          )}

          {/* Pill Input Capsule */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full border shadow-md transition-all duration-200"
            style={{
              background: isLight ? "rgba(255, 255, 255, 0.78)" : "rgba(28, 34, 46, 0.82)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              borderColor: isLight ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.12)",
              boxShadow: isLight
                ? "0 8px 24px -4px rgba(15, 23, 42, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.9)"
                : "0 8px 24px -4px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
            }}
          >
            <input
              ref={sideInputRef}
              type="text"
              value={panelInputVal}
              onChange={(e) => setPanelInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(panelInputVal);
                }
              }}
              placeholder={messages.length === 0 ? "Ask Vikram anything..." : "Ask a follow up..."}
              className="flex-1 bg-transparent border-none outline-none text-[13.5px] font-normal"
              style={{
                color: isLight ? "#0f172a" : "#f8fafc",
                caretColor: isLight ? "#2563eb" : "#60a5fa",
              }}
              aria-label="Ask a follow up"
            />

            {/* Right Action Icons: voice input and send */}
            <div className="flex items-center gap-1 shrink-0 text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={handleMicClick}
                title={isListening ? "Stop listening" : "Voice input"}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  isListening
                    ? "bg-red-500/20 text-red-500 animate-pulse"
                    : "hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400"
                }`}
              >
                <Mic size={15} />
              </button>
              <button
                type="button"
                onClick={() => handleSend(panelInputVal)}
                disabled={isLoading || !panelInputVal.trim()}
                title="Send prompt"
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center transition-transform active:scale-95 cursor-pointer shadow-md shadow-blue-500/30 ml-1 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                <ArrowUp size={16} strokeWidth={2.4} />
              </button>
            </div>
          </div>

          {/* Footer Attribution (Exact replica) */}
          <div className="mt-2.5 text-center text-[10.5px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5 select-none">
            <span className="opacity-60">—</span>
            <span>Powered by Gemini</span>
            <span className="opacity-60">•</span>
            <span>Grounded in real experience</span>
            <span className="opacity-60">—</span>
          </div>
        </div>
      </div>

      {/* ── STATUS NOTICE TOOLTIP / SPEECH FEEDBACK ── */}
      {statusNotice && (
        <div
          className={`fixed pointer-events-auto z-[90] text-xs font-medium px-3.5 py-1.5 rounded-full border shadow-sm animate-in fade-in ${
            docked ? "top-[60px] left-[32px] sm:left-[32px]" : "bottom-[96px] left-1/2 -translate-x-1/2"
          }`}
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

      {/* ── 1. HERO RESTING CLUSTER (Disappears cleanly on scroll from hero) ── */}
      <div
        className={`ama-hero-cluster ${isInline ? "ama-inline-cluster" : ""} ${
          isActive ? "ama-hero-cluster-active" : ""
        } ${
          (isInline || ((!isHeroScrolled && !docked) || (docked && isFocused))) && !isOpen
            ? "ama-hero-cluster-visible"
            : "ama-hero-cluster-hidden"
        }`}
      >
        {!isInline && (
          <div className={`ama-suggestion-row ${isActive ? "ama-suggestion-row-active" : ""} pointer-events-auto flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-2.5 relative z-20`}>
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleSend(chip);
                }}
                onClick={(e) => {
                  if (e.detail === 0) {
                    handleSend(chip);
                  }
                }}
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

        {/* Hero 68px Command Bar Box */}
        <div className="ama-hero-bar-box">
          {/* Command Bar Wrapper with Conic Glow on Active */}
          <div ref={wrapperRef} className="command-bar-wrapper w-full h-full relative">
            {!isHeroScrolled && !docked && !isOpen && (
              <div className={`conic-glow-layer ${isActive ? "conic-glow-layer-active" : ""}`} aria-hidden="true" />
            )}

            {/* Command Bar */}
            <div
              className={`command-bar ${isFocused || isActive ? "command-bar--focused" : ""}`}
              onClick={() => {
                inputRef.current?.focus({ preventScroll: true });
              }}
            >
              {/* Formatted Placeholder & Input */}
              <div className="relative flex-1 flex items-center min-w-0 h-full">
                {!inputVal && (
                  <div className="pointer-events-none absolute left-0 right-0 flex items-center text-[15px] sm:text-[16px] tracking-tight select-none z-10 overflow-hidden text-ellipsis whitespace-nowrap font-normal command-bar-placeholder-text">
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

                <input
                  ref={inputRef}
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
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

              {/* Action buttons: Voice mic and submit arrow */}
              <div className="flex items-center gap-1.5 sm:gap-2 relative z-20 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMicClick();
                  }}
                  title={isListening ? "Stop listening" : "Ask with voice"}
                  aria-label={isListening ? "Stop listening" : "Ask with voice"}
                  className={`mic-button p-1.5 sm:p-2 rounded-full transition-all duration-200 cursor-pointer ${
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
                  <ArrowUp size={20} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Subtitle helper text below AMA engine */}
        <div
          className="text-center text-[11px] sm:text-xs font-normal tracking-wide mt-1.5 select-none transition-colors relative z-20"
          style={{
            color: isLight ? "rgba(71, 85, 105, 0.85)" : "rgba(148, 163, 184, 0.75)",
          }}
        >
          AI companion • Based on my work &amp; stories
        </div>
      </div>

      {/* ── 2. TOP DOCKED SEARCH BAR (Appears at the top with the menu before "My work") ── */}
      <div
        className={`ama-docked-container ${
          docked && !isOpen ? "ama-docked-visible" : "ama-docked-hidden"
        }`}
      >
        <div className="command-bar-wrapper w-full h-full relative">
          <div
            className="command-bar"
            onClick={() => {
              dockedInputRef.current?.focus({ preventScroll: true });
            }}
          >
            <div className="relative flex-1 flex items-center min-w-0 h-full">
              {!inputVal && (
                <div className="pointer-events-none absolute left-0 right-0 flex items-center text-[13.5px] tracking-tight select-none z-10 overflow-hidden text-ellipsis whitespace-nowrap font-normal command-bar-placeholder-text">
                  <span
                    className="truncate"
                    style={{ color: isLight ? "#64748b" : "#94a3b8" }}
                  >
                    Ask me anything
                  </span>
                </div>
              )}

              <input
                ref={dockedInputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend(inputVal);
                  }
                }}
                className="w-full bg-transparent border-none outline-none text-[13.5px] font-normal relative z-20"
                style={{
                  color: isLight ? "#070e24" : "#f8fafc",
                  caretColor: isLight ? "#7c3aed" : "#a855f7",
                }}
                aria-label="Ask Vikram search bar"
              />
            </div>

            <div className="flex items-center gap-1.5 relative z-20 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMicClick();
                }}
                title={isListening ? "Stop listening" : "Ask with voice"}
                className="mic-button"
              >
                <Mic size={15} strokeWidth={2} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSend(inputVal);
                }}
                disabled={!inputVal.trim() || isLoading}
                title="Send query"
                className="submit-button"
              >
                <ArrowUp size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
