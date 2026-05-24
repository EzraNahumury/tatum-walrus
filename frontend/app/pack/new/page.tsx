"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { FileDropzone } from "@/components/FileDropzone";
import { Spinner } from "@/components/Spinner";
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

export default function NewPackPage() {
  const router = useRouter();
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

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

      // pre-hash for UX; server re-hashes authoritatively
      for (const f of files) {
        await sha256OfFile(f);
      }

      setPhase("uploading-files");
      const form = new FormData();
      for (const f of files) form.append("files", f, f.name);
      const upRes = await fetch("/api/upload", { method: "POST", body: form });
      if (!upRes.ok) throw new Error(`upload: ${await upRes.text()}`);
      const upJson = (await upRes.json()) as { files: UploadResult[] };

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

      // sanity check
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

      const result = await signAndExecute({ transaction: tx });
      setPhase("done");

      // find the created ProofPack object id from effects
      const txRes = await fetch(`/api/proofpack/lookup?digest=${result.digest}`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
      const packId = txRes?.objectId as string | undefined;
      if (packId) router.push(`/pack/${packId}`);
      else router.push(`/dashboard?digest=${result.digest}`);
    } catch (e) {
      console.error(e);
      setErr(String(e));
      setPhase("error");
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-3xl font-semibold">Create ProofPack</h1>

      {!account && (
        <p className="text-sm text-[var(--muted)]">Connect a Sui wallet to continue.</p>
      )}

      <div className="space-y-4">
        <Field label="Title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Startup Due Diligence Pack"
            className="w-full bg-transparent border border-[var(--border)] rounded-md px-3 py-2 outline-none focus:border-[var(--accent)]"
          />
        </Field>
        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-transparent border border-[var(--border)] rounded-md px-3 py-2 outline-none focus:border-[var(--accent)]"
          />
        </Field>
        <Field label="Tags (comma separated)">
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="grant, q4-2026, evidence"
            className="w-full bg-transparent border border-[var(--border)] rounded-md px-3 py-2 outline-none focus:border-[var(--accent)]"
          />
        </Field>
        <Field label="Visibility">
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as Visibility)}
            className="w-full bg-transparent border border-[var(--border)] rounded-md px-3 py-2"
          >
            <option value="public">Public</option>
            <option value="unlisted">Unlisted</option>
            <option value="private">Private</option>
          </select>
        </Field>
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">Files</h2>
        <FileDropzone files={files} onChange={setFiles} disabled={phase !== "idle" && phase !== "error"} />
      </div>

      <div className="flex items-center gap-4">
        <button
          disabled={!canSubmit}
          onClick={submit}
          className="px-5 py-3 rounded-md bg-[var(--accent)] text-[#0b0d12] font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {phase === "idle" || phase === "error" ? "Create ProofPack" : "Working…"}
        </button>
        {phase === "hashing" && <Spinner label="Hashing files…" />}
        {phase === "uploading-files" && <Spinner label="Uploading to Walrus…" />}
        {phase === "uploading-manifest" && <Spinner label="Anchoring manifest…" />}
        {phase === "signing" && <Spinner label="Awaiting wallet signature…" />}
        {err && <span className="text-sm text-[var(--danger)]">{err}</span>}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      {children}
    </label>
  );
}
