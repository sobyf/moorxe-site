import { Bot, Workflow, LibraryBig, ListChecks } from "lucide-react";
import { Eyebrow, Reveal } from "@/components/motion/reveal";
import { StrandMark } from "@/components/site/header";

const ITEMS = [
  {
    icon: Bot,
    title: "Specialized Assistants",
    description:
      "Support for specific tasks, informed by relevant knowledge and clear working methods.",
  },
  {
    icon: Workflow,
    title: "Workflow Tools",
    description:
      "Tools that connect your inputs, AI models, and existing systems to get work done.",
  },
  {
    icon: LibraryBig,
    title: "Knowledge Systems",
    description:
      "Relevant information, organized so AI can use it in the right context.",
  },
  {
    icon: ListChecks,
    title: "Quality Checks",
    description:
      "Review steps that help assess whether an output is accurate, relevant, and ready to use.",
  },
];

export function WhatWeBuild() {
  return (
    <section
      id="what-we-build"
      aria-labelledby="what-we-build-heading"
      className="relative mx-auto w-full max-w-7xl scroll-mt-20 px-5 py-24 sm:px-8 sm:py-32"
    >
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <Eyebrow>What we build</Eyebrow>
        </Reveal>
        <Reveal delay={0.08}>
          <h2
            id="what-we-build-heading"
            className="mt-5 font-mono text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-5xl"
          >
            From AI capability to everyday usefulness.
          </h2>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-5 font-mono text-base leading-relaxed text-muted-foreground">
            Tools, assistants, and workflows built around the work you need to
            get done.
          </p>
        </Reveal>
      </div>

      {/* Desktop: four items around a centered hub. */}
      <div className="relative mt-16 hidden lg:block" aria-hidden="false">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute top-1/2 right-[12%] left-[12%] h-px bg-border" />
          <div className="absolute top-[8%] bottom-[8%] left-1/2 w-px bg-border" />
          <div className="absolute top-1/2 left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border" />
          <div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/60" />
        </div>
        <div className="relative grid grid-cols-[1fr_auto_1fr] grid-rows-[auto_auto] items-center gap-x-10 gap-y-12">
          {ITEMS.map((item, index) => (
            <Reveal
              key={item.title}
              delay={0.08 * index}
              className={
                index === 0
                  ? "col-start-1 row-start-1 justify-self-end"
                  : index === 1
                    ? "col-start-3 row-start-1 justify-self-start"
                    : index === 2
                      ? "col-start-1 row-start-2 justify-self-end"
                      : "col-start-3 row-start-2 justify-self-start"
              }
            >
              <article className="w-full max-w-sm rounded-3xl border border-border bg-panel p-7 backdrop-blur-sm transition-colors duration-300 hover:border-foreground/25 hover:shadow-[0_0_80px_rgba(241,241,239,0.07)] focus-within:border-foreground/25">
                <item.icon className="h-6 w-6 text-foreground" aria-hidden="true" />
                <h3 className="mt-4 font-mono text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 font-mono text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </article>
            </Reveal>
          ))}
          <Reveal
            delay={0.1}
            className="col-start-2 row-start-1 row-span-2 justify-self-center"
          >
            <div className="motion-loop hub-pulse flex h-44 w-44 flex-col items-center justify-center gap-2 rounded-full border border-border bg-background/90">
              <StrandMark className="h-10 w-10 text-foreground" />
              <p className="font-mono text-sm font-semibold tracking-tight text-foreground">
                Moorxe
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Mobile / tablet: hub above a readable vertical stack. */}
      <div className="mt-12 lg:hidden">
        <div className="mx-auto flex h-32 w-32 flex-col items-center justify-center gap-1.5 rounded-full border border-border bg-background/90">
          <StrandMark className="h-8 w-8 text-foreground" />
          <p className="font-mono text-[13px] font-semibold text-foreground">Moorxe</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {ITEMS.map((item, index) => (
            <Reveal key={item.title} delay={0.07 * index}>
              <article className="h-full rounded-3xl border border-border bg-panel p-6 backdrop-blur-sm transition-colors duration-300 hover:border-foreground/25 hover:shadow-[0_0_80px_rgba(241,241,239,0.07)] focus-within:border-foreground/25">
                <item.icon className="h-6 w-6 text-foreground" aria-hidden="true" />
                <h3 className="mt-4 font-mono text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 font-mono text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
