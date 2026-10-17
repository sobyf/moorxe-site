import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  // `/` is the only public content URL. `lastModified`, `changeFrequency`,
  // and `priority` are intentionally omitted: Google ignores the latter two,
  // and there is currently no honest per-change update source for the former.
  return [{ url: `${siteConfig.url}/` }];
}
