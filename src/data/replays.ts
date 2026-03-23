// ---------------------------------------------------------------------------
// Replay types — aligned to the AMC (AgentMissionControl) export contract.
//
// AMC exports a directory per session:
//   exports/replays/<slug>/
//     replay.json       — manifest (loaded at build time for archive + detail)
//     events.json       — full event stream (lazy-loaded for replay player)
//     transcript.json   — conversation log (lazy-loaded for transcript view)
//     lessons.json      — course, highlights, analytics (lazy-loaded for chapters/highlights)
//
// This file defines the website's view of that contract. Types mirror the AMC
// exports exactly so a real export can be dropped in with zero transformation.
// ---------------------------------------------------------------------------

// ── replay.json — the manifest ──

export type ReplayStatus = "complete" | "partial" | "error";

export interface ReplaySource {
  tool: "claude-code";
  model?: string;
  amcVersion: string;
}

export interface ReplayStats {
  eventCount: number;
  commitCount: number;
  filesEdited: number;
  linesAdded: number;
  linesRemoved: number;
  toolCalls: number;
  estimatedCostUSD?: number;
}

export interface ManifestChapter {
  id: string;
  title: string;
  icon: string;
  description: string;
  lessonCount: number;
  startIndex: number;
}

export interface ManifestKeyMoment {
  label: string;
  icon: string;
  eventIndex: number;
  timestamp: string;
  score: number;
}

export interface ReplayManifest {
  version: 1;
  slug: string;
  sessionId: string;
  exportedAt: string;

  // Display
  title: string;
  description: string;
  projectName: string;
  projectSlug?: string;
  date: string; // YYYY-MM-DD
  duration: string; // human-readable, derived from durationMs
  durationMs: number;

  // Classification
  tags: string[];
  status: ReplayStatus;
  source: ReplaySource;

  // Stats
  stats: ReplayStats;

  // Concepts covered
  conceptsCovered: string[];

  // Chapter markers (lightweight, no lesson bodies)
  chapters: ManifestChapter[];

  // Key moments (lightweight highlight pointers)
  keyMoments: ManifestKeyMoment[];

  // Links
  youtubeUrl?: string;

  // File pointers (relative paths within the export folder)
  files: {
    events: "events.json";
    transcript: "transcript.json";
    lessons: "lessons.json";
  };
}

// ── transcript.json — lazy-loaded ──

export interface TranscriptEntry {
  role: "user" | "agent" | "tool" | "system";
  timestamp: string;
  text: string;
  toolName?: string;
  isError?: boolean;
}

export interface TranscriptFile {
  version: 1;
  sessionId: string;
  entries: TranscriptEntry[];
}

// ── lessons.json — lazy-loaded ──
// Lightweight references to AMC types. Full types live in the AMC package;
// the site only needs the shapes it renders.

export interface LessonCard {
  id: string;
  eventIndex: number;
  timestamp: string;
  title: string;
  whatHappened: string;
  whyItMatters: string;
  whatChanged: string;
  concept: string;
  conceptLabel: string;
  beginnerTakeaway: string;
  builderDetail?: string;
  files: string[];
  phase: string;
}

export interface FullChapter {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  lessons: LessonCard[];
  startIndex: number;
  introNarration: string;
  wrapNarration: string;
}

export interface HighlightMoment {
  eventIndex: number;
  score: number;
  label: string;
  icon: string;
  timestamp: string;
}

