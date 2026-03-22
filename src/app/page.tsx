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
} from "lucide-react";

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
    </svg>
  );
}
import Link from "next/link";
import { products } from "@/data/products";
import { CommandPalette, CmdKHint } from "@/components/command-palette";

const stats = [
  { value: String(products.length), label: "Products" },
  { value: String(products.filter((p) => p.status === "Live").length), label: "Live now" },
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
  "Tools that help people actually ship",
];

const now = [
  "Improving ActuallyShip",
  "Refining AI coding workflows",
  "Testing automation systems with OpenClaw",
  "Shortening the path from idea to shipped product",
];

const buildLog = [
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
  const isLive = status === "Live";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        isLive
          ? "bg-lime/10 text-lime border border-lime/20"
          : "bg-white/5 text-muted border border-dark-border"
      }`}
    >
      {isLive && (
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
          href="#about"
          onClick={onClose}
          className="text-muted hover:text-white transition-colors"
        >
          About
        </a>
        <a
          href="#log"
          onClick={onClose}
          className="text-muted hover:text-white transition-colors"
        >
          Build Log
        </a>
        <a
          href="#live"
          onClick={onClose}
          className="text-muted hover:text-white transition-colors"
        >
          Live Builds
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
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
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full rounded-lg border border-dark-border bg-dark-card py-3 pl-10 pr-4 text-sm text-white placeholder:text-muted/60 focus:border-lime/40 focus:outline-none focus:ring-1 focus:ring-lime/20 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-lime px-5 py-3 text-sm font-semibold text-dark hover:bg-lime-dark transition-colors shrink-0"
          >
            Get updates
          </button>
        </form>
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
            <a href="#about" className="hover:text-white transition-colors">
              About
            </a>
            <a href="#log" className="hover:text-white transition-colors">
              Build Log
            </a>
            <a href="#live" className="hover:text-white transition-colors">
              Live Builds
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
            Building AI-powered products{" "}
            <span className="gradient-text">in public.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
            Apps, tools, and experiments around AI workflows, coding agents,
            automation, and product execution.
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

      {/* About */}
      <section id="about" className="px-6 py-24">
        <RevealSection>
          <div className="mx-auto max-w-3xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-lime">
              What this site is
            </h2>
            <p className="mt-4 text-2xl font-semibold leading-relaxed">
              BilbroSwagginz.com is my builder hub.
            </p>
            <p className="mt-4 text-lg text-muted leading-relaxed">
              This is where I keep the products I&apos;m working on, the
              experiments I&apos;m testing, and the ideas I&apos;m turning into
              shipped software.
            </p>
            <p className="mt-4 text-lg text-muted leading-relaxed">
              Some projects are live. Some are in progress. Some are weird. All
              of them are part of the process.
            </p>
          </div>
        </RevealSection>
      </section>

      {/* Products */}
      <section id="products" className="px-6 py-24 bg-dark-card">
        <RevealSection>
          <div className="mx-auto max-w-5xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-lime">
              What I&apos;m building
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {products.map((product) => {
                const isLive = product.status === "Live";
                const hasExternalLink = !!product.href;
                return (
                  <a
                    key={product.name}
                    href={hasExternalLink ? product.href : `/products/${product.slug}`}
                    target={hasExternalLink ? "_blank" : undefined}
                    rel={hasExternalLink ? "noopener noreferrer" : undefined}
                    className={`product-card group rounded-xl border p-6 block ${
                      isLive
                        ? "border-lime/20 bg-dark ring-1 ring-lime/5"
                        : "border-dark-border bg-dark"
                    } hover:border-lime/30`}
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-bold">{product.name}</h3>
                      <StatusBadge status={product.status} />
                    </div>
                    <p className="mt-2 text-sm font-medium text-lime/80">
                      {product.tagline}
                    </p>
                    <p className="mt-3 text-sm text-muted leading-relaxed">
                      {product.description}
                    </p>
                    <p className="mt-4 text-xs text-muted">
                      {product.category}
                    </p>
                    <span
                      className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-lime group-hover:underline"
                    >
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

      {/* Build Philosophy */}
      <section className="px-6 py-24 bg-dark-card">
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
              I use live streams and public build sessions to test ideas, fix
              broken stuff, sharpen products, and show the actual process behind
              shipping software.
            </p>
            <p className="mt-4 text-muted">
              AI tools, coding agents, indie products, and messy iteration
              included.
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

      {/* Why Follow */}
      <section className="px-6 py-24">
        <RevealSection>
          <div className="mx-auto max-w-3xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-lime">
              Why follow along
            </h2>
            <p className="mt-4 text-2xl font-semibold">
              I ship AI-powered products and document the whole process.
            </p>
            <p className="mt-4 text-lg text-muted leading-relaxed">
              This site tracks what&apos;s live, what&apos;s changing, and
              what&apos;s coming next. If you want to see how AI tools turn
              into finished software, this is where I track it.
            </p>
          </div>
        </RevealSection>
      </section>

      {/* Final CTA + Email Capture */}
      <section className="px-6 py-24 bg-dark-card">
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
              Building products, tools, and experiments in public.
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
          </div>
        </div>
      </footer>
    </main>
  );
}
