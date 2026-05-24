import { FileCheck2 } from "lucide-react";
import type { AICitation } from "@/lib/types";

const AGGREGATOR =
  process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL ??
  "https://aggregator.walrus-testnet.walrus.space";

export function CitationChip({ ref }: { ref: AICitation }) {
  const blobUrl = `${AGGREGATOR.replace(/\/$/, "")}/v1/blobs/${ref.blobId}`;
  return (
    <a
      href={blobUrl}
      target="_blank"
      rel="noreferrer"
      className="group inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-bg/50 px-2 py-1 text-[11px] transition-colors hover:border-[var(--color-violet-soft)] hover:bg-[rgba(145,129,245,0.08)]"
      title={`sha256: ${ref.sha256}`}
    >
      <FileCheck2 className="size-3 text-[var(--color-violet-soft)]" />
      <span className="font-medium text-fg">{ref.filename}</span>
      <span className="font-mono text-fg-dim">{ref.blobId.slice(0, 8)}…</span>
    </a>
  );
}
