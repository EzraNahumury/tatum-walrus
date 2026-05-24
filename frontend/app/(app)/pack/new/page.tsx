"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, FileText, Hash, Sparkles, Tag } from "lucide-react";
import {
  useCurrentAccount,
  useSignTransaction,
} from "@mysten/dapp-kit";
import { FileDropzone } from "@/components/FileDropzone";
import { LoadingLogo } from "@/components/LoadingLogo";
import { ErrorPanel } from "@/components/ErrorPanel";
import { Reveal } from "@/components/motion/Reveal";
import { BackLink } from "@/components/BackLink";
import { sha256OfFile } from "@/lib/hash/sha256";
import { buildManifest, hashManifest } from "@/lib/manifest";
import { buildCreateProofPackTx, visibilityToU8 } from "@/lib/sui/tx";
import type { Hex, UploadResult, Visibility } from "@/lib/types";


type Phase =
  | "idle"
  | "hashing"
  | "uploading-files"
  | "uploading-manifest"
  | "signing"
  | "done"
  | "error";

const PHASE_LABEL: Record<Phase, string> = {
  idle: "",
  hashing: "Hashing files…",
  "uploading-files": "Uploading to Walrus…",
  "uploading-manifest": "Anchoring manifest…",
  signing: "Awaiting wallet signature…",
  done: "Done",
  error: "",
};

