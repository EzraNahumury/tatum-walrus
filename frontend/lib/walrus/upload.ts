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
  tries = 3,
): Promise<{ blobId: string; mode: string }> {
  const url = `${env.walrusPublisherUrl.replace(/\/$/, "")}/v1/blobs?epochs=${env.walrusDefaultEpochs}`;
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 45_000);
      const res = await fetch(url, {
        method: "PUT",
        body: new Uint8Array(bytes),
        headers: { "content-type": "application/octet-stream" },
        signal: controller.signal,
      });
      clearTimeout(t);

      if (res.status >= 500 || res.status === 429) {
        lastErr = new Error(`Walrus publisher ${res.status}`);
      } else if (!res.ok) {
        // 4xx (non-429) = permanent, no retry
        const text = await res.text();
        throw new Error(`Walrus publisher upload failed: ${res.status} ${text}`);
      } else {
        const data = (await res.json()) as {
          newlyCreated?: { blobObject: { blobId: string } };
          alreadyCertified?: { blobId: string };
        };
        const blobId =
          data.newlyCreated?.blobObject.blobId ?? data.alreadyCertified?.blobId;
        if (!blobId) throw new Error("Walrus publisher response missing blobId");
        return { blobId, mode: "walrus_publisher" };
      }
    } catch (e) {
      lastErr = e;
    }
    if (i < tries - 1) {
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  throw lastErr ?? new Error("Walrus publisher upload failed");
}
