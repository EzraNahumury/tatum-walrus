import type { Hex, ProofPackOnChain, Visibility } from "../types";
import { visibilityFromU8 } from "./tx";

interface MoveFields {
  owner: string;
  manifest_blob_id: string;
  manifest_hash: number[] | string;
  version: string | number;
  visibility: number;
  created_at_ms: string | number;
  previous_version?: { vec?: string[] } | { id: string } | null;
}

function bytesToHex(arr: number[]): string {
  return arr.map((n) => n.toString(16).padStart(2, "0")).join("");
}

export function parseProofPackObject(obj: unknown): ProofPackOnChain {
  const o = obj as {
    data?: {
      objectId: string;
      content?: { fields?: MoveFields; dataType?: string };
    };
  };
  const fields = o.data?.content?.fields;
  if (!fields) throw new Error("ProofPack object missing fields");

  const manifestHashHex = Array.isArray(fields.manifest_hash)
    ? bytesToHex(fields.manifest_hash)
    : String(fields.manifest_hash).replace(/^0x/, "");

  const vis = visibilityFromU8(Number(fields.visibility));
  const objectId = o.data!.objectId as Hex;

  let previousVersionId: Hex | undefined;
  const pv = fields.previous_version;
  if (pv && typeof pv === "object") {
    if ("vec" in pv && Array.isArray(pv.vec) && pv.vec.length > 0) {
      previousVersionId = pv.vec[0] as Hex;
    } else if ("id" in pv && typeof pv.id === "string") {
      previousVersionId = pv.id as Hex;
    }
  }

  return {
    objectId,
    owner: fields.owner as Hex,
    manifestBlobId: fields.manifest_blob_id,
    manifestHash: manifestHashHex,
    version: Number(fields.version),
    visibility: vis as Visibility,
    createdAtMs: Number(fields.created_at_ms),
    previousVersionId,
  };
}
