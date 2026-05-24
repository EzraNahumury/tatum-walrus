import Link from "next/link";
import { headers } from "next/headers";
import { ChatPanel } from "@/components/ChatPanel";
import type { ProofPackManifest, ProofPackOnChain } from "@/lib/types";

interface PackResp {
  onChain: ProofPackOnChain;
  manifest: ProofPackManifest | null;
  error?: string;
  message?: string;
}

async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

const AGGREGATOR =
  process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL ??
  "https://aggregator.walrus-testnet.walrus.space";

export default async function PackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/proofpack/${id}`, { cache: "no-store" });
  const data = (await res.json()) as PackResp;

  if (!res.ok || data.error) {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-2">ProofPack</h1>
        <p className="text-[var(--danger)] text-sm">{data.message ?? data.error ?? "Not found"}</p>
      </div>
    );
  }

  const { onChain, manifest } = data;
  const net = process.env.NEXT_PUBLIC_SUI_NETWORK ?? "testnet";
  const explorer = `https://suiscan.xyz/${net}/object/${onChain.objectId}`;
  const manifestUrl = `${AGGREGATOR.replace(/\/$/, "")}/v1/blobs/${onChain.manifestBlobId}`;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--muted)] uppercase tracking-widest">ProofPack</p>
          <h1 className="text-3xl font-semibold mt-1">{manifest?.title ?? id}</h1>
          {manifest?.description && (
            <p className="text-sm text-[var(--muted)] mt-2 max-w-2xl">{manifest.description}</p>
          )}
        </div>
        <Link
          href={`/verify/${onChain.objectId}`}
          className="px-4 py-2 rounded-md bg-[var(--accent)] text-[#0b0d12] font-semibold text-sm"
        >
          Public verify
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Box title="On-chain">
          <Row k="objectId" v={onChain.objectId} link={explorer} />
          <Row k="owner" v={onChain.owner} />
          <Row k="version" v={String(onChain.version)} />
          <Row k="visibility" v={onChain.visibility} />
          <Row k="createdAt" v={new Date(onChain.createdAtMs).toISOString()} />
        </Box>
        <Box title="Manifest (Walrus)">
          <Row k="manifestBlobId" v={onChain.manifestBlobId} link={manifestUrl} />
          <Row k="manifestHash" v={onChain.manifestHash} />
          <Row k="files" v={String(manifest?.files.length ?? 0)} />
        </Box>
      </div>

      {manifest && (
        <div>
          <h2 className="font-semibold mb-3">Files</h2>
          <ul className="border border-[var(--border)] rounded-lg divide-y divide-[var(--border)] text-sm">
            {manifest.files.map((f, i) => (
              <li key={i} className="p-3 grid grid-cols-12 gap-3 items-center">
                <span className="col-span-4 truncate font-medium">{f.filename}</span>
                <span className="col-span-2 text-[var(--muted)]">{(f.size / 1024).toFixed(1)} KB</span>
                <span className="col-span-3 text-[var(--muted)] truncate" title={f.sha256}>
                  sha256: {f.sha256.slice(0, 16)}…
                </span>
                <a
                  className="col-span-3 text-right text-[var(--accent)] hover:underline truncate"
                  href={`${AGGREGATOR.replace(/\/$/, "")}/v1/blobs/${f.blobId}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  blob {f.blobId.slice(0, 10)}…
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ChatPanel objectId={onChain.objectId} />
    </div>
  );
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[var(--border)] rounded-lg p-4 space-y-2">
      <h3 className="font-semibold">{title}</h3>
      <div className="text-sm space-y-1.5">{children}</div>
    </div>
  );
}

function Row({ k, v, link }: { k: string; v: string; link?: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-[var(--muted)] w-32 shrink-0">{k}</span>
      {link ? (
        <a href={link} target="_blank" rel="noreferrer" className="font-mono text-xs break-all text-[var(--accent)] hover:underline">
          {v}
        </a>
      ) : (
        <span className="font-mono text-xs break-all">{v}</span>
      )}
    </div>
  );
}