export default function NewPackPage() {
  const router = useRouter();
  const account = useCurrentAccount();
  const { mutateAsync: signTransaction } = useSignTransaction();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [files, setFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [err, setErr] = useState<string | null>(null);

  const canSubmit =
    !!account && title.trim().length > 0 && files.length > 0 && phase !== "uploading-files";

  async function submit() {
    if (!account) return;
    setErr(null);
    try {
      setPhase("hashing");
      const owner = account.address as Hex;

      for (const f of files) await sha256OfFile(f);

      setPhase("uploading-files");
      // Upload one file per request — partial progress survives single-file
      // failures and dev hot-reload never kills a single multi-file fetch.
      const uploaded: UploadResult[] = [];
      for (const f of files) {
        const form = new FormData();
        form.append("files", f, f.name);
        const upRes = await fetch("/api/upload", { method: "POST", body: form });
        if (!upRes.ok) {
          const t = await upRes.text();
          throw new Error(`upload ${f.name} (${upRes.status}): ${t.slice(0, 200)}`);
        }
        const json = (await upRes.json()) as { files: UploadResult[] };
        uploaded.push(...json.files);
      }
      const upJson = { files: uploaded };

      const manifest = buildManifest({
        title: title.trim(),
        description: description.trim() || undefined,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        owner,
        files: upJson.files,
      });

      setPhase("uploading-manifest");
      const manRes = await fetch("/api/proofpack/manifest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(manifest),
      });
      if (!manRes.ok) throw new Error(`manifest: ${await manRes.text()}`);
      const manJson = (await manRes.json()) as { manifestBlobId: string; manifestHash: string };

      const { hash } = await hashManifest(manifest);
      if (hash !== manJson.manifestHash) {
        throw new Error(`manifest hash mismatch (client ${hash} vs server ${manJson.manifestHash})`);
      }

      setPhase("signing");
      const tx = buildCreateProofPackTx({
        manifestBlobId: manJson.manifestBlobId,
        manifestHashHex: manJson.manifestHash,
        visibility: visibilityToU8(visibility),
      });
      tx.setSender(account.address);

      // Wallet signs locally + returns base64 tx bytes. We never round-trip
      // unsigned bytes through the server.
      const signed = await signTransaction({ transaction: tx });

      // Execute through our server route — Tatum gateway blocks browser POSTs
      // for sui_executeTransactionBlock with a CORS error, and going through
      // /api/execute also attributes the call via x-api-key.
      const execRes = await fetch("/api/execute", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          transactionBlock: signed.bytes,
          signature: signed.signature,
        }),
      });
      if (!execRes.ok) {
        const t = await execRes.text();
        throw new Error(`execute (${execRes.status}): ${t.slice(0, 200)}`);
      }
      const exec = (await execRes.json()) as {
        digest: string;
        objectChanges?: Array<{ type: string; objectType?: string; objectId?: string }>;
      };
      setPhase("done");

      const created = (exec.objectChanges ?? []).find(
        (c) =>
          c.type === "created" &&
          typeof c.objectType === "string" &&
          c.objectType.includes("::proofpack::ProofPack"),
      );
      const packId = created?.objectId;
      if (packId) router.push(`/pack/${packId}`);
      else router.push(`/dashboard?digest=${exec.digest}`);
    } catch (e) {
      console.error(e);
      setErr(String(e));
      setPhase("error");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <BackLink href="/dashboard" label="Back to dashboard" />
      <Reveal>
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-fg-dim">Step 1 of 1</p>
          <h1
            className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl"
            style={{ fontFamily: "var(--font-tech), ui-sans-serif, system-ui" }}
          >
            Create a ProofPack
          </h1>
          <p className="mt-2 max-w-xl text-sm text-fg-muted">
            Drop files, sign once. Bytes land on Walrus, the manifest hash anchors on Sui via Tatum.
          </p>
        </div>
      </Reveal>

      {!account && (
        <Reveal>
          <div className="rounded-2xl border border-amber-300/20 bg-[rgba(255,196,107,0.06)] px-4 py-3 text-sm text-[var(--color-amber)]">
            Connect a Sui wallet to continue.
          </div>
        </Reveal>
      )}

      <Reveal delay={0.05}>
        <section className="space-y-5 rounded-2xl border border-border bg-surface/60 p-6">
          <Field label="Title" icon={<Sparkles className="size-3.5" />}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Startup Due Diligence Pack"
              className="w-full rounded-xl border border-border bg-bg/40 px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-fg-dim focus:border-[var(--color-violet-soft)]"
            />
          </Field>
          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-border bg-bg/40 px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-fg-dim focus:border-[var(--color-violet-soft)]"
              placeholder="What's inside this pack? Optional."
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Tags (comma separated)" icon={<Tag className="size-3.5" />}>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="grant, q4-2026, evidence"
                className="w-full rounded-xl border border-border bg-bg/40 px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-fg-dim focus:border-[var(--color-violet-soft)]"
              />
            </Field>
            <Field label="Visibility">
              <div className="flex flex-wrap gap-2">
                {(["public", "unlisted", "private"] as Visibility[]).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVisibility(v)}
                    className={`rounded-full border px-3.5 py-2 text-xs uppercase tracking-wider transition-all ${
                      visibility === v
                        ? "border-[var(--color-violet-soft)] bg-[rgba(145,129,245,0.14)] text-fg"
                        : "border-border bg-bg/40 text-fg-muted hover:text-fg"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.1}>
        <section className="space-y-3 rounded-2xl border border-border bg-surface/60 p-6">
          <div className="flex items-center gap-2 text-xs text-fg-muted">
            <FileText className="size-3.5" />
            <span className="uppercase tracking-[0.18em]">Files</span>
          </div>
          <FileDropzone
            files={files}
            onChange={setFiles}
            disabled={phase !== "idle" && phase !== "error"}
          />
        </section>
      </Reveal>

      {err && (
        <ErrorPanel
          title="Pack creation failed"
          message={err}
          action={{
            label: "Reset and try again",
            onClick: () => {
              setErr(null);
              setPhase("idle");
            },
          }}
        />
      )}

      <Reveal delay={0.15}>
        <div className="sticky bottom-4 flex flex-wrap items-center gap-4 rounded-2xl border border-border-strong bg-surface/85 px-5 py-4 backdrop-blur-xl">
          <div className="flex flex-1 items-center gap-3">
            <Hash className="size-4 text-fg-muted" />
            <div className="text-xs text-fg-muted">
              {files.length === 0 ? (
                "Add files to continue"
              ) : (
                <>
                  <span className="font-semibold text-fg tabular">{files.length}</span> file
                  {files.length === 1 ? "" : "s"} ready · all bytes will be SHA-256&apos;d before upload
                </>
              )}
            </div>
          </div>
          {phase !== "idle" && phase !== "error" && phase !== "done" && (
            <LoadingLogo label={PHASE_LABEL[phase]} />
          )}
          <button
            disabled={!canSubmit}
            onClick={submit}
            className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-[0_-4px_8px_rgba(255,255,255,0.25)_inset] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
            style={{ background: "var(--gradient-brand)" }}
          >
            {phase === "idle" || phase === "error" ? "Create ProofPack" : "Working…"}
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-[1px]" />
          </button>
        </div>
      </Reveal>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-fg-dim">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}
