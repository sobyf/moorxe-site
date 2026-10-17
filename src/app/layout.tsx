import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: siteConfig.title }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  // Production deploys are indexable. Previews and local development reference
  // the same production canonical but carry an effective `noindex`, while
  // robots.txt keeps the page fetchable so crawlers can see the directive.
  robots: siteConfig.isProductionDeploy
    ? { index: true, follow: true }
    : { index: false, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

const organizationId = `${siteConfig.url}/#organization`;
const webSiteId = `${siteConfig.url}/#website`;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": organizationId,
      name: siteConfig.name,
      url: `${siteConfig.url}/`,
      description: siteConfig.description,
      slogan: siteConfig.tagline,
      logo: `${siteConfig.url}/moorxe-logo-white.svg`,
    },
    {
      "@type": "WebSite",
      "@id": webSiteId,
      url: `${siteConfig.url}/`,
      name: siteConfig.name,
      description: siteConfig.description,
      inLanguage: "en",
      publisher: { "@id": organizationId },
    },
  ],
};

// Escape `<` per Next.js JSON-LD guidance so embedded JSON can never break
// out of the script element.
const jsonLdText = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" className="dark">
      <body className={`${geistMono.variable} font-mono`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdText }}
        />
        {children}
      </body>
    </html>
  );
}
