import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Play,
  Tag,
  BarChart3,
  Activity,
  FileCode,
  GitCommitHorizontal,
} from "lucide-react";
import { replays, formatReplayDate, formatDurationMs } from "@/data/replays";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AgentReplay — BilbroSwagginz",
  description:
    "Turn live AI coding sessions into interactive replays. Chapters, key moments, transcripts, and lessons from every build.",
  openGraph: {
    title: "AgentReplay — BilbroSwagginz",
    description:
      "Turn live AI coding sessions into interactive replays. Chapters, key moments, transcripts, and lessons from every build.",
  },
};

export default function ReplaysPage() {
  return (
    <main className="min-h-screen">
      {/* Top bar */}
      <nav className="fixed top-0 z-50 w-full border-b border-dark-border bg-dark/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            BilbroSwagginz
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted">
            <Link href="/#products" className="hover:text-white transition-colors">
              Products
            </Link>
            <Link href="/#log" className="hover:text-white transition-colors">
              Build Log
            </Link>
            <span className="text-white font-medium">AgentReplay</span>
            <a
              href="https://www.youtube.com/channel/UCU0uyjCjL9gcwKhGc_9kW8A"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              YouTube
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-32 pb-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-lime">
            AgentReplay
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Turn live AI coding sessions into interactive replays.
          </h1>
          <p className="mt-4 text-lg text-muted leading-relaxed">
            Every session is broken down into chapters, key moments, a full
            transcript, and extracted lessons. Browse the archive, pick a
            session, and see exactly how it went: the decisions, the debugging,
            and the code that shipped.
          </p>
        </div>
      </section>

      {/* Session list */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6">
            {replays.map((replay) => (
              <Link
                key={replay.slug}
                href={`/replays/${replay.slug}`}
                className="group block rounded-xl border border-dark-border bg-dark-card p-6 transition-all hover:border-lime/20 hover:shadow-lg hover:shadow-lime/5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-bold group-hover:text-lime transition-colors">
                        {replay.title}
                      </h2>
                      {replay.status !== "complete" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold border border-gold/20">
                          {replay.status}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted leading-relaxed">
                      {replay.description}
                    </p>

                    {/* Meta row */}
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {formatReplayDate(replay.date)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {replay.duration}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Tag className="h-3 w-3" />
                        {replay.projectName}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <BarChart3 className="h-3 w-3" />
                        {replay.chapters.length} chapters
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Activity className="h-3 w-3" />
                        {replay.stats.eventCount} events
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <FileCode className="h-3 w-3" />
                        {replay.stats.filesEdited} files
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <GitCommitHorizontal className="h-3 w-3" />
                        {replay.stats.commitCount} commits
                      </span>
                    </div>

                    {/* Tags + concepts */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {replay.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-dark-border px-2.5 py-0.5 text-[11px] text-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-medium text-lime group-hover:underline">
                      View session
                    </span>
                    <ArrowRight className="h-4 w-4 text-lime" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-dark-border px-6 py-16 bg-dark-card">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold">More sessions coming.</h2>
          <p className="mt-4 text-muted">
            New replays get added after each livestream. Follow the build on
            YouTube to catch them live.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="https://www.youtube.com/channel/UCU0uyjCjL9gcwKhGc_9kW8A"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-base font-semibold text-white hover:bg-red-700 transition-colors"
            >
              <Play className="h-4 w-4" /> Watch live on YouTube
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-dark-border px-6 py-3 text-base font-semibold text-white hover:border-muted transition-colors"
            >
              Back to home <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
