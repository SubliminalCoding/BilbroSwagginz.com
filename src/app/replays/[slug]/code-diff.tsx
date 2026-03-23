"use client";

import { useState } from "react";
import { Code, ChevronDown, ChevronUp } from "lucide-react";

/**
 * Inline code diff viewer for Edit tool_use events.
 * Shows old_string -> new_string with red/green highlighting.
 */
export function CodeDiff({
  filePath,
  oldString,
  newString,
}: {
  filePath: string;
  oldString: string;
  newString: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const fileName = filePath.split(/[\\/]/).pop() || filePath;

  return (
    <div className="mt-2 rounded-lg border border-dark-border overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-1.5 text-[11px] text-muted hover:text-white bg-dark-card transition-colors"
      >
        <Code className="h-3 w-3 text-lime" />
        <span className="font-mono">{fileName}</span>
        <span className="ml-auto">
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-dark-border bg-dark font-mono text-[11px] leading-relaxed overflow-x-auto">
          {oldString && (
            <div className="border-b border-dark-border">
              <div className="px-3 py-1 text-[10px] text-red-400/60 bg-red-400/5">removed</div>
              <pre className="px-3 py-2 text-red-400/80 whitespace-pre-wrap break-words">
                {oldString.length > 800 ? oldString.slice(0, 800) + "\n[...truncated]" : oldString}
              </pre>
            </div>
          )}
          {newString && (
            <div>
              <div className="px-3 py-1 text-[10px] text-lime/60 bg-lime/5">added</div>
              <pre className="px-3 py-2 text-lime/80 whitespace-pre-wrap break-words">
                {newString.length > 800 ? newString.slice(0, 800) + "\n[...truncated]" : newString}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
