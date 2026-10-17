import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    // Always fetchable: previews rely on the page-level `noindex` meta, and
    // blocking the fetch would prevent crawlers from seeing that directive.
    // robots.txt is not access control.
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
