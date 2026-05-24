import Image from "next/image";
import Link from "next/link";
import { WalletButton } from "./WalletButton";

const NAV = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "New Pack", href: "/pack/new" },
  { label: "Verify", href: "/verify" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-6 sm:gap-10">
          <Link
            href="/"
            className="flex items-center gap-2.5 whitespace-nowrap text-[15px] font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-tech), ui-sans-serif, system-ui" }}
          >
            <Image
              src="/logo-v2.png"
              alt="ProofPack AI"
              width={28}
              height={28}
              priority
              className="drop-shadow-[0_0_10px_rgba(145,129,245,0.45)]"
            />
            <span>ProofPack AI</span>
          </Link>
          <nav className="hidden items-center gap-1 text-sm sm:flex">
            {NAV.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full px-3 py-1.5 text-fg-muted transition-colors hover:bg-white/[0.04] hover:text-fg"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <WalletButton />
      </div>
      <nav className="flex items-center justify-around border-t border-border/60 py-2 text-[11px] uppercase tracking-[0.15em] text-fg-dim sm:hidden">
        {NAV.map((l) => (
          <Link key={l.href} href={l.href} className="hover:text-fg">
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
