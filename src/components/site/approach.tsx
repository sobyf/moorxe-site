import { ArrowRight, Check } from "lucide-react";
import { Eyebrow, Reveal } from "@/components/motion/reveal";

const FLOW_LABELS = ["Context", "Knowledge", "Tools", "Review", "Output"];

function UnderstandVisual() {
  return (
    <div className="flex h-28 items-center justify-center gap-1" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span key={i} className="flex flex-col items-center gap-1.5">
          <span className="h-8 w-14 rounded-full border border-border bg-background/80" />
          <span className="h-px w-10 bg-border" />
        </span>
      ))}
      <ArrowRight className="mx-1 h-4 w-4 text-muted-foreground" />
      <span className="flex h-12 w-20 items-center justify-center rounded-xl border border-foreground/30 bg-foreground/10 font-mono text-[10px] tracking-widest text-foreground uppercase">
        Brief
      </span>
    </div>
  );
}

function BuildVisual() {
  return (
    <div className="flex h-28 flex-wrap items-center justify-center gap-1.5" aria-hidden="true">
      {FLOW_LABELS.map((label, i) => (
        <span key={label} className="flex items-center gap-1.5">
          <span
            className={
              i === 2 || i === 4
                ? "rounded-full bg-primary px-2.5 py-1 font-mono text-[10px] font-medium text-primary-foreground"
                : "rounded-full border border-border px-2.5 py-1 font-mono text-[10px] text-muted-foreground"
            }
          >
            {label}
          </span>
          {i < FLOW_LABELS.length - 1 && (
            <span className="h-px w-2 bg-border" />
          )}
        </span>
      ))}
    </div>
  );
}

function EvaluateVisual() {
  return (
    <div className="flex h-28 flex-col items-center justify-center gap-3" aria-hidden="true">
      <span className="flex items-end gap-1">
        {[10, 18, 8, 22, 14, 26, 12, 20, 9, 16].map((h, i) => (
          <span
            key={i}
            className="w-1.5 rounded-full bg-foreground/40"
            style={{ height: `${h}px`, opacity: 0.35 + (i % 3) * 0.25 }}
          />
        ))}
      </span>
      <span className="flex items-center gap-1.5 rounded-full border border-foreground/30 bg-foreground/10 px-3 py-1 font-mono text-[10px] tracking-widest text-foreground uppercase">
        <Check className="h-3 w-3" />
        Ready
      </span>
    </div>
  );
}

const CARDS = [
  {
    step: "01",
    title: "Understand the Need",
    description: "Identify the task, the context, and what a useful outcome looks like.",
    Visual: UnderstandVisual,
  },
  {
    step: "02",
    title: "Build the Right Solution",
    description:
      "Combine relevant knowledge, AI capabilities, and tools into a practical product or workflow.",
    Visual: BuildVisual,
  },
  {
    step: "03",
    title: "Evaluate & Improve",
    description:
      "Check results against clear criteria and refine the solution through actual use.",
    Visual: EvaluateVisual,
  },
];

export function Approach() {
  return (
    <section
      id="approach"
      aria-labelledby="approach-heading"
      className="relative mx-auto w-full max-w-7xl scroll-mt-20 px-5 py-24 sm:px-8 sm:py-32"
    >
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <Eyebrow>Our approach</Eyebrow>
        </Reveal>
        <Reveal delay={0.08}>
          <h2
            id="approach-heading"
            className="mt-5 font-mono text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-5xl"
          >
            Useful by design.
          </h2>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-5 font-mono text-base leading-relaxed text-muted-foreground">
            Whether we&rsquo;re developing a Moorxe product or building for a
            customer, we start with the work and evaluate what we deliver.
          </p>
        </Reveal>
      </div>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {CARDS.map((card, index) => (
          <Reveal key={card.step} delay={0.09 * index} className="h-full">
            <article className="dot-grid flex h-full flex-col rounded-3xl border border-border bg-panel p-7 backdrop-blur-sm transition-colors duration-300 hover:border-foreground/25 hover:shadow-[0_0_80px_rgba(241,241,239,0.07)] focus-within:border-foreground/25 focus-within:shadow-[0_0_80px_rgba(241,241,239,0.07)] sm:p-8">
              <p className="font-mono text-xs tracking-[0.24em] text-muted-foreground">
                {card.step}
              </p>
              <div className="mt-4 border-y border-border py-2">
                <card.Visual />
              </div>
              <h3 className="mt-5 font-mono text-xl font-semibold tracking-tight text-foreground">
                {card.title}
              </h3>
              <p className="mt-2.5 font-mono text-sm leading-relaxed text-muted-foreground">
                {card.description}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
