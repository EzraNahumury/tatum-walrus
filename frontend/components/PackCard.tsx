"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ExternalLink, FileCheck2, ShieldCheck } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import type { Hex } from "@/lib/types";

export interface PackRow {
  objectId: Hex;
  version: number;
  visibility: number;
  manifestBlobId: string;
  createdAtMs: number;
  previousVersionId?: Hex;
}

function visLabel(n: number): string {
  return n === 0 ? "private" : n === 1 ? "unlisted" : "public";
}

function visTone(n: number): string {
  if (n === 0) return "bg-[rgba(255,196,107,0.18)] text-[var(--color-amber)]";
  if (n === 1) return "bg-[rgba(145,129,245,0.22)] text-white";
  return "bg-[rgba(108,242,204,0.22)] text-[var(--color-emerald-soft)]";
}

export function PackCard({ row }: { row: PackRow }) {
  const [meta, setMeta] = useState<{ title?: string; files?: number } | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-80, 80], [6, -6]);
  const rotateY = useTransform(x, [-80, 80], [-6, 6]);
  const glowX = useTransform(x, [-120, 120], ["20%", "80%"]);
  const glowY = useTransform(y, [-120, 120], ["20%", "80%"]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/proofpack/${row.objectId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d) return;
        const m = d.manifest as { title?: string; files?: unknown[] } | null;
        if (m) setMeta({ title: m.title, files: m.files?.length });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [row.objectId]);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - (rect.left + rect.width / 2));
    y.set(e.clientY - (rect.top + rect.height / 2));
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <li className="[perspective:1200px]">
      <motion.div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        transition={{ type: "spring", stiffness: 140, damping: 18 }}
        className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#16182a] via-[#171a2b] to-[#0f0f0f] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.7)] transition-shadow hover:shadow-[0_30px_80px_-25px_rgba(145,129,245,0.45)]"
      >
        {/* Cursor-tracked spotlight */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(420px 220px at var(--gx) var(--gy), rgba(145,129,245,0.25), transparent 60%)",
            ["--gx" as string]: glowX,
            ["--gy" as string]: glowY,
          }}
        />

        {/* Shimmer sweep */}
        <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
          <motion.span
            className="absolute inset-y-0 -left-1/2 w-1/3 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent"
            animate={{ left: ["-50%", "150%"] }}
            transition={{ duration: 4.5, repeat: Infinity, repeatDelay: 3, ease: "linear" }}
          />
        </span>

        {/* Brand gradient stripe on top */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px]"
          style={{ background: "var(--gradient-brand)" }}
        />

        <Link href={`/pack/${row.objectId}`} className="block p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3
                className="truncate text-base font-semibold tracking-tight text-fg"
                style={{ fontFamily: "var(--font-tech), ui-sans-serif, system-ui" }}
              >
                {meta?.title ?? "Untitled pack"}
              </h3>
              <p className="mt-1 truncate font-mono text-[11px] text-fg-dim">
                {row.objectId.slice(0, 10)}…{row.objectId.slice(-6)}
              </p>
            </div>
            <motion.span
              aria-hidden
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="grid size-9 shrink-0 place-items-center rounded-xl border border-border-strong bg-bg/40 text-[var(--color-emerald)] shadow-[0_0_20px_-6px_rgba(108,242,204,0.5)]"
              title="Anchored on Sui"
            >
              <ShieldCheck className="size-4" />
            </motion.span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-fg-dim">
            <span className="rounded-full bg-white/[0.08] px-2 py-0.5 font-mono text-[10px] tracking-tight text-fg">
              v{row.version}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${visTone(row.visibility)}`}>
              {visLabel(row.visibility)}
            </span>
            {meta?.files !== undefined && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-bg/30 px-2 py-0.5 text-[10px] text-fg-muted">
                <FileCheck2 className="size-3" /> {meta.files} file{meta.files === 1 ? "" : "s"}
              </span>
            )}
            <span>· {new Date(row.createdAtMs).toLocaleDateString()}</span>
          </div>
        </Link>

        <div className="flex items-center justify-between gap-2 border-t border-border/60 px-5 py-3 text-[11px]">
          <Link
            href={`/pack/${row.objectId}`}
            className="inline-flex items-center gap-1 text-fg-muted hover:text-fg"
          >
            <ExternalLink className="size-3" /> Open
          </Link>
          <Link
            href={`/verify/${row.objectId}`}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white shadow-[0_-4px_8px_rgba(255,255,255,0.18)_inset] transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--gradient-brand)" }}
          >
            Verify <ArrowUpRight className="size-3" />
          </Link>
        </div>

        {row.previousVersionId && (
          <Link
            href={`/pack/${row.previousVersionId}`}
            className="block border-t border-border/60 px-5 py-2 text-[11px] text-fg-dim hover:bg-white/[0.02] hover:text-[var(--color-violet-soft)]"
          >
            ← previous version
          </Link>
        )}
      </motion.div>
    </li>
  );
}
