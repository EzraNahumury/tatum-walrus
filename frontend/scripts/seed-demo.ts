/**
 * Seed a demo ProofPack on Sui testnet.
 *
 * Reads SEED_PRIVATE_KEY (suiprivkey…) from env, uploads four fixture files
 * to Walrus, builds the manifest, uploads it, then submits proofpack::create
 * via Tatum Sui RPC. Prints the resulting object ID and verifier URL.
 *
 * Run: pnpm seed:demo  (or)  npx tsx scripts/seed-demo.ts
 */

import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import { SuiClient, SuiHTTPTransport } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";

const TATUM_RPC =
  process.env.NEXT_PUBLIC_TATUM_SUI_RPC_URL ?? "https://sui-testnet.gateway.tatum.io";
const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID;
const REGISTRY_ID = process.env.NEXT_PUBLIC_PROOFPACK_REGISTRY_ID;
const PUBLISHER = process.env.WALRUS_PUBLISHER_URL ?? "https://publisher.walrus-testnet.walrus.space";
const EPOCHS = Number(process.env.WALRUS_DEFAULT_EPOCHS ?? "5");

const fixtures: Array<{ name: string; contentType: string; body: string }> = [
  {
    name: "pitch-deck-summary.md",
    contentType: "text/markdown",
    body: `# Acme AI — Pitch Deck Summary\n\nProblem: legal evidence is centralized.\nSolution: ProofPack AI.\nTraction: 12 design partners.\nAsk: $250k pre-seed.\n`,
  },
  {
    name: "revenue-proof.json",
    contentType: "application/json",
    body: JSON.stringify(
      {
        currency: "USD",
        mrr_q1_2026: 12000,
        mrr_q2_2026: 18500,
        mrr_q3_2026: 27000,
        projected_arr_q4_2026: 420000,
      },
      null,
      2,
    ),
  },
  {
    name: "product-roadmap.md",
    contentType: "text/markdown",
    body: `# Roadmap\n- Q3: AI grounding hardening\n- Q4: Mainnet launch\n- Q1: Enterprise SSO + audit log export\n`,
  },
  {
    name: "founder-attestation.txt",
    contentType: "text/plain",
    body: `I, Garry, attest that all figures in this pack are true to the best of my knowledge. Signed at ${new Date().toISOString()}.\n`,
  },
];

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const digest = await crypto.subtle.digest("SHA-256", copy.buffer);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function canonicalJson(v: unknown): string {
  const sort = (x: unknown): unknown => {
    if (Array.isArray(x)) return x.map(sort);
    if (x && typeof x === "object") {
      const out: Record<string, unknown> = {};
      for (const k of Object.keys(x as Record<string, unknown>).sort()) {
        out[k] = sort((x as Record<string, unknown>)[k]);
      }
      return out;
    }
    return x;
  };
  return JSON.stringify(sort(v));
}

async function withRetry<T>(fn: () => Promise<T>, tries = 6): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const status = (e as { status?: number }).status;
      if (status !== 429) throw e;
      const wait = 2000 * (i + 1);
      console.log(`  429 rate-limited, retry in ${wait}ms…`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastErr;
}

async function walrusPut(bytes: Uint8Array): Promise<string> {
  const url = `${PUBLISHER.replace(/\/$/, "")}/v1/blobs?epochs=${EPOCHS}`;
  const res = await fetch(url, {
    method: "PUT",
    body: new Uint8Array(bytes),
    headers: { "content-type": "application/octet-stream" },
  });
  if (!res.ok) throw new Error(`walrus put ${res.status}: ${await res.text()}`);
  const j = (await res.json()) as {
    newlyCreated?: { blobObject: { blobId: string } };
    alreadyCertified?: { blobId: string };
  };
  const id = j.newlyCreated?.blobObject.blobId ?? j.alreadyCertified?.blobId;
  if (!id) throw new Error("walrus: missing blobId");
  return id;
}

async function main() {
  const pk = process.env.SEED_PRIVATE_KEY;
  if (!pk) throw new Error("Set SEED_PRIVATE_KEY (suiprivkey…) in env");
  if (!PACKAGE_ID || !REGISTRY_ID) throw new Error("Set NEXT_PUBLIC_PACKAGE_ID + NEXT_PUBLIC_PROOFPACK_REGISTRY_ID");

  const { secretKey } = decodeSuiPrivateKey(pk);
  const kp = Ed25519Keypair.fromSecretKey(secretKey);
  const addr = kp.getPublicKey().toSuiAddress();
  console.log("Seeder address:", addr);

  const headers: Record<string, string> = {};
  if (process.env.TATUM_API_KEY) headers["x-api-key"] = process.env.TATUM_API_KEY;
  const client = new SuiClient({
    transport: new SuiHTTPTransport({ url: TATUM_RPC, rpc: { headers } }),
  });

  const files: Array<{ filename: string; contentType: string; size: number; sha256: string; blobId: string }> = [];
  for (const f of fixtures) {
    const bytes = new TextEncoder().encode(f.body);
    const sha256 = await sha256Hex(bytes);
    const blobId = await walrusPut(bytes);
    console.log(`  → ${f.name}  sha=${sha256.slice(0, 10)}…  blob=${blobId.slice(0, 12)}…`);
    files.push({ filename: f.name, contentType: f.contentType, size: bytes.byteLength, sha256, blobId });
  }

  const manifest = {
    schemaVersion: 1 as const,
    title: "Startup Due Diligence Pack",
    description: "Demo evidence pack for ProofPack AI submission.",
    tags: ["demo", "hackathon", "tatum-walrus"],
    owner: addr,
    createdAtMs: Date.now(),
    files,
  };
  const manifestBytes = new TextEncoder().encode(canonicalJson(manifest));
  const manifestHash = await sha256Hex(manifestBytes);
  const manifestBlobId = await walrusPut(manifestBytes);
  console.log("Manifest:", { manifestHash, manifestBlobId });

  const tx = new Transaction();
  tx.setSender(addr);
  tx.setGasBudget(100_000_000); // explicit budget skips dryRun (one less RPC call)
  const hashArr = manifestHash.match(/.{2}/g)!.map((h) => parseInt(h, 16));
  tx.moveCall({
    target: `${PACKAGE_ID}::proofpack::create`,
    arguments: [
      tx.object(REGISTRY_ID),
      tx.pure.string(manifestBlobId),
      tx.pure.vector("u8", hashArr),
      tx.pure.u8(2),
      tx.object("0x6"),
    ],
  });

  const result = await withRetry(() =>
    client.signAndExecuteTransaction({
      signer: kp,
      transaction: tx,
      options: { showObjectChanges: true, showEffects: true },
    }),
  );
  const created = (result.objectChanges ?? []).find(
    (c) => c.type === "created" && typeof c.objectType === "string" && c.objectType.includes("::proofpack::ProofPack"),
  ) as { objectId?: string } | undefined;
  console.log("Tx digest:", result.digest);
  console.log("ProofPack objectId:", created?.objectId);
  if (created?.objectId) {
    console.log("Verifier URL: /verify/" + created.objectId);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
