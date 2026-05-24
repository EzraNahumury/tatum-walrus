"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ExternalLink, FileCheck2, Layers, Plus, ShieldCheck } from "lucide-react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Reveal } from "@/components/motion/Reveal";
import { ErrorPanel } from "@/components/ErrorPanel";
import { SkeletonRow } from "@/components/Skeleton";
import type { Hex } from "@/lib/types";

interface PackRow {
  objectId: Hex;
  title?: string;
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
  if (n === 0) return "bg-[rgba(255,196,107,0.12)] text-[var(--color-amber)]";
  if (n === 1) return "bg-[rgba(145,129,245,0.14)] text-[var(--color-violet-soft)]";
  return "bg-[rgba(108,242,204,0.12)] text-[var(--color-emerald)]";
}

export default function DashboardPage() {
  const account = useCurrentAccount();
  const [rows, setRows] = useState<PackRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const pkgId = process.env.NEXT_PUBLIC_PACKAGE_ID;

  useEffect(() => {
    if (!account || !pkgId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/owned?owner=${account.address}`);
        if (!res.ok) {
          const t = await res.text();
          throw new Error(`/api/owned ${res.status}: ${t}`);
        }
        const json = (await res.json()) as {
          data: Array<{ objectId: string; fields: Record<string, unknown> | null }>;
        };
        const data: PackRow[] = [];
        for (const item of json.data) {
          const f = item.fields;
          if (!f) continue;
          const pv = f.previous_version as { vec?: string[] } | undefined;
          const previousVersionId =
            pv && Array.isArray(pv.vec) && pv.vec.length > 0 ? (pv.vec[0] as Hex) : undefined;
          data.push({
            objectId: item.objectId as Hex,
            version: Number(f.version),
            visibility: Number(f.visibility),
            manifestBlobId: String(f.manifest_blob_id),
            createdAtMs: Number(f.created_at_ms),
            previousVersionId,
          });
        }
        if (!cancelled) setRows(data);
      } catch (e) {
        if (!cancelled) setErr(String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [account, pkgId]);

  if (!account) {
    return (
      <Reveal>
        <EmptyState
          icon={<Layers className="size-6" />}
          title="Connect a Sui wallet"
          body="Your ProofPacks will appear here once a wallet is connected."
        />
      </Reveal>
    );
  }

  if (!pkgId) {
    return (
      <ErrorPanel
        title="Package ID missing"
        message="NEXT_PUBLIC_PACKAGE_ID is not set. Publish the Move package and update .env.local."
      />
    );
  }

  return (
    <div className="space-y-8">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-fg-dim">Your packs</p>
            <h1
              className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-tech), ui-sans-serif, system-ui" }}
            >
              ProofPack vault
            </h1>
          </div>
          <Link
            href="/pack/new"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold tracking-tight text-bg shadow-[0_-4px_8px_rgba(255,255,255,0.25)_inset] transition-transform hover:-translate-y-0.5"
          >
            <Plus className="size-4" />
            <span>New Pack</span>
          </Link>
        </div>
      </Reveal>

      {err && (
        <Reveal>
          <ErrorPanel title="Could not load packs" message={err} />
        </Reveal>
      )}

      {!err && rows === null && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface/50">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      )}

      {!err && rows && rows.length === 0 && (
        <Reveal>
          <EmptyState
            icon={<Layers className="size-6" />}
            title="No packs yet"
            body="Create your first ProofPack — drop in files, sign once, share a verifier link."
            action={
              <Link
                href="/pack/new"
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
                style={{ background: "var(--gradient-brand)" }}
              >
                Create ProofPack <ArrowUpRight className="size-3.5" />
              </Link>
            }
          />
        </Reveal>
      )}

      {!err && rows && rows.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {rows.map((r, i) => (
            <Reveal key={r.objectId} delay={i * 0.04}>
              <PackCard row={r} />
            </Reveal>
          ))}
        </ul>
      )}
    </div>
  );
}

function PackCard({ row }: { row: PackRow }) {
  const [meta, setMeta] = useState<{ title?: string; files?: number } | null>(null);

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

  return (
    <li className="group relative overflow-hidden rounded-2xl border border-border bg-surface/60 transition-all hover:-translate-y-[3px] hover:border-border-strong hover:shadow-[0_20px_60px_-20px_rgba(145,129,245,0.35)]">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-80"
        style={{ background: "radial-gradient(closest-side, rgba(145,129,245,0.35), transparent 70%)" }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-[var(--color-violet-soft)] to-transparent opacity-0 transition-opacity group-hover:opacity-60"
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
          <span
            aria-hidden
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-border-strong bg-bg/40 text-[var(--color-emerald)] transition-transform group-hover:scale-110"
            title="Anchored on Sui"
          >
            <ShieldCheck className="size-4" />
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-fg-dim">
          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] tracking-tight text-fg">
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
          className="inline-flex items-center gap-1 rounded-full border border-border-strong px-3 py-1 uppercase tracking-wider text-fg-muted transition-colors hover:border-[var(--color-violet-soft)] hover:bg-[rgba(145,129,245,0.08)] hover:text-fg"
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
    </li>
  );
}

function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-2xl border border-border-strong bg-bg/40 text-fg-muted">
        {icon}
      </span>
      <div>
        <h3
          className="text-xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-tech), ui-sans-serif, system-ui" }}
        >
          {title}
        </h3>
        <p className="mt-1 max-w-md text-sm text-fg-muted">{body}</p>
      </div>
      {action}
    </div>
  );
}
