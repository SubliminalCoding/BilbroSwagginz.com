import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Play,
} from "lucide-react";
import { replays, formatReplayDate } from "@/data/replays";
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
  // Group replays by project for visual identity
  const byProject = new Map<string, typeof replays>();
  for (const r of replays) {
    const list = byProject.get(r.projectName) || [];
    list.push(r);
    byProject.set(r.projectName, list);
  }

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
      <section className="px-6 pt-32 pb-12">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-lime">
            AgentReplay
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Turn live AI coding sessions into interactive replays.
          </h1>
          <p className="mt-4 text-lg text-muted leading-relaxed">
            Each session has chapters, key moments, a full transcript, and
            extracted lessons. Pick one and see how it actually went.
          </p>
          <p className="mt-4 text-sm text-muted/60">
            {replays.length} sessions across {byProject.size} projects
          </p>
        </div>
      </section>

      {/* Session list */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-4">
            {replays.map((replay) => {
              const topMoment = replay.keyMoments.length > 0
                ? [...replay.keyMoments].sort((a, b) => b.score - a.score)[0]
                : null;

              return (
                <Link
                  key={replay.slug}
                  href={`/replays/${replay.slug}`}
                  className="group block rounded-xl border border-dark-border bg-dark-card overflow-hidden transition-all hover:border-lime/20 hover:shadow-lg hover:shadow-lime/5"
                >
                  <div className="p-5">
                    {/* Top line: project + date */}
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-medium text-lime">
                        {replay.projectName}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] text-muted/60 shrink-0">
                        <Calendar className="h-3 w-3" />
                        {formatReplayDate(replay.date)}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="mt-2 text-base font-bold leading-snug group-hover:text-lime transition-colors">
                      {replay.title}
                    </h2>

                    {/* One-line summary */}
                    <p className="mt-1.5 text-sm text-muted leading-relaxed line-clamp-2">
                      {replay.description}
                    </p>

                    {/* Bottom row: stats + top highlight */}
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted/60">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {replay.duration}
                      </span>
                      <span>{replay.chapters.length} chapters</span>
                      {replay.stats.filesEdited > 0 && (
                        <span>{replay.stats.filesEdited} files</span>
                      )}
                      {replay.stats.linesAdded > 0 && (
                        <span className="text-lime/50">+{replay.stats.linesAdded.toLocaleString()}</span>
                      )}
                      {topMoment && (
                        <span className="inline-flex items-center gap-1 text-muted/80">
                          <span>{topMoment.icon}</span>
                          <span className="max-w-[180px] truncate">{topMoment.label}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
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
