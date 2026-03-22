import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-8xl font-bold text-lime">404</p>
        <h1 className="mt-4 text-2xl font-bold">Nothing here yet.</h1>
        <p className="mt-4 text-lg text-muted">
          This page doesn&apos;t exist, but something probably will eventually.
          That&apos;s the whole point of building in public.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-lime px-6 py-3 text-base font-semibold text-dark hover:bg-lime-dark transition-colors"
        >
          Back to the hub <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}
