"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Gamepad2,
  Trophy,
  Crosshair,
  Sparkles,
  Menu,
  X,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  BookOpen,
  Code2,
  Gem,
  Factory,
  Map,
  Users,
  Wand2,
  Lightbulb,
  Github,
  ExternalLink,
} from "lucide-react";
import { CommandPalette, CmdKHint } from "@/components/command-palette";
import { gamePrompts, phases } from "@/data/game-prompts";

// ── Helpers ──────────────────────────────────────────────

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, isVisible };
}

function RevealSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`reveal-section ${isVisible ? "revealed" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

// ── Category styling ─────────────────────────────────────

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Ideation: Wand2,
  Narrative: BookOpen,
  "Level Design": Map,
  Multiplayer: Users,
  Technical: Code2,
  Polishing: Gem,
  Production: Factory,
};

const categoryColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  purple: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20", dot: "bg-purple-400" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", dot: "bg-amber-400" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", dot: "bg-emerald-400" },
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20", dot: "bg-cyan-400" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", dot: "bg-blue-400" },
  rose: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20", dot: "bg-rose-400" },
  orange: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20", dot: "bg-orange-400" },
};

// ── Prompt Card ──────────────────────────────────────────

function PromptCard({ prompt }: { prompt: (typeof gamePrompts)[0] }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const colors = categoryColors[prompt.categoryColor] || categoryColors.blue;
  const Icon = categoryIcons[prompt.category] || Sparkles;

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt.prompt);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = prompt.prompt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={`group rounded-xl border bg-dark-card overflow-hidden transition-all duration-300 ${
        expanded
          ? "border-lime/30 shadow-lg shadow-lime/5"
          : "border-dark-border hover:border-lime/20 hover:shadow-md hover:shadow-black/20"
      }`}
    >
      {/* Header */}
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colors.bg} ${colors.border} border`}
          >
            <Icon className={`h-5 w-5 ${colors.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${colors.bg} ${colors.text} ${colors.border} border`}
              >
                <span className={`h-1 w-1 rounded-full ${colors.dot}`} />
                {prompt.category}
              </span>
              <span className="text-[10px] text-muted/40 uppercase tracking-wider">
                Phase {prompt.phase}
              </span>
            </div>
            <h3 className="text-base font-bold sm:text-lg group-hover:text-lime transition-colors leading-tight">
              {prompt.name}
            </h3>
          </div>
        </div>

        <p className="mt-2 text-sm text-lime/60 font-medium">{prompt.tagline}</p>

        <p className="mt-3 text-sm text-muted leading-relaxed">
          {prompt.description}
        </p>

        {/* Tags row */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {prompt.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-dark-border px-2 py-0.5 text-[10px] text-muted/60"
            >
              {tag}
            </span>
          ))}
          {prompt.tags.length > 4 && (
            <span className="rounded-full border border-dark-border px-2 py-0.5 text-[10px] text-muted/40">
              +{prompt.tags.length - 4}
            </span>
          )}
        </div>

        {/* When to use */}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
          {prompt.whenToUse.map((use) => (
            <span
              key={use}
              className="inline-flex items-center gap-1.5 text-xs text-muted/70"
            >
              <span className="h-1 w-1 rounded-full bg-lime/30 shrink-0" />
              {use}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={copyPrompt}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all active:scale-[0.97] ${
              copied
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                : "bg-lime text-dark hover:bg-lime-dark"
            }`}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" /> Copied!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy Prompt
              </>
            )}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dark-border px-4 py-2 text-sm font-medium text-muted hover:text-white hover:border-lime/20 transition-all active:scale-[0.97]"
          >
            {expanded ? (
              <>
                Hide <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                Preview <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expandable prompt body */}
      {expanded && (
        <div className="border-t border-dark-border">
          <div className="relative">
            <pre className="p-5 sm:p-6 text-xs text-muted/80 leading-relaxed whitespace-pre-wrap font-mono max-h-80 overflow-y-auto bg-dark/50 scrollbar-thin">
              {prompt.prompt}
            </pre>
            <button
              onClick={copyPrompt}
              className="absolute top-3 right-3 rounded-lg bg-dark-card border border-dark-border p-2 text-muted hover:text-lime hover:border-lime/20 transition-colors"
              title="Copy prompt"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          {prompt.tips.length > 0 && (
            <div className="border-t border-dark-border px-5 sm:px-6 py-4 bg-lime/[0.02]">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-lime/50 mb-2 flex items-center gap-1.5">
                <Lightbulb className="h-3 w-3" /> Tips
              </p>
              <ul className="space-y-1">
                {prompt.tips.map((tip, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-muted/70"
                  >
                    <span className="h-1 w-1 rounded-full bg-lime/30 shrink-0 mt-1.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Game listing data ────────────────────────────────────

const games = [
  {
    slug: "udderly-abduction",
    name: "Udderly Abduction: Barrage",
    tagline: "A retro bullet-hell about alien cow theft",
    description:
      "Pilot a UFO across a hostile farming planet, abducting cows while dodging increasingly insane bullet patterns from angry farmers, mechs, and crop dusters. Features graze scoring, combo chains, boss fights, and a full narrative layer.",
    status: "Playable",
    genre: "Bullet Hell / Arcade",
    tech: "Vanilla JS + Canvas",
    icon: Crosshair,
  },
];

// ── Mobile menu ──────────────────────────────────────────

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
        <Link href="/" onClick={onClose} className="text-muted hover:text-white transition-colors">Home</Link>
        <Link href="/#products" onClick={onClose} className="text-muted hover:text-white transition-colors">Products</Link>
        <Link href="/games" onClick={onClose} className="text-lime font-medium">Games</Link>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────

export default function GamesPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activePhase, setActivePhase] = useState<number | null>(null);

  const filtered = gamePrompts.filter((p) => {
    const matchesPhase = activePhase === null || p.phase === activePhase;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags.some((t) => t.includes(q)) ||
      p.description.toLowerCase().includes(q);
    return matchesPhase && matchesSearch;
  });

  return (
    <main className="noise-bg min-h-screen">
      <CommandPalette />

      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-dark-border bg-dark/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold">BilbroSwagginz</Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/#products" className="hover:text-white transition-colors">Products</Link>
            <Link href="/games" className="text-white font-medium">Games</Link>
            <CmdKHint />
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-muted hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      </nav>

      {/* ━━━ HERO ━━━ */}
      <section className="relative flex min-h-[50vh] items-center justify-center px-6 pt-20 overflow-hidden">
        <div className="hero-glow" />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-lime/20 bg-lime/5">
            <Gamepad2 className="h-8 w-8 text-lime" />
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            The <span className="gradient-text">Arcade</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
            Play games built from scratch. Use our battle-tested prompts to build
            your own. Compete on the global leaderboard.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#play"
              className="inline-flex items-center gap-2 rounded-lg bg-lime px-6 py-3 text-base font-semibold text-dark hover:bg-lime-dark transition-colors"
            >
              <Gamepad2 className="h-4 w-4" /> Play Now
            </a>
            <a
              href="#prompts"
              className="inline-flex items-center gap-2 rounded-lg border border-purple-500/20 bg-purple-500/10 px-6 py-3 text-base font-semibold text-purple-300 hover:bg-purple-500/20 transition-colors"
            >
              <Sparkles className="h-4 w-4" /> Game Dev Prompts
            </a>
          </div>
        </div>
      </section>

      {/* ━━━ PLAYABLE GAMES ━━━ */}
      <section id="play" className="px-6 py-16">
        <RevealSection>
          <div className="mx-auto max-w-5xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-lime mb-8">
              Playable Games
            </h2>
            {games.map((game) => (
              <Link
                key={game.slug}
                href={`/games/${game.slug}`}
                className="game-card group rounded-xl border border-lime/20 bg-dark-card p-8 block hover:border-lime/40 transition-all hover:shadow-lg hover:shadow-lime/5"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-lime/10 bg-dark">
                    <game.icon className="h-10 w-10 text-lime" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl font-bold group-hover:text-lime transition-colors">
                        {game.name}
                      </h3>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-lime/10 px-3 py-1 text-xs font-medium text-lime border border-lime/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse" />
                        {game.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-lime/70">{game.tagline}</p>
                    <p className="mt-3 text-muted leading-relaxed">{game.description}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-4">
                      <span className="rounded-full border border-dark-border px-3 py-1 text-xs text-muted">
                        {game.genre}
                      </span>
                      <span className="rounded-full border border-dark-border px-3 py-1 text-xs text-muted">
                        {game.tech}
                      </span>
                    </div>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-lime group-hover:underline">
                      Play Now <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* ━━━ LEADERBOARD CTA ━━━ */}
      <section className="px-6 py-16 bg-dark-card">
        <RevealSection>
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-gold/20 bg-gold/5">
              <Trophy className="h-6 w-6 text-gold" />
            </div>
            <h2 className="text-2xl font-bold">Global Leaderboards</h2>
            <p className="mt-3 text-muted">
              Every game tracks scores on a global leaderboard powered by Neon
              Postgres. Compete against players worldwide.
            </p>
            <Link
              href="/games/udderly-abduction"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-lime px-6 py-3 text-base font-semibold text-dark hover:bg-lime-dark transition-colors"
            >
              View Leaderboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </RevealSection>
      </section>

      {/* ━━━ GAME DEV PROMPTS ━━━ */}
      <section id="prompts" className="px-6 pt-20 pb-6">
        <RevealSection>
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/5">
                <Sparkles className="h-7 w-7 text-purple-400" />
              </div>
              <h2 className="text-3xl font-bold sm:text-4xl">
                Game Dev <span className="gradient-text">Prompts</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted">
                Battle-tested AI prompts for every phase of game development.
                Copy, paste, and start building your own games.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-dark-border px-4 py-1.5 text-sm text-muted">
                  <Wand2 className="h-3.5 w-3.5 text-purple-400" />
                  {gamePrompts.length} prompts
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-dark-border px-4 py-1.5 text-sm text-muted">
                  <ArrowRight className="h-3.5 w-3.5 text-lime" />
                  {phases.length} phases
                </span>
                <a
                  href="https://github.com/SubliminalCoding/bilbros-game-dev-prompts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-dark-border px-4 py-1.5 text-sm text-muted hover:text-white hover:border-lime/20 transition-colors"
                >
                  <Github className="h-3.5 w-3.5" />
                  GitHub
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* Phase workflow pipeline */}
      <section className="px-6 py-8 border-y border-dark-border bg-dark-card">
        <div className="mx-auto max-w-5xl">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted/40 mb-4 text-center">
            Workflow Pipeline
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {phases.map((phase) => {
              const pc = categoryColors[phase.color] || categoryColors.emerald;
              const isActive = activePhase === phase.number;
              return (
                <button
                  key={phase.number}
                  onClick={() => setActivePhase(isActive ? null : phase.number)}
                  className={`relative rounded-xl border p-4 text-left transition-all active:scale-[0.97] ${
                    isActive
                      ? `${pc.border} ${pc.bg} shadow-lg`
                      : "border-dark-border hover:border-lime/10 bg-dark"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                        isActive
                          ? `${pc.bg} ${pc.text} ${pc.border} border`
                          : "bg-dark-card text-muted/40 border border-dark-border"
                      }`}
                    >
                      {phase.number}
                    </span>
                    <div
                      className={`h-px flex-1 ${
                        isActive ? pc.border.replace("border-", "bg-") : "bg-dark-border"
                      }`}
                    />
                  </div>
                  <p className={`text-sm font-semibold ${isActive ? "text-white" : "text-muted"}`}>
                    {phase.name}
                  </p>
                  <p className="mt-1 text-[11px] text-muted/50 leading-relaxed">
                    {phase.description}
                  </p>
                  {isActive && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-lime animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
          {activePhase !== null && (
            <p className="mt-4 text-center text-xs text-muted/40">
              Showing Phase {activePhase} prompts.{" "}
              <button
                onClick={() => setActivePhase(null)}
                className="text-lime hover:underline"
              >
                Show all
              </button>
            </p>
          )}
        </div>
      </section>

      {/* Search */}
      <section className="px-6 pt-8 pb-2">
        <div className="mx-auto max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts, categories, tags..."
              className="w-full rounded-xl border border-dark-border bg-dark-card py-3 pl-11 pr-4 text-sm text-white placeholder:text-muted/35 focus:border-lime/30 focus:outline-none focus:ring-1 focus:ring-lime/10 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/40 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="mt-2 text-center text-[11px] text-muted/30">
            {filtered.length} of {gamePrompts.length} prompts
          </p>
        </div>
      </section>

      {/* Prompt Cards Grid */}
      <section className="px-6 py-8">
        <div className="mx-auto max-w-5xl">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Search className="mx-auto h-8 w-8 text-muted/20 mb-3" />
              <p className="text-muted">No prompts match your search.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActivePhase(null);
                }}
                className="mt-3 text-sm text-lime hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {filtered.map((prompt) => (
                <PromptCard key={prompt.slug} prompt={prompt} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contribute CTA */}
      <section className="px-6 py-16 bg-dark-card">
        <RevealSection>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold">Build your own game</h2>
            <p className="mt-3 text-muted max-w-lg mx-auto">
              These prompts are open source. Use them to build your next game, or
              contribute your own battle-tested prompts to help the community.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://github.com/SubliminalCoding/bilbros-game-dev-prompts"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-lime px-6 py-3 text-base font-semibold text-dark hover:bg-lime-dark transition-colors"
              >
                <Github className="h-5 w-5" />
                View on GitHub
              </a>
              <Link
                href="/games/udderly-abduction"
                className="inline-flex items-center gap-2 rounded-lg border border-dark-border px-6 py-3 text-base font-semibold text-white hover:border-muted transition-colors"
              >
                See them in action <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-border px-6 py-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div>
            <Link href="/" className="text-lg font-bold">BilbroSwagginz</Link>
            <p className="mt-1 text-sm text-muted">
              Building products, tools, and games in public.
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/#products" className="hover:text-white transition-colors">Products</Link>
            <Link href="/games" className="hover:text-white transition-colors">Games</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