export interface LessonsFile {
  version: 1;
  sessionId: string;
  course: {
    chapters: FullChapter[];
    lessons: LessonCard[];
    summary: {
      conceptsCovered: Array<{ tag: string; label: string; count: number }>;
      biggestLesson: string;
      skillsPracticed: string[];
      mindsetLesson: string;
      beginnerSummary: string;
      builderSummary: string;
      filesEdited: number;
      commitsShipped: number;
      bugsFixed: number;
    };
  };
  highlights: HighlightMoment[];
  analytics: {
    totalInputTokens: number;
    totalOutputTokens: number;
    totalTokens: number;
    estimatedCostUSD: number;
    tokensPerMinute: number;
    costPerMinute: number;
    toolUsage: Record<string, number>;
    filesTouched: number;
    linesAdded: number;
    linesRemoved: number;
    commitsMade: number;
    phaseDurations: Record<string, number>;
    runDurationMs: number;
    hasTokenData: boolean;
    projectedCostUSD: number;
    estimatedRemainingMs: number;
    completionConfidence: "low" | "medium" | "high";
  };
  youtubeDescription: string;
  youtubeDescriptionShort: string;
}

// ── events.json — lazy-loaded ──
// The site does not need to type every event variant. It loads the raw array
// for the future replay player. Minimal shape for type-safety:

export interface EventsFile {
  version: 1;
  sessionId: string;
  eventCount: number;
  events: Array<{
    id: string;
    timestamp: string;
    source: string;
    kind: string;
    [key: string]: unknown;
  }>;
}

// ── Replay directory convention ──
// Replay artifacts live at: public/replays/<slug>/
// At build time we read replay.json from each directory.
// At runtime, lessons/transcript/events are fetched on demand.

export function replayBasePath(slug: string): string {
  return `/replays/${slug}`;
}

export function replayManifestPath(slug: string): string {
  return `${replayBasePath(slug)}/replay.json`;
}

export function replayLessonsPath(slug: string): string {
  return `${replayBasePath(slug)}/lessons.json`;
}

export function replayTranscriptPath(slug: string): string {
  return `${replayBasePath(slug)}/transcript.json`;
}

export function replayEventsPath(slug: string): string {
  return `${replayBasePath(slug)}/events.json`;
}

// ── Helpers ──

export function formatDurationMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function formatReplayDate(date: string): string {
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Replay manifests.
// Real exports from AgentReplay, loaded from public/replays/<slug>/replay.json.
// Each has all 4 artifact files on disk (events, transcript, lessons).
// ---------------------------------------------------------------------------

import replay_bilbro_rebuild from "../../public/replays/we-need-to-update-bilbroswagginzcom-to-better-reflect-the-a-1fcf29/replay.json";
import replay_udderly_scale from "../../public/replays/implement-the-following-plan-udderly-abduction-scale-u-81b587/replay.json";
import replay_udderly_jeffrey from "../../public/replays/lets-do-some-jeffrey-prompts-to-see-how-we-can-make-this-be-533036/replay.json";
import replay_amc_session from "../../public/replays/we-have-to-download-this-rep-a9648e/replay.json";
import replay_actuallyship from "../../public/replays/implement-the-following-plan-actuallyship-rebrand-plan-49f283/replay.json";
import replay_socialforge from "../../public/replays/you-are-an-expert-full-stack-developer-specializing-in-rapid-c09a5b/replay.json";
import replay_mecoach_ide from "../../public/replays/implement-the-following-plan-menoach-ide-mvp-implement-8bcf52/replay.json";
import replay_build_a_single_page_landing_page_for_a_p from "../../public/replays/build-a-single-page-landing-page-for-a-product-called-act-309d75/replay.json";

export const replays: ReplayManifest[] = [
  // All real AgentReplay exports — every session has 4 artifact files on disk
  replay_bilbro_rebuild as ReplayManifest,
  replay_udderly_jeffrey as ReplayManifest,
  replay_udderly_scale as ReplayManifest,
  replay_actuallyship as ReplayManifest,
  replay_socialforge as ReplayManifest,
  replay_mecoach_ide as ReplayManifest,
  replay_amc_session as ReplayManifest,
  replay_build_a_single_page_landing_page_for_a_p as ReplayManifest,
];

export function getReplay(slug: string): ReplayManifest | undefined {
  return replays.find((r) => r.slug === slug);
}
