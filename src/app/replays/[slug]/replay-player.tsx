"use client";

import { Play, Clock, Layers, Zap } from "lucide-react";
import { formatDurationMs } from "@/data/replays";
import type { ManifestChapter, ManifestKeyMoment } from "@/data/replays";

/**
 * Replay player area. Shows session overview with chapter timeline
 * and key moment markers. When the real interactive player ships,
 * this component will lazy-load events.json and render a scrubbing timeline.
 */
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
  return (
    <div className="overflow-hidden rounded-xl border border-dark-border bg-dark-card">
      {/* Main area */}
      <div className="relative flex items-center justify-center px-6 py-16 sm:py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-lime/[0.02] to-transparent pointer-events-none" />
        <div className="relative text-center">
          <p className="text-sm font-semibold text-lime">Session overview</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-lime/60" />
              {formatDurationMs(durationMs)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-lime/60" />
              {chapters.length} chapters
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-lime/60" />
              {keyMoments.length} key moments
            </span>
          </div>
          <p className="mt-6 text-xs text-muted/50">
            Explore chapters and key moments below, or load the full transcript.
          </p>
        </div>
      </div>

      {/* Chapter timeline bar */}
      {chapters.length > 0 && chapters.length <= 30 && (
        <div className="border-t border-dark-border px-4 py-3">
          <div className="flex gap-1 overflow-x-auto">
            {chapters.map((ch) => (
              <a
                key={ch.id}
                href={`#chapter-${ch.id}`}
                className="group flex items-center gap-1.5 shrink-0 rounded-md px-2.5 py-1.5 text-[11px] text-muted hover:text-white hover:bg-lime/5 transition-colors"
                title={ch.title}
              >
                <span className="text-sm">{ch.icon}</span>
                <span className="max-w-[120px] truncate">{ch.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}
      {chapters.length > 30 && (
        <div className="border-t border-dark-border px-4 py-3 text-center">
          <p className="text-xs text-muted/50">
            {chapters.length} chapters below
          </p>
        </div>
      )}
    </div>
  );
}
