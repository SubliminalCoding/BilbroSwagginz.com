"use client";

import { useState } from "react";
import { ChevronDown, MessageSquare } from "lucide-react";
import type { TranscriptFile } from "@/data/replays";

/**
 * Lazy-loading panel for transcript.json.
 *
 * Does NOT load until the user clicks "Load transcript".
 * This keeps the detail page fast since transcripts can be large.
 */
export function ReplayTranscriptPanel({
  slug,
  transcriptPath,
}: {
  slug: string;
  transcriptPath: string;
}) {
  const [transcript, setTranscript] = useState<TranscriptFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        <div className="mt-6 space-y-3 max-h-[600px] overflow-y-auto">
          {transcript.entries.map((entry, i) => (
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
                {entry.text.length > 500
                  ? entry.text.slice(0, 500) + "..."
                  : entry.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
