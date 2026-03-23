"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Trophy,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Gamepad2,
  Menu,
  X,
  ChevronUp,
  ChevronDown,
  Crosshair,
  Shield,
  Zap,
  Bomb,
  Target,
} from "lucide-react";
import { CommandPalette, CmdKHint } from "@/components/command-palette";

interface LeaderboardEntry {
  player_name: string;
  score: number;
  level_reached: number;
  cows_abducted: number;
  max_combo: number;
  played_at: string;
}

function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="mobile-menu md:hidden absolute top-full left-0 w-full border-b border-dark-border bg-dark/95 backdrop-blur-md">
      <div className="flex flex-col gap-4 px-6 py-6">
        <Link
          href="/"
          onClick={onClose}
          className="text-muted hover:text-white transition-colors"
        >
          Home
        </Link>
        <Link
          href="/games"
          onClick={onClose}
          className="text-muted hover:text-white transition-colors"
        >
          Games
        </Link>
      </div>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const controls = [
  { icon: "arrow-keys", keys: "Arrow Keys", action: "Move UFO" },
  { icon: "space", keys: "Space (hold)", action: "Tractor Beam" },
  { icon: "shift", keys: "Shift / F", action: "Focus Mode (small hitbox)" },
  { icon: "s", keys: "S", action: "Toggle Shield" },
  { icon: "d", keys: "D", action: "Fire Laser" },
  { icon: "b", keys: "B", action: "Bomb (clear bullets)" },
  { icon: "p", keys: "P / Esc", action: "Pause" },
  { icon: "m", keys: "M", action: "Mute" },
];

const tips = [
  {
    icon: Target,
    title: "Graze for multipliers",
    desc: "Fly close to bullets without getting hit to build your score multiplier up to 5x.",
  },
  {
    icon: Zap,
    title: "Chain cow combos",
    desc: "Abduct cows within 2 seconds of each other to build combos. At 5x, you trigger slow-motion.",
  },
  {
    icon: Shield,
    title: "Shield reflects bullets",
    desc: "Your shield costs energy but reflects incoming bullets. Use it in dense patterns.",
  },
  {
    icon: Bomb,
    title: "Bombs cancel everything",
    desc: "Each cancelled bullet scores 10 points. Save bombs for dense boss phases.",
  },
  {
    icon: Crosshair,
    title: "Focus for precision",
    desc: "Focus mode shrinks your hitbox to 3 pixels and slows you down for threading gaps.",
  },
];

