import { tatumFetch } from "./client";

/**
 * Upload bytes via Tatum Storage API.
 * Tatum returns an IPFS-style hash; we treat that string as the canonical
 * storage identifier for the manifest. For Walrus-native blobIds, use the
 * walrus_publisher mode in lib/walrus/upload.ts.
 */
export async function tatumStorageUpload(
  bytes: Uint8Array,
  filename: string,
): Promise<{ id: string }> {
  const form = new FormData();
  const blob = new Blob([new Uint8Array(bytes)]);
  form.append("file", blob, filename);

  const res = await tatumFetch("/v3/ipfs", { method: "POST", body: form });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Tatum storage upload failed: ${res.status} ${body}`);
  }
  const data = (await res.json()) as { ipfsHash?: string };
  if (!data.ipfsHash) throw new Error("Tatum storage upload: missing ipfsHash");
  return { id: data.ipfsHash };
}
