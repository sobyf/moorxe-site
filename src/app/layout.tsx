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
  metadataBase: siteConfig.url ? new URL(siteConfig.url) : undefined,
  title: {
    default: siteConfig.title,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  ...(siteConfig.url
    ? {
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
      }
    : {}),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: siteConfig.name,
      description: siteConfig.description,
      ...(siteConfig.url ? { url: siteConfig.url } : {}),
    },
    {
      "@type": "Organization",
      name: siteConfig.name,
      description: siteConfig.description,
      slogan: siteConfig.tagline,
      ...(siteConfig.url ? { url: siteConfig.url } : {}),
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" className="dark">
      <body className={`${geistMono.variable} font-mono`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
