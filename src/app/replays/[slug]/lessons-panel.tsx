"use client";

import { useState } from "react";
import { ChevronDown, BookOpen } from "lucide-react";
import type { LessonsFile } from "@/data/replays";

/**
 * Lazy-loading panel for lessons.json content.
 *
 * Chapters are shown from the manifest (server-rendered).
 * This component adds an expand button that fetches lessons.json
 * to show full lesson cards, takeaways, highlights, and analytics.
 *
 * When lessons.json exists at the path, clicking "Load lessons" will
 * fetch and render the full course content.
 */
export function ReplayLessonsPanel({
  slug,
  lessonsPath,
  chapterCount,
}: {
  slug: string;
  lessonsPath: string;
  chapterCount: number;
}) {
  const [lessons, setLessons] = useState<LessonsFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadLessons() {
    if (lessons || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(lessonsPath);
      if (!res.ok) {
        setError("Lessons not yet available for this session.");
        return;
      }
      const data: LessonsFile = await res.json();
      setLessons(data);
    } catch {
      setError("Lessons not yet available for this session.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8">
      {!lessons && !error && (
        <button
          onClick={loadLessons}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-dark-border px-4 py-2.5 text-sm text-muted hover:text-white hover:border-lime/20 transition-colors disabled:opacity-50"
        >
          <BookOpen className="h-4 w-4" />
          {loading ? "Loading lessons..." : `Load full lessons (${chapterCount} chapters)`}
          {!loading && <ChevronDown className="h-3 w-3" />}
        </button>
      )}

      {error && (
        <p className="text-xs text-muted/60 mt-2">{error}</p>
      )}

      {lessons && (
        <div className="mt-6 space-y-8">
          {/* Summary */}
          {lessons.course.summary && (
            <div className="rounded-lg border border-dark-border bg-dark p-5">
              <h3 className="text-sm font-semibold text-lime">Session Summary</h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">
                {lessons.course.summary.beginnerSummary}
              </p>
              {lessons.course.summary.biggestLesson && (
                <p className="mt-3 text-sm">
                  <span className="text-lime font-medium">Biggest lesson:</span>{" "}
                  <span className="text-muted">{lessons.course.summary.biggestLesson}</span>
                </p>
              )}
              {lessons.course.summary.mindsetLesson && (
                <p className="mt-1 text-sm">
                  <span className="text-lime font-medium">Mindset:</span>{" "}
                  <span className="text-muted">{lessons.course.summary.mindsetLesson}</span>
                </p>
              )}
            </div>
          )}

          {/* Full chapters with lesson cards */}
          {lessons.course.chapters.map((chapter) => (
            <div key={chapter.id}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">{chapter.icon}</span>
                <h3 className="font-semibold">{chapter.title}</h3>
              </div>
              <div className="space-y-3">
                {chapter.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="rounded-lg border border-dark-border bg-dark p-4"
                  >
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span className="rounded-full border border-lime/20 bg-lime/5 px-2 py-0.5 text-[10px] text-lime">
                        {lesson.conceptLabel}
                      </span>
                      {lesson.files.length > 0 && (
                        <span className="font-mono">{lesson.files[0]}</span>
                      )}
                    </div>
                    <h4 className="mt-2 text-sm font-medium">{lesson.title}</h4>
                    <p className="mt-1 text-xs text-muted leading-relaxed">
                      {lesson.whatHappened}
                    </p>
                    <p className="mt-2 text-xs text-lime/80">
                      {lesson.beginnerTakeaway}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Highlights from lessons.json */}
          {lessons.highlights.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-lime mb-3">Highlights</h3>
              <div className="flex flex-wrap gap-2">
                {lessons.highlights
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 8)
                  .map((h, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-full border border-dark-border px-3 py-1 text-xs text-muted"
                    >
                      <span>{h.icon}</span>
                      {h.label}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
