import Link from "next/link";
import { WalletButton } from "./WalletButton";

export function Header() {
  return (
    <header className="border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 sm:gap-8 min-w-0">
          <Link href="/" className="font-semibold tracking-tight whitespace-nowrap">
            <span className="text-[var(--accent)]">Proof</span>Pack AI
          </Link>
          <nav className="hidden sm:flex items-center gap-5 text-sm text-[var(--muted)]">
            <Link href="/dashboard" className="hover:text-[var(--foreground)]">Dashboard</Link>
            <Link href="/pack/new" className="hover:text-[var(--foreground)]">New Pack</Link>
            <Link href="/verify" className="hover:text-[var(--foreground)]">Verify</Link>
          </nav>
        </div>
        <WalletButton />
      </div>
      <nav className="sm:hidden flex items-center justify-around border-t border-[var(--border)] py-2 text-xs text-[var(--muted)]">
        <Link href="/dashboard" className="hover:text-[var(--foreground)]">Dashboard</Link>
        <Link href="/pack/new" className="hover:text-[var(--foreground)]">New</Link>
        <Link href="/verify" className="hover:text-[var(--foreground)]">Verify</Link>
      </nav>
    </header>
  );
}
