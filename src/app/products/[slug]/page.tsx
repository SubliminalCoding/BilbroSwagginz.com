import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { products, getProduct } from "@/data/products";
import type { Metadata } from "next";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} — BilbroSwagginz`,
    description: product.tagline,
    openGraph: {
      title: `${product.name} — BilbroSwagginz`,
      description: product.tagline,
    },
  };
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Live: "bg-lime/10 text-lime border-lime/20",
    "Early Access": "bg-lime/10 text-lime border-lime/20",
    "In Progress": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
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

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const currentIndex = products.findIndex((p) => p.slug === slug);
  const prev = currentIndex > 0 ? products[currentIndex - 1] : null;
  const next =
    currentIndex < products.length - 1 ? products[currentIndex + 1] : null;

  return (
    <main className="min-h-screen">
      {/* Top bar */}
      <nav className="fixed top-0 z-50 w-full border-b border-dark-border bg-dark/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            BilbroSwagginz
          </Link>
          <StatusBadge status={product.status} />
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-32 pb-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-lime">
            {product.category}
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-4 text-xl text-muted">{product.tagline}</p>
          {product.trialUrl && (
            <a
              href={product.trialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-lime px-5 py-3 text-sm font-semibold text-dark hover:bg-lime-dark transition-colors"
            >
              {product.trialCta || "Try free"}
            </a>
          )}
        </div>
      </section>

      {/* Long description */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-lg text-muted leading-relaxed">
            {product.longDescription}
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 bg-dark-card">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-lime">
            Features
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {product.features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-dark-border bg-dark p-6 transition-all hover:border-lime/20"
              >
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-lime">
            Who this is for
          </h2>
          <ul className="mt-8 space-y-4">
            {product.useCases.map((useCase) => (
              <li key={useCase} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-lime shrink-0" />
                <span className="text-muted">{useCase}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Stack */}
      <section className="px-6 py-20 bg-dark-card">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-lime">
            Built with
          </h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {product.stack.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-dark-border px-4 py-2 text-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Prev/Next navigation */}
      <section className="px-6 py-16">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          {prev ? (
            <Link
              href={`/products/${prev.slug}`}
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {prev.name}
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`/products/${next.slug}`}
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors"
            >
              {next.name}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </section>

      {/* Back to home CTA */}
      <section className="border-t border-dark-border px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-muted">See all products and updates</p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-lime px-6 py-3 text-base font-semibold text-dark hover:bg-lime-dark transition-colors"
          >
            Back to BilbroSwagginz <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
