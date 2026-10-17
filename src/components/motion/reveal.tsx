"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Stagger delay in seconds relative to sibling reveals. */
  delay?: number;
  y?: number;
}

/**
 * Small fade-and-rise reveal when a section enters the viewport.
 * Content stays visible without JavaScript; animation only enhances.
 */
export function Reveal({ children, className, delay = 0, y = 24, ...props }: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, [delay, y]);

  return (
    <div ref={ref} className={cn(className)} {...props}>
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs font-medium tracking-[0.28em] text-muted-foreground uppercase">
      {children}
    </p>
  );
}
