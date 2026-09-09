import React, { useState, useRef, useEffect } from "react";
import {
  AUDIO_STORY_METADATA,
  AUDIO_CHAPTERS,
  AUDIO_FOLLOW_UP_PROMPTS,
  CLEANED_TRANSCRIPT_PARAGRAPHS,
} from "../knowledge/audioStoryData";

interface AudioStoryCardProps {
  isLight: boolean;
  onSelectPrompt?: (prompt: string) => void;
}

export function AudioStoryCard({ isLight, onSelectPrompt }: AudioStoryCardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(AUDIO_STORY_METADATA.estimatedSeconds);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);

  // Accordion views
  const [showTranscript, setShowTranscript] = useState(false);
  const [showChapters, setShowChapters] = useState(false);

  // Synchronize with underlying audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      if (!isScrubbing) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [isScrubbing]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => {
        console.warn("Audio playback prevented or failed:", err);
      });
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const nextMute = !isMuted;
      audioRef.current.muted = nextMute;
      setIsMuted(nextMute);
    }
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setScrubValue(val);
    setCurrentTime(val);
  };

  const handleScrubberStart = () => {
    setIsScrubbing(true);
  };

  const handleScrubberEnd = () => {
    setIsScrubbing(false);
    if (audioRef.current) {
      audioRef.current.currentTime = scrubValue;
    }
  };

  const seekToChapter = (startTime?: number) => {
    if (typeof startTime === "number" && audioRef.current) {
      audioRef.current.currentTime = startTime;
      setCurrentTime(startTime);
      if (!isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div
      className={`w-full rounded-2xl border transition-all duration-300 overflow-hidden shadow-lg ${
        isLight
          ? "bg-white/80 border-slate-200/90 text-slate-900 shadow-slate-900/5 backdrop-blur-md"
          : "bg-slate-900/80 border-white/10 text-slate-100 shadow-black/40 backdrop-blur-md"
      }`}
      style={{
        boxShadow: isLight
          ? "0 8px 32px -4px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)"
          : "0 12px 40px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
      }}
    >
      {/* Semantic Audio Element - strictly metadata preload, canonical /about-vikram.mp3 */}
      <audio
        ref={audioRef}
        src={AUDIO_STORY_METADATA.src}
        preload="metadata"
        aria-label={AUDIO_STORY_METADATA.accessibleLabel}
      />

      {/* ── CARD HEADER & EDITORIAL HIERARCHY ── */}
      <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-widest uppercase border"
              style={{
                color: isLight ? "#2563eb" : "#60a5fa",
                backgroundColor: isLight ? "rgba(37, 99, 235, 0.06)" : "rgba(96, 165, 250, 0.12)",
                borderColor: isLight ? "rgba(37, 99, 235, 0.2)" : "rgba(96, 165, 250, 0.25)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              {AUDIO_STORY_METADATA.supertitle}
            </span>
            <span
              className="text-[11px] font-medium tracking-wide"
              style={{ color: isLight ? "#64748b" : "#94a3b8" }}
            >
              {AUDIO_STORY_METADATA.durationLabel}
            </span>
          </div>

          {/* Quick Audio Indicator Badge */}
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium"
            style={{
              color: isLight ? "#475569" : "#94a3b8",
              backgroundColor: isLight ? "rgba(0, 0, 0, 0.04)" : "rgba(255, 255, 255, 0.05)",
            }}
          >
            <svg
              className="w-3.5 h-3.5 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z"
              />
            </svg>
            <span>Podcast Deep Dive</span>
          </div>
        </div>

        <h3 className="text-base sm:text-lg font-semibold tracking-tight leading-snug">
          {AUDIO_STORY_METADATA.title}
        </h3>
        <p
          className="text-xs sm:text-sm mt-1.5 leading-relaxed"
          style={{ color: isLight ? "#475569" : "#94a3b8" }}
        >
          {AUDIO_STORY_METADATA.subtitle}
        </p>
      </div>

      {/* ── PLAYER CONTROLS & SCRUBBER ── */}
      <div className="p-4 sm:p-6 pt-3 sm:pt-4 bg-gradient-to-b from-transparent to-black/[0.02] dark:to-white/[0.02]">
        {/* Progress Bar / Scrubber */}
        <div className="space-y-1.5 mb-4">
          <div className="relative flex items-center group">
            {/* Custom Background Track */}
            <div
              className="w-full h-1.5 rounded-full overflow-hidden transition-all duration-150"
              style={{
                backgroundColor: isLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.12)",
              }}
            >
              {/* Fill Progress */}
              <div
                className="h-full rounded-full transition-all duration-75"
                style={{
                  width: `${progressPercent}%`,
                  background: isLight
                    ? "linear-gradient(90deg, #2563eb, #3b82f6)"
                    : "linear-gradient(90deg, #3b82f6, #60a5fa)",
                }}
              />
            </div>

            {/* Native range input overlay for seamless accessible scrubbing */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.5}
              value={currentTime}
              onChange={handleScrubberChange}
              onMouseDown={handleScrubberStart}
              onMouseUp={handleScrubberEnd}
              onTouchStart={handleScrubberStart}
              onTouchEnd={handleScrubberEnd}
              aria-label="Audio scrubber"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Timestamps */}
          <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
            <span style={{ color: isLight ? "#334155" : "#cbd5e1" }}>
              {formatTime(currentTime)}
            </span>
            <span style={{ color: isLight ? "#64748b" : "#94a3b8" }}>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={togglePlayPause}
              aria-label={AUDIO_STORY_METADATA.accessibleLabel}
              className="relative inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full transition-all duration-200 shadow-md active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              style={{
                backgroundColor: isLight ? "#0f172a" : "#ffffff",
                color: isLight ? "#ffffff" : "#0f172a",
              }}
            >
              {isPlaying ? (
                /* Pause Icon */
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                /* Play Icon */
                <svg className="w-5 h-5 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Jump -15s / +15s (Optional subtle controls) */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15);
                  }
                }}
                title="Rewind 15 seconds"
                aria-label="Rewind 15 seconds"
                className="p-1.5 rounded-lg text-xs transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
                style={{ color: isLight ? "#64748b" : "#94a3b8" }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 15);
                  }
                }}
                title="Forward 15 seconds"
                aria-label="Forward 15 seconds"
                className="p-1.5 rounded-lg text-xs transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
                style={{ color: isLight ? "#64748b" : "#94a3b8" }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Secondary Controls: Speed, Volume, Section Toggles */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Playback Speed Pill */}
            <button
              type="button"
              onClick={cyclePlaybackRate}
              aria-label={`Playback speed ${playbackRate}x`}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide border transition-all hover:border-blue-500/40 active:scale-95"
              style={{
                borderColor: isLight ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.12)",
                color: playbackRate > 1 ? (isLight ? "#2563eb" : "#60a5fa") : (isLight ? "#475569" : "#cbd5e1"),
                backgroundColor: isLight ? "rgba(0, 0, 0, 0.03)" : "rgba(255, 255, 255, 0.04)",
              }}
            >
              {playbackRate}×
            </button>

            {/* Mute/Volume Toggle */}
            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute" : "Mute"}
              className="p-1.5 rounded-md text-xs transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.08]"
              style={{ color: isLight ? "#64748b" : "#94a3b8" }}
            >
              {isMuted ? (
                <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Secondary Navigation Row: Transcript & Chapters */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-black/[0.05] dark:border-white/[0.06] text-xs">
          <button
            type="button"
            onClick={() => {
              setShowTranscript(!showTranscript);
              if (!showTranscript) setShowChapters(false);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              showTranscript
                ? isLight
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : "bg-blue-950/40 text-blue-400 border border-blue-500/30"
                : isLight
                ? "bg-slate-100/70 hover:bg-slate-100 text-slate-700 border border-transparent"
                : "bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 border border-transparent"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{showTranscript ? "Hide transcript" : "Read transcript"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowChapters(!showChapters);
              if (!showChapters) setShowTranscript(false);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              showChapters
                ? isLight
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : "bg-blue-950/40 text-blue-400 border border-blue-500/30"
                : isLight
                ? "bg-slate-100/70 hover:bg-slate-100 text-slate-700 border border-transparent"
                : "bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 border border-transparent"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span>{showChapters ? "Hide chapters" : "Explore chapters"}</span>
          </button>
        </div>
      </div>

      {/* ── EXPANDABLE: INLINE TRANSCRIPT ── */}
      {showTranscript && (
        <div
          className="p-4 sm:p-6 border-t border-black/[0.06] dark:border-white/[0.06] animate-in fade-in duration-200"
          style={{
            backgroundColor: isLight ? "rgba(248, 250, 252, 0.7)" : "rgba(15, 23, 42, 0.5)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h4
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: isLight ? "#475569" : "#94a3b8" }}
            >
              Cleaned & Approved Audio Transcript
            </h4>
            <span className="text-[11px]" style={{ color: isLight ? "#94a3b8" : "#64748b" }}>
              Editorial Edition
            </span>
          </div>

          <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {CLEANED_TRANSCRIPT_PARAGRAPHS.map((para, idx) => (
              <p
                key={idx}
                style={{ color: isLight ? "#334155" : "#cbd5e1" }}
              >
                {para.text}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* ── EXPANDABLE: CHAPTER BREAKDOWN ── */}
      {showChapters && (
        <div
          className="p-4 sm:p-6 border-t border-black/[0.06] dark:border-white/[0.06] animate-in fade-in duration-200"
          style={{
            backgroundColor: isLight ? "rgba(248, 250, 252, 0.7)" : "rgba(15, 23, 42, 0.5)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h4
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: isLight ? "#475569" : "#94a3b8" }}
            >
              Story Chapters
            </h4>
            <span className="text-[11px]" style={{ color: isLight ? "#94a3b8" : "#64748b" }}>
              6 Sections
            </span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {AUDIO_CHAPTERS.map((ch) => (
              <div
                key={ch.id}
                onClick={() => seekToChapter(ch.startTime)}
                className={`p-3 rounded-xl border transition-all text-left ${
                  ch.startTime !== undefined ? "cursor-pointer hover:border-blue-500/40" : ""
                } ${
                  isLight
                    ? "bg-white/60 border-slate-200/80"
                    : "bg-white/[0.03] border-white/[0.06]"
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div className="text-xs font-semibold flex items-center gap-2">
                    <span
                      className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: isLight ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.08)",
                        color: isLight ? "#2563eb" : "#60a5fa",
                      }}
                    >
                      {ch.number}
                    </span>
                    <span style={{ color: isLight ? "#0f172a" : "#f1f5f9" }}>{ch.title}</span>
                  </div>
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: isLight ? "#64748b" : "#94a3b8" }}
                  >
                    {ch.subtitle}
                  </span>
                </div>
                <p
                  className="text-[11px] sm:text-xs mt-1 leading-normal"
                  style={{ color: isLight ? "#64748b" : "#94a3b8" }}
                >
                  {ch.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FOLLOW-UP SUGGESTION PILLS ── */}
      <div
        className="p-3 sm:p-4 border-t border-black/[0.06] dark:border-white/[0.06]"
        style={{
          backgroundColor: isLight ? "rgba(0, 0, 0, 0.015)" : "rgba(255, 255, 255, 0.02)",
        }}
      >
        <p
          className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold mb-2"
          style={{ color: isLight ? "#64748b" : "#94a3b8" }}
        >
          Ask Vikram a follow-up:
        </p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {AUDIO_FOLLOW_UP_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt?.(prompt)}
              className={`text-xs px-3 py-1.5 rounded-full border text-left transition-all duration-150 active:scale-95 ${
                isLight
                  ? "bg-white hover:bg-slate-50 border-slate-200/90 text-slate-700 hover:border-blue-500/40 hover:text-blue-600 shadow-sm"
                  : "bg-white/[0.05] hover:bg-white/[0.09] border-white/10 text-slate-200 hover:border-blue-400/40 hover:text-blue-300"
              }`}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
