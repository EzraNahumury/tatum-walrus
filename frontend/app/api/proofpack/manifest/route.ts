import { NextRequest, NextResponse } from "next/server";
import { hashManifest } from "@/lib/manifest";
import { walrusUpload } from "@/lib/walrus/upload";
import type { ProofPackManifest } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const manifest = (await req.json()) as ProofPackManifest;
    if (!manifest || manifest.schemaVersion !== 1) {
      return NextResponse.json({ error: "invalid manifest" }, { status: 400 });
    }
    const { bytes, hash } = await hashManifest(manifest);
    const { blobId } = await walrusUpload(bytes, "manifest.json");
    return NextResponse.json({ manifestBlobId: blobId, manifestHash: hash });
  } catch (e) {
    return NextResponse.json(
      { error: "WALRUS_UPLOAD_FAILED", message: String(e) },
      { status: 500 },
    );
  }
}
