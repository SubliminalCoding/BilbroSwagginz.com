"use client";

import { Play, Terminal } from "lucide-react";
import { formatDurationMs } from "@/data/replays";
import type { ManifestChapter, ManifestKeyMoment } from "@/data/replays";

/**
 * Interactive replay player component.
 *
 * Currently renders a placeholder. When the real player ships, this will:
 * 1. Lazy-load events.json from `eventsPath` on user interaction
 * 2. Render a timeline with scrubbing, chapter markers, and key moment highlights
 * 3. Sync with the lessons panel and transcript panel
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
    <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-dark-border bg-dark-card">
      <div className="text-center">
        <Terminal className="mx-auto h-12 w-12 text-lime/30" />
        <p className="mt-4 text-muted">Interactive replay player</p>
        <p className="mt-1 text-xs text-muted/60">
          {formatDurationMs(durationMs)} · {eventCount.toLocaleString()} events · {chapters.length} chapters · {keyMoments.length} key moments
        </p>
        <p className="mt-3 text-[11px] text-muted/40 font-mono">
          {eventsPath}
        </p>
        <a
          href="https://www.youtube.com/channel/UCU0uyjCjL9gcwKhGc_9kW8A"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
        >
          <Play className="h-4 w-4" /> Watch on YouTube
        </a>
      </div>
    </div>
  );
}
