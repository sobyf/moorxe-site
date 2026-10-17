import { ArrowUp, Instagram, Twitter, Youtube } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { StrandMark } from "@/components/site/header";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const socials = [
    { label: "Moorxe on X", href: siteConfig.socials.x, Icon: Twitter },
    { label: "Moorxe on Instagram", href: siteConfig.socials.instagram, Icon: Instagram },
    { label: "Moorxe on YouTube", href: siteConfig.socials.youtube, Icon: Youtube },
  ].filter((s): s is { label: string; href: string; Icon: typeof Twitter } => s.href !== null);

  return (
    <footer className="relative border-t border-border">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-5 py-14 text-center sm:px-8">
        <a href="#top" className="flex items-center gap-2.5" aria-label="Moorxe — back to top">
          <StrandMark className="h-8 w-8 text-foreground" />
          <span className="font-mono text-xl font-semibold tracking-tight text-foreground">
            Moorxe
          </span>
        </a>
        <p className="font-mono text-sm text-muted-foreground">
          Specialized AI, made useful.
        </p>

        {socials.length > 0 && (
          <div className="flex items-center gap-3">
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                rel="me noopener noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </a>
            ))}
          </div>
        )}

        <p className="font-mono text-[13px] text-muted-foreground">
          &copy; {year} Moorxe.
        </p>

        <a
          href="#top"
          className="inline-flex items-center gap-1.5 font-mono text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
          Back to top
        </a>
      </div>
    </footer>
  );
}
