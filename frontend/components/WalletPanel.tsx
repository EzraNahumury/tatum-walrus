"use client";

import { useEffect, useRef, useState } from "react";
import {
  ConnectButton,
  useCurrentAccount,
  useDisconnectWallet,
} from "@mysten/dapp-kit";
import { Check, Copy, ExternalLink, LogOut, X } from "lucide-react";

function short(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function avatarColor(addr: string): string {
  // Deterministic pastel from address bytes
  const hex = addr.replace(/^0x/, "");
  const h = parseInt(hex.slice(0, 6), 16) % 360;
  return `hsl(${h}, 65%, 60%)`;
}

export function WalletPanel() {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const network = process.env.NEXT_PUBLIC_SUI_NETWORK ?? "testnet";

  const [balance, setBalance] = useState<string | null>(null);
  useEffect(() => {
    if (!account?.address) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/balance?owner=${account!.address}`);
        if (!res.ok) return;
        const d = (await res.json()) as { totalBalance?: string };
        if (!cancelled && d.totalBalance !== undefined) setBalance(d.totalBalance);
      } catch {
        // ignore
      }
    }
    load();
    const t = setInterval(load, 15_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [account?.address]);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!account) {
    return <ConnectButton connectText="Connect wallet" />;
  }

  const suiBalance = balance ? Number(balance) / 1e9 : 0;
  const explorer = `https://suiscan.xyz/${network}/account/${account.address}`;

  async function copyAddr() {
    if (!account) return;
    await navigator.clipboard.writeText(account.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group relative flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold tracking-tight text-[#0f0f0f] shadow-[0_2px_10px_-2px_rgba(0,0,0,0.4)] transition-transform hover:-translate-y-[1px]"
      >
        <span
          aria-hidden
          className="size-5 rounded-full"
          style={{ background: avatarColor(account.address) }}
        />
        <span className="font-mono">{short(account.address)}</span>
        <svg viewBox="0 0 12 12" className={`size-3 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden>
          <path d="M3 4.5 L6 7.5 L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Wallet"
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-[340px] origin-top-right animate-[walletPop_180ms_ease-out] rounded-2xl border border-border-strong bg-surface/95 p-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-xl"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-3 top-3 grid size-7 place-items-center rounded-full text-fg-dim hover:bg-white/[0.06] hover:text-fg"
            aria-label="Close"
          >
            <X className="size-3.5" />
          </button>

          <div className="flex flex-col items-center pt-1 text-center">
            <span
              aria-hidden
              className="grid size-14 place-items-center rounded-full text-2xl shadow-[0_0_0_2px_rgba(255,255,255,0.06)]"
              style={{ background: avatarColor(account.address) }}
            >
              <span className="grid size-12 place-items-center rounded-full bg-bg/40 backdrop-blur">
                🦦
              </span>
            </span>
            <p className="mt-3 font-mono text-[15px] font-semibold tracking-tight text-fg">
              {short(account.address)}
            </p>
            <p className="text-xs text-fg-dim tabular">
              {balance !== null ? `${suiBalance.toFixed(4)} SUI` : "loading…"}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={copyAddr}
              className="group flex flex-col items-center gap-1.5 rounded-xl border border-border-strong bg-white/[0.02] px-3 py-3 text-xs text-fg-muted transition-colors hover:bg-white/[0.06] hover:text-fg"
            >
              <span className="grid size-7 place-items-center rounded-full border border-border-strong bg-bg/40">
                {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
              </span>
              <span>{copied ? "Copied" : "Copy address"}</span>
            </button>
            <button
              type="button"
              onClick={() => { disconnect(); setOpen(false); }}
              className="group flex flex-col items-center gap-1.5 rounded-xl border border-border-strong bg-white/[0.02] px-3 py-3 text-xs text-fg-muted transition-colors hover:bg-white/[0.06] hover:text-fg"
            >
              <span className="grid size-7 place-items-center rounded-full border border-border-strong bg-bg/40">
                <LogOut className="size-3.5" />
              </span>
              <span>Disconnect</span>
            </button>
          </div>

          <div className="mt-5 rounded-xl border border-border bg-bg/40 px-3 py-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-fg-dim">Network</p>
            <p className="mt-0.5 text-sm capitalize text-fg">{network} · via Tatum RPC</p>
          </div>

          <a
            href={explorer}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex items-center justify-between rounded-xl px-1 py-1 text-sm font-medium text-fg hover:text-[var(--color-violet-soft)]"
          >
            <span>View on Suiscan</span>
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      )}

      <style>{`
        @keyframes walletPop {
          from { opacity: 0; transform: scale(0.92) translateY(-6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
