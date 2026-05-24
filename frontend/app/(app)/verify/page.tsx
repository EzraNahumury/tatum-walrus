"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ScanSearch } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";

export default function VerifyEntryPage() {
  const router = useRouter();
  const [id, setId] = useState("");

  function submit() {
    const v = id.trim();
    if (v) router.push(`/verify/${v}`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <Reveal>
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface/60 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-fg-muted">
            <ScanSearch className="size-3" />
            Public verifier
          </span>
          <h1
            className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-tech), ui-sans-serif, system-ui" }}
          >
            Verify a ProofPack
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-fg-muted sm:text-[15px]">
            Paste a Sui object ID. The verifier refetches every file from Walrus,
            recomputes SHA-256 in your browser, and compares against the on-chain hash.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="relative rounded-2xl border border-border-strong bg-surface/70 p-1.5 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)] backdrop-blur-xl">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 rounded-2xl opacity-50 blur-2xl"
            style={{ background: "var(--gradient-brand-soft)" }}
          />
          <div className="flex flex-col gap-1.5 rounded-xl bg-bg/60 p-2 sm:flex-row sm:items-center sm:gap-2">
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="0x…"
              className="w-full bg-transparent px-3 py-3 font-mono text-sm outline-none placeholder:text-fg-dim"
            />
            <button
              type="button"
              onClick={submit}
              disabled={!id.trim()}
              className="group inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-[0_-4px_8px_rgba(255,255,255,0.25)_inset] disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: "var(--gradient-brand)" }}
            >
              Verify
              <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-[1px] group-hover:translate-x-[1px]" />
            </button>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="grid gap-3 sm:grid-cols-3">
          <Fact k="Reads via" v="Tatum Sui RPC" />
          <Fact k="Refetches from" v="Walrus aggregator" />
          <Fact k="Hash computed" v="In your browser" />
        </div>
      </Reveal>
    </div>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface/40 px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-fg-dim">{k}</p>
      <p className="mt-1 text-sm font-medium text-fg">{v}</p>
    </div>
  );
}
