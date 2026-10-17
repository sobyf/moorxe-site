"use client";

import * as React from "react";
import { ArrowUpRight, CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { Eyebrow, Reveal } from "@/components/motion/reveal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contactSchema } from "@/lib/contact-schema";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "success" | "error";

interface ApiResponse {
  status?: string;
  receipt?: string;
  message?: string;
  fields?: Record<string, string>;
}

const SUCCESS_HEADING = "Thanks. Your message has been received.";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-2 font-mono text-[13px] text-foreground">
      {message}
    </p>
  );
}

export function ContactSection() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [status, setStatus] = React.useState<Status>("idle");
  const [notice, setNotice] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;

    const parsed = contactSchema.safeParse({ name, email, message, company });
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "message");
        if (!fields[key]) fields[key] = issue.message;
      }
      setFieldErrors(fields);
      setStatus("error");
      setNotice("Please review the highlighted fields.");
      return;
    }
    setFieldErrors({});
    setStatus("sending");
    setNotice(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, message, company }),
      });
      const data = (await response.json().catch(() => ({}))) as ApiResponse;
      if (!response.ok || data.status !== "ok") {
        setStatus("error");
        setFieldErrors(data.fields ?? {});
        setNotice(
          data.message ?? "We couldn't send your message. Please try again.",
        );
        return;
      }
      setStatus("success");
      setNotice(data.receipt ?? SUCCESS_HEADING);
    } catch {
      // Values are preserved in state so nothing the user typed is lost.
      setStatus("error");
      setNotice("We couldn't send your message. Please try again.");
    }
  }

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative mx-auto w-full max-w-7xl scroll-mt-20 px-5 py-24 sm:px-8 sm:py-32"
    >
      <div className="mx-auto w-full max-w-[600px] text-center">
        <Reveal>
          <Eyebrow>Let&rsquo;s talk</Eyebrow>
        </Reveal>
        <Reveal delay={0.08}>
          <h2
            id="contact-heading"
            className="mt-5 font-mono text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl"
          >
            Interested in our tools — or need something custom?
          </h2>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-5 font-mono text-base leading-relaxed text-muted-foreground">
            Ask about Moorxe products, share feedback, or tell us about an
            AI tool you&rsquo;d like us to build.
          </p>
        </Reveal>

        <Reveal delay={0.22} className="mt-10">
          <div className="rounded-3xl border border-border bg-panel p-7 text-left backdrop-blur-sm sm:p-10">
            {status === "success" ? (
              <div role="status" className="py-6 text-center">
                <CircleCheck className="mx-auto h-9 w-9 text-foreground" aria-hidden="true" />
                <p className="mt-4 font-mono text-lg font-semibold text-foreground">
                  {SUCCESS_HEADING}
                </p>
                {notice && notice !== SUCCESS_HEADING && (
                  <p className="mt-2 font-mono text-sm text-muted-foreground">{notice}</p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div aria-live="polite">
                  {status === "error" && notice && (
                    <p
                      role="alert"
                      className="mb-6 flex items-start gap-2.5 rounded-2xl border border-input bg-background/60 px-4 py-3 font-mono text-sm text-foreground"
                    >
                      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      {notice}
                    </p>
                  )}
                </div>

                <div className="space-y-7">
                  <div>
                    <Label htmlFor="contact-name">Your name</Label>
                    <div className="field-underline mt-1">
                      <Input
                        id="contact-name"
                        name="name"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        aria-invalid={Boolean(fieldErrors.name)}
                        aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
                        maxLength={120}
                        required
                      />
                    </div>
                    <FieldError id="contact-name-error" message={fieldErrors.name} />
                  </div>

                  <div>
                    <Label htmlFor="contact-email">Email address</Label>
                    <div className="field-underline mt-1">
                      <Input
                        id="contact-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        aria-invalid={Boolean(fieldErrors.email)}
                        aria-describedby={fieldErrors.email ? "contact-email-error" : undefined}
                        maxLength={254}
                        required
                      />
                    </div>
                    <FieldError id="contact-email-error" message={fieldErrors.email} />
                  </div>

                  <div>
                    <Label htmlFor="contact-message">How can we help?</Label>
                    <div className="field-underline mt-1">
                      <Textarea
                        id="contact-message"
                        name="message"
                        rows={5}
                        placeholder="Tell us which product interests you, or describe the custom tool or solution you need."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        aria-invalid={Boolean(fieldErrors.message)}
                        aria-describedby={fieldErrors.message ? "contact-message-error" : undefined}
                        maxLength={5000}
                        required
                        className="py-3"
                      />
                    </div>
                    <FieldError id="contact-message-error" message={fieldErrors.message} />
                  </div>

                  {/* Honeypot: hidden from sighted users, assistive tech, and keyboard. */}
                  <div className="absolute h-px w-px overflow-hidden opacity-0" aria-hidden="true">
                    <label htmlFor="contact-company">
                      Company (leave blank)
                      <input
                        id="contact-company"
                        name="company"
                        type="text"
                        autoComplete="off"
                        tabIndex={-1}
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className={cn(
                      "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full font-mono text-sm font-medium transition-colors",
                      "bg-primary text-primary-foreground hover:bg-foreground/85",
                      "disabled:cursor-wait disabled:opacity-70",
                    )}
                  >
                    {status === "sending" ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Sending&hellip;
                      </>
                    ) : (
                      <>
                        Send Message
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </>
                    )}
                  </button>

                  <p className="text-center font-mono text-[13px] leading-relaxed text-muted-foreground">
                    Please don&rsquo;t include passwords, API keys, or other
                    sensitive information.
                  </p>
                </div>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
