import { Transaction } from "@mysten/sui/transactions";
import { hexToBytes } from "../hash/sha256";
import { env, requirePackageId, requireRegistryId } from "../env";

export interface BuildCreateTxInput {
  manifestBlobId: string;
  manifestHashHex: string;
  visibility: 0 | 1 | 2;
}

const CLOCK = "0x6";

export function buildCreateProofPackTx(input: BuildCreateTxInput): Transaction {
  const tx = new Transaction();
  const hashBytes = hexToBytes(input.manifestHashHex);
  if (hashBytes.length !== 32) {
    throw new Error(`manifest_hash must be 32 bytes, got ${hashBytes.length}`);
  }

  tx.moveCall({
    target: `${requirePackageId()}::proofpack::create`,
    arguments: [
      tx.object(requireRegistryId()),
      tx.pure.string(input.manifestBlobId),
      tx.pure.vector("u8", Array.from(hashBytes)),
      tx.pure.u8(input.visibility),
      tx.object(CLOCK),
    ],
  });

  return tx;
}

export function visibilityToU8(v: "private" | "unlisted" | "public"): 0 | 1 | 2 {
  if (v === "private") return 0;
  if (v === "unlisted") return 1;
  return 2;
}

export function visibilityFromU8(n: number): "private" | "unlisted" | "public" {
  if (n === 0) return "private";
  if (n === 1) return "unlisted";
  return "public";
}

export function networkLabel(): string {
  return env.suiNetwork;
}
