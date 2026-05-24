import type { ProofPackFile, ProofPackManifest, Hex } from "./types";
import { canonicalJson, sha256Hex } from "./hash/sha256";

export interface BuildManifestInput {
  title: string;
  description?: string;
  tags?: string[];
  owner: Hex;
  files: ProofPackFile[];
  previousManifestBlobId?: string;
}

export function buildManifest(input: BuildManifestInput): ProofPackManifest {
  return {
    schemaVersion: 1,
    title: input.title,
    description: input.description,
    tags: input.tags,
    owner: input.owner,
    createdAtMs: Date.now(),
    files: input.files,
    previousManifestBlobId: input.previousManifestBlobId,
  };
}

export function manifestBytes(manifest: ProofPackManifest): Uint8Array {
  const json = canonicalJson(manifest);
  return new TextEncoder().encode(json);
}

export async function hashManifest(manifest: ProofPackManifest): Promise<{ bytes: Uint8Array; hash: string }> {
  const bytes = manifestBytes(manifest);
  const hash = await sha256Hex(bytes);
  return { bytes, hash };
}
