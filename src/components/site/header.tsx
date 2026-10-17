"use client";

import * as React from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "What We Build", href: "#what-we-build" },
  { label: "Our Approach", href: "#approach" },
  { label: "Contact", href: "#contact" },
];

export function StrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5 19c4-1 6-6 10-6s5 5 9 3 3-4 3-4M5 13c5 1 7 7 11 7s5-5 8-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="2.5" fill="currentColor" />
    </svg>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  const firstLinkRef = React.useRef<HTMLAnchorElement>(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on Escape and return focus to the menu button.
  React.useEffect(() => {
    if (!open) return;
    firstLinkRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open ]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
        scrolled || open
          ? "border-b border-border bg-background/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <a
          href="#top"
          className="flex items-center gap-2.5 text-foreground"
          aria-label="Moorxe — back to top"
        >
          <StrandMark className="h-7 w-7" />
          <span className="font-mono text-lg font-semibold tracking-tight">Moorxe</span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#contact"
            className="group inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 font-mono text-[13px] font-medium text-primary-foreground transition-colors duration-200 hover:bg-transparent hover:text-foreground hover:shadow-[inset_0_0_0_1px_rgba(241,241,239,0.45)]"
          >
            Let&rsquo;s Talk
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </a>
        </nav>

        <button
          ref={menuButtonRef}
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="border-t border-border bg-background/95 px-5 pt-2 pb-6 backdrop-blur-md md:hidden"
        >
          {NAV_ITEMS.map((item, index) => (
            <a
              key={item.href}
              ref={index === 0 ? firstLinkRef : undefined}
              href={item.href}
              onClick={() => {
                setOpen(false);
                menuButtonRef.current?.focus();
              }}
              className="block border-b border-border py-4 font-mono text-base text-foreground"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => {
              setOpen(false);
              menuButtonRef.current?.focus();
            }}
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-primary font-mono text-sm font-medium text-primary-foreground"
          >
            Let&rsquo;s Talk
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </nav>
      )}
    </header>
  );
}
