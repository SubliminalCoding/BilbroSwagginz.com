"use client";

import { useState, useMemo } from "react";
import { ChevronDown, MessageSquare, Search, X, Code } from "lucide-react";
import type { TranscriptFile, EventsFile } from "@/data/replays";
import { CodeDiff } from "./code-diff";

/**
 * Lazy-loading panel for transcript.json with search.
 *
 * Does NOT load until the user clicks "Load transcript".
 * Once loaded, provides keyword search with highlighted matches.
 */
// Edit diff data extracted from events.json
interface EditDiff {
  filePath: string;
  oldString: string;
  newString: string;
}

export function ReplayTranscriptPanel({
  slug,
  transcriptPath,
  eventsPath,
}: {
  slug: string;
  transcriptPath: string;
  eventsPath?: string;
}) {
  const [transcript, setTranscript] = useState<TranscriptFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [editDiffs, setEditDiffs] = useState<Map<number, EditDiff>>(new Map());
  const [diffsLoaded, setDiffsLoaded] = useState(false);
  const [diffsLoading, setDiffsLoading] = useState(false);

  async function loadTranscript() {
    if (transcript || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(transcriptPath);
      if (!res.ok) {
        setError("Transcript not yet available for this session.");
        return;
      }
      const data: TranscriptFile = await res.json();
      setTranscript(data);
    } catch {
      setError("Transcript not yet available for this session.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    if (!transcript) return [];
    const entries = transcript.entries.map((e, i) => ({ ...e, _idx: i }));
    if (!query.trim()) return entries;
    const q = query.toLowerCase();
    return entries.filter(
      (e) =>
        e.text.toLowerCase().includes(q) ||
        (e.toolName && e.toolName.toLowerCase().includes(q)) ||
        e.role.toLowerCase().includes(q),
    );
  }, [transcript, query]);

  async function loadDiffs() {
    if (diffsLoaded || diffsLoading || !eventsPath) return;
    setDiffsLoading(true);
    try {
      const res = await fetch(eventsPath);
      if (!res.ok) return;
      const data: EventsFile = await res.json();
      const diffs = new Map<number, EditDiff>();
      // Match edit tool_use events to transcript entry indices
      let transcriptIdx = 0;
      for (const event of data.events) {
        if (event.kind === "agent_tool_use" && event.toolName === "Edit") {
          const input = event.input as Record<string, unknown> | undefined;
          if (input?.old_string && input?.new_string) {
            const fileName = String(input.file_path || "").split(/[\\/]/).pop() || "";
            if (!fileName) continue; // skip edits without a file path
            // Find the matching transcript entry (tool entries with "Edit" in text)
            for (let j = transcriptIdx; j < (transcript?.entries.length ?? 0); j++) {
              const te = transcript!.entries[j];
              if (te.toolName === "Edit" && te.text.includes(fileName)) {
                diffs.set(j, {
                  filePath: String(input.file_path || ""),
                  oldString: String(input.old_string),
                  newString: String(input.new_string),
                });
                transcriptIdx = j + 1;
                break;
              }
            }
          }
        }
      }
      setEditDiffs(diffs);
      setDiffsLoaded(true);
    } catch {
      // silently fail — diffs are optional
    } finally {
      setDiffsLoading(false);
    }
  }

  const roleStyles: Record<string, string> = {
    user: "border-lime/20 bg-lime/5",
    agent: "border-dark-border bg-dark",
    tool: "border-dark-border bg-dark-card",
    system: "border-gold/20 bg-gold/5",
  };

  const roleLabels: Record<string, string> = {
    user: "User",
    agent: "Agent",
    tool: "Tool",
    system: "System",
  };

  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-lime">
        Transcript
      </h2>

      {!transcript && !error && (
        <button
          onClick={loadTranscript}
          disabled={loading}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-dark-border px-4 py-2.5 text-sm text-muted hover:text-white hover:border-lime/20 transition-colors disabled:opacity-50"
        >
          <MessageSquare className="h-4 w-4" />
          {loading ? "Loading transcript..." : "Load session transcript"}
          {!loading && <ChevronDown className="h-3 w-3" />}
        </button>
      )}

      {error && (
        <p className="mt-4 text-xs text-muted/60">{error}</p>
      )}

      {transcript && (
        <>
          {/* Search bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search transcript..."
              className="w-full rounded-lg border border-dark-border bg-dark px-9 py-2 text-sm text-white placeholder:text-muted/50 focus:border-lime/30 focus:outline-none transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Diff loading toggle — only show after transcript is loaded */}
          {eventsPath && transcript && !diffsLoaded && (
            <button
              onClick={loadDiffs}
              disabled={diffsLoading}
              className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-muted hover:text-lime transition-colors disabled:opacity-50"
            >
              <Code className="h-3 w-3" />
              {diffsLoading ? "Loading diffs..." : "Show code diffs"}
            </button>
          )}
          {diffsLoaded && (
            <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-lime/60">
              <Code className="h-3 w-3" />
              {editDiffs.size} code diffs loaded
            </span>
          )}

          {/* Result count when searching */}
          {query.trim() && (
            <p className="mt-2 text-xs text-muted">
              {filtered.length} of {transcript.entries.length} entries
            </p>
          )}

          {/* Entries */}
          <div className="mt-4 space-y-3 max-h-[600px] overflow-y-auto">
            {filtered.map((entry, i) => (
              <div
                key={i}
                className={`rounded-lg border p-3 ${roleStyles[entry.role] || "border-dark-border bg-dark"}`}
              >
                <div className="flex items-center gap-2 text-[11px] text-muted mb-1">
                  <span className="font-medium">{roleLabels[entry.role] || entry.role}</span>
                  {entry.toolName && (
                    <span className="font-mono text-lime/60">{entry.toolName}</span>
                  )}
                  {entry.isError && (
                    <span className="text-red-400 font-medium">error</span>
                  )}
                </div>
                <p className="text-xs text-muted leading-relaxed whitespace-pre-wrap break-words">
                  {renderWithHighlight(
                    entry.text.length > 500 ? entry.text.slice(0, 500) + "..." : entry.text,
                    query,
                  )}
                </p>
                {editDiffs.has(entry._idx) && (
                  <CodeDiff
                    filePath={editDiffs.get(entry._idx)!.filePath}
                    oldString={editDiffs.get(entry._idx)!.oldString}
                    newString={editDiffs.get(entry._idx)!.newString}
                  />
                )}
              </div>
            ))}
            {filtered.length === 0 && query.trim() && (
              <p className="py-8 text-center text-xs text-muted/40">
                No matches for &quot;{query}&quot;
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function renderWithHighlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(re);
  if (parts.length === 1) return text;
  // split(/(capture)/) puts matches at odd indices
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="bg-lime/20 text-lime rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
