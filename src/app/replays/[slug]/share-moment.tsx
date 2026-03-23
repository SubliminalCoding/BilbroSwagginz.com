"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";

/**
 * Share button for chapters and key moments.
 * Copies a direct link to the replay at a specific event index.
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

  function handleShare() {
    const url = `${window.location.origin}/replays/${slug}#event-${eventIndex}`;
    navigator.clipboard.writeText(url).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {
        // Clipboard API can fail in insecure contexts or iframes
      }
    );
  }

  return (
    <button
      onClick={handleShare}
      title={`Share: ${label}`}
      className="inline-flex items-center gap-1 text-[11px] text-muted/40 hover:text-lime transition-colors"
    >
      <Share2 className="h-3 w-3" />
      {copied ? "Copied" : "Share"}
    </button>
  );
}
