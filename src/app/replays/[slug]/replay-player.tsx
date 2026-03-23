"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Zap,
  Terminal,
  FileCode,
  MessageSquare,
  AlertCircle,
  GitCommitHorizontal,
  ChevronRight,
} from "lucide-react";
import type { EventsFile, ManifestChapter, ManifestKeyMoment } from "@/data/replays";
import { formatDurationMs } from "@/data/replays";

// ── Types ──

interface ReplayEvent {
  id: string;
  timestamp: string;
  source: string;
  kind: string;
  [key: string]: unknown;
}

// ── Phase colors ──

const PHASE_COLORS: Record<string, string> = {
  idle: "text-muted",
  thinking: "text-purple-400",
  coding: "text-lime",
  testing: "text-yellow-400",
  reviewing: "text-blue-400",
  committing: "text-lime",
  waiting: "text-muted",
};

// ── Event display helpers ──

function eventIcon(kind: string): React.ReactNode {
  switch (kind) {
    case "user_message":
      return <MessageSquare className="h-3 w-3 text-blue-400" />;
    case "agent_message":
      return <MessageSquare className="h-3 w-3 text-lime" />;
    case "agent_tool_use":
      return <Terminal className="h-3 w-3 text-yellow-400" />;
    case "agent_tool_result":
      return <ChevronRight className="h-3 w-3 text-muted" />;
    case "file_created":
    case "file_modified":
    case "file_deleted":
      return <FileCode className="h-3 w-3 text-cyan-400" />;
    case "git_commit":
      return <GitCommitHorizontal className="h-3 w-3 text-lime" />;
    case "phase_change":
      return <Zap className="h-3 w-3 text-purple-400" />;
    case "error":
      return <AlertCircle className="h-3 w-3 text-red-400" />;
    default:
      return <ChevronRight className="h-3 w-3 text-muted/40" />;
  }
}

function eventSummary(event: ReplayEvent): string {
  switch (event.kind) {
    case "user_message":
      return String(event.text ?? "").slice(0, 120);
    case "agent_message":
      return String(event.text ?? "").slice(0, 120);
    case "agent_tool_use":
      return `${event.toolName}${event.input ? summarizeInput(event) : ""}`;
    case "agent_tool_result":
      return event.isError ? `Error: ${String(event.output ?? "").slice(0, 80)}` : String(event.output ?? "").slice(0, 80);
    case "agent_thinking":
      return String(event.text ?? "").slice(0, 80);
    case "phase_change":
      return `Phase: ${event.phase}`;
    case "file_created":
      return `Created ${event.relativePath || event.filePath}`;
    case "file_modified":
      return `Modified ${event.relativePath || event.filePath}`;
    case "file_deleted":
      return `Deleted ${event.relativePath || event.filePath}`;
    case "git_commit":
      return `Commit: ${String(event.message ?? "").slice(0, 80)}`;
    default:
      return event.kind;
  }
}

function summarizeInput(event: ReplayEvent): string {
  const input = event.input as Record<string, unknown> | undefined;
  if (!input) return "";
  if (input.file_path) return ` ${String(input.file_path).split(/[\\/]/).pop()}`;
  if (input.command) return ` ${String(input.command).slice(0, 60)}`;
  if (input.pattern) return ` ${input.pattern}`;
  return "";
}

function isSignificantEvent(kind: string): boolean {
  return [
    "user_message", "agent_message", "agent_tool_use",
    "phase_change", "git_commit", "file_created",
    "file_modified", "error",
  ].includes(kind);
}

// ── Playback speed ──

function getPlaybackDelay(current: ReplayEvent, next: ReplayEvent, speed: number): number {
  const gapMs = new Date(next.timestamp).getTime() - new Date(current.timestamp).getTime();
  // Compress idle gaps, keep busy periods near real-time
  if (gapMs < 1000) return 100 / speed;
  if (gapMs < 5000) return 500 / speed;
  if (gapMs < 30000) return 1000 / speed;
  if (gapMs < 120000) return 1500 / speed;
  return 2000 / speed;
}

// ── Main Component ──

