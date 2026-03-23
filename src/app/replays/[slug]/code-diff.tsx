"use client";

/**
 * Simple inline code diff display for transcript entries.
 * Shows old/new strings with file path context.
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
  const fileName = filePath.split(/[\\/]/).pop() || filePath;

  return (
    <div className="mt-2 rounded-lg border border-dark-border bg-dark overflow-hidden text-[11px] font-mono">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-card border-b border-dark-border text-muted/60">
        <span>{fileName}</span>
      </div>
      {oldString && (
        <div className="px-3 py-1.5 bg-red-500/5 border-b border-dark-border">
          <pre className="text-red-400/70 whitespace-pre-wrap break-words leading-relaxed">
            {oldString.length > 300 ? oldString.slice(0, 300) + "..." : oldString}
          </pre>
        </div>
      )}
      {newString && (
        <div className="px-3 py-1.5 bg-lime/5">
          <pre className="text-lime/70 whitespace-pre-wrap break-words leading-relaxed">
            {newString.length > 300 ? newString.slice(0, 300) + "..." : newString}
          </pre>
        </div>
      )}
    </div>
  );
}
