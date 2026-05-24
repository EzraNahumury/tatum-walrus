"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowUpRight, Layers, Plus } from "lucide-react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Reveal } from "@/components/motion/Reveal";
import { ErrorPanel } from "@/components/ErrorPanel";
import { SkeletonRow } from "@/components/Skeleton";
import type { PackRow } from "@/components/PackCard";
import type { Hex } from "@/lib/types";

// Defer framer-motion until cards actually render.
const PackCard = dynamic(
  () => import("@/components/PackCard").then((m) => ({ default: m.PackCard })),
  { ssr: false, loading: () => <SkeletonRow /> },
);

export default function DashboardPage() {
  const account = useCurrentAccount();
  const [rows, setRows] = useState<PackRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const pkgId = process.env.NEXT_PUBLIC_PACKAGE_ID;
  const address = account?.address;

  useEffect(() => {
    if (!address || !pkgId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/owned?owner=${address}`);
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
  }, [address, pkgId]);

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