export function ReplayPlayer({
  slug,
  eventsPath,
  durationMs,
  eventCount,
  chapters,
  keyMoments,
}: {
  slug: string;
  eventsPath: string;
  durationMs: number;
  eventCount: number;
  chapters: ManifestChapter[];
  keyMoments: ManifestKeyMoment[];
}) {
  const [events, setEvents] = useState<ReplayEvent[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const feedRef = useRef<HTMLDivElement>(null);

  // Current phase (derived from events up to currentIndex)
  const currentPhase = events
    ? (() => {
        for (let i = currentIndex; i >= 0; i--) {
          if (events[i].kind === "phase_change") return String(events[i].phase);
        }
        return "idle";
      })()
    : "idle";

  // Load events on first interaction
  const load = useCallback(async () => {
    if (events || loading) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(eventsPath);
      if (!resp.ok) throw new Error("Events not available");
      const data: EventsFile = await resp.json();
      setEvents(data.events as ReplayEvent[]);
    } catch {
      setError("Could not load replay events.");
    } finally {
      setLoading(false);
    }
  }, [eventsPath, events, loading]);

  // Playback loop
  useEffect(() => {
    if (!playing || !events || currentIndex >= events.length - 1) {
      if (playing && events && currentIndex >= events.length - 1) {
        setPlaying(false);
      }
      return;
    }
    const current = events[currentIndex];
    const next = events[currentIndex + 1];
    const delay = getPlaybackDelay(current, next, speed);
    timerRef.current = setTimeout(() => setCurrentIndex((i) => i + 1), delay);
    return () => clearTimeout(timerRef.current);
  }, [playing, currentIndex, events, speed]);

  // Auto-scroll the feed
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [currentIndex]);

  // Visible events up to current position
  const visibleEvents = events ? events.slice(0, currentIndex + 1) : [];
  // Filter to significant events for the feed
  const feedEvents = visibleEvents.filter((e) => isSignificantEvent(e.kind)).slice(-30);

  // Timeline progress
  const progress = events ? (currentIndex / (events.length - 1)) * 100 : 0;

  // Find current chapter
  const currentChapter = chapters.length > 0
    ? [...chapters].reverse().find((ch) => currentIndex >= ch.startIndex)
    : null;

  // Handle play/load
  function handlePlay() {
    if (!events) {
      load().then(() => setPlaying(true));
      return;
    }
    setPlaying(!playing);
  }

  // Seek to event index
  function seekTo(index: number) {
    if (!events) return;
    setCurrentIndex(Math.max(0, Math.min(index, events.length - 1)));
  }

  // Speed cycle
  const speeds = [1, 2, 4, 8];
  function cycleSpeed() {
    const idx = speeds.indexOf(speed);
    setSpeed(speeds[(idx + 1) % speeds.length]);
  }

  // ── Not loaded state ──
  if (!events && !loading && !error) {
    return (
      <div
        className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-dark-border bg-dark-card cursor-pointer group"
        onClick={handlePlay}
      >
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lime/10 border border-lime/20 group-hover:bg-lime/20 transition-colors">
            <Play className="h-8 w-8 text-lime ml-1" />
          </div>
          <p className="mt-4 font-medium">Play Replay</p>
          <p className="mt-1 text-xs text-muted">
            {formatDurationMs(durationMs)} &middot; {eventCount.toLocaleString()} events
          </p>
        </div>
      </div>
    );
  }

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl border border-dark-border bg-dark-card">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-lime border-t-transparent" />
          <p className="mt-4 text-sm text-muted">Loading replay events...</p>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl border border-dark-border bg-dark-card">
        <div className="text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
          <p className="mt-3 text-sm text-muted">{error}</p>
        </div>
      </div>
    );
  }

  // ── Player ──
  return (
    <div className="overflow-hidden rounded-xl border border-dark-border bg-dark-card">
      {/* Top bar: phase + chapter */}
      <div className="flex items-center justify-between border-b border-dark-border px-4 py-2">
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold uppercase tracking-wider ${PHASE_COLORS[currentPhase] || "text-muted"}`}>
            {currentPhase}
          </span>
          {currentChapter && (
            <span className="text-xs text-muted">
              {currentChapter.icon} {currentChapter.title}
            </span>
          )}
        </div>
        <span className="font-mono text-xs text-muted">
          {currentIndex + 1} / {events!.length}
        </span>
      </div>

      {/* Event feed */}
      <div
        ref={feedRef}
        className="h-[280px] overflow-y-auto px-4 py-3 space-y-1.5 scrollbar-thin"
      >
        {feedEvents.length === 0 ? (
          <p className="text-xs text-muted/40 text-center py-8">
            Press play to start the replay
          </p>
        ) : (
          feedEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-2 text-xs leading-relaxed"
            >
              <span className="mt-0.5 shrink-0">{eventIcon(event.kind)}</span>
              <span
                className={
                  event.kind === "user_message"
                    ? "text-blue-300"
                    : event.kind === "agent_message"
                    ? "text-white/90"
                    : event.kind === "git_commit"
                    ? "text-lime"
                    : event.kind === "error" || (event.kind === "agent_tool_result" && event.isError)
                    ? "text-red-400"
                    : "text-muted"
                }
              >
                {eventSummary(event)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Timeline scrubber */}
      <div className="border-t border-dark-border px-4 py-2">
        {/* Chapter markers + key moment markers on the scrubber */}
        <div className="relative h-2 rounded-full bg-dark-border cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            seekTo(Math.round(pct * (events!.length - 1)));
          }}
        >
          {/* Progress fill */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-lime/60 transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
          {/* Chapter markers */}
          {chapters.map((ch) => (
            <div
              key={ch.id}
              className="absolute top-0 h-full w-px bg-lime/30"
              style={{ left: `${(ch.startIndex / (events!.length - 1)) * 100}%` }}
              title={ch.title}
            />
          ))}
          {/* Key moment markers */}
          {keyMoments.map((m, i) => (
            <div
              key={i}
              className="absolute top-[-2px] h-[calc(100%+4px)] w-1 rounded-full bg-gold/60 cursor-pointer"
              style={{ left: `${(m.eventIndex / (events!.length - 1)) * 100}%` }}
              title={m.label}
              onClick={(e) => {
                e.stopPropagation();
                seekTo(m.eventIndex);
              }}
            />
          ))}
          {/* Playhead */}
          <div
            className="absolute top-[-3px] h-[calc(100%+6px)] w-[3px] rounded-full bg-lime shadow-[0_0_6px_rgba(78,202,92,0.5)]"
            style={{ left: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between border-t border-dark-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          {/* Prev chapter */}
          <button
            onClick={() => {
              const prev = [...chapters].reverse().find((ch) => ch.startIndex < currentIndex);
              if (prev) seekTo(prev.startIndex);
              else seekTo(0);
            }}
            className="rounded-lg p-1.5 text-muted hover:text-white hover:bg-dark-border/50 transition-colors"
            title="Previous chapter"
          >
            <SkipBack className="h-4 w-4" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={handlePlay}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-lime text-dark hover:bg-lime-dark transition-colors"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>

          {/* Next chapter */}
          <button
            onClick={() => {
              const next = chapters.find((ch) => ch.startIndex > currentIndex);
              if (next) seekTo(next.startIndex);
              else if (events) seekTo(events.length - 1);
            }}
            className="rounded-lg p-1.5 text-muted hover:text-white hover:bg-dark-border/50 transition-colors"
            title="Next chapter"
          >
            <SkipForward className="h-4 w-4" />
          </button>

          {/* Speed */}
          <button
            onClick={cycleSpeed}
            className="rounded-lg px-2 py-1 text-xs font-mono font-bold text-muted hover:text-white hover:bg-dark-border/50 transition-colors"
            title="Playback speed"
          >
            {speed}x
          </button>
        </div>

        {/* Right side: key moment chips */}
        <div className="hidden sm:flex items-center gap-1.5">
          {keyMoments.slice(0, 3).map((m, i) => (
            <button
              key={i}
              onClick={() => seekTo(m.eventIndex)}
              className="inline-flex items-center gap-1 rounded-full border border-dark-border px-2 py-0.5 text-[10px] text-muted hover:border-gold/30 hover:text-gold transition-colors"
              title={m.label}
            >
              <span>{m.icon}</span>
              <span className="max-w-[80px] truncate">{m.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
