/**
 * Central site configuration.
 *
 * `SITE_URL` must be the canonical production origin (e.g. https://moorxe.com).
 * It is optional in development: when it is missing or not a real public
 * origin, metadata uses relative URLs and no canonical/sitemap origin is
 * published, so preview or dev deployments are never presented as production.
 */

function resolveSiteUrl(): string | null {
  const raw = process.env.SITE_URL?.trim();
  if (!raw) return null;
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
  const host = parsed.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host.endsWith(".localhost") ||
    host.endsWith(".example.com") ||
    host === "example.com"
  ) {
    return null;
  }
  // Strip trailing slashes; keep it origin-only aware (no path canonicals).
  return parsed.origin;
}

function resolveSocialUrl(value: string | undefined): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export const siteConfig = {
  name: "Moorxe",
  tagline: "AI products and custom solutions.",
  title: "Moorxe — AI Products & Custom Solutions",
  description:
    "Moorxe builds AI products, specialized tools, and custom solutions that make professional work easier through relevant knowledge, practical workflows, and quality checks.",
  /** Canonical production origin, or null when not configured. */
  url: resolveSiteUrl(),
  socials: {
    x: resolveSocialUrl(process.env.NEXT_PUBLIC_X_URL),
    instagram: resolveSocialUrl(process.env.NEXT_PUBLIC_INSTAGRAM_URL),
    youtube: resolveSocialUrl(process.env.NEXT_PUBLIC_YOUTUBE_URL),
  },
} as const;

export type SiteConfig = typeof siteConfig;
