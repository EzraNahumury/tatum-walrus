import Link from "next/link";
import { WalletButton } from "./WalletButton";

export function Header() {
  return (
    <header className="border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-semibold tracking-tight">
            <span className="text-[var(--accent)]">Proof</span>Pack AI
          </Link>
          <nav className="flex items-center gap-5 text-sm text-[var(--muted)]">
            <Link href="/dashboard" className="hover:text-[var(--foreground)]">Dashboard</Link>
            <Link href="/pack/new" className="hover:text-[var(--foreground)]">New Pack</Link>
            <Link href="/verify" className="hover:text-[var(--foreground)]">Verify</Link>
          </nav>
        </div>
        <WalletButton />
      </div>
    </header>
  );
}
