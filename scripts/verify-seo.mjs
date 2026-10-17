// Reproducible SEO verification against the production build output.
// It checks generated HTML/routes/assets, not source constants, so it fails
// when the shipped page regresses.
//
// Usage:
//   npm run build -- --webpack && node scripts/verify-seo.mjs --expect-index
//   VERCEL_ENV=preview npm run build -- --webpack && node scripts/verify-seo.mjs --expect-noindex
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const serverApp = join(root, ".next", "server", "app");

const expectIndex = process.argv.includes("--expect-index");
const expectNoindex = process.argv.includes("--expect-noindex");
if (expectIndex === expectNoindex) {
  console.error("Pass exactly one of --expect-index or --expect-noindex.");
  process.exit(2);
}

const failures = [];
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail && !ok ? ` — ${detail}` : ""}`);
  if (!ok) failures.push(name);
}

const html = readFileSync(join(serverApp, "index.html"), "utf8");

// 1. Single title / description / canonical / absolute social URLs.
const titles = [...html.matchAll(/<title>([^<]*)<\/title>/g)].map((m) => m[1]);
check("exactly one <title>", titles.length === 1, `found ${titles.length}`);
check(
  "title text",
  titles[0] === "Moorxe — AI Products &amp; Custom Solutions" ||
    titles[0] === "Moorxe — AI Products & Custom Solutions",
  titles[0] ?? "missing",
);
check("meta description present", html.includes('name="description"'));
const canonicals = [...html.matchAll(/<link rel="canonical" href="([^"]*)"/g)].map((m) => m[1]);
check("single self-referencing canonical", canonicals.length === 1 && /^https:\/\/moorxe\.com\/?$/.test(canonicals[0]), JSON.stringify(canonicals));
check("absolute og:image", html.includes('content="https://moorxe.com/og.png"'));
check("absolute og:url", /content="https:\/\/moorxe\.com\/?"/.test(html));

// 2. Indexing policy matches the deployment scenario.
const robotsMeta = html.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? "";
if (expectIndex) {
  check("production robots allow indexing", /(^|,)index(,|$)/.test(robotsMeta.replace(/,\s*/g, ",")) && !robotsMeta.includes("noindex"), robotsMeta);
  check("no accidental noindex on /", !html.includes("noindex"), "");
} else {
  check("non-production robots carry noindex", robotsMeta.includes("noindex"), robotsMeta || "missing");
}

// 3. Essential copy is server-rendered.
for (const snippet of [
  "AI tools for your work",
  "Moorxe Products",
  "Custom Solutions",
  "Useful by design",
  "Interested in our tools",
]) {
  check(`server-rendered copy: "${snippet}"`, html.includes(snippet));
}

// 4. JSON-LD parses with stable identities and no invented business facts.
const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
let ldOk = false;
let ldDetail = "missing";
if (ldMatch) {
  try {
    const graph = JSON.parse(ldMatch[1])["@graph"] ?? [];
    const org = graph.find((n) => n["@type"] === "Organization");
    const site = graph.find((n) => n["@type"] === "WebSite");
    const banned = ["address", "foundingDate", "aggregateRating", "price", "telephone"];
    const dumped = JSON.stringify(graph);
    ldOk =
      org?.["@id"] === "https://moorxe.com/#organization" &&
      site?.["@id"] === "https://moorxe.com/#website" &&
      site?.publisher?.["@id"] === org?.["@id"] &&
      typeof org?.logo === "string" &&
      !banned.some((k) => dumped.includes(`"${k}"`));
    ldDetail = ldOk ? "" : "ids, publisher link, logo, or banned keys";
  } catch {
    ldDetail = "unparsable";
  }
}
check("JSON-LD identities valid", ldOk, ldDetail);

// 5. robots.txt / sitemap.xml.
const robotsTxt = readFileSync(join(serverApp, "robots.txt.body"), "utf8");
check("robots allows /", /Allow: \//.test(robotsTxt), robotsTxt.trim().split("\n")[0]);
check("robots not blocking fetch", !/Disallow: \//.test(robotsTxt));
check("robots references sitemap", robotsTxt.includes("https://moorxe.com/sitemap.xml"));
const sitemap = readFileSync(join(serverApp, "sitemap.xml.body"), "utf8");
const locs = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
check("sitemap lists only the canonical homepage", locs.length === 1 && locs[0] === "https://moorxe.com/", JSON.stringify(locs));
check("sitemap has truthful dating (no lastmod/frequency/priority)", !/<lastmod>|<changefreq>|<priority>/.test(sitemap));

// 6. Icons and social image exist with correct dimensions.
function pngSize(path) {
  const b = readFileSync(join(root, path));
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}
for (const [path, w, h] of [
  ["public/og.png", 1200, 630],
  ["public/favicon-192x192.png", 192, 192],
  ["public/favicon-32x32.png", 32, 32],
  ["public/apple-touch-icon.png", 180, 180],
]) {
  try {
    const s = pngSize(path);
    check(`${path} is ${w}x${h}`, s.w === w && s.h === h, `${s.w}x${s.h}`);
  } catch {
    check(`${path} readable`, false, "missing");
  }
}
try {
  const svg = readFileSync(join(root, "public/favicon.svg"), "utf8");
  check("favicon.svg square viewBox", /viewBox="0 0 (\d+) \1"/.test(svg));
} catch {
  check("favicon.svg readable", false, "missing");
}
check("no stale app/favicon.ico override", !existsSync(join(root, "src/app/favicon.ico")));

// 7. Unknown routes get a real 404 page that is not indexable.
const notFoundPath = join(serverApp, "_not-found.html");
if (existsSync(notFoundPath)) {
  const nf = readFileSync(notFoundPath, "utf8");
  check("not-found page carries noindex", /<meta name="robots" content="[^"]*noindex/.test(nf));
} else {
  check("not-found prerender exists", false, "missing _not-found.html");
}

if (failures.length > 0) {
  console.error(`\n${failures.length} check(s) failed.`);
  process.exit(1);
}
console.log(`\nAll checks passed (${expectIndex ? "indexable production" : "noindex non-production"} scenario).`);
