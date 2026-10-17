import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The built-in trailing-slash rule would otherwise fire first and send
  // `/fa/` → `/fa` → `/` (two hops). Disabling it lets the exact redirect
  // rules below handle both forms in a single permanent hop. Only `/` and
  // `/api/contact` exist, so losing blanket slash normalization costs
  // nothing; an unknown trailing-slash path still 404s.
  skipTrailingSlashRedirect: true,
  async redirects() {
    // Former localized homepages → canonical homepage. Exact paths only:
    // no wildcards, so unrelated URLs still 404 genuinely.
    return [
      { source: "/fa", destination: "/", permanent: true },
      { source: "/en", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
