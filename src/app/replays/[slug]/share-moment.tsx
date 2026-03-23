"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";

/**
 * Share button that copies a deep link to a specific event in the replay.
 * URL format: /replays/<slug>?t=<eventIndex>
 */
export function ShareMomentButton({
  slug,
  eventIndex,
  label,
}: {
  slug: string;
  eventIndex: number;
  label: string;
}) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    const url = `${window.location.origin}/replays/${slug}?t=${eventIndex}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Clipboard API unavailable (non-HTTPS)
    });
  }

  return (
    <button
      onClick={copyLink}
      className="inline-flex items-center gap-1 rounded-full border border-dark-border px-2 py-0.5 text-[10px] text-muted hover:border-lime/30 hover:text-lime transition-colors"
      title={`Copy link to "${label}"`}
    >
      {copied ? (
        <>
          <Check className="h-2.5 w-2.5" />
          Copied
        </>
      ) : (
        <>
          <Link2 className="h-2.5 w-2.5" />
          Share
        </>
      )}
    </button>
  );
}
