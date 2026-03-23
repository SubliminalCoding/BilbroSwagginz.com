"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  Menu,
  X,
  Sparkles,
  BookOpen,
  Code2,
  Gem,
  Factory,
  Map,
  Users,
  Wand2,
  Github,
  Lightbulb,
  ExternalLink,
} from "lucide-react";
import { CommandPalette, CmdKHint } from "@/components/command-palette";
import { gamePrompts, phases } from "@/data/game-prompts";

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

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(el); }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, isVisible };
}

function RevealSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div ref={ref} className={`reveal-section ${isVisible ? "revealed" : ""} ${className}`}>
      {children}
    </div>
  );
}

function PromptCard({ prompt, index }: { prompt: typeof gamePrompts[0]; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const colors = categoryColors[prompt.categoryColor] || categoryColors.blue;
  const Icon = categoryIcons[prompt.category] || Sparkles;

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = prompt.prompt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div
      className={`group rounded-xl border bg-dark-card overflow-hidden transition-all duration-300 ${
        expanded ? "border-lime/30 shadow-lg shadow-lime/5" : "border-dark-border hover:border-lime/20"
      }`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Card Header */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors.bg} ${colors.border} border`}>
            <Icon className={`h-6 w-6 ${colors.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${colors.bg} ${colors.text} ${colors.border} border`}>
                <span className={`h-1 w-1 rounded-full ${colors.dot}`} />
                {prompt.category}
              </span>
              <span className="text-[10px] text-muted/50 uppercase tracking-wider">
                Phase {prompt.phase}
              </span>
            </div>
            <h3 className="text-lg font-bold group-hover:text-lime transition-colors">
              {prompt.name}
            </h3>
            <p className="mt-1 text-sm text-lime/70 font-medium">
              {prompt.tagline}
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted leading-relaxed">
          {prompt.description}
        </p>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {prompt.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-dark-border px-2 py-0.5 text-[10px] text-muted/70 hover:text-muted hover:border-dark-border/80 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* When to Use */}
        <div className="mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted/50 mb-2">
            When to use
          </p>
          <div className="flex flex-wrap gap-2">
            {prompt.whenToUse.map((use) => (
              <span
                key={use}
                className="inline-flex items-center gap-1 text-xs text-muted"
              >
                <span className="h-1 w-1 rounded-full bg-lime/40 shrink-0" />
                {use}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={copyPrompt}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all active:scale-[0.97] ${
              copied
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-lime text-dark hover:bg-lime-dark"
            }`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" /> Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" /> Copy Prompt
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

      {/* Expandable Prompt Content */}
      {expanded && (
        <div className="border-t border-dark-border">
          <div className="relative">
            <pre className="p-6 text-xs text-muted/80 leading-relaxed whitespace-pre-wrap font-mono max-h-96 overflow-y-auto bg-dark/50">
              {prompt.prompt}
            </pre>
            <button
              onClick={copyPrompt}
              className="absolute top-3 right-3 rounded-lg bg-dark-card border border-dark-border p-2 text-muted hover:text-lime hover:border-lime/20 transition-colors"
              title="Copy prompt"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          {/* Tips */}
          {prompt.tips.length > 0 && (
            <div className="border-t border-dark-border px-6 py-4 bg-lime/[0.02]">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-lime/60 mb-2 flex items-center gap-1.5">
                <Lightbulb className="h-3 w-3" /> Pro Tips
              </p>
              <ul className="space-y-1">
                {prompt.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted">
                    <span className="h-1 w-1 rounded-full bg-lime/40 shrink-0 mt-1.5" />
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

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="mobile-menu md:hidden absolute top-full left-0 w-full border-b border-dark-border bg-dark/95 backdrop-blur-md">
      <div className="flex flex-col gap-4 px-6 py-6">
        <Link href="/" onClick={onClose} className="text-muted hover:text-white transition-colors">Home</Link>
        <Link href="/games" onClick={onClose} className="text-muted hover:text-white transition-colors">Games</Link>
        <Link href="/games/prompts" onClick={onClose} className="text-lime font-medium">Game Dev Prompts</Link>
      </div>
    </div>
  );
}

export default function GamePromptsPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activePhase, setActivePhase] = useState<number | null>(null);

  const filtered = gamePrompts.filter((p) => {
    const matchesPhase = activePhase === null || p.phase === activePhase;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
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
            <Link href="/games" className="hover:text-white transition-colors">Games</Link>
            <span className="text-white font-medium">Game Dev Prompts</span>
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

      {/* Hero */}
      <section className="relative flex min-h-[45vh] items-center justify-center px-6 pt-20 overflow-hidden">
        <div className="hero-glow" />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/5">
            <Sparkles className="h-8 w-8 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Game Dev <span className="gradient-text">Prompts</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
            Battle-tested AI prompts for every phase of game development. From
            concept to shipped product. Copy, paste, and build.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
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
              View on GitHub
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </section>

      {/* Workflow Pipeline */}
      <section className="px-6 py-12 border-y border-dark-border bg-dark-card">
        <RevealSection>
          <div className="mx-auto max-w-5xl">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted/50 mb-6 text-center">
              Recommended Workflow
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {phases.map((phase) => {
                const phaseColors = categoryColors[phase.color] || categoryColors.emerald;
                const isActive = activePhase === phase.number;
                return (
                  <button
                    key={phase.number}
                    onClick={() => setActivePhase(isActive ? null : phase.number)}
                    className={`relative rounded-xl border p-4 text-left transition-all active:scale-[0.97] ${
                      isActive
                        ? `${phaseColors.border} ${phaseColors.bg} shadow-lg`
                        : "border-dark-border hover:border-lime/10 bg-dark"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold ${isActive ? phaseColors.text : "text-muted/50"}`}>
                        {phase.number}
                      </span>
                      <div className={`h-px flex-1 ${isActive ? phaseColors.border.replace("border-", "bg-") : "bg-dark-border"}`} />
                    </div>
                    <p className={`text-sm font-semibold ${isActive ? "text-white" : "text-muted"}`}>
                      {phase.name}
                    </p>
                    <p className="mt-1 text-[11px] text-muted/60 leading-relaxed">
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
              <p className="mt-4 text-center text-xs text-muted/50">
                Showing Phase {activePhase} prompts.{" "}
                <button onClick={() => setActivePhase(null)} className="text-lime hover:underline">
                  Show all
                </button>
              </p>
            )}
          </div>
        </RevealSection>
      </section>

      {/* Search */}
      <section className="px-6 pt-12 pb-4">
        <div className="mx-auto max-w-5xl">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts, categories, tags..."
              className="w-full rounded-xl border border-dark-border bg-dark-card py-3 pl-11 pr-4 text-sm text-white placeholder:text-muted/40 focus:border-lime/30 focus:outline-none focus:ring-1 focus:ring-lime/10 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/50 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="mt-3 text-center text-xs text-muted/40">
            {filtered.length} of {gamePrompts.length} prompts
          </p>
        </div>
      </section>

      {/* Prompt Cards */}
      <section className="px-6 py-8">
        <div className="mx-auto max-w-5xl">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Search className="mx-auto h-8 w-8 text-muted/30 mb-3" />
              <p className="text-muted">No prompts match your search.</p>
              <button
                onClick={() => { setSearchQuery(""); setActivePhase(null); }}
                className="mt-3 text-sm text-lime hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filtered.map((prompt, i) => (
                <PromptCard key={prompt.slug} prompt={prompt} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 bg-dark-card">
        <RevealSection>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold">Want to contribute?</h2>
            <p className="mt-3 text-muted">
              These prompts are open source. Submit your own battle-tested game
              dev prompts or improve existing ones.
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
            <p className="mt-1 text-sm text-muted">Building products, tools, and games in public.</p>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/games" className="hover:text-white transition-colors">Arcade</Link>
            <Link href="/games/prompts" className="hover:text-white transition-colors">Prompts</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
