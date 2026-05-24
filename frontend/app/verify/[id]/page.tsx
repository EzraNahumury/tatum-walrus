import { headers } from "next/headers";
import { VerifyBadge } from "@/components/VerifyBadge";
import type {
  ProofPackManifest,
  ProofPackOnChain,
  VerificationReport,
} from "@/lib/types";

interface VerifyResp {
  onChain: ProofPackOnChain;
  manifest: ProofPackManifest;
  report: VerificationReport;
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

export default async function VerifyDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/verify/${id}`, { cache: "no-store" });
  const data = (await res.json()) as VerifyResp;

  if (!res.ok || data.error) {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-2">Verification</h1>
        <p className="text-[var(--danger)] text-sm">{data.message ?? data.error}</p>
      </div>
    );
  }

  const { onChain, manifest, report } = data;
  const net = process.env.NEXT_PUBLIC_SUI_NETWORK ?? "testnet";
  const explorer = `https://suiscan.xyz/${net}/object/${onChain.objectId}`;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-xs text-[var(--muted)] uppercase tracking-widest">Public verifier</p>
          <h1 className="text-3xl font-semibold mt-1">{manifest.title}</h1>
          <p className="text-sm text-[var(--muted)] mt-2 max-w-2xl">
            Bytes refetched from Walrus, hashes recomputed in this browser session, and compared against the on-chain anchor on Sui via Tatum RPC.
          </p>
        </div>
        <VerifyBadge valid={report.valid} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 text-sm">
        <Box title="On-chain anchor">
          <Row k="objectId" v={onChain.objectId} link={explorer} />
          <Row k="owner" v={onChain.owner} />
          <Row k="manifestHash" v={onChain.manifestHash} />
          <Row k="network" v={report.network} />
          <Row k="rpc" v={report.tatumRpcUrl} />
        </Box>
        <Box title="Manifest check">
          <Row k="manifestBlobId" v={onChain.manifestBlobId} link={`${AGGREGATOR.replace(/\/$/, "")}/v1/blobs/${onChain.manifestBlobId}`} />
          <Row k="manifestOk" v={String(report.manifestOk)} />
          {report.reportBlobId && (
            <Row
              k="reportBlobId"
              v={report.reportBlobId}
              link={`${AGGREGATOR.replace(/\/$/, "")}/v1/blobs/${report.reportBlobId}`}
            />
          )}
        </Box>
      </div>

      <div>
        <h2 className="font-semibold mb-3">Files</h2>
        <ul className="border border-[var(--border)] rounded-lg divide-y divide-[var(--border)] text-sm">
          {report.files.map((f, i) => (
            <li key={i} className="p-3 grid grid-cols-12 gap-2 items-center">
              <span className="col-span-4 truncate">{f.filename}</span>
              <span className="col-span-3 font-mono text-xs text-[var(--muted)] truncate" title={f.expected}>
                exp {f.expected.slice(0, 12)}…
              </span>
              <span className="col-span-3 font-mono text-xs text-[var(--muted)] truncate" title={f.actual}>
                got {String(f.actual).slice(0, 12)}…
              </span>
              <span className={`col-span-2 text-right font-semibold ${f.ok ? "text-[var(--accent)]" : "text-[var(--danger)]"}`}>
                {f.ok ? "OK" : "FAIL"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <details className="text-xs">
        <summary className="cursor-pointer text-[var(--muted)]">Raw verification report JSON</summary>
        <pre className="mt-2 p-3 bg-black/40 rounded-md overflow-auto">{JSON.stringify(report, null, 2)}</pre>
      </details>
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
