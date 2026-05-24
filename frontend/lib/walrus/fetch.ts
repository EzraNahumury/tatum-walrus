import { env } from "../env";

/**
 * Fetch raw bytes for a Walrus blobId.
 * Falls back to IPFS gateway if blobId is an IPFS CID (Tatum Storage API mode).
 */
export async function walrusFetch(blobId: string): Promise<Uint8Array> {
  const candidates: string[] = [];
  candidates.push(
    `${env.walrusAggregatorUrl.replace(/\/$/, "")}/v1/blobs/${blobId}`,
  );
  // CIDv0 (Qm…) / CIDv1 fallback for tatum_storage_api mode
  if (/^(Qm[1-9A-HJ-NP-Za-km-z]{44,}|baf[0-9a-z]+)$/i.test(blobId)) {
    candidates.push(`https://ipfs.io/ipfs/${blobId}`);
    candidates.push(`https://gateway.pinata.cloud/ipfs/${blobId}`);
  }

  let lastErr: unknown;
  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        lastErr = new Error(`${res.status} from ${url}`);
        continue;
      }
      const ab = await res.arrayBuffer();
      return new Uint8Array(ab);
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(`Walrus fetch failed for blob ${blobId}: ${String(lastErr)}`);
}

export async function walrusFetchText(blobId: string): Promise<string> {
  const bytes = await walrusFetch(blobId);
  return new TextDecoder().decode(bytes);
}
