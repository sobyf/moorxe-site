# Moorxe — AI Products & Custom Solutions

Single-page marketing homepage for Moorxe. Dark monochrome design, one
continuous Three.js strand background, GSAP section reveals, and a real
contact form backed by a validated `/api/contact` route.

## Stack (resolved at install time)

| Package | Version |
|---|---|
| Next.js (App Router) | 16.4.2 |
| React / React DOM | 19.3.1 |
| Three.js | 0.186.1 |
| @react-three/fiber | 9.8.2 (peer-compatible with React 19, no force flags) |
| GSAP (+ ScrollTrigger) | 3.15.0 |
| Zod | 4.6.7 |
| Tailwind CSS | 4.3.3 |
| TypeScript | 5.x |
| Lucide icons | 0.469.x |

shadcn/ui primitives (`button`, `input`, `textarea`, `label`) live in
`src/components/ui/` in the new-york style, customized to the monochrome
token system in `src/app/globals.css`. No Lenis or Drei: scrolling and
animation use GSAP + ScrollTrigger only.

## Getting started

```sh
npm install   # clean install from package-lock.json
npm run dev   # http://localhost:3000
npm run build # production build
npm start     # serve the production build (http://localhost:3000)
npm run lint      # eslint
npm run typecheck # tsc --noEmit
```

Node 20+ is required (developed with Node 24).

## Contact delivery (`/api/contact`)

Validation is shared between client and server via `src/lib/contact-schema.ts`
(Zod). The route enforces a 32 KB body limit, a honeypot field, and an
in-process rate limit (5 submissions per IP per 10 minutes).

Delivery sinks (`src/lib/contact-delivery.ts`, `CONTACT_SINK`):

- `local-file` — appends validated submissions as JSONL to
  `.data/contact-submissions.jsonl` (project root, outside `public/`, and
  gitignored). **Development only**: refused with 503 in production.
  View submissions with:
  ```sh
  cat .data/contact-submissions.jsonl
  ```
  A successful dev submission answers `{"status":"ok","receipt":"Saved
  locally for development."}`.
- `webhook` — POSTs `{name, email, message, receivedAt}` as JSON to
  `CONTACT_WEBHOOK_URL` (https only) with `Authorization: Bearer
  CONTACT_WEBHOOK_TOKEN`. Both variables are server-only.
- Unset — development defaults to `local-file`; production answers 503
  (`{"error":"unavailable",...}`) instead of faking success.

Local file storage and in-process throttling are not durable or shared on
ephemeral multi-instance hosting. Before production, set
`CONTACT_SINK=webhook` (or wire another durable sink) and confirm the
unavailable path returns 503 when nothing is configured.

Copy `.env.example` to `.env.local` for local settings. Never commit secrets.

## Production configuration still needed

1. `SITE_URL` — canonical production origin (e.g. `https://moorxe.com`).
   Until set, the site emits no canonical URL, no absolute Open Graph URLs,
   and an empty sitemap, so previews are never indexed as production.
2. Contact sink — see above.
3. Social links — `NEXT_PUBLIC_X_URL`, `NEXT_PUBLIC_INSTAGRAM_URL`,
   `NEXT_PUBLIC_YOUTUBE_URL`. Only valid `https:` URLs render; missing ones
   leave the footer clean with no dead buttons.

## Notes

- The strand scene (`src/components/visuals/`) is client-only and dynamically
  imported; all copy is server-rendered. A static grayscale fallback covers
  WebGL failure and `prefers-reduced-motion`. A keyboard-accessible
  Pause/Resume motion button floats at the bottom-right.
- Regenerate the social image with `node scripts/generate-og.mjs`
  (dependency-free, deterministic) into `public/og.png`.
