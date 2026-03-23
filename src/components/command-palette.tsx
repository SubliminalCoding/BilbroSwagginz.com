"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  Youtube,
  Github,
  Twitter,
  Package,
  FileText,
  Radio,
  User,
  Command,
  Gamepad2,
  Crosshair,
} from "lucide-react";

interface PaletteItem {
  id: string;
  label: string;
  section: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const items: PaletteItem[] = useMemo(() => {
    function go(path: string) {
      return () => {
        setOpen(false);
        if (path.startsWith("#")) {
          // Same-page anchor
          if (window.location.pathname !== "/") {
            router.push("/" + path);
          } else {
            document.querySelector(path)?.scrollIntoView({ behavior: "smooth" });
          }
        } else {
          router.push(path);
        }
      };
    }

    return [
      { id: "products", label: "Products", section: "Navigate", icon: Package, action: go("#products") },
      { id: "about", label: "About", section: "Navigate", icon: User, action: go("#about") },
      { id: "build-log", label: "Build Log", section: "Navigate", icon: FileText, action: go("#log") },
      { id: "live-builds", label: "Live Builds", section: "Navigate", icon: Radio, action: go("#live") },
      { id: "games", label: "Games / Arcade", section: "Navigate", icon: Gamepad2, action: go("/games") },
      { id: "actuallyship", label: "ActuallyShip", section: "Featured", icon: ArrowRight, action: go("/products/actuallyship") },
      { id: "mecoach", label: "MeCoach", section: "Featured", icon: ArrowRight, action: go("/products/mecoach") },
      { id: "agentmissioncontrol", label: "AgentMissionControl", section: "Tools", icon: ArrowRight, action: go("/products/agentmissioncontrol") },
      { id: "socialforge", label: "SocialForge", section: "Tools", icon: ArrowRight, action: go("/products/socialforge") },
      { id: "actuallyship-ide", label: "ActuallyShip IDE", section: "Tools", icon: ArrowRight, action: go("/products/actuallyship-ide") },
      { id: "voice-transcription", label: "Voice Transcription App", section: "Tools", icon: ArrowRight, action: go("/products/voice-transcription") },
      { id: "udderly-abduction", label: "Udderly Abduction: Barrage", section: "Games", icon: Crosshair, action: go("/games/udderly-abduction") },
      { id: "game-dev-prompts", label: "Game Dev Prompts", section: "Games", icon: Gamepad2, action: go("/games/prompts") },
      { id: "youtube", label: "YouTube", section: "Social", icon: Youtube, action: () => { setOpen(false); window.open("https://www.youtube.com/channel/UCU0uyjCjL9gcwKhGc_9kW8A", "_blank"); } },
      { id: "github", label: "GitHub", section: "Social", icon: Github, action: () => { setOpen(false); window.open("https://github.com/SubliminalCoding", "_blank"); } },
      { id: "twitter", label: "Twitter / X", section: "Social", icon: Twitter, action: () => { setOpen(false); window.open("https://x.com/GetActuallyShip", "_blank"); } },
      { id: "discord", label: "Discord", section: "Social", icon: Radio, action: () => { setOpen(false); window.open("https://discord.gg/T34W6Dp8NJ", "_blank"); } },
    ];
  }, [router]);

  const filtered = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.section.toLowerCase().includes(q)
    );
  }, [query, items]);

  // Keyboard shortcut to open
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation within palette
  function handleInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[selectedIndex]?.action();
    }
  }

  if (!open) return null;

  // Group by section
  const sections: { name: string; items: (PaletteItem & { globalIndex: number })[] }[] = [];
  let globalIndex = 0;
  for (const item of filtered) {
    let section = sections.find((s) => s.name === item.section);
    if (!section) {
      section = { name: item.section, items: [] };
      sections.push(section);
    }
    section.items.push({ ...item, globalIndex });
    globalIndex++;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Palette */}
      <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[20vh] px-6">
        <div className="w-full max-w-lg rounded-xl border border-dark-border bg-dark-card shadow-2xl shadow-black/40 overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-dark-border px-4 py-3">
            <Search className="h-4 w-4 text-muted shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Search pages, products, links..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-muted/60 focus:outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-dark-border px-1.5 py-0.5 text-[10px] text-muted">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-72 overflow-y-auto py-2">
            {filtered.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted">
                No results found.
              </p>
            ) : (
              sections.map((section) => (
                <div key={section.name}>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted/60">
                    {section.name}
                  </p>
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(item.globalIndex)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        item.globalIndex === selectedIndex
                          ? "bg-lime/10 text-white"
                          : "text-muted hover:text-white"
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                      {item.globalIndex === selectedIndex && (
                        <ArrowRight className="ml-auto h-3 w-3 text-lime" />
                      )}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export function CmdKHint() {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes("MAC"));
  }, []);

  return (
    <kbd className="hidden lg:inline-flex items-center gap-1 rounded-md border border-dark-border px-2 py-1 text-[11px] text-muted/60">
      {isMac ? (
        <>
          <Command className="h-3 w-3" />K
        </>
      ) : (
        "Ctrl+K"
      )}
    </kbd>
  );
}
