import dynamic from "next/dynamic";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/sections/hero";

// Below-the-fold sections: chunk-split + render on first paint without blocking
// the hero. ssr:true keeps SEO + initial markup intact; the JS for these
// sections downloads in parallel and hydrates as it arrives.
const HowAuralis = dynamic(() =>
  import("@/components/landing/sections/how-auralis").then((m) => ({ default: m.HowAuralis })),
);
const WhatYouCanDo = dynamic(() =>
  import("@/components/landing/sections/what-you-can-do").then((m) => ({ default: m.WhatYouCanDo })),
);
const SecurityIntegrations = dynamic(() =>
  import("@/components/landing/sections/security-integrations").then((m) => ({
    default: m.SecurityIntegrations,
  })),
);
const FAQ = dynamic(() =>
  import("@/components/landing/sections/faq").then((m) => ({ default: m.FAQ })),
);
const Academy = dynamic(() =>
  import("@/components/landing/sections/academy").then((m) => ({ default: m.Academy })),
);
const StartCTA = dynamic(() =>
  import("@/components/landing/sections/start-cta").then((m) => ({ default: m.StartCTA })),
);

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="relative flex-1">
        <Hero />
        <HowAuralis />
        <WhatYouCanDo />
        <SecurityIntegrations />
        <FAQ />
        <Academy />
        <StartCTA />
      </main>
      <Footer />
    </>
  );
}
