import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
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
import type { Metadata } from "next";
import { ReplayLessonsPanel } from "./lessons-panel";
import { ReplayTranscriptPanel } from "./transcript-panel";
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
      <section className="px-6 pt-32 pb-12">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link href="/replays" className="font-semibold uppercase tracking-wider text-lime hover:underline">
              AgentReplay
            </Link>
            <span className="text-muted/30">/</span>
            <span className="text-sm text-muted">{replay.projectName}</span>
            {replay.status !== "complete" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold border border-gold/20">
                {replay.status}
              </span>
            )}
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {replay.title}
          </h1>
          <p className="mt-4 text-lg text-muted leading-relaxed">
            {replay.description}
          </p>
          {replay.conceptsCovered.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
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

      {/* Session at a glance — narrative framing instead of raw stats */}
      <section className="px-6 pb-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border border-dark-border bg-dark-card px-6 py-5">
            <p className="text-sm text-muted leading-relaxed">
              <span className="text-white font-medium">{formatDurationMs(replay.durationMs)}</span> session
              {replay.stats.filesEdited > 0 && (
                <> that touched <span className="text-white font-medium">{replay.stats.filesEdited} files</span></>
              )}
              {replay.stats.linesAdded > 0 && (
                <> with <span className="text-lime font-medium">+{replay.stats.linesAdded.toLocaleString()}</span>{replay.stats.linesRemoved > 0 && <> / <span className="text-red-400 font-medium">-{replay.stats.linesRemoved.toLocaleString()}</span></>} lines</>
              )}
              {replay.stats.commitCount > 0 && (
                <> across <span className="text-white font-medium">{replay.stats.commitCount} commit{replay.stats.commitCount !== 1 ? "s" : ""}</span></>
              )}
              . The agent made <span className="text-white font-medium">{replay.stats.toolCalls.toLocaleString()} tool calls</span> over{" "}
              <span className="text-white font-medium">{replay.stats.eventCount.toLocaleString()} events</span>
              {replay.stats.estimatedCostUSD != null && (
                <> at an estimated cost of <span className="text-white font-medium">${replay.stats.estimatedCostUSD.toFixed(2)}</span></>
              )}
              .
            </p>
          </div>
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

      {/* Chapters */}
      {replay.chapters.length > 0 && (
        <section className="px-6 py-16 bg-dark-card">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-lime">
              How the session unfolded
            </h2>
            <p className="mt-2 text-sm text-muted">
              {replay.chapters.length} chapters covering the full arc from start to finish.
            </p>
            <div className="mt-8 space-y-0">
              {replay.chapters.map((chapter, i) => (
                <div
                  key={chapter.id}
                  id={`chapter-${chapter.id}`}
                  className="group relative flex gap-4 pb-5 last:pb-0 scroll-mt-24"
                >
                  {i < replay.chapters.length - 1 && (
                    <div className="absolute left-[15px] top-[36px] h-[calc(100%-36px)] w-px bg-dark-border" />
                  )}
                  <div className="relative flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg border border-dark-border bg-dark text-sm group-hover:border-lime/30 transition-colors">
                    <span aria-hidden="true">{chapter.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono text-muted/40">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-sm font-semibold group-hover:text-lime transition-colors">
                        {chapter.title}
                      </h3>
                      <span className="rounded-full bg-dark px-2 py-0.5 text-[10px] text-muted/50 border border-dark-border">
                        {chapter.lessonCount} lesson{chapter.lessonCount !== 1 ? "s" : ""}
                      </span>
                      <ShareMomentButton
                        slug={replay.slug}
                        eventIndex={chapter.startIndex}
                        label={chapter.title}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted leading-relaxed">
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
              Highlights
            </h2>
            <p className="mt-2 text-sm text-muted">
              The most notable things that happened, ranked by significance.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {replay.keyMoments
                .sort((a, b) => b.score - a.score)
                .map((moment, i) => (
                  <div
                    key={i}
                    className="flex gap-3 rounded-lg border border-dark-border bg-dark-card p-4 transition-colors hover:border-lime/20"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-dark border border-dark-border text-lg">
                      {moment.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug">
                        {moment.label}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <ShareMomentButton
                          slug={replay.slug}
                          eventIndex={moment.eventIndex}
                          label={moment.label}
                        />
                      </div>
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

      {/* Session details */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-lime">
            Session details
          </h2>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-muted/50 block">Project</span>
              <span className="font-medium text-white">{replay.projectName}</span>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-muted/50 block">Tool</span>
              <span>{replay.source.tool}</span>
            </div>
            {replay.source.model && (
              <div>
                <span className="text-[11px] uppercase tracking-wider text-muted/50 block">Model</span>
                <span>{replay.source.model}</span>
              </div>
            )}
            <div>
              <span className="text-[11px] uppercase tracking-wider text-muted/50 block">Duration</span>
              <span>{formatDurationMs(replay.durationMs)}</span>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-muted/50 block">Recorded</span>
              <span>{formatReplayDate(replay.date)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* More sessions */}
      <section className="px-6 py-16 bg-dark-card">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-lime">
            More sessions
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {prev && (
              <Link
                href={`/replays/${prev.slug}`}
                className="group rounded-lg border border-dark-border bg-dark p-4 hover:border-lime/20 transition-colors"
              >
                <span className="text-[10px] uppercase tracking-wider text-muted/50">Previous</span>
                <p className="mt-1 text-sm font-medium group-hover:text-lime transition-colors line-clamp-2">
                  {prev.title}
                </p>
                <p className="mt-1 text-xs text-muted">{prev.projectName}</p>
              </Link>
            )}
            {next && (
              <Link
                href={`/replays/${next.slug}`}
                className="group rounded-lg border border-dark-border bg-dark p-4 hover:border-lime/20 transition-colors"
              >
                <span className="text-[10px] uppercase tracking-wider text-muted/50">Next</span>
                <p className="mt-1 text-sm font-medium group-hover:text-lime transition-colors line-clamp-2">
                  {next.title}
                </p>
                <p className="mt-1 text-xs text-muted">{next.projectName}</p>
              </Link>
            )}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/replays"
              className="text-sm text-lime hover:underline"
            >
              View all sessions
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
