import { SiteHeader } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { WhatWeBuild } from "@/components/site/what-we-build";
import { Approach } from "@/components/site/approach";
import { ContactSection } from "@/components/site/contact-form";
import { SiteFooter } from "@/components/site/footer";
import { StrandBackground } from "@/components/visuals/strand-background";
import { canAcceptSubmissions } from "@/lib/contact-delivery";

/**
 * The only public content page. All copy is server-rendered so the page is
 * meaningful without WebGL or client animation.
 */
export default function HomePage() {
  // Resolved on the server so the unavailable state is in the HTML, not
  // dependent on client JS, and never promises delivery nothing can fulfil.
  const contactAvailable = canAcceptSubmissions();

  return (
    <div id="top" className="relative min-h-svh bg-background text-foreground">
      <StrandBackground />
      <div className="relative z-10">
        <SiteHeader />
        <main>
          <Hero />
          <WhatWeBuild />
          <Approach />
          <ContactSection available={contactAvailable} />
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
