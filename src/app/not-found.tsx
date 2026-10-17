import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  // Unknown routes must never look indexable, regardless of the root policy.
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="relative mx-auto flex min-h-svh w-full max-w-7xl flex-col items-center justify-center px-5 text-center sm:px-8">
      <p className="font-mono text-xs font-medium tracking-[0.28em] text-muted-foreground uppercase">
        404
      </p>
      <h1 className="mt-5 font-mono text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
        This page isn&rsquo;t here.
      </h1>
      <p className="mt-5 max-w-md font-mono text-base leading-relaxed text-muted-foreground">
        The address may have changed. Start back at the homepage.
      </p>
      <Link
        href="/"
        className="mt-9 inline-flex h-12 items-center rounded-full bg-primary px-7 font-mono text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-transparent hover:text-foreground hover:shadow-[inset_0_0_0_1px_rgba(241,241,239,0.45)]"
      >
        Back to Moorxe
      </Link>
    </main>
  );
}
