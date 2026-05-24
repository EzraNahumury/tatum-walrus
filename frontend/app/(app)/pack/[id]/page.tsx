import Link from "next/link";
import { headers } from "next/headers";
import { ArrowUpRight, ExternalLink, Files as FilesIcon, Fingerprint } from "lucide-react";
import { ChatPanel } from "@/components/ChatPanel";
import { BackLink } from "@/components/BackLink";
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

const VIS_TONE: Record<string, string> = {
  private: "bg-[rgba(255,196,107,0.12)] text-[var(--color-amber)]",
  unlisted: "bg-[rgba(145,129,245,0.14)] text-[var(--color-violet-soft)]",
  public: "bg-[rgba(108,242,204,0.12)] text-[var(--color-emerald)]",
};

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
      <div className="mx-auto max-w-2xl space-y-4">
        <BackLink href="/dashboard" label="Back to dashboard" />
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-tech), ui-sans-serif, system-ui" }}
        >
          ProofPack
        </h1>
        <p className="rounded-2xl border border-[var(--color-danger)]/30 bg-[rgba(255,107,107,0.06)] px-4 py-3 text-sm text-[var(--color-danger)]">
          {data.message ?? data.error ?? "Not found"}
        </p>
      </div>
    );
  }

  const { onChain, manifest } = data;
  const net = process.env.NEXT_PUBLIC_SUI_NETWORK ?? "testnet";
  const explorer = `https://suiscan.xyz/${net}/object/${onChain.objectId}`;
  const manifestUrl = `${AGGREGATOR.replace(/\/$/, "")}/v1/blobs/${onChain.manifestBlobId}`;

  return (
    <div className="space-y-10">
      <BackLink href="/dashboard" label="Back to dashboard" />
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-fg-dim">
            <span>ProofPack</span>
            <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] tracking-tight text-fg">
              v{onChain.version}
            </span>
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${VIS_TONE[onChain.visibility] ?? ""}`}>
              {onChain.visibility}
            </span>
          </div>
          <h1
            className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl"
            style={{ fontFamily: "var(--font-tech), ui-sans-serif, system-ui" }}
          >
            {manifest?.title ?? "Untitled pack"}
          </h1>
          {manifest?.description && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-fg-muted sm:text-[15px]">
              {manifest.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <a
            href={explorer}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border-strong px-3.5 py-1.5 text-xs uppercase tracking-wider text-fg-muted transition-colors hover:bg-white/[0.06] hover:text-fg"
          >
            Suiscan <ExternalLink className="size-3" />
          </a>
          <Link
            href={`/verify/${onChain.objectId}`}
            className="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-[0_-4px_8px_rgba(255,255,255,0.25)_inset] transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--gradient-brand)" }}
          >
            Public verify <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Box title="On-chain" icon={<Fingerprint className="size-3.5" />}>
          <Row k="objectId" v={onChain.objectId} link={explorer} mono />
          <Row k="owner" v={onChain.owner} mono />
          <Row k="version" v={String(onChain.version)} />
          <Row k="visibility" v={onChain.visibility} />
          <Row k="createdAt" v={new Date(onChain.createdAtMs).toISOString()} mono />
          {onChain.previousVersionId && (
            <Row k="previousVersion" v={onChain.previousVersionId} link={`/pack/${onChain.previousVersionId}`} mono />
          )}
        </Box>
        <Box title="Manifest (Walrus)" icon={<FilesIcon className="size-3.5" />}>
          <Row k="manifestBlobId" v={onChain.manifestBlobId} link={manifestUrl} mono />
          <Row k="manifestHash" v={onChain.manifestHash} mono />
          <Row k="files" v={String(manifest?.files.length ?? 0)} />
        </Box>
      </div>

      {manifest && manifest.files.length > 0 && (
        <section>
          <h2
            className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-fg-muted"
            style={{ fontFamily: "var(--font-tech), ui-sans-serif, system-ui" }}
          >
            Files
          </h2>
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface/50 text-sm">
            {manifest.files.map((f, i) => (
              <li key={i} className="group grid grid-cols-1 gap-1.5 px-4 py-3 transition-colors hover:bg-white/[0.025] md:grid-cols-12 md:items-center md:gap-3">
                <span className="truncate font-medium text-fg md:col-span-4">{f.filename}</span>
                <span className="text-xs text-fg-dim tabular md:col-span-2">{(f.size / 1024).toFixed(1)} KB</span>
                <span className="truncate font-mono text-[11px] text-fg-dim md:col-span-3" title={f.sha256}>
                  sha256 · {f.sha256.slice(0, 12)}…
                </span>
                <a
                  className="inline-flex items-center justify-end gap-1 truncate text-xs font-medium text-[var(--color-violet-soft)] hover:underline md:col-span-3"
                  href={`${AGGREGATOR.replace(/\/$/, "")}/v1/blobs/${f.blobId}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  blob {f.blobId.slice(0, 10)}… <ExternalLink className="size-3" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ChatPanel objectId={onChain.objectId} />
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
}: {
  k: string;
  v: string;
  link?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="w-32 shrink-0 text-fg-dim">{k}</span>
      {link ? (
        <a
          href={link}
          target={link.startsWith("/") ? undefined : "_blank"}
          rel={link.startsWith("/") ? undefined : "noreferrer"}
          className={`break-all text-[var(--color-violet-soft)] hover:underline ${mono ? "font-mono text-xs" : ""}`}
        >
          {v}
        </a>
      ) : (
        <span className={`break-all ${mono ? "font-mono text-xs" : ""}`}>{v}</span>
      )}
    </div>
  );
}
