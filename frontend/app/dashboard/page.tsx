"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import type { Hex } from "@/lib/types";
import { SkeletonRow } from "@/components/Skeleton";
import { ErrorPanel } from "@/components/ErrorPanel";

function visLabel(n: number): string {
  if (n === 0) return "private";
  if (n === 1) return "unlisted";
  return "public";
}

interface PackRow {
  objectId: Hex;
  title?: string;
  version: number;
  visibility: number;
  manifestBlobId: string;
  createdAtMs: number;
  previousVersionId?: Hex;
}

export default function DashboardPage() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const [rows, setRows] = useState<PackRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const pkgId = process.env.NEXT_PUBLIC_PACKAGE_ID;

  useEffect(() => {
    if (!account || !pkgId) return;
    let cancelled = false;
    (async () => {
      try {
        const owned = await client.getOwnedObjects({
          owner: account.address,
          filter: { StructType: `${pkgId}::proofpack::ProofPack` },
          options: { showContent: true, showType: true },
        });
        const data: PackRow[] = [];
        for (const item of owned.data) {
          const f = (item.data?.content as { fields?: Record<string, unknown> } | undefined)?.fields;
          if (!f) continue;
          const pv = f.previous_version as { vec?: string[] } | undefined;
          const previousVersionId =
            pv && Array.isArray(pv.vec) && pv.vec.length > 0 ? (pv.vec[0] as Hex) : undefined;
          data.push({
            objectId: item.data!.objectId as Hex,
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
    return () => { cancelled = true; };
  }, [account, client, pkgId]);

  if (!account) {
    return <p className="text-[var(--muted)]">Connect a Sui wallet to view your packs.</p>;
  }
  if (!pkgId) {
    return (
      <p className="text-[var(--danger)] text-sm">
        NEXT_PUBLIC_PACKAGE_ID is not set. Publish the Move package and update <code>.env.local</code>.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Your ProofPacks</h1>
        <Link
          href="/pack/new"
          className="px-4 py-2 rounded-md bg-[var(--accent)] text-[#0b0d12] font-semibold text-sm"
        >
          New Pack
        </Link>
      </div>
      {err && <ErrorPanel title="Could not load packs" message={err} />}
      {rows === null && (
        <div className="border border-[var(--border)] rounded-lg overflow-hidden">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      )}
      {rows && rows.length === 0 && (
        <p className="text-[var(--muted)]">No packs yet. Create one to get started.</p>
      )}
      {rows && rows.length > 0 && (
        <ul className="border border-[var(--border)] rounded-lg divide-y divide-[var(--border)]">
          {rows.map((r) => (
            <li key={r.objectId} className="p-4 flex items-center justify-between">
              <div>
                <Link href={`/pack/${r.objectId}`} className="font-medium hover:text-[var(--accent)]">
                  {r.objectId.slice(0, 10)}…{r.objectId.slice(-6)}
                </Link>
                <div className="text-xs text-[var(--muted)] flex items-center gap-2 flex-wrap">
                  <span className="px-1.5 py-0.5 rounded bg-[var(--accent)]/15 text-[var(--accent)] font-semibold">v{r.version}</span>
                  <span>vis {visLabel(r.visibility)}</span>
                  <span>· {new Date(r.createdAtMs).toLocaleString()}</span>
                  {r.previousVersionId && (
                    <Link
                      href={`/pack/${r.previousVersionId}`}
                      className="underline hover:text-[var(--accent)]"
                      title={r.previousVersionId}
                    >
                      ← prev version
                    </Link>
                  )}
                </div>
              </div>
              <Link
                href={`/verify/${r.objectId}`}
                className="text-xs px-3 py-1.5 border border-[var(--border)] rounded-md hover:border-[var(--accent)]"
              >
                Verify
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
