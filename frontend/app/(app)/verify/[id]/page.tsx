import { headers } from "next/headers";
import { CheckCircle2, ExternalLink, Hash, Shield, XCircle } from "lucide-react";
import { BackLink } from "@/components/BackLink";
import { CopyButton } from "@/components/CopyButton";
import { JsonView } from "@/components/JsonView";
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
      <div className="mx-auto max-w-2xl space-y-4">
        <BackLink href="/dashboard" label="Back to dashboard" />
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-tech), ui-sans-serif, system-ui" }}
        >
          Verification
        </h1>
        <p className="rounded-2xl border border-[var(--color-danger)]/30 bg-[rgba(255,107,107,0.06)] px-4 py-3 text-sm text-[var(--color-danger)]">
          {data.message ?? data.error}
        </p>
      </div>
    );
  }

  const { onChain, manifest, report } = data;
  const net = process.env.NEXT_PUBLIC_SUI_NETWORK ?? "testnet";
  const explorer = `https://suiscan.xyz/${net}/object/${onChain.objectId}`;
  const valid = report.valid;
  const okCount = report.files.filter((f) => f.ok).length;

  return (
    <div className="space-y-10">
      <BackLink href="/dashboard" label="Back to dashboard" />
      <header className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.22em] text-fg-dim">
            <Shield className="size-3" /> Public verifier
          </p>
          <h1
            className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl"
            style={{ fontFamily: "var(--font-tech), ui-sans-serif, system-ui" }}
          >
            {manifest.title}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-fg-muted sm:text-[15px]">
            Bytes refetched from Walrus, hashes recomputed in this browser session, and compared
            against the on-chain anchor on Sui via Tatum RPC.
          </p>
        </div>

        <BigStatus valid={valid} okCount={okCount} total={report.files.length} manifestOk={report.manifestOk} />
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Box title="On-chain anchor" icon={<Hash className="size-3.5" />}>
          <Row k="objectId" v={onChain.objectId} link={explorer} mono copy />
          <Row k="owner" v={onChain.owner} mono copy />
          <Row k="manifestHash" v={onChain.manifestHash} mono copy />
          <Row k="network" v={report.network} />
          <Row k="rpc" v={report.tatumRpcUrl} mono copy />
        </Box>
        <Box title="Manifest check" icon={<CheckCircle2 className="size-3.5" />}>
          <Row
            k="manifestBlobId"
            v={onChain.manifestBlobId}
            link={`${AGGREGATOR.replace(/\/$/, "")}/v1/blobs/${onChain.manifestBlobId}`}
            mono
            copy
          />
          <Row k="manifestOk" v={String(report.manifestOk)} />
          {report.reportBlobId && (
            <Row
              k="reportBlobId"
              v={report.reportBlobId}
              link={`${AGGREGATOR.replace(/\/$/, "")}/v1/blobs/${report.reportBlobId}`}
              mono
              copy
            />
          )}
        </Box>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-fg-muted">
          Files
        </h2>
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface/50 text-sm">
          {report.files.map((f, i) => (
            <li
              key={i}
              className="grid grid-cols-1 gap-1.5 px-4 py-3 transition-colors hover:bg-white/[0.025] md:grid-cols-12 md:items-center md:gap-2"
            >
              <span className="truncate md:col-span-4">{f.filename}</span>
              <span className="truncate font-mono text-[11px] text-fg-dim md:col-span-3" title={f.expected}>
                exp · {f.expected.slice(0, 12)}…
              </span>
              <span className="truncate font-mono text-[11px] text-fg-dim md:col-span-3" title={f.actual}>
                got · {String(f.actual).slice(0, 12)}…
              </span>
              <span
                className={`inline-flex items-center justify-start gap-1 text-xs font-semibold uppercase tracking-wider md:col-span-2 md:justify-end ${
                  f.ok ? "text-[var(--color-emerald)]" : "text-[var(--color-danger)]"
                }`}
              >
                {f.ok ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
                {f.ok ? "OK" : "FAIL"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <details className="space-y-3 text-xs">
        <summary className="cursor-pointer rounded-full border border-border-strong px-3 py-1.5 text-fg-muted hover:bg-white/[0.04] hover:text-fg w-fit">
          Raw verification report JSON
        </summary>
        <JsonView data={report} filename="verify-report.json" />
      </details>
    </div>
  );
}

function BigStatus({
  valid,
  okCount,
  total,
  manifestOk,
}: {
  valid: boolean;
  okCount: number;
  total: number;
  manifestOk: boolean;
}) {
  const tone = valid
    ? "from-[rgba(108,242,204,0.16)] to-[rgba(92,216,255,0.08)] border-[rgba(108,242,204,0.4)]"
    : "from-[rgba(255,107,107,0.16)] to-[rgba(255,122,144,0.08)] border-[rgba(255,107,107,0.4)]";
  const accent = valid ? "text-[var(--color-emerald)]" : "text-[var(--color-danger)]";
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 ${tone}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full blur-3xl"
        style={{
          background: valid
            ? "radial-gradient(closest-side, rgba(108,242,204,0.35), transparent 70%)"
            : "radial-gradient(closest-side, rgba(255,107,107,0.35), transparent 70%)",
        }}
      />
      <p className="text-[11px] uppercase tracking-[0.22em] text-fg-dim">Status</p>
      <p className={`mt-1 text-3xl font-bold tracking-tight ${accent}`}>
        {valid ? "VALID" : "INVALID"}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] uppercase tracking-wider text-fg-muted">
        <div>
          <p className="text-fg-dim">Files</p>
          <p className={`mt-0.5 text-sm font-semibold tabular ${accent}`}>
            {okCount} / {total}
          </p>
        </div>
        <div>
          <p className="text-fg-dim">Manifest</p>
          <p className={`mt-0.5 text-sm font-semibold ${accent}`}>{manifestOk ? "match" : "mismatch"}</p>
        </div>
      </div>
    </div>
  );
}

function Box({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface/60 p-5">
      <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-fg-dim">
        {icon}
        <span>{title}</span>
      </div>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  );
}

function Row({
  k,
  v,
  link,
  mono,
  copy,
}: {
  k: string;
  v: string;
  link?: string;
  mono?: boolean;
  copy?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="w-32 shrink-0 text-fg-dim">{k}</span>
      <div className="flex min-w-0 flex-1 items-baseline gap-2">
        {link ? (
          <a
            href={link}
            target={link.startsWith("/") ? undefined : "_blank"}
            rel={link.startsWith("/") ? undefined : "noreferrer"}
            className={`min-w-0 break-all text-[var(--color-violet-soft)] hover:underline ${mono ? "font-mono text-xs" : ""}`}
          >
            {v}
          </a>
        ) : (
          <span className={`min-w-0 break-all ${mono ? "font-mono text-xs" : ""}`}>{v}</span>
        )}
        {copy && <CopyButton value={v} size="xs" label={k} />}
      </div>
    </div>
  );
}
