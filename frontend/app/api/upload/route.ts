import { NextRequest, NextResponse } from "next/server";
import { sha256Hex } from "@/lib/hash/sha256";
import { walrusUpload } from "@/lib/walrus/upload";
import type { UploadResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const entries = form.getAll("files");
    if (entries.length === 0) {
      return NextResponse.json({ error: "no files" }, { status: 400 });
    }

    const results: UploadResult[] = [];
    for (const entry of entries) {
      if (!(entry instanceof File)) continue;
      const ab = await entry.arrayBuffer();
      const bytes = new Uint8Array(ab);
      const sha256 = await sha256Hex(bytes);
      const { blobId } = await walrusUpload(bytes, entry.name);
      results.push({
        filename: entry.name,
        contentType: entry.type || "application/octet-stream",
        size: bytes.byteLength,
        sha256,
        blobId,
      });
    }
    return NextResponse.json({ files: results });
  } catch (e) {
    return NextResponse.json(
      { error: "WALRUS_UPLOAD_FAILED", message: String(e) },
      { status: 500 },
    );
  }
}
