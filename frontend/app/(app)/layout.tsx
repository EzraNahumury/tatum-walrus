import { Header } from "@/components/Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="relative flex-1">
        {/* Ambient gradient orbs behind every app page */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] opacity-60"
          style={{
            background:
              "radial-gradient(900px 380px at 30% 0%, rgba(145,129,245,0.18), transparent 60%), radial-gradient(700px 320px at 80% 10%, rgba(64,122,255,0.12), transparent 65%)",
          }}
        />
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-14">
          {children}
        </div>
      </main>
      <footer className="border-t border-border py-6 text-center text-xs text-fg-dim">
        ProofPack AI — Sui + Walrus + Tatum
      </footer>
    </>
  );
}
