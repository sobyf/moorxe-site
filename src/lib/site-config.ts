/**
 * Central site configuration.
 *
 * Canonical-origin policy: the production origin is the validated `SITE_URL`
 * when one is set, otherwise the known production domain
 * `https://moorxe.com`. Production must never silently ship without a
 * canonical origin, so there is no origin-less mode: previews and local
 * development reference the production canonical too, and are kept out of
 * search by an explicit `noindex` policy instead (see `isProductionDeploy`).
 */

const DEFAULT_ORIGIN = "https://moorxe.com";

function resolveSiteUrl(): string {
  const raw = process.env.SITE_URL?.trim();
  if (raw) {
    let parsed: URL;
    try {
      parsed = new URL(raw);
    } catch {
      return DEFAULT_ORIGIN;
    }
    // Require HTTPS and reject credentials, localhost, preview-like, and
    // example hosts as production origins.
    const host = parsed.hostname.toLowerCase();
    const badHost =
      parsed.protocol !== "https:" ||
      parsed.username !== "" ||
      parsed.password !== "" ||
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host.endsWith(".localhost") ||
      host.endsWith(".vercel.app") ||
      host.endsWith(".example.com") ||
      host === "example.com";
    if (!badHost) {
      // Origin-only; no path canonicals.
      return parsed.origin;
    }
  }
  return DEFAULT_ORIGIN;
}

/**
 * Indexing policy, separated from the canonical origin.
 *
 * `NODE_ENV=production` also applies to preview builds, so it is not a
 * reliable production check. On Vercel, `VERCEL_ENV` is always set
 * (`production` | `preview` | `development`). Off Vercel, an explicitly
 * configured `SITE_URL` means the operator pointed this build at the real
 * site. Everything else (Vercel previews, local development) gets an
 * effective `noindex` while still referencing the production canonical.
 */
function resolveIsProductionDeploy(): boolean {
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv) return vercelEnv === "production";
  return Boolean(process.env.SITE_URL?.trim());
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
  /** Canonical production origin. Always set; see the policy above. */
  url: resolveSiteUrl(),
  /** True only for the production deployment; previews/dev get `noindex`. */
  isProductionDeploy: resolveIsProductionDeploy(),
  socials: {
    x: resolveSocialUrl(process.env.NEXT_PUBLIC_X_URL),
    instagram: resolveSocialUrl(process.env.NEXT_PUBLIC_INSTAGRAM_URL),
    youtube: resolveSocialUrl(process.env.NEXT_PUBLIC_YOUTUBE_URL),
  },
} as const;

export type SiteConfig = typeof siteConfig;
