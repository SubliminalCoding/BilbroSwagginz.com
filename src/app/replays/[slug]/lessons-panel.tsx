"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import type { LessonsFile } from "@/data/replays";

/**
 * Lessons panel that auto-loads the session summary and lets users
 * expand into full lesson cards per chapter.
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
  const [expanded, setExpanded] = useState(false);

  // Auto-load for small sessions (under 40 chapters).
  // Larger sessions stay behind a manual button to avoid slow page loads.
  const shouldAutoLoad = chapterCount < 40;

  useEffect(() => {
    if (!shouldAutoLoad) return;
    let cancelled = false;
    setLoading(true);
    fetch(lessonsPath)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data: LessonsFile) => {
        if (!cancelled) setLessons(data);
      })
      .catch(() => {
        if (!cancelled) setError("Lessons not yet available.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [lessonsPath, shouldAutoLoad]);

  function manualLoad() {
    if (lessons || loading) return;
    setLoading(true);
    fetch(lessonsPath)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data: LessonsFile) => setLessons(data))
      .catch(() => setError("Lessons not yet available."))
      .finally(() => setLoading(false));
  }

  if (loading) {
    return (
      <div className="mt-8 flex items-center gap-2 text-xs text-muted">
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-lime border-t-transparent" />
        Loading session insights...
      </div>
    );
  }

  // Large session that wasn't auto-loaded: show manual button
  if (!shouldAutoLoad && !lessons && !error) {
    return (
      <div className="mt-8">
        <button
          onClick={manualLoad}
          className="inline-flex items-center gap-2 rounded-lg border border-dark-border px-4 py-2.5 text-sm text-muted hover:text-white hover:border-lime/20 transition-colors"
        >
          <BookOpen className="h-4 w-4" />
          Load session insights ({chapterCount} chapters)
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
    );
  }

  if (error || !lessons) return null;

  const summary = lessons.course.summary;

  return (
    <div className="mt-10">
      {/* Summary — always visible */}
      {summary && (
        <div className="rounded-xl border border-lime/10 bg-dark p-6">
          <h3 className="text-sm font-semibold text-lime">What this session covered</h3>
          <p className="mt-3 text-sm text-muted leading-relaxed">
            {summary.beginnerSummary}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {summary.biggestLesson && (
              <div>
                <span className="text-[11px] uppercase tracking-wider text-muted/50">Biggest lesson</span>
                <p className="mt-0.5 text-sm text-muted">{summary.biggestLesson}</p>
              </div>
            )}
            {summary.mindsetLesson && (
              <div>
                <span className="text-[11px] uppercase tracking-wider text-muted/50">Mindset</span>
                <p className="mt-0.5 text-sm text-muted">{summary.mindsetLesson}</p>
              </div>
            )}
          </div>
          {summary.skillsPracticed && summary.skillsPracticed.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {summary.skillsPracticed.map((skill, i) => (
                <span
                  key={i}
                  className="rounded-full border border-dark-border px-2.5 py-0.5 text-[11px] text-muted"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Expand into full lessons */}
      <div className="mt-6">
        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors"
        >
          <BookOpen className="h-4 w-4" />
          {expanded ? "Hide detailed lessons" : `Show detailed lessons (${lessons.course.lessons.length} across ${chapterCount} chapters)`}
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-6 space-y-8">
          {lessons.course.chapters.map((chapter) => (
            <div key={chapter.id}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">{chapter.icon}</span>
                <h3 className="text-sm font-semibold">{chapter.title}</h3>
                <span className="text-[10px] text-muted/40">{chapter.lessons.length} lessons</span>
              </div>
              <div className="space-y-2">
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
                        <span className="font-mono text-[11px] text-muted/50 truncate max-w-[200px]">
                          {lesson.files[0].split(/[\\/]/).pop()}
                        </span>
                      )}
                    </div>
                    <h4 className="mt-2 text-sm font-medium">{lesson.title}</h4>
                    <p className="mt-1 text-xs text-muted leading-relaxed">
                      {lesson.whatHappened}
                    </p>
                    {lesson.beginnerTakeaway && (
                      <p className="mt-2 text-xs text-lime/70 leading-relaxed">
                        {lesson.beginnerTakeaway}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
