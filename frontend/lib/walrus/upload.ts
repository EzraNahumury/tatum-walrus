import { env } from "../env";
import { tatumStorageUpload } from "../tatum/storage";

/**
 * Upload bytes and return the Walrus blobId.
 *
 * Mode selection (env WALRUS_UPLOAD_MODE):
 *   - walrus_publisher  : direct PUT to a Walrus publisher (default)
 *   - tatum_storage_api : route through Tatum Storage API (returned id is IPFS-style)
 *
 * Both modes return an opaque string that the verifier knows how to fetch.
 */
export async function walrusUpload(
  bytes: Uint8Array,
  filename: string,
): Promise<{ blobId: string; mode: string }> {
  if (env.walrusUploadMode === "tatum_storage_api") {
    const { id } = await tatumStorageUpload(bytes, filename);
    return { blobId: id, mode: "tatum_storage_api" };
  }
  return walrusPublisherUpload(bytes);
}

async function walrusPublisherUpload(
  bytes: Uint8Array,
): Promise<{ blobId: string; mode: string }> {
  const url = `${env.walrusPublisherUrl.replace(/\/$/, "")}/v1/blobs?epochs=${env.walrusDefaultEpochs}`;
  const res = await fetch(url, {
    method: "PUT",
    body: new Uint8Array(bytes),
    headers: { "content-type": "application/octet-stream" },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Walrus publisher upload failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as {
    newlyCreated?: { blobObject: { blobId: string } };
    alreadyCertified?: { blobId: string };
  };
  const blobId =
    data.newlyCreated?.blobObject.blobId ?? data.alreadyCertified?.blobId;
  if (!blobId) throw new Error("Walrus publisher response missing blobId");
  return { blobId, mode: "walrus_publisher" };
}
