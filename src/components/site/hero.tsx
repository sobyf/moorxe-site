"use client";

import * as React from "react";
import gsap from "gsap";
import { ArrowDown, ArrowUpRight } from "lucide-react";

export function Hero() {
  const rootRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power2.out" } });
      timeline
        .fromTo("[data-hero='eyebrow']", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, 0.1)
        .fromTo(
          "[data-hero='line']",
          { opacity: 0, yPercent: 110 },
          { opacity: 1, yPercent: 0, duration: 0.9, stagger: 0.08 },
          0.2,
        )
        .fromTo("[data-hero='support']", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, 0.5)
        .fromTo("[data-hero='actions']", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, 0.62)
        .fromTo("[data-hero='note']", { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0.8);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      aria-labelledby="hero-heading"
      className="relative mx-auto flex min-h-svh w-full max-w-7xl flex-col justify-center px-5 pt-28 pb-20 sm:px-8"
    >
      <div className="max-w-3xl">
        <p data-hero="eyebrow" className="font-mono text-xs font-medium tracking-[0.28em] text-muted-foreground uppercase">
          AI products. Custom solutions.
        </p>
        <h1
          id="hero-heading"
          className="mt-6 font-mono text-[2.6rem] leading-[1.04] font-semibold tracking-[-0.03em] text-foreground sm:text-6xl lg:text-7xl"
        >
          <span className="block overflow-hidden pb-1">
            <span data-hero="line" className="block">
              AI tools for your work.
            </span>
          </span>
          <span className="block overflow-hidden pb-1">
            <span data-hero="line" className="block text-muted-foreground">
              Built by Moorxe.
            </span>
          </span>
        </h1>
        <p data-hero="support" className="mt-6 max-w-xl font-mono text-base leading-relaxed text-muted-foreground sm:text-lg">
          We build our own AI products and tools — and create custom
          solutions for people and businesses with specific needs. Relevant
          knowledge, thoughtful workflows, and quality checks bring it all
          together.
        </p>
        <div data-hero="actions" className="mt-9 flex flex-wrap items-center gap-3">
          <a
            href="#what-we-build"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 font-mono text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-transparent hover:text-foreground hover:shadow-[inset_0_0_0_1px_rgba(241,241,239,0.45)]"
          >
            Explore What We Build
            <ArrowDown className="h-4 w-4 transition-transform duration-200 group-hover:translate-y-0.5" aria-hidden="true" />
          </a>
          <a
            href="#contact"
            className="group inline-flex h-12 items-center gap-2 rounded-full border border-input px-7 font-mono text-sm font-medium text-foreground transition-colors duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground"
          >
            Discuss a Custom Solution
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </a>
        </div>
        <p data-hero="note" className="mt-8 font-mono text-[13px] tracking-wide text-muted-foreground">
          Your goal. The right workflow. A useful result.
        </p>
      </div>
    </section>
  );
}
