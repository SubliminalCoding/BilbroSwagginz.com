"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  Play,
  Zap,
  Brain,
  Layers,
  Rocket,
  Youtube,
  Github,
  Twitter,
  ExternalLink,
  Menu,
  X,
  Mail,
  Calendar,
  Gamepad2,
  Star,
  Wrench,
  Clock,
  Film,
} from "lucide-react";

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
    </svg>
  );
}
import { featuredProducts, toolProducts, products } from "@/data/products";
import { replays, formatReplayDate } from "@/data/replays";
import { CommandPalette, CmdKHint } from "@/components/command-palette";

const stats = [
  { value: String(products.length), label: "Products" },
  { value: String(products.filter((p) => p.tier === "featured").length), label: "Flagship bets" },
  { value: "100%", label: "Built with AI" },
];

const values = [
  { icon: Zap, text: "Move faster" },
  { icon: Brain, text: "Think more clearly" },
  { icon: Layers, text: "Reduce friction" },
  { icon: Rocket, text: "Use AI more effectively" },
  { icon: ArrowRight, text: "Turn ideas into output" },
];

const buildingAround = [
  "AI coding workflows",
  "Product clarity",
  "Automation",
  "Decision systems",
  "Streaming & content",
  "Tools that help people actually ship",
];

const now = [
  "Improving ActuallyShip",
  "Building MeCoach coaching flows",
  "Refining AI coding workflows",
  "Testing automation systems with OpenClaw",
  "Shortening the path from idea to shipped product",
];

const buildLog = [
  {
    date: "Mar 23, 2026",
    title: "AgentReplay + Vibe Coding Stack + full site polish",
    description:
      "Shipped the AgentReplay archive with real AMC exports, added the Vibe Coding Stack ecosystem section, rebranded products (AgentReplay, VoiceForge), added trial CTA for ActuallyShip, and ran de-slopify + bug hunter passes.",
    tag: "Site",
  },
  {
    date: "Mar 23, 2026",
    title: "Product studio restructure",
    description:
      "Reorganized the site into Featured Products and Builder Tools. Clearer hierarchy, stronger positioning.",
    tag: "Site",
  },
  {
    date: "Mar 22, 2026",
    title: "Arcade section + Udderly Abduction: Barrage",
    description:
      "Shipped the Games section with the first playable title. Full browser game with global leaderboard powered by Neon Postgres.",
    tag: "Games",
  },
  {
    date: "Mar 22, 2026",
    title: "BilbroSwagginz.com v2 launched",
    description:
      "Full site rebuild with scroll animations, build log, and email capture.",
    tag: "Site",
  },
  {
    date: "Mar 20, 2026",
    title: "ActuallyShip planning flow v2",
    description:
      "Rewrote the brief generation pipeline. Faster context parsing, cleaner output.",
    tag: "ActuallyShip",
  },
  {
    date: "Mar 18, 2026",
    title: "SocialForge draft engine prototyped",
    description:
      "First working version of the idea-to-draft pipeline. Supports Twitter and LinkedIn formats.",
    tag: "SocialForge",
  },
  {
    date: "Mar 15, 2026",
    title: "OpenClaw automation tests",
    description:
      "Ran first batch of automated workflow tests. Found 3 edge cases in the scheduling logic.",
    tag: "Automation",
  },
  {
    date: "Mar 12, 2026",
    title: "MeCoach coaching framework defined",
    description:
      "Mapped out the reflection loop model. Four stages: prompt, reflect, reframe, commit.",
    tag: "MeCoach",
  },
];