export default function UdderlyAbductionPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [gameLoaded, setGameLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch("/api/leaderboard");
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch {
      // silently fail
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  // Listen for score submissions from the game iframe
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === "UDDERLY_SCORE_SUBMIT") {
        fetch("/api/leaderboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(e.data.payload),
        }).then(() => {
          fetchLeaderboard();
        });
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [fetchLeaderboard]);

  function toggleFullscreen() {
    if (!gameContainerRef.current) return;
    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  }

  function toggleMute() {
    setIsMuted(!isMuted);
    iframeRef.current?.contentWindow?.postMessage(
      { type: "TOGGLE_MUTE" },
      "*"
    );
  }

  return (
    <main className="noise-bg min-h-screen">
      <CommandPalette />

      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-dark-border bg-dark/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold">
            BilbroSwagginz
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/games" className="hover:text-white transition-colors">
              Games
            </Link>
            <span className="text-white font-medium">
              Udderly Abduction
            </span>
            <CmdKHint />
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-muted hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      </nav>

      <div className="mx-auto max-w-6xl px-6 pt-24 pb-16">
        {/* Breadcrumb */}
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-lime transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Arcade
        </Link>

        {/* Game Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold sm:text-4xl">
              Udderly Abduction: <span className="gradient-text">Barrage</span>
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-lime/10 px-3 py-1 text-xs font-medium text-lime border border-lime/20">
              <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse" />
              Playable
            </span>
          </div>
          <p className="text-muted max-w-2xl">
            A retro pixel-art bullet-hell. Pilot a UFO, abduct cows, dodge
            insane bullet patterns, fight bosses, and climb the global
            leaderboard.
          </p>
        </div>

        {/* Main Content: Game + Leaderboard side by side */}
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Game Container */}
          <div>
            <div
              ref={gameContainerRef}
              className="game-wrapper relative rounded-xl border border-lime/20 bg-black overflow-hidden"
              style={{ aspectRatio: "16/9" }}
            >
              {!gameLoaded && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-dark">
                  <Gamepad2 className="h-12 w-12 text-lime mb-4 animate-pulse" />
                  <button
                    onClick={() => setGameLoaded(true)}
                    className="rounded-lg bg-lime px-8 py-3 text-lg font-bold text-dark hover:bg-lime-dark transition-colors"
                  >
                    Launch Game
                  </button>
                  <p className="mt-3 text-xs text-muted">
                    Click to load. Best on desktop with keyboard.
                  </p>
                </div>
              )}
              {gameLoaded && (
                <iframe
                  ref={iframeRef}
                  src="/games/udderly-abduction/index.html"
                  className="absolute inset-0 w-full h-full border-0"
                  allow="autoplay"
                  tabIndex={0}
                  title="Udderly Abduction: Barrage"
                  onLoad={() => {
                    // Focus the iframe so keyboard input works
                    iframeRef.current?.focus();
                  }}
                />
              )}

              {/* Game Controls Overlay */}
              {gameLoaded && (
                <div className="absolute top-3 right-3 z-20 flex gap-2">
                  <button
                    onClick={toggleMute}
                    className="rounded-lg bg-dark/80 backdrop-blur-sm border border-dark-border p-2 text-muted hover:text-white transition-colors"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="rounded-lg bg-dark/80 backdrop-blur-sm border border-dark-border p-2 text-muted hover:text-white transition-colors"
                    title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Controls Toggle */}
            <button
              onClick={() => setShowControls(!showControls)}
              className="mt-4 flex w-full items-center justify-between rounded-lg border border-dark-border bg-dark-card px-4 py-3 text-sm text-muted hover:text-white hover:border-lime/20 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Gamepad2 className="h-4 w-4" />
                Controls &amp; Keybindings
              </span>
              {showControls ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {showControls && (
              <div className="mt-2 rounded-lg border border-dark-border bg-dark-card p-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {controls.map((c) => (
                    <div
                      key={c.keys}
                      className="rounded-lg border border-dark-border bg-dark p-3"
                    >
                      <kbd className="inline-block rounded border border-dark-border bg-dark-card px-2 py-0.5 text-xs font-mono text-lime">
                        {c.keys}
                      </kbd>
                      <p className="mt-1.5 text-xs text-muted">{c.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips Section */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-lime mb-4">
                Pro Tips
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tips.map((tip) => (
                  <div
                    key={tip.title}
                    className="rounded-lg border border-dark-border bg-dark-card p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <tip.icon className="h-4 w-4 text-lime shrink-0" />
                      <span className="text-sm font-medium">{tip.title}</span>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">
                      {tip.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leaderboard Sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-gold/20 bg-dark-card overflow-hidden">
              <div className="flex items-center gap-3 border-b border-dark-border px-5 py-4">
                <Trophy className="h-5 w-5 text-gold" />
                <h2 className="text-lg font-bold">Global Leaderboard</h2>
              </div>

              <div className="max-h-[600px] overflow-y-auto">
                {leaderboardLoading ? (
                  <div className="px-5 py-8 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-lime border-t-transparent" />
                    <p className="mt-2 text-xs text-muted">Loading scores...</p>
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <Gamepad2 className="mx-auto h-8 w-8 text-muted/40 mb-2" />
                    <p className="text-sm text-muted">No scores yet.</p>
                    <p className="text-xs text-muted/60 mt-1">
                      Be the first to play!
                    </p>
                  </div>
                ) : (
                  <div>
                    {leaderboard.map((entry, i) => {
                      const medal =
                        i === 0
                          ? "text-yellow-400"
                          : i === 1
                          ? "text-gray-300"
                          : i === 2
                          ? "text-amber-600"
                          : "text-muted/40";
                      return (
                        <div
                          key={i}
                          className={`flex items-center gap-3 px-5 py-3 border-b border-dark-border/50 last:border-0 ${
                            i < 3 ? "bg-gold/[0.02]" : ""
                          } hover:bg-lime/[0.03] transition-colors`}
                        >
                          <span
                            className={`w-6 text-center text-sm font-bold ${medal}`}
                          >
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="text-sm font-medium truncate">
                                {entry.player_name}
                              </span>
                              <span className="text-sm font-bold text-lime tabular-nums shrink-0">
                                {entry.score.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-[10px] text-muted">
                                Lv {entry.level_reached}
                              </span>
                              {entry.cows_abducted > 0 && (
                                <span className="text-[10px] text-muted">
                                  {entry.cows_abducted} cows
                                </span>
                              )}
                              {entry.max_combo > 0 && (
                                <span className="text-[10px] text-muted">
                                  {entry.max_combo}x combo
                                </span>
                              )}
                              <span className="text-[10px] text-muted/50 ml-auto">
                                {timeAgo(entry.played_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="border-t border-dark-border px-5 py-3">
                <p className="text-[10px] text-muted/50 text-center">
                  Scores update live. Top 50 shown.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-dark-border px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div>
            <Link href="/" className="text-lg font-bold">
              BilbroSwagginz
            </Link>
            <p className="mt-1 text-sm text-muted">
              Building products, tools, and games in public.
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/games" className="hover:text-white transition-colors">
              Arcade
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
