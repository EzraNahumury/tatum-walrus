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
      className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-[var(--border)]/40 text-xs hover:bg-[var(--border)]"
      title={`sha256: ${ref.sha256}`}
    >
      <span className="font-semibold">{ref.filename}</span>
      <span className="text-[var(--muted)]">{ref.blobId.slice(0, 8)}…</span>
    </a>
  );
}
