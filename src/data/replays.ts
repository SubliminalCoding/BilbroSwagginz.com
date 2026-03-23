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
// Real exports from AMC go first (loaded from public/replays/<slug>/replay.json).
// Mock manifests follow for sessions that don't have exported artifacts yet.
// ---------------------------------------------------------------------------

// ── Real AMC export ──
// Imported directly from the JSON file placed by the AMC export pipeline.
// The corresponding events.json, transcript.json, and lessons.json live
// alongside it in public/replays/<slug>/ and are lazy-loaded at runtime.
import realReplay_a9648e from "../../public/replays/we-have-to-download-this-rep-a9648e/replay.json";

export const replays: ReplayManifest[] = [
  // Real AMC exports (have all 4 artifact files in public/)
  realReplay_a9648e as ReplayManifest,

  // Mock manifests (no artifact files on disk — lazy panels will show "not available")
  {
    version: 1,
    slug: "bilbroswagginz-site-rebuild",
    sessionId: "sess_abc123",
    exportedAt: "2026-03-22T22:00:00Z",
    title: "Full site rebuild with product studio architecture",
    description:
      "Rebuilt BilbroSwagginz.com from scratch with a product hierarchy, featured products section, builder tools grid, and scroll animations. All done with Claude Code in a single session.",
    projectName: "BilbroSwagginz.com",
    projectSlug: "bilbroswagginzcom",
    date: "2026-03-22",
    duration: "2h 14m",
    durationMs: 8_040_000,
    tags: ["Next.js", "Tailwind", "site-build", "components", "styling"],
    status: "complete",
    source: { tool: "claude-code", model: "claude-opus-4-6", amcVersion: "0.1.0" },
    stats: {
      eventCount: 312,
      commitCount: 3,
      filesEdited: 12,
      linesAdded: 1840,
      linesRemoved: 98,
      toolCalls: 94,
    },
    conceptsCovered: ["planning", "writing-code", "components", "styling", "config"],
    chapters: [
      { id: "ch-1", title: "Project setup and data architecture", icon: "\u{1F4CB}", description: "Scaffolded Next.js project. Defined Product interface with tier system.", lessonCount: 4, startIndex: 0 },
      { id: "ch-2", title: "Homepage hero and nav", icon: "\u{1F3A8}", description: "Built the hero section, gradient text animation, and responsive nav.", lessonCount: 6, startIndex: 28 },
      { id: "ch-3", title: "Featured products section", icon: "\u2B50", description: "Two-column featured product cards with lime accent borders and glow hover.", lessonCount: 3, startIndex: 72 },
      { id: "ch-4", title: "Builder tools grid", icon: "\u{1F527}", description: "Compact tool cards in a 2-col grid. Added status badges for all product states.", lessonCount: 3, startIndex: 110 },
      { id: "ch-5", title: "Build log and scroll animations", icon: "\u{1F4DC}", description: "Timeline component with IntersectionObserver reveal animations.", lessonCount: 4, startIndex: 168 },
      { id: "ch-6", title: "Command palette and email capture", icon: "\u2328\uFE0F", description: "Cmd+K palette with keyboard navigation. Email form with confirmation state.", lessonCount: 5, startIndex: 245 },
    ],
    keyMoments: [
      { label: "Product tier system designed", icon: "\u26A1", eventIndex: 22, timestamp: "2026-03-22T14:22:15Z", score: 75 },
      { label: "Scroll reveal hook working", icon: "\u{1F3AF}", eventIndex: 55, timestamp: "2026-03-22T14:55:00Z", score: 70 },
      { label: "Status badge color bug fixed", icon: "\u{1F41B}", eventIndex: 112, timestamp: "2026-03-22T15:12:40Z", score: 65 },
      { label: "Command palette shipped", icon: "\u{1F3C1}", eventIndex: 252, timestamp: "2026-03-22T15:52:00Z", score: 80 },
    ],
    files: { events: "events.json", transcript: "transcript.json", lessons: "lessons.json" },
  },
  {
    version: 1,
    slug: "actuallyship-planning-flow-v2",
    sessionId: "sess_def456",
    exportedAt: "2026-03-20T20:00:00Z",
    title: "ActuallyShip planning flow v2 rewrite",
    description:
      "Rewrote the brief generation pipeline inside ActuallyShip. Faster context parsing, cleaner output format, and better scope detection for edge cases.",
    projectName: "ActuallyShip",
    projectSlug: "actuallyship",
    date: "2026-03-20",
    duration: "1h 47m",
    durationMs: 6_420_000,
    tags: ["AI-product", "pipeline", "refactoring", "debugging"],
    status: "complete",
    source: { tool: "claude-code", model: "claude-opus-4-6", amcVersion: "0.1.0" },
    stats: {
      eventCount: 198,
      commitCount: 2,
      filesEdited: 8,
      linesAdded: 620,
      linesRemoved: 340,
      toolCalls: 62,
    },
    conceptsCovered: ["planning", "editing-code", "refactoring", "debugging"],
    chapters: [
      { id: "ch-1", title: "Pipeline audit and pain points", icon: "\u{1F50D}", description: "Reviewed v1 brief output. Identified three bottlenecks in context parsing.", lessonCount: 3, startIndex: 0 },
      { id: "ch-2", title: "Context ingestion rewrite", icon: "\u{1F504}", description: "New chunked ingestion that handles mixed input types without dropping context.", lessonCount: 5, startIndex: 24 },
      { id: "ch-3", title: "Scope detection v2", icon: "\u{1F6A7}", description: "Added dependency graph analysis to flag hidden scope traps.", lessonCount: 4, startIndex: 68 },
      { id: "ch-4", title: "Brief output format redesign", icon: "\u{1F4DD}", description: "Restructured brief output into sections: goals, constraints, stories, tech notes.", lessonCount: 3, startIndex: 112 },
      { id: "ch-5", title: "Edge case testing", icon: "\u{1F9EA}", description: "Tested with ambiguous and underspecified inputs. Fixed three failure modes.", lessonCount: 4, startIndex: 155 },
    ],
    keyMoments: [
      { label: "Root cause: context truncation at 4k tokens", icon: "\u{1F4A1}", eventIndex: 30, timestamp: "2026-03-20T14:20:30Z", score: 80 },
      { label: "Lightweight DAG chosen over semantic analysis", icon: "\u26A1", eventIndex: 45, timestamp: "2026-03-20T14:45:15Z", score: 70 },
      { label: "Brief format locked", icon: "\u{1F3C1}", eventIndex: 110, timestamp: "2026-03-20T15:10:00Z", score: 65 },
      { label: "Ambiguous input edge case fixed", icon: "\u{1F41B}", eventIndex: 155, timestamp: "2026-03-20T15:35:20Z", score: 72 },
    ],
    files: { events: "events.json", transcript: "transcript.json", lessons: "lessons.json" },
  },
  {
    version: 1,
    slug: "socialforge-draft-engine",
    sessionId: "sess_ghi789",
    exportedAt: "2026-03-18T19:00:00Z",
    title: "SocialForge draft engine prototype",
    description:
      "Built the first working version of the idea-to-draft pipeline. Supports Twitter and LinkedIn output formats with tone calibration.",
    projectName: "SocialForge",
    projectSlug: "socialforge",
    date: "2026-03-18",
    duration: "1h 32m",
    durationMs: 5_520_000,
    tags: ["prototype", "content-ops", "ai-pipeline", "writing-code"],
    status: "complete",
    source: { tool: "claude-code", model: "claude-opus-4-6", amcVersion: "0.1.0" },
    stats: {
      eventCount: 156,
      commitCount: 1,
      filesEdited: 6,
      linesAdded: 480,
      linesRemoved: 0,
      toolCalls: 48,
    },
    conceptsCovered: ["planning", "writing-code", "architecture", "api"],
    chapters: [
      { id: "ch-1", title: "Draft engine architecture", icon: "\u{1F3D7}\uFE0F", description: "Designed the input-to-draft pipeline. Two-pass approach: extract then format.", lessonCount: 2, startIndex: 0 },
      { id: "ch-2", title: "Multi-format input parsing", icon: "\u{1F4E5}", description: "Built parsers for build logs, commit messages, and voice note transcripts.", lessonCount: 4, startIndex: 18 },
      { id: "ch-3", title: "Platform-specific generation", icon: "\u{1F4F1}", description: "Twitter thread formatter and LinkedIn post formatter with character limits.", lessonCount: 3, startIndex: 52 },
      { id: "ch-4", title: "Tone calibration system", icon: "\u{1F3B5}", description: "Style vector that adjusts formality, emoji usage, and sentence structure.", lessonCount: 3, startIndex: 90 },
      { id: "ch-5", title: "End-to-end test", icon: "\u2705", description: "Fed a week of real build logs through the pipeline and reviewed output quality.", lessonCount: 2, startIndex: 130 },
    ],
    keyMoments: [
      { label: "Two-pass architecture chosen", icon: "\u26A1", eventIndex: 8, timestamp: "2026-03-18T14:08:30Z", score: 75 },
      { label: "Twitter thread splitting working", icon: "\u{1F3C1}", eventIndex: 40, timestamp: "2026-03-18T14:40:00Z", score: 68 },
      { label: "Tone vector beats example-based tuning", icon: "\u{1F4A1}", eventIndex: 100, timestamp: "2026-03-18T15:00:10Z", score: 72 },
      { label: "First full pipeline run: 7 drafts", icon: "\u{1F680}", eventIndex: 135, timestamp: "2026-03-18T15:22:30Z", score: 80 },
    ],
    files: { events: "events.json", transcript: "transcript.json", lessons: "lessons.json" },
  },
  {
    version: 1,
    slug: "udderly-abduction-game-build",
    sessionId: "sess_jkl012",
    exportedAt: "2026-03-22T23:30:00Z",
    title: "Udderly Abduction: Barrage from zero to playable",
    description:
      "Built a full browser bullet-hell game in one session. Canvas rendering, bullet patterns, boss fights, combo system, and a global leaderboard powered by Neon Postgres.",
    projectName: "Udderly Abduction",
    projectSlug: "udderly-abduction",
    date: "2026-03-22",
    duration: "3h 28m",
    durationMs: 12_480_000,
    tags: ["game-dev", "canvas", "api", "dependencies", "debugging"],
    status: "complete",
    source: { tool: "claude-code", model: "claude-opus-4-6", amcVersion: "0.1.0" },
    stats: {
      eventCount: 487,
      commitCount: 5,
      filesEdited: 14,
      linesAdded: 3200,
      linesRemoved: 0,
      toolCalls: 142,
    },
    conceptsCovered: ["writing-code", "debugging", "api", "architecture", "testing"],
    chapters: [
      { id: "ch-1", title: "Game loop and canvas setup", icon: "\u{1F3AE}", description: "RequestAnimationFrame loop, sprite rendering, input handling.", lessonCount: 5, startIndex: 0 },
      { id: "ch-2", title: "Player movement and UFO mechanics", icon: "\u{1F6F8}", description: "Beam controls, cow abduction physics, tractor beam visuals.", lessonCount: 4, startIndex: 38 },
      { id: "ch-3", title: "Bullet pattern engine", icon: "\u{1F4A5}", description: "Pattern system supporting spiral, fan, aimed, and random patterns.", lessonCount: 6, startIndex: 78 },
      { id: "ch-4", title: "Enemy waves and level progression", icon: "\u{1F30A}", description: "Wave spawning system with increasing difficulty. 30+ levels designed.", lessonCount: 5, startIndex: 148 },
      { id: "ch-5", title: "Boss fights", icon: "\u{1F47E}", description: "Multi-phase boss AI with unique attack patterns and health bars.", lessonCount: 4, startIndex: 240 },
      { id: "ch-6", title: "Combo system and audio", icon: "\u{1F3B6}", description: "Combo counter, score multipliers, dynamic audio callouts for streaks.", lessonCount: 3, startIndex: 340 },
      { id: "ch-7", title: "Leaderboard integration", icon: "\u{1F3C6}", description: "Neon serverless Postgres for global high scores. API route with validation.", lessonCount: 4, startIndex: 410 },
    ],
    keyMoments: [
      { label: "Tractor beam physics working", icon: "\u{1F3C1}", eventIndex: 45, timestamp: "2026-03-22T16:30:00Z", score: 70 },
      { label: "Bullet patterns generalized to config", icon: "\u{1F504}", eventIndex: 100, timestamp: "2026-03-22T17:00:00Z", score: 75 },
      { label: "Frame drop fix: object pooling + culling", icon: "\u{1F41B}", eventIndex: 175, timestamp: "2026-03-22T17:42:30Z", score: 78 },
      { label: "First boss fight complete", icon: "\u{1F3C1}", eventIndex: 260, timestamp: "2026-03-22T18:10:00Z", score: 72 },
      { label: "Leaderboard live on Neon", icon: "\u{1F680}", eventIndex: 450, timestamp: "2026-03-22T19:05:00Z", score: 85 },
    ],
    files: { events: "events.json", transcript: "transcript.json", lessons: "lessons.json" },
  },
  {
    version: 1,
    slug: "mecoach-framework-design",
    sessionId: "sess_mno345",
    exportedAt: "2026-03-12T18:30:00Z",
    title: "MeCoach coaching framework and reflection loop",
    description:
      "Designed and prototyped the four-stage reflection loop that powers MeCoach: prompt, reflect, reframe, commit. Mapped out the coaching model and session flow.",
    projectName: "MeCoach",
    projectSlug: "mecoach",
    date: "2026-03-12",
    duration: "1h 15m",
    durationMs: 4_500_000,
    tags: ["product-design", "architecture", "planning", "writing-code"],
    status: "complete",
    source: { tool: "claude-code", model: "claude-opus-4-6", amcVersion: "0.1.0" },
    stats: {
      eventCount: 124,
      commitCount: 1,
      filesEdited: 5,
      linesAdded: 380,
      linesRemoved: 0,
      toolCalls: 38,
    },
    conceptsCovered: ["planning", "architecture", "writing-code", "components"],
    chapters: [
      { id: "ch-1", title: "Coaching model research", icon: "\u{1F4DA}", description: "Reviewed executive coaching frameworks. Identified the four-stage loop.", lessonCount: 2, startIndex: 0 },
      { id: "ch-2", title: "Prompt stage design", icon: "\u{1F4AC}", description: "Opening questions that surface the real issue, not the presented one.", lessonCount: 3, startIndex: 15 },
      { id: "ch-3", title: "Reflect and reframe stages", icon: "\u{1F914}", description: "Pattern recognition across sessions. Challenge mode that pushes past surface answers.", lessonCount: 4, startIndex: 38 },
      { id: "ch-4", title: "Commit stage and output", icon: "\u2705", description: "Session summary format with insights, commitments, and patterns to watch.", lessonCount: 3, startIndex: 72 },
      { id: "ch-5", title: "End-to-end prototype", icon: "\u{1F680}", description: "First complete session walkthrough with test user scenario.", lessonCount: 2, startIndex: 100 },
    ],
    keyMoments: [
      { label: "Four-stage model selected", icon: "\u26A1", eventIndex: 10, timestamp: "2026-03-12T14:10:15Z", score: 78 },
      { label: "Challenge mode concept", icon: "\u{1F4A1}", eventIndex: 35, timestamp: "2026-03-12T14:35:00Z", score: 72 },
      { label: "Session summary format locked", icon: "\u{1F3C1}", eventIndex: 72, timestamp: "2026-03-12T14:52:30Z", score: 68 },
      { label: "First full session prototype", icon: "\u{1F680}", eventIndex: 108, timestamp: "2026-03-12T15:08:00Z", score: 80 },
    ],
    files: { events: "events.json", transcript: "transcript.json", lessons: "lessons.json" },
  },
];

export function getReplay(slug: string): ReplayManifest | undefined {
  return replays.find((r) => r.slug === slug);
}
