import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Play,
  Tag,
  Terminal,
  FileCode,
  Plus,
  Minus,
  Wrench,
  GitCommitHorizontal,
  Activity,
  DollarSign,
  MessageSquare,
} from "lucide-react";
import {
  replays,
  getReplay,
  formatReplayDate,
  formatDurationMs,
  replayLessonsPath,
  replayTranscriptPath,
  replayEventsPath,
} from "@/data/replays";
import type { ManifestKeyMoment } from "@/data/replays";
import type { Metadata } from "next";
import { ReplayLessonsPanel } from "./lessons-panel";
import { ReplayTranscriptPanel } from "./transcript-panel";
import { ReplayPlayerPlaceholder } from "./player-placeholder";
import { ReplayPlayer } from "./replay-player";
import { ShareMomentButton } from "./share-moment";

export function generateStaticParams() {
  return replays.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const replay = getReplay(slug);
  if (!replay) return {};
  return {
    title: `${replay.title} — AgentReplay — BilbroSwagginz`,
    description: replay.description,
    openGraph: {
      title: `${replay.title} — AgentReplay`,
      description: replay.description,
    },
  };
}

export default async function ReplayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const replay = getReplay(slug);
  if (!replay) notFound();

  const currentIndex = replays.findIndex((r) => r.slug === slug);
  const prev = currentIndex > 0 ? replays[currentIndex - 1] : null;
  const next =
    currentIndex < replays.length - 1 ? replays[currentIndex + 1] : null;

  return (
    <main className="min-h-screen">
      {/* Top bar */}
      <nav className="fixed top-0 z-50 w-full border-b border-dark-border bg-dark/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            href="/replays"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            All Replays
          </Link>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              {replay.duration}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              {formatReplayDate(replay.date)}
            </span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-32 pb-16">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="font-semibold uppercase tracking-wider text-lime">
              AgentReplay
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-dark-border px-2.5 py-0.5 text-xs text-muted">
              <Tag className="h-3 w-3" />
              {replay.projectName}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-dark-border px-2.5 py-0.5 text-xs text-muted">
              {replay.source.tool}
              {replay.source.model && ` · ${replay.source.model}`}
            </span>
            {replay.status !== "complete" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold border border-gold/20">
                {replay.status}
              </span>
            )}
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {replay.title}
          </h1>
          <p className="mt-4 text-lg text-muted leading-relaxed">
            {replay.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {replay.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-dark-border px-3 py-1 text-xs text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
          {replay.conceptsCovered.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {replay.conceptsCovered.map((concept) => (
                <span
                  key={concept}
                  className="rounded-full border border-lime/20 bg-lime/5 px-2.5 py-0.5 text-[11px] text-lime"
                >
                  {concept}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Video / replay player area */}
      {replay.youtubeUrl ? (
        <section className="px-6 pb-16">
          <div className="mx-auto max-w-4xl">
            <div className="relative aspect-video overflow-hidden rounded-xl border border-dark-border bg-dark-card">
              <iframe
                src={replay.youtubeUrl.replace("watch?v=", "embed/")}
                title={replay.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
        </section>
      ) : (
        <section className="px-6 pb-16">
          <div className="mx-auto max-w-4xl">
            <ReplayPlayer
              slug={replay.slug}
              eventsPath={replayEventsPath(replay.slug)}
              durationMs={replay.durationMs}
              eventCount={replay.stats.eventCount}
              chapters={replay.chapters}
              keyMoments={replay.keyMoments}
            />
          </div>
        </section>
      )}

      {/* Stats bar — renders directly from manifest stats */}
      <section className="px-6 pb-12">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-lg border border-dark-border bg-dark-card p-3 text-center">
              <Activity className="mx-auto h-4 w-4 text-lime" />
              <p className="mt-1.5 text-lg font-bold">{replay.stats.eventCount}</p>
              <p className="text-[11px] text-muted">Events</p>
            </div>
            <div className="rounded-lg border border-dark-border bg-dark-card p-3 text-center">
              <FileCode className="mx-auto h-4 w-4 text-lime" />
              <p className="mt-1.5 text-lg font-bold">{replay.stats.filesEdited}</p>
              <p className="text-[11px] text-muted">Files edited</p>
            </div>
            <div className="rounded-lg border border-dark-border bg-dark-card p-3 text-center">
              <Plus className="mx-auto h-4 w-4 text-lime" />
              <p className="mt-1.5 text-lg font-bold text-lime">+{replay.stats.linesAdded}</p>
              <p className="text-[11px] text-muted">Added</p>
            </div>
            {replay.stats.linesRemoved > 0 && (
              <div className="rounded-lg border border-dark-border bg-dark-card p-3 text-center">
                <Minus className="mx-auto h-4 w-4 text-red-400" />
                <p className="mt-1.5 text-lg font-bold text-red-400">-{replay.stats.linesRemoved}</p>
                <p className="text-[11px] text-muted">Removed</p>
              </div>
            )}
            <div className="rounded-lg border border-dark-border bg-dark-card p-3 text-center">
              <GitCommitHorizontal className="mx-auto h-4 w-4 text-lime" />
              <p className="mt-1.5 text-lg font-bold">{replay.stats.commitCount}</p>
              <p className="text-[11px] text-muted">Commits</p>
            </div>
            <div className="rounded-lg border border-dark-border bg-dark-card p-3 text-center">
              <Wrench className="mx-auto h-4 w-4 text-lime" />
              <p className="mt-1.5 text-lg font-bold">{replay.stats.toolCalls}</p>
              <p className="text-[11px] text-muted">Tool calls</p>
            </div>
            {replay.stats.estimatedCostUSD != null && (
              <div className="rounded-lg border border-dark-border bg-dark-card p-3 text-center">
                <DollarSign className="mx-auto h-4 w-4 text-lime" />
                <p className="mt-1.5 text-lg font-bold">${replay.stats.estimatedCostUSD.toFixed(2)}</p>
                <p className="text-[11px] text-muted">Est. cost</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Chapters — from manifest (lightweight pointers) */}
      {replay.chapters.length > 0 && (
        <section className="px-6 py-16 bg-dark-card">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-lime">
              Chapters
            </h2>
            <div className="mt-8 space-y-0">
              {replay.chapters.map((chapter, i) => (
                <div
                  key={chapter.id}
                  className="group relative flex gap-5 pb-6 last:pb-0"
                >
                  {i < replay.chapters.length - 1 && (
                    <div className="absolute left-[7px] top-[20px] h-full w-px bg-dark-border" />
                  )}
                  <div className="relative mt-1.5 h-[15px] w-[15px] shrink-0">
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-dark-border bg-dark group-hover:border-lime/40 transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-base" aria-hidden="true">{chapter.icon}</span>
                      <h3 className="font-semibold group-hover:text-lime transition-colors">
                        {chapter.title}
                      </h3>
                      <span className="text-[11px] text-muted/60">
                        {chapter.lessonCount} lesson{chapter.lessonCount !== 1 ? "s" : ""}
                      </span>
                      <ShareMomentButton
                        slug={replay.slug}
                        eventIndex={chapter.startIndex}
                        label={chapter.title}
                      />
                    </div>
                    <p className="mt-1 text-sm text-muted leading-relaxed">
                      {chapter.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/*
              Expanded chapter content (lessons, takeaways) comes from lessons.json.
              This client component lazy-loads it on demand.
            */}
            <ReplayLessonsPanel
              slug={replay.slug}
              lessonsPath={replayLessonsPath(replay.slug)}
              chapterCount={replay.chapters.length}
            />
          </div>
        </section>
      )}

      {/* Key moments — from manifest */}
      {replay.keyMoments.length > 0 && (
        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-lime">
              Key moments
            </h2>
            <div className="mt-8 space-y-4">
              {replay.keyMoments
                .sort((a, b) => b.score - a.score)
                .map((moment, i) => (
                  <div
                    key={i}
                    className="flex gap-4 rounded-lg border border-dark-border bg-dark-card p-4 transition-colors hover:border-lime/20"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-dark border border-dark-border text-base">
                      {moment.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-xs text-lime/70">
                          event #{moment.eventIndex}
                        </span>
                        <span className="rounded-full border border-dark-border px-2 py-0.5 text-[10px] text-muted">
                          score {moment.score}
                        </span>
                        <ShareMomentButton
                          slug={replay.slug}
                          eventIndex={moment.eventIndex}
                          label={moment.label}
                        />
                      </div>
                      <p className="mt-1 text-sm font-medium">
                        {moment.label}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Transcript panel — lazy-loads transcript.json on demand */}
      <section className="px-6 py-16 bg-dark-card">
        <div className="mx-auto max-w-3xl">
          <ReplayTranscriptPanel
            slug={replay.slug}
            transcriptPath={replayTranscriptPath(replay.slug)}
            eventsPath={replayEventsPath(replay.slug)}
          />
        </div>
      </section>

      {/* Session info */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-lime">
                Source
              </h2>
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 rounded-lg border border-dark-border p-3">
                  <Terminal className="h-4 w-4 text-lime shrink-0" />
                  <span className="text-sm">{replay.source.tool}</span>
                  {replay.source.model && (
                    <span className="text-xs text-muted">({replay.source.model})</span>
                  )}
                </div>
                <div className="text-xs text-muted space-y-1">
                  <p>AMC version: {replay.source.amcVersion}</p>
                  <p>Session: {replay.sessionId}</p>
                  <p>Exported: {new Date(replay.exportedAt).toLocaleString()}</p>
                  <p>Duration: {formatDurationMs(replay.durationMs)} ({replay.durationMs.toLocaleString()}ms)</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-lime">
                Project
              </h2>
              <div className="mt-6">
                <span className="rounded-full border border-lime/20 bg-lime/5 px-4 py-2 text-sm text-lime">
                  {replay.projectName}
                </span>
                {replay.projectSlug && (
                  <p className="mt-3 text-xs text-muted font-mono">
                    slug: {replay.projectSlug}
                  </p>
                )}
              </div>

              <h2 className="mt-10 text-sm font-semibold uppercase tracking-wider text-lime">
                Artifact files
              </h2>
              <div className="mt-3 space-y-1 text-xs text-muted font-mono">
                <p className="flex items-center gap-2">
                  <span className="text-lime">manifest</span>
                  {`/replays/${replay.slug}/replay.json`}
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-muted/60">lazy</span>
                  {`/replays/${replay.slug}/${replay.files.events}`}
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-muted/60">lazy</span>
                  {`/replays/${replay.slug}/${replay.files.transcript}`}
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-muted/60">lazy</span>
                  {`/replays/${replay.slug}/${replay.files.lessons}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prev/Next */}
      <section className="px-6 py-16 bg-dark-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          {prev ? (
            <Link
              href={`/replays/${prev.slug}`}
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="max-w-[200px] truncate">{prev.title}</span>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`/replays/${next.slug}`}
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors"
            >
              <span className="max-w-[200px] truncate">{next.title}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </section>

      {/* Back CTA */}
      <section className="border-t border-dark-border px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-muted">See all sessions and products</p>
          <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/replays"
              className="inline-flex items-center gap-2 rounded-lg bg-lime px-6 py-3 text-base font-semibold text-dark hover:bg-lime-dark transition-colors"
            >
              All Replays <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-dark-border px-6 py-3 text-base font-semibold text-white hover:border-muted transition-colors"
            >
              Back to BilbroSwagginz <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
