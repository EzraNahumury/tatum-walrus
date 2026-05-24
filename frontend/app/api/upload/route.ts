import { NextRequest, NextResponse } from "next/server";
import { sha256Hex } from "@/lib/hash/sha256";
import { walrusUpload } from "@/lib/walrus/upload";
import type { UploadResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const entries = form.getAll("files").filter((e): e is File => e instanceof File);
    if (entries.length === 0) {
      return NextResponse.json({ error: "no files" }, { status: 400 });
    }

    // Parallelize: hash + Walrus upload per file run together. Total wall time
    // ~= slowest single upload instead of sum of all.
    const results: UploadResult[] = await Promise.all(
      entries.map(async (entry) => {
        const ab = await entry.arrayBuffer();
        const bytes = new Uint8Array(ab);
        const sha256 = await sha256Hex(bytes);
        const { blobId } = await walrusUpload(bytes, entry.name);
        return {
          filename: entry.name,
          contentType: entry.type || "application/octet-stream",
          size: bytes.byteLength,
          sha256,
          blobId,
        };
      }),
    );

    return NextResponse.json({ files: results });
  } catch (e) {
    return NextResponse.json(
      { error: "WALRUS_UPLOAD_FAILED", message: String(e) },
      { status: 500 },
    );
  }
}