// Scroll animation hook
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

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Live: "bg-lime/10 text-lime border-lime/20",
    "Early Access": "bg-lime/10 text-lime border-lime/20",
    "In Progress": "bg-gold/10 text-gold border-gold/20",
    Experiment: "bg-white/5 text-muted border-dark-border",
  };
  const isActive = status === "Live" || status === "Early Access";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${
        colors[status] || "bg-white/5 text-muted border-dark-border"
      }`}
    >
      {isActive && (
        <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse" />
      )}
      {status}
    </span>
  );
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
        <a
          href="#products"
          onClick={onClose}
          className="text-muted hover:text-white transition-colors"
        >
          Products
        </a>
        <a
          href="#log"
          onClick={onClose}
          className="text-muted hover:text-white transition-colors"
        >
          Build Log
        </a>
        <a
          href="/replays"
          onClick={onClose}
          className="text-muted hover:text-white transition-colors"
        >
          Replays
        </a>
        <a
          href="https://www.youtube.com/channel/UCU0uyjCjL9gcwKhGc_9kW8A"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="text-muted hover:text-white transition-colors"
        >
          YouTube
        </a>
        <a
          href="#about"
          onClick={onClose}
          className="text-muted hover:text-white transition-colors"
        >
          About
        </a>
        <a
          href="#products"
          onClick={onClose}
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-lime px-4 py-2 text-sm font-semibold text-dark hover:bg-lime-dark transition-colors"
        >
          View Products
        </a>
      </div>
    </div>
  );
}

function EmailCapture() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || sending) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Could not connect. Try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-10 mx-auto max-w-md">
      {submitted ? (
        <div className="rounded-lg border border-lime/20 bg-lime/5 px-6 py-4 text-center">
          <p className="text-lime font-medium">You&apos;re in.</p>
          <p className="mt-1 text-sm text-muted">
            I&apos;ll send updates when something ships.
          </p>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={sending}
                className="w-full rounded-lg border border-dark-border bg-dark-card py-3 pl-10 pr-4 text-sm text-white placeholder:text-muted/60 focus:border-lime/40 focus:outline-none focus:ring-1 focus:ring-lime/20 transition-colors disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="rounded-lg bg-lime px-5 py-3 text-sm font-semibold text-dark hover:bg-lime-dark transition-colors shrink-0 disabled:opacity-50"
            >
              {sending ? "..." : "Get updates"}
            </button>
          </form>
          {error && (
            <p className="mt-2 text-xs text-red-400">{error}</p>
          )}
        </>
      )}
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="noise-bg min-h-screen">
      <CommandPalette />

      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-dark-border bg-dark/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold">BilbroSwagginz</span>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted">
            <a
              href="#products"
              className="hover:text-white transition-colors"
            >
              Products
            </a>
            <a href="#log" className="hover:text-white transition-colors">
              Build Log
            </a>
            <a href="/replays" className="hover:text-white transition-colors">
              Replays
            </a>
            <a
              href="https://www.youtube.com/channel/UCU0uyjCjL9gcwKhGc_9kW8A"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              YouTube
            </a>
            <a href="#about" className="hover:text-white transition-colors">
              About
            </a>
            <CmdKHint />
            <a
              href="#products"
              className="rounded-lg bg-lime px-4 py-2 text-sm font-semibold text-dark hover:bg-lime-dark transition-colors"
            >
              View Products
            </a>
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

      {/* Hero */}
      <section className="relative flex min-h-[85vh] items-center justify-center px-6 pt-20 overflow-hidden">
        <div className="hero-glow" />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/bilbro.jpg"
            alt="Bilbro's Coding"
            className="hero-avatar mx-auto mb-8 h-36 w-36 rounded-full object-cover sm:h-44 sm:w-44"
          />
          <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            AI-powered products{" "}
            <span className="gradient-text">built in public.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
            A product studio around thinking, building, shipping, and automation.
            Flagship products. Builder tools. Everything AI-first.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="#products"
              className="inline-flex items-center gap-2 rounded-lg bg-lime px-6 py-3 text-base font-semibold text-dark hover:bg-lime-dark transition-colors"
            >
              View Products <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#live"
              className="inline-flex items-center gap-2 rounded-lg border border-dark-border px-6 py-3 text-base font-semibold text-white hover:border-muted transition-colors"
            >
              <Play className="h-4 w-4" /> Watch me build live
            </a>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-y border-dark-border bg-dark-card">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="grid grid-cols-3 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-item">
                <p className="text-3xl font-bold text-lime">{stat.value}</p>
                <p className="mt-1 text-sm text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About / What this site is */}
      <section id="about" className="px-6 py-24">
        <RevealSection>
          <div className="mx-auto max-w-3xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-lime">
              What this site is
            </h2>
            <p className="mt-4 text-2xl font-semibold leading-relaxed">
              BilbroSwagginz.com is a product studio.
            </p>
            <p className="mt-4 text-lg text-muted leading-relaxed">
              I build AI-powered tools and ship them publicly. Some are
              flagship products. Some are supporting tools. All of it is
              documented as it happens, from first commit to launch.
            </p>
          </div>
        </RevealSection>
      </section>

      {/* The Vibe Coding Stack */}
      <section id="stack" className="px-6 py-24 bg-dark-card">
        <RevealSection>
          <div className="mx-auto max-w-5xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-lime">
              The Vibe Coding Stack
            </h2>
            <p className="mt-4 text-2xl font-semibold">
              A connected set of tools for thinking, building, capturing, replaying, and shipping.
            </p>
            <p className="mt-4 text-lg text-muted leading-relaxed">
              Each product works on its own. Together they cover the full loop
              from messy idea to shipped software to published content. Each
              piece does one thing well and feeds into the next.
            </p>

            {/* Ecosystem map — 6 stages, 6 products */}
            <div className="mt-14">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Capture */}
                <div className="rounded-xl border border-dark-border bg-dark p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted/60 mb-3">
                    1. Capture
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime/10 text-lime text-sm font-bold shrink-0">V</span>
                    <div>
                      <p className="font-semibold text-sm">VoiceForge</p>
                      <p className="text-xs text-muted">Speak ideas, get usable text. Feeds into everything else.</p>
                    </div>
                  </div>
                </div>

                {/* Think */}
                <div className="rounded-xl border border-lime/20 bg-dark p-5 ring-1 ring-lime/5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted/60 mb-3">
                    2. Think
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime/10 text-lime text-sm font-bold shrink-0">A</span>
                    <div>
                      <p className="font-semibold text-sm">ActuallyShip</p>
                      <p className="text-xs text-muted">Decide what to build. Scope it. Get a build-ready brief.</p>
                    </div>
                  </div>
                </div>

                {/* Build */}
                <div className="rounded-xl border border-dark-border bg-dark p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted/60 mb-3">
                    3. Build
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-dark-card text-muted text-sm font-bold shrink-0">I</span>
                    <div>
                      <p className="font-semibold text-sm">ActuallyShip IDE</p>
                      <p className="text-xs text-muted">Execution environment for turning plans and prompts into shipped code.</p>
                    </div>
                  </div>
                </div>

                {/* Replay */}
                <div className="rounded-xl border border-dark-border bg-dark p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted/60 mb-3">
                    4. Replay
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime/10 text-lime text-sm font-bold shrink-0">R</span>
                    <div>
                      <p className="font-semibold text-sm">AgentReplay</p>
                      <p className="text-xs text-muted">Review what happened. Chapters, key moments, transcripts, and lessons from every session.</p>
                    </div>
                  </div>
                </div>

                {/* Reflect */}
                <div className="rounded-xl border border-lime/20 bg-dark p-5 ring-1 ring-lime/5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted/60 mb-3">
                    5. Reflect
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime/10 text-lime text-sm font-bold shrink-0">M</span>
                    <div>
                      <p className="font-semibold text-sm">MeCoach</p>
                      <p className="text-xs text-muted">Step back. Clearer thinking, better decisions, stronger forward motion.</p>
                    </div>
                  </div>
                </div>

                {/* Share */}
                <div className="rounded-xl border border-dark-border bg-dark p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted/60 mb-3">
                    6. Share
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime/10 text-lime text-sm font-bold shrink-0">S</span>
                    <div>
                      <p className="font-semibold text-sm">SocialForge</p>
                      <p className="text-xs text-muted">Turn build progress into content drafts. Publishing as part of the workflow.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flow line */}
              <div className="mt-8 text-center">
                <p className="text-xs text-muted/50 font-mono">
                  capture &rarr; think &rarr; build &rarr; replay &rarr; reflect &rarr; share &rarr; repeat
                </p>
              </div>
            </div>

            {/* Early access note */}
            <div className="mt-12 rounded-xl border border-dark-border bg-dark p-6">
              <p className="text-sm font-semibold">Early access, not a finished bundle.</p>
              <p className="mt-2 text-sm text-muted leading-relaxed">
                Some of these tools are live. Some are still being built. The
                stack is real and I use it daily, but it is early. If you want
                to try the tools as they ship, join the list. When enough of the
                stack is ready, there will be a bundled offer for people who want
                the whole thing.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="#products"
                  className="inline-flex items-center gap-2 rounded-lg bg-lime px-4 py-2 text-sm font-semibold text-dark hover:bg-lime-dark transition-colors"
                >
                  See individual products <ArrowRight className="h-3.5 w-3.5" />
                </a>
                <a
                  href="#email"
                  className="inline-flex items-center gap-2 rounded-lg border border-dark-border px-4 py-2 text-sm font-semibold text-white hover:border-muted transition-colors"
                >
                  Get notified when the bundle ships
                </a>
              </div>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* Featured Products */}
      <section id="products" className="px-6 py-24 bg-dark-card">
        <RevealSection>
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-lime" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-lime">
                Featured Products
              </h2>
            </div>
            <p className="mt-4 text-2xl font-semibold">
              The flagship bets.
            </p>
            <p className="mt-2 text-muted">
              These are the products getting the most focus, investment, and iteration right now.
            </p>
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {featuredProducts.map((product) => {
                const hasExternalLink = !!product.href;
                return (
                  <a
                    key={product.name}
                    href={hasExternalLink ? product.href : `/products/${product.slug}`}
                    target={hasExternalLink ? "_blank" : undefined}
                    rel={hasExternalLink ? "noopener noreferrer" : undefined}
                    className="featured-card group rounded-xl border border-lime/20 bg-dark p-8 block ring-1 ring-lime/5 hover:border-lime/40 hover:ring-lime/10 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="text-2xl font-bold group-hover:text-lime transition-colors">
                        {product.name}
                      </h3>
                      <StatusBadge status={product.status} />
                    </div>
                    <p className="mt-3 text-base font-medium text-lime/80">
                      {product.tagline}
                    </p>
                    <p className="mt-4 text-sm text-muted leading-relaxed">
                      {product.description}
                    </p>
                    <p className="mt-4 text-xs text-muted">
                      {product.category}
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-4">
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-lime group-hover:underline">
                        {product.cta}{" "}
                        <ExternalLink className="h-3 w-3" />
                      </span>
                      {product.trialUrl && (
                        <span
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(product.trialUrl, "_blank");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-lime px-3 py-1.5 text-xs font-semibold text-dark hover:bg-lime-dark transition-colors cursor-pointer"
                        >
                          {product.trialCta || "Try free"}
                        </span>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* Builder & Creator Tools */}
      <section id="tools" className="px-6 py-24">
        <RevealSection>
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center gap-3">
              <Wrench className="h-5 w-5 text-muted" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-lime">
                Builder &amp; Creator Tools
              </h2>
            </div>
            <p className="mt-4 text-2xl font-semibold">
              Systems, tools, and experiments.
            </p>
            <p className="mt-2 text-muted">
              Supporting tools that power the workflow, plus early experiments worth tracking.
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {toolProducts.map((product) => {
                const hasExternalLink = !!product.href;
                return (
                  <a
                    key={product.name}
                    href={hasExternalLink ? product.href : `/products/${product.slug}`}
                    target={hasExternalLink ? "_blank" : undefined}
                    rel={hasExternalLink ? "noopener noreferrer" : undefined}
                    className="product-card group rounded-xl border border-dark-border bg-dark-card p-5 block hover:border-lime/20"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold group-hover:text-lime transition-colors">
                        {product.name}
                      </h3>
                      <StatusBadge status={product.status} />
                    </div>
                    <p className="mt-2 text-xs font-medium text-lime/60">
                      {product.tagline}
                    </p>
                    <p className="mt-3 text-xs text-muted leading-relaxed">
                      {product.description}
                    </p>
                    <p className="mt-3 text-[11px] text-muted/60">
                      {product.category}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-lime group-hover:underline">
                      {product.cta}{" "}
                      <ExternalLink className="h-3 w-3" />
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* Games Showcase */}
      <section id="games" className="px-6 py-24 bg-dark-card">
        <RevealSection>
          <div className="mx-auto max-w-5xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-lime">
              The Arcade
            </h2>
            <p className="mt-4 text-2xl font-semibold">
              Games built from scratch, playable in your browser.
            </p>
            <a
              href="/games/udderly-abduction"
              className="mt-8 group block rounded-xl border border-lime/20 bg-dark p-6 hover:border-lime/40 transition-all hover:shadow-lg hover:shadow-lime/5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-lime/10 bg-dark-card">
                  <Gamepad2 className="h-7 w-7 text-lime" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-bold group-hover:text-lime transition-colors">
                      Udderly Abduction: Barrage
                    </h3>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-lime/10 px-2.5 py-0.5 text-xs font-medium text-lime border border-lime/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse" />
                      Playable
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    Retro bullet-hell. Pilot a UFO, steal cows, dodge insane bullet patterns, and fight bosses. Global leaderboard included.
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-lime shrink-0 hidden sm:block" />
              </div>
            </a>
            <div className="mt-6 text-center">
              <a
                href="/games"
                className="text-sm text-lime hover:underline"
              >
                View all games
              </a>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* Build Log */}
      <section id="log" className="px-6 py-24">
        <RevealSection>
          <div className="mx-auto max-w-3xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-lime">
              Build log
            </h2>
            <p className="mt-4 text-2xl font-semibold">
              What&apos;s actually happening, week by week.
            </p>
            <div className="mt-10 space-y-0">
              {buildLog.map((entry, i) => (
                <div
                  key={i}
                  className="group relative flex gap-6 pb-8 last:pb-0"
                >
                  {i < buildLog.length - 1 && (
                    <div className="absolute left-[7px] top-[20px] h-full w-px bg-dark-border" />
                  )}
                  <div className="relative mt-1.5 h-[15px] w-[15px] shrink-0">
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-dark-border bg-dark group-hover:border-lime/40 transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1.5 text-xs text-muted">
                        <Calendar className="h-3 w-3" />
                        {entry.date}
                      </span>
                      <span className="rounded-full border border-dark-border px-2.5 py-0.5 text-xs text-muted">
                        {entry.tag}
                      </span>
                    </div>
                    <h3 className="mt-1.5 font-semibold group-hover:text-lime transition-colors">
                      {entry.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted leading-relaxed">
                      {entry.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* AgentReplay */}
      <section id="replays" className="px-6 py-24 bg-dark-card">
        <RevealSection>
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center gap-3">
              <Film className="h-5 w-5 text-lime" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-lime">
                AgentReplay
              </h2>
            </div>
            <p className="mt-4 text-2xl font-semibold">
              Turn live AI coding sessions into interactive replays.
            </p>
            <p className="mt-2 text-muted">
              Chapters, key moments, full transcripts, and lessons extracted
              from every build session. Watch how it actually gets made.
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {replays.slice(0, 3).map((replay) => (
                <a
                  key={replay.slug}
                  href={`/replays/${replay.slug}`}
                  className="product-card group rounded-xl border border-dark-border bg-dark p-5 block hover:border-lime/20"
                >
                  <h3 className="text-sm font-bold leading-snug group-hover:text-lime transition-colors">
                    {replay.title}
                  </h3>
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatReplayDate(replay.date)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {replay.duration}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="rounded-full border border-dark-border px-2 py-0.5 text-[10px] text-muted">
                      {replay.projectName}
                    </span>
                    {replay.chapters.length > 0 && (
                      <span className="rounded-full border border-dark-border px-2 py-0.5 text-[10px] text-muted">
                        {replay.chapters.length} chapters
                      </span>
                    )}
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-lime group-hover:underline">
                    View session <ArrowRight className="h-3 w-3" />
                  </span>
                </a>
              ))}
            </div>
            <div className="mt-8 text-center">
              <a
                href="/replays"
                className="inline-flex items-center gap-2 text-sm font-medium text-lime hover:underline"
              >
                View all {replays.length} sessions{" "}
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* Build Philosophy */}
      <section className="px-6 py-24">
        <RevealSection>
          <div className="mx-auto max-w-5xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-lime">
              What I care about
            </h2>
            <p className="mt-4 text-2xl font-semibold">
              I&apos;m interested in products that make people:
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {values.map((v) => (
                <div
                  key={v.text}
                  className="flex items-center gap-3 rounded-lg border border-dark-border p-4 transition-colors hover:border-lime/20"
                >
                  <v.icon className="h-5 w-5 text-lime shrink-0" />
                  <span className="text-sm">{v.text}</span>
                </div>
              ))}
            </div>
            <p className="mt-12 text-lg text-muted">
              That usually means building around:
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {buildingAround.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-dark-border px-4 py-2 text-sm transition-colors hover:border-lime/20 hover:text-white"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* Live Builds */}
      <section id="live" className="px-6 py-24">
        <RevealSection>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-lime">
              Watch me build live
            </h2>
            <p className="mt-4 text-2xl font-semibold">
              A lot of this gets built in public.
            </p>
            <p className="mt-4 text-lg text-muted leading-relaxed">
              I stream build sessions, fix things live, and show the real
              process. AI tools, coding agents, and messy iteration included.
            </p>
            <a
              href="https://www.youtube.com/channel/UCU0uyjCjL9gcwKhGc_9kW8A"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-base font-semibold text-white hover:bg-red-700 transition-colors"
            >
              <Youtube className="h-5 w-5" /> Watch on YouTube
            </a>
          </div>
        </RevealSection>
      </section>

      {/* Now */}
      <section className="px-6 py-24 bg-dark-card">
        <RevealSection>
          <div className="mx-auto max-w-3xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-lime">
              Right now
            </h2>
            <p className="mt-4 text-lg text-muted">Currently focused on:</p>
            <ul className="mt-6 space-y-3">
              {now.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-lime shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </RevealSection>
      </section>

      {/* Final CTA + Email Capture */}
      <section id="email" className="px-6 py-24">
        <RevealSection>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold">Stay in the loop</h2>
            <p className="mt-4 text-lg text-muted">
              Get a short update when I ship something new. No spam, no fluff.
            </p>
            <EmailCapture />
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a
                href="#products"
                className="inline-flex items-center gap-2 rounded-lg bg-lime px-6 py-3 text-base font-semibold text-dark hover:bg-lime-dark transition-colors"
              >
                View Products <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#live"
                className="inline-flex items-center gap-2 rounded-lg border border-dark-border px-6 py-3 text-base font-semibold text-white hover:border-muted transition-colors"
              >
                <Play className="h-4 w-4" /> Watch live builds
              </a>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-border px-6 py-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div>
            <p className="text-lg font-bold">BilbroSwagginz</p>
            <p className="mt-1 text-sm text-muted">
              A product studio for AI-powered tools, built in public.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://www.youtube.com/channel/UCU0uyjCjL9gcwKhGc_9kW8A"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-white transition-colors"
              aria-label="YouTube"
            >
              <Youtube className="h-5 w-5" />
            </a>
            <a
              href="https://github.com/SubliminalCoding"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://x.com/GetActuallyShip"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-white transition-colors"
              aria-label="Twitter / X"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="https://discord.gg/T34W6Dp8NJ"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-white transition-colors"
              aria-label="Discord"
            >
              <DiscordIcon className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href="#products"
              className="text-sm text-muted hover:text-white transition-colors"
            >
              Products
            </a>
            <a
              href="#log"
              className="text-sm text-muted hover:text-white transition-colors"
            >
              Build Log
            </a>
            <a
              href="/replays"
              className="text-sm text-muted hover:text-white transition-colors"
            >
              Replays
            </a>
            <a
              href="/games"
              className="text-sm text-muted hover:text-white transition-colors"
            >
              Games
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
